import { allExercises } from "../data";
import ExerciseAnimation from "../illustration/ExerciseAnimation";

/** Folha de contato para revisar todas as ilustrações (início e fim). Rota: #/dev */
export default function DevSheet() {
  const q = new URLSearchParams(window.location.hash.split("?")[1] ?? "");
  const only = q.get("m");
  const ids = q.get("ids")?.split(",");
  const list = allExercises.filter((r) => (!only || r.muscle.id === only) && (!ids || ids.includes(r.exercise.id)));
  return (
    <div className={`grid gap-3 bg-ink-950 p-3 text-xs text-ink-300 ${ids ? "grid-cols-1" : "grid-cols-2"}`}>
      {list.map(({ muscle, portion, exercise }) => (
        <div key={exercise.id} className="rounded-xl bg-white p-2">
          <div className="truncate px-1 font-medium text-neutral-700">
            {muscle.name} › {portion.name} › {exercise.name}
          </div>
          <ExerciseAnimation anim={exercise.anim} className="w-full" />
        </div>
      ))}
    </div>
  );
}
