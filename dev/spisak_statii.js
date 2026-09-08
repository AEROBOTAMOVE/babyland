// ═══════════════════════════════════════════════════════════════════════
// 📚 СПИСЪКЪТ НА СТАТИИТЕ — какво ВЕЧЕ има библиотеката
//
// ЗАЩО: всеки път, когато се пита „какво липсва", първата стъпка е да се
// види какво ИМА. Иначе се пише трета статия за същото, а истинската дупка
// стои отворена. (Точно това вече се случи два пъти: „близнаци и омоними".)
//
// ПУСКАНЕ:
//   node dev/spisak_statii.js                  ← всички стаи, само заглавия
//   node dev/spisak_statii.js "Захранване"     ← една стая
//   node dev/spisak_statii.js --pylno          ← с резюмета и ключове
// ПЪТ НАЗАД: файлът само ЧЕТЕ. Нищо не записва.
// ═══════════════════════════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const ПЪЛНО = process.argv.includes('--pylno');
const СТАЯ = process.argv.slice(2).find(a => a.indexOf('--') !== 0);

const idx = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib', 'index.json'), 'utf8'));
const записи = Array.isArray(idx) ? idx : Object.values(idx).find(Array.isArray);
if (!записи || записи.length < 500) { console.log('🔴 индексът дава ' + (записи || []).length + ' записа — СЛЯП'); process.exit(2); }

const по = {};
for (const z of записи) {
  if (СТАЯ && z.r !== СТАЯ) continue;
  (по[z.r] = по[z.r] || {});
  const к = z.c || '(без категория)';
  (по[z.r][к] = по[z.r][к] || []).push(z);
}
let общо = 0;
for (const [стая, кат] of Object.entries(по)) {
  const n = Object.values(кат).reduce((a, b) => a + b.length, 0);
  общо += n;
  console.log('');
  console.log('═══ ' + стая + ' · ' + n + ' статии ═══');
  for (const [к, сп] of Object.entries(кат)) {
    console.log('');
    console.log('  ▸ ' + к + ' (' + сп.length + ')');
    for (const z of сп.sort((a, b) => (a.p || 0) - (b.p || 0))) {
      console.log('     · ' + z.t);
      if (ПЪЛНО) {
        if (z.s) console.log('        ' + z.s.slice(0, 150));
        if (z.k) console.log('        ключове: ' + z.k.slice(0, 130));
      }
    }
  }
}
console.log('');
console.log('── общо показани: ' + общо + ' от ' + записи.length + ' ──');
