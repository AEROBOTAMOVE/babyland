// 🚑 МЕРКА: кои спешни изречения получават хватки за първа помощ.
// Само ЧЕТЕ js/helper.js и js/kb.js. Нищо не записва.
// Изважда вътрешния избор на сценарий (helper.js ~4148 `const сцен = (function(){...})()`)
// ВЕРБАТИМ и го излага като window.__СЦЕН — без да го преписвам на ръка.
const fs = require('fs');
const path = require('path');
const { zaredi, ROOT } = require(path.join(__dirname, '..', 'dev', 'pyasachnik.js'));

const НАЧАЛО = 'const сцен = (function () {';
const КРАЙ = '\n        })();';

function изкарайТялото(src) {
  const i = src.indexOf(НАЧАЛО);
  if (i < 0) throw new Error('не намирам НАЧАЛО на сцен-IIFE');
  const j = src.indexOf(КРАЙ, i);
  if (j < 0) throw new Error('не намирам КРАЙ на сцен-IIFE');
  // втора поява = двусмислие → отказваме шумно
  if (src.indexOf(НАЧАЛО, i + 1) >= 0) throw new Error('НАЧАЛО се среща повече от веднъж');
  const тяло = src.slice(i + НАЧАЛО.length, j);
  return { тяло, край: j + КРАЙ.length };
}

const ИЗВОР = fs.readFileSync(path.join(ROOT, 'js/helper.js'), 'utf8');
const { тяло } = изкарайТялото(ИЗВОР);
console.log('# байтове на извадения сцен-блок:', тяло.length);

const КОТВА = '  window.BL_REDFLAG = isRedFlag;';
if (ИЗВОР.split(КОТВА).length - 1 !== 1) throw new Error('котвата BL_REDFLAG не е точно една');

const patch = (src) => src.replace(
  КОТВА,
  КОТВА + '\n  window.__СЦЕН = function (text) {' + тяло + '\n  };\n'
);

const W = zaredi(patch, { памет: { bl_baby: { birth: '2025-11-20' } } });
if (typeof W.__СЦЕН !== 'function') throw new Error('__СЦЕН не се изнесе');

// ── списъкът с хватки, изчетен от js/rooms6.js (там живее BL_FIRSTAID) ──
const ROOMS6 = fs.readFileSync(path.join(ROOT, 'js/rooms6.js'), 'utf8');
const ХВАТКИ = [];
const rx = /\{\s*id:\s*'([a-z]+)',\s*e:\s*'([^']*)',\s*t:\s*'([^']*)'/g;
let m;
while ((m = rx.exec(ROOMS6))) ХВАТКИ.push({ id: m[1], e: m[2], t: m[3] });
console.log('# сценарии с хватки (BL_FIRSTAID.list):', ХВАТКИ.length);
ХВАТКИ.forEach((х, i) => console.log('   ' + (i + 1) + '. ' + х.id + '  — ' + х.t));
const ИМА_ХВАТКИ = new Set(ХВАТКИ.map(х => х.id));

// ── КОНТРОЛЕН СЛУЧАЙ: уредът трябва да ГРЪМНЕ, инак нулите са слепота ──
const контроли = [
  ['задави се с грозде', 'zadavi'],
  ['разля вряла вода върху него', 'izgori'],
  ['падна от масата и удари главата', 'padna'],
  ['глътна батерия', 'poglatnat'],
  ['здравей, как си', null],
];
let провалени = 0;
console.log('\n# КОНТРОЛ (уредът вижда ли изобщо):');
for (const [т, чакано] of контроли) {
  const г = W.__СЦЕН(т);
  const ок = г === чакано;
  if (!ок) провалени++;
  console.log('   ' + (ок ? 'ОК ' : 'ГРЕШКА ') + JSON.stringify(т) + ' → ' + г + ' (чакано ' + чакано + ')');
}
console.log('# провалени контроли: ' + провалени + ' от ' + контроли.length);
if (провалени) throw new Error('уредът не вижда вярно — спирам, за да не броя нули');

// контрол и за BL_REDFLAG
const к2 = W.BL_REDFLAG('бебето не диша');
console.log('# контрол BL_REDFLAG("бебето не диша") =', к2, '(трябва truthy)');
if (!к2) throw new Error('BL_REDFLAG е сляп');

// ── ИЗРЕЧЕНИЯТА ──
const ИЗР = [
  'не диша',
  'спря да диша',
  'посиня и не диша',
  'задави се с хапка',
  'разтърсих го',
  'разтърсих бебето от нерви',
  'изпуснах бебето',
  'падна от масата',
  'не реагира',
  'отпуснато е и не реагира',
  'гърчи се',
  'давя го от водата',
  'извадих го от водата',
];

const СТАЯ = 'Здраве и SOS';
console.log('\n# ТАБЛИЦА (стая: ' + СТАЯ + ', бебе родено 2025-11-20)');
console.log('изречение | BL_REDFLAG | майчин флаг | бременен флаг | разтърсване | сцен | има хватки | заглавие на хватките | карта (BL_MATCH)');
const редове = [];
for (const т of ИЗР) {
  const rf = !!W.BL_REDFLAG(т);
  const mf = W.BL_MOTHERFLAG ? (W.BL_MOTHERFLAG(т, СТАЯ) || null) : 'нямам';
  const pf = W.BL_PREGFLAG ? (W.BL_PREGFLAG(т, СТАЯ) || null) : 'нямам';
  const sh = W.BL_SHAKEN ? !!W.BL_SHAKEN(т) : 'нямам';
  const сцен = W.__СЦЕН(т);
  const има = sцен_има(сцен);
  const карта = (() => { try { const e = W.BL_MATCH(т, СТАЯ); return e ? e.id : null; } catch (e) { return 'ГРЪМНА'; } })();
  const т_загл = сцен && ИМА_ХВАТКИ.has(сцен) ? ХВАТКИ.find(x => x.id === сцен).t : '—';
  редове.push({ т, rf, mf, pf, sh, сцен, има, т_загл, карта });
  console.log([т, rf ? 'ГЪРМИ' : 'не', mf, pf, sh, сцен, има, т_загл, карта].join(' | '));
}
function sцен_има(с) {
  if (!с) return 'НЯМА СЦЕНАРИЙ';
  if (с === 'poglatnat') return 'не (нарочно — отделна карта zd-poglatnat-predmet)';
  return ИМА_ХВАТКИ.has(с) ? 'ДА' : 'НЕ (сценарий без карта!)';
}

// ── кои id-та от BL_FIRSTAID НИКОГА не се избират от сцен ──
const връщани = new Set();
// изкарваме всички `return 'x'` от извадения блок — това е пълният списък на изходите
const rr = /return\s+'([a-z]+)'/g; let mm;
while ((mm = rr.exec(тяло))) връщани.add(mm[1]);
console.log('\n# изходи, които сцен МОЖЕ да върне (от самия код):', [...връщани].join(', '));
const недостижими = ХВАТКИ.filter(х => !връщани.has(х.id));
console.log('# карти с хватки, НЕДОСТИЖИМИ от чата:', недостижими.length,
  недостижими.map(х => х.id + ' («' + х.t + '»)').join(', ') || '—');

// ── допълнителна мярка: вода / удавяне / реанимация — има ли ги изобщо в решетките ──
console.log('\n# ДУМИ ЗА ВОДА в сцен-блока:', /вода|удав|потъ|басейн|ван/.test(тяло) ? 'ДА' : 'НЯМА НИТО ЕДНА');
console.log('# ДУМИ ЗА „не реагира/отпусна" в сцен-блока:',
  /не реагира|отпусна|безсъзнан|не се буди/.test(тяло) ? 'ДА' : 'НЯМА НИТО ЕДНА');

// ── и дали редът за задавяне хваща голите „не диша/посиня" ──
const голи = ['не диша', 'посиня', 'спря да диша', 'не реагира', 'отпуснат е'];
console.log('\n# ГОЛИТЕ признаци на спиране на дишането → сцен:');
for (const г of голи) console.log('   ' + JSON.stringify(г) + ' → ' + W.__СЦЕН(г) + '   | BL_REDFLAG: ' + (!!W.BL_REDFLAG(г)));

// ── вариации за водата ──
console.log('\n# ВОДА, вариации:');
for (const г of ['удави се във ваната', 'падна в басейна', 'извадих го от водата и не диша',
                 'потъна във ваната', 'намерих го в водата', 'давя го от водата']) {
  console.log('   ' + JSON.stringify(г) + ' → сцен: ' + W.__СЦЕН(г) + ' | BL_REDFLAG: ' + (!!W.BL_REDFLAG(г)));
}

// ── изпускане ──
console.log('\n# ИЗПУСКАНЕ, вариации:');
for (const г of ['изпуснах бебето', 'изпуснах го от ръцете си', 'изпуснах го на пода',
                 'падна ми от ръцете', 'изтърва ми се от ръцете', 'падна от масата']) {
  console.log('   ' + JSON.stringify(г) + ' → сцен: ' + W.__СЦЕН(г) + ' | BL_REDFLAG: ' + (!!W.BL_REDFLAG(г)));
}
