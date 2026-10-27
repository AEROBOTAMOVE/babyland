// 👆 НАТИСНИ ВСИЧКО (27.10.2026) — собственикът: „провери бутоните — всичко интерактивно ли е и работи ли на макс“.
// Засят профил → началото и деветте стаи (табът „Стаята“) → всеки видим, разрешен бутон се натиска (element.click()):
//   ЖИВ  = след натиска нещо стана (промяна в DOM / адрес / фокус / нов прозорец) до 450 ms;
//   МЪРТЪВ = нищо не стана; ГРЕШКА = изключение в прозореца на натиска; ТЕЖЪК = кадър над 150 ms (Long Animation Frames).
// Опасното се прескача (изтрий/нулирай/изход/обади/сподели/външни връзки). Диалозите (alert/confirm/prompt) се затварят.
// След всеки бутон стаята се връща (отворена, табът „Стаята“, без прозорци отгоре).
// ПУСКАНЕ: node dev/proba/butoni_proba.js [--port 8912] [--cpu 1] [--stai "Моето бебе,Здраве и SOS"] [--max 60]
const { spawn } = require('child_process'); const path = require('path'); const fs = require('fs');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; } }
const CPU = Number(арг.cpu || 1), МАКС = Number(арг.max || 60);
const ВСИЧКИ = ['Бременност', 'Моето бебе', 'Захранване', 'Здраве и SOS', 'Дневник на мама', 'Развитие и игри', 'Инструменти', 'Жената в мен', 'Лабораторията'];
const СТАИ = арг.stai ? арг.stai.split(',') : ВСИЧКИ;
const пауза = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await require('./slot.js')('chrome');
  const ПРОФИЛ = path.join(__dirname, 'chrome_pr_bt_' + Date.now()); const ПОРТ = 9200 + Math.floor(Math.random() * 700);
  const ch = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=390,844', 'about:blank'], { stdio: 'ignore' });
  let цел; for (let i = 0; i < 80 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + ПОРТ + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
  const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let n = 0; const ч = new Map(); let грешкиСега = [];
  const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  ws.onmessage = e => { const м = JSON.parse(e.data); if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); }
    if (м.method === 'Runtime.exceptionThrown') грешкиСега.push((м.params.exceptionDetails.exception && м.params.exceptionDetails.exception.description || м.params.exceptionDetails.text).split('\n').slice(0, 2).join(' ⟵ '));
    if (м.method === 'Page.javascriptDialogOpening') send('Page.handleJavaScriptDialog', { accept: false }); };
  const изр = async x => { const р = await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true }); if (р.result && р.result.exceptionDetails) return null; return р.result && р.result.result ? р.result.result.value : null; };
  const esc = async () => { await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }); await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }); };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  // външни прозорци и сваляния — не
  await send('Page.addScriptToEvaluateOnNewDocument', { source: 'window.open = function () { window.__otvoreni = (window.__otvoreni || 0) + 1; return null; };' });
  const АДР = 'http://localhost:' + (арг.port || 8912) + '/';
  await send('Page.navigate', { url: АДР + 'manifest.webmanifest' }); await пауза(700);
  await изр(`(() => { localStorage.clear(); const s = (k, v) => localStorage.setItem(k, JSON.stringify(v)); s('bl_onboarded', true); localStorage.setItem('bl_tour_done','1'); s('bl_hero_toured', true); s('bl_day1','2026-08-01'); s('bl_mama',{name:'Мария'}); s('bl_baby', { name: 'Алекс', birth: '2026-03-20', sex: 'boy' }); return 1; })()`);
  await send('Page.navigate', { url: АДР });
  for (let i = 0; i < 240; i++) { await пауза(250); try { if (await изр("!document.getElementById('blSplash') && !!document.querySelector('.pl-room')")) break; } catch (e) {} }
  await пауза(2000);
  for (let i = 0; i < 4 && await изр("!!document.querySelector('.md-veil.on')"); i++) { await esc(); await пауза(500); }
  if (CPU > 1) await send('Emulation.setCPUThrottlingRate', { rate: CPU });
  // наблюдатели в страницата: мутации и дълги кадри
  await изр(`(() => { window.__bt = { мут: 0, кадри: [] };
    new MutationObserver(с => { __bt.мут += с.length; }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, characterData: true });
    try { new PerformanceObserver(л => л.getEntries().forEach(е => { const с = (е.scripts || []).slice().sort((a, b) => b.duration - a.duration)[0];
      __bt.кадри.push({ т: е.startTime, д: е.duration, рис: Math.round(е.startTime + е.duration - е.renderStart), скр: с ? ((с.sourceURL || '').replace(/^.*\\/(?=[^/]+$)/, '').replace(/\\?v=\\d+/, '') + ' ' + (с.sourceFunctionName || с.invoker) + ' ' + Math.round(с.duration) + 'ms/нас.' + Math.round(с.forcedStyleAndLayoutDuration)) : '' }); })).observe({ type: 'long-animation-frame' }); } catch (e) {}
    return 1; })()`);

  const ОПАСНО = /изтрий|изтриване|изчисти|нулирай|нулиране|махни всичко|забрави|излез|изход|отпиши|обади|звънни|сподели|изпрати|експорт|свали|изтегли|резервно копие|възстанови|внеси|печат|принтирай|^112$|112\b|SOS|ПИН|ключалк|заключи/i;
  const ПРОЗОРЦИ = '.md-veil.on, #artOverlay:not([hidden]), #searchOverlay:not([hidden]), #sosOverlay:not([hidden]), .prof-overlay, .np-veil, #pinOverlay:not([hidden]), .br-overlay, #onbOverlay:not([hidden]), .bub-overlay, #plDv:not([hidden]), .pl-dv-on';
  const отчет = [];
  async function събериБутони(обхват) {
    return JSON.parse(await изр(`(() => { const к = ${JSON.stringify(обхват)} === 'начало' ? document.getElementById('plHome') : document.getElementById('roRoom');
      if (!к) return '[]';
      // 🪞 етикетите от предишната зона (напр. началото под панела) се махат — иначе [data-bt="N"] хващаше чужд бутон
      document.querySelectorAll('[data-bt]').forEach(х => х.removeAttribute('data-bt'));
      const видян = new Set(); const out = [];
      к.querySelectorAll('button, [role="button"], a[href], .jr-chip, input[type="checkbox"], summary').forEach((е, i) => {
        if (е.disabled || е.getAttribute('aria-disabled') === 'true') return;
        const р = е.getBoundingClientRect(); if (!р.width || !р.height) return;
        const cs = getComputedStyle(е); if (cs.visibility === 'hidden' || cs.pointerEvents === 'none' || parseFloat(cs.opacity) < .05) return;
        if (е.tagName === 'A' && /^(https?:|tel:|mailto:|sms:|viber:|whatsapp:)/i.test(е.getAttribute('href') || '') && !е.getAttribute('href').startsWith(location.origin)) return;
        if (е.target === '_blank' || е.hasAttribute('download')) return;
        const текст = ((е.getAttribute('aria-label') || е.textContent || е.title || '').trim().replace(/\\s+/g, ' ')).slice(0, 50);
        const клас = (typeof е.className === 'string' ? е.className : '').split(/\\s+/).filter(Boolean).slice(0, 2).join('.');
        const ключ = е.tagName + '|' + клас + '|' + текст;
        if (видян.has(ключ)) return; видян.add(ключ);
        е.setAttribute('data-bt', String(i));
        out.push({ id: String(i), ключ, текст, клас, таг: е.tagName.toLowerCase() });
      });
      return JSON.stringify(out); })()`) || '[]');
  }
  async function върниСтаята(стая) {
    for (let i = 0; i < 3 && await изр(`!!document.querySelector(${JSON.stringify(ПРОЗОРЦИ)})`); i++) { await esc(); await пауза(350); }
    // прозорци, които не слушат Escape — бутонът им за затваряне
    await изр(`(() => { document.querySelectorAll(${JSON.stringify(ПРОЗОРЦИ)}).forEach(п => { const б = п.querySelector('[aria-label*="Затвори"], .md-x, .md-close, .art-close, .search-close, .sos-close, .np-x, .br-close, button.x, .pl-dv-x'); if (б) б.click(); }); })()`);
    if (стая === 'начало') { if (await изр("!document.getElementById('roomOverlay').hidden")) { await изр('MamaHelper.close()'); await пауза(500); } await изр('scrollTo(0,0)'); return; }
    const добре = await изр(`(() => { const о = document.getElementById('roomOverlay'); return !о.hidden && document.getElementById('roTitle').textContent === ${JSON.stringify(стая)} && !document.getElementById('roRoom').hidden; })()`);
    if (!добре) await отвориЧисто(стая);
  }
  // затварянето има анимация и скрива панела ПО-КЪСНО — отваряне веднага след него се скриваше (пробата мери себе си)
  async function отвориЧисто(стая) {
    if (await изр("!document.getElementById('roomOverlay').hidden")) { await изр('MamaHelper.close()'); await пауза(700); }
    await изр(`(() => { MamaHelper.open(${JSON.stringify(стая)}); MamaHelper.showTab('room'); return 1; })()`); await пауза(1500);
  }
  for (const обхват of ['начало', ...СТАИ]) {
    if (обхват !== 'начало') await отвориЧисто(обхват);
    let бутони = await събериБутони(обхват);
    const общо = бутони.length; бутони = бутони.filter(б => !ОПАСНО.test(б.текст)); const прескочени = общо - бутони.length;
    if (бутони.length > МАКС) бутони = бутони.slice(0, МАКС);
    const рез = { обхват, общо, прескочени, натиснати: 0, живи: 0, мъртви: [], грешки: [], тежки: [], изчезнали: 0 };
    for (const б0 of бутони) {
      await върниСтаята(обхват);
      // стаята може да се е пре-рисувала (нови възли) — бутонът се намира наново по ключ (таг|клас|текст)
      let б = б0;
      if (!(await изр(`!!document.querySelector('[data-bt="${б0.id}"]')`))) { б = (await събериБутони(обхват)).find(x => x.ключ === б0.ключ); if (!б) { рез.изчезнали++; continue; } }
      грешкиСега = [];
      const преди = JSON.parse(await изр(`JSON.stringify({ м: __bt.мут, h: location.href, ф: document.activeElement && (document.activeElement.id || document.activeElement.className || document.activeElement.tagName), о: window.__otvoreni || 0, т: performance.now(), k: __bt.кадри.length })`));
      await изр(`(() => { const е = document.querySelector('[data-bt="${б.id}"]'); е.scrollIntoView({ block: 'center', behavior: 'instant' }); return 1; })()`);
      // 🪞 пробата мери себе си: мигновеният скок до бутона разкрива наведнъж куп карти (anim.js) — това НЕ е цената
      //   на натиска. Прозорецът за кадрите почва СЛЕД като превъртането улегне, точно преди натиска.
      await пауза(500);
      const т1 = await изр('performance.now()'); преди.т = т1; преди.k = await изр('__bt.кадри.length');
      const м0 = await изр('__bt.мут');
      await изр(`(() => { const е = document.querySelector('[data-bt="${б.id}"]'); if (е) е.click(); return 1; })()`);
      await пауза(450);
      const след = JSON.parse(await изр(`JSON.stringify({ м: __bt.мут, h: location.href, ф: document.activeElement && (document.activeElement.id || document.activeElement.className || document.activeElement.tagName), о: window.__otvoreni || 0, кадри: __bt.кадри.slice(${преди.k}).filter(к => к.т > ${преди.т}).map(к => Math.round(к.д)), защо: (__bt.кадри.slice(${преди.k}).filter(к => к.т > ${преди.т}).sort((a, b) => b.д - a.д)[0] || {}) })`));
      рез.натиснати++;
      const жив = (след.м - м0) > 0 || след.h !== преди.h || след.ф !== преди.ф || след.о > преди.о;
      if (жив) рез.живи++; else рез.мъртви.push(б.текст + ' [' + б.таг + (б.клас ? '.' + б.клас : '') + ']');
      if (грешкиСега.length) рез.грешки.push(б.текст + ' → ' + грешкиСега[0]);
      const макс = Math.max(0, ...след.кадри); if (макс > 150) рез.тежки.push(б.текст + ' ' + макс + 'ms (рисуване ' + (след.защо.рис || '?') + ' · ' + (след.защо.скр || 'без скрипт') + ')');
    }
    отчет.push(рез);
    console.log('══ ' + обхват + ': бутони ' + общо + ' · прескочени ' + прескочени + ' · изчезнали ' + рез.изчезнали + ' · натиснати ' + рез.натиснати + ' · живи ' + рез.живи + ' · мъртви ' + рез.мъртви.length + ' · грешки ' + рез.грешки.length + ' · тежки ' + рез.тежки.length);
    рез.мъртви.forEach(x => console.log('   💤 ' + x));
    рез.грешки.forEach(x => console.log('   🔴 ' + x));
    рез.тежки.forEach(x => console.log('   🐢 ' + x));
  }
  const с = отчет.reduce((а, р) => ({ н: а.н + р.натиснати, ж: а.ж + р.живи, м: а.м + р.мъртви.length, г: а.г + р.грешки.length, т: а.т + р.тежки.length }), { н: 0, ж: 0, м: 0, г: 0, т: 0 });
  console.log('\nОБЩО: натиснати ' + с.н + ' · живи ' + с.ж + ' · мъртви ' + с.м + ' · с грешка ' + с.г + ' · тежки ' + с.т);
  fs.writeFileSync(path.join(__dirname, 'snimki', 'butoni_otchet.json'), JSON.stringify(отчет, null, 1));
  try { ws.close(); } catch (e) {} try { ch.kill(); } catch (e) {} await пауза(400); try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {}
  process.exit(0);
})().catch(e => { console.log('🔴 ' + e.message + '\n' + e.stack); process.exit(3); });
