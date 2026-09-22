/* ═══════════════════════════════════════════════════════════════════════════════
   🧵 СТИКЕРИТЕ · емоджито в началото на бутона отива в кремав кръг (css/pl-ui.css .pl-em)
   МЕРЕНО (dom_emoji.js): 792 бутона в 9-те стаи започват с емоджи, 317 различни — дълга опашка,
   плюшена рисунка за всяко е невъзможна; кръгът ги прави ЕДИН език с плюшените иконки.
   Честите (📍 251, 🎤 33, ➤) са линейни иконки в CSS — тук не се пипат.
   КАК: само първият текстов възел на бутона, само ако започва с емоджи. textContent остава
   СЪЩИЯТ (емоджито е в <span>), значи код, който чете текста на бутона, не забелязва нищо.
   Код, който пише наново текста (textContent = …), маха кръга → наблюдателят го връща.
   🪤 Писането е мутация → обработеният бутон се маркира (data-plem) и пак се проверява
   само дали кръгът още е там — иначе вечен кръг от мутации.
   ПЪТ НАЗАД: махни <script src="js/pl-ui.js">.
   ═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.BL_PL_UI) return;
  const КЛАСОВЕ = '.jr-chip, .jr-btn, .ro-chip, .wt-o, .set-tgl, .plus-item, .shm-btn, .fa-chip, .hs-chip, .toc-b, .jr-winbtn, .onb-sexbtn, .bb-sexbtn, .sos-big, .gr-open, .td-chip, .t8-chip, .ch-add-b';
  const ЕМ = /^(\s*)(\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}|\p{Emoji_Modifier}|️⃣)*)/u;
  // 🪤 textContent трябва да остане БАЙТ В БАЙТ същият („🌱 8с“, не „🌱8с“) — код сравнява
  //   текста на бутони. Затова интервалите остават в текстовите възли, пипа се само емоджито.
  function обвий(б) {
    if (б.querySelector(':scope > .pl-em')) return;               // вече има кръг
    const п = б.firstChild;
    if (!п || п.nodeType !== 3) return;                          // започва с елемент — не пипаме
    const м = п.nodeValue.match(ЕМ);
    if (!м) return;
    const преди = б.textContent;
    const с = document.createElement('span');
    с.className = 'pl-em'; с.setAttribute('aria-hidden', 'true'); с.textContent = м[2];
    if (м[1]) б.insertBefore(document.createTextNode(м[1]), п);
    п.nodeValue = п.nodeValue.slice(м[0].length);
    б.insertBefore(с, п);
    if (б.textContent !== преди) { console.warn('pl-ui: текстът на бутона се промени — връщам', преди); б.textContent = преди; return; }
    б.setAttribute('data-plem', '1');
  }
  function мини(корен) { (корен || document).querySelectorAll(КЛАСОВЕ).forEach(обвий); }
  let чака = false;
  function отложено() { if (чака) return; чака = true; setTimeout(() => { чака = false; мини(document); }, 60); }
  function върви() {
    мини(document);
    // само childList: `textContent = …` сменя възела (childList); characterData би будил всяка секунда от таймерите
    new MutationObserver(отложено).observe(document.body, { childList: true, subtree: true });
  }
  // 🐣 подскокът на плюшената иконка при докосване — едно делегирано слушане за целия документ;
  //   класът се маха на animationend, за да може следващото докосване да подскочи пак.
  const ИКОНА = '.pl-ti, .pl-art, .pl-fi, .pl-em, .pl-arch img, .pl-tt-i i';
  const ДОКОСВАЕМО = '.sec-chip[data-pl], .pl-day-it, .pl-room, .dv-firstrow, .jr-chip, .jr-btn, .pl-soft, .pl-gel, .sos-big, button';
  document.addEventListener('pointerdown', e => {
    const б = e.target.closest && e.target.closest(ДОКОСВАЕМО); if (!б) return;
    const и = б.querySelector(ИКОНА); if (!и) return;
    и.classList.remove('pl-hop'); void и.offsetWidth; и.classList.add('pl-hop');
  }, { passive: true });
  document.addEventListener('animationend', e => { if (e.animationName === 'plHop' && e.target.classList) e.target.classList.remove('pl-hop'); }, true);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', върви); else върви();
  window.BL_PL_UI = { мини };
})();
