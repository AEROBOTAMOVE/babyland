// 22.10 · Cloudflare — КОПИЕ на cdp_proba_dostap.js. ЕДИНСТВЕНАТА разлика: портът по подразбиране е 8916 —
//   dev/proba/server_cf.js (Worker + Static Assets + D1-шим). Стъпките: същият cdp_proba_dostap_koraci.js.
//   ПЪТ НАЗАД: махни този файл.
// 21.10 · достъп — КОПИЕ на cdp_proba_gl20.js за пробата ОТ КРАЙ ДО КРАЙ на достъпа (свързвач В).
//   Разлики спрямо gl20 (всичко друго е същото):
//   1) адресът по подразбиране е http://localhost:8914/ — dev/proba/server_api.js (/api/* в паметта);
//   2) --steps файл.js → много кадри в ЕДНА сесия на Chrome (без втора опашка). Файлът дава
//      module.exports = ({ тема, сайт }) => ({ steps: [{ ime, expr?, node?: async h => …, snimka?: false, wait? }] });
//      expr върви в страницата; node върви тук — „вторият телефон“ (админът), със своя бисквитка:
//      h.api(буркан, метод, път, тяло) → { status, json }. Кадрите: snimki/<out>_<ime>.png;
//   3) мрежата се записва (CDP Network): всяка /api/ заявка с fromServiceWorker. Контрола: статичните
//      файлове ТРЯБВА да идват през service worker-а — иначе „0 през SW“ за /api/ не значи нищо.
//   Истинският sw.js НЕ се заобикаля (fetch не се подменя).
//   ПЪТ НАЗАД: махни този файл (gl20 не е пипан).
// gl20 копие (20.10): + --tezh (gl20_rano.js / gl20_metriki.js) — мярка на тежестта при зареждане
// ПРОБНА РАМКА за премиум екраните на Бейби Ленд — собствен скрит Chrome 390×844 @2x.
// Вкарва НОВИ css/js файлове в страницата по време на пробата (index.html НЕ се пипа),
// по желание отваря стая, пуска израз от файл и снима.
//
// ПУСКАНЕ (node е извън PATH):
//   "C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" cdp_proba.js ^
//      --out ime  [--room "Здраве и SOS"] [--theme light|dark] [--profile baby|preg|empty]
//      [--inject css/pl-zdrave.css,js/pl-zdrave.js] [--expr put/do/izraz.js] [--seed put/do/seed.json]
//      [--scrollTo ".css-selektor"] [--tab room|articles|chat] [--wait 1500]
// ИЗХОД: JSON от израза (ако има) + snimki/<ime>.png ; ред „грешки: N“ = изключения в страницата.
// Сървърът: http://localhost:8914/ (node dev/proba/server_api.js 8914). Ако не отговаря — пусни го.
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; } }
const ИМЕ = арг.out || 'proba', ТЕМА = арг.theme || 'light', ПРОФИЛ_ТИП = арг.profile || 'baby';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ПАПКА = path.join(__dirname, 'snimki'); fs.mkdirSync(ПАПКА, { recursive: true });
const ПРОФИЛ = path.join(__dirname, 'chrome_pr_' + Date.now() + '_' + Math.floor(Math.random() * 1e6));
const ПОРТ = 9200 + Math.floor(Math.random() * 700);
const пауза = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await require('./slot.js')('chrome');   // 🚦 20.10 опашката (slot.js) — ПЪТ НАЗАД: махни този ред
  const ch = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=' + (арг.w || 390) + ',' + (арг.h || 844), 'about:blank'], { stdio: 'ignore' });
  let цел; for (let i = 0; i < 80 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + ПОРТ + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
  if (!цел) throw new Error('Chrome не тръгна');
  const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let n = 0; const ч = new Map(); const грешки = []; const конзола = [];
  ws.onmessage = e => { const м = JSON.parse(e.data); if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); } if (м.method === 'Runtime.exceptionThrown') грешки.push((м.params.exceptionDetails.exception && м.params.exceptionDetails.exception.description || м.params.exceptionDetails.text || '').slice(0, 200)); };
  const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  const изрази = async x => { const р = await send('Runtime.evaluate', { expression: x, awaitPromise: true, returnByValue: true }); return р.result.exceptionDetails ? { ГРЕШКА: (р.result.exceptionDetails.exception || {}).description || р.result.exceptionDetails.text } : р.result.result.value; };
  const зареди = async () => { for (let i = 0; i < 120; i++) { await пауза(300); if (await изрази("document.readyState === 'complete' && !!window.MamaHelper") === true) break; } await пауза(2000); };
  await send('Page.enable'); await send('Runtime.enable');
  // gl20: тежест — дълги задачи и „готово“ от самото начало на всяко зареждане
  if (арг.tezh) await send('Page.addScriptToEvaluateOnNewDocument', { source: fs.readFileSync(path.join(__dirname, 'gl20_rano.js'), 'utf8') });
  await send('Emulation.setDeviceMetricsOverride', { width: Number(арг.w || 390), height: Number(арг.h || 844), deviceScaleFactor: Number(арг.dpr || 2), mobile: !арг.w });
  // --port 8912 → пробата върви върху ПОСТРОЕНИЯ сайт (dist), не върху изходния
  const САЙТ = 'http://localhost:' + (арг.port || 8916) + '/';
  // 21.10 · достъп: мрежата — /api/ заявките и дали минават през service worker-а
  const мрежа = [];
  await send('Network.enable');
  const стариОнМ = ws.onmessage;
  ws.onmessage = e => { стариОнМ(e); try { const м = JSON.parse(e.data); if (м.method === 'Network.responseReceived') { const r = м.params.response; мрежа.push({ url: r.url.replace(САЙТ, '/'), status: r.status, sw: !!r.fromServiceWorker, извор: r.serviceWorkerResponseSource || '', ws: r.timing ? r.timing.workerStart : null, кеш: !!r.fromDiskCache }); } if (м.method === 'Runtime.consoleAPICalled' && м.params.type === 'error') конзола.push(м.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 200)); } catch (x) {} };
  await send('Page.navigate', { url: САЙТ }); await зареди();
  if (арг.tezh) console.log('СТУДЕНО ' + JSON.stringify(await изрази(fs.readFileSync(path.join(__dirname, 'gl20_metriki.js'), 'utf8'))));
  const профил = ПРОФИЛ_ТИП === 'preg'
    ? "s('bl_preg', { due: new Date(Date.now() + 16 * 7 * 864e5).toISOString().slice(0, 10) }); s('bl_baby', { name: '' });"
    : ПРОФИЛ_ТИП === 'empty' ? '' : "s('bl_baby', { name: 'Алекс', birth: '2026-03-20', sex: 'boy' });";
  const семе = арг.seed ? fs.readFileSync(арг.seed, 'utf8') : '{}';
  await изрази(`(() => { localStorage.clear(); const s = (k, v) => localStorage.setItem(k, JSON.stringify(v)); ${арг.firstrun ? '' : "s('bl_onboarded', true); localStorage.setItem('bl_tour_done','1'); s('bl_hero_toured', true); s('bl_day1','2026-08-01'); s('bl_mama',{name:'Мария'}); " + профил} localStorage.setItem('bl_theme','${ТЕМА}'); const x = ${семе}; for (const k in x) localStorage.setItem(k, typeof x[k] === 'string' ? x[k] : JSON.stringify(x[k])); return 1; })()`);
  await send('Page.reload'); await зареди();
  if (арг.tezh) console.log('ТОПЛО ' + JSON.stringify(await изрази(fs.readFileSync(path.join(__dirname, 'gl20_metriki.js'), 'utf8'))));
  if (арг.inject) {
    for (const f of арг.inject.split(',').map(x => x.trim()).filter(Boolean)) {
      const r = await изрази(`new Promise(res => { const v = '?t=' + Date.now(); if (/\\.css$/.test(${JSON.stringify(f)})) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = ${JSON.stringify(f)} + v; l.onload = () => res('css ok'); l.onerror = () => res('css 404'); document.head.appendChild(l); } else { const s = document.createElement('script'); s.src = ${JSON.stringify(f)} + v; s.onload = () => res('js ok'); s.onerror = () => res('js 404'); document.body.appendChild(s); } })`);
      console.log('вкарано ' + f + ': ' + JSON.stringify(r));
    }
    await пауза(600);
  }
  await изрази(`(() => { document.querySelectorAll('button').forEach(b => { if (/Благодаря/.test(b.innerText)) b.click(); }); document.documentElement.style.scrollBehavior = 'auto'; return 1; })()`);
  if (арг.room) {
    await изрази(`(() => { MamaHelper.open(${JSON.stringify(арг.room)}); return 1; })()`); await пауза(2200);
    const таб = арг.tab || 'room';
    await изрази(`(() => { const s = document.querySelector('#roTabs .st-seg[data-tab="${таб}"]'); if (s) s.click(); return 1; })()`); await пауза(1500);
  }
  if (арг.scrollTo) {
    await изрази(`(async () => { const п = ms => new Promise(r => setTimeout(r, ms)); const к = document.querySelector(${JSON.stringify(арг.scrollTo)}); if (!к) return 'няма ' + ${JSON.stringify(арг.scrollTo)};
      const ск = (() => { let e = к.parentElement; while (e && !(e.scrollHeight > e.clientHeight + 20 && /(auto|scroll)/.test(getComputedStyle(e).overflowY))) e = e.parentElement; return e; })();
      for (let i = 0; i < 4; i++) { if (ск) { ск.style.scrollBehavior = 'auto'; ск.scrollTop += к.getBoundingClientRect().top - 150; } else window.scrollBy(0, к.getBoundingClientRect().top - 150); await п(400); } return 1; })()`);
  }
  if (арг.expr) console.log(JSON.stringify(await изрази(fs.readFileSync(арг.expr, 'utf8')), null, 1));
  // gl20: --tur N → N кадъра от горе до долу (jpeg) в СЪЩАТА сесия (без втора опашка)
  if (арг.tur) {
    await изрази('(() => { document.documentElement.style.scrollBehavior = "auto"; scrollTo(0, 0); return 1; })()'); await пауза(500);
    for (let i = 0; i < Number(арг.tur); i++) {
      await изрази('new Promise(r => { let k = 0; const f = () => (++k >= 40 ? r(1) : requestAnimationFrame(f)); requestAnimationFrame(f); })');
      const к = await send('Page.captureScreenshot', { format: 'jpeg', quality: 70 });
      fs.writeFileSync(path.join(ПАПКА, ИМЕ + '_t' + String(i).padStart(2, '0') + '.jpg'), Buffer.from(к.result.data, 'base64'));
      const м = await изрази('(() => { const п = scrollY; scrollBy(0, Math.round(innerHeight * .85)); return scrollY - п; })()');
      if (!м || м < 20) break;
      await пауза(350);
    }
  }
  // 21.10 · достъп: --steps → много кадри в същата сесия; node стъпките са „вторият телефон“
  if (арг.steps) {
    const бурканче = {};   // буркан → 'bl_s=…'
    const h = {
      сайт: САЙТ,
      api: async (буркан, метод, път, тяло) => {
        const з = { Accept: 'application/json' };
        if (бурканче[буркан]) з.Cookie = бурканче[буркан];
        if (тяло !== undefined) з['Content-Type'] = 'application/json';
        const р = await fetch(САЙТ + 'api/' + път, { method: метод, headers: з, body: тяло !== undefined ? JSON.stringify(тяло) : undefined });
        const бк = typeof р.headers.getSetCookie === 'function' ? р.headers.getSetCookie() : [];
        for (const б of бк) { const м = /^(bl_s=[^;]*)/.exec(б); if (м) бурканче[буркан] = м[1]; }
        let json = null; try { json = await р.json(); } catch (x) {}
        return { status: р.status, json };
      }
    };
    const ПЛАН = require(path.resolve(арг.steps))({ тема: ТЕМА, сайт: САЙТ });
    for (const с of ПЛАН.steps) {
      let р;
      try {
        if (с.reload) { await send('Page.reload'); await зареди(); р = 'презаредено'; }
        else р = с.node ? await с.node(h) : await изрази(с.expr);
      } catch (x) { р = { ГРЕШКА_ТУК: String(x && x.message || x) }; }
      console.log('── ' + с.ime + ' ' + JSON.stringify(р));
      if (с.snimka === false) continue;
      await пауза(с.wait || 500);
      await изрази('new Promise(r => { let k = 0; const f = () => (++k >= 40 ? r(1) : requestAnimationFrame(f)); requestAnimationFrame(f); })');
      const к = await send('Page.captureScreenshot', { format: 'png' });
      const ф = path.join(ПАПКА, ИМЕ + '_' + с.ime + '.png'); fs.writeFileSync(ф, Buffer.from(к.result.data, 'base64'));
      console.log('📸 ' + ф);
    }
    const апи = мрежа.filter(x => /^\/api\//.test(x.url));
    const статични = мрежа.filter(x => /\.(js|css)(\?|$)/.test(x.url));
    console.log('МРЕЖА /api/: ' + апи.length + ' отговора · през service worker: ' + апи.filter(x => x.sw).length + ' · от дисковия кеш: ' + апи.filter(x => x.кеш).length);
    console.log('   ' + апи.map(x => x.url + ' ' + x.status + (x.sw ? ' [SW]' : '')).join('\n   '));
    console.log('КОНТРОЛА статични js/css: ' + статични.length + ' · през service worker: ' + статични.filter(x => x.sw).length);
    console.log('   последните 3: ' + JSON.stringify(статични.slice(-3)));
    console.log('грешки: ' + грешки.length + (грешки.length ? '\n  ' + грешки.slice(0, 8).join('\n  ') : ''));
    console.log('конзола (error): ' + конзола.length + (конзола.length ? '\n  ' + конзола.slice(0, 8).join('\n  ') : ''));
    try { ws.close(); } catch (e) {} try { ch.kill(); } catch (e) {}
    try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {}
    process.exit(0);
  }
  await пауза(Number(арг.wait || 700));
  // 🪤 06.10: headless не рисува кадри между заявките → изплуващите карти/чипове стоят
  //   невидими и снимката показва „празно“, което на телефон го няма. 40 истински кадъра.
  await изрази('new Promise(r => { let k = 0; const f = () => (++k >= 40 ? r(1) : requestAnimationFrame(f)); requestAnimationFrame(f); })');
  const р = await send('Page.captureScreenshot', { format: 'png' });
  const файл = path.join(ПАПКА, ИМЕ + '.png'); fs.writeFileSync(файл, Buffer.from(р.result.data, 'base64'));
  console.log('📸 ' + файл + ' · грешки: ' + грешки.length + (грешки.length ? '\n  ' + грешки.slice(0, 5).join('\n  ') : ''));
  try { ws.close(); } catch (e) {} try { ch.kill(); } catch (e) {}
  try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {}
  process.exit(0);
})().catch(e => { console.log('🔴 ' + e.message); process.exit(3); });
