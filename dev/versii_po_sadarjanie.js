// ═══════════════════════════════════════════════════════════
// 🔢 ВЕРСИИ ПО СЪДЪРЖАНИЕ — не по часови печат
//
// Капанът, в който съм падал четири пъти: пипаш css/style.css, после
// index.html (за да вдигнеш номера) — и проверката „кой файл е по-нов от
// index.html" не намира нищо, защото index.html е пипнат ПОСЛЕДЕН.
// Часовият печат отговаря на грешния въпрос. Затова тук питаме git
// КОЙ ФАЙЛ Е ПРОМЕНЕН, не кога.
//
// Защо изобщо има значение: два агента ми казаха едно и също — фиксът им
// НЕ СТИГА ДО ТЕЛЕФОНА без вдигнат номер. Страницата тегли rooms2.js?v=64
// от cache-storage и мама вижда стария код. Поправка, която не е стигнала,
// не е поправка.
//
// ПУСКАНЕ:  node dev/versii_po_sadarjanie.js <база>
//   базата е последният КАЧЕН комит, напр. 46292ed
//
// Вдига: ?v= в index.html за всеки променен js/ и css/ файл,
//        CACHE в sw.js, и LV в js/lib.js — но LV САМО ако lib/ е пипнат.
//
// ПЪТ НАЗАД: git checkout index.html sw.js js/lib.js
// ═══════════════════════════════════════════════════════════
const fs = require('fs');
const { execSync } = require('child_process');

const база = process.argv[2];
if (!база) {
  console.log('дай базов комит: node dev/versii_po_sadarjanie.js <sha>');
  process.exit(1);
}
const g = c => execSync(c, { encoding: 'utf8' });

// от git: и комитнатото след базата, и още неспазеното в работната папка
const отДиф = g('git diff --name-only ' + база + ' HEAD').split('\n');
const отРаб = g('git status --porcelain').split('\n').map(l => l.slice(3).trim());
const променени = new Set(
  отДиф.concat(отРаб)
    .map(s => s.trim())
    .filter(f => /^(js|css|lib)\//.test(f))
    .filter(f => !/ARCHIVE|PREDI|BAK|NOV_|_izmervane/.test(f))
);

const ЕСК = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

let h = fs.readFileSync('index.html', 'utf8');
const старH = h;
const редове = [];

for (const f of [...променени].sort()) {
  if (f.startsWith('lib/')) continue;
  const m = h.match(new RegExp(ЕСК(f) + '\\?v=(\\d+)'));
  if (!m) { редове.push('  ⚠ ' + f + ' — няма ?v= в index.html'); continue; }
  const нов = +m[1] + 1;
  h = h.split(f + '?v=' + m[1]).join(f + '?v=' + нов);
  редове.push('  ' + f.padEnd(22) + ' v' + m[1] + ' → v' + нов);
}
if (h !== старH) fs.writeFileSync('index.html', h, 'utf8');

const sw = fs.readFileSync('sw.js', 'utf8');
const mс = sw.match(/babyland-v(\d+)/);
if (mс) {
  const н = +mс[1] + 1;
  fs.writeFileSync('sw.js', sw.split('babyland-v' + mс[1]).join('babyland-v' + н), 'utf8');
  редове.push('  sw.js CACHE            v' + mс[1] + ' → v' + н);
}

// LV пази отделно библиотеката: lib/*.json не минават през ?v= на index.html
const пипнатаБиб = [...променени].filter(f => f.startsWith('lib/') && f.endsWith('.json'));
if (пипнатаБиб.length) {
  const l = fs.readFileSync('js/lib.js', 'utf8');
  const m = l.match(/LV\s*=\s*'(\d+)'/);
  if (m) {
    const н = +m[1] + 1;
    fs.writeFileSync('js/lib.js', l.replace(/LV\s*=\s*'\d+'/, "LV = '" + н + "'"), 'utf8');
    редове.push('  js/lib.js LV           ' + m[1] + ' → ' + н + '   (' + пипнатаБиб.length + ' файла в lib/)');
    // ⚠ и самият lib.js се промени току-що → неговият ?v= също трябва да мръдне,
    //   иначе новото LV стои в стар файл, който браузърът не тегли отново.
    let h2 = fs.readFileSync('index.html', 'utf8');
    const m2 = h2.match(/js\/lib\.js\?v=(\d+)/);
    if (m2 && !редове.some(r => r.indexOf('js/lib.js ') === 2)) {
      const н2 = +m2[1] + 1;
      fs.writeFileSync('index.html', h2.split('js/lib.js?v=' + m2[1]).join('js/lib.js?v=' + н2), 'utf8');
      редове.push('  js/lib.js              v' + m2[1] + ' → v' + н2 + '   (заради самото LV)');
    }
  }
} else {
  редове.push('  js/lib.js LV           не се пипа — нищо в lib/ не е променено');
}

console.log('база: ' + база + ' · променени файла: ' + променени.size + '\n');
console.log(редове.join('\n'));
