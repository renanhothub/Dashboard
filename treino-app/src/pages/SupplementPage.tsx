import type { ReactNode } from "react";
import { useParams } from "react-router-dom";
import { Header } from "../components/ui";
import { aviso, suplementos, type Evidencia } from "../data/suplementos";

const evColor: Record<Evidencia, string> = {
  Forte: "bg-emerald-500/15 text-emerald-300",
  Moderada: "bg-gold-400/15 text-gold-300",
  Fraca: "bg-ink-700 text-ink-300",
};

export function EvidenceBadge({ ev }: { ev: Evidencia }) {
  return <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${evColor[ev]}`}>Evidência {ev.toLowerCase()}</span>;
}

function Block({ title, tone = "plain", children }: { title: string; tone?: "plain" | "good" | "bad" | "dose" | "alert"; children: ReactNode }) {
  const tones = {
    plain: "bg-ink-900 ring-white/5",
    good: "bg-emerald-500/[0.07] ring-emerald-400/20",
    bad: "bg-flame-500/[0.07] ring-flame-400/20",
    dose: "bg-gold-400/[0.07] ring-gold-400/20",
    alert: "bg-flame-500/10 ring-2 ring-flame-500/60",
  };
  const titleTone = { plain: "text-gold-400", good: "text-emerald-300", bad: "text-flame-400", dose: "text-gold-300", alert: "text-flame-400" };
  return (
    <section className={`rounded-2xl p-4 ring-1 ${tones[tone]}`}>
      <h2 className={`mb-2 text-xs font-semibold uppercase tracking-wider ${titleTone[tone]}`}>{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-ink-300">{children}</div>
    </section>
  );
}

const List = ({ items }: { items: string[] }) => (
  <ul className="list-disc space-y-1 pl-5 marker:text-gold-500">
    {items.map((x) => (
      <li key={x}>{x}</li>
    ))}
  </ul>
);

export default function SupplementPage() {
  const { id } = useParams();
  const s = suplementos.find((x) => x.id === id);
  if (!s)
    return (
      <div>
        <Header title="Suplemento" back />
        <p className="p-6 text-center text-sm text-ink-300">Suplemento não encontrado.</p>
      </div>
    );

  const naoDeve = (
    <Block title={s.restricao ? "⚠ Atenção — quem NÃO deve tomar" : "Quem não deveria tomar"} tone={s.restricao ? "alert" : "bad"}>
      <List items={s.quemNaoDeve} />
    </Block>
  );

  return (
    <div>
      <Header title={s.nome} subtitle={s.resumo} back />
      <div className="space-y-3 px-4 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <EvidenceBadge ev={s.evidencia} />
          {s.evidenciaNota && <span className="text-xs text-ink-500">{s.evidenciaNota}</span>}
        </div>

        {s.restricao && naoDeve}

        <Block title="Para que serve">
          <p className="font-medium text-white">{s.serve}</p>
        </Block>
        <Block title="O que é">
          <p>{s.oque}</p>
        </Block>
        <Block title="Benefícios">
          <List items={s.beneficios} />
        </Block>
        <Block title="Dose comum" tone="dose">
          <p>{s.dose}</p>
        </Block>
        <Block title="✓ Melhor horário" tone="good">
          <p className="font-medium text-white">{s.melhorHorario}</p>
          <p>
            <b className="text-ink-300">Por quê:</b> {s.porqueMelhor}
          </p>
        </Block>
        <Block title="✕ Horário ou uso a evitar" tone="bad">
          <p className="font-medium text-white">{s.evitar}</p>
          <p>
            <b className="text-ink-300">Por quê:</b> {s.porqueEvitar}
          </p>
        </Block>
        <Block title="Quem deveria tomar" tone="good">
          <List items={s.quemDeve} />
        </Block>
        {!s.restricao && naoDeve}
        <Block title="Mitos e verdades">
          {s.mitos.map(([m, v]) => (
            <div key={m}>
              <p className="font-medium text-white">{m}</p>
              <p>{v}</p>
            </div>
          ))}
        </Block>

        <aside className="rounded-2xl border border-gold-400/30 bg-gold-400/[0.06] p-4 text-xs leading-relaxed text-ink-300">
          <b className="text-gold-300">Aviso importante.</b> {aviso}
        </aside>
      </div>
    </div>
  );
}
