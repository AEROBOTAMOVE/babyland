// ═══════════════════════════════════════════════════════════
// 🤍 ТИХИЯТ ПАЗАЧ (мега одит 22.07 — критична находка)
//
// Флаговете за майката работеха САМО в чата и търсачката. Точно най-интимните
// места бяха слепи: „Скъсай листа“, „Тук може да плачеш“, заключеното дневниче,
// изповедалнята. Жена, която напише там най-страшното си изречение, получаваше
// „Отиде си завинаги. Издишай 💜“ и покана за игра.
//
// Тук слушаме ВСЯКО текстово поле в приложението. Ако в написаното има сигнал,
// показваме тиха, топла лента с помощ.
//
// ЖЕЛЯЗНО: текстът НЕ се записва, НЕ се изпраща и НЕ се чете повече от веднъж —
// анализът е в паметта, в момента на писане. Обещанието „остава при теб“ важи.
// Показва се веднъж на сесия за поле, за да не досажда.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  let показанаЗа = null;   // кое поле вече е получило лента (по сесия)
  let показаноНиво = 0;    // и С КАКВО ниво — иначе ескалацията се самозаглушава
  // 🔴 05.08 (одит г14, №76): пазехме само КОЕ поле е обслужено, не с какво
  //    ниво. Мама пише „не издържам“ → мека лилава лента; продължава в СЪЩОТО
  //    поле до „искам да ме няма“ → екранът мълчи, защото полето вече е
  //    „обслужено“. Червената лента със 112 не идваше никога.
  //    Правилото е в две посоки: същото (или по-леко) ниво не досажда,
  //    покачването винаги минава.
  const РАНГ = { heavy: 1, loss: 2, mamabody: 3, dv: 3, mother: 4 };

  function номерЗаДушата() {
    try {
      const s = JSON.parse(localStorage.getItem('bl_sos') || '{}');
      if (s && typeof s.soulPhone === 'string' && s.soulPhone.trim()) {
        return { тел: s.soulPhone.replace(/[^+\d]/g, ''), име: s.soulName || 'твоят номер за душата' };
      }
    } catch (e) {}
    return null;
  }

  function лента(ниво, поле) {
    const р = РАНГ[ниво] || 0;
    if (показанаЗа === поле && р <= показаноНиво) return;
    показанаЗа = поле;
    показаноНиво = р;
    const стара = document.querySelector('.gd-band');
    if (стара) стара.remove();

    const л = el('div', 'gd-band' + (ниво === 'mother' || ниво === 'mamabody' ? ' gd-red' : ''));
    л.setAttribute('role', 'status');
    const душа = номерЗаДушата();

    let вътре;
    if (ниво === 'mother') {
      вътре = '<strong>Прочетох те. 🤍</strong><br>Това, което написа, е тежко и не бива да го носиш сама точно сега. ' +
        'Ако усещаш, че можеш да навредиш на себе си или на бебето — това е спешно.' +
        '<div class="gd-btns">' +
        '<a class="gd-btn gd-112" href="tel:112">📞 112</a>' +
        '<a class="gd-btn" href="tel:116111">🧸 Линия за деца 116 111</a>' +
        (душа ? '<a class="gd-btn" href="tel:' + esc(душа.тел) + '">🤍 ' + esc(душа.име) + '</a>' : '') +
        '</div>';
    } else if (ниво === 'mamabody') {
      // тялото на майката след раждане — единственото място, където лентата
      // е за НЕЯ като пациент, не като майка (жива обиколка 22.07)
      вътре = '<strong>Това е за твоето тяло. 🤍</strong><br>Каквото описа, след раждане се проверява ' +
        'веднага — не „ако не мине до утре“. Обади се на гинеколога или на личния лекар <strong>днес</strong>; ' +
        'при обилно кървене, задух или силна болка в гърдите — 112.' +
        '<div class="gd-btns">' +
        '<a class="gd-btn gd-112" href="tel:112">📞 112</a>' +
        (душа ? '<a class="gd-btn" href="tel:' + esc(душа.тел) + '">🤍 ' + esc(душа.име) + '</a>' : '') +
        '</div>';
    } else if (ниво === 'loss') {
      вътре = '<strong>Тук съм. 🤍</strong><br>Няма правилни думи за това. Няма и правилен начин да се преживее. ' +
        'Каквото си написала, остава само твое.' +
        (душа ? '<div class="gd-btns"><a class="gd-btn" href="tel:' + esc(душа.тел) + '">🤍 ' + esc(душа.име) + '</a></div>' : '');
    } else {
      вътре = '<strong>Виждам те. 🤍</strong><br>Това, което носиш, е много. Не си длъжна да се справяш сама — ' +
        'кажи го на лекаря си или на човек, на когото вярваш.' +
        '<div class="gd-btns">' +
        '<a class="gd-btn" href="tel:116111">🧸 Линия за деца 116 111</a>' +
        (душа ? '<a class="gd-btn" href="tel:' + esc(душа.тел) + '">🤍 ' + esc(душа.име) + '</a>' : '') +
        '</div>';
    }
    л.innerHTML = вътре + '<button class="gd-x" type="button" aria-label="Затвори">✕</button>';
    л.querySelector('.gd-x').addEventListener('click', () => л.remove());
    document.body.appendChild(л);
    try { if (window.BL_FX) BL_FX.buzz(14); } catch (e) {}
    // не изчезва сама — мама я затваря, когато е готова
  }

  function провери(поле) {
    if (!window.BL_MOTHERFLAG) return;
    let т = '';
    try { т = поле.value || poleText(поле) || ''; } catch (e) { return; }
    if (!т || т.length < 6) return;
    let ниво = null;
    try { ниво = BL_MOTHERFLAG(т); } catch (e) { return; }
    // ⚠️ тук СЪЗНАТЕЛНО не пазим и не логваме нищо от текста
    if (ниво) лента(ниво, поле);
  }
  function poleText(п) { return п.isContentEditable ? п.textContent : ''; }

  // слушаме всяко текстово поле — включително бъдещите (делегиране на document)
  const ПОЛЕТА = 'textarea, input[type="text"], [contenteditable="true"]';
  let таймер = null;
  document.addEventListener('input', function (e) {
    const п = e.target;
    if (!п || !п.matches || !п.matches(ПОЛЕТА)) return;
    if (п.id === 'roInput' || п.id === 'searchInput') return;   // те си имат свой път
    clearTimeout(таймер);
    таймер = setTimeout(() => провери(п), 900);   // след като спре да пише
  }, true);
  document.addEventListener('blur', function (e) {
    const п = e.target;
    if (п && п.matches && п.matches(ПОЛЕТА) && п.id !== 'roInput' && п.id !== 'searchInput') провери(п);
  }, true);

  window.BL_GUARD = { провери: провери };
})();
