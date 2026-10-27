// 📚 АЛБУМИТЕ (27.10.2026) — js/photos.js, блокът „АЛБУМИТЕ“, през истинския ред на index.html.
// Засят профил + снимки (рисувани в canvas) → „Моето бебе“ → картата → натиск с мишка → списък/албум/цял екран →
// ❤️ и надпис се пишат в bl_alb_meta → Esc стъпка по стъпка → „назад“ на телефона не затваря стаята →
// фотокнигата отваря печатния лист → бутонът в „Инструменти“ → 0 JS грешки. Снимки в dev/proba/snimki/alb_*.png.
// ПУСКАНЕ: node dev/proba/albumi_proba.js [--port 8912] [--theme light|dark] [--reduce] [--w 390 --h 844]
const { spawn } = require('child_process'); const path = require('path'); const fs = require('fs');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; } }
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const W = +(арг.w || 390), H = +(арг.h || 844);
const пауза = ms => new Promise(r => setTimeout(r, ms));
const СНИМКИ = path.join(__dirname, 'snimki'); try { fs.mkdirSync(СНИМКИ, { recursive: true }); } catch (e) {}
const НАСТ = (арг.theme === 'dark' ? '_dark' : '') + (арг.reduce ? '_reduce' : '') + (W !== 390 ? '_' + W : '');
(async () => {
  await require('./slot.js')('chrome');
  const ПРОФИЛ = path.join(__dirname, 'chrome_pr_alb_' + Date.now()); const ПОРТ = 9200 + Math.floor(Math.random() * 700);
  const ch = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=' + W + ',' + H, 'about:blank'], { stdio: 'ignore' });
  let цел; for (let i = 0; i < 80 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + ПОРТ + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
  if (!цел) { console.log('🔴 Chrome не тръгна'); process.exit(3); }
  const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let n = 0; const ч = new Map(); const грешки = [];
  const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  ws.onmessage = e => {
    const м = JSON.parse(e.data);
    if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); }
    if (м.method === 'Runtime.exceptionThrown') грешки.push((м.params.exceptionDetails.exception && м.params.exceptionDetails.exception.description || м.params.exceptionDetails.text).split('\n')[0]);
    if (м.method === 'Runtime.consoleAPICalled' && м.params.type === 'error') грешки.push('console: ' + м.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 160));
  };
  const изр = async x => { const р = await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true }); return р.result && р.result.result ? р.result.result.value : null; };
  const снимай = async име => { await изр('new Promise(r => { let k = 0; const f = () => (++k < 40 ? requestAnimationFrame(f) : r(1)); requestAnimationFrame(f); })'); const р = await send('Page.captureScreenshot', { format: 'png' }); if (р.result) fs.writeFileSync(path.join(СНИМКИ, 'alb_' + име + НАСТ + '.png'), Buffer.from(р.result.data, 'base64')); };
  const клавиш = async (key, code, vk, шифт) => { for (const type of ['keyDown', 'keyUp']) await send('Input.dispatchKeyEvent', { type, key, code, windowsVirtualKeyCode: vk, modifiers: шифт ? 8 : 0 }); await пауза(250); };
  // истински натиск с мишка в средата на елемента (след мигновено превъртане)
  const натисни = async селектор => {
    const р = JSON.parse(await изр(`(() => { const e = ${селектор}; if (!e) return 'null'; e.scrollIntoView({ block: 'center', behavior: 'instant' }); const b = e.getBoundingClientRect(); return JSON.stringify({ x: b.left + b.width / 2, y: b.top + b.height / 2 }); })()`) || 'null');
    if (!р) return false;
    // картите са content-visibility: auto — влизат ли в кадър, се преоразмеряват и бутонът се мести.
    // Превъртаме, докато застане видим на едно място (до 6 пъти), чак тогава натискаме.
    for (let k = 0; k < 6; k++) { await пауза(250); const ок = await изр(`(() => { const e = ${селектор}; const y = e.getBoundingClientRect().top; if (y > 60 && y < innerHeight - 80) return true; e.scrollIntoView({ block: 'center', behavior: 'instant' }); return false; })()`); if (ок) break; }
    const р2 = JSON.parse(await изр(`(() => { const e = ${селектор}; const b = e.getBoundingClientRect(); const x = b.left + b.width / 2, y = b.top + b.height / 2; const п = document.elementFromPoint(x, y); return JSON.stringify({ x, y, улучва: !!(п && (п === e || e.contains(п))), под: п ? (п.id || п.className || п.tagName).toString().slice(0, 50) : null }); })()`));
    // пробата мери себе си: ако нещо лежи отгоре, натискът не е на мама — казваме го, не го скриваме
    if (!р2.улучва) console.log('⚠️ под точката (' + Math.round(р2.x) + ',' + Math.round(р2.y) + ') е „' + р2.под + '“, не целта: ' + селектор.slice(0, 80));
    for (const type of ['mouseMoved', 'mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x: р2.x, y: р2.y, button: 'left', clickCount: 1 });
    return р2.улучва;
  };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: W < 768 });
  if (арг.reduce) await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  const АДР = 'http://localhost:' + (арг.port || 8912) + '/';
  await send('Page.navigate', { url: АДР + 'manifest.webmanifest' }); await пауза(700);
  await изр(`(() => { localStorage.clear(); const s = (k, v) => localStorage.setItem(k, JSON.stringify(v));
    s('bl_onboarded', true); localStorage.setItem('bl_tour_done','1'); s('bl_hero_toured', true); s('bl_day1','2026-08-01'); s('bl_mama',{name:'Мария'});
    s('bl_baby', { name: 'Алекс', birth: '2026-03-20', sex: 'boy' }); localStorage.setItem('bl_theme','${арг.theme || 'light'}');
    s('bl_badges_seen', ['photos6']); return 1; })()`);
  await send('Page.navigate', { url: АДР });
  for (let i = 0; i < 240; i++) { await пауза(250); try { if (await изр("!document.getElementById('blSplash') && !!document.querySelector('.pl-room')")) break; } catch (e) {} }
  // снимките се сеят СЛЕД зареждането — през store.js (медията отива в IndexedDB като истинска)
  const засято = await изр(`(() => {
    const pic = (h, t) => { const c = document.createElement('canvas'); c.width = 480; c.height = 360; const x = c.getContext('2d');
      const g = x.createLinearGradient(0, 0, 480, 360); g.addColorStop(0, 'hsl(' + h + ',70%,82%)'); g.addColorStop(1, 'hsl(' + (h + 60) + ',60%,66%)');
      x.fillStyle = g; x.fillRect(0, 0, 480, 360); x.fillStyle = 'rgba(255,255,255,.85)'; x.beginPath(); x.arc(240, 160, 80, 0, 7); x.fill();
      x.fillStyle = '#1d2a5c'; x.font = 'bold 40px sans-serif'; x.textAlign = 'center'; x.fillText(t, 240, 300); return c.toDataURL('image/jpeg', .8); };
    const ph = {}; for (let m = 0; m < 8; m++) ph[m] = pic(m * 40, m + ' мес');
    localStorage.setItem('bl_photos', JSON.stringify(ph));
    localStorage.setItem('bl_dayphoto', JSON.stringify({ '2026-10-27': pic(300, 'днес'), '2026-09-27': pic(200, 'преди месец'), '2025-10-27': pic(160, 'преди година'), '2026-10-05': pic(120, '5 окт'), '2026-08-14': pic(30, '14 авг') }));
    localStorage.setItem('bl_food_faces', JSON.stringify([{ img: pic(90, 'броколи'), note: 'броколи', ts: Date.parse('2026-10-12T10:00:00') }]));
    localStorage.setItem('bl_bump', JSON.stringify({ 20: pic(330, '20 седм'), 32: pic(350, '32 седм') }));
    localStorage.setItem('bl_rash', JSON.stringify([{ img: pic(0, 'обрив'), note: '', ts: Date.now() }]));
    return window.BL_ALBUMI ? BL_ALBUMI.всички().length : -1; })()`);
  await пауза(400);
  const резултат = []; let добре = true; const провери = (име, усл, дет) => { резултат.push((усл ? '✅ ' : '🔴 ') + име + (дет ? ' · ' + дет : '')); if (!усл) добре = false; };
  провери('BL_ALBUMI зареден, 16 снимки събрани (обривът НЕ влиза)', засято === 16, 'събрани: ' + засято);
  провери('BL_FIZ (генераторите на помощника)', true, await изр("window.BL_FIZ ? 'има: ' + Object.keys(BL_FIZ).join(',') : 'още го няма — бутоните за хартия са скрити'"));
  // 🔎 прегледът 27.10: датите при раждане на 31-во, две ехографии от един преглед, „Ти в кадъра“ само с месец.
  //   Профилът се сменя за миг и се връща — снимките не се пипат.
  const дати = JSON.parse(await изр(`(() => {
    const б = localStorage.getItem('bl_baby'), е = localStorage.getItem('bl_echo'), к = localStorage.getItem('bl_wm_inframe');
    const img = n => { const c = document.createElement('canvas'); c.width = 60; c.height = 40; const x = c.getContext('2d'); x.fillStyle = 'hsl(' + n + ',60%,60%)'; x.fillRect(0, 0, 60, 40); x.fillStyle = '#fff'; x.fillRect(n % 50, 5, 9, 9); return c.toDataURL('image/jpeg', .9); };
    try {
      localStorage.setItem('bl_baby', JSON.stringify({ name: 'Алекс', birth: '2026-01-31', sex: 'boy' }));
      localStorage.setItem('bl_echo', JSON.stringify([{ img: img(10), w: 20, d: '2026-05-10', t: 'маха с ръчичка' }, { img: img(200), w: 20, d: '2026-05-10', t: '' }]));
      localStorage.setItem('bl_wm_inframe', JSON.stringify({ '2026-10': img(300) }));
      const с = BL_ALBUMI.всички(), г = BL_ALBUMI.албуми(с);
      const д = x => x && x.д ? x.д.getFullYear() + '-' + String(x.д.getMonth() + 1).padStart(2, '0') + '-' + String(x.д.getDate()).padStart(2, '0') : null;
      const ех = с.filter(x => x.ид.startsWith('bl_echo:'));
      const ян = г.мес.find(а => а.ид === 'm:2026-01'), фе = г.мес.find(а => а.ид === 'm:2026-02');
      return JSON.stringify({ м1: д(с.find(x => x.мес === 1)), м2: д(с.find(x => x.мес === 2)), ян: ян && ян.под, фе: фе && фе.под,
        ехо: new Set(ех.map(x => x.ид)).size, думи: ех.map(x => x.думи).join('|'), кадър: (с.find(x => x.вид === 'ти в кадъра') || {}).сМесец === true });
    } finally {
      localStorage.setItem('bl_baby', б); е == null ? localStorage.removeItem('bl_echo') : localStorage.setItem('bl_echo', е); к == null ? localStorage.removeItem('bl_wm_inframe') : localStorage.setItem('bl_wm_inframe', к);
    } })()`) || '{}');
  провери('роден 31.01: „1 месец“ е 28.02, „2 месеца“ е 31.03 (не 3 март)', дати.м1 === '2026-02-28' && дати.м2 === '2026-03-31', JSON.stringify(дати));
  провери('роден 31.01: януари = „първият месец“, февруари = „1 месец“ (като банера)', дати.ян === 'първият месец' && дати.фе === '1 месец');
  провери('две ехографии от един преглед — две отделни снимки; думите на мама стигат до картата', дати.ехо === 2 && /маха с ръчичка/.test(дати.думи || ''));
  провери('„Ти в кадъра“ се помни само с месец (без измислен ден)', дати.кадър === true);
  провери('профилът е върнат', (await изр("JSON.parse(localStorage.getItem('bl_baby')).birth")) === '2026-03-20' && (await изр('BL_ALBUMI.всички().length')) === 16);

  // стаята
  await изр("BL_OTVORI_BARZO('Моето бебе')");
  let карта = null;
  for (let i = 0; i < 60 && !карта; i++) { await пауза(200); карта = await изр("(() => { const c = [...document.querySelectorAll('#roRoom section')].find(s => s.textContent.includes('по месеци, по години')); return c ? 'има' : null; })()"); }
  провери('картата „Албумите“ е в „Моето бебе“', !!карта);
  // прозорци отгоре (значката „Фото-лента“ от засетите снимки) — затварят се с бутона им, както мама.
  // НЕ с Escape: той затваря и стаята отдолу (първото пускане натискаше „начало“).
  for (let i = 0; i < 6; i++) {
    await пауза(400);
    const б = await изр("(() => { const b = [...document.querySelectorAll('button')].find(x => /Благодаря|Чудесно|Супер|Разбрах/.test(x.textContent) && x.getClientRects().length && !x.closest('#roomOverlay')); if (!b) return null; b.click(); return b.textContent.trim().slice(0, 30); })()");
    if (б) console.log('затворих прозорец отгоре: ' + б);
  }
  провери('стаята е отворена след прозорците отгоре', await изр("!document.getElementById('roomOverlay').hidden"));
  const КАРТА = "[...document.querySelectorAll('#roRoom section')].find(s => s.textContent.includes('по месеци, по години'))";
  // (заглавието НЕ се натиска — то СГЪВА картата; първото пускане я сгъваше само)
  await изр(`${КАРТА}.scrollIntoView({ block: 'center', behavior: 'instant' })`);
  await пауза(2200);
  const поглед = await изр(`(() => { const c = ${КАРТА}; return JSON.stringify({ снимки: c.querySelectorAll('.alb-peek img').length, ред: c.querySelector('.jr-privacy').textContent.slice(0, 90), преди: (c.previousElementSibling && c.previousElementSibling.textContent || '').slice(0, 30) }); })()`);
  провери('картата брои и показва 4 последни снимки (в празно време)', /"снимки":4/.test(поглед), поглед);
  await изр(`${КАРТА}.scrollIntoView({ block: 'center', behavior: 'instant' })`); await пауза(400);
  for (let k = 0; k < 6; k++) { const ок = await изр(`(() => { const c = ${КАРТА}; const y = c.getBoundingClientRect().top; if (y > 80 && y < 300) return true; c.scrollIntoView({ block: 'start', behavior: 'instant' }); document.getElementById('roRoom').scrollTop -= 100; return false; })()`); if (ок) break; await пауза(300); }
  await снимай('0_karta');

  // натиск → прозорецът
  // честното време: от самия click (капан в capture) до втория кадър след него — без паузите на пробата
  await изр("(() => { window.__albT = 0; window.__albK = 0; document.addEventListener('click', () => { window.__albT = performance.now(); requestAnimationFrame(() => requestAnimationFrame(() => { window.__albK = performance.now(); })); }, { capture: true, once: true }); return 1; })()");
  await натисни(`[...${КАРТА}.querySelectorAll('button')].find(b => b.textContent.includes('Отвори албумите'))`);
  await пауза(300); const отвМс = await изр('Math.round(window.__albK - window.__albT)');
  await пауза(500);
  if (await изр("!document.getElementById('albOv') || document.getElementById('albOv').hidden")) { console.log(резултат.join('\n') + '\n🔴 прозорецът не се отвори от натиска · грешки: ' + грешки.join(' || ')); try { ch.kill(); } catch (e) {} process.exit(1); }
  const сп = JSON.parse(await изр(`JSON.stringify((() => { const о = document.getElementById('albOv'); return { отворен: !!о && !о.hidden, заг: о.querySelector('.alb-h').textContent, плочки: о.querySelectorAll('.alb-tile').length, ден: [...о.querySelectorAll('.alb-day-it span')].map(x => x.textContent), сег: [...о.querySelectorAll('.alb-sg')].map(x => x.textContent), фокус: document.activeElement && document.activeElement.className, история: history.state, корица: о.querySelector('.alb-tile strong') && о.querySelector('.alb-tile strong').textContent }; })())`));
  провери('прозорецът се отваря', сп.отворен, сп.заг + ' · ' + отвМс + ' ms до кадъра');
  провери('по месеци: 9 албума (8 от 2026 + октомври 2025), най-новият отгоре', сп.плочки === 9 && /октомври 2026/.test(сп.корица), сп.корица + ' · ' + сп.сег.join(' | '));
  провери('„На този ден“: преди месец и преди година', сп.ден.length === 2 && сп.ден.some(x => /година/.test(x)) && сп.ден.some(x => /месец/.test(x)), сп.ден.join(', '));
  провери('фокусът е в прозореца', /alb-x/.test(сп.фокус || ''), сп.фокус);
  провери('историята има наше състояние над стаята', сп.история && сп.история.blAlb && сп.история.blRoom, JSON.stringify(сп.история));
  await снимай('1_spisak');

  // Tab не излиза от прозореца
  for (let i = 0; i < 14; i++) await клавиш('Tab', 'Tab', 9);
  провери('Tab обикаля само в прозореца', await изр("document.getElementById('albOv').contains(document.activeElement)"));

  // специални и години
  await натисни(`[...document.querySelectorAll('#albOv .alb-sg')][2]`); await пауза(400);
  const спец = await изр("[...document.querySelectorAll('#albOv .alb-tile strong')].map(x => x.textContent).join(' | ')");
  провери('специални: месец по месец, чакането, снимката на деня, първите вкусове', /Месец по месец/.test(спец) && /Чакането/.test(спец) && /Първите вкусове/.test(спец) && !/обрив/i.test(спец), спец);
  await натисни(`[...document.querySelectorAll('#albOv .alb-sg')][1]`); await пауза(400);
  const год = await изр("[...document.querySelectorAll('#albOv .alb-tile strong')].map(x => x.textContent).join(' | ')");
  провери('по години: 2026 и 2025', /2026/.test(год) && /2025/.test(год), год);
  await натисни(`document.querySelector('#albOv .alb-tile')`); await пауза(500);
  const ал = JSON.parse(await изр(`JSON.stringify({ заг: document.querySelector('#albOv .alb-h').textContent, снимки: document.querySelectorAll('#albOv .alb-pc').length, бутони: [...document.querySelectorAll('#albOv .alb-act button')].map(b => b.textContent), назад: !document.querySelector('#albOv .alb-back').hidden })`));
  провери('албумът на годината: снимките + бутоните', ал.снимки === 13 && ал.назад && ал.бутони.some(x => /Фотокнига/.test(x)), ал.заг + ' · ' + ал.снимки + ' сн. · ' + ал.бутони.join(' | '));
  await снимай('2_albym');

  // хартията през МОИТЕ бутони → BL_FIZ (помощника). запази() се подменя: пазим Blob-а и му мерим размерите,
  // вместо да сваляме файл. Така се проверява договорът (какво подавам), не само генераторът.
  const хартия = async (селектор, име) => {
    await изр("(() => { window.__fiz = null; if (window.BL_FIZ && !BL_FIZ.__истинско) { BL_FIZ.__истинско = BL_FIZ.запази; BL_FIZ.запази = (b, n) => { window.__fiz = { b, n }; return Promise.resolve('download'); }; } return 1; })()");
    if (!(await натисни(селектор))) { провери(име, false, 'бутонът го няма / не е улучен'); return; }
    let р = null;
    for (let i = 0; i < 60 && !р; i++) { await пауза(250); р = await изр("(async () => { const x = window.__fiz; if (!x) return null; const bm = await createImageBitmap(x.b); return JSON.stringify({ име: x.n, kb: Math.round(x.b.size / 1024), тип: x.b.type, w: bm.width, h: bm.height }); })()"); }
    // резултатът на диска — да го ВИДИМ с моите заглавия, не само да го преброим
    const дату = await изр("new Promise(r => { if (!window.__fiz) return r(null); const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(window.__fiz.b); })");
    if (дату) fs.writeFileSync(path.join(СНИМКИ, 'alb_fiz_' + име.replace(/[^\p{L}\d]+/gu, '_').replace(/^_|_$/g, '') + НАСТ + '.jpg'), Buffer.from(дату.split(',')[1], 'base64'));
    const съобщ = await изр("(document.querySelector('#albOv .alb-lb:not([hidden]) .alb-lb-msg') || document.querySelector('#albOv .alb-msg') || {}).textContent || ''");
    провери(име, !!р && /image\/jpeg/.test(р) && /Готово/.test(съобщ), (р || 'нищо за 15 с') + ' · „' + съобщ + '“');
  };
  if (await изр('!!window.BL_FIZ')) {
    await хартия("[...document.querySelectorAll('#albOv .alb-act button')].find(b => /Колаж/.test(b.textContent))", '🧩 колаж от албума');
    await хартия("[...document.querySelectorAll('#albOv .alb-act button')].find(b => /Плакат/.test(b.textContent))", '🗓️ плакат на годината');
  }

  // цял екран: ❤️, надпис, стрелки, плъзване
  await натисни(`document.querySelectorAll('#albOv .alb-pc')[2]`); await пауза(500);
  const скрол0 = await изр("document.querySelector('#albOv .alb-body').scrollTop");
  const лб1 = await изр("document.querySelector('#albOv .alb-lb-n').textContent + ' · ' + document.querySelector('#albOv .alb-lb-d').textContent");
  провери('снимката на цял екран', !(await изр("document.querySelector('#albOv .alb-lb').hidden")), лб1);
  await натисни(`document.querySelector('#albOv .alb-fav')`); await пауза(300);
  await натисни(`document.querySelector('#albOv .alb-ed')`); await пауза(300);
  await изр("(() => { const i = document.querySelector('#albOv .alb-lb-ed input'); i.value = 'първата усмивка'; return 1; })()");
  await натисни(`document.querySelector('#albOv .alb-lb-ok')`); await пауза(300);
  const мета = await изр("localStorage.getItem('bl_alb_meta')");
  провери('❤️ и надписът са в bl_alb_meta', /"f":1/.test(мета || '') && /първата усмивка/.test(мета || ''), мета);
  провери('надписът се вижда под снимката', (await изр("document.querySelector('#albOv .alb-lb-t').textContent")) === 'първата усмивка');
  await снимай('3_cial_ekran');
  if (await изр('!!window.BL_FIZ')) {
    await хартия("document.querySelector('#albOv .alb-k10')", '🖼️ карта 10×15 от снимката');
    await хартия("document.querySelector('#albOv .alb-kst')", '📱 карта за телефона');
    // двоен натиск: втори, докато първата се прави — едно платно, един файл
    await изр("(() => { window.__брой = 0; BL_FIZ.запази = () => { window.__брой++; return new Promise(r => setTimeout(() => r('download'), 400)); }; const б = document.querySelector('#albOv .alb-k10'); б.click(); б.click(); return 1; })()");
    await пауза(2500);
    провери('двоен натиск на „Карта 10×15“ → един файл', (await изр('window.__брой')) === 1, 'запази × ' + await изр('window.__брой'));
    await изр("(() => { if (BL_FIZ.__истинско) { BL_FIZ.запази = BL_FIZ.__истинско; delete BL_FIZ.__истинско; } return 1; })()");
  }
  // ‹ › не местят фокуса на ✕ (иначе вторият Enter затваря снимката)
  await изр("document.querySelector('#albOv .alb-lb-s').focus()");
  // 🪞 Enter без text '\r' не натиска бутона (CDP) — първото пускане мереше себе си
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r', unmodifiedText: '\r' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 }); await пауза(250);
  провери('Enter на › → следващата, фокусът остава на ›', /alb-lb-s/.test(await изр("document.activeElement.className") || '') && /^4 \//.test(await изр("document.querySelector('#albOv .alb-lb-n').textContent")), await изр("document.querySelector('#albOv .alb-lb-n').textContent + ' · ' + document.activeElement.className"));
  await клавиш('ArrowLeft', 'ArrowLeft', 37);
  await клавиш('ArrowRight', 'ArrowRight', 39);
  const лб2 = await изр("document.querySelector('#albOv .alb-lb-n').textContent");
  провери('стрелка надясно → следващата', /^4 \//.test(лб2), лб2);
  // плъзване с пръст наляво (pointer събития от мишка)
  const ст = JSON.parse(await изр("(() => { const b = document.querySelector('#albOv .alb-lb-img').getBoundingClientRect(); return JSON.stringify({ x: b.left + b.width / 2, y: b.top + b.height / 2 }); })()"));
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: ст.x + 80, y: ст.y, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: ст.x - 40, y: ст.y, button: 'left' });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: ст.x - 80, y: ст.y, button: 'left', clickCount: 1 });
  await пауза(300);
  провери('плъзване наляво → следващата', /^5 \//.test(await изр("document.querySelector('#albOv .alb-lb-n').textContent")));

  // „назад“ на телефона: първо затваря снимката, после албума, после прозореца — стаята остава
  await изр('history.back()'); await пауза(500);
  const н1 = await изр("JSON.stringify({ лб: document.querySelector('#albOv .alb-lb').hidden, ов: document.getElementById('albOv').hidden, стая: !document.getElementById('roomOverlay').hidden })");
  провери('„назад“ #1 затваря снимката, стаята стои', /"лб":true,"ов":false,"стая":true/.test(н1), н1);
  const сл = JSON.parse(await изр("JSON.stringify({ скрол: document.querySelector('#albOv .alb-body').scrollTop, фокус: [...document.querySelectorAll('#albOv .alb-pc')].indexOf(document.activeElement) })"));
  провери('след снимката: скролът стои, фокусът е на плочката ѝ (5-та)', Math.abs(сл.скрол - скрол0) <= 2 && сл.фокус === 4, 'скрол ' + скрол0 + ' → ' + сл.скрол + ' · плочка ' + сл.фокус);
  await клавиш('Escape', 'Escape', 27);
  провери('Esc от албума → към списъка', (await изр("document.querySelector('#albOv .alb-back').hidden")) === true);
  // любимата вече е в „Специални“
  await натисни(`[...document.querySelectorAll('#albOv .alb-sg')][2]`); await пауза(300);
  провери('❤️ Любимите се появиха', /Любимите/.test(await изр("[...document.querySelectorAll('#albOv .alb-tile strong')].map(x => x.textContent).join(' | ')")));
  // фотокнигата
  await натисни(`[...document.querySelectorAll('#albOv .alb-tile')].find(t => /Месец по месец/.test(t.textContent))`); await пауза(400);
  // плакатът „Първата година“: годината е на бебето (родено 20.03.2026 → 2026–2027), не днешната
  if (await изр('!!window.BL_FIZ')) {
    await изр("(() => { window.__плО = null; if (!BL_FIZ.__пл) { BL_FIZ.__пл = BL_FIZ.плакат; BL_FIZ.плакат = (с, о) => { window.__плО = о; return BL_FIZ.__пл(с, о); }; } return 1; })()");
    await хартия("[...document.querySelectorAll('#albOv .alb-act button')].find(b => /Плакат/.test(b.textContent))", '🗓️ плакат „Първата година“');
    const пО = JSON.parse(await изр("JSON.stringify(window.__плО || {})"));
    провери('плакатът: годината е на бебето, заглавието не я повтаря', пО.година === '2026–2027' && /Първата година/.test(пО.заглавие || '') && !/\d{4}/.test(пО.заглавие || ''), JSON.stringify(пО));
    await изр("(() => { if (BL_FIZ.__пл) { BL_FIZ.плакат = BL_FIZ.__пл; delete BL_FIZ.__пл; } if (BL_FIZ.__истинско) { BL_FIZ.запази = BL_FIZ.__истинско; delete BL_FIZ.__истинско; } return 1; })()");
  }
  await натисни(`[...document.querySelectorAll('#albOv .alb-act button')].find(b => /Фотокнига/.test(b.textContent))`); await пауза(600);
  const кн = await изр("(() => { const h = document.getElementById('printHolder'); return JSON.stringify({ отворен: !!h && !h.hidden, корица: !!(h && h.querySelector('.alb-bk-cover img')), стр: h ? h.querySelectorAll('.alb-bk-pg').length : 0, снимки: h ? h.querySelectorAll('.alb-bk-pg img').length : 0, отгоре: h ? +getComputedStyle(h).zIndex > +getComputedStyle(document.getElementById('albOv')).zIndex : false }); })()");
  провери('фотокнигата: корица + 4 страници по 2 (8 месечни)', /"отворен":true,"корица":true,"стр":4,"снимки":8,"отгоре":true/.test(кн), кн);
  await снимай('4_kniga');
  // листът е НАД албумите: фокусът е в него, Esc и „назад“ затварят само него
  const листФ = await изр("document.activeElement && document.activeElement.id");
  await клавиш('Escape', 'Escape', 27);
  const сЕск = JSON.parse(await изр("JSON.stringify({ лист: document.getElementById('printHolder').hidden, ов: document.getElementById('albOv').hidden, албум: !document.querySelector('#albOv .alb-back').hidden, фокус: document.activeElement && document.activeElement.textContent })"));
  провери('фотокнигата: фокусът е в листа; Esc затваря САМО листа', листФ === 'prPrint' && сЕск.лист && !сЕск.ов && сЕск.албум && /Фотокнига/.test(сЕск.фокус || ''), 'фокус в листа: ' + листФ + ' · ' + JSON.stringify(сЕск));
  await натисни(`[...document.querySelectorAll('#albOv .alb-act button')].find(b => /Фотокнига/.test(b.textContent))`); await пауза(600);
  await изр('history.back()'); await пауза(500);
  const сНз = JSON.parse(await изр("JSON.stringify({ лист: document.getElementById('printHolder').hidden, ов: document.getElementById('albOv').hidden, албум: !document.querySelector('#albOv .alb-back').hidden, стая: !document.getElementById('roomOverlay').hidden })"));
  провери('фотокнигата: „назад“ затваря САМО листа', сНз.лист && !сНз.ов && сНз.албум && сНз.стая, JSON.stringify(сНз));
  await клавиш('Escape', 'Escape', 27); await клавиш('Escape', 'Escape', 27);
  const н2 = await изр("JSON.stringify({ ов: document.getElementById('albOv').hidden, стая: !document.getElementById('roomOverlay').hidden, история: history.state })");
  провери('Esc ×2 затваря прозореца, стаята остава отворена', /"ов":true,"стая":true/.test(н2), н2);
  провери('фокусът се върна на бутона', /Отвори албумите/.test(await изр("document.activeElement && document.activeElement.textContent") || ''));

  // бутонът в „Инструменти“
  await изр("document.getElementById('roClose') && document.getElementById('roClose').click()"); await пауза(900);
  await изр("BL_OTVORI_BARZO('Инструменти')");
  let ин = null; for (let i = 0; i < 60 && !ин; i++) { await пауза(200); ин = await изр("[...document.querySelectorAll('#roRoom button')].find(b => b.textContent.includes('Подреди ги в албуми')) ? 1 : null"); }
  провери('„Инструменти“ → „Подреди ги в албуми“', !!ин);
  if (ин) {
    await пауза(500);
    await пауза(1500);   // тежката стая довършва подреждането си — по-рано превъртането се губеше
    // и тук изскача значка (badges2 → .md-name) — затваря се с бутона ѝ
    for (let i = 0; i < 4; i++) { const б = await изр("(() => { const b = [...document.querySelectorAll('.md-veil.on button, .md-veil button')].find(x => x.getClientRects().length); if (!b) return null; b.click(); return b.textContent.trim().slice(0, 30); })()"); if (!б) break; console.log('затворих значка: ' + б); await пауза(400); }
    console.log('Инструменти, пътят до бутона: ' + await изр(`(() => { const b = [...document.querySelectorAll('#roRoom button')].find(x => x.textContent.includes('Подреди ги в албуми')); b.scrollIntoView({ block: 'center', behavior: 'instant' }); const r = b.getBoundingClientRect(); let p = b.parentElement, ch = []; while (p && p !== document.body) { const cs = getComputedStyle(p); if (/auto|scroll|hidden|clip/.test(cs.overflowY) || cs.contentVisibility !== 'visible' || /fold|pending/.test(p.className.toString())) ch.push((p.id || p.className.toString().slice(0, 40)) + ' oY=' + cs.overflowY + ' cv=' + cs.contentVisibility + ' h=' + Math.round(p.getBoundingClientRect().height) + ' top=' + Math.round(p.getBoundingClientRect().top) + ' st=' + p.scrollTop + '/' + (p.scrollHeight - p.clientHeight)); p = p.parentElement; } return JSON.stringify({ y: Math.round(r.top), h: Math.round(r.height), ch }); })()`));
    await натисни("[...document.querySelectorAll('#roRoom button')].find(b => b.textContent.includes('Подреди ги в албуми'))"); await пауза(500);
    провери('отваря албумите', (await изр("document.getElementById('albOv').hidden")) === false);
    await клавиш('Escape', 'Escape', 27);
  }
  провери('0 JS грешки', !грешки.length, грешки.slice(0, 5).join(' || '));
  console.log(резултат.join('\n'));
  console.log(добре ? 'ВСИЧКО МИНАВА' : 'ИМА ПАДНАЛИ');
  try { ws.close(); } catch (e) {} try { ch.kill(); } catch (e) {}
  await пауза(500); try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {}
  process.exit(добре ? 0 : 1);
})();
