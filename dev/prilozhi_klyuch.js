// ═══════════════════════════════════════════════════════════
// ✍️ ПРИЛОЖИ — записва на диска плана, който dev/opit_klyuch.js вече е
//    измерил като чиста печалба. Не решава нищо сам; само пише.
//
// Не пипа нищо, ако:
//   · планът иска ключ, който не е там (не гадае)
//   · файлът не се смали (значи не е махнало нищо)
//
// ПУСКАНЕ: node dev/prilozhi_klyuch.js dev/nahodki/plan_klyuchove.json
// ПЪТ НАЗАД: js/kb.PREDI_OPIT.js се прави тук, преди всичко.
// ═══════════════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');
process.chdir(path.resolve(__dirname, '..'));

const план = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
fs.copyFileSync('js/kb.js', 'js/kb.PREDI_OPIT.js');

let s = fs.readFileSync('js/kb.js', 'utf8');
const преди = s.length;
const кав = String.fromCharCode(34);
const цит = x => (x.indexOf("'") >= 0 ? кав + x + кав : "'" + x + "'");

// назад, за да не мърдат отместванията
const задачи = [];
for (const стъпка of план) {
  let i = s.indexOf("id: '" + стъпка.запис + "'");
  if (i < 0) i = s.indexOf('id: ' + кав + стъпка.запис + кав);
  if (i < 0) { console.log('⚠ няма запис ' + стъпка.запис); continue; }
  const k = s.indexOf('keys:', i);
  if (k < 0 || k - i > 3000) { console.log('⚠ няма keys до ' + стъпка.запис); continue; }
  задачи.push({ л: s.indexOf('[', k) + 1, д: s.indexOf(']', s.indexOf('[', k)), с: стъпка });
}
задачи.sort((a, b) => b.л - a.л);

let махнати = 0;
for (const t of задачи) {
  const кл = [];
  for (const m of s.slice(t.л, t.д).matchAll(/'([^']*)'|"([^"]*)"/g))
    кл.push(m[1] !== undefined ? m[1] : m[2]);
  const остават = кл.filter(x => t.с.махни.indexOf(x) < 0);
  if (остават.length === кл.length) { console.log('⚠ ' + t.с.запис + ': ключът не е там — пропускам'); continue; }
  махнати += кл.length - остават.length;
  console.log('  ' + t.с.запис.padEnd(24) + кл.length + ' → ' + остават.length +
              '   махнато: ' + t.с.махни.join(', '));
  s = s.slice(0, t.л) + остават.map(цит).join(', ') + s.slice(t.д);
}

if (s.length >= преди) { console.log('🔴 файлът не се смали — НЕ записвам'); process.exit(1); }
fs.writeFileSync('js/kb.js', s, 'utf8');
console.log('\nмахнати ключа: ' + махнати + ' · знаци ' + преди + ' → ' + s.length);
console.log('път назад: js/kb.PREDI_OPIT.js');
