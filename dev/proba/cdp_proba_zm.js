// КОПИЕ на cdp_proba.js за стаята „Жената в мен“ (агент zm, 06.10) — общият скрипт НЕ се пипа.
// Добавено: --pre файл.js (израз след отварянето на стаята) и --shots "А|Б|В" — за всяка дума
// намира картата по заглавие (или CSS селектор, ако започва с . # [), докарва я на 96 px от горе
// и снима → snimki/<ime>_<k>.png. --scale 1|2 (подразбиране 2).
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; } }
const ИМЕ = арг.out || 'proba', ТЕМА = арг.theme || 'light', ПРОФИЛ_ТИП = арг.profile || 'baby';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ПАПКА = path.join(__dirname, 'snimki'); fs.mkdirSync(ПАПКА, { recursive: true });
const ПРОФИЛ = path.join(__dirname, 'chrome_zm_' + Date.now() + '_' + Math.floor(Math.random() * 1e6));
const ПОРТ = 9200 + Math.floor(Math.random() * 700);
const пауза = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await require('./slot.js')('chrome');   // 🚦 20.10 опашката (slot.js) — ПЪТ НАЗАД: махни този ред
  const ch = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=390,844', 'about:blank'], { stdio: 'ignore' });
  let цел; for (let i = 0; i < 120 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + ПОРТ + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
  if (!цел) throw new Error('Chrome не тръгна');
  const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let n = 0; const ч = new Map(); const грешки = [];
  ws.onmessage = e => { const м = JSON.parse(e.data); if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); } if (м.method === 'Runtime.exceptionThrown') грешки.push((м.params.exceptionDetails.exception && м.params.exceptionDetails.exception.description || м.params.exceptionDetails.text || '').slice(0, 200)); };
  const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  const изрази = async x => { const р = await send('Runtime.evaluate', { expression: x, awaitPromise: true, returnByValue: true }); return р.result.exceptionDetails ? { ГРЕШКА: (р.result.exceptionDetails.exception || {}).description || р.result.exceptionDetails.text } : р.result.result.value; };
  const зареди = async () => { for (let i = 0; i < 160; i++) { await пауза(300); if (await изрази("document.readyState === 'complete' && !!window.MamaHelper") === true) break; } await пауза(2000); };
  const кадри = () => изрази('new Promise(r => { let k = 0; const f = () => (++k >= 40 ? r(1) : requestAnimationFrame(f)); requestAnimationFrame(f); })');
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: Number(арг.scale || 2), mobile: true });
  const САЙТ = 'http://localhost:' + (арг.port || 8911) + '/';
  await send('Page.navigate', { url: САЙТ }); await зареди();
  const профил = ПРОФИЛ_ТИП === 'preg'
    ? "s('bl_preg', { due: new Date(Date.now() + 16 * 7 * 864e5).toISOString().slice(0, 10) }); s('bl_baby', { name: '' });"
    : ПРОФИЛ_ТИП === 'empty' ? '' : "s('bl_baby', { name: 'Алекс', birth: '2026-03-20', sex: 'boy' });";
  const семе = арг.seed ? fs.readFileSync(арг.seed, 'utf8') : '{}';
  await изрази(`(() => { localStorage.clear(); const s = (k, v) => localStorage.setItem(k, JSON.stringify(v)); s('bl_onboarded', true); localStorage.setItem('bl_tour_done','1'); s('bl_hero_toured', true); s('bl_day1','2026-08-01'); s('bl_mama',{name:'Мария'}); ${профил} localStorage.setItem('bl_theme','${ТЕМА}'); const x = ${семе}; for (const k in x) localStorage.setItem(k, typeof x[k] === 'string' ? x[k] : JSON.stringify(x[k])); return 1; })()`);
  await send('Page.reload'); await зареди();
  await изрази(`(() => { document.querySelectorAll('button').forEach(b => { if (/Благодаря/.test(b.innerText)) b.click(); }); document.documentElement.style.scrollBehavior = 'auto'; return 1; })()`);
  if (арг.room) {
    await изрази(`(() => { MamaHelper.open(${JSON.stringify(арг.room)}); return 1; })()`); await пауза(2600);
    const таб = арг.tab || 'room';
    await изрази(`(() => { const s = document.querySelector('#roTabs .st-seg[data-tab="${таб}"]'); if (s) s.click(); return 1; })()`); await пауза(1500);
  }
  if (арг.pre) { console.log('pre: ' + JSON.stringify(await изрази(fs.readFileSync(арг.pre, 'utf8')))); await пауза(600); }
  if (арг.expr) console.log(JSON.stringify(await изрази(fs.readFileSync(арг.expr, 'utf8')), null, 1));
  const снимки = (арг.shots || '').split('|').map(x => x.trim()).filter(Boolean);
  if (!снимки.length) снимки.push('');
  for (let k = 0; k < снимки.length; k++) {
    const ц = снимки[k];
    if (ц) {
      const р = await изрази(`(async () => { const п = ms => new Promise(r => setTimeout(r, ms)); const ц = ${JSON.stringify(ц)};
        const к = /^[.#\\[]/.test(ц) ? document.querySelector(ц) : [...document.querySelectorAll('#roRoom section.jr-card')].find(е => ((е.querySelector('.jr-title') || {}).textContent || '').includes(ц));
        if (!к) return 'няма ' + ц;
        let ск = к.parentElement; while (ск && !(ск.scrollHeight > ск.clientHeight + 20 && /(auto|scroll)/.test(getComputedStyle(ск).overflowY))) ск = ск.parentElement;
        for (let i = 0; i < 5; i++) { if (ск) { ск.style.scrollBehavior = 'auto'; ск.scrollTop += к.getBoundingClientRect().top - 96; } await п(350); }
        return 'ок'; })()`);
      if (р !== 'ок') console.log('  ' + р);
    }
    await пауза(Number(арг.wait || 500));
    await кадри();
    const р = await send('Page.captureScreenshot', { format: 'png' });
    const файл = path.join(ПАПКА, ИМЕ + (снимки.length > 1 || ц ? '_' + k : '') + '.png'); fs.writeFileSync(файл, Buffer.from(р.result.data, 'base64'));
    console.log('📸 ' + path.basename(файл) + ' ← ' + (ц || '(горе)'));
  }
  console.log('грешки: ' + грешки.length + (грешки.length ? '\n  ' + грешки.slice(0, 5).join('\n  ') : ''));
  try { ws.close(); } catch (e) {} try { ch.kill(); } catch (e) {}
  try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {}
  process.exit(0);
})().catch(e => { console.log('🔴 ' + e.message); process.exit(3); });
