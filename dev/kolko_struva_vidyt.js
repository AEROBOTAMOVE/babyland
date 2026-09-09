// КОЛКО СТРУВА оста ВИД. Всяко сравнение вече прави два regex-replace
// повече. При 29 448 ключа това може да е разликата между 40 мс и 4 сек —
// а бавен отговор е дефект като всеки друг.
// Мери ЖИВИЯ файл срещу копието отпреди поправката.
const { zaredi } = require('./pyasachnik.js');
const fs = require('fs');

const СТАР = fs.readFileSync('js/helper.js.PREDI_VID_I_NO', 'utf8');
const A = zaredi(() => СТАР);          // ПРЕДИ (кръпката просто връща стария файл)
const B = zaredi(null);                // СЕГА (живият)
if (A.BL_REDFLAG('бебето не диша') !== true || B.BL_REDFLAG('бебето не диша') !== true) { console.log('🔴 сляпо'); process.exit(2); }

const въпроси = [
  'бебето плаче по цял ден и не спи',
  'кога да започна с твърда храна',
  'на 4 месеца е и още не се обръща',
  'зърната ми са в рани и плача докато кърмя',
  'какъв прах за пране за бебешки дрехи',
  'коремът ми е мек и виси',
  'детето има температура 38 и половина',
  'може ли бебе да стои под климатик',
  'как да го отбия от цицата на 2 години',
  'обясни ми квантовата физика',
];

function мери(W, име) {
  // загрявка (кешовете се пълнят)
  for (const q of въпроси) { W.BL_MATCH(q, null); W.BL_REDFLAG(q); }
  const t0 = process.hrtime.bigint();
  const N = 12;
  for (let i = 0; i < N; i++) for (const q of въпроси) { W.BL_MATCH(q, null); W.BL_REDFLAG(q); }
  const t1 = process.hrtime.bigint();
  const общо = Number(t1 - t0) / 1e6;
  const наВъпрос = общо / (N * въпроси.length);
  console.log('   ' + име.padEnd(8) + ' ' + общо.toFixed(0).padStart(6) + ' мс общо · ' + наВъпрос.toFixed(1).padStart(6) + ' мс на въпрос');
  return наВъпрос;
}
console.log('');
console.log('⏱️  ЦЕНАТА НА ОСТА ВИД (' + въпроси.length + ' въпроса × 12 обиколки)');
const a = мери(A, 'ПРЕДИ');
const b = мери(B, 'СЕГА');
console.log('');
console.log('   разлика: ×' + (b / a).toFixed(2) + '   (' + (b - a).toFixed(1) + ' мс на въпрос)');
console.log('');
if (b > 250) console.log('   🔴 над 250 мс на въпрос — майката ЩЕ усети забавяне');
else if (b / a > 2) console.log('   ⚠️ над двойно по-бавно — виж дали си струва');
else console.log('   ✅ цената е поносима');
