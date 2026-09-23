import { useMemo, useState } from "react";
import { allExercises, byLevel, muscles } from "../data";
import { Sheet, Thumb } from "./ui";

/** Seleção de exercícios para adicionar a um treino. */
export default function ExercisePicker({ open, onClose, onPick, selected }: { open: boolean; onClose: () => void; onPick: (id: string) => void; selected: string[] }) {
  const [q, setQ] = useState("");
  const [muscle, setMuscle] = useState(muscles[0].id);
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (t.length >= 2) return allExercises.filter((r) => `${r.exercise.name} ${r.exercise.equipment} ${r.muscle.name}`.toLowerCase().includes(t));
    const m = muscles.find((x) => x.id === muscle)!;
    return m.portions.flatMap((portion) => byLevel(portion.exercises).map((exercise) => ({ muscle: m, portion, exercise })));
  }, [q, muscle]);

  return (
    <Sheet open={open} onClose={onClose} title="Adicionar exercício">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar…"
        className="w-full rounded-2xl bg-ink-800 px-4 py-2.5 text-sm outline-none ring-1 ring-white/5 focus:ring-gold-400/60"
      />
      {q.trim().length < 2 && (
        <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4">
          {muscles.map((m) => (
            <button
              key={m.id}
              onClick={() => setMuscle(m.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${m.id === muscle ? "bg-gold-400 text-ink-950" : "bg-ink-800 text-ink-300"}`}
            >
              {m.name}
            </button>
          ))}
        </div>
      )}
      <ul className="mt-3 space-y-2">
        {list.map(({ exercise, portion }) => {
          const on = selected.includes(exercise.id);
          return (
            <li key={exercise.id}>
              <button
                disabled={on}
                onClick={() => onPick(exercise.id)}
                className="flex w-full items-center gap-3 rounded-2xl bg-ink-800/60 p-2 text-left disabled:opacity-50"
              >
                <Thumb ex={exercise} />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium leading-tight">{exercise.name}</span>
                  <span className="block text-[11px] text-ink-300">{portion.name}</span>
                </span>
                <span className={`mr-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-lg ${on ? "bg-ink-700 text-ink-300" : "bg-gold-400 text-ink-950"}`}>
                  {on ? "✓" : "+"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Sheet>
  );
}
