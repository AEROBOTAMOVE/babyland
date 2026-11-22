// 💬 ЧАТЪТ ВЪВ ВСИЧКИ СТАИ (18.11.2026) — ➤ и чиповете в 9-те стаи, със СТЕКА на всеки необработен отказ.
// Търси стария запис „необработен promise reading 'slice' при ➤ в чата на Лабораторията“ (ЗАДАЧИ.md:600).
// Мама е „вътре“ (/api/* = 200 само в браузъра на пробата). Всяка стая: 12 изречения (обичайни + ръбови) през
// #roForm и до 3 от чиповете ѝ. Записва: отговорила ли е, изключения, console.error, unhandledrejection със стек.
// ПУСКАНЕ: node dev/proba/chat_stai_proba.js [--url https://babyland.aaeromove.workers.dev] [--cpu 4]
const { spawn } = require('child_process'); const path = require('path'); const fs = require('fs');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; } }
const АДРЕС = арг.port ? 'http://127.0.0.1:' + арг.port + '/index.html' : (арг.url || 'https://babyland.aaeromove.workers.dev').replace(/\/?$/, '/') + 'index.html';
require('./pazach_zhivo.js')(АДРЕС);   // подменя /api → само местен адрес
const пауза = ms => new Promise(r => setTimeout(r, ms));
const ИЗРЕЧЕНИЯ = ['здравей', 'какво можеш', '?', '😊', 'ok', 'kak si', 'бебето не диша', '123', 'а', 'кога да спра', '<b>x</b> & "кавички"', 'много дълъг въпрос '.repeat(15).trim()];
(async () => {
  await require('./slot.js')('chrome');
  const ПРОФИЛ = path.join(__dirname, 'chrome_pr_chat_' + Date.now()); const ПОРТ = 9200 + Math.floor(Math.random() * 700);
  const ch = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=360,800', 'about:blank'], { stdio: 'ignore' });
  const край = к => { try { ch.kill(); } catch (e) {} setTimeout(() => { try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {} process.exit(к); }, 1500); };
  let цел; for (let i = 0; i < 80 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + ПОРТ + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
  if (!цел) { console.log('🔴 Chrome не тръгна'); return край(3); }
  const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let n = 0; const ч = new Map(); const грешки = []; let етап = 'старт';
  const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  ws.onmessage = e => { const м = JSON.parse(e.data); if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); }
    if (м.method === 'Runtime.exceptionThrown') { const d = м.params.exceptionDetails; const кд = d.stackTrace && d.stackTrace.callFrames && d.stackTrace.callFrames[0];
      грешки.push('[' + етап + '] ' + ((d.exception && d.exception.description) || d.text).split('\n')[0] + (кд ? ' @ ' + (кд.functionName || '?') + ' ' + кд.url.split('/').pop().split('?')[0] + ':' + (кд.lineNumber + 1) : '')); }
    if (м.method === 'Runtime.consoleAPICalled' && м.params.type === 'error') грешки.push('[' + етап + '] console.error ' + м.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 200));
    if (м.method === 'Fetch.requestPaused') send('Fetch.fulfillRequest', { requestId: м.params.requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }], body: Buffer.from(JSON.stringify({ user: { email: 'proba@example.test', status: 'active', access_until: new Date(Date.now() + 14 * 864e5).toISOString(), proben: true } })).toString('base64') }); };
  const изр = async x => { const р = await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true }); return р.result && р.result.result ? р.result.result.value : null; };
  const чакай = async (x, ms) => { const t = Date.now(); while (Date.now() - t < ms) { if (await изр(x)) return Date.now() - t; await пауза(150); } return -1; };
  await send('Runtime.enable'); await send('Page.enable');
  await send('Fetch.enable', { patterns: [{ urlPattern: '*/api/*', requestStage: 'Request' }] });
  await send('Page.addScriptToEvaluateOnNewDocument', { source: "window.__откази = []; addEventListener('unhandledrejection', e => { try { const r = e.reason; __откази.push(String(r && r.stack || r).slice(0, 700)); } catch (x) {} });" });
  await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 800, deviceScaleFactor: 2, mobile: true });
  if (арг.cpu) await send('Emulation.setCPUThrottlingRate', { rate: +арг.cpu });
  await send('Page.navigate', { url: АДРЕС }); await пауза(2500);
  await изр(`(() => { localStorage.clear(); const s = (k, v) => localStorage.setItem(k, JSON.stringify(v)); s('bl_onboarded', true); localStorage.setItem('bl_tour_done','1'); s('bl_hero_toured', true); s('bl_baby', { name: 'Алекс', birth: '2026-07-19', sex: 'boy' }); return 1; })()`);
  await send('Page.reload');
  if (await чакай("!document.getElementById('blSplash') && !!window.MamaHelper && !!window.KB && document.querySelectorAll('.pl-room[data-room]').length >= 9", 120000) < 0) { console.log('🔴 началото не излезе'); return край(2); }
  await пауза(2000);
  const стаи = JSON.parse(await изр("JSON.stringify([...document.querySelectorAll('.pl-room[data-room]')].map(e => e.dataset.room))"));
  const БОТ = "document.querySelectorAll('#roChat .msg.bot:not(#roTyping)').length";
  const рез = [];
  for (const с of стаи) {
    етап = с; const пред = грешки.length, предО = (await изр('__откази.length')) || 0;
    await изр(`MamaHelper.open(${JSON.stringify(с)}); 1`);
    await чакай("!document.getElementById('roomOverlay').hidden && !!document.getElementById('roForm')", 15000); await пауза(1200);
    for (let i = 0; i < 6 && await изр("!!document.querySelector('.md-veil')"); i++) { await изр("(document.querySelector('.md-veil .md-ok') || { click() {} }).click(); 1"); await пауза(600); }
    await изр("MamaHelper.showTab('chat'); 1"); await пауза(800);
    let отг = 0, пратени = 0;
    for (const и of ИЗРЕЧЕНИЯ) { const преди = await изр(БОТ);
      await изр(`(() => { const i = document.getElementById('roInput'); i.value = ${JSON.stringify(и)}; document.getElementById('roForm').requestSubmit(); return 1; })()`); пратени++;
      const празно = !и.trim();
      if (await чакай(БОТ + ' > ' + преди, празно ? 1500 : 9000) >= 0) отг++; else if (!празно) {} await пауза(1300); }
    // чиповете на стаята (до 3)
    const чипове = (await изр("[...document.querySelectorAll('#roChips button')].filter(b => b.offsetParent).slice(0, 3).map((b, i) => { b.setAttribute('data-proba-chip', i); return b.textContent.trim().slice(0, 30); })")) || [];
    let чипОтг = 0;
    for (let i = 0; i < чипове.length; i++) { const преди = await изр(БОТ); await изр(`(document.querySelector('[data-proba-chip="${i}"]') || { click() {} }).click(); 1`); if (await чакай(БОТ + ' > ' + преди, 9000) >= 0) чипОтг++; await пауза(1300); }
    const нови = грешки.slice(пред); const откази = JSON.parse(await изр('JSON.stringify(__откази.slice(' + предО + '))') || '[]');
    рез.push((нови.length || откази.length ? '🔴 ' : '✅ ') + с + ' · ➤ отговори ' + отг + '/' + пратени + ' (празните „?“/„а“ може да мълчат) · чипове ' + чипОтг + '/' + чипове.length + ' · грешки ' + нови.length + ' · откази ' + откази.length + (нови.length ? '\n     ' + нови.slice(0, 3).join('\n     ') : '') + (откази.length ? '\n     ОТКАЗ: ' + откази.slice(0, 2).join('\n     ОТКАЗ: ') : ''));
    console.log(рез[рез.length - 1]);
    await изр('MamaHelper.close(); 1'); await пауза(1200);
  }
  const всичкиОткази = JSON.parse(await изр('JSON.stringify(__откази)') || '[]');
  console.log('\nОБЩО: стаи ' + стаи.length + ' · грешки ' + грешки.length + ' · необработени откази ' + всичкиОткази.length + (всичкиОткази.some(о => /slice/.test(о)) ? ' · 🔴 ИМА „slice“' : ' · „slice“: няма'));
  край(грешки.length || всичкиОткази.length ? 1 : 0);
})();
