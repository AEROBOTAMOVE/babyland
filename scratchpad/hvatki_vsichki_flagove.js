// 🚑 МЕРКА 5: ВСИЧКИ червени флагове от базата през избора на сценарий.
// Колко спешни изречения получават хватки и колко остават с само 112? Само чете.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { zaredi, ROOT } = require(path.join(__dirname, '..', 'dev', 'pyasachnik.js'));

const P = path.join(ROOT, 'js/helper.js');
const ИЗВОР = fs.readFileSync(P, 'utf8');
console.log('# helper.js md5:', crypto.createHash('md5').update(ИЗВОР).digest('hex'));

const НАЧАЛО = 'const сцен = (function () {', КРАЙ = '\n        })();';
const i = ИЗВОР.indexOf(НАЧАЛО), j = ИЗВОР.indexOf(КРАЙ, i);
const тяло = ИЗВОР.slice(i + НАЧАЛО.length, j);
const КОТВА = '  window.BL_REDFLAG = isRedFlag;';
const W = zaredi(s => s.replace(КОТВА, КОТВА + '\n  window.__СЦЕН = function (text) {' + тяло + '\n  };\n'),
  { памет: { bl_baby: { birth: '2025-11-20' } } });
if (W.__СЦЕН('задави се') !== 'zadavi' || W.__СЦЕН('не диша') !== 'reanim')
  throw new Error('уредът е сляп — спирам');

const ROOMS6 = fs.readFileSync(path.join(ROOT, 'js/rooms6.js'), 'utf8');
const ИМА = new Set(); let m;
const rx = /\{\s*id:\s*'([a-z]+)',\s*e:\s*'([^']*)',\s*t:\s*'([^']*)'/g;
while ((m = rx.exec(ROOMS6))) ИМА.add(m[1]);

const KB = W.BL_KB || W.KB;
const флагове = (KB.redFlags || []).filter(x => typeof x === 'string');
console.log('# червени флага:', флагове.length);

const брой = {}; const без = [];
for (const ф of флагове) {
  const rf = !!W.BL_REDFLAG(ф);
  const mf = !!(W.BL_MOTHERFLAG && W.BL_MOTHERFLAG(ф, 'Здраве и SOS'));
  const с = W.__СЦЕН(ф);
  const стига = rf && !mf && !!(с && с !== 'poglatnat' && ИМА.has(с));
  const к = стига ? с : (mf ? '— майчин флаг го поема' : (!rf ? '— сам не вдига флаг' : (с === 'poglatnat' ? '— poglatnat (отделна карта)' : '— НЯМА ХВАТКИ')));
  брой[к] = (брой[к] || 0) + 1;
  if (к === '— НЯМА ХВАТКИ') без.push(ф);
}
console.log('\n# разпределение:');
Object.entries(брой).sort((a, b) => b[1] - a[1]).forEach(([k, v]) =>
  console.log('   ' + String(v).padStart(5) + '  ' + k));
const схв = Object.entries(брой).filter(([k]) => ИМА.has(k)).reduce((a, b) => a + b[1], 0);
console.log('\n# ХВАТКИ СТИГАТ при ' + схв + ' от ' + флагове.length +
  ' (' + (100 * схв / флагове.length).toFixed(1) + '%)');

// от тези, които вдигат флаг но НЯМАТ хватки — кои са по теми
const теми = {
  'вода/удавяне': /удав|потъ|под водата|във водата|в водата|басейн|ван[ае]|кофа/i,
  'изпускане от ръце': /изпусна|изтърва|от ръцете/i,
  'дишане/съзнание': /диша|дишане|съзнан|припад|реагира|буди|събуд|отпуснат|безжизнен|пулс|сърце/i,
  'температура': /темпер|градус|38|39|40/i,
  'повръщане/ако': /повръщ|изхвърл|акото|диари/i,
  'кръв': /кръв|кърви/i,
};
console.log('\n# СПЕШНИ БЕЗ ХВАТКИ (' + без.length + ') по теми:');
for (const [име, r] of Object.entries(теми)) {
  const сп = без.filter(x => r.test(x));
  console.log('   ' + String(сп.length).padStart(4) + '  ' + име +
    (сп.length && сп.length <= 12 ? '  →  ' + сп.join(' · ') : ''));
}
const вода = без.filter(x => теми['вода/удавяне'].test(x));
console.log('\n# ВСИЧКИ спешни за вода без хватки (' + вода.length + '):');
вода.forEach(x => console.log('   · ' + x));
const изп = без.filter(x => теми['изпускане от ръце'].test(x));
console.log('\n# ВСИЧКИ спешни за изпускане без хватки (' + изп.length + '):');
изп.forEach(x => console.log('   · ' + x));
const дих = без.filter(x => теми['дишане/съзнание'].test(x));
console.log('\n# ВСИЧКИ спешни за дишане/съзнание без хватки (' + дих.length + '):');
дих.forEach(x => console.log('   · ' + x));
