// ═══════════════════════════════════════════════════════════
// СТАЯ 9 — ЛАБОРАТОРИЯТА 🔬  (помощничка: Ема)
//
// „Всяко бебе е различно." Всички го казват. Никой не помага да направиш
// нещо с него. Тук се проверява — при ТОВА бебе.
//
// ЖЕЛЯЗНИ ПРАВИЛА:
//  1. НИКОГА здраве. Опити за лекарства, симптоми, температура → отказ.
//     Само сън, навици, приемане на храна, настроение.
//  2. НИКОГА „доказано". Пишем „при твоите 7 вечери се получи".
//  3. Малка извадка → казваме го, вместо да измисляме отговор.
//  4. Никакви проценти. „3 от 4 вечери" — числото трябва да личи, че е нейно.
//  5. Присъдата не хвали и не кори. Констатира.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const localDate = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const today = () => localDate(new Date());
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const fx = () => window.BL_FX || { confetti() {}, cheer() {}, buzz() {} };
  const card = t => { const c = el('section', 'jr-card'); c.appendChild(el('h4', 'jr-title', t)); return c; };
  const sub = s => '<span class="jr-sub">' + s + '</span>';
  const days = d => Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  const babyName = () => (load('bl_baby', {}).name || 'бебето');

  // ── ПРАВИЛО 1: какво НЕ се проверява с опити ──
  const MED = /температур|градус|лекарств|хапче|сироп|антибиотик|ваксин|болк|боли|обрив|повръщ|диари|запек|кашлиц|хрем|инфекц|алерг|астма|екзема|жълтениц|дишан|задух|гърч|кръв|симптом|диагноз|лечени|доза|дозиров|витамин д|желязо|пробиотик|хомеопат|ракия|компрес/i;
  function isMedical(t) { return MED.test(String(t || '')); }

  // ═══════════ ГОТОВИТЕ ОПИТИ ═══════════
  // всеки е за НАВИК, никой не е за здраве
  const READY = [
    // 🔴 05.08 (одит г04, №202): опитът се пускаше без нито дума за безопасен
    //    сън — думите ги има в kb.js (ema-san), но само там, където мама ЧЕТЕ,
    //    а не там, където ДЕЙСТВА. `warn` се показва в момента на действието.
    { id: 'swaddle', e: '🌀', q: 'Спи ли по-добре повито?', a: 'повито', b: 'непровито', d: 7, why: 'Бабите се кълнат. Да видим при нас.',
      warn: 'Само по гръб · крачетата свободни в ханша · спираме повиването веднага щом бебето почне да се обръща.' },
    { id: 'noise',   e: '🔊', q: 'Помага ли белият шум?', a: 'с бял шум', b: 'без', d: 7, why: 'Или е навик, или работи. Ще разберем.' },
    { id: 'bath',    e: '🛁', q: 'Вечерната баня приспива ли?', a: 'с баня', b: 'без баня', d: 7, why: 'На някои деца ги разбужда. На кои?' },
    { id: 'early',   e: '🕕', q: 'По-рано лягане → по-дълъг сън?', a: 'по-рано', b: 'както обикновено', d: 7, why: 'Звучи наопаки, но често е вярно.' },
    { id: 'walk',    e: '🚶‍♀️', q: 'Следобедната разходка прави ли вечерта по-спокойна?', a: 'с разходка', b: 'без', d: 7, why: 'Въздухът или умората?' },
    { id: 'song',    e: '🎵', q: 'Една и съща песничка става ли сигнал за сън?', a: 'с песничката', b: 'без', d: 7, why: 'Ритуалите се учат. Или не.' },
    { id: 'socks',   e: '🧦', q: 'Топли крачета → по-лесно заспиване?', a: 'с чорапки', b: 'без', d: 7, why: 'Старият трик на бабите.' },
    { id: 'cooler',  e: '🌡️', q: 'По-хладна стая (19-20°) — по-дълъг сън?', a: 'по-хладно', b: 'както обикновено', d: 7, why: 'Само стайна температура, нищо медицинско. Прегряването буди.' },
    { id: 'three',   e: '🥄', q: 'Приема ли новата храна на третия път?', a: 'предлагам пак', b: 'не предлагам', d: 6, why: 'Казват, че трябвали 8-10 опита. При нас?' },
    { id: 'plate',   e: '🎨', q: 'Едно и също чинийче → яде ли повече?', a: 'любимото чинийче', b: 'кое да е', d: 6, why: 'Дребно е. Понякога решава всичко.' },
    { id: 'teddy',   e: '🧸', q: 'Едно и също мече помага ли за раздялата?', a: 'с мечето', b: 'без', d: 6, why: 'Утешителят се учи бавно.' },
    { id: 'quiet',   e: '🤫', q: 'Тиха последна половин час → по-лесна вечер?', a: 'тихо преди сън', b: 'както дойде', d: 7, why: 'Екраните и лудориите се плащат по-късно.' },
    { id: 'own',     e: '✏️', q: 'Мой опит', a: 'пробвам', b: 'не пробвам', d: 7, why: 'Твой въпрос, твои правила.' },
    { id: 'later', e: '🌙', q: 'Ако лягаме 30 мин. по-късно — по-добра нощ?', a: 'по-късно', b: 'както обикновено', d: 7, why: 'Понякога бебето просто не е уморено достатъчно.' },
    { id: 'dark', e: '🌑', q: 'Пълна тъмнина срещу нощна лампа?', a: 'тъмно', b: 'с лампа', d: 7, why: 'Светлината пречи на хормона на съня.' },
    { id: 'massage', e: '💆', q: 'Масажче преди сън — заспива ли по-лесно?', a: 'с масаж', b: 'без', d: 7, why: 'Докосването сваля напрежението.' },
    { id: 'sameorder', e: '🔁', q: 'Един и същ ред всяка вечер — по-бързо заспиване?', a: 'същия ред', b: 'както дойде', d: 7, why: 'Предвидимостта е успокоение.' },
    { id: 'dad', e: '🧢', q: 'Ако татко приспива — различно ли е?', a: 'татко', b: 'мама', d: 7, why: 'Понякога миризмата на мама значи „храна“, не „сън“.' },
    { id: 'food_time', e: '🍽️', q: 'Вечеря час по-рано — по-малко нощни събуждания?', a: 'по-рано', b: 'както обикновено', d: 7, why: 'Пълният корем не винаги е по-добрият корем.' },
    { id: 'nonap', e: '☀️', q: 'Ако късната дрямка отпадне — по-лесна вечер?', a: 'без късна дрямка', b: 'с нея', d: 7, why: 'След определен час дрямката краде от нощта.' },
    // ── настроението на МАМА: навици, не лечение ──
    { id: 'mama_out', e: '🚪', q: 'Двайсет минути навън сама — по-лек ли е следобедът?', a: 'излизам', b: 'не излизам', d: 7, why: 'Не е лек за нищо. Просто да видим има ли разлика за теб.' },
    { id: 'mama_dress', e: '👗', q: 'Ако се облека преди девет — различен ли е денят?', a: 'обличам се', b: 'както дойде', d: 7, why: 'Някои жени казват, че решава. Други — че е глупост. Ти коя си?' },
    { id: 'mama_phone', e: '📵', q: 'Първият час без телефон — по-спокойно ли започва?', a: 'без телефон', b: 'както обикновено', d: 7, why: 'Чуждите животи в 7 сутринта струват нещо.' },
    { id: 'eve_order', e: '🍲', q: 'Един и същ ред на вечерята — по-малко нерви?', a: 'същия ред', b: 'както дойде', d: 7, why: 'Предвидимото уморява по-малко — и теб, не само бебето.' }
  ];

  // ═══════════ ОПИТИТЕ ═══════════
  // st = { list: [ {id, q, a, b, d, log: {дата: {arm:'a'|'b', ok:0|1}}, closed, verdict} ] }
  const K = 'bl_lab';
  const getSt = () => load(K, { list: [], done: [] });

  function activeExp() { return getSt().list.find(x => !x.closed); }
  // 4.9.6: до ДВА опита наведнъж — но само ако мерят различни неща
  function activeExps() { return getSt().list.filter(x => !x.closed); }

  function startExp(tpl, customQ) {
    const st = getSt();
    if (st.list.filter(x => !x.closed).length >= 2) return null;
    const e = {
      id: tpl.id + '-' + Date.now(), e: tpl.e, q: customQ || tpl.q,
      a: tpl.a, b: tpl.b, d: tpl.d, warn: tpl.warn || '', log: {}, started: today(), closed: false
    };
    st.list.push(e); save(K, st);
    return e;
  }

  // ── ПРАВИЛО 2+3+4: присъдата ──
  function verdict(e) {
    const keys = Object.keys(e.log);
    const A = keys.filter(k => e.log[k].arm === 'a');
    const B = keys.filter(k => e.log[k].arm === 'b');
    const aOk = A.filter(k => e.log[k].ok).length;
    const bOk = B.filter(k => e.log[k].ok).length;
    const nm = babyName();

    // 14.3.11: e.a/e.b/nm влизат в innerHTML — nm е името, което МАМА пише,
    // а a/b може да дойдат от внесено копие. Escape на всяка стойност.
    const ea = esc(e.a), eb = esc(e.b), еиме = esc(nm);
    // 05.08 (одит г04, №151): прагът беше по 2 вечери на рамо — минаваше
    // разрез 2 срещу 5 и се поднасяше като „твоите 7 вечери“. При 7 вечери
    // праг 3 оставя само 3/4 и 4/3 — единствените, които си заслужават
    // сравнението.
    if (A.length < 3 || B.length < 3) {
      return {
        tone: 'thin', nA: A.length, nB: B.length,
        t: 'Още е рано за отговор.',
        d: 'Имаш ' + A.length + ' ' + (A.length === 1 ? 'вечер' : 'вечери') + ' „' + ea + '“ и ' +
           B.length + ' „' + eb + '“. За да има какво да сравня, трябват поне по 3 от всяко — тоест някои вечери прави нещото, а други не. Продължавай.'
      };
    }
    const aRate = aOk / A.length, bRate = bOk / B.length;
    const diff = aRate - bRate;
    const line = '<br><span class="lb-num">' + ea + ': по-добре в <strong>' + aOk + ' от ' + A.length + '</strong> · ' +
                 eb + ': в <strong>' + bOk + ' от ' + B.length + '</strong></span>';
    if (Math.abs(diff) < 0.2) {
      return { tone: 'same', nA: A.length, nB: B.length, t: 'Няма разлика.', d: 'При ' + еиме + ' двете излизат горе-долу еднакво.' + line +
        '<br><br>Което също е отговор: значи можеш да не се мъчиш.' };
    }
    if (diff > 0) {
      return { tone: 'yes', nA: A.length, nB: B.length, t: 'При ' + еиме + ' „' + ea + '“ май работи.', d: line +
        '<br><br>Това не е наука — това са твоите ' + keys.length + ' вечери. Но са ТВОИТЕ.' };
    }
    // 05.08 (одит г04, №320): отрицателният изход беше плоско твърдение
    // („не помага“), а положителният — ограден с „май“. Един праг, една
    // извадка → един и същи хедж в двете посоки.
    return { tone: 'no', nA: A.length, nB: B.length, t: 'При ' + еиме + ' „' + ea + '“ май не помага.', d: line +
      '<br><br>Спокойно — на всеки работи различно. Затова го проверихме.' };
  }

  // ═══════════ КАРТИТЕ ═══════════

  // 05.08 (одит г04, №202): предупреждението на опита — четено и от вече
  // текущи опити, записани преди полето `warn` да съществува (по id-то на
  // шаблона, което е първата част на e.id).
  function предупреждениеЗа(e) {
    if (!e) return '';
    if (e.warn) return e.warn;
    const тип = String(e.id || '').split('-')[0];
    const t = READY.find(x => x.id === тип);
    return (t && t.warn) || '';
  }
  function редПредупреждение(e) {
    const w = предупреждениеЗа(e);
    return w ? el('p', 'lb-warn2', '⚠️ ' + esc(w)) : null;
  }

  // 05.08 (одит г04, №336): при ДВА едновременни опита base() рисуваше две
  // карти с буквално еднакво заглавие, а polish.js прави ключа от заглавието
  // (cardKey) — закачането и сгъването на едната важаха и за другата, а в
  // „Какво има в тази стая“ двата еднакви бутона водеха на едно място.
  // Различаваме ги: и за окото (метът в заглавието), и за ключа (blkeyExtra).
  const мет = (e, много) => (много && e ? ' · ' + esc(String(e.q || '').slice(0, 18)) : '');
  const бележиКарта = (c, e, много) => { if (много && e) c.dataset.blkeyExtra = e.id; return c; };

  function todayTapCard(exp, много) {
    const e = exp || activeExp();
    const c = card('Днешното докосване 👆' + мет(e, много) + sub(e ? 'три секунди · толкова' : 'няма опит в ход'));
    бележиКарта(c, e, много);
    if (!e) {
      c.appendChild(el('p', 'jr-privacy', 'Тръгни на опит отдолу и тук ще те чака по едно докосване на ден. 🔬'));
      return c;
    }
    const rec = e.log[today()];
    c.appendChild(el('p', 'lb-q', e.e + ' ' + esc(e.q)));
    const пред = редПредупреждение(e); if (пред) c.appendChild(пред);

    if (rec) {
      c.appendChild(el('div', 'lb-done', '✔ Отметнато за днес: <strong>' + esc(rec.arm === 'a' ? e.a : e.b) + '</strong> · ' +
        (rec.ok ? '😴 добре' : '😩 не толкова') + '<br><small>Утре пак. Ема помни.</small>'));
      // 05.08 (одит г04, №365): отметката беше окончателна — натисне ли наслуки
      // в 7 сутринта преди кафето, това ѝ ставаше доказателството. Сега се маха.
      const поправи = el('div', 'jr-chips');
      const пб = el('button', 'jr-chip jr-chip-soft', '✏️ Поправи днешното'); пб.type = 'button';
      пб.addEventListener('click', () => {
        const пресен = getSt();
        const цел = (пресен.list || []).find(x => x && x.id === e.id);
        if (!цел || !цел.log) { rerender(); return; }
        delete цел.log[today()];
        e.log = цел.log;
        save(K, пресен); fx().buzz(6); rerender();
      });
      поправи.appendChild(пб);
      c.appendChild(поправи);
      return c;
    }
    // 05.08 (одит г04, №319): никъде не пишеше, че рамената се РЕДУВАТ — мама
    // го научаваше чак от thin-присъдата, след като е изхарчила седмицата.
    // Живият ред ѝ показва къде е, докато още може да го промени.
    const кл = Object.keys(e.log);
    if (кл.length) {
      const бА = кл.filter(k => e.log[k] && e.log[k].arm === 'a').length;
      c.appendChild(el('p', 'lb-kind', 'Досега: <strong>' + бА + '</strong> „' + esc(e.a) + '“ · <strong>' +
        (кл.length - бА) + '</strong> „' + esc(e.b) + '“ — трябват поне по 3 от всяко, затова ги редувай.'));
    }
    // 1. кое от двете беше днес
    c.appendChild(el('p', 'lb-step', '1. Днес какво беше?'));
    const arms = el('div', 'jr-chips');
    let chosen = null;
    [['a', e.a], ['b', e.b]].forEach(([k, label]) => {
      const b = el('button', 'jr-chip lb-arm', esc(label)); b.type = 'button';   // 14.3.11
      b.addEventListener('click', () => {
        chosen = k;
        [...arms.children].forEach(x => x.classList.toggle('on', x === b));
        step2.hidden = false; fx().buzz(6);
      });
      arms.appendChild(b);
    });
    c.appendChild(arms);
    // 2. как мина
    const step2 = el('div', 'lb-step2'); step2.hidden = true;
    // 05.08 (одит г04, №365): „Как мина?“ — по-добре от какво? Целият резултат
    // висеше на този един бит без база. Закотвяме го.
    step2.appendChild(el('p', 'lb-step', '2. Как мина спрямо обичайното за последните дни?'));
    const rate = el('div', 'jr-chips');
    [['1', '😴 По-добре'], ['0', '😩 Не толкова']].forEach(([v, label]) => {
      const b = el('button', 'jr-chip lb-rate', label); b.type = 'button';
      b.addEventListener('click', () => {
        if (!chosen) return;
        // 🚨 22.07 (армия, RED): цялата стая беше задънена улица. `e` идва от
        //   activeExps() — СВОЙ JSON.parse; `st` е ВТОРИ, независим parse.
        //   Мутацията на `e.log` не пипаше `st.list`, така че `save(K, st)`
        //   записваше стария снимък БЕЗ отметката. Резултат: броячът стои на
        //   нула, присъдата никога не идва, а след 3 дни картата укорява мама
        //   „Не си отмятала“ — при положение че тя отмята всяка вечер.
        //   Пишем в СЪЩИЯ обект, който после записваме, и то свеж.
        const пресен = getSt();
        const цел = (пресен.list || []).find(x => x && x.id === e.id);
        if (!цел) { rerender(); return; }          // опитът вече го няма
        if (!цел.log || typeof цел.log !== 'object') цел.log = {};
        цел.log[today()] = { arm: chosen, ok: +v };
        e.log = цел.log;                           // и картата вижда същото
        save(K, пресен); fx().buzz(12); fx().cheer && fx().cheer();
        rerender();
      });
      rate.appendChild(b);
    });
    step2.appendChild(rate);
    c.appendChild(step2);
    return c;
  }

  function runningCard(exp, много) {
    const e = exp || activeExp();
    if (!e) return null;
    const c = card('Опитът в ход 🔬' + мет(e, много) + sub('Ема не издава отговора преди края — иначе почваш да „помагаш“'));
    бележиКарта(c, e, много);
    const n = Object.keys(e.log).length;
    const left = Math.max(0, e.d - n);
    c.appendChild(el('p', 'lb-q', e.e + ' ' + esc(e.q)));
    const bar = el('div', 'lb-bar');
    for (let i = 0; i < e.d; i++) {
      const d = el('i', i < n ? 'on' : '');
      bar.appendChild(d);
    }
    c.appendChild(bar);
    const пред2 = редПредупреждение(e); if (пред2) c.appendChild(пред2);   // №202
    c.appendChild(el('p', 'lb-prog', left > 0
      ? 'Още <strong data-cnt="' + left + '">' + left + '</strong> ' + (left === 1 ? 'вечер' : 'вечери') + ' и гледаме какво излезе.'
      : 'Готово! Виж присъдата отдолу. 👇'));

    // ── ПАЗАЧ: забравен опит не бива да я гледа с укор ──
    const last = Object.keys(e.log).sort().slice(-1)[0] || e.started;
    if (days(last) >= 3) {
      const w = el('div', 'lb-forgot');
      // 05.08 (одит г04, №147): тук стоеше числото „от N дни“ — точно броячът,
      // който kb.js обещава, че тук няма („Тук няма серии, които се късат, и
      // броячи, които те засрамват.“). Смекчаването във второто изречение не
      // отменя числото в първото — то е първо. Условието остава, показването не.
      w.innerHTML = '<p>Опитът те чака, но не бърза. Животът е по-важен от него.</p>';
      const b = el('button', 'jr-chip', 'Да го оставим за друг път'); b.type = 'button';
      b.addEventListener('click', () => {
        const st = getSt();
        st.list = st.list.filter(x => x.id !== e.id);
        save(K, st); rerender();
      });
      w.appendChild(b);
      c.appendChild(w);
    }

    const stop = el('button', 'jr-chip jr-chip-soft lb-stop', '⏹️ Спри опита'); stop.type = 'button';
    stop.addEventListener('click', () => {
      const st = getSt();
      st.list = st.list.filter(x => x.id !== e.id);
      save(K, st); rerender();
    });
    c.appendChild(stop);
    return c;
  }

  // 📖 отваряне на статия от Голямата библиотека — същият механизъм, който
  //    ползва рафтът. init() е идемпотентен: ако вече е заредена, връща веднага.
  function отвориСтатия(id) {
    const пусни = () => { if (window.BL_ARTICLES && BL_ARTICLES.open) BL_ARTICLES.open(id); };
    if (window.BL_LIB && BL_LIB.init) BL_LIB.init().then(пусни); else пусни();
  }
  function чипСтатия(id, надпис) {
    const b = el('button', 'jr-chip jr-chip-soft', '📖 ' + надпис); b.type = 'button';
    b.addEventListener('click', () => { отвориСтатия(id); fx().buzz(6); });
    return b;
  }

  function verdictCard(exp, много) {
    const e = exp || activeExp();
    if (!e) return null;
    const n = Object.keys(e.log).length;
    if (n < e.d) return null;                       // не издаваме преди края
    const v = verdict(e);
    // 05.08 (одит г04, №151): подзаглавието казваше „твоите 7 вечери“ и при
    // разрез 2 срещу 5. Показваме истинския разрез, не сбора.
    const c = card('Присъдата ⚖️' + мет(e, много) + sub('твоите ' + v.nA + ' срещу ' + v.nB + ' вечери'));
    бележиКарта(c, e, много);
    c.appendChild(el('div', 'lb-verdict lb-' + v.tone, '<strong>' + v.t + '</strong><p>' + v.d + '</p>'));
    const acts = el('div', 'jr-chips');
    const keep = el('button', 'jr-chip', '📓 В тетрадката'); keep.type = 'button';
    keep.addEventListener('click', () => {
      const st = getSt();
      const me = (st.list || []).find(x => x && x.id === e.id);
      if (!me) { rerender(); return; }              // опитът вече го няма (друг таб)
      me.closed = true; me.verdict = v;
      // 05.08 (одит г04, №367): записът не пазеше кой шаблон е бил, затова
      // стаята предлагаше пак опити, които мама вече е закрила. id-то на
      // шаблона е първата част на e.id („swaddle-1720…“).
      st.done = st.done || [];
      // 🔴 г09/318: `d` е ДАТАТА на закриване, не броят вечери — а споделянето и
      //    печатът пишеха зашитото „7 вечери“ и когато са били 6 или 13. Пазим го.
      st.done.push({ q: me.q, e: me.e, t: v.t, tone: v.tone, d: today(), n: Object.keys(me.log || {}).length, tpl: String(me.id || '').split('-')[0] });
      save(K, st);
      fx().confetti && fx().confetti();
      fx().cheer && fx().cheer('🔬 Откритието е в тетрадката!');   // 3.4.8: и звук/вибрация
      rerender();
    });
    // 05.08 (одит г04, №141): „Още е рано за отговор.“ се записваше като
    // ОТКРИТИЕ — с конфети, в Тетрадката, в Досието под „Открития“ и в
    // споделянето. Изречение, което казва „нямам отговор“, не е находка.
    if (v.tone !== 'thin') acts.appendChild(keep);
    // 05.08 (одит г04, №145): бутонът нямаше таван — при всяка присъда, която
    // не ѝ е харесала, можеше да я отложи с още 3 вечери, безкрайно. Едно
    // удължаване стига. (Отметките не спират: опитът остава активен и
    // присъдата се преизчислява — удължаването само СКРИВА отговора.)
    if (!e.extended) {
      const more = el('button', 'jr-chip jr-chip-soft', '➕ Още няколко вечери'); more.type = 'button';
      more.addEventListener('click', () => {
        const st = getSt();
        const me = (st.list || []).find(x => x && x.id === e.id);
        if (!me) { rerender(); return; }
        me.extended = true; me.d += 3;
        save(K, st); rerender();
      });
      acts.appendChild(more);
    }
    // 05.08 (одит г04, №206): при „май не помага“/„няма разлика“ мама получаваше
    // топло изречение и нищо друго — а статията, писана точно за този момент,
    // стои в библиотеката и никой не ѝ я подава.
    if (v.tone === 'no' || v.tone === 'same') acts.appendChild(чипСтатия('lib-298707b3', 'Опитът не проработи. И сега?'));
    if (acts.children.length) c.appendChild(acts);
    return c;
  }

  // ── ПРАВИЛО 5.10: КРЪСТОСАНИ ВРЪЗКИ — Захранване/Развитие подсказват на
  // Лабораторията, но само сочат към СЪЩЕСТВУВАЩ навик-опит. Никога ново
  // медицинско твърдение — правило 1 важи и тук.
  function предложениеОтДругаСтая() {
    // Захранване: чести откази → провери дали чинийчето променя нещо
    const реакции = Object.values(load('bl_tried', {}));
    const откази = реакции.filter(r => /🤢/.test(r || '')).length;
    if (откази >= 2) return { id: 'plate', причина: 'От Захранване: забелязах ' + откази + ' отказа при нови храни.' };
    // Развитие: скорошен моторен скок (14 дни) → сънят често се разбърква тогава
    const скоро = Object.entries(load('bl_ms_d', {})).some(([id, ts]) => id.endsWith('_motor') && (Date.now() - ts) < 14 * 86400000);
    if (скоро) return { id: 'dark', причина: 'От Развитие: скорошен скок в уменията — такива често разбъркват съня.' };
    return null;
  }

  function startCard() {
    const текущи = activeExps();
    if (текущи.length >= 2) return null;            // два наведнъж са таванът
    const втори = текущи.length === 1;
    const c = card(втори ? 'Втори опит 🧪' + sub('може · но да мери ДРУГО нещо')
                         : 'Тръгни на опит 🧪' + sub('един въпрос · 7 вечери · по едно докосване'));
    if (втори) {
      c.appendChild(el('p', 'lb-warn2', '⚠️ Вече ти тече „' + esc(текущи[0].q) + '“. Втори опит може — но само ако гледа <strong>друго</strong> (напр. единият сън, другият храна). Два опита върху едно и също се развалят взаимно: накрая няма да знаеш кой е подействал.'));
    } else {
      c.appendChild(el('p', 'lb-intro', 'Всички ти казват „всяко бебе е различно“ и си тръгват. Хайде ние да проверим при <strong>' + esc(babyName()) + '</strong>.'));
    }
    // 05.08 (одит г04, №319): изискването „поне по 3 от всяко“ се появяваше
    // едва ВЪТРЕ в присъдата — тоест след като седмицата вече е изхарчена.
    // Най-естественото поведение (правя го всяка вечер) даваше 7 срещу 0 и
    // гарантирано „Още е рано“. Казваме го на СТАРТА.
    c.appendChild(el('p', 'lb-kind', '💡 Как работи: някои вечери прави нещото, други — не. Приблизително наполовина, поне по 3 от всяко. Правиш ли го всяка вечер, накрая няма с какво да го сравня.'));
    // 5.10: подсказката от другите стаи — само ако мястото ѝ е свободно
    const предл = !втори ? предложениеОтДругаСтая() : null;
    const предлТипл = предл && READY.find(t => t.id === предл.id);
    if (предлТипл) {
      const бан = el('div', 'lb-cross');
      бан.innerHTML = `<p class="lb-crosswhy">🔗 ${esc(предл.причина)}</p>
        <button class="lb-card lb-crossbtn" type="button"><span class="lb-e">${предлТипл.e}</span><div><strong>${esc(предлТипл.q)}</strong><small>${esc(предлТипл.why)}</small></div></button>`;
      бан.querySelector('.lb-crossbtn').addEventListener('click', () => { startExp(предлТипл); fx().buzz(10); rerender(); });
      c.appendChild(бан);
    }
    // 05.08 (одит г04, №367): стаята предлагаше пак опити, които мама вече е
    // закрила — идва тук точно защото ѝ е писнало да ѝ предлагат пробваното.
    // Не ги крием (бебетата се променят и след месец си струва пак) — маркираме
    // ги. Записите отпреди полето `tpl` просто нямат маркер, което е безвредно.
    const ИЗХОД = { yes: 'май помага', no: 'май не помага', same: 'няма разлика' };
    const минали = {};
    (getSt().done || []).forEach(d => { if (d && d.tpl) минали[d.tpl] = d; });
    const box = el('div', 'lb-ready');
    READY.filter(t => t.id !== 'own' && !(предлТипл && t.id === предлТипл.id)).forEach(t => {
      const b = el('button', 'lb-card'); b.type = 'button';
      const пр = минали[t.id];
      const дата = пр && typeof пр.d === 'string' && пр.d.length === 10 ? пр.d.slice(8, 10) + '.' + пр.d.slice(5, 7) : '';
      const под = пр
        // `пр.d` идва от localStorage, тоест може да дойде и от внесено копие —
        // правило 8 не прави изключение за 4 знака. esc() и толкоз.
        ? '✔ проверено' + (дата ? ' на ' + esc(дата) : '') + ' → ' + (ИЗХОД[пр.tone] || 'закрит') + ' · пробвай пак'
        : esc(t.why);
      b.innerHTML = '<span class="lb-e">' + t.e + '</span><div><strong>' + esc(t.q) + '</strong><small>' + под + '</small></div>';
      b.addEventListener('click', () => { startExp(t); fx().buzz(10); rerender(); });
      box.appendChild(b);
    });
    c.appendChild(box);

    // свой опит — тук е и стоп-правилото за медицинското
    const row = el('div', 'jr-addrow');
    const inp = el('input', 'jr-word'); inp.placeholder = 'или напиши свой въпрос…'; inp.maxLength = 80;
    const add = el('button', 'jr-chip', '🔬'); add.type = 'button';
    const warn = el('p', 'lb-warn'); warn.hidden = true;
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); add.click(); } });  // 3.4.9: Enter = бутона (със същите проверки)
    add.addEventListener('click', () => {
      const v = inp.value.trim(); if (!v) return;
      if (isMedical(v)) {
        warn.hidden = false;
        warn.innerHTML = '🚫 <strong>Не, това няма да го проверяваме.</strong><br>Здравето не е игра на 7 вечери — там се пита лекар, не се пробва. Вита от „Здраве и SOS“ е насреща 💚';
        fx().buzz(20);
        return;
      }
      warn.hidden = true;
      startExp(READY.find(x => x.id === 'own'), v);
      inp.value = ''; fx().buzz(10); rerender();
    });
    row.appendChild(inp); row.appendChild(add);
    c.appendChild(row); c.appendChild(warn);
    return c;
  }

  // ═══════════ 👵 БАБИНАТА ПРОВЕРКА ═══════════
  function grannyCard() {
    const c = card('Митът на седмицата 👵' + sub('баба може и да е права · да проверим при нас?'));
    const myths = (window.BL_WISDOM && BL_WISDOM.MYTHS) || [];
    // ПРАВИЛО 1: митове за здраве НЕ стават опити — те отиват при Вита.
    // Проверява се и въпросът, и обяснението: „ракията сваля температура“ не
    // бива да мине само защото в заглавието няма медицинска дума.
    // ПРАВИЛО 2 (одит-флот П23): НИКОГА не предлагай 7-вечерен опит с даване на
    // ВЕЩЕСТВО на бебето или влияещо на кърмата. isMedical не хваща „безопасно
    // звучащите" опасни: мед (ботулизъм под 1г!), билков чай, бира за мляко,
    // соковете, сол/захар. `\b` не работи за кирилица → ползваме подниза; над-
    // изключването е БЕЗ вреда (просто по-малко митове; остават ~86).
    const RISK = /мед|захар|сол|осол|билк|отвар|лайк|копър|копарч|бира|вино|алкохол|спирт|кафе|сок|орех|чесън|жълтък|гроздов|масло|мазнин|ментов|греян|запарк|биберонче/i;
    const рисково = m => RISK.test(m[0]) || RISK.test(m[1] || '');
    // 🔴🔴🔴 04.08 (обиколка, армия „Лабораторията“): ЧЕРНИЯТ СПИСЪК ПРОПУСКАШЕ.
    //    Картата не просто ПОКАЗВА мит — тя кани мама да го ПРОБВА 7 вечери
    //    („както казва баба“ срещу „по нашия начин“). А през филтъра минаваха
    //    86 от 130 мита, включително:
    //      „Възглавница трябва — иначе главата се деформира.“
    //      „Сложи грис в шишето — ще спи цяла нощ.“
    //      „Оризова каша в шишето и ще спи цяла нощ.“
    //      „Повиването стегнато изправя крачетата.“
    //      „Кравето мляко от 6 месеца замества кърмата.“
    //      „Проходилката учи детето да ходи по-рано.“
    //      „Ако спи денем, няма да спи нощем — дръж го будно!“
    //    Тоест приложението подканваше майка да сложи възглавница в креватчето
    //    и грис в шишето — през замразените стандарти за безопасен сън и
    //    задавяне, и срещу собствения си текст (obichai.js пише, че стегнатото
    //    повиване е рисков фактор за дисплазия).
    //    Черен списък върху 130 свободно писани реда НЕ Е ЗАЩИТА. Обръщаме го:
    //    минава само това, което е чист НАВИК (сън, ритуал, час, повторение) —
    //    нищо, което се слага В/ВЪРХУ бебето, слага се в устата му или пипа
    //    тялото му.
    const ТЯЛО_ИЛИ_УСТА = /телевиз|телефон|екран|таблет|видео|възглавниц|одеял|завив|повив|пелен|грис|каша|мляко|шише|биберон|залъгалк|храна|яде|пие|дрех|облеч|обувк|проходилк|люлк|нож|метла|олово|мигл|коса|нокт|масаж|разтрив|крачет|глава|корем|гръб|стомах|зъб|уши|нос|очи|кожа|къпе|баня|вода|температур|студ|топло|навън|прозорец|течение|будно|буден|не спи денем/i;
    const ЧИСТ_НАВИК = /ритуал|приспив|приказк|песен|песничк|тъмнин|светлин|тишин|шум|час на лягане|време за лягане|последователност|рутин|прегръдк|носене на ръце|разглез|гушк/i;
    const заОпит = m => {
      const цял = String(m[0] || '') + ' ' + String(m[1] || '');
      if (m[2] === 'Бременност') return false;            // безсмислен опит с бебе
      if (/риск|опасн|вреди|не се дава|не бива|ботулиз|дисплаз|задавя|задушав|смърт/i.test(цял)) return false;
      if (ТЯЛО_ИЛИ_УСТА.test(цял)) return false;          // нищо върху/в бебето
      return ЧИСТ_НАВИК.test(цял);                        // и ИЗРИЧНО да е навик
    };
    const safe = myths.filter(m => !isMedical(m[0]) && !isMedical(m[1] || '') && !рисково(m) && заОпит(m));
    if (!safe.length) {
      c.appendChild(el('p', 'jr-privacy', 'Митовете спят. Върни се утре. 👵'));
      return c;
    }
    const n = new Date();
    const wk = Math.floor((n - new Date(n.getFullYear(), 0, 0)) / 604800000);
    const m = safe[wk % safe.length];
    c.appendChild(el('div', 'lb-myth', '<span>👵</span><p>„' + esc(m[0]) + '“</p>'));
    const b = el('button', 'jr-chip', '🔬 Да проверим при нас'); b.type = 'button';
    if (activeExps().length >= 2) { b.disabled = true; b.textContent = '🔬 Първо довърши единия опит'; }
    b.addEventListener('click', () => {
      if (activeExps().length >= 2) return;
      startExp({ id: 'myth', e: '👵', a: 'както казва баба', b: 'по нашия начин', d: 7 }, m[0]);
      fx().buzz(10); rerender();
    });
    c.appendChild(b);
    c.appendChild(el('p', 'lb-kind', '💚 Не казваме, че баба греши. Казваме „да видим при нашето дете“.'));
    return c;
  }

  // ═══════════ 📓 ТЕТРАДКАТА ═══════════
  function notebookCard() {
    const st = getSt();
    const done = st.done || [];
    const c = card('Какво знам за ' + esc(babyName()) + ' 📓' + sub('единственото място, където пише не какво е нормално, а какво е вярно за НЕГО'));
    if (!done.length) {
      c.appendChild(el('p', 'jr-privacy', 'Още е празна. Първият закрит опит влиза тук. 📓'));
      // 05.08 (одит г04, №149): утешителният ред стоеше СЛЕД този ранен изход,
      // тоест го получаваше само майка, която вече има успех. Точно жената с
      // празна тетрадка — защото нищо не се е получило — не виждаше нито дума.
      c.appendChild(el('p', 'lb-kind', '💚 Празна тетрадка не значи, че не си опитала достатъчно. Понякога нищо не мърда — не защото си пропуснала тайната, а защото на тази възраст просто няма лост.'));
      // 05.08 (одит г04, №206): и статията за този момент, вместо мама да я търси
      const л = el('div', 'jr-chips');
      л.appendChild(чипСтатия('lib-267c772b', 'Кое да пробваш първо, като всичко гори'));
      c.appendChild(л);
      return c;
    }
    const list = el('div', 'lb-notes');
    done.slice().reverse().forEach((d, ri) => {
      const i = done.length - 1 - ri;
      const row = el('div', 'lb-note lb-' + (d.tone || 'yes'));
      row.innerHTML = '<span>' + (d.e || '🔬') + '</span><div><strong>' + esc(d.t) + '</strong><small>' + esc(d.q) + ' · ' + d.d + '</small></div>';
      const del = el('button', 'jr-x', '✕'); del.type = 'button';
      del.addEventListener('click', () => { done.splice(i, 1); save(K, st); rerender(); });
      row.appendChild(del); list.appendChild(row);
    });
    c.appendChild(list);
    c.appendChild(el('p', 'lb-kind', '💚 Бебетата се променят. Нещо, което е работело, може да спре. Това не е провал.'));
    return c;
  }

  function dossierCard() {
    const st = getSt();
    const done = st.done || [];
    const c = card('Досието 📄' + sub('за детегледачката · за бабата · за яслата'));
    c.appendChild(el('p', 'lb-intro', 'Един лист: „Ето какво знам за детето си.“ Не какво пише в книгите — какво сме проверили.'));
    const b = el('button', 'jr-chip', '🖨️ Отпечатай досието'); b.type = 'button';
    if (!done.length) { b.disabled = true; b.textContent = '🖨️ Първо направи един опит'; }
    b.addEventListener('click', () => {
      const baby = load('bl_baby', {});
      const tried = load('bl_tried', {});
      const fav = Object.keys(tried).filter(k => (tried[k] || '').includes('😋'));
      const html = '<div class="pr-cv"><h1>' + esc(baby.name || 'Бебето') + '</h1>' +
        '<p class="pr-role">Какво знаем за него — проверено у дома</p>' +
        '<h2>Открития</h2><ul>' + done.map(d => '<li><strong>' + esc(d.t) + '</strong><br><small>' + esc(d.q) + '</small></li>').join('') + '</ul>' +
        (fav.length ? '<h2>Обича да яде</h2><p>' + fav.map(esc).join(' · ') + '</p>' : '') +
        '<p class="pr-foot">Това не е наука. Това са нашите вечери. 🔬 Бейби Ленд</p></div>';
      if (window.BL_EXPR && BL_EXPR.printOverlay) BL_EXPR.printOverlay('Досието на ' + (baby.name || 'бебето'), html);
    });
    c.appendChild(b);
    return c;
  }

  window.BL_LAB = { activeExp, activeExps, startExp, verdict, isMedical, READY };

  // ═══════════ РЕНДЕРЪТ ═══════════
  function rerender() {
    // 3.4.1: пре-строяването губеше скрола — мама докосва и я хвърля горе
    // 🔴 05.08 (одит г04, №201): rerender() викаше MamaHelper.open(), а open()
    //    изпразва $('roChat'), $('roChips') и $('roInput'), мести фокуса на ✕ и
    //    пуска поздрава наново. Мама пита Ема нещо, връща се на таба „Стаята“,
    //    натиска „😴 По-добре“ — и разговорът, чиповете и недописаният ѝ въпрос
    //    ги няма. Викаше се от 9 места. Сега пре-строяваме САМО тялото на
    //    стаята; чатът е чужд дом и не се пипа.
    //    Минава през ROOM_FEATURES (не през base) — polish.js/obichai.js/rooms13.js
    //    обвиват стаята и подредбата, обичаите и картите им живеят в обвивката.
    const тяло = document.getElementById('roRoom');
    const заглавие = document.getElementById('roTitle');
    const строй = window.ROOM_FEATURES && window.ROOM_FEATURES['Лабораторията'];
    if (!тяло || !строй || !заглавие || заглавие.textContent !== 'Лабораторията') {
      if (window.MamaHelper && MamaHelper.open) MamaHelper.open('Лабораторията');
      return;
    }
    const скрол = тяло.scrollTop;
    // 🔴 05.08 (скептикът, №201 половинчата): №201 опази #roInput — полето на
    //    ЧАТ-таба. Но полето на помощничката (.ask-inp, askfield.js) живее ВЪТРЕ
    //    в #roRoom, като ПЪРВА карта на стаята — точно там, където мама пише,
    //    без да сменя таба. `тяло.innerHTML = ''` продължаваше да го изяжда:
    //    напишеш „защо се буди в 3“, слизаш и отмяташ вечерта — думите ги няма.
    //    Пазим текста, фокуса и позицията на курсора през пре-строяването.
    const полеСтаро = тяло.querySelector('.ask-inp');
    const текстСтар = полеСтаро ? полеСтаро.value : '';
    const беФокус = !!полеСтаро && document.activeElement === полеСтаро;
    const курсор = беФокус ? полеСтаро.selectionStart : null;
    тяло.innerHTML = '';
    строй(тяло);
    if (текстСтар) {
      const полеНово = тяло.querySelector('.ask-inp');
      if (полеНово) {
        полеНово.value = текстСтар;
        if (беФокус) {
          try { полеНово.focus({ preventScroll: true }); полеНово.setSelectionRange(курсор, курсор); } catch (e) {}
        }
      }
    }
    if (window.BL_FX && BL_FX.countUp) BL_FX.countUp(тяло);
    requestAnimationFrame(() => { тяло.scrollTop = скрол; });
  }

  function base(root) {
    const exps = activeExps();
    const много = exps.length > 1;                  // №336
    if (!exps.length) { const a = todayTapCard(); if (a) root.appendChild(a); }
    exps.forEach(ex => {
      const a = todayTapCard(ex, много); if (a) root.appendChild(a);
      const r = runningCard(ex, много); if (r) root.appendChild(r);
      const v = verdictCard(ex, много); if (v) root.appendChild(v);
    });
    const s = startCard(); if (s) root.appendChild(s);
    root.appendChild(grannyCard());
    root.appendChild(notebookCard());
    root.appendChild(dossierCard());
  }

  window.ROOM_FEATURES = window.ROOM_FEATURES || {};
  window.ROOM_FEATURES['Лабораторията'] = base;
})();
