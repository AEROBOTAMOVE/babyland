// 🔑 РЕДЪТ ПРИ НОВ ЧОВЕК (17.11.2026): ВРАТАТА за достъп → чак после ЗАПОЗНАВАНЕТО; никога двата един върху друг.
// /api/* се подменя през CDP Fetch САМО в браузъра на пробата (никакъв истински профил, никаква парола):
//   „401“ = нов човек без сесия · „200“ = достъпът е даден ({user:{status:'active', access_until: +14 дни}}) ·
//   „мине“ = истинският отговор (локалният dev/proba/server.js → 404 → режим „без-сървър“, вратата е изключена).
// Сценарии (всеки на чисто localStorage):
//   S1 врата → запознаване (обиколката вече минала): 401 → само врата; 200 + BL_DOSTAP.провери() → запознаване
//   S2 второ отваряне: след „Прескочи“ и с достъп → нищо (нито врата, нито запознаване)
//   S3 обиколка → врата → запознаване: 401 + без bl_tour_done → обиколка → „пропусни“ → врата (без запознаване) → 200 → запознаване
//   S4 localhost без врата (истинският 404): запознаването се отваря както досега
// Пробовачът в страницата (на 100 ms) брои мигове, в които ВРАТАТА и ЗАПОЗНАВАНЕТО са видими едновременно.
// ПУСКАНЕ: node dev/proba/vrata_red_proba.js [--port 8912] [--samo S1,S3]
const { spawn } = require('child_process'); const path = require('path'); const fs = require('fs');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; } }
const АДРЕС = 'http://127.0.0.1:' + (арг.port || 8912) + '/index.html';
const САМО = арг.samo ? арг.samo.split(',') : null;
const пауза = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await require('./slot.js')('chrome');
  const ПРОФИЛ = path.join(__dirname, 'chrome_pr_vrata_' + Date.now()); const ПОРТ = 9200 + Math.floor(Math.random() * 700);
  const ch = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=360,800', 'about:blank'], { stdio: 'ignore' });
  const край = к => { try { ch.kill(); } catch (e) {} setTimeout(() => { try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {} process.exit(к); }, 1200); };
  let цел; for (let i = 0; i < 80 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + ПОРТ + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
  if (!цел) { console.log('🔴 Chrome не тръгна'); return край(3); }
  const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let n = 0; const ч = new Map(); const грешки = []; let апи = 'мине'; const заявки = { '401': 0, '200': 0, 'мине': 0 };
  const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  const b64 = о => Buffer.from(JSON.stringify(о)).toString('base64');
  ws.onmessage = e => { const м = JSON.parse(e.data); if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); }
    if (м.method === 'Runtime.exceptionThrown') { const d = м.params.exceptionDetails; грешки.push(((d.exception && d.exception.description) || d.text).split('\n')[0]); }
    if (м.method === 'Fetch.requestPaused') { const id = м.params.requestId; заявки[апи]++;
      const з = [{ name: 'Content-Type', value: 'application/json; charset=utf-8' }, { name: 'Cache-Control', value: 'no-store' }];
      if (апи === '401') send('Fetch.fulfillRequest', { requestId: id, responseCode: 401, responseHeaders: з, body: b64({ error: 'Нужен е вход.' }) });
      else if (апи === '200') send('Fetch.fulfillRequest', { requestId: id, responseCode: 200, responseHeaders: з, body: b64({ user: { email: 'proba@example.test', status: 'active', access_until: new Date(Date.now() + 14 * 864e5).toISOString(), proben: true, admin: false } }) });
      else send('Fetch.continueRequest', { requestId: id }); } };
  const изр = async x => { const р = await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true }); return р.result && р.result.result ? р.result.result.value : null; };
  const чакай = async (x, ms) => { const t = Date.now(); while (Date.now() - t < ms) { if (await изр(x)) return Date.now() - t; await пауза(100); } return -1; };
  await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable');
  await send('Network.setBypassServiceWorker', { bypass: true }); await send('Network.setCacheDisabled', { cacheDisabled: true });
  await send('Fetch.enable', { patterns: [{ urlPattern: '*/api/*', requestStage: 'Request' }] });
  await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 800, deviceScaleFactor: 2, mobile: true });
  // пробовачът се слага при всяко зареждане (преди скриптовете на страницата)
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `window.__вр = { мигове: 0, двете: 0, врата: 0, запозн: 0 }; setInterval(() => { try {
      const в = !!(window.BL_DOSTAP && BL_DOSTAP.състояние().видим); const о = document.getElementById('onbOverlay'); const з = !!(о && !о.hidden && о.getClientRects().length);
      __вр.мигове++; if (в) __вр.врата++; if (з) __вр.запозн++; if (в && з) __вр.двете++; } catch (e) {} }, 100);` });
  const СЪСТ = "JSON.stringify({ режим: window.BL_DOSTAP && BL_DOSTAP.състояние().режим, врата: !!(window.BL_DOSTAP && BL_DOSTAP.състояние().видим), запознаване: !!(document.getElementById('onbOverlay') && !document.getElementById('onbOverlay').hidden), обиколка: !!document.querySelector('.tour-ov'), вр: window.__вр })";
  const ВРАТА = "!!(window.BL_DOSTAP && BL_DOSTAP.състояние().видим)", ЗАПОЗН = "!!(document.getElementById('onbOverlay') && !document.getElementById('onbOverlay').hidden)";
  const рез = []; let червени = 0; const пр = (и, у, д) => { рез.push((у ? '✅ ' : '🔴 ') + и + (д ? ' · ' + д : '')); if (!у) червени++; };
  const наЧисто = async (обиколкаМинала) => {
    await send('Page.navigate', { url: АДРЕС }); await пауза(1500);
    await изр(`(() => { localStorage.clear(); try { sessionStorage.clear(); } catch (e) {} ${обиколкаМинала ? "localStorage.setItem('bl_tour_done','1');" : ''} return 1; })()`);
    await send('Page.reload');
    return чакай("!document.getElementById('blSplash') && !!window.BL_DOSTAP && !!window.BL_ONBOARD", 60000);
  };
  const вр = async () => JSON.parse(await изр('JSON.stringify(window.__вр)') || '{}');
  const пусни = с => !САМО || САМО.includes(с);

  if (пусни('S1')) {
    апи = '401'; await наЧисто(true);
    const тВ = await чакай(ВРАТА, 15000);
    пр('S1 · 401 → вратата излиза', тВ >= 0, тВ + ' ms · ' + await изр(СЪСТ));
    await пауза(4000);
    пр('S1 · 401 → запознаването НЕ излиза (4 s след вратата)', !(await изр(ЗАПОЗН)), JSON.stringify(await вр()));
    апи = '200'; const t0 = Date.now(); await изр('BL_DOSTAP.провери().then(() => 1)');
    const тЗ = await чакай(ЗАПОЗН, 6000);
    пр('S1 · 200 + провери() → вратата се скрива, запознаването излиза', тЗ >= 0 && !(await изр(ВРАТА)), 'запознаване ' + (тЗ >= 0 ? (Date.now() - t0) + ' ms след провери()' : 'НЕ') + ' · ' + await изр(СЪСТ));
    const в1 = await вр(); пр('S1 · никога двете едновременно', в1.двете === 0, JSON.stringify(в1));
    // S2: „Прескочи“ → второ отваряне с достъп → нищо
    if (пусни('S2')) {
      await изр("(document.getElementById('onbSkip') || { click() {} }).click(); 1"); await пауза(800);
      const онб = await изр("localStorage.getItem('bl_onboarded')");
      await send('Page.reload'); await чакай("!document.getElementById('blSplash') && !!window.BL_DOSTAP", 60000); await пауза(6000);
      const с = JSON.parse(await изр(СЪСТ));
      пр('S2 · второ отваряне (достъп + прескочено) → нищо', !с.врата && !с.запознаване, 'bl_onboarded=' + онб + ' · ' + JSON.stringify(с));
    }
  }
  if (пусни('S3')) {
    апи = '401'; await наЧисто(false);
    const тО = await чакай("!!document.querySelector('.tour-ov')", 15000);
    пр('S3 · нов човек → обиколката първа', тО >= 0, тО + ' ms · ' + await изр(СЪСТ));
    if (тО >= 0) { await пауза(800); await изр("document.querySelector('.tour-ov .tour-skip').click(); 1"); }
    const тВ = await чакай(ВРАТА, 15000); await пауза(3000);
    const с = JSON.parse(await изр(СЪСТ));
    пр('S3 · след обиколката → вратата, БЕЗ запознаване', тВ >= 0 && !с.запознаване, 'врата след ' + тВ + ' ms · ' + JSON.stringify(с));
    апи = '200'; const t0 = Date.now(); await изр('BL_DOSTAP.провери().then(() => 1)');
    const тЗ = await чакай(ЗАПОЗН, 6000);
    пр('S3 · 200 → запознаването', тЗ >= 0 && !(await изр(ВРАТА)), (тЗ >= 0 ? (Date.now() - t0) + ' ms' : 'НЕ') + ' · ' + await изр(СЪСТ));
    const в3 = await вр(); пр('S3 · никога двете едновременно', в3.двете === 0, JSON.stringify(в3));
  }
  if (пусни('S4')) {
    апи = 'мине'; await наЧисто(true);
    const тЗ = await чакай(ЗАПОЗН, 8000);
    const с = JSON.parse(await изр(СЪСТ));
    пр('S4 · localhost без врата (404 → без-сървър) → запознаването както досега', тЗ >= 0 && с.режим === 'без-сървър' && !с.врата, тЗ + ' ms · ' + JSON.stringify(с));
  }
  console.log(рез.join('\n')); console.log('заявки към /api: ' + JSON.stringify(заявки) + ' · JS грешки: ' + (грешки.length ? грешки.slice(0, 4).join(' | ') : 'няма'));
  console.log(червени ? '🔴 ' + червени + ' ЧЕРВЕНИ' : '✅ ВСИЧКО ЗЕЛЕНО');
  край(червени ? 1 : 0);
})();
