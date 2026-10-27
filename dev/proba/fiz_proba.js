// 🖼️ ФИЗИЧЕСКИЯТ СПОМЕН — пробата на BL_FIZ (картичка · колаж · плакат · запази) · 27.10.2026
// През истинския index.html, един Chrome (slot.js). Тестовите снимки се рисуват в canvas тук —
// нищо не се сваля и нищо не се качва. Записва dev/proba/snimki/fiz_*.jpg.
// node dev/proba/fiz_proba.js [--port 8912]      (cwd = babyland; сървър: node dev/proba/server.js 8912)
const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
const ROOT = process.cwd();
const арг = {}; { const a = process.argv.slice(2); for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) арг[a[i].slice(2)] = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : '1'; }
const БАЗА = 'http://localhost:' + (арг.port || 8912);
const пауза = ms => new Promise(r => setTimeout(r, ms));
let провали = 0; const ок = (да, т) => { if (!да) провали++; console.log((да ? '✅ ' : '🔴 ') + т); };
(async () => {
  await require(path.join(ROOT, 'dev/proba/slot.js'))('chrome');
  const ПРОФИЛ = path.join(require('os').tmpdir(), 'chrome_pr_fiz_' + Date.now()); const ПОРТ = 9200 + Math.floor(Math.random() * 700);
  const ch = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--remote-debugging-port=' + ПОРТ, '--user-data-dir=' + ПРОФИЛ, '--no-first-run', '--window-size=390,844', 'about:blank'], { stdio: 'ignore' });
  let цел; for (let i = 0; i < 80 && !цел; i++) { await пауза(300); try { цел = (await (await fetch('http://127.0.0.1:' + ПОРТ + '/json/list')).json()).find(t => t.type === 'page'); } catch (e) {} }
  if (!цел) { console.log('🔴 Chrome не тръгна'); process.exit(3); }
  const ws = new WebSocket(цел.webSocketDebuggerUrl); await new Promise(r => { ws.onopen = r; });
  let n = 0; const ч = new Map(); const грешки = [];
  const send = (m, p) => new Promise(r => { const i = ++n; ч.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: p || {} })); });
  ws.onmessage = e => { const м = JSON.parse(e.data); if (м.id && ч.has(м.id)) { ч.get(м.id)(м); ч.delete(м.id); } if (м.method === 'Runtime.exceptionThrown') грешки.push(((м.params.exceptionDetails.exception || {}).description || м.params.exceptionDetails.text || '').split('\n')[0]); };
  const изр = async (x) => { const р = await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true }); if (р.result && р.result.exceptionDetails) return 'ГРЕШКА: ' + ((р.result.exceptionDetails.exception || {}).description || р.result.exceptionDetails.text || ''); return р.result && р.result.result ? р.result.result.value : null; };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await send('Page.addScriptToEvaluateOnNewDocument', { source: "try { sessionStorage.setItem('bl_razgledai','1'); } catch (e) {}" });
  await send('Page.navigate', { url: БАЗА + '/manifest.webmanifest' }); await пауза(600);
  await изр(`(() => { localStorage.clear(); const s = (k, v) => localStorage.setItem(k, JSON.stringify(v)); s('bl_onboarded', true); localStorage.setItem('bl_tour_done','1'); s('bl_hero_toured', true); s('bl_day1','2026-08-01'); s('bl_mama',{name:'Мария'}); s('bl_baby', { name: 'Алекс', birth: '2025-10-20', sex: 'boy' }); localStorage.setItem('bl_theme','light'); return 1; })()`);
  await send('Page.navigate', { url: БАЗА + '/' });
  let г = false; for (let i = 0; i < 60 && !г; i++) { await пауза(250); г = await изр('!!(window.BL_FIZ && window.BL_EXPR)'); }
  ок(г, 'зареден през index.html · BL_FIZ и BL_EXPR (старият IIFE) са живи');
  if (!г) { try { ch.kill(); } catch (e) {} process.exit(1); }
  await пауза(800);

  // тестовите снимки: пастелни „пейзажи“ с номер и стрелка нагоре (виждаме реда и изрязването)
  await изр(`(() => { window.__сн = (i, w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
      const hue = (i * 47 + 190) % 360; const г = x.createLinearGradient(0, 0, 0, h); г.addColorStop(0, 'hsl(' + hue + ',70%,78%)'); г.addColorStop(.62, 'hsl(' + ((hue + 30) % 360) + ',65%,88%)'); г.addColorStop(.63, 'hsl(' + ((hue + 120) % 360) + ',38%,62%)'); г.addColorStop(1, 'hsl(' + ((hue + 120) % 360) + ',40%,46%)');
      x.fillStyle = г; x.fillRect(0, 0, w, h); x.fillStyle = 'hsla(45,100%,92%,.95)'; x.beginPath(); x.arc(w * .72, h * .3, Math.min(w, h) * .13, 0, 7); x.fill();
      x.fillStyle = 'rgba(255,255,255,.9)'; x.font = '800 ' + Math.round(Math.min(w, h) * .32) + 'px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(i), w / 2, h * .48);
      x.font = '800 ' + Math.round(Math.min(w, h) * .1) + 'px sans-serif'; x.fillText('↑', w / 2, h * .1);
      return c.toDataURL('image/jpeg', .86); };
    window.__вB64 = b => new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result.split(',')[1]); fr.readAsDataURL(b); });
    window.__мери = async (име, f) => { const t0 = performance.now(); let b; try { b = await f(); } catch (e) { return { име, грешка: String(e && e.message || e) }; } const ms = Math.round(performance.now() - t0);
      const bm = await createImageBitmap(b); const r = { име, ms, тип: b.type, кб: Math.round(b.size / 1024), w: bm.width, h: bm.height }; bm.close(); window['__b_' + име] = b; return r; };
    return 1; })()`);

  const ОЧАКВАНО = {
    kartichka: [1200, 1800], kartichka_leg: [1800, 1200], kartichka_kv: [1080, 1080], kartichka_storis: [1080, 1920],
    kolazh: [2160, 2160], kolazh_2: [2160, 2160], plakat: [2400, 3200]
  };
  const МЕСЕЦИ = ['1 месец', '2 месеца', '3 месеца', '4 месеца', '5 месеца', '6 месеца', '7 месеца', '8 месеца', '9 месеца', '10 месеца', '11 месеца', 'Годинка!'];
  const резултати = await изр(`(async () => { const сн = __сн, out = [];
      const ПОВРЕДЕНА = { img: 'data:image/jpeg;base64,AAAAZmFrZQ==' };
      out.push(await __мери('kartichka', () => BL_FIZ.картичка({ img: сн(3, 1200, 1600) }, { заглавие: '3 месеца', подзаглавие: 'Първата истинска усмивка', име: 'Алекс', дата: '2026-01-20', формат: '10x15' })));
      out.push(await __мери('kartichka_leg', () => BL_FIZ.картичка({ img: сн(1, 1600, 1200) }, { заглавие: 'Първата усмивка', подзаглавие: 'и целият свят светна', име: 'Алекс', дата: '2025-11-28', формат: '10x15' })));
      out.push(await __мери('kartichka_kv', () => BL_FIZ.картичка({ img: сн(6, 1600, 1200) }, { заглавие: '6 месеца', подзаглавие: 'Половин година обич', име: 'Алекс', формат: 'kv' })));
      out.push(await __мери('kartichka_storis', () => BL_FIZ.картичка({ img: сн(9, 1200, 1600) }, { заглавие: 'Първите стъпки', подзаглавие: '9 месеца и вече тичаме', име: 'Алекс', дата: '2026-07-21', формат: 'storis' })));
      const седем = [1, 2, 3, 4, 5, 6, 7].map(i => ({ img: сн(i, i % 2 ? 1600 : 1200, i % 2 ? 1200 : 1600) })); седем.splice(3, 0, ПОВРЕДЕНА);
      out.push(await __мери('kolazh', () => BL_FIZ.колаж(седем, { заглавие: 'октомври 2026', подзаглавие: 'Месецът на първите думи' })));
      out.push(await __мери('kolazh_2', () => BL_FIZ.колаж([{ img: сн(1, 1200, 1600) }, { img: сн(2, 1200, 1600) }], { заглавие: 'ноември 2026' })));
      const дванайсет = ${JSON.stringify(МЕСЕЦИ)}.map((н, i) => ({ img: сн(i + 1, i % 3 ? 1200 : 1600, i % 3 ? 1600 : 1200), надпис: н })); дванайсет.splice(5, 0, ПОВРЕДЕНА);
      out.push(await __мери('plakat', () => BL_FIZ.плакат(дванайсет, { име: 'Алекс', година: '2025 – 2026' })));
      out.push(await __мери('plakat_malka', () => BL_FIZ.плакат([{ img: сн(1, 360, 270), надпис: 'малка 360 px' }], { име: 'Алекс' })));
      out.push(await __мери('nyama', () => BL_FIZ.картичка(ПОВРЕДЕНА, { заглавие: 'x' })));
      out.push(await __мери('nyama_kolazh', () => BL_FIZ.колаж([ПОВРЕДЕНА, null, { img: 42 }], {})));
      return out; })()`);
  if (!Array.isArray(резултати)) { ок(false, 'генераторите: ' + JSON.stringify(резултати)); }
  else {
    for (const р of резултати) {
      if (р.име.startsWith('nyama')) { ок(!!р.грешка && !р.w, р.име + ': без снимка → тиха грешка с текст, не гърми · „' + р.грешка + '“'); continue; }
      if (р.грешка) { ок(false, р.име + ': ' + р.грешка); continue; }
      const оч = ОЧАКВАНО[р.име];
      if (оч) ок(р.w === оч[0] && р.h === оч[1], р.име + ': ' + р.w + '×' + р.h + ' (очаквано ' + оч.join('×') + ') · ' + р.тип + ' · ' + р.кб + ' КБ · ' + р.ms + ' мс');
      else ок(р.w > 0, р.име + ': ' + р.w + '×' + р.h + ' · ' + р.кб + ' КБ · ' + р.ms + ' мс');
      ок(р.тип === 'image/jpeg' && р.кб > 40, '   ' + р.име + ': JPEG и не е празен (' + р.кб + ' КБ)');
      ок(р.w * р.h <= 16777216, '   ' + р.име + ': под тавана на iOS (' + (р.w * р.h / 1e6).toFixed(2) + ' млн пиксела)');
      ок(р.ms < 3000, '   ' + р.име + ': под 3 с (' + р.ms + ' мс)');
      if (/^(kartichka|kartichka_leg|kartichka_kv|kartichka_storis|kolazh|plakat)$/.test(р.име)) {
        const b64 = await изр('__вB64(window.__b_' + р.име + ')');
        fs.writeFileSync(path.join(ROOT, 'dev/proba/snimki', 'fiz_' + р.име + '.jpg'), Buffer.from(b64, 'base64'));
      }
    }
  }
  ок(await изр(`document.fonts.check("800 40px 'Nunito'", 'Бейби')`), 'Nunito 800 (кирилица) е зареден за canvas');

  // запази(): четирите пътя без истинско споделяне — подменени canShare/share и a.click
  const зп = await изр(`(async () => { const b = window.__b_kolazh_2; const out = {}; const кл = []; const стар = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function () { кл.push({ име: this.download, href: this.href.slice(0, 5) }); };
      const N = navigator; const п = (k, v) => Object.defineProperty(N, k, { value: v, configurable: true, writable: true });
      п('canShare', undefined); out.без = await BL_FIZ.запази(b, 'Колаж: ноември/2026');
      let дадено = null; п('canShare', () => true); п('share', async d => { дадено = d.files[0]; });
      out.сподели = await BL_FIZ.запази(b, 'Картичка 3 месеца'); out.файл = дадено && { име: дадено.name, тип: дадено.type, кб: Math.round(дадено.size / 1024) };
      п('share', async () => { throw new DOMException('отказ', 'AbortError'); }); out.отказ = await BL_FIZ.запази(b, 'x');
      п('share', async () => { throw new DOMException('без жест', 'NotAllowedError'); }); out.изтекъл = await BL_FIZ.запази(b, 'x');
      out.празно = await BL_FIZ.запази(null, 'x');
      HTMLAnchorElement.prototype.click = стар; out.кликове = кл; out.възли = document.querySelectorAll('a[download]').length; return out; })()`);
  ок(зп && зп.без === 'download' && зп.кликове[0] && зп.кликове[0].име === 'Колаж ноември 2026.jpg' && зп.кликове[0].href === 'blob:', 'запази без споделяне → изтегляне „' + (зп && зп.кликове[0] && зп.кликове[0].име) + '“ (blob:)');
  ок(зп && зп.сподели === 'share' && зп.файл && зп.файл.име === 'Картичка 3 месеца.jpg' && зп.файл.тип === 'image/jpeg', 'запази със споделяне → share, файл ' + JSON.stringify(зп && зп.файл));
  ок(зп && зп.отказ === false, 'мама се отказва (AbortError) → false, без изтегляне');
  ок(зп && зп.изтекъл === 'download', 'изтекъл натиск (NotAllowedError) → изтегляне вместо мълчание');
  ок(зп && зп.празно === false && зп.възли === 0, 'празен blob → false; не остават <a download> в DOM (' + (зп && зп.възли) + ')');
  ок(грешки.length === 0, 'JS грешки: ' + (грешки.length ? грешки.join(' | ') : 0));
  try { ws.close(); } catch (e) {} try { ch.kill(); } catch (e) {} await пауза(400); try { fs.rmSync(ПРОФИЛ, { recursive: true, force: true }); } catch (e) {}
  console.log(провали ? '🔴 ПРОВАЛИ: ' + провали : 'BL_FIZ: всичко минава');
  process.exit(провали ? 1 : 0);
})().catch(e => { console.log('🔴 ' + e.message); process.exit(3); });
