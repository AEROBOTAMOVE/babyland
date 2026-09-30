// ФИНАЛНА СВЕРКА на scratchpad/klyuchove_zhenata_tialo.json срещу ЖИВАТА база.
// ⚠️ js/kb.js се пипа от други агенти В СЪЩАТА МИНУТА — затова се печата
//    подписът на файла ПРЕДИ и СЛЕД мярката. Двата мозъка се зареждат
//    един до друг, за да е сравнението срещу един и същ текст.
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const ROOT = path.resolve(__dirname, "..");
const { zaredi } = require(path.join(ROOT, "dev", "pyasachnik.js"));
const предлог = JSON.parse(fs.readFileSync(path.join(__dirname, "klyuchove_zhenata_tialo.json"), "utf8"));
const подпис = () => crypto.createHash("md5").update(fs.readFileSync(path.join(ROOT, "js/kb.js"))).digest("hex").slice(0, 12);
console.log("kb.js ПРЕДИ: " + подпис());

const пач = (src) => src + "\n;(function(){var П=" + JSON.stringify(предлог) + ";" +
  "for(var id in П){var e=window.KB.entries.find(function(x){return x.id===id;});" +
  "if(!e){throw new Error('НЯМА КАРТА '+id);}e.keys=(e.keys||[]).concat(П[id]);}})();\n";
const пам = { bl_baby: { birth: "2025-11-20" } };
const A = zaredi(null, { памет: пам });
const B = zaredi(null, { памет: пам, kbPatch: пач });
[["A", A], ["B", B]].forEach(([и, W]) => {
  if (!W.BL_MATCH("косата ми пада след раждането", "Жената в мен")) { console.log("СЛЯПА СОНДА " + и); process.exit(2); }
  if (W.BL_MATCH("зюмбюл трактор пшш кладенец мрън", "Жената в мен")) { console.log("СЛЯПА СОНДА " + и + " безсмислица"); process.exit(2); }
});
const карти = (B.BL_KB || B.KB).entries;
const КА = (A.BL_KB || A.KB).entries;
const заетиОт = {}; КА.forEach(c => (c.keys || []).forEach(k => { (заетиОт[k] = заетиОт[k] || []).push(c.id); }));

const коя = (W) => (t, с) => {
  try {
    const m = W.BL_MOTHERFLAG(t, с); if (m) return "motherflag:" + m;
    if (W.BL_PREGFLAG(t, с)) return "pregflag";
    if (W.BL_REDFLAG(t)) return "redflag";
  } catch (e) { return "ГРЪМ"; }
  const k = W.BL_MATCH(t, с); return k ? k.id : "ТИШИНА";
};
const кА = коя(A), кБ = коя(B);
const стаяНа = {}; КА.forEach(c => стаяНа[c.id] = c.room);

console.log("\n═══ ВСЕКИ КЛЮЧ: зает? води ли до целта след добавяне? ═══");
let бр = 0, лошо = 0;
for (const id in предлог) for (const k of предлог[id]) {
  бр++;
  const з = заетиОт[k];
  const с = стаяНа[id];
  const след = кБ(k, с);
  const бележки = [];
  if (з) бележки.push("ЗАЕТ ОТ " + з.join(","));
  if (след !== id) бележки.push("НЕ УЛУЧВА (" + след + ")");
  if (бележки.length) { лошо++; console.log("❌ [" + id + "] «" + k + "» " + бележки.join(" · ")); }
}
console.log("ключове=" + бр + " · проблемни=" + лошо);

console.log("\n═══ 60-ТЕ ВЪПРОСА: ПРЕДИ → СЛЕД ═══");
const рез = JSON.parse(fs.readFileSync(path.join(__dirname, "zhenata_tialo_rezultat.json"), "utf8"));
let смени = 0, назад = 0;
рез.forEach((р, i) => {
  const преди = кА(р.въпрос, р.стая), след = кБ(р.въпрос, р.стая);
  if (преди !== след) { смени++; console.log(String(i + 1).padStart(2) + ". " + преди.padEnd(28) + " → " + след.padEnd(28) + " « " + р.въпрос + " »"); }
});
console.log("сменени: " + смени + " от 60");

console.log("\n═══ РЕГРЕС: 400 чужди ключа ═══");
const чужди = [];
КА.forEach(c => { if (!предлог[c.id]) (c.keys || []).forEach(k => чужди.push([c.id, c.room, k])); });
const ст = Math.max(1, Math.floor(чужди.length / 400));
let пров = 0, пром = 0;
for (let i = 0; i < чужди.length; i += ст) {
  const [id, с, k] = чужди[i];
  if (кА(k, с) !== кБ(k, с)) { пром++; console.log("❌ «" + k + "» (" + id + ") " + кА(k, с) + " → " + кБ(k, с)); }
  пров++;
}
console.log("проверени " + пров + " от " + чужди.length + " · променени " + пром);
console.log("\nkb.js СЛЕД: " + подпис());
