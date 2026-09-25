import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Suplemento } from "../data/suplementos";

/** Botão "☰ Menu" que abre o menu lateral com as guias do app. */
export function MenuButton() {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [suplOpen, setSuplOpen] = useState(false);
  // A lista só é baixada quando a guia é expandida, para não pesar a abertura do app.
  const [lista, setLista] = useState<Suplemento[] | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (suplOpen && !lista) import("../data/suplementos").then((m) => setLista(m.suplementos));
  }, [suplOpen, lista]);

  const abrir = (id: string) => {
    setOpen(false);
    nav(`/suplementos/${id}`);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        className="-ml-1 flex items-center gap-2 rounded-full bg-gold-400/10 py-1.5 pl-2.5 pr-3.5 ring-1 ring-gold-400/50 active:scale-95"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-gold-300" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
        <span className="text-sm font-semibold text-gold-300">Menu</span>
      </button>

      <div
        className={`fixed inset-0 z-50 bg-black/60 transition-opacity duration-200 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      >
        <nav
          className={`pt-safe absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col bg-ink-900 ring-1 ring-white/10 transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 pb-3 pt-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-400">Evolution</p>
            <button onClick={() => setOpen(false)} aria-label="Fechar menu" className="grid h-9 w-9 place-items-center rounded-full bg-ink-800 text-lg text-ink-300">
              ✕
            </button>
          </div>
          <p className="px-5 pb-2 text-[11px] font-semibold uppercase tracking-widest text-ink-500">Guias</p>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-8">
            <button
              onClick={() => setSuplOpen((v) => !v)}
              aria-expanded={suplOpen}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left ring-1 transition-colors ${suplOpen ? "bg-gold-400/10 ring-gold-400/40" : "bg-ink-800 ring-white/5"}`}
            >
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold">Suplementos</span>
                <span className="block text-xs text-ink-300">{suplOpen ? "Escolha um suplemento" : "Toque para ver a lista"}</span>
              </span>
              <span className={`text-xl text-gold-300 transition-transform duration-200 ${suplOpen ? "rotate-90" : ""}`}>›</span>
            </button>

            {suplOpen && (
              <ul className="mt-2 space-y-1 border-l-2 border-gold-400/30 pl-3 ml-4">
                {!lista && <li className="px-3 py-2 text-sm text-ink-500">Carregando…</li>}
                {lista?.map((s) => (
                  <li key={s.id}>
                    <button onClick={() => abrir(s.id)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm active:bg-ink-800">
                      <span className="flex-1">{s.nome}</span>
                      {s.restricao && <span className="text-xs text-flame-400" title="Tem restrições importantes">⚠</span>}
                      <span className="text-ink-500">›</span>
                    </button>
                  </li>
                ))}
                {lista && (
                  <li className="px-3 pt-2 text-[11px] text-ink-500">
                    <span className="text-flame-400">⚠</span> tem restrições importantes
                  </li>
                )}
              </ul>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}
