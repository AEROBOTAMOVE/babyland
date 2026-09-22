/* ═══════════════════════════════════════════════════════════════════════════════
   ☁️ КРАЯТ НА НАЧАЛОТО · къщичката на облака (реф. 7) · 22.09.2026
   Под „Мира е до теб“ началото свършваше рязко. Сега завършва със сцената от референция 7 —
   къщичка на облак, балон, конче, луна-люлка и зайче (img/art/doma.webp, изрязана от самата
   референция, 0 кредита) — която плава бавно, и „Малки стъпки. Голям свят. ♡“.
   Само украса: aria-hidden, нищо не се натиска, нищо не се записва.
   ПЪТ НАЗАД: махни <link>/<script> на pl-krai от index.html.
   ═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.BL_PL_KRAI) return;
  function сложи() {
    const н = document.getElementById('plHome');
    if (!н || н.querySelector(':scope > .pl-krai')) return !!н;
    const ф = document.createElement('figure');
    ф.className = 'pl-krai'; ф.setAttribute('aria-hidden', 'true');
    ф.innerHTML = '<img src="img/art/doma.webp" alt="" loading="lazy" decoding="async" width="720" height="555">' +
      '<figcaption>Малки стъпки. <b>Голям свят.</b> <span>♡</span></figcaption>';
    н.appendChild(ф);
    return true;
  }
  let опити = 0;
  (function чакай() { if (!сложи() && ++опити < 60) setTimeout(чакай, 250); })();
  window.BL_PL_KRAI = { сложи };
})();
