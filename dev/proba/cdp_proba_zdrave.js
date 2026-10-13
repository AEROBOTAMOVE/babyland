// Копие на cdp_proba.js за стаята „Здраве и SOS“ (агентът на здравето, 06.10).
// Разлика: в ЕДНА сесия на Chrome прави снимки на няколко места (--shots "сел1|сел2|…")
// и пуска израз (--expr) преди снимките. Изход: snimki/<out>_<i>.jpg
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; } }
const ИМЕ = арг.out || 'zd', ТЕМА = арг.theme || 'light';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ПАПКА = path.join(__dirname, 'snimki'); fs.mkdirSync(ПАПКА, { recursive: true });
const ПРОФИЛ = path.join(__dirname, 'chrome_zd_' + Date.now() + '_' + Math.floor(Math.random() * 1e6));
const ПОРТ = 9200 + Math.floor(Math.random() * 700);
const пауза = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const ch = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=390,844', 'about:blank'], { stdio: 'ignore' });
  let цел; for (let i = 0; i < 160 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + ПОРТ + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
  if (!цел) throw new Error('Chrome не тръгна');
  const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let n = 0; const ч = new Map(); const грешки = [];
  ws.onmessage = e => { const м = JSON.parse(e.data); if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); } if (м.method === 'Runtime.exceptionThrown') грешки.push((м.params.exceptionDetails.exception && м.params.exceptionDetails.exception.description || м.params.exceptionDetails.text || '').slice(0, 200)); };
  const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  const изрази = async x => { const р = await send('Runtime.evaluate', { expression: x, awaitPromise: true, returnByValue: true }); return р.result.exceptionDetails ? { ГРЕШКА: (р.result.exceptionDetails.exception || {}).description || р.result.exceptionDetails.text } : р.result.result.value; };
  const зареди = async () => { for (let i = 0; i < 160; i++) { await пауза(300); if (await изрази("document.readyState === 'complete' && !!window.MamaHelper") === true) break; } await пауза(2000); };
  const кадри = () => изрази('new Promise(r => { let k = 0; const f = () => (++k >= 40 ? r(1) : requestAnimationFrame(f)); requestAnimationFrame(f); })');
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send('Page.navigate', { url: 'http://localhost:8911/' }); await зареди();
  const семе = арг.seed ? fs.readFileSync(арг.seed, 'utf8') : '{}';
  await изрази(`(() => { localStorage.clear(); const s = (k, v) => localStorage.setItem(k, JSON.stringify(v)); s('bl_onboarded', true); localStorage.setItem('bl_tour_done','1'); s('bl_hero_toured', true); s('bl_day1','2026-08-01'); s('bl_mama',{name:'Мария'}); s('bl_baby', { name: 'Алекс', birth: '2026-03-20', sex: 'boy' }); localStorage.setItem('bl_theme','${ТЕМА}'); const x = ${семе}; for (const k in x) localStorage.setItem(k, typeof x[k] === 'string' ? x[k] : JSON.stringify(x[k])); return 1; })()`);
  await send('Page.reload'); await зареди();
  await изрази(`(() => { document.querySelectorAll('button').forEach(b => { if (/Благодаря/.test(b.innerText)) b.click(); }); document.documentElement.style.scrollBehavior = 'auto'; return 1; })()`);
  await изрази(`(() => { MamaHelper.open(${JSON.stringify(арг.room || 'Здраве и SOS')}); return 1; })()`); await пауза(2600);
  if (арг.tab) { await изрази(`(() => { const s = document.querySelector('#roTabs .st-seg[data-tab="${арг.tab}"]'); if (s) s.click(); return 1; })()`); await пауза(1600); }
  if (арг.expr) { await кадри(); console.log(JSON.stringify(await изрази(fs.readFileSync(арг.expr, 'utf8')), null, 1)); }
  const цели = (арг.shotsfile ? fs.readFileSync(арг.shotsfile, 'utf8').split(/\r?\n/) : (арг.shots || '').split('|')).map(x => x.trim()).filter(Boolean);
  if (!цели.length) цели.push('');
  for (let i = 0; i < цели.length; i++) {
    const сел = цели[i];
    if (сел.startsWith('JS:')) {
      console.log('  JS → ' + JSON.stringify(await изрази(сел.slice(3))));
    } else if (сел && сел !== 'TOP') {
      const р = await изрази(`(async () => { const п = ms => new Promise(r => setTimeout(r, ms)); const к = document.querySelector(${JSON.stringify(сел)}); if (!к) return 'няма';
        const ск = (() => { let e = к.parentElement; while (e && !(e.scrollHeight > e.clientHeight + 20 && /(auto|scroll)/.test(getComputedStyle(e).overflowY))) e = e.parentElement; return e; })();
        for (let j = 0; j < 5; j++) { if (ск) { ск.style.scrollBehavior = 'auto'; ск.scrollTop += к.getBoundingClientRect().top - 110; } await п(350); } return 'ок'; })()`);
      if (р !== 'ок') console.log('  ' + сел + ': ' + р);
    }
    await пауза(500); await кадри(); await пауза(150);
    const р = await send('Page.captureScreenshot', { format: 'jpeg', quality: 82 });
    const файл = path.join(ПАПКА, ИМЕ + '_' + i + '.jpg'); fs.writeFileSync(файл, Buffer.from(р.result.data, 'base64'));
    console.log('📸 ' + ИМЕ + '_' + i + '.jpg  ' + сел);
  }
  console.log('грешки: ' + грешки.length + (грешки.length ? '\n  ' + грешки.slice(0, 5).join('\n  ') : ''));
  try { ws.close(); } catch (e) {} try { ch.kill(); } catch (e) {}
  try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {}
  process.exit(0);
})().catch(e => { console.log('🔴 ' + e.message); process.exit(3); });
