// 🐢 ВРАТАТА НА 2G (18.11.2026): /api/me не отговаря 15 s (pl-dostap.js апи() прекъсва) — какво вижда човекът?
// /api/* и (с --staro) js/pl-dostap.js се подменят през CDP Fetch САМО в браузъра на пробата. Локален сървър.
//   A · нов човек, /api/me виси 20 s, после 401 (и на повторната проверка 401) → трябва „врата“ (рег), не „офлайн“
//   B · нов човек, виси, а повторната проверка дава 200 (има сесия) → „врата“, после „вътре“
//   C · виси, но има кеш с достъп → решава кешът („вътре“), както досега
//   D · истински офлайн (navigator.onLine=false), без кеш → „офлайн“, както досега
// ПУСКАНЕ: node dev/proba/vrata_2g_proba.js [--port 8912] [--staro файл]  (--staro = старото pl-dostap.js за „преди“)
const { spawn } = require('child_process'); const path = require('path'); const fs = require('fs');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; } }
const АДРЕС = 'http://127.0.0.1:' + (арг.port || 8912) + '/index.html';
const пауза = ms => new Promise(r => setTimeout(r, ms));
const старо = арг.staro ? Buffer.from(fs.readFileSync(арг.staro, 'utf8')).toString('base64') : null;
(async () => {
  await require('./slot.js')('chrome');
  const ПРОФИЛ = path.join(__dirname, 'chrome_pr_2g_' + Date.now()); const ПОРТ = 9200 + Math.floor(Math.random() * 700);
  const ch = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=360,800', 'about:blank'], { stdio: 'ignore' });
  const край = к => { try { ch.kill(); } catch (e) {} setTimeout(() => { try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {} process.exit(к); }, 1500); };
  let цел; for (let i = 0; i < 80 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + ПОРТ + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
  if (!цел) { console.log('🔴 Chrome не тръгна'); return край(3); }
  const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let n = 0; const ч = new Map(); const грешки = [];
  let отговори = [];   // какво да даде /api/me при поредна заявка: 'виси' | 401 | 200
  let заявкиМе = 0;
  const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  const b64 = о => Buffer.from(JSON.stringify(о)).toString('base64');
  const З = [{ name: 'Content-Type', value: 'application/json; charset=utf-8' }, { name: 'Cache-Control', value: 'no-store' }];
  const дай = (id, код) => send('Fetch.fulfillRequest', { requestId: id, responseCode: код, responseHeaders: З, body: код === 200 ? b64({ user: { email: 'proba@example.test', status: 'active', access_until: new Date(Date.now() + 14 * 864e5).toISOString(), proben: true } }) : b64({ error: 'Нужен е вход.' }) }).catch(() => {});
  ws.onmessage = e => { const м = JSON.parse(e.data); if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); }
    if (м.method === 'Runtime.exceptionThrown') { const d = м.params.exceptionDetails; грешки.push(((d.exception && d.exception.description) || d.text).split('\n')[0]); }
    if (м.method === 'Fetch.requestPaused') { const id = м.params.requestId, u = м.params.request.url;
      if (старо && /\/js\/pl-dostap\.js/.test(u)) return send('Fetch.fulfillRequest', { requestId: id, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'application/javascript; charset=utf-8' }, { name: 'Cache-Control', value: 'no-store' }], body: старо });
      if (/\/api\/me/.test(u)) { const к = отговори.length ? отговори.shift() : 401; заявкиМе++;
        if (к === 'виси') setTimeout(() => дай(id, 401), 20000); else дай(id, к); return; }
      if (/\/api\//.test(u)) return дай(id, 401);
      send('Fetch.continueRequest', { requestId: id }); } };
  const изр = async x => { const р = await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true }); return р.result && р.result.result ? р.result.result.value : null; };
  const чакай = async (x, ms) => { const t = Date.now(); while (Date.now() - t < ms) { if (await изр(x)) return Date.now() - t; await пауза(200); } return -1; };
  await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable');
  await send('Network.setBypassServiceWorker', { bypass: true }); await send('Network.setCacheDisabled', { cacheDisabled: true });
  await send('Fetch.enable', { patterns: [{ urlPattern: '*/api/*', requestStage: 'Request' }, { urlPattern: '*pl-dostap.js*', requestStage: 'Request' }] });   // само тях — '*' бавеше зареждането до 30 s
  await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 800, deviceScaleFactor: 2, mobile: true });
  const РЕЖИМ = "window.BL_DOSTAP && BL_DOSTAP.състояние().режим";
  const рез = []; let червени = 0; const пр = (и, у, д) => { рез.push((у ? '✅ ' : '🔴 ') + и + (д ? ' · ' + д : '')); if (!у) червени++; };
  const сценарий = async (име, { отг, кеш, офлайн }, очаквам) => {
    отговори = отг.slice(); заявкиМе = 0;
    await send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    await send('Page.navigate', { url: АДРЕС }); await пауза(1500);
    await изр(`(() => { localStorage.clear(); localStorage.setItem('bl_tour_done', '1'); ${кеш ? "localStorage.setItem('bl_dostap', JSON.stringify({ status: 'active', access_until: new Date(Date.now() + 5 * 864e5).toISOString(), admin: false, email: 'proba@example.test', proveren: new Date().toISOString(), proben: true }));" : ''} return 1; })()`);
    отговори = отг.slice(); заявкиМе = 0;
    const t0 = Date.now(); await send('Page.reload');
    // часовникът тръгва, щом вратата съществува (зареждането не се брои)
    let tД = Date.now(); for (let i = 0; i < 200; i++) { if (await изр('!!window.BL_DOSTAP')) { tД = Date.now(); break; } await пауза(200); }
    // D: страницата е заредена с мрежа, /api/me виси — СЕГА мрежата пада (navigator.onLine=false)
    if (офлайн) await send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
    // хронология на режима за 32 s (15 s прекъсване + 8 s повторна проверка + запас)
    const хрон = []; let посл = null;
    while (Date.now() - tД < 40000) { let р = null; try { р = await изр(РЕЖИМ); } catch (e) {} if (р && р !== посл) { хрон.push(((Date.now() - t0) / 1000).toFixed(1) + 's ' + р); посл = р; } await пауза(300); }
    const онлайн = await изр('navigator.onLine');
    пр(име + ' → ' + очаквам.join(' → '), JSON.stringify(хрон.map(x => x.split(' ')[1]).filter(x => x !== 'чака')) === JSON.stringify(очаквам), хрон.join(' · ') + ' · /api/me заявки ' + заявкиМе + ' · onLine ' + онлайн);
  };
  console.log((старо ? 'ПРЕДИ (старото pl-dostap.js)' : 'СЛЕД (работното копие)') + ' · ' + АДРЕС);
  await сценарий('A нов човек, /api/me виси 20 s, после 401', { отг: ['виси', 401, 401, 401] }, ['врата']);
  await сценарий('B нов човек, виси, повторната проверка → 200', { отг: ['виси', 200] }, ['врата', 'вътре']);
  await сценарий('C виси, но има кеш с достъп', { отг: ['виси', 401], кеш: true }, ['вътре']);
  await сценарий('D мрежата пада, докато /api/me виси (onLine=false), без кеш', { отг: ['виси'], офлайн: true }, ['офлайн']);
  console.log(рез.join('\n')); console.log('JS грешки: ' + (грешки.length ? [...new Set(грешки)].slice(0, 4).join(' | ') : 'няма'));
  console.log(червени ? '🔴 ' + червени + ' ЧЕРВЕНИ' : '✅ ВСИЧКО ЗЕЛЕНО');
  край(червени ? 1 : 0);
})();
