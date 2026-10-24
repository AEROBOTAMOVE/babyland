/* Бейби Ленд · 24.10 · ФАЛШИВ wrangler за пробите на kachi.mjs (KACHI_WRANGLER=този файл). Без мрежа.
   Състоянието е в JSON файла от env KACHI_SAST: { vlyazal, bazi:[{name,uuid}], deployPada, tayni:[...] }.
   Всяко викане се дописва в KACHI_SAST + ".log" (за отчета на пробата). Тайните НЕ се пишат в лога — само имената. */
import fs from "node:fs";

const F = process.env.KACHI_SAST;
const s = JSON.parse(fs.readFileSync(F, "utf8"));
const a = process.argv.slice(2);
fs.appendFileSync(F + ".log", "wrangler " + a.join(" ") + "\n");
const zapishi = () => fs.writeFileSync(F, JSON.stringify(s, null, 1));
const stdin = () => { try { return fs.readFileSync(0, "utf8"); } catch (e) { return ""; } };

const k = a.join(" ");
if (k === "whoami") {
  if (s.vlyazal) { console.log("You are logged in with an OAuth Token, associated with the email aaeromove@gmail.com."); process.exit(0); }
  console.log("You are not authenticated. Please run `wrangler login`."); process.exit(0);
}
if (k === "login") { s.vlyazal = true; zapishi(); console.log("Successfully logged in."); process.exit(0); }
if (!s.vlyazal) { console.log("✘ [ERROR] You are not authenticated."); process.exit(1); }
if (k === "d1 list --json") { console.log(JSON.stringify(s.bazi)); process.exit(0); }
if (a[0] === "d1" && a[1] === "create") {
  const uuid = "3f2c9a10-7b4e-4d2a-9c61-8e0f5a7b2c94";
  s.bazi.push({ name: a[2], uuid }); zapishi();
  console.log("✅ Successfully created DB '" + a[2] + "'\n[[d1_databases]]\nbinding = \"DB\"\ndatabase_name = \"" + a[2] + "\"\ndatabase_id = \"" + uuid + "\"");
  process.exit(0);
}
if (a[0] === "d1" && a[1] === "migrations" && a[2] === "apply") {
  if (s.migr) { console.log("✅ No migrations to apply!"); process.exit(0); }
  s.migr = true; zapishi(); console.log("Migrations to be applied: 0001_create-auth.sql, 0002_create-admin-log.sql\n✅ Applied 2 migrations"); process.exit(0);
}
if (k === "deploy") {
  if (s.deployPada) { console.log("✘ [ERROR] A request to the Cloudflare API failed. Authentication error [code: 10000]"); process.exit(1); }
  console.log("Uploaded babyland (4.21 sec)\nDeployed babyland triggers (0.71 sec)\n  https://babyland.aaeromove.workers.dev\nCurrent Version ID: 9b1d0c2e");
  process.exit(0);
}
if (k === "secret list") { console.log(JSON.stringify(s.tayni.map((name) => ({ name, type: "secret_text" })))); process.exit(0); }
if (a[0] === "secret" && a[1] === "put") {
  const v = stdin().trim();
  if (!v) { console.log("✘ празна стойност"); process.exit(1); }
  if (!s.tayni.includes(a[2])) s.tayni.push(a[2]); zapishi();
  console.log("✨ Success! Uploaded secret " + a[2]); process.exit(0);
}
console.log("✘ [ERROR] непозната команда във фалшивия wrangler: " + k); process.exit(1);
