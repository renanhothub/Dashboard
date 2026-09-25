import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const items = [
  { to: "/suplementos", label: "Suplementos", hint: "Horários, benefícios e cuidados" },
  { to: "/favoritos", label: "Favoritos", hint: "Exercícios que você salvou" },
  { to: "/historico", label: "Histórico", hint: "Treinos concluídos" },
];

/** Botão ☰ que abre o menu lateral com as guias do app. */
export function MenuButton() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="Abrir menu" className="-ml-1 grid h-9 w-9 place-items-center rounded-full bg-ink-800">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-gold-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
      <div
        className={`fixed inset-0 z-50 bg-black/60 transition-opacity duration-200 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      >
        <nav
          className={`pt-safe absolute inset-y-0 left-0 w-[80%] max-w-xs bg-ink-900 ring-1 ring-white/10 transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 pb-4 pt-6">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-400">Evolution</p>
            <button onClick={() => setOpen(false)} aria-label="Fechar menu" className="grid h-9 w-9 place-items-center rounded-full bg-ink-800 text-lg text-ink-300">
              ✕
            </button>
          </div>
          <ul className="space-y-1 px-3">
            {items.map((it) => (
              <li key={it.to}>
                <Link to={it.to} onClick={() => setOpen(false)} className="block rounded-2xl px-3 py-3 active:bg-ink-800">
                  <span className="block text-base font-medium">{it.label}</span>
                  <span className="block text-xs text-ink-300">{it.hint}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
