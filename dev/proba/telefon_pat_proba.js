// 📱 „КАТО НА ИСТИНСКИ ТЕЛЕФОН“ (17.11.2026) — целият път на нов човек на живия сайт:
// 360 px · CPU ×4 · бавна 4G (562,5 ms, 180 000 B/s ↓, 84 375 B/s ↑) · истински натискания (мишка в средата на елемента,
// с проверка дали нещо друго не го покрива) · „назад“ на телефона = history.back().
// Път: зареждане → обиколка („пропусни“) → ВРАТАТА → [вход: /api/* подменен с 200 САМО в браузъра на пробата —
// без профил, без парола] → запознаване (име + дата → Запази) → начало → всяка стая (и назад) → търсене (и назад)
// → статия от „Здраве и SOS“ (назад, назад) → СОС (назад).
// После: Лабораторията → чат → ➤ с няколко изречения (старият запис „promise reading 'slice'“).
// После ОФЛАЙН: мрежата пуска, изчаква предварителния кеш на SW (kb.js), спира мрежата, презарежда →
// отваря ли се, търсене, „бебето не диша“ в търсенето, СОС със 112.
// Всичко >3 s е 🟠. Грешки: Runtime.exceptionThrown (и „in promise“), console.error, Log (мрежа).
// ПУСКАНЕ: node dev/proba/telefon_pat_proba.js [--url https://babyland.aaeromove.workers.dev] [--bez-oflain]
const { spawn } = require('child_process'); const path = require('path'); const fs = require('fs');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; } }
const БАЗА = (арг.url || 'https://babyland.aaeromove.workers.dev').replace(/\/?$/, '/'), АДРЕС = БАЗА + 'index.html';
const пауза = ms => new Promise(r => setTimeout(r, ms));
const МРЕЖА = { offline: false, latency: 562.5, downloadThroughput: 180000, uploadThroughput: 84375 };
(async () => {
  await require('./slot.js')('chrome');
  const ПРОФИЛ = path.join(__dirname, 'chrome_pr_tel_' + Date.now()); const ПОРТ = 9200 + Math.floor(Math.random() * 700);
  const ch = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=' + (process.env.BL_PROZOREC || '360,800')].concat((process.env.BL_CHROME_FLAGS || '').split(' ').filter(Boolean), ['about:blank']), { stdio: 'ignore' });
  const край = к => { try { ch.kill(); } catch (e) {} setTimeout(() => { try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {} process.exit(к); }, 1500); };
  let цел; for (let i = 0; i < 80 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + ПОРТ + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
  if (!цел) { console.log('🔴 Chrome не тръгна'); return край(3); }
  const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let n = 0; const ч = new Map(); const грешки = []; let етап = 'зареждане'; let апи = 'мине';
  const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  const b64 = о => Buffer.from(JSON.stringify(о)).toString('base64');
  ws.onmessage = e => { const м = JSON.parse(e.data); if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); }
    if (м.method === 'Runtime.exceptionThrown') { const d = м.params.exceptionDetails; const кд = d.stackTrace && d.stackTrace.callFrames && d.stackTrace.callFrames[0];
      грешки.push('[' + етап + '] ИЗКЛЮЧЕНИЕ ' + ((d.exception && d.exception.description) || d.text).split('\n')[0] + (кд ? ' @ ' + (кд.functionName || '?') + ' ' + кд.url.split('/').pop().split('?')[0] + ':' + (кд.lineNumber + 1) : '')); }
    if (м.method === 'Runtime.consoleAPICalled' && м.params.type === 'error') грешки.push('[' + етап + '] console.error ' + м.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 200));
    if (м.method === 'Log.entryAdded' && м.params.entry.level === 'error') грешки.push('[' + етап + '] ' + м.params.entry.source + ': ' + м.params.entry.text.slice(0, 160) + (м.params.entry.url ? ' ' + м.params.entry.url.split('/').slice(-2).join('/') : ''));
    if (м.method === 'Fetch.requestPaused') { const id = м.params.requestId;
      if (апи === '200') send('Fetch.fulfillRequest', { requestId: id, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'application/json; charset=utf-8' }, { name: 'Cache-Control', value: 'no-store' }], body: b64({ user: { email: 'proba@example.test', status: 'active', access_until: new Date(Date.now() + 14 * 864e5).toISOString(), proben: true, admin: false } }) });
      else send('Fetch.continueRequest', { requestId: id }); } };
  const изр = async x => { const р = await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true }); return р.result && р.result.result ? р.result.result.value : null; };
  const чакай = async (x, ms) => { const t = Date.now(); while (Date.now() - t < ms) { if (await изр(x)) return Date.now() - t; await пауза(120); } return -1; };
  // истинско натискане: средата на елемента; проверява дали отгоре е той (или негов наследник)
  const тапни = async сел => {
    const к = await изр(`(() => { const e = document.querySelector(${JSON.stringify(сел)}); if (!e) return { няма: 1 }; e.scrollIntoView({ block: 'center', behavior: 'instant' }); return new Promise(ок => requestAnimationFrame(() => requestAnimationFrame(() => { const r = e.getBoundingClientRect();
      if (!r.width || !r.height) return ок({ невидим: 1 }); const x = r.left + r.width / 2, y = r.top + r.height / 2; const горе = document.elementFromPoint(x, y);
      ок({ x, y, покрит: !!(горе && горе !== e && !e.contains(горе)) ? (горе.id ? '#' + горе.id : горе.className && String(горе.className).slice(0, 40) || горе.tagName) : null }); }))); })()`);
    if (!к || к.няма || к.невидим) return к || { няма: 1 };
    await пауза(150);
    for (const type of ['mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x: к.x, y: к.y, button: 'left', clickCount: 1 });
    return к;
  };
  const назад = async () => { await изр('history.back(); 1'); };
  // 18.11: стойност + 'input' направо в полето — Input.insertText отиваше в друг фокусиран елемент след облеклото на търсенето
  const пиши = async (сел, текст) => { await изр(`(() => { const e = document.querySelector(${JSON.stringify(сел)}); if (!e) return 0; e.focus(); e.value = ${JSON.stringify(текст)}; e.dispatchEvent(new Event('input', { bubbles: true })); return 1; })()`); };
  const рез = []; let червени = 0, бавни = 0;
  const пр = (и, у, ms, д) => { const бав = у && ms > 3000; console.log((у ? (бав ? '🟠 ' : '✅ ') : '🔴 ') + и + (ms >= 0 ? ' · ' + ms + ' ms' : '') + (д ? ' · ' + д : '')); рез.push((у ? (бав ? '🟠 ' : '✅ ') : '🔴 ') + и + (ms >= 0 ? ' · ' + ms + ' ms' : '') + (д ? ' · ' + д : '')); if (!у) червени++; if (бав) бавни++; };
  const махниМедали = async () => { let к = 0; for (let i = 0; i < 6 && await изр("!!document.querySelector('.md-veil.on, .md-veil')"); i++) { await изр("(document.querySelector('.md-veil .md-ok') || { click() {} }).click(); 1"); к++; await пауза(700); } return к; };
  await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable'); await send('Log.enable');
  // 18.11: --desktop = компютър 1440×900, мишка, без забавяне на процесора/мрежата
  if (арг.desktop) { await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }); }
  else {
    await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 800, deviceScaleFactor: 2, mobile: true });
    await send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await send('Network.emulateNetworkConditions', МРЕЖА);
  }

  // ── 1 · зареждане → обиколка → врата ──
  // 18.11: стек на необработените отказа (Runtime.exceptionThrown дава само текста им)
  await send('Page.addScriptToEvaluateOnNewDocument', { source: "window.__откази = []; addEventListener('unhandledrejection', e => { try { const r = e.reason; __откази.push(String(r && r.stack || r).slice(0, 600)); } catch (x) {} });" });
  const t0 = Date.now(); await send('Page.navigate', { url: АДРЕС });
  { let последно = ''; const хрон = []; const край0 = Date.now() + 120000;
    while (Date.now() < край0) { const с = await изр("JSON.stringify({ rs: document.readyState, dostap: !!window.BL_DOSTAP, splash: !!document.getElementById('blSplash'), kb: !!window.KB, скриптове: performance.getEntriesByType('resource').filter(r => /\\.js/.test(r.name)).length })");
      if (с && с !== последно) { хрон.push(((Date.now() - t0) / 1000).toFixed(1) + ' s ' + с); последно = с; }
      if (с && /"splash":false/.test(с) && /"dostap":true/.test(с) && !/"rs":"loading"/.test(с)) break; await пауза(1000); }
    console.log('ХРОНОЛОГИЯ НА СТАРТА:\n  ' + хрон.join('\n  ')); }
  const тНач = await чакай("document.readyState !== 'loading' && !document.getElementById('blSplash') && !!window.BL_DOSTAP", 90000);
  пр('началото (без стартовия екран)', тНач >= 0, Date.now() - t0, 'версия ' + await изр("(document.querySelector('script[src*=\"helper.js\"]') || {}).getAttribute && document.querySelector('script[src*=\"helper.js\"]').getAttribute('src')"));
  етап = 'обиколка';
  const тТур = await чакай("!!document.querySelector('.tour-ov')", 15000);
  if (тТур >= 0) { const т = await тапни('.tour-ov .tour-skip'); пр('обиколката излиза → „пропусни“', !т.покрит && !т.няма, тТур, т.покрит ? 'ПОКРИТ от ' + т.покрит : ''); } else пр('обиколката излиза', false, -1, 'няма .tour-ov за 15 s');
  етап = 'врата';
  const тВр = await чакай("BL_DOSTAP.състояние().видим", 30000);
  const св = JSON.parse(await изр("JSON.stringify(BL_DOSTAP.състояние())") || '{}');
  const апиЖ = await изр("fetch('/api/me', { credentials: 'same-origin', cache: 'no-store' }).then(r => r.status).catch(e => 'ГРЕШКА ' + e.message)");
  const нав = await изр("(() => { const n = performance.getEntriesByType('navigation')[0] || {}; const kb = performance.getEntriesByType('resource').find(r => /kb\.js/.test(r.name)); const me = performance.getEntriesByType('resource').filter(r => /api\/me/.test(r.name)).map(r => Math.round(r.startTime) + '→' + Math.round(r.responseEnd)); return 'DCL ' + Math.round(n.domContentLoadedEventEnd || 0) + ' · load ' + Math.round(n.loadEventEnd || 0) + ' · kb.js край ' + (kb ? Math.round(kb.responseEnd) : '-') + ' · /api/me ' + me.join(','); })()");
  пр('вратата за достъп', тВр >= 0, тВр, нав + ' · /api/me сега: ' + апиЖ + ' ·', 'режим ' + св.режим + ' · запознаване отдолу: ' + await изр("!document.getElementById('onbOverlay').hidden"));
  await send('Fetch.enable', { patterns: [{ urlPattern: '*/api/*', requestStage: 'Request' }] });   // чак тук: първото /api/me е истинско
  апи = '200'; const tВх = Date.now(); await изр('BL_DOSTAP.провери().then(() => 1)');
  const тСкр = await чакай("!BL_DOSTAP.състояние().видим", 15000);
  пр('„вход“ (подменен /api/me 200) → вратата се скрива', тСкр >= 0, Date.now() - tВх);
  // ── запознаване ──
  етап = 'запознаване';
  const тОнб = await чакай("!document.getElementById('onbOverlay').hidden", 10000);
  пр('запознаването след вратата', тОнб >= 0, тОнб);
  if (тОнб >= 0) {
    await пиши('#onbName', 'Алекс');
    await изр(`(() => { const d = document.getElementById('onbDate'); d.value = '2026-07-19'; d.dispatchEvent(new Event('input', { bubbles: true })); d.dispatchEvent(new Event('change', { bubbles: true })); return 1; })()`);
    const т = await тапни('#onbSave'); const tС = Date.now();
    const тЗ = await чакай("document.getElementById('onbOverlay').hidden", 8000);
    пр('запознаването → „Запази“ затваря и пази бебето', тЗ >= 0 && !т.покрит, Date.now() - tС, (т.покрит ? 'ПОКРИТ от ' + т.покрит + ' · ' : '') + 'bl_baby=' + await изр("localStorage.getItem('bl_baby')"));
  }
  етап = 'начало'; await пауза(1500); const мед0 = await махниМедали();
  const стаи = JSON.parse(await изр("JSON.stringify([...document.querySelectorAll('.pl-room[data-room]')].map(e => e.dataset.room))") || '[]');
  пр('началото: стаи', стаи.length >= 9, -1, стаи.length + ' · медальончета махнати ' + мед0);
  // ── 2 · всяка стая и „назад“ ──
  const ОТВ = "!document.getElementById('roomOverlay').hidden && document.getElementById('roRoom').querySelectorAll(':scope > :not(.ro-skel)').length > 2";
  for (const с of стаи) {
    етап = 'стая ' + с;
    const т = await тапни(`.pl-room[data-room="${с}"]`); const tС = Date.now();
    const тО = await чакай(ОТВ, 20000); const мс = тО >= 0 ? Date.now() - tС : -1;
    await пауза(600); const мед = await махниМедали();
    // стаята не се отвори → „назад“ би излязло от приложението; казваме какво има там и продължаваме
    if (await изр("document.getElementById('roomOverlay').hidden")) { пр('стая „' + с + '“ отваря', false, -1, 'не се отвори за 20 s · натиснато: ' + JSON.stringify(т) + ' · отгоре сега: ' + await изр("(() => { const e = document.elementFromPoint(180, 400); return e ? (e.id || String(e.className).slice(0, 50) || e.tagName) : '-'; })()")); continue; }
    await назад(); const тЗ = await чакай("document.getElementById('roomOverlay').hidden", 5000);
    const къде = await изр('location.href');
    пр('стая „' + с + '“ отваря · назад затваря', тО >= 0 && тЗ >= 0 && /index\.html|\/$/.test(къде) && !т.покрит, мс, (т.покрит ? 'ПОКРИТ от ' + т.покрит + ' · ' : '') + 'назад ' + тЗ + ' ms' + (мед ? ' · медальончета ' + мед : '') + (/about:blank/.test(къде) ? ' · ИЗЛЕЗЕ ' + къде : ''));
  }
  // ── 3 · търсене ──
  етап = 'търсене';
  { const т = await тапни('[data-pl="find"]'); const тО = await чакай("!document.getElementById('searchOverlay').hidden", 5000);
    await пиши('#searchInput', 'температура'); await изр("document.getElementById('searchInput').dispatchEvent(new Event('input', { bubbles: true })); 1"); const tТ = Date.now();
    const тР = await чакай("(document.getElementById('searchResults').textContent || '').length > 40 && !/Секунда — зареждам/.test(document.getElementById('searchResults').textContent)", 10000);
    const брой = await изр("document.getElementById('searchResults').querySelectorAll('button, a, .sf-answer').length");
    await назад(); const тЗ = await чакай("document.getElementById('searchOverlay').hidden", 5000);
    пр('търсене „температура“ (отваряне → резултати → назад)', тО >= 0 && тР >= 0 && тЗ >= 0 && !т.покрит, тР >= 0 ? Date.now() - tТ - (тЗ >= 0 ? тЗ : 0) : -1, 'отваряне ' + тО + ' ms · елементи ' + брой + ' · назад ' + тЗ + ' ms' + (т.покрит ? ' · ПОКРИТ от ' + т.покрит : '')); }
  // ── 4 · статия от „Здраве и SOS“ ──
  етап = 'статия';
  { await тапни('.pl-room[data-room="Здраве и SOS"]'); await чакай(ОТВ, 20000); await пауза(500); await махниМедали();
    const т1 = await тапни('#roTabs [data-tab="articles"]'); const тЛ = await чакай("document.getElementById('roArticles').querySelectorAll('.art-card').length > 0", 8000);
    // 18.11: самата карта на статията (articles.js renderList → button.art-card), не филтрите/звездичките
    const сел = await изр("(() => { const к = document.getElementById('roArticles'); const e = [...к.querySelectorAll('.art-card')].find(x => x.offsetParent); if (!e) return null; e.setAttribute('data-proba-art', '1'); return '[data-proba-art]'; })()");
    let тА = -1, дълж = 0, т2 = {};
    if (сел) { т2 = await тапни(сел); const tА = Date.now(); тА = await чакай("!document.getElementById('artOverlay').hidden && (document.getElementById('artBody').textContent || '').length > 200 && !/Разгръщам страницата/.test(document.getElementById('artBody').textContent)", 15000); if (тА >= 0) тА = Date.now() - tА; дълж = await изр("(document.getElementById('artBody').textContent || '').length"); }
    await назад(); const тЗ1 = await чакай("document.getElementById('artOverlay').hidden && !document.getElementById('roomOverlay').hidden", 5000);
    await назад(); const тЗ2 = await чакай("document.getElementById('roomOverlay').hidden", 5000);
    пр('статия (стая → „Статии“ → първата → назад → назад)', тЛ >= 0 && тА >= 0 && тЗ1 >= 0 && тЗ2 >= 0 && !т1.покрит && !т2.покрит, тА, 'списък ' + тЛ + ' ms · тяло ' + дълж + ' знака · назад1 ' + тЗ1 + ' · назад2 ' + тЗ2 + (т1.покрит || т2.покрит ? ' · ПОКРИТ ' + (т1.покрит || т2.покрит) : '') + (сел ? '' : ' · няма статия в списъка')); }
  // ── 5 · СОС ──
  етап = 'СОС';
  { const сел = await изр("(() => { const e = [...document.querySelectorAll('.bn-sos, .btn-sos, .cta-sos')].find(x => x.offsetParent); if (!e) return null; e.setAttribute('data-proba-sos', '1'); return '[data-proba-sos]'; })()");
    const т = сел ? await тапни(сел) : { няма: 1 }; const tС = Date.now();
    const тО = await чакай("(() => { const о = document.getElementById('sosOverlay'); return !!(о && !о.hidden && о.getClientRects().length); })()", 5000);
    const тел = await изр("document.querySelectorAll('#sosOverlay a[href^=\"tel:\"]').length");
    await назад(); const тЗ = await чакай("(() => { const о = document.getElementById('sosOverlay'); return !о || о.hidden || !о.getClientRects().length; })()", 5000);
    пр('СОС от началото → назад', !!сел && тО >= 0 && тЗ >= 0 && !т.покрит, тО >= 0 ? Date.now() - tС - Math.max(0, тЗ) : -1, 'бутон ' + (сел ? 'да' : 'НЯМА') + ' · tel: връзки ' + тел + ' · назад ' + тЗ + ' ms' + (т.покрит ? ' · ПОКРИТ от ' + т.покрит : '')); }
  пр('след всичко: още в приложението', /babyland|127\.0\.0\.1/.test(await изр('location.href')), -1, await изр('location.href'));
  // ── 6 · Лабораторията: ➤ в чата ──
  етап = 'Лаб ➤';
  { const пред = грешки.length;
    await тапни('.pl-room[data-room="Лабораторията"]'); await чакай(ОТВ, 20000); await пауза(500); await махниМедали();
    await тапни('#roTabs [data-tab="chat"]'); await пауза(800);
    const изреч = ['Как се прави опит?', 'Защо 7 вечери?', 'Кое НЕ се проверява?', 'ok', 'kak se pravi opit', '😊', 'здравей', 'как се прави опит', 'кога да спра опита', 'а', '123', 'опит за съня 7 вечери', 'какво е лабораторията'];
    let отг = 0;
    for (const и of изреч) { const преди = await изр("document.querySelectorAll('#roChat .msg.bot:not(#roTyping)').length");
      await пиши('#roInput', и); await тапни('#roForm button[type="submit"], #roForm button');
      if (await чакай(`document.querySelectorAll('#roChat .msg.bot:not(#roTyping)').length > ${преди}`, 8000) >= 0) отг++; await пауза(1500); }
    const нови = грешки.slice(пред);
    пр('Лабораторията: ➤ ' + изреч.length + ' изречения', нови.length === 0 && отг === изреч.length, -1, 'отговори ' + отг + '/' + изреч.length + ' · грешки ' + нови.length + (нови.length ? ' · ' + нови.slice(0, 2).join(' | ') : ''));
    await назад(); await чакай("document.getElementById('roomOverlay').hidden", 5000); }
  // ── 7 · ОФЛАЙН ──
  if (!арг['bez-oflain']) {
    етап = 'кеш'; await send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 }); await send('Emulation.setCPUThrottlingRate', { rate: 1 });
    const тК = await чакай("(async () => { if (!('caches' in window)) return false; for (const к of await caches.keys()) { const c = await caches.open(к); const r = (await c.keys()).map(x => x.url); if (r.some(u => /js\\/kb\\.js/.test(u)) && r.some(u => /lib\\/index\\.json/.test(u))) return true; } return false; })()", 180000);
    пр('предварителният кеш на SW (kb.js + lib/index.json) е готов', тК >= 0, тК);
    етап = 'офлайн'; await send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 }); await send('Emulation.setCPUThrottlingRate', { rate: 4 });
    const tО = Date.now(); await send('Page.reload');
    const тН = await чакай("!document.getElementById('blSplash') && document.querySelectorAll('.pl-room[data-room]').length >= 9 && !!window.KB", 60000);
    пр('ОФЛАЙН: приложението се отваря (със знанието)', тН >= 0, тН >= 0 ? Date.now() - tО : -1, 'вратата видима: ' + await изр("!!(window.BL_DOSTAP && BL_DOSTAP.състояние().видим)") + ' · режим ' + await изр("window.BL_DOSTAP && BL_DOSTAP.състояние().режим"));
    await махниМедали();
    await тапни('[data-pl="find"]'); await чакай("!document.getElementById('searchOverlay').hidden", 5000);
    await пиши('#searchInput', 'температура'); await изр("document.getElementById('searchInput').dispatchEvent(new Event('input', { bubbles: true })); 1");
    const тТ = await чакай("(document.getElementById('searchResults').textContent || '').length > 40 && !/Секунда — зареждам/.test(document.getElementById('searchResults').textContent)", 10000);
    пр('ОФЛАЙН: търсене „температура“', тТ >= 0, тТ, (await изр("(document.getElementById('searchResults').textContent || '').trim().slice(0, 70)")) || '');
    await пиши('#searchInput', 'бебето не диша'); await изр("document.getElementById('searchInput').dispatchEvent(new Event('input', { bubbles: true })); 1");
    const тС = await чакай("!!document.querySelector('#searchResults .sf-sos')", 6000);
    пр('ОФЛАЙН: „бебето не диша“ в търсенето → 112', тС >= 0, тС, 'tel: ' + await изр("document.querySelectorAll('#searchResults a[href^=\"tel:112\"]').length"));
    await назад(); await чакай("document.getElementById('searchOverlay').hidden", 5000);
    const сел = await изр("(() => { const e = [...document.querySelectorAll('.bn-sos, .btn-sos, .cta-sos')].find(x => x.offsetParent); if (!e) return null; e.setAttribute('data-proba-sos', '1'); return '[data-proba-sos]'; })()");
    if (сел) await тапни(сел);
    const тSOS = await чакай("(() => { const о = document.getElementById('sosOverlay'); return !!(о && !о.hidden && о.getClientRects().length) && document.querySelectorAll('#sosOverlay a[href^=\"tel:\"]').length > 0; })()", 5000);
    пр('ОФЛАЙН: СОС центърът с tel: номерата', тSOS >= 0, тSOS, 'tel: ' + await изр("document.querySelectorAll('#sosOverlay a[href^=\"tel:\"]').length"));
  }
  console.log(рез.join('\n'));
  console.log('\nНЕОБРАБОТЕНИ ОТКАЗИ СЪС СТЕК: ' + (await изр('JSON.stringify(window.__откази || [])')));
  console.log('\nГРЕШКИ (' + грешки.length + '):'); [...new Set(грешки)].slice(0, 30).forEach(г => console.log('   ' + г));
  console.log((червени ? '🔴 ' + червени + ' ЧЕРВЕНИ' : '✅ без червени') + ' · 🟠 над 3 s: ' + бавни);
  край(червени ? 1 : 0);
})();
