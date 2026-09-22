/* ═══════════════════════════════════════════════════════════════════════════════
   🔢 ВИДИМ ЩЕМПЕЛ НА ВЕРСИЯТА (долу в профила) · 22.09.2026
   ЗАЩО: собственикът гледаше стара страница от кеша на браузъра и не личеше коя версия е на екрана.
   Сега пише черно на бяло: кешът на service worker-а (babyland-vNNN) и версията на интерфейса
   (css/premium.css?v=NN от самата страница). Така „виждам старото“ става проверимо твърдение.
   Нищо не се записва; само чете. ПЪТ НАЗАД: махни <link>/<script> на pl-versiya от index.html.
   ═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.BL_PL_VERSIYA) return;
  const интерфейс = () => {
    const л = document.querySelector('link[href*="css/premium.css"]');
    const м = л && (л.getAttribute('href') || '').match(/v=(\d+)/);
    return м ? 'интерфейс v' + м[1] : 'интерфейс ?';
  };
  let кеш = 'кеш ?';
  function прочетиКеша() {
    if (!('caches' in window)) return Promise.resolve();
    return caches.keys().then(к => { const б = к.filter(x => /^babyland-v/.test(x)).sort(); if (б.length) кеш = б[б.length - 1]; }).catch(() => {});
  }
  const пиши = (е, т) => { if (е && е.textContent !== т) е.textContent = т; };
  function сложи() {
    const п = document.querySelector('.prof-overlay');
    if (!п) return;
    let щ = п.querySelector(':scope > .pl-ver');
    if (!щ) { щ = document.createElement('p'); щ.className = 'pl-ver'; п.appendChild(щ); }
    пиши(щ, 'Baby Land · ' + кеш + ' · ' + интерфейс());
  }
  let чака = false;
  function отложено() { if (чака) return; чака = true; setTimeout(() => { чака = false; сложи(); }, 120); }
  прочетиКеша().then(() => { сложи(); new MutationObserver(отложено).observe(document.body, { childList: true }); });
  window.BL_PL_VERSIYA = { сложи, кеш: () => кеш };
})();
