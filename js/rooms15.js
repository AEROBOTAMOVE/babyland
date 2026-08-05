// ═══════════════════════════════════════════════════════════
// ROOMS 15 — ГЛАСЪТ И ГАЛЕРИИТЕ (план 19, част 4)
//
// 🎙️ 4.5.6  Гласовият дневник — в 3 сутринта не се пише, а се говори
// 🤰 4.1.7  Гласово писмо в корема — бебето „чува“ мама
// 🎵 4.6.12 Песничките: запис на мама — бебето я слуша после
// 🎨 4.6.6  Рисунките по месеци — галерия
// 📅 4.5.1  Годината в един екран — 365 квадратчета по настроение
// 🚫 4.5.11 Не-списък — какво НЯМА да правя
//
// Преизползва BL_EXPR.voiceCard / photoListCard — доказани, с IndexedDB
// през store.js. Нула нова логика за медия.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const localDate = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const today = () => localDate(new Date());
  const card = t => { const c = el('section', 'jr-card'); c.appendChild(el('h4', 'jr-title', t)); return c; };
  const sub = s => '<span class="jr-sub">' + s + '</span>';
  const fx = () => window.BL_FX || { confetti() {}, cheer() {}, buzz() {} };

  // ═══════════ 📅 4.5.1 ГОДИНАТА В ЕДИН ЕКРАН ═══════════
  function yearGridCard() {
    const c = card('Годината ти в един екран 📅 ' + sub('всеки ден е квадратче · всяко настроение е цвят'));
    const ck = load('bl_checkins', {});
    const дни = Object.keys(ck);
    if (!дни.length) {
      c.appendChild(el('p', 'jr-privacy',
        'Всяка минутка за теб оставя по едно квадратче. След година тук ще има картина — не статистика, а живот. Започва с първата. 💜'));
      return c;
    }
    // последните 365 дни, подредени по седмици (колони)
    const днес = new Date(); днес.setHours(12, 0, 0, 0);
    const мрежа = el('div', 'yg-grid');
    const ЦВЕТ = ['yg-0', 'yg-1', 'yg-2', 'yg-3', 'yg-4'];
    const ЛИЦА = ['😩', '😔', '😐', '🙂', '🥰'];
    let попълнени = 0, сума = 0;
    for (let i = 364; i >= 0; i--) {
      const d = new Date(днес); d.setDate(d.getDate() - i);
      const ключ = localDate(d);
      const r = ck[ключ];
      const кв = el('span', 'yg-cell' + (r && typeof r.m === 'number' ? ' ' + ЦВЕТ[r.m] : ''));
      if (r && typeof r.m === 'number') {
        попълнени++; сума += r.m;                    // №85: и сборът е от СЪЩИЯ прозорец
        кв.title = ключ + ' · ' + ЛИЦА[r.m] + (r.w ? ' · „' + r.w + '“' : '');
      } else кв.title = ключ;
      мрежа.appendChild(кв);
    }
    c.appendChild(мрежа);
    // легенда
    const лег = el('p', 'yg-leg');
    лег.innerHTML = ЛИЦА.map((e, i) => `<span class="yg-cell ${ЦВЕТ[i]}"></span>${e}`).join(' ') +
      ' <span class="yg-cell"></span>празен ден';
    c.appendChild(лег);
    // честна равносметка — без укор за празните
    // 🔴 05.08 (одит г04, №85): едно изречение смесваше ДВА различни прозореца.
    //    `попълнени` идва от цикъла за последните 365 дни, а средното се
    //    смяташе от `дни` = ВСИЧКИ чекини от инсталацията насам — и двете се
    //    обявяваха като „през последната година“. Във втората си година мама
    //    четеше „128 записани дни… Средно настроение: 😐“, а 😐-то беше от
    //    всичките ѝ 400 дни. При нула записи в годината пък излизаше
    //    „0 записани дни… Средно настроение: 😩“ — Math.round(0) сочи първото
    //    лице, тоест приложението ѝ приписваше най-лошото настроение от нищо.
    const ср = попълнени ? сума / попълнени : null;
    c.appendChild(el('p', 'yg-verd',
      `<strong>${попълнени}</strong> ${попълнени === 1 ? 'записан ден' : 'записани дни'} през последната година.` +
      (ср === null ? '' : ` Средно настроение: <strong>${ЛИЦА[Math.round(ср)]}</strong>.`)));
    c.appendChild(el('p', 'jr-privacy',
      'Празните квадратчета не са пропуски — те са дните, в които си била твърде заета да живееш. Това също се брои.'));
    return c;
  }

  // ═══════════ 🚫 4.5.11 НЕ-СПИСЪКЪТ ═══════════
  // Всяко приложение иска да добавиш неща. Това е единственото, което
  // ти помага да МАХНЕШ. Радикално, защото майчинството е трупане.
  const ПРИМЕРИ = [
    'Няма да пека сладки за детския рожден ден. Купувам.',
    'Няма да отговарям на съобщения след 21 ч.',
    'Няма да обяснявам защо не идваме на гости.',
    'Няма да гладя чаршафи. Никога повече.',
    'Няма да сравнявам моето дете с чуждото в интернет.',
    'Няма да се извинявам, че къщата е разхвърляна.',
    'Няма да ставам за играчка, паднала за трети път.',
    'Няма да чета още една статия в 2 през нощта.'
  ];
  function notListCard() {
    const c = card('Не-списъкът 🚫 ' + sub('какво НЯМА да правя — и това е решение'));
    c.appendChild(el('p', 'jr-privacy',
      'Всички списъци искат да добавиш. Този иска да махнеш. Всяко „няма да“ е време, което се връща при теб.'));
    const st = load('bl_wm_notlist', []);
    const list = el('div', 'jr-wins');
    const рисувай = () => {
      list.innerHTML = '';
      // 22.07 (армия): готовите идеи се рисуваха САМО при празен списък —
      //   първото докосване ги караше да изчезнат и другите три ставаха
      //   недостъпни. Сега стоят винаги; вече добавените отпадат от тях.
      if (!st.length) {
        list.appendChild(el('p', 'jr-privacy', 'Още е празен. Ето от какво се отказаха други майки:'));
      }
      st.slice().reverse().forEach((x, ri) => {
        const i = st.length - 1 - ri;
        const row = el('div', 'nl-row');
        row.innerHTML = `<span class="nl-x">🚫</span><span class="nl-t">${esc(x.t)}</span><button class="nt-del" type="button">🗑</button>`;
        row.querySelector('.nt-del').addEventListener('click', () => { st.splice(i, 1); save('bl_wm_notlist', st); рисувай(); });
        list.appendChild(row);
      });
      if (st.length) {
        list.appendChild(el('p', 'nl-count', 'Отказала си се от <strong>' + st.length + '</strong> ' + (st.length === 1 ? 'нещо' : 'неща') + '. Толкова време си върнала на себе си. 💜'));
      }
      // идеите остават на разположение, докато има непочерпени
      const взети = new Set(st.map(x => x.t));
      const оставащи = ПРИМЕРИ.filter(т => !взети.has(т));
      if (оставащи.length) {
        if (st.length) list.appendChild(el('p', 'jr-privacy', 'Още идеи, ако ти паснат:'));
        const пр = el('div', 'nl-ideas');
        оставащи.slice(0, 4).forEach(т => {
          const b = el('button', 'nl-idea', esc(т)); b.type = 'button';
          b.addEventListener('click', () => { st.push({ t: т, d: today() }); save('bl_wm_notlist', st); рисувай(); fx().buzz(8); });
          пр.appendChild(b);
        });
        list.appendChild(пр);
      }
    };
    const ред = el('div', 'jr-addrow');
    const inp = el('input', 'jr-word'); inp.placeholder = 'Няма да…'; inp.maxLength = 90;
    const add = el('button', 'jr-chip', '+ Отказвам се'); add.type = 'button';
    const пиши = () => { const v = inp.value.trim(); if (!v) return; st.push({ t: v.slice(0, 90), d: today() }); save('bl_wm_notlist', st); inp.value = ''; рисувай(); fx().buzz(10); };
    add.addEventListener('click', пиши);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); пиши(); } });
    ред.appendChild(inp); ред.appendChild(add);
    c.appendChild(ред); c.appendChild(list); рисувай();
    return c;
  }

  // ── свързване ──
  const E = () => window.BL_EXPR;
  const ПАКЕТИ = {
    'Дневник на мама': root => {
      root.appendChild(yearGridCard());
      root.appendChild(notListCard());
      // 4.5.6: гласовият дневник — 3 минути, защото в 3 сутринта не се пише
      if (E()) root.appendChild(E().voiceCard(
        'Гласовият дневник 🎙️ ' + sub('в 3 сутринта не се пише — говори се'),
        'bl_voice_diary',
        { maxSec: 180, labels: ['днес', 'тежко', 'хубаво', 'за после'] }));
    },
    'Бременност': root => {
      // 🤍 22.07 (армия, RED): картата се появяваше и пред жена, която е спряла
      //   очакването след загуба — и то в СЕКУНДАТА, в която каже „спри
      //   броенето“ (helper.js пре-рисува стаята веднага). „Гласово писмо в
      //   корема · от ~24-та седмица той чува гласа ти“. Целият expect.js е
      //   писан точно за да не се случва това; preg20.js пази всяка своя карта,
      //   тази беше пропусната. Нищо не се трие — записите ѝ стоят и картата
      //   се връща сама, ако тя избере resume от настройките.
      if (window.BL_EXPECT && BL_EXPECT.paused && BL_EXPECT.paused()) return;
      // 4.1.7: гласово писмо в корема — от 24-та седмица бебето чува.
      // Б1.3: подзаглавието знае СЕДМИЦАТА — „ВЕЧЕ те чува“ след 24-та
      // топли много повече от вечното „от ~24-та“.
      let подзаглавие = 'от ~24-та седмица той чува гласа ти';
      try {
        const lmp = window.BL_EXPECT ? BL_EXPECT.lmp() : load('bl_lmp', '');
        if (lmp) {
          const сед = Math.floor((Date.now() - new Date(lmp)) / 604800000);
          if (сед >= 24 && сед <= 42) подзаглавие = 'той ВЕЧЕ те чува — говори му 💜';
          else if (сед > 0 && сед < 24) подзаглавие = 'запиши го — той ще го чуе съвсем скоро (от ~24-та)';
        }
      } catch (e) {}
      if (E()) root.appendChild(E().voiceCard(
        'Гласово писмо в корема 🤰 ' + sub(подзаглавие),
        'bl_voice_womb',
        { maxSec: 120, labels: ['писмо', 'песен', 'приказка'] }));
    },
    'Развитие и игри': root => {
      // 4.6.12: песничките с гласа на мама
      if (E()) root.appendChild(E().voiceCard(
        'Песничките с твоя глас 🎵 ' + sub('никой запис не звучи като мама'),
        'bl_voice_songs',
        { maxSec: 120, labels: ['приспивна', 'весела', 'наша'] }));
      // 4.6.6: рисунките по месеци
      if (E()) root.appendChild(E().photoListCard(
        'Рисунките по месеци 🎨 ' + sub('галерията на малкия творец'),
        'bl_art_months',
        { notePrompt: 'На колко месеца я нарисува?', empty: 'Първата драскулка идва по-скоро, отколкото мислиш. Тя е първата му подпис. 🖍️' }));
    }
  };
  Object.keys(ПАКЕТИ).forEach(стая => {
    const база = window.ROOM_FEATURES && window.ROOM_FEATURES[стая];
    if (!база) return;
    window.ROOM_FEATURES[стая] = root => { база(root); ПАКЕТИ[стая](root); };
  });
})();
