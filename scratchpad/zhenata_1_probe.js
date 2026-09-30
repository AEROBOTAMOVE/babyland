// Какви уреди има мозъкът — за да не измислям гейтове по памет.
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const { zaredi } = require(path.join(ROOT, "dev", "pyasachnik.js"));
const W = zaredi(null, { памет: { bl_baby: { birth: "2025-11-20" } } });
console.log(Object.keys(W).filter(k => /^BL_/.test(k)).sort().join("\n"));
console.log("--- KB ключове:", Object.keys(W.BL_KB || W.KB || {}).join(", "));
console.log("--- BL_MATCH.length =", W.BL_MATCH.length);
const m = W.BL_MATCH("косата ми пада на кичури", "Жената в мен");
console.log("--- проба:", m ? m.id + " | " + m.title : "ТИШИНА");
const n = W.BL_MATCH("бла бла зюмбюл трактор пшш", "Жената в мен");
console.log("--- безсмислица:", n ? n.id : "null(ОК)");
