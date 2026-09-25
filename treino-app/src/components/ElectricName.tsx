import { useEffect, useRef, useState } from "react";

/** Nome com pequenos raios elétricos saindo das letras, como faíscas de energia. */

const PAD = 26; // espaço ao redor do texto onde os raios aparecem
interface Bolt {
  id: number;
  d: string;
  life: number;
}

let nextId = 0;
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

/** Gera um raio em zigue-zague saindo da borda do texto para fora, às vezes com um galho. */
function makeBolt(w: number, h: number): Bolt {
  // ponto de partida na borda das letras (mais em cima e embaixo, às vezes nas pontas)
  const side = Math.random();
  let x: number, y: number, ang: number;
  if (side < 0.4) [x, y, ang] = [rnd(4, w - 4), 3, rnd(-150, -30)];
  else if (side < 0.8) [x, y, ang] = [rnd(4, w - 4), h - 3, rnd(30, 150)];
  else if (side < 0.9) [x, y, ang] = [2, rnd(3, h - 3), rnd(150, 210)];
  else [x, y, ang] = [w - 2, rnd(3, h - 3), rnd(-30, 30)];
  x += PAD;
  y += PAD;
  const rad = (ang * Math.PI) / 180;
  const steps = Math.round(rnd(4, 7));
  const len = rnd(14, 26) / steps;
  let d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
  let branch = "";
  for (let i = 1; i <= steps; i++) {
    const jitter = rnd(-4.5, 4.5);
    x += Math.cos(rad) * len - Math.sin(rad) * jitter;
    y += Math.sin(rad) * len + Math.cos(rad) * jitter;
    d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
    if (i === 2 && Math.random() < 0.45) {
      const b = rad + rnd(0.5, 0.9) * (Math.random() < 0.5 ? -1 : 1);
      branch = ` M${x.toFixed(1)} ${y.toFixed(1)} l${(Math.cos(b) * len * 1.2).toFixed(1)} ${(Math.sin(b) * len * 1.2).toFixed(1)} l${rnd(-2, 2).toFixed(1)} ${rnd(2, 4).toFixed(1)}`;
    }
  }
  return { id: nextId++, d: d + branch, life: Math.round(rnd(2, 4)) };
}

/** Arco elétrico que salta de uma letra para outra, rente ao topo ou à base do texto. */
function makeArc(w: number, h: number): Bolt {
  const top = Math.random() < 0.5;
  const x0 = rnd(0, w - 30);
  const x1 = x0 + rnd(16, 34);
  const y0 = top ? 2 : h - 2;
  const dir = top ? -1 : 1;
  const steps = 6;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x0 + (x1 - x0) * t + (i && i < steps ? rnd(-2, 2) : 0);
    const bulge = Math.sin(Math.PI * t) * rnd(5, 9);
    const y = y0 + dir * bulge + (i && i < steps ? rnd(-2.5, 2.5) : 0);
    d += `${i ? " L" : "M"}${(x + PAD).toFixed(1)} ${(y + PAD).toFixed(1)}`;
  }
  return { id: nextId++, d, life: Math.round(rnd(2, 3)) };
}

const spark = (w: number, h: number) => (Math.random() < 0.3 ? makeArc(w, h) : makeBolt(w, h));

export function ElectricName({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [bolts, setBolts] = useState<Bolt[]>([]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!size.w || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let burst = 0;
    const t = window.setInterval(() => {
      if (document.hidden) return;
      // de tempos em tempos vem uma descarga com vários raios; no resto, faíscas esporádicas
      if (burst <= 0 && Math.random() < 0.07) burst = Math.round(rnd(5, 9));
      setBolts((prev) => {
        const alive = prev.map((b) => ({ ...b, life: b.life - 1 })).filter((b) => b.life > 0);
        const chance = burst > 0 ? 1 : 0.62;
        if (burst > 0) burst--;
        if (Math.random() < chance) alive.push(spark(size.w, size.h));
        if (Math.random() < (burst > 0 ? 0.75 : 0.12)) alive.push(spark(size.w, size.h));
        return alive;
      });
    }, 117); // ritmo dos raios (~40% mais lento que 70 ms)
    return () => window.clearInterval(t);
  }, [size.w, size.h]);

  const W = size.w + PAD * 2;
  const H = size.h + PAD * 2;
  return (
    <span className="brand-electric relative inline-block">
      <span ref={ref} className="relative z-10">
        {text}
      </span>
      {size.w > 0 && (
        <svg
          aria-hidden
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          className="pointer-events-none absolute z-20 overflow-visible"
          style={{ left: -PAD, top: -PAD }}
        >
          <defs>
            <filter id="bolt-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.8" />
            </filter>
          </defs>
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            {bolts.map((b) => (
              <g key={b.id} opacity={b.life > 1 ? 1 : 0.5}>
                <path d={b.d} stroke="#f4c54a" strokeWidth="4" opacity="0.9" filter="url(#bolt-glow)" />
                <path d={b.d} stroke="#ffe08a" strokeWidth="1.3" />
                <path d={b.d} stroke="#fffbea" strokeWidth="0.5" />
              </g>
            ))}
          </g>
        </svg>
      )}
    </span>
  );
}
