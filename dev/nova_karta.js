// ═══════════════════════════════════════════════════════════════════════
// 🆕 НОВА КАРТА С МЯРКА — добавя карти в js/kb.js, но само ако издържат
//
// ЗАЩО СЪЩЕСТВУВА: досега всяка нова карта се пишеше на ръка в js/kb.js и
//   се проверяваше СЛЕД това. А новата карта може:
//     · да открадне въпроси от съществуваща (най-честото),
//     · да няма статия (пазачът karta_statiya пада: „без статия 0"),
//     · да няма чипове (пазачът иска и тях),
//     · да има под 5 ключа (трети праг),
//     · да дублира id (базата се разваля мълчаливо).
//   Тук всичко това се проверява ПРЕДИ записа, а без --pishi нищо не се пише.
//
// ВХОД: json файл — масив от {id, room, title, core, tip, follow, keys[],
//       lib[], chips[], от?, до?}
// ПУСКАНЕ: node dev/nova_karta.js <файл.json> [--pishi]
// ИЗХОД:   0 ок · 1 пада · 2 сляп
// ПЪТ НАЗАД: без --pishi няма запис. С --pishi — git revert.
// ═══════════════════════════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');
const { zaredi } = require('./pyasachnik.js');

const САМО = !process.argv.includes('--pishi');
const ВХОД = process.argv[2];
if (!ВХОД || !fs.existsSync(ВХОД)) { console.log('🔴 подай json с масив от карти'); process.exit(2); }
const НОВИ = JSON.parse(fs.readFileSync(ВХОД, 'utf8'));
if (!Array.isArray(НОВИ) || !НОВИ.length) { console.log('🔴 входът не е масив с карти'); process.exit(2); }

const Ф = path.join(__dirname, '..', 'js/kb.js');
const изв = fs.readFileSync(Ф, 'utf8');

// ── 0 · САМИЯТ ВХОД ИЗПРАВЕН ЛИ Е ──
const ЗАДЪЛЖИТЕЛНИ = ['id', 'room', 'title', 'core', 'keys'];
const беди = [];
const видени = new Set();
for (const к of НОВИ) {
  for (const п of ЗАДЪЛЖИТЕЛНИ) if (!к[п]) беди.push(к.id + ': липсва ' + п);
  if (!Array.isArray(к.keys) || к.keys.length < 5) беди.push(к.id + ': под 5 ключа (' + ((к.keys || []).length) + ')');
  if (!к.lib || (Array.isArray(к.lib) && !к.lib.length)) беди.push(к.id + ': БЕЗ СТАТИЯ — пазачът karta_statiya ще падне');
  if (!к.chips || !к.chips.length) беди.push(к.id + ': без чипове');
  if (видени.has(к.id)) беди.push(к.id + ': ПОВТОРЕН id във входа');
  видени.add(к.id);
  if (изв.indexOf("id: '" + к.id + "'") > -1) беди.push(к.id + ': id ВЕЧЕ СЪЩЕСТВУВА в базата');
  for (const ключ of (к.keys || [])) if (String(ключ).indexOf("'") > -1) беди.push(к.id + ': ключ с апостроф — ще счупи файла');
}
if (беди.length) { console.log('🔴 ВХОДЪТ Е СЧУПЕН:'); беди.forEach(x => console.log('   ' + x)); process.exit(1); }

// ── 1 · СГЛОБЯВАНЕ НА ТЕКСТА ──
const цит = s => "'" + String(s).split("'").join('’') + "'";
function запис(к) {
  const р = ['    {'];
  р.push('      id: ' + цит(к.id) + ', room: ' + цит(к.room) +
    (к['от'] !== undefined ? ", от: " + к['от'] : '') +
    (к['до'] !== undefined ? ", до: " + к['до'] : '') + ',');
  const lib = Array.isArray(к.lib) ? к.lib : [к.lib];
  р.push('      lib: [' + lib.map(цит).join(', ') + '],');
  р.push('      keys: [' + к.keys.map(цит).join(', ') + '],');
  р.push('      title: ' + цит(к.title) + ',');
  р.push('      core: ' + цит(к.core) + ',');
  if (к.tip) р.push('      tip: ' + цит(к.tip) + ',');
  if (к.follow) р.push('      follow: ' + цит(к.follow) + ',');
  if (к.chips && к.chips.length) р.push('      chips: [' + к.chips.map(цит).join(', ') + '],');
  р.push('    },');
  return р.join('\n');
}

function опери(src) {
  const NL = src.indexOf('\r\n') > -1 ? '\r\n' : '\n';
  const L = src.split(/\r?\n/);
  // вмъкваме СЛЕД първия ред „entries: [" — така новите са най-отгоре и
  // при равен резултат печели по-ранната, тоест не крадат тихо от старите
  const i = L.findIndex(x => x.trim() === 'entries: [');
  if (i < 0) throw new Error('редът „entries: [" не се намира');
  const блок = НОВИ.map(запис).join(NL).split('\n').join(NL);
  L.splice(i + 1, 0, ...блок.split(NL));
  return L.join(NL);
}

let нов;
try { нов = опери(изв); } catch (e) { console.log('🔴 ' + e.message + ' — СЛЯП'); process.exit(2); }

// ── 2 · ЗАРЕЖДА ЛИ СЕ ИЗОБЩО ──
let B;
try { B = zaredi(null, { kbPatch: () => нов }); }
catch (e) { console.log('🔴 БАЗАТА НЕ СЕ ЗАРЕЖДА след добавянето: ' + e.message); process.exit(1); }
const A = zaredi(null);
if (!A.BL_MATCH('температура')) { console.log('🔴 сляпа сонда'); process.exit(2); }

const KBa = A.BL_KB || A.KB, KBb = B.BL_KB || B.KB;
console.log('карти: ' + (KBa.entries || []).length + ' → ' + (KBb.entries || []).length);

// ── 3 · СТАТИИТЕ СЪЩЕСТВУВАТ ЛИ ──
const тела = new Set();
for (const f of fs.readdirSync(path.join(__dirname, '..', 'lib'))) {
  if (!/\.json$/.test(f) || f === 'index.json') continue;
  try {
    const j = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'lib', f), 'utf8'));
    for (const id of Object.keys(j)) if (id.indexOf('lib-') === 0) тела.add(id);
  } catch (e) {}
}
const липсващиСтатии = [];
for (const к of НОВИ) for (const id of (Array.isArray(к.lib) ? к.lib : [к.lib])) if (!тела.has(id)) липсващиСтатии.push(к.id + ' → ' + id);

// ── 4 · ВАДИ ЛИ ВСЕКИ КЛЮЧ СВОЯТА КАРТА ──
let общо = 0, ок = 0; const паднали = [];
for (const к of НОВИ) for (const ключ of к.keys) {
  общо++;
  const r = B.BL_MATCH(ключ, к.room);
  if (r && r.id === к.id) ок++; else паднали.push(к.id + '  ← „' + ключ + '"  дава ' + (r ? r.id : 'НИЩО'));
}

// ── 5 · КРАЖБА ОТ СЪЩЕСТВУВАЩИ ──
let изр = 0; const смен = [];
for (const и of ['korpus350', 'korpus_nevinni', 'korpus_nevinni2', 'korpus_speshni', 'korpus_hipoteza'])
  for (const q of require('./' + и + '.json')) {
    const т = q.t; if (!т) continue; изр++;
    const x = A.BL_MATCH(т, q.r), y = B.BL_MATCH(т, q.r);
    const ix = x ? x.id : '-', iy = y ? y.id : '-';
    if (ix !== iy) смен.push('[' + q.e + '] ' + т + '  : ' + ix + ' -> ' + iy);
  }

console.log('');
console.log('── РАВНОСМЕТКА ──');
console.log('  липсващи статии: ' + липсващиСтатии.length);
липсващиСтатии.forEach(x => console.log('     🔴 ' + x));
console.log('  ключът вади своята карта: ' + ок + '/' + общо);
паднали.slice(0, 20).forEach(x => console.log('     ⚠️ ' + x));
console.log('  корпус ' + изр + ' изречения · сменена карта при ' + смен.length);
смен.slice(0, 20).forEach(x => console.log('     ⚠️ ' + x));

const пада = липсващиСтатии.length > 0 || ок < общо * 0.9;
console.log('');
if (пада) { console.log('🔴 НЕ Е ГОТОВО ЗА ЗАПИС'); process.exit(1); }
if (!САМО) { fs.writeFileSync(Ф, нов); console.log('✅ ЗАПИСАНО в js/kb.js — вдигни ?v= и пусни колана'); }
else console.log('(само мярка · за запис: --pishi)');
