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
  const СТАИ = [
    { стая: 'Бременност', надпис: 'Бременност', знак: '🤰', клас: 'c-preg', рис: 'room-preg' },
    { стая: 'Моето бебе', надпис: 'Моето бебе', знак: '👶', клас: 'c-baby', рис: 'room-baby' },
    { стая: 'Захранване', надпис: 'Захранване', знак: '🥣', клас: 'c-feed', рис: 'room-feed' },
    { стая: 'Здраве и SOS', надпис: 'Здраве', знак: '🩺', клас: 'c-health', рис: 'room-health' },
    { стая: 'Дневник на мама', надпис: 'Дневник', знак: '📖', клас: 'c-diary', рис: 'room-diary' },
    { стая: 'Развитие и игри', надпис: 'Игри', знак: '🧸', клас: 'c-play', рис: 'room-play' },
    { стая: 'Инструменти', надпис: 'Инструменти', знак: '🧰', клас: 'c-tools', рис: 'room-tools' },
    { стая: 'Жената в мен', надпис: 'За мама', знак: '☕', клас: 'c-mom', рис: 'room-mom' },
    { стая: 'Лабораторията', надпис: 'Лаборатория', знак: '🧪', клас: 'c-lab', рис: 'room-lab' },
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
    if (с && с.d === д && Array.isArray(с.segs)) сънМин = Math.floor(с.segs.reduce((а, x) => а + Math.max(0, (x.e || 0) - (x.s || 0)), 0) / 60000);
    if (с && с.open && сега - с.open > 0 && сега - с.open <= 14 * 3600000) { спи = Math.floor((сега - с.open) / 60000); сънМин += спи; }
    const п = (чети('bl_diapers', {}) || {})[д];
    const пелени = п ? (+п.wet || 0) + (+п.dirty || 0) : 0;
    return {
      храна: днешни.length ? днешни.length + '× · преди ' + чч(Math.max(0, Math.floor((сега - последно) / 60000))) : '+ запиши',
      сън: с && с.open && спи ? 'спи от ' + чч(спи) : сънМин ? чч(сънМин) + ' днес' : '+ запиши',
      пелени: пелени ? пелени + ' днес' : '+ запиши',
      има: { храна: !!днешни.length, сън: !!сънМин, пелени: !!пелени },
      // компактният ред по референция 20: голямо (час / време / брой) + малък надпис
      кратко: {
        храна: днешни.length ? { г: чм(днешни[днешни.length - 1]), п: 'Хранене · ' + днешни.length + '×' } : { г: '+', п: 'Хранене' },
        сън: с && с.open && спи ? { г: чч(спи), п: 'спи сега' } : сънМин ? { г: чч(сънМин), п: 'Сън днес' } : { г: '+', п: 'Сън' },
        пелени: пелени ? { г: String(пелени), п: 'Пелени днес' } : { г: '+', п: 'Пелени' },
      },
    };
  }
  function броячи() {
    const д = денят();
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
          '<h1><span id="plGreet">' + esc(поздрав()) + '</span>,<br>мамо! <span class="pl-heart" aria-hidden="true">♡</span></h1>' +
          '<p>Малки стъпки. Голям свят.</p>' +
        '</div>' +
        '<button type="button" class="pl-baby" id="plBaby" aria-label="Отвори стаята на бебето">' +
          '<span class="pl-baby-av pl-art-av" aria-hidden="true" style="background-image:url(img/art/' + (б.бр ? 'ico-a.webp);background-position:0% 0%' : 'ico-d.webp);background-position:0% 33.333%') + '">' + б.знак + '</span>' +
          '<span><b>' + esc(б.име) + ' · ' + esc(б.ред) + '</b><small id="plToday">' + esc(днес()) + '</small></span>' +
          '<span class="pl-baby-go" aria-hidden="true">›</span>' +
        '</button>' +
      '</div>' +
      '<div class="pl-card">' +
        '<div class="pl-card-h"><i class="pl-art pl-sun" aria-hidden="true" style="background-image:url(img/art/ico-d.webp);background-position:0% 0%"></i> Нашият ден<button type="button" class="pl-all" data-room="Моето бебе">Виж всички ›</button></div>' +
        '<div class="pl-day">' +
          '<button type="button" class="pl-day-it t-feed" data-room="Моето бебе"><i class="pl-art" aria-hidden="true" style="background-image:url(img/art/ico-a.webp);background-position:0% 33.333%"></i><span class="pl-day-t"><b id="plDayFeed" aria-live="polite">+</b><small>Хранене</small></span></button>' +
          '<button type="button" class="pl-day-it t-sleep" data-room="Моето бебе"><i class="pl-art" aria-hidden="true" style="background-image:url(img/art/ico-a.webp);background-position:33.333% 33.333%"></i><span class="pl-day-t"><b id="plDaySleep" aria-live="polite">+</b><small>Сън</small></span></button>' +
          '<button type="button" class="pl-day-it t-diaper" data-room="Моето бебе"><i class="pl-art" aria-hidden="true" style="background-image:url(img/art/ico-b.webp);background-position:100% 100%"></i><span class="pl-day-t"><b id="plDayDiaper" aria-live="polite">+</b><small>Пелени</small></span></button>' +
        '</div>' +
      '</div>' +
      '<button type="button" class="pl-cta" data-pl="add"><b aria-hidden="true">+</b>Добави момент</button>' +
      '<h2 class="pl-h2">Влез в своята стая</h2>' +
      '<div class="pl-shelf"><div class="pl-rooms">' +
        СТАИ.map(р => '<button type="button" class="pl-room ' + р.клас + '" data-room="' + esc(р.стая) + '" aria-label="Стая ' + esc(р.надпис) + '">' +
          '<span class="pl-arch" aria-hidden="true"><img src="img/art/' + р.рис + '.webp" alt="" loading="lazy" decoding="async" width="160" height="160"></span>' +
          '<span>' + esc(р.надпис) + '</span></button>').join('') +
      '</div></div>' +
      '<button type="button" class="pl-mira" data-room="Моето бебе">' +
        '<i class="pl-art pl-mira-av" aria-hidden="true" style="background-image:url(img/art/ico-e.webp);background-position:33.333% 66.667%"></i>' +
        '<span><b>Мира е до теб</b><small>Отговори, подкрепа и полезни съвети.</small></span>' +
        '<em>Попитай ›</em>' +
      '</button>';

    с.addEventListener('click', e => {
      const ст = e.target.closest('[data-room]');
      if (ст) { отвори(ст.getAttribute('data-room')); return; }
      if (e.target.closest('[data-pl="add"]')) { добави(); return; }
      if (e.target.closest('#plBaby')) отвори('Моето бебе');
    });
    return с;
  }

  function сложи() {
    const main = document.querySelector('main');
    if (!main || document.getElementById('plHome')) return;
    main.parentNode.insertBefore(рисувай(), main);
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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', сложи); else сложи();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) опресни(); });
  window.BL_PREMIUM_HOME = { опресни, денят };
})();
