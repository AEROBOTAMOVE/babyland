// 🖼️ КАРТИНКИТЕ НА ЕКРАНА (18.11.2026): кои картинки са ЗАРЕДЕНИ и ВИДИМИ на началото и в 3 стаи (профил с бебе).
// За проверка, че промяна по старта само ги е ПРЕМЕСТИЛА след първия екран, а не ги е махнала.
//   <img>: видим (кутия > 0, видимост) + complete + naturalWidth > 0
//   фон: computed background-image url(...) на видим елемент + адресът е в performance (наистина изтеглен)
// Чака: стартовият екран махнат + 8 s; всяка стая — тишина в DOM-а + 4 s. Без забавяне.
// ПУСКАНЕ: node dev/proba/kartinki_proba.js --url <адрес> --izhod a.json   ·   --sravni a.json b.json
const { spawn } = require('child_process'); const path = require('path'); const fs = require('fs');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; } }
const пауза = ms => new Promise(r => setTimeout(r, ms));
if (арг.sravni) {
  const fb = process.argv[process.argv.indexOf(арг.sravni) + 1];
  const A = JSON.parse(fs.readFileSync(арг.sravni, 'utf8')), B = JSON.parse(fs.readFileSync(fb, 'utf8')); let р = 0;
  for (const к of Object.keys(A)) { const a = A[к], b = B[к] || { img: [], фон: [] };
    const само = (x, y) => x.filter(u => !y.includes(u));
    const ai = само(a.img, b.img), bi = само(b.img, a.img), af = само(a.фон, b.фон), bf = само(b.фон, a.фон);
    const ок = !ai.length && !bi.length && !af.length && !bf.length; if (!ок) р++;
    console.log((ок ? '✅ ' : '🔴 ') + к + ' · <img> ' + a.img.length + '/' + b.img.length + ' · фон ' + a.фон.length + '/' + b.фон.length +
      (ai.length ? ' · само в първия img: ' + ai.join(', ') : '') + (bi.length ? ' · само във втория img: ' + bi.join(', ') : '') +
      (af.length ? ' · само в първия фон: ' + af.join(', ') : '') + (bf.length ? ' · само във втория фон: ' + bf.join(', ') : '')); }
  console.log(р ? '🔴 разлика на ' + р + ' места' : '✅ еднакви картинки навсякъде'); process.exit(р ? 1 : 0);
}
const АДРЕС = (арг.url || 'https://babyland.aaeromove.workers.dev').replace(/\/?$/, '/') + 'index.html';
const СТАИ = ['Моето бебе', 'Жената в мен', 'Инструменти'];
(async () => {
  await require('./slot.js')('chrome');
  const ПРОФИЛ = path.join(__dirname, 'chrome_pr_kart_' + Date.now()); const ПОРТ = 9200 + Math.floor(Math.random() * 700);
  const ch = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=360,800'].concat((process.env.BL_CHROME_FLAGS || '').split(' ').filter(Boolean), ['about:blank']), { stdio: 'ignore' });
  const край = к => { try { ch.kill(); } catch (e) {} setTimeout(() => { try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {} process.exit(к); }, 1500); };
  let цел; for (let i = 0; i < 80 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + ПОРТ + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
  if (!цел) { console.log('🔴 Chrome не тръгна'); return край(3); }
  const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let n = 0; const ч = new Map();
  const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  ws.onmessage = e => { const м = JSON.parse(e.data); if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); }
    if (м.method === 'Fetch.requestPaused') send('Fetch.fulfillRequest', { requestId: м.params.requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }], body: Buffer.from(JSON.stringify({ user: { email: 'proba@example.test', status: 'active', access_until: new Date(Date.now() + 14 * 864e5).toISOString(), proben: true } })).toString('base64') }); };
  const изр = async x => { const р = await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true }); return р.result && р.result.result ? р.result.result.value : null; };
  const чакай = async (x, ms) => { const t = Date.now(); while (Date.now() - t < ms) { if (await изр(x)) return Date.now() - t; await пауза(200); } return -1; };
  await send('Runtime.enable'); await send('Page.enable');
  await send('Fetch.enable', { patterns: [{ urlPattern: '*/api/*', requestStage: 'Request' }] });
  await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 800, deviceScaleFactor: 2, mobile: true });
  await send('Page.navigate', { url: АДРЕС }); await пауза(2500);
  await изр(`(() => { localStorage.clear(); const s = (k, v) => localStorage.setItem(k, JSON.stringify(v)); s('bl_onboarded', true); localStorage.setItem('bl_tour_done','1'); s('bl_hero_toured', true); s('bl_baby', { name: 'Алекс', birth: '2026-07-19', sex: 'boy' }); return 1; })()`);
  await send('Page.reload');
  if (await чакай("!document.getElementById('blSplash') && !!window.MamaHelper && document.querySelectorAll('.pl-room[data-room]').length >= 9", 180000) < 0) { console.log('🔴 началото не излезе'); return край(2); }
  await пауза(8000);
  const СЪБЕРИ = `(() => { const заредени = new Set(performance.getEntriesByType('resource').map(r => r.name.split('?')[0]));
    const име = u => u.split('?')[0].replace(/^https?:\\/\\/[^/]+\\//, '');
    const вид = e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 1 && r.height > 1 && cs.visibility !== 'hidden' && cs.display !== 'none' && (!!e.offsetParent || cs.position === 'fixed'); };
    const img = [...document.querySelectorAll('img')].filter(i => вид(i) && i.complete && i.naturalWidth > 0).map(i => име(i.currentSrc || i.src));
    const фон = new Set(); for (const e of document.querySelectorAll('body *')) { const b = getComputedStyle(e).backgroundImage; if (!b || b === 'none' || !вид(e)) continue;
      for (const м of b.matchAll(/url\\(["']?([^"')]+)["']?\\)/g)) { const u = new URL(м[1], location.href).href.split('?')[0]; if (/^data:/.test(м[1])) continue; if (заредени.has(u)) фон.add(име(u)); } }
    return { img: [...new Set(img)].sort(), фон: [...фон].sort() }; })()`;
  const изход = { 'началото': await изр(СЪБЕРИ) };
  console.log('  началото: <img> ' + изход['началото'].img.length + ' · фонови ' + изход['началото'].фон.length);
  for (const с of СТАИ) {
    for (let i = 0; i < 6 && await изр("!!document.querySelector('.md-veil')"); i++) { await изр("(document.querySelector('.md-veil .md-ok') || { click() {} }).click(); 1"); await пауза(500); }
    await изр(`MamaHelper.open(${JSON.stringify(с)}); 1`);
    await чакай("!document.getElementById('roomOverlay').hidden && document.getElementById('roRoom').querySelectorAll(':scope > :not(.ro-skel)').length > 2", 20000);
    await пауза(4000);
    изход[с] = await изр(СЪБЕРИ);
    console.log('  ' + с + ': <img> ' + изход[с].img.length + ' · фонови ' + изход[с].фон.length);
    await изр('MamaHelper.close(); 1'); await пауза(1000);
  }
  fs.writeFileSync(арг.izhod || 'kartinki.json', JSON.stringify(изход, null, 1));
  край(0);
})();
