// 🐢 ВРАТАТА НА БАВНА МРЕЖА (18.11.2026): нов човек, Slow 4G, CPU ×4, БЕЗ подмяна — само гледа.
// Записва: кога тръгва /api/me и как свършва (готово / провал + причина, напр. net::ERR_ABORTED = нашето
// прекъсване след 15 s в pl-dostap.js апи()), navigator.onLine, и какъв режим избира вратата (чака/врата/офлайн…).
// Въпросът: показва ли се „Свържи се с интернет“ на човек, който Е на линия, само защото /api/me е закъснял?
// ПУСКАНЕ: node dev/proba/vrata_bavna_proba.js [--url https://babyland.aaeromove.workers.dev] [--port 8912] [--bez-zabavyane]
//   --bez-zabavyane: без бавна мрежа и без CPU ×4 (контрола: тогава вратата трябва да е „врата“, не „офлайн“)
const { spawn } = require('child_process'); const path = require('path'); const fs = require('fs');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; } }
const АДРЕС = арг.port ? 'http://127.0.0.1:' + арг.port + '/index.html' : (арг.url || 'https://babyland.aaeromove.workers.dev').replace(/\/?$/, '/') + 'index.html';
const пауза = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await require('./slot.js')('chrome');
  const ПРОФИЛ = path.join(__dirname, 'chrome_pr_vbav_' + Date.now()); const ПОРТ = 9200 + Math.floor(Math.random() * 700);
  const ch = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=360,800', 'about:blank'], { stdio: 'ignore' });
  const край = к => { try { ch.kill(); } catch (e) {} setTimeout(() => { try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {} process.exit(к); }, 1500); };
  let цел; for (let i = 0; i < 80 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + ПОРТ + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
  if (!цел) { console.log('🔴 Chrome не тръгна'); return край(3); }
  const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let n = 0; const ч = new Map(); const t0 = Date.now(); const ме = new Map(); const събития = []; let заявки = 0, байтове = 0;
  const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  const т = () => ((Date.now() - t0) / 1000).toFixed(1) + ' s';
  ws.onmessage = e => { const м = JSON.parse(e.data); if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); }
    const p = м.params || {};
    if (м.method === 'Network.requestWillBeSent') { заявки++; if (/\/api\/me/.test(p.request.url)) { ме.set(p.requestId, { тръгна: т() }); събития.push(т() + '  /api/me тръгна'); } }
    if (м.method === 'Network.loadingFinished') { байтове += p.encodedDataLength || 0; if (ме.has(p.requestId)) събития.push(т() + '  /api/me ГОТОВО'); }
    if (м.method === 'Network.responseReceived' && ме.has(p.requestId)) събития.push(т() + '  /api/me отговор ' + p.response.status);
    if (м.method === 'Network.loadingFailed' && ме.has(p.requestId)) събития.push(т() + '  /api/me ПРОВАЛ ' + p.errorText + (p.canceled ? ' (отменена)' : '')); };
  const изр = async x => { const р = await send('Runtime.evaluate', { expression: x, returnByValue: true }); return р.result && р.result.result ? р.result.result.value : null; };
  await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 800, deviceScaleFactor: 2, mobile: true });
  if (!арг['bez-zabavyane']) { await send('Emulation.setCPUThrottlingRate', { rate: 4 }); await send('Network.emulateNetworkConditions', { offline: false, latency: 562.5, downloadThroughput: 180000, uploadThroughput: 84375 }); }
  await send('Page.navigate', { url: АДРЕС });
  let режим = null, видим = null, онлайн = null; const ЛИМИТ = +(арг.limit || 150000);
  while (Date.now() - t0 < ЛИМИТ) {
    const с = await изр("window.BL_DOSTAP ? JSON.stringify({ р: BL_DOSTAP.състояние().режим, в: BL_DOSTAP.състояние().видим, о: navigator.onLine, сп: !!document.getElementById('blSplash'), т: (document.querySelector('#blDgT') || {}).textContent || '' }) : null");
    if (с) { const о = JSON.parse(с); if (о.р !== режим || о.в !== видим) { събития.push(т() + '  режим ' + о.р + ' · видима ' + о.в + ' · onLine ' + о.о + ' · стартов екран ' + о.сп + (о.т ? ' · заглавие „' + о.т + '“' : '')); режим = о.р; видим = о.в; онлайн = о.о; }
      if (о.р !== 'чака' && о.в) break; }
    await пауза(250);
  }
  await пауза(1000);
  console.log((арг['bez-zabavyane'] ? 'КОНТРОЛА (без забавяне)' : 'Slow 4G + CPU ×4') + ' · ' + АДРЕС);
  събития.forEach(с => console.log('  ' + с));
  console.log('  заявки ' + заявки + ' · свалени ' + (байтове / 1e6).toFixed(2) + ' MB · край на гледането ' + т());
  console.log(режим === 'офлайн' && онлайн ? '🔴 ДОКАЗАНО: човекът Е на линия (onLine=true), а вратата казва „офлайн“' : 'режим накрая: ' + режим + ' · onLine ' + онлайн);
  край(0);
})();
