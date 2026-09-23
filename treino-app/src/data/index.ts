import type { Exercise, Muscle, Portion } from "./types";
import { peito } from "./muscles/peito";
import { costas } from "./muscles/costas";
import { ombros } from "./muscles/ombros";

export const muscles: Muscle[] = [peito, costas, ombros];

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
