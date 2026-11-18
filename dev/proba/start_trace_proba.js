// 🔬 КАКВО ТЕЖИ В СТАРТА (18.11.2026): trace на живия адрес до първия екран (махането на стартовия екран).
// Нов човек, Slow 4G + CPU ×4. Сумира времето на главната нишка по вид: скриптове (по файл: компилиране + изпълнение),
// разбор на HTML, стил, подреждане, рисуване, GC; плюс най-тежките изтегляния до първия екран и кога kb.js се изпълнява.
// ПУСКАНЕ: node dev/proba/start_trace_proba.js [--url https://babyland.aaeromove.workers.dev] [--n 2]
const { spawn } = require('child_process'); const path = require('path'); const fs = require('fs');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; } }
const АДРЕС = (арг.url || 'https://babyland.aaeromove.workers.dev').replace(/\/?$/, '/') + 'index.html';
const пауза = ms => new Promise(r => setTimeout(r, ms));
const кратко = u => (u || '').split('/').pop().split('?')[0] || '(страницата)';
async function едно(nо) {
  const ПРОФИЛ = path.join(__dirname, 'chrome_pr_trace_' + Date.now()); const ПОРТ = 9200 + Math.floor(Math.random() * 700);
  const ch = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=360,800'].concat((process.env.BL_CHROME_FLAGS || '').split(' ').filter(Boolean), ['about:blank']), { stdio: 'ignore' });
  const махни = () => { try { ch.kill(); } catch (e) {} return пауза(1500).then(() => { try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {} }); };
  let цел; for (let i = 0; i < 80 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + ПОРТ + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
  if (!цел) { await махни(); return null; }
  const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let n = 0; const ч = new Map(); const събития = []; let trDone = null; const ресурси = new Map();
  const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  ws.onmessage = e => { const м = JSON.parse(e.data); if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); }
    if (м.method === 'Tracing.dataCollected') for (const ev of м.params.value) събития.push(ev);
    if (м.method === 'Tracing.tracingComplete' && trDone) trDone();
    if (м.method === 'Network.requestWillBeSent') ресурси.set(м.params.requestId, { url: м.params.request.url, t: м.params.timestamp });
    if (м.method === 'Network.loadingFinished' && ресурси.has(м.params.requestId)) { const р = ресурси.get(м.params.requestId); р.байта = м.params.encodedDataLength; р.край = м.params.timestamp; } };
  const изр = async x => { const р = await send('Runtime.evaluate', { expression: x, returnByValue: true }); return р.result && р.result.result ? р.result.result.value : null; };
  await send('Page.enable'); await send('Network.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 800, deviceScaleFactor: 2, mobile: true });
  await send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await send('Network.emulateNetworkConditions', { offline: false, latency: 562.5, downloadThroughput: 180000, uploadThroughput: 84375 });
  await send('Tracing.start', { categories: 'devtools.timeline,v8,v8.execute,disabled-by-default-devtools.timeline,blink.user_timing', transferMode: 'ReportEvents' });
  const t0 = Date.now(); const мрежаНачало = (await send('Runtime.evaluate', { expression: '0' }), null);
  await send('Page.navigate', { url: АДРЕС });
  let екран = null, сплашВидян = false;
  while (Date.now() - t0 < 180000) { const с = await изр("!!document.getElementById('blSplash')"); if (с) сплашВидян = true; if (сплашВидян && с === false) { екран = Date.now() - t0; break; } await пауза(250); }
  await пауза(500);
  await new Promise(r => { trDone = r; send('Tracing.end'); });
  try { ws.close(); } catch (e) {} await махни();
  // ── разбор: само главната нишка на страницата (CrRendererMain), до първия екран ──
  const нишки = new Map(); for (const ev of събития) if (ev.ph === 'M' && ev.name === 'thread_name') нишки.set(ev.pid + ':' + ev.tid, ev.args.name);
  const нав = събития.find(ev => ev.name === 'navigationStart' || ev.name === 'TracingStartedInBrowser');
  const главна = събития.filter(ev => нишки.get(ev.pid + ':' + ev.tid) === 'CrRendererMain' && ev.ph === 'X' && ev.dur);
  const начало = Math.min(...главна.map(ev => ev.ts)); const таван = начало + (екран || 180000) * 1000;
  const до = главна.filter(ev => ev.ts < таван);
  const сума = {}; const скрипт = {};
  const вид = ev => { const н = ev.name;
    if (н === 'EvaluateScript' || н === 'v8.compile' || н === 'v8.compileModule' || н === 'FunctionCall' || н === 'TimerFire' || н === 'EventDispatch' || н === 'v8.run') return 'скриптове';
    if (н === 'ParseHTML') return 'разбор на HTML'; if (н === 'ParseAuthorStyleSheet') return 'разбор на CSS';
    if (н === 'UpdateLayoutTree' || н === 'RecalculateStyles') return 'стил (пресмятане)'; if (н === 'Layout') return 'подреждане (layout)';
    if (н === 'Paint' || н === 'PaintImage' || н === 'UpdateLayerTree' || н === 'CompositeLayers' || н === 'Layerize' || н === 'PrePaint') return 'рисуване';
    if (/GC/.test(н)) return 'боклук (GC)'; if (н === 'Decode Image' || н === 'ImageDecodeTask') return 'декодиране на снимки'; return null; };
  // само горните нива (без вложени), за да не броим двойно: стек по време
  const сорт = до.slice().sort((a, b) => a.ts - b.ts || b.dur - a.dur); const стек = [];
  for (const ev of сорт) { while (стек.length && стек[стек.length - 1].ts + стек[стек.length - 1].dur <= ev.ts) стек.pop();
    const в = вид(ev); const горе = стек.length === 0 || !стек.some(с => вид(с));
    if (в && горе) { сума[в] = (сума[в] || 0) + ev.dur / 1000;
      if (в === 'скриптове') { const url = (ev.args && ev.args.data && (ev.args.data.url || (ev.args.data.stackTrace && ev.args.data.stackTrace[0] && ev.args.data.stackTrace[0].url))) || (ev.args && ev.args.fileName) || ''; const к = кратко(url); скрипт[к] = (скрипт[к] || 0) + ev.dur / 1000; } }
    стек.push(ev); }
  const kbEval = главна.filter(ev => (ev.name === 'EvaluateScript' || ev.name === 'v8.compile') && /kb\.js/.test(JSON.stringify(ev.args || {})));
  const kbПреди = kbEval.filter(ev => ev.ts < таван).reduce((s, ev) => s + ev.dur / 1000, 0);
  const kbОбщо = kbEval.reduce((s, ev) => s + ev.dur / 1000, 0);
  const заето = до.reduce((s, ev) => s, 0);
  const рес = [...ресурси.values()].filter(р => р.байта).sort((a, b) => b.байта - a.байта);
  // 18.11: байтове ДО първия екран, по вид и по файл (базата = първата заявка ≈ навигацията)
  const база = Math.min(...[...ресурси.values()].map(р => р.t)); const доЕкр = рес.filter(р => р.край && (р.край - база) * 1000 <= (екран || 1e9));
  const поВид = {}; for (const р of доЕкр) { const в = (кратко(р.url).match(/.([a-z0-9]+)$/i) || [, 'друго'])[1].toLowerCase(); поВид[в] = поВид[в] || { байта: 0, бр: 0 }; поВид[в].байта += р.байта; поВид[в].бр++; }
  return { екран, сума, скрипт, kbПреди, kbОбщо, рес: рес.slice(0, 8).map(р => кратко(р.url) + ' ' + Math.round(р.байта / 1024) + ' KB'), байтове: рес.reduce((s, р) => s + р.байта, 0), доЕкранаБайта: доЕкр.reduce((s, р) => s + р.байта, 0), доЕкранаБр: доЕкр.length, поВид, тежкиДо: доЕкр.slice(0, 14).map(р => кратко(р.url) + ' ' + Math.round(р.байта / 1024)) };
}
(async () => {
  await require('./slot.js')('chrome');
  const N = +(арг.n || 2);
  for (let i = 1; i <= N; i++) { const р = await едно(i); if (!р) { console.log('🔴 пробег ' + i + ' не тръгна'); continue; }
    console.log('\n══ ПРОБЕГ ' + i + ' · първият екран ' + р.екран + ' ms · изтеглени ' + (р.байтове / 1e6).toFixed(2) + ' MB (до края на trace)');
    console.log('  ГЛАВНАТА НИШКА до първия екран, по вид (ms):'); Object.entries(р.сума).sort((a, b) => b[1] - a[1]).forEach(([к, v]) => console.log('    ' + Math.round(v).toString().padStart(7) + '  ' + к));
    console.log('  СКРИПТОВЕ по файл (топ 12, ms):'); Object.entries(р.скрипт).sort((a, b) => b[1] - a[1]).slice(0, 12).forEach(([к, v]) => console.log('    ' + Math.round(v).toString().padStart(7) + '  ' + к));
    console.log('  kb.js компилиране+изпълнение: ' + Math.round(р.kbПреди) + ' ms ПРЕДИ първия екран · ' + Math.round(р.kbОбщо) + ' ms общо в trace');
    console.log('  най-тежки изтегляния (цял trace): ' + р.рес.join(' · '));
    console.log('  ДО ПЪРВИЯ ЕКРАН: ' + р.доЕкранаБр + ' заявки · ' + (р.доЕкранаБайта / 1e6).toFixed(2) + ' MB · по вид: ' + Object.entries(р.поВид).sort((a, b) => b[1].байта - a[1].байта).map(([к, v]) => к + ' ' + Math.round(v.байта / 1024) + ' KB/' + v.бр).join(' · '));
    console.log('  най-тежки ДО първия екран (KB): ' + р.тежкиДо.join(' · ')); }
  process.exit(0);
})();
