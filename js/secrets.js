// ═══════════════════════════════════════════════════════════
// 🗝️ ТАЙНИТЕ ЗАД КАТИНАРА (план 19, част 3.1)
//
// Дневничето, изповедалнята и греховете в стая 8 стояха отворени за
// всеки, взел телефона. Сега: има ли ключалка (същият ПИН като на
// Дневника) — трите карти се сгъват в ЕДНА заключена, докато мама не
// отключи. Няма ли ключалка — честна покана, без плашене.
//
// ЗАРЕЖДА СЕ СЛЕД askfield.js: полето на Ния остава първо, катинарът
// работи върху вече подредената стая.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };

  // кои карти пазим (писмото и мечтите не са „тайни“).
  // 05.08: към трите добавени още три — те държат същия вид написано:
  // гнева към някого по име, майка ѝ и собствените ѝ пари. Стояха отворени
  // за всеки палец, а „Яростта“ дори обещаваше, че никой не ги чете.
  const ТАЙНИ = /Заключеното дневниче|Изповедалнята|Малките ми грехове|Яростта, която има адрес|Майка ми|Моите пари/;

  function катинар(root) {
    if (!window.BL_PIN || !BL_PIN.has || !BL_PIN.has() || BL_PIN.unlocked()) return;
    const карти = [...root.querySelectorAll('.jr-card')].filter(c => {
      const t = c.querySelector('.jr-title');
      return t && ТАЙНИ.test(t.textContent);
    });
    if (!карти.length) return;

    const ключ = el('section', 'jr-card sec-lock');
    ключ.innerHTML = `<h4 class="jr-title">Тайните 🗝️ <span class="jr-sub">заключени с твоя ПИН</span></h4>
      <p class="jr-privacy">Дневничето, изповедалнята, греховете, яростта, майка ти и твоите пари чакат зад ключалката — същата като на Дневника. Никой любопитен палец не минава оттук.</p>`;
    const б = el('button', 'jr-btn', '🔓 Отключи тайните'); б.type = 'button';
    б.addEventListener('click', () => {
      BL_PIN.ask('🗝️ Тайните са заключени', () => {
        if (window.MamaHelper) MamaHelper.open('Жената в мен');
      });
    });
    ключ.appendChild(б);

    карти[0].replaceWith(ключ);
    карти.slice(1).forEach(c => c.remove());

    // и от картата-съдържание изчезват (3.1.6 — скрити и от търсене по стаята)
    root.querySelectorAll('.toc-b').forEach(b => {
      if (ТАЙНИ.test(b.textContent)) b.remove();
    });
  }

  // без ключалка → тиха честна покана В самото дневниче (3.1.3)
  function покана(root) {
    if (window.BL_PIN && BL_PIN.has && BL_PIN.has()) return;
    const дн = [...root.querySelectorAll('.jr-card')].find(c => {
      const t = c.querySelector('.jr-title');
      return t && /Заключеното дневниче/.test(t.textContent);
    });
    if (!дн || дн.querySelector('.sec-offer')) return;
    дн.appendChild(el('p', 'jr-privacy sec-offer',
      '🔓 В момента тези неща стоят отворени. Искаш ли ключалка? Слага се за минутка в „Дневник на мама“ → „Ключалка на дневника“ — и важи и тук.'));
  }

  const база = window.ROOM_FEATURES && window.ROOM_FEATURES['Жената в мен'];
  if (база) window.ROOM_FEATURES['Жената в мен'] = root => {
    база(root);
    катинар(root);
    покана(root);
  };
})();
