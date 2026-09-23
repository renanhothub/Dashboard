import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { findExercise } from "../data";
import ExercisePicker from "../components/ExercisePicker";
import { Header, Thumb } from "../components/ui";
import { addToWorkout, deleteWorkout, lastPerformance, moveItem, startSession, updateWorkout, useTraining } from "../training";

export default function WorkoutEdit() {
  const { id } = useParams();
  const { workouts, active } = useTraining();
  const nav = useNavigate();
  const [picking, setPicking] = useState(false);
  const w = workouts.find((x) => x.id === id);
  if (!w) return <Navigate to="/treinos" replace />;

  const setSets = (i: number, d: number) =>
    updateWorkout(w.id, (x) => ({ ...x, items: x.items.map((it, j) => (j === i ? { ...it, sets: Math.min(10, Math.max(1, it.sets + d)) } : it)) }));
  const remove = (i: number) => updateWorkout(w.id, (x) => ({ ...x, items: x.items.filter((_, j) => j !== i) }));

  const start = () => {
    if (active && !confirm(`Existe um treino em andamento (${active.workoutName}). Descartar e iniciar ${w.name}?`)) return;
    startSession(w.id);
    nav("/sessao");
  };

  return (
    <div>
      <Header title={w.name} subtitle={`${w.items.length} exercícios`} back />
      <div className="px-4 pt-4">
        <label className="text-[11px] uppercase tracking-wider text-ink-500">Nome do treino</label>
        <input
          value={w.name}
          onChange={(e) => updateWorkout(w.id, (x) => ({ ...x, name: e.target.value }))}
          className="mt-1 w-full rounded-2xl bg-ink-800 px-4 py-3 text-sm font-semibold outline-none ring-1 ring-white/5 focus:ring-gold-400/60"
        />

        <ul className="mt-4 space-y-2">
          {w.items.map((it, i) => {
            const ref = findExercise(it.exId);
            if (!ref) return null;
            const last = lastPerformance(it.exId);
            return (
              <li key={it.exId} className="rounded-2xl bg-ink-900 p-2 ring-1 ring-white/5">
                <div className="flex items-center gap-3">
                  <Link to={`/exercicio/${it.exId}`}>
                    <Thumb ex={ref.exercise} />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-tight">{ref.exercise.name}</p>
                    <p className="text-[11px] text-ink-300">
                      {ref.muscle.name} · {ref.portion.name}
                    </p>
                    {last && <p className="text-[11px] text-gold-300">Último: {last.sets.map((s) => `${s.kg || "–"}kg×${s.reps || "–"}`).join(" ")}</p>}
                  </div>
                  <div className="flex flex-col">
                    <button onClick={() => moveItem(w.id, i, -1)} className="px-2 text-ink-300 disabled:opacity-30" disabled={i === 0} aria-label="Subir">
                      ▲
                    </button>
                    <button onClick={() => moveItem(w.id, i, 1)} className="px-2 text-ink-300 disabled:opacity-30" disabled={i === w.items.length - 1} aria-label="Descer">
                      ▼
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 text-sm">
                    <button onClick={() => setSets(i, -1)} className="h-8 w-8 rounded-full bg-ink-800">
                      −
                    </button>
                    <span className="w-16 text-center">{it.sets} séries</span>
                    <button onClick={() => setSets(i, 1)} className="h-8 w-8 rounded-full bg-ink-800">
                      +
                    </button>
                  </div>
                  <span className="text-[11px] text-ink-500">{ref.exercise.sets}</span>
                  <button onClick={() => remove(i)} className="text-xs text-flame-400">
                    Remover
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <button onClick={() => setPicking(true)} className="mt-3 w-full rounded-2xl border border-dashed border-gold-400/50 py-3.5 text-sm font-semibold text-gold-400">
          + Adicionar exercício
        </button>

        <button
          onClick={start}
          disabled={!w.items.length}
          className="mt-6 w-full rounded-2xl bg-gold-400 py-4 text-base font-bold text-ink-950 disabled:opacity-40"
        >
          ▶ Iniciar {w.name}
        </button>

        <button
          onClick={() => {
            if (confirm(`Excluir ${w.name}? O histórico já registrado continua salvo.`)) {
              deleteWorkout(w.id);
              nav("/treinos", { replace: true });
            }
          }}
          className="mt-6 w-full py-3 text-sm text-flame-400"
        >
          Excluir treino
        </button>
      </div>

      <ExercisePicker open={picking} onClose={() => setPicking(false)} onPick={(exId) => addToWorkout(w.id, exId)} selected={w.items.map((i) => i.exId)} />
    </div>
  );
}
