import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { findExercise } from "../data";
import { Header, Illustration, LevelBadge, Sheet } from "../components/ui";
import { addToWorkout, bestKg, createWorkout, exerciseHistory, fmtDate, useTraining } from "../training";
import { useFavorites } from "../favorites";
import { imageFor } from "../data/images";

export default function ExercisePage() {
  const { id } = useParams();
  const ref = findExercise(id);
  const fav = useFavorites();
  const [mode, setMode] = useState<"pair" | "anim">("pair");
  const { workouts, sessions } = useTraining();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState<string | null>(null);
  if (!ref) return <Navigate to="/" replace />;
  const { muscle, portion, exercise: ex } = ref;
  const isFav = fav.has(ex.id);
  const history = exerciseHistory(ex.id, sessions).slice(0, 5);
  const add = (wid: string, name: string) => {
    addToWorkout(wid, ex.id);
    setAdded(name);
    setAdding(false);
  };

  return (
    <div>
      <Header title={ex.name} subtitle={`${muscle.name} › ${portion.name}`} back />
      <div className="px-4 pt-4">
        <Illustration ex={ex} mode={mode} labels />
        {!imageFor(ex.id) && <div className="mt-3 grid grid-cols-2 gap-1 rounded-full bg-ink-800 p-1 text-sm">
          {(["pair", "anim"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`rounded-full py-2 font-medium ${mode === m ? "bg-ink-950 text-white" : "text-ink-300"}`}>
              {m === "pair" ? "Início e fim" : "Animação"}
            </button>
          ))}
        </div>}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <LevelBadge level={ex.level} />
          <span className="rounded-full bg-ink-800 px-2 py-0.5 text-[11px] text-ink-300">{ex.equipment}</span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-ink-900 p-3 ring-1 ring-white/5">
            <p className="text-[11px] uppercase tracking-wider text-ink-500">Prescrição</p>
            <p className="mt-1 text-sm font-semibold">{ex.sets}</p>
          </div>
          <Link to={`/musculo/${muscle.id}?porcao=${portion.id}`} className="rounded-2xl bg-ink-900 p-3 ring-1 ring-white/5">
            <p className="text-[11px] uppercase tracking-wider text-ink-500">Músculo-alvo</p>
            <p className="mt-1 text-sm font-semibold">
              {muscle.name} · {portion.name}
            </p>
          </Link>
        </div>

        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-400">Execução</h2>
          <ol className="mt-3 space-y-3">
            {ex.steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold-400 text-xs font-bold text-ink-950">{i + 1}</span>
                <p className="text-sm leading-relaxed text-ink-300">{s}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-6 rounded-2xl bg-ink-900 p-4 ring-1 ring-white/5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-flame-400">Dica do personal</h2>
          <ul className="mt-2 space-y-2">
            {ex.tips.map((t, i) => (
              <li key={i} className="text-sm leading-relaxed text-ink-300">
                • {t}
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-6 grid grid-cols-[1fr_auto] gap-2">
          <button onClick={() => setAdding(true)} className="rounded-2xl bg-gold-400 py-3.5 text-sm font-semibold text-ink-950">
            + Adicionar ao treino
          </button>
          <button
            onClick={() => fav.toggle(ex.id)}
            aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            className={`rounded-2xl px-5 text-lg ${isFav ? "bg-ink-800 text-gold-300" : "bg-ink-800 text-ink-300"}`}
          >
            {isFav ? "★" : "☆"}
          </button>
        </div>
        {added && <p className="mt-2 text-center text-xs text-emerald-300">Adicionado ao {added} ✓</p>}

        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-400">Seu histórico</h2>
          {history.length === 0 ? (
            <p className="mt-2 text-sm text-ink-300">Nenhum registro ainda. Adicione a um treino e registre suas séries.</p>
          ) : (
            <ul className="mt-2 space-y-2">
              {history.map((h, i) => (
                <li key={i} className="rounded-2xl bg-ink-900 p-3 ring-1 ring-white/5">
                  <div className="flex justify-between text-xs text-ink-300">
                    <span>
                      {fmtDate(h.date)} · {h.workout}
                    </span>
                    <span className="font-semibold text-gold-300">máx. {bestKg(h.sets)} kg</span>
                  </div>
                  <p className="mt-1 text-xs">
                    {h.sets.map((x, j) => (
                      <span key={j} className="mr-2 inline-block rounded-md bg-ink-800 px-1.5 py-0.5">
                        {x.kg || "–"} kg × {x.reps || "–"}
                      </span>
                    ))}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="mt-8">
          <h2 className="text-sm font-semibold text-ink-300">Outras variações · {portion.name}</h2>
          <div className="no-scrollbar -mx-4 mt-3 flex gap-3 overflow-x-auto px-4">
            {portion.exercises
              .filter((e) => e.id !== ex.id)
              .map((e) => (
                <Link key={e.id} to={`/exercicio/${e.id}`} className="w-44 shrink-0">
                  <Illustration ex={e} />
                  <p className="mt-1.5 text-xs font-medium leading-tight">{e.name}</p>
                </Link>
              ))}
          </div>
        </div>
      </div>

      <Sheet open={adding} onClose={() => setAdding(false)} title="Adicionar a qual treino?">
        <ul className="space-y-2">
          {workouts.map((w) => {
            const has = w.items.some((i) => i.exId === ex.id);
            return (
              <li key={w.id}>
                <button disabled={has} onClick={() => add(w.id, w.name)} className="flex w-full items-center justify-between rounded-2xl bg-ink-800 px-4 py-3 text-left disabled:opacity-50">
                  <span>
                    <span className="block font-semibold">{w.name}</span>
                    <span className="text-xs text-ink-300">{w.items.length} exercícios</span>
                  </span>
                  <span className="text-sm text-gold-400">{has ? "Já está" : "Adicionar"}</span>
                </button>
              </li>
            );
          })}
          <li>
            <button
              onClick={() => {
                const w = createWorkout(undefined, ex.id);
                setAdded(w.name);
                setAdding(false);
              }}
              className="w-full rounded-2xl border border-dashed border-gold-400/50 py-3 text-sm font-semibold text-gold-400"
            >
              + Criar novo treino com este exercício
            </button>
          </li>
        </ul>
      </Sheet>
    </div>
  );
}
