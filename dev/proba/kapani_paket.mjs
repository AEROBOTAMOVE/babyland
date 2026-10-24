/* Бейби Ленд · 24.10 · КАПАНИТЕ НА ГЛОБАЛНИЯ ОБХВАТ върху сглобения пакет на wrangler (без workerd)
   node dev/proba/kapani_paket.mjs <out/index.js>
   Cloudflare забранява мрежа, таймери и случайни числа ИЗВЪН заявка (при зареждането на модула) — workerd гърми с
   „Disallowed operation called within global scope“. Тук те се подменят с броячи ПРЕДИ импорта; трябва 0 викания.
   Плюс: default export има fetch(); scheduled() — Бейби Ленд няма cron (wrangler.toml без [triggers]), затова не се иска.
   Последният ред: «КАПАНИ: N/N»; изход 0 = всичко минава. */
import path from "node:path";
import { pathToFileURL } from "node:url";

const paket = process.argv[2];
if (!paket) { console.log("ползване: node dev/proba/kapani_paket.mjs <out/index.js>"); process.exit(2); }

const broi = { fetch: 0, setTimeout: 0, setInterval: 0, "Math.random": 0, "crypto.getRandomValues": 0, "crypto.randomUUID": 0 };
const stari = { fetch: globalThis.fetch, setTimeout: globalThis.setTimeout, setInterval: globalThis.setInterval,
  random: Math.random, grv: globalThis.crypto.getRandomValues.bind(globalThis.crypto), uuid: globalThis.crypto.randomUUID.bind(globalThis.crypto) };
globalThis.fetch = (...a) => { broi.fetch++; return stari.fetch(...a); };
globalThis.setTimeout = (...a) => { broi.setTimeout++; return stari.setTimeout(...a); };
globalThis.setInterval = (...a) => { broi.setInterval++; return stari.setInterval(...a); };
Math.random = () => { broi["Math.random"]++; return stari.random(); };
globalThis.crypto.getRandomValues = (x) => { broi["crypto.getRandomValues"]++; return stari.grv(x); };
globalThis.crypto.randomUUID = () => { broi["crypto.randomUUID"]++; return stari.uuid(); };

const m = await import(pathToFileURL(path.resolve(paket)).href);

globalThis.fetch = stari.fetch; globalThis.setTimeout = stari.setTimeout; globalThis.setInterval = stari.setInterval;
Math.random = stari.random; globalThis.crypto.getRandomValues = stari.grv; globalThis.crypto.randomUUID = stari.uuid;

let dobri = 0, vsichki = 0;
const ok = (ime, da, zashto) => { vsichki++; if (da) { dobri++; console.log("  ✓ " + ime); } else console.log("  ✗ " + ime + (zashto ? " — " + zashto : "")); };
for (const [ime, n] of Object.entries(broi)) ok(ime + " при зареждането: 0 викания", n === 0, n + " викания");
ok("default export има fetch()", !!m.default && typeof m.default.fetch === "function");
ok("makeWorker е изнесен (за пробите)", typeof m.makeWorker === "function");
console.log("  · scheduled(): не се иска — Бейби Ленд няма cron" + (m.default && typeof m.default.scheduled === "function" ? " (но го има)" : ""));
console.log("КАПАНИ: " + dobri + "/" + vsichki);
process.exit(dobri === vsichki ? 0 : 1);
