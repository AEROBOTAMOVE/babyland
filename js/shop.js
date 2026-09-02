// ═══════════════════════════════════════════════════════════
// МОСТЧЕТО КЪМ МАГАЗИНА (план 19, част 12.1)
//
// Това е единственото място, където приложението среща работата на собственика.
//
// ЖЕЛЯЗНИТЕ ПРАВИЛА (12.1.2 · 12.1.3 · 12.1.6):
//   · НИКОГА в „Здраве и SOS“. Там не се продава. Никога.
//   · НИКОГА след червен флаг или флаг за майката — тревогата не се търгува.
//   · НИКОГА в „Дневник на мама“ и „Лабораторията“ — те са нейни, не наши.
//   · МАКСИМУМ ЕДНО мостче на екран.
//   · Честно етикетче „нашият магазин“ — мама да знае, че сме заинтересовани.
//   · Изключваемо от Настройки, без обяснения.
//
// Препоръката ми към собственика е най-тихият вариант. Доверието е капиталът:
// една майка, която усети, че ѝ се продава в момент на страх, не се връща.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { if (window.BL_ZAPIS_PADNA) BL_ZAPIS_PADNA(); return false; } return true; };
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  // 🔒 само истински уеб адрес (М−1: `javascript:` в href се изпълнява)
  function safeUrl(raw) {
    const s = String(raw || '').trim();
    if (!s) return '';
    try {
      const u = new URL(s);
      return (u.protocol === 'http:' || u.protocol === 'https:') ? u.href : '';
    } catch (e) { return ''; }
  }

  // ── КЪДЕ Е ЗАБРАНЕНО (12.1.2) ──
  const ЗАБРАНЕНИ = new Set(['Здраве и SOS', 'Дневник на мама', 'Лабораторията']);

  function включено() {
    return load('bl_shop_off', 0) !== 1 && !!safeUrl(load('bl_shop_url', ''));
  }

  // ── КОНТЕКСТНИТЕ ПОВОДИ (12.1.1) ──
  // Всеки повод се показва САМО в своята стая и само ако мама е стигнала
  // дотам сама. Няма поводи „за всеки случай“.
  const ПОВОДИ = [
    { стая: 'Захранване', след: '.al-row', текст: 'Купички, лъжички и чинийки с вакуум — ако ти трябват за първите лъжички.' },
    { стая: 'Инструменти', след: '.sz-table', текст: 'Дрешки по размерите отгоре — ако точно това търсиш.' },
    { стая: 'Бременност', след: '.bg-prog', текст: 'Каквото липсва от чантата — може и оттук.' },
    { стая: 'Развитие и игри', след: '.hs-grid', текст: 'Ако предпочетеш истинска играчка пред тенджерата — има и такива.' },
    // 12.1.7: „Списъкът преди 40“ — мечтите ѝ, не задачи. Мостчето стои ПОД
    // него и мълчи за конкретика: някои мечти минават през нещо, други —
    // не. Затова е „ако“, а не „ето“. Мечтата не се продава.
    { стая: 'Жената в мен', след: '.wm-bcount', текст: 'Ако някоя от мечтите ти минава през нещо мъничко — то е за ТЕБ, не за бебето.' }
  ];

  function мостче(текст) {
    const url = safeUrl(load('bl_shop_url', ''));
    if (!url) return null;
    const c = el('section', 'shop-bridge');
    // 15.4.4: мама вижда КЪДЕ отива, преди да натисне. Домейнът стои
    // изписан до бутона — не се крие зад „Виж →“. Който показва адреса си,
    // няма какво да крие.
    let домейн = '';
    try { домейн = new URL(url).hostname.replace(/^www\./, ''); } catch (e) {}
    c.innerHTML = `<p class="shop-lbl">🛍️ Нашият магазин</p>
                   <p class="shop-txt">${esc(текст)}</p>`;
    const a = el('a', 'shop-btn', 'Виж →');
    a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    if (домейн) a.setAttribute('aria-label', 'Отваря ' + домейн + ' в нов раздел');
    c.appendChild(a);
    if (домейн) c.appendChild(el('p', 'shop-url', '🔗 отваря <strong>' + esc(домейн) + '</strong> в нов раздел'));
    const off = el('button', 'shop-off', 'скрий тези');
    off.type = 'button';
    off.addEventListener('click', () => {
      save('bl_shop_off', 1);
      document.querySelectorAll('.shop-bridge').forEach(x => x.remove());
    });
    c.appendChild(off);
    return c;
  }

  // ── СЛАГАНЕТО: едно на екран, никога в забранена стая ──
  function сложи(root, стая) {
    if (!включено() || ЗАБРАНЕНИ.has(стая)) return;
    // 12.1.3: ако в чата току-що е имало тревога — нищо не се показва
    if (window.__blAlarm && Date.now() - window.__blAlarm < 10 * 60000) return;
    if (root.querySelector('.shop-bridge')) return;              // 12.1.6: едно на екран
    const п = ПОВОДИ.find(x => x.стая === стая && root.querySelector(x.след));
    if (!п) return;                                              // няма повод → няма мостче
    const м = мостче(п.текст);
    if (!м) return;
    const котва = root.querySelector(п.след);
    const карта = котва.closest('.jr-card') || котва;
    карта.parentNode.insertBefore(м, карта.nextSibling);
  }

  // ── тревогата спира търговията (12.1.3) ──
  // helper.js вдига флаг; тук само го помним. 10 минути тишина след него.
  document.addEventListener('bl:alarm', () => { window.__blAlarm = Date.now(); });

  // ── превключвателят в Настройките (12.1.5) ──
  const prevSettings = window.BL_SETTINGS_CARD;
  if (prevSettings) {
    window.BL_SETTINGS_CARD = function () {
      const c = prevSettings();
      if (safeUrl(load('bl_shop_url', ''))) {
        const w = el('div', 'set-quiet');
        const изкл = load('bl_shop_off', 0) === 1;
        const b = el('button', 'set-quiet-btn', изкл ? '🛍️ Покажи пак предложенията от магазина' : '🛍️ Скрий предложенията от магазина');
        b.type = 'button';
        b.addEventListener('click', () => {
          save('bl_shop_off', изкл ? 0 : 1);
          document.querySelectorAll('.shop-bridge').forEach(x => x.remove());
          c.replaceWith(window.BL_SETTINGS_CARD());
        });
        w.appendChild(b);
        w.appendChild(el('p', 'jr-privacy', изкл
          ? 'Скрити са. Приложението работи точно както преди.'
          : 'Това е нашият магазин — затова сме заинтересовани и го пишем честно. Никога няма да ги видиш в „Здраве и SOS“ или в Дневника.'));
        c.appendChild(w);
      }
      return c;
    };
  }

  // ── свързване: след всяка стая ──
  Object.keys(window.ROOM_FEATURES || {}).forEach(стая => {
    const база = window.ROOM_FEATURES[стая];
    window.ROOM_FEATURES[стая] = root => { база(root); сложи(root, стая); };
  });

  // ── 🔑 05.08 (скептик 134): ВХОДЪТ НА СОБСТВЕНИКА ──
  // Картата „Магазинчето 🛍️“ (extras2.js) е единственото място, което пише
  // bl_shop_url, а тя се рисува само когато адрес ВЕЧЕ има. Тоест изключването
  // и смяната работеха, но ПЪРВОТО включване беше станало невъзможно от
  // приложението — оставаше ръчно писане в localStorage, без проверка на
  // адреса. Тук е поддържаният вход: минава през същия safeUrl, значи
  // `javascript:` не влиза, и връща какво е станало вместо да мълчи.
  // НЕ е карта и няма да е: „сложи линк на магазина“ не е език за мама и не е
  // нейна работа. Адресът живее в паметта на ТОЗИ браузър — настройва се
  // веднъж, на устройството на собственика.
  //   BL_SHOP.задай('https://магазинът.bg')   → включва мостчетата
  //   BL_SHOP.изчисти()                        → изгасва ги напълно
  function задай(адрес) {
    const чист = safeUrl(адрес);
    if (!чист) return { ок: false, защо: 'Само http(s) адрес. Нищо не е записано.' };
    save('bl_shop_url', чист);
    return { ок: true, адрес: чист, бележка: 'Мостчетата светват при следващото влизане в стая. Смяна и изчистване: карта „Магазинчето 🛍️“ в Инструменти.' };
  }
  function изчисти() { save('bl_shop_url', ''); return { ок: true, бележка: 'Мостчетата са изгасени.' }; }

  window.BL_SHOP = { safeUrl, включено, ЗАБРАНЕНИ, задай, изчисти };
})();
