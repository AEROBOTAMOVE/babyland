#!/usr/bin/env node
/* eslint-disable */
// ═══════════════════════════════════════════════════════════════════════════
// 🔪 ХИРУРГ НА ЗАГЛАВИЯТА — картата да се намира по СОБСТВЕНАТА си тема
// ═══════════════════════════════════════════════════════════════════════════
//
// ЗАЩО (05.09.2026): след сливането на 232 нови карти достижимостта скочи от
// 13 на 172 карти (15%), които не се намират по собственото си заглавие.
// Причината почти винаги е една и съща и е стара позната в този проект:
// СЪДЪРЖАНИЕТО ГО ИМА, ДУМИТЕ ГИ НЯМА. Писачът дава ключове за въпроса, но не
// и за темата — а майката понякога пише точно темата.
//
// КАКВО ПРАВИ: за всяка недостижима карта вади кандидат-ключове от заглавието:
//   1. цялото заглавие, с малки букви, без препинание
//   2. частта СЛЕД двоеточие или тире (там обикновено е същината)
//   3. частта ПРЕДИ двоеточие или тире
// Взима само тези, които не са заети от друга карта и не са по-къси от 3 думи
// (по-къс ключ е твърде общ и краде).
//
// 🩹 ПОЯС ЗА ЩЕТИТЕ: преди и след се пита ПЪРВИЯТ ключ на ВСЯКА карта — 1145
// въпроса с известен верен отговор. Ако след операцията дори един въпрос смени
// отговора си в лоша посока, се показва поименно. Печалба без измерена цена не
// се приема.
//
// ⚠️ ПИШЕ в js/kb.js САМО с --pishi. Без него е сух пробег.
// ПЪТ НАЗАД: git checkout -- js/kb.js
// ПУСКАНЕ: node dev/hirurg_zaglavia.js [--pishi]
// ═══════════════════════════════════════════════════════════════════════════
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const КОРЕН = path.resolve(__dirname, '..');
process.chdir(КОРЕН);
const ПИШИ = process.argv.includes('--pishi');
const { zaredi } = require(path.join(КОРЕН, 'dev/pyasachnik.js'));

const питай = (W, т, с) => {
  try {
    const р = W.BL_MATCH(т, с);
    const з = Array.isArray(р) ? р[0] : (р && (р.entry || р.item || р));
    return з ? з.id : null;
  } catch (e) { return null; }
};

// ── поясът: първият ключ на всяка карта, с известен верен отговор ──
function пояс(W) {
  const о = new Map();
  for (const e of W.KB.entries) {
    const k = (e.keys || [])[0];
    if (!k) continue;
    о.set(e.id, { q: String(k), room: e.room, взе: питай(W, String(k), e.room) });
  }
  return о;
}

const W0 = zaredi(null);
const ПРЕДИ = пояс(W0);
const ЗАЕТИ = new Map();
for (const e of W0.KB.entries) for (const k of (e.keys || [])) ЗАЕТИ.set(String(k).toLowerCase(), e.id);

const чисто = s => String(s || '')
  .toLowerCase()
  .replace(/[„“”"'’‘]/g, '')
  .replace(/[—–\-]/g, ' ')
  .replace(/[.,:;!?()]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

// 🎯 05.09 — ХИРУРГЪТ И ПАЗАЧЪТ МЕРЕХА РАЗЛИЧНИ НЕЩА.
//   dev/dostizhimost.js пита само частта ПРЕДИ тирето („Целевите помощи"),
//   защото майка пише темата, не редакторското заглавие. Хирургът питаше
//   ЦЯЛОТО заглавие — то се намира, значи картата не влизаше в „болни" и
//   16 карти оставаха непипнати, докато пазачът упорито ги обявяваше.
//   Уред, който мери друго от пазача, който трябва да успокои, е безполезен.
const катоВъпрос = т => String(т || '')
  .replace(/[„“"”]/g, ' ')
  .replace(/s*[—–-]s*.*$/, '')
  .replace(/[?!.]+$/, '')
  .replace(/s+/g, ' ').trim();

// ── кои карти не се намират по темата си ──
const болни = [];
for (const e of W0.KB.entries) {
  const о = питай(W0, e.title, e.room);
  if (о !== e.id) болни.push({ e: e, взе: о });
}
console.log('');
console.log('  🔪 ХИРУРГ НА ЗАГЛАВИЯТА · ' + болни.length + ' от ' + W0.KB.entries.length + ' карти не се намират по темата си');

// ── кандидатите ──
const операция = [];
for (const { e } of болни) {
  const цели = [];
  const пълно = чисто(e.title);
  цели.push(пълно);
  const t = String(e.title);
  const раз = t.split(/[:—–]/);
  if (раз.length > 1) {
    цели.push(чисто(раз.slice(1).join(' ')));
    цели.push(чисто(раз[0]));
  }
  const годни = [];
  for (const ц of цели) {
    if (!ц) continue;
    const думи = ц.split(' ').filter(Boolean);
    // 🔎 05.09, втора вълна: 16 карти останаха недостижими САМО защото
    //   заглавието им е късо („Целевите помощи", „Асистентската подкрепа",
    //   „Устойчивите бактерии"). Две думи с 14+ знака НЕ са общи — те са
    //   термин. Прагът пада на 2 думи, но иска дължина, за да не влезе
    //   нещо като „още малко" (9 знака), което би крало навсякъде.
    if (думи.length < 2) continue;
    if (думи.length === 2 && ц.length < 14) continue;
    if (думи.length < 3 && /^(още|как|защо|кога|къде|коя|кой|кое|това|тази)/.test(ц)) continue;
    if (думи.length > 9) continue;   // по-дълъг никога не се улучва като подниз
    if (ЗАЕТИ.has(ц)) continue;
    if (годни.indexOf(ц) > -1) continue;
    годни.push(ц);
  }
  if (годни.length) {
    операция.push({ id: e.id, title: e.title, нови: годни });
    for (const ц of годни) ЗАЕТИ.set(ц, e.id);
  }
}
const общоКлючове = операция.reduce((s, x) => s + x.нови.length, 0);
console.log('  🔑 кандидати: ' + общоКлючове + ' ключа за ' + операция.length + ' карти');
console.log('     (' + (болни.length - операция.length) + ' карти нямат годен кандидат — заглавието им е заето или под 3 думи)');

// ── сглобяване на новия kb.js ──
let s = fs.readFileSync('js/kb.js', 'utf8');
let сложени = 0;
for (const оп of операция) {
  const и = s.indexOf("      id: '" + оп.id + "',");
  if (и < 0) { console.log('     🔴 котвата липсва ' + оп.id); continue; }
  const кi = s.indexOf('keys: [', и);
  if (кi < 0) { console.log('     🔴 keys липсва ' + оп.id); continue; }
  const край = s.indexOf(']', кi);
  s = s.slice(0, край) + оп.нови.map(x => ", '" + x.replace(/'/g, '') + "'").join('') + s.slice(край);
  сложени += оп.нови.length;
}
try { new vm.Script(s); } catch (e) { console.log('\n  🔴 ЛОШ СИНТАКСИС: ' + e.message.slice(0, 140) + '\n'); process.exit(2); }

// ── поясът СЛЕД операцията ──
// ⚠️ pyasachnik чете js/kb.js от диска и НЯМА кука за подмяна (само за
//    helper.js). Затова новият текст се слага за малко на живия файл, мери се,
//    и при СУХ пробег се връща обратно в блока finally. Оригиналът се пази и
//    в .PREDI_HIRURG, за да има път назад дори ако процесът бъде убит по
//    средата — точно това е разликата между експеримент и залог.
const истински = fs.readFileSync('js/kb.js', 'utf8');
fs.writeFileSync(path.join(КОРЕН, 'js', 'kb.js.PREDI_HIRURG'), истински);
fs.writeFileSync('js/kb.js', s);
let СЛЕД, болниСлед;
try {
  const W2 = zaredi(null);
  СЛЕД = пояс(W2);
  болниСлед = W2.KB.entries.filter(e => питай(W2, катоВъпрос(e.title), e.room) !== e.id).length;
} finally {
  if (!ПИШИ) fs.writeFileSync('js/kb.js', истински);
}

// ── равносметката ──
let счупени = 0, оправени = 0;
const списък = [];
for (const [id, п] of ПРЕДИ) {
  const с = СЛЕД.get(id);
  if (!с) continue;
  if (п.взе === с.взе) continue;
  if (п.взе === id && с.взе !== id) { счупени++; списък.push('     🔴 ' + id + ': „' + п.q.slice(0, 44) + '" вече отива при ' + (с.взе || 'ТИШИНА')); }
  else if (п.взе !== id && с.взе === id) оправени++;
  else списък.push('     ⚪ ' + id + ': „' + п.q.slice(0, 44) + '" ' + (п.взе || 'тишина') + ' → ' + (с.взе || 'тишина'));
}
console.log('');
console.log('  ── ПОЯС ЗА ЩЕТИТЕ (първият ключ на всяка карта, ' + ПРЕДИ.size + ' въпроса) ──');
console.log('     ✅ поправени : ' + оправени);
console.log('     🔴 счупени   : ' + счупени);
console.log('     ⚪ разместени: ' + (списък.length - счупени));
for (const р of списък.slice(0, 20)) console.log(р);
if (списък.length > 20) console.log('     … и още ' + (списък.length - 20));
console.log('');
console.log('  ── недостижими по заглавие: ' + болни.length + ' → ' + болниСлед + ' ──');
console.log('');
if (!ПИШИ) { console.log('  \x1b[33mСУХО. За писане: node dev/hirurg_zaglavia.js --pishi\x1b[0m'); console.log(''); process.exit(0); }
if (счупени) { console.log('  \x1b[31m🔴 ' + счупени + ' счупени — върни с: git checkout -- js/kb.js\x1b[0m'); console.log(''); process.exit(2); }
console.log('  \x1b[32m✅ записани ' + сложени + ' ключа в js/kb.js\x1b[0m');
console.log('');
