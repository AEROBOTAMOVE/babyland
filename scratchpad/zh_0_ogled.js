// САМО ЧЕТЕ. Оглед на стаите „Дневник на мама" и „Жената в мен".
'use strict';
const path = require('path');
const КОРЕН = path.resolve(__dirname, '..');
const { zaredi } = require(path.join(КОРЕН, 'dev/pyasachnik.js'));
const W = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } });
const KB = W.BL_KB || W.KB;
console.log('# общо карти:', KB.entries.length);
const поСтая = {};
for (const e of KB.entries) (поСтая[e.room] = поСтая[e.room] || []).push(e);
console.log('# стаи:');
for (const [r, a] of Object.entries(поСтая).sort((x,y)=>y[1].length-x[1].length))
  console.log('   ' + String(a.length).padStart(4) + '  ' + r);
