// fa21 · само мери (21.10): кликва главните бутони на началото един по един и гледа дали нещо се сменя
// (отворен слой, тема, разгънат блок, брой видими елементи, скрол). След всеки — опит да се върне (Escape / ✕ / Назад).
(async () => {
  const п = ms => new Promise(r => setTimeout(r, ms));
  const вид = e => { if (!e) return false; const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) < 0.05) return false; const к = e.getBoundingClientRect(); return к.width > 2 && к.height > 2; };
  const слоеве = () => [...document.querySelectorAll('#roomOverlay,#searchOverlay,#artOverlay,#onbOverlay,.md-veil,[role="dialog"],.tour-ov,.pl-sheet,.bl-sheet,.dobavi,.pl-dobavi')].filter(e => !e.hidden && вид(e)).map(e => e.id || (typeof e.className === 'string' ? e.className.split(' ')[0] : e.tagName)).sort();
  const видими = () => { let n = 0; for (const e of document.querySelectorAll('#plHome *, #todaySection *')) if (e.getClientRects().length) n++; return n; };
  const подпис = () => ({ сл: слоеве().join(','), тема: document.documentElement.getAttribute('data-theme'), hash: location.hash, sy: Math.round(scrollY), вид: видими(), html: document.documentElement.className.split(/\s+/).length });
  const поТекст = (sel, re) => [...document.querySelectorAll(sel)].find(e => re.test(e.textContent) && вид(e));
  const цели = [
    ['Бебе-карта #plBaby', () => document.getElementById('plBaby')],
    ['Какво търсим днес? .pl-find', () => document.querySelector('#plHome .pl-find')],
    ['Хранене +', () => document.querySelector('#plHome .pl-day-it.t-feed')],
    ['Виж всички ›', () => поТекст('#plHome a, #plHome button, #plHome [role=button]', /Виж всички/)],
    ['Добави момент', () => document.querySelector('#plHome .pl-cta')],
    ['Важно днес', () => document.getElementById('plNapomni')],
    ['Стая „Моето бебе“', () => document.querySelector('#plHome .pl-room.c-baby')],
    ['Всички стаи отблизо', () => document.querySelector('#plHome [data-pl="vse"]')],
    ['Помощничка Мила', () => document.querySelector('#plHome .pl-per')],
    ['Попитай ›', () => document.querySelector('#plHome .pl-mira')],
    ['Минута за теб', () => поТекст('#todaySection button, #todaySection a, #todaySection [role=button]', /Минута за теб/)],
    ['Още 3 за бебето', () => поТекст('#todaySection button', /Още \d+ за/)],
    ['Как си днес?', () => поТекст('#todaySection button, #todaySection a', /Как си днес/)],
    ['Попитай помощничката (▾)', () => поТекст('.pl-svit-b', /Попитай помощничката/)]   // 15.11: текстът на бутона е сменен (bl-info),
    ['Бутон тема', () => document.getElementById('themeToggle')],
  ];
  const върни = async (пред) => {
    for (let i = 0; i < 3; i++) {
      if (подпис().сл === пред.сл) break;
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await п(300);
      const з = [...document.querySelectorAll('button,[role=button],a')].filter(e => вид(e) && (/^(✕|×|←|‹)/.test(e.textContent.trim()) || /Затвори|Назад|close/i.test((e.getAttribute('aria-label') || '') + ' ' + (e.id || '') + ' ' + (typeof e.className === 'string' ? e.className : ''))));
      const горе = з.sort((a, b) => (Number(getComputedStyle(b).zIndex) || 0) - (Number(getComputedStyle(a).zIndex) || 0))[0];
      if (горе) { горе.click(); await п(700); }
    }
    if (document.documentElement.getAttribute('data-theme') !== пред.тема) { const т = document.getElementById('themeToggle'); if (т) { т.click(); await п(500); } }
    scrollTo(0, 0); await п(300);
  };
  const рез = [];
  for (const [име, f] of цели) {
    const е = f();
    if (!е) { рез.push(име + ': НЯМА елемент'); continue; }
    е.scrollIntoView({ block: 'center' }); await п(400);
    const пред = подпис();
    е.click(); await п(1400);
    const след = подпис();
    const раз = Object.keys(пред).filter(k => пред[k] !== след[k]).map(k => k + ': ' + пред[k] + ' → ' + след[k]);
    рез.push(име + ': ' + (раз.length ? раз.join(' | ') : 'НИЩО не се смени'));
    await върни(пред);
    const пак = подпис();
    if (пак.сл !== пред.сл) рез.push('   ⚠ не се върна: ' + пак.сл);
  }
  return рез;
})()
