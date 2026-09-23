import { useSyncExternalStore } from "react";
import { api, ApiError, getToken, setToken, type User } from "./api";
import { getState, mergeStates, replaceState, subscribe, type State } from "./training";

/** Conta do usuário + sincronização dos treinos entre aparelhos. */

type SyncStatus = "off" | "syncing" | "ok" | "error";
interface Account {
  user: User | null;
  status: SyncStatus;
  lastSync: number;
}

const USER_KEY = "treino-pro:user";
let account: Account = {
  user: (() => {
    try {
      return getToken() ? JSON.parse(localStorage.getItem(USER_KEY) ?? "null") : null;
    } catch {
      return null;
    }
  })(),
  status: "off",
  lastSync: 0,
};
const listeners = new Set<() => void>();
function setAccount(patch: Partial<Account>) {
  account = { ...account, ...patch };
  try {
    if (account.user) localStorage.setItem(USER_KEY, JSON.stringify(account.user));
    else localStorage.removeItem(USER_KEY);
  } catch {
    /* sem armazenamento */
  }
  listeners.forEach((l) => l());
}

export function useAccount() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => account,
  );
}

/** Dados que vão para a nuvem (a sessão em andamento fica só no aparelho). */
const cloudData = (s: State) => ({ ...s, active: null });

let pushing = false;
let pushTimer: ReturnType<typeof setTimeout> | undefined;

async function push() {
  if (!account.user) return;
  pushing = true;
  setAccount({ status: "syncing" });
  try {
    await api("/sync", { method: "PUT", body: { data: cloudData(getState()) } });
    setAccount({ status: "ok", lastSync: Date.now() });
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) return logout(false);
    setAccount({ status: "error" });
  } finally {
    pushing = false;
  }
}

/** Baixa os dados da conta, junta com os do aparelho e envia o resultado. */
export async function syncNow() {
  if (!account.user) return;
  setAccount({ status: "syncing" });
  try {
    const { data } = await api<{ data: Partial<State> | null }>("/sync");
    replaceState(mergeStates(getState(), data));
    await push();
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) return logout(false);
    setAccount({ status: "error" });
  }
}

// Envia automaticamente (com atraso) a cada alteração local
let lastChanged = getState().changedAt;
subscribe(() => {
  const st = getState();
  if (st.changedAt === lastChanged) return;
  lastChanged = st.changedAt;
  if (!account.user || pushing) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(push, 1500);
});

async function onAuth(res: { token: string; user: User }) {
  setToken(res.token);
  setAccount({ user: res.user });
  await syncNow();
}

export const login = (email: string, password: string) => api<{ token: string; user: User }>("/auth/login", { body: { email, password } }).then(onAuth);
export const register = (name: string, email: string, password: string) =>
  api<{ token: string; user: User }>("/auth/register", { body: { name, email, password } }).then(onAuth);

export async function logout(callServer = true) {
  if (callServer) await api("/auth/logout", { method: "POST" }).catch(() => {});
  setToken(null);
  setAccount({ user: null, status: "off" });
}

export async function rename(name: string) {
  const { user } = await api<{ user: User }>("/me", { method: "PUT", body: { name } });
  setAccount({ user });
}

// Ao abrir o app já logado, sincroniza
if (account.user) setTimeout(syncNow, 300);
if (typeof window !== "undefined") window.addEventListener("online", () => account.user && syncNow());
