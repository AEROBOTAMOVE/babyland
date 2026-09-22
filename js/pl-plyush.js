/* ═══════════════════════════════════════════════════════════════════════════════
   🧸 ПЛЮШЕНИТЕ ВМЕСТО ЕМОДЖИТАТА · 22.09.2026
   В стаите има ~530 емоджита в интерфейса: медальонът на всяка карта (span.jr-medal, polish.js),
   стикерите по бутоните и чиповете (span.pl-em, js/pl-ui.js), плочките на „Днес“. В референциите
   НЯМА емоджита — там всичко е плюшена рисунка. Тук всяко познато емоджи получава своята клетка
   от листовете img/art/ico-a…h.webp (4×4), fig-a.webp (4×2), statii-t.webp (4×4).
   🪤 ТЕКСТЪТ НЕ СЕ ПИПА: емоджито си остава в textContent (код по стаите сравнява заглавия на карти
   и бутони), само се скрива визуално (color: transparent) и отгоре ляга рисунката. Непознато
   емоджи си остава емоджи — по-добре, отколкото сгрешена рисунка.
   ПЪТ НАЗАД: махни <link>/<script> на pl-plyush от index.html.
   ═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.BL_PL_PLYUSH) return;

  // емоджи → [лист, ред, колона, тон]. Листовете: a…h = ico-*.webp (4×4), x = fig-a.webp (4×2), t = statii-t.webp (4×4)
  const ТОН = { p: '#fde6ef', s: '#dfeafb', m: '#dff2e7', l: '#ece4f8', b: '#fff0d4', c: '#fde5d8' };
  const К = {
    '🍼': ['a', 1, 0, 'p'], '🌙': ['a', 1, 1, 's'], '😴': ['a', 1, 1, 's'], '💤': ['a', 1, 1, 's'], '🛌': ['a', 1, 1, 's'],
    '📏': ['f', 0, 1, 'b'], '📐': ['f', 0, 1, 'b'], '⚖️': ['d', 2, 3, 's'], '👶': ['d', 0, 1, 'p'], '🧸': ['d', 0, 3, 'c'],
    '🌸': ['a', 0, 0, 'p'], '🌼': ['f', 2, 1, 'm'], '💐': ['f', 2, 1, 'm'], '📅': ['a', 0, 1, 'p'], '🗓️': ['a', 0, 1, 'p'],
    '👜': ['f', 3, 0, 'p'], '🎒': ['f', 3, 0, 'p'], '💌': ['a', 0, 3, 'p'], '✉️': ['a', 0, 3, 'p'], '📨': ['a', 0, 3, 'p'],
    '🥄': ['f', 2, 2, 'b'], '🍽️': ['f', 1, 2, 'm'], '🥦': ['f', 1, 2, 'm'], '🍓': ['a', 2, 1, 'p'], '🥕': ['a', 2, 1, 'c'],
    '🍲': ['f', 1, 0, 'c'], '🍚': ['f', 1, 0, 'c'], '📝': ['b', 0, 3, 'l'], '✍️': ['b', 0, 3, 'l'], '📒': ['f', 1, 3, 'p'],
    '📓': ['f', 1, 3, 'p'], '📔': ['h', 2, 0, 's'], '📖': ['h', 2, 0, 's'], '📚': ['h', 2, 0, 's'], '📗': ['h', 2, 1, 's'],
    '📋': ['f', 2, 0, 'p'], '✅': ['f', 3, 2, 'm'], '☑️': ['f', 3, 2, 'm'], '🗒️': ['f', 3, 2, 'b'],
    '🚨': ['a', 3, 0, 'c'], '🆘': ['a', 3, 0, 'c'], '🌡️': ['a', 3, 1, 's'], '🩺': ['a', 3, 2, 'm'], '💊': ['b', 0, 0, 'm'],
    '🩹': ['b', 0, 0, 'm'], '🏥': ['b', 0, 0, 'm'], '💉': ['g', 1, 1, 'c'], '🛡️': ['a', 3, 3, 'm'],
    '💚': ['b', 0, 1, 'm'], '💙': ['b', 0, 1, 's'], '💛': ['b', 0, 1, 'b'], '🧡': ['b', 0, 1, 'c'], '🤎': ['b', 0, 1, 'c'], '🖤': ['b', 0, 1, 'l'],
    '💜': ['b', 0, 1, 'l'], '💗': ['b', 0, 1, 'p'], '💖': ['b', 0, 1, 'p'], '❤️': ['b', 0, 1, 'p'], '💕': ['c', 2, 1, 'p'],
    '💞': ['c', 2, 1, 'p'], '🤍': ['g', 2, 0, 'p'], '💝': ['c', 3, 3, 'p'],
    '📸': ['b', 1, 1, 'p'], '📷': ['b', 1, 1, 'p'], '🖼️': ['b', 1, 0, 'l'], '🎨': ['b', 2, 2, 'l'], '🖌️': ['b', 2, 2, 'l'],
    '🔒': ['b', 1, 2, 'l'], '🔑': ['c', 1, 2, 'b'], '🗝️': ['c', 1, 2, 'b'], '📍': ['c', 3, 2, 'p'], '📌': ['c', 3, 2, 'p'],
    '💬': ['d', 1, 1, 's'], '🗨️': ['c', 2, 0, 's'], '💭': ['c', 2, 0, 's'], '❓': ['g', 0, 2, 's'], '❔': ['g', 0, 2, 's'],
    '⭐': ['b', 2, 1, 'b'], '🌟': ['b', 2, 1, 'b'], '✨': ['b', 2, 1, 'b'], '🌞': ['d', 0, 0, 'b'], '☀️': ['d', 0, 0, 'b'],
    '🎈': ['c', 1, 3, 'p'], '🎁': ['c', 3, 3, 'p'], '🎉': ['c', 1, 3, 'p'], '🎀': ['d', 3, 1, 'p'],
    '🧿': ['c', 3, 0, 'l'], '🔮': ['h', 1, 2, 'l'], '🔬': ['c', 2, 3, 'l'], '🧪': ['c', 2, 3, 'l'], '🔍': ['c', 3, 1, 's'],
    '🔎': ['c', 3, 1, 's'], '🕵️': ['h', 1, 1, 'l'], '👵': ['h', 0, 0, 'l'], '👩': ['g', 1, 2, 'p'], '🤱': ['t', 0, 2, 'p'],
    '🤰': ['g', 0, 0, 'p'], '🦶': ['g', 1, 3, 'p'], '👣': ['g', 1, 3, 'p'], '🦷': ['t', 1, 0, 's'], '🪥': ['t', 1, 0, 's'],
    '🛁': ['t', 2, 0, 's'], '🧴': ['t', 2, 0, 's'], '🚼': ['t', 1, 3, 'm'], '👕': ['b', 3, 3, 'p'], '👗': ['b', 3, 3, 'p'],
    '🧦': ['d', 1, 2, 'p'], '👟': ['c', 1, 0, 'p'], '🚶': ['t', 2, 1, 'm'], '🌳': ['t', 2, 1, 'm'], '🌿': ['e', 3, 2, 'm'],
    '🍵': ['b', 2, 3, 'c'], '☕': ['b', 2, 3, 'c'], '🕯️': ['c', 1, 1, 'b'], '🔦': ['c', 0, 1, 'b'], '💡': ['c', 0, 1, 'b'],
    '⏱️': ['f', 2, 3, 's'], '⏲️': ['f', 2, 3, 's'], '⌛': ['f', 2, 3, 's'], '⏰': ['h', 3, 1, 'p'], '🕛': ['h', 3, 1, 'p'],
    '🧰': ['c', 0, 2, 'l'], '🛠️': ['c', 0, 2, 'l'], '🧺': ['a', 0, 2, 'c'], '🛒': ['f', 3, 3, 'p'], '💰': ['a', 1, 3, 'b'],
    '🏦': ['a', 1, 3, 'b'], '📂': ['c', 0, 0, 'p'], '📁': ['c', 0, 0, 'p'], '📄': ['b', 0, 3, 'l'], '🗂️': ['c', 0, 0, 'p'],
    '🧩': ['b', 2, 0, 's'], '🎲': ['b', 2, 0, 's'], '🪀': ['d', 3, 1, 'p'], '🧷': ['d', 3, 2, 'p'], '🐣': ['x', 1, 2, 'b'],
    '🐤': ['x', 1, 2, 'b'], '🐰': ['g', 2, 2, 'p'], '🐻': ['x', 0, 3, 'c'], '🦒': ['d', 2, 2, 'b'], '🦆': ['d', 2, 0, 'b'],
    '🚑': ['a', 3, 0, 'c'], '🤒': ['a', 3, 1, 's'], '🤧': ['a', 3, 1, 's'], '😷': ['a', 3, 1, 's'],
    '💧': ['c', 2, 3, 's'], '📊': ['b', 3, 1, 's'], '📈': ['b', 3, 1, 's'], '🕐': ['h', 3, 1, 'p'], '🏆': ['c', 2, 2, 'b'], '🥇': ['c', 2, 2, 'b'],
    '🌷': ['a', 0, 0, 'p'], '🌹': ['a', 0, 0, 'p'], '🌻': ['f', 2, 1, 'b'], '🌱': ['f', 0, 2, 'm'], '🪴': ['f', 0, 2, 'm'], '🔥': ['c', 1, 1, 'c'],
    '🧺': ['a', 0, 2, 'c'], '🍫': ['d', 1, 3, 'c'], '🎂': ['d', 1, 3, 'p'], '🧁': ['d', 1, 3, 'p'], '🛏️': ['t', 0, 0, 's'], '🚼': ['t', 1, 3, 'm'],
    '🌈': ['b', 1, 3, 'm'], '☁️': ['b', 0, 2, 's'], '🌬️': ['b', 0, 2, 's'], '🫧': ['b', 0, 2, 's'],
  };
  const ЛИСТ = { a: 'ico-a', b: 'ico-b', c: 'ico-c', d: 'ico-d', e: 'ico-e', f: 'ico-f', g: 'ico-g', h: 'ico-h', x: 'fig-a', t: 'statii-t' };
  const ЕМ = /^\s*(\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}|\p{Emoji_Modifier}|️⃣)*)/u;
  //  .pg20-fruit = едрата рисунка в картата на възрастта (rooms2.js); .ask-badge е ИЗКЛЮЧЕН — той е
  //  лицето на помощничката и се сменя с героинята по стаята (css/pl-figuri.css)
  const ЦЕЛИ = '.jr-medal, .pl-em, .pg20-fruit, .bb-big, .td-big';

  function стил(е, р) {
    const [л, ред, кол, т] = р;
    const y = л === 'x' ? ред * 100 : ред * 100 / 3;
    е.style.backgroundImage = 'url(img/art/' + ЛИСТ[л] + '.webp)';
    е.style.backgroundPosition = (кол * 100 / 3).toFixed(3) + '% ' + y.toFixed(3) + '%';
    е.style.backgroundSize = л === 'x' ? '400% 200%' : '400% 400%';
    е.style.setProperty('--pl-plt', ТОН[т] || ТОН.p);
    е.classList.add('pl-pl', л === 'x' ? 'pl-pl-x' : 'pl-pl-i');
  }
  function плюш(е) {
    if (е.dataset.plPl) return;
    const м = (е.textContent || '').match(ЕМ);
    const р = м && К[м[1]];
    е.dataset.plPl = р ? '1' : '0';                    // '0' = познато чуждо емоджи, не го гледаме пак
    if (р) стил(е, р);
  }
  // ── 2 · емоджито ВЪТРЕ в текста на бутон/заглавие: обвива се в кръгче (както pl-ui.js) и става плюш.
  //   🪤 textContent се сверява БАЙТ В БАЙТ и при разлика обвиването се връща — код по стаите
  //   сравнява текста на бутони и заглавия на карти.
  //   Дребните служебни бутони (карфица, сгъване, микрофон, телефон, плаващото балонче) НЕ се пипат —
  //   при тях емоджито е самата иконка и има своя рисунка/размер.
  const ОБВИЙ = '#roRoom .jr-sub, #roRoom .sec-head, #roRoom .zd-row, #roRoom .jr-note, #roRoom .bb-feed, #roRoom .rh-t, #roomOverlay .ro-lead, ' +
    '#roRoom button:not(.pin-btn):not(.fold-btn):not(.ask-mic):not(.sos-call):not(.ro-fab):not(.jr-winbtn), #roRoom .fa-e, #roRoom .lb-q, #roRoom .tl-nn, ' +
    // извън стаята: профилът, търсенето, листът „Добави“, изборът на стаи, СОС центърът
    '.prof-overlay button:not(.prof-close), .prof-overlay .pr-row, .prof-overlay .prof-tditem, .prof-overlay .prof-row, ' +
    '#searchOverlay .search-res, .np-b, #plDv button, .sos-ov .sos-row';
  function обвий(б) {
    if (б.dataset.plW) return;
    б.dataset.plW = '1';
    const п = б.firstChild;
    if (!п || п.nodeType !== 3) return;
    const м = п.nodeValue.match(/^(\s*)(\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}|\p{Emoji_Modifier}|️⃣)*)/u);
    if (!м || !К[м[2]]) return;
    const преди = б.textContent;
    const с = document.createElement('span'); с.className = 'pl-em'; с.setAttribute('aria-hidden', 'true'); с.textContent = м[2];
    if (м[1]) б.insertBefore(document.createTextNode(м[1]), п);
    п.nodeValue = п.nodeValue.slice(м[0].length);
    б.insertBefore(с, п);
    if (б.textContent !== преди) { б.textContent = преди; return; }   // не сме успели чисто → връщаме
    плюш(с);
  }
  // ── 3 · едрата самотна емоджи-рисунка (цял елемент = едно емоджи, ≥20px) ──
  const ЕДРИ = '#roRoom span, #roRoom i, #roRoom em, #roRoom strong, #plHome span, .prof-overlay span, .prof-overlay i, #searchOverlay span, #plDv span';
  const БЕЗ = '#roChat, #artBody, .msg, .ask-badge, input, textarea, .pl-em';
  function едро(е) {
    if (е.dataset.plPl || е.children.length) return;
    const т = (е.textContent || '').trim();
    if (!т || т.length > 8) return;
    const м = т.match(/^(\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}|\p{Emoji_Modifier}|️⃣)*)$/u);
    const р = м && К[м[1]];
    if (!р) return;
    if (е.closest(БЕЗ)) return;
    const фс = parseFloat(getComputedStyle(е).fontSize) || 0;
    if (фс < 20) return;
    е.dataset.plPl = '1'; стил(е, р);
    е.style.width = Math.round(фс * 1.25) + 'px'; е.style.height = Math.round(фс * 1.25) + 'px'; е.style.display = 'inline-block';
  }
  function мини(корен) {
    const к = корен && корен.querySelectorAll ? корен : document;
    if (к.querySelectorAll) {
      к.querySelectorAll(ЦЕЛИ).forEach(плюш);
      к.querySelectorAll(ОБВИЙ).forEach(обвий);
      к.querySelectorAll(ЕДРИ).forEach(едро);
    }
    if (к.matches && к.matches(ЦЕЛИ)) плюш(к);
  }
  let чака = false;
  function отложено() { if (чака) return; чака = true; setTimeout(() => { чака = false; мини(document); }, 80); }
  function върви() {
    мини(document);
    // pl-ui.js прави стикерите след своето отлагане (60 ms) → ние сме след него
    new MutationObserver(отложено).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', върви); else върви();
  window.BL_PL_PLYUSH = { мини, К };
})();
