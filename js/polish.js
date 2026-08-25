// ═══════════════════════════════════════════════════════════
// POLISH — ГОЛЯМОТО ИЗГЛАЖДАНЕ (план 13, Ш1–Ш7)
// Секции • сгъване • 📌 закачане • медальони • стъпаловидно влизане
// свайп на табове • „+“ бутон • дневен бриф • нуджове • настройки
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { if (window.BL_ZAPIS_PADNA) BL_ZAPIS_PADNA(); return false; } return true; };
  const localDate = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const today = () => localDate(new Date());
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  // ═══════════ Ш1: СЕКЦИИ + СГЪВАНЕ + ЗАКАЧАНЕ + УМНА ПОДРЕДБА ═══════════

  const SECTIONS = [
    ['pin', '📌 Моите закачени'],
    ['daily', '⚡ Всеки ден'],
    ['tools', '🧮 Инструменти'],
    ['mem', '💎 Спомени'],
    ['more', '💛 Още']
  ];
  const SEC_DAILY = /как си|минутка|разходка|вода днес|изпито|пелени|сънят днес|кога яде|кърмене-таймер|дъгата|подканата|време за мен|дневник на даденото|температурен/i;
  const SEC_MEM = /лексикон|фото|лента|гласови|звукови|писм|съзвезд|облак|витрина|дърво|истори|годишник|рекорд|драскул|капсул|медальон|споменче|снимка на деня|огледало|първите|мигове|приказка|реакция 😋/i;
  const SEC_TOOLS = /калкулатор|брояч|планер|чеклист|конвертор|размер|бюджет|картичк|паспорт|бележка за прегледа|аптечка|списък|меню|генератор|термин|имена|ключалк|резервно|шрифт|лампа|касичка|гардероб|звуци|магазин|план за раждане|наддаване|часовник|какво за обяд|какво умее|какво да правим|профил|имунизац|таймер|копие|позвъни|sos|контакти/i;

  function cardKey(room, card) {
    const t = card.querySelector('.jr-title');
    // 05.08 (одит г04, №336): ключът идва само от заглавието — а Лабораторията
    // при два едновременни опита рисува две карти с ЕДНАКВО заглавие и те си
    // делят закачането и сгъването. Картата може да добави свой различител.
    // Без атрибута ключът е буквално старият — заварените закачания не мърдат.
    const екстра = card.dataset && card.dataset.blkeyExtra ? '|' + card.dataset.blkeyExtra : '';
    return room + '|' + (t ? t.childNodes[0].textContent.trim().slice(0, 30) : 'x') + екстра;
  }
  function sectionFor(card, room) {
    const t = (card.querySelector('.jr-title') || {}).textContent || '';
    // стаи със СВОИ секции (напр. Дневникът) командват сами
    const own = window.BL_ROOM_SECTIONS && window.BL_ROOM_SECTIONS[room];
    if (own) return own.match(t);
    if (SEC_DAILY.test(t)) return 'daily';
    if (SEC_MEM.test(t)) return 'mem';
    if (SEC_TOOLS.test(t)) return 'tools';
    return 'more';
  }

  function organize(root, room) {
    const cards = [...root.querySelectorAll(':scope > .jr-card')];
    if (cards.length < 6) { stagger(cards); medallions(cards); return; } // малките стаи остават прости
    const pins = load('bl_pins', {});
    const folds = load('bl_folds', {});
    const use = load('bl_carduse', {});

    const own = window.BL_ROOM_SECTIONS && window.BL_ROOM_SECTIONS[room];
    const SECS = own ? [['pin', '📌 Моите закачени']].concat(own.sections) : SECTIONS;

    // групиране
    const groups = {};
    SECS.forEach(([id]) => { groups[id] = []; });
    cards.forEach(c => {
      const key = cardKey(room, c);
      c.dataset.blkey = key;
      const g = pins[key] ? 'pin' : sectionFor(c, room);
      (groups[g] || (groups[g] = [])).push(c);
    });
    // умна подредба: по употреба (стабилна — при равни пази реда)
    Object.keys(groups).forEach(g => {
      if (g === 'pin' || (own && own.keepOrder)) return; // своите секции пазят авторския ред
      groups[g].sort((a, b) => (use[b.dataset.blkey] || 0) - (use[a.dataset.blkey] || 0));
    });

    // бърза навигация + търсачка в стаята
    const nav = el('div', 'sec-nav');
    root.innerHTML = '';
    root.appendChild(nav);
    const find = el('input', 'sec-find');
    find.type = 'search'; find.placeholder = '🔍 в стаята…';
    find.addEventListener('input', () => {
      const q = find.value.toLowerCase().trim();
      root.querySelectorAll('.jr-card').forEach(c => {
        // 12.7.5: търси и в ТЕКСТА на картата, не само в заглавието — така
        // „температура“ намира картата, дори да се казва „Аптечката“.
        const t = (c.querySelector('.jr-title') || {}).textContent || '';
        const цялото = q && q.length >= 3 ? (c.textContent || '') : t;
        c.style.display = !q || t.toLowerCase().includes(q) || цялото.toLowerCase().includes(q) ? '' : 'none';
      });
      root.querySelectorAll('.sec-head').forEach(h => { h.style.display = q ? 'none' : ''; });
    });
    nav.appendChild(find);

    let all = [];
    const built = [];
    SECS.forEach(([id, label]) => {
      if (!groups[id] || !groups[id].length) return;
      const head = el('div', 'sec-head', label + ` <span class="sec-n">${groups[id].length}</span>`);
      head.id = 'sec-' + id;
      root.appendChild(head);
      const chip = el('button', 'sec-chip', label);
      chip.type = 'button';
      chip.addEventListener('click', () => head.scrollIntoView({ behavior: 'smooth', block: 'start' }));
      nav.appendChild(chip);
      groups[id].forEach(c => { root.appendChild(c); all.push(c); });
      built.push([id, label, groups[id]]);
    });

    all.forEach(c => decorate(c, room, cards.length >= 10));
    stagger(all); medallions(all);
    // 📖 съдържание: „какво има в тази стая“ — всичко изписано
    if (own && own.toc) mountToc(root, nav, built, all.length);
  }

  // ── 📖 картата-съдържание (изписва ВСИЧКО в стаята) ──
  function mountToc(root, nav, built, total) {
    const toc = el('section', 'jr-card toc-card');
    toc.innerHTML = `<h4 class="jr-title">Какво има в тази стая 📖 <span class="jr-sub">${total} кътчета — докосни, за да скочиш</span></h4>`;
    built.forEach(([id, label, cards]) => {
      const g = el('div', 'toc-g');
      g.innerHTML = `<p class="toc-h">${label}</p>`;
      const row = el('div', 'toc-row');
      cards.forEach(c => {
        const t = c.querySelector('.jr-title');
        const name = t ? [...t.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim() : '';
        const em = (t && t.querySelector('.jr-medal')) ? t.querySelector('.jr-medal').textContent : '•';
        const b = el('button', 'toc-b', `${esc(em)} ${esc(name)}`);   // 14.3.11: заглавие може да носи името на бебето
        b.type = 'button';
        b.addEventListener('click', () => {
          c.classList.remove('folded');
          c.scrollIntoView({ behavior: 'smooth', block: 'start' });
          c.classList.remove('toc-flash'); void c.offsetWidth; c.classList.add('toc-flash');
          const f = load('bl_folds', {}); delete f[c.dataset.blkey]; save('bl_folds', f);
        });
        row.appendChild(b);
      });
      g.appendChild(row);
      toc.appendChild(g);
    });
    root.insertBefore(toc, nav.nextSibling);
  }

  // 📌 + сгъване върху всяка карта
  // карта БЕЗ действен контрол (само текст) = справочна → „четат се веднъж"
  const NO_FOLD = /🚨|спешно|сос|😱|опасн|кърви|кръв|линейк|112|веднага|задав|не диша|посиня|гърч|отров|изгаряне|припад/i;
  function decorate(card, room, big) {
    const title = card.querySelector('.jr-title');
    if (!title || title.querySelector('.pin-btn')) return;
    const key = card.dataset.blkey;

    // 10.3.3: четецът на екрана намираше 143 бутона в една дълга каша —
    // всеки с име, но без да казва В КОЯ карта е. Сега всяка карта е
    // именувано кътче: незрящата майка може да ги прескача една по една.
    if (!card.getAttribute('role')) {
      const име = [...title.childNodes].filter(n => n.nodeType === 3)
        .map(n => n.textContent).join('').trim() || title.textContent.trim();
      if (име) {
        card.setAttribute('role', 'region');
        card.setAttribute('aria-label', име);
      }
    }
    const pins = () => load('bl_pins', {});
    const pin = el('button', 'pin-btn' + (pins()[key] ? ' on' : ''), pins()[key] ? '📌' : '📍');
    pin.type = 'button'; pin.setAttribute('aria-label', 'Закачи най-отгоре');
    pin.addEventListener('click', (e) => {
      e.stopPropagation();
      const p = pins();
      if (p[key]) delete p[key]; else p[key] = 1;
      save('bl_pins', p);
      if (window.BL_FX) BL_FX.buzz(8);
      // мигновено пренареждане: отвори наново стаята
      if (window.MamaHelper) { MamaHelper.close(); MamaHelper.open(room); }
    });
    title.appendChild(pin);
    // сгъване с докосване на заглавието
    title.classList.add('foldable');
    const foldMap = load('bl_folds', {});
    // 🔴 05.08 (СКЕПТИКЪТ към №37): класът fs-keep спира БЪДЕЩОТО автоматично
    //    сгъване, но не отменя вече записаното. При всяка майка, отваряла
    //    „Захранване“ преди поправката, bl_folddefaults[key] и bl_folds[key] са
    //    записани — тоест „🪑 Масата“ (превенцията на задавянето) си остава
    //    сгъната завинаги. Точно тя беше защитена. Веднъж на карта (пазено в
    //    bl_fskeep_fix) вдигаме само fs-keep картите.
    //    ПЪТ НАЗАД: изтриваш ключа bl_fskeep_fix — нищо друго не е пипано.
    if (key && card.classList.contains('fs-keep')) {
      const фикс = load('bl_fskeep_fix', {});
      if (!фикс[key]) {
        фикс[key] = 1; save('bl_fskeep_fix', фикс);
        if (foldMap[key]) { delete foldMap[key]; save('bl_folds', foldMap); }
      }
    }
    const folded = foldMap[key];
    if (folded) card.classList.add('folded');
    else if (folded === undefined && big) {
      // ПЪРВО виждане в претрупана стая: справочните (само текст, без действие)
      // започват сгънати, за да не заринат действените. Става ВЕДНЪЖ на карта —
      // после мама командва (разгъне ли я, bl_folddefaults пази да не я сгъваме пак).
      const defs = load('bl_folddefaults', {});
      if (!defs[key]) {
        defs[key] = 1; save('bl_folddefaults', defs);
        const controls = [...card.querySelectorAll('button, input, textarea, select')];
        const hasAction = controls.some(x => !x.closest('.jr-title'));
        // 05.08 (одит г06, №37): карта може сама да каже „мен не ме сгъвай“ с
        // клас fs-keep. Трябваше го „🪑 Масата“ (feedsafe.js) — чист текст без
        // бутон, чието заглавие не съдържа нито „задав“, нито „112“, значи
        // NO_FOLD не я лови. Превенцията на задавянето се раждаше сгъната.
        const защитена = card.classList.contains('rh-hero') || card.classList.contains('pg20-hero') ||
                         card.classList.contains('toc-card') || card.classList.contains('fs-keep');
        if (!hasAction && !защитена && !NO_FOLD.test(title.textContent || '')) {
          card.classList.add('folded');
          foldMap[key] = 1; save('bl_folds', foldMap);
        }
      }
    }

    // 10.3.3 + 10.3.4: заглавието СГЪВА — значи е бутон, а не украса.
    // Досега само пръст можеше да го отвори: клавиатурата минаваше покрай
    // него, а четецът не казваше отворено ли е.
    title.setAttribute('role', 'button');
    title.setAttribute('tabindex', '0');
    const обяви = () => title.setAttribute('aria-expanded', card.classList.contains('folded') ? 'false' : 'true');
    обяви();
    const превключи = () => {
      card.classList.toggle('folded');
      const f = load('bl_folds', {});
      if (card.classList.contains('folded')) { f[key] = 1; }
      else {
        delete f[key];
        // мек показ при РАЗГъване (anim.css .just-open); маха се сам след края,
        // за да не се престартира при следваща анимация
        card.classList.add('just-open');
        card.addEventListener('animationend', function h() { card.classList.remove('just-open'); card.removeEventListener('animationend', h); });
      }
      save('bl_folds', f);
      обяви();
    };
    title.addEventListener('click', (e) => {
      if (e.target.closest('.pin-btn')) return;
      превключи();
    });
    title.addEventListener('keydown', (e) => {
      if (e.target.closest('.pin-btn')) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); превключи(); }
    });
  }

  // броим употребата — най-важното за мама изплува само̀
  document.addEventListener('click', (e) => {
    const card = e.target.closest && e.target.closest('#roRoom .jr-card');
    if (!card || !card.dataset.blkey || e.target.closest('.jr-title')) return;
    if (card._blCounted) return;
    card._blCounted = true; // веднъж на отваряне
    const use = load('bl_carduse', {});
    use[card.dataset.blkey] = (use[card.dataset.blkey] || 0) + 1;
    save('bl_carduse', use);
  });

  // ═══════════ Ш2+Ш3: стъпаловидно влизане + медальони ═══════════

  function stagger(cards) {
    cards.forEach((c, i) => {
      c.classList.remove('card-in'); void c.offsetWidth;
      c.style.animationDelay = Math.min(i, 10) * 45 + 'ms';
      c.classList.add('card-in');
    });
  }
  const EMOJI_RE = /(\p{Extended_Pictographic}(?:️)?)/u;
  function medallions(cards) {
    cards.forEach(c => {
      const t = c.querySelector('.jr-title');
      if (!t || t.querySelector('.jr-medal')) return;
      const node = t.childNodes[0];
      if (!node || node.nodeType !== 3) return;
      const m = node.textContent.match(EMOJI_RE);
      if (!m) return;
      node.textContent = node.textContent.replace(m[1], '').replace(/\s{2,}/g, ' ');
      t.insertBefore(el('span', 'jr-medal', m[1]), t.firstChild);
    });
  }

  // ═══════════ Ш4: СВАЙП МЕЖДУ ТАБОВЕТЕ + „+“ БУТОН + ПРЕКИ ПЪТИЩА ═══════════

  function initSwipe() {
    const panel = document.querySelector('.ro-panel');
    if (!panel || panel._blSwipe) return;
    panel._blSwipe = true;
    let x0 = null, y0 = null;
    panel.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    panel.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      x0 = null;
      if (Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx) * 0.7) return;
      const tabs = [...document.querySelectorAll('.ro-tab')];
      const cur = tabs.findIndex(t => t.classList.contains('on'));
      const next = cur + (dx < 0 ? 1 : -1);
      if (tabs[next] && window.MamaHelper) MamaHelper.showTab(tabs[next].dataset.tab);
    }, { passive: true });
  }

  function mountPlus(container) {
    const inner = container.querySelector('.td-inner');
    if (!inner || inner.classList.contains('td-welcome') || document.getElementById('blPlus')) return;
    const wrap = el('div', 'plus-wrap'); wrap.id = 'blPlus';
    const btn = el('button', 'plus-btn', '+'); btn.type = 'button'; btn.setAttribute('aria-label', 'Бързи действия');
    const menu = el('div', 'plus-menu'); menu.hidden = true;
    [['💜 Как си днес', 'Дневник на мама'], ['📸 Снимка на деня', 'Дневник на мама'], ['✍️ Ред в дневника', 'Дневник на мама'], ['🍼 Хранене', 'Моето бебе'], ['🔦 Лампа', null]]
      .forEach(([lbl, room]) => {
        const b = el('button', 'plus-item', lbl); b.type = 'button';
        b.addEventListener('click', () => {
          menu.hidden = true; btn.classList.remove('open');
          if (!room) { if (window.BL_LAMP) BL_LAMP(); return; }
          if (window.MamaHelper) MamaHelper.open(room);
        });
        menu.appendChild(b);
      });
    btn.addEventListener('click', () => {
      menu.hidden = !menu.hidden;
      btn.classList.toggle('open', !menu.hidden);
      if (window.BL_FX) BL_FX.buzz(6);
    });
    wrap.appendChild(menu); wrap.appendChild(btn);
    document.body.appendChild(wrap);
  }

  // преки пътища от иконата (?go=…) + 12.10.7 дълбоки връзки (?room=…)
  function handleShortcut() {
    const п = new URLSearchParams(location.search);
    const go = п.get('go'), стая = п.get('room');
    if (!go && !стая) return;
    history.replaceState(null, '', location.pathname);
    setTimeout(() => {
      if (go === 'lamp' && window.BL_LAMP) BL_LAMP();
      else if (go === 'checkin' && window.MamaHelper) MamaHelper.open('Дневник на мама');
      else if (go === 'feed' && window.MamaHelper) MamaHelper.open('Моето бебе');
      // 12.10.1: трите нови — СОС, опитът, дневничето
      else if (go === 'sos' && window.BL_SOS_CENTER) BL_SOS_CENTER.open();
      else if (go === 'lab' && window.MamaHelper) MamaHelper.open('Лабораторията');
      else if (go === 'journal' && window.MamaHelper) MamaHelper.open('Дневник на мама');
      // 12.10.7: ?room=Захранване — точното име на стаята, направо в нея
      else if (стая && window.MamaHelper && MamaHelper.persona(стая)) MamaHelper.open(стая);
    }, 600);
  }

  // ═══════════ Ш5: ДНЕВЕН БРИФ + ПРОАКТИВНИ НУДЖОВЕ ═══════════

  function mountBrief(container, baby, a) {
    const inner = container.querySelector('.td-inner');
    if (!inner || inner.classList.contains('td-welcome')) return;
    if (load('bl_brief_hide', '') === today()) return;

    // 12.14.5: ако мама го крие ден след ден, той се научава да идва
    // по-рядко — през ден. Не се сърди, просто отстъпва.
    const крития = load('bl_brief_xd', []);
    const скоро = крития.filter(d => (Date.now() - new Date(d + 'T12:00')) < 7 * 86400000);
    if (скоро.length >= 4 && new Date().getDate() % 2 === 1) return;

    const ч = new Date().getHours();
    const bits = [];

    // 12.14.4: вчерашният тежък ден се помни — и се пита с грижа, ПЪРВО
    const вчераД = new Date(); вчераД.setDate(вчераД.getDate() - 1);
    const вчера = load('bl_checkins', {})[localDate(вчераД)];
    if (вчера && typeof вчера.m === 'number' && вчера.m <= 1 && !load('bl_checkins', {})[today()]) {
      bits.push('вчера ти беше тежко. Днес как е? 🤍');
    }

    // 12.14.1: опитът в ход — Луна знае за Лабораторията
    const опити = (load('bl_lab', { list: [] }).list || []).filter(x => !x.closed);
    if (опити.length) {
      const о = опити[0];
      if (!о.log || !о.log[today()]) bits.push('опитът „' + esc((о.q || '').slice(0, 34)) + '…“ чака едно докосване довечера 🔬');
    }

    // 12.14.2: стая 8 — картата на деня
    const карти = load('bl_cards', { seen: [], last: '' });
    if (карти.last !== today() && ч >= 9) bits.push('картата на деня те чака при Ния 🃏');

    // 12.14.7: НИКОГА какво не е направила. Подканата е покана, не сметка.
    if (load('bl_prompt_done', '') !== today() && window.BL_DAILY && bits.length < 2) {
      bits.push('подканата пита: „' + BL_DAILY.todaysPrompt().slice(0, 42) + '…“');
    }

    // 12.14.6: на 1-во число — месечният разказ (порасна от неделния)
    if (new Date().getDate() === 1 && window.BL_RIVER) {
      const мин = new Date(); мин.setMonth(мин.getMonth() - 1, 1); мин.setHours(0, 0, 0, 0);
      const край = new Date(); край.setDate(1); край.setHours(0, 0, 0, 0);
      const мигове = BL_RIVER.collect().filter(x => x.ts >= мин.getTime() && x.ts < край.getTime());
      const големи = мигове.filter(x => x.big).length;
      // 🟡 12.08 (единиците): при един-единствен запечатан миг за месеца редът
      //    излизаше „месецът ви: 1 мига, от тях 1 големи“.
      const бр = (n, ед, мн) => window.BL_BROI ? BL_BROI(n, ед, мн) : n + ' ' + (n === 1 ? ед : мн);
      if (мигове.length) bits.push('месецът ви: ' + бр(мигове.length, 'миг', 'мига') + (големи ? ', от тях ' + бр(големи, 'голям', 'големи') : '') + ' — реката ги пази 🌊');
    } else if (new Date().getDay() === 0) {
      const dip = load('bl_diapers', {});
      let wk = 0;
      for (let i = 0; i < 7; i++) { const d = new Date(); d.setDate(d.getDate() - i); const r = dip[localDate(d)]; if (r) wk += (r.wet || 0) + (r.dirty || 0); }
      if (wk) bits.push(`неделен поглед: ${window.BL_BROI ? BL_BROI(wk, 'пелена', 'пелени') : wk + ' ' + (wk === 1 ? 'пелена' : 'пелени')} тази седмица — герои сте`);
    }

    // 12.14.3: тонът върви с часа — сутрин бодро, вечер тихо, нощем шепот
    const тон = ч < 5 ? 'шшш… нощта е дълга, но не си сама 🌙'
      : ч < 11 ? 'добро утро! ☀️'
      : ч < 18 ? 'лек ден 🌤️'
      : ч < 22 ? 'тиха вечер 🌆'
      : 'време е за меко 🌙';
    const текст = bits.length ? bits.slice(0, ч < 5 ? 1 : 3).join(' · ') : 'нищо не чака. Само се гушкайте 💜';

    const brief = el('div', 'brief-card');
    brief.innerHTML = `<span class="brief-moon">🌙</span><div class="brief-txt"><strong>Луна:</strong> ${esc(тон)} ${текст}</div><button class="brief-x" type="button" aria-label="Скрий за днес">✕</button>`;
    brief.querySelector('.brief-x').addEventListener('click', () => {
      save('bl_brief_hide', today());
      const х = load('bl_brief_xd', []); х.push(today()); save('bl_brief_xd', х.slice(-14));
      brief.remove();
    });
    inner.insertBefore(brief, inner.firstChild.nextSibling);
  }

  const NUDGES = {
    'Моето бебе': () => {
      const g = load('bl_growth', []).slice(-1)[0];
      if (g && (Date.now() - new Date(g.d)) > 21 * 86400000) return 'Отдавна не сме мерили 📏';
      return null;
    },
    'Дневник на мама': () => (!load('bl_checkins', {})[today()] ? 'Как си днес? 💜' : null),
    // 05.08 (одит г06, №40): подканата нямаше НИКАКВА проверка за възраст и
    // изскачаше при всяко влизане — включително на майка на двумесечно, докато
    // същата стая ѝ казва „около 6-ия месец“ (rooms4.js:99-104). Тук пазим същия
    // праг: без рождена дата — тихо; под 6 коригирани месеца — тихо.
    'Захранване': () => {
      let м = null;
      // 🔴 05.08 (СКЕПТИКЪТ към №40): поправката твърдеше „същият праг и същият
      //    източник като rooms4.js“ — и двете не бяха верни. rooms4.js:110 мери
      //    по КОРИГИРАНАТА възраст (devMonths, заради недоносените — това е
      //    фикс №39 от г08) и мълчи под 6, а тук се четеше календарната с праг
      //    5.5. ИЗМЕРЕНО: бебе от 32-ра седмица, родено преди 213 дни →
      //    календарни 7.00 / коригирани 5.16. Подканата пита „Какво е менюто
      //    днес? 🥄“, а картата в СЪЩАТА стая казва „🍼 На тази възраст обядът
      //    още е мляко“. Един източник, един праг.
      try { const b = load('bl_baby', {}) || {}; const a = b.birth && window.BL_AGE ? BL_AGE(b.birth) : null; м = a ? (a.devMonths != null ? a.devMonths : a.months) : null; } catch (e) { м = null; }
      if (м == null || м < 6) return null;
      return !load('bl_menu', {})[today()] ? 'Какво е менюто днес? 🥄' : null;
    },
    // 🟠 25.08 (обход „Игри и Лаборатория", ИЗМЕРЕНО): `x.exp` без пазач за
    //    `x` — един празен ред в аптечката (внесено копие, недописан запис) и
    //    тук гърми TypeError. Извикването е в setTimeout без уловка, значи
    //    подсказката просто изчезва мълчаливо за ВСЯКА стая след това.
    //    Близнакът в hero.js:75 пази същите данни правилно (`x && x.exp`).
    //    ПЪТ НАЗАД: върни `x.exp &&`.
    'Здраве и SOS': () => (load('bl_pharmacy', []).some(x => x && x.exp && new Date(x.exp) < new Date()) ? 'Нещо в аптечката е изтекло ⚠️' : null),
    'Бременност': () => {
      const lmp = window.BL_EXPECT ? BL_EXPECT.lmp() : load('bl_lmp', '');
      if (!lmp) return null;
      const w = (window.BL_PREG ? BL_PREG.седмица(new Date(lmp)) : Math.floor((Date.now() - new Date(lmp)) / 604800000));
      return (w >= 4 && w <= 42 && !load('bl_bump', {})[w] && !load('bl_bump', {})[w - 1]) ? 'Снимка на коремчето? 🤰' : null;
    }
  };
  function applyNudge(room) {
    setTimeout(() => {
      const fab = document.getElementById('roFab');
      if (!fab) return;
      fab.querySelector('.ro-fab-dot')?.remove();
      const n = NUDGES[room] && NUDGES[room]();
      if (!n) return;
      fab.appendChild(el('span', 'ro-fab-dot'));
      const hint = fab.querySelector('.ro-fab-hint');
      if (hint) { hint.textContent = n; hint.classList.add('show'); setTimeout(() => hint.classList.remove('show'), 3200); }
    }, 700);
  }

  // ═══════════ Ш6: НАПОМНЯНЕ ЗА АРХИВ ═══════════

  const prevExtras = window.BL_TODAY_EXTRAS;
  window.BL_TODAY_EXTRAS = function (baby, a) {
    let html = prevExtras ? prevExtras(baby, a) : '';
    const last = load('bl_backup_last', '');
    // 🟠 11.08 (обиколка като майка, ИЗМЕРЕНО на празен профил): условието беше
    //    „повече от 6 ключа с префикс bl_“, а приложението САМО си пише
    //    счетоводство още при първото отваряне — измерени пет преди мама да е
    //    пипнала каквото и да е (bl_tz, bl_day1, bl_hero_toured, bl_vax_schema,
    //    bl_art_merged), а онбордингът добавя още. Минута след като е въвела
    //    името на бебето чипът вече ѝ казваше „💾 Резервно копие — време е“ —
    //    на екран, който обещава „Днес нищо не искаме от теб“. Броим НЕЙНИТЕ
    //    записи, и то непразните. Списъкът на служебните не е измислен тук: той
    //    е същият, измерен на изтрит телефон, който пази и качването на копие
    //    (profile.js:391, rooms2.js:1391) + bl_baby_stage (стъпалото на
    //    аватара, което се пише само от rooms2.js:1719).
    const СЛУЖЕБНИ = /^(bl_theme|bl_sounds|bl_onboard|bl_onboarded|bl_font|bl_pin|bl_pin_h|bl_pin_set|bl_pins|bl_seen_cards|bl_carduse|bl_folds|bl_folddefaults|bl_agent_miss|bl_lib_open|bl_lib_opens|bl_tz|bl_vax_schema|bl_baby_stage|bl_backup_last|bl_backup_partial_last|bl_tour_done|bl_room_asked|bl_room_visited|bl_day1|bl_hero_toured|bl_art_merged|bl_heavy_day|bl_fskeep_fix|bl_rainbow|bl_wm_visits|bl_wm_ritual)$/;
    const мои = Object.keys(localStorage).filter(k => {
      if (k.indexOf('bl_') !== 0 || СЛУЖЕБНИ.test(k)) return false;
      const v = localStorage.getItem(k);
      return !!v && v !== '{}' && v !== '[]' && v !== '""' && v !== 'null' && v !== 'false';
    }).length;
    const hasData = мои > 6;
    if (hasData && (!last || (Date.now() - new Date(last)) > 30 * 86400000)) {
      // 🔴 05.08 (одит г14, №304): чипът пращаше към карта „Архив на спомените“,
      //    каквато няма. Истинската се казва „Резервно копие 💾“.
      html += `<button class="td-chip" data-room="Инструменти">💾 Резервно копие — време е</button>`;
    }
    return html;
  };

  // ═══════════ Ш7: ⚙️ НАСТРОЙКИ НА ЕДНО МЯСТО ═══════════

  function settingsCard() {
    const c = el('section', 'jr-card');
    c.appendChild(el('h4', 'jr-title', 'Настройки ⚙️ <span class="jr-sub">всичко важно на едно място</span>'));
    const grid = el('div', 'set-grid');
    function toggle(lbl, get, set) {
      const b = el('button', 'set-tgl' + (get() ? ' on' : ''), lbl + '<span class="set-dot"></span>');
      b.type = 'button';
      b.addEventListener('click', () => { set(!get()); b.classList.toggle('on', get()); if (window.BL_FX) BL_FX.buzz(8); });
      return b;
    }
    grid.appendChild(toggle('🌙 Тъмна тема',
      () => document.documentElement.getAttribute('data-theme') === 'dark',
      v => { document.documentElement.setAttribute('data-theme', v ? 'dark' : 'light'); try { localStorage.setItem('bl_theme', v ? 'dark' : 'light'); } catch (e) {} }));
    grid.appendChild(toggle('🔔 Милички звуци',
      () => { try { return localStorage.getItem('bl_sounds') === '1'; } catch (e) { return false; } },
      v => { try { localStorage.setItem('bl_sounds', v ? '1' : '0'); } catch (e) {} if (v && window.BL_FX) BL_FX.pop(true); }));
    // 10.4.3: вибрацията отделно — за „само вибрация“ или пълна тишина
    grid.appendChild(toggle('📳 Вибрация',
      () => { try { return localStorage.getItem('bl_vibrate') !== '0'; } catch (e) { return true; } },
      v => { try { localStorage.setItem('bl_vibrate', v ? '1' : '0'); } catch (e) {} if (v && window.BL_FX) BL_FX.buzz(14); }));
    grid.appendChild(toggle('🔎 По-едър текст',
      () => document.documentElement.classList.contains('big-font'),
      v => { document.documentElement.classList.toggle('big-font', v); try { localStorage.setItem('bl_bigfont', v ? '1' : '0'); } catch (e) {} }));
    c.appendChild(grid);

    // 🤍 Паузата на очакването (М−0б, одит 11)
    // Показва се САМО ако има какво да се паузира — жена без въведена дата
    // не бива изобщо да среща тази дума. И е формулирана като действие
    // („спри броенето“), не като събитие („загубих бебето“): тя знае какво
    // ѝ се е случило, не приложението да ѝ го казва.
    if (window.BL_EXPECT && BL_EXPECT.has()) {
      const w = el('div', 'set-quiet');
      const on = BL_EXPECT.paused();
      const b = el('button', 'set-quiet-btn', on
        ? '▶️ Пусни отново броенето до термина'
        : '🤍 Спри тихо броенето до термина');
      b.type = 'button';
      b.addEventListener('click', () => {
        if (BL_EXPECT.paused()) BL_EXPECT.resume(); else BL_EXPECT.pause();
        c.replaceWith(settingsCard());
      });
      w.appendChild(b);
      w.appendChild(el('p', 'jr-privacy', on
        ? 'Броенето е спряно. Датата ти си стои — нищо не е изтрито.'
        : 'Спира обратното броене, лентата на седмиците и месечните писма. <strong>Нищо не се изтрива</strong> — дневникът, снимките и писмата ти остават. Можеш да го върнеш когато поискаш.'));
      // 🤍 Петте четива за загубата ги имаше в базата, но НИЩО в приложението
      //    не водеше до тях — стигаше се само с дословна фраза в чата. Това е
      //    единственото място, където тя вече е тук. Тихо, без да натяква.
      if (on) {
        w.appendChild(el('p', 'jr-privacy', 'Когато си готова, тук има няколко неща за теб.'));
        const врати = el('div', 'set-quiet-doors');
        [['zg-tialoto', 'Тялото ти сега'], ['zg-s-kogo', 'Има с кого']].forEach(([id, име]) => {
          const b = el('button', 'jr-chip', esc(име));
          b.type = 'button';
          b.addEventListener('click', () => {
            if (!window.MamaHelper) return;
            MamaHelper.open('Дневник на мама');
            MamaHelper.showTab('chat');
            // 🔴 05.08 (СКЕПТИКЪТ към №212): 60 мс влизаха ПРЕЗ отварянето.
            //    helper.js:1895 пуска поздрава на 800 мс, а respond() отговаря
            //    след 550–1050 мс — тоест двата таймера се преплитат. ИЗМЕРЕНО
            //    живо, 2 пускания на 60 мс: ред „въпросът ѝ → «Луна съм, в тази
            //    стая говорим за теб» → отговорът“, а във второто поздравът
            //    засече setChips и ИЗТРИ вратите на самата статия (zg-pak /
            //    zg-s-kogo) — точно те бяха целта на №212; чиповете останаха
            //    „Как си днес, наистина? · Тежко ли ти е? · Какво ти липсва?“.
            //    2 пускания на 1250 мс: редът е поздрав → въпрос → отговор.
            //    1250 мс е зад поздрава — същият похват като search.js:224/245
            //    (1200) и home.js:689 (1300). ПЪТ НАЗАД: върни 60.
            setTimeout(() => MamaHelper.ask(име, id), 1250);
          });
          врати.appendChild(b);
        });
        w.appendChild(врати);
      }
      c.appendChild(w);
    }

    // 🤍 11.08 (обиколка като майка): картата „За партньора“ в Бременност се
    //    скриваше с едно докосване („🤍 Сама съм“) и текстът обещаваше връщане
    //    „в чата“ — а такова нещо нямаше никъде. Вратата беше еднопосочна.
    //    Тук е обратният път, до паузата на очакването, по същия тих начин:
    //    показва се САМО на жената, която веднъж е казала „сама съм“.
    try {
      if (JSON.parse(localStorage.getItem('bl_partner') || '""') === 'не') {
        const п = el('div', 'set-quiet');
        const бут = el('button', 'set-quiet-btn', '💜 Върни картата „За партньора“');
        бут.type = 'button';
        бут.addEventListener('click', () => {
          try { localStorage.removeItem('bl_partner'); } catch (e) {}
          c.replaceWith(settingsCard());
        });
        п.appendChild(бут);
        п.appendChild(el('p', 'jr-privacy', 'В Бременност пак ще те питам веднъж има ли кой да ти помага — и ще уважа отговора ти.'));
        c.appendChild(п);
      }
    } catch (e) {}

    // 6.5.2 + 6.5.3: „какво не намерих“ — ненамерените въпроси се събират
    // локално (bl_agent_miss). Мама сама решава да ги види/сподели — така
    // собственикът научава какво пита България и какво да добави в базата.
    const пропуски = load('bl_agent_miss', []);
    if (пропуски.length) {
      const мис = el('div', 'set-miss');
      const бут = el('button', 'set-quiet-btn', '📋 Какво не успях да намеря (' + пропуски.length + ')');
      бут.type = 'button';
      const кутия = el('div', 'set-misslist'); кутия.hidden = true;
      бут.addEventListener('click', () => { кутия.hidden = !кутия.hidden; });
      мис.appendChild(бут);
      кутия.appendChild(el('p', 'jr-privacy',
        'Това са въпросите, на които още не намерих добър отговор. Стоят <strong>само на този телефон</strong>. Ако искаш да ни помогнеш да станем по-добри — прати ни ги; така ще добавим точно каквото липсва.'));
      const списък = el('div', 'miss-rows');
      пропуски.slice(-30).reverse().forEach(m => {
        списък.appendChild(el('p', 'miss-row', '❓ ' + esc((m.q || '').slice(0, 80)) + ' <small>· ' + esc(m.room || '') + '</small>'));
      });
      кутия.appendChild(списък);
      const ред = el('div', 'jr-quick');
      const спод = el('button', 'jr-chip', '📤 Прати ги на екипа'); спод.type = 'button';
      спод.addEventListener('click', async () => {
        const текст = 'Въпроси, които Помощникът на мама още не покрива:\n\n' +
          пропуски.slice(-40).map(m => '• ' + (m.q || '') + (m.room ? ' (' + m.room + ')' : '')).join('\n');
        if (navigator.share) { try { await navigator.share({ text: текст }); return; } catch (e) { if (e.name === 'AbortError') return; } }
        try { await navigator.clipboard.writeText(текст); спод.textContent = '✔ Копирано'; setTimeout(() => спод.textContent = '📤 Прати ги на екипа', 1600); } catch (e) {}
      });
      const изтр = el('button', 'jr-chip', '🗑️ Изчисти'); изтр.type = 'button';
      изтр.addEventListener('click', () => { save('bl_agent_miss', []); c.replaceWith(settingsCard()); });
      ред.appendChild(спод); ред.appendChild(изтр); кутия.appendChild(ред);
      мис.appendChild(кутия);
      c.appendChild(мис);
    }

    // 🧱 памет-мениджърът: текстовете (localStorage) + медията (IndexedDB, стотици MB)
    const u = window.BL_STORE ? BL_STORE.usage() : { textsKB: 0, mediaKB: 0 };
    c.appendChild(el('p', 'jr-privacy',
      `Памет: записки ~${u.textsKB} KB (таван ~5000 KB) · снимки и звуци ~${u.mediaKB > 1024 ? (u.mediaKB / 1024).toFixed(1) + ' MB' : u.mediaKB + ' KB'} (в големия склад — стотици MB място). Изтриване: от самите галерии. Ключалката 🔒 е в Дневника, архивът 💾 — по-горе в това кътче.`));
    return c;
  }

  // ═══════════ свързване ═══════════

  // 1) опаковаме всички стаи: организация след строежа
  Object.keys(window.ROOM_FEATURES || {}).forEach(room => {
    const base = window.ROOM_FEATURES[room];
    window.ROOM_FEATURES[room] = root => { base(root); organize(root, room); };
  });
  // настройките се предлагат на стаята „Инструменти“ (tools.js ги вмъква ПРЕДИ
  // подредбата — иначе оставаха извън всички кътчета)
  window.BL_SETTINGS_CARD = settingsCard;

  // 2) опаковаме отварянето на стая: конфети-тема + свайп + нудж
  const CONF_THEMES = {
    'Бременност': ['💗', '✨', '🌸'], 'Моето бебе': ['⭐', '💙', '🍼'], 'Захранване': ['🍓', '🥕', '💛'],
    'Здраве и SOS': ['💚', '🍀', '✨'], 'Дневник на мама': ['💜', '🌙', '✨'], 'Развитие и игри': ['⭐', '🎈', '🧸'],
    'Инструменти': ['🎀', '✅', '✨'],
    'Жената в мен': ['💃', '🔮', '👑'], 'Лабораторията': ['🔬', '💡', '🧪']
  };
  document.addEventListener('DOMContentLoaded', () => {
    if (window.MamaHelper) {
      const origOpen = MamaHelper.open;
      MamaHelper.open = function (room) {
        window.BL_CONF_THEME = CONF_THEMES[room] || null;
        origOpen(room);
        initSwipe();
        applyNudge(room);
        document.querySelectorAll('#roRoom .jr-card').forEach(c => { c._blCounted = false; });
      };
    }
    handleShortcut();
  });

  // 3) Днес: бриф + „+“ бутон
  const prevBind = window.BL_TODAY_BIND;
  window.BL_TODAY_BIND = function (container, baby, a) {
    if (prevBind) prevBind(container, baby, a);
    mountBrief(container, baby, a);
    mountPlus(container);
  };

  // ═══════════ 👉 ТИХИЯТ ОТКАЗ (жива обиколка 22.07) ═══════════
  // Из целия апп има ~30 бутона със `if (!v) return;` — натиснеш „+“ или
  // „Запази“ с празно поле и не става НИЩО. Кодът е прав; за майката е
  // изнервящо: тя не знае дали не е записала, или апп-ът я е подвел.
  // Един жест решава всичко: полето до бутона примигва и приема курсора.
  // Не пипаме нито един от 30-те бутона — слушаме в capture, преди тях.
  function празноПоле(бутон) {
    const кутия = бутон.closest('.jr-addrow, .jr-quick, .jr-row, .jr-card');
    if (!кутия) return null;
    const полета = [...кутия.querySelectorAll('input:not([type=hidden]):not([type=file]):not([type=checkbox]):not([type=radio]), textarea')]
      .filter(п => п.offsetParent !== null && !п.disabled && !п.readOnly);
    if (!полета.length) return null;
    // ако ПОНЕ едно поле има стойност — бутонът си има с какво да работи
    if (полета.some(п => String(п.value || '').trim())) return null;
    return полета[0];
  }
  document.addEventListener('click', e => {
    const б = e.target.closest('button');
    if (!б || б.disabled || !б.closest('#roRoom, .lib-body, .prof-panel')) return;
    // два признака, че бутонът очаква писане: или стои в реда за добавяне
    // (там всеки бутон е „приеми написаното“ — „📍 Била съм“, „🧸 Това е“,
    // „😄 Запиши“…), или самият надпис го казва. Само по думи беше твърде
    // тясно и половината бутони оставаха неми.
    const вРед = !!б.closest('.jr-addrow');
    if (!вРед && !/^\+|запази|запиши|добави|отбележи|остави|заключи|изпрати|покажи|отказвам/i.test((б.textContent || '').trim())) return;
    const поле = празноПоле(б);
    if (!поле) return;
    поле.classList.remove('bl-нужно'); void поле.offsetWidth; поле.classList.add('bl-нужно');
    try { поле.focus({ preventScroll: true }); } catch (err) { try { поле.focus(); } catch (e2) {} }
    if (window.BL_FX && BL_FX.buzz) BL_FX.buzz(6);
    setTimeout(() => поле.classList.remove('bl-нужно'), 1200);
  }, true);

  // едър шрифт — възстановяване при зареждане
  try { if (localStorage.getItem('bl_bigfont') === '1') document.documentElement.classList.add('big-font'); } catch (e) {}
})();
