// ПРОВЕРКА НА ПРЕДЛОЖЕНИТЕ КЛЮЧОВЕ — два мозъка, един без, един с тях.
// Нищо не се записва в js/kb.js. Мери се:
//   1) зает ли е ключът вече от друга карта (буквално)
//   2) СЕГА води ли вече до целта (ако води — ключът е излишен)
//   3) СЛЕД добавянето води ли до целта
//   4) СЛЕД добавянето майчиният ВЪПРОС стига ли до целта
//   5) РЕГРЕС: чужди карти губят ли свои ключове
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..");
const { zaredi } = require(path.join(ROOT, "dev", "pyasachnik.js"));
const предлог = require("./zhenata_7_predlog.js");
const карти = fs.readFileSync(path.join(__dirname, "zhenata_cards.jsonl"), "utf8").trim().split("\n").map(JSON.parse);

const пач = (src) => src + "\n;(function(){var П=" + JSON.stringify(предлог) + ";" +
  "for(var id in П){var e=window.KB.entries.find(function(x){return x.id===id;});" +
  "if(!e){throw new Error('НЯМА КАРТА '+id);}e.keys=(e.keys||[]).concat(П[id]);}})();\n";

const пам = { памет: { bl_baby: { birth: "2025-11-20" } } };
const A = zaredi(null, пам);
const B = zaredi(null, { памет: пам.памет, kbPatch: пач });

// ─── ПАЗАЧ и за двата мозъка ───
[["A", A], ["B", B]].forEach(([име, W]) => {
  if (!W.BL_MATCH("косата ми пада след раждането", "Жената в мен")) { console.log("СЛЯПА СОНДА " + име); process.exit(2); }
  if (W.BL_MATCH("зюмбюл трактор пшш кладенец мрън", "Жената в мен")) { console.log("СЛЯПА СОНДА " + име + " (безсмислица)"); process.exit(2); }
  if (W.BL_REDFLAG("бебето не диша") !== true) { console.log("СЛЯПА СОНДА " + име + " (redflag)"); process.exit(2); }
});
// пазач, че пачът НАИСТИНА е влязъл
{
  const e = (B.BL_KB || B.KB).entries.find(x => x.id === "nia-zybi");
  if (!e.keys.includes("зъбите ми се ронят")) { console.log("ПАЧЪТ НЕ Е ВЛЯЗЪЛ"); process.exit(2); }
}
console.log("КОНТРОЛ ОК за двата мозъка, пачът е влязъл\n");

const коя = (W) => (t, стая) => {
  try {
    const m = W.BL_MOTHERFLAG(t, стая); if (m) return "motherflag:" + m;
    if (W.BL_PREGFLAG(t, стая)) return "pregflag";
    if (W.BL_REDFLAG(t)) return "redflag";
  } catch (e) { return "ГРЪМ"; }
  const k = W.BL_MATCH(t, стая);
  return k ? k.id : "ТИШИНА";
};
const кА = коя(A), кБ = коя(B);
const стаяНа = {}; карти.forEach(c => стаяНа[c.id] = c.room);
const заетиОт = {};
карти.forEach(c => (c.keys || []).forEach(k => { (заетиОт[k] = заетиОт[k] || []).push(c.id); }));

console.log("═══ 1-3: ВСЕКИ ПРЕДЛОЖЕН КЛЮЧ ═══");
let ок = 0, зает = 0, излишен = 0, неулучва = 0;
const провали = [];
for (const id in предлог) {
  const стая = стаяНа[id];
  if (!стая) { console.log("❌ НЯМА КАРТА " + id); process.exit(2); }
  for (const k of предлог[id]) {
    const з = заетиОт[k];
    if (з) { зает++; console.log("❌ ЗАЕТ  [" + id + "] «" + k + "» → вече е ключ на " + з.join(",")); провали.push([id, k, "зает"]); continue; }
    const преди = кА(k, стая), след = кБ(k, стая);
    if (преди === id) { излишен++; console.log("⚠️  ИЗЛИШЕН [" + id + "] «" + k + "» вече води там"); провали.push([id, k, "излишен"]); continue; }
    if (след !== id) { неулучва++; console.log("❌ НЕ УЛУЧВА [" + id + "] «" + k + "» ПРЕДИ=" + преди + " СЛЕД=" + след); провали.push([id, k, "неулучва:" + след]); continue; }
    ок++;
  }
}
console.log("ПРИЕТИ=" + ок + " · ЗАЕТИ=" + зает + " · ИЗЛИШНИ=" + излишен + " · НЕ УЛУЧВАТ=" + неулучва);
fs.writeFileSync(path.join(__dirname, "zhenata_provali.json"), JSON.stringify(провали, null, 1), "utf8");

console.log("\n═══ 4: 60-ТЕ ВЪПРОСА ПРЕДИ / СЛЕД ═══");
const рез = JSON.parse(fs.readFileSync(path.join(__dirname, "zhenata_tialo_rezultat.json"), "utf8"));
let смени = 0;
рез.forEach((р, i) => {
  const преди = кА(р.въпрос, р.стая), след = кБ(р.въпрос, р.стая);
  if (преди !== след) { смени++; console.log(String(i + 1).padStart(2) + ". " + преди.padEnd(30) + " → " + след.padEnd(30) + "  « " + р.въпрос + " »"); }
});
console.log("сменени отговори: " + смени + " от 60");

console.log("\n═══ 5: РЕГРЕС върху 300 чужди ключа (извадка) ═══");
const чужди = [];
карти.forEach(c => { if (!предлог[c.id]) (c.keys || []).forEach(k => чужди.push([c.id, c.room, k])); });
const стъпка = Math.max(1, Math.floor(чужди.length / 300));
let проверени = 0, откраднати = 0;
for (let i = 0; i < чужди.length; i += стъпка) {
  const [id, стая, k] = чужди[i];
  const преди = кА(k, стая), след = кБ(k, стая);
  проверени++;
  if (преди !== след) { откраднати++; console.log("❌ КРАЖБА: «" + k + "» (" + id + ") ПРЕДИ=" + преди + " СЛЕД=" + след); }
}
console.log("проверени " + проверени + " чужди ключа от " + чужди.length + " · ПРОМЕНЕНИ=" + откраднати);
