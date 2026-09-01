// ═══════════════════════════════════════════════════════════
// 🏖️ ПЯСЪЧНИКЪТ — зарежда js/kb.js + js/helper.js извън браузър
//
// 🔴 ЗАЩО Е ТУК (26.08.2026, платено с мъртъв пазач): този файл живееше във
//    ВРЕМЕННАТА папка на сесията. Днес тя се изчисти и `node dev/korpus350.js`
//    гръмна с „Cannot find module". Тоест ГЛАВНИЯТ ПАЗАЧ НА БЕЗОПАСНОСТТА —
//    онзи, който брои пропуснатите спешни случаи — беше невъзможно да се пусне,
//    а нищо не го обявяваше. Заедно с него висяха на същия файл:
//        dev/test_bremennost.js · dev/test_dv.js · dev/test_pauza.js
//        dev/test_prevenciya.js · dev/test_priznanie.js · dev/test_slepeni.js
//    Седем уреда, зависими от папка, която се трие. Уред, който не може да се
//    пусне, е нула — а тук нулата беше точно върху спешните случаи.
//
// ПОЛЗВАНЕ:
//     const { zaredi } = require('./pyasachnik.js');   // от dev/
//     const W = zaredi(null);                          // W.BL_MATCH, W.KB, …
//     const W2 = zaredi(src => src.replace('A', 'B')); // с подменен изходен код
//
// ПЪТ НАЗАД: файлът само ЧЕТЕ проекта и нищо не записва.
// ═══════════════════════════════════════════════════════════
const fs = require('fs');
const vm = require('vm');
const path = require('path');
// пътят е спрямо самия файл — уред, който работи само от една папка, не се пуска
const ROOT = path.resolve(__dirname, '..');

function ctx() {
  const w = {};
  Object.assign(w, {
    console, setTimeout, clearTimeout, setInterval, clearInterval,
    Math, JSON, Date, RegExp, String, Number, Object, Array, Boolean, Error,
    Map, Set, WeakMap, WeakSet, Promise, Intl, Symbol, Proxy, Reflect,
    encodeURIComponent, decodeURIComponent, isNaN, isFinite, parseInt, parseFloat
  });
  w.localStorage = { getItem: () => null, setItem() {}, removeItem() {}, clear() {}, key: () => null, length: 0 };
  w.document = {
    documentElement: {}, body: {}, head: {},
    createElement: () => ({ style: {}, classList: { add() {}, remove() {} }, appendChild() {}, setAttribute() {} }),
    getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
    addEventListener() {}, readyState: 'complete'
  };
  w.addEventListener = function () {};
  w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  w.requestAnimationFrame = f => setTimeout(() => f(Date.now()), 0);
  w.getComputedStyle = () => ({ getPropertyValue: () => '' });
  w.navigator = { userAgent: 'node', language: 'bg' };
  w.location = { href: 'http://localhost/', search: '', hash: '' };
  w.window = w;
  vm.createContext(w);
  w.globalThis = w;
  return w;
}

// patch = функция (изходен текст на helper.js) -> нов текст
function zaredi(patch) {
  const W = ctx();
  const kb = fs.readFileSync(path.join(ROOT, 'js/kb.js'), 'utf8');
  let hp = fs.readFileSync(path.join(ROOT, 'js/helper.js'), 'utf8');
  if (patch) hp = patch(hp);
  new vm.Script(kb, { filename: 'kb.js' }).runInContext(W);
  new vm.Script(hp, { filename: 'helper.js' }).runInContext(W);
  // отказва ШУМНО: уред, който продължи без BL_MATCH, ще брои нули и ще ги
  // обяви за чисто
  if (!W.BL_MATCH) throw new Error('BL_MATCH липсва — пясъчникът не се зареди');
  return W;
}

module.exports = { zaredi, ROOT };
