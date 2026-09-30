'use strict';
// Хипотеза: въпрос 45 НЕ се лекува с нов ключ, а с ПРЕМЕСТВАНЕ на чужди ключове
// от mb-san «Колко трябва да спи бебето?» към x1-slagane-bez-budene.
// Само в паметта. Нищо не се записва.
const path = require('path'), fs = require('fs');
const { zaredi } = require(path.join(path.resolve(__dirname, '..'), 'dev/pyasachnik.js'));
const НОВИ = JSON.parse(fs.readFileSync(path.join(__dirname, 'klyuchove_sun.json'), 'utf8'));
const ДОП = { 'x1-slagane-bez-budene': ['буди се щом го сложа долу защо', 'защо се буди щом го сложа долу', 'хващам го на сън и го слагам но пак се буди', 'слагам го заспал и пак се буди', 'нося го заспал до леглото и се буди'] };
const ЗА_ПРЕМЕСТВАНЕ = {
  'mb-san': { към: 'x1-slagane-bez-budene', ключове: ['буди се щом го сложа долу', 'се буди щом го сложа долу', 'пищи като го слагам', 'пищи щом го сложа', 'пищи като го сложа', 'заплаква щом го сложа', 'крещи щом го сложа долу', 'пищи като го слагам да спи'] },
  'sn-potene': { към: 'sn-ranno-sabuzhdane', ключове: ['се буди в 5 сутринта'] },
};
function нов(режим) {
  const A = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } });
  const KB = A.BL_KB || A.KB, поId = new Map(KB.entries.map(e => [e.id, e]));
  for (const [id, ks] of Object.entries(НОВИ)) { const e = поId.get(id); if (e) e.keys = (e.keys || []).concat(ks); }
  for (const [id, ks] of Object.entries(ДОП)) { const e = поId.get(id); if (e) e.keys = (e.keys || []).concat(ks); }
  if (режим === 'премести') for (const [от, { към, ключове }] of Object.entries(ЗА_ПРЕМЕСТВАНЕ)) {
    const a = поId.get(от), b = поId.get(към);
    a.keys = (a.keys || []).filter(k => !ключове.includes(k));
    b.keys = (b.keys || []).concat(ключове.filter(k => !(b.keys || []).includes(k)));
  }
  return A;
}
const проби = [
  ['буди се щом го сложа долу защо', 'x1-slagane-bez-budene'],
  ['буди се щом го сложа долу', 'x1-slagane-bez-budene'],
  ['пищи като го слагам да спи', 'x1-slagane-bez-budene'],
  ['бебето се буди в 5 сутринта и не заспива повече', 'sn-ranno-sabuzhdane'],
  // КОНТРОЛА: mb-san трябва да СИ ОСТАНЕ достижима за своята тема
  ['колко трябва да спи бебето', 'mb-san'],
  ['колко спи бебето', 'mb-san'],
  // КОНТРОЛА: sn-potene трябва да СИ ОСТАНЕ достижима
  ['поти се докато спи', 'sn-potene'],
  ['потна главичка след заспиване', 'sn-potene'],
];
console.log('ПРЕДИ преместване → СЛЕД преместване   (очаквана карта)');
for (const [q, очак] of проби) {
  const a = нов('само-нови').BL_MATCH(q, 'Моето бебе');
  const b = нов('премести').BL_MATCH(q, 'Моето бебе');
  const зн = x => (x && x.id === очак) ? '✔' : '✗';
  console.log('  ' + зн(a) + ' ' + (a ? a.id : 'ТИШИНА').padEnd(24) + ' → ' + зн(b) + ' ' + (b ? b.id : 'ТИШИНА').padEnd(24) + '  (' + очак + ')\n      ← ' + q);
}
