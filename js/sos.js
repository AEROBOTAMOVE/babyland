// ═══════════════════════════════════════════════════════════
// 🆘 СОС-ЦЕНТЪРЪТ — истинският спешен екран
// Едно докосване на „SOS“ → номерата, които спасяват: 112,
// МОЯТ БЪРЗ НОМЕР (избран от мама, звъни директно), педиатър,
// личен лекар, близък човек, токсикология. Всичко редактируемо.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  // споделя bl_sos със стаята Здраве (pedName/pedPhone/closeName/closePhone) + добавя нови полета
  const S = () => Object.assign({ pedName: '', pedPhone: '', closeName: '', closePhone: '', gpName: '', gpPhone: '', fastName: '', fastPhone: '', soulName: '', soulPhone: '' }, load('bl_sos', {}));

  const FIXED = [
    { e: '🚨', n: 'Спешен телефон 112', sub: 'пожар · спешна помощ · полиция — безплатно, денонощно', tel: '112', cls: 'sos-112' },
    { e: '☠️', n: 'Токсикология „Пирогов“', sub: 'при погълнато лекарство/химикал · свери номера при първа възможност', tel: '029154409', cls: '' },
    // Национална телефонна линия за деца — безплатна, денонощна, подкрепа за
    // деца и родители в тревога (не медицинска спешност — за нея е 112)
    { e: '🧸', n: 'Линия за деца 116 111', sub: 'безплатно, денонощно · съвет и подкрепа за родител в тревога', tel: '116111', cls: '' },
    // 🤍 22.07 (мега одит): базата обещаваше „в Здраве и SOS имаш номера“ за
    // насилие в дома, а такъв номер НЯМАШЕ никъде. Европейската линия за
    // пострадали от насилие работи и в България, безплатно.
    { e: '🤍', n: 'Помощ при насилие 116 006', sub: 'безплатно · за жена, която не се чувства в безопасност вкъщи', tel: '116006', cls: '' }
  ];
  const EDITABLE = [
    ['fast', '⭐', 'Моят бърз номер', 'човекът, на когото звъниш първо'],
    ['ped', '🩺', 'Педиатърът ни', 'лекарят на бебето'],
    ['gp', '👩‍⚕️', 'Личният лекар', 'твоят лекар'],
    ['close', '💜', 'Близък човек', 'партньор, майка, сестра…'],
    // 🤍 номерът за тежките дни — САМА си го избира: психолог, доверен
    // човек, линия за подкрепа. Ние не решаваме вместо нея и не измисляме.
    ['soul', '🤍', 'За душата', 'психолог · доверен човек · линия за подкрепа — ти избираш']
  ];

  function open() {
    let ov = document.getElementById('sosOverlay');
    if (!ov) { ov = el('div', 'sos-ov'); ov.id = 'sosOverlay'; document.body.appendChild(ov); }
    const s = S();
    let editMode = false;

    function draw() {
      let html = `<div class="sos-panel"><div class="sos-head">
        <h3>🆘 Спешни номера</h3>
        <button class="sos-edit no-print" type="button">${editMode ? '✓ Готово' : '✏️ Настрой'}</button>
        <button class="sos-x" type="button" aria-label="Затвори">✕</button></div>
        <div class="sos-list">`;
      // МОЯТ БЪРЗ НОМЕР — най-отгоре, най-голям (ако е настроен)
      if (s.fastPhone && !editMode) {
        html += `<a class="sos-big sos-fast" href="tel:${esc(s.fastPhone)}">⭐ ЗВЪННИ: ${esc(s.fastName) || 'моят номер'}<span>${esc(s.fastPhone)}</span></a>`;
      }
      FIXED.forEach(f => {
        html += `<a class="sos-big ${f.cls}" href="tel:${f.tel}">${f.e} ${f.n}<span>${f.sub}</span></a>`;
      });
      EDITABLE.forEach(([key, e, name, sub]) => {
        const ph = s[key + 'Phone'], nm = s[key + 'Name'];
        if (editMode) {
          html += `<div class="sos-editrow" data-k="${key}">
            <span class="sos-e">${e}</span>
            <input class="sos-in sos-in-n" placeholder="${name}…" value="${esc(nm)}" aria-label="${name} — име">
            <input class="sos-in sos-in-p" type="tel" placeholder="телефон…" value="${esc(ph)}" aria-label="${name} — телефон"></div>`;
        } else if (ph && key !== 'fast') {
          html += `<a class="sos-row" href="tel:${esc(ph)}"><span class="sos-e">${e}</span><span class="sos-nm">${esc(nm) || name}<small>${esc(ph)}</small></span><span class="sos-go">📞</span></a>`;
        } else if (!ph && key === 'fast') {
          html += `<button class="sos-row sos-empty" type="button" data-setup="1"><span class="sos-e">${e}</span><span class="sos-nm">${name}<small>докосни, за да го настроиш — звъни с 1 докосване</small></span><span class="sos-go">✏️</span></button>`;
        }
      });
      html += `</div>
        <p class="sos-tips">Говори бавно · кажи АДРЕСА първо · не затваряй първа · при бебе под 3 м. с температура — винаги преглед</p>
        <button class="sos-roomlink" type="button">Отвори стаята „Здраве и SOS“ → съвети какво да правиш, докато чакаш</button>
      </div>`;
      ov.innerHTML = html;
      ov.hidden = false;
      document.body.style.overflow = 'hidden';

      // 🔴🔴 04.08 (обиколка, стая Здраве): написаното стигаше до паметта САМО
      //    през бутона „✓ Готово“. Проверено наживо: мама набира номера на
      //    педиатъра, затваря с ✕ — localStorage остава празен и приложението
      //    не казва нищо. В нощта, когато номерът наистина ѝ трябва, го няма.
      //    Сега се пази на всяко писане И на всеки изход от екрана.
      const close = () => { if (editMode) collect(); ov.hidden = true; document.body.style.overflow = ''; };
      ov.querySelectorAll('.sos-editrow input').forEach(inp => {
        inp.addEventListener('input', collect);
        inp.addEventListener('change', collect);
      });
      ov.querySelector('.sos-x').onclick = close;
      ov.onclick = e => { if (e.target === ov) close(); };
      ov.querySelector('.sos-edit').onclick = () => { if (editMode) collect(); editMode = !editMode; draw(); };
      const setup = ov.querySelector('[data-setup]');
      if (setup) setup.onclick = () => { editMode = true; draw(); };
      ov.querySelector('.sos-roomlink').onclick = () => { close(); if (window.MamaHelper) MamaHelper.open('Здраве и SOS'); };
      if (window.BL_FX) BL_FX.buzz(12);
    }
    function collect() {
      ov.querySelectorAll('.sos-editrow').forEach(r => {
        const k = r.dataset.k;
        s[k + 'Name'] = r.querySelector('.sos-in-n').value.trim();
        s[k + 'Phone'] = r.querySelector('.sos-in-p').value.trim().replace(/[^\d+]/g, '');
      });
      save('bl_sos', s);
    }
    draw();
  }

  // 0.1.1: ДЪЛГО натискане (600ms) → директно tel:112, без междинен екран.
  // При паника пръстът стои — точно тогава не трябва екран. Извлечено в
  // помощник (проход 3), за да важи и за 🆘 бутона в главата на всяка стая.
  // capture=true само за .bn-item (заради чуждите click-handler-и на навигацията);
  // за #roSos capture не е нужен.
  function върже(a, capture) {
    let таймер = null, звънна = false;
    a.addEventListener('click', (e) => { if (звънна) { звънна = false; return; } e.preventDefault(); if (capture) e.stopImmediatePropagation(); open(); }, capture ? true : false);
    // проход 4: визуален знак „зарежда се 112" по време на задържането — паникьосан
    // пръст да ЗНАЕ, че нещо се случва (само transform/opacity клас, виж CSS).
    const старт = () => { звънна = false; a.classList.add('sos-charging'); таймер = setTimeout(() => {
      звънна = true; a.classList.remove('sos-charging');
      if (window.BL_FX) BL_FX.buzz(30);
      const t = document.createElement('a'); t.href = 'tel:112'; t.click();
    }, 600); };
    const стоп = () => { if (таймер) clearTimeout(таймер); таймер = null; a.classList.remove('sos-charging'); };
    a.addEventListener('pointerdown', старт);
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ев => a.addEventListener(ев, стоп));
  }

  // бутонът СОС в долната навигация + 🆘 в главата на стаята отварят ЦЕНТЪРА
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.bn-item').forEach(a => {
      if (!/SOS/i.test(a.textContent)) return;
      a.classList.add('bn-sos');                                     // 0.1.4: по-голяма зона за пръст
      върже(a, true);
    });
    const roSos = document.getElementById('roSos');
    if (roSos) върже(roSos, false);
  });

  window.BL_SOS_CENTER = { open };
})();
