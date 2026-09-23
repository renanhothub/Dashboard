import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "treino-test-"));
process.env.DATA_DIR = dir;
const { app } = await import("../src/index.js");

let server, base;
before(() => new Promise((r) => (server = app.listen(0, () => ((base = `http://localhost:${server.address().port}/api`), r())))));
after(() => {
  server.close();
  fs.rmSync(dir, { recursive: true, force: true });
});

async function call(method, url, body, token) {
  const res = await fetch(base + url, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: await res.json() };
}

const PHOTO = "data:image/jpeg;base64," + Buffer.from("fake-jpeg").toString("base64");

test("fluxo completo: contas, sync, competição, check-ins e ranking", async () => {
  // Conta
  const ana = await call("POST", "/auth/register", { name: "Ana", email: "ana@x.com", password: "123456" });
  assert.equal(ana.status, 201);
  const dup = await call("POST", "/auth/register", { name: "Ana", email: "ANA@x.com", password: "123456" });
  assert.equal(dup.status, 409);
  const wrong = await call("POST", "/auth/login", { email: "ana@x.com", password: "errada" });
  assert.equal(wrong.status, 401);
  const login = await call("POST", "/auth/login", { email: "ana@x.com", password: "123456" });
  assert.equal(login.status, 200);
  const A = login.body.token;
  const B = (await call("POST", "/auth/register", { name: "Bruno", email: "bruno@x.com", password: "abcdef" })).body.token;
  const C = (await call("POST", "/auth/register", { name: "Caio", email: "caio@x.com", password: "abcdef" })).body.token;
  assert.equal((await call("GET", "/me")).status, 401);

  // Sincronização
  assert.deepEqual((await call("GET", "/sync", null, A)).body.data, null);
  await call("PUT", "/sync", { data: { workouts: [{ id: "w1", name: "Treino A" }] } }, A);
  assert.equal((await call("GET", "/sync", null, A)).body.data.workouts[0].name, "Treino A");

  // Competição + convite
  const g = await call("POST", "/groups", { name: "Galera da academia", startsOn: "2026-09-01", endsOn: "2026-09-30" }, A);
  assert.equal(g.status, 201);
  const { id, code } = g.body.group;
  assert.equal((await call("GET", `/invites/${code}`)).body.owner, "Ana");
  assert.equal((await call("POST", "/groups/join", { code: code.toLowerCase() }, B)).status, 200);
  assert.equal((await call("GET", `/groups/${id}`, null, C)).status, 404, "quem não é membro não vê");

  // Check-ins: foto obrigatória, 1 por dia conta no ranking
  assert.equal((await call("POST", "/checkins", { day: "2026-09-10" }, A)).status, 400);
  const c1 = await call("POST", "/checkins", { day: "2026-09-10", photo: PHOTO, caption: "Perna!" }, A);
  assert.equal(c1.status, 201);
  assert.equal(c1.body.countedToday, true);
  const c2 = await call("POST", "/checkins", { day: "2026-09-10", photo: PHOTO }, A);
  assert.equal(c2.body.countedToday, false, "segundo check-in no mesmo dia não soma");
  await call("POST", "/checkins", { day: "2026-09-11", photo: PHOTO }, A);
  await call("POST", "/checkins", { day: "2026-09-11", photo: PHOTO }, B);
  await call("POST", "/checkins", { day: "2026-08-20", photo: PHOTO }, B); // antes do início: não conta
  await call("POST", "/checkins", { day: "2026-09-12", photo: PHOTO }, C); // não é membro

  const detail = await call("GET", `/groups/${id}`, null, B);
  assert.deepEqual(
    detail.body.ranking.map((r) => [r.name, r.days]),
    [["Ana", 2], ["Bruno", 1]],
  );
  assert.equal(detail.body.group.myPosition, 2);

  // Feed visível para todos os membros, com a foto acessível
  const feed = await call("GET", `/groups/${id}/feed`, null, B);
  assert.equal(feed.body.checkins.length, 4);
  assert.ok(feed.body.checkins.every((c) => c.userName !== "Caio"));
  const img = await fetch(base.replace("/api", "") + feed.body.checkins[0].photo);
  assert.equal(img.status, 200);

  // Curtir
  const like = await call("POST", `/checkins/${c1.body.checkin.id}/like`, null, B);
  assert.deepEqual(like.body, { liked: true, likes: 1 });

  // Só o dono apaga o próprio check-in
  assert.equal((await call("DELETE", `/checkins/${c1.body.checkin.id}`, null, B)).status, 404);
  assert.equal((await call("DELETE", `/checkins/${c1.body.checkin.id}`, null, A)).status, 200);

  // Sair da competição
  await call("POST", `/groups/${id}/leave`, null, A);
  const after = await call("GET", `/groups/${id}`, null, B);
  assert.equal(after.body.group.ownerId !== undefined, true);
  assert.equal(after.body.ranking.length, 1);
});
