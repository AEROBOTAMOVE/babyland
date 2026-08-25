// ═══════════════════════════════════════════════════════════
// ROOMS 15 — ГЛАСЪТ И ГАЛЕРИИТЕ (план 19, част 4)
//
// 🎙️ 4.5.6  Гласовият дневник — в 3 сутринта не се пише, а се говори
// 🤰 4.1.7  Гласово писмо в корема — бебето „чува“ мама
// 🎵 4.6.12 Песничките: запис на мама — бебето я слуша после
// 🎨 4.6.6  Рисунките по месеци — галерия
// 📅 4.5.1  Годината в един екран — 365 квадратчета по настроение
// 🚫 4.5.11 Не-списък — какво НЯМА да правя
//
// Преизползва BL_EXPR.voiceCard / photoListCard — доказани, с IndexedDB
// през store.js. Нула нова логика за медия.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  // 🔴🔴 25.08 (ИЗМЕРЕНО, dev/interaktivno_stai2.js — 46 натискания при пълна памет):
  //    `return false` беше НЯМ: почти никой не го четеше, а мама виждаше „✔ Записах“.
  //    Сега падналият запис минава през ЧЕСТНИЯ канал на rooms.js (модал — вижда се
  //    ВИНАГИ). Нарочно НЕ през BL_FX.cheer: fx.js:93 мълчи при тежък ден и при
  //    намалено движение, тоест точно когато най-трябва.
  //    ПЪТ НАЗАД: махаш `провалът();` от catch — връща се старото мълчание.
  const провалът = () => {
    try { if (window.BL_ZAPIS_PADNA) { window.BL_ZAPIS_PADNA(); return; } } catch (e) {}
    try { alert('Паметта на телефона е пълна — това НЕ се записа. 😕 Написаното си остава в полето.'); } catch (e) {}
  };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { провалът(); return false; } };
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const localDate = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const today = () => localDate(new Date());
  const card = t => { const c = el('section', 'jr-card'); c.appendChild(el('h4', 'jr-title', t)); return c; };
  const sub = s => '<span class="jr-sub">' + s + '</span>';
  const fx = () => window.BL_FX || { confetti() {}, cheer() {}, buzz() {} };

  // 📱 11.08 (обиколка по телефон) — същите помощници като в women2/women3.js.
  function фокус(t) {
    try { t.focus(); } catch (e) { return; }
    const извън = () => {
      const vv = window.visualViewport;
      const дъно = vv ? vv.height : window.innerHeight;
      const r = t.getBoundingClientRect();
      return r.top < 8 || r.bottom > дъно - 8;
    };
    const виж = плавно => {
      if (!извън()) return;
      try { t.scrollIntoView(плавно ? { block: 'center', behavior: 'smooth' } : { block: 'center' }); }
      catch (e) { try { t.scrollIntoView(); } catch (e2) {} }
    };
    виж(true);
    // ⚠️ вторият опит е РЯЗЪК нарочно — плавното превъртане иска кадри и при
    //    задавен скрол не стига доникъде (измерено в women3.js).
    setTimeout(() => виж(false), 320);
  }
  // 🔴 МЪЛЧАЛИВ БУТОН: „+ Отказвам се“ с празно поле не правеше нищо видимо.
  //    ⚠️ „+ Отказвам се“ живее в `.jr-addrow`, която е FLEX. Обяснение,
  //    пъхнато веднага след бутона, става трети flex-брат и смачква полето
  //    (измерено в съседния файл: 259.6 → 32.6 px). Качваме се над flex-родителя.
  const каз = (котва, txt, полеЗаФокус) => {
    if (!котва || !котва.parentNode) return;
    let гнездо = котва;
    for (let i = 0; i < 3 && гнездо.parentNode; i++) {
      const d = getComputedStyle(гнездо.parentNode).display;
      if (d === 'flex' || d === 'inline-flex' || d === 'grid' || d === 'inline-grid') гнездо = гнездо.parentNode;
      else break;
    }
    if (!гнездо.parentNode) return;
    let p = гнездо.nextElementSibling;
    if (!p || !p.classList || !p.classList.contains('wm-say')) {
      p = el('p', 'jr-privacy wm-say', '');
      p.style.whiteSpace = 'pre-wrap';
      p.style.overflowWrap = 'anywhere'; p.style.wordBreak = 'break-word'; p.style.minWidth = '0';
      гнездо.parentNode.insertBefore(p, гнездо.nextSibling);
    }
    p.textContent = txt; p.hidden = false;
    clearTimeout(p._t); p._t = setTimeout(() => { p.hidden = true; }, 3200);
    if (полеЗаФокус) фокус(полеЗаФокус);
  };
  // 👆 ИЗМЕРЕНО: „🗑“ = 40×44, готовите идеи = 311×43. Прагът за пръст е 44×44.
  const пръст = b => { b.style.minWidth = '44px'; b.style.minHeight = '44px'; return b; };
  // 🔴 ИЗМЕРЕНО: ред от не-списъка с една дълга дума → scrollWidth 635 при
  //    clientWidth 311. Текстът просто изтичаше извън картата и не се четеше.
  const реже = n => {
    n.style.overflowWrap = 'anywhere'; n.style.wordBreak = 'break-word'; n.style.minWidth = '0';
    return n;
  };
  // ⚠️ `реже` НЕ бива да пипа <input> — виж бележката в women3.js.
  const редполе = i => { i.style.minHeight = '44px'; return i; };

  // ═══════════ 📅 4.5.1 ГОДИНАТА В ЕДИН ЕКРАН ═══════════
  function yearGridCard() {
    const c = card('Годината ти в един екран 📅 ' + sub('всеки ден е квадратче · всяко настроение е цвят'));
    const ck = load('bl_checkins', {});
    const дни = Object.keys(ck);
    if (!дни.length) {
      c.appendChild(el('p', 'jr-privacy',
        'Всяка минутка за теб оставя по едно квадратче. След година тук ще има картина — не статистика, а живот. Започва с първата. 💜'));
      return c;
    }
    // последните 365 дни, подредени по седмици (колони)
    const днес = new Date(); днес.setHours(12, 0, 0, 0);
    const мрежа = el('div', 'yg-grid');
    const ЦВЕТ = ['yg-0', 'yg-1', 'yg-2', 'yg-3', 'yg-4'];
    const ЛИЦА = ['😩', '😔', '😐', '🙂', '🥰'];
    let попълнени = 0, сума = 0;
    for (let i = 364; i >= 0; i--) {
      const d = new Date(днес); d.setDate(d.getDate() - i);
      const ключ = localDate(d);
      const r = ck[ключ];
      const кв = el('span', 'yg-cell' + (r && typeof r.m === 'number' ? ' ' + ЦВЕТ[r.m] : ''));
      if (r && typeof r.m === 'number') {
        попълнени++; сума += r.m;                    // №85: и сборът е от СЪЩИЯ прозорец
        кв.title = ключ + ' · ' + ЛИЦА[r.m] + (r.w ? ' · „' + r.w + '“' : '');
      } else кв.title = ключ;
      // 📱 11.08: `title` е НАСТОЛНО нещо — на телефон няма курсор, който да
      //    задържиш. Тоест подзаглавието обещаваше „всеки ден е квадратче“, а
      //    на телефона квадратчето не казваше НИЩО. Датата ѝ трябва на пръст.
      кв.dataset.d = ключ;
      if (r && typeof r.m === 'number') { кв.dataset.m = r.m; if (r.w) кв.dataset.w = r.w; }
      мрежа.appendChild(кв);
    }
    c.appendChild(мрежа);
    // 📱 мрежата се превърта ВЪТРЕ в себе си (css: overflow-x:auto). ИЗМЕРЕНО:
    //    scrollWidth 581 при clientWidth 311 — а тя се отваряше най-вляво,
    //    тоест мама виждаше отпреди година, а ДНЕС беше извън екрана вдясно.
    //    ⚠️ ИЗМЕРЕНО, че само requestAnimationFrame НЕ СТИГА: картата се ражда
    //    СГЪНАТА (`.jr-card.folded`), тоест display:none — в този миг
    //    clientWidth е 0 и превъртането се губи. Мама разгъва картата по-късно
    //    и пак гледа миналия август.
    //    ⚠️⚠️ И ВТОРИ ПЪТ: първо сложих IntersectionObserver, но той не се
    //    доказва — в моя браузър НИТО IntersectionObserver, НИТО ResizeObserver
    //    се обади (проверено с два отделни теста: нула повиквания при преход
    //    y=2046 → y=453 и при разгъване от 0 на 311 px). Не качвам механизъм,
    //    който не мога да видя как работи. Разгъването е ТАП, а тапът се хваща
    //    сигурно: слушаме самата карта. Веднъж — после мрежата е нейна.
    let наместено = false;
    const доДнес = () => {
      if (наместено) return true;
      try { if (мрежа.clientWidth > 0 && мрежа.scrollWidth > мрежа.clientWidth) { мрежа.scrollLeft = мрежа.scrollWidth; наместено = true; return true; } } catch (e) {}
      return false;
    };
    requestAnimationFrame(доДнес);
    c.addEventListener('click', () => { if (!наместено) setTimeout(доДнес, 0); }, true);
    const четец = el('p', 'jr-privacy');
    четец.textContent = 'Докосни квадратче, за да видиш кой ден е.';
    мрежа.setAttribute('role', 'group');
    мрежа.setAttribute('aria-label', 'Последната ти година, ден по ден');
    мрежа.addEventListener('click', e => {
      const кв = e.target.closest ? e.target.closest('.yg-cell') : null;
      if (!кв || !кв.dataset.d) return;
      const m = кв.dataset.m;
      четец.textContent = m === undefined
        ? кв.dataset.d + ' · нямаш записано за този ден — това не значи, че не се е случило нищо'
        : кв.dataset.d + ' · ' + ЛИЦА[m] + (кв.dataset.w ? ' · „' + кв.dataset.w + '“' : '');
      fx().buzz(6);
    });
    c.appendChild(четец);
    // легенда
    const лег = el('p', 'yg-leg');
    лег.innerHTML = ЛИЦА.map((e, i) => `<span class="yg-cell ${ЦВЕТ[i]}"></span>${e}`).join(' ') +
      ' <span class="yg-cell"></span>празен ден';
    c.appendChild(лег);
    // честна равносметка — без укор за празните
    // 🔴 05.08 (одит г04, №85): едно изречение смесваше ДВА различни прозореца.
    //    `попълнени` идва от цикъла за последните 365 дни, а средното се
    //    смяташе от `дни` = ВСИЧКИ чекини от инсталацията насам — и двете се
    //    обявяваха като „през последната година“. Във втората си година мама
    //    четеше „128 записани дни… Средно настроение: 😐“, а 😐-то беше от
    //    всичките ѝ 400 дни. При нула записи в годината пък излизаше
    //    „0 записани дни… Средно настроение: 😩“ — Math.round(0) сочи първото
    //    лице, тоест приложението ѝ приписваше най-лошото настроение от нищо.
    const ср = попълнени ? сума / попълнени : null;
    c.appendChild(el('p', 'yg-verd',
      `<strong>${попълнени}</strong> ${попълнени === 1 ? 'записан ден' : 'записани дни'} през последната година.` +
      (ср === null ? '' : ` Средно настроение: <strong>${ЛИЦА[Math.round(ср)]}</strong>.`)));
    c.appendChild(el('p', 'jr-privacy',
      'Празните квадратчета не са пропуски — те са дните, в които си била твърде заета да живееш. Това също се брои.'));
    return c;
  }

  // ═══════════ 🚫 4.5.11 НЕ-СПИСЪКЪТ ═══════════
  // Всяко приложение иска да добавиш неща. Това е единственото, което
  // ти помага да МАХНЕШ. Радикално, защото майчинството е трупане.
  const ПРИМЕРИ = [
    'Няма да пека сладки за детския рожден ден. Купувам.',
    'Няма да отговарям на съобщения след 21 ч.',
    'Няма да обяснявам защо не идваме на гости.',
    'Няма да гладя чаршафи. Никога повече.',
    'Няма да сравнявам моето дете с чуждото в интернет.',
    'Няма да се извинявам, че къщата е разхвърляна.',
    'Няма да ставам за играчка, паднала за трети път.',
    'Няма да чета още една статия в 2 през нощта.'
  ];
  function notListCard() {
    const c = card('Не-списъкът 🚫 ' + sub('какво НЯМА да правя — и това е решение'));
    c.appendChild(el('p', 'jr-privacy',
      'Всички списъци искат да добавиш. Този иска да махнеш. Всяко „няма да“ е време, което се връща при теб.'));
    // 🔴 11.08 капанът на снимката: снимка при рисуване, запис при клик. Пресен
    //    прочит при рисуване и преди запис; редът се намира по ТЕКСТ, не по номер.
    let st = load('bl_wm_notlist', []);
    const list = el('div', 'jr-wins');
    let махнато = null;
    const рисувай = () => {
      st = load('bl_wm_notlist', []);   // пресен прочит при всяко рисуване
      list.innerHTML = '';
      // 22.07 (армия): готовите идеи се рисуваха САМО при празен списък —
      //   първото докосване ги караше да изчезнат и другите три ставаха
      //   недостъпни. Сега стоят винаги; вече добавените отпадат от тях.
      if (!st.length) {
        list.appendChild(el('p', 'jr-privacy', 'Още е празен. Ето от какво се отказаха други майки:'));
      }
      st.slice().reverse().forEach((x, ri) => {
        const i = st.length - 1 - ri;
        const row = реже(el('div', 'nl-row'));
        row.innerHTML = `<span class="nl-x">🚫</span><span class="nl-t">${esc(x.t)}</span><button class="nt-del" type="button" aria-label="Махни „${esc(x.t)}“ от списъка">🗑</button>`;
        реже(row.querySelector('.nl-t'));      // 🔴 дългата дума изтичаше вън от картата
        const кофа = row.querySelector('.nt-del'); пръст(кофа);
        кофа.addEventListener('click', () => {
          махнато = st[i];
          st = load('bl_wm_notlist', []);   // пресен прочит ПРЕДИ записа
          const k = st.findIndex(y => y && y.t === x.t);   // по ТЕКСТ, не по номер
          if (k > -1) st.splice(k, 1);
          // 🔴 25.08 (ИЗМЕРЕНО при пълна памет): казваше „Махнах …“ и предлагаше
          //    „върни го“ за ред, който още си стои в паметта — покана да
          //    добави ВТОРО копие на нещо, което не е махано.
          if (!save('bl_wm_notlist', st)) { махнато = null; return; }
          рисувай();
          fx().buzz(8);
          каз(add, 'Махнах „' + махнато.t + '“. Ако не си искала — върни го.');
        });
        list.appendChild(row);
      });
      if (st.length) {
        list.appendChild(el('p', 'nl-count', 'Отказала си се от <strong>' + st.length + '</strong> ' + (st.length === 1 ? 'нещо' : 'неща') + '. Толкова време си върнала на себе си. 💜'));
      }
      // идеите остават на разположение, докато има непочерпени
      const взети = new Set(st.map(x => x.t));
      const оставащи = ПРИМЕРИ.filter(т => !взети.has(т));
      if (оставащи.length) {
        if (st.length) list.appendChild(el('p', 'jr-privacy', 'Още идеи, ако ти паснат:'));
        const пр = el('div', 'nl-ideas');
        оставащи.slice(0, 4).forEach(т => {
          const b = реже(el('button', 'nl-idea', esc(т))); b.type = 'button'; пръст(b);
          b.addEventListener('click', () => {
            st = load('bl_wm_notlist', []);   // пресен прочит ПРЕДИ записа
            st.push({ t: т, d: today() });
            if (!save('bl_wm_notlist', st)) return;   // 🔴 25.08: „✔“ без запис
            рисувай(); fx().buzz(8);
            каз(add, 'Отказа се от това ✔ Времето му се връща при теб.');
          });
          пр.appendChild(b);
        });
        list.appendChild(пр);
      }
      отмяна.hidden = !махнато;
    };
    const ред = el('div', 'jr-addrow');
    // ⚠️ НЕ `реже` върху <input>: min-width:0 маха min-width:auto на flex-детето
    //    и полето се свива до две букви (измерено 226 → 32.6 px в съседния файл).
    const inp = редполе(el('input', 'jr-word')); inp.placeholder = 'Няма да…'; inp.maxLength = 90;
    // 🟠 25.08: това е решение, не бележка за мляко — жена го пише бавно и го
    //    преформулира. Затвори ли стаята по средата (бебето се събуди), редът
    //    ѝ изчезваше. `data-draft` е конвенцията на проекта (js/daily.js:524
    //    пази на всяко натискане и казва честно, ако паметта е пълна).
    //    ПЪТ НАЗАД: махни двата реда долу и `save('bl_draft_notlist', '')`.
    inp.dataset.draft = 'bl_draft_notlist';
    inp.value = load('bl_draft_notlist', '');
    const add = el('button', 'jr-chip', '+ Отказвам се'); add.type = 'button'; пръст(add);
    const пиши = () => {
      const v = inp.value.trim();
      // 🔴 МЪЛЧАЛИВ БУТОН: празно поле → тапът не правеше нищо видимо
      if (!v) { каз(add, 'Полето е празно. Напиши от какво се отказваш и пак натисни.', inp); return; }
      st = load('bl_wm_notlist', []);   // пресен прочит ПРЕДИ записа
      st.push({ t: v.slice(0, 90), d: today() });
      // 🔴🔴 25.08 (ИЗМЕРЕНО при пълна памет): полето се чистеше ВИНАГИ и отдолу
      //    пишеше „Записах го ✔“ — отказът ѝ изчезваше и от паметта, и от екрана.
      //    Чистим САМО след потвърден запис; иначе текстът ѝ я чака в полето.
      if (!save('bl_wm_notlist', st)) return;
      inp.value = ''; save('bl_draft_notlist', '');   // черновата си отива с приетия ред
      рисувай(); fx().buzz(10);
      каз(add, 'Записах го ✔ Това вече не е твоя грижа.');
    };
    add.addEventListener('click', пиши);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); пиши(); } });
    ред.appendChild(inp); ред.appendChild(add);
    // ↩ 11.08: 🗑 триеше на секундата и без път назад. Един тап по грешен ред
    //    и решението ѝ изчезва — а точно тук всеки ред е било решение.
    const отмяна = el('button', 'jr-chip jr-chip-soft', '↩ Върни последното махнато');
    отмяна.type = 'button'; отмяна.hidden = true; пръст(отмяна);
    отмяна.addEventListener('click', () => {
      if (!махнато) { отмяна.hidden = true; return; }
      st = load('bl_wm_notlist', []);   // пресен прочит ПРЕДИ записа
      st.push(махнато);
      // 🔴 25.08: „Върнах … ✔“ се казваше и при паднал запис — редът изчезваше
      //    пак при следващото отваряне, а бутонът вече беше скрит.
      if (!save('bl_wm_notlist', st)) return;
      каз(отмяна, 'Върнах „' + махнато.t + '“ ✔');
      махнато = null; рисувай(); fx().buzz(8);
    });
    c.appendChild(ред); c.appendChild(list); c.appendChild(отмяна); рисувай();
    return c;
  }

  // ── свързване ──
  const E = () => window.BL_EXPR;
  const ПАКЕТИ = {
    'Дневник на мама': root => {
      root.appendChild(yearGridCard());
      root.appendChild(notListCard());
      // 4.5.6: гласовият дневник — 3 минути, защото в 3 сутринта не се пише
      if (E()) root.appendChild(E().voiceCard(
        'Гласовият дневник 🎙️ ' + sub('в 3 сутринта не се пише — говори се'),
        'bl_voice_diary',
        { maxSec: 180, labels: ['днес', 'тежко', 'хубаво', 'за после'] }));
    },
    'Бременност': root => {
      // 🤍 22.07 (армия, RED): картата се появяваше и пред жена, която е спряла
      //   очакването след загуба — и то в СЕКУНДАТА, в която каже „спри
      //   броенето“ (helper.js пре-рисува стаята веднага). „Гласово писмо в
      //   корема · от ~24-та седмица той чува гласа ти“. Целият expect.js е
      //   писан точно за да не се случва това; preg20.js пази всяка своя карта,
      //   тази беше пропусната. Нищо не се трие — записите ѝ стоят и картата
      //   се връща сама, ако тя избере resume от настройките.
      if (window.BL_EXPECT && BL_EXPECT.paused && BL_EXPECT.paused()) return;
      // 4.1.7: гласово писмо в корема — от 24-та седмица бебето чува.
      // Б1.3: подзаглавието знае СЕДМИЦАТА — „ВЕЧЕ те чува“ след 24-та
      // топли много повече от вечното „от ~24-та“.
      // 🔴 11.08 (правило В3, топъл майчин глас): подзаглавието казваше „ТОЙ
      //    вече те чува“ на всяка жена. Полът в bl_baby е 'boy' | 'girl' | ''
      //    (проверено в rooms2.js:1354) и в бременността най-често е ''.
      //    Жена, която чака момиче — или още не знае — четеше чужд род на
      //    единственото място, където ѝ говорим за нейното бебе.
      const пол = (load('bl_baby', {}) || {}).sex;
      const той = пол === 'boy' ? 'той' : пол === 'girl' ? 'тя' : 'бебето';
      const му = пол === 'girl' ? 'ѝ' : 'му';
      let подзаглавие = 'от ~24-та седмица ' + той + ' чува гласа ти';
      try {
        const lmp = window.BL_EXPECT ? BL_EXPECT.lmp() : load('bl_lmp', '');
        if (lmp) {
          const сед = Math.floor((Date.now() - new Date(lmp)) / 604800000);
          if (сед >= 24 && сед <= 42) подзаглавие = той + ' ВЕЧЕ те чува — говори ' + му + ' 💜';
          else if (сед > 0 && сед < 24) подзаглавие = 'запиши го — ' + той + ' ще го чуе съвсем скоро (от ~24-та)';
        }
      } catch (e) {}
      if (E()) root.appendChild(E().voiceCard(
        'Гласово писмо в корема 🤰 ' + sub(подзаглавие),
        'bl_voice_womb',
        { maxSec: 120, labels: ['писмо', 'песен', 'приказка'] }));
    },
    'Развитие и игри': root => {
      // 4.6.12: песничките с гласа на мама
      if (E()) root.appendChild(E().voiceCard(
        'Песничките с твоя глас 🎵 ' + sub('никой запис не звучи като мама'),
        'bl_voice_songs',
        { maxSec: 120, labels: ['приспивна', 'весела', 'наша'] }));
      // 4.6.6: рисунките по месеци
      // 🔴 11.08: „галерията на малкия творец“ + „първият МУ подпис“ — мъжки
      //    род пред майка на момиче. Полът стои в bl_baby.sex ('boy'|'girl'|'').
      const пол = (load('bl_baby', {}) || {}).sex;
      const творец = пол === 'girl' ? 'малката художничка' : пол === 'boy' ? 'малкия художник' : 'малкия творец';
      const негов = пол === 'girl' ? 'нейният' : пол === 'boy' ? 'неговият' : 'първият';
      if (E()) root.appendChild(E().photoListCard(
        'Рисунките по месеци 🎨 ' + sub('галерията на ' + творец),
        'bl_art_months',
        { notePrompt: 'На колко месеца я нарисува?', empty: 'Първата драскулка идва по-скоро, отколкото мислиш. Тя е ' + (негов === 'първият' ? 'първият подпис на детето ти' : негов + ' първи подпис') + '. 🖍️' }));
    }
  };
  Object.keys(ПАКЕТИ).forEach(стая => {
    const база = window.ROOM_FEATURES && window.ROOM_FEATURES[стая];
    if (!база) return;
    window.ROOM_FEATURES[стая] = root => { база(root); ПАКЕТИ[стая](root); };
  });
})();
