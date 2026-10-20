// 🧸 РАЗТЕГНАТИ ПЛЮШЕНИ — лови рисунка (спрайт от img/art/ico-*.webp), чиято кутия не е
// квадратна: тогава 400%×400% листът се разтяга на овал. Минава всичките 9 стаи,
// превърта всяка до дъно (с истински кадри), после мери.
// ПУСКАНЕ: node razpyani.js [--port 8911] [--room "Име"]
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; }
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ПРОФИЛ = path.join(__dirname, 'chrome_rz_' + Date.now());
const ПОРТ = 9200 + Math.floor(Math.random() * 700);
const пауза = ms => new Promise(r => setTimeout(r, ms));
const СТАИ = арг.room ? [арг.room] : ['Моето бебе', 'Захранване', 'Развитие и игри', 'Здраве и SOS', 'Бременност', 'Жената в мен', 'Дневник на мама', 'Инструменти', 'Лабораторията'];
const КАДРИ = n => `new Promise(r => { let k = 0; const f = () => (++k >= ${n} ? r(1) : requestAnimationFrame(f)); requestAnimationFrame(f); })`;
// --tseli: елементите от ЦЕЛИ (pl-plyush.js), в които след емоджито има ТЕКСТ — след поправката
//   от 06.10 те вече не стават цяла рисунка; гледаме дали текстът им се побира в кутията.
const ЦЕЛИ = '.pin-btn, .ask-mic, .rg-e, .dv-mslbl, .dv-flag, .search-ico, .sf-mic, .sr-e, .jr-medal, .pl-em, .pg20-fruit, .bb-big, .td-big, .rm-e, .sos-e, .ck-e, .pl-dn-face, .np-b > span, .ch-emo, .qa-e, .wk-e';
const ЛОВ_Ц = `(() => {
  const ЕМ = /^\\s*(\\p{Extended_Pictographic}(?:\\uFE0F|\\u200D\\p{Extended_Pictographic}|\\p{Emoji_Modifier}|\\uFE0F\\u20E3)*)/u;
  const н = [];
  for (const е of document.querySelectorAll(${JSON.stringify(ЦЕЛИ)})) {
    const т = е.textContent || '', м = т.match(ЕМ); if (!м || т.trim().length <= м[0].trim().length) continue;
    const к = е.getBoundingClientRect(); if (к.width < 2) continue;
    н.push({ кл: е.tagName + '.' + String(е.className).split(' ').slice(0, 3).join('.'), р: Math.round(к.width) + '×' + Math.round(к.height),
      текст: т.trim().slice(0, 40), прелива: е.scrollWidth > е.clientWidth + 2 || е.scrollHeight > е.clientHeight + 2 });
  }
  const видени = new Set(); return н.filter(x => { const к = x.кл + x.текст; if (видени.has(к)) return false; видени.add(к); return true; });
})()`;
const ЛОВ = арг.tseli ? ЛОВ_Ц : `(() => {
  const н = [];
  for (const е of document.querySelectorAll('#roomOverlay [data-pl-pl], #roomOverlay .pl-pl, #plHome [data-pl-pl], #plHome .pl-pl')) {
    const к = е.getBoundingClientRect(); if (к.width < 6 || к.height < 6) continue;
    const s = getComputedStyle(е); if (s.display === 'none' || s.visibility === 'hidden') continue;
    if (!/ico-|art\\//.test(s.backgroundImage)) continue;
    const отн = к.width / к.height;
    if (отн > 1.25 || отн < 0.8) {
      const р = е.parentElement;
      н.push({ кл: (е.tagName + '.' + String(е.className).split(' ').slice(0, 4).join('.')), р: Math.round(к.width) + '×' + Math.round(к.height),
        род: р ? (р.tagName + '.' + String(р.className).split(' ').slice(0, 3).join('.')) : '', текст: (е.textContent || '').trim().slice(0, 12),
        карта: (е.closest('.jr-card') && (е.closest('.jr-card').querySelector('.jr-title') || {}).textContent || '').trim().slice(0, 30) });
    }
  }
  const видени = new Set(); return н.filter(x => { const к = x.кл + x.р + x.род; if (видени.has(к)) return false; видени.add(к); return true; });
})()`;
(async () => {
  await require('./slot.js')('chrome');   // 🚦 20.10 опашката (slot.js) — ПЪТ НАЗАД: махни този ред
  const ch = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=390,844', 'about:blank'], { stdio: 'ignore' });
  let цел; for (let i = 0; i < 80 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + ПОРТ + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
  const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let n = 0; const ч = new Map();
  ws.onmessage = e => { const м = JSON.parse(e.data); if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); } };
  const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  const изр = async x => { const р = await send('Runtime.evaluate', { expression: x, awaitPromise: true, returnByValue: true }); return р.result.exceptionDetails ? { ГРЕШКА: р.result.exceptionDetails.text } : р.result.result.value; };
  const зареди = async () => { for (let i = 0; i < 120; i++) { await пауза(300); if (await изр("document.readyState === 'complete' && !!window.MamaHelper") === true) break; } await пауза(1500); };
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await send('Page.navigate', { url: 'http://localhost:' + (арг.port || 8911) + '/' }); await зареди();
  await изр(`(() => { localStorage.clear(); const s = (k, v) => localStorage.setItem(k, JSON.stringify(v)); s('bl_onboarded', true); localStorage.setItem('bl_tour_done','1'); s('bl_hero_toured', true); s('bl_mama',{name:'Мария'}); s('bl_baby', { name: 'Алекс', birth: '2026-03-20', sex: 'boy' }); return 1; })()`);
  await send('Page.reload'); await зареди();
  const всичко = {};
  // първо началото
  await изр(`(async () => { for (let i = 0; i < 30; i++) { scrollBy(0, 700); await ${КАДРИ(6)}; } scrollTo(0, 0); await ${КАДРИ(10)}; return 1; })()`);
  всичко['НАЧАЛО'] = await изр(ЛОВ);
  for (const стая of СТАИ) {
    await изр(`(() => { MamaHelper.open(${JSON.stringify(стая)}); return 1; })()`); await пауза(2000);
    await изр(`(async () => { const к = [...document.querySelectorAll('#roomOverlay *')].filter(e => e.scrollHeight > e.clientHeight + 40 && /(auto|scroll)/.test(getComputedStyle(e).overflowY)).sort((a, b) => b.clientHeight - a.clientHeight)[0];
      if (!к) return 0; for (let i = 0; i < 60; i++) { const п = к.scrollTop; к.scrollTop += 600; await ${КАДРИ(6)}; if (к.scrollTop === п) break; } return 1; })()`);
    await изр(КАДРИ(20));
    всичко[стая] = await изр(ЛОВ);
    await изр(`(() => { const x = document.querySelector('#roomOverlay .ro-x, #roomOverlay [aria-label*="Затвори"]'); if (x) x.click(); else if (window.MamaHelper && MamaHelper.close) MamaHelper.close(); return 1; })()`); await пауза(900);
  }
  fs.writeFileSync(path.join(__dirname, 'razpyani.json'), JSON.stringify(всичко, null, 1));
  for (const к in всичко) { const с = всичко[к]; console.log(к + ': ' + (Array.isArray(с) ? с.length : JSON.stringify(с))); if (Array.isArray(с)) с.slice(0, 12).forEach(x => console.log('   ' + x.р + '  ' + x.кл + (x.род ? '  ← ' + x.род : '') + (x.карта ? '  [' + x.карта + ']' : '') + (x.текст ? '  „' + x.текст + '“' + (x.прелива ? '  🔴ПРЕЛИВА' : '') : ''))); }
  try { ws.close(); ch.kill(); fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {}
  process.exit(0);
})().catch(e => { console.log('🔴 ' + e.message); process.exit(3); });
