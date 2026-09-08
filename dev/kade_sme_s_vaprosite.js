// КЪДЕ СМЕ: през ЖИВИЯ ред на вратите, върху всички независими въпроси.
// Три изхода, не два:
//   ✅ вярна стая  — картата е от стаята, в която майката пита
//   🔀 ЧУЖДА стая  — получава карта, но от друга стая (препращане, не отговор)
//   🔇 ТИШИНА      — нищо
// Тревогите се броят отделно — те са ВЕРЕН изход, независимо от стаята.
const { zaredi } = require('./pyasachnik.js');
const W = zaredi(null);
if (W.BL_REDFLAG('бебето не диша') !== true) { console.log('СЛЯПА СОНДА'); process.exit(2); }
if (W.BL_REDFLAG('днес беше слънчево') === true) { console.log('СЛЯПА СОНДА 2'); process.exit(2); }

// 🔴 ПЪРВАТА МИ МЯРКА БРОЕШЕ ДРУГО. „чужда стая" по BL_MATCH НЕ Е това,
//   което майката вижда: respond() показва ВРАТА („Това е повече по частта
//   на…") само ако попадението е СИГУРНО и записът не е в БЕЗ_ПОДАВАНЕ.
//   Слабото попадение минава на честния праг и ПИТА („✅ Да, точно това") —
//   това не е отказ. Затова тук се повтаря самото условие от helper.js:4345.
const БЕЗ_ПОДАВАНЕ = ['zh-opasni', 'zh-voda', 'lb-med-sol', 'lb-davene', 'zd-bezopasen-son',
  'rz-autizam', 'lb-trevojnost', 'mb-cry', 'mb-colic', 'mb-plach-vidove', 'lb-opasen-plach',
  'mb-otpusnato', 'zd-pypna-ranka'];
const СТАИ_С_ЛИЦЕ = new Set(['Моето бебе', 'Здраве и SOS', 'Захранване', 'Развитие и игри',
  'Дневник на мама', 'Жената в мен', 'Бременност', 'Инструменти', 'Лабораторията']);

function присъда(t, стая) {
  if (typeof W.BL_SHAKEN === 'function' && W.BL_SHAKEN(t)) return { вид: 'тревога', как: 'shaken' };
  const m = W.BL_MOTHERFLAG(t); if (m) return { вид: 'тревога', как: m };
  if (W.BL_PREGFLAG(t, стая || null)) return { вид: 'тревога', как: 'preg' };
  if (W.BL_REDFLAG(t)) return { вид: 'тревога', как: 'red' };
  const k = W.BL_MATCH(t, стая || null);
  const слабо = W.BL_SLABO ? !!W.BL_SLABO() : false;      // питай ВЕДНАГА след BL_MATCH
  if (!k) return { вид: 'тишина' };
  if (k.room === стая) return { вид: 'вярна', как: k.id, стая: k.room };
  if (!слабо && СТАИ_С_ЛИЦЕ.has(k.room) && БЕЗ_ПОДАВАНЕ.indexOf(k.id) < 0)
    return { вид: 'врата', как: k.id, стая: k.room };
  return { вид: слабо ? 'пита' : 'вярна', как: k.id, стая: k.room };
}

const извори = [['vaprosi_nezavisimi', require('./vaprosi_nezavisimi.json')],
                ['vaprosi_nezavisimi2', require('./vaprosi_nezavisimi2.json')]];
const бр = { тревога: 0, вярна: 0, врата: 0, пита: 0, тишина: 0 };
const тишини = [], врати = [];
const поСтаи = {};
for (const [име, списък] of извори) {
  for (const q of списък) {
    const t = q.v || q.t; if (!t) continue;
    const стая = q.r || null;
    const p = присъда(t, стая);
    бр[p.вид]++;
    поСтаи[стая] = поСтаи[стая] || { вярна: 0, врата: 0, пита: 0, тишина: 0, тревога: 0 };
    поСтаи[стая][p.вид]++;
    if (p.вид === 'тишина') тишини.push({ t, стая, извор: име });
    if (p.вид === 'врата') врати.push({ t, стая, към: p.стая, id: p.как, извор: име });
  }
}
const общо = бр.тревога + бр.вярна + бр.врата + бр.пита + бр.тишина;
const пр = n => (100 * n / общо).toFixed(1) + '%';
console.log('');
console.log('📊 ' + общо + ' независими въпроса през ЖИВИЯ ред на вратите');
console.log('   🚨 тревога     ' + String(бр.тревога).padStart(4) + '  ' + пр(бр.тревога));
console.log('   ✅ отговор     ' + String(бр.вярна).padStart(4) + '  ' + пр(бр.вярна));
console.log('   ❓ ПИТА        ' + String(бр.пита).padStart(4) + '  ' + пр(бр.пита) + '   (честен изход — „✅ Да, точно това")');
console.log('   🚪 ВРАТА       ' + String(бр.врата).padStart(4) + '  ' + пр(бр.врата) + '   („Това е повече по частта на…")');
console.log('   🔇 ТИШИНА      ' + String(бр.тишина).padStart(4) + '  ' + пр(бр.тишина));
console.log('');
console.log('── по стаи (врата + тишина = недостиг) ──');
Object.entries(поСтаи).sort((a, b) => (b[1].врата + b[1].тишина) - (a[1].врата + a[1].тишина))
  .forEach(([с, x]) => console.log('   ' + String(с).padEnd(22) + ' ✅' + String(x.вярна).padStart(3) + '  ❓' + String(x.пита).padStart(3) + '  🚪' + String(x.врата).padStart(3) + '  🔇' + String(x.тишина).padStart(3) + '  🚨' + String(x.тревога).padStart(3)));

const fs = require('fs');
fs.writeFileSync('dev/_nedostig.json', JSON.stringify({ тишини, врати }, null, 1));
console.log('');
console.log('   пълният списък: dev/_nedostig.json  (' + тишини.length + ' тишини · ' + врати.length + ' врати)');
console.log('');
console.log('── ТИШИНИТЕ ──');
тишини.slice(0, 30).forEach(x => console.log('   [' + x.стая + '] ' + x.t));
console.log('');
console.log('── ВРАТИТЕ (майката чете „Това е повече по частта на…") ──');
врати.slice(0, 40).forEach(x => console.log('   [' + x.стая + ' → ' + x.към + '] ' + x.t));
