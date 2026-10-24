/* Бейби Ленд · 24.10 · КАЧВАНЕТО В CLOUDFLARE С ЕДНА КОМАНДА (двоен клик на КАЧИ.cmd → node kachi.mjs)
   Поред, спира с един ясен ред при първата грешка; повторното пускане е безопасно (всяка стъпка гледа какво вече има):
     1 · вход        — npx wrangler whoami → ако не си влязъл: npx wrangler login (одобряваш в браузъра)
     2 · базата      — npx wrangler d1 list --json → «babyland» я има: взема id-то · няма я: npx wrangler d1 create babyland
                       → id-то отива в wrangler.toml на мястото на ЗАМЕНИ_С_ID (копие wrangler.toml.predi); истинско id не се пипа
     3 · сглобяване  — node dev/proba/test_dostap_cf.mjs (достъпът, без мрежа) → node build.js («пакетът е пълен»)
                       → ако базата я е имало: npx wrangler d1 export babyland --remote → backup/babyland_<дата_час>.sql
                       → npx wrangler d1 migrations apply babyland --remote (0001, 0002)
     4 · качване     — npx wrangler deploy → адресът *.workers.dev
     5 · по желание  — ADMIN_EMAILS (още администратори; Enter = само aaeromove@gmail.com, той е в кода).
                       Други тайни Бейби Ленд НЯМА: worker-ът ползва само DB, ASSETS и по желание ADMIN_EMAILS.
                       Стойността отива в «wrangler secret put» през stdin и НЕ се печата никъде.
     6 · проверка    — node dev/proba/proba_sled_kachvane.mjs <адреса> → «ГОТОВО · адрес … · проверка N/N»
   Пътят назад: wrangler.toml.predi (копието отпреди id-то), «npx wrangler rollback» (предишното качване) и за данните
   backup/*.sql («npx wrangler d1 execute babyland --remote --file backup/<файла>»).
   За пробите без интернет (dev/proba/proba_kachi.mjs): KACHI_WRANGLER = файл .mjs вместо «npx wrangler», KACHI_TOML = друг
   wrangler.toml, KACHI_BUILD / KACHI_TEST / KACHI_PROBA = друг скрипт вместо build.js / test_dostap_cf.mjs / proba_sled_kachvane.mjs. */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const TUK = path.dirname(fileURLToPath(import.meta.url));
const pat = (env, po) => (process.env[env] ? path.resolve(process.env[env]) : path.join(TUK, po));
const TOML = pat("KACHI_TOML", "wrangler.toml");
const BUILD = pat("KACHI_BUILD", "build.js");
const TEST = pat("KACHI_TEST", "dev/proba/test_dostap_cf.mjs");
const PROBA = pat("KACHI_PROBA", "dev/proba/proba_sled_kachvane.mjs");
const BACKUP = pat("KACHI_BACKUP", "backup");
const MOK = process.env.KACHI_WRANGLER ? path.resolve(process.env.KACHI_WRANGLER) : "";
const BAZA = "babyland";
const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

const red = (s) => console.log(s);
function spri(stapka, zashto, izhod) {
  if (izhod) console.log(String(izhod).trim().split(/\r?\n/).slice(-12).map((l) => "    │ " + l).join("\n"));
  console.log("СПРЯНО · " + stapka + " · " + zashto);
  process.exit(1);
}

/* npx: от PATH или до самия node.exe; няма ли го — Node.js не е инсталиран както трябва */
let NPX = "npx";
if (!MOK) {
  const okPath = spawnSync("npx", ["--version"], { encoding: "utf8", shell: process.platform === "win32" });
  if (okPath.status !== 0) {
    const doNode = path.join(path.dirname(process.execPath), process.platform === "win32" ? "npx.cmd" : "npx");
    if (fs.existsSync(doNode)) NPX = doNode;
    else spri("Node", "няма npx — инсталирай Node.js LTS от https://nodejs.org (той носи npx) и пусни КАЧИ.cmd пак");
  }
}

/** wrangler с аргументи · {kod, out} · vhod = текст за stdin · vidim = прозорецът е на човека (вход в браузъра) */
function wrangler(args, o = {}) {
  const r = MOK
    ? spawnSync(process.execPath, [MOK, ...args], { cwd: TUK, input: o.vhod, encoding: "utf8", stdio: o.vidim ? "inherit" : "pipe", env: process.env })
    : spawnSync(NPX, ["--yes", "wrangler", ...args], { cwd: TUK, input: o.vhod, encoding: "utf8", stdio: o.vidim ? "inherit" : "pipe", shell: process.platform === "win32", env: process.env });
  if (r.error) return { kod: -1, out: String(r.error.message || r.error) };
  return { kod: r.status === null ? -1 : r.status, out: (r.stdout || "") + (r.stderr || "") };
}
function node(fayl, args = []) {
  const r = spawnSync(process.execPath, [fayl, ...args], { cwd: TUK, encoding: "utf8", stdio: "pipe", env: process.env });
  return { kod: r.status === null ? -1 : r.status, out: (r.stdout || "") + (r.stderr || "") };
}
const vlyazal = (x) => x.kod === 0 && !/not authenticated|not logged in|wrangler login/i.test(x.out);

/** ред от терминала · Enter = '' · пробите подават отговорите ред по ред през stdin */
function pitai(vapros) {
  process.stdout.write(vapros);
  if (!process.stdin.isTTY) {
    if (!pitai.redove) { let t = ""; try { t = fs.readFileSync(0, "utf8"); } catch (e) { t = ""; } pitai.redove = t.split(/\r?\n/); }
    const v = pitai.redove.length ? pitai.redove.shift() : "";
    process.stdout.write(v + "\n");
    return v.trim();
  }
  const buf = Buffer.alloc(1);
  let v = "";
  for (;;) {
    let n = 0;
    try { n = fs.readSync(0, buf, 0, 1, null); } catch (e) { if (e.code === "EAGAIN") continue; break; }
    if (!n || buf[0] === 13 || buf[0] === 10) break;
    v += String.fromCharCode(buf[0]);
  }
  return Buffer.from(v, "latin1").toString("utf8").trim();
}

/* ── 1 · вход ── */
red("1/6 · вход в Cloudflare …");
let w = wrangler(["whoami"]);
if (!vlyazal(w)) {
  red("    не си влязъл — отваря се браузърът: одобри достъпа там и се върни тук");
  const lg = wrangler(["login"], { vidim: true });
  if (lg.kod !== 0) spri("вход", "«wrangler login» не мина — затвори прозореца ли? Пусни КАЧИ.cmd пак");
  w = wrangler(["whoami"]);
  if (!vlyazal(w)) spri("вход", "пак не си влязъл (wrangler whoami)", w.out);
}
red("    ✓ влязъл си");

/* ── 2 · базата ── */
red("2/6 · базата D1 «" + BAZA + "» …");
if (!fs.existsSync(TOML)) spri("базата", "няма " + TOML);
let toml = fs.readFileSync(TOML, "utf8");
const redId = toml.match(/^\s*database_id\s*=\s*"([^"]*)"/m);
if (!redId) spri("базата", "в wrangler.toml няма ред database_id = \"…\"");
const vToml = redId[1];
const l = wrangler(["d1", "list", "--json"]);
if (l.kod !== 0) spri("базата", "«wrangler d1 list» не мина", l.out);
let spisak = [];
try { const j = JSON.parse(l.out.slice(l.out.indexOf("["), l.out.lastIndexOf("]") + 1)); spisak = Array.isArray(j) ? j : []; }
catch (e) { spri("базата", "отговорът на «d1 list --json» не е JSON", l.out); }
const nameri = spisak.find((d) => d && d.name === BAZA);
let id = nameri ? String(nameri.uuid || nameri.id || "") : "";
const bazataBeshe = !!id;   // имало ли е база преди това пускане → в нея може да има майки → резервно копие преди таблиците
if (UUID.test(vToml)) {
  if (id && id.toLowerCase() !== vToml.toLowerCase()) spri("базата", "wrangler.toml сочи " + vToml + ", а в акаунта «" + BAZA + "» е " + id + " — не пипам; оправи ръчно");
  if (!id) spri("базата", "wrangler.toml сочи " + vToml + ", но в акаунта няма база «" + BAZA + "» — друг акаунт ли е влязъл?");
  red("    ✓ базата е «" + BAZA + "» · " + id + " · wrangler.toml вече я сочи");
} else {
  if (vToml !== "ЗАМЕНИ_С_ID") spri("базата", "в wrangler.toml database_id = \"" + vToml + "\" — нито ЗАМЕНИ_С_ID, нито истинско id; не пипам");
  if (!id) {
    red("    няма я — създавам «" + BAZA + "» …");
    const c = wrangler(["d1", "create", BAZA], { vhod: "n\n" });
    if (c.kod !== 0) spri("базата", "«wrangler d1 create " + BAZA + "» не мина", c.out);
    const m = c.out.match(UUID);
    if (!m) spri("базата", "създадена, но не намирам id-то (8-4-4-4-12) в изхода", c.out);
    id = m[0];
    red("    ✓ създадена · " + id);
  } else red("    ✓ има я · " + id);
  const predi = TOML + ".predi";
  if (!fs.existsSync(predi)) fs.copyFileSync(TOML, predi);
  toml = toml.replace(/^(\s*database_id\s*=\s*")ЗАМЕНИ_С_ID(")/m, "$1" + id + "$2");
  fs.writeFileSync(TOML, toml);
  red("    ✓ id-то е в wrangler.toml (копие отпреди: " + path.basename(predi) + ")");
}

/* ── 3 · сглобяване и таблиците ── */
red("3/6 · проверка на достъпа, сглобяване и таблиците …");
const t = node(TEST);
const tm = t.out.match(/(\d+)\/(\d+) минали/);
if (t.kod !== 0 || !tm || tm[1] !== tm[2]) spri("достъпът", "test_dostap_cf.mjs не мина изцяло" + (tm ? " (" + tm[1] + "/" + tm[2] + ")" : ""), t.out);
red("    ✓ достъпът (без мрежа) · " + tm[1] + "/" + tm[2]);
const s = node(BUILD);
if (s.kod !== 0 || !/пакетът е пълен/.test(s.out)) spri("сглобяване", "build.js не завърши с „пакетът е пълен“", s.out);
red("    ✓ сглобено (" + ((s.out.match(/dist\/: (\d+) файла/) || [])[1] || "?") + " файла)");
/* пътят назад за ДАННИТЕ: базата я е имало → цялото ѝ съдържание в backup/ ПРЕДИ таблиците (backup/ не е в сайта и в git) */
if (bazataBeshe) {
  const sega = new Date(), dd = (n) => String(n).padStart(2, "0");
  const ime = BAZA + "_" + sega.getFullYear() + "-" + dd(sega.getMonth() + 1) + "-" + dd(sega.getDate()) + "_" + dd(sega.getHours()) + "-" + dd(sega.getMinutes()) + ".sql";
  fs.mkdirSync(BACKUP, { recursive: true });
  const kade = path.join(BACKUP, ime);
  const ex = wrangler(["d1", "export", BAZA, "--remote", "--output", kade]);
  if (ex.kod !== 0 || !fs.existsSync(kade)) spri("резервно копие", "«wrangler d1 export " + BAZA + "» не мина — без копие не продължавам", ex.out);
  red("    ✓ резервно копие на данните · backup/" + ime + " (" + (fs.statSync(kade).size < 1024 ? fs.statSync(kade).size + " Б" : Math.round(fs.statSync(kade).size / 1024) + " КБ") + ")");
} else red("    · резервно копие — не трябва (базата е нова, празна)");
const mg = wrangler(["d1", "migrations", "apply", BAZA, "--remote"], { vhod: "y\n" });
if (mg.kod !== 0) spri("таблиците", "«wrangler d1 migrations apply " + BAZA + " --remote» не мина", mg.out);
red("    ✓ таблиците (" + (/No migrations to apply/i.test(mg.out) ? "нищо ново" : "0001, 0002") + ")");

/* ── 4 · качване ── */
red("4/6 · качване …");
const d = wrangler(["deploy"]);
if (d.kod !== 0) spri("качване", "«wrangler deploy» не мина", d.out);
const adres = (d.out.match(/https:\/\/[a-z0-9.-]+\.workers\.dev/i) || [])[0] || "";
if (!adres) spri("качване", "качено, но не намирам адреса *.workers.dev в изхода", d.out);
red("    ✓ качено · " + adres);

/* ── 5 · по желание: още администратори ── */
red("5/6 · администраторите …");
const sl = wrangler(["secret", "list"]);
if (sl.kod !== 0) spri("администраторите", "«wrangler secret list» не мина", sl.out);
if (/"name"\s*:\s*"ADMIN_EMAILS"/.test(sl.out)) red("    · ADMIN_EMAILS го има");
else {
  const v = pitai("    Още администратори освен aaeromove@gmail.com (имейли със запетая; Enter = само той): ");
  if (v) {
    const r = wrangler(["secret", "put", "ADMIN_EMAILS"], { vhod: v + "\n" });
    if (r.kod !== 0) spri("администраторите", "«wrangler secret put ADMIN_EMAILS» не мина", r.out.split(v).join("•••"));
    red("    ✓ ADMIN_EMAILS");
  } else red("    · само aaeromove@gmail.com (записан в кода)");
}

/* ── 6 · проверка на живия сайт ── */
red("6/6 · проверка на живия сайт …");
const p = node(PROBA, [adres]);
const ob = p.out.match(/ОБЩО (\d+) · наред (\d+) · разминавания (\d+)/);
if (!ob) spri("проверка", "proba_sled_kachvane.mjs не даде ред „ОБЩО …“", p.out);
if (p.kod !== 0 || ob[3] !== "0") {
  console.log(p.out.split(/\r?\n/).filter((x) => /✗/.test(x)).map((x) => "    │ " + x.trim()).join("\n"));
  spri("проверка", "проверка " + ob[2] + "/" + ob[1] + " · разминавания " + ob[3] + " (адрес " + adres + ") · пътят назад: npx wrangler rollback");
}
console.log("ГОТОВО · адрес " + adres + " · проверка " + ob[2] + "/" + ob[1]);
console.log("    Сега, веднага: отвори адреса и се регистрирай с aaeromove@gmail.com — който пръв го регистрира, държи администратора (README т. 4).");
