// Прави счупено копие на js/garch.js, за да се провери, че пазачът гори.
// Три счупвания наведнъж, всяко от които би струвало скъпо:
//   1. прагът 5 → 10 минути (майка би чакала двойно преди 112)
//   2. махнат tel:112
//   3. вмъкнато „не бързай" (текст, който забавя обаждането)
const fs = require('fs');
let s = fs.readFileSync('js/garch.js', 'utf8');
const преди = s;
s = s.replace('const ПРАГ = 5 * 60;', 'const ПРАГ = 10 * 60;');
s = s.replace('href="tel:112"', 'href="#"');
s = s.replace('Настрани на пода.', 'Не бързай. Настрани на пода.');
if (s === преди) { console.log('🔴 нищо не се счупи — проверката е сляпа'); process.exit(2); }
fs.writeFileSync('dev/chupen_garch_kopie.js', s);
console.log('✅ счупено копие: dev/chupen_garch_kopie.js');
