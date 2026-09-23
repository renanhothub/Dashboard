import { useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAccount } from "../account";
import CheckinSheet from "../components/CheckinSheet";
import { Avatar, CheckinCard } from "../components/social-ui";
import { Header } from "../components/ui";
import { fmtDay, getGroup, groupFeed, leaveGroup, shareInvite, type Checkin, type GroupSummary, type RankRow } from "../social";

const medal = (i: number) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}º`);

export default function GroupPage() {
  const { id } = useParams();
  const { user } = useAccount();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [tab, setTab] = useState<"ranking" | "fotos">("ranking");
  const [data, setData] = useState<{ group: GroupSummary; ranking: RankRow[] } | null>(null);
  const [feed, setFeed] = useState<Checkin[]>([]);
  const [more, setMore] = useState(true);
  const [err, setErr] = useState("");
  const [shared, setShared] = useState("");
  const [checkin, setCheckin] = useState(false);

  const load = useCallback(async () => {
    try {
      const [d, f] = await Promise.all([getGroup(id!), groupFeed(id!)]);
      setData(d);
      setFeed(f);
      setMore(f.length === 30);
    } catch (e) {
      setErr((e as Error).message);
    }
  }, [id]);
  useEffect(() => {
    if (user) load();
  }, [load, user]);

  if (!user) return <Navigate to="/amigos" replace />;
  if (err) return <p className="p-6 text-center text-sm text-flame-400">{err}</p>;
  if (!data) return <p className="p-6 text-center text-sm text-ink-300">Carregando…</p>;
  const { group, ranking } = data;
  const max = Math.max(1, ...ranking.map((r) => r.days));
  const period = `${fmtDay(group.startsOn)} → ${group.endsOn ? fmtDay(group.endsOn) : "sem data de fim"}`;

  const invite = async () => {
    const r = await shareInvite(group);
    setShared(r === "copied" ? "Convite copiado! Cole no WhatsApp para os amigos." : "");
  };

  return (
    <div>
      <Header title={group.name} subtitle={`${group.members} participantes · ${period}`} back />
      <div className="px-4 pt-4">
        <div className={`rounded-3xl p-4 ring-1 ${params.get("novo") ? "bg-gold-400/15 ring-gold-400/40" : "bg-ink-900 ring-white/5"}`}>
          {params.get("novo") && <p className="mb-2 text-sm font-semibold text-gold-300">Competição criada! Agora convide seus amigos 👇</p>}
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-ink-500">Código de convite</p>
              <p className="text-2xl font-bold tracking-[0.25em]">{group.code}</p>
            </div>
            <button onClick={invite} className="rounded-2xl bg-gold-400 px-4 py-3 text-sm font-bold text-ink-950">
              Convidar amigos
            </button>
          </div>
          {shared && <p className="mt-2 text-xs text-emerald-300">{shared}</p>}
        </div>

        <button onClick={() => setCheckin(true)} className="mt-3 w-full rounded-2xl bg-ink-800 py-3.5 text-sm font-semibold text-gold-400">
          📸 Fazer check-in de hoje
        </button>

        <div className="mt-4 grid grid-cols-2 gap-1 rounded-full bg-ink-800 p-1 text-sm">
          {(["ranking", "fotos"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-full py-2 font-medium ${tab === t ? "bg-ink-950 text-white" : "text-ink-300"}`}>
              {t === "ranking" ? "🏆 Ranking" : `📷 Fotos (${feed.length}${more ? "+" : ""})`}
            </button>
          ))}
        </div>

        {tab === "ranking" ? (
          <ol className="mt-4 space-y-2">
            {ranking.map((r, i) => (
              <li key={r.id} className={`flex items-center gap-3 rounded-2xl p-3 ring-1 ${r.id === user.id ? "bg-gold-400/10 ring-gold-400/40" : "bg-ink-900 ring-white/5"}`}>
                <span className="w-8 text-center text-lg font-bold">{medal(i)}</span>
                <Avatar id={r.id} name={r.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {r.name}
                    {r.id === user.id && <span className="text-gold-300"> (você)</span>}
                  </p>
                  <div className="mt-1 h-1.5 rounded-full bg-ink-800">
                    <div className="h-1.5 rounded-full bg-gold-400" style={{ width: `${(r.days / max) * 100}%` }} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{r.days}</p>
                  <p className="text-[10px] text-ink-500">{r.days === 1 ? "dia" : "dias"}</p>
                </div>
              </li>
            ))}
            <p className="pt-2 text-center text-[11px] text-ink-500">1 ponto por dia com check-in com foto. Empate: quem treinou mais recentemente.</p>
          </ol>
        ) : (
          <div className="mt-4 space-y-4">
            {feed.length === 0 && <p className="pt-8 text-center text-sm text-ink-300">Ninguém fez check-in ainda. Seja o primeiro! 📸</p>}
            {feed.map((c) => (
              <CheckinCard key={c.id} c={c} meId={user.id} onDeleted={load} />
            ))}
            {more && feed.length > 0 && (
              <button
                onClick={async () => {
                  const next = await groupFeed(id!, feed[feed.length - 1].id);
                  setFeed([...feed, ...next]);
                  setMore(next.length === 30);
                }}
                className="w-full rounded-2xl bg-ink-800 py-3 text-sm text-ink-300"
              >
                Carregar mais
              </button>
            )}
          </div>
        )}

        <button
          onClick={async () => {
            if (!confirm(`Sair de "${group.name}"? Seus check-ins continuam salvos.`)) return;
            await leaveGroup(group.id);
            nav("/amigos", { replace: true });
          }}
          className="mt-8 w-full py-3 text-sm text-flame-400"
        >
          Sair da competição
        </button>
      </div>

      <CheckinSheet
        open={checkin}
        onClose={() => setCheckin(false)}
        onDone={() => {
          setCheckin(false);
          setTab("fotos");
          load();
        }}
      />
    </div>
  );
}
