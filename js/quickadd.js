// ═══════════════════════════════════════════════════════════
// 🚀 БЪРЗИЯТ „+“ (план 19, част 5.4) — на „Днес“, до разходката
//
// „✍️ Таен ред“ — една реплика, без да ходиш до стая 8. Пише в СЪЩИЯ
// bl_wm_diary, който чете „Заключеното дневниче“ — и пази СЪЩАТА ключалка:
// ако мама има ПИН, пита за него ПРЕДИ да пише (не заобикаля 3.1).
//
// „🔬 Отметни опита“ — не дублира избора кое рамо е било днес (истинско
// решение, не бива да се бърза) — отвежда право до картата, готова за
// едно докосване, вместо да навигира сляпо.
//
// Зарежда се СЛЕД daily.js (за да се включи в СЪЩАТА верига от chains) и
// след extras.js (за BL_PIN).
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  // 🔴 25.08 (ИЗМЕРЕНО, dev/broyachi_dnevnik.js П4.3): `catch (e) {}` гълташе
  //    препълнената памет и картата ѝ казваше „🔒 Прибрано“ ВЪРХУ НИЩО —
  //    измерено живо: записани 0, а на екрана „Прибрано. Никой освен теб няма
  //    да го види.“ Записът връща ДА/НЕ, за да има какво да се провери.
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { if (window.BL_ZAPIS_PADNA) BL_ZAPIS_PADNA(); return false; } return true; };
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const localDate = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const today = () => localDate(new Date());
  const fx = () => window.BL_FX || { confetti() {}, cheer() {}, buzz() {} };

  // 📓 БЕЗ ТАВАН — нарочно. Това е НЕЙНИЯТ дневник: ред, писан преди месеци,
  //    не е „стар запис“, а спомен. По-добре честно „паметта е пълна“ (долу),
  //    отколкото тихо изядени изречения. Ако някой ден се сложи таван, той
  //    трябва да ПИТА, не да реже сам.
  function пишиТайнияРед(v, изход) {
    const items = load('bl_wm_diary', []);
    items.push({ t: v.slice(0, 200), d: today() });
    if (!save('bl_wm_diary', items)) {
      // редът остава в полето — има го поне още веднъж, за да не се загуби
      изход.textContent = '😕 Паметта на телефона е пълна — редът НЕ е записан. Оставям го тук, за да не се загуби: изтрий някоя стара снимка или гласов запис и бутни пак. 💜';
      return false;
    }
    fx().buzz(10); fx().confetti && fx().confetti();
    изход.textContent = '🔒 Прибрано. Никой освен теб няма да го види.';
    return true;
  }

  function mountQuickAdd(container) {
    const inner = container.querySelector('.td-inner');
    if (!inner || inner.classList.contains('td-welcome') || inner.querySelector('.qa-card')) return;

    const c = el('div', 'qa-card');
    c.innerHTML = `<span class="qa-title">Бързо, преди да отлети 🚀</span>`;

    // ── ✍️ Таен ред ──
    const ред1 = el('div', 'qa-row');
    const inp = el('input', 'qa-inp'); inp.type = 'text'; inp.maxLength = 200;
    inp.placeholder = '✍️ Един таен ред…';
    const b1 = el('button', 'qa-b', '🔒'); b1.type = 'button'; b1.setAttribute('aria-label', 'Запиши тайно');
    const изход = el('p', 'qa-out');
    const прати = () => {
      const v = inp.value.trim(); if (!v) { inp.focus(); return; }
      // полето се изчиства САМО ако редът наистина е влязъл в паметта
      const запиши = () => { if (пишиТайнияРед(v, изход)) inp.value = ''; };
      const заключено = window.BL_PIN && BL_PIN.has && BL_PIN.has() && !BL_PIN.unlocked();
      if (заключено) BL_PIN.ask('🔒 Преди тайния ред', запиши);
      else запиши();
    };
    b1.addEventListener('click', прати);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); прати(); } });
    ред1.appendChild(inp); ред1.appendChild(b1);
    c.appendChild(ред1); c.appendChild(изход);

    // ── 🔬 Отметни опита (само ако има активен и още не е отметнат днес) ──
    const оп = window.BL_LAB && BL_LAB.activeExp && BL_LAB.activeExp();
    if (оп && !(оп.log && оп.log[today()])) {
      const b2 = el('button', 'qa-lab', '🔬 Отметни опита: „' + esc((оп.q || '').slice(0, 34)) + (оп.q && оп.q.length > 34 ? '…' : '') + '“');
      b2.type = 'button';
      b2.addEventListener('click', () => {
        if (!window.MamaHelper) return;
        MamaHelper.open('Лабораторията');
        setTimeout(() => {
          const target = [...document.querySelectorAll('#roRoom .jr-card:not(.toc-card)')].find(x => {
            const t = x.querySelector('.jr-title'); return t && /Днешното докосване/.test(t.textContent);
          });
          if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); target.classList.add('pb-flash'); setTimeout(() => target.classList.remove('pb-flash'), 1700); }
        }, 60);
      });
      c.appendChild(b2);
    }

    inner.appendChild(c);
  }

  // ── свързване: СЪЩАТА верига, по която daily.js вече закачи mountWalk ──
  const prevBind = window.BL_TODAY_BIND;
  window.BL_TODAY_BIND = function (container, baby, a) {
    if (prevBind) prevBind(container, baby, a);
    mountQuickAdd(container);
  };
})();
