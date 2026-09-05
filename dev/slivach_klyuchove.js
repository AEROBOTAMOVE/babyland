#!/usr/bin/env node
/* eslint-disable */
// ═══════════════════════════════════════════════════════════════════════════
// 🔑 СЛИВАЧ НА КЛЮЧОВЕ — от dev/nahodki/klyuchove_*.json в живия js/kb.js
// ═══════════════════════════════════════════════════════════════════════════
//
// ЗАЩО (05.09): досега ключовете влизаха по 40-50 наведнъж, на ръка, с отделно
// мерене всеки път. Това е бавно и скъпо. Тук влизат ХИЛЯДИ наведнъж, през
// един гейт и едно мерене.
//
// ═══ КАПАНИТЕ, КОИТО ГЕЙТЪТ ПАЗИ ═══
//   🪤 КЛЮЧ-КРАДЕЦ. Матчърът съди по обем: score = best + 0.34 × others.
//      Ключ, който вече е на друга карта, я обира. Пада.
//   🪤 ГОЛА ДУМА. Един корен вътре в чужда дума подменя отговори („ужил“ в
//      „заслУЖИЛа“ подмени хватките при задавяне с анафилаксия). Под 2 думи пада.
//   🪤 КЛЮЧ, КОЙТО ВОДИ ДРУГАДЕ. Всеки ключ се пуска през BL_MATCH в стаята на
//      своята карта. Ако върне ДРУГА карта — пада.
//   🪤 ЩЕТА ВЪРХУ СТАРОТО. Преди и след сливането се мери какво отговарят
//      първите четири ключа на ВСЯКА карта. Мръднало = 🔴.
//
// ПУСКАНЕ: node dev/slivach_klyuchove.js [--pishi] [--samo=r3]
// ПЪТ НАЗАД: js/kb.js.PREDI_KLYUCHOVE  ·  git checkout -- js/kb.js
// ═══════════════════════════════════════════════════════════════════════════
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const КОРЕН = path.resolve(__dirname, '..');
process.chdir(КОРЕН);
const АРГ = process.argv.slice(2);
const ПИШИ = АРГ.includes('--pishi');
const САМО = (АРГ.find(a => a.startsWith('--samo=')) || '').split('=')[1] || '';

const зареди = () => {
  delete require.cache[require.resolve(path.join(КОРЕН, 'dev/pyasachnik.js'))];
  return require(path.join(КОРЕН, 'dev/pyasachnik.js')).zaredi(null);
};
let W = зареди();
const питай = (WW, т, с) => {
  try {
    const р = WW.BL_MATCH(т, с);
    const з = Array.isArray(р) ? р[0] : (р && (р.entry || р.item || р));
    return з ? з.id : null;
  } catch (e) { return null; }
};

const КАРТИ = new Map(W.KB.entries.map(e => [e.id, e]));
const ЖИВИ = new Map();
for (const e of W.KB.entries) for (const k of (e.keys || [])) ЖИВИ.set(String(k).toLowerCase(), e.id);

// ── четене на стажа ──
const папка = 'dev/nahodki';
const файлове = fs.readdirSync(папка)
  .filter(f => /^klyuchove_.*\.json$/.test(f))
  .filter(f => !САМО || f.includes(САМО));
if (!файлове.length) { console.log('\n  няма файлове klyuchove_*.json\n'); process.exit(0); }

const предложени = [];
for (const f of файлове) {
  let a;
  try { a = JSON.parse(fs.readFileSync(path.join(папка, f), 'utf8')); }
  catch (e) { console.log('  🔴 ' + f + ' не се парсва: ' + e.message.slice(0, 60)); continue; }
  if (!Array.isArray(a)) { console.log('  🔴 ' + f + ' не е масив'); continue; }
  for (const x of a) if (x && x.id && Array.isArray(x.keys))
    for (const k of x.keys) предложени.push({ id: String(x.id), key: String(k).trim(), файл: f });
}

// ── ГЕЙТЪТ ──
const приети = [], отказани = { няма: 0, дубъл: 0, къс: 0, крадец: 0 };
const виждани = new Set();
for (const п of предложени) {
  const к = п.key.toLowerCase();
  if (!КАРТИ.has(п.id)) { отказани.няма++; continue; }
  if (ЖИВИ.has(к) || виждани.has(к)) { отказани.дубъл++; continue; }
  if (к.split(/\s+/).length < 2 || к.length < 7) { отказани.къс++; continue; }
  // води ли другаде ВЕЧЕ (тоест ще открадне чужд въпрос)
  const о = питай(W, п.key, КАРТИ.get(п.id).room);
  if (о && о !== п.id) { отказани.крадец++; continue; }
  виждани.add(к);
  приети.push(п);
}

console.log('');
console.log('  🔑 СЛИВАЧ НА КЛЮЧОВЕ' + (ПИШИ ? '' : '   [СУХО]'));
console.log('  стаж: ' + файлове.join(' '));
console.log('');
console.log('  предложени : ' + предложени.length);
console.log('  ✅ ПРИЕТИ  : ' + приети.length);
console.log('  ── отказани ──');
console.log('     няма такава карта : ' + отказани.няма);
console.log('     вече съществува   : ' + отказани.дубъл);
console.log('     под две думи      : ' + отказани.къс);
console.log('     води при ДРУГА    : ' + отказани.крадец);
const поКарта = new Map();
for (const п of приети) поКарта.set(п.id, (поКарта.get(п.id) || 0) + 1);
console.log('  карти, които растат: ' + поКарта.size);

if (!ПИШИ) { console.log('\n  СУХО. За писане: node dev/slivach_klyuchove.js --pishi\n'); process.exit(0); }
if (!приети.length) { console.log('\n  нищо за писане\n'); process.exit(0); }

// ── ПОЯС ПРЕДИ ──
const пояс = [];
for (const e of W.KB.entries) for (const k of (e.keys || []).slice(0, 4)) пояс.push([String(k), e.room, e.id]);
const преди = new Map();
for (const [т, с] of пояс) преди.set(т + '|' + с, питай(W, т, с));

// ── ПИСАНЕ ──
fs.copyFileSync('js/kb.js', 'js/kb.js.PREDI_KLYUCHOVE');
let s = fs.readFileSync('js/kb.js', 'utf8');
const поId = new Map();
for (const п of приети) { if (!поId.has(п.id)) поId.set(п.id, []); поId.get(п.id).push(п.key); }
let вписани = 0;
for (const [id, списък] of поId) {
  let и = s.indexOf("      id: '" + id + "',");
  if (и < 0) и = s.indexOf('      id: "' + id + '",');
  if (и < 0) { console.log('  🔴 котвата липсва: ' + id); continue; }
  const кi = s.indexOf('keys: [', и);
  if (кi < 0) { console.log('  🔴 keys липсва: ' + id); continue; }
  const край = s.indexOf(']', кi);
  s = s.slice(0, край) + списък.map(k => ", '" + k.replace(/'/g, "\'") + "'").join('') + s.slice(край);
  вписани += списък.length;
}
try { new vm.Script(s); } catch (e) {
  console.log('\n  🔴 kb.js НЕ СЕ ПАРСВА след писането — не записвам: ' + e.message.slice(0, 100) + '\n');
  process.exit(1);
}
fs.writeFileSync('js/kb.js', s);

// ── ПОЯС СЛЕД ──
W = зареди();
let мръднали = 0, влошени = 0;
const сп = [];
for (const [т, с, id] of пояс) {
  const стар = преди.get(т + '|' + с), нов = питай(W, т, с);
  if (стар === нов) continue;
  мръднали++;
  if (стар === id && нов !== id) { влошени++; if (сп.length < 15) сп.push('     🔴 „' + т.slice(0, 42) + '“  ' + стар + ' → ' + (нов || 'ТИШИНА')); }
}
console.log('');
console.log('  ── проверка след писането ──');
console.log('     ✅ kb.js се парсва');
console.log('     ✅ вписани ' + вписани + ' ключа на ' + поId.size + ' карти');
console.log('     ' + (влошени ? '🔴' : '✅') + ' пояс от ' + пояс.length + ' ключа: мръднали ' + мръднали + ' · ВЛОШЕНИ ' + влошени);
console.log(сп.join('\n'));
console.log('');
console.log(влошени ? '  🔴 ИМА ЩЕТА — виж дали си струва. Път назад: js/kb.js.PREDI_KLYUCHOVE' : '  ✅ слети без щета');
console.log('');
process.exit(влошени > 20 ? 1 : 0);
