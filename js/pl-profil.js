/* ═══════════════════════════════════════════════════════════════════════════════
   ✨ PREMIUM ПРОФИЛ · СЦЕНАТА + ТЕФТЕРЪТ (22.09.2026, втори кръг)
   Реф. 18 „Да се запознаем“ — сцената отзад, заглавието върху нея, тефтер със синя
   подвързия върху килима: полета-капсули с иконка в кръг, розов избор, розов гел бутон.
   Реф. 15 — бели редове-списък: плюшена иконка в кръг, серифно заглавие, подред, „›“.

   Екранът е на js/profile.js (бутонът #bnProfile → .prof-overlay > .prof-box). Той го
   рисува ЦЯЛ наново при всяко отваряне и при всяко свое действие (рисувайВ, profile.js:462).
   Тук НЕ се пипа нито една стара логика — само облекло:
     · всичко след герба отива в <div class="pl-tefter pl-felt"> — тефтерът. profile.js държи
       елементите си в ПРОМЕНЛИВИ (hero, изборКутия, дн2, вход…), не ги търси по място, и
       пише в кутията само при пълно пре-рисуване (innerHTML = '' → нови деца), така че
       преместването не чупи нищо; при следващото пре-рисуване тефтерът се прави наново;
     · материалите от css/pl-ui.css: главното = .pl-gel, второстепенното = .pl-soft,
       тефтерът = .pl-felt (своя гел/филц тук няма);
     · заглавията на картите получават плюшена иконка в кръг (емоджито излиза от текста);
     · бутоните „Моите неща“, „Личен щрих“ и „Данните ми“ стават редове с „›“ — СЪЩИТЕ
       бутони, със СЪЩИТЕ обработчици (сменя се само вътрешността им);
     · полето за име и изборът на лице в регистрацията стават полета като в реф. 18;
     · горе в тефтера — „визитка“ на бебето (води към стаята му), долу — редът 112 (реф. 15),
       а горе вдясно — закрепено „✚ 112“ (tel:112), видимо при всяко превъртане.
   Всяко писане в DOM е САМО при разлика (наблюдателят иначе се вика сам — безкраен кръг).
   ПЪТ НАЗАД: махни <link href="css/pl-profil.css"> и <script src="js/pl-profil.js"> от
   index.html. profile.js не знае за този файл; старият вид се връща сам.
   ═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.BL_PL_PROFIL) return;

  // същото правило като `load` в js/profile.js:16 — счупен/чужд тип → стойността по подразбиране
  const чети = (к, по) => {
    try { const v = JSON.parse(localStorage.getItem(к)); if (v == null) return по; if (по && typeof по === 'object' && (!v || typeof v !== 'object')) return по; return v; }
    catch (e) { return по; }
  };
  const МЕСЕЦИ = ['януари', 'февруари', 'март', 'април', 'май', 'юни', 'юли', 'август', 'септември', 'октомври', 'ноември', 'декември'];
  const клас = (е, к) => { if (е && !е.classList.contains(к)) е.classList.add(к); };

  // ── плюшените листове 4×4 (img/art/ico-*.webp): [лист, ред, колона, пастел на кръга] ──
  // 🪤 url() се пише в style от JS (спрямо страницата), не в CSS променлива (спрямо css/ → 404).
  function рисунка(е, и) {
    if (!и) return;
    const фон = 'url("img/art/' + и[0] + '.webp")';
    // 🪤 „0.000%“ браузърът го пази като „0%“ → сравнението би лъгало и писало при всеки проход
    const пр = н => parseFloat((н * 100 / 3).toFixed(3)) + '%';
    const поз = пр(и[2]) + ' ' + пр(и[1]);
    if (е.style.backgroundImage !== фон) е.style.backgroundImage = фон;
    if (е.style.backgroundPosition !== поз) е.style.backgroundPosition = поз;
    if (и[3] && е.style.getPropertyValue('--pl-tint') !== и[3]) е.style.setProperty('--pl-tint', и[3]);
  }
  const РОЗОВО = '#fde6ef', НЕБЕ = '#dfeafb', МЕНТА = '#dff2e7', ЛЮЛЯК = '#ece4f8', МАСЛО = '#fff0d4', ПРАСКОВА = '#fde5d8';

  // заглавията на картите — по текста СЛЕД емоджито (profile.js:367 · 401 · 810 · 848 · 862 · 876 · 917 · 945 · 1103 · 1130 · 477 · 514)
  const ЗАГЛАВИЯ = {
    'Днес при теб': ['ico-d', 0, 0, МАСЛО],
    'Седмицата ти': ['ico-a', 0, 1, РОЗОВО],
    'Целите ми тази седмица': ['ico-b', 3, 1, МЕНТА],
    'Наградите ми': ['ico-c', 2, 2, МАСЛО],
    'Медальончетата': ['ico-b', 2, 1, ПРАСКОВА],
    'Семейството': ['ico-c', 2, 1, РОЗОВО],
    'В числа': ['ico-b', 2, 0, НЕБЕ],
    'Данните ми': ['ico-c', 0, 0, ЛЮЛЯК],
    'Личен щрих': ['ico-b', 2, 2, ПРАСКОВА],
    'Моите неща': ['ico-a', 0, 2, МАСЛО],
    'Регистрация — създай профила си': ['ico-b', 0, 3, НЕБЕ],
    'Вход — вече имам профил': ['ico-c', 1, 2, РОЗОВО]
  };

  // редовете-списък (реф. 15). Ключът е надписът без емоджито и без опашката в скоби.
  // `под` е подредът; функция = чете състоянието в мига на рисуване.
  const тъмна = () => document.documentElement.getAttribute('data-theme') === 'dark';   // същото като profile.js:1105
  const звуци = () => { try { return localStorage.getItem('bl_sounds') === '1'; } catch (e) { return false; } };   // profile.js:1117
  const РЕДОВЕ = {
    // ⚙️ Моите неща (profile.js:1132) — стаите са същите, към които бутонът води
    'Дневникът ми': { и: ['ico-a', 2, 3, РОЗОВО], под: 'стая „Дневник на мама“' },
    'Стаята за мен': { и: ['ico-c', 1, 0, ПРАСКОВА], под: 'стая „Жената в мен“' },
    'Лабораторията': { и: ['ico-c', 2, 3, ЛЮЛЯК], под: 'стая „Лабораторията“' },
    'Настройки': { и: ['ico-c', 0, 2, НЕБЕ], под: 'стая „Инструменти“' },
    // 🎨 Личен щрих (profile.js:1106, 1118) — надписът казва КАКВО ще стане, подредът — какво е СЕГА
    'Тъмна тема': { и: ['ico-a', 1, 1, НЕБЕ], под: () => тъмна() ? 'сега: тъмна' : 'сега: светла' },
    'Светла тема': { и: ['ico-d', 0, 0, МАСЛО], под: () => тъмна() ? 'сега: тъмна' : 'сега: светла' },
    'Милички звуци': { и: ['ico-d', 3, 1, РОЗОВО], под: () => звуци() ? 'сега: включени' : 'сега: изключени' },
    'Спри звуците': { и: ['ico-d', 3, 1, РОЗОВО], под: () => звуци() ? 'сега: включени' : 'сега: изключени' },
    // 💾 Данните ми (profile.js:1054, 1060, 1065, 1085, 1092) и входът на госта (profile.js:516)
    'Свали резервно копие': { и: ['ico-a', 1, 3, МАСЛО], под: 'всичко твое в един файл', главен: true },
    'Копие без тайните': { и: ['ico-b', 1, 2, ЛЮЛЯК] },
    'Копие с парола': { и: ['ico-c', 1, 2, РОЗОВО] },
    'Качи копие от друг телефон': { и: ['ico-a', 0, 3, НЕБЕ], под: 'файлът от стария телефон' },
    'Качи файла-копие': { и: ['ico-a', 0, 3, НЕБЕ], под: 'всичко се връща от файла' },
    'Изтрий всичко от този телефон…': { и: ['ico-a', 2, 2, МАСЛО], под: 'в стаята „Инструменти“' }
  };

  // „🌞 Днес при теб“ → ['🌞', 'Днес при теб']. Емоджито е всичко до първата буква/цифра
  // (вкл. ZWJ-последователности като 👨‍👩‍👧 и знака ⚙️ с вариант-селектор).
  const раздели = т => {
    const м = String(т || '').replace(/\s+/g, ' ').trim().match(/^([^\p{L}\p{N}„"(]*)\s*([\s\S]*)$/u);
    return м ? [м[1].trim(), м[2].trim()] : ['', String(т || '').trim()];
  };
  // „Копие с парола (за облака/мейла)“ → ['Копие с парола', 'за облака/мейла']
  const опашка = т => { const м = т.match(/^(.*?)\s*\(([^()]+)\)\s*$/); return м ? [м[1], м[2]] : [т, '']; };
  const прекиТекст = е => [...е.childNodes].filter(н => н.nodeType === 3).map(н => н.nodeValue).join('');

  // ═══ 0) ТЕФТЕРЪТ: всичко след ✕ и герба отива в него (в същия ред) ═══
  function тефтер(кутия) {
    let т = кутия.querySelector(':scope > .pl-tefter');
    const вън = [...кутия.children].filter(е => е !== т && !е.classList.contains('prof-close') && !е.classList.contains('prof-hero'));
    if (!т) {
      if (!вън.length) return null;
      т = document.createElement('div');
      т.className = 'pl-tefter pl-felt';
      кутия.appendChild(т);
    }
    вън.forEach(е => т.appendChild(е));
    return т;
  }

  // ═══ 0б) ФАЙЛОВЕТЕ В ЕТИКЕТИТЕ ═══
  // profile.js сменя надписа на етикета с textContent („🔓 Отключвам…“ → обратно „⬆️ Качи
  // файла-копие“, profile.js:583/585/735; „📷 Избери снимка“, profile.js:124) — а textContent
  // изтрива и скрития <input type=file> вътре. След „Файлът не е разпознат“ етикетът вече
  // НЕ отваря нищо (мълчалив бутон). Пазим СЪЩИЯ input (със същия обработчик от profile.js)
  // и го връщаме; value се нулира, за да може и същият файл да се избере пак.
  const ФАЙЛОВЕ = new WeakMap();
  function пазиФайла(лейбъл) {
    const в = лейбъл.querySelector('input[type="file"]');
    if (в) { if (ФАЙЛОВЕ.get(лейбъл) !== в) ФАЙЛОВЕ.set(лейбъл, в); return; }
    const стар = ФАЙЛОВЕ.get(лейбъл);
    if (!стар) return;
    try { стар.value = ''; } catch (e) {}
    лейбъл.appendChild(стар);
  }

  // ═══ 1) ЗАГЛАВИЯТА НА КАРТИТЕ ═══
  function заглавие(h) {
    if (h.querySelector(':scope > .pl-ht')) return;           // вече облечено
    const текстови = [...h.childNodes].filter(н => н.nodeType === 3);
    const [знак, име] = раздели(текстови.map(н => н.nodeValue).join(''));
    if (!име) return;
    текстови.forEach(н => н.remove());
    const кр = document.createElement('span');
    кр.className = 'pl-hi'; кр.setAttribute('aria-hidden', 'true');
    const и = ЗАГЛАВИЯ[име];
    if (и) { кр.classList.add('has-art'); рисунка(кр, и); } else кр.textContent = знак || '✦';
    const т = document.createElement('span');
    т.className = 'pl-ht'; т.textContent = име;
    h.insertBefore(т, h.firstChild);
    h.insertBefore(кр, т);
    if (!h.hasAttribute('data-pl')) h.setAttribute('data-pl', '1');
  }

  // ═══ 2) РЕДОВЕТЕ-СПИСЪК ═══
  // Бутонът/етикетът остава СЪЩИЯТ (обработчиците му са на profile.js). Когато profile.js
  // смени надписа му с textContent (напр. „📸 Събирам снимките…“, profile.js:986), това
  // изтрива нашата вътрешност — наблюдателят го вижда и облича наново СЪС СЪЩАТА иконка
  // (пазим я в data-pl-k), а новият надпис излиза като заглавие на реда.
  function ред(е) {
    const рт = е.querySelector(':scope > .pl-rt');
    let заг, под;
    if (рт) {
      заг = (рт.querySelector('b') || {}).textContent || '';
    } else {
      const [, чист] = раздели(прекиТекст(е));
      if (!чист) return;
      [заг, под] = опашка(чист);
    }
    const к = РЕДОВЕ[заг] ? заг : (е.getAttribute('data-pl-k') || '');
    const оп = РЕДОВЕ[к] || {};
    if (!под) под = typeof оп.под === 'function' ? оп.под() : (оп.под || (рт ? ((рт.querySelector('small') || {}).textContent || '') : ''));
    if (!рт) {
      [...е.childNodes].filter(н => н.nodeType === 3).forEach(н => н.remove());   // <input type=file> в етикета остава на място
      const кр = document.createElement('span'); кр.className = 'pl-ri'; кр.setAttribute('aria-hidden', 'true');
      const т = document.createElement('span'); т.className = 'pl-rt';
      т.innerHTML = '<b></b><small></small>';
      const с = document.createElement('span'); с.className = 'pl-rgo'; с.setAttribute('aria-hidden', 'true'); с.textContent = '›';
      е.insertBefore(т, е.firstChild); е.insertBefore(кр, т); е.appendChild(с);
      т.querySelector('b').textContent = заг;
    }
    if (РЕДОВЕ[заг] && е.getAttribute('data-pl-k') !== заг) е.setAttribute('data-pl-k', заг);
    const кр = е.querySelector(':scope > .pl-ri');
    if (оп.и) { клас(кр, 'has-art'); рисунка(кр, оп.и); }
    const м = е.querySelector(':scope > .pl-rt > small');
    if (м.textContent !== под) м.textContent = под;
    if (м.hidden !== !под) м.hidden = !под;
    клас(е, 'pl-row');
    if (оп.главен) клас(е, 'pl-gel');           // главното действие на картата = розов гел (pl-ui.css, раздел 1)
  }

  // ═══ 3) ГЛАВНИЯТ БУТОН (реф. 18 „Към нашия свят ›“) — розов гел, без емоджито ═══
  function главен(б) {
    const н = [...б.childNodes].find(x => x.nodeType === 3 && x.nodeValue.trim());
    if (н) {
      const [, чист] = раздели(н.nodeValue);
      if (чист && н.nodeValue !== чист) н.nodeValue = чист;
    }
    клас(б, 'pl-gel');
  }

  // ═══ 4) РЕГИСТРАЦИЯТА КАТО РЕФ. 18: поле = иконка в кръг + етикет + капсула ═══
  function поле(карта, иконка, етикет, възли) {
    const р = document.createElement('div'); р.className = 'pl-fld';
    const кр = document.createElement('span'); кр.className = 'pl-fi has-art'; кр.setAttribute('aria-hidden', 'true'); рисунка(кр, иконка);
    const т = document.createElement('div'); т.className = 'pl-fld-b';
    if (етикет) т.appendChild(етикет);
    р.appendChild(кр); р.appendChild(т);
    карта.insertBefore(р, възли[0]);
    възли.forEach(в => т.appendChild(в));
    return р;
  }
  function регистрация(карта) {
    if (карта.hasAttribute('data-pl-reg')) return;
    const вход = карта.querySelector(':scope > input.prof-inp');     // profile.js:478
    const бел = карта.querySelector(':scope > p.prof-note');          // „Избери си лице…“ (profile.js:481)
    const лица = карта.querySelector(':scope > .prof-avpick');        // profile.js:483
    if (!вход || !лица) return;
    карта.setAttribute('data-pl-reg', '1');
    const е1 = document.createElement('span'); е1.className = 'pl-fld-l'; е1.textContent = 'Как да те наричам?';
    е1.setAttribute('aria-hidden', 'true');   // полето си има aria-label (profile.js:479) — да не се чете два пъти
    // въпросът вече стои над полето → подсказката в него е само примерът (иначе се режеше: „Как да те наричам? (нап“)
    if (вход.placeholder !== 'напр. Ани') вход.placeholder = 'напр. Ани';
    поле(карта, ['ico-e', 1, 1, НЕБЕ], е1, [вход]);           // табелките с имена
    if (бел) бел.classList.add('pl-fld-l');
    поле(карта, ['ico-d', 3, 0, РОЗОВО], бел, [лица]);        // рамката със сърце — лицето
  }

  // ═══ 5) ВИЗИТКАТА НА БЕБЕТО (като в началото, js/premium-home.js:36) ═══
  // Кое е бебето — по СЪЩИТЕ правила като профила: родено = има рождена дата в миналото и не
  // е режим „чакаме“ (profile.js:908); бременност = BL_EXPECT.lmp() (js/expect.js:31 — вратарят,
  // на пауза връща празно; bl_lmp го пишат onboard.js:252, preg20.js:284, rooms2.js:975);
  // възрастта — BL_AGE (js/rooms2.js:156, същата като реда в „Семейството“, profile.js:892);
  // седмицата — BL_PREG.седмица от bl_lmp (както js/preg.js:37).
  function коеБебе() {
    const б = чети('bl_baby', {});
    const име = typeof б.name === 'string' ? б.name.trim().slice(0, 24) : '';
    const роденo = !!(б.birth && б.sex !== 'wait' && new Date(б.birth).getTime() <= Date.now());
    if (роденo) {
      const а = window.BL_AGE ? BL_AGE(б.birth) : null;
      let възр = '';
      if (а) {
        if (а.ym < 1) възр = а.totalDays + (а.totalDays === 1 ? ' ден' : ' дни');
        else if (а.ym < 24) възр = а.ym + (а.ym === 1 ? ' месец' : ' месеца');
        else { const г = Math.floor(а.ym / 12); възр = г + (г === 1 ? ' година' : ' години'); }
      }
      const д = window.BL_PREG ? BL_PREG.полунощ(б.birth) : new Date(б.birth);
      return {
        вид: 'бебе', стая: 'Моето бебе', и: ['ico-d', 1, 0, РОЗОВО],
        име: име || 'Бебето', числа: възр,
        под: д && !isNaN(д) ? 'рожден ден · ' + д.getDate() + ' ' + МЕСЕЦИ[д.getMonth()] + ' ' + д.getFullYear() : 'виж стаята на бебето',
        етикет: 'Отвори стаята „Моето бебе“'
      };
    }
    const лмп = window.BL_EXPECT && BL_EXPECT.lmp ? BL_EXPECT.lmp() : '';
    if (лмп) {
      const с = window.BL_PREG ? BL_PREG.седмица(new Date(лмп)) : Math.floor((Date.now() - new Date(лмп)) / 604800000);
      const т = window.BL_PREG ? BL_PREG.термин(лмп) : null;
      const седм = (с >= 1 && с <= 45) ? с : null;    // извън това preg.js:38 също мълчи
      return {
        вид: 'чака', стая: 'Бременност', и: ['ico-d', 1, 2, ПРАСКОВА],
        име: име || 'Бебето', числа: седм ? 'седмица ' + седм : '',
        под: т && !isNaN(т) ? 'терминът е около ' + т.getDate() + ' ' + МЕСЕЦИ[т.getMonth()] : 'очакваме те с любов',
        етикет: 'Отвори стаята „Бременност“'
      };
    }
    return { вид: 'няма', стая: '', и: ['ico-d', 1, 1, РОЗОВО], име: име || 'Бебето', числа: '', под: 'разкажи ми за него', етикет: 'Разкажи ми за бебето' };
  }
  function затвориПрофила(кутия) { const х = кутия.querySelector('.prof-close'); if (х) х.click(); }   // затвориСлоя (profile.js:423)
  function наВизитка(кутия) {
    const б = коеБебе();
    if (б.вид === 'няма') {
      // СЪЩИЯТ бутон „➕“ от „Семейството“ (profile.js:899): затваря и отваря въвеждането
      const р = [...кутия.querySelectorAll('.prof-fam')].find(x => /разкажи ми за него/.test(x.textContent));
      const бт = р && р.querySelector('button');
      if (бт) { бт.click(); return; }
      затвориПрофила(кутия); if (window.BL_ONBOARD) BL_ONBOARD.open();
      return;
    }
    затвориПрофила(кутия);
    if (window.MamaHelper && MamaHelper.open) MamaHelper.open(б.стая);
  }
  function визитка(кутия, т) {
    const герб = кутия.querySelector(':scope > .prof-hero:not(.prof-hero-guest)');
    let в = кутия.querySelector('.pl-pv');
    if (!герб || !т) { if (в) в.remove(); return; }
    const б = коеБебе();
    if (!в) {
      в = document.createElement('button');
      в.type = 'button'; в.className = 'pl-pv';
      // името в сериф, числата (възраст/седмица) в Nunito — 🪤 цифрите на Georgia са „старинни“ (0 → „о“)
      в.innerHTML = '<span class="pl-pv-av has-art" aria-hidden="true"></span><span class="pl-pv-t"><b><span class="pl-pv-n"></span><span class="pl-num"></span></b><small></small></span><span class="pl-pv-go" aria-hidden="true">›</span>';
      в.addEventListener('click', () => наВизитка(кутия));
    }
    // място: първи в тефтера (след избора на лице, ако е там)
    const избор = т.querySelector(':scope > .prof-avwrap');
    const намясто = в.parentNode === т && (избор ? в.previousElementSibling === избор : т.firstElementChild === в);
    if (!намясто) т.insertBefore(в, избор ? избор.nextSibling : т.firstChild);
    рисунка(в.querySelector('.pl-pv-av'), б.и);
    const н = в.querySelector('.pl-pv-n'), ч = в.querySelector('.pl-num'), п = в.querySelector('small');
    const чТ = б.числа ? ' · ' + б.числа : '';
    if (н.textContent !== б.име) н.textContent = б.име;
    if (ч.textContent !== чТ) ч.textContent = чТ;
    if (п.textContent !== б.под) п.textContent = б.под;
    const ет = б.етикет + ' · ' + б.име + чТ;
    if (в.getAttribute('aria-label') !== ет) в.setAttribute('aria-label', ет);
    if (в.getAttribute('data-vid') !== б.вид) в.setAttribute('data-vid', б.вид);
  }

  // ═══ 6) 112 — наслагването покрива долната лента с SOS, затова 112 е и тук (последният ред) ═══
  function спешно(т) {
    if (!т) return;
    let а = т.querySelector(':scope > .pl-p112');
    if (!а) {
      а = document.createElement('a');
      а.className = 'pl-p112'; а.href = 'tel:112';
      а.setAttribute('aria-label', 'Спешна помощ — обади се на 112');
      а.innerHTML = '<span class="pl-p112-kr" aria-hidden="true">✚</span><span><b>Спешна помощ <span class="pl-num">· 112</span></b><small>денонощно, безплатно</small></span><span class="pl-rgo" aria-hidden="true">›</span>';
    }
    const правни = т.querySelectorAll(':scope > .prof-legal');
    const преди = правни.length ? правни[правни.length - 1] : null;
    if (а.parentNode !== т || а.nextSibling !== преди) т.insertBefore(а, преди);
  }
  // ✚ 112 горе вдясно, ВИНАГИ видимо (железно правило 5): тефтерът е ~4700 px, а редът с 112 е
  // най-долу; долната лента със SOS е под наслагването. Като главата на стаите: ← вляво, SOS вдясно.
  // Живее в самото наслагване (не в кутията) — пре-рисуването на profile.js не го пипа.
  function спешноГоре(слой) {
    if (!слой || слой.querySelector(':scope > .pl-p112-mini')) return;
    const а = document.createElement('a');
    а.className = 'pl-p112-mini'; а.href = 'tel:112';
    а.setAttribute('aria-label', 'Спешна помощ — обади се на 112');
    а.innerHTML = '<span aria-hidden="true">✚</span>112';
    слой.appendChild(а);
  }

  // ═══ ОБЛИЧАНЕТО ═══
  function облечи(кутия) {
    if (!кутия || !кутия.isConnected) return;
    const гост = !!кутия.querySelector(':scope > .prof-hero-guest');
    if (кутия.getAttribute('data-pl-mode') !== (гост ? 'гост' : 'профил')) кутия.setAttribute('data-pl-mode', гост ? 'гост' : 'профил');
    const т = тефтер(кутия);
    // материалите (pl-ui.css): ✕ и ✏️ — филцови копчета; изборът на лице — филцови табове/кръгчета
    клас(кутия.querySelector(':scope > .prof-close'), 'pl-soft');
    кутия.querySelectorAll('.prof-edit, .prof-avtab, .prof-av, .prof-gmenu > .prof-gadd, .prof-avpick label.prof-cta').forEach(е => клас(е, 'pl-soft'));
    кутия.querySelectorAll('label').forEach(пазиФайла);
    кутия.querySelectorAll('.prof-card > h4.prof-h').forEach(заглавие);
    // редовете: „Моите неща“, „Личен щрих“, „Данните ми“, входът на госта
    кутия.querySelectorAll('.prof-card').forEach(к => {
      const и = (к.querySelector(':scope > h4 .pl-ht') || {}).textContent || '';
      if (и === 'Моите неща' || и === 'Личен щрих') к.querySelectorAll(':scope > .prof-quick > button.prof-gadd').forEach(ред);
      if (и === 'Данните ми' || и === 'Вход — вече имам профил') {
        к.querySelectorAll(':scope > button.prof-cta, :scope > label.prof-cta, :scope > .prof-inline > label.prof-cta').forEach(б => {
          // „Разбрах — презареди“ (profile.js:699) не е ред от списъка — второстепенно копче
          if (!б.classList.contains('pl-row') && /презареди/.test(б.textContent)) { клас(б, 'pl-soft'); return; }
          ред(б);
        });
        к.querySelectorAll(':scope > .prof-inline > button.prof-cta').forEach(б => клас(б, 'pl-soft'));
      }
      if (и === 'Регистрация — създай профила си') {
        регистрация(к);
        const б = к.querySelector(':scope > button.prof-cta:not(.prof-cta2):not(.prof-cta3):not(.prof-cta4)');
        if (б) главен(б);
      }
    });
    визитка(кутия, т);
    спешно(т);
    спешноГоре(кутия.parentElement);
  }

  // ═══ НАБЛЮДЕНИЕТО ═══
  // .prof-overlay се ражда при всяко отваряне и се маха при затваряне (profile.js:450, 426) →
  // гледаме <body> само за деца (без поддърво), а самото наслагване — с поддърво, защото
  // profile.js пре-рисува кутията (рисувайВ) и сменя надписи с textContent.
  // 🪤 setTimeout, НЕ requestAnimationFrame — rAF спира, когато страницата не се рисува.
  // 🪤 22.09 (мерено, ag_profil_f3): чистото „отлагане с 40 ms“ гладува, докато някой пише
  //   непрекъснато — fx.countUp (js/fx.js:112) сменя числото на нивото всеки кадър ~650 ms, всеки
  //   кадър нулираше таймера и след пре-рисуване кутията стоеше в СТАРИЯ вид над 500 ms. Затова:
  //   (1) пре-рисувана кутия (деца на самата кутия) се облича ВЕДНАГА, още в същия микро-такт —
  //   преди браузърът да нарисува стария вид; вторият проход не пише нищо (всичко е „само при
  //   разлика“), значи кръгът спира сам; (2) иначе отлагането има таван 120 ms.
  let гледан = null, набл = null, т = 0, първо = 0;
  function сега() { първо = 0; if (гледан) облечи(гледан.querySelector('.prof-box')); }
  function отложено() {
    const н = Date.now();
    if (!първо) първо = н;
    clearTimeout(т);
    т = setTimeout(сега, н - първо > 120 ? 0 : 40);
  }
  // (3) ред, чийто надпис profile.js смени с textContent (изтрива и иконката, и <input type=file>),
  //   се облича наново също веднага — мерено 22.09 (ag2_profil_funk_fail.js): с отлагането етикетът
  //   стоеше ~50 ms без input и без иконка.
  const пипнатРед = з => з.type === 'childList' && з.target.nodeType === 1 && з.target.classList.contains('pl-row') && з.removedNodes.length;
  function наПромяна(записи) {
    const к = гледан && гледан.querySelector('.prof-box');
    if (к && записи.some(з => (з.type === 'childList' && з.target === к && з.addedNodes.length) || пипнатРед(з))) { clearTimeout(т); сега(); return; }
    отложено();
  }
  function провериСлоя() {
    const с = document.querySelector('body > .prof-overlay');
    if (с === гледан) return;
    if (набл) { набл.disconnect(); набл = null; }
    гледан = с;
    if (!с) return;
    набл = new MutationObserver(наПромяна);
    набл.observe(с, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] });
    облечи(с.querySelector('.prof-box'));      // веднага — без премигване на стария вид
  }
  // смяна на темата отвън (app.js в 21:00) — подредът „сега: светла/тъмна“ да не лъже
  new MutationObserver(() => { if (гледан) отложено(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  function върви() {
    new MutationObserver(провериСлоя).observe(document.body, { childList: true });
    провериСлоя();
    // сцената се затопля на празен ход — иначе на бавен телефон първото отваряне мига с плосък цвят
    // (снимка 22.09, ag2_profil_12_empty_d: сцената още не беше дошла). Файлът е в кеша на sw.js:204.
    const затопли = () => { try { const и = new Image(); и.decoding = 'async'; и.src = 'img/scene/profil.webp'; } catch (e) {} };
    if ('requestIdleCallback' in window) requestIdleCallback(затопли, { timeout: 5000 }); else setTimeout(затопли, 3000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', върви); else върви();
  window.BL_PL_PROFIL = { облечи, коеБебе };
})();
