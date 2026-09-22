/* ═══════════════════════════════════════════════════════════════════════════════
   💬 ЧАТЪТ „МИРА Е ДО ТЕБ“ · табът „Попитай“ на всяка стая (референция 6, 22.09.2026)
   Разговорът е на js/helper.js: addMsg (ред 3771) рисува .msg.bot/.msg.user в #roChat,
   setChips (3831) — чиповете в #roChips, формата #roForm (5560) праща към ask().
   Този файл НЕ пипа нито едно от тях — само ДОБАВЯ около тях:
     · заглавие върху сцената „{име} е до теб“ + ролята (MamaHelper.persona, helper.js:5611);
     · филцова „тетрадка“ зад разговора — общият .pl-felt (css/pl-ui.css, раздел 8);
     · три плочки .pl-soft над полето: „Добави запис“ → „+“ на приложението (.plus-btn в #blPlus,
       polish.js:314), „Намери инструмент“ → #searchTrigger (search.js:360 → BL_SEARCH.open),
       „Моят профил“ → #bnProfile (profile.js:1168);
     · час под всяко балонче — атрибут data-pl-mc-t (CSS го показва с ::after; текстът на
       балончето НЕ се променя, значи код, който чете отговора, не забелязва нищо);
     · „📖 Разкажи ми повече“ (.more-inline, helper.js:4797) става гел — клас .pl-gel;
       👍👎 (.fb-btn, helper.js:4867) — филцови кръгчета .pl-soft.
   Аватарът до балончето е в CSS по класа на .ro-panel — лицето на помощничката от img/art/persony.webp
   (облачето/рисунката на стаята са резервен слой) — старото балонче-svg остава в DOM, само се скрива.

   🪤 „+“ е под стаята: старото меню е в .plus-wrap със z-index 90 (mega.css:684), стаята е 120
      (style.css:1139). Ако е закачен листът на pl-dobavi (#blPlus[data-pl-dv], лист със z 210) —
      той излиза над стаята и стаята остава отворена. Ако е само старото меню — първо се натиска
      истинското ✕ на стаята (#roClose), после „+“. Без профил „+“ няма (polish.js:312) → листът на
      pl-dobavi сам, а без него — табът „Стаята“, където са картите за запис.
   🪤 Всяко писане е мутация → пише се само при РАЗЛИКА; наблюдателят гледа само 'class' и
      'hidden', а часът е data-атрибут (не буди наблюдателя) → няма вечен кръг.
   ПЪТ НАЗАД: махни <script src="js/pl-mira.js"> и <link href="css/pl-mira.css"> (ако са в
      index.html). Добавените елементи изчезват с презареждането; чатът е точно старият.
   ═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.BL_PL_MIRA) return;
  const грешки = [];
  const двуц = n => String(n).padStart(2, '0');
  const часът = () => { const д = new Date(); return двуц(д.getHours()) + ':' + двуц(д.getMinutes()); };
  const $ = id => document.getElementById(id);

  // плюшени иконки от листовете 4×4: [лист, ред, колона]
  //   ico-f [2,0] розов тефтер с молив (като иконката на реф. 6) · ico-c [3,1] лупа · ico-g [1,2] мама
  //   (класът pl-ti — иконката подскача при докосване, js/pl-ui.js ИКОНА; стиловете на .pl-ti са само в #roRoom)
  const ПЛОЧКИ = [
    { к: 'add',  н: 'Добави запис',      ик: ['ico-f', 2, 0] },
    { к: 'find', н: 'Намери инструмент', ик: ['ico-c', 3, 1] },
    { к: 'me',   н: 'Моят профил',       ик: ['ico-g', 1, 2] },
  ];

  // ── действията: всяко натиска СЪЩЕСТВУВАЩОТО и връща по кой път е минало (за пробата) ──
  function добави() {
    const обв = $('blPlus');
    const плюс = document.querySelector('#blPlus .plus-btn');
    if (плюс && плюс.classList.contains('open')) return 'вече отворено';
    if (плюс && обв && обв.hasAttribute('data-pl-dv')) { плюс.click(); return 'плюс → листът (над стаята)'; }
    if (плюс) { const х = $('roClose'); if (х) х.click(); плюс.click(); return 'стаята затворена → плюс'; }
    if (window.BL_PL_DOBAVI && BL_PL_DOBAVI.открий) { BL_PL_DOBAVI.открий(); return 'листът сам (няма плюс)'; }
    if (window.MamaHelper && MamaHelper.showTab) { MamaHelper.showTab('room'); return 'табът „Стаята“'; }
    return 'няма път';
  }
  function намери() {
    const т = $('searchTrigger');
    if (т) { т.click(); return 'searchTrigger'; }
    if (window.BL_SEARCH && BL_SEARCH.open) { BL_SEARCH.open(); return 'BL_SEARCH.open'; }
    return 'няма път';
  }
  function профил() {
    const б = $('bnProfile');
    if (б) { б.click(); return 'bnProfile'; }
    if (window.BL_PROFILE && BL_PROFILE.open) { BL_PROFILE.open(); return 'BL_PROFILE.open'; }
    return 'няма път';
  }
  const ДЕЙСТВИЯ = { add: добави, find: намери, me: профил };

  // ── елементите ──
  function герой() {
    const г = document.createElement('div');
    г.className = 'pl-mc-hero';
    г.innerHTML = '<h2 class="pl-mc-t"><span class="pl-mc-n"></span> <span class="pl-mc-e">е до теб</span></h2>' +
      '<p class="pl-mc-s"></p>' +
      '<p class="pl-mc-tag" aria-hidden="true"><i></i>Нашият разговор</p>';
    return г;
  }
  function тетрадка() {
    const т = document.createElement('div');
    т.className = 'pl-felt pl-mc-book';
    т.setAttribute('aria-hidden', 'true');
    return т;
  }
  function плочки() {
    const п = document.createElement('div');
    п.className = 'pl-mc-tools';
    п.setAttribute('role', 'group');
    п.setAttribute('aria-label', 'Бързи пътища');
    п.innerHTML = ПЛОЧКИ.map(x => '<button type="button" class="pl-soft pl-mc-tile" data-pl-mc="' + x.к + '">' +
      '<i class="pl-mc-ti pl-ti" aria-hidden="true" style="background-image:url(img/art/' + x.ик[0] + '.webp);background-position:' +
      (x.ик[2] * 33.333) + '% ' + (x.ик[1] * 33.333) + '%"></i><span>' + x.н + '</span></button>').join('');
    п.addEventListener('click', e => {
      const б = e.target.closest && e.target.closest('.pl-mc-tile');
      if (!б) return;
      try { последно = (ДЕЙСТВИЯ[б.dataset.plMc] || (() => 'няма'))(); } catch (err) { грешки.push(String(err && err.stack || err).slice(0, 300)); }
    });
    return п;
  }
  let последно = null;

  function сложиТекст(e, т) { if (e && e.textContent !== т) e.textContent = т; }

  function сверка() {
    try {
      const ов = $('roomOverlay'), обв = $('roChatWrap'), чат = $('roChat'), форма = $('roForm');
      if (!ов || ов.hidden || !обв || !чат || !форма) return;
      if (обв.getAttribute('data-pl-mc') !== '1') обв.setAttribute('data-pl-mc', '1');

      // 1) заглавието, тетрадката, плочките — на мястото си (само ако ги няма / са разместени)
      let г = обв.querySelector(':scope > .pl-mc-hero');
      if (!г) г = герой();
      if (обв.firstElementChild !== г) обв.insertBefore(г, обв.firstElementChild);
      let т = обв.querySelector(':scope > .pl-mc-book');
      if (!т) т = тетрадка();
      if (т.nextElementSibling !== чат) обв.insertBefore(т, чат);
      let п = обв.querySelector(':scope > .pl-mc-tools');
      if (!п) п = плочки();
      if (п.nextElementSibling !== форма) обв.insertBefore(п, форма);

      // 2) коя помощничка: стаята е в #roTitle (helper.js:5401), персоната — от самия helper
      const стая = ($('roTitle') || {}).textContent || '';
      const пер = window.MamaHelper && MamaHelper.persona ? MamaHelper.persona(стая) : null;
      if (пер) {
        сложиТекст(г.querySelector('.pl-mc-n'), пер.name);
        const р = String(пер.role || '');
        сложиТекст(г.querySelector('.pl-mc-s'), р ? р.charAt(0).toUpperCase() + р.slice(1) : '');
      }

      // 3) часът под новите балончета (#roTyping е „пише…“ — той не е съобщение)
      const долу = чат.scrollHeight - чат.scrollTop - чат.clientHeight < 60;
      let нови = 0;
      чат.querySelectorAll(':scope > .msg:not([data-pl-mc-t])').forEach(р => {
        if (р.id === 'roTyping') return;
        р.setAttribute('data-pl-mc-t', часът()); нови++;
      });
      // часът добавя ред под балончето → helper-ът вече е превъртял до дъното; връщаме го там
      if (нови && долу) чат.scrollTop = чат.scrollHeight;

      // 4) бутоните в отговорите: гел; палците: филцови кръгчета
      чат.querySelectorAll(':scope > .more-inline:not(.pl-gel)').forEach(б => б.classList.add('pl-gel'));
      чат.querySelectorAll('.fb-btn:not(.pl-soft)').forEach(б => б.classList.add('pl-soft'));
    } catch (e) { грешки.push(String(e && e.stack || e).slice(0, 300)); }
  }

  // 🪤 #roRoom се сменя при отваряне на стая, #roChat се изпразва (helper.js:5402) → гледаме
  //   статичния #roomOverlay с поддърво; таймер, не requestAnimationFrame (той спира без рисуване)
  let чака = false;
  function отложено() { if (чака) return; чака = true; setTimeout(() => { чака = false; сверка(); }, 40); }
  function върви() {
    const ов = $('roomOverlay');
    if (!ов) return;
    new MutationObserver(отложено).observe(ов, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] });
    отложено();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', върви); else върви();
  window.BL_PL_MIRA = { сверка, добави, намери, профил, последно: () => последно, грешки };
})();
