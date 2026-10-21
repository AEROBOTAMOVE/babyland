// zn5 · търси регулярен израз в картите на js/kb.js (title/core/tip/follow/keys) — само чете
// node dev/znanie/vlivane/zn5_tarsi.js "израз1" "израз2" ...
const fs = require('fs');
const src = fs.readFileSync('js/kb.js', 'utf8');
const L = src.split(/\r?\n/);
const карти = [];
let тек = null;
for (const ред of L) {
  const м = ред.match(/id: '([^']+)'.*room: '([^']+)'/);
  if (м) { тек = { id: м[1], room: м[2], txt: '' }; карти.push(тек); continue; }
  if (тек && /^\s*(title|core|tip|follow|keys):/.test(ред)) {
    const t = ред.trim();
    if (t.startsWith('title:')) тек.title = t.slice(7, 90);
    тек.txt += '\n' + t;
  }
}
for (const израз of process.argv.slice(2)) {
  const re = new RegExp(израз, 'i');
  const нам = карти.filter(к => re.test(к.txt));
  console.log('== „' + израз + '“ → ' + нам.length);
  for (const к of нам.slice(0, 25)) console.log('   ' + к.id.padEnd(34) + к.room.padEnd(16) + (к.title || ''));
}
