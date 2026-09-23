import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { login, logout, register, rename, syncNow, useAccount } from "../account";
import { Header } from "../components/ui";
import { Avatar } from "../components/social-ui";
import { getPendingInvite } from "../social";
import { useTraining } from "../training";

const field = "w-full rounded-2xl bg-ink-800 px-4 py-3 text-sm outline-none ring-1 ring-white/5 focus:ring-gold-400/60";

export function AuthForm({ onDone }: { onDone?: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      if (mode === "login") await login(email, password);
      else await register(name, email, password);
      onDone?.();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-2 gap-1 rounded-full bg-ink-800 p-1 text-sm">
        {(["register", "login"] as const).map((m) => (
          <button type="button" key={m} onClick={() => setMode(m)} className={`rounded-full py-2 font-medium ${mode === m ? "bg-ink-950 text-white" : "text-ink-300"}`}>
            {m === "register" ? "Criar conta" : "Entrar"}
          </button>
        ))}
      </div>
      {mode === "register" && <input className={field} placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />}
      <input className={field} placeholder="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      <input
        className={field}
        placeholder="Senha (mín. 6 caracteres)"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete={mode === "login" ? "current-password" : "new-password"}
      />
      {err && <p className="text-sm text-flame-400">{err}</p>}
      <button disabled={busy} className="w-full rounded-2xl bg-gold-400 py-3.5 text-sm font-bold text-ink-950 disabled:opacity-50">
        {busy ? "Aguarde…" : mode === "register" ? "Criar conta" : "Entrar"}
      </button>
    </form>
  );
}

export default function AccountPage() {
  const { user, status, lastSync } = useAccount();
  const { workouts, sessions, favorites } = useTraining();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");

  const afterAuth = () => {
    const code = getPendingInvite();
    if (code) nav(`/convite/${code}`, { replace: true });
    else if (params.get("voltar")) nav(params.get("voltar")!, { replace: true });
  };

  if (!user)
    return (
      <div>
        <Header title="Sua conta" subtitle="Seus treinos em qualquer aparelho" />
        <div className="px-4 pt-5">
          <div className="mb-5 rounded-3xl bg-ink-900 p-4 text-sm text-ink-300 ring-1 ring-white/5">
            <p className="font-semibold text-white">Com a conta você:</p>
            <ul className="mt-2 space-y-1">
              <li>☁️ Guarda treinos, cargas e histórico na nuvem</li>
              <li>📱 Acessa de qualquer celular ou computador</li>
              <li>🏆 Compete com os amigos com check-in por foto</li>
            </ul>
            {(workouts.length > 0 || sessions.length > 0) && (
              <p className="mt-3 text-xs text-gold-300">Os treinos que você já tem neste aparelho serão enviados para a conta.</p>
            )}
          </div>
          <AuthForm onDone={afterAuth} />
        </div>
      </div>
    );

  const statusText = { off: "", syncing: "Sincronizando…", ok: "Tudo salvo na nuvem", error: "Sem conexão — tentaremos de novo" }[status];

  return (
    <div>
      <Header title="Sua conta" />
      <div className="space-y-4 px-4 pt-5">
        <div className="flex items-center gap-4 rounded-3xl bg-ink-900 p-4 ring-1 ring-white/5">
          <Avatar id={user.id} name={user.name} size={56} />
          <div className="min-w-0 flex-1">
            {editing ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await rename(name).catch((er) => alert(er.message));
                  setEditing(false);
                }}
                className="flex gap-2"
              >
                <input className={field + " py-2"} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
                <button className="rounded-xl bg-gold-400 px-3 text-sm font-semibold text-ink-950">OK</button>
              </form>
            ) : (
              <button onClick={() => (setName(user.name), setEditing(true))} className="text-left">
                <p className="text-lg font-semibold">{user.name} ✎</p>
              </button>
            )}
            <p className="truncate text-sm text-ink-300">{user.email}</p>
          </div>
        </div>

        <div className="rounded-3xl bg-ink-900 p-4 ring-1 ring-white/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Sincronização</p>
              <p className={`text-xs ${status === "error" ? "text-flame-400" : "text-ink-300"}`}>
                {statusText}
                {status === "ok" && lastSync ? ` · ${new Date(lastSync).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` : ""}
              </p>
            </div>
            <button onClick={syncNow} className="rounded-full bg-ink-800 px-4 py-2 text-sm">
              ⟳ Agora
            </button>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[
              ["Treinos", workouts.length],
              ["Sessões", sessions.length],
              ["Favoritos", favorites.length],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-ink-800 p-2">
                <p className="text-lg font-bold">{v}</p>
                <p className="text-[10px] uppercase tracking-wider text-ink-500">{k}</p>
              </div>
            ))}
          </div>
        </div>

        <Link to="/favoritos" className="flex items-center justify-between rounded-3xl bg-ink-900 p-4 ring-1 ring-white/5">
          <span className="text-sm font-semibold">★ Exercícios favoritos</span>
          <span className="text-ink-300">›</span>
        </Link>

        <button onClick={() => confirm("Sair da conta neste aparelho?") && logout()} className="w-full py-3 text-sm text-flame-400">
          Sair da conta
        </button>
      </div>
    </div>
  );
}
