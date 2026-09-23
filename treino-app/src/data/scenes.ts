/**
 * Cenários e poses-base reutilizados pelas ilustrações.
 * Convenção de ângulos: 0 = para baixo, 90 = para frente (direita), 180 = para cima, 270 = para trás.
 */
import type { Pose, Prop, Vec } from "../illustration/types";

type A2 = [number, number];

// ---------- Deitado no banco reto (cabeça à esquerda) ----------
export const flatBench: Prop = { t: "bench", x: 108, y: 159, w: 90 };
export const supine = (arm: A2, extra: Partial<Pose> = {}): Pose => ({
  at: [140, 148],
  torso: 270,
  leg: [90, 0],
  arm,
  ...extra,
});

// ---------- Banco inclinado (~35°) ----------
export const inclineBench: Prop[] = [
  { t: "bench", x: 127, y: 152, w: 30 },
  { t: "bench", x: 104, y: 137, w: 62, a: 35, post: false },
];
export const incline = (arm: A2, extra: Partial<Pose> = {}): Pose => ({
  at: [130, 141],
  torso: 235,
  leg: [80, 0],
  arm,
  ...extra,
});

// ---------- Banco declinado (~22°) ----------
export const declineBench: Prop[] = [
  { t: "bench", x: 122, y: 155, w: 82, a: -22 },
  { t: "roller", x: 194, y: 141, r: 5.5 },
];
export const decline = (arm: A2, extra: Partial<Pose> = {}): Pose => ({
  at: [140, 138],
  torso: 292,
  leg: [125, 30],
  arm,
  ...extra,
});

// ---------- Sentado com encosto (vista lateral) ----------
export const seatBack = (x = 106): Prop[] => [
  { t: "bench", x: x + 16, y: 152, w: 36 },
  { t: "bench", x: x - 6, y: 122, w: 52, a: 90, post: false },
];
export const seated = (arm: A2, extra: Partial<Pose> = {}): Pose => ({
  at: [114, 145],
  torso: 180,
  leg: [88, 0],
  arm,
  ...extra,
});

// ---------- Em pé ----------
export const stand = (arm: A2, extra: Partial<Pose> = {}): Pose => ({
  anchor: "ankle",
  at: [120, 184],
  torso: 180,
  leg: [0, 0],
  arm,
  ...extra,
});

/** Em pé na vista frontal (pelve em x=120). */
export const standF = (arm: A2, extra: Partial<Pose> = {}): Pose => ({
  anchor: "hip",
  at: [120, 111],
  torso: 180,
  leg: [4, 2],
  arm,
  ...extra,
});

/** Sentado na vista frontal: coxas apontam para a câmera (escorço). */
export const seatedF = (arm: A2, extra: Partial<Pose> = {}): Pose => ({
  at: [120, 136],
  torso: 180,
  leg: [30, 3],
  legScale: [0.3, 1],
  arm,
  ...extra,
});
export const seatF: Prop[] = [{ t: "box", x: 98, y: 141, w: 44, h: 7 }];

/** Deitado visto pelos pés (vista "end"), sobre o banco. */
export const endBench: Prop[] = [
  { t: "box", x: 103, y: 146, w: 34, h: 8 },
  { t: "line", p: [120, 154], q: [120, 188], w: 5 },
];
export const endPose = (arm: A2, extra: Partial<Pose> = {}): Pose => ({
  at: [120, 144],
  torso: 180,
  leg: [0, 0],
  arm,
  ...extra,
});

// ---------- Polias (vista frontal: espelhadas em x=120) ----------
export const pulleysF = (y: number, x = 34): Prop[] => [
  { t: "pulley", x, y },
  { t: "pulley", x: 240 - x, y },
];
export const high: Vec = [34, 30];
export const low: Vec = [34, 178];
