'use strict';
// САМО В ПАМЕТТА. Нищо не се записва в js/kb.js. Добавям предложените ключове
// в заредения пясъчник и пускам същите 60 въпроса пак.
const path = require('path'), fs = require('fs');
const { zaredi } = require(path.join(path.resolve(__dirname, '..'), 'dev/pyasachnik.js'));
const A = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } });
const KB = A.BL_KB || A.KB;
const поId = new Map(KB.entries.map(e => [e.id, e]));
const НОВИ = JSON.parse(fs.readFileSync(path.join(__dirname, 'klyuchove_sun.json'), 'utf8'));

// контрола ПРЕДИ пипане
const преди = A.BL_MATCH('спи по 40 минути и се буди', 'Моето бебе');
let добавени = 0;
for (const [id, ks] of Object.entries(НОВИ)) {
  const e = поId.get(id); if (!e) continue;
  e.keys = (e.keys || []).concat(ks); добавени += ks.length;
}
const след = A.BL_MATCH('спи по 40 минути и се буди', 'Моето бебе');
console.log('ХВАЩА ЛИ СЕ ПОДМЯНАТА? контролна фраза «спи по 40 минути и се буди»');
console.log('  преди: ' + (преди ? преди.id : 'ТИШИНА') + '   след: ' + (след ? след.id : 'ТИШИНА'));
if (!след || след.id !== 'sn-cikli-40min') {
  console.log('  ⚠ ПОДМЯНАТА НЕ СЕ ХВАЩА в паметта — мярката по-долу е НЕВАЛИДНА.');
  process.exit(1);
}
console.log('  ✔ хваща се. добавени ключа: ' + добавени + '\n');

const ОЧАКВАНО = JSON.parse(fs.readFileSync(path.join(__dirname, 'sun_ochakvano.json'), 'utf8'));
const стар = JSON.parse(fs.readFileSync(path.join(__dirname, 'sun_1_60.json'), 'utf8'));
let вярно = 0, чужда = 0, тишина = 0;
const ред = [];
for (let i = 0; i < стар.length; i++) {
  const q = стар[i].q, ст = стар[i].стая, очак = ОЧАКВАНО[i];
  const e = A.BL_MATCH(q, ст);
  let клас;
  if (!e) клас = 'ТИШИНА';
  else if (очак.includes(e.id)) клас = 'ВЯРНО';
  else клас = 'ЧУЖДА';
  if (клас === 'ВЯРНО') вярно++; else if (клас === 'ЧУЖДА') чужда++; else тишина++;
  ред.push({ n: i + 1, q, преди: стар[i].id, след: e ? e.id : null, клас, очак });
}
console.log('СЛЕД ПРЕДЛОЖЕНИТЕ КЛЮЧОВЕ (в паметта):');
for (const r of ред) {
  const знак = r.клас === 'ВЯРНО' ? '✔' : (r.клас === 'ТИШИНА' ? '·' : '✗');
  console.log('  ' + знак + ' ' + String(r.n).padStart(2) + '. ' + (r.преди === r.след ? '' : '[' + (r.преди || 'ТИШИНА') + ' → ' + (r.след || 'ТИШИНА') + '] ') + r.q);
}
console.log('\nСЛЕД: вярно ' + вярно + ' | чужда ' + чужда + ' | тишина ' + тишина + '  (от ' + стар.length + ')');
fs.writeFileSync(path.join(__dirname, 'sun_16_sled.json'), JSON.stringify(ред, null, 1), 'utf8');
