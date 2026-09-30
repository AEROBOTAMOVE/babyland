// 🚑 ФИНАЛНА МЯРКА — всичко наведнъж срещу ЕДИН хеш на js/helper.js.
// Само чете. Файлът се пипа от друг агент в момента, затова хешът се печата.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { zaredi, ROOT } = require(path.join(__dirname, '..', 'dev', 'pyasachnik.js'));

const P = path.join(ROOT, 'js/helper.js');
const S = fs.readFileSync(P, 'utf8');
console.log('# helper.js md5 : ' + crypto.createHash('md5').update(S).digest('hex'));
console.log('# helper.js mtime: ' + fs.statSync(P).mtime.toISOString());
const R6 = fs.readFileSync(path.join(ROOT, 'js/rooms6.js'), 'utf8');
console.log('# rooms6.js md5 : ' + crypto.createHash('md5').update(R6).digest('hex'));

const A = 'const сцен = (function () {', B = '\n        })();';
const i = S.indexOf(A), j = S.indexOf(B, i);
if (i < 0 || j < 0) throw new Error('сцен-блокът не се намери');
const тяло = S.slice(i + A.length, j);
const K = '  window.BL_REDFLAG = isRedFlag;';
const W = zaredi(s => s.replace(K, K + '\n  window.__СЦЕН=function(text){' + тяло + '\n};\n'),
  { памет: { bl_baby: { birth: '2025-11-20' } } });

// ── КОНТРОЛИ, които ТРЯБВА да гръмнат ──
const кон = [['задави се', 'zadavi'], ['падна от масата', 'padna'], ['гърчи се', 'garch'],
             ['глътна батерия', 'poglatnat'], ['здравей', null]];
let лош = 0;
for (const [т, ч] of кон) { const г = W.__СЦЕН(т); if (г !== ч) { лош++; console.log('ГРЕШКА контрол: ' + т + ' → ' + г); } }
console.log('# контроли: ' + (кон.length - лош) + '/' + кон.length + ' ОК');
if (лош) throw new Error('уредът е сляп');

const ИМА = new Map(); let m;
const rx = /\{\s*id:\s*'([a-z]+)',\s*e:\s*'([^']*)',\s*t:\s*'([^']*)'/g;
while ((m = rx.exec(R6))) ИМА.set(m[1], m[3]);
console.log('# BL_FIRSTAID.list = ' + ИМА.size + ' сценария: ' + [...ИМА.keys()].join(', '));
const изходи = new Set(); const rr = /return '([a-z]+)'/g;
while ((m = rr.exec(тяло))) изходи.add(m[1]);
console.log('# сцен може да върне: ' + [...изходи].join(', '));
console.log('# НЕДОСТИЖИМИ карти с хватки: ' +
  ([...ИМА.keys()].filter(k => !изходи.has(k)).join(', ') || 'НЯМА — всичките 7 се достигат'));

// ── ТАБЛИЦАТА от задачата ──
const ИЗР = ['не диша', 'спря да диша', 'посиня и не диша', 'задави се с хапка', 'разтърсих го',
  'разтърсих бебето от нерви', 'изпуснах бебето', 'падна от масата', 'не реагира',
  'отпуснато е и не реагира', 'гърчи се', 'давя го от водата', 'извадих го от водата'];
console.log('\n## ТАБЛИЦА (стая „Здраве и SOS", бебе родено 2025-11-20)');
console.log('| изречение | BL_REDFLAG | майчин | сцен | хватки стигат | заглавие | карта |');
let стигат = 0;
for (const т of ИЗР) {
  const rf = !!W.BL_REDFLAG(т);
  const mf = !!(W.BL_MOTHERFLAG && W.BL_MOTHERFLAG(т, 'Здраве и SOS'));
  const с = W.__СЦЕН(т);
  const ст = rf && !mf && !!(с && с !== 'poglatnat' && ИМА.has(с));
  if (ст) стигат++;
  const e = W.BL_MATCH(т, 'Здраве и SOS');
  console.log('| ' + т + ' | ' + (rf ? 'ГЪРМИ' : 'НЕ') + ' | ' + (mf ? 'ДА' : 'не') + ' | ' +
    (с || '—') + ' | ' + (ст ? 'ДА' : 'НЕ') + ' | ' + (ИМА.get(с) || '—') + ' | ' + (e ? e.id : '—') + ' |');
}
console.log('→ хватките стигат при ' + стигат + ' от ' + ИЗР.length);

// ── ВСИЧКИ червени флага (без motherLevel — той е бавен и хваща 15/1256) ──
const KB = W.BL_KB || W.KB;
const фл = (KB.redFlags || []).filter(x => typeof x === 'string');
const бр = {}; const без = [];
for (const ф of фл) {
  const rf = !!W.BL_REDFLAG(ф), с = W.__СЦЕН(ф);
  const ст = rf && с && с !== 'poglatnat' && ИМА.has(с);
  const к = ст ? с : (!rf ? '(сам не вдига флаг)' : (с === 'poglatnat' ? '(poglatnat)' : '(НЯМА ХВАТКИ)'));
  бр[к] = (бр[к] || 0) + 1; if (к === '(НЯМА ХВАТКИ)') без.push(ф);
}
console.log('\n## ВСИЧКИ ' + фл.length + ' червени флага през сцен:');
Object.entries(бр).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log('  ' + String(v).padStart(5) + '  ' + k));
const схв = Object.entries(бр).filter(([k]) => ИМА.has(k)).reduce((a, b) => a + b[1], 0);
console.log('→ ХВАТКИ при ' + схв + ' от ' + фл.length + ' (' + (100 * схв / фл.length).toFixed(1) + '%)');

const темa = {
  'ВОДА/УДАВЯНЕ': /удав|потъ|под вод|във вод|басейн|ваната|кофа|море|локв/i,
  'ИЗПУСКАНЕ': /изпусна|изтърва|от ръцете|падна ми/i,
  'ДИШАНЕ/СЪЗНАНИЕ': /диша|съзнан|припад|реагира|събуд|отпуснат|безжизнен|пулс|посин/i,
};
console.log('\n## спешни БЕЗ хватки (' + без.length + ') — по теми, които ИМАТ готова карта:');
for (const [име, r] of Object.entries(темa)) {
  const сп = без.filter(x => r.test(x));
  console.log('\n  ▸ ' + име + ': ' + сп.length);
  сп.slice(0, 40).forEach(x => console.log('      · ' + x));
}
