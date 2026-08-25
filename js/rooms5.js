// ═══════════════════════════════════════════════════════════
// ROOMS 5 — ДОИЗКУСУРЯВАНЕТО (план 15, Д2–Д5)
// 📅 календарен център • ⚠️ пелена-пазач • 💌 месечно писмо •
// 🤒 болничен епизод • 🛒 списък за пазар • 🎲 днешната игра •
// 📖 дайджест • 🌙 нощен таймер • 📤 сподели-бутони
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
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return безДупки(v); } catch (e) { return d; } };
  // 🔴🔴 25.08: тук уловката беше НАПЪЛНО празна И БЕЗ върната стойност — тоест
  //   „Писмо за месеца“ нямаше как да разбере, че не се е запечатало, и триеше
  //   картата с текста на мама. Сега връща истина/лъжа и казва на мама.
  //   ПЪТ НАЗАД: `catch (e) {}` без връщане, както беше.
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { if (window.BL_ZAPIS_PADNA) BL_ZAPIS_PADNA(); return false; } return true; };
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
    // 📏 11.08 (измерено): „+“ е 38×44 — под прага по ширина. Расте целта.
    add.style.minWidth = '44px'; add.style.flexShrink = '0';
    addRow.appendChild(inp); addRow.appendChild(dt); addRow.appendChild(add);
    // 🔴🔴 11.08 (ИЗМЕРЕНО наживо, три отделни дефекта под един бутон „+“):
    //    1) празно поле → `return` без нито един пиксел промяна. Мълчалив бутон.
    //    2) дата СЛЕД 30 дни („кръщене на 15 октомври“) се ЗАПИСВАШЕ, полетата
    //       се изчистваха и редът НЕ се появяваше никъде — списъкът гледа само
    //       30 дни напред. Мама вижда празно и решава, че не се е записало.
    //    3) минала дата (сбъркана година) също се записваше НЕВИДИМО — оставаше
    //       завинаги в bl_events (оттам я чете и чатът в helper.js), без начин
    //       да бъде изтрита от екрана, защото никога не се рисува.
    //    ЛЕК: всяко натискане казва какво стана; минала дата не се приема;
    //    далечната се приема, но честно се обявява кога ще се покаже.
    //    ПЪТ НАЗАД: върни горните 2 реда (`if (!v || !dt.value) return;`).
    const хинт = el('p', 'jr-privacy', '');
    const кажи = (текст, поле) => {
      хинт.textContent = текст;
      if (поле) { try { поле.focus({ preventScroll: false }); } catch (e) { try { поле.focus(); } catch (e2) {} } }
      fx().buzz(6);
    };
    const добави = () => {
      const v = inp.value.trim();
      if (!v) { кажи(dt.value ? 'Само датата не стига — напиши и какво предстои. 📌' : 'Какво предстои? Напр. „Преглед при педиатъра“.', inp); return; }
      if (!dt.value) { кажи('Избери и дата — иначе няма кога да ти го напомня. 📅', dt); return; }
      const д = new Date(dt.value + 'T12:00:00');
      if (isNaN(д.getTime())) { кажи('Тази дата не я разчитам — избери я от календарчето. 📅', dt); return; }
      const днес0 = new Date(); днес0.setHours(0, 0, 0, 0);
      const дни = Math.round((new Date(dt.value + 'T00:00:00').getTime() - днес0.getTime()) / 86400000);
      if (дни < 0) { кажи('Тази дата вече е минала, а тук е за предстоящото. Провери годината. 📅', dt); return; }
      const ev = load('bl_events', []);
      ev.push({ id: 'e' + Date.now(), t: v, d: dt.value, e: /преглед|лекар|педиат/i.test(v) ? '🩺' : '📌' });
      // 🔴 25.08: „✔ Записах: …“ + изчистени полета дори при паднал запис.
      //    Точно тази карта е за прегледи — пропуснат преглед не се наваксва.
      if (!save('bl_events', ev)) return;
      const кога = д.toLocaleDateString('bg-BG');
      // датата на bg-BG вече свършва с „г.“ — втора точка след нея е „г..“
      хинт.textContent = дни > 30
        ? '✔ Записах: „' + v + '“ · ' + кога + ' — списъкът показва 30 дни напред, ще се появи, щом наближи.'
        : '✔ Записах: „' + v + '“ · ' + кога;
      inp.value = ''; dt.value = ''; fx().buzz(10); draw();
    };
    add.addEventListener('click', добави);
    // на телефон „Enter“ на клавиатурата е най-краткият път — не го хаби
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); добави(); } });
    function draw() {
      const items = collectDates(30);
      list.innerHTML = items.length ? '' : '<p class="jr-privacy">Следващите 30 дни са чисти. Добави преглед или събитие отдолу. 📅</p>';
      items.forEach(x => {
        const dd = Math.round((x.d - new Date().setHours(0, 0, 0, 0)) / 86400000);
        const дата = x.реална || x.d;
        const when = x.минала ? 'по календара' : dd === 0 ? 'ДНЕС' : dd === 1 ? 'утре' : 'след ' + dd + ' дни';
        // 🟠 11.08 (ЖЕСТОКОТО): думите на минал ред казват „отбелязана ли е?“,
        //    а класът казваше друго. Миналите редове носят d:now САМО за да
        //    се подредят най-отгоре — оттам dd===0 и всичките получаваха
        //    „soon“ (оранжев фон + контур = тревога). При бебе на 8 месеца,
        //    чиято майка не е пипала календара, това са ПЕТ тревожни реда за
        //    неща, които тя най-вероятно е направила, и НУЛА за истински
        //    предстоящото под тях. Цветът обвиняваше там, където текстът пита.
        const row = el('div', 'ev-row' + (!x.минала && dd <= 3 ? ' soon' : ''));
        row.innerHTML = `<span class="ev-e">${x.e}</span><span class="ev-t">${esc(x.t)}<small>${дата.toLocaleDateString('bg-BG')} · ${when}</small></span>` +
          (x.own ? '<button class="nt-del" type="button" aria-label="Изтрий">🗑</button>' : '');
        // 🔁 11.08 (правило 3 — пътят назад ПРЕДИ действието): 🗑 триеше
        //    събитието на едно докосване, без питане и без връщане. Мама с бебе
        //    на ръка бута съседния ред и прегледът изчезва. Не питаме (питането
        //    на всяко триене уморява) — даваме връщане.
        // 📏 11.08 (измерено): 🗑 е 40×44 — touch.css нарочно го прави 40, но
        //    при бебе на ръка съседът му е ЦЕЛИЯТ ред на събитието.
        if (x.own) row.querySelector('.nt-del').style.minWidth = '44px';
        if (x.own) row.querySelector('.nt-del').addEventListener('click', () => {
          const текущи = load('bl_events', []);
          const махнато = текущи.filter(e2 => e2.id === x.id)[0];
          save('bl_events', текущи.filter(e2 => e2.id !== x.id)); draw(); fx().buzz(8);
          хинт.textContent = '';
          if (!махнато) { хинт.textContent = 'Махнах реда.'; return; }
          хинт.textContent = 'Махнах „' + (махнато.t || 'събитието') + '“. ';
          const върни = el('button', 'jr-chip', '↩️ Върни го'); върни.type = 'button';
          върни.style.minHeight = '44px';
          върни.addEventListener('click', () => {
            const сега = load('bl_events', []);
            if (!сега.some(e2 => e2.id === махнато.id)) сега.push(махнато);
            save('bl_events', сега); draw(); fx().buzz(8);
            хинт.textContent = 'Върнах го. 💜';
          });
          хинт.appendChild(върни);
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
    c.appendChild(list); c.appendChild(addRow); c.appendChild(хинт); c.appendChild(pr);
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

  function episodeCard(root) {
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
    // 🔴🔴 11.08 (известният клас 8, ИЗМЕРЕНО наживо): записах 38.4° в
    //    „Температурен дневник“ — ДВЕ КАРТИ ПО-ГОРЕ в същата стая — а тази
    //    продължи да пише „Дано остане празно!“. Тоест картата, чиято ЕДИНСТВЕНА
    //    работа е да събере линията за лекаря, твърдеше, че няма нищо, точно
    //    когато има. Оправяше се чак след презареждане на приложението.
    //    ЛЕК: след всяко докосване в стаята линията се чете НАНОВО от паметта.
    //    ПЪТ НАЗАД: махни слушателя и BL_EPISODE_REDRAW — картата пак ще застива.
    window.BL_EPISODE_REDRAW = draw;
    if (root && root.addEventListener) {
      root.addEventListener('click', () => setTimeout(draw, 80));
    }
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
      // 🔴 11.08 (известният клас 6): `letters` беше прочетено при РИСУВАНЕТО и
      //    се записваше отгоре при натискането — всяко писмо, запечатано
      //    междувременно другаде, се губеше тихо. Четем прясно ВЪТРЕ.
      re.addEventListener('click', () => {
        const прясно = load('bl_month_letters', {});
        delete прясно[key]; save('bl_month_letters', прясно); c.replaceWith(monthLetterCard());
      });
      c.appendChild(re);
      return c;
    }
    // предпопълване от Реката: миговете на този месец (събрани по-горе)
    const seed = мигове.length ? 'Този месец: ' + мигове.map(m => m.txt).join(' · ') + '.\n\n' : '';
    const ta = el('textarea', 'jr-paper'); ta.rows = 5;
    // 🔴 25.08: писмото за месеца е петредово поле БЕЗ чернова — най-дългият
    //    текст в стаята изчезваше при излизане. Черновата бие предпопълването:
    //    щом мама вече е писала, връщаме нейното, не нашия шаблон.
    //    ПЪТ НАЗАД: махаш `ta.dataset.draft` и оставяш само реда със `seed`.
    ta.dataset.draft = 'bl_draft_monthletter';
    const чернова = load('bl_draft_monthletter', '');
    ta.value = чернова || (seed ? seed + 'Мило мое, ' : '');
    ta.placeholder = 'Мило мое… (какво искаш да помниш от този месец?)';
    const btn = el('button', 'jr-btn', 'Запечатай писмото 💌'); btn.type = 'button';
    const хинт = el('p', 'jr-privacy', '');
    btn.addEventListener('click', () => {
      const v = ta.value.trim();
      // 🔇 11.08 (ИЗМЕРЕНО): празно поле → бутонът мълчеше напълно. Мама
      //    натиска, нищо не става, тя не знае дали е записано или е счупено.
      if (!v) {
        хинт.textContent = 'Полето е празно — напиши поне един ред и тогава го запечатваме. 💌';
        try { ta.focus(); } catch (e) {}
        fx().buzz(6);
        return;
      }
      // известният клас 6: прясно от паметта ВЪТРЕ в слушателя, не копие отпреди
      const letters2 = load('bl_month_letters', {});
      letters2[key] = { t: v, ts: Date.now() };
      // 🔴🔴 25.08 (ИЗМЕРЕНО с пълна памет): картата се пресъздаваше и се
      //    празнуваше „Писмото за месеца е запечатано 💌“ ДОРИ когато записът е
      //    паднал — а пресъздадената карта е с празно поле. Целият месец, написан
      //    от мама, изчезваше в мига, в който ѝ казахме, че е запазен.
      //    ПЪТ НАЗАД: махаш `if (!…) return;` и връщаш голото save.
      if (!save('bl_month_letters', letters2)) return;
      save('bl_draft_monthletter', '');
      // 🔴 г09/283: пишеше „в съкровищницата“, а правилата на journal.js пращат
      //    „писмо за месеца“ в „✍️ Пиши и помни“. Не наричаме секция, в която го няма.
      fx().confetti(btn); fx().cheer('Писмото за месеца е запечатано 💌');
      c.replaceWith(monthLetterCard());
    });
    c.appendChild(ta); c.appendChild(btn); c.appendChild(хинт);
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
    // 🔴 11.08 (ИЗМЕРЕНО 1 → 3): BL_TODAY_BIND минава ВТОРИ и ТРЕТИ път върху
    //    същия контейнер (веригата prevBind се вика от десетина модула — daily.js
    //    вече е поправен по същия начин на ред 351). Съседите тук се пазят
    //    (`!inner.querySelector('.td-game')`), пазачът — не: и мама виждаше ТРИ
    //    еднакви червени предупреждения за суха пелена. Три пъти един и същ
    //    страх на един екран. Махаме стария, преди да сложим новия — така
    //    редът и ИЗЧЕЗВА, щом тя отметне мокра пелена.
    //    ПЪТ НАЗАД: изтрий реда със `.td-guard` remove.
    const старПазач = inner.querySelector('.td-guard');
    if (старПазач) старПазач.remove();
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
        b.type = 'button';
        // 🟠 11.08 (правило 16 — обещаната функция трябва да се СТИГА): текстът на
        //    чипа за ваксина завършва с „докосни я в имунизационния календар“, а
        //    докосването отваряше „Инструменти“. Имунизационният календар живее в
        //    „Здраве и SOS“. Мама стига в грешната стая и търси.
        const стая = next.e === '💉' ? 'Здраве и SOS' : 'Инструменти';
        b.addEventListener('click', () => { if (window.MamaHelper) MamaHelper.open(стая); });
        chips.appendChild(b);
      }
    }
    // 📖 неделен дайджест: 3-те топ статии за възрастта (веднъж седмично)
    // 🔴 25.08 (ИЗМЕРЕНО: 3 копия след 3 обвързвания, dev/interaktivno_stai.js):
    //    БЛИЗНАКЪТ на поправката за пелена-пазача двайсет реда по-горе. Съседите
    //    си имат пазач (`!inner.querySelector('.td-game')`), дайджестът — не.
    //    BL_TODAY_BIND минава втори и трети път върху същия контейнер (веригата
    //    prevBind се вика от десетина модула), и в неделя мама виждаше ТРИ
    //    еднакви реда „📖 Неделно четиво за вас“ един под друг.
    //    ⚠️ И вторият капан: `save('bl_digest_w', '')` по-долу пишеше ПРАЗЕН низ,
    //    а условието сравнява с today() — тоест маркировката не се случваше
    //    никога и ключът стоеше празен завинаги. Махнат е: дайджестът и без това
    //    е замислен да се вижда цялата неделя, а пазачът горе стига.
    //    ПЪТ НАЗАД: махаш `!inner.querySelector('.td-digest') &&` от реда долу.
    if (new Date().getDay() === 0 && !inner.querySelector('.td-digest') && window.BL_LIB && BL_LIB.count()) {
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
    'Здраве и SOS': r => сложи(r, episodeCard(r)),
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
