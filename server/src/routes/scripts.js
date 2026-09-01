import { Router } from "express";
import { db } from "../db.js";

const router = Router();

router.get("/", (req, res) => {
  const scripts = db.prepare("SELECT * FROM scripts ORDER BY created_at DESC").all();
  res.json(scripts);
});

router.get("/:id", (req, res) => {
  const script = db.prepare("SELECT * FROM scripts WHERE id = ?").get(req.params.id);
  if (!script) return res.status(404).json({ error: "Script not found" });
  res.json(script);
});

router.post("/", (req, res) => {
  const { title, hook, body, category, tags, performance_note } = req.body;
  if (!title || !hook) return res.status(400).json({ error: "title and hook are required" });
  const stmt = db.prepare(
    `INSERT INTO scripts (title, hook, body, category, tags, performance_note) VALUES (?, ?, ?, ?, ?, ?)`
  );
  const info = stmt.run(title, hook, body ?? null, category ?? null, tags ?? null, performance_note ?? null);
  res.status(201).json(db.prepare("SELECT * FROM scripts WHERE id = ?").get(info.lastInsertRowid));
});

router.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM scripts WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Script not found" });
  const { title, hook, body, category, tags, performance_note } = req.body;
  db.prepare(
    `UPDATE scripts SET title = ?, hook = ?, body = ?, category = ?, tags = ?, performance_note = ? WHERE id = ?`
  ).run(
    title ?? existing.title,
    hook ?? existing.hook,
    body ?? existing.body,
    category ?? existing.category,
    tags ?? existing.tags,
    performance_note ?? existing.performance_note,
    req.params.id
  );
  res.json(db.prepare("SELECT * FROM scripts WHERE id = ?").get(req.params.id));
});

router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM scripts WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

export default router;
