/* ═══════════════════════════════════════════════════════════════════════════════
   🥄 „ПЪРВИТЕ ЛЪЖИЧКИ · НАШЕТО МЕНЮ“ · стаята „Захранване“ (референция 10, 22.09.2026)
   Веднага под банера на стаята (.pl-rhero от premium-rooms.js), преди всичко друго:
   отворена книга-меню „Нашето меню ♡“ — седемте дни на седмицата (днешният розов гел),
   листче с храната на избрания ден и три плочки Опитани / Любими / Бележки; отдолу рафт
   с три арки Храни / Рецепти / Дневник и розовият гел „+ Добави хранене“.

   НИЩО НЕ ЗАПИСВА И НЕ СЪЗДАВА КЛЮЧОВЕ. Изборът на ден в книгата е само поглед (в паметта
   на страницата). Всеки бутон вика СЪЩЕСТВУВАЩОТО: „Планирай/Промени“ натиска ИСТИНСКАТА
   клетка на деня в „Меню за седмицата“ (rooms3.js:1080–1101; кликът е :1099 → pick(key, cell), който
   отваря стария избор от опитаното); „Виж рецептата“ докарва и осветява истинската
   рецепта в „Рецепти-карти“; плочките и арките скролват до истинските карти и кътчета
   (разгъват сгънатите с ТЕХНИЯ ▾ — polish.js:226–247 пази bl_folds и aria-expanded).

   ДАННИТЕ — от същите ключове, по правилата на кода, който ги пише:
     · менюто = bl_menu['ГГГГ-ММ-ДД'] = низ (rooms3.js:1121, :1137); седмицата е
       понеделник…неделя на текущата — същата сметка като картата (rooms3.js:1080–1085);
     · опитани = ключовете на bl_tried (храна → реакция; пише rooms2.js:1317–1323,
       cycleTried; реакциите са '😋 хареса' / '😐 неутрално' / '🤢 отказа' / '⚠️ реакция');
     · любими = храните с 😋 — същото правило като „Какво обича“ (rooms14.js:229–230);
     · с реакция = съдържа '⚠️' — същото като Алергия-паспорта (rooms3.js:1280);
     · бележки = bl_notes_food[] с поле t (пише rooms2.js:2577 notesCard; брои се със
       същия филтър като списъка ѝ, rooms2.js:2551 `x && x.t != null`).
   Нула без запис не е „0“ — тогава стои покана („+ отбележи“, „+ напиши“, „Планирай“).
   Щом има записи — „Записките не заменят преглед.“

   🪤 „+ Добави хранене“ НЕ натиска „+“ на приложението: менюто му е ПОД стаята (z-index,
   виж pl-bebe.js:26–31). Разгръща собствен избор от 6 точки и всяка води до СЪЩЕСТВУВАЩА
   карта: менюто днес, нова храна (календарът), дъгата, бележка, снимка на гримасата, а
   кърмата/шишето — в „Моето бебе“ („Кога яде за последно“, където е истинският запис).

   ПЪТ НАЗАД: махни <script src="js/pl-hranene.js"> и <link href="css/pl-hranene.css">
   (ако са вкарани в index.html). Блокът е само добавен елемент — стаята остава каквато беше.
   ═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.BL_PL_HRANENE) return;

  const ДНИ = ['понеделник', 'вторник', 'сряда', 'четвъртък', 'петък', 'събота', 'неделя'];
  const БУКВИ = ['П', 'В', 'С', 'Ч', 'П', 'С', 'Н'];
  const В_ДЕН = ['в понеделник', 'във вторник', 'в сряда', 'в четвъртък', 'в петък', 'в събота', 'в неделя'];
  const грешки = [];

  const чети = (к, по) => { try { const v = JSON.parse(localStorage.getItem(к)); return v == null ? по : v; } catch (e) { return по; } };
  const обект = v => (v && typeof v === 'object' && !Array.isArray(v)) ? v : {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ч => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ч]));
  const двуц = n => String(n).padStart(2, '0');
  const локалнаДата = д => д.getFullYear() + '-' + двуц(д.getMonth() + 1) + '-' + двуц(д.getDate());
  const главна = s => s.charAt(0).toUpperCase() + s.slice(1);
  // 🪤 цифрите в серифен текст отиват на Nunito — Georgia рисува „старинни“ цифри (0 като „о“)
  const цифри = s => esc(s).replace(/\d+(?:[.,:]\d+)*/g, м => '<span class="pl-hr-dg">' + м + '</span>');

  // Плюшените иконки: [лист, ред, колона] → фон на елемента (🪤 относителен url в JS е спрямо
  // страницата; в CSS променлива щеше да е спрямо css/ и 404).
  const ИК = {
    цвете: ['ico-f', 1, 1], маргарити: ['ico-f', 2, 1], календар: ['ico-a', 0, 1], шише: ['ico-a', 1, 0], купичка: ['ico-f', 1, 0],
    плодове: ['ico-f', 1, 2], тефтер: ['ico-f', 1, 3], молив: ['ico-b', 0, 3], апарат: ['ico-b', 1, 1],
    палитра: ['ico-b', 2, 2], табло: ['ico-f', 2, 0], сърца: ['ico-c', 2, 1], рецепти: ['ico-e', 1, 0], листо: ['ico-e', 3, 2],
  };
  const ико = (име, клас) => { const и = ИК[име]; return '<i class="' + клас + '" aria-hidden="true" style="background-image:url(img/art/' + и[0] + '.webp);background-position:' + (и[2] * 100 / 3).toFixed(3) + '% ' + (и[1] * 100 / 3).toFixed(3) + '%"></i>'; };

  // ── 📅 седмицата: понеделник…неделя на текущата (същото като rooms3.js:1080–1085) ──
  function седмицата() {
    const пон = new Date(); пон.setDate(пон.getDate() - (пон.getDay() + 6) % 7);
    const out = [];
    for (let i = 0; i < 7; i++) { const д = new Date(пон); д.setDate(д.getDate() + i); out.push(локалнаДата(д)); }
    return out;
  }

  // ── 📊 данните — само четене ──
  function данните() {
    const меню = обект(чети('bl_menu', {}));
    const опит = обект(чети('bl_tried', {}));
    const имена = Object.keys(опит);
    const бел = чети('bl_notes_food', []);
    return {
      меню,
      опитани: имена.length,
      любими: имена.filter(к => /😋/.test(String(опит[к] || ''))).length,
      реакции: имена.filter(к => String(опит[к] || '').includes('⚠️')).length,
      бележки: Array.isArray(бел) ? бел.filter(x => x && x.t != null).length : 0,
    };
  }
  const храната = (меню, ключ) => { const v = меню[ключ]; return typeof v === 'string' && v.trim() ? v.trim() : ''; };

  // ── 🔎 картите на стаята (заглавията са от rooms2/3/4/14.js, expr.js) ──
  function картата(стая, дума) {
    const всички = [...стая.querySelectorAll('section.jr-card')].filter(к => { const т = к.querySelector('.jr-title'); return т && (т.textContent || '').includes(дума); });
    let к = всички.find(x => x.getClientRects().length) || всички[0] || null;
    // скрита от търсачката на стаята (polish.js:78–89 слага display:none) — чистим полето
    // по СЪЩИЯ път, по който мама би го изтрила (събитие input), и търсим наново
    if (к && к.style.display === 'none') {
      const т = стая.querySelector('.sec-find');
      if (т && т.value) { т.value = ''; т.dispatchEvent(new Event('input', { bubbles: true })); к = всички.find(x => x.getClientRects().length) || к; }
    }
    return к;
  }
  function разгъни(к) { if (к && к.classList.contains('folded')) { const ф = к.querySelector('.fold-btn'); if (ф) ф.click(); else к.classList.remove('folded'); } }

  // 🍲 рецептите се четат от ИСТИНСКАТА карта (rooms3.js:1188–1189: strong = име, .rp-ing =
  //   съставки с „ · “) — без второ копие на списъка, което да се разминава с него.
  //   Съвпадение по правилото на самата карта (rooms3.js:1174–1178): дума над 2 букви, чиято
  //   първа четворка започва съставка; подредбата: точна съставка 2, начало 1, в името +1.
  function съвпадения(корен, храна) {
    const думи = String(храна).toLowerCase().split(/[^\p{L}]+/u).filter(x => x.length > 2);
    if (!думи.length) return [];
    return [...корен.querySelectorAll('.rp-card')].map(к => {
      const име = ((к.querySelector('.rp-top strong') || {}).textContent || '').toLowerCase();
      const съст = ((к.querySelector('.rp-ing') || {}).textContent || '').toLowerCase().split('·').map(x => x.trim()).filter(Boolean);
      let т = 0, има = false;
      думи.forEach(д => {
        if (съст.includes(д)) { т += 2; има = true; } else if (съст.some(г => г.startsWith(д.slice(0, 4)))) { т += 1; има = true; }
        if (име.includes(д)) т += 1;
      });
      return { к, т: има ? т : 0 };
    }).filter(x => x.т > 0).sort((a, b) => b.т - a.т);
  }

  function светни(е) {
    if (!е) return;
    е.setAttribute('data-pl-hr-spot', '1');
    clearTimeout(е._plHrSpot);
    е._plHrSpot = setTimeout(() => е.removeAttribute('data-pl-hr-spot'), 2600);
  }
  function фокусирай(е) { if (!е) return; try { е.focus({ preventScroll: true }); } catch (x) { е.focus(); } }
  const плавно = () => !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  // 🪤 (ИЗМЕРЕНО в pl-bebe.js:163–193): плавното скролване спира с целта ИЗВЪН екрана —
  //   картите над нея растат, докато минаваме покрай тях. След скока „догонваме“ с таймер
  //   (не rAF), до ~3 с; докосне ли мама екрана — спираме веднага. Скролва се #roRoom.
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
      if (Math.abs(д) > 8) { добри = 0; стая.scrollTop += д; }
      else if (++добри >= 2) return;
      setTimeout(провери, 250);
    };
    setTimeout(провери, 650);
  }

  // скок до карта: разгъване с НЕЙНИЯ ▾, докарване, осветяване, фокус на истинския контрол
  // (без такъв — на ▾: четецът казва „Сгъни „…““, клавиатурата е в картата)
  function към(стая, дума, о) {
    о = о || {};
    const к = картата(стая, дума);
    if (!к) return false;
    разгъни(к);
    const цел = о.фокус ? о.фокус(к) : null;
    докарай(цел || к, цел ? 'center' : 'start');
    светни(о.свети ? (о.свети(к) || к) : к);
    фокусирай(цел || к.querySelector('.fold-btn'));
    return true;
  }
  // кътче: кликът на неговата плочка скача до .sec-head (polish.js:100–102); ние само догонваме
  function кътче(стая, име) {
    const ч = [...стая.querySelectorAll('.sec-nav .sec-chip')].find(б => (б.getAttribute('aria-label') || б.textContent || '').includes(име));
    const г = [...стая.querySelectorAll('.sec-head')].find(х => (х.textContent || '').includes(име));
    if (!ч && !г) return false;
    if (ч) ч.click();
    if (г) {
      докарай(г, 'start', !!ч);
      const п = г.nextElementSibling;
      if (п && п.matches('section.jr-card')) фокусирай(п.querySelector('.fold-btn'));
    }
    return true;
  }

  // 📅 денят в ИСТИНСКОТО меню: кликът е същият като пръста на мама → pick(key, cell)
  //   (rooms3.js:1099) отваря стария избор; фокусът остава на деня, изборът е веднага след него
  function отвориДен(стая, ключ) {
    const к = картата(стая, 'Меню за седмицата');
    if (!к) return false;
    разгъни(к);
    const м = ', ' + ключ.slice(8) + '.' + ключ.slice(5, 7);
    const кл = [...к.querySelectorAll('.mn-cell')].find(x => (x.getAttribute('aria-label') || '').includes(м));
    if (!кл) { докарай(к, 'start'); светни(к); фокусирай(к.querySelector('.fold-btn')); return true; }
    кл.click();
    const п = к.querySelector('.mn-picker');
    докарай(п && !п.hidden ? п : кл, 'center');
    светни(кл);
    фокусирай(кл);
    return true;
  }

  function къмРецептата(стая, храна) {
    const к = картата(стая, 'Рецепти-карти');
    if (!к) return false;
    разгъни(к);
    let с = съвпадения(к, храна);
    if (!с.length) {   // „имам: …“ крие картите — чистим го по пътя на мама (събитие input, rooms3.js:1204)
      const и = к.querySelector('input.jr-word');
      if (и && и.value) { и.value = ''; и.dispatchEvent(new Event('input', { bubbles: true })); с = съвпадения(к, храна); }
    }
    if (!с.length) { докарай(к, 'start'); светни(к); фокусирай(к.querySelector('.fold-btn')); return true; }
    const най = с[0].к;
    докарай(най, 'center');
    с.filter(x => x.т === с[0].т).forEach(x => светни(x.к));
    фокусирай(най.querySelector('.jr-chip') || к.querySelector('.fold-btn'));
    return true;
  }

  // кърмата/шишето са в „Моето бебе“: друга стая се рисува наново (нов #roRoom) — чакаме с
  // таймер (до ~4 с) видимата карта; мама може междувременно да е затворила стаята — спираме.
  function следДругата(дума, фокус) {
    let пъти = 0;
    const опитай = () => {
      const ов = document.getElementById('roomOverlay');
      if (!ов || ов.hidden || ++пъти > 20) return;
      let к = null;
      document.querySelectorAll('#roRoom').forEach(с => { const х = картата(с, дума); if (!к && х && х.getClientRects().length) к = х; });
      if (!к) { setTimeout(опитай, 200); return; }
      разгъни(к);
      const ц = фокус ? фокус(к) : null;
      докарай(ц || к, ц ? 'center' : 'start');
      светни(ц ? (к.querySelector('.jr-quick') || к) : к);
      фокусирай(ц || к.querySelector('.fold-btn'));
    };
    setTimeout(опитай, 350);
  }

  const бутонСТекст = (к, сел, re) => [...к.querySelectorAll(сел)].find(x => re.test(x.textContent || ''));
  const календар = стая => към(стая, 'Календар на храните', { фокус: к => к.querySelector('.fd-grid .fd-card:not(.tried)') || к.querySelector('.fd-grid .fd-card'), свети: к => к.querySelector('.fd-grid') });

  function иди(блок, ключ) {
    const стая = блок.closest('#roRoom') || document.getElementById('roRoom');
    if (!стая) return false;
    const д = данните();
    const ден = избраният(блок);
    switch (ключ) {
      case 'храни': return кътче(стая, 'Храните');
      case 'дневник': return кътче(стая, 'Помним');
      case 'рецепти': return към(стая, 'Рецепти-карти', { свети: к => к.querySelector('.rp-list') });
      case 'опитани': return д.опитани ? към(стая, 'Дневник на опитаното', { свети: к => к.querySelector('.fd-triedlist') }) : календар(стая);
      case 'любими': return д.любими ? към(стая, 'Какво обича') : календар(стая);
      case 'бележки':
        return д.бележки ? към(стая, 'Хранителни бележки', { свети: к => к.querySelector('.nt-list') })
                         : към(стая, 'Хранителни бележки', { фокус: к => к.querySelector('textarea.jr-paper') });
      case 'план': return отвориДен(стая, ден);
      case 'рецепта': return къмРецептата(стая, храната(д.меню, ден));
      case 'днес': return отвориДен(стая, локалнаДата(new Date()));
      case 'нова': return календар(стая);
      case 'дъга': return към(стая, 'Дъгата на седмицата', { фокус: к => к.querySelector('.jr-quick .jr-chip[aria-pressed="false"]') || к.querySelector('.jr-quick .jr-chip'), свети: к => к.querySelector('.rb-box') });
      case 'бележка': return към(стая, 'Хранителни бележки', { фокус: к => к.querySelector('textarea.jr-paper') });
      case 'гримаса': return към(стая, 'Първата реакция', { фокус: к => бутонСТекст(к, '.jr-btn', /Добави снимка/) });
      case 'мляко':
        try {
          if (window.MamaHelper && MamaHelper.open) {
            MamaHelper.open('Моето бебе');
            следДругата('Кога яде за последно', к => бутонСТекст(к, '.jr-quick .jr-chip', /Ляво/) || к.querySelector('.jr-quick .jr-chip'));
            return true;
          }
        } catch (e) { грешки.push(String(e)); }
        return false;
    }
    return false;
  }

  // избраният ден е само поглед: пази се в елемента; ако седмицата е сменена — днес
  function избраният(б) {
    const с = седмицата(), д = локалнаДата(new Date());
    return б._ден && с.includes(б._ден) ? б._ден : д;
  }

  // ── рисунката: скелетът се строи веднъж, живите части се пишат САМО при разлика ──
  let номер = 0;
  function рисувай() {
    const с = document.createElement('section');
    с.className = 'pl-hr';
    с.setAttribute('data-pl', 'hranene');
    с.setAttribute('aria-label', 'Нашето меню');
    const мид = 'plHrMenu' + (++номер);   // стаята може да е нарисувана два пъти — id без повторение
    const плочка = (ключ, ик, надпис) => '<button type="button" class="pl-hr-t pl-soft t-' + ключ + '" data-go="' + ключ + '">' + ико(ик, 'pl-hr-ti') +
      '<span class="pl-hr-tt"><b>' + надпис + '</b><span class="pl-hr-tn"></span></span><em aria-hidden="true">›</em></button>';
    const арка = (ключ, ик, надпис, етикет) => '<button type="button" class="pl-hr-a t-' + ключ + '" data-go="' + ключ + '" aria-label="' + етикет + '">' +
      '<span class="pl-hr-dome">' + ико(ик, 'pl-hr-ai') + '</span><span class="pl-hr-al">' + надпис + '</span></button>';
    const точка = (ключ, ик, надпис) => '<button type="button" class="pl-hr-mi pl-soft" data-go="' + ключ + '">' + ико(ик, 'pl-hr-mico') + '<span>' + надпис + '</span></button>';
    с.innerHTML =
      '<div class="pl-hr-book">' +
        '<div class="pl-hr-sheet pl-felt">' +
          '<span class="pl-hr-deco" aria-hidden="true">' + ико('листо', 'pl-hr-lf') + ико('маргарити', 'pl-hr-fl') + '</span>' +
          '<h3 class="pl-hr-h">Нашето меню<svg class="pl-hr-hs" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.3s-7.6-4.6-7.6-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.6 2.5c0 5.6-7.6 10.2-7.6 10.2z"/></svg></h3>' +
          '<div class="pl-hr-days" role="group" aria-label="Дните от седмицата"></div>' +
          '<div class="pl-hr-body">' +
            '<div class="pl-hr-dish" aria-live="polite"></div>' +
            '<div class="pl-hr-tiles">' + плочка('опитани', 'цвете', 'Опитани') + плочка('любими', 'сърца', 'Любими') + плочка('бележки', 'табло', 'Бележки') + '</div>' +
          '</div>' +
          '<p class="pl-hr-note" hidden>Записките не заменят преглед.</p>' +
        '</div>' +
      '</div>' +
      '<div class="pl-hr-shelf">' +
        арка('храни', 'плодове', 'Храни', 'Храни — към кътчето „Храните“') +
        арка('рецепти', 'рецепти', 'Рецепти', 'Рецепти — към „Рецепти-карти“') +
        арка('дневник', 'тефтер', 'Дневник', 'Дневник — към кътчето „Помним“') +
        '<i class="pl-hr-ring r1" aria-hidden="true"></i><i class="pl-hr-ring r2" aria-hidden="true"></i>' +
      '</div>' +
      '<button type="button" class="pl-hr-cta pl-gel" data-go="меню" aria-expanded="false" aria-controls="' + мид + '"><b aria-hidden="true"></b>Добави хранене</button>' +
      '<div class="pl-hr-menu" id="' + мид + '" role="group" aria-label="Какво да запиша" hidden>' +
        точка('днес', 'календар', 'Менюто днес') + точка('нова', 'плодове', 'Нова храна') + точка('дъга', 'палитра', 'Цветове') +
        точка('бележка', 'молив', 'Бележка') + точка('гримаса', 'апарат', 'Снимка') + точка('мляко', 'шише', 'Кърма · шише') +
      '</div>';
    const меню = с.querySelector('.pl-hr-menu'), cta = с.querySelector('.pl-hr-cta');
    const затвори = () => { меню.hidden = true; cta.setAttribute('aria-expanded', 'false'); };
    с.addEventListener('click', e => {
      const т = e.target.closest('[data-day], [data-go]');
      if (!т || !с.contains(т)) return;
      if (т.hasAttribute('data-day')) { с._ден = т.getAttribute('data-day'); опресни(с); return; }
      const к = т.getAttribute('data-go');
      if (к === 'меню') { const отвори = меню.hidden; меню.hidden = !отвори; cta.setAttribute('aria-expanded', отвори ? 'true' : 'false'); return; }
      if (т.closest('.pl-hr-menu')) затвори();
      иди(с, к);
    });
    // Esc затваря само НАЙ-ГОРНИЯ слой — отвореният избор, не стаята (🪤 ИЗМЕРЕНО, ag2_hranene_funk:
    //   без това Esc стигаше до helper.js:5573 и затваряше цялата стая). Знакът __blСлойПоет е
    //   уговорката на приложението за „този Esc е поет“ (helper.js:5579).
    с.addEventListener('keydown', e => {
      if (e.key !== 'Escape' || меню.hidden) return;
      e.preventDefault(); e.stopPropagation(); e.__blСлойПоет = true;
      затвори(); фокусирай(cta);
    });
    return с;
  }

  // пише innerHTML/атрибут само ако е друг от последно написания (🪤 иначе всяка мутация
  // вика наблюдателя, той — нас, и кръгът става безкраен)
  function пиши(е, html) { if (е && е._pl !== html) { е._pl = html; е.innerHTML = html; } }
  function атр(е, и, v) { if (е && е.getAttribute(и) !== v) е.setAttribute(и, v); }

  function опресни(б) {
    const д = данните(), сед = седмицата(), днес = локалнаДата(new Date()), избран = избраният(б);

    // ── дните: седемте бутона се строят веднъж за седмицата; после само атрибутите им ──
    const дни = б.querySelector('.pl-hr-days');
    if (дни._сед !== сед.join()) {
      дни._сед = сед.join();
      дни.innerHTML = сед.map((к, i) => '<button type="button" class="pl-hr-d" data-day="' + к + '">' + БУКВИ[i] + '<i aria-hidden="true"></i></button>').join('');
    }
    [...дни.children].forEach((бт, i) => {
      const к = сед[i], храна = храната(д.меню, к), еДнес = к === днес;
      // 🪤 класовете се превключват поотделно, не с className = … — чужд код (анимациите)
      //   слага свои класове по елементите на стаята; презаписът би ги махал → вечен кръг
      const кл = бт.classList, иска = { 'pl-gel': еДнес, 'is-today': еДнес, 'pl-soft': !еДнес, 'has-food': !!храна };
      for (const к2 in иска) if (кл.contains(к2) !== иска[к2]) кл.toggle(к2, иска[к2]);
      атр(бт, 'aria-pressed', к === избран ? 'true' : 'false');
      атр(бт, 'aria-label', главна(ДНИ[i]) + ', ' + +к.slice(8) + '.' + к.slice(5, 7) + (еДнес ? ' (днес)' : '') + (храна ? ': ' + храна : ' — още празно'));
    });

    // ── листчето на избрания ден ──
    const и = сед.indexOf(избран), храна = храната(д.меню, избран), еДнес = избран === днес;
    const деня = еДнес ? 'Днес' : главна(ДНИ[и]);
    let html;
    if (храна) {
      const стая = б.closest('#roRoom');
      const рец = стая ? съвпадения(стая, храна) : [];
      html = '<div class="pl-hr-photo" aria-hidden="true"><i class="pl-hr-plate"></i>' + ико('купичка', 'pl-hr-bowl') + ико('плодове', 'pl-hr-veg') + '</div>' +
        (рец.length ? '<button type="button" class="pl-hr-edit pl-soft" data-go="план" aria-label="Промени менюто ' + В_ДЕН[и] + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z" fill="currentColor"/><path d="M13.5 6.5l4 4" stroke="#fff" stroke-width="1.4"/></svg></button>' : '') +
        '<p class="pl-hr-dt">' + цифри(храна) + '</p>' +
        '<p class="pl-hr-ds">' + деня + ' · в менюто</p>' +
        (рец.length
          ? '<button type="button" class="pl-hr-go pl-gel" data-go="рецепта">' + (рец.length > 1 && рец[1].т === рец[0].т ? 'Виж рецептите' : 'Виж рецептата') + '<span aria-hidden="true">›</span></button>'
          : '<button type="button" class="pl-hr-go pl-gel" data-go="план" aria-label="Промени менюто ' + В_ДЕН[и] + '">Промени<span aria-hidden="true">›</span></button>');
    } else {
      // празен ден — покана, не „нищо“
      const минал = избран < днес;
      html = '<div class="pl-hr-photo is-empty" aria-hidden="true"><i class="pl-hr-plate"></i>' + ико('купичка', 'pl-hr-bowl') + '<i class="pl-hr-plus"></i></div>' +
        '<p class="pl-hr-dt">' + (еДнес ? 'Какво ще има днес?' : минал ? 'Какво имаше ' + В_ДЕН[и] + '?' : 'Какво ще има ' + В_ДЕН[и] + '?') + '</p>' +
        '<p class="pl-hr-ds">' + (д.опитани ? 'Избери от опитаното' : 'Напиши го в менюто') + '</p>' +
        '<button type="button" class="pl-hr-go pl-gel" data-go="план" aria-label="' + (минал ? 'Запиши' : 'Планирай') + ' менюто ' + В_ДЕН[и] + '">' + (минал ? 'Запиши' : 'Планирай') + '<span aria-hidden="true">›</span></button>';
    }
    пиши(б.querySelector('.pl-hr-dish'), html);

    // ── плочките: число или покана ──
    const плочка = (ключ, число, покана, етикет, доп) => {
      const т = б.querySelector('.pl-hr-t.t-' + ключ);
      if (!т) return;
      пиши(т.querySelector('.pl-hr-tn'), число
        ? '<span class="pl-hr-n">' + число + '</span>' + (доп ? '<small class="pl-hr-x">' + доп + '</small>' : '')
        : '<span class="pl-hr-inv"><b aria-hidden="true">+</b>' + покана + '</span>');   // покана, не „0“
      атр(т, 'aria-label', етикет);
    };
    плочка('опитани', д.опитани, 'отбележи',
      д.опитани ? 'Опитани храни: ' + д.опитани + (д.реакции ? ', ' + д.реакции + ' с отбелязана реакция' : '') + ' — към Дневника на опитаното' : 'Още няма опитани храни — отбележи първата в Календара на храните',
      д.реакции ? д.реакции + ' с реакция' : '');
    плочка('любими', д.любими, 'отбележи',
      д.любими ? 'Любими храни: ' + д.любими + ' — към „Какво обича“' : 'Още няма любими — отбележи „хареса“ в Календара на храните');
    плочка('бележки', д.бележки, 'напиши',
      д.бележки ? 'Хранителни бележки: ' + д.бележки + ' — към бележките' : 'Напиши първата хранителна бележка');
    const бел = б.querySelector('.pl-hr-note');
    const има = !!(д.опитани || д.бележки);
    if (бел && бел.hidden === има) бел.hidden = !има;
  }

  // ── мястото: под банера, преди картите; не се бие с други premium блокове (pl-*) между нас ──
  function мястото(стая, б) {
    const банер = стая.querySelector(':scope > .pl-rhero');
    let добре = б.parentNode === стая && (!банер || (банер.compareDocumentPosition(б) & Node.DOCUMENT_POSITION_FOLLOWING));
    for (let е = б.previousElementSibling; добре && е; е = е.previousElementSibling) {
      if (!/(^|\s)pl-/.test(typeof е.className === 'string' ? е.className : '')) добре = false;   // пред нас има карта/кътче
    }
    if (добре) return;
    стая.insertBefore(б, банер ? банер.nextSibling : стая.firstChild);
  }

  function еЗахранване() { const п = document.querySelector('#roomOverlay .ro-panel'); return !!(п && п.classList.contains('ro-carrot')); }

  function сложи() {
    try {
      const ов = document.getElementById('roomOverlay');
      if (!ов) return;
      const тук = !ов.hidden && еЗахранване();
      document.querySelectorAll('#roRoom').forEach(стая => {
        let б = стая.querySelector(':scope > .pl-hr');
        // рисуваме само когато истинското меню е там (иначе бутоните биха водили на празно)
        if (!тук || !стая.querySelector('.mn-grid')) { if (б) б.remove(); return; }
        if (!б) б = рисувай();
        мястото(стая, б);
        опресни(б);
      });
    } catch (e) { грешки.push(String(e && e.stack || e).slice(0, 300)); }
  }

  // 🪤 #roRoom се СМЕНЯ с нов елемент при отваряне на стая → гледаме статичния #roomOverlay,
  //   с поддърво; отлагане с таймер (requestAnimationFrame спира, когато страницата не се рисува).
  //   Записите в картите на стаята (менюто, календарът, бележките) сменят DOM-а им → и нас.
  let чака = false;
  function отложено() { if (чака) return; чака = true; setTimeout(() => { чака = false; сложи(); }, 40); }
  function опресниВсички() { if (document.hidden) return; document.querySelectorAll('#roRoom > .pl-hr').forEach(б => { try { опресни(б); } catch (e) { грешки.push(String(e)); } }); }

  function върви() {
    const ов = document.getElementById('roomOverlay');
    if (!ов) return;
    new MutationObserver(отложено).observe(ов, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] });
    отложено();
    // запис от друг раздел, връщане в приложението и полунощ (новият ден става розов)
    window.addEventListener('storage', e => { if (!e.key || /^bl_(menu|tried|notes_food)$/.test(e.key)) опресниВсички(); });
    document.addEventListener('visibilitychange', опресниВсички);
    setInterval(опресниВсички, 60000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', върви); else върви();
  window.BL_PL_HRANENE = { данните, седмицата, съвпадения, сложи, иди, грешки };
})();
