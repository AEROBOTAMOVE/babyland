// ═══════════════════════════════════════════════════════════
// ⏳ „ПРЕДИ КОЛКО ВРЕМЕ ДАДОХ?“ — на „Днес“
//
// Нощта в 03:10. Дете с 39. Мама дава Нурофен полузаспала. В 06:40 детето
// пак гори и тя НЕ ПОМНИ дали е било в 3 или в 1. Това е единственият
// въпрос, на който приложението може да отговори със сигурност — защото е
// въпрос за ЧАСОВНИКА, не за медицината.
//
// ⚖️ ГРАНИЦАТА (нарочна, не пропусната):
//   • Часът — ДА. Приложението го помни точно.
//   • Дозата (мл, мг, по колко на килограм) — НЕ. Това е предписание.
//     Никъде в този файл няма число за количество.
//   • Интервалът и максимумът за 24 ч НЕ се обявяват като наша истина —
//     стоят като поле, което мама сменя за 2 докосвания, с надпис
//     „провери кутията“. Числото по подразбиране е ОТПРАВНА ТОЧКА, не съвет.
//
// 🕳️ ЗАМРАЗЕНИТЕ ТАЙМЕРИ: скрит таб спира setInterval (dev/browser-skrit-tab).
//    Затова изтеклото време се СМЯТА при рисуване и при връщане на екрана,
//    а интервалът е само козметика. Ако таймерът умре, числото пак е вярно.
//
// Зарежда се СЛЕД daily.js (същата верига BL_TODAY_BIND) и след fx.js.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { if (window.BL_ZAPIS_PADNA) BL_ZAPIS_PADNA(); return false; } return true; };
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const fx = () => window.BL_FX || { confetti() {}, cheer() {}, buzz() {}, pop() {} };

  const КЛЮЧ = 'bl_chas';          // { id: { t: epoch, hist: [epoch…] } }
  const КЛЮЧ_Н = 'bl_chas_nastr';  // { id: { h: часа, max: брой } }
  const КЛЮЧ_В = 'bl_chas_vidimi'; // [id…] — кои редчета мама е пуснала

  // ⚠️ Числата тук са ОТПРАВНА ТОЧКА от кутията, не наше предписание.
  //    Мама ги сменя с едно докосване; педиатърът има последната дума.
  const РЕДОВЕ = [
    { id: 'nurofen', ime: 'Ибупрофен', emo: '💊', h: 6, max: 3, lek: true, pod: '' },   // 18.11: без марки (правило на собственика); id остава — пази записаното
    { id: 'paracet', ime: 'Парацетамол', emo: '💊', h: 6, max: 4, lek: true, pod: '' },
    { id: 'temp', ime: 'Мерих температура', emo: '🌡️', h: 0, max: 0 },
    { id: 'hrana', ime: 'Хранене', emo: '🍼', h: 0, max: 0 },
    { id: 'aki', ime: 'Аки', emo: '💩', h: 0, max: 0 },
    { id: 'drugo', ime: 'Друго лекарство', emo: '🧴', h: 0, max: 0, lek: true },
  ];
  const наИме = {}; РЕДОВЕ.forEach(р => { наИме[р.id] = р; });

  // ── времето с думи, както го казва българка ────────────────────────────
  function предиДумите(ms) {
    const м = Math.floor(ms / 60000);
    if (м < 0) return 'след малко';           // часовникът е местен, може да подскочи
    if (м < 2) return 'току-що';
    if (м < 60) return 'преди ' + м + ' мин';
    const ч = Math.floor(м / 60), ост = м % 60;
    if (ч >= 48) return 'преди ' + Math.floor(ч / 24) + ' дни';
    if (ч >= 24) return 'преди ' + Math.floor(ч / 24) + ' ден' + (Math.floor(ч / 24) > 1 ? 'а' : '');
    if (!ост) return 'преди ' + ч + ' ч';
    return 'преди ' + ч + ' ч ' + ост + ' мин';
  }
  const часДумите = t => { const d = new Date(t); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };

  // 🔤 09.09 (видяно ЖИВО в чата): пишеше „това е 2-та доза". На български
  //   женският род е 1-ва · 2-ра · 3-та · 4-та · 5-а. Едно окончание за
  //   всички числа звучи като машина — точно в изречението, което майката
  //   ще препрочете два пъти в три през нощта.
  const ОКОНЧАНИЕ = { 1: '-ва', 2: '-ра', 3: '-та', 4: '-та' };
  const редНаДоза = n => n + (ОКОНЧАНИЕ[n] || '-а');

  // 22.11 (сверено с NHS на 22.11.2026): парацетамол за деца ≥ 4 ч между дозите, до 4 за 24 ч; при 2–3 мес. — до 2.
  //    Ибупрофен: на 6–8 ч, до 3 за 24 ч; под 3 мес. не. Затова под 3 месеца (известна рождена дата) НЯМА начални числа.
  //    ПЪТ НАЗАД: махни подТриМесеца() и „мл“ по-долу.
  function подТриМесеца() {
    try { const b = load('bl_baby', {}); if (!b || !b.birth) return false; const д = new Date(b.birth + 'T00:00:00'); const м = (Date.now() - д.getTime()) / 86400e3 / 30.44; return isFinite(м) && м >= 0 && м < 3; } catch (e) { return false; }
  }
  function настройка(р) {
    const н = load(КЛЮЧ_Н, {})[р.id] || {};
    const мл = р.lek && подТриМесеца();   // без начални числа при най-малките
    // 22.11 · мояH/мояM: записано ли е от НЕЯ — началните числа не са „твоята бележка“ и картата не бива да го казва
    return { h: (typeof н.h === 'number' ? н.h : (мл ? 0 : р.h)), max: (typeof н.max === 'number' ? н.max : (мл ? 0 : р.max)), мояH: typeof н.h === 'number', мояM: typeof н.max === 'number' };
  }
  function пишиНастройка(id, поле, стойност) {
    const вс = load(КЛЮЧ_Н, {});
    const мое = (вс[id] && typeof вс[id] === 'object') ? вс[id] : {};
    мое[поле] = стойност; вс[id] = мое;
    return save(КЛЮЧ_Н, вс);
  }

  // 🍼 15.09 (E2E „родила“, RODILA-3): „Преди колко време? · Хранене — Още нищо“, а в
  //   същия екран картата „Днес“ казваше „Хранене преди 4ч 49м“. Храненето се пише и от
  //   стаята (бързият запис → bl_feed + bl_feedlog, таймерът за кърмене → bl_nursing), а
  //   часовникът четеше само своя bl_chas. За реда „hrana“ се взима най-новото от всички.
  function вънХранене() {
    const ts = [];
    const f = load('bl_feed', null); if (f && f.t) ts.push(+f.t);
    const н = load('bl_nursing', []); if (Array.isArray(н)) н.forEach(x => { if (x && x.ts) ts.push(+x.ts); });
    const л = load('bl_feedlog', []); if (Array.isArray(л)) л.forEach(x => { if (x) ts.push(+x); });
    const ok = ts.filter(x => x > 0 && x <= Date.now() + 60000);
    return ok.length ? Math.max.apply(null, ok) : 0;
  }
  // 🍼 25.11 (одит G-07 · една истина за храненето): „Хранене“ оттук пишеше САМО в bl_chas — помощничката,
  //    „Нашият ден“, „Седмицата в картинка“ и „Спрямо вчера“ не го виждаха. Сега записът отива и в общия
  //    дневник: bl_feedlog (времето) и bl_feed {t, s:'chas'} (последното — само ако там няма по-ново).
  //    Страната от предишното бързо „Ляво/Дясно“ не се губи: пази се в bl_feed.lr / lrT (четат го rooms2).
  //    ↺ / „махни последния“ / „Кога беше наистина?“ пипат и тях — само СВОЕТО време, а bl_feed само ако
  //    е още нашият запис. bl_chas остава както беше. ПЪТ НАЗАД: window.BL_G07_SLIV = false.
  const ЛОГ_ТАВАН = 200;          // същият таван като бързия запис в rooms2.js
  const храненеПреди = {};        // ts → bl_feed отпреди нашия запис (само в паметта, за ↺)
  const сливане = () => window.BL_G07_SLIV !== false;
  function храненеВДневника(t) {
    if (!сливане()) return true;
    const пред = load('bl_feed', null);
    храненеПреди[t] = пред;
    const л = load('bl_feedlog', []); л.push(t);
    let ok = save('bl_feedlog', л.slice(-ЛОГ_ТАВАН));
    if (!(пред && typeof пред.t === 'number' && пред.t > t)) {
      const нов = { t: t, s: 'chas' };
      if (пред && (пред.s === 'left' || пред.s === 'right') && typeof пред.t === 'number') { нов.lr = пред.s; нов.lrT = пред.t; }
      else if (пред && (пред.lr === 'left' || пред.lr === 'right') && typeof пред.lrT === 'number') { нов.lr = пред.lr; нов.lrT = пред.lrT; }
      ok = save('bl_feed', нов) && ok;
    }
    return ok;
  }
  function храненеОтДневника(ts) {
    if (!сливане()) return;
    const л = load('bl_feedlog', []); const i = л.lastIndexOf(ts);
    if (i >= 0) { л.splice(i, 1); save('bl_feedlog', л); }
    const f = load('bl_feed', null);
    if (f && f.t === ts && f.s === 'chas') {
      const пред = храненеПреди[ts];
      if (пред !== undefined) save('bl_feed', пред);
      else {
        // след презареждане снимката я няма: най-новото останало, със страна при близнаци до 60 s
        const ост = [];
        if ((f.lr === 'left' || f.lr === 'right') && typeof f.lrT === 'number') ост.push({ t: f.lrT, s: f.lr });
        load('bl_nursing', []).forEach(x => { if (x && typeof x.ts === 'number' && x.ts > 0) ост.push({ t: x.ts, s: x.s === 'Л' ? 'left' : x.s === 'Д' ? 'right' : 'bottle' }); });
        л.forEach(x => { if (typeof x === 'number' && x > 0) ост.push({ t: x, s: 'chas' }); });
        const ок = ост.filter(x => x.t <= Date.now() + 60000);
        if (ок.length) {
          const макс = Math.max.apply(null, ок.map(x => x.t));
          const близо = ок.filter(x => x.t >= макс - 60000);
          save('bl_feed', близо.find(x => x.s !== 'chas') || близо.find(x => x.t === макс));
        } else save('bl_feed', null);
      }
    }
    delete храненеПреди[ts];
  }
  function храненеПоправи(старо, ново) {
    if (!сливане() || typeof старо !== 'number') return;
    const л = load('bl_feedlog', []); const i = л.lastIndexOf(старо);
    if (i < 0) return;   // стар запис отпреди сливането — живее само в bl_chas, както преди
    л[i] = ново; save('bl_feedlog', л);
    const пред = храненеПреди[старо];
    const f = load('bl_feed', null);
    if (f && f.t === старо && f.s === 'chas') {
      if (пред && typeof пред.t === 'number' && пред.t > ново) save('bl_feed', пред);
      else save('bl_feed', Object.assign({}, f, { t: ново }));
    }
    if (пред !== undefined) { храненеПреди[ново] = пред; delete храненеПреди[старо]; }
  }
  // 💊 25.11 (одит G-02): „Дневник на даденото“ в Здраве (rooms3, bl_meds = [{ n, ts }]) и този часовник
  //    бяха два отделни свята: Парацетамол, записан там, тук беше „Не знам — още не си отбелязвала“, а броят
  //    за 24 ч не го виждаше. Сега часовникът ЧЕТЕ и дневника (по името), без да пише в него — така никоя
  //    доза не се брои два пъти. Обратната посока: BL_LEK_DOZI() долу, четат я дневникът, епизодът и бележката.
  //    ПЪТ НАЗАД: махни отДневника() и реда в запис() — часовникът пак гледа само bl_chas.
  const ИМЕ_ЛЕК = {
    nurofen: /(нурофен|ибупрофен|ибу(?![а-я])|advil|бруфен)/i,
    paracet: /(парацетамол|панадол|ефералган|цефекон|paracetamol)/i,
  };
  function отДневника(id) {
    const re = ИМЕ_ЛЕК[id]; if (!re) return [];
    const м = load('bl_meds', []);
    return м.filter(x => x && isFinite(x.ts) && re.test(String(x.n || ''))).map(x => +x.ts).filter(t => t > 0 && t <= Date.now() + 60000);
  }
  function запис(вс, id) {
    const з = Object.assign({}, (вс[id] && typeof вс[id] === 'object') ? вс[id] : {});
    if (id === 'hrana') { const в = вънХранене(); if (в > (з.t || 0)) з.t = в; }
    const д = отДневника(id);
    if (д.length) {
      const свои = Array.isArray(з.hist) ? з.hist : [];
      з.hist = свои.concat(д.filter(t => свои.indexOf(t) < 0)).sort((a, b) => a - b);
      const м = Math.max.apply(null, д); if (м > (з.t || 0)) з.t = м;
    }
    return з;
  }
  // Дозите, записани ТУК (без тези от дневника — те си стоят там). За епизода, бележката и дневника.
  function своиДози(откога) {
    const вс = load(КЛЮЧ, {}); const out = [];
    РЕДОВЕ.filter(р => р.lek).forEach(р => {
      const з = вс[р.id]; const h = з && Array.isArray(з.hist) ? з.hist : (з && з.t ? [з.t] : []);
      h.forEach(t => { if (typeof t === 'number' && t > (откога || 0)) out.push({ n: р.ime, ts: t, id: р.id, отЧасовника: true }); });
    });
    return out.sort((a, b) => a.ts - b.ts);
  }
  // ↺ 25.11 (одит G-01): махане на ЕДИН запис (последния или посочения). Температурата си взима и градусите.
  function махниДоза(id, ts) {
    const вс = load(КЛЮЧ, {}); const з = вс[id];
    if (!з || typeof з !== 'object') return false;
    const h = Array.isArray(з.hist) ? з.hist.slice() : (з.t ? [з.t] : []);
    const i = h.lastIndexOf(ts); if (i < 0) return false;
    h.splice(i, 1); з.hist = h;
    if (h.length) з.t = Math.max.apply(null, h); else delete з.t;
    if (!h.length && !з.t) delete вс[id]; else вс[id] = з;
    if (!save(КЛЮЧ, вс)) return false;
    if (id === 'temp') { const т = load('bl_temps', []); const ост = т.filter(x => !(x && x.ts === ts)); if (ост.length !== т.length) save('bl_temps', ост); }
    if (id === 'hrana') храненеОтДневника(ts);   // 25.11 (G-07): и от общия дневник — само това време
    document.querySelectorAll('#todaySection .ch-row').forEach(r => { if (r._опресни) r._опресни(); });
    ['BL_TEMPS_REDRAW', 'BL_EPISODE_REDRAW'].forEach(f => { try { if (typeof window[f] === 'function') window[f](); } catch (e) {} });
    return true;
  }

  // ── записът ────────────────────────────────────────────────────────────
  function отбележи(id, кога) {
    const вс = load(КЛЮЧ, {});
    const з = (вс[id] && typeof вс[id] === 'object') ? вс[id] : {};
    з.t = кога;
    // 🧹 История САМО за брояча на 24-те часа (за разлика от дневника, който
    //    е спомен и няма таван). 60 записа стигат и за най-тежката нощ.
    const h = Array.isArray(з.hist) ? з.hist : [];
    h.push(кога); з.hist = h.filter(x => typeof x === 'number').sort((a, b) => a - b).slice(-60);
    вс[id] = з;
    return save(КЛЮЧ, вс);
  }
  const дозиЗа24 = (з, сега) => (Array.isArray(з && з.hist) ? з.hist : []).filter(t => сега - t < 24 * 3600e3).length;

  // ── едно редче ─────────────────────────────────────────────────────────
  function рисувайРед(р, корен) {
    const ред = el('div', 'ch-row'); ред.dataset.id = р.id;

    const бут = el('button', 'ch-hit'); бут.type = 'button';
    бут.innerHTML = '<span class="ch-emo">' + р.emo + '</span><span class="ch-ime">' + esc(р.ime) + '</span>';
    бут.setAttribute('aria-label', 'Отбележи сега: ' + р.ime);

    const дясно = el('div', 'ch-right');
    const кога = el('button', 'ch-kolko'); кога.type = 'button';
    кога.setAttribute('aria-label', 'Промени часа за ' + р.ime);
    дясно.appendChild(кога);

    const под = el('p', 'ch-pod');
    const поправка = el('div', 'ch-fix'); поправка.hidden = true;

    ред.appendChild(бут); ред.appendChild(дясно); ред.appendChild(под); ред.appendChild(поправка);
    // 25.11 (одит G-01): „още една?“ при второ докосване до 60 s · „↺ Върни“ 10 s след запис · градусите (G-04)
    const пак = el('div', 'ch-fix ch-pak'); пак.hidden = true; пак.setAttribute('role', 'alert');
    const върни = el('div', 'ch-fix ch-varni'); върни.hidden = true; върни.setAttribute('aria-live', 'polite');
    const град = р.id === 'temp' ? el('div', 'ch-fix ch-grad') : null; if (град) град.hidden = true;
    ред.appendChild(пак); ред.appendChild(върни); if (град) ред.appendChild(град);

    // ── поправката: „не сега — беше в 03:00“ ──
    const вход = el('input', 'ch-time'); вход.type = 'time'; вход.setAttribute('aria-label', 'Час, в който беше');
    const ок = el('button', 'ch-ok', 'Запиши'); ок.type = 'button';
    const отказ = el('button', 'ch-cancel', 'Откажи'); отказ.type = 'button';
    поправка.appendChild(el('span', 'ch-fix-t', 'Кога беше наистина?'));
    const редП = el('div', 'ch-fix-row'); редП.appendChild(вход); редП.appendChild(ок); редП.appendChild(отказ);
    поправка.appendChild(редП);
    // 25.11 (одит G-01в): „Кога беше наистина?“ само местеше часа — сгрешеният запис нямаше как да се махне.
    const махни = el('button', 'ch-cancel', 'Не беше · махни последния'); махни.type = 'button';
    const редМ = el('div', 'ch-fix-row'); редМ.appendChild(махни); поправка.appendChild(редМ);
    махни.addEventListener('click', () => {
      const з = load(КЛЮЧ, {})[р.id] || {}; const h = Array.isArray(з.hist) ? з.hist : (з.t ? [з.t] : []);
      if (!h.length) { под.innerHTML = '<span class="ch-tih">Тук няма какво да махна. Записаното в „Дневник на даденото“ се маха оттам (🗑).</span>'; поправка.hidden = true; return; }
      if (!махниДоза(р.id, Math.max.apply(null, h))) { под.innerHTML = '<span class="ch-red">😕 Не успях да го махна — пробвай пак.</span>'; return; }
      поправка.hidden = true; fx().buzz(8); опресни();
    });

    // ── интервалът и максимумът: полета, не присъда ──
    let настр = null;
    if (р.lek) {
      настр = el('div', 'ch-set'); настр.hidden = true;
      настр.innerHTML = '<span class="ch-set-t">Каквото пише на КУТИЯТА ти (или каквото ти каза педиатърът):</span>';
      const р1 = el('div', 'ch-set-row');
      const л1 = el('label', 'ch-lab', 'на всеки'); const и1 = el('input', 'ch-num'); и1.type = 'text'; и1.inputMode = 'numeric'; и1.maxLength = 2; и1.setAttribute('aria-label', 'На колко часа');
      const л1б = el('span', 'ch-lab', 'ч');
      const л2 = el('label', 'ch-lab', '· най-много'); const и2 = el('input', 'ch-num'); и2.type = 'text'; и2.inputMode = 'numeric'; и2.maxLength = 2; и2.setAttribute('aria-label', 'Най-много дози за 24 часа');
      const л2б = el('span', 'ch-lab', 'дози / 24 ч');
      р1.appendChild(л1); р1.appendChild(и1); р1.appendChild(л1б); р1.appendChild(л2); р1.appendChild(и2); р1.appendChild(л2б);
      настр.appendChild(р1);
      const бел = el('p', 'ch-set-warn'); настр.appendChild(бел);
      const потв = el('button', 'ch-cancel', 'Така е на кутията'); потв.type = 'button'; потв.style.minHeight = '44px'; потв.style.marginTop = '8px';   // тих бутон: мама първо гледа кутията
      потв.setAttribute('aria-label', 'Така е на кутията: запиши числата за ' + р.ime); настр.appendChild(потв);
      // текстът на бележката се пише в опресниНастр(): „твои“ само ако мама ги е записала
      // 22.11 (чат „session“, instrumenti_funkc_proba): полетата се показваха само ПЪРВИЯ път — щом числото се
      //    запише, от екрана вече не можеше да се поправи, а „най-рано в“ и таванът се смятат по него. Постоянен
      //    бутон: отваря и затваря полетата колкото пъти трябва. ПЪТ НАЗАД: махни зъб и редът с него.
      const зъб = el('button', 'ch-cancel', '⚙ Числата от кутията'); зъб.type = 'button';
      зъб.style.gridColumn = '1 / -1'; зъб.style.justifySelf = 'start'; зъб.style.minHeight = '44px';
      зъб.setAttribute('aria-expanded', 'false'); зъб.setAttribute('aria-label', 'Числата от кутията: интервал и таван за ' + р.ime);
      const опресниНастр = () => {
        const нн = настройка(р); и1.value = нн.h || ''; и2.value = нн.max || '';
        бел.innerHTML = '⚠️ ' + (нн.мояH && нн.мояM ? 'Тези две числа са <b>твои</b> — приложението само ги помни.'
          : нн.мояH || нн.мояM ? (нн.h > 0 && нн.max > 0 ? 'Едното число е <b>твое</b>, другото е <b>начално</b> — запиши и него от кутията.' : 'Едното число е <b>твое</b>, другото още го няма — запиши и него от кутията.')
          : 'Това са <b>началните</b> числа, докато запишеш своите от кутията.') + ' Не са съвет и не заместват листовката.';
        зъб.setAttribute('aria-expanded', String(!настр.hidden));
        const няма = !(нн.h > 0) && !(нн.max > 0);
        if (няма) бел.innerHTML = '⚠️ Още няма числа. Запиши ги от кутията (или каквото ти каза педиатърът). Не са съвет и не заместват листовката.';
        потв.hidden = !((!нн.мояH && нн.h > 0) || (!нн.мояM && нн.max > 0));   // само ако има НЕЙНО за записване: число > 0, което още не е нейно
      };
      потв.addEventListener('click', () => {
        const ч = и => parseInt(String(и.value).replace(/[^0-9]/g, ''), 10); const a = ч(и1), b = ч(и2);
        if (a >= 1 && a <= 24) пишиНастройка(р.id, 'h', a);
        if (b >= 1 && b <= 24) пишиНастройка(р.id, 'max', b);
        опресни(); опресниНастр();
      });
      ред._опресниНастр = опресниНастр; опресниНастр();
      зъб.addEventListener('click', () => { настр.hidden = !настр.hidden; опресниНастр(); });
      ред.appendChild(зъб);
      ред.appendChild(настр);
      и1.addEventListener('change', () => { const v = parseInt(String(и1.value).replace(/[^0-9]/g, ''), 10); if (v >= 1 && v <= 24) { пишиНастройка(р.id, 'h', v); опресни(); опресниНастр(); } else и1.value = настройка(р).h || ''; });
      и2.addEventListener('change', () => { const v = parseInt(String(и2.value).replace(/[^0-9]/g, ''), 10); if (v >= 1 && v <= 24) { пишиНастройка(р.id, 'max', v); опресни(); опресниНастр(); } else и2.value = настройка(р).max || ''; });
      ред._поле1 = и1; ред._поле2 = и2; ред._настр = настр;
    }

    // ── опресняване (СМЯТА, не помни) ──
    function опресни() {
      const вс = load(КЛЮЧ, {}); const з = запис(вс, р.id); const сега = Date.now();
      if (!з.t) {
        кога.textContent = '—';
        кога.classList.remove('ch-warn', 'ch-soon');
        под.innerHTML = '<span class="ch-tih">Още нищо. Бутни, щом стане.</span>';
        return;
      }
      const мин = сега - з.t;
      кога.textContent = предиДумите(мин);
      кога.title = 'в ' + часДумите(з.t) + ' — докосни, за да поправиш';
      кога.classList.remove('ch-warn', 'ch-soon');
      const н = настройка(р);
      let ред2 = 'в <b>' + часДумите(з.t) + '</b>';
      if (р.id === 'temp') {   // 25.11 (G-04): градусите от същото мерене, ако ги има
        const т = load('bl_temps', []).filter(x => x && isFinite(x.v) && Math.abs((+x.ts) - з.t) <= 120000).pop();
        if (т) ред2 += ' · <b>' + String(т.v).replace('.', ',') + '°</b>';
      }
      if (р.lek && н.h > 0) {
        const следв = з.t + н.h * 3600e3;
        if (сега < следв) {
          кога.classList.add('ch-soon');
          ред2 += н.мояH ? ' · по твоята бележка следващата е <b>най-рано в ' + часДумите(следв) + '</b>' : ' · по началните ' + н.h + ' ч, провери кутията: <b>най-рано в ' + часДумите(следв) + '</b>';
        } else {
          ред2 += н.мояH ? ' · твоите ' + н.h + ' ч минаха' : ' · началните ' + н.h + ' ч минаха, провери кутията';
        }
      }
      // 22.11 (чат „session“): таванът стоеше вътре в „н.h > 0“ — мама, записала само „най-много“, не получаваше предупреждение.
      if (р.lek) {
        const бр = дозиЗа24(з, сега);
        if (бр > 0) {
          ред2 += ' · <b>' + бр + '</b> ' + (бр === 1 ? 'доза' : 'дози') + ' за 24 ч';
          if (н.max > 0 && бр >= н.max) {
            кога.classList.add('ch-warn');
            ред2 += '<br><span class="ch-red">' + (н.мояM ? 'Стигна твоя таван (' : 'Стигна началния таван, провери кутията (') + н.max + '). Ако детето пак гори — това вече е разговор с педиатъра, не с кутията. При много зле дете: <b>112</b>.</span>';
          }
        }
      }
      под.innerHTML = ред2;
      if (р.lek && ред._поле1) { const нн = настройка(р); ред._поле1.value = нн.h || ''; ред._поле2.value = нн.max || ''; }
    }
    ред._опресни = опресни;

    // 🔴 25.11 (одит G-01, видяно: две докосвания през 150 ms = „2 дози за 24 ч“ и нищо за махане).
    //    В 3 през нощта палецът трепва. Второ докосване до 60 s НЕ пише — пита „още една?“; всеки запис
    //    има „↺ Върни“ за 10 s, а „Кога беше наистина?“ има „Не беше · махни“.
    //    ПЪТ НАЗАД: върни стария слушател (отбележи + опресни) и махни пак/върни/град.
    const ДВОЙНО_MS = 60000;
    let таймерВ = null;
    const чч = t => { const d = new Date(t); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
    function покажиВърни(t) {
      върни.innerHTML = '';
      върни.appendChild(el('span', 'ch-fix-t', 'Записах „' + esc(р.ime) + '“ в ' + чч(t) + '.'));
      const рВ = el('div', 'ch-fix-row'); const б = el('button', 'ch-cancel', '↺ Върни'); б.type = 'button';
      б.setAttribute('aria-label', 'Върни: махни записа „' + р.ime + '“ от ' + чч(t));
      б.addEventListener('click', () => {
        clearTimeout(таймерВ); върни.hidden = true; if (град) град.hidden = true;
        if (!махниДоза(р.id, t)) { под.innerHTML = '<span class="ch-red">😕 Не успях да го махна — пробвай пак.</span>'; return; }
        fx().buzz(8); опресни();
      });
      рВ.appendChild(б); върни.appendChild(рВ); върни.hidden = false;
      clearTimeout(таймерВ); таймерВ = setTimeout(() => { върни.hidden = true; }, 10000);
    }
    function покажиГрадуси(t) {
      if (!град) return;
      град.innerHTML = '';
      град.appendChild(el('span', 'ch-fix-t', 'Колко градуса? (по желание — отива и в „Температурен дневник“)'));
      const рГ = el('div', 'ch-fix-row');
      const вх = el('input', 'ch-num ch-grad-in'); вх.type = 'text'; вх.inputMode = 'decimal'; вх.maxLength = 4; вх.placeholder = '37,8';
      вх.setAttribute('aria-label', 'Градуси (по желание)'); вх.style.width = '5.5em';
      const ок2 = el('button', 'ch-ok', 'Запиши'); ок2.type = 'button';
      const не2 = el('button', 'ch-cancel', 'Без градуси'); не2.type = 'button';
      const каз = el('span', 'ch-fix-t'); каз.hidden = true;
      const пиши = () => {
        const v = parseFloat(String(вх.value || '').replace(',', '.'));
        if (!(v >= 34 && v <= 43)) { каз.textContent = 'Напиши градусите като 37,8 (между 34 и 43).'; каз.hidden = false; вх.focus(); return; }
        const т = load('bl_temps', []).filter(x => !(x && x.ts === t));
        т.push({ v: Math.round(v * 10) / 10, ts: t });
        if (!save('bl_temps', т.slice(-80))) { каз.textContent = '😕 Паметта е пълна — градусите НЕ са записани.'; каз.hidden = false; return; }
        ['BL_TEMPS_REDRAW', 'BL_EPISODE_REDRAW'].forEach(f => { try { if (typeof window[f] === 'function') window[f](); } catch (e) {} });
        град.hidden = true; fx().buzz(8); опресни();
      };
      ок2.addEventListener('click', пиши);
      вх.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); пиши(); } });
      не2.addEventListener('click', () => { град.hidden = true; });
      рГ.appendChild(вх); рГ.appendChild(ок2); рГ.appendChild(не2);
      град.appendChild(рГ); град.appendChild(каз); град.hidden = false;
    }
    function запишиСега() {
      const t = Date.now();
      пак.hidden = true;
      if (!отбележи(р.id, t)) { под.innerHTML = '<span class="ch-red">😕 Паметта на телефона е пълна — часът НЕ е записан. Изтрий нещо и бутни пак.</span>'; return; }
      const вДневника = р.id === 'hrana' ? храненеВДневника(t) : true;   // 25.11 (G-07): и в общия дневник на храненето
      fx().buzz(10); fx().pop && fx().pop(бут);
      опресни();
      if (р.lek && ред._настр && ред._настр.hidden && !load(КЛЮЧ_Н, {})[р.id]) { ред._настр.hidden = false; ред._опресниНастр(); } // първия път показваме полетата ВЕДНЪЖ (и бутонът знае, че са отворени)
      покажиВърни(t); покажиГрадуси(t);
      if (!вДневника) върни.appendChild(el('span', 'ch-fix-t', '(Часът е тук, но „Кога яде за последно?“ може да не се обнови — паметта е пълна.)'));
    }
    бут.addEventListener('click', () => {
      const з = запис(load(КЛЮЧ, {}), р.id); const мин = Date.now() - (з.t || 0);
      if (з.t && мин >= 0 && мин < ДВОЙНО_MS) {
        пак.innerHTML = '';
        пак.appendChild(el('span', 'ch-fix-t', '„' + esc(р.ime) + '“ е отбелязано преди ' + Math.max(1, Math.round(мин / 1000)) + ' сек. ' + (р.lek ? 'Още една доза ли е?' : 'Още веднъж ли е?')));
        const рП = el('div', 'ch-fix-row');
        const да = el('button', 'ch-ok', р.lek ? 'Да, още една доза' : 'Да, още веднъж'); да.type = 'button';
        const не = el('button', 'ch-cancel', 'Не, същото е'); не.type = 'button';
        да.addEventListener('click', запишиСега);
        не.addEventListener('click', () => { пак.hidden = true; });
        рП.appendChild(да); рП.appendChild(не); пак.appendChild(рП); пак.hidden = false;
        try { не.focus({ preventScroll: true }); } catch (e) {}
        return;
      }
      запишиСега();
    });

    кога.addEventListener('click', () => {
      const вс = load(КЛЮЧ, {}); const з = вс[р.id] || {};
      поправка.hidden = !поправка.hidden;
      if (!поправка.hidden) { const d = new Date(з.t || Date.now()); вход.value = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); вход.focus(); }
    });
    отказ.addEventListener('click', () => { поправка.hidden = true; });
    ок.addEventListener('click', () => {
      const m = /^([0-9]{1,2}):([0-9]{2})$/.exec(String(вход.value || ''));
      if (!m) { вход.focus(); return; }
      const сега = new Date(); const d = new Date(сега.getTime());
      d.setHours(parseInt(m[1], 10), parseInt(m[2], 10), 0, 0);
      // ⏪ Ако часът е В БЪДЕЩЕТО, тя говори за ВЧЕРА (в 23:40, а сега е 01:10).
      if (d.getTime() > сега.getTime()) d.setDate(d.getDate() - 1);
      const вс = load(КЛЮЧ, {}); const з = (вс[р.id] && typeof вс[р.id] === 'object') ? вс[р.id] : {};
      const h = Array.isArray(з.hist) ? з.hist.slice() : [];
      const старо = h.length ? h[h.length - 1] : null;   // 25.11 (G-07): кое време местим — за общия дневник
      if (h.length) h[h.length - 1] = d.getTime(); else h.push(d.getTime());   // поправяме ПОСЛЕДНИЯ, не добавяме нов
      з.t = d.getTime(); з.hist = h.sort((a, b) => a - b).slice(-60); вс[р.id] = з;
      if (!save(КЛЮЧ, вс)) { под.innerHTML = '<span class="ch-red">😕 Паметта е пълна — поправката НЕ е записана.</span>'; return; }
      // 25.11 (G-07): храненето се мести и в bl_feedlog/bl_feed; ако е ново (празна история) — влиза в дневника
      if (р.id === 'hrana') { if (старо != null) храненеПоправи(старо, d.getTime()); else храненеВДневника(d.getTime()); }
      поправка.hidden = true; fx().buzz(8); опресни();
    });

    опресни();
    корен.appendChild(ред);
    return ред;
  }

  // ── картата ────────────────────────────────────────────────────────────
  function mountChasovnik(container) {
    const inner = container.querySelector('.td-inner');
    if (!inner || inner.classList.contains('td-welcome') || inner.querySelector('.ch-card')) return;

    const c = el('div', 'ch-card');
    c.innerHTML = '<span class="ch-title">⏳ Преди колко време?</span>'
      + '<p class="ch-sub">Едно докосване сега — сигурен отговор в 3 през нощта.</p>';
    const тяло = el('div', 'ch-body');
    c.appendChild(тяло);

    const видими = load(КЛЮЧ_В, []);   // 22.11: беше null → load() отхвърляше масива и добавеното изчезваше
    const записи = load(КЛЮЧ, {});
    // ПЪРВО пускане: показваме двете лекарства + храненето. Останалите чакат.
    const пуснати = видими.length ? видими : ['nurofen', 'paracet', 'hrana'];
    const редове = [];
    РЕДОВЕ.forEach(р => { if (пуснати.indexOf(р.id) >= 0 || записи[р.id]) редове.push(рисувайРед(р, тяло)); });

    // „+ още“ — само за онези, които още ги няма
    const още = РЕДОВЕ.filter(р => пуснати.indexOf(р.id) < 0 && !записи[р.id]);
    if (още.length) {
      const добави = el('div', 'ch-add');
      още.forEach(р => {
        const b = el('button', 'ch-add-b', '+ ' + р.emo + ' ' + esc(р.ime)); b.type = 'button';
        b.addEventListener('click', () => {
          const сп = load(КЛЮЧ_В, []); const нов = сп.length ? сп.slice() : ['nurofen', 'paracet', 'hrana'];
          if (нов.indexOf(р.id) < 0) нов.push(р.id);
          save(КЛЮЧ_В, нов);
          b.remove();
          редове.push(рисувайРед(р, тяло));
          if (!тяло.parentNode.querySelector('.ch-add-b')) добави.remove();
        });
        добави.appendChild(b);
      });
      c.appendChild(добави);
    }

    c.appendChild(el('p', 'ch-legal', 'Приложението пази <b>часа</b>. Дозата — колко и как — е на кутията и при твоя педиатър. Ако детето е много зле, не чакай часовника: <b>112</b>.'));

    // ═══════════════════════════════════════════════════════════════════
    // ⬆️ КОГАТО ТРЯБВА — ГОРЕ. Иначе — по реда си.
    //
    //   Измерено на живо: картата стоеше на 2103 пиксела от началото на
    //   страница от 12 466. Това е добре за въпроса „кога го храних",
    //   но не и за 3 през нощта с дете, което гори — точно тогава жената
    //   няма да скролва две трети от екрана.
    //   Затова: НОЩ (22–06) или ЖИВА доза лекарство (в последните 8 ч)
    //   я вдига веднага след чиповете. Денем и без дадено лекарство
    //   остава долу и не заема мястото на нищо.
    //   ⚠️ Не се мести НИКОГА след като е сложена — местене под пръста
    //   на майката е по-лошо от няколко реда скрол.
    // ═══════════════════════════════════════════════════════════════════
    const час = new Date().getHours();
    const нощ = (час >= 22 || час < 6);
    const живаДоза = РЕДОВЕ.some(р => р.lek && записи[р.id] && записи[р.id].t
      && (Date.now() - записи[р.id].t) < 8 * 3600e3);
    const котва = inner.querySelector('.td-chips') || inner.querySelector('.td-tip');
    if ((нощ || живаДоза) && котва && котва.nextSibling) {
      c.classList.add('ch-gore');
      inner.insertBefore(c, котва.nextSibling);
    } else {
      inner.appendChild(c);
    }

    // 🧊 Скритият таб замразява таймерите. Затова: смятаме и при ВРЪЩАНЕ.
    const опресниВсички = () => редове.forEach(р => { try { р._опресни(); } catch (e) {} });
    const тик = setInterval(() => { if (!document.body.contains(c)) { clearInterval(тик); document.removeEventListener('visibilitychange', приВръщане); return; } опресниВсички(); }, 60000);
    const приВръщане = () => { if (!document.hidden) опресниВсички(); };
    document.addEventListener('visibilitychange', приВръщане);
  }

  // ── свързване: СЪЩАТА верига ───────────────────────────────────────────
  const предишното = window.BL_TODAY_BIND;
  window.BL_TODAY_BIND = function (container, baby, a) {
    if (предишното) предишното(container, baby, a);
    try { mountChasovnik(container); } catch (e) {}
  };

  // ═══════════════════════════════════════════════════════════════════════
  // 💬 ЖИВИЯТ ОТГОВОР В ЧАТА
  //
  //   В 06:40 майката не отваря „Днес" — тя пише на помощничката, защото
  //   така е свикнала. Питането „кога му дадох нурофен" е ЕДИНСТВЕНИЯТ
  //   въпрос в приложението, чийто отговор не може да се напише отнапред.
  //
  //   ⚠️ НАРОЧНО ТЕСЕН: иска и ВЪПРОСНА рамка (кога / преди колко / в колко),
  //   и ДЕЙСТВИЕ (дадох / сложих / мерих / храних…). „дадох му нурофен"
  //   само по себе си НЕ влиза — това е разказ, не въпрос, и трябва да си
  //   получи картата. Проверено и в двете посоки в dev/chasovnikat.js.
  //   Ако няма записан час, НЕ мълчим и не лъжем — казваме, че не знаем,
  //   и обясняваме къде се записва. Един път, без натякване.
  // ═══════════════════════════════════════════════════════════════════════
  const ВЪПРОСНО = /(кога|преди колко|в колко|колко време|последн[ияото]+ път|кой час)/i;
  const ЗА_КОЕ = [
    { id: 'nurofen', re: /(нурофен|ибупрофен|ибу(?![а-я])|advil|бруфен)/i },
    { id: 'paracet', re: /(парацетамол|панадол|ефералган|цефекон|paracetamol)/i },
    { id: 'drugo', re: /(лекарств|сироп|хапче|свещичк|антибиотик|капк)/i },
    { id: 'temp', re: /(температур|градус|термометър)/i },
    { id: 'hrana', re: /(храних|нахраних|ядох|яде|суче|кърмих|мляко|шише|биберон)/i },
    { id: 'aki', re: /(аки|ака|акал|голяма нужда|изходи|пелена)/i },
  ];
  const ДЕЙСТВИЕ = /(дадох|дадохме|даде|сложих|пих|изпи|мерих|измерих|храних|нахраних|кърмих|смених|аках?|акал)/i;

  function живОтговор(текст) {
    const t = String(текст || '').toLowerCase();
    if (!ВЪПРОСНО.test(t)) return null;
    const цел = ЗА_КОЕ.find(x => x.re.test(t));
    if (!цел) return null;
    // за лекарствата „кога му дадох" стига; за храна/аки искаме и глагол,
    // за да не хващаме „кога да започна с мляко"
    const лек = наИме[цел.id] && наИме[цел.id].lek;
    if (!лек && !ДЕЙСТВИЕ.test(t)) return null;
    if (/(може ли|трябва ли|как да|защо|колко пъти на ден|на колко часа може)/i.test(t)) return null;

    const р = наИме[цел.id];
    const вс = load(КЛЮЧ, {}); const з = запис(вс, цел.id);
    if (!з || !з.t) {
      return 'Не знам — още не си отбелязвала „' + esc(р.ime) + '“. '
        + 'На екрана „Днес“ има карта <b>⏳ Преди колко време?</b> — едно докосване, щом стане, '
        + 'и следващия път ще ти кажа точния час.';
    }
    const сега = Date.now();
    let ред = '<b>' + предиДумите(сега - з.t) + '</b> — в ' + часДумите(з.t) + '.';
    if (р.lek) {
      const н = настройка(р);
      if (н.h > 0) {
        const следв = з.t + н.h * 3600e3;
        ред += сега < следв
          ? (н.мояH ? ' По твоята бележка следващата е най-рано в <b>' : ' По началните ' + н.h + ' ч (провери кутията) следващата е най-рано в <b>') + часДумите(следв) + '</b>.'
          : (н.мояH ? ' Твоите ' : ' Началните ') + н.h + ' ч минаха' + (н.мояH ? '.' : ', провери кутията.');
      }
      const бр = дозиЗа24(з, сега);
      if (бр > 0) ред += ' Това е ' + редНаДоза(бр) + ' доза за 24 часа';
      if (бр > 0 && н.max > 0 && бр >= н.max) ред += ' — ' + (н.мояM ? 'стигна твоя таван (' : 'стигна началния таван, провери кутията (') + н.max + '). Ако детето пак гори, това вече е разговор с педиатъра. При много зле дете: <b>112</b>.';
      else if (бр > 0) ред += '.';
      ред += '<br><span style="opacity:.75">Часът го пазя аз. Колко и как — на кутията и при педиатъра.</span>';
    }
    return ред;
  }
  window.BL_ZHIVI_OTGOVORI = window.BL_ZHIVI_OTGOVORI || [];
  window.BL_ZHIVI_OTGOVORI.push(живОтговор);

  // за проверчиците
  window.BL_CHAS = { предиДумите: предиДумите, РЕДОВЕ: РЕДОВЕ, отбележи: отбележи, дозиЗа24: дозиЗа24, живОтговор: живОтговор, своиДози: своиДози, махниДоза: махниДоза };
  // 25.11 (G-02): дневникът на даденото, болничният епизод и бележката за прегледа четат и дозите от часовника
  window.BL_LEK_DOZI = своиДози;
})();
