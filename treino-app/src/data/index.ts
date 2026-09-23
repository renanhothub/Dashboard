import type { Exercise, Level, Muscle, Portion } from "./types";
import { peito } from "./muscles/peito";
import { costas } from "./muscles/costas";
import { ombros } from "./muscles/ombros";
import { antebraco, biceps, triceps } from "./muscles/bracos";
import { abdomen } from "./muscles/abdomen";
import { gluteos, panturrilha, posterior, quadriceps } from "./muscles/pernas";

export const muscles: Muscle[] = [peito, costas, ombros, biceps, triceps, antebraco, abdomen, quadriceps, posterior, gluteos, panturrilha];

export function findMuscle(id?: string) {
  return muscles.find((m) => m.id === id);
}

export interface ExerciseRef {
  muscle: Muscle;
  portion: Portion;
  exercise: Exercise;
}

export const allExercises: ExerciseRef[] = muscles.flatMap((muscle) =>
  muscle.portions.flatMap((portion) => portion.exercises.map((exercise) => ({ muscle, portion, exercise }))),
);

export function findExercise(id?: string) {
  return allExercises.find((r) => r.exercise.id === id);
}

const LEVEL_ORDER: Record<Level, number> = { Iniciante: 0, Intermediário: 1, Avançado: 2 };

/** Ordena por nível (Iniciante → Intermediário → Avançado), mantendo a ordem original dentro do mesmo nível. */
export function byLevel(exercises: Exercise[]) {
  return [...exercises].sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]);
}
