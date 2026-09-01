import express from "express";
import cors from "cors";
import "./db.js";
import creatorsRouter from "./routes/creators.js";
import scriptsRouter from "./routes/scripts.js";
import videosRouter from "./routes/videos.js";
import metricsRouter from "./routes/metrics.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.use("/api/creators", creatorsRouter);
app.use("/api/scripts", scriptsRouter);
app.use("/api/videos", videosRouter);
app.use("/api/metrics", metricsRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`UGC dashboard API rodando em http://localhost:${PORT}`);
});
