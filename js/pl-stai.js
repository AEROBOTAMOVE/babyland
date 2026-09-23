/* ═══════════════════════════════════════════════════════════════════════════════
   🏠 ДЕВЕТТЕ СТАИ · истински сцени · 23.09.2026
   Собственикът: „и деветте вълшебни стаи още не са пипвани“. Досега картите носеха
   само рисувани SVG сцени. Сега всяка карта получава СВОЯ плюшена сцена (генерирана
   по неговата референция, img/art/stai/*.webp), а старата SVG сцена остава жива
   отзад като мек, размит фон — нищо не е изрязано.
   Същата снимка се ползва и в избирача на стаи (.np-b) — едно лице на стая навсякъде.
   ПЪТ НАЗАД: махни <link>/<script> на pl-stai от index.html. Нищо друго не зависи.
   ═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.BL_PL_STAI) return;
  // ключ на стаята (както го чака MamaHelper.open) → файл на сцената
  const СЦЕНИ = {
    'Бременност': 'bremennost',
    'Моето бебе': 'bebe',
    'Захранване': 'zahranvane',
    'Здраве и SOS': 'zdrave',
    'Дневник на мама': 'dnevnik',
    'Развитие и игри': 'igri',
    'Инструменти': 'instrumenti',
    'Жената в мен': 'zhenata',
    'Лабораторията': 'laboratoriya'
  };
  const ред = Object.keys(СЦЕНИ);

  function сложиКарта(к) {
    const име = к.getAttribute('data-room');
    const ф = СЦЕНИ[име];
    if (!ф || к.dataset.plSt) return;
    к.dataset.plSt = ф;
    const обвивка = к.querySelector('.scene-wrap');
    if (!обвивка) return;
    const с = document.createElement('span');
    с.className = 'pl-st-img';
    с.setAttribute('aria-hidden', 'true');
    с.style.backgroundImage = 'url(img/art/stai/' + ф + '.webp)';
    обвивка.insertBefore(с, обвивка.firstChild);
    // феята на стаята застава в ъгъла на сцената — едно лице на стая навсякъде
    const фея = { "Бременност": "mila", "Моето бебе": "mira", "Захранване": "malina", "Здраве и SOS": "vita",
      "Дневник на мама": "luna", "Развитие и игри": "iskra", "Инструменти": "dara", "Жената в мен": "niya",
      "Лабораторията": "ema" }[име];
    if (фея && !обвивка.querySelector(".pl-st-fey")) {
      const ф = document.createElement("span");
      ф.className = "pl-st-fey";
      ф.setAttribute("aria-hidden", "true");
      ф.style.backgroundImage = "url(img/art/fei/" + фея + ".webp)";
      обвивка.appendChild(ф);
    }
    // лекото полюляване тръгва разместено, за да не дишат деветте в такт
    к.style.setProperty('--st-i', ред.indexOf(име));
  }

  function сложиИзбирач() {
    document.querySelectorAll('.np-b').forEach(б => {
      // 🪤 МЕРЕНО (izbirach): избирачът (js/nav2.js:73) пише data-r, не data-room —
      //   затова деветте бутона оставаха без сцена (9 намерени, 0 облечени).
      const име = б.getAttribute('data-r') || б.getAttribute('data-room') || (б.querySelector('.np-t') || {}).textContent;
      const ф = СЦЕНИ[(име || '').trim()];
      if (!ф || б.dataset.plSt) return;
      б.dataset.plSt = ф;
      // 🪤 23.09: стойността влиза в css променлива, която се ЧЕТЕ в css/pl-stai.css →
      //   относителният адрес щеше да се мери спрямо css/ (мерено при феите: 404).
      //   Затова даваме ПЪЛЕН адрес, изчислен от страницата — работи навсякъде.
      var адрес = new URL('img/art/stai/' + ф + '.webp', document.baseURI).href;
      б.style.setProperty('--st-img', 'url("' + адрес + '")');
    });
  }

  function огледай() {
    document.querySelectorAll('.room-card[data-room]').forEach(сложиКарта);
    сложиИзбирач();
  }

  function върви() {
    огледай();
    // избирачът се ражда при клик → тих наблюдател, но с отлагане (всяка наша промяна е мутация)
    let чака = false;
    new MutationObserver(() => {
      if (чака) return; чака = true;
      setTimeout(() => { чака = false; огледай(); }, 120);
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', върви); else върви();
  window.BL_PL_STAI = { огледай, СЦЕНИ };
})();
