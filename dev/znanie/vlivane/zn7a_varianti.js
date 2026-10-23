// zn7a · варианти на ключовете за сравнение в пясъчника (нищо не пише в js/ или в стажа):
//   V1 = dev/nahodki/karti_zn7a.json (всички форми от задачата)
//   V3 = без „на/в N седмица съм“, „N седмица съм“, „na N sedmica sam“ (те крадат „на N седмица съм и <симптом>“)
//        + „N седмица съм какво“, „на N седмица какво“, „na N sedmica sam kakvo“
//   V2 = всеки ключ носи намерение: присъствен ключ без „какво“ получава „ какво“ отзад
// Пускане: node dev/znanie/vlivane/zn7a_varianti.js
'use strict';
const fs = require('fs');
const path = require('path');
const КОРЕН = path.resolve(__dirname, '../../..');
process.chdir(КОРЕН);
const V1 = JSON.parse(fs.readFileSync('dev/nahodki/karti_zn7a.json', 'utf8'));
const копие = () => JSON.parse(JSON.stringify(V1));
const махниСъм = /^(на \d+ седмица съм|в \d+ седмица съм|\d+ седмица съм|na \d+ sedmica sam)$/;
const V3 = копие();
for (const к of V3) {
  if (к.room !== 'Бременност') continue;
  const числа = [...new Set(к.keys.map(k => (k.match(/^(?:на |в |na )?(\d+) (?:седмица съм|sedmica sam)$/) || [])[1]).filter(Boolean))];
  к.keys = к.keys.filter(k => !махниСъм.test(k));
  for (const N of числа) к.keys.push(`${N} седмица съм какво`, `на ${N} седмица какво`, `na ${N} sedmica sam kakvo`);
}
const V2 = копие();
for (const к of V2) {
  const нови = [];
  for (const k of к.keys) {
    if (/какво|kakvo/.test(k)) { нови.push(k); continue; }
    if (/^на \d+ седмица съм$/.test(k)) { нови.push(k + ' какво', k.replace(/^на (\d+) седмица съм$/, 'на $1 седмица какво')); continue; }
    if (/^в \d+ седмица съм$/.test(k)) continue;      // „в N седмица съм какво“ се покрива от „N седмица съм какво“
    нови.push(k + (/[a-z]/.test(k) ? ' kakvo' : ' какво'));
  }
  к.keys = [...new Set(нови)];
}
// V4 = V2, но „N гс“ остава присъствен (в V1 не открадна нито 1 от 8) + „как е бебето на N седмица“, „колко е голямо бебето на N седмица“
const V4 = JSON.parse(JSON.stringify(V2));
for (const к of V4) {
  к.keys = к.keys.map(k => k.replace(/^(\d+) гс какво$/, '$1 гс'));
  if (к.room === 'Бременност') {
    const числа = [...new Set(к.keys.map(k => (k.match(/^(\d+) гс$/) || [])[1]).filter(Boolean))];
    for (const N of числа) к.keys.push(`как е бебето на ${N} седмица`, `колко е голямо бебето на ${N} седмица`);
  }
}
fs.writeFileSync('dev/znanie/vlivane/zn7a_karti_V4.json', JSON.stringify(V4, null, 1) + '\n');
fs.writeFileSync('dev/znanie/vlivane/zn7a_karti_V3.json', JSON.stringify(V3, null, 1) + '\n');
fs.writeFileSync('dev/znanie/vlivane/zn7a_karti_V2.json', JSON.stringify(V2, null, 1) + '\n');
for (const [име, В] of [['V1', V1], ['V3', V3], ['V2', V2]]) console.log(име + ': ' + В.map(к => к.keys.length).join(' '));
console.log('V3 пример: ' + V3[8].keys.join(' | '));
console.log('V2 пример: ' + V2[8].keys.join(' | '));
console.log('V2 след: ' + V2[11].keys.join(' | '));
