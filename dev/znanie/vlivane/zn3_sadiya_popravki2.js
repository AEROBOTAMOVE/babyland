// Съдията zn3 · втори кръг: моят проверител хвана мой ключ от 7 думи (първия кръг). Спира, ако не намери точно един.
// node dev/znanie/vlivane/zn3_sadiya_popravki2.js
const fs = require('fs');
const FK = 'dev/nahodki/karti_zn3.json';
const K = JSON.parse(fs.readFileSync(FK, 'utf8'));
const c = K.find(x => x.id === 'zn3-izsledvania-priem');
const i = c.keys.indexOf('какво се носи при прием в ясла');
if (i < 0 || c.keys.indexOf('какво се носи при прием в ясла', i + 1) > -1) throw new Error('ключът не е намерен точно веднъж');
c.keys[i] = 'какво се носи за ясла';
fs.writeFileSync(FK, JSON.stringify(K, null, 1));
JSON.parse(fs.readFileSync(FK, 'utf8'));
console.log('1 ключ сменен · JSON се парсва');
