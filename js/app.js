// ═══════════════════════════════════════════
// BABY LAND — интерактивните магии (v3)
// ═══════════════════════════════════════════

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ── „Днес“ — умен начален екран (ако има профил на бебе) ──
function refreshToday() {
  const sec = document.getElementById('todaySection');
  if (!sec || !window.BL_HOME) return;
  const ok = BL_HOME.render(sec);
  sec.hidden = !ok;
  if (ok) requestAnimationFrame(() => sec.querySelector('.reveal')?.classList.add('shown'));
  if (window.BL_BADGES) BL_BADGES.sweep();
}
window.refreshToday = refreshToday;

// ── Инсталационна подкана (Добави ме на екрана) ──
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.BL_INSTALL = e;
  refreshToday();
});
window.refreshToday = refreshToday;
document.addEventListener('DOMContentLoaded', refreshToday);
document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshToday(); });

// ── Тъмен режим (за нощните хранения) + авто по залез ──
(function () {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  const apply = (dark, persist) => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    btn.textContent = dark ? '☀️' : '🌙';
    if (persist) { try { localStorage.setItem('bl_theme', dark ? 'dark' : 'light'); } catch (e) {} }
  };
  let stored = null;
  try { stored = localStorage.getItem('bl_theme'); } catch (e) {}
  const h = new Date().getHours();
  const dark = stored ? stored === 'dark' : (h >= 21 || h < 7); // авто-нощ, докато мама не избере сама
  apply(dark, false);
  btn.addEventListener('click', () => apply(document.documentElement.getAttribute('data-theme') !== 'dark', true));
})();

// ── Появяване на елементите при скрол (стъпаловидно) ──
// Наблюдателят вече е вдигнат в js/store.js — скрипт №2 от 93, не №91 — за да
// не чака целият екран 3.2 MB JavaScript (измерено: 102 ms срещу 451 ms на
// localhost). Тук само досбираме .reveal-ите, появили се между двата скрипта.
// Резервата не е „нищо": ако store.js липсва, показваме всичко, вместо мама да
// гледа празна страница.
if (window.BL_REVEAL) BL_REVEAL.sweep();
else document.querySelectorAll('.reveal').forEach(el => el.classList.add('shown'));

// ── Диригент на сцените: играят само когато се виждат ──
// (SMIL пътечките тръгват с beginElement, за да са в синхрон с CSS цикъла)
function startSmil(el) {
  el.querySelectorAll('animateMotion').forEach((a, i) => {
    setTimeout(() => { try { a.beginElement(); } catch (e) {} }, i * 140);
  });
}
const sceneIO = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const el = entry.target;
    if (entry.isIntersecting) {
      el.classList.add('play');
      el.querySelectorAll('svg').forEach(s => { try { s.unpauseAnimations(); } catch (e) {} });
      if (!reducedMotion) startSmil(el);
    } else {
      el.classList.remove('play');
      el.querySelectorAll('svg').forEach(s => { try { s.pauseAnimations(); } catch (e) {} });
    }
  });
}, { threshold: 0.25 });
document.querySelectorAll('.room-card').forEach(c => sceneIO.observe(c));
const phoneStage = document.getElementById('phoneStage');
if (phoneStage) sceneIO.observe(phoneStage);
// Диригентът е отворен и за сцени, РОДЕНИ ПО-КЪСНО (банерът в стаята се клонира
// чак когато мама отвори стаята — по времето на този ред него още го няма).
// Който се запише, играе само докато се вижда; който не се запише, играе вечно.
// ПЪТ НАЗАД: махни тези три реда и повикванията на BL_SCENES в helper.js —
// зашитият клас `play` в mountBanner върши същото, но без гасене.
window.BL_SCENES = {
  дай: (el) => { if (el) sceneIO.observe(el); },
  вземи: (el) => { if (el) sceneIO.unobserve(el); }
};
if (reducedMotion) {
  document.querySelectorAll('svg').forEach(s => { try { s.pauseAnimations(); } catch (e) {} });
}

// ── 3D наклон + паралакс на слоевете (мишка/стилус; на пръст остава живият свят) ──
if (!reducedMotion) {
  document.querySelectorAll('.room-card').forEach(card => {
    card.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      const r = card.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--rx', `${(-ny * 6).toFixed(2)}deg`);
      card.style.setProperty('--ry', `${(nx * 8).toFixed(2)}deg`);
      card.style.setProperty('--px', nx.toFixed(3));
      card.style.setProperty('--py', ny.toFixed(3));
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--px', '0');
      card.style.setProperty('--py', '0');
    });
  });
}

// ── Частици при докосване на стая ──
const burstEmoji = {
  'Бременност':      ['💕', '💗', '✨', '💖', '⭐', '💞', '🩷', '✦'],
  'Моето бебе':      ['📏', '⭐', '💙', '✨', '🍼', '💫', '📈', '✦'],
  'Захранване':      ['🍓', '🍌', '🥕', '✨', '🍎', '🥄', '💛', '✦'],
  'Здраве и SOS':    ['💚', '🌿', '✨', '🫧', '💙', '🍀', '🌸', '✦'],
  'Дневник на мама': ['💜', '👑', '✨', '💌', '🦋', '💟', '🌙', '✦'],
  'Развитие и игри': ['🧸', '⭐', '🎈', '✨', '🎲', '💛', '🪁', '✦'],
  'Инструменти':     ['🧦', '✅', '✨', '👟', '🎀', '💚', '🧮', '✦']
};

function makeBurst(card) {
  const old = card.querySelector('.burst-layer');
  if (old) old.remove();
  const layer = document.createElement('div');
  layer.className = 'burst-layer';
  const set = burstEmoji[card.dataset.room] || ['✨', '⭐', '💖', '✦', '✨', '⭐', '💖', '✦'];
  set.forEach(e => {
    const s = document.createElement('span');
    s.textContent = e;
    layer.appendChild(s);
  });
  card.appendChild(layer);
  card.classList.add('burst');
  setTimeout(() => { layer.remove(); card.classList.remove('burst'); }, 950);
}

// ── Стаите → взрив + отваряне на стаята с Помощника на мама ──
document.querySelectorAll('.room-card').forEach(card => {
  card.addEventListener('click', () => {
    if (!reducedMotion) makeBurst(card);
    setTimeout(() => {
      if (window.MamaHelper) MamaHelper.open(card.dataset.room);
    }, reducedMotion ? 0 : 380);
  });
});

// ── Демо на дневника — личицата отговарят ──
const moodReply = document.getElementById('moodReply');
document.querySelectorAll('.mood').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mood').forEach(b => b.classList.remove('picked'));
    btn.classList.add('picked');
    moodReply.textContent = btn.dataset.msg;
    moodReply.classList.remove('pop');
    void moodReply.offsetWidth;
    moodReply.classList.add('pop');
  });
});

// ── Телефонът-филмче: Android / iPhone + превъртане по стъпки ──
const phoneMovie = document.getElementById('phoneMovie');
const btnAndroid = document.getElementById('btnAndroid');
const btnIos = document.getElementById('btnIos');

function restartMovie(seekSeconds) {
  if (!phoneMovie || !phoneStage) return;
  phoneMovie.style.setProperty('--seek', `${-seekSeconds}s`);
  phoneStage.classList.remove('play');
  void phoneStage.offsetWidth; // рестарт на всички keyframes
  phoneStage.classList.add('play');
}

if (btnAndroid && btnIos) {
  btnAndroid.addEventListener('click', () => {
    phoneStage.classList.remove('ios');
    btnAndroid.classList.add('active');
    btnIos.classList.remove('active');
    restartMovie(0);
  });
  btnIos.addEventListener('click', () => {
    phoneStage.classList.add('ios');
    btnIos.classList.add('active');
    btnAndroid.classList.remove('active');
    restartMovie(0);
  });
}

const seekTimes = [0, 3.6, 7.44]; // старт на акт 1 / 2 / 3 (12s филм)
document.querySelectorAll('.mdot').forEach(dot => {
  dot.addEventListener('click', () => restartMovie(seekTimes[+dot.dataset.seek] || 0));
});

// ── Активна точка в долната навигация ──
const navMap = new Map();
document.querySelectorAll('.bn-item').forEach(item => {
  const id = decodeURIComponent(item.getAttribute('href')).slice(1);
  const section = document.getElementById(id);
  if (section) navMap.set(section, item);
});
const navIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && navMap.has(entry.target)) {
      document.querySelectorAll('.bn-item').forEach(i => i.classList.remove('bn-active'));
      navMap.get(entry.target).classList.add('bn-active');
    }
  });
}, { threshold: 0.4 });
navMap.forEach((_, section) => navIO.observe(section));

// ── Долната навигация + бутоните отварят реалните стаи ──
document.querySelectorAll('[data-room]').forEach(item => {
  if (item.classList.contains('room-card') || item.classList.contains('td-chip')) return; // те имат собствена логика
  item.addEventListener('click', (e) => {
    if (window.MamaHelper) { e.preventDefault(); MamaHelper.open(item.dataset.room); }
  });
});

// ── „🏠 Начало“ води при мама, не при логото ──
//    Котвата #начало сочи героя — 100svh лого, слоган и покана да разгледа
//    стаите. За майка, която вече има профил, „начало“ е нейното „Днес“,
//    а то стои точно под героя. Досега бутонът я връщаше на рекламния екран
//    и трябваше да бута цял екран нагоре с палец в 3:40 през нощта.
//    Ако „Днес“ е скрито (още няма профил), героят си остава начало.
(function () {
  let дом = null;   // същият прочит на href като горе — котвата е на кирилица
  document.querySelectorAll('.bn-item').forEach(i => {
    const h = i.getAttribute('href') || '';
    if (decodeURIComponent(h).slice(1) === 'начало') дом = i;
  });
  const днес = document.getElementById('todaySection');
  if (!дом || !днес) return;
  navMap.set(днес, дом);          // и точката в лентата да свети вярно
  navIO.observe(днес);
  дом.addEventListener('click', (e) => {
    if (днес.hidden) return;
    e.preventDefault();
    днес.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    document.querySelectorAll('.bn-item').forEach(i => i.classList.remove('bn-active'));
    дом.classList.add('bn-active');
  });
})();

// ── Годината във футъра ──
document.getElementById('year').textContent = new Date().getFullYear();

// ── PWA service worker (само на http/https) ──
// П5: авто-обновяване — щом нова версия поеме управлението, страницата се
// презарежда ВЕДНЪЖ сама (край на „не виждам промените"). Не се презарежда
// при първата инсталация (нямаше предишен контрольор — няма какво да обновяваме).
// 🔴 11.08 (ОС „инсталация и офлайн", ИЗМЕРЕНО, не предположено): това
//    презареждане беше СЛЯПО. Пуснат тест-деплой (смяна на CACHE в sw.js),
//    докато в „Дневник на мама" стоеше започнат ред „Днес се чувствам...":
//    след controllerchange полето беше ПРАЗНО, стаята — затворена, и на мама
//    никой нищо не ѝ каза. Тоест обновяването изяждаше точно това, което тя
//    пише, и то без дума. Сега: пише ли или чете — не я дърпаме изпод краката,
//    а ѝ оставяме лентичка и ТЯ решава кога. Празен екран → както си беше.
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  const имашеКонтрольор = !!navigator.serviceWorker.controller;
  let презаредено = false;

  // започнала ли е нещо, което презареждането би изтрило
  const мамаЕЗаета = () => {
    const полета = document.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), textarea');
    for (let i = 0; i < полета.length; i++) {
      if (полета[i].value && полета[i].value.trim()) return true;   // пише
    }
    // отворена стая, статия, търсене, въведение или диалог — чете в момента
    return !!document.querySelector('#roomOverlay:not([hidden]), #artOverlay:not([hidden]), #searchOverlay:not([hidden]), #onbOverlay:not([hidden]), .md-veil');
  };

  const лентаЗаНоваВерсия = () => {
    if (document.getElementById('blNewVer')) return;    // казва се ВЕДНЪЖ, без опяване
    const л = document.createElement('div');
    л.id = 'blNewVer';
    л.setAttribute('role', 'status');
    л.style.cssText = 'position:fixed;left:12px;right:12px;bottom:calc(86px + env(safe-area-inset-bottom));z-index:9999;max-width:520px;margin:0 auto;display:flex;gap:10px;align-items:center;padding:12px 14px;border-radius:18px;background:var(--card,#fff);color:var(--ink,#5a5470);border:1px solid var(--line,#f0dbe8);box-shadow:0 12px 32px rgba(150,130,180,.3);line-height:1.35';
    const т = document.createElement('span');
    т.style.cssText = 'flex:1';
    т.textContent = '💜 Има нова версия. Ще я пусна, щом ти си готова — не бързам.';
    const бутон = document.createElement('button');
    бутон.type = 'button';
    бутон.textContent = 'Обнови';
    бутон.style.cssText = 'flex:0 0 auto;border:0;border-radius:14px;padding:9px 16px;background:var(--pink-deep,#e56ba4);color:#fff;font:inherit;font-weight:700;cursor:pointer';
    бутон.addEventListener('click', () => location.reload());
    const скрий = document.createElement('button');
    скрий.type = 'button';
    скрий.setAttribute('aria-label', 'Скрий съобщението');
    скрий.textContent = '✕';
    скрий.style.cssText = 'flex:0 0 auto;border:0;background:transparent;color:var(--ink-soft,#6f6980);font:inherit;cursor:pointer;padding:6px';
    скрий.addEventListener('click', () => л.remove());
    л.appendChild(т); л.appendChild(бутон); л.appendChild(скрий);
    document.body.appendChild(л);
  };

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (презаредено || !имашеКонтрольор) return;
    презаредено = true;
    if (мамаЕЗаета()) лентаЗаНоваВерсия();
    else location.reload();
  });
  navigator.serviceWorker.register('sw.js').then(reg => {
    if (reg.update) { try { reg.update(); } catch (e) {} }   // провери за нова версия още сега
  }).catch(() => {});
}

// ── проход 3 S1: трайно съхранение — без него браузърът има право да изтрие
//    целия дневник на мама при натиск за място (а Safari чисти след 7 дни).
//    Питаме веднъж, тихо; ако вече е трайно или бъде отказано — просто мълчим.
if (navigator.storage && navigator.storage.persist && navigator.storage.persisted) {
  navigator.storage.persisted().then(вече => { if (!вече) navigator.storage.persist().catch(() => {}); }).catch(() => {});
}
