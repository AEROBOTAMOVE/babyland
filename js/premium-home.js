/* ═══════════════════════════════════════════════════════════════════════════════
   ✨ PREMIUM НАЧАЛО · по референциите на собственика (22.09.2026)
   Слага новото начало ПРЕД <main> и скрива стария герой с клас html.pl-on.
   Не пипа никоя стара логика: стаите се отварят през MamaHelper.open, а
   „Добави момент“ натиска съществуващия бутон „+“ (#plus-btn).
   ПЪТ НАЗАД: махни <script> и <link> на premium от index.html.
   ═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.BL_PREMIUM_HOME) return;

  // Рисунките: плюшен стил по референциите, Seedream Lite 1K, по 5-7 КБ като WebP 320×320.
  // помощничките в реда на листа persony.webp (ред по ред): Мила, Мира, Малина / Вита, Луна, Искра / Дара, Ния, Ема
  const ПОМОЩНИЧКИ = [
    { име: 'Мила', роля: 'бременност', стая: 'Бременност' },
    { име: 'Мира', роля: 'бебето', стая: 'Моето бебе' },
    { име: 'Малина', роля: 'захранване', стая: 'Захранване' },
    { име: 'Вита', роля: 'здраве', стая: 'Здраве и SOS' },
    { име: 'Луна', роля: 'дневник', стая: 'Дневник на мама' },
    { име: 'Искра', роля: 'игри', стая: 'Развитие и игри' },
    { име: 'Дара', роля: 'инструменти', стая: 'Инструменти' },
    { име: 'Ния', роля: 'за мама', стая: 'Жената в мен' },
    { име: 'Ема', роля: 'лаборатория', стая: 'Лабораторията' },
  ];
  const СТАИ = [
    { стая: 'Бременност', надпис: 'Бременност', знак: '🤰', клас: 'c-preg', рис: 'stai/bremennost' },
    { стая: 'Моето бебе', надпис: 'Моето бебе', знак: '👶', клас: 'c-baby', рис: 'stai/bebe' },
    { стая: 'Захранване', надпис: 'Захранване', знак: '🥣', клас: 'c-feed', рис: 'stai/zahranvane' },
    { стая: 'Здраве и SOS', надпис: 'Здраве', знак: '🩺', клас: 'c-health', рис: 'stai/zdrave' },
    { стая: 'Дневник на мама', надпис: 'Дневник', знак: '📖', клас: 'c-diary', рис: 'stai/dnevnik' },
    { стая: 'Развитие и игри', надпис: 'Игри', знак: '🧸', клас: 'c-play', рис: 'stai/igri' },
    { стая: 'Инструменти', надпис: 'Инструменти', знак: '🧰', клас: 'c-tools', рис: 'stai/instrumenti' },
    { стая: 'Жената в мен', надпис: 'За мама', знак: '☕', клас: 'c-mom', рис: 'stai/zhenata' },
    { стая: 'Лабораторията', надпис: 'Лаборатория', знак: '🧪', клас: 'c-lab', рис: 'stai/laboratoriya' },
  ];
  const МЕСЕЦИ = ['януари', 'февруари', 'март', 'април', 'май', 'юни', 'юли', 'август', 'септември', 'октомври', 'ноември', 'декември'];

  const чети = (к, по) => { try { const v = localStorage.getItem(к); return v ? JSON.parse(v) : по; } catch (e) { return по; } };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ч => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ч]));

  function поздрав() {
    const ч = new Date().getHours();
    if (ч >= 5 && ч < 11) return 'Добро утро';
    if (ч >= 11 && ч < 18) return 'Добър ден';
    if (ч >= 18 && ч < 22) return 'Добър вечер';
    return 'Тиха нощ';
  }
  function бебето() {
    const б = чети('bl_baby', {}) || {};
    const име = (б.name || '').trim();
    if (!б.birth) {
      const бр = чети('bl_preg', null);
      return { име: име || 'Нашето бебе', ред: бр ? 'очакваме те с любов' : 'разкажи ми за бебето', знак: бр ? '🤰' : '👶', бр: !!бр };
    }
    const р = new Date(б.birth), д = new Date();
    let м = (д.getFullYear() - р.getFullYear()) * 12 + (д.getMonth() - р.getMonth());
    if (д.getDate() < р.getDate()) м--;
    let ред;
    if (м < 1) { const дни = Math.max(0, Math.floor((д - р) / 864e5)); ред = дни + (дни === 1 ? ' ден' : ' дни'); }
    else if (м < 24) ред = м + (м === 1 ? ' месец' : ' месеца');
    else { const г = Math.floor(м / 12); ред = г + (г === 1 ? ' година' : ' години'); }
    return { име: име || 'Бебето', ред, знак: б.sex === 'girl' ? '👧' : б.sex === 'boy' ? '👦' : '👶' };
  }
  function днес() { const д = new Date(); return 'Днес, ' + д.getDate() + ' ' + МЕСЕЦИ[д.getMonth()]; }

  // 📊 „Нашият ден“ (референцията с броячите): чете СЪЩИТЕ складове, в които пишат картите
  //   в стаята „Моето бебе“ — нищо не записва само. Правилата са взети оттам, не измислени:
  //   · хранения = bl_nursing (таймерът) + bl_feedlog (бързите чипове) + bl_feed, с дедуп на
  //     близнаци под 60 с (rooms6.js „Спрямо вчера“, rooms2.js прогнозата);
  //   · сън = bl_sleep само ако е ДНЕШЕН; отворен брояч над 14 ч е забравяне, не сън (rooms2.js ТАВАН_СЪН);
  //   · пелени = bl_diapers[днес].wet + dirty.
  //   Нула без запис не е „нула“ — тогава стои поканата „+ запиши“, не „0“.
  const локалнаДата = д => д.getFullYear() + '-' + String(д.getMonth() + 1).padStart(2, '0') + '-' + String(д.getDate()).padStart(2, '0');
  const чм = тс => { const д = new Date(тс); return String(д.getHours()).padStart(2, '0') + ':' + String(д.getMinutes()).padStart(2, '0'); };
  const чч = мин => (мин >= 60 ? Math.floor(мин / 60) + 'ч ' : '') + (мин % 60) + 'м';
  function денят() {
    const д = локалнаДата(new Date()), сега = Date.now();
    const тс = [...(чети('bl_nursing', []) || []).map(x => x && x.ts), ...(чети('bl_feedlog', []) || []), (чети('bl_feed', null) || {}).t]
      .filter(x => typeof x === 'number' && isFinite(x)).sort((a, b) => a - b)
      .filter((x, i, а) => i === 0 || x - а[i - 1] > 60000);
    const днешни = тс.filter(x => локалнаДата(new Date(x)) === д);
    const последно = тс.length ? тс[тс.length - 1] : null;
    const с = чети('bl_sleep', null);
    let сънМин = 0, спи = 0;
    // 20.10 (мерено, gl20_c2): през първата минута сън броячът показваше „+“ — спи = 0 минути е „лъжа“ в условието.
    //   Сега „спи сега“ се решава от отворения брояч, не от минутите. ПЪТ НАЗАД: върни „с && с.open && спи“ на двете места.
    const спиСега = !!(с && с.open && сега - с.open > 0 && сега - с.open <= 14 * 3600000);
    if (с && с.d === д && Array.isArray(с.segs)) сънМин = Math.floor(с.segs.reduce((а, x) => а + Math.max(0, (x.e || 0) - (x.s || 0)), 0) / 60000);
    if (с && с.open && сега - с.open > 0 && сега - с.open <= 14 * 3600000) { спи = Math.floor((сега - с.open) / 60000); сънМин += спи; }
    const п = (чети('bl_diapers', {}) || {})[д];
    const пелени = п ? (+п.wet || 0) + (+п.dirty || 0) : 0;
    return {
      храна: днешни.length ? днешни.length + '× · преди ' + чч(Math.max(0, Math.floor((сега - последно) / 60000))) : '+ запиши',
      сън: спиСега ? 'спи от ' + чч(спи) : сънМин ? чч(сънМин) + ' днес' : '+ запиши',
      пелени: пелени ? пелени + ' днес' : '+ запиши',
      има: { храна: !!днешни.length, сън: !!сънМин || спиСега, пелени: !!пелени },
      // ЛЕНТАТА НА ДЕНЯ (реф. 20: „08:30 Хранене · 10:00 Сън · 12:00 Разходка“) — последните ТРИ записа
      //   с час. Пелените нямат часове в склада (bl_diapers пази само броя за деня), затова в лентата
      //   влизат храненията и съня; пелените остават в бързото „+“ отдолу.
      лента: (() => {
        const сб = днешни.map(t => ({ t, вид: 'храна', име: 'Хранене' }));
        if (с && с.d === д && Array.isArray(с.segs)) с.segs.forEach(x => { if (x && typeof x.s === 'number') сб.push({ t: x.s, вид: 'сън', име: 'Сън' }); });
        if (с && с.open && сега - с.open > 0 && сега - с.open <= 14 * 3600000) сб.push({ t: с.open, вид: 'сън', име: 'Спи сега' });
        return сб.sort((a, b) => a.t - b.t).slice(-3).map(x => ({ ч: чм(x.t), вид: x.вид, име: x.име }));
      })(),
      // компактният ред по референция 20: голямо (час / време / брой) + малък надпис
      кратко: {
        храна: днешни.length ? { г: чм(днешни[днешни.length - 1]), п: 'Хранене · ' + днешни.length + '×' } : { г: '+', п: 'Хранене' },
        сън: спиСега ? { г: чч(спи), п: 'спи сега' } : сънМин ? { г: чч(сънМин), п: 'Сън днес' } : { г: '+', п: 'Сън' },
        пелени: пелени ? { г: String(пелени), п: 'Пелени днес' } : { г: '+', п: 'Пелени' },
      },
    };
  }
  function броячи() {
    const д = денят();
    лентата(д);
    [['plDayFeed', 'храна'], ['plDaySleep', 'сън'], ['plDayDiaper', 'пелени']].forEach(([id, к]) => {
      const е = document.getElementById(id); if (!е) return;
      const м = е.parentElement && е.parentElement.querySelector('small');
      const { г, п } = д.кратко[к];
      if (е.textContent !== г) е.textContent = г;           // само при разлика — текстът е мутация
      if (м && м.textContent !== п) м.textContent = п;
      const б = е.closest('.pl-day-it');
      if (б && б.classList.contains('on') !== д.има[к]) б.classList.toggle('on', д.има[к]);
      const ар = п + (д.има[к] ? ': ' + г : ' — запиши');
      if (б && б.getAttribute('aria-label') !== ар) б.setAttribute('aria-label', ар);
    });
  }

  const ЛЕНТА_ИК = { храна: '0% 33.333%', 'сън': '33.333% 33.333%' };
  function лентата(д) {
    const е = document.getElementById('plLine'); if (!е) return;
    const подпис = д.лента.map(x => x.ч + x.вид + x.име).join('|');
    if (е.dataset.pl === подпис) return;                       // няма разлика → нищо не пипаме
    е.dataset.pl = подпис;
    if (!д.лента.length) { if (!е.hidden) е.hidden = true; е.innerHTML = ''; return; }
    if (е.hidden) е.hidden = false;
    е.innerHTML = д.лента.map(x =>
      '<span class="pl-li t-' + (x.вид === 'храна' ? 'feed' : 'sleep') + '">' +
        '<i class="pl-art" aria-hidden="true" style="background-image:url(img/art/ico-a.webp);background-position:' + ЛЕНТА_ИК[x.вид] + '"></i>' +
        '<span class="pl-li-t"><b>' + esc(x.ч) + '</b><small>' + esc(x.име) + '</small></span>' +
      '</span>').join('<i class="pl-li-d" aria-hidden="true"></i>');
  }
  function отвори(стая) { try { if (window.MamaHelper && MamaHelper.open) MamaHelper.open(стая); } catch (e) {} }
  // 🪤 22.09: беше getElementById('plus-btn') — а бутонът е <button class="plus-btn"> в #blPlus (polish.js:314),
  //   без id. „Добави момент“ не правеше НИЩО от етап 1 насам; хванато при сверката с референцията.
  function добави() { const б = document.querySelector('#blPlus .plus-btn') || document.querySelector('.plus-btn'); if (б) б.click(); }

  function рисувай() {
    const б = бебето();
    const с = document.createElement('section');
    с.id = 'plHome';
    с.setAttribute('aria-label', 'Начало');
    с.innerHTML =
      '<div class="pl-hero">' +
        '<img class="pl-hero-art" src="img/art/hero-home.webp" alt="" decoding="async" fetchpriority="high" width="720" height="1280">' +
        '<div class="pl-hero-txt">' +
          // 21.10 · интервал преди <br>: css/pl-start.css крие <br> (заглавието е на един ред под облака) — без него „утро,мамо“
          '<h1><span id="plGreet">' + esc(поздрав()) + '</span>, <br>мамо! <span class="pl-heart" aria-hidden="true">♡</span></h1>' +
          '<p>Малки стъпки. Голям свят.</p>' +
        '</div>' +
        '<button type="button" class="pl-baby" id="plBaby" aria-label="Отвори стаята на бебето">' +
          '<span class="pl-baby-av pl-art-av" aria-hidden="true" style="background-image:url(img/art/' + (б.бр ? 'ico-a.webp);background-position:0% 0%' : 'ico-d.webp);background-position:0% 33.333%') + '">' + б.знак + '</span>' +
          '<span><b>' + esc(б.име) + ' · ' + esc(б.ред) + '</b><small id="plToday">' + esc(днес()) + '</small></span>' +
          '<span class="pl-baby-go" aria-hidden="true">›</span>' +
        '</button>' +
      '</div>' +
      '<button type="button" class="pl-find" data-pl="find" aria-label="Търси във всичко — храна, симптом, дума">' +
        '<i class="pl-art" aria-hidden="true" style="background-image:url(img/art/ico-c.webp);background-position:33.333% 100%"></i>' +
        '<span>Какво търсим днес?</span><em aria-hidden="true">›</em>' +
      '</button>' +
      '<div class="pl-card">' +
        '<div class="pl-card-h"><i class="pl-art pl-sun" aria-hidden="true" style="background-image:url(img/art/ico-d.webp);background-position:0% 0%"></i> Нашият ден<button type="button" class="pl-all" data-room="Моето бебе">Виж всички ›</button></div>' +
        '<div class="pl-line" id="plLine" hidden></div>' +
        '<div class="pl-day">' +
          '<button type="button" class="pl-day-it t-feed" data-room="Моето бебе"><i class="pl-art" aria-hidden="true" style="background-image:url(img/art/ico-a.webp);background-position:0% 33.333%"></i><span class="pl-day-t"><b id="plDayFeed" aria-live="polite">+</b><small>Хранене</small></span></button>' +
          '<button type="button" class="pl-day-it t-sleep" data-room="Моето бебе"><i class="pl-art" aria-hidden="true" style="background-image:url(img/art/ico-a.webp);background-position:33.333% 33.333%"></i><span class="pl-day-t"><b id="plDaySleep" aria-live="polite">+</b><small>Сън</small></span></button>' +
          '<button type="button" class="pl-day-it t-diaper" data-room="Моето бебе"><i class="pl-art" aria-hidden="true" style="background-image:url(img/art/ico-f.webp);background-position:0% 0%"></i><span class="pl-day-t"><b id="plDayDiaper" aria-live="polite">+</b><small>Пелени</small></span></button>' +
        '</div>' +
      '</div>' +
      '<button type="button" class="pl-cta" data-pl="add"><b aria-hidden="true">+</b>Добави момент</button>' +
      // 20.10 · ЕДНО напомняне — най-важното от „Днес“ (ваксината първа); пълни го подредиДнес() долу
      '<button type="button" class="pl-napomni" id="plNapomni" hidden></button>' +
      // 20.10 · стаите на ЕДНО място: заглавието е В панела; „Всички отблизо“ разгъва големите карти ТУК
      //   (беше: <h2 class="pl-h2">Влез в своята стая</h2> над рафта + втори път „Деветте вълшебни стаи“ долу)
      '<div class="pl-shelf"><div class="pl-panel-h"><h2 class="pl-ph" id="plStaiH">Влез в своята стая</h2></div>' +
      '<div class="pl-rooms">' +
        СТАИ.map((р, i) => '<button type="button" class="pl-room ' + р.клас + '" data-room="' + esc(р.стая) + '" style="--i:' + i + '" aria-label="Стая ' + esc(р.надпис) + '">' +
          // 06.10 МЕРЕНО (обиколка): деветата плочка („Лабораторията“) стоеше като ПРАЗНА
          //   синя арка — картинката е заредена и видима, но с loading="lazy" идваше
          //   последна и „изскачаше“ след миг. Рафтът е най-горе на началото — зарежда се веднага.
          '<span class="pl-arch" aria-hidden="true"><img src="img/art/' + р.рис + '.webp" alt="" loading="eager" decoding="async" width="160" height="160"></span>' +
          '<span>' + esc(р.надпис) + '</span></button>').join('') +
      '</div><button type="button" class="pl-vse" data-pl="vse" aria-expanded="false" aria-controls="plStaiVse">Всички стаи отблизо <i aria-hidden="true">▾</i></button>' +
        '<div class="pl-stai-vse" id="plStaiVse" hidden></div></div>' +
      // 🧸 деветте помощнички с ИСТИНСКИТЕ им лица (img/art/persony.webp, 3×3; клетка x = колона·50%, y = ред·50%).
      //    20.10: една лента за плъзгане (беше решетка 9 карти ≈ 1142 px); хорото долу е в „Още за Бейби Ленд“.
      '<div class="pl-pomosht"><div class="pl-panel-h"><h2 class="pl-ph">Помощничките</h2><small aria-hidden="true">плъзни ›</small></div>' +
      '<div class="pl-pers">' +
        ПОМОЩНИЧКИ.map((п, i) => '<button type="button" class="pl-per" style="--i:' + i + '" data-room="' + esc(п.стая) + '" aria-label="' + esc(п.име + ' — ' + п.роля) + '">' +
          '<i aria-hidden="true" style="background-position:' + (i % 3) * 50 + '% ' + Math.floor(i / 3) * 50 + '%"></i>' +
          '<b>' + esc(п.име) + '</b><small>' + esc(п.роля) + '</small></button>').join('') +
      '</div></div>' +
      '<button type="button" class="pl-mira" data-room="Моето бебе">' +
        '<i class="pl-art pl-mira-av" aria-hidden="true" style="background-image:url(img/art/ico-e.webp);background-position:33.333% 66.667%"></i>' +
        '<span><b>Мира е до теб</b><small>Отговори, подкрепа и полезни съвети.</small></span>' +
        '<em>Попитай ›</em>' +
      '</button>';

    с.addEventListener('click', e => {
      // 20.10: големите карти („Всички отблизо“) си имат свой клик в app.js (искри + отваряне след 380 ms) —
      //   без тази спирка стаята се отваряше два пъти
      if (e.target.closest('.room-card')) return;
      if (e.target.closest('[data-pl="vse"]')) { if (window.BL_PL_GL20) BL_PL_GL20.стаите(); return; }
      if (e.target.closest('#plNapomni')) { if (window.BL_PL_GL20) BL_PL_GL20.напомни(); return; }
      const ст = e.target.closest('[data-room]');
      if (ст) { отвори(ст.getAttribute('data-room')); return; }
      if (e.target.closest('[data-pl="add"]')) { добави(); return; }
      // 🔎 старият вход за търсене (#searchTrigger) стои в скритата секция „Деветте вълшебни стаи“ —
      //   хванато от проверителя на екрана „Търсене“. Оттук викаме СЪЩОТО търсене.
      if (e.target.closest('[data-pl="find"]')) {
        try { if (window.BL_SEARCH && BL_SEARCH.open) { BL_SEARCH.open(); return; } } catch (грешка) {}
        const т = document.getElementById('searchTrigger'); if (т) т.click();
        return;
      }
      if (e.target.closest('#plBaby')) отвори('Моето бебе');
    });
    return с;
  }

  function сложи() {
    const main = document.querySelector('main');
    if (!main || document.getElementById('plHome')) return;
    main.parentNode.insertBefore(рисувай(), main);
    // 🎬 сцената по референция 20 — неподвижна зад цялата страница (css #plScene)
    if (!document.getElementById('plScene')) { const сц = document.createElement('div'); сц.id = 'plScene'; сц.setAttribute('aria-hidden', 'true'); document.body.insertBefore(сц, document.body.firstChild); }
    document.documentElement.classList.add('pl-on');
    тема();
    броячи();
    // „+“ долу вляво застъпваше „Влез в своята стая“ — докато „Добави момент“ се вижда, той е излишен
    const cta = document.querySelector('#plHome .pl-cta');
    if (cta && 'IntersectionObserver' in window) new IntersectionObserver(в => { document.documentElement.classList.toggle('pl-cta-vis', в[0].isIntersecting); }).observe(cta);
    // броячите се опресняват, когато мама се върне от стаята (там записва), при връщане в
    // приложението, при запис от друг раздел и на всеки 30 с ("преди 2ч 10м" да не застива)
    const ов = document.getElementById('roomOverlay');
    if (ов) new MutationObserver(() => { clearTimeout(сложи.т); сложи.т = setTimeout(броячи, 300); }).observe(ов, { attributes: true, attributeFilter: ['class', 'hidden'] });
    window.addEventListener('storage', e => { if (e.key && /^bl_(nursing|feed|feedlog|sleep|diapers)$/.test(e.key)) броячи(); });
    setInterval(() => { if (!document.hidden) броячи(); }, 30000);
  }
  function опресни() {
    const п = document.getElementById('plGreet'); if (п) п.textContent = поздрав();
    const д = document.getElementById('plToday'); if (д) д.textContent = днес();
    броячи();
  }
  // 🌙 нощта има своя рисунка — приложението само минава в тъмно 21:00-7:00 (app.js)
  function тема() {
    const и = document.querySelector('.pl-hero-art'); if (!и) return;
    const нощ = document.documentElement.getAttribute('data-theme') === 'dark';
    const нов = нощ ? 'img/art/hero-night.webp' : 'img/art/hero-home.webp';
    if (и.getAttribute('src') !== нов) {
      и.onload = () => и.classList.toggle('is-night', нощ);
      и.setAttribute('src', нов);
    } else и.classList.toggle('is-night', нощ);
  }
  new MutationObserver(тема).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // 🎈 Първата стъпка на обиколката (home.js:834) = референция 5: три плюшени плочки под заглавието.
  //   Декоративни (aria-hidden) — текстът и бутоните остават на home.js. Слагат се само докато
  //   е активна ПЪРВАТА точка; при следващата стъпка се махат. Пише се само при разлика.
  const ПЛОЧКИ = [['За бебето', 'ico-d', 0, 3], ['За мама', 'ico-c', 2, 1], ['Всеки ден', 'ico-d', 0, 0]];
  function обиколка() {
    const ов = document.querySelector('.tour-ov');
    // обиколката е веднъж в живота: минала ли е и я няма — наблюдателят спира (иначе буди при всяка промяна)
    if (!ов) { let минала = null; try { минала = localStorage.getItem('bl_tour_done'); } catch (e) {} if (минала && набТур) { набТур.disconnect(); набТур = null; } return; }
    const т = ов.querySelector('.tour-dots > span'); const първа = !!(т && т.classList.contains('on'));
    if (ов.classList.contains('pl-tour-1') !== първа) ов.classList.toggle('pl-tour-1', първа);
    const к = ов.querySelector('.tour-card'); if (!к) return;
    const има = к.querySelector('.pl-tt');
    if (първа && !има) {
      const р = document.createElement('div'); р.className = 'pl-tt'; р.setAttribute('aria-hidden', 'true');
      р.innerHTML = ПЛОЧКИ.map(([н, л, ред, кол]) => '<span class="pl-tt-i"><i style="background-image:url(img/art/' + л + '.webp);background-position:' + (кол * 100 / 3) + '% ' + (ред * 100 / 3) + '%"></i><b>' + н + '</b></span>').join('');
      const точки = к.querySelector('.tour-dots'); к.insertBefore(р, точки || null);
    } else if (!първа && има) има.remove();
    // 🎈 24.10 · собственикът: „началото, дето махна — оправи го на изрод, анимации с код“. Голямата рисунка
    //   (welcome.webp) я няма; вместо нея ЖИВОТО лого „Baby Land“ — клонинг на векторното лого горе в началото
    //   (header.hero .logo-art: облак, балон, личице; частите му вече плуват/мигат от style.css), което влиза с
    //   отскок, и небе от код отзад (css/premium.css § „ЖИВОТО НАЧАЛО“). Нула файлове, само transform/opacity.
    //   Няма ли лого горе (стара страница) — нищо не се слага и остава малкото балонче. ПЪТ НАЗАД: махни този блок.
    if (!ов.querySelector(':scope > .pl-tsky')) {
      const н = document.createElement('div'); н.className = 'pl-tsky'; н.setAttribute('aria-hidden', 'true');
      н.innerHTML = '<i class="pl-ts-a a1"></i><i class="pl-ts-a a2"></i><i class="pl-ts-a a3"></i>' +
        '<i class="pl-ts-c c1"></i><i class="pl-ts-c c2"></i><i class="pl-ts-c c3"></i>' +
        [1, 2, 3, 4, 5, 6, 7, 8].map(i => '<i class="pl-ts-s s' + i + '"></i>').join('');
      ов.insertBefore(н, ов.firstChild);
    }
    const лого = к.querySelector(':scope > .pl-tlogo');
    if (първа && !лого) {
      const извор = document.querySelector('header.hero .logo-art');
      if (извор) {
        const о = document.createElement('div'); о.className = 'pl-tlogo'; о.setAttribute('aria-hidden', 'true');
        const с = извор.cloneNode(true); с.removeAttribute('role'); с.removeAttribute('aria-label'); с.setAttribute('class', 'pl-tlogo-svg');
        о.appendChild(с);
        const з = к.querySelector('h3'); к.insertBefore(о, з || к.firstChild);
        // фокусът на „Напред“ (home.js) превърташе оверлея надолу, преди логото да дойде — на нисък екран
        //   се отваряше с отрязан връх (кадър mal24b_land). Четенето почва отгоре.
        ов.scrollTop = 0;
      }
    } else if (!първа && лого) лого.remove();
    // хореографията тръгва, когато стартовият екран (#blSplash) си е отишъл — иначе се изиграва ПОД него —
    //   и САМО при видима страница: анимация, родена в скрит таб, замръзва на нулевия кадър (видяно на живо:
    //   document.hidden → заглавието стоеше с opacity 0). 2,6 s след старта .pl-tdone налага крайния кадър
    //   независимо от анимациите — основният кадър не се доставя от анимация (zhiv-sait § 3.1).
    if (!ов.classList.contains('pl-tgo') && !document.getElementById('blSplash') && !document.hidden) {
      ов.classList.add('pl-tgo');
      setTimeout(() => ов.classList.add('pl-tdone'), 2600);
    }
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) обиколка(); });
  let чакаТ = false;
  let набТур = new MutationObserver(() => { if (чакаТ) return; чакаТ = true; setTimeout(() => { чакаТ = false; обиколка(); }, 40); });
  набТур.observe(document.documentElement, { childList: true, subtree: true });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', сложи); else сложи();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) опресни(); });
  window.BL_PREMIUM_HOME = { опресни, денят, обиколка };   // обиколка ← index.html · прибери (облакът каца в логото)
})();

/* ═══════════════════════════════════════════════════════════════════════════════
   ☀️ СВЕТЛИНАТА ОТ ПРОЗОРЕЦА · 06.10.2026
   Сцената на началото (img/scene/nachalo.webp) има прозорец горе вляво, но стаята
   беше осветена „от никъде“. Сега през него падат три меки лъча, които дишат, и в
   тях бавно плува ситен прах — както в истинска стая сутрин. Нощем — лунна светлина.
   НЕ дублира pl-zhivo.js: там са сърчицата/боке/искрите, които плуват НАГОРЕ над
   героя; тук е само светлината и прахът В лъчите.

   ПО ЗАКОНИТЕ НА JMATION (cyberninjas MCP · jmation_guide 'method' и 'loops'):
     · кадърът е ЧИСТА функция на номера си: рисуването не чете часовник и не ползва
       Math.random — случайното е хеш със семе; страницата само избира кадъра;
     · ЦИКЪЛ: всичко зависи от фазата φ ∈ [0, 1) само с ЦЕЛИ хармоници → кадър N ≡ кадър 0;
     · ЦЕЛИ ЖИВОТИ: всяка прашинка се ражда и угасва с яркост 0 — нищо не „изскача“;
     · един материал: топла светлина в стая от филц; нищо не крещи.

   ГЕОМЕТРИЯТА е в пикселите на картината (720×1280) и се пренася като фона на
   #plScene (pl-zhivo.css: ширина max(100%, 57.14vh), горе в средата) — лъчът
   излиза от стъклото, на който и да е екран.
   ПЕСТИ: 30 кадъра/с, плътност ≤ 1.5; спира извън екрана, при скрит раздел и под
   отворена стая/статия/търсене; при намалено движение — един неподвижен кадър.
   САМОПРОВЕРКА: BL_PL_SVETLINA.проверка() — състоянието във φ и φ+1 (трябва ≈ 0);
                 BL_PL_SVETLINA.шев() — пикселите на кадър N срещу кадър 0 (трябва 0).
   ПЪТ НАЗАД: махни този блок; правилото .pl-hero-svetlina в premium.css остава безвредно.
   ═══════════════════════════════════════════════════════════════════════════════ */
(function светлината() {
  'use strict';
  if (window.BL_PL_SVETLINA) return;
  var N = 720;                                         // 12 s при 60 кадъра — периодът
  var ДВА_ПИ = Math.PI * 2, КШ = 720, КВ = 1280;        // размерът на картината
  function хеш(i, s) { var x = Math.sin(i * 127.1 + s * 311.7 + 74.7) * 43758.5453; return x - Math.floor(x); }

  // ── лъчите (в пиксели на картината): горе от стъклото на левия прозорец, долу по стената ──
  var ГОРЕ = 30, ДОЛУ = 1060, ОТМЕСТ = 360;
  var ЛЪЧИ = [{ a: 92, w: 62, ст: 2.3 }, { a: 168, w: 84, ст: 2.0 }, { a: 258, w: 44, ст: 2.6 }];
  function ръбове(л, y) {                               // лявият и десният ръб на лъча на височина y
    var t = (y - ГОРЕ) / (ДОЛУ - ГОРЕ);
    var л0 = л.a + ОТМЕСТ * t, д0 = л.a + л.w + (ОТМЕСТ + л.w * (л.ст - 1)) * t;
    return [л0, д0];
  }

  // ── прахът: всяка прашинка живее в един лъч, цели животи (1–3 за цикъл) ──
  var ПРАХ = 42, прах = [];
  for (var i = 0; i < ПРАХ; i++) прах.push({
    лъч: i % 3, живот: 1 + (i % 3), отм: хеш(i, 1),
    t: .08 + .62 * хеш(i, 2), s: .1 + .8 * хеш(i, 3),          // къде по дължината и по ширината на лъча
    пад: 18 + 40 * хеш(i, 4),                                   // колко пада за живота си (пиксели на картината)
    люл: 6 + 12 * хеш(i, 5), чест: 1 + Math.floor(хеш(i, 6) * 3),
    r: .6 + 1.5 * Math.pow(хеш(i, 7), 2)
  });
  function прашинка(φ, i) {
    var п = прах[i], л = ЛЪЧИ[п.лъч];
    var u = (φ * п.живот + п.отм) % 1;                     // цяло „живот“ → периодично във φ
    var y = ГОРЕ + п.t * (ДОЛУ - ГОРЕ) + п.пад * u;
    var р = ръбове(л, y);
    return {
      x: р[0] + п.s * (р[1] - р[0]) + п.люл * Math.sin(ДВА_ПИ * п.чест * u),
      y: y,
      а: Math.pow(Math.sin(Math.PI * u), 2) * (1 - .6 * п.t), // 0 при раждане и смърт; по-ярко до прозореца
      r: п.r
    };
  }
  function дишане(φ, b) { return .7 + .3 * Math.sin(ДВА_ПИ * (b + 1) * φ + b * 1.7); }

  function спрайт(цвят) {                                  // рисува се веднъж, после само се копира
    var с = document.createElement('canvas'); с.width = с.height = 32;
    var к = с.getContext('2d'), г = к.createRadialGradient(16, 16, 0, 16, 16, 16);
    г.addColorStop(0, 'rgba(' + цвят + ',1)'); г.addColorStop(.4, 'rgba(' + цвят + ',.5)'); г.addColorStop(1, 'rgba(' + цвят + ',0)');
    к.fillStyle = г; к.fillRect(0, 0, 32, 32);
    return с;
  }
  // денем стената е кремава — бялата светлина се губи в нея (мерено: снимка 06.10); затова е златиста и по-силна
  var ДЕН = { лъч: '255,214,150', праш: спрайт('255,236,200'), сила: .34, прах: 1 };
  var НОЩ = { лъч: '190,206,255', праш: спрайт('214,224,255'), сила: .2, прах: .7 };

  // ── кадърът: чиста функция на f, размера (м) и темата ──
  function рисувай(кт, f, м, нощ) {
    var φ = (f % N) / N, т = нощ ? НОЩ : ДЕН, к = м.k;
    кт.clearRect(0, 0, м.W, м.H);
    кт.globalCompositeOperation = 'lighter';
    for (var b = 0; b < ЛЪЧИ.length; b++) {
      var л = ЛЪЧИ[b], г0 = ръбове(л, ГОРЕ), г1 = ръбове(л, ДОЛУ);
      var г = кт.createLinearGradient(0, м.oy + ГОРЕ * к, 0, м.oy + ДОЛУ * к);
      г.addColorStop(0, 'rgba(' + т.лъч + ',' + (т.сила * дишане(φ, b)).toFixed(3) + ')');
      г.addColorStop(.45, 'rgba(' + т.лъч + ',' + (т.сила * .35 * дишане(φ, b)).toFixed(3) + ')');
      г.addColorStop(1, 'rgba(' + т.лъч + ',0)');
      кт.fillStyle = г;
      кт.beginPath();
      кт.moveTo(м.ox + г0[0] * к, м.oy + ГОРЕ * к); кт.lineTo(м.ox + г0[1] * к, м.oy + ГОРЕ * к);
      кт.lineTo(м.ox + г1[1] * к, м.oy + ДОЛУ * к); кт.lineTo(м.ox + г1[0] * к, м.oy + ДОЛУ * к);
      кт.closePath(); кт.fill();
    }
    for (var i = 0; i < ПРАХ; i++) {
      var п = прашинка(φ, i);
      if (п.а < .01) continue;
      var R = Math.max(1.2, п.r * к * 3.4);
      кт.globalAlpha = п.а * т.прах;
      кт.drawImage(т.праш, м.ox + п.x * к - R, м.oy + п.y * к - R, R * 2, R * 2);
    }
    кт.globalAlpha = 1;
    кт.globalCompositeOperation = 'source-over';
  }

  // ── монтаж в сцената ──
  var кан = null, кт = null, м = { W: 1, H: 1, k: 1, ox: 0, oy: 0 }, заявка = 0, вижда = true, наЕкрана = true, нечетен = false;
  var НАМАЛЕНО = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function нощ() { return document.documentElement.getAttribute('data-theme') === 'dark'; }
  function закрито() {                                  // стая/статия/търсене отгоре → сцената не се вижда
    var и = ['roomOverlay', 'artOverlay', 'searchOverlay'];
    for (var j = 0; j < и.length; j++) { var е = document.getElementById(и[j]); if (е && !е.hidden) return true; }
    return false;
  }
  // 20.10 · ТЕЖЕСТТА (CPU профил, ×4: размер = 294–709 ms собствено време): getBoundingClientRect принуждаваше
  //   подредбата на целия документ по време на старта, и то при всяко обаждане (тема, размер). Сега размерът
  //   идва ГОТОВ от ResizeObserver (той се обажда след подредбата, без да я принуждава); същият размер → нищо;
  //   смяна на темата → само нов кадър, без ново платно. Платното е 1× (беше до 1.5× = 2.25 пъти повече
  //   пиксели на всеки кадър) — светлината е мека, разлика за окото няма.
  //   Сцената вече е „cover“ горе в средата (pl-zhivo.css, 20.10) → ширината на картината = max(W, H·720/1280).
  //   ПЪТ НАЗАД: dev/proba/gl20_predi/js/premium-home.js.
  var послW = 0, послH = 0;
  function размер(записи) {
    var к = записи && записи[0] && записи[0].contentRect;
    if (к) приложи(к.width, к.height);
  }
  function приложи(w, h) {
    if (!кан) return;
    var ПЛ = 1, W = Math.max(1, Math.round(w)), H = Math.max(1, Math.round(h));
    if (W === послW && H === послH) return;
    послW = W; послH = H;
    var шир = Math.max(W, H * КШ / КВ);
    м = { W: W, H: H, k: шир / КШ, ox: (W - шир) / 2, oy: 0 };
    кан.width = Math.round(W * ПЛ); кан.height = Math.round(H * ПЛ);
    кт.setTransform(ПЛ, 0, 0, ПЛ, 0, 0);
    рисувай(кт, Math.round(N * .35), м, нощ());           // веднага има кадър (и при намалено движение)
  }
  function цикъл(t) {
    заявка = 0;
    if (!вижда || !наЕкрана || НАМАЛЕНО) return;
    заявка = requestAnimationFrame(цикъл);
    нечетен = !нечетен; if (нечетен || закрито()) return;  // 30 кадъра/с стигат за светлина
    рисувай(кт, Math.floor(t / 1000 * 60) % N, м, нощ());  // страницата избира кадъра
  }
  function пусни() { if (!заявка && !НАМАЛЕНО) заявка = requestAnimationFrame(цикъл); }
  function спри() { if (заявка) { cancelAnimationFrame(заявка); заявка = 0; } }

  function монтирай() {
    var сц = document.getElementById('plScene'), герой = document.querySelector('#plHome .pl-hero');
    if (!сц || !герой) return false;
    if (сц.querySelector('.pl-hero-svetlina')) return true;
    кан = document.createElement('canvas');
    кан.className = 'pl-hero-svetlina';
    кан.setAttribute('aria-hidden', 'true');
    сц.insertBefore(кан, сц.firstChild);
    кт = кан.getContext('2d');
    if ('ResizeObserver' in window) new ResizeObserver(размер).observe(сц);
    else setTimeout(function () { приложи(сц.clientWidth, сц.clientHeight); }, 800);   // стар телефон: веднъж, след старта
    if ('IntersectionObserver' in window) new IntersectionObserver(function (з) {
      наЕкрана = з.some(function (x) { return x.isIntersecting; });
      if (наЕкрана) пусни(); else спри();
    }, { threshold: 0 }).observe(герой);
    document.addEventListener('visibilitychange', function () { вижда = !document.hidden; if (вижда) пусни(); else спри(); });
    new MutationObserver(function () { if (кт && послW) рисувай(кт, Math.round(N * .35), м, нощ()); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    пусни();
    return true;
  }
  var опити = 0;
  (function чакай() { if (!монтирай() && ++опити < 60) setTimeout(чакай, 250); })();

  // ── самопроверка по JMation: цикълът е периодичен и по числа, и по пиксели ──
  window.BL_PL_SVETLINA = {
    N: N,
    проверка: function () {
      var макс = 0;
      for (var s = 0; s < 64; s++) {
        var φ = s / 64;
        for (var i = 0; i < ПРАХ; i++) {
          var a = прашинка(φ, i), б = прашинка(φ + 1, i);
          макс = Math.max(макс, Math.abs(a.x - б.x) * a.а, Math.abs(a.y - б.y) * a.а, Math.abs(a.а - б.а));
        }
        for (var b = 0; b < ЛЪЧИ.length; b++) макс = Math.max(макс, Math.abs(дишане(φ, b) - дишане(φ + 1, b)));
      }
      return макс;
    },
    шев: function () {
      var w = 180, h = 320, мм = { W: w, H: h, k: w / КШ, ox: 0, oy: 0 }, а = document.createElement('canvas'), б = document.createElement('canvas');
      а.width = б.width = w; а.height = б.height = h;
      рисувай(а.getContext('2d'), N, мм, false);
      рисувай(б.getContext('2d'), 0, мм, false);
      var x = а.getContext('2d').getImageData(0, 0, w, h).data, y = б.getContext('2d').getImageData(0, 0, w, h).data, д = 0;
      for (var p = 0; p < x.length; p++) д = Math.max(д, Math.abs(x[p] - y[p]));
      return д;
    },
    рисувай: function (f) { if (кт) рисувай(кт, f, м, нощ()); },
    тече: function () { return !!заявка; }
  };
})();

/* ═══════════════════════════════════════════════════════════════════════════════
   🎀 ТРИТЕ СТАРИ СЕКЦИИ — щрихите в DOM (видът е в premium.css, същото заглавие)
   home.js ги ражда както винаги; тук само:
     · мрежата: изрязва празното около възлите (viewBox) — на телефон над нея стояха
       ~80 px нищо, а надписите бяха 6 px; с изрязването всичко е ~25% по-едро;
     · „Пробвай сега“: плоският SVG балон → плюшеният (през pl-plyush, клас .pl-em);
       полето казваше „…или напиши своя в“ (рязано) → „Твоят въпрос…“; „Питай ➤“ → „Питай“.
   ПЪТ НАЗАД: махни този блок; home.js ги рисува постарому.
   ═══════════════════════════════════════════════════════════════════════════════ */
(function старитеСекции() {
  'use strict';
  var опити = 0;
  function нагласи() {
    var готово = 0;
    var свг = document.querySelector('.netsec .net-svg');
    if (свг) { if (свг.getAttribute('viewBox') === '0 0 640 460') свг.setAttribute('viewBox', '70 44 500 372'); готово++; }
    var ас = document.querySelector('.askme');
    if (ас) {
      var ава = ас.querySelector('.askme-ava');
      if (ава && !ава.querySelector('.pl-em')) {
        ава.innerHTML = '<span class="pl-em" aria-hidden="true">🎈</span>';
        if (window.BL_PL_PLYUSH && BL_PL_PLYUSH.мини) BL_PL_PLYUSH.мини(ава);
      }
      var пол = ас.querySelector('.askme-form input');
      if (пол) пол.placeholder = 'Твоят въпрос…';
      var бут = ас.querySelector('.askme-form button');
      if (бут && /➤/.test(бут.textContent)) бут.textContent = 'Питай';
      готово++;
    }
    return готово === 2;
  }
  (function чакай() { if (!нагласи() && ++опити < 80) setTimeout(чакай, 300); })();
})();

/* ═══════════════════════════════════════════════════════════════════════════════
   🗂️ 20.10 · ПОДРЕДБАТА НА НАЧАЛОТО (gl20)
   Собственикът: „много ми е дървено началото… ултимативна организация като начало… да не е бавно,
   гадно, грозно или дървено“. Мерено преди (dev/proba/gl20_predi_diag.log): 14 544 px, стаите ДВА
   пъти, помощничките ТРИ пъти, „Днес“ = 15 неща едно под друго, без йерархия.
   Тук САМО се подрежда — нищо не се трие, нищо от чуждите модули не се пренаписва:
     · НАПОМНЯНЕТО: най-важното от „Днес“ (ваксината първа) идва горе, под „Добави момент“; бутонът
       натиска ИСТИНСКИЯ (home2.js / rooms2.js), а истинският се прибира, за да не стои два пъти;
     · „ДНЕС“ = 3 карти — „Днес“ (бебето) · „Под ръка“ · „За теб, мамо“; извън първите редове — „още ▾“.
       Елементите НЕ се местят (модулите им пишат в .td-inner с insertBefore) — само получават ред
       (style.order) и група (data-pl-dg); картите ги рисува css/premium.css („20.10 · подредбата“);
     · СТАИТЕ: „Деветте вълшебни стаи“ стои прибрана; „Всички отблизо ▾“ в рафта я донася В рафта
       (веднъж, при първия допир); отметките на firstday.js („сега е времето“, „спи до раждането“)
       светват и на арките, за да не се губят;
     · „ОЩЕ ЗА БЕЙБИ ЛЕНД“: шестте секции на старата рекламна страница стават редове — един допир и
       секцията се разгъва цялата, такава, каквато си беше.
   ПЪТ НАЗАД: махни този блок и правилата „20.10 · подредбата“ в css/premium.css.
   ═══════════════════════════════════════════════════════════════════════════════ */
(function подредбата() {
  'use strict';
  if (window.BL_PL_GL20) return;
  var корен = document.documentElement;
  корен.classList.add('pl-gl20');
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (ч) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ч]; }); };

  // ── 1 · НАПОМНЯНЕТО ──
  var ВАЖНИ = ['.big-now.big-hot', '.td-chip.td-ev', '.td-chip.td-accent[data-room="Здраве и SOS"]', '.big-now'];
  var взето = null, подписНп = '';
  function напомняне(ин) {
    var б = document.getElementById('plNapomni'); if (!б) return;
    var е = null;
    // 🪤 21.10 ВИДЯНО (gl20_sled_L_00): „Важно днес“ показваше „Хепатит Б (1-ви прием) + БЦЖ — отбелязана ли е? ·
    //   20.03.2026“ на 7-месечно бебе — въпросът на календара за НЕотметната минала ваксина (rooms5.js) не е „днес“.
    //   Такъв въпрос остава в „Днес“ отдолу, но горе не се качва. ПЪТ НАЗАД: върни „е = ин.querySelector(ВАЖНИ[i])“.
    var минало = function (x) { return /отбелязан[аио]? ли е/i.test(x.textContent || ''); };
    if (ин && !ин.classList.contains('td-welcome')) for (var i = 0; i < ВАЖНИ.length && !е; i++) {
      var кандидати = ин.querySelectorAll(ВАЖНИ[i]);
      for (var j = 0; j < кандидати.length && !е; j++) if (!минало(кандидати[j])) е = кандидати[j];
    }
    if (взето && взето !== е) взето.classList.remove('pl-np-vzeto');
    взето = е;
    if (!е) { if (!б.hidden) б.hidden = true; return; }
    if (!е.classList.contains('pl-np-vzeto')) е.classList.add('pl-np-vzeto');
    // 🪤 мерено (gl20_sled_D_00, 00:03 ч.): при хапче (td-chip) иконката беше празно кръгче, а емоджито стоеше
    //   голо в заглавието. Сега знакът се взима отпред на текста и става ПЛЮШЕН тук (BL_PL_PLYUSH.мини), не копие.
    var ЗНАК = /^\s*(\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}|\p{Emoji_Modifier})*)\s*/u;
    var гл = е.querySelector('.bn-txt strong'), под = е.querySelector('.bn-s'), ик = е.querySelector('.bn-e');
    var т = гл ? гл.textContent.trim() : (е.textContent || '').replace(/\s+/g, ' ').trim();
    var знак = ик ? (ик.textContent || '').trim() : '';
    var м = т.match(ЗНАК); if (м) { if (!знак) знак = м[1]; т = т.slice(м[0].length); }
    var с = под ? под.textContent.trim() : '';
    var горещо = е.classList.contains('big-hot') || е.classList.contains('td-accent') || е.classList.contains('td-ev');
    var подпис = т + '|' + с + '|' + горещо + '|' + знак;
    if (подпис !== подписНп) {
      подписНп = подпис;
      б.className = 'pl-napomni' + (горещо ? ' is-hot' : '');
      б.innerHTML = '<span class="pl-np-i" aria-hidden="true">' + (знак ? '<span class="pl-em">' + esc(знак) + '</span>' : '') + '</span>' +
        '<span class="pl-np-t"><small class="pl-np-k">' + (горещо ? 'Важно днес' : 'Сега') + '</small><b>' + esc(т) + '</b>' + (с ? '<span>' + esc(с) + '</span>' : '') + '</span>' +
        '<em aria-hidden="true">›</em>';
      б.setAttribute('aria-label', (горещо ? 'Важно днес: ' : '') + т + (с ? ' — ' + с : ''));
      var слот = б.querySelector('.pl-np-i');
      try { if (знак && window.BL_PL_PLYUSH && BL_PL_PLYUSH.мини) BL_PL_PLYUSH.мини(слот); } catch (x) {}
    }
    if (б.hidden) б.hidden = false;
  }
  function напомни() { if (взето && взето.isConnected) взето.click(); }

  // ── 2 · „ДНЕС“ В ТРИ КАРТИ ──
  var ГРУПИ = [
    { к: 'a', загл: null, видими: ['.td-top', '.big-now', '.td-cheer', '.td-tip'], скрити: ['.td-game', '.td-trick', '.td-myth'], още: 'за бебето' },
    { к: 'c', загл: ['Под ръка', 'едно докосване — и знаеш'], видими: ['.td-chips', '.ch-card'], скрити: [] },
    { к: 'b', загл: ['За теб, мамо', 'малки неща само за теб'], видими: ['.wk-card', '.fd-tone'], скрити: ['.brief-card', '.qa-card', '.fd-q30', '.t8-row'], още: 'за теб' }
  ];
  var отворени = {};
  var подписДн = '';
  function мое(е) { return е.classList.contains('pl-dg-hh') || е.classList.contains('pl-dg-more'); }
  function подредиДнес() {
    var ин = document.querySelector('#todaySection .td-inner');
    напомняне(ин);
    if (!ин || ин.classList.contains('td-welcome')) return;
    var деца = [].slice.call(ин.children).filter(function (е) { return !мое(е); });
    var подпис = деца.map(function (е) { return е.className; }).join('|') + '#' + JSON.stringify(отворени) + (взето ? взето.className : '');
    if (подпис === подписДн && ин.querySelector(':scope > .pl-dg-hh')) return;     // нищо ново
    подписДн = подпис;
    ин.classList.add('pl-dg');
    // 1-ви ход: всяка група си взима своите; 2-ри ход: непознатото — видимо в първата карта (нищо не се губи).
    //   🪤 мерено (gl20_c1): в един ход първата група прибираше като „непознати“ и чуждите — всичко отиде в „Днес“.
    var разпределени = new Set(), поГрупи = ГРУПИ.map(function () { return []; });
    ГРУПИ.forEach(function (г, gi) {
      function вземи(сел, скрит) {
        деца.forEach(function (е) {
          if (разпределени.has(е) || !е.matches(сел)) return;
          разпределени.add(е); поГрупи[gi].push({ е: е, скрит: скрит });
        });
      }
      г.видими.forEach(function (с) { вземи(с, false); });
      г.скрити.forEach(function (с) { вземи(с, true); });
    });
    деца.forEach(function (е) { if (!разпределени.has(е)) { разпределени.add(е); поГрупи[0].push({ е: е, скрит: false }); } });
    ГРУПИ.forEach(function (г, gi) {
      var база = (gi + 1) * 100, видимиБр = 0, скритиБр = 0, първо = null, последно = null;
      var хедър = ин.querySelector(':scope > .pl-dg-hh[data-pl-dg="' + г.к + '"]');
      var още = ин.querySelector(':scope > .pl-dg-more[data-pl-dg="' + г.к + '"]');
      var членове = поГрупи[gi].filter(function (м) { return !м.е.classList.contains('pl-np-vzeto'); });
      if (!членове.length) { if (хедър) хедър.remove(); if (още) още.remove(); return; }
      if (г.загл) {
        if (!хедър) {
          хедър = document.createElement('div'); хедър.className = 'pl-dg-hh'; хедър.dataset.plDg = г.к;
          хедър.innerHTML = '<b>' + esc(г.загл[0]) + '</b><small>' + esc(г.загл[1]) + '</small>';
          ин.appendChild(хедър);
        }
        хедър.style.order = база; първо = хедър;
      }
      var отв = !!отворени[г.к];
      членове.forEach(function (м, i) {
        var е = м.е;
        е.dataset.plDg = г.к;
        е.style.order = база + (м.скрит ? 50 : 1) + i;
        var крий = м.скрит && !отв;
        if (е.classList.contains('pl-dg-skrit') !== крий) е.classList.toggle('pl-dg-skrit', крий);
        if (м.скрит) скритиБр++; else видимиБр++;
        if (!крий) { if (!първо) първо = е; последно = е; }
      });
      if (скритиБр) {
        if (!още) {
          още = document.createElement('button'); още.type = 'button'; още.className = 'pl-dg-more'; още.dataset.plDg = г.к;
          още.addEventListener('click', function () { отворени[г.к] = !отворени[г.к]; подредиДнес(); });
          ин.appendChild(още);
        }
        още.style.order = база + 99;
        още.setAttribute('aria-expanded', String(отв));
        още.innerHTML = отв ? 'Прибери <i aria-hidden="true">▴</i>' : 'Още ' + скритиБр + ' ' + esc(г.още) + ' <i aria-hidden="true">▾</i>';
        последно = още;
      } else if (още) още.remove();
      // краищата на картата: горе (заглавие или първият ред) и долу (последният видим ред или „още“)
      [].forEach.call(ин.querySelectorAll(':scope > [data-pl-dg="' + г.к + '"]'), function (е) {
        е.classList.toggle('pl-dg-h', е === първо);
        е.classList.toggle('pl-dg-end', е === последно);
      });
    });
  }

  // ── 3 · СТАИТЕ ОТБЛИЗО — една стъпка от рафта ──
  function стаите(принудено) {
    var б = document.querySelector('#plHome [data-pl="vse"]'), к = document.getElementById('plStaiVse'), с = document.getElementById('стаите');
    if (!б || !к) return;
    if (с && с.parentNode !== к) {                           // веднъж, при първия допир; дотогава стои прибрана в <main>
      к.appendChild(с);
      // 🪤 мерено (gl20_c3D_t01): pl-poyava.js я беше скрила (pl-pv), докато стоеше прибрана — тук се показва веднага
      с.classList.remove('pl-pv'); с.dataset.plPv = '1';
      var прибери = document.createElement('button'); прибери.type = 'button'; прибери.className = 'pl-vse pl-vse-dolu';
      прибери.innerHTML = 'Прибери стаите <i aria-hidden="true">▴</i>';
      прибери.addEventListener('click', function () { стаите(false); var п = document.querySelector('#plHome .pl-shelf'); if (п) п.scrollIntoView({ block: 'start', behavior: 'smooth' }); });
      к.appendChild(прибери);
    }
    var отв = typeof принудено === 'boolean' ? принудено : к.hidden;
    к.hidden = !отв;
    б.setAttribute('aria-expanded', String(отв));
    б.innerHTML = отв ? 'Прибери стаите <i aria-hidden="true">▴</i>' : 'Всички стаи отблизо <i aria-hidden="true">▾</i>';
    корен.classList.toggle('pl-stai-otv', отв);
    if (отв && с) [].forEach.call(с.querySelectorAll('.reveal'), function (е) { е.classList.add('shown'); });
  }
  function отметки() {
    [].forEach.call(document.querySelectorAll('#plHome .pl-room[data-room]'), function (п) {
      var к = document.querySelector('.room-card[data-room="' + п.getAttribute('data-room') + '"]');
      var сега = !!(к && к.classList.contains('fd-glow')), спи = !!(к && к.classList.contains('fd-sleep'));
      if (п.classList.contains('pl-sega') !== сега) п.classList.toggle('pl-sega', сега);
      if (п.classList.contains('pl-spi-st') !== спи) п.classList.toggle('pl-spi-st', спи);
      var т = к && к.querySelector('.fd-nowtag');
      var ар = 'Стая ' + (п.textContent || '').trim() + (сега && т ? ' — ' + т.textContent.trim() : '') + (спи ? ' — събужда се с бебето' : '');
      if (п.getAttribute('aria-label') !== ар) п.setAttribute('aria-label', ар);
    });
  }

  // ── 4 · „ОЩЕ ЗА БЕЙБИ ЛЕНД“ ──
  var СТАРИ = [
    ['.netsec', 'Какво може Помощникът на мама', 'картата на всичко, което знае'],
    ['.askme', 'Пробвай сега', 'попитай като приятелка'],
    ['#помощничките', 'Хорото на помощничките', 'деветте феи, хванати за ръце'],
    ['#дневник', 'А ти как си днес?', 'пет личица за настроението'],
    ['.faq', 'Питат ни често', 'кратки, честни отговори'],
    ['#инсталирай', 'Добави ме на телефона', 'без Google Play — за 10 секунди']
  ];
  function прибериСтарите() {
    var main = document.querySelector('main'); if (!main) return false;
    var редът = [];
    СТАРИ.forEach(function (р) {
      var с = main.querySelector(':scope > ' + р[0]); if (!с) return;
      редът.push(с);
      if (с.querySelector(':scope > .pl-svit-b')) return;
      с.classList.add('pl-svit');
      var б = document.createElement('button'); б.type = 'button'; б.className = 'pl-svit-b'; б.setAttribute('aria-expanded', 'false');
      б.innerHTML = '<span class="pl-svit-t"><b>' + esc(р[1]) + '</b><small>' + esc(р[2]) + '</small></span><i aria-hidden="true">▾</i>';
      б.addEventListener('click', function () {
        var отв = !с.classList.contains('pl-svit-on');
        с.classList.toggle('pl-svit-on', отв);
        б.setAttribute('aria-expanded', String(отв));
        if (отв) [].forEach.call(с.querySelectorAll('.reveal'), function (е) { е.classList.add('shown'); });
      });
      с.insertBefore(б, с.firstChild);
    });
    if (!редът.length) return false;
    var заглавие = main.querySelector(':scope > .pl-oshte-h');
    if (!заглавие) { заглавие = document.createElement('h2'); заглавие.className = 'pl-oshte-h'; заглавие.textContent = 'Още за Бейби Ленд'; }
    if (заглавие.nextElementSibling !== редът[0]) main.insertBefore(заглавие, редът[0]);
    редът.forEach(function (с, i) { с.classList.toggle('pl-svit-1', i === 0); с.classList.toggle('pl-svit-z', i === редът.length - 1); });
    return редът.length === СТАРИ.length;
  }

  // ── кога ──
  var чака = 0;
  function отложено() { if (чака) return; чака = requestAnimationFrame(function () { чака = 0; подредиДнес(); }); }
  var наблИн = null;
  function слушай() {
    var дн = document.getElementById('todaySection'); if (!дн) return;
    // rooms2.js сменя .td-inner цял (innerHTML); модулите добавят деца в него — следим само тези две нива
    new MutationObserver(function () { закачи(); отложено(); }).observe(дн, { childList: true });
    function закачи() {
      var ин = дн.querySelector(':scope > .td-inner');
      if (наблИн && наблИн.__ин === ин) return;
      if (наблИн) наблИн.disconnect();
      if (!ин) return;
      наблИн = new MutationObserver(отложено); наблИн.__ин = ин;
      наблИн.observe(ин, { childList: true });
    }
    закачи();
  }
  // ── 5 · ПОЯВАТА на рафта и лентата: веднъж, когато влязат в кадър (css: .pl-vh) ──
  //   Само при наблюдател и без „по-малко движение“ — иначе нищо не се крие изобщо.
  var вх = null;
  function появата() {
    if (!вх) {
      if (!('IntersectionObserver' in window) || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
      вх = new IntersectionObserver(function (з) {
        з.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('pl-vh'); вх.unobserve(x.target); } });
      }, { threshold: .12 });
      корен.classList.add('pl-gl20-io');
    }
    [].forEach.call(document.querySelectorAll('#plHome .pl-shelf:not(.pl-vh), #plHome .pl-pomosht:not(.pl-vh)'), function (е) {
      if (!е.dataset.plVh) { е.dataset.plVh = '1'; вх.observe(е); }
    });
  }
  function всичко() { прибериСтарите(); подредиДнес(); отметки(); }
  // 🪤 мерено (gl20_sled_diag, машината под товар: DOMContentLoaded чак на 54-та секунда): резервният таймер
  //   от 1.5 s тръгваше ПРЕДИ DOMContentLoaded, „тръгна“ ставаше true и истинският старт после се пропускаше —
  //   секциите на home.js („Какво може“, „Пробвай“, хорото, въпросите) идваха след това и оставаха разгънати.
  //   Сега: всичко() е идемпотентно и тече на DOMContentLoaded, на load и при всяко ново дете на <main>.
  var слуша = false;
  function старт() {
    всичко(); появата();
    if (слуша) return; слуша = true;
    слушай();
    var main = document.querySelector('main'), чакаМ = 0;
    if (main) new MutationObserver(function () { if (чакаМ) return; чакаМ = requestAnimationFrame(function () { чакаМ = 0; прибериСтарите(); отметки(); }); }).observe(main, { childList: true });
  }
  появата();
  // home.js ражда секциите на DOMContentLoaded — нашият слушател е записан след неговия, значи идва след него
  if (document.readyState === 'complete') старт();
  else { document.addEventListener('DOMContentLoaded', старт); window.addEventListener('load', старт); }
  setTimeout(отметки, 4500);
  window.BL_PL_GL20 = { стаите: стаите, напомни: напомни, подреди: всичко };
})();
