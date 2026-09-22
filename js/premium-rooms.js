/* ═══════════════════════════════════════════════════════════════════════════════
   ✨ PREMIUM БАНЕР НА СТАЯТА · по референциите на собственика (22.09.2026)
   Всяка стая започва с голяма плюшена рисунка и серифно заглавие — „Светът е за
   откриване“, „С всяка седмица по-близо“, „Първите лъжички“… Банерът се слага най-отгоре
   в #roRoom (над полето за въпрос) според класа на персонажа върху .ro-panel.
   Не пипа логика: само добавя елемент, когато стаята прерисува съдържанието си.
   ПЪТ НАЗАД: махни <script src="js/premium-rooms.js"> от index.html.
   ═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.BL_PREMIUM_ROOMS) return;

  const БАНЕРИ = {
    'ro-peach':  { рис: 'rb-preg',   гл: 'С всяка седмица по-близо', под: 'Малки стъпки. Голям свят.' },
    'ro-sky':    { рис: 'rb-baby',   гл: 'Малкият ти голям свят',    под: 'Всеки ден ново откритие.' },
    'ro-carrot': { рис: 'rb-feed',   гл: 'Първите лъжички',          под: 'Малки вкусове. Големи усмивки!' },
    'ro-green':  { рис: 'rb-health', гл: 'Спокойствие и грижа',       под: 'Тук сме, когато имаш нужда.' },
    'ro-lav':    { рис: 'rb-diary',  гл: 'Моят дневник',              под: 'Малки моменти. Голямо значение.' },
    'ro-sun':    { рис: 'rb-play',   гл: 'Светът е за откриване',     под: 'Малки стъпки. Големи чудеса.' },
    'ro-mint':   { рис: 'rb-tools',  гл: 'Малки помощници',           под: 'Малките задачи правят големи дни.' },
    'ro-rose':   { рис: 'rb-mom',    гл: 'И ти си важна',             под: 'Грижата за теб е грижа и за него.' },
    'ro-cork':   { рис: 'rb-lab',    гл: 'Да опитаме заедно',         под: 'Малки опити. Големи открития.' },
  };

  function персонаж() {
    const п = document.querySelector('#roomOverlay .ro-panel');
    if (!п) return null;
    for (const к of Object.keys(БАНЕРИ)) if (п.classList.contains(к)) return к;
    return null;
  }

  function сложи() {
    const стая = document.getElementById('roRoom');
    if (!стая) return;
    const к = персонаж();
    const стар = стая.querySelector(':scope > .pl-rhero');
    if (!к) { if (стар) стар.remove(); return; }
    if (стар && стар.getAttribute('data-p') === к && стая.firstElementChild === стар) return;
    if (стар) стар.remove();
    const б = БАНЕРИ[к];
    const е = document.createElement('section');
    е.className = 'pl-rhero';
    е.setAttribute('data-p', к);
    е.setAttribute('aria-hidden', 'true');   // декоративен; заглавието на стаята вече е в главата
    е.innerHTML = '<img src="img/art/' + б.рис + '.webp" alt="" decoding="async" width="768" height="432">' +
      '<div class="pl-rhero-t"><b>' + б.гл + ' <i>♡</i></b><span>' + б.под + '</span></div>';
    стая.insertBefore(е, стая.firstChild);
  }

  // 🪤 22.09: беше requestAnimationFrame — браузърът го спира, когато страницата не се рисува
  //   (скрит таб, зает процесор), и банерът не се появяваше. Обикновен таймер работи винаги.
  let чака = false;
  function отложено() { if (чака) return; чака = true; setTimeout(() => { чака = false; сложи(); }, 40); }

  // 🪤 22.09: първата версия закачаше наблюдателите за #roRoom и .ro-panel при зареждане —
  //   но при първото отваряне на стая приложението сменя #roRoom с нов елемент и наблюдателят
  //   оставаше да гледа изхвърления (банерът не се появяваше; ръчно — се появяваше).
  //   #roomOverlay е статичен и не се сменя никога, затова гледаме него, с поддърво.
  function върви() {
    const ов = document.getElementById('roomOverlay');
    if (!ов) return;
    new MutationObserver(отложено).observe(ов, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] });
    сложи();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', върви); else върви();
  window.BL_PREMIUM_ROOMS = { сложи };
})();
