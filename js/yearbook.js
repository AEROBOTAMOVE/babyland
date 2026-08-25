// ═══════════════════════════════════════════════════════════
// 📔 ГОДИШНИКЪТ (Споменникът) — мега план 12, Н9
// Авто-събрана, печатаема книга: снимки, лексикон, рекорди,
// първи пъти, статистика, любими редове. Гвоздеят на премиума.
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
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const getBaby = () => load('bl_baby', { name: '', birth: '' });
  const dstr = ts => new Date(ts).toLocaleDateString('bg-BG');

  function buildYearbook() {
    const baby = getBaby();
    const nm = esc(baby.name) || 'Нашето бебе';
    const a = baby.birth && window.BL_AGE ? BL_AGE(baby.birth) : null;

    // снимки: фото-лентата + последните снимки на деня
    const monthPhotos = Object.entries(load('bl_photos', {})).sort((x, y) => +x[0] - +y[0]);
    const dayPhotos = Object.entries(load('bl_dayphoto', {})).sort().slice(-6);
    // 🤍 18.08 (одит на логиката): снимките на коремчето влизаха в книгата
    //   БЕЗУСЛОВНО — включително при включена „пауза на очакването" след
    //   загуба. Жена, която е спряла всичко, за да не вижда бременността си,
    //   отваря годишника и я намира там, подредена за печат.
    //   Снимките НЕ СЕ ТРИЯТ — те са нейни и я чакат, ако някой ден вдигне
    //   паузата. Просто не влизат в книгата, докато паузата е включена.
    //   ПЪТ НАЗАД: махни `наПауза ? [] :` от следващия ред.
    const наПауза = !!(window.BL_EXPECT && BL_EXPECT.paused && BL_EXPECT.paused());
    const bump = наПауза ? [] :
      Object.entries(load('bl_bump', {})).sort((x, y) => +x[0] - +y[0]).slice(-4);

    // лексиконът
    const lex = Object.entries(load('bl_baby_lexicon', {}));

    // първите пъти
    const firsts = Object.entries(load('bl_firsts', {})).filter(([, d]) => d).sort((x, y) => x[1] < y[1] ? -1 : 1);

    // статистика — числата на любовта
    const stats = [];
    const dip = load('bl_diapers', {});
    const totDip = Object.values(dip).reduce((s, d) => s + (d.wet || 0) + (d.dirty || 0), 0);
    if (totDip) stats.push(['💧', totDip, 'сменени пелени']);
    const cks = Object.keys(load('bl_checkins', {})).length;
    if (cks) stats.push(['💜', cks, 'минутки за мама']);
    const nur = load('bl_nursing', []).length;
    if (nur) stats.push(['🤱', nur, 'записани хранения']);
    const teeth = load('bl_teeth', []).length;
    if (teeth) stats.push(['🦷', teeth, 'зъбчета']);
    const tried = Object.keys(load('bl_tried', {})).length;
    if (tried) stats.push(['🥄', tried, 'опитани храни']);
    const ms = Object.values(load('bl_ms_done', {})).filter(Boolean).length;
    if (ms) stats.push(['🧸', ms, 'умения']);
    const river = window.BL_RIVER ? BL_RIVER.collect().length : 0;
    if (river) stats.push(['🌊', river, 'мига в реката']);

    // редове от дневника
    // г12 №354: „Писмо за месеца“ (bl_month_letters) се запечатваше и оставаше
    // без читател — най-обмислените редове на мама не влизаха в книгата. Сега влизат.
    const писма = Object.entries(load('bl_month_letters', {}))
      .sort((a, b) => (a[0] > b[0] ? 1 : -1)).slice(-6)
      .map(([m, x]) => ({ t: x && x.t, d: (x && x.ts) || (m + '-01') }))
      .filter(x => x.t);
    // 🪤 26.08 (ИЗМЕРЕНО, dev/kriv_zapis.js): при крив bl_prompt_log (внесено
    //    копие) в годишника влизаше ред „„undefined“ — undefined". Годишникът
    //    се ПЕЧАТА — сгрешеният ред остава на хартия завинаги. Затова се взимат
    //    само записите, които наистина имат въпрос и дата.
    //    ПЪТ НАЗАД: махаш `.filter(x => x && x.d && x.q)`.
    const lines = load('bl_freepage', []).slice(-5).concat(load('bl_prompt_log', []).filter(x => x && x.d && x.q).slice(-3).map(x => ({ t: '„' + x.q + '“ — ' + x.t, d: x.d }))).concat(писма);

    // растеж
    const growth = load('bl_growth', []);
    const gLast = growth.slice(-1)[0];

    let html = '';
    // корица — със снимката на бебето, ако има
    const coverImg = (monthPhotos[0] && monthPhotos[0][1]) || (dayPhotos[0] && dayPhotos[0][1]) || null;
    html += `<div class="yb-cover">${coverImg ? `<img class="yb-coverimg" src="${esc(coverImg)}" alt="">` : '<div class="yb-balloon">🎈</div>'}<h1>${nm}</h1>
      <p class="yb-sub">${a ? 'Книгата на първите ' + esc(a.text) : 'Нашата книга на чакането'}</p>
      <p class="yb-year">${new Date().getFullYear()}</p></div>`;

    // снимки
    if (monthPhotos.length || dayPhotos.length || bump.length) {
      html += `<div class="yb-page"><h2>📸 Как порасна</h2><div class="yb-photogrid">`;
      // 🟡 12.08: корицата два реда по-горе минава през esc(), а тези три реда
      //    лепяха адреса на снимката сурово в атрибута. Един и същ адрес, едно
      //    и също правило — иначе утре някой ще смени източника на снимките и
      //    ще намери дупката тъкмо тук, в книгата за печат.
      bump.forEach(([w, img]) => { html += `<figure><img src="${esc(img)}"><figcaption>коремчето, ${esc(String(w))} с.</figcaption></figure>`; });
      monthPhotos.forEach(([m, img]) => { html += `<figure><img src="${esc(img)}"><figcaption>${m === '0' ? 'раждането 🐣' : esc(String(m)) + ' мес.'}</figcaption></figure>`; });
      dayPhotos.forEach(([d, img]) => { html += `<figure><img src="${esc(img)}"><figcaption>${esc(d.slice(8))}.${esc(d.slice(5, 7))}</figcaption></figure>`; });
      html += `</div></div>`;
    }

    // първите пъти
    if (firsts.length) {
      html += `<div class="yb-page"><h2>🌟 Първите пъти</h2><ul class="pr-list">` +
        firsts.map(([f, d]) => `<li><strong>${esc(f)}</strong> — ${new Date(d).toLocaleDateString('bg-BG')}</li>`).join('') + `</ul></div>`;
    }

    // лексиконът
    if (lex.length) {
      html += `<div class="yb-page"><h2>🌟 Лексиконът на ${esc(nm)}</h2>` +
        lex.map(([q, ans]) => `<p class="yb-lex"><span class="yb-q">${esc(q)}</span><br>${esc(ans)}</p>`).join('') + `</div>`;
    }

    // числата
    if (stats.length) {
      html += `<div class="yb-page"><h2>🔢 Числата на любовта</h2><div class="yb-stats">` +
        stats.map(([e, n, lbl]) => `<div class="yb-stat"><span class="yb-se">${e}</span><strong>${n}</strong><span>${lbl}</span></div>`).join('') + `</div>` +
        (gLast ? `<p class="pr-note">Последно мерене: ${gLast.w} кг на ${gLast.m} м. (${gLast.p}-и персентил, ${gLast.d})</p>` : '') + `</div>`;
    }

    // редовете на мама
    if (lines.length) {
      html += `<div class="yb-page"><h2>✍️ Редовете на мама</h2>` +
        lines.map(x => `<p class="yb-line">${esc(String(x.t).slice(0, 220))}<span class="yb-ld">${dstr(x.d)}</span></p>`).join('') + `</div>`;
    }

    // 5.2: „Годината на ЖЕНАТА“ — цялата книга досега е за бебето;
    // тази страница е ЗА НЕЯ, не за майчинството ѝ.
    const жСтат = [];
    const огледала = load('bl_wm_mirror', []).length;
    if (огледала) жСтат.push(['🪞', огледала, огледала === 1 ? 'ден се харесах' : 'дни се харесах']);
    const комплименти = load('bl_wm_compl', []).length;
    if (комплименти) жСтат.push(['💌', комплименти, 'пазени комплимента']);
    const места = load('bl_wm_places', []).filter(x => x && x.k === 'was').length;
    if (места) жСтат.push(['📍', места, места === 1 ? 'ново място' : 'нови места']);
    const карти = (load('bl_cards', { seen: [] }).seen || []).length;
    if (карти) жСтат.push(['🃏', карти, карти === 1 ? 'изтеглена карта' : 'изтеглени карти']);
    const мечти = load('bl_wm_bucket', []).filter(x => x && x.done).length;
    if (мечти) жСтат.push(['🔥', мечти, мечти === 1 ? 'отметната мечта' : 'отметнати мечти']);
    const ритуалСерия = (load('bl_wm_ritual_streak', { n: 0 }).n) || 0;
    if (ритуалСерия) жСтат.push(['🕯️', ритуалСерия, ритуалСерия === 1 ? 'ден ритуал' : 'дни ритуал подред']);
    const тайни = !!String(load('bl_wm_secret', '') || '').trim();
    const жКомплимент = load('bl_wm_compl', []).slice(-1)[0];
    if (жСтат.length || тайни || жКомплимент) {
      html += `<div class="yb-page"><h2>🌸 Годината на ЖЕНАТА</h2>
        <p class="pr-note">Не мама. Не съпруга. Просто ти — годината, в която не се изгуби напълно.</p>` +
        (жСтат.length ? `<div class="yb-stats">${жСтат.map(([e, n, lbl]) => `<div class="yb-stat"><span class="yb-se">${e}</span><strong>${n}</strong><span>${esc(lbl)}</span></div>`).join('')}</div>` : '') +
        (жКомплимент ? `<p class="yb-line">„${esc(жКомплимент.t)}“<span class="yb-ld">— ${esc(жКомплимент.w || 'някой, който те гледаше')}</span></p>` : '') +
        (тайни ? `<p class="pr-note">🔒 Има и тайна страница — тя си остава само твоя. Тази книга не я издава.</p>` : '') +
        `</div>`;
    }

    // 5.2: „Какво открих за теб“ — истинските опити от Лабораторията,
    // с ПРИСЪДАТА, не с гадаене. Само 6-те най-нови, за да не удавя книгата.
    const открития = (load('bl_lab', { done: [] }).done || []).slice(-6).reverse();
    if (открития.length) {
      html += `<div class="yb-page"><h2>🔬 Какво открих за теб</h2>
        <p class="pr-note">Не съвети от интернет. Твоите собствени вечери, преброени.</p>
        <ul class="pr-list">` +
        открития.map(x => `<li>${esc(x.e || '🔬')} <strong>${esc(x.q || '')}</strong> → ${esc(x.t || '')} <small>(${esc(x.d || '')})</small></li>`).join('') +
        `</ul></div>`;
    }

    html += `<div class="yb-page yb-end"><p>Направено с безкрайна обич.<br>🎈 Бейби Ленд · ${new Date().toLocaleDateString('bg-BG')}</p></div>`;
    return html;
  }

  function yearbookCard() {
    const c = el('section', 'jr-card yb-card');
    c.innerHTML = `<h4 class="jr-title">Годишникът 📔 <span class="jr-sub">книгата ви — събира се сама от всичко тук</span></h4>
      <p class="cs-note">Снимките, лексиконът, първите пъти, числата, редовете на мама — една книга, готова за печат (и за баба).</p>`;
    const btn = el('button', 'jr-btn', '📔 Направи книгата'); btn.type = 'button';
    btn.addEventListener('click', () => {
      if (window.BL_EXPR) BL_EXPR.printOverlay('', buildYearbook(), { cls: 'yb-book' });
      if (window.BL_FX) BL_FX.chime();
    });
    c.appendChild(btn);
    return c;
  }

  const baseJournal = window.ROOM_FEATURES && window.ROOM_FEATURES['Дневник на мама'];
  if (baseJournal) {
    window.ROOM_FEATURES['Дневник на мама'] = root => { baseJournal(root); root.appendChild(yearbookCard()); };
  }

  window.BL_YEARBOOK = { build: buildYearbook };
})();
