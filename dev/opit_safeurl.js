// dev/opit_safeurl.js — двата safeUrl един срещу друг.
// js/extras2.js:531 носи коментар за ПОПРАВЕН дефект:
//   „вторият довод на `new URL` е ОСНОВАТА — тоест „не-е-адрес" се превръщаше
//    в http://…/не-е-адрес, протоколът излизаше http: и проверката казваше
//    „добре". Адрес на магазин винаги е ПЪЛЕН; искаме го явно."
// Въпросът: близнакът в js/shop.js поправен ли е, или е останал стар.
// Пускане: node dev/opit_safeurl.js

const fs = require('fs'), path = require('path'), vm = require('vm');
const КОРЕН = path.resolve(__dirname, '..');

function извади(файл) {
  const т = fs.readFileSync(path.join(КОРЕН, файл), 'utf8');
  const н = т.indexOf('function safeUrl');
  if (н < 0) return null;
  let д = 0, i = т.indexOf('{', н), к = i;
  for (; к < т.length; к++) { if (т[к] === '{') д++; else if (т[к] === '}') { д--; if (!д) { к++; break; } } }
  return { код: т.slice(н, к), ред: т.slice(0, н).split(/\r?\n/).length };
}

const ВХОД = [
  'https://magazin.bg/bebeshko',
  'http://magazin.bg',
  'магазинче',                      // мама написа дума, не адрес
  'www.magazin.bg',                 // без протокол — честа грешка
  'javascript:alert(1)',
  'data:text/html,<script>x</script>',
  '//zloumishlen.example.com/p',    // без схема, чужд хост
  '',
];

const БАЗА = 'https://babylandeu.com/app/';
console.log('база (location.href на приложението):', БАЗА, '\n');

for (const ф of ['js/extras2.js', 'js/shop.js']) {
  const и = извади(ф);
  if (!и) { console.log(ф, '— няма safeUrl'); continue; }
  const ctx = vm.createContext({ String, URL, location: { href: БАЗА }, RegExp });
  vm.runInContext(и.код, ctx);
  const f = vm.runInContext('safeUrl', ctx);
  const базаЛи = /new URL\([^)]*,\s*location/.test(и.код);
  console.log(`── ${ф}:${и.ред}   ${базаЛи ? '⚠ ползва location.href като ОСНОВА' : '✅ иска ПЪЛЕН адрес'}`);
  for (const в of ВХОД) {
    let р; try { р = f(в); } catch (e) { р = 'ГРЪМНА: ' + e.message; }
    const пуска = р !== '';
    console.log(`     ${пуска ? '➡ ПУСКА ' : '  спира '} ${JSON.stringify(в).padEnd(38)} → ${JSON.stringify(р)}`);
  }
  console.log('');
}
console.log('ПРИМАМКА: „магазинче" НЕ е адрес. Който го пусне, е старият.');
