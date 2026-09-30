// Оглед: какви карти има в стая „Бременност“ + профил на бременна (B)
const fs = require('fs'), path = require('path');
const { zaredi } = require('../dev/pyasachnik.js');
const B = zaredi(null, { памет: { bl_lmp: '2026-04-01' } });
const E = (B.BL_KB || B.KB).entries;
console.log('ВСИЧКИ КАРТИ: ' + E.length);
const стаи = {};
for (const c of E) стаи[c.room] = (стаи[c.room] || 0) + 1;
console.log(JSON.stringify(стаи, null, 1));
const бр = E.filter(c => c.room === 'Бременност');
console.log('\nБРЕМЕННОСТ: ' + бр.length + ' карти');
const ред = bр => bр;
const out = бр.map(c => ({ id: c.id, title: c.title, keys: (c.keys || []).length, от: c.от, до: c.до }));
fs.writeFileSync(path.join(__dirname, 'br_karti.json'), JSON.stringify(бр.map(c => ({ id: c.id, title: c.title, keys: c.keys || [], core: String(c.core || '').slice(0, 400), от: c.от, до: c.до })), null, 1), 'utf8');
for (const c of out) console.log('  ' + c.id.padEnd(40) + ' k=' + String(c.keys).padStart(3) + '  ' + c.title);
