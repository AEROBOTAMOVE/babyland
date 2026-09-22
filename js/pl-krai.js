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
  // ── редът към скритото: въпросите и „добави ме на телефона“ (premium.css: html.pl-landing) ──
  function повече(н) {
    if (н.querySelector(':scope > .pl-more')) return;
    const р = document.createElement('div');
    р.className = 'pl-more';
    р.innerHTML = '<button type="button" data-plm="faq">Питат ни често</button>' +
      '<button type="button" data-plm="install">Добави ме на телефона</button>';
    р.addEventListener('click', e => {
      const б = e.target.closest('[data-plm]'); if (!б) return;
      document.documentElement.classList.add('pl-landing');
      const ц = document.querySelector(б.dataset.plm === 'faq' ? '.faq' : '.install');
      if (ц) setTimeout(() => ц.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    });
    н.appendChild(р);
  }
  function сложи() {
    // 🪤 22.09: краят стоеше в #plHome, но СЛЕД него идва старата секция „Днес“ (#todaySection) и
    //   къщичката оставаше по средата на страницата. Сега е последното нещо в <main>.
    const н = document.querySelector('main');
    if (!н || !document.getElementById('plHome')) return false;
    повече(н);
    if (н.querySelector(':scope > .pl-krai')) { н.appendChild(н.querySelector(':scope > .pl-more')); н.appendChild(н.querySelector(':scope > .pl-krai')); return true; }
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
