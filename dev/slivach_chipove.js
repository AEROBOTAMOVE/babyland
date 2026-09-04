#!/usr/bin/env node
/* eslint-disable */
// ═══════════════════════════════════════════════════════════════════════════
// 🔗 СЛИВАЧ НА ЧИПОВЕ — 94-те карти без изход
// ═══════════════════════════════════════════════════════════════════════════
//
// ЗАЩО (05.09): 94 от 699 карти нямаха нито един чип. Майката прочита
// отговора и разговорът свършва в стена. Агент предложи 278 чипа за всичките
// 94 и сам изхвърли 26 взаимни връзки, преди да предаде.
//
// ═══ ТРИТЕ КАПАНА, ЗАРАДИ КОИТО ТОЗИ ФАЙЛ НЕ Е ПРОСТО ПРИСВОЯВАНЕ ═══
//   🪤 СЧУПЕН ЧИП НЕ ГЪРМИ, ТОЙ ИЗЧЕЗВА. `setChips` (js/helper.js:2399)
//      резолвва низа през `KB.entries.find(e => e.id === item)`; при липса
//      `label` е undefined и функцията просто `return`-ва. Тоест чип към
//      несъществуваща карта не се вижда никъде — нито грешка, нито празно
//      място. Затова всеки чип се сверява ТУК, преди да влезе.
//   🪤 ГЛАВНИЯТ ПЪТ ПОКАЗВА САМО ПЪРВИЯ ЧИП (`entry.chips.slice(0, 1)`,
//      helper.js:3104). Значи взаимна връзка на позиция 0 е пинг-понг:
//      майката тапва, отива на Б, вижда чип обратно към А. Проверява се.
//   🪤 ЧИП КЪМ САМАТА СЕБЕ СИ изглежда безобиден и е задънена улица.
//
// ПУСКАНЕ:  node dev/slivach_chipove.js            — сухо
//           node dev/slivach_chipove.js --pishi    — пише
// ПЪТ НАЗАД: js/kb.js.PREDI_CHIPOVE   ·   или git checkout -- js/kb.js
// ═══════════════════════════════════════════════════════════════════════════
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const КОРЕН = path.resolve(__dirname, '..');
process.chdir(КОРЕН);
const ПИШИ = process.argv.includes('--pishi');

const W = require(path.join(КОРЕН, 'dev/pyasachnik.js')).zaredi(null);
const КАРТИ = new Map(W.KB.entries.map(e => [e.id, e]));

const вход = JSON.parse(fs.readFileSync('dev/nahodki/chipove.json', 'utf8'));
const предложени = вход.predlozheni || вход || {};

console.log('');
console.log('  🔗 СЛИВАЧ НА ЧИПОВЕ' + (ПИШИ ? '' : '   [СУХО]'));
console.log('  предложения за ' + Object.keys(предложени).length + ' карти');
console.log('');

const приети = {};
const откази = [];
for (const [id, чипове] of Object.entries(предложени)) {
  const карта = КАРТИ.get(id);
  if (!карта) { откази.push([id, 'няма такава карта']); continue; }
  if (карта.chips && карта.chips.length) { откази.push([id, 'вече има чипове: ' + карта.chips.join(', ')]); continue; }
  if (!Array.isArray(чипове) || !чипове.length) { откази.push([id, 'празен списък']); continue; }

  const чисти = [];
  for (const ч of чипове) {
    if (ч === id) { откази.push([id, 'чип към САМАТА СЕБЕ СИ: ' + ч]); continue; }
    const цел = КАРТИ.get(ч);
    if (!цел) { откази.push([id, 'чип към НЕСЪЩЕСТВУВАЩА карта: ' + ч + ' (не гърми — изчезва безшумно)']); continue; }
    if (чисти.includes(ч)) continue;
    чисти.push(ч);
  }
  if (!чисти.length) { откази.push([id, 'нито един чип не оцеля']); continue; }
  if (чисти.length > 3) чисти.length = 3;
  приети[id] = чисти;
}

// ── примките: целта сочи ли обратно към мен, и то на позиция 0 ──
const примки = [];
for (const [id, чипове] of Object.entries(приети)) {
  чипове.forEach((ч, i) => {
    const цел = КАРТИ.get(ч);
    const наЦелта = (приети[ч] || (цел && цел.chips) || []);
    const j = наЦелта.indexOf(id);
    if (j >= 0) примки.push({ a: id, b: ч, поз: i + '↔' + j, тежка: i === 0 && j === 0 });
  });
}
if (примки.length) {
  console.log('  🔁 ВЗАИМНИ ВРЪЗКИ: ' + примки.length + ' (тежки, и двете на позиция 0: ' + примки.filter(p => p.тежка).length + ')');
  for (const p of примки.slice(0, 12)) console.log('     ' + (p.тежка ? '🔴' : '🟠') + ' ' + p.a + ' ↔ ' + p.b + '  [' + p.поз + ']');
  // тежките се режат: махаме връзката от по-късната карта
  let рязани = 0;
  for (const p of примки.filter(x => x.тежка)) {
    if (приети[p.b] && приети[p.b][0] === p.a) { приети[p.b] = приети[p.b].slice(1); рязани++; }
  }
  console.log('     отрязани тежки: ' + рязани);
  console.log('');
}

const общо = Object.values(приети).reduce((a, b) => a + b.length, 0);
console.log('  ── ПРИЕТИ: ' + Object.keys(приети).length + ' карти · ' + общо + ' чипа ──');
if (откази.length) {
  console.log('  ── ОТКАЗАНИ: ' + откази.length + ' ──');
  for (const [id, з] of откази.slice(0, 20)) console.log('     🔴 ' + id.padEnd(26) + з);
}
console.log('');

if (!ПИШИ) { console.log('  СУХО. За писане: node dev/slivach_chipove.js --pishi'); console.log(''); process.exit(0); }

// ═══ ПИСАНЕ ═══
fs.copyFileSync('js/kb.js', 'js/kb.js.PREDI_CHIPOVE');
let kb = fs.readFileSync('js/kb.js', 'utf8');
const НР = kb.indexOf('\r\n') >= 0 ? '\r\n' : '\n';
const немВмъкнати = [];
for (const [id, чипове] of Object.entries(приети)) {
  const котви = [`id: '${id}',`, `id: "${id}",`];
  const котва = котви.find(k => kb.split(k).length === 2);
  if (!котва) { немВмъкнати.push(id); continue; }
  const редът = ` chips: [${чипове.map(c => `'${c}'`).join(', ')}],`;
  kb = kb.replace(котва, котва + редът);
}
try { new vm.Script(kb); } catch (e) { console.log('🔴 kb.js НЯМАШЕ да се парсва: ' + e.message.slice(0, 100)); process.exit(2); }
fs.writeFileSync('js/kb.js', kb);

// ═══ ПРОВЕРКА ═══
delete require.cache[require.resolve(path.join(КОРЕН, 'dev/pyasachnik.js'))];
const W2 = require(path.join(КОРЕН, 'dev/pyasachnik.js')).zaredi(null);
const К2 = new Map(W2.KB.entries.map(e => [e.id, e]));
let паднали = 0;
const пров = (име, усл, дет) => { console.log('     ' + (усл ? '✅' : '🔴') + ' ' + име + (дет ? '  ' + дет : '')); if (!усл) паднали++; };
console.log('  ── проверка след писането ──');
пров('картите са пак ' + W.KB.entries.length, W2.KB.entries.length === W.KB.entries.length, String(W2.KB.entries.length));
пров('всички са вмъкнати', немВмъкнати.length === 0, немВмъкнати.join(', '));
const безЧип = W2.KB.entries.filter(e => !e.chips || !e.chips.length).length;
пров('карти без чип: беше 94', безЧип === 94 - Object.keys(приети).length, 'сега ' + безЧип);
let счупени = 0;
for (const e of W2.KB.entries) for (const ч of (e.chips || [])) if (!К2.has(ч)) { счупени++; console.log('        🔴 ' + e.id + ' → ' + ч); }
пров('нула чипа към несъществуваща карта (иначе изчезват безшумно)', счупени === 0, счупени ? счупени + ' счупени' : '');
let къмСебе = 0;
for (const e of W2.KB.entries) if ((e.chips || []).includes(e.id)) къмСебе++;
пров('нула чипа към самата себе си', къмСебе === 0);
console.log('');
process.exit(паднали ? 2 : 0);
