import { Router } from "express";
import { db } from "../db.js";

const router = Router();

router.get("/", (req, res) => {
  const creators = db.prepare("SELECT * FROM creators ORDER BY created_at DESC").all();
  res.json(creators);
});

router.get("/:id", (req, res) => {
  const creator = db.prepare("SELECT * FROM creators WHERE id = ?").get(req.params.id);
  if (!creator) return res.status(404).json({ error: "Creator not found" });
  res.json(creator);
});

router.post("/", (req, res) => {
  const { name, email, phone, social_handle, rate_per_video, notes } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });
  const stmt = db.prepare(
    `INSERT INTO creators (name, email, phone, social_handle, rate_per_video, notes) VALUES (?, ?, ?, ?, ?, ?)`
  );
  const info = stmt.run(name, email ?? null, phone ?? null, social_handle ?? null, rate_per_video ?? 0, notes ?? null);
  const creator = db.prepare("SELECT * FROM creators WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(creator);
});

router.put("/:id", (req, res) => {
  const existing = db.prepare("SELECT * FROM creators WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Creator not found" });
  const { name, email, phone, social_handle, rate_per_video, notes } = req.body;
  db.prepare(
    `UPDATE creators SET name = ?, email = ?, phone = ?, social_handle = ?, rate_per_video = ?, notes = ? WHERE id = ?`
  ).run(
    name ?? existing.name,
    email ?? existing.email,
    phone ?? existing.phone,
    social_handle ?? existing.social_handle,
    rate_per_video ?? existing.rate_per_video,
    notes ?? existing.notes,
    req.params.id
  );
  res.json(db.prepare("SELECT * FROM creators WHERE id = ?").get(req.params.id));
});

router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM creators WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

export default router;
