// ⏱️ СТАРТЪТ НА БАВНА МРЕЖА (18.11.2026): нов човек (чист профил всеки път), Slow 4G + CPU ×4.
// Мери: кога се показва стартовият екран, DOMContentLoaded, кога ПРИБИРА стартовия екран (= първият екран),
// кога има BL_DOSTAP и кога идва знанието (window.KB), и колко байта са минали дотогава.
// За сравнение на варианти на index.html: пусни br сървъра (scratchpad red/br_server.js) с подмяна „index.html=файл“.
// ПУСКАНЕ: node dev/proba/start_merene_proba.js --port 8917 [--n 2] [--ime V0]
const { spawn } = require('child_process'); const path = require('path'); const fs = require('fs');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; } }
const АДРЕС = арг.url ? арг.url.replace(/\/?$/, '/') + 'index.html' : 'http://127.0.0.1:' + (арг.port || 8917) + '/index.html';
const N = +(арг.n || 2), ИМЕ = арг.ime || '?';
const пауза = ms => new Promise(r => setTimeout(r, ms));
async function едно() {
  const ПРОФИЛ = path.join(__dirname, 'chrome_pr_start_' + Date.now()); const ПОРТ = 9200 + Math.floor(Math.random() * 700);
  const ch = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=' + (process.env.BL_PROZOREC || '360,800')].concat((process.env.BL_CHROME_FLAGS || '').split(' ').filter(Boolean), ['about:blank']), { stdio: 'ignore' });
  const махни = () => { try { ch.kill(); } catch (e) {} return пауза(1200).then(() => { try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {} }); };
  let цел; for (let i = 0; i < 80 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + ПОРТ + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
  if (!цел) { await махни(); return null; }
  const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let n = 0; const ч = new Map(); let байтове = 0; let грешки = 0;
  const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  ws.onmessage = e => { const м = JSON.parse(e.data); if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); }
    if (м.method === 'Network.loadingFinished') байтове += м.params.encodedDataLength || 0; if (м.method === 'Runtime.exceptionThrown') грешки++; };
  const изр = async x => { const р = await send('Runtime.evaluate', { expression: x, returnByValue: true }); return р.result && р.result.result ? р.result.result.value : null; };
  await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 800, deviceScaleFactor: 2, mobile: true });
  await send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await send('Network.emulateNetworkConditions', { offline: false, latency: 562.5, downloadThroughput: 180000, uploadThroughput: 84375 });
  const t0 = Date.now(); await send('Page.navigate', { url: АДРЕС });
  const р = { сплашИзлезе: null, сплашПрибран: null, достъп: null, знание: null, байтовеДоЕкрана: null };
  while (Date.now() - t0 < 150000) {
    const с = await изр("JSON.stringify({ sp: !!document.getElementById('blSplash'), d: !!window.BL_DOSTAP, kb: !!(window.KB && KB.entries && KB.entries.length) })");
    const т = Date.now() - t0;
    if (с) { const о = JSON.parse(с);
      if (о.sp && р.сплашИзлезе === null) р.сплашИзлезе = т;
      if (!о.sp && р.сплашИзлезе !== null && р.сплашПрибран === null) { р.сплашПрибран = т; р.байтовеДоЕкрана = байтове; }
      if (о.d && р.достъп === null) р.достъп = т;
      if (о.kb && р.знание === null) р.знание = т;
      // 18.11 --tarsi: 2 s след махането на стартовия екран — търсене „температура“: кога има резултати и колко са статии
      if (арг.tarsi && р.сплашПрибран !== null && р.търсене === undefined && т >= р.сплашПрибран + 2000) {
        const tТ = Date.now();
        await изр("(() => { if (window.BL_SEARCH) BL_SEARCH.open(); const i = document.getElementById('searchInput'); if (!i) return 0; i.value = 'температура'; i.dispatchEvent(new Event('input', { bubbles: true })); return 1; })()");
        let резТ = null; while (Date.now() - tТ < 10000) { const к = await изр("(() => { const b = document.getElementById('searchResults'); if (!b) return null; const т = b.textContent || ''; if (т.length < 40 || /Секунда — зареждам/.test(т)) return null; return { редове: b.querySelectorAll('button, a').length, статии: [...b.querySelectorAll('button, a')].filter(x => /статия/i.test(x.textContent)).length }; })()"); if (к) { резТ = к; break; } await пауза(150); }
        р.търсене = резТ ? { ms: Date.now() - tТ, ...резТ } : { ms: -1 };
        await изр("(() => { if (window.BL_SEARCH && BL_SEARCH.close) BL_SEARCH.close(); return 1; })()");
      }
      if (р.сплашПрибран !== null && р.знание !== null && (!арг.tarsi || р.търсене !== undefined)) break; }
    await пауза(250);
  }
  р.dcl = await изр("Math.round((performance.getEntriesByType('navigation')[0] || {}).domContentLoadedEventEnd || 0)");
  р.грешки = грешки;
  try { ws.close(); } catch (e) {} await махни();
  return р;
}
(async () => {
  await require('./slot.js')('chrome');
  const всички = [];
  for (let i = 0; i < N; i++) { const р = await едно(); if (р) { всички.push(р); console.log(ИМЕ + ' #' + (i + 1) + ' · стартов екран ' + р.сплашИзлезе + ' · DCL ' + р.dcl + ' · ПЪРВИЯТ ЕКРАН ' + р.сплашПрибран + ' ms · BL_DOSTAP ' + р.достъп + ' · знанието ' + р.знание + ' ms · байтове до екрана ' + (р.байтовеДоЕкрана / 1e6).toFixed(2) + ' MB · JS грешки ' + р.грешки + (р.търсене ? ' · ТЪРСЕНЕ +2 s: ' + (р.търсене.ms >= 0 ? р.търсене.ms + ' ms · редове ' + р.търсене.редове + ' · статии ' + р.търсене.статии : 'НЯМА резултати за 10 s') : '')); } }
  const мед = к => { const a = всички.map(x => x[к]).filter(x => x !== null).sort((a, b) => a - b); return a.length ? a[Math.floor((a.length - 1) / 2)] : null; };
  console.log(ИМЕ + ' МЕДИАНА · първият екран ' + мед('сплашПрибран') + ' ms · DCL ' + мед('dcl') + ' · знанието ' + мед('знание') + ' ms');
  process.exit(0);
})();
