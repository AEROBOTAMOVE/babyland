// ТРИТЕ ОСТАВАЩИ ДУПКИ, които КЛЮЧ НЕ ПОПРАВЯ. Мери се точно какво ги държи.
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..");
const { zaredi } = require(path.join(ROOT, "dev", "pyasachnik.js"));
const W = zaredi(null, { памет: { bl_baby: { birth: "2025-11-20" } } });
const Ж = "Жената в мен";
const коя = (t) => {
  try {
    const m = W.BL_MOTHERFLAG(t, Ж); if (m) return "motherflag:" + m;
    if (W.BL_PREGFLAG(t, Ж)) return "pregflag";
    if (W.BL_REDFLAG(t)) return "redflag";
  } catch (e) { return "ГРЪМ"; }
  const k = W.BL_MATCH(t, Ж); return k ? k.id : "ТИШИНА";
};
if (!W.BL_MATCH("косата ми пада след раждането", Ж)) { console.log("СЛЯПА СОНДА"); process.exit(2); }

console.log("═══ (A) ЛИПСВА СЪДЪРЖАНИЕ: суха/грапава коса ═══");
["косата ми стана суха и грапава като слама", "косата ми е като слама",
 "косата ми стана груба на пипане", "косата ми се промени на допир след раждането",
 "къдравата ми коса стана права след раждането"].forEach(t => console.log("  " + коя(t).padEnd(22) + " ← " + t));
const карти = JSON.parse("[" + fs.readFileSync(path.join(__dirname, "zhenata_cards.jsonl"), "utf8").trim().split("\n").join(",") + "]");
const термини = ["суха коса", "косата ми е суха", "грапава коса", "груба коса", "структурата на косата", "накъсана коса", "цъфтящи краища"];
let намерени = 0;
карти.forEach(c => {
  const т = ((c.title || "") + " " + (c.core || "") + " " + (c.tip || "") + " " + (c.keys || []).join(" ")).toLowerCase();
  const х = термини.filter(x => т.includes(x)); if (х.length) { намерени++; console.log("  СЪДЪРЖАНИЕ: " + c.id + " ← " + х.join(",")); }
});
console.log("  карти със съдържание по темата: " + намерени + " от " + карти.length);

console.log("\n═══ (B) ГЕЙТ КРАДЕ: „забравих да си изпия хапчето\" ═══");
["забравих да си изпия хапчето вчера какво правя сега",
 "забравих да си изпия хапчето",
 "пропуснах хапче",
 "забравих противозачатъчното",
 "забравих да си взема хапчето за контрацепция"].forEach(t => {
  let ред = [];
  try { ред.push("mother=" + (W.BL_MOTHERFLAG(t, Ж) || "-")); } catch (e) { ред.push("mother=ГРЪМ"); }
  try { ред.push("preg=" + (W.BL_PREGFLAG(t, Ж) ? "ДА" : "-")); } catch (e) { ред.push("preg=ГРЪМ"); }
  ред.push("red=" + (W.BL_REDFLAG(t) ? "ДА" : "-"));
  const k = W.BL_MATCH(t, Ж);
  ред.push("match=" + (k ? k.id : "ТИШИНА"));
  console.log("  " + ред.join(" · ") + "  ← " + t);
});

console.log("\n═══ (C) БАТУТЪТ: кой печели и защо ═══");
["като подскочим на батута с голямото и се напишквам",
 "като подскочим на батута и се напишквам",
 "подскачам на батут и се напишквам",
 "напишквам се като подскачам",
 "с голямото на батута"].forEach(t => console.log("  " + коя(t).padEnd(24) + " ← " + t));
