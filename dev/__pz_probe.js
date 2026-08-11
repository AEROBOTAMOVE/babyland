// ВРЕМЕНЕН уред на „пазача на телефона“ (12.08). Трие се накрая.
// Мери: разместване · мишени <44 · безкрайни анимации по НЕ-композирано свойство.
(function () {
  'use strict';
  var МИН = 44;
  var ЗЕЛЕНИ = { transform: 1, '-webkit-transform': 1, translate: 1, rotate: 1, scale: 1, opacity: 1, '-webkit-opacity': 1 };
  var ЖЪЛТИ = { offsetDistance: 1, offsetPath: 1, offsetRotate: 1, visibility: 1 };

  function път(el) {
    var p = [], n = el, d = 0;
    while (n && n.nodeType === 1 && d < 5) {
      var s = n.tagName.toLowerCase();
      if (n.id) { s += '#' + n.id; p.unshift(s); break; }
      if (n.className && typeof n.className === 'string') {
        var c = n.className.trim().split(/\s+/).slice(0, 3).join('.');
        if (c) s += '.' + c;
      }
      p.unshift(s); n = n.parentElement; d++;
    }
    return p.join(' > ');
  }
  function видим(el) {
    var cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return false;
    if (el.hasAttribute('hidden')) return false;
    var r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return false;
    var n = el.parentElement, d = 0;
    while (n && n !== document.body && d < 40) {
      var c2 = getComputedStyle(n);
      if (c2.display === 'none' || c2.visibility === 'hidden' || parseFloat(c2.opacity) === 0 || n.hasAttribute('hidden')) return false;
      n = n.parentElement; d++;
    }
    return true;
  }
  function разшири(el, r) {
    var W = r.width, H = r.height;
    ['::before', '::after'].forEach(function (ps) {
      try {
        var cs = getComputedStyle(el, ps);
        if (!cs || cs.content === 'none' || cs.content === '') return;
        if (cs.position !== 'absolute' && cs.position !== 'fixed') return;
        var t = parseFloat(cs.top), b = parseFloat(cs.bottom), l = parseFloat(cs.left), rr = parseFloat(cs.right);
        var dx = 0, dy = 0;
        if (t < 0) dy += -t; if (b < 0) dy += -b; if (l < 0) dx += -l; if (rr < 0) dx += -rr;
        if (dx || dy) { W = Math.max(W, r.width + dx); H = Math.max(H, r.height + dy); }
      } catch (e) {}
    });
    return { w: W, h: H };
  }
  var СЕЛ = 'button,a[href],input,select,textarea,summary,label[for],[role=button],[role=tab],[role=switch],[role=checkbox],[role=radio],[role=menuitem],[role=option],[tabindex]:not([tabindex="-1"]),[onclick]';
  function мишени(корен) {
    var всички = [].slice.call(корен.querySelectorAll(СЕЛ));
    var изм = 0, проп = 0, малки = [], жълти = [];
    всички.forEach(function (el) {
      if (el.disabled || el.type === 'hidden' || !видим(el)) { проп++; return; }
      var r = el.getBoundingClientRect(), e = разшири(el, r);
      изм++;
      if (e.w < МИН - 0.5 || e.h < МИН - 0.5) {
        var cs = getComputedStyle(el);
        var зап = { път: път(el), txt: (el.textContent || el.value || el.getAttribute('aria-label') || '').trim().slice(0, 32), w: Math.round(e.w * 10) / 10, h: Math.round(e.h * 10) / 10, disp: cs.display };
        if (cs.display === 'inline' && el.tagName === 'A') жълти.push(зап); else малки.push(зап);
      }
    });
    return { измерени: изм, пропуснати: проп, общо: всички.length, малки: малки, жълти: жълти };
  }
  function анимации() {
    var а = []; try { а = document.getAnimations(); } catch (e) { return { грешка: 1 }; }
    var вечни = [], черв = [], жълтиА = [];
    а.forEach(function (an) {
      var ef = an.effect; if (!ef) return;
      var t = ef.getTiming ? ef.getTiming() : {};
      if (!(t.iterations === Infinity || t.iterations > 1000)) return;
      var цел = ef.target; if (цел && !видим(цел)) return;
      var props = {};
      try { ef.getKeyframes().forEach(function (k) { Object.keys(k).forEach(function (p) { if (/^(offset|computedOffset|easing|composite)$/.test(p)) return; props[p] = 1; }); }); } catch (e) {}
      var имена = Object.keys(props);
      var лоши = имена.filter(function (p) { return !ЗЕЛЕНИ[p] && !ЖЪЛТИ[p]; });
      var жълт = имена.filter(function (p) { return ЖЪЛТИ[p]; });
      var зап = { име: an.animationName || '?', св: имена.join(','), цел: цел ? път(цел) : '(без цел)' };
      вечни.push(зап);
      if (лоши.length) { зап.лоши = лоши.join(','); черв.push(зап); }
      else if (жълт.length) жълтиА.push(зап);
    });
    return { всичкиАнимации: а.length, безкрайни: вечни.length, червени: черв, жълти: жълтиА };
  }
  function уседни() {
    // Скрит раздел замразява CSS-анимациите на currentTime=0 → всичко стои
    // с opacity:0. Довършваме РЪЧНО само КРАЙНИТЕ (входните). Безкрайните
    // не пипаме — тях ги броим.
    var д = 0, отм = 0, беж = 0, а = [];
    try { а = document.getAnimations(); } catch (e) { return { грешка: 1 }; }
    а.forEach(function (an) {
      try {
        var t = an.effect ? an.effect.getTiming() : null; if (!t) return;
        if (t.iterations === Infinity) { беж++; return; }
        if (t.duration === 'auto' || t.duration === undefined) { an.cancel(); отм++; return; }
        an.finish(); д++;
      } catch (e) { try { an.cancel(); отм++; } catch (e2) {} }
    });
    return { довършени: д, отменени: отм, безкрайниОставени: беж };
  }
  var РАЗКРИЙ = '.is-pending,.jr-card.is-pending,.reveal{opacity:1 !important;transform:none !important;}';
  function разкрий() { if (document.getElementById('__pzReveal')) return; var s = document.createElement('style'); s.id = '__pzReveal'; s.textContent = РАЗКРИЙ; document.head.appendChild(s); }
  function скрий() { var s = document.getElementById('__pzReveal'); if (s) s.remove(); }

  function сканирай(корен) {
    корен = корен || document.getElementById('roRoom') || document.body;
    var de = document.documentElement;
    var прелели = [];
    if (de.scrollWidth > de.clientWidth + 1) {
      [].slice.call(корен.querySelectorAll('*')).forEach(function (el) {
        if (!видим(el)) return; var r = el.getBoundingClientRect();
        if (r.right > de.clientWidth + 1 || r.left < -1) прелели.push({ път: път(el), ляво: Math.round(r.left), дясно: Math.round(r.right), ш: Math.round(r.width) });
      });
    }
    return {
      scrollW: de.scrollWidth, clientW: de.clientWidth, разместване: de.scrollWidth - de.clientWidth,
      прелели: прелели.slice(0, 12), прелелиБрой: прелели.length,
      елементи: корен.querySelectorAll('*').length, картиJR: корен.querySelectorAll('.jr-card').length,
      мишени: мишени(корен), анимации: анимации()
    };
  }
  var спи = function (ms) { return new Promise(function (r) { try { var ch = new MessageChannel(); ch.port1.onmessage = function () { setTimeout(r, ms); }; ch.port2.postMessage(0); } catch (e) { setTimeout(r, ms); } }); };

  async function обиколка(списък, пауза) {
    пауза = пауза || 1100;
    var предиLd = window._ldDirect, предиScroll = window.scrollY;
    var доклад = {};
    try {
      разкрий();
      for (var i = 0; i < списък.length; i++) {
        var с = списък[i];
        var z = document.getElementById('roClose'); if (z) { try { z.click(); } catch (e) {} }
        await спи(220); window.scrollTo(0, 0);
        window._ldDirect = true;
        try { MamaHelper.open(с); } catch (e) { доклад[с] = { ГРЕШКА: 'open хвърли: ' + e }; continue; }
        await спи(пауза);
        var корен = document.getElementById('roRoom');
        if (!корен) { доклад[с] = { ГРЕШКА: 'roRoom липсва' }; continue; }
        var сгънати = корен.querySelectorAll('.jr-card.folded');
        [].forEach.call(сгънати, function (c) { c.classList.remove('folded'); });
        уседни();
        await спи(400);
        var r = сканирай(корен);
        var панел = document.querySelector('.ro-panel');
        r.роСкрол = { roRoom: корен.scrollWidth - корен.clientWidth, панел: панел ? панел.scrollWidth - панел.clientWidth : null };
        var прелелиВ = [], гр = корен.getBoundingClientRect();
        [].slice.call(корен.querySelectorAll('*')).forEach(function (el) {
          if (!видим(el)) return; var b = el.getBoundingClientRect();
          if (b.width > гр.width + 1 || b.right > гр.right + 1 || b.left < гр.left - 1)
            прелелиВ.push({ път: път(el), ш: Math.round(b.width), л: Math.round(b.left - гр.left), д: Math.round(b.right - гр.right) });
        });
        r.прелелиВСтаята = прелелиВ.slice(0, 12); r.прелелиВСтаятаБрой = прелелиВ.length;
        r.разгънати = сгънати.length;
        r.бледи = [].slice.call(корен.querySelectorAll('.jr-card')).filter(function (c) { return parseFloat(getComputedStyle(c).opacity) < 0.9; }).length;
        доклад[с] = r;
      }
    } finally {
      var z2 = document.getElementById('roClose'); if (z2) { try { z2.click(); } catch (e) {} }
      скрий(); window._ldDirect = предиLd; window.scrollTo(0, предиScroll);
    }
    return доклад;
  }

  function кратко(D) {
    var t = {};
    Object.keys(D).forEach(function (k) {
      var x = D[k]; if (x.ГРЕШКА) { t[k] = x.ГРЕШКА; return; }
      t[k] = { htmlРазм: x.разместване, роСкрол: x.роСкрол.roRoom + '/' + x.роСкрол.панел, прелВСтаята: x.прелелиВСтаятаБрой, елементи: x.елементи, карти: x.картиJR, бледи: x.бледи, общоМишени: x.мишени.общо, измерени: x.мишени.измерени, МАЛКИ: x.мишени.малки.length, жълти: x.мишени.жълти.length, безкрайни: x.анимации.безкрайни, ЧЕРВЕНИ: x.анимации.червени.length };
    });
    return t;
  }
  function групи(D) {
    var g = {};
    Object.keys(D).forEach(function (с) {
      var x = D[с]; if (x.ГРЕШКА) return;
      x.мишени.малки.forEach(function (m) {
        var k = m.път.split(' > ').pop();
        if (!g[k]) g[k] = { брой: 0, стаи: {}, минW: 999, минH: 999, примери: [] };
        var o = g[k]; o.брой++; o.стаи[с] = 1; o.минW = Math.min(o.минW, m.w); o.минH = Math.min(o.минH, m.h);
        if (o.примери.length < 2) o.примери.push(m.txt + ' [' + m.w + '×' + m.h + '] ' + m.път);
      });
    });
    return Object.keys(g).map(function (k) { var o = g[k]; return { сел: k, брой: o.брой, стаи: Object.keys(o.стаи).length, мин: o.минW + '×' + o.минH, пример: o.примери.join(' ‖ ') }; }).sort(function (a, b) { return b.брой - a.брой; });
  }
  var СТАИ = ['Бременност', 'Моето бебе', 'Захранване', 'Здраве и SOS', 'Развитие и игри', 'Инструменти', 'Дневник на мама', 'Жената в мен', 'Лабораторията'];
  window.__PZ = { мишени: мишени, анимации: анимации, видим: видим, път: път, уседни: уседни, сканирай: сканирай, обиколка: обиколка, кратко: кратко, групи: групи, СТАИ: СТАИ, разкрий: разкрий, скрий: скрий, спи: спи };
})();
