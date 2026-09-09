// Правите кавички и апострофи в стаж-файл → български „ и ".
// Работи върху РАЗПАРСЕНИЯ обект, не върху суровия JSON — така екранирането
// не участва изобщо (платено три пъти днес с изядени обратни черти).
//   node dev/popravi_kavichki.js dev/nahodki/karti_v4.json
const fs = require('fs');
const П = process.argv[2];
if (!П || !fs.existsSync(П)) { console.log('🔴 подай файл'); process.exit(2); }
const данни = JSON.parse(fs.readFileSync(П, 'utf8'));

let сменени = 0;
function поправи(s) {
  let t = String(s);
  const преди = t;
  // „…" отваря българско, затова следващата права двойна кавичка е ЗАТВАРЯЩА
  t = t.replace(/„([^„"”]*)"/g, '„$1”');
  // останалите прави двойни: двойка → „…"
  t = t.replace(/"([^"]{1,120})"/g, '„$1”');
  // прав апостроф в думи като „не'" — просто пада
  t = t.replace(/'/g, '');
  // 🔴 09.09: НОВИ РЕДОВЕ В core. Гейтът вписва картата като JS низ в
  //   ЕДИНИЧНИ кавички — суров нов ред я чупи и той отказа да пише
  //   (правилно). Три карти от вълната носеха абзаци. Картата е кратък
  //   текст в мехур, а не статия: абзаците стават интервал.
  t = t.replace(/\s*\r?\n\s*/g, ' ').replace(/\s{2,}/g, ' ').trim();
  if (t !== преди) сменени++;
  return t;
}
const ПОЛЕТА = ['title', 'core', 'tip', 'follow', 't', 's', 'body'];
const обходи = о => {
  if (Array.isArray(о)) { о.forEach(обходи); return; }
  if (!о || typeof о !== 'object') return;
  for (const п of ПОЛЕТА) if (typeof о[п] === 'string') о[п] = поправи(о[п]);
};
обходи(данни);

const остатък = JSON.stringify(данни).match(/[^\\]"[^,:}\]]/g);
fs.writeFileSync(П, JSON.stringify(данни, null, 1));
console.log('поправени полета: ' + сменени + ' · ' + П);
if (остатък) console.log('⚠️ още подозрителни кавички: ' + остатък.length);
