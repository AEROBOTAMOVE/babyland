// ═══════════════════════════════════════════════════════════
// СНИМКИТЕ НА ЕДНО МЯСТО (план 19, част 12.12) — в Инструменти
//
// 12.12.1  Всички снимки, филтър по вид
// 12.12.2  Колко място заемат + чистене
// 12.12.5  ⚠️ ПРАВИЛОТО: снимките на бебето НЕ се качват никъде. Никога.
//
// Снимките са пръснати в 8 ключа (месечни, на деня, коремчето, рисунки,
// обриви, храна-физиономии). Тук се събират, за да ги виждаш наведнъж —
// и за да можеш да чистиш, ако телефонът се напълни.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const card = t => { const c = el('section', 'jr-card'); c.appendChild(el('h4', 'jr-title', t)); return c; };
  const sub = s => '<span class="jr-sub">' + s + '</span>';

  // ── откъде идват снимките (вид, ключ, форма) ──
  const ИЗТОЧНИЦИ = [
    { вид: 'месечни', e: '📅', k: 'bl_photos', форма: 'obj' },        // {месец: dataURL}
    { вид: 'на деня', e: '📸', k: 'bl_dayphoto', форма: 'obj' },      // {дата: dataURL}
    { вид: 'коремчето', e: '🤰', k: 'bl_bump', форма: 'obj' },        // {седмица: dataURL}
    { вид: 'рисунки', e: '🎨', k: 'bl_art', форма: 'arr-img' },       // [{img, ts}]
    // 🔴 05.08 (СКЕПТИКЪТ към №181): картата, която пълнеше bl_art, е махната от
    //    rooms3.js — новите драскулки отиват САМО в bl_art_months, а той не беше
    //    тук. Тоест „Всичките ти снимки“ повече никога нямаше да види НОВА рисунка.
    //    Старите са прелети в bl_art_months, затова дедуп по ts срещу bl_art —
    //    иначе всяка стара излиза по два пъти и в брояча, и в лентата.
    { вид: 'рисунки', e: '🎨', k: 'bl_art_months', форма: 'arr-img', дедуп: 'bl_art' },
    { вид: 'физиономии', e: '😋', k: 'bl_food_faces', форма: 'arr-img' }
  ];

  function събери() {
    const всички = [];
    ИЗТОЧНИЦИ.forEach(и => {
      const raw = load(и.k, и.форма === 'obj' ? {} : []);
      if (и.форма === 'obj') {
        Object.entries(raw || {}).forEach(([ключ, dataURL]) => {
          if (typeof dataURL === 'string' && dataURL.startsWith('data:')) {
            всички.push({ вид: и.вид, e: и.e, img: dataURL, key: и.k, sub: ключ });
          }
        });
      } else {
        (raw || []).forEach(x => {
          if (x && typeof x.img === 'string' && x.img.startsWith('data:')) {
            // прелетите записи носят СЪЩИЯ ts в двата ключа — броим ги веднъж
            if (и.дедуп && x.ts && всички.some(y => y.key === и.дедуп && y.sub === x.ts)) return;
            всички.push({ вид: и.вид, e: и.e, img: x.img, key: и.k, sub: x.ts || '' });
          }
        });
      }
    });
    return всички;
  }

  function размерВПамет() {
    let bytes = 0;
    ИЗТОЧНИЦИ.forEach(и => { bytes += (localStorage.getItem(и.k) || '').length; });
    // медията вече може да е в IndexedDB — питаме store-а за истинския размер
    if (window.BL_STORE && BL_STORE.usage) {
      const u = BL_STORE.usage();
      return u.mediaKB || Math.round(bytes / 1024);
    }
    return Math.round(bytes / 1024);
  }

  function photoHubCard() {
    const c = card('Всичките ти снимки 📸 ' + sub('на едно място'));
    const снимки = събери();
    const kb = размерВПамет();

    // 12.12.2: колко място
    const размер = kb > 1024 ? (kb / 1024).toFixed(1) + ' MB' : kb + ' KB';
    c.appendChild(el('p', 'jr-privacy',
      снимки.length
        ? `<strong>${снимки.length}</strong> снимки · заемат <strong>${размер}</strong> от паметта на телефона.`
        : 'Още няма снимки. Като добавиш от галериите в стаите, ще се събират тук.'));

    // 12.12.5: ЖЕЛЯЗНОТО правило — честно, отгоре
    c.appendChild(el('p', 'jr-privacy',
      '🔒 Тези снимки са <strong>само на този телефон</strong>. Приложението не ги качва никъде и не ги изпраща на никого — затова и никой освен теб не ги вижда. За да не ги загубиш при смяна на телефон: направи си резервно копие (💾 картата е по-горе в това кътче).'));

    if (!снимки.length) return c;

    // 12.12.1: филтър по вид
    const видове = ['всички'].concat([...new Set(снимки.map(x => x.вид))]);
    const филтър = el('div', 'jr-quick');
    let активен = 'всички';
    const grid = el('div', 'ph-grid');
    const рисувай = () => {
      grid.innerHTML = '';
      снимки.filter(x => активен === 'всички' || x.вид === активен)
        .slice(-60)
        .forEach(x => {
          const cell = el('div', 'ph-cell');
          cell.innerHTML = `<img src="${esc(x.img)}" alt=""><span class="ph-tag">${x.e}</span>`;
          grid.appendChild(cell);
        });
    };
    видове.forEach(в => {
      const b = el('button', 'jr-chip' + (в === 'всички' ? ' on' : ''), в);
      b.type = 'button';
      b.addEventListener('click', () => {
        активен = в;
        филтър.querySelectorAll('.jr-chip').forEach(x => x.classList.remove('on'));
        b.classList.add('on'); рисувай();
      });
      филтър.appendChild(b);
    });
    c.appendChild(филтър); c.appendChild(grid); рисувай();

    // 12.12.3: свали всичките наведнъж — не за архив (той е в копието),
    // а за да ги пренесеш в галерията на телефона.
    const свали = el('button', 'jr-btn ph-export', '⬇️ Свали всичките снимки (' + снимки.length + ')');
    свали.type = 'button';
    свали.addEventListener('click', async () => {
      свали.disabled = true;
      const дай = снимки.filter(x => активен === 'всички' || x.вид === активен);
      for (let i = 0; i < дай.length; i++) {
        свали.textContent = 'Свалям… ' + (i + 1) + '/' + дай.length;
        try {
          const a = document.createElement('a');
          a.href = дай[i].img;
          a.download = 'baby-land-' + (дай[i].вид || 'снимка') + '-' + (i + 1) + '.jpg';
          a.click();
          await new Promise(r => setTimeout(r, 350));       // браузърът не обича залп
        } catch (e) {}
      }
      свали.textContent = 'Готово! 💜'; свали.disabled = false;
      setTimeout(() => свали.textContent = '⬇️ Свали всичките снимки (' + снимки.length + ')', 2000);
    });
    c.appendChild(свали);
    c.appendChild(el('p', 'jr-privacy',
      'Изтриване на конкретна снимка става от самата галерия, откъдето си я сложила. Тук ги гледаш всичките заедно.'));
    return c;
  }

  window.BL_PHOTOS = { събери, размерВПамет };

  // ── свързване: в Инструменти ──
  const база = window.ROOM_FEATURES && window.ROOM_FEATURES['Инструменти'];
  if (база) window.ROOM_FEATURES['Инструменти'] = root => { база(root); root.appendChild(photoHubCard()); };
})();
