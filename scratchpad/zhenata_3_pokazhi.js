// Показва ЯДРОТО и КЛЮЧОВЕТЕ на посочени карти — за да съдя по съдържание,
// а не по заглавие.
const fs = require("fs"), path = require("path");
const карти = fs.readFileSync(path.join(__dirname, "zhenata_cards.jsonl"), "utf8").trim().split("\n").map(JSON.parse);
const по = {}; карти.forEach(c => по[c.id] = c);
process.argv.slice(2).forEach(id => {
  const c = по[id];
  if (!c) { console.log("═══ " + id + " — НЯМА ТАКАВА КАРТА"); return; }
  console.log("═══ " + id + " | [" + c.room + "] " + c.title);
  console.log("ЯДРО: " + (c.core || "").slice(0, 700));
  if (c.tip) console.log("СЪВЕТ: " + String(c.tip).slice(0, 320));
  console.log("КЛЮЧОВЕ (" + (c.keys || []).length + "): " + (c.keys || []).join(" | "));
  console.log("");
});
