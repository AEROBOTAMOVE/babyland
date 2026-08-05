// ═══════════════════════════════════════════════════════════
// ИСТОРИЯТА НА СЪНЯ (план 19, основата под 4.9.5)
//
// Планът казваше „опитът да чете САМ данните от bl_sleep“. Проверих: bl_sleep
// пази САМО днешния ден и се нулира всяка нощ (rooms2.js: `if (s.d !== t)`).
// История НЯМА никъде. Значи нямаше какво да се чете.
//
// Този модул я създава — тихо, без нова карта и без да пипа bl_sleep:
// при пускане на приложението, ако в bl_sleep стои ВЧЕРАШЕН ден, сборът му
// се прибира в bl_sleep_hist ПРЕДИ rooms2 да го изтрие.
//
// ЧЕСТНО: историята тръгва от деня, в който това влезе. Минало не измисляме.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const localDate = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const today = () => localDate(new Date());

  const K = 'bl_sleep_hist';   // { 'YYYY-MM-DD': минути }

  // Сборът на затворените отрязъци. Отворен отрязък (мама е забравила да
  // спре брояча) НЕ се брои — не знаем кога е свършил и не го измисляме.
  function минути(s) {
    if (!s || !Array.isArray(s.segs)) return 0;
    let ms = 0;
    s.segs.forEach(x => {
      if (!x || typeof x.s !== 'number' || typeof x.e !== 'number') return;
      const d = x.e - x.s;
      if (d > 0 && d < 86400000) ms += d;
    });
    return Math.round(ms / 60000);
  }

  // прибира вчерашното, ако още стои непокътнато
  function прибери() {
    let s = load('bl_sleep', null);
    if (!s || !s.d || s.d === today()) return;      // няма или е днешно — не пипаме
    // проход 3 T7: нощният сън през полунощ. Ако ВЧЕРА е останал ОТВОРЕН отрязък
    // (заспал снощи, буден днес), разцепваме в полунощ: вчерашната част влиза в
    // историята, остатъкът продължава като днешен отворен сън. Само за ВЧЕРА —
    // по-стар изоставен брояч не пренасяме (не знаем колко дни е стоял).
    // 🔴 04.08 (обиколка, стая Моето бебе): горният коментар обещава „не го
    //    измисляме“, а точно това се случваше. Разцепването в полунощ нямаше
    //    НИКАКЪВ таван: мама натиска „😴 Заспа“ в 9 сутринта и забравя →
    //    вчера получава 15 часа сън, а днес стартира с включен брояч от 00:00
    //    и в 9 сутринта картата пише „9 ч“. Едно забравено докосване правеше
    //    ДВЕ измислени числа. После „Сънят по месеци“ ѝ показва 14 ч средно,
    //    а тя знае, че бебето спи 8 — и спира да вярва на приложението.
    //    Нощен сън над 12 часа до полунощ не е сън, а забравен брояч.
    const ТАВАН = 12 * 3600000;
    if (typeof s.open === 'number') {
      const вчера = localDate(new Date(Date.now() - 86400000));
      const полунощ = new Date(today() + 'T00:00:00').getTime();
      if (s.d === вчера && s.open < полунощ) {
        if (полунощ - s.open <= ТАВАН) {
          // истински нощен сън през полунощ — вчерашната част влиза, остатъкът продължава
          s = Object.assign({}, s, { segs: (Array.isArray(s.segs) ? s.segs : []).concat({ s: s.open, e: полунощ }) });
          save('bl_sleep', { d: today(), segs: [], open: полунощ });   // сутрин: бутонът е „🌅 Събуди се"
        } else {
          // забравен брояч — нищо не се измисля и нищо не се пренася
          s = Object.assign({}, s, { open: null });
          save('bl_sleep', { d: today(), segs: [], open: null });
        }
      }
    }
    const h = load(K, {});
    if (h[s.d] != null) return;                      // вече прибрано — не удвоявай
    const m = минути(s);
    if (m <= 0) return;                              // празен ден не се пази
    h[s.d] = m;
    // пази последните 120 дни — толкова стигат за всеки опит
    const ключове = Object.keys(h).sort();
    while (ключове.length > 120) delete h[ключове.shift()];
    save(K, h);
  }

  // ── четене за другите модули ──
  const чети = () => load(K, {});

  // сборът за ДНЕС (от живия bl_sleep, не от историята)
  function днес() {
    const s = load('bl_sleep', null);
    return (s && s.d === today()) ? минути(s) : 0;
  }

  // средното от дните ПРЕДИ дадена дата (базата, спрямо която сравняваме)
  function средно(преди, максДни) {
    const h = чети();
    const дни = Object.keys(h).filter(d => !преди || d < преди).sort().slice(-(максДни || 14));
    if (!дни.length) return null;
    return Math.round(дни.reduce((a, d) => a + h[d], 0) / дни.length);
  }

  // колко нощи изобщо имаме
  const брой = () => Object.keys(чети()).length;

  прибери();
  window.BL_SLEEPHIST = { чети, днес, средно, брой, минути, прибери };

  // ── Г1+Г2 (план 23): и другите дневни броячи не бива да се губят ──
  // „Вода днес“ и „Изпито мл“ се нулираха в полунощ БЕЗ следа. Прибираме
  // вчерашното по същия начин: рано, преди картата да го изтрие.
  function прибериДневни() {
    [['bl_water', 'bl_water_hist'], ['bl_ml', 'bl_ml_hist']].forEach(([жив, хист]) => {
      const s = load(жив, null);
      if (!s || !s.d || s.d === today()) return;
      if (typeof s.n !== 'number' || s.n <= 0) return;
      const h = load(хист, {});
      if (h[s.d] != null) return;                    // вече прибрано
      h[s.d] = s.n;
      const кл = Object.keys(h).sort();
      while (кл.length > 120) delete h[кл.shift()];
      save(хист, h);
    });
    // и СЕДМИЧНАТА касичка „време за мен“ — нулира се всеки понеделник,
    // а миналите седмици се губеха. Прибираме изтеклата седмица.
    const пон = (() => { const n = new Date(); const p = new Date(n); p.setDate(n.getDate() - ((n.getDay() + 6) % 7)); return localDate(p); })();
    const м = load('bl_metime', null);
    if (м && м.week && м.week !== пон && typeof м.minutes === 'number' && м.minutes > 0) {
      const h = load('bl_metime_hist', {});
      if (h[м.week] == null) {
        h[м.week] = м.minutes;
        const кл = Object.keys(h).sort();
        while (кл.length > 60) delete h[кл.shift()];
        save('bl_metime_hist', h);
      }
    }
  }
  прибериДневни();
  window.BL_DAYHIST = {
    вода: () => load('bl_water_hist', {}),
    мл: () => load('bl_ml_hist', {}),
    време: () => load('bl_metime_hist', {}),   // проход 3 T22: касичката „време за мен" вече се ЧЕТЕ
    приберете: прибериДневни
  };
})();
