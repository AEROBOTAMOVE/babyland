// УПОРИТИТЕ 4: въпроси, които НЕ се поправиха от първия кръг ключове.
// Търси се формулировка, която наистина обръща присъдата.
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const { zaredi } = require(path.join(ROOT, "dev", "pyasachnik.js"));
const пам = { bl_baby: { birth: "2025-11-20" } };

const кандидати = {
  "y5-cikyl-kakav-e": [
    "цикълът ми дойде и е много по-силен от преди",
    "цикълът ми е по-силен от преди",
    "по-силен цикъл от преди",
    "първият цикъл е по-силен от преди раждането"
  ],
  "y5-zhelyazo-umora": [
    "уморена съм постоянно дори като спя",
    "уморена съм постоянно",
    "спя а съм уморена постоянно",
    "дори като спя съм уморена"
  ],
  "nia-veni-kraka": [
    "крачетата ми подуват вечер",
    "краката ми подуват вечер и обувките не ми стават",
    "обувките не ми стават от подути крака",
    "подуват ми се краката вечер след раждането"
  ],
  "nw-izpuskane-urina": [
    "напишквам се като подскочим на батута",
    "напишквам се като подскачам",
    "изпускам урина като подскачам",
    "напишквам се на батута"
  ]
};
const въпроси = {
  "y5-cikyl-kakav-e": ["цикълът ми дойде и е много по силен от преди", "Жената в мен"],
  "y5-zhelyazo-umora": ["уморена съм постоянно дори като спя 8 часа", "Жената в мен"],
  "nia-veni-kraka": ["крачетата ми подуват вечер и обувките не ми стават", "Жената в мен"],
  "nw-izpuskane-urina": ["като подскочим на батута с голямото и се напишквам", "Жената в мен"]
};

const коя = (W) => (t, с) => {
  try {
    const m = W.BL_MOTHERFLAG(t, с); if (m) return "motherflag:" + m;
    if (W.BL_PREGFLAG(t, с)) return "pregflag";
    if (W.BL_REDFLAG(t)) return "redflag";
  } catch (e) { return "ГРЪМ"; }
  const k = W.BL_MATCH(t, с);
  return k ? k.id : "ТИШИНА";
};
const A = zaredi(null, { памет: пам });
if (!A.BL_MATCH("косата ми пада след раждането", "Жената в мен")) { console.log("СЛЯПА СОНДА"); process.exit(2); }

for (const id in кандидати) {
  const [в, с] = въпроси[id];
  console.log("═══ " + id + "  ← « " + в + " »");
  console.log("    ПРЕДИ (без нищо): " + коя(A)(в, с));
  кандидати[id].forEach(k => {
    const пач = (src) => src + "\n;(function(){var e=window.KB.entries.find(function(x){return x.id===" + JSON.stringify(id) + ";});" +
      "e.keys=(e.keys||[]).concat([" + JSON.stringify(k) + "]);})();\n";
    const B = zaredi(null, { памет: пам, kbPatch: пач });
    const кБ = коя(B);
    console.log("    + « " + k + " »  → ключът сам: " + кБ(k, с).padEnd(26) + " · ВЪПРОСЪТ: " + кБ(в, с));
  });
  console.log("");
}
