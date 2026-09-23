import crypto from "node:crypto";
import { db } from "./db.js";

export function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(pw, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function checkPassword(pw, stored) {
  const [salt, hash] = stored.split(":");
  const test = crypto.scryptSync(pw, salt, 64);
  return crypto.timingSafeEqual(test, Buffer.from(hash, "hex"));
}

export function newToken(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  db.prepare("INSERT INTO tokens (token, user_id) VALUES (?, ?)").run(token, userId);
  return token;
}

export const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email });

/** Middleware: exige "Authorization: Bearer <token>". */
export function requireAuth(req, res, next) {
  const token = (req.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const row = token && db.prepare("SELECT u.* FROM tokens t JOIN users u ON u.id = t.user_id WHERE t.token = ?").get(token);
  if (!row) return res.status(401).json({ error: "Faça login para continuar." });
  req.user = row;
  req.token = token;
  next();
}
