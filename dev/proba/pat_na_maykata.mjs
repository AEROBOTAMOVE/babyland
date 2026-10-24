/* Бейби Ленд · 24.10 · ПЪТЯТ НА МАЙКАТА срещу истински двигател (wrangler dev --local) или живия адрес
   node dev/proba/pat_na_maykata.mjs http://127.0.0.1:8787
   Регистрация → 14 дни · вход от второ устройство (отделна бисквитка) · двете сесии живеят заедно · грешна парола → 401 ·
   знанието и SOS се сервират (kb.js с новите карти, 112 в страницата) · администраторът aaeromove (регистрация → admin,
   списъкът) · майката НЕ вижда админа (403) · админът изтича пробния → вратата и текстът „Пробният период свърши…“ ·
   изход → 401. Профилът (bl_lmp / bl_baby) живее САМО в телефона (localStorage) — сървърът не го пази; той е мерен на живо
   в браузъра. ⚠️ ПИШЕ в базата на адреса (нови профили) — пускай срещу локален двигател, не срещу базата на майките.
   Последният ред: «ПЪТЯТ НА МАЙКАТА: N/N»; изход 0 = всичко минава. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const KOREN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const A = String(process.argv[2] || "").replace(/\/+$/, "");
if (!/^https?:\/\//.test(A)) { console.log("ползване: node dev/proba/pat_na_maykata.mjs <адрес>"); process.exit(2); }
const vKb = (fs.readFileSync(path.join(KOREN, "index.html"), "utf8").match(/js\/kb\.js\?v=(\d+)/) || [])[1] || "";

let dobri = 0, vsichki = 0;
const ok = (ime, da, zashto) => { vsichki++; if (da) { dobri++; console.log("  ✓ " + ime); } else console.log("  ✗ " + ime + (zashto ? " — " + zashto : "")); };

/** „устройство“ = своя бисквитка */
function ustroistvo() {
  let biskvitka = "";
  return async function z(metod, p, tqlo) {
    const h = { "content-type": "application/json", "cf-connecting-ip": "198.51.100." + (1 + (vsichki % 200)) };
    if (biskvitka) h.cookie = biskvitka;
    let r;
    try { r = await fetch(A + p, { method: metod, headers: h, body: tqlo ? JSON.stringify(tqlo) : undefined, redirect: "manual" }); }
    catch (e) { return { kod: 0, j: null, t: String(e && e.message || e) }; }
    const sc = r.headers.get("set-cookie");
    if (sc) { const m = sc.match(/(bl_s=[^;]*)/); if (m) biskvitka = /bl_s=;|bl_s=$/.test(m[1] + ";") ? "" : m[1]; }
    const t = await r.text();
    let j = null; try { j = JSON.parse(t); } catch (e) { j = null; }
    return { kod: r.status, j, t, imaBiskvitka: () => !!biskvitka };
  };
}

const ts = Date.now().toString(36);
const MAMA = "mama." + ts + "@proba.bg", PAROLA = "Mama-proba-" + ts + "!";
const ADMIN = "aaeromove@gmail.com", APAROLA = "Admin-proba-" + ts + "!";

console.log("═══ сайтът ═══");
const g = ustroistvo();
const n = await g("GET", "/");
ok("началната страница се отваря", n.kod === 200 && /Baby Land/.test(n.t), "код " + n.kod);
ok("SOS · 112 е в страницата (отворено винаги)", /112/.test(n.t));
const kb = await g("GET", "/js/kb.js?v=" + vKb);
ok("знанието: kb.js ?v=" + vKb + " с новите карти (седмица 20, Левски, ваксини на 2 месеца)",
  kb.kod === 200 && ["zn7a-sedmica-19-20", "zn10-levski-za-dete", "zn9-vaksini-2-meseca"].every((id) => kb.t.includes(id)), "код " + kb.kod);
ok("знанието: новото правило за падане е в helper.js („ПАДАНЕ_УДАР“)", (await g("GET", "/js/helper.js")).t.includes("ПАДАНЕ_УДАР"));

console.log("═══ майката: регистрация → 14 дни ═══");
const t1 = ustroistvo();
const reg = await t1("POST", "/api/register", { email: MAMA, password: PAROLA });
ok("регистрация → 200 и бисквитка", reg.kod === 200 && reg.imaBiskvitka(), "код " + reg.kod + " " + reg.t.slice(0, 120));
const u = reg.j && reg.j.user;
ok("пробният е 14 дни (days_left 13–14, proben, status active)", !!u && u.status === "active" && u.proben === true && u.days_left >= 13 && u.days_left <= 14, JSON.stringify(u));
ok("съобщението при активен достъп е празно (msg null)", reg.j && reg.j.msg === null);
const dvoino = await ustroistvo()("POST", "/api/register", { email: MAMA, password: PAROLA });
ok("втора регистрация със същия имейл → 409", dvoino.kod === 409, "код " + dvoino.kod);

console.log("═══ вход от второ устройство ═══");
const t2 = ustroistvo();
const lg = await t2("POST", "/api/login", { email: MAMA, password: PAROLA });
ok("вход от второто устройство → 200 и своя бисквитка", lg.kod === 200 && lg.imaBiskvitka(), "код " + lg.kod);
const me2 = await t2("GET", "/api/me");
ok("второто устройство вижда същия профил", me2.kod === 200 && me2.j && me2.j.logged_in && me2.j.user.email === MAMA, "код " + me2.kod);
const me1 = await t1("GET", "/api/me");
ok("първото устройство остава влязло (двете сесии живеят заедно)", me1.kod === 200 && me1.j && me1.j.logged_in, "код " + me1.kod);
const greshna = await ustroistvo()("POST", "/api/login", { email: MAMA, password: "грешна-парола-123" });
ok("грешна парола → 401", greshna.kod === 401, "код " + greshna.kod);
const zabrana = await t1("GET", "/api/admin/users");
ok("майката НЕ вижда администрацията → 403", zabrana.kod === 403, "код " + zabrana.kod);

console.log("═══ администраторът aaeromove ═══");
const ad = ustroistvo();
let ar = await ad("POST", "/api/register", { email: ADMIN, password: APAROLA });
if (ar.kod === 409) ar = await ad("POST", "/api/login", { email: ADMIN, password: APAROLA });
ok("aaeromove@gmail.com → status admin", (ar.kod === 200) && ar.j && ar.j.user && ar.j.user.status === "admin", "код " + ar.kod + " " + ar.t.slice(0, 100));
const spisak = await ad("GET", "/api/admin/users");
ok("администраторът вижда списъка и майката в него", spisak.kod === 200 && spisak.j && (spisak.j.users || []).some((x) => x.email === MAMA), "код " + spisak.kod);

console.log("═══ пробният изтича → вратата ═══");
const vchera = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
const iz = await ad("POST", "/api/admin/user", { action: "set_until", email: MAMA, until: vchera });
ok("администраторът слага края на достъпа вчера (set_until " + vchera + ")", iz.kod === 200, "код " + iz.kod + " " + iz.t.slice(0, 120));
const sled = await t1("GET", "/api/me");
ok("майката: status expired, days_left 0", sled.j && sled.j.user && sled.j.user.status === "expired" && sled.j.user.days_left === 0, JSON.stringify(sled.j && sled.j.user));
ok("текстът на вратата: „Пробният период свърши…“ + контактите", sled.j && /Пробният период свърши/.test(sled.j.msg || "") && !!sled.j.kontakti, String(sled.j && sled.j.msg));
const vrashta = await ad("POST", "/api/admin/user", { action: "extend", email: MAMA, days: 30 });
const pak = await t1("GET", "/api/me");
ok("администраторът дава 30 дни → майката пак е активна", vrashta.kod === 200 && pak.j && pak.j.user && pak.j.user.status === "active", "код " + vrashta.kod);

console.log("═══ изход ═══");
await t2("POST", "/api/logout");
const posle = await t2("GET", "/api/me");
ok("след изход второто устройство → 401 и logged_in:false", posle.kod === 401 && posle.j && posle.j.logged_in === false, "код " + posle.kod);

console.log("ПЪТЯТ НА МАЙКАТА: " + dobri + "/" + vsichki);
process.exit(dobri === vsichki ? 0 : 1);
