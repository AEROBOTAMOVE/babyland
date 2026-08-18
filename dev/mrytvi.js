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
// 🪤 18.08 — УРЕДЪТ НЕ МЕРЕШЕ ВСИЧКО И МЪЛЧЕШЕ ЗА ТОВА:
//   Тук стоеше `if (!k || k.length < 4) continue;` — ключовете под 4 знака
//   („сън", „ухо", „зъб", „мед", „38") НИКОГА не влизаха в мярката, а
//   отчетът пишеше само „пробвани ключа: 4669" без да каже, че общо са 4700.
//   Тоест 31 ключа бяха извън всяка проверка и никъде не пишеше, че ги няма.
//   ЗАЩО е бил сложен прагът: НИКЪДЕ не е записано. Един и същ ред е
//   преписан в пет уреда (metachka.js ×2, metachka2.js, opit_dobavi.js,
//   opit_klyuch.js, тук), в нито един няма причина. Матчърът в helper.js
//   НЕ иска такъв праг — там пише „Кратките корени (сън, ухо) си остават
//   непокътнати", а единственият му праг е `q.length < 2`.
//   Измерено, преди да го махна: от 31-те къси само 2 са мъртви (6.5%),
//   значи прагът не пази от шум — просто крие.
//   СЕГА: проверяват се ВСИЧКИ ключове, а късите се отчитат и ОТДЕЛНО.
//   И понеже „0 находки" без брой прегледани значи „0 прегледани",
//   отчетът винаги казва ОБЩО / ПРОВЕРЕНИ / ПРЕСКОЧЕНИ.
//
// ПУСКАНЕ:
//   node dev/mrytvi.js            — само обобщение
//   node dev/mrytvi.js --all      — и целият списък в dev/nahodki/
//   node dev/mrytvi.js --proba    — внася НАРОЧНИ дефекти в паметта и
//                                   проверява, че уредът ги хваща. Мярка,
//                                   която не е пробвана в ДВЕТЕ посоки,
//                                   е обещание, не мярка.
//
// ПЪТ НАЗАД: файлът само ЧЕТЕ от проекта (--all пише в dev/nahodki/).
//   Нищо в js/ не се пипа; --proba променя само копието в паметта.
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

// ── ПРОБНИ ДЕФЕКТИ (--proba) ──────────────────────────────
// Мярка, която не съм видял да ЗАСВЕТИ, е предположение. Затова тук
// внасям два дефекта, за които ЗНАМ, че съществуват, и после гледам
// дали уредът ги е изкарал. Без флага двата ключа изобщо ги няма в
// базата → уредът мълчи. Това е другата посока.
// Нищо не се записва на диск: пипа се само масивът в паметта.
const пробни = [];
if (process.argv.includes('--proba')) {
  // П1: ключ от една буква. helper.js реже на `q.length < 2`, значи
  //     findEntry връща null → гарантирано „НЯМА". Пътьом проверява и
  //     че късите изобщо стигат до мярката.
  if (записи[0]) { записи[0].keys = (записи[0].keys || []).concat(['щ']); пробни.push('щ'); }
  // П2: точен многодумен ключ, преписан върху ДРУГ запис в СЪЩАТА стая.
  //     Двата събират еднакви точки и еднакъв домашен бонус; печели
  //     единият, у другия ключът остава мъртъв. Накъдето и да падне
  //     равенството, мъртвите растат с 1 — затова не зависи от реда.
  for (const з of записи) {
    const мнДумен = (з.keys || []).find(k => k && k.includes(' ') && k.length > 8);
    if (!мнДумен) continue;
    const друг = записи.find(x => x !== з && x.room === з.room && !(x.keys || []).includes(мнДумен));
    if (друг) { друг.keys = друг.keys.concat([мнДумен]); пробни.push(мнДумен); break; }
  }
  console.log('🧪 ПРОБА: внесени ' + пробни.length + ' нарочни дефекта → '
              + пробни.map(x => '"' + x + '"').join(' · '));
}

// ── КОЛКО ЗАПИСА ДЪРЖАТ ЕДИН И СЪЩ КЛЮЧ ───────────────────
// Ако „мед" стои и на zh-opasni, и на lb-med-sol, най-много ЕДИН може да
// го спечели. Другият излиза „мъртъв", но това не е дефект на ключа — то е
// сблъсък в базата и се лекува другояче (махане на единия, не пренаписване).
// Броят се отделно, иначе истинските дефекти се крият зад сблъсъците.
const колкоЗаписа = {};
for (const з of записи) for (const k of (з.keys || [])) if (k) колкоЗаписа[k] = (колкоЗаписа[k] || 0) + 1;

let общо = 0, проверени = 0;
const прескочени = [];
const мъртви = [];
const крадци = {};
const къси = [];                 // ВСИЧКИ под 4 знака — и добрите, и мъртвите
for (const з of записи) {
  for (const k of (з.keys || [])) {
    общо++;
    // Единственото, което се прескача, е празен/невалиден ключ — и то се
    // ОТЧИТА поименно. Праг по дължина тук вече НЯМА.
    if (!k || typeof k !== 'string') { прескочени.push({ ключ: String(k), на: з.id, защо: 'празен или не е низ' }); continue; }
    проверени++;
    let r = null, гръмна = null;
    try { r = MATCH(k, з.room); } catch (e) { гръмна = e.name + ': ' + e.message; }
    const дал = r ? (r.id || (r.запис && r.запис.id) || null) : null;
    const наред = (дал === з.id);
    const дубликат = колкоЗаписа[k] > 1;
    if (!наред) {
      мъртви.push({ ключ: k, на: з.id, стая: з.room, отива: дал || 'НЯМА',
                    къс: k.length < 4, дубликат, гръмна });
      const c = дал || 'НЯМА';
      крадци[c] = (крадци[c] || 0) + 1;
    }
    if (k.length < 4) къси.push({ ключ: k, на: з.id, стая: з.room, отива: дал || 'НЯМА', наред, дубликат });
  }
}
const пробвани = проверени;   // старото име, за да не счупя нищо, което го чете

const проц = n => (100 * n / (проверени || 1)).toFixed(1) + '%';

console.log('\n🔑 МЪРТВИ КЛЮЧОВЕ');
console.log('   записи: ' + записи.length + ' · ключове ОБЩО: ' + общо);
console.log('   ПРОВЕРЕНИ: ' + проверени + ' от ' + общо
            + ' (' + (100 * проверени / (общо || 1)).toFixed(1) + '%)'
            + ' · ПРЕСКОЧЕНИ: ' + прескочени.length);
if (прескочени.length) {
  console.log('   прескочените, поименно (и защо):');
  прескочени.slice(0, 40).forEach(п => console.log('     ' + JSON.stringify(п.ключ) + '  на ' + п.на + '  — ' + п.защо));
  if (прескочени.length > 40) console.log('     … и още ' + (прескочени.length - 40));
}
console.log('   ключове, които НЕ намират своя запис: ' + мъртви.length + ' (' + проц(мъртви.length) + ')');
const няма = мъртви.filter(m => m.отива === 'НЯМА').length;
console.log('     · ' + няма + ' не намират НИЩО · ' + (мъртви.length - няма) + ' отиват при ЧУЖД запис');

// Разделяне на находката: сблъсък ≠ дефект на ключа.
const дублМъртви = мъртви.filter(m => m.дубликат);
console.log('     · ' + (мъртви.length - дублМъртви.length) + ' са УНИКАЛНИ ключове  ← истински дефект');
console.log('     · ' + дублМъртви.length + ' стоят на ПОВЕЧЕ ОТ ЕДИН запис ← сблъсък: най-много един може да спечели');
const гръмнали = мъртви.filter(m => m.гръмна);
if (гръмнали.length) console.log('     ⚠ ' + гръмнали.length + ' ключа ГРЪМНАХА в матчъра, напр.: ' + гръмнали[0].ключ + ' → ' + гръмнали[0].гръмна);

// ── КЪСИТЕ КЛЮЧОВЕ, КОИТО ДО 18.08 БЯХА ИЗВЪН ВСЯКА МЯРКА ──
const късиМъртви = къси.filter(k => !k.наред);
console.log('\n   ── КЪСИ КЛЮЧОВЕ (под 4 знака) ' + '─'.repeat(28));
console.log('   Тези ' + къси.length + ' ключа ДОСЕГА се прескачаха мълчаливо (ред `k.length < 4`).');
console.log('   къси общо: ' + къси.length + ' · намират своя запис: ' + (къси.length - късиМъртви.length)
            + ' · МЪРТВИ: ' + късиМъртви.length);
if (късиМъртви.length) {
  късиМъртви.forEach(k => console.log('     МЪРТЪВ  ' + JSON.stringify(k.ключ).padEnd(9) + ' на ' + String(k.на).padEnd(16)
    + ' (' + k.стая + ')  →  ' + k.отива + (k.дубликат ? '   [същият ключ стои и на друг запис]' : '')));
} else {
  console.log('     всички къси ключове намират своя запис.');
}

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

// ── ПРОБАТА: ХВАНА ЛИ УРЕДЪТ СВОИТЕ СОБСТВЕНИ ДЕФЕКТИ ──────
if (пробни.length) {
  let хванати = 0;
  console.log('\n🧪 ПРОБА — присъда:');
  пробни.forEach(p => {
    const н = мъртви.filter(m => m.ключ === p).length;
    if (н) хванати++;
    console.log('     ' + (н ? '✅ ХВАНАТ ' : '❌ ПРОПУСНАТ ') + JSON.stringify(p) + '  (в списъка с мъртви: ' + н + ')');
  });
  console.log('   хванати ' + хванати + ' от ' + пробни.length + ' внесени дефекта.');
  if (хванати < пробни.length) {
    console.log('   🔴 Уредът ПРОПУСКА дефект, за който знам, че съществува. Числата му не важат.');
    process.exitCode = 1;
  } else {
    console.log('   Другата посока: без --proba тези ключове изобщо ги няма в базата → уредът мълчи за тях.');
  }
}

// ── ПАЗАЧ СРЕЩУ САМИЯ МЕН ─────────────────────────────────
// Ако „мъртвите" са над половината, дефектът почти сигурно е в тази
// подложка, не в базата. Тогава числото не е находка, а счупен уред.
// 🪤 18.08: този пазач беше САМО коментар — обещание без нито един ред
// код под него. Точно затова първото „100% мъртви" е трябвало да бъде
// хванато от уреда, а е било хванато на ръка. Сега го има наистина.
if (проверени === 0) {
  console.log('\n🔴 ПАЗАЧ: 0 ПРОВЕРЕНИ ключа. Това не е „чисто" — това е счупен уред.');
  process.exitCode = 1;
} else if (мъртви.length > проверени / 2) {
  console.log('\n🔴 ПАЗАЧ: ' + мъртви.length + ' от ' + проверени + ' излизат мъртви (над половината).');
  console.log('   Почти сигурно е счупена подложка (голо KB, липсващ helper), не счупена база.');
  console.log('   Числото по-горе НЕ е находка. Провери зареждането, преди да пипаш kb.js.');
  process.exitCode = 1;
}
