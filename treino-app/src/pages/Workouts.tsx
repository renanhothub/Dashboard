import { Link, useNavigate } from "react-router-dom";
import { findExercise } from "../data";
import { Header } from "../components/ui";
import { createWorkout, fmtDate, useTraining } from "../training";

export default function Workouts() {
  const { workouts, sessions } = useTraining();
  const nav = useNavigate();
  const lastDone = (id: string) => [...sessions].reverse().find((s) => s.workoutId === id)?.finishedAt;

  return (
    <div>
      <Header title="Meus treinos" subtitle="Monte sua divisão e registre cada sessão" />
      <div className="space-y-3 px-4 pt-4">
        {workouts.length === 0 && (
          <div className="rounded-3xl bg-ink-900 p-5 text-sm text-ink-300 ring-1 ring-white/5">
            <p className="font-semibold text-white">Monte seu primeiro treino</p>
            <p className="mt-1">
              Crie o Treino A, adicione os exercícios e, na academia, toque em <b>Iniciar</b> para anotar carga e repetições de cada série.
            </p>
          </div>
        )}
        {workouts.map((w) => {
          const names = w.items.map((i) => findExercise(i.exId)?.exercise.name).filter(Boolean);
          const muscles = [...new Set(w.items.map((i) => findExercise(i.exId)?.muscle.name).filter(Boolean))];
          const last = lastDone(w.id);
          return (
            <Link key={w.id} to={`/treinos/${w.id}`} className="block rounded-3xl bg-ink-900 p-4 ring-1 ring-white/5 active:scale-[0.99]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{w.name}</h2>
                <span className="text-xs text-ink-300">{w.items.length} exercícios</span>
              </div>
              {muscles.length > 0 && <p className="mt-0.5 text-xs text-gold-300">{muscles.join(" · ")}</p>}
              <p className="mt-2 line-clamp-2 text-sm text-ink-300">{names.length ? names.join(", ") : "Nenhum exercício ainda"}</p>
              <p className="mt-2 text-[11px] text-ink-500">{last ? `Último: ${fmtDate(last)}` : "Ainda não realizado"}</p>
            </Link>
          );
        })}
        <button
          onClick={() => nav(`/treinos/${createWorkout().id}`)}
          className="w-full rounded-2xl border border-dashed border-gold-400/50 py-4 text-sm font-semibold text-gold-400"
        >
          + Novo treino
        </button>
      </div>
    </div>
  );
}
