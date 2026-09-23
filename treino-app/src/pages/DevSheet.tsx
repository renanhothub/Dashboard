import { allExercises } from "../data";
import ExerciseAnimation from "../illustration/ExerciseAnimation";

/** Folha de contato para revisar todas as ilustrações (início e fim). Rota: #/dev */
export default function DevSheet() {
  const only = new URLSearchParams(window.location.hash.split("?")[1] ?? "").get("m");
  const list = allExercises.filter((r) => !only || r.muscle.id === only);
  return (
    <div className="grid grid-cols-3 gap-2 bg-ink-950 p-2 text-[10px] text-ink-300">
      {list.map(({ muscle, portion, exercise }) => (
        <div key={exercise.id} className="rounded bg-ink-900 p-1">
          <div className="truncate">
            {muscle.name} › {portion.name} › {exercise.name}
          </div>
          <div className="flex">
            <ExerciseAnimation anim={exercise.anim} still={0} ghost={false} className="w-1/2" />
            <ExerciseAnimation anim={exercise.anim} still={1} ghost={false} className="w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
