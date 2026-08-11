// ═══════════════════════════════════════════════════════════
// EXPR — общите изразни компоненти на мега плана (док. 12)
// 🎙️ гласови записи • 📸 датирани фото-галерии • 🖨️ печатен оверлей
// Всичко живее само на телефона на мама.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return false; } return true; };
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const fx = () => window.BL_FX || { confetti() {}, cheer() {}, buzz() {}, pop() {}, chime() {} };
  const card = t => { const c = el('section', 'jr-card'); c.appendChild(el('h4', 'jr-title', t)); return c; };
  const dstr = ts => new Date(ts).toLocaleDateString('bg-BG');

  // ── 📸 смаляване на снимка до dataURL (както във фото-лентата) ──
  function shrinkImage(file, maxPx, cb) {
    const img = new Image();
    img.onload = () => {
      const cnv = document.createElement('canvas');
      const k = Math.min(1, (maxPx || 360) / Math.max(img.width, img.height));
      cnv.width = Math.round(img.width * k); cnv.height = Math.round(img.height * k);
      cnv.getContext('2d').drawImage(img, 0, 0, cnv.width, cnv.height);
      URL.revokeObjectURL(img.src);
      cb(cnv.toDataURL('image/jpeg', 0.75));
    };
    img.src = URL.createObjectURL(file);
  }

  // ── 📸 датирана фото-галерия (обрив, драскулки, гримаси…) ──
  // key → [{img, note, ts}]; opts: {notePrompt, empty, max}
  function photoListCard(title, key, opts) {
    opts = opts || {};
    const c = card(title);
    const items = load(key, []);
    const file = el('input'); file.type = 'file'; file.accept = 'image/*'; file.style.display = 'none';
    const addB = el('button', 'jr-btn', '📸 Добави снимка'); addB.type = 'button';
    const grid = el('div', 'pho-grid');
    // 05.08: снимката се записва ВЕДНАГА, а надписът се пише в топло инлайн
    // поле. Native prompt() на част от телефоните в режим „приложение“ изобщо
    // не се появява — снимката оставаше няма и мама не разбираше защо.
    const нотаРед = el('div', 'pho-note jr-addrow');
    // ⚠️ 05.08 (скептикът): `hidden` тук е МЪРТЪВ атрибут — css/rooms.css:271
    //    дава `.jr-addrow { display: flex }`, а авторското правило бие правилото
    //    на браузъра за [hidden]. Редът се спасяваше само защото се изпразва.
    //    Скриваме го явно, за да не е капан за следващата поправка.
    нотаРед.style.display = 'none';
    function питайЗаНадпис() {
      нотаРед.innerHTML = '';
      const п = el('input', 'jr-word');
      п.type = 'text'; п.maxLength = 60;
      п.placeholder = opts.notePrompt;
      п.setAttribute('aria-label', opts.notePrompt);
      const ок = el('button', 'jr-chip', '✔'); ок.type = 'button'; ок.setAttribute('aria-label', 'запази надписа');
      const затвори = () => { нотаРед.style.display = 'none'; нотаРед.innerHTML = ''; };
      const запиши = () => {
        const т = п.value.trim().slice(0, 60);
        if (т && items.length) { items[items.length - 1].note = т; save(key, items); draw(); }
        затвори();
      };
      ок.addEventListener('click', запиши);
      п.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); запиши(); }
        else if (e.key === 'Escape') затвори();
      });
      нотаРед.appendChild(п); нотаРед.appendChild(ок);
      нотаРед.style.display = '';
      п.focus();
    }
    file.addEventListener('change', () => {
      const f = file.files[0]; if (!f) return;
      shrinkImage(f, 360, url => {
        items.push({ img: url, note: '', ts: Date.now() });
        if (opts.max) while (items.length > opts.max) items.shift();
        if (!save(key, items)) { items.pop(); fx().cheer('Паметта се напълни — изтрий нещо старо. 😕'); draw(); return; }
        fx().buzz(12);
        draw();
        if (opts.notePrompt) питайЗаНадпис();
      });
      file.value = '';
    });
    function draw() {
      grid.innerHTML = '';
      if (!items.length) { grid.appendChild(el('p', 'jr-privacy', opts.empty || 'Първата снимка чака своето докосване. 📸')); return; }
      items.slice().reverse().forEach((it, ri) => {
        const idx = items.length - 1 - ri;
        const cell = el('button', 'pho-cell'); cell.type = 'button';
        cell.innerHTML = `<img src="${esc(it.img)}" alt=""><span class="pho-m">${esc(it.note) || dstr(it.ts)}</span>`;
        cell.addEventListener('click', () => view(idx));
        grid.appendChild(cell);
      });
    }
    function view(idx) {
      const it = items[idx];
      let ov = document.getElementById('exprView');
      if (!ov) { ov = el('div', 'br-overlay'); ov.id = 'exprView'; document.body.appendChild(ov); }
      ov.innerHTML = `<div class="pho-viewbox"><img src="${esc(it.img)}"><p>${esc(it.note)} · ${dstr(it.ts)}</p>
        <div class="jr-quick"><button class="jr-chip" id="exShare" type="button">📤 Сподели</button><button class="jr-chip" id="exDel" type="button">🗑 Изтрий</button><button class="jr-chip" id="exClose" type="button">Затвори</button></div></div>`;
      ov.hidden = false;
      ov.querySelector('#exClose').onclick = () => { ov.hidden = true; };
      ov.querySelector('#exShare').onclick = () => споделиСнимка(it);
      ov.querySelector('#exDel').onclick = () => { items.splice(idx, 1); save(key, items); ov.hidden = true; draw(); };
      ov.onclick = e => { if (e.target === ov) ov.hidden = true; };
    }
    c.appendChild(addB); c.appendChild(file); c.appendChild(нотаРед); c.appendChild(grid);
    c.appendChild(el('p', 'jr-privacy', '🔒 Смалени, само на твоя телефон.'));
    addB.addEventListener('click', () => file.click());
    draw();
    return c;
  }

  // 12.12.4: при споделяне снимката носи ДАТАТА и ВЪЗРАСТТА на бебето,
  // подпечатани в лента отдолу — за да значи нещо след години.
  function възрастНа(ts) {
    try {
      const b = load('bl_baby', {}).birth;
      if (!b) return '';
      const дни = Math.floor((ts - new Date(b)) / 86400000);
      if (дни < 0) return '';
      if (дни < 31) return дни + (дни === 1 ? ' ден' : ' дни');
      const m = Math.floor(дни / 30.4375);
      if (m < 12) return m + (m === 1 ? ' месец' : ' месеца');
      const г = Math.floor(m / 12), ом = m % 12;
      return г + (г === 1 ? ' г.' : ' г.') + (ом ? ' ' + ом + ' м.' : '');
    } catch (e) { return ''; }
  }
  function споделиСнимка(it) {
    const img = new Image();
    img.onload = () => {
      const W = img.naturalWidth || 360, лента = Math.round(W * 0.16);
      const cv = document.createElement('canvas');
      cv.width = W; cv.height = (img.naturalHeight || 360) + лента;
      const x = cv.getContext('2d');
      x.fillStyle = '#fff'; x.fillRect(0, 0, cv.width, cv.height);
      x.drawImage(img, 0, 0);
      // лентата
      const grad = x.createLinearGradient(0, cv.height - лента, W, cv.height);
      grad.addColorStop(0, '#f8b3d0'); grad.addColorStop(1, '#c3b1ea');
      x.fillStyle = grad; x.fillRect(0, cv.height - лента, W, лента);
      x.fillStyle = '#fff'; x.textBaseline = 'middle';
      const дата = dstr(it.ts), възр = възрастНа(it.ts);
      x.font = '700 ' + Math.round(лента * 0.3) + 'px sans-serif';
      x.fillText(възр || дата, W * 0.04, cv.height - лента * 0.58);
      x.font = '400 ' + Math.round(лента * 0.22) + 'px sans-serif';
      x.fillText((възр ? дата + ' · ' : '') + '🎈 Помощникът на мама', W * 0.04, cv.height - лента * 0.24);
      if (it.note) { x.textAlign = 'right'; x.font = '400 ' + Math.round(лента * 0.24) + 'px sans-serif'; x.fillText(it.note.slice(0, 24), W * 0.96, cv.height - лента * 0.5); x.textAlign = 'left'; }
      cv.toBlob(async blob => {
        const f = new File([blob], 'baby-land-спомен.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [f] })) {
          try { await navigator.share({ files: [f] }); return; } catch (e) { if (e.name === 'AbortError') return; }
        }
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'baby-land-спомен.png'; a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      }, 'image/png');
    };
    img.src = it.img;
  }

  // ── 🎙️ гласови бележки (MediaRecorder → мъничък запис на телефона) ──
  // key → [{a: dataURL, label, ts}]; opts: {labels: ['гукане','смях'], maxSec, empty}
  function voiceCard(title, key, opts) {
    opts = opts || {};
    const MAXS = opts.maxSec || 20;
    const c = card(title);
    const items = load(key, []);
    let label = (opts.labels && opts.labels[0]) || '';
    if (opts.labels) {
      const row = el('div', 'jr-quick');
      opts.labels.forEach((lb, i) => {
        const b = el('button', 'jr-chip' + (i === 0 ? ' on' : ''), lb); b.type = 'button';
        b.addEventListener('click', () => { row.querySelectorAll('.jr-chip').forEach(x => x.classList.remove('on')); b.classList.add('on'); label = lb; });
        row.appendChild(b);
      });
      c.appendChild(row);
    }
    const recB = el('button', 'jr-btn vc-rec', '🎙️ Запиши (до ' + MAXS + ' сек)'); recB.type = 'button';
    const list = el('div', 'vc-list');
    let mr = null, chunks = [], timer = null;
    recB.addEventListener('click', async () => {
      if (mr) { mr.stop(); return; }
      if (!navigator.mediaDevices || !window.MediaRecorder) { recB.textContent = 'Този телефон не поддържа запис 😕'; return; }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        chunks = [];
        // 🔴 11.08 (обиколка „Развитие и игри“): бутонът обещаваше „до 120 сек“,
        //   а таванът долу е 900 KB. Измерено в браузъра: Chrome записва opus на
        //   ~136 kbps по подразбиране → 120 сек ≈ 2000 KB. Тоест всяка песничка
        //   над ~53 секунди се записваше докрай и после се ИЗХВЪРЛЯШЕ. Казваме
        //   на записа колко да тежи: 32 kbps × 120 сек ≈ 480 KB — под тавана.
        try { mr = new MediaRecorder(stream, { audioBitsPerSecond: 32000 }); }
        catch (e) { mr = new MediaRecorder(stream); }
        mr.ondataavailable = e => chunks.push(e.data);
        mr.onstop = () => {
          clearTimeout(timer);
          stream.getTracks().forEach(t => t.stop());
          const blob = new Blob(chunks, { type: mr.mimeType || 'audio/webm' });
          mr = null;
          recB.textContent = '🎙️ Запиши (до ' + MAXS + ' сек)'; recB.classList.remove('rec');
          if (blob.size > 900 * 1024) { fx().cheer('Записът стана твърде дълъг — пробвай по-кратко. 😊'); return; }
          const rd = new FileReader();
          rd.onload = () => {
            items.push({ a: rd.result, label, ts: Date.now() });
            if (!save(key, items)) { items.pop(); fx().cheer('Паметта се напълни — изтрий стар запис. 😕'); }
            else { fx().buzz(12); fx().confetti(recB, 12); }
            draw();
          };
          rd.readAsDataURL(blob);
        };
        mr.start();
        recB.textContent = '⏹ Спри записа'; recB.classList.add('rec');
        timer = setTimeout(() => { if (mr) mr.stop(); }, MAXS * 1000);
      } catch (e) {
        recB.textContent = 'Нужно е позволение за микрофона 🎙️';
        setTimeout(() => { recB.textContent = '🎙️ Запиши (до ' + MAXS + ' сек)'; }, 2500);
      }
    });
    function draw() {
      list.innerHTML = items.length ? '' : `<p class="jr-privacy">${opts.empty || 'Тук ще живеят малките звуци, които не искаш да забравиш. 🎙️'}</p>`;
      items.slice().reverse().forEach((it, ri) => {
        const idx = items.length - 1 - ri;
        const row = el('div', 'vc-row');
        row.innerHTML = `<span class="vc-lbl">${esc(it.label) || '🎙️'}</span><audio controls preload="none" src="${esc(it.a)}"></audio>
          <span class="vc-meta">${dstr(it.ts)} <button class="nt-del" type="button" aria-label="Изтрий">🗑</button></span>`;
        row.querySelector('.nt-del').addEventListener('click', () => { items.splice(idx, 1); save(key, items); draw(); });
        list.appendChild(row);
      });
    }
    c.appendChild(recB); c.appendChild(list);
    c.appendChild(el('p', 'jr-privacy', '🔒 Записите живеят само на телефона ти (паметта е ограничена — кратки съкровища).'));
    draw();
    return c;
  }

  // ── 🖨️ печатен оверлей: паспорти, бележки, картички, годишник ──
  function printOverlay(title, bodyHtml, opts) {
    opts = opts || {};
    let ov = document.getElementById('printHolder');
    if (!ov) { ov = el('div', 'pr-holder'); ov.id = 'printHolder'; document.body.appendChild(ov); }
    ov.innerHTML =
      `<div class="pr-sheetwrap"><div class="pr-bar no-print">
         <button class="jr-chip" id="prPrint" type="button">🖨️ Принтирай / PDF</button>
         <button class="jr-chip" id="prClose" type="button">✕ Затвори</button>
       </div>
       <div class="pr-sheet ${opts.cls || ''}">
         <div class="pr-head"><span class="pr-logo">🎈 Бейби Ленд</span><h2>${title}</h2></div>
         ${bodyHtml}
         <p class="pr-foot">Направено с обич в Бейби Ленд · ${new Date().toLocaleDateString('bg-BG')}</p>
       </div></div>`;
    ov.hidden = false;
    document.body.classList.add('printing-open');
    ov.querySelector('#prPrint').onclick = () => window.print();
    ov.querySelector('#prClose').onclick = () => { ov.hidden = true; document.body.classList.remove('printing-open'); };
    ov.onclick = e => { if (e.target === ov) { ov.hidden = true; document.body.classList.remove('printing-open'); } };
  }

  window.BL_EXPR = { photoListCard, voiceCard, printOverlay, shrinkImage, card, esc };
})();
