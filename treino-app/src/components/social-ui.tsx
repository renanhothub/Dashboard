import { useState } from "react";
import { photoUrl } from "../api";
import { avatarColor, deleteCheckin, fmtDay, initials, likeCheckin, timeAgo, type Checkin } from "../social";

export function Avatar({ id, name, size = 36 }: { id: number; name: string; size?: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-bold text-ink-950"
      style={{ width: size, height: size, background: avatarColor(id), fontSize: size * 0.38 }}
    >
      {initials(name)}
    </span>
  );
}

export function CheckinCard({ c, meId, onDeleted }: { c: Checkin; meId?: number; onDeleted?: () => void }) {
  const [likes, setLikes] = useState({ n: c.likes, on: c.liked });
  const toggle = async () => {
    setLikes((l) => ({ n: l.n + (l.on ? -1 : 1), on: !l.on }));
    const r = await likeCheckin(c.id).catch(() => null);
    if (r) setLikes({ n: r.likes, on: r.liked });
  };
  return (
    <article className="overflow-hidden rounded-3xl bg-ink-900 ring-1 ring-white/5">
      <header className="flex items-center gap-3 p-3">
        <Avatar id={c.userId} name={c.userName} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{c.userName}</p>
          <p className="text-[11px] text-ink-300">
            Check-in de {fmtDay(c.day)} · {timeAgo(c.createdAt)}
          </p>
        </div>
        {c.workout && <span className="max-w-[40%] truncate rounded-full bg-ink-800 px-2 py-1 text-[11px] text-gold-300">{c.workout}</span>}
      </header>
      <img src={photoUrl(c.photo)} alt={`Check-in de ${c.userName}`} loading="lazy" className="aspect-[4/5] w-full bg-ink-800 object-cover" />
      <div className="flex items-start gap-3 p-3">
        <button onClick={toggle} className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-sm ${likes.on ? "bg-flame-500/20 text-flame-400" : "bg-ink-800 text-ink-300"}`}>
          💪 {likes.n || ""}
        </button>
        <p className="flex-1 pt-1 text-sm text-ink-300">{c.caption}</p>
        {meId === c.userId && (
          <button
            onClick={async () => {
              if (!confirm("Apagar este check-in? A presença do dia deixa de contar se for o único.")) return;
              await deleteCheckin(c.id).catch(() => {});
              onDeleted?.();
            }}
            className="pt-1 text-xs text-ink-500"
          >
            Apagar
          </button>
        )}
      </div>
    </article>
  );
}
