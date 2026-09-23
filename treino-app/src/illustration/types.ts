export type Vec = [number, number];

/** Articulação usada para "prender" o boneco num ponto fixo da cena. */
export type Anchor = "hip" | "ankle" | "toe" | "knee" | "shoulder" | "hand";

/**
 * Pose do boneco. Ângulos em graus, absolutos (não relativos ao segmento anterior):
 *   0 = apontando para baixo, 90 = para frente (direita da tela), 180 = para cima, 270 = para trás.
 * Na vista frontal, 90 significa "para fora" (abdução), espelhado no lado esquerdo.
 */
export interface Pose {
  at: Vec;
  anchor?: Anchor;
  /** Direção quadril → ombro. 180 = em pé, 270 = deitado de barriga para cima (cabeça à esquerda). */
  torso: number;
  /** Escala do comprimento do tronco (escorço quando o tronco inclina para a câmera). */
  torsoScale?: number;
  /** Inclinação da cabeça relativa ao tronco. */
  head?: number;
  /** Elevação dos ombros (encolhimento), em px. */
  shrug?: number;
  /** Braço do lado próximo: [braço, antebraço]. */
  arm: [number, number];
  arm2?: [number, number];
  /** Escala de comprimento [braço, antebraço] para simular escorço (membro apontando para a câmera). */
  armScale?: [number, number];
  armScale2?: [number, number];
  /** Flexão do punho relativa ao antebraço (+ = flexão palmar). */
  wrist?: number;
  leg: [number, number];
  leg2?: [number, number];
  legScale?: [number, number];
  legScale2?: [number, number];
  /** Ângulo absoluto do pé (padrão: canela + 90). */
  foot?: number;
  foot2?: number;
}

/** Equipamento que se move junto com o corpo. */
export type Gear =
  | { t: "barbell"; at?: "hand" | "back" | "front" | "hip"; small?: boolean }
  | { t: "dumbbell"; one?: boolean; grip?: "neutral" }
  | { t: "kettlebell" }
  | { t: "plate"; at?: "hand" | "chest" }
  | { t: "cable"; from: Vec; handle?: "bar" | "rope" | "single"; one?: boolean; to?: "hand" | "ankle" }
  | { t: "lever"; pivot: Vec; one?: boolean }
  /** Rolo/almofada na perna. side "f" = anterior (na vista frontal: lado de fora), "b" = posterior (lado de dentro). */
  | { t: "legPad"; pivot?: Vec; at?: "ankle" | "knee" | "thigh"; side?: "f" | "b"; one?: boolean }
  | { t: "footPlate"; angle: number; w?: number; rail?: Vec }
  | { t: "band"; at?: "knee" | "ankle" }
  | { t: "wheel" };

/** Cenário estático (bancos, colunas, barras). */
export type Prop =
  | { t: "bench"; x: number; y: number; w: number; a?: number; h?: number; post?: boolean }
  | { t: "box"; x: number; y: number; w: number; h: number; r?: number }
  | { t: "line"; p: Vec; q: Vec; w?: number }
  | { t: "pulley"; x: number; y: number }
  | { t: "bar"; x: number; y: number; w?: number }
  | { t: "roller"; x: number; y: number; r?: number }
  | { t: "step"; x: number; w: number; h: number };

/** Regiões que acendem no boneco para mostrar o músculo trabalhado. */
export type Hl =
  | "chestU" | "chestM" | "chestL"
  | "abs" | "absL" | "obliques" | "core"
  | "lats" | "midBack" | "traps" | "lowBack"
  | "deltF" | "deltS" | "deltR"
  | "biceps" | "triceps" | "forearm"
  | "quads" | "hams" | "glutes" | "gluteMed" | "adductors" | "calves";

export type View = "side" | "front" | "end";

export interface Anim {
  view?: View;
  a: Pose;
  b: Pose;
  gear?: Gear[];
  props?: Prop[];
  hl?: Hl[];
  /** Esconde o chão (ex.: vista "end" em banco). */
  noFloor?: boolean;
  /** Duração do ciclo em ms. */
  period?: number;
}
