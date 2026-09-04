#!/usr/bin/env node
/* eslint-disable */
// ═══════════════════════════════════════════════════════════════════════════
// 🔀 СЛИВАЧЪТ НА СТАТИИ — единственият път от dev/nahodki/ до живата библиотека
// ═══════════════════════════════════════════════════════════════════════════
//
// ЗАЩО СЪЩЕСТВУВА (05.09, в тази сесия):
//   Дванайсет агента пишат статии едновременно. Ако всеки пипа lib/*.json и
//   js/kb.js сам, ще се изядат — и вече е плащано веднъж, когато `git add -A`
//   по време на агентска работа вкара 169 непроверени полета в чужд комит.
//   Затова агентите пишат СТАЖ-файлове, инертни до момента на сливане, а тук
//   минават през гейт, който изброява всяко отхвърляне ПОИМЕННО.
//
// КАКВО ПРАВИ:
//   чете dev/nahodki/statii_*.json → 14 проверки на всяка статия → раздава
//   lib-id → долива тялото в основния файл на стаята → вписва мета в
//   lib/index.json → слага `lib: 'lib-xxx',` на картата в js/kb.js → вдига LV.
//
// ═══ РЕШЕНИЯТА, ПЛАТЕНИ С ЧЕТЕНЕ (не с догадка) ═══
//   · НОВ ФАЙЛ В lib/ Е КАПАН. `fetchBundle` в js/lib.js товари по име
//     динамично, значи онлайн би проработил. Но sw.js носи ЗАКОВАН списък от
//     17 пътя (редове 141–159) и офлайн новият файл би върнал грешка, която
//     `.catch(() => ({}))` превръща в празен обект — тоест статия, която
//     МЪЛЧИ БЕЗ ГРЕШКА. Затова доливаме в СЪЩЕСТВУВАЩИЯ файл на стаята.
//   · КЕШЪТ Е ПО ТОЧЕН URL. js/lib.js вика 'lib/'+f+'?v='+LV. Долята статия в
//     стар файл не стига до инсталирано приложение, докато LV не се вдигне.
//     Затова LV се вдига ТУК, а не „после".
//   · js/kb.js Е ЧИСТ CRLF (измерено сега: 8603 CRLF, 0 самотни LF) и носи
//     667 id-та с единични и 32 с двойни кавички. И двете се поддържат.
//   · ВМЪКВАНЕТО СЕ ЗАКОТВЯ ЗА `id: 'X',` — котвата се брои и ако не е точно
//     една, статията пада. `chips: ['nia-pari']` не пасва на котвата.
//
// ПУСКАНЕ (от папката babyland):
//   node dev/slivach_statii.js              — СУХО: показва какво би станало
//   node dev/slivach_statii.js --pishi      — пише наистина
//   node dev/slivach_statii.js --samo=zdrave — само един стаж-файл
//
// ПЪТ НАЗАД (прави се ПРЕДИ всяко писане, автоматично):
//   lib/index.json.PREDI_SLIVANE · lib/<файл>.json.PREDI_SLIVANE
//   js/kb.js.PREDI_SLIVANE · js/lib.js.PREDI_SLIVANE
//   Връщане: for f in ...PREDI_SLIVANE; do mv "$f" "${f%.PREDI_SLIVANE}"; done
//   Или просто: git checkout -- lib js   (дървото беше чисто на c10c298)
//
// Изход: 0 = слято/чисто, 1 = има отхвърлени, 2 = проверката след писане падна.
// ═══════════════════════════════════════════════════════════════════════════
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const КОРЕН = path.resolve(__dirname, '..');
process.chdir(КОРЕН);

const АРГ = process.argv.slice(2);
const ПИШИ = АРГ.includes('--pishi');
const САМО = (АРГ.find(a => a.startsWith('--samo=')) || '').split('=')[1] || '';

// ── стая → основният ѝ файл (измерено от разпределението в index.json) ──
const ФАЙЛ_НА_СТАЯ = {
  'Бременност': 'preg-1.json',
  'Жената в мен': 'women-1.json',
  'Дневник на мама': 'mama-1.json',
  'Инструменти': 'tools-1.json',
  'Моето бебе': 'baby-1.json',
  'Здраве и SOS': 'health-1.json',
  'Захранване': 'feed-1.json',
  'Развитие и игри': 'dev-1.json',
  'Лабораторията': 'lab-1.json'
};

// ── забраненото (§4 от dev/ZAKON_ZA_STATII.md) ──
const ДОЗА = /\d+\s*(мг|мл|mg|ml|милиграм|милилитр)/i;
const ОБЕЩАНИЯ = /(спасително средство|гарантиран|100\s*%|винаги помага|напълно безопасн|няма никакъв риск)/i;
const ЛАТ_ДО_ЧИСЛО = /\d\s*(ml|mg|kg|cm)\b/i;

const ц = { чер: '\x1b[31m', жъл: '\x1b[33m', зел: '\x1b[32m', сив: '\x1b[90m', край: '\x1b[0m' };
const бр = n => String(n).padStart(3);

// ── товарим живата база ──
const W = require(path.join(КОРЕН, 'dev/pyasachnik.js')).zaredi(null);
const КАРТИ = new Map(W.KB.entries.map(e => [e.id, e]));

const индекс = JSON.parse(fs.readFileSync('lib/index.json', 'utf8'));
const ЗАЕТИ_ID = new Set(индекс.items.map(i => i.id));
const РАЗДЕЛИ = {};                 // стая → Set от съществуващи раздели
for (const it of индекс.items) (РАЗДЕЛИ[it.r] = РАЗДЕЛИ[it.r] || new Set()).add(it.c);

// ═══════════════════════════════════════════════════════════════════════════
// ГЕЙТЪТ. Едно място, една истина — и самопроверката пуска ПРЕЗ НЕГО примамки,
// а не през копие на логиката му. Копието би доказало само че копието работи.
// Връща null (мине) или низ с причината.
// ═══════════════════════════════════════════════════════════════════════════
function ГЕЙТ(с, видени) {
  if (!с || typeof с !== 'object') return 'не е обект';
  const липсва = ['karta', 't', 'e', 's', 'k', 'c', 'body'].filter(k => !с[k] || !String(с[k]).trim());
  if (липсва.length) return 'липсват полета: ' + липсва.join(', ');

  const карта = КАРТИ.get(с.karta);
  if (!карта) return 'НЯМА такава карта в базата';
  if (карта.lib && String(карта.lib).trim()) return 'картата ВЕЧЕ има статия (' + карта.lib + ')';
  if (видени && видени.has(с.karta)) return 'същата карта я взе вече ' + видени.get(с.karta);

  const стая = карта.room;
  if (!ФАЙЛ_НА_СТАЯ[стая]) return 'непозната стая „' + стая + '"';

  const думи = String(с.body).trim().split(/\s+/).length;
  if (думи < 220) return 'тънка статия: ' + думи + ' думи (под 220)';
  if (думи > 620) return 'дълга статия: ' + думи + ' думи (над 620)';

  // прави кавички — счупват JS/JSON и не са българска типография
  const текст = [с.t, с.s, с.body].join('\n');
  if (/["']/.test(текст)) {
    const къде = текст.split('\n').findIndex(l => /["']/.test(l));
    return 'ПРАВА КАВИЧКА или апостроф (ред ~' + (къде + 1) + ') — трябват „ и "';
  }
  if (ДОЗА.test(текст)) return 'ДОЗА на лекарство — забранено';
  if (ОБЕЩАНИЯ.test(текст)) return 'обещание („гарантирано" / „100%" / „спасително средство")';
  if (ЛАТ_ДО_ЧИСЛО.test(текст)) return 'латинска мярка до число (пиши „5 мл")';

  if (!/^##\s/.test(String(с.body).trim())) return 'тялото не започва с „## "';
  const заглавия = (String(с.body).match(/^##\s+.+$/gm) || []).length;
  if (заглавия < 3) return 'само ' + заглавия + ' раздела (под 3)';

  // 🚨 е ЕДИНСТВЕНИЯТ ключ, който изнася реда пред очите на майката (helper.js:3042).
  // Сложен по средата на изречение, той не изнася нищо и лъже, че е спешно.
  const лошоСос = String(с.body).split('\n')
    .findIndex(l => l.includes('🚨') && !/^\s*(?:[-*]\s*)?🚨/.test(l));
  if (лошоСос >= 0) return '🚨 не е в началото на ред ' + (лошоСос + 1) + ' — тогава не изнася нищо';

  if (/\r/.test(с.body)) return 'има \\r в тялото';
  if (!(РАЗДЕЛИ[стая] && РАЗДЕЛИ[стая].has(с.c))) return 'разделът „' + с.c + '" не съществува в стая „' + стая + '"';
  if (String(с.s).length > 200) return 'резюмето е ' + String(с.s).length + ' знака (над 200)';
  if (String(с.t).trim() === String(карта.title || '').trim()) return 'заглавието е буква по буква същото като на картата';
  return null;
}

// ═══ САМОПРОВЕРКА: всяка примамка ТРЯБВА да падне, чистата ТРЯБВА да мине ═══
if (АРГ.includes('--samoproverka')) {
  const жива = W.KB.entries.find(e => !e.lib || !String(e.lib).trim());
  if (!жива) { console.log('🔴 няма карта без статия — самопроверката няма върху какво да стъпи'); process.exit(2); }
  // ⚠️ ДЪЛЖИНАТА НА ПРИМАМКАТА Е ЧАСТ ОТ ИЗМЕРВАНЕТО, не козметика.
  //    Първата версия правеше 1071 думи: чистата статия падаше по ДЪЛЖИНА и
  //    десет от дванайсетте примамки „падаха" по същата причина — тоест
  //    самопроверката светеше зелено, без да е проверила нито едно от правилата,
  //    които уж мери. Затова тук се цели средата на позволеното (220–620).
  const абзац = 'Тук пише нещо смислено на български за майката и нейното бебе. ';
  const блок = абзац.repeat(11);          // ~121 думи на раздел, ~370 общо
  const тяло = '## Какво се случва\n' + блок +
    '\n\n## Какво прави ръката\n- Едно нещо.\n' + блок +
    '\n\n## Кога при лекар\n' + блок;
  const чиста = () => ({
    karta: жива.id, t: 'Заглавие, различно от картата, за самопроверка', e: '🧪',
    s: 'Резюме за самопроверка.', k: 'проба', c: [...(РАЗДЕЛИ[жива.room] || [])][0], body: тяло
  });
  const примамки = [
    ['липсващо поле', (o => { delete o.e; return o; })(чиста())],
    ['несъществуваща карта', Object.assign(чиста(), { karta: 'nyama-takava-karta-xyz' })],
    ['права кавичка', Object.assign(чиста(), { body: тяло.replace('нещо', '"нещо"') })],
    ['доза', Object.assign(чиста(), { body: тяло.replace('Едно нещо.', 'Дай 5 мл сироп.') })],
    ['обещание', Object.assign(чиста(), { body: тяло.replace('Едно нещо.', 'Това гарантирано помага.') })],
    ['тънка', Object.assign(чиста(), { body: '## А\n малко\n## Б\n малко\n## В\n малко' })],
    ['без ## в началото', Object.assign(чиста(), { body: 'Просто текст. ' + тяло })],
    ['🚨 по средата на ред', Object.assign(чиста(), { body: тяло.replace('Едно нещо.', 'Едно 🚨 нещо.') })],
    ['непознат раздел', Object.assign(чиста(), { c: '🦄 Раздел, който не съществува' })],
    ['заглавие = заглавието на картата', Object.assign(чиста(), { t: жива.title })],
    ['латинска мярка', Object.assign(чиста(), { body: тяло.replace('Едно нещо.', 'Дай 30ml вода.') })],
    ['дълго резюме', Object.assign(чиста(), { s: 'дума '.repeat(60) })]
  ];
  let лошо = 0;
  console.log('\n  🧪 САМОПРОВЕРКА НА ГЕЙТА  (карта за стъпка: ' + жива.id + ')\n');
  const п0 = ГЕЙТ(чиста(), new Map());
  console.log('     ' + (п0 === null ? '✅' : '🔴') + ' чистата статия МИНАВА' + (п0 ? '   → отказана със: ' + п0 : ''));
  if (п0 !== null) лошо++;
  for (const [име, примамка] of примамки) {
    const р = ГЕЙТ(примамка, new Map());
    console.log('     ' + (р ? '✅' : '🔴') + ' пада „' + име + '"' + (р ? ц.сив + '   → ' + р + ц.край : '   🔴 МИНА, а не биваше'));
    if (!р) лошо++;
  }
  console.log('');
  process.exit(лошо ? 2 : 0);
}

// ═══ ЧЕТЕНЕ НА СТАЖ-ФАЙЛОВЕТЕ ═══
const папка = 'dev/nahodki';
if (!fs.existsSync(папка)) { console.log('няма ' + папка); process.exit(0); }
let стажове = fs.readdirSync(папка).filter(f => /^statii_.*\.json$/.test(f));
if (САМО) стажове = стажове.filter(f => f.includes(САМО));
if (!стажове.length) { console.log('няма нито един statii_*.json в ' + папка); process.exit(0); }

console.log('');
console.log('  🔀 СЛИВАЧ НА СТАТИИ' + (ПИШИ ? '' : ц.жъл + '   [СУХО — нищо не се пише]' + ц.край));
console.log('  стаж-файлове: ' + стажове.join(' '));
console.log('');

const приети = [];
const отказани = [];
const видени_карти = new Map();     // karta → кой файл я е взел пръв

for (const име of стажове) {
  let списък;
  try {
    списък = JSON.parse(fs.readFileSync(path.join(папка, име), 'utf8'));
  } catch (e) {
    отказани.push({ файл: име, karta: '—', защо: 'файлът НЕ СЕ ПАРСВА: ' + e.message.slice(0, 90) });
    continue;
  }
  if (!Array.isArray(списък)) {
    отказани.push({ файл: име, karta: '—', защо: 'върхът не е масив, а ' + typeof списък });
    continue;
  }

  for (const с of списък) {
    const причина = ГЕЙТ(с, видени_карти);
    if (причина) { отказани.push({ файл: име, karta: (с && с.karta) || '—', защо: причина }); continue; }
    const карта = КАРТИ.get(с.karta);
    const стая = карта.room;
    const цел = ФАЙЛ_НА_СТАЯ[стая];
    const думи = String(с.body).trim().split(/\s+/).length;

    // ── раздаване на id ──
    let id;
    do { id = 'lib-' + crypto.randomBytes(4).toString('hex'); } while (ЗАЕТИ_ID.has(id));
    ЗАЕТИ_ID.add(id);
    видени_карти.set(с.karta, име);

    приети.push({
      id, файл: име, цел, стая, karta: с.karta, думи,
      мета: { id, t: с.t, r: стая, e: с.e, s: с.s, k: с.k, g: '', p: 50, c: с.c, f: цел },
      тяло: с.body
    });
  }
}

// ═══ ДОКЛАД ═══
const постая = {};
for (const п of приети) постая[п.стая] = (постая[п.стая] || 0) + 1;
console.log('  ── ПРИЕТИ: ' + приети.length + ' ──');
for (const [с, n] of Object.entries(постая).sort((a, b) => b[1] - a[1])) {
  console.log('     ' + бр(n) + '  ' + с + '  → ' + ФАЙЛ_НА_СТАЯ[с]);
}
if (приети.length) {
  const д = приети.map(п => п.думи);
  console.log('     думи: най-къса ' + Math.min(...д) + ' · най-дълга ' + Math.max(...д) +
    ' · общо ' + д.reduce((a, b) => a + b, 0));
}
console.log('');
if (отказани.length) {
  console.log('  ' + ц.чер + '── ОТКАЗАНИ: ' + отказани.length + ' ──' + ц.край);
  for (const о of отказани) console.log('     🔴 ' + String(о.karta).padEnd(26) + о.защо + ц.сив + '   [' + о.файл + ']' + ц.край);
  console.log('');
}

if (!приети.length) { console.log('  нищо за сливане.'); process.exit(отказани.length ? 1 : 0); }
if (!ПИШИ) {
  console.log('  ' + ц.жъл + 'СУХО. За да се слее наистина: node dev/slivach_statii.js --pishi' + ц.край);
  console.log('');
  process.exit(отказани.length ? 1 : 0);
}

// ═══ ПЪТЯТ НАЗАД — ПРЕДИ да пипнем каквото и да е ═══
const целеви = [...new Set(приети.map(п => п.цел))];
const заПазене = ['lib/index.json', 'js/kb.js', 'js/lib.js', ...целеви.map(f => 'lib/' + f)];
for (const f of заПазене) fs.copyFileSync(f, f + '.PREDI_SLIVANE');
console.log('  🛟 път назад: ' + заПазене.length + ' файла с наставка .PREDI_SLIVANE');

// ═══ ПИСАНЕ ═══
// 1 · телата
// ⚠️ ФОРМАТЪТ НА ВСЕКИ ФАЙЛ СЕ ЗАПАЗВА. Измерено сега: lib/preg-1.json е с
//    отстъп 1 (102 реда), а lib/women-1.json и lib/index.json са на един ред.
//    Пренаписване с общ формат прави 700 KB шум в диффа и скрива поправката.
const отстъп = текст => (/^\{\r?\n /.test(текст) ? 1 : 0);
for (const f of целеви) {
  const p = 'lib/' + f;
  const сур = fs.readFileSync(p, 'utf8');
  const о = отстъп(сур);
  const j = JSON.parse(сур);
  for (const п of приети.filter(x => x.цел === f)) j[п.id] = п.тяло;
  fs.writeFileSync(p, JSON.stringify(j, null, о), 'utf8');
}
// 2 · индексът
const предиБрой = индекс.items.length;
for (const п of приети) индекс.items.push(п.мета);
индекс.n = индекс.items.length;
индекс.rooms = {};
for (const it of индекс.items) индекс.rooms[it.r] = (индекс.rooms[it.r] || 0) + 1;
fs.writeFileSync('lib/index.json', JSON.stringify(индекс, null, отстъп(fs.readFileSync('lib/index.json.PREDI_SLIVANE', 'utf8'))), 'utf8');

// 3 · картите в kb.js
let kb = fs.readFileSync('js/kb.js', 'utf8');
const немВмъкнати = [];
for (const п of приети) {
  const котви = [`id: '${п.karta}',`, `id: "${п.karta}",`];
  const котва = котви.find(k => kb.split(k).length === 2);   // ТОЧНО едно срещане
  if (!котва) { немВмъкнати.push(п.karta); continue; }
  kb = kb.replace(котва, котва + ` lib: '${п.id}',`);
}
fs.writeFileSync('js/kb.js', kb, 'utf8');

// 4 · кеш-бюстът на библиотеката
let libjs = fs.readFileSync('js/lib.js', 'utf8');
const мЛВ = libjs.match(/const LV = '(\d+)';/);
if (мЛВ) {
  const ново = String(Number(мЛВ[1]) + 1);
  libjs = libjs.replace(мЛВ[0], `const LV = '${ново}';`);
  fs.writeFileSync('js/lib.js', libjs, 'utf8');
  console.log('  🔢 LV: ' + мЛВ[1] + ' → ' + ново);
} else {
  console.log('  ' + ц.чер + '🔴 LV не се намери в js/lib.js — кешът НЯМА да се обнови!' + ц.край);
}

// ═══ ПРОВЕРКА СЛЕД ПИСАНЕТО — иначе „готово" е дума, не наблюдение ═══
console.log('');
console.log('  ── проверка след писането ──');
let паднали = 0;
const пров = (име, условие, детайл) => {
  console.log('     ' + (условие ? '✅' : '🔴') + ' ' + име + (детайл ? '  ' + детайл : ''));
  if (!условие) паднали++;
};

try { new vm.Script(fs.readFileSync('js/kb.js', 'utf8')); пров('js/kb.js се парсва', true); }
catch (e) { пров('js/kb.js се парсва', false, e.message.slice(0, 90)); }
try { new vm.Script(fs.readFileSync('js/lib.js', 'utf8')); пров('js/lib.js се парсва', true); }
catch (e) { пров('js/lib.js се парсва', false, e.message.slice(0, 90)); }

let jsonОк = true, тела = 0;
for (const f of целеви) {
  try { тела += Object.keys(JSON.parse(fs.readFileSync('lib/' + f, 'utf8'))).length; }
  catch (e) { jsonОк = false; console.log('        🔴 lib/' + f + ': ' + e.message.slice(0, 80)); }
}
пров('всички пипнати lib/*.json се парсват', jsonОк, '(' + тела + ' тела в ' + целеви.length + ' файла)');

const нов = JSON.parse(fs.readFileSync('lib/index.json', 'utf8'));
пров('index.n съвпада с items', нов.n === нов.items.length, нов.n + ' = ' + нов.items.length);
пров('index порасна с точно ' + приети.length, нов.items.length === предиБрой + приети.length,
  предиБрой + ' → ' + нов.items.length);
пров('всички карти получиха lib', немВмъкнати.length === 0,
  немВмъкнати.length ? 'НЕ: ' + немВмъкнати.join(', ') : '');

// презареждаме базата НАНОВО и питаме нея, не паметта си
delete require.cache[require.resolve(path.join(КОРЕН, 'dev/pyasachnik.js'))];
const W2 = require(path.join(КОРЕН, 'dev/pyasachnik.js')).zaredi(null);
пров('картите са пак ' + W.KB.entries.length, W2.KB.entries.length === W.KB.entries.length,
  String(W2.KB.entries.length));
const свързани = приети.filter(п => {
  const z = W2.KB.entries.find(e => e.id === п.karta);
  return z && z.lib === п.id;
}).length;
пров('картите сочат новите статии', свързани === приети.length, свързани + '/' + приети.length);

const телаВсички = {};
for (const f of Object.values(ФАЙЛ_НА_СТАЯ)) Object.assign(телаВсички, JSON.parse(fs.readFileSync('lib/' + f, 'utf8')));
const безТяло = приети.filter(п => !телаВсички[п.id]).length;
пров('всяка нова статия има тяло', безТяло === 0, безТяло ? безТяло + ' без тяло' : '');

console.log('');
if (паднали) {
  console.log('  ' + ц.чер + '🔴 ' + паднали + ' проверки паднаха. Върни с:' + ц.край);
  console.log('     git checkout -- lib js');
  process.exit(2);
}
console.log('  ' + ц.зел + '✅ слети ' + приети.length + ' статии' + ц.край +
  (отказани.length ? '   ' + ц.чер + '(' + отказани.length + ' отказани — виж горе)' + ц.край : ''));
console.log('  Сега: node dev/standarti.js   и   node dev/vdigni_versii.js');
console.log('');
process.exit(отказани.length ? 1 : 0);
