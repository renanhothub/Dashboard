import type { Anchor, Pose, Vec, View } from "./types";

/** Comprimentos dos segmentos do boneco (unidades do viewBox 240x200). */
export const L = {
  torso: 46,
  neck: 5,
  headR: 8,
  ua: 26,
  fa: 23,
  hand: 7,
  thigh: 38,
  shin: 36,
  foot: 10,
  shoulderHalf: 13,
  hipHalf: 7,
};

export const FLOOR = 188;
export const VIEWBOX = { w: 240, h: 200 };

export const dir = (a: number): Vec => {
  const r = (a * Math.PI) / 180;
  return [Math.sin(r), Math.cos(r)];
};
export const add = (p: Vec, q: Vec): Vec => [p[0] + q[0], p[1] + q[1]];
export const mul = (p: Vec, k: number): Vec => [p[0] * k, p[1] * k];
export const along = (p: Vec, a: number, len: number): Vec => add(p, mul(dir(a), len));
/** Perpendicular "frontal" de uma direção: para um segmento apontando para baixo, aponta para frente (+x). */
export const front = (d: Vec): Vec => [d[1], -d[0]];
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerpV = (a: Vec, b: Vec, t: number): Vec => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

type Full = Required<Pose>;

export function normalize(p: Pose): Full {
  return {
    at: p.at,
    anchor: p.anchor ?? "hip",
    torso: p.torso,
    torsoScale: p.torsoScale ?? 1,
    head: p.head ?? 0,
    shrug: p.shrug ?? 0,
    arm: p.arm,
    arm2: p.arm2 ?? p.arm,
    armScale: p.armScale ?? [1, 1],
    armScale2: p.armScale2 ?? p.armScale ?? [1, 1],
    wrist: p.wrist ?? 0,
    leg: p.leg,
    leg2: p.leg2 ?? p.leg,
    legScale: p.legScale ?? [1, 1],
    legScale2: p.legScale2 ?? p.legScale ?? [1, 1],
    foot: p.foot ?? p.leg[1] + 90,
    foot2: p.foot2 ?? p.foot ?? (p.leg2 ?? p.leg)[1] + 90,
  };
}

const lerp2 = (a: [number, number], b: [number, number], t: number): [number, number] => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
];

export function interpolate(a: Full, b: Full, t: number): Full {
  return {
    at: lerpV(a.at, b.at, t),
    anchor: a.anchor,
    torso: lerp(a.torso, b.torso, t),
    torsoScale: lerp(a.torsoScale, b.torsoScale, t),
    head: lerp(a.head, b.head, t),
    shrug: lerp(a.shrug, b.shrug, t),
    arm: lerp2(a.arm, b.arm, t),
    arm2: lerp2(a.arm2, b.arm2, t),
    armScale: lerp2(a.armScale, b.armScale, t),
    armScale2: lerp2(a.armScale2, b.armScale2, t),
    wrist: lerp(a.wrist, b.wrist, t),
    leg: lerp2(a.leg, b.leg, t),
    leg2: lerp2(a.leg2, b.leg2, t),
    legScale: lerp2(a.legScale, b.legScale, t),
    legScale2: lerp2(a.legScale2, b.legScale2, t),
    foot: lerp(a.foot, b.foot, t),
    foot2: lerp(a.foot2, b.foot2, t),
  };
}

export interface Limb {
  root: Vec;
  mid: Vec;
  end: Vec;
  /** Ponta da mão / do pé. */
  tip: Vec;
  /** Ponto de pegada (onde o equipamento é segurado). */
  grip: Vec;
  a0: number;
  a1: number;
  /** Ângulo da mão/pé. */
  a2: number;
}

export interface Frame {
  view: View;
  pelvis: Vec;
  neck: Vec;
  head: Vec;
  /** Direção do tronco e normal frontal (peito). */
  d: Vec;
  n: Vec;
  torsoLen: number;
  arm: Limb;
  arm2: Limb;
  leg: Limb;
  leg2: Limb;
  /** Na vista frontal, qual o sinal do lado direito/esquerdo para espelhar. */
  hipN: Vec;
  hipF: Vec;
}

function limb(
  root: Vec,
  a0: number,
  a1: number,
  l0: number,
  l1: number,
  tipAngle: number,
  tipLen: number,
  mirror: boolean,
): Limb {
  const dd = (a: number): Vec => {
    const v = dir(a);
    return mirror ? [-v[0], v[1]] : v;
  };
  const mid = add(root, mul(dd(a0), l0));
  const end = add(mid, mul(dd(a1), l1));
  const tip = add(end, mul(dd(tipAngle), tipLen));
  const grip = add(end, mul(dd(tipAngle), tipLen * 0.55));
  return { root, mid, end, tip, grip, a0, a1, a2: tipAngle };
}

export function solve(p: Full, view: View = "side"): Frame {
  const origin: Vec = [0, 0];
  const d = dir(p.torso);
  // Normal do peito (vista lateral) ou lado direito do corpo (vista frontal).
  const fd = front(d);
  const nn: Vec = [-fd[0], -fd[1]];
  const torsoLen = L.torso * p.torsoScale * (view === "end" ? 0.3 : 1);
  const neck = add(origin, mul(d, torsoLen));
  const head = along(neck, p.torso + p.head, L.neck + L.headR);
  const shrugV = mul(d, p.shrug);

  let arm: Limb, arm2: Limb, leg: Limb, leg2: Limb, hipN: Vec, hipF: Vec;
  if (view === "side") {
    const root = add(neck, shrugV);
    arm = limb(root, p.arm[0], p.arm[1], L.ua * p.armScale[0], L.fa * p.armScale[1], p.arm[1] + p.wrist, L.hand, false);
    arm2 = limb(root, p.arm2[0], p.arm2[1], L.ua * p.armScale2[0], L.fa * p.armScale2[1], p.arm2[1] + p.wrist, L.hand, false);
    hipN = origin;
    hipF = origin;
    leg = limb(origin, p.leg[0], p.leg[1], L.thigh * p.legScale[0], L.shin * p.legScale[1], p.foot, L.foot, false);
    leg2 = limb(origin, p.leg2[0], p.leg2[1], L.thigh * p.legScale2[0], L.shin * p.legScale2[1], p.foot2, L.foot, false);
  } else {
    const sideR = mul(nn, L.shoulderHalf);
    const rootR = add(add(neck, sideR), shrugV);
    const rootL = add(add(neck, mul(sideR, -1)), shrugV);
    arm = limb(rootR, p.arm[0], p.arm[1], L.ua * p.armScale[0], L.fa * p.armScale[1], p.arm[1] + p.wrist, L.hand * 0.8, false);
    arm2 = limb(rootL, p.arm2[0], p.arm2[1], L.ua * p.armScale2[0], L.fa * p.armScale2[1], p.arm2[1] + p.wrist, L.hand * 0.8, true);
    hipN = mul(nn, L.hipHalf);
    hipF = mul(nn, -L.hipHalf);
    leg = limb(hipN, p.leg[0], p.leg[1], L.thigh * p.legScale[0], L.shin * p.legScale[1], p.leg[1] + 25, 5, false);
    leg2 = limb(hipF, p.leg2[0], p.leg2[1], L.thigh * p.legScale2[0], L.shin * p.legScale2[1], p.leg2[1] + 25, 5, true);
  }

  const f: Frame = { view, pelvis: origin, neck, head, d, n: nn, torsoLen, arm, arm2, leg, leg2, hipN, hipF };
  const target = anchorPoint(f, p.anchor);
  return translate(f, [p.at[0] - target[0], p.at[1] - target[1]]);
}

function anchorPoint(f: Frame, a: Anchor): Vec {
  switch (a) {
    case "hip":
      return f.pelvis;
    case "ankle":
      return f.leg.end;
    case "toe":
      return f.leg.tip;
    case "knee":
      return f.leg.mid;
    case "shoulder":
      return f.neck;
    case "hand":
      return f.arm.grip;
  }
}

function tl(l: Limb, o: Vec): Limb {
  return { ...l, root: add(l.root, o), mid: add(l.mid, o), end: add(l.end, o), tip: add(l.tip, o), grip: add(l.grip, o) };
}

function translate(f: Frame, o: Vec): Frame {
  return {
    ...f,
    pelvis: add(f.pelvis, o),
    neck: add(f.neck, o),
    head: add(f.head, o),
    hipN: add(f.hipN, o),
    hipF: add(f.hipF, o),
    arm: tl(f.arm, o),
    arm2: tl(f.arm2, o),
    leg: tl(f.leg, o),
    leg2: tl(f.leg2, o),
  };
}

/** Suavização: segura um pouco nos extremos para a leitura do movimento ficar clara. */
export function easeCycle(phase: number): number {
  // phase 0..1 → 0 → 1 → 0 com pausas nos extremos
  const p = phase % 1;
  const hold = 0.12;
  const move = 0.5 - hold;
  const s = (x: number) => (1 - Math.cos(Math.PI * Math.min(Math.max(x, 0), 1))) / 2;
  if (p < move) return s(p / move);
  if (p < 0.5) return 1;
  if (p < 0.5 + move) return 1 - s((p - 0.5) / move);
  return 0;
}
