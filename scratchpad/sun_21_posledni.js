'use strict';
// Остатъкът: 45 и 46. Пробвам ТОЧНОТО изречение на майката като ключ.
const path = require('path'), fs = require('fs');
const { zaredi } = require(path.join(path.resolve(__dirname, '..'), 'dev/pyasachnik.js'));
const НОВИ = JSON.parse(fs.readFileSync(path.join(__dirname, 'klyuchove_sun.json'), 'utf8'));
const ДОП = {
  'x1-slagane-bez-budene': ['буди се щом го сложа долу защо', 'защо се буди щом го сложа долу',
    'хващам го на сън и го слагам но пак се буди', 'слагам го заспал и пак се буди',
    'нося го заспал до леглото и се буди']
};
function нов(сДоп) {
  const A = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } });
  const KB = A.BL_KB || A.KB, поId = new Map(KB.entries.map(e => [e.id, e]));
  for (const [id, ks] of Object.entries(НОВИ)) { const e = поId.get(id); if (e) e.keys = (e.keys || []).concat(ks); }
  if (сДоп) for (const [id, ks] of Object.entries(ДОП)) { const e = поId.get(id); if (e) e.keys = (e.keys || []).concat(ks); }
  return A;
}
// 1) свободни ли са допълнителните ключове
const A0 = зареди0();
function зареди0() { return zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } }); }
const KB0 = A0.BL_KB || A0.KB;
const зает = new Map();
for (const e of KB0.entries) for (const k of (e.keys || [])) { if (!зает.has(k)) зает.set(k, []); зает.get(k).push(e.id); }
console.log('СВОБОДНИ ЛИ СА ДОПЪЛНИТЕЛНИТЕ:');
for (const [id, ks] of Object.entries(ДОП)) for (const k of ks)
  console.log('  ' + (зает.has(k) ? 'ЗАЕТ от ' + зает.get(k).join(',') : 'свободен').padEnd(22) + ' «' + k + '»');

console.log('\n45 и 46 СЛЕД допълнителните (всеки в прясън пясъчник):');
for (const q of ['буди се щом го сложа долу защо', 'хващам го на сън и го слагам но пак се буди']) {
  const b = нов(false).BL_MATCH(q, 'Моето бебе');
  const c = нов(true).BL_MATCH(q, 'Моето бебе');
  console.log('  без доп: ' + (b ? b.id : 'ТИШИНА').padEnd(24) + ' с доп: ' + (c ? c.id : 'ТИШИНА').padEnd(24) + ' ← ' + q);
}
