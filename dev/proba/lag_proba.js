// ⏱️ ЛАГЪТ ПРИ НАТИСК НА СТАЯ (24.10.2026) — собственикът: „усеща се лаг като се натискат стаите“.
// Мери онова, което пръстът усеща: от натиска до първия нарисуван кадър (Event Timing = INP на Chrome),
// дългите задачи и КОИ функции изяждат времето (профил на процесора около натиска).
// Засят профил (като letene.js), телефонна ширина, по подразбиране процесор ×4 (слаб телефон).
// ПУСКАНЕ: node dev/proba/lag_proba.js [--cpu 4] [--bez-otklik] [--stai "Жената в мен,Здраве и SOS,Моето бебе"] [--port 8912]
//   --bez-otklik: блокът „ОТКЛИКЪТ“ (pl-zhivo.js) не тръгва (window.BL_PL_OTKLIK е зает предварително) — за сравнение
const { spawn } = require('child_process'); const path = require('path'); const fs = require('fs');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; } }
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const CPU = Number(арг.cpu || 4);
const СТАИ = (арг.stai || 'Жената в мен,Здраве и SOS,Моето бебе').split(',');
const пауза = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await require('./slot.js')('chrome');
  const ПРОФИЛ = path.join(__dirname, 'chrome_pr_lag_' + Date.now()); const ПОРТ = 9200 + Math.floor(Math.random() * 700);
  const ch = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=390,844', 'about:blank'], { stdio: 'ignore' });
  let цел; for (let i = 0; i < 80 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + ПОРТ + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
  if (!цел) { console.log('🔴 Chrome не тръгна'); process.exit(3); }
  const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let n = 0; const ч = new Map(); const грешки = [];
  const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  ws.onmessage = e => { const м = JSON.parse(e.data); if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); } if (м.method === 'Runtime.exceptionThrown') грешки.push((м.params.exceptionDetails.exception && м.params.exceptionDetails.exception.description || м.params.exceptionDetails.text).split('\n')[0]); };
  const изр = async x => { const р = await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true }); return р.result && р.result.result ? р.result.result.value : null; };
  await send('Page.enable'); await send('Runtime.enable'); await send('Profiler.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  // --bez-cv: изключва content-visibility на началото при отворена стая (touch.css) — за разделяне на причините
  if (арг['bez-cv']) await send('Page.addScriptToEvaluateOnNewDocument', { source: "document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = 'html.ro-otvorena body > * { content-visibility: visible !important; }'; document.head.appendChild(s); });" });
  if (арг['bez-otklik']) await send('Page.addScriptToEvaluateOnNewDocument', { source: 'window.BL_PL_OTKLIK = { изключен: true };' });
  const АДР = 'http://localhost:' + (арг.port || 8912) + '/';
  await send('Page.navigate', { url: АДР + 'manifest.webmanifest' }); await пауза(700);
  await изр(`(() => { localStorage.clear(); const s = (k, v) => localStorage.setItem(k, JSON.stringify(v)); s('bl_onboarded', true); localStorage.setItem('bl_tour_done','1'); s('bl_hero_toured', true); s('bl_day1','2026-08-01'); s('bl_mama',{name:'Мария'}); s('bl_baby', { name: 'Алекс', birth: '2026-03-20', sex: 'boy' }); localStorage.setItem('bl_theme','light'); return 1; })()`);
  await send('Page.navigate', { url: АДР });
  for (let i = 0; i < 240; i++) { await пауза(250); try { if (await изр("!document.getElementById('blSplash') && !!document.querySelector('.pl-room')")) break; } catch (e) {} }
  await пауза(1500);
  for (let i = 0; i < 4 && await изр("!!document.querySelector('.md-veil.on')"); i++) { await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }); await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }); await пауза(500); }
  await send('Emulation.setCPUThrottlingRate', { rate: CPU });
  await пауза(1500);
  console.log('процесор ×' + CPU + (арг['bez-otklik'] ? ' · БЕЗ отклика' : ' · с отклика'));
  const общо = {};
  for (const стая of СТАИ) {
    const ПЛ = JSON.stringify('.pl-room[data-room="' + стая + '"]');
    if (!(await изр('!!document.querySelector(' + ПЛ + ')'))) { console.log('— няма плочка „' + стая + '“'); continue; }
    await изр('document.querySelector(' + ПЛ + ').scrollIntoView({ block: "center", behavior: "instant" })'); await пауза(700);
    const р = JSON.parse(await изр('(() => { const b = document.querySelector(' + ПЛ + ').getBoundingClientRect(); return JSON.stringify({ x: b.left + b.width / 2, y: b.top + b.height / 2 }); })()'));
    // наблюдатели: Event Timing (натиск → кадър), дълги задачи, и кога стаята е видима
    await изр(`(() => { window.__lag = { събития: [], дълги: [], видимаПри: 0, т0: 0 };
      try { new PerformanceObserver(л => л.getEntries().forEach(е => __lag.събития.push({ име: е.name, старт: е.startTime, общо: е.duration, чакане: е.processingStart - е.startTime, работа: е.processingEnd - е.processingStart, рисуване: е.startTime + е.duration - е.processingEnd }))).observe({ type: 'event', durationThreshold: 16, buffered: false }); } catch (e) {}
      try { new PerformanceObserver(л => л.getEntries().forEach(е => __lag.дълги.push({ старт: е.startTime, общо: е.duration }))).observe({ type: 'longtask', buffered: false }); } catch (e) {}
      // Long Animation Frames: кой скрипт, кой го е извикал и колко от времето е НАСИЛЕНО подреждане
      __lag.кадри = [];
      try { new PerformanceObserver(л => л.getEntries().forEach(е => __lag.кадри.push({ старт: е.startTime, общо: е.duration, рисуванеОт: е.renderStart, стилОт: е.styleAndLayoutStart, скриптове: (е.scripts || []).map(с => ({ кой: с.invoker, вид: с.invokerType, файл: (с.sourceURL || '').replace(/^.*\\/(?=[^/]+$)/, '').replace(/\\?v=\\d+/, ''), фн: с.sourceFunctionName, от: с.startTime, общо: с.duration, насилено: с.forcedStyleAndLayoutDuration })) }))).observe({ type: 'long-animation-frame', buffered: false }); } catch (e) { __lag.безLoAF = String(e); }
      // съдържанието: първият кадър, в който стаята има истински деца (не само скелета)
      document.addEventListener('pointerdown', () => { const т = performance.now(); (function гледайС() { const р = document.getElementById('roRoom'); if (р && !р.hidden && р.querySelector(':scope > :not(.ro-skel):not(.rmx-aurora)')) { requestAnimationFrame(() => { __lag.съдържаниеПри = performance.now() - т; }); return; } if (performance.now() - т < 6000) requestAnimationFrame(гледайС); })(); }, { capture: true, once: true });
      document.addEventListener('pointerdown', () => { __lag.т0 = performance.now(); (function гледай() { const о = document.getElementById('roomOverlay'); if (о && !о.hidden && о.getClientRects().length && getComputedStyle(о).visibility !== 'hidden') { requestAnimationFrame(() => { __lag.видимаПри = performance.now() - __lag.т0; }); return; } if (performance.now() - __lag.т0 < 5000) requestAnimationFrame(гледай); })(); }, { capture: true, once: true });
      return 1; })()`);
    // --bez-profil: без профилатора (той сам бави при ×4) — за честно сравнение на времената А/Б
    const ПРОФИЛ_ДА = !арг['bez-profil'];
    if (ПРОФИЛ_ДА) { await send('Profiler.setSamplingInterval', { interval: 200 }); await send('Profiler.start'); }
    const скролПреди = await изр("scrollY + '/' + document.documentElement.scrollHeight");
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: р.x, y: р.y });
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: р.x, y: р.y, button: 'left', clickCount: 1 });
    await пауза(90);
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: р.x, y: р.y, button: 'left', clickCount: 1 });
    await пауза(2500);
    const скролОтворена = await изр("scrollY + '/' + document.documentElement.scrollHeight");
    const проф = ПРОФИЛ_ДА ? (await send('Profiler.stop')).result.profile : { nodes: [], samples: [], timeDeltas: [] };
    const лаг = JSON.parse(await изр('JSON.stringify(window.__lag)'));
    // собствено време по функция (без idle/program/GC) — къде отиват милисекундите
    const собств = new Map(); const поВъзел = new Map(проф.nodes.map(в => [в.id, в]));
    const инт = проф.timeDeltas; const броя = new Map(); проф.samples.forEach((s, i) => броя.set(s, (броя.get(s) || 0) + (инт[i] || 0)));
    for (const [id, мкс] of броя) { const в = поВъзел.get(id); const cf = в.callFrame; const име = (cf.functionName || '(анонимна)') + ' · ' + (cf.url ? cf.url.replace(/^.*\/(?=[^/]+$)/, '').replace(/\?v=\d+/, '') + ':' + (cf.lineNumber + 1) : cf.url === '' ? '(' + (cf.functionName || 'вътрешно') + ')' : ''); if (/^\((idle|program|garbage collector)\)/.test(cf.functionName)) { собств.set(cf.functionName, (собств.get(cf.functionName) || 0) + мкс); continue; } собств.set(име, (собств.get(име) || 0) + мкс); }
    const горни = [...собств.entries()].filter(([к]) => !/^\(idle\)/.test(к)).sort((a, b) => b[1] - a[1]).slice(0, 14);
    // по файл
    const поФайл = new Map(); for (const [к, мкс] of собств) { const ф = (к.split(' · ')[1] || к).replace(/:\d+$/, ''); поФайл.set(ф, (поФайл.get(ф) || 0) + мкс); }
    const файлове = [...поФайл.entries()].filter(([к]) => !/idle/.test(к)).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const клик = лаг.събития.filter(е => /pointer|click|mouse/.test(е.име)).sort((a, b) => b.общо - a.общо);
    const дълги = лаг.дълги.filter(д => д.старт >= лаг.т0 - 5);
    console.log('\n══ „' + стая + '“ ══');
    console.log('  стаята видима след: ' + Math.round(лаг.видимаПри) + ' ms от натиска');
    console.log('  най-бавно събитие: ' + (клик[0] ? клик[0].име + ' ' + Math.round(клик[0].общо) + ' ms (чакане ' + Math.round(клик[0].чакане) + ' · работа ' + Math.round(клик[0].работа) + ' · до кадъра ' + Math.round(клик[0].рисуване) + ')' : 'няма над 16 ms'));
    console.log('  всички събития: ' + клик.map(е => е.име + ' ' + Math.round(е.общо)).join(' · '));
    console.log('  дълги задачи: ' + дълги.length + ' · ' + дълги.map(д => Math.round(д.общо)).join(', ') + ' ms');
    console.log('  по файл (ms процесор): ' + файлове.map(([к, м]) => к + ' ' + Math.round(м / 1000)).join(' · '));
    console.log('  най-тежките функции:'); горни.forEach(([к, м]) => console.log('    ' + String(Math.round(м / 1000)).padStart(5) + ' ms  ' + к));
    // ВРЕМЕВА ЛИНИЯ: всяка проба → входната точка (най-долната кадрирана JS функция с адрес) → поредни отсечки
    const родител = new Map(); проф.nodes.forEach(в => (в.children || []).forEach(д => родител.set(д, в.id)));
    const вход = id => { let най = null, в = id; while (в != null) { const у = поВъзел.get(в); if (!у) break; if (у.callFrame.url) най = у; в = родител.get(в); } if (!най) { const у = поВъзел.get(id); return у ? '(' + (у.callFrame.functionName || '?') + ')' : '?'; } return (най.callFrame.functionName || 'анонимна') + ' · ' + най.callFrame.url.replace(/^.*\/(?=[^/]+$)/, '').replace(/\?v=\d+/, '') + ':' + (най.callFrame.lineNumber + 1); };
    let т = 0; const отсечки = [];
    проф.samples.forEach((s, i) => { т += (инт[i] || 0); const в = вход(s); if (/^\((idle|program)\)$/.test(в)) { if (в === '(program)') { const п = отсечки[отсечки.length - 1]; if (п && т / 1000 - п.край < 3) п.край = т / 1000; } return; } const п = отсечки[отсечки.length - 1]; if (п && п.в === в && т / 1000 - п.край < 3) п.край = т / 1000; else отсечки.push({ в, от: т / 1000, край: т / 1000 }); });
    // КОЙ ВИКА скъпите вградени функции (насиленото подреждане се плаща от първия, който чете)
    const вградени = /^(getBoundingClientRect|getAnimations|getBBox|focus|getComputedStyle|scrollIntoView|getClientRects|querySelectorAll)$/;
    const викащи = new Map();
    for (const [id, мкс] of броя) { const в = поВъзел.get(id); if (!в || в.callFrame.url || !вградени.test(в.callFrame.functionName)) continue; const р = поВъзел.get(родител.get(id)); const кой = р ? (р.callFrame.functionName || 'анонимна') + ' · ' + (р.callFrame.url || '').replace(/^.*\/(?=[^/]+$)/, '').replace(/\?v=\d+/, '') + ':' + (р.callFrame.lineNumber + 1) : '?'; const к = в.callFrame.functionName + ' ← ' + кой; викащи.set(к, (викащи.get(к) || 0) + мкс); }
    console.log('  КОЙ ВИКА (≥ 15 ms):'); [...викащи.entries()].sort((a, b) => b[1] - a[1]).filter(([, м]) => м >= 15000).slice(0, 14).forEach(([к, м]) => console.log('    ' + String(Math.round(м / 1000)).padStart(5) + ' ms  ' + к));
    // кадрите след натиска (Long Animation Frames) — до първия кадър със стаята и малко след него
    if (лаг.безLoAF) console.log('  LoAF няма: ' + лаг.безLoAF);
    console.log('  КАДРИ след натиска (ms от натиска · скриптове ≥ 8 ms · „насилено“ = принудително стил/подреждане):');
    (лаг.кадри || []).filter(к => к.старт + к.общо >= лаг.т0).slice(0, 8).forEach(к => {
      console.log('    кадър ' + Math.round(к.старт - лаг.т0) + '…' + Math.round(к.старт + к.общо - лаг.т0) + ' (' + Math.round(к.общо) + ' ms; рисуване от ' + Math.round(к.рисуванеОт - лаг.т0) + ', стил/подр. от ' + Math.round(к.стилОт - лаг.т0) + ')');
      к.скриптове.filter(с => с.общо >= (арг.vsichki ? 0.5 : 8)).forEach(с => console.log('      ' + String(Math.round(с.общо)).padStart(5) + ' ms (насилено ' + Math.round(с.насилено) + ')  ' + с.вид + ' · ' + с.кой + ' → ' + (с.фн || '?') + ' @ ' + с.файл));
    });
    // кадърът, в който стаята е нарисувана за първи път: краят на дългия кадър с натиска (Long Animation Frames)
    const кНат = (лаг.кадри || []).find(к => к.скриптове.some(с => /onclick/.test(с.кой || '')));
    const първиКадър = кНат ? Math.round(кНат.старт + кНат.общо - лаг.т0) : Math.round(лаг.видимаПри);
    // затваряне: бутонът ✕, до първия кадър без стаята
    const затваряне = await изр(`(async () => { const б = document.getElementById('roClose'); if (!б) return -1; const т = performance.now(); б.click();
      for (let i = 0; i < 300; i++) { const о = document.getElementById('roomOverlay'); if (!о || о.hidden || !о.getClientRects().length) break; await new Promise(r => requestAnimationFrame(r)); }
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); return Math.round(performance.now() - т); })()`);
    await пауза(900);
    const скролСлед = await изр("scrollY + '/' + document.documentElement.scrollHeight");
    console.log('  панел видим (рисуван) след: ' + Math.round(лаг.видимаПри) + ' ms · съдържание след: ' + Math.round(лаг.съдържаниеПри || -1) + ' ms');
    console.log('  първи кадър със стаята: ' + първиКадър + ' ms · затваряне: ' + затваряне + ' ms · превъртане преди/отворена/след: ' + скролПреди + ' · ' + скролОтворена + ' · ' + скролСлед);
    общо[стая] = { панел: Math.round(лаг.видимаПри), съдържание: Math.round(лаг.съдържаниеПри || -1), кадър: първиКадър, клик: клик[0] ? Math.round(клик[0].общо) : 0, затваряне, скролЗапазен: скролПреди.split('/')[0] === скролСлед.split('/')[0] };
    if (await изр("(() => { const о = document.getElementById('roomOverlay'); return !!(о && !о.hidden && о.getClientRects().length); })()")) { await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }); await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }); await пауза(1200); }
  }
  console.log('\nОБОБЩЕНИЕ ' + JSON.stringify(общо) + (грешки.length ? ' · JS грешки: ' + грешки.slice(0, 3).join(' | ') : ' · 0 JS грешки'));
  try { ws.close(); } catch (e) {} try { ch.kill(); } catch (e) {} await пауза(400); try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {}
  process.exit(0);
})().catch(e => { console.log('🔴 ' + e.message); process.exit(3); });
