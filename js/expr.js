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
  // 🎞️ пазач за движение — важи за всяко плъзгане, което правим оттук
  const плавно = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'; } catch (e) { return 'auto'; } };
  // 🔔 „мълчалив бутон няма": един тих знак, който се показва и сам си отива
  const знак = (възел, текст, ms) => {
    if (!възел) return;
    възел.textContent = текст; възел.hidden = false;
    clearTimeout(възел._t);
    възел._t = setTimeout(() => { възел.hidden = true; възел.textContent = ''; }, ms || 3000);
  };

  // ── 📸 смаляване на снимка до dataURL (както във фото-лентата) ──
  // 🔴 11.08 (жива обиколка, телефон): нямаше `onerror`. Мама избира снимка от
  //    iPhone (.HEIC) или файлът е повреден → браузърът НЕ вика `onload` НИКОГА,
  //    `cb` не се стига и картата мълчи напълно. „Избрах снимка, а после нищо."
  //    Измерено в браузъра: файл image/heic → 0 промени в картата, 0 съобщения.
  //    Помощникът се ползва от 6 файла, затова лекът стои ТУК.
  const ГРЕШКА_СНИМКА = 'Тази снимка не се отваря тук (често е .HEIC от iPhone). Пробвай друга или я запиши като JPG. 😕';
  function shrinkImage(file, maxPx, cb, onErr) {
    const img = new Image();
    const пусни = () => { try { URL.revokeObjectURL(img.src); } catch (e) {} };
    img.onload = () => {
      const cnv = document.createElement('canvas');
      const k = Math.min(1, (maxPx || 360) / Math.max(img.width, img.height));
      cnv.width = Math.round(img.width * k); cnv.height = Math.round(img.height * k);
      cnv.getContext('2d').drawImage(img, 0, 0, cnv.width, cnv.height);
      пусни();
      cb(cnv.toDataURL('image/jpeg', 0.75));
    };
    img.onerror = () => {
      пусни();
      if (onErr) onErr(); else fx().cheer(ГРЕШКА_СНИМКА);
    };
    img.src = URL.createObjectURL(file);
  }

  // ── 📸 датирана фото-галерия (обрив, драскулки, гримаси…) ──
  // key → [{img, note, ts}]; opts: {notePrompt, empty, max}
  function photoListCard(title, key, opts) {
    opts = opts || {};
    const c = card(title);
    // 🔴 11.08 КАПАНЪТ НА СНИМКАТА: това е ОБЩ строител — един и същи ключ може
    //    да е на екрана два пъти (стаята, нарисувана и в скрития панел). Ако
    //    масивът се снима веднъж при рисуване, втората карта записва старото си
    //    копие отгоре и трие чуждото мълчаливо. Затова: пресен прочит при всяко
    //    рисуване и точно преди всеки запис; триенето търси снимката по ЧАС (ts),
    //    защото номерът в реда важи само за старата снимка.
    let items = load(key, []);
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
    // тихият ред за обратна връзка + пътят назад след триене
    const бележка = el('p', 'jr-reply'); бележка.hidden = true;
    const отмяна = el('button', 'jr-chip', '↺ Върни снимката'); отмяна.type = 'button'; отмяна.hidden = true;
    const въздух = el('div'); въздух.style.height = '0px'; въздух.setAttribute('aria-hidden', 'true');
    let върнато = null;
    отмяна.addEventListener('click', () => {
      if (!върнато) { отмяна.hidden = true; return; }
      items = load(key, []);   // пресен прочит ПРЕДИ записа
      items.splice(Math.min(върнато.i, items.length), 0, върнато.it);
      if (!save(key, items)) { items.splice(Math.min(върнато.i, items.length - 1), 1); знак(бележка, '😕 Паметта е пълна — не мога да я върна.', 5000); return; }
      върнато = null; отмяна.hidden = true; clearTimeout(отмяна._t);
      draw(); fx().buzz(8); знак(бележка, '✔ Върнах я');
    });
    function питайЗаНадпис() {
      нотаРед.innerHTML = '';
      const п = el('input', 'jr-word');
      п.type = 'text'; п.maxLength = 60;
      п.placeholder = opts.notePrompt;
      п.setAttribute('aria-label', opts.notePrompt);
      // 👆 11.08: „✔" беше 40px широк (измерено: 40×44) — под прага за пръст, а
      //    до него нямаше ИЗХОД. На телефон няма клавиш Escape: мама или пише
      //    надпис, или редът стои отворен завинаги. Явни 44 и второ копче „✕".
      const ок = el('button', 'jr-chip', '✔'); ок.type = 'button';
      ок.setAttribute('aria-label', 'запази надписа'); ок.title = 'Запази надписа';
      ок.style.minWidth = '44px';
      const без = el('button', 'jr-chip', '✕'); без.type = 'button';
      без.setAttribute('aria-label', 'без надпис'); без.title = 'Остави без надпис';
      без.style.minWidth = '44px';
      const затвори = () => { нотаРед.style.display = 'none'; нотаРед.innerHTML = ''; въздух.style.height = '0px'; };
      const запиши = () => {
        const т = п.value.trim().slice(0, 60);
        items = load(key, []);   // пресен прочит ПРЕДИ записа
        if (т && items.length) { items[items.length - 1].note = т; save(key, items); draw(); }
        затвори();
      };
      ок.addEventListener('click', запиши);
      без.addEventListener('click', затвори);
      п.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); запиши(); }
        else if (e.key === 'Escape') затвори();
      });
      нотаРед.appendChild(п); нотаРед.appendChild(ок); нотаРед.appendChild(без);
      нотаРед.style.display = '';
      // ⌨️ 11.08: измерено на 375×812 — полето се раждаше на y≈511, а клавиатурата
      //    изяжда долните ~350px: мама пише на сляпо. Три неща, всяко проверено:
      //    1) само `scrollIntoView` не стигаше — картата е ПОСЛЕДНА в стаята и
      //       скролът вече е опрян в дъното (top 1448 = max 1448, няма накъде);
      //       затова първо отваряме въздух под картата, а той се прибира веднага
      //       щом редът се затвори;
      //    2) `block:'center'` пак не стигаше — самата стая живее на y 257..807,
      //       значи „центърът“ ѝ е y≈511, още под клавиатурата; 'start' качва
      //       реда на y≈257;
      //    3) `behavior:'smooth'` ГУБЕШЕ състезанието със скролването, което
      //       браузърът прави сам при `focus()` — редът оставаше на 511. Затова
      //       нагласяме скрола МИГНОВЕНО и чак после даваме фокуса.
      въздух.style.height = '46vh';
      try { нотаРед.scrollIntoView({ block: 'start', behavior: 'auto' }); } catch (e) {}
      п.focus();
    }
    file.addEventListener('change', () => {
      const f = file.files[0]; if (!f) return;
      знак(бележка, '📸 Приемам снимката…', 6000);
      shrinkImage(f, 360, url => {
        items = load(key, []);   // пресен прочит ПРЕДИ записа
        items.push({ img: url, note: '', ts: Date.now() });
        if (opts.max) while (items.length > opts.max) items.shift();
        if (!save(key, items)) { items.pop(); знак(бележка, '😕 Паметта се напълни — изтрий нещо старо.', 5000); fx().cheer('Паметта се напълни — изтрий нещо старо. 😕'); draw(); return; }
        fx().buzz(12);
        draw();
        знак(бележка, '✔ Прибрах я');
        if (opts.notePrompt) питайЗаНадпис();
      }, () => { знак(бележка, ГРЕШКА_СНИМКА, 6000); fx().cheer(ГРЕШКА_СНИМКА); });
      file.value = '';
    });
    function draw() {
      items = load(key, []);   // пресен прочит при всяко рисуване
      grid.innerHTML = '';
      if (!items.length) {
        // 🟠 11.08: празният текст падаше В решетката от 4 колони и се смачкваше
        //    в лента 72px широка и 166px висока (измерено). Първото, което вижда
        //    мама в тази карта, беше нечетимо. Заема целия ред.
        const p = el('p', 'jr-privacy', opts.empty || 'Първата снимка чака своето докосване. 📸');
        p.style.gridColumn = '1 / -1';
        grid.appendChild(p); return;
      }
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
      // 🗑 11.08: триеше МИГНОВЕНО и завинаги, а копчето стои плътно до „Затвори".
      //    Снимка на обрив или първа драскулка не се връща. Две докосвания и
      //    десет секунди път назад.
      const изтрий = ov.querySelector('#exDel');
      let сигурна = false;
      изтрий.onclick = () => {
        if (!сигурна) {
          сигурна = true; изтрий.textContent = '🗑 Наистина? Натисни пак';
          setTimeout(() => { if (сигурна) { сигурна = false; изтрий.textContent = '🗑 Изтрий'; } }, 4000);
          return;
        }
        върнато = { it: items[idx], i: idx };
        items = load(key, []);   // пресен прочит ПРЕДИ записа
        const k = items.findIndex(x => x && x.ts === it.ts);   // по ЧАС, не по номер
        if (k > -1) { върнато.i = k; items.splice(k, 1); }
        save(key, items); ov.hidden = true; draw();
        отмяна.hidden = false;
        clearTimeout(отмяна._t);
        отмяна._t = setTimeout(() => { отмяна.hidden = true; върнато = null; }, 10000);
        знак(бележка, '🗑 Махнах я — можеш да я върнеш.', 10000);
      };
      ov.onclick = e => { if (e.target === ov) ov.hidden = true; };
    }
    c.appendChild(addB); c.appendChild(file); c.appendChild(нотаРед); c.appendChild(бележка); c.appendChild(отмяна); c.appendChild(grid);
    c.appendChild(el('p', 'jr-privacy', '🔒 Смалени, само на твоя телефон.'));
    c.appendChild(въздух);
    addB.addEventListener('click', () => file.click());
    draw();
    return c;
  }

  // 12.12.4: при споделяне снимката носи ДАТАТА и ВЪЗРАСТТА на бебето,
  // подпечатани в лента отдолу — за да значи нещо след години.
  // 🔴 19.08 (ИЗМЕРЕНО, dev/vremeto.js — 6 разминавания от 17 сценария):
  //    този печат остава ЗАВИНАГИ върху споделената снимка, а казваше ДРУГА
  //    възраст от екрана, който мама гледа в същата минута:
  //      · на ПЪРВИЯ рожден ден — тук „11 месеца“, банерът „1 годинка“
  //        (365 / 30.4375 = 11.99 → 11)
  //      · бебе точно на 2 месеца — тук „1 месец“ (59 / 30.4375 = 1.93)
  //      · родена 31 ян., снимка на 28 фев. — тук „28 дни“, банерът горе
  //        „днес празнува 1-месечнина“
  //      · на 2 години — тук „1 г. 11 м.“
  //    Причината: месецът тук беше СРЕДЕН (30.4375 дни), а цялото приложение
  //    (BL_AGE в rooms2.js, банерът, ваксините) брои КАЛЕНДАРНИ месеци с
  //    клампване към края на късия месец. Сега и тук е така — същата сметка,
  //    същият отговор. Второто: „YYYY-MM-DD“ се четеше като полунощ по
  //    Гринуич, тоест ВЧЕРА за майка в западна часова зона.
  //    ПЪТ НАЗАД: тялото беше 5 реда — Math.floor(дни / 30.4375) и т.н.
  function възрастНа(ts) {
    try {
      const b = load('bl_baby', {}).birth;
      if (!b) return '';
      const ден0 = v => {
        const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v));
        if (m) return new Date(+m[1], +m[2] - 1, +m[3]);      // локална полунощ
        const x = new Date(v);
        return isNaN(x) ? x : new Date(x.getFullYear(), x.getMonth(), x.getDate());
      };
      const рожд = ден0(b), кога = ден0(new Date(ts));
      if (isNaN(рожд) || isNaN(кога)) return '';
      const дни = Math.round((кога - рожд) / 86400000);
      if (дни < 0) return '';
      const наДен = д => window.BL_DATE
        ? BL_DATE.addMonths(рожд, д)
        : new Date(рожд.getFullYear(), рожд.getMonth() + д,
            Math.min(рожд.getDate(), new Date(рожд.getFullYear(), рожд.getMonth() + д + 1, 0).getDate()));
      let м = (кога.getFullYear() * 12 + кога.getMonth()) - (рожд.getFullYear() * 12 + рожд.getMonth());
      if (наДен(м) > кога) м--;
      if (м < 1) return дни + (дни === 1 ? ' ден' : ' дни');
      if (м < 12) return м + (м === 1 ? ' месец' : ' месеца');
      const г = Math.floor(м / 12), ом = м % 12;
      return г + ' г.' + (ом ? ' ' + ом + ' м.' : '');
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
    // 🔴 11.08 капанът на снимката — същият като при photoListCard горе.
    let items = load(key, []);
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
    const надпис = () => '🎙️ Запиши (до ' + MAXS + ' сек)';
    const recB = el('button', 'jr-btn vc-rec', надпис()); recB.type = 'button';
    const бележка = el('p', 'jr-reply'); бележка.hidden = true;
    const отмяна = el('button', 'jr-chip', '↺ Върни записа'); отмяна.type = 'button'; отмяна.hidden = true;
    const list = el('div', 'vc-list');
    let mr = null, chunks = [], timer = null, тик = null, зает = false, върнато = null;
    отмяна.addEventListener('click', () => {
      if (!върнато) { отмяна.hidden = true; return; }
      items = load(key, []);   // пресен прочит ПРЕДИ записа
      items.splice(Math.min(върнато.i, items.length), 0, върнато.it);
      if (!save(key, items)) { items.splice(Math.min(върнато.i, items.length - 1), 1); знак(бележка, '😕 Паметта е пълна — не мога да го върна.', 5000); return; }
      върнато = null; отмяна.hidden = true; clearTimeout(отмяна._t);
      draw(); fx().buzz(8); знак(бележка, '✔ Върнах записа');
    });
    recB.addEventListener('click', async () => {
      if (mr) { mr.stop(); return; }
      // 🔴🔴 11.08 (жива обиколка, измерено): между докосването и позволението за
      //    микрофон бутонът НЕ СЕ ПРОМЕНЯШЕ. Мама натиска пак… и пак. Всяко
      //    натискане отваряше НОВ микрофонен поток: 3 докосвания = 3 живи потока
      //    (проверено — и трите останаха `live`), защото `mr` пази само последния,
      //    а другите два не ги спира никой. Червената точка на телефона свети до
      //    рестарт. Пазач + видим отговор ВЕДНАГА.
      if (зает) return;
      if (!navigator.mediaDevices || !window.MediaRecorder) {
        recB.textContent = 'Този телефон не поддържа запис 😕';
        setTimeout(() => { if (!mr) recB.textContent = надпис(); }, 3000);
        return;
      }
      зает = true;
      recB.textContent = '🎙️ Чакам позволение…';
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // подсигуровка: ако междувременно вече тече запис, този поток не ни трябва
        if (mr) { stream.getTracks().forEach(t => t.stop()); зает = false; return; }
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
          clearTimeout(timer); clearInterval(тик);
          stream.getTracks().forEach(t => t.stop());
          const blob = new Blob(chunks, { type: mr.mimeType || 'audio/webm' });
          mr = null; зает = false;
          recB.textContent = надпис(); recB.classList.remove('rec');
          if (blob.size > 900 * 1024) { знак(бележка, '😊 Записът стана твърде дълъг — пробвай по-кратко.', 5000); fx().cheer('Записът стана твърде дълъг — пробвай по-кратко. 😊'); return; }
          знак(бележка, '💜 Прибирам записа…', 6000);
          const rd = new FileReader();
          rd.onload = () => {
            items = load(key, []);   // пресен прочит ПРЕДИ записа
            items.push({ a: rd.result, label, ts: Date.now() });
            if (!save(key, items)) { items.pop(); знак(бележка, '😕 Паметта се напълни — изтрий стар запис.', 5000); fx().cheer('Паметта се напълни — изтрий стар запис. 😕'); }
            else { fx().buzz(12); fx().confetti(recB, 12); знак(бележка, '✔ Записът е прибран'); }
            draw();
          };
          rd.onerror = () => { знак(бележка, '😕 Записът не се прочете — пробвай пак.', 5000); };
          rd.readAsDataURL(blob);
        };
        mr.start();
        зает = false;
        // ⏱️ 11.08: „⏹ Спри записа" не казваше НИЩО за времето — мама пее и не знае
        //    кога ще я отреже таймерът. Броячът тече върху самия бутон.
        let остават = MAXS;
        recB.textContent = '⏹ Спри записа · ' + остават + 'с'; recB.classList.add('rec');
        clearInterval(тик);
        тик = setInterval(() => {
          остават--;
          if (mr && остават >= 0) recB.textContent = '⏹ Спри записа · ' + остават + 'с';
        }, 1000);
        timer = setTimeout(() => { if (mr) mr.stop(); }, MAXS * 1000);
      } catch (e) {
        зает = false;
        recB.textContent = 'Нужно е позволение за микрофона 🎙️';
        setTimeout(() => { if (!mr) recB.textContent = надпис(); }, 2500);
      }
    });
    function draw() {
      items = load(key, []);   // пресен прочит при всяко рисуване
      list.innerHTML = items.length ? '' : `<p class="jr-privacy">${opts.empty || 'Тук ще живеят малките звуци, които не искаш да забравиш. 🎙️'}</p>`;
      items.slice().reverse().forEach((it, ri) => {
        const idx = items.length - 1 - ri;
        const row = el('div', 'vc-row');
        row.innerHTML = `<span class="vc-lbl">${esc(it.label) || '🎙️'}</span><audio controls preload="none" src="${esc(it.a)}"></audio>
          <span class="vc-meta">${dstr(it.ts)} <button class="nt-del" type="button" aria-label="Изтрий записа" style="min-width:44px">🗑</button></span>`;
        // 🗑 11.08: целта беше 40px широка (измерено), а зад нея — безвъзвратно
        //    триене на първата дума на детето. Явни 44 и десет секунди път назад.
        row.querySelector('.nt-del').addEventListener('click', () => {
          върнато = { it: items[idx], i: idx };
          items = load(key, []);   // пресен прочит ПРЕДИ записа
          const k = items.findIndex(x => x && x.ts === it.ts);   // по ЧАС, не по номер
          if (k > -1) { върнато.i = k; items.splice(k, 1); }
          save(key, items); draw();
          отмяна.hidden = false;
          clearTimeout(отмяна._t);
          отмяна._t = setTimeout(() => { отмяна.hidden = true; върнато = null; }, 10000);
          знак(бележка, '🗑 Махнах записа — можеш да го върнеш.', 10000);
        });
        list.appendChild(row);
      });
    }
    c.appendChild(recB); c.appendChild(бележка); c.appendChild(отмяна); c.appendChild(list);
    c.appendChild(el('p', 'jr-privacy', '🔒 Записите живеят само на телефона ти (паметта е ограничена — кратки съкровища).'));
    draw();
    return c;
  }

  // ── 🖨️ печатен оверлей: паспорти, бележки, картички, годишник ──
  function printOverlay(title, bodyHtml, opts) {
    opts = opts || {};
    let ov = document.getElementById('printHolder');
    if (!ov) { ov = el('div', 'pr-holder'); ov.id = 'printHolder'; document.body.appendChild(ov); }
    // 🔴🔴 11.08 (измерено в браузъра): `title` влизаше СУРОВ в innerHTML.
    //    Пуснато `printOverlay('Досието на <img src=x onerror=…>')` → кодът се
    //    ИЗПЪЛНИ. Заглавието не е наше — js/lab.js:620 слепва името на бебето
    //    (вход на мама) без esc(). Тук чистим само `<` и `>`: викачите, които
    //    вече подават esc()-нат текст (rooms14/17/18), не се удвояват, защото
    //    в тях няма СУРОВИ ъглови скоби. Нито един викач не подава маркиране —
    //    проверено по всичките 22 места.
    const заглавие = String(title == null ? '' : title).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    ov.innerHTML =
      `<div class="pr-sheetwrap"><div class="pr-bar no-print">
         <button class="jr-chip" id="prPrint" type="button">🖨️ Принтирай / PDF</button>
         <button class="jr-chip" id="prClose" type="button">✕ Затвори</button>
       </div>
       <div class="pr-sheet ${opts.cls || ''}">
         <div class="pr-head"><span class="pr-logo">🎈 Бейби Ленд</span><h2>${заглавие}</h2></div>
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
