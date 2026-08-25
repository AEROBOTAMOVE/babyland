// ═══════════════════════════════════════════════════════════
// 🛁 СЛИВАНЕ НА ТРИТЕ КАРТИ ЗА КЪПАНЕ — измерено, не на доверие
//
// ЗАЩО: три статии в baby-1.json обясняваха една и съща баня. Рязането на
// нокти беше и в ТРИТЕ, пъпчето — в ТРИТЕ, червените флагове — в ТРИТЕ.
// Майката, която прочете и трите, получава един и същ съвет три пъти.
//
// КАКВО ПРАВИ: слива lib-2b64d4ce и lib-85591fe7 в lib-820b79e1, маха ги от
// index.json и от baby-1.json, и СРАВНЯВА фактите преди и след — числа,
// институции, спешни думи, точки в списък.
//
// ПУСКАНЕ:  node dev/sliv_banya.js --mери     (само мери, нищо не пипа)
//           node dev/sliv_banya.js --prilozhi (записва)
// ПЪТ НАЗАД: cp lib/baby-1.json.PREDI_KUPANE_20260821 lib/baby-1.json
//            cp lib/index.json.PREDI_KUPANE_20260821 lib/index.json
// ═══════════════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');
process.chdir(path.resolve(__dirname, '..'));

const ОСТАВА = 'lib-820b79e1';
const МАХАТ = ['lib-2b64d4ce', 'lib-85591fe7'];
const ПРИЛОЖИ = process.argv.includes('--prilozhi');
const НОВОТЯЛО = process.argv[process.argv.indexOf('--tyalo') + 1];

const ЧИСЛА = /\d+(?:[.,]\d+)?\s*(?:°|градус[а-я]*|месец[а-я]*|седмиц[а-я]*|дни|дена|ден|годин[а-я]*|час[а-я]*|минут[а-я]*|мл|кг|пъти|%)/gi;
const СПЕШНО = /(веднага|незабавно|не чакай|същия ден|спешно|112|тревожн|лекар|педиатъ)/gi;
const ТОЧКИ = /^\s*[-•*]\s+/gm;

function мярка(t) {
  const ч = String(t);
  return {
    знаци: ч.length,
    числа: (ч.match(ЧИСЛА) || []).length,
    спешно: (ч.match(СПЕШНО) || []).length,
    точки: (ч.match(ТОЧКИ) || []).length,
    заглавия: (ч.match(/^## /gm) || []).length
  };
}

const idx = JSON.parse(fs.readFileSync('lib/index.json', 'utf8'));
const тела = JSON.parse(fs.readFileSync('lib/baby-1.json', 'utf8'));

const трите = [ОСТАВА, ...МАХАТ];
console.log('🛁 СЛИВАНЕ НА КАРТИТЕ ЗА КЪПАНЕ\n');
console.log('  ПРЕГЛЕДАНИ статии в index:', idx.items.length);
console.log('  ПРЕГЛЕДАНИ тела в baby-1.json:', Object.keys(тела).length, '\n');

let преди = { знаци: 0, числа: 0, спешно: 0, точки: 0, заглавия: 0 };
for (const id of трите) {
  const m = мярка(тела[id] || '');
  console.log('  ПРЕДИ ' + id + ':', JSON.stringify(m));
  for (const k in преди) преди[k] += m[k];
}

if (!НОВОТЯЛО) { console.log('\n  (няма --tyalo — само мярка)'); process.exit(0); }
const ново = fs.readFileSync(НОВОТЯЛО, 'utf8').replace(/\r\n/g, '\n').trim();
const след = мярка(ново);
console.log('\n  СБОР ПРЕДИ:', JSON.stringify(преди));
console.log('  СЛЯТА    :', JSON.stringify(след));

// ── кои факти-изречения от изтритите НЕ се намират в новото ──
const норм = s => s.toLowerCase().replace(/[^а-яa-z0-9 ]+/gi, ' ').replace(/\s+/g, ' ').trim();
const думиНово = new Set(норм(ново).split(' ').filter(w => w.length > 4).map(w => w.slice(0, 6)));
const липсват = [];
for (const id of трите) {
  for (const изр of String(тела[id] || '').split(/\n|(?<=[.!?])\s+/)) {
    const t = изр.trim(); if (t.length < 45) continue;
    const w = норм(t).split(' ').filter(x => x.length > 4).map(x => x.slice(0, 6));
    if (!w.length) continue;
    const пок = w.filter(x => думиНово.has(x)).length / w.length;
    if (пок < 0.75) липсват.push([(пок * 100).toFixed(0) + '%', id, t.slice(0, 140)]);
  }
}
console.log('\n  🔍 ИЗРЕЧЕНИЯ (над 45 знака) с под 75% покритие в слятата:', липсват.length);
липсват.forEach(x => console.log('    ' + x[0] + ' [' + x[1] + '] ' + x[2]));

if (!ПРИЛОЖИ) { console.log('\n  ⏸️ само мярка — нищо не е записано. Пусни с --prilozhi'); process.exit(0); }

// ── прилагане ──
// 🪤 ФОРМАТЪТ НЕ Е JSON.stringify(x,null,1). Телата се пишат ръчно, с CRLF —
//    проверено на живо: точно този низ възпроизвежда файла байт по байт.
//    Пишеш ли го иначе, git diff показва 92 сменени реда вместо 3.
const пишиТела = o => '{\r\n' + Object.keys(o).map(k => JSON.stringify(k) + ': ' + JSON.stringify(o[k])).join(',\r\n') + '\r\n}';

тела[ОСТАВА] = ново;
for (const id of МАХАТ) delete тела[id];
fs.writeFileSync('lib/baby-1.json', пишиТела(тела), 'utf8');

const остава = idx.items.find(i => i.id === ОСТАВА);
const махнати = МАХАТ.map(id => idx.items.find(i => i.id === id));
остава.t = 'Банята на новороденото: къпане, кожа, нокти и пъпче';
остава.s = 'Новороденото не се нуждае от баня всеки ден — а най-важното при банята дори не е сапунът.';
// ключовете на трите се сливат, за да не изчезне нито един път за търсене
остава.k = [...new Set([остава.k, ...махнати.map(m => m.k)].join(' ').split(/\s+/))].join(' ').trim();
idx.items = idx.items.filter(i => !МАХАТ.includes(i.id));
idx.n = idx.items.length;
const стаи = {};
for (const i of idx.items) стаи[i.r] = (стаи[i.r] || 0) + 1;
for (const r in idx.rooms) if (стаи[r] !== undefined) idx.rooms[r] = стаи[r];
fs.writeFileSync('lib/index.json', JSON.stringify(idx, null, 1), 'utf8');

console.log('\n  ✅ ЗАПИСАНО. статии:', idx.n, '| тела в baby-1.json:', Object.keys(тела).length);
console.log('  стаи:', JSON.stringify(idx.rooms));
