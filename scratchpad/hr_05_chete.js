const { zaredi } = require('../dev/pyasachnik.js');
const A = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } });
const e = (A.BL_KB || A.KB).entries;
for (const id of process.argv.slice(2)) {
  const c = e.find(x => x.id === id);
  console.log('\n════ ' + c.id + ' | ' + c.title + ' | ' + c.от + '..' + c.до);
  console.log('CORE: ' + c.core);
  console.log('TIP: ' + String(c.tip));
}
