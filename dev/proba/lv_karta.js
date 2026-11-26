// 25.11 · КАРТАТА НА ВЕРСИИТЕ НА СТАТИИТЕ (LVF в js/lib.js)
// ЗАЩО: един общ LV значеше, че поправка в една статия кара телефона да тегли наново всичките 18 файла (~2 MB).
//   Сега всеки файл носи своя версия = първите 8 знака от md5 на съдържанието (\r\n → \n, за да е еднакво в
//   работното копие и в git-копието за качване).
// ПУСКАНЕ:  node dev/proba/lv_karta.js          → пише LVF в js/lib.js и вдига ?v= на lib.js + sw (ако има смяна)
//           node dev/proba/lv_karta.js --proveri → само сверява; изход 1 при разминаване (ползва го build.js)
// ПЪТ НАЗАД: върни реда „const LVF = {};“ в js/lib.js.
const fs = require('fs'); const path = require('path'); const crypto = require('crypto');
const КОРЕН = path.resolve(__dirname, '..', '..');
function карта(корен) {
  const к = {};
  for (const f of fs.readdirSync(path.join(корен, 'lib')).filter(f => /^[a-z]+(-\d+)?\.json$/.test(f)).sort()) {
    const т = fs.readFileSync(path.join(корен, 'lib', f), 'utf8').replace(/\r\n/g, '\n');
    к[f] = crypto.createHash('md5').update(т).digest('hex').slice(0, 8);
  }
  return к;
}
const РЕД = /const LVF = \{[^}]*\};/;
function прочетиLVF(корен) {
  const s = fs.readFileSync(path.join(корен, 'js', 'lib.js'), 'utf8'); const m = s.match(РЕД);
  if (!m) return null;
  try { return JSON.parse(m[0].replace(/^const LVF = /, '').replace(/;$/, '')); } catch (e) { return {}; }
}
function провери(корен) {
  const нужна = карта(корен), има = прочетиLVF(корен);
  if (!има) return ['js/lib.js няма ред „const LVF = {…};“'];
  if (!Object.keys(има).length) return [];   // празна карта = всичко по LV (пътят назад) — не е грешка
  const грешки = [];
  for (const [f, h] of Object.entries(нужна)) if (има[f] !== h) грешки.push(f + ': в lib.js ' + (има[f] || '—') + ', файлът е ' + h);
  return грешки;
}
module.exports = { провери, карта };
if (require.main === module) {
  if (process.argv.includes('--proveri')) {
    const г = провери(КОРЕН);
    if (г.length) { console.log('🔴 LVF не съвпада със статиите — пусни node dev/proba/lv_karta.js:\n   ' + г.join('\n   ')); process.exit(1); }
    console.log('✅ LVF съвпада със статиите'); process.exit(0);
  }
  const P = path.join(КОРЕН, 'js', 'lib.js'); const s = fs.readFileSync(P, 'utf8');
  if (!РЕД.test(s)) { console.log('🔴 js/lib.js няма ред „const LVF = {…};“'); process.exit(2); }
  const нова = 'const LVF = ' + JSON.stringify(карта(КОРЕН)) + ';';
  const стара = s.match(РЕД)[0];
  if (стара === нова) { console.log('LVF без промяна'); process.exit(0); }
  fs.writeFileSync(P, s.replace(РЕД, () => нова), 'utf8');
  const стариК = прочетиLVF(КОРЕН) || {};
  console.log('LVF записана (' + Object.keys(карта(КОРЕН)).length + ' файла)');
  require('child_process').execFileSync(process.execPath, [path.join(__dirname, 'vdigni.js'), 'js/lib.js', '--sw'], { cwd: КОРЕН, stdio: 'inherit' });
}
