import { Router } from "express";
import { db } from "../db.js";

const router = Router();

const VALID_STATUSES = ["roteiro", "gravacao", "edicao", "revisao", "publicado"];

const videoWithJoins = `
  SELECT v.*, c.name AS creator_name, s.title AS script_title
  FROM videos v
  LEFT JOIN creators c ON c.id = v.creator_id
  LEFT JOIN scripts s ON s.id = v.script_id
`;

router.get("/", (req, res) => {
  const videos = db.prepare(`${videoWithJoins} ORDER BY v.updated_at DESC`).all();
  res.json(videos);
});

router.get("/:id", (req, res) => {
  const video = db.prepare(`${videoWithJoins} WHERE v.id = ?`).get(req.params.id);
  if (!video) return res.status(404).json({ error: "Video not found" });
  res.json(video);
});

router.post("/", (req, res) => {
  const { title, creator_id, script_id, status, platform, due_date, notes } = req.body;
  if (!title) return res.status(400).json({ error: "title is required" });
  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of ${VALID_STATUSES.join(", ")}` });
  }
  const info = db
    .prepare(
      `INSERT INTO videos (title, creator_id, script_id, status, platform, due_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(title, creator_id ?? null, script_id ?? null, status ?? "roteiro", platform ?? "tiktok", due_date ?? null, notes ?? null);
  res.status(201).json(db.prepare(`${videoWithJoins} WHERE v.id = ?`).get(info.lastInsertRowid));
});

router.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM videos WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Video not found" });
  const { title, creator_id, script_id, status, platform, due_date, notes } = req.body;
  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of ${VALID_STATUSES.join(", ")}` });
  }
  db.prepare(
    `UPDATE videos SET title = ?, creator_id = ?, script_id = ?, status = ?, platform = ?, due_date = ?, notes = ?, updated_at = datetime('now') WHERE id = ?`
  ).run(
    title ?? existing.title,
    creator_id ?? existing.creator_id,
    script_id ?? existing.script_id,
    status ?? existing.status,
    platform ?? existing.platform,
    due_date ?? existing.due_date,
    notes ?? existing.notes,
    req.params.id
  );
  res.json(db.prepare(`${videoWithJoins} WHERE v.id = ?`).get(req.params.id));
});

router.patch("/:id/status", (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of ${VALID_STATUSES.join(", ")}` });
  }
  const existing = db.prepare("SELECT * FROM videos WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Video not found" });
  db.prepare(`UPDATE videos SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, req.params.id);
  res.json(db.prepare(`${videoWithJoins} WHERE v.id = ?`).get(req.params.id));
});

router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM videos WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

export default router;
