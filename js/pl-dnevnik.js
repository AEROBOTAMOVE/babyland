/* ═══════════════════════════════════════════════════════════════════════════════
   📔 PREMIUM ТЕФТЕРЪТ „ДНЕС ЗА ТЕБ“ · стаята „Дневник на мама“ (Луна) · 22.09.2026
   Референции 11 (тефтер с лавандула и люлякова панделка на розов облак) и 17 („И ти си
   важна“ — серифно заглавие, кръгли плюшени бутони, розово хапче). Веднага под банера
   (.pl-rhero от premium-rooms.js) в #roRoom:
     · „Днес за теб · {ден, дата}“ и голям серифен въпрос „Как си днес?“;
     · 5 кръгли бутона-личица → натискат СЪЩЕСТВУВАЩОТО личице .ck-st на картата
       „Как си днес?“ (rooms.js:193-203 → избери) и после НЕЙНИЯ бутон „Запиши 💜 / Обнови ✔“
       (rooms.js:257-300). Записът в bl_checkins, пресният прочит, провалът при пълна памет,
       прегръдката при тежък ден, седмицата — всичко остава на rooms.js. Втори склад няма.
     · „Последно написано“ — най-новият ред от bl_freepage (картата „Свободна страница ✍️“,
       rooms2.js:2835 → notesCard rooms2.js:2506-2601), само първите ~120 знака.
       🔒 При сложена ключалка (BL_PIN.has(), extras.js:840/969) текст НЕ се показва — по
       същото правило като годишника (yearbook.js:117-118: „Заключеното не отива на хартия“).
     · розово „✍️ Пиши“ → скача до „Свободна страница“, разгъва я с НЕЙНИЯ ▾ (polish.js:226-253)
       и слага курсора в НЕЙНОТО поле.
   НИЩО НЕ ЗАПИСВА САМО. Нито един нов ключ в localStorage (в този файл няма setItem/removeItem).
   22.09 (сцените): облеклото е от css/pl-ui.css — страницата .pl-felt, хапчетата-етикети и
   второстепенните бутони .pl-soft (избраното .on), „Пиши“ .pl-gel; фигурите — плюшените спрайтове
   (лотос, луна, тефтер, молив, катинар). Цифрите в откъса — <span class="pl-dn-n"> на Nunito.
   Старата карта-герой „Днес за теб“ (roomhero.js:174-178) се скрива от css/pl-dnevnik.css само
   докато този тефтер стои над нея: казва същото (въпросът + „Запиши едно изречение“).
   ПЪТ НАЗАД: махни <link href="css/pl-dnevnik.css"> и <script src="js/pl-dnevnik.js"> от
   index.html — героят се връща сам (скрива го само селектор „.pl-dn ~ .rh-hero“).
   ═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.BL_PL_DNEVNIK) return;
  const грешки = [];

  // Чете като load() в rooms.js:63-77 / rooms2.js:10 — повреден запис или сменен тип = стойността по подразбиране.
  const чети = (к, по) => {
    try {
      const v = JSON.parse(localStorage.getItem(к));
      if (v == null) return по;
      if (Array.isArray(по) !== Array.isArray(v)) return по;
      if (по && typeof по === 'object' && (!v || typeof v !== 'object')) return по;
      return v;
    } catch (e) { return по; }
  };
  const двуц = n => String(n).padStart(2, '0');
  // ключът на деня — ТОЧНО като rooms.js:98-99 (localDate/today): местна дата, не UTC
  const деньКлюч = д => д.getFullYear() + '-' + двуц(д.getMonth() + 1) + '-' + двуц(д.getDate());
  const ДНИ = ['неделя', 'понеделник', 'вторник', 'сряда', 'четвъртък', 'петък', 'събота'];
  const МЕСЕЦИ = ['януари', 'февруари', 'март', 'април', 'май', 'юни', 'юли', 'август', 'септември', 'октомври', 'ноември', 'декември'];
  const МЕС = ['яну', 'фев', 'мар', 'апр', 'май', 'юни', 'юли', 'авг', 'сеп', 'окт', 'ное', 'дек'];
  // rooms.js:112 MOODS и rooms.js:187 ИМЕНА — същият ред, същите индекси (m = 0…4 в bl_checkins)
  const ЛИЦА = ['😩', '😔', '😐', '🙂', '🥰'];
  const ИМЕНА = ['много тежко', 'тъжно', 'горе-долу', 'добре', 'чудесно'];
  // видимият етикет е хапче на ЕДИН ред (реф. 17). „много тежко“ = 86 px при колона 68 px (мерено,
  // ag2_dnevnik_vid.js) — застъпваше „тъжно“ и минаваше през шева. На екрана: „тежко“; достъпното име
  // (aria-label) остава ИМЕНА — същото като на бутоните на старата карта (rooms.js:199).
  const ЕТИКЕТ = ['тежко', 'тъжно', 'горе-долу', 'добре', 'чудесно'];
  const ТОН = ['t-lilac', 't-sky', 't-butter', 't-mint', 't-pink'];
  const КАК_СИ = /Как си днес\?/;          // rooms.js:183 — заглавието на картата
  const СВОБОДНА = /Свободна страница/;    // rooms2.js:2835

  const същ = (а, б) => а.getFullYear() === б.getFullYear() && а.getMonth() === б.getMonth() && а.getDate() === б.getDate();
  // „днес, 14:05“ · „вчера, 22:40“ · „21 сеп“ · „21 сеп 2025“
  function кога(ts) {
    const д = new Date(ts); if (isNaN(д.getTime())) return '';
    const сега = new Date(), вчера = new Date(сега.getFullYear(), сега.getMonth(), сега.getDate() - 1);
    const час = ', ' + двуц(д.getHours()) + ':' + двуц(д.getMinutes());
    if (същ(д, сега)) return 'днес' + час;
    if (същ(д, вчера)) return 'вчера' + час;
    return д.getDate() + ' ' + МЕС[д.getMonth()] + (д.getFullYear() !== сега.getFullYear() ? ' ' + д.getFullYear() : '');
  }
  // Откъс до ~120 знака по ЦЕЛИ букви (Array.from — емоджито е два UTF-16 знака и .slice го цепи)
  // и по цяла дума, ако има къде; новите редове стават интервал (това е поглед, не страницата).
  function откъс(т, n) {
    const ч = Array.from(String(т).replace(/\s+/g, ' ').trim());
    if (ч.length <= n) return ч.join('');
    let к = ч.slice(0, n).join('');
    const и = к.lastIndexOf(' ');
    if (и > n * 0.6) к = к.slice(0, и);
    return к.replace(/[\s,.;:–—-]+$/u, '') + '…';
  }

  // 🪤 всяка промяна по DOM е мутация → наблюдателят ни вика пак → пишем САМО при разлика.
  //   Класове — само през classList (plavno.js:60 закача „bl-dvizhi“; className = … би го изтрил,
  //   plavno го връща, това е мутация — вечен кръг).
  const текст = (е, т) => { if (е && е.textContent !== т) е.textContent = т; };
  const атр = (е, а, в) => { if (е && е.getAttribute(а) !== в) е.setAttribute(а, в); };
  const клас = (е, к, да) => { if (е && е.classList.contains(к) !== !!да) е.classList.toggle(к, !!да); };
  const скрий = (е, да) => { if (е && е.hidden !== !!да) е.hidden = !!да; };
  // 🔢 откъсът е на серифа (Georgia) — а цифрите на Georgia са „старинни“: 0 се чете като „о“
  //   (pl-ui.css:168). Цифрите отиват в <span class="pl-dn-n"> на Nunito. textContent остава
  //   БУКВА В БУКВА същият → сравнението „само при разлика“ работи и тук (без вечен кръг).
  function текстЦифри(е, т) {
    if (!е || е.textContent === т) return;
    е.textContent = '';
    String(т).split(/(\d+(?:[.,:]\d+)*)/).forEach((ч, i) => {
      if (!ч) return;
      if (i % 2) { const н = document.createElement('span'); н.className = 'pl-dn-n'; н.textContent = ч; е.appendChild(н); }
      else е.appendChild(document.createTextNode(ч));
    });
  }

  // Дневникът = персонажът ro-lav (premium-rooms.js:18 БАНЕРИ; helper.js open → .ro-panel.className)
  function вДневника() {
    const п = document.querySelector('#roomOverlay .ro-panel');
    return !!(п && п.classList.contains('ro-lav'));
  }
  // карта от СЪЩИЯ #roRoom по заглавие h4.jr-title (стаята понякога се рисува два пъти)
  function карта(стая, re) {
    return [...стая.querySelectorAll('section.jr-card')].find(к => {
      const т = к.querySelector('h4.jr-title');
      return т && re.test(т.textContent || '');
    }) || null;
  }
  const каквоСи = стая => стая.querySelector('section.ck-card') || карта(стая, КАК_СИ);   // rooms.js:182

  // ── 🧭 скокът до карта ──
  // 🪤 .ro-room .jr-card е с content-visibility:auto и приблизителна височина (mega.css:336): картите
  //   по пътя получават истинския си ръст едва в екрана и scrollIntoView спира на стотици пиксели от
  //   целта. Същият доказан ред като pl-zdrave.js:157-196 / pl-instrumenti.js:171 / preg20.js:870-888:
  //   мигновен скок, после през 200 мс донагласяне, докато картата застане (±16 px) две проверки
  //   подред, до 15 опита. Пипне ли мама екрана — спираме. Нов скок гаси стария.
  function скролер(е) {
    for (let п = е.parentElement; п && п !== document.body; п = п.parentElement) {
      const о = getComputedStyle(п).overflowY;
      if ((о === 'auto' || о === 'scroll') && п.scrollHeight > п.clientHeight + 4) return п;
    }
    return null;
  }
  let скок = 0;
  function докарай(к, после) {
    const с = скролер(к);
    const мой = ++скок;
    if (!с) { try { к.scrollIntoView({ block: 'start' }); } catch (e) {} if (после) после(); return; }
    let опит = 0, добри = 0, пипна = false;
    const пусни = () => { пипна = true; };
    с.addEventListener('touchstart', пусни, { passive: true });
    с.addEventListener('wheel', пусни, { passive: true });
    const махни = () => { с.removeEventListener('touchstart', пусни); с.removeEventListener('wheel', пусни); };
    const цели = () => { const бе = с.scrollTop; с.scrollTop = бе + Math.round(к.getBoundingClientRect().top - с.getBoundingClientRect().top - 8); return с.scrollTop !== бе; };
    цели();
    (function провери() {
      if (мой !== скок) return махни();
      if (!к.isConnected || пипна) { махни(); return; }
      const д = к.getBoundingClientRect().top - с.getBoundingClientRect().top - 8;
      if (Math.abs(д) <= 16) добри++;
      else if (!цели()) добри++;                  // опряна в дъното на стаята — по-нагоре не може
      else добри = 0;
      if (добри < 2 && ++опит < 15) { setTimeout(провери, 200); return; }
      махни();
      if (после) после();
    })();
  }
  // същото мигане като съдържанието на стаята (polish.js → .toc-flash, mega.css:611)
  function мигни(к) { к.classList.remove('toc-flash'); void к.offsetWidth; к.classList.add('toc-flash'); }
  function разгъни(к) {
    if (!к.classList.contains('folded')) return;
    // разгъва я СОБСТВЕНИЯТ ѝ бутон ▾ (polish.js:226-253 → превключи() + bl_folds) — като ръчно докосване
    const б = к.querySelector('.jr-title .fold-btn');
    if (б) б.click(); else к.classList.remove('folded');
  }

  // ── 💜 личице → СТАРАТА карта записва ──
  function запишиЛице(с, i) {
    const стая = с.closest('#roRoom');
    const к = стая && каквоСи(стая);
    const лице = к && к.querySelectorAll('.ck-st')[i];
    const бутон = к && к.querySelector(':scope > button.jr-btn');     // rooms.js:257 saveBtn — единственият .jr-btn в картата
    if (!лице || !бутон) {
      // друга версия на картата — поне я показваме; нищо не записваме оттук
      if (к) { разгъни(к); докарай(к, () => мигни(к)); }
      return;
    }
    лице.click();    // rooms.js:200 → избери(i): c1._mood = i, личицето светва, отговорът се сменя
    бутон.click();   // rooms.js:259-300 → пресен прочит, save('bl_checkins'), седмицата, прегръдката / честният провал
    с._мое = деньКлюч(new Date());   // от този миг огледалото показва каквото КАРТАТА каза (и провала)
    обнови(с, стая);
  }
  function къмКартата(с) {
    const стая = с.closest('#roRoom');
    const к = стая && каквоСи(стая);
    if (!к) return;
    разгъни(к);
    докарай(к, () => мигни(к));
  }
  // 🌙 „Искаш ли да ми разкажеш?“ — старият чип (rooms.js:306-312 → MamaHelper.showTab('chat'))
  function луна(с) {
    const стая = с.closest('#roRoom');
    const к = стая && каквоСи(стая);
    const ч = к && [...к.querySelectorAll(':scope > button.jr-chip')].find(б => /разкажеш/.test(б.textContent || ''));
    if (ч) ч.click();
  }
  // ✍️ „Пиши“ → полето на „Свободна страница“
  function пиши(с) {
    const стая = с.closest('#roRoom');
    const к = стая && карта(стая, СВОБОДНА);
    if (!к) return;
    разгъни(к);
    const поле = к.querySelector('textarea');
    // 🪤 курсорът се слага ВЕДНАГА, в самото докосване: телефонът вдига клавиатурата само при фокус
    //   в жеста на пръста — след таймерите на скока (200 мс) iOS не я отваря. preventScroll, защото
    //   скача докарай(); родният скок до фокуса спира неточно заради content-visibility.
    if (поле) { try { поле.focus({ preventScroll: true }); } catch (e) {} }
    докарай(к, () => {
      if (поле && document.activeElement !== поле) { try { поле.focus({ preventScroll: true }); } catch (e) {} }
      мигни(к);
    });
  }

  // 🧵 22.09 (сцените): материалите са ОБЩИТЕ от css/pl-ui.css — .pl-felt (страницата, филц с шев),
  //   .pl-soft (етикетите-хапчета и второстепенните бутони; избраното = .on), .pl-gel („Пиши“).
  //   Плюшените фигури са от спрайтовете img/art/ico-*.webp (CSS: pl-dnevnik.css) — нищо ново генерирано.
  function направи() {
    const с = document.createElement('section');
    с.className = 'pl-dn';
    с.setAttribute('data-pl', 'dnevnik');
    с.setAttribute('aria-label', 'Днес за теб');
    с.innerHTML =
      '<div class="pl-dn-book pl-felt">' +
        '<span class="pl-dn-ribbon" aria-hidden="true"></span>' +
        '<p class="pl-dn-eye"><i class="pl-dn-ic" aria-hidden="true"></i><span><b>Днес за теб</b><span class="pl-dn-sr">, </span><small class="pl-dn-date"></small></span></p>' +
        '<div class="pl-dn-medal"><i class="pl-dn-lotus" aria-hidden="true"></i>' +
          '<h3 class="pl-dn-q">Как си днес? <i aria-hidden="true">♡</i></h3></div>' +
        '<div class="pl-dn-moods" role="group" aria-label="Как си днес? Едно докосване записва">' +
          ЛИЦА.map((л, i) => '<button type="button" class="pl-dn-m ' + ТОН[i] + '" data-m="' + i + '" aria-pressed="false" aria-label="' + ИМЕНА[i] + '">' +
            '<span class="pl-dn-face" aria-hidden="true">' + л + '</span><span class="pl-dn-ml pl-soft">' + ЕТИКЕТ[i] + '</span></button>').join('') +
        '</div>' +
        '<p class="pl-dn-st" role="status" aria-live="polite"></p>' +
        '<div class="pl-dn-more">' +
          '<button type="button" class="pl-dn-link pl-soft pl-dn-luna" hidden><i class="pl-dn-ico pl-dn-moon" aria-hidden="true"></i>Искаш ли да ми разкажеш?</button>' +
          '<button type="button" class="pl-dn-link pl-soft pl-dn-add" hidden>Добави енергия и дума <span aria-hidden="true">›</span></button>' +
        '</div>' +
        '<div class="pl-dn-last" data-s="empty">' +
          '<h4 class="pl-dn-h"><i class="pl-dn-ic2" aria-hidden="true"></i><span>Последно написано</span></h4>' +
          '<div class="pl-dn-page">' +
            '<span class="pl-dn-clasp" aria-hidden="true"></span>' +
            '<p class="pl-dn-txt"></p><small class="pl-dn-meta"></small>' +
          '</div>' +
        '</div>' +
        '<button type="button" class="pl-dn-write pl-gel" aria-label="Пиши — в „Свободна страница“"><i class="pl-dn-ico pl-dn-pen" aria-hidden="true"></i><span class="pl-dn-wt">Пиши</span><b aria-hidden="true">›</b></button>' +
        '<p class="pl-dn-priv">Пази се само в този телефон · никой друг не чете</p>' +
      '</div>';
    // 🐣 плюшената фигура подскача при докосване (keyframes plHop и махането на animationend са в pl-ui)
    с.addEventListener('pointerdown', е => {
      const б = е.target.closest && е.target.closest('button');
      const и = б && с.contains(б) && б.querySelector('.pl-dn-face, .pl-dn-ico');
      if (!и) return;
      и.classList.remove('pl-hop'); void и.offsetWidth; и.classList.add('pl-hop');
    }, { passive: true });
    с.addEventListener('click', е => {
      const б = е.target.closest && е.target.closest('button');
      if (!б || !с.contains(б)) return;
      try {
        if (б.classList.contains('pl-dn-m')) запишиЛице(с, +б.getAttribute('data-m'));
        else if (б.classList.contains('pl-dn-write')) пиши(с);
        else if (б.classList.contains('pl-dn-add')) къмКартата(с);
        else if (б.classList.contains('pl-dn-luna')) луна(с);
      } catch (ex) { грешки.push(String((ex && ex.message) || ex)); }
    });
    return с;
  }

  function обнови(с, стая) {
    const сега = new Date(), ден = деньКлюч(сега);
    текст(с.querySelector('.pl-dn-date'), ДНИ[сега.getDay()] + ', ' + сега.getDate() + ' ' + МЕСЕЦИ[сега.getMonth()]);

    // днешното личице — rooms.js:180 load('bl_checkins', {}) · rooms.js:120 имаЛице (m е число с личице)
    const ck = чети('bl_checkins', {});
    const з = ck && ck[ден];
    const m = з && typeof з.m === 'number' && ЛИЦА[з.m] ? з.m : -1;
    с.querySelectorAll('.pl-dn-m').forEach((б, i) => {
      атр(б, 'aria-pressed', i === m ? 'true' : 'false');
      клас(б.querySelector('.pl-dn-ml'), 'on', i === m);     // .pl-soft.on = избраният розов филц (pl-ui.css)
    });
    клас(с, 'has-mood', m >= 0);

    // отговорът: огледало на СТАРАТА карта (rooms.js:205/221 живДума, :272 провалът) — не свой текст
    const к = каквоСи(стая);
    let отг = '';
    if (к) {
      const р = ((к.querySelector('.jr-reply') || {}).textContent || '').trim();
      const п = [...к.querySelectorAll('.ck-st')].findIndex(x => x.classList.contains('picked'));
      if (с._мое === ден) отг = р;                  // току-що натиснато оттук — каквото картата каза
      else if (m >= 0 && п === m) отг = р;         // записано по-рано — картата показва същото личице
    }
    текст(с.querySelector('.pl-dn-st'), отг || (m >= 0 ? 'Записано за днес 💜 Смени го с едно докосване.' : 'Едно докосване — и денят ти е записан.'));
    клас(с.querySelector('.pl-dn-st'), 'is-reply', !!отг);

    // 🌙 чипът за Луна се вижда, когато СТАРИЯТ се вижда (rooms.js:308, :292 — само при тежко личице)
    const ч = к && [...к.querySelectorAll(':scope > button.jr-chip')].find(б => /разкажеш/.test(б.textContent || ''));
    скрий(с.querySelector('.pl-dn-luna'), !(ч && !ч.hidden));
    скрий(с.querySelector('.pl-dn-add'), !(к && m >= 0));

    // ✍️ „Последно написано“ — bl_freepage: [{ t, d }] (rooms2.js:2577 push({ t: v, d: Date.now() }))
    //   без дупки и без записи без текст — като rooms2.js:2551. Най-новият по d, не по място в масива
    //   (внесено копие може да е в друг ред).
    const блок = с.querySelector('.pl-dn-last');
    const заключено = !!(window.BL_PIN && BL_PIN.has && BL_PIN.has());
    let състояние = 'empty', т = 'Празна страница те чака. Един ред стига. 🤍', мета = 'Свободна страница';
    if (заключено) {
      състояние = 'lock'; т = 'Под ключ 🔒'; мета = 'Прочети го в „Свободна страница“ — тук не се показва.';
    } else {
      const бел = чети('bl_freepage', []).filter(x => x && x.t != null && String(x.t).trim());
      let посл = null;
      бел.forEach(x => { if (!посл || (+x.d || 0) >= (+посл.d || 0)) посл = x; });
      if (посл) {
        състояние = 'text';
        т = '„' + откъс(посл.t, 120) + '“';
        const к2 = кога(посл.d);
        мета = (к2 ? к2 + ' · ' : '') + 'Свободна страница';
      }
    }
    атр(блок, 'data-s', състояние);
    текстЦифри(блок.querySelector('.pl-dn-txt'), т);
    текст(блок.querySelector('.pl-dn-meta'), мета);
  }

  let пъти = 0;
  function сложи() {
    пъти++;
    const дн = вДневника();
    // стаята понякога се рисува два пъти — работим с всички
    document.querySelectorAll('#roRoom').forEach(стая => {
      let с = стая.querySelector(':scope > .pl-dn');
      if (!дн) { if (с) с.remove(); return; }
      if (!с) {
        // само ако е наистина дневникът: картата „Как си днес?“ е вътре (rooms.js:182)
        if (!каквоСи(стая)) return;
        с = направи();
        const банер = стая.querySelector(':scope > .pl-rhero');
        if (банер) банер.after(с); else стая.insertBefore(с, стая.firstChild);
      }
      // 🪤 НЕ го местим, ако е вече вътре — банерът (premium-rooms.js:38-47) сам се слага най-отгоре;
      //   два скрипта, които и двата „държат“ място, биха се бутали безкрайно.
      try { обнови(с, стая); } catch (ex) { грешки.push(String((ex && ex.message) || ex)); }
    });
  }

  // 🪤 #roRoom се сменя при отваряне на стая → гледаме статичния #roomOverlay (поддърво);
  //   setTimeout, не requestAnimationFrame (rAF спира, когато страницата не се рисува).
  let чака = false;
  function отложено() { if (чака) return; чака = true; setTimeout(() => { чака = false; try { сложи(); } catch (ex) { грешки.push(String((ex && ex.message) || ex)); } }, 40); }
  function върви() {
    const ов = document.getElementById('roomOverlay');
    if (!ов) return;
    new MutationObserver(отложено).observe(ов, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] });
    сложи();
  }
  // полунощ сменя датата и „днешното“ личице; запис от друг таб — при връщане
  setInterval(() => { if (!document.hidden && document.querySelector('#roRoom > .pl-dn')) отложено(); }, 60000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) отложено(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', върви); else върви();
  window.BL_PL_DNEVNIK = { сложи, грешки, пъти: () => пъти };
})();
