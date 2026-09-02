// dev/opit_snimki.js — ОПИТ ВЪРХУ ТОЧНИТЕ ШАБЛОНИ ЗА СНИМКИ.
// Пускане: node dev/opit_snimki.js
//
// Приложението има собствен щит: js/profile.js:175
//     const безопаснаСнимка = p => typeof p === 'string' &&
//       /^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(p);
// и коментарът до него казва „същият XSS-щит като аватарКод".
// Въпросът на този опит: щитът стои ли на ВСИЧКИ врати, или само на своята.

const fs = require('fs'), path = require('path'), vm = require('vm');
const КОРЕН = path.resolve(__dirname, '..');

// ── щитът, изваден от живия файл (не преписан на ръка) ────────────────────
const проф = fs.readFileSync(path.join(КОРЕН, 'js/profile.js'), 'utf8');
const мЩит = проф.match(/const\s+безопаснаСнимка\s*=\s*([^\n]+)/);
if (!мЩит) { console.log('❌ не намерих безопаснаСнимка в js/profile.js — уредът спира'); process.exit(2); }
const редЩит = проф.slice(0, проф.indexOf('const безопаснаСнимка')).split(/\r?\n/).length;
const безопаснаСнимка = vm.runInContext('(' + мЩит[1].replace(/;\s*$/, '') + ')', vm.createContext({ RegExp }));
console.log(`щитът е взет от js/profile.js:${редЩит}\n`);

// ── стойностите, които могат да седят в localStorage ───────────────────────
const СТОЙНОСТИ = [
  { име: 'истинска снимка (canvas)', v: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA' },
  { име: 'излизане от атрибута',     v: 'x" onerror="fetch(String.fromCharCode(47))' },
  { име: 'затваряне на тага',        v: 'x"><img src=y onerror=alert(1)><span a="' },
  { име: 'javascript: адрес',        v: 'javascript:alert(1)' },
  { име: 'външен адрес (следене!)',  v: 'https://sledene.example.com/p.gif?id=1' },
  { име: 'svg с onload',             v: 'data:image/svg+xml;base64,PHN2ZyBvbmxvYWQ9YWxlcnQoMSk+' },
];

// малък честен разбор: колко ЕЛЕМЕНТА и колко on*-атрибута излизат
function разбор(html) {
  const тагове = [...html.matchAll(/<\/?([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g)];
  const он = [...html.matchAll(/\son[a-z]+\s*=/gi)].length;
  const външни = [...html.matchAll(/src\s*=\s*["']?(https?:)/gi)].length;
  return { тагове: тагове.length, имена: тагове.map(t => t[1]), он, външни };
}

// ── ТОЧНИТЕ шаблони, преписани буквално от изходния код ───────────────────
const ВРАТИ = [
  { къде: 'js/profile.js:1148  (бутон Профил)',     щит: true,
    прави: v => безопаснаСнимка(v) ? '<span class="bn-ava"><img src="' + v + '" alt=""></span>Профил' : '<span>👩</span>Профил' },
  { къде: 'js/profile.js:750   (аватар в профила)', щит: true,
    прави: v => безопаснаСнимка(v) ? '<img class="prof-big" src="' + v + '" alt="">' : '<span class="prof-big">👩</span>' },
  { къде: 'js/rooms3.js:304    (снимка на деня)',   щит: false,
    прави: v => `<img src="${v}" alt="днес"><span>днес ✓ (смени?)</span>` },
  { къде: 'js/rooms3.js:310    (лентата с дни)',    щит: false,
    прави: v => `<img src="${v}" alt=""><span>01.09</span>` },
  { къде: 'js/women4.js:409    (аз, този месец)',   щит: false,
    прави: v => '<img src="' + v + '" alt="аз, този месец"><span>този месец ✓ · смени?</span>' },
  { къде: 'js/women4.js:415    (лентата с месеци)', щит: false,
    прави: v => '<img src="' + v + '" alt="аз през 2026-09"><small>2026-09</small>' },
];

const чисто = разбор(ВРАТИ[2].прави('data:image/jpeg;base64,AAA'));
console.log('очаквано при истинска снимка:', чисто.тагове, 'тага (' + чисто.имена.join(',') + '), 0 on*, 0 външни\n');

let счупени = 0;
for (const в of ВРАТИ) {
  const беди = [];
  for (const с of СТОЙНОСТИ) {
    if (с.име.startsWith('истинска')) continue;
    const html = в.прави(с.v);
    const р = разбор(html);
    const извънредни = р.тагове - чисто.тагове;
    if (р.он > 0) беди.push(с.име + ' → ' + р.он + '× on*-атрибут');
    else if (извънредни > 0) беди.push(с.име + ' → +' + извънредни + ' таг');
    else if (р.външни > 0) беди.push(с.име + ' → ТЕГЛИ ОТ ЧУЖД ХОСТ');
    else if (/^javascript:/.test(с.v) && html.includes('javascript:')) беди.push(с.име + ' → javascript: в src');
  }
  if (беди.length) счупени++;
  console.log(`${беди.length ? '❌' : '✅'} ${в.къде}  ${в.щит ? '[има щит]' : '[БЕЗ ЩИТ]'}`);
  беди.forEach(б => console.log(`      ${б}`));
}

console.log(`\nвърати със щит: ${ВРАТИ.filter(v => v.щит).length} · без щит: ${ВРАТИ.filter(v => !v.щит).length} · пропускат враждебна стойност: ${счупени}`);
console.log('\n⚠️ ПРИМАМКА (доказва, че разборът вижда): двете врати с щит ТРЯБВА да са ✅,');
console.log('   четирите без щит ТРЯБВА да са ❌. Ако всички излязат еднакви — уредът не мери нищо.');

// коя стойност минава през щита?
console.log('\nщитът поединично:');
СТОЙНОСТИ.forEach(с => console.log(`  ${безопаснаСнимка(с.v) ? 'ПУСКА ' : 'спира '} ${с.име}`));
