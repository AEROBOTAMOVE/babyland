// ═══════════════════════════════════════════════════════════
// 🌐 СТАТИЧЕН СЪРВЪР ЗА ПРЕГЛЕД — на Node, защото перлът виси
//
// ЗАЩО СЪЩЕСТВУВА (26.08.2026): dev/statichttp.pl е ЕДНОНИШКОВ и днес ме
// спъна ТРИ пъти. Причината не е една, а две, и втората не се лекува с
// кръпка:
//   1. `<$cl>` блокира, докато не дойде ред. Отвори ли браузърът връзка
//      предварително (preconnect, keep-alive) и не прати нищо, сървърът
//      застива на нея и НИТО ЕДНА следваща заявка не се обслужва. Сложих
//      срок за четене (IO::Select) — това го оправи.
//   2. Но `print $cl $body` блокира СЪЩО, когато клиентът не чете достатъчно
//      бързо. Страницата тегли 114 файла; докато машината е натоварена,
//      един бавен клиент спира целия сървър. Отвън изглежда като „умрял".
// Кръпка по кръпка на еднонишков сървър е губене на време. Node обслужва
// връзките едновременно по устройство — целият клас проблем изчезва.
//
// ПУСКАНЕ: node dev/statichttp.js [порт]     (по подразбиране 8791)
// ПЪТ НАЗАД: dev/statichttp.pl стои непокътнат и още работи за прости случаи.
//
// 🪤 КАПАНИТЕ, ОБМИСЛЕНИ:
//   · Излизане от папката: `..` в адреса не бива да дава достъп нагоре.
//     Пътят се нормализира и се проверява, че остава в корена.
//   · Кирилица в имената: адресът се декодира с decodeURIComponent.
//   · Обслужващият работник иска ТОЧЕН тип за sw.js — иначе браузърът
//     отказва да го регистрира.
//   · Кеш: `no-store`, за да не се налага да се гадае дали виждаш новото.
//   · Само GET и HEAD. Нищо не се записва — това е сървър за ГЛЕДАНЕ.
// ═══════════════════════════════════════════════════════════
const http = require('http');
const fs = require('fs');
const path = require('path');

const ПОРТ = Number(process.argv[2]) || 8791;
const КОРЕН = path.resolve(__dirname, '..');

const ТИПОВЕ = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.ico': 'image/x-icon', '.md': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4'
};

const сървър = http.createServer((зая, отг) => {
  if (зая.method !== 'GET' && зая.method !== 'HEAD') {
    отг.writeHead(405, { 'Content-Length': 0 }); отг.end(); return;
  }
  // 🪤 `url.parse()` е остарял (Node сам предупреждава: DEP0169, без CVE-та за
  //   дупките му). Новият URL иска пълен адрес, затова се дава основа.
  let път;
  try { път = decodeURIComponent(new URL(зая.url, 'http://x').pathname || '/'); }
  catch (e) { отг.writeHead(400, { 'Content-Length': 0 }); отг.end(); return; }
  if (път === '/' || път === '') път = '/index.html';

  // 🪤 без излизане нагоре: нормализираме и настояваме да сме в корена
  const цел = path.resolve(КОРЕН, '.' + път);
  if (цел !== КОРЕН && !цел.startsWith(КОРЕН + path.sep)) {
    отг.writeHead(403, { 'Content-Length': 0 }); отг.end(); return;
  }

  fs.stat(цел, (гр, ст) => {
    if (гр || !ст.isFile()) { отг.writeHead(404, { 'Content-Length': 0 }); отг.end(); return; }
    const тип = ТИПОВЕ[path.extname(цел).toLowerCase()] || 'application/octet-stream';
    отг.writeHead(200, {
      'Content-Type': тип,
      'Content-Length': ст.size,
      'Cache-Control': 'no-store',
      // обслужващият работник има право да управлява целия сайт
      'Service-Worker-Allowed': '/'
    });
    if (зая.method === 'HEAD') { отг.end(); return; }
    const поток = fs.createReadStream(цел);
    поток.on('error', () => { try { отг.destroy(); } catch (e) {} });
    поток.pipe(отг);
  });
});

// връзка, която не праща нищо, не бива да държи ресурс вечно
сървър.headersTimeout = 10000;
сървър.requestTimeout = 30000;
сървър.keepAliveTimeout = 5000;

сървър.on('error', гр => {
  if (гр.code === 'EADDRINUSE') {
    console.log('🔴 порт ' + ПОРТ + ' е зает. Спри другия сървър или дай друг порт:');
    console.log('   node dev/statichttp.js 8792');
  } else console.log('🔴 ' + гр.message);
  process.exit(1);
});

сървър.listen(ПОРТ, '127.0.0.1', () => {
  console.log('🌐 http://127.0.0.1:' + ПОРТ + '/   от ' + КОРЕН);
  console.log('   (Node — обслужва връзките едновременно; перлената версия висеше)');
});
