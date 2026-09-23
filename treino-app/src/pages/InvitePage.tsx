import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAccount } from "../account";
import { Header } from "../components/ui";
import { inviteInfo, joinGroup, setPendingInvite } from "../social";
import { AuthForm } from "./AccountPage";

/** Tela aberta pelo link de convite: #/convite/CODIGO */
export default function InvitePage() {
  const { code = "" } = useParams();
  const { user } = useAccount();
  const nav = useNavigate();
  const [info, setInfo] = useState<{ name: string; owner: string } | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    inviteInfo(code)
      .then(setInfo)
      .catch((e) => setErr(e.message));
  }, [code]);
  useEffect(() => {
    if (!user) setPendingInvite(code);
  }, [user, code]);

  const join = async () => {
    try {
      const g = await joinGroup(code);
      setPendingInvite(null);
      nav(`/amigos/${g.id}`, { replace: true });
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  return (
    <div>
      <Header title="Convite" />
      <div className="px-4 pt-6">
        {err && <p className="text-center text-sm text-flame-400">{err}</p>}
        {info && (
          <div className="rounded-3xl bg-gradient-to-br from-gold-400/25 to-flame-500/10 p-6 text-center ring-1 ring-gold-400/30">
            <p className="text-4xl">🏆</p>
            <p className="mt-3 text-sm text-ink-300">
              <b className="text-white">{info.owner}</b> te convidou para a competição
            </p>
            <h2 className="mt-1 text-2xl font-bold">{info.name}</h2>
            <p className="mt-2 text-xs text-ink-300">Marque presença com foto a cada treino e dispute o ranking.</p>
          </div>
        )}
        {info &&
          (user ? (
            <button onClick={join} className="mt-6 w-full rounded-2xl bg-gold-400 py-4 text-base font-bold text-ink-950">
              Entrar na competição
            </button>
          ) : (
            <div className="mt-6">
              <p className="mb-3 text-sm text-ink-300">Crie sua conta (ou entre) para participar:</p>
              <AuthForm onDone={join} />
            </div>
          ))}
      </div>
    </div>
  );
}
