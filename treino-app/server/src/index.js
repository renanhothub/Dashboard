import express from "express";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { checkPassword, hashPassword, newToken, publicUser, requireAuth } from "./auth.js";
import { db, UPLOAD_DIR } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const app = express();
app.use(express.json({ limit: "8mb" }));

// CORS simples (o app pode estar hospedado em outro domínio)
app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

const api = express.Router();
const bad = (res, msg, code = 400) => res.status(code).json({ error: msg });
const isDay = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);

api.get("/health", (_req, res) => res.json({ ok: true }));

// ---------- Conta ----------

api.post("/auth/register", (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "");
  if (name.length < 2) return bad(res, "Informe seu nome.");
  if (!/^\S+@\S+\.\S+$/.test(email)) return bad(res, "E-mail inválido.");
  if (password.length < 6) return bad(res, "A senha precisa ter pelo menos 6 caracteres.");
  if (db.prepare("SELECT 1 FROM users WHERE email = ?").get(email)) return bad(res, "Já existe uma conta com este e-mail.", 409);
  const { lastInsertRowid } = db.prepare("INSERT INTO users (name, email, pass_hash) VALUES (?, ?, ?)").run(name, email, hashPassword(password));
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(lastInsertRowid);
  res.status(201).json({ token: newToken(user.id), user: publicUser(user) });
});

api.post("/auth/login", (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !checkPassword(String(req.body?.password ?? ""), user.pass_hash)) return bad(res, "E-mail ou senha incorretos.", 401);
  res.json({ token: newToken(user.id), user: publicUser(user) });
});

api.post("/auth/logout", requireAuth, (req, res) => {
  db.prepare("DELETE FROM tokens WHERE token = ?").run(req.token);
  res.json({ ok: true });
});

api.get("/me", requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

api.put("/me", requireAuth, (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  if (name.length < 2) return bad(res, "Informe seu nome.");
  db.prepare("UPDATE users SET name = ? WHERE id = ?").run(name, req.user.id);
  res.json({ user: publicUser({ ...req.user, name }) });
});

// ---------- Sincronização dos dados do app ----------

api.get("/sync", requireAuth, (req, res) => {
  const row = db.prepare("SELECT json, updated_at FROM user_data WHERE user_id = ?").get(req.user.id);
  res.json(row ? { data: JSON.parse(row.json), updatedAt: row.updated_at } : { data: null, updatedAt: 0 });
});

api.put("/sync", requireAuth, (req, res) => {
  const data = req.body?.data;
  if (!data || typeof data !== "object") return bad(res, "Dados inválidos.");
  const json = JSON.stringify(data);
  if (json.length > 2_000_000) return bad(res, "Dados grandes demais.", 413);
  const updatedAt = Date.now();
  db.prepare(
    "INSERT INTO user_data (user_id, json, updated_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at",
  ).run(req.user.id, json, updatedAt);
  res.json({ updatedAt });
});

// ---------- Competições ----------

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function newCode() {
  for (;;) {
    const code = Array.from(crypto.randomBytes(6), (b) => ALPHABET[b % ALPHABET.length]).join("");
    if (!db.prepare("SELECT 1 FROM groups WHERE code = ?").get(code)) return code;
  }
}

const isMember = (groupId, userId) => !!db.prepare("SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?").get(groupId, userId);

/** Ranking: dias distintos com check-in dentro do período da competição. */
function ranking(group) {
  const end = group.ends_on ?? "9999-12-31";
  return db
    .prepare(
      `SELECT u.id, u.name,
              COUNT(DISTINCT c.day) AS days,
              MAX(c.day) AS last_day
         FROM group_members m
         JOIN users u ON u.id = m.user_id
         LEFT JOIN checkins c ON c.user_id = u.id AND c.day >= ? AND c.day <= ?
        WHERE m.group_id = ?
        GROUP BY u.id
        ORDER BY days DESC, last_day DESC, u.name`,
    )
    .all(group.starts_on, end, group.id);
}

function groupSummary(g, userId) {
  const rank = ranking(g);
  const pos = rank.findIndex((r) => r.id === userId);
  return {
    id: g.id,
    name: g.name,
    code: g.code,
    ownerId: g.owner_id,
    startsOn: g.starts_on,
    endsOn: g.ends_on,
    members: rank.length,
    myPosition: pos + 1,
    myDays: rank[pos]?.days ?? 0,
    leader: rank[0] ? { name: rank[0].name, days: rank[0].days } : null,
  };
}

api.get("/groups", requireAuth, (req, res) => {
  const groups = db
    .prepare("SELECT g.* FROM groups g JOIN group_members m ON m.group_id = g.id WHERE m.user_id = ? ORDER BY g.created_at DESC")
    .all(req.user.id);
  res.json({ groups: groups.map((g) => groupSummary(g, req.user.id)) });
});

api.post("/groups", requireAuth, (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  const startsOn = req.body?.startsOn;
  const endsOn = req.body?.endsOn || null;
  if (name.length < 2) return bad(res, "Dê um nome para a competição.");
  if (!isDay(startsOn)) return bad(res, "Data de início inválida.");
  if (endsOn && (!isDay(endsOn) || endsOn < startsOn)) return bad(res, "Data de término inválida.");
  const { lastInsertRowid } = db
    .prepare("INSERT INTO groups (name, code, owner_id, starts_on, ends_on) VALUES (?, ?, ?, ?, ?)")
    .run(name, newCode(), req.user.id, startsOn, endsOn);
  db.prepare("INSERT INTO group_members (group_id, user_id) VALUES (?, ?)").run(lastInsertRowid, req.user.id);
  const g = db.prepare("SELECT * FROM groups WHERE id = ?").get(lastInsertRowid);
  res.status(201).json({ group: groupSummary(g, req.user.id) });
});

api.get("/invites/:code", (req, res) => {
  const g = db.prepare("SELECT g.name, u.name AS owner FROM groups g JOIN users u ON u.id = g.owner_id WHERE g.code = ?").get(String(req.params.code).toUpperCase());
  if (!g) return bad(res, "Convite não encontrado.", 404);
  res.json({ name: g.name, owner: g.owner });
});

api.post("/groups/join", requireAuth, (req, res) => {
  const code = String(req.body?.code ?? "").trim().toUpperCase();
  const g = db.prepare("SELECT * FROM groups WHERE code = ?").get(code);
  if (!g) return bad(res, "Código de convite não encontrado.", 404);
  db.prepare("INSERT OR IGNORE INTO group_members (group_id, user_id) VALUES (?, ?)").run(g.id, req.user.id);
  res.json({ group: groupSummary(g, req.user.id) });
});

api.get("/groups/:id", requireAuth, (req, res) => {
  const g = db.prepare("SELECT * FROM groups WHERE id = ?").get(Number(req.params.id));
  if (!g || !isMember(g.id, req.user.id)) return bad(res, "Competição não encontrada.", 404);
  res.json({ group: groupSummary(g, req.user.id), ranking: ranking(g) });
});

api.post("/groups/:id/leave", requireAuth, (req, res) => {
  const g = db.prepare("SELECT * FROM groups WHERE id = ?").get(Number(req.params.id));
  if (!g || !isMember(g.id, req.user.id)) return bad(res, "Competição não encontrada.", 404);
  db.prepare("DELETE FROM group_members WHERE group_id = ? AND user_id = ?").run(g.id, req.user.id);
  const left = db.prepare("SELECT COUNT(*) AS n FROM group_members WHERE group_id = ?").get(g.id).n;
  if (!left) db.prepare("DELETE FROM groups WHERE id = ?").run(g.id);
  else if (g.owner_id === req.user.id) {
    const next = db.prepare("SELECT user_id FROM group_members WHERE group_id = ? ORDER BY joined_at LIMIT 1").get(g.id);
    db.prepare("UPDATE groups SET owner_id = ? WHERE id = ?").run(next.user_id, g.id);
  }
  res.json({ ok: true });
});

// ---------- Check-ins ----------

function checkinRows(where, params, userId, limit = 50, before = null) {
  const rows = db
    .prepare(
      `SELECT c.id, c.user_id AS userId, u.name AS userName, c.day, c.photo, c.caption, c.workout, c.created_at AS createdAt,
              (SELECT COUNT(*) FROM checkin_likes l WHERE l.checkin_id = c.id) AS likes,
              EXISTS (SELECT 1 FROM checkin_likes l WHERE l.checkin_id = c.id AND l.user_id = ?) AS liked
         FROM checkins c JOIN users u ON u.id = c.user_id
        WHERE ${where} ${before ? "AND c.id < ?" : ""}
        ORDER BY c.id DESC LIMIT ?`,
    )
    .all(userId, ...params, ...(before ? [before] : []), limit);
  return rows.map((r) => ({ ...r, liked: !!r.liked, photo: `/uploads/${r.photo}` }));
}

/** Feed da competição: check-ins de todos os membros dentro do período. */
api.get("/groups/:id/feed", requireAuth, (req, res) => {
  const g = db.prepare("SELECT * FROM groups WHERE id = ?").get(Number(req.params.id));
  if (!g || !isMember(g.id, req.user.id)) return bad(res, "Competição não encontrada.", 404);
  const before = req.query.before ? Number(req.query.before) : null;
  const rows = checkinRows(
    "c.user_id IN (SELECT user_id FROM group_members WHERE group_id = ?) AND c.day >= ? AND c.day <= ?",
    [g.id, g.starts_on, g.ends_on ?? "9999-12-31"],
    req.user.id,
    30,
    before,
  );
  res.json({ checkins: rows });
});

api.get("/checkins/mine", requireAuth, (req, res) => {
  res.json({ checkins: checkinRows("c.user_id = ?", [req.user.id], req.user.id, 100) });
});

api.post("/checkins", requireAuth, (req, res) => {
  const { photo, caption, workout, day } = req.body ?? {};
  if (!isDay(day)) return bad(res, "Data inválida.");
  const m = typeof photo === "string" && photo.match(/^data:image\/(jpeg|png|webp);base64,(.+)$/);
  if (!m) return bad(res, "Envie uma foto para marcar presença.");
  const buf = Buffer.from(m[2], "base64");
  if (buf.length > 6_000_000) return bad(res, "Foto grande demais.", 413);
  const file = `${crypto.randomBytes(16).toString("hex")}.${m[1] === "jpeg" ? "jpg" : m[1]}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, file), buf);
  const already = !!db.prepare("SELECT 1 FROM checkins WHERE user_id = ? AND day = ?").get(req.user.id, day);
  const { lastInsertRowid } = db
    .prepare("INSERT INTO checkins (user_id, day, photo, caption, workout) VALUES (?, ?, ?, ?, ?)")
    .run(req.user.id, day, file, String(caption ?? "").slice(0, 280) || null, String(workout ?? "").slice(0, 80) || null);
  const [checkin] = checkinRows("c.id = ?", [lastInsertRowid], req.user.id, 1);
  res.status(201).json({ checkin, countedToday: !already });
});

api.delete("/checkins/:id", requireAuth, (req, res) => {
  const c = db.prepare("SELECT * FROM checkins WHERE id = ?").get(Number(req.params.id));
  if (!c || c.user_id !== req.user.id) return bad(res, "Check-in não encontrado.", 404);
  db.prepare("DELETE FROM checkins WHERE id = ?").run(c.id);
  fs.rmSync(path.join(UPLOAD_DIR, c.photo), { force: true });
  res.json({ ok: true });
});

api.post("/checkins/:id/like", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!db.prepare("SELECT 1 FROM checkins WHERE id = ?").get(id)) return bad(res, "Check-in não encontrado.", 404);
  const liked = db.prepare("SELECT 1 FROM checkin_likes WHERE checkin_id = ? AND user_id = ?").get(id, req.user.id);
  if (liked) db.prepare("DELETE FROM checkin_likes WHERE checkin_id = ? AND user_id = ?").run(id, req.user.id);
  else db.prepare("INSERT INTO checkin_likes (checkin_id, user_id) VALUES (?, ?)").run(id, req.user.id);
  const likes = db.prepare("SELECT COUNT(*) AS n FROM checkin_likes WHERE checkin_id = ?").get(id).n;
  res.json({ liked: !liked, likes });
});

app.use("/api", api);
app.use("/uploads", express.static(UPLOAD_DIR, { maxAge: "30d", immutable: true }));

// Em produção o mesmo servidor entrega o app (pasta dist do build)
const dist = path.join(__dirname, "..", "..", "dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));
}

/**
 * Mantém o servidor acordado no plano grátis do Render, que desliga após 15 min sem visitas
 * (e apaga os dados ao desligar). O servidor visita o próprio endereço público periodicamente.
 * O Render define RENDER_EXTERNAL_URL automaticamente. Desative com KEEP_AWAKE=0.
 */
export function startKeepAwake(url = process.env.RENDER_EXTERNAL_URL, minutes = Number(process.env.KEEP_AWAKE_MINUTES ?? 10)) {
  if (!url || process.env.KEEP_AWAKE === "0") return null;
  const ping = () =>
    fetch(`${url.replace(/\/$/, "")}/api/health`, { headers: { "User-Agent": "hot-training-keep-awake" } })
      .then((r) => console.log(`[keep-awake] ${new Date().toISOString()} ${r.status}`))
      .catch((e) => console.log(`[keep-awake] falhou: ${e.message}`));
  console.log(`[keep-awake] ativo: ${url} a cada ${minutes} min`);
  return setInterval(ping, minutes * 60_000);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 3002);
  app.listen(port, () => {
    console.log(`Evolution API em http://localhost:${port}`);
    startKeepAwake();
  });
}
