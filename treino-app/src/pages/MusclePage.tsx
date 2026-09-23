import { Navigate, useParams, useSearchParams } from "react-router-dom";
import { byLevel, findMuscle } from "../data";
import { ExerciseCard, Header } from "../components/ui";

export default function MusclePage() {
  const { id } = useParams();
  const muscle = findMuscle(id);
  const [params, setParams] = useSearchParams();
  if (!muscle) return <Navigate to="/" replace />;
  const portion = muscle.portions.find((p) => p.id === params.get("porcao")) ?? muscle.portions[0];

  return (
    <div>
      <Header title={muscle.name} subtitle={muscle.tagline} back />
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
        {muscle.portions.map((p) => {
          const active = p.id === portion.id;
          return (
            <button
              key={p.id}
              onClick={() => setParams({ porcao: p.id }, { replace: true })}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                active ? "bg-gold-400 text-ink-950" : "bg-ink-800 text-ink-300"
              }`}
            >
              {p.name}
            </button>
          );
        })}
      </div>
      <p className="px-4 text-sm text-ink-300">{portion.detail}</p>
      <div className="space-y-4 px-4 pt-4">
        {byLevel(portion.exercises).map((ex) => (
          <ExerciseCard key={ex.id} ex={ex} to={`/exercicio/${ex.id}`} />
        ))}
      </div>
    </div>
  );
}
