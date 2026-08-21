const fs = require('fs');
process.chdir('C:/Users/User/Downloads/ЛОЦО/АПЛИКАЦИЯ ЗА БЕЙБИ ЛЕНД/babyland');
const idx = JSON.parse(fs.readFileSync('lib/index.json', 'utf8'));
// РЕЧНИКОВО: „Термин: определение." — къс, безличен, без обръщение към нея
const ДВОЕТОЧИЕ = /^[А-ЯA-Z][^:]{2,44}:\s+\S/;
const КЪМ_НЕЯ = /(ти|те|твоя|твоето|твоите|си|се питаш|намираш|получаваш|знаеш|можеш|детето ти|бебето ти|майка)/i;
const ГЛАГОЛ_ЗА_НЕЯ = /(ще|как|какво|кога|защо|ето|виж|намери|прочети)/i;
const речникови = [], къси = [];
let n = 0;
for (const x of (idx.items || [])) {
  const s = String(x.s || '').trim();
  if (!s) continue;
  n++;
  const дв = ДВОЕТОЧИЕ.test(s);
  const безНея = !КЪМ_НЕЯ.test(s) && !ГЛАГОЛ_ЗА_НЕЯ.test(s);
  if (дв && безНея) речникови.push(x);
  else if (s.length < 62 && безНея) къси.push(x);
}
console.log('📖 РЕЧНИКОВИ РЕЗЮМЕТА\n');
console.log('  прегледани: ' + n);
console.log('  „Термин: определение" И без обръщение към майката: ' + речникови.length);
console.log('  къси и безлични (под 62 знака): ' + къси.length + '\n');
речникови.slice(0, 30).forEach(x => console.log('  ' + x.id.padEnd(20) + x.s.slice(0, 92)));
if (речникови.length > 30) console.log('  … още ' + (речникови.length - 30));
console.log('\n  ── къси и безлични ──');
къси.slice(0, 12).forEach(x => console.log('  ' + x.id.padEnd(20) + x.s.slice(0, 92)));
