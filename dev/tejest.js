// dev/tejest.js — МЕРИ тежестта на приложението. Не пипа нищо, само чете.
// Пускане: node dev/tejest.js
//
// Мери три различни числа, защото трите значат различни неща за майката:
//   1) КАКВО ИМА В ПАПКАТА  — всичко на диска, вкл. резервните копия
//   2) КАКВО СЕ КАЧВА       — файловете БЕЗ тези по .gitignore (реалният сайт)
//   3) КАКВО СЕ ТЕГЛИ ПРИ ПЪРВО ОТВАРЯНЕ — index.html + <script>/<link> +
//      целият списък ASSETS от sw.js (service worker-ът ги дърпа при install)
//
// И трите — сурово И със сгъване (gzip), защото по мрежата върви сгънатото.

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const КОРЕН = path.resolve(__dirname, '..');
const Р = p => path.join(КОРЕН, p);

// ── 1. Обход на цялата папка ───────────────────────────────────────────────
const ПРЕСКОЧИ = new Set(['.git', 'node_modules', '__pycache__']);
const всички = [];
(function обходи(дир) {
  for (const име of fs.readdirSync(дир)) {
    if (ПРЕСКОЧИ.has(име)) continue;
    const пълен = path.join(дир, име);
    let ст;
    try { ст = fs.statSync(пълен); } catch (e) { continue; }
    if (ст.isDirectory()) обходи(пълен);
    else всички.push({ път: path.relative(КОРЕН, пълен).replace(/\\/g, '/'), байта: ст.size });
  }
})(КОРЕН);

// ── 2. Кое е резервно копие (по .gitignore правилата, буквално) ────────────
function еРезервно(п) {
  const име = п.split('/').pop();
  if (/\.BAK/.test(име)) return 'BAK';
  if (/PREDI/.test(име)) return 'PREDI';
  if (/ARCHIVE/.test(име)) return 'ARCHIVE';
  if (/^index\.html\./.test(име)) return 'index-копие';
  if (п.startsWith('$Р/') || п.startsWith('$Д/')) return 'папка-$';
  if (/\.pyc$/.test(име)) return 'pyc';
  return null;
}

// ── 3. Сгъване ─────────────────────────────────────────────────────────────
const кешGzip = new Map();
function gz(п) {
  if (кешGzip.has(п)) return кешGzip.get(п);
  let n = 0;
  try { n = zlib.gzipSync(fs.readFileSync(Р(п)), { level: 9 }).length; } catch (e) { n = 0; }
  кешGzip.set(п, n);
  return n;
}

// ── 4. Какво сочи index.html ───────────────────────────────────────────────
const html = fs.readFileSync(Р('index.html'), 'utf8');
const отHTML = [];
const рег = /(?:src|href)\s*=\s*["']([^"']+)["']/gi;
let м;
while ((м = рег.exec(html))) {
  let u = м[1];
  if (/^(https?:|data:|mailto:|tel:|#|javascript:)/i.test(u)) continue;
  u = u.split('?')[0].split('#')[0];
  if (!u) continue;
  отHTML.push(u);
}
const HTMLуник = [...new Set(отHTML)];

// ── 5. Какво иска service worker-ът ────────────────────────────────────────
const sw = fs.readFileSync(Р('sw.js'), 'utf8');
const блок = sw.slice(sw.indexOf('const ASSETS'), sw.indexOf('];', sw.indexOf('const ASSETS')));
const SWсписък = [...блок.matchAll(/'([^']+)'/g)].map(x => x[1]).filter(x => x !== '.' && !x.startsWith('const'));

// ── 6. Отчет ───────────────────────────────────────────────────────────────
const kb = b => (b / 1024).toFixed(1);
const mb = b => (b / 1048576).toFixed(2);

const живи = всички.filter(f => !еРезервно(f.път) && !f.път.startsWith('dev/'));
const резервни = всички.filter(f => еРезервно(f.път));
const девът = всички.filter(f => f.път.startsWith('dev/') && !еРезервно(f.път));

const сума = a => a.reduce((s, x) => s + x.байта, 0);

const резултат = {
  цялаПапка: { брой: всички.length, байта: сума(всички), MB: mb(сума(всички)) },
  живиФайлове: { брой: живи.length, байта: сума(живи), MB: mb(сума(живи)) },
  резервниКопия: { брой: резервни.length, байта: сума(резервни), MB: mb(сума(резервни)) },
  папкаDev: { брой: девът.length, байта: сума(девът), MB: mb(сума(девът)) },
};

// по вид
const поВид = {};
for (const f of живи) {
  const е = (f.път.match(/\.([a-z0-9]+)$/i) || [0, 'без'])[1].toLowerCase();
  поВид[е] = поВид[е] || { брой: 0, байта: 0 };
  поВид[е].брой++; поВид[е].байта += f.байта;
}

// ПЪРВО ОТВАРЯНЕ = index.html + HTML препратки + SW ASSETS (обединено)
const първо = new Set(['index.html', 'sw.js']);
HTMLуник.forEach(u => първо.add(u));
SWсписък.forEach(u => първо.add(u));
const първоСпис = [...първо].filter(u => fs.existsSync(Р(u)));
const липсващи = [...първо].filter(u => !fs.existsSync(Р(u)));

let първоСуров = 0, първоGz = 0;
const детайл = [];
for (const u of първоСпис) {
  const b = fs.statSync(Р(u)).size;
  const g = gz(u);
  първоСуров += b; първоGz += g;
  детайл.push({ път: u, байта: b, gzip: g });
}
детайл.sort((a, b) => b.байта - a.байта);

// какво НЕ е в първото отваряне, но е жив файл
const ливиНеТеглени = живи.filter(f => !първо.has(f.път));

console.log('═══ 1. КАКВО ИМА НА ДИСКА ═══');
console.log(JSON.stringify(резултат, null, 2));

console.log('\n═══ 2. ПО ВИД (само живи, без dev/ и без копия) ═══');
Object.entries(поВид).sort((a, b) => b[1].байта - a[1].байта)
  .forEach(([е, v]) => console.log(`  .${е.padEnd(14)} ${String(v.брой).padStart(4)} файла  ${kb(v.байта).padStart(9)} KB`));

console.log('\n═══ 3. ПЪРВО ОТВАРЯНЕ (index.html + препратки + SW ASSETS) ═══');
console.log(`  файлове: ${първоСпис.length}`);
console.log(`  СУРОВО : ${mb(първоСуров)} MB  (${kb(първоСуров)} KB)`);
console.log(`  GZIP   : ${mb(първоGz)} MB  (${kb(първоGz)} KB)`);
if (липсващи.length) console.log(`  ⚠ ЛИПСВАТ на диска: ${липсващи.join(', ')}`);

console.log('\n═══ 4. НАЙ-ТЕЖКИТЕ 25 ОТ ПЪРВОТО ОТВАРЯНЕ ═══');
детайл.slice(0, 25).forEach((f, i) =>
  console.log(`${String(i + 1).padStart(3)}. ${f.път.padEnd(42)} ${kb(f.байта).padStart(8)} KB  (gz ${kb(f.gzip).padStart(7)} KB)`));

console.log('\n═══ 5. ЖИВИ ФАЙЛОВЕ, КОИТО НЕ СЕ ТЕГЛЯТ ПРИ ПЪРВО ОТВАРЯНЕ ═══');
ливиНеТеглени.sort((a, b) => b.байта - a.байта).slice(0, 40)
  .forEach(f => console.log(`  ${f.път.padEnd(46)} ${kb(f.байта).padStart(8)} KB`));
console.log(`  (общо ${ливиНеТеглени.length} файла, ${kb(сума(ливиНеТеглени))} KB)`);

console.log('\n═══ 6. HTML сочи, но SW НЕ кешира ═══');
const HTMLбезSW = HTMLуник.filter(u => !SWсписък.includes(u) && fs.existsSync(Р(u)));
HTMLбезSW.forEach(u => console.log(`  ${u.padEnd(46)} ${kb(fs.statSync(Р(u)).size).padStart(8)} KB`));

console.log('\n═══ 7. SW кешира, но HTML НЕ сочи ═══');
const SWбезHTML = SWсписък.filter(u => !HTMLуник.includes(u));
SWбезHTML.forEach(u => console.log(`  ${u.padEnd(46)} ${fs.existsSync(Р(u)) ? kb(fs.statSync(Р(u)).size).padStart(8) + ' KB' : '❌ ЛИПСВА'}`));

// запис за следващи уреди
fs.writeFileSync(path.join(__dirname, 'tejest.json'), JSON.stringify({
  резултат, поВид, първоСуров, първоGz, детайл, липсващи,
  неТеглени: ливиНеТеглени, HTMLбезSW, SWбезHTML
}, null, 1), 'utf8');
console.log('\n→ dev/tejest.json');
