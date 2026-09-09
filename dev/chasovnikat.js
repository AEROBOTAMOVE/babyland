// ⏳ ПАЗАЧ ЗА ЧАСОВНИКА (js/chasovnik.js)
//
// Картата пази ЧАС. Ако часът излъже, майката ще реши по грешно число
// кога е дала лекарство — затова тук се мери точно смятането, а не видът.
// Пуска се без браузър: минимален кукленски DOM, колкото файлът да се зареди.
//
// ИЗХОД: 0 = чисто · 1 = падна проверка · 2 = сляп (файлът не се зарежда)
const fs = require('fs');
const vm = require('vm');

// ── кукленски DOM: точно толкова, колкото IIFE-то да мине докрай ─────────
function възел(таг) {
  const n = {
    tagName: String(таг || 'div').toUpperCase(), className: '', innerHTML: '', textContent: '',
    hidden: false, children: [], dataset: {}, style: {}, type: '', value: '', title: '',
    classList: { _: new Set(), add(x) { this._.add(x); }, remove(...x) { x.forEach(y => this._.delete(y)); }, contains(x) { return this._.has(x); } },
    appendChild(c) { this.children.push(c); c.parentNode = this; return c; },
    insertBefore(c) { this.children.unshift(c); c.parentNode = this; return c; },
    removeChild(c) { this.children = this.children.filter(x => x !== c); },
    remove() { if (this.parentNode) this.parentNode.removeChild(this); },
    setAttribute() {}, getAttribute: () => null, addEventListener() {}, focus() {},
    querySelector: () => null, querySelectorAll: () => [], contains: () => true, scrollIntoView() {},
    get nextSibling() { return null; },
  };
  return n;
}
const пам = new Map();
const w = {
  document: {
    createElement: възел, body: { contains: () => true, appendChild() {}, querySelector: () => null }, addEventListener() {},
    querySelector: () => null, querySelectorAll: () => [], hidden: false,
  },
  localStorage: {
    getItem: k => (пам.has(k) ? пам.get(k) : null),
    setItem: (k, v) => пам.set(String(k), String(v)),
    removeItem: k => пам.delete(k), clear: () => пам.clear(), key: () => null, length: 0,
  },
  setInterval: () => 0, clearInterval() {}, setTimeout: () => 0, clearTimeout() {},
  Date, Math, JSON, String, Number, Array, Object, Boolean, Error, RegExp, Map, Set,
  console, parseInt, parseFloat, isNaN,
};
w.window = w;

const ПЪТ = process.argv[2] || 'js/chasovnik.js';   // за проверка на самия пазач
const код = fs.readFileSync(ПЪТ, 'utf8');
try { vm.runInNewContext(код, w, { filename: 'chasovnik.js' }); }
catch (e) { console.log('🔴 СЛЯП: chasovnik.js не се зарежда — ' + e.message); process.exit(2); }
if (!w.BL_CHAS) { console.log('🔴 СЛЯП: BL_CHAS не е изнесен'); process.exit(2); }
const { предиДумите, РЕДОВЕ, отбележи, дозиЗа24 } = w.BL_CHAS;

let паднали = 0;
const е = (какво, дадено, чакано) => {
  const ок = String(дадено) === String(чакано);
  if (!ок) { паднали++; console.log('   🔴 ' + какво + ': „' + дадено + '" · чаках „' + чакано + '"'); }
  else console.log('   ✅ ' + какво + ': ' + дадено);
};

console.log('\n⏳ ЧАСОВНИКЪТ — какво чете майката');
const М = 60000, Ч = 3600000;
е('0 сек', предиДумите(0), 'току-що');
е('90 сек', предиДумите(90 * 1000), 'току-що');
е('25 мин', предиДумите(25 * М), 'преди 25 мин');
е('59 мин', предиДумите(59 * М), 'преди 59 мин');
е('точно 1 ч', предиДумите(Ч), 'преди 1 ч');
е('3 ч 40 мин', предиДумите(3 * Ч + 40 * М), 'преди 3 ч 40 мин');
е('23 ч 59 мин', предиДумите(23 * Ч + 59 * М), 'преди 23 ч 59 мин');
е('25 часа', предиДумите(25 * Ч), 'преди 1 ден');
е('30 часа', предиДумите(30 * Ч), 'преди 1 ден');
е('60 часа', предиДумите(60 * Ч), 'преди 2 дни');
// ⏪ часовникът на телефона може да скочи назад (лятно/зимно, ръчна смяна)
е('отрицателно време', предиДумите(-5 * М), 'след малко');

console.log('\n⏳ БРОЯЧЪТ ЗА 24 ЧАСА');
const сега = Date.now();
е('нула дози', дозиЗа24({ hist: [] }, сега), '0');
е('без hist', дозиЗа24({}, сега), '0');
е('три в рамките', дозиЗа24({ hist: [сега - 2 * Ч, сега - 8 * Ч, сега - 20 * Ч] }, сега), '3');
е('една е на 25 ч', дозиЗа24({ hist: [сега - 2 * Ч, сега - 25 * Ч] }, сега), '1');
е('точно на 24 ч не се брои', дозиЗа24({ hist: [сега - 24 * Ч] }, сега), '0');

console.log('\n⏳ ЗАПИСЪТ');
пам.clear();
отбележи('nurofen', сега - 6 * Ч);
отбележи('nurofen', сега);
const з = JSON.parse(пам.get('bl_chas')).nurofen;
е('последният час е последният записан', з.t, String(сега));
е('историята е с два записа', (з.hist || []).length, '2');
е('историята е подредена', (з.hist[0] < з.hist[1]), 'true');
// таванът от 60 записа
пам.clear();
for (let i = 0; i < 75; i++) отбележи('hrana', сега - i * М);
е('таван 60 записа', JSON.parse(пам.get('bl_chas')).hrana.hist.length, '60');

console.log('\n⏳ ГРАНИЦАТА (нарочна: часът ДА, дозата НЕ)');
const текст = код;
const дози = текст.match(/\d+\s*(мг|мл|mg|ml)\b/gi) || [];
е('няма число за доза във файла', дози.length, '0');
const обещания = текст.match(/(гарантиран|100\s*%|винаги помага|спасително средство)/gi) || [];
е('няма обещания', обещания.length, '0');
е('пише 112', /112/.test(текст), 'true');
е('пише „педиатър"', /педиатър/i.test(текст), 'true');

console.log('\n⏳ РЕДОВЕТЕ');
е('брой редове', РЕДОВЕ.length, '6');
е('лекарствата са с интервал', РЕДОВЕ.filter(r => r.lek && r.h > 0).length, '2');
е('нелекарствата са без интервал', РЕДОВЕ.filter(r => !r.lek && r.h !== 0).length, '0');
const ид = РЕДОВЕ.map(r => r.id);
е('без повторени id', new Set(ид).size, String(ид.length));

console.log('');
if (паднали) { console.log('🔴 ПАДНАЛИ: ' + паднали); process.exit(1); }
console.log('✅ ЧИСТО — часовникът смята вярно и границата се пази.');
