// Кой мести присъдата за въпрос №3 — гейтовете ли, или ВТОРИЯТ мозък?
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const { zaredi } = require(path.join(ROOT, "dev", "pyasachnik.js"));
const предлог = require("./zhenata_7_predlog.js");
const пам = { bl_baby: { birth: "2025-11-20" } };
const Ж = "Жената в мен";
const в = "челото ми се оголи отпред и не знам как да го крия";
const пълно = (W) => (t, с) => {
  try {
    const m = W.BL_MOTHERFLAG(t, с); if (m) return "motherflag:" + m;
    if (W.BL_PREGFLAG(t, с)) return "pregflag";
    if (W.BL_REDFLAG(t)) return "redflag";
  } catch (e) { return "ГРЪМ"; }
  const k = W.BL_MATCH(t, с); return k ? k.id : "ТИШИНА";
};

console.log("--- само BL_MATCH, свеж мозък:");
console.log("   " + (function () { const W = zaredi(null, { памет: пам }); const k = W.BL_MATCH(в, Ж); return k ? k.id : "ТИШИНА"; })());

console.log("--- пълната пътека (гейт+match), свеж мозък:");
console.log("   " + пълно(zaredi(null, { памет: пам }))(в, Ж));

console.log("--- пълната пътека, но СЛЕД като е зареден и ВТОРИ (пачнат) мозък:");
{
  const A = zaredi(null, { памет: пам });
  const пач = (src) => src + "\n;(function(){var П=" + JSON.stringify(предлог) + ";" +
    "for(var id in П){var e=window.KB.entries.find(function(x){return x.id===id;});" +
    "if(!e){throw new Error('НЯМА КАРТА '+id);}e.keys=(e.keys||[]).concat(П[id]);}})();\n";
  const B = zaredi(null, { памет: пам, kbPatch: пач });
  console.log("   A: " + пълно(A)(в, Ж) + "   (B: " + пълно(B)(в, Ж) + ")");
}
console.log("--- обратен ред: първо B, после A:");
{
  const пач = (src) => src + "\n;(function(){var П=" + JSON.stringify(предлог) + ";" +
    "for(var id in П){var e=window.KB.entries.find(function(x){return x.id===id;});" +
    "if(!e){throw new Error('НЯМА КАРТА '+id);}e.keys=(e.keys||[]).concat(П[id]);}})();\n";
  const B = zaredi(null, { памет: пам, kbPatch: пач });
  const A = zaredi(null, { памет: пам });
  console.log("   A: " + пълно(A)(в, Ж) + "   (B: " + пълно(B)(в, Ж) + ")");
}
console.log("--- A сам, но с празна памет (без бебе):");
console.log("   " + пълно(zaredi(null))(в, Ж));
