import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "../components/ui";
import { suplementos } from "../data/suplementos";
import { EvidenceBadge } from "./SupplementPage";

export default function Supplements() {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? suplementos.filter((s) => `${s.nome} ${s.serve}`.toLowerCase().includes(t)) : suplementos;
  }, [q]);

  return (
    <div>
      <Header title="Suplementos" subtitle={`${suplementos.length} suplementos · guia educativo`} back />
      <div className="space-y-3 px-4 pt-4">
        <p className="rounded-2xl bg-gold-400/10 px-4 py-3 text-xs leading-relaxed text-gold-300 ring-1 ring-gold-400/20">
          Conteúdo educativo. Não substitui a orientação de nutricionista ou médico.
        </p>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar suplemento…"
          className="w-full rounded-2xl bg-ink-800 px-4 py-3 text-sm outline-none ring-1 ring-white/5 placeholder:text-ink-500 focus:ring-gold-400/60"
        />
        <ul className="space-y-2">
          {list.map((s) => (
            <li key={s.id}>
              <Link to={`/suplementos/${s.id}`} className="flex items-center gap-3 rounded-2xl bg-ink-900 px-4 py-3.5 ring-1 ring-white/5 active:scale-[0.99]">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-semibold">
                    {s.nome}
                    {s.restricao && <span className="rounded-full bg-flame-500/15 px-2 py-0.5 text-[10px] font-medium text-flame-400">⚠ Restrições</span>}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-ink-300">{s.serve}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <EvidenceBadge ev={s.evidencia} />
                  <span className="text-lg text-ink-500">›</span>
                </div>
              </Link>
            </li>
          ))}
          {!list.length && <p className="py-6 text-center text-sm text-ink-300">Nenhum suplemento encontrado.</p>}
        </ul>
      </div>
    </div>
  );
}
