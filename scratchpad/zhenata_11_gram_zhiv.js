// СМЪРТОНОСЕН ЛИ Е ГРЪМЪТ НАЖИВО — уточнена мярка.
// В живото приложение (helper.js:4000-4132) редът е:
//   motherLevel → ако върне нещо, ОТГОВАРЯ и се ВРЪЩА (не стига до pregLevel)
//   иначе pregLevel ← ТУК гърми и НЕ е в try/catch
// Значи наистина фатални са само ключовете, които НЕ вдигат майчин флаг
// и гърмят в pregLevel.
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..");
const { zaredi } = require(path.join(ROOT, "dev", "pyasachnik.js"));
const W = zaredi(null, { памет: { bl_baby: { birth: "2025-11-20" } } });
const карти = fs.readFileSync(path.join(__dirname, "zhenata_cards.jsonl"), "utf8").trim().split("\n").map(JSON.parse);
if (!W.BL_MATCH("косата ми пада след раждането", "Жената в мен")) { console.log("СЛЯПА СОНДА"); process.exit(2); }

const бр = { всички: 0, гръмПрег: 0, фатални: 0 };
const дветеСтаи = { всички: 0, гръмПрег: 0, фатални: 0 };
const фаталниКарти = new Set(), фаталниКартиДве = new Set(), примери = [];
карти.forEach(c => {
  (c.keys || []).forEach(k => {
    const две = (c.room === "Жената в мен" || c.room === "Дневник на мама");
    бр.всички++; if (две) дветеСтаи.всички++;
    let майчин = null;
    try { майчин = W.BL_MOTHERFLAG(k, c.room); } catch (e) { майчин = null; }
    let гърми = false;
    try { W.BL_PREGFLAG(k, c.room); } catch (e) { гърми = true; }
    if (гърми) { бр.гръмПрег++; if (две) дветеСтаи.гръмПрег++; }
    if (гърми && !майчин) {
      бр.фатални++; фаталниКарти.add(c.id);
      if (две) { дветеСтаи.фатални++; фаталниКартиДве.add(c.id + " | " + c.title); if (примери.length < 20) примери.push(c.id + " :: " + k); }
    }
  });
});
console.log("ЦЯЛАТА БАЗА: " + бр.всички + " ключа · гърмят в pregLevel " + бр.гръмПрег +
  " · ФАТАЛНИ НАЖИВО (без майчин флаг преди това) " + бр.фатални +
  " (" + (бр.фатални / бр.всички * 100).toFixed(2) + "%) в " + фаталниКарти.size + " карти");
console.log("ДВЕТЕ МИ СТАИ: " + дветеСтаи.всички + " ключа · гърмят " + дветеСтаи.гръмПрег +
  " · ФАТАЛНИ " + дветеСтаи.фатални + " в " + фаталниКартиДве.size + " карти");
console.log("\nПРИМЕРИ (фатални, от моите две стаи):");
примери.forEach(x => console.log("  " + x));
console.log("\nФАТАЛНИ КАРТИ в двете ми стаи:");
Array.from(фаталниКартиДве).sort().forEach(x => console.log("  " + x));
