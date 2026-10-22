/* ─────────────────────────────────────────────────────────────
   Бейби Ленд · логиката на крайните точки на достъпа
   21.10 · достъп · пренесено от AERO клиент (_lib/api.mjs) и ОРЯЗАНО: без данни на бота,
   Oracle, индикатори, макро, бележки, аларми, Телеграм. Остават: регистрация, вход, изход,
   /api/me, админ списък, админ действия, CSV файлът, дневникът на админа.
   Базата (repo), списъкът с администратори и часовникът се подават отвън,
   затова целият поток се тества локално без Postgres (dev/proba/test_dostap.mjs).
   22.10 · Cloudflare · преместено от netlify/functions/_lib/ — логиката е СЪЩАТА байт в байт; вика го worker/index.mjs.
   ПЪТ НАЗАД: копието отпреди 22.10 е в dev/_netlify_staro/netlify/functions/_lib/.

   ДОГОВОРЪТ (същият произход, бисквитка HttpOnly «bl_s», JSON, no-store):
     POST /api/register  {email, password} → 200 {ok, user, kontakti, cena_eur, access_days, msg} + Set-Cookie · 409 · 400 · 429
     POST /api/login     {email, password} → 200 (същото) + Set-Cookie · 401 · 429
     POST /api/logout                      → 200 {ok:true} + изтрита бисквитка
     GET  /api/me                          → 200 {logged_in:true, user, kontakti, cena_eur, access_days, msg}
                                             · 401 {error, logged_in:false, kontakti, cena_eur, access_days}
     GET  /api/admin/users                 → 200 {users:[…], broi:{vsichki,aktivni,izteklite,zaklyucheni}, now} · 401 · 403
     POST /api/admin/user  {action, email, days?, until?, password?} → 200 {ok, action, user | deleted} · 400 · 401 · 403 · 404 · 409
     GET  /api/admin/export                → text/csv (имейл; статус; регистриран; достъп до; последно влизане) · 401 · 403
     GET  /api/admin/log                   → 200 {ok, zapisi:[…], broi, max, now} · 401 · 403
   Промените (register, login, admin/user) искат Content-Type: application/json (CSRF пазачът).
   ───────────────────────────────────────────────────────────── */
import {
  MSG, SESSION_DAYS, LOGIN_WINDOW_MS, LOGIN_MAX_FAILS, REG_WINDOW_MS, REG_MAX_PER_IP,
  PASSWORD_MAX, ACCESS_DAYS, CENA_EUR, KONTAKTI, TOKEN_RE, STATUS_BG,
  normEmail, validEmail, passwordProblem, validDays, parseUntil,
  hashPassword, verifyPassword, newToken, hashToken,
  addDays, registrationUntil, extendUntil, mePayload, adminRow, broiNa, iso, sofiaText,
} from "./core.mjs";
import { json, API_HEADERS, isJsonRequest, readJsonBody, readCookie, sessionCookie, clearCookie } from "./http.mjs";

export const ADMIN_LOG_MAX = 200;

/** CSV поле · в кавички; =,+,-,@ отпред → апостроф (Excel не го пуска като формула) */
export function csvPole(v) {
  let s = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return '"' + s.replace(/"/g, '""') + '"';
}
/** ";" — така Excel с български настройки го отваря направо в колони; BOM — за кирилицата */
export const CSV_RAZDELITEL = ";";
export const CSV_ZAGLAVIE = ["имейл", "статус", "регистриран", "достъп до", "последно влизане"];

export function makeApi({ repo, adminEmails, now = () => new Date() }) {
  let dummyHash = null;
  const dummy = async () => (dummyHash ||= await hashPassword("babyland-dummy-password-не-се-ползва"));

  const admins = () => {
    try {
      return adminEmails() || new Set();
    } catch (e) {
      return new Set();
    }
  };

  const guard = (fn) => async (req, ctx) => {
    try {
      return await fn(req, ctx || {});
    } catch (e) {
      console.error("[babyland-api]", (e && e.stack) || e);
      return json(500, { error: MSG.internal });
    }
  };

  const onlyMethod = (req, m) => (req.method === m ? null : json(405, { error: MSG.method }, { Allow: m }));

  /** POST + JSON + разчетено тяло · { body } или { res } */
  async function postJson(req) {
    const bad = onlyMethod(req, "POST");
    if (bad) return { res: bad };
    if (!isJsonRequest(req)) return { res: json(415, { error: MSG.needJson }) };
    const b = await readJsonBody(req);
    if (b.error) return { res: b.error };
    return { body: b.value };
  }

  async function currentUser(req, n) {
    const tok = readCookie(req.headers.get("cookie"));
    if (!tok || !TOKEN_RE.test(tok)) return null;
    return repo.getSessionUser(hashToken(tok), n);
  }

  async function startSession(user, n) {
    const token = newToken();
    await repo.createSession(hashToken(token), user.id, n, addDays(n, SESSION_DAYS));
    return sessionCookie(token, SESSION_DAYS * 86400);
  }

  const neVpisan = () => json(401, { error: MSG.notLogged, logged_in: false, kontakti: { ...KONTAKTI }, cena_eur: CENA_EUR, access_days: ACCESS_DAYS });

  /** { user, set } за администратор или { res } с 401/403 */
  async function requireAdmin(req, n) {
    const user = await currentUser(req, n);
    if (!user) return { res: json(401, { error: MSG.notLogged, logged_in: false }) };
    const set = admins();
    if (!set.has(normEmail(user.email))) return { res: json(403, { error: MSG.notAdmin }) };
    return { user, set };
  }

  /** Пазач без състезание: броене → запис на опита → повторно броене.
      Всяка заявка брои и собствения си запис, затова едновременни заявки
      не минават тавана. Вече блокираният опит не пише ред. */
  async function takeSlot(subject, kind, since, max, at) {
    if ((await repo.countAttempts(subject, kind, since)) >= max) return false;
    await repo.addAttempt(subject, kind, at);
    return (await repo.countAttempts(subject, kind, since)) <= max;
  }

  /* ── POST /api/register ── веднага 14 дни безплатен пробен период ── */
  const register = guard(async (req, ctx) => {
    const p = await postJson(req);
    if (p.res) return p.res;
    const email = normEmail(p.body.email);
    if (!validEmail(email)) return json(400, { error: MSG.badEmail });
    const pp = passwordProblem(p.body.password);
    if (pp) return json(400, { error: pp });
    const n = now();
    const ip = ctx && ctx.ip ? String(ctx.ip) : "";
    /* всеки опит от IP се брои — и този със зает имейл (409), иначе
       регистрацията е безкрайна проба кои имейли съществуват */
    if (ip && !(await takeSlot(ip, "register", new Date(n.getTime() - REG_WINDOW_MS), REG_MAX_PER_IP, n))) {
      return json(429, { error: MSG.regTooMany }, { "Retry-After": "3600" });
    }
    const passHash = await hashPassword(p.body.password);
    const user = await repo.insertUser({ email, passHash, createdAt: n, accessUntil: registrationUntil(n) });
    if (!user) return json(409, { error: MSG.emailTaken });
    await repo.touchLogin(user.id, n);
    user.last_login = n;
    const cookie = await startSession(user, n);
    return json(200, { ok: true, ...mePayload(user, admins(), n) }, { "Set-Cookie": cookie });
  });

  /* ── POST /api/login ── и с изтекъл достъп (тогава user.status "expired" + msg) ── */
  const login = guard(async (req) => {
    const p = await postJson(req);
    if (p.res) return p.res;
    const email = normEmail(p.body.email);
    const pw = typeof p.body.password === "string" ? p.body.password : "";
    if (!validEmail(email) || !pw || pw.length > PASSWORD_MAX) return json(401, { error: MSG.badLogin });
    const n = now();
    /* опитът се записва ПРЕДИ проверката на паролата; успешният вход го чисти */
    if (!(await takeSlot(email, "login", new Date(n.getTime() - LOGIN_WINDOW_MS), LOGIN_MAX_FAILS, n))) {
      return json(429, { error: MSG.loginTooMany }, { "Retry-After": "900" });
    }
    const user = await repo.getUserByEmail(email);
    let ok = false;
    if (user) ok = await verifyPassword(pw, user.pass_hash);
    else await verifyPassword(pw, await dummy()); // същото време с и без такъв имейл
    if (!ok) return json(401, { error: MSG.badLogin }); // опитът вече е записан от takeSlot
    await repo.clearAttempts(email, "login");
    await repo.touchLogin(user.id, n);
    user.last_login = n;
    await repo.cleanup(n);
    const cookie = await startSession(user, n);
    return json(200, { ok: true, ...mePayload(user, admins(), n) }, { "Set-Cookie": cookie });
  });

  /* ── POST /api/logout ── без изискване за JSON: SameSite=Lax не праща бисквитката от чужд сайт ── */
  const logout = guard(async (req) => {
    const bad = onlyMethod(req, "POST");
    if (bad) return bad;
    const tok = readCookie(req.headers.get("cookie"));
    if (tok && TOKEN_RE.test(tok)) await repo.deleteSession(hashToken(tok));
    return json(200, { ok: true }, { "Set-Cookie": clearCookie() });
  });

  /* ── GET /api/me ── */
  const me = guard(async (req) => {
    const bad = onlyMethod(req, "GET");
    if (bad) return bad;
    const n = now();
    const user = await currentUser(req, n);
    if (!user) return neVpisan();
    return json(200, { logged_in: true, ...mePayload(user, admins(), n) });
  });

  /* ═══ ДНЕВНИКЪТ НА АДМИНА (като AERO 30.09) ═══
     Всяко УСПЕШНО действие на админ пише ред: {utc, admin, action, target, before → after}.
     before/after носят само достъпа (до кога, заключен) — НИКОГА парола, хеш или токен.
     Дневникът не спира действието: грешка при записа (миграция 002 още не е минала) =
     действието минава, отговорът казва dnevnik:false, причината е в логовете. */
  const snimkaNa = (u) => (u ? { access_until: iso(u.access_until), locked: !!u.locked } : null);
  async function zapishiDeistvie(admin, action, target, before, after, n) {
    if (typeof repo.addAdminLog !== "function") return false;
    try {
      await repo.addAdminLog({ at: n, admin: normEmail(admin.email), action, target: target || null,
        before: before === undefined ? null : before, after: after === undefined ? null : after });
      return true;
    } catch (e) {
      console.error("[babyland-api] дневникът на админа не записа:", (e && e.message) || e);
      return false;
    }
  }
  const jsonPole = (x) => {
    if (x === null || x === undefined) return null;
    if (typeof x === "string") { try { return JSON.parse(x); } catch (e) { return x; } }
    return x;
  };
  const logRed = (r) => ({ utc: iso(r.at), admin: r.admin_email, action: r.action, target: r.target || null, before: jsonPole(r.before), after: jsonPole(r.after) });

  /* ── GET /api/admin/users ── всички регистрирани + броят им ── */
  const adminUsers = guard(async (req) => {
    const bad = onlyMethod(req, "GET");
    if (bad) return bad;
    const n = now();
    const a = await requireAdmin(req, n);
    if (a.res) return a.res;
    const rows = await repo.listUsers();
    const users = rows.map((u) => adminRow(u, a.set, n));
    return json(200, { users, broi: broiNa(users), now: n.toISOString() });
  });

  /* ── POST /api/admin/user ── create | extend | set_until | lock | unlock | delete | set_password ── */
  const adminUser = guard(async (req) => {
    const p = await postJson(req);
    if (p.res) return p.res;
    const n = now();
    const a = await requireAdmin(req, n);
    if (a.res) return a.res;
    const b = p.body;
    const action = String(b.action || "");
    const email = normEmail(b.email);
    if (!validEmail(email)) return json(400, { error: MSG.badEmail });
    const done = async (u, before = null, after = undefined) => {
      const dnevnik = await zapishiDeistvie(a.user, action, email, before, after === undefined ? snimkaNa(u) : after, n);
      return json(200, { ok: true, action, user: adminRow(u, a.set, n), dnevnik });
    };

    if (action === "create") {
      const pp = passwordProblem(b.password);
      if (pp) return json(400, { error: pp });
      let until;
      if (b.until !== undefined && b.until !== null && b.until !== "") {
        until = parseUntil(b.until);
        if (!until) return json(400, { error: MSG.badUntil });
      } else {
        const days = b.days === undefined || b.days === null || b.days === "" ? ACCESS_DAYS : validDays(b.days);
        if (!days) return json(400, { error: MSG.badDays });
        until = addDays(n, days);
      }
      const user = await repo.insertUser({ email, passHash: await hashPassword(b.password), createdAt: n, accessUntil: until });
      if (!user) return json(409, { error: MSG.emailTaken });
      return done(user, null);
    }

    const known = ["extend", "set_until", "lock", "unlock", "delete", "set_password"];
    if (!known.includes(action)) return json(400, { error: MSG.badAction });
    const target = await repo.getUserByEmail(email);
    if (!target) return json(404, { error: MSG.noUser });
    const predi = snimkaNa(target);

    switch (action) {
      case "extend": {
        const days = validDays(b.days);
        if (!days) return json(400, { error: MSG.badDays });
        return done(await repo.setAccessUntil(target.id, extendUntil(target.access_until, days, n)), predi);
      }
      case "set_until": {
        const until = parseUntil(b.until);
        if (!until) return json(400, { error: MSG.badUntil });
        return done(await repo.setAccessUntil(target.id, until), predi);
      }
      case "lock":
        if (a.set.has(email)) return json(400, { error: MSG.adminNoLock });
        return done(await repo.setLocked(target.id, true), predi);
      case "unlock":
        return done(await repo.setLocked(target.id, false), predi);
      case "set_password": {
        const pp = passwordProblem(b.password);
        if (pp) return json(400, { error: pp });
        const u = await repo.setPassword(target.id, await hashPassword(b.password));
        await repo.deleteUserSessions(target.id); // старите влизания падат
        await repo.clearAttempts(email, "login");
        /* паролата НЕ влиза в дневника — само че е сменена и че старите влизания паднаха */
        return done(u, null, { parola: "сменена", vlizania: "прекъснати" });
      }
      case "delete": {
        if (email === normEmail(a.user.email)) return json(400, { error: MSG.noSelfDelete });
        await repo.deleteUser(target.id);
        await repo.clearAttempts(email, "login");
        const dnevnik = await zapishiDeistvie(a.user, action, email, predi, null, n);
        return json(200, { ok: true, action, deleted: email, dnevnik });
      }
      default:
        return json(400, { error: MSG.badAction });
    }
  });

  /* ── GET /api/admin/export ── CSV с всички потребители · без хеш, без сесии ── */
  const sofiaDenNa = (d) => {
    try { return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Sofia", year: "numeric", month: "2-digit", day: "2-digit" }).format(d); } catch (e) { return d.toISOString().slice(0, 10); }
  };
  const adminExport = guard(async (req) => {
    const bad = onlyMethod(req, "GET");
    if (bad) return bad;
    const n = now();
    const a = await requireAdmin(req, n);
    if (a.res) return a.res;
    const rows = (await repo.listUsers()).map((u) => adminRow(u, a.set, n));
    const redove = [CSV_ZAGLAVIE.map(csvPole).join(CSV_RAZDELITEL)];
    for (const r of rows) {
      redove.push([r.email, STATUS_BG[r.status] || r.status, sofiaText(r.created_at), sofiaText(r.access_until), sofiaText(r.last_login)]
        .map(csvPole).join(CSV_RAZDELITEL));
    }
    const den = sofiaDenNa(n);
    await zapishiDeistvie(a.user, "export", null, null, { potrebiteli: rows.length }, n);
    return new Response("﻿" + redove.join("\r\n") + "\r\n", {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="babyland-potrebiteli-${den}.csv"`,
        ...API_HEADERS,
      },
    });
  });

  /* ── GET /api/admin/log ── последните ADMIN_LOG_MAX действия, най-новото отпред · само админ ── */
  const adminLog = guard(async (req) => {
    const bad = onlyMethod(req, "GET");
    if (bad) return bad;
    const n = now();
    const a = await requireAdmin(req, n);
    if (a.res) return a.res;
    if (typeof repo.listAdminLog !== "function") return json(200, { ok: true, zapisi: [], broi: 0, max: ADMIN_LOG_MAX, now: n.toISOString() });
    let rows;
    try {
      rows = await repo.listAdminLog(ADMIN_LOG_MAX);
    } catch (e) {
      console.error("[babyland-api] дневникът на админа не се прочете:", (e && e.message) || e);
      return json(503, { ok: false, error: "Дневникът не се прочете. Опитай пак след малко." });
    }
    const zapisi = rows.slice(0, ADMIN_LOG_MAX).map(logRed);
    return json(200, { ok: true, zapisi, broi: zapisi.length, max: ADMIN_LOG_MAX, now: n.toISOString() });
  });

  /* пътищата — по тях worker/index.mjs (Cloudflare) и dev/proba/server_api.js / server_cf.js избират функцията */
  const PATISHTA = {
    "/api/register": register,
    "/api/login": login,
    "/api/logout": logout,
    "/api/me": me,
    "/api/admin/users": adminUsers,
    "/api/admin/user": adminUser,
    "/api/admin/export": adminExport,
    "/api/admin/log": adminLog,
  };

  return { register, login, logout, me, adminUsers, adminUser, adminExport, adminLog, PATISHTA,
    nyama: () => json(404, { error: MSG.notFound }) };
}
