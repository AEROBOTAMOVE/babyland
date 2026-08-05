// ═══════════════════════════════════════════════════════════
// 🧪 СИНТАКСИС-ПАЗАЧ — всеки скрипт от index.html, парснат наживо
//
// Защо съществува: 29.07 добавих `const ВИДЕНИ` в js/iface.js, без да
// видя, че същото име вече е обявено 27 реда по-долу. Дублираният
// `const` е СИНТАКТИЧНА грешка — целият файл спира да се изпълнява.
// Конзолата беше празна (грешката е при парсване, преди старта), в
// приложението нищо видимо не се счупи, а `window.BL_IFACE` просто
// го нямаше. Загубих двайсет минути да търся логическа причина за
// нещо, което е било печатна грешка.
//
// От този клас грешки браузърът не се оплаква на глас. Питаш ли го
// изрично — казва точно кой файл и защо.
//
// ⚠️ НЕ СЕ ЗАРЕЖДА в index.html.
//     await (await fetch('dev/sintaksis.js')).text().then(eval);
//     await BL_SYNTAX.провери()
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  async function провери() {
    const скриптове = [...document.querySelectorAll('script[src]')]
      .map(s => s.getAttribute('src'))
      .filter(s => s && !/^https?:/.test(s));
    const счупени = [], липсващи = [], чисти = [];
    for (const път of скриптове) {
      let код;
      try {
        const r = await fetch(път.split('?')[0] + '?синт=' + Math.random());
        if (!r.ok) { липсващи.push(път + ' → HTTP ' + r.status); continue; }
        код = await r.text();
      } catch (e) { липсващи.push(път + ' → ' + e.message); continue; }
      try { new Function(код); чисти.push(път); }
      catch (e) { счупени.push({ файл: път, грешка: e.message }); }
    }

    // втора проверка: файлът се е изпълнил ДОКРАЙ? (изнесъл ли си е глобала)
    const ОЧАКВАНИ = {
      'js/helper.js': 'MamaHelper', 'js/kb.js': 'KB', 'js/lib.js': 'BL_LIB',
      'js/articles.js': 'BL_ARTICLES', 'js/iface.js': 'BL_IFACE',
      'js/smalltalk.js': 'BL_SMALLTALK', 'js/smalltalk2.js': 'BL_SMALLTALK2',
      'js/sos.js': 'BL_SOS_CENTER', 'js/fx.js': 'BL_FX', 'js/store.js': 'BL_STORE',
      'js/river.js': 'BL_RIVER', 'js/reader.js': 'BL_READER', 'js/roommap.js': 'BL_ROOMMAP'
    };
    const немии = [];
    Object.keys(ОЧАКВАНИ).forEach(ф => {
      const има = скриптове.some(s => s.split('?')[0] === ф);
      if (има && !window[ОЧАКВАНИ[ф]]) немии.push(ф + ' → window.' + ОЧАКВАНИ[ф] + ' липсва');
    });

    const доклад = {
      проверени: скриптове.length,
      чисти: чисти.length,
      СЧУПЕН_СИНТАКСИС: счупени,
      НЕЗАРЕДЕНИ: липсващи,
      НЕДОИЗПЪЛНЕНИ: немии
    };
    const зле = счупени.length + липсващи.length + немии.length;
    console.log(зле ? '🔴 ' + зле + ' проблема' : '✅ всички ' + чисти.length + ' скрипта са чисти', доклад);
    return доклад;
  }

  window.BL_SYNTAX = { провери };
})();
