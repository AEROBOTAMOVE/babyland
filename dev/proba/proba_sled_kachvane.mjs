/* Бейби Ленд · 24.10 · ПРОВЕРКАТА НА ЖИВИЯ САЙТ след «wrangler deploy» (вика се от kachi.mjs, т. 6)
   node dev/proba/proba_sled_kachvane.mjs https://babyland.<акаунт>.workers.dev
   Само ЧЕТЕ (GET). Сверява живото с папката: началната страница, /api/me без вход (README т. 6: 401 + logged_in:false,
   не страницата на приложението), sw.js, kb.js със същата ?v= като в index.html и с новите карти, lib/index.json със
   същия брой статии, manifest. Последният ред: «ОБЩО N · наред M · разминавания K»; изход 0 = всичко наред. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const KOREN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const adres = String(process.argv[2] || "").replace(/\/+$/, "");
if (!/^https?:\/\//.test(adres)) { console.log("ползване: node dev/proba/proba_sled_kachvane.mjs <адрес>"); process.exit(2); }

const index = fs.readFileSync(path.join(KOREN, "index.html"), "utf8");
const vKb = (index.match(/js\/kb\.js\?v=(\d+)/) || [])[1] || "";
const nLib = JSON.parse(fs.readFileSync(path.join(KOREN, "lib/index.json"), "utf8")).n;
const vSw = (fs.readFileSync(path.join(KOREN, "sw.js"), "utf8").match(/babyland-v\d+/) || [])[0] || "";

let nared = 0, razm = 0;
const ok = (ime, da, zashto) => { if (da) { nared++; console.log("  ✓ " + ime); } else { razm++; console.log("  ✗ " + ime + " — " + zashto); } };
async function vzemi(p) {
  try { const r = await fetch(adres + p, { redirect: "follow" }); return { kod: r.status, tekst: await r.text() }; }
  catch (e) { return { kod: 0, tekst: String(e && e.message || e) }; }
}

const n = await vzemi("/");
ok("началната страница", n.kod === 200 && /Baby Land/.test(n.tekst), "код " + n.kod);
const me = await vzemi("/api/me");
let j = null; try { j = JSON.parse(me.tekst); } catch (e) { j = null; }
ok("/api/me без вход → 401 и logged_in:false (worker-ът е качен)", me.kod === 401 && j && j.logged_in === false,
  me.kod === 200 && /<html/i.test(me.tekst) ? "излезе страницата — worker-ът не е качен (README т. 3)" : "код " + me.kod);
const sw = await vzemi("/sw.js");
ok("sw.js (" + vSw + ")", sw.kod === 200 && sw.tekst.includes(vSw), "код " + sw.kod);
const kb = await vzemi("/js/kb.js?v=" + vKb);
ok("kb.js ?v=" + vKb + " с новите карти", kb.kod === 200 && kb.tekst.includes("zn7a-sedmica-19-20") && kb.tekst.includes("zn10-levski-za-dete"), "код " + kb.kod);
const li = await vzemi("/lib/index.json");
let ln = -1; try { ln = JSON.parse(li.tekst).n; } catch (e) { ln = -1; }
ok("lib/index.json · " + nLib + " статии", li.kod === 200 && ln === nLib, "на живо " + ln);
const mf = await vzemi("/manifest.webmanifest");
ok("manifest.webmanifest", mf.kod === 200, "код " + mf.kod);

console.log("ОБЩО " + (nared + razm) + " · наред " + nared + " · разминавания " + razm);
process.exit(razm ? 1 : 0);
