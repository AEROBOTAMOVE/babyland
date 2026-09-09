// Кои от 42-те ГРЕШНИ попадения ОЩЕ стигат до майката ДНЕС — след гейта за
// родилата жена и след разширения БЕЗ_ПОДАВАНЕ. Три изхода:
//   🚪 врата   — тя вижда „по частта на…"; грешката е СПРЯНА (но и верният отговор)
//   ❓ пита    — слабо попадение; тя вижда покана „✅ Да, точно това"
//   🔴 УДАРЯ   — грешната карта се показва като ОТГОВОР. Това е дефектът.
const fs = require('fs');
const { zaredi } = require('./pyasachnik.js');
const W = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20', name: 'Мими' } } });
if (W.BL_REDFLAG('бебето не диша') !== true) { console.log('СЛЯПА СОНДА'); process.exit(2); }

const _изв = fs.readFileSync('js/helper.js', 'utf8');
const _бл = /const БЕЗ_ПОДАВАНЕ = \[([\s\S]*?)\];/.exec(_изв);
const БЕЗ_ПОДАВАНЕ = (_бл[1].match(/'[a-z0-9-]+'/g) || []).map(x => x.slice(1, -1));
const СТАИ_С_ЛИЦЕ = new Set(['Моето бебе', 'Здраве и SOS', 'Захранване', 'Развитие и игри',
  'Дневник на мама', 'Жената в мен', 'Бременност', 'Инструменти', 'Лабораторията']);

const греш = require('./_greshni.json');
const бр = { УДАРЯ: 0, врата: 0, пита: 0, тревога: 0, друга: 0, тишина: 0 };
const удрят = [];
for (const g of греш) {
  const t = g.vapros, стая = g.staya_na_mamata;
  let вид;
  if ((W.BL_SHAKEN && W.BL_SHAKEN(t)) || W.BL_MOTHERFLAG(t) || W.BL_PREGFLAG(t, стая) || W.BL_REDFLAG(t)) вид = 'тревога';
  else {
    const k = W.BL_MATCH(t, стая);
    let слабо = W.BL_SLABO ? !!W.BL_SLABO() : false;
    if (!k) вид = 'тишина';
    else {
      if (k.room === 'Бременност' && стая !== 'Бременност') слабо = true;   // гейтът 4340, родила жена
      if (k.id !== g.kradec_id) вид = 'друга';                              // вече не същият крадец
      else if (слабо) вид = 'пита';
      else if (k.room !== стая && СТАИ_С_ЛИЦЕ.has(k.room) && БЕЗ_ПОДАВАНЕ.indexOf(k.id) < 0) вид = 'врата';
      else { вид = 'УДАРЯ'; удрят.push(g); }
    }
  }
  бр[вид]++;
}
console.log('');
console.log('🔴 42-те ГРЕШНИ попадения — какво става ДНЕС');
Object.entries(бр).forEach(([k, n]) => { if (n) console.log('   ' + k.padEnd(9) + ' ' + n); });
console.log('');
if (!удрят.length) { console.log('   ✅ нито едно грешно попадение не стига до майката като отговор.'); }
else {
  console.log('── ТЕЗИ СТИГАТ ДО НЕЯ КАТО ОТГОВОР ──');
  удрят.forEach(g => { console.log('   [' + g.staya_na_mamata + '] ' + g.vapros); console.log('        ← ' + g.kradec_id + ' „' + g.kradec_zaglavie + '"'); console.log('        ' + String(g.zashto).slice(0, 150)); });
}
fs.writeFileSync('dev/_udryat.json', JSON.stringify(удрят, null, 1));
console.log('\n   dev/_udryat.json · ' + удрят.length + ' записа');
