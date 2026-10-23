// zn8a · само чете: строи индекса „кофи по първите 4 букви“ както js/helper.js (индекс()) — без и със стажа —
// и показва колко карти има всяка кофа за думите от въпросите в zn8a_test.json + дадени думи.
// Кофа над 12% от базата се хвърля (тогава думата НЕ ограничава кандидатите).
'use strict';
const fs = require('fs'), path = require('path');
const КОРЕН = path.resolve(__dirname, '../../..'); process.chdir(КОРЕН);
const { zaredi } = require(path.join(КОРЕН, 'dev/pyasachnik.js'));
const W = zaredi(null);
const СТАЖ = JSON.parse(fs.readFileSync('dev/nahodki/karti_zn8a.json', 'utf8'));
function кофи(entries) {
  const m = new Map();
  for (const e of entries) {
    const думи = new Set();
    for (const k of (e.keys || [])) String(k).toLowerCase().split(/[^а-яa-z0-9]+/).forEach(w => { if (w.length >= 3) думи.add(w); });
    String(e.title || '').toLowerCase().split(/[^а-яa-z0-9]+/).forEach(w => { if (w.length >= 3) думи.add(w); });
    for (const w of думи) { const к = w.slice(0, Math.min(4, w.length)); if (!m.has(к)) m.set(к, new Set()); m.get(к).add(e.id); }
  }
  return m;
}
const преди = кофи(W.KB.entries), след = кофи(W.KB.entries.concat(СТАЖ));
const таванП = Math.max(40, Math.round(W.KB.entries.length * 0.12)), таванС = Math.max(40, Math.round((W.KB.entries.length + СТАЖ.length) * 0.12));
const думи = new Set(process.argv.slice(2));
for (const т of JSON.parse(fs.readFileSync('dev/znanie/vlivane/zn8a_test.json', 'utf8'))) for (const w of т.q.split(/\s+/)) if (w.length >= 3) думи.add(w);
const ред = [];
for (const w of думи) {
  const к = w.slice(0, Math.min(4, w.length));
  const п = (преди.get(к) || new Set()).size, с = (след.get(к) || new Set()).size;
  const моиВ = [...(след.get(к) || [])].filter(id => id.startsWith('zn8a')).length;
  ред.push(к.padEnd(6) + ' ' + w.padEnd(16) + ' преди ' + String(п).padStart(4) + (п > таванП ? ' (хвърлена)' : п ? '           ' : ' (няма)    ') +
    ' · след ' + String(с).padStart(4) + (с > таванС ? ' (хвърлена)' : '') + ' · мои в нея ' + моиВ);
}
console.log('таван преди ' + таванП + ' · след ' + таванС + '\n' + [...new Set(ред)].sort().join('\n'));
// кофи, които минават тавана заради стажа (промяна на кандидатите за чужди въпроси)
const прехвърлени = [];
for (const [к, s] of след) { const п = (преди.get(к) || new Set()).size; if ((п <= таванП) !== (s.size <= таванС)) прехвърлени.push(к + ' ' + п + '→' + s.size); }
console.log('\nкофи, които сменят състоянието си (под/над тавана) заради стажа: ' + (прехвърлени.join(' · ') || 'нито една'));
