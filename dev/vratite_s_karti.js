// Изважда 146-те ВРАТИ заедно със СЪДЪРЖАНИЕТО на картата, до която водят —
// за да може да се съди дали картата е ДОБЪР отговор на въпроса, или вратата
// е права. Без текста това е гадаене.
const { zaredi } = require('./pyasachnik.js');
const fs = require('fs');
const W = zaredi(null);
const KB = W.BL_KB || W.KB;
const поId = {};
(KB.entries || []).forEach(e => { поId[e.id] = e; });

const данни = require('./_nedostig.json');
const изход = данни.врати.map(v => {
  const e = поId[v.id] || {};
  const текст = String(e.core || e.text || e.body || '').replace(/\s+/g, ' ').trim();
  return {
    vapros: v.t,
    staya_na_mamata: v.стая,
    karta_id: v.id,
    karta_staya: v.към,
    karta_zaglavie: e.t || e.title || '',
    karta_tekst: текст.slice(0, 700),
  };
});
fs.writeFileSync('dev/_vrati_s_karti.json', JSON.stringify(изход, null, 1));
console.log('записани ' + изход.length + ' врати с текст в dev/_vrati_s_karti.json');
console.log('без намерена карта: ' + изход.filter(x => !x.karta_zaglavie).length);
console.log('');
console.log(JSON.stringify(изход[0], null, 1).slice(0, 700));
