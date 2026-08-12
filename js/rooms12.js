// ═══════════════════════════════════════════════════════════
// ROOMS 12 — ПОСЛЕДНИТЕ ЪПГРЕЙДИ ЗА СТАИ 8 и 9 (план 19, част 4.8 + 4.9)
//
// 🕯️ 4.8.3  Ритуалът на деня — вместо статичния списък
// 🗺️ 4.8.6  Картата на местата — къде съм била / къде искам
// 💌 4.8.8  Комплиментите: изважда стар, когато си на дъното
// 🔄 4.9.4  Обърналите се — какво е работило и е спряло
// 👵 4.9.8  Митовете: табло — къде баба е познала
// 📤 4.9.10 Сподели откритие
//
// ВАЖНО: този файл трябва да се зареди СЛЕД lab.js — иначе стаите още не
// съществуват в ROOM_FEATURES и обвивките мълчаливо не правят нищо.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const localDate = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const today = () => localDate(new Date());
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const card = t => { const c = el('section', 'jr-card'); c.appendChild(el('h4', 'jr-title', t)); return c; };
  const sub = s => '<span class="jr-sub">' + s + '</span>';
  const fx = () => window.BL_FX || { confetti() {}, cheer() {}, buzz() {} };
  const dayIndex = () => { const n = new Date(); return Math.floor((n - new Date(n.getFullYear(), 0, 0)) / 86400000) + n.getFullYear(); };
  const пръст = (e, ш) => { e.style.minHeight = '44px'; if (ш) e.style.minWidth = ш + 'px'; return e; };
  // 👆 12.08 (МЕРЕНО): `.jr-addrow` е flex БЕЗ пренасяне (rooms.css:271), а
  //    `.jr-word` вътре е `flex:1`. С два чипа до него полето за писане излезе
  //    97.5px на телефон 375px — мама пише „морето с татко“ и вижда осем знака,
  //    а плейсхолдърът ѝ е невидим. CSS не е мой файл; вграденият стил стига:
  //    полето заема цял ред, чиповете падат под него. Нищо не стърчи навън.
  //    (и височината: `.jr-word` се мереше 43.0 — един пиксел под прага)
  const целРед = (row, inp) => { row.style.flexWrap = 'wrap'; inp.style.flexBasis = '100%'; inp.style.minWidth = '0'; пръст(inp); };

  // ═══════════ 🕯️ 4.8.3 РИТУАЛЪТ НА ДЕНЯ ═══════════
  // Старият списък стоеше еднакъв всеки ден и мама спираше да го вижда.
  // Един ритуал, за днес, малък — и с честен изход „днес не мога“.
  const РИТУАЛИ = [
    { т: 'т', e: '☕', t: 'Първата глътка — на топло и седнала', d: 'Не на крак. Не докато подаваш нещо. Седни. Две минути.' },
    { т: 'т', e: '🪟', t: 'Отвори прозореца и застани там', d: 'Шейсет секунди. Студено е — точно затова.' },
    { т: 'с', e: '🎧', t: 'Една песен, която е само твоя', d: 'Не приспивна. Твоя. От времето, когато беше само ти.' },
    { т: 'т', e: '🧴', t: 'Намажи си ръцете бавно', d: 'Същото движение, но два пъти по-бавно. Усети го.' },
    { т: 'с', e: '📵', t: 'Десет минути без екран', d: 'Телефонът в другата стая. Светът ще изчака.' },
    { т: 'с', e: '🚿', t: 'Последната минута под студена вода', d: 'Събужда. Ако не ти се иска — не го прави.' },
    { т: 'с', e: '👗', t: 'Облечи нещо, което ти стои добре', d: 'Не за някого. За огледалото в коридора.' },
    { т: 'т', e: '🌿', t: 'Излез до вратата и си поеми дъх', d: 'Дори до площадката. Друг въздух е.' },
    { т: 'с', e: '📖', t: 'Две страници от нещо за възрастни', d: 'Две. Не глава. Две страници се събират навсякъде.' },
    { т: 'т', e: '💄', t: 'Едно нещо само за лицето ти', d: 'Крем, червило, каквото и да е. Трийсет секунди за теб.' },
    { т: 'т', e: '🕯️', t: 'Запали нещо, което мирише хубаво', d: 'Вечер. Само за да мирише на твой дом, не на мляко.' },
    { т: 'т', e: '✍️', t: 'Едно изречение за днес', d: 'Какво беше. Не какво трябваше да бъде.' },
    { т: 'т', e: '🤸', t: 'Протегни се, докато изпука', d: 'Раменете ти носят повече, отколкото признаваш.' },
    { т: 'г', e: '📞', t: 'Обади се на човек, който те кара да се смееш', d: 'Три минути. Не за да се оплачеш — за да се посмееш.' },
    { т: 'т', e: '🍫', t: 'Изяж нещо бавно и само', d: 'Без да делиш. Без да пазиш. Твое.' }
  ];

  function ritualCard() {
    const c = card('Ритуалът на деня 🕯️ ' + sub('едно нещо · малко · за теб'));
    // 🔴 11.08 капанът на снимката: прочетено при РИСУВАНЕ, записвано при клик.
    //    Пресен прочит точно преди всеки запис.
    let st = load('bl_wm_ritual', { d: '', done: false, skip: false, idx: -1 });
    // 🌙 29.07: картата „Колко искам от теб днес“ (women5.js) пише bl_day_tone,
    //    а дотук НИКОЙ не го четеше — тоест тя щеше да е бутон без последствие.
    //    Сега ритуалът се съобразява: на ръба не иска нищо, на „тихо“ дава само
    //    късите, на „мога“ отваря и по-големите. Тонът е за ДНЕС и не се помни.
    // 🔴 11.08: ключът се пълни от ДВЕ места с два различни речника — лентата на
    //    началния екран (firstday.js) пише 'добре'/'уморена'/'на ръба', а картата
    //    в стая 8 пишеше 'ръб'/'тихо'/'нормално'/'мога'. Тук се разбираха само
    //    вторите: мама, казала „на ръба“ на входа, получаваше пълния рафт и я
    //    подканяхме за ритуал. Речниците се сливат тук, а не в четящите.
    const тон = load('bl_day_tone', {});
    const сурово = тон.d === today() ? тон.v : '';
    const тонДнес = сурово === 'ръб' ? 'на ръба' : сурово;   // 'ръб' = стари копия
    // 🟠 12.08 (ИЗМЕРЕНО по речник, останалата половина от фикса от 11.08):
    //    сливането хвана 'уморена' и 'на ръба' от лентата на входа
    //    (firstday.js:57), но пропусна ТРЕТАТА ѝ дума — 'добре'. Тя падаше в
    //    `null`, тоест ЦЕЛИЯТ рафт: жена, казала кротко „добре“, получаваше
    //    по-голямо искане (вкл. „обади се на приятелка“) от жена, натиснала
    //    „✨ Днес мога“ по-долу в стаята. 'добре' е спокойно, не подвиг.
    const позволени = (тонДнес === 'тихо' || тонДнес === 'уморена') ? ['т']
      : (тонДнес === 'нормално' || тонДнес === 'добре') ? ['т', 'с']
      : тонДнес === 'мога' ? ['т', 'с', 'г'] : null;
    const рафт = позволени ? РИТУАЛИ.filter(x => позволени.indexOf(x.т) >= 0) : РИТУАЛИ;
    if (st.d !== today()) { st.d = today(); st.done = false; st.skip = false; st.idx = dayIndex() % РИТУАЛИ.length; save('bl_wm_ritual', st); }
    const базов = РИТУАЛИ[(typeof st.idx === 'number' && st.idx >= 0 ? st.idx : 0) % РИТУАЛИ.length];
    const r = (рафт.indexOf(базов) >= 0 || !рафт.length) ? базов : рафт[dayIndex() % рафт.length];

    if (тонДнес === 'на ръба') {
      // тя каза, че е на ръба — днес не ѝ се иска НИЩО и не се показва бутон
      c.appendChild(el('p', 'jr-privacy',
        'Днес каза, че си на ръба. Тогава нищо. Никакъв ритуал, никакво отмятане — само това: ще мине. 🤍'));
      return c;
    }
    const box = el('div', 'rt-box');
    box.innerHTML = `<span class="rt-e">${r.e}</span><div><p class="rt-t">${esc(r.t)}</p><p class="rt-d">${esc(r.d)}</p></div>`;
    c.appendChild(box);

    const out = el('p', 'rt-out');
    const btns = el('div', 'jr-addrow');
    const ok = el('button', 'jr-chip', '✔ Направих го'); ok.type = 'button'; пръст(ok);
    const no = el('button', 'jr-chip', 'Днес не мога'); no.type = 'button'; пръст(no);
    // ↩ 12.08 (ъпгрейд): двата чипа стоят долепени и след натискане ИЗЧЕЗВАТ и
    //    двата — сгрешен пръст върху „Днес не мога“ отнемаше единственото
    //    предложение за деня без път назад. Действие без изход не се прави.
    const назад = el('button', 'jr-chip', '↩ Не, натиснах грешно'); назад.type = 'button'; пръст(назад);

    // 🟠 12.08 (ИЗМЕРЕНО: в паметта пише n:5, на екрана — нищо): серията се
    //    долепваше към текста САМО в мига на натискането. При всяко следващо
    //    отваряне на стаята (и след презареждане) „5 дни подред“ изчезваше —
    //    единственото, което трупа тази карта, не преживяваше едно затваряне.
    //    Броим серията при РИСУВАНЕ, не при клик.
    const серияДнес = () => {
      const s = load('bl_wm_ritual_streak', { n: 0, last: '' });
      const n = typeof s.n === 'number' ? s.n : 0;
      return (s.last === today() && n >= 3) ? ' ' + n + ' дни подред.' : '';
    };
    const рисувай = () => {
      if (st.done) { out.textContent = '✔ Днес си взе твоите две минути. Това се брои.' + серияДнес(); ok.hidden = true; no.hidden = true; назад.hidden = false; }
      else if (st.skip) { out.textContent = 'Добре. Днес не е ден за ритуали — и това е отговор. Утре пак.'; ok.hidden = true; no.hidden = true; назад.hidden = false; }
      else { out.textContent = ''; ok.hidden = false; no.hidden = false; назад.hidden = true; }
    };
    ok.addEventListener('click', () => {
      const s = load('bl_wm_ritual_streak', { n: 0, last: '' });
      const вчера = localDate(new Date(Date.now() - 86400000));
      // ⚠️ пази от двойно броене: ако днес вече е броено, не пипаме числото
      if (s.last !== today()) { s.n = (s.last === вчера ? (typeof s.n === 'number' ? s.n : 0) + 1 : 1); s.last = today(); save('bl_wm_ritual_streak', s); }
      st = load('bl_wm_ritual', st);   // пресен прочит ПРЕДИ записа
      st.done = true; save('bl_wm_ritual', st); рисувай(); fx().buzz(10);
      if ((s.n || 0) >= 3) fx().confetti();
    });
    no.addEventListener('click', () => { st = load('bl_wm_ritual', st); st.skip = true; save('bl_wm_ritual', st); рисувай(); fx().buzz(6); });
    назад.addEventListener('click', () => {
      st = load('bl_wm_ritual', st);   // пресен прочит ПРЕДИ записа
      const бешеDone = st.done;
      st.done = false; st.skip = false; save('bl_wm_ritual', st);
      // серията се връща само ако тъкмо ние сме я вдигнали днес
      if (бешеDone) {
        const s = load('bl_wm_ritual_streak', { n: 0, last: '' });
        if (s.last === today()) { s.n = Math.max(0, (typeof s.n === 'number' ? s.n : 1) - 1); s.last = s.n ? localDate(new Date(Date.now() - 86400000)) : ''; save('bl_wm_ritual_streak', s); }
      }
      рисувай(); fx().buzz(6);
    });
    btns.appendChild(ok); btns.appendChild(no); btns.appendChild(назад);
    c.appendChild(btns); c.appendChild(out); рисувай();
    c.appendChild(el('p', 'jr-privacy', 'Утре е друг ритуал. Не се трупа списък, не се пропуска нищо — просто по едно на ден.'));
    return c;
  }

  // ═══════════ 🗺️ 4.8.6 КАРТАТА НА МЕСТАТА ═══════════
  function placesCard() {
    const c = card('Картата на местата 🗺️ ' + sub('къде си била · къде искаш'));
    c.appendChild(el('p', 'jr-privacy',
      'Не е списък със задачи. Просто следа, че светът е по-голям от тази стая — и че ще го видиш пак.'));
    // 🔴 11.08 капанът на снимката: снимка при рисуване, запис при клик. Пресен
    //    прочит при рисуване и преди запис; редовете се намират по ТЕКСТ.
    let st = load('bl_wm_places', []);
    const inp = el('input', 'jr-word'); inp.placeholder = 'напр. „Рим“, „морето с татко“, „Исландия“…'; inp.maxLength = 60;
    const wrap = el('div', 'jr-addrow');
    const бил = el('button', 'jr-chip', '📍 Била съм'); бил.type = 'button'; пръст(бил);
    const искам = el('button', 'jr-chip', '✨ Искам'); искам.type = 'button'; пръст(искам);
    const list = el('div', 'jr-wins');
    // ↩ 12.08 (ъпгрейд): ✕-то триеше НАВЕКИ и е на 40px до самото хапче, а
    //    докосването на „Искам“ го превръщаше в „Била съм“ БЕЗ обратен път —
    //    един сгрешен пръст изяждаше мечта. Действие без изход не се прави.
    const отмени = el('button', 'jr-chip', '↩ Върни последното'); отмени.type = 'button';
    отмени.hidden = true; пръст(отмени);
    let последно = null;
    const покажиОтмяна = д => { последно = д; отмени.hidden = !д; };

    const рисувай = () => {
      st = load('bl_wm_places', []);   // пресен прочит при всяко рисуване
      list.innerHTML = '';
      const бх = st.filter(x => x.k === 'was'), их = st.filter(x => x.k === 'want');
      if (!st.length) { list.appendChild(el('p', 'jr-privacy', 'Още празна. Сложи първото — може да е и „Боровец, 2016“.')); return; }
      [['📍 Била съм', бх], ['✨ Искам', их]].forEach(([име, arr]) => {
        if (!arr.length) return;
        list.appendChild(el('p', 'pl-h', име + ' <span class="pl-n">' + arr.length + '</span>'));
        const g = el('div', 'pl-grid');
        arr.forEach(x => {
          const i = st.indexOf(x);
          const p = el('span', 'pl-pin' + (x.k === 'want' ? ' pl-want' : ''));
          p.innerHTML = esc(x.t) + '<button class="pl-x" type="button" aria-label="махни">×</button>';
          // 👆 ✕-то стоеше на 40×40 (women.css:224). Коментарът там е прав, че
          //    хапчето не бива да набъбва — но 44 вдига хапчето от 40 на 44,
          //    не на 54-те, срещу които е писан. То трие; дава се пълната цел.
          пръст(p.querySelector('.pl-x'), 44);
          p.querySelector('.pl-x').addEventListener('click', ev => {
            ev.stopPropagation();
            const махнато = st[i];
            st = load('bl_wm_places', []);   // пресен прочит ПРЕДИ записа
            const k = st.findIndex(y => y && y.t === x.t && y.k === x.k);   // по ТЕКСТ, не по номер
            if (k > -1) st.splice(k, 1);
            save('bl_wm_places', st);
            покажиОтмяна({ вид: 'триене', къде: k > -1 ? k : i, какво: махнато });
            рисувай();
          });
          if (x.k === 'want') p.addEventListener('click', ev => {
            if (ev.target.closest && ev.target.closest('.pl-x')) return;
            x.k = 'was';
            st = load('bl_wm_places', []);   // пресен прочит ПРЕДИ записа
            const мой = st.find(y => y && y.t === x.t); if (мой) мой.k = 'was';
            save('bl_wm_places', st);
            покажиОтмяна({ вид: 'станало', обект: мой || x });
            рисувай(); fx().confetti(); fx().buzz(14);
          });
          g.appendChild(p);
        });
        list.appendChild(g);
      });
      if (их.length) list.appendChild(el('p', 'jr-privacy', 'Като отидеш някъде от „Искам“ — докосни го. Ще мине при „Била съм“.'));
    };
    отмени.addEventListener('click', () => {
      if (!последно) return;
      st = load('bl_wm_places', []);   // пресен прочит ПРЕДИ записа
      if (последно.вид === 'триене') st.splice(Math.min(последно.къде, st.length), 0, последно.какво);
      else if (последно.вид === 'станало') { const м = st.find(y => y && y.t === последно.обект.t); if (м) м.k = 'want'; }
      save('bl_wm_places', st); покажиОтмяна(null); рисувай(); fx().buzz(6);
    });
    const put = k => { const v = inp.value.trim(); if (!v) return; st = load('bl_wm_places', []); st.push({ t: v.slice(0, 60), k, d: today() }); save('bl_wm_places', st); inp.value = ''; покажиОтмяна(null); рисувай(); fx().buzz(8); };
    бил.addEventListener('click', () => put('was'));
    искам.addEventListener('click', () => put('want'));
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); put('want'); } });
    wrap.appendChild(inp); wrap.appendChild(бил); wrap.appendChild(искам);
    целРед(wrap, inp);
    c.appendChild(wrap); c.appendChild(отмени); c.appendChild(list); рисувай();
    return c;
  }

  // ═══════════ 💌 4.8.8 КОМПЛИМЕНТИТЕ — КОГАТО СИ НА ДЪНОТО ═══════════
  // Известия няма (нищо не тръгва навън и нищо не буди телефона). Затова:
  // картата сама изважда стар комплимент — и се показва по-настойчиво,
  // ако точно днес е било тежко.
  function complimentCard() {
    const c = card('Когато си на дъното 💌 ' + sub('нечии думи · твои завинаги'));
    const all = load('bl_wm_compl', []).filter(x => x && x.t);
    if (!all.length) {
      c.appendChild(el('p', 'jr-privacy',
        'Тук ще вадя стар комплимент, когато денят е тежък. Но кутията е празна — иди в „Комплиментите“ 💌 и запиши какво са ти казвали. Дори едно.'));
      return c;
    }
    // тежко ли е било днес? (маркира се от чата при тежка тема)
    const тежко = load('bl_heavy_day', '') === today();
    const seen = load('bl_wm_compl_seen', { d: '', i: -1 });
    if (seen.d !== today()) { seen.d = today(); seen.i = dayIndex() % all.length; save('bl_wm_compl_seen', seen); }
    const box = el('div', 'cp-box');
    box.setAttribute('aria-live', 'polite');
    // 🟡 12.08: датата излизаше сурова — „2026-08-01“. Български думи, българска дата.
    const датаБг = d => { try { const t = new Date(d + 'T12:00'); return isNaN(t) ? d : t.toLocaleDateString('bg-BG'); } catch (e) { return d; } };
    const покажи = i => {
      const x = all[((i % all.length) + all.length) % all.length];
      box.innerHTML = `<p class="cp-t">„${esc(x.t)}“</p><p class="cp-w">— ${esc(x.w || 'някой, който те е гледал')}${x.d ? ' · ' + esc(датаБг(x.d)) : ''}</p>`;
    };
    if (тежко) c.appendChild(el('p', 'cp-why', 'Днес беше тежък ден. Затова точно това:'));
    покажи(typeof seen.i === 'number' ? seen.i : 0);
    c.appendChild(box);
    if (all.length > 1) {
      const пак = el('button', 'jr-chip', '💌 Още едно'); пак.type = 'button'; пръст(пак);
      let n = typeof seen.i === 'number' ? seen.i : 0;
      пак.addEventListener('click', () => { n++; покажи(n); fx().buzz(6); });
      c.appendChild(пак);
    }
    c.appendChild(el('p', 'jr-privacy', 'Тези думи някой ги е казал сериозно. Ти си ги записала. Значи са истина — дори когато днес не ти звучат така.'));
    return c;
  }

  // ═══════════ 🔄 4.9.4 ОБЪРНАЛИТЕ СЕ ═══════════
  // Най-подлото нещо в бебетата: работи седмица, после спира. Мама си мисли,
  // че тя е сгрешила. Не е — детето се е сменило.
  function flippedCard() {
    const c = card('Работеше… и спря 🔄 ' + sub('не си сгрешила · детето се е сменило'));
    c.appendChild(el('p', 'jr-privacy',
      'Тук пиши нещата, които <strong>са работили и после спряха</strong>. Не за да се ядосваш — за да видиш, че се повтаря на вълни. И че някои се връщат.'));
    // 🔴 11.08 капанът на снимката (виж картата с местата горе)
    let st = load('bl_lab_flipped', []);
    const inp = el('input', 'jr-word'); inp.placeholder = 'напр. „повиването“, „люлеенето“, „биберонът“…'; inp.maxLength = 70;
    const add = el('button', 'jr-chip', '+ Добави'); add.type = 'button'; пръст(add);
    const list = el('div', 'jr-wins');
    // ↩ 12.08 (ъпгрейд): 🗑 е 40px и стои ДО „✔ върна се“ — двата бутона се
    //    натискат с един и същ палец, а единият трие безвъзвратно записа „кое
    //    работеше и спря“. Връщаме последното изтрито.
    const отмени = el('button', 'jr-chip', '↩ Върни изтритото'); отмени.type = 'button';
    отмени.hidden = true; пръст(отмени);
    let махнато = null;
    const рисувай = () => {
      st = load('bl_lab_flipped', []);   // пресен прочит при всяко рисуване
      list.innerHTML = '';
      if (!st.length) { list.appendChild(el('p', 'jr-privacy', 'Още нищо. Като нещо спре да работи — сложи го тук.')); return; }
      st.slice().reverse().forEach((x, ri) => {
        const i = st.length - 1 - ri;
        const row = el('div', 'fl-row' + (x.back ? ' fl-back' : ''));
        row.innerHTML = `<span class="fl-t">${esc(x.t)}</span>
          <span class="fl-d">спря ${esc(x.d)}${x.back ? ' · върна се ' + esc(x.back) : ''}</span>
          <button class="jr-chip fl-b" type="button">${x.back ? '↩ не, пак спря' : '✔ върна се'}</button>
          <button class="nt-del" type="button" aria-label="Махни „${esc(x.t)}“ от списъка">🗑</button>`;
        row.querySelector('.fl-b').addEventListener('click', () => {
          x.back = x.back ? '' : today();
          st = load('bl_lab_flipped', []);   // пресен прочит ПРЕДИ записа
          const мой = st.find(y => y && y.t === x.t && y.d === x.d); if (мой) мой.back = x.back;
          if (x.back) { fx().confetti(); fx().buzz(12); }
          save('bl_lab_flipped', st); рисувай();
        });
        // 👆 измерено 40×44 — `.nt-del` носи min-width:40 от touch.css:114 за
        //    ВСИЧКИ кошчета. Тук е долепено до „✔ върна се“ и трие; в тази
        //    карта му давам пълните 44, без да пипам общия клас.
        пръст(row.querySelector('.nt-del'), 44);
        row.querySelector('.nt-del').addEventListener('click', () => {
          махнато = { къде: i, какво: st[i] }; отмени.hidden = false;
          st = load('bl_lab_flipped', []);   // пресен прочит ПРЕДИ записа
          const k = st.findIndex(y => y && y.t === x.t && y.d === x.d);   // по ТЕКСТ, не по номер
          if (k > -1) { махнато.къде = k; st.splice(k, 1); }
          save('bl_lab_flipped', st); рисувай();
        });
        list.appendChild(row);
      });
      const върнати = st.filter(x => x.back).length;
      if (върнати) list.appendChild(el('p', 'jr-privacy', '↩ ' + върнати + ' от тях се върнаха. Затова не изхвърляй нищо веднага.'));
    };
    отмени.addEventListener('click', () => {
      if (!махнато) return;
      st = load('bl_lab_flipped', []);   // пресен прочит ПРЕДИ записа
      st.splice(Math.min(махнато.къде, st.length), 0, махнато.какво);
      save('bl_lab_flipped', st); махнато = null; отмени.hidden = true; рисувай(); fx().buzz(6);
    });
    const put = () => { const v = inp.value.trim(); if (!v) return; st = load('bl_lab_flipped', []); st.push({ t: v.slice(0, 70), d: today(), back: '' }); save('bl_lab_flipped', st); inp.value = ''; махнато = null; отмени.hidden = true; рисувай(); fx().buzz(8); };
    add.addEventListener('click', put);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); put(); } });
    const row = el('div', 'jr-addrow'); row.appendChild(inp); row.appendChild(add); целРед(row, inp);
    c.appendChild(row); c.appendChild(отмени); c.appendChild(list); рисувай();
    c.appendChild(el('p', 'jr-privacy', 'Правилото на лабораторията: пробвай пак след месец. Детето отпреди месец не е това дете.'));
    return c;
  }

  // ═══════════ 👵 4.9.8 ТАБЛОТО НА МИТОВЕТЕ ═══════════
  function mythBoardCard() {
    const c = card('Табло: къде баба позна 👵 ' + sub('резултатът от твоите проверки'));
    // 🔴 г09/322: „thin“ значи НЕДОВЪРШЕН опит, не резултат — а влизаше в таблото
    //    като „без разлика“ и разреждаше сметката.
    const done = (load('bl_lab', { list: [], done: [] }).done || []).filter(x => x && x.e === '👵' && x.tone !== 'thin');
    if (!done.length) {
      c.appendChild(el('p', 'jr-privacy',
        'Таблото се пълни само. Започни от „Митът на седмицата“ 👵 горе — щом довършиш един опит докрай, резултатът идва тук.'));
      return c;
    }
    const позна = done.filter(x => x.tone === 'yes').length;
    const не = done.filter(x => x.tone === 'no').length;
    const равно = done.length - позна - не;
    const bar = el('div', 'mb-bar');
    // 🟡 12.08 (МЕРЕНО: 1/1/1 даваше 33+33+33 = 99% и оставяше сива ивица,
    //    все едно има четвърта, безименна категория). Последният дял поема
    //    остатъка, за да затваря лентата точно.
    const proc = n => Math.round(n / done.length * 100);
    const дялове = [['mb-yes', позна], ['mb-mid', равно], ['mb-no', не]].filter(([, n]) => n);
    let похарчено = 0;
    bar.innerHTML = дялове.map(([кл, n], i) => {
      const ш = i === дялове.length - 1 ? 100 - похарчено : proc(n);
      похарчено += ш;
      return `<span class="mb-s ${кл}" style="width:${ш}%">${n}</span>`;
    }).join('');
    c.appendChild(bar);
    c.appendChild(el('p', 'mb-leg', '<span class="mb-k mb-yes"></span> позна &nbsp; <span class="mb-k mb-mid"></span> без разлика &nbsp; <span class="mb-k mb-no"></span> не позна'));
    done.slice().reverse().forEach(x => {
      const r = el('div', 'mb-row');
      const знак = x.tone === 'yes' ? '✔' : x.tone === 'no' ? '✘' : '≈';
      // CSS има само mb-yes / mb-mid / mb-no. `mb-${x.tone}` раждаше mb-same —
      // клас без нито едно правило, тоест безцветен знак, все едно се е счупило.
      const кл = x.tone === 'yes' ? 'yes' : x.tone === 'no' ? 'no' : 'mid';
      r.innerHTML = `<span class="mb-i mb-${кл}">${знак}</span><span class="mb-q">${esc(x.q || '')}</span><span class="mb-v">${esc(x.t || '')}</span>`;
      c.appendChild(r);
    });
    // 🔴 г09/322: обща поука за бабите след ЕДИН опит е гадаене, не сметка.
    //    Под три проверени мита казваме само какво има, без правило как да се държи.
    const текст = done.length < 3
      ? (done.length === 1 ? 'Един проверен мит. Твърде малко за поука — но е твой и е записан.'
                           : done.length + ' проверени мита. Още е рано за общ извод; след третия ще има какво да си кажем.')
      : позна > не
        ? 'Бабите ти печелят повече, отколкото губят. Записано е — следващия път ги слушай малко повече.'
        : не > позна
          ? 'Твоето дете не чете същата книга като бабите. И това е нормално — затова проверяваш.'
          : 'Наравно. Значи: слушай ги, но проверявай. Точно каквото правиш.';
    c.appendChild(el('p', 'lb-kind', '💚 ' + текст));
    return c;
  }

  // ═══════════ 📤 4.9.10 СПОДЕЛИ ОТКРИТИЕ ═══════════
  function shareFindCard() {
    const c = card('Сподели откритие 📤 ' + sub('на приятелка, която не спи'));
    // 🟠 12.08 (ИЗМЕРЕНО: пуснах опит с tone:'thin' и той се появи в падащото
    //    меню — копирах „→ недовършен“ готово за пращане): таблото две карти
    //    по-горе изрично изхвърля 'thin', защото „недовършен опит не е
    //    резултат“ (коментарът му на ред 231). Тук същият запис тръгваше
    //    НАВЪН, към приятелка, като „проверих го при моето дете“. Едно и също
    //    правило в една стая — прилага се и на двете места.
    const done = (load('bl_lab', { list: [], done: [] }).done || []).filter(x => x && x.tone !== 'thin');
    if (!done.length) {
      c.appendChild(el('p', 'jr-privacy', 'Като довършиш първия опит, ще можеш да пратиш откритието на приятелка. Засега — още нямаш какво.'));
      return c;
    }
    c.appendChild(el('p', 'jr-privacy', 'Избери какво откри. Тръгва само ако ти натиснеш — през твоя телефон, до твой човек. Нищо не минава през нас.'));
    const sel = el('select', 'jr-word');
    done.slice().reverse().forEach((x, ri) => {
      const o = el('option'); o.value = String(done.length - 1 - ri);
      o.textContent = (x.e || '🔬') + ' ' + (x.q || '') + ' → ' + (x.t || '');
      sel.appendChild(o);
    });
    const b = el('button', 'jr-chip', '📤 Прати'); b.type = 'button'; пръст(b);
    пръст(sel);
    const out = el('p', 'rt-out');
    b.addEventListener('click', async () => {
      const x = done[+sel.value] || done[0];
      // 🔴 г09/318: числото беше зашито на 7 — а част от опитите са 6 вечери, а с
      //    „Още няколко вечери“ стават 10, 13, 16. Старите записи нямат `n` → без число.
      const вечери = x.n ? x.n + (x.n === 1 ? ' вечер' : ' вечери') : 'няколко вечери';
      const текст = `${x.e || '🔬'} Проверих го при моето дете, ${вечери}:\n„${x.q || ''}“\n→ ${x.t || ''}\n\n(от Помощника на мама — моят опит, не съвет)`;
      if (navigator.share) {
        try { await navigator.share({ text: текст }); out.textContent = ''; return; } catch (e) { if (e.name === 'AbortError') return; }
      }
      try { await navigator.clipboard.writeText(текст); out.textContent = '✔ Копирано. Пусни го, където искаш.'; }
      // 🟠 11.08 (обиколка): тук пишеше „Препиши го на ръка“ — а текстът никъде
      //    не се виждаше. Мама трябваше да препише нещо, което не ѝ е показано.
      //    Сега го показваме, маркирано, за да го хване с пръст.
      catch (e) {
        out.textContent = 'Телефонът не дава да го копирам сама. Ето го — задръж върху текста и го копирай:';
        const t = el('textarea', 'jr-word rt-text'); t.readOnly = true; t.rows = 5; t.value = текст;
        t.setAttribute('aria-label', 'Текстът за копиране');
        out.appendChild(t);
        try { t.focus(); t.select(); } catch (e2) {}
      }
      fx().buzz(8);
    });
    const row = el('div', 'jr-addrow'); row.appendChild(sel); row.appendChild(b); целРед(row, sel);
    c.appendChild(row); c.appendChild(out);
    c.appendChild(el('p', 'lb-kind', '💚 Пращаш „при моето дете стана така“ — не съвет. Разликата е огромна и приятелката ти ще я усети.'));
    return c;
  }

  // ── свързване ──
  const ПАКЕТИ = {
    'Жената в мен': root => {
      root.appendChild(ritualCard());
      root.appendChild(placesCard());
      root.appendChild(complimentCard());
    },
    'Лабораторията': root => {
      root.appendChild(flippedCard());
      root.appendChild(mythBoardCard());
      root.appendChild(shareFindCard());
    }
  };
  Object.keys(ПАКЕТИ).forEach(стая => {
    const база = window.ROOM_FEATURES && window.ROOM_FEATURES[стая];
    if (!база) return;
    window.ROOM_FEATURES[стая] = root => { база(root); ПАКЕТИ[стая](root); };
  });
})();
