// 🧪 22.10 · Cloudflare · ЛОКАЛНИЯТ СЪРВЪР, КОЙТО СЕ ДЪРЖИ КАТО WORKER + STATIC ASSETS + D1
// /api/*            → worker/index.mjs (СЪЩИЯТ Worker, който отива в Cloudflare) · env.DB = D1-шим (node:sqlite в паметта,
//                     миграциите migrations/*.sql приложени при старт) · CF-Connecting-IP = адресът на клиента
// всичко друго      → като Cloudflare по wrangler.toml: run_worker_first само за /api/*; има файл → файлът (+ правилата от
//                     dist/_headers); няма файл и е навигация → index.html (single-page-application); няма файл и НЕ е
//                     навигация → Worker-ът (той вика env.ASSETS.fetch → SPA → index.html, и пази .js/.css от HTML 200).
//                     html_handling = "none": /index.html → 200 (без 307).
// Всяко пускане почва с празна база. Нищо не излиза навън.
// ПУСКАНЕ:  node dev/proba/server_cf.js [порт=8916] [--koren] [--sega=ISO] [--admin=x@y.bg]
//   --koren  сервира корена вместо dist/ (по подразбиране е dist/ — точно каквото отива в Cloudflare; първо node build.js)
//   --admin  като ADMIN_EMAILS в Cloudflare
//   POST /__dev/chasovnik {"dni": N} | {"sega": "ISO"|null} — превърта часовника (само тук)
// ПЪТ НАЗАД: само чете файлове; махни този файл.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

const арг = process.argv.slice(2);
const ПОРТ = Number(арг.find(a => /^\d+$/.test(a)) || 8916);
const стойност = (име) => { const a = арг.find(x => x.startsWith('--' + име + '=')); return a ? a.slice(име.length + 3) : null; };
const ПРОЕКТ = path.resolve(__dirname, '..', '..');
const КОРЕН = арг.includes('--koren') ? ПРОЕКТ : path.join(ПРОЕКТ, 'dist');
const ВИД = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.mp3': 'audio/mpeg', '.txt': 'text/plain; charset=utf-8' };

let отместване = 0;
if (стойност('sega')) { const t = Date.parse(стойност('sega')); if (isNaN(t)) { console.error('🔴 --sega'); process.exit(2); } отместване = t - Date.now(); }
const часовник = () => new Date(Date.now() + отместване);

// ── dist/_headers (формат на Cloudflare/Netlify): път → заглавки; * = всичко нататък ──
function правилаЗаглавки() {
  const ф = path.join(КОРЕН, '_headers');
  if (!fs.existsSync(ф)) return [];
  const правила = []; let тек = null;
  for (const ред of fs.readFileSync(ф, 'utf8').split(/\r?\n/)) {
    if (!ред.trim() || /^\s*#/.test(ред)) continue;
    if (!/^\s/.test(ред)) { тек = { път: ред.trim(), з: [] }; правила.push(тек); continue; }
    const i = ред.indexOf(':'); if (тек && i > 0) тек.з.push([ред.slice(0, i).trim(), ред.slice(i + 1).trim()]);
  }
  return правила;
}
const ЗАГЛАВКИ = правилаЗаглавки();
function заглавкиЗа(п) {
  const изход = {};
  for (const пр of ЗАГЛАВКИ) {
    const ок = пр.път.endsWith('*') ? п.startsWith(пр.път.slice(0, -1)) : п === пр.път;
    if (!ок) continue;
    for (const [к, ст] of пр.з) изход[к] = изход[к] && к.toLowerCase() !== 'content-type' ? изход[к] + ', ' + ст : ст;   // като Cloudflare: повторените се лепят със запетая
  }
  return изход;
}
function файлЗа(п) {
  if (п === '/' ) return null;                      // html_handling "none": "/" няма файл → not_found_handling
  const ф = path.join(КОРЕН, п);
  if (!ф.startsWith(КОРЕН) || /(^|[\\/])_(headers|redirects)$/.test(ф)) return null;
  try { return fs.statSync(ф).isFile() ? ф : null; } catch (e) { return null; }
}
function отговорОтФайл(ф, п, статус = 200) {
  return new Response(fs.readFileSync(ф), { status: статус, headers: { 'Content-Type': ВИД[path.extname(ф).toLowerCase()] || 'application/octet-stream', ...заглавкиЗа(п) } });
}
// env.ASSETS.fetch — файлът, иначе index.html (single-page-application)
const ASSETS = {
  async fetch(заявка) {
    const п = decodeURIComponent(new URL(заявка.url).pathname);
    const ф = файлЗа(п);
    if (ф) return отговорОтФайл(ф, п);
    return отговорОтФайл(path.join(КОРЕН, 'index.html'), п);
  },
};

function прочетиТяло(req, таван = 65536) {
  return new Promise((готово, грешка) => {
    const части = []; let дълж = 0;
    req.on('data', ч => { дълж += ч.length; if (дълж > таван) { грешка(new Error('твърде голямо')); req.destroy(); } else части.push(ч); });
    req.on('end', () => готово(Buffer.concat(части)));
    req.on('error', грешка);
  });
}

async function главна() {
  const внеси = ф => import(pathToFileURL(path.join(ПРОЕКТ, ф)).href);
  // 24.10 · BL_WORKER_BUNDLE = пакетът, който wrangler наистина качва („wrangler deploy --dry-run --outdir X“ → X/index.js),
  //   вместо изходния worker/index.mjs — за да се мери СЪЩИЯТ код, който отива в Cloudflare (esbuild, глобален обхват).
  const { makeWorker } = process.env.BL_WORKER_BUNDLE
    ? await import(pathToFileURL(path.resolve(process.env.BL_WORKER_BUNDLE)).href)
    : await внеси('worker/index.mjs');
  const { makeD1, prilozhiMigracii } = await внеси('dev/proba/d1_shim.mjs');
  const DB = makeD1();
  const миграции = await prilozhiMigracii(DB);
  const env = { DB, ASSETS, ADMIN_EMAILS: стойност('admin') || '' };
  const worker = makeWorker({ now: часовник });

  http.createServer(async (req, res) => {
    let п;
    try { п = decodeURIComponent((req.url || '/').split('?')[0]); } catch (e) { res.writeHead(400); return res.end(); }
    if (п === '/__dev/chasovnik') {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      if (req.method === 'POST') {
        let j = {}; try { j = JSON.parse((await прочетиТяло(req)).toString('utf8') || '{}'); } catch (e) { res.writeHead(400); return res.end('{}'); }
        if (Number.isFinite(j.dni)) отместване += j.dni * 86400000;
        else if (j.sega === null) отместване = 0;
        else if (typeof j.sega === 'string' && !isNaN(Date.parse(j.sega))) отместване = Date.parse(j.sega) - Date.now();
      }
      return res.end(JSON.stringify({ sega: часовник().toISOString() }));
    }
    let отговор, през = 'файл';
    try {
      const тяло = req.method === 'GET' || req.method === 'HEAD' ? undefined : await прочетиТяло(req);
      const заглавки = new Headers();
      for (const [к, ст] of Object.entries(req.headers)) if (typeof ст === 'string') заглавки.set(к, ст);
      заглавки.set('CF-Connecting-IP', req.socket.remoteAddress || '');
      const заявка = new Request('http://localhost:' + ПОРТ + req.url, { method: req.method, headers: заглавки, body: тяло && тяло.length ? тяло : undefined });
      const ф = файлЗа(п);
      const навигация = (req.headers['sec-fetch-mode'] || '') === 'navigate';
      if (п === '/api' || п.startsWith('/api/')) { през = 'worker'; отговор = await worker.fetch(заявка, env, {}); }   // run_worker_first
      else if (ф) отговор = отговорОтФайл(ф, п);
      else if (навигация) { през = 'spa'; отговор = await ASSETS.fetch(заявка); }
      else { през = 'worker'; отговор = await worker.fetch(заявка, env, {}); }
    } catch (e) {
      console.error('🔴', e && e.stack);
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('локалният сървър: ' + (e && e.message));
    }
    const изход = {};
    отговор.headers.forEach((ст, к) => { if (к.toLowerCase() !== 'set-cookie') изход[к] = ст; });
    const бисквитки = typeof отговор.headers.getSetCookie === 'function' ? отговор.headers.getSetCookie() : [];
    if (бисквитки.length) изход['Set-Cookie'] = бисквитки;
    if (!('cache-control' in изход)) изход['cache-control'] = 'no-store';   // пробата не бива да мери стар кеш на браузъра
    const буфер = Buffer.from(await отговор.arrayBuffer());
    res.writeHead(отговор.status, изход);
    res.end(req.method === 'HEAD' ? undefined : буфер);
    if (през !== 'файл' || отговор.status >= 400) console.log('   ' + req.method + ' ' + п + ' → ' + отговор.status + ' [' + през + ']');
  }).listen(ПОРТ, () => {
    console.log('🧪 http://localhost:' + ПОРТ + '/  ←  ' + КОРЕН + ' · Worker + D1-шим · миграции: ' + миграции.join(', '));
    console.log('   админи: aaeromove@gmail.com' + (env.ADMIN_EMAILS ? ' + ' + env.ADMIN_EMAILS : '') + ' · часовник: ' + часовник().toISOString());
  });
}
главна().catch(e => { console.error('🔴', e); process.exit(1); });
