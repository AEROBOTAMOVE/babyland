// 🧰 ФУНКЦИОНАЛНА ПРОБА НА ИНСТРУМЕНТИТЕ (21.11.2026): въвеждане → записване → махане → показаното, на 360, профил с бебе.
// Разходите по месеци · Касичка-цел (+ фактът в чата на помощничката) · „Преди колко време?“ (Ибупрофен, таймер, таван)
// · Калкулатор на растежа + Ръст и главичка · дневникът (хранене, пелени, сън, мл, кръгът).
// Пише се с Input.insertText (истинско събитие input, както от клавиатурата). /api/* = 200 само в браузъра на пробата.
// Без забавяне на мрежата (функционална, не за скорост). Един Chrome (slot.js).
// ПУСКАНЕ: node dev/proba/instrumenti_funkc_proba.js [--url адрес] [--izhod рез.json]
const { spawn } = require('child_process'); const path = require('path'); const fs = require('fs');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; } }
const пауза = ms => new Promise(r => setTimeout(r, ms));
const АДРЕС = (арг.url || 'https://babyland.aaeromove.workers.dev').replace(/\/?$/, '/') + 'index.html';
require('./pazach_zhivo.js')(АДРЕС);   // подменя /api → само местен адрес
const рез = [];
const пров = (ид, добре, получено, очаквано) => { рез.push({ ид, добре: !!добре, получено, очаквано }); console.log((добре ? '  ✅ ' : '  🔴 ') + ид + (добре ? '' : '\n       очаквано: ' + JSON.stringify(очаквано) + '\n       получено: ' + JSON.stringify(получено))); };
const ПОМОЩ = `window.__П = {
  к(pref) { const s = document.querySelector('#roRoom section.jr-card[data-blkey^="' + pref + '"]'); if (s && s.classList.contains('folded')) { const b = s.querySelector('.jr-title .fold-btn'); if (b) b.click(); } return s; },
  кТ(re) { return [...document.querySelectorAll('#roRoom section.jr-card')].find(s => re.test((s.querySelector('h4') || {}).textContent || '')); },
  бут(root, txt) { return root && [...root.querySelectorAll('button')].find(b => b.textContent.replace(/\\s+/g, ' ').trim().startsWith(txt)); },
  т(e) { return e ? e.textContent.replace(/\\s+/g, ' ').trim() : null; },
  днес() { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); },
  ls(k) { const v = localStorage.getItem(k); try { return JSON.parse(v); } catch (e) { return v; } },
  кас() { return [...document.querySelectorAll('#roRoom section.jr-card')].find(s => s.querySelector('.gl-bar') || s.querySelector('input[placeholder^="за какво събираме"]')); },
  ред() { return document.querySelector('#todaySection .ch-row[data-id="' + (window.__редИд || 'nurofen') + '"]'); },
  зъб() { const r = __П.ред(); return r ? [...r.querySelectorAll('button')].find(b => b.textContent.trim() === '⚙ Числата от кутията') : null; }
}; 1`;
(async () => {
  await require('./slot.js')('chrome');
  const ПРОФИЛ = path.join(__dirname, 'chrome_pr_instr_' + Date.now()); const ПОРТ = 9200 + Math.floor(Math.random() * 700);
  const ch = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=360,800'].concat((process.env.BL_CHROME_FLAGS || '').split(' ').filter(Boolean), ['about:blank']), { stdio: 'ignore' });
  const край = к => { if (арг.izhod) fs.writeFileSync(арг.izhod, JSON.stringify(рез, null, 1)); const з = рез.filter(р => !р.добре).length; console.log('\nОБЩО ' + рез.length + ' проверки · 🔴 ' + з); try { ch.kill(); } catch (e) {} setTimeout(() => { try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {} process.exit(к); }, 1500); };
  let цел; for (let i = 0; i < 80 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + ПОРТ + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
  if (!цел) { console.log('🔴 Chrome не тръгна'); return край(3); }
  const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let n = 0; const ч = new Map(); const грешки = [];
  const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  ws.onmessage = e => { const м = JSON.parse(e.data); if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); }
    if (м.method === 'Runtime.exceptionThrown') грешки.push((м.params.exceptionDetails.exception || {}).description || м.params.exceptionDetails.text);
    if (м.method === 'Page.javascriptDialogOpening') { грешки.push('РОДЕН ДИАЛОГ: ' + м.params.message); send('Page.handleJavaScriptDialog', { accept: true }); }
    if (м.method === 'Fetch.requestPaused') send('Fetch.fulfillRequest', { requestId: м.params.requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }], body: Buffer.from(JSON.stringify({ user: { email: 'proba@example.test', status: 'active', access_until: new Date(Date.now() + 14 * 864e5).toISOString(), proben: true } })).toString('base64') }).catch(() => {}); };
  const изр = async x => { const р = await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true }); if (р.result && р.result.exceptionDetails) return { __грешка: (р.result.exceptionDetails.exception || {}).description }; return р.result && р.result.result ? р.result.result.value : null; };
  const чакай = async (x, ms) => { const t = Date.now(); while (Date.now() - t < ms) { if (await изр(x)) return Date.now() - t; await пауза(100); } return -1; };
  // пиши: фокус, изчисти, Input.insertText (истинско input събитие); провери, че стойността е влязла
  const пиши = async (израз, текст) => { await изр(`(() => { const e = ${израз}; e.scrollIntoView({ block: 'center' }); e.focus(); e.select && e.select(); return 1; })()`); await изр(`(() => { const e = ${израз}; e.value = ''; return 1; })()`); await send('Input.insertText', { text: текст }); await пауза(60); return изр(`(${израз}).value`); };
  const цък = async (израз, после = 150) => { const р = await изр(`(() => { const e = ${израз}; if (!e) return 'НЯМА'; e.click(); return 1; })()`); if (р !== 1) пров('НЯМА КАКВО ДА НАТИСНА: ' + израз.slice(0, 90), false, р, 'елементът съществува'); await пауза(после); return р; };
  const модал = async (бутон = '.bl-ui-ok') => { if (await чакай("!!document.querySelector('.md-veil.bl-ui " + бутон + "')", 3000) < 0) return 'НЯМА МОДАЛ'; const т = await изр("__П.т(document.querySelector('.md-veil.bl-ui .bl-ui-text'))"); await изр("document.querySelector('.md-veil.bl-ui " + бутон + "').click(), 1"); await пауза(450); return т; };
  const отвори = async стая => { await изр('(() => { try { MamaHelper.close(); } catch (e) {} return 1; })()'); await пауза(300); await изр(`MamaHelper.open(${JSON.stringify(стая)}), 1`); await чакай("!document.getElementById('roomOverlay').hidden && !document.querySelector('#roRoom .ro-skel')", 8000); await пауза(500); };
  await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable');
  await send('Fetch.enable', { patterns: [{ urlPattern: '*/api/*', requestStage: 'Request' }] });
  await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 800, deviceScaleFactor: 2, mobile: true });
  await send('Page.navigate', { url: АДРЕС }); await пауза(2500);
  await изр(`(() => { localStorage.clear(); const s = (k, v) => localStorage.setItem(k, JSON.stringify(v)); s('bl_onboarded', true); localStorage.setItem('bl_tour_done','1'); s('bl_hero_toured', true); s('bl_baby', { name: 'Алекс', birth: '2026-07-19', sex: 'boy' }); return 1; })()`);
  await send('Page.reload');
  await чакай("!!document.getElementById('blSplash')", 20000);
  if (await чакай("!document.getElementById('blSplash') && document.querySelectorAll('.pl-room[data-room]').length >= 9 && !!window.MamaHelper", 120000) < 0) { console.log('🔴 началото не излезе'); return край(2); }
  await пауза(2500); await изр(ПОМОЩ);
  const инфо = await изр(`({ v: (document.querySelector('script[src*="app.js"]') || {}).src, час: new Date().toString(), днес: __П.днес(), stay: (document.querySelector('link[href*="manifest"]')||{}).href })`);
  console.log('СТРАНИЦА: ' + JSON.stringify(инфо));
  const чV = await изр("caches.keys().then(k => k.join(','))"); console.log('кеш на sw: ' + чV);

  // ═══════════ 1 · „ПРЕДИ КОЛКО ВРЕМЕ?“ (началото, #todaySection) ═══════════
  console.log('\n⏳ ПРЕДИ КОЛКО ВРЕМЕ? — Ибупрофен');
  await чакай('!!__П.ред()', 8000);
  пров('час-1 редът Ибупрофен е на началото', await изр("!!__П.ред() && __П.т(__П.ред().querySelector('.ch-ime'))"), await изр("__П.ред() && __П.т(__П.ред().querySelector('.ch-ime'))"), 'Ибупрофен');
  пров('час-2 празно: „—“ и „Още нищо…“', (await изр("__П.т(__П.ред().querySelector('.ch-kolko'))")) === '—' && /Още нищо/.test(await изр("__П.т(__П.ред().querySelector('.ch-pod'))")), [await изр("__П.т(__П.ред().querySelector('.ch-kolko'))"), await изр("__П.т(__П.ред().querySelector('.ch-pod'))")], ['—', 'Още нищо. Бутни, щом стане.']);
  await цък("__П.ред().querySelector('button.ch-hit')");
  const к1 = await изр("({ k: __П.т(__П.ред().querySelector('.ch-kolko')), p: __П.т(__П.ред().querySelector('.ch-pod')), set: !__П.ред().querySelector('.ch-set').hidden, h: (__П.ред().querySelector('input[aria-label=\"На колко часа\"]')||{}).value, m: (__П.ред().querySelector('input[aria-label=\"Най-много дози за 24 часа\"]')||{}).value, ls: __П.ls('bl_chas') })");
  пров('час-3 една доза: „току-що“, „1 доза за 24 ч“', к1.k === 'току-що' && /1 доза за 24 ч/.test(к1.p) && к1.ls && к1.ls.nurofen && к1.ls.nurofen.hist.length === 1, к1, 'току-що · … 1 доза за 24 ч');
  // следващата = T + 6 ч
  const следв = await изр("(() => { const t = __П.ls('bl_chas').nurofen.t + 6 * 3600e3; const d = new Date(t); return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0'); })()");
  пров('час-4 „най-рано в“ = записаното + 6 ч', к1.p.includes('най-рано в ' + следв), к1.p, '… най-рано в ' + следв);
  пров('час-5 настройките се показват: 6 ч / 3 дози', к1.set && к1.h === '6' && к1.m === '3', { set: к1.set, h: к1.h, m: к1.m }, { set: true, h: '6', m: '3' });
  пров('час-5а полетата се отварят сами първия път → aria-expanded на бутона е true', (await изр("__П.зъб() && __П.зъб().getAttribute('aria-expanded')")) === 'true', await изр("__П.зъб() && __П.зъб().getAttribute('aria-expanded')"), 'true');
  await цък("__П.ред().querySelector('button.ch-hit')"); await цък("__П.ред().querySelector('button.ch-hit')");
  const к3 = await изр("({ p: __П.т(__П.ред().querySelector('.ch-pod')), red: __П.т(__П.ред().querySelector('.ch-red')), warn: __П.ред().querySelector('.ch-kolko').classList.contains('ch-warn') })");
  пров('час-6 трета доза → таванът (3) с червения ред', /3 дози за 24 ч/.test(к3.p) && /^Стигна началния таван, провери кутията \(3\)\./.test(к3.red || '') && к3.warn, к3, '3 дози за 24 ч + „Стигна началния таван, провери кутията (3)…“');
  await цък("__П.ред().querySelector('button.ch-hit')");
  const к4 = await изр("({ p: __П.т(__П.ред().querySelector('.ch-pod')), n: __П.ls('bl_chas').nurofen.hist.length })");
  пров('час-7 четвърта доза се записва (таванът е предупреждение)', к4.n === 4 && /4 дози за 24 ч/.test(к4.p), к4, '4 дози за 24 ч');
  await изр("(() => { const e = __П.ред().querySelector('input[aria-label=\"Най-много дози за 24 часа\"]'); e.value = '5'; e.dispatchEvent(new Event('change', { bubbles: true })); return 1; })()"); await пауза(200);
  const к5 = await изр("({ red: !!__П.ред().querySelector('.ch-red'), warn: __П.ред().querySelector('.ch-kolko').classList.contains('ch-warn'), н: __П.ls('bl_chas_nastr') })");
  пров('час-8 таван 5 → червеният ред изчезва', !к5.red && !к5.warn && к5.н && к5.н.nurofen && к5.н.nurofen.max === 5, к5, 'без .ch-red, bl_chas_nastr.nurofen.max = 5');
  await изр("(() => { const e = __П.ред().querySelector('input[aria-label=\"На колко часа\"]'); e.value = '8'; e.dispatchEvent(new Event('change', { bubbles: true })); return 1; })()"); await пауза(200);
  const к6 = await изр("({ p: __П.т(__П.ред().querySelector('.ch-pod')), н: __П.ls('bl_chas_nastr'), sl: (() => { const d = new Date(__П.ls('bl_chas').nurofen.t + 8 * 3600e3); return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0'); })() })");
  пров('час-9 на всеки 8 ч → „най-рано в“ +8 ч', к6.н.nurofen.h === 8 && к6.p.includes('най-рано в ' + к6.sl), к6, 'h = 8, най-рано в ' + к6.sl);
  // ПОДОЗРЕНИЕ: настройките не могат да се отворят пак, след като веднъж са записани
  await изр('window.refreshToday(), 1'); await пауза(400); await изр(ПОМОЩ);
  await цък("__П.ред().querySelector('button.ch-hit')");
  const к7 = await изр("({ setHidden: __П.ред().querySelector('.ch-set').hidden, бутони: [...__П.ред().querySelectorAll('button')].filter(b => !b.closest('[hidden]')).map(b => (b.getAttribute('aria-label') || b.textContent).trim()) })");
  // точен текст на бутона, не свободен филтър (21.11 „Промени часа“ съвпадна с /промен/ и даде лъжливо зелено)
  const натисни = async () => { await изр(ПОМОЩ); await изр("(async () => { const e = (__П.зъб() || document.body); e.scrollIntoView({ block: 'center', behavior: 'instant' }); let пр = null, еднакви = 0; for (let i = 0; i < 60 && еднакви < 5; i++) { await new Promise(r => setTimeout(r, 100)); const y = e.getBoundingClientRect().top; еднакви = y === пр ? еднакви + 1 : 0; пр = y; } return еднакви; })()"); const q = await изр("(() => { const e = __П.зъб(); if (!e) return null; const r = e.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2; const горе = document.elementFromPoint(x, y); return { x, y, w: r.width, h: r.height, отгоре: горе === e || e.contains(горе) ? 'бутонът' : (горе && (горе.id || горе.className)) }; })()"); if (!q) return null;
    for (const type of ['mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x: q.x, y: q.y, button: 'left', clickCount: 1 }); await пауза(250); return q; };
  const сн = () => изр("(() => { const s = __П.ред().querySelector('.ch-set'), e = __П.зъб(), f = l => (__П.ред().querySelector('input[aria-label=\"' + l + '\"]') || {}).value; return { вис: Math.round(s.getBoundingClientRect().height), aria: e && e.getAttribute('aria-expanded'), етикет: e && e.getAttribute('aria-label'), таг: e && e.tagName, h: f('На колко часа'), m: f('Най-много дози за 24 часа'), pod: __П.т(__П.ред().querySelector('.ch-pod')), ls: (__П.ls('bl_chas_nastr') || {}).nurofen, t: __П.ls('bl_chas').nurofen.t }; })()");
  const часПлюс = async ч => изр("(() => { const d = new Date(__П.ls('bl_chas').nurofen.t + " + ч + " * 3600e3); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); })()");
  const сложиЧас = async ч => { await изр("(() => { const e = __П.ред().querySelector('input[aria-label=\"На колко часа\"]'); e.value = '" + ч + "'; e.dispatchEvent(new Event('change', { bubbles: true })); return 1; })()"); await пауза(250); };
  const с0 = await сн(); const б1 = await натисни(); const с1 = await сн();
  пров('час-10 след записани числа бутонът „⚙ Числата от кутията“ отваря полетата (8 ч / 5 дози)', к7.setHidden && с0.вис === 0 && б1 && б1.отгоре === 'бутонът' && с1.вис > 20 && с1.h === '8' && с1.m === '5', { преди: с0, бутон: б1, след: с1 }, 'затворено → отворено, 8 и 5');
  пров('час-10а бутонът е поне 44 × 44 px', б1 && б1.w >= 44 && б1.h >= 44, б1, '≥ 44 × 44');
  пров('час-10б aria: button, етикет с името, expanded false → true', с0.таг === 'BUTTON' && с0.етикет === 'Числата от кутията: интервал и таван за Ибупрофен' && с0.aria === 'false' && с1.aria === 'true', { с0, с1 }, 'false → true');
  if (арг.snimka) { const ш = await send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(арг.snimka.replace(/\.png$/, '') + '_zab.png', Buffer.from(ш.result.data, 'base64')); }
  await сложиЧас(6); const с6 = await сн(); const ч6 = await часПлюс(6);
  пров('час-10в 8 → 6: „най-рано в“ = +6 ч', с6.ls && с6.ls.h === 6 && с6.pod.includes('най-рано в ' + ч6), { pod: с6.pod, ls: с6.ls }, 'най-рано в ' + ч6);
  пров('час-10е щом числата са НЕЙНИ: „твоята бележка“ и „твоя таван (5)“', /по твоята бележка следващата/.test(с6.pod) && /Стигна твоя таван \(5\)/.test(с6.pod), с6.pod, 'твоята бележка · твоя таван (5)');
  await натисни(); const сЗ = await сн();
  пров('час-10г второ натискане затваря (и aria = false)', сЗ.вис === 0 && сЗ.aria === 'false', сЗ, 'затворено, false');
  await изр('window.refreshToday(), 1'); await пауза(500); await изр(ПОМОЩ);
  await натисни(); const сП = await сн(); await сложиЧас(8); const с8 = await сн(); const ч8 = await часПлюс(8);
  пров('час-10д след пререндер пак отваря с 6, и 6 → 8 мести „най-рано в“ на +8 ч', сП.вис > 20 && сП.h === '6' && с8.ls.h === 8 && с8.pod.includes('най-рано в ' + ч8) && ч8 !== ч6, { отворено: сП, pod6: с6.pod, pod8: с8.pod }, '6 → 8, най-рано в ' + ч8);
  // 24-часов прозорец: най-старата доза преди 25 ч не се брои
  await изр(`(() => { const N = Date.now(); localStorage.setItem('bl_chas', JSON.stringify({ nurofen: { t: N - 5 * 60000, hist: [N - 25 * 3600e3, N - 5 * 3600e3, N - 5 * 60000] } })); localStorage.removeItem('bl_chas_nastr'); refreshToday(); return 1; })()`); await пауза(400); await изр(ПОМОЩ);
  const к8 = await изр("({ p: __П.т(__П.ред().querySelector('.ch-pod')), k: __П.т(__П.ред().querySelector('.ch-kolko')) })");
  пров('час-11 доза отпреди 25 ч не се брои: „2 дози“, без таван', /2 дози за 24 ч/.test(к8.p) && !/таван/.test(к8.p) && к8.k === 'преди 5 мин', к8, 'преди 5 мин · 2 дози за 24 ч');
  await изр(`(() => { const N = Date.now(); localStorage.setItem('bl_chas', JSON.stringify({ nurofen: { t: N - 90 * 60000, hist: [N - 90 * 60000] } })); refreshToday(); return 1; })()`); await пауза(400); await изр(ПОМОЩ);
  пров('час-12 таймерът: преди 1 ч 30 мин', (await изр("__П.т(__П.ред().querySelector('.ch-kolko'))")) === 'преди 1 ч 30 мин', await изр("__П.т(__П.ред().querySelector('.ch-kolko'))"), 'преди 1 ч 30 мин');
  await изр(`(() => { const N = Date.now(); localStorage.setItem('bl_chas', JSON.stringify({ nurofen: { t: N - 7 * 3600e3, hist: [N - 7 * 3600e3] } })); refreshToday(); return 1; })()`); await пауза(400); await изр(ПОМОЩ);
  const к9 = await изр("({ k: __П.т(__П.ред().querySelector('.ch-kolko')), p: __П.т(__П.ред().querySelector('.ch-pod')) })");
  пров('час-13 след 7 ч: „преди 7 ч“ и „началните 6 ч минаха…“ (тя не е записала число)', к9.k === 'преди 7 ч' && /началните 6 ч минаха, провери кутията/.test(к9.p), к9, 'преди 7 ч · … началните 6 ч минаха, провери кутията');
  // поправка на часа: часът на последната доза
  await цък("__П.ред().querySelector('.ch-kolko')");
  const чПопр = await изр("(() => { const d = new Date(Date.now() - 3 * 3600e3); return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0'); })()");
  await изр(`(() => { const e = __П.ред().querySelector('.ch-fix input.ch-time'); e.value = '${чПопр}'; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); return 1; })()`);
  await цък("__П.ред().querySelector('.ch-fix button.ch-ok')", 300); await изр(ПОМОЩ);
  const к10 = await изр("({ k: __П.т(__П.ред().querySelector('.ch-kolko')), p: __П.т(__П.ред().querySelector('.ch-pod')), n: __П.ls('bl_chas').nurofen.hist.length })");
  пров('час-14 „Кога беше наистина?“ → ' + чПопр + ' (преди ~3 ч), без нов запис', /преди (2 ч 59 мин|3 ч)/.test(к10.k) && к10.p.includes('в ' + чПопр) && к10.n === 1, к10, 'преди 3 ч · в ' + чПопр + ' · hist 1');
  // ── полетата преди първата доза ──
  await изр("localStorage.removeItem('bl_chas'); localStorage.removeItem('bl_chas_nastr'); refreshToday(); 1"); await пауза(400); await изр(ПОМОЩ);
  await натисни(); const пр0 = await изр("({ вис: Math.round(__П.ред().querySelector('.ch-set').getBoundingClientRect().height), aria: __П.зъб().getAttribute('aria-expanded'), h: __П.ред().querySelector('input[aria-label=\"На колко часа\"]').value, m: __П.ред().querySelector('input[aria-label=\"Най-много дози за 24 часа\"]').value, дози: __П.ls('bl_chas') })");
  пров('час-15 преди първата доза ⚙ отваря полетата с 6 и 3, без да записва доза', пр0.вис > 20 && пр0.aria === 'true' && пр0.h === '6' && пр0.m === '3' && !пр0.дози, пр0, 'отворено, 6 и 3, bl_chas празно');
  // ── началните не са „твоята бележка“: записано → „твоите“, незаписано → „началните“; на картата И в чата (през полето #roInput) ──
  await отвори('Здраве и SOS'); await цък("document.querySelector('#roTabs [data-tab=\"chat\"]')"); await пауза(2600); await изр(ПОМОЩ);
  const питайЧата = async () => { const бр = await изр("document.querySelectorAll('#roChat .msg.bot:not(#roTyping)').length"); await пиши("document.getElementById('roInput')", 'кога дадох ибупрофен'); await изр("document.getElementById('roForm').requestSubmit(), 1");
    if (await чакай("document.querySelectorAll('#roChat .msg.bot:not(#roTyping)').length > " + бр, 15000) < 0) return 'НЯМА ОТГОВОР'; await пауза(300); return изр("__П.т([...document.querySelectorAll('#roChat .msg.bot:not(#roTyping) .msg-bubble')].pop())"); };
  const НАЧ_К = /по началните 6 ч, провери кутията: най-рано в/, ТВ_К = /по твоята бележка следващата е най-рано в/, НАЧ_Т = /Стигна началния таван, провери кутията \((\d+)\)/, ТВ_Т = /Стигна твоя таван \((\d+)\)/;
  const НАЧ_Ч = /По началните 6 ч \(провери кутията\) следващата е най-рано в/, ТВ_Ч = /По твоята бележка следващата е най-рано в/, НАЧ_ТЧ = /стигна началния таван, провери кутията \((\d+)\)/, ТВ_ТЧ = /стигна твоя таван \((\d+)\)/;
  const СЪСТ = [
    ['нищо записано, таван', null, 10, 3, [НАЧ_К, НАЧ_Т], [НАЧ_Ч, НАЧ_ТЧ], '3'],
    ['записани и двете (8 ч / 3)', { h: 8, max: 3 }, 10, 3, [ТВ_К, ТВ_Т], [ТВ_Ч, ТВ_ТЧ], '3'],
    ['само интервалът (8 ч)', { h: 8 }, 10, 3, [ТВ_К, НАЧ_Т], [ТВ_Ч, НАЧ_ТЧ], '3'],
    ['само таванът (2)', { max: 2 }, 10, 2, [НАЧ_К, ТВ_Т], [НАЧ_Ч, ТВ_ТЧ], '2'],
    ['нищо записано, минал срок', null, 420, 1, [/началните 6 ч минаха, провери кутията/], [/Началните 6 ч минаха, провери кутията\./], null],
    ['записан 6 ч, минал срок', { h: 6 }, 420, 1, [/твоите 6 ч минаха/], [/Твоите 6 ч минаха\./], null],
  ];
  for (const [име, настр, мин, дози, карта, чатат, таван] of СЪСТ) {
    await изр("(() => { const N = Date.now() - " + мин + " * 60000; const hist = []; for (let k = " + (дози - 1) + "; k >= 0; k--) hist.push(N - k * 3600e3); localStorage.setItem('bl_chas', JSON.stringify({ nurofen: { t: N, hist } })); const s = " + JSON.stringify(настр) + "; if (s) localStorage.setItem('bl_chas_nastr', JSON.stringify({ nurofen: s })); else localStorage.removeItem('bl_chas_nastr'); refreshToday(); return 1; })()"); await пауза(400); await изр(ПОМОЩ);
    const тК = await изр("__П.т(__П.ред().querySelector('.ch-pod'))"), тЧ = await питайЧата();
    const чака = мин < 360 ? await часПлюс((настр && настр.h) || 6) : null;
    const двете = (т, ре) => ре.every(x => x.test(т)) && (!таван || ре.map(x => (т.match(x) || [])[1]).some(x => x === таван)) && (!чака || т.includes('най-рано в ' + чака));
    const чуждо = т => (настр && настр.h ? /началните \d+ ч/i : /твоята бележка|твоите \d+ ч/i).test(т) || (таван ? (настр && настр.max ? /началния таван/ : /твоя таван/).test(т) : false);
    пров('час-16 КАРТАТА · ' + име, двете(тК, карта) && !чуждо(тК), тК, карта.map(String).join(' + '));
    пров('час-17 ЧАТЪТ · ' + име, двете(тЧ, чатат) && !чуждо(тЧ), тЧ, чатат.map(String).join(' + '));
  }
  // сведение, не проверка: може ли мама да ПОТВЪРДИ началното число (да напише същото 6 и да излезе от полето)?
  await изр("(() => { const N = Date.now() - 600000; localStorage.setItem('bl_chas', JSON.stringify({ nurofen: { t: N, hist: [N] } })); localStorage.removeItem('bl_chas_nastr'); try { MamaHelper.close(); } catch (e) {} refreshToday(); return 1; })()"); await пауза(600); await изр(ПОМОЩ); await натисни();
  const ПОЛЕ = "__П.ред().querySelector('input[aria-label=\"На колко часа\"]')"; await изр("(() => { const e = " + ПОЛЕ + "; e.focus(); e.select(); return 1; })()"); await send('Input.insertText', { text: '6' });
  for (const type of ['keyDown', 'keyUp']) await send('Input.dispatchKeyEvent', { type, key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 }); await пауза(300);
  console.log('  ℹ️ потвърждаване на същото число (6 → 6, Tab): записано ' + JSON.stringify(await изр("__П.ls('bl_chas_nastr')")) + ' · картата: ' + await изр("__П.т(__П.ред().querySelector('.ch-pod'))"));
  // ── бележката под полетата: три случая, веднага след записа (истински клавиши + Tab, без пререндер) ──
  const пишиПоле = async (етикет, стойност) => { await изр("(() => { const e = __П.ред().querySelector('input[aria-label=\"" + етикет + "\"]'); e.focus(); e.select(); return 1; })()"); await send('Input.insertText', { text: String(стойност) }); for (const type of ['keyDown', 'keyUp']) await send('Input.dispatchKeyEvent', { type, key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 }); await пауза(250); };
  const бележка = () => изр("__П.т(__П.ред().querySelector('.ch-set-warn'))");
  const НАЧ_Б = /Това са началните числа, докато запишеш своите от кутията\./, ЕДНО_Б = /Едното число е твое, другото е начално — запиши и него от кутията\./, ТВОИ_Б = /Тези две числа са твои — приложението само ги помни\./;
  const точно = (т, ре) => [НАЧ_Б, ЕДНО_Б, ТВОИ_Б].every(x => x.test(т) === (x === ре)) && /Не са съвет и не заместват листовката\.$/.test(т);
  const чистРед = async ид => { await изр("window.__редИд = '" + ид + "'; localStorage.removeItem('bl_chas'); localStorage.removeItem('bl_chas_nastr'); refreshToday(); 1"); await пауза(400); await изр(ПОМОЩ); };
  for (const [ид, име, h, m] of [['nurofen', 'Ибупрофен', '8', '4'], ['paracet', 'Парацетамол', '5', '3']]) {
    await чистРед(ид); await натисни(); const б0 = await бележка();
    пров('час-18 ' + име + ' · нищо записано → „началните“', точно(б0, НАЧ_Б), б0, String(НАЧ_Б));
    await пишиПоле('На колко часа', h); const б1Б = await бележка();
    пров('час-18 ' + име + ' · само интервалът → „Едното число е твое“, веднага', точно(б1Б, ЕДНО_Б), б1Б, String(ЕДНО_Б));
    await пишиПоле('Най-много дози за 24 часа', m); const б2 = await бележка(); const ls2 = await изр("__П.ls('bl_chas_nastr')");
    пров('час-18 ' + име + ' · и двете → „Тези две числа са твои“, веднага', точно(б2, ТВОИ_Б) && JSON.stringify(ls2) === JSON.stringify({ [ид]: { h: +h, max: +m } }), { б2, ls2 }, String(ТВОИ_Б) + ' и записано само за ' + ид);
    await чистРед(ид); await натисни(); await пишиПоле('Най-много дози за 24 часа', m); const б3 = await бележка();
    пров('час-18 ' + име + ' · само таванът → „Едното число е твое“', точно(б3, ЕДНО_Б), б3, String(ЕДНО_Б));
  }
  // ── Парацетамол: целият ред (начални 6 ч / 4 дози) ──
  await чистРед('paracet');
  const ПЕТ = () => изр("({ ime: __П.т(__П.ред().querySelector('.ch-ime')), k: __П.т(__П.ред().querySelector('.ch-kolko')), p: __П.т(__П.ред().querySelector('.ch-pod')), вис: Math.round(__П.ред().querySelector('.ch-set').getBoundingClientRect().height), aria: __П.зъб() && __П.зъб().getAttribute('aria-expanded'), етикет: __П.зъб() && __П.зъб().getAttribute('aria-label'), h: __П.ред().querySelector('input[aria-label=\"На колко часа\"]').value, m: __П.ред().querySelector('input[aria-label=\"Най-много дози за 24 часа\"]').value, warn: __П.ред().querySelector('.ch-kolko').classList.contains('ch-warn'), ls: __П.ls('bl_chas'), н: __П.ls('bl_chas_nastr') })");
  let п0 = await ПЕТ(); пров('час-19 Парацетамол: празен ред, бутонът носи името му', п0.ime === 'Парацетамол' && п0.k === '—' && п0.етикет === 'Числата от кутията: интервал и таван за Парацетамол' && п0.aria === 'false', п0, '— · Числата от кутията: интервал и таван за Парацетамол');
  const б1П = await натисни(); await натисни();
  пров('час-19а бутонът на Парацетамола е поне 44 × 44 и нищо не го закрива', б1П && б1П.w >= 44 && б1П.h >= 44 && б1П.отгоре === 'бутонът', б1П, '≥ 44 × 44');
  await цък("__П.ред().querySelector('button.ch-hit')"); п0 = await ПЕТ(); const п6 = await изр("(() => { const d = new Date(__П.ls('bl_chas').paracet.t + 6 * 3600e3); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); })()");
  пров('час-19б първа доза: полетата се отварят с 6 и 4, aria true, „началните 6 ч“, +6 ч, Ибупрофенът не е пипнат', п0.вис > 20 && п0.aria === 'true' && п0.h === '6' && п0.m === '4' && п0.k === 'току-що' && п0.p.includes('по началните 6 ч, провери кутията: най-рано в ' + п6) && /1 доза за 24 ч/.test(п0.p) && !п0.ls.nurofen, п0, '6 / 4 · най-рано в ' + п6);
  await цък("__П.ред().querySelector('button.ch-hit')"); await цък("__П.ред().querySelector('button.ch-hit')"); let п3 = await ПЕТ();
  пров('час-19в 3 дози: още няма таван (началният е 4)', /3 дози за 24 ч/.test(п3.p) && !/таван/.test(п3.p) && !п3.warn, п3.p, '3 дози, без таван');
  await цък("__П.ред().querySelector('button.ch-hit')"); п3 = await ПЕТ();
  пров('час-19г 4-та доза → „Стигна началния таван, провери кутията (4)“', /4 дози за 24 ч/.test(п3.p) && /Стигна началния таван, провери кутията \(4\)\./.test(п3.p) && п3.warn, п3.p, 'Стигна началния таван, провери кутията (4)');
  await пишиПоле('На колко часа', '4'); await пишиПоле('Най-много дози за 24 часа', '5'); п3 = await ПЕТ(); const п4 = await изр("(() => { const d = new Date(__П.ls('bl_chas').paracet.t + 4 * 3600e3); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); })()");
  пров('час-19д записани 4 ч / 5 → „твоята бележка“ +4 ч, таванът изчезва, за Ибупрофена нищо не е записано', п3.p.includes('по твоята бележка следващата е най-рано в ' + п4) && !/таван/.test(п3.p) && !п3.warn && !п3.н.nurofen, п3, 'най-рано в ' + п4);
  await чистРед('paracet'); await изр("(() => { const N = Date.now(); localStorage.setItem('bl_chas', JSON.stringify({ paracet: { t: N - 600000, hist: [N - 600000] }, nurofen: { t: N - 7200000, hist: [N - 7200000] } })); refreshToday(); return 1; })()"); await пауза(400); await изр(ПОМОЩ);
  const двоен = await изр("({ p: __П.т(__П.ред().querySelector('.ch-kolko')), n: __П.т(document.querySelector('#todaySection .ch-row[data-id=\"nurofen\"] .ch-kolko')) })");
  пров('час-19е двете лекарства не си смесват часовете', двоен.p === 'преди 10 мин' && двоен.n === 'преди 2 ч', двоен, 'преди 10 мин / преди 2 ч');
  // ── отговорът на помощничката направо (BL_CHAS.живОтговор), за двете лекарства ──
  const живО = async (дума) => изр("(() => { const d = document.createElement('div'); d.innerHTML = String(BL_CHAS.живОтговор('кога дадох " + дума + "')); return d.textContent.replace(/\\s+/g, ' ').trim(); })()");
  for (const [ид, дума, h0, m0] of [['nurofen', 'ибупрофен', 6, 3], ['paracet', 'парацетамол', 6, 4]]) {
    const сложиЖ = async (настр, мин, дози) => изр("(() => { const N = Date.now() - " + мин + " * 60000, hist = []; for (let k = " + (дози - 1) + "; k >= 0; k--) hist.push(N - k * 3600e3); localStorage.setItem('bl_chas', JSON.stringify({ " + ид + ": { t: N, hist } })); localStorage.setItem('bl_chas_nastr', JSON.stringify(" + (настр ? "{ " + ид + ": " + JSON.stringify(настр) + " }" : "{}") + ")); return 1; })()");
    await сложиЖ(null, 10, m0); const ж1 = await живО(дума);
    пров('час-20 ' + дума + ' · начални, стигнат таван', ж1.includes('По началните ' + h0 + ' ч (провери кутията) следващата е най-рано в') && ж1.includes('стигна началния таван, провери кутията (' + m0 + ').') && !/твоята бележка|твоя таван/i.test(ж1), ж1, 'По началните … стигна началния таван (' + m0 + ')');
    await сложиЖ({ h: 8, max: 2 }, 10, 2); const ж2 = await живО(дума);
    пров('час-20 ' + дума + ' · записани 8 ч / 2, стигнат таван', ж2.includes('По твоята бележка следващата е най-рано в') && ж2.includes('стигна твоя таван (2).') && !/началн/i.test(ж2), ж2, 'По твоята бележка … стигна твоя таван (2)');
    await сложиЖ(null, 420, 1); const ж3 = await живО(дума);
    пров('час-20 ' + дума + ' · начални, минал срок', ж3.includes('Началните ' + h0 + ' ч минаха, провери кутията.') && !/твоите/i.test(ж3), ж3, 'Началните ' + h0 + ' ч минаха, провери кутията.');
    await сложиЖ({ h: 6 }, 420, 1); const ж4 = await живО(дума);
    пров('час-20 ' + дума + ' · записан 6 ч, минал срок', ж4.includes('Твоите 6 ч минаха.') && !/началните/i.test(ж4), ж4, 'Твоите 6 ч минаха.');
  }
  // ── „Така е на кутията“: потвърждава началните, без да се сменя число ──
  const ПОТВ = "[...__П.ред().querySelectorAll('button')].find(b => b.textContent.trim() === 'Така е на кутията')";
  const клик = async израз => { await изр("(async () => { const e = " + израз + "; e.scrollIntoView({ block: 'center', behavior: 'instant' }); let пр = null, ед = 0; for (let i = 0; i < 60 && ед < 5; i++) { await new Promise(r => setTimeout(r, 100)); const y = e.getBoundingClientRect().top; ед = y === пр ? ед + 1 : 0; пр = y; } return 1; })()"); const q = await изр("(() => { const e = " + израз + "; const r = e.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2, г = document.elementFromPoint(x, y); return { x, y, w: r.width, h: r.height, отгоре: г === e || e.contains(г) ? 'бутонът' : (г && (г.id || г.className)) }; })()"); for (const type of ['mousePressed', 'mouseReleased']) await send('Input.dispatchMouseEvent', { type, x: q.x, y: q.y, button: 'left', clickCount: 1 }); await пауза(250); return q; };
  for (const [ид, име, h0, m0] of [['nurofen', 'Ибупрофен', 6, 3], ['paracet', 'Парацетамол', 6, 4]]) {
    await чистРед(ид); await цък("__П.ред().querySelector('button.ch-hit')"); const пр21 = await изр("({ p: __П.т(__П.ред().querySelector('.ch-pod')), видим: !!" + ПОТВ + " && " + ПОТВ + ".getBoundingClientRect().height, етикет: " + ПОТВ + " && " + ПОТВ + ".getAttribute('aria-label') })");
    пров('час-21 ' + име + ' · „Така е на кутията“ се вижда, с етикет, докато числата са начални', пр21.видим >= 44 && пр21.етикет === 'Така е на кутията: запиши числата за ' + име && /началните/.test(пр21.p), пр21, 'видим, ≥ 44, етикет с името');
    const q21 = await клик(ПОТВ); const сл21 = await изр("({ p: __П.т(__П.ред().querySelector('.ch-pod')), н: __П.ls('bl_chas_nastr'), вис: " + ПОТВ + " ? " + ПОТВ + ".getBoundingClientRect().height : 0, бел: __П.т(__П.ред().querySelector('.ch-set-warn')), дози: __П.ls('bl_chas')['" + ид + "'].hist.length })");
    пров('час-21а ' + име + ' · натискане: записва ' + h0 + ' ч / ' + m0 + ' без нова доза, „твои“ и „твоята бележка“, бутонът изчезва', q21.отгоре === 'бутонът' && JSON.stringify(сл21.н) === JSON.stringify({ [ид]: { h: h0, max: m0 } }) && точно(сл21.бел, ТВОИ_Б) && /по твоята бележка следващата/.test(сл21.p) && !/началн/.test(сл21.p) && сл21.вис === 0 && сл21.дози === 1, { q21, сл21 }, h0 + ' / ' + m0 + ', твои, бутонът скрит');
    await изр('window.refreshToday(), 1'); await пауза(400); await изр(ПОМОЩ); await натисни(); const п21 = await изр("({ бел: __П.т(__П.ред().querySelector('.ch-set-warn')), вис: " + ПОТВ + " ? " + ПОТВ + ".getBoundingClientRect().height : 0, p: __П.т(__П.ред().querySelector('.ch-pod')) })");
    пров('час-21б ' + име + ' · след пререндер пак са нейни', точно(п21.бел, ТВОИ_Б) && п21.вис === 0 && /по твоята бележка/.test(п21.p), п21, 'твои');
    await чистРед(ид); await натисни(); await пишиПоле('На колко часа', '8'); const ед21 = await изр("({ вис: " + ПОТВ + ".getBoundingClientRect().height })"); await клик(ПОТВ); const нн21 = await изр("__П.ls('bl_chas_nastr')");
    пров('час-21в ' + име + ' · само интервалът записан: бутонът стои и записва и тавана', ед21.вис >= 44 && JSON.stringify(нн21) === JSON.stringify({ [ид]: { h: 8, max: m0 } }), { ед21, нн21 }, '8 / ' + m0);
  }
  // ── „Друго лекарство“ (няма начални числа), добавено през „+“ ──
  await изр("localStorage.removeItem('bl_chas_vidimi'), 1"); await чистРед('nurofen');
  await цък("[...document.querySelectorAll('#todaySection .ch-add-b')].find(b => /Друго лекарство/.test(b.textContent))", 300); await изр("window.__редИд = 'drugo', 1");
  const др0 = await изр("({ има: !!__П.ред(), вид: __П.ls('bl_chas_vidimi') })"); await изр('window.refreshToday(), 1'); await пауза(400); await изр(ПОМОЩ);
  пров('час-22 „Друго лекарство“ се добавя и остава след пререндер', др0.има && Array.isArray(др0.вид) && др0.вид.includes('drugo') && await изр('!!__П.ред()'), др0, 'редът е тук и след refreshToday');
  if (await изр("(() => { const b = [...document.querySelectorAll('#todaySection .ch-add-b')].find(b => /Друго лекарство/.test(b.textContent)); if (!__П.ред() && b) b.click(); return !!__П.ред(); })()")) {
    await натисни(); const др = await изр("({ h: __П.ред().querySelector('input[aria-label=\"На колко часа\"]').value, m: __П.ред().querySelector('input[aria-label=\"Най-много дози за 24 часа\"]').value, бел: __П.т(__П.ред().querySelector('.ch-set-warn')), потв: " + ПОТВ + " ? " + ПОТВ + ".getBoundingClientRect().height : 0 })");
    console.log('  ℹ️ Друго лекарство (без начални числа): ' + JSON.stringify(др));
    if (др.потв) { await клик(ПОТВ); console.log('  ℹ️ … „Така е на кутията“ при празни полета записва: ' + JSON.stringify(await изр("__П.ls('bl_chas_nastr')")) + ' · бележка: ' + await бележка()); }
    await пишиПоле('Най-много дози за 24 часа', '2'); for (let k = 0; k < 3; k++) await цък("__П.ред().querySelector('button.ch-hit')");
    console.log('  ℹ️ … записан само таван 2, дадени 3 дози: ' + await изр("__П.т(__П.ред().querySelector('.ch-pod'))"));
    await пишиПоле('На колко часа', '6'); console.log('  ℹ️ … и интервал 6: ' + await изр("__П.т(__П.ред().querySelector('.ch-pod'))"));
  }
  await изр("localStorage.removeItem('bl_chas_vidimi'); 1"); await чистРед('nurofen');
  await изр("localStorage.removeItem('bl_chas'); localStorage.removeItem('bl_chas_nastr'); refreshToday(); 1");

  // ═══════════ 2 · РАЗХОДИТЕ ПО МЕСЕЦИ ═══════════
  console.log('\n📊 РАЗХОДИТЕ ПО МЕСЕЦИ');
  await отвори('Инструменти');
  const Е = "__П.к('Инструменти|Разходите по месеци')";
  const ВХ = Е + ".querySelector('input[aria-label=\"Колко евро\"]')", ПЛЮС = Е + ".querySelector('button[aria-label=\"Добави разхода\"]')";
  const снимкаЕ = () => изр(`({ say: __П.т(${Е}.querySelector('.sp-say')), sayVid: !${Е}.querySelector('.sp-say').hidden, v: [...${Е}.querySelectorAll('.sp-bar .sp-v')].map(__П.т), cats: __П.т(${Е}.querySelector('.sp-cats-sum')), verd: __П.т(${Е}.querySelector('.sp-verd')), мах: __П.т(__П.бут(${Е}, '↩ Махни последния')), празно: /Записвай каквото похарчиш/.test(${Е}.textContent), ls: __П.ls('bl_spend') })`);
  пров('раз-1 картата е тук, празна', await изр(`!!${Е} && /Записвай каквото похарчиш/.test(${Е}.textContent)`), await изр(`!!${Е}`), 'карта + „Записвай каквото похарчиш…“');
  await цък(ПЛЮС); let р = await снимкаЕ();
  пров('раз-2 празно поле + → „Напиши колко евро…“, нищо не се пише', р.sayVid && р.say === 'Напиши колко евро — само число, по-голямо от нула.' && !(р.ls && р.ls.length), р, 'Напиши колко евро — само число, по-голямо от нула.');
  const вл = await пиши(ВХ, '12,50'); await цък(ПЛЮС); р = await снимкаЕ();
  пров('раз-3 „12,50“ → 12.5 € (поле: ' + вл + ')', р.ls && р.ls.length === 1 && р.ls[0].v === 12.5 && р.ls[0].k === 'pel' && р.say === '✔ Записах 12.5 € за „Пелени“ днес.' && р.verd === 'Средно: 13 €/месец. За 1 месец: 13 €.' && р.мах === '↩ Махни последния (12.5 €)', р, '12.5 · Средно: 13 €/месец. За 1 месец: 13 €. · ↩ Махни последния (12.5 €)');
  await пиши(ВХ, '30'); await цък(ПЛЮС); р = await снимкаЕ();
  пров('раз-4 +30 → 43 (42.5)', р.verd === 'Средно: 43 €/месец. За 1 месец: 43 €.' && р.cats === '💧 43' && р.мах === '↩ Махни последния (30 €)', р, 'Средно: 43 · 💧 43 · (30 €)');
  await цък(Е + ".querySelector('button.sp-cat[aria-label=\"Мляко\"]')"); await пиши(ВХ, '7.25'); await цък(ПЛЮС); р = await снимкаЕ();
  пров('раз-5 Мляко 7.25 → 50 (49.75), „💧 43 · 🍼 7“', р.verd === 'Средно: 50 €/месец. За 1 месец: 50 €.' && р.cats === '💧 43 · 🍼 7' && р.say === '✔ Записах 7.25 € за „Мляко“ днес.', р, 'Средно: 50 · 💧 43 · 🍼 7');
  await цък(`__П.бут(${Е}, '↩ Махни последния')`); let мт = await модал(); р = await снимкаЕ();
  пров('раз-6 махни последния → пита за 7.25 €, остава 43', мт === 'Да махна ли последния записан разход — 7.25 €?' && р.verd === 'Средно: 43 €/месец. За 1 месец: 43 €.' && р.ls.length === 2 && р.мах === '↩ Махни последния (30 €)', { модал: мт, ...р }, 'модал за 7.25 € · Средно: 43 · (30 €)');
  await цък(`__П.бут(${Е}, '↩ Махни последния')`); await модал('.bl-ui-cancel'); р = await снимкаЕ();
  пров('раз-7 „Остави“ не маха нищо', р.ls.length === 2, р.ls, '2 записа');
  await цък(`__П.бут(${Е}, '↩ Махни последния')`); await модал(); await цък(`__П.бут(${Е}, '↩ Махни последния')`); await модал(); р = await снимкаЕ();
  пров('раз-8 махнати всички → празно, без бутон за махане', р.празно && !р.мах && Array.isArray(р.ls) && р.ls.length === 0, р, 'празно, bl_spend = []');
  await пиши(ВХ, '100001'); await цък(ПЛЮС); р = await снимкаЕ();
  пров('раз-9 100001 € → отказ', /Толкова голямо число/.test(р.say || '') && р.ls.length === 0, р, 'Толкова голямо число…');
  // ПОДОЗРЕНИЕ: категориите се закръглят поотделно → не се връзват с общото
  await цък(Е + ".querySelector('button.sp-cat[aria-label=\"Пелени\"]')"); await пиши(ВХ, '2.5'); await цък(ПЛЮС);
  await цък(Е + ".querySelector('button.sp-cat[aria-label=\"Мляко\"]')"); await пиши(ВХ, '3.5'); await цък(ПЛЮС); р = await снимкаЕ();
  const сумаКат = (р.cats || '').match(/\d+/g) ? р.cats.match(/\d+/g).reduce((s, x) => s + +x, 0) : null;
  пров('раз-10 2.50 Пелени + 3.50 Мляко: редът по категории = общото (6 €)', сумаКат === 6 && /Средно: 6 €/.test(р.verd || ''), { cats: р.cats, сумаКат, verd: р.verd, бар: р.v }, 'категориите да дават 6, колкото общото');
  await цък(`__П.бут(${Е}, '↩ Махни последния')`); await модал(); await цък(`__П.бут(${Е}, '↩ Махни последния')`); await модал();
  await пиши(ВХ, '0,004'); await цък(ПЛЮС); р = await снимкаЕ();
  пров('раз-11 0,004 € не се записва като 0 €', !(р.ls && р.ls.length && р.ls[р.ls.length - 1].v === 0), { say: р.say, ls: р.ls }, 'отказ или поне не „Записах 0 €“');
  if (р.ls && р.ls.length) { await цък(`__П.бут(${Е}, '↩ Махни последния')`); await модал(); }

  // ═══════════ 3 · КАСИЧКА-ЦЕЛ ═══════════
  console.log('\n🐷 КАСИЧКА-ЦЕЛ');
  const Г = '__П.кас()';
  const снимкаГ = () => изр(`(() => { const g = ${Г}; if (!g) return null; const подс = [...g.querySelectorAll('p.jr-hint')].map(__П.т); return { txt: __П.т(g.querySelector('.gl-txt')), подс, note: __П.т(g.querySelector('.cs-note')), undoVid: !!(__П.бут(g, '↩ Върни последното') && !__П.бут(g, '↩ Върни последното').hidden), blkey: g.getAttribute('data-blkey'), fold: !!g.querySelector('.fold-btn'), ls: __П.ls('bl_goal') }; })()`);
  пров('цел-1 картата е тук, с „Започни касичката 🐷“', await изр(`!!${Г} && !!__П.бут(${Г}, 'Започни касичката')`), await изр(`!!${Г}`), 'карта с бутон');
  await цък(`__П.бут(${Г}, 'Започни касичката')`); let г = await снимкаГ();
  пров('цел-2 празно → „За какво събирате?…“', г.подс.some(т => т === 'За какво събирате? Напиши го с твои думи. 🐷') && !г.ls, г, 'За какво събирате? Напиши го с твои думи. 🐷');
  await пиши(Г + ".querySelector('input[placeholder^=\"за какво събираме\"]')", 'столче за кола'); await цък(`__П.бут(${Г}, 'Започни касичката')`); г = await снимкаГ();
  пров('цел-3 без сума → „Напиши и колко евро…“', г.подс.some(т => т === 'Напиши и колко евро са нужни (само число). 🐷'), г.подс, 'Напиши и колко евро са нужни (само число). 🐷');
  await пиши(Г + ".querySelector('input[placeholder^=\"колко € са нужни\"]')", '0'); await цък(`__П.бут(${Г}, 'Започни касичката')`); г = await снимкаГ();
  пров('цел-4 сума 0 → „Сумата трябва да е над нула.“', г.подс.some(т => т === 'Сумата трябва да е над нула. 🐷') && !г.ls, г.подс, 'Сумата трябва да е над нула. 🐷');
  await пиши(Г + ".querySelector('input[placeholder^=\"колко € са нужни\"]')", '300'); await цък(`__П.бут(${Г}, 'Започни касичката')`, 400); г = await снимкаГ();
  пров('цел-5 300 € → „0 / 300 € · 0%“, „Остават 300 €.“', г && г.txt === '0 / 300 € · 0%' && г.подс.includes('Остават 300 €.') && г.ls && г.ls.target === 300 && г.ls.saved === 0 && г.ls.n === 'столче за кола', г, '0 / 300 € · 0% · Остават 300 €.');
  пров('цел-6 новата карта пак има ▾/📍 (сгъване, като всички карти)', г && г.fold && !!г.blkey, { blkey: г && г.blkey, fold: г && г.fold }, 'data-blkey + .fold-btn');
  await цък(`__П.бут(${Г}, '+5 €')`); г = await снимкаГ();
  пров('цел-7 +5 → „5 / 300 € · 2%“, „Остават 295 €.“, „Върни“ видим', г.txt === '5 / 300 € · 2%' && г.подс.includes('Остават 295 €.') && г.ls.saved === 5 && г.undoVid, г, '5 / 300 € · 2% · Остават 295 €.');
  await цък(`__П.бут(${Г}, '↩ Върни последното')`); г = await снимкаГ();
  пров('цел-8 „Върни последното“ → 0 / 300', г.txt === '0 / 300 € · 0%' && г.ls.saved === 0 && !г.undoVid, г, '0 / 300 € · 0%');
  await цък(`__П.бут(${Г}, '+5 €')`);
  // фактът в чата на помощничката
  const чат = async () => { await отвори('Инструменти'); await цък("document.querySelector('#roTabs [data-tab=\"chat\"]')"); await пауза(2600); return изр("[...document.querySelectorAll('#roChat .msg.bot .msg-bubble')].map(b => ({ т: __П.т(b), h: b.innerHTML })).filter(x => /Касичка/.test(x.т))"); };
  let ч1 = await чат();
  пров('цел-9 чатът: „Касичката „столче за кола“: 5/300 €…“', ч1.length && ч1[0].т.includes('Касичката „столче за кола“: 5/300 €'), ч1, 'Касичката „столче за кола“: 5/300 € — пълни се! 🐷');
  await изр("localStorage.setItem('bl_goal', JSON.stringify({ n: 'столче за кола', target: 300, saved: 295 })), 1"); await отвори('Инструменти');
  await цък(`__П.бут(${Г}, '+5 €')`, 400); г = await снимкаГ();
  пров('цел-10 295 + 5 → „300 / 300 € · 100%“, „Събрахте ги! 🎉“', г.txt === '300 / 300 € · 100%' && г.подс.includes('Събрахте ги! 🎉'), г, '300 / 300 € · 100% · Събрахте ги! 🎉');
  ч1 = await чат();
  пров('цел-11 чатът след събраната цел не казва „пълни се“', ч1.length && !/пълни се/.test(ч1[0].т), ч1, 'нещо като „събрахте ги“, не „пълни се!“');
  await изр("localStorage.setItem('bl_goal', JSON.stringify({ n: '<b>X</b>', target: 300, saved: 5 })), 1");
  ч1 = await чат();
  пров('цел-12 името в чата се показва като текст (не като HTML)', ч1.length && !/<b>X<\/b>/.test(ч1[0].h), ч1, '„&lt;b&gt;X&lt;/b&gt;“ като текст');
  await изр("MamaHelper.showTab ? MamaHelper.showTab('room') : document.querySelector('#roTabs .ro-tab[data-tab=\"room\"]').click(), 1"); await пауза(300);
  await изр("localStorage.setItem('bl_goal', JSON.stringify({ n: 'столче за кола', target: 300, saved: 5 })), 1"); await отвори('Инструменти');
  await цък(`__П.бут(${Г}, '↺ нова цел')`); мт = await модал(); г = await снимкаГ();
  пров('цел-13 „↺ нова цел“ → пита и нулира, ▾/📍 остават', мт === 'Нова касичка? Старата се нулира.' && г && !г.txt && г.fold && !!г.blkey && await изр(`!!__П.бут(${Г}, 'Започни касичката')`) && (await изр("localStorage.getItem('bl_goal')")) === 'null',{ модал: мт, ...г }, 'модал + празна форма, bl_goal null');

  // ═══════════ 4 · ДНЕВНИКЪТ: хранене, пелени, сън, мл, кръгът (Моето бебе) ═══════════
  console.log('\n🍼 ДНЕВНИКЪТ (Моето бебе)');
  await отвори('Моето бебе');
  const Х = "__П.к('Моето бебе|Кога яде за последно')", П = "__П.к('Моето бебе|Пелени днес')", С = "__П.к('Моето бебе|Сънят днес')", М = "__П.к('Моето бебе|Изпито днес')", К = "__П.к('Моето бебе|Денят на един кръг')";
  пров('днев-0 петте карти са тук', await изр(`[${Х},${П},${С},${М},${К}].every(Boolean)`), await изр(`[${Х},${П},${С},${М},${К}].map(Boolean)`), [true, true, true, true, true]);
  пров('днев-1 кръгът е празен преди записи', await изр(`!!${К}.querySelector('.bb-clockempty')`), await изр(`__П.т(${К}.querySelector('.bb-clockbox'))`), 'Още няма записи за днес…');
  await цък(`__П.бут(${Х}.querySelector('.jr-quick'), '🤱 Ляво')`);
  let х = await изр(`({ f: __П.т(${Х}.querySelector('p.bb-feed')), log: __П.ls('bl_feedlog'), feed: __П.ls('bl_feed') })`);
  пров('днев-2 хранене „Ляво“ → „Последно (лявата гърда) преди 0 мин.“', х.f === 'Последно (лявата гърда) преди 0 мин.' && х.feed && х.feed.s === 'left' && х.log.length === 1, х, 'Последно (лявата гърда) преди 0 мин.');
  await цък(`__П.бут(${Х}.querySelector('.jr-quick'), '🍼 Шише')`);
  х = await изр(`({ f: __П.т(${Х}.querySelector('p.bb-feed')), undo: (() => { const b = [...${Х}.querySelectorAll(':scope > button.jr-chip')].find(b => !b.hidden); return b ? __П.т(b) : null; })(), log: __П.ls('bl_feedlog') })`);
  пров('днев-3 „Шише“ → „Последно (шише)…“ + „↺ Върни предишното…“', х.f === 'Последно (шише) преди 0 мин.' && /^↺ Върни предишното \(лявата гърда, преди 0 мин\)$/.test(х.undo || '') && х.log.length === 2, х, 'Последно (шише) · ↺ Върни предишното (лявата гърда, преди 0 мин)');
  await цък(`[...${Х}.querySelectorAll(':scope > button.jr-chip')].find(b => !b.hidden)`);
  х = await изр(`({ f: __П.т(${Х}.querySelector('p.bb-feed')), log: __П.ls('bl_feedlog'), feed: __П.ls('bl_feed') })`);
  пров('днев-4 „Върни предишното“ → пак лявата, логът 1', х.f === 'Последно (лявата гърда) преди 0 мин.' && х.feed.s === 'left' && х.log.length === 1, х, 'Последно (лявата гърда) · лог 1');
  пров('днев-5 кръгът показва храненето', await изр(`!${К}.querySelector('.bb-clockempty') && !!${К}.querySelector('circle[fill="#e56ba4"]')`), await изр(`__П.т(${К}.querySelector('.bb-clockbox'))`), 'кръг с точка за храненето');
  await цък(`${П}.querySelector('button[aria-label="Едно повече: мокри"]')`); await цък(`${П}.querySelector('button[aria-label="Едно повече: мокри"]')`);
  await цък(`${П}.querySelector('button[aria-label="Едно повече: каки"]')`); await цък(`${П}.querySelector('button[aria-label="Едно по-малко: каки"]')`); await цък(`${П}.querySelector('button[aria-label="Едно по-малко: каки"]')`);
  const пл = await изр(`({ м: __П.т(${П}.querySelector('[aria-label="мокри днес"]')), к: __П.т(${П}.querySelector('[aria-label="каки днес"]')), ls: __П.ls('bl_diapers')[__П.днес()] })`);
  пров('днев-6 пелени: 2 мокри, каки +1 −1 −1 = 0', пл.м === '2' && пл.к === '0' && пл.ls.wet === 2 && пл.ls.dirty === 0, пл, { м: '2', к: '0' });
  await цък(`${С}.querySelector(':scope > button.jr-btn')`);
  let с = await изр(`({ b: __П.т(${С}.querySelector(':scope > button.jr-btn')), win: __П.т(${С}.querySelector('.bb-sleepwin')), open: (__П.ls('bl_sleep') || {}).open })`);
  пров('днев-7 „Заспа“ → „Събуди се“, Алекс спи вече 0м', с.b === '🌅 Събуди се' && /Алекс спи вече 0м/.test(с.win || '') && !!с.open, с, '🌅 Събуди се · 🌙 Алекс спи вече 0м · дрямките обикновено са ~60–120 мин');
  await цък(`${С}.querySelector(':scope > button.jr-btn')`);
  с = await изр(`({ b: __П.т(${С}.querySelector(':scope > button.jr-btn')), out: __П.т([...${С}.querySelectorAll('p.bb-feed')].pop()), ls: __П.ls('bl_sleep') })`);
  пров('днев-8 събуди се след <20 s → не се записва', с.b === '😴 Заспа' && /^Само \d+ сек — не го записах/.test(с.out || '') && с.ls.segs.length === 0, с, 'Само N сек — не го записах…');
  await изр(`(() => { localStorage.setItem('bl_sleep', JSON.stringify({ d: __П.днес(), segs: [], open: Date.now() - 30 * 60000 })); return 1; })()`);
  await цък(`${М}.querySelector('.jr-quick') && __П.бут(${М}.querySelector('.jr-quick'), '+30 мл')`); await цък(`__П.бут(${М}.querySelector('.jr-quick'), '+120 мл')`);
  let мл = await изр(`({ big: __П.т(${М}.querySelector('.ml-big')), ls: __П.ls('bl_ml') })`);
  пров('днев-9 мл: +30 +120 = 150 мл днес', мл.big === '150 мл днес' && мл.ls.n === 150, мл, '150 мл днес');
  await цък(`__П.бут(${М}.querySelector('.jr-quick'), '↺ Нулирай')`); мт = await модал();
  мл = await изр(`({ big: __П.т(${М}.querySelector('.ml-big')), note: __П.т(${М}.querySelector('.ml-note')) })`);
  пров('днев-10 мл: нулирай → 0 и „↩️ Върни 150 мл“', мт === 'Нулиране на днешните милилитри?' && мл.big === '0 мл днес' && /Върни 150 мл/.test(мл.note || ''), { модал: мт, ...мл }, '0 мл днес · ↩️ Върни 150 мл');
  await цък(`__П.бут(${М}.querySelector('.ml-note'), '↩️ Върни')`);
  мл = await изр(`({ big: __П.т(${М}.querySelector('.ml-big')), ls: __П.ls('bl_ml') })`);
  пров('днев-11 мл: върни → 150', мл.big === '150 мл днес' && мл.ls.n === 150, мл, '150 мл днес');
  // сънят 30 мин (заложен отворен преди 30 мин) — стаята се отваря наново, за да го прочете
  await отвори('Моето бебе');
  с = await изр(`({ b: __П.т(${С}.querySelector(':scope > button.jr-btn')) })`);
  await цък(`${С}.querySelector(':scope > button.jr-btn')`);
  с = { преди: с.b, ...(await изр(`({ b: __П.т(${С}.querySelector(':scope > button.jr-btn')), out: __П.т([...${С}.querySelectorAll('p.bb-feed')].pop()), ls: __П.ls('bl_sleep') })`)) };
  пров('днев-12 сън 30 мин → „Днес: 0 ч 30 мин“ (или 29)', с.преди === '🌅 Събуди се' && /^Днес: 0 ч (29|30) мин/.test(с.out || '') && с.ls.segs.length === 1, с, 'Днес: 0 ч 30 мин');

  // ═══════════ 5 · ТЕГЛО / РАСТЕЖ ═══════════
  console.log('\n⭐ ТЕГЛОТО И РАСТЕЖЪТ');
  const W = "__П.к('Моето бебе|Калкулатор на растежа')", WТ = W + ".querySelector('.bb-grow > input.jr-word:nth-child(1)')", WВ = W + ".querySelector('.bb-grow > input.jr-word:nth-child(2)')", WБ = W + ".querySelector(':scope > button.jr-btn')";
  const снимкаW = () => изр(`({ res: __П.т(${W}.querySelector('.bb-res')), dir: __П.т(${W}.querySelector('.bb-dir')), редове: [...${W}.querySelectorAll('.bb-hist .bb-histrow')].map(__П.т), линия: !!${W}.querySelector('.bb-chartbox polyline[stroke-dasharray]'), точки: ${W}.querySelectorAll('.bb-chartbox circle.bb-pt').length, ls: __П.ls('bl_growth'), rz: __П.т(document.querySelector('section.pl-rz .pl-rz-lv')) })`);
  пров('рас-1 картата е тук, възрастта е попълнена с 4', (await изр(`${WВ} && ${WВ}.value`)) === '4', await изр(`${WВ} && ${WВ}.value`), '4');
  await изр(`(() => { ${WТ}.value = ''; return 1; })()`); await цък(WБ); let w = await снимкаW();
  пров('рас-2 без тегло → „Въведи тегло в кг 😊“', w.res === 'Въведи тегло в кг 😊', w.res, 'Въведи тегло в кг 😊');
  await пиши(WТ, '3200'); await цък(WБ); w = await снимкаW();
  пров('рас-3 3200 → „…голям юнак…“', /3200 кг е тегло на голям юнак/.test(w.res || '') && !w.ls, w.res, 'Хм, 3200 кг е тегло на голям юнак…');
  await пиши(WТ, '0,3'); await цък(WБ); w = await снимкаW();
  пров('рас-4 0,3 → „изглежда като грамове“', /изглежда като грамове/.test(w.res || ''), w.res, 'Това изглежда като грамове…');
  await пиши(WТ, '7'); await пиши(WВ, '25'); await цък(WБ); w = await снимкаW();
  пров('рас-5 възраст 25 → отказ', w.res === 'Възрастта е между 0 и 24 месеца.' && !w.ls, w.res, 'Възрастта е между 0 и 24 месеца.');
  await пиши(WВ, '4'); await цък(WБ, 1000); w = await снимкаW();
  пров('рас-6 7 кг / 4 мес → 50-ия персентил, 1 ред', /около 50-ия персентил/.test(w.res || '') && w.редове.length === 1 && w.ls.length === 1 && w.ls[0].p === 50, w, 'около 50-ия персентил · 1 ред');
  пров('рас-7 изречението след точката започва с главна буква', !/\. [а-я]/.test((w.res || '').split('персентил')[1] || ''), w.res, '„…на тази възраст. Точно в милото средно.“');
  await пиши(WТ, '7,5'); await цък(WБ, 1000); w = await снимкаW();
  пров('рас-8 7,5 кг в същия ден → 72-ия, ЗАМЕНЯ днешния ред (1 ред)', /около 72-ия персентил/.test(w.res || '') && w.редове.length === 1 && w.ls.length === 1 && w.ls[0].w === 7.5, w, '72-ия · 1 ред (7.5)');
  пров('рас-9 панелът „Моите измервания“: 7,5 кг', w.rz === '7,5 кг', w.rz, '7,5 кг');
  // мерене от предишен ден → посоката; повторно натискане не дублира
  await изр(`(() => { localStorage.setItem('bl_growth', JSON.stringify([{ d: '2026-10-21', m: 3, w: 7.0, p: 65 }].concat(__П.ls('bl_growth')))); return 1; })()`);
  await цък(WБ, 1000); w = await снимкаW();
  пров('рас-10 спрямо 7,0 кг от 21.10 → „Качи 500 г“, 2 реда, пунктир', /^Качи 500 г/.test(w.dir || '') && w.редове.length === 2 && w.линия, w, 'Качи 500 г… · 2 реда · пунктир');
  await цък(WБ, 1000); w = await снимкаW();
  пров('рас-10б пак „Изчисли“ със същото → пак 2 реда, посоката пак спрямо 21.10', w.редове.length === 2 && /^Качи 500 г/.test(w.dir || ''), { редове: w.редове, dir: w.dir }, '2 реда · Качи 500 г');
  // старо мерене (друга възраст), въведено в същия ден, НЕ трие днешното
  await пиши(WТ, '6,4'); await пиши(WВ, '2'); await цък(WБ, 1000); w = await снимкаW();
  пров('рас-10в старо мерене (2 мес), въведено днес, се добавя, не заменя', w.редове.length === 3 && w.ls.some(h => h.m === 4 && h.w === 7.5) && w.ls.some(h => h.m === 2 && h.w === 6.4), w.ls, '3 реда: 7.0@3, 7.5@4, 6.4@2');
  // махане на последния ред (✕ с най-голям data-i)
  const махниПосл = async () => { await цък(`[...${W}.querySelectorAll('.bb-hist button.bb-del')].sort((a, b) => b.dataset.i - a.dataset.i)[0]`); return модал(); };
  while ((await изр(`__П.ls('bl_growth').length`)) > 1) { мт = await махниПосл(); }
  w = await снимкаW();
  пров('рас-11 махнато до 7 кг: историята 1 ред, панелът 7,0 кг', w.редове.length === 1 && w.ls.length === 1 && w.rz === '7,0 кг', { модал: мт, ...w }, '1 ред · 7,0 кг');
  пров('рас-12 след махането графиката и текстът не показват махнатото', !w.линия && !/72-ия/.test(w.res || '') && !/качи 500 г/i.test(w.dir || ''),{ res: w.res, dir: w.dir, линия: w.линия, точки: w.точки }, 'без пунктира и без „72-ия… качи 500 г“');
  // Ръст и главичка
  const L = "__П.к('Моето бебе|Ръст и главичка')", LС = L + ".querySelectorAll(':scope > input.jr-word')[0]", LВ = L + ".querySelectorAll(':scope > input.jr-word')[1]", LБ = L + ".querySelector(':scope > button.jr-btn')";
  const снимкаL = () => изр(`({ res: __П.т(${L}.querySelector('.bb-res')), undo: __П.т(${L}.querySelector('.bb-undo')), len: __П.ls('bl_growth_len'), head: __П.ls('bl_growth_head'), гр: !!${L}.querySelector('.bb-chartbox svg') })`);
  пров('рас-13 картата „Ръст и главичка“ е тук, възраст 4', (await изр(`${LВ} && ${LВ}.value`)) === '4', await изр(`${LВ} && ${LВ}.value`), '4');
  await пиши(LС, '7'); await цък(LБ); let л = await снимкаL();
  пров('рас-14 ръст 7 см → извън 30–120', /между 30 и 120 см/.test(л.res || '') && !(л.len && л.len.length), л, 'между 30 и 120 см…');
  await пиши(LС, '65'); await цък(LБ, 600); л = await снимкаL();
  пров('рас-15 ръст 65 → „между 50-ия и 97-ия“, записано', /65 см на 4 м\. — между 50-ия и 97-ия персентил/.test(л.res || '') && л.len && л.len.length === 1 && л.len[0].v === 65 && л.гр, л, 'Алекс: 65 см на 4 м. — между 50-ия и 97-ия…');
  await пиши(LС, '66'); await цък(LБ, 600); л = await снимкаL();
  пров('рас-16 поправка в същия ден (66): 65 не се брои за „предишно мерене“', л.len.length === 1 && л.len[0].v === 66 && !/Предишните мерения на ръста: 65/.test(л.res || ''), л, '1 запис (66), без „Предишните мерения на ръста: 65 см“');
  await цък(`__П.бут(${L}.querySelector('.bb-undo'), '↩️ Отмени записа')`); л = await снимкаL();
  пров('рас-17 „Отмени записа“ след поправката → връща 65 от същия ден', /Върнах предишното мерене за днес \(65 см\)/.test(л.undo || '') && л.len.length === 1 && л.len[0].v === 65, л, '↩️ Върнах предишното мерене за днес (65 см). · bl_growth_len = [65]');
  await изр("localStorage.setItem('bl_growth_len', '[]'), 1"); await пиши(LС, '64'); await цък(LБ, 600);
  await цък(`__П.бут(${L}.querySelector('.bb-undo'), '↩️ Отмени записа')`); л = await снимкаL();
  пров('рас-17б „Отмени записа“ без друго мерене за деня → махнат', /Записът е махнат/.test(л.undo || '') && Array.isArray(л.len) && л.len.length === 0, л, '↩️ Записът е махнат… · bl_growth_len = []');
  await цък(`__П.бут(${L}.querySelector('.jr-quick'), '⭕ Обиколка')`); await пиши(LС, '42'); await цък(LБ, 600); л = await снимкаL();
  пров('рас-18 главичка 42 → в границите, записано', /42 см на 4 м\. — между 50-ия и 97-ия персентил/.test(л.res || '') && л.head && л.head.length === 1 && л.head[0].v === 42, л, 'Алекс: 42 см на 4 м. — между 50-ия и 97-ия…');

  console.log('\nJS грешки на страницата: ' + (грешки.length ? грешки.slice(0, 8).join(' | ') : 'няма'));
  рез.push({ ид: 'js-грешки', добре: !грешки.length, получено: грешки.slice(0, 8), очаквано: [] });
  await send('Page.captureScreenshot', { format: 'png' }).then(р => { if (арг.snimka) fs.writeFileSync(арг.snimka, Buffer.from(р.result.data, 'base64')); });
  край(0);
})().catch(e => { console.log('🔴 СРИВ НА ПРОБАТА: ' + (e && e.stack || e)); process.exit(4); });
