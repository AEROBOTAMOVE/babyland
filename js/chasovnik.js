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
    { id: 'nurofen', ime: 'Нурофен', emo: '💊', h: 6, max: 3, lek: true, pod: 'ибупрофен' },
    { id: 'paracet', ime: 'Парацетамол', emo: '💊', h: 6, max: 4, lek: true, pod: 'Панадол · Ефералган' },
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

  function настройка(р) {
    const н = load(КЛЮЧ_Н, {})[р.id] || {};
    return { h: (typeof н.h === 'number' ? н.h : р.h), max: (typeof н.max === 'number' ? н.max : р.max) };
  }
  function пишиНастройка(id, поле, стойност) {
    const вс = load(КЛЮЧ_Н, {});
    const мое = (вс[id] && typeof вс[id] === 'object') ? вс[id] : {};
    мое[поле] = стойност; вс[id] = мое;
    return save(КЛЮЧ_Н, вс);
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

    // ── поправката: „не сега — беше в 03:00“ ──
    const вход = el('input', 'ch-time'); вход.type = 'time'; вход.setAttribute('aria-label', 'Час, в който беше');
    const ок = el('button', 'ch-ok', 'Запиши'); ок.type = 'button';
    const отказ = el('button', 'ch-cancel', 'Откажи'); отказ.type = 'button';
    поправка.appendChild(el('span', 'ch-fix-t', 'Кога беше наистина?'));
    const редП = el('div', 'ch-fix-row'); редП.appendChild(вход); редП.appendChild(ок); редП.appendChild(отказ);
    поправка.appendChild(редП);

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
      настр.appendChild(el('p', 'ch-set-warn', '⚠️ Тези две числа са <b>твои</b> — приложението само ги помни. Не са съвет и не заместват листовката.'));
      ред.appendChild(настр);
      и1.addEventListener('change', () => { const v = parseInt(String(и1.value).replace(/[^0-9]/g, ''), 10); if (v >= 1 && v <= 24) { пишиНастройка(р.id, 'h', v); опресни(); } else и1.value = настройка(р).h || ''; });
      и2.addEventListener('change', () => { const v = parseInt(String(и2.value).replace(/[^0-9]/g, ''), 10); if (v >= 1 && v <= 24) { пишиНастройка(р.id, 'max', v); опресни(); } else и2.value = настройка(р).max || ''; });
      ред._поле1 = и1; ред._поле2 = и2; ред._настр = настр;
    }

    // ── опресняване (СМЯТА, не помни) ──
    function опресни() {
      const вс = load(КЛЮЧ, {}); const з = вс[р.id] || {}; const сега = Date.now();
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
      if (р.lek && н.h > 0) {
        const следв = з.t + н.h * 3600e3;
        if (сега < следв) {
          кога.classList.add('ch-soon');
          ред2 += ' · по твоята бележка следващата е <b>най-рано в ' + часДумите(следв) + '</b>';
        } else {
          ред2 += ' · твоите ' + н.h + ' ч минаха';
        }
        const бр = дозиЗа24(з, сега);
        if (бр > 0) {
          ред2 += ' · <b>' + бр + '</b> ' + (бр === 1 ? 'доза' : 'дози') + ' за 24 ч';
          if (н.max > 0 && бр >= н.max) {
            кога.classList.add('ch-warn');
            ред2 += '<br><span class="ch-red">Стигна твоя таван (' + н.max + '). Ако детето пак гори — това вече е разговор с педиатъра, не с кутията. При много зле дете: <b>112</b>.</span>';
          }
        }
      }
      под.innerHTML = ред2;
      if (р.lek && ред._поле1) { const нн = настройка(р); ред._поле1.value = нн.h || ''; ред._поле2.value = нн.max || ''; }
    }
    ред._опресни = опресни;

    бут.addEventListener('click', () => {
      if (!отбележи(р.id, Date.now())) { под.innerHTML = '<span class="ch-red">😕 Паметта на телефона е пълна — часът НЕ е записан. Изтрий нещо и бутни пак.</span>'; return; }
      fx().buzz(10); fx().pop && fx().pop(бут);
      опресни();
      if (р.lek && ред._настр && ред._настр.hidden && !load(КЛЮЧ_Н, {})[р.id]) ред._настр.hidden = false; // първия път показваме полетата ВЕДНЪЖ
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
      if (h.length) h[h.length - 1] = d.getTime(); else h.push(d.getTime());   // поправяме ПОСЛЕДНИЯ, не добавяме нов
      з.t = d.getTime(); з.hist = h.sort((a, b) => a - b).slice(-60); вс[р.id] = з;
      if (!save(КЛЮЧ, вс)) { под.innerHTML = '<span class="ch-red">😕 Паметта е пълна — поправката НЕ е записана.</span>'; return; }
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

    const видими = load(КЛЮЧ_В, null);
    const записи = load(КЛЮЧ, {});
    // ПЪРВО пускане: показваме двете лекарства + храненето. Останалите чакат.
    const пуснати = Array.isArray(видими) ? видими : ['nurofen', 'paracet', 'hrana'];
    const редове = [];
    РЕДОВЕ.forEach(р => { if (пуснати.indexOf(р.id) >= 0 || записи[р.id]) редове.push(рисувайРед(р, тяло)); });

    // „+ още“ — само за онези, които още ги няма
    const още = РЕДОВЕ.filter(р => пуснати.indexOf(р.id) < 0 && !записи[р.id]);
    if (още.length) {
      const добави = el('div', 'ch-add');
      още.forEach(р => {
        const b = el('button', 'ch-add-b', '+ ' + р.emo + ' ' + esc(р.ime)); b.type = 'button';
        b.addEventListener('click', () => {
          const сп = load(КЛЮЧ_В, null); const нов = Array.isArray(сп) ? сп.slice() : ['nurofen', 'paracet', 'hrana'];
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

    inner.appendChild(c);

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

  // за проверчиците
  window.BL_CHAS = { предиДумите: предиДумите, РЕДОВЕ: РЕДОВЕ, отбележи: отбележи, дозиЗа24: дозиЗа24 };
})();
