// ═══════════════════════════════════════════════════════════
// 🌊 РЕКАТА НА ВРЕМЕТО — „Историята ни“ (мега план 12, Н1)
// Агрегатор: събира миговете от ЦЯЛОТО приложение в една река.
// Никой не пише в нея — тя сама чете всичко. Ретроактивно!
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  // 🪤 26.08 (ИЗМЕРЕНО, dev/kriv_zapis.js — 126 ключа × 17 форми отрова):
  //    формата се проверяваше само ОТВЪН. ВЪТРЕ в масива можеше да седи
  //    `null` (внесено копие от друг телефон, прекъснат запис, стара версия)
  //    и първото `x.ts` събаряше картата. 59 карти умираха точно така —
  //    същият дефект като истинския `bl_custom_lists = [null]`.
  //    `безДупки` маха дупките ПРЕДИ някой да ги пипне.
  //    ЗАЩО Е БЕЗОПАСНО: никъде в проекта `null` не се пази в масив като
  //    „празно място" (проверено с grep за push(null) / fill(null) / [i]=null)
  //    — списъците са ЗАПИСИ, не решетки, тоест изместен индекс не значи нищо.
  //    ПЪТ НАЗАД: сменяш `безДупки(v)` обратно с `v` — един знак.
  // 🪤 26.08 (ИЗМЕРЕНО, dev/kriv_zapis.js): проверката за форма пазеше САМО
  //    масив-срещу-обект. Ключ с ЧИСЛО по подразбиране (bl_metime_start = 0)
  //    приемаше {} спокойно — после „сега минус {}" даваше NaN и на екрана
  //    на мама светеше часовник „NaN:NaN". простФормат пази и трите прости
  //    вида. Числов низ („15") се ПРЕВРЪЩА, не се хвърля — стари версии са
  //    пазили числа като низове и изхвърлянето би загубило истински данни.
  //    Връща undefined, когато няма мнение — не null, защото null е законна
  //    стойност по подразбиране на много места тук.
  //    ПЪТ НАЗАД: махаш от load реда, който вика простФормат.
  const простФормат = (v, d) => {
    const т = typeof d;
    if (т === 'number') {
      if (typeof v === 'number' && isFinite(v)) return v;
      if (typeof v === 'string' && v.trim() !== '' && isFinite(Number(v))) return Number(v);
      return d;
    }
    if (т === 'string') return typeof v === 'string' ? v : d;
    if (т === 'boolean') return typeof v === 'boolean' ? v : d;
    return undefined;
  };
  const безДупки = (v, дълб) => {
    if (!v || typeof v !== 'object') return v;
    const д = дълб || 0;
    if (д > 6) return v;                       // вложен боклук: спираме, не обикаляме вечно
    if (Array.isArray(v)) {
      for (let i = v.length - 1; i >= 0; i--) {
        if (v[i] === null || v[i] === undefined) v.splice(i, 1);
        else безДупки(v[i], д + 1);
      }
      return v;
    }
    for (const кл in v) if (Object.prototype.hasOwnProperty.call(v, кл)) безДупки(v[кл], д + 1);
    return v;
  };
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; const прим = простФормат(v, d); if (прим !== undefined) return прим; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return безДупки(v); } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { if (window.BL_ZAPIS_PADNA) BL_ZAPIS_PADNA(); return false; } return true; };
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const localDate = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const today = () => localDate(new Date());
  const getBaby = () => load('bl_baby', { name: '', birth: '' });
  const MOODS = ['😩', '😔', '😐', '🙂', '🥰'];
  const trim = (s, n) => { s = String(s || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; };

  // ── Събирачът: всеки източник пуска лодки [{ts, e, txt, img?}] ──
  function collect() {
    const R = [];
    const baby = getBaby();
    const nm = baby.name || 'Бебето';

    // дневникът
    load('bl_freepage', []).forEach(x => x && x.d && R.push({ ts: x.d, e: '✍️', txt: trim(x.t, 100) }));
    // 🪤 26.08 (ИЗМЕРЕНО, dev/kriv_zapis.js): единственият ред тук БЕЗ `x && x.d`.
    //    При крив запис (напр. масив от числа, внесено копие) в Реката влизаше
    //    лодка „„undefined“ undefined · Invalid Date" — карта, която се строи,
    //    но показва глупост. Съседните редове вече се пазят точно така.
    //    ПЪТ НАЗАД: махаш `x && x.d &&` от началото.
    load('bl_prompt_log', []).forEach(x => x && x.d && R.push({ ts: x.d, e: '💭', txt: '„' + trim(x.q, 46) + '“ — ' + trim(x.t, 70) }));
    [['bl_notes_baby', '📝'], ['bl_notes_food', '🥄'], ['bl_notes_health', '🩺'], ['bl_notes_dev', '🧸'], ['bl_notes_preg', '🤰'], ['bl_notes_tools', '🛠️']]
      .forEach(([k, e]) => load(k, []).forEach(x => x && x.d && R.push({ ts: x.d, e, txt: trim(x.t, 90) })));
    // проход 4: смехът на деня влиза в Реката — „Всичките са в Реката" вече е истина
    // (bl_laughs форма {t,d}, d е низ-дата → през T12:00 за коректно число-ts).
    load('bl_laughs', []).forEach(x => x && x.d && R.push({ ts: new Date(x.d + 'T12:00').getTime(), e: '😄', txt: trim(x.t, 90) }));
    Object.entries(load('bl_checkins', {})).forEach(([d, r]) => {
      if (r && r.w) R.push({ ts: new Date(d + 'T12:00').getTime(), e: MOODS[r.m] || '💜', txt: 'Думата на деня: „' + trim(r.w, 30) + '“' });
    });
    // г12 №354: „Три хубави неща“ се пишеше всяка вечер, а картата показва САМО
    // днешния запис — вчерашният беше недостъпен завинаги. Вече тече в Реката.
    Object.entries(load('bl_gratitude', {})).forEach(([d, arr]) => {
      const хубави = (Array.isArray(arr) ? arr : []).filter(Boolean);
      if (хубави.length) R.push({ ts: new Date(d + 'T12:00').getTime(), e: '🙏', txt: 'Три хубави неща: ' + trim(хубави.join(' · '), 90) });
    });
    load('bl_letters', []).forEach(x => x && R.push({ ts: x.ts, e: '💌', txt: (x.who === 'мама' ? '🌸 мама' : '🧢 тати') + ' остави писмо: ' + trim(x.t, 60) }));
    const lb = load('bl_letter_baby', null);
    if (lb) R.push({ ts: lb.ts, e: '💌', txt: 'Мама запечата писмо до ' + nm + ' 💜' });
    load('bl_voice', []).forEach(x => x && R.push({ ts: x.ts, e: '🎙️', txt: 'Гласова бележка на мама' }));
    // гласовите складове от rooms15 — иначе записите ѝ не се появяват в лентата
    load('bl_voice_diary', []).forEach(x => x && R.push({ ts: x.ts, e: '🎙️', txt: 'Гласов дневник на мама' + (x.label ? ' · ' + x.label : '') }));
    load('bl_voice_womb', []).forEach(x => x && R.push({ ts: x.ts, e: '🤰', txt: 'Гласово писмо в корема' + (x.label ? ' · ' + x.label : '') }));
    load('bl_voice_songs', []).forEach(x => x && R.push({ ts: x.ts, e: '🎵', txt: 'Песничка с гласа на мама' + (x.label ? ' · ' + x.label : '') }));

    // 💃 стая 8 — жената, не майката. Тези мигове са нейни, не на бебето.
    load('bl_wm_firsts', []).forEach(x => x && R.push({ ts: new Date(x.d + 'T12:00').getTime(), e: '🌟', txt: 'Първо за МЕН: ' + trim(x.t, 60), big: true }));
    load('bl_wm_bucket', []).forEach(x => { if (x.done && x.d) R.push({ ts: new Date(x.d + 'T12:00').getTime(), e: '🔥', txt: 'Отметнах от списъка: ' + trim(x.t, 55), big: true }); });
    load('bl_wm_letters', []).forEach(x => x && R.push({ ts: new Date(x.d + 'T12:00').getTime(), e: '💌', txt: 'Запечата писмо до себе си след година' }));
    load('bl_wm_moonwish', []).concat(load('bl_moonwish', [])).forEach(x => x && R.push({ ts: new Date(x.d + 'T12:00').getTime(), e: '🌑', txt: 'Новолуние: „' + trim(x.t, 50) + '“' }));
    load('bl_wm_compl', []).forEach(x => x && R.push({ ts: new Date(x.d + 'T12:00').getTime(), e: '💌', txt: 'Комплимент от ' + trim(x.w || 'някого', 16) + ': „' + trim(x.t, 44) + '“' }));
    Object.entries(load('bl_wm_last', {})).forEach(([k, d]) => d && R.push({ ts: new Date(d + 'T12:00').getTime(), e: '💋', txt: 'Отделих си време за: ' + k }));
    // 5.7: по-новите кътчета на стая 8 — реката още не ги знаеше
    load('bl_wm_mirror', []).forEach(x => x && x.d && R.push({ ts: new Date(x.d + 'T12:00').getTime(), e: '🪞', txt: 'Днес се харесах' }));
    load('bl_wm_places', []).forEach(x => x && x.d && R.push({ ts: new Date(x.d + 'T12:00').getTime(), e: x.k === 'was' ? '📍' : '✨', txt: (x.k === 'was' ? 'Била съм: ' : 'Искам да ида: ') + trim(x.t, 40), big: x.k === 'was' }));

    // 🔬 стая 9 — какво открих за бебето си сама
    (load('bl_lab', {}).done || []).forEach(x => x && R.push({ ts: new Date(x.d + 'T12:00').getTime(), e: '🔬', txt: 'Открих: ' + trim(x.t, 60), big: true }));
    load('bl_lab_timeline', []).forEach(x => x && x.d && R.push({ ts: new Date(x.d + 'T12:00').getTime(), e: '🕵️', txt: 'Отбелязах промяна: ' + trim(x.t, 55) }));
    load('bl_lab_flipped', []).forEach(x => { if (x && x.back) R.push({ ts: new Date(x.back + 'T12:00').getTime(), e: '🔄', txt: '„' + trim(x.t, 40) + '“ се върна', big: true }); });

    // 👩 профилът + седмичните награди + второто съкровище
    const мама = load('bl_mama', null);
    if (мама && мама.d) R.push({ ts: new Date(мама.d + 'T12:00').getTime(), e: мама.emoji || '🌸', txt: 'Създаде профила си', big: true });
    const б2 = load('bl_baby2', null);
    if (б2 && б2.d) R.push({ ts: new Date(б2.d + 'T12:00').getTime(), e: '🍼', txt: 'Добави ' + (б2.name || 'второ съкровище') + ' в семейството', big: true });
    load('bl_goal_stickers', []).forEach(x => x && x.d && R.push({ ts: new Date(x.d + 'T12:00').getTime(), e: x.e || '🏆', txt: 'Цел постигната: ' + trim(x.n, 45) }));

    // растежът и грижите
    // 🪤 26.08 (ИЗМЕРЕНО, dev/kriv_zapis.js): трите реда отдолу бяха БЕЗ пазача
    //    `x && x.…`, който съседните им редове имат. При крив запис в Реката
    //    влизаха лодки „: undefined кг (undefined-и персентил)" с Invalid Date.
    //    Пазачът е същият като на съседите — нищо ново, само последователно.
    //    ПЪТ НАЗАД: махаш `x && x.d &&` / `x && x.ts &&` от началото на реда.
    // 🔴🔴 26.08 (ИЗМЕРЕНО): запис с ВАЛИДНА дата, но празни числа минаваше
    //    и през двете нива защита — `load` чисти само дупки в масива, а
    //    отсяването на ред 203 гледа само датата. На реката на мама
    //    излизаше лодка „Мия: null кг (null-и персентил)".
    //    Пазачът `x && x.d` НЕ помага тук: датата е наред, липсва ТЕГЛОТО.
    //    Затова се проверява самата стойност, която влиза в текста, а
    //    персентилът просто отпада, ако го няма — вместо да пише „null-и".
    //    ПЪТ НАЗАД: върни едноредовата версия от git.
    load('bl_growth', []).forEach(x => {
      if (!x || !x.d || x.w == null || x.w === '') return;
      const прц = (x.p == null || x.p === '') ? '' : ' (' + x.p + '-и персентил)';
      R.push({ ts: new Date(x.d + 'T12:00').getTime(), e: '📏', txt: nm + ': ' + x.w + ' кг' + прц });
    });
    Object.entries(load('bl_firsts', {})).forEach(([f, d]) => { if (d) R.push({ ts: new Date(d + 'T12:00').getTime(), e: '🌟', txt: 'ПЪРВО: ' + trim(f, 60), big: true }); });
    Object.entries(load('bl_teeth_d', {})).forEach(([i, ts]) => ts && R.push({ ts, e: '🦷', txt: 'Ново зъбче проби! (' + (load('bl_teeth', []).length) + ' общо)', big: true }));
    Object.entries(load('bl_ms_d', {})).forEach(([id, ts]) => {
      const lbl = { motor: 'едро моторно', fine: 'фино моторно', speech: 'говор', social: 'социално' }[id.split('_')[1]] || 'умение';
      R.push({ ts, e: '🧸', txt: 'Ново умение разцъфна (' + lbl + ', ~' + id.split('_')[0] + ' м.)' });
    });
    load('bl_baby_sounds', []).forEach(x => x && x.ts && R.push({ ts: x.ts, e: '🎙️', txt: 'Звуков миг: ' + (x.label || 'запис') + ' на ' + nm }));

    // храната
    Object.entries(load('bl_tried_d', {})).forEach(([f, ts]) => ts && R.push({ ts, e: '🥄', txt: 'Опитахме ' + trim(f, 30) + ' ' + (load('bl_tried', {})[f] || '') }));
    load('bl_food_faces', []).forEach(x => x && x.ts && R.push({ ts: x.ts, e: '😋', txt: 'Гримасата при „' + trim(x.note, 24) + '“', img: x.img }));

    // лексиконът (със задна дата само ако имаме кога)
    const lex = load('bl_baby_lexicon', {});
    Object.entries(load('bl_lex_d', {})).forEach(([q, ts]) => { if (lex[q]) R.push({ ts, e: '🌟', txt: 'Лексиконът: „' + trim(q, 40) + '“ → ' + trim(lex[q], 50) }); });

    // снимките
    const dph = load('bl_dayphoto', {});
    Object.entries(dph).forEach(([d, img]) => img && R.push({ ts: new Date(d + 'T12:00').getTime(), e: '📸', txt: 'Снимката на деня', img }));
    if (baby.birth) {
      Object.entries(load('bl_photos', {})).forEach(([m, img]) => {
        const dd = BL_DATE.addMonths(baby.birth, +m);
        R.push({ ts: dd.getTime(), e: '📸', txt: m === '0' ? nm + ' се роди! 🎉' : 'Фото-лентата: ' + m + ' м.', img, big: m === '0' });
      });
    }
    const lmp = window.BL_EXPECT ? BL_EXPECT.lmp() : load('bl_lmp', '');
    if (lmp) Object.entries(load('bl_bump', {})).forEach(([w, img]) => {
      const dd = new Date(lmp); dd.setDate(dd.getDate() + w * 7);
      R.push({ ts: dd.getTime(), e: '🤰', txt: 'Коремчето на ' + (window.BL_BROI ? BL_BROI(w, 'седмица', 'седмици') : w + ' ' + (w === 1 ? 'седмица' : 'седмици')), img });
    });
    // Б10.4 (план 20): ехо-снимките и наддаването също са част от Историята
    load('bl_echo', []).forEach(x => {
      if (!x) return;
      const ts = x.ts || (lmp && x.w ? new Date(lmp).getTime() + x.w * 604800000 : 0);
      // г07/32: писачът (Ехо-албумът) слага думите на мама в поле `t`, а тук се
      //   четеше `note` — винаги undefined, значи бележката ѝ изчезваше.
      //   `|| x.note` е за стари записи, ако някъде има такива.
      const бележка = x.t || x.note;
      if (ts) R.push({ ts, e: '🩻', txt: 'Ехо' + (x.w ? ' на ' + x.w + '-та седмица' : '') + (бележка ? ': „' + trim(бележка, 40) + '“' : ''), img: x.img, big: true });
    });
    // г07/341: коремчето се крие при пауза (гейтът `if (lmp)` отгоре), а кантарът
    //   продължаваше да пише седмицата. Един и същи списък, едно и също правило.
    const наПауза = !!(window.BL_EXPECT && BL_EXPECT.paused && BL_EXPECT.paused());
    if (!наПауза) load('bl_pregw', []).forEach(x => {
      // 🔴 26.08: `x && x.d` пази ДАТАТА, но не и килограмите — запис с
      //    валидна дата и празно тегло даваше „Кантарът: undefined кг".
      //    Проверява се стойността, която ВЛИЗА в текста.
      if (x && x.d && x.kg != null && x.kg !== '') R.push({ ts: new Date(x.d + 'T12:00').getTime(), e: '📈', txt: 'Кантарът: ' + x.kg + ' кг' + (x.w ? ' (' + x.w + '-та с.)' : '') });
    });
    // 🔴 05.08 (СКЕПТИКЪТ към №181): rooms3.js вече ПРЕЛИВА bl_art в
    //    bl_art_months (еднократно, флаг bl_art_merged). Двата реда четяха без
    //    дедуп → всяка стара драскулка изплуваше ДВА пъти в Реката, веднъж като
    //    „Творба“ и веднъж като „Рисунка“, с една и съща снимка и един и същи ts.
    //    Авторът на №181 го записа като известна цена; тя се плаща тук.
    const _артTs = new Set();
    load('bl_art', []).forEach(x => { if (!x) return; _артTs.add(x.ts); R.push({ ts: x.ts, e: '🎨', txt: 'Творба: „' + trim(x.note || 'без име', 30) + '“', img: x.img }); });
    load('bl_art_months', []).forEach(x => { if (!x || _артTs.has(x.ts)) return; R.push({ ts: x.ts, e: '🎨', txt: 'Рисунка: „' + trim(x.note || 'без име', 30) + '“', img: x.img }); });

    // развитието и книжките
    load('bl_books', []).forEach(x => x && R.push({ ts: x.ts, e: '📚', txt: 'Нова книжка: ' + trim(x.t, 46) + (x.fav ? ' 💜' : '') }));

    // месечнините — синтетични, от рождената дата
    if (baby.birth) {
      const b = new Date(baby.birth);
      for (let m = 1; m <= 36; m++) {
        const dd = BL_DATE.addMonths(b, m);
        if (dd > new Date()) break;
        const lbl = m % 12 === 0 ? (m / 12) + (m / 12 === 1 ? ' годинка' : ' годинки') + '! 🎂🎉' : m + '-месечнина 🎂';
        R.push({ ts: dd.getTime(), e: '🎂', txt: nm + ': ' + lbl, big: m % 12 === 0 });
      }
    }

    // 12.9.7: миговете, които мама добавя РЪЧНО — не всичко се улавя само
    load('bl_river_manual', []).forEach(x => x && x.ts && R.push({ ts: x.ts, e: x.e || '💜', txt: trim(x.t, 90), big: true, manual: true }));

    R.sort((a, b) => b.ts - a.ts);
    return R.filter(x => x.ts && !isNaN(x.ts) && x.ts <= Date.now() + 86400000);
  }

  // ── Оверлеят „Историята ни“ ──
  function openRiver() {
    let ov = document.getElementById('riverOverlay');
    if (!ov) { ov = el('div', 'rv-overlay'); ov.id = 'riverOverlay'; document.body.appendChild(ov); }
    const R = collect();
    const baby = getBaby();
    let html = `<div class="rv-panel"><div class="rv-head"><h3>🌊 Историята ни</h3>
      <span class="rv-count">${window.BL_BROI ? BL_BROI(R.length, 'миг', 'мига') : R.length + ' ' + (R.length === 1 ? 'миг' : 'мига')}</span><button class="rv-close" type="button" aria-label="Затвори реката">✕</button></div>
      <div class="rv-add">
        <div class="rv-addrow">
          <div class="rv-emo" id="rvEmo">${[['💜','обич'],['🌟','гордост'],['😂','смях'],['🥹','разчувствах се'],['🎉','празник'],['📸','снимка']].map(([e, име], i) => `<button type="button" class="rv-emob${i === 0 ? ' on' : ''}" data-e="${e}" aria-label="${име}" aria-pressed="${i === 0 ? 'true' : 'false'}">${e}</button>`).join('')}</div>
          <input class="rv-addinp" id="rvAddInp" type="text" maxlength="90" placeholder="Добави миг ръчно… (напр. „първи път каза дядо“)">
          <button class="rv-addbtn" id="rvAddBtn" type="button" aria-label="Добави мига в реката">+</button>
        </div>
      </div>`;
    // 12.9.1 + 12.9.2: търсене и рафтове — реката при 200+ мига иначе е
    // само за скролване, не за намиране
    html += `<div class="rv-tools">
        <input class="rv-search" id="rvSearch" type="search" placeholder="🔍 Търси в реката… (дядо, зъбче, ягода)">
        <div class="rv-filters">
          <button class="rv-f on" data-f="all" type="button">Всички</button>
          <button class="rv-f" data-f="big" type="button">🌟 Големите</button>
          <button class="rv-f" data-f="img" type="button">📸 Снимки</button>
        </div>
      </div>`;
    // 12.9.5: лентата със снимки — реката като фотолента, най-новите напред
    const снимки = R.filter(x => x.img);
    if (снимки.length > 2) {
      html += `<div class="rv-strip" id="rvStrip">${снимки.slice(0, 30).map(x =>
        // 🟡 12.08: съседният ред (rv-img, по-долу) минава през esc() и пуска
        //    само data:/blob: — тук същата снимка влизаше сурова в атрибута.
        //    Едно правило за един и същи адрес.
        `<img src="${esc(x.img)}" alt="" loading="lazy" data-ts="${esc(String(x.ts))}">`).join('')}</div>`;
    }
    html += `<div class="rv-scroll">`;
    if (!R.length) {
      html += `<p class="rv-empty">Реката е още изворче. 🌱 Всяка снимка, дума, зъбче и мерене се влива тук — само̀.
        Върни се след първите мигове и ще видиш как тече историята ви.</p>`;
    } else {
      let lastMonth = '';
      R.forEach((x, i) => {
        const d = new Date(x.ts);
        const mKey = d.toLocaleDateString('bg-BG', { month: 'long', year: 'numeric' });
        if (mKey !== lastMonth) {
          // 12.9.4: месецът може да се разкаже — ✨ до заглавието
          html += `<div class="rv-month" data-mk="${mKey}">${mKey}
            <button class="rv-story-b" type="button" data-mk="${mKey}" aria-label="Разкажи месеца">✨</button></div>`;
          lastMonth = mKey;
        }
        html += `<div class="rv-row${x.big ? ' rv-big' : ''}" data-i="${i}" data-mk="${mKey}"
            data-q="${esc(x.txt.toLowerCase())}"${x.big ? ' data-big="1"' : ''}${x.img ? ' data-img="1"' : ''} data-ts="${x.ts}">
          <span class="rv-e">${esc(x.e)}</span>
          <div class="rv-body"><span class="rv-txt">${esc(x.txt)}</span>
          ${x.img && /^(data:image\/|blob:)/.test(x.img) ? `<img class="rv-img" src="${esc(x.img)}" alt="" loading="lazy">` : ''}
          <span class="rv-d">${d.toLocaleDateString('bg-BG')}
          ${x.big ? `<button class="rv-share" type="button" data-i="${i}" aria-label="Сподели мига">📤</button>` : ''}</span></div></div>`;
      });
      html += `<p class="rv-source">Реката се пълни сама — от дневника, снимките, зъбките, храните, уменията… 🌊</p>`;
    }
    html += `</div></div>`;
    ov.innerHTML = html;
    ov.hidden = false;
    document.body.style.overflow = 'hidden';
    const close = () => { ov.hidden = true; document.body.style.overflow = ''; };
    ov.querySelector('.rv-close').onclick = close;
    ov.onclick = e => { if (e.target === ov) close(); };

    // 👆 12.08 (обиколка на телефона, ИЗМЕРЕНО с getBoundingClientRect):
    //    реката живее в СВОЙ оверлей на <body>, затова глобалният пас на
    //    touch.css не я е стигнал целия. Измерено преди тази поправка:
    //      ✨ „разкажи месеца“ 17×16 · „+“ 33×33 · ✕ 38×38 · емоджи 29×42 ·
    //      полето за нов миг 124×37 · търсачката 325×39.
    //    17×16 е нокът, не пръст — а ✨ е единственият вход към разказа на
    //    месеца. Стилът е инлайн, защото CSS файловете не са мои.
    //    Редовете се ПРЕНАСЯТ, за да не изтласкат нищо извън панела (проверено:
    //    панелът остава 367 px без хоризонтален скрол).
    //    ПЪТ НАЗАД: махни целия блок „пипаемост“ — видът се връща както беше.
    (function пипаемост() {
      const мин = (сел, w, h) => ov.querySelectorAll(сел).forEach(e => {
        if (w) { e.style.minWidth = w + 'px'; }
        if (h) { e.style.minHeight = h + 'px'; }
        e.style.boxSizing = 'border-box';
        if (e.tagName === 'BUTTON') { e.style.display = 'inline-flex'; e.style.alignItems = 'center'; e.style.justifyContent = 'center'; }
      });
      мин('.rv-close', 44, 44);
      мин('.rv-emob', 44, 44);
      мин('.rv-addbtn', 44, 44);
      мин('.rv-addinp', 0, 44);
      мин('.rv-search', 0, 44);
      мин('.rv-f', 0, 44);
      мин('.rv-story-b', 44, 44);
      мин('.rv-share', 44, 44);
      const wrap = сел => ov.querySelectorAll(сел).forEach(e => { e.style.flexWrap = 'wrap'; });
      wrap('#rvEmo'); wrap('.rv-addrow'); wrap('.rv-filters');
      ov.querySelectorAll('.rv-addinp').forEach(e => { e.style.flex = '1 1 140px'; e.style.minWidth = '0'; });
      // ✨ е вътре в реда на месеца — вертикално подравнено, за да не „плува“
      ov.querySelectorAll('.rv-story-b').forEach(e => { e.style.verticalAlign = 'middle'; });
    })();

    // 12.9.7: ръчното добавяне — просто, без дата-избор (винаги днес; за
    // минало си има дневника). Презарежда цялата река, за да си застане на място.
    let избранЕмо = '💜';
    const емоРед = ov.querySelector('#rvEmo');
    емоРед.querySelectorAll('.rv-emob').forEach(b => b.addEventListener('click', () => {
      избранЕмо = b.dataset.e;
      емоРед.querySelectorAll('.rv-emob').forEach(x => { x.classList.remove('on'); x.setAttribute('aria-pressed', 'false'); });
      b.classList.add('on'); b.setAttribute('aria-pressed', 'true');
    }));
    const инп = ov.querySelector('#rvAddInp');
    const добави = () => {
      const v = инп.value.trim(); if (!v) { инп.focus(); return; }
      const списък = load('bl_river_manual', []);
      списък.push({ ts: Date.now(), e: избранЕмо, t: v.slice(0, 90) });
      save('bl_river_manual', списък);
      if (window.BL_FX) { BL_FX.buzz(10); BL_FX.confetti && BL_FX.confetti(); }
      openRiver();                                   // презареди с новия миг
    };
    ov.querySelector('#rvAddBtn').addEventListener('click', добави);
    инп.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); добави(); } });

    // ── 12.9.1 + 12.9.2: търсенето и рафтовете действат ЗАЕДНО ──
    let филтър = 'all', дума = '';
    function приложи() {
      const редове = ov.querySelectorAll('.rv-row');
      const видимиПоМесец = {};
      редове.forEach(r => {
        const видим = (филтър === 'all' || r.dataset[филтър === 'big' ? 'big' : 'img']) &&
                      (!дума || (r.dataset.q || '').includes(дума));
        r.style.display = видим ? '' : 'none';
        if (видим) видимиПоМесец[r.dataset.mk] = true;
      });
      // месец без нито един видим ред си тръгва с редовете
      ov.querySelectorAll('.rv-month').forEach(m => {
        m.style.display = видимиПоМесец[m.dataset.mk] ? '' : 'none';
      });
      // 🔴 12.08 (обиколка на телефона, ИЗМЕРЕНО): натиснах „📸 Снимки“ при 15
      //    мига без нито една снимка — 0 видими реда, 0 видими месеца и НИЩО
      //    написано. Мама вижда бяло поле и не знае дали филтърът работи, или
      //    реката ѝ се е изтрила. Същото и при търсене без съвпадение.
      //    Празно ≠ няма: казваме кое сме търсили и как се връща обратно.
      //    ПЪТ НАЗАД: махни блока `празно` и реда, който го вика.
      const колко = [...редове].filter(r => r.style.display !== 'none').length;
      let празно = ov.querySelector('.rv-nores');
      if (!колко && редове.length) {
        if (!празно) {
          празно = el('p', 'rv-empty rv-nores');
          празно.setAttribute('role', 'status');
          const скрол = ov.querySelector('.rv-scroll');
          if (скрол) скрол.insertBefore(празно, скрол.firstChild);
        }
        празно.textContent = дума
          ? '🔍 Нищо не намерих за „' + дума + '“' + (филтър !== 'all' ? ' в този рафт' : '') + '. Реката я има — просто тази дума я няма в нея. Изтрий търсенето, за да се върне всичко.'
          : (филтър === 'img'
            ? '📸 В реката още няма мигове със снимка. Щом добавиш снимка на деня или фото-лентата, те ще се появят тук. Натисни „Всички“, за да видиш останалото.'
            : '🌟 Още няма „големи“ мигове. Първите пъти, зъбките и месечнините влизат тук сами. Натисни „Всички“, за да видиш останалото.');
        празно.hidden = false;
      } else if (празно) празно.hidden = true;
    }
    const търси = ov.querySelector('#rvSearch');
    if (търси) търси.addEventListener('input', () => { дума = търси.value.trim().toLowerCase(); приложи(); });
    ov.querySelectorAll('.rv-f').forEach(b => b.addEventListener('click', () => {
      филтър = b.dataset.f;
      ov.querySelectorAll('.rv-f').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      приложи();
    }));

    // 12.9.5: докосната снимка от лентата → скролва до своя миг
    const лента = ov.querySelector('#rvStrip');
    if (лента) лента.querySelectorAll('img').forEach(им => им.addEventListener('click', () => {
      const ред = ov.querySelector('.rv-row[data-ts="' + им.dataset.ts + '"]');
      if (ред) { ред.scrollIntoView({ behavior: 'smooth', block: 'center' }); ред.classList.add('rv-flash'); setTimeout(() => ред.classList.remove('rv-flash'), 1400); }
    }));

    // ── 12.9.4: месецът става РАЗКАЗ — от неговите собствени мигове ──
    ov.querySelectorAll('.rv-story-b').forEach(b => b.addEventListener('click', () => {
      const мк = b.dataset.mk;
      const стар = ov.querySelector('.rv-story[data-mk="' + мк + '"]');
      if (стар) { стар.remove(); return; }                     // второ докосване го сгъва
      const мигове = R.filter((x, i) => {
        const р = ov.querySelector('.rv-row[data-i="' + i + '"]');
        return р && р.dataset.mk === мк;
      });
      const големи = мигове.filter(x => x.big);
      const снимкиМ = мигове.filter(x => x.img).length;
      const изр = [];
      if (големи.length) изр.push('Големите мигове: ' + големи.slice(0, 3).map(x => '„' + trim(x.txt, 42) + '“').join(' · ') + (големи.length > 3 ? ' и още ' + (големи.length - 3) : '') + '.');
      if (снимкиМ) изр.push(снимкиМ === 1 ? 'Една снимка го пази.' : снимкиМ + ' снимки го пазят.');
      изр.push('Общо ' + мигове.length + ' ' + (мигове.length === 1 ? 'миг' : 'мига') + ' — всичките ваши.');
      const div = el('div', 'rv-story');
      div.dataset.mk = мк;
      div.innerHTML = '✨ ' + изр.map(esc).join(' ');
      b.closest('.rv-month').insertAdjacentElement('afterend', div);
    }));

    // ── 12.9.6: сподели миг — само големите, с 📤 до датата ──
    ov.querySelectorAll('.rv-share').forEach(b => b.addEventListener('click', async e => {
      e.stopPropagation();
      const x = R[+b.dataset.i]; if (!x) return;
      const текст = x.e + ' ' + x.txt + '\n' + new Date(x.ts).toLocaleDateString('bg-BG') + '\n\n(от Помощникът на мама 🎈)';
      if (navigator.share) { try { await navigator.share({ text: текст }); return; } catch (err) { if (err.name === 'AbortError') return; } }
      try { await navigator.clipboard.writeText(текст); b.textContent = '✔'; setTimeout(() => b.textContent = '📤', 1500); } catch (err) {}
    }));
  }

  // ── 12.9.3: „Днес преди…“ като ИЗВЕСТИЕ, не само чип в „Днес“ ──
  // Мека лента долу, най-много веднъж на ден, само за ГОЛЕМИТЕ спомени
  // (година/3 месеца) — и никога върху друга лента.
  function изплувайСпомен() {
    if (load('bl_river_note', '') === (new Date()).toISOString().slice(0, 10)) return;
    if (document.getElementById('bubOffer') || document.getElementById('rvNote')) return;
    const мем = memoryFor(365) || memoryFor(180) || memoryFor(90);
    if (!мем || (!мем.big && !мем.img)) return;
    save('bl_river_note', (new Date()).toISOString().slice(0, 10));
    const дни = Math.round((Date.now() - мем.ts) / 86400000);
    const кога = дни >= 350 ? 'преди година' : дни >= 160 ? 'преди половин година' : 'преди 3 месеца';
    const л = el('div', 'bo-bar rvn'); л.id = 'rvNote';
    л.innerHTML = `<span class="bo-t">🔮 Днес ${кога}: ${esc(trim(мем.txt, 52))}</span>
      <button class="jr-chip" type="button" id="rvnGo">🌊 Виж</button>
      <button class="bo-no" type="button" aria-label="Затвори">✕</button>`;
    document.body.appendChild(л);
    requestAnimationFrame(() => л.classList.add('on'));
    const махни = () => { л.classList.remove('on'); setTimeout(() => л.remove(), 240); };
    л.querySelector('.bo-no').addEventListener('click', махни);
    л.querySelector('#rvnGo').addEventListener('click', () => { махни(); openRiver(); });
    setTimeout(() => { if (document.getElementById('rvNote')) махни(); }, 18000);
  }
  document.addEventListener('DOMContentLoaded', () => setTimeout(изплувайСпомен, 3500));

  // ── Картата в Дневника ──
  function riverCard() {
    const c = el('section', 'jr-card rv-card');
    const n = collect().length;
    c.innerHTML = `<h4 class="jr-title">Историята ни 🌊 <span class="jr-sub">реката на всичките ви мигове</span></h4>
      <div class="rv-teaser"><span class="rv-wave">〰️〰️〰️</span>
      <p class="cs-note">${n ? `<strong>${window.BL_BROI ? BL_BROI(n, 'миг', 'мига') : n + ' ' + (n === 1 ? 'миг' : 'мига')}</strong> ${n === 1 ? 'вече тече' : 'вече текат'} в реката ви.` : 'Реката чака първите мигове — те идват отвсякъде, сами.'}</p></div>`;
    const btn = el('button', 'jr-btn', '🌊 Отвори Историята ни'); btn.type = 'button';
    btn.addEventListener('click', openRiver);
    c.appendChild(btn);
    return c;
  }

  // ── „Днес преди…“ — миналото чука на вратата ──
  function memoryFor(daysAgo, tol) {
    const R = collect();
    const target = Date.now() - daysAgo * 86400000;
    const t = (tol || 1.6) * 86400000;
    return R.find(x => Math.abs(x.ts - target) < t && x.e !== '🎂') || null;
  }
  function mountMemory(container) {
    const inner = container.querySelector('.td-inner');
    if (!inner || inner.classList.contains('td-welcome')) return;
    let mem = memoryFor(365) || memoryFor(90) || memoryFor(30) || memoryFor(7, 0.6);
    if (!mem) return;
    const days = Math.round((Date.now() - mem.ts) / 86400000);
    const when = days >= 350 ? 'преди година' : days >= 80 ? 'преди 3 месеца' : days >= 25 ? 'преди месец' : 'преди седмица';
    const w = el('button', 'tm-card'); w.type = 'button';
    w.innerHTML = `<span class="tm-tag">🔮 Днес ${when}</span>
      ${mem.img && /^(data:image\/|blob:)/.test(mem.img) ? `<img class="tm-img" src="${esc(mem.img)}" alt="">` : `<span class="tm-e">${esc(mem.e)}</span>`}
      <span class="tm-txt">${esc(trim(mem.txt, 70))}</span>`;
    w.addEventListener('click', openRiver);
    inner.appendChild(w);
  }

  // ── Свързване ──
  const baseJournal = window.ROOM_FEATURES && window.ROOM_FEATURES['Дневник на мама'];
  if (baseJournal) {
    window.ROOM_FEATURES['Дневник на мама'] = root => {
      baseJournal(root);
      root.insertBefore(riverCard(), root.children[1] || null); // веднага след чекина
    };
  }
  const prevBind = window.BL_TODAY_BIND;
  window.BL_TODAY_BIND = function (container, baby, a) {
    if (prevBind) prevBind(container, baby, a);
    mountMemory(container);
  };

  window.BL_RIVER = { collect, open: openRiver, memoryFor };
})();
