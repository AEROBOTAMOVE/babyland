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
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
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
    const amt = el('input'); amt.type = 'number'; amt.min = '0'; amt.max = '400'; amt.placeholder = 'мл (по желание)';
    amt.setAttribute('aria-label', 'Колко мл изцеди — по желание');
    amt.className = 'jr-word'; amt.style.maxWidth = '150px'; amt.inputMode = 'numeric';
    amtRow.appendChild(amt);
    c.appendChild(amtRow);

    const row = el('div', 'jr-quick');
    let undoTimer = null;
    const undo = el('button', 'jr-chip', '↺ Върни последното'); undo.type = 'button'; undo.hidden = true;
    [['left', '🤱 Ляво'], ['right', '🤱 Дясно'], ['both', '🤲 Двете']].forEach(([v, lbl]) => {
      const b = el('button', 'jr-chip', lbl); b.type = 'button';
      b.addEventListener('click', () => {
        const log = load('bl_pump', []);
        const ml = parseInt(amt.value, 10);
        log.push({ t: Date.now(), s: v, ml: (ml > 0 && ml < 2000) ? ml : null });
        // 🔴 г13/16: пръстенът беше 24 записа — при по три помпения на ден първите
        //   падаха мълчаливо още на четвъртия ден. 200 стигат за месеци напред.
        save('bl_pump', log.slice(-200));
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
      if (log.length) { log.pop(); save('bl_pump', log); refresh(); }
      undo.hidden = true; clearTimeout(undoTimer);
    });
    c.appendChild(undo);
    c.appendChild(hist);
    c.appendChild(el('p', 'jr-privacy', 'Изцеденото количество не показва колко мляко имаш — бебето изцежда гърдата по-добре от помпата. 💜'));

    function refresh() {
      const log = load('bl_pump', []);
      if (!log.length) { out.innerHTML = 'Още няма отбелязано изцеждане. Бутни при следващото. 👇'; hist.innerHTML = ''; return; }
      const last = log[log.length - 1];
      const mins = Math.floor((Date.now() - last.t) / 60000);
      const h = Math.floor(mins / 60), m = mins % 60;
      out.innerHTML = `Последно (${страна(last.s)}${last.ml ? ' · ' + last.ml + ' мл' : ''}) преди <strong>${h ? h + ' ч ' : ''}${m} мин</strong>.`;
      const прегл = log.slice(-3).reverse()
        .map(x => `${страна(x.s)} · ${hhmm(x.t)}${x.ml ? ' · ' + x.ml + ' мл' : ''}`).join(' · ');
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
