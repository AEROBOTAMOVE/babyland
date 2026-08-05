// ═══════════════════════════════════════════════════════════
// FX — конфети, вибрация, малки празници (радост в дреболиите)
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';
  const COLORS = ['#f291bd', '#8fc0e8', '#f5d47e', '#9fd8c6', '#cbbcec', '#f7b98d'];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let layer = null;
  function ensureLayer() {
    if (layer) return layer;
    layer = document.createElement('div');
    layer.className = 'fx-layer';
    document.body.appendChild(layer);
    return layer;
  }

  // 🔗 инвентар: ГЛОБАЛНА политика „никога конфети върху тъга" — ако мама е
  // отбелязала днешния ден като тежък (чекин m<=1), не празнуваме шумно никъде.
  function тъженДен() {
    try {
      const ck = JSON.parse(localStorage.getItem('bl_checkins') || '{}');
      const c = ck[new Date().toLocaleDateString('sv-SE')];
      return !!(c && typeof c.m === 'number' && c.m <= 1);
    } catch (e) { return false; }
  }
  function confetti(origin, count) {
    if (reduce || тъженДен()) return;
    const L = ensureLayer();
    let cx = innerWidth / 2, cy = innerHeight / 2;
    if (origin && origin.getBoundingClientRect) {
      const r = origin.getBoundingClientRect();
      cx = r.left + r.width / 2; cy = r.top + r.height / 2;
    }
    const n = count || 26;
    const theme = window.BL_CONF_THEME; // конфети с характера на стаята (💜 сърца, ⭐ звезди…)
    for (let i = 0; i < n; i++) {
      const p = document.createElement('span');
      p.className = 'fx-conf';
      const ang = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 120;
      p.style.left = cx + 'px'; p.style.top = cy + 'px';
      p.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
      p.style.setProperty('--dy', (Math.sin(ang) * dist - 40) + 'px');
      p.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
      if (theme && theme.length && i % 3 === 0) {
        p.classList.add('fx-emoji');
        p.textContent = theme[i % theme.length];
      } else {
        p.style.background = COLORS[i % COLORS.length];
        if (Math.random() < 0.4) p.style.borderRadius = '50%';
      }
      p.style.animationDelay = (Math.random() * 0.1) + 's';
      L.appendChild(p);
      setTimeout(() => p.remove(), 1300);
    }
    buzz(20);
  }

  // 10.4.3: вибрацията е отделна от звука — мама може да иска само нея
  // (тиха, но осезаема) или пълна тишина. По подразбиране е включена.
  const vibrateOn = () => { try { return localStorage.getItem('bl_vibrate') !== '0'; } catch (e) { return true; } };
  function buzz(ms) {
    try { if (vibrateOn() && navigator.vibrate) navigator.vibrate(ms || 12); } catch (e) {}
    pop();
  }

  // ── милички звуци (по избор на мама, изключени по подразбиране) ──
  const soundsOn = () => { try { return localStorage.getItem('bl_sounds') === '1'; } catch (e) { return false; } };
  let AC = null;
  function ac() {
    if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } }
    if (AC && AC.state === 'suspended') AC.resume().catch(() => {});
    return AC;
  }
  function blip(f0, f1, dur, vol, type) {
    const a = ac(); if (!a) return;
    try {
      const o = a.createOscillator(), g = a.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(f0, a.currentTime);
      o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), a.currentTime + dur);
      g.gain.setValueAtTime(vol, a.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
      o.connect(g); g.connect(a.destination);
      o.start(); o.stop(a.currentTime + dur + 0.03);
    } catch (e) {}
  }
  function pop(force) { if (force || soundsOn()) blip(420, 170, 0.09, 0.1); }        // мек „пльок“
  function chime() { if (!soundsOn()) return; blip(660, 660, 0.18, 0.06, 'triangle'); setTimeout(() => blip(880, 880, 0.22, 0.06, 'triangle'), 130); } // тих звън

  // празничен банер (кратко изникващ надпис)
  function cheer(text) {
    if (тъженДен()) return;   // 🔗 не празнуваме шумно в тежък ден
    chime();
    if (reduce) { return; }
    const L = ensureLayer();
    const b = document.createElement('div');
    b.className = 'fx-cheer';
    // 22.07 (армия): при извикване БЕЗ аргумент DOM записва низа „undefined“
    //   (само null става празен низ) — и мама виждаше банер с тази дума в
    //   най-хубавите моменти (края на 3-те минути, събраните карти на деня).
    b.textContent = (text === undefined || text === null || text === '') ? '💜 Браво!' : text;
    L.appendChild(b);
    setTimeout(() => b.remove(), 2400);
  }

  // числата отброяват до резултата — сложи data-cnt="42" (по избор data-dec="1")
  function countUp(scope) {
    (scope || document).querySelectorAll('[data-cnt]').forEach(s => {
      const n = parseFloat(s.dataset.cnt);
      if (isNaN(n)) return;
      if (reduce) { s.textContent = s.dataset.cnt; return; }
      // 22.07 (армия): картите пускат countUp сами, а helper го пуска втори път
      //   върху цялата стая. Два rAF цикъла пишеха в един и същи span — числото
      //   мигаше и се връщаше назад. Един брояч на число.
      if (s.dataset.counting === '1') return;
      s.dataset.counting = '1';
      const dec = +(s.dataset.dec || 0), dur = 650, t0 = performance.now();
      (function frame(t) {
        const k = Math.min(1, (t - t0) / dur);
        const e = 1 - Math.pow(1 - k, 3); // ease-out
        s.textContent = (n * e).toFixed(dec);
        if (k < 1) requestAnimationFrame(frame);
        else { s.textContent = s.dataset.cnt; delete s.dataset.counting; }   // сяда точно на числото
      })(t0);
      // застраховка: скрит таб спира rAF — финалът винаги пристига
      setTimeout(() => { s.textContent = n.toFixed(dec); }, dur + 80);
    });
  }

  window.BL_FX = { confetti, buzz, cheer, pop, chime, countUp };
})();
