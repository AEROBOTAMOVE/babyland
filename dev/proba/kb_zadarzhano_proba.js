// ⏳ ПЪРВИТЕ СЕКУНДИ БЕЗ ЗНАНИЕ (17.11.2026): js/kb.js е async и на Slow 4G идва след ~10 s.
// Тук kb.js се ЗАДЪРЖА изкуствено (CDP Fetch, --zaderzhi ms, по подразбиране 15000) и през това време
// мама пише по всички пътища:
//   A. пряко: BL_REDFLAG / BL_MOTHERFLAG / BL_PREGFLAG / BL_MATCH („бебето не диша“) — стойност или грешка
//   B. началото: формата „…или напиши своя въпрос“ (home.js mountAsk → MamaHelper.open + ask след 1,3 s)
//   C. стая „Здраве и SOS“ → „Попитай“ → #roForm (helper.js ask → respond)
//   D. търсачката: #searchInput (search.js draw)
// За всеки: какво се вижда веднага (тревога / три точки / „секунда“ / нищо / грешка), и след като знанието
// дойде — идва ли тревогата и за колко ms. Всички хвърлени грешки — с файл:ред.
// ПУСКАНЕ: node dev/proba/kb_zadarzhano_proba.js [--url https://babyland.aaeromove.workers.dev] [--zaderzhi 15000]
//          [--spisak] (всички СПЕШНИ от korpus350 без знание) [--b-chaka] (началото до знанието, без C/D)
//          [--tekst „бебето не диша“] [--tekst2 „гърч“]
const { spawn } = require('child_process'); const path = require('path'); const fs = require('fs');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; } }
const АДРЕС = арг.url ? арг.url.replace(/\/?$/, '/') + 'index.html' : 'http://127.0.0.1:' + (арг.port || 8912) + '/index.html';
const ЗАДРЪЖ = +(арг.zaderzhi || 15000);
const Т1 = арг.tekst || 'бебето не диша', Т2 = арг.tekst2 || 'гърч';
const пауза = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await require('./slot.js')('chrome');
  const ПРОФИЛ = path.join(__dirname, 'chrome_pr_kbz_' + Date.now()); const ПОРТ = 9200 + Math.floor(Math.random() * 700);
  const ch = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=360,800', 'about:blank'], { stdio: 'ignore' });
  const край = к => { try { ch.kill(); } catch (e) {} setTimeout(() => { try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {} process.exit(к); }, 1200); };
  let цел; for (let i = 0; i < 80 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + ПОРТ + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
  if (!цел) { console.log('🔴 Chrome не тръгна'); return край(3); }
  const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let n = 0; const ч = new Map(); const грешки = []; let t0 = Date.now(); let пуснат = 0, задържан = 0;
  const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  ws.onmessage = e => { const м = JSON.parse(e.data); if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); }
    if (м.method === 'Runtime.exceptionThrown') { const d = м.params.exceptionDetails; const кд = d.stackTrace && d.stackTrace.callFrames && d.stackTrace.callFrames[0];
      грешки.push({ t: Date.now() - t0, текст: ((d.exception && d.exception.description) || d.text).split('\n')[0], къде: кд ? кд.functionName + ' ' + кд.url.split('/').pop().split('?')[0] + ':' + (кд.lineNumber + 1) : (d.url || '').split('/').pop() + ':' + (d.lineNumber + 1) }); }
    if (м.method === 'Fetch.requestPaused') { const id = м.params.requestId;
      if (/\/js\/kb\.js/.test(м.params.request.url) && задържан === 0) { задържан = Date.now(); console.log('  ⏸  kb.js задържан ' + ЗАДРЪЖ + ' ms'); setTimeout(() => { пуснат = Date.now(); console.log('  ▶  kb.js пуснат (t=' + (пуснат - t0) + ' ms)'); send('Fetch.continueRequest', { requestId: id }); }, ЗАДРЪЖ); }
      else send('Fetch.continueRequest', { requestId: id }); } };
  const изр = async x => { const р = await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true }); if (р.result && р.result.exceptionDetails) return { __грешка: (р.result.exceptionDetails.exception && р.result.exceptionDetails.exception.description || '').split('\n')[0] }; return р.result && р.result.result ? р.result.result.value : null; };
  const чакай = async (x, ms) => { const t = Date.now(); while (Date.now() - t < ms) { if (await изр(x)) return Date.now() - t; await пауза(100); } return -1; };
  await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 360, height: 800, deviceScaleFactor: 2, mobile: true });
  await send('Page.navigate', { url: АДРЕС }); await пауза(3000);
  await изр(`(() => { localStorage.clear(); const s = (k, v) => localStorage.setItem(k, JSON.stringify(v)); s('bl_onboarded', true); localStorage.setItem('bl_tour_done','1'); s('bl_hero_toured', true); s('bl_baby', { name: 'Алекс', birth: '2026-07-19', sex: 'boy' }); return 1; })()`);
  await send('Network.setBypassServiceWorker', { bypass: true }); await send('Network.setCacheDisabled', { cacheDisabled: true });
  await send('Fetch.enable', { patterns: [{ urlPattern: '*kb.js*', requestStage: 'Request' }] });
  t0 = Date.now(); await send('Page.reload');
  if (await чакай("!document.getElementById('blSplash') && !!window.MamaHelper && !!window.BL_SEARCH", 60000) < 0) { console.log('🔴 началото не излезе'); return край(2); }
  const т = () => 't=' + (Date.now() - t0) + ' ms' + (пуснат ? '' : ', знанието ОЩЕ го няма');
  console.log('  началото е готово (' + т() + ') · window.KB=' + await изр('typeof window.KB'));
  for (let i = 0; i < 6 && await изр("!!document.querySelector('.md-veil')"); i++) { await изр("(document.querySelector('.md-veil .md-ok')||{click(){}}).click(); 1"); await пауза(500); }
  const рез = [];
  // ── A. пряко ──
  const A = await изр(`(() => { const о = {}; const q = ${JSON.stringify(Т1)};
    for (const [к, ф] of [['BL_REDFLAG', () => BL_REDFLAG(q)], ['BL_MOTHERFLAG', () => BL_MOTHERFLAG(q)], ['BL_PREGFLAG', () => BL_PREGFLAG(q)], ['BL_MATCH', () => BL_MATCH(q, 'Здраве и SOS')]]) {
      try { const v = ф(); о[к] = 'върна ' + JSON.stringify(v === undefined ? 'undefined' : (v && v.id) || v); } catch (e) { о[к] = 'ГРЕШКА ' + String(e).split('\\n')[0] + ' @ ' + ((e.stack || '').split('\\n')[1] || '').trim().replace(/https?:\\/\\/[^/]+\\//, ''); } }
    return о; })()`);
  console.log('\nA. ПРЯКО без знание („' + Т1 + '“, ' + т() + '):'); for (const к in A) console.log('   ' + к + ': ' + A[к]);
  if (арг.spisak) {
    const сп = require(path.join(__dirname, '..', 'korpus350.json')).filter(x => x.e === 'SPESHNO');
    // всяка врата поотделно: „вдига“ = поне една върна истина (стигнала е до него ПРЕДИ реда с KB.*),
    // „гърми“ = никоя не вдигна и поне една хвърли, „мълчи“ = всички върнаха лъжа без грешка
    const вСтраницата = сп => { const о = { вдига: 0, мълчи: 0, гърми: 0, поСтаи: {}, вдигнати: [] };
      for (const x of сп) { let вдигна = false, гръм = false;
        for (const ф of [() => BL_REDFLAG(x.t), () => BL_MOTHERFLAG(x.t, x.r), () => BL_PREGFLAG(x.t, x.r)]) { try { if (ф()) вдигна = true; } catch (e) { гръм = true; } }
        const к = вдигна ? 'вдига' : гръм ? 'гърми' : 'мълчи'; о[к]++;
        о.поСтаи[x.r] = о.поСтаи[x.r] || { вдига: 0, мълчи: 0, гърми: 0 }; о.поСтаи[x.r][к]++; if (вдигна) о.вдигнати.push(x.t); }
      return о; };
    const р = await изр('(' + вСтраницата.toString() + ')(' + JSON.stringify(сп) + ')');
    console.log('\nСПИСЪК: ' + сп.length + ' СПЕШНИ от korpus350 през BL_REDFLAG/MOTHERFLAG/PREGFLAG БЕЗ знание: вдига ' + р.вдига + ' · мълчи ' + р.мълчи + ' · гърми ' + р.гърми);
    for (const с in р.поСтаи) console.log('   ' + с + ': ' + JSON.stringify(р.поСтаи[с]));
    console.log('   вдигнати без знание: ' + р.вдигнати.slice(0, 12).join(' | '));
  }
  const ЧАТ = `(() => { const c = document.getElementById('roChat'); if (!c) return null; const бот = [...c.querySelectorAll('.msg.bot:not(#roTyping)')].map(x => x.textContent.trim().slice(0, 90));
    return { точки: !!document.getElementById('roTyping'), тревога: document.documentElement.hasAttribute('data-alarm') || бот.some(x => /112|спешн|ЛЕКАР/i.test(x)), бот: бот.slice(-2), стаяОтв: !document.getElementById('roomOverlay').hidden }; })()`;
  // ── B. началото: формата ──
  const имаФорма = await изр("!!document.querySelector('.askme-form')");
  let Bрез = null;
  if (имаФорма) {
    await изр(`(() => { const ф = document.querySelector('.askme-form'); ф.querySelector('input').value = ${JSON.stringify(Т2)}; ф.requestSubmit(); return 1; })()`);
    await пауза(2600);
    Bрез = await изр(ЧАТ); console.log('\nB. НАЧАЛОТО, формата „Питай ➤“ („' + Т2 + '“, 2,6 s след изпращане, ' + т() + '):\n   ' + JSON.stringify(Bрез));
    if (арг["b-chaka"]) { if (await чакай("!!window.KB", ЗАДРЪЖ + 60000) >= 0) { const тK = Date.now(); const тB = await чакай(ЧАТ.replace("return { точки", "const r = { точки").replace(" }; })()", " }; return r.тревога; })()"), 8000); console.log("B. след знанието: " + (тB >= 0 ? "✅ тревога " + тB + " ms след KB" : "🔴 няма тревога за 8 s") + " · " + JSON.stringify(await изр(ЧАТ))); } console.log("\nГРЕШКИ (" + грешки.length + "): " + JSON.stringify(грешки)); return край(0); }
    await изр("MamaHelper.close(); 1"); await пауза(1200);
  } else console.log('\nB. НАЧАЛОТО: формата .askme-form я НЯМА на екрана (секцията не е монтирана) — пътят не съществува');
  // ── C. стаята: „Попитай“ ──
  await изр("MamaHelper.open('Здраве и SOS'); 1");
  await чакай("!document.getElementById('roomOverlay').hidden && !!document.getElementById('roForm')", 15000); await пауза(1500);
  await изр("MamaHelper.showTab('chat'); 1"); await пауза(800);
  // 17.11 (v949): бележката „звънни на 112“ преди знанието (helper.js ПРЕДИ_ЗНАНИЕТО_*_17) — веднъж на зареждане.
  //   --nevinen „…“: първо невинен въпрос → НЕ бива да вади бележка; после Т1 → бележка, мерена в ms.
  const БЕЛЕЖКА = "[...document.querySelectorAll('#roChat .msg.bot:not(#roTyping)')].filter(x => /звънни на 112/i.test(x.textContent)).length";
  const праща = т => изр(`(() => { document.getElementById('roInput').value = ${JSON.stringify(т)}; document.getElementById('roForm').requestSubmit(); return 1; })()`);
  if (арг.nevinen) {
    await праща(арг.nevinen); await пауза(1500);
    const бН = await изр(БЕЛЕЖКА); console.log('\nC0. НЕВИНЕН „' + арг.nevinen + '“ без знание: ' + (бН ? '🔴 ИЗЛЕЗЕ бележка със 112 (' + бН + ')' : '✅ без бележка') + ' · ' + JSON.stringify(await изр(ЧАТ)));
  }
  const tПр = Date.now(); await праща(Т1);
  const тБ = await чакай(БЕЛЕЖКА + ' > 0', 3000);
  console.log('\nC1. „' + Т1 + '“ без знание: ' + (тБ >= 0 ? (тБ <= 1000 ? '✅' : '🟠') + ' бележка със 112 след ' + тБ + ' ms (опит през 100 ms)' : '🔴 няма бележка за 3 s'));
  await пауза(Math.max(0, 1500 - (Date.now() - tПр)));
  const Cпреди = await изр(ЧАТ); console.log('\nC. СТАЯ „Здраве и SOS“ → Попитай („' + Т1 + '“, 1,5 s след изпращане, ' + т() + '):\n   ' + JSON.stringify(Cпреди));
  // ── D. търсачката (над стаята) ──
  await изр("BL_SEARCH.open(); 1"); await пауза(800);
  await изр(`(() => { const i = document.getElementById('searchInput'); i.value = ${JSON.stringify(Т1)}; i.dispatchEvent(new Event('input', { bubbles: true })); return 1; })()`);
  await пауза(800);
  const ТЪРС = "(() => { const b = document.getElementById('searchResults'); return { текст: (b.textContent || '').trim().slice(0, 100), sos: !!b.querySelector('.sf-sos') }; })()";
  const Dпреди = await изр(ТЪРС); console.log('\nD. ТЪРСАЧКАТА („' + Т1 + '“, 0,8 s, ' + т() + '):\n   ' + JSON.stringify(Dпреди));
  // ── след като знанието дойде ──
  if (await чакай('!!window.KB', ЗАДРЪЖ + 60000) < 0) { console.log('🔴 знанието не дойде'); }
  const тKB = Date.now(); console.log('\n  window.KB се появи (t=' + (тKB - t0) + ' ms; ' + (тKB - пуснат) + ' ms след пускането)');
  const тD = await чакай(ТЪРС.replace('return {', 'const r = {').replace(' }; })()', ' }; return r.sos; })()'), 8000);
  const Dслед = await изр(ТЪРС); console.log('D. търсачката след знанието: ' + (тD >= 0 ? '✅ тревога след ' + тD + ' ms' : '🔴 няма тревога за 8 s') + ' · ' + JSON.stringify(Dслед));
  await изр("BL_SEARCH.close(); 1"); await пауза(400);
  const тC = await чакай(ЧАТ.replace('return { точки', 'const r = { точки').replace(" }; })()", " }; return r.тревога; })()"), 8000);
  const Cслед = await изр(ЧАТ); console.log('C. стаята след знанието: ' + (тC >= 0 ? '✅ тревога ' + тC + ' ms след KB (+ ~0,5 s затваряне на търсачката)' : '🔴 няма тревога за 8 s') + ' · ' + JSON.stringify(Cслед));
  console.log('\nГРЕШКИ (' + грешки.length + '):'); грешки.forEach(г => console.log('   t=' + г.t + ' ms · ' + г.текст + ' · ' + г.къде));
  край(0);
})();
