// ═══════════════════════════════════════════════════════════
// 👩 МОЯТ ПРОФИЛ v3 — МАКС (план 23)
//
// Бутонът в долната навигация: има профил → „Профил“; няма → „Вход“.
// „Регистрацията“ е ЧЕСТНА и ЛОКАЛНА; „входът“ = файлът-копие.
//
// 13 секции: герб (44+ аватара + 📷 снимка) · 🌞 Днес-кръгът · 🔥 серията ·
// 📅 седмицата · ⭐ нивото (+стикер при ново) · 🎯 17 цели · 🏆 стикерите ·
// 🏅 40 медальончета · 👨‍👩‍👧 семейството · 📊 числата · 💾 данните ·
// 🎨 личният щрих · ⚙️ моите неща.
// Дневните скали се нулират в полунощ и се ТРУПАТ (sleephist/dayhist).
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };

  // ══════════════════════════════════════════════════════════════
  // 🔴 21.08 · `save()` ГЪЛТАШЕ ВСЯКА ГРЕШКА МЪЛЧАЛИВО
  //
  // През този един ред минава ВСИЧКО, което профилът пази: името на майката,
  // снимката ѝ, целите, стикерите, нивото, серията. `catch (e) {}` значеше:
  // мама сменя снимката си, екранът се пречертава с новата, тя вижда, че е
  // станало — а на диска няма нищо. На следващото пускане снимката я няма и
  // никой никога не ѝ е казал защо.
  //
  // ЗАЩО НЕ ПРОСТО „хвърли нагоре“: досега е падало тихо и приложението е
  // продължавало. Такова трябва да си остане — падаме тихо, КАЗВАМЕ, и пак
  // продължаваме. Едно съобщение на пускане, не при всеки опит (не сме папагал).
  //
  // ТРИТЕ ПРИЧИНИ СА РАЗЛИЧНИ И СЪВЕТЪТ Е РАЗЛИЧЕН:
  //   · пълна памет (QuotaExceededError / code 22)  → разчисти
  //   · забранено хранилище / частен режим (SecurityError) → обикновен прозорец
  //   · записът е прекалено голям (RangeError от JSON.stringify) → това дори не
  //     стига до localStorage, тоест лентата за квота в js/store.js НЯМА как да
  //     го хване. Единствената уловка е тази тук.
  //
  // ⚠️ ЕДИН ГЛАС: при пълна памет js/store.js вече показва своята лента
  // (квотаВик, store.js:185) — тогава мълчим, за да не крещим два пъти за едно
  // и също. Проверява се по window.BL_STORE, тоест по това дали прехващачът е
  // на място.
  //
  // ПЪТ НАЗАД: върни едноредовия `save` от git HEAD и махни `записКазан`/
  //   `записПадна`. Никой не чете върнатата стойност — тя е добавка, не условие.
  // ══════════════════════════════════════════════════════════════
  let записКазан = false;
  function записПадна(e) {
    if (записКазан) return;
    const квота = !!(e && (e.name === 'QuotaExceededError' || e.code === 22 || e.name === 'NS_ERROR_DOM_QUOTA_REACHED'));
    if (квота && window.BL_STORE) return;          // складът вече е казал — един глас стига
    записКазан = true;
    const текст = квота
      ? '⚠️ <strong>Това не се запази — паметта на телефона е пълна.</strong> Освободи малко място (видеа, стари снимки) и го напиши пак. Виж и „Какво пази приложението 💾“ в Инструменти.'
      : (e && e.name === 'SecurityError')
        ? '⚠️ <strong>Това не се запази.</strong> Прозорецът е „частен/инкогнито“ или браузърът не дава на приложението да пази нищо. Отвори Бейби Ленд в обикновен прозорец и го напиши пак.'
        : '⚠️ <strong>Това не се запази 💛</strong> Записът се оказа прекалено голям за телефона. Ако си слагала снимка — пробвай с по-малка. Останалото ти е на място.';
    const сложи = () => {
      try {
        if (!document.body) return;
        const л = document.createElement('div');
        л.className = 'bo-bar on';
        л.style.zIndex = 9702;
        л.innerHTML = '<span class="bo-t">' + текст + '</span><button class="bo-no" type="button" aria-label="Затвори">✕</button>';
        л.querySelector('.bo-no').addEventListener('click', () => л.remove());
        document.body.appendChild(л);
      } catch (e2) {}
    };
    if (document.body) сложи();
    else try { document.addEventListener('DOMContentLoaded', сложи, { once: true }); } catch (e2) {}
  }
  const save = (k, v) => {
    try { localStorage.setItem(k, JSON.stringify(v)); return true; }
    catch (e) { записПадна(e); return false; }      // тихо, но НЕ мълчаливо — и продължаваме
  };
  const raw = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };  // за bl_theme/bl_sounds (голи низове)
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const localDate = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const today = () => localDate(new Date());
  const преди = n => localDate(new Date(Date.now() - n * 86400000));
  const fx = () => window.BL_FX || { confetti() {}, cheer() {}, buzz() {} };

  function седмица() {
    const n = new Date();
    const пон = new Date(n); пон.setDate(n.getDate() - ((n.getDay() + 6) % 7));
    return localDate(пон);
  }
  const вСедмицата = d => typeof d === 'string' && d >= седмица();
  const имаПрофил = () => !!(load('bl_mama', {}).name || '').trim() || !!load('bl_onboarded', false);

  // ═══════════ АВАТАРИТЕ (А1-А3): жени · символи · снимка ═══════════
  const АВАТАРИ = {
    '👩 Жени': ['👩🏻', '👩🏼', '👩🏽', '👩🏾', '👩🏿', '👩🏻‍🦰', '👩🏼‍🦰', '👩🏽‍🦰', '👩🏻‍🦱', '👩🏽‍🦱', '👩🏾‍🦱', '👱🏻‍♀️', '👱🏽‍♀️', '👩🏻‍🦳', '🧕🏻', '🧕🏽', '👸🏻', '👸🏽', '👸🏾', '🤱🏻', '🤱🏽', '👩🏻‍🍼', '👩🏽‍🍼', '💁🏻‍♀️', '🙆🏼‍♀️', '🧘🏻‍♀️', '💃🏻', '🤰🏻'],
    '🌸 Символи': ['🌸', '🌷', '🌹', '🌺', '🌻', '🌼', '🍀', '🦋', '🐝', '🐞', '🌙', '☀️', '⭐', '🌈', '💎', '👑', '❤️', '🔥', '🫶', '✨']
  };

  function аватарЪгъл(мама, готово) {
    const w = el('div', 'prof-avpick');
    const табове = el('div', 'prof-avtabs');
    const тяло = el('div');
    const имена = Object.keys(АВАТАРИ).concat(['📷 Снимка']);
    let активен = имена[0];

    const рисувай = () => {
      табове.innerHTML = ''; тяло.innerHTML = '';
      имена.forEach(име => {
        const t = el('button', 'prof-avtab' + (име === активен ? ' on' : ''), име); t.type = 'button';
        t.addEventListener('click', () => { активен = име; рисувай(); });
        табове.appendChild(t);
      });
      if (активен === '📷 Снимка') {
        тяло.appendChild(el('p', 'prof-note', 'Снимката се смалява и остава <strong>само на този телефон</strong> — не тръгва наникъде.'));
        const лейбъл = el('label', 'prof-cta prof-cta2', '📷 Избери снимка');
        const f = el('input'); f.type = 'file'; f.accept = 'image/*'; f.style.display = 'none';
        // 🔴 21.08 · ДВА МЪЛЧАЛИВИ ИЗХОДА В ЕДИН ОБРАБОТЧИК:
        //    1) `img.onerror` само освобождаваше адреса. Мама избира снимка (HEIC
        //       от айфон, повреден файл, .webp на стар Android) — и НИЩО. Нито
        //       снимка, нито дума. Тя натиска пак и пак.
        //    2) `save()` гълташе провала, а редът след него пречертаваше екрана с
        //       новата снимка. Тоест мама я ВИЖДА на екрана и си мисли, че е
        //       запазена; на следващото пускане я няма. Сега `save` връща честен
        //       отговор (виж горе) и не празнуваме, когато не е станало.
        //    ПЪТ НАЗАД: върни двата реда от git HEAD (save+buzz+готово, и голия onerror).
        const кажи = т => { лейбъл.textContent = т; setTimeout(() => { лейбъл.textContent = '📷 Избери снимка'; }, 3600); };
        f.addEventListener('change', () => {
          const файл = f.files[0]; if (!файл) return;
          const img = new Image();
          img.onload = () => {
            const cv = document.createElement('canvas'); cv.width = cv.height = 128;
            const cx = cv.getContext('2d');
            const с = Math.min(img.width, img.height);
            cx.drawImage(img, (img.width - с) / 2, (img.height - с) / 2, с, с, 0, 0, 128, 128);
            мама.photo = cv.toDataURL('image/jpeg', 0.82);
            const стана = save('bl_mama', мама);
            URL.revokeObjectURL(img.src);
            if (!стана) {                          // лентата вече е казала причината
              delete мама.photo;                   // не показваме за запазено нещо, което го няма
              кажи('Снимката не се запази 💛');
              return;
            }
            fx().buzz(10); if (готово) готово();
          };
          img.onerror = () => {
            URL.revokeObjectURL(img.src);
            кажи('Тази снимка не се отвори 💛 Пробвай друга');
          };
          img.src = URL.createObjectURL(файл);
        });
        лейбъл.appendChild(f); тяло.appendChild(лейбъл);
        if (мама.photo) {
          const мах = el('button', 'jr-chip', '🗑 Махни снимката'); мах.type = 'button';
          мах.addEventListener('click', () => { delete мама.photo; save('bl_mama', мама); if (готово) готово(); });
          тяло.appendChild(мах);
        }
      } else {
        const g = el('div', 'prof-avgrid');
        АВАТАРИ[активен].forEach(e => {
          const b = el('button', 'prof-av' + (!мама.photo && e === мама.emoji ? ' on' : ''), e); b.type = 'button';
          b.addEventListener('click', () => {
            мама.emoji = e; delete мама.photo; save('bl_mama', мама);
            fx().buzz(6); if (готово) готово();
          });
          g.appendChild(b);
        });
        тяло.appendChild(g);
      }
    };
    рисувай();
    w.appendChild(табове); w.appendChild(тяло);
    return w;
  }
  // Снимката е data-URL, който НИЕ правим (toDataURL). Но при възстановяване
  // от ВНЕСЕН файл bl_mama.photo може да носи '"><img onerror=…' → XSS
  // (одит-флот П23, проход 2 №3). Пускаме я в src САМО ако е чист data:image.
  const безопаснаСнимка = p => typeof p === 'string' && /^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(p);
  const аватарКод = (мама, кл) => безопаснаСнимка(мама.photo)
    ? '<img class="' + кл + ' prof-photo" src="' + мама.photo + '" alt="аватар">'
    : '<span class="' + кл + '">' + esc(мама.emoji || '🌸') + '</span>';

  // ═══════════ НИВОТО ═══════════
  function точки() {
    let xp = 0;
    xp += Object.keys(load('bl_badges', {})).length * 30;
    xp += ((load('bl_lab', { done: [] }).done) || []).length * 40;
    xp += Object.keys(load('bl_firsts', {})).length * 15;
    xp += Object.keys(load('bl_checkins', {})).length * 6;
    xp += Object.keys(load('bl_walk_days', {})).length * 6;
    xp += load('bl_wm_mirror', []).length * 8;
    xp += load('bl_wm_compl', []).length * 10;
    xp += Object.keys(load('bl_tried', {})).length * 8;
    xp += load('bl_lab_timeline', []).length * 5;
    xp += load('bl_goal_stickers', []).length * 25;
    xp += Object.keys(load('bl_water_hist', {})).length * 3;
    xp += Object.keys(load('bl_sleep_hist', {})).length * 3;
    return xp;
  }
  const НИВА = [
    [0, '🌱', 'Първи стъпки'], [100, '🌷', 'Разцъфване'], [250, '🕊️', 'Спокойни ръце'],
    [450, '🌙', 'Пазителка на нощта'], [700, '⭐', 'Звезда на деня'], [1000, '🔥', 'Непобедима'],
    [1400, '💎', 'Диамантена'], [1900, '👑', 'Кралица на рутината'], [2500, '🦸', 'Супермама'],
    [3200, '🌟', 'Легенда']
  ];
  function ниво(xp) {
    let i = 0; while (i + 1 < НИВА.length && xp >= НИВА[i + 1][0]) i++;
    const тек = НИВА[i], след = НИВА[i + 1] || null;
    // 🔴 19.08 · ЛЕНТАТА И ТЕКСТЪТ КАЗВАХА РАЗНИ НЕЩА. Редът отдолу мереше
    //    напредъка ВЪТРЕ в нивото (xp − текущия праг), а надписът до лентата
    //    пише дроба „xp / следващия праг“. При 1900 звездички текстът казваше
    //    „1900 / 2500“, а лентата стоеше на 0%. ИЗМЕРЕНО по цялата скала
    //    0–3400: 2856 точки се разминаваха с над 5 пункта, най-лошата с 78;
    //    и 18 стойности показваха ПРАЗНА лента на майка с натрупани звездички.
    //    Сега лентата е СЪЩИЯТ дроб, който тя чете: xp / следващия праг.
    //    ПЪТ НАЗАД: върни `(xp - тек[0]) / (след[0] - тек[0])`.
    const проц = след ? Math.max(0, Math.min(100, Math.round(xp / след[0] * 100))) : 100;
    return { n: i + 1, e: тек[1], име: тек[2], проц, след, xp };
  }
  // Б3: кацане на ново ниво = празник + стикер-корона
  function провериНиво(л) {
    const видяно = load('bl_level_seen', 1);
    if (typeof видяно === 'number' && л.n > видяно) {
      const ст = load('bl_goal_stickers', []);
      ст.push({ e: л.e, n: 'Ниво ' + л.n + ' — ' + л.име, d: today() });
      save('bl_goal_stickers', ст);
      fx().confetti(); fx().cheer(л.e + ' Ново ниво: „' + л.име + '“!');
    }
    save('bl_level_seen', л.n);
  }

  // ═══════════ 🎯 ЦЕЛИТЕ (17) ═══════════
  const ЦЕЛИ = [
    { id: 'walk3', e: '🚶‍♀️', n: '3 дни с разходка', цел: 3, type: 'week', mer: () => Object.keys(load('bl_walk_days', {})).filter(вСедмицата).length },
    { id: 'walk5', e: '🏞️', n: '5 дни с разходка', цел: 5, type: 'week', mer: () => Object.keys(load('bl_walk_days', {})).filter(вСедмицата).length },
    { id: 'care4', e: '🌷', n: '4 минутки за теб', цел: 4, type: 'week', mer: () => Object.keys(load('bl_checkins', {})).filter(вСедмицата).length },
    { id: 'care7', e: '💐', n: 'Минутка ВСЕКИ ден', цел: 7, type: 'week', mer: () => Object.keys(load('bl_checkins', {})).filter(вСедмицата).length },
    { id: 'lab1', e: '🔬', n: 'Завърши 1 опит', цел: 1, type: 'week', mer: () => ((load('bl_lab', { done: [] }).done) || []).filter(x => x && вСедмицата(x.d)).length },
    { id: 'tap5', e: '👆', n: '5 докосвания на опита', цел: 5, type: 'week', mer: () => { let n = 0; ((load('bl_lab', { list: [] }).list) || []).forEach(e => { if (e && e.log) Object.keys(e.log).forEach(d => { if (вСедмицата(d)) n++; }); }); return n; } },
    { id: 'myth1', e: '👵', n: 'Провери 1 бабин мит', цел: 1, type: 'week', mer: () => ((load('bl_lab', { done: [] }).done) || []).filter(x => x && x.e === '👵' && вСедмицата(x.d)).length },
    { id: 'mirror2', e: '🪞', n: '2 пъти „днес се харесах“', цел: 2, type: 'week', mer: () => load('bl_wm_mirror', []).filter(x => x && вСедмицата(x.d)).length },
    { id: 'ritual3', e: '🕯️', n: 'Ритуалът 3 дни подред', цел: 3, type: 'week', mer: () => { const s = load('bl_wm_ritual_streak', { n: 0, last: '' }); return (вСедмицата(s.last) ? (s.n || 0) : 0); } },
    { id: 'water3', e: '💧', n: '3 дни по 6+ чаши вода', цел: 3, type: 'week', mer: () => { const h = load('bl_water_hist', {}); let n = Object.keys(h).filter(d => вСедмицата(d) && h[d] >= 6).length; const ж = load('bl_water', {}); if (ж && ж.d === today() && ж.n >= 6) n++; return n; } },
    { id: 'food2', e: '🍎', n: '2 нови храни', цел: 2, type: 'delta', mer: () => Object.keys(load('bl_tried', {})).length },
    { id: 'first1', e: '⭐', n: 'Запиши 1 „първи път“', цел: 1, type: 'delta', mer: () => Object.keys(load('bl_firsts', {})).length },
    { id: 'compl1', e: '💌', n: 'Запиши 1 комплимент', цел: 1, type: 'delta', mer: () => load('bl_wm_compl', []).length },
    { id: 'trace2', e: '🕵️', n: '2 следи в лабораторията', цел: 2, type: 'delta', mer: () => load('bl_lab_timeline', []).length },
    { id: 'flip1', e: '🔄', n: 'Отбележи 1 „работеше и спря“', цел: 1, type: 'delta', mer: () => load('bl_lab_flipped', []).length },
    { id: 'place1', e: '🗺️', n: 'Добави 1 място на картата', цел: 1, type: 'delta', mer: () => load('bl_wm_places', []).length },
    { id: 'letter1', e: '💜', n: 'Запечатай 1 писмо', цел: 1, type: 'delta', mer: () => load('bl_wm_letters', []).length }
  ];
  function целиСт() {
    let st = load('bl_goals', { week: '', chosen: [], done: {} });
    if (!Array.isArray(st.chosen)) st.chosen = [];
    if (!st.done || typeof st.done !== 'object') st.done = {};
    if (st.week !== седмица()) st = { week: седмица(), chosen: [], done: {} };
    return st;
  }
  function прогрес(st, c) {
    const деф = ЦЕЛИ.find(x => x.id === c.id); if (!деф) return { сега: 0, цел: 1 };
    const сега = деф.type === 'delta' ? Math.max(0, деф.mer() - (c.base || 0)) : деф.mer();
    return { сега: Math.min(сега, деф.цел), цел: деф.цел, готова: сега >= деф.цел };
  }
  function провериНагради(st) {
    let има = false;
    st.chosen.forEach(c => {
      if (st.done[c.id]) return;
      const p = прогрес(st, c);
      if (p.готова) {
        st.done[c.id] = today();
        const деф = ЦЕЛИ.find(x => x.id === c.id);
        const ст = load('bl_goal_stickers', []);
        ст.push({ e: деф.e, n: деф.n, d: today() });
        save('bl_goal_stickers', ст);
        има = деф;
      }
    });
    if (има) { save('bl_goals', st); fx().confetti(); fx().cheer(има.e + ' Цел постигната: „' + има.n + '“!'); }
    return st;
  }

  // ═══════════ 🌞 ДНЕС + 🔥 СЕРИЯ + 📅 СЕДМИЦА (В1-В3, Г3) ═══════════
  function днесНещата() {
    const t = today();
    const рт = load('bl_wm_ritual', {});
    const огл = load('bl_wm_mirror', []).some(x => x && x.d === t);
    let докосване = false;
    ((load('bl_lab', { list: [] }).list) || []).forEach(e => { if (e && !e.closed && e.log && e.log[t]) докосване = true; });
    return [
      ['🌷', 'минутка за теб', !!load('bl_checkins', {})[t]],
      ['📸', 'снимка на деня', load('bl_photo_day', '') === t],
      ['✍️', 'записка', load('bl_prompt_done', '') === t || load('bl_freepage', []).some(n => n && n.d && localDate(new Date(n.d)) === t)],
      ['🕯️', 'ритуалът', ритуалДнес(рт, t)],
      ['🪞', 'огледалото', огл],
      ['👆', 'докосване на опита', докосване]
    ];
  }
  function ритуалДнес(рт, t) { return !!(рт && рт.d === t && рт.done); }

  // ═══════════ 🔥 ЕДНА СЕРИЯ ЗА ЦЯЛОТО ПРИЛОЖЕНИЕ ═══════════
  // [БЛОК-СЕРИЯ-НАЧАЛО] · 19.08 · ТОЗИ БЛОК Е ДУМА ПО ДУМА ЕДИН И СЪЩ
  // в js/daily.js и js/profile.js. Който модул се зареди пръв, той дава
  // числото; другият го чете. Пази ги еднакви: node dev/edna_seria.js
  //
  // ЗАЩО: „Днес“ броеше серия САМО по bl_walk_days, а bl_walk_days се пише
  // единствено когато картата на разходката се е нарисувала. Профилът броеше
  // по bl_walk_days ИЛИ bl_checkins. ИЗМЕРЕНО на 11 случая: 6 се разминаваха,
  // най-лошият — „Днес=0“ срещу „Профил=30“ за една и съща майка.
  // Обединението никога не маха ден, който единият е виждал: то е по-голямото
  // от двете, значи нито един екран не отнема нищо на майката.
  // ПЪТ НАЗАД: махни блока от двата файла и върни `streak()` в daily.js и
  // `активенДен`/`серия()` в profile.js от копията PREDI_*.js.
  window.BL_SERIA = window.BL_SERIA || (function () {
    const чети = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return (v == null || typeof v !== 'object') ? d : v; } catch (e) { return d; } };
    const дата = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const днес = () => дата(new Date());
    // котва по обед: 24 часа назад от 12:00 винаги пада в предишния календарен
    // ден, дори в нощта на смяна на часа (капан 7 — мярка по разлика, не по час)
    const предишен = s => дата(new Date(new Date(s + 'T12:00:00').getTime() - 86400000));
    const активен = d => {
      const w = чети('bl_walk_days', {}), c = чети('bl_checkins', {});
      return !!(w[d] || c[d]);
    };
    function дни() {
      let n = 0, d = днес();
      if (!активен(d)) d = предишен(d);        // днес още може да дойде — не наказваме
      let i = 0;
      while (активен(d) && i < 400) { n++; i++; d = предишен(d); }
      return n;
    }
    function сметни() {
      const n = дни();
      const стар = (function () { try { const v = JSON.parse(localStorage.getItem('bl_streak_best')); return typeof v === 'number' ? v : 0; } catch (e) { return 0; } })();
      const best = Math.max(стар, n);
      if (best !== стар) { try { localStorage.setItem('bl_streak_best', JSON.stringify(best)); } catch (e) {} }
      return { n, best };
    }
    return { дни, сметни, активен, предишен, днес };
  })();
  // [БЛОК-СЕРИЯ-КРАЙ]
  // 🔴 19.08 · СЕРИЯТА СЕ СМЯТА НА ЕДНО МЯСТО — [БЛОК-СЕРИЯ] отгоре, същият
  //    блок и в js/daily.js. Тук стоеше второ, различно преброяване: то и
  //    „Днес“ даваха РАЗЛИЧНИ числа за една и съща майка (измерено: 6 от 11
  //    случая, най-лошият 0 срещу 30). Числото на профила не се променя —
  //    правилото на обединението е точно това, което стоеше тук.
  //    ПЪТ НАЗАД: върни тялото от scratchpad/PREDI_profile.js.
  const активенДен = d => BL_SERIA.активен(d);
  const серия = () => BL_SERIA.сметни();

  function секцияДнес() {
    const c = el('section', 'prof-card');
    const неща = днесНещата();
    const n = неща.filter(x => x[2]).length;
    const R = 30, дълж = 2 * Math.PI * R;
    c.innerHTML = `<h4 class="prof-h">🌞 Днес при теб</h4>
      <div class="prof-todayrow">
        <svg class="prof-ring" viewBox="0 0 76 76">
          <circle cx="38" cy="38" r="${R}" class="prof-ringbg"/>
          <circle cx="38" cy="38" r="${R}" class="prof-ringfill" stroke-dasharray="${дълж}" stroke-dashoffset="${дълж * (1 - n / неща.length)}"/>
          <text x="38" y="43" class="prof-ringtxt">${n}/${неща.length}</text>
        </svg>
        <div class="prof-todaylist">${неща.map(x =>
          `<span class="prof-tditem${x[2] ? ' on' : ''}">${x[0]} ${esc(x[1])}</span>`).join('')}</div>
      </div>`;
    // дневните броячи, които се нулират в полунощ и СЕ ТРУПАТ
    const вода = load('bl_water', {}), мл = load('bl_ml', {});
    const редче = [];
    if (вода && вода.d === today() && вода.n > 0) редче.push('💧 ' + вода.n + ' ' + (вода.n === 1 ? 'чаша' : 'чаши') + ' вода');
    if (мл && мл.d === today() && мл.n > 0) редче.push('🍼 ' + мл.n + ' мл');
    if (window.BL_SLEEPHIST && BL_SLEEPHIST.днес() > 0) { const m = BL_SLEEPHIST.днес(); редче.push('😴 ' + Math.floor(m / 60) + ' ч ' + (m % 60) + ' мин сън'); }
    if (редче.length) c.appendChild(el('p', 'prof-daycnt', редче.join(' · ')));
    c.appendChild(el('p', 'prof-note', 'Кръгът се нулира в полунощ — а свършеното се прибира в серията, седмицата и историите. Нищо не се губи.'));
    return c;
  }

  function секцияСерия() {
    const { n, best } = серия();
    const c = el('section', 'prof-card prof-streak');
    c.innerHTML = `<div class="prof-strow">
      <div class="prof-stbox"><span class="prof-stn">🔥 ${n}</span><span class="prof-stl">${n === 1 ? 'ден' : 'дни'} подред</span></div>
      <div class="prof-stbox"><span class="prof-stn">🏔️ ${best}</span><span class="prof-stl">личен рекорд</span></div>
    </div>
    <p class="prof-note">${n === 0 ? 'Серията тръгва от първото малко нещо днес — разходка или минутка за теб.' : 'Пропуснат ден не е провал — серията просто тръгва отново. Без вина.'}</p>`;
    return c;
  }

  function секцияСедмица() {
    const c = el('section', 'prof-card');
    c.appendChild(el('h4', 'prof-h', '📅 Седмицата ти'));
    const дни = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'нд'];
    const ред = el('div', 'prof-week');
    const walk = load('bl_walk_days', {}), ck = load('bl_checkins', {});
    for (let i = 6; i >= 0; i--) {
      const d = преди(i);
      const сила = (walk[d] || 0) + (ck[d] ? 1 : 0);
      const дот = el('div', 'prof-wday');
      const клас = сила >= 3 ? ' w3' : сила === 2 ? ' w2' : сила === 1 ? ' w1' : '';
      дот.innerHTML = `<span class="prof-wdot${клас}${d === today() ? ' wt' : ''}"></span><span class="prof-wlbl">${дни[(new Date(d + 'T12:00').getDay() + 6) % 7]}</span>`;
      дот.title = d + (сила ? ' · ' + сила : ' · тихо');
      ред.appendChild(дот);
    }
    c.appendChild(ред);
    return c;
  }

  // ═══════════ ЕКРАНЪТ ═══════════
  // dialog-семантика + Escape + фокус (одит-флот П23, проход 2 №5) — беше
  // единственият голям оверлей без тях; конвенцията е като search/roommap.
  let слой = null;
  let фокусПреди = null;                     // къде беше мама — за да я върнем
  function затвориСлоя() {
    if (!слой) return;
    document.removeEventListener('keydown', наКлавиш);
    слой.remove(); слой = null;
    try { if (фокусПреди && фокусПреди.focus) фокусПреди.focus(); } catch (e) {}
    фокусПреди = null;
  }
  function наКлавиш(e) {
    if (e.key === 'Escape') { затвориСлоя(); return; }
    if (e.key === 'Tab' && слой) {           // мек фокус-капан в кутията
      const ф = слой.querySelectorAll('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])');
      if (!ф.length) return;
      const първи = ф[0], последен = ф[ф.length - 1];
      if (e.shiftKey && document.activeElement === първи) { e.preventDefault(); последен.focus(); }
      else if (!e.shiftKey && document.activeElement === последен) { e.preventDefault(); първи.focus(); }
    }
  }
  function отвори() {
    // 🔴 18.08 (жива обиколка, ИЗМЕРЕНО): надписът се смяташе САМО веднъж при
    //    зареждане на файла. `имаПрофил()` обаче става вярно и от bl_onboarded,
    //    който онбордингът записва ПО-КЪСНО — включително при „По-късно“.
    //    Измерено: bl_mama=null, долният бутон пише „🔑 Вход“, а отваря пълния
    //    профил на „Мама“. Тоест надписът лъже до следващото презареждане.
    //    Тук поне се самолекува при отваряне; onboard.js вече вика refresh().
    надписНаБутона();
    if (слой) слой.remove();
    фокусПреди = document.activeElement;
    слой = el('div', 'prof-overlay');
    const кутия = el('div', 'prof-box');
    кутия.setAttribute('role', 'dialog');
    кутия.setAttribute('aria-modal', 'true');
    кутия.setAttribute('aria-label', 'Профил');
    слой.appendChild(кутия);
    слой.addEventListener('click', e => { if (e.target === слой) затвориСлоя(); });
    document.addEventListener('keydown', наКлавиш);
    рисувайВ(кутия);
    document.body.appendChild(слой);
    try { const x = кутия.querySelector('.prof-close'); if (x) x.focus(); } catch (e) {}
  }
  function рисувайВ(кутия) {
    кутия.innerHTML = '';
    const затвори = el('button', 'prof-close', '✕'); затвори.type = 'button'; затвори.setAttribute('aria-label', 'Затвори');
    затвори.addEventListener('click', затвориСлоя);
    кутия.appendChild(затвори);
    if (имаПрофил()) профил(кутия); else входРегистрация(кутия);
  }

  // ── ВХОД И РЕГИСТРАЦИЯ ──
  function входРегистрация(root) {
    root.appendChild(el('div', 'prof-hero prof-hero-guest',
      '<span class="prof-big">👩‍🍼</span><h3>Здравей! Още не се познаваме.</h3>' +
      '<p>Профилът ти се създава <strong>тук, на телефона</strong> — без имейл, без парола, без интернет. Никой освен теб не го вижда.</p>'));

    const рег = el('section', 'prof-card');
    рег.appendChild(el('h4', 'prof-h', '📝 Регистрация — създай профила си'));
    const име = el('input', 'prof-inp'); име.placeholder = 'Как да те наричам? (напр. Ани)'; име.maxLength = 24;
    име.setAttribute('aria-label', 'Как да те наричам');   // имаше само placeholder — четецът на екрана мълчеше
    рег.appendChild(име);
    рег.appendChild(el('p', 'prof-note', 'Избери си лице (после можеш и снимка):'));
    const мама = { name: '', emoji: '🌸' };
    рег.appendChild(аватарЪгъл(мама, () => {}));
    const създай = el('button', 'prof-cta', '✨ Създай профила ми'); създай.type = 'button';
    const греш = el('p', 'prof-err');
    създай.addEventListener('click', () => {
      const n = име.value.trim();
      if (!n) { греш.textContent = 'Само името липсва — една дума стига. 💛'; return; }
      мама.name = n.slice(0, 24); мама.d = today();
      save('bl_mama', мама);
      fx().confetti(); fx().cheer('Добре дошла, ' + n + '! 🎉');
      надписНаБутона();
      рисувайВ(root);
    });
    // 🔴 18.08 (жива обиколка, ИЗМЕРЕНО): полето нямаше нищо на Enter. Мама
    //    пише името си, натиска Enter на клавиатурата на телефона — и НИЩО.
    //    Мълчалив бутон. А редакторът на името в СЪЩИЯ файл (по-долу, в герба)
    //    вече слуша Enter — тоест екранът се държеше по два начина за едно и
    //    също действие. ПЪТ НАЗАД: махни следващия ред.
    име.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); създай.click(); } });
    рег.appendChild(създай); рег.appendChild(греш);
    root.appendChild(рег);

    root.appendChild(качванеНаКопие({
      заглавие: '🔑 Вход — вече имам профил',
      бележка: 'Профилът ти живее във <strong>файла-копие</strong> от стария телефон (от „Инструменти → Резервно копие“). Качи го и всичко се връща.',
      надпис: '⬆️ Качи файла-копие'
    }));

    root.appendChild(el('p', 'prof-legal', '🔒 Никаква регистрация в интернет. „Профил“ тук значи: твоето име и твоите записки, на твоя телефон.'));
  }

  // ═══════════════════════════════════════════════════════════
  // 💾 КАЧВАНЕ НА КОПИЕТО — ЕДИН код, ДВЕ места
  //
  // 🔴 18.08 (жива обиколка + думата на собственика): този блок стоеше САМО в
  // екрана за гост. Влезеше ли веднъж („По-късно" в онбординга пали bl_onboarded),
  // майката вече беше „с профил" и качването изчезваше от приложението —
  // точно на новия телефон, където ѝ е ЕДИНСТВЕНО нужно. Долният ред на профила
  // пък я пращаше към „Инструменти → Възстанови от файл".
  //
  // ЗАЩО ФУНКЦИЯ, А НЕ ВТОРО КОПИЕ НА КОДА: тук живеят отключването с парола,
  // списъкът какво НЕ влиза от чужд телефон, броенето на съществуващите записи,
  // разделянето „няма място" от „файлът е счупен" и чакането медията да кацне в
  // IndexedDB. Второ копие значи два пътя, които се разминават при следващата
  // поправка — а цената се плаща от жена, чийто телефон е нов и празен.
  //
  // ПЪТ НАЗАД: върни съдържанието на функцията обратно вътре в входРегистрация
  // и махни двете извиквания (тук и в 💾 данните).
  // ═══════════════════════════════════════════════════════════
  // ── 💛 когато снимките не са кацнали: КАЗВАМЕ, и то различно за двете причини ──
  // Пълна памет и частен режим НЕ са едно и също нещо и съветът е различен:
  // едното се лекува с разчистване, другото — с обикновен прозорец. Тонът е на
  // приятелка, не на системно съобщение: без „QuotaExceededError“.
  //
  // ЗАЩО НЕ САМО BL_FX.cheer: `cheer()` мълчи в „тежък ден“ и при включено
  // „по-малко движение“ (js/fx.js:94 и :96 — две ранни излизания). За празник
  // това е правилно; за „снимките ти ги няма“ би било втора мълчалива загуба.
  // Затова носещото съобщение е ТЕКСТ В КАРТАТА (винаги се вижда и остава на
  // екрана), а cheer е само допълнително побутване.
  const причинаЗаМедия = () => {
    try { return localStorage.getItem('blx_media_fail') === 'nema' ? 'nema' : 'pyalna'; } catch (e) { return 'pyalna'; }
  };
  function медияГрешка(влезли) {
    const частен = причинаЗаМедия() === 'nema';
    const п = el('p', 'prof-warn',
      '<strong>Записките ти влязоха' + (влезли ? ' (' + влезли + (влезли === 1 ? ' нещо' : ' неща') + ')' : '') +
      ' — снимките и гласовите не.</strong> ' +
      (частен
        ? 'Този прозорец е „частен/инкогнито“ или браузърът не дава на приложението големия склад, а снимките живеят точно там. Затвори го и отвори Бейби Ленд в обикновен прозорец — после качи <em>същия</em> файл пак.'
        : 'Паметта на телефона е пълна, а снимките заемат най-много място. Освободи малко (видеа, стари снимки, приложения) и качи <em>същия</em> файл пак.') +
      ' Второто качване не поврежда нищо — само дописва каквото липсва. 💛');
    return п;
  }

  function качванеНаКопие(опции) {
    const о = опции || {};
    const НАДПИС = о.надпис || '⬆️ Качи файла-копие';
    const вход = el('section', 'prof-card');
    if (о.заглавие) вход.appendChild(el('h4', 'prof-h', о.заглавие));
    if (о.бележка) вход.appendChild(el('p', 'prof-note', о.бележка));
    const лейбъл = el('label', 'prof-cta prof-cta2', НАДПИС);
    const файл = el('input'); файл.type = 'file'; файл.accept = 'application/json'; файл.style.display = 'none';
    файл.addEventListener('change', () => {
      const f = файл.files[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = async () => {
        try {
          let p = JSON.parse(rd.result);
          // 15.3.6: заключен файл → искаме паролата и го отваряме тук
          if (window.BL_CRYPTO && BL_CRYPTO.заключенЛи && BL_CRYPTO.заключенЛи(p)) {
            const парола = await BL_CRYPTO.питайЗаПарола('стар');
            if (!парола) { лейбъл.textContent = НАДПИС; return; }
            лейбъл.textContent = '🔓 Отключвам…';
            try { p = JSON.parse(await BL_CRYPTO.отключи(p, парола)); }
            catch (e) { лейбъл.textContent = 'Грешна парола 🔐'; setTimeout(() => лейбъл.textContent = НАДПИС, 2600); return; }
          }
          const dd = p.data || p;
          // ⛔ 12.08 (тест за паметта, ред „чужд файл: нищо не влиза в паметта“):
          //    вносът записваше ВСЕКИ ключ с префикс bl_ от файла. Значи от чуждия
          //    телефон идваше и вътрешното състояние на екрана — кои карти са
          //    сгънати, кои стаи са посетени, коя тема е избрана, кога ОНЗИ телефон
          //    си е правил копие. Това не са записи на майката; това е чуждо
          //    устройство, което се настанява върху нейното.
          //
          //    ВЛИЗА само нейното: бебето и профилът, сънят, храненията, пелените,
          //    мерките, ваксините, чекировките, дневниците и писмата, списъците и
          //    чеклистите (bl_chk_…), тайната стая (bl_wm_…), И медийните ключове
          //    от js/store.js (bl_photos, bl_voice, bl_art…) — без тях албумът ѝ
          //    не пристига на новия телефон.
          //
          //    Защо списък на ИЗКЛЮЧЕНИЯТА, а не изброяване на позволените: имена
          //    на нейни ключове се съставят в движение (bl_chk_<име на списък>,
          //    ключове с наставки _k и _idx), тоест позволен списък НЕ може да е
          //    пълен. Забравен ред в позволените = мълчаливо липсващ дневник на
          //    новия телефон. Забравен ред тук = една сгъната карта.
          //
          //    ⚠️ Схемните флагове (bl_vax_schema, bl_art_merged, bl_qped_merged)
          //    нарочно ПЪТУВАТ. Миграцията на ваксините (js/rooms2.js, „мигрирайВаксини“)
          //    НЕ е безопасна за второ пускане: без флага тя би пренаредила вече
          //    пренаредени отметки и мама щеше да види чужди ваксини. Флагът е част
          //    от смисъла на данните, не украса.
          const НЕ_ВЛИЗА = /^(bl_folds|bl_folddefaults|bl_fskeep_fix|bl_seen_cards|bl_carduse|bl_pins|bl_lib_open|bl_lib_opens|bl_room_asked|bl_room_visited|bl_wm_visits|bl_theme|bl_sounds|bl_font|bl_tz|bl_pin|bl_pin_h|bl_pin_set|bl_backup_last|bl_backup_partial_last|bl_agent_miss|bl_heavy_day)$/;
          const неин = k => k.indexOf('bl_') === 0 && !НЕ_ВЛИЗА.test(k);
          // 🟠 11.08: чужд JSON минаваше право към червения диалог за
          //    презаписване. Първо — има ли изобщо какво да влезе.
          if (!Object.keys(dd).some(неин)) {
            лейбъл.textContent = 'Файлът не носи данни от Бейби Ленд 😕';
            setTimeout(() => лейбъл.textContent = НАДПИС, 3200); return;
          }
          // проход 3 S5: ако устройството ВЕЧЕ има записи — питай, преди сляпо да
          // ги заменим. Иначе месеци дневник от ТОЗИ телефон изчезват безвъзвратно
          // при качване на старо копие. Пропускаме козметично-системните ключове.
          // 🔴 05.08 (одит г14, №133): bl_vax_schema се записва при самото
          //    зареждане на стаята, а bl_tz — от dates2.js при всяко пускане.
          //    На съвсем празен телефон `същ` беше вече 2 и червеният диалог
          //    изскачаше винаги — в първите пет минути на новия телефон.
          // 🟠 11.08 (обиколка „данните на майката“, ИЗМЕРЕНО на изтрит телефон):
          //    оставаха 12 ключа чисто вътрешно счетоводство (сгънати карти,
          //    посетени стаи, ден 1, дъга, тежък ден…) и червеният диалог пак
          //    казваше „вече има записи (12 неща)“ на съвсем празно устройство.
          // 🔴 21.08 · БРОЕНЕТО СЕ ПРЕМЕСТИ В js/store.js (BL_STORE.броиНейни).
          //    Тук стоеше собствен списък ПРОПУСНИ, а js/rooms2.js:1761 има
          //    ВТОРИ, различен (без bl_agent_miss и bl_lib_open, и без 'null' в
          //    празните черупки) — два пътя, които се разминават при всяка
          //    следваща поправка. По-важното: и двата брояха неща, които САМИЯТ
          //    екран току-що е написал. Този профил пише bl_goals (ред 633) и
          //    bl_level_seen (ред 151) при ВСЯКО свое рисуване — значи мама
          //    отваря профила на нов телефон, скролва до качването и приложението
          //    ѝ казва „тук вече има записи“ за неща, които то само си е сложило
          //    преди половин секунда. Плюс bl_qped_merged (схемен флаг) и
          //    bl_streak_best (смята се сам). Точно четири.
          //    Сега броенето е ЕДНО, в склада, и се мери: node dev/skladat.js
          //    ⚠️ js/rooms2.js още брои по стария начин — виж доклада.
          //    ПЪТ НАЗАД: върни цикъла с ПРОПУСНИ от git HEAD.
          let същ = 0;
          if (window.BL_STORE && BL_STORE.броиНейни) същ = BL_STORE.броиНейни();
          else {
            // много стар кеширан store.js → по-добре предпазливо ПРЕКАЛЕНО
            // питане, отколкото мълчаливо презаписване на дневника ѝ
            for (let i = 0; i < localStorage.length; i++) {
              const k = localStorage.key(i);
              if (k && k.indexOf('bl_') === 0) { const v = localStorage.getItem(k); if (v && v !== '{}' && v !== '[]' && v !== '""' && v !== 'null') същ++; }
            }
          }
          if (същ > 0 && window.BL_UI && BL_UI.confirm) {
            // 🔴 05.08 (одит г14, №132+133): диалогът обещаваше „ще ЗАМЕНИ
            //    всичко“, а долният ред прави сливане — ключовете, които ги
            //    няма във файла, оцеляват. Обещаваме това, което се случва.
            //    И казваме ЧИЕ е копието и от кога — тя има право да знае.
            let чие = '';
            try {
              const д = p.date ? new Date(p.date) : null;
              const б = dd.bl_baby ? JSON.parse(dd.bl_baby) : null;
              const име = (б && typeof б.name === 'string') ? б.name.trim().slice(0, 24) : '';
              чие = 'Копие' + (д && !isNaN(д) ? ' от ' + д.toLocaleDateString('bg-BG') : '') + (име ? ' · ' + име : '') + '.\n\n';
            } catch (e) {}
            const ок = await BL_UI.confirm('', {
              title: 'Преди да го качим', emoji: '💾', okText: 'Качи копието', cancelText: 'Откажи', danger: true,
              text: чие + 'Тук вече има записи на този телефон (' + (window.BL_BROI ? BL_BROI(същ, 'нещо', 'неща') : същ + ' ' + (същ === 1 ? 'нещо' : 'неща')) + '). Каквото е в копието, ще застане отгоре. Записите от този телефон, които ги няма в копието, остават.\n\nАко това е грешен телефон — по-добре Откажи. Ако искаш да си запазиш и днешното, свали си копие първо от „Инструменти → Резервно копие“.'
            });
            if (!ок) { лейбъл.textContent = НАДПИС; return; }
          }
          // 🔴🔴 11.08 (ИЗМЕРЕНО): при пълна памет setItem гърми по средата —
          //    половината копие е влязло, а мама четеше „Файлът не е разпознат“
          //    за напълно изправно копие. И то тук, на новия телефон, където
          //    това е единственият ѝ екземпляр. Двете причини се разделят.
          let бр = 0, недостиг = 0;
          Object.keys(dd).forEach(k => {
            if (!неин(k)) return;                     // чуждото състояние на екрана остава във файла
            try { localStorage.setItem(k, dd[k]); бр++; } catch (e) { недостиг++; }
          });
          if (недостиг) {
            лейбъл.textContent = 'Няма място на телефона 😕';
            const бел = el('p', 'prof-warn', '<strong>Копието ти е наред — телефонът няма място.</strong> Влязоха ' + бр +
              (бр === 1 ? ' нещо, ' : ' неща, ') + недостиг + (недостиг === 1 ? ' не се побра' : ' не се побраха') +
              '. Освободи място и качи <em>същия</em> файл пак — второто качване не поврежда нищо.');
            вход.appendChild(бел);
            const прод = el('button', 'prof-cta prof-cta2', 'Разбрах — презареди'); прод.type = 'button';
            прод.addEventListener('click', () => {
              const ч = (window.BL_STORE && BL_STORE.flush) ? BL_STORE.flush() : Promise.resolve();
              ч.then(() => location.reload());
            });
            вход.appendChild(прод);
            return;
          }
          if (!бр) throw new Error('празно');
          // 🔴🔴 21.08 · „✔ ВЛЕЗЕ!“ СЕ ПИШЕШЕ, ПРЕДИ ЗАПИСЪТ ДА Е ПОТВЪРДЕН.
          //    Редът с надписа стоеше НАД `flush()`. Тоест приложението обявяваше
          //    успех и пускаше конфети в мига, в който снимките още пътуваха към
          //    IndexedDB — а js/store.js държи `mediaOK()` точно за този надпис
          //    („за КОЙТО ПИШЕ «✔ Влезе!»“, store.js:334) и НИКОЙ не го викаше.
          //    При недостъпна база (частен режим на Safari, пълна памет, забранено
          //    хранилище) майката четеше „✔ Влезе! Зареждам всичко…“, телефонът
          //    се презареждаше 400 ms по-късно — и албумът ѝ го нямаше. Това е
          //    единственият ѝ екземпляр: няма сървър, няма връщане назад.
          //    Сега редът е обърнат: първо чакаме, после гледаме, накрая казваме.
          //    ПЪТ НАЗАД: върни четирите реда от git HEAD (надпис → confetti →
          //    flush → reload). Нищо друго не зависи от този блок.
          лейбъл.textContent = '💾 Записвам…';           // честно: още не е готово
          const изчакай = (window.BL_STORE && BL_STORE.flush) ? BL_STORE.flush() : Promise.resolve();
          изчакай.then(() => {
            const медияДобре = !(window.BL_STORE && BL_STORE.mediaOK) || BL_STORE.mediaOK();
            if (!медияДобре) {
              // Текстовете ѝ СА влезли — това е истина и трябва да се каже,
              // за да не реши, че е загубила всичко. Снимките и гласовите не са.
              лейбъл.textContent = 'Записките влязоха, снимките — не 😕';
              вход.appendChild(медияГрешка(бр));
              return;                                    // без конфети и без презареждане
            }
            лейбъл.textContent = '✔ Влезе! Зареждам всичко…';
            fx().confetti();
            setTimeout(() => location.reload(), 400);
          });
        } catch (e) { лейбъл.textContent = 'Файлът не е разпознат 😕'; setTimeout(() => лейбъл.textContent = НАДПИС, 2600); }
      };
      rd.readAsText(f);
    });
    лейбъл.appendChild(файл);
    вход.appendChild(лейбъл);
    return вход;
  }

  // ── САМИЯТ ПРОФИЛ ──
  function профил(root) {
    const мама = load('bl_mama', {});
    if (typeof мама.name !== 'string') мама.name = '';
    const бебе = load('bl_baby', {});
    const xp = точки(); const л = ниво(xp);
    провериНиво(л);

    // 1) ГЕРБЪТ
    const hero = el('div', 'prof-hero');
    const дни = бебе.birth ? Math.max(0, Math.floor((new Date() - new Date(бебе.birth)) / 86400000)) : null;
    const б2 = (window.BL_BABY2 && BL_BABY2.has()) ? BL_BABY2.get() : null;
    // 🍼 11.08: второто бебе може да е още без име (некръстено или го чакате) —
    //    „мама на Мария и “ с увиснало „и“ беше видимо. Празното име получава дума.
    const име2 = б2 ? (esc((б2.name || '').trim()) || 'второто съкровище') : '';
    const децата = бебе.name ? esc(бебе.name) + (б2 ? ' и ' + име2 : '') : (б2 ? име2 : '');
    hero.innerHTML =
      '<button class="prof-avbtn" type="button" title="смени лицето">' + аватарКод(мама, 'prof-big') + '</button>' +
      `<h3 class="prof-name">${esc(мама.name || 'Мама')} <button class="prof-edit" type="button" title="смени името">✏️</button></h3>` +
      (децата ? `<p class="prof-sub">мама на ${децата}${дни != null && !б2 ? ' · заедно от <strong>' + дни + '</strong> ' + (дни === 1 ? 'ден' : 'дни') : ''}</p>`
              : `<p class="prof-sub">профилът е само на този телефон 🔒</p>`);
    root.appendChild(hero);
    // вграден редактор вместо native prompt() — студеният системен диалог
    // чупеше топлия тон (одит-флот П23, проход 2 №13)
    hero.querySelector('.prof-edit').addEventListener('click', () => {
      const h = hero.querySelector('.prof-name');
      if (h.querySelector('input')) return;          // вече в режим редакция
      const стар = мама.name || '';
      h.innerHTML = '';
      const п = el('input', 'jr-word'); п.type = 'text'; п.maxLength = 24;
      п.value = стар; п.placeholder = 'Как да те наричам?';
      const ок = el('button', 'jr-chip', '✓ Готово'); ок.type = 'button';
      const запази = () => {
        мама.name = п.value.trim().slice(0, 24) || стар;
        save('bl_mama', мама);
        надписНаБутона(); рисувайВ(root);
      };
      ок.addEventListener('click', запази);
      п.addEventListener('keydown', e => { if (e.key === 'Enter') запази(); if (e.key === 'Escape') рисувайВ(root); });
      h.appendChild(п); h.appendChild(ок); п.focus(); п.select();
    });
    // изборът на лице — сгъваем под герба
    const изборКутия = el('div', 'prof-avwrap'); изборКутия.hidden = true;
    изборКутия.appendChild(аватарЪгъл(мама, () => { надписНаБутона(); рисувайВ(root); }));
    hero.querySelector('.prof-avbtn').addEventListener('click', () => { изборКутия.hidden = !изборКутия.hidden; });
    root.appendChild(изборКутия);

    // 2) ДНЕС · 3) СЕРИЯ · 4) СЕДМИЦА
    root.appendChild(секцияДнес());
    root.appendChild(секцияСерия());
    root.appendChild(секцияСедмица());

    // 5) НИВОТО
    const нив = el('section', 'prof-card prof-lvl');
    нив.innerHTML = `<div class="prof-lvlrow"><span class="prof-lvle">${л.e}</span>
      <div class="prof-lvlmid"><p class="prof-lvln">Ниво ${л.n} · ${esc(л.име)}</p>
      <div class="prof-bar"><span class="prof-fill" style="width:${л.проц}%"></span></div>
      <p class="prof-lvlxp">${л.след ? '<span data-cnt="' + xp + '">0</span> / ' + л.след[0] + ' звездички до „' + esc(л.след[2]) + '“ ' + л.след[1] : '<span data-cnt="' + xp + '">0</span> звездички · стигнала си върха 🌟'}</p></div></div>
      <p class="prof-note">Звездичките растат от истинските неща: записки, разходки, опити, минутки за теб. Нищо не се брои на ръка.</p>`;
    root.appendChild(нив);
    // проход 4: звездичките отброяват + лентата се налива отляво (виж profile.css)
    const _f = fx(); if (_f && _f.countUp) _f.countUp(нив);

    // 6) ЦЕЛИТЕ
    const st = провериНагради(целиСт()); save('bl_goals', st);
    const цел = el('section', 'prof-card');
    цел.appendChild(el('h4', 'prof-h', '🎯 Целите ми тази седмица <span class="prof-hsub">избираш до 3 · отчитат се сами</span>'));
    const списък = el('div');
    const рисувайЦели = () => {
      списък.innerHTML = '';
      st.chosen.forEach(c => {
        const деф = ЦЕЛИ.find(x => x.id === c.id); if (!деф) return;
        const p = прогрес(st, c);
        const готова = !!st.done[c.id];
        const r = el('div', 'prof-goal' + (готова ? ' done' : ''));
        r.innerHTML = `<span class="prof-ge">${деф.e}</span><div class="prof-gmid">
          <p class="prof-gn">${esc(деф.n)}</p>
          <div class="prof-bar"><span class="prof-fill" style="width:${Math.round(p.сега / p.цел * 100)}%"></span></div></div>
          <span class="prof-gp">${готова ? '🏆' : p.сега + '/' + p.цел}</span>
          <button class="prof-gx" type="button" aria-label="махни">×</button>`;
        r.querySelector('.prof-gx').addEventListener('click', () => {
          st.chosen = st.chosen.filter(x => x.id !== c.id); save('bl_goals', st); рисувайЦели();
        });
        списък.appendChild(r);
      });
      if (!st.chosen.length) списък.appendChild(el('p', 'prof-note', 'Още нямаш цели за тази седмица. Избери си от долните — малки са нарочно.'));
      const меню = el('div', 'prof-gmenu');
      if (st.chosen.length < 3) ЦЕЛИ.filter(д => !st.chosen.some(c => c.id === д.id)).forEach(д => {
        const b = el('button', 'prof-gadd', д.e + ' ' + esc(д.n)); b.type = 'button';
        b.addEventListener('click', () => {
          st.chosen.push({ id: д.id, base: д.type === 'delta' ? д.mer() : 0 });
          save('bl_goals', st); fx().buzz(8); рисувайЦели();
        });
        меню.appendChild(b);
      });
      списък.appendChild(меню);
    };
    цел.appendChild(списък); рисувайЦели();
    root.appendChild(цел);

    // 7) СТИКЕРИТЕ
    const стикери = load('bl_goal_stickers', []);
    if (стикери.length) {
      const кол = el('section', 'prof-card');
      кол.appendChild(el('h4', 'prof-h', '🏆 Наградите ми <span class="prof-hsub">' + стикери.length + ' постигнати</span>'));
      const g = el('div', 'prof-stgrid');
      стикери.slice().reverse().slice(0, 36).forEach(s => {
        const t = el('span', 'prof-st', esc(s.e)); t.title = (s.n || '') + ' · ' + (s.d || '');
        g.appendChild(t);
      });
      кол.appendChild(g);
      root.appendChild(кол);
    }

    // 8) МЕДАЛЬОНЧЕТАТА (40)
    const мед = el('section', 'prof-card');
    const каталог = (window.BL_BADGES && BL_BADGES.list) || [];
    const взети = load('bl_badges', {});
    мед.appendChild(el('h4', 'prof-h', '🏅 Медальончетата <span class="prof-hsub">' + Object.keys(взети).length + ' от ' + каталог.length + '</span>'));
    const рафт = el('div', 'prof-shelf');
    каталог.forEach(b => {
      const има = !!взети[b.id];
      const m = el('div', 'prof-medal' + (има ? ' got' : ''));
      m.innerHTML = `<span class="prof-me">${b.e}</span><span class="prof-mn">${esc(b.n)}</span>`;
      m.title = b.t + (има ? ' ✔' : ' — още не');
      рафт.appendChild(m);
    });
    мед.appendChild(рафт);
    root.appendChild(мед);

    // 9) СЕМЕЙСТВОТО (В4)
    const сем = el('section', 'prof-card');
    сем.appendChild(el('h4', 'prof-h', '👨‍👩‍👧 Семейството'));
    const семСписък = el('div');
    const ред = (е, име, под, действие, текстБутон) => {
      const r = el('div', 'prof-fam');
      // 22.07 (армия): името беше екранирано, емоджито — не. При внесено
      //   чуждо копие bl_mama.emoji е произволен текст. `под` също минава
      //   през esc(): днес всички викащи подават литерали, но е капан.
      r.innerHTML = `<span class="prof-fame">${esc(е)}</span><div class="prof-fammid"><strong>${esc(име)}</strong><small>${esc(под)}</small></div>`;
      if (действие) {
        const b = el('button', 'jr-chip', текстБутон || '✏️'); b.type = 'button';
        b.addEventListener('click', действие); r.appendChild(b);
      }
      return r;
    };
    семСписък.appendChild(ред(мама.photo ? '📷' : (мама.emoji || '🌸'), мама.name || 'Мама', 'това си ти 💛', null));
    if (бебе.name) {
      const a = бебе.birth && window.BL_AGE ? BL_AGE(бебе.birth) : null;
      // 22.07 (армия): четеше се `a.label`, което BL_AGE НЕ връща (полето е
      //   `text`) → под името на бебето стоеше празен ред вместо възрастта.
      //   Без esc() тук: `ред()` вече екранира сам (иначе двойно екраниране).
      семСписък.appendChild(ред(!бебе.sex ? '👶' : бебе.sex === 'boy' ? '👦' : '👧', бебе.name, (a && a.text) ? a.text : 'малкото чудо',
        () => { слой.remove(); слой = null; if (window.BL_ONBOARD) BL_ONBOARD.open(); }, '✏️'));
    } else {
      семСписък.appendChild(ред('🍼', 'Бебето', 'разкажи ми за него',
        () => { слой.remove(); слой = null; if (window.BL_ONBOARD) BL_ONBOARD.open(); }, '➕'));
    }
    if (б2) {
      семСписък.appendChild(ред(!б2.sex ? '👶' : б2.sex === 'boy' ? '👦' : б2.sex === 'wait' ? '🤰' : '👧', б2.name, 'второто съкровище',
        () => { слой.remove(); слой = null; if (window.MamaHelper) MamaHelper.open('Моето бебе'); }, '✏️'));
    } else if (бебе.name) {
      семСписък.appendChild(ред('🍼', 'Още едно съкровище?', 'добавя се за минутка — свои ваксини, своя възраст',
        () => { слой.remove(); слой = null; if (window.MamaHelper) MamaHelper.open('Моето бебе'); }, '➕'));
    }
    сем.appendChild(семСписък);
    root.appendChild(сем);

    // 10) В ЧИСЛА
    const ст2 = el('section', 'prof-card');
    ст2.appendChild(el('h4', 'prof-h', '📊 В числа'));
    // 🔴 18.08 (жива обиколка, ИЗМЕРЕНО): етикетите бяха САМО в множествено, а
    //    редът се показва още при 1. Първият ден на мама четеше „1 минутки за
    //    теб“, „1 завършени опита“, „1 дни «харесах се»“, „1 измерени нощи“ —
    //    и деветте реда грешаха при точно едно. Правилото на къщата е изречено
    //    (js/broi.js): числото и думата до него не бива да си противоречат.
    //    Числото се печата отделно, затова ползваме BL_BROI.дума (само думата).
    //    ПЪТ НАЗАД: върни третия елемент на низ и махни `ед` от реда по-долу.
    const дума = (n, ед, мн) => (window.BL_BROI && BL_BROI.дума) ? BL_BROI.дума(n, ед, мн) : (n === 1 ? ед : мн);
    const редове = [
      ['🚶‍♀️', Object.keys(load('bl_walk_days', {})).length, 'ден с разходка', 'дни с разходка'],
      ['🌷', Object.keys(load('bl_checkins', {})).length, 'минутка за теб', 'минутки за теб'],
      ['⭐', Object.keys(load('bl_firsts', {})).length, 'първи път', 'първи пъти'],
      ['🔬', ((load('bl_lab', { done: [] }).done) || []).length, 'завършен опит', 'завършени опита'],
      ['🍎', Object.keys(load('bl_tried', {})).length, 'опитана храна', 'опитани храни'],
      ['🪞', load('bl_wm_mirror', []).length, 'ден „харесах се“', 'дни „харесах се“'],
      ['😴', Object.keys(load('bl_sleep_hist', {})).length, 'измерена нощ', 'измерени нощи'],
      ['💧', Object.keys(load('bl_water_hist', {})).length, 'ден с броени чаши', 'дни с броени чаши'],
      ['⏰', Object.keys(load('bl_metime_hist', {})).length, 'седмица с „време за мен“', 'седмици с „време за мен“']
    ].filter(r => r[1] > 0);
    const мр = el('div', 'prof-stats');
    редове.forEach(r => мр.appendChild(el('div', 'prof-stat', `<span class="prof-se">${r[0]}</span><span class="prof-sn">${r[1]}</span><span class="prof-sl">${esc(дума(r[1], r[2], r[3]))}</span>`)));
    if (!редове.length) мр.appendChild(el('p', 'prof-note', 'Числата идват сами, като заживееш със стаите. Не бързат — и ти не бързай.'));
    ст2.appendChild(мр);
    root.appendChild(ст2);

    // 11) ДАННИТЕ МИ (В5)
    const дн2 = el('section', 'prof-card');
    дн2.appendChild(el('h4', 'prof-h', '💾 Данните ми'));
    let размер = '';
    // 🔴 18.08 (жива обиколка, ИЗМЕРЕНО на телефон с 25 ключа реални записи):
    //    `d.общо` е сборът САМО на изброените категории в js/storage.js. Самият
    //    storage.js смята и `d.друго` точно защото списъкът не е пълен („за да
    //    не показваме на мама половин истина за паметта ѝ“) — и в Инструменти
    //    го ПОКАЗВА. Тук се четеше само `общо`. Измерено: общо=174 B, друго=628 B,
    //    истинският сбор на всички bl_ ключове=802 B. Тоест екранът печаташе
    //    „засега 0 KB“ върху 802 байта нейни записи — 22% от истината.
    //    `общо + друго` дава точно 802: `покрит()` разделя ключовете на две
    //    непресичащи се купчини, значи няма двойно броене.
    //    ПЪТ НАЗАД: върни `d.общо` на трите места по-долу.
    // 🔴 19.08 · ТУК И „ИНСТРУМЕНТИ“ МЕРЕХА С РАЗНИ АРШИНИ. Този ред караше
    //    всичко под 1 KB през `Math.round(сбор / 1024) + ' KB'`, а картата
    //    „Какво пази приложението“ (js/storage.js, фмт) казва байтове под 1 KB.
    //    ИЗМЕРЕНО: за 1025 от първите 2000 байта (51.3%) двата екрана печатаха
    //    различен низ за едно и също число — включително „0 KB“ върху 313 B
    //    истински нейни записи. Числото и думата до него не бива да си
    //    противоречат — значи и двата екрана говорят с една и съща мярка.
    //    ПЪТ НАЗАД: върни едноредовия израз от scratchpad/PREDI_profile.js.
    const фмтРазмер = b => b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : b > 1024 ? Math.round(b / 1024) + ' KB' : b + ' B';
    try { if (window.BL_STORAGE) { const d = BL_STORAGE.чети(); const сбор = (d.общо || 0) + (d.друго || 0); размер = сбор > 0 ? фмтРазмер(сбор) : ''; } } catch (e) {}
    дн2.appendChild(el('p', 'prof-note', 'Всичко е <strong>само на този телефон</strong>' + (размер ? ' — засега ' + размер : '') + '. Ние не виждаме нищо. Смяна на телефон = този файл:'));
    const НЕ = /^(bl_pin|bl_pin_h)$/;
    // 3.1.5 · 05.08: + rage/maika/money — те са зад същия катинар (secrets.js),
    // а влизаха в „копие БЕЗ тайните“, което пътува по мейл и в облака.
    // 25.08: списъкът се премести в js/tayni.js — беше преписан ДУМА ПО ДУМА и
    // тук, и в js/rooms2.js:1633. Два преписа на едно правило се разминават, а
    // цената тук е изтекла тайна. Резервният израз пази поведението, ако
    // файлът не се зареди (виж ПЪТ НАЗАД в js/tayni.js).
    const ЗАКЛЮЧЕНИ = (window.BL_ТАЙНИ && window.BL_ТАЙНИ.ключове) ||
      /^(bl_wm_diary|bl_wm_confess|bl_wm_sins|bl_wm_rage|bl_wm_maika|bl_wm_money)$/;
    async function свали(безТайни, бутон, надпис, сПарола) {
      // 🔴 05.08 (одит г14, №362): целият път беше без try/catch. RangeError от
      //    JSON.stringify върху две години снимки отхвърляше обещанието мълчаливо
      //    — мама натиска, нищо не става, няма дори грешка. Сега казваме.
      try {
      // 🔴 05.08 (одит г08, №200): mediaDump() връща кеша, а кешът се пълни чак
      //    когато BL_STORE.init изчете цялата IndexedDB. Копие, натиснато през
      //    първите секунди, тръгваше БЕЗ снимките и гласовите — и никъде не
      //    пишеше колко е влязло. Чакаме, и го казваме.
      бутон.textContent = '📸 Събирам снимките…';
      try { if (window.BL_STORE && BL_STORE.init) await BL_STORE.init; } catch (e) {}
      const dump = {};
      const тайно = безТайни || (window.BL_PIN && BL_PIN.has && BL_PIN.has() && !BL_PIN.unlocked());
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || !k.startsWith('bl_') || НЕ.test(k)) continue;
        if (тайно && ЗАКЛЮЧЕНИ.test(k)) continue;
        dump[k] = localStorage.getItem(k);
      }
      const медия = (window.BL_STORE && BL_STORE.mediaDump) ? BL_STORE.mediaDump() : {};
      Object.assign(dump, медия);
      const медKB = Math.round(Object.keys(медия).reduce((s, k) => s + String(медия[k] || '').length, 0) / 1024);
      let съдържание = JSON.stringify({ app: 'BabyLand', date: new Date().toISOString(), noSecrets: !!безТайни, data: dump }, null, 2);
      let име = безТайни ? 'baby-land-копие-без-тайни.json' : 'baby-land-копие.json';

      // 15.3.6: файлът пътува — по мейл, в облака, на чужд компютър. Там
      // ключалката на телефона не важи. Затова: истинско AES-GCM.
      if (сПарола && window.BL_CRYPTO && BL_CRYPTO.има) {
        const п = await BL_CRYPTO.питайЗаПарола('нов');
        if (!п) { бутон.textContent = надпис; return; }   // иначе оставаше „Събирам снимките…“ завинаги
        бутон.textContent = '🔐 Заключвам…';
        try {
          съдържание = JSON.stringify(await BL_CRYPTO.заключи(съдържание, п), null, 2);
          име = 'baby-land-копие-ЗАКЛЮЧЕНО.json';
        } catch (e) { бутон.textContent = 'Не се получи 😕'; setTimeout(() => бутон.textContent = надпис, 1800); return; }
      }
      const blob = new Blob([съдържание], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      // 🔴 05.08 (одит г14, №361): връзката не влизаше в документа — на част от
      //    мобилните браузъри click() върху нея не сваля нищо. И не обещаваме
      //    „Свалено!“, каквото не сме видели: казваме къде сме го изпратили.
      const a = document.createElement('a'); a.href = url; a.download = име;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      // 🔴 05.08 (одит г14, №120): копие БЕЗ тайните (или свалено при заключена
      //    ключалка) е НЕПЪЛНО. То не гаси 30-дневното напомняне за архив и не
      //    отключва медальона „Пазителка“ — иначе мама остава с нарочно непълен
      //    файл и месец наред никой не ѝ споменава за истинско копие.
      save(тайно ? 'bl_backup_partial_last' : 'bl_backup_last', today());
      бутон.textContent = 'Изпратено към Изтегляния 💜'; setTimeout(() => бутон.textContent = надпис, 2600);
      const рав = дн2.querySelector('.prof-mediasum') || el('p', 'prof-note prof-mediasum', '');
      // 🔴 21.08 · ОБЕЩАНИЕТО „снимките са вътре“ СЕ ДАВАШЕ, БЕЗ ДА Е ПРОВЕРЕНО.
      //    `mediaDump()` връща кеша, а кешът се пълни от един курсор през целия
      //    склад (js/store.js, idbGetAll). Гръмне ли курсорът по средата, кешът е
      //    НЕПЪЛЕН — и този ред пак пишеше „В този файл влязоха и снимките, и
      //    гласовите“. Мама сваля файла, вярва му, сменя телефона. Сега питаме
      //    склада прочел ли се е докрай (readOK) и ако не — казваме го, вместо
      //    да броим липсващото за налично.
      //    ПЪТ НАЗАД: върни трите реда от git HEAD и махни `складътЧел`.
      const складътЧел = !(window.BL_STORE && BL_STORE.readOK) || BL_STORE.readOK();
      рав.textContent = (!складътЧел
        ? '⚠️ Не можах да прочета целия склад със снимки и гласови — това копие може да е НЕПЪЛНО. Затвори приложението, отвори го пак и свали ново копие. Дотогава пази и стария си файл.'
        : медKB > 0
          ? 'В този файл влязоха и снимките, и гласовите — около ' + (медKB > 1024 ? (медKB / 1024).toFixed(1) + ' MB' : медKB + ' KB') + ' от тях. 💜'
          : 'В този файл са записките ти. Снимки и гласови засега няма записани.') +
        ' Провери го в „Изтегляния“ на телефона — файлът се казва „' + име + '“.';
      // непълното копие не бива да гаси 30-дневното напомняне за архив
      if (!складътЧел) { try { localStorage.removeItem(тайно ? 'bl_backup_partial_last' : 'bl_backup_last'); } catch (e) { записПадна(e); } }
      if (!рав.isConnected) дн2.appendChild(рав);
      } catch (e) {
        бутон.textContent = 'Не се получи 😕';
        setTimeout(() => бутон.textContent = надпис, 3200);
        const гр = дн2.querySelector('.prof-mediasum') || el('p', 'prof-note prof-mediasum', '');
        гр.textContent = 'Копието не тръгна. Най-честата причина е място на телефона — освободи малко и пробвай пак. Записките ти са си тук, нищо не е загубено. 💜';
        if (!гр.isConnected) дн2.appendChild(гр);
      }
    }
    const коп = el('button', 'prof-cta prof-cta2', '⬇️ Свали резервно копие'); коп.type = 'button';
    // №362: и трите викания с .catch — обещание без catch се проваля мълчаливо
    const тихПровал = (бутон, надпис) => () => { бутон.textContent = 'Не се получи 😕'; setTimeout(() => бутон.textContent = надпис, 3200); };
    коп.addEventListener('click', () => свали(false, коп, '⬇️ Свали резервно копие').catch(тихПровал(коп, '⬇️ Свали резервно копие')));
    дн2.appendChild(коп);
    // 15.3.4: копие БЕЗ тайните — за когато мама праща файла на друг човек/устройство
    const копБ = el('button', 'prof-cta prof-cta3', '🔒 Копие без тайните (за споделяне)'); копБ.type = 'button';
    копБ.addEventListener('click', () => свали(true, копБ, '🔒 Копие без тайните (за споделяне)').catch(тихПровал(копБ, '🔒 Копие без тайните (за споделяне)')));
    дн2.appendChild(копБ);
    // 15.3.6: заключеното копие — истинско криптиране за файла, който пътува
    if (window.BL_CRYPTO && BL_CRYPTO.има) {
      const копП = el('button', 'prof-cta prof-cta4', '🔐 Копие с парола (за облака/мейла)'); копП.type = 'button';
      копП.addEventListener('click', () => свали(false, копП, '🔐 Копие с парола (за облака/мейла)', true).catch(тихПровал(копП, '🔐 Копие с парола (за облака/мейла)')));
      дн2.appendChild(копП);
      дн2.appendChild(el('p', 'jr-privacy',
        'Обикновеното копие е <strong>четимо</strong> — не го качвай където не искаш да го четат. Копието с парола е истински заключено (AES-256): без паролата е шум за всеки, включително за нас. Затова и <strong>забравена парола = загубено копие</strong>.'));
    }
    // 15.3.5: честно предупреждение — файлът е четим
    дн2.appendChild(el('p', 'prof-warn', '⚠️ Файлът е <strong>обикновен, четим</strong> — държи имена, снимки и бележки. Пази го като снимка от албума: не го качвай в чат или облак, който не е твой.'));
    const посл = load('bl_backup_last', '');
    const послЧ = load('bl_backup_partial_last', '');
    if (посл) дн2.appendChild(el('p', 'prof-note', 'Последно пълно копие: ' + esc(посл)));
    else if (послЧ) дн2.appendChild(el('p', 'prof-note', 'Последното копие (' + esc(послЧ) + ') беше <strong>непълно</strong> — без тайните. Пълно още няма.'));

    // 🔴 18.08 (по думата на собственика): ОБРАТНАТА посока стоеше само в екрана
    // за гост. Тук имаше как да СВАЛИШ копие, но не и как да КАЧИШ — а точно
    // това ѝ трябва на новия телефон. Долният ред на екрана пък я пращаше при
    // „Инструменти", тоест приложението ѝ обещаваше врата, до която стигаше
    // само през друга стая. Един и същ код и на двете места (качванеНаКопие).
    // ПЪТ НАЗАД: махни следващия ред.
    дн2.appendChild(el('p', 'prof-note', 'А ако идваш от друг телефон — копието се качва тук:'));
    const кач = качванеНаКопие({ надпис: '⬆️ Качи копие от друг телефон' });
    кач.className = 'prof-inline';
    дн2.appendChild(кач);
    дн2.appendChild(el('p', 'jr-privacy', 'Каквото е в копието, застава отгоре. Записките от ТОЗИ телефон, които ги няма в копието, остават. Ако телефонът вече има записи, ще те питаме преди това.'));
    // проход 2 №10: майка, която дава/сменя телефона, търси изтриването ТУК.
    // Истинският 3-стъпков поток (вкл. IndexedDB wipe) живее в Инструменти —
    // водим я там, не го дублираме.
    const изтр = el('button', 'prof-cta prof-cta3', '🗑️ Изтрий всичко от този телефон…'); изтр.type = 'button';
    изтр.addEventListener('click', () => {
      затвориСлоя();
      if (window.MamaHelper) setTimeout(() => MamaHelper.open('Инструменти'), 250);
    });
    дн2.appendChild(изтр);
    дн2.appendChild(el('p', 'jr-privacy', 'Копчето е в „Инструменти → Изтрий всичко“ — с двойно потвърждение и без връщане. Първо свали копие.'));
    root.appendChild(дн2);

    // 12) ЛИЧЕН ЩРИХ (В6) — тема и звуци (голи низове, не JSON)
    const щрих = el('section', 'prof-card');
    щрих.appendChild(el('h4', 'prof-h', '🎨 Личен щрих'));
    const g2 = el('div', 'prof-quick');
    const тъмнаЛи = () => document.documentElement.getAttribute('data-theme') === 'dark';
    const тема = el('button', 'prof-gadd', тъмнаЛи() ? '☀️ Светла тема' : '🌙 Тъмна тема'); тема.type = 'button';
    тема.addEventListener('click', () => {
      const към = тъмнаЛи() ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', към);
      // 21.08: и тук уловката беше празна. Не е дневникът ѝ, но е същият шаблон —
      // екранът се сменя, дискът не, и на следващото пускане темата се връща
      // назад без обяснение. Един глас, същият като на `save()` по-горе.
      try { localStorage.setItem('bl_theme', към); } catch (e) { записПадна(e); }
      тема.textContent = към === 'dark' ? '☀️ Светла тема' : '🌙 Тъмна тема';
      fx().buzz(6);
    });
    const звукВкл = () => raw('bl_sounds') === '1';
    const звук = el('button', 'prof-gadd', звукВкл() ? '🔕 Спри звуците' : '🔔 Милички звуци'); звук.type = 'button';
    звук.addEventListener('click', () => {
      try { localStorage.setItem('bl_sounds', звукВкл() ? '0' : '1'); } catch (e) { записПадна(e); }
      звук.textContent = звукВкл() ? '🔕 Спри звуците' : '🔔 Милички звуци';
      fx().buzz(6);
    });
    g2.appendChild(тема); g2.appendChild(звук);
    щрих.appendChild(g2);
    root.appendChild(щрих);

    // 13) МОИТЕ НЕЩА
    const бр2 = el('section', 'prof-card');
    бр2.appendChild(el('h4', 'prof-h', '⚙️ Моите неща'));
    const g3 = el('div', 'prof-quick');
    [['📖 Дневникът ми', 'Дневник на мама'], ['💃 Стаята за мен', 'Жената в мен'], ['🔬 Лабораторията', 'Лабораторията'], ['⚙️ Настройки', 'Инструменти']].forEach(([т, стая]) => {
      const b = el('button', 'prof-gadd', т); b.type = 'button';
      b.addEventListener('click', () => { слой.remove(); слой = null; if (window.MamaHelper) MamaHelper.open(стая); });
      g3.appendChild(b);
    });
    бр2.appendChild(g3);
    root.appendChild(бр2);

    // 🔴 18.08 (жива обиколка, ИЗМЕРЕНО): редът пращаше майката към „Вход“ —
    //    екран, който на новия телефон вече го НЯМА. „Вход“ се показва само
    //    докато `имаПрофил()` е невярно, а bl_onboarded става вярно още при
    //    „По-късно“ в онбординга, който сам изскача 900мс след обиколката.
    //    Тоест: инсталира, минава обиколката, натиска „По-късно“ — и вратата,
    //    която този ред обещава, е затворена. Измерено: секцията „🔑 Вход —
    //    вече имам профил“ и бутонът „⬆️ Качи файла-копие“ ги няма.
    //    Работещата врата е една и я проверих жива: Инструменти (помощничката
    //    Дара) → „⬆️ Възстанови от файл“. Текстът сочи натам.
    //    ⚠️ ЗА СОБСТВЕНИКА: това е кръпка на ТЕКСТА, не на дупката — виж доклада.
    // 🔴 18.08: този ред пращаше при „Инструменти → Възстанови от файл“, докато
    //    самото качване вече стои горе, в 💾 данните. Обещание, което заобикаля
    //    собствената си врата. Сега казва къде е наистина.
    root.appendChild(el('p', 'prof-legal', '🔒 Всичко тук е само на този телефон. Смяна на телефон: свали копието тук, а на новия го качи от същото място, горе в „💾 Данните ти“.'));
  }

  // ═══════════ БУТОНЪТ В НАВИГАЦИЯТА ═══════════
  function надписНаБутона() {
    const b = document.getElementById('bnProfile');
    if (!b) return;
    if (имаПрофил()) {
      const м = load('bl_mama', {});
      b.innerHTML = безопаснаСнимка(м.photo)   // същият XSS-щит като аватарКод
        ? '<span class="bn-ava"><img src="' + м.photo + '" alt=""></span>Профил'
        : '<span>' + esc(м.emoji || '👩') + '</span>Профил';
    } else b.innerHTML = '<span>🔑</span>Вход';
  }
  const бн = document.getElementById('bnProfile');
  if (бн) бн.addEventListener('click', e => { e.preventDefault(); отвори(); });
  надписНаБутона();

  window.BL_PROFILE = { open: отвори, refresh: надписНаБутона };
})();
