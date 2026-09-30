'use strict';
// ФИНАЛНА МЯРКА. Всеки от 60-те в ПРЯСЪН пясъчник, с предложените ключове
// И с предложените премествания. Само в паметта — js/kb.js не се пипа.
const path = require('path'), fs = require('fs');
const { zaredi } = require(path.join(path.resolve(__dirname, '..'), 'dev/pyasachnik.js'));
const НОВИ = JSON.parse(fs.readFileSync(path.join(__dirname, 'klyuchove_sun.json'), 'utf8'));
const ПРЕМ = JSON.parse(fs.readFileSync(path.join(__dirname, 'premestvane_sun.json'), 'utf8'));
const стар = JSON.parse(fs.readFileSync(path.join(__dirname, 'sun_1_60.json'), 'utf8'));
const ОЧАК = JSON.parse(fs.readFileSync(path.join(__dirname, 'sun_ochakvano.json'), 'utf8'));
function нов() {
  const A = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } });
  const KB = A.BL_KB || A.KB, поId = new Map(KB.entries.map(e => [e.id, e]));
  for (const [id, ks] of Object.entries(НОВИ)) { const e = поId.get(id); if (e) e.keys = (e.keys || []).concat(ks); }
  for (const { от, към, ключове } of ПРЕМ) {
    const a = поId.get(от), b = поId.get(към); if (!a || !b) continue;
    a.keys = (a.keys || []).filter(k => !ключове.includes(k));
    b.keys = (b.keys || []).concat(ключове.filter(k => !(b.keys || []).includes(k)));
  }
  return A;
}
// КОНТРОЛА върху самия уред
{
  const A = нов();
  const п = A.BL_MATCH('бебето не спи през нощта', 'Моето бебе');
  const о = A.BL_MATCH('ъъъ бърбъръ клюпнидряс фъртуна зюмбюл', 'Моето бебе');
  console.log('КОНТРОЛА+ ' + (п ? п.id : 'NULL ← ПАЗАЧЪТ ГЪРМИ') + '   КОНТРОЛА− ' + (о ? о.id + ' ← ПАЗАЧЪТ ГЪРМИ' : 'NULL ок'));
  if (!п || о) process.exit(1);
}
let вярно = 0, чужда = 0, тишина = 0; const ред = [];
for (let i = 0; i < стар.length; i++) {
  const e = нов().BL_MATCH(стар[i].q, стар[i].стая);
  let клас;
  if (!e) { клас = 'ТИШИНА'; тишина++; }
  else if (ОЧАК[i].includes(e.id)) { клас = 'ВЯРНО'; вярно++; }
  else { клас = 'ЧУЖДА'; чужда++; }
  ред.push({ n: i + 1, q: стар[i].q, преди: стар[i].id, след: e ? e.id : null, клас });
  console.log('  ' + (клас === 'ВЯРНО' ? '✔' : клас === 'ТИШИНА' ? '·' : '✗') + ' ' + String(i + 1).padStart(2) +
    '. ' + (стар[i].id === (e && e.id) ? '' : '[' + (стар[i].id || 'ТИШИНА') + ' → ' + (e ? e.id : 'ТИШИНА') + '] ') + стар[i].q);
}
fs.writeFileSync(path.join(__dirname, 'sun_23_final.json'), JSON.stringify(ред, null, 1), 'utf8');
console.log('\nФИНАЛНО: вярно ' + вярно + ' | чужда ' + чужда + ' | тишина ' + тишина + '   (от ' + стар.length + ')');
