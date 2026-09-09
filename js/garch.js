// ═══════════════════════════════════════════════════════════════════════
// ⚡ БРОЯЧЪТ НА ГЪРЧА
//
// Собствената ни карта „Гърчът: кое НЕ се прави" започва така:
//     „Първите секунди са за две неща — ЧАСОВНИКА и безопасността наоколо."
// И другата, „Фебрилен гърч": „гледай часовника… Над 5 минути или
// затруднено дишане → 112 веднага."
// Тоест приложението ѝ КАЗВАШЕ да гледа часовника — и не ѝ даваше такъв.
// Жена, чието дете се гърчи на пода, няма да отвори хронометъра на
// телефона и няма да помни кога е започнало.
//
// ⚖️ ТРИ РЕШЕНИЯ, КОИТО НЕ СА ЗА ПИПАНЕ БЕЗ НОВА МЯРКА:
//  1. 112 Е НА ЕКРАНА ОТ НУЛЕВАТА СЕКУНДА. Броячът никога не бива да
//     стои между майката и обаждането. Той не „решава" кога да звъни —
//     само ѝ казва колко време е минало.
//  2. ТЕКСТЪТ Е НА САМОТО ПРИЛОЖЕНИЕ, дума по дума от двете карти.
//     Тук нищо не се измисля: това е екран за броене, не за съвети.
//  3. ВРЕМЕТО СЕ СМЯТА ОТ ЕДИН ПЕЧАТ (Date.now при старта), а не се
//     трупа с интервал. Скрит таб замразява таймерите; печатът — не.
//     Затова числото е вярно и след заключен екран.
//
// ПЪТ НАЗАД: махни <script src="js/garch.js"> от index.html — нищо друго
// не зависи от този файл. Записите живеят в bl_garchove и не пречат.
// ═══════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  const КЛЮЧ = 'bl_garchove';
  const ПРАГ = 5 * 60;          // секунди — прагът от собствената ни карта
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return Array.isArray(v) ? v : d; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { if (window.BL_ZAPIS_PADNA) BL_ZAPIS_PADNA(); return false; } return true; };
  const два = n => String(n).padStart(2, '0');
  const часът = t => { const d = new Date(t); return два(d.getHours()) + ':' + два(d.getMinutes()); };

  function часовник(сек) {
    const м = Math.floor(сек / 60), с = сек % 60;
    return м + ':' + два(с);
  }
  // „2 минути и 40 секунди" — за четене на глас пред лекар
  function думите(сек) {
    const м = Math.floor(сек / 60), с = сек % 60;
    const части = [];
    if (м) части.push(м + (м === 1 ? ' минута' : ' минути'));
    if (с) части.push(с + (с === 1 ? ' секунда' : ' секунди'));
    return части.length ? части.join(' и ') : '0 секунди';
  }

  let слой = null, начало = 0, тик = 0, спрян = 0;

  function рисувайВреме() {
    if (!слой || !начало) return;
    const сек = Math.max(0, Math.round((Date.now() - начало) / 1000));
    const ч = слой.querySelector('.gr-time');
    if (ч) ч.textContent = часовник(сек);
    const тяло = слой.querySelector('.gr-box');
    if (сек >= ПРАГ && тяло && !тяло.classList.contains('gr-alarm')) {
      вдигниАларма(тяло);
    }
    return сек;
  }
  function вдигниАларма(тяло) {
    тяло.classList.add('gr-alarm');
    const р = слой.querySelector('.gr-rule');
    if (р) р.innerHTML = '<b>Мина 5 минути. Обади се на 112 сега.</b>';
    try { if (window.BL_FX && BL_FX.buzz) BL_FX.buzz(60); } catch (e) {}
  }

  function затвори() {
    if (тик) { clearInterval(тик); тик = 0; }
    document.removeEventListener('visibilitychange', приВръщане);
    if (слой) { слой.remove(); слой = null; }
    document.body.style.overflow = '';
  }
  const приВръщане = () => { if (!document.hidden) рисувайВреме(); };

  function отвори() {
    if (слой) return;
    начало = 0; спрян = 0;
    слой = document.createElement('div');
    слой.className = 'gr-ov';
    слой.innerHTML = ''
      + '<div class="gr-box">'
      + '  <div class="gr-head">'
      + '    <span class="gr-title">⚡ Броячът на гърча</span>'
      + '    <button class="gr-x" type="button" aria-label="Затвори">✕</button>'
      + '  </div>'
      + '  <a class="gr-112" href="tel:112">🚨 112</a>'
      + '  <p class="gr-rule">Над <b>5 минути</b> или затруднено дишане → <b>112 веднага</b>.</p>'
      + '  <div class="gr-time" aria-live="off">0:00</div>'
      + '  <button class="gr-go" type="button">Започна сега — брой</button>'
      // ⏪ ПОЧТИ НИКОГА НЕ СЕ ПУСКА В СЕКУНДА НУЛА. Майката първо гледа
      //   детето, после се сеща за телефона. Ако броячът тръгне от 0, тя ще
      //   каже на лекаря по-малко число от истинското — а точно това число
      //   решава дали е бил под или над пет минути. Затова се мести НАЗАД.
      + '  <div class="gr-back" hidden>'
      + '    <span>Започнало е преди да пуснеш?</span>'
      + '    <button type="button" data-back="60">−1 мин</button>'
      + '    <button type="button" data-back="180">−3 мин</button>'
      + '    <button type="button" data-back="300">−5 мин</button>'
      + '  </div>'
      + '  <ul class="gr-do">'
      + '    <li>Настрани на пода. Махни твърдото около главата.</li>'
      + '    <li>Нищо в устата — езикът не се гълта, лъжицата чупи зъбки.</li>'
      + '    <li>Не го дръж насила, не разтривай, не пръскай с вода.</li>'
      + '    <li>Нищо за пиене, докато не е напълно будно.</li>'
      + '  </ul>'
      + '  <p class="gr-after" hidden></p>'
      + '  <p class="gr-note">Текстът е от картите „Гърчът: кое НЕ се прави" и „Фебрилен гърч".</p>'
      + '</div>';
    document.body.appendChild(слой);
    document.body.style.overflow = 'hidden';

    const бут = слой.querySelector('.gr-go');
    const след = слой.querySelector('.gr-after');
    слой.querySelector('.gr-x').addEventListener('click', затвори);
    слой.addEventListener('click', e => { if (e.target === слой) затвори(); });

    бут.addEventListener('click', () => {
      if (!начало) {
        начало = Date.now();
        бут.textContent = 'Спря — спри брояча';
        слой.querySelector('.gr-box').classList.add('gr-running');
        рисувайВреме();
        тик = setInterval(рисувайВреме, 1000);
        document.addEventListener('visibilitychange', приВръщане);
        const назад = слой.querySelector('.gr-back');
        if (назад) назад.hidden = false;
        return;
      }
      // ── спиране ──
      const сек = рисувайВреме();
      if (тик) { clearInterval(тик); тик = 0; }
      спрян = сек;
      бут.hidden = true;
      const редове = load(КЛЮЧ, []);
      const пръв = редове.length === 0;
      редове.push({ t: начало, s: сек });
      save(КЛЮЧ, редове.slice(-20));
      след.hidden = false;
      след.innerHTML = 'Започна в <b>' + часът(начало) + '</b>, продължи <b>' + думите(сек) + '</b>.'
        + '<br><span class="gr-say">Кажи точно това на лекаря.</span>'
        + (пръв ? '<br><b>След първия гърч в живота — винаги преглед.</b>' : '')
        + (сек >= ПРАГ ? '<br><b class="gr-red">Беше над 5 минути — 112.</b>' : '');
      начало = 0;
      const назад2 = слой.querySelector('.gr-back');
      if (назад2) назад2.hidden = true;
    });

    // ⏪ преместване на началото назад — само докато брои
    слой.querySelectorAll('.gr-back button').forEach(б => {
      б.addEventListener('click', () => {
        if (!начало) return;
        начало -= parseInt(б.dataset.back, 10) * 1000;
        рисувайВреме();
      });
    });
  }

  // ── вратата: бутон в SOS панела, щом той се нарисува ─────────────────
  function закачиВСOS() {
    const п = document.querySelector('#sosOverlay .sos-panel');
    if (!п || п.querySelector('.gr-open')) return;
    const б = document.createElement('button');
    б.type = 'button'; б.className = 'gr-open';
    б.textContent = '⚡ Детето се гърчи — брой времето';
    б.addEventListener('click', () => {
      try { if (window.BL_SOS_CENTER && BL_SOS_CENTER.close) BL_SOS_CENTER.close(); } catch (e) {}
      const ов = document.getElementById('sosOverlay');
      if (ов) { ов.hidden = true; }
      отвори();
    });
    const котва = п.querySelector('.sos-tips');
    if (котва) п.insertBefore(б, котва); else п.appendChild(б);
  }
  // ── втората врата: САМАТА спешна сцена „⚡ Гърч" ──────────────────────
  //   Там е майката, чието дете се гърчи В МОМЕНТА — не в SOS панела с
  //   телефоните. Третата стъпка на сцената (js/rooms6.js) буквално пише
  //   „Погледни часовника — колко трае. Това ще питат."
  //   Затова часовникът се слага ТОЧНО ТАМ, между стъпките и 112.
  //   ⚠️ Не се пипа rooms6.js: закачаме се отвън, по заглавието на сцената.
  function закачиВСцената() {
    const ов = document.getElementById('faOverlay');
    if (!ов || ов.hidden) return;
    const загл = ов.querySelector('.fa-title');
    if (!загл || загл.textContent.indexOf('Гърч') < 0) return;
    const крак = ов.querySelector('.fa-foot');
    if (!крак || ов.querySelector('.gr-open')) return;
    const б = document.createElement('button');
    б.type = 'button'; б.className = 'gr-open';
    б.textContent = '⚡ Пусни брояча — колко трае';
    б.addEventListener('click', () => { ов.hidden = true; отвори(); });
    крак.parentNode.insertBefore(б, крак);
  }

  // ⚠️ SOS панелът се РИСУВА НАНОВО с `ov.innerHTML = html` при всяко
  //   отваряне и при всяко „✏️ Настрой" — тоест бутонът ми се трие. Затова
  //   не стига наблюдател върху body: смяната става ВЪТРЕ в наслоя.
  //   Наблюдаваме самия наслой, щом се появи, и се закачаме отново.
  //   Плюс клик-предпазител, ако наблюдателят не е поддържан.
  try {
    let наблюдаван = null;
    const хвани = () => {
      const ов = document.getElementById('sosOverlay');
      if (ов && ов !== наблюдаван) {
        наблюдаван = ов;
        try { new MutationObserver(() => закачиВСOS()).observe(ов, { childList: true, subtree: true }); } catch (e) {}
      }
      закачиВСOS();
      закачиВСцената();
    };
    new MutationObserver(хвани).observe(document.body, { childList: true });
    document.addEventListener('click', () => setTimeout(хвани, 60), true);
    хвани();
  } catch (e) {}

  window.BL_GARCH = { отвори: отвори, затвори: затвори, часовник: часовник, думите: думите, ПРАГ: ПРАГ };
})();
