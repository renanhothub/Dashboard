import { useRef, useState } from "react";
import { compressPhoto, today } from "../api";
import { postCheckin } from "../social";
import { getState } from "../training";
import { Sheet } from "./ui";

/** Check-in de presença: foto obrigatória, legenda opcional e o treino do dia. */
export default function CheckinSheet({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: (counted: boolean) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const todayKey = today();
  const lastToday = [...getState().sessions].reverse().find((s) => s.finishedAt && today(new Date(s.finishedAt)) === todayKey);
  const [workout, setWorkout] = useState(lastToday?.workoutName ?? "");

  const pick = async (f?: File) => {
    if (!f) return;
    setErr("");
    try {
      setPhoto(await compressPhoto(f));
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  const send = async () => {
    if (!photo) return;
    setBusy(true);
    setErr("");
    try {
      const r = await postCheckin({ photo, caption, workout, day: todayKey });
      setPhoto(null);
      setCaption("");
      onDone(r.countedToday);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title="📸 Check-in de hoje">
      <input ref={input} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
      {photo ? (
        <button onClick={() => input.current?.click()} className="block w-full overflow-hidden rounded-2xl">
          <img src={photo} alt="Prévia" className="aspect-[4/5] w-full object-cover" />
        </button>
      ) : (
        <button
          onClick={() => input.current?.click()}
          className="grid aspect-[4/5] w-full place-items-center rounded-2xl border-2 border-dashed border-gold-400/50 bg-ink-800 text-center"
        >
          <span>
            <span className="block text-4xl">📷</span>
            <span className="mt-2 block text-sm font-semibold text-gold-400">Tirar foto ou escolher da galeria</span>
            <span className="mt-1 block text-xs text-ink-300">A foto é obrigatória e fica visível para seus amigos</span>
          </span>
        </button>
      )}
      <input
        value={workout}
        onChange={(e) => setWorkout(e.target.value)}
        placeholder="Treino do dia (ex.: Treino A — Peito)"
        className="mt-3 w-full rounded-2xl bg-ink-800 px-4 py-3 text-sm outline-none ring-1 ring-white/5 focus:ring-gold-400/60"
      />
      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Legenda (opcional)"
        rows={2}
        maxLength={280}
        className="mt-2 w-full rounded-2xl bg-ink-800 px-4 py-3 text-sm outline-none ring-1 ring-white/5 focus:ring-gold-400/60"
      />
      {err && <p className="mt-2 text-sm text-flame-400">{err}</p>}
      <button onClick={send} disabled={!photo || busy} className="mt-3 w-full rounded-2xl bg-gold-400 py-3.5 text-sm font-bold text-ink-950 disabled:opacity-40">
        {busy ? "Enviando…" : "Publicar e marcar presença"}
      </button>
    </Sheet>
  );
}
