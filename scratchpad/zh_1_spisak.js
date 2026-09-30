'use strict';
const path = require('path'), fs = require('fs');
const КОРЕН = path.resolve(__dirname, '..');
const { zaredi } = require(path.join(КОРЕН, 'dev/pyasachnik.js'));
const W = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } });
const KB = W.BL_KB || W.KB;
const СТАИ = ['Дневник на мама', 'Жената в мен'];
let out = '';
for (const s of СТАИ) {
  const a = KB.entries.filter(e => e.room === s);
  out += '\n═══════ ' + s + '  (' + a.length + ') ═══════\n';
  for (const e of a) out += e.id.padEnd(44) + ' | ' + (e.keys||[]).length + 'к | ' + e.title + '\n';
}
fs.writeFileSync(path.join(__dirname, 'zh_spisak.txt'), out, 'utf8');
console.log(out.length, 'байта');
console.log(out.slice(0, 200));
