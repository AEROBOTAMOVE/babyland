const { zaredi } = require('../dev/pyasachnik.js');
const A = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } });
const e = (A.BL_KB || A.KB).entries;
const стая = process.argv[2];
const f = e.filter(c => c.room === стая);
console.log('=== ' + стая + ' : ' + f.length + ' карти ===');
for (const c of f) console.log(c.id + ' | ' + c.от + '-' + c.до + ' | ' + c.title);
