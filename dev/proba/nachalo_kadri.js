// 🎞️ НАЧАЛОТО НА НОВА ПОСЕТИТЕЛКА (24.10.2026) — screencast от празен профил: стартовият екран → „Добре дошла у дома“.
// Близнак на letene.js (същият CDP път), но без засяване на профила и с равномерни кадри през целите N секунди —
// за да се види хореографията на първата стъпка СЛЕД стартовия екран (премиум облакът, логото, плочките).
// ПУСКАНЕ: node dev/proba/nachalo_kadri.js --out ime [--sek 6] [--broi 16] [--cpu 1] [--theme light|dark] [--dark] [--reduce] [--sled-tura] [--w 390 --h 844] [--port 8912]
//   → dev/proba/snimki/<ime>_NN_<ms>ms.jpg + времената и състоянието (.tour-ov класове) в конзолата.
const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; } }
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ПАПКА = path.join(__dirname, 'snimki'); fs.mkdirSync(ПАПКА, { recursive: true });
const ИМЕ = арг.out || 'nachalo', СЕК = Number(арг.sek || 6), БРОЙ = Number(арг.broi || 16), CPU = Number(арг.cpu || 1);
const Ш = Number(арг.w || 390), В = Number(арг.h || 844);   // --w 320 --h 568 = iPhone SE (1-во поколение)
const пауза = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await require('./slot.js')('chrome');
  const ПРОФИЛ = path.join(__dirname, 'chrome_pr_nach_' + Date.now()); const ПОРТ = 9200 + Math.floor(Math.random() * 700);
  const ch = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=' + Ш + ',' + В, 'about:blank'], { stdio: 'ignore' });
  let цел; for (let i = 0; i < 80 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + ПОРТ + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
  if (!цел) { console.log('🔴 Chrome не тръгна'); process.exit(3); }
  const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let n = 0; const ч = new Map(); const кадри = [];
  const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  ws.onmessage = e => {
    const м = JSON.parse(e.data);
    if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); }
    if (м.method === 'Page.screencastFrame') { кадри.push({ т: Date.now(), данни: м.params.data }); send('Page.screencastFrameAck', { sessionId: м.params.sessionId }); }
  };
  const изр = async x => { const р = await send('Runtime.evaluate', { expression: x, returnByValue: true }); return р.result && р.result.result ? р.result.result.value : null; };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: Ш, height: В, deviceScaleFactor: 1, mobile: true });
  const медия = []; if (арг.theme) медия.push({ name: 'prefers-color-scheme', value: арг.theme }); if (арг.reduce) медия.push({ name: 'prefers-reduced-motion', value: 'reduce' });
  if (медия.length) await send('Emulation.setEmulatedMedia', { features: медия });
  // --dark: темата на приложението е data-theme от bl_theme (js/app.js), не prefers-color-scheme
  // --sled-tura: обиколката е мината → след стартовия екран идва вратата (js/pl-dostap.js), ако сървърът я иска
  if (арг['sled-tura']) await send('Page.addScriptToEvaluateOnNewDocument', { source: "try { localStorage.setItem('bl_tour_done', '1'); localStorage.setItem('bl_onboarded', '1'); } catch (e) {}" });
  if (арг.dark) await send('Page.addScriptToEvaluateOnNewDocument', { source: "try { localStorage.setItem('bl_theme', 'dark'); } catch (e) {}" });
  await send('Emulation.setCPUThrottlingRate', { rate: CPU });
  await send('Page.startScreencast', { format: 'jpeg', quality: 70, everyNthFrame: 1 });
  const т0 = Date.now(); await send('Page.navigate', { url: 'http://localhost:' + (арг.port || 8912) + '/' });
  const стъпки = [];
  for (let т = 0; т < СЕК * 1000; т += 250) {
    await пауза(250);
    try { стъпки.push((Date.now() - т0) + 'ms ' + await изр("(() => { const o = document.querySelector('.tour-ov'); return (document.getElementById('blSplash') ? 'splash ' : '') + (o ? o.className : '—') + (document.querySelector('.tour-card') ? ' [карта' + (document.querySelector('.pl-tlogo-svg') ? '+лого' : '') + (document.querySelector('.pl-tt') ? '+плочки' : '') + ']' : ''); })()")); } catch (e) {}
  }
  await send('Page.stopScreencast');
  // побира ли се първата стъпка: долният ръб на бутона и „пропусни“ спрямо височината; превърта ли се оверлеят
  try { console.log('ПОБИРАНЕ ' + await изр("(() => { const o = document.querySelector('.tour-ov'); if (!o) return 'няма тур'; const р = s => { const e = o.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.top), Math.round(b.bottom)]; }; const надписи = [...o.querySelectorAll('.pl-tt-i b')].map(e => e.getBoundingClientRect()); return JSON.stringify({ шир: innerWidth, надписиХ: надписи.length ? [Math.round(Math.min(...надписи.map(b => b.left))), Math.round(Math.max(...надписи.map(b => b.right)))] : null, вис: innerHeight, лого: р('.pl-tlogo'), h3: р('h3'), плочки: р('.pl-tt'), напред: р('.tour-next'), пропусни: р('.tour-skip'), превърта: o.scrollHeight > o.clientHeight + 1, оверлей: [o.scrollHeight, o.clientHeight] }); })()")); } catch (e) {}
  try { console.log('BL_SPLASH ' + await изр("JSON.stringify(window.BL_SPLASH || null)") + ' · ДОСТЪП ' + await изр("JSON.stringify(window.BL_DOSTAP ? (({ режим, вид, видим }) => ({ режим, вид, видим }))(BL_DOSTAP.състояние()) : null)")); } catch (e) {}
  // под товар цикълът се разтяга (оценките бавеят) — кадрите се избират по ЦЕЛИЯ запис, не по --sek
  const обхват = Math.max(СЕК * 1000, кадри.length ? кадри[кадри.length - 1].т - т0 : 0);
  const избрани = []; for (let i = 0; i < БРОЙ; i++) { const цел = т0 + (i + 1) * (обхват / БРОЙ); let н = null; for (const к of кадри) if (!н || Math.abs(к.т - цел) < Math.abs(н.т - цел)) н = к; if (н && !избрани.includes(н)) избрани.push(н); }
  избрани.forEach((к, i) => fs.writeFileSync(path.join(ПАПКА, ИМЕ + '_' + String(i).padStart(2, '0') + '_' + (к.т - т0) + 'ms.jpg'), Buffer.from(к.данни, 'base64')));
  console.log('кадри общо ' + кадри.length + ' · записани ' + избрани.length + ' в ' + ПАПКА);
  console.log(стъпки.filter((s, i, a) => i === 0 || s.replace(/^\d+ms /, '') !== a[i - 1].replace(/^\d+ms /, '')).join('\n'));
  try { ws.close(); } catch (e) {} try { ch.kill(); } catch (e) {} await пауза(400); try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {}
  process.exit(0);
})().catch(e => { console.log('🔴 ' + e.message); process.exit(3); });
