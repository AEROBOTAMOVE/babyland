const fs = require('fs'), path = require('path');
const { zaredi } = require('../dev/pyasachnik.js');
const ПАМ = { памет: { bl_baby: { birth: '2025-11-20' } } };
const P = JSON.parse(fs.readFileSync(path.join(__dirname, 'klyuchove_hranene.json'), 'utf8'));
const W = zaredi(null, ПАМ);
const E = (W.BL_KB || W.KB).entries;
for (const [цел, кл] of Object.entries(P)) { const c = E.find(x => x.id === цел); if (c) for (const k of кл) c.keys.push(k); }

const остатък = [
  ['колко всъщност трябва да изяде на едно хранене на осем месеца', 'zh-porcii-vazrast'],
  ['как да разбера че се е наяло а не че му е скучно', 'zh-sito'],
  ['колко мляко му е нужно след като вече яде кашички', 'zh-milk-qty'],
  ['kakav biberon da vzema za 6 meseca', 'y2-shisheta-broy'],
  ['не иска да седи в столчето и се извива', 'zh5-stolche-poza'],
  ['на пара или печено кое е по добре за мъника', 'x6-nachini-gotvene'],
  ['mojno li e da zamrazyavam gotvenoto meso za bebe', 'zh-zamraziavane'],
];
for (const [q, цел] of остатък) {
  const r = W.BL_MATCH(q, 'Захранване');
  console.log('\n« ' + q + ' »\n  ИСКАМ: ' + цел + '   ПОЛУЧАВАМ: ' + (r ? r.room + '/' + r.id + ' — ' + r.title : 'ТИШИНА'));
  if (r && r.id !== цел) console.log('  КРАДЕЦЪТ носи ключове: ' + r.keys.filter(k => q.split(' ').some(w => w.length > 3 && String(k).toLowerCase().indexOf(w.slice(0, 5)) > -1)).slice(0, 8).join(' · '));
}
// кои ключове от целевата карта УЛУЧВАТ въпроса (груб преглед)
console.log('\n─── кой ключ на целта би улучил ───');
for (const [q, цел] of остатък) {
  const c = E.find(x => x.id === цел);
  const nq = String(q).toLowerCase();
  const улучващи = c.keys.filter(k => { const n = String(k).toLowerCase(); return n.includes(' ') ? nq.includes(n) : nq.split(/\s+/).some(w => w.startsWith(n)); });
  console.log(цел + ' ← ' + (улучващи.length ? улучващи.join(' · ') : 'НИТО ЕДИН'));
}
