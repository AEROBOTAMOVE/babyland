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

  function покажи(b) {
    опашка.push(b);
    ако();
  }
  function ако() {
    if (върви || !опашка.length) return;
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
    requestAnimationFrame(() => слой.classList.add('on'));
    fx().chime();
    setTimeout(() => fx().confetti(слой.querySelector('.md-box')), 380);

    const затвори = () => {
      слой.classList.remove('on');
      setTimeout(() => { слой.remove(); върви = false; ако(); }, 260);
    };
    слой.querySelector('.md-ok').addEventListener('click', затвори);
    слой.addEventListener('click', e => { if (e.target === слой) затвори(); });
    document.addEventListener('keydown', function esc2(e) {
      if (e.key === 'Escape') { затвори(); document.removeEventListener('keydown', esc2); }
    });
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
    нови.forEach(покажи);
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
    const наблюдавай = new MutationObserver(() => {
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
