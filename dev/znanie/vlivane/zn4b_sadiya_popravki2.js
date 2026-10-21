// Съдията zn4b · втори кръг: ключове (21.10.2026).
// node dev/znanie/vlivane/zn4b_sadiya_popravki2.js
// Хванато от zn4b_sadiya_proveri.js: ключ от 1 дума. Плюс 4 ключа, които крадат чужди теми
// (kade: „трябва да се движи детето“ → nb-monitorat-dvizhenie — движенията на плода в бременността).
const fs = require('fs');
const FK = 'dev/nahodki/karti_zn4b.json';
const K = JSON.parse(fs.readFileSync(FK, 'utf8'));
const KLYUCHOVE = [
  ['zn4b-vazpitatelkata', 'vazpitatelkata', 'vazpitatelkata v gradinata'],          // 1 дума
  ['zn4b-gotov-za-parvi-klas', 'на 6 или на 7', 'първи клас на 6 или 7'],          // „захранване на 6 или на 7 месеца“
  ['zn4b-sam-i-zadalzheniya', 'може да прави сам', 'какво прави сам на 5'],         // общо
  ['zn4b-na-3-godini', 'трябва да може на 3', 'какво трябва да може тригодишно'],  // „на 3 месеца“
  ['zn4b-dvizhenie-na-den', 'трябва да се движи детето', 'колко движение за 4 годишно'], // бременност
];
let n = 0;
for (const [id, staro, novo] of KLYUCHOVE) {
  const k = K.find(x => x.id === id);
  if (!k) throw new Error('няма карта ' + id);
  const i = k.keys.indexOf(staro);
  if (i < 0 || k.keys.includes(novo)) throw new Error(id + ' · ключ: ' + staro);
  k.keys[i] = novo; n++;
}
const t = JSON.stringify(K, null, 1) + '\n';
JSON.parse(t);
fs.writeFileSync(FK, t);
console.log('ключове сменени: ' + n + ' · записано и парснато наново');
