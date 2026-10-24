// 🚪 ПЪТЯТ НА СТАЯТА СЛЕД ОБВИВКАТА (24.10.2026) — helper.js · BL_OTVORI_BARZO: панелът веднага, open() кадър по-късно.
// Проверява, че нищо не се е счупило: натиск по плочка → панелът видим В СЪЩИЯ кадър (заглавие, скелет, табове на
// ТАЗИ стая) → после съдържание, банер, аврората последна (roomfx), фокус на ✕, история; чатът (поздрав, отговор,
// превъртян до дъното, чипове); долната лента; заключеният дневник (обвивка НЕ, ПИН-ът е пръв); превъртането пази.
// ПУСКАНЕ: node dev/proba/staya_proba.js [--port 8912]   · изход 0 = всичко минава
const { spawn } = require('child_process'); const path = require('path'); const fs = require('fs');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; } }
const пауза = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await require('./slot.js')('chrome');
  const ПРОФИЛ = path.join(__dirname, 'chrome_pr_st_' + Date.now()); const ПОРТ = 9200 + Math.floor(Math.random() * 700);
  const ch = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=390,844', 'about:blank'], { stdio: 'ignore' });
  let цел; for (let i = 0; i < 80 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + ПОРТ + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
  const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let n = 0; const ч = new Map(); const грешки = [];
  const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  ws.onmessage = e => { const м = JSON.parse(e.data); if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); } if (м.method === 'Runtime.exceptionThrown') грешки.push((м.params.exceptionDetails.exception && м.params.exceptionDetails.exception.description || м.params.exceptionDetails.text).split('\n')[0]); };
  const изр = async x => { const р = await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true }); return р.result && р.result.result ? р.result.result.value : null; };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  const АДР = 'http://localhost:' + (арг.port || 8912) + '/';
  await send('Page.navigate', { url: АДР + 'manifest.webmanifest' }); await пауза(700);
  await изр(`(() => { localStorage.clear(); const s = (k, v) => localStorage.setItem(k, JSON.stringify(v)); s('bl_onboarded', true); localStorage.setItem('bl_tour_done','1'); s('bl_hero_toured', true); s('bl_day1','2026-08-01'); s('bl_mama',{name:'Мария'}); s('bl_baby', { name: 'Алекс', birth: '2026-03-20', sex: 'boy' }); s('bl_pin', '1234'); return 1; })()`);
  await send('Page.navigate', { url: АДР });
  for (let i = 0; i < 240; i++) { await пауза(250); try { if (await изр("!document.getElementById('blSplash') && !!document.querySelector('.pl-room')")) break; } catch (e) {} }
  await пауза(1500);
  for (let i = 0; i < 4 && await изр("!!document.querySelector('.md-veil.on')"); i++) { await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }); await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }); await пауза(500); }
  const рез = []; let добре = true; const пр = (име, усл, дет) => { рез.push((усл ? '✅ ' : '🔴 ') + име + (дет ? ' · ' + дет : '')); if (!усл) добре = false; };

  // 1 · натиск по плочка — панелът в СЪЩИЯ кадър (синхронно след click)
  const СТАЯ = 'Жената в мен';
  await изр(`document.querySelector('.pl-room[data-room="${СТАЯ}"]').scrollIntoView({ block: 'center', behavior: 'instant' })`); await пауза(600);
  const скролПреди = await изр('scrollY');
  const веднага = JSON.parse(await изр(`(() => { document.querySelector('.pl-room[data-room="${СТАЯ}"]').click();
    const о = document.getElementById('roomOverlay'), р = document.getElementById('roRoom');
    return JSON.stringify({ видим: !о.hidden, заглавие: document.getElementById('roTitle').textContent, скелет: !!р.querySelector('.ro-skel'), деца: р.children.length,
      таб: (document.querySelector('#roTabs .ro-tab.on') || {}).dataset ? document.querySelector('#roTabs .ro-tab.on').dataset.tab : null, банер: !!(document.getElementById('roBanner') && document.getElementById('roBanner').firstChild) }); })()`));
  пр('натиск → панелът видим веднага', веднага.видим && веднага.заглавие === СТАЯ, JSON.stringify(веднага));
  пр('обвивката: скелет, табът „стаята“, банерът на ТАЗИ стая', веднага.скелет && веднага.таб === 'room');
  await пауза(1800);
  const после = JSON.parse(await изр(`(() => { const р = document.getElementById('roRoom'); const деца = [...р.children];
    return JSON.stringify({ деца: деца.length, последно: (деца[деца.length - 1] || {}).className || '', аврори: р.querySelectorAll(':scope > .rmx-aurora').length, банер: !!(document.getElementById('roBanner') && document.getElementById('roBanner').firstChild),
      банери: document.querySelectorAll('#roBanner > *').length, фокус: document.activeElement && document.activeElement.id, история: !!(history.state && history.state.blRoom === '${СТАЯ}'), заглавиеСтр: document.title, табове: [...document.querySelectorAll('#roTabs .ro-tab')].map(т => т.dataset.tab).join(',') }); })()`));
  пр('съдържанието е построено', после.деца > 3, 'деца ' + после.деца);
  пр('аврората е ПОСЛЕДНО дете и една (roomfx)', /rmx-aurora/.test(после.последно) && после.аврори === 1, после.последно + ' · ' + после.аврори);
  пр('банерът е един', после.банер && после.банери === 1, 'банери ' + после.банери);
  пр('фокус на ✕, история, заглавие', после.фокус === 'roClose' && после.история && /Жената в мен/.test(после.заглавиеСтр), после.фокус + ' · ' + после.история);
  пр('табовете не са удвоени', после.табове.split(',').length === new Set(после.табове.split(',')).size, после.табове);

  // 2 · чатът: поздрав, въпрос, отговор, превъртян до дъното, чипове
  await изр("MamaHelper.showTab('chat')"); await пауза(2200);
  const поздрав = await изр("document.querySelectorAll('#roChat .msg.bot').length");
  пр('поздравът дойде', поздрав >= 1, 'мехури ' + поздрав);
  await изр("MamaHelper.ask('колко трябва да спи бебе на 7 месеца')"); await пауза(3500);
  const чат = JSON.parse(await изр(`(() => { const c = document.getElementById('roChat'); return JSON.stringify({ бот: c.querySelectorAll('.msg.bot').length, мама: c.querySelectorAll('.msg.user').length, дъно: c.scrollHeight - c.scrollTop - c.clientHeight, чипове: document.querySelectorAll('#roChips .ro-chip').length, пише: !!document.getElementById('roTyping') }); })()`));
  пр('отговорът дойде, „пише…“ е махнато', чат.бот >= 2 && чат.мама === 1 && !чат.пише, JSON.stringify(чат));
  пр('чатът е превъртян до дъното', чат.дъно <= 4, 'остават ' + Math.round(чат.дъно) + ' px');
  пр('чипове под отговора', чат.чипове >= 1, 'чипове ' + чат.чипове);
  // затваряне → превъртането на началото е на място
  await изр("document.getElementById('roClose').click()"); await пауза(1200);
  const скролСлед = await изр('scrollY');
  пр('затвори се и превъртането е на място', await изр("document.getElementById('roomOverlay').hidden") && скролСлед === скролПреди, скролПреди + ' → ' + скролСлед);

  // 3 · долната лента („Моето бебе“) — също бързият път
  const лента = JSON.parse(await изр(`(() => { const б = document.querySelector('.bn-item[data-room]'); if (!б) return JSON.stringify({ няма: true }); const стая = б.dataset.room; б.click(); return JSON.stringify({ стая, видим: !document.getElementById('roomOverlay').hidden, заглавие: document.getElementById('roTitle').textContent }); })()`));
  пр('долната лента → панелът веднага', лента.няма || (лента.видим && лента.заглавие === лента.стая), JSON.stringify(лента));
  await пауза(1500);
  пр('… и съдържанието', await изр("document.getElementById('roRoom').querySelectorAll(':scope > :not(.ro-skel)').length > 2"));
  await изр("document.getElementById('roClose').click()"); await пауза(1000);

  // 4 · заключеният дневник: обвивка НЕ — първо ПИН-ът
  const дн = JSON.parse(await изр(`(() => { window.BL_OTVORI_BARZO('Дневник на мама'); return JSON.stringify({ стая: !document.getElementById('roomOverlay').hidden, пин: !!document.getElementById('pinOverlay') && !document.getElementById('pinOverlay').hidden && document.getElementById('pinOverlay').getClientRects().length > 0 }); })()`));
  пр('заключен дневник: ПИН-ът, не стаята', дн.пин && !дн.стая, JSON.stringify(дн));
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }); await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });

  // 5 · двоен допир — една стая, без грешки
  await пауза(800);
  const двоен = await изр(`(async () => { const п = document.querySelector('.pl-room[data-room="Здраве и SOS"]'); п.click(); п.click(); await new Promise(r => setTimeout(r, 1500)); return document.querySelectorAll('#roRoom > .rmx-aurora').length + '/' + document.querySelectorAll('#roBanner > *').length; })()`);
  пр('двоен допир → една аврора, един банер', двоен === '1/1', двоен);

  пр('0 JS грешки', грешки.length === 0, грешки.slice(0, 4).join(' | '));
  console.log(рез.join('\n'));
  console.log(добре ? 'СТАЯТА: всичко минава' : 'СТАЯТА: има паднали');
  try { ws.close(); } catch (e) {} try { ch.kill(); } catch (e) {} await пауза(400); try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {}
  process.exit(добре ? 0 : 1);
})().catch(e => { console.log('🔴 ' + e.message); process.exit(3); });
