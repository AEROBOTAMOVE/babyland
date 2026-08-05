// ═══════════════════════════════════════════════════════════
// 🖨️ ПЕЧАТАЕМАТА КУТИЯ (план 19, част 5.1) — в Инструменти
//
// 8 неща за печат живееха разпръснати из 7 различни стаи — мама нямаше
// шанс да си спомни, че „Наръчникът за близките“ е в Инструменти →
// Бабина проверка. Тук стоят на едно място. Бутонът НЕ дублира логиката
// на всяка карта (числата зависят от нейни собствени избори) — отвежда я
// точно до истинския бутон, в истинската стая, и го подсветва.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const card = t => { const c = el('section', 'jr-card'); c.appendChild(el('h4', 'jr-title', t)); return c; };
  const sub = s => '<span class="jr-sub">' + s + '</span>';

  const ПЕЧАТАЕМИ = [
    { e: '🧳', label: 'План за раждане', room: 'Бременност', match: /План за раждане/ },
    { e: '⚠️', label: 'Алергия-паспорт', room: 'Захранване', match: /Алергия-паспорт/ },
    { e: '🩺', label: 'Бележка за прегледа', room: 'Здраве и SOS', match: /Бележка за прегледа/ },
    { e: '👵', label: 'Картичка за бабата', room: 'Инструменти', match: /Картичка за бабата/ },
    { e: '📅', label: 'Какво предстои (30 дни)', room: 'Инструменти', match: /Какво предстои/ },
    { e: '📄', label: 'CV на майката', room: 'Жената в мен', match: /CV на майката/ },
    { e: '📋', label: 'Досието на бебето', room: 'Лабораторията', match: /Досието/ },
    { e: '📖', label: 'Годишникът', room: 'Дневник на мама', match: /Годишник/ },
    // одит-флот П23, проход 2 №6: стаи 14-19 добавиха печатаеми, кутията
    // изостана. Заглавията са СВЕРЕНИ срещу реалните карти (грешен regex =
    // тихият провал от №16).
    { e: '🛒', label: 'Списък за пазар', room: 'Захранване', match: /Списък за пазар/ },
    { e: '📏', label: 'Ръстът на стената', room: 'Моето бебе', match: /Ръстът на стената/ },
    { e: '📓', label: 'Тетрадката', room: 'Лабораторията', match: /Тетрадката/ }
  ];

  function отидиИПечатай(п) {
    if (!window.MamaHelper) return;
    MamaHelper.open(п.room);
    setTimeout(() => {
      const cards = [...document.querySelectorAll('#roRoom .jr-card:not(.toc-card)')];
      const target = cards.find(c => { const t = c.querySelector('.jr-title'); return t && п.match.test(t.textContent); });
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        target.classList.add('pb-flash');
        setTimeout(() => target.classList.remove('pb-flash'), 1700);
      } else if (window.BL_FX && BL_FX.cheer) {
        // №16: преименувана/скрита карта → не мълчим, а казваме къде е
        BL_FX.cheer('Картата е в тази стая — превърти надолу 👇');
      }
    }, 60);
  }

  function printBoxCard() {
    const c = card('Печатаемата кутия 🖨️ ' + sub('всичко за принтиране — на едно място'));
    c.appendChild(el('p', 'jr-privacy', 'Докосни едно, и те отвежда право при него — заедно с истинския бутон „Принтирай“.'));
    const g = el('div', 'pb-grid');
    // 🔴 05.08 (одит г14, №229): на пауза на очакването (загуба) картата „План
    //    за раждане“ вече я няма в стая Бременност — но плочката тук си стоеше
    //    и я хвърляше в стаята с „превърти надолу“ към нещо, което го няма.
    const наПауза = !!(window.BL_EXPECT && BL_EXPECT.paused && BL_EXPECT.paused());
    ПЕЧАТАЕМИ.forEach(п => {
      if (наПауза && п.room === 'Бременност') return;
      const b = el('button', 'pb-item', `<span class="pb-e">${п.e}</span><span class="pb-l">${п.label}</span><span class="pb-r">${п.room}</span>`);
      b.type = 'button';
      b.addEventListener('click', () => отидиИПечатай(п));
      g.appendChild(b);
    });
    c.appendChild(g);
    return c;
  }

  // 🔴 05.08 (одит г14, №306): printbox.js се зарежда СЛЕД polish.js, тоест
  //    `база` вече включва organize() — а organize снима децата на root и
  //    пренарежда по кътчета. Като добавяхме картата СЛЕД база(root), тя
  //    оставаше извън всички кътчета: без data-blkey, без сгъване и закачане,
  //    и извън броенето „Разгледани N от M“. Правилото за нея в order4.js
  //    (/печатаема/i → 'tb') не се задействаше никога.
  //    Затова я слагаме ПРЕДИ база(root) — organize я вижда и я прибира при
  //    останалите. (Редът на <script> в index.html го вдига главният.)
  const база = window.ROOM_FEATURES && window.ROOM_FEATURES['Инструменти'];
  if (база) window.ROOM_FEATURES['Инструменти'] = root => { root.appendChild(printBoxCard()); база(root); };
})();
