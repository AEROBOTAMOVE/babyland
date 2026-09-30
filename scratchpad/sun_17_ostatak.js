'use strict';
const path = require('path'), fs = require('fs');
const { zaredi } = require(path.join(path.resolve(__dirname, '..'), 'dev/pyasachnik.js'));
const A = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } });
const KB = A.BL_KB || A.KB;
const поId = new Map(KB.entries.map(e => [e.id, e]));
const НОВИ = JSON.parse(fs.readFileSync(path.join(__dirname, 'klyuchove_sun.json'), 'utf8'));
for (const [id, ks] of Object.entries(НОВИ)) { const e = поId.get(id); if (e) e.keys = (e.keys || []).concat(ks); }

console.log('1) В предложението ли е «как да позная че му се спи»? ' +
  (JSON.stringify(НОВИ).includes('как да позная че му се спи') ? 'ДА' : 'НЕ'));
for (const q of ['как да позная че му се спи', 'как да разбера че му се спи', 'как да позная кога му се спи',
  'откъде да знам че му се спи', 'позная че му се спи', 'как да позная че му се спи вече']) {
  const e = A.BL_MATCH(q, 'Развитие и игри'), f = A.BL_MATCH(q, 'Моето бебе');
  console.log('   РИ ' + (e ? e.id : 'ТИШИНА').padEnd(22) + ' МБ ' + (f ? f.id : 'ТИШИНА').padEnd(22) + ' ← ' + q);
}

console.log('\n2) Кой държи «буди се щом го сложа долу» и роднините му:');
for (const k of ['буди се щом го сложа долу', 'се буди щом го сложа долу', 'пищи като го слагам',
  'пищи щом го сложа', 'заплаква щом го сложа', 'крещи щом го сложа долу', 'пищи като го слагам да спи']) {
  const носи = KB.entries.filter(e => (e.keys || []).includes(k)).map(e => e.id + ' «' + e.title + '»');
  console.log('   «' + k + '» → ' + (носи.join(' + ') || '(никой)'));
}

console.log('\n3) Къде отива 46 сега и какво липсва:');
for (const q of ['хващам го на сън и го слагам но пак се буди', 'хващам го на сън и го слагам',
  'слагам го заспал и се буди', 'прехвърлям го в леглото и се буди', 'как се прехвърля от ръце в леглото']) {
  const e = A.BL_MATCH(q, 'Моето бебе');
  console.log('   ' + (e ? e.id + ' «' + e.title + '»' : 'ТИШИНА').padEnd(52) + ' ← ' + q);
}

console.log('\n4) Има ли КАРТА за ритащи крачета/неспокоен сън при БЕБЕ (не бременна):');
const кандидати = KB.entries.filter(e => /крак|крач|рита|неспокой|мърда|върти/i.test(e.title + ' ' + (e.keys || []).join(' ')));
for (const e of кандидати) console.log('   ' + e.id + ' [' + e.room + '] «' + e.title + '»');
