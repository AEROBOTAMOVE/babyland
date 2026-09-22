/* ═══════════════════════════════════════════════════════════════════════════════
   👶 ТАБЛОТО „МАЛКИЯТ ТИ ГОЛЯМ СВЯТ“ · стаята „Моето бебе“ (референция 8, 22.09.2026)
   Веднага под банера на стаята (.pl-rhero от premium-rooms.js), преди всичко друго:
   визитка „{име} · {възраст}“ с „Днес, …“; рафт „Днес“ с три арки — Хранене / Сън /
   Пелени — с кръгъл „+“ под всяка; броячите за деня; „Днешни записи“ от реалните
   времена; два рафта („Растеж“ и „Първи умения“) и голям розов „+ Нов запис“.

   НИЩО НЕ ЗАПИСВА И НЕ СЪЗДАВА КЛЮЧОВЕ. Всеки бутон вика СЪЩЕСТВУВАЩОТО: скролва до
   истинската карта (разгъва я с нейния собствен ▾, ако е сгъната), осветява и фокусира
   истинския бутон — самият запис го прави мама в картата, по старите правила, със
   старите пазачи (пълна памет, ↺ отмяна, таван на съня). Един погрешен тап по арката
   не записва хранене в 3 сутринта.

   Данните се четат по СЪЩИТЕ правила като js/premium-home.js → денят() (ред 64–89, прочетено 22.09 09:42;
   пробата сравнява двете функции наживо — „3 хранения / 1ч 25м / 4“ и тук, и там):
     · хранения = bl_nursing[].ts (rooms3.js:877–886, таймерът) + bl_feedlog (rooms2.js:534,
       бързите чипове) + bl_feed.t (rooms2.js:533 и огледалото rooms3.js:891), подредени,
       с дедуп на близнаци ≤ 60 с (съседни в подредения списък, както там);
     · сън = bl_sleep.segs само ако bl_sleep.d е ДНЕС (rooms2.js:695–706); отворен брояч се
       брои само ако е под 14 ч (rooms2.js:711 ТАВАН_СЪН) — над това е забравяне, не сън;
       „N пъти“ = segs + отворения, както „отрязъци“ в rooms2.js:733;
     · пелени = bl_diapers[днес].wet + .dirty (rooms2.js:624, 663) — там няма часове, затова
       и тук няма: редът е „Пелени днес: N“, без измислен час.
   Нула без запис не е „0“ — тогава стои покана.

   🪤 „+ Нов запис“ НЕ натиска „+“ на приложението: #plus-btn не съществува (бутонът е
   .plus-btn в #blPlus, polish.js:314), а менюто му е в .plus-wrap със z-index 90
   (css/mega.css:684) — ПОД стаята (.room-overlay z-index 120, css/style.css:1139). В стаята
   кликът щеше да отвори меню, което никой не вижда. Затова тук се разгръща собствен избор
   от 6 точки — и всяка отново води до СЪЩЕСТВУВАЩА карта (хранене, сън, пелена, тегло,
   бележка, снимка).

   22.09 следобед · „точно като референцията, не плоско“ (сцената img/scene/bebe.webp вече е
   ЗАД панела — premium.css „🎬 СЦЕНИТЕ“): броячите са „иконка вляво + число“ като в реф. 8
   („3 хранения · 2 дремки · 4 смени“; общото време на съня е в етикета за четците, а
   всяка дрямка — с продължителността си в „Днешни записи“), числата са на
   Nunito (Georgia има старинни цифри — 0 се чете „о“), картата е общият филц .pl-felt,
   редовете и изборът — .pl-soft, „+ Нов запис“ — общият гел .pl-gel (css/pl-ui.css).
   Аватарът е последната снимка от Фото-лентата (bl_photos, extras2.js:260 пише, :292 пази
   със същия регулярен израз като profile.js:175) — без снимка е плюшеното бебе.
   „Първи умения“ отваря „Развитие и игри“ и докарва картата „Първите пъти“ (rooms2.js:1541).

   ПЪТ НАЗАД: махни <script src="js/pl-bebe.js"> и <link href="css/pl-bebe.css"> (ако са
   вкарани в index.html). Блокът е само добавен елемент — стаята остава каквато беше.
   Версията преди 22.09 следобед: scratchpad/ag2_bebe_js_predi.bak, ag2_bebe_css_predi.bak.
   ═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.BL_PL_BEBE) return;

  const МЕСЕЦИ = ['януари', 'февруари', 'март', 'април', 'май', 'юни', 'юли', 'август', 'септември', 'октомври', 'ноември', 'декември'];
  const ТАВАН = 14 * 3600000;          // rooms2.js ТАВАН_СЪН
  const ДЕДУП = 60000;                 // близнаци под минута = едно хранене
  const грешки = [];

  const чети = (к, по) => { try { const v = localStorage.getItem(к); return v ? JSON.parse(v) : по; } catch (e) { return по; } };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ч => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ч]));
  const двуц = n => String(n).padStart(2, '0');
  const локалнаДата = д => д.getFullYear() + '-' + двуц(д.getMonth() + 1) + '-' + двуц(д.getDate());
  const часът = ts => { const д = new Date(ts); return двуц(д.getHours()) + ':' + двуц(д.getMinutes()); };
  const чч = мин => (мин >= 60 ? Math.floor(мин / 60) + 'ч ' : '') + (мин % 60) + 'м';
  const продълж = мин => мин >= 60 ? Math.floor(мин / 60) + ' ч' + (мин % 60 ? ' ' + (мин % 60) + ' мин' : '') : мин + ' мин';
  const бр = (n, ед, мн) => n === 1 ? ед : мн;

  // Плюшените иконки: [лист, ред, колона] → фон на елемента (относителен url в JS е спрямо
  // страницата — 🪤 в CSS променлива щеше да е спрямо css/ и 404).
  const ИК = {
    бебе: ['ico-d', 0, 1], шише: ['ico-a', 1, 0], луна: ['ico-a', 1, 1], боди: ['ico-b', 3, 3],
    жираф: ['ico-d', 2, 2], линийка: ['ico-a', 1, 2], обувки: ['ico-d', 1, 2], пирамида: ['ico-b', 1, 3], звезда: ['ico-b', 2, 1],
    везна: ['ico-d', 2, 3], молив: ['ico-b', 0, 3], апарат: ['ico-b', 1, 1], одеяло: ['ico-d', 3, 3],
    листо: ['ico-e', 3, 2],
  };
  const ико = (име, клас) => { const и = ИК[име]; return '<i class="' + клас + '" aria-hidden="true" style="background-image:url(img/art/' + и[0] + '.webp);background-position:' + (и[2] * 100 / 3).toFixed(3) + '% ' + (и[1] * 100 / 3).toFixed(3) + '%"></i>'; };
  // 🪤 цифрите в серифен текст отиват на Nunito — Georgia рисува „старинни“ цифри (0 като „о“)
  const цифри = s => esc(s).replace(/\d+(?:[.,:]\d+)*/g, м => '<span class="pl-bb-d">' + м + '</span>');
  // 📸 последната снимка от Фото-лентата; същият щит като profile.js:175 и extras2.js:292
  const СНИМКА = /^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/;
  function снимката() {
    const с = чети('bl_photos', {});
    if (!с || typeof с !== 'object') return '';
    const м = Object.keys(с).filter(к => /^\d+$/.test(к) && typeof с[к] === 'string' && СНИМКА.test(с[к])).sort((a, b) => b - a)[0];
    return м == null ? '' : с[м];
  }

  // ── 👶 визитката: възрастта е СЪЩАТА сметка като premium-home.js бебето() (ред 36–50) ──
  function бебето() {
    const б = чети('bl_baby', {}) || {};
    const име = String(б.name || '').trim();
    const р = б.birth ? new Date(б.birth) : null;
    // без рожден ден: „Бебето · разкажи ми …“ се режеше на 390px (снимка ag_bebe_e1) — само покана
    if (!р || isNaN(р)) return { име: име || 'Разкажи ми за бебето', ред: '', има: false };
    const д = new Date();
    let м = (д.getFullYear() - р.getFullYear()) * 12 + (д.getMonth() - р.getMonth());
    if (д.getDate() < р.getDate()) м--;
    let ред;
    if (м < 1) { const дни = Math.max(0, Math.floor((д - р) / 864e5)); ред = дни + (дни === 1 ? ' ден' : ' дни'); }
    else if (м < 24) ред = м + (м === 1 ? ' месец' : ' месеца');
    else { const г = Math.floor(м / 12); ред = г + (г === 1 ? ' година' : ' години'); }
    return { име: име || 'Бебето', ред, има: true };
  }
  const днесТекст = () => { const д = new Date(); return 'Днес, ' + д.getDate() + ' ' + МЕСЕЦИ[д.getMonth()]; };

  // ── 📊 денят: правилата на premium-home.js денят(), но с числата и времената, не с готов текст ──
  function денят() {
    const д = локалнаДата(new Date()), сега = Date.now();
    const кърмене = чети('bl_nursing', []), лог = чети('bl_feedlog', []), бързо = чети('bl_feed', null);
    const н = Array.isArray(кърмене) ? кърмене : [];
    const тс = [...н.map(x => x && x.ts), ...(Array.isArray(лог) ? лог : []), (бързо || {}).t]
      .filter(x => typeof x === 'number' && isFinite(x)).sort((a, b) => a - b)
      .filter((x, i, а) => i === 0 || x - а[i - 1] > ДЕДУП);
    const хранения = тс.filter(x => локалнаДата(new Date(x)) === д);

    const с = чети('bl_sleep', null);
    const сегм = (с && с.d === д && Array.isArray(с.segs)) ? с.segs.filter(x => x && typeof x.s === 'number') : [];
    let сънМин = Math.floor(сегм.reduce((а, x) => а + Math.max(0, (x.e || 0) - (x.s || 0)), 0) / 60000);
    const отворен = !!(с && с.open && сега - с.open > 0 && сега - с.open <= ТАВАН);
    const спи = отворен ? Math.floor((сега - с.open) / 60000) : 0;
    сънМин += спи;

    const п = (чети('bl_diapers', {}) || {})[д];
    const мокри = п ? (+п.wet || 0) : 0, каки = п ? (+п.dirty || 0) : 0;

    // хронологията: хранения + сън (пелените нямат часове — отделен ред)
    const събития = хранения.map(ts => {
      const нк = н.find(x => x && typeof x.ts === 'number' && Math.abs(x.ts - ts) <= ДЕДУП);
      let дет = '', към = 'храна';
      if (нк) { дет = ({ 'Л': 'ляво', 'Д': 'дясно', 'Ш': 'шише' }[нк.s] || '') + (нк.dur > 0 ? ' · ' + Math.max(1, Math.round(нк.dur / 60)) + ' мин' : ''); към = 'кърмене'; }
      else if (бързо && typeof бързо.t === 'number' && Math.abs(бързо.t - ts) <= ДЕДУП) дет = { left: 'ляво', right: 'дясно', bottle: 'шише' }[бързо.s] || '';
      return { ts, вид: 'храна', към, текст: 'Хранене' + (дет ? ' · ' + дет : '') };
    });
    сегм.forEach(x => събития.push({ ts: x.s, вид: 'сън', към: 'сън', текст: 'Сън · ' + продълж(Math.floor(Math.max(0, (x.e || 0) - x.s) / 60000)) }));
    if (отворен) събития.push({ ts: с.open, вид: 'сън', към: 'сън', текст: 'Спи сега · ' + (спи ? 'от ' + продълж(спи) : 'току-що'), жив: true });
    събития.sort((a, b) => b.ts - a.ts);

    return { хранения: хранения.length, сънМин, дремки: сегм.length + (отворен ? 1 : 0), отворен, спи, мокри, каки, пелени: мокри + каки, събития };
  }

  // ── 🎯 къде води всеки бутон: СЪЩЕСТВУВАЩИТЕ карти на стаята (заглавията са от rooms2/3.js, extras2.js) ──
  const бутонСТекст = (к, сел, re) => [...к.querySelectorAll(сел)].find(x => re.test(x.textContent || ''));
  const ЦЕЛИ = {
    храна:   { карта: 'Кога яде за последно', свети: к => к.querySelector('.jr-quick'), фокус: к => бутонСТекст(к, '.jr-quick .jr-chip', /Ляво/) },
    кърмене: { карта: 'Кърмене-таймер', свети: к => к.querySelector('.jr-quick'), фокус: к => к.querySelector('.jr-quick .jr-chip') },
    сън:     { карта: 'Сънят днес', свети: к => бутонСТекст(к, '.jr-btn', /Заспа|Събуди/), фокус: к => бутонСТекст(к, '.jr-btn', /Заспа|Събуди/) },
    пелени:  { карта: 'Пелени днес', свети: к => к.querySelector('.bb-dip'), фокус: к => к.querySelector('.bb-dipbtn[aria-label="Едно повече: мокри"]') },
    всички:  { карта: 'Денят на един кръг' },
    профил:  { карта: 'Профилът на бебето' },
    тегло:   { карта: 'Калкулатор на растежа' },
    бележка: { карта: 'Бележник за бебето' },
    снимка:  { карта: 'Фото-лента' },
  };
  function картата(стая, дума) {
    const всички = [...стая.querySelectorAll('section.jr-card')].filter(к => { const т = к.querySelector('.jr-title'); return т && (т.textContent || '').includes(дума); });
    return всички.find(к => к.getClientRects().length) || всички[0] || null;
  }
  function светни(е) {
    if (!е) return;
    е.setAttribute('data-pl-spot', '1');
    clearTimeout(е._plSpot);
    е._plSpot = setTimeout(() => е.removeAttribute('data-pl-spot'), 2600);
  }
  const плавно = () => !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  // 🪤 22.09 (ИЗМЕРЕНО, ag_bebe_diag): плавното скролване до „Сънят днес“ спираше с бутона
  //   ИЗВЪН екрана — картите над него растат, докато минаваме покрай тях (разкриват се,
  //   зареждат рисунки): целта беше на 1989px, а след скролването — на 2967px. Затова след
  //   плавния скок „догонваме“ с обикновен таймер (не rAF), до ~3 с, докато целта спре
  //   на мястото си. Докосне ли мама екрана — спираме веднага, не се борим с пръста ѝ.
  //   Скролваме самия #roRoom (той е скрол-кутията на стаята — мерено), с 14px въздух отгоре,
  //   за да не се реже осветеният ръб (снимка ag_bebe_e2: картата стоеше на −15px).
  function докарай(е, блок, безПърво) {
    const стая = е.closest('#roRoom') || document.getElementById('roRoom');
    const скролва = стая && стая.scrollHeight > стая.clientHeight + 4;
    const колко = () => {
      const r = е.getBoundingClientRect(), s = стая.getBoundingClientRect();
      const желано = блок === 'center' ? s.top + Math.max(14, (s.height - r.height) / 2) : s.top + 14;
      return r.top - желано;
    };
    if (!скролва) { if (!безПърво) е.scrollIntoView({ behavior: плавно() ? 'smooth' : 'auto', block: блок }); return; }
    if (!безПърво) стая.scrollTo({ top: стая.scrollTop + колко(), behavior: плавно() ? 'smooth' : 'auto' });
    let пъти = 0, добри = 0, спри = false;
    const стоп = () => { спри = true; };
    ['touchstart', 'wheel', 'keydown'].forEach(с => стая.addEventListener(с, стоп, { once: true, passive: true }));
    const провери = () => {
      if (спри || !е.isConnected || ++пъти > 12) return;
      const д = колко();
      // 🪤 22.09 следобед (ag2_bebe_funk): с праг 24px „Първите пъти“ оставаше на −2px (ръбът
      //   под главата) — картите над нея пораснаха с 16px след скока. Прагът е 8px.
      if (Math.abs(д) > 8) { добри = 0; стая.scrollTop += д; }
      else if (++добри >= 2) return;
      setTimeout(провери, 250);
    };
    setTimeout(провери, 650);
  }

  // „Първи умения“: друга стая се рисува наново (нов #roRoom, карти „is-pending“) — чакаме с
  // таймер (до ~4 с) видимата карта с това заглавие, разгъваме я с НЕЙНИЯ ▾ и я докарваме.
  // Мама може междувременно да е затворила стаята — тогава просто спираме.
  function следДругата(дума) {
    let пъти = 0;
    const опитай = () => {
      const ов = document.getElementById('roomOverlay');
      if (!ов || ов.hidden || ++пъти > 20) return;
      let к = null;
      document.querySelectorAll('#roRoom').forEach(с => { const х = картата(с, дума); if (!к && х && х.getClientRects().length) к = х; });
      if (!к) { setTimeout(опитай, 200); return; }
      if (к.classList.contains('folded')) { const ф = к.querySelector('.fold-btn'); if (ф) ф.click(); else к.classList.remove('folded'); }
      докарай(к, 'start');
      светни(к);
      фокусирай(к.querySelector('.fold-btn'));
    };
    setTimeout(опитай, 350);
  }

  function иди(блок, ключ, само) {
    const стая = блок.closest('#roRoom') || document.getElementById('roRoom');
    if (!стая) return false;
    if (ключ === 'умения') {
      try { if (window.MamaHelper && MamaHelper.open) { MamaHelper.open('Развитие и игри'); следДругата('Първите пъти'); return true; } } catch (e) { грешки.push(String(e)); }
      return false;
    }
    if (ключ === 'растеж') {
      // кътчето „Как расте“: кликът на неговата плочка скача до .sec-head (polish.js:100–102)
      const ч = [...стая.querySelectorAll('.sec-nav .sec-chip')].find(б => /Как расте/.test(б.getAttribute('aria-label') || б.textContent || ''));
      const г = стая.querySelector('#sec-bg') || [...стая.querySelectorAll('.sec-head')].find(х => /Как расте/.test(х.textContent || ''));
      if (ч) { ч.click(); if (г) докарай(г, 'start', true); return true; }   // плочката скролва сама; ние само догонваме
      if (г) { докарай(г, 'start'); return true; }
      return false;
    }
    const ц = ЦЕЛИ[ключ]; if (!ц) return false;
    let к = картата(стая, ц.карта);
    // картата е скрита от търсачката на стаята (polish.js:78–89 слага display:none) — чистим
    // полето по СЪЩИЯ път, по който мама би го изтрила (събитие input), и търсим наново
    if (к && к.style.display === 'none') {
      const т = стая.querySelector('.sec-find');
      if (т && т.value) { т.value = ''; т.dispatchEvent(new Event('input', { bubbles: true })); к = картата(стая, ц.карта); }
    }
    if (!к) {   // карта с такова заглавие няма (преименувана/махната) — поне до кътчето „Днес с бебето“
      const г = стая.querySelector('#sec-bd') || стая.querySelector('.sec-head');
      if (г) { докарай(г, 'start'); return true; }
      return false;
    }
    // сгъната карта се разгъва с НЕЙНИЯ бутон ▾ — той пази bl_folds и aria-expanded (polish.js:226–247)
    if (к.classList.contains('folded')) { const ф = к.querySelector('.fold-btn'); if (ф) ф.click(); else к.classList.remove('folded'); }
    const цел = !само && ц.фокус ? ц.фокус(к) : null;          // истинският бутон за запис
    // без такъв (тегло, бележка, снимка, „Виж всички“) фокусът отива на ▾ на картата: четецът
    // казва „Сгъни „Калкулатор на растежа““ (polish.js:231) — клавиатурата е в картата, не остава назад
    const фокус = цел || к.querySelector('.fold-btn');
    const свет = !само && ц.свети ? (ц.свети(к) || к) : к;
    докарай(цел || к, цел ? 'center' : 'start');
    светни(свет);
    фокусирай(фокус);
    return true;
  }
  function фокусирай(е) { if (!е) return; try { е.focus({ preventScroll: true }); } catch (x) { е.focus(); } }

  // ── рисунката: скелетът се строи веднъж, живите части се пишат САМО при разлика ──
  function рисувай() {
    const с = document.createElement('section');
    с.className = 'pl-bb';
    с.setAttribute('data-pl', 'bebe');
    с.setAttribute('aria-label', 'Денят на бебето');
    const арка = (вид, ик, надпис, етикет) =>
      '<button type="button" class="pl-bb-a t-' + вид + '" data-go="' + вид2ключ[вид] + '" aria-label="' + етикет + '">' +
        '<span class="pl-bb-dome">' + ико(ик, 'pl-bb-ico') + '</span>' +
        '<span class="pl-bb-lbl">' + надпис + '</span>' +
        '<span class="pl-bb-plus" aria-hidden="true"></span>' +
      '</button>';
    const точка = (ключ, ик, надпис) => '<button type="button" class="pl-bb-mi pl-soft" data-go="' + ключ + '">' + ико(ик, 'pl-bb-mico') + '<span>' + надпис + '</span></button>';
    const мид = 'plBbMenu' + (++номер);   // стаята може да е нарисувана два пъти — id без повторение
    с.innerHTML =
      '<button type="button" class="pl-bb-id" data-go="профил">' +
        ико('бебе', 'pl-bb-av') +
        '<span class="pl-bb-idt"></span>' +
        '<svg class="pl-bb-pen" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" fill="currentColor"/><path d="M13.5 6.5l4 4" stroke="#fff" stroke-width="1.4"/></svg>' +
      '</button>' +
      '<div class="pl-bb-shelf">' +
        // украсата на дървената арка (реф. 8): звезда на върха, звездички по дъгата
        '<span class="pl-bb-deco" aria-hidden="true"><i class="pl-bb-st s0">★</i><i class="pl-bb-st s1">★</i><i class="pl-bb-st s2">★</i><i class="pl-bb-st s3">★</i><i class="pl-bb-st s4">★</i></span>' +
        '<h3 class="pl-bb-plaque"><i aria-hidden="true">★</i>Днес<i aria-hidden="true">★</i></h3>' +
        '<div class="pl-bb-arches">' +
          арка('feed', 'шише', 'Хранене', 'Запиши хранене — към бутоните Ляво, Дясно, Шише') +
          арка('sleep', 'луна', 'Сън', 'Запиши сън — към бутона Заспа или Събуди се') +
          арка('diaper', 'боди', 'Пелени', 'Запиши пелена — към брояча Мокри') +
          // дървените колчета между арките и месинговите халки в краищата на дъската
          '<i class="pl-bb-sp p1" aria-hidden="true"></i><i class="pl-bb-sp p2" aria-hidden="true"></i>' +
          '<i class="pl-bb-ring r1" aria-hidden="true"></i><i class="pl-bb-ring r2" aria-hidden="true"></i>' +
        '</div>' +
      '</div>' +
      '<div class="pl-bb-card pl-felt"><div class="pl-bb-live" aria-live="polite"></div></div>' +
      '<div class="pl-bb-tiles">' +
        '<button type="button" class="pl-bb-t t-grow" data-go="растеж">' +
          '<span class="pl-bb-tsc" aria-hidden="true">' + ико('жираф', 'pl-bb-tbig') + ико('линийка', 'pl-bb-tsm') + ико('листо', 'pl-bb-tmini') + '</span>' +
          '<span class="pl-bb-tp"><i class="pl-bb-knob" aria-hidden="true"></i><span><b>Растеж</b><small class="pl-bb-t1"></small></span><em aria-hidden="true">›</em></span>' +
        '</button>' +
        '<button type="button" class="pl-bb-t t-first" data-go="умения">' +
          '<span class="pl-bb-tsc" aria-hidden="true">' + ико('обувки', 'pl-bb-tbig') + ико('пирамида', 'pl-bb-tsm') + ико('звезда', 'pl-bb-tmini') + '</span>' +
          '<span class="pl-bb-tp"><i class="pl-bb-knob" aria-hidden="true"></i><span><b>Първи умения</b><small class="pl-bb-t2"></small></span><em aria-hidden="true">›</em></span>' +
        '</button>' +
      '</div>' +
      '<button type="button" class="pl-bb-cta pl-gel" data-go="меню" aria-expanded="false" aria-controls="' + мид + '"><b aria-hidden="true"></b>Нов запис</button>' +
      '<div class="pl-bb-menu" id="' + мид + '" hidden>' +
        точка('храна', 'шише', 'Хранене') + точка('сън', 'луна', 'Сън') + точка('пелени', 'боди', 'Пелена') +
        точка('тегло', 'везна', 'Тегло и ръст') + точка('бележка', 'молив', 'Бележка') + точка('снимка', 'апарат', 'Снимка') +
      '</div>';
    с.addEventListener('click', e => {
      const т = e.target.closest('[data-go]');
      if (!т || !с.contains(т)) return;
      const к = т.getAttribute('data-go');
      const меню = с.querySelector('.pl-bb-menu'), бутон = с.querySelector('.pl-bb-cta');
      if (к === 'меню') {
        const отвори = меню.hidden;
        меню.hidden = !отвори;
        бутон.setAttribute('aria-expanded', отвори ? 'true' : 'false');
        return;
      }
      if (т.closest('.pl-bb-menu')) { меню.hidden = true; бутон.setAttribute('aria-expanded', 'false'); }
      иди(с, к, т.hasAttribute('data-view'));
    });
    return с;
  }
  const вид2ключ = { feed: 'храна', sleep: 'сън', diaper: 'пелени' };
  let номер = 0;

  // пише innerHTML само ако низът е друг от последно написания (🪤 иначе всяка мутация
  // вика наблюдателя, той — нас, и кръгът става безкраен)
  function пиши(е, html) { if (е && е._pl !== html) { е._pl = html; е.innerHTML = html; } }

  function опресни(б) {
    const бб = бебето(), д = денят();
    пиши(б.querySelector('.pl-bb-idt'), '<b>' + цифри(бб.име + (бб.ред ? ' · ' + бб.ред : '')) + '</b><small>' + esc(днесТекст()) + '</small><span class="pl-bb-sr"> — промени профила</span>');
    // аватарът: снимката на бебето, ако има; стилът се пише само при разлика
    const ав = б.querySelector('.pl-bb-av'), сн = снимката();
    if (ав && ав._plСн !== сн) {
      if (ав._plСн == null) ав._plФон = [ав.style.backgroundImage, ав.style.backgroundPosition];
      ав._plСн = сн;
      ав.classList.toggle('is-photo', !!сн);
      ав.style.backgroundImage = сн ? 'url("' + сн + '")' : ав._plФон[0];
      ав.style.backgroundPosition = сн ? '50% 50%' : ав._plФон[1];
    }

    let html;
    if (!д.хранения && !д.сънМин && !д.отворен && !д.пелени) {
      // честна празнота: покана, не нули
      html = '<div class="pl-bb-empty">' + ико('одеяло', 'pl-bb-eico') +
        '<p><b>Днес още няма записи</b>Докосни „+“ под арката, когато нахраниш, приспиш или смениш пелена — тук ще се подреди денят ви.</p></div>';
    } else {
      // броячите (реф. 8): иконка вляво, число + дума вдясно; докосването води до същия запис като арката
      const брояч = (вид, ключ, ик, число, дума, трети, етикет) => '<button type="button" class="pl-bb-c t-' + вид + '" data-go="' + ключ + '" aria-label="' + esc(етикет) + '">' + ико(ик, 'pl-bb-ci') +
        (число != null ? '<span><b>' + esc(число) + '</b><small>' + esc(дума) + '</small>' + (трети ? '<small class="pl-bb-cx">' + esc(трети) + '</small>' : '') + '</span>'
                       : '<span><b class="pl-bb-invb" aria-hidden="true">+</b><small class="pl-bb-inv">запиши</small></span>') + '</button>';   // покана, не „0“
      const спиДума = д.спи ? 'от ' + чч(д.спи) : 'току-що';
      html = '<div class="pl-bb-cnt">' +
        брояч('feed', 'храна', 'шише', д.хранения || null, д.хранения ? бр(д.хранения, 'хранене', 'хранения') : '+ запиши', '',
          д.хранения ? д.хранения + ' ' + бр(д.хранения, 'хранене', 'хранения') + ' днес — запиши още' : 'Запиши хранене') +
        (д.отворен
          ? брояч('sleep', 'сън', 'луна', 'спи', спиДума, '', 'Спи сега, ' + спиДума + ' — към бутона Събуди се')
          : брояч('sleep', 'сън', 'луна', д.дремки || null, д.дремки ? бр(д.дремки, 'дремка', 'дремки') : '+ запиши', '',
              д.дремки ? д.дремки + ' ' + бр(д.дремки, 'дремка', 'дремки') + ', ' + чч(д.сънМин) + ' сън днес — запиши още' : 'Запиши сън')) +
        брояч('diaper', 'пелени', 'боди', д.пелени || null, д.пелени ? бр(д.пелени, 'смяна', 'смени') : '+ запиши', '',
          д.пелени ? д.пелени + ' ' + бр(д.пелени, 'смяна', 'смени') + ' на пелена днес — запиши още' : 'Запиши пелена') +
        '</div>';
      const ред = (ик, време, текст, към, клас) => '<li><button type="button" class="pl-bb-row pl-soft' + (клас ? ' ' + клас : '') + '" data-go="' + към + '" data-view="1">' +
        ико(ик, 'pl-bb-ri') + '<b>' + време + '</b><span>' + текст + '</span><em aria-hidden="true">›</em></button></li>';
      const редове = д.събития.slice(0, 4).map(с => ред(с.вид === 'храна' ? 'шише' : 'луна', с.жив ? 'сега' : часът(с.ts), esc(с.текст), с.към, с.жив ? 'is-live' : ''));
      if (д.пелени) редове.push(ред('боди', 'днес', 'Пелени днес: ' + д.пелени + (д.мокри && д.каки ? ' <small>(' + д.мокри + ' мокри, ' + д.каки + ' каки)</small>' : ''), 'пелени', 'is-day'));
      html += '<div class="pl-bb-logh"><h3>Днешни записи</h3><button type="button" class="pl-bb-all" data-go="всички" data-view="1">Виж всички <span aria-hidden="true">›</span></button></div>' +
        '<ul class="pl-bb-log">' + редове.join('') + '</ul>' +
        (д.събития.length > 4 ? '<p class="pl-bb-more">и още ' + (д.събития.length - 4) + ' по-рано днес</p>' : '') +
        '<p class="pl-bb-note">Записките не заменят преглед.</p>';
    }
    пиши(б.querySelector('.pl-bb-live'), html);

    // рафтовете: последното мерене (rooms2.js:472–473 → bl_growth) и златните „първи пъти“ (rooms2.js:1574–1581 → bl_firsts)
    const р = чети('bl_growth', []);
    const посл = Array.isArray(р) && р.length ? р[р.length - 1] : null;
    const кг = посл && посл.w != null && isFinite(+посл.w) ? (+посл.w).toLocaleString('bg-BG') : '';
    const дт = посл && /^\d{4}-\d\d-\d\d$/.test(посл.d || '') ? '<br>мерено на ' + +посл.d.slice(8) + '.' + посл.d.slice(5, 7) : '';
    пиши(б.querySelector('.pl-bb-t1'), кг ? 'Последно: ' + esc(кг) + ' кг' + дт : 'Следи развитието му с любов');
    const ф = чети('bl_firsts', {});
    const брФ = ф && typeof ф === 'object' ? Object.keys(ф).filter(к => ф[к]).length : 0;
    пиши(б.querySelector('.pl-bb-t2'), брФ ? брФ + ' ' + бр(брФ, 'златен миг', 'златни мига') + '<br>' + бр(брФ, 'вече записан', 'вече записани') : 'Малките постижения са големи радости');
  }

  // ── мястото: под банера, преди картите; не се бие с други premium блокове (pl-*) между нас ──
  function мястото(стая, б) {
    const банер = стая.querySelector(':scope > .pl-rhero');
    let добре = б.parentNode === стая && (!банер || (банер.compareDocumentPosition(б) & Node.DOCUMENT_POSITION_FOLLOWING));
    for (let е = б.previousElementSibling; добре && е; е = е.previousElementSibling) {
      if (!/(^|\s)pl-/.test(е.className && е.className.baseVal == null ? е.className : '')) добре = false;   // пред нас има карта/кътче
    }
    if (добре) return;
    стая.insertBefore(б, банер ? банер.nextSibling : стая.firstChild);
  }

  function еБебето() { const п = document.querySelector('#roomOverlay .ro-panel'); return !!(п && п.classList.contains('ro-sky')); }

  function сложи() {
    try {
      const ов = document.getElementById('roomOverlay');
      if (!ов) return;
      const бебе = !ов.hidden && еБебето();
      document.querySelectorAll('#roRoom').forEach(стая => {
        let б = стая.querySelector(':scope > .pl-bb');
        // рисуваме само когато картите-цели са там (иначе бутоните биха водили на празно)
        if (!бебе || !стая.querySelector('.bb-dip')) { if (б) б.remove(); return; }
        if (!б) б = рисувай();
        мястото(стая, б);
        опресни(б);
      });
    } catch (e) { грешки.push(String(e && e.stack || e).slice(0, 300)); }
  }

  // 🪤 #roRoom се СМЕНЯ с нов елемент при отваряне на стая → гледаме статичния #roomOverlay,
  //   с поддърво; отлагане с таймер (requestAnimationFrame спира, когато страницата не се рисува).
  let чака = false;
  function отложено() { if (чака) return; чака = true; setTimeout(() => { чака = false; сложи(); }, 40); }
  function опресниВсички() { if (document.hidden) return; document.querySelectorAll('#roRoom > .pl-bb').forEach(б => { try { опресни(б); } catch (e) { грешки.push(String(e)); } }); }

  function върви() {
    const ов = document.getElementById('roomOverlay');
    if (!ов) return;
    new MutationObserver(отложено).observe(ов, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] });
    отложено();
    // запис от друг раздел, връщане в приложението и „спи от 35м“ да не застива
    window.addEventListener('storage', e => { if (!e.key || /^bl_(nursing|feed|feedlog|sleep|diapers|growth|firsts|baby|photos)$/.test(e.key)) опресниВсички(); });
    document.addEventListener('visibilitychange', опресниВсички);
    setInterval(опресниВсички, 30000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', върви); else върви();
  window.BL_PL_BEBE = { денят, бебето, сложи, иди, грешки };
})();
