// ═══════════════════════════════════════════════════════════
// HOME 2 — НАЧАЛНАТА СТРАНИЦА (план 19, част 8)
//
// ⭐ 8.2.1  Един голям ред: най-важното СЕГА (вместо 8 равни чипа)
// 🔎 8.3.2  Търсачката намира и инструменти, не само статии
// 📲 8.5.2  Инсталирането: истински стъпки за iOS и Android
// ❓ 8.5.3  FAQ: +„ако сменя телефона“ · +„моите данни“
// 🎈 8.5.5  Талисманът казва нещо СМИСЛЕНО, не случайно
//
// ЖЕЛЯЗНО: никакви ценови лозунги. Въпросът „струва ли“ НЕ влиза — цената е
// решение на собственика, а не нещо, което да измислям аз.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const localDate = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const today = () => localDate(new Date());
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const getBaby = () => load('bl_baby', {}) || {};
  const age = () => { const b = getBaby(); return b.birth && window.BL_AGE ? BL_AGE(b.birth) : null; };
  const pregWeek = () => {
    const lmp = window.BL_EXPECT ? BL_EXPECT.lmp() : load('bl_lmp', '');
    if (!lmp) return null;
    const w = Math.floor((Date.now() - new Date(lmp)) / 604800000);
    return (w >= 1 && w <= 45) ? w : null;
  };

  // ═══════════ ⭐ 8.2.1 НАЙ-ВАЖНОТО СЕГА ═══════════
  //
  // Осем еднакви чипа значат „избери сама“ — а мама тъкмо това не иска в
  // 7 сутринта. Един ред казва кое е НАЙ-важното точно днес. Редът е
  // подреден по СПЕШНОСТ, не по хубост: първото, което улучи, печели.

  function важнотоСега() {
    const b = getBaby();
    const a = age();
    const w = pregWeek();
    const h = new Date().getHours();

    // 1. Ваксина днес или утре
    // проход 3 S3: реалният глобал е BL_VACCINES (rooms2.js), не BL_DATA.vaccines —
    // мъртвият клон значеше, че „Днес е ваксината" НИКОГА не се показваше.
    if (a && window.BL_VACCINES) {
      const vax = load('bl_vax', {}) || {};
      for (let i = 0; i < BL_VACCINES.length; i++) {
        const v = BL_VACCINES[i];
        if (vax[i] || !b.birth || !window.BL_DATE) continue;
        const d = BL_DATE.addMonths(b.birth, v.m);
        // 05.08 (одит г06, №121): вадеше рождената дата (прочетена като UTC
        // полунощ ≈ 02:00–03:00 наше време) от Date.now() — тоест ЧАС от МОМЕНТ.
        // Следобед на самия ден разликата ставаше ≈ −13ч → Math.round(−0.54) = −1
        // и редът изчезваше; следобед на предишния ден ≈ +11ч → 0 и пишеше „Днес
        // е ваксината“ ден по-рано. Двете страни вече са от ЛОКАЛНА полунощ,
        // както го смята вярно rooms5.js:79.
        const днес0 = new Date(); днес0.setHours(0, 0, 0, 0);
        const d0 = new Date(d); d0.setHours(0, 0, 0, 0);
        const дни = Math.round((d0 - днес0) / 86400000);
        if (дни >= 0 && дни <= 2) {
          return { e: '💉', t: дни === 0 ? 'Днес е ваксината' : дни === 1 ? 'Утре е ваксината' : 'Вдругиден е ваксината',
                   s: v.n, room: 'Здраве и SOS', важно: true };
        }
      }
    }
    // 2. Термин наближава
    if (w >= 37) {
      return { e: '🧳', t: 'Всеки момент', s: w + '-та седмица — чантата готова ли е?', room: 'Бременност', важно: true };
    }
    // 3. Рожден ден / месечувка
    if (a && b.birth) {
      const bd = new Date(b.birth), now = new Date();
      // 🎉 22.07 (армия): голото сравнение на числа пропускаше месечнината на
      //   всяко бебе, родено на 29/30/31 — в късите месеци такъв ден няма.
      //   И на един месец пишеше „1 месеца днес“. И двете, както в базата.
      const дн = д => д.getFullYear() + '-' + д.getMonth() + '-' + д.getDate();
      const днес = window.BL_DATE
        ? [a.ym, a.ym + 1].some(м => м >= 1 && дн(BL_DATE.addMonths(b.birth, м)) === дн(now))
        : (bd.getDate() === now.getDate());
      if (днес && a.ym >= 1) {
        return { e: '🎉', t: (a.ym % 12 === 0 ? (a.ym / 12) + ' годинк' + (a.ym / 12 === 1 ? 'а' : 'и')
                              : a.ym + (a.ym === 1 ? ' месец' : ' месеца')) + ' днес',
                 s: 'Прегърни го от мен', room: 'Моето бебе', важно: true };
      }
    }
    // 4. Нощ — не ѝ предлагай проекти. Лампата с едно докосване (8.2.2).
    if (h >= 23 || h < 5) {
      return { e: '🔦', t: 'Будни сме', s: 'Нощната лампа — с едно докосване. Тревожи ли те нещо — Вита е будна.',
               action: () => { if (window.BL_LAMP) BL_LAMP(); else if (window.MamaHelper) MamaHelper.open('Здраве и SOS'); } };
    }
    // 8.2.2: часът командва реда — сутрин чекинът, обед храната, вечер ритуалът
    const дн = new Date(), клД = дн.getFullYear() + '-' + String(дн.getMonth() + 1).padStart(2, '0') + '-' + String(дн.getDate()).padStart(2, '0');
    if (h >= 5 && h < 11 && !((load('bl_checkins', {}) || {})[клД])) {
      return { e: '🌷', t: 'Добро утро', s: 'Една минутка за теб, преди денят да те грабне', room: 'Дневник на мама' };
    }
    if (h >= 11 && h < 15 && a && a.months >= 4 && !((load('bl_menu', {}) || {})[клД])) {
      return { e: '🥄', t: 'Обедно време', s: 'Какво е менюто днес?', room: 'Захранване' };
    }
    if (h >= 19 && h < 23 && a) {
      const опити = (load('bl_lab', { list: [] }).list || []).filter(x => !x.closed);
      if (опити.length && !(опити[0].log || {})[клД]) {
        return { e: '🔬', t: 'Вечерният ритуал', s: 'Опитът чака едно докосване', room: 'Лабораторията' };
      }
    }
    // 5. Не си писала от 3+ дни
    const j = load('bl_journal', []) || [];
    if (Array.isArray(j) && j.length) {
      const посл = j[j.length - 1];
      const д = посл && посл.d ? Math.round((Date.now() - new Date(посл.d)) / 86400000) : 99;
      if (д >= 3 && д < 60) {
        // 05.08 (одит г06, №153): тук пишеше „Не си писала от X дни“ — най-едрият
        // ред на личния екран броеше какво мама НЕ е направила. Като касова
        // бележка. А при загуба броеше точно дните от нея. Собственото правило на
        // проекта е долу в този файл-събрат (polish.js:359): подканата е ПОКАНА,
        // не сметка. Броят остава в кода за реда на важността — не се показва.
        return { e: '📖', t: 'Дневникът те чака', s: 'Едно изречение, когато имаш сили', room: 'Дневник на мама' };
      }
    }
    // 6. Бременна — седмицата + отброяване до термина (проход 4: числото, което
    //    всяка бременна брои наум, заслужава най-едрия ред, не сивия подтекст)
    if (w) {
      const lmp = window.BL_EXPECT ? BL_EXPECT.lmp() : '';
      let дни = null;
      if (lmp) { const термин = new Date(lmp); термин.setDate(термин.getDate() + 280); дни = Math.round((термин - Date.now()) / 86400000); }
      const t = (дни != null && дни > 0) ? w + '-та седмица · остават ~' + дни + (дни === 1 ? ' ден' : ' дни') + ' до термина'
        : w + '-та седмица' + (дни != null && дни <= 0 ? ' · всеки момент! 💜' : '');
      return { e: '🤰', t, s: 'Виж какво става тази седмица', room: 'Бременност' };
    }
    // 7. Има бебе — днешното
    if (a) {
      return { e: '👶', t: (esc(b.name) || 'Бебето') + ' е на ' + esc(a.text), s: 'Какво може сега', room: 'Развитие и игри' };
    }
    // 7.5. 05.08 (одит г06, №159): жената, която вчера е натиснала „Спри тихо
    //   броенето“, падаше право в резервния клон долу — най-едрият ред на екрана
    //   ѝ казваше „Кажи ми за кого сме тук“ и я пращаше в онбординга. Всеки клон
    //   дотук я подминава: pregWeek() връща null при пауза, ваксините и
    //   месечнината искат рождена дата, дневникът иска записи. Тих ред, без
    //   въпрос и без стрелка към „кажи ми“.
    if (window.BL_EXPECT && BL_EXPECT.has && BL_EXPECT.has() && BL_EXPECT.paused && BL_EXPECT.paused()) {
      return { e: '💜', t: 'Тук съм', s: 'Няма нужда да правиш нищо днес', room: 'Дневник на мама' };
    }
    // 8. Нищо не знаем още
    return { e: '✨', t: 'Здравей', s: 'Кажи ми за кого сме тук', room: 'Моето бебе' };
  }

  function bigRow(container) {
    if (!container || container.querySelector('.big-now')) return;
    const x = важнотоСега();
    const r = el('button', 'big-now' + (x.важно ? ' big-hot' : ''));
    r.type = 'button';
    r.innerHTML = `<span class="bn-e">${x.e}</span>
      <span class="bn-txt"><strong>${x.t}</strong><span class="bn-s">${x.s}</span></span>
      <span class="bn-go">→</span>`;
    r.addEventListener('click', () => {
      if (x.action) { x.action(); return; }
      if (window.MamaHelper) MamaHelper.open(x.room);
    });
    container.insertBefore(r, container.firstChild);
  }

  // ═══════════ 🔎 8.3.2 ТЪРСАЧКАТА НАМИРА И ИНСТРУМЕНТИ ═══════════

  const КАРТИ_ЗА_ТЪРСЕНЕ = [
    { k: ['калкулатор', 'персентил', 'крива', 'растеж', 'сзо', 'колко тежи'], t: '⭐ Калкулатор на растежа', room: 'Моето бебе' },
    { k: ['ваксин', 'имунизац', 'график на ваксините'], t: '💉 Имунизационен календар', room: 'Здраве и SOS' },
    { k: ['първа помощ', 'задавяне', 'гърч', 'изгаряне'], t: '🚑 Първа помощ', room: 'Здраве и SOS' },
    { k: ['чанта', 'болница', 'за раждане'], t: '🧳 Чантата за болницата', room: 'Бременност' },
    { k: ['контракции', 'схватки', 'тръгвам ли'], t: '⏳ Истински ли са контракциите', room: 'Бременност' },
    { k: ['аптечк', 'какво да имам вкъщи'], t: '💊 Аптечката', room: 'Здраве и SOS' },
    { k: ['алерген', 'въвеждане на храни'], t: '🥜 Алергените: график', room: 'Захранване' },
    { k: ['размер', 'дрешки', 'номер'], t: '📏 Размерите EU/UK/US', room: 'Инструменти' },
    { k: ['столче', 'кола', 'пътуване с кола'], t: '🚗 Столчето за кола', room: 'Инструменти' },
    { k: ['бюджет', 'касичка', 'разходи'], t: '💰 Бюджет и касичка', room: 'Инструменти' },
    { k: ['таймер', 'кърмене', 'коя гърда'], t: '🤱 Коя гърда е наред', room: 'Моето бебе' },
    { k: ['игра', 'на какво да играем', '5 минути'], t: '⏱️ Играта за 5 минути', room: 'Развитие и игри' },
    { k: ['опит', 'експеримент', '7 вечери'], t: '🔬 Опитът на седмицата', room: 'Лабораторията' },
    { k: ['копие', 'бекъп', 'смяна на телефон'], t: '💾 Резервно копие', room: 'Инструменти' },
    { k: ['ключалка', 'пин', 'заключ'], t: '🔒 Ключалка на дневника', room: 'Дневник на мама' },
    { k: ['спешно', 'сос', '112', 'телефон'], t: '🆘 СОС център', room: 'Здраве и SOS' },
    { k: ['хороскоп', 'зодия', 'звезди'], t: '🔮 Хороскопът', room: 'Жената в мен' },
    { k: ['годишник', 'книга', 'спомени'], t: '📔 Годишникът', room: 'Дневник на мама' }
  ];

  function търсиИнструмент(q) {
    const t = String(q || '').toLowerCase().trim();
    if (t.length < 3) return [];
    return КАРТИ_ЗА_ТЪРСЕНЕ.filter(x => x.k.some(k => t.includes(k) || k.includes(t))).slice(0, 3);
  }
  window.BL_TOOLSEARCH = търсиИнструмент;

  // ═══════════ 📲 8.5.2 ИНСТАЛИРАНЕТО: ИСТИНСКИ СТЪПКИ ═══════════

  function коеУстройство() {
    const u = navigator.userAgent || '';
    if (/iPhone|iPad|iPod/i.test(u)) return 'ios';
    if (/Android/i.test(u)) return 'android';
    return 'other';
  }

  const СТЪПКИ = {
    ios: ['Отвори тази страница в <strong>Safari</strong> (не в Chrome — на iPhone само Safari може).',
          'Докосни бутона <strong>Сподели</strong> ⬆️ долу в средата.',
          'Плъзни надолу и избери <strong>„Към началния екран“</strong>.',
          'Докосни <strong>Добави</strong>. Готово — иконата е на екрана ти.'],
    android: ['Докосни <strong>трите точки</strong> ⋮ горе вдясно.',
              'Избери <strong>„Инсталиране на приложението“</strong> или <strong>„Добавяне към началния екран“</strong>.',
              'Потвърди с <strong>Инсталиране</strong>.',
              'Готово — иконата е при другите приложения.'],
    other: ['На телефон: отвори тази страница в Safari (iPhone) или Chrome (Android).',
            'Оттам ще можеш да я добавиш на началния екран с две докосвания.',
            'На компютър приложението работи и в браузъра — просто го запази в отметките.']
  };

  function installCard() {
    const у = коеУстройство();
    const c = el('section', 'inst-card');
    // картата живее ВЪТРЕ в секцията „Как да ме добавиш на телефона си?“ —
    // затова резервното заглавие не повтаря въпроса, а води направо към стъпките
    const име = у === 'ios' ? '📱 На твоя iPhone' : у === 'android' ? '📱 На твоя Android' : '📱 Стъпките, една по една';
    c.innerHTML = `<h3 class="inst-h">${име}</h3>
      <ol class="inst-steps">${СТЪПКИ[у].map(s => `<li>${s}</li>`).join('')}</ol>
      <p class="inst-note">Не се сваля от магазин, не заема място като приложение и не иска регистрация. Просто иконка, която отваря това.</p>`;
    if (у !== 'other') {
      const др = el('button', 'jr-chip', у === 'ios' ? 'Имам Android' : 'Имам iPhone');
      др.type = 'button';
      др.addEventListener('click', () => {
        const друго = у === 'ios' ? 'android' : 'ios';
        c.querySelector('.inst-h').textContent = друго === 'ios' ? '📱 На iPhone' : '📱 На Android';
        c.querySelector('.inst-steps').innerHTML = СТЪПКИ[друго].map(s => `<li>${s}</li>`).join('');
      });
      c.appendChild(др);
    }
    return c;
  }

  // ═══════════ ❓ 8.5.3 FAQ: ДВА НОВИ ВЪПРОСА ═══════════
  //
  // „Струва ли?“ съзнателно НЕ влиза. Цената е решение на собственика.

  const НОВИ_FAQ = [
    ['Ако сменя телефона — губя ли всичко?',
     'Не, ако си направила копие. В „Инструменти“ има бутон <strong>💾 Резервно копие</strong> — сваля един файл с всичко: дневника, снимките, записките. На новия телефон отваряш приложението и го качваш обратно. <br><small>Ключалката на дневника не пътува с файла — на новия телефон си слагаш нова.</small>'],
    ['Кой вижда какво пиша тук?',
     'Никой. Няма сървър, няма регистрация, няма изпращане. Всичко живее в паметта на този браузър, на този телефон. Дори шрифтовете са вътре в приложението — то не се свързва с нищо и с никого. Затова и работи офлайн.'],
    ['Ако изтрия приложението?',
     'Данните си отиват с него — точно защото са само тук, а не при нас. Затова: направи си копие ПРЕДИ да триеш. Файлът остава при теб, дори приложението да го няма.']
  ];

  // Секцията се строи от home.js; тук долепяме въпросите В НЕЯ, със същия
  // вид и същото поведение (един отворен наведнъж) — иначе новите изглеждат
  // като чужди и не се сгъват.
  function добавиВъпроси() {
    const списък = document.querySelector('.faq-list');
    if (!списък || списък.dataset.plus) return false;
    списък.dataset.plus = '1';
    НОВИ_FAQ.forEach(([в, о]) => {
      const item = el('div', 'faq-item');
      item.innerHTML = `<button type="button" class="faq-q">${esc(в)}<span class="faq-arr">▾</span></button>` +
                       `<div class="faq-a"><p>${о}</p></div>`;
      item.querySelector('.faq-q').addEventListener('click', () => {
        const беше = item.classList.contains('open');
        списък.querySelectorAll('.faq-item').forEach(x => x.classList.remove('open'));
        if (!беше) item.classList.add('open');
      });
      списък.appendChild(item);
    });
    return true;
  }

  // ═══════════ 🎈 8.5.5 ТАЛИСМАНЪТ КАЗВА НЕЩО СМИСЛЕНО ═══════════

  function думаНаБалончето() {
    const a = age();
    const w = pregWeek();
    const b = getBaby();
    const h = new Date().getHours();
    const име = esc(b.name);

    if (h >= 23 || h < 5) return 'Будни сме и двамата. 🌙';
    if (w >= 37) return 'Всеки момент. Дишай. 🧳';
    if (w) return w + '-та седмица. Върви добре. 🌸';
    if (a && a.corr) return 'Мерим по коригираната възраст — така е честно. 👶';
    if (a && a.months < 1) return 'Първите седмици са най-дългите. Ще мине. 💜';
    if (a && a.months >= 3.5 && a.months <= 4.5) return 'Около 4-ия месец сънят се преустройва. Не си виновна. 😴';
    if (a && a.ym) return име ? (име + ' е на ' + esc(a.text) + '. 📏') : 'Тук съм, ако потрябвам. 💜';
    return 'Питай ме каквото и да е. 🎈';
  }
  window.BL_MASCOT_SAY = думаНаБалончето;

  // ═══════════ свързване ═══════════

  function монтирай() {
    // големият ред влиза в картата „Днес“
    const днес = document.querySelector('.today .td-inner') || document.querySelector('.today');
    if (днес) bigRow(днес);
    // инсталирането — в секцията, която вече съществува в index.html
    const дом = document.getElementById('инсталирай');
    if (дом && !дом.querySelector('.inst-card')) дом.appendChild(installCard());
    return добавиВъпроси();
  }

  // FAQ секцията се строи от home.js, а той може да е още на път. Затова
  // опитваме няколко пъти и спираме, щом успеем — вместо да гадаем timeout.
  let опити = 0;
  const пробвай = () => {
    const готово = монтирай();
    if (!готово && ++опити < 12) setTimeout(пробвай, 400);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(пробвай, 300));
  else setTimeout(пробвай, 300);
  // картата „Днес“ се пре-рисува — закачаме се и след това
  const prevBind = window.BL_TODAY_BIND;
  window.BL_TODAY_BIND = function (container, baby, a) {
    if (prevBind) prevBind(container, baby, a);
    const in2 = container.querySelector('.td-inner') || container;
    bigRow(in2);
  };
})();
