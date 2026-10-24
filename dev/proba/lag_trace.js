// 🔬 ЛАГЪТ — ТРАСИРАНЕ НА РИСУВАНЕТО (24.10.2026): в кадъра с натиска на стая — колко е стил (UpdateLayoutTree),
// подреждане (Layout), боядисване (Paint/PrePaint/Layerize), скриптове, разкодиране на картинки, HTML разбор.
// Сумира събитията на главната нишка на страницата от натиска до +1,5 s (×4: +3 s).
// ПУСКАНЕ: node dev/proba/lag_trace.js [--cpu 4] [--port 8912] [--staya "Жената в мен"]
const { spawn } = require('child_process'); const path = require('path'); const fs = require('fs');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; } }
const CPU = Number(арг.cpu || 4), СТАЯ = арг.staya || 'Жената в мен';
const пауза = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await require('./slot.js')('chrome');
  const ПРОФИЛ = path.join(__dirname, 'chrome_pr_tr_' + Date.now()); const ПОРТ = 9200 + Math.floor(Math.random() * 700);
  const ch = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=390,844', 'about:blank'], { stdio: 'ignore' });
  let цел; for (let i = 0; i < 80 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + ПОРТ + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
  const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let n = 0; const ч = new Map(); const събития = []; let трасеКрай = null;
  const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  ws.onmessage = e => { const м = JSON.parse(e.data); if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); }
    if (м.method === 'Tracing.dataCollected') събития.push(...м.params.value); if (м.method === 'Tracing.tracingComplete' && трасеКрай) трасеКрай(); };
  const изр = async x => { const р = await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true }); return р.result && р.result.result ? р.result.result.value : null; };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  const АДР = 'http://localhost:' + (арг.port || 8912) + '/';
  await send('Page.navigate', { url: АДР + 'manifest.webmanifest' }); await пауза(700);
  await изр(`(() => { localStorage.clear(); const s = (k, v) => localStorage.setItem(k, JSON.stringify(v)); s('bl_onboarded', true); localStorage.setItem('bl_tour_done','1'); s('bl_hero_toured', true); s('bl_day1','2026-08-01'); s('bl_mama',{name:'Мария'}); s('bl_baby', { name: 'Алекс', birth: '2026-03-20', sex: 'boy' }); localStorage.setItem('bl_theme','light'); return 1; })()`);
  await send('Page.navigate', { url: АДР });
  for (let i = 0; i < 240; i++) { await пауза(250); try { if (await изр("!document.getElementById('blSplash') && !!document.querySelector('.pl-room')")) break; } catch (e) {} }
  await пауза(1500);
  for (let i = 0; i < 4 && await изр("!!document.querySelector('.md-veil.on')"); i++) { await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }); await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }); await пауза(500); }
  const ПЛ = JSON.stringify('.pl-room[data-room="' + СТАЯ + '"]');
  await изр('document.querySelector(' + ПЛ + ').scrollIntoView({ block: "center", behavior: "instant" })'); await пауза(700);
  const р = JSON.parse(await изр('(() => { const b = document.querySelector(' + ПЛ + ').getBoundingClientRect(); return JSON.stringify({ x: b.left + b.width / 2, y: b.top + b.height / 2 }); })()'));
  await send('Emulation.setCPUThrottlingRate', { rate: CPU }); await пауза(1200);
  await send('Tracing.start', { transferMode: 'ReportEvents', traceConfig: { includedCategories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'blink', 'cc', 'loading', 'v8.execute'], excludedCategories: ['*'] } });
  await пауза(300);
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: р.x, y: р.y });
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: р.x, y: р.y, button: 'left', clickCount: 1 });
  await пауза(90);
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: р.x, y: р.y, button: 'left', clickCount: 1 });
  await пауза(CPU >= 4 ? 3000 : 1500);
  const cv = await изр("['main','header','#plHome'].map(s => { const e = document.querySelector('body > ' + s); return s + ':' + (e ? getComputedStyle(e).contentVisibility : '—'); }).join(' ')");
  await new Promise(r => { трасеКрай = r; send('Tracing.end'); });
  // главната нишка на рендера: тази с най-много събития от devtools.timeline
  const нишки = new Map(); събития.forEach(е => { if (е.cat && е.cat.includes('devtools.timeline') && е.ph === 'X') нишки.set(е.pid + ':' + е.tid, (нишки.get(е.pid + ':' + е.tid) || 0) + 1); });
  const главна = [...нишки.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const натиск = събития.find(е => е.name === 'EventDispatch' && е.args && е.args.data && е.args.data.type === 'click' && (е.pid + ':' + е.tid) === главна);
  const т0 = натиск ? натиск.ts : Math.min(...събития.filter(е => е.ts).map(е => е.ts));
  // първият кадър след натиска: първото „Commit“/„PaintImage“ след края на click
  const кл = натиск ? натиск.ts + (натиск.dur || 0) : т0;
  const комит = събития.filter(е => (е.pid + ':' + е.tid) === главна && /^(Commit|ActivateLayerTree)$/.test(е.name) && е.ts > кл).sort((a, b) => a.ts - b.ts)[0];
  const край = комит ? комит.ts + (комит.dur || 0) : т0 + 1500000;
  console.log('content-visibility при отворена стая: ' + cv);
  console.log('натиск (click) ' + (натиск ? Math.round((натиск.dur || 0) / 1000) + ' ms' : '?') + ' · първи комит след натиска на ' + Math.round((край - т0) / 1000) + ' ms (процесор ×' + CPU + ')');
  // сума по име (само X събития с продължителност, само на главната нишка, само в прозореца натиск → комит), без двойно броене на вложени
  const важни = /^(EventDispatch|FunctionCall|EvaluateScript|TimerFire|FireAnimationFrame|RunMicrotasks|ParseHTML|UpdateLayoutTree|RecalculateStyles|Layout|PrePaint|Paint|Layerize|UpdateLayer|CompositeLayers|Commit|DecodeImage|ImageDecodeTask|HitTest|IntersectionObserverController::computeIntersections|ScrollLayer|MarkDOMContent|GCEvent|MinorGC|MajorGC|V8\.GC.*|BlinkGC.*)$/;
  const сума = new Map(), брой = new Map();
  събития.filter(е => (е.pid + ':' + е.tid) === главна && е.ph === 'X' && е.ts >= т0 && е.ts <= край && важни.test(е.name)).forEach(е => { сума.set(е.name, (сума.get(е.name) || 0) + (е.dur || 0)); брой.set(е.name, (брой.get(е.name) || 0) + 1); });
  console.log('по вид (сумата включва вложеното — стил/подреждане вътре в скрипт се брои и при двете):');
  [...сума.entries()].sort((a, b) => b[1] - a[1]).forEach(([к, мкс]) => console.log('  ' + String(Math.round(мкс / 1000)).padStart(6) + ' ms  ×' + String(брой.get(к)).padEnd(4) + ' ' + к));
  // стил: колко елемента
  const стилове = събития.filter(е => (е.pid + ':' + е.tid) === главна && /^(UpdateLayoutTree|RecalculateStyles)$/.test(е.name) && е.ts >= т0 && е.ts <= край);
  console.log('преизчисления на стила: ' + стилове.map(е => Math.round((е.dur || 0) / 1000) + 'ms/' + ((е.args && (е.args.elementCount || (е.args.data && е.args.data.elementCount) || (е.args.endData && е.args.endData.elementCount))) || '?') + 'ел').join(', '));
  const подр = събития.filter(е => (е.pid + ':' + е.tid) === главна && е.name === 'Layout' && е.ts >= т0 && е.ts <= край);
  console.log('подреждания: ' + подр.map(е => Math.round((е.dur || 0) / 1000) + 'ms/' + ((е.args && е.args.beginData && е.args.beginData.dirtyObjects) || '?') + 'обекта').join(', '));
  try { ws.close(); } catch (e) {} try { ch.kill(); } catch (e) {} await пауза(400); try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {}
  process.exit(0);
})().catch(e => { console.log('🔴 ' + e.message + '\n' + e.stack); process.exit(3); });
