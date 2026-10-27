// ═══════════════════════════════════════════════════════════
// EXPR — общите изразни компоненти на мега плана (док. 12)
// 🎙️ гласови записи • 📸 датирани фото-галерии • 🖨️ печатен оверлей
// Всичко живее само на телефона на мама.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { if (window.BL_ZAPIS_PADNA) BL_ZAPIS_PADNA(); return false; } return true; };
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
        if (т && items.length) {
          items[items.length - 1].note = т;
          // 🟠 25.08: записът на надписа беше единственият тук БЕЗ проверка —
          //    при пълна памет думите ѝ изчезваха, а редът се затваряше все
          //    едно всичко е наред. Сега редът ОСТАВА отворен и си казваме защо.
          if (!save(key, items)) { знак(бележка, '😕 Паметта е пълна — надписът не се запази.', 5000); return; }
          draw();
        }
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
      // 🔴 26.08 (ИЗМЕРЕНО, dev/kriv_zapis.js): при `[null]` в списъка тук
      //    гърмеше `it.img` и УБИВАШЕ картата — а с нея и всичко след нея в
      //    стаята. Засягаше 3 карти в 3 различни стаи (рисунки, гримаси, обриви).
      //    ПЪТ НАЗАД: махаш `.filter(x => x && x.img)`.
      items.filter(x => x && x.img).slice().reverse().forEach((it, ri) => {
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
        // 🟠 25.08: при пълна памет триенето не минаваше, а картата казваше
        //    „Махнах я“ и вдигаше „↺ Върни снимката“ — снимката се появяваше
        //    пак при следващото рисуване и мама не разбираше кое е истина.
        if (!save(key, items)) {
          върнато = null; ov.hidden = true; draw();
          знак(бележка, '😕 Паметта е пълна — снимката НЕ е изтрита. Още е тук.', 6000);
          return;
        }
        ov.hidden = true; draw();
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
      // 🔴 26.08 (ИЗМЕРЕНО): същият дефект при гласовите записи — `it.label`
      //    върху null убиваше 5 карти в 4 стаи (гласова бележка, гласов
      //    дневник, песничка, писмо в корема, звуци на бебето).
      items.filter(x => x && x.a).slice().reverse().forEach((it, ri) => {
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
          // 🟠 25.08 — същото като при снимките: триене, което не е минало,
          //    не бива да се обявява за минало.
          if (!save(key, items)) {
            върнато = null; draw();
            знак(бележка, '😕 Паметта е пълна — записът НЕ е изтрит. Още е тук.', 6000);
            return;
          }
          draw();
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

// ═══════════════════════════════════════════════════════════
// 🖼️ ФИЗИЧЕСКИЯТ СПОМЕН (27.10.2026) — картинки за хартия и за телефона
// картичка (10×15 / квадрат / сторис) · колаж (2–9 снимки) · плакат „Първата година“ (до 12)
// 🔒 Снимките НЕ излизат от телефона: локален canvas → Blob → „Сподели/Запази“ или
//    изтегляне — винаги тръгнало от натиск на мама. Нищо не се качва никъде.
// 📏 iOS не рисува платно над 16 777 216 пиксела (остава празно, без грешка) —
//    най-голямото тук е 2400×3200 = 7,7 млн; платно() смалява всичко над тавана.
// 🎨 Цветовете са токените на css/premium.css (--pl-*), шрифтовете — Nunito на
//    приложението и серифът на заглавията (--pl-serif). Нов цвят няма.
// ПЪТ НАЗАД: махни този IIFE (викачът е js/photos.js през window.BL_FIZ).
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const Ц = {
    крем: '#fff8f2', хартия: '#fffdfb', линия: '#f1e4d9', нави: '#1d2a5c', сиво: '#6a6682', роза: '#e56d99',
    розаМека: '#fde6ef', небе: '#dfeafb', мента: '#dff2e7', люляк: '#ece4f8', масло: '#fff0d4', праскова: '#fde5d8', градина: '#e3efe0'
  };
  const ТОНОВЕ = [Ц.розаМека, Ц.праскова, Ц.люляк, Ц.небе, Ц.мента, Ц.масло, Ц.градина];
  const СЕРИФ = "Georgia, 'Noto Serif', 'Droid Serif', 'Times New Roman', serif";
  const НУНИТО = "'Nunito', 'Nunito-fallback', sans-serif";
  const шрифт = (тегло, семейство) => px => тегло + ' ' + Math.round(px) + 'px ' + семейство;
  const ЗАГЛАВЕН = шрифт(700, СЕРИФ), ДЕБЕЛ = шрифт(800, НУНИТО), ПЛЪТЕН = шрифт(700, НУНИТО);
  const ТАВАН = 16777216;
  const ЛОГО = '🎈 Бейби Ленд';
  const НЯМА = 'Снимката не се отваря — пробвай с друга. 😕';
  const хеш = т => { let h = 2166136261; for (const з of String(т || '')) h = Math.imul(h ^ з.codePointAt(0), 16777619); return h >>> 0; };

  // шрифтовете са локални (fonts/), но canvas не чака @font-face сам — без това пише със системния
  function шрифтове() {
    try {
      if (!document.fonts || !document.fonts.load) return Promise.resolve();
      const п = Promise.all(['700', '800'].map(т => document.fonts.load(т + " 40px 'Nunito'", 'Бейби Ленд').catch(() => {})));
      return Promise.race([п, new Promise(r => setTimeout(r, 2500))]);
    } catch (e) { return Promise.resolve(); }
  }

  // една снимка → {img, w, h, надпис} или null: повредена или липсваща се пропуска, не гърми
  function зареди(с) {
    return new Promise(готово => {
      const src = typeof с === 'string' ? с : с && с.img;
      if (!src || typeof src !== 'string') return готово(null);
      const img = new Image();
      let свършено = false;
      const край = v => { if (свършено) return; свършено = true; clearTimeout(т); готово(v); };
      const т = setTimeout(() => край(null), 8000);
      img.onload = () => край(img.naturalWidth && img.naturalHeight ? { img, w: img.naturalWidth, h: img.naturalHeight, надпис: с && с.надпис ? String(с.надпис).trim() : '' } : null);
      img.onerror = () => край(null);
      img.src = src;
    });
  }
  // зареждаме малко повече, за да има с какво да запълним мястото на пропуснатите
  async function снимките(списък, макс) {
    const вход = (Array.isArray(списък) ? списък : [списък]).filter(Boolean).slice(0, макс * 2);
    return (await Promise.all(вход.map(зареди))).filter(Boolean).slice(0, макс);
  }

  function платно(w, h) {
    const k = w * h > ТАВАН ? Math.sqrt(ТАВАН / (w * h)) : 1;
    const c = document.createElement('canvas');
    c.width = Math.floor(w * k); c.height = Math.floor(h * k);
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    if (k < 1) x.scale(k, k);   // рисуваме в пълните мерки, платното е по-малко
    return { c, x };
  }

  // JPEG .92; iOS държи паметта на платното, докато не го смалиш до 0 — затова освободи()
  function вБлоб(c) {
    return new Promise((ok, не) => {
      const освободи = () => { c.width = 0; c.height = 0; };
      const резерва = () => {
        try {
          const д = c.toDataURL('image/jpeg', 0.92); освободи();
          const б = atob(д.split(',')[1] || '');
          if (б.length < 100) throw new Error('празно');
          const м = new Uint8Array(б.length); for (let i = 0; i < б.length; i++) м[i] = б.charCodeAt(i);
          ok(new Blob([м], { type: 'image/jpeg' }));
        } catch (e) { освободи(); не(new Error('Картинката не се получи — пробвай с по-малко снимки. 😕')); }
      };
      try { c.toBlob(b => { if (b && b.size) { освободи(); ok(b); } else резерва(); }, 'image/jpeg', 0.92); } catch (e) { резерва(); }
    });
  }

  function обла(x, a, b, w, h, r) {
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    x.beginPath(); x.moveTo(a + r, b);
    x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r);
    x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath();
  }
  // object-fit: cover, изрязано леко нагоре — лицата по-често са в горната половина
  function покрий(x, с, a, b, w, h, r) {
    const k = Math.max(w / с.w, h / с.h), sw = w / k, sh = h / k;
    x.save(); обла(x, a, b, w, h, r); x.clip();
    x.drawImage(с.img, (с.w - sw) / 2, (с.h - sh) * 0.4, sw, sh, a, b, w, h);
    x.restore();
  }
  // пастелен фон + меки петна; едно и също заглавие → едни и същи цветове и места
  function фон(x, w, h, семе) {
    const г = x.createLinearGradient(0, 0, w * 0.4, h);
    г.addColorStop(0, Ц.крем); г.addColorStop(1, ТОНОВЕ[семе % ТОНОВЕ.length]);
    x.fillStyle = г; x.fillRect(0, 0, w, h);
    let s = семе || 7; const сл = () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
    const м = Math.min(w, h);
    for (let i = 0; i < 8; i++) {
      x.globalAlpha = 0.45 + сл() * 0.4;
      x.fillStyle = ТОНОВЕ[(семе + i * 3) % ТОНОВЕ.length];
      x.beginPath(); x.arc(сл() * w, сл() * h, м * (0.05 + сл() * 0.12), 0, Math.PI * 2); x.fill();
    }
    x.globalAlpha = 1;
  }
  // белият паспарту лист с мека сянка (--pl-shadow) и линия --pl-line
  function паспарту(x, a, b, w, h, r, м) {
    x.save();
    x.shadowColor = 'rgba(170, 118, 118, .2)'; x.shadowBlur = м * 0.04; x.shadowOffsetY = м * 0.012;
    x.fillStyle = Ц.хартия; обла(x, a, b, w, h, r); x.fill();
    x.restore();
    x.lineWidth = Math.max(1.5, м * 0.002); x.strokeStyle = Ц.линия; обла(x, a, b, w, h, r); x.stroke();
  }

  // „\n“ е задължителен нов ред; чупим само на обикновен интервал (неразделимият държи датата цяла)
  function редове(x, текст, шир) {
    const р = [];
    for (const абзац of String(текст).split('\n')) {
      let ред = '';
      for (const д of абзац.trim().split(/[ \t]+/)) {
        const п = ред ? ред + ' ' + д : д;
        if (!ред || x.measureText(п).width <= шир) ред = п; else { р.push(ред); ред = д; }
      }
      if (ред) р.push(ред);
    }
    return р;
  }
  function съкрати(x, ред, шир) {
    if (x.measureText(ред).width <= шир) return ред;
    // по знак, не по UTF-16 единица — иначе емоджито се цепи наполовина и излиза „�…“
    const з = Array.from(ред);
    while (з.length > 1 && x.measureText(з.join('') + '…').width > шир) з.pop();
    return з.join('').trimEnd() + '…';
  }
  // най-едрият размер (от → до), при който текстът влиза в ширината и в „макс“ реда; иначе „…“
  function вмести(x, текст, шир, макс, от, до, ш) {
    for (let px = от; ; px = Math.max(до, px * 0.93)) {
      x.font = ш(px);
      const р = редове(x, текст, шир);
      if ((р.length <= макс && р.every(л => x.measureText(л).width <= шир)) || px <= до) {
        let крайни = р.slice(0, макс);
        // равни редове („Първата година / на Алекс“, не „Първата година на / Алекс“): стесняваме, докато броят им стои
        if (р.length > 1 && р.length <= макс) for (let ш2 = шир * 0.96; ш2 > шир * 0.4; ш2 *= 0.96) { const б = редове(x, текст, ш2); if (б.length !== р.length) break; крайни = б; }
        if (р.length > макс) крайни[макс - 1] += ' ' + р.slice(макс).join(' ');
        return { px, р: крайни.map(л => съкрати(x, л, шир)) };
      }
    }
  }
  // блоковете: {т, ш, цв, макс, от, до, лх, над, черта}; ако не влизат във височината — всички по-дребно
  function подреди(x, блокове, шир, вис) {
    const пълни = блокове.filter(б => б.т && String(б.т).trim());
    for (let к = 1; ; к *= 0.9) {
      let общо = 0;
      const сп = пълни.map(б => {
        const в = вмести(x, б.т, шир, б.макс, б.от * к, б.до * к, б.ш);
        const бл = Object.assign({}, б, в, { над: (б.над || 0) * к, вис: в.р.length * в.px * б.лх });
        общо += бл.над + бл.вис; return бл;
      });
      if (общо <= вис || к < 0.5) return { сп, общо };
    }
  }
  function рисувай(x, сп, xx, y, подр) {
    x.textAlign = подр; x.textBaseline = 'middle';
    for (const б of сп) {
      if (б.черта && б.над) {   // розовата чертичка над заглавието (като .pl-heart)
        const дш = б.px * 0.6, дв = Math.max(4, б.px * 0.06);
        x.fillStyle = Ц.роза; обла(x, подр === 'center' ? xx - дш / 2 : xx, y + б.над * 0.2, дш, дв, дв / 2); x.fill();
      }
      y += б.над;
      x.font = б.ш(б.px); x.fillStyle = б.цв;
      б.р.forEach((л, i) => x.fillText(л, xx, y + б.px * б.лх * (i + 0.5)));
      y += б.вис;
    }
    return y;
  }
  function лого(x, xx, y, px, подр) {
    x.save(); x.globalAlpha = 0.72; x.font = ПЛЪТЕН(px); x.fillStyle = Ц.сиво; x.textAlign = подр; x.textBaseline = 'middle';
    x.fillText(ЛОГО, xx, y); x.restore();
  }
  function датата(д) {
    if (д === false || д === '') return '';
    if (typeof д === 'string' && !/^\d{4}-\d\d-\d\d/.test(д)) return д;   // вече готов текст
    const т = д == null ? new Date() : new Date(д);
    return isNaN(т) ? '' : т.toLocaleDateString('bg-BG', { day: 'numeric', month: 'long', year: 'numeric' }).replace(/ /g, ' ');
  }

  // ── 🃏 картичка: снимката голяма + „3 месеца“, името, датата ──
  // opts {заглавие, подзаглавие, име, дата?, формат: '10x15'|'kv'|'storis'}
  // 10x15 → 1800×1200 за легнала снимка, 1200×1800 за изправена; kv 1080²; storis 1080×1920
  const КАРТИЧКИ = {
    '10x15': { мат: [48, 48, 1104, 1704, 54], сн: [102, 102, 996, 1150, 36], зона: [102, 1288, 996, 394], подр: 'center', лого: [600, 1712, 30],
      з: [128, 64, 2], п: [54, 36, 2], м: [40, 30, 2], над: [34, 18, 16] },
    легнала: { мат: [48, 48, 1704, 1104, 54], сн: [102, 102, 1150, 996, 36], зона: [1312, 102, 380, 930], подр: 'left', лого: [1312, 1083, 30],
      з: [120, 64, 3], п: [50, 34, 3], м: [38, 28, 3], над: [40, 24, 20] },
    kv: { мат: [40, 40, 1000, 1000, 48], сн: [84, 84, 912, 610, 32], зона: [84, 720, 912, 259], подр: 'center', лого: [540, 1007, 26],
      з: [96, 52, 1], п: [44, 30, 1], м: [34, 26, 1], над: [26, 12, 10] },
    // сторис: текстът стои над полето за отговор на Инстаграм (долните ~200 px)
    storis: { мат: [56, 110, 968, 1700, 48], сн: [104, 158, 872, 1120, 32], зона: [104, 1310, 872, 420], подр: 'center', лого: [540, 1770, 28],
      з: [124, 64, 2], п: [52, 34, 2], м: [38, 28, 2], над: [34, 18, 14] }
  };
  async function картичка(снимка, opts) {
    opts = opts || {};
    const [, [с]] = await Promise.all([шрифтове(), снимките([снимка], 1)]);
    if (!с) throw new Error(НЯМА);
    const ф = opts.формат === 'kv' || opts.формат === 'storis' ? opts.формат : '10x15';
    const легнала = ф === '10x15' && с.w > с.h * 1.05;
    const [w, h] = ф === 'kv' ? [1080, 1080] : ф === 'storis' ? [1080, 1920] : легнала ? [1800, 1200] : [1200, 1800];
    const Р = КАРТИЧКИ[легнала ? 'легнала' : ф];
    const { c, x } = платно(w, h);
    фон(x, w, h, хеш(opts.заглавие));
    паспарту(x, ...Р.мат, Math.min(w, h));
    покрий(x, с, ...Р.сн);
    // в тясната колона на легналата името и датата са на два реда; иначе „Алекс · 20 януари 2026 г.“
    const мета = [opts.име, датата(opts.дата)].map(т => String(т || '').trim()).filter(Boolean).join(легнала ? '\n' : ' · ');
    const [зх, зу, зш, зв] = Р.зона;
    const { сп, общо } = подреди(x, [
      { т: opts.заглавие, ш: ЗАГЛАВЕН, цв: Ц.нави, от: Р.з[0], до: Р.з[1], макс: Р.з[2], лх: 1.08, над: Р.над[0], черта: true },
      { т: opts.подзаглавие, ш: ДЕБЕЛ, цв: Ц.роза, от: Р.п[0], до: Р.п[1], макс: Р.п[2], лх: 1.25, над: Р.над[1] },
      { т: мета, ш: ПЛЪТЕН, цв: Ц.сиво, от: Р.м[0], до: Р.м[1], макс: Р.м[2], лх: 1.3, над: Р.над[2] }
    ], зш, зв);
    рисувай(x, сп, Р.подр === 'center' ? зх + зш / 2 : зх, зу + (зв - общо) / 2, Р.подр);
    лого(x, ...Р.лого, Р.подр);
    return вБлоб(c);
  }

  // ── 🧩 колаж: 2–9 снимки в мрежа, заглавие отгоре („октомври 2026“); 2160×2160 ──
  const РЕДОВЕ = { 1: [1], 2: [2], 3: [1, 2], 4: [2, 2], 5: [2, 3], 6: [3, 3], 7: [2, 3, 2], 8: [3, 2, 3], 9: [3, 3, 3] };
  async function колаж(снимки, opts) {
    opts = opts || {};
    const [, сн] = await Promise.all([шрифтове(), снимките(снимки, 9)]);
    if (!сн.length) throw new Error(НЯМА);
    const W = 2160, { c, x } = платно(W, W);
    фон(x, W, W, хеш(opts.заглавие) + 3);
    паспарту(x, 64, 64, 2032, 2032, 90, W);
    const { сп, общо } = подреди(x, [
      { т: opts.заглавие, ш: ЗАГЛАВЕН, цв: Ц.нави, от: 150, до: 80, макс: 1, лх: 1.1, над: 50, черта: true },
      { т: opts.подзаглавие, ш: ДЕБЕЛ, цв: Ц.роза, от: 64, до: 40, макс: 1, лх: 1.3, над: 12 }
    ], 1840, 330);
    рисувай(x, сп, W / 2, 128, 'center');
    const g = 26, gx = 128, gw = 1904, gy = 128 + (общо ? общо + 40 : 0), gh = 1990 - gy;
    const ред = РЕДОВЕ[сн.length], rh = (gh - g * (ред.length - 1)) / ред.length;
    let i = 0;
    ред.forEach((бр, р) => {
      const cw = (gw - g * (бр - 1)) / бр;
      for (let k = 0; k < бр; k++, i++) покрий(x, сн[i], gx + k * (cw + g), gy + р * (rh + g), cw, rh, 34);
    });
    лого(x, W / 2, 2048, 36, 'center');
    return вБлоб(c);
  }

  // ── 🗓️ плакат „Първата година на {име}“: до 12 снимки 3×4, надпис под всяка; 2400×3200 ──
  // opts {име, година?, заглавие?, подзаглавие?}; снимка.надпис → „1 месец“, „2 месеца“…
  async function плакат(снимки, opts) {
    opts = opts || {};
    const [, сн] = await Promise.all([шрифтове(), снимките(снимки, 12)]);
    if (!сн.length) throw new Error(НЯМА);
    const W = 2400, H = 3200, { c, x } = платно(W, H);
    const име = String(opts.име || '').trim(), семе = хеш(име) + 5;
    const година = opts.година === false ? '' : String(opts.година != null && opts.година !== '' ? opts.година : new Date().getFullYear());
    фон(x, W, H, семе);
    паспарту(x, 72, 72, 2256, 3056, 100, W);
    const { сп, общо } = подреди(x, [
      { т: opts.заглавие || ('Първата година' + (име ? ' на ' + име : '')), ш: ЗАГЛАВЕН, цв: Ц.нави, от: 168, до: 96, макс: 2, лх: 1.08, над: 56, черта: true },
      { т: година, ш: ДЕБЕЛ, цв: Ц.роза, от: 84, до: 56, макс: 1, лх: 1.3, над: 12 },
      { т: opts.подзаглавие, ш: ПЛЪТЕН, цв: Ц.сиво, от: 54, до: 38, макс: 2, лх: 1.3, над: 8 }
    ], 1980, 560);
    рисувай(x, сп, W / 2, 160, 'center');
    const g = 44, gx = 160, gw = 2080, cw = (gw - 2 * g) / 3, gy0 = 160 + общо + 60, gh = 3002 - gy0;
    const брРедове = Math.ceil(сн.length / 3);
    const th = Math.min((gh - g * (брРедове - 1)) / брРедове, cw * 1.15);
    const gy = gy0 + (gh - (брРедове * th + (брРедове - 1) * g)) / 2;
    const tp = 18, ca = сн.some(с => с.надпис) ? 92 : 0;
    сн.forEach((с, i) => {
      const р = Math.floor(i / 3), бр = Math.min(3, сн.length - р * 3);
      const tx = gx + (gw - (бр * cw + (бр - 1) * g)) / 2 + (i % 3) * (cw + g), ty = gy + р * (th + g);
      x.fillStyle = ТОНОВЕ[(семе + i) % ТОНОВЕ.length]; обла(x, tx, ty, cw, th, 36); x.fill();
      покрий(x, с, tx + tp, ty + tp, cw - 2 * tp, th - 2 * tp - ca, 24);
      if (ca && с.надпис) {
        const в = вмести(x, с.надпис, cw - 2 * tp - 16, 1, 46, 30, ДЕБЕЛ);
        x.font = ДЕБЕЛ(в.px); x.fillStyle = Ц.нави; x.textAlign = 'center'; x.textBaseline = 'middle';
        x.fillText(в.р[0], tx + cw / 2, ty + th - tp - ca / 2 + 2);
      }
    });
    лого(x, W / 2, 3072, 40, 'center');
    return вБлоб(c);
  }

  // ── 💾 запази: „Сподели → Запази снимка“ (iPhone/Android), иначе изтегляне ──
  // 'share' | 'download' | 'abort' (мама се отказа) | false. share иска жив натиск: ако е изтекъл
  // (NotAllowedError), минаваме към изтеглянето, вместо да мълчим.
  // 🔎 преглед 27.10: на компютър (Windows Chrome/Edge) системното „Сподели“ няма „Запази“ —
  //   там сваляме направо. Телефонът и таблетът (пръст) минават през „Сподели → Запази снимка“.
  async function запази(blob, име) {
    if (!blob) return false;
    let n = String(име || '').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, ' ').replace(/\s+/g, ' ').trim() || 'Бейби Ленд';
    if (!/\.jpe?g$/i.test(n)) n += '.jpg';
    const компютър = !!(window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches);
    try {
      const f = new File([blob], n, { type: blob.type || 'image/jpeg', lastModified: Date.now() });
      if (!компютър && navigator.canShare && navigator.share && navigator.canShare({ files: [f] })) {
        try { await navigator.share({ files: [f] }); return 'share'; }
        catch (e) { if (e && e.name === 'AbortError') return 'abort'; }
      }
    } catch (e) {}
    try {
      const u = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = u; a.download = n; a.rel = 'noopener'; a.style.display = 'none';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => { try { URL.revokeObjectURL(u); } catch (e) {} }, 60000);
      return 'download';
    } catch (e) { return false; }
  }

  window.BL_FIZ = { картичка, колаж, плакат, запази };
})();
