// ═══════════════════════════════════════════════════════════
// ⏱️ ВРЕМЕТО — един екран, две възрасти?
//
// Уредът слага ЕДНО ДО ДРУГО всяко място в приложението, което казва на
// майката „бебето е на …“ или „това ще стане на …“, за няколко въображаеми
// бебета. Противоречието се вижда веднага, защото числата са на един ред.
//
// ПУСКАНЕ:  node dev/vremeto.js
//           node dev/vremeto.js --podrobno     (показва и ваксинните редове)
//
// КАК: файловете се зареждат В ИСТИНСКИЯ ИМ ВИД в пясъчник (vm), а „сега“ се
// подменя с фалшив Date — така един и същи ден може да се изиграе за бебе,
// родено на 31-ви, и за бебе, родено на 29 февруари.
//
// ⚠️ МЯРКА, КОЯТО НЕ МОЖЕ ДА ГРЪМНЕ, НЕ МЕРИ. Затова:
//    · всяка изрязана функция се проверява ДАЛИ Е НАМЕРЕНА (иначе СПИРА)
//    · всяка грешка се ОТПЕЧАТВА, не се гълта
//    · накрая се казва КОЛКО СЦЕНАРИЯ и КОЛКО МЕРКИ са прегледани
// ═══════════════════════════════════════════════════════════
'use strict';
// ⚠️ ЧАСОВИЯТ ПОЯС СЕ ПОДМЕНЯ ПРЕДИ ВСЯКО ДОКОСВАНЕ ДО Date.
//    (`TZ=... node …` се ГЛЪЩА МЪЛЧАЛИВО на Windows — измерено: връща EEST.
//     process.env.TZ отвътре работи. Затова е тук, на първия ред.)
const _зона = (process.argv.find(x => x.indexOf('--zona=') === 0) || '').split('=')[1];
if (_зона) process.env.TZ = _зона;

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const ПОДРОБНО = process.argv.includes('--podrobno');
// --staro: чете файловете от ПОСЛЕДНИЯ КОМИТ, не от диска. Така „преди“ и
// „след“ се мерят с ЕДИН И СЪЩИ уред — иначе сравняваме две различни линийки.
const СТАРО = process.argv.includes('--staro');
const _кеш = {};   // 102 git-повиквания на пускане правеха уреда неизползваем
const чети = f => {
  if (_кеш[f] === undefined) {
    _кеш[f] = СТАРО
      ? require('child_process').execSync('git show HEAD:' + f, { cwd: ROOT, encoding: 'utf8', maxBuffer: 40e6 })
      : fs.readFileSync(path.join(ROOT, f), 'utf8');
  }
  return _кеш[f];
};

// ── изрязване на ЧАСТНА функция от файл (тези вътре в IIFE нямат глобал) ──
// Броим къдравите скоби. Ако функцията не се намери — ГРЪМВА, не мълчи.
function изрежи(файл, име) {
  const src = чети(файл);
  const нач = src.indexOf('function ' + име + '(');
  if (нач < 0) throw new Error('НЕ НАМЕРИХ function ' + име + ' в ' + файл);
  let i = src.indexOf('{', нач), дълб = 0, край = -1;
  for (; i < src.length; i++) {
    const c = src[i];
    if (c === '{') дълб++;
    else if (c === '}') { дълб--; if (дълб === 0) { край = i + 1; break; } }
  }
  if (край < 0) throw new Error('НЕ ЗАТВОРИХ function ' + име + ' в ' + файл);
  return src.slice(нач, край);
}
// изрязване на масив-константа: `const ИМЕ = [ … ];`
function изрежиМасив(файл, име) {
  const src = чети(файл);
  const нач = src.indexOf('const ' + име + ' = [');
  if (нач < 0) throw new Error('НЕ НАМЕРИХ const ' + име + ' = [ в ' + файл);
  let i = src.indexOf('[', нач), дълб = 0, край = -1;
  for (; i < src.length; i++) {
    const c = src[i];
    if (c === '[') дълб++;
    else if (c === ']') { дълб--; if (дълб === 0) { край = i + 1; break; } }
  }
  if (край < 0) throw new Error('НЕ ЗАТВОРИХ ' + име + ' в ' + файл);
  return src.slice(src.indexOf('[', нач), край);
}

// ── пясъчник с ПОДМЕНЕНО „сега“ ──
function пясъчник(сегаМс, склад) {
  const Истински = Date;
  class Фалшив extends Истински {
    constructor(...a) { if (a.length === 0) super(сегаМс); else super(...a); }
    static now() { return сегаМс; }
    static parse(s) { return Истински.parse(s); }
    static UTC(...a) { return Истински.UTC(...a); }
  }
  const w = {};
  const данни = Object.assign({}, склад || {});
  Object.assign(w, {
    console, setTimeout: (f) => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
    Math, JSON, Date: Фалшив, RegExp, String, Number, Object, Array, Boolean, Error,
    Map, Set, WeakMap, WeakSet, Promise, Intl, Symbol, Proxy, Reflect,
    encodeURIComponent, decodeURIComponent, isNaN, isFinite, parseInt, parseFloat,
    CustomEvent: function (t, o) { return { type: t, detail: o && o.detail }; }
  });
  w.localStorage = {
    getItem: k => (k in данни ? данни[k] : null),
    setItem: (k, v) => { данни[k] = String(v); },
    removeItem: k => { delete данни[k]; },
    clear: () => { Object.keys(данни).forEach(k => delete данни[k]); },
    key: i => Object.keys(данни)[i] || null,
    get length() { return Object.keys(данни).length; }
  };
  const възел = () => ({
    style: {}, dataset: {}, classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    appendChild() {}, prepend() {}, insertAdjacentElement() {}, remove() {}, setAttribute() {},
    getAttribute: () => '', addEventListener() {}, removeEventListener() {},
    querySelector: () => null, querySelectorAll: () => [], textContent: '', innerHTML: '',
    isConnected: true, hidden: false, value: '', focus() {}
  });
  w.document = Object.assign(възел(), {
    documentElement: възел(), body: възел(), head: възел(),
    createElement: възел, getElementById: () => null,
    readyState: 'complete', dispatchEvent() {}
  });
  w.addEventListener = function () {};
  w.dispatchEvent = function () {};
  w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  w.requestAnimationFrame = () => 0;
  w.getComputedStyle = () => ({ getPropertyValue: () => '' });
  w.navigator = { userAgent: 'node', language: 'bg' };
  w.location = { href: 'http://localhost/', search: '', hash: '' };
  w.window = w;
  vm.createContext(w);
  w.globalThis = w;
  return w;
}

// РЕДЪТ Е ТОЧНО КАТО В index.html (redna 1390 · data 1397 · rooms2 1399 ·
// yearbook2 1421 · today8 1470) — иначе обвивките BL_TODAY_EXTRAS се навиват
// в друг ред и мерим приложение, което не съществува.
const ФАЙЛОВЕ = ['js/redna.js', 'js/data.js', 'js/rooms2.js',
                 'js/yearbook.js', 'js/yearbook2.js', 'js/today8.js'];
// „лекът в чужд файл“: BL_DATE.addMonths чете „YYYY-MM-DD“ като полунощ по
// Гринуич. Флагът --lek-data го кърпи САМО В ПАМЕТТА, за да се измери какво
// би станало, ако js/data.js се поправи. Нищо не се записва на диска.
const ЛЕК_DATA = process.argv.includes('--lek-data');

function зареди(сегаМс, склад) {
  const W = пясъчник(сегаМс, склад);
  const гърмежи = [];
  ФАЙЛОВЕ.forEach(f => {
    let src = чети(f);
    if (ЛЕК_DATA && f === 'js/data.js') {
      src = src.replace('const x = new Date(date);',
        'const _m = /^(\\d{4})-(\\d{2})-(\\d{2})/.exec(String(date));\n' +
        '    const x = _m ? new Date(+_m[1], +_m[2] - 1, +_m[3]) : new Date(date);');
      if (src.indexOf('_m[3]') < 0) throw new Error('--lek-data НЕ СЕ ПРИЛОЖИ — котвата в data.js се е сменила');
    }
    try { new vm.Script(src, { filename: f }).runInContext(W); }
    catch (e) { гърмежи.push(f + ': ' + e.message); }
  });
  if (гърмежи.length) { гърмежи.forEach(g => console.error('  ⛔ ' + g)); }
  if (!W.BL_AGE) throw new Error('BL_AGE липсва — пясъчникът е МЪРТЪВ, мерките му са боклук');
  if (!W.BL_DATE) throw new Error('BL_DATE липсва — пясъчникът е МЪРТЪВ');
  if (!W.BL_VACCINES) throw new Error('BL_VACCINES липсва — пясъчникът е МЪРТЪВ');
  if (!W.BL_TODAY8) throw new Error('BL_TODAY8 липсва — today8.js не се е закачил');
  W.__гърмежи = гърмежи;
  return W;
}

// ── частните функции, изрязани от истинските файлове ──
const ИЗВАДКИ = {
  'checkups.възрастМесеци': ['js/checkups.js', 'възрастМесеци'],
  'firstday.времеЗа': ['js/firstday.js', 'времеЗа'],
  'expr.възрастНа': ['js/expr.js', 'възрастНа'],
  'dates2.високосно': ['js/dates2.js', 'високосно']
};
const ПРЕГЛЕДИ_SRC = изрежиМасив('js/checkups.js', 'ПРЕГЛЕДИ');

function закачиЧастни(W) {
  W.load = vm.runInContext(
    '(function(k,d){try{var v=JSON.parse(localStorage.getItem(k));if(v==null)return d;' +
    'if(Array.isArray(d)!==Array.isArray(v))return d;return v;}catch(e){return d;}})', W);
  W.getBaby = vm.runInContext('(function(){return load("bl_baby",{name:"",sex:"",birth:""});})', W);
  Object.keys(ИЗВАДКИ).forEach(име => {
    const [файл, фн] = ИЗВАДКИ[име];
    const src = изрежи(файл, фн);
    W['__' + фн] = vm.runInContext('(' + src + ')', W);
    if (typeof W['__' + фн] !== 'function') throw new Error('изрязаното ' + име + ' не е функция');
  });
  W.__ПРЕГЛЕДИ = vm.runInContext(ПРЕГЛЕДИ_SRC, W);
  if (!Array.isArray(W.__ПРЕГЛЕДИ) || !W.__ПРЕГЛЕДИ.length) throw new Error('ПРЕГЛЕДИ не се изряза');
  return W;
}

// ── всяко място, което казва възраст/дата, пресметнато за един сценарий ──
function мерки(W) {
  const б = W.getBaby();
  const a = W.BL_AGE(б.birth);
  const now = new W.Date();
  const out = { a };

  // 1. „Днес“ — редът с възрастта (rooms2.renderToday)
  out.възрастТекст = a ? a.text : '(няма)';

  // 2. „Днес“ — банерът за месечнина (rooms2.renderToday, копие на логиката)
  out.банер = '';
  if (a) {
    const дн = д => д.getFullYear() + '-' + д.getMonth() + '-' + д.getDate();
    [a.ym, a.ym + 1].forEach(м => {
      if (м < 1) return;
      const д = W.BL_DATE.addMonths(б.birth, м);
      if (дн(д) === дн(now)) {
        out.банер = м % 12 === 0 ? (м / 12) + (м / 12 === 1 ? ' годинка' : ' годинки') : м + '-месечнина';
      }
    });
  }

  // 3. today8.празник() — балоните на целия екран
  out.балони = W.BL_TODAY8.празник();

  // 4. home2.важнотоСега — редът „N месеца днес“ (само месечната част)
  out.home2 = '';
  if (a && б.birth) {
    const дн = д => д.getFullYear() + '-' + д.getMonth() + '-' + д.getDate();
    const днес = [a.ym, a.ym + 1].some(м => м >= 1 && дн(W.BL_DATE.addMonths(б.birth, м)) === дн(now));
    if (днес && a.ym >= 1) {
      out.home2 = (a.ym % 12 === 0 ? (a.ym / 12) + ' годинк' + (a.ym / 12 === 1 ? 'а' : 'и')
                                   : a.ym + (a.ym === 1 ? ' месец' : ' месеца')) + ' днес';
    }
  }

  // 5. checkups — коя възраст в месеци вижда картата на прегледите
  out.ckМесеци = W.__възрастМесеци();
  const П = W.__ПРЕГЛЕДИ, m = out.ckМесеци;
  let индекс = -1;
  if (m != null) {
    индекс = П.findIndex(([от, до]) => m >= от && m <= до);
    if (индекс < 0) индекс = П.findIndex(([от]) => от > m);
  }
  out.ckСега = индекс >= 0 ? П[индекс][3] : '(никой)';
  out.ckПропуснати = m == null ? [] : П.filter(([от, до]) => m > до).map(x => x[3]);

  // 6. ваксините — какво пише на всеки ред (rooms2.renderHealth)
  out.ваксини = [];
  if (б.birth) {
    const b0 = (function () {
      const мм = /^(\d{4})-(\d{2})-(\d{2})/.exec(б.birth);
      return мм ? new W.Date(+мм[1], +мм[2] - 1, +мм[3]) : new W.Date(б.birth);
    })();
    W.BL_VACCINES.forEach(v => {
      const dd = W.BL_DATE.addMonths(b0, v.m);
      let седм = '';
      if (v.m > 0 && v.m <= 4) {
        const н = Math.round((dd - b0) / 86400000);
        седм = (Math.floor(н / 7) + 1) + '-та седмица';
      }
      out.ваксини.push({
        месец: v.m, име: v.n, дата: dd.toLocaleDateString('bg-BG'), седмица: седм,
        близо: !!(a && v.m > 0 && Math.abs(a.months - v.m) < 1)
      });
    });
  }

  // 7. yearbook2 — „След N дни е големият ден“ (ИСТИНСКИЯТ код, през обвивката
  //    BL_TODAY_EXTRAS, точно както „Днес“ го вика)
  out.yb = '';
  if (typeof W.BL_TODAY_EXTRAS !== 'function') throw new Error('BL_TODAY_EXTRAS липсва — yearbook2.js не се е закачил');
  const извън = String(W.BL_TODAY_EXTRAS(б, a) || '');
  const мyb = /<div class="td-yb">📔 ([^—]+) —/.exec(извън);
  if (мyb) out.yb = мyb[1].trim();

  // 8. firstday.времеЗа — светващата стая
  try { const в = W.__времеЗа(); out.fd = в ? в[0] : ''; }
  catch (e) { out.fd = '⛔ ' + e.message; }

  // 9. expr.възрастНа — печатът върху СПОДЕЛЕНАТА снимка (остава завинаги)
  out.снимка = W.__възрастНа(now.getTime());

  // 10. yearbook2 — от кога светва бутонът „книгата на ПЪРВАТА година“
  out.yb1 = ((now.getTime() - new W.Date(б.birth)) / (30.4375 * 86400000)) >= 11;

  // 11. dates2.високосно — картата за роденото на 29 февруари
  W.save = vm.runInContext('(function(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}})', W);
  W.esc = vm.runInContext('(function(s){return String(s==null?"":s);})', W);
  out.високосно = !!W.__високосно(б);

  return out;
}

// ── сценариите ──
function д(y, m, dd) { return new Date(y, m - 1, dd, 9, 30, 0); }   // 9:30 сутринта
function дата(x) { return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); }
function преди(дни, днес) { const x = new Date(днес); x.setDate(x.getDate() - дни); return дата(x); }

const ДНЕС = д(2026, 8, 19);
const СЦЕНАРИИ = [];
[1, 13, 28, 31, 45, 183, 396, 730].forEach(n => {
  СЦЕНАРИИ.push({ име: 'бебе на ' + n + ' дни', раждане: преди(n, ДНЕС), сега: ДНЕС });
});
// календарни капани
СЦЕНАРИИ.push({ име: '31 ян. → 28 фев. (къс месец)', раждане: '2026-01-31', сега: д(2026, 2, 28) });
СЦЕНАРИИ.push({ име: '31 ян. → 1 март', раждане: '2026-01-31', сега: д(2026, 3, 1) });
СЦЕНАРИИ.push({ име: '29 фев. → 28 фев. (високосно)', раждане: '2024-02-29', сега: д(2025, 2, 28) });
СЦЕНАРИИ.push({ име: '1 ян. → 1 фев. (точно 1 месец)', раждане: '2026-01-01', сега: д(2026, 2, 1) });
СЦЕНАРИИ.push({ име: '1 ян. → 1 март (точно 2 месеца)', раждане: '2026-01-01', сега: д(2026, 3, 1) });
СЦЕНАРИИ.push({ име: '1 ян. → 1 апр. (точно 3 месеца)', раждане: '2026-01-01', сега: д(2026, 4, 1) });
СЦЕНАРИИ.push({ име: 'годинка ДНЕС', раждане: '2025-08-19', сега: д(2026, 8, 19) });
СЦЕНАРИИ.push({ име: 'годинка ДНЕС, но в 01:00', раждане: '2025-08-19', сега: new Date(2026, 7, 19, 1, 0, 0) });
СЦЕНАРИИ.push({ име: 'годинка след 3 дни', раждане: '2025-08-22', сега: д(2026, 8, 19) });

// ── пускане ──
let бройМерки = 0, бройПротиворечия = 0;
const противоречия = [];
function червено(сц, какво, ляво, дясно) {
  бройПротиворечия++;
  противоречия.push({ сц, какво, ляво, дясно });
}

console.log('⏱️  ВРЕМЕТО — една възраст ли казват всички екрани?');
console.log('    сценарии: ' + СЦЕНАРИИ.length + ' · файлове в пясъчника: ' + ФАЙЛОВЕ.length +
            ' · изрязани частни функции: ' + Object.keys(ИЗВАДКИ).length);
console.log('');

СЦЕНАРИИ.forEach(сц => {
  let W;
  try {
    W = закачиЧастни(зареди(сц.сега.getTime(), { bl_baby: JSON.stringify({ name: 'Мира', sex: 'girl', birth: сц.раждане }) }));
  } catch (e) {
    console.error('⛔ ' + сц.име + ' — ПЯСЪЧНИКЪТ ГРЪМНА: ' + e.message);
    console.error(e.stack.split('\n').slice(0, 4).join('\n'));
    process.exitCode = 1;
    return;
  }
  const r = mерки_безопасно(W, сц);
  if (!r) return;

  console.log('─'.repeat(78));
  console.log('▸ ' + сц.име + '   (роден ' + сц.раждане + ', днес ' + дата(сц.сега) + ')');
  const a = r.a;
  console.log('   BL_AGE:  totalDays=' + a.totalDays + '  ym=' + a.ym + '  days=' + a.days +
              '  months=' + a.months.toFixed(3) + '  devMonths=' + a.devMonths.toFixed(3));
  console.log('   „Днес“ пише            : ' + r.възрастТекст);
  console.log('   Банерът пише           : ' + (r.банер || '—'));
  console.log('   Балоните (today8)      : ' + (r.балони ? 'ДА' : 'не'));
  console.log('   Най-важното (home2)    : ' + (r.home2 || '—'));
  console.log('   Прегледите виждат мес. : ' + (r.ckМесеци == null ? '(няма)' : (+r.ckМесеци).toFixed(3)));
  console.log('   Прегледите светят      : ' + r.ckСега);
  console.log('   Прегледите „изпуснати“ : ' + (r.ckПропуснати.length ? r.ckПропуснати.join(' · ') : '—'));
  console.log('   Годишникът пише        : ' + (r.yb || '—'));
  console.log('   Печатът върху снимката : ' + (r.снимка || '—'));
  console.log('   Светваща стая          : ' + (r.fd || '—'));
  if (ПОДРОБНО) {
    r.ваксини.forEach(v => console.log('      💉 ' + String(v.месец).padStart(2) + ' мес · ' +
      v.дата + (v.седмица ? ' · ' + v.седмица : '') + (v.близо ? ' · наближава!' : '') + ' — ' + v.име));
  }
  бройМерки += 9 + r.ваксини.length;

  // ═══ ПРОВЕРКИТЕ ═══
  // 1) възрастта в думи срещу празника
  if (r.банер && a.ym < 1) червено(сц.име, 'банер за месечнина при възраст под месец', r.възрастТекст, r.банер);
  if (r.банер) {
    const мес = parseInt(r.банер, 10);
    const очаквано = /годинк/.test(r.банер) ? мес * 12 : мес;
    if (очаквано !== a.ym) червено(сц.име, 'банерът празнува друг месец, не този от възрастта', 'ym=' + a.ym, r.банер);
    if (a.days !== 0) червено(сц.име, 'празник, а възрастта има остатък дни', r.възрастТекст, r.банер);
  }
  // 2) банер срещу балони срещу home2 — трите празника трябва да са едно
  if (!!r.банер !== !!r.балони) червено(сц.име, 'банер и балони не са съгласни', r.банер || '(няма)', r.балони ? 'балони ДА' : 'балони не');
  if (!!r.банер !== !!r.home2) червено(сц.име, 'банер и „най-важното сега“ не са съгласни', r.банер || '(няма)', r.home2 || '(няма)');
  // 3) прегледите срещу истинската възраст в месеци
  if (r.ckМесеци != null && Math.abs(r.ckМесеци - a.ym) >= 1)
    червено(сц.име, 'прегледите мерят по ДРУГА възраст', 'ym=' + a.ym, 'ck=' + (+r.ckМесеци).toFixed(3));
  // 4) преглед, обявен за ИЗПУСНАТ, докато бебето още не е стигнало до него
  const П = W.__ПРЕГЛЕДИ;
  r.ckПропуснати.forEach(име => {
    const ред = П.find(x => x[3] === име);
    if (ред && ред[1] >= a.ym) червено(сц.име, 'преглед обявен за изпуснат, а още не е дошъл', 'ym=' + a.ym, име + ' (' + ред[0] + '–' + ред[1] + ' м.)');
  });
  // 5) ваксините: седмицата до датата
  r.ваксини.forEach(v => {
    if (!v.седмица) return;
    const н = parseInt(v.седмица, 10);
    const очаквани = Math.round(v.месец * 30.4375 / 7) + 1;
    if (Math.abs(н - очаквани) > 1) червено(сц.име, 'ваксина: седмицата и месецът не са едно', v.месец + ' мес', v.седмица);
  });
  // 6) печатът върху снимката срещу възрастта на екрана — СЪЩИЯ ден, същото бебе
  if (a) {
    const очакван = a.ym < 1
      ? a.totalDays + (a.totalDays === 1 ? ' ден' : ' дни')
      : a.ym < 12 ? a.ym + (a.ym === 1 ? ' месец' : ' месеца')
                  : Math.floor(a.ym / 12) + ' г.' + (a.ym % 12 ? ' ' + (a.ym % 12) + ' м.' : '');
    if (r.снимка !== очакван)
      червено(сц.име, 'печатът на снимката казва друга възраст', 'екранът: ' + очакван, 'снимката: ' + (r.снимка || '(празно)'));
  }
  // 7) картата за 29 февруари — трябва да излезе за такова бебе и само за него
  const е29фев = /-02-29$/.test(сц.раждане);
  if (е29фев !== r.високосно)
    червено(сц.име, 'картата „високосно бебе“ не познава рождената дата',
            'роден ' + сц.раждане, r.високосно ? 'картата излиза' : 'картата мълчи');
  // 8) годишникът срещу балоните
  if (r.yb === 'Днес е големият ден' && !r.балони) червено(сц.име, 'годишникът казва „днес“, балоните мълчат', r.yb, 'балони не');
  if (r.балони && a.ym % 12 === 0 && a.ym >= 12 && r.yb && r.yb !== 'Днес е големият ден')
    червено(сц.име, 'рожден ден ДНЕС, а годишникът го отлага', 'балони ДА', r.yb);
});

function mерки_безопасно(W, сц) {
  try { return мерки(W); }
  catch (e) {
    console.error('⛔ ' + сц.име + ' — МЕРКИТЕ ГРЪМНАХА: ' + e.message);
    console.error(e.stack.split('\n').slice(0, 5).join('\n'));
    process.exitCode = 1;
    return null;
  }
}

console.log('─'.repeat(78));
console.log('');
if (противоречия.length) {
  console.log('🔴 ПРОТИВОРЕЧИЯ: ' + противоречия.length);
  противоречия.forEach(п => console.log('   · ' + п.сц + ' → ' + п.какво + '\n       „' + п.ляво + '“  срещу  „' + п.дясно + '“'));
} else if (process.exitCode) {
  // 🕳️ ЗЕЛЕНО ПРИ МЪРТЪВ ПЯСЪЧНИК Е ЛЪЖА. Ако някой сценарий е гръмнал,
  //    „нула противоречия“ значи „нула прегледани“, а не „нула дефекти“.
  console.log('⛔ НЕ МОГА ДА КАЖА НИЩО — сценарии гръмнаха (виж ⛔ по-горе).');
} else if (бройМерки < СЦЕНАРИИ.length * 10) {
  console.log('⛔ ПОДОЗРИТЕЛНО МАЛКО МЕРКИ (' + бройМерки + ') — не вярвай на зеленото.');
  process.exitCode = 1;
} else {
  console.log('🟢 НУЛА противоречия');
}
console.log('');
console.log('ПРЕГЛЕДАНО: ' + СЦЕНАРИИ.length + ' сценария · ' + бройМерки + ' мерки · ' +
            ФАЙЛОВЕ.length + ' заредени файла · ' + (Object.keys(ИЗВАДКИ).length + 1) + ' изрязани частни парчета');
