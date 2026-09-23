import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { findExercise } from "../data";
import { Header, Thumb } from "../components/ui";
import {
  addSet,
  cancelSession,
  doneSets,
  finishSession,
  fmtDuration,
  fmtKg,
  lastPerformance,
  removeSet,
  restSeconds,
  sessionVolume,
  updateSet,
  useTraining,
} from "../training";

// Descanso guardado fora do componente para sobreviver à navegação entre telas.
let restEnd = 0;
let restTotal = 0;

function useNow(ms = 1000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

function RestTimer({ now, onChange }: { now: number; onChange: () => void }) {
  const left = Math.max(0, Math.ceil((restEnd - now) / 1000));
  useEffect(() => {
    if (restEnd && left === 0) {
      navigator.vibrate?.([200, 100, 200]);
      restEnd = 0;
      onChange();
    }
  }, [left, onChange]);
  if (!restEnd || left === 0) return null;
  const pct = restTotal ? (left / restTotal) * 100 : 0;
  return (
    <div className="fixed inset-x-0 bottom-[118px] z-30 mx-auto max-w-md px-4">
      <div className="overflow-hidden rounded-2xl bg-ink-800 shadow-xl ring-1 ring-gold-400/40">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-ink-300">Descanso</p>
            <p className="text-2xl font-bold tabular-nums">
              {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                restEnd += 15000;
                restTotal += 15;
                onChange();
              }}
              className="rounded-full bg-ink-700 px-3 py-2 text-sm"
            >
              +15s
            </button>
            <button
              onClick={() => {
                restEnd = 0;
                onChange();
              }}
              className="rounded-full bg-gold-400 px-3 py-2 text-sm font-semibold text-ink-950"
            >
              Pular
            </button>
          </div>
        </div>
        <div className="h-1 bg-gold-400 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const cell = "w-full rounded-xl bg-ink-800 px-2 py-2 text-center text-sm font-semibold outline-none ring-1 ring-white/5 focus:ring-gold-400/70";

export default function SessionPage() {
  const { active } = useTraining();
  const nav = useNavigate();
  const now = useNow();
  const [, force] = useState(0);
  const rerender = () => force((n) => n + 1);
  if (!active) return <Navigate to="/treinos" replace />;

  const total = active.entries.reduce((t, e) => t + e.sets.length, 0);
  const done = doneSets(active);

  const toggle = (ei: number, si: number, exId: string, wasDone: boolean) => {
    updateSet(ei, si, { done: !wasDone });
    if (!wasDone) {
      restTotal = restSeconds(exId);
      restEnd = Date.now() + restTotal * 1000;
      rerender();
    }
  };

  const finish = () => {
    if (done < total && !confirm(`Você concluiu ${done} de ${total} séries. Finalizar mesmo assim?`)) return;
    restEnd = 0;
    const s = finishSession();
    nav(s && doneSets(s) ? `/historico?nova=${s.id}` : "/treinos", { replace: true });
  };

  return (
    <div>
      <Header title={active.workoutName} subtitle={`${fmtDuration(now - active.startedAt)} · ${done}/${total} séries · ${fmtKg(sessionVolume(active))}`} back />
      <div className="h-1 bg-ink-800">
        <div className="h-1 bg-gold-400 transition-all" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
      </div>

      <div className="space-y-4 px-4 pt-4">
        {active.entries.map((e, ei) => {
          const ref = findExercise(e.exId);
          if (!ref) return null;
          const last = lastPerformance(e.exId);
          return (
            <section key={e.exId + ei} className="rounded-3xl bg-ink-900 p-3 ring-1 ring-white/5">
              <div className="flex items-center gap-3">
                <Link to={`/exercicio/${e.exId}`}>
                  <Thumb ex={ref.exercise} className="w-28" />
                </Link>
                <div className="min-w-0">
                  <h2 className="font-semibold leading-tight">{ref.exercise.name}</h2>
                  <p className="text-[11px] text-ink-300">Sugestão: {ref.exercise.sets}</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-[2rem_1fr_1fr_1fr_2.75rem] items-center gap-2 px-1 text-[10px] uppercase tracking-wider text-ink-500">
                <span>Série</span>
                <span>Anterior</span>
                <span className="text-center">kg</span>
                <span className="text-center">Reps</span>
                <span />
              </div>
              {e.sets.map((s, si) => {
                const prev = last?.sets[si];
                return (
                  <div key={si} className={`mt-1.5 grid grid-cols-[2rem_1fr_1fr_1fr_2.75rem] items-center gap-2 rounded-xl px-1 py-1 ${s.done ? "bg-emerald-500/10" : ""}`}>
                    <span className="text-center text-sm font-bold text-ink-300">{si + 1}</span>
                    <span className="truncate text-xs text-ink-500">{prev ? `${prev.kg || "–"} × ${prev.reps || "–"}` : "—"}</span>
                    <input className={cell} inputMode="decimal" placeholder="0" value={s.kg} onChange={(ev) => updateSet(ei, si, { kg: ev.target.value })} />
                    <input className={cell} inputMode="numeric" placeholder="0" value={s.reps} onChange={(ev) => updateSet(ei, si, { reps: ev.target.value })} />
                    <button
                      onClick={() => toggle(ei, si, e.exId, s.done)}
                      aria-label={s.done ? "Desmarcar série" : "Concluir série"}
                      className={`h-10 w-11 rounded-xl text-lg font-bold ${s.done ? "bg-emerald-500 text-ink-950" : "bg-ink-800 text-ink-500"}`}
                    >
                      ✓
                    </button>
                  </div>
                );
              })}
              <div className="mt-2 flex gap-2">
                <button onClick={() => addSet(ei)} className="flex-1 rounded-xl bg-ink-800 py-2 text-xs font-medium text-ink-300">
                  + Série
                </button>
                <button onClick={() => removeSet(ei)} disabled={e.sets.length < 2} className="rounded-xl bg-ink-800 px-4 py-2 text-xs text-ink-300 disabled:opacity-30">
                  − Série
                </button>
              </div>
            </section>
          );
        })}

        <button onClick={finish} className="w-full rounded-2xl bg-gold-400 py-4 text-base font-bold text-ink-950">
          Finalizar treino
        </button>
        <button
          onClick={() => {
            if (confirm("Descartar este treino? Nada será salvo.")) {
              restEnd = 0;
              cancelSession();
              nav("/treinos", { replace: true });
            }
          }}
          className="w-full py-3 text-sm text-flame-400"
        >
          Descartar treino
        </button>
      </div>
      <RestTimer now={now} onChange={rerender} />
    </div>
  );
}
