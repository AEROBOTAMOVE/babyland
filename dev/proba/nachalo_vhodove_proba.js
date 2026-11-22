// 🔎 ВХОДОВЕТЕ НА НАЧАЛОТО (18.11.2026): кои ВИДИМИ елементи на началния екран водят към СОС/112 и към търсенето.
// Без забавяне; мама е „вътре“ (/api/* = 200 само в браузъра на пробата), минала обиколка и запознаване.
// ПУСКАНЕ: node dev/proba/nachalo_vhodove_proba.js [--url https://babyland.aaeromove.workers.dev]
const { spawn } = require('child_process'); const path = require('path'); const fs = require('fs');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; } }
const АДРЕС = (арг.url || 'https://babyland.aaeromove.workers.dev').replace(/\/?$/, '/') + 'index.html';
require('./pazach_zhivo.js')(АДРЕС);   // подменя /api → само местен адрес
const пауза = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await require('./slot.js')('chrome');
  const ПРОФИЛ = path.join(__dirname, 'chrome_pr_vhod_' + Date.now()); const ПОРТ = 9200 + Math.floor(Math.random() * 700);
  const ch = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=360,800', 'about:blank'], { stdio: 'ignore' });
  const край = к => { try { ch.kill(); } catch (e) {} setTimeout(() => { try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {} process.exit(к); }, 1500); };
  let цел; for (let i = 0; i < 80 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + ПОРТ + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
  if (!цел) { console.log('🔴 Chrome не тръгна'); return край(3); }
  const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let n = 0; const ч = new Map();
  const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  ws.onmessage = e => { const м = JSON.parse(e.data); if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); }
    if (м.method === 'Fetch.requestPaused') send('Fetch.fulfillRequest', { requestId: м.params.requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }], body: Buffer.from(JSON.stringify({ user: { email: 'proba@example.test', status: 'active', access_until: new Date(Date.now() + 14 * 864e5).toISOString(), proben: true } })).toString('base64') }); };
  const изр = async x => { const р = await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true }); return р.result && р.result.result ? р.result.result.value : null; };
  const чакай = async (x, ms) => { const t = Date.now(); while (Date.now() - t < ms) { if (await изр(x)) return Date.now() - t; await пауза(200); } return -1; };
  await send('Runtime.enable'); await send('Page.enable');
  await send('Fetch.enable', { patterns: [{ urlPattern: '*/api/*', requestStage: 'Request' }] });
  await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 800, deviceScaleFactor: 2, mobile: true });
  await send('Page.navigate', { url: АДРЕС }); await пауза(2500);
  await изр(`(() => { localStorage.clear(); const s = (k, v) => localStorage.setItem(k, JSON.stringify(v)); s('bl_onboarded', true); localStorage.setItem('bl_tour_done','1'); s('bl_hero_toured', true); s('bl_baby', { name: 'Алекс', birth: '2026-07-19', sex: 'boy' }); return 1; })()`);
  await send('Page.reload');
  await чакай("!document.getElementById('blSplash') && document.querySelectorAll('.pl-room[data-room]').length >= 9", 60000); await пауза(2500);
  const списък = await изр(`(() => { const вид = e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 4 && r.height > 4 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05 && !!e.offsetParent || cs.position === 'fixed'; };
    const горе = e => { const r = e.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2; if (y < 0 || y > innerHeight) return 'извън екрана (y=' + Math.round(r.top + scrollY) + ')'; const g = document.elementFromPoint(x, y); return g && (g === e || e.contains(g)) ? 'свободен' : 'ПОКРИТ от ' + (g ? (g.id || String(g.className).slice(0, 30) || g.tagName) : '-'); };
    const р = { сос: [], търсене: [] };
    for (const e of document.querySelectorAll('button, a, [role=button], [data-pl], [data-act]')) { if (!вид(e)) continue; const т = (e.textContent || e.getAttribute('aria-label') || '').replace(/\\s+/g, ' ').trim().slice(0, 50);
      const опис = e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.className ? '.' + String(e.className).split(' ').slice(0, 2).join('.') : '') + (e.getAttribute('data-pl') ? '[data-pl=' + e.getAttribute('data-pl') + ']' : '') + (e.getAttribute('href') ? '[href=' + e.getAttribute('href') + ']' : '') + ' „' + т + '“ · ' + горе(e);
      if (/sos|112|спешн/i.test(т + ' ' + e.className + ' ' + (e.getAttribute('href') || '') + ' ' + (e.getAttribute('data-pl') || ''))) р.сос.push(опис);
      if (/търс|search|find|🔍/i.test(т + ' ' + e.className + ' ' + (e.id || '') + ' ' + (e.getAttribute('data-pl') || ''))) р.търсене.push(опис); }
    р.searchTrigger = (() => { const e = document.getElementById('searchTrigger'); return e ? (вид(e) ? 'видим' : 'СКРИТ') : 'няма'; })();
    return р; })()`);
  console.log('СОС/112 на началото (' + списък.сос.length + '):'); списък.сос.forEach(x => console.log('   ' + x));
  console.log('ТЪРСЕНЕ на началото (' + списък.търсене.length + '):'); списък.търсене.forEach(x => console.log('   ' + x));
  console.log('#searchTrigger: ' + списък.searchTrigger);
  край(0);
})();
