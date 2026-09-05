#!/usr/bin/env node
/* eslint-disable */
// ═══════════════════════════════════════════════════════════════════════════
// 🚩 СЛИВАЧ НА ФЛАГОВЕ — предложените фрази влизат САМО ако не будят сирена
//     по невинни изречения
// ═══════════════════════════════════════════════════════════════════════════
//
// ЗАЩО (05.09.2026): ловците на мълчания намират фрази, които трябва да вдигат
// тревога. Но флаговете са БУКВАЛНИ ПОДНИЗИ — една обща дума („глътна",
// „подут", „кръв") гърми по цял ден и обучава майката да НЕ пита повече.
// Точно това вече се е случвало в този проект: широкият флаг „глътна" вдигаше
// 112 на „наглътна се с мляко".
//
// ГЕЙТЪТ (четири части, всяка може да откаже фраза сама):
//   1. фразата вече я има в същия списък                    → пропуска се
//   2. фразата е под 3 думи или под 14 знака                → ОТКАЗ (твърде обща)
//   3. фразата вече вдига тревога през друг път              → пропуска се
//   4. фразата УЛУЧВА поне едно невинно изречение от пояса   → ОТКАЗ
//
// 🩹 ПОЯСЪТ ЗА ЩЕТИТЕ: заглавието и първите три ключа на ВСЯКА карта — над
// 4000 изречения, писани като въпрос на майка. Тревога върху тях е фалшива по
// определение, ОСВЕН ако картата вече е спешна (те са изключени поименно чрез
// това, че вече гърмят ПРЕДИ сливането). Мери се РАЗЛИКАТА, не състоянието:
// колко изречения гърмят СЛЕД, а не гърмяха ПРЕДИ.
//
// ⚠️ ПИШЕ в js/kb.js САМО с --pishi. ПЪТ НАЗАД: git checkout -- js/kb.js
// ПУСКАНЕ: node dev/slivach_flagove.js [--pishi] [--samo=flagove_h1.json]
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
const { zaredi } = require(path.join(КОРЕН, 'dev/pyasachnik.js'));
const R = String.fromCharCode(13, 10);

const СПИСЪЦИ = ['redFlags', 'pregFlags', 'motherFlags', 'heavyFlags',
  'mamaBodyFlags', 'lossFlags', 'dvFlags'];

// ── стажовете ──
const файлове = fs.readdirSync('dev/nahodki')
  .filter(f => /^flagove_.*\.json$/.test(f))
  .filter(f => !САМО || f === САМО);
if (!файлове.length) { console.log('  ✅ няма файлове flagove_*.json'); process.exit(0); }

const W0 = zaredi(null);
const вече = {};
for (const с of СПИСЪЦИ) вече[с] = new Set((W0.KB[с] || []).map(x => String(x).toLowerCase()));

const флаг = (W, т) => {
  try {
    if (W.BL_REDFLAG(т)) return 'red';
    const m = W.BL_MOTHERFLAG(т); if (m) return m;
    if (W.BL_PREGFLAG(т, 'Бременност')) return 'preg';
  } catch (e) { return 'err'; }
  return '';
};

// ── поясът: заглавие + първите три ключа на всяка карта ──
const пояс = [];
for (const e of W0.KB.entries) {
  пояс.push(e.title);
  for (const k of (e.keys || []).slice(0, 3)) пояс.push(String(k));
}
console.log('');
console.log('  🚩 СЛИВАЧ НА ФЛАГОВЕ · ' + файлове.length + ' файла · пояс от ' + пояс.length + ' изречения');
if (пояс.length < 1000) { console.log('\n  🔴 СЛЯП УРЕД: поясът е само ' + пояс.length + ' изречения\n'); process.exit(2); }

const ПРЕДИ = pояс_снимка(W0);
function pояс_снимка(W) { const м = new Map(); for (const т of пояс) м.set(т, флаг(W, т)); return м; }

// ── събиране и гейт ──
const приети = {}; const откази = []; const фалшиви = [];
for (const с of СПИСЪЦИ) приети[с] = [];
for (const ф of файлове) {
  let a;
  try { a = JSON.parse(fs.readFileSync(path.join('dev/nahodki', ф), 'utf8')); }
  catch (e) { console.log('  🔴 ' + ф + ' счупен JSON — пробвай node dev/spasi_otryazan.js dev/nahodki/' + ф); continue; }
  if (!Array.isArray(a)) { console.log('  🔴 ' + ф + ' не е масив'); continue; }
  for (const з of a) {
    if (!з || typeof з !== 'object') continue;
    const списък = String(з.spisak || з.списък || '');
    const фрази = з.frazi || з.фрази || [];
    if (списък === 'lozhna_trevoga') { for (const x of фрази) фалшиви.push([ф, String(x), String(з.zashto || '')]); continue; }
    if (СПИСЪЦИ.indexOf(списък) < 0) { откази.push([ф, списък, 'непознат списък']); continue; }
    for (const сурова of фрази) {
      const т = String(сурова).toLowerCase().trim();
      if (вече[списък].has(т)) { откази.push([ф, т, 'вече е в ' + списък]); continue; }
      const думи = т.split(/\s+/).filter(Boolean);
      if (думи.length < 3 || т.length < 14) { откази.push([ф, т, 'твърде обща: ' + думи.length + ' думи, ' + т.length + ' знака']); continue; }
      const сега = флаг(W0, т);
      if (сега) { откази.push([ф, т, 'вече вдига „' + сега + '" през друг път']); continue; }
      приети[списък].push(т);
      вече[списък].add(т);
    }
  }
}

const общо = СПИСЪЦИ.reduce((s, с) => s + приети[с].length, 0);
for (const с of СПИСЪЦИ) if (приети[с].length) console.log('     ' + с.padEnd(16) + ' кандидати: ' + приети[с].length);
console.log('     ОБЩО кандидати: ' + общо + '   ·   откази: ' + откази.length);
for (const [ф, т, з] of откази.slice(0, 15)) console.log('        🔴 „' + т.slice(0, 44) + '" — ' + з);
if (откази.length > 15) console.log('        … и още ' + (откази.length - 15));
if (фалшиви.length) {
  console.log('');
  console.log('  ── 🔵 ДОКЛАДВАНИ ФАЛШИВИ ТРЕВОГИ (не се сливат, за четене) ──');
  for (const [ф, т, з] of фалшиви.slice(0, 20)) console.log('     „' + т.slice(0, 50) + '"  ' + з.slice(0, 60));
  if (фалшиви.length > 20) console.log('     … и още ' + (фалшиви.length - 20));
}
if (!общо) { console.log(''); console.log('  нищо за сливане.'); console.log(''); process.exit(0); }

// ── сглобяване ──
let s = fs.readFileSync('js/kb.js', 'utf8');
const дата = 'от лов на мълчания';
for (const с of СПИСЪЦИ) {
  if (!приети[с].length) continue;
  const котва = '  ' + с + ': [';
  const и = s.indexOf(котва);
  if (и < 0) { console.log('     🔴 няма списък ' + с + ' в kb.js'); continue; }
  const редове = ['    // 🚩 ' + приети[с].length + ' фрази ' + дата + ' — всяка е минала пояс от ' + пояс.length + ' невинни изречения']
    .concat(приети[с].map(x => "    '" + x.replace(/'/g, '') + "',"));
  s = s.slice(0, и) + котва + R + редове.join(R) + s.slice(и + котва.length);
}
try { new vm.Script(s); } catch (e) { console.log('\n  🔴 ЛОШ СИНТАКСИС: ' + e.message.slice(0, 160) + '\n'); process.exit(2); }

// ── поясът СЛЕД (пише се временно, връща се при сух пробег) ──
const истински = fs.readFileSync('js/kb.js', 'utf8');
fs.writeFileSync(path.join(КОРЕН, 'js', 'kb.js.PREDI_FLAGOVE'), истински);
fs.writeFileSync('js/kb.js', s);
let СЛЕД;
try { СЛЕД = pояс_снимка(zaredi(null)); }
finally { if (!ПИШИ) fs.writeFileSync('js/kb.js', истински); }

const нови = [];
for (const [т, п] of ПРЕДИ) { const сл = СЛЕД.get(т); if (!п && сл) нови.push([т, сл]); }
console.log('');
console.log('  ── ПОЯС ЗА ЩЕТИТЕ ──');
console.log('     невинни изречения, които СЕГА вдигат тревога, а преди не: ' + нови.length);
for (const [т, ф] of нови.slice(0, 25)) console.log('        🔴 [' + ф + '] „' + т.slice(0, 62) + '"');
if (нови.length > 25) console.log('        … и още ' + (нови.length - 25));
console.log('');
if (!ПИШИ) { console.log('  \x1b[33mСУХО. За писане: node dev/slivach_flagove.js --pishi\x1b[0m'); console.log(''); process.exit(0); }
if (нови.length) {
  fs.writeFileSync('js/kb.js', истински);
  console.log('  \x1b[31m🔴 ' + нови.length + ' фалшиви тревоги — НИЩО не е записано. Стесни фразите горе.\x1b[0m');
  console.log('');
  process.exit(2);
}
try { fs.unlinkSync(path.join(КОРЕН, 'js', 'kb.js.PREDI_FLAGOVE')); } catch (e) {}
console.log('  \x1b[32m✅ слети ' + общо + ' флага, нула фалшиви тревоги на пояса\x1b[0m');
console.log('');
