/* ─────────────────────────────────────────────────────────────
   Бейби Ленд · заявките към базата (Cloudflare D1 = SQLite)
   22.10 · Cloudflare · пренесено от netlify/functions/_lib/repo.mjs (Postgres) — СЪЩИТЕ методи,
   същите редове навън; SQL-ът е на SQLite. Остават: профили, сесии, опити, дневникът на админа.

   РЕШЕНИЯТА (спазват се навсякъде):
     · ДАТИТЕ са ISO текст в UTC от Date.toISOString() — винаги "ГГГГ-ММ-ДДTЧЧ:ММ:СС.мммZ".
       Еднаква дължина и зона → сравнението на текст (<, >) е сравнение на време, а редът се
       чете с очи в конзолата на D1. Времената идват от кода (now), никога от базата
       (няма DEFAULT CURRENT_TIMESTAMP — той е в друг формат и щеше да счупи сравнението).
     · locked е INTEGER 0/1 в базата → boolean навън (rowU).
     · before/after в admin_log са JSON текст (api.mjs · jsonPole ги разчита).
     · Всяка стойност отива през prepare(…).bind(…) с ? — никога като текст в заявката.
       D1 не приема undefined — затова всичко минава през v().

   makeRepoVPamet() — СЪЩИЯТ интерфейс, но в паметта на процеса. Само за dev/proba/server_api.js.
   Пробите на Cloudflare (test_dostap_cf.mjs, server_cf.js) ползват makeRepo върху D1-шим (node:sqlite).
   ПЪТ НАЗАД: копието отпреди 22.10 (Postgres) е в dev/_netlify_staro/netlify/functions/_lib/repo.mjs.
   ───────────────────────────────────────────────────────────── */

const ts = (d) => new Date(d).toISOString();
const v = (x) => (x === undefined ? null : x);
const U_POLETA = "id, email, pass_hash, created_at, access_until, locked, last_login";

/** ред от users → същата форма като при Postgres (locked е boolean) */
function rowU(r) {
  if (!r) return null;
  const u = { ...r };
  if ("locked" in u) u.locked = !!u.locked;
  return u;
}

export function makeRepo(db) {
  const st = (sql, ...params) => db.prepare(sql).bind(...params.map(v));
  const first = async (sql, ...params) => rowU(await st(sql, ...params).first());
  const all = async (sql, ...params) => {
    const r = await st(sql, ...params).all();
    return r && Array.isArray(r.results) ? r.results : [];
  };
  const run = (sql, ...params) => st(sql, ...params).run();

  return {
    async getUserByEmail(email) {
      return first(`SELECT ${U_POLETA} FROM users WHERE email = ?`, email);
    },

    /** null ако имейлът вече е зает */
    async insertUser({ email, passHash, createdAt, accessUntil }) {
      return first(
        `INSERT INTO users (email, pass_hash, created_at, access_until, locked)
         VALUES (?, ?, ?, ?, 0)
         ON CONFLICT (email) DO NOTHING
         RETURNING ${U_POLETA}`,
        email, passHash, ts(createdAt), ts(accessUntil));
    },

    async setAccessUntil(id, until) {
      return first(`UPDATE users SET access_until = ? WHERE id = ? RETURNING ${U_POLETA}`, ts(until), id);
    },

    async setLocked(id, locked) {
      return first(`UPDATE users SET locked = ? WHERE id = ? RETURNING ${U_POLETA}`, locked ? 1 : 0, id);
    },

    async setPassword(id, passHash) {
      return first(`UPDATE users SET pass_hash = ? WHERE id = ? RETURNING ${U_POLETA}`, passHash, id);
    },

    async touchLogin(id, at) {
      await run(`UPDATE users SET last_login = ? WHERE id = ?`, ts(at), id);
    },

    /** сесиите падат и с ON DELETE CASCADE (D1 пази чуждите ключове), и изрично тук — колан и тиранти */
    async deleteUser(id) {
      await run(`DELETE FROM sessions WHERE user_id = ?`, id);
      await run(`DELETE FROM users WHERE id = ?`, id);
    },

    /** без хеша на паролата */
    async listUsers() {
      return (await all(`SELECT id, email, created_at, access_until, locked, last_login FROM users ORDER BY created_at DESC, id DESC`)).map(rowU);
    },

    async createSession(tokenHash, userId, createdAt, expiresAt) {
      await run(`INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)`,
        tokenHash, userId, ts(createdAt), ts(expiresAt));
    },

    async getSessionUser(tokenHash, now) {
      return first(
        `SELECT u.id, u.email, u.pass_hash, u.created_at, u.access_until, u.locked, u.last_login
         FROM sessions s JOIN users u ON u.id = s.user_id
         WHERE s.token_hash = ? AND s.expires_at > ?`,
        tokenHash, ts(now));
    },

    async deleteSession(tokenHash) {
      await run(`DELETE FROM sessions WHERE token_hash = ?`, tokenHash);
    },

    async deleteUserSessions(userId) {
      await run(`DELETE FROM sessions WHERE user_id = ?`, userId);
    },

    async countAttempts(subject, kind, since) {
      const r = await st(`SELECT COUNT(*) AS n FROM login_attempts WHERE subject = ? AND kind = ? AND at > ?`, subject, kind, ts(since)).first();
      return r ? Number(r.n) || 0 : 0;
    },

    async addAttempt(subject, kind, at) {
      await run(`INSERT INTO login_attempts (subject, kind, at) VALUES (?, ?, ?)`, subject, kind, ts(at));
    },

    async clearAttempts(subject, kind) {
      await run(`DELETE FROM login_attempts WHERE subject = ? AND kind = ?`, subject, kind);
    },

    /** чистене при вход: изтекли сесии и опити по-стари от ден */
    async cleanup(now) {
      await run(`DELETE FROM sessions WHERE expires_at < ?`, ts(now));
      await run(`DELETE FROM login_attempts WHERE at < ?`, ts(new Date(new Date(now).getTime() - 86400000)));
    },

    /* ── дневникът на админа (таблица admin_log, миграция 0002) ──
       before/after са JSON текст · никога парола, хеш или токен (api.mjs · snimkaNa). */
    async addAdminLog({ at, admin, action, target, before, after }) {
      const j = (x) => (x === undefined || x === null ? null : JSON.stringify(x));
      return first(
        `INSERT INTO admin_log (at, admin_email, action, target, before, after)
         VALUES (?, ?, ?, ?, ?, ?)
         RETURNING id, at, admin_email, action, target, before, after`,
        ts(at), admin, action, target === undefined ? null : target, j(before), j(after));
    },

    /** последните `limit` реда, най-новият отпред */
    async listAdminLog(limit = 200) {
      return all(`SELECT id, at, admin_email, action, target, before, after FROM admin_log ORDER BY id DESC LIMIT ?`,
        Math.max(1, Math.min(1000, Math.floor(Number(limit) || 200))));
    },
  };
}

/* ═══ ХРАНИЛИЩЕ В ПАМЕТТА · само за dev/proba/server_api.js ═══
   Държи се като таблиците от миграции 0001/0002: email UNIQUE, сесиите падат с профила,
   редовете се връщат като копия. (непроменено от 21.10) */
export function makeRepoVPamet() {
  const users = new Map();      // id → ред
  const sessions = new Map();   // token_hash → {user_id, created_at, expires_at}
  let attempts = [];            // {subject, kind, at}
  const log = [];
  let nextId = 1;
  let nextLog = 1;
  const kopie = (u) => (u ? { ...u } : null);
  const bezHash = (u) => { const { pass_hash, ...ost } = u; return { ...ost }; };
  const poEmail = (email) => { for (const u of users.values()) if (u.email === email) return u; return null; };
  const t = (d) => new Date(d).getTime();

  return {
    async getUserByEmail(email) { return kopie(poEmail(email)); },
    async insertUser({ email, passHash, createdAt, accessUntil }) {
      if (poEmail(email)) return null;
      const u = { id: nextId++, email, pass_hash: passHash, created_at: new Date(createdAt), access_until: new Date(accessUntil), locked: false, last_login: null };
      users.set(u.id, u);
      return kopie(u);
    },
    async setAccessUntil(id, until) { const u = users.get(id); if (!u) return null; u.access_until = new Date(until); return kopie(u); },
    async setLocked(id, locked) { const u = users.get(id); if (!u) return null; u.locked = !!locked; return kopie(u); },
    async setPassword(id, passHash) { const u = users.get(id); if (!u) return null; u.pass_hash = passHash; return kopie(u); },
    async touchLogin(id, at) { const u = users.get(id); if (u) u.last_login = new Date(at); },
    async deleteUser(id) {
      users.delete(id);
      for (const [h, s] of sessions) if (s.user_id === id) sessions.delete(h);   // ON DELETE CASCADE
    },
    async listUsers() {
      return [...users.values()].sort((a, b) => t(b.created_at) - t(a.created_at) || b.id - a.id).map(bezHash);
    },
    async createSession(tokenHash, userId, createdAt, expiresAt) {
      if (sessions.has(tokenHash)) throw new Error("token_hash вече съществува");
      if (!users.has(userId)) throw new Error("няма такъв user_id");
      sessions.set(tokenHash, { user_id: userId, created_at: new Date(createdAt), expires_at: new Date(expiresAt) });
    },
    async getSessionUser(tokenHash, now) {
      const s = sessions.get(tokenHash);
      if (!s || !(t(s.expires_at) > t(now))) return null;
      return kopie(users.get(s.user_id));
    },
    async deleteSession(tokenHash) { sessions.delete(tokenHash); },
    async deleteUserSessions(userId) { for (const [h, s] of sessions) if (s.user_id === userId) sessions.delete(h); },
    async countAttempts(subject, kind, since) { return attempts.filter((a) => a.subject === subject && a.kind === kind && t(a.at) > t(since)).length; },
    async addAttempt(subject, kind, at) { attempts.push({ subject, kind, at: new Date(at) }); },
    async clearAttempts(subject, kind) { attempts = attempts.filter((a) => !(a.subject === subject && a.kind === kind)); },
    async cleanup(now) {
      for (const [h, s] of sessions) if (t(s.expires_at) < t(now)) sessions.delete(h);
      attempts = attempts.filter((a) => t(a.at) >= t(now) - 86400000);
    },
    async addAdminLog({ at, admin, action, target, before, after }) {
      const r = { id: nextLog++, at: new Date(at), admin_email: admin, action, target: target === undefined ? null : target,
        before: before === undefined || before === null ? null : JSON.parse(JSON.stringify(before)),
        after: after === undefined || after === null ? null : JSON.parse(JSON.stringify(after)) };
      log.push(r);
      return { ...r };
    },
    async listAdminLog(limit = 200) {
      const n = Math.max(1, Math.min(1000, Math.floor(Number(limit) || 200)));
      return log.slice().reverse().slice(0, n).map((r) => ({ ...r }));
    },
    _broiSesii() { return sessions.size; },
  };
}
