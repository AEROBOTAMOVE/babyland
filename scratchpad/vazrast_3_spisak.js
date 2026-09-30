const { zaredi } = require('../dev/pyasachnik.js');
const W = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } });
const E = (W.BL_KB || W.KB).entries;
const без = E.filter(e => e.от == null && e.до == null);
const по = {};
без.forEach(e => (по[e.room || '(без)'] = по[e.room || '(без)'] || []).push(e));
const само = process.argv[2];
for (const [r, a] of Object.entries(по)) {
  if (само && r !== само) continue;
  console.log('\n#### ' + r + ' (' + a.length + ')');
  a.forEach((e, i) => console.log(String(i + 1).padStart(3) + ' ' + e.id.padEnd(34) + ' | ' + (e.title || '')));
}
