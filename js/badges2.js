// ═══════════════════════════════════════════════════════════
// 🏅 МЕДАЛЬОНЧЕТАТА — надграждане (план 19, част 12.4)
//
// 🎉 12.4.3  Печеленето = истински момент, не тих брояч
// 🌑 12.4.6  Заключените се виждат като силует („има още нещо“)
// 📔 12.4.5  Годишникът ги показва
//
// ⛔ 12.4.1 (8→24) е ГОТОВО отдавна — рафтът е 40. Не пипам.
// ⛔ 12.4.2 (витрина) е ГОТОВО — profile.js рисува рафта.
// ✅ 12.4.4 (никакви серии, които се късат) — проверено, не е строено:
//    единствената серия е в профила и вече казва „Пропуснат ден не е
//    провал“ (profile.js:254). Тук само пазя правилото: НИТО едно
//    медальонче не се ОТНЕМА. Веднъж взето — завинаги.
//
// ЗАРЕЖДА СЕ СЛЕД extras.js (BL_BADGES) и СЛЕД yearbook.js.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';
  if (!window.BL_BADGES) return;

  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const fx = () => window.BL_FX || { confetti() {}, cheer() {}, chime() {}, buzz() {} };

  // ═══════════ 🎉 12.4.3 ИСТИНСКИЯТ МОМЕНТ ═══════════
  // Досега новото медальонче минаваше като тост — 3 секунди и край.
  // Мама не разбираше КАКВО е спечелила и защо. Сега спира екрана:
  // медальонът идва отгоре, казва за какво е, и мама го затваря сама.
  let опашка = [];
  let върви = false;
  // 🚨 15.09 (истински Chrome, cdp_b234.js — 4 от 4 спешни отговора): майка, чийто ПЪРВИ
  //   въпрос е спешен, печели медал „първи въпрос“ — и медальонът с конфети и звън застава
  //   ВЪРХУ бутона „📞 Обади се на 112“ (elementFromPoint в центъра му = .md-veil). Медалите
  //   мълчат 10 минути след всяка тревога; опашката изчаква — нищо не се губи, само се отлага.
  let тишинаДо = 0;
  try { document.addEventListener('bl:alarm', () => { тишинаДо = Date.now() + 10 * 60 * 1000; }); } catch (e) {}

  function покажи(b) {
    опашка.push(b);
    ако();
  }
  function ако() {
    if (върви || !опашка.length) return;
    // и след презареждане: времето на тревогата стои в склада (пише го shop.js при bl:alarm)
    let до = тишинаДо;
    try { const пазено = +(localStorage.getItem('bl_alarm_at') || 0); if (пазено) до = Math.max(до, пазено + 10 * 60 * 1000); } catch (e) {}
    if (Date.now() < до) { setTimeout(ако, до - Date.now() + 500); return; }
    // 21.10 · докато стои стартовият екран (#blSplash, index.html), медальончето чака — иначе излизаше
    //   (със звън и конфети) В СЪЩИЯ миг, в който облакът отлита (кадър film21c_f01). ПЪТ НАЗАД: махни реда.
    if (document.getElementById('blSplash')) { setTimeout(ако, 400); return; }
    върви = true;
    const b = опашка.shift();

    const слой = el('div', 'md-veil');
    слой.innerHTML =
      `<div class="md-box" role="dialog" aria-live="polite">
         <p class="md-kicker">Ново медальонче 🎉</p>
         <div class="md-coin"><span>${b.e}</span></div>
         <h3 class="md-name">${esc(b.n)}</h3>
         <p class="md-why">${esc(b.t)}</p>
         <p class="md-keep">Твое е завинаги. Не се губи, не се къса. 💜</p>
         <button class="jr-btn md-ok" type="button">Благодаря 💜</button>
       </div>`;
    document.body.appendChild(слой);
    // 🖐️ 15.11 (чат „екрани“) · ПЪРВИТЕ 450 ms ДОПИРЪТ НЕ Е ЗА МЕДАЛЬОНЧЕТО. То излиза само — след стартовия
    //   екран, след запис, а следващото от опашката 260 ms след „Благодаря“ — точно под пръста, който вече
    //   е тръгнал към друго (мерено: otklik_proba, тъмно — натискът по плочката на стая улучи .md-name;
    //   второ медальонче се затваряше с втория допир, без да е прочетено). Натиск в първите 450 ms се
    //   поглъща: медальончето остава, мама го затваря, когато го види. ПЪТ НАЗАД: махни двата реда с „роден“.
    const роден = performance.now();
    слой.addEventListener('click', e => { if (performance.now() - роден < 450) { e.stopPropagation(); e.preventDefault(); } }, true);
    requestAnimationFrame(() => слой.classList.add('on'));
    fx().chime();
    setTimeout(() => fx().confetti(слой.querySelector('.md-box')), 380);

    // ♿ 16.11 (мерено, potoci_proba + следене на history.*): медальончето излиза НАД отворена стая.
    //   Esc затваряше И него, И стаята (helper.js слуша същия Esc на document и вика close() →
    //   history.back()); следващото „Назад“ вече изкарваше от приложението (about:blank).
    //   Сега: слушаме в ЗАХВАТ (преди helper.js) и слагаме маркера __blСлойПоет — протоколът на
    //   приложението „този Esc е изяден от горния слой“ (articles.js, pl-igri.js, pl-hranene.js).
    //   Слушателят се маха при ВСЯКО затваряне — преди оставаше след „Благодаря“/фона и с маркера
    //   щеше да изяжда следващия Esc на стаята.
    //   ПЪТ НАЗАД: върни `document.addEventListener('keydown', function esc2(e) { if (e.key === 'Escape') { затвори(); document.removeEventListener('keydown', esc2); } });` и махни esc2 от затвори().
    let затворено = false;
    const затвори = () => {
      if (затворено) return; затворено = true;
      document.removeEventListener('keydown', esc2, true);
      if (window.BL_НАЗАД) BL_НАЗАД.затворен('медальонче');   // 📱 16.11
      слой.classList.remove('on');
      setTimeout(() => { слой.remove(); върви = false; ако(); }, 260);
    };
    function esc2(e) {
      if (e.key !== 'Escape') return;
      e.__blСлойПоет = true;
      затвори();
    }
    // 📱 16.11: телефонното „Назад“ затваря медальончето, не стаята под него (store.js, BL_НАЗАД). ПЪТ НАЗАД: махни реда и този в затвори().
    if (window.BL_НАЗАД) BL_НАЗАД.отвори('медальонче', затвори);
    слой.querySelector('.md-ok').addEventListener('click', затвори);
    слой.addEventListener('click', e => { if (e.target === слой) затвори(); });
    document.addEventListener('keydown', esc2, true);
  }

  // Обвивам sweep-а: той сам решава кое е ново, аз само сменям ПОКАЗВАНЕТО.
  // ⚠️ Оригиналът съобщава само за ПОСЛЕДНОТО ново (fresh се презаписва).
  //    Ако мама е била офлайн и се отключат три наведнъж, две изчезваха.
  //    Затова сравнявам ПРЕДИ и СЛЕД и показвам всяко.
  const оригМетене = BL_BADGES.sweep;
  const заглуши = () => { const c = window.BL_FX && BL_FX.cheer; if (c) BL_FX.cheer = () => {}; return c; };
  BL_BADGES.sweep = function () {
    const преди = load('bl_badges', {});
    const тихият = заглуши();                       // спирам стария тост
    const след = оригМетене.apply(this, arguments);
    if (тихият) window.BL_FX.cheer = тихият;
    const нови = (BL_BADGES.list || []).filter(b => след[b.id] && !преди[b.id]);
    // 25.11 (одит A-38): „Създаден профил“ (hello1) изскачаше със звън още при първото влизане — сега само тихо в профила.
    //   ПЪТ НАЗАД: `нови.forEach(покажи);`
    нови.filter(b => b.id !== 'hello1').forEach(покажи);
    return след;
  };

  // ═══════════ 🌑 12.4.6 СИЛУЕТИТЕ ═══════════
  // Заключеното показваше емоджито и името си — тоест нямаше какво да
  // откриеш. Сега е тъмен кръг с „?“, а името се чете. Мама вижда, че
  // ИМА още нещо, и разбира какво да направи — без да ѝ е показано.
  function силуети(корен) {
    корен.querySelectorAll('.prof-medal:not(.got), .bg-badge:not(.got)').forEach(m => {
      if (m.classList.contains('md-locked')) return;
      m.classList.add('md-locked');
      const e = m.querySelector('.prof-me, .bg-e');
      if (e) { e.dataset.real = e.textContent; e.textContent = '?'; }
    });
  }
  // Рафтовете се рисуват при отваряне на профила/стаята — гледам тялото.
  document.addEventListener('DOMContentLoaded', () => {
    let чака = 0;
    const наблюдавай = new MutationObserver((з) => {
      // ⚡ 15.11 (одит): силуетите се рисуват на нови рафтове (елементи), не при смяна на текст
      if (!з.some(r => { for (const н of r.addedNodes) if (н.nodeType === 1) return true; return false; })) return;
      if (чака) return;
      чака = requestAnimationFrame(() => { чака = 0; силуети(document.body); });
    });
    наблюдавай.observe(document.body, { childList: true, subtree: true });
    силуети(document.body);
  });

  // ═══════════ 📔 12.4.5 В ГОДИШНИКА ═══════════
  // Само ВЗЕТИТЕ. Книгата е за спомени, не за домашни — заключените
  // нямат работа тук.
  if (window.BL_YEARBOOK && BL_YEARBOOK.build) {
    const оригКнига = BL_YEARBOOK.build;
    BL_YEARBOOK.build = function () {
      let html = оригКнига.apply(this, arguments);
      // 🔴 19.08 (dev/broyachi.js): тук стоеше ВТОРО, собствено пресичане на
      //    паметта с каталога. Същата сметка живее и в extras.js (рафтът), и в
      //    profile.js („N от 40“) — три копия на едно число. Копие, което може
      //    да се размине, се разминава: измерено 2 срещу 1 при ид от друга
      //    версия. Питаме ЕДИНСТВЕНИЯ източник; резервата отдолу е дословно
      //    старият ред, за да не остане книгата празна, ако BL_BADGES е стар.
      //    ПЪТ НАЗАД: смени `BL_BADGES.мои ?` на `false ?` — остава дословно
      //    старата сметка, без нищо друго да се пипа.
      const взети = load('bl_badges', {});
      const мои = (BL_BADGES.мои ? BL_BADGES.мои()
                                 : (BL_BADGES.list || []).filter(b => взети[b.id]).map(b => ({ b: b, кога: взети[b.id] })))
                  .sort((x, y) => x.кога - y.кога);          // най-старото първо — книгата върви напред във времето
      if (!мои.length) return html;
      const дата = t => { try { return new Date(t).toLocaleDateString('bg-BG'); } catch (e) { return ''; } };
      const страница =
        `<div class="yb-page"><h2>🏅 Малките победи</h2>
           <p class="pr-note">${мои.length === 1 ? 'Едно медальонче' : мои.length + ' медальончета'} — всяко от тях е ден, в който си направила нещо за себе си или за него.</p>
           <div class="yb-medals">${мои.map(({ b, кога }) =>
             `<div class="yb-medal"><span class="yb-mde">${b.e}</span>
                <div><strong>${esc(b.n)}</strong><small>${esc(b.t)}</small>
                <em>${дата(кога)}</em></div></div>`).join('')}</div>
         </div>`;
      // застава ПРЕДИ последната страница, не след „Направено с обич“
      const край = html.lastIndexOf('<div class="yb-page yb-end">');
      return край > -1 ? html.slice(0, край) + страница + html.slice(край) : html + страница;
    };
  }

  window.BL_BADGES2 = { покажи, силуети };
})();
