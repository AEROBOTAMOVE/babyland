// ═══════════════════════════════════════════════════════════
// 🔑 МЪРТВИ КЛЮЧОВЕ — ключ, който не намира собствения си запис
//
// Въпросът: всеки ключ в kb.js води ли до записа, на който е закачен?
// Ако „ходи" стои на „Първите стъпки", но BL_MATCH('ходи') връща запека,
// този ключ е мъртъв — той работи за ЧУЖД запис. Майката пише думата и
// получава друг отговор. Точно този дефект хвана 6 от 15-те паднали теста.
//
// ЗАЩО В NODE, А НЕ В БРАУЗЪРА:
//   ~5700 извиквания на BL_MATCH подред блокират главната нишка и табът
//   замръзва. Освен това други агенти взимат таба и мерките се губят.
//   Тук зареждаме kb.js и helper.js върху малка подложка за window —
//   kb.js не пипа DOM изобщо, а от helper.js ползваме само чистата
//   функция за търсене. Нищо не се рисува.
//
// ПУСКАНЕ:
//   node dev/mrytvi.js            — само обобщение
//   node dev/mrytvi.js --all      — и целият списък
//
// ПЪТ НАЗАД: файлът само ЧЕТЕ. Не пипа нищо в проекта.
// ═══════════════════════════════════════════════════════════
const fs = require('fs');
const vm = require('vm');

function празенЕлемент() {
  const е = {
    style: {}, dataset: {}, classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } },
    children: [], childNodes: [],
    appendChild(x){ return x; }, removeChild(x){ return x; }, insertBefore(x){ return x; },
    setAttribute(){}, getAttribute(){ return null; }, removeAttribute(){},
    addEventListener(){}, removeEventListener(){}, dispatchEvent(){ return true; },
    querySelector(){ return null; }, querySelectorAll(){ return []; },
    closest(){ return null; }, focus(){}, blur(){}, click(){}, remove(){},
    getBoundingClientRect(){ return { top:0, left:0, width:0, height:0, right:0, bottom:0 }; },
    scrollIntoView(){}, animate(){ return { onfinish:null, cancel(){}, finish(){} }; }
  };
  е.innerHTML = ''; е.textContent = ''; е.value = ''; е.parentNode = null; е.firstChild = null;
  return е;
}

const склад = {};
const window = {
  location: { href: 'http://localhost/', search: '', hash: '', pathname: '/' },
  navigator: { userAgent: 'node', language: 'bg', onLine: true },
  localStorage: {
    getItem: k => (k in склад ? склад[k] : null),
    setItem: (k, v) => { склад[k] = String(v); },
    removeItem: k => { delete склад[k]; }, clear: () => { for (const k in склад) delete склад[k]; },
    key: i => Object.keys(склад)[i] || null, get length(){ return Object.keys(склад).length; }
  },
  addEventListener(){}, removeEventListener(){}, dispatchEvent(){ return true; },
  matchMedia: () => ({ matches: false, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){} }),
  requestAnimationFrame: f => setTimeout(() => f(Date.now()), 0),
  cancelAnimationFrame: id => clearTimeout(id),
  getComputedStyle: () => ({ getPropertyValue: () => '', animationName: 'none', animationPlayState: 'paused' }),
  scrollTo(){}, alert(){}, confirm(){ return false; }, prompt(){ return null; },
  innerWidth: 360, innerHeight: 740, devicePixelRatio: 2,
  speechSynthesis: { speak(){}, cancel(){}, getVoices(){ return []; } },
  fetch: () => Promise.reject(new Error('няма мрежа в проверката'))
};
const document = {
  documentElement: празенЕлемент(), body: празенЕлемент(), head: празенЕлемент(),
  createElement: () => празенЕлемент(), createTextNode: () => празенЕлемент(),
  createDocumentFragment: () => празенЕлемент(),
  getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
  getElementsByClassName: () => [], getElementsByTagName: () => [],
  addEventListener(){}, removeEventListener(){}, dispatchEvent(){ return true; },
  readyState: 'complete', hidden: false, visibilityState: 'visible',
  cookie: '', title: '', activeElement: null
};
window.document = document; window.window = window; window.self = window; window.top = window;

// 🪤 КАПАНЪТ, В КОЙТО ПАДНАХ ТУК:
// Първо направих window обикновен обект и го подадох като поле в контекста.
// helper.js обаче пише `for (const e of KB.entries)` — ГОЛО KB, без window.
// В браузъра window Е глобалният обект, затова window.KB = x създава и
// глобалното KB. В подложката ми не беше така: KB не съществуваше като
// глобална, findEntry гърмеше на всяко викане, а BL_MATCH гълташе грешката
// и връщаше null. Резултат: „100% мъртви ключове" — което изглежда като
// страшна находка, а е счупен уред.
// Лекът: контекстът се прави ОТ самия window, значи window е глобалният.
Object.assign(window, {
  console, setTimeout, clearTimeout, setInterval, clearInterval,
  Math, JSON, Date, RegExp, String, Number, Object, Array, Boolean, Error,
  Map, Set, WeakMap, WeakSet, Promise, Intl, Symbol, Proxy, Reflect,
  encodeURIComponent, decodeURIComponent, isNaN, isFinite, parseInt, parseFloat,
  TextEncoder: global.TextEncoder, TextDecoder: global.TextDecoder
});
const пясъчник = vm.createContext(window);
window.globalThis = window;

function зареди(път) {
  try {
    var код = fs.readFileSync(път, 'utf8');
    // __БЕЗ_ГЪЛТАНЕ: BL_MATCH има try/catch, който връща null при всяка
    // грешка. В приложението това е правилно — майката не бива да види
    // счупен екран. Но в ПРОВЕРКАТА гълтането прави всяка грешка невидима
    // и „100% мъртви ключове" изглежда като находка, а е счупен уред.
    // Затова тук, и само тук, махаме гълтането.
    код = код.replace(
      "window.BL_MATCH = (текст, стая) => { try { return findEntry(текст, стая) || null; } catch (e) { return null; } };",
      "window.BL_MATCH = (текст, стая) => findEntry(текст, стая) || null;");
    new vm.Script(код, { filename: път }).runInContext(пясъчник); return null;
  }
  catch (e) { return път + ' → ' + e.name + ': ' + e.message; }
}

const грешки = ['js/kb.js', 'js/helper.js'].map(зареди).filter(Boolean);
if (грешки.length) console.log('⚠ при зареждане:\n  ' + грешки.join('\n  '));

const KB = window.KB;
const MATCH = window.BL_MATCH;
if (!KB || !MATCH) {
  console.log('🔴 не се получи: KB=' + typeof KB + ' · BL_MATCH=' + typeof MATCH);
  process.exit(1);
}

const записи = KB.entries || KB.items || [];
let пробвани = 0;
const мъртви = [];
const крадци = {};
for (const з of записи) {
  for (const k of (з.keys || [])) {
    if (!k || k.length < 4) continue;
    пробвани++;
    let r = null;
    try { r = MATCH(k, з.room); } catch (e) {}
    const дал = r ? (r.id || (r.запис && r.запис.id) || null) : null;
    if (дал !== з.id) {
      мъртви.push({ ключ: k, на: з.id, стая: з.room, отива: дал || 'НЯМА' });
      const c = дал || 'НЯМА';
      крадци[c] = (крадци[c] || 0) + 1;
    }
  }
}

console.log('\n🔑 МЪРТВИ КЛЮЧОВЕ');
console.log('   записи: ' + записи.length + ' · пробвани ключа: ' + пробвани);
console.log('   ключове, които НЕ намират своя запис: ' + мъртви.length
            + ' (' + (100 * мъртви.length / пробвани).toFixed(1) + '%)');
const няма = мъртви.filter(m => m.отива === 'НЯМА').length;
console.log('   от тях: ' + няма + ' не намират НИЩО · ' + (мъртви.length - няма) + ' отиват при ЧУЖД запис');

const топ = Object.entries(крадци).sort((a, b) => b[1] - a[1]).slice(0, 12);
console.log('\n   най-големите крадци (кой запис прибира чужди ключове):');
топ.forEach(([ид, n]) => console.log('     ' + String(n).padStart(4) + '  ← ' + ид));

console.log('\n   примери (ключ → къде отива вместо своя запис):');
мъртви.filter(m => m.отива !== 'НЯМА').slice(0, 20).forEach(m =>
  console.log('     "' + m.ключ + '"  на ' + m.на + '  →  ' + m.отива));

if (process.argv.includes('--all')) {
  fs.writeFileSync('dev/nahodki/mrytvi_klyuchove.json', JSON.stringify(мъртви, null, 1), 'utf8');
  console.log('\n   целият списък: dev/nahodki/mrytvi_klyuchove.json');
}

// ── ПАЗАЧ СРЕЩУ САМИЯ МЕН ─────────────────────────────────
// Ако „мъртвите" са над половината, дефектът почти сигурно е в тази
// подложка, не в базата. Тогава числото не е находка, а счупен уред.
