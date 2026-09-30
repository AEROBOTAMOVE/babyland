// ХИПОТЕЗА: голият ключ «напишква» на nd-golyamoto-varna (за ГОЛЯМОТО дете)
// краде въпроса на МАЙКАТА за себе си („и се напишквам"). Ако е вярно,
// махането САМО на този ключ пуска майката към nw-izpuskane-urina, БЕЗ да
// счупи собствените въпроси на nd-golyamoto-varna.
// ⚠️ Нищо не се записва в js/kb.js — само пач върху текста в паметта.
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const { zaredi } = require(path.join(ROOT, "dev", "pyasachnik.js"));
const пам = { bl_baby: { birth: "2025-11-20" } };
const Ж = "Жената в мен", Д = "Дневник на мама";
const коя = (W) => (t, с) => {
  try {
    const m = W.BL_MOTHERFLAG(t, с); if (m) return "motherflag:" + m;
    if (W.BL_PREGFLAG(t, с)) return "pregflag";
    if (W.BL_REDFLAG(t)) return "redflag";
  } catch (e) { return "ГРЪМ"; }
  const k = W.BL_MATCH(t, с); return k ? k.id : "ТИШИНА";
};
const пач = (src) => src +
  "\n;(function(){var e=window.KB.entries.find(function(x){return x.id==='nd-golyamoto-varna';});" +
  "if(!e)throw new Error('НЯМА КАРТА');var пр=e.keys.length;" +
  "e.keys=e.keys.filter(function(k){return k!=='напишква';});" +
  "if(e.keys.length!==пр-1)throw new Error('КЛЮЧЪТ НЕ БЕШЕ МАХНАТ');" +
  "window.__МАХНАТ=true;})();\n";
const A = zaredi(null, { памет: пам });
const B = zaredi(null, { памет: пам, kbPatch: пач });
if (!B.__МАХНАТ) { console.log("ПАЧЪТ НЕ Е ВЛЯЗЪЛ"); process.exit(2); }
if (!A.BL_MATCH("косата ми пада след раждането", Ж)) { console.log("СЛЯПА СОНДА"); process.exit(2); }
const кА = коя(A), кБ = коя(B);

console.log("═══ ВЪПРОСЪТ НА МАЙКАТА ЗА СЕБЕ СИ ═══");
[["като подскочим на батута с голямото и се напишквам", Ж],
 ["напишквам се като подскачам", Ж],
 ["напишквам се като се смея", Ж],
 ["напишквам се когато кихна", Ж]].forEach(([t, с]) =>
  console.log("  " + кА(t, с).padEnd(24) + " → " + кБ(t, с).padEnd(24) + " ← " + t));

console.log("\n═══ СОБСТВЕНИТЕ ВЪПРОСИ НА nd-golyamoto-varna (да не се счупят) ═══");
["напишква се пак", "голямото пак се напишква", "се напишква пак",
 "голямото се напишква в градината откакто дойде бебето",
 "отново се напишква нощем откакто дойде бебето",
 "голямото се върна назад след бебето", "голямото иска биберон пак"].forEach(t =>
  console.log("  " + кА(t, Д).padEnd(24) + " → " + кБ(t, Д).padEnd(24) + " ← " + t));
