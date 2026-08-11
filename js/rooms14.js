// ═══════════════════════════════════════════════════════════
// ROOMS 14 — ВРЪЗКИТЕ МЕЖДУ ДАННИТЕ (план 19, част 4)
//
// 📈 4.2.2  Кривата на съня по месеци — от bl_sleep_hist
// 💜 4.2.12 + 4.5.3  Сънят на бебето × настроението ти (една карта, две стаи)
// ⏰ 4.5.9  Кога съм най-добре — час от денонощието, от чекините
// 🏆 4.3.7  Топ 5 любими — от 😋-тата
// 📏 4.2.4  Ръстът на стената — печатаема линия
//
// ЖЕЛЯЗНО: числата са НЕЙНИ. Не хвалим, не корим, не гадаем.
// Малко данни → казваме го честно, вместо да измисляме крива.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const card = t => { const c = el('section', 'jr-card'); c.appendChild(el('h4', 'jr-title', t)); return c; };
  const sub = s => '<span class="jr-sub">' + s + '</span>';
  // „11 ч 11“ се чете като час:минути — минутите искат своята дума
  const час = m => { const h = Math.floor(m / 60), mm = m % 60; return h ? h + ' ч' + (mm ? ' ' + mm + ' мин' : '') : mm + ' мин'; };
  const МЕСЕЦИ = ['ян', 'фев', 'мар', 'апр', 'май', 'юни', 'юли', 'авг', 'сеп', 'окт', 'ное', 'дек'];

  // ═══════════ 📈 4.2.2 КРИВАТА НА СЪНЯ ПО МЕСЕЦИ ═══════════
  function sleepCurveCard() {
    const c = card('Сънят по месеци 📈 ' + sub('става по-добре — ето доказателството'));
    const h = load('bl_sleep_hist', {});
    const дни = Object.keys(h).sort();
    if (дни.length < 5) {
      c.appendChild(el('p', 'jr-privacy',
        дни.length
          ? '📊 Имам ' + дни.length + ' ' + (дни.length === 1 ? 'измерена нощ' : 'измерени нощи') + '. С под 5 кривата е рисунка, не факт — затова чакам. Броячът на съня горе я пълни сам.'
          : '📊 Тук ще се покаже как сънят се променя месец след месец. Пълни се сам от брояча на съня — нищо не се пише на ръка.'));
      return c;
    }
    // групирай по месец
    const поМесец = {};
    дни.forEach(d => {
      const k = d.slice(0, 7);
      (поМесец[k] = поМесец[k] || []).push(h[d]);
    });
    const редове = Object.keys(поМесец).sort().slice(-6).map(k => {
      const arr = поМесец[k];
      return { k, ср: Math.round(arr.reduce((a, b) => a + b, 0) / arr.length), n: arr.length };
    });
    const макс = Math.max(...редове.map(r => r.ср), 1);
    const bars = el('div', 'sc-bars');
    редове.forEach(r => {
      const b = el('div', 'sc-bar');
      const мес = МЕСЕЦИ[+r.k.slice(5, 7) - 1] || r.k.slice(5, 7);
      b.innerHTML = `<span class="sc-fill" style="height:${Math.round(r.ср / макс * 100)}%"></span>
        <span class="sc-lbl">${мес}</span>`;
      b.title = мес + ': средно ' + час(r.ср) + ' (' + r.n + ' ' + (r.n === 1 ? 'нощ' : 'нощи') + ')';
      bars.appendChild(b);
    });
    c.appendChild(bars);
    const пръв = редове[0], посл = редове[редове.length - 1];
    if (редове.length >= 2) {
      const делта = посл.ср - пръв.ср;
      c.appendChild(el('p', 'sc-verd',
        Math.abs(делта) < 20
          ? `Средно <strong>${час(посл.ср)}</strong> на нощ. Между първия и последния месец: горе-долу същото. Плато — не провал.`
          : делта > 0
            ? `Средно <strong>${час(посл.ср)}</strong> на нощ — с <strong>${делта} мин</strong> повече от първия месец тук. Става по-добре. 💜`
            : `Средно <strong>${час(посл.ср)}</strong> на нощ — с ${Math.abs(делта)} мин по-малко от първия месец. Сънят не е права линия; зъбки, скокове и болести го бутат назад, после се връща.`));
    }
    c.appendChild(el('p', 'jr-privacy', 'Средно на нощ, по месеци. Само измереното — липсващите нощи не са нула, просто ги няма.'));
    return c;
  }

  // ═══════════ 💜 4.2.12 + 4.5.3 СЪНЯТ × НАСТРОЕНИЕТО ═══════════
  // Едната стая пита „как е бебето“, другата „как си ТИ“. Връзката е
  // очевидна за всяка майка — но никой не ѝ я показва в числа.
  function sleepMoodCard(заЖената) {
    const c = card(заЖената
      ? 'Сънят му × настроението ти 💜 ' + sub('връзката, която всички усещат')
      : 'Неговият сън × твоят ден 💜 ' + sub('данните от двете стаи'));
    const h = load('bl_sleep_hist', {});
    const ck = load('bl_checkins', {});
    // двойки: нощта СРЕЩУ чекина на СЛЕДВАЩИЯ ден (нощта оцветява утрото)
    const двойки = [];
    Object.keys(h).forEach(d => {
      const утре = (dd => { const x = new Date(dd + 'T12:00'); x.setDate(x.getDate() + 1); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); })(d);
      const r = ck[утре];
      if (r && typeof r.m === 'number') двойки.push({ сън: h[d], настроение: r.m });
    });
    if (двойки.length < 4) {
      c.appendChild(el('p', 'jr-privacy',
        двойки.length
          ? `Имам ${двойки.length} ${двойки.length === 1 ? 'ден' : 'дни'}, в които знам И колко е спало, И как си била. Трябват поне 4, за да не гадая. Идват сами.`
          : 'Тук ще сравня колко е спало бебето с това как си се чувствала на другия ден. Пълни се само — от брояча на съня и от минутката за теб.'));
      return c;
    }
    // сравни най-добрите срещу най-лошите нощи
    const сорт = двойки.slice().sort((a, b) => a.сън - b.сън);
    const половина = Math.floor(сорт.length / 2);
    const лоши = сорт.slice(0, половина), добри = сорт.slice(-половина);
    const ср = arr => arr.reduce((s, x) => s + x.настроение, 0) / arr.length;
    const срЛоши = ср(лоши), срДобри = ср(добри);
    const ЛИЦА = ['😩', '😔', '😐', '🙂', '🥰'];
    const g = el('div', 'sm-grid');
    g.innerHTML =
      `<div class="sm-box"><span class="sm-e">${ЛИЦА[Math.round(срЛоши)] || '😐'}</span>
        <span class="sm-n">${час(Math.round(лоши.reduce((s, x) => s + x.сън, 0) / лоши.length))}</span>
        <span class="sm-l">по-късите нощи</span></div>
       <div class="sm-box"><span class="sm-e">${ЛИЦА[Math.round(срДобри)] || '😐'}</span>
        <span class="sm-n">${час(Math.round(добри.reduce((s, x) => s + x.сън, 0) / добри.length))}</span>
        <span class="sm-l">по-дългите нощи</span></div>`;
    c.appendChild(g);
    const разлика = срДобри - срЛоши;
    c.appendChild(el('p', 'sm-verd',
      Math.abs(разлика) < 0.4
        ? 'При теб настроението почти не зависи от неговия сън. Това е рядко и е сила — държиш се на нещо друго.'
        : разлика > 0
          ? 'Когато той спи повече, на теб ти е по-леко. Изглежда очевидно — но сега е <strong>записано</strong>. Следващия път, когато си на края, знай: това не е характер. Това е сън.'
          : 'При теб по-дългите му нощи не носят по-леки дни. Понякога умората е от друго, не от часовете. Ако е така от седмици — заслужаваш да го кажеш на човек.'));
    c.appendChild(el('p', 'jr-privacy', 'От ' + двойки.length + ' дни, в които знам и двете. Нощта се сравнява с утрото след нея.'));
    return c;
  }

  // ═══════════ ⏰ 4.5.9 КОГА СЪМ НАЙ-ДОБРЕ ═══════════
  function bestHourCard() {
    const c = card('Кога си най-добре ⏰ ' + sub('от твоите минутки — не от книга'));
    const ck = load('bl_checkins', {});
    const дни = Object.keys(ck);
    if (дни.length < 6) {
      c.appendChild(el('p', 'jr-privacy',
        `Тук ще ти покажа в кой ден от седмицата ти е най-леко. Имам ${дни.length} ${дни.length === 1 ? 'минутка' : 'минутки'} — трябват поне 6. Всяка „Как си днес“ добавя по една.`));
      return c;
    }
    // по ДЕН ОТ СЕДМИЦАТА (по-честно от час — чекинът няма надежден час)
    const ДНИ = ['нд', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
    const поДен = {};
    дни.forEach(d => {
      const r = ck[d];
      if (!r || typeof r.m !== 'number') return;
      const wd = new Date(d + 'T12:00').getDay();
      (поДен[wd] = поДен[wd] || []).push(r.m);
    });
    const редове = [1, 2, 3, 4, 5, 6, 0].map(wd => {
      const arr = поДен[wd] || [];
      return { wd, ср: arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null, n: arr.length };
    });
    const ред = el('div', 'bh-row');
    редове.forEach(r => {
      const d = el('div', 'bh-day');
      const ЛИЦА = ['😩', '😔', '😐', '🙂', '🥰'];
      d.innerHTML = `<span class="bh-e">${r.ср == null ? '·' : ЛИЦА[Math.round(r.ср)]}</span><span class="bh-l">${ДНИ[r.wd]}</span>`;
      d.title = r.n ? ДНИ[r.wd] + ': ' + r.n + ' ' + (r.n === 1 ? 'запис' : 'записа') : 'няма записи';
      ред.appendChild(d);
    });
    c.appendChild(ред);
    const сНякакво = редове.filter(r => r.ср != null && r.n >= 2);
    if (сНякакво.length >= 3) {
      const най = сНякакво.reduce((a, b) => b.ср > a.ср ? b : a);
      const хич = сНякакво.reduce((a, b) => b.ср < a.ср ? b : a);
      const ПЪЛНИ = { 0: 'неделя', 1: 'понеделник', 2: 'вторник', 3: 'сряда', 4: 'четвъртък', 5: 'петък', 6: 'събота' };
      if (най.wd !== хич.wd) c.appendChild(el('p', 'bh-verd',
        `Най-леко ти е в <strong>${ПЪЛНИ[най.wd]}</strong>, най-тежко в <strong>${ПЪЛНИ[хич.wd]}</strong>. Ако можеш — не си слагай тежките неща в ${ПЪЛНИ[хич.wd]}.`));
    }
    c.appendChild(el('p', 'jr-privacy', 'Средно по ден от седмицата. Точките без лице са дни, в които не си писала — не е укор, просто липсват.'));
    return c;
  }

  // ═══════════ 🏆 4.3.7 ТОП 5 ЛЮБИМИ ═══════════
  function topFoodsCard() {
    const c = card('Какво обича 😋 ' + sub('събира се от реакциите, които отбелязваш'));
    const tried = load('bl_tried', {});
    const харесани = Object.keys(tried).filter(k => /😋/.test(tried[k] || ''));
    const отказани = Object.keys(tried).filter(k => /🤢/.test(tried[k] || ''));
    if (!харесани.length && !отказани.length) {
      c.appendChild(el('p', 'jr-privacy', 'Като отбележиш реакция на храна в календара горе, тук ще се събере списъкът. 🥄'));
      return c;
    }
    if (харесани.length) {
      c.appendChild(el('p', 'tf-h', '😋 Обича'));
      const g = el('div', 'tf-grid');
      // 22.07 (армия): медалите се лепяха по реда на ВМЪКВАНЕ — мама четеше,
      //   че златото е най-любимата храна, а то беше просто първата отбелязана.
      //   Данни за класация няма (bl_tried е храна→реакция, без брой). Затова
      //   без медали: честен списък, честно заглавие.
      харесани.slice(0, 8).forEach(f => {
        const b = el('div', 'tf-item');
        b.innerHTML = `<span class="tf-rank">😋</span><span class="tf-n">${esc(f)}</span>`;
        g.appendChild(b);
      });
      c.appendChild(g);
    }
    if (отказани.length) {
      c.appendChild(el('p', 'tf-h', '🤢 Още не приема'));
      c.appendChild(el('p', 'tf-no', отказани.slice(0, 5).map(esc).join(' · ')));
      // 🔴 05.08 (одит г11, №46): тук пишеше „8-10 срещи · предложи пак след
      //    седмица", а две карти по-нататък — „10-15 срещи · след 3 дни". Два
      //    броя и три интервала за един и същ факт, нито един с произход. Ако
      //    мама брои, ще реши, че някой я лъже. Махаме фалшивата точност.
      c.appendChild(el('p', 'jr-privacy', 'Отказаното днес не е отказано завинаги — на новия вкус често му трябват много срещи, понякога над десет. Предложи му го пак след няколко дни, спокойно и без да го караш.'));
    }
    return c;
  }

  // ═══════════ 📏 4.2.4 РЪСТЪТ НА СТЕНАТА ═══════════
  function wallCard() {
    const c = card('Ръстът на стената 📏 ' + sub('старата линия на рамката — но твоя'));
    const g = load('bl_growth_len', []);
    const baby = load('bl_baby', {});
    if (!g.length) {
      c.appendChild(el('p', 'jr-privacy', 'Като запишеш ръст в „Ръст и главичка“ горе, тук ще расте линията — както на рамката на вратата в детството ти. 📏'));
      return c;
    }
    const мерки = g.slice(-8);
    const макс = Math.max(...мерки.map(x => x.v || 0), 1);
    const стена = el('div', 'wl-wall');
    мерки.forEach(x => {
      const r = el('div', 'wl-mark');
      // правило 4: числото идва от поле, което мама пълни (extras.js) — минава
      // през esc(), както датата до него. Днес е число, утре може да не е.
      r.innerHTML = `<span class="wl-line" style="width:${Math.round((x.v || 0) / макс * 100)}%"></span>
        <span class="wl-txt">${esc(x.v)} см<small>${esc(x.d || '')}</small></span>`;
      стена.appendChild(r);
    });
    c.appendChild(стена);
    if (мерки.length >= 2) {
      const ръст = (мерки[мерки.length - 1].v || 0) - (мерки[0].v || 0);
      if (ръст > 0) c.appendChild(el('p', 'wl-verd', `Пораснал е с <strong>${Math.round(ръст * 10) / 10} см</strong>, откакто мериш. 🌱`));
    }
    const pr = el('button', 'jr-chip', '🖨️ За стената'); pr.type = 'button';
    const хинт = el('p', 'jr-privacy', '');
    pr.addEventListener('click', () => {
      // 🔇 11.08: при липсващ печатен модул бутонът правеше `return` — нула
      //    реакция. Мълчалив бутон, дори когато мълчанието има причина.
      if (!window.BL_EXPR || !BL_EXPR.printOverlay) {
        хинт.textContent = 'Печатният лист не се зареди този път. Числата са тук, горе — презареди приложението и опитай пак. 📏';
        return;
      }
      хинт.textContent = '';
      BL_EXPR.printOverlay('Ръстът на ' + (esc(baby.name) || 'нашето бебе'),
        `<ul class="pr-list">${мерки.map(x => `<li><strong>${esc(x.v)} см</strong> — ${esc(x.d || '')}</li>`).join('')}</ul>
         <p class="pr-note">Изрежи и залепи на рамката. След 20 години това ще е най-скъпият лист в къщата.</p>`);
    });
    c.appendChild(pr); c.appendChild(хинт);
    return c;
  }

  // ── свързване ──
  const ПАКЕТИ = {
    'Моето бебе': root => {
      root.appendChild(sleepCurveCard());
      root.appendChild(sleepMoodCard(false));
      root.appendChild(wallCard());
    },
    'Дневник на мама': root => {
      root.appendChild(sleepMoodCard(true));
      root.appendChild(bestHourCard());
    },
    'Захранване': root => { root.appendChild(topFoodsCard()); }
  };
  Object.keys(ПАКЕТИ).forEach(стая => {
    const база = window.ROOM_FEATURES && window.ROOM_FEATURES[стая];
    if (!база) return;
    window.ROOM_FEATURES[стая] = root => { база(root); ПАКЕТИ[стая](root); };
  });
})();
