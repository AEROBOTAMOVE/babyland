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

  function частици(къде) {
    const с = document.createElement('div');
    с.className = 'pl-zh-pp'; с.setAttribute('aria-hidden', 'true');
    с.innerHTML = ЧАСТИЦИ.map(([л, р, т, з, в]) => '<i class="pl-zh-p pl-zh-' + в + '" style="left:' + л + '%;--s:' + р + 'px;--t:' + т + 's;--d:-' + з + 's"></i>').join('');
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
    if (!тихо) частици(с);
  }
  let чакаН = false;
  function превъртиНачало() {
    if (тихо || чакаН) return; чакаН = true;
    requestAnimationFrame(() => { чакаН = false; const с = document.getElementById('plScene'); if (с) с.style.setProperty('--zh-y', (-Math.min(90, scrollY * 0.07)).toFixed(1) + 'px'); });
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
