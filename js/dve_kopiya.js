// ═══════════════════════════════════════════════════════════
// 👯 ДВЕ КОПИЯ НА ЕДНО МЯСТО — тихият губител на записи
//
// ДОКАЗАНО НА ЖИВО 25.08.2026 с два отворени екземпляра на приложението:
//     екземпляр А отваря стая и ПРОЧИТА страховете → [страх 1]
//     екземпляр Б (другото копие) записва → [страх 1, страх 2]
//     екземпляр А добавя към ЗАСТОЯЛОТО си копие и записва → [страх 1, страх 3]
//     мама е написала ТРИ неща. Останаха ДВЕ. „Страх 2" изчезна безшумно.
//
// ЗАЩО СЕ СЛУЧВА: 236 места в проекта правят „прочети → промени → запиши".
// Прочетеното живее в паметта на страницата. Другото копие не го знае.
// Класически случай, но тук е НЕИЗБЕЖЕН: приложението се раздава С ЛИНК.
// Мама има иконка на екрана И понякога пак натиска линка от чата — това
// вече са два екземпляра върху едно хранилище.
//
// ЗАЩО НЕ СЕ ПОПРАВЯ „КАКТО ТРЯБВА":
// Истинското решение е всеки от 236-те да чете прясно и да слива. Това е
// пренаписване на половината приложение и всяка стъпка носи риск да счупи
// нещо работещо. А цената на бездействието е ТИХА загуба.
// Затова тук се прави най-малкото нещо, което маха ТИШИНАТА: щом другото
// копие запише нещо, ТОВА копие го КАЗВА и предлага презареждане.
// Мама не губи нищо, без да разбере.
//
// 🪤 КАПАНИТЕ, ОБМИСЛЕНИ ПРЕДИ ДА СЕ НАПИШЕ:
//   · Събитието `storage` НЕ се обажда в раздела, който е записал — само в
//     другите. Точно това ни трябва; иначе всяко наше записване би вдигало
//     собствената си тревога.
//   · НЕ прекъсваме майката, докато ПИШЕ. Ако курсорът е в поле с текст,
//     лентата ЧАКА. Съобщение, което изскача върху недописано изречение, е
//     по-лошо от самия проблем.
//   · НЕ презареждаме сами. Презареждане би изтрило недописаното. Решението
//     е нейно, с бутон.
//   · Казва се ВЕДНЪЖ. Другото копие може да пише по десет пъти в минута.
//   · Този файл САМ не пише нищо в паметта — иначе би вдигал тревога в
//     другото копие и двете биха се будили взаимно до безкрай.
//   · Ключове, които не са данни на майката (теми, брояч на посещения), не
//     вдигат тревога — иначе лентата ще излиза при всяко дребно нещо.
//
// ПРОВЕРКА: node dev/test_dve_kopiya.js
// ПЪТ НАЗАД: махни реда за този файл от index.html. Нищо не зависи от него.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  // ключове, които НЕ са написаното от майката — те не заслужават тревога
  const БЕЗ_ТРЕВОГА = /^bl_(theme|tema|room_visited|room_asked|seen|surfaced|folds|folddefaults|fskeep|sounds|tone_off|night|last|demo_keys|play_favs)/;

  let казано = false;
  let чака = false;
  let сменени = new Set();

  const пишеЛиСега = () => {
    const a = document.activeElement;
    if (!a) return false;
    const т = a.tagName;
    if (т !== 'INPUT' && т !== 'TEXTAREA' && !a.isContentEditable) return false;
    // празно поле не е „пише" — там прекъсването не струва нищо
    return !!(a.value || a.textContent || '').trim();
  };

  function лента() {
    if (казано) return;
    if (пишеЛиСега()) { чака = true; return; }   // изчакваме да свърши изречението
    казано = true;

    const л = document.createElement('div');
    л.setAttribute('role', 'status');
    л.style.cssText = 'position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));' +
      'z-index:99999;background:#fff7ed;color:#7c2d12;border:1px solid #fdba74;border-radius:14px;' +
      'padding:12px 14px;box-shadow:0 8px 24px rgba(0,0,0,.18);font-size:15px;line-height:1.45;' +
      'max-width:520px;margin:0 auto;display:flex;flex-direction:column;gap:10px';

    const т = document.createElement('p');
    т.style.cssText = 'margin:0';
    т.innerHTML = '👯 <strong>Бейби Ленд е отворен и на друго място</strong> — там току-що се ' +
      'записа нещо ново. Ако продължиш тук, новото може да се изгуби. ' +
      'Презареди, за да виждаш всичко.';

    const ред = document.createElement('div');
    ред.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap';

    const през = document.createElement('button');
    през.type = 'button';
    през.textContent = '🔄 Презареди тук';
    през.style.cssText = 'min-height:44px;padding:10px 16px;border-radius:12px;border:0;' +
      'background:#c2410c;color:#fff;font-weight:600;font-size:15px;cursor:pointer';
    през.addEventListener('click', () => { try { location.reload(); } catch (e) {} });

    const по = document.createElement('button');
    по.type = 'button';
    по.textContent = 'Не сега';
    по.style.cssText = 'min-height:44px;padding:10px 16px;border-radius:12px;' +
      'border:1px solid #fdba74;background:transparent;color:#7c2d12;font-size:15px;cursor:pointer';
    по.addEventListener('click', () => { try { л.remove(); } catch (e) {} });

    ред.appendChild(през); ред.appendChild(по);
    л.appendChild(т); л.appendChild(ред);
    document.body.appendChild(л);
    try { през.focus(); } catch (e) {}
  }

  // Когато мама спре да пише, чакащата лента се показва.
  // 🪤 ТУК ПЪРВО ПИСАХ setTimeout(…, 200) И ЛЕНТАТА НЕ ИДВАШЕ ИЗОБЩО.
  //   Причината е измерена днес в този проект: в скрит раздел браузърът
  //   подравнява таймерите — setTimeout(160) отне 3159 мс, а по-късно и
  //   до минута. setTimeout(0) обаче НЕ се дроселира (измерено: 0 мс).
  //   Затова тук няма закъснение: нулевият таймер пак изчаква текущата
  //   задача да свърши (фокусът вече се е преместил), но не зависи от
  //   милисекунди. Ако мама е скочила в ДРУГО поле с текст, лента() пак
  //   ще види това и ще изчака — проверката е в нея, не в закъснението.
  const скороЛента = function () { if (чака) setTimeout(лента, 0); };
  document.addEventListener('blur', скороЛента, true);
  document.addEventListener('focusout', скороЛента, true);
  document.addEventListener('pointerdown', скороЛента, true);
  document.addEventListener('visibilitychange', function () { if (чака && !document.hidden) лента(); });

  window.addEventListener('storage', function (e) {
    // key === null значи, че другото копие е изчистило ВСИЧКО — това е тревога
    if (e.key !== null) {
      if (String(e.key).indexOf('bl_') !== 0) return;
      if (БЕЗ_ТРЕВОГА.test(e.key)) return;
      if (e.oldValue === e.newValue) return;       // нищо не се е променило
      сменени.add(e.key);
    }
    лента();
  });

  window.BL_ДВЕ_КОПИЯ = {
    сменени: function () { return [...сменени]; },
    казано: function () { return казано; },
    чака: function () { return чака; },
    // за уреда: подава събитие, все едно е дошло от другото копие
    пробвай: function (ключ, старо, ново) {
      window.dispatchEvent(Object.assign(new Event('storage'), { key: ключ, oldValue: старо, newValue: ново }));
    }
  };
})();
