// ═══════════════════════════════════════════════════════════
// 🕳️ ДУПКАТА — КОЙ КРАДЕ ПЪРВОТО МЯСТО ПРИ ВЪПРОС ОТ ЕДНА ДУМА
//
// dev/tarsachkata.js мери ЧИСЛОТО (65% на 1-во място). Този уред показва
// МОДЕЛА: за всяка загубена статия — коя чужда статия е застанала отпред
// и с какво заглавие. Без модел поправката е налучкване.
//
// 🪤 Същият пясъчник като tarsachkata.js: контекст, който Е сам себе си
//    като window/globalThis, и индексът се подава ПРАВО в кода (init()
//    тегли по мрежа, каквато тук няма → index оставаше null и уредът
//    показваше „100% провал" при здрава търсачка).
// 🪤 Същата извадка и същите служебни думи като tarsachkata.js — иначе
//    двата уреда мерят различни неща и числата не се сравняват.
//
// ПУСКАНЕ: node dev/dupka.js [--vsichki]
// ПЪТ НАЗАД: файлът само ЧЕТЕ.
// ═══════════════════════════════════════════════════════════
const fs = require('fs');
const vm = require('vm');
const path = require('path');
process.chdir(path.resolve(__dirname, '..'));
const ВСИЧКИ = process.argv.includes('--vsichki');

const idx = JSON.parse(fs.readFileSync('lib/index.json', 'utf8'));
const items = idx.items || [];

const ctx = {
  console, setTimeout, clearTimeout, JSON, Math, Date, RegExp, String, Number, Array, Object,
  document: { addEventListener() {}, createElement: () => ({ style: {}, classList: { add() {}, remove() {} } }),
              getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] },
  navigator: { onLine: true }, location: { href: '', search: '' },
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  fetch: () => Promise.reject(new Error('без мрежа')),
  addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true; },
  requestAnimationFrame(f) { return 0; }, cancelAnimationFrame() {},
  matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }),
  getComputedStyle: () => ({ getPropertyValue: () => '' }),
  CustomEvent: function () {}, Event: function () {}
};
ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
vm.createContext(ctx);
ctx.__INDEX__ = items;
let ИЗВОР = fs.readFileSync('js/lib.js', 'utf8');
if (ИЗВОР.indexOf('let index = null;') < 0) { console.log('🔴 не намерих реда с index'); process.exit(1); }
ИЗВОР = ИЗВОР.replace('let index = null;', 'let index = globalThis.__INDEX__ || null;');
try { new vm.Script(ИЗВОР, { filename: 'lib.js' }).runInContext(ctx); }
catch (e) { console.log('🔴 js/lib.js не се зарежда: ' + e.message); process.exit(1); }
const L = ctx.BL_LIB || ctx.window.BL_LIB;
if (!L || !L.search) { console.log('🔴 няма BL_LIB.search'); process.exit(1); }

// 🪤 Уредът трябва да МОЖЕ да гръмне: ако search върне празно за всичко,
//    да се вика, а не да рапортува „0 проблема".
const проба = L.search('температура', '', 5);
if (!проба || !проба.length) { console.log('🔴 search() връща празно дори за „температура" — уредът не вижда данните си'); process.exit(1); }

const СЛУЖЕБНИ = new Set(['при', 'след', 'преди', 'през', 'към', 'между', 'без', 'над', 'под',
  'кога', 'какво', 'как', 'защо', 'кое', 'кои', 'кой', 'или', 'това', 'тези', 'която', 'които',
  'срещу', 'според', 'дали', 'още', 'най', 'все', 'вече', 'само', 'също', 'едно', 'една']);
const думи = t => String(t || '').toLowerCase()
  .replace(/[0-9]+[-–][0-9]+/g, ' ').replace(/[^а-яa-z\s]/g, ' ')
  .split(/\s+/).filter(w => w.length >= 4 && !СЛУЖЕБНИ.has(w));

const СТЪПКА = Math.max(1, Math.ceil(items.length / 160));
let n = 0, първи = 0;
const загуби = [];
for (let бр = 0; бр < items.length; бр += СТЪПКА) {
  const it = items[бр];
  const д = думи(it.t);
  if (д.length < 2) continue;
  n++;
  const q = д[0];
  let r = [];
  try { r = L.search(q, it.r || '', 10) || []; } catch (e) {}
  const поз = r.findIndex(x => x && x.id === it.id) + 1;
  if (поз === 1) { първи++; continue; }
  загуби.push({ q, поз, цел: it, крадец: r[0] || null });
}

console.log('🕳️ ДУПКАТА: въпрос от ЕДНА дума\n');
console.log('  ПРЕГЛЕДАНИ статии : ' + n + '  (от ' + items.length + ' в индекса, стъпка ' + СТЪПКА + ')');
console.log('  на 1-во място     : ' + първи + '  (' + (100 * първи / n).toFixed(0) + '%)');
console.log('  ЗАГУБЕНИ          : ' + загуби.length + '\n');

// ── моделът: каква е разликата между крадеца и целта
let ощеНачало = 0, целНачало = 0, същаСтая = 0, крадецПоКратък = 0;
загуби.forEach(з => {
  const к = з.крадец;
  if (!к) return;
  const пЦ = String(з.цел.t).toLowerCase().split(/[^а-яa-z0-9]+/).filter(Boolean);
  const пК = String(к.t).toLowerCase().split(/[^а-яa-z0-9]+/).filter(Boolean);
  const iЦ = пЦ.findIndex(w => w.startsWith(з.q.slice(0, 5)));
  const iК = пК.findIndex(w => w.startsWith(з.q.slice(0, 5)));
  if (iК >= 0 && iК < 3) ощеНачало++;
  if (iЦ >= 0 && iЦ < 3) целНачало++;
  if (к.r === з.цел.r) същаСтая++;
  if (пК.length < пЦ.length) крадецПоКратък++;
});
console.log('  ── моделът на загубата ──');
console.log('   крадецът има думата в първите 3 думи на заглавието : ' + ощеНачало + '/' + загуби.length);
console.log('   ЦЕЛТА има думата в първите 3 думи на заглавието    : ' + целНачало + '/' + загуби.length);
console.log('   крадецът е в СЪЩАТА стая като целта                : ' + същаСтая + '/' + загуби.length);
console.log('   заглавието на крадеца е ПО-КЪСО от това на целта   : ' + крадецПоКратък + '/' + загуби.length + '\n');

console.log('  ── случаите ──');
загуби.slice(0, ВСИЧКИ ? 999 : 30).forEach(з => {
  console.log('  „' + з.q + '"  поз=' + (з.поз || '—'));
  console.log('     ЦЕЛ    [' + з.цел.r + '] ' + String(з.цел.t).slice(0, 70));
  console.log('     ПЪРВИ  [' + (з.крадец ? з.крадец.r : '?') + '] ' + (з.крадец ? String(з.крадец.t).slice(0, 70) : '—'));
});
if (!ВСИЧКИ && загуби.length > 30) console.log('   … още ' + (загуби.length - 30) + ' — с --vsichki');
