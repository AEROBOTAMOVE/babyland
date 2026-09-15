// ═══════════════════════════════════════════════════════════════════════
// 📦 СГЛОБЯВАНЕ — Netlify (dist/) и Джъмп.бг (dist-dzhamp/ + ZIP)
//
// ЗАЩО СЪЩЕСТВУВА: хранилището носи 245 файла в dev/ (пазачи, корпуси,
//   сонди) и още в qa/. Те са безценни за работата и НЯМАТ какво да правят
//   на живия сайт: качват се като публични файлове, ядат трафик и показват
//   на света вътрешната кухня. Затова се публикува пакет, не коренът.
//
// НУЛА ЗАВИСИМОСТИ. Пуска се с обикновен node, без npm install.
//
// ПУСКАНЕ:  node build.js            ← dist/ за Netlify (така го пуска Netlify)
//           node build.js --dzhamp   ← + dist-dzhamp/ и babyland-dzhamp.zip за Джъмп.бг
// ПРОВЕРКА: node build.js --proveri   (сглобява и СВЕРЯВА, без да пише)
// ПЪТ НАЗАД: dist/ и dist-dzhamp/ се трият изцяло и се сглобяват наново.
//   Нищо друго не се пипа — скриптът само ЧЕТЕ корена.
//   build.js.PREDI_DZHAMP е версията отпреди Джъмп (15.09).
// ═══════════════════════════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const КОРЕН = __dirname;
const ИЗХОД = path.join(КОРЕН, 'dist');
const ИЗХОД_ДЖАМП = path.join(КОРЕН, 'dist-dzhamp');
const ZIP_ДЖАМП = path.join(КОРЕН, 'babyland-dzhamp.zip');
const САМО_ПРОВЕРКА = process.argv.includes('--proveri');
const ЗА_ДЖАМП = process.argv.includes('--dzhamp');

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

// ═══════════════════════════════════════════════════════════════════════
// 🇧🇬 ДЖЪМП.БГ (15.09.2026) — LiteSpeed + cPanel
//
// ПРОЧЕТЕНО В ТАЗИ СЕСИЯ:
//   · Джъмп работи с LiteSpeed, не с Apache (https://www.jump.bg/litespeed).
//   · LiteSpeed чете .htaccess, но директива, която не разбира, ПРЕСКАЧА
//     без грешка. Компресията идва от сървъра, не от .htaccess.
//   · _headers и _redirects са формат на Netlify — там са мъртви файлове.
//     Затова пакетът за Джъмп НЕ ги носи, а правилата им са преведени тук.
//
// ЗАЩО БЕЗ SetEnvIf + Header env=: за LiteSpeed има доклади, че стойността
//   не стига до Header. Изгуби ли се условието, всички Cache-Control редове
//   важат за всичко и sw.js получава кеша на целия сайт. Вместо това: <Files>
//   в корена и отделен .htaccess във всяка папка — и двете LiteSpeed чете
//   в същия ред като Apache.
//
// СВЕРКА: dev/dzhamp_pazach.js сравнява всяко правило тук с _headers и
//   netlify.toml и пази капаните. ПРОВЕРКА НА ЖИВО: dev/proveri_hosta.js.
// ═══════════════════════════════════════════════════════════════════════
const КЕШ_ГОДИНА = 'public, max-age=31536000, immutable';
const КЕШ_СЕДМИЦА = 'public, max-age=604800';
// същото като /fonts/* и /icons/* в HEADERS и /js/* /css/* /lib/* в netlify.toml
// ⚠️ ИКОНИТЕ (преглед 15.09): манифестът ги сочи БЕЗ ?v=, а icons/ е „immutable"
//   за година — така е и при Netlify. Днес не се мени нищо: смяна на адреса на
//   иконата кара Android да пита вече инсталиралите за „обновена икона". Който
//   СМЕНИ иконата, сменя и името на файла (или слага ?v= в манифеста) —
//   иначе новата не стига до телефона.
const КЕШ_ПО_ПАПКИ = { fonts: КЕШ_ГОДИНА, icons: КЕШ_ГОДИНА, js: КЕШ_СЕДМИЦА, css: КЕШ_СЕДМИЦА, lib: КЕШ_СЕДМИЦА };

function htaccessФайлове() {
  const корен = [
    '# ═══════════════════════════════════════════════════════════════════',
    '# Бейби Ленд · Джъмп.бг (LiteSpeed + cPanel)',
    '# ГЕНЕРИРАН от build.js --dzhamp. Не се пипа на ръка: промени build.js,',
    '# иначе следващото сглобяване изтрива поправката.',
    '#',
    '# Заменя _headers и netlify.toml на Netlify, които LiteSpeed не чете.',
    '#',
    '# НАРОЧНО ЛИПСВАТ (всяко е тих или необратим провал):',
    '#   · „всичко към index.html": липсващ скрипт ще дойде като страница',
    '#     със статус 200 и service worker-ът ще го запомни като скрипт;',
    '#   · условни заглавки чрез променливи: на LiteSpeed условието може да',
    '#     се изгуби и тогава sw.js получава кеша на целия сайт;',
    '#   · HSTS: еднопосочна врата, сървърът не може да я отмени;',
    '#   · Options и DirectoryIndex: зависят от AllowOverride и дават 500.',
    '#',
    '# ПРОВЕРКА СЛЕД КАЧВАНЕ:  node dev/proveri_hosta.js https://ДОМЕЙН.bg',
    '# ПЪТ НАЗАД: разархивирай предишния ZIP — той носи и предишния .htaccess.',
    '#   Преименуване на .htaccess.izklyuchen е само за минути: сайтът тръгва,',
    '#   но „/" губи no-cache, а http:// и www вече не водят към един адрес.',
    '# ═══════════════════════════════════════════════════════════════════',
    '',
    'AddDefaultCharset UTF-8',
    '',
    '<IfModule mod_mime.c>',
    '  AddType application/manifest+json .webmanifest',
    '  AddType font/woff2 .woff2',
    '  AddType image/svg+xml .svg',
    '  AddCharset UTF-8 .html .css .js .json .webmanifest .svg',
    '</IfModule>',
    '',
    '<IfModule mod_rewrite.c>',
    '  RewriteEngine On',
    '  # AutoSSL (Let\'s Encrypt) подновява през http://…/.well-known/ — без пренасочване',
    '  RewriteRule ^\\.well-known/ - [L]',
    '  # ЕДИН адрес: за браузъра www и без-www са две отделни кутии с данни',
    '  RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]',
    '  RewriteRule ^ https://%1%{REQUEST_URI} [R=302,L]',
    '  # само https: без него няма service worker (офлайн) и ключалка на дневника',
    '  RewriteCond %{HTTPS} !=on',
    '  RewriteCond %{HTTP:X-Forwarded-Proto} !=https',
    '  RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [R=302,L]',
    '  # 302, а не 301: 301 браузърът помни завинаги и няма път назад.',
    '  # Голият корен „/" (него отваря иконата на телефона) минава през',
    '  # index.html, за да важи и за него правилото за кеша по-долу.',
    '  RewriteRule ^$ index.html [L]',
    '</IfModule>',
    '',
    '<IfModule mod_headers.c>',
    '  Header set X-Content-Type-Options "nosniff"',
    '  Header set Referrer-Policy "no-referrer"',
    '  Header set X-Frame-Options "SAMEORIGIN"',
    '  <Files "sw.js">',
    '    Header set Cache-Control "no-cache, no-store, must-revalidate"',
    '  </Files>',
    '  <FilesMatch "^(index\\.html|manifest\\.webmanifest)$">',
    '    Header set Cache-Control "no-cache"',
    '  </FilesMatch>',
    '</IfModule>',
    '',
  ].join('\n');
  const файлове = { '.htaccess': корен };
  for (const [папка, стойност] of Object.entries(КЕШ_ПО_ПАПКИ)) {
    файлове[папка + '/.htaccess'] = [
      '# Бейби Ленд · Джъмп.бг · генериран от build.js --dzhamp — не се пипа на ръка.',
      '# Същото правило като /' + папка + '/* при Netlify.',
      '<IfModule mod_headers.c>',
      '  Header set Cache-Control "' + стойност + '"',
      // nosniff и тук (преглед 15.09): за LiteSpeed не е документирано дали
      // слива Header от корена с този в подпапката. На Apache е безвредно.
      '  Header set X-Content-Type-Options "nosniff"',
      '</IfModule>',
      '',
    ].join('\n');
  }
  return файлове;
}

// ── ZIP без зависимости ──
// ЗАЩО НЕ Compress-Archive: в Windows PowerShell 5.1 той може да запише
//   имената с обратна черта („js\app.js") и разархиваторът на cPanel прави
//   ФАЙЛ с такова име вместо папка — бял екран. Тук имената са винаги с „/",
//   .htaccess файловете (с точка отпред) влизат, правата са 0644.
function напишиZip(папка, изход) {
  const записи = [];
  (function обход(отн) {
    for (const име of fs.readdirSync(path.join(папка, отн)).sort()) {
      const р = отн ? отн + '/' + име : име;
      if (fs.statSync(path.join(папка, р)).isDirectory()) обход(р); else записи.push(р);
    }
  })('');
  // 🔢 15.09 (преглед): cPanel разархивира ПО РЕДА в архива и не е атомарно
  //   като Netlify. Ако index.html излезе преди js/ и lib/, майка, отворила
  //   приложението в тези секунди, получава НОВАТА страница, която иска
  //   app.js?v=N+1 — а на диска още стои СТАРИЯТ app.js. Service worker-ът го
  //   запомня под новия адрес и тя остава на стария файл до следващото
  //   вдигане. Затова трите входни файла са НАЙ-ОТЗАД, index.html последен.
  const ПОСЛЕДНИ = ['manifest.webmanifest', 'sw.js', 'index.html'];
  записи.sort((а, б) => ПОСЛЕДНИ.indexOf(а) - ПОСЛЕДНИ.indexOf(б));
  const с = new Date();
  const дата = ((с.getFullYear() - 1980) << 9) | ((с.getMonth() + 1) << 5) | с.getDate();
  const час = (с.getHours() << 11) | (с.getMinutes() << 5) | Math.floor(с.getSeconds() / 2);
  const части = [], централа = [];
  let отместване = 0;
  for (const име of записи) {
    const данни = fs.readFileSync(path.join(папка, име));
    const crc = zlib.crc32(данни) >>> 0;
    let тяло = данни, метод = 0;
    if (!/\.(woff2?|png|jpe?g|gif|webp|ico)$/i.test(име)) {
      const сгъстено = zlib.deflateRawSync(данни, { level: 9 });
      if (сгъстено.length < данни.length) { тяло = сгъстено; метод = 8; }
    }
    const имеБ = Buffer.from(име, 'utf8');
    const л = Buffer.alloc(30);
    л.writeUInt32LE(0x04034b50, 0); л.writeUInt16LE(20, 4); л.writeUInt16LE(0x0800, 6);
    л.writeUInt16LE(метод, 8); л.writeUInt16LE(час, 10); л.writeUInt16LE(дата, 12);
    л.writeUInt32LE(crc, 14); л.writeUInt32LE(тяло.length, 18); л.writeUInt32LE(данни.length, 22);
    л.writeUInt16LE(имеБ.length, 26);
    части.push(л, имеБ, тяло);
    const ц = Buffer.alloc(46);
    ц.writeUInt32LE(0x02014b50, 0); ц.writeUInt16LE(0x031E, 4); ц.writeUInt16LE(20, 6); ц.writeUInt16LE(0x0800, 8);
    ц.writeUInt16LE(метод, 10); ц.writeUInt16LE(час, 12); ц.writeUInt16LE(дата, 14);
    ц.writeUInt32LE(crc, 16); ц.writeUInt32LE(тяло.length, 20); ц.writeUInt32LE(данни.length, 24);
    ц.writeUInt16LE(имеБ.length, 28);
    ц.writeUInt32LE((0o100644 << 16) >>> 0, 38);
    ц.writeUInt32LE(отместване, 42);
    централа.push(ц, имеБ);
    отместване += 30 + имеБ.length + тяло.length;
  }
  const цБ = Buffer.concat(централа);
  const край = Buffer.alloc(22);
  край.writeUInt32LE(0x06054b50, 0);
  край.writeUInt16LE(записи.length, 8); край.writeUInt16LE(записи.length, 10);
  край.writeUInt32LE(цБ.length, 12); край.writeUInt32LE(отместване, 16);
  fs.writeFileSync(изход, Buffer.concat(части.concat([цБ, край])));
  return записи;
}

// Четецът е ОТДЕЛЕН от писача: разгъва всеки запис и го сравнява байт по
// байт с файла на диска. Писач, проверен само от себе си, е непроверен.
function провериZip(файл, папка, имена) {
  const b = fs.readFileSync(файл);
  const е = b.length - 22;
  if (b.readUInt32LE(е) !== 0x06054b50) return 'няма край на архива';
  const брой = b.readUInt16LE(е + 10);
  if (брой !== имена.length) return 'записи ' + брой + ' ≠ файлове ' + имена.length;
  let p = b.readUInt32LE(е + 16);
  const поРед = [];
  for (let i = 0; i < брой; i++) {
    if (b.readUInt32LE(p) !== 0x02014b50) return 'счупена централна директория при запис ' + i;
    const метод = b.readUInt16LE(p + 10), crc = b.readUInt32LE(p + 16), сж = b.readUInt32LE(p + 20);
    const дълж = b.readUInt16LE(p + 28), доп = b.readUInt16LE(p + 30), ком = b.readUInt16LE(p + 32);
    const отм = b.readUInt32LE(p + 42);
    const име = b.toString('utf8', p + 46, p + 46 + дълж);
    if (име.indexOf('\\') >= 0) return 'обратна черта в име: ' + име;
    const начало = отм + 30 + b.readUInt16LE(отм + 26) + b.readUInt16LE(отм + 28);
    const тяло = b.subarray(начало, начало + сж);
    const данни = метод === 8 ? zlib.inflateRawSync(тяло) : тяло;
    if ((zlib.crc32(данни) >>> 0) !== crc) return 'CRC не съвпада: ' + име;
    if (!данни.equals(fs.readFileSync(path.join(папка, име)))) return 'съдържанието се разминава: ' + име;
    поРед.push(име);
    p += 46 + дълж + доп + ком;
  }
  if (поРед[поРед.length - 1] !== 'index.html' || поРед[поРед.length - 2] !== 'sw.js')
    return 'index.html и sw.js не са последни в архива: …' + поРед.slice(-3).join(', ');
  return null;
}

function сглобиВ(изход, заNetlify) {
  изтрий(изход);
  fs.mkdirSync(изход, { recursive: true });
  for (const ф of ФАЙЛОВЕ) копирай(path.join(КОРЕН, ф), path.join(изход, ф));
  for (const д of ПАПКИ) копирай(path.join(КОРЕН, д), path.join(изход, д));
  if (заNetlify) {
    fs.writeFileSync(path.join(изход, '_headers'), HEADERS);
    fs.writeFileSync(path.join(изход, '_redirects'), REDIRECTS);
  } else {
    for (const [име, текст] of Object.entries(htaccessФайлове())) fs.writeFileSync(path.join(изход, име), текст);
  }
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

function главна() {
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

  if (!САМО_ПРОВЕРКА) сглобиВ(ИЗХОД, true);

  // ── СВЕРЯВАНЕ: всеки ?v= в index.html има ли го наистина в пакета ──
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
  function липсващи(корен) {
    let н = 0;
    for (const p of пътища) {
      if (!fs.existsSync(path.join(корен, p))) { н++; console.log('🔴 index.html сочи липсващ файл: ' + p); }
    }
    return н;
  }
  const липсват = липсващи(САМО_ПРОВЕРКА ? КОРЕН : ИЗХОД);

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

  if (!ЗА_ДЖАМП || САМО_ПРОВЕРКА) return;

  // ── Джъмп.бг ──
  сглобиВ(ИЗХОД_ДЖАМП, false);
  const липсДж = липсващи(ИЗХОД_ДЖАМП);
  const имена = напишиZip(ИЗХОД_ДЖАМП, ZIP_ДЖАМП);
  const беля = провериZip(ZIP_ДЖАМП, ИЗХОД_ДЖАМП, имена);
  const р = размер(ИЗХОД_ДЖАМП);
  const ht = имена.filter(x => /(^|\/)\.htaccess$/.test(x));
  console.log('');
  console.log('🇧🇬 ПАКЕТ ЗА ДЖЪМП.БГ (LiteSpeed + cPanel)');
  console.log('   dist-dzhamp/: ' + р.файла + ' файла · ' + (р.байта / 1048576).toFixed(2) + ' МБ · без _headers и _redirects');
  console.log('   .htaccess: ' + ht.length + ' — ' + ht.join(' · '));
  console.log('   пътища в index.html: ' + пътища.size + ' · липсващи: ' + липсДж);
  console.log('   ' + path.basename(ZIP_ДЖАМП) + ': ' + имена.length + ' записа · ' + (fs.statSync(ZIP_ДЖАМП).size / 1048576).toFixed(2) + ' МБ');
  console.log('   ZIP-ът, прочетен обратно: ' + (беля ? '🔴 ' + беля : 'всеки запис разгънат — CRC и байтовете съвпадат с dist-dzhamp/'));
  if (липсДж || беля) { console.log('🔴 ПАКЕТЪТ ЗА ДЖЪМП Е СЧУПЕН'); process.exit(1); }
  console.log('✅ качи ZIP-а в public_html и го разархивирай ТАМ (не в подпапка)');
}

module.exports = { HEADERS, REDIRECTS, ПАПКИ, ФАЙЛОВЕ, КЕШ_ПО_ПАПКИ, htaccessФайлове, напишиZip, провериZip };
if (require.main === module) главна();
