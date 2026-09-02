// dev/izvadi_nizove.js — вади ТОЧНИТЕ редове за поправка + проверява
// уникалността им (String.replace не гърми, когато не намери — правило 7)
// и окончанията на редовете (CRLF/LF — правило 6).
const fs = require('fs'), path = require('path');
const КОРЕН = path.resolve(__dirname, '..');

const МЕСТА = [
  ['sw.js', 161], ['js/rooms3.js', 304], ['js/rooms3.js', 310], ['js/rooms3.js', 550],
  ['js/extras2.js', 287], ['js/women4.js', 410], ['js/women4.js', 415],
  ['js/shop.js', 29], ['js/extras2.js', 565],
  ['js/rooms3.js', 15], ['js/extras2.js', 12], ['js/women4.js', 15], ['js/profile.js', 175],
];

for (const [ф, н] of МЕСТА) {
  const сур = fs.readFileSync(path.join(КОРЕН, ф), 'utf8');
  const редове = сур.split('\n');
  const ред = редове[н - 1];
  const crlf = ред.endsWith('\r');
  const чист = crlf ? ред.slice(0, -1) : ред;
  const брой = сур.split(чист).length - 1;
  console.log(`\n── ${ф}:${н}  [${crlf ? 'CRLF' : 'LF'}]  срещания в файла: ${брой}${брой === 1 ? ' ✅ уникален' : ' ⚠ НЕ Е УНИКАЛЕН'}`);
  console.log(JSON.stringify(чист));
}
// колко CRLF/LF има всеки файл общо
console.log('\n── окончания по файл ──');
for (const ф of [...new Set(МЕСТА.map(m => m[0]))]) {
  const с = fs.readFileSync(path.join(КОРЕН, ф), 'utf8');
  const crlf = (с.match(/\r\n/g) || []).length, lf = (с.match(/(?<!\r)\n/g) || []).length;
  console.log(`  ${ф.padEnd(16)} CRLF ${String(crlf).padStart(5)} · само LF ${String(lf).padStart(5)} ${crlf && lf ? '⚠ СМЕСЕН' : ''}`);
}
