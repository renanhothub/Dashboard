import { FLOOR, VIEWBOX, type Frame, type Limb } from "./kinematics";
import type { Anim, Prop, Vec } from "./types";

const limbPts = (l: Limb): Vec[] => [l.root, l.mid, l.end, l.tip];

function framePts(f: Frame): Vec[] {
  const pts: Vec[] = [f.pelvis, f.neck, f.head, ...limbPts(f.arm), ...limbPts(f.arm2)];
  if (f.view !== "end") pts.push(...limbPts(f.leg), ...limbPts(f.leg2));
  return pts;
}

function propPts(p: Prop): Vec[] {
  switch (p.t) {
    case "bench":
      return [[p.x - p.w / 2, p.y], [p.x + p.w / 2, p.y]];
    case "box":
      return [[p.x, p.y], [p.x + p.w, p.y + p.h]];
    case "line":
      return [p.p, p.q];
    case "pulley":
      return [[p.x, p.y]];
    case "bar":
      return p.w ? [[p.x - p.w / 2, p.y], [p.x + p.w / 2, p.y]] : [[p.x, p.y], [p.x + 16, p.y]];
    case "roller":
      return [[p.x, p.y]];
    case "step":
      return [[p.x, FLOOR - p.h], [p.x + p.w, FLOOR]];
  }
}

/** Calcula um viewBox que enquadra o movimento completo (proporção 6:5). */
export function fitViewBox(anim: Anim, frames: Frame[]): [number, number, number, number] {
  const pts: Vec[] = frames.flatMap(framePts);
  anim.props?.forEach((p) => pts.push(...propPts(p)));
  anim.gear?.forEach((g) => {
    if (g.t === "cable") pts.push(g.from, [2 * frames[0].pelvis[0] - g.from[0], g.from[1]]);
    if (g.t === "lever" || (g.t === "legPad" && g.pivot)) pts.push((g as { pivot: Vec }).pivot);
  });
  if (!anim.noFloor) pts.push([pts[0][0], FLOOR + 2]);
  let x0 = Math.min(...pts.map((p) => p[0]));
  let x1 = Math.max(...pts.map((p) => p[0]));
  let y0 = Math.min(...pts.map((p) => p[1]));
  let y1 = Math.max(...pts.map((p) => p[1]));
  const pad = 16;
  x0 -= pad; x1 += pad; y0 -= pad; y1 += 8;
  const ratio = VIEWBOX.w / VIEWBOX.h;
  let w = Math.max(x1 - x0, 150);
  let h = Math.max(y1 - y0, 125);
  if (w / h > ratio) h = w / ratio;
  else w = h * ratio;
  const cx = (x0 + x1) / 2;
  // Ancora a parte de baixo (chão) e cresce para cima
  return [cx - w / 2, y1 - h, w, h];
}
