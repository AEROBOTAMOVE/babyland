// ДВЕ ОСТАНАЛИ ДУПКИ:
//  (1) „цикълът ми още го няма а мъника е на 10 месеца" — ключът „цикълът ми
//      още го няма" САМ води до pp-cikyl, затова уредът ми го обяви за
//      ИЗЛИШЕН и го махнах. Тогава въпросът спря да се поправя. Проверявам
//      дали „вече води там" НЕ значи „не е нужен като ключ".
//  (2) латиницата: помага ли ЛАТИНСКИ ключ там, където кирилският не хваща.
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const { zaredi } = require(path.join(ROOT, "dev", "pyasachnik.js"));
const пам = { bl_baby: { birth: "2025-11-20" } };
const коя = (W, с) => (t) => {
  try {
    const m = W.BL_MOTHERFLAG(t, с); if (m) return "motherflag:" + m;
    if (W.BL_PREGFLAG(t, с)) return "pregflag";
    if (W.BL_REDFLAG(t)) return "redflag";
  } catch (e) { return "ГРЪМ"; }
  const k = W.BL_MATCH(t, с); return k ? k.id : "ТИШИНА";
};
const пач = (id, ключове) => (src) => src +
  "\n;(function(){var e=window.KB.entries.find(function(x){return x.id===" + JSON.stringify(id) + ";});" +
  "if(!e)throw new Error('НЯМА КАРТА');e.keys=(e.keys||[]).concat(" + JSON.stringify(ключове) + ");})();\n";

const Ж = "Жената в мен";
const A = zaredi(null, { памет: пам });
if (!A.BL_MATCH("косата ми пада след раждането", Ж)) { console.log("СЛЯПА СОНДА"); process.exit(2); }

console.log("═══ (1) pp-cikyl ═══");
const в1 = "цикълът ми още го няма а мъника е на 10 месеца";
console.log("  ПРЕДИ: " + коя(A, Ж)(в1));
[["още не ми е дошъл цикълът"], ["цикълът ми още го няма"], ["още не ми е дошъл цикълът", "цикълът ми още го няма"]].forEach(кл => {
  const B = zaredi(null, { памет: пам, kbPatch: пач("pp-cikyl", кл) });
  console.log("  + " + JSON.stringify(кл) + " → " + коя(B, Ж)(в1));
});

console.log("\n═══ (2) латиница ═══");
const в2 = "kakva kontracepcia da vzema dokato kurmya";
console.log("  ПРЕДИ: " + коя(A, Ж)(в2));
[
  ["каква контрацепция да взема докато кърмя"],
  ["kakva kontracepcia da vzema dokato kurmya"],
  ["kakva kontracepcia dokato kurmya"],
  ["kontracepcia dokato kurmya"]
].forEach(кл => {
  const B = zaredi(null, { памет: пам, kbPatch: пач("nia-metodi-predpazvane", кл) });
  console.log("  + " + JSON.stringify(кл) + " → въпросът: " + коя(B, Ж)(в2) +
    " · ключът сам: " + коя(B, Ж)(кл[0]));
});
