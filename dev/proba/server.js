// 🧪 ТЕСТОВИЯТ СЪРВЪР за пробите (cdp_proba.js, obikolka.js, razpyani.js).
// Сервира корена на проекта (или dist/ с --dist) без кеш, за да се вижда всяка промяна веднага.
// ПУСКАНЕ:  node dev/proba/server.js [порт=8911] [--dist]
// ПЪТ НАЗАД: само чете файлове.
const http = require('http');
const fs = require('fs');
const path = require('path');
const ПОРТ = Number(process.argv.find(a => /^\d+$/.test(a)) || 8911);
const КОРЕН = path.resolve(__dirname, '..', '..', process.argv.includes('--dist') ? 'dist' : '');
const ВИД = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.mp3': 'audio/mpeg', '.txt': 'text/plain; charset=utf-8' };
http.createServer((req, res) => {
  let п = decodeURIComponent((req.url || '/').split('?')[0]);
  if (п.endsWith('/')) п += 'index.html';
  const ф = path.join(КОРЕН, п);
  if (!ф.startsWith(КОРЕН)) { res.writeHead(403); return res.end(); }
  fs.readFile(ф, (г, д) => {
    if (г) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('404 ' + п); }
    res.writeHead(200, { 'Content-Type': ВИД[path.extname(ф).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(д);
  });
}).listen(ПОРТ, () => console.log('🧪 http://localhost:' + ПОРТ + '/  ←  ' + КОРЕН));
