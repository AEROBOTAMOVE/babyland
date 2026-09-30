const { zaredi } = require('../dev/pyasachnik.js');
const A = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } });
const e = (A.BL_KB || A.KB).entries;
const t = c => [c.title, c.core, c.tip, c.follow, (c.keys||[]).join(' ')].join(' ').toLowerCase();
const pr = (име, ре) => { console.log('\n### ' + име);
  for (const c of e) { const s = t(c); for (const r of ре) { const m = s.match(r); if (m) console.log('  ' + c.room + '/' + c.id + ' :: …' + s.slice(Math.max(0,m.index-60), m.index+m[0].length+60).replace(/\s+/g,' ') + '…'); } } };
pr('плюене като игра', [/плю\w*.{0,60}(игра|смее|реакция|внимание|нарочно)/, /(смее|нарочно).{0,60}плю\w*/, /пръска.{0,30}храна/]);
pr('изхвърлена храна / вина', [/изхвърл\w*.{0,60}(храна|яден|пюре|чиния)/, /(храна|пюре|яден)\w*.{0,60}изхвърл/, /жал.{0,30}(храна|яден)/]);
