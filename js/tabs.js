// ═══════════════════════════════════════════════════════════
// 🎈 ВЪЗДУШНИЯТ ПРЕВКЛЮЧВАТЕЛ — чисто новият таб (план 20, Д-блок)
//
// Старият беше три студени хапчета. Този е ЧАСТ ОТ СВЕТА:
//
//   ┌──────────── небе с облачета ────────────┐
//   │   🏠 Стаята    📚 Статии    💬 Мила   🧭 │
//   │        ╰─🎈 балонът ЛЕТИ до избраното    │
//   └──────────────────────────────────────────┘
//
// • Балон-къщичка (СЪЩИЯ #balloonShape като на хероя) лети по ДЪГА до
//   избрания дял — не се плъзга право, издига се и каца.
// • Оставя следа от искри; при кацане — мек отскок.
// • Небето отзад е живо: две облачета минават бавно.
// • Небето сменя цвета си с ТЕМАТА на стаята (всяка помощничка си има).
// • Дялът показва иконка + име; неактивните са полупрозрачни.
// • 🧭 картата на стаята е кръгло копче вдясно, извън дяловете.
// • Значка (непрочетени статии) седи върху своя дял.
// • Клавиатура: ← → между дяловете. reduced-motion: без летене.
//
// Заменя изцяло съдържанието на #roTabs. helper.js продължава да вика
// setTab(); ние само рисуваме другояче и слушаме.
// ЗАРЕЖДА СЕ СЛЕД helper.js, СЛЕД iface.js, СЛЕД roommap.js.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';
  if (!window.MamaHelper) return;

  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const тихо = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ИМЕНА = { room: ['🏠', 'Стаята'], articles: ['📚', 'Статии'], chat: ['💬', 'Питай'] };

  let текущ = null;

  // ═══════════ рисуването ═══════════
  function построй(стая, персона) {
    const кутия = document.getElementById('roTabs');
    if (!кутия) return;
    const стари = [...старитеТабове(кутия)];
    if (!стари.length) return;

    кутия.classList.add('sky-tabs');
    кутия.innerHTML = '';
    кутия.hidden = false;

    // 1) небето
    const небе = el('span', 'st-sky');
    небе.innerHTML = '<span class="st-cloud c1">☁️</span><span class="st-cloud c2">☁️</span>';
    кутия.appendChild(небе);

    // 2) балонът — под дяловете, лети до активния
    const балон = el('span', 'st-balloon');
    балон.innerHTML = `<svg viewBox="0 0 60 96" aria-hidden="true"><use href="#balloonShape"/></svg>`;
    кутия.appendChild(балон);
    const искри = el('span', 'st-spark'); искри.setAttribute('aria-hidden', 'true');
    кутия.appendChild(искри);

    // 3) дяловете
    const ред = el('div', 'st-segs'); ред.setAttribute('role', 'tablist');
    стари.forEach(([id, надпис]) => {
      const [е, име] = ИМЕНА[id] || ['•', надпис];
      const б = el('button', 'st-seg');
      б.type = 'button'; б.dataset.tab = id;
      б.setAttribute('role', 'tab');
      б.setAttribute('aria-label', id === 'chat' ? 'Попитай ' + (персона || '') : име);
      б.innerHTML = `<span class="st-e">${е}</span><span class="st-n">${esc(id === 'chat' && персона ? персона : име)}</span>`;
      б.addEventListener('click', () => MamaHelper.showTab(id));
      ред.appendChild(б);
    });
    кутия.appendChild(ред);

    // 4) компасът — отделно кръгче, не е дял
    if (window.BL_ROOMMAP) {
      const к = el('button', 'st-map', '🧭');
      к.type = 'button';
      к.setAttribute('aria-label', 'Картата на стаята — всичко вътре');
      к.title = 'Картата на стаята';
      к.addEventListener('click', () => BL_ROOMMAP.отвориКарта(стая));
      кутия.appendChild(к);
    }

    // 5) клавиатура: стрелки между дяловете
    ред.addEventListener('keydown', e => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const б = [...ред.querySelectorAll('.st-seg')];
      const i = б.indexOf(document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      const нов = б[(i + (e.key === 'ArrowRight' ? 1 : б.length - 1)) % б.length];
      нов.focus(); MamaHelper.showTab(нов.dataset.tab);
    });

    // 6) значка за непрочетени статии (iface.js я слагаше на стария таб)
    setTimeout(() => значка(стая), 60);
  }

  // старите бутони: [[id, надпис], …] — четем ги ПРЕДИ да ги изтрием
  function старитеТабове(кутия) {
    return [...кутия.querySelectorAll('.ro-tab')]
      .filter(b => b.dataset.tab)
      .map(b => [b.dataset.tab, b.textContent.trim()]);
  }

  function значка(стая) {
    const кутия = document.getElementById('roTabs');
    if (!кутия) return;
    кутия.querySelectorAll('.st-dot').forEach(x => x.remove());
    const статии = window.BL_ARTICLES ? BL_ARTICLES.forRoom(стая) : [];
    if (!статии.length) return;
    const прочетени = (window.BL_READER && BL_READER.прочетени()) || {};
    const н = статии.filter(a => !прочетени[a.id]).length;
    if (!н) return;
    const дял = кутия.querySelector('.st-seg[data-tab="articles"]');
    if (дял) дял.appendChild(el('span', 'st-dot', н > 99 ? '99+' : String(н)));
  }

  // ═══════════ полетът ═══════════
  function лети(id) {
    const кутия = document.getElementById('roTabs');
    if (!кутия || !кутия.classList.contains('sky-tabs')) return;
    const дял = кутия.querySelector('.st-seg[data-tab="' + id + '"]');
    const балон = кутия.querySelector('.st-balloon');
    if (!дял || !балон) return;

    кутия.querySelectorAll('.st-seg').forEach(s => {
      const той = s === дял;
      s.classList.toggle('on', той);
      s.setAttribute('aria-selected', той ? 'true' : 'false');
      s.tabIndex = той ? 0 : -1;
    });

    const цел = дял.offsetLeft + дял.offsetWidth / 2 - балон.offsetWidth / 2;
    const беше = текущ;
    текущ = id;

    if (тихо() || беше === null) { балон.style.transform = 'translateX(' + цел + 'px)'; return; }

    // ДЪГАТА: балонът се издига, лети, каца. Затова два кадъра, не един.
    const откъде = балон.offsetLeft + (parseFloat((балон.style.transform.match(/-?[\d.]+/) || [0])[0]) || 0);
    балон.classList.add('flying');
    балон.style.transform = 'translateX(' + цел + 'px)';
    // искрите тръгват от старото място и гаснат
    искриОт(кутия, откъде + балон.offsetWidth / 2);
    setTimeout(() => {
      балон.classList.remove('flying');
      балон.classList.add('landed');
      setTimeout(() => балон.classList.remove('landed'), 320);
    }, 460);
  }
  function искриОт(кутия, x) {
    const с = кутия.querySelector('.st-spark');
    if (!с || тихо()) return;
    с.style.left = x + 'px';
    с.classList.remove('go'); void с.offsetWidth; с.classList.add('go');
  }

  // небето взима цвета на помощничката (всяка стая си има клас ro-*)
  function небеПоСтая() {
    const панел = document.querySelector('.ro-panel');
    const кутия = document.getElementById('roTabs');
    if (!панел || !кутия) return;
    const клас = [...панел.classList].find(c => c.startsWith('ro-') && c !== 'ro-panel');
    кутия.dataset.room = клас || '';
  }

  // ═══════════ свързване ═══════════
  const оригОтвори = MamaHelper.open;
  MamaHelper.open = function (стая) {
    текущ = null;
    оригОтвори.call(MamaHelper, стая);
    setTimeout(() => {
      const ов = document.getElementById('roomOverlay');
      if (!ов || ов.hidden) return;
      const п = MamaHelper.persona ? MamaHelper.persona(стая) : null;
      построй(стая, п && п.name);
      небеПоСтая();
      const активен = document.querySelector('#roRoom:not([hidden])') ? 'room'
        : document.querySelector('#roArticles:not([hidden])') ? 'articles' : 'chat';
      лети(активен);
    }, 820);
  };

  const оригТаб = MamaHelper.showTab;
  MamaHelper.showTab = function (t) {
    оригТаб.call(MamaHelper, t);
    requestAnimationFrame(() => лети(t));
  };

  window.BL_TABS = { лети, построй, значка };
})();
