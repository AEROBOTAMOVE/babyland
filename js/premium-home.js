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
      return { име: име || 'Нашето бебе', ред: бр ? 'очакваме те с любов' : 'разкажи ми за бебето', знак: бр ? '🤰' : '👶' };
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

  function отвори(стая) { try { if (window.MamaHelper && MamaHelper.open) MamaHelper.open(стая); } catch (e) {} }
  function добави() { const б = document.getElementById('plus-btn'); if (б) б.click(); }

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
          '<span class="pl-baby-av" aria-hidden="true">' + б.знак + '</span>' +
          '<span><b>' + esc(б.име) + ' · ' + esc(б.ред) + '</b><small id="plToday">' + esc(днес()) + '</small></span>' +
          '<span class="pl-baby-go" aria-hidden="true">›</span>' +
        '</button>' +
      '</div>' +
      '<div class="pl-card">' +
        '<div class="pl-card-h"><span aria-hidden="true">☀️</span> Нашият ден</div>' +
        '<div class="pl-day">' +
          '<button type="button" class="pl-day-it t-feed" data-pl="add"><i aria-hidden="true">🍼</i>Хранене<span>+ запиши</span></button>' +
          '<button type="button" class="pl-day-it t-sleep" data-pl="add"><i aria-hidden="true">🌙</i>Сън<span>+ запиши</span></button>' +
          '<button type="button" class="pl-day-it t-diaper" data-pl="add"><i aria-hidden="true">🧷</i>Пелени<span>+ запиши</span></button>' +
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
        '<i aria-hidden="true">🎈</i>' +
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
  }
  function опресни() {
    const п = document.getElementById('plGreet'); if (п) п.textContent = поздрав();
    const д = document.getElementById('plToday'); if (д) д.textContent = днес();
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
  window.BL_PREMIUM_HOME = { опресни };
})();
