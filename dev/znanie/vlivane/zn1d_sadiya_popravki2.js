// Съдията zn1d · втори кръг поправки (след проверителя zn1d_sadiya_proveri.js), 21.10.2026.
// node dev/znanie/vlivane/zn1d_sadiya_popravki2.js — всяка замяна трябва да намери текста точно веднъж, иначе не пише нищо.
const fs = require('fs');
const FK = 'dev/nahodki/karti_zn1d.json';
const K = JSON.parse(fs.readFileSync(FK, 'utf8'));
const greshki = [];
// ключ от първия кръг беше 7 думи (договорът: 2–6)
const a = K.find(x => x.id === 'zn1d-anemia-proverka');
const i = a.keys.indexOf('кръвна картина на бебето на 6 месеца');
if (i < 0) greshki.push('ключът на анемията не е намерен'); else a.keys[i] = 'кръвна картина на 6 месеца';
// левурда: институциите по име (BfR = Германски федерален институт за оценка на риска; AGES = австрийската агенция) — 03 №А14
const l = K.find(x => x.id === 'zn1d-levurda');
const st = 'Германският и австрийският институт по безопасност на храните пишат,';
const nv = 'Германският институт за оценка на риска и австрийската агенция по безопасност на храните пишат,';
if (l.core.split(st).length !== 2) greshki.push('левурда: текстът не е намерен точно веднъж'); else l.core = l.core.replace(st, () => nv);
if (greshki.length) { console.log('🔴 НИЩО НЕ Е ЗАПИСАНО: ' + greshki.join(' · ')); process.exit(1); }
fs.writeFileSync(FK, JSON.stringify(K, null, 1) + '\n');
JSON.parse(fs.readFileSync(FK, 'utf8'));
console.log('🟢 втори кръг: 2 поправки записани; JSON се парсва.');
