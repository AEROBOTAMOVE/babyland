// ═══════════════════════════════════════════════════════════
// ⚙️ ДВИГАТЕЛЯТ — кой ФЛАГ гърми и защо
//
// КАКВО: същият корпус от 350 майчини изречения като dev/korpus350.js, но
//   отговаря на въпроса, който korpus350 НЕ отговаря: за всяка фалшива тревога
//   казва ТОЧНО КОЙ ФЛАГ я е вдигнал, и показва ПЪЛНИТЕ списъци.
//
// ЗАЩО: korpus350 реже списъка на 60 реда (`фа.slice(0, 60)`), тоест при 82
//   фалшиви тревоги 22 от тях са невидими — и никъде не пише, че ги реже.
//   А без името на флага всяка поправка е гадаене: 19.08 първата ми догадка за
//   „падна ми духът" беше „падна", а виновникът се оказа „ОТ" — двубуквената
//   служебна дума във флага „падна ОТ", която се мачваше с „ОТкакто".
//   Уред, който показва виновника, спестява точно този кръг гадаене.
//
// ПУСКАНЕ:
//   node dev/dvigatel.js               числата + пълните списъци с виновника
//   node dev/dvigatel.js "изречение"   какво вдига ЕДНО изречение
//
// КАК НАМИРА ВИНОВНИКА: изключва всички флагове освен един и пита пак. Ако
//   никой поединично не гърми, значи е сработило ПРАВИЛО (tempEmergency,
//   двойката „отпуснат + симптом", подлогът при насилието) — казва се така.
//
// ПЪТ НАЗАД: файлът само ЧЕТЕ. Нищо не пипа. Изтрий го и нищо не се променя.
// ═══════════════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');
process.chdir(path.resolve(__dirname, '..'));

const S = 'C:/Users/User/AppData/Local/Temp/claude/C--Users-User-Downloads-----/' +
          'a78d0ad3-272e-4eb0-929e-dba161c5ab2a/scratchpad';

let zaredi;
try { zaredi = require(S + '/pyasachnik.js').zaredi; }
catch (e) { console.log('🔴 няма пясъчник: ' + e.message); process.exit(1); }
const W = zaredi(null);
const KB = W.KB;

const СПИСЪЦИ = ['dvFlags', 'lossFlags', 'motherFlags', 'mamaBodyFlags', 'heavyFlags'];

function виновник(т) {
  const из = [];
  if (W.BL_REDFLAG(т)) {
    const все = KB.redFlags.slice(), в = [];
    for (const f of все) { KB.redFlags = [f]; try { if (W.BL_REDFLAG(т)) в.push(f); } catch (e) {} }
    KB.redFlags = все;
    из.push('ЧЕРВЕН[' + (в.join(' | ') || 'ПРАВИЛО, не флаг от списъка') + ']');
  }
  const м = W.BL_MOTHERFLAG(т);
  if (м) {
    const снимка = {}; СПИСЪЦИ.forEach(n => { снимка[n] = KB[n] ? KB[n].slice() : null; });
    const в = [];
    for (const n of СПИСЪЦИ) {
      if (!KB[n]) continue;
      for (const f of снимка[n]) {
        СПИСЪЦИ.forEach(x => { if (KB[x]) KB[x] = []; });
        KB[n] = [f];
        try { if (W.BL_MOTHERFLAG(т) === м) в.push(n + '«' + f + '»'); } catch (e) {}
      }
    }
    СПИСЪЦИ.forEach(n => { if (снимка[n]) KB[n] = снимка[n]; });
    // >20 съвпадения значи, че гърми ПРАВИЛОТО за подлога, не отделен флаг
    из.push('МАЙКА:' + м + '[' + (в.length > 20 ? 'ПРАВИЛОТО за подлога (партньор + насилие)'
            : (в.join(' | ') || 'ПРАВИЛО, не флаг от списъка')) + ']');
  }
  if (W.BL_PREGFLAG && W.BL_PREGFLAG(т)) {
    const все = KB.pregFlags.slice(), в = [];
    for (const f of все) { KB.pregFlags = [f]; try { if (W.BL_PREGFLAG(т)) в.push(f); } catch (e) {} }
    KB.pregFlags = все;
    из.push('БРЕМЕННОСТ[' + в.join(' | ') + ']');
  }
  return из.join('   ');
}

const питане = process.argv.slice(2).filter(x => !x.startsWith('--'));
if (питане.length) {
  питане.forEach(т => console.log('\n' + т + '\n   → ' + (виновник(т) || 'НИЩО не гърми')));
  let е = null; try { е = W.BL_MATCH(питане[0], 'Здраве и SOS'); } catch (x) {}
  console.log('   карта: ' + (е ? (е.id + ' | ' + е.title + (е._слабо ? '  (СЛАБО)' : '')) : 'НЯМА'));
  process.exit(0);
}

let корпус;
try { корпус = JSON.parse(fs.readFileSync(S + '/rez350.json', 'utf8')); }
catch (e) { console.log('🔴 няма корпус: ' + e.message); process.exit(1); }
if (!Array.isArray(корпус) || корпус.length < 100) {
  console.log('🔴 корпусът е ' + (корпус && корпус.length) + ' записа — очаквам 350'); process.exit(1);
}

let спешни = 0, невинни = 0, карти = 0;
const пр = [], фа = [], бо = [];
for (const x of корпус) {
  const т = x.t, о = String(x.e || '').toUpperCase(), стая = x.r || 'Здраве и SOS';
  if (!т || !о) continue;
  const флаг = (() => {
    try { if (W.BL_REDFLAG(т)) return true; } catch (e) {}
    try { if (W.BL_MOTHERFLAG && W.BL_MOTHERFLAG(т)) return true; } catch (e) {}
    try { if (W.BL_PREGFLAG && W.BL_PREGFLAG(т)) return true; } catch (e) {}
    return false;
  })();
  if (о === 'SPESHNO') { спешни++; if (!флаг) пр.push([т, стая]); }
  else { невинни++; if (флаг) фа.push([т, стая]); }
  if (о === 'KARTA') {
    карти++;
    let r = null; try { r = W.BL_MATCH(т, стая); } catch (e) {}
    if (!флаг && !r) бо.push([т, стая]);
  }
}

console.log('⚙️  ДВИГАТЕЛЯТ (' + корпус.length + ' изречения · спешни ' + спешни +
            ' · невинни ' + невинни + ' · очакващи карта ' + карти + ')\n');
console.log('  🔴 ПРОПУСНАТИ СПЕШНИ : ' + пр.length + ' от ' + спешни);
console.log('  🟠 ФАЛШИВИ ТРЕВОГИ   : ' + фа.length + ' от ' + невинни);
console.log('  🟡 БЕЗ ОТГОВОР       : ' + бо.length + ' от ' + карти);

console.log('\n── ПРОПУСНАТИ СПЕШНИ (нищо не гърми) ── ' + пр.length + ' броя');
пр.forEach(([т, с]) => console.log('   🔴 [' + с + '] ' + т));
console.log('\n── ФАЛШИВИ ТРЕВОГИ (кой флаг ги вдига) ── ' + фа.length + ' броя');
фа.forEach(([т, с]) => console.log('   🟠 [' + с + '] ' + т + '\n        → ' + виновник(т)));
console.log('\n── БЕЗ ОТГОВОР (няма флаг и няма карта) ── ' + бо.length + ' броя');
бо.forEach(([т, с]) => console.log('   🟡 [' + с + '] ' + т));
