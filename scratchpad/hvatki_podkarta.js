// 🚑 МЕРКА 2: когато НЯМА сценарий с хватки, стига ли изобщо картата
// (последният чип „📄 …“) до майката? Изваждам блока `let _подКартата = []`
// ВЕРБАТИМ от js/helper.js и го излагам като window.__ПОДКАРТА.
// Само чете. Нищо не записва.
const fs = require('fs');
const path = require('path');
const { zaredi, ROOT } = require(path.join(__dirname, '..', 'dev', 'pyasachnik.js'));

const ИЗВОР = fs.readFileSync(path.join(ROOT, 'js/helper.js'), 'utf8');

const A = 'let _подКартата = [];';
const B = '            } catch (e) {}';
const i = ИЗВОР.indexOf(A);
if (i < 0) throw new Error('няма _подКартата');
if (ИЗВОР.indexOf(A, i + 1) >= 0) throw new Error('_подКартата се среща повече от веднъж');
const j = ИЗВОР.indexOf(B, i);
if (j < 0) throw new Error('няма край на try/catch');
const БЛОК = ИЗВОР.slice(i, j + B.length);
console.log('# байтове на извадения _подКартата блок:', БЛОК.length);

const КОТВА = '  window.BL_REDFLAG = isRedFlag;';
const patch = (src) => src.replace(КОТВА, КОТВА +
  '\n  window.__ПОДКАРТА = function (text, currentRoom) {\n' + БЛОК +
  '\n    return _подКартата;\n  };\n');

const W = zaredi(patch, { памет: { bl_baby: { birth: '2025-11-20' } } });
if (typeof W.__ПОДКАРТА !== 'function') throw new Error('__ПОДКАРТА не се изнесе');

// КОНТРОЛ: изречението от самия коментар в кода ТРЯБВА да даде карта
const контрол = W.__ПОДКАРТА('хапна от гроздето и хърка', 'Здраве и SOS');
console.log('# КОНТРОЛ "хапна от гроздето и хърка" →', JSON.stringify(контрол),
  контрол.length ? 'ОК (уредът вижда)' : 'ГРЕШКА — уредът е сляп');
const контрол2 = W.__ПОДКАРТА('здравей как си', 'Здраве и SOS');
console.log('# КОНТРОЛ "здравей как си" →', JSON.stringify(контрол2),
  контрол2.length === 0 ? 'ОК (не дава на глупости)' : 'подозрително');
if (!контрол.length) throw new Error('уредът е сляп — спирам');

const ИЗР = [
  'не диша', 'спря да диша', 'посиня и не диша', 'задави се с хапка',
  'разтърсих го', 'разтърсих бебето от нерви', 'изпуснах бебето',
  'падна от масата', 'не реагира', 'отпуснато е и не реагира', 'гърчи се',
  'давя го от водата', 'извадих го от водата',
  'удави се във ваната', 'извадих го от водата и не диша', 'потъна във ваната',
];
console.log('\n# кой чип „📄" излиза под тревогата (само когато НЯМА сценарий):');
for (const т of ИЗР) {
  let r;
  try { r = W.__ПОДКАРТА(т, 'Здраве и SOS'); } catch (e) { r = 'ГРЪМНА: ' + e.message; }
  const карта = Array.isArray(r) ? (r[0] ? r[0].id + ' («' + r[0].label + '»)' : 'НИЩО') : r;
  const e = W.BL_MATCH(т, 'Здраве и SOS');
  console.log('   ' + т.padEnd(34) + ' | чип: ' + карта + '  | BL_MATCH: ' + (e ? e.id : 'няма') + ' | слабо: ' + W.BL_SLABO());
}

// ═══ има ли в базата запис за реанимация и как се стига до него ═══
const KB = W.BL_KB || W.KB;
const реан = KB.entries.filter(e => /реанимац|не диша и не реагира|натиска\s*:\s*2|вдишвания/i.test(
  (e.title || '') + ' ' + (e.core || '') + ' ' + (e.tip || '') + ' ' + (e.follow || '')));
console.log('\n# записи в базата, които говорят за реанимация:', реан.length);
реан.forEach(e => console.log('   ' + e.id + ' [' + e.room + '] — ' + e.title));

const вода = KB.entries.filter(e => /удав|потъ|извади[а-я]* от водата|давене във вода/i.test(
  (e.title || '') + ' ' + (e.keys || []).join(' ')));
console.log('\n# записи за удавяне/вода:', вода.length);
вода.forEach(e => console.log('   ' + e.id + ' [' + e.room + '] — ' + e.title));

// ═══ колко от червените флагове са „не диша / не реагира" тип ═══
const rf = KB.redFlags || [];
console.log('\n# общо червени флага в базата:', rf.length);
const дишане = rf.filter(k => /не диша|спря да диша|спира да диша|посин|безсъзнан|не реагира|припад|съзнание/i.test(k));
console.log('# от тях за дишане/съзнание:', дишане.length, '→', дишане.join(' · '));
const удав = rf.filter(k => /удав|потъ|вода/i.test(k));
console.log('# от тях за вода/удавяне:', удав.length, '→', (удав.join(' · ') || 'НИТО ЕДИН'));
const изпусн = rf.filter(k => /изпусна|изтърва|падна ми от ръц/i.test(k));
console.log('# от тях за изпускане от ръце:', изпусн.length, '→', (изпусн.join(' · ') || 'НИТО ЕДИН'));
