// ═══════════════════════════════════════════════════════════
// ПАМЕТТА, ЧЕСТНО (план 19, част 10.1.3 + 10.1.4) — в Инструменти
//
// 10.1.3  Квотата: предупреждение ПРЕДИ да се напълни, не след
// 10.1.4  Какво пазим: един екран, който изброява ВСИЧКО честно
//
// Приложението не праща нищо навън — значи всичко тежи на телефона. Ако се
// напълни, снимка не се запазва и мама разбира чак когато е късно. Затова:
// предупреждаваме отрано и показваме честно какво заема място.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const card = t => { const c = el('section', 'jr-card'); c.appendChild(el('h4', 'jr-title', t)); return c; };
  const sub = s => '<span class="jr-sub">' + s + '</span>';

  // какво пазим — човешки имена за ключовете
  const КАТЕГОРИИ = [
    // 🔴 11.08 (обиколка „документи и пари“): изброени бяха само ДВА от шестте
    //    бележника (rooms2.js: bl_notes_baby / _food / _health / _dev / _preg /
    //    _tools). Мама с пълни здравни и хранителни бележки виждаше „Дневник и
    //    записки — 4 B“, а самите ѝ записки бяха в кофата „Друго“. 'bl_notes_'
    //    е ПРЕФИКС (виж функцията „префикс“ по-долу) — хваща всичките шест.
    { име: '📖 Дневник и записки', e: '📖', keys: ['bl_journal', 'bl_notes_', 'bl_draft_'] },
    // 🔴 11.08 (обиколка „данните на майката“, ИЗМЕРЕНО): bl_rash (снимките на
    //    обрива, за лекаря) липсваше от всички категории. Виж и „Друго“ по-долу.
    { име: '📸 Снимки и рисунки', e: '📸', keys: ['bl_photos', 'bl_dayphoto', 'bl_bump', 'bl_art', 'bl_art_months', 'bl_food_faces', 'bl_rash'] },
    { име: '🎙️ Гласови и звукови', e: '🎙️', keys: ['bl_voice', 'bl_voice_diary', 'bl_voice_womb', 'bl_voice_songs', 'bl_lull_rec', 'bl_baby_sounds'] },
    { име: '💌 Писма и капсули', e: '💌', keys: ['bl_capsules', 'bl_letters', 'bl_wm_letters', 'bl_moonwish'] },
    // 🔴 г13/16: bl_pump (помпенето) и bl_feedlog (храненията) не бяха в НИТО ЕДНА
    //   категория — в „Какво пазя“ помпенето изобщо не се споменаваше, значи мама
    //   нямаше как да знае дали е в резервното копие.
    // 🔴 05.08 (скептик 14): 'bl_growth_head' (обиколката на главата) липсваше и
    //   падаше в кофата „Друго“ — мама не можеше да види, че се пази.
    { име: '📊 Записи за бебето (тегло, сън, пелени, хранене)', e: '📊', keys: ['bl_growth', 'bl_growth_len', 'bl_growth_head', 'bl_sleep', 'bl_diapers', 'bl_nursing', 'bl_feedlog', 'bl_pump'] },
    // 🔴 11.08: bl_wm_inframe (ти в кадър — снимките на самата майка) също не
    //    беше в нито една категория; 20 KB нейни снимки просто ги нямаше тук.
    { име: '💃 Стаята за теб (тайни, ритуали, места)', e: '💃', keys: ['bl_wm_secret', 'bl_wm_micro', 'bl_wm_bucket', 'bl_wm_compl', 'bl_wm_mirror', 'bl_wm_ritual', 'bl_wm_places', 'bl_cards', 'bl_wm_cv', 'bl_wm_inframe'] },
    { име: '🔬 Опитите и следите', e: '🔬', keys: ['bl_lab', 'bl_lab_timeline', 'bl_lab_flipped', 'bl_lab_clues', 'bl_sleep_hist'] },
    { име: '🇧🇬 Обичаите на рода', e: '🇧🇬', keys: ['bl_obichai_moi'] },
    // 🔴 19.08 (ИЗМЕРЕНО, пясъчник): 'bl_mama' липсваше от ВСИЧКИ категории —
    //    а вътре е снимката на самата майка (js/profile.js:66 я прави с
    //    toDataURL('image/jpeg', 0.82), тоест 100–300 KB base64) плюс името ѝ.
    //    Мерено с типична снимка: 180 KB се показваха като „🗂️ Друго (списъци,
    //    планове, бележки, чернови)“ — под заглавие „честно — всичко е тук“.
    //    Това е ТРЕТИЯТ път със същия шаблон в този файл (bl_rash, bl_wm_inframe).
    //    ПЪТ НАЗАД: махни 'bl_mama' от реда — нищо друго не зависи от него.
    { име: '⚙️ Настройки и профил', e: '⚙️', keys: ['bl_mama', 'bl_baby', 'bl_theme', 'bl_sounds', 'bl_lmp', 'bl_preterm'] }
  ];

  // ключ, който завършва на '_', е ПРЕФИКС (bl_draft_ → bl_draft_1723…).
  // Точното getItem('bl_draft_') връщаше null, тоест черновите не се брояха НИКОГА.
  const префикс = k => k.slice(-1) === '_';
  const покрит = (kk, списък) => списък.some(x => префикс(x) ? kk.indexOf(x) === 0 : kk === x);

  function размер(ключ) {
    // текстовете са в localStorage; медията може да е в IndexedDB (питаме store)
    let b = 0;
    try {
      if (префикс(ключ)) {
        for (let i = 0; i < localStorage.length; i++) {
          const kk = localStorage.key(i);
          if (kk && kk.indexOf(ключ) === 0) b += (localStorage.getItem(kk) || '').length;
        }
      } else b = (localStorage.getItem(ключ) || '').length;
    } catch (e) {}
    if (window.BL_STORE && BL_STORE.MEDIA_KEYS && BL_STORE.MEDIA_KEYS.includes(ключ)) {
      // за медийните — приблизителна оценка от кеша, ако е достъпен
      try {
        const dump = BL_STORE.mediaDump ? BL_STORE.mediaDump() : {};
        b = (dump[ключ] || '').length || b;
      } catch (e) {}
    }
    return b;
  }

  function чети() {
    const cat = КАТЕГОРИИ.map(k => ({
      ...k,
      bytes: k.keys.reduce((s, key) => s + размер(key), 0)
    }));
    const общо = cat.reduce((s, c) => s + c.bytes, 0);
    // грубата квота на localStorage е ~5 MB; IndexedDB е стотици MB.
    // Предупреждаваме по текстовата част (localStorage), която е тясното гърло.
    // 💾 заглавието обещава „честно — всичко е тук", а КАТЕГОРИИ изброява само
    //    част от ключовете. Каквото не е в списъка, вече не изчезва — влиза в
    //    „Друго", за да не показваме на мама половин истина за паметта ѝ.
    let текстБайтове = 0, друго = 0;
    const изброени = [];
    КАТЕГОРИИ.forEach(k => k.keys.forEach(x => изброени.push(x)));
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const kk = localStorage.key(i);
        if (!kk || kk.indexOf('bl_') !== 0) continue;
        const дълж = (localStorage.getItem(kk) || '').length;
        текстБайтове += дълж;
        if (!покрит(kk, изброени)) друго += дълж;
      }
    } catch (e) {}
    // 🔴 11.08 (обиколка „данните на майката“): горният цикъл върви по
    //    localStorage, а снимките и звуците живеят в IndexedDB — там
    //    localStorage.key() не стига. Значи медиен ключ, който не е в
    //    КАТЕГОРИИ, не падаше и в „Друго“: изчезваше от екрана НАПЪЛНО.
    //    Измерено: 40 KB нейни снимки (обривът + „ти в кадър“) не се
    //    показваха никъде, под заглавие „честно — всичко е тук“. Ключовете
    //    вече са в категориите си, но мрежата остава — за да не може утре
    //    нов медиен ключ пак да изчезне мълчаливо.
    try {
      const мед = (window.BL_STORE && BL_STORE.mediaDump) ? BL_STORE.mediaDump() : {};
      Object.keys(мед).forEach(kk => {
        if (kk.indexOf('bl_') !== 0 || покрит(kk, изброени)) return;
        друго += String(мед[kk] || '').length;
      });
    } catch (e) {}
    return { cat, общо, текстБайтове, друго };
  }

  const фмт = b => b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : b > 1024 ? Math.round(b / 1024) + ' KB' : b + ' B';

  function storageCard() {
    const c = card('Какво пази приложението 💾 ' + sub('честно — всичко е тук'));
    const d = чети();

    // 10.1.3: предупреждение ПРЕДИ да се напълни
    const ЛИМИТ = 4.5 * 1048576;                 // ~90% от типичните 5 MB
    if (d.текстБайтове > ЛИМИТ * 0.8) {
      const жълто = d.текстБайтове < ЛИМИТ;
      c.appendChild(el('p', 'st-warn' + (жълто ? ' st-warn-y' : ' st-warn-r'),
        жълто
          ? '⚠️ Паметта за текст се пълни. Направи си резервно копие скоро — а ако имаш стари капсули или писма, които не ти трябват, изтрий някои.'
          : '🔴 Паметта за текст е почти пълна. Нови записки може да не се запазват. Свали резервно копие СЕГА и разчисти старото.'));
    }

    // 10.1.4: какво пазим, честно
    c.appendChild(el('p', 'jr-privacy',
      'Приложението <strong>не изпраща нищо навън</strong> — затова всичко живее тук, на телефона ти. Ето какво заема място:'));

    const пълно = d.общо + (d.друго || 0);
    const ред = (име, байтове) => {
      const r = el('div', 'st-row');
      const проц = Math.min(100, Math.round(байтове / Math.max(1, пълно) * 100));
      r.innerHTML = `<span class="st-name">${име}</span>
        <span class="st-bar"><span class="st-fill" style="width:${проц}%"></span></span>
        <span class="st-size">${фмт(байтове)}</span>`;
      c.appendChild(r);
    };
    d.cat.forEach(cat => { if (cat.bytes) ред(cat.име, cat.bytes); });
    if (d.друго) ред('🗂️ Друго (списъци, планове, бележки, чернови)', d.друго);
    if (!пълно) c.appendChild(el('p', 'jr-privacy', 'Още е празно — като почнеш да пишеш и снимаш, тук ще виждаш какво заема място.'));
    else c.appendChild(el('p', 'jr-privacy', `Общо: <strong>${фмт(пълно)}</strong>. Снимките и звуците са в големия склад (стотици MB място). Текстът е в по-малкия — него го дръж под око.`));

    c.appendChild(el('p', 'jr-privacy',
      '🔒 Нищо от това не сме виждали и няма да видим. Ако смениш телефон — направи резервно копие; ако изтриеш приложението — данните си отиват с него. Затова копието е важно.'));
    return c;
  }

  window.BL_STORAGE = { чети };

  const база = window.ROOM_FEATURES && window.ROOM_FEATURES['Инструменти'];
  if (база) window.ROOM_FEATURES['Инструменти'] = root => { база(root); root.appendChild(storageCard()); };
})();
