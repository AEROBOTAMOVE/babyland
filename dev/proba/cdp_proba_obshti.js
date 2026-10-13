// КОПИЕ на cdp_proba.js за ОБЩАТА ЧАСТ (профил · търсене · „Добави“ · картата на стаята) — 06/07.10
// Разлика: много стъпки в ЕДИН Chrome. Стъпките са в JS файл: module.exports = [{ n, x, w }]
//   n = име на снимката (snimki/<out>_<n>.jpg; без n — без снимка), x = израз (може async), w = чакане мс.
// ПУСКАНЕ: node cdp_proba_obshti.js --out ime --steps stapki.js [--theme dark] [--profile baby|preg|empty]
// Изход: на всяка стъпка — JSON от израза, ловът (малки бутони / излизащи вдясно / голи емоджита) и грешките.
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; } }
const ИМЕ = арг.out || 'obsh', ТЕМА = арг.theme || 'light', ПРОФИЛ_ТИП = арг.profile || 'baby';
const СТЪПКИ = require(path.resolve(арг.steps));
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ПАПКА = path.join(__dirname, 'snimki'); fs.mkdirSync(ПАПКА, { recursive: true });
const ПРОФИЛ = path.join(__dirname, 'chrome_pr_' + Date.now() + '_' + Math.floor(Math.random() * 1e6));
const ПОРТ = 9200 + Math.floor(Math.random() * 700);
const пауза = ms => new Promise(r => setTimeout(r, ms));
const ЛОВ = `(() => {
  const W = innerWidth, H = innerHeight;
  const видим = е => { const к = е.getBoundingClientRect(); const s = getComputedStyle(е);
    return к.width > 0 && к.height > 0 && к.bottom > 0 && к.top < H && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05; };
  const име = е => (е.tagName + '.' + ((е.className && е.className.baseVal !== undefined ? е.className.baseVal : е.className) || '').toString().split(' ').filter(Boolean).slice(0, 2).join('.') + (е.id ? '#' + е.id : '')).slice(0, 48);
  const н = { малки: [], вдясно: [], голи_емоджи: [], дребен_текст: [] };
  for (const б of document.querySelectorAll('button, a[href], [role="button"], input, select')) {
    if (!видим(б)) continue;
    const к = б.getBoundingClientRect(); const т = (б.innerText || б.value || '').trim();
    if ((к.width < 40 || к.height < 40) && т.length < 30) н.малки.push(име(б) + ' ' + Math.round(к.width) + '×' + Math.round(к.height) + (т ? ' „' + т.slice(0, 14) + '“' : ''));
  }
  const ЕМ = /\\p{Extended_Pictographic}/u;
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let x; while ((x = tw.nextNode())) {
    const т = x.nodeValue; if (!т.trim()) continue; const р = x.parentElement; if (!р || !видим(р)) continue;
    const s = getComputedStyle(р); const fs = parseFloat(s.fontSize);
    if (ЕМ.test(т) && fs > 2 && s.color !== 'rgba(0, 0, 0, 0)' && !р.closest('.pl-em,.pl-pl,[data-pl-pl]')) н.голи_емоджи.push(име(р) + ' „' + т.trim().slice(0, 14) + '“');
    if (fs > 2 && fs < 11) н.дребен_текст.push(име(р) + ' ' + fs + 'px „' + т.trim().slice(0, 14) + '“');
  }
  for (const е of document.querySelectorAll('body *')) {
    if (!видим(е)) continue; const к = е.getBoundingClientRect();
    if (к.right <= W + 1 || к.width > W * 3) continue;
    let р = е.parentElement, пл = false;
    while (р && р !== document.body) { const s = getComputedStyle(р); if (/(auto|scroll|hidden|clip)/.test(s.overflowX) && р.getBoundingClientRect().right <= W + 1) { пл = true; break; } р = р.parentElement; }
    if (!пл && getComputedStyle(е).position !== 'fixed') н.вдясно.push(име(е) + ' дясно=' + Math.round(к.right));
  }
  for (const к in н) { н[к] = [...new Set(н[к])].slice(0, 10); if (!н[к].length) delete н[к]; }
  return н;
})()`;
(async () => {
  const ch = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=390,844', 'about:blank'], { stdio: 'ignore' });
  let цел; for (let i = 0; i < 100 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + ПОРТ + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
  if (!цел) throw new Error('Chrome не тръгна');
  const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let n = 0; const ч = new Map(); const грешки = [];
  ws.onmessage = e => { const м = JSON.parse(e.data); if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); } if (м.method === 'Runtime.exceptionThrown') грешки.push((м.params.exceptionDetails.exception && м.params.exceptionDetails.exception.description || м.params.exceptionDetails.text || '').slice(0, 200)); };
  const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  const изрази = async x => { const р = await send('Runtime.evaluate', { expression: x, awaitPromise: true, returnByValue: true }); return р.result.exceptionDetails ? { ГРЕШКА: (р.result.exceptionDetails.exception || {}).description || р.result.exceptionDetails.text } : р.result.result.value; };
  const зареди = async () => { for (let i = 0; i < 120; i++) { await пауза(300); if (await изрази("document.readyState === 'complete' && !!window.MamaHelper") === true) break; } await пауза(2000); };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send('Page.navigate', { url: 'http://localhost:8911/' }); await зареди();
  const профил = ПРОФИЛ_ТИП === 'preg'
    ? "s('bl_preg', { due: new Date(Date.now() + 16 * 7 * 864e5).toISOString().slice(0, 10) }); s('bl_baby', { name: '' });"
    : ПРОФИЛ_ТИП === 'empty' ? '' : "s('bl_baby', { name: 'Алекс', birth: '2026-03-20', sex: 'boy' });";
  await изрази(`(() => { localStorage.clear(); const s = (k, v) => localStorage.setItem(k, JSON.stringify(v)); s('bl_onboarded', true); localStorage.setItem('bl_tour_done','1'); s('bl_hero_toured', true); s('bl_day1','2026-08-01'); s('bl_mama',{name:'Мария'}); ${профил} localStorage.setItem('bl_theme','${ТЕМА}'); s('bl_search_hist', ['колики', 'зъбки']); return 1; })()`);
  await send('Page.reload'); await зареди();
  await изрази(`(() => { document.querySelectorAll('button').forEach(b => { if (/Благодаря/.test(b.innerText)) b.click(); }); document.documentElement.style.scrollBehavior = 'auto'; return 1; })()`);
  for (const ст of СТЪПКИ) {
    const г0 = грешки.length;
    const р = ст.x ? await изрази(ст.x) : null;
    await пауза(ст.w || 600);
    await изрази('new Promise(r => { let k = 0; const f = () => (++k >= 40 ? r(1) : requestAnimationFrame(f)); requestAnimationFrame(f); })');
    let ред = '▸ ' + (ст.n || '(без снимка)') + (р != null ? ' · ' + JSON.stringify(р).slice(0, 900) : '');
    if (ст.n) {
      const с = await send('Page.captureScreenshot', { format: 'jpeg', quality: 68 });
      fs.writeFileSync(path.join(ПАПКА, ИМЕ + '_' + ст.n + '.jpg'), Buffer.from(с.result.data, 'base64'));
      if (!ст.bezlov) { const л = await изрази(ЛОВ); if (л && Object.keys(л).length) ред += '\n    лов: ' + JSON.stringify(л); }
    }
    if (грешки.length > г0) ред += '\n    ГРЕШКИ: ' + грешки.slice(г0).join(' | ');
    console.log(ред);
  }
  console.log('грешки общо: ' + грешки.length);
  try { ws.close(); } catch (e) {} try { ch.kill(); } catch (e) {}
  try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {}
  process.exit(0);
})().catch(e => { console.log('🔴 ' + e.message); process.exit(3); });
