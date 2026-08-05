// ═══════════════════════════════════════════════════════════
// PREG — РЕДЪТ В „БРЕМЕННОСТ“ 🤰🌸
// 5 кътчета по пътя на чакането + прогрес-лента на бременността,
// липсващи подзаглавия и ясен статус на контракциите.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';
  const ROOM = 'Бременност';
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };

  // ── петте кътчета по пътя на чакането ──
  const SECTIONS = [
    ['pd', '🌸 Днес с коремчето'],
    ['pw', '📅 Пътят до термина'],
    ['pk', '👣 Усещам те'],
    ['pb', '🧳 За раждането'],
    ['pm', '💌 Спомени от чакането']
  ];
  const RULES = [
    [/вода днес|как е тази седмица|наддаван/i, 'pd'],
    [/кога е терминът|следващият преглед|въпроси за лекаря/i, 'pw'],
    [/ритания|контракции/i, 'pk'],
    [/план за раждане|чанта за родилния/i, 'pb'],
    [/коремчето по седмици|писмо до бебето|изборът на име|музика за коремчето/i, 'pm']
  ];
  window.BL_ROOM_SECTIONS = window.BL_ROOM_SECTIONS || {};
  window.BL_ROOM_SECTIONS[ROOM] = {
    sections: SECTIONS,
    match: t => (RULES.find(([re]) => re.test(t)) || [null, 'pd'])[1],
    keepOrder: true, toc: true
  };

  const week = () => {
    const lmp = window.BL_EXPECT ? BL_EXPECT.lmp() : load('bl_lmp', '');
    if (!lmp) return null;
    const w = Math.floor((Date.now() - new Date(lmp)) / 604800000);
    return (w >= 1 && w <= 45) ? w : null;
  };

  // ── 📊 прогрес-лентата: докъде си по пътя ──
  function progressBar(root) {
    const w = week();
    const term = [...root.querySelectorAll(':scope > .jr-card')].find(c => /Кога е терминът/.test(c.querySelector('.jr-title')?.textContent || ''));
    if (!term) return;
    // 🤍 На пауза (одит 11) не само че не рисуваме нова лента — махаме и старата.
    // Иначе мама натиска „спри броенето“ и „Изминала си 65%“ си стои до рестарт.
    if (!w) { const old = term.querySelector('.pgb'); if (old) old.remove(); return; }
    if (term.querySelector('.pgb')) return;
    const pct = Math.min(100, Math.round(w / 40 * 100));
    const tri = w <= 13 ? 1 : w <= 27 ? 2 : 3;
    const bar = el('div', 'pgb');
    bar.innerHTML = `
      <div class="pgb-track">
        <div class="pgb-fill" style="width:${pct}%"></div>
        <span class="pgb-baby" style="left:calc(${pct}% - 11px)">👶</span>
        <span class="pgb-tick" style="left:32.5%"></span>
        <span class="pgb-tick" style="left:67.5%"></span>
      </div>
      <div class="pgb-legend"><span class="${tri === 1 ? 'on' : ''}">1-ви триместър</span><span class="${tri === 2 ? 'on' : ''}">2-ри</span><span class="${tri === 3 ? 'on' : ''}">3-ти</span></div>
      <p class="pgb-txt">Изминала си <strong>${pct}%</strong> от пътя 💜</p>`;
    const out = term.querySelector('.pg-out');
    if (out) out.after(bar); else term.appendChild(bar);
  }

  // ── подзаглавията, които липсват ──
  const SUBS = {
    'Чанта за родилния дом': 'готова към 36-та седмица — до вратата',
    'Брояч на контракции': 'правилото 5-1-1 — кога се тръгва към болницата',
    'Въпроси за лекаря': 'записвай ги тук — на прегледа главата е празна'
  };

  const base = window.ROOM_FEATURES && window.ROOM_FEATURES[ROOM];
  if (base) {
    window.ROOM_FEATURES[ROOM] = root => {
      base(root);
      progressBar(root);
      root.querySelectorAll(':scope > .jr-card .jr-title').forEach(t => {
        if (t.querySelector('.jr-sub')) return;
        const name = [...t.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
        const key = Object.keys(SUBS).find(k => name.replace(/[\s🧳⏱️📝]+$/u, '').trim().startsWith(k));
        if (key) t.insertAdjacentHTML('beforeend', ` <span class="jr-sub">${SUBS[key]}</span>`);
      });
    };
  }
})();
