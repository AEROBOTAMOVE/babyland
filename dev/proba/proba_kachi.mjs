/* Бейби Ленд · 24.10 · ПРОБАТА НА kachi.mjs БЕЗ ИНТЕРНЕТ — три сценария с фалшив wrangler (dev/proba/lazhliv_wrangler.mjs):
     А · чисто начало   — не е влязъл, базата я няма, ЗАМЕНИ_С_ID → вход, създаване, id в копието на wrangler.toml, качване, ГОТОВО
     Б · базата я има   — влязъл, «babyland» я има, wrangler.toml вече я сочи → нищо не се пише, ГОТОВО
     В · deploy пада    — „СПРЯНО · качване …“, без проверка на живия сайт
   Истинският wrangler.toml НЕ се пипа (KACHI_TOML = копие в папка за пробата); build.js и живата проверка са подменени
   с бързи заместители (KACHI_BUILD / KACHI_PROBA); test_dostap_cf.mjs е истинският (и той е без мрежа).
   ПУСКАНЕ: node dev/proba/proba_kachi.mjs   (изход 0 = и трите сценария дават очакваното) */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const KOREN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PAPKA = fs.mkdtempSync(path.join(os.tmpdir(), "bl_kachi_"));
const BUILD = path.join(PAPKA, "build_zamestitel.mjs");
const PROBA = path.join(PAPKA, "proba_zamestitel.mjs");
fs.writeFileSync(BUILD, "console.log('dist/: 312 файла · 23.14 МБ'); console.log('✅ пакетът е пълен');\n");
fs.writeFileSync(PROBA, "console.log('  ✓ началната страница (' + process.argv[2] + ')'); console.log('ОБЩО 6 · наред 6 · разминавания 0');\n");
const TOML_IZVOR = fs.readFileSync(path.join(KOREN, "wrangler.toml"), "utf8");
const ID = "3f2c9a10-7b4e-4d2a-9c61-8e0f5a7b2c94";

function pusni(ime, sast, toml, otgovori) {
  const dir = path.join(PAPKA, ime); fs.mkdirSync(dir);
  const T = path.join(dir, "wrangler.toml"); fs.writeFileSync(T, toml);
  const S = path.join(dir, "sast.json"); fs.writeFileSync(S, JSON.stringify(sast));
  const BK = path.join(dir, "backup");
  const r = spawnSync(process.execPath, [path.join(KOREN, "kachi.mjs")], {
    cwd: KOREN, encoding: "utf8", input: otgovori || "",
    env: { ...process.env, KACHI_WRANGLER: path.join(KOREN, "dev/proba/lazhliv_wrangler.mjs"), KACHI_SAST: S, KACHI_TOML: T, KACHI_BUILD: BUILD, KACHI_PROBA: PROBA, KACHI_BACKUP: BK },
  });
  const log = fs.existsSync(S + ".log") ? fs.readFileSync(S + ".log", "utf8") : "";
  const kopia = fs.existsSync(BK) ? fs.readdirSync(BK).filter((f) => /^babyland_\d{4}-\d\d-\d\d_\d\d-\d\d\.sql$/.test(f)) : [];
  return { kod: r.status, out: (r.stdout || "") + (r.stderr || ""), toml: fs.readFileSync(T, "utf8"), predi: fs.existsSync(T + ".predi"), log, kopia };
}
let dobri = 0, vsichki = 0;
const ocakvai = (ime, da) => { vsichki++; if (da) dobri++; console.log((da ? "  ✓ " : "  ✗ ") + ime); };
const pokazhi = (r) => console.log(r.out.trim().split(/\r?\n/).map((x) => "  │ " + x).join("\n") + "\n  │ — викания на wrangler: " + r.log.trim().split(/\r?\n/).join(" · "));

console.log("═══ А · чисто начало ═══");
const A = pusni("A", { vlyazal: false, bazi: [], deployPada: false, tayni: [] }, TOML_IZVOR, "\n");
pokazhi(A);
ocakvai("изход 0 и „ГОТОВО · адрес https://babyland.aaeromove.workers.dev · проверка 6/6“", A.kod === 0 && /ГОТОВО · адрес https:\/\/babyland\.aaeromove\.workers\.dev · проверка 6\/6/.test(A.out));
ocakvai("влезе (login) и създаде базата", /wrangler login/.test(A.log) && /d1 create babyland/.test(A.log));
ocakvai("id-то е в wrangler.toml, ЗАМЕНИ_С_ID го няма, копието .predi е направено", A.toml.includes(ID) && !A.toml.includes("ЗАМЕНИ_С_ID") && A.predi);
ocakvai("ADMIN_EMAILS не е пипан (Enter = само aaeromove)", !/secret put/.test(A.log));
ocakvai("нова база → без резервно копие („не трябва“), без d1 export", !/d1 export/.test(A.log) && A.kopia.length === 0 && /резервно копие — не трябва/.test(A.out));

console.log("═══ Б · базата я има ═══");
const tomlSId = TOML_IZVOR.replace("ЗАМЕНИ_С_ID", ID);
const B = pusni("B", { vlyazal: true, bazi: [{ name: "babyland", uuid: ID }], deployPada: false, tayni: [], migr: true }, tomlSId, "drug@abv.bg\n");
pokazhi(B);
ocakvai("изход 0 и ГОТОВО", B.kod === 0 && /ГОТОВО · адрес/.test(B.out));
ocakvai("без login и без create", !/wrangler login/.test(B.log) && !/d1 create/.test(B.log));
ocakvai("wrangler.toml е същият, копие .predi не е правено", B.toml === tomlSId && !B.predi);
ocakvai("ADMIN_EMAILS отиде през stdin; стойността е само на реда, където собственикът я пише (не в изхода на wrangler, не в лога)",
  /secret put ADMIN_EMAILS/.test(B.log) && /✓ ADMIN_EMAILS/.test(B.out) && B.out.split("drug@abv.bg").length - 1 === 1 && !B.log.includes("drug@abv.bg"));

ocakvai("базата я има → резервно копие backup/babyland_<дата_час>.sql ПРЕДИ таблиците",
  B.kopia.length === 1 && /✓ резервно копие на данните · backup\/babyland_/.test(B.out) && B.log.indexOf("d1 export") > -1 && B.log.indexOf("d1 export") < B.log.indexOf("migrations apply"));

console.log("═══ Г · резервното копие пада ═══");
const G = pusni("G", { vlyazal: true, bazi: [{ name: "babyland", uuid: ID }], deployPada: false, exportPada: true, tayni: [], migr: true }, tomlSId, "\n");
pokazhi(G);
ocakvai("изход 1 и „СПРЯНО · резервно копие …“", G.kod === 1 && /СПРЯНО · резервно копие/.test(G.out));
ocakvai("без копие НЕ се пипат таблиците и не се качва", !/migrations apply/.test(G.log) && !/^wrangler deploy$/m.test(G.log));

console.log("═══ В · deploy пада ═══");
const V = pusni("V", { vlyazal: true, bazi: [{ name: "babyland", uuid: ID }], deployPada: true, tayni: [], migr: true }, tomlSId, "\n");
pokazhi(V);
ocakvai("изход 1 и „СПРЯНО · качване · «wrangler deploy» не мина“", V.kod === 1 && /СПРЯНО · качване · «wrangler deploy» не мина/.test(V.out));
ocakvai("след падането няма „ГОТОВО“ и няма проверка на живия сайт", !/ГОТОВО/.test(V.out) && !/6\/6 · проверка/.test(V.out));

fs.rmSync(PAPKA, { recursive: true, force: true });
console.log("\nПРОБАТА: " + dobri + "/" + vsichki);
process.exit(dobri === vsichki ? 0 : 1);
