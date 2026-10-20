// 📚 КАТАЛОГ НА БИБЛИОТЕКАТА — теми, файлове, записи (## заглавия), размер, белези за проверка.
// ПУСКАНЕ: node dev/znanie/katalog.js  → dev/znanie/00-KATALOG.md
// ПЪТ НАЗАД: само чете dev/znanie.
const fs = require('fs'), path = require('path');
const КОРЕН = __dirname;
const папки = fs.readdirSync(КОРЕН, { withFileTypes: true }).filter(d => d.isDirectory() && /^\d\d-/.test(d.name)).map(d => d.name).sort();
let общоФ = 0, общоЗ = 0, общоБ = 0, общоН = 0;
const редове = [];
for (const п of папки) {
  const файлове = fs.readdirSync(path.join(КОРЕН, п)).filter(f => f.endsWith('.md')).sort();
  let з = 0, б = 0, н = 0;
  for (const ф of файлове) {
    const т = fs.readFileSync(path.join(КОРЕН, п, ф), 'utf8');
    б += Buffer.byteLength(т);
    з += (т.match(/^## /gm) || []).length;
    н += (т.match(/\[(от паметта|непроверено|П|резюме)\]|ПРЕДПОЛОЖЕНО/g) || []).length;
  }
  общоФ += файлове.length; общоЗ += з; общоБ += б; общоН += н;
  редове.push('| `' + п + '` | ' + файлове.length + ' | ' + з + ' | ' + Math.round(б / 1024) + ' KB | ' + н + ' |');
}
const out = '# 📚 КАТАЛОГ НА БИБЛИОТЕКАТА „БЕЙБИ ЛЕНД“\n\n' +
  'Суровина за помощничките — НЕ е в приложението. Правила: `README.md`. Какво имаме в картите: `00-IMAME.md`.\n' +
  'Противоречия: `00-PROTIVORECHIYA.md`; присъди: `24-proverka/`. Белег „за проверка“ = [от паметта] / [непроверено] / [П] / [резюме] / ПРЕДПОЛОЖЕНО — НЕ влиза в карта без сверка.\n\n' +
  '| Тема | Файлове | Записи (##) | Размер | Белези за проверка |\n|---|---|---|---|---|\n' + редове.join('\n') +
  '\n| **ОБЩО** | **' + общоФ + '** | **' + общоЗ + '** | **' + (общоБ / 1048576).toFixed(1) + ' MB** | **' + общоН + '** |\n';
fs.writeFileSync(path.join(КОРЕН, '00-KATALOG.md'), out);
console.log('✅ 00-KATALOG.md · ' + папки.length + ' теми · ' + общоФ + ' файла · ' + общоЗ + ' записа · ' + (общоБ / 1048576).toFixed(1) + ' MB · ' + общоН + ' белега за проверка');
