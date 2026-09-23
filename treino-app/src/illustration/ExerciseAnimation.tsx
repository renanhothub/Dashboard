import { useEffect, useMemo, useRef, useState } from "react";
import { Body, C, Props } from "./Figure";
import { fitViewBox } from "./bounds";
import { easeCycle, FLOOR, interpolate, normalize, solve } from "./kinematics";
import type { Anim } from "./types";

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

interface Props {
  anim: Anim;
  /** Anima o movimento; se falso, mostra a posição final com a inicial "fantasma". */
  playing?: boolean;
  /** Posição fixa (0 = início, 1 = fim) quando não está animando. */
  still?: number;
  ghost?: boolean;
  className?: string;
  title?: string;
}

export default function ExerciseAnimation({ anim, playing = false, still = 1, ghost = true, className, title }: Props) {
  const view = anim.view ?? "side";
  const a = useMemo(() => normalize(anim.a), [anim]);
  const b = useMemo(() => normalize(anim.b), [anim]);
  const [t, setT] = useState(still);
  const raf = useRef<number>();

  useEffect(() => {
    if (!playing || reducedMotion()) {
      setT(still);
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
  }, [playing, still, anim.period]);

  const frame = solve(interpolate(a, b, t), view);
  const start = useMemo(() => solve(a, view), [a, view]);
  const vb = useMemo(() => fitViewBox(anim, [start, solve(b, view), solve(interpolate(a, b, 0.5), view)]), [anim, a, b, start, view]);

  return (
    <svg viewBox={vb.join(" ")} className={className} role="img" aria-label={title}>
      {title && <title>{title}</title>}
      {!anim.noFloor && <line x1={vb[0] + 6} y1={FLOOR + 1} x2={vb[0] + vb[2] - 6} y2={FLOOR + 1} stroke={C.floor} strokeWidth={2} strokeLinecap="round" />}
      {anim.props && <Props props={anim.props} />}
      {ghost && <Body f={start} ghost />}
      <Body f={frame} gear={anim.gear} hl={anim.hl} />
    </svg>
  );
}
