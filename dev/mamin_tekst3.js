// dev/mamin_tekst3.js — НЕПРЯКИЯТ ПЪТ.
// mamin_tekst2.js гледа само `${b.name}`. Но мама може да стигне до екрана и така:
//     const име = load('bl_baby', {}).name;   …   `<h4>${име}</h4>`
// Тук: намирам променливите, ПЪЛНЕНИ от мамин източник, и после ги търся ГОЛИ
// вътре в HTML вложка — в СЪЩИЯ обхват (същата функция), не в целия файл.
// Пускане: node dev/mamin_tekst3.js

const fs = require('fs'), path = require('path');
const КОРЕН = path.resolve(__dirname, '..');
const файлове = fs.readdirSync(path.join(КОРЕН, 'js'))
  .filter(f => /\.js$/.test(f) && !/PREDI|\.BAK|ARCHIVE/.test(f)).map(f => 'js/' + f);

// мамин ИЗТОЧНИК от дясната страна на присвояване
const ИЗТОЧНИК = /load\s*\(\s*['"]bl_|localStorage\s*\.\s*getItem|\.\s*value\b|getBaby\s*\(|\bbaby\s*\(\s*\)|второ\s*\(\s*\)/;
// имена, които НЕ броим (шумни едносрични, ползвани за друго)
const ШУМ = new Set(['i', 'j', 'k', 'n', 'e', 'c', 'd', 'r', 'w', 'h', 'p']);

function редНа(т, п) { return т.slice(0, п).split(/\r?\n/).length; }

// краят на израза, знаещ низове (';' вътре в '&amp;' не е край — платено веднъж)
function крайИзраз(т, поз, макс = 4000) {
  let i = поз, д = 0, кав = null;
  const лим = Math.min(т.length, поз + макс);
  for (; i < лим; i++) {
    const c = т[i], p = т[i - 1];
    if (кав) { if (c === кав && p !== '\\') кав = null; continue; }
    if (c === '"' || c === "'" || c === '`') { кав = c; continue; }
    if ('([{'.includes(c)) { д++; continue; }
    if (')]}'.includes(c)) { д--; continue; }
    if (c === ';' && д <= 0) break;
  }
  return i;
}

function вложки(парче) {
  const сп = []; let i = 0;
  while ((i = парче.indexOf('${', i)) !== -1) {
    let д = 1, j = i + 2;
    while (j < парче.length && д > 0) { if (парче[j] === '{') д++; else if (парче[j] === '}') { д--; if (!д) break; } j++; }
    сп.push(парче.slice(i + 2, j)); i = j + 1;
  }
  const р = /['"]\s*\+\s*([^+]{1,120}?)\s*\+\s*['"]/g; let m;
  while ((m = р.exec(парче))) сп.push(m[1]);
  return сп;
}

// груби граници на функция: от `function`/`=>` до балансиране на {}
function функции(т) {
  const изх = []; const р = /(?:function\s*[\wА-Яа-я$]*\s*\([^)]*\)|\([^)]{0,120}\)\s*=>|[\wА-Яа-я$]+\s*=>)\s*\{/g; let m;
  while ((m = р.exec(т))) {
    let д = 1, i = m.index + m[0].length;
    while (i < т.length && д > 0) { const c = т[i]; if (c === '{') д++; else if (c === '}') д--; i++; }
    изх.push({ н: m.index, к: i });
  }
  return изх;
}

// ── ПРИМАМКА ───────────────────────────────────────────────────────────────
const ПРИМАМКА = `
function ще() {
  const име = load('bl_baby', {}).name;
  const бр = ДАННИ.length;
  box.innerHTML = \`<h4>\${име}</h4><span>\${бр}</span>\`;   // първото е ОПАСНО
}
function няма() {
  const име2 = load('bl_baby', {}).name;
  box.innerHTML = \`<h4>\${esc(име2)}</h4>\`;                 // покрито
}
`;

function сканирай(име, т) {
  const изх = [];
  for (const ф of функции(т)) {
    const тяло = т.slice(ф.н, ф.к);
    // 1) кои променливи в тази функция идват от мамин източник
    const мамини = new Set();
    const рп = /(?:const|let|var)\s+([A-Za-zА-Яа-я_$][\wА-Яа-я$]*)\s*=\s*([^;\n]{0,180})/g; let m;
    while ((m = рп.exec(тяло))) if (ИЗТОЧНИК.test(m[2]) && !ШУМ.has(m[1])) мамини.add(m[1]);
    if (!мамини.size) continue;
    // 2) HTML места в тази функция
    const рх = /(?:\.innerHTML\s*\+?=\s*|insertAdjacentHTML\s*\([^,]+,\s*|\bel\s*\(\s*['"][^'"]*['"]\s*,\s*[^,]*,\s*)/g;
    let h;
    while ((h = рх.exec(тяло))) {
      const н = h.index + h[0].length, к = крайИзраз(тяло, н);
      for (const в of вложки(тяло.slice(н, к))) {
        for (const п of мамини) {
          const гр = new RegExp('(^|[^A-Za-zА-Яа-я0-9_$.])' + п.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![A-Za-zА-Яа-я0-9_$])');
          if (!гр.test(в)) continue;
          // покрито ли е точно то с esc(...)
          const покрито = new RegExp('esc\\s*\\([^)]{0,60}' + п.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![A-Za-zА-Яа-я0-9_$])').test(в);
          изх.push({ файл: име, ред: редНа(т, ф.н + н), пром: п, покрито, вложка: в.replace(/\s+/g, ' ').slice(0, 120) });
        }
      }
    }
  }
  return изх;
}

const пр = сканирай('(ПРИМАМКА)', ПРИМАМКА);
const прГ = пр.filter(x => !x.покрито), прП = пр.filter(x => x.покрито);
console.log('═══ 0. ПРОВЕРКА НА УРЕДА ═══');
console.log('  голи:', прГ.length, '(очаквана 1):', прГ.map(x => x.вложка).join(' | '));
console.log('  покрити:', прП.length, '(очаквана 1):', прП.map(x => x.вложка).join(' | '));
const ок = прГ.length === 1 && прП.length === 1;
console.log(ок ? '  ✅ уредът следи непряката верига\n' : '  ❌ УРЕДЪТ Е СЛЯП\n');
if (!ок) process.exitCode = 2;

const всичко = [];
for (const f of файлове) всичко.push(...сканирай(f, fs.readFileSync(path.join(КОРЕН, f), 'utf8')));
const голи = всичко.filter(x => !x.покрито), покрити = всичко.filter(x => x.покрито);
console.log('═══ 1. НЕПРЯКА ВЕРИГА: мамин източник → променлива → HTML ═══');
console.log(`  общо ${всичко.length} · покрити ${покрити.length} · ГОЛИ ${голи.length}\n`);
голи.forEach(x => console.log(`  ⚠ ${x.файл}:${x.ред}  [${x.пром}]  ${x.вложка}`));
console.log('\n  покрити (сверка, че уредът не мълчи):');
покрити.slice(0, 12).forEach(x => console.log(`  ✔ ${x.файл}:${x.ред}  [${x.пром}]  ${x.вложка}`));

fs.writeFileSync(path.join(__dirname, 'mamin_tekst3.json'), JSON.stringify({ голи, покрити }, null, 1), 'utf8');
console.log('\n→ dev/mamin_tekst3.json');
