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
  // 25.11 (вълна 3, решение на собственика): печатът „Baby Land · babyland-vNNN · интерфейс vNN“ е махнат. На мястото му —
  //   „🔄 Обнови приложението“: reg.update(); има ли нов service worker, той сам прави skipWaiting (sw.js:543) и clients.claim
  //   (sw.js:552) → controllerchange → презареждане; няма ли → „Имаш най-новото ✓“. Версията остава в title (за проверка).
  //   ПЪТ НАЗАД: върни <p class="pl-ver"> с текста 'Baby Land · ' + кеш + ' · ' + интерфейс().
  function обнови(бутон, ред) {
    const кажи = т => пиши(ред, т);
    if (!('serviceWorker' in navigator)) { кажи('Имаш най-новото ✓'); return; }
    бутон.disabled = true; кажи('Проверявам…');
    let готово = false;
    const край = т => { if (готово) return; готово = true; бутон.disabled = false; кажи(т); };
    const презареди = () => { if (готово) return; готово = true; кажи('Зареждам новото…'); setTimeout(() => location.reload(), 300); };
    navigator.serviceWorker.getRegistration().then(reg => {
      if (!reg) { край('Имаш най-новото ✓'); return; }
      navigator.serviceWorker.addEventListener('controllerchange', презареди, { once: true });
      const чакай = w => { if (!w) return false; кажи('Има нова версия — свалям я…'); w.addEventListener('statechange', () => { if (w.state === 'activated') презареди(); if (w.state === 'redundant') край('Не стана — опитай пак след малко.'); }); return true; };
      if (чакай(reg.waiting) || чакай(reg.installing)) return;
      reg.addEventListener('updatefound', () => чакай(reg.installing), { once: true });
      const п = reg.update ? reg.update() : Promise.resolve();
      Promise.resolve(п).then(() => { setTimeout(() => { if (!reg.installing && !reg.waiting) край('Имаш най-новото ✓'); }, 1200); })
        .catch(() => край(navigator.onLine === false ? 'Няма интернет — опитай пак, като се свържеш.' : 'Не стана — опитай пак след малко.'));
    }).catch(() => край('Не стана — опитай пак след малко.'));
  }
  function сложи() {
    const п = document.querySelector('.prof-overlay');
    if (!п) return;
    let щ = п.querySelector(':scope > .pl-ver');
    if (!щ) {
      щ = document.createElement('div'); щ.className = 'pl-ver';
      щ.innerHTML = '<button type="button" class="jr-chip pl-ver-b">🔄 Обнови приложението</button><span class="pl-ver-s" role="status" aria-live="polite"></span>';
      const б = щ.querySelector('.pl-ver-b'), с = щ.querySelector('.pl-ver-s');
      б.addEventListener('click', () => обнови(б, с));
      п.appendChild(щ);
    }
    щ.title = кеш + ' · ' + интерфейс();
  }
  let чака = false;
  function отложено() { if (чака) return; чака = true; setTimeout(() => { чака = false; сложи(); }, 120); }
  прочетиКеша().then(() => { сложи(); new MutationObserver(отложено).observe(document.body, { childList: true }); });
  window.BL_PL_VERSIYA = { сложи, кеш: () => кеш };
})();
