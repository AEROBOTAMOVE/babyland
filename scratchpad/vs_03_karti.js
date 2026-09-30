const { zaredi } = require('../dev/pyasachnik.js');
const A = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } });
const e = (A.BL_KB || A.KB).entries;
for (const id of process.argv.slice(2)) {
  const c = e.find(x => x.id === id);
  if (!c) { console.log('!!! НЯМА ТАКАВА КАРТА: ' + id); continue; }
  console.log('\n──── ' + c.id + ' | ' + c.room + ' | ' + c.от + '..' + c.до + ' | ' + c.title);
  console.log('KEYS(' + c.keys.length + '): ' + c.keys.join(' · '));
  console.log('CORE: ' + String(c.core).slice(0, 420));
}
