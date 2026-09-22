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

  // 🧸 Кътчетата като плочки (референцията „Малки помощници“). Бутонът остава СЪЩИЯТ
  //   (кликът и класът .on идват от polish.js/anim.js) — сменя се само вътрешността му:
  //   емоджито отива в пастелен кръг, надписът под него. Дългите надписи губят опашката
  //   след „ — “ („Звездите и числата — тук си играем“ → „Звездите и числата“).
  //   Когато за кътчето има плюшена иконка (ИКОНИ), кръгът е рисунката, а емоджито се крие.
  //   🪤 22.09: първо беше --pl-art:url(img/…) — относителен url в CSS променлива се разрешава
  //   спрямо ФАЙЛА НА CSS-а (css/img/art/… → 404) и кръговете бяха празни. Затова е направо в style.
  //   Три листа 4×4 (img/art/ico-a/b/c.webp, по ~20 КБ): [лист, ред, колона].
  const ИКОНИ = {
    // Бременност
    'Днес с коремчето': ['ico-a', 0, 0], 'Пътят до термина': ['ico-a', 0, 1], 'За раждането': ['ico-a', 0, 2], 'Спомени от чакането': ['ico-a', 0, 3],
    // Моето бебе
    'Днес с бебето': ['ico-a', 1, 0], 'Сънят': ['ico-a', 1, 1], 'Как расте': ['ico-a', 1, 2], 'Съкровища': ['ico-a', 1, 3],
    // Захранване
    'Днес на масата': ['ico-a', 2, 0], 'Храните': ['ico-a', 2, 1], 'Внимавай с това': ['ico-a', 2, 2], 'Помним': ['ico-a', 2, 3],
    // Здраве и SOS
    'Спешно — сега': ['ico-a', 3, 0], 'Болно ли е?': ['ico-a', 3, 1], 'За лекаря': ['ico-a', 3, 2], 'Профилактика': ['ico-a', 3, 3], 'Аптечката': ['ico-b', 0, 0],
    // Дневник на мама
    'Днес за теб': ['ico-b', 0, 1], 'Когато е тежко': ['ico-b', 0, 2], 'Пиши и помни': ['ico-b', 0, 3], 'Твоите картини': ['ico-b', 1, 0], 'Съкровищницата': ['ico-b', 1, 1], 'Лично': ['ico-b', 1, 2],
    // Развитие и игри
    'Расте и учи': ['ico-b', 1, 3], 'Играем заедно': ['ico-b', 2, 0], 'Първите пъти': ['ico-b', 2, 1], 'Творби и спомени': ['ico-b', 2, 2], 'Кътче за мама': ['ico-b', 2, 3],
    // Инструменти
    'Какво предстои': ['ico-b', 3, 0], 'Чеклисти': ['ico-b', 3, 1], 'Сметки и размери': ['ico-b', 3, 2], 'Списъци и гардероб': ['ico-b', 3, 3],
    'Наръчник и документи': ['ico-c', 0, 0], 'Джаджи': ['ico-c', 0, 1], 'Настройки и памет': ['ico-c', 0, 2],
    // Жената в мен
    'Звездите и числата — тук си играем': ['ico-c', 0, 3], 'Стилът ми': ['ico-c', 1, 0], 'Ритуалите': ['ico-c', 1, 1], 'Тайните': ['ico-c', 1, 2],
    'Приключенията': ['ico-c', 1, 3], 'Мислите': ['ico-c', 2, 0], 'Моите хора': ['ico-c', 2, 1], 'Короната': ['ico-c', 2, 2],
    // Лабораторията
    'Опитите': ['ico-c', 2, 3], 'Бабините митове': ['ico-c', 3, 0], 'Следите': ['ico-c', 3, 1], 'Тетрадката': ['ico-a', 2, 3],
    // общите (polish.js SECTIONS) + закачените
    'Моите закачени': ['ico-c', 3, 2], 'Всеки ден': ['ico-a', 0, 1], 'Инструменти': ['ico-c', 0, 2], 'Спомени': ['ico-a', 1, 3], 'Още': ['ico-c', 3, 3],
  };
  function esc(т) { return String(т).replace(/[&<>"]/g, з => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[з])); }
  function плочки() {
    const бутони = document.querySelectorAll('#roRoom .sec-nav .sec-chip:not([data-pl])');
    бутони.forEach(б => {
      const цяло = (б.textContent || '').trim();
      const м = цяло.match(/^(\S+)\s+([\s\S]+)$/u);
      if (!м || /[А-Яа-яA-Za-z]/.test(м[1])) return;   // без емоджи отпред — оставяме го както е
      const знак = м[1], име = м[2].trim();
      const кратко = име.length > 20 && име.includes(' — ') ? име.split(' — ')[0] : име;
      const ик = ИКОНИ[име];
      б.setAttribute('data-pl', '1');
      if (!б.getAttribute('aria-label')) б.setAttribute('aria-label', име);
      б.innerHTML = '<span class="pl-ti' + (ик ? ' has-art' : '') + '" aria-hidden="true"' +
        (ик ? ' style="background-image:url(img/art/' + ик[0] + '.webp);background-position:' + (ик[2] * 100 / 3) + '% ' + (ик[1] * 100 / 3) + '%"' : '') +
        '>' + esc(знак) + '</span><span class="pl-tl">' + esc(кратко) + '</span>';
    });
  }

  // 🪤 22.09: беше requestAnimationFrame — браузърът го спира, когато страницата не се рисува
  //   (скрит таб, зает процесор), и банерът не се появяваше. Обикновен таймер работи винаги.
  let чака = false;
  function отложено() { if (чака) return; чака = true; setTimeout(() => { чака = false; сложи(); плочки(); подзаглавие(); сънКръг(); първите(); }, 40); }

  // 🌙 Таймерът за сън (референцията със съня): голям кръг над бутона „Заспа / Събуди се“ в картата
  //   „Сънят днес“ (rooms2.js). Нищо не записва — чете bl_sleep по СЪЩИТЕ правила като картата:
  //   само днешен запис, отворен брояч над 14 ч е забравяне (ТАВАН_СЪН), не сън.
  //   Кръгът се пълни по минутите на текущия час — като стрелка, не като присъда „колко е нормално“.
  const ТАВАН = 14 * 3600000;
  const двуц = n => String(n).padStart(2, '0');
  function сънКръг() {
    const ред = document.querySelector('#roRoom .bb-sleepwin');
    if (!ред) return;
    const карта = ред.closest('.jr-card'); if (!карта) return;
    const бутон = карта.querySelector('.jr-btn');
    let к = карта.querySelector('.pl-sleepring');
    if (!к) {
      к = document.createElement('div');
      к.className = 'pl-sleepring';
      к.setAttribute('aria-hidden', 'true');   // същото казва редът под бутона — за четеца не дублираме
      к.innerHTML = '<svg viewBox="0 0 120 120"><circle class="pl-sr-bg" cx="60" cy="60" r="52"/><circle class="pl-sr-fg" cx="60" cy="60" r="52" pathLength="100"/></svg>' +
        '<div class="pl-sr-in"><i></i><b></b><span></span></div>';
      if (бутон) карта.insertBefore(к, бутон); else карта.appendChild(к);
    }
    let с = null; try { с = JSON.parse(localStorage.getItem('bl_sleep') || 'null'); } catch (e) {}
    const д = new Date(), днес = д.getFullYear() + '-' + двуц(д.getMonth() + 1) + '-' + двуц(д.getDate()), сега = Date.now();
    let състояние = 'празно', мин = 0;
    if (с && с.open && сега - с.open > 0 && сега - с.open <= ТАВАН) { състояние = 'спи'; мин = Math.floor((сега - с.open) / 60000); }
    else if (с && с.d === днес && Array.isArray(с.segs) && с.segs.length) { const е = с.segs[с.segs.length - 1].e; if (е && сега >= е) { състояние = 'будно'; мин = Math.floor((сега - е) / 60000); } }
    const време = мин >= 60 ? Math.floor(мин / 60) + ':' + двуц(мин % 60) : мин + ' мин';
    // 🪤 само при РАЗЛИКА: смяната на текст е мутация, а наблюдателят вика сънКръг() — иначе безкраен кръг
    const сетни = (е, т) => { if (е.textContent !== т) е.textContent = т; };
    if (к.getAttribute('data-s') !== състояние) к.setAttribute('data-s', състояние);
    сетни(к.querySelector('b'), състояние === 'празно' ? '—' : време);
    сетни(к.querySelector('span'), състояние === 'спи' ? 'спи' : състояние === 'будно' ? 'будно' : 'натисни при заспиване');
    к.querySelector('.pl-sr-fg').style.strokeDasharray = (състояние === 'празно' ? 0 : Math.max(2, (мин % 60) / 60 * 100)) + ' 100';
  }
  setInterval(() => { if (!document.hidden && document.querySelector('#roRoom .pl-sleepring')) сънКръг(); }, 30000);

  // 🌟 „Първите пъти“ (референцията „Първите пъти остават“): 7-те реда от rooms2.js стават
  //   златни плочки с плюшена рисунка. Полето за дата е СЪЩОТО (записът и проверките за дата
  //   остават в rooms2.js) — тук само махаме емоджито от надписа (ключът в bl_firsts идва от
  //   затварянето в rooms2.js, не от текста) и светваме плочката, щом има дата.
  const ПЪРВИ = { 'Първа усмивка': [0, 0], 'Първо обръщане': [0, 1], 'Първо зъбче': [0, 2], 'Първо сядане': [0, 3],
    'Първо пълзене': [1, 0], 'Първа дума': [1, 1], 'Първа стъпка': [1, 2] };
  function първите() {
    document.querySelectorAll('#roRoom .dv-firsts').forEach(кутия => {
      if (!кутия.hasAttribute('data-pl')) {
        кутия.setAttribute('data-pl', '1');
        кутия.querySelectorAll('.dv-firstrow').forEach(ред => {
          const е = ред.querySelector('.dv-firstlbl'); if (!е) return;
          const м = (е.textContent || '').trim().match(/^(\S+)\s+([\s\S]+)$/u);
          const име = м && !/[А-Яа-я]/.test(м[1]) ? м[2].trim() : (е.textContent || '').trim();
          const п = ПЪРВИ[име];
          const и = document.createElement('span');
          и.className = 'pl-fi'; и.setAttribute('aria-hidden', 'true');
          if (п) { и.style.backgroundImage = 'url(img/art/ico-d.webp)'; и.style.backgroundPosition = (п[1] * 100 / 3) + '% ' + (п[0] * 100 / 3) + '%'; }
          else и.textContent = м ? м[1] : '🌟';
          ред.insertBefore(и, ред.firstChild);
          if (м && п) е.textContent = име;
        });
        кутия.addEventListener('change', () => setTimeout(() => злато(кутия), 0));
      }
      злато(кутия);
    });
  }
  function злато(кутия) {
    кутия.querySelectorAll('.dv-firstrow').forEach(ред => {
      const в = ред.querySelector('input'); const има = !!(в && в.value);
      if (ред.classList.contains('pl-done') !== има) ред.classList.toggle('pl-done', има);
    });
  }

  // Подзаглавието под името е „Помощникът на мама · помощничка за игрите“ — на един ред се
  //   режеше до „Помощникът на …“ и не казваше нищо. Показваме само смислената опашка.
  //   Текстът на елемента НЕ се пипа (приложението си го пише) — само data-атрибут за CSS.
  function подзаглавие() {
    const с = document.getElementById('roSub');
    if (!с) return;
    const т = (с.textContent || '').trim();
    const о = т.includes(' · ') ? т.split(' · ').pop().trim() : '';
    const к = о ? о.charAt(0).toUpperCase() + о.slice(1) : '';
    if (к && с.getAttribute('data-short') !== к) с.setAttribute('data-short', к);
    else if (!к && с.hasAttribute('data-short')) с.removeAttribute('data-short');
  }

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
