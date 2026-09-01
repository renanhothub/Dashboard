import { Router } from "express";
import { db } from "../db.js";

const router = Router();

router.get("/", (req, res) => {
  const { video_id } = req.query;
  const metrics = video_id
    ? db.prepare("SELECT * FROM metrics WHERE video_id = ? ORDER BY recorded_at DESC").all(video_id)
    : db.prepare("SELECT * FROM metrics ORDER BY recorded_at DESC").all();
  res.json(metrics);
});

router.get("/summary", (req, res) => {
  const totals = db
    .prepare(
      `SELECT
        COALESCE(SUM(views), 0) AS total_views,
        COALESCE(SUM(likes), 0) AS total_likes,
        COALESCE(SUM(comments), 0) AS total_comments,
        COALESCE(SUM(shares), 0) AS total_shares
      FROM metrics`
    )
    .get();

  const byVideo = db
    .prepare(
      `SELECT v.id AS video_id, v.title, v.platform,
        COALESCE(SUM(m.views), 0) AS views,
        COALESCE(SUM(m.likes), 0) AS likes,
        COALESCE(SUM(m.comments), 0) AS comments,
        COALESCE(SUM(m.shares), 0) AS shares
      FROM videos v
      LEFT JOIN metrics m ON m.video_id = v.id
      WHERE v.status = 'publicado'
      GROUP BY v.id
      ORDER BY views DESC`
    )
    .all();

  const byPlatform = db
    .prepare(
      `SELECT platform, COALESCE(SUM(views), 0) AS views, COALESCE(SUM(likes), 0) AS likes
      FROM metrics GROUP BY platform`
    )
    .all();

  const pipelineCounts = db
    .prepare(`SELECT status, COUNT(*) AS count FROM videos GROUP BY status`)
    .all();

  res.json({ totals, byVideo, byPlatform, pipelineCounts });
});

router.post("/", (req, res) => {
  const { video_id, platform, views, likes, comments, shares } = req.body;
  if (!video_id || !platform) return res.status(400).json({ error: "video_id and platform are required" });
  const info = db
    .prepare(
      `INSERT INTO metrics (video_id, platform, views, likes, comments, shares) VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(video_id, platform, views ?? 0, likes ?? 0, comments ?? 0, shares ?? 0);
  res.status(201).json(db.prepare("SELECT * FROM metrics WHERE id = ?").get(info.lastInsertRowid));
});

router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM metrics WHERE id = ?").run(req.params.id);
  res.status(204).end();
});

export default router;
