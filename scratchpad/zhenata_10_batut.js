// ВТОРИ ОПИТ за единствения устоял въпрос: батутът.
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const { zaredi } = require(path.join(ROOT, "dev", "pyasachnik.js"));
const пам = { bl_baby: { birth: "2025-11-20" } };
const id = "nw-izpuskane-urina";
const в = "като подскочим на батута с голямото и се напишквам", с = "Жената в мен";
const коя = (W) => (t) => {
  try {
    const m = W.BL_MOTHERFLAG(t, с); if (m) return "motherflag:" + m;
    if (W.BL_PREGFLAG(t, с)) return "pregflag";
    if (W.BL_REDFLAG(t)) return "redflag";
  } catch (e) { return "ГРЪМ"; }
  const k = W.BL_MATCH(t, с); return k ? k.id : "ТИШИНА";
};
[
  "изпускам когато скачаме на батут",
  "напишквам се на батут",
  "батут изпускане на урина",
  "напишквам се когато скачам с детето",
  "като подскочим на батута се напишквам",
  "подскочим на батута и се напишквам"
].forEach(k => {
  const пач = (src) => src + "\n;(function(){var e=window.KB.entries.find(function(x){return x.id===" + JSON.stringify(id) + ";});e.keys=(e.keys||[]).concat([" + JSON.stringify(k) + "]);})();\n";
  const B = zaredi(null, { памет: пам, kbPatch: пач });
  console.log("+ « " + k + " » → сам: " + коя(B)(k).padEnd(24) + " · ВЪПРОСЪТ: " + коя(B)(в));
});
