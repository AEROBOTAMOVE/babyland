// ═══════════════════════════════════════════════════════════
// 🚪🎈 СТАЯТА ЖИВЕЕ — порталът + нишката (проход 5, вълна 2)
//
// ПОРТАЛЪТ: входът в стая е събитие — завеса в цвета на стаята
// (--rmx-a/--rmx-b от анимационната азбука в anim.css) + печатът-емоджи
// на помощничката. „ЕДНА врата": ако мама влиза от къщичка (ирисът на
// херото е на екрана), завесата се пропуска — остава само печатът,
// иначе церемонията става двойна (правилото на арт-директора).
//
// НИШКАТА: скролът има водач — тънка копринена нишка по върха на панела
// се изпълва с цвета на стаята, емоджито на стаята пътува по нея; стигне
// ли края — мъничко празнува. rAF-гейт, passive, само transform.
//
// ЗАРЕЖДА СЕ СЛЕД polish.js (обвива вече обвитото open — същият модел).
// Под reduced-motion нищо не се монтира.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';
  var reduce = false;
  try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  // характерът на всяка стая: печат + вид на портала (една механика, три одежди)
  var ХАРАКТЕР = {
    'Бременност':      { e: '🌸', вид: 'bloom' },
    'Моето бебе':      { e: '🍼', вид: 'cloud' },
    'Захранване':      { e: '🍓', вид: 'bloom' },
    'Здраве и SOS':    { e: '💚', вид: 'cloud' },
    'Дневник на мама': { e: '🌙', вид: 'star' },
    'Развитие и игри': { e: '✨', вид: 'star' },
    'Инструменти':     { e: '🎀', вид: 'cloud' },
    'Жената в мен':    { e: '💃', вид: 'star' },
    'Лабораторията':   { e: '🔬', вид: 'cloud' }
  };

  function портал(room) {
    if (reduce) return;
    var ov = document.getElementById('roomOverlay');
    var panel = ov && ov.querySelector('.ro-panel');
    if (!panel) return;
    // бърза смяна на стаи: старият воал (живее 950мс) не бива да блокира новия
    var стар = panel.querySelector('.rmx-veil');
    if (стар) стар.remove();
    var х = ХАРАКТЕР[room] || { e: '🏠', вид: 'cloud' };
    var v = document.createElement('div');
    // „една врата": ирисът от къщичката вече боядисва прехода → само печатът
    var самоПечат = !!document.querySelector('.ld-iris');
    v.className = 'rmx-veil rmx-' + х.вид + (самоПечат ? ' rmx-lite' : '');
    v.setAttribute('aria-hidden', 'true');
    v.innerHTML = (самоПечат ? '' :
      '<div class="rmx-half rmx-top"></div><div class="rmx-half rmx-bot"></div>') +
      '<span class="rmx-seal">' + х.e + '</span>';
    panel.appendChild(v);
    // порталът живее под секунда и се самопочиства (НЕ луп)
    setTimeout(function () { if (v && v.remove) v.remove(); }, 950);
  }

  // ═══════════ 🎈 нишката ═══════════
  var ВОДАЧ = {
    'Бременност': '🌸', 'Моето бебе': '🍼', 'Захранване': '🍓',
    'Здраве и SOS': '💚', 'Дневник на мама': '🌙', 'Развитие и игри': '✨',
    'Инструменти': '🎀', 'Жената в мен': '💃', 'Лабораторията': '🔬'
  };

  function нишка(room) {
    if (reduce) return;
    var panel = document.querySelector('.ro-panel');
    var box = document.getElementById('roRoom');
    if (!panel || !box) return;
    var т = panel.querySelector('.rmx-thread');
    if (!т) {
      т = document.createElement('div');
      т.className = 'rmx-thread';
      т.setAttribute('aria-hidden', 'true');
      т.innerHTML = '<div class="rmx-fill"></div><span class="rmx-walker">🎈</span>';
      panel.appendChild(т);
    }
    // нулиране за новата стая
    т.querySelector('.rmx-walker').textContent = ВОДАЧ[room] || '🎈';
    т.querySelector('.rmx-fill').style.transform = 'scaleX(0)';
    т.querySelector('.rmx-walker').style.transform = 'translateX(0)';
    т.querySelector('.rmx-walker').classList.remove('rmx-done');
    т._готово = false;

    if (box._нишка) return;   // закача се веднъж за живота на box-а
    box._нишка = true;
    var тик = false, послПоз = -1;
    function обнови() {
      var т2 = panel.querySelector('.rmx-thread');
      if (!т2 || box.hidden) return;
      var макс = box.scrollHeight - box.clientHeight;
      var p = макс > 40 ? Math.min(1, box.scrollTop / макс) : 0;
      if (box.scrollTop === послПоз) return;   // нищо ново — нула работа
      послПоз = box.scrollTop;
      т2.querySelector('.rmx-fill').style.transform = 'scaleX(' + p + ')';
      var w = т2.querySelector('.rmx-walker');
      w.style.transform = 'translateX(' + Math.round(p * (т2.clientWidth - 24)) + 'px)';
      if (p > 0.97 && !т2._готово) {   // обходи стаята — мъничък празник
        т2._готово = true;
        w.classList.add('rmx-done');
        if (window.BL_FX) BL_FX.buzz(10);
      }
    }
    box.addEventListener('scroll', function () {
      if (тик) return;
      тик = true;
      requestAnimationFrame(function () { тик = false; обнови(); });
    }, { passive: true });
    // колан и тиранти: тих тик — някои webview-та цедят scroll-събитията;
    // сравнението с послПоз го прави безплатен, чисти се сам при откачане
    var тмр = setInterval(function () {
      if (!box.isConnected) { clearInterval(тмр); return; }
      обнови();
    }, 700);
  }

  // ═══════════ ✨ П5 А4: искрата на стаята — допирът има характер ═══════════
  // Кръгчето на anim.js се обагря по стаята (--rmx-tap), а радостните повърхности
  // пускат искрица-емоджи от темата на стаята (BL_CONF_THEME от polish.js).
  // Троттъл 600ms: акцент, не спам. Съдийски фикс: БЕЗ .rh-sos-jump —
  // никой не празнува на път към спешните номера.
  var ТАПЦВЯТ = {
    'Бременност': 'rgba(247,168,203,.32)', 'Моето бебе': 'rgba(143,192,232,.32)',
    'Захранване': 'rgba(247,185,141,.34)', 'Здраве и SOS': 'rgba(159,216,198,.36)',
    'Дневник на мама': 'rgba(203,188,236,.36)', 'Развитие и игри': 'rgba(245,212,126,.36)',
    'Инструменти': 'rgba(159,216,198,.32)', 'Жената в мен': 'rgba(242,145,189,.34)',
    'Лабораторията': 'rgba(217,189,144,.34)'
  };
  var РАДОСТ = '.jr-btn,.jr-mood,.jr-win,.fb-btn,.jr-chip,.ck-st';
  var искриСлойЕл = null, последнаИскра = 0;
  function искра(x, y) {
    if (reduce) return;
    var сега = Date.now();
    if (сега - последнаИскра < 600) return;   // 1 искра на 600ms, не дъжд
    последнаИскра = сега;
    if (!искриСлойЕл || !искриСлойЕл.isConnected) {
      искриСлойЕл = document.createElement('div');
      искриСлойЕл.className = 'rmx-sparklayer';
      document.body.appendChild(искриСлойЕл);
    }
    var тема = window.BL_CONF_THEME;     // характерът на стаята (polish.js)
    var е = (тема && тема.length) ? тема[Math.floor(Math.random() * тема.length)] : '✨';
    var s = document.createElement('span');
    s.className = 'rmx-spark';
    s.textContent = е;
    s.style.left = x + 'px';
    s.style.top = y + 'px';
    s.style.setProperty('--sp-r', (Math.random() * 40 - 20) + 'deg');
    искриСлойЕл.appendChild(s);
    setTimeout(function () { if (s && s.remove) s.remove(); }, 900);   // еднократно, НЕ луп
  }
  document.addEventListener('pointerdown', function (e) {
    try {
      var t = e.target && e.target.closest ? e.target.closest(РАДОСТ) : null;
      if (!t || t.disabled) return;
      if (e.clientX == null) return;
      искра(e.clientX, e.clientY);
    } catch (err) {}
  }, { passive: true });

  // 🌌 П5-Д B1: аврората — мека мъгла в цвета на стаята зад #roRoom
  function аврора() {
    if (reduce) return;
    var box = document.getElementById('roRoom');
    if (!box || box.querySelector(':scope > .rmx-aurora')) { // веднъж на живота на box-а — рестартирай fade
      var ex = box && box.querySelector(':scope > .rmx-aurora');
      if (ex) { ex.style.animation = 'none'; void ex.offsetWidth; ex.style.animation = ''; }
      return;
    }
    var a = document.createElement('div');
    a.className = 'rmx-aurora'; a.setAttribute('aria-hidden', 'true');
    a.innerHTML = '<span class="rmx-blob b1"></span><span class="rmx-blob b2"></span><span class="rmx-blob b3"></span>';
    box.appendChild(a);   // ПОСЛЕДНО дете → не разваля :nth-child на картите (z-index я държи отзад)
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!window.MamaHelper || !MamaHelper.open) return;
    var баз = MamaHelper.open;
    MamaHelper.open = function (room) {
      баз(room);
      try { аврора(); } catch (e) {}
      try { портал(room); } catch (e) {}
      try { нишка(room); } catch (e) {}
      // А4: кръгчето на допира се обагря по стаята (слоят е на body → варът на корена)
      try { document.documentElement.style.setProperty('--rmx-tap', ТАПЦВЯТ[room] || 'rgba(150,130,180,.28)'); } catch (e) {}
    };
  });
})();
