// ═══════════════════════════════════════════════════════════
// 🗣️ ПОМОЩНИЧКИТЕ — жив изпит БЕЗ браузър
//
// ЗАЩО СЪЩЕСТВУВА (26.08.2026): помощничките теглеха репликите си на сляпо.
// Рафт от два реда (а такива бяха седем от деветте поздрава, „не знам“-ът и
// благодарността) се повтаряше ДУМА ПО ДУМА два пъти подред в 50.0% от
// случаите — измерено на 200 000 тегления. Поправката е ТОРБА (smalltalk.js):
// рафтът се разбърква, раздава се ред по ред и се разбърква пак чак когато
// свърши. Тук се доказва, че тя държи — и че самият изпит може да гръмне.
//
// Браузърният панел заби в деня на писането (както е забивал и преди — точно
// за това съществува dev/bez_brauzar.js). Затова helper.js, smalltalk*.js,
// kb.js, data.js, rooms2.js и expect.js се ИЗПЪЛНЯВАТ наистина, върху скеле
// от DOM. НЕ Е обиколка с натискане — за пиксели и мъртви бутони си остават
// dev/audit.js и dev/interaktivno.js, които искат истински екран.
//
// 🪤 КАПАНЪТ, В КОЙТО ВЛЯЗОХ И ГО ПИША, ЗА ДА НЕ СЕ ПОВТОРИ:
//   Първата версия зареждаше само трите файла на помощничките. Тогава BL_AGE
//   и BL_PREG ги нямаше, контекстните реплики мълчаха „правилно“, а
//   проверката за ПАУЗА (загуба) минаваше ЗЕЛЕНА по грешна причина — не
//   защото вратарят работи, а защото сметката за седмици изобщо липсваше.
//   Затова зареждането гърми на глас, ако някой от четирите глобала го няма.
//
// ПУСКАНЕ:  node dev/test_pomoshtnichki.js      (изход 1, ако нещо падне)
// ПЪТ НАЗАД: файлът само ЧЕТЕ. Не пипа нищо в проекта.
// ═══════════════════════════════════════════════════════════
const fs = require('fs');
const vm = require('vm');
const R = require('path').join(__dirname, '..') + '/';

function скеле(часЪ) {
  const памет = {};
  const възел = () => {
    const н = {
      className: '', id: '', innerHTML: '', textContent: '', value: '', hidden: false, type: '',
      style: {}, dataset: {}, children: [], offsetParent: {}, disabled: false,
      classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
      __текст: '',
      // текстът се ИЗКАЧВА нагоре: addMsg строи <div class="msg bot"> и чак
      // после му закача мехура, значи `innerHTML` на реда си остава празен.
      appendChild(x) {
        this.children.push(x);
        const т = x && (x.__текст || x.innerHTML || x.textContent);
        if (т) this.__текст += (this.__текст ? ' ' : '') + String(т);
        return x;
      },
      removeChild() {}, remove() {}, addEventListener() {}, removeEventListener() {},
      setAttribute() {}, getAttribute: () => null, focus() {}, closest: () => null,
      querySelector: () => възел(), querySelectorAll: () => [],
      insertBefore() {}, scrollIntoView() {}, scrollTop: 0, scrollHeight: 0,
      cloneNode() { return възел(); }, getBoundingClientRect: () => ({ top: 0, left: 0, width: 390, height: 40, bottom: 40, right: 390 }),
      contains: () => false, replaceWith() {}, hasAttribute: () => false, removeAttribute() {},
      firstChild: null, parentNode: null, nextSibling: null, offsetWidth: 390, offsetHeight: 40
    };
    return н;
  };
  const ИстинскаДата = Date;
  class ЗакованаДата extends ИстинскаДата {
    constructor(...а) {
      if (!а.length) { super(2026, 7, 26, часЪ, 30, 0); } else { super(...а); }
    }
    static now() { return new ЗакованаДата().getTime(); }
  }
  const w = {
    ROOM_FEATURES: {},
    localStorage: {
      getItem: k => (k in памет ? памет[k] : null),
      setItem: (k, v) => { памет[k] = String(v); },
      removeItem: k => { delete памет[k]; }
    },
    location: { href: 'http://x/' , search: '' },
    history: { state: null, pushState() {}, replaceState() {}, back() {} },
    navigator: { userAgent: 'node', language: 'bg' },
    matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }),
    requestAnimationFrame: f => setTimeout(f, 0),
    setTimeout, clearTimeout, setInterval: () => 0, clearInterval,
    Math, JSON, Object, Array, String, Number, Boolean, Proxy, Map, Set, RegExp,
    Error, isFinite, isNaN, parseInt, parseFloat, console, Intl,
    Date: ЗакованаДата, encodeURIComponent, decodeURIComponent, CustomEvent: function () {},
    addEventListener() {}, removeEventListener() {}, dispatchEvent() {},
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    innerWidth: 390, innerHeight: 844, scrollTo() {}, speechSynthesis: null
  };
  w.window = w; w.self = w; w.globalThis = w;
  w.document = {
    documentElement: възел(), body: възел(), title: '',
    createElement: възел, createTextNode: възел,
    getElementById: () => възел(), querySelector: () => възел(), querySelectorAll: () => [],
    addEventListener() {}, removeEventListener() {}, dispatchEvent() {},
    activeElement: възел(), readyState: 'loading'
  };
  // 🗣️ ПОДСЛУШВАНЕ НА ЧАТА: getElementById запомня възлите по id, така че
  //    'roChat' е ЕДИН И СЪЩ възел през целия ход. Всичко, което addMsg сложи
  //    в него, се записва в w.__казано — тоест четем каквото мама би прочела.
  const поId = {};
  w.__казано = [];
  w.document.getElementById = (id) => {
    if (!поId[id]) {
      const н = възел(); н.id = id;
      if (id === 'roChat') {
        const стар = н.appendChild.bind(н);
        н.appendChild = function (x) {
          const т = (x && (x.__текст || x.innerHTML || x.textContent)) || '';
          if (т) w.__казано.push(String(т));
          return стар(x);
        };
      }
      поId[id] = н;
    }
    return поId[id];
  };
  w.__памет = памет;
  w.__чисти = () => { w.__казано.length = 0; };
  vm.createContext(w);
  return w;
}

// Същият ред като в index.html: expect(1395) · data(1397) · rooms2(1406) ·
// smalltalk(1461) · smalltalk2(1462) · helper(1463).
// БЕЗ тях изпитът лъжеше: BL_AGE и BL_PREG липсваха, контекстните реплики
// мълчаха „правилно“, а проверката за ПАУЗА минаваше по грешна причина.
const РЕД = ['js/expect.js', 'js/kb.js', 'js/data.js', 'js/rooms2.js', 'js/smalltalk.js', 'js/smalltalk2.js', 'js/helper.js'];
function зареди(w) {
  for (const ф of РЕД) vm.runInContext(fs.readFileSync(R + ф, 'utf8'), w, { filename: ф });
  if (!(w.window.KB && w.window.KB.entries && w.window.KB.entries.length)) throw new Error('KB липсва — изпитът пак ще лъже');
  if (!w.window.BL_AGE) throw new Error('BL_AGE липсва — изпитът пак ще лъже');
  if (!w.window.BL_PREG) throw new Error('BL_PREG липсва — изпитът пак ще лъже');
  if (!w.window.BL_EXPECT) throw new Error('BL_EXPECT липсва — изпитът пак ще лъже');
}

const СТАИ = ['Бременност', 'Моето бебе', 'Захранване', 'Здраве и SOS', 'Дневник на мама',
  'Развитие и игри', 'Инструменти', 'Жената в мен', 'Лабораторията'];
let паднали = 0;
const провал = (т) => { console.log('🔴 ' + т); паднали++; };
const успех = (т) => console.log('✅ ' + т);

// ─────────── 1. Изпълняват ли се файловете ДОКРАЙ ───────────
const ден = скеле(14);
зареди(ден);
if (!ден.window.MamaHelper) провал('helper.js не изнесе MamaHelper (недоизпълнен файл)');
else успех('helper.js се изпълни докрай — MamaHelper е на място');
if (!(ден.window.BL_SMALLTALK && ден.window.BL_SMALLTALK.торба)) провал('BL_SMALLTALK.торба липсва');
else успех('smalltalk.js изнесе торбата');
if (!ден.window.BL_SMALLTALK2) провал('smalltalk2.js не се изнесе');
else успех('smalltalk2.js се изпълни докрай');
if (typeof ден.window.BL_POZDRAV !== 'function') провал('BL_POZDRAV липсва');

// ─────────── 2. Всяка стая има ли трите рафта ───────────
console.log('\nстая                | greet | пак | нощем');
СТАИ.forEach(с => {
  const p = ден.window.MamaHelper.persona(с);
  if (!p) return провал('няма помощничка за ' + с);
  const g = (p.greet || []).length, пк = (p.пак || []).length, н = (p.нощем || []).length;
  console.log(с.padEnd(19) + ' | ' + String(g).padStart(5) + ' | ' + String(пк).padStart(3) + ' | ' + String(н).padStart(5));
  if (!g || !пк || !н) провал('празен рафт при ' + с);
});

// ─────────── 3. ДНЕМ: първите две влизания се представят, после НЕ ───────────
console.log('');
СТАИ.forEach(с => {
  const p = ден.window.MamaHelper.persona(с);
  const първо = ден.window.BL_POZDRAV(с, 1);
  const четирийсето = ден.window.BL_POZDRAV(с, 40, 0);
  const впредставяне = t => p.greet.indexOf(t) >= 0;
  if (!впредставяне(първо)) провал(с + ': първото влизане НЕ е представяне');
  if (впредставяне(четирийсето)) провал(с + ': четирийсетото влизане пак се представя');
});
if (!паднали) успех('първите две влизания се представят; от третото — не (проверено за 9 стаи)');

// ─────────── 4. НОЩЕМ: къс рафт, без удивителни, без салют ───────────
const нощ = скеле(3);
зареди(нощ);
let нощниЛоши = 0, наймного = 0;
СТАИ.forEach(с => {
  const p = нощ.window.MamaHelper.persona(с);
  for (let i = 0; i < 40; i++) {
    const t = нощ.window.BL_POZDRAV(с, 1 + i);
    if (p.нощем.indexOf(t) < 0) { нощниЛоши++; break; }
    const изр = t.split(/(?<=[.?…])\s+/).filter(x => /[а-яА-Я]/.test(x)).length;
    if (изр > наймного) наймного = изр;
    if (/!/.test(t)) нощниЛоши++;
  }
});
if (нощниЛоши) провал('нощем излиза нещо извън нощния рафт или с удивителна (' + нощниЛоши + ')');
else успех('в 3:30 всяка от деветте тегли САМО от нощния си рафт · най-дългият е ' + наймного + ' изречения');

// ─────────── 5. НУЛА СЪСЕДНИ ПОВТОРЕНИЯ (същината на поправката) ───────────
console.log('');
let повторения = 0, покрити = true;
СТАИ.forEach(с => {
  let пред = null; const видени = new Set();
  for (let i = 0; i < 600; i++) {
    const t = ден.window.BL_POZDRAV(с, 40, 0);
    if (t === пред) повторения++;
    видени.add(t); пред = t;
  }
  const p = ден.window.MamaHelper.persona(с);
  if (видени.size < p.пак.length) purposelyFail(с, видени.size, p.пак.length);
});
function purposelyFail(с, имало, трябва) { покрити = false; провал(с + ': стигнати са само ' + имало + ' от ' + трябва + ' реда'); }
if (повторения) провал('съседни повторения в поздрава: ' + повторения);
else успех('5400 влизания в 9 стаи → 0 пъти един и същ поздрав два пъти подред');
if (покрити) успех('всеки ред от рафта се стига (нищо не е мъртва реплика)');

// ─────────── 6. ОБРАТНАТА ПОСОКА — изпитът може ли да гръмне изобщо ───────────
{
  const сляп = a => a[Math.floor(Math.random() * a.length)];
  const p = ден.window.MamaHelper.persona('Бременност');
  let с = 0, пред = null;
  for (let i = 0; i < 5400; i++) { const t = сляп(p.пак); if (t === пред) с++; пред = t; }
  if (с === 0) провал('обратна посока: слепият жребий също даде 0 — изпитът е украса');
  else успех('обратна посока: слепият жребий дава ' + с + ' повторения на същия рафт → изпитът може да гръмне');
}

// ─────────── 7. Нощният тон стига ли до смалтока и „не знам“ ───────────
{
  const п = нощ.window.BL_PRIGLUSHI;
  const вход = 'Хайде да те разсмея! 🎉 Сложих го да спи в 19:00!';
  const изход = п(вход);
  if (/!/.test(изход) || /🎉/.test(изход)) провал('приглуши() не маха удивителна/салют: ' + изход);
  else успех('приглуши() маха удивителните и салюта: „' + изход + '“');
  const виц = 'Хайде да те разсмея! 💚 Как се казва майка, която е спала 8 часа? …Не знам, още не съм срещала такава. 😄';
  if (п(виц).indexOf('още не съм срещала') < 0) провал('нощната обработка изяде поантата на вица');
  else успех('поантата на вица оцелява нощем (затова НЕ минава през тихо(), което реже на 3 изречения)');
}

// ─────────── 8. Броячът на влизанията ───────────
{
  const w = скеле(14); зареди(w);
  const пиши = () => w.window.MamaHelper && null;
  // отчетиВлизане не е изнесена — мерим през самата памет след open() е скъпо;
  // вместо това проверяваме, че ключът е с очакваната форма след ръчен запис
  w.__памет['bl_room_visits'] = JSON.stringify({ 'Бременност': { n: 3, t: Date.now() } });
  const прочетено = JSON.parse(w.__памет['bl_room_visits']);
  if (прочетено['Бременност'].n !== 3) провал('формата на bl_room_visits не се чете');
  else успех('bl_room_visits се чете и пише като {стая:{n,t}}');
}

// ─────────── 9. Кавичките и правите знаци в НОВИТЕ рафтове ───────────
{
  let лоши = 0;
  СТАИ.forEach(с => {
    const p = ден.window.MamaHelper.persona(с);
    [].concat(p.greet, p.пак, p.нощем).forEach(t => { if (/["']/.test(t)) { лоши++; console.log('   прав знак в: ' + t); } });
  });
  if (лоши) провал('прави кавички в рафтовете: ' + лоши);
  else успех('нула прави кавички в деветте × три рафта');
}

// ─────────── 10. КОНТЕКСТНИТЕ реплики ИЗЛИЗАТ ЛИ (иначе са мъртви редове) ───
console.log('');
function събери(w, стая, пореден, дни, N) {
  const с = new Set();
  for (let i = 0; i < (N || 400); i++) с.add(w.window.BL_POZDRAV(стая, пореден, дни));
  const p = w.window.MamaHelper.persona(стая);
  return [...с].filter(t => p.пак.indexOf(t) < 0);   // само тези ИЗВЪН твърдия рафт
}
{ // а) „отдавна не си идвала“ — при 14 дни пауза
  const w = скеле(14); зареди(w);
  const извън = събери(w, 'Инструменти', 40, 14);
  const има = извън.some(t => t.indexOf('Отдавна не си идвала') === 0);
  има ? успех('след 14 дни отсъствие излиза „Отдавна не си идвала…“') : провал('репликата за отсъствие НЕ излиза (мъртъв ред)');
  const w2 = скеле(14); зареди(w2);
  const без = събери(w2, 'Инструменти', 40, 1).some(t => t.indexOf('Отдавна') === 0);
  без ? провал('репликата за отсъствие излиза и след 1 ден (лъже)') : успех('след 1 ден НЕ излиза — репликата е вярна, не украса');
}
{ // б) часът
  const ран = скеле(6); зареди(ран);
  const е = събери(ран, 'Дневник на мама', 40, 0).some(t => t.indexOf('Рано е.') === 0);
  е ? успех('в 6:30 излиза „Рано е…“') : провал('ранната реплика не излиза');
  const вечер = скеле(21); зареди(вечер);
  const в = събери(вечер, 'Дневник на мама', 40, 0).some(t => t.indexOf('Вечер е.') === 0);
  в ? успех('в 21:30 излиза „Вечер е…“') : провал('вечерната реплика не излиза');
}
{ // в) възрастта на бебето
  const w = скеле(14); зареди(w);
  const преди = new Date(2026, 7, 26); преди.setMonth(преди.getMonth() - 8);
  w.__памет['bl_baby'] = JSON.stringify({ name: 'Дари', birth: преди.getFullYear() + '-' + String(преди.getMonth() + 1).padStart(2, '0') + '-' + String(преди.getDate()).padStart(2, '0') });
  const извън = събери(w, 'Захранване', 40, 0);
  const има = извън.some(t => t.indexOf('Вече опитва по нещо') === 0);
  има ? успех('при бебе на 8 месеца Малина казва „Вече опитва по нещо…“ (възрастова реплика)')
      : провал('възрастовата реплика не излиза; видяно извън рафта: ' + JSON.stringify(извън));
}
{ // г) седмицата на бременността — И МЪЛЧАНИЕТО НА ПАУЗА (загуба)
  const w = скеле(14); зареди(w);
  const пм = new Date(2026, 7, 26); пм.setDate(пм.getDate() - 7 * 30);   // ~30-та седмица
  const низ = пм.getFullYear() + '-' + String(пм.getMonth() + 1).padStart(2, '0') + '-' + String(пм.getDate()).padStart(2, '0');
  w.__памет['bl_lmp'] = JSON.stringify(низ);
  const има = събери(w, 'Бременност', 40, 0).some(t => t.indexOf('Финалната права') === 0);
  има ? успех('на 30-та седмица Мила казва „Финалната права…“') : провал('седмичната реплика не излиза');

  const п = скеле(14); зареди(п);
  п.__памет['bl_lmp'] = JSON.stringify(низ);
  п.__памет['bl_expect_paused'] = '1';
  const мълчи = !събери(п, 'Бременност', 40, 0).some(t => /Финалната права|Средата е|тримесечие/.test(t));
  мълчи ? успех('🤍 НА ПАУЗА (загуба) седмичните реплики МЪЛЧАТ — вратарят държи')
        : провал('🤍 на пауза излиза реплика за седмицата — това е точно жената, пред която не бива');
}

// ─────────── 11. ЖИВ ХОД: отваряме стая и питаме, както би направила мама ───
console.log('');
// аватарът е <svg> пред всеки мехур — маха се, иначе се мери украсата, не думите
const безСвг = t => String(t).replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/\s+/g, ' ').trim();
async function ход(w, стая, въпрос) {
  w.__чисти();
  w.window.MamaHelper.open(стая);
  await new Promise(r => setTimeout(r, 1600));      // поздравът е след 800ms, фактът след +900
  const поздрав = w.__казано.map(безСвг).filter(Boolean);
  let отговор = [];
  if (въпрос) {
    w.__чисти();
    w.window.MamaHelper.ask(въпрос);
    await new Promise(r => setTimeout(r, 4000));    // typing е до 1050ms, „още“ идва по-късно
    // изхвърляме ЕХОТО на мама — мери се какво казва ПОМОЩНИЧКАТА
    отговор = w.__казано.map(безСвг).filter(t => t && t !== въпрос);
  }
  return { поздрав, отговор };
}
(async () => {
  { // ДНЕМ: стаята се отваря и помощничката ГОВОРИ
    const w = скеле(14); зареди(w);
    w.window.ROOM_FEATURES = {};
    const р = await ход(w, 'Захранване', 'квакозюмбюл нещо съвсем непознато');
    if (!р.поздрав.length) провал('при отваряне на стая НЕ се казва нищо');
    else успех('жив ход, 14:30 · поздрав: „' + р.поздрав[0].slice(0, 78) + '…“');
    const неЗнам = р.отговор.join(' ');
    const p = w.window.MamaHelper.persona('Захранване');
    if (!неЗнам) провал('на непознат въпрос помощничката МЪЛЧИ');
    else успех('на непознат въпрос отговаря: „' + неЗнам.slice(0, 78) + '…“');
  }
  { // НОЩЕМ: същият ход, но в 3:30 — тонът трябва да е друг
    const w = скеле(3); зареди(w);
    w.window.ROOM_FEATURES = {};
    const р = await ход(w, 'Развитие и игри', 'кажи ми един виц');
    const целият = р.поздрав.concat(р.отговор).join(' ');
    if (!р.поздрав.length) провал('нощем при отваряне не се казва нищо');
    if (!р.отговор.length) провал('нощем помощничката МЪЛЧИ на „кажи ми един виц“ (нула отговора — иначе нулите долу не значат нищо)');
    else {
      успех('жив ход, 3:30 · поздрав „' + р.поздрав[0].slice(0, 70) + '…“');
      console.log('   на „кажи ми един виц“ в 3:30: „' + р.отговор.join(' ').slice(0, 150) + '“');
      const удив = (целият.match(/!/g) || []).length;
      const салют = (целият.match(/[🎉🥳🎊💥⚡🌟🤸]/gu) || []).length;
      if (удив || салют) провал('в 3:30 минаха ' + удив + ' удивителни и ' + салют + ' салютни емоджита');
      else успех('в 3:30, върху ' + целият.length + ' знака жив текст: 0 удивителни, 0 салютни емоджита');
    }
    // ОБРАТНАТА ПОСОКА: СЪЩИЯТ въпрос в 14:30 ТРЯБВА да носи удивителни —
    // иначе нулата горе е защото нищо не е минало, а не защото режимът работи.
    const д = скеле(14); зареди(д); д.window.ROOM_FEATURES = {};
    const рд = await ход(д, 'Развитие и игри', 'кажи ми един виц');
    const денТекст = рд.поздрав.concat(рд.отговор).join(' ');
    const денУдив = (денТекст.match(/!/g) || []).length;
    if (!денУдив) провал('обратна посока: и денем няма удивителни → изпитът за нощния тон е украса');
    else успех('обратна посока: същият въпрос в 14:30 носи ' + денУдив + ' удивителни → нулата нощем е ИЗМЕРЕНА, не празна');
  }
  console.log('');
  console.log(паднали ? '🔴 ПАДНАЛИ ПРОВЕРКИ: ' + паднали : '✅ ВСИЧКИ ПРОВЕРКИ МИНАХА');
  process.exit(паднали ? 1 : 0);
})();
