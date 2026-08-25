// ═══════════════════════════════════════════════════════════
// 🔧 ПОПРАВКА НА НОВОДОБАВЕНИТЕ КАРТИ — имена и кавички
//
// ДВЕ НЕЩА, КОИТО НАПРАВИХ ЗЛЕ В dev/slej_naliv.js:
//
// 1. ИМЕНАТА. Моят генератор махаше гласните от КИРИЛСКОТО заглавие и
//    даваше `nb-щмржт`, `nb-срмтврдлн`, `nb-днтврдлн`. Нечетимо, а всички
//    останали 461 карти в проекта носят ЛАТИНСКИ имена: zd-temp2, mb-navel,
//    br-kramp. Име, което не се чете, се плаща всеки път, когато някой търси
//    коя карта къде отива.
//    ЛЕКЪТ: латинска транслитерация на първите две смислови думи.
//
// 2. КАВИЧКИТЕ. Сливачът пречистваше ТЯЛОТО на статията, но НЕ и полетата на
//    картата (core/tip/follow). Затова 4 прави знака влязоха в живата база
//    точно след като бях изчистил 812 от библиотеката.
//
// ⚠ ПИПА САМО НОВИТЕ (тези с кирилица в id-то). Старите 461 не се докосват —
//   техните имена стоят в chips, в lib препратки и в тестове.
//
// ПУСКАНЕ: node dev/popravi_novi_karti.js [--pisi]
// ПЪТ НАЗАД: js/kb.js.PREDI_IMENA
// ═══════════════════════════════════════════════════════════
const fs = require('fs');
const vm = require('vm');
const path = require('path');
process.chdir(path.resolve(__dirname, '..'));

const ПИШИ = process.argv.includes('--pisi');

const ЛАТ = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ж: 'zh', з: 'z', и: 'i',
  й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's',
  т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sht',
  ъ: 'a', ь: '', ю: 'yu', я: 'ya'
};
const СЛУЖЕБНИ = new Set(['и', 'или', 'на', 'за', 'от', 'до', 'по', 'в', 'с', 'към',
  'кога', 'какво', 'как', 'защо', 'кое', 'кои', 'кой', 'коя', 'това', 'тези',
  'какви', 'колко', 'ли', 'да', 'не', 'се', 'си', 'ми', 'му', 'ти', 'е', 'са']);

function латиница(s) {
  return String(s).toLowerCase().split('').map(c => (c in ЛАТ ? ЛАТ[c] : (/[a-z0-9]/.test(c) ? c : ''))).join('');
}
function имеОт(заглавие, представка, заети) {
  const думи = String(заглавие).toLowerCase()
    .replace(/[^а-яa-z\s]/g, ' ').split(/\s+/)
    .filter(w => w.length >= 3 && !СЛУЖЕБНИ.has(w));
  let ядро = думи.slice(0, 2).map(w => латиница(w).slice(0, 9)).join('-');
  if (!ядро) ядро = 'nova';
  let име = представка + '-' + ядро;
  let n = 1;
  while (заети.has(име)) име = представка + '-' + ядро + (++n);
  заети.add(име);
  return име;
}

// ── кавичките
// 🪤 ПЪРВАТА ВЕРСИЯ ПРЕСКОЧИ ВСИЧКИТЕ и докладва „поправени 0". Причината:
//   тя искаше ЧЕТЕН брой прави знаци, а писарят е ОТВОРИЛ с българското „ и
//   е ЗАТВОРИЛ с прав знак: „Искам бебето при мен през нощта" — един-единствен
//   прав знак, нечетен, пропуснат.
//   Затова тук не се брои, а се ВЪРВИ през текста и се помни дали в момента
//   има отворена кавичка — от „ ИЛИ от предишен прав знак. Правият знак става
//   затварящ “, когато има какво да затвори, и отварящ „, когато няма.
function сдвои(т) {
  if (т.indexOf('"') < 0) return { т, сменени: 0 };
  let отворена = false, сменени = 0, из = '';
  for (let i = 0; i < т.length; i++) {
    const c = т[i];
    if (c === '„') { отворена = true; из += c; continue; }
    if (c === '“') { отворена = false; из += c; continue; }
    if (c === '"') { сменени++; из += отворена ? '“' : '„'; отворена = !отворена; continue; }
    из += c;
  }
  return { т: из, сменени };
}

function зареди(текст) {
  const ctx = { console: { log() {} }, JSON, Math, Date, RegExp, String, Number, Array, Object };
  ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
  vm.createContext(ctx);
  new vm.Script(текст).runInContext(ctx);
  return (ctx.BL_KB || ctx.KB);
}

let src = fs.readFileSync('js/kb.js', 'utf8');
const KB = зареди(src);
const заети = new Set(KB.entries.map(e => e.id));

const кирилски = KB.entries.filter(e => /[а-я]/i.test(e.id));
console.log('🔧 ПОПРАВКА НА НОВОДОБАВЕНИТЕ КАРТИ\n');
console.log('  всички карти            : ' + KB.entries.length);
console.log('  с кирилица в името (нови): ' + кирилски.length + '\n');

if (!кирилски.length) { console.log('  нищо за поправяне.'); process.exit(0); }

const преименувани = [];
for (const e of кирилски) {
  заети.delete(e.id);
  const пред = (e.id.split('-')[0] || 'nx');
  const ново = имеОт(e.title, пред, заети);
  преименувани.push([e.id, ново, e.title]);
  // 🪤 заменя се ЦЕЛИЯТ низ с кавичките, за да не бъде хванато парче от
  //    друго име. Кирилските id-та са уникални низове — няма съвпадения.
  const стар = "'" + e.id + "'";
  const брой = src.split(стар).length - 1;
  if (брой !== 1) { console.log('  🔴 „' + e.id + '" се среща ' + брой + ' пъти — пропускам'); continue; }
  src = src.split(стар).join("'" + ново + "'");
  console.log('  ✏️  ' + e.id.padEnd(18) + ' → ' + ново.padEnd(24) + ' « ' + String(e.title).slice(0, 40));
}

// ── кавичките в новите карти
let кав = 0;
for (const [, ново] of преименувани) {
  const м = src.indexOf("id: '" + ново + "'");
  if (м < 0) continue;
  const край = src.indexOf('\n    }', м);
  if (край < 0) continue;
  const блок = src.slice(м, край);
  const р = сдвои(блок);
  if (р.сменени) { src = src.slice(0, м) + р.т + src.slice(край); кав += р.сменени; }
}
console.log('\n  „ поправени прави кавички: ' + кав);

// ── ПАЗАЧ
let проба;
try { проба = зареди(src); }
catch (e) { console.log('\n🔴 kb.js не се зарежда след промяната: ' + e.message + '\n   НИЩО НЕ Е ЗАПИСАНО.'); process.exit(1); }
if (проба.entries.length !== KB.entries.length) {
  console.log('\n🔴 записите станаха ' + проба.entries.length + ' вместо ' + KB.entries.length + ' — НЕ ПИША.'); process.exit(1);
}
const останалиКирилски = проба.entries.filter(e => /[а-я]/i.test(e.id)).length;
const останалиКавички = проба.entries.reduce((s, e) =>
  s + ['title', 'core', 'tip', 'follow'].reduce((a, п) => a + ((String(e[п] || '').match(/"/g) || []).length), 0), 0);
console.log('  ✅ зарежда се · записи ' + проба.entries.length);
console.log('  ' + (останалиКирилски ? '🔴 ' : '✅ ') + 'останали кирилски имена: ' + останалиКирилски);
console.log('  ' + (останалиКавички ? '🔴 ' : '✅ ') + 'останали прави кавички в карти: ' + останалиКавички);

if (!ПИШИ) { console.log('\n  (пробен ход — пусни с --pisi, за да запише)'); process.exit(0); }
fs.copyFileSync('js/kb.js', 'js/kb.js.PREDI_IMENA');
fs.writeFileSync('js/kb.js', src);
console.log('\n  💾 ЗАПИСАНО. ПЪТ НАЗАД: js/kb.js.PREDI_IMENA');
