import { db } from "./db.js";

const clear = () => {
  db.exec("DELETE FROM metrics; DELETE FROM videos; DELETE FROM scripts; DELETE FROM creators;");
};

const seed = () => {
  clear();

  const creators = [
    { name: "Ana Souza", email: "ana@example.com", phone: "11999990000", social_handle: "@anasouza", rate_per_video: 150 },
    { name: "Bruno Lima", email: "bruno@example.com", phone: "11999991111", social_handle: "@brunolima", rate_per_video: 200 },
    { name: "Carla Dias", email: "carla@example.com", phone: "11999992222", social_handle: "@carladias", rate_per_video: 180 },
  ];
  const insertCreator = db.prepare(
    `INSERT INTO creators (name, email, phone, social_handle, rate_per_video) VALUES (@name, @email, @phone, @social_handle, @rate_per_video)`
  );
  const creatorIds = creators.map((c) => insertCreator.run(c).lastInsertRowid);

  const scripts = [
    { title: "Antes e depois do produto", hook: "Você não vai acreditar no que aconteceu em 7 dias", body: "Roteiro completo do antes e depois...", category: "depoimento", tags: "beleza,transformacao", performance_note: "Alta conversão em campanhas de beleza" },
    { title: "Unboxing rápido", hook: "Isso chegou hoje e já virou meu favorito", body: "Roteiro de unboxing com reação genuína...", category: "unboxing", tags: "tech,lancamento", performance_note: "Boa retenção nos primeiros 3s" },
    { title: "Erro comum resolvido", hook: "Pare de cometer esse erro ao usar X", body: "Explica o erro e mostra a solução com o produto...", category: "educativo", tags: "dica,problema-solucao", performance_note: "Alto compartilhamento" },
  ];
  const insertScript = db.prepare(
    `INSERT INTO scripts (title, hook, body, category, tags, performance_note) VALUES (@title, @hook, @body, @category, @tags, @performance_note)`
  );
  const scriptIds = scripts.map((s) => insertScript.run(s).lastInsertRowid);

  const videos = [
    { title: "UGC Ana - Antes e depois skincare", creator_id: creatorIds[0], script_id: scriptIds[0], status: "publicado", platform: "tiktok" },
    { title: "UGC Bruno - Unboxing fone", creator_id: creatorIds[1], script_id: scriptIds[1], status: "publicado", platform: "instagram" },
    { title: "UGC Carla - Dica de uso", creator_id: creatorIds[2], script_id: scriptIds[2], status: "edicao", platform: "tiktok" },
    { title: "UGC Ana - Rotina noturna", creator_id: creatorIds[0], script_id: scriptIds[2], status: "gravacao", platform: "instagram" },
    { title: "UGC Bruno - Review completo", creator_id: creatorIds[1], script_id: scriptIds[0], status: "roteiro", platform: "tiktok" },
    { title: "UGC Carla - Unboxing kit", creator_id: creatorIds[2], script_id: scriptIds[1], status: "revisao", platform: "youtube" },
  ];
  const insertVideo = db.prepare(
    `INSERT INTO videos (title, creator_id, script_id, status, platform) VALUES (@title, @creator_id, @script_id, @status, @platform)`
  );
  const videoIds = videos.map((v) => insertVideo.run(v).lastInsertRowid);

  const metrics = [
    { video_id: videoIds[0], platform: "tiktok", views: 125000, likes: 9800, comments: 340, shares: 512 },
    { video_id: videoIds[1], platform: "instagram", views: 48000, likes: 3100, comments: 120, shares: 88 },
  ];
  const insertMetric = db.prepare(
    `INSERT INTO metrics (video_id, platform, views, likes, comments, shares) VALUES (@video_id, @platform, @views, @likes, @comments, @shares)`
  );
  metrics.forEach((m) => insertMetric.run(m));

  console.log("Seed concluído.");
};

seed();
