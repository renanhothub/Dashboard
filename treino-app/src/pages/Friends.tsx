import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { today } from "../api";
import { useAccount } from "../account";
import CheckinSheet from "../components/CheckinSheet";
import { Header, Sheet } from "../components/ui";
import { createGroup, joinGroup, listGroups, myCheckins, type GroupSummary } from "../social";
import { AuthForm } from "./AccountPage";

const field = "w-full rounded-2xl bg-ink-800 px-4 py-3 text-sm outline-none ring-1 ring-white/5 focus:ring-gold-400/60";
const medal = (p: number) => (p === 1 ? "🥇" : p === 2 ? "🥈" : p === 3 ? "🥉" : `${p}º`);

export default function Friends() {
  const { user } = useAccount();
  const nav = useNavigate();
  const [groups, setGroups] = useState<GroupSummary[] | null>(null);
  const [checkedToday, setCheckedToday] = useState(false);
  const [err, setErr] = useState("");
  const [sheet, setSheet] = useState<"create" | "join" | "checkin" | null>(null);
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setErr("");
      const [g, mine] = await Promise.all([listGroups(), myCheckins()]);
      setGroups(g);
      setCheckedToday(mine.some((c) => c.day === today()));
    } catch (e) {
      setErr((e as Error).message);
    }
  }, [user]);
  useEffect(() => {
    load();
  }, [load]);

  if (!user)
    return (
      <div>
        <Header title="Convide seus amigos" subtitle="Competição de presença na academia" />
        <div className="px-4 pt-5">
          <div className="rounded-3xl bg-gradient-to-br from-gold-400/25 to-flame-500/10 p-5 ring-1 ring-gold-400/30">
            <p className="text-2xl">🏆</p>
            <h2 className="mt-2 text-lg font-bold">Treinar junto é mais fácil</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-300">
              <li>📸 Marque presença com uma foto do treino</li>
              <li>📊 Ranking de quem foi mais vezes à academia</li>
              <li>👀 Todo mundo da competição vê as fotos e manda 💪</li>
            </ul>
          </div>
          <p className="mb-3 mt-6 text-sm text-ink-300">Crie sua conta para participar:</p>
          <AuthForm />
        </div>
      </div>
    );

  return (
    <div>
      <Header title="Convide seus amigos" subtitle="Competições de presença" />
      <div className="space-y-4 px-4 pt-4">
        <button
          onClick={() => setSheet("checkin")}
          className={`w-full rounded-3xl p-5 text-left ${checkedToday ? "bg-emerald-500/15 ring-1 ring-emerald-400/30" : "bg-gold-400 text-ink-950"}`}
        >
          <p className="text-2xl">{checkedToday ? "✅" : "📸"}</p>
          <p className="mt-1 text-lg font-bold">{checkedToday ? "Presença de hoje marcada!" : "Fazer check-in de hoje"}</p>
          <p className={`text-sm ${checkedToday ? "text-emerald-200" : "text-ink-950/70"}`}>
            {checkedToday ? "Quer postar outra foto? Toque aqui." : "Publique uma foto na academia e some 1 dia no ranking."}
          </p>
        </button>
        {toast && <p className="rounded-2xl bg-emerald-500/15 p-3 text-center text-sm text-emerald-200">{toast}</p>}
        {err && <p className="text-sm text-flame-400">{err}</p>}

        <div className="flex items-center justify-between pt-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gold-400">Suas competições</h2>
        </div>
        {groups === null && !err && <p className="text-sm text-ink-300">Carregando…</p>}
        {groups?.length === 0 && (
          <p className="rounded-3xl bg-ink-900 p-4 text-sm text-ink-300 ring-1 ring-white/5">
            Você ainda não participa de nenhuma. Crie uma e mande o convite para os amigos, ou entre com o código que recebeu.
          </p>
        )}
        {groups?.map((g) => (
          <Link key={g.id} to={`/amigos/${g.id}`} className="block rounded-3xl bg-ink-900 p-4 ring-1 ring-white/5 active:scale-[0.99]">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{g.name}</h3>
              <span className="text-xs text-ink-300">{g.members} participantes</span>
            </div>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold">{medal(g.myPosition)}</p>
                <p className="text-xs text-ink-300">
                  sua posição · {g.myDays} {g.myDays === 1 ? "dia" : "dias"}
                </p>
              </div>
              {g.leader && (
                <p className="text-right text-xs text-ink-300">
                  Líder: <b className="text-white">{g.leader.name}</b>
                  <br />
                  {g.leader.days} {g.leader.days === 1 ? "dia" : "dias"}
                </p>
              )}
            </div>
          </Link>
        ))}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button onClick={() => setSheet("create")} className="rounded-2xl bg-ink-800 py-4 text-sm font-semibold text-gold-400">
            + Criar competição
          </button>
          <button onClick={() => setSheet("join")} className="rounded-2xl bg-ink-800 py-4 text-sm font-semibold">
            Tenho um código
          </button>
        </div>
      </div>

      <CreateSheet open={sheet === "create"} onClose={() => setSheet(null)} onCreated={(g) => nav(`/amigos/${g.id}?novo=1`)} />
      <JoinSheet open={sheet === "join"} onClose={() => setSheet(null)} onJoined={(g) => nav(`/amigos/${g.id}`)} />
      <CheckinSheet
        open={sheet === "checkin"}
        onClose={() => setSheet(null)}
        onDone={(counted) => {
          setSheet(null);
          setToast(counted ? "Presença marcada! +1 dia em todas as suas competições 🔥" : "Foto publicada! (a presença de hoje já estava contada)");
          load();
        }}
      />
    </div>
  );
}

function CreateSheet({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (g: GroupSummary) => void }) {
  const [name, setName] = useState("");
  const [start, setStart] = useState(today());
  const [end, setEnd] = useState("");
  const [err, setErr] = useState("");
  return (
    <Sheet open={open} onClose={onClose} title="Nova competição">
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            onCreated(await createGroup(name, start, end || null));
          } catch (er) {
            setErr((er as Error).message);
          }
        }}
      >
        <input className={field} placeholder="Nome (ex.: Desafio 30 dias da galera)" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-ink-300">
            Começa em
            <input type="date" className={field + " mt-1"} value={start} onChange={(e) => setStart(e.target.value)} />
          </label>
          <label className="text-xs text-ink-300">
            Termina em (opcional)
            <input type="date" className={field + " mt-1"} value={end} min={start} onChange={(e) => setEnd(e.target.value)} />
          </label>
        </div>
        <p className="text-xs text-ink-300">Cada dia com pelo menos um check-in com foto vale 1 ponto no ranking.</p>
        {err && <p className="text-sm text-flame-400">{err}</p>}
        <button className="w-full rounded-2xl bg-gold-400 py-3.5 text-sm font-bold text-ink-950">Criar e convidar amigos</button>
      </form>
    </Sheet>
  );
}

function JoinSheet({ open, onClose, onJoined }: { open: boolean; onClose: () => void; onJoined: (g: GroupSummary) => void }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  return (
    <Sheet open={open} onClose={onClose} title="Entrar com código">
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            onJoined(await joinGroup(code));
          } catch (er) {
            setErr((er as Error).message);
          }
        }}
      >
        <input
          className={field + " text-center text-xl font-bold uppercase tracking-[0.3em]"}
          placeholder="CÓDIGO"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
        />
        {err && <p className="text-sm text-flame-400">{err}</p>}
        <button disabled={code.length < 6} className="w-full rounded-2xl bg-gold-400 py-3.5 text-sm font-bold text-ink-950 disabled:opacity-40">
          Entrar na competição
        </button>
      </form>
    </Sheet>
  );
}
