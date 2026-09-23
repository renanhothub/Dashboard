import { useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { findExercise } from "../data";
import { Header, Illustration, LevelBadge } from "../components/ui";
import { useFavorites } from "../favorites";
import { imageFor } from "../data/images";

export default function ExercisePage() {
  const { id } = useParams();
  const ref = findExercise(id);
  const fav = useFavorites();
  const [mode, setMode] = useState<"pair" | "anim">("pair");
  if (!ref) return <Navigate to="/" replace />;
  const { muscle, portion, exercise: ex } = ref;
  const isFav = fav.has(ex.id);

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

        <button
          onClick={() => fav.toggle(ex.id)}
          className={`mt-6 w-full rounded-2xl py-3.5 text-sm font-semibold ${isFav ? "bg-ink-800 text-gold-300" : "bg-gold-400 text-ink-950"}`}
        >
          {isFav ? "★ Nos favoritos" : "☆ Adicionar aos favoritos"}
        </button>

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
    </div>
  );
}
