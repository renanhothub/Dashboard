import type { ReactNode } from "react";
import { add, dir, FLOOR, front, lerpV, mul, type Frame, type Limb } from "./kinematics";
import type { Gear, Hl, Prop, Vec } from "./types";

export const C = {
  near: "#dfe3ea",
  torso: "#cfd4dd",
  far: "#7d8594",
  hl: "#ff6b4a",
  metal: "#a7afbd",
  plate: "#2b3039",
  plateRim: "#e8c35a",
  pad: "#394150",
  padEdge: "#4a5364",
  frame: "#586174",
  cable: "#8e96a5",
  floor: "#2a2f39",
};

const W = { torso: 15, ua: 8.5, fa: 7, thigh: 11.5, shin: 8.5, foot: 5, hand: 5.5 };
/** Deslocamento dos membros do lado distante (dá sensação de profundidade na vista lateral). */
const DEPTH: Vec = [-3, -2];

const P = (v: Vec) => `${v[0].toFixed(2)},${v[1].toFixed(2)}`;

function Seg({ a, b, w, c, o }: { a: Vec; b: Vec; w: number; c: string; o?: number }) {
  return <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={c} strokeWidth={w} strokeLinecap="round" opacity={o} />;
}

function shift(l: Limb, o: Vec): Limb {
  return { ...l, root: add(l.root, o), mid: add(l.mid, o), end: add(l.end, o), tip: add(l.tip, o), grip: add(l.grip, o) };
}

/** Faixa deslocada para um dos lados de um segmento (ex.: bíceps na frente do braço). */
function stripe(a: Vec, b: Vec, off: number, w: number, t0 = 0.15, t1 = 0.85) {
  const d: Vec = [b[0] - a[0], b[1] - a[1]];
  const len = Math.hypot(d[0], d[1]) || 1;
  const u: Vec = [d[0] / len, d[1] / len];
  const f = front(u);
  const p = add(lerpV(a, b, t0), mul(f, off));
  const q = add(lerpV(a, b, t1), mul(f, off));
  return <Seg a={p} b={q} w={w} c={C.hl} />;
}

function ArmShape({ l, c, far }: { l: Limb; c: string; far?: boolean }) {
  return (
    <g>
      <Seg a={l.root} b={l.mid} w={W.ua * (far ? 0.92 : 1)} c={c} />
      <Seg a={l.mid} b={l.end} w={W.fa * (far ? 0.92 : 1)} c={c} />
      <Seg a={l.end} b={l.tip} w={W.hand} c={c} />
    </g>
  );
}

function LegShape({ l, c, far, front: isFront }: { l: Limb; c: string; far?: boolean; front?: boolean }) {
  return (
    <g>
      <Seg a={l.root} b={l.mid} w={W.thigh * (far ? 0.92 : 1)} c={c} />
      <Seg a={l.mid} b={l.end} w={W.shin * (far ? 0.92 : 1)} c={c} />
      <Seg a={l.end} b={l.tip} w={isFront ? 6 : W.foot} c={c} />
    </g>
  );
}

// ---------- Destaques musculares ----------

function armHl(l: Limb, hl: Set<Hl>, isFront: boolean) {
  const out: ReactNode[] = [];
  if (hl.has("biceps")) out.push(isFront ? <Seg key="b" a={l.root} b={l.mid} w={5} c={C.hl} /> : <g key="b">{stripe(l.root, l.mid, 2.2, 4.5)}</g>);
  if (hl.has("triceps")) out.push(isFront ? <Seg key="t" a={l.root} b={l.mid} w={5} c={C.hl} /> : <g key="t">{stripe(l.root, l.mid, -2.2, 4.5)}</g>);
  if (hl.has("forearm")) out.push(<Seg key="f" a={lerpV(l.mid, l.end, 0.12)} b={lerpV(l.mid, l.end, 0.8)} w={4.5} c={C.hl} />);
  return out;
}

function legHl(l: Limb, hl: Set<Hl>, isFront: boolean) {
  const out: ReactNode[] = [];
  if (hl.has("quads")) out.push(isFront ? <Seg key="q" a={lerpV(l.root, l.mid, 0.15)} b={lerpV(l.root, l.mid, 0.85)} w={7} c={C.hl} /> : <g key="q">{stripe(l.root, l.mid, 2.8, 5.5)}</g>);
  if (hl.has("hams")) out.push(isFront ? <Seg key="h" a={lerpV(l.root, l.mid, 0.15)} b={lerpV(l.root, l.mid, 0.85)} w={7} c={C.hl} /> : <g key="h">{stripe(l.root, l.mid, -2.8, 5.5)}</g>);
  if (hl.has("adductors")) out.push(<g key="a">{stripe(l.root, l.mid, isFront ? 0 : 0, 5, 0.1, 0.7)}</g>);
  if (hl.has("calves")) out.push(isFront ? <Seg key="c" a={lerpV(l.mid, l.end, 0.15)} b={lerpV(l.mid, l.end, 0.6)} w={6} c={C.hl} /> : <g key="c">{stripe(l.mid, l.end, -2.2, 5, 0.1, 0.6)}</g>);
  return out;
}

function torsoHlSide(f: Frame, hl: Set<Hl>) {
  const out: ReactNode[] = [];
  const at = (t: number, off: number): Vec => add(lerpV(f.pelvis, f.neck, t), mul(f.n, off));
  const band = (k: string, t0: number, t1: number, off: number, w = 6) =>
    out.push(<Seg key={k} a={at(t0, off)} b={at(t1, off)} w={w} c={C.hl} />);
  if (hl.has("chestU")) band("cu", 0.8, 0.95, 4.8);
  if (hl.has("chestM")) band("cm", 0.64, 0.82, 5);
  if (hl.has("chestL")) band("cl", 0.52, 0.68, 4.8);
  if (hl.has("abs") || hl.has("core")) band("ab", 0.2, 0.52, 4.5);
  if (hl.has("absL")) band("al", 0.08, 0.3, 4.5);
  if (hl.has("obliques") || hl.has("core")) band("ob", 0.18, 0.5, 0, 7);
  if (hl.has("lats")) band("la", 0.42, 0.82, -3, 8);
  if (hl.has("midBack")) band("mb", 0.62, 0.9, -4.8);
  if (hl.has("traps")) band("tr", 0.9, 1.08, -3.8, 6);
  if (hl.has("lowBack")) band("lb", 0.06, 0.38, -4.8);
  const sh = f.arm.root;
  if (hl.has("deltF")) out.push(<circle key="df" cx={sh[0] + f.n[0] * 2.5} cy={sh[1] + f.n[1] * 2.5} r={5.2} fill={C.hl} />);
  if (hl.has("deltS")) out.push(<circle key="ds" cx={sh[0]} cy={sh[1]} r={5.5} fill={C.hl} />);
  if (hl.has("deltR")) out.push(<circle key="dr" cx={sh[0] - f.n[0] * 2.5} cy={sh[1] - f.n[1] * 2.5} r={5.2} fill={C.hl} />);
  if (hl.has("glutes")) {
    const g = add(add(f.pelvis, mul(f.n, -4)), mul(f.d, -1));
    out.push(<circle key="gl" cx={g[0]} cy={g[1]} r={7} fill={C.hl} />);
  }
  if (hl.has("gluteMed")) {
    const g = add(add(f.pelvis, mul(f.n, -2.5)), mul(f.d, 5));
    out.push(<circle key="gm" cx={g[0]} cy={g[1]} r={5} fill={C.hl} />);
  }
  return out;
}

function torsoHlFront(f: Frame, hl: Set<Hl>) {
  const out: ReactNode[] = [];
  // Largura do tronco varia do quadril (10) ao ombro (15)
  const at = (t: number, s: number): Vec => add(lerpV(f.pelvis, f.neck, t), mul(f.n, s * (10 + 5 * t)));
  const across = (k: string, t: number, w = 5) => out.push(<Seg key={k} a={at(t, -0.62)} b={at(t, 0.62)} w={w} c={C.hl} />);
  const vert = (k: string, t0: number, t1: number, s: number, w = 5) => out.push(<Seg key={k} a={at(t0, s)} b={at(t1, s)} w={w} c={C.hl} />);
  if (hl.has("chestU")) across("cu", 0.86, 4.5);
  if (hl.has("chestM")) across("cm", 0.74);
  if (hl.has("chestL")) across("cl", 0.62, 4.5);
  if (hl.has("abs") || hl.has("core")) vert("ab", 0.22, 0.52, 0, 7);
  if (hl.has("absL")) vert("al", 0.06, 0.28, 0, 7);
  if (hl.has("obliques") || hl.has("core")) {
    vert("o1", 0.15, 0.5, 0.7, 4.5);
    vert("o2", 0.15, 0.5, -0.7, 4.5);
  }
  if (hl.has("lats")) {
    vert("l1", 0.45, 0.85, 0.78, 5);
    vert("l2", 0.45, 0.85, -0.78, 5);
  }
  if (hl.has("midBack")) vert("mb", 0.6, 0.9, 0, 8);
  if (hl.has("lowBack")) vert("lb", 0.05, 0.35, 0, 7);
  if (hl.has("traps")) {
    out.push(<Seg key="t1" a={add(f.neck, mul(f.d, 3))} b={lerpV(f.neck, f.arm.root, 0.8)} w={5} c={C.hl} />);
    out.push(<Seg key="t2" a={add(f.neck, mul(f.d, 3))} b={lerpV(f.neck, f.arm2.root, 0.8)} w={5} c={C.hl} />);
  }
  if (hl.has("glutes")) {
    for (const h of [f.hipN, f.hipF]) out.push(<circle key={"g" + h[0]} cx={h[0]} cy={h[1] + 1} r={6} fill={C.hl} />);
  }
  if (hl.has("gluteMed")) {
    const o1 = add(add(f.pelvis, mul(f.n, 10)), mul(f.d, 4));
    const o2 = add(add(f.pelvis, mul(f.n, -10)), mul(f.d, 4));
    out.push(<circle key="gm1" cx={o1[0]} cy={o1[1]} r={4.5} fill={C.hl} />);
    out.push(<circle key="gm2" cx={o2[0]} cy={o2[1]} r={4.5} fill={C.hl} />);
  }
  return out;
}

/** Deltoides na vista frontal (desenhados por cima dos braços). */
function deltHlFront(f: Frame, hl: Set<Hl>) {
  const out: ReactNode[] = [];
  for (const [k, r] of [["deltF", 5], ["deltS", 5.4], ["deltR", 5]] as const) {
    if (hl.has(k)) {
      out.push(<circle key={k + 1} cx={f.arm.root[0]} cy={f.arm.root[1]} r={r} fill={C.hl} />);
      out.push(<circle key={k + 2} cx={f.arm2.root[0]} cy={f.arm2.root[1]} r={r} fill={C.hl} />);
    }
  }
  return out;
}

// ---------- Equipamentos ----------

function Plate({ c, r }: { c: Vec; r: number }) {
  return (
    <g>
      <circle cx={c[0]} cy={c[1]} r={r} fill={C.plate} stroke={C.plateRim} strokeWidth={2} />
      <circle cx={c[0]} cy={c[1]} r={r * 0.28} fill={C.metal} />
    </g>
  );
}

function DumbbellSide({ c }: { c: Vec }) {
  return (
    <g>
      <circle cx={c[0]} cy={c[1]} r={6} fill={C.plate} stroke={C.plateRim} strokeWidth={1.6} />
      <circle cx={c[0]} cy={c[1]} r={1.8} fill={C.metal} />
    </g>
  );
}

function DumbbellFront({ c, a }: { c: Vec; a: number }) {
  // Halter visto de frente: haste perpendicular ao antebraço
  const u = dir(a + 90);
  const p = add(c, mul(u, 8));
  const q = add(c, mul(u, -8));
  return (
    <g>
      <Seg a={p} b={q} w={2.5} c={C.metal} />
      <Seg a={add(c, mul(u, 6))} b={add(c, mul(u, 10))} w={8} c={C.plate} />
      <Seg a={add(c, mul(u, -6))} b={add(c, mul(u, -10))} w={8} c={C.plate} />
    </g>
  );
}

function gearNodes(f: Frame, gear: Gear[], layer: "far" | "near"): ReactNode[] {
  const out: ReactNode[] = [];
  const side = f.view === "side";
  const cx = f.pelvis[0];
  const mirror = (v: Vec): Vec => [2 * cx - v[0], v[1]];
  const far2 = side ? shift(f.arm2, DEPTH) : f.arm2;
  const farLeg = side ? shift(f.leg2, DEPTH) : f.leg2;

  gear.forEach((g, i) => {
    const k = `${g.t}${i}${layer}`;
    switch (g.t) {
      case "barbell": {
        const r = g.small ? 8 : 13;
        let c: Vec;
        if (g.at === "back") c = add(add(f.neck, mul(f.n, -7)), mul(f.d, -1));
        else if (g.at === "front") c = add(add(f.neck, mul(f.n, 8)), mul(f.d, -2));
        else if (g.at === "hip") c = add(add(f.pelvis, mul(f.n, 10)), mul(f.d, 3));
        else c = f.arm.grip;
        if (side) {
          if (layer === "near") out.push(<Plate key={k} c={c} r={r} />);
        } else if (layer === "near") {
          let a: Vec, b: Vec;
          if (!g.at || g.at === "hand") {
            a = f.arm.grip;
            b = f.arm2.grip;
          } else {
            a = add(c, mul(f.n, 16));
            b = add(c, mul(f.n, -16));
          }
          const dx = b[0] - a[0], dy = b[1] - a[1];
          const len = Math.hypot(dx, dy) || 1;
          const u: Vec = [dx / len, dy / len];
          const ext = g.small ? 14 : 34;
          const e1 = add(a, mul(u, -ext));
          const e2 = add(b, mul(u, ext));
          const pl = (e: Vec, s: number) => (
            <Seg a={add(e, mul(u, s * 1))} b={add(e, mul(u, s * -7))} w={g.small ? 12 : 24} c={C.plate} />
          );
          out.push(
            <g key={k}>
              <Seg a={e1} b={e2} w={2.6} c={C.metal} />
              {pl(e1, 1)}
              {pl(e2, -1)}
            </g>,
          );
        }
        break;
      }
      case "dumbbell": {
        if (side && g.grip === "neutral") {
          // Pegada neutra (martelo): halter aparece de perfil, alinhado ao antebraço
          if (layer === "far" && !g.one) out.push(<DumbbellFront key={k} c={far2.grip} a={far2.a2} />);
          if (layer === "near") out.push(<DumbbellFront key={k} c={f.arm.grip} a={f.arm.a2} />);
        } else if (side) {
          if (layer === "far" && !g.one) out.push(<DumbbellSide key={k} c={far2.grip} />);
          if (layer === "near") out.push(<DumbbellSide key={k} c={f.arm.grip} />);
        } else if (layer === "near") {
          out.push(<DumbbellFront key={k + "r"} c={f.arm.grip} a={f.arm.a1} />);
          if (!g.one) out.push(<DumbbellFront key={k + "l"} c={f.arm2.grip} a={-f.arm2.a1} />);
        }
        break;
      }
      case "kettlebell": {
        if (layer !== "near") break;
        const c = add(f.arm.grip, [0, 7]);
        out.push(
          <g key={k}>
            <circle cx={c[0]} cy={c[1] + 2} r={7.5} fill={C.plate} stroke={C.plateRim} strokeWidth={1.6} />
          </g>,
        );
        break;
      }
      case "plate": {
        if (layer !== "near") break;
        const c = g.at === "chest" ? add(add(f.neck, mul(f.n, 9)), mul(f.d, -8)) : f.arm.grip;
        out.push(<Plate key={k} c={c} r={11} />);
        break;
      }
      case "cable": {
        const from = g.from;
        const line = (p: Vec, q: Vec, kk: string) => <Seg key={kk} a={p} b={q} w={1.4} c={C.cable} />;
        if (g.to === "ankle") {
          if (layer === "near") {
            out.push(line(from, f.leg.end, k + "a"));
            out.push(<circle key={k + "s"} cx={f.leg.end[0]} cy={f.leg.end[1]} r={3.5} fill={C.plateRim} />);
          }
          break;
        }
        if (side) {
          if (layer === "far" && !g.one) out.push(line(add(from, DEPTH), far2.grip, k + "f"));
          if (layer === "near") {
            out.push(line(from, f.arm.grip, k + "n"));
            if (g.handle === "bar")
              out.push(<Seg key={k + "h"} a={add(f.arm.grip, [0, 0])} b={add(far2.grip, [0, 0])} w={3} c={C.metal} />);
            else if (g.handle === "rope")
              out.push(<circle key={k + "h"} cx={f.arm.grip[0]} cy={f.arm.grip[1]} r={3} fill={C.plateRim} />);
            else out.push(<circle key={k + "h"} cx={f.arm.grip[0]} cy={f.arm.grip[1]} r={2.8} fill={C.metal} />);
          }
        } else if (layer === "near") {
          out.push(line(from, f.arm.grip, k + "r"));
          if (!g.one) {
            if (g.handle === "bar" || g.handle === "rope") {
              // Um único cabo central preso na barra/corda
              const mid = lerpV(f.arm.grip, f.arm2.grip, 0.5);
              out.pop();
              out.push(line([cx, from[1]], mid, k + "c"));
              out.push(
                <Seg key={k + "bar"} a={g.handle === "bar" ? add(f.arm.grip, [5, 0]) : f.arm.grip} b={g.handle === "bar" ? add(f.arm2.grip, [-5, 0]) : f.arm2.grip} w={g.handle === "bar" ? 3 : 2} c={g.handle === "bar" ? C.metal : C.plateRim} />,
              );
            } else out.push(line(mirror(from), f.arm2.grip, k + "l"));
          }
        }
        break;
      }
      case "lever": {
        const lv = (p: Vec, q: Vec, kk: string) => (
          <g key={kk}>
            <Seg a={p} b={q} w={4.5} c={C.frame} />
            <circle cx={p[0]} cy={p[1]} r={3.5} fill={C.metal} />
            <circle cx={q[0]} cy={q[1]} r={3} fill={C.metal} />
          </g>
        );
        if (side) {
          if (layer === "far" && !g.one) out.push(lv(add(g.pivot, DEPTH), far2.grip, k + "f"));
          if (layer === "near") out.push(lv(g.pivot, f.arm.grip, k + "n"));
        } else if (layer === "near") {
          out.push(lv(g.pivot, f.arm.grip, k + "r"));
          if (!g.one) out.push(lv(mirror(g.pivot), f.arm2.grip, k + "l"));
        }
        break;
      }
      case "legPad": {
        const pad = (l: Limb, kk: string, pivot?: Vec, mirrored = false) => {
          const seg: [Vec, Vec] = g.at === "thigh" ? [l.root, l.mid] : [l.mid, l.end];
          const u0: Vec = [seg[1][0] - seg[0][0], seg[1][1] - seg[0][1]];
          const len = Math.hypot(u0[0], u0[1]) || 1;
          const fr = front([u0[0] / len, u0[1] / len]);
          const t = g.at === "knee" ? 0.1 : g.at === "thigh" ? 0.75 : 0.85;
          const base = lerpV(seg[0], seg[1], t);
          const s = (g.side === "b" ? -1 : 1) * (mirrored ? -1 : 1);
          const c = add(base, mul(fr, 8 * s));
          return (
            <g key={kk}>
              {pivot && <Seg a={pivot} b={c} w={4} c={C.frame} />}
              {pivot && <circle cx={pivot[0]} cy={pivot[1]} r={3.5} fill={C.metal} />}
              <circle cx={c[0]} cy={c[1]} r={5} fill={C.pad} stroke={C.padEdge} strokeWidth={1.5} />
            </g>
          );
        };
        if (side) {
          if (layer === "near") out.push(pad(f.leg, k, g.pivot));
        } else if (layer === "near") {
          out.push(pad(f.leg, k + "r", g.pivot));
          if (!g.one) out.push(pad(f.leg2, k + "l", g.pivot ? mirror(g.pivot) : undefined, true));
        }
        break;
      }
      case "footPlate": {
        if (layer !== "near") break;
        const c = lerpV(f.leg.end, f.leg.tip, 0.4);
        const u = dir(g.angle);
        const w = (g.w ?? 34) / 2;
        const back = add(c, mul(front(u), -3.5));
        out.push(
          <g key={k}>
            {g.rail && <Seg a={back} b={add(back, mul(g.rail, 1))} w={3} c={C.frame} />}
            <Seg a={add(back, mul(u, -w))} b={add(back, mul(u, w))} w={5} c={C.frame} />
          </g>,
        );
        break;
      }
      case "band": {
        if (layer !== "near") break;
        const a = g.at === "ankle" ? f.leg.end : lerpV(f.leg.root, f.leg.mid, 0.85);
        const b = g.at === "ankle" ? farLeg.end : lerpV(farLeg.root, farLeg.mid, 0.85);
        out.push(<Seg key={k} a={a} b={b} w={3} c={C.plateRim} o={0.9} />);
        break;
      }
      case "wheel": {
        if (layer !== "near") break;
        out.push(
          <g key={k}>
            <circle cx={f.arm.grip[0]} cy={f.arm.grip[1] + 3} r={8} fill={C.plate} stroke={C.plateRim} strokeWidth={2} />
          </g>,
        );
        break;
      }
    }
  });
  return out;
}

// ---------- Cenário ----------

export function Props({ props }: { props: Prop[] }) {
  return (
    <g>
      {props.map((p, i) => {
        switch (p.t) {
          case "bench": {
            const h = p.h ?? 7;
            return (
              <g key={i}>
                {p.post !== false && (
                  <>
                    <Seg a={[p.x, p.y]} b={[p.x, FLOOR - 2]} w={4} c={C.frame} />
                    <Seg a={[p.x - 12, FLOOR - 1.5]} b={[p.x + 12, FLOOR - 1.5]} w={3} c={C.frame} />
                  </>
                )}
                <rect
                  x={p.x - p.w / 2}
                  y={p.y - h / 2}
                  width={p.w}
                  height={h}
                  rx={3}
                  fill={C.pad}
                  stroke={C.padEdge}
                  strokeWidth={1.2}
                  transform={`rotate(${p.a ?? 0} ${p.x} ${p.y})`}
                />
              </g>
            );
          }
          case "box":
            return <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} rx={p.r ?? 2} fill={C.pad} stroke={C.padEdge} strokeWidth={1.2} />;
          case "line":
            return <Seg key={i} a={p.p} b={p.q} w={p.w ?? 4} c={C.frame} />;
          case "pulley":
            return (
              <g key={i}>
                <Seg a={[p.x, Math.min(p.y - 8, 20)]} b={[p.x, FLOOR]} w={5} c={C.frame} />
                <circle cx={p.x} cy={p.y} r={4.5} fill={C.plate} stroke={C.metal} strokeWidth={1.5} />
              </g>
            );
          case "bar":
            return p.w ? (
              <Seg key={i} a={[p.x - p.w / 2, p.y]} b={[p.x + p.w / 2, p.y]} w={3.5} c={C.metal} />
            ) : (
              <g key={i}>
                <Seg a={[p.x + 16, p.y - 4]} b={[p.x + 16, FLOOR]} w={4} c={C.frame} />
                <Seg a={[p.x, p.y]} b={[p.x + 16, p.y - 4]} w={3} c={C.frame} />
                <circle cx={p.x} cy={p.y} r={3} fill={C.metal} />
              </g>
            );
          case "roller":
            return <circle key={i} cx={p.x} cy={p.y} r={p.r ?? 5} fill={C.pad} stroke={C.padEdge} strokeWidth={1.5} />;
          case "step":
            return <rect key={i} x={p.x} y={FLOOR - p.h} width={p.w} height={p.h} rx={2} fill={C.pad} stroke={C.padEdge} strokeWidth={1.2} />;
        }
      })}
    </g>
  );
}

// ---------- Boneco ----------

export function Body({ f, gear = [], hl = [], ghost }: { f: Frame; gear?: Gear[]; hl?: Hl[]; ghost?: boolean }) {
  const hs = new Set(hl);
  const side = f.view === "side";
  const cNear = ghost ? "#ffffff" : C.near;
  const cFar = ghost ? "#ffffff" : C.far;
  const cTorso = ghost ? "#ffffff" : C.torso;
  const arm2 = side ? shift(f.arm2, DEPTH) : f.arm2;
  const leg2 = side ? shift(f.leg2, DEPTH) : f.leg2;
  const show = (nodes: ReactNode[]) => (ghost ? null : nodes);

  let torso: ReactNode;
  if (side) {
    torso = (
      <g>
        <Seg a={f.pelvis} b={f.neck} w={W.torso} c={cTorso} />
        <circle cx={f.pelvis[0]} cy={f.pelvis[1]} r={8.5} fill={cTorso} />
      </g>
    );
  } else {
    const s1 = add(f.neck, mul(f.n, 15));
    const s2 = add(f.neck, mul(f.n, -15));
    const h1 = add(f.pelvis, mul(f.n, 10));
    const h2 = add(f.pelvis, mul(f.n, -10));
    torso = <polygon points={[s1, s2, h2, h1].map(P).join(" ")} fill={cTorso} stroke={cTorso} strokeWidth={5} strokeLinejoin="round" />;
  }
  const neckTop = add(f.neck, mul(f.d, 5));
  const showLegs = f.view !== "end";

  return (
    <g opacity={ghost ? 0.13 : 1}>
      {show(gearNodes(f, gear, "far"))}
      {showLegs && <LegShape l={leg2} c={side ? cFar : cNear} far={side} front={!side} />}
      {side && <ArmShape l={arm2} c={cFar} far />}
      {side && show(armHl(arm2, hs, false).map((n, i) => <g key={i} opacity={0.55}>{n}</g>))}
      {side && showLegs && show(legHl(leg2, hs, false).map((n, i) => <g key={i} opacity={0.55}>{n}</g>))}
      <Seg a={f.neck} b={neckTop} w={6} c={cTorso} />
      {torso}
      <circle cx={f.head[0]} cy={f.head[1]} r={8} fill={cNear} />
      {show(side ? torsoHlSide(f, hs) : torsoHlFront(f, hs))}
      {showLegs && <LegShape l={f.leg} c={cNear} front={!side} />}
      {!side && <ArmShape l={arm2} c={cNear} />}
      {showLegs && show(legHl(f.leg, hs, !side))}
      {!side && showLegs && show(legHl(leg2, hs, true))}
      {!side && show(armHl(arm2, hs, true))}
      <ArmShape l={f.arm} c={cNear} />
      {show(armHl(f.arm, hs, !side))}
      {!side && show(deltHlFront(f, hs))}
      {show(gearNodes(f, gear, "near"))}
    </g>
  );
}
