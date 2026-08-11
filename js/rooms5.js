// ═══════════════════════════════════════════════════════════
// ROOMS 5 — ДОИЗКУСУРЯВАНЕТО (план 15, Д2–Д5)
// 📅 календарен център • ⚠️ пелена-пазач • 💌 месечно писмо •
// 🤒 болничен епизод • 🛒 списък за пазар • 🎲 днешната игра •
// 📖 дайджест • 🌙 нощен таймер • 📤 сподели-бутони
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const localDate = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const today = () => localDate(new Date());
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const card = t => { const c = el('section', 'jr-card'); c.appendChild(el('h4', 'jr-title', t)); return c; };
  const fx = () => window.BL_FX || { confetti() {}, cheer() {}, buzz() {} };
  const getBaby = () => load('bl_baby', { name: '', birth: '' });

  // ═══════════ 📅 Д2: КАЛЕНДАРНИЯТ ЦЕНТЪР — всички дати на едно място ═══════════

  function collectDates(days) {
    const out = [];
    const now = new Date(); now.setHours(0, 0, 0, 0);
    const until = new Date(now.getTime() + (days || 30) * 86400000);
    const baby = getBaby();
    // ваксини (неотметнатите, по възрастта)
    if (baby.birth && window.BL_VACCINES) {
      const vax = load('bl_vax', {});
      BL_VACCINES.forEach((v, i) => {
        if (vax[i]) return;
        const d = BL_DATE.addMonths(baby.birth, v.m);
        if (d >= now && d <= until) out.push({ d, e: '💉', t: v.n });
        // 22.07 (армия): просрочената ваксина не се виждаше НИКЪДЕ — нито
        // тук, нито на чипа в Днес (той гледа само 0-2 дни напред), а
        // списъкът рапортуваше „чисти са“. Закъснялото се показва първо.
        // 🔴 04.08 (обиколка, армия Инструменти): „закъсняла“ се смяташе от
        //    ЛИПСА НА ОТМЕТКА. Но bl_vax се пълни само когато мама ръчно
        //    натисне ред в имунизационния календар — никой друг модул не пише
        //    там. Майка на ваксинирано по график бебе, която просто не е
        //    пипала календара, отваряше „Какво предстои“ и виждаше четири
        //    червени реда „⚠️ Закъсняла…“, които влизаха и в листа за
        //    хладилника. Празната отметка НЕ е доказателство за пропусната
        //    ваксина. Затова питаме, вместо да обвиняваме.
        else if (d < now) {
          const изминали = Math.round((now - d) / 86400000);
          // 🔴 11.08 (обиколка „документи и пари“): реда го подреждаме най-отгоре
          //    с d:now, НО показвахме и ДАТАТА d:now — тоест „11.08.2026 · ДНЕС“
          //    върху ред, който в същото изречение казва „беше преди 212 дни“.
          //    Същият грешен ден отиваше и на „Листа за хладилника“, който мама
          //    носи при педиатъра. Датата за показване е истинската (реална).
          if (изминали <= 400) out.push({ d: now, реална: d, минала: true, e: '💉', t: v.n + ' — отбелязана ли е? (по календара беше преди ' + изминали + (изминали === 1 ? ' ден' : ' дни') + '. Ако е сложена, докосни я в имунизационния календар.)' });
        }
      });
    }
    // месечнини и годишнини
    if (baby.birth) {
      const b = new Date(baby.birth);
      for (let m = 1; m <= 36; m++) {
        const d = BL_DATE.addMonths(b, m);
        if (d >= now && d <= until) out.push({ d, e: '🎂', t: (baby.name || 'Бебето') + ': ' + (m % 12 === 0 ? (m / 12) + (m / 12 === 1 ? ' годинка!' : ' годинки!') : m + '-месечнина') });
      }
    }
    // изтичащи от аптечката
    load('bl_pharmacy', []).forEach(x => {
      if (!x.exp) return;
      const d = new Date(x.exp);
      if (d >= now && d <= until) out.push({ d, e: '🧰', t: 'Изтича: ' + x.n });
    });
    // собствени дати (прегледи, гости, басейн…)
    load('bl_events', []).forEach(x => {
      const d = new Date(x.d);
      if (d >= now && d <= until) out.push({ d, e: x.e || '📌', t: x.t, own: true, id: x.id });
    });
    out.sort((a, b) => a.d - b.d);
    return out;
  }

  function calendarCard() {
    const c = card('Какво предстои 📅 <span class="jr-sub">ваксини · месечнини · прегледи · срокове — на едно място</span>');
    const list = el('div', 'ev-list');
    const addRow = el('div', 'jr-addrow');
    const inp = el('input', 'jr-word'); inp.placeholder = 'напр. „Преглед при педиатъра“'; inp.maxLength = 50;
    const dt = el('input', 'jr-word ph-date'); dt.type = 'date'; dt.min = today();
    // ♿ 11.08 (клавиатура-четец): при type=date подсказка не се показва — полето
    //    стоеше без име, а „+" не казваше какво добавя.
    dt.setAttribute('aria-label', 'Дата на събитието');
    const add = el('button', 'jr-chip', '+'); add.type = 'button';
    add.setAttribute('aria-label', 'Добави събитието');
    addRow.appendChild(inp); addRow.appendChild(dt); addRow.appendChild(add);
    add.addEventListener('click', () => {
      const v = inp.value.trim(); if (!v || !dt.value) return;
      const ev = load('bl_events', []);
      ev.push({ id: 'e' + Date.now(), t: v, d: dt.value, e: /преглед|лекар|педиат/i.test(v) ? '🩺' : '📌' });
      save('bl_events', ev); inp.value = ''; dt.value = ''; fx().buzz(10); draw();
    });
    function draw() {
      const items = collectDates(30);
      list.innerHTML = items.length ? '' : '<p class="jr-privacy">Следващите 30 дни са чисти. Добави преглед или събитие отдолу. 📅</p>';
      items.forEach(x => {
        const dd = Math.round((x.d - new Date().setHours(0, 0, 0, 0)) / 86400000);
        const дата = x.реална || x.d;
        const when = x.минала ? 'по календара' : dd === 0 ? 'ДНЕС' : dd === 1 ? 'утре' : 'след ' + dd + ' дни';
        const row = el('div', 'ev-row' + (dd <= 3 ? ' soon' : ''));
        row.innerHTML = `<span class="ev-e">${x.e}</span><span class="ev-t">${esc(x.t)}<small>${дата.toLocaleDateString('bg-BG')} · ${when}</small></span>` +
          (x.own ? '<button class="nt-del" type="button" aria-label="Изтрий">🗑</button>' : '');
        if (x.own) row.querySelector('.nt-del').addEventListener('click', () => {
          save('bl_events', load('bl_events', []).filter(e2 => e2.id !== x.id)); draw();
        });
        list.appendChild(row);
      });
    }
    const pr = el('button', 'jr-btn', '🖨️ Лист за хладилника'); pr.type = 'button';
    pr.addEventListener('click', () => {
      const items = collectDates(30);
      if (window.BL_EXPR) BL_EXPR.printOverlay('Какво предстои — следващите 30 дни',
        `<ul class="pr-list">${items.map(x => `<li>${x.e} <strong>${(x.реална || x.d).toLocaleDateString('bg-BG')}</strong> — ${esc(x.t)}</li>`).join('') || '<li>Няма отбелязани събития.</li>'}</ul>
         <p class="pr-note">Ваксините са по официалния календар — потвърди датите с личния лекар.</p>`);
    });
    c.appendChild(list); c.appendChild(addRow); c.appendChild(pr);
    draw();
    return c;
  }

  // 🪦 05.08 (скептик 198): тук живееше pregVisitCard() — „Следващият преглед 🩺“.
  //    МАХНАТА, защото беше МЪРТВА КАРТА, а не защото е излишна функция:
  //    preg20.js я поглъщаше в „Прегледът 🩺“ на всяко влизане в стаята
  //    (preg20.js:504-508, вътре в надгради(), БЕЗ гейт по седмица), а на пауза
  //    самата тя връщаше null. Тоест текстът ѝ не е стигал до нито един екран.
  //    Проверено наживо 05.08 през ROOM_FEATURES['Бременност'] върху празен
  //    localStorage: нормално → 15 карти, „Следващият преглед“ ГО НЯМА,
  //    „Прегледът“ го има; на пауза → 0 карти, няма нито едната.
  //    Цената на мъртвата карта беше реална: една поправка (обещанието „ще ти
  //    напомня на «Днес»“, което кодът не изпълнява) беше вложена ТУК и никой
  //    не я видя. Живият ѝ близнак е preg20.js:205-221 — датата, полето и
  //    същият ключ bl_events са там. Ако някой ден трябва да се върне:
  //    първо махни сливането в preg20.js:504, иначе пак ще е невидима.

  // ═══════════ 🤒 Д3: БОЛНИЧНИЯТ ЕПИЗОД — всичко за болестта в една линия ═══════════

  function episodeCard() {
    const c = card('Болничният епизод 🤒 <span class="jr-sub">температури + лекарства + бележки — една времева линия</span>');
    const box = el('div', 'ep-box');
    function draw() {
      const cut = Date.now() - 7 * 86400000;
      const items = []
        .concat(load('bl_temps', []).filter(x => x.ts > cut).map(x => ({ ts: x.ts, e: '🌡️', t: x.v + '°', hot: x.v >= 38 })))
        .concat(load('bl_meds', []).filter(x => x.ts > cut).map(x => ({ ts: x.ts, e: '💊', t: x.n })))
        .concat(load('bl_notes_health', []).filter(x => x.d > cut).map(x => ({ ts: x.d, e: '📝', t: String(x.t).slice(0, 60) })))
        .sort((a, b) => b.ts - a.ts);
      if (!items.length) { box.innerHTML = '<p class="jr-privacy">Дано остане празно! При болест: мери температура, записвай даденото — линията се реди сама и я показваш на лекаря.</p>'; return; }
      box.innerHTML = items.slice(0, 14).map(x =>
        `<div class="ep-row${x.hot ? ' hot' : ''}"><span class="ep-e">${x.e}</span><span class="ep-t">${esc(x.t)}</span><span class="ep-d">${new Date(x.ts).toLocaleString('bg-BG', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>`).join('');
    }
    draw();
    c.appendChild(box);
    // секционирането пренарежда картите → „Бележка за прегледа" вече е ПОД тази
    // (в „🩺 За лекаря"), не над нея (одит-флот П23, проход 2 №18)
    c.appendChild(el('p', 'jr-privacy', 'Печатният вариант е в „Бележка за прегледа“ по-долу.'));
    return c;
  }

  // ═══════════ 🛒 Д3: СПИСЪКЪТ ЗА ПАЗАР — от менюто с 1 докосване ═══════════

  function shopListCard() {
    const c = card('Списък за пазар 🛒 <span class="jr-sub">от менюто за седмицата — с едно докосване</span>');
    const btn = el('button', 'jr-btn', '🛒 Събери от менюто'); btn.type = 'button';
    const out = el('div', 'lc-out');
    btn.addEventListener('click', async () => {
      const menu = load('bl_menu', {});
      // 🔴 г09/43: Object.values() вземаше ВСЯКА дата, писана някога в менюто — нищо
      //    не чисти bl_menu по давност. Отметките под същия бутон (rooms16.js) четат
      //    само отсега нататък → един и същ „Списък за пазар“ даваше два отговора.
      const items = [...new Set(Object.keys(menu).filter(d => d >= today()).sort().map(d => menu[d]))].filter(Boolean);
      if (!items.length) { out.innerHTML = '<p class="jr-privacy">Няма нищо планирано отсега нататък — сложи няколко дни в „Меню за седмицата“ и се върни. 📅</p>'; return; }
      const text = '🛒 За пазара (менюто на бебето):\n' + items.map(x => '• ' + x).join('\n') + '\n\n(Бейби Ленд 🎈)';
      out.innerHTML = `<div class="lc-idea pop">${items.map(x => '• ' + esc(x)).join('<br>')}</div>`;
      if (navigator.share) { try { await navigator.share({ text }); return; } catch (e) {} }
      try { await navigator.clipboard.writeText(text); fx().cheer('Копирано — прати го на когото пазарува! 🛒'); } catch (e) {}
    });
    c.appendChild(btn); c.appendChild(out);
    return c;
  }

  // ═══════════ 💌 Д3: МЕСЕЧНОТО ПИСМО — предпопълнено от миговете ═══════════

  function monthLetterCard() {
    const now = new Date();
    // 🟠 11.08 (обиколка като майка, Дневник): подзаглавието твърдеше
    //    „миговете са събрани — добави само думите си“ ВИНАГИ. При празен
    //    месец полето беше голо и обещанието — невярно. Празно не значи
    //    „няма“, значи „още нямам записано“ — и така го казваме.
    let мигове = [];
    if (window.BL_RIVER) {
      try {
        мигове = BL_RIVER.collect().filter(x => {
          const d = new Date(x.ts);
          return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && x.e !== '💜';
        }).slice(0, 5);
      } catch (e) { мигове = []; }
    }
    const c = card('Писмо за месеца 💌 <span class="jr-sub">' +
      (мигове.length ? 'миговете са събрани — добави само думите си'
                     : 'още нямам записани мигове от този месец — думите ти стигат') + '</span>');
    const key = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    const letters = load('bl_month_letters', {});
    if (letters[key]) {
      c.appendChild(el('div', 'lb-open', `<p class="lb-txt">${esc(letters[key].t)}</p><p class="lb-d">— писмото за ${now.toLocaleDateString('bg-BG', { month: 'long' })}, запечатано 💜</p>`));
      const re = el('button', 'jr-chip', '✍️ Пренапиши'); re.type = 'button';
      re.addEventListener('click', () => { delete letters[key]; save('bl_month_letters', letters); c.replaceWith(monthLetterCard()); });
      c.appendChild(re);
      return c;
    }
    // предпопълване от Реката: миговете на този месец (събрани по-горе)
    const seed = мигове.length ? 'Този месец: ' + мигове.map(m => m.txt).join(' · ') + '.\n\n' : '';
    const ta = el('textarea', 'jr-paper'); ta.rows = 5;
    ta.value = seed ? seed + 'Мило мое, ' : '';
    ta.placeholder = 'Мило мое… (какво искаш да помниш от този месец?)';
    const btn = el('button', 'jr-btn', 'Запечатай писмото 💌'); btn.type = 'button';
    btn.addEventListener('click', () => {
      const v = ta.value.trim(); if (!v) return;
      letters[key] = { t: v, ts: Date.now() };
      save('bl_month_letters', letters);
      // 🔴 г09/283: пишеше „в съкровищницата“, а правилата на journal.js пращат
      //    „писмо за месеца“ в „✍️ Пиши и помни“. Не наричаме секция, в която го няма.
      fx().confetti(btn); fx().cheer('Писмото за месеца е запечатано 💌');
      c.replaceWith(monthLetterCard());
    });
    c.appendChild(ta); c.appendChild(btn);
    return c;
  }

  // ═══════════ 📤 Д5: СПОДЕЛИ-БУТОНИ за красивите неща ═══════════

  function shareBtn(title, subFn) {
    const b = el('button', 'jr-chip', '📤 Сподели като картичка'); b.type = 'button';
    b.addEventListener('click', () => {
      if (window.BL_SHARE) BL_SHARE.shareCard({ emoji: '🎈', title, sub: subFn() });
    });
    return b;
  }

  // ═══════════ Днес-добавки: пелена-пазач · днешната игра · дайджест · календар-чип ═══════════

  function mountToday(container) {
    const inner = container.querySelector('.td-inner');
    if (!inner || inner.classList.contains('td-welcome')) return;
    // ⚠️ пелена-пазачът: следобед без нито една мокра пелена = мек аларм
    const dip = load('bl_diapers', {})[today()];
    if (dip && new Date().getHours() >= 14 && (dip.wet || 0) === 0 && (dip.dirty || 0) > 0) {
      inner.appendChild(el('div', 'td-guard', '⚠️ Днес още няма отбелязана МОКРА пелена. Ако наистина е така — предлагай течности и при съмнение звънни на лекаря (сухите пелени са важен сигнал).'));
    }
    // 🎲 днешната игра по възрастта
    if (!inner.querySelector('.td-game') && window.BL_DATA && BL_DATA.activities) {
      const baby = getBaby();
      const a = baby.birth && window.BL_AGE ? BL_AGE(baby.birth) : null;
      if (a) {
        const pool = BL_DATA.activities.filter(x => a.devMonths >= x.a0 && a.devMonths <= x.a1);
        if (pool.length) {
          const doy = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
          const g = pool[doy % pool.length];
          inner.appendChild(el('div', 'td-game', `<span>🎲</span> <strong>Играта за днес:</strong> ${esc(g.t)} — ${esc(g.x)}`));
        }
      }
    }
    // 📅 календар-чип: най-близкото събитие до 3 дни
    // клиентски тест 21.07: на месечнината се показваха ТРИ рождени неща (банер +
    // „Сподели"-чип + този). Пропускаме ДНЕШНАТА рождена дата — банерът я покрива.
    const днес0 = new Date(); днес0.setHours(0, 0, 0, 0);
    const next = collectDates(3).filter(x => !(x.e === '🎂' && x.d.setHours(0, 0, 0, 0) === днес0.getTime()))[0];
    if (next) {
      const chips = inner.querySelector('.td-chips');
      if (chips && !chips.querySelector('.td-ev')) {
        // 🔴 11.08 (обиколка „начален екран и чат“): БЛИЗНАКЪТ на поправката от
        //    collectDates. Там просроченото се подрежда с d:now, а истинската
        //    дата се пази в `реална` — списъкът и листът за хладилника вече я
        //    показват. ТУК не: чипът вземаше next.d и рязаше текста на 34 знака.
        //    Измерено наживо при бебе, родено 02.04.2026: „💉 Хепатит Б (1-ви
        //    прием) + БЦЖ — отб · 11.08.2026 г.“ — тоест въпросът „отбелязана ли
        //    е?“ е отрязан до „отб“, а датата на чипа казва ДНЕС за ваксина от
        //    родилното. Мама чете: „днес ѝ е Хепатит Б“. Показваме истинската
        //    дата и питаме цялото изречение, без опашката в скобите.
        const _д = next.реална || next.d;
        const _т = next.минала ? String(next.t).split(' (по календара')[0] : String(next.t).slice(0, 34);
        const b = el('button', 'td-chip td-accent td-ev', `${next.e} ${_т} · ${_д.toLocaleDateString('bg-BG')}`);
        b.addEventListener('click', () => { if (window.MamaHelper) MamaHelper.open('Инструменти'); });
        chips.appendChild(b);
      }
    }
    // 📖 неделен дайджест: 3-те топ статии за възрастта (веднъж седмично)
    if (new Date().getDay() === 0 && load('bl_digest_w', '') !== today() && window.BL_LIB && BL_LIB.count()) {
      const baby = getBaby();
      const a = baby.birth && window.BL_AGE ? BL_AGE(baby.birth) : null;
      const q = a ? (a.months < 4 ? 'новородено сън плач' : a.months < 9 ? 'захранване сън зъби' : 'прохождане говор хранене') : 'бременност подготовка';
      const hits = BL_LIB.search(q, a ? 'Моето бебе' : 'Бременност', 3);
      if (hits.length) {
        const dg = el('div', 'td-digest', '<strong>📖 Неделно четиво за вас:</strong> ');
        hits.forEach(h => {
          const b = el('button', 'td-chip', h.e + ' ' + h.t.slice(0, 30) + '…'); b.type = 'button';
          b.addEventListener('click', () => { if (window.BL_ARTICLES) BL_ARTICLES.open(h.id); });
          dg.appendChild(b);
        });
        inner.appendChild(dg);
        save('bl_digest_w', ''); // показва се цялата неделя; маркираме при затваряне на деня
      }
    }
  }

  // ═══════════ 🌙 нощен режим на кърмене-таймера ═══════════
  function nightNursing(root) {
    const disp = root.querySelector('.nr-disp');
    if (!disp) return;
    const cardEl = disp.closest('.jr-card');
    const t = cardEl && cardEl.querySelector('.jr-title');
    if (!t || t.querySelector('.nr-night')) return;
    const b = el('button', 'nr-night', '🌙'); b.type = 'button'; b.title = 'Нощен режим — тъмно и едро';
    // ♿ 11.08: title е само подсказка с мишка. Името на бутона е съдържанието
    //    му („🌙") — четецът казваше „полумесец, бутон".
    b.setAttribute('aria-label', 'Нощен режим — тъмно и едро');
    b.addEventListener('click', (e) => { e.stopPropagation(); cardEl.classList.toggle('nr-dark'); });
    t.appendChild(b);
  }

  // ═══════════ регистрация ═══════════
  // 04.08: карта, пазена от паузата след загуба, връща null —
  // appendChild(null) гърми и събаря цялата стая. Затова минава оттук.
  const сложи = (r, к) => { if (к) r.appendChild(к); };
  const PACKS5 = {
    'Инструменти': r => сложи(r, calendarCard()),
    // 'Бременност' няма ред: единствената ѝ карта тук беше мъртва (виж 🪦 горе).
    'Здраве и SOS': r => сложи(r, episodeCard()),
    'Захранване': r => сложи(r, shopListCard()),
    'Дневник на мама': r => сложи(r, monthLetterCard()),
    'Моето бебе': r => nightNursing(r),
    'Развитие и игри': r => {} // играта живее на Днес
  };
  Object.keys(PACKS5).forEach(room => {
    const base = window.ROOM_FEATURES && window.ROOM_FEATURES[room];
    if (base) window.ROOM_FEATURES[room] = root => { base(root); PACKS5[room](root); };
  });
  // сподели-бутони върху готовите красоти (след строеж на стаята)
  const baseDev2 = window.ROOM_FEATURES['Моето бебе'];
  window.ROOM_FEATURES['Моето бебе'] = root => {
    baseDev2(root);
    const rc = [...root.querySelectorAll('.jr-card')].find(x => /Рекордите/.test(x.textContent));
    if (rc && !rc.querySelector('.jr-chip')) rc.appendChild(shareBtn('Рекордите на нашето бебе 🏆', () => {
      const r = rc.querySelector('.rc-row'); return r ? r.textContent.slice(0, 60) : 'Малките победи са големите 💜';
    }));
  };
  const prevBind = window.BL_TODAY_BIND;
  window.BL_TODAY_BIND = function (container, baby, a) {
    if (prevBind) prevBind(container, baby, a);
    mountToday(container);
  };

  window.BL_CAL = { collectDates };
})();
