import type { ReactNode } from "react";
import { add, dir, FLOOR, front, lerpV, mul, type Frame, type Limb } from "./kinematics";
import type { Gear, Hl, Prop, Vec } from "./types";

/**
 * Estilo "atlas anatômico": boneco claro com volume (luz e sombra), contorno fino,
 * músculo-alvo em vermelho, pesos pretos e aparelhos claros.
 */
export const C = {
  skin: "#e3e5e8",
  skinFar: "#c5c9cf",
  light: "#fafbfc",
  shade: "#b3b8c0",
  outline: "#6b717a",
  line: "#a9aeb6",
  mus: "url(#tp-mus)",
  musEdge: "#9e2c19",
  metal: "#8c929a",
  plate: "#1c1e22",
  plateRim: "#44474e",
  pad: "#2a2c31",
  padEdge: "#141518",
  frame: "#eef0f2",
  frameEdge: "#9ea4ac",
  cable: "#4a4f57",
  accent: "#d4a72c",
};

/** Gradientes compartilhados — renderize uma vez na página. */
export function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
      <defs>
        <radialGradient id="tp-mus" cx="45%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#ff8a6a" />
          <stop offset="55%" stopColor="#e2482c" />
          <stop offset="100%" stopColor="#b3321c" />
        </radialGradient>
        <radialGradient id="tp-plate" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#3a3d44" />
          <stop offset="100%" stopColor="#141518" />
        </radialGradient>
      </defs>
    </svg>
  );
}

const DEPTH: Vec = [-3, -2];
const LIGHT: Vec = [-0.45, -0.89];

const P = (v: Vec) => `${v[0].toFixed(2)} ${v[1].toFixed(2)}`;
const unit = (a: Vec, b: Vec): Vec => {
  const d: Vec = [b[0] - a[0], b[1] - a[1]];
  const l = Math.hypot(d[0], d[1]) || 1;
  return [d[0] / l, d[1] / l];
};

function Seg({ a, b, w, c, o }: { a: Vec; b: Vec; w: number; c: string; o?: number }) {
  return <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={c} strokeWidth={w} strokeLinecap="round" opacity={o} />;
}

/** Peça de aparelho (tubo claro com contorno). */
function FrameSeg({ a, b, w }: { a: Vec; b: Vec; w: number }) {
  return (
    <g>
      <Seg a={a} b={b} w={w + 1.6} c={C.frameEdge} />
      <Seg a={a} b={b} w={w} c={C.frame} />
    </g>
  );
}

function shift(l: Limb, o: Vec): Limb {
  return { ...l, root: add(l.root, o), mid: add(l.mid, o), end: add(l.end, o), tip: add(l.tip, o), grip: add(l.grip, o) };
}

// ---------- Formas do corpo ----------

const circle = (c: Vec, r: number) =>
  `M ${c[0] - r} ${c[1]} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z`;

/** Segmento afunilado (largura w1 → w2) com pontas arredondadas, como subcaminhos. */
function taper(a: Vec, b: Vec, w1: number, w2: number, off = 0): string[] {
  const u = unit(a, b);
  const n: Vec = [-u[1], u[0]];
  const a2 = add(a, mul(n, off));
  const b2 = add(b, mul(n, off));
  const quad = [add(a2, mul(n, w1 / 2)), add(b2, mul(n, w2 / 2)), add(b2, mul(n, -w2 / 2)), add(a2, mul(n, -w1 / 2))];
  return [`M ${quad.map(P).join(" L ")} Z`, circle(a2, w1 / 2), circle(b2, w2 / 2)];
}

/** Ventre muscular em forma de lente ao longo de um segmento. */
function belly(a: Vec, b: Vec, w: number, off = 0): string {
  const u = unit(a, b);
  const n: Vec = [-u[1], u[0]];
  const pts: Vec[] = [];
  const N = 14;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const h = (w / 2) * Math.pow(Math.sin(Math.PI * t), 0.75);
    pts.push(add(add(lerpV(a, b, t), mul(n, off + h)), [0, 0]));
  }
  for (let i = N; i >= 0; i--) {
    const t = i / N;
    const h = (w / 2) * Math.pow(Math.sin(Math.PI * t), 0.75);
    pts.push(add(lerpV(a, b, t), mul(n, off - h)));
  }
  return `M ${pts.map(P).join(" L ")} Z`;
}

/** Desenha um grupo de subcaminhos com contorno único + preenchimento. */
function Part({ d, fill }: { d: string[]; fill: string }) {
  return (
    <g>
      {d.map((p, i) => (
        <path key={"o" + i} d={p} fill={C.outline} stroke={C.outline} strokeWidth={1.7} strokeLinejoin="round" />
      ))}
      {d.map((p, i) => (
        <path key={"f" + i} d={p} fill={fill} />
      ))}
    </g>
  );
}

/** Membro com volume: base + faixa de luz + faixa de sombra. */
function Limb3D({ a, b, w1, w2, far }: { a: Vec; b: Vec; w1: number; w2: number; far?: boolean }) {
  const u = unit(a, b);
  const n: Vec = [-u[1], u[0]];
  const s = n[0] * LIGHT[0] + n[1] * LIGHT[1] > 0 ? 1 : -1;
  const wm = (w1 + w2) / 2;
  const hi = taper(lerpV(a, b, 0.06), lerpV(a, b, 0.94), w1 * 0.36, w2 * 0.36, s * wm * 0.2)[0];
  const sh = taper(lerpV(a, b, 0.04), lerpV(a, b, 0.96), w1 * 0.3, w2 * 0.3, -s * wm * 0.3)[0];
  return (
    <g>
      <Part d={taper(a, b, w1, w2)} fill={far ? C.skinFar : C.skin} />
      <path d={sh} fill={C.shade} opacity={far ? 0.35 : 0.5} />
      <path d={hi} fill={C.light} opacity={far ? 0.3 : 0.75} />
    </g>
  );
}

const Mus = ({ d }: { d: string }) => <path d={d} fill={C.mus} stroke={C.musEdge} strokeWidth={0.6} />;
const MusDot = ({ c, r }: { c: Vec; r: number }) => <circle cx={c[0]} cy={c[1]} r={r} fill={C.mus} stroke={C.musEdge} strokeWidth={0.6} />;

const ARM = { ua: [10, 7.2], fa: [7.6, 5], hand: [5.2, 4.4] };
const LEG = { th: [14.5, 9.5], sh: [9.5, 5.8], ft: [5.6, 4] };

function ArmShape({ l, far }: { l: Limb; far?: boolean }) {
  const k = far ? 0.93 : 1;
  return (
    <g>
      <Limb3D a={l.mid} b={l.end} w1={ARM.fa[0] * k} w2={ARM.fa[1] * k} far={far} />
      <Limb3D a={l.end} b={l.tip} w1={ARM.hand[0] * k} w2={ARM.hand[1] * k} far={far} />
      <Limb3D a={l.root} b={l.mid} w1={ARM.ua[0] * k} w2={ARM.ua[1] * k} far={far} />
    </g>
  );
}

function LegShape({ l, far, isFront }: { l: Limb; far?: boolean; isFront?: boolean }) {
  const k = far ? 0.94 : 1;
  return (
    <g>
      <Limb3D a={l.end} b={l.tip} w1={(isFront ? 6.5 : LEG.ft[0]) * k} w2={(isFront ? 5 : LEG.ft[1]) * k} far={far} />
      <Limb3D a={l.mid} b={l.end} w1={LEG.sh[0] * k} w2={LEG.sh[1] * k} far={far} />
      <Limb3D a={l.root} b={l.mid} w1={LEG.th[0] * k} w2={LEG.th[1] * k} far={far} />
    </g>
  );
}

// ---------- Destaques musculares ----------

/** Ventre deslocado para um lado do segmento (off>0 = lado "frontal" do segmento). */
function sideBelly(a: Vec, b: Vec, off: number, w: number, t0 = 0.12, t1 = 0.88) {
  const u = unit(a, b);
  const f = front(u);
  return belly(add(lerpV(a, b, t0), mul(f, off)), add(lerpV(a, b, t1), mul(f, off)), w);
}

function armHl(l: Limb, hl: Set<Hl>, isFront: boolean) {
  const out: ReactNode[] = [];
  if (hl.has("biceps")) out.push(<Mus key="b" d={isFront ? belly(lerpV(l.root, l.mid, 0.12), lerpV(l.root, l.mid, 0.9), 7.5) : sideBelly(l.root, l.mid, 1.6, 6.2)} />);
  if (hl.has("triceps")) out.push(<Mus key="t" d={isFront ? belly(lerpV(l.root, l.mid, 0.1), lerpV(l.root, l.mid, 0.88), 7.5) : sideBelly(l.root, l.mid, -1.8, 6.2)} />);
  if (hl.has("forearm")) out.push(<Mus key="f" d={belly(lerpV(l.mid, l.end, 0.05), lerpV(l.mid, l.end, 0.75), 6)} />);
  return out;
}

function legHl(l: Limb, hl: Set<Hl>, isFront: boolean) {
  const out: ReactNode[] = [];
  const thigh = (off: number, w: number) => (isFront ? belly(lerpV(l.root, l.mid, 0.08), lerpV(l.root, l.mid, 0.9), 11) : sideBelly(l.root, l.mid, off, w));
  if (hl.has("quads")) out.push(<Mus key="q" d={thigh(2.6, 8.5)} />);
  if (hl.has("hams")) out.push(<Mus key="h" d={thigh(-2.6, 8.5)} />);
  if (hl.has("adductors")) out.push(<Mus key="a" d={isFront ? sideBelly(l.root, l.mid, -3, 5, 0.05, 0.7) : sideBelly(l.root, l.mid, 0, 6, 0.05, 0.7)} />);
  if (hl.has("calves")) out.push(<Mus key="c" d={isFront ? belly(lerpV(l.mid, l.end, 0.05), lerpV(l.mid, l.end, 0.6), 7.5) : sideBelly(l.mid, l.end, -1.6, 7, 0.05, 0.6)} />);
  return out;
}

function torsoHlSide(f: Frame, hl: Set<Hl>) {
  const out: ReactNode[] = [];
  const at = (t: number, off: number): Vec => add(lerpV(f.pelvis, f.neck, t), mul(f.n, off));
  const band = (k: string, t0: number, t1: number, off: number, w = 7) => out.push(<Mus key={k} d={belly(at(t0, off), at(t1, off), w)} />);
  if (hl.has("chestU")) band("cu", 0.74, 0.98, 5.5, 7);
  if (hl.has("chestM")) band("cm", 0.6, 0.86, 6, 8);
  if (hl.has("chestL")) band("cl", 0.48, 0.72, 5.5, 7);
  if (hl.has("abs") || hl.has("core")) band("ab", 0.18, 0.56, 5.5, 6);
  if (hl.has("absL")) band("al", 0.04, 0.34, 5.5, 6);
  if (hl.has("obliques") || hl.has("core")) band("ob", 0.14, 0.52, 1, 9);
  if (hl.has("lats")) band("la", 0.38, 0.86, -3.5, 10);
  if (hl.has("midBack")) band("mb", 0.58, 0.94, -6, 7);
  if (hl.has("traps")) band("tr", 0.86, 1.12, -4.8, 7);
  if (hl.has("lowBack")) band("lb", 0.02, 0.4, -6, 6.5);
  if (hl.has("glutes")) out.push(<MusDot key="gl" c={add(add(f.pelvis, mul(f.n, -4.5)), mul(f.d, -1))} r={8} />);
  if (hl.has("gluteMed")) out.push(<MusDot key="gm" c={add(add(f.pelvis, mul(f.n, -2.5)), mul(f.d, 6))} r={5.5} />);
  return out;
}

function deltHlSide(f: Frame, hl: Set<Hl>) {
  const out: ReactNode[] = [];
  const sh = f.arm.root;
  if (hl.has("deltF")) out.push(<MusDot key="df" c={add(sh, mul(f.n, 2.6))} r={5.4} />);
  if (hl.has("deltS")) out.push(<MusDot key="ds" c={sh} r={5.8} />);
  if (hl.has("deltR")) out.push(<MusDot key="dr" c={add(sh, mul(f.n, -2.6))} r={5.4} />);
  return out;
}

function torsoHlFront(f: Frame, hl: Set<Hl>) {
  const out: ReactNode[] = [];
  const at = (t: number, s: number): Vec => add(lerpV(f.pelvis, f.neck, t), mul(f.n, s * (11 + 6 * t)));
  const pair = (k: string, t: number, w: number) => {
    out.push(<Mus key={k + 1} d={belly(at(t, 0.06), at(t + 0.02, 0.72), w)} />);
    out.push(<Mus key={k + 2} d={belly(at(t, -0.06), at(t + 0.02, -0.72), w)} />);
  };
  const vert = (k: string, t0: number, t1: number, s: number, w: number) => out.push(<Mus key={k} d={belly(at(t0, s), at(t1, s), w)} />);
  if (hl.has("chestU")) pair("cu", 0.86, 5.5);
  if (hl.has("chestM")) pair("cm", 0.75, 7);
  if (hl.has("chestL")) pair("cl", 0.64, 5.5);
  if (hl.has("abs") || hl.has("core")) vert("ab", 0.2, 0.56, 0, 9);
  if (hl.has("absL")) vert("al", 0.04, 0.3, 0, 9);
  if (hl.has("obliques") || hl.has("core")) {
    vert("o1", 0.12, 0.52, 0.72, 5.5);
    vert("o2", 0.12, 0.52, -0.72, 5.5);
  }
  if (hl.has("lats")) {
    vert("l1", 0.42, 0.86, 0.8, 6);
    vert("l2", 0.42, 0.86, -0.8, 6);
  }
  if (hl.has("midBack")) vert("mb", 0.58, 0.92, 0, 10);
  if (hl.has("lowBack")) vert("lb", 0.03, 0.38, 0, 8);
  if (hl.has("traps")) {
    const top = add(f.neck, mul(f.d, 3));
    out.push(<Mus key="t1" d={belly(top, lerpV(f.neck, f.arm.root, 0.85), 6)} />);
    out.push(<Mus key="t2" d={belly(top, lerpV(f.neck, f.arm2.root, 0.85), 6)} />);
  }
  if (hl.has("glutes")) for (const h of [f.hipN, f.hipF]) out.push(<MusDot key={"g" + h[0]} c={add(h, [0, 1])} r={6.5} />);
  if (hl.has("gluteMed")) {
    out.push(<MusDot key="gm1" c={add(add(f.pelvis, mul(f.n, 11)), mul(f.d, 5))} r={4.8} />);
    out.push(<MusDot key="gm2" c={add(add(f.pelvis, mul(f.n, -11)), mul(f.d, 5))} r={4.8} />);
  }
  return out;
}

function deltHlFront(f: Frame, hl: Set<Hl>) {
  const out: ReactNode[] = [];
  for (const [k, r] of [["deltF", 5.6], ["deltS", 6], ["deltR", 5.6]] as const) {
    if (hl.has(k)) {
      out.push(<MusDot key={k + 1} c={f.arm.root} r={r} />);
      out.push(<MusDot key={k + 2} c={f.arm2.root} r={r} />);
    }
  }
  return out;
}

// ---------- Equipamentos ----------

function Plate({ c, r }: { c: Vec; r: number }) {
  return (
    <g>
      <circle cx={c[0]} cy={c[1]} r={r} fill="url(#tp-plate)" stroke={C.padEdge} strokeWidth={1.2} />
      <circle cx={c[0]} cy={c[1]} r={r * 0.62} fill="none" stroke={C.plateRim} strokeWidth={1} />
      <circle cx={c[0]} cy={c[1]} r={r * 0.2} fill={C.metal} />
    </g>
  );
}

function DumbbellSide({ c }: { c: Vec }) {
  return (
    <g>
      <circle cx={c[0]} cy={c[1]} r={6.5} fill="url(#tp-plate)" stroke={C.padEdge} strokeWidth={1} />
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
            <circle cx={c[0]} cy={c[1] + 2} r={7.5} fill={C.plate} stroke={C.padEdge} strokeWidth={1} />
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
            out.push(<circle key={k + "s"} cx={f.leg.end[0]} cy={f.leg.end[1]} r={3.5} fill={C.accent} />);
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
              out.push(<circle key={k + "h"} cx={f.arm.grip[0]} cy={f.arm.grip[1]} r={3} fill={C.accent} />);
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
                <Seg key={k + "bar"} a={g.handle === "bar" ? add(f.arm.grip, [5, 0]) : f.arm.grip} b={g.handle === "bar" ? add(f.arm2.grip, [-5, 0]) : f.arm2.grip} w={g.handle === "bar" ? 3 : 2} c={g.handle === "bar" ? C.metal : C.accent} />,
              );
            } else out.push(line(mirror(from), f.arm2.grip, k + "l"));
          }
        }
        break;
      }
      case "lever": {
        const lv = (p: Vec, q: Vec, kk: string) => (
          <g key={kk}>
            <FrameSeg a={p} b={q} w={4.5} />
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
              {pivot && <FrameSeg a={pivot} b={c} w={4} />}
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
            {g.rail && <FrameSeg a={back} b={add(back, mul(g.rail, 1))} w={3} />}
            <FrameSeg a={add(back, mul(u, -w))} b={add(back, mul(u, w))} w={5} />
          </g>,
        );
        break;
      }
      case "band": {
        if (layer !== "near") break;
        const a = g.at === "ankle" ? f.leg.end : lerpV(f.leg.root, f.leg.mid, 0.85);
        const b = g.at === "ankle" ? farLeg.end : lerpV(farLeg.root, farLeg.mid, 0.85);
        out.push(<Seg key={k} a={a} b={b} w={3} c={C.accent} o={0.9} />);
        break;
      }
      case "wheel": {
        if (layer !== "near") break;
        out.push(
          <g key={k}>
            <circle cx={f.arm.grip[0]} cy={f.arm.grip[1] + 3} r={8} fill="url(#tp-plate)" stroke={C.padEdge} strokeWidth={1.2} />
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
                    <FrameSeg a={[p.x, p.y]} b={[p.x, FLOOR - 2]} w={4} />
                    <FrameSeg a={[p.x - 12, FLOOR - 1.5]} b={[p.x + 12, FLOOR - 1.5]} w={3} />
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
                  strokeWidth={1}
                  transform={`rotate(${p.a ?? 0} ${p.x} ${p.y})`}
                />
              </g>
            );
          }
          case "box":
            return <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} rx={p.r ?? 2} fill={C.pad} stroke={C.padEdge} strokeWidth={1.2} />;
          case "line":
            return <FrameSeg key={i} a={p.p} b={p.q} w={p.w ?? 4} />;
          case "pulley":
            return (
              <g key={i}>
                <FrameSeg a={[p.x, Math.min(p.y - 8, 20)]} b={[p.x, FLOOR]} w={5} />
                <circle cx={p.x} cy={p.y} r={4.5} fill={C.frame} stroke={C.frameEdge} strokeWidth={1.4} />
              </g>
            );
          case "bar":
            return p.w ? (
              <Seg key={i} a={[p.x - p.w / 2, p.y]} b={[p.x + p.w / 2, p.y]} w={3.5} c={C.metal} />
            ) : (
              <g key={i}>
                <FrameSeg a={[p.x + 16, p.y - 4]} b={[p.x + 16, FLOOR]} w={4} />
                <FrameSeg a={[p.x, p.y]} b={[p.x + 16, p.y - 4]} w={3} />
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

function Torso({ f }: { f: Frame }) {
  const side = f.view === "side";
  if (side) {
    const chest = add(lerpV(f.pelvis, f.neck, 0.72), mul(f.n, 2.5));
    const glute = add(add(f.pelvis, mul(f.n, -3)), mul(f.d, 0));
    const d = [...taper(f.pelvis, f.neck, 17, 18), circle(glute, 9), circle(chest, 9.5)];
    const s = f.n[0] * LIGHT[0] + f.n[1] * LIGHT[1] > 0 ? 1 : -1;
    return (
      <g>
        <Part d={d} fill={C.skin} />
        <path d={taper(lerpV(f.pelvis, f.neck, 0.05), lerpV(f.pelvis, f.neck, 0.95), 5, 6, -s * 5.5)[0]} fill={C.shade} opacity={0.45} />
        <path d={taper(lerpV(f.pelvis, f.neck, 0.1), lerpV(f.pelvis, f.neck, 0.9), 5, 6, s * 3.5)[0]} fill={C.light} opacity={0.7} />
        {/* contorno do peitoral e linha abdominal */}
        <path
          d={`M ${P(add(lerpV(f.pelvis, f.neck, 0.62), mul(f.n, 8.5)))} Q ${P(add(lerpV(f.pelvis, f.neck, 0.6), mul(f.n, 2)))} ${P(add(lerpV(f.pelvis, f.neck, 0.72), mul(f.n, -1)))}`}
          fill="none"
          stroke={C.line}
          strokeWidth={0.7}
        />
        <path d={`M ${P(add(lerpV(f.pelvis, f.neck, 0.12), mul(f.n, 7.5)))} L ${P(add(lerpV(f.pelvis, f.neck, 0.52), mul(f.n, 7.5)))}`} stroke={C.line} strokeWidth={0.6} opacity={0.8} />
      </g>
    );
  }
  // Frente: tronco em "V" com definição de peitoral e abdômen
  const at = (t: number, w: number): Vec => add(lerpV(f.pelvis, f.neck, t), mul(f.n, w));
  const outline = [at(1, 16.5), at(0.62, 14), at(0.32, 10.5), at(0, 12), at(0, -12), at(0.32, -10.5), at(0.62, -14), at(1, -16.5)];
  const d = `M ${outline.map(P).join(" L ")} Z`;
  const def = [
    `M ${P(at(0.97, 0))} L ${P(at(0.08, 0))}`,
    `M ${P(at(0.62, 13))} Q ${P(at(0.56, 6))} ${P(at(0.64, 0))} Q ${P(at(0.56, -6))} ${P(at(0.62, -13))}`,
    `M ${P(at(0.46, 5))} L ${P(at(0.46, -5))}`,
    `M ${P(at(0.34, 5))} L ${P(at(0.34, -5))}`,
    `M ${P(at(0.22, 4.5))} L ${P(at(0.22, -4.5))}`,
  ];
  return (
    <g>
      <Part d={[d, circle(at(0.02, 0), 7)]} fill={C.skin} />
      <path d={`M ${[at(0.95, -12), at(0.62, -11), at(0.3, -8.5), at(0.05, -9.5), at(0.05, -5), at(0.62, -5)].map(P).join(" L ")} Z`} fill={C.shade} opacity={0.35} />
      <path d={`M ${[at(0.95, 3), at(0.95, 11), at(0.66, 10), at(0.66, 3)].map(P).join(" L ")} Z`} fill={C.light} opacity={0.6} />
      {def.map((p, i) => (
        <path key={i} d={p} fill="none" stroke={C.line} strokeWidth={0.7} />
      ))}
    </g>
  );
}

function Head({ f }: { f: Frame }) {
  const side = f.view === "side";
  const neckTop = add(f.neck, mul(f.d, 6));
  const h = f.head;
  return (
    <g>
      <Part d={taper(f.neck, neckTop, 7.5, 6.5)} fill={C.skin} />
      {/* cabelo (atrás) + rosto (na frente) formam um corte curto */}
      <Part d={[circle(add(add(h, mul(f.d, 1.4)), mul(f.n, side ? -1.2 : 0)), 8.4)]} fill="#6f7277" />
      <path d={side ? circle(add(add(h, mul(f.d, -1.1)), mul(f.n, 1.1)), 7.7) : `M ${h[0] - 7.2} ${h[1] + 1} a 7.2 8.2 0 1 0 14.4 0 a 7.2 8.2 0 1 0 -14.4 0 Z`} fill={C.skin} />
      <circle cx={h[0] - 1.5} cy={h[1] + 0.5} r={3.2} fill={C.light} opacity={0.6} />
      {side && <path d={circle(add(add(h, mul(f.n, 7.4)), mul(f.d, -1)), 1.5)} fill={C.skin} stroke={C.outline} strokeWidth={0.5} />}
    </g>
  );
}

export function Body({ f, gear = [], hl = [], ghost }: { f: Frame; gear?: Gear[]; hl?: Hl[]; ghost?: boolean }) {
  const hs = new Set(hl);
  const side = f.view === "side";
  const arm2 = side ? shift(f.arm2, DEPTH) : f.arm2;
  const leg2 = side ? shift(f.leg2, DEPTH) : f.leg2;
  const showLegs = f.view !== "end";
  if (ghost) return null;

  return (
    <g>
      {gearNodes(f, gear, "far")}
      {showLegs && <LegShape l={leg2} far={side} isFront={!side} />}
      {side && showLegs && legHl(leg2, hs, false).map((n, i) => <g key={i} opacity={0.6}>{n}</g>)}
      {side && <ArmShape l={arm2} far />}
      {side && armHl(arm2, hs, false).map((n, i) => <g key={i} opacity={0.6}>{n}</g>)}
      <Torso f={f} />
      <Head f={f} />
      {side ? torsoHlSide(f, hs) : torsoHlFront(f, hs)}
      {showLegs && <LegShape l={f.leg} isFront={!side} />}
      {showLegs && legHl(f.leg, hs, !side)}
      {!side && showLegs && <>{legHl(leg2, hs, true)}</>}
      {!side && <ArmShape l={arm2} />}
      {!side && armHl(arm2, hs, true)}
      <ArmShape l={f.arm} />
      {armHl(f.arm, hs, !side)}
      {side ? deltHlSide(f, hs) : deltHlFront(f, hs)}
      {gearNodes(f, gear, "near")}
    </g>
  );
}
