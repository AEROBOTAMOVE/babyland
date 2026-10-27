// 🐢 КОЙ ЗАБАВЯ ЕДИН НАТИСК В СТАЯТА (27.10.2026) — butoni_proba.js показа, че дори „Сгъни карта“ дава кадри
// по 150–200 ms при пълна скорост. Тук: отворена стая → истински допир (CDP мишка) по бутон, намерен по текст →
// всички кадри до +900 ms с разбивка по скрипт (Long Animation Frames: кой го е извикал, колко е НАСИЛЕНО подреждане).
// ПУСКАНЕ: node dev/proba/klik_lag.js --staya "Моето бебе" --butona "Сгъни" [--cpu 1] [--port 8912] [--pati 2]
const { spawn } = require('child_process'); const path = require('path'); const fs = require('fs');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; } }
const СТАЯ = арг.staya || 'Моето бебе', БУТОН = арг.butona || 'Сгъни', CPU = Number(арг.cpu || 1), ПЪТИ = Number(арг.pati || 2);
const пауза = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await require('./slot.js')('chrome');
  const ПРОФИЛ = path.join(__dirname, 'chrome_pr_kl_' + Date.now()); const ПОРТ = 9200 + Math.floor(Math.random() * 700);
  const ch = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=390,844', 'about:blank'], { stdio: 'ignore' });
  let цел; for (let i = 0; i < 80 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + ПОРТ + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
  const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let n = 0; const ч = new Map();
  const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  ws.onmessage = e => { const м = JSON.parse(e.data); if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); } if (м.method === 'Page.javascriptDialogOpening') send('Page.handleJavaScriptDialog', { accept: false }); };
  const изр = async x => { const р = await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true }); return р.result && р.result.result ? р.result.result.value : null; };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  const АДР = 'http://localhost:' + (арг.port || 8912) + '/';
  await send('Page.navigate', { url: АДР + 'manifest.webmanifest' }); await пауза(700);
  await изр(`(() => { localStorage.clear(); const s = (k, v) => localStorage.setItem(k, JSON.stringify(v)); s('bl_onboarded', true); localStorage.setItem('bl_tour_done','1'); s('bl_hero_toured', true); s('bl_day1','2026-08-01'); s('bl_mama',{name:'Мария'}); s('bl_baby', { name: 'Алекс', birth: '2026-03-20', sex: 'boy' }); return 1; })()`);
  await send('Page.navigate', { url: АДР });
  for (let i = 0; i < 240; i++) { await пауза(250); try { if (await изр("!document.getElementById('blSplash') && !!document.querySelector('.pl-room')")) break; } catch (e) {} }
  await пауза(1500);
  for (let i = 0; i < 4 && await изр("!!document.querySelector('.md-veil.on')"); i++) { await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }); await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }); await пауза(500); }
  await изр(`(() => { MamaHelper.open(${JSON.stringify(СТАЯ)}); MamaHelper.showTab('room'); return 1; })()`); await пауза(2500);
  if (CPU > 1) await send('Emulation.setCPUThrottlingRate', { rate: CPU });
  await изр(`(() => { window.__kl = []; new PerformanceObserver(л => л.getEntries().forEach(е => __kl.push({ т: е.startTime, д: е.duration, р: е.renderStart, с: е.styleAndLayoutStart, скр: (е.scripts || []).map(с => ({ кой: с.invoker, вид: с.invokerType, файл: (с.sourceURL || '').replace(/^.*\\/(?=[^/]+$)/, '').replace(/\\?v=\\d+/, ''), фн: с.sourceFunctionName, д: Math.round(с.duration), нас: Math.round(с.forcedStyleAndLayoutDuration) })) }))).observe({ type: 'long-animation-frame' }); return 1; })()`);
  const обобщ = new Map();
  for (let п = 0; п < ПЪТИ; п++) {
    const р = JSON.parse(await изр(`(() => { const е = [...document.querySelectorAll('#roRoom button, #roRoom [role="button"]')].find(x => x.getClientRects().length && (x.getAttribute('aria-label') || x.textContent || '').includes(${JSON.stringify(БУТОН)})); if (!е) return 'null'; е.scrollIntoView({ block: 'center', behavior: 'instant' }); return JSON.stringify({ текст: (е.getAttribute('aria-label') || е.textContent).trim().slice(0, 50) }); })()`) || 'null');
    if (!р) { console.log('няма бутон с „' + БУТОН + '“'); break; }
    await пауза(500);
    const к = JSON.parse(await изр(`(() => { const е = [...document.querySelectorAll('#roRoom button, #roRoom [role="button"]')].find(x => x.getClientRects().length && (x.getAttribute('aria-label') || x.textContent || '').includes(${JSON.stringify(БУТОН)})); const b = е.getBoundingClientRect(); return JSON.stringify({ x: b.left + b.width / 2, y: b.top + b.height / 2 }); })()`));
    const т0 = await изр('performance.now()'); const бр0 = await изр('__kl.length');
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: к.x, y: к.y });
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: к.x, y: к.y, button: 'left', clickCount: 1 });
    await пауза(70);
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: к.x, y: к.y, button: 'left', clickCount: 1 });
    await пауза(900);
    const кадри = JSON.parse(await изр(`JSON.stringify(__kl.slice(${бр0}).filter(к => к.т + к.д > ${т0}))`));
    console.log('\n── натиск ' + (п + 1) + ': „' + р.текст + '“ · кадри над 50 ms: ' + кадри.length);
    кадри.forEach(к => {
      console.log('  кадър +' + Math.round(к.т - т0) + ' (' + Math.round(к.д) + ' ms; рисуване ' + Math.round(к.д - (к.р - к.т)) + ' ms)');
      к.скр.filter(с => с.д >= 3).sort((a, b) => b.д - a.д).forEach(с => { console.log('    ' + String(с.д).padStart(4) + ' ms (насилено ' + с.нас + ')  ' + с.вид + ' · ' + с.кой + ' → ' + (с.фн || '?') + ' @ ' + с.файл); const ключ = с.файл + ' · ' + (с.фн || с.кой); обобщ.set(ключ, (обобщ.get(ключ) || 0) + с.д); });
    });
  }
  console.log('\nОБОБЩЕНО ПО СКРИПТ (ms): ' + [...обобщ.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([к, м]) => к + ' ' + м).join(' · '));
  try { ws.close(); } catch (e) {} try { ch.kill(); } catch (e) {} await пауза(400); try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {}
  process.exit(0);
})().catch(e => { console.log('🔴 ' + e.message); process.exit(3); });
