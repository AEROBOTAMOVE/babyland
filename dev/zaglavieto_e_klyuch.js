// 🎯 ЗАГЛАВИЕТО НА КАРТАТА Е НАЙ-ОЧЕВИДНИЯТ ВЪПРОС ЗА НЕЯ
//
// dev/dostizhimost.js мери дали картата се намира по СОБСТВЕНОТО си
// заглавие. Новите карти почти винаги падат: авторът пише ключове от
// въпросите на майката и забравя най-простия — как се казва самата карта.
//
// Тук се добавя заглавието (и вариант без начална главна буква) като ключ
// САМО на картите, които днес не се намират по него, и САМО ако ключът е
// свободен. Без --pishi нищо не се пише.
const fs = require('fs');
const ПИШИ = process.argv.includes('--pishi');
const { zaredi } = require('./pyasachnik.js');
const W = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } });
const KB = W.BL_KB || W.KB;
const карти = KB.entries || [];

const заети = new Map();
for (const e of карти) for (const k of (e.keys || [])) заети.set(String(k).toLowerCase(), e.id);

const набор = {};
let непадащи = 0, заетоЗаглавие = 0;
for (const e of карти) {
  const t = String(e.title || e.t || '').trim();
  if (t.length < 6) continue;
  const намерена = W.BL_MATCH(t, e.room);
  if (намерена && намерена.id === e.id) { непадащи++; continue; }   // вече се намира
  // ✂️ Заглавието е ЗА ЧЕТЕНЕ, ключът е ЗА ПИСАНЕ. Кавичките, въпросителната
  //   и краят с многоточие не се срещат в това, което майка набира — а
  //   ключът трябва да е НЕПРЕКЪСНАТА част от изречението ѝ.
  const чисто = s => String(s).replace(/[„“”"'']/g, '').replace(/[?!.…]+\s*$/, '').replace(/\s+/g, ' ').trim();
  const кандидати = [чисто(t).toLowerCase()];
  // и без началната част преди двоеточие/тире — „Гърчът: кое НЕ се прави" → „кое не се прави"
  const m = /^[^:—-]{3,}[:—-]\s*(.{6,})$/.exec(t);
  if (m) кандидати.push(чисто(m[1]).toLowerCase());
  const свободни = кандидати.filter(k => k.length > 5 && !заети.has(k) && !/["']/.test(k));
  if (!свободни.length) { заетоЗаглавие++; continue; }
  свободни.forEach(k => заети.set(k, e.id));
  набор[e.id] = свободни;
}
const общо = Object.values(набор).reduce((a, x) => a + x.length, 0);
console.log('');
console.log('🎯 ЗАГЛАВИЕТО КАТО КЛЮЧ');
console.log('   карти общо: ' + карти.length);
console.log('   вече се намират по заглавие: ' + непадащи);
console.log('   заглавието им е ЗАЕТО от друга карта: ' + заетоЗаглавие + '  (не се пипат — това е спор, не пропуск)');
console.log('   ще получат ключ: ' + Object.keys(набор).length + ' карти · ' + общо + ' ключа');
console.log('');
Object.entries(набор).slice(0, 25).forEach(([id, k]) => console.log('   ' + id.padEnd(38) + k.join(' | ').slice(0, 70)));
if (Object.keys(набор).length > 25) console.log('   … и още ' + (Object.keys(набор).length - 25));

fs.mkdirSync('dev/nahodki', { recursive: true });
fs.writeFileSync('dev/nahodki/klyuchove_zaglavia.json', JSON.stringify(набор, null, 1));
console.log('');
console.log('   → dev/nahodki/klyuchove_zaglavia.json');
console.log('   Прилагане с мярка: node dev/prilozhi_klyuchove.js dev/nahodki/klyuchove_zaglavia.json [--pishi]');
if (!ПИШИ) console.log('   (тук --pishi само подсеща — самото писане е през уреда горе)');
