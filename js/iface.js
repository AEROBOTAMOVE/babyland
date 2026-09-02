// ═══════════════════════════════════════════════════════════
// 🏠 СТАЙНИЯТ ИНТЕРФЕЙС — надграждане (план 19, част 12.7)
//
// 🎬 12.7.1  Банерът реагира на ДАННИТЕ — Лабораторията показва
//            докъде е опитът, другите стаи — своето живо число
// 🔴 12.7.2  Табовете: значка, ако има ново (непрочетени статии)
// 📖 12.7.4  Съдържанието: докъде си стигнала (видените кътчета)
//
// ⛔ 12.7.3 (FAB), 12.7.5 (търсене в текста), 12.7.6 (свайп),
//    12.7.7 (помни кътчето), 12.7.8 (скоростта) — ГОТОВИ другаде.
//
// Обвивам MamaHelper.open и дообличам след рисуването.
// ЗАРЕЖДА СЕ СЛЕД helper.js и СЛЕД polish.js.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';
  if (!window.MamaHelper) return;

  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { if (window.BL_ZAPIS_PADNA) BL_ZAPIS_PADNA(); return false; } return true; };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const днес = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

  // ═══════════ 🎬 12.7.1 ЖИВОТЪТ В БАНЕРА ═══════════
  // Едно малко хапче върху сцената — с ЧИСЛОТО на мама, не с общ лозунг.
  function хапчеЗа(стая) {
    const бебе = load('bl_baby', {});
    // Б10.6 (план 20): и Бременност има какво да каже
    if (стая === 'Бременност') {
      if (window.BL_EXPECT && BL_EXPECT.paused()) return null;
      const л = window.BL_EXPECT ? BL_EXPECT.lmp() : '';
      if (!л) return null;
      const w = (window.BL_PREG ? BL_PREG.седмица(new Date(л)) : Math.floor((Date.now() - new Date(л)) / 604800000));
      if (w < 1 || w > 45) return null;
      const дни = Math.ceil((new Date(л).getTime() + 280 * 86400000 - Date.now()) / 86400000);
      return '🤰 ' + w + '-та седмица' + (дни > 0 ? ' · още ' + дни + ' съня' : ' · всеки момент 💜');
    }
    if (стая === 'Лабораторията') {
      const опити = (load('bl_lab', { list: [] }).list || []).filter(x => !x.closed);
      if (!опити.length) return null;
      // 🔴 г13/323: lab.js позволява ДВА опита наведнъж, а хапчето показваше
      //   винаги първия — вторият не се виждаше никъде. Показваме онзи, който
      //   още чака докосване днес.
      const о = опити.find(x => !(x.log || {})[днес()]) || опити[0];
      const вечери = Object.keys(о.log || {}).length;
      const днесОтметнат = !!(о.log || {})[днес()];
      return '🔬 ' + (о.q || 'Опитът').slice(0, 24) + '… · вечер ' + вечери + ' от ' + (о.d || 7) + (днесОтметнат ? ' ✔' : '');
    }
    if (стая === 'Дневник на мама') {
      const ч = load('bl_checkins', {})[днес()];
      return ч ? '💜 Днес вече помисли за себе си ✔' : null;
    }
    if (стая === 'Захранване') {
      const н = Object.keys(load('bl_tried', {})).length;
      return н ? '🥄 ' + н + ' опитани храни дотук' : null;
    }
    if (стая === 'Жената в мен') {
      // 🔍 скептик 05.08 (втората половина на г12 №194): кръгът беше обяснен САМО
      //    вътре в стаята (women.js:456). Хапчето на банера продължаваше да пада
      //    от „60 събрани карти“ на „1 събрани карти“ без нито дума — същата
      //    „изтрита памет“, само че на друго място. И на 1 се пишеше в множествено.
      const к = load('bl_cards', { seen: [] });
      const бр = (к.seen || []).length;
      if (!бр) return null;
      return '🃏 ' + бр + (бр === 1 ? ' събрана карта' : ' събрани карти')
        + ((к.кръг || 1) > 1 ? ' · кръг ' + к.кръг : '');
    }
    if (стая === 'Моето бебе' && бебе.birth) {
      const зъби = load('bl_teeth', []).length;
      return зъби ? '🦷 ' + зъби + ' зъбчета досега' : null;
    }
    if (стая === 'Развитие и игри') {
      const у = Object.keys(load('bl_ms_d', {})).length;
      return у ? '🧸 ' + у + ' разцъфнали умения' : null;
    }
    if (стая === 'Здраве и SOS') {
      const в = load('bl_vax', {});
      const н = Object.keys(в).filter(k => в[k]).length;
      return н ? '💉 ' + н + ' отметнати ваксини' : null;
    }
    return null;
  }
  function облечиБанер(стая) {
    const бан = document.getElementById('roBanner');
    if (!бан) return;
    бан.querySelector('.ro-datapill')?.remove();
    const т = хапчеЗа(стая);
    if (т) бан.appendChild(el('span', 'ro-datapill', esc(т)));
  }

  // ═══════════ 🔴 12.7.2 ЗНАЧКАТА НА ТАБА ═══════════
  // 🤍 29.07: тук стоеше БРОЯЧ на непрочетени статии. В „Здраве и SOS“ те са
  //    219, в „Моето бебе“ 112 — тоест значката пишеше „99+“ и щеше да пише
  //    „99+“ до края на живота на приложението. Розово число, което не може
  //    да стигне нула, не е информация, а натякване: „не си прочела още 219
  //    неща“. Точно обратното на това, за което е приложението.
  //    Сега: мъничка точка БЕЗ число, само докато мама не е отваряла рафта
  //    в тази стая. Казва „тук има и статии“ веднъж — и млъква завинаги.
  const РАФТ_ВИДЯН = 'bl_tabs_seen';   // ⚠️ НЕ „ВИДЕНИ“ — то е заето по-долу за bl_seen_cards
  const рафтВидян = () => { try { return JSON.parse(localStorage.getItem(РАФТ_ВИДЯН)) || {}; } catch (e) { return {}; } };
  function облечиТабове(стая) {
    const табове = document.getElementById('roTabs');
    if (!табове) return;
    табове.querySelectorAll('.ro-tab-dot').forEach(x => x.remove());
    // 🟠 25.08 (dev/parvata_vrata.js, ИЗМЕРЕНО): изключването на пазача стоеше
    //    ПОД трите ранни излизания. Влезеш ли от стая СЪС статии в стая БЕЗ
    //    статии (или в такава, чийто рафт вече е видян), пазачът на
    //    предишната оставаше жив върху СЪЩАТА лента `#roTabs` — тя е една за
    //    всички стаи — и на всяко пре-рисуване лепеше значка „има и статии“ в
    //    чужда стая. Измерено: 1 създаден пазач, 1 жив след влизане в
    //    „Инструменти“. Изключваме ПЪРВО, после решаваме дали има какво да
    //    показваме.
    //    ПЪТ НАЗАД: премести двата реда обратно под проверката за `рафтВидян`.
    if (табове._blПазач) { табове._blПазач.disconnect(); табове._blПазач = null; }
    const статии = window.BL_ARTICLES ? BL_ARTICLES.forRoom(стая) : [];
    if (!статии.length) return;
    if (рафтВидян()[стая]) return;                 // вече е била — не я потупваме повече
    // 🩹 29.07: тук се търсеше САМО `.ro-tab` — а план 20 смени превключвателя
    //    с балонния (`.st-seg`). Значи значката не се е рисувала изобщо,
    //    откакто tabs.js е влязъл: мама нямаше никакъв знак, че в стаята има
    //    и рафт със статии. Гледаме и двете, за да не се счупи пак при смяна.
    const таб = табове.querySelector('[data-tab="articles"]');
    if (!таб) return;
    лепни(табове, стая);
    // 🔁 29.07: точката се слагаше в 1638ms, а в 1656ms tabs.js (балонният
    //    превключвател) пребоядисваше ЦЯЛАТА лента и я триеше 18 мсек
    //    по-късно. Вместо да гоня чуждото време с още един setTimeout —
    //    който утре пак ще се размине — гледаме лентата и връщаме точката,
    //    щом изчезне. Наблюдателят се пуска веднъж на стая и се маха, щом
    //    мама отвори рафта.
    табове._blПазач = new MutationObserver(() => {
      if (рафтВидян()[стая]) { табове._blПазач.disconnect(); табове._blПазач = null; return; }
      if (!табове.querySelector('.ro-tab-dot-tih')) лепни(табове, стая);
    });
    табове._blПазач.observe(табове, { childList: true, subtree: true });
  }

  function лепни(табове, стая) {
    const таб = табове.querySelector('[data-tab="articles"]');
    if (!таб || таб.querySelector('.ro-tab-dot-tih')) return;
    const точка = el('span', 'ro-tab-dot ro-tab-dot-tih', '');
    точка.setAttribute('aria-label', 'има и статии');
    таб.appendChild(точка);
    таб.addEventListener('click', () => {
      try { const в = рафтВидян(); в[стая] = 1; localStorage.setItem(РАФТ_ВИДЯН, JSON.stringify(в)); } catch (e) {}
      табове.querySelectorAll('.ro-tab-dot-tih').forEach(x => x.remove());
      if (табове._blПазач) { табове._blПазач.disconnect(); табове._blПазач = null; }
    }, { once: true });
  }

  // ═══════════ 📖 12.7.4 ДОКЪДЕ СИ СТИГНАЛА ═══════════
  // Кътче се брои за „видяно“, щом е стояло на екрана. Пази се за
  // винаги (bl_seen_cards) — и съдържанието показва честна лента.
  const ВИДЕНИ = 'bl_seen_cards';
  let наблюдател = null;
  function следи(стая) {
    const кутия = document.getElementById('roRoom');
    if (!кутия) return;
    if (наблюдател) наблюдател.disconnect();
    const видени = load(ВИДЕНИ, {});
    видени[стая] = видени[стая] || {};
    наблюдател = new IntersectionObserver(записи => {
      let ново = false;
      записи.forEach(z => {
        if (!z.isIntersecting) return;
        const к = z.target.dataset.blkey;
        if (к && !видени[стая][к]) { видени[стая][к] = 1; ново = true; }
        наблюдател.unobserve(z.target);
      });
      if (ново) { save(ВИДЕНИ, видени); обновиЛента(стая); }
    }, { threshold: 0.4 });
    кутия.querySelectorAll('.jr-card[data-blkey]').forEach(c => наблюдател.observe(c));
    обновиЛента(стая);
  }
  function обновиЛента(стая) {
    const toc = document.querySelector('#roRoom .toc-card');
    if (!toc) return;
    const живи = [].map.call(document.querySelectorAll('#roRoom .jr-card[data-blkey]'),
      c => c.getAttribute('data-blkey'));
    const всички = живи.length;
    if (!всички) return;
    // 🟠 25.08 (dev/parvata_vrata.js, ИЗМЕРЕНО): броеше се ДЪЛЖИНАТА на
    //    запомнените ключове, не пресечницата с живите. bl_seen_cards расте
    //    вечно, а стаята се променя (картите заспиват при бременност, някои
    //    се махат с версия, ключове от стари подредби остават завинаги).
    //    Измерено: 1 наистина видяно кътче от 4 живи + 3 отдавна изчезнали
    //    ключа → лентата обявяваше „Разгледала си всичко тук ✨“. Мама вижда
    //    пълна лента и подминава три кътчета, които не е отваряла.
    //    (`Math.min` само СКРИВАШЕ препълването — не го поправяше.)
    //    ПЪТ НАЗАД: `const бр = Object.keys((load(ВИДЕНИ, {})[стая]) || {}).length;`
    //    и `const н = Math.min(бр, всички);`.
    const запомнени = load(ВИДЕНИ, {})[стая] || {};
    const н = живи.filter(k => k && запомнени[k]).length;
    let лента = toc.querySelector('.toc-prog');
    if (!лента) {
      лента = el('div', 'toc-prog',
        '<span class="toc-progfill"></span><span class="toc-progtxt"></span>');
      toc.querySelector('.jr-title').insertAdjacentElement('afterend', лента);
    }
    лента.querySelector('.toc-progfill').style.width = Math.round(н / всички * 100) + '%';
    лента.querySelector('.toc-progtxt').textContent =
      н === всички ? 'Разгледала си всичко тук ✨' : 'Разгледани ' + н + ' от ' + всички + ' кътчета';
  }

  // ═══════════ обвивката ═══════════
  const оригОтвори = MamaHelper.open;
  MamaHelper.open = function (стая) {
    оригОтвори.call(MamaHelper, стая);
    setTimeout(() => {
      // отварянето може да е спряло на ПИН-порта — тогава няма стая
      if (document.getElementById('roomOverlay')?.hidden) return;
      облечиБанер(стая);
      облечиТабове(стая);
      следи(стая);
    }, 750);
  };

  window.BL_IFACE = { хапчеЗа, обновиЛента };
})();
