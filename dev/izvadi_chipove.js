// Изважда оцелелите след скептика чипове и ги сверява с ЖИВАТА база.
// Чип към несъществуваща карта изчезва БЕЗШУМНО (helper.js:2399) — затова
// тук всяко id минава през KB, а не през доверие.
const fs = require('fs');
const ДНЕВНИК = process.argv[2];
if (!ДНЕВНИК || !fs.existsSync(ДНЕВНИК)) { console.log('🔴 подай journal.jsonl'); process.exit(2); }

const редове = [];
for (const ред of fs.readFileSync(ДНЕВНИК, 'utf8').split('\n')) {
  if (!ред.trim()) continue;
  let o; try { o = JSON.parse(ред); } catch (e) { continue; }
  if (o.type !== 'result') continue;
  const r = (typeof o.result === 'string') ? (() => { try { return JSON.parse(o.result); } catch (e) { return null; } })() : o.result;
  if (r && Array.isArray(r.verdicts)) редове.push(...r.verdicts);
}
console.log('присъди от скептиците: ' + редове.length);

const { zaredi } = require('./pyasachnik.js');
const W = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } });
const KB = W.BL_KB || W.KB;
const карти = KB.entries || [];
const има = new Map(карти.map(e => [e.id, e]));
const безЧип = new Set(карти.filter(e => !((e.chips || []).length)).map(e => e.id));

const набор = {}; const откази = [];
let махнатиНесъществуващи = 0, махнатиКъмСебеСи = 0, махнатиНеЧакани = 0;
for (const в of редове) {
  const цел = String(в.karta || '');
  if (!има.has(цел)) { откази.push('няма карта ' + цел); continue; }
  if (!безЧип.has(цел)) { махнатиНеЧакани++; continue; }   // вече си има чипове — не пипаме
  const чисти = [];
  for (const c of (в.chips_ok || [])) {
    const id = String(c).trim();
    if (id === цел) { махнатиКъмСебеСи++; continue; }
    if (!има.has(id)) { махнатиНесъществуващи++; continue; }
    if (чисти.indexOf(id) < 0) чисти.push(id);
  }
  if (!чисти.length) continue;
  // 🪞 един и същ въпрос е обходен от двама агенти — сливаме, без повторения
  набор[цел] = [...new Set((набор[цел] || []).concat(чисти))].slice(0, 4);
}

const общо = Object.values(набор).reduce((a, x) => a + x.length, 0);
console.log('');
console.log('🔗 ОЦЕЛЕЛИ ЧИПОВЕ');
console.log('   карти, които ще получат: ' + Object.keys(набор).length + ' от ' + безЧип.size);
console.log('   чипове общо: ' + общо + '  ·  средно ' + (общо / Object.keys(набор).length).toFixed(2));
console.log('   ✂️ махнати тук: несъществуващи ' + махнатиНесъществуващи
  + ' · към себе си ' + махнатиКъмСебеСи + ' · карти, които вече имат чипове ' + махнатиНеЧакани);
if (откази.length) { console.log('   ⚠️ ' + откази.length + ' присъди за непознати карти'); откази.slice(0, 5).forEach(x => console.log('      ' + x)); }

// колко от 79-те остават без нищо
const оставатБез = [...безЧип].filter(id => !набор[id]);
console.log('   🕳️ остават без чип: ' + оставатБез.length + (оставатБез.length ? ' — ' + оставатБез.join(', ') : ''));

fs.mkdirSync('dev/nahodki', { recursive: true });
fs.writeFileSync('dev/nahodki/chipove.json', JSON.stringify(набор, null, 1));
console.log('');
console.log('   → dev/nahodki/chipove.json');
console.log('');
Object.entries(набор).slice(0, 18).forEach(([id, c]) => {
  const e = има.get(id);
  console.log('   ' + id.padEnd(36) + '→ ' + c.map(x => (има.get(x).title || има.get(x).t || x)).join('  ·  ').slice(0, 78));
});
