import { useSyncExternalStore } from "react";
import { findExercise } from "./data";

/** Treinos montados pelo usuário e registro das sessões, salvos no próprio aparelho. */

export interface WorkoutItem {
  exId: string;
  sets: number;
}
export interface Workout {
  id: string;
  name: string;
  items: WorkoutItem[];
  createdAt: number;
  updatedAt?: number;
}
export interface SetLog {
  kg: string;
  reps: string;
  done: boolean;
}
export interface SessionEntry {
  exId: string;
  sets: SetLog[];
}
export interface Session {
  id: string;
  workoutId: string;
  workoutName: string;
  startedAt: number;
  finishedAt?: number;
  entries: SessionEntry[];
}
export interface State {
  workouts: Workout[];
  sessions: Session[];
  active: Session | null;
  favorites: string[];
  favoritesAt: number;
  /** Ids apagados (para a exclusão valer também nos outros aparelhos). */
  deleted: string[];
  /** Última alteração local. */
  changedAt: number;
}

const KEY = "treino-pro:treinos";
const empty: State = { workouts: [], sessions: [], active: null, favorites: [], favoritesAt: 0, deleted: [], changedAt: 0 };

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    const st: State = raw ? { ...empty, ...JSON.parse(raw) } : { ...empty };
    // Migra favoritos da versão anterior
    const oldFav = localStorage.getItem("treino-pro:favoritos");
    if (oldFav && !st.favorites.length) {
      st.favorites = JSON.parse(oldFav);
      st.favoritesAt = Date.now();
      localStorage.removeItem("treino-pro:favoritos");
    }
    return st;
  } catch {
    return { ...empty };
  }
}

let state: State = load();
const listeners = new Set<() => void>();

function set(next: State, { local = true } = {}) {
  state = local ? { ...next, changedAt: Date.now() } : next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* armazenamento indisponível: mantém só em memória */
  }
  listeners.forEach((l) => l());
}

export const getState = () => state;
/** Substitui o estado (usado pela sincronização com o servidor, sem marcar como alteração local). */
export const replaceState = (next: State) => set(next, { local: false });
export function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useTraining() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

/** Número de séries sugerido pela prescrição do exercício ("4 x 8–12 · 90s" → 4). */
export function defaultSets(exId: string) {
  const s = findExercise(exId)?.exercise.sets ?? "";
  const n = Number(s.match(/^(\d+)\s*x/i)?.[1]);
  return n > 0 && n < 10 ? n : 3;
}

/** Descanso sugerido em segundos ("· 90s" → 90, "· 2–3 min" → 120). */
export function restSeconds(exId: string) {
  const s = findExercise(exId)?.exercise.sets ?? "";
  const rest = s.split("·")[1] ?? "";
  const n = Number(rest.match(/(\d+)/)?.[1]);
  if (!n) return 60;
  return /min/.test(rest) ? n * 60 : n;
}

// ---------- Treinos ----------

export function nextWorkoutName(workouts = state.workouts) {
  const used = new Set(workouts.map((w) => w.name));
  for (let i = 0; i < 26; i++) {
    const name = `Treino ${String.fromCharCode(65 + i)}`;
    if (!used.has(name)) return name;
  }
  return `Treino ${workouts.length + 1}`;
}

export function createWorkout(name = nextWorkoutName(), firstExId?: string): Workout {
  const w: Workout = { id: uid(), name, items: firstExId ? [{ exId: firstExId, sets: defaultSets(firstExId) }] : [], createdAt: Date.now() };
  set({ ...state, workouts: [...state.workouts, w] });
  return w;
}

export function updateWorkout(id: string, fn: (w: Workout) => Workout) {
  set({ ...state, workouts: state.workouts.map((w) => (w.id === id ? { ...fn(w), updatedAt: Date.now() } : w)) });
}

export function deleteWorkout(id: string) {
  set({ ...state, workouts: state.workouts.filter((w) => w.id !== id), deleted: [...state.deleted, id] });
}

export function toggleFavorite(exId: string) {
  const favorites = state.favorites.includes(exId) ? state.favorites.filter((x) => x !== exId) : [...state.favorites, exId];
  set({ ...state, favorites, favoritesAt: Date.now() });
}

export function addToWorkout(id: string, exId: string) {
  updateWorkout(id, (w) => (w.items.some((i) => i.exId === exId) ? w : { ...w, items: [...w.items, { exId, sets: defaultSets(exId) }] }));
}

export function moveItem(id: string, index: number, delta: number) {
  updateWorkout(id, (w) => {
    const items = [...w.items];
    const j = index + delta;
    if (j < 0 || j >= items.length) return w;
    [items[index], items[j]] = [items[j], items[index]];
    return { ...w, items };
  });
}

// ---------- Histórico ----------

/** Última sessão concluída em que o exercício foi feito (para sugerir a carga). */
export function lastPerformance(exId: string, sessions = state.sessions): { date: number; sets: SetLog[] } | null {
  for (let i = sessions.length - 1; i >= 0; i--) {
    const e = sessions[i].entries.find((x) => x.exId === exId);
    const done = e?.sets.filter((s) => s.done && (s.kg || s.reps));
    if (done && done.length) return { date: sessions[i].finishedAt ?? sessions[i].startedAt, sets: done };
  }
  return null;
}

export function exerciseHistory(exId: string, sessions = state.sessions) {
  return sessions
    .map((s) => ({ date: s.finishedAt ?? s.startedAt, workout: s.workoutName, sets: s.entries.find((e) => e.exId === exId)?.sets.filter((x) => x.done) ?? [] }))
    .filter((h) => h.sets.length)
    .reverse();
}

const num = (v: string) => Number(v.replace(",", ".")) || 0;
export const setVolume = (s: SetLog) => (s.done ? num(s.kg) * num(s.reps) : 0);
export const sessionVolume = (s: Session) => s.entries.reduce((t, e) => t + e.sets.reduce((a, x) => a + setVolume(x), 0), 0);
export const doneSets = (s: Session) => s.entries.reduce((t, e) => t + e.sets.filter((x) => x.done).length, 0);
/** Melhor carga registrada em uma série. */
export const bestKg = (sets: SetLog[]) => Math.max(0, ...sets.map((s) => num(s.kg)));

// ---------- Sessão ativa ----------

export function startSession(workoutId: string) {
  const w = state.workouts.find((x) => x.id === workoutId);
  if (!w) return;
  const entries: SessionEntry[] = w.items.map((it) => {
    const last = lastPerformance(it.exId);
    return {
      exId: it.exId,
      sets: Array.from({ length: it.sets }, (_, i) => {
        const prev = last?.sets[Math.min(i, last.sets.length - 1)];
        return { kg: prev?.kg ?? "", reps: prev?.reps ?? "", done: false };
      }),
    };
  });
  set({ ...state, active: { id: uid(), workoutId, workoutName: w.name, startedAt: Date.now(), entries } });
}

export function updateActive(fn: (s: Session) => Session) {
  if (state.active) set({ ...state, active: fn(state.active) });
}

export function updateSet(ei: number, si: number, patch: Partial<SetLog>) {
  updateActive((s) => ({
    ...s,
    entries: s.entries.map((e, i) => (i !== ei ? e : { ...e, sets: e.sets.map((x, j) => (j === si ? { ...x, ...patch } : x)) })),
  }));
}

export function addSet(ei: number) {
  updateActive((s) => ({
    ...s,
    entries: s.entries.map((e, i) => {
      if (i !== ei) return e;
      const last = e.sets[e.sets.length - 1];
      return { ...e, sets: [...e.sets, { kg: last?.kg ?? "", reps: last?.reps ?? "", done: false }] };
    }),
  }));
}

export function removeSet(ei: number) {
  updateActive((s) => ({ ...s, entries: s.entries.map((e, i) => (i === ei && e.sets.length > 1 ? { ...e, sets: e.sets.slice(0, -1) } : e)) }));
}

export function finishSession(): Session | null {
  const s = state.active;
  if (!s) return null;
  const done = { ...s, finishedAt: Date.now() };
  set({ ...state, active: null, sessions: doneSets(done) ? [...state.sessions, done] : state.sessions });
  return done;
}

export function cancelSession() {
  set({ ...state, active: null });
}

export function deleteSession(id: string) {
  set({ ...state, sessions: state.sessions.filter((s) => s.id !== id), deleted: [...state.deleted, id] });
}

/** Junta os dados de dois aparelhos: une treinos e sessões, respeitando exclusões e a versão mais recente. */
export function mergeStates(local: State, remote: Partial<State> | null): State {
  if (!remote) return local;
  const deleted = [...new Set([...(local.deleted ?? []), ...(remote.deleted ?? [])])];
  const gone = new Set(deleted);
  const byId = <T extends { id: string }>(a: T[], b: T[], newer: (x: T, y: T) => T) => {
    const m = new Map<string, T>();
    for (const x of [...a, ...b]) {
      if (gone.has(x.id)) continue;
      const cur = m.get(x.id);
      m.set(x.id, cur ? newer(cur, x) : x);
    }
    return [...m.values()];
  };
  const workouts = byId(local.workouts, remote.workouts ?? [], (x, y) => ((y.updatedAt ?? y.createdAt) > (x.updatedAt ?? x.createdAt) ? y : x)).sort(
    (a, b) => a.createdAt - b.createdAt,
  );
  const sessions = byId(local.sessions, remote.sessions ?? [], (x) => x).sort((a, b) => a.startedAt - b.startedAt);
  const remoteFavNewer = (remote.favoritesAt ?? 0) > local.favoritesAt;
  return {
    ...local,
    workouts,
    sessions,
    favorites: remoteFavNewer ? remote.favorites ?? [] : local.favorites,
    favoritesAt: Math.max(local.favoritesAt, remote.favoritesAt ?? 0),
    deleted: deleted.slice(-500),
  };
}

// ---------- Formatação ----------

export const fmtDate = (t: number) =>
  new Date(t).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" }).replace(".", "");
export const fmtDuration = (ms: number) => {
  const m = Math.round(ms / 60000);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h${String(m % 60).padStart(2, "0")}`;
};
export const fmtKg = (v: number) => `${v.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} kg`;
