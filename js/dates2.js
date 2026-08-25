// ═══════════════════════════════════════════════════════════
// 📅 ДАТИТЕ С ДУША (план 19, част 16.3)
//
// 🐸 16.3.2  29 февруари — високосното бебе си има карта
// 🌙 16.3.3  Полунощ не „нулира“ рязко — до 5:00 нощта е на вчерашния ден
// ✈️ 16.3.4  Друга часова зона → тихо „в друга държава ли си?“
//
// ⛔ 16.3.1 (месечнина в къс месец) — ПОПРАВЕНО в rooms2.js: банерът
//    вече идва от BL_DATE.addMonths и си казва „защото месецът е къс“.
//
// ЗАРЕЖДА СЕ СЛЕД rooms2.js.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

  // ═══════════ 🐸 16.3.2 ВИСОКОСНОТО БЕБЕ ═══════════
  // Родено на 29 февруари → веднъж, с обич: празнуваме на 28-и.
  function високосно(baby) {
    if (!baby || !baby.birth) return '';
    // 🕛 19.08 (ИЗМЕРЕНО, dev/vremeto.js --zona=America/Los_Angeles): „2024-02-29“
    //   се четеше като полунощ по ГРИНУИЧ — а това за майка западно от Гринуич
    //   е 28 февруари. Тоест точно високосното бебе, заради което съществува
    //   тази карта, НИКОГА не я виждаше. Датата се свежда до локална полунощ,
    //   както прави денНула в rooms2.js. ПЪТ НАЗАД: `new Date(baby.birth)`.
    const м = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(baby.birth));
    const b = м ? new Date(+м[1], +м[2] - 1, +м[3]) : new Date(baby.birth);
    if (isNaN(b) || b.getMonth() !== 1 || b.getDate() !== 29) return '';
    if (load('bl_leap_seen', false)) return '';
    save('bl_leap_seen', true);
    return `<div class="td-leap">🐸 ${esc(baby.name || 'Бебето')} е родено на <strong>29 февруари</strong> —
      ден, който идва веднъж на 4 години! Не се тревожи: месечнините и рождените дни
      празнуваме на 28-и, а на всяка високосна — ДВОЙНО. 🎈</div>`;
  }

  // ═══════════ 🌙 16.3.3 ПОЛУНОЩТА НЕ РЕЖЕ ═══════════
  // В 00:40 мама не е „пропуснала“ вчерашния ден — тя още го живее.
  // До 5:00 разходката и брифът го казват, вместо да нулират мълчаливо.
  function нощнаДума(container) {
    const ч = new Date().getHours();
    if (ч >= 5) return;
    const inner = container.querySelector('.td-inner');
    if (!inner || inner.classList.contains('td-welcome') || inner.querySelector('.td-midnight')) return;
    const вчера = new Date(); вчера.setDate(вчера.getDate() - 1);
    const кл = вчера.getFullYear() + '-' + String(вчера.getMonth() + 1).padStart(2, '0') + '-' + String(вчера.getDate()).padStart(2, '0');
    const имашеВчера = (load('bl_walk_days', {}) || {})[кл];
    if (!имашеВчера) return;
    inner.appendChild(el('p', 'td-midnight',
      '🌙 Още е нощта на вчерашния ден — той беше пълен, нищо не се е занулило. Новият почва, когато се събудиш.'));
  }

  // ═══════════ ✈️ 16.3.4 ДРУГАТА ЧАСОВА ЗОНА ═══════════
  const ЗОНА = 'bl_tz';
  function зона() {
    const сег = new Date().getTimezoneOffset();
    const стар = load(ЗОНА, null);
    save(ЗОНА, сег);
    if (стар === null || стар === сег) return;
    if (Math.abs(стар - сег) < 90) return;                       // лятното часово ≠ пътуване
    if (document.getElementById('dzTz')) return;
    const л = el('div', 'bo-bar'); л.id = 'dzTz';
    л.innerHTML = `<span class="bo-t">✈️ Часовникът ти се е преместил — в друга държава ли сте?
      Дните тук вървят по телефона ти, така че всичко ще си е наред. Приятно пътуване! 💜</span>
      <button class="bo-no" type="button" aria-label="Затвори">✕</button>`;
    document.body.appendChild(л);
    requestAnimationFrame(() => л.classList.add('on'));
    л.querySelector('.bo-no').addEventListener('click', () => { л.classList.remove('on'); setTimeout(() => л.remove(), 240); });
    setTimeout(() => { const x = document.getElementById('dzTz'); if (x) { x.classList.remove('on'); setTimeout(() => x.remove(), 240); } }, 16000);
  }

  // ═══════════ свързване ═══════════
  const предниДобавки = window.BL_TODAY_EXTRAS;
  window.BL_TODAY_EXTRAS = function (baby, a) {
    let html = предниДобавки ? предниДобавки(baby, a) : '';
    html += високосно(baby);
    return html;
  };
  const предноЗакачане = window.BL_TODAY_BIND;
  window.BL_TODAY_BIND = function (container, baby, a) {
    if (предноЗакачане) предноЗакачане(container, baby, a);
    нощнаДума(container);
  };
  document.addEventListener('DOMContentLoaded', () => setTimeout(зона, 2000));
})();
