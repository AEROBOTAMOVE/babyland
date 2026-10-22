// 🧪 22.10 · Cloudflare · ТЕСТЪТ НА СЪРВЪРА БЕЗ МРЕЖА — през worker.fetch + D1-шим (node:sqlite, в паметта)
// СЪЩИТЕ проверки като test_dostap.mjs от 21.10 (Netlify; копие в dev/_netlify_staro/test_dostap.mjs),
// но заявката минава през ЦЕЛИЯ Worker (worker/index.mjs): маршрутът /api/*, CF-Connecting-IP, env.ADMIN_EMAILS,
// env.DB = D1-шим с ПРИЛОЖЕНИТЕ миграции migrations/*.sql. Часовникът е подменен (makeWorker({ now })).
// Нищо не слуша на порт, нищо не излиза навън, нищо не се пише на диска.
// ПУСКАНЕ:  node dev/proba/test_dostap_cf.mjs        (изход 0 = всичко минава, 1 = има паднал)
// ПЪТ НАЗАД: само чете кода; махни файла.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { makeD1, prilozhiMigracii } from "./d1_shim.mjs";

const ТУК = dirname(fileURLToPath(import.meta.url));
const КОРЕН = join(ТУК, "..", "..");
const LIB = join(КОРЕН, "worker", "lib");
const внеси = (ф) => import(pathToFileURL(join(LIB, ф)).href);
const core = await внеси("core.mjs");
const { CSV_ZAGLAVIE } = await внеси("api.mjs");
const { makeRepo, makeRepoVPamet } = await внеси("repo.mjs");
const { ADMINS } = await внеси("admins.mjs");
const { makeWorker } = await import(pathToFileURL(join(КОРЕН, "worker", "index.mjs")).href);

const ДЕН = 86400000;
const АДМИН = "aaeromove@gmail.com";
const ДОГОВОР_MSG = "Пробният период свърши. За продължение — 15 € на месец, колкото една салата. Пиши ни — във Facebook, Instagram или на имейл.";
const ДОГОВОР_MSG_ПЛАТЕН = "Достъпът изтече. За продължение — 15 € на месец, колкото една салата. Пиши ни — във Facebook, Instagram или на имейл.";

let минали = 0;
const паднали = [];
function провери(име, условие, подробно) {
  if (условие) { минали++; console.log("  ✅ " + име); }
  else { паднали.push(име); console.log("  🔴 " + име + (подробно !== undefined ? "  ←  " + JSON.stringify(подробно) : "")); }
}

/* ── часовникът, базата и Worker-ът ── */
const НАЧАЛО = Date.parse("2026-10-21T08:00:00.000Z");
let сега = НАЧАЛО;
const DB = makeD1();
const приложени = await prilozhiMigracii(DB);
let асетиВикнати = 0;
const env = {
  DB,
  ADMIN_EMAILS: "",
  ASSETS: { fetch: async (req) => { асетиВикнати++; const п = decodeURIComponent(new URL(req.url).pathname);
    return п === "/js/липсва.js" ? new Response("<!doctype html><title>SPA</title>", { status: 200, headers: { "content-type": "text/html; charset=utf-8" } })
      : new Response("статичен " + п, { status: 200, headers: { "content-type": "text/plain" } }); } },
};
const worker = makeWorker({ now: () => new Date(сега) });
const броиСесии = () => Number(DB._s.prepare("SELECT COUNT(*) AS n FROM sessions").get().n);

async function заявка(път, { method = "GET", body, cookie, ip = "10.0.0.1", ct = "application/json" } = {}) {
  const h = {};
  if (body !== undefined && ct) h["content-type"] = ct;
  if (cookie) h.cookie = cookie;
  if (ip) h["cf-connecting-ip"] = ip;
  const req = new Request("https://babyland.example" + път, { method, headers: h, body: body === undefined ? undefined : (typeof body === "string" ? body : JSON.stringify(body)) });
  const res = await worker.fetch(req, env, { waitUntil() {}, passThroughOnException() {} });
  const текст = new TextDecoder("utf-8", { ignoreBOM: true }).decode(await res.arrayBuffer());   // ignoreBOM: BOM-ът на CSV-то остава видим
  let j = null;
  try { j = JSON.parse(текст); } catch (e) { j = null; }
  const sc = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
  return { s: res.status, j, текст, h: res.headers, sc };
}
const бисквитка = (r) => { const x = r.sc.find((c) => c.startsWith("bl_s=")); return x ? x.split(";")[0] : null; };

console.log("\n🧪 Бейби Ленд · достъп · test_dostap_cf.mjs (Cloudflare Worker + D1-шим)\n");
console.log("— миграциите");
провери("migrations/: 0001_create-auth.sql и 0002_create-admin-log.sql приложени по ред", JSON.stringify(приложени) === JSON.stringify(["0001_create-auth.sql", "0002_create-admin-log.sql"]), приложени);
const таблици = DB._s.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map((r) => r.name);
провери("таблиците: admin_log, login_attempts, sessions, users", таблици.join() === "admin_log,login_attempts,sessions,users", таблици);
провери("миграциите са повторяеми (IF NOT EXISTS): второ прилагане не гърми", await prilozhiMigracii(DB).then(() => true, () => false));

/* ═══ 0 · константите на едно място ═══ */
console.log("— константите");
провери("ACCESS_DAYS = 14", core.ACCESS_DAYS === 14);
провери("CENA_EUR = 15", core.CENA_EUR === 15);
провери("COOKIE_NAME = bl_s", core.COOKIE_NAME === "bl_s");
провери("MSG.expired = дословно изречението от договора", core.MSG.expired === ДОГОВОР_MSG, core.MSG.expired);
провери("MSG.expiredPlaten = «Достъпът изтече. …» със същото второ изречение", core.MSG.expiredPlaten === ДОГОВОР_MSG_ПЛАТЕН, core.MSG.expiredPlaten);
провери("KONTAKTI = facebook, instagram, email, site (от babylandeu.com)",
  core.KONTAKTI.facebook === "https://www.facebook.com/Babyland.sale" && core.KONTAKTI.instagram === "https://www.instagram.com/bblandbulgaria/" &&
  core.KONTAKTI.email === "babyland.sale@gmail.com" && core.KONTAKTI.site === "https://babylandeu.com");
провери("aaeromove@gmail.com е в admins.mjs", ADMINS.includes(АДМИН));
провери("нито едно съобщение не споменава Телеграм", !Object.values(core.MSG).some((m) => /телеграм|telegram/i.test(m)));

/* ═══ 1 · регистрация ═══ */
console.log("— регистрация");
const r1 = await заявка("/api/register", { method: "POST", body: { email: "  Mama1@Abv.BG ", password: "парола123" } });
провери("POST /api/register → 200", r1.s === 200, r1.s);
провери("user.email нормализиран (малки букви, без интервали)", r1.j && r1.j.user && r1.j.user.email === "mama1@abv.bg", r1.j);
провери("user.status = active, admin = false", r1.j.user.status === "active" && r1.j.user.admin === false);
провери("user.days_left = 14 (цяло число)", r1.j.user.days_left === 14 && Number.isInteger(r1.j.user.days_left), r1.j.user.days_left);
провери("user.access_until = регистрацията + 14 дни", Date.parse(r1.j.user.access_until) - Date.parse(r1.j.user.created_at) === 14 * ДЕН);
провери("user.created_at = ISO на часовника", r1.j.user.created_at === new Date(НАЧАЛО).toISOString());
провери("user.proben = true", r1.j.user.proben === true);
провери("user има точно 7-те полета на договора",
  JSON.stringify(Object.keys(r1.j.user).sort()) === JSON.stringify(["access_until", "admin", "created_at", "days_left", "email", "proben", "status"]), Object.keys(r1.j.user));
провери("cena_eur = 15 · access_days = 14 · kontakti с 4 полета · msg = null",
  r1.j.cena_eur === 15 && r1.j.access_days === 14 && Object.keys(r1.j.kontakti).sort().join() === "email,facebook,instagram,site" && r1.j.msg === null);
const к1 = бисквитка(r1);
const scТекст = r1.sc.join(" | ");
провери("Set-Cookie bl_s: HttpOnly; Secure; SameSite=Lax; Path=/; 30 дни",
  !!к1 && /HttpOnly/.test(scТекст) && /Secure/.test(scТекст) && /SameSite=Lax/.test(scТекст) && /Path=\//.test(scТекст) && /Max-Age=2592000/.test(scТекст), scТекст);
провери("отговорът: Cache-Control no-store · Vary * · JSON", r1.h.get("cache-control") === "no-store" && r1.h.get("vary") === "*" && /application\/json/.test(r1.h.get("content-type")));

const r2 = await заявка("/api/register", { method: "POST", body: { email: "mama1@abv.bg", password: "друга-парола" } });
провери("втори опит със същия имейл → 409 + {error}", r2.s === 409 && typeof r2.j.error === "string", r2);
const r2б = await заявка("/api/register", { method: "POST", body: { email: "MAMA1@ABV.BG", password: "друга-парола" } });
провери("същият имейл с главни букви → 409", r2б.s === 409);
const r3 = await заявка("/api/register", { method: "POST", body: { email: "не-е-имейл", password: "парола123" }, ip: "10.0.0.2" });
провери("невалиден имейл → 400 + {error}", r3.s === 400 && r3.j.error === core.MSG.badEmail);
const r4 = await заявка("/api/register", { method: "POST", body: { email: "kratka@abv.bg", password: "123" }, ip: "10.0.0.2" });
провери("къса парола → 400", r4.s === 400 && r4.j.error === core.MSG.passShort);
const r5 = await заявка("/api/register", { method: "POST", body: "email=x", ct: "application/x-www-form-urlencoded", ip: "10.0.0.2" });
провери("без Content-Type: application/json → 415 (CSRF пазачът)", r5.s === 415);
const r5б = await заявка("/api/register", { method: "GET" });
провери("GET /api/register → 405", r5б.s === 405);

/* ═══ 2 · /api/me ═══ */
console.log("— /api/me");
const m0 = await заявка("/api/me");
провери("me без сесия → 401 + {error}", m0.s === 401 && typeof m0.j.error === "string", m0.j);
провери("401 носи и kontakti / cena_eur / access_days (за екрана преди регистрация)", m0.j.kontakti && m0.j.cena_eur === 15 && m0.j.access_days === 14);
const m0б = await заявка("/api/me", { cookie: "bl_s=garbage-not-a-token" });
провери("me с невалидна бисквитка → 401", m0б.s === 401);
const m1 = await заявка("/api/me", { cookie: к1 });
провери("me със сесия → 200 {user, kontakti, cena_eur, access_days}", m1.s === 200 && m1.j.user.email === "mama1@abv.bg" && m1.j.kontakti && m1.j.cena_eur === 15 && m1.j.access_days === 14);

/* ═══ 3 · вход / изход ═══ */
console.log("— вход и изход");
const l1 = await заявка("/api/login", { method: "POST", body: { email: "mama1@abv.bg", password: "грешна-парола" } });
провери("грешна парола → 401 + {error}", l1.s === 401 && l1.j.error === core.MSG.badLogin);
const l1б = await заявка("/api/login", { method: "POST", body: { email: "nyama@abv.bg", password: "парола123" } });
провери("несъществуващ имейл → 401 със същите думи (не издава кои имейли има)", l1б.s === 401 && l1б.j.error === core.MSG.badLogin);
const l2 = await заявка("/api/login", { method: "POST", body: { email: "Mama1@abv.bg", password: "парола123" } });
провери("вход с вярна парола → 200 + Set-Cookie bl_s", l2.s === 200 && !!бисквитка(l2) && l2.j.user.status === "active");
const к2 = бисквитка(l2);
const о1 = await заявка("/api/logout", { method: "POST", cookie: к2 });
провери("logout → 200 {ok:true} + изтрита бисквитка (Max-Age=0)", о1.s === 200 && о1.j.ok === true && о1.sc.some((c) => c.startsWith("bl_s=;") && /Max-Age=0/.test(c)), о1.sc);
const m2 = await заявка("/api/me", { cookie: к2 });
провери("me със старата бисквитка след изход → 401", m2.s === 401);
const m2б = await заявка("/api/me", { cookie: к1 });
провери("другата сесия (от регистрацията) остава жива", m2б.s === 200);

/* ═══ 4 · изтичане ═══ */
console.log("— изтичане (часовникът +15 дни)");
сега = НАЧАЛО + 13 * ДЕН + 3600000;
const и0 = await заявка("/api/me", { cookie: к1 });
провери("ден 13 + 1 час → active, days_left 1", и0.j.user.status === "active" && и0.j.user.days_left === 1, и0.j.user);
сега = НАЧАЛО + 15 * ДЕН;
const и1 = await заявка("/api/me", { cookie: к1 });
провери("+15 дни → 200, status expired, days_left 0", и1.s === 200 && и1.j.user.status === "expired" && и1.j.user.days_left === 0, и1.j.user);
провери("msg съдържа «15 € на месец, колкото една салата»", typeof и1.j.msg === "string" && и1.j.msg.includes("15 € на месец, колкото една салата"), и1.j.msg);
провери("msg = дословно «Пробният период свърши. …»", и1.j.msg === ДОГОВОР_MSG);
провери("proben остава true (срокът е бил пробният)", и1.j.user.proben === true);
const и2 = await заявка("/api/login", { method: "POST", body: { email: "mama1@abv.bg", password: "парола123" } });
провери("вход с изтекъл достъп → 200, status expired + msg (може да види съобщението)", и2.s === 200 && и2.j.user.status === "expired" && и2.j.msg === ДОГОВОР_MSG);

/* ═══ 5 · админ ═══ */
console.log("— администратор");
const а1 = await заявка("/api/register", { method: "POST", body: { email: АДМИН, password: "админ-парола-1" }, ip: "10.0.0.9" });
провери("регистрация с aaeromove@gmail.com → status admin, admin true", а1.s === 200 && а1.j.user.status === "admin" && а1.j.user.admin === true && а1.j.msg === null, а1.j.user);
const ка = бисквитка(а1);
const н1 = await заявка("/api/register", { method: "POST", body: { email: "mama2@abv.bg", password: "парола456" }, ip: "10.0.0.3" });
const кн = бисквитка(н1);
const а2 = await заявка("/api/admin/users", { cookie: ка });
провери("GET /api/admin/users → 200, 3 потребители", а2.s === 200 && Array.isArray(а2.j.users) && а2.j.users.length === 3, а2.j);
const ред1 = а2.j.users.find((u) => u.email === "mama1@abv.bg");
провери("редът носи email,status,created_at,access_until,days_left,last_login,locked",
  ред1 && ["email", "status", "created_at", "access_until", "days_left", "last_login", "locked"].every((k) => k in ред1), ред1);
провери("broi = {vsichki 3, aktivni 2, izteklite 1, zaklyucheni 0}",
  JSON.stringify(а2.j.broi) === JSON.stringify({ vsichki: 3, aktivni: 2, izteklite: 1, zaklyucheni: 0 }), а2.j.broi);
провери("в списъка няма хеш на парола", !/scrypt\$|pass_hash/.test(а2.текст));
const нА = await заявка("/api/admin/users", { cookie: кн });
провери("не-админ → /api/admin/users 403", нА.s === 403 && нА.j.error === core.MSG.notAdmin);
const нБ = await заявка("/api/admin/user", { method: "POST", cookie: кн, body: { action: "extend", email: "mama2@abv.bg", days: 365 } });
провери("не-админ → /api/admin/user 403 (не може да си удължи сам)", нБ.s === 403);
const нВ = await заявка("/api/admin/export", { cookie: кн });
провери("не-админ → /api/admin/export 403", нВ.s === 403);
const нГ = await заявка("/api/admin/users");
провери("без сесия → /api/admin/users 401", нГ.s === 401);

const е1 = await заявка("/api/admin/user", { method: "POST", cookie: ка, body: { action: "extend", email: "mama1@abv.bg", days: 30 } });
провери("extend 30 на изтекъл → 200 {ok, action, user} и active", е1.s === 200 && е1.j.ok === true && е1.j.action === "extend" && е1.j.user.status === "active", е1.j);
провери("extend брои от днес (изтеклият срок не се губи): days_left 30", е1.j.user.days_left === 30, е1.j.user);
const е1м = await заявка("/api/me", { cookie: к1 });
провери("мама вижда достъпа веднага, без нов вход: active, msg null, proben false", е1м.j.user.status === "active" && е1м.j.msg === null && е1м.j.user.proben === false, е1м.j.user);
const е2 = await заявка("/api/admin/user", { method: "POST", cookie: ка, body: { action: "extend", email: "mama1@abv.bg", days: 10 } });
провери("второ extend 10 при активен → от сегашния край: days_left 40", е2.j.user.days_left === 40, е2.j.user);
const е3 = await заявка("/api/admin/user", { method: "POST", cookie: ка, body: { action: "extend", email: "mama1@abv.bg", days: 0 } });
провери("extend 0 → 400", е3.s === 400 && е3.j.error === core.MSG.badDays);
const е4 = await заявка("/api/admin/user", { method: "POST", cookie: ка, body: { action: "extend", email: "mama1@abv.bg", days: 3651 } });
провери("extend 3651 → 400", е4.s === 400);
const е5 = await заявка("/api/admin/user", { method: "POST", cookie: ка, body: { action: "extend", email: "nyama@abv.bg", days: 5 } });
провери("extend на несъществуващ → 404", е5.s === 404 && е5.j.error === core.MSG.noUser);
const е6 = await заявка("/api/admin/user", { method: "POST", cookie: ка, body: { action: "hack", email: "mama1@abv.bg" } });
провери("непознато действие → 400", е6.s === 400 && е6.j.error === core.MSG.badAction);


const пазиСега = сега;
const з1 = await заявка("/api/admin/user", { method: "POST", cookie: ка, body: { action: "lock", email: "mama2@abv.bg" } });
провери("lock → 200, status locked", з1.s === 200 && з1.j.user.status === "locked" && з1.j.user.locked === true);
const з2 = await заявка("/api/me", { cookie: кн });
провери("заключената мама: me → locked, days_left 0, msg «Достъпът изтече. …»", з2.j.user.status === "locked" && з2.j.user.days_left === 0 && з2.j.msg === ДОГОВОР_MSG_ПЛАТЕН, з2.j);
const з3 = await заявка("/api/admin/users", { cookie: ка });
провери("broi брои заключените: zaklyucheni 1", з3.j.broi.zaklyucheni === 1 && з3.j.broi.vsichki === 3, з3.j.broi);
const з4 = await заявка("/api/admin/user", { method: "POST", cookie: ка, body: { action: "unlock", email: "mama2@abv.bg" } });
провери("unlock → active (датата остава)", з4.s === 200 && з4.j.user.status === "active" && з4.j.user.locked === false);
const з5 = await заявка("/api/admin/user", { method: "POST", cookie: ка, body: { action: "lock", email: АДМИН } });
провери("админът не се заключва → 400", з5.s === 400 && з5.j.error === core.MSG.adminNoLock);
сега = пазиСега;

const д1 = await заявка("/api/admin/user", { method: "POST", cookie: ка, body: { action: "set_until", email: "mama2@abv.bg", until: "2026-12-31" } });
провери("set_until 2026-12-31 → до 23:59:59.999 по София (21:59:59.999Z през зимата)", д1.s === 200 && д1.j.user.access_until === "2026-12-31T21:59:59.999Z", д1.j.user);
const д1л = await заявка("/api/admin/user", { method: "POST", cookie: ка, body: { action: "set_until", email: "mama2@abv.bg", until: "2027-07-15" } });
провери("set_until 2027-07-15 (лятно време) → 20:59:59.999Z", д1л.j.user.access_until === "2027-07-15T20:59:59.999Z", д1л.j.user);
const д2 = await заявка("/api/admin/user", { method: "POST", cookie: ка, body: { action: "set_until", email: "mama2@abv.bg", until: "2026-10-01" } });
провери("set_until в миналото → expired", д2.s === 200 && д2.j.user.status === "expired");
const д2м = await заявка("/api/me", { cookie: кн });
провери("…мама вижда expired + msg", д2м.j.user.status === "expired" && typeof д2м.j.msg === "string");
const д3 = await заявка("/api/admin/user", { method: "POST", cookie: ка, body: { action: "set_until", email: "mama2@abv.bg", until: "31.12.2026" } });
провери("set_until с лош формат → 400", д3.s === 400 && д3.j.error === core.MSG.badUntil);
const д4 = await заявка("/api/admin/user", { method: "POST", cookie: ка, body: { action: "set_until", email: "mama2@abv.bg", until: "2026-02-30" } });
провери("set_until 2026-02-30 (няма такъв ден) → 400", д4.s === 400);

const с1 = await заявка("/api/admin/user", { method: "POST", cookie: ка, body: { action: "create", email: "mama3@abv.bg", password: "начална-1" } });
провери("create без дни → 200 и 14 дни, proben true", с1.s === 200 && с1.j.user.days_left === 14 && с1.j.user.proben === true, с1.j);
const с2 = await заявка("/api/admin/user", { method: "POST", cookie: ка, body: { action: "create", email: "mama4@abv.bg", password: "начална-2", days: 30 } });
провери("create с 30 дни → days_left 30, proben false", с2.s === 200 && с2.j.user.days_left === 30 && с2.j.user.proben === false, с2.j.user);
const с3 = await заявка("/api/admin/user", { method: "POST", cookie: ка, body: { action: "create", email: "mama3@abv.bg", password: "начална-1" } });
провери("create на зает имейл → 409", с3.s === 409);
const с4 = await заявка("/api/admin/user", { method: "POST", cookie: ка, body: { action: "create", email: "mama5@abv.bg", password: "123" } });
провери("create с къса парола → 400", с4.s === 400);
const с5 = await заявка("/api/login", { method: "POST", body: { email: "mama3@abv.bg", password: "начална-1" } });
провери("създадената от админа мама влиза с паролата си", с5.s === 200 && с5.j.user.status === "active");

/* смяна на парола */
const лм = await заявка("/api/login", { method: "POST", body: { email: "mama4@abv.bg", password: "начална-2" } });
const клм = бисквитка(лм);
const пр1 = await заявка("/api/admin/user", { method: "POST", cookie: ка, body: { action: "set_password", email: "mama4@abv.bg", password: "нова-парола-9" } });
провери("set_password → 200", пр1.s === 200 && пр1.j.ok === true);
провери("set_password: отговорът не носи паролата", !пр1.текст.includes("нова-парола-9"));
const пр2 = await заявка("/api/me", { cookie: клм });
провери("старата сесия пада след нова парола → 401", пр2.s === 401);
const пр3 = await заявка("/api/login", { method: "POST", body: { email: "mama4@abv.bg", password: "начална-2" } });
провери("старата парола → 401", пр3.s === 401);
const пр4 = await заявка("/api/login", { method: "POST", body: { email: "mama4@abv.bg", password: "нова-парола-9" } });
провери("новата парола → 200", пр4.s === 200);

/* изтриване */
const клм4 = бисквитка(пр4);
const сесииПреди = броиСесии();
const т1 = await заявка("/api/admin/user", { method: "POST", cookie: ка, body: { action: "delete", email: "mama4@abv.bg" } });
провери("delete → 200 {ok, action, deleted}", т1.s === 200 && т1.j.ok === true && т1.j.deleted === "mama4@abv.bg", т1.j);
провери("delete сваля и сесиите ѝ", броиСесии() === сесииПреди - 1, { преди: сесииПреди, сега: броиСесии() });
const т2 = await заявка("/api/me", { cookie: клм4 });
провери("изтритата мама: me → 401", т2.s === 401);
const т3 = await заявка("/api/admin/user", { method: "POST", cookie: ка, body: { action: "delete", email: АДМИН } });
провери("админът не може да изтрие себе си → 400", т3.s === 400 && т3.j.error === core.MSG.noSelfDelete);
const т4 = await заявка("/api/register", { method: "POST", body: { email: "mama4@abv.bg", password: "пак-съм-тук" }, ip: "10.0.0.4" });
провери("след изтриване имейлът е свободен → нова регистрация 200 с 14 дни", т4.s === 200 && т4.j.user.days_left === 14);

/* ═══ 6 · CSV ═══ */
console.log("— CSV файлът");
const х1 = await заявка("/api/admin/export", { cookie: ка });
провери("export → 200 text/csv; charset=utf-8", х1.s === 200 && /^text\/csv/.test(х1.h.get("content-type")), х1.h.get("content-type"));
провери("export → Content-Disposition attachment *.csv", /attachment; filename="babyland-potrebiteli-\d{4}-\d{2}-\d{2}\.csv"/.test(х1.h.get("content-disposition") || ""));
const редове = х1.текст.replace(/^﻿/, "").trim().split(/\r\n/);
провери("BOM отпред (Excel чете кирилицата)", х1.текст.charCodeAt(0) === 0xFEFF);
провери("заглавен ред: имейл; статус; регистриран; достъп до; последно влизане", редове[0] === CSV_ZAGLAVIE.map((x) => '"' + x + '"').join(";"), редове[0]);
const сАдм = (await заявка("/api/admin/users", { cookie: ка })).j.users.length;
провери("по ред на всеки потребител (" + сАдм + ")", редове.length === сАдм + 1, редове.length);
провери("в CSV-то има mama1@abv.bg със статус «активен»", редове.some((r) => r.startsWith('"mama1@abv.bg";"активен";')), редове);
провери("в CSV-то няма хеш, токен или парола", !/scrypt|pass_hash|token|парола/.test(х1.текст));
провери("CSV: Cache-Control no-store · Vary *", х1.h.get("cache-control") === "no-store" && х1.h.get("vary") === "*");

/* ═══ 7 · дневникът на админа ═══ */
console.log("— дневникът на админа");
const лг = await заявка("/api/admin/log", { cookie: ка });
провери("GET /api/admin/log → 200 с записи", лг.s === 200 && лг.j.broi > 5, лг.j && лг.j.broi);
провери("дневникът има extend, lock, set_password, delete, export",
  ["extend", "lock", "set_password", "delete", "export", "create", "set_until", "unlock"].every((a) => лг.j.zapisi.some((z) => z.action === a)));
провери("дневникът не носи паролата", !лг.текст.includes("нова-парола-9") && !/scrypt\$/.test(лг.текст));
const лгН = await заявка("/api/admin/log", { cookie: бисквитка(с5) });
провери("не-админ → /api/admin/log 403", лгН.s === 403);

/* ═══ 8 · ADMIN_EMAILS (env на Cloudflare) се добавя към списъка ═══ */
console.log("— ADMIN_EMAILS");
env.ADMIN_EMAILS = "mama3@abv.bg";
const ае = await заявка("/api/me", { cookie: бисквитка(с5) });
провери("имейл от ADMIN_EMAILS → status admin", ае.j.user.status === "admin");
env.ADMIN_EMAILS = "";

/* ═══ 9 · ограниченията на опитите (като AERO) ═══ */
console.log("— ограниченията");
let последен = null;
for (let i = 0; i < 11; i++) последен = await заявка("/api/login", { method: "POST", body: { email: "mama3@abv.bg", password: "грешна-" + i } });
провери("11-ият грешен вход за 15 мин → 429", последен.s === 429 && последен.j.error === core.MSG.loginTooMany, последен.s);
const вярна = await заявка("/api/login", { method: "POST", body: { email: "mama3@abv.bg", password: "начална-1" } });
провери("…и вярната парола чака (429) до края на прозореца", вярна.s === 429);
сега = сега + 16 * 60000;
const вярна2 = await заявка("/api/login", { method: "POST", body: { email: "mama3@abv.bg", password: "начална-1" } });
провери("след 16 минути вярната парола минава → 200", вярна2.s === 200);
let рег = null;
for (let i = 0; i < 6; i++) рег = await заявка("/api/register", { method: "POST", body: { email: "spam" + i + "@abv.bg", password: "парола123" }, ip: "10.9.9.9" });
провери("6-та регистрация от един адрес за час → 429", рег.s === 429 && рег.j.error === core.MSG.regTooMany, рег.s);


/* ═══ 10 · хранилищата и Worker-ът ═══ */
console.log("— хранилищата и Worker-ът");
const D1b = makeD1();
await prilozhiMigracii(D1b);
const истинско = makeRepo(D1b);
const методиИ = Object.keys(истинско).sort();
const методиП = Object.keys(makeRepoVPamet()).filter((k) => !k.startsWith("_")).sort();
провери("makeRepo (D1) и makeRepoVPamet имат едни и същи методи (" + методиИ.length + ")", JSON.stringify(методиИ) === JSON.stringify(методиП), { методиИ, методиП });
const н = new Date(НАЧАЛО);
D1b._заявки.length = 0;
const вмъкнат = await истинско.insertUser({ email: "x@y.bg", passHash: "h", createdAt: н, accessUntil: н });
for (const [м, арг] of Object.entries({
  getUserByEmail: ["x@y.bg"], insertUser: [{ email: "x@y.bg", passHash: "h", createdAt: н, accessUntil: н }], setAccessUntil: [вмъкнат.id, н], setLocked: [вмъкнат.id, true],
  setPassword: [вмъкнат.id, "h"], touchLogin: [вмъкнат.id, н], listUsers: [], createSession: ["t", вмъкнат.id, н, н], getSessionUser: ["t", н],
  deleteSession: ["t"], deleteUserSessions: [вмъкнат.id], countAttempts: ["x", "login", н], addAttempt: ["x", "login", н], clearAttempts: ["x", "login"],
  cleanup: [н], addAdminLog: [{ at: н, admin: "a@b.bg", action: "x", target: null, before: null, after: { a: 1 } }], listAdminLog: [50], deleteUser: [вмъкнат.id],
})) await истинско[м](...арг);
const sqlЗаявки = D1b._заявки.filter((q) => q.п.length);
провери("всяка SQL заявка подава стойностите като параметри ? (никоя стойност не е в текста)",
  sqlЗаявки.length >= 18 && D1b._заявки.every((q) => !/x@y\.bg|'h'|a@b\.bg|2026-10-21/.test(q.sql)), sqlЗаявки.length);
провери("SELECT-ът за списъка не чете pass_hash", D1b._заявки.some((q) => /FROM users ORDER BY/.test(q.sql) && !/pass_hash/.test(q.sql)));
провери("insertUser на зает имейл → null (ON CONFLICT DO NOTHING)", (await истинско.insertUser({ email: "z@y.bg", passHash: "h", createdAt: н, accessUntil: н })) !== null && (await истинско.insertUser({ email: "z@y.bg", passHash: "h", createdAt: н, accessUntil: н })) === null);
провери("SQL-ът е на SQLite: без BIGSERIAL/TIMESTAMPTZ/NOW()/::/jsonb", !D1b._заявки.some((q) => /BIGSERIAL|TIMESTAMPTZ|NOW\(\)|::|jsonb/i.test(q.sql)) &&
  !/BIGSERIAL|TIMESTAMPTZ|NOW\(\)|JSONB/i.test(readFileSync(join(КОРЕН, "migrations", "0001_create-auth.sql"), "utf8").replace(/^--.*$/gm, "") + readFileSync(join(КОРЕН, "migrations", "0002_create-admin-log.sql"), "utf8").replace(/^--.*$/gm, "")));
const суров = DB._s.prepare("SELECT created_at, access_until, last_login, locked FROM users WHERE email = ?").get("mama1@abv.bg");
провери("датите в базата са ISO текст в UTC (…T…Z), locked е 0/1", !!суров && [суров.created_at, суров.access_until, суров.last_login].every((x) => typeof x === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(x)) && (суров.locked === 0 || суров.locked === 1), суров);

/* Worker-ът: маршрутите */
const асетиПреди = асетиВикнати;
провери("непознат /api път → 404 JSON (не index.html)", await заявка("/api/nyama").then((r) => r.s === 404 && !!r.j && r.j.error === core.MSG.notFound && /application\/json/.test(r.h.get("content-type"))));
провери("/api (без наклонена) → 404 JSON", await заявка("/api").then((r) => r.s === 404 && !!r.j && !!r.j.error));
let пътищаОк = true;
for (const п of ["/api/register", "/api/login", "/api/logout", "/api/me", "/api/admin/users", "/api/admin/user", "/api/admin/export", "/api/admin/log"]) {
  const r = await заявка(п, { method: "PUT", body: {} });
  if (r.s !== 405 || !r.j || r.j.error !== core.MSG.method) { пътищаОк = false; console.log("     " + п + " → " + r.s); }
}
провери("Worker-ът познава 8-те пътя на договора (всеки отговаря 405 JSON на PUT)", пътищаОк);
провери("/api/* НИКОГА не стига до ASSETS", асетиВикнати === асетиПреди, асетиВикнати - асетиПреди);
const ст = await заявка("/css/app.css");
провери("всичко друго → env.ASSETS.fetch", ст.s === 200 && ст.текст === "статичен /css/app.css" && асетиВикнати === асетиПреди + 1, ст.текст);
const липсва = await заявка("/js/" + encodeURIComponent("липсва") + ".js");
провери("липсващ .js, за който SPA дава HTML 200 → 404 (sw.js не го пази като скрипт)", липсва.s === 404, липсва.s);
const грешкаБаза = await makeWorker().fetch(new Request("https://x.example/api/me"), { ASSETS: env.ASSETS }, {});
провери("без env.DB → 500 JSON «Вътрешна грешка…» (не срив)", грешкаБаза.status === 500 && (await грешкаБаза.json()).error === core.MSG.internal);

/* wrangler.toml */
const wt = readFileSync(join(КОРЕН, "wrangler.toml"), "utf8").replace(/^\s*#.*$/gm, "");
провери("wrangler.toml: name babyland · main worker/index.mjs · nodejs_compat · дата",
  /^name\s*=\s*"babyland"/m.test(wt) && /^main\s*=\s*"worker\/index\.mjs"/m.test(wt) && /compatibility_flags\s*=\s*\[\s*"nodejs_compat"\s*\]/.test(wt) && /^compatibility_date\s*=\s*"\d{4}-\d{2}-\d{2}"/m.test(wt));
провери("wrangler.toml: [assets] ./dist · ASSETS · run_worker_first само /api/* · SPA",
  /directory\s*=\s*"\.\/dist"/.test(wt) && /binding\s*=\s*"ASSETS"/.test(wt) && /run_worker_first\s*=\s*\[\s*"\/api\/\*"\s*\]/.test(wt) && /not_found_handling\s*=\s*"single-page-application"/.test(wt));
провери("wrangler.toml: [[d1_databases]] DB · babyland · migrations_dir = migrations",
  /\[\[d1_databases\]\][\s\S]*binding\s*=\s*"DB"[\s\S]*database_name\s*=\s*"babyland"[\s\S]*database_id\s*=\s*"[^"]+"[\s\S]*migrations_dir\s*=\s*"migrations"/.test(wt));

/* ═══ 11 · поверителността · сървърът не пази нищо от записките ═══ */
console.log("— поверителността");
const мигр = readFileSync(join(КОРЕН, "migrations", "0001_create-auth.sql"), "utf8");
const колони = (мигр.match(/CREATE TABLE IF NOT EXISTS users \(([\s\S]*?)\);/) || [])[1] || "";
провери("таблицата users: само id, email, pass_hash, created_at, access_until, locked, last_login",
  колони.split("\n").map((r) => r.trim().split(/\s+/)[0]).filter(Boolean).join() === "id,email,pass_hash,created_at,access_until,locked,last_login", колони);

/* ═══ 12 · платеният срок изтича → «Достъпът изтече. …» ═══
   (накрая: скокът на часовника напред чисти сесиите при вход — затова не стои по средата) */
console.log("— платеният срок изтича");
сега = пазиСега + 41 * ДЕН;
const п0 = await заявка("/api/me", { cookie: к1 });
провери("сесията живее 30 дни: бисквитката от регистрацията (преди 56 дни) → 401", п0.s === 401, п0.s);
const п0в = await заявка("/api/login", { method: "POST", body: { email: "mama1@abv.bg", password: "парола123" } });
const п1 = await заявка("/api/me", { cookie: бисквитка(п0в) });
провери("платеният срок изтича → expired + «Достъпът изтече. …» (същото второ изречение)", п1.j.user.status === "expired" && п1.j.msg === ДОГОВОР_MSG_ПЛАТЕН, п1.j);

/* ═══ 13 · админът не изтича (+400 дни · нов вход, защото сесията живее 30 дни) ═══ */
console.log("— админът не изтича");
сега = НАЧАЛО + 400 * ДЕН;
const з6в = await заявка("/api/login", { method: "POST", body: { email: АДМИН, password: "админ-парола-1" } });
const ка2 = бисквитка(з6в);
const з6 = await заявка("/api/me", { cookie: ка2 });
провери("админът не изтича: +400 дни → status admin, msg null", з6.s === 200 && з6.j.user.status === "admin" && з6.j.msg === null, з6.j.user);
const з7 = await заявка("/api/admin/users", { cookie: ка2 });
провери("…и пак управлява (admin/users 200)", з7.s === 200);

/* ═══ равносметката ═══ */
const всички = минали + паднали.length;
console.log("\n" + (паднали.length ? "🔴 " : "✅ ") + минали + "/" + всички + " минали" + (паднали.length ? " · паднали: " + паднали.join(" · ") : ""));
process.exit(паднали.length ? 1 : 0);
