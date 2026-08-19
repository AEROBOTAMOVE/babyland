// Хваща ЗАГУБЕНО СЪДЪРЖАНИЕ: статия, която след пренаписване е изгубила
// ФАКТИ, а не само думи. Мери не дължината, а КОНКРЕТИКАТА:
// числа, единици, институции, спешни думи, изброявания.
const fs = require('fs');
const { execSync } = require('child_process');
process.chdir('C:/Users/User/Downloads/ЛОЦО/АПЛИКАЦИЯ ЗА БЕЙБИ ЛЕНД/babyland');
const g = c => { try { return execSync(c, { encoding: 'utf8', maxBuffer: 1e9 }); } catch (e) { return ''; } };

const ЧИСЛА = /\d+(?:[.,]\d+)?\s*(?:°|градус|месец[а-я]*|седмиц[а-я]*|дни|дена|ден|годин[а-я]*|час[а-я]*|минут[а-я]*|мл|кг|г(?![а-я])|пъти|%)/gi;
const ИНСТИТ = /(нзок|нои|нап|рзи|личен лекар|личния лекар|спешен кабинет|спешно отделение|женска консултация|направление|инспекция по труда|дсп|асп|112|116\s?\d{3})/gi;
const СПЕШНО = /(веднага|незабавно|не чакай|същия ден|спешно|112|червен флаг|тревожн)/gi;
const ТОЧКИ = /^\s*[-•*]\s+/gm;

function мярка(t) {
  const ч = String(t).replace(/<[^>]*>/g, ' ');
  return {
    числа: (ч.match(ЧИСЛА) || []).length,
    институции: (ч.match(ИНСТИТ) || []).length,
    спешно: (ч.match(СПЕШНО) || []).length,
    точки: (ч.match(ТОЧКИ) || []).length,
    знаци: ч.length
  };
}

const файлове = fs.readdirSync('lib').filter(f => f.endsWith('.json') && !/BAK|ARCHIVE|index/.test(f));
const загубили = [];
let прегледани = 0;

for (const f of файлове) {
  let стар, нов;
  try { стар = JSON.parse(g('git show HEAD:lib/' + f)); } catch (e) { continue; }
  try { нов = JSON.parse(fs.readFileSync('lib/' + f, 'utf8')); } catch (e) { continue; }
  for (const k in нов) {
    if (!(k in стар) || стар[k] === нов[k]) continue;
    прегледани++;
    const a = мярка(стар[k]), b = мярка(нов[k]);
    const загуба = (a.числа - b.числа) + (a.институции - b.институции) * 2 +
                   (a.спешно - b.спешно) + Math.max(0, a.точки - b.точки) * 0.5;
    if (загуба >= 3) загубили.push({ ид: k, файл: 'lib/' + f, a, b, загуба });
  }
}

загубили.sort((x, y) => y.загуба - x.загуба);
console.log('🔎 ЗАГУБЕНА КОНКРЕТИКА\n');
console.log('  прегледани пренаписани статии: ' + прегледани);
console.log('  с ЗАГУБА на конкретика: ' + загубили.length + '\n');
console.log('  ид                     числа   инст.  спешно  точки   знаци');
загубили.slice(0, 20).forEach(x => {
  const р = (n, m) => String(n + '→' + m).padEnd(7);
  console.log('  ' + x.ид.padEnd(22) + р(x.a.числа, x.b.числа) + р(x.a.институции, x.b.институции) +
    р(x.a.спешно, x.b.спешно) + р(x.a.точки, x.b.точки) + (x.a.знаци + '→' + x.b.знаци));
});
if (!загубили.length) console.log('  ✅ нито една пренаписана статия не е изгубила конкретика');
