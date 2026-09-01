// ═══════════════════════════════════════════════════════════
// 💍 СВАТОВНИКЪТ — коя карта би отворила врата към коя осиротяла статия
//
// ЗАЩО: 490 от 898 статии нямат нито една карта към тях. Разлистват се, но не
// изскачат при въпрос — а майка с болно бебе в 3 през нощта не разлиства, тя
// пита. Това е най-големият неизползван актив: съдържанието е написано и е
// невидимо точно в мига, в който трябва.
//
// 🪤 ПРЕГРАДАТА, КОЯТО ТРЯБВА ДА СЕ ЗНАЕ ПРЕДИ ВСЯКА РАБОТА ТУК:
//    полето `lib` в js/kb.js е ЕДИН НИЗ — една статия на карта. 604 карти,
//    457 вече заети. Тоест ТАВАНЪТ е 604, а сираците са 490. Без промяна в
//    устройството числото не може да падне под ~147.
//
// Този уред само МЕРИ и ПРЕДЛАГА — не пише нищо. Смята се припокриване на
// думи между статията (заглавие + резюме + ключове) и картата (заглавие +
// ключове), с тежест за еднаква стая.
//
// ПУСКАНЕ: node dev/svatovnik.js            обобщение
//          node dev/svatovnik.js --spisak   първите 40 двойки
//          node dev/svatovnik.js --json     пише dev/svatovnik.json
// ПЪТ НАЗАД: файлът само ЧЕТЕ.
// ═══════════════════════════════════════════════════════════
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const КОРЕН = path.resolve(__dirname, '..');

const ctx = { console: { log() {}, warn() {} }, JSON, Math, Date, RegExp, String, Number, Array, Object };
ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
vm.createContext(ctx);
new vm.Script(fs.readFileSync(path.join(КОРЕН, 'js/kb.js'), 'utf8')).runInContext(ctx);
const карти = ((ctx.BL_KB || ctx.KB) || {}).entries || [];
const idx = JSON.parse(fs.readFileSync(path.join(КОРЕН, 'lib/index.json'), 'utf8'));
const статии = (idx.items || []).filter(x => x && x.id);
if (!карти.length || !статии.length) { console.log('🔴 не мога да заредя'); process.exit(2); }

// ── общи думи, които не значат тема ──
const СТОП = new Set(('и или на от с със за да че но в във по до при към под над без ' +
  'се си ми му ѝ то това те тя той ги я го как какво кога защо кой коя кое кои колко ' +
  'дали ли ще са е бе са има няма може ако като than the a за бебето бебе дете детето ' +
  'майка мама който която което които един една едно съм си сте сме').split(' '));
const думи = т => {
  const из = new Set();
  for (const д of String(т || '').toLowerCase().replace(/[^а-яa-z0-9 ]/g, ' ').split(/\s+/)) {
    if (д.length < 4 || СТОП.has(д)) continue;
    из.add(д.slice(0, 6));   // корен: българските окончания се менят
  }
  return из;
};

const текстКарти = JSON.stringify(карти);
const сирак = а => текстКарти.indexOf(а.id) < 0;
const сираци = статии.filter(сирак);

// думите на всяка карта се смятат ВЕДНЪЖ
const картаДуми = карти.map(z => ({
  z,
  д: (() => { const s = думи(String(z.title || '') + ' ' + (z.keys || []).join(' ')); return s; })(),
  зает: !!z.lib
}));

const двойки = [];
for (const а of сираци) {
  const дА = думи(String(а.t || '') + ' ' + String(а.s || '') + ' ' + String(а.k || ''));
  if (!дА.size) continue;
  let най = null, найТочки = 0;
  for (const к of картаДуми) {
    let общи = 0;
    for (const д of дА) if (к.д.has(д)) общи++;
    if (!общи) continue;
    // припокриване спрямо по-малкото множество + бонус за еднаква стая
    let точки = общи / Math.min(дА.size, к.д.size || 1);
    if (к.z.room === а.r) точки *= 1.6;
    if (точки > найТочки) { найТочки = точки; най = к; }
  }
  if (най) двойки.push({ статия: а, карта: най.z, точки: найТочки, зает: най.зает });
}

двойки.sort((x, y) => y.точки - x.точки);
const свободни = двойки.filter(д => !д.зает);
const заети = двойки.filter(д => д.зает);
const силни = двойки.filter(д => д.точки >= 0.5);

console.log('');
console.log('💍 СВАТОВНИКЪТ');
console.log('');
console.log('  сираци           : ' + сираци.length + ' от ' + статии.length);
console.log('  намерена карта   : ' + двойки.length);
console.log('  без намерена     : ' + (сираци.length - двойки.length));
console.log('');
console.log('  🔓 картата е СВОБОДНА (няма lib) : ' + свободни.length + '   ← могат да влязат веднага');
console.log('  🔒 картата е ЗАЕТА (има lib)     : ' + заети.length + '   ← иска устройството да пусне повече от една');
console.log('  💪 силно съвпадение (≥0.50)      : ' + силни.length);
console.log('');
const карти_без_lib = карти.filter(z => !z.lib).length;
console.log('  карти БЕЗ статия  : ' + карти_без_lib + ' от ' + карти.length);
console.log('  ТАВАН при една статия на карта: ' + карти_без_lib + ' сирака могат да се закачат;');
console.log('  остават ' + Math.max(0, сираци.length - карти_без_lib) + ' — те искат ПОВЕЧЕ ОТ ЕДНА статия на карта.');
console.log('');

if (process.argv.indexOf('--spisak') >= 0) {
  console.log('  ── най-силните 40 двойки ──');
  for (const д of двойки.slice(0, 40))
    console.log('     ' + д.точки.toFixed(2) + (д.зает ? ' 🔒 ' : ' 🔓 ') +
      '[' + (д.статия.r || '—') + '] ' + String(д.статия.t || '').slice(0, 44) +
      '   →   ' + д.карта.id + '  „' + String(д.карта.title || '').slice(0, 34) + '"');
  console.log('');
}
if (process.argv.indexOf('--json') >= 0) {
  fs.writeFileSync(path.join(__dirname, 'svatovnik.json'), JSON.stringify(
    двойки.map(д => ({ statia: д.статия.id, zaglavie: д.статия.t, staya: д.статия.r,
      karta: д.карта.id, karta_zaglavie: д.карта.title, karta_staya: д.карта.room,
      tochki: Number(д.точки.toFixed(3)), zaeta: д.зает })), null, 1));
  console.log('  💾 dev/svatovnik.json');
}
