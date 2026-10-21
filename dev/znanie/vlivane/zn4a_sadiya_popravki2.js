// Съдията zn4a · втори кръг — двете грешки, които хвана zn4a_sadiya_proveri.js след първия кръг.
// Всяка замяна трябва да намери стария текст ТОЧНО веднъж — иначе нищо не се записва.
// node dev/znanie/vlivane/zn4a_sadiya_popravki2.js
'use strict';
const fs = require('fs');
const KP = 'dev/nahodki/karti_zn4a.json', SP = 'dev/nahodki/statii_zn4a.json';
const K = JSON.parse(fs.readFileSync(KP, 'utf8'));
const S = JSON.parse(fs.readFileSync(SP, 'utf8'));
let greshki = 0, broi = 0;
function zameni(obekt, pole, staro, novo, etiket) {
  const t = obekt[pole];
  const n = t.split(staro).length - 1;
  if (n !== 1) { console.log('🔴 ' + etiket + ' · ' + pole + ' · намерено ' + n + ' пъти: ' + staro.slice(0, 70)); greshki++; return; }
  obekt[pole] = t.replace(staro, () => novo); broi++;
}
// 1. zn4a-hapka-za-mama: латинският ключ с тире не се брои за шльокавица → без тире (2 латински ключа).
{
  const x = K.find(e => e.id === 'zn4a-hapka-za-mama');
  const i = x.keys.indexOf('gladat e nai-dobriyat gotvach');
  if (i < 0) { console.log('🔴 ключът с тире го няма'); greshki++; } else { x.keys[i] = 'gladat e nai dobriyat gotvach'; broi++; }
}
// 2. zn4a-cherven-bob: 🚨 трябва да казва „веднага“ в първото изречение (договорът: при опасност — ясно).
zameni(K.find(e => e.id === 'zn4a-cherven-bob'), 'follow', 'или е отпуснато — към лекар без изчакване.', 'или е отпуснато — към лекар веднага.', 'К zn4a-cherven-bob');
zameni(S.find(e => e.karta === 'zn4a-cherven-bob'), 'body', 'или е отпуснато — към лекар без изчакване.', 'или е отпуснато — към лекар веднага.', 'С zn4a-cherven-bob');
if (greshki) { console.log('🔴 ' + greshki + ' грешки — НИЩО не е записано.'); process.exit(1); }
fs.writeFileSync(KP, JSON.stringify(K, null, 1) + '\n', 'utf8');
fs.writeFileSync(SP, JSON.stringify(S, null, 1) + '\n', 'utf8');
JSON.parse(fs.readFileSync(KP, 'utf8')); JSON.parse(fs.readFileSync(SP, 'utf8'));
console.log('🟢 замени: ' + broi + ' · JSON се парсва');
