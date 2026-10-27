/* ═══════════════════════════════════════════════════════════════════════════════
   🌬️ ЖИВАТА СЦЕНА · стаите и началото дишат (22.09.2026)
   Собственикът: „искам всичко живо, движещо се, да следи бекграунда и целия замисъл“.
   КАКВО:
   · СТАЯТА: сцената излиза от фона на панела в свой слой (.pl-zh) → при влизане се „настанява“
     (леко приближение, еднократно), при превъртане се движи по-бавно от картите (дълбочина),
     над нея плуват няколко сърчица/светлинки; нощем — звезди, които блещукат.
   · НАЧАЛОТО: същите светлинки над сцената #plScene и същата дълбочина при превъртане.
   · ГЛАВНИТЕ БУТОНИ (гел): проблясват ВЕДНЪЖ, когато се появят на екрана.
   ЦЕНАТА (мерено преди писане — dom_bezkraini.js): приложението вече има два пазителя —
   izvan_ekrana.js спира безкрайните анимации извън екрана, plavno.js спира всичко докато пръстът
   се движи. Светлинките са 7 на екран, само transform/opacity (композиторът ги движи без
   прерисуване); превъртането пише една CSS променлива в rAF. При „по-малко движение“ — нищо не мърда.
   ПЪТ НАЗАД: махни <link>/<script> на pl-zhivo от index.html — сцената се връща във фона на панела.
   ═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.BL_PL_ZHIVO) return;
  const тихо = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  const СЦЕНИ = { 'ro-green': 'zdrave', 'ro-sky': 'bebe', 'ro-peach': 'bremennost', 'ro-carrot': 'hranene',
    'ro-sun': 'igri', 'ro-mint': 'instrumenti', 'ro-rose': 'zamama', 'ro-lav': 'dnevnik', 'ro-cork': 'lab' };
  // светлинките: [ляво %, размер px, продължителност s, закъснение s, вид]
  const ЧАСТИЦИ = [[8, 14, 17, 0, 'h'], [22, 8, 21, 6, 'd'], [38, 11, 19, 11, 's'], [55, 7, 23, 3, 'd'], [68, 13, 18, 9, 'h'], [82, 9, 22, 14, 's'], [93, 7, 20, 5, 'd']];

  function частици(къде, само) {
    const с = document.createElement('div');
    с.className = 'pl-zh-pp'; с.setAttribute('aria-hidden', 'true');
    с.innerHTML = (само ? ЧАСТИЦИ.filter((x, i) => само.includes(i)) : ЧАСТИЦИ).map(([л, р, т, з, в]) => '<i class="pl-zh-p pl-zh-' + в + '" style="left:' + л + '%;--s:' + р + 'px;--t:' + т + 's;--d:-' + з + 's"></i>').join('');
    къде.appendChild(с);
  }

  // ── СТАЯТА ──
  let слой = null, фон = null, персона = '';
  function стая() {
    const п = document.querySelector('#roomOverlay .ro-panel'); if (!п) return;
    const к = Object.keys(СЦЕНИ).find(x => п.classList.contains(x)) || '';
    if (!слой || !п.contains(слой)) {
      слой = document.createElement('div'); слой.className = 'pl-zh'; слой.setAttribute('aria-hidden', 'true');
      фон = document.createElement('div'); фон.className = 'pl-zh-bg';
      слой.appendChild(фон); if (!тихо) частици(слой);
      п.insertBefore(слой, п.firstChild);
    }
    if (!п.classList.contains('pl-zh-on')) п.classList.add('pl-zh-on');
    if (к !== персона) {
      персона = к;
      фон.style.backgroundImage = к ? 'url(img/scene/' + СЦЕНИ[к] + '.webp)' : 'none';
      слой.style.setProperty('--zh-y', '0px');
      if (!тихо) { слой.classList.remove('pl-zh-in'); void слой.offsetWidth; слой.classList.add('pl-zh-in'); }
    }
  }
  // 🎈 плаващото балонче на стаята (#roFab) ляга върху десния край на редовете и изяжда клика там —
  //   четирима независими проверители го хванаха (Растеж, Дневник, Инструменти, Захранване). Докато
  //   мама превърта, то се отдръпва; 700 ms след спирането се връща. Класът е на <html> (css/pl-zhivo.css).
  let тихТаймер = 0;
  function балонътНастрана() {
    const к = document.documentElement.classList;
    if (!к.contains('pl-fab-away')) к.add('pl-fab-away');
    clearTimeout(тихТаймер);
    тихТаймер = setTimeout(() => document.documentElement.classList.remove('pl-fab-away'), 700);
  }
  // дълбочина: сцената изостава 12% от превъртането, до 110px
  let чакаП = false, последен = null;
  function превъртане(e) {
    if (!слой) { const ц0 = e.target; if (ц0 && ц0.closest && ц0.closest('#roomOverlay')) балонътНастрана(); }
    if (тихо || !слой) return;
    const ц = e.target; if (!ц || ц.nodeType !== 1 || !ц.closest || !ц.closest('#roomOverlay')) return;
    балонътНастрана();
    последен = ц;
    if (чакаП) return; чакаП = true;
    requestAnimationFrame(() => { чакаП = false; const y = Math.min(110, (последен.scrollTop || 0) * 0.12); слой.style.setProperty('--zh-y', (-y).toFixed(1) + 'px'); });
  }

  // ── НАЧАЛОТО ──
  function начало() {
    const с = document.getElementById('plScene'); if (!с || с.querySelector('.pl-zh-pp')) return;
    if (!тихо) частици(с, [0, 2, 4, 5, 6]);   // 20.10: на началото 5 светлинки (беше 7) — по-тихо и по-леко
  }
  let чакаН = false;
  function превъртиНачало() {
    if (тихо || чакаН) return; чакаН = true;
    // 20.10: сцената вече НЕ е заковала зад цялата страница (pl-zhivo.css) — тръгва нагоре с героя, само
    //   по-бавно (дълбочина): изостава 22% от превъртането, до 280 px; щом героят излезе, не се пише нищо.
    //   Само transform. ПЪТ НАЗАД: върни (-Math.min(90, scrollY * 0.07)).
    requestAnimationFrame(() => { чакаН = false; const с = document.getElementById('plScene'); if (!с) return; const y = Math.min(280, Math.max(0, scrollY) * 0.22).toFixed(1) + 'px'; if (с.__zhY !== y) { с.__zhY = y; с.style.setProperty('--zh-y', y); } });
  }

  // ── ПРОБЛЯСЪКЪТ на гел бутоните — веднъж, когато влязат в кадър ──
  const ГЕЛ = '.pl-cta, .jr-btn, .pl-gel, .tour-next, #onbSave';
  const видени = new WeakSet();
  const набл = (!тихо && 'IntersectionObserver' in window) ? new IntersectionObserver(записи => {
    записи.forEach(з => {
      if (!з.isIntersecting) return; const б = з.target; набл.unobserve(б);
      if (б.querySelector(':scope > .pl-glint')) return;
      const с = document.createElement('span'); с.className = 'pl-glint'; с.setAttribute('aria-hidden', 'true');
      б.appendChild(с); с.addEventListener('animationend', () => с.remove(), { once: true });
    });
  }, { threshold: 0.6 }) : null;
  function бутони(корен) { if (!набл) return; (корен || document).querySelectorAll(ГЕЛ).forEach(б => { if (!видени.has(б)) { видени.add(б); набл.observe(б); } }); }

  let чака = false;
  function отложено() { if (чака) return; чака = true; setTimeout(() => { чака = false; стая(); начало(); бутони(document); }, 60); }
  function върви() {
    начало(); стая(); бутони(document);
    const ов = document.getElementById('roomOverlay');
    if (ов) new MutationObserver(отложено).observe(ов, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] });
    new MutationObserver(отложено).observe(document.body, { childList: true });
    document.addEventListener('scroll', превъртане, { capture: true, passive: true });
    window.addEventListener('scroll', превъртиНачало, { passive: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', върви); else върви();
  window.BL_PL_ZHIVO = { стая, начало };
})();

// ── 24.10 · влят от js/pl-otklik.js (сесия-помощник): таванът е 180 заявки (dev/byudzhet.js), а бяха 179 ──
/* ═══════════════════════════════════════════════════════════════════════════════
   👆 ОТКЛИКЪТ · js (24.10.2026) — видът и защо е тук: блокът „ОТКЛИКЪТ“ в края на css/pl-zhivo.css
   Три неща, които CSS сам не може:
     1) НАТИСК: допирът свива бутона/чипа/плочката до .96 (110 ms), пускането го връща с лек
        отскок (1.02 → 1, ~280 ms). Анимира се САМО отделното свойство `scale` през WAAPI —
        така се събира с потъването translateY от pl-ui.css :active и не пипа нито transition-а,
        нито CSS анимациите на елемента (иначе чип с вход chipIn би го изиграл наново).
        Голямото се свива по-малко (плочка .975, карта .99) — иначе „скача“.
     2) ВХОД ПО РЕД: премиум блокът под банера получава .pl-otk-vliza САМО при първата си поява
        в стаята и го губи след 1 с по таймер (не по animationend — скрит таб не праща кадри).
        Прерисуване на блока после не мига.
     3) ИСКРИ: при успешен запис приложението вика BL_FX.cheer (99 места). Ако банерът наистина
        се е показал (в тежък ден fx.js мълчи — и ние) и до 1,5 с преди това е натиснат бутон в
        стаята — от него хвръкват 8 частици (сърца, звезди, точици), ≤ 600 ms. Само в стаите:
        на началото — само натискът, без нови неща.
   „По-малко движение“ → нищо от трите. Нищо не записва, нищо не чете от паметта.
   ПЪТ НАЗАД: махни блока „ОТКЛИКЪТ“ (оттук до края) тук и в края на css/pl-zhivo.css.
   ═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.BL_PL_OTKLIK) return;
  const тихо = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return true; } };
  const МОЖЕ = !!(Element.prototype.animate && window.CSS && CSS.supports && CSS.supports('scale', '1'));

  // ═══ 1. НАТИСКЪТ ═══
  const ЦЕЛ = 'button, [role="button"], [role="tab"], a.jr-btn, .jr-chip, .ro-chip, .sec-chip';
  // стартовият екран, „Добре дошла у дома“ (обиколката) и първото въвеждане имат свое движение — не ги пипаме
  const НЕ = '#blSplash, .tour-ov, #onbOverlay';
  let натиснат = null, свиване = null, таймер = 0;
  const последен = { е: null, т: 0 };
  function колко(е) {
    const р = е.getBoundingClientRect();
    if (р.width > 340 || р.height > 160) return 0.99;
    if (р.width > 220 || р.height > 90) return 0.975;
    return 0.96;
  }
  function долу(ев) {
    if (ев.button > 0 || !ев.target || !ев.target.closest) return;
    const е = ев.target.closest(ЦЕЛ);
    if (!е || е.disabled || е.getAttribute('aria-disabled') === 'true' || е.closest(НЕ)) return;
    последен.е = е; последен.т = Date.now();
    if (!МОЖЕ || тихо()) return;
    горе();
    натиснат = е;
    const к = колко(е); е._plOtkK = к;
    try { свиване = е.animate([{ scale: 1 }, { scale: к }], { duration: 110, easing: 'cubic-bezier(.3, .7, .4, 1)', fill: 'forwards' }); } catch (e) { свиване = null; }
    clearTimeout(таймер); таймер = setTimeout(горе, 1500);      // задържан пръст — не стоим свити вечно
  }
  function горе() {
    const е = натиснат; if (!е) return;
    натиснат = null; clearTimeout(таймер);
    let от = е._plOtkK || 0.96;
    try { const с = parseFloat(getComputedStyle(е).scale); if (с > 0 && с <= 1) от = с; } catch (e) {}
    if (свиване) { try { свиване.cancel(); } catch (e) {} свиване = null; }
    if (!е.isConnected) return;
    const връх = 1 + (1 - от) * 0.5;                            // .96 → 1.02, .99 → 1.005
    try { е.animate([{ scale: от }, { scale: връх, offset: 0.55 }, { scale: 1 }], { duration: 280, easing: 'ease-out' }); } catch (e) {}
  }
  document.addEventListener('pointerdown', долу, { passive: true, capture: true });
  ['pointerup', 'pointercancel', 'dragstart'].forEach(и => document.addEventListener(и, горе, { passive: true, capture: true }));
  window.addEventListener('blur', горе);
  // клавиатурата: Enter/интервал по бутон — същото усещане
  document.addEventListener('keydown', ев => { if ((ев.key === 'Enter' || ев.key === ' ') && !ев.repeat && ев.target && ев.target.matches && ев.target.matches(ЦЕЛ)) долу({ target: ев.target, button: 0 }); }, true);
  document.addEventListener('keyup', ев => { if (ев.key === 'Enter' || ев.key === ' ') горе(); }, true);

  // ═══ 2. ВХОД ПО РЕД — първата поява на премиум блока ═══
  const БЛОКОВЕ = ['pl-br', 'pl-ig', 'pl-zm', 'pl-dn', 'pl-hr', 'pl-in', 'pl-lb', 'pl-zd'];
  const БЛОК = БЛОКОВЕ.map(к => '#roRoom > .' + к).join(', ');
  function новБлок(е) {
    if (!е || е._plOtk) return;
    е._plOtk = 1;                                                // всеки елемент — веднъж
    if (тихо()) return;
    е.classList.add('pl-otk-vliza');
    setTimeout(() => е.classList.remove('pl-otk-vliza'), 1000);
  }
  // 🪤 24.10 (МЕРЕНО в пробата): блокът не идва винаги като пряко дете в #roRoom — стаята се сглобява и
  //   после се закача цяла. Затова всяко добавено поддърво се оглежда за блоковете вътре в него.
  function пази() {
    const ов = document.getElementById('roomOverlay');
    if (!ов) return false;
    new MutationObserver(сп => {
      for (const з of сп) for (const н of з.addedNodes) {
        if (н.nodeType !== 1) continue;
        if (н.matches(БЛОК)) новБлок(н);
        else if (н.firstElementChild) н.querySelectorAll(БЛОК).forEach(новБлок);
      }
    }).observe(ов, { childList: true, subtree: true });
    return true;
  }

  // ═══ 3. ИСКРИТЕ ═══
  // [dx, dy, вид] — сърце (s), звезди (z), точици; ветрило нагоре, без да покрива бутона
  const ПОСОКИ = [[-36, -40, 's'], [0, -58, 'z'], [36, -42, ''], [-22, -24, ''], [24, -26, 'z'], [-8, -46, ''], [14, -50, 's'], [44, -18, '']];
  function искри(е) {
    const ов = document.getElementById('roomOverlay');
    if (!ов || ов.hidden || !ов.contains(е) || !е.isConnected) return;
    const р = е.getBoundingClientRect(); if (!р.width) return;
    const x = р.left + р.width / 2, y = р.top + Math.min(р.height / 2, 18);
    const с = document.createElement('div'); с.className = 'pl-otk-sloy'; с.setAttribute('aria-hidden', 'true');
    ПОСОКИ.forEach(([dx, dy, вид], i) => {
      const ч = document.createElement('i'); ч.className = 'pl-otk-i' + (вид ? ' ' + вид : '');
      ч.style.left = x + 'px'; ч.style.top = y + 'px';
      с.appendChild(ч);
      const завъртане = (i % 2 ? 1 : -1) * (14 + i * 6);
      try {
        // кривата е по отсечки: полетът е бърз и меко спира, избледняването е чак в последната отсечка
        //   (с една обща крива частиците гаснеха още в средата — кадрите 24.10)
        ч.animate([
          { translate: '0 0', scale: 0.5, rotate: '0deg', opacity: 1, easing: 'cubic-bezier(.2, .8, .3, 1)' },
          { translate: (dx * 0.75) + 'px ' + (dy * 0.75) + 'px', scale: 1.05, opacity: 1, offset: 0.55, easing: 'ease-in' },
          { translate: dx + 'px ' + (dy - 8) + 'px', scale: 0.8, rotate: завъртане + 'deg', opacity: 0 }
        ], { duration: 470 + i * 4, delay: i * 12, easing: 'linear', fill: 'both' });   // последната: 582 ms
      } catch (e) {}
    });
    ов.appendChild(с);
    setTimeout(() => с.remove(), 760);                           // таймер, не animationend — скрит таб не засяда
  }
  function обвийCheer() {
    const F = window.BL_FX; if (!F || typeof F.cheer !== 'function' || F.cheer._plOtk) return !!(F && F.cheer && F.cheer._plOtk);
    const стар = F.cheer;
    const нов = function () {
      const преди = document.querySelectorAll('.fx-cheer').length;
      const р = стар.apply(this, arguments);
      try {
        const показан = document.querySelectorAll('.fx-cheer').length > преди;   // тежък ден / „по-малко движение“ → fx.js мълчи
        if (показан && !тихо() && последен.е && Date.now() - последен.т < 1500) искри(последен.е);
      } catch (e) {}
      return р;
    };
    нов._plOtk = 1;
    F.cheer = нов;
    return true;
  }

  function върви() {
    let опит = 0, пазя = false, обвих = false;            // всяко веднъж — иначе по наблюдател на опит
    (function чакай() {
      if (!пазя) пазя = пази();
      if (!обвих) обвих = обвийCheer();
      if ((!пазя || !обвих) && ++опит < 40) setTimeout(чакай, 250);
    })();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', върви); else върви();
  window.BL_PL_OTKLIK = { искри, колко };
})();

/* ═══════════════════════════════════════════════════════════════════════════════
   🌱 ЖИВОТ 2 · js (27.10) — видът и защо е тук: блокът „ЖИВОТ 2“ в края на css/pl-zhivo.css
   Само делегирано слушане, WAAPI върху отделното `scale` и класове с таймер. НИЩО не чете размери
   (getBoundingClientRect / offset* / scroll*) — посоките са по реда в DOM, не по пиксели.
     1) табове: клик по [data-tab] в #roTabs (capture — преди setTab в helper.js) → панелът получава
        data-zh2-pos (r/l) за 600 ms; после махаме и .ro-anim, иначе смяната на името би пуснала
        roFade наново (от opacity 0) — тоест мигане;
     3) отметки: след клика (setTimeout 0 — промяната вече е станала), ако е ОТМЕТНАТО → удар/презасилване
        на кутийката (вътрешния „box“/„chk“; без такъв — по-кротко на целия ред);
     4) пълнежи: наблюдател на #roomOverlay → новият пълнеж носи .pl-zh2-puln 1 s (таймер, не animationend);
     5) числата: обвивка на BL_FX.countUp → 680 ms след старта (fx.js брои 650 ms) лек отскок, само в стаята;
     6) долната лента: наблюдател на class в .bottom-nav → новата активна носи data-zh2-ot (посоката) 500 ms.
   „По-малко движение“ → нищо. ПЪТ НАЗАД: махни блока (оттук до края) тук и в края на css/pl-zhivo.css.
   ═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.BL_PL_ZHIVOT2) return;
  const тихо = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return true; } };
  const МОЖЕ = !!(Element.prototype.animate && window.CSS && CSS.supports && CSS.supports('scale', '1'));

  // ═══ 1. ТАБОВЕТЕ — от посоката на новия ═══
  const СЪДЪРЖАНИЕ = ['roRoom', 'roArticles', 'roChatWrap'];
  document.addEventListener('click', ев => {
    const б = ев.target && ев.target.closest ? ев.target.closest('#roTabs [data-tab]') : null;
    if (!б || тихо()) return;
    const ред = [...б.parentElement.children];
    const стар = ред.findIndex(х => х.classList.contains('on')), нов = ред.indexOf(б);
    if (стар < 0 || нов < 0 || нов === стар) return;
    const п = б.closest('.ro-panel') || document.querySelector('#roomOverlay .ro-panel');
    if (!п) return;
    п.dataset.zh2Pos = нов > стар ? 'r' : 'l';
    clearTimeout(п._zh2T);
    п._zh2T = setTimeout(() => {
      delete п.dataset.zh2Pos;
      СЪДЪРЖАНИЕ.forEach(ид => { const е = document.getElementById(ид); if (е) е.classList.remove('ro-anim'); });
    }, 600);
  }, true);

  // ═══ 3. ОТМЕТКИТЕ — удар и презасилване ═══
  const ОТМЕТКА = 'input[type="checkbox"], [role="checkbox"], [role="switch"]';
  document.addEventListener('click', ев => {
    if (!МОЖЕ || тихо() || !ев.target || !ев.target.closest) return;
    const цел = ев.target.closest(ОТМЕТКА);          // клик по <label> праща свой клик по полето — хваща се там
    if (!цел) return;
    setTimeout(() => {
      if (!цел.isConnected) return;
      const да = цел.matches('input') ? цел.checked : (цел.getAttribute('aria-checked') === 'true');
      if (!да) return;
      const кутия = цел.matches('input') ? цел : цел.querySelector('[class*="box"], [class*="chk"], [class*="check"]');
      try {
        if (кутия) кутия.animate([{ scale: 1 }, { scale: 0.82, offset: 0.3 }, { scale: 1.14, offset: 0.65 }, { scale: 1 }], { duration: 340, easing: 'ease-out' });
        else цел.animate([{ scale: 1 }, { scale: 0.97, offset: 0.3 }, { scale: 1.025, offset: 0.65 }, { scale: 1 }], { duration: 320, easing: 'ease-out' });
      } catch (e) {}
    }, 0);
  });

  // ═══ 4. ПЪЛНЕЖИТЕ — растат от лявото при първата поява ═══
  const ПЪЛНЕЖ = '.nm-fill, .st-fill, .sp-fill, .sc-fill, .rg-fill';
  function пълни(е) {
    if (е._zh2) return; е._zh2 = 1;
    if (тихо()) return;
    е.classList.add('pl-zh2-puln');
    setTimeout(() => е.classList.remove('pl-zh2-puln'), 1000);
  }
  function пази() {
    const ов = document.getElementById('roomOverlay');
    if (!ов) return false;
    new MutationObserver(сп => {
      for (const з of сп) for (const н of з.addedNodes) {
        if (н.nodeType !== 1) continue;
        if (н.matches(ПЪЛНЕЖ)) пълни(н);
        else if (н.firstElementChild) н.querySelectorAll(ПЪЛНЕЖ).forEach(пълни);
      }
    }).observe(ов, { childList: true, subtree: true });
    return true;
  }

  // ═══ 5. ЧИСЛАТА — отскок, щом отброяването спре ═══
  function обвийБроене() {
    const F = window.BL_FX;
    if (!F || typeof F.countUp !== 'function') return false;
    if (F.countUp._zh2) return true;
    const стар = F.countUp;
    const нов = function (обхват) {
      const р = стар.apply(this, arguments);
      try {
        if (МОЖЕ && !тихо()) {
          const ов = document.getElementById('roomOverlay');
          (обхват || document).querySelectorAll('span[data-cnt]').forEach(с => {
            if (!ов || !ов.contains(с) || (с._zh2 && Date.now() - с._zh2 < 1500)) return;
            с._zh2 = Date.now();
            setTimeout(() => {
              if (с.isConnected) { try { с.animate([{ scale: 1 }, { scale: 1.16, offset: 0.45 }, { scale: 0.97, offset: 0.75 }, { scale: 1 }], { duration: 320, easing: 'ease-out' }); } catch (e) {} }
            }, 680);
          });
        }
      } catch (e) {}
      return р;
    };
    нов._zh2 = 1;
    F.countUp = нов;
    return true;
  }

  // ═══ 6. ДОЛНАТА ЛЕНТА — точката идва от страната на старата ═══
  function лента() {
    const л = document.querySelector('.bottom-nav');
    if (!л) return false;
    const активна = () => [...л.querySelectorAll('.bn-item')].findIndex(х => х.classList.contains('bn-active'));
    let пред = активна();
    new MutationObserver(сп => {
      const ред = [...л.querySelectorAll('.bn-item')];
      const сега = ред.findIndex(х => х.classList.contains('bn-active'));
      if (сега >= 0 && пред >= 0 && сега !== пред && !тихо() && сп.some(з => з.target === ред[сега])) {
        const е = ред[сега];
        е.dataset.zh2Ot = сега > пред ? 'l' : 'r';           // отдясно на старата → идва отляво
        clearTimeout(е._zh2T); е._zh2T = setTimeout(() => { delete е.dataset.zh2Ot; }, 500);
      }
      if (сега >= 0) пред = сега;
    }).observe(л, { attributes: true, attributeFilter: ['class'], subtree: true });
    return true;
  }

  function върви() {
    let опит = 0, а = false, б = false, в = false;          // всяко веднъж — иначе по наблюдател на опит
    (function чакай() {
      if (!а) а = пази();
      if (!б) б = обвийБроене();
      if (!в) в = лента();
      if ((!а || !б || !в) && ++опит < 40) setTimeout(чакай, 250);
    })();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', върви); else върви();
  window.BL_PL_ZHIVOT2 = { пълни };
})();
/* край ЖИВОТ 2 */
