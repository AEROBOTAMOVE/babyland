// ═══════════════════════════════════════════════════════════
// 🚨 ПРИЛАГА НОВИ ФРАЗИ ВЪВ ФЛАГОВЕТЕ — с адверсарна проверка ПРЕДИ писане
//
// Чете dev/propusnati_frazi.json (какво предлага отрядът) и НЕ вярва на нито
// един запис. Всяка фраза минава през четири врати и падне ли на някоя —
// не се записва, а се изброява с причината.
//
//   1. ПОДНИЗ ЛИ Е на своето изречение? Търсенето във флаговете е по НЕПРЕКЪСНАТ
//      подниз. Фраза, която не е подниз, е недостижима — тя изглежда като
//      поправка и не прави нищо. Това е най-честата грешка в този проект.
//   2. ХВАЩА ЛИ СЕГА? Ако изречението вече вдига флаг, фразата е излишна.
//   3. 🔴 УДРЯ ЛИ НЕВИННО? Фразата се пуска срещу ВСИЧКИТЕ невинни изречения в
//      dev/korpus350.json. Съвпадне ли поне с едно — ОТКАЗ. Това е механичната
//      адверсарна проверка: тя не пита дали фразата изглежда добре, а дали
//      уврежда нещо, за което вече е гарантирано, че е безобидно.
//   4. ИМА ЛИ Я ВЕЧЕ в семейството?
//
// ПУСКАНЕ: node dev/prilozhi_frazi.js --suho   (само показва)
//          node dev/prilozhi_frazi.js          (пише в js/kb.js)
// ПЪТ НАЗАД: js/kb.js.PREDI_FRAZI
// ═══════════════════════════════════════════════════════════
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const КОРЕН = path.resolve(__dirname, '..');
const АП = String.fromCharCode(39);
const СУХО = process.argv.indexOf('--suho') >= 0;

const ИЗТОЧНИК = path.join(__dirname, 'propusnati_frazi.json');
if (!fs.existsSync(ИЗТОЧНИК)) { console.log('🔴 няма dev/propusnati_frazi.json'); process.exit(2); }
let предложения;
try { предложения = JSON.parse(fs.readFileSync(ИЗТОЧНИК, 'utf8')); }
catch (e) { console.log('🔴 файлът не се парсва: ' + e.message); process.exit(2); }
if (!Array.isArray(предложения) || !предложения.length) { console.log('🔴 празен списък'); process.exit(2); }

// ── невинните изречения, срещу които се проверява всяка фраза ──
let невинни = [];
try {
  невинни = JSON.parse(fs.readFileSync(path.join(__dirname, 'korpus350.json'), 'utf8'))
    .filter(x => x && x.e === 'NEVINNO').map(x => String(x.t || ''));
} catch (e) {}
if (невинни.length < 50) { console.log('🔴 намерих само ' + невинни.length + ' невинни изречения — проверката би била празна'); process.exit(2); }

// ── живият двигател ──
const { zaredi } = require('./pyasachnik.js');
const W = zaredi(null);
const гърми = (т, стая) => {
  try { if (W.BL_REDFLAG && W.BL_REDFLAG(т)) return 'червен'; } catch (e) {}
  try { const m = W.BL_MOTHERFLAG && W.BL_MOTHERFLAG(т); if (m) return 'майка:' + m; } catch (e) {}
  try { if (W.BL_PREGFLAG && W.BL_PREGFLAG(т, стая || 'Бременност')) return 'бременност'; } catch (e) {}
  return null;
};

const норм = т => (' ' + String(т == null ? '' : т).toLowerCase()
  .replace(/[^а-яa-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim() + ' ');
const удря = (изр, фраза) => норм(изр).indexOf(' ' + норм(фраза).trim()) >= 0;

// ── текущите списъци ──
const ctx = { console: { log() {}, warn() {} }, JSON, Math, Date, RegExp, String, Number, Array, Object };
ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
vm.createContext(ctx);
new vm.Script(fs.readFileSync(path.join(КОРЕН, 'js/kb.js'), 'utf8')).runInContext(ctx);
const KB = ctx.KB;
const ПОЗНАТИ = ['redFlags', 'pregFlags', 'dvFlags', 'motherFlags', 'heavyFlags', 'mamaBodyFlags', 'lossFlags'];

const приети = {}, отказани = [];
let бр = 0;
for (const п of предложения) {
  бр++;
  const изр = String(п.izrechenie || '').trim();
  const фраза = String(п.fraza || '').trim().toLowerCase();
  const сем = String(п.semeystvo || '').trim();
  const откажи = защо => отказани.push({ фраза, сем, защо, изр });

  if (!фраза || фраза.length < 4) { откажи('фразата е празна или под 4 знака'); continue; }
  if (фраза.indexOf(АП) >= 0) { откажи('съдържа апостроф — би счупил низа'); continue; }
  if (ПОЗНАТИ.indexOf(сем) < 0) { откажи('непознато семейство: ' + сем); continue; }
  // 1. подниз ли е
  if (!удря(изр, фраза)) { откажи('НЕ Е ПОДНИЗ на своето изречение — недостижима'); continue; }
  // 2. вече ли гърми
  if (гърми(изр)) { откажи('изречението вече вдига флаг — фразата е излишна'); continue; }
  // 3. 🔴 адверсарната врата
  const жертва = невинни.find(н => удря(н, фраза));
  if (жертва) { откажи('УДРЯ НЕВИННО: „' + жертва + '"'); continue; }
  // 4. дубликат
  if ((KB[сем] || []).some(x => String(x).toLowerCase() === фраза)) { откажи('вече е в списъка'); continue; }
  if ((приети[сем] || []).indexOf(фраза) >= 0) { откажи('повторена в самия файл'); continue; }

  (приети[сем] = приети[сем] || []).push(фраза);
}

console.log('');
console.log('🚨 ПРИЛАГАНЕ НА НОВИ ФРАЗИ ВЪВ ФЛАГОВЕТЕ');
console.log('');
console.log('  ПРЕГЛЕДАНИ предложения : ' + бр);
console.log('  ✅ приети              : ' + Object.values(приети).reduce((с, x) => с + x.length, 0));
for (const [с, x] of Object.entries(приети)) console.log('       ' + с.padEnd(16) + '+' + x.length);
console.log('  🔴 отказани            : ' + отказани.length);
const поПричина = {};
for (const о of отказани) {
  const к = о.защо.indexOf('УДРЯ НЕВИННО') === 0 ? 'УДРЯ НЕВИННО ИЗРЕЧЕНИЕ' : о.защо;
  поПричина[к] = (поПричина[к] || 0) + 1;
}
for (const [к, n] of Object.entries(поПричина).sort((a, b) => b[1] - a[1]))
  console.log('       ' + String(n).padStart(3) + '  ' + к);
if (отказани.length) {
  console.log('');
  console.log('  ── първите десет отказа, поименно ──');
  for (const о of отказани.slice(0, 10)) console.log('     „' + о.фраза + '"  → ' + о.защо);
}
console.log('');

if (СУХО) { console.log('  (сухо пускане — нищо не е записано)'); process.exit(0); }
if (!Object.keys(приети).length) { console.log('  нищо за писане'); process.exit(0); }

// ── писане ──
const П = path.join(КОРЕН, 'js/kb.js');
fs.copyFileSync(П, П + '.PREDI_FRAZI');
let src = fs.readFileSync(П, 'utf8');
const НР = src.indexOf('\r\n') >= 0 ? '\r\n' : '\n';
for (const [сем, фрази] of Object.entries(приети)) {
  const котва = '  ' + сем + ': [';
  const и = src.indexOf(котва);
  if (и < 0) { console.log('🔴 ' + сем + ': не намирам списъка'); continue; }
  const край = src.indexOf(НР, и);
  const редове = [''];
  редове.push('    // 🚨 26.08 — ИЗРЕЧЕНИЯ, КОИТО МАЙКАТА ПИШЕ, А СПИСЪКЪТ НЕ ЗНАЕШЕ.');
  редове.push('    //    Тя не пише „цианоза" и „нистагъм" — пише какво ВИЖДА. Всяка');
  редове.push('    //    фраза долу е минала четири врати преди да влезе: подниз ли е на');
  редове.push('    //    истинско изречение · не гърми ли вече · НЕ УДРЯ ЛИ НИТО ЕДНО от');
  редове.push('    //    284-те невинни изречения в корпуса · няма ли я вече.');
  for (let i = 0; i < фрази.length; i += 4)
    редове.push('    ' + фрази.slice(i, i + 4).map(ф => АП + ф + АП).join(', ') + ',');
  src = src.slice(0, край) + НР + редове.join(НР) + src.slice(край);
}
fs.writeFileSync(П, src);
console.log('  💾 ЗАПИСАНО в js/kb.js');
console.log('  ПЪТ НАЗАД: js/kb.js.PREDI_FRAZI');
console.log('');
