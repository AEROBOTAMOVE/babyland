// 📚 ПАДНАЛА СТАТИЯ ОФЛАЙН → МРЕЖАТА СЕ ВРЪЩА → НОВО ОТВАРЯНЕ ЗАРЕЖДА (17.11.2026)
// articles.js (c9fbd1a): тяло на статия от Голямата библиотека, паднало без мрежа, оставаше
// „Страницата не се зареди…“ до презареждане. Сега ново отваряне (след ≥3 s) пробва пак.
// Мрежата „пада“ САМО за lib/*-N.json (пакетите с телата): SW е заобиколен, заявката се проваля
// с InternetDisconnected — като пакет, който не е влязъл в кеша. Броим и заявките към пакета,
// докато е офлайн: повече от 2 = въртене без край.
// ПУСКАНЕ: node dev/proba/statia_oflain_proba.js [--url https://babyland.aaeromove.workers.dev] [--staro файл]
//   --staro подменя js/articles.js (контрола: старото трябва да ОСТАНЕ паднало).
const { spawn } = require('child_process'); const path = require('path'); const fs = require('fs');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; } }
const АДРЕС = арг.url ? арг.url.replace(/\/?$/, '/') + 'index.html' : 'http://127.0.0.1:' + (арг.port || 8912) + '/index.html';
const пауза = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await require('./slot.js')('chrome');
  const ПРОФИЛ = path.join(__dirname, 'chrome_pr_stof_' + Date.now()); const ПОРТ = 9200 + Math.floor(Math.random() * 700);
  const ch = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=360,800', 'about:blank'], { stdio: 'ignore' });
  const край = к => { try { ch.kill(); } catch (e) {} setTimeout(() => { try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {} process.exit(к); }, 1200); };
  let цел; for (let i = 0; i < 80 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + ПОРТ + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
  if (!цел) { console.log('🔴 Chrome не тръгна'); return край(3); }
  const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let n = 0; const ч = new Map(); const грешки = [];
  const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  let офлайн = false, заявкиПакет = 0;
  const старо = арг.staro ? Buffer.from(fs.readFileSync(арг.staro, 'utf8')).toString('base64') : null;
  ws.onmessage = e => { const м = JSON.parse(e.data); if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); }
    if (м.method === 'Runtime.exceptionThrown') { const d = м.params.exceptionDetails; грешки.push(((d.exception && d.exception.description) || d.text).split('\n')[0]); }
    if (м.method === 'Fetch.requestPaused') { const u = м.params.request.url, id = м.params.requestId;
      if (старо && /\/js\/articles\.js/.test(u)) return send('Fetch.fulfillRequest', { requestId: id, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'application/javascript; charset=utf-8' }, { name: 'Cache-Control', value: 'no-store' }], body: старо });
      if (/\/lib\/[a-z]+-\d+\.json/.test(u) && офлайн) { заявкиПакет++; return send('Fetch.failRequest', { requestId: id, errorReason: 'InternetDisconnected' }); }
      send('Fetch.continueRequest', { requestId: id }); } };
  const изр = async x => { const р = await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true }); return р.result && р.result.result ? р.result.result.value : null; };
  const чакай = async (x, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await изр(x)) return Date.now() - t0; await пауза(200); } return -1; };
  await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable');
  await send('Network.setBypassServiceWorker', { bypass: true }); await send('Network.setCacheDisabled', { cacheDisabled: true });
  await send('Fetch.enable', { patterns: [{ urlPattern: '*', requestStage: 'Request' }] });
  if (старо) console.log('  ⚠ ПОДМЕНЕН js/articles.js ← ' + арг.staro);
  await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 800, deviceScaleFactor: 2, mobile: true });
  const рез = []; let червени = 0; const пр = (и, у, д) => { рез.push((у ? '✅ ' : '🔴 ') + и + (д ? ' · ' + д : '')); if (!у) червени++; };
  await send('Page.navigate', { url: АДРЕС }); await пауза(2500);
  await изр(`(() => { localStorage.clear(); const s = (k, v) => localStorage.setItem(k, JSON.stringify(v)); s('bl_onboarded', true); localStorage.setItem('bl_tour_done','1'); s('bl_hero_toured', true); s('bl_baby', { name: 'Алекс', birth: '2026-07-19', sex: 'boy' }); return 1; })()`);
  await send('Page.reload');
  if (await чакай("!document.getElementById('blSplash') && !!window.BL_ARTICLES && !!window.BL_LIB", 120000) < 0) { console.log('🔴 началото не излезе'); return край(2); }
  await изр('BL_LIB.init().then(() => 1)');
  const id = await изр("(BL_ARTICLES_DATA.find(a => a.lib && !a.body) || {}).id || null");
  if (!id) { console.log('🔴 няма статия от библиотеката'); return край(2); }
  const ТЯЛО = "(document.getElementById('artBody') || {}).textContent || ''";
  const ПАДНА = "/Страницата не се зареди/.test(" + ТЯЛО + ")";
  // 1) офлайн → отваряне → провал
  офлайн = true;
  await изр(`BL_ARTICLES.open(${JSON.stringify(id)}); 1`);
  const т1 = await чакай(ПАДНА, 15000);
  пр('офлайн: статията показва „не се зареди“', т1 >= 0, 'статия ' + id + ' · ' + т1 + ' ms');
  await пауза(5000);
  пр('офлайн: без въртене (заявки към пакета за 5 s)', заявкиПакет <= 1, заявкиПакет + ' заявки');
  // 2) мрежата се връща → затваряне → ново отваряне
  офлайн = false; const преди = заявкиПакет;
  await изр("document.getElementById('artClose').click(); 1"); await пауза(600);
  await изр(`BL_ARTICLES.open(${JSON.stringify(id)}); 1`);
  const т2 = await чакай('!' + ПАДНА + ' && !/Разгръщам страницата/.test(' + ТЯЛО + ') && (' + ТЯЛО + ').length > 400', 15000);
  пр('онлайн: новото отваряне зарежда тялото', т2 >= 0, т2 + ' ms · ' + (await изр('(' + ТЯЛО + ').length')) + ' знака · ' + (await изр('(' + ТЯЛО + ').slice(0, 60)')));
  пр('JS грешки', грешки.length === 0, грешки.slice(0, 3).join(' | ') || 'няма');
  console.log(рез.join('\n')); console.log((червени ? '🔴 ' + червени + ' ЧЕРВЕНИ' : '✅ ВСИЧКО ЗЕЛЕНО') + (старо ? ' (КОНТРОЛА със старото articles.js)' : ''));
  край(червени ? 1 : 0);
})();
