// ═══════════════════════════════════════════════════════════
// 🔇 БЕЗ МАШИНЕН ГЛАС (25.11.2026)
//
// Собственикът: „говор в платформата не го искам, особено ако е мъжки —
// да се махне веднага“. Бутоните за четене и пеене на глас са махнати
// (статия, приказка, приспивни, още песнички, звуците на животните),
// а изборът на глас в „Инструменти“ го няма.
// Този файл е мрежата: каквото и да се опита да говори, мълчи.
// ЕДИНСТВЕНОТО ИЗКЛЮЧЕНИЕ: звуците на животните в игрите („Мууу“, „Бау-бау“)
// — собственикът, 25.11: „звуците на животните върни ги, тях може“.
// Те минават през BL_ZVUK (български глас, женски, ако телефонът има).
// Записът с гласа на мама (MediaRecorder) не минава оттук и остава.
//
// ПЪТ НАЗАД: git revert на комита от 25.11 (старият файл избираше женски глас).
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';
  try {
    if (window.speechSynthesis && typeof window.SpeechSynthesisUtterance === 'function') {
      var S = window.speechSynthesis;
      var истински = S.speak.bind(S);
      var ЖЕНСКИ = /daria|kalina|female|жен/i;
      var глас = function () {
        try {
          var bg = (S.getVoices() || []).filter(function (г) { return String(г.lang || '').toLowerCase().indexOf('bg') === 0; });
          return bg.filter(function (г) { return ЖЕНСКИ.test(г.name); })[0] || bg[0] || null;
        } catch (e) { return null; }
      };
      // само за звуците на животните
      window.BL_ZVUK = function (текст) {
        try {
          S.cancel();
          var u = new window.SpeechSynthesisUtterance(String(текст));
          var г = глас(); if (г) u.voice = г;
          u.lang = 'bg-BG'; u.rate = 0.75; u.pitch = 1.4;
          истински(u);
        } catch (e) {}
      };
      S.cancel();
      S.speak = function () {};
    }
  } catch (e) {}
  try { localStorage.removeItem('bl_glas'); } catch (e) {}
})();
