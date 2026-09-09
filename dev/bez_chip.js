// Кои карти нямат чипове — с достатъчно контекст, за да им се предложат
// съседи, без агентът да отваря всяка поотделно.
const fs = require('fs');
const { zaredi } = require('./pyasachnik.js');
const W = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } });
const KB = W.BL_KB || W.KB;
const карти = KB.entries || [];
const без = карти.filter(e => !((e.chips || []).length));

const тяло = e => String(e.core || '').replace(/\s+/g, ' ');
const изход = без.map(e => ({
  id: e.id,
  room: e.room,
  title: String(e.title || e.t || ''),
  core: тяло(e).slice(0, 320),
  keys: (e.keys || []).slice(0, 6),
  // съседите в СЪЩАТА стая — оттам най-често излиза добрият чип
  sasedi: карти.filter(x => x.room === e.room && x.id !== e.id)
    .map(x => ({ id: x.id, t: String(x.title || x.t || '') })).slice(0, 0),
}));
fs.writeFileSync('dev/_bez_chip.json', JSON.stringify(изход, null, 1));

console.log('');
console.log('🔗 КАРТИ БЕЗ ЧИПОВЕ: ' + без.length + ' от ' + карти.length);
const поСтаи = {}; без.forEach(e => { поСтаи[e.room] = (поСтаи[e.room] || 0) + 1; });
Object.entries(поСтаи).sort((a, b) => b[1] - a[1]).forEach(([r, n]) => console.log('   ' + String(n).padStart(3) + '  ' + r));
console.log('');
console.log('   → dev/_bez_chip.json');
console.log('');
// колко чипа има средно една карта СЪС чипове — за да знам каква е нормата
const със = карти.filter(e => (e.chips || []).length);
const общо = със.reduce((a, e) => a + e.chips.length, 0);
console.log('   нормата в базата: ' + със.length + ' карти с чипове · средно '
  + (общо / със.length).toFixed(2) + ' чипа · най-много ' + Math.max(...със.map(e => e.chips.length)));
// и колко от съществуващите чипове сочат в НИЩОТО (мълчаливата смърт)
const има = new Set(карти.map(e => e.id));
const счупени = [];
за: for (const e of със) for (const c of e.chips) if (!има.has(String(c))) счупени.push(e.id + ' → ' + c);
console.log('   счупени чипове в ЖИВАТА база: ' + счупени.length + (счупени.length ? ' — ' + счупени.slice(0, 5).join(' · ') : ' ✅'));
console.log('');
console.log('── първите 20 без чип ──');
без.slice(0, 20).forEach(e => console.log('   ' + e.id.padEnd(38) + '[' + e.room + ']  ' + String(e.title || e.t || '').slice(0, 44)));
