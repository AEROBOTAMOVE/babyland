const { zaredi } = require('C:/Users/User/AppData/Local/Temp/claude/C--Users-User-Downloads-----/a78d0ad3-272e-4eb0-929e-dba161c5ab2a/scratchpad/pyasachnik.js');
const fs = require('fs');
const h = fs.readFileSync('C:/Users/User/Downloads/ЛОЦО/АПЛИКАЦИЯ ЗА БЕЙБИ ЛЕНД/babyland/js/helper.js', 'utf8');
// самата регулярка, извадена от кода — проверяваме я срещу истински заглавия
const m = h.match(/const БРЕМЕННО = (\/[^\n]+\/i);/);
if (!m) { console.log('🔴 не намерих БРЕМЕННО'); process.exit(1); }
const re = eval(m[1]);
const БРЕМЕННИ = ['Ехография 20 седмица','Термин','Женска консултация','Биохимичен скрининг',
  'Фетална морфология','Акушерка — преглед','Токограма','НСТ','Ехография 12 с.','Раждане — курс'];
const ДРУГИ = ['Педиатър — профилактика','Ваксина 4 месеца','Зъболекар','Личен лекар',
  'Ясла — документи','Стоматолог за мен','Очен преглед','Рожден ден на кака'];
let a = 0, b = 0;
console.log('  БРЕМЕННИ (трябва да гаснат при пауза):');
БРЕМЕННИ.forEach(t => { const x = re.test(t); if (x) a++; console.log('    ' + (x ? '✅' : '🔴') + ' ' + t); });
console.log('  ДРУГИ (трябва да ОСТАНАТ):');
ДРУГИ.forEach(t => { const x = re.test(t); if (!x) b++; console.log('    ' + (!x ? '✅' : '🔴 гасне напразно') + ' ' + t); });
console.log('\n  гаснат ' + a + '/' + БРЕМЕННИ.length + '  ·  остават ' + b + '/' + ДРУГИ.length);
