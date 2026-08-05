// ═══════════════════════════════════════════════════════════
// 📱 ДОЛНАТА ЛЕНТА — надграждане (план 19, част 13.2)
//
// 🗂️ 13.2.2  6 от 9 стаи нямаха бърз път
//
// Лентата има 5 места и това е ПРАВИЛНО за телефон — девет иконки долу
// стават нечитаеми. Затова не добавям бутон („Още“ вече беше махнат и
// няма да се връща). Вместо това:
//   • ЗАДЪРЖАНЕ върху „Бебето“ отваря всичките 9 стаи наведнъж.
//   • Едно докосване води където мама Е СЕГА — бременна → Бременност,
//     6-месечно → Захранване. Бутонът се преименува сам.
//
// ЗАРЕЖДА СЕ СЛЕД app.js и СЛЕД helper.js.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

  const СТАИ = [
    ['Бременност', '🤰'], ['Моето бебе', '🍼'], ['Захранване', '🥄'],
    ['Здраве и SOS', '🩺'], ['Развитие и игри', '🧸'], ['Инструменти', '🎀'],
    ['Дневник на мама', '💜'], ['Жената в мен', '💃'], ['Лабораторията', '🔬']
  ];

  // ═══════════ къде е мама СЕГА ═══════════
  // Бутонът „Бебето“ водеше винаги в „Моето бебе“ — дори на бременна жена,
  // която още няма бебе. Сега пита данните.
  function стаятаЗаСега() {
    const бебе = load('bl_baby', {});
    if (!бебе.birth) {
      const очаква = window.BL_EXPECT && BL_EXPECT.has && BL_EXPECT.has() && !BL_EXPECT.paused();
      return очаква ? ['Бременност', '🤰', 'Чакаме'] : ['Моето бебе', '🍼', 'Бебето'];
    }
    const м = (Date.now() - new Date(бебе.birth)) / (30.4375 * 86400000);
    if (м >= 4.5 && м < 13) return ['Захранване', '🥄', 'Лъжички'];
    if (м >= 13) return ['Развитие и игри', '🧸', 'Игрите'];
    return ['Моето бебе', '🍼', 'Бебето'];
  }

  function пренастройБутона() {
    const б = document.querySelector('.bn-item[data-room="Моето бебе"]');
    if (!б || б.dataset.n2) return;
    б.dataset.n2 = '1';
    const [стая, е, име] = стаятаЗаСега();
    б.dataset.room = стая;
    б.innerHTML = `<span>${е}</span>${име}`;
    б.setAttribute('aria-label', стая + ' — задръж за всички стаи');
    // app.js вече е закачил click с ПЪРВОНАЧАЛНАТА стая в closure-а —
    // затова прихващам в capture фаза и отварям правилната.
    б.addEventListener('click', ev => {
      if (window.MamaHelper) { ev.preventDefault(); ev.stopImmediatePropagation(); MamaHelper.open(б.dataset.room); }
    }, true);
  }

  // ═══════════ 🗂️ 13.2.2 ВСИЧКИТЕ ДЕВЕТ — при задържане ═══════════
  function отвориИзбирача() {
    if (document.getElementById('navPick')) return;
    const слой = el('div', 'np-veil'); слой.id = 'navPick';
    слой.innerHTML = `<div class="np-box" role="dialog" aria-label="Всички стаи">
        <p class="np-h">Деветте стаи 🎈</p>
        <div class="np-grid">${СТАИ.map(([с, е]) =>
          `<button class="np-b" type="button" data-r="${esc(с)}"><span>${е}</span>${esc(с.replace(' и игри', '').replace(' и SOS', '').replace(' на мама', ''))}</button>`).join('')}</div>
      </div>`;
    document.body.appendChild(слой);
    requestAnimationFrame(() => слой.classList.add('on'));
    const махни = () => { слой.classList.remove('on'); setTimeout(() => слой.remove(), 220); };
    слой.addEventListener('click', e => { if (e.target === слой) махни(); });
    слой.querySelectorAll('.np-b').forEach(b => b.addEventListener('click', () => {
      махни();
      if (window.MamaHelper) MamaHelper.open(b.dataset.r);
    }));
    document.addEventListener('keydown', function изход(e) {
      if (e.key === 'Escape') { махни(); document.removeEventListener('keydown', изход); }
    });
    if (window.BL_FX) BL_FX.buzz(10);
  }

  function закачиЗадържане() {
    document.querySelectorAll('.bn-item[data-room]').forEach(б => {
      if (б.dataset.lp) return;
      б.dataset.lp = '1';
      let т = null, дълго = false;
      const старт = () => { дълго = false; т = setTimeout(() => { дълго = true; отвориИзбирача(); }, 480); };
      const край = () => { clearTimeout(т); };
      б.addEventListener('pointerdown', старт);
      б.addEventListener('pointerup', край);
      б.addEventListener('pointerleave', край);
      б.addEventListener('pointercancel', край);
      // задържането НЕ бива да отвори стаята после
      б.addEventListener('click', e => { if (дълго) { e.preventDefault(); e.stopImmediatePropagation(); дълго = false; } }, true);
      // с клавиатура: контекстното меню (Shift+F10 / бутона-меню) прави същото
      б.addEventListener('contextmenu', e => { e.preventDefault(); отвориИзбирача(); });
    });
  }

  document.addEventListener('DOMContentLoaded', () => setTimeout(() => {
    пренастройБутона();
    закачиЗадържане();
  }, 300));

  window.BL_NAV2 = { отвориИзбирача, стаятаЗаСега };
})();
