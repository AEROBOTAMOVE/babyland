// 👆 ОТКЛИКЪТ ПРЕЗ ИСТИНСКИЯ РЕД (24.10.2026) — css/pl-zhivo.css + js/pl-zhivo.js, блокът „ОТКЛИКЪТ“, зареден от index.html,
// не инжектиран. Засят профил (като letene.js) → началото → натиск по стая (мащаб) → стаята се отваря → вход по ред →
// мехурче/чипове, ако има → 0 JS грешки. Изход 0 = всичко минава.
// ПУСКАНЕ: node dev/proba/otklik_proba.js [--staya "Жената в мен"] [--port 8912] [--theme light|dark] [--reduce]
const { spawn } = require('child_process'); const path = require('path'); const fs = require('fs');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; } }
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const пауза = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await require('./slot.js')('chrome');
  const ПРОФИЛ = path.join(__dirname, 'chrome_pr_otk_' + Date.now()); const ПОРТ = 9200 + Math.floor(Math.random() * 700);
  const ch = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=390,844', 'about:blank'], { stdio: 'ignore' });
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
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  if (арг.reduce) await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  const АДР = 'http://localhost:' + (арг.port || 8912) + '/';
  await send('Page.navigate', { url: АДР + 'manifest.webmanifest' }); await пауза(700);
  await изр(`(() => { localStorage.clear(); const s = (k, v) => localStorage.setItem(k, JSON.stringify(v)); s('bl_onboarded', true); localStorage.setItem('bl_tour_done','1'); s('bl_hero_toured', true); s('bl_day1','2026-08-01'); s('bl_mama',{name:'Мария'}); s('bl_baby', { name: 'Алекс', birth: '2026-03-20', sex: 'boy' }); localStorage.setItem('bl_theme','${арг.theme || 'light'}'); return 1; })()`);
  await send('Page.navigate', { url: АДР });
  for (let i = 0; i < 240; i++) { await пауза(250); try { if (await изр("!document.getElementById('blSplash') && !!document.querySelector('.pl-room')")) break; } catch (e) {} }
  await пауза(600);
  const резултат = []; let добре = true; const провери = (име, усл, дет) => { резултат.push((усл ? '✅ ' : '🔴 ') + име + (дет ? ' · ' + дет : '')); if (!усл) добре = false; };

  const зареден = await изр("JSON.stringify({ откл: !!window.BL_PL_OTKLIK, живо: !!window.BL_PL_ZHIVO, cheer: !!(window.BL_FX && BL_FX.cheer && BL_FX.cheer._plOtk), ключови: [...document.styleSheets].some(s => { try { return [...s.cssRules].some(r => r.name === 'plOtkVliza'); } catch (e) { return false; } }), заявкиOtklik: performance.getEntriesByType('resource').filter(r => /pl-otklik/.test(r.name)).length })");
  const з = JSON.parse(зареден || '{}');
  провери('зареден през index.html (pl-zhivo)', з.откл && з.живо && з.ключови, зареден);
  // (обвивката на cheer е верига — night.js и firstday.js също го обвиват; кой е най-отвън зависи от реда.
  //  Затова тук не се гледа _plOtk най-отвън, а искрите се проверяват на дело по-долу.)
  // отворен прозорец при старта (md-veil) пречи на допира — затваря се с Escape, както би го затворила мама
  for (let i = 0; i < 4 && await изр("!!document.querySelector('.md-veil.on')"); i++) {
    if (!i) console.log('прозорец при старта: ' + await изр("(() => { const v = document.querySelector('.md-veil.on'); return (v.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 90); })()"));
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await пауза(500);
  }
  провери('няма отворен прозорец отгоре', !(await изр("!!document.querySelector('.md-veil.on')")));
  провери('нито една заявка към pl-otklik.* (файловете са влети)', з.заявкиOtklik === 0);

  // натиск по плочката на първата стая: мишка надолу → 140 ms → мащаб; горе → стаята се отваря
  // страницата превърта плавно (scroll-behavior: smooth) — мигновено превъртане и мерене СЛЕД него (иначе y беше 930 при 844)
  //   стаята: --staya „Жената в мен“ (по подразбиране; „Бременност“ при родено бебе няма премиум блок)
  const ПЛ = JSON.stringify(".pl-room[data-room=\"" + (арг.staya || 'Жената в мен') + "\"]");
  await изр("(document.querySelector(" + ПЛ + ") || document.querySelector('.pl-room')).scrollIntoView({ block: 'center', behavior: 'instant' })");
  await пауза(500);
  const р = JSON.parse(await изр("(() => { const e = document.querySelector(" + ПЛ + ") || document.querySelector('.pl-room'); const b = e.getBoundingClientRect(); return JSON.stringify({ x: b.left + b.width / 2, y: b.top + b.height / 2, стая: e.dataset.room }); })()"));
  // пробата мери себе си: какво наистина е под точката и какво е BL_FX
  console.log('точката: ' + JSON.stringify(р) + ' · екран ' + await изр("innerWidth + 'x' + innerHeight + ' · скрол ' + scrollY + ' · плочки ' + document.querySelectorAll('.pl-room').length + ' · видими ' + [...document.querySelectorAll('.pl-room')].filter(e => e.getClientRects().length).length"));
  console.log('под точката: ' + await изр(`(() => { const e = document.elementFromPoint(${р.x}, ${р.y}); const o = [...document.querySelectorAll('body > *')].filter(x => x.getClientRects().length && getComputedStyle(x).position === 'fixed' && parseInt(getComputedStyle(x).zIndex || 0) > 50).map(x => (x.id || x.className || x.tagName).toString().slice(0, 40)); return JSON.stringify({ е: e ? (e.className || e.tagName).toString().slice(0, 60) : null, вСтаята: !!(e && e.closest('.pl-room')), отгоре: o, fx: window.BL_FX ? Object.keys(BL_FX).join(',') : null, cheerИме: window.BL_FX && BL_FX.cheer ? (BL_FX.cheer.name || 'анон') + (BL_FX.cheer._plOtk ? '+otk' : '') : null }); })()`));
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: р.x, y: р.y });
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: р.x, y: р.y, button: 'left', clickCount: 1 });
  await пауза(160);
  const мащаб = await изр("getComputedStyle(document.querySelector(" + ПЛ + ") || document.querySelector('.pl-room')).scale");
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: р.x, y: р.y, button: 'left', clickCount: 1 });
  if (арг.reduce) провери('по-малко движение: без мащаб при натиск', мащаб === 'none' || мащаб === '1', 'scale=' + мащаб);
  else провери('натиск свива плочката', parseFloat(мащаб) < 1 && parseFloat(мащаб) >= 0.95, 'scale=' + мащаб + ' · стая „' + р.стая + '“');

  // стаята: вход по ред на премиум блока (класът живее 1 с)
  let вход = null;
  for (let i = 0; i < 40 && !вход; i++) {
    await пауза(50);
    вход = await изр("(() => { const б = document.querySelector('#roRoom > .pl-otk-vliza'); if (!б) return null; return JSON.stringify({ клас: б.className, деца: [...б.children].slice(0, 3).map(д => getComputedStyle(д).animationName + '@' + getComputedStyle(д).animationDelay) }); })()");
  }
  const отворена = await изр("(() => { const о = document.getElementById('roomOverlay'); return !!(о && !о.hidden && о.getClientRects().length); })()");
  провери('стаята се отвори', отворена);
  if (арг.reduce) провери('по-малко движение: без вход по ред', !вход, вход || 'няма клас');
  else провери('вход по ред в стаята', !!вход && /plOtkVliza/.test(вход), вход || 'класът не се появи до 2 с (стаята може да няма премиум блок)');
  await пауза(1300);
  провери('класът за влизане е махнат след ~1 с', !(await изр("!!document.querySelector('.pl-otk-vliza')")));

  // крайният кадър: нищо в стаята не стои под opacity .4 заради отклика
  const бледи = await изр("[...document.querySelectorAll('#roRoom *')].filter(e => e.getClientRects().length && parseFloat(getComputedStyle(e).opacity) < 0.4 && /plOtk/.test(getComputedStyle(e).animationName)).length");
  провери('нищо от отклика не е останало бледо', бледи === 0, 'бледи: ' + бледи);

  // искрите на дело: допир по бутон в стаята (само pointerdown — без щракване, нищо не се записва) → BL_FX.cheer
  const искри = await изр(`(async () => {
    const б = [...document.querySelectorAll('#roomOverlay button')].find(e => e.getClientRects().length && e.getBoundingClientRect().top > 60);
    if (!б) return JSON.stringify({ бутон: false });
    б.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0, pointerType: 'touch' }));
    document.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0, pointerType: 'touch' }));
    const преди = document.querySelectorAll('.fx-cheer').length;
    window.BL_FX.cheer('Записано ✓');
    await new Promise(r => setTimeout(r, 120));
    const р = { бутон: (б.className || б.textContent || '').toString().trim().slice(0, 30), банер: document.querySelectorAll('.fx-cheer').length > преди, слой: !!document.querySelector('.pl-otk-sloy'), частици: document.querySelectorAll('.pl-otk-sloy .pl-otk-i').length };
    await new Promise(r => setTimeout(r, 900));
    р.махнат = !document.querySelector('.pl-otk-sloy');
    return JSON.stringify(р);
  })()`);
  const и = JSON.parse(искри || '{}');
  if (арг.reduce) провери('по-малко движение: без искри', !и.частици, искри);
  else провери('искри от бутона при cheer (8) и слоят се маха', (!и.банер || (и.частици === 8 && и.махнат)) && и.бутон !== false, искри + (и.банер ? '' : ' · fx.js не показа банер (нощ/тежък ден) → искрите мълчат нарочно'));

  провери('0 JS грешки', грешки.length === 0, грешки.slice(0, 5).join(' | '));
  console.log(резултат.join('\n'));
  console.log(добре ? 'ОТКЛИКЪТ: всичко минава' : 'ОТКЛИКЪТ: има паднали');
  try { ws.close(); } catch (e) {} try { ch.kill(); } catch (e) {} await пауза(400); try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {}
  process.exit(добре ? 0 : 1);
})().catch(e => { console.log('🔴 ' + e.message); process.exit(3); });
