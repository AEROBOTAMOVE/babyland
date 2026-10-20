// ⚖️ ТЕЖЕСТТА ПРИ СТАРТ (20.10.2026) — колко бави приложението на „телефон“ (процесор ×4 по-бавен).
// Мери: първо рисуване (FCP), DOMContentLoaded, load, кога MamaHelper е готов, дългите задачи (> 50 ms)
// по време на старта, ScriptDuration/TaskDuration от CDP, байтовете на най-тежките скриптове, паметта.
// ПУСКАНЕ: node tezhest.js [--port 8911] [--cpu 4] [--pati 3] [--out ime]   → snimki/<ime>_tezhest.json
// Чака слот от опашката (slot.js) — не се бие с другите проби.
const { spawn } = require('child_process');
const fs = require('fs'); const path = require('path');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; } }
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ПАПКА = path.join(__dirname, 'snimki'); fs.mkdirSync(ПАПКА, { recursive: true });
const ПАТИ = Number(арг.pati || 3), CPU = Number(арг.cpu || 4), ИМЕ = арг.out || 'tezhest';
const пауза = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await require('./slot.js')('chrome');
  const резултати = [];
  for (let п = 0; п < ПАТИ; п++) {
    const ПРОФИЛ = path.join(__dirname, 'chrome_pr_tz_' + Date.now() + '_' + п); const ПОРТ = 9200 + Math.floor(Math.random() * 700);
    const ch = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=390,844', 'about:blank'], { stdio: 'ignore' });
    let цел; for (let i = 0; i < 80 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + ПОРТ + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
    if (!цел) { console.log('🔴 Chrome не тръгна'); try { ch.kill(); } catch (e) {} continue; }
    const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
    let n = 0; const ч = new Map(); ws.onmessage = e => { const м = JSON.parse(e.data); if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); } };
    const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
    const изр = async x => { const р = await send('Runtime.evaluate', { expression: x, awaitPromise: true, returnByValue: true }); return р.result.exceptionDetails ? { ГРЕШКА: String((р.result.exceptionDetails.exception || {}).description || '').slice(0, 200) } : р.result.result.value; };
    await send('Page.enable'); await send('Runtime.enable'); await send('Performance.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    // профилът на майка с бебе — иначе първото пускане показва обиколката, не началото
    await send('Page.navigate', { url: 'http://localhost:' + (арг.port || 8911) + '/manifest.webmanifest' }); await пауза(800);
    await изр(`(() => { localStorage.clear(); const s = (k, v) => localStorage.setItem(k, JSON.stringify(v)); s('bl_onboarded', true); localStorage.setItem('bl_tour_done','1'); s('bl_hero_toured', true); s('bl_day1','2026-08-01'); s('bl_mama',{name:'Мария'}); s('bl_baby', { name: 'Алекс', birth: '2026-03-20', sex: 'boy' }); return 1; })()`);
    await send('Emulation.setCPUThrottlingRate', { rate: CPU });
    // наблюдателят за дълги задачи трябва да е там ОТ ПЪРВИЯ ред на страницата
    await send('Page.addScriptToEvaluateOnNewDocument', { source: `window.__dalgi = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__dalgi.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({ type: 'longtask', buffered: true }); } catch (e) {}` });
    if (арг.profil) { await send('Profiler.enable'); await send('Profiler.setSamplingInterval', { interval: 200 }); await send('Profiler.start'); }
    const т0 = Date.now();
    await send('Page.navigate', { url: 'http://localhost:' + (арг.port || 8911) + '/' });
    let готов = null; for (let i = 0; i < 400; i++) { await пауза(100); if (await изр('!!window.MamaHelper && document.readyState === "complete"') === true) { готов = Date.now() - т0; break; } }
    await пауза(3000);
    if (арг.profil) require('./profil_obobshti.js')((await send('Profiler.stop')).result.profile);
    const м = await изр(`(() => { const nav = performance.getEntriesByType('navigation')[0] || {}; const fcp = (performance.getEntriesByName('first-contentful-paint')[0] || {}).startTime;
      const рес = performance.getEntriesByType('resource'); const скр = рес.filter(r => r.initiatorType === 'script' || /\\.js(\\?|$)/.test(r.name));
      const тежки = скр.map(r => [r.name.replace(location.origin + '/', '').replace(/\\?.*/, ''), Math.round((r.decodedBodySize || r.encodedBodySize || 0) / 1024), Math.round(r.duration)]).sort((a, b) => b[1] - a[1]).slice(0, 8);
      const дълги = window.__dalgi || []; return { fcp: Math.round(fcp || 0), dcl: Math.round(nav.domContentLoadedEventEnd || 0), load: Math.round(nav.loadEventEnd || 0),
        заявки: рес.length + 1, скриптове: скр.length, KB_общо: Math.round(рес.reduce((s, r) => s + (r.decodedBodySize || 0), 0) / 1024),
        дълги_брой: дълги.length, дълги_сбор: дълги.reduce((s, d) => s + d[1], 0), най_дълги: дълги.slice().sort((a, b) => b[1] - a[1]).slice(0, 5),
        памет_MB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null, анимации: document.getAnimations().length, тежки }; })()`);
    const пм = await send('Performance.getMetrics'); const мет = {}; for (const x of (пм.result.metrics || [])) мет[x.name] = x.value;
    м.готов_ms = готов; м.ScriptDuration_ms = Math.round((мет.ScriptDuration || 0) * 1000); м.TaskDuration_ms = Math.round((мет.TaskDuration || 0) * 1000);
    м.LayoutDuration_ms = Math.round((мет.LayoutDuration || 0) * 1000); м.RecalcStyle_ms = Math.round((мет.RecalcStyleDuration || 0) * 1000);
    резултати.push(м);
    console.log('път ' + (п + 1) + ': FCP ' + м.fcp + ' · DCL ' + м.dcl + ' · готов ' + м.готов_ms + ' ms · скрипт ' + м.ScriptDuration_ms + ' ms · дълги задачи ' + м.дълги_брой + ' (' + м.дълги_сбор + ' ms) · заявки ' + м.заявки + ' · анимации ' + м.анимации);
    try { ws.close(); } catch (e) {} try { ch.kill(); } catch (e) {} await пауза(500); try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {}
  }
  const мед = k => { const v = резултати.map(r => r[k]).filter(x => typeof x === 'number').sort((a, b) => a - b); return v.length ? v[Math.floor(v.length / 2)] : null; };
  const обобщ = { cpu: CPU, пъти: резултати.length, FCP: мед('fcp'), DCL: мед('dcl'), готов: мед('готов_ms'), скрипт: мед('ScriptDuration_ms'), задачи: мед('TaskDuration_ms'), стил: мед('RecalcStyle_ms'), подредба: мед('LayoutDuration_ms'), дълги_сбор: мед('дълги_сбор'), памет_MB: мед('памет_MB'), заявки: мед('заявки') };
  console.log('\nМЕДИАНА (×' + CPU + ' по-бавен процесор): ' + JSON.stringify(обобщ));
  if (резултати[0]) console.log('най-тежките скриптове (KB, ms): ' + JSON.stringify(резултати[0].тежки) + '\nнай-дългите задачи [начало, ms]: ' + JSON.stringify(резултати[0].най_дълги));
  fs.writeFileSync(path.join(ПАПКА, ИМЕ + '_tezhest.json'), JSON.stringify({ обобщ, резултати }, null, 1));
  process.exit(0);
})().catch(e => { console.log('🔴 ' + e.message); process.exit(3); });
