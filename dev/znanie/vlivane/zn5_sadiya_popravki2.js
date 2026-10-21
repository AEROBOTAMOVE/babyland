// Съдията zn5 · втори кръг (след проверителя): латинският ключ с тире не се брои за шльокавица
// node dev/znanie/vlivane/zn5_sadiya_popravki2.js
const fs = require('fs');
const FK = 'dev/nahodki/karti_zn5.json';
const K = JSON.parse(fs.readFileSync(FK, 'utf8'));
const P = [['zn5-pet-stapki-dobre', 'po-dobro nastroenie', 'po dobro nastroenie']];
for (const [id, staro, novo] of P) {
  const k = K.find(x => x.id === id);
  const i = k ? k.keys.indexOf(staro) : -1;
  if (i < 0 || k.keys.indexOf(staro, i + 1) > -1) { console.log('🔴 НЕ ПИША — ключът не е намерен точно веднъж: ' + id + ' · ' + staro); process.exit(1); }
  k.keys[i] = novo;
}
fs.writeFileSync(FK, JSON.stringify(K, null, 1) + '\n', 'utf8');
JSON.parse(fs.readFileSync(FK, 'utf8'));
console.log('🟢 приложени ' + P.length + ' замени · JSON се парсва');
