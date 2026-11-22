// ⏱️ БЪРЗИНАТА НА ОТГОВОРА НА СЛАБ ТЕЛЕФОН (17.11.2026)
// CPU ×4 (Emulation.setCPUThrottlingRate) СЛЕД като знанието (KB) е заредено. 40 въпроса от
// dev/korpus350.json, по 10/14/6/10 от SPESHNO/VUPROS/KARTA/NEVINNO, през MamaHelper.ask в своята стая.
// За всеки въпрос:
//   синхр  = колко трае самото ask() (присъдата на вратите + addMsg на мама + typing)
//   театър = умишленото „пише…“: 0 при тревога, иначе 550 + rnd·500 → тук rnd = 0 (Math.random
//            е подменен САМО за синхронното ask()), значи точно 550
//   видим  = от ask() до първото .msg.bot (НЕ #roTyping — трите точки също са .msg.bot) в #roChat + 2×rAF (кадърът е нарисуван)
//   смятане = видим − театър ≈ истинската цена на мисленето + рисуването
//   дълги  = longtask-ове (>50 ms) в прозореца на въпроса: брой / най-дълъг
// Отделно: BL_REDFLAG / BL_MOTHERFLAG / BL_PREGFLAG / BL_MATCH поотделно — първо извикване (студено)
// и медиана от 5 топли.
// --bez-teatar : двете умишлени паузи „пише…“ (550–1050 и 250–950 ms) стават 0 САМО по време на мерения въпрос
//   → видим = чистото смятане + рисуване. (setTimeout се подменя за 200–1300 ms до първия балон.)
// --studeno : без студените преки извиквания — ПЪРВИЯТ въпрос през ask() плаща първото строене.
// --profil "въпрос1|въпрос2" : CDP Profiler (интервал 100 µs) върху ask() на тези въпроси →
//   собствено време по функция (име, файл:ред, ms).
// ПУСКАНЕ: node dev/proba/otgovor_skorost_proba.js [--url https://babyland.aaeromove.workers.dev] [--cpu 4]
//          [--n 40] [--profil "…|…"] [--json изход.json]
const { spawn } = require('child_process'); const path = require('path'); const fs = require('fs');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; } }
const АДРЕС = арг.url ? арг.url.replace(/\/?$/, '/') + 'index.html' : 'http://127.0.0.1:' + (арг.port || 8912) + '/index.html';
require('./pazach_zhivo.js')(АДРЕС);   // подменя /api → само местен адрес
const CPU = +(арг.cpu || 4);
const пауза = ms => new Promise(r => setTimeout(r, ms));
// ── изборът на въпросите: равномерно през всеки вид, детерминистично ──
const корпус = require(path.join(__dirname, '..', 'korpus350.json'));
const КВОТА = { SPESHNO: 10, VUPROS: 14, KARTA: 6, NEVINNO: 10 };
let въпроси = [];
if (арг.profil) въпроси = арг.profil.split('|').map(t => { const к = корпус.find(x => x.t === t.trim()); return к || { t: t.trim(), e: '?', r: 'Здраве и SOS' }; });
else for (const [вид, бр] of Object.entries(КВОТА)) { const с = корпус.filter(x => x.e === вид); for (let i = 0; i < бр; i++) въпроси.push(с[Math.floor((i + 0.5) * с.length / бр)]); }
if (арг.n) въпроси = въпроси.slice(0, +арг.n);
въпроси.sort((a, b) => a.r.localeCompare(b.r));
(async () => {
  await require('./slot.js')('chrome');
  const ПРОФИЛ = path.join(__dirname, 'chrome_pr_otg_' + Date.now()); const ПОРТ = 9200 + Math.floor(Math.random() * 700);
  const ch = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=360,800', 'about:blank'], { stdio: 'ignore' });
  const край = к => { try { ch.kill(); } catch (e) {} setTimeout(() => { try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {} process.exit(к); }, 1200); };
  let цел; for (let i = 0; i < 80 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + ПОРТ + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
  if (!цел) { console.log('🔴 Chrome не тръгна'); return край(3); }
  const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let n = 0; const ч = new Map(); const грешки = [];
  const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  ws.onmessage = e => { const м = JSON.parse(e.data); if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); }
    if (м.method === 'Runtime.exceptionThrown') { const d = м.params.exceptionDetails; грешки.push(((d.exception && d.exception.description) || d.text).split('\n')[0]); } };
  const изр = async x => { const р = await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true }); if (р.result && р.result.exceptionDetails) return { __грешка: р.result.exceptionDetails.exception && р.result.exceptionDetails.exception.description }; return р.result && р.result.result ? р.result.result.value : null; };
  const чакай = async (x, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await изр(x)) return Date.now() - t0; await пауза(200); } return -1; };
  await send('Runtime.enable'); await send('Page.enable');
  // 17.11: --staro файл --zamesti js/x.js — този адрес се сервира от файла САМО в браузъра на пробата
  if (арг.staro) {
    const тяло = Buffer.from(fs.readFileSync(арг.staro, 'utf8')).toString('base64'), шаблон = '*' + (арг.zamesti || 'js/lib.js') + '*';
    await send('Network.enable'); await send('Network.setBypassServiceWorker', { bypass: true });
    await send('Fetch.enable', { patterns: [{ urlPattern: шаблон, requestStage: 'Request' }] });
    ws.addEventListener('message', e => { const м = JSON.parse(e.data); if (м.method === 'Fetch.requestPaused') send('Fetch.fulfillRequest', { requestId: м.params.requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'application/javascript; charset=utf-8' }, { name: 'Cache-Control', value: 'no-store' }], body: тяло }); });
    console.log('  ⚠ ПОДМЕНЕН ' + шаблон + ' ← ' + арг.staro);
  }
  await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 800, deviceScaleFactor: 2, mobile: true });
  if (арг['cpu-rano']) await send('Emulation.setCPUThrottlingRate', { rate: CPU });   // 17.11: и загряването тече ×N
  await send('Page.navigate', { url: АДРЕС }); await пауза(2500);
  await изр(`(() => { localStorage.clear(); const s = (k, v) => localStorage.setItem(k, JSON.stringify(v)); s('bl_onboarded', true); localStorage.setItem('bl_tour_done','1'); s('bl_hero_toured', true); s('bl_baby', { name: 'Алекс', birth: '2026-07-19', sex: 'boy' }); return 1; })()`);
  await send('Page.reload');
  if (await чакай("!document.getElementById('blSplash') && !!window.MamaHelper && !!window.KB && !!window.BL_MATCH", 120000) < 0) { console.log('🔴 началото/знанието не излезе'); return край(2); }
  await пауза(+(арг.chakai || 3000));
  // медальончета и други покани отгоре — махаме ги
  for (let i = 0; i < 8 && await изр("!!document.querySelector('.md-veil')"); i++) { await изр("(document.querySelector('.md-veil .md-ok')||{click(){}}).click(); 1"); await пауза(600); }
  await send('Emulation.setCPUThrottlingRate', { rate: CPU });
  console.log('CPU ×' + CPU + ' · ' + АДРЕС + ' · въпроси ' + въпроси.length);
  // ── вратите поотделно, СТУДЕНО: първото извикване на всяка (преди всякакъв въпрос) ──
  const ФУН = `{ red: t => BL_REDFLAG(t), mother: (t, r) => BL_MOTHERFLAG(t, r), preg: (t, r) => BL_PREGFLAG(t, r), lib: (t, r) => BL_LIB.search(t, r, 3), match: (t, r) => BL_MATCH(t, r) }`;
  const студено = арг.studeno ? '(прескочено: първият въпрос плаща студеното)' : await изр(`(() => { const Ф = ${ФУН}; const о = {}; const q = ${JSON.stringify(въпроси[0].t)}, r = ${JSON.stringify(въпроси[0].r)};
    for (const к in Ф) { const t0 = performance.now(); try { Ф[к](q, r); } catch (e) {} о[к] = +(performance.now() - t0).toFixed(1); } return о; })()`);
  console.log('СТУДЕНИ първи извиквания (ms): ' + JSON.stringify(студено));
  // инструментите в страницата
  await изр(`(() => { window.__дълги = []; try { new PerformanceObserver(l => l.getEntries().forEach(e => __дълги.push({ t: e.startTime, d: e.duration }))).observe({ type: 'longtask', buffered: false }); } catch (e) {} return 1; })()`);
  const МЕРИ = (q, r) => `new Promise(res => {
    const chat = document.getElementById('roChat'); const преди = chat.querySelectorAll('.msg.bot:not(#roTyping)').length;
    const ст = Math.random; let t0, синхр, бот = null, alarm = false;
    const мо = new MutationObserver(() => { if (бот === null && chat.querySelectorAll('.msg.bot:not(#roTyping)').length > преди) window.setTimeout = стТ; if (бот === null && chat.querySelectorAll('.msg.bot:not(#roTyping)').length > преди) { бот = performance.now(); мо.disconnect();
      requestAnimationFrame(() => requestAnimationFrame(() => { const видим = performance.now() - t0;
        const д = __дълги.filter(x => x.t >= t0 - 1); res({ синхр, видим, мут: бот - t0, alarm, дълги: д.length, найДълъг: д.reduce((m, x) => Math.max(m, x.d), 0) }); })); } });
    мо.observe(chat, { childList: true, subtree: true });
    const стТ = window.setTimeout; if (${арг['bez-teatar'] ? 'true' : 'false'}) window.setTimeout = (ф, д, ...р) => стТ(ф, (д >= 200 && д <= 1300) ? 0 : д, ...р);
    Math.random = () => 0; t0 = performance.now();
    try { MamaHelper.ask(${JSON.stringify(q)}); } finally { Math.random = ст; }
    синхр = performance.now() - t0;
    // присъдата за театъра — СЛЕД ask(), за да не стопли вратите преди часовника
    try { alarm = !!BL_MOTHERFLAG(${JSON.stringify(q)}, ${JSON.stringify(r)}) || !!BL_PREGFLAG(${JSON.stringify(q)}, ${JSON.stringify(r)}) || !!BL_REDFLAG(${JSON.stringify(q)}); } catch (e) {}
    setTimeout(() => { if (бот === null) { мо.disconnect(); res({ синхр, видим: -1, alarm }); } }, 15000);
  })`;
  const ГОТОВО = r => `(() => { const ov = document.getElementById('roomOverlay'); return ov && !ov.hidden && !!document.getElementById('roChat'); })()`;
  const рез = []; let стая = null;
  if (арг.profil) { await send('Profiler.enable'); await send('Profiler.setSamplingInterval', { interval: 100 }); }
  const профили = [];
  for (const в of въпроси) {
    if (в.r !== стая) {
      if (стая) { await изр("MamaHelper.close(); 1"); await пауза(1500); }
      await изр(`MamaHelper.open(${JSON.stringify(в.r)}); 1`);
      if (await чакай(ГОТОВО(в.r), 20000) < 0) { console.log('🔴 стаята ' + в.r + ' не се отвори'); continue; }
      await пауза(2500); await изр("MamaHelper.showTab('chat'); 1"); await пауза(1200); стая = в.r;
    }
    if (арг.profil) await send('Profiler.start');
    const м = await изр(МЕРИ(в.t, в.r));
    // изчакваме опашката (follow-up съобщения до ~1,7 s) да утихне, за да не се смеси със следващия
    await пауза(арг.profil ? 2500 : 2200);
    if (арг.profil) { const п = await send('Profiler.stop'); профили.push({ q: в.t, профил: п.result.profile }); }
    // вратите поотделно, ТОПЛО: медиана от 5
    const врати = await изр(`(() => { const Ф = ${ФУН}; const о = {}; const q = ${JSON.stringify(в.t)}, r = ${JSON.stringify(в.r)};
      for (const к in Ф) { const т = []; for (let i = 0; i < 5; i++) { const t0 = performance.now(); try { Ф[к](q, r); } catch (e) {} т.push(performance.now() - t0); } т.sort((a, b) => a - b); о[к] = +т[2].toFixed(2); } return о; })()`);
    if (!м || м.__грешка) { console.log('🔴 ' + в.t + ' → ' + JSON.stringify(м)); continue; }
    const театър = (м.alarm || арг['bez-teatar']) ? 0 : 550;
    рез.push({ ...в, ...м, театър, смятане: м.видим < 0 ? -1 : м.видим - театър, врати });
    console.log((м.alarm ? '🚨' : '  ') + ' ' + в.e.padEnd(7) + ' видим ' + String(Math.round(м.видим)).padStart(5) + ' · смятане ' + String(Math.round(м.видим - театър)).padStart(4) + ' · синхр ' + String(Math.round(м.синхр)).padStart(4) + ' · дълги ' + м.дълги + '/' + Math.round(м.найДълъг) + ' · red ' + врати.red + ' mother ' + врати.mother + ' preg ' + врати.preg + ' match ' + врати.match + ' lib ' + врати.lib + ' · ' + в.t.slice(0, 50));
  }
  // ── обобщение ──
  const мед = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
  const p90 = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * 0.9))] : 0; };
  const ок = рез.filter(р => р.видим >= 0);
  console.log('\n═══ ОБОБЩЕНИЕ (CPU ×' + CPU + ', ' + ок.length + '/' + въпроси.length + ' с отговор) ═══');
  for (const [и, ф] of [['видим', р => р.видим], ['смятане', р => р.смятане], ['синхр', р => р.синхр]]) { const a = ок.map(ф); console.log('  ' + и.padEnd(8) + ' медиана ' + Math.round(мед(a)) + ' ms · p90 ' + Math.round(p90(a)) + ' · макс ' + Math.round(Math.max(...a))); }
  for (const к of ['red', 'mother', 'preg', 'match', 'lib']) { const a = ок.map(р => р.врати[к]); console.log('  врата ' + к.padEnd(7) + ' медиана ' + мед(a).toFixed(2) + ' ms · p90 ' + p90(a).toFixed(2) + ' · макс ' + Math.max(...a).toFixed(2)); }
  console.log('  тревоги: ' + ок.filter(р => р.alarm).length + ' · смятане при тревога медиана ' + Math.round(мед(ок.filter(р => р.alarm).map(р => р.смятане))) + ' ms');
  console.log('\n  НАЙ-БАВНИТЕ 5 по смятане:'); ок.slice().sort((a, b) => b.смятане - a.смятане).slice(0, 5).forEach(р => console.log('   ' + Math.round(р.смятане) + ' ms · ' + р.e + ' · ' + р.r + ' · „' + р.t + '“'));
  // ── профилите: собствено време по функция ──
  for (const { q, профил } of профили) {
    const възли = new Map(профил.nodes.map(в => [в.id, в])); const себе = new Map();
    for (let i = 0; i < профил.samples.length; i++) себе.set(профил.samples[i], (себе.get(профил.samples[i]) || 0) + (профил.timeDeltas[i] || 0));
    const поФ = new Map(); let общо = 0;
    for (const [id, µs] of себе) { const в = възли.get(id); const cf = в.callFrame; if (cf.functionName === '(idle)' || cf.functionName === '(program)') continue;
      const к = (cf.functionName || '(анонимна)') + ' ' + (cf.url ? cf.url.split('/').pop().split('?')[0] : '') + ':' + (cf.lineNumber + 1); поФ.set(к, (поФ.get(к) || 0) + µs); общо += µs; }
    // обхват по включително време за функциите в helper.js (за да се види КОЯ външна функция събира)
    const родител = new Map(); профил.nodes.forEach(в => (в.children || []).forEach(д => родител.set(д, в.id)));
    const вкл = new Map();
    for (const [id, µs] of себе) { const видени = new Set(); let x = id; while (x !== undefined) { const в = възли.get(x); const cf = в.callFrame;
      const к = (cf.functionName || '(анонимна)') + ' ' + (cf.url ? cf.url.split('/').pop().split('?')[0] : '') + ':' + (cf.lineNumber + 1);
      if (/helper\.js|kb\.js/.test(к) && !видени.has(к)) { видени.add(к); if (!/\(idle\)|\(program\)/.test(възли.get(id).callFrame.functionName)) вкл.set(к, (вкл.get(к) || 0) + µs); } x = родител.get(x); } }
    console.log('\n══ ПРОФИЛ „' + q + '“ · заето (без idle/program) ' + (общо / 1000).toFixed(1) + ' ms');
    console.log('  СОБСТВЕНО време:'); [...поФ].sort((a, b) => b[1] - a[1]).slice(0, 15).forEach(([к, µs]) => console.log('   ' + (µs / 1000).toFixed(1).padStart(7) + ' ms  ' + к));
    console.log('  ВКЛЮЧИТЕЛНО (helper.js/kb.js):'); [...вкл].sort((a, b) => b[1] - a[1]).slice(0, 15).forEach(([к, µs]) => console.log('   ' + (µs / 1000).toFixed(1).padStart(7) + ' ms  ' + к));
    if (арг.json) fs.writeFileSync(арг.json.replace(/\.json$/, '') + '_' + профили.indexOf(профили.find(п => п.q === q)) + '.cpuprofile', JSON.stringify(профил));
  }
  if (арг.json) fs.writeFileSync(арг.json, JSON.stringify({ CPU, студено, рез }, null, 1));
  console.log('\nJS грешки: ' + (грешки.length ? грешки.slice(0, 5).join(' | ') : 'няма'));
  край(0);
})();
