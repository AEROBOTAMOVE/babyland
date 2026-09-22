/* ═══════════════════════════════════════════════════════════════════════════════
   🤰 PREMIUM „С ВСЯКА СЕДМИЦА ПО-БЛИЗО“ · стаята „Бременност“ (референция 4) · 22.09.2026
   Веднага под банера (.pl-rhero от premium-rooms.js) в #roRoom:
     · „Избери седмица от бременността“ — лента с кръгчета 4…42 (текущата — голяма розова),
       ‹ › за движение, лентата се плъзга и с пръст;
     · карта „24-та седмица · Втори триместър“ с текста за седмицата и хапчета „За бебето / За мен“
       — ТЕКСТЪТ Е СЪЩИЯТ като в старата карта „Тази седмица“ (BL_DATA.pregNotes / pregWeeks,
       BL_PREG20.РАЗМЕРИ); тук не е написано нито едно медицинско изречение;
     · „Предстоящи записи“ — датите от bl_events (онези, които пишат „Прегледът“ и „Какво предстои“)
       + следващият ориентир от „Календарчето на прегледите“; „Добави запис“ води до полето за дата;
     · три плочки: „Моят календар“ · „Чанта за родилното“ · „Въпроси към лекаря“ — скачат до
       СЪЩЕСТВУВАЩИТЕ карти в стаята (разгъват сгънатата с НЕЙНИЯ бутон ▾).
   НИЩО НЕ ЗАПИСВА. Нито един нов ключ в localStorage. Гледаната седмица и „бебето/мен“ живеят
   само в паметта на страницата (на елемента #roRoom) и се връщат към твоята седмица при ново отваряне.
   Старата карта „Тази седмица“ (.pg20-hero) остава построена и жива — CSS я крие САМО докато
   този блок показва същото (виж css/pl-bremennost.css, правилото с `~`).
   Пауза на очакването (expect.js) → блокът НЕ се показва изобщо. Родила без дата → също.
   22.09 (вечер) · СЦЕНАТА И МАТЕРИАЛИТЕ (css/pl-ui.css): картите са .pl-felt (филц с шев),
   главното действие е .pl-gel (Добави запис, Въведи датата, избраната седмица, избраното хапче),
   второстепенното — .pl-soft (кръгчетата на седмиците, ‹ ›, редовете, ↩). Кръгчето е „мънисто“
   (span) в 44-пикселов бутон — докосването остава 44, а между мънистата се вижда шевът с точица.
   Плочките са сглобени от 2–3 плюшени иконки (календар+молив; чантичка+мече+шише; облак+балонче).
   ПЪТ НАЗАД: махни <link href="css/pl-bremennost.css"> и <script src="js/pl-bremennost.js">
   от index.html — старата „Тази седмица“ се връща сама (тя никога не е махана).
   ═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.BL_PL_BREMENNOST) return;

  // Чете като load() в preg20.js:22 — повреден запис или сменен тип = стойността по подразбиране.
  const чети = (к, по) => {
    try {
      const v = JSON.parse(localStorage.getItem(к));
      if (v == null) return по;
      if (Array.isArray(по) !== Array.isArray(v)) return по;
      if (по && typeof по === 'object' && (!v || typeof v !== 'object')) return по;
      return v;
    } catch (e) { return по; }
  };
  const esc = т => String(т == null ? '' : т).replace(/[&<>"']/g, з => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[з]));
  const редна = n => (window.BL_REDNA ? BL_REDNA(n) : n + '-та');
  const МЕС = ['яну', 'фев', 'мар', 'апр', 'май', 'юни', 'юли', 'авг', 'сеп', 'окт', 'ное', 'дек'];
  const ОТ = 4, ДО = 42;                 // същите граници като прелистването в preg20.js:129 и :155
  const тихо = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const спрайт = (лист, ред, кол) => 'background-image:url(img/art/' + лист + '.webp);background-position:' + (кол * 100 / 3) + '% ' + (ред * 100 / 3) + '%';
  // 🪤 в JS пътят е спрямо СТРАНИЦАТА (img/art/…); в CSS файла би бил спрямо css/ → 404.

  // ── състоянието: кой вид блок (или никакъв) ──
  //   Пауза: expect.js:26 (bl_expect_paused === '1'). Датата: BL_EXPECT.lmp() — единственият вратар (expect.js:31).
  //   Родила: preg20.js:32 (bl_baby.birth). Седмицата: BL_PREG20.седмица() — СЪЩАТА функция, която
  //   рисува старата „Тази седмица“ (preg20.js:33-44, изнесена на :952) → едно число на екрана.
  function състояние() {
    if (window.BL_EXPECT && BL_EXPECT.paused()) return { вид: 'нищо' };
    const л = window.BL_EXPECT ? BL_EXPECT.lmp() : String(чети('bl_lmp', '') || '');
    if (!л) {
      let роди = false; try { роди = !!(JSON.parse(localStorage.getItem('bl_baby') || '{}') || {}).birth; } catch (e) {}
      return роди ? { вид: 'нищо' } : { вид: 'покана', w: 0 };
    }
    const w = window.BL_PREG20 ? BL_PREG20.седмица() : 0;
    // извън 1…45 = „датата не се връзва“ (preg20.js:68-69) — там стои честната карта на preg20, не ние
    if (!(w >= 1 && w <= 45)) return { вид: 'нищо' };
    if (w > ДО) return { вид: 'късно', w };   // 43–45: няма данни за седмицата; старата карта казва своето
    return { вид: 'седмица', w };
  }

  // ── данните за една седмица — правилата са преписани от preg20.js:129-148 ──
  function данни(пв) {
    const D = window.BL_DATA || {};
    const плод = (D.pregWeeks || {})[пв] || null;                                   // data.js:11
    let ключ = 4; Object.keys(D.pregNotes || {}).map(Number).forEach(k => { if (k <= пв) ключ = k; });   // preg20.js:131
    const бел = (D.pregNotes || {})[ключ] || {};                                   // data.js:26
    const Р = (window.BL_PREG20 && BL_PREG20.РАЗМЕРИ) || {};
    const кк = Object.keys(Р).map(Number).filter(k => k <= пв).sort((a, b) => b - a)[0];   // preg20.js:83-86
    const рз = кк != null ? Р[кк] : null;
    const мярка = кк != null && кк <= 18 ? 'теме-опашка' : 'теме-пета';           // preg20.js:97-100 (по КОФАТА)
    const три = пв <= 13 ? 'Първи' : пв <= 27 ? 'Втори' : 'Трети';                  // preg20.js:134
    return { плод, бел, рз, мярка, три };
  }
  const тегло = г => г >= 1000 ? (г / 1000).toFixed(1) + ' кг' : г + ' г';        // preg20.js:143

  // ── иконки (линейни, currentColor) ──
  const СТРЕЛКА = д => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + (д < 0 ? 'M14.5 5.5 8 12l6.5 6.5' : 'M9.5 5.5 16 12l-6.5 6.5') + '" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const БЕБЕ = '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12.6" r="8"/><path d="M12 4.6c-1.6 0-2.3 1.2-1.6 2 .6.6 1.8.3 1.9-.6"/><path d="M9.4 15.4c1.5 1.3 3.7 1.3 5.2 0"/></g><circle cx="9.2" cy="11.8" r="1.05" fill="currentColor"/><circle cx="14.8" cy="11.8" r="1.05" fill="currentColor"/></svg>';
  const МАМА = '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6.4" r="3.2"/><path d="M6.8 21c.2-3.6 1.4-6.6 3.2-8.2M17.2 21c-.2-2.2-.8-3.9-1.8-5.2"/><path d="M12.4 12.2c2.6 0 4.4 1.7 4.4 3.9 0 2-1.6 3.4-3.9 3.4"/></g></svg>';
  const КАЛЕНДАР = '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></g><circle cx="8.5" cy="14" r="1.1" fill="currentColor"/><circle cx="12" cy="14" r="1.1" fill="currentColor"/><circle cx="15.5" cy="14" r="1.1" fill="currentColor"/></svg>';
  const ШЕВРОН = '<span class="pl-br-chev" aria-hidden="true">' + СТРЕЛКА(1) + '</span>';

  // ═══ 1. КАРТАТА НА СЕДМИЦАТА ═══
  function седмицаHTML(w) {
    let бутони = '';
    for (let н = ОТ; н <= ДО; н++) {
      // бутонът е 44×44 (докосването); видимото мънисто е вътрешният span с материала (.pl-soft / .pl-gel)
      бутони += '<button type="button" class="pl-br-wk' + (н === w ? ' is-now' : '') + '" data-wk="' + н + '" aria-pressed="false" aria-label="' +
        редна(н) + ' седмица' + (н === w ? ' — твоята' : '') + '"><span class="pl-br-bead pl-soft">' + н + '</span></button>';
    }
    return '<div class="pl-br-card pl-br-wcard pl-felt">' +
      '<h3 class="pl-br-h">Избери седмица от бременността</h3>' +
      '<div class="pl-br-strip">' +
        '<button type="button" class="pl-br-arr" data-d="-1" aria-label="Предишна седмица"><span class="pl-soft">' + СТРЕЛКА(-1) + '</span></button>' +
        // .pl-br-track е кремавото хапче (неподвижно); вътре .pl-br-rail се плъзга (с пръст или от ‹ ›)
        '<div class="pl-br-track"><div class="pl-br-rail" role="group" aria-label="Седмиците от 4-та до 42-ра">' + бутони + '</div></div>' +
        '<button type="button" class="pl-br-arr" data-d="1" aria-label="Следваща седмица"><span class="pl-soft">' + СТРЕЛКА(1) + '</span></button>' +
      '</div>' +
      '<div class="pl-br-week">' +
        // златната рамка (.pl-br-art) → утробата (.pl-br-womb, реже бебето по овала) → плюшеното бебе ico-d [0,1]
        '<div class="pl-br-art" aria-hidden="true"><span class="pl-br-womb"><i style="' + спрайт('ico-d', 0, 1) + '"></i></span><em class="pl-br-fruit"></em></div>' +
        '<div class="pl-br-wt">' +
          '<h4 class="pl-br-num"><b></b><span></span></h4>' +
          '<p class="pl-br-tri"></p>' +
          '<p class="pl-br-txt" aria-live="polite"></p>' +
        '</div>' +
      '</div>' +
      '<div class="pl-br-seg" role="group" aria-label="Чий е текстът за седмицата">' +
        '<button type="button" class="pl-br-pill pl-gel" data-k="baby" aria-pressed="true"><i>' + БЕБЕ + '</i>За бебето</button>' +
        '<button type="button" class="pl-br-pill" data-k="mama" aria-pressed="false"><i>' + МАМА + '</i>За мен</button>' +
      '</div>' +
      '<p class="pl-br-size"></p>' +
      '<p class="pl-br-tip"></p>' +
      '<div class="pl-br-you" hidden><span></span><button type="button" class="pl-br-back pl-soft">↩ Към моята седмица</button></div>' +
    '</div>';
  }

  // 🪤 Всяка промяна на DOM е мутация → наблюдателят ни вика пак. Пишем САМО при разлика.
  const текст = (е, т) => { if (е && е.textContent !== т) е.textContent = т; };
  const атр = (е, и, т) => { if (е && е.getAttribute(и) !== т) е.setAttribute(и, т); };
  const клас = (е, к, да) => { if (е && е.classList.contains(к) !== !!да) е.classList.toggle(к, !!да); };
  const скрий = (е, да) => { if (е && е.hidden !== !!да) е.hidden = !!да; };

  function рисувайСедмица(б, анимирай) {
    const корен = б.parentElement;
    const пам = (корен && корен._plBr) || { гл: +б.getAttribute('data-w') || ОТ, кой: 'baby' };
    const w = +б.getAttribute('data-w');
    const пв = Math.max(ОТ, Math.min(ДО, пам.гл));
    const д = данни(пв);
    // бебето / аз — ако някой ден липсва единият текст, хапчето му се крие
    const има = { baby: !!д.бел.baby, mama: !!д.бел.mama };
    let кой = пам.кой; if (!има[кой]) кой = има.baby ? 'baby' : 'mama';
    // избраното хапче е розов гел (.pl-gel от pl-ui.css), другото стои голо върху кремавата писта
    б.querySelectorAll('.pl-br-pill').forEach(п => { const да = п.dataset.k === кой; скрий(п, !има[п.dataset.k]); атр(п, 'aria-pressed', String(да)); клас(п, 'pl-gel', да); });
    скрий(б.querySelector('.pl-br-seg'), !(има.baby && има.mama));

    текст(б.querySelector('.pl-br-num b'), String(пв));
    текст(б.querySelector('.pl-br-num span'), редна(пв).replace(/^\d+/, '') + ' седмица');
    текст(б.querySelector('.pl-br-tri'), д.три + ' триместър');
    const тхт = б.querySelector('.pl-br-txt');
    текст(тхт, д.бел[кой] || '');
    текст(б.querySelector('.pl-br-fruit'), д.плод ? д.плод[1] : '');
    // размерът — същият ред като preg20.js:143
    const разм = б.querySelector('.pl-br-size');
    const htmlР = д.плод ? ('колкото <b>' + esc(д.плод[0]) + '</b>' + (д.рз ? ' · ~' + тегло(д.рз[0]) + ' · ~' + д.рз[1] + ' см <small>(' + д.мярка + ')</small>' : '')) : '';
    if (разм.innerHTML !== htmlР) разм.innerHTML = htmlР;
    скрий(разм, !htmlР);
    const съвет = б.querySelector('.pl-br-tip');
    const htmlС = д.бел.tip ? '<b>' + (пв === w ? 'Тази седмица' : 'През тази седмица') + ':</b> ' + esc(д.бел.tip) : '';   // preg20.js:148
    if (съвет.innerHTML !== htmlС) съвет.innerHTML = htmlС;
    скрий(съвет, !htmlС);

    // лентата: избраната е голяма розова; твоята (ако гледаш друга) има розов пръстен
    //   мънистото сменя материала: избраното — гел, останалите — филц (само при разлика → без мутации в покой)
    б.querySelectorAll('.pl-br-wk').forEach(к => {
      const да = +к.dataset.wk === пв; const м = к.firstElementChild;
      клас(к, 'on', да); атр(к, 'aria-pressed', String(да)); клас(м, 'pl-gel', да); клас(м, 'pl-soft', !да);
    });
    б.querySelectorAll('.pl-br-arr').forEach(с => { const д2 = +с.dataset.d; const спри = (д2 < 0 && пв <= ОТ) || (д2 > 0 && пв >= ДО); if (с.disabled !== спри) с.disabled = спри; });
    // „ти си в …“ + връщане — само когато гледаш чужда седмица и твоята е в лентата
    const моя = Math.max(ОТ, Math.min(ДО, w));
    const ти = б.querySelector('.pl-br-you');
    скрий(ти, пв === моя);
    текст(ти.querySelector('span'), 'Гледаш ' + редна(пв) + ' · ти си в ' + редна(w));
    if (анимирай && !тихо() && тхт.animate) {
      б.querySelector('.pl-br-week').animate([{ opacity: 0.25, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'ease-out' });
    }
  }

  // лентата се центрира със scrollLeft — това НЕ е мутация на DOM (наблюдателят мълчи)
  function центрирай(б, плавно) {
    const тр = б.querySelector('.pl-br-rail'); const к = тр && тр.querySelector('.pl-br-wk.on');
    if (!тр || !к || !тр.clientWidth) return;
    const цел = Math.max(0, Math.min(тр.scrollWidth - тр.clientWidth, Math.round(к.offsetLeft + к.offsetWidth / 2 - тр.clientWidth / 2)));
    if (Math.abs(тр.scrollLeft - цел) < 2) return;
    const меко = плавно && !тихо();
    try { тр.scrollTo({ left: цел, behavior: меко ? 'smooth' : 'auto' }); } catch (e) { тр.scrollLeft = цел; }
    // 🪤 22.09 (мерено, ag2_bremennost_funk): плавното плъзгане, прекъснато от второ натискане, спря
    //   на 227 px встрани от избраната седмица → след 450 мс донагласяме без анимация.
    if (меко) { clearTimeout(тр._plBrT); тр._plBrT = setTimeout(() => { if (Math.abs(тр.scrollLeft - цел) > 2) тр.scrollLeft = цел; }, 450); }
  }

  // ═══ 2. ПРЕДСТОЯЩИТЕ ЗАПИСИ ═══
  //   bl_events = [{ id, t, d:'ГГГГ-ММ-ДД', e, preg? }] — пишат го preg20.js:338 (прегледът, preg:true),
  //   rooms5.js:167 („Какво предстои“ в Инструменти) и women5.js:159. Предстоящо = от днешната МЕСТНА
  //   полунощ нататък (preg20.js:317 · rooms5.js:118-120). Датата се чете през BL_PREG.полунощ (data.js:395) —
  //   без UTC отместване.
  //   Ориентирът: BL_PREG20.ПРЕГЛЕДИ (preg20.js:431) + отметките bl_checkups {индекс: true} (preg20.js:445-453).
  //   Иконките (реф. 4: преглед = розов календар, изследвания = синя колба):
  //   ориентирът по емоджито на ПРЕГЛЕДИ — 🩺 стетоскоп, 📏 линийка, останалите (🧬 🔬 🍬 🧪) → колба.
  const ИКОНА_ПРЕГЛЕД = { '🩺': ['ico-a', 3, 2], '📏': ['ico-a', 1, 2] };
  const ИЗСЛЕДВАНЕ = /изследв|кръв|урин|анализ|тест|лаборат|ехограф|скрининг/i;
  function записи(w) {
    const полунощ = x => (window.BL_PREG ? BL_PREG.полунощ(x) : (() => { const д = new Date(x); return isNaN(д) ? null : new Date(д.getFullYear(), д.getMonth(), д.getDate()); })());
    const днес = полунощ(new Date());
    const ред = [];
    const ев = (чети('bl_events', []) || [])
      .filter(x => x && typeof x.d === 'string')
      .map(x => ({ x, д: полунощ(x.d) }))
      .filter(о => о.д && о.д >= днес)
      .sort((а, б) => а.д - б.д);
    ев.slice(0, 2).forEach(({ x, д }) => {
      const дни = Math.round((д - днес) / 86400000);
      const кога = дни === 0 ? 'днес' : дни === 1 ? 'утре' : 'след ' + дни + ' дни';
      const име = String(x.t || 'Запис').replace(/\s*\(бременност\)\s*$/i, '').trim() || 'Запис';
      const тест = !x.preg && ИЗСЛЕДВАНЕ.test(име);
      // „Изследвания — кръв и урина“ → главното на втория ред, подробността на третия (реф. 4: „Кръв и урина“)
      const [главно, ...ост] = име.split(/\s+[—–-]\s+/);
      ред.push({
        go: x.preg ? 'doc' : 'tools',
        ик: тест ? ['ico-c', 2, 3] : ['ico-a', 0, 1],
        тон: тест ? 'sky' : 'pink',
        д: д.getDate() + ' ' + МЕС[д.getMonth()],
        и: име,
        гл: (главно || име).trim(),
        дт: ост.join(' — ').trim(),
        к: кога,
        от: x.preg ? 'от „Прегледът“' : 'от „Какво предстои“ в Инструменти',
        ор: false
      });
    });
    const П = (window.BL_PREG20 && BL_PREG20.ПРЕГЛЕДИ) || [];
    if (ред.length < 2 && w > 0 && П.length) {
      const бях = чети('bl_checkups', {}) || {};
      const i = П.findIndex(([, до], и) => w <= до && !бях[и]);
      if (i >= 0) {
        const [от, до, е, име, какво] = П[i];
        ред.push({ go: 'cal', ик: ИКОНА_ПРЕГЛЕД[е] || ['ico-c', 2, 3], тон: 'butter', д: от + '–' + до + ' с.', и: име, к: какво, от: 'ориентир от „Календарчето на прегледите“', ор: true });
      }
    }
    return ред;
  }
  // реф. 4: два реда един до друг — дата (Nunito, не Georgia), какво, кога; целият ред е бутон
  function записиHTML(ред) {
    if (!ред.length) return '<p class="pl-br-empty">Още нямаш записан преглед. Запиши деня — ще го пазя тук.</p>';
    return ред.map(р => '<button type="button" class="pl-br-row pl-soft t-' + р.тон + (р.ор ? ' is-guide' : '') + '" data-go="' + р.go + '" aria-label="' +
        esc(р.д + ' · ' + р.и + ' — ' + (р.ор ? 'ориентир: ' + р.к : р.к + ', ' + р.от)) + '">' +
      '<i class="pl-br-ri" aria-hidden="true" style="' + спрайт(р.ик[0], р.ик[1], р.ик[2]) + '"></i>' +
      '<span class="pl-br-rt" aria-hidden="true"><b>' + esc(р.д) + '</b><strong>' + esc(р.гл || р.и) + '</strong>' +
        '<small>' + (р.ор ? '<em class="pl-br-tag">ориентир</em>' : (р.дт ? esc(р.дт) + ' · ' : '') + esc(р.к)) + '</small></span>' +
      ШЕВРОН + '</button>').join('');
  }
  function записиКарта() {
    return '<div class="pl-br-card pl-br-rec pl-felt">' +
      '<div class="pl-br-rh"><i class="pl-br-rico">' + КАЛЕНДАР + '</i><h3>Предстоящи записи</h3></div>' +
      '<div class="pl-br-list"></div>' +
      '<button type="button" class="pl-br-add pl-gel" data-go="add"><b aria-hidden="true">+</b>Добави запис</button>' +
      '<p class="pl-br-foot"><span>Записките не заменят преглед.</span><a class="pl-br-112" href="tel:112" aria-label="Спешна помощ 112">📞 112</a></p>' +
    '</div>';
  }
  function обновиЗаписи(б) {
    const сп = б.querySelector('.pl-br-list'); if (!сп) return;
    const ред = записи(+б.getAttribute('data-w'));
    const подпис = JSON.stringify(ред);
    if (сп.getAttribute('data-sig') === подпис) return;          // същото → никаква мутация
    сп.innerHTML = записиHTML(ред);
    сп.setAttribute('data-sig', подпис);
  }

  // ═══ 3. ПОКАНАТА (няма дата) ═══
  function поканаHTML() {
    let духове = ''; for (let i = 0; i < 5; i++) духове += '<span' + (i === 2 ? ' class="on"' : '') + '>' + (i === 2 ? '?' : '') + '</span>';
    return '<div class="pl-br-card pl-br-inv pl-felt">' +
      '<h3 class="pl-br-h">Избери седмица от бременността</h3>' +
      '<div class="pl-br-ghost" aria-hidden="true">' + духове + '</div>' +
      // думите са на поканата в preg20.js:262-263 — „стаята се събужда с една дата“
      '<p class="pl-br-invt">Стаята се събужда с <b>една дата</b> — първия ден на последния ти цикъл. От нея оживява твоята седмица.</p>' +
      '<button type="button" class="pl-br-add pl-gel" data-go="invite">Въведи датата</button>' +
    '</div>';
  }

  // ═══ 4. ТРИТЕ ПЛОЧКИ — всяка е малка сцена от 2–3 плюшени предмета (реф. 4) ═══
  //   м = мястото в рамката: g голямото, m долу вдясно, l долу вляво, r долу вдясно (по-малко)
  function плочкиHTML() {
    const П = [
      ['kal', 'Моят календар', 'Планирай с лекота', 't-pink', [['ico-g', 0, 3, 'g']]],
      ['bag', 'Чанта за родилното', 'Готова, когато дойде време', 't-butter', [['ico-g', 0, 1, 'g'], ['ico-f', 0, 0, 'l'], ['ico-a', 1, 0, 'r']]],
      ['q', 'Въпроси към лекаря', 'Запиши за следващия преглед', 't-sky', [['ico-g', 0, 2, 'g']]]
    ];
    return '<div class="pl-br-tiles">' + П.map(([go, т, п, цв, ик]) =>
      '<button type="button" class="pl-br-tile pl-felt ' + цв + '" data-go="' + go + '">' +
        '<span class="pl-br-ta" aria-hidden="true">' + ик.map(([л, р, к, м]) => '<i class="' + м + '" style="' + спрайт(л, р, к) + '"></i>').join('') +
          '' + '</span>' +
        '<span class="pl-br-tl"><b>' + т + '</b><small>' + п + '</small></span>' + ШЕВРОН + '</button>').join('') + '</div>';
  }

  // ═══ СКОКОВЕТЕ — само до СЪЩЕСТВУВАЩИ карти ═══
  const заглавие = к => ((к && к.querySelector('.jr-title')) || {}).textContent || '';
  const карта = (корен, с) => корен.querySelector(':scope > ' + с);
  const поИме = (корен, re) => [...корен.querySelectorAll(':scope > .jr-card')].find(к => re.test(заглавие(к)));
  // 🪤 .ro-room .jr-card е с content-visibility:auto; contain-intrinsic-size:auto 220px (mega.css:336) —
  //   картите между нас и целта получават истинската си височина едва щом влязат в екрана и целта бяга.
  //   22.09 (МЕРЕНО тук, ag2_bremennost_diag): старото „8 пъти през 120 мс“ люлееше стаята
  //   (scrollTop 3868 → 3219 → 2686 → 3623) и календарчето остана на −1085 px. Сега е доказаният ред
  //   от pl-zdrave.js:162 / pl-instrumenti.js:242 (докарай): мигновен скок, после през 200 мс
  //   донагласяне, докато картата застане (±6 px — мерено: с ±16 оставаше на −6, под главата) ТРИ проверки подред, до 20 опита. Пипне ли мама
  //   екрана — спираме (не се борим с пръста ѝ). Нов скок гаси стария.
  //   Скролваме САМО #roRoom (scrollTop — не е мутация); scrollIntoView местеше и родителите.
  let скок = 0;
  function докарай(цел, ск) {
    const мой = ++скок;
    let опит = 0, добри = 0, пипна = false;
    const пусни = () => { пипна = true; };
    const СЪБИТИЯ = ['touchstart', 'wheel', 'pointerdown', 'keydown'];   // пръст, колелце, мишка, клавиатура
    СЪБИТИЯ.forEach(и => ск.addEventListener(и, пусни, { passive: true }));
    const махни = () => СЪБИТИЯ.forEach(и => ск.removeEventListener(и, пусни));
    const разлика = () => цел.getBoundingClientRect().top - ск.getBoundingClientRect().top - 10;
    const цели = () => { const бе = ск.scrollTop; ск.scrollTop = бе + Math.round(разлика()); return ск.scrollTop !== бе; };
    цели();
    (function провери() {
      if (мой !== скок || !цел.isConnected || пипна) return махни();
      if (Math.abs(разлика()) <= 6) добри++;
      else if (!цели()) добри++;                  // опряна в дъното на стаята — по-надолу не може
      else добри = 0;
      // поне 8 проверки (1.6 с): мерено — картата стоеше 3 проверки, после отскачаше с 15 px (ag2_bremennost_F5)
      опит++;
      if ((добри < 3 || опит < 8) && опит < 20) { setTimeout(провери, 200); return; }
      махни();
    })();
  }
  function скочи(цел, поле) {
    if (!цел) return false;
    if (цел.classList.contains('folded')) {
      // разгъване с НЕЙНИЯ бутон ▾ (polish.js:226-252 → превключи(): класът + bl_folds, като при докосване)
      const сгъвач = цел.querySelector('.jr-title .fold-btn');
      if (сгъвач) сгъвач.click(); else цел.classList.remove('folded');
    }
    const ск = цел.closest('#roRoom');
    // 🪤 22.09 (МЕРЕНО, ag2_bremennost_diag3): след скок до „Чантата“ скокът до „Календарчето“ люлееше
    //   стаята 4 с между scrollTop 2511 и 3678 (scrollHeight 5970 ↔ 6757) — картите с content-visibility:auto
    //   сменят височината си според това коя е в екрана, котвата на браузъра мести скрола, и пак.
    //   Лекът (същият като в pl-dobavi.js:245): от първия скок картите в ТАЗИ стая се рисуват истински
    //   (data-pl-br-go → content-visibility: visible, css/pl-bremennost.css). Махаме го в обработи(), щом
    //   стаята се нарисува наново или е друга — следващото отваряне е както преди.
    if (ск && !ск.hasAttribute('data-pl-br-go')) ск.setAttribute('data-pl-br-go', '1');
    if (поле) { try { поле.focus({ preventScroll: true }); } catch (e) {} }
    if (ск) докарай(цел, ск); else { try { цел.scrollIntoView({ block: 'start' }); } catch (e) {} }
    // мек розов контур за миг — да се види КОЯ карта е
    цел.classList.add('pl-br-flash');
    clearTimeout(цел._plBrT); цел._plBrT = setTimeout(() => цел.classList.remove('pl-br-flash'), 1700);
    if (window.BL_FX && BL_FX.buzz) BL_FX.buzz(6);
    return true;
  }
  // „Какво предстои“ живее в Инструменти (rooms5.js:126, :522): затваряме и отваряме като preg20.js:290.
  function къмИнструменти() {
    if (!window.MamaHelper) return;
    try { MamaHelper.close(); } catch (e) {}
    setTimeout(() => {
      try { MamaHelper.open('Инструменти'); } catch (e) { return; }
      let н = 0;
      (function търси() {
        const к = [...document.querySelectorAll('#roRoom > .jr-card')].find(x => /Какво предстои/.test(заглавие(x)));
        if (к) { скочи(к); return; }
        if (++н < 30) setTimeout(търси, 120);
      })();
    }, 350);
  }
  function действие(корен, go) {
    const док = карта(корен, '.pg20-doc');           // „Прегледът 🩺“ (preg20.js:298)
    const кал = карта(корен, '.pg20-cal');           // „Календарчето на прегледите“ (preg20.js:440)
    const пок = карта(корен, '.pg20-invite');        // поканата без дата (preg20.js:260)
    const полеДата = к => к && к.querySelector('input[type="date"]');
    switch (go) {
      case 'doc': return скочи(док || пок);
      case 'cal': return скочи(кал || док || пок);
      case 'add': return док ? скочи(док, полеДата(док)) : скочи(пок, полеДата(пок));
      case 'invite': return скочи(пок, полеДата(пок)) || скочи(док);
      case 'kal': return скочи(кал || док || пок);
      case 'bag': return скочи(поИме(корен, /Чанта за родилния дом/) || пок);   // rooms2.js:1208 — само с дата
      case 'q': return скочи(док || поИме(корен, /Въпроси за (лекаря|прегледа)/) || пок);
      case 'tools': return къмИнструменти();
    }
    return false;
  }

  // ═══ СГЛОБЯВАНЕТО ═══
  function направи(корен, с) {
    const б = document.createElement('section');
    б.className = 'pl-br';
    б.setAttribute('data-s', с.вид);
    б.setAttribute('data-w', String(с.w || 0));
    б.setAttribute('aria-label', 'Седмиците и прегледите');
    let h = '';
    if (с.вид === 'седмица') h += седмицаHTML(с.w);
    if (с.вид === 'покана') h += поканаHTML();
    if (с.вид !== 'покана') h += записиКарта();
    h += плочкиHTML();
    б.innerHTML = h;
    // едно слушане за целия блок (делегирано) — редовете на записите се пренаписват без нови слушатели
    б.addEventListener('click', е => {
      const цел = е.target.closest('button, a'); if (!цел || !б.contains(цел)) return;
      const пам = корен._plBr;
      if (цел.classList.contains('pl-br-wk')) { пам.гл = +цел.dataset.wk; рисувайСедмица(б, true); центрирай(б, true); return; }
      if (цел.classList.contains('pl-br-arr')) { пам.гл = Math.max(ОТ, Math.min(ДО, пам.гл + +цел.dataset.d)); рисувайСедмица(б, true); центрирай(б, true); if (window.BL_FX && BL_FX.buzz) BL_FX.buzz(6); return; }
      if (цел.classList.contains('pl-br-back')) { пам.гл = Math.max(ОТ, Math.min(ДО, +б.getAttribute('data-w'))); рисувайСедмица(б, true); центрирай(б, true); return; }
      if (цел.classList.contains('pl-br-pill')) { пам.кой = цел.dataset.k; рисувайСедмица(б, true); return; }
      if (цел.dataset.go) действие(корен, цел.dataset.go);
    });
    return б;
  }

  function обработи(корен) {
    const панел = корен.closest('.ro-panel');
    // „Бременност“ = персонажът ro-peach (premium-rooms.js:14) И вече построени карти на preg20
    const тук = панел && панел.classList.contains('ro-peach') &&
      !!корен.querySelector(':scope > .pg20-hero, :scope > .pg20-invite, :scope > .pg20-doc, :scope > .pg20-path');
    let б = корен.querySelector(':scope > .pl-br');
    const с = тук ? състояние() : { вид: 'нищо' };
    // 🪤 22.09 (МЕРЕНО, ag2_bremennost_diag3): #roRoom НЕ е нов елемент при ново отваряне — helper.js:5407
    //   го чисти с innerHTML = ''. Затова: няма ли го нашия блок, стаята е нарисувана наново (или е друга) →
    //   паметта (гледаната седмица) и „рисувай картите истински“ (data-pl-br-go) си отиват. Махането на
    //   атрибута не буди наблюдателя (той слуша само class и hidden).
    if (!б) { корен._plBr = null; if (корен.hasAttribute('data-pl-br-go')) корен.removeAttribute('data-pl-br-go'); }
    if (с.вид === 'нищо') { if (б) б.remove(); if (корен.hasAttribute('data-pl-br-go')) корен.removeAttribute('data-pl-br-go'); return; }
    // гледаната седмица и „бебето/мен“ — на елемента #roRoom, докато стаята не се нарисува наново
    if (!корен._plBr || корен._plBr.w !== (с.w || 0)) корен._plBr = { w: с.w || 0, гл: Math.max(ОТ, Math.min(ДО, с.w || ОТ)), кой: 'baby' };
    if (б && (б.getAttribute('data-s') !== с.вид || б.getAttribute('data-w') !== String(с.w || 0))) { б.remove(); б = null; }
    let нов = false;
    if (!б) { б = направи(корен, с); нов = true; }
    // мястото: веднага под банера; без банер — най-отгоре (банерът после сяда над нас)
    const банер = корен.querySelector(':scope > .pl-rhero');
    if (банер) { if (б.previousElementSibling !== банер || !б.isConnected) банер.after(б); }
    else if (корен.firstElementChild !== б) корен.insertBefore(б, корен.firstChild);
    if (с.вид === 'седмица') {
      рисувайСедмица(б, false);
      if (нов) { центрирай(б, false); setTimeout(() => центрирай(б, false), 360); }
    }
    обновиЗаписи(б);
  }

  // 🪤 #roRoom се СМЕНЯ с нов елемент при отваряне на стая → гледаме статичния #roomOverlay
  //   (както premium-rooms.js:187-195). Отлагане с setTimeout, НЕ requestAnimationFrame — rAF спира,
  //   когато страницата не се рисува (premium-rooms.js:100-101).
  let чака = false;
  function обходи() { document.querySelectorAll('#roomOverlay #roRoom').forEach(к => { try { обработи(к); } catch (e) { console.error('[pl-bremennost]', e); } }); }
  function отложено() { if (чака) return; чака = true; setTimeout(() => { чака = false; обходи(); }, 40); }
  function върви() {
    const ов = document.getElementById('roomOverlay');
    if (!ов) return;
    new MutationObserver(отложено).observe(ов, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] });
    обходи();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', върви); else върви();
  window.BL_PL_BREMENNOST = { обходи, състояние, записи };
})();
