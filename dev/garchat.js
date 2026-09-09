// ⚡ ПАЗАЧ ЗА БРОЯЧА НА ГЪРЧА (js/garch.js)
//
// Това е екран, който майка ще гледа, докато детето ѝ се гърчи на пода.
// Мери се ТРИ неща и всяко от тях е причина файлът да съществува:
//   1. смятането на времето (числото, което тя ще каже на лекаря)
//   2. прагът от 5 минути — същият, който пише в собствената ни карта
//   3. че 112 е НА ЕКРАНА и че текстът е НАШИЯТ, не измислен
const fs = require('fs');
const vm = require('vm');

function възел() {
  const n = {
    className: '', innerHTML: '', textContent: '', hidden: false, type: '', href: '',
    classList: { _: new Set(), add(x) { this._.add(x); }, remove(...x) { x.forEach(y => this._.delete(y)); }, contains(x) { return this._.has(x); } },
    appendChild(c) { return c; }, insertBefore(c) { return c; }, remove() {},
    setAttribute() {}, addEventListener() {}, querySelector: () => възел(), querySelectorAll: () => [],
    style: {},
  };
  return n;
}
const пам = new Map();
const w = {
  document: {
    createElement: възел, body: { appendChild() {}, style: {} },
    addEventListener() {}, removeEventListener() {},
    querySelector: () => null, getElementById: () => null, hidden: false,
  },
  localStorage: {
    getItem: k => (пам.has(k) ? пам.get(k) : null), setItem: (k, v) => пам.set(String(k), String(v)),
    removeItem: k => пам.delete(k), clear: () => пам.clear(), key: () => null, length: 0,
  },
  MutationObserver: function () { this.observe = function () {}; },
  setInterval: () => 0, clearInterval() {}, setTimeout: () => 0, clearTimeout() {},
  Date, Math, JSON, String, Number, Array, Object, Boolean, Error, RegExp, Map, Set, console,
};
w.window = w;

const ПЪТ = process.argv[2] || 'js/garch.js';
const код = fs.readFileSync(ПЪТ, 'utf8');
try { vm.runInNewContext(код, w, { filename: 'garch.js' }); }
catch (e) { console.log('🔴 СЛЯП: garch.js не се зарежда — ' + e.message); process.exit(2); }
if (!w.BL_GARCH) { console.log('🔴 СЛЯП: BL_GARCH не е изнесен'); process.exit(2); }
const { часовник, думите, ПРАГ } = w.BL_GARCH;

let паднали = 0;
const е = (какво, дадено, чакано) => {
  const ок = String(дадено) === String(чакано);
  if (!ок) { паднали++; console.log('   🔴 ' + какво + ': „' + дадено + '" · чаках „' + чакано + '"'); }
  else console.log('   ✅ ' + какво + ': ' + дадено);
};

console.log('\n⚡ ЧАСОВНИКЪТ НА ЕКРАНА');
е('0 сек', часовник(0), '0:00');
е('9 сек', часовник(9), '0:09');
е('60 сек', часовник(60), '1:00');
е('65 сек', часовник(65), '1:05');
е('прагът', часовник(300), '5:00');
е('12:34', часовник(754), '12:34');

console.log('\n⚡ ЧИСЛОТО, КОЕТО КАЗВА НА ЛЕКАРЯ');
е('0', думите(0), '0 секунди');
е('1 сек', думите(1), '1 секунда');
е('45 сек', думите(45), '45 секунди');
е('60 сек', думите(60), '1 минута');
е('120 сек', думите(120), '2 минути');
е('160 сек', думите(160), '2 минути и 40 секунди');
е('301 сек', думите(301), '5 минути и 1 секунда');

console.log('\n⚡ ПРАГЪТ');
е('5 минути в секунди', ПРАГ, '300');

console.log('\n⚡ ЕКРАНЪТ (какво пише и какво НЕ пише)');
const пише = (какво, ре, искам) => {
  const има = ре.test(код);
  const ок = има === искам;
  if (!ок) { паднали++; console.log('   🔴 ' + какво + ': ' + (има ? 'ИМА го' : 'НЯМА го')); }
  else console.log('   ✅ ' + какво);
};
пише('112 е на екрана', /tel:112/, true);
пише('казва прага от 5 минути', /5\s*минути/, true);
пише('„настрани на пода" (наш текст)', /настрани на пода/i, true);
пише('„нищо в устата" (наш текст)', /нищо в устата/i, true);
пише('„не го дръж насила" (наш текст)', /не го дръж насила/i, true);
пише('казва откъде е текстът', /Гърчът: кое НЕ се прави/, true);
пише('първият гърч → преглед', /първия гърч в живота/i, true);
// ⛔ НЕ бива да има:
пише('няма доза в мг/мл', /\d+\s*(мг|мл|mg|ml)\b/i, false);
пише('няма обещание', /(гарантиран|винаги помага|100\s*%|няма страшно)/i, false);
пише('няма „изчакай"', /(изчакай|не бързай|няма нужда да звъниш)/i, false);
пише('няма диагноза', /(епилепси|това е фебрилен|няма да е епилепс)/i, false);

console.log('');
if (паднали) { console.log('🔴 ПАДНАЛИ: ' + паднали); process.exit(1); }
console.log('✅ ЧИСТО — броячът смята вярно, 112 е на екрана и текстът е нашият.');
