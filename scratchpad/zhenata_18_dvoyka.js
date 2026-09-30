// ДВОЙКАТА: махане на голия «напишква» + добавяне на майчините ключове.
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
const НОВИ = ["напишквам се", "напишквам се като подскоча", "напишквам се като подскачам",
              "напишквам се като се смея", "изпускам когато скачам на батут"];
const пач = (src) => src +
  "\n;(function(){var g=window.KB.entries.find(function(x){return x.id==='nd-golyamoto-varna';});" +
  "var пр=g.keys.length; g.keys=g.keys.filter(function(k){return k!=='напишква';});" +
  "if(g.keys.length!==пр-1)throw new Error('НЕ МАХНАТ');" +
  "var u=window.KB.entries.find(function(x){return x.id==='nw-izpuskane-urina';});" +
  "u.keys=u.keys.concat(" + JSON.stringify(НОВИ) + "); window.__OK=true;})();\n";
const A = zaredi(null, { памет: пам });
const B = zaredi(null, { памет: пам, kbPatch: пач });
if (!B.__OK) { console.log("ПАЧЪТ НЕ Е ВЛЯЗЪЛ"); process.exit(2); }
if (!A.BL_MATCH("косата ми пада след раждането", Ж)) { console.log("СЛЯПА СОНДА"); process.exit(2); }
const кА = коя(A), кБ = коя(B);
console.log("═══ МАЙКАТА ЗА СЕБЕ СИ ═══");
["като подскочим на батута с голямото и се напишквам", "напишквам се като подскачам",
 "напишквам се като се смея", "напишквам се когато кихна", "напишквам се"].forEach(t =>
  console.log("  " + кА(t, Ж).padEnd(24) + " → " + кБ(t, Ж).padEnd(24) + " ← " + t));
console.log("═══ ГОЛЯМОТО ДЕТЕ (да не се счупи) ═══");
["напишква се пак", "голямото пак се напишква", "се напишква пак",
 "голямото се напишква в градината откакто дойде бебето",
 "отново се напишква нощем откакто дойде бебето", "детето се напишква откакто тръгна на ясла",
 "напишква се всеки ден", "пишка в гащите всеки ден"].forEach(t =>
  console.log("  " + кА(t, Д).padEnd(28) + " → " + кБ(t, Д).padEnd(28) + " ← " + t));
