#!/usr/bin/env node
/* eslint-disable */
// ═══════════════════════════════════════════════════════════════════════════
// 🔗 ВРЪЗВАЧ — картите без статия и без чипове получават своите
// ═══════════════════════════════════════════════════════════════════════════
//
// ЗАЩО (05.09.2026): след сливането на 232 нови карти останаха 127 карти без
// нито една статия в `lib` и 96 без чипове. Това не е козметика:
//   · без статия картата няма къде да прати майката за повече
//   · без чипове разговорът свършва в задънена улица — няма следваща стъпка
//
// КАК СЕ ИЗБИРА СТАТИЯ: по СЪВПАДЕНИЕ на смислови думи между картата
// (заглавие + ключове) и статията (заглавие + резюме + етикети), а не по ред
// в списъка. Изисква се минимален резултат — по-добре карта без статия,
// отколкото карта, вързана за чужда тема.
//
// 🔴 ЗАЩО МИНИМАЛНИЯТ РЕЗУЛТАТ Е ЗАДЪЛЖИТЕЛЕН: в тази сесия вече вързах
//    zd-sinuzit за статия за МАГАРЕШКА КАШЛИЦА, защото и двете съдържаха
//    думата „кашлица". Хванах го само с четене на заглавието. Затова тук
//    решава ПРИПОКРИВАНЕ на няколко думи, не една обща дума.
//
// КАК СЕ ИЗБИРАТ ЧИПОВЕ: карти от СЪЩАТА стая с най-голямо припокриване на
// смислови думи, но не самата карта и не вече посочена.
//
// 🩹 ПРОВЕРКА СЛЕД ТОВА: dev/karta_statiya.js мери дали връзката е уместна.
//    Пусни го веднага след този уред.
//
// ⚠️ ПИШЕ в js/kb.js САМО с --pishi. Без него е сух пробег.
// ПЪТ НАЗАД: git checkout -- js/kb.js
// ПУСКАНЕ: node dev/vrazvach.js [--pishi] [--samo=statii|chipove]
// ═══════════════════════════════════════════════════════════════════════════
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const КОРЕН = path.resolve(__dirname, '..');
process.chdir(КОРЕН);
const ПИШИ = process.argv.includes('--pishi');
const САМО = (process.argv.find(a => a.startsWith('--samo=')) || '').split('=')[1] || '';
const W = require(path.join(КОРЕН, 'dev/pyasachnik.js')).zaredi(null);

// думи под 4 букви не носят тема („как", „ли", „на"); над 4 вече различават
const СТОП = new Set(['това', 'този', 'тази', 'тези', 'което', 'която', 'които', 'когато',
  'какво', 'кога', 'къде', 'защо', 'дали', 'може', 'мога', 'трябва', 'бебето', 'бебе',
  'детето', 'дете', 'много', 'малко', 'само', 'вече', 'още', 'нали', 'има', 'няма',
  'съм', 'ако', 'като', 'през', 'след', 'преди', 'него', 'нея', 'него', 'моето', 'моят']);
const думи = т => {
  const н = new Set();
  for (const w of String(т || '').toLowerCase().split(/[^а-яa-z0-9]+/)) {
    if (w.length < 4 || СТОП.has(w)) continue;
    н.add(w.length > 6 ? w.slice(0, 6) : w);   // груб корен: първите 6 букви
  }
  return н;
};
const припокриване = (a, b) => { let n = 0; for (const w of a) if (b.has(w)) n++; return n; };

// ── статиите ──
const индекс = JSON.parse(fs.readFileSync(path.join('lib', 'index.json'), 'utf8'));
const статии = (Array.isArray(индекс.items) ? индекс.items : Object.values(индекс.items || {}))
  .filter(x => x && x.id && x.t)
  .map(x => ({ id: x.id, room: x.r, думи: думи([x.t, x.s, x.k, x.c].join(' ')) }));
if (статии.length < 500) { console.error('\n  🔴 СЛЯП УРЕД: само ' + статии.length + ' статии\n'); process.exit(2); }

const карти = W.KB.entries.map(e => ({
  e: e,
  думи: думи([e.title, (e.keys || []).join(' ')].join(' ')),
}));
const поId = new Map(карти.map(x => [x.e.id, x]));

console.log('');
console.log('  🔗 ВРЪЗВАЧ · ' + карти.length + ' карти · ' + статии.length + ' статии');

// ── 1 · СТАТИИ ──
const ПРАГ_СТАТИЯ = 3;   // поне 3 общи смислови думи — една обща дума лъже
const статияЗа = [];
if (САМО !== 'chipove') {
  for (const к of карти) {
    const л = Array.isArray(к.e.lib) ? к.e.lib : (к.e.lib ? [к.e.lib] : []);
    if (л.length) continue;
    let най = null, найР = 0;
    for (const с of статии) {
      let р = припокриване(к.думи, с.думи);
      if (с.room === к.e.room) р += 1;          // своята стая е предимство, не присъда
      if (р > найР) { найР = р; най = с; }
    }
    if (най && найР >= ПРАГ_СТАТИЯ) статияЗа.push({ id: к.e.id, title: к.e.title, статия: най.id, р: найР });
    else статияЗа.push({ id: к.e.id, title: к.e.title, статия: null, р: найР });
  }
  const вързани = статияЗа.filter(x => x.статия);
  console.log('');
  console.log('  ── СТАТИИ ──');
  console.log('     карти без статия : ' + статияЗа.length);
  console.log('     ✅ намерена статия: ' + вързани.length);
  console.log('     ⚪ под прага (' + ПРАГ_СТАТИЯ + ')  : ' + (статияЗа.length - вързани.length) + '  (остават без статия — чужда тема е по-лошо от липса)');
  for (const x of вързани.slice(0, 8)) console.log('        ' + x.id.padEnd(26) + '→ ' + x.статия + '  (' + x.р + ' общи думи)');
  if (вързани.length > 8) console.log('        … и още ' + (вързани.length - 8));
}

// ── 2 · ЧИПОВЕ ──
const ПРАГ_ЧИП = 3;   // 2 даваше съседи като „желязо на капки → пред екран" — обща дума не е обща тема
const чиповеЗа = [];
if (САМО !== 'statii') {
  for (const к of карти) {
    if (Array.isArray(к.e.chips) && к.e.chips.length) continue;
    const кандидати = [];
    for (const д of карти) {
      if (д.e.id === к.e.id) continue;
      if (д.e.room !== к.e.room) continue;
      const р = припокриване(к.думи, д.думи);
      if (р >= ПРАГ_ЧИП) кандидати.push({ id: д.e.id, р: р });
    }
    кандидати.sort((a, b) => b.р - a.р);
    const избрани = кандидати.slice(0, 3).map(x => x.id);
    чиповеЗа.push({ id: к.e.id, title: к.e.title, чипове: избрани });
  }
  const сЧипове = чиповеЗа.filter(x => x.чипове.length);
  console.log('');
  console.log('  ── ЧИПОВЕ ──');
  console.log('     карти без чипове : ' + чиповeЗа_дължина());
  console.log('     ✅ намерени съседи: ' + сЧипове.length);
  console.log('     ⚪ без съсед       : ' + (чиповеЗа.length - сЧипове.length));
  for (const x of сЧипове.slice(0, 8)) console.log('        ' + x.id.padEnd(26) + '→ ' + x.чипове.join(', '));
  if (сЧипове.length > 8) console.log('        … и още ' + (сЧипове.length - 8));
}
function чиповeЗа_дължина() { return чиповеЗа.length; }

// ── писане ──
if (!ПИШИ) { console.log(''); console.log('  \x1b[33mСУХО. За писане: node dev/vrazvach.js --pishi\x1b[0m'); console.log(''); process.exit(0); }

let s = fs.readFileSync('js/kb.js', 'utf8');
let сложениС = 0, сложениЧ = 0;
for (const x of статияЗа) {
  if (!x.статия) continue;
  const и = s.indexOf("      id: '" + x.id + "',");
  if (и < 0) { console.log('     🔴 котвата липсва ' + x.id); continue; }
  // вмъква се СЛЕД реда с id — точно както изглеждат заварените карти
  const край = s.indexOf('\n', и);
  s = s.slice(0, край + 1) + "      lib: '" + x.статия + "',\r\n" + s.slice(край + 1);
  сложениС++;
}
for (const x of чиповеЗа) {
  if (!x.чипове.length) continue;
  const и = s.indexOf("      id: '" + x.id + "',");
  if (и < 0) continue;
  // намира края на този запис (реда с „    }," на същото ниво)
  const кр = s.indexOf('\n    },', и);
  if (кр < 0) { console.log('     🔴 краят на записа не се намира ' + x.id); continue; }
  const преди = s.slice(0, кр);
  const посл = преди.lastIndexOf('\n');
  const редът = s.slice(посл, кр);
  const запетая = /,\s*$/.test(редът) ? '' : ',';
  s = s.slice(0, кр) + запетая + "\r\n      chips: ['" + x.чипове.join("', '") + "']" + s.slice(кр);
  сложениЧ++;
}
try { new vm.Script(s); } catch (e) { console.log('\n  🔴 ЛОШ СИНТАКСИС: ' + e.message.slice(0, 160) + '\n'); process.exit(2); }
fs.writeFileSync('js/kb.js', s);
console.log('');
console.log('  \x1b[32m✅ записани: ' + сложениС + ' статии · ' + сложениЧ + ' комплекта чипове\x1b[0m');
console.log('  Сега: node dev/karta_statiya.js  (проверява уместни ли са връзките)');
console.log('');
