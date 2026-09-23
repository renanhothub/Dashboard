import { useEffect, useMemo, useRef, useState } from "react";
import { Body, Props } from "./Figure";
import { fitViewBox } from "./bounds";
import { easeCycle, FLOOR, interpolate, normalize, solve, type Frame } from "./kinematics";
import type { Anim } from "./types";

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

interface Props {
  anim: Anim;
  /** "pair" = dois quadros (início e fim) lado a lado; "anim" = um quadro animado. */
  mode?: "pair" | "anim";
  className?: string;
  title?: string;
}

function Scene({ anim, frame, vb }: { anim: Anim; frame: Frame; vb: number[] }) {
  return (
    <g>
      {!anim.noFloor && <ellipse cx={vb[0] + vb[2] / 2} cy={FLOOR + 1} rx={vb[2] * 0.38} ry={3.2} fill="#000" opacity={0.07} />}
      {anim.props && <Props props={anim.props} />}
      <Body f={frame} gear={anim.gear} hl={anim.hl} />
    </g>
  );
}

export default function ExerciseAnimation({ anim, mode = "pair", className, title }: Props) {
  const view = anim.view ?? "side";
  const a = useMemo(() => normalize(anim.a), [anim]);
  const b = useMemo(() => normalize(anim.b), [anim]);
  const fa = useMemo(() => solve(a, view), [a, view]);
  const fb = useMemo(() => solve(b, view), [b, view]);
  const vb = useMemo(() => fitViewBox(anim, [fa, fb, solve(interpolate(a, b, 0.5), view)]), [anim, a, b, fa, fb, view]);
  const [t, setT] = useState(0);
  const raf = useRef<number>();

  useEffect(() => {
    if (mode !== "anim" || reducedMotion()) {
      setT(1);
      return;
    }
    const period = anim.period ?? 2800;
    const start = performance.now();
    const tick = (now: number) => {
      setT(easeCycle((now - start) / period));
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [mode, anim.period]);

  if (mode === "pair") {
    const gap = vb[2] * 0.04;
    const box = [vb[0], vb[1], vb[2] * 2 + gap, vb[3]];
    return (
      <svg viewBox={box.join(" ")} className={className} role="img" aria-label={title}>
        {title && <title>{title}</title>}
        <Scene anim={anim} frame={fa} vb={vb} />
        <g transform={`translate(${vb[2] + gap} 0)`}>
          <Scene anim={anim} frame={fb} vb={vb} />
        </g>
      </svg>
    );
  }

  const frame = solve(interpolate(a, b, t), view);
  return (
    <svg viewBox={vb.join(" ")} className={className} role="img" aria-label={title}>
      {title && <title>{title}</title>}
      <Scene anim={anim} frame={frame} vb={vb} />
    </svg>
  );
}
