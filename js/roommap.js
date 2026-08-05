// ═══════════════════════════════════════════════════════════
// 🧭 КАРТАТА НА СТАЯТА (план 20, В1.8 + В1.1) — за ВСИЧКИ стаи
//
// Думите на собственика: „опциите са много, всяка е яка и клиентът
// НИЩО не бива да пропусне“. Затова:
//   🧭 при табовете → панел-карта с ВСЯКА карта на стаята, групирана
//      по кътчета, с ✔ на разгледаните (bl_seen_cards) и търсене.
//      Докосваш име → скачаш там, картата се разгъва и светва.
//
// Лентата с кътчетата (sec-nav) вече НЕ лепне при скрол (В1.1) — тя
// остава като посрещане на върха, а картата е достъпна отвсякъде.
// Пътеката (Бременност) е за ВРЕМЕТО; картата — за ПЪЛНОТАТА.
//
// ЗАРЕЖДА СЕ СЛЕД helper.js, СЛЕД polish.js, СЛЕД iface.js.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';
  if (!window.MamaHelper) return;

  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

  function иметоНа(карта) {
    const т = карта.querySelector('.jr-title');
    if (!т) return '';
    return [...т.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
  }
  function емоджитоНа(карта) {
    const м = карта.querySelector('.jr-title .jr-medal');
    return м ? м.textContent.trim() : '•';
  }

  // ═══════════ панелът-карта ═══════════
  function отвориКарта(стая) {
    if (document.getElementById('roomMap')) return;
    const кутия = document.getElementById('roRoom');
    if (!кутия) return;
    const видени = (load('bl_seen_cards', {})[стая]) || {};

    // групите се четат от ЖИВИЯ DOM — каквото има, това показваме,
    // нищо не се пропуска и нищо не се измисля
    const групи = [];
    let текуща = { име: '✨ Стаята', карти: [] };
    [...кутия.children].forEach(дете => {
      if (дете.classList.contains('sec-head')) {
        if (текуща.карти.length) групи.push(текуща);
        текуща = { име: дете.textContent.replace(/\d+$/, '').trim(), карти: [] };
      } else if (дете.classList.contains('jr-card')) {
        const име = иметоНа(дете);
        if (име) текуща.карти.push({ име, е: емоджитоНа(дете), ключ: дете.dataset.blkey, ел: дете });
      }
    });
    if (текуща.карти.length) групи.push(текуща);
    const общо = групи.reduce((s, g) => s + g.карти.length, 0);
    const разгледани = групи.reduce((s, g) => s + g.карти.filter(k => k.ключ && видени[k.ключ]).length, 0);

    const слой = el('div', 'rm-veil'); слой.id = 'roomMap';
    слой.innerHTML = `<div class="rm-box" role="dialog" aria-label="Картата на стаята">
        <div class="rm-head"><p class="rm-h">🧭 Картата на стаята</p>
          <span class="rm-count">${разгледани} от ${общо} разгледани</span>
          <button class="rm-x" type="button" aria-label="Затвори">✕</button></div>
        <input class="jr-word rm-find" type="search" placeholder="🔍 Търси в стаята… (напр. „чанта“)">
        <div class="rm-scroll">${групи.map(g => `
          <p class="rm-g">${esc(g.име)}</p>
          <div class="rm-list">${g.карти.map(k => `
            <button class="rm-item${k.ключ && видени[k.ключ] ? ' seen' : ''}" type="button" data-k="${esc(k.ключ || '')}">
              <span class="rm-e">${k.е}</span><span class="rm-n">${esc(k.име)}</span>
              <span class="rm-check">${k.ключ && видени[k.ключ] ? '✔' : ''}</span>
            </button>`).join('')}</div>`).join('')}
        </div></div>`;
    document.body.appendChild(слой);
    requestAnimationFrame(() => слой.classList.add('on'));
    const махни = () => { слой.classList.remove('on'); setTimeout(() => слой.remove(), 220); };
    слой.querySelector('.rm-x').addEventListener('click', махни);
    слой.addEventListener('click', e => { if (e.target === слой) махни(); });
    document.addEventListener('keydown', function изх(e) { if (e.key === 'Escape') { махни(); document.removeEventListener('keydown', изх); } });

    // скокът: затваря картата, разгъва целта, скролва и я светва
    const всички = групи.flatMap(g => g.карти);
    слой.querySelectorAll('.rm-item').forEach((б, i) => б.addEventListener('click', () => {
      const цел = всички[i] && всички[i].ел;
      махни();
      if (!цел) return;
      цел.classList.remove('folded');
      setTimeout(() => {
        цел.scrollIntoView({ behavior: 'smooth', block: 'start' });
        цел.classList.remove('toc-flash'); void цел.offsetWidth; цел.classList.add('toc-flash');
      }, 240);
    }));

    // 🔍 търсенето: по име И по съдържание (както дълбокото на стаята)
    const търси = слой.querySelector('.rm-find');
    търси.addEventListener('input', () => {
      const q = търси.value.toLowerCase().trim();
      слой.querySelectorAll('.rm-item').forEach((б, i) => {
        const к = всички[i];
        const име = (к.име || '').toLowerCase();
        const дълбоко = q.length >= 3 ? (к.ел.textContent || '').toLowerCase() : име;
        б.style.display = !q || име.includes(q) || дълбоко.includes(q) ? '' : 'none';
      });
      // празните групи се скриват със скритите си деца
      слой.querySelectorAll('.rm-g').forEach(g => {
        const списък = g.nextElementSibling;
        g.style.display = списък && [...списък.children].some(x => x.style.display !== 'none') ? '' : 'none';
      });
    });
    setTimeout(() => търси.focus({ preventScroll: true }), 260);
  }

  // ═══════════ бутоните при табовете ═══════════
  function монтирай(стая) {
    const табове = document.getElementById('roTabs');
    if (!табове || табове.querySelector('.rm-btn')) return;
    const б = el('button', 'ro-tab rm-btn', '🧭');
    б.type = 'button';
    б.setAttribute('aria-label', 'Картата на стаята — всичко вътре');
    б.title = 'Картата на стаята';
    б.addEventListener('click', () => отвориКарта(стая));
    // компасът застава ПЪРВИ — на тесен екран табовете се режат отдясно,
    // а картата е точно за да не се пропуска нищо. Тя не бива да се губи.
    табове.insertBefore(б, табове.firstChild);
    табове.hidden = false;                 // и при една секция картата присъства
  }

  // ═══════════ 🎈 балончето-индикатор под активния таб ═══════════
  // Барът беше „три студени копчета“. Сега едно мъничко балонче живее
  // под активния таб и ПРЕЛИТА до новия при всяка смяна.
  function балонче() {
    const табове = document.getElementById('roTabs');
    if (!табове) return;
    let б = табове.querySelector('.ro-tabfly');
    if (!б) { б = el('span', 'ro-tabfly', '🎈'); табове.appendChild(б); }
    const активен = табове.querySelector('.ro-tab.on');
    if (!активен) { б.style.opacity = '0'; return; }
    б.style.opacity = '1';
    const цел = активен.offsetLeft + активен.offsetWidth / 2 - 7;
    б.style.transform = 'translateX(' + цел + 'px)';
    // активният таб влиза в кадър, ако барът е превъртян
    активен.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  }
  if (MamaHelper.showTab) {
    const оригТаб = MamaHelper.showTab;
    MamaHelper.showTab = function (t) {
      оригТаб.call(MamaHelper, t);
      requestAnimationFrame(балонче);
    };
  }
  document.addEventListener('click', e => {
    if (e.target.closest && e.target.closest('#roTabs .ro-tab')) requestAnimationFrame(балонче);
  });

  const ориг = MamaHelper.open;
  MamaHelper.open = function (стая) {
    ориг.call(MamaHelper, стая);
    setTimeout(() => {
      if (document.getElementById('roomOverlay')?.hidden) return;
      монтирай(стая);
      балонче();
    }, 800);
  };

  window.BL_ROOMMAP = { отвориКарта, балонче };
})();
