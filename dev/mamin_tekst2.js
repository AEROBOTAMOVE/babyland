// dev/mamin_tekst2.js — ТОЧНИТЕ МЕСТА: мамина стойност в HTML шаблон, БЕЗ esc.
// Пускане: node dev/mamin_tekst2.js
//
// Разликата от mamin_tekst.js: там ловях ЧЕТЕНЕТО на ключа (и хващах
// `const getBaby = () => load(...)` на върха на файла — безобиден помощник).
// Тук ловя САМАТА ВЛОЖКА в HTML: `${израз}` или `' + израз + '`, чийто израз
// съдържа мамино поле. И питам единственото важно нещо: обвито ли е в esc.

const fs = require('fs'), path = require('path');
const КОРЕН = path.resolve(__dirname, '..');

// Полетата, които мама пълни сама (измерени от dev/mamin_tekst.js, стъпка 1/1б)
const МАМИНИ_ПОЛЕТА = [
  'name', 'note', 'first', 'what', 'then', 'now', 'q', 'a', 'txt', 'text', 'dedic'
];
// Ключове, четени направо в шаблон
const МАМИНИ_КЛЮЧОВЕ = ['bl_baby', 'bl_baby2', 'bl_mama', 'bl_me', 'bl_wm_diary',
  'bl_wm_dreams', 'bl_wm_letters', 'bl_wm_freeday', 'bl_wm_trip', 'bl_lab_timeline',
  'bl_preg_memories', 'bl_qdoc_my', 'bl_yb_dedic', 'bl_q30', 'bl_notes',
  'bl_pump', 'bl_lmp'];

// ── Уредът: вложките на едно HTML място ────────────────────────────────────
function вложкиНа(текст, начало, край) {
  const парче = текст.slice(начало, край), сп = [];
  let i = 0;
  while ((i = парче.indexOf('${', i)) !== -1) {
    let д = 1, j = i + 2;
    while (j < парче.length && д > 0) { if (парче[j] === '{') д++; else if (парче[j] === '}') { д--; if (!д) break; } j++; }
    сп.push({ код: парче.slice(i + 2, j), поз: начало + i });
    i = j + 1;
  }
  const рег = /['"]\s*\+\s*([^+]{1,160}?)\s*\+\s*['"]/g; let m;
  while ((m = рег.exec(парче))) сп.push({ код: m[1], поз: начало + m.index });
  return сп;
}

// краят на израза (същата логика като в innerhtml_mama.js)
function край(текст, поз) {
  let i = поз, д = 0, кав = null, шаб = 0;
  const лимит = Math.min(текст.length, поз + 5000);
  for (; i < лимит; i++) {
    const c = текст[i], p = текст[i - 1];
    if (кав) { if (c === кав && p !== '\\') кав = null; continue; }
    if (шаб) { if (c === '`' && p !== '\\') shabOut(); else if (c === '$' && текст[i + 1] === '{') { д++; i++; } else if (c === '}' && д > 0) д--; continue; }
    if (c === '"' || c === "'") { кав = c; continue; }
    if (c === '`') { шаб++; continue; }
    if ('([{'.includes(c)) { д++; continue; }
    if (')]}'.includes(c)) { д--; continue; }
    if (c === ';' && д <= 0) break;
    function shabOut() { шаб--; }
  }
  return i;
}

// ── МАМИНО ЛИ Е ─────────────────────────────────────────────────────────────
// Границите СА ИЗРИЧНИ — \b не вижда кирилица, а и тук имената са латински,
// но „name" е подниз на „nameI"/„filename" → капанът от правило 3.
const Д = 'A-Za-zА-Яа-я0-9_$';
function иманеПоле(код) {
  for (const п of МАМИНИ_ПОЛЕТА) {
    const р = new RegExp('\\.\\s*' + п + '(?![' + Д + '])');
    if (р.test(код)) return '.' + п;
  }
  for (const к of МАМИНИ_КЛЮЧОВЕ) if (код.includes("'" + к + "'") || код.includes('"' + к + '"')) return к;
  return null;
}
// обвито в esc на ВЪНШНОТО ниво около самата стойност?
function екранирано(код, каквоMatch) {
  // esc(...) някъде, което съдържа израза
  const рег = /esc\s*\(/g; let m;
  while ((m = рег.exec(код))) {
    let д = 1, j = m.index + m[0].length;
    while (j < код.length && д > 0) { if (код[j] === '(') д++; else if (код[j] === ')') д--; j++; }
    const вътре = код.slice(m.index + m[0].length, j - 1);
    if (иманеПоле(вътре) === каквоMatch) return true;
  }
  return false;
}

// ── ПРИМАМКА ────────────────────────────────────────────────────────────────
const ПРИМАМКА = `
  q.innerHTML = \`<p>\${b.name}</p>\`;             // ГОЛО
  q.innerHTML = \`<p>\${esc(b.name)}</p>\`;        // покрито
  q.innerHTML = \`<p>\${esc(x)} \${b.note}</p>\`;  // ГОЛО (второто)
  q.innerHTML = \`<p>\${filename}</p>\`;           // НЕ е мамино (подниз-капан)
  q.innerHTML = \`<p>\${load('bl_yb_dedic','')}</p>\`; // ГОЛО
`;
function сканирай(име, т) {
  const изх = [];
  const рег = /(?:\.innerHTML\s*\+?=\s*|insertAdjacentHTML\s*\([^,]+,\s*|\bel\s*\(\s*['"][^'"]*['"]\s*,\s*[^,]*,\s*)/g;
  let m;
  while ((m = рег.exec(т))) {
    const н = m.index + m[0].length, к = край(т, н);
    for (const в of вложкиНа(т, н, к)) {
      const каквo = иманеПоле(в.код);
      if (!каквo) continue;
      if (екранирано(в.код, каквo)) { изх.push({ файл: име, ред: т.slice(0, в.поз).split(/\r?\n/).length, поле: каквo, покрито: true, код: в.код.replace(/\s+/g, ' ').slice(0, 140) }); continue; }
      изх.push({ файл: име, ред: т.slice(0, в.поз).split(/\r?\n/).length, поле: каквo, покрито: false, код: в.код.replace(/\s+/g, ' ').slice(0, 140) });
    }
  }
  return изх;
}

const пр = сканирай('(ПРИМАМКА)', ПРИМАМКА);
const прГоли = пр.filter(x => !x.покрито), прПокрити = пр.filter(x => x.покрито);
console.log('═══ 0. ПРОВЕРКА НА УРЕДА ═══');
console.log('  голи:', прГоли.length, '(очаквани 3):', прГоли.map(x => x.код).join(' | '));
console.log('  покрити:', прПокрити.length, '(очаквани 1):', прПокрити.map(x => x.код).join(' | '));
const добре = прГоли.length === 3 && прПокрити.length === 1 && !пр.some(x => /filename/.test(x.код));
console.log(добре ? '  ✅ уредът различава голо/покрито и НЕ се хваща на „filename"\n' : '  ❌ УРЕДЪТ Е СЛЯП\n');
if (!добре) process.exitCode = 2;

// ── Истинското сканиране ────────────────────────────────────────────────────
const файлове = fs.readdirSync(path.join(КОРЕН, 'js')).filter(f => /\.js$/.test(f) && !/PREDI|\.BAK|ARCHIVE/.test(f)).map(f => 'js/' + f);
файлове.push('index.html');
const всичко = [];
for (const f of файлове) всичко.push(...сканирай(f, fs.readFileSync(path.join(КОРЕН, f), 'utf8')));

const голи = всичко.filter(x => !x.покрито), покрити = всичко.filter(x => x.покрито);
console.log('═══ 1. МАМИНА СТОЙНОСТ В HTML ШАБЛОН ═══');
console.log(`  общо ${всичко.length} · ПОКРИТИ с esc ${покрити.length} · ГОЛИ ${голи.length}\n`);
console.log('═══ 2. ГОЛИТЕ ═══');
голи.forEach(x => console.log(`  ⚠ ${x.файл}:${x.ред}  [${x.поле}]  ${x.код}`));
console.log('\n═══ 3. ПОКРИТИТЕ (за сверка, че уредът не мълчи) ═══');
покрити.slice(0, 25).forEach(x => console.log(`  ✔ ${x.файл}:${x.ред}  [${x.поле}]  ${x.код}`));
console.log(`  (${покрити.length} общо)`);

fs.writeFileSync(path.join(__dirname, 'mamin_tekst2.json'), JSON.stringify({ голи, покрити }, null, 1), 'utf8');
console.log('\n→ dev/mamin_tekst2.json');
