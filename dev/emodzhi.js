/* ═══════════════════════════════════════════════════════════════════════════════
   🧸 ПАЗАЧ „НЯМА ГОЛО ЕМОДЖИ В ИНТЕРФЕЙСА“ · 23.09.2026 (C5 от ПЛАН_УЛТРА)
   В референциите на собственика няма нито едно системно емоджи — всичко е плюш.
   Плюшеният слой (js/pl-plyush.js) подменя емоджитата с рисунки, но само тези,
   които са в картата К. Този пазач намира емоджи в ЕКРАННИТЕ файлове, за които
   НЯМА рисунка — те излизат голи на телефона.

   Работи като ХРАПОВИК: пада само когато се появи НОВО голо емоджи спрямо
   записаната мярка (dev/emodzhi_izmereno.json). Така старите 150+ не блокират,
   но нито едно ново не минава тихо.

   ПУСКАНЕ:            node dev/emodzhi.js          (изход 1 = има НОВИ голи)
   НОВА МЯРКА:         node dev/emodzhi.js --zapishi
   САМОПРОВЕРКА:       вкарва измислено емоджи и проверява, че пазачът го хваща.
   ═══════════════════════════════════════════════════════════════════════════════ */
'use strict';
const fs = require('fs');
const path = require('path');
const КОРЕН = path.join(__dirname, '..');

// екранните файлове: тези, които РИСУВАТ интерфейс (не съдържанието на статиите в kb.js)
const ФАЙЛОВЕ = [
  'index.html', 'js/home.js', 'js/rooms.js', 'js/rooms2.js', 'js/daily.js', 'js/firstday.js',
  'js/chasovnik.js', 'js/premium-home.js', 'js/search.js', 'js/profile.js', 'js/sos.js',
  'js/women4.js', 'js/tools.js', 'js/pl-ui.js'
].filter(ф => fs.existsSync(path.join(КОРЕН, ф)));

// нарочните изключения: знаци на интерфейса, които НЕ са рисунки
const ПОЗВОЛЕНИ = new Set(['✕', '✖', '✔', '✓', '×', '›', '‹', '→', '←', '↩', '⌫', '▾', '▴', '♡', '♥', '·', '—', '▶', '⏸']);

const ЕМО = new RegExp('\\p{Extended_Pictographic}(?:\uFE0F|\u200D\\p{Extended_Pictographic}|\\p{Emoji_Modifier}|\uFE0F\u20E3)*', 'gu');

// коментарите не са интерфейс: /* … */, // …, <!-- … -->  (🪤 е мой знак в коментар)
function безКоментари(с) {
  return с
    .replace(new RegExp('/\\*[\\s\\S]*?\\*/', 'g'), ' ')
    .replace(new RegExp('^[ \\t]*//.*$', 'gm'), ' ')
    .replace(new RegExp('<!--[\\s\\S]*?-->', 'g'), ' ');
}

function картата() {
  const с = fs.readFileSync(path.join(КОРЕН, 'js/pl-plyush.js'), 'utf8');
  const н = с.indexOf('const К = {');
  const к = с.indexOf('\n  };', н);
  if (н < 0 || к < 0) throw new Error('не намирам картата К в js/pl-plyush.js');
  const тяло = с.slice(н, к);
  const ключове = new Set();
  const р = /'([^']+)':\s*\[/g;
  let м;
  while ((м = р.exec(тяло))) ключове.add(м[1]);
  return ключове;
}

function провери(допълнителен) {
  const К = картата();
  const намерени = new Map();
  for (const ф of ФАЙЛОВЕ) {
    const с = безКоментари(fs.readFileSync(path.join(КОРЕН, ф), 'utf8') + (допълнителен || ''));
    let м;
    ЕМО.lastIndex = 0;
    while ((м = ЕМО.exec(с))) {
      const е = м[0];
      if (К.has(е) || ПОЗВОЛЕНИ.has(е)) continue;
      const ред = с.slice(0, м.index).split('\n').length;
      if (!намерени.has(е)) намерени.set(е, []);
      const списък = намерени.get(е);
      if (списък.length < 3) списък.push(ф + ':' + ред);
    }
  }
  return { К, намерени };
}

// ── самопроверка: измисленото емоджи трябва да бъде хванато ──
const хваща = провери(" const тест = '🦄'; ").намерени.has('🦄');

const { К, намерени } = провери();
console.log('🧸 ПАЗАЧ НА ПЛЮША');
console.log('  самопроверка: ' + (хваща ? '1/1 хванато ✅' : '0/1 ❌ ПАЗАЧЪТ НЕ РАБОТИ'));
console.log('  рисунки в картата: ' + К.size + ' · проверени файлове: ' + ФАЙЛОВЕ.length);
if (!хваща) process.exit(2);

const ПЪТ = path.join(__dirname, 'emodzhi_izmereno.json');
if (process.argv.includes('--zapishi')) {
  fs.writeFileSync(ПЪТ, JSON.stringify({ kogato: 'мерено с node dev/emodzhi.js --zapishi', goli: [...намерени.keys()] }, null, 1));
  console.log('\n📝 записани ' + намерени.size + ' известни голи емоджита; отсега пазачът пада само при НОВИ');
  process.exit(0);
}

if (fs.existsSync(ПЪТ)) {
  const записано = new Set(JSON.parse(fs.readFileSync(ПЪТ, 'utf8')).goli);
  const нови = [...намерени.keys()].filter(е => !записано.has(е));
  console.log('  известни голи: ' + записано.size + ' · сега: ' + намерени.size);
  if (!нови.length) {
    console.log('\n✅ НЯМА НОВИ голи емоджита');
    process.exit(0);
  }
  console.log('\n🔴 НОВИ голи емоджита: ' + нови.length);
  for (const е of нови) console.log('  ' + е + '  ' + намерени.get(е).join(' · '));
  console.log('\nЛек: сложи рисунка в К (js/pl-plyush.js) или знака в ПОЗВОЛЕНИ (dev/emodzhi.js).');
  process.exit(1);
}

if (!намерени.size) {
  console.log('\n✅ ЧИСТО — всяко екранно емоджи има плюшена рисунка');
  process.exit(0);
}
console.log('\n🟡 ПЪРВО МЕРЕНЕ: ' + намерени.size + ' голи емоджита. Пусни `node dev/emodzhi.js --zapishi`.');
process.exit(0);
