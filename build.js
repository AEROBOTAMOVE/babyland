// ═══════════════════════════════════════════════════════════════════════
// 📦 СГЛОБЯВАНЕ ЗА NETLIFY — dist/ съдържа САМО приложението
//
// ЗАЩО СЪЩЕСТВУВА: хранилището носи 245 файла в dev/ (пазачи, корпуси,
//   сонди) и още в qa/. Те са безценни за работата и НЯМАТ какво да правят
//   на живия сайт: качват се като публични файлове, ядат трафик и показват
//   на света вътрешната кухня. Затова Netlify публикува dist/, не корена.
//
// НУЛА ЗАВИСИМОСТИ. Пуска се с обикновен node, без npm install.
//
// ПУСКАНЕ:  node build.js
// ПРОВЕРКА: node build.js --proveri   (сглобява и СВЕРЯВА, без да пише)
// ПЪТ НАЗАД: dist/ се трие изцяло и се сглобява наново. Нищо извън dist/
//   не се пипа — скриптът е само за ЧЕТЕНЕ на корена.
// ═══════════════════════════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');

const КОРЕН = __dirname;
const ИЗХОД = path.join(КОРЕН, 'dist');
const САМО_ПРОВЕРКА = process.argv.includes('--proveri');

// Всичко, което приложението наистина ползва. Списъкът е БЕЛ, не черен:
// нов файл в проекта НЕ влиза сам в сайта, докато не го добавиш тук.
const ПАПКИ = ['css', 'js', 'fonts', 'icons', 'img', 'lib'];
const ФАЙЛОВЕ = ['index.html', 'sw.js', 'manifest.webmanifest'];

function изтрий(п) {
  if (!fs.existsSync(п)) return;
  fs.rmSync(п, { recursive: true, force: true });
}
function копирай(от, до) {
  const ст = fs.statSync(от);
  if (ст.isDirectory()) {
    fs.mkdirSync(до, { recursive: true });
    for (const име of fs.readdirSync(от)) {
      // резервните копия и работните файлове НЕ влизат в сайта
      if (/(^\.)|(\.BAK)|(PREDI)|(ARCHIVE)|(\.pyc$)|(^__)|(^_)/.test(име)) continue;
      копирай(path.join(от, име), path.join(до, име));
    }
    return;
  }
  fs.copyFileSync(от, до);
}

// ── Netlify: заглавки и пренасочвания ──
// sw.js НЕ СЕ КЕШИРА. Ако браузърът задържи стар service worker, майката
// остава на старата версия завинаги — а целият кеш на приложението е
// „кеш-първо по ТОЧЕН URL", тоест няма кой да я освежи.
const HEADERS = [
  '/sw.js',
  '  Cache-Control: no-cache, no-store, must-revalidate',
  '',
  '/index.html',
  '  Cache-Control: no-cache',
  '',
  '/manifest.webmanifest',
  '  Content-Type: application/manifest+json',
  '  Cache-Control: no-cache',
  '',
  '/fonts/*',
  '  Cache-Control: public, max-age=31536000, immutable',
  '',
  '/icons/*',
  '  Cache-Control: public, max-age=31536000, immutable',
  '',
  '/*',
  '  X-Content-Type-Options: nosniff',
  '  Referrer-Policy: no-referrer',
  '  X-Frame-Options: SAMEORIGIN',
  '',
].join('\n');

// Приложението е ЕДНА страница. Пренасочването важи само когато няма файл
// на този път — тоест липсващ ресурс пак си остава 404 и не се крие.
const REDIRECTS = '/*    /index.html   200\n';

// ── сглобяване ──
const план = [];
for (const ф of ФАЙЛОВЕ) {
  const п = path.join(КОРЕН, ф);
  if (!fs.existsSync(п)) { console.log('🔴 ЛИПСВА ' + ф + ' — спирам'); process.exit(2); }
  план.push(ф);
}
for (const д of ПАПКИ) {
  const п = path.join(КОРЕН, д);
  if (!fs.existsSync(п)) { console.log('🔴 ЛИПСВА папка ' + д + ' — спирам'); process.exit(2); }
  план.push(д + '/');
}

if (!САМО_ПРОВЕРКА) {
  изтрий(ИЗХОД);
  fs.mkdirSync(ИЗХОД, { recursive: true });
  for (const ф of ФАЙЛОВЕ) копирай(path.join(КОРЕН, ф), path.join(ИЗХОД, ф));
  for (const д of ПАПКИ) копирай(path.join(КОРЕН, д), path.join(ИЗХОД, д));
  fs.writeFileSync(path.join(ИЗХОД, '_headers'), HEADERS);
  fs.writeFileSync(path.join(ИЗХОД, '_redirects'), REDIRECTS);
}

// ── СВЕРЯВАНЕ: всеки ?v= в index.html има ли го наистина в dist ──
// Пакет, в който index.html сочи липсващ файл, е бял екран за майката.
const html = fs.readFileSync(path.join(КОРЕН, 'index.html'), 'utf8');
const пътища = new Set();
const ИЗР = /(?:src|href)="([^"?#]+)(?:[?][^"]*)?"/g;
let m;
while ((m = ИЗР.exec(html))) {
  const p = m[1];
  if (/^(https?:|data:|mailto:|tel:|#)/.test(p)) continue;
  пътища.add(p.replace(/^\.?\//, ''));
}
let липсват = 0;
for (const p of пътища) {
  const цел = path.join(САМО_ПРОВЕРКА ? КОРЕН : ИЗХОД, p);
  if (!fs.existsSync(цел)) { липсват++; console.log('🔴 index.html сочи липсващ файл: ' + p); }
}

function размер(п) {
  let с = 0, бр = 0;
  (function обход(x) {
    for (const име of fs.readdirSync(x)) {
      const пълен = path.join(x, име), ст = fs.statSync(пълен);
      if (ст.isDirectory()) обход(пълен); else { с += ст.size; бр++; }
    }
  })(п);
  return { байта: с, файла: бр };
}

console.log('');
console.log('📦 ПАКЕТ ЗА NETLIFY');
console.log('   включени: ' + план.join(' · '));
if (!САМО_ПРОВЕРКА) {
  const р = размер(ИЗХОД);
  console.log('   dist/: ' + р.файла + ' файла · ' + (р.байта / 1048576).toFixed(2) + ' МБ');
}
console.log('   пътища в index.html: ' + пътища.size + ' · липсващи: ' + липсват);
if (липсват) { console.log('🔴 ПАКЕТЪТ Е СЧУПЕН'); process.exit(1); }
console.log('✅ пакетът е пълен');
