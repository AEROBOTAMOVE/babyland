// ═══════════════════════════════════════════════════════════
// 🎬 ЦЕНАТА НА АНИМАЦИИТЕ — кои карат браузъра да преизчислява
//
// Собственикът вижда: „началната страница зацепва, нацепва на места".
// Причината почти винаги е една: анимация по свойство, което иска
// LAYOUT (width/height/top/left) или PAINT (box-shadow/filter).
// Евтини са само transform, translate, rotate, scale и opacity —
// те се въртят на видеокартата, без да пипат подредбата.
//
// 🪤 ПЪРВИЯТ МИ ИЗРАЗ ЛЪЖЕШЕ И ЩЕШЕ ДА МЕ ПРАТИ ДА „ПОПРАВЯМ" ЗДРАВО.
// Ползвах /@keyframes\s+(\w+)\s*\{([\s\S]*?)\n\}/ — но в този проект
// повечето keyframes са на ЕДИН РЕД:
//     @keyframes ldOrb { 0%,100% { opacity: .6 } 50% { opacity: 1 } }
// Затова „\n}" се намираше чак няколко реда по-долу и в „тялото" влизаха
// СЪСЕДНИТЕ правила — а те, естествено, съдържат left/top/width.
// Резултат: ldOrb, ldBob, ldBadge, ldAttn излязоха „скъпи", а те са
// съответно чист opacity, translate+rotate, scale, scale+opacity.
// Тоест щях да пренапиша четири здрави анимации.
//
// Тук скобите се броят. Тялото свършва там, където се затваря.
//
// ПУСКАНЕ: node dev/cena_animacii.js
// ПЪТ НАЗАД: файлът само ЧЕТЕ.
// ═══════════════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');
process.chdir(path.resolve(__dirname, '..'));

const LAYOUT = /(^|[\s;{])(width|height|top|left|right|bottom|margin|padding|border-width|inset)\s*:/;
const PAINT  = /(^|[\s;{])(box-shadow|filter|backdrop-filter|background|border-radius|stroke-width|stroke-dashoffset)\s*:/;
const ЕВТИНИ = /(^|[\s;{])(transform|translate|rotate|scale|opacity)\s*:/;

function тела(текст) {
  const из = [];
  const re = /@keyframes\s+([a-zA-Z0-9_-]+)\s*\{/g;
  let m;
  while ((m = re.exec(текст))) {
    let i = m.index + m[0].length - 1, дълбочина = 0, край = i;
    for (; край < текст.length; край++) {
      if (текст[край] === '{') дълбочина++;
      else if (текст[край] === '}') { дълбочина--; if (!дълбочина) break; }
    }
    из.push({ име: m[1], тяло: текст.slice(i + 1, край) });
  }
  return из;
}

const файлове = fs.readdirSync('css').filter(f => f.endsWith('.css')).map(f => 'css/' + f);
const скъпи = [], евтини = [];
let общо = 0;

for (const f of файлове) {
  const t = fs.readFileSync(f, 'utf8');
  for (const к of тела(t)) {
    общо++;
    const л = LAYOUT.test(к.тяло), п = PAINT.test(к.тяло), е = ЕВТИНИ.test(к.тяло);
    // безкрайна ли е — търсим употребата ѝ в СЪЩИЯ файл
    const безкр = new RegExp('animation[^;{}]*\\b' + к.име + '\\b[^;{}]*infinite').test(t) ||
                  new RegExp('\\b' + к.име + '\\b[^;{}]*infinite').test(t);
    const цена = (л ? 10 : 0) + (п ? 4 : 0) + (безкр ? 5 : 0);
    const ред = { файл: f, име: к.име, layout: л, paint: п, евтино: е, безкрайна: безкр, цена: цена,
                  какво: (к.тяло.match(/[a-z-]+\s*:/g) || []).map(s => s.replace(':', '').trim())
                          .filter((v, i, a) => a.indexOf(v) === i).slice(0, 6).join(', ') };
    if (цена >= 10) скъпи.push(ред); else евтини.push(ред);
  }
}
скъпи.sort((a, b) => b.цена - a.цена);

console.log('🎬 ЦЕНАТА НА АНИМАЦИИТЕ\n');
console.log('  прегледани @keyframes: ' + общо + ' в ' + файлове.length + ' файла');
console.log('  СКЪПИ (пипат подредбата): ' + скъпи.length);
console.log('  евтини (transform/opacity): ' + евтини.length + '\n');
if (!скъпи.length) { console.log('  ✅ нито една анимация не пипа подредбата'); process.exit(0); }
console.log('  цена  файл            име               свойства');
скъпи.forEach(x => console.log('   ' + String(x.цена).padStart(3) + '  ' +
  x.файл.replace('css/', '').padEnd(15) + x.име.padEnd(18) +
  (x.безкрайна ? '∞ ' : '  ') + x.какво));
console.log('\n  цена = 10 (LAYOUT) + 4 (PAINT) + 5 (безкрайна)');
console.log('  ЛЕКУВАЙ ОТГОРЕ НАДОЛУ — безкрайната layout-анимация е най-скъпа.');
