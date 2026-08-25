// ═══════════════════════════════════════════════════════════
// 🍼 ДНЕВНИК ЗА ПОМПЕНЕ — bl_pump (одит 22.07, реюз на хранене-таймера)
// Обвива стаята „Моето бебе": вика оригиналния рендер и добавя своя карта
// най-отдолу. Бърз запис като хранене-таймера: коя гърда, час, по желание мл.
// Помага на работеща/изцеждаща майка да пази ритъма. 0 медицински дози —
// количеството е НЕЙНО, по желание, ние нищо не предписваме. Преизползва
// съществуващите класове (jr-card/jr-title/jr-quick/jr-chip/bb-feed).
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; return v; } catch (e) { return d; } };
  // 🔴 25.08 (ИЗМЕРЕНО, dev/broyachi_dnevnik.js П4.3): при пълна памет
  //    `catch (e) {}` изяждаше грешката МЪЛЧЕШКОМ — измерено живо: 0 записани,
  //    а на екрана светваше „↺ Върни последното“ върху несъществуващ запис и
  //    нито дума защо. Записът вече казва ДА или НЕ.
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return false; } return true; };
  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html !== undefined) n.innerHTML = html; return n; };
  const card = (titleHtml) => { const c = el('section', 'jr-card'); c.appendChild(el('h4', 'jr-title', titleHtml)); return c; };
  const hhmm = ts => { const d = new Date(ts); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
  const страна = s => s === 'left' ? 'Ляво' : s === 'right' ? 'Дясно' : 'Двете';

  function помпаКарта(root) {
    const c = card('Дневник за помпене 🍼 <span class="jr-sub">кога и (по желание) колко изцеди — пазя ритъма ти</span>');
    const out = el('p', 'bb-feed', '');
    const hist = el('p', 'bb-feed', ''); hist.style.opacity = '.85'; hist.style.fontSize = '.92em';
    c.appendChild(out);

    // по желание: колко мл (НЕЙНО число — не предписваме нищо)
    const amtRow = el('div', 'jr-quick');
    const amt = el('input'); amt.type = 'number'; amt.min = '0'; amt.max = '1500'; amt.placeholder = 'мл (по желание)';
    amt.setAttribute('aria-label', 'Колко мл изцеди — по желание');
    amt.className = 'jr-word'; amt.style.maxWidth = '150px'; amt.inputMode = 'numeric';
    amtRow.appendChild(amt);
    c.appendChild(amtRow);
    // 🔴 11.08 (обиколка по картите): числото извън обхвата падаше МЪЛЧЕШКОМ.
    //    Мама пише „9999“ (изпуснат пръст), натиска „Ляво“ — полето се изчиства,
    //    записът влиза БЕЗ количество и никъде не пише защо. Тя мисли, че мл-та
    //    са вътре. Сега грешното число не се записва, не се трие от полето и си
    //    има думи. Празно поле си остава напълно нормално — мл-та са по желание.
    const бел = el('p', 'jr-hint', ''); бел.hidden = true;
    бел.setAttribute('aria-live', 'polite');
    c.appendChild(бел);
    function прочетиМл() {
      const сурово = String(amt.value == null ? '' : amt.value).trim().replace(',', '.');
      if (!сурово) return { ok: true, ml: null };
      const n = parseFloat(сурово);
      if (isNaN(n) || n < 0) return { ok: false, т: 'Това не ми прилича на количество в мл. Остави полето празно, ако не мериш — записът пак се пази. 💜' };
      if (n > 1500) return { ok: false, т: 'Толкова мл в едно изцеждане няма как да са — провери числото. Мога и без него: изтрий го и пак бутни. 💜' };
      return { ok: true, ml: n > 0 ? Math.round(n) : null };
    }

    const row = el('div', 'jr-quick');
    let undoTimer = null;
    // 🕰️ ЧАСЪТ на записа, който ТАЗИ карта е добавила. Стаята може да живее
    //    и в скрития панел (втора нарисувана карта със същия ключ): сляпото
    //    `log.pop()` махаше НАЙ-НОВИЯ запис, който можеше да е чужд. Връщаме
    //    точно своя. ПЪТ НАЗАД: `log.pop()` върху пресен прочит.
    let последенЧас = null;
    const undo = el('button', 'jr-chip', '↺ Върни последното'); undo.type = 'button'; undo.hidden = true;
    [['left', '🤱 Ляво'], ['right', '🤱 Дясно'], ['both', '🤲 Двете']].forEach(([v, lbl]) => {
      const b = el('button', 'jr-chip', lbl); b.type = 'button';
      b.addEventListener('click', () => {
        const ч = прочетиМл();
        if (!ч.ok) { бел.textContent = '💛 ' + ч.т; бел.hidden = false; amt.focus(); amt.select && amt.select(); return; }
        бел.hidden = true;
        const log = load('bl_pump', []);
        const ml = ч.ml;
        const запис = { t: Date.now(), s: v, ml: ml };
        log.push(запис);
        // 🔴 г13/16: пръстенът беше 24 записа — при по три помпения на ден първите
        //   падаха мълчаливо още на четвъртия ден. 200 стигат за месеци напред.
        if (!save('bl_pump', log.slice(-200))) {
          // мл-тата НЕ се трият от полето — има ги за втори опит
          бел.textContent = '💛 Паметта на телефона се напълни — това изцеждане НЕ се записа. Изтрий някоя стара снимка или гласов запис и бутни пак.';
          бел.hidden = false;
          return;
        }
        последенЧас = запис.t;
        amt.value = '';
        refresh();
        if (window.BL_FX) BL_FX.buzz(6);
        undo.hidden = false;
        clearTimeout(undoTimer); undoTimer = setTimeout(() => { undo.hidden = true; }, 9000);
      });
      row.appendChild(b);
    });
    c.appendChild(row);
    undo.addEventListener('click', () => {
      const log = load('bl_pump', []);
      const i = последенЧас == null ? -1 : log.map(x => (x && x.t)).lastIndexOf(последенЧас);
      if (i > -1) {
        log.splice(i, 1);
        if (!save('bl_pump', log)) {
          бел.textContent = '💛 Паметта е пълна — не мога да махна записа сега.';
          бел.hidden = false;
          return;
        }
        последенЧас = null;
        refresh();
      }
      undo.hidden = true; clearTimeout(undoTimer);
    });
    c.appendChild(undo);
    c.appendChild(hist);
    c.appendChild(el('p', 'jr-privacy', 'Изцеденото количество не показва колко мляко имаш — бебето изцежда гърдата по-добре от помпата. 💜'));

    function refresh() {
      const log = load('bl_pump', []);
      if (!log.length) { out.innerHTML = 'Още няма отбелязано изцеждане. Бутни при следващото. 👇'; hist.innerHTML = ''; return; }
      const last = log[log.length - 1];
      // 🔴 11.08 (обиколка във времето): при върнат назад часовник (края на
      //    октомври) или сверен сбъркан телефон записът остава в бъдещето и
      //    редът излизаше „преди -1 ч -12 мин“. Не показваме отрицателно време.
      const изтекло = Date.now() - last.t;
      const mins = Math.floor(Math.max(0, изтекло) / 60000);
      const h = Math.floor(mins / 60), m = mins % 60;
      out.innerHTML = изтекло < -60000
        ? `Последното изцеждане е записано с час <strong>напред</strong> (${hhmm(last.t)}) — часовникът на телефона се е разминал. 💜`
        : `Последно (${страна(last.s)}${last.ml ? ' · ' + last.ml + ' мл' : ''}) преди <strong>${h ? h + ' ч ' : ''}${m} мин</strong>.`;
      // 🟠 11.08: прегледът показваше само час — три записа от три различни дни
      //    изглеждаха като „Ляво · 10:00 · Ляво · 10:00 · Ляво · 10:00“. Датата
      //    идва, щом записът не е от днес.
      const днес0 = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); })();
      const кога = ts => ts >= днес0 ? hhmm(ts)
        : ts >= днес0 - 86400000 ? 'вчера ' + hhmm(ts)
        : new Date(ts).toLocaleDateString('bg-BG', { day: 'numeric', month: 'numeric' }) + ' ' + hhmm(ts);
      const прегл = log.slice(-3).reverse()
        .map(x => `${страна(x.s)} · ${кога(x.t)}${x.ml ? ' · ' + x.ml + ' мл' : ''}`).join(' · ');
      hist.innerHTML = 'Последни: ' + прегл;
    }
    refresh();
    const tick = setInterval(() => { if (!out.isConnected) { clearInterval(tick); return; } refresh(); }, 60000);
    root.appendChild(c);
  }

  // 🔴 г13/162: регистрацията беше на DOMContentLoaded — тоест СЛЕД като polish.js
  //   вече е опаковал всички стаи с organize(). Картата се лепеше НАД готовата
  //   подредба: висеше под всички заглавия на кътчета, съдържанието горе не я
  //   изброяваше и търсенето в стаята я пропускаше. Синхронно, като rooms8.js —
  //   така влиза преди подредбата. (rooms2.js вече е регистрирал стаята.)
  if (window.ROOM_FEATURES && window.ROOM_FEATURES['Моето бебе']) {
    const orig = window.ROOM_FEATURES['Моето бебе'];
    window.ROOM_FEATURES['Моето бебе'] = function (root) {
      orig(root);
      try { помпаКарта(root); } catch (e) {}
    };
  }
})();
