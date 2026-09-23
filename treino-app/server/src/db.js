import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Pasta de dados (banco + fotos). Em produção, aponte DATA_DIR para um disco persistente. */
export const DATA_DIR = process.env.DATA_DIR ?? path.join(__dirname, "..", "data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export const db = new DatabaseSync(process.env.DB_PATH ?? path.join(DATA_DIR, "treino.sqlite3"));
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  pass_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tokens (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Dados do app (treinos, histórico, favoritos) sincronizados entre aparelhos
CREATE TABLE IF NOT EXISTS user_data (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  json TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Competições entre amigos
CREATE TABLE IF NOT EXISTS groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  starts_on TEXT NOT NULL,
  ends_on TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS group_members (
  group_id INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (group_id, user_id)
);

-- Check-ins de presença (foto obrigatória)
CREATE TABLE IF NOT EXISTS checkins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day TEXT NOT NULL,
  photo TEXT NOT NULL,
  caption TEXT,
  workout TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS checkins_user_day ON checkins(user_id, day);

CREATE TABLE IF NOT EXISTS checkin_likes (
  checkin_id INTEGER NOT NULL REFERENCES checkins(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (checkin_id, user_id)
);
`);
