// 🧪 21.10 · достъп · ЛОКАЛНИЯТ СЪРВЪР С /api ЗА ПРОБИТЕ
// Сервира статичните файлове от корена (като dev/proba/server.js, без кеш) И пуска /api/* през
// makeApi (netlify/functions/_lib/api.mjs) — СЪЩИЯТ код като на Netlify, но хранилището е В ПАМЕТТА
// (repo.mjs · makeRepoVPamet): всяко пускане почва празно, нищо не се пише на диска, нищо не излиза навън.
// Админ: aaeromove@gmail.com (admins.mjs) + --admin=… по желание.
//
// ПУСКАНЕ:  node dev/proba/server_api.js [порт=8914] [--dist] [--sega=2026-11-05T09:00:00Z] [--admin=x@y.bg]
//   --dist      сервира dist/ вместо корена (след node build.js)
//   --sega=ISO  часовникът на сървъра почва от този момент и тече нататък (за проба на изтичането:
//               регистрирай се, спри, пусни пак с --sega=+15 дни … или ползвай превъртането долу)
//   --admin=…   още администратори (като ADMIN_EMAILS в Netlify), със запетая
// ПРЕВЪРТАНЕ НА ЧАСОВНИКА БЕЗ РЕСТАРТ (само тук, на Netlify го няма):
//   GET  /__dev/chasovnik                 → {sega}
//   POST /__dev/chasovnik  {"dni": 15}    → часовникът напред с 15 дни · {"sega": "ISO"} → точно там · {"sega": null} → истинското време
//   Другият път за изтичане: админ действие set_until с дата в миналото.
// БИСКВИТКАТА е Secure — Chrome и curl ≥ 7.79 я приемат на http://localhost (не на IP от мрежата).
// ПЪТ НАЗАД: само чете файлове; махни този файл.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const арг = process.argv.slice(2);
const ПОРТ = Number(арг.find(a => /^\d+$/.test(a)) || 8914);
const стойност = (име) => { const a = арг.find(x => x.startsWith('--' + име + '=')); return a ? a.slice(име.length + 3) : null; };
const ПРОЕКТ = path.resolve(__dirname, '..', '..');
const КОРЕН = path.join(ПРОЕКТ, арг.includes('--dist') ? 'dist' : '');
const LIB = path.join(ПРОЕКТ, 'netlify', 'functions', '_lib');
const ВИД = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.mp3': 'audio/mpeg', '.txt': 'text/plain; charset=utf-8' };

// ── часовникът ──
let отместване = 0;
const сегаISO = стойност('sega');
if (сегаISO) {
  const t = Date.parse(сегаISO);
  if (isNaN(t)) { console.error('🔴 --sega не е дата: ' + сегаISO); process.exit(2); }
  отместване = t - Date.now();
}
const часовник = () => new Date(Date.now() + отместване);

function прочетиТяло(req, таван = 65536) {
  return new Promise((готово, грешка) => {
    const части = []; let дълж = 0;
    req.on('data', ч => { дълж += ч.length; if (дълж > таван) { грешка(new Error('твърде голямо')); req.destroy(); } else части.push(ч); });
    req.on('end', () => готово(Buffer.concat(части)));
    req.on('error', грешка);
  });
}
function пратиJson(res, статус, тяло) {
  res.writeHead(статус, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(тяло));
}

async function главна() {
  const внеси = ф => import(pathToFileURL(path.join(LIB, ф)).href);
  const core = await внеси('core.mjs');
  const { makeApi } = await внеси('api.mjs');
  const { makeRepoVPamet } = await внеси('repo.mjs');
  const { ADMINS } = await внеси('admins.mjs');
  const допълнителни = стойност('admin') || '';
  const админи = core.parseAdminEmails(ADMINS.join(',') + ',' + допълнителни);
  const api = makeApi({ repo: makeRepoVPamet(), adminEmails: () => админи, now: часовник });

  http.createServer(async (req, res) => {
    let п;
    try { п = decodeURIComponent((req.url || '/').split('?')[0]); } catch (e) { res.writeHead(400); return res.end(); }

    // ── превъртане на часовника (само локално) ──
    if (п === '/__dev/chasovnik') {
      if (req.method === 'POST') {
        let j = {};
        try { j = JSON.parse((await прочетиТяло(req)).toString('utf8') || '{}'); } catch (e) { return пратиJson(res, 400, { error: 'JSON' }); }
        if (Number.isFinite(j.dni)) отместване += j.dni * 86400000;
        else if (j.sega === null) отместване = 0;
        else if (typeof j.sega === 'string' && !isNaN(Date.parse(j.sega))) отместване = Date.parse(j.sega) - Date.now();
        else return пратиJson(res, 400, { error: 'дай {"dni": N} или {"sega": "ISO"|null}' });
      }
      console.log('⏱️  часовникът: ' + часовник().toISOString());
      return пратиJson(res, 200, { sega: часовник().toISOString() });
    }

    // ── /api/* → същият код като на Netlify ──
    if (п.startsWith('/api/')) {
      const fn = api.PATISHTA[п];
      let отговор;
      try {
        const тяло = req.method === 'GET' || req.method === 'HEAD' ? undefined : await прочетиТяло(req);
        const заглавки = new Headers();
        for (const [к, ст] of Object.entries(req.headers)) if (typeof ст === 'string') заглавки.set(к, ст);
        const заявка = new Request('http://localhost:' + ПОРТ + req.url, { method: req.method, headers: заглавки, body: тяло && тяло.length ? тяло : undefined });
        отговор = fn ? await fn(заявка, { ip: req.socket.remoteAddress || '' }) : api.nyama();
      } catch (e) {
        console.error('🔴 /api:', e && e.message);
        return пратиJson(res, 500, { error: 'локалният сървър: ' + (e && e.message) });
      }
      const изход = {};
      отговор.headers.forEach((ст, к) => { if (к.toLowerCase() !== 'set-cookie') изход[к] = ст; });
      const бисквитки = typeof отговор.headers.getSetCookie === 'function' ? отговор.headers.getSetCookie() : [];
      if (бисквитки.length) изход['Set-Cookie'] = бисквитки;
      const буфер = Buffer.from(await отговор.arrayBuffer());
      res.writeHead(отговор.status, изход);
      res.end(буфер);
      console.log('   ' + req.method + ' ' + п + ' → ' + отговор.status);
      return;
    }

    // ── статичните файлове (като server.js) ──
    if (п.endsWith('/')) п += 'index.html';
    const ф = path.join(КОРЕН, п);
    if (!ф.startsWith(КОРЕН)) { res.writeHead(403); return res.end(); }
    fs.readFile(ф, (г, д) => {
      if (г) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('404 ' + п); }
      res.writeHead(200, { 'Content-Type': ВИД[path.extname(ф).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(д);
    });
  }).listen(ПОРТ, () => {
    console.log('🧪 http://localhost:' + ПОРТ + '/  ←  ' + КОРЕН);
    console.log('   /api/* в паметта · админи: ' + [...админи].join(', ') + ' · часовник: ' + часовник().toISOString());
  });
}
главна().catch(e => { console.error('🔴', e); process.exit(1); });
