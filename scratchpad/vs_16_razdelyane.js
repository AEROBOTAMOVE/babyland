// РАЗДЕЛЯНЕТО — брои от файловете, не от главата ми.
const fs = require('fs');
const R = JSON.parse(fs.readFileSync('vsekidnevie_rezultat.json','utf8'));
const О = JSON.parse(fs.readFileSync('vs_ochakvania.json','utf8'));
const верни=[], чужди=[], тишина=[];
for (const o of R) {
  const очак = О[String(o.n)];
  if (!o.a) тишина.push(o);
  else if (!очак) верни.push(o);
  else чужди.push(o);
}
console.log('ВСИЧКО: ' + R.length);
console.log('  (а) ВЕРЕН ОТГОВОР : ' + верни.length);
console.log('  (б) ЧУЖДА КАРТА   : ' + чужди.length);
console.log('  (в) ТИШИНА        : ' + тишина.length);
console.log('\n═══ (б) ЧУЖДА КАРТА — води другаде ═══');
for (const o of чужди) console.log(' ' + String(o.n).padStart(2) + ' [' + o.tema + '] ' + o.q + '\n      получи: ' + o.a.room + '::' + o.a.id + ' « ' + o.a.title + ' »\n      трябва: ' + О[String(o.n)]);
console.log('\n═══ (в) ТИШИНА ═══');
for (const o of тишина) console.log(' ' + String(o.n).padStart(2) + ' [' + o.tema + '] ' + o.q + '\n      трябва: ' + (О[String(o.n)]||'—'));
console.log('\n═══ (а) ВЕРЕН ═══');
for (const o of верни) console.log(' ' + String(o.n).padStart(2) + ' [' + o.tema + '] ' + o.q + ' → ' + o.a.room + '::' + o.a.id);
// по подтеми
const по = {};
for (const o of R) { const к = о => О[String(о.n)] ? (о.a?'чужда':'тишина') : 'верен'; (по[o.tema]=по[o.tema]||{верен:0,чужда:0,тишина:0})[к(o)]++; }
console.log('\n═══ ПО ПОДТЕМИ (верен / чужда / тишина) ═══');
for (const [t,v] of Object.entries(по)) console.log('  ' + t.padEnd(14) + v.верен + ' / ' + v.чужда + ' / ' + v.тишина);
