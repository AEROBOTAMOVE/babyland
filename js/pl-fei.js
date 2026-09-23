/* ═══════════════════════════════════════════════════════════════════════════════
   🧚 ФЕИТЕ ЛЕТЯТ · секция „Помощничките“ · 23.09.2026
   Собственикът: „генерирай феи да си летят и да се вижда кво правят и как се казват“.
   Деветте феи вече са едри отделни рисунки (img/art/fei/*.webp, генерирани по неговата
   референция). Тук всяка получава своята рисунка, името ѝ, какво прави, и СТАЯТА,
   в която живее — а летенето го прави css/pl-fei.css.
   Клиентът остава същият: бутонът си отваря стаята както преди (data-room).
   ПЪТ НАЗАД: махни <link>/<script> на pl-fei от index.html.
   ═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.BL_PL_FEI) return;

  // редът е СЪЩИЯТ като ПОМОЩНИЧКИ в js/premium-home.js (иначе лицата се разместват)
  var ФЕИ = [
    { ф: 'mila',   име: 'Мила',   стая: 'Бременност',      прави: 'брои седмиците и ритниците' },
    { ф: 'mira',   име: 'Мира',   стая: 'Моето бебе',      прави: 'пази съня и храненията' },
    { ф: 'malina', име: 'Малина', стая: 'Захранване',      прави: 'въвежда новите вкусове' },
    { ф: 'vita',   име: 'Вита',   стая: 'Здраве и SOS',    прави: 'мери температурата, знае 112' },
    { ф: 'luna',   име: 'Луна',   стая: 'Дневник на мама', прави: 'пази записките ти' },
    { ф: 'iskra',  име: 'Искра',  стая: 'Развитие и игри', прави: 'измисля играта за деня' },
    { ф: 'dara',   име: 'Дара',   стая: 'Инструменти',     прави: 'смята, мери, напомня' },
    { ф: 'niya',   име: 'Ния',    стая: 'Жената в мен',    прави: 'сеща се и за теб' },
    { ф: 'ema',    име: 'Ема',    стая: 'Лабораторията',   прави: 'проверява какво работи' }
  ];

  function по(стая) { for (var i = 0; i < ФЕИ.length; i++) if (ФЕИ[i].стая === стая) return ФЕИ[i]; return null; }

  function облечи() {
    var бутони = document.querySelectorAll('.pl-pers .pl-per');
    if (!бутони.length) return false;
    var пипнати = 0;
    for (var i = 0; i < бутони.length; i++) {
      var б = бутони[i];
      var д = по(б.getAttribute('data-room')) || ФЕИ[i];
      if (!д || б.dataset.plFei === д.ф) continue;
      б.dataset.plFei = д.ф;
      // 🪤 МЕРЕНО (fei_debug): var() се ползва В css файла и url-ът се мери спрямо css/ →
      //   http://…/css/img/art/fei/mila.webp = 404. Затова рисунката отива ПРЯКО на елемента.
      var и = б.querySelector('i');
      if (и) {
        и.style.backgroundImage = 'url(img/art/fei/' + д.ф + '.webp)';
        и.style.backgroundPosition = 'center';
        и.style.backgroundSize = 'contain';
        и.style.backgroundRepeat = 'no-repeat';
      }
      б.style.setProperty('--fei-i', i);
      // какво прави — веднъж, под ролята (не пипаме името и ролята: старият текст остава)
      if (!б.querySelector('.pl-fei-do')) {
        var е = document.createElement('em');
        е.className = 'pl-fei-do';
        е.textContent = д.прави;
        б.appendChild(е);
      }
      пипнати++;
    }
    return пипнати > 0 || бутони.length > 0;
  }


  // ── ХОРОТО („Запознай се с помощничките“, js/home.js): балоните стават феи ──
  //   Старата секция си остава — върти се, спира при докосване, води до стаята.
  //   Сменяме само лицето: вместо нарисуван балон стои истинската фея.
  function поИме(име) {
    име = (име || "").trim();
    for (var i = 0; i < ФЕИ.length; i++) if (ФЕИ[i].име === име) return ФЕИ[i];
    return null;
  }
  function хорото() {
    var бутони = document.querySelectorAll(".horo-b");
    for (var i = 0; i < бутони.length; i++) {
      var б = бутони[i];
      var име = (б.querySelector(".horo-name") || {}).textContent;
      var д = поИме(име);
      if (!д || б.dataset.plFei) continue;
      б.dataset.plFei = д.ф;
      var топка = б.querySelector(".horo-ball");
      if (!топка) continue;
      топка.style.backgroundImage = "url(img/art/fei/" + д.ф + ".webp)";
      топка.style.backgroundPosition = "center";
      топка.style.backgroundSize = "contain";
      топка.style.backgroundRepeat = "no-repeat";
      б.style.setProperty("--fei-i", i);
    }
  }
  function върви() {
    облечи();
    хорото();
    var чака = false;
    new MutationObserver(function () {
      if (чака) return; чака = true;
      setTimeout(function () { чака = false; облечи(); хорото(); }, 140);
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', върви); else върви();
  window.BL_PL_FEI = { ФЕИ: ФЕИ, облечи: облечи, хорото: хорото };
})();
