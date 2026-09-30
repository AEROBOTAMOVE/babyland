// ДИАГНОСТИКА на 4-те тишини, които подозирам за ЛАТИНИЦА, и на ГРЪМА.
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const { zaredi } = require(path.join(ROOT, "dev", "pyasachnik.js"));
const W = zaredi(null, { памет: { bl_baby: { birth: "2025-11-20" } } });

const коя = (t, стая) => {
  try {
    const m = W.BL_MOTHERFLAG(t, стая); if (m) return "motherflag:" + m;
    if (W.BL_PREGFLAG(t, стая)) return "pregflag";
    if (W.BL_REDFLAG(t)) return "redflag";
  } catch (e) { return "ГРЪМ(" + e.message + ")"; }
  const k = W.BL_MATCH(t, стая);
  return k ? k.id : "ТИШИНА";
};
const Ж = "Жената в мен";

console.log("═══ ЛАТИНИЦА срещу КИРИЛИЦА (един и същ въпрос) ═══");
[
  ["zybite mi se ronyat sled razhdaneto", "зъбите ми се ронят след раждането"],
  ["gyrdite mi sa prazni i meki veche ne sa kato predi", "гърдите ми са празни и меки вече не са като преди"],
  ["kakva kontracepcia da vzema dokato kurmya", "каква контрацепция да взема докато кърмя"],
  ["potya se noshtem cyalata sam mokra", "потя се нощем цялата съм мокра"],
  ["nokite mi se chupyat i se belyat na sloeve", "ноктите ми се чупят и се белят на слоеве"],
  ["sledrodilen kolan pomaga li za korema", "следродилен колан помага ли за корема"],
  ["mozhe li da otida na fitnes sled 4 meseca", "може ли да отида на фитнес след 4 месеца"],
  ["koga se vrushta cikula sled razhdane ako kurmya", "кога се връща цикълът след раждане ако кърмя"],
  ["razshireni veni na kraka sled razhdane koe pomaga", "разширени вени на краката след раждане кое помага"],
].forEach(([л, к]) => {
  console.log("  ЛАТ: " + коя(л, Ж).padEnd(30) + " ← " + л);
  console.log("  КИР: " + коя(к, Ж).padEnd(30) + " ← " + к);
});

console.log("\n═══ ГРЪМЪТ: коя дума го пали ═══");
[
  "кантара стои и не мърда а не ям почти нищо",
  "кантарът стои и не мърда",
  "кантара не мърда",
  "кантар",
  "не ям почти нищо",
  "теглото ми стои и не мърда",
  "меря се на кантара всяка сутрин",
  "кантарът ми показва все едно и също",
].forEach(t => console.log("  " + коя(t, Ж).padEnd(34) + " ← " + t));

console.log("\n═══ КОЛКО ШИРОК Е ГРЪМЪТ (целият женски корпус от 60 + още) ═══");
const още = [
  "кантара стои", "печката е включена а аз съм с бебето", "количката ми се счупи",
  "телефонът ми падна във ваната", "гладачката ми изгоря", "прахосмукачката вдига шум",
  "огледалото ми показва чужд човек", "кантарът е счупен", "колата ми не запали",
];
let гърмят = 0;
още.forEach(t => { const р = коя(t, Ж); if (/^ГРЪМ/.test(р)) гърмят++; console.log("  " + р.slice(0, 40).padEnd(42) + " ← " + t); });
console.log("  ГРЪМВАТ: " + гърмят + " от " + още.length);
