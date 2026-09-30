// Проверява всеки ПРЕДЛОЖЕН ключ по две условия:
//   (1) не е зает от друга карта (точен низ в keys на която и да е карта)
//   (2) СЕГА не води до целевата карта (иначе е излишен)
// Записва само издържалите в scratchpad/klyuchove_vsekidnevie.json
const fs = require('fs');
const path = require('path');
const { zaredi } = require('../dev/pyasachnik.js');
const A = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } });
const e = (A.BL_KB || A.KB).entries;

const норм = s => String(s).toLowerCase().replace(/\s+/g, ' ').trim();
const зает = new Map();               // норм.ключ → id-та на картите, които го имат
for (const c of e) for (const k of (c.keys||[])) {
  const n = норм(k);
  if (!зает.has(n)) зает.set(n, []);
  зает.get(n).push(c.id);
}
const стаяНа = id => (e.find(x => x.id === id) || {}).room;

const П = JSON.parse(fs.readFileSync(path.join(__dirname, 'vs_predlozheni_surovi.json'), 'utf8'));
const приети = {}; const отказани = [];
let вс = 0, пр = 0;
for (const [id, ключове] of Object.entries(П)) {
  const карта = e.find(x => x.id === id);
  if (!карта) { console.log('!!! НЯМА КАРТА ' + id); continue; }
  const стая = карта.room;
  for (const k of ключове) {
    вс++;
    const n = норм(k);
    if (зает.has(n)) { отказани.push([id, k, 'ЗАЕТ от ' + зает.get(n).join(',')]); continue; }
    const r = A.BL_MATCH(k, стая);
    if (r && r.id === id) { отказани.push([id, k, 'ИЗЛИШЕН — вече води до целта']); continue; }
    (приети[id] = приети[id] || []).push(k);
    пр++;
  }
}
console.log('ПРЕДЛОЖЕНИ: ' + вс + ' · ПРИЕТИ: ' + пр + ' · ОТКАЗАНИ: ' + отказани.length);
console.log('\n═══ ОТКАЗАНИ ═══');
for (const [id, k, защо] of отказани) console.log('  ' + id + '  « ' + k + ' »  ' + защо);
console.log('\n═══ ПРИЕТИ по карти ═══');
for (const [id, ks] of Object.entries(приети)) console.log('  ' + стаяНа(id) + '::' + id + '  (' + ks.length + ')');
fs.writeFileSync(path.join(__dirname, 'klyuchove_vsekidnevie.json'), JSON.stringify(приети, null, 1), 'utf8');
console.log('\nЗАПИСАНО: scratchpad/klyuchove_vsekidnevie.json · карти: ' + Object.keys(приети).length + ' · ключове: ' + пр);
