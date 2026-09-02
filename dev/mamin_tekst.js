// dev/mamin_tekst.js — ОТ ВХОДА НА МАЙКАТА ДО ЕКРАНА.
// Пускане: node dev/mamin_tekst.js
//
// Обратният ред на innerhtml_mama.js: не гадаем по имена на променливи, а
// тръгваме от местата, където МАМА ПИШЕ (input/textarea → save('bl_…')),
// и следим къде същият ключ се ЧЕТЕ и влиза в HTML.
//
// ⚠️ Примамка накрая: подаваме истински чупещ текст през истинските шаблони
//    и гледаме дали излиза счупен HTML. Без този опит отчетът е усет.

const fs = require('fs'), path = require('path');
const КОРЕН = path.resolve(__dirname, '..');
const файлове = fs.readdirSync(path.join(КОРЕН, 'js'))
  .filter(f => /\.js$/.test(f) && !/PREDI|\.BAK|ARCHIVE/.test(f)).map(f => 'js/' + f);

const текстНа = {};
файлове.forEach(f => текстНа[f] = fs.readFileSync(path.join(КОРЕН, f), 'utf8'));
const редНа = (t, п) => t.slice(0, п).split(/\r?\n/).length;

// ── 1. КЪДЕ МАМА ПИШЕ: ключове, които получават стойност от поле ───────────
// Търсим save('ключ', НЕЩО.value) и localStorage.setItem('ключ', … .value …)
const пишещи = {};   // ключ -> [{файл, ред, къс}]
const РЕГ_ЗАПИС = /(?:save|setItem)\s*\(\s*['"]([a-zA-Z0-9_]+)['"]\s*,\s*([^;]{0,200})/g;
for (const f of файлове) {
  const t = текстНа[f]; РЕГ_ЗАПИС.lastIndex = 0; let m;
  while ((m = РЕГ_ЗАПИС.exec(t))) {
    const ключ = m[1], дясно = m[2];
    if (!/\.value|\.trim\s*\(|textarea|input|инп|поле|\bta\b|\bинп\b/.test(дясно)) continue;
    (пишещи[ключ] = пишещи[ключ] || []).push({ файл: f, ред: редНа(t, m.index), къс: дясно.replace(/\s+/g, ' ').slice(0, 110) });
  }
}
// плюс полетата на профила: обекти, чиито полета идват от поле
const РЕГ_ПОЛЕ = /([A-Za-zА-Яа-я_$][\wА-Яа-я$]*)\s*\.\s*([A-Za-zА-Яа-я_$][\wА-Яа-я$]*)\s*=\s*([^;]{0,120}?\.value[^;]{0,60})/g;
const обектниПолета = [];
for (const f of файлове) {
  const t = текстНа[f]; РЕГ_ПОЛЕ.lastIndex = 0; let m;
  while ((m = РЕГ_ПОЛЕ.exec(t)))
    обектниПолета.push({ файл: f, ред: редНа(t, m.index), обект: m[1], поле: m[2], къс: m[0].replace(/\s+/g, ' ').slice(0, 130) });
}

console.log('═══ 1. КЪДЕ МАМА ПИШЕ (ключ ← поле) ═══');
Object.entries(пишещи).sort().forEach(([к, сп]) =>
  console.log(`  ${к.padEnd(24)} ${сп.length} места   напр. ${сп[0].файл}:${сп[0].ред}  ${сп[0].къс}`));
console.log(`  ключове: ${Object.keys(пишещи).length}`);

console.log('\n═══ 1б. ПОЛЕТА НА ОБЕКТ ← поле на майката ═══');
const уникПолета = {};
обектниПолета.forEach(p => (уникПолета[p.обект + '.' + p.поле] = уникПолета[p.обект + '.' + p.поле] || []).push(p));
Object.entries(уникПолета).forEach(([к, сп]) => console.log(`  ${к.padEnd(22)} ${сп[0].файл}:${сп[0].ред}  ${сп[0].къс}`));

// ── 2. КЪДЕ СЕ ЧЕТЕ и влиза ли ГОЛО в HTML ────────────────────────────────
// За всеки мамин ключ: намираме load('ключ'…) / getItem('ключ') и гледаме
// дали четенето стои вътре в шаблон/конкатенация, която отива в innerHTML.
const ПОЛЕТА_ИМЕНА = [...new Set(обектниПолета.map(p => p.поле))];
const МАМИНИ_КЛЮЧОВЕ = Object.keys(пишещи);

function вHTMLконтекст(t, поз) {
  // назад до 400 знака: има ли innerHTML =, insertAdjacentHTML, el(x,y, …
  const преди = t.slice(Math.max(0, поз - 700), поз);
  return /\.innerHTML\s*\+?=|insertAdjacentHTML|\bel\s*\([^;]*,[^;]*,/.test(преди) &&
         !/\.textContent\s*=[^;]*$/.test(преди);
}
function екраниранаОколо(t, поз) {
  const около = t.slice(Math.max(0, поз - 30), поз);
  return /esc\s*\(\s*$|esc\s*\(\s*[^)]{0,20}$/.test(около);
}

const голи = [];
for (const f of файлове) {
  const t = текстНа[f];
  for (const к of МАМИНИ_КЛЮЧОВЕ) {
    const р = new RegExp("(?:load|getItem)\\s*\\(\\s*['\"]" + к + "['\"]", 'g');
    let m;
    while ((m = р.exec(t))) {
      if (!вHTMLконтекст(t, m.index)) continue;
      голи.push({ файл: f, ред: редНа(t, m.index), ключ: к, екранирано: екраниранаОколо(t, m.index),
        къс: t.split(/\r?\n/)[редНа(t, m.index) - 1].trim().slice(0, 150) });
    }
  }
  // полетата (напр. .name, .text) вътре в HTML контекст
  for (const п of ПОЛЕТА_ИМЕНА) {
    const р = new RegExp("\\$\\{\\s*([A-Za-zА-Яа-я_$][\\wА-Яа-я$.]*\\." + п + ")\\s*[}|]", 'g');
    let m;
    while ((m = р.exec(t))) {
      голи.push({ файл: f, ред: редНа(t, m.index), ключ: '(поле) .' + п, екранирано: false,
        къс: t.split(/\r?\n/)[редНа(t, m.index) - 1].trim().slice(0, 150) });
    }
  }
}

console.log('\n═══ 2. ЧЕТЕНЕ НА МАМИН КЛЮЧ ВЪТРЕ В HTML ═══');
const гГоли = голи.filter(g => !g.екранирано);
const гЕкр = голи.filter(g => g.екранирано);
console.log(`  общо ${голи.length} · екранирани ${гЕкр.length} · ГОЛИ ${гГоли.length}`);
гГоли.forEach(g => console.log(`  ⚠ ${g.файл}:${g.ред}  [${g.ключ}]  ${g.къс}`));

fs.writeFileSync(path.join(__dirname, 'mamin_tekst.json'),
  JSON.stringify({ пишещи, обектниПолета, голи }, null, 1), 'utf8');
console.log('\n→ dev/mamin_tekst.json');
