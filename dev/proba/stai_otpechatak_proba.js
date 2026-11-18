// 🧾 ОТПЕЧАТЪК НА СТАИТЕ (18.11.2026): какво има във всяка от 9-те стаи — заглавия на секциите, брой карти/бутони,
// дължина на текста, табове, чипове. За сравнение на два варианта (напр. index.html с и без V2 — 29-те скрипта след
// първия екран): пусни веднъж за всеки и сравни с --sravni a.json b.json.
// Мама е „вътре“ (/api/* = 200 само в браузъра на пробата), минала обиколка и запознаване. Без забавяне.
// ПУСКАНЕ: node dev/proba/stai_otpechatak_proba.js --url <адрес> --izhod a.json
//          node dev/proba/stai_otpechatak_proba.js --sravni a.json b.json [--bez-tekst]  (без дължината на текста — тя мърда сама)
const { spawn } = require('child_process'); const path = require('path'); const fs = require('fs');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; } }
const пауза = ms => new Promise(r => setTimeout(r, ms));
if (арг.sravni) {
  const [fa, fb] = [арг.sravni, process.argv[process.argv.indexOf(арг.sravni) + 1]];
  const A = JSON.parse(fs.readFileSync(fa, 'utf8')), B = JSON.parse(fs.readFileSync(fb, 'utf8'));
  let разлики = 0;
  for (const с of Object.keys(A)) { const a = A[с], b = B[с] || {}; const р = [];
    for (const к of ['карти', 'бутони', 'табове', 'чипове', 'секцииБрой']) if (a[к] !== b[к]) р.push(к + ' ' + a[к] + '→' + b[к]);
    if (!арг['bez-tekst'] && Math.abs((a.текст || 0) - (b.текст || 0)) > 0.02 * (a.текст || 1)) р.push('текст ' + a.текст + '→' + b.текст);
    const само = (x, y) => (x || []).filter(t => !(y || []).includes(t));
    const саA = само(a.секции, b.секции), саB = само(b.секции, a.секции);
    if (саA.length) р.push('само в ' + path.basename(fa) + ': ' + саA.slice(0, 6).join(' | ')); if (саB.length) р.push('само в ' + path.basename(fb) + ': ' + саB.slice(0, 6).join(' | '));
    console.log((р.length ? '🔴 ' : '✅ ') + с + (р.length ? ' · ' + р.join(' · ') : ' · същото (' + a.секцииБрой + ' секции, ' + a.карти + ' карти, ' + a.бутони + ' бутона, текст ' + a.текст + ')')); if (р.length) разлики++; }
  console.log(разлики ? '🔴 стаи с разлика: ' + разлики : '✅ всички стаи еднакви'); process.exit(разлики ? 1 : 0);
}
const АДРЕС = (арг.url || 'https://babyland.aaeromove.workers.dev').replace(/\/?$/, '/') + 'index.html';
(async () => {
  await require('./slot.js')('chrome');
  const ПРОФИЛ = path.join(__dirname, 'chrome_pr_otp_' + Date.now()); const ПОРТ = 9200 + Math.floor(Math.random() * 700);
  const ch = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=360,800'].concat((process.env.BL_CHROME_FLAGS || '').split(' ').filter(Boolean), ['about:blank']), { stdio: 'ignore' });
  const край = к => { try { ch.kill(); } catch (e) {} setTimeout(() => { try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {} process.exit(к); }, 1500); };
  let цел; for (let i = 0; i < 80 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + ПОРТ + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
  if (!цел) { console.log('🔴 Chrome не тръгна'); return край(3); }
  const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let n = 0; const ч = new Map(); const грешки = [];
  const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  ws.onmessage = e => { const м = JSON.parse(e.data); if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); }
    if (м.method === 'Runtime.exceptionThrown') { const d = м.params.exceptionDetails; грешки.push(((d.exception && d.exception.description) || d.text).split('\n')[0]); }
    if (м.method === 'Fetch.requestPaused') send('Fetch.fulfillRequest', { requestId: м.params.requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }], body: Buffer.from(JSON.stringify({ user: { email: 'proba@example.test', status: 'active', access_until: new Date(Date.now() + 14 * 864e5).toISOString(), proben: true } })).toString('base64') }); };
  const изр = async x => { const р = await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true }); return р.result && р.result.result ? р.result.result.value : null; };
  const чакай = async (x, ms) => { const t = Date.now(); while (Date.now() - t < ms) { if (await изр(x)) return Date.now() - t; await пауза(200); } return -1; };
  await send('Runtime.enable'); await send('Page.enable');
  await send('Fetch.enable', { patterns: [{ urlPattern: '*/api/*', requestStage: 'Request' }] });
  await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 800, deviceScaleFactor: 2, mobile: true });
  await send('Page.navigate', { url: АДРЕС }); await пауза(2500);
  await изр(`(() => { localStorage.clear(); const s = (k, v) => localStorage.setItem(k, JSON.stringify(v)); s('bl_onboarded', true); localStorage.setItem('bl_tour_done','1'); s('bl_hero_toured', true); s('bl_baby', { name: 'Алекс', birth: '2026-07-19', sex: 'boy' }); return 1; })()`);
  await send('Page.reload');
  if (await чакай("!document.getElementById('blSplash') && !!window.MamaHelper && !!window.KB && document.querySelectorAll('.pl-room[data-room]').length >= 9", 180000) < 0) { console.log('🔴 началото не излезе'); return край(2); }
  await пауза(6000);   // и скриптовете след първия екран (V2) — пуснати на DOMContentLoaded — да са дошли
  const стаи = JSON.parse(await изр("JSON.stringify([...document.querySelectorAll('.pl-room[data-room]')].map(e => e.dataset.room))"));
  const изход = {};
  for (const с of стаи) {
    for (let i = 0; i < 6 && await изр("!!document.querySelector('.md-veil')"); i++) { await изр("(document.querySelector('.md-veil .md-ok') || { click() {} }).click(); 1"); await пауза(500); }
    await изр(`MamaHelper.open(${JSON.stringify(с)}); 1`);
    await чакай("!document.getElementById('roomOverlay').hidden && document.getElementById('roRoom').querySelectorAll(':scope > :not(.ro-skel)').length > 2", 20000);
    // тишина в DOM-а 1,5 s (до 15 s) — всичко дорисувано
    await изр("new Promise(ок => { let т = null; const край = Date.now() + 15000; const мо = new MutationObserver(() => { clearTimeout(т); т = setTimeout(() => { мо.disconnect(); ок(1); }, 1500); if (Date.now() > край) { мо.disconnect(); ок(0); } }); мо.observe(document.getElementById('roomOverlay'), { childList: true, subtree: true, characterData: true }); т = setTimeout(() => { мо.disconnect(); ок(1); }, 1500); })");
    изход[с] = await изр(`(() => { const R = document.getElementById('roRoom'); const ov = document.getElementById('roomOverlay');
      const загл = [...R.querySelectorAll('section h2, section h3, .jr-card h3, .jr-card .jr-title, .sec-head, h2, h3')].map(h => (h.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 60)).filter(Boolean);
      return { секции: [...new Set(загл)], секцииБрой: R.querySelectorAll('section').length, карти: R.querySelectorAll('.jr-card').length, бутони: R.querySelectorAll('button').length,
        текст: (R.innerText || '').length, табове: ov.querySelectorAll('#roTabs [data-tab]').length, чипове: ov.querySelectorAll('#roChips button').length }; })()`);
    console.log('  ' + с + ': ' + изход[с].секцииБрой + ' секции · ' + изход[с].карти + ' карти · ' + изход[с].бутони + ' бутона · текст ' + изход[с].текст);
    await изр('MamaHelper.close(); 1'); await пауза(1000);
  }
  fs.writeFileSync(арг.izhod || 'otpechatak.json', JSON.stringify(изход, null, 1));
  console.log('JS грешки: ' + (грешки.length ? [...new Set(грешки)].slice(0, 4).join(' | ') : 'няма') + ' · записано ' + (арг.izhod || 'otpechatak.json'));
  край(0);
})();
