const { zaredi } = require('../dev/pyasachnik.js');
const B = zaredi(null, { памет: { bl_lmp: '2026-04-01' } });
const e = (B.BL_KB || B.KB).entries;
for (const id of process.argv.slice(2)) {
  const c = e.find(x => x.id === id);
  if (!c) { console.log('!!! НЯМА КАРТА: ' + id); continue; }
  console.log('\n──── ' + c.id + ' | ' + c.room + ' | ' + c.от + '..' + c.до + ' | ' + c.title);
  console.log('KEYS(' + (c.keys||[]).length + '): ' + (c.keys||[]).join(' · '));
  console.log('CORE: ' + String(c.core).replace(/\s+/g,' ').slice(0, 900));
}
