// КОЛКО ШИРОК е гръмът на BL_PREGFLAG (helper.js:3668/3680 — заБебетоТук).
// Мери се върху СОБСТВЕНИТЕ ключове на базата: ако ключ на карта гърми,
// картата е недостижима в живото приложение (helper.js:4132 не е в try).
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..");
const { zaredi } = require(path.join(ROOT, "dev", "pyasachnik.js"));
const W = zaredi(null, { памет: { bl_baby: { birth: "2025-11-20" } } });
const карти = fs.readFileSync(path.join(__dirname, "zhenata_cards.jsonl"), "utf8").trim().split("\n").map(JSON.parse);

// ПАЗАЧ
if (!W.BL_MATCH("косата ми пада след раждането", "Жената в мен")) { console.log("СЛЯПА СОНДА"); process.exit(2); }

let ключове = 0, гръмнали = 0;
const картиГръм = new Set(), примери = [];
let всичкиКлючове = 0, всичкиГръм = 0;
const картиГръмВсички = new Set();
карти.forEach(c => {
  (c.keys || []).forEach(k => {
    всичкиКлючове++;
    let гърми = false;
    try { W.BL_PREGFLAG(k, c.room); } catch (e) { гърми = true; }
    if (гърми) { всичкиГръм++; картиГръмВсички.add(c.id + " [" + c.room + "] " + c.title); }
    if (c.room === "Жената в мен" || c.room === "Дневник на мама") {
      ключове++;
      if (гърми) { гръмнали++; картиГръм.add(c.id + " | " + c.title); if (примери.length < 14) примери.push(k); }
    }
  });
});
console.log("ДВЕТЕ СТАИ: ключове=" + ключове + " · ГРЪМВАЩИ=" + гръмнали +
  " (" + (гръмнали / ключове * 100).toFixed(2) + "%) · засегнати карти=" + картиГръм.size);
console.log("ЦЯЛАТА БАЗА: ключове=" + всичкиКлючове + " · ГРЪМВАЩИ=" + всичкиГръм +
  " (" + (всичкиГръм / всичкиКлючове * 100).toFixed(2) + "%) · засегнати карти=" + картиГръмВсички.size);
console.log("\nПРИМЕРНИ ГРЪМВАЩИ КЛЮЧОВЕ (от моите две стаи):");
примери.forEach(k => console.log("  « " + k + " »"));
console.log("\nЗАСЕГНАТИ КАРТИ В МОИТЕ ДВЕ СТАИ (" + картиГръм.size + "):");
Array.from(картиГръм).sort().forEach(x => console.log("  " + x));
