// ═══════════════════════════════════════════════════════════
// 🌊 РЕКАТА ПРИ КРИВ ЗАПИС — 196 проби, нито една лодка с боклук
//
// „Реката" е екранът, на който майката вижда живота си подред: всяко първо
// нещо, всяко зъбче, всяка гласова бележка. Тя събира от 49 ключа в паметта.
// Крив запис в който и да е от тях — внесено копие от друг телефон, стара
// версия, прекъснат запис — може да сложи там лодка с текст
// „Мия: null кг (null-и персентил)".
//
// 🔴 КАКВО НАМЕРИ ТОЗИ ТЕСТ (26.08) И ЗАЩО ДВЕТЕ СТАРИ ЗАЩИТИ НЕ СТИГАХА:
//   Реката вече има ДВЕ нива защита, и двете добри:
//     1. `load` чисти дупките в масива (`безДупки`) и пази простите видове
//     2. накрая (ред 203) отсява всяка лодка с невалидна дата
//   Но между тях има цепнатина: запис с ВАЛИДНА дата и ПРАЗНИ ЧИСЛА минава
//   и през двете. Датата е наред, значи нищо не го спира — а на екрана на
//   мама излиза „undefined кг".
//   Намерени и поправени две такива места: bl_growth и bl_pregw.
//
// 🪤 И ТРИ ГРЕШКИ В САМИЯ ТЕСТ, всяка от които го правеше безполезен:
//   · не зареждаше js/data.js → всичко гърмеше с „BL_DATE is not defined"
//     и 100 фалшиви червени не значеха нищо;
//   · търсеше само „undefined", а отровата произвежда „null" — тоест
//     мълчеше точно за случая, за който е направен;
//   · първите отрови изобщо не стигаха до събирачите, защото отсяването по
//     дата ги махаше. Истинската отрова е ВАЛИДНА ДАТА + празни полета.
//
// ПУСКАНЕ: node dev/test_reka_kriv_zapis.js
// ПЪТ НАЗАД: файлът само ЧЕТЕ проекта.
// ═══════════════════════════════════════════════════════════
const fs = require('fs');
const vm = require('vm');
const path = require('path');
process.chdir(path.resolve(__dirname, '..'));

function пусни(памет, кодНаРеката) {
  const ctx = { console: { log() {}, warn() {} }, JSON, Math, Date, RegExp, String, Number, Array, Object,
                setTimeout: f => (f && 0) };
  ctx.localStorage = {
    _: памет,
    getItem(k) { return this._[k] === undefined ? null : this._[k]; },
    setItem(k, v) { this._[k] = String(v); },
    removeItem(k) { delete this._[k]; },
    get length() { return Object.keys(this._).length; },
    key(i) { return Object.keys(this._)[i]; }
  };
  const мк = () => ({
    style: {}, className: '', children: [],
    appendChild(x) { this.children.push(x); return x; },
    setAttribute() {}, addEventListener() {}, remove() {},
    querySelectorAll: () => [], querySelector: () => null,
    set innerHTML(v) { this._h = v; }, get innerHTML() { return this._h || ''; },
    set textContent(v) { this._t = v; }, get textContent() { return this._t || ''; }
  });
  ctx.document = { body: мк(), createElement: мк, addEventListener() {},
                   querySelectorAll: () => [], querySelector: () => null, getElementById: () => null };
  ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
  vm.createContext(ctx);
  new vm.Script(fs.readFileSync('js/data.js', 'utf8')).runInContext(ctx);   // BL_DATE живее там
  new vm.Script(кодНаРеката).runInContext(ctx);
  return ctx.BL_RIVER.collect();
}

const ИЗВОРЪТ = fs.readFileSync('js/river.js', 'utf8');
const КЛЮЧОВЕ = [...new Set([...ИЗВОРЪТ.matchAll(/load\(['"](bl_[a-z0-9_]+)['"]/g)].map(m => m[1]))];
const ВАЛИДЕН_МИГ = new Date(2026, 0, 1, 12, 0).getTime();

// 🪤 Отровата ТРЯБВА да носи валидна дата — иначе отсяването на ред 203 я
//   маха, тестът вижда нула и обявява за здраво нещо, което не е проверил.
const ФОРМИ = [
  ['валидна дата, нищо друго', '[{"d":"2026-01-01"}]'],
  ['валиден миг, нищо друго', '[{"ts":' + ВАЛИДЕН_МИГ + '}]'],
  ['дата + празни полета', '[{"d":"2026-01-01","t":null,"w":null,"p":null,"n":null,"txt":null,"label":null,"note":null,"who":null,"kg":null}]'],
  ['обект-карта с дата', '{"а":"2026-01-01"}']
];
// „null" се търси само като ЦЯЛА дума — иначе би съвпаднало вътре в българска дума
const БОКЛУК = /undefined|(^|[^а-яА-Я])null([^а-яА-Я]|$)|NaN|Invalid Date/;

function премети(код) {
  let лоши = [], проби = 0;
  for (const k of КЛЮЧОВЕ) for (const [име, стойност] of ФОРМИ) {
    проби++;
    try {
      const R = пусни({ [k]: стойност, bl_baby: '{"name":"Мия","birth":"2025-03-14"}' }, код);
      const л = (R || []).filter(x => x && БОКЛУК.test(String(x.txt || '')));
      if (л.length) лоши.push(k + ' · ' + име + ' → „' + String(л[0].txt).slice(0, 54) + '"');
    } catch (e) { лоши.push(k + ' · ' + име + ' → ГРЪМНА: ' + e.message.slice(0, 42)); }
  }
  return { лоши, проби };
}

console.log('🌊 РЕКАТА ПРИ КРИВ ЗАПИС\n');
const сега = премети(ИЗВОРЪТ);
console.log('  ПРЕГЛЕДАНИ : ' + КЛЮЧОВЕ.length + ' ключа × ' + ФОРМИ.length + ' форми = ' + сега.проби + ' проби');
console.log('  ' + (сега.лоши.length ? '🔴' : '✅') + ' лодки с боклук: ' + сега.лоши.length);
сега.лоши.slice(0, 12).forEach(x => console.log('     🔴 ' + x));

// ── САМОПРОВЕРКА: същият тест върху НАРОЧНО ВЪРНАТ стар ред ──
// Нулата горе не доказва нищо, ако тестът не може да види червено.
const примамкаКод = ИЗВОРЪТ.replace(
  "if (!x || !x.d || x.w == null || x.w === '') return;",
  "if (!x || !x.d) return;");
const сеСмени = примамкаКод !== ИЗВОРЪТ;
const примамка = сеСмени ? премети(примамкаКод) : { лоши: [], проби: 0 };

console.log('\n  САМОПРОВЕРКА (иначе нулата горе не значи нищо):');
console.log('     ' + (сеСмени ? '✅' : '🔴') + ' успях да върна стария ред за растежа');
console.log('     ' + (примамка.лоши.length ? '✅' : '🔴') + ' СЪС стария ред тестът ГЪРМИ: ' + примамка.лоши.length + ' лоши лодки');
if (примамка.лоши.length) console.log('        пример: ' + примамка.лоши[0]);
console.log('     ' + (сега.лоши.length === 0 ? '✅' : '🔴') + ' с новия: 0');

const наред = сеСмени && примамка.лоши.length > 0 && сега.лоши.length === 0;
console.log('\n  ' + (наред ? '✅ ЧИСТО и доказано в ДВЕТЕ посоки' : '🔴 нещо не е наред'));
process.exit(наред ? 0 : 1);
