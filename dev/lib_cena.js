// ═══════════════════════════════════════════════════════════
// 📚 КОЛКО СТРУВА ИЗРИЧНАТА ПРЕПРАТКА lib: — и мълчи ли търсачката
//
// ОТКРИТИЕ (26.08.2026) в js/helper.js:2644 —
//     const изричнаСтатия = entry.lib ? BL_LIB.поId(entry.lib) : null;
//     if (изричнаСтатия) { покажи я }
//     else if (window.BL_LIB) { BL_LIB.search(...) }   ← САМО ако НЯМА lib
// Двете са ВЗАИМНО ИЗКЛЮЧВАЩИ СЕ. 457 от 604 карти имат lib → за 76% от
// отговорите търсенето в библиотеката НИКОГА не се пуска. Всяка добавена
// препратка ТИХО гаси резервата за своята карта. Никой не беше мерил цената.
//
// ИЗМЕРЕНО: за 296 карти търсенето би дало СЪЩАТА статия (полето не носи
// нищо ново), за 159 — ДРУГА, за 2 — нищо. И качеството на другите е
// НЕРАВНО: „Кога тестът показва вярно?" (тест за бременност) би получила
// „Обривът и чашата: тестът, който трае 10 секунди" (менингит) — тоест
// изричната препратка ЗАСЛУЖАВА мястото си и не бива да се маха.
//
// ВТОРА МЯРКА: търсачката връща статии на 4 от 10 БЕЗСМИСЛЕНИ въпроса
// („счетоводен баланс" → „балансиращо колело"). За 147-те карти БЕЗ lib
// това значи случайна статия под отговора. Праг на уместност няма.
//
// ПУСКАНЕ: node dev/lib_cena.js
// ПЪТ НАЗАД: файлът само ЧЕТЕ. Нищо не пипа.
// ═══════════════════════════════════════════════════════════
const fs = require('fs');
const vm = require('vm');
const path = require('path');
// пътят е спрямо самия файл — уред, който работи само от една папка, не се пуска
// 🪤 обратната наклонена черта на Windows се събира от код — писането ѝ в низ
//    през bash/node -e я изяжда и файлът гърми (плащано днес три пъти)
const ОБРАТНА = String.fromCharCode(92);
const ROOT = path.resolve(__dirname, '..').split(ОБРАТНА).join('/');

const W = {};
Object.assign(W, {
  console, setTimeout, clearTimeout, Math, JSON, Date, RegExp, String, Number,
  Object, Array, Boolean, Error, Map, Set, Promise, Intl, parseInt, parseFloat,
  isNaN, isFinite, encodeURIComponent, decodeURIComponent
});
W.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
W.document = {
  documentElement: {}, body: {}, head: {},
  createElement: () => ({ style: {}, classList: { add() {}, remove() {} }, appendChild() {}, setAttribute() {} }),
  getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
  addEventListener() {}, readyState: 'complete'
};
W.addEventListener = function () {};
W.matchMedia = () => ({ matches: false, addEventListener() {} });
W.navigator = { userAgent: 'node', language: 'bg' };
W.location = { href: 'http://localhost/', search: '', hash: '' };
// 🪤 init() тегли index.json през fetch. Първият ми опит го запуши и
//    търсачката излезе празна — уредът отказа вместо да върне фалшива нула.
//    Тук fetch чете ИСТИНСКИТЕ файлове от диска.
W.fetch = (u) => { const f = String(u).split('?')[0]; return Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(ROOT + '/' + f, 'utf8'))) }); };
W.window = W;
vm.createContext(W);
W.globalThis = W;

// истинските данни на библиотеката, вместо fetch
const idx = JSON.parse(fs.readFileSync(ROOT + '/lib/index.json', 'utf8'));
W.BL_ARTICLES_DATA = idx.items;

new vm.Script(fs.readFileSync(ROOT + '/js/kb.js', 'utf8'), { filename: 'kb.js' }).runInContext(W);
new vm.Script(fs.readFileSync(ROOT + '/js/lib.js', 'utf8'), { filename: 'lib.js' }).runInContext(W);

if (!W.BL_LIB || !W.BL_LIB.search) { console.log('🔴 BL_LIB.search липсва'); process.exit(2); }
// init() е обещание — трябва да се ИЗЧАКА, иначе index още е null
const готово = W.BL_LIB.init();
готово.then(() => { мери(); }).catch(e => { console.log('🔴 init падна: ' + e.message); process.exit(2); });
function мери() {

// проверка, че търсачката наистина вижда данните — иначе всяко число долу е лъжа
const проба = W.BL_LIB.search('температура', 'Здраве и SOS', 3) || [];
console.log('  контролно търсене „температура": ' + проба.length + ' резултата' +
            (проба.length ? '  ✅' : '  🔴 ТЪРСАЧКАТА НЕ ВИЖДА ДАННИТЕ — спирам'));
if (!проба.length) process.exit(2);

// ── МЯРКА 1: колко различна е статията, която търсенето би намерило ──
const записи = (W.KB && W.KB.entries) || [];
const сLib = записи.filter(z => z.lib);
let същата = 0, друга = 0, нищо = 0;
const примери = [];
for (const з of сLib) {
  const въпрос = String(з.title || '');
  let намерено = null;
  try { намерено = (W.BL_LIB.search(въпрос, з.room, 1) || [])[0]; } catch (e) {}
  if (!намерено) { нищо++; continue; }
  if (намерено.id === з.lib) същата++;
  else {
    друга++;
    if (примери.length < 8) примери.push({ к: з.id, с: з.room, з: въпрос, и: з.lib, н: намерено.id, нt: намерено.t });
  }
}
console.log('');
console.log('  карти с изрична статия : ' + сLib.length + ' от ' + записи.length +
            '  (' + Math.round(сLib.length / записи.length * 100) + '%)  ← за тях търсенето НЕ се пуска');
console.log('');
console.log('  търсенето би дало СЪЩАТА  : ' + същата + '   ← полето lib не носи нищо ново');
console.log('  търсенето би дало ДРУГА   : ' + друга + '   ← мама вижда една вместо друга');
console.log('  търсенето не би дало нищо : ' + нищо + '   ← тук lib Е единствената полза');
console.log('');
console.log('  ── примери за РАЗЛИКА (виж дали намереното е по-добро или по-лошо) ──');
for (const п of примери) {
  console.log('     [' + п.с + '] ' + п.к + '  „' + п.з.slice(0, 46) + '"');
  console.log('        изрична : ' + п.и);
  console.log('        търсене : ' + п.н + '  „' + String(п.нt || '').slice(0, 54) + '"');
}

// ── КОЛКО ЧЕСТО ТЪРСАЧКАТА ВРЪЩА НЕЩО НА БЕЗСМИСЛИЦА ──
// Библиотечният отряд докладва, че контролен безсмислен въпрос връща 3 статии.
// Ако е така, за 147-те карти БЕЗ изрична статия мама получава СЛУЧАЙНА.
const БЕЗСМИСЛЕНИ = ['счетоводен баланс на тримесечие','ремонт на скоростна кутия',
  'котировки на петрола','как се сменя гума','рецепта за мусака','данъчна декларация',
  'кога е мачът на левски','инсталация на принтер','зззз ъъъ щщщ','asdf qwerty'];
let върна=0; const редове=[];
for(const q of БЕЗСМИСЛЕНИ){ let r=[]; try{ r=W.BL_LIB.search(q,'Здраве и SOS',3)||[]; }catch(e){}
  if(r.length) върна++; редове.push('     '+(r.length?'🔴 '+r.length:'✅ 0 ')+'  „'+q+'"'+(r.length?'   → „'+String(r[0].t||'').slice(0,44)+'"':'')); }
console.log('');
console.log('  ── БЕЗСМИСЛЕНИ ВЪПРОСИ (търсачката трябва да МЪЛЧИ) ──');
редове.forEach(x=>console.log(x));
console.log('');
console.log('  връща нещо на '+върна+' от '+БЕЗСМИСЛЕНИ.length+' безсмислени въпроса');
const истински=['бебето има температура','как се къпе новородено','кога проговаря'];
let ок=0; for(const q of истински){ try{ if((W.BL_LIB.search(q,'Здраве и SOS',3)||[]).length) ок++; }catch(e){} }
console.log('  обратна посока: намира на '+ок+' от '+истински.length+' истински въпроса  '+(ок===истински.length?'✅':'🔴'));
}
