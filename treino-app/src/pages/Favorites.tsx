import { Link } from "react-router-dom";
import { findExercise } from "../data";
import { ExerciseCard, Header } from "../components/ui";
import { useFavorites } from "../favorites";

export default function Favorites() {
  const { ids } = useFavorites();
  const refs = ids.map((id) => findExercise(id)).filter((r) => r !== undefined);
  return (
    <div>
      <Header title="Favoritos" subtitle="Seus exercícios salvos neste aparelho" />
      {refs.length === 0 ? (
        <div className="px-6 pt-16 text-center text-sm text-ink-300">
          <p>Nenhum exercício salvo ainda.</p>
          <Link to="/" className="mt-4 inline-block rounded-full bg-gold-400 px-5 py-2.5 font-semibold text-ink-950">
            Explorar músculos
          </Link>
        </div>
      ) : (
        <div className="space-y-4 px-4 pt-4">
          {refs.map((r) => (
            <ExerciseCard key={r.exercise.id} ex={r.exercise} to={`/exercicio/${r.exercise.id}`} right={<span className="text-[11px] text-ink-300">{r.muscle.name}</span>} />
          ))}
        </div>
      )}
    </div>
  );
}
