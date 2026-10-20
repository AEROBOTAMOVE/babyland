// КОПИЕ на cdp_proba.js за стаята „Инструменти“ (агентът на Инструменти) — много снимки в ЕДНА сесия.
// ПУСКАНЕ: node cdp_proba_instrumenti.js --out pref --shots shots.json [--theme dark] [--profile baby] [--expr x.js]
// shots.json: [{ "ime": "hero", "sel": ".pg20-hero", "pre": "js преди скрола (по желание)", "dy": 110, "ex": "js след скрола, връща стойност" }]
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; } }
const ИМЕ = арг.out || 'pin', ТЕМА = арг.theme || 'light', ПРОФИЛ_ТИП = арг.profile || 'baby';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ПАПКА = path.join(__dirname, 'snimki'); fs.mkdirSync(ПАПКА, { recursive: true });
const ПРОФИЛ = path.join(__dirname, 'chrome_pin_' + Date.now() + '_' + Math.floor(Math.random() * 1e6));
const ПОРТ = 9200 + Math.floor(Math.random() * 700);
const пауза = ms => new Promise(r => setTimeout(r, ms));
const КАДРИ = 'new Promise(r => { let k = 0; const f = () => (++k >= 40 ? r(1) : requestAnimationFrame(f)); requestAnimationFrame(f); })';
(async () => {
  await require('./slot.js')('chrome');   // 🚦 20.10 опашката (slot.js) — ПЪТ НАЗАД: махни този ред
  let ch, цел;
  for (let опит = 0; опит < 3 && !цел; опит++) {
    ch = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + (ПОРТ + опит), '--user-data-dir=' + ПРОФИЛ + опит, '--no-first-run', '--window-size=390,844', 'about:blank'], { stdio: 'ignore' });
    for (let i = 0; i < 100 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + (ПОРТ + опит) + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
    if (!цел) { try { ch.kill(); } catch (e) {} }
  }
  if (!цел) throw new Error('Chrome не тръгна');
  const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let n = 0; const ч = new Map(); const грешки = [];
  ws.onmessage = e => { const м = JSON.parse(e.data); if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); } if (м.method === 'Runtime.exceptionThrown') грешки.push((м.params.exceptionDetails.exception && м.params.exceptionDetails.exception.description || м.params.exceptionDetails.text || '').slice(0, 200)); };
  const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  const изрази = async x => { const р = await send('Runtime.evaluate', { expression: x, awaitPromise: true, returnByValue: true }); return р.result.exceptionDetails ? { ГРЕШКА: (р.result.exceptionDetails.exception || {}).description || р.result.exceptionDetails.text } : р.result.result.value; };
  const зареди = async () => { for (let i = 0; i < 120; i++) { await пауза(300); if (await изрази("document.readyState === 'complete' && !!window.MamaHelper") === true) break; } await пауза(2000); };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: Number(арг.w || 390), height: 844, deviceScaleFactor: 2, mobile: true });
  const САЙТ = 'http://localhost:' + (арг.port || 8911) + '/';
  await send('Page.navigate', { url: САЙТ }); await зареди();
  const профил = ПРОФИЛ_ТИП === 'preg'
    ? "s('bl_preg', { due: new Date(Date.now() + 16 * 7 * 864e5).toISOString().slice(0, 10) }); s('bl_baby', { name: '' });"
    : ПРОФИЛ_ТИП === 'empty' ? '' : "s('bl_baby', { name: 'Алекс', birth: '2026-03-20', sex: 'boy' });";
  const семе = арг.seed ? fs.readFileSync(арг.seed, 'utf8') : '{}';
  await изрази(`(() => { localStorage.clear(); const s = (k, v) => localStorage.setItem(k, JSON.stringify(v)); s('bl_onboarded', true); localStorage.setItem('bl_tour_done','1'); s('bl_hero_toured', true); s('bl_day1','2026-08-01'); s('bl_mama',{name:'Мария'}); ${профил} localStorage.setItem('bl_theme','${ТЕМА}'); const x = ${семе}; for (const k in x) localStorage.setItem(k, typeof x[k] === 'string' ? x[k] : JSON.stringify(x[k])); return 1; })()`);
  await send('Page.reload'); await зареди();
  await изрази(`(() => { document.querySelectorAll('button').forEach(b => { if (/Благодаря/.test(b.innerText)) b.click(); }); document.documentElement.style.scrollBehavior = 'auto'; return 1; })()`);
  await изрази(`(() => { MamaHelper.open(${JSON.stringify(арг.room || 'Инструменти')}); return 1; })()`); await пауза(2400);
  await изрази(`(() => { const s = document.querySelector('#roTabs .st-seg[data-tab="${арг.tab || 'room'}"]'); if (s) s.click(); return 1; })()`); await пауза(1500);
  if (арг.expr) console.log('ИЗРАЗ: ' + JSON.stringify(await изрази(fs.readFileSync(арг.expr, 'utf8')), null, 1));
  const снимки = арг.shots ? JSON.parse(fs.readFileSync(арг.shots, 'utf8')) : [{ ime: 'top' }];
  for (const с of снимки) {
    if (с.pre) { const р = await изрази(с.pre); if (р !== 1 && р !== undefined && р !== null) console.log('  pre ' + с.ime + ': ' + JSON.stringify(р)); await пауза(с.wait || 600); }
    if (с.sel) {
      const р = await изрази(`(async () => { const п = ms => new Promise(r => setTimeout(r, ms)); const к = document.querySelector(${JSON.stringify(с.sel)}); if (!к) return 'няма ' + ${JSON.stringify(с.sel)};
        const ск = (() => { let e = к.parentElement; while (e && !(e.scrollHeight > e.clientHeight + 20 && /(auto|scroll)/.test(getComputedStyle(e).overflowY))) e = e.parentElement; return e; })();
        for (let i = 0; i < 6; i++) { if (ск) { ск.style.scrollBehavior = 'auto'; ск.scrollTop += к.getBoundingClientRect().top - ${с.dy || 110}; } await ${КАДРИ}; await п(150); } return 1; })()`);
      if (р !== 1) console.log('  ' + с.ime + ': ' + JSON.stringify(р));
    }
    if (с.ex) console.log('  ex ' + с.ime + ': ' + JSON.stringify(await изрази(с.ex), null, 0));
    await изрази(КАДРИ); await пауза(250);
    const р = await send('Page.captureScreenshot', с.clip ? { format: 'png', clip: Object.assign({ scale: 1 }, с.clip) } : { format: 'png' });
    const файл = path.join(ПАПКА, ИМЕ + '_' + с.ime + '.png'); fs.writeFileSync(файл, Buffer.from(р.result.data, 'base64'));
    console.log('📸 ' + ИМЕ + '_' + с.ime + '.png');
  }
  console.log('грешки: ' + грешки.length + (грешки.length ? '\n  ' + грешки.slice(0, 5).join('\n  ') : ''));
  try { ws.close(); } catch (e) {} try { ch.kill(); } catch (e) {}
  for (let i = 0; i < 3; i++) try { fs.rmSync(ПРОФИЛ + i, { recursive: true, force: true }); } catch (e) {}
  process.exit(0);
})().catch(e => { console.log('🔴 ' + e.message); process.exit(3); });
