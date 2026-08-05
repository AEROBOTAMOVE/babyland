// ═══════════════════════════════════════════════════════════
// 💬 ПОЛЕТО НА ПОМОЩНИЧКАТА (план 19, част 22)
//
// Owner: „във всяка стая В НАЧАЛОТО поле, в което мама си пише с
// помощничката — както аз и ти си пишем тук.“
//
// Полето стои НАД всичко в стаята. Изпращането скача в чат-таба и
// минава през ЦЕЛИЯ двигател (флагове за бебето И майката, нощен тон,
// памет, чипове) — MamaHelper.ask. Един двигател, нула дублиране.
//
// ЗАРЕЖДА СЕ СЛЕД polish.js/order*.js — така полето се вмъква КАТО ПЪРВО
// дете СЛЕД като подредбите са си свършили работата.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  // 22.5: жив подканващ ред + 3 примера — РАЗЛИЧНИ за всяка помощничка
  const ПОКАНИ = {
    'Бременност': ['Пиши ми за седмиците, ритниците, страховете…', ['на коя седмица съм', 'ритниците намаляха', 'страх ме е от раждането']],
    'Моето бебе': ['Пиши ми за съня, плача, кожичката, растежа…', ['колко трябва да спи', 'плаче вечер', 'кога навън']],
    'Захранване': ['Пиши ми за пюретата, алергените, отказа…', ['с какво да започна', 'отказва да яде', 'кога вода']],
    'Здраве и SOS': ['Пиши ми за температура, кашлица, обриви — веднага.', ['температура 38', 'кашля от два дни', 'обрив по бузките']],
    'Дневник на мама': ['Пиши ми как СИ ти. Наистина.', ['уморена съм', 'чувствам се сама', 'днес беше хубав ден']],
    'Развитие и игри': ['Пиши ми за уменията, игрите, проговарянето…', ['кога сяда', 'какво да играем', 'кога проговаря']],
    // „календара“ обещаваше тема, която базата не може да върне (няма запис с
    //    такъв ключ) — Дара сама канеше и после отговаряше „нямам го“.
    //    „количката“ има истински запис (in-stroller).
    'Инструменти': ['Пиши ми за размери, документи, количката…', ['кой размер дрешки', 'какви документи', 'резервно копие']],
    'Жената в мен': ['Пиши ми за ТЕБ — не за бебето. За теб.', ['нямам време за нищо', 'какво казва хороскопът', 'изгубих се']],
    'Лабораторията': ['Пиши ми какво да проверим при твоето бебе…', ['защо се буди в 3', 'работи ли белият шум', 'защо 7 вечери']]
  };

  // 🔴 04.08 (обиколка): при пауза след загуба стаята вече не показва картите
  //    за очакването — но полето за писане продължаваше да кани жената да пита
  //    „ритниците намаляха“ и „на коя седмица съм“. Проверено наживо: три
  //    чипа за ритници пред жена, която вчера е загубила.
  const ПОКАНА_ПРИ_ПАУЗА = ['Пиши ми каквото ти тежи. Тук съм за теб.',
                            ['как се грижа за себе си сега', 'кога да отида на преглед', 'не мога да спя']];

  // 🔴🔴 04.08 (петте майки): чипът „ритниците намаляха“ се подаваше на ВСЯКА
  //    седмица. Движения се усещат между 18-та и 22-ра — на 8-ма седмица нищо
  //    не може да мърда. А фразата е в pregFlags, значи приложението САМО
  //    подаваше на бременната бутон, който ѝ светваше „за лекар СЕГА“ + 112.
  //    Двойна вреда: изплашена жена на 8 седмица, и обезценена тревога за
  //    28-ма, когато ще е истинска.
  //    (Самият флаг ОСТАВА — при непозната седмица предпазливостта е права.
  //     Тук се сменя само какво ѝ ПОДАВАМЕ наготово.)
  const РАННИ_ЧИПОВЕ = ['гади ми се', 'кога е първата ехография', 'страх ме е'];
  function седмицаСега() {
    try {
      const lmp = window.BL_EXPECT ? BL_EXPECT.lmp() : '';
      if (!lmp) return null;
      const w = Math.floor((Date.now() - new Date(lmp)) / 604800000);
      return (w >= 1 && w <= 45) ? w : null;
    } catch (e) { return null; }
  }

  function поле(стая) {
    const p = window.MamaHelper && MamaHelper.persona ? MamaHelper.persona(стая) : null;
    if (!p) return null;
    const наПауза = стая === 'Бременност' && window.BL_EXPECT &&
                    BL_EXPECT.paused && BL_EXPECT.paused();
    let [ред, примери] = наПауза ? ПОКАНА_ПРИ_ПАУЗА
                                 : (ПОКАНИ[стая] || ['Пиши ми — тук съм.', []]);
    // до 24-та седмица не подаваме „ритниците намаляха“ — движения се усещат
    // между 18-та и 22-ра, а фразата вдига 112 (виж коментара горе)
    if (стая === 'Бременност' && !наПауза) {
      const w = седмицаСега();
      if (w !== null && w < 24) {
        ред = 'Пиши ми за седмиците, гаденето, страховете…';
        примери = РАННИ_ЧИПОВЕ;
      }
    }

    const c = el('section', 'jr-card ask-card');
    c.innerHTML = `<div class="ask-head"><span class="ask-badge">${p.badge || '💬'}</span>
      <div><p class="ask-name">${esc(p.name)} <span class="ask-live"><span class="dot">●</span> на линия</span></p>
      <p class="ask-line">${esc(ред)}</p></div></div>`;

    const ред2 = el('div', 'ask-row');
    const inp = el('input', 'ask-inp'); inp.type = 'text'; inp.maxLength = 200;
    inp.placeholder = 'Напиши на ' + p.name + '…';
    inp.setAttribute('aria-label', 'Съобщение до ' + p.name);
    const прати = el('button', 'ask-send', '➤'); прати.type = 'button'; прати.setAttribute('aria-label', 'Изпрати');

    const изпрати = текст => {
      const v = (текст || inp.value).trim(); if (!v) { inp.focus(); return; }
      // запомни последния въпрос за тази стая (22.3)
      const посл = load('bl_ask_last', {});
      посл[стая] = { q: v.slice(0, 120), d: new Date().toISOString().slice(0, 10) };
      save('bl_ask_last', посл);
      inp.value = '';
      MamaHelper.showTab('chat');
      MamaHelper.ask(v);
    };
    прати.addEventListener('click', () => изпрати());
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); изпрати(); } });

    // 🎤 диктовка (22.4) — само ако телефонът я може
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const mic = el('button', 'ask-mic', '🎤'); mic.type = 'button'; mic.setAttribute('aria-label', 'Кажи го на глас');
      mic.title = 'Ще трябва да го кажеш на глас — после ти решаваш дали да го пратиш';
      let rec = null;
      mic.addEventListener('click', () => {
        if (rec) { try { rec.stop(); } catch (e) {} return; }
        rec = new SR(); rec.lang = 'bg-BG'; rec.interimResults = false;
        mic.classList.add('on');
        // 🎤 разпознатото СТОИ в полето — не тръгва само. В тези стаи мама
        //    може да каже на глас „страх ме е от него“; последната дума дали
        //    да замине остава нейна, не на микрофона.
        rec.onresult = ev => { const t = ev.results[0] && ev.results[0][0] ? ev.results[0][0].transcript : ''; if (t) { inp.value = t; inp.focus(); } };
        rec.onend = () => { mic.classList.remove('on'); rec = null; };
        rec.onerror = () => { mic.classList.remove('on'); rec = null; };
        try { rec.start(); } catch (e) { mic.classList.remove('on'); rec = null; }
      });
      ред2.appendChild(mic);
    }
    ред2.appendChild(inp); ред2.appendChild(прати);
    c.appendChild(ред2);

    // 3-те примерни чипа (22.5)
    if (примери.length) {
      const чипове = el('div', 'ask-chips');
      примери.forEach(т => {
        const b = el('button', 'ask-chip', esc(т)); b.type = 'button';
        b.addEventListener('click', () => изпрати(т));
        чипове.appendChild(b);
      });
      c.appendChild(чипове);
    }

    // последният въпрос в тази стая (22.3)
    const посл = load('bl_ask_last', {})[стая];
    if (посл && посл.q) {
      const л = el('button', 'ask-last', '↩ последно попита: „' + esc(посл.q.slice(0, 46)) + (посл.q.length > 46 ? '…' : '') + '“');
      л.type = 'button';
      л.addEventListener('click', () => { MamaHelper.showTab('chat'); });
      c.appendChild(л);
    }
    return c;
  }

  // във ВСЯКА стая, КАТО ПЪРВА карта (след всички подредби)
  Object.keys(window.ROOM_FEATURES || {}).forEach(стая => {
    const база = window.ROOM_FEATURES[стая];
    window.ROOM_FEATURES[стая] = root => {
      база(root);
      const c = поле(стая);
      if (c) root.insertBefore(c, root.firstChild);
    };
  });
})();
