// 🔬 20.10 · КОЙ ПРИНУЖДАВА ПОДРЕДБАТА — брои getBBox / getComputedStyle / offset* и обходите на плюша
// по извикващ файл, през първите N секунди на началото (процесор ×4). Само мери.
// ПУСКАНЕ: node bbox_diag.js [--sek 15] [--cpu 4]
const { spawn } = require('child_process');
const fs = require('fs'); const path = require('path');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; } }
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const пауза = ms => new Promise(r => setTimeout(r, ms));
const ШПИОН = `(() => {
  const С = window.__шп = { bbox: {}, gcs: {}, qsa: {}, мут: 0 };
  const кой = () => { const l = (new Error().stack || '').split('\\n'); for (let i = 3; i < l.length; i++) { const m = l[i].match(/\\/(js\\/[^?:)]+)[^:]*:(\\d+)/); if (m) return m[1] + ':' + m[2]; } return '?'; };
  const брой = (о, к, t) => { const з = о[к] || (о[к] = [0, 0]); з[0]++; з[1] += t; };
  const bb = SVGGraphicsElement.prototype.getBBox;
  SVGGraphicsElement.prototype.getBBox = function () { const t = performance.now(); const r = bb.apply(this, arguments); брой(С.bbox, кой(), performance.now() - t); return r; };
  const gc = window.getComputedStyle;
  window.getComputedStyle = function () { const t = performance.now(); const r = gc.apply(this, arguments); const к = кой(); const з = С.gcs[к] || (С.gcs[к] = [0, 0]); з[0]++; return r; };
  const qs = Element.prototype.querySelectorAll, dqs = Document.prototype.querySelectorAll;
  const мер = function (ориг) { return function (s) { const t = performance.now(); const r = ориг.call(this, s); const d = performance.now() - t; if (d > 2) брой(С.qsa, кой() + ' «' + String(s).slice(0, 40) + '»', d); return r; }; };
  Element.prototype.querySelectorAll = мер(qs); Document.prototype.querySelectorAll = мер(dqs);
  const MO = window.MutationObserver; window.MutationObserver = function (cb) { const к = кой(); return new MO(function (з, о) { С.мут++; const t = performance.now(); cb.call(this, з, о); брой(С.qsa, 'MO-колбек ' + к, performance.now() - t); }); };
})();`;
(async () => {
  await require('./slot.js')('chrome');
  const ПРОФИЛ = path.join(__dirname, 'chrome_pr_bb_' + Date.now()); const ПОРТ = 9200 + Math.floor(Math.random() * 700);
  const ch = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=390,844', 'about:blank'], { stdio: 'ignore' });
  let цел; for (let i = 0; i < 80 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + ПОРТ + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
  if (!цел) { console.log('🔴 Chrome не тръгна'); process.exit(3); }
  const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let n = 0; const ч = new Map(); ws.onmessage = e => { const м = JSON.parse(e.data); if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); } };
  const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  const изр = async x => (await send('Runtime.evaluate', { expression: x, awaitPromise: true, returnByValue: true })).result.result.value;
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send('Page.navigate', { url: 'http://localhost:8911/manifest.webmanifest' }); await пауза(800);
  await изр(`(() => { localStorage.clear(); const s = (k, v) => localStorage.setItem(k, JSON.stringify(v)); s('bl_onboarded', true); localStorage.setItem('bl_tour_done','1'); s('bl_hero_toured', true); s('bl_day1','2026-08-01'); s('bl_mama',{name:'Мария'}); s('bl_baby', { name: 'Алекс', birth: '2026-03-20', sex: 'boy' }); return 1; })()`);
  await send('Emulation.setCPUThrottlingRate', { rate: Number(арг.cpu || 4) });
  await send('Page.addScriptToEvaluateOnNewDocument', { source: ШПИОН });
  await send('Page.navigate', { url: 'http://localhost:8911/' });
  await пауза(Number(арг.sek || 15) * 1000);
  const С = await изр('JSON.stringify(window.__шп)');
  const о = JSON.parse(С || '{}');
  const топ = (x, n) => Object.entries(x || {}).sort((a, b) => (b[1][1] || b[1][0]) - (a[1][1] || a[1][0])).slice(0, n).map(([к, v]) => '  ' + String(v[0]).padStart(6) + ' пъти · ' + String(Math.round(v[1] || 0)).padStart(6) + ' ms  ' + к);
  console.log('getBBox (по извикващ ред):\n' + топ(о.bbox, 10).join('\n'));
  console.log('\ngetComputedStyle (брой по извикващ ред):\n' + Object.entries(о.gcs || {}).sort((a, b) => b[1][0] - a[1][0]).slice(0, 12).map(([к, v]) => '  ' + String(v[0]).padStart(7) + ' пъти  ' + к).join('\n'));
  console.log('\nquerySelectorAll > 2 ms и колбеците на наблюдателите:\n' + топ(о.qsa, 14).join('\n'));
  console.log('\nизвиквания на MutationObserver колбеци: ' + о.мут);
  try { ws.close(); } catch (e) {} try { ch.kill(); } catch (e) {} await пауза(400); try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {}
  process.exit(0);
})().catch(e => { console.log('🔴 ' + e.message); process.exit(3); });
