// ⚡ ЗНАНИЕТО ОТДЕЛНО (14.11.2026) — js/kb.js (1,55 МБ) вече е async и не спира старта.
// Пробата ЗАДЪРЖА kb.js (CDP Fetch) за --zad секунди и в това време: мери кога излиза началото, отваря
// деветте стаи, пита помощничката нормален и спешен въпрос → отговорите идват ЧАК след знанието,
// нищо не гърми. После без задръжка: времето до началото с и без знанието.
// ПУСКАНЕ: node dev/proba/kb_async_proba.js [--port 8912] [--zad 6] [--cpu 4]
const { spawn } = require('child_process'); const path = require('path'); const fs = require('fs');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; } }
const ЗАД = +(арг.zad || 240) * 1000, CPU = +(арг.cpu || 4);   // ЗАД е само предпазител: пробата пуска знанието сама, след въпросите
const пауза = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await require('./slot.js')('chrome');
  const ПРОФИЛ = path.join(__dirname, 'chrome_pr_kb_' + Date.now()); const ПОРТ = 9200 + Math.floor(Math.random() * 700);
  const ch = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=390,844', 'about:blank'], { stdio: 'ignore' });
  let цел; for (let i = 0; i < 80 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + ПОРТ + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
  const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let n = 0; const ч = new Map(); const грешки = []; let kbПуснат = 0, kbЗадържан = 0;
  const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  ws.onmessage = e => { const м = JSON.parse(e.data); if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); }
    if (м.method === 'Runtime.exceptionThrown') { const д = м.params.exceptionDetails; const к = (д.stackTrace && д.stackTrace.callFrames || []).slice(0, 3).map(ф => (ф.functionName || '·') + '@' + String(ф.url).split('/').pop().split('?')[0] + ':' + (ф.lineNumber + 1)).join(' ← ');
      грешки.push((д.exception && д.exception.description || д.text).split('\n')[0] + ' [' + (к || (String(д.url || '').split('/').pop() + ':' + (д.lineNumber + 1))) + ']'); }
    if (м.method === 'Fetch.requestPaused') { const id = м.params.requestId;
      // знанието се държи, докато пробата не го пусне сама (пусниЗнанието) — под товар времената плуват; ЗАД е само предпазител
      if (/\/js\/kb\.js/.test(м.params.request.url) && задържай) { kbЗадържан = Date.now(); kbИд = id; setTimeout(пусниЗнанието, ЗАД); }
      else send('Fetch.continueRequest', { requestId: id }); } };
  let задържай = true, kbИд = null;
  function пусниЗнанието() { if (kbИд && !kbПуснат) { kbПуснат = Date.now(); send('Fetch.continueRequest', { requestId: kbИд }); } }
  const изр = async x => { const р = await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true }); return р.result && р.result.result ? р.result.result.value : null; };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send('Emulation.setCPUThrottlingRate', { rate: CPU });
  const АДР = 'http://localhost:' + (арг.port || 8912) + '/';
  await send('Page.navigate', { url: АДР + 'manifest.webmanifest' }); await пауза(700);
  await изр(`(() => { localStorage.clear(); const s = (k, v) => localStorage.setItem(k, JSON.stringify(v)); s('bl_onboarded', true); localStorage.setItem('bl_tour_done','1'); s('bl_hero_toured', true); s('bl_day1','2026-08-01'); s('bl_mama',{name:'Мария'}); s('bl_baby', { name: 'Алекс', birth: '2026-03-20', sex: 'boy' }); return 1; })()`);
  await send('Fetch.enable', { patterns: [{ urlPattern: '*', requestStage: 'Request' }] });
  const т0 = Date.now(); await send('Page.navigate', { url: АДР });
  let доНачало = null;
  for (let i = 0; i < 200; i++) { await пауза(100); if (await изр("!document.getElementById('blSplash') && !!document.querySelector('.pl-room')")) { доНачало = Date.now() - т0; break; } }
  const kbПреди = await изр('!!window.KB');
  const заст = await изр("JSON.stringify({ причина: window.BL_SPLASH && BL_SPLASH.причина, мс: window.BL_SPLASH && BL_SPLASH.мс, dcl: Math.round(performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd) })");
  const рез = []; const пр = (име, усл, дет) => рез.push((усл ? '✅ ' : '🔴 ') + име + (дет != null ? ' · ' + дет : ''));
  пр('началото излиза, ДОКАТО знанието е задържано', доНачало != null && !kbПреди, доНачало + ' ms · KB е ' + (kbПреди ? 'вече тук' : 'още го няма') + ' · kb.js поискан на ' + (kbЗадържан ? kbЗадържан - т0 : '—') + ' ms · ' + заст);
  // търсачката на началото: спешен въпрос ПРЕДИ знанието → „секунда“, после сама дава 112
  const търсиПреди = await изр(`(() => { if (!window.BL_SEARCH) return 'няма BL_SEARCH'; BL_SEARCH.open(); const в = document.getElementById('searchInput'); в.value = 'бебето не диша'; в.dispatchEvent(new Event('input', { bubbles: true })); return (document.getElementById('searchResults').innerText || '').replace(/\\s+/g, ' ').slice(0, 60); })()`);
  const kbПриТърсене = await изр('!!window.KB');
  if (kbПриТърсене) рез.push('⚠️ търсачката: знанието вече беше тук');
  else пр('търсачката преди знанието казва „секунда“ и не гърми', /Секунда/.test(търсиПреди || '') && !грешки.length, търсиПреди);
  // пазачът (guard.js) на обикновено поле: тежко изречение ПРЕДИ знанието → лентата идва, щом знанието дойде
  await изр(`(() => { const п = document.createElement('textarea'); п.id = 'probaPazach'; document.body.appendChild(п); п.value = 'не ми се живее вече'; if (!window.BL_GUARD) return 'няма BL_GUARD'; BL_GUARD.провери(п); п.value = ''; return 1; })()`);   // headless няма фокус → blur не идва; викаме същото, което вика blur
  await пауза(400);
  const лентаПреди = await изр("!!document.querySelector('.gd-band')");
  // деветте стаи без знание
  for (const с of ['Бременност', 'Моето бебе', 'Захранване', 'Здраве и SOS', 'Дневник на мама', 'Развитие и игри', 'Инструменти', 'Жената в мен', 'Лабораторията']) {
    await изр(`(() => { try { MamaHelper.open(${JSON.stringify(с)}); } catch (e) { return 'X ' + e.message; } return 1; })()`); await пауза(500);
  }
  пр('деветте стаи се отварят без знанието', !грешки.length, грешки.slice(0, 3).join(' | ') || '0 грешки');
  // въпрос в чата, докато знанието го няма
  await изр(`(() => { MamaHelper.open('Моето бебе'); MamaHelper.showTab && MamaHelper.showTab('chat'); return 1; })()`); await пауза(600);
  const подай = q => изр(`(() => { const в = document.getElementById('roInput'); const f = document.getElementById('roForm'); в.value = ${JSON.stringify(q)}; f.requestSubmit ? f.requestSubmit() : f.dispatchEvent(new Event('submit', { cancelable: true })); return document.querySelectorAll('#roChat .msg').length; })()`);
  const брой = () => изр("document.querySelectorAll('#roChat .msg').length");
  // поздравът на стаята идва с анимация — чакаме чатът да утихне (1,5 s без ново съобщение), иначе той се брои за „отговор“
  { let пред = -1, тихо = 0; for (let i = 0; i < 10 && тихо < 3; i++) { const с = await брой(); тихо = с === пред ? тихо + 1 : 0; пред = с; await пауза(500); } }
  const kbПриВъпроса = await изр('!!window.KB'); const тВъпрос = Date.now() - т0;
  const б0 = await брой(); await подай('кога се дава вода на бебето'); await пауза(400);
  const чакаТочки = await изр("!!document.querySelector('#roChat .typing, #roChat .msg.typing, .ro-typing:not([hidden])')");
  const б1 = await брой();
  // кои са новите съобщения — и колко от тях са ОТГОВОР с текст (не въпросът на мама, не точките)
  const новите = await изр(`[...document.querySelectorAll('#roChat .msg')].slice(${б0}).map(м => м.className + ': ' + (м.innerText || '').replace(/\\s+/g, ' ').slice(0, 40)).join(' ¦ ')`);
  const отговорПреди = await изр(`[...document.querySelectorAll('#roChat .msg')].slice(${б0}).filter(м => !/user|typing/.test(м.className) && (м.innerText || '').trim().length > 3).length`);
  if (kbПриВъпроса) рез.push('⚠️ въпросът е зададен на ' + тВъпрос + ' ms, знанието вече беше тук — пусни с по-голямо --zad');
  else пр('въпрос преди знанието: не отговаря „не знам“, а чака', отговорПреди === 0, 'на ' + тВъпрос + ' ms · съобщения +' + (б1 - б0) + (чакаТочки ? ' · три точки' : '') + ' · ' + новите);
  пусниЗнанието();
  for (let i = 0; i < 900 && !(await изр('!!window.KB')); i++) await пауза(100);
  await пауза(2500);
  // пазачът: полето е изчистено („скъсано“), но написаното преди знанието се проверява, щом то дойде
  const лентаСлед = await изр("(() => { const л = document.querySelector('.gd-band'); return л ? (л.innerText || '').replace(/\\s+/g, ' ').slice(0, 60) : ''; })()");
  пр('пазачът: тежко изречение преди знанието → лентата идва сама', !лентаПреди && !!лентаСлед, лентаПреди ? 'лентата беше още преди знанието (не мери)' : (лентаСлед || 'няма лента'));
  // търсачката (отворена ли е още) трябва сама да е дала 112, щом знанието дойде
  if (!kbПриТърсене) { const сл = await изр(`(() => { const ов = document.getElementById('searchOverlay'); const т = (document.getElementById('searchResults').innerText || '').replace(/\\s+/g, ' '); return (ов && !ов.hidden ? 'отворена · ' : 'затворена · ') + (/112/.test(т) ? '[112 ✓] ' : '[без 112] ') + т.slice(0, 60); })()`);
    if (/^затворена/.test(сл || '')) рез.push('⚠️ търсачката се затвори по пътя — „сама дава 112“ не е мерено');
    else пр('търсачката след знанието: сама дава 112', /\[112 ✓\]/.test(сл || ''), сл); }
  // най-дългото съобщение на помощничката СЛЕД въпроса — истински отговор, не точки и не празен балон
  for (let i = 0; i < 20; i++) { if (await изр(`[...document.querySelectorAll('#roChat .msg')].slice(${б0}).some(м => !/user|typing/.test(м.className) && (м.innerText || '').trim().length > 40)`)) break; await пауза(500); }
  const отг = await изр(`[...document.querySelectorAll('#roChat .msg')].slice(${б0}).filter(м => !/user|typing/.test(м.className)).map(м => (м.innerText || '').trim()).sort((а, б) => б.length - а.length)[0] || ''`);
  пр('след знанието отговорът идва сам', (отг || '').length > 40, (отг || '(няма отговор)').replace(/\s+/g, ' ').slice(0, 70));
  // спешен въпрос веднага след знанието
  const бСп = await брой(); await подай('бебето не диша');
  // под товар отговорът закъснява — чакаме до 15 s съобщение със 112 СЛЕД въпроса (не четем старото)
  for (let i = 0; i < 30; i++) { await пауза(500); if (await изр(`[...document.querySelectorAll('#roChat .msg')].slice(${бСп}).some(м => /112/.test(м.innerText || ''))`)) break; }
  const сп = await изр(`[...document.querySelectorAll('#roChat .msg')].slice(${бСп}).map(м => м.innerText || '').filter(т => /112/.test(т))[0] || '(няма 112 след въпроса)'`);
  пр('спешният въпрос дава 112', /112/.test(сп || ''), (сп || '').replace(/\s+/g, ' ').slice(0, 60));
  пр('0 JS грешки', !грешки.length, грешки.slice(0, 5).join(' | '));
  // втори старт: без задръжка (знанието от кеша/мрежата нормално)
  задържай = false; const т1 = Date.now(); await send('Page.reload', { ignoreCache: false });
  let доНачало2 = null; for (let i = 0; i < 200; i++) { await пауза(100); if (await изр("!document.getElementById('blSplash') && !!document.querySelector('.pl-room')")) { доНачало2 = Date.now() - т1; break; } }
  пр('втори старт (без задръжка)', доНачало2 != null, доНачало2 + ' ms · CPU ×' + CPU);
  console.log(рез.join('\n')); console.log(рез.some(x => x.startsWith('🔴')) ? 'ИМА ПАДНАЛИ' : 'ВСИЧКО МИНАВА');
  try { ws.close(); } catch (e) {} try { ch.kill(); } catch (e) {} await пауза(500); try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {}
})();
