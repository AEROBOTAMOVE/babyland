// ═══════════════════════════════════════════════════════════
// 📖 ГОДИШНИКЪТ — флагманът пораства (план 19, част 12.8)
//
// ☑️ 12.8.3  Мама избира КОИ страници влизат
// 💌 12.8.4  Посвещението — мама пише първата страница
// ⬇️ 12.8.5  Запази като PDF — истински файл през системния прозорец
// 🎂 12.8.6  „Годишникът на 1-вата година“ — специалният
// 🔔 12.8.7  Напомняне около рождения ден: „готов е“
//
// ⛔ 12.8.1, 12.8.2 — ГОТОВИ в yearbook.js. Не ги пипам.
//
// Обвивам BL_YEARBOOK.build (пост-обработка на страниците) и добавям
// управлението в СЪЩАТА карта в Дневника. ЗАРЕЖДА СЕ СЛЕД yearbook.js
// и СЛЕД badges2.js (той също обвива build — редът пази и неговата страница).
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';
  if (!window.BL_YEARBOOK) return;

  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const бебе = () => load('bl_baby', {});

  // страниците, които мама може да включва/изключва — по ЗАГЛАВИЕТО им
  const СТРАНИЦИ = [
    ['📸', 'Как порасна'], ['🌟', 'Първите пъти'], ['🌟 л', 'Лексиконът'],
    ['🔢', 'Числата на любовта'], ['✍️', 'Редовете на мама'],
    ['🌸', 'Годината на ЖЕНАТА'], ['🔬', 'Какво открих за теб'], ['🏅', 'Малките победи']
  ];
  const ИЗБОР = 'bl_yb_pages';

  // ═══════════ обвивката на build ═══════════
  const оригКнига = BL_YEARBOOK.build;
  BL_YEARBOOK.build = function (реж) {
    let html = оригКнига.call(this);
    const кутия = document.createElement('div');
    кутия.innerHTML = html;

    // 12.8.3: махни страниците, които мама е изключила
    const изкл = load(ИЗБОР, {});
    кутия.querySelectorAll('.yb-page').forEach(с => {
      const з = с.querySelector('h2');
      if (!з) return;
      const име = СТРАНИЦИ.find(([, и]) => з.textContent.includes(и));
      if (име && изкл[име[1]]) с.remove();
    });

    // 12.8.4: посвещението — веднага след корицата, с почерка на мама
    const текст = (load('bl_yb_dedic', '') || '').trim();
    if (текст) {
      const кор = кутия.querySelector('.yb-cover');
      const стр = document.createElement('div');
      стр.className = 'yb-page yb-dedic';
      стр.innerHTML = `<p class="yb-dedic-t">${esc(текст).replace(/\n/g, '<br>')}</p><p class="yb-dedic-s">— мама 💜</p>`;
      if (кор && кор.parentNode) кор.insertAdjacentElement('afterend', стр);
      else кутия.prepend(стр);
    }

    // 12.8.6: специалният режим „първата година“ — реже всичко след
    // първия рожден ден и преименува корицата
    if (реж === 'year1' && бебе().birth) {
      const първиРД = window.BL_DATE ? BL_DATE.addMonths(бебе().birth, 12) : new Date(new Date(бебе().birth).setMonth(new Date(бебе().birth).getMonth() + 12));
      // снимките: подписът „N мес.“ казва месеца
      кутия.querySelectorAll('.yb-photogrid figure').forEach(f => {
        const п = f.querySelector('figcaption');
        const м = п && п.textContent.match(/^(\d+) мес\./);
        if (м && +м[1] > 12) f.remove();
        const дн = п && п.textContent.match(/^(\d{1,2})\.(\d{1,2})$/);
        if (дн) f.remove();                       // дневните снимки нямат година — вън от специалния
      });
      // редове с дата дд.мм.гггг — първите пъти и редовете на мама
      кутия.querySelectorAll('.pr-list li, .yb-line').forEach(р => {
        const м = р.textContent.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
        if (м && new Date(+м[3], +м[2] - 1, +м[1]) > първиРД) р.remove();
      });
      const заглавие = кутия.querySelector('.yb-cover .yb-sub');
      if (заглавие) заглавие.textContent = 'Книгата на ПЪРВАТА година 🎂';
    }
    return кутия.innerHTML;
  };

  // ═══════════ управлението — в картата на годишника ═══════════
  function намериКарта(root) {
    return [...root.querySelectorAll('.jr-card')].find(c => {
      const t = c.querySelector('.jr-title');
      return t && t.textContent.includes('Годишникът');
    });
  }
  function надградиКарта(карта) {
    if (!карта || карта.querySelector('.yb2-box')) return;
    const кутия = el('div', 'yb2-box');

    // 12.8.4: посвещението
    const п = el('textarea', 'jr-paper yb2-dedic');
    п.rows = 2; п.maxLength = 400;
    п.placeholder = '💌 Посвещение за първата страница… (по желание — „За теб, който ни направи трима“)';
    п.value = load('bl_yb_dedic', '');
    п.addEventListener('input', () => save('bl_yb_dedic', п.value.slice(0, 400)));
    кутия.appendChild(п);

    // 12.8.3: изборът на страници
    const ред = el('div', 'jr-quick yb2-pages');
    const изкл = () => load(ИЗБОР, {});
    СТРАНИЦИ.forEach(([, име]) => {
      const b = el('button', 'jr-chip' + (изкл()[име] ? '' : ' on'), име);
      b.type = 'button';
      b.addEventListener('click', () => {
        const и = изкл(); и[име] = !и[име]; save(ИЗБОР, и);
        b.classList.toggle('on', !и[име]);
      });
      ред.appendChild(b);
    });
    кутия.appendChild(el('p', 'cs-note', 'Кои страници да влязат в книгата — светналите са вътре:'));
    кутия.appendChild(ред);

    // 12.8.6: специалният — щом бебето наближи/мине годинка
    const б = бебе();
    if (б.birth) {
      const месеци = (Date.now() - new Date(б.birth)) / (30.4375 * 86400000);
      if (месеци >= 11) {
        const сп = el('button', 'jr-btn yb2-year1', '🎂 Годишникът на ПЪРВАТА година');
        сп.type = 'button';
        сп.addEventListener('click', () => {
          if (window.BL_EXPR) BL_EXPR.printOverlay('', BL_YEARBOOK.build('year1'), { cls: 'yb-book' });
        });
        кутия.appendChild(сп);
      }
    }

    // 12.8.5: истинският файл — системният прозорец умее „Запази като PDF“
    const pdf = el('button', 'jr-chip yb2-pdf', '⬇️ Запази като PDF');
    pdf.type = 'button';
    pdf.addEventListener('click', () => {
      if (window.BL_EXPR) BL_EXPR.printOverlay('', BL_YEARBOOK.build(), { cls: 'yb-book' });
      if (window.BL_FX) BL_FX.cheer('В прозореца за печат избери „Запази като PDF“ — и книгата е файл. 📄');
    });
    кутия.appendChild(pdf);
    карта.appendChild(кутия);
  }
  const базаДневник = window.ROOM_FEATURES && window.ROOM_FEATURES['Дневник на мама'];
  if (базаДневник) window.ROOM_FEATURES['Дневник на мама'] = root => {
    базаДневник(root);
    надградиКарта(намериКарта(root));
  };

  // ═══════════ 🔔 12.8.7 НАПОМНЯНЕТО ═══════════
  // Седмица преди рожден ден (1/2/3 г.) — един ред на „Днес“, веднъж годишно.
  const предиШни = window.BL_TODAY_EXTRAS;
  window.BL_TODAY_EXTRAS = function (baby, a) {
    let html = предиШни ? предиШни(baby, a) : '';
    if (baby && baby.birth) {
      const сега = new Date();
      for (let г = 1; г <= 3; г++) {
        const рд = window.BL_DATE ? BL_DATE.addMonths(baby.birth, г * 12) : null;
        if (!рд) break;
        const дни = Math.ceil((рд - сега) / 86400000);
        if (дни >= 0 && дни <= 7 && load('bl_yb_remind', '') !== String(г)) {
          save('bl_yb_remind', String(г));
          html += `<div class="td-yb">📔 ${дни === 0 ? 'Днес е големият ден' : 'След ' + дни + ' ' + (дни === 1 ? 'ден' : 'дни') + ' е големият ден'} — годишникът е готов и чака в Дневника. 🎂</div>`;
          break;
        }
      }
    }
    return html;
  };

  window.BL_YEARBOOK2 = { СТРАНИЦИ };
})();
