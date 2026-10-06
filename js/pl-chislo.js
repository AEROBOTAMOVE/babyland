/* ═══════════════════════════════════════════════════════════════════════════════
   🔢 ЖИВИТЕ ЧИСЛА · 06.10.2026
   Всяко число, което се сменя ВЕДНАГА СЛЕД докосване на майката, „подскача“
   (css/pl-chislo.css). Така броячът казва „хванах го“ без нито една дума.

   ЗАЩО ПРЕЗ ДОКОСВАНЕТО: таймерите (кърмене, сън, часовникът) сменят числата
   сами, всяка секунда. Ако подскачаха и те, екранът щеше да трепери. Затова
   анимацията тръгва само ако числото се е сменило до 700 ms след натискане.

   СТАРИЯТ КОД НЕ СЕ ПИПА: той си пише textContent както винаги; тук само гледаме
   (MutationObserver) и слагаме клас. Текстът не се променя — числото си е същото.
   ПЪТ НАЗАД: махни <link>/<script> на pl-chislo от index.html.
   ═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.BL_PL_CHISLO) return;

  var ПРОЗОРЕЦ = 700;                 // ms след докосване, в които смяната е „нейна“
  var последно = 0;
  // „0“, „12“, „120 мл“, „3/20“, „2,5 кг“, „+30“, „00:12“ — кратко и само число с мерна единица
  var ЧИСЛО = /^\s*[−+-]?\d[\d\s.,:/]*\s*(мл|г|кг|см|мин|ч|бр|%)?\s*$/;

  function отбележи() { последно = Date.now(); }
  document.addEventListener('pointerup', отбележи, true);
  document.addEventListener('click', отбележи, true);
  document.addEventListener('keyup', отбележи, true);

  function стойност(т) { var м = String(т).replace(/\s/g, '').replace(',', '.').match(/[−+-]?\d+(\.\d+)?/); return м ? parseFloat(м[0].replace('−', '-')) : NaN; }

  function подскочи(е, преди, сега) {
    var нагоре = isNaN(преди) || isNaN(сега) || сега >= преди;
    е.style.setProperty('--pl-dir', нагоре ? '1' : '-1');
    if (getComputedStyle(е).display === 'inline') е.classList.add('pl-chislo-ib');
    е.classList.remove('pl-chislo-pop');
    void е.offsetWidth;                 // без това анимацията не се пуска наново
    е.classList.add('pl-chislo-pop');
  }

  // „собственият“ текст: само текстовите възли на елемента, без децата му —
  // така <div class="ml-big">60<small>мл днес</small></div> се чете като „60“
  function свойТекст(е) {
    var т = '';
    for (var н = е.firstChild; н; н = н.nextSibling) if (н.nodeType === 3) т += н.textContent;
    return т.trim();
  }

  // Къде е числото в елемента? Три вида, всичките мерени в „Моето бебе“:
  //   <span class="bb-dipnum">1</span>                 — самият елемент е числото
  //   <div>60<small>мл днес</small></div>              — числото е собственият текст
  //   <div class="ml-big"><strong>60</strong> мл днес</div>  — числото е в ДЕТЕ, а старият
  //       код подменя цялото вътре (innerHTML), значи детето е НОВО, не „сменено“
  function числоВ(е) {
    if (!е.children.length) { var а = (е.textContent || '').trim(); return а.length <= 12 && ЧИСЛО.test(а) ? { ел: е, т: а } : null; }
    if (е.children.length > 3) return null;
    var свой = свойТекст(е);
    if (свой && свой.length <= 12 && ЧИСЛО.test(свой)) return { ел: е, т: свой };
    for (var к = 0; к < е.children.length; к++) {
      var д = е.children[к];
      if (д.children.length) continue;
      var т = (д.textContent || '').trim();
      if (т && т.length <= 12 && ЧИСЛО.test(т)) return { ел: д, т: т };
    }
    return null;
  }

  var наблюдател = new MutationObserver(function (записи) {
    if (Date.now() - последно > ПРОЗОРЕЦ) return;
    var видени = [];
    for (var i = 0; i < записи.length; i++) {
      var з = записи[i];
      var е = з.type === 'characterData' ? з.target.parentElement : з.target;
      if (!е || е.nodeType !== 1 || видени.indexOf(е) > -1) continue;
      видени.push(е);
      var н = числоВ(е);
      if (!н) continue;
      // предишната стойност: запомнената, иначе числото в току-що махнатото
      var махнато = '';
      if (з.type === 'characterData') махнато = з.oldValue || '';
      else for (var к = 0; к < з.removedNodes.length; к++) махнато += ' ' + (з.removedNodes[к].textContent || '');
      var предиЧ = е.dataset.plChislo !== undefined ? стойност(е.dataset.plChislo) : стойност(махнато);
      var сегаЧ = стойност(н.т);
      е.dataset.plChislo = н.т;
      if (isNaN(предиЧ) || предиЧ === сегаЧ) continue;      // първо рисуване или същото число — не подскача
      подскочи(н.ел, предиЧ, сегаЧ);
    }
  });

  function пусни() {
    наблюдател.observe(document.body, { subtree: true, childList: true, characterData: true, characterDataOldValue: true });
  }
  if (document.body) пусни(); else document.addEventListener('DOMContentLoaded', пусни);
  window.BL_PL_CHISLO = { подскочи: подскочи };
})();
