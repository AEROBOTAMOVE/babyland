// 🚶 ОБИКОЛКАТА — екран по екран, от горе до долу, със снимка на всеки изглед
// и автоматичен лов на счупеното. Не замества очите; казва къде да гледат.
//
// ПУСКАНЕ: node obikolka.js --out ime [--room "Захранване"] [--tab room|articles|chat] [--max 8]
// ИЗХОД: snimki/<ime>_00.jpg … + snimki/<ime>_nahodki.json
//
// Какво лови сам, във всеки изглед:
//   · картинка, която не се е заредила (img.complete && naturalWidth 0)
//   · бутон/връзка без нито дума, нито aria-label, нито картинка
//   · елемент, който излиза вдясно извън екрана, без да е в нарочен хоризонтален плъзгач
//   · бутон, по-малък от 40×40 (пръстът на майка с бебе на ръка)
//   · грешки в конзолата
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; } }
const ИМЕ = арг.out || 'obikolka', ТЕМА = арг.theme || 'light';
const МАКС = Number(арг.max || 8);
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ПАПКА = path.join(__dirname, 'snimki'); fs.mkdirSync(ПАПКА, { recursive: true });
const ПРОФИЛ = path.join(__dirname, 'chrome_ob_' + Date.now() + '_' + Math.floor(Math.random() * 1e6));
const ПОРТ = 9200 + Math.floor(Math.random() * 700);
const пауза = ms => new Promise(r => setTimeout(r, ms));

const ЛОВ = `(() => {
  const W = innerWidth, H = innerHeight;
  const видим = е => { const к = е.getBoundingClientRect(); const s = getComputedStyle(е);
    return к.width > 0 && к.height > 0 && к.bottom > 0 && к.top < H && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05; };
  const име = е => (е.tagName + '.' + ((е.className && е.className.baseVal !== undefined ? е.className.baseVal : е.className) || '').toString().split(' ').filter(Boolean).slice(0, 2).join('.')).slice(0, 40);
  const н = { счупени_картинки: [], празни_бутони: [], извън_екрана: [], малки_бутони: [] };
  for (const и of document.querySelectorAll('img')) if (видим(и) && и.complete && и.naturalWidth === 0) н.счупени_картинки.push(име(и) + ' ' + (и.getAttribute('src') || '').slice(0, 60));
  for (const б of document.querySelectorAll('button, a[href], [role="button"]')) {
    if (!видим(б)) continue;
    const т = (б.innerText || '').trim(), а = б.getAttribute('aria-label') || б.getAttribute('title') || '';
    const има_картинка = б.querySelector('img, svg, .pl-em, [data-pl-pl]') || getComputedStyle(б).backgroundImage !== 'none';
    if (!т && !а && !има_картинка) н.празни_бутони.push(име(б));
    const к = б.getBoundingClientRect();
    if ((к.width < 40 || к.height < 40) && т.length < 30) н.малки_бутони.push(име(б) + ' ' + Math.round(к.width) + '×' + Math.round(к.height) + (т ? ' „' + т.slice(0, 16) + '“' : ''));
  }
  for (const е of document.querySelectorAll('body *')) {
    if (!видим(е)) continue;
    const к = е.getBoundingClientRect();
    if (к.right <= W + 1 || к.width > W * 3) continue;
    let р = е.parentElement, плъзгач = false;
    while (р && р !== document.body) { const s = getComputedStyle(р); if (/(auto|scroll|hidden|clip)/.test(s.overflowX) && р.getBoundingClientRect().right <= W + 1) { плъзгач = true; break; } р = р.parentElement; }
    if (!плъзгач && getComputedStyle(е).position !== 'fixed') н.извън_екрана.push(име(е) + ' дясно=' + Math.round(к.right));
  }
  for (const к in н) н[к] = [...new Set(н[к])].slice(0, 8);
  return н;
})()`;

(async () => {
  const ch = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=390,844', 'about:blank'], { stdio: 'ignore' });
  let цел; for (let i = 0; i < 80 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + ПОРТ + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
  if (!цел) throw new Error('Chrome не тръгна');
  const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let n = 0; const ч = new Map(); const грешки = [];
  ws.onmessage = e => { const м = JSON.parse(e.data); if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); } if (м.method === 'Runtime.exceptionThrown') грешки.push((м.params.exceptionDetails.exception && м.params.exceptionDetails.exception.description || м.params.exceptionDetails.text || '').slice(0, 160)); };
  const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  const изрази = async x => { const р = await send('Runtime.evaluate', { expression: x, awaitPromise: true, returnByValue: true }); return р.result.exceptionDetails ? { ГРЕШКА: (р.result.exceptionDetails.exception || {}).description || р.result.exceptionDetails.text } : р.result.result.value; };
  const зареди = async () => { for (let i = 0; i < 120; i++) { await пауза(300); if (await изрази("document.readyState === 'complete' && !!window.MamaHelper") === true) break; } await пауза(1800); };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await send('Page.navigate', { url: 'http://localhost:' + (арг.port || 8911) + '/' }); await зареди();
  await изрази(`(() => { localStorage.clear(); const s = (k, v) => localStorage.setItem(k, JSON.stringify(v)); s('bl_onboarded', true); localStorage.setItem('bl_tour_done','1'); s('bl_hero_toured', true); s('bl_day1','2026-08-01'); s('bl_mama',{name:'Мария'}); ${арг.profile === 'preg' ? "s('bl_preg', { due: new Date(Date.now() + 16 * 7 * 864e5).toISOString().slice(0, 10) }); s('bl_baby', { name: '' });" : "s('bl_baby', { name: 'Алекс', birth: '2026-03-20', sex: 'boy' });"} localStorage.setItem('bl_theme','${ТЕМА}'); return 1; })()`);
  await send('Page.reload'); await зареди();
  await изрази(`(() => { document.querySelectorAll('button').forEach(b => { if (/Благодаря/.test(b.innerText)) b.click(); }); document.documentElement.style.scrollBehavior = 'auto'; return 1; })()`);
  if (арг.room) {
    await изрази(`(() => { MamaHelper.open(${JSON.stringify(арг.room)}); return 1; })()`); await пауза(2200);
    const таб = арг.tab || 'room';
    await изрази(`(() => { const s = document.querySelector('#roTabs .st-seg[data-tab="${таб}"]'); if (s) s.click(); return 1; })()`); await пауза(1400);
  }
  // кой елемент се превърта: стаята има свой контейнер, началото — прозореца
  const СКРОЛ = `(() => { const к = [...document.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 40 && /(auto|scroll)/.test(getComputedStyle(e).overflowY) && e.clientHeight > 400);
    const най = к.sort((a, b) => b.clientHeight - a.clientHeight)[0]; return най ? най : document.scrollingElement; })()`;
  await изрази(`window.__ск = ${СКРОЛ}; window.__ск.style.scrollBehavior = 'auto'; 1`);
  const находки = [];
  for (let i = 0; i < МАКС; i++) {
    await пауза(400);
    // 🪤 06.10: headless не рисува кадри между заявките → наблюдателите за поява и
    //   преходите стоят. Без това снимката хваща картите в първия кадър на изплуването
    //   и показва „дупки“, които на телефон ги няма. 40 истински кадъра преди снимка.
    await изрази('new Promise(r => { let k = 0; const f = () => (++k >= 40 ? r(1) : requestAnimationFrame(f)); requestAnimationFrame(f); })');
    await пауза(200);
    const р = await send('Page.captureScreenshot', { format: 'jpeg', quality: 70 });
    fs.writeFileSync(path.join(ПАПКА, ИМЕ + '_' + String(i).padStart(2, '0') + '.jpg'), Buffer.from(р.result.data, 'base64'));
    const н = await изрази(ЛОВ);
    находки.push({ изглед: i, ...н });
    const премести = await изрази(`(() => { const s = window.__ск; const преди = s.scrollTop; s.scrollTop += innerHeight * 0.85; return s.scrollTop - преди; })()`);
    if (!премести || премести < 20) { console.log('  край на страницата при изглед ' + i); break; }
  }
  fs.writeFileSync(path.join(ПАПКА, ИМЕ + '_nahodki.json'), JSON.stringify({ грешки, находки }, null, 1));
  // кратко резюме в конзолата
  const сбор = { счупени_картинки: new Set(), празни_бутони: new Set(), извън_екрана: new Set(), малки_бутони: new Set() };
  for (const н of находки) for (const к in сбор) (н[к] || []).forEach(x => сбор[к].add(x));
  console.log('📸 ' + ИМЕ + ': ' + находки.length + ' изгледа · грешки в конзолата: ' + грешки.length);
  for (const к in сбор) if (сбор[к].size) console.log('  ' + к + ' (' + сбор[к].size + '): ' + [...сбор[к]].slice(0, 6).join(' · '));
  if (грешки.length) console.log('  грешки: ' + грешки.slice(0, 3).join(' | '));
  try { ws.close(); } catch (e) {} try { ch.kill(); } catch (e) {}
  try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {}
  process.exit(0);
})().catch(e => { console.log('🔴 ' + e.message); process.exit(3); });
