// 🎞️ ФИЛМОВА ЛЕНТА НА СТАРТА (21.10.2026) — какво вижда мама секунда по секунда от първото отваряне.
// Кадър на всеки --stap ms (подразбиране 400) за --sek секунди, процесор ×--cpu (подразбиране 4), чист профил.
// ПУСКАНЕ: node filmova.js --out ime [--sek 10] [--stap 400] [--cpu 4] [--theme light|dark]
//   → snimki/<ime>_f00.jpg … + в конзолата: кога се появява всеки етап (DOM, плюш, премиум подредба).
const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; } }
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ПАПКА = path.join(__dirname, 'snimki'); fs.mkdirSync(ПАПКА, { recursive: true });
const ИМЕ = арг.out || 'film', СЕК = Number(арг.sek || 10), СТЪПКА = Number(арг.stap || 400), CPU = Number(арг.cpu || 4);
const пауза = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await require('./slot.js')('chrome');
  const ПРОФИЛ = path.join(__dirname, 'chrome_pr_film_' + Date.now()); const ПОРТ = 9200 + Math.floor(Math.random() * 700);
  const ch = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=390,844', 'about:blank'], { stdio: 'ignore' });
  let цел; for (let i = 0; i < 80 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + ПОРТ + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
  if (!цел) { console.log('🔴 Chrome не тръгна'); process.exit(3); }
  const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let n = 0; const ч = new Map(); ws.onmessage = e => { const м = JSON.parse(e.data); if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); } };
  const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  const изр = async x => { const р = await send('Runtime.evaluate', { expression: x, returnByValue: true }); return р.result && р.result.result ? р.result.result.value : null; };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await send('Page.navigate', { url: 'http://localhost:' + (арг.port || 8911) + '/manifest.webmanifest' }); await пауза(700);
  await изр(`(() => { localStorage.clear(); const s = (k, v) => localStorage.setItem(k, JSON.stringify(v)); s('bl_onboarded', true); localStorage.setItem('bl_tour_done','1'); s('bl_hero_toured', true); s('bl_day1','2026-08-01'); s('bl_mama',{name:'Мария'}); s('bl_baby', { name: 'Алекс', birth: '2026-03-20', sex: 'boy' }); localStorage.setItem('bl_theme','${арг.theme || 'light'}'); return 1; })()`);
  await send('Emulation.setCPUThrottlingRate', { rate: CPU });
  const т0 = Date.now(); await send('Page.navigate', { url: 'http://localhost:' + (арг.port || 8911) + '/' });
  const етапи = {};
  for (let k = 0; k * СТЪПКА < СЕК * 1000; k++) {
    const цел2 = т0 + k * СТЪПКА; const чак = цел2 - Date.now(); if (чак > 0) await пауза(чак);
    try {
      const р = await send('Page.captureScreenshot', { format: 'jpeg', quality: 55 });
      if (р.result) fs.writeFileSync(path.join(ПАПКА, ИМЕ + '_f' + String(k).padStart(2, '0') + '.jpg'), Buffer.from(р.result.data, 'base64'));
      const с = await изр(`({ dom: document.readyState, plOn: document.documentElement.classList.contains('pl-on'), gl20: document.documentElement.classList.contains('pl-gl20'), плюш: document.querySelectorAll('.pl-pl').length, h: document.scrollingElement ? document.scrollingElement.scrollHeight : 0, helper: !!window.MamaHelper })`);
      if (с) for (const к of ['dom', 'plOn', 'gl20', 'helper']) { const клуч = к + '=' + с[к]; if (!етапи[клуч]) етапи[клуч] = Date.now() - т0; }
      console.log(String(Date.now() - т0).padStart(6) + ' ms · ' + JSON.stringify(с));
    } catch (e) { console.log(String(Date.now() - т0).padStart(6) + ' ms · (зает)'); }
  }
  console.log('\nЕТАПИ (първа поява, ms): ' + JSON.stringify(етапи));
  try { ws.close(); } catch (e) {} try { ch.kill(); } catch (e) {} await пауза(400); try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {}
  process.exit(0);
})().catch(e => { console.log('🔴 ' + e.message); process.exit(3); });
