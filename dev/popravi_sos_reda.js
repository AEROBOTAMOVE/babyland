// 🚨 Е ЕДИНСТВЕНИЯТ КЛЮЧ ЗА ПОКАЗВАНЕ в статия — той изнася реда пред очите
// на майката. Ако не е В НАЧАЛОТО на реда, не изнася НИЩО и гейтът отказва.
// Три от 62-те статии го имаха насред абзац. Тук се вдига на свой ред.
//   node dev/popravi_sos_reda.js dev/nahodki/statii_v3.json
const fs = require('fs');
const П = process.argv[2];
if (!П || !fs.existsSync(П)) { console.log('🔴 подай файл'); process.exit(2); }
const данни = JSON.parse(fs.readFileSync(П, 'utf8'));
let пипнати = 0;
for (const с of данни) {
  if (typeof с.body !== 'string' || с.body.indexOf('🚨') < 0) continue;
  const редове = с.body.split('\n');
  let смени = false;
  const нови = [];
  for (const р of редове) {
    const и = р.indexOf('🚨');
    if (и <= 0) { нови.push(р); continue; }
    // 🚨 е насред реда: режем точно преди него и го пращаме на свой ред
    нови.push(р.slice(0, и).replace(/\s+$/, ''));
    нови.push('');
    нови.push(р.slice(и).trim());
    смени = true;
  }
  if (смени) { с.body = нови.join('\n').replace(/\n{3,}/g, '\n\n'); пипнати++; }
}
fs.writeFileSync(П, JSON.stringify(данни, null, 1));
console.log('вдигнати на свой ред: ' + пипнати + ' статии');
const още = данни.filter(с => String(с.body || '').split('\n').some(р => р.indexOf('🚨') > 0));
console.log(още.length ? '🔴 още ' + още.length + ': ' + още.map(x => x.karta).join(', ') : '✅ всяко 🚨 е в началото на ред');
