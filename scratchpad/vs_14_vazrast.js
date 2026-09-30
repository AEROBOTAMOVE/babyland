// Възрастовата рамка на картата пази ли? mb-navyn е до 3 месеца.
const { zaredi } = require('../dev/pyasachnik.js');
const A = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } });  // ~10 м.
const D = zaredi(null, { памет: { bl_baby: { birth: '2024-09-20' } } });  // ~24 м.
const e = (A.BL_KB || A.KB).entries;
const c = e.find(x => x.id === 'mb-navyn');
console.log('mb-navyn: от=' + c.от + ' до=' + c.до + ' · ' + c.title);
for (const [име, W] of [['A 10м', A], ['D 24м', D]]) {
  const r = W.BL_MATCH('кога може навън с новороденото', 'Моето бебе');
  console.log('  ' + име + ' → ' + (r ? r.id + ' (до=' + r.до + ')' : 'ТИШИНА'));
}
// колко карти в двете стаи излизат ИЗВЪН рамката си при A(10м)?
let извън = 0, проверени = 0;
for (const к of e.filter(x => x.room === 'Моето бебе' || x.room === 'Инструменти')) {
  const ключ = (к.keys || []).find(k => String(k).length > 10);
  if (!ключ) continue;
  const r = A.BL_MATCH(ключ, к.room);
  if (!r) continue;
  проверени++;
  const до = r.до, от = r.от;
  if ((typeof до === 'number' && до < 10) || (typeof от === 'number' && от > 10)) {
    извън++;
    if (извън <= 12) console.log('  ИЗВЪН РАМКАТА: ' + r.id + ' (' + от + '..' + до + ') « ' + r.title + ' »  ← от « ' + ключ + ' »');
  }
}
console.log('\nПроверени маршрути: ' + проверени + ' · извеждат карта извън възрастовата рамка на майка с бебе 10 м.: ' + извън);
