// Свеж дъмп на картите ОТ ЖИВИЯ kb.js (не от стария dev/_c_zhm_cards.jsonl).
// Причина: js/kb.js е пипан на 30.09 — старият дъмп е предположение.
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const { zaredi } = require(path.join(ROOT, "dev", "pyasachnik.js"));
const fs = require("fs");
const W = zaredi(null);
const KB = W.BL_KB || W.KB;
const cards = KB.entries;
if (!cards || cards.length < 500) { console.log("СЛЯПА СОНДА: карти=" + (cards && cards.length)); process.exit(2); }
console.log("БРОЙ КАРТИ:", cards.length);
const rooms = {};
cards.forEach(c => rooms[c.room] = (rooms[c.room] || 0) + 1);
console.log(JSON.stringify(rooms, null, 1));
const out = cards.map(c => JSON.stringify({
  id: c.id, room: c.room, title: c.title, core: c.core, tip: c.tip,
  follow: c.follow, keys: c.keys, ot: c["от"], do: c["до"]
})).join("\n");
fs.writeFileSync(path.join(__dirname, "zhenata_cards.jsonl"), out, "utf8");
console.log("записан scratchpad/zhenata_cards.jsonl");
