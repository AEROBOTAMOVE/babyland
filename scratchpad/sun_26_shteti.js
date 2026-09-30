'use strict';
// ЩЕТИ: развалят ли 130-те нови ключа + преместванията нещо, което СЕГА работи?
// Взимам по 3 ключа от ВСЯКА карта в базата (1621 карти) и меря дали още стига до своята.
const path = require('path'), fs = require('fs');
const { zaredi } = require(path.join(path.resolve(__dirname, '..'), 'dev/pyasachnik.js'));
const НОВИ = JSON.parse(fs.readFileSync(path.join(__dirname, 'klyuchove_sun.json'), 'utf8'));
const ПРЕМ = JSON.parse(fs.readFileSync(path.join(__dirname, 'premestvane_sun.json'), 'utf8'));

function зареди(сПромяна) {
  const A = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } });
  const KB = A.BL_KB || A.KB, поId = new Map(KB.entries.map(e => [e.id, e]));
  if (сПромяна) {
    for (const [id, ks] of Object.entries(НОВИ)) { const e = поId.get(id); if (e) e.keys = (e.keys || []).concat(ks); }
    for (const { от, към, ключове } of ПРЕМ) {
      const a = поId.get(от), b = поId.get(към); if (!a) continue;
      a.keys = (a.keys || []).filter(k => !ключове.includes(k));
      if (b) b.keys = (b.keys || []).concat(ключове.filter(k => !(b.keys || []).includes(k)));
    }
  }
  return A;
}
// пробите се вземат от ЧИСТАТА база, за да не си меря собствените добавки
const чист = зареди(false);
const KBч = чист.BL_KB || чист.KB;
const проби = [];
for (const e of KBч.entries) {
  const ks = (e.keys || []).filter(k => k.length >= 14);
  for (const k of ks.slice(0, 3)) проби.push([k, e.id, e.room]);
}
console.log('проби: ' + проби.length + ' ключа от ' + KBч.entries.length + ' карти');

const A0 = зареди(false), A1 = зареди(true);
let преди = 0, след = 0; const развалени = [], поправени = [];
for (const [k, id, room] of проби) {
  const a = A0.BL_MATCH(k, room), b = A1.BL_MATCH(k, room);
  const ок0 = !!(a && a.id === id), ок1 = !!(b && b.id === id);
  if (ок0) преди++; if (ок1) след++;
  if (ок0 && !ок1) развалени.push([k, id, b ? b.id : 'ТИШИНА']);
  if (!ок0 && ок1) поправени.push([k, id, a ? a.id : 'ТИШИНА']);
}
console.log('  стига до своята карта ПРЕДИ: ' + преди + '/' + проби.length + '  (' + (100 * преди / проби.length).toFixed(2) + '%)');
console.log('  стига до своята карта СЛЕД : ' + след + '/' + проби.length + '  (' + (100 * след / проби.length).toFixed(2) + '%)');
console.log('\nРАЗВАЛЕНИ: ' + развалени.length);
for (const [k, id, сега] of развалени) console.log('  «' + k + '»\n     беше ' + id + ' → сега ' + сега);
console.log('\nПОПРАВЕНИ (странична полза): ' + поправени.length);
for (const [k, id, беше] of поправени.slice(0, 20)) console.log('  «' + k + '»\n     беше ' + беше + ' → сега ' + id);
fs.writeFileSync(path.join(__dirname, 'sun_26_shteti.json'), JSON.stringify({ проби: проби.length, преди, след, развалени, поправени }, null, 1), 'utf8');
