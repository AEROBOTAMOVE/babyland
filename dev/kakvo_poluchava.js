// ═══════════════════════════════════════════════════════════
// 🩺 КАКВО ПОЛУЧАВА МАЙКАТА — целият път, не само матчърът
//
// Защо съществува (12.08): работилницата по мъртвите ключове намери 51
// „ОПАСНИ" случая, при които ключ отива при чужд запис. Скептиците обориха
// 77 от 89 съдени, и причината е една и съща:
//
//   ПРИ СПЕШНИТЕ ДУМИ ЧЕРВЕНИЯТ ФЛАГ ГЪРМИ ПРЕДИ МАТЧЪРА.
//
// Тоест „кашля като тюленче" може наистина да отива при грешния запис в
// findEntry — но майката никога не стига дотам, защото BL_REDFLAG вече е
// показал спешната карта. Находка за матчъра, нула щета за майката.
//
// Този уред пита ЦЕЛИЯ път, в реда, в който приложението го минава:
//   1. червен флаг за БЕБЕТО   (BL_REDFLAG)
//   2. флаг за МАЙКАТА          (BL_MOTHERFLAG)
//   3. флаг за БРЕМЕННОСТТА     (BL_PREGFLAG)
//   4. чак тогава — матчърът    (BL_MATCH)
//
// ПУСКАНЕ: node dev/kakvo_poluchava.js "фраза" "Стая"
//          node dev/kakvo_poluchava.js --spisak файл.json
//
// ПЪТ НАЗАД: файлът само ЧЕТЕ. Не пипа нищо.
// ═══════════════════════════════════════════════════════════
const fs = require('fs');
const vm = require('vm');
const path = require('path');
process.chdir(path.resolve(__dirname, '..'));

function пясъчник() {
  // контекстът се прави ОТ window, за да Е window глобалният обект —
  // helper.js чете ГОЛО KB, не window.KB (виж dev/mrytvi.js)
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

const W = пясъчник();
for (const f of ['js/kb.js', 'js/helper.js']) {
  try { new vm.Script(fs.readFileSync(f, 'utf8'), { filename: f }).runInContext(W); }
  catch (e) { console.log('🔴 ' + f + ' → ' + e.message); process.exit(1); }
}
if (!W.BL_MATCH) { console.log('🔴 BL_MATCH не се получи'); process.exit(1); }

const заглавия = {};
for (const з of (W.KB.entries || W.KB.items || [])) заглавия[з.id] = з.title;

function пътят(фраза, стая) {
  const из = { фраза: фраза, стая: стая };
  try { из.червенФлаг = W.BL_REDFLAG ? W.BL_REDFLAG(фраза) : null; } catch (e) { из.червенФлаг = 'гръмна'; }
  try { из.флагМайка = W.BL_MOTHERFLAG ? W.BL_MOTHERFLAG(фраза) : null; } catch (e) {}
  try { из.флагБременност = W.BL_PREGFLAG ? W.BL_PREGFLAG(фраза) : null; } catch (e) {}
  let m = null;
  try { m = W.BL_MATCH(фраза, стая); } catch (e) {}
  из.запис = m ? m.id : 'НЯМА';
  из.заглавие = m ? (m.title || заглавия[m.id] || '') : '';
  const ф = из.червенФлаг;
  из.спира_преди_матчъра = !!(ф && (ф === true || (typeof ф === 'object' && (ф.level || ф.ниво || ф.hit || Object.keys(ф).length))));
  return из;
}

// ═══════════════ 🛡️ САМОПРОВЕРКА (01.09.2026, ВЪЛНА 1.3) ═══════════════
//
// Този уред отговаря на въпроса „какво получава майката" — и мълчаливо
// зависи от четири функции, всяка от които е зад try/catch. Гръмне ли
// някоя, той честно ще каже „НЯМА" за всичко и ще изглежда като работещ.
// Затова, преди всяко пускане, се проверяват ТРИ известни пътя в двете
// посоки. Пише на stderr, за да не мърси JSON изхода.
// ПЪТ НАЗАД: махаш този блок — уредът работи както преди, но сляп.
(function самопроверка() {
  const СЛУЧАИ = [
    ['спешното спира ПРЕДИ матчъра', 'бебето не диша', '',
     р => р.спира_преди_матчъра === true],
    ['обикновеният въпрос стига до матчъра и намира картата си', 'кога се появяват първите зъбки', '',
     р => р.спира_преди_матчъра === false && р.запис === 'zd-teeth'],
    ['безобидното изречение не вдига нищо и не намира нищо',
     'съседката подари на бабата шарена престилка за имен ден', '',
     р => р.спира_преди_матчъра === false && р.запис === 'НЯМА']
  ];
  const паднали = [];
  for (const [име, фраза, стая, чакам] of СЛУЧАИ) {
    let р = null;
    try { р = пътят(фраза, стая); } catch (e) { паднали.push(име + ' — ГРЪМ: ' + e.message); continue; }
    if (!чакам(р)) паднали.push(име + ' — стана: флаг=' + р.спира_преди_матчъра + ' · запис=' + р.запис);
  }
  if (паднали.length) {
    console.log('🔴 САМОПРОВЕРКАТА ПАДА — този уред НЕ вижда:');
    паднали.forEach(x => console.log('     · ' + x));
    process.exit(1);
  }
  console.error('  ✅ самопроверка: ' + СЛУЧАИ.length + ' известни пътя минават в двете посоки');
})();

const арг = process.argv.slice(2);
if (арг[0] === '--spisak') {
  const данни = JSON.parse(fs.readFileSync(арг[1], 'utf8'));
  const списък = данни.опасни || данни;
  const редове = [];
  let сФлаг = 0, безФлаг = 0;
  for (const н of списък) {
    // ключовете идват разделени с |
    for (const k of String(н.keys || '').split('|').map(s => s.trim()).filter(Boolean)) {
      const стая = (W.KB.entries || []).find(e => e.id === н.own);
      const р = пътят(k, стая ? стая.room : '');
      if (р.спира_преди_матчъра) сФлаг++; else безФлаг++;
      редове.push({ свой: н.own, крадец: н.thief, фраза: k,
                    флаг: р.спира_преди_матчъра, дава: р.запис,
                    вярно: р.запис === н.own });
    }
  }
  console.log('🩺 КАКВО ПОЛУЧАВА МАЙКАТА — ' + редове.length + ' фрази от ' + списък.length + ' находки\n');
  console.log('  спира на ЧЕРВЕН ФЛАГ (матчърът е без значение): ' + сФлаг);
  console.log('  стига до матчъра: ' + безФлаг);
  const истински = редове.filter(r => !r.флаг && !r.вярно);
  console.log('  → ИСТИНСКИ проблем (без флаг И греши): ' + истински.length + '\n');
  истински.forEach(r => console.log('  🔴 „' + r.фраза + '"\n       свой: ' + r.свой +
    ' (' + String(заглавия[r.свой] || '?').slice(0, 40) + ')\n       дава: ' + r.дава +
    ' (' + String(заглавия[r.дава] || '?').slice(0, 40) + ')'));
  fs.writeFileSync(арг[2] || 'dev/nahodki/istinski.json', JSON.stringify(истински, null, 1), 'utf8');
} else {
  console.log(JSON.stringify(пътят(арг[0], арг[1] || ''), null, 1));
}
