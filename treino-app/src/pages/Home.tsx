import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { allExercises, muscles } from "../data";
import { Illustration } from "../components/ui";

export default function Home() {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (t.length < 2) return [];
    return allExercises.filter((r) => `${r.exercise.name} ${r.exercise.equipment} ${r.muscle.name} ${r.portion.name}`.toLowerCase().includes(t)).slice(0, 20);
  }, [q]);

  return (
    <div>
      <header className="pt-safe px-4 pb-2">
        <div className="flex items-center justify-between pt-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold-400">Evolution</p>
          <Link to="/favoritos" className="rounded-full bg-ink-800 px-3 py-1.5 text-xs text-gold-300">
            ★ Favoritos
          </Link>
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Qual músculo hoje?</h1>
        <p className="mt-1 text-sm text-ink-300">
          {muscles.length} grupos · {allExercises.length} exercícios com execução ilustrada
        </p>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar exercício ou aparelho…"
          className="mt-4 w-full rounded-2xl bg-ink-800 px-4 py-3 text-sm outline-none ring-1 ring-white/5 placeholder:text-ink-500 focus:ring-gold-400/60"
        />
      </header>

      {results.length > 0 ? (
        <ul className="space-y-2 px-4 pt-2">
          {results.map(({ muscle, portion, exercise }) => (
            <li key={exercise.id}>
              <Link to={`/exercicio/${exercise.id}`} className="flex items-center gap-3 rounded-2xl bg-ink-900 p-2 ring-1 ring-white/5">
                <div className="w-32 shrink-0">
                  <Illustration ex={exercise} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{exercise.name}</p>
                  <p className="truncate text-xs text-ink-300">
                    {muscle.name} › {portion.name}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4 pt-3">
          {muscles.map((m) => {
            const first = m.portions[0].exercises[0];
            const total = m.portions.reduce((n, p) => n + p.exercises.length, 0);
            return (
              <Link key={m.id} to={`/musculo/${m.id}`} className="rounded-3xl bg-ink-900 p-2 ring-1 ring-white/5 active:scale-[0.98]">
                <Illustration ex={first} mode="anim" />
                <div className="px-1.5 pb-1 pt-2">
                  <h2 className="font-semibold">{m.name}</h2>
                  <p className="text-[11px] text-ink-300">
                    {m.portions.length} porções · {total} exercícios
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
