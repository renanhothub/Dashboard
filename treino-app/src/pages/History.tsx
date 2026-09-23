import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { findExercise } from "../data";
import { Header } from "../components/ui";
import { deleteSession, doneSets, fmtDate, fmtDuration, fmtKg, sessionVolume, useTraining } from "../training";

export default function History() {
  const { sessions } = useTraining();
  const [params] = useSearchParams();
  const fresh = params.get("nova");
  const [open, setOpen] = useState<string | null>(fresh);
  const list = [...sessions].reverse();
  const weekAgo = Date.now() - 7 * 864e5;
  const thisWeek = sessions.filter((s) => (s.finishedAt ?? 0) > weekAgo);

  return (
    <div>
      <Header title="Histórico" subtitle="Seus treinos registrados" />
      <div className="px-4 pt-4">
        {fresh && (
          <div className="mb-4 rounded-3xl bg-emerald-500/15 p-4 text-sm text-emerald-200 ring-1 ring-emerald-400/30">
            <p className="text-base font-semibold">Treino concluído! 💪</p>
            <p>Tudo registrado. Na próxima vez, as cargas de hoje aparecem como referência.</p>
          </div>
        )}
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            ["Treinos", sessions.length],
            ["Nos últimos 7 dias", thisWeek.length],
            ["Volume 7 dias", fmtKg(thisWeek.reduce((t, s) => t + sessionVolume(s), 0))],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-ink-900 p-3 ring-1 ring-white/5">
              <p className="text-lg font-bold">{v}</p>
              <p className="text-[10px] uppercase tracking-wider text-ink-500">{k}</p>
            </div>
          ))}
        </div>

        {list.length === 0 && <p className="pt-12 text-center text-sm text-ink-300">Nenhum treino registrado ainda. Monte um treino e toque em Iniciar.</p>}

        <ul className="mt-4 space-y-3">
          {list.map((s) => {
            const isOpen = open === s.id;
            return (
              <li key={s.id} className="rounded-3xl bg-ink-900 ring-1 ring-white/5">
                <button onClick={() => setOpen(isOpen ? null : s.id)} className="flex w-full items-center justify-between p-4 text-left">
                  <div>
                    <p className="font-semibold">{s.workoutName}</p>
                    <p className="text-xs text-ink-300">
                      {fmtDate(s.finishedAt ?? s.startedAt)} · {fmtDuration((s.finishedAt ?? s.startedAt) - s.startedAt)} · {doneSets(s)} séries
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gold-300">{fmtKg(sessionVolume(s))}</span>
                </button>
                {isOpen && (
                  <div className="border-t border-white/5 px-4 pb-4 pt-2">
                    {s.entries.map((e) => {
                      const done = e.sets.filter((x) => x.done);
                      if (!done.length) return null;
                      return (
                        <div key={e.exId} className="py-2">
                          <p className="text-sm font-medium">{findExercise(e.exId)?.exercise.name ?? e.exId}</p>
                          <p className="mt-0.5 text-xs text-ink-300">
                            {done.map((x, i) => (
                              <span key={i} className="mr-2 inline-block rounded-md bg-ink-800 px-1.5 py-0.5">
                                {x.kg || "–"} kg × {x.reps || "–"}
                              </span>
                            ))}
                          </p>
                        </div>
                      );
                    })}
                    <button
                      onClick={() => confirm("Apagar este registro?") && deleteSession(s.id)}
                      className="mt-2 text-xs text-flame-400"
                    >
                      Apagar registro
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
