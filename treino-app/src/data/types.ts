import type { Anim } from "../illustration/types";

export type Level = "Iniciante" | "Intermediário" | "Avançado";

/** Regiões do mapa muscular (frente e costas). */
export type Region =
  | "chestU" | "chestM" | "chestL"
  | "deltF" | "deltS" | "deltR"
  | "bicepsLong" | "bicepsShort" | "brachialis"
  | "tricepsLong" | "tricepsLat" | "tricepsMed"
  | "forearmFlex" | "forearmExt"
  | "absU" | "absL" | "obliques" | "transverse"
  | "lats" | "midBack" | "traps" | "lowBack"
  | "rectusFem" | "vastusLat" | "vastusMed" | "adductors"
  | "hamsMed" | "hamsLat"
  | "gluteMax" | "gluteMed" | "gluteMin"
  | "gastroc" | "soleus";

export interface Exercise {
  id: string;
  name: string;
  equipment: string;
  level: Level;
  /** Prescrição sugerida (séries x repetições · descanso). */
  sets: string;
  steps: string[];
  tips: string[];
  anim: Anim;
}

export interface Portion {
  id: string;
  name: string;
  /** Nome anatômico / explicação curta. */
  detail: string;
  regions: Region[];
  exercises: Exercise[];
}

export interface Muscle {
  id: string;
  name: string;
  tagline: string;
  portions: Portion[];
}
