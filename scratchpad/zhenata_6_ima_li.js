// ИМА ЛИ СЪДЪРЖАНИЕ по темата — търси в ядрото/съвета/заглавието на ВСИЧКИ карти.
const fs = require("fs"), path = require("path");
const карти = fs.readFileSync(path.join(__dirname, "zhenata_cards.jsonl"), "utf8").trim().split("\n").map(JSON.parse);
const термини = process.argv.slice(2);
if (!термини.length) { console.log("дай термини"); process.exit(2); }
let бр = 0;
карти.forEach(c => {
  const т = ((c.title || "") + " ¦ " + (c.core || "") + " ¦ " + (c.tip || "") + " ¦ " + (c.keys || []).join(" ")).toLowerCase();
  const х = термини.filter(x => т.includes(x.toLowerCase()));
  if (х.length) {
    бр++;
    console.log(c.id.padEnd(36) + " [" + c.room + "] " + c.title + "   ←" + х.join(","));
  }
});
if (карти.length < 1000) { console.log("СЛЯПА СОНДА: само " + карти.length + " карти"); process.exit(2); }
console.log("попадения: " + бр + " от " + карти.length + " карти");
