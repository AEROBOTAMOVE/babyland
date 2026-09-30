'use strict';
// Двете мерки си противоречат за въпрос 50. Проверявам дали BL_MATCH ПОМНИ
// последната карта и я потиска при втори въпрос.
const path = require('path'), fs = require('fs');
const { zaredi } = require(path.join(path.resolve(__dirname, '..'), 'dev/pyasachnik.js'));
const НОВИ = JSON.parse(fs.readFileSync(path.join(__dirname, 'klyuchove_sun.json'), 'utf8'));
function нов() {
  const A = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } });
  const KB = A.BL_KB || A.KB, поId = new Map(KB.entries.map(e => [e.id, e]));
  for (const [id, ks] of Object.entries(НОВИ)) { const e = поId.get(id); if (e) e.keys = (e.keys || []).concat(ks); }
  return A;
}
const q49 = 'кво значи прозорец на съня', q50 = 'как да позная че му се спи';

let A = нов();
console.log('САМ Q50           : ' + (x => x ? x.id : 'ТИШИНА')(A.BL_MATCH(q50, 'Развитие и игри')));

A = нов();
console.log('Q49 после Q50     : ' + (x => x ? x.id : 'ТИШИНА')(A.BL_MATCH(q49, 'Развитие и игри')) +
  '  →  ' + (x => x ? x.id : 'ТИШИНА')(A.BL_MATCH(q50, 'Развитие и игри')));

A = нов();
console.log('Q50 два пъти      : ' + (x => x ? x.id : 'ТИШИНА')(A.BL_MATCH(q50, 'Развитие и игри')) +
  '  →  ' + (x => x ? x.id : 'ТИШИНА')(A.BL_MATCH(q50, 'Развитие и игри')));

A = нов();
console.log('Q49 → друг → Q50  : ' + (x => x ? x.id : 'ТИШИНА')(A.BL_MATCH(q49, 'Развитие и игри')) +
  '  →  ' + (x => x ? x.id : 'ТИШИНА')(A.BL_MATCH('къпането', 'Моето бебе')) +
  '  →  ' + (x => x ? x.id : 'ТИШИНА')(A.BL_MATCH(q50, 'Развитие и игри')));

// Колко от 60-те са засегнати от потискането? Пусни всеки във ПРЯСЪН пясъчник.
const стар = JSON.parse(fs.readFileSync(path.join(__dirname, 'sun_1_60.json'), 'utf8'));
const ОЧАК = JSON.parse(fs.readFileSync(path.join(__dirname, 'sun_ochakvano.json'), 'utf8'));
let вярно = 0, чужда = 0, тишина = 0; const разлика = [];
const редица = JSON.parse(fs.readFileSync(path.join(__dirname, 'sun_16_sled.json'), 'utf8'));
for (let i = 0; i < стар.length; i++) {
  const B = нов();
  const e = B.BL_MATCH(стар[i].q, стар[i].стая);
  const id = e ? e.id : null;
  if (!e) тишина++; else if (ОЧАК[i].includes(e.id)) вярно++; else чужда++;
  if (id !== редица[i].след) разлика.push([i + 1, стар[i].q, 'в редица: ' + (редица[i].след || 'ТИШИНА') + '  сам: ' + (id || 'ТИШИНА')]);
}
console.log('\nВСЕКИ ВЪПРОС В ПРЯСЪН ПЯСЪЧНИК (без съседи):');
console.log('  вярно ' + вярно + ' | чужда ' + чужда + ' | тишина ' + тишина);
console.log('\nРАЗЛИКА редица ↔ сам: ' + разлика.length);
for (const [n, q, д] of разлика) console.log('  ' + n + '. ' + q + '\n     ' + д);
