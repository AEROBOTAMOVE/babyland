// ═══════════════════════════════════════════════════════════
// НОЩТА (план 19, част 12.11) — отделно от „тъмната тема“
//
// 12.11.1  След 23ч: по-едри цели, по-малко текст
// 12.11.2  Нощна палитра без синьо (синьото буди)
// 12.11.6  ⛔ Никакви конфети в 3 сутринта
// 12.11.7  „Знам, че е 3“ — да го признае
//
// Тъмната тема е избор. Нощта е СЪСТОЯНИЕ. Мама в 3 сутринта държи телефона
// с една ръка, окото ѝ е свикнало с тъмното, а другата ръка е под бебето.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  const нощ = () => { const h = new Date().getHours(); return h >= 23 || h < 6; };

  // ── 12.11.1 + 12.11.2: класът, който отваря нощния вид ──
  function приложи() {
    const е = нощ() && load('bl_night_off', 0) !== 1;
    document.documentElement.classList.toggle('bl-night', е);
    return е;
  }

  // ── 12.11.6: конфетите млъкват ──
  // fx.js ги пуска на много места. Вместо да гоня всяко — обвивам самия fx.
  function заглушиПразника() {
    if (!window.BL_FX || window.BL_FX.__нощно) return;
    const истински = { confetti: BL_FX.confetti, cheer: BL_FX.cheer, buzz: BL_FX.buzz, pop: BL_FX.pop };
    BL_FX.confetti = function () {
      if (нощ()) return;                       // в 3 сутринта конфети е гавра
      return истински.confetti && истински.confetti.apply(BL_FX, arguments);
    };
    BL_FX.cheer = function () {
      if (нощ()) return;
      return истински.cheer && истински.cheer.apply(BL_FX, arguments);
    };
    BL_FX.buzz = function (n) {
      // вибрацията остава, но кротка — тя е потвърждение, не празник
      return истински.buzz && истински.buzz.call(BL_FX, нощ() ? Math.min(6, n || 6) : n);
    };
    BL_FX.__нощно = true;
  }

  // ── 12.11.7: „знам, че е 3“ ──
  function признание() {
    if (!нощ()) return null;
    const h = new Date().getHours();
    // 23:00 НЕ е „след полунощ“ — това го хванах чак като изписах таблицата.
    const текст = h >= 23 ? 'Знам, че е късно. Тук съм.'
      : h < 2 ? 'След полунощ е. Няма да те питам защо си будна.'
      : h < 4 ? 'Три е. Най-дългият час. Ще мине и той.'
      : 'Скоро съмва. Издържа дотук.';
    return текст;
  }
  window.BL_NIGHT = { е: нощ, признание, приложи };

  // ── превключвател: „не искам нощен вид“ ──
  const prevSettings = window.BL_SETTINGS_CARD;
  if (prevSettings) {
    window.BL_SETTINGS_CARD = function () {
      const c = prevSettings();
      const grid = c.querySelector('.set-grid');
      if (grid) {
        const b = document.createElement('button');
        const вкл = () => load('bl_night_off', 0) !== 1;
        b.className = 'set-tgl' + (вкл() ? ' on' : '');
        b.type = 'button';
        b.innerHTML = '🌙 Нощен вид (23-6ч)<span class="set-dot"></span>';
        b.addEventListener('click', () => {
          save('bl_night_off', вкл() ? 1 : 0);
          b.classList.toggle('on', вкл());
          приложи();
        });
        grid.appendChild(b);
      }
      return c;
    };
  }

  приложи();
  заглушиПразника();
  setTimeout(заглушиПразника, 1200);        // ако fx.js се зареди след нас
  setInterval(приложи, 60000);              // 23:00 идва, докато приложението е отворено
})();
