// 🎞️ ОТЛИТАНЕТО (21.10.2026) — screencast на старта: пази ВСЕКИ нарисуван кадър около мига, в който облакът
// на стартовия екран отлита на мястото си (window.BL_SPLASH.мс). filmova.js снима на интервал и под товар пропуска
// точно този миг; тук Chrome сам праща кадър при всяко рисуване.
// ПУСКАНЕ: node letene.js --out ime [--sek 8] [--cpu 2] [--theme light|dark] [--port 8911]
//   → snimki/<ime>_k00.jpg … (само кадрите от −300 ms до +900 ms около отлитането) + времената в конзолата.
const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; } }
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ПАПКА = path.join(__dirname, 'snimki'); fs.mkdirSync(ПАПКА, { recursive: true });
const ИМЕ = арг.out || 'letene', СЕК = Number(арг.sek || 8), CPU = Number(арг.cpu || 2);
const пауза = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await require('./slot.js')('chrome');
  const ПРОФИЛ = path.join(__dirname, 'chrome_pr_let_' + Date.now()); const ПОРТ = 9200 + Math.floor(Math.random() * 700);
  const ch = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=390,844', 'about:blank'], { stdio: 'ignore' });
  let цел; for (let i = 0; i < 80 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + ПОРТ + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
  if (!цел) { console.log('🔴 Chrome не тръгна'); process.exit(3); }
  const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let n = 0; const ч = new Map(); const кадри = [];
  const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  ws.onmessage = e => {
    const м = JSON.parse(e.data);
    if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); }
    if (м.method === 'Page.screencastFrame') { кадри.push({ т: (м.params.metadata && м.params.metadata.timestamp) ? Math.round(м.params.metadata.timestamp * 1000) : Date.now(), данни: м.params.data }); send('Page.screencastFrameAck', { sessionId: м.params.sessionId }); }
  };
  const изр = async x => { const р = await send('Runtime.evaluate', { expression: x, returnByValue: true }); return р.result && р.result.result ? р.result.result.value : null; };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await send('Page.navigate', { url: 'http://localhost:' + (арг.port || 8911) + '/manifest.webmanifest' }); await пауза(700);
  await изр(`(() => { localStorage.clear(); const s = (k, v) => localStorage.setItem(k, JSON.stringify(v)); s('bl_onboarded', true); localStorage.setItem('bl_tour_done','1'); s('bl_hero_toured', true); s('bl_day1','2026-08-01'); s('bl_mama',{name:'Мария'}); s('bl_baby', { name: 'Алекс', birth: '2026-03-20', sex: 'boy' }); localStorage.setItem('bl_theme','${арг.theme || 'light'}'); return 1; })()`);
  await send('Emulation.setCPUThrottlingRate', { rate: CPU });
  await send('Page.startScreencast', { format: 'jpeg', quality: 60, everyNthFrame: 1 });
  const т0 = Date.now(); await send('Page.navigate', { url: 'http://localhost:' + (арг.port || 8911) + '/' });
  let инфо = null;
  for (let i = 0; i < СЕК * 4 && !инфо; i++) { await пауза(250); try { инфо = await изр('window.BL_SPLASH || null'); } catch (e) {} }
  await пауза(1200);
  await send('Page.stopScreencast');
  if (!инфо) { console.log('🔴 стартовият екран не се прибра за ' + СЕК + ' с (кадри: ' + кадри.length + ')'); }
  else {
    // мигът на отлитане по часовника на node ≈ т0 + инфо.мс (навигацията и т0 са почти едновременни)
    const миг = инфо.при || (т0 + инфо.мс);
    const около = кадри.filter(к => к.т >= миг - 300 && к.т <= миг + 900);
    около.forEach((к, i) => fs.writeFileSync(path.join(ПАПКА, ИМЕ + '_k' + String(i).padStart(2, '0') + '.jpg'), Buffer.from(к.данни, 'base64')));
    console.log('BL_SPLASH: ' + JSON.stringify(инфо) + ' · кадри общо ' + кадри.length + ' · около отлитането ' + около.length);
    console.log(около.map((к, i) => 'k' + String(i).padStart(2, '0') + ' ' + (к.т - миг) + ' ms').join(' · '));
  }
  try { ws.close(); } catch (e) {} try { ch.kill(); } catch (e) {} await пауза(400); try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {}
  process.exit(0);
})().catch(e => { console.log('🔴 ' + e.message); process.exit(3); });
