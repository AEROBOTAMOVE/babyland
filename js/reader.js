// ═══════════════════════════════════════════════════════════
// 📖 ЧЕТЕЦЪТ — надграждане (план 19, част 12.2)
//
// 🔤 12.2.1  Размер на шрифта
// 📊 12.2.2  Докъде съм стигнала — лента отгоре
// 📤 12.2.7  Сподели статия
// ✔️ 12.2.11 Прочетените да личат
//
// ⛔ 12.2.10 (свайп) НЕ Е ТУК — articles.js ВЕЧЕ го има (swipeNext, ред 412).
//    Щях да го дублирам; grep-ът го хвана. Двата слушателя щяха да се бият.
//
// Не пипам articles.js — обвивам `BL_ARTICLES.open`. Така читателят си
// остава негов, а надстройката е отделна и се маха с един ред.
// ЗАРЕЖДА СЕ СЛЕД articles.js.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';
  if (!window.BL_ARTICLES) return;

  const $ = id => document.getElementById(id);
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const raw = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const fx = () => window.BL_FX || { buzz() {}, cheer() {} };

  // ── 12.2.1 РАЗМЕРЪТ НА ШРИФТА ──
  // 3 стъпки. Пази се между статии и сесии — веднъж нагласен, забравен.
  const РАЗМЕРИ = [
    { id: 's', н: 'A', px: 15.5 },
    { id: 'm', н: 'A', px: 17.5 },
    { id: 'l', н: 'A', px: 20 }
  ];
  function размерът() { const r = raw('bl_art_size'); return РАЗМЕРИ.find(x => x.id === r) || РАЗМЕРИ[0]; }
  function приложиРазмер() {
    const b = $('artBody'); if (!b) return;
    b.style.fontSize = размерът().px + 'px';
  }

  // ── 12.2.11 ПРОЧЕТЕНИТЕ ──
  const прочетени = () => load('bl_art_read', {});
  function отбележиПрочетена(id) {
    const r = прочетени();
    if (r[id]) return;
    r[id] = Date.now();
    save('bl_art_read', r);
  }

  // ── лентата, шрифтът, споделянето — в главата на четеца ──
  function монтирайЛента() {
    const head = document.querySelector('.art-head');
    if (!head || $('artProg')) return;

    // 12.2.2: прогрес-лента отгоре
    const p = el('div', 'art-prog'); p.id = 'artProg';
    p.innerHTML = '<span class="art-progfill" id="artProgFill"></span>';
    head.parentNode.insertBefore(p, head.nextSibling);

    // 12.2.1: A / A / A
    const fs = el('div', 'art-fs'); fs.id = 'artFs';
    РАЗМЕРИ.forEach(r => {
      const b = el('button', 'art-fsb art-fs-' + r.id + (r.id === размерът().id ? ' on' : ''), r.н);
      b.type = 'button'; b.setAttribute('aria-label', 'Размер ' + r.id);
      b.addEventListener('click', () => {
        try { localStorage.setItem('bl_art_size', r.id); } catch (e) {}
        fs.querySelectorAll('.art-fsb').forEach(x => x.classList.remove('on'));
        b.classList.add('on');
        приложиРазмер(); fx().buzz(6);
      });
      fs.appendChild(b);
    });
    head.appendChild(fs);

    // 12.2.7: сподели
    const sh = el('button', 'ro-nav', '📤'); sh.id = 'artShare'; sh.type = 'button';
    sh.setAttribute('aria-label', 'Сподели статията');
    head.appendChild(sh);

    // прогресът следи скрола на тялото
    const body = $('artBody');
    if (body && !body._progBound) {
      body._progBound = true;
      body.addEventListener('scroll', () => {
        const макс = body.scrollHeight - body.clientHeight;
        const пр = макс > 20 ? Math.min(100, Math.round(body.scrollTop / макс * 100)) : 0;
        const f = $('artProgFill'); if (f) f.style.width = пр + '%';
        // 12.2.11: прочетена = стигнала е до дъното
        if (пр > 92 && body.dataset.artId) отбележиПрочетена(body.dataset.artId);
      }, { passive: true });
    }
  }

  // ── видими стрелки „предишна / следваща“ ──
  // Свайпът си е в articles.js (swipeNext) — но той е невидим и мама не
  // знае за него. Стрелките показват СЪЩИЯ рафт (стая + категория), за да
  // не се разминават с това, което свайпът прави.
  let съседи = { prev: null, next: null };
  function изчислиСъседи(a) {
    съседи = { prev: null, next: null };
    if (!a) return;
    const данни = window.BL_ARTICLES_DATA || [];
    const рафт = данни.filter(x => x.room === a.room && (x.cat || '') === (a.cat || ''));
    const i = рафт.findIndex(x => x.id === a.id);
    if (i < 0) return;
    съседи.prev = i > 0 ? рафт[i - 1] : null;
    съседи.next = i < рафт.length - 1 ? рафт[i + 1] : null;
  }
  function монтирайСтрелки() {
    const body = $('artBody');
    if (!body) return;
    const стар = body.querySelector('.art-nav'); if (стар) стар.remove();
    if (!съседи.prev && !съседи.next) return;
    const кратко = t => t.slice(0, 22) + (t.length > 22 ? '…' : '');
    const ред = el('div', 'art-nav');
    if (съседи.prev) {
      const b = el('button', 'art-navb', '‹ ' + съседи.prev.emoji + ' ' + кратко(съседи.prev.title));
      b.type = 'button';
      b.addEventListener('click', () => BL_ARTICLES.open(съседи.prev.id));
      ред.appendChild(b);
    }
    if (съседи.next) {
      const b = el('button', 'art-navb art-navr', съседи.next.emoji + ' ' + кратко(съседи.next.title) + ' ›');
      b.type = 'button';
      b.addEventListener('click', () => BL_ARTICLES.open(съседи.next.id));
      ред.appendChild(b);
    }
    body.appendChild(ред);
  }

  // ── обвивката ──
  // ⚠️ articles.js вика ВЪТРЕШНИЯ openArticle при свайп и при „свързани
  //    статии“ — тогава BL_ARTICLES.open изобщо не минава. Затова освен
  //    обвивката гледам и самото тяло: щом се смени, надграждам пак.
  function следЗареждане(id) {
    if (!id) return;
    const a = (window.BL_ARTICLES_DATA || []).find(x => x.id === id);
    монтирайЛента();
    приложиРазмер();
    изчислиСъседи(a);
    монтирайСтрелки();

    const body = $('artBody');
    if (body) { body.dataset.artId = id; body.scrollTop = 0; }
    const f = $('artProgFill'); if (f) f.style.width = '0%';

    // кратките статии не се скролват → маркирай ги прочетени веднага
    setTimeout(() => {
      if (!body) return;
      if (body.scrollHeight - body.clientHeight < 40) отбележиПрочетена(id);
    }, 120);

    // 12.2.7: споделянето знае за ТАЗИ статия
    const sh = $('artShare');
    if (sh && a) {
      sh.onclick = async () => {
        const текст = a.emoji + ' ' + a.title + '\n\n' +
          (a.summary || '').slice(0, 180) + '\n\n(от Помощникът на мама 🎈)';
        if (navigator.share) {
          try { await navigator.share({ text: текст }); return; } catch (e) { if (e.name === 'AbortError') return; }
        }
        try {
          await navigator.clipboard.writeText(текст);
          sh.textContent = '✔'; fx().cheer('Копирано — прати го на приятелка 💜');
          setTimeout(() => sh.textContent = '📤', 1600);
        } catch (e) {}
      };
    }
  }

  const оригОтвори = BL_ARTICLES.open;
  BL_ARTICLES.open = function (id) {
    оригОтвори.call(BL_ARTICLES, id);
    следЗареждане(id);
  };

  // свайпът и „свързани статии“ минават покрай обвивката → гледам тялото
  document.addEventListener('DOMContentLoaded', () => {
    const body = $('artBody');
    if (!body) return;
    let последна = null;
    new MutationObserver(() => {
      const id = window._blCurArt;
      if (!id || id === последна) return;
      последна = id;
      следЗареждане(id);
    }).observe(body, { childList: true });
  });

  // ── 12.2.11: прочетените личат в СПИСЪКА ──
  // ⚠️ `.art-card` НЯМА data-id (articles.js закача клика през closure).
  // Затова свързвам по ЗАГЛАВИЕ — единственото, което картата показва.
  // Списъкът се пре-рисува при търсене/филтър → MutationObserver.
  const оригСписък = BL_ARTICLES.renderList;
  BL_ARTICLES.renderList = function (room, container) {
    оригСписък.call(BL_ARTICLES, room, container);
    const маркирай = () => {
      const r = прочетени();
      const поЗаглавие = {};
      (window.BL_ARTICLES_DATA || []).forEach(a => { поЗаглавие[a.title] = a.id; });
      container.querySelectorAll('.art-card').forEach(c => {
        const t = c.querySelector('.art-ctitle');
        if (!t) return;
        const id = поЗаглавие[t.textContent];
        c.classList.toggle('art-done', !!(id && r[id]));
      });
    };
    маркирай();
    if (!container._readObs) {
      container._readObs = new MutationObserver(() => маркирай());
      container._readObs.observe(container, { childList: true, subtree: true });
    }
  };

  window.BL_READER = { прочетени, размерът };
})();
