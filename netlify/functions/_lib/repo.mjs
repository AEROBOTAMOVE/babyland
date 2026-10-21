/* ─────────────────────────────────────────────────────────────
   Бейби Ленд · заявките към базата (Netlify Database / Postgres)
   21.10 · достъп · пренесено от AERO клиент (_lib/repo.mjs) — заявките са същите; махнати са
   бележките (notes). Остават: профили, сесии, опити, дневникът на админа.
   sql е tagged template (db.sql от @netlify/database) — всяка стойност
   отива като параметър, никога като текст в заявката.
   Времената идват от кода (now), за да е едно и също часовникът
   при проверка и при запис.

   makeRepoVPamet() — СЪЩИЯТ интерфейс, но в паметта на процеса. Само за пробите
   (dev/proba/test_dostap.mjs и dev/proba/server_api.js). runtime.mjs НЕ го ползва.
   test_dostap.mjs сверява, че двете хранилища имат едни и същи методи.
   ПЪТ НАЗАД: файлът е нов — махни папката netlify/.
   ───────────────────────────────────────────────────────────── */

const one = (rows) => (Array.isArray(rows) && rows.length ? rows[0] : null);
const ts = (d) => d.toISOString();

export function makeRepo(sql) {
  return {
    async getUserByEmail(email) {
      return one(await sql`
        SELECT id, email, pass_hash, created_at, access_until, locked, last_login
        FROM users WHERE email = ${email}`);
    },

    /** null ако имейлът вече е зает */
    async insertUser({ email, passHash, createdAt, accessUntil }) {
      return one(await sql`
        INSERT INTO users (email, pass_hash, created_at, access_until)
        VALUES (${email}, ${passHash}, ${ts(createdAt)}::timestamptz, ${ts(accessUntil)}::timestamptz)
        ON CONFLICT (email) DO NOTHING
        RETURNING id, email, pass_hash, created_at, access_until, locked, last_login`);
    },

    async setAccessUntil(id, until) {
      return one(await sql`
        UPDATE users SET access_until = ${ts(until)}::timestamptz WHERE id = ${id}
        RETURNING id, email, pass_hash, created_at, access_until, locked, last_login`);
    },

    async setLocked(id, locked) {
      return one(await sql`
        UPDATE users SET locked = ${!!locked} WHERE id = ${id}
        RETURNING id, email, pass_hash, created_at, access_until, locked, last_login`);
    },

    async setPassword(id, passHash) {
      return one(await sql`
        UPDATE users SET pass_hash = ${passHash} WHERE id = ${id}
        RETURNING id, email, pass_hash, created_at, access_until, locked, last_login`);
    },

    async touchLogin(id, at) {
      await sql`UPDATE users SET last_login = ${ts(at)}::timestamptz WHERE id = ${id}`;
    },

    /** сесиите падат с ON DELETE CASCADE */
    async deleteUser(id) {
      await sql`DELETE FROM users WHERE id = ${id}`;
    },

    /** без хеша на паролата */
    async listUsers() {
      const rows = await sql`
        SELECT id, email, created_at, access_until, locked, last_login
        FROM users ORDER BY created_at DESC, id DESC`;
      return Array.isArray(rows) ? rows : [];
    },

    async createSession(tokenHash, userId, createdAt, expiresAt) {
      await sql`
        INSERT INTO sessions (token_hash, user_id, created_at, expires_at)
        VALUES (${tokenHash}, ${userId}, ${ts(createdAt)}::timestamptz, ${ts(expiresAt)}::timestamptz)`;
    },

    async getSessionUser(tokenHash, now) {
      return one(await sql`
        SELECT u.id, u.email, u.pass_hash, u.created_at, u.access_until, u.locked, u.last_login
        FROM sessions s JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = ${tokenHash} AND s.expires_at > ${ts(now)}::timestamptz`);
    },

    async deleteSession(tokenHash) {
      await sql`DELETE FROM sessions WHERE token_hash = ${tokenHash}`;
    },

    async deleteUserSessions(userId) {
      await sql`DELETE FROM sessions WHERE user_id = ${userId}`;
    },

    async countAttempts(subject, kind, since) {
      const r = one(await sql`
        SELECT COUNT(*)::int AS n FROM login_attempts
        WHERE subject = ${subject} AND kind = ${kind} AND at > ${ts(since)}::timestamptz`);
      return r ? Number(r.n) || 0 : 0;
    },

    async addAttempt(subject, kind, at) {
      await sql`
        INSERT INTO login_attempts (subject, kind, at)
        VALUES (${subject}, ${kind}, ${ts(at)}::timestamptz)`;
    },

    async clearAttempts(subject, kind) {
      await sql`DELETE FROM login_attempts WHERE subject = ${subject} AND kind = ${kind}`;
    },

    /** чистене при вход: изтекли сесии и опити по-стари от ден */
    async cleanup(now) {
      await sql`DELETE FROM sessions WHERE expires_at < ${ts(now)}::timestamptz`;
      await sql`DELETE FROM login_attempts WHERE at < ${ts(new Date(now.getTime() - 86400000))}::timestamptz`;
    },

    /* ── дневникът на админа (таблица admin_log, миграция 002) ──
       Всеки ред: кога, кой админ, какво действие, над кого, какво беше → какво стана.
       before/after са JSON (jsonb) · никога парола, хеш или токен (api.mjs · snimkaNa). */
    async addAdminLog({ at, admin, action, target, before, after }) {
      const j = (x) => (x === undefined || x === null ? null : JSON.stringify(x));
      return one(await sql`
        INSERT INTO admin_log (at, admin_email, action, target, before, after)
        VALUES (${ts(at)}::timestamptz, ${admin}, ${action}, ${target === undefined ? null : target}, ${j(before)}::jsonb, ${j(after)}::jsonb)
        RETURNING id, at, admin_email, action, target, before, after`);
    },

    /** последните `limit` реда, най-новият отпред */
    async listAdminLog(limit = 200) {
      const rows = await sql`
        SELECT id, at, admin_email, action, target, before, after
        FROM admin_log ORDER BY id DESC LIMIT ${Math.max(1, Math.min(1000, Math.floor(Number(limit) || 200)))}`;
      return Array.isArray(rows) ? rows : [];
    },
  };
}

/* ═══ ХРАНИЛИЩЕ В ПАМЕТТА · само за пробите ═══
   Държи се като таблиците от миграции 001/002: email UNIQUE, сесиите падат с профила,
   редовете се връщат като копия (кодът отвън не може да промени «базата» по погрешка). */
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
    /* само за пробите: колко сесии има (за проверка, че изтриването ги сваля) */
    _broiSesii() { return sessions.size; },
  };
}
