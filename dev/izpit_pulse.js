#!/usr/bin/env node
/* eslint-disable */
// ═══════════════════════════════════════════════════════════════════════════
// 🫀 ИЗПИТ ОТ PULSE LIBRARY — въпроси, писани от ПАЗАРНО ПРОУЧВАНЕ, не от мен
// ═══════════════════════════════════════════════════════════════════════════
//
// ЗАЩО (05.09.2026): собственикът посочи `ЛОЦО/market_pulse_library`. Това е
// рекламният бот на МАГАЗИНА (Meta Ads, SEO, бюджети), не библиотека за
// приложението. НО в `data/babyland_*.json` има полета, които струват злато:
//
//     objections_bg      — съмненията на майката, с нейните думи
//     triggers_bg        — поводът, заради който търси
//     purchase_triggers_bg / core_objections_bg — същото по етапи от живота
//     moments_bg         — сезонните поводи
//
// Пример: „дали влиза в багажник", „страх ме е да не купя грешното",
// „колебая се между модели", „смяна към по-компактен модел".
//
// Това НЕ са мои измислени въпроси. Писани са отделно, за друга цел, от
// човек, който гледа какво пишат клиентите. Значи са независим изпит —
// най-ценният вид, защото не може да е нагласен към ключовете ни.
//
// ⚠️ ЧЕСТНО ЗА ГРАНИЦАТА: това са ТЪРГОВСКИ съмнения. Приложението не е
//    магазин и няма да отговаря на „струва ли си цената". Но „дали влиза в
//    багажник" и „не знам какво е нужно" са точно въпроси за стая
//    „Инструменти" — и ако там е тишина, това е дупка.
//
// ⚠️ ТОЗИ ФАЙЛ САМО ЧЕТЕ.
// ПУСКАНЕ: node dev/izpit_pulse.js [--vsichki]
// ═══════════════════════════════════════════════════════════════════════════
'use strict';
const fs = require('fs');
const path = require('path');
const КОРЕН = path.resolve(__dirname, '..');
process.chdir(КОРЕН);
const ВСИЧКИ = process.argv.includes('--vsichki');
const ПУЛС = 'C:/Users/User/Downloads/ЛОЦО/market_pulse_library/data';
const W = require(path.join(КОРЕН, 'dev/pyasachnik.js')).zaredi(null);

if (!fs.existsSync(ПУЛС)) {
  console.error('');
  console.error('  🔴 СЛЯП УРЕД: няма ' + ПУЛС);
  console.error('     Изпитът няма източник — числата долу нямаше да значат нищо.');
  console.error('');
  process.exit(2);
}

// ── събиране на всяко българско поле, което звучи като въпрос на майка ──
const ПОЛЕТА = /^(objections_bg|core_objections_bg|triggers_bg|purchase_triggers_bg|moments_bg|questions_bg|concerns_bg|pain_points_bg)$/;
const въпроси = new Map();   // текст → откъде
function обходи(възел, файл, поле) {
  if (Array.isArray(възел)) { for (const x of възел) обходи(x, файл, поле); return; }
  if (възел && typeof възел === 'object') {
    for (const k of Object.keys(възел)) обходи(възел[k], файл, ПОЛЕТА.test(k) ? k : poле_или(поле, k));
    return;
  }
  if (typeof възел !== 'string') return;
  if (!поле || !ПОЛЕТА.test(поле)) return;
  const т = възел.trim().toLowerCase();
  if (т.length < 8 || т.length > 90) return;
  if (!/[а-я]/.test(т)) return;                    // само български
  if (!въпроси.has(т)) въпроси.set(т, файл + ' · ' + поле);
}
function poле_или(старо, ново) { return ПОЛЕТА.test(ново) ? ново : старо; }

let файлове = 0;
for (const f of fs.readdirSync(ПУЛС)) {
  if (!/^babyland_.*\.json$/.test(f)) continue;
  let a; try { a = JSON.parse(fs.readFileSync(path.join(ПУЛС, f), 'utf8')); } catch (e) { continue; }
  файлове++;
  обходи(a, f, null);
}

console.log('');
console.log('  🫀 ИЗПИТ ОТ PULSE LIBRARY · ' + файлове + ' файла · ' + въпроси.size + ' български фрази');
if (въпроси.size < 20) {
  console.error('');
  console.error('  🔴 СЛЯП УРЕД: само ' + въпроси.size + ' фрази — форматът се е сменил.');
  console.error('');
  process.exit(2);
}

const СТАИ = ['Инструменти', 'Бременност', 'Моето бебе', 'Захранване', 'Здраве и SOS',
  'Развитие и игри', 'Жената в мен', 'Дневник на мама', 'Лабораторията'];
const питай = (т, с) => {
  try {
    const р = W.BL_MATCH(т, с);
    const з = Array.isArray(р) ? р[0] : (р && (р.entry || р.item || р));
    return з || null;
  } catch (e) { return null; }
};

let намерени = 0; const тишини = [];
for (const [т, откъде] of въпроси) {
  let н = null;
  for (const с of СТАИ) { н = питай(т, с); if (н) break; }
  if (н) namereni_plus(); else тишини.push([т, откъде]);
}
function namereni_plus() { намерени++; }

console.log('');
console.log('  ✅ намират отговор : ' + намерени + '  (' + (намерени * 100 / въпроси.size).toFixed(1) + '%)');
console.log('  🔴 тишина          : ' + тишини.length);
console.log('');
for (const [т, откъде] of (ВСИЧКИ ? тишини : тишини.slice(0, 40)))
  console.log('     ⬜ „' + т.slice(0, 62) + '"'.padEnd(2) + '   [' + откъде.split(' · ')[1] + ']');
if (!ВСИЧКИ && тишини.length > 40) console.log('     … и още ' + (тишини.length - 40));
console.log('');
