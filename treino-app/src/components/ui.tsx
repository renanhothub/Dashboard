import type { ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import type { Exercise, Level } from "../data/types";
import { imageFor } from "../data/images";
import ExerciseAnimation from "../illustration/ExerciseAnimation";
import { useTraining } from "../training";

export function Header({ title, subtitle, back }: { title: string; subtitle?: string; back?: boolean }) {
  const nav = useNavigate();
  return (
    <header className="pt-safe sticky top-0 z-10 border-b border-white/5 bg-ink-950/90 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-3">
        {back && (
          <button onClick={() => nav(-1)} aria-label="Voltar" className="-ml-1 grid h-9 w-9 place-items-center rounded-full bg-ink-800 text-lg">
            ‹
          </button>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="truncate text-xs text-ink-300">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
}

const levelColor: Record<Level, string> = {
  Iniciante: "bg-emerald-500/15 text-emerald-300",
  Intermediário: "bg-gold-400/15 text-gold-300",
  Avançado: "bg-flame-500/15 text-flame-400",
};

export function LevelBadge({ level }: { level: Level }) {
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${levelColor[level]}`}>{level}</span>;
}

/** Cartão branco com a ilustração em dois quadros (início → fim). */
export function Illustration({ ex, mode = "pair", labels }: { ex: Exercise; mode?: "pair" | "anim"; labels?: boolean }) {
  const img = imageFor(ex.id);
  if (img)
    return (
      <div className="overflow-hidden rounded-2xl bg-white">
        <img src={img} alt={ex.name} loading="lazy" className="block aspect-[21/10] w-full object-contain" />
      </div>
    );
  return (
    <div className="overflow-hidden rounded-2xl bg-white">
      <ExerciseAnimation anim={ex.anim} mode={mode} className="block w-full" title={ex.name} />
      {labels && mode === "pair" && (
        <div className="grid grid-cols-2 pb-2 text-center text-[11px] font-medium uppercase tracking-wider text-neutral-400">
          <span>Início</span>
          <span>Fim</span>
        </div>
      )}
    </div>
  );
}

export function ExerciseCard({ ex, to, right }: { ex: Exercise; to: string; right?: ReactNode }) {
  return (
    <Link to={to} className="block rounded-3xl bg-ink-900 p-3 ring-1 ring-white/5 active:scale-[0.99]">
      <Illustration ex={ex} />
      <div className="mt-3 flex items-start justify-between gap-2 px-1">
        <div className="min-w-0">
          <h3 className="font-semibold leading-tight">{ex.name}</h3>
          <p className="mt-0.5 truncate text-xs text-ink-300">{ex.equipment}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <LevelBadge level={ex.level} />
          {right}
        </div>
      </div>
    </Link>
  );
}

export function BottomNav() {
  const { active } = useTraining();
  const { pathname } = useLocation();
  const item = ({ isActive }: { isActive: boolean }) =>
    `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${isActive ? "text-gold-400" : "text-ink-300"}`;
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-20 border-t border-white/5 bg-ink-950/95 backdrop-blur">
      {active && pathname !== "/sessao" && (
        <Link to="/sessao" className="mx-auto flex max-w-md items-center justify-between bg-gold-400 px-4 py-2 text-sm font-semibold text-ink-950">
          <span>● {active.workoutName} em andamento</span>
          <span>Continuar ›</span>
        </Link>
      )}
      <div className="mx-auto flex max-w-md">
        <NavLink to="/" end className={item}>
          <span className="text-lg">◎</span>Músculos
        </NavLink>
        <NavLink to="/treinos" className={item}>
          <span className="text-lg">▤</span>Treinos
        </NavLink>
        <NavLink to="/historico" className={item}>
          <span className="text-lg">↺</span>Histórico
        </NavLink>
        <NavLink to="/favoritos" className={item}>
          <span className="text-lg">★</span>Favoritos
        </NavLink>
      </div>
    </nav>
  );
}

/** Miniatura do exercício (imagem ou ilustração). */
export function Thumb({ ex, className = "w-24" }: { ex: Exercise; className?: string }) {
  return (
    <div className={`shrink-0 ${className}`}>
      <Illustration ex={ex} />
    </div>
  );
}

/** Painel que sobe da parte de baixo da tela. */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div className="pb-safe max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-ink-900 p-4 ring-1 ring-white/10" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-ink-700" />
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-full bg-ink-800 px-3 py-1 text-sm text-ink-300">
            Fechar
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
