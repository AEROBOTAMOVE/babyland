// ПРОБА ЗА СТАЯТА „РАЗВИТИЕ И ИГРИ“ (копие на cdp_proba.js, само за агента на pl-igri)
// Един Chrome, двете теми, карта по карта: снимка на всяка карта + ловец на дефекти.
// ПУСКАНЕ: node cdp_proba_igri.js --out ime [--themes light,dark] [--cards "regex"] [--unfold]
//          [--pre файл.js] [--post файл.js] [--maxh 1500] [--top]
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) { арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; } }
const ИМЕ = арг.out || 'igp';
const ТЕМИ = (арг.themes || 'light,dark').split(',');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ПАПКА = path.join(__dirname, 'snimki'); fs.mkdirSync(ПАПКА, { recursive: true });
const ПРОФИЛ = path.join(__dirname, 'chrome_igp_' + Date.now() + '_' + Math.floor(Math.random() * 1e6));
const ПОРТ = 9200 + Math.floor(Math.random() * 700);
const пауза = ms => new Promise(r => setTimeout(r, ms));
const МАКСВ = Number(арг.maxh || 1400);

const ЛОВ = `((к) => {
  const н = { голи_емоджи: [], дребен_текст: [], рязан: [], разтеглени: [], стар_цвят: [], comfortaa: [], нисък_контраст: [] };
  const ЕМ = /\\p{Extended_Pictographic}/u;
  const rgb = s => { const m = String(s).match(/rgba?\\(([^)]+)\\)/); if (!m) return null; const p = m[1].split(/[ ,\\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const лум = c => { const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(c.r) + .7152 * f(c.g) + .0722 * f(c.b); };
  const фон = е => { for (let x = е; x && x !== document.documentElement; x = x.parentElement) { const s = getComputedStyle(x); if (s.backgroundImage !== 'none' && !/url\\(/.test(s.backgroundImage)) return { град: s.backgroundImage.slice(0, 60) }; const c = rgb(s.backgroundColor); if (c && c.a > .85) return c; } return null; };
  const им = е => (е.tagName + '.' + String(е.className && е.className.baseVal !== undefined ? е.className.baseVal : е.className || '').split(' ').filter(Boolean).slice(0, 2).join('.')).slice(0, 44);
  const СТАРИ = ['247, 168, 203', '185, 167, 224', '192, 57, 111', '125, 95, 192', '229, 107, 164', '143, 121, 201', '195, 177, 234'];
  for (const е of к.querySelectorAll('*')) {
    const s = getComputedStyle(е);
    if (s.display === 'none' || s.visibility === 'hidden') continue;
    const р = е.getBoundingClientRect(); if (!р.width || !р.height) continue;
    const свой = [...е.childNodes].filter(x => x.nodeType === 3 && x.nodeValue.trim()).map(x => x.nodeValue.trim()).join(' ');
    if (свой) {
      const прозр = /rgba\\(0, 0, 0, 0\\)/.test(s.color) || s.webkitTextFillColor === 'rgba(0, 0, 0, 0)' || е.closest('.pl-em,.pl-pl');
      if (ЕМ.test(свой) && !прозр) н.голи_емоджи.push(им(е) + ' „' + свой.slice(0, 24) + '“');
      if (parseFloat(s.fontSize) < 11 && !прозр && !/pl-ig-sr|sr-only/.test(е.className)) н.дребен_текст.push(им(е) + ' ' + s.fontSize + ' „' + свой.slice(0, 20) + '“');
      if (/Comfortaa/i.test(s.fontFamily.split(',')[0])) н.comfortaa.push(им(е) + ' „' + свой.slice(0, 20) + '“');
      if (!прозр && +s.opacity > .3) {
        const ц = rgb(s.color), ф = фон(е);
        if (ц && ф && !ф.град) { const l1 = лум(ц), l2 = лум(ф); const кр = (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05); const едър = parseFloat(s.fontSize) >= 18.6 || (parseFloat(s.fontSize) >= 14 && +s.fontWeight >= 700); if (кр < (едър ? 3 : 4.5)) н.нисък_контраст.push(им(е) + ' ' + кр.toFixed(2) + ' „' + свой.slice(0, 18) + '“'); }
      }
    }
    if ((е.scrollWidth > е.clientWidth + 2) && /(hidden|clip)/.test(s.overflowX) && свой) н.рязан.push(им(е) + ' ' + е.scrollWidth + '>' + е.clientWidth);
    if (е.matches('.pl-pl,.pl-ig-i,.pl-em') && Math.abs(р.width - р.height) > 1.5) н.разтеглени.push(им(е) + ' ' + Math.round(р.width) + '×' + Math.round(р.height));
    const всичко = s.backgroundImage + ' ' + s.borderTopColor + ' ' + s.borderLeftColor + ' ' + s.color + ' ' + s.backgroundColor + ' ' + s.boxShadow;
    for (const ст of СТАРИ) if (всичко.indexOf(ст) !== -1) { н.стар_цвят.push(им(е) + ' ' + ст); break; }
  }
  for (const x in н) { н[x] = [...new Set(н[x])]; if (!н[x].length) delete н[x]; else н[x] = н[x].slice(0, 10); }
  return н;
})`;

(async () => {
  await require('./slot.js')('chrome');   // 🚦 20.10 опашката (slot.js) — ПЪТ НАЗАД: махни този ред
  const ch = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=390,844', 'about:blank'], { stdio: 'ignore' });
  let цел; for (let i = 0; i < 100 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + ПОРТ + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
  if (!цел) throw new Error('Chrome не тръгна');
  const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let n = 0; const ч = new Map(); const грешки = [];
  ws.onmessage = e => { const м = JSON.parse(e.data); if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); } if (м.method === 'Runtime.exceptionThrown') грешки.push((м.params.exceptionDetails.exception && м.params.exceptionDetails.exception.description || м.params.exceptionDetails.text || '').slice(0, 200)); };
  const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  const изрази = async x => { const р = await send('Runtime.evaluate', { expression: x, awaitPromise: true, returnByValue: true }); return р.result.exceptionDetails ? { ГРЕШКА: (р.result.exceptionDetails.exception || {}).description || р.result.exceptionDetails.text } : р.result.result.value; };
  const зареди = async () => { for (let i = 0; i < 150; i++) { await пауза(300); if (await изрази("document.readyState === 'complete' && !!window.MamaHelper") === true) break; } await пауза(2200); };
  const кадри = () => изрази('new Promise(r => { let k = 0; const f = () => (++k >= 40 ? r(1) : requestAnimationFrame(f)); requestAnimationFrame(f); })');
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send('Page.navigate', { url: 'http://localhost:8911/' }); await зареди();
  const отчет = {};
  for (const ТЕМА of ТЕМИ) {
    await изрази(`(() => { localStorage.clear(); const s = (k, v) => localStorage.setItem(k, JSON.stringify(v)); s('bl_onboarded', true); localStorage.setItem('bl_tour_done','1'); s('bl_hero_toured', true); s('bl_day1','2026-08-01'); s('bl_mama',{name:'Мария'}); s('bl_baby', { name: 'Алекс', birth: '2026-03-20', sex: 'boy' }); localStorage.setItem('bl_theme','${ТЕМА}'); return 1; })()`);
    await send('Page.reload'); await зареди();
    // ако onboarding-ът пак е тук (бавна машина) — още веднъж
    if (await изрази('!!document.querySelector("#roomOverlay")') !== true) { await send('Page.reload'); await зареди(); }
    await изрази(`(() => { document.querySelectorAll('button').forEach(b => { if (/Благодаря/.test(b.innerText)) b.click(); }); document.documentElement.style.scrollBehavior = 'auto'; MamaHelper.open('Развитие и игри'); return 1; })()`);
    await пауза(3000);
    for (let i = 0; i < 20; i++) { if (await изрази('!!document.querySelector("#roRoom .pl-ig") && document.querySelectorAll("#roRoom section.jr-card").length > 10') === true) break; await пауза(500); }
    await пауза(1500);
    if (арг.pre) console.log(ТЕМА + ' pre: ' + JSON.stringify(await изрази(fs.readFileSync(арг.pre, 'utf8'))));
    const рег = арг.cards || '.';
    // списък с целите: карти по заглавие (+ блокът .pl-ig и главите на разделите, ако --top)
    const цели = await изрази(`(() => { const р = new RegExp(${JSON.stringify(рег)}, 'i'); const св = [];
      const всички = [...document.querySelectorAll('#roRoom section.jr-card')];
      ${арг.top ? "if (р.test('БЛОК')) { const б = document.querySelector('#roRoom > .pl-ig'); if (б) { б.dataset.igp = 'БЛОК'; св.push('БЛОК'); } }" : ''}
      всички.forEach((к, i) => { const з = к.querySelector('h4.jr-title'); const т = (з ? з.textContent : 'карта' + i).replace(/\\s+/g, ' ').trim(); if (р.test(т)) { к.dataset.igp = 'k' + i; св.push('k' + i + '|' + т.slice(0, 40)); } });
      return св; })()`);
    console.log(ТЕМА + ': ' + цели.length + ' цели');
    let ном = 0;
    for (const ц of цели) {
      const ид = ц.split('|')[0];
      if (арг.unfold) { await изрази(`(() => { const к = document.querySelector('[data-igp="${ид}"]'); if (к && к.classList.contains('folded')) { const ф = к.querySelector('.fold-btn'); if (ф) ф.click(); } return 1; })()`); await пауза(500); }
      if (арг.post) await изрази(fs.readFileSync(арг.post, 'utf8').replace(/__ID__/g, ид));
      const вис = await изрази(`(() => { const к = document.querySelector('[data-igp="${ид}"]'); if (!к) return 0; const ск = document.getElementById('roRoom'); ск.style.scrollBehavior = 'auto'; ск.scrollTop += к.getBoundingClientRect().top - 84; return Math.round(к.getBoundingClientRect().height); })()`);
      await пауза(500); await кадри();
      // плавният скрол на приложението (plavno.js) влачи scrollTop — гоним целта, докато застане на 84±8
      for (let оп = 0; оп < 8; оп++) {
        const г = await изрази(`(() => { const к = document.querySelector('[data-igp="${ид}"]'); return Math.round(к.getBoundingClientRect().top); })()`);
        if (Math.abs(г - 84) <= 8) { await пауза(250); const г2 = await изрази(`Math.round(document.querySelector('[data-igp="${ид}"]').getBoundingClientRect().top)`); if (Math.abs(г2 - 84) <= 8) break; }
        await изрази(`(() => { const к = document.querySelector('[data-igp="${ид}"]'); const ск = document.getElementById('roRoom'); ск.style.scrollBehavior = 'auto'; ск.scrollTop += к.getBoundingClientRect().top - 84; return 1; })()`);
        await пауза(450); await кадри();
      }
      const лов = await изрази(ЛОВ + `(document.querySelector('[data-igp="${ид}"]'))`);
      отчет[ТЕМА + ' ' + ц] = лов;
      // снимка: от картата надолу, на парчета по 760px (екранът е 844, отгоре 84 е лентата)
      let взето = 0, парче = 0;
      while (взето < Math.min(вис, МАКСВ) && парче < 3) {
        const р = await изрази(`(() => { const к = document.querySelector('[data-igp="${ид}"]'); const п = к.getBoundingClientRect(); return { y: Math.round(п.top), h: Math.round(п.height) }; })()`);
        const y = Math.max(0, р.y - 6), h = Math.min(844 - y, р.h - взето + 12);
        const сн = await send('Page.captureScreenshot', { format: 'jpeg', quality: 78, clip: { x: 0, y, width: 390, height: Math.max(40, h), scale: 1 } });
        const файл = path.join(ПАПКА, ИМЕ + '_' + ТЕМА[0] + '_' + String(ном).padStart(2, '0') + (парче ? String.fromCharCode(97 + парче) : '') + '.jpg');
        fs.writeFileSync(файл, Buffer.from(сн.result.data, 'base64'));
        взето += 760; парче++;
        if (взето < Math.min(вис, МАКСВ)) { await изрази(`(() => { document.getElementById('roRoom').scrollTop += 760; return 1; })()`); await пауза(900); await кадри(); }
      }
      console.log('  ' + ТЕМА[0] + String(ном).padStart(2, '0') + ' ' + ц + ' h=' + вис + ' ' + (Object.keys(лов || {}).length ? JSON.stringify(лов) : 'чисто'));
      ном++;
    }
  }
  fs.writeFileSync(path.join(ПАПКА, ИМЕ + '_lov.json'), JSON.stringify(отчет, null, 1));
  console.log('грешки: ' + грешки.length + (грешки.length ? '\n  ' + грешки.slice(0, 5).join('\n  ') : ''));
  try { ws.close(); } catch (e) {} try { ch.kill(); } catch (e) {}
  try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {}
  process.exit(0);
})().catch(e => { console.log('🔴 ' + e.message); process.exit(3); });
