// ═══════════════════════════════════════════════════════════
// 📚 ИЗБОРЪТ НА СТАТИЯ — жив изпит на новия списъчен вид
//
// ЗАЩО (26.08.2026): полето `lib` беше ЕДИН низ — една статия на карта. При
// 604 карти и 147 свободни таванът беше 147, а осиротелите статии са 490.
// Затова полето стана СПИСЪК ОТ КАНДИДАТИ, а приложението показва ЕДНА —
// онази, която най-добре пасва на ТОЧНИТЕ думи на майката.
//
// 🪤 ТОЗИ ИЗПИТ ВИКА ИСТИНСКАТА ФУНКЦИЯ (window.BL_LIB_IZBOR), а не свое копие
//    на логиката. Днес вече платих обратното: dev/test_naysheshtnite си написа
//    собствен мачър и веднага излъга — обяви „спрях да кървя" за фалшива
//    тревога, а живият двигател мълчеше за него. Тест, който повтаря кода
//    вместо да го ПИТА, мери себе си и остарява мълчаливо.
//
// ПУСКАНЕ: node dev/test_lib_masiv.js      (изход 1 при провал)
// ПЪТ НАЗАД: файлът само ЧЕТЕ.
// ═══════════════════════════════════════════════════════════
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const КОРЕН = path.resolve(__dirname, '..');

const W = {};
Object.assign(W, {
  console: { log() {}, warn() {} }, setTimeout, clearTimeout, setInterval, clearInterval,
  Math, JSON, Date, RegExp, String, Number, Object, Array, Boolean, Error,
  Map, Set, WeakMap, WeakSet, Promise, Intl, Symbol, Proxy, Reflect,
  encodeURIComponent, decodeURIComponent, isNaN, isFinite, parseInt, parseFloat
});
W.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
const възел = () => ({ style: {}, classList: { add() {}, remove() {}, toggle() {} }, appendChild() {}, setAttribute() {}, addEventListener() {}, children: [], dataset: {} });
W.document = {
  documentElement: {}, body: возел(), head: возел(),
  createElement: возел, createTextNode: возел,
  getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
  addEventListener() {}, readyState: 'complete'
};
function возел() { return { style: {}, classList: { add() {}, remove() {}, toggle() {} }, appendChild() {}, setAttribute() {}, addEventListener() {}, children: [], dataset: {} }; }
W.addEventListener = function () {};
W.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
W.requestAnimationFrame = f => setTimeout(() => f(1), 0);
W.getComputedStyle = () => ({ getPropertyValue: () => '' });
W.navigator = { userAgent: 'node', language: 'bg' };
W.location = { href: 'http://localhost/', search: '', hash: '' };
W.window = W;
vm.createContext(W);
W.globalThis = W;

new vm.Script(fs.readFileSync(path.join(КОРЕН, 'js/kb.js'), 'utf8'), { filename: 'kb.js' }).runInContext(W);
new vm.Script(fs.readFileSync(path.join(КОРЕН, 'js/helper.js'), 'utf8'), { filename: 'helper.js' }).runInContext(W);

if (typeof W.BL_LIB_IZBOR !== 'function') {
  console.log('🔴 window.BL_LIB_IZBOR липсва — изборът вече не е изнесен и този изпит не мери нищо');
  process.exit(1);
}

// ── подставена библиотека: три статии с ясно различни думи ──
W.BL_LIB = {
  поId: function (ид) {
    const т = {
      'lib-son': { id: 'lib-son', t: 'Дрямките и нощният сън', s: 'Колко спи бебето и кога се обръщат дрямките' },
      'lib-zabi': { id: 'lib-zabi', t: 'Никненето на зъбките', s: 'Венците, слюнката и безсънните нощи от зъби' },
      'lib-hrana': { id: 'lib-hrana', t: 'Първите лъжички', s: 'Кога се започва с твърда храна и с какво' }
    };
    return т[ид] || null;
  }
};

let паднали = 0;
const проба = (какво, дадено, очаква) => {
  const ок = дадено === очаква;
  if (!ок) паднали++;
  console.log('    ' + (ок ? '✅' : '🔴') + ' ' + какво + '   → ' + (дадено || 'нищо') +
              (ок ? '' : '   (очаквах ' + (очаква || 'нищо') + ')'));
};
const из = (lib, въпрос) => { const р = W.BL_LIB_IZBOR({ lib }, въпрос); return р ? р.id : null; };

console.log('');
console.log('📚 ИЗБОРЪТ НА СТАТИЯ');
console.log('');
console.log('  ── старият вид (един низ) трябва да работи непроменен ──');
проба('lib: „lib-son"', из('lib-son', 'каквото и да е'), 'lib-son');
проба('lib: несъществуваща', из('lib-nyama', 'нещо'), null);
проба('без lib', из(undefined, 'нещо'), null);

console.log('');
console.log('  ── новият вид: ЕДИН списък, ТРИ въпроса, ТРИ различни отговора ──');
const СПИСЪК = ['lib-son', 'lib-zabi', 'lib-hrana'];
проба('питa за зъбките', из(СПИСЪК, 'венците му са подути от зъбките'), 'lib-zabi');
проба('питa за съня', из(СПИСЪК, 'колко дрямки трябва да има'), 'lib-son');
проба('питa за храната', из(СПИСЪК, 'кога се започва с твърда храна'), 'lib-hrana');

console.log('');
console.log('  ── ръбовете ──');
проба('празен списък', из([], 'нещо'), null);
проба('списък само с несъществуващи', из(['lib-a', 'lib-b'], 'нещо'), null);
проба('списък с една валидна между невалидни', из(['lib-a', 'lib-zabi', 'lib-b'], 'нещо'), 'lib-zabi');
// въпрос без нито една обща дума → връща първата ВАЛИДНА, а не нищо:
// по-добре някаква статия, отколкото празен чип
проба('въпрос без общи думи', из(СПИСЪК, 'зззз щщщ ъъъ'), 'lib-son');

// ── САМОПРОВЕРКА: изпитът трябва да УМЕЕ да гръмне ──
const фалшив = W.BL_LIB_IZBOR({ lib: СПИСЪК }, 'венците му са подути от зъбките');
const умееДаГръмне = !!(фалшив && фалшив.id === 'lib-zabi');
console.log('');
console.log('  самопроверка: функцията наистина различава въпросите ' + (умееДаГръмне ? '✅' : '🔴'));
if (!умееДаГръмне) паднали++;

console.log('');
console.log('  ПРЕГЛЕДАНИ: 11 случая  ·  ' + (паднали ? '🔴 ПАДНАЛИ: ' + паднали : '✅ всички минаха'));
console.log('');
process.exit(паднали ? 1 : 0);
