// ═══════════════════════════════════════════════════════════════════════
// 🔤 ЛАТИНИЦА С „a" ЗА „ъ" — ключове срещу флагове  (27.10)
//
// ЗАЩО: присъдата („Код, не думи“ в ЗАДАЧИ.md): латиница, в която „ъ“ е „a“
//   („zabi“ за „зъби“), пада на ~80% при КЛЮЧОВЕТЕ, а при ФЛАГОВЕТЕ е ~99%.
//   Флаговете сгъват [аъ]→у (helper.js · phraseHit/isRedFlag, 08.09);
//   ключовете (findEntry) сгъват само ъ↔у. Този уред мери разликата.
//
// КАКВО МЕРИ (само записите, чийто КИРИЛСКИ вид работи — иначе не е латиницата):
//   КЛЮЧОВЕ с „ъ“  → преписани на латиница (ъ→a и, за сравнение, ъ→u) → своята карта?
//   ФЛАГОВЕ с „ъ“  → преписани с ъ→a → вдигат ли тревога (red/preg/майчини/разтърсване)?
//   ЦЕНА: ключове БЕЗ „ъ“, преписани на латиница → губят ли своята карта?
//         (там новото сгъване не бива да помага, само може да краде)
//
// ПУСКАНЕ: node dev/mera_latinica_a.js [--proba K] [--kandidat] [--json изход.json]
//   --kandidat — мери helper.js С предложеното сгъване (в паметта, файлът не се пипа);
//                ако то вече е в helper.js, кандидатът е същият мозък.
// САМОПРОВЕРКА: кирилското „бебето не диша“ вдига тревога и латинското
//   „bebeto ne disha“ също; иначе уредът е сляп (изход 2).
// ПЪТ НАЗАД: само ЧЕТЕ (с --json пише само посочения файл). Изтрий файла.
// ═══════════════════════════════════════════════════════════════════════
const fs = require('fs');
const { zaredi } = require('./pyasachnik.js');
const арг = process.argv.slice(2);
const вз = (име, д) => { const i = арг.indexOf(име); return i > -1 ? арг[i + 1] : д; };
const ПРОБА = Math.max(1, +вз('--proba', 1));
const ИЗХОД = вз('--json', null);
const КАНДИДАТ = арг.includes('--kandidat');

// ── кандидатът: същият текст, който влиза в helper.js (котвите се проверяват) ──
const К1 = 'const wordsУЪ = qИмаЪ ? words.map(w => w.split("ъ").join("у")) : words;';
const К2 = 'const nkУЪ = nkИмаЪ ? nk.split("ъ").join("у") : nk;';
const К3 = '(уъВажи && вклЧисло(qУЪ, nkУЪ)) ||';
const К4 = '(nk.length >= 4 && уъВажи && wordsУЪ.some(w => w.startsWith(nkУЪ))));';
function кандидат(src) {
  if (src.indexOf('аъВажи') > -1) return src;              // вече е вътре
  for (const к of [К1, К2, К3, К4]) if (src.split(к).length !== 2) throw new Error('КОТВАТА „' + к.slice(0, 40) + '…“ не е единствена — кандидатът е негоден');
  return src
    .replace(К1, К1 + '\n    const qЛат = String(text || "").split(/\\s+/).some(w => /[a-z]/i.test(w) && !/[а-яёѝ]/i.test(w));' +
                    '\n    const qАУ = qЛат ? q.replace(/[аъ]/g, "у") : q;' +
                    '\n    const wordsАУ = qЛат ? words.map(w => w.replace(/[аъ]/g, "у")) : words;')
    .replace(К2, К2 + '\n        const аъВажи = qЛат && nkИмаЪ;' +
                    '\n        const nkАУ = аъВажи ? nk.replace(/[аъ]/g, "у") : nk;')
    .replace(К3, К3 + ' (аъВажи && вклЧисло(qАУ, nkАУ)) ||')
    .replace(К4, К4.slice(0, -2) + ' ||\n             (nk.length >= 4 && аъВажи && wordsАУ.some(w => w.startsWith(nkАУ))));');
}
const W = zaredi(КАНДИДАТ ? кандидат : null);
const KB = W.BL_KB || W.KB;

const ЛАТ = { 'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m',
  'н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'sht',
  'ь':'','ю':'yu','я':'ya','ѝ':'i' };
const лат = (т, ъ) => String(т).toLowerCase().split('').map(c => c === 'ъ' ? ъ : (ЛАТ[c] !== undefined ? ЛАТ[c] : c)).join('');
const id = (т, с) => { const р = W.BL_MATCH(т, с); return р ? р.id : null; };
const тревога = т => !!((W.BL_SHAKEN && W.BL_SHAKEN(т)) || W.BL_MOTHERFLAG(т) || W.BL_PREGFLAG(т, 'Бременност') || W.BL_REDFLAG(т));

if (!тревога('бебето не диша') || !тревога('bebeto ne disha')) { console.log('🔴 СЛЯП: „бебето не диша“ / „bebeto ne disha“ без тревога'); process.exitCode = 2; return; }
console.log('мозък: ' + (КАНДИДАТ ? 'helper.js + КАНДИДАТ (в паметта)' : 'helper.js както е') + ' · всеки ' + ПРОБА + '-и запис');

// ── КЛЮЧОВЕ ──
let н = 0; const сЪ = { общо: 0, a: 0, u: 0 }, безЪ = { общо: 0, a: 0 };
const провалиA = [], загубиБез = [];
for (const e of KB.entries) {
  if (!e.room) continue;
  for (const k of (e.keys || [])) {
    if (String(k).length < 6) continue;
    if ((н++ % ПРОБА) !== 0) continue;
    if (id(k, e.room) !== e.id) continue;               // кирилицата сама не стига → не е мярка за латиницата
    if (/ъ/i.test(k)) {
      сЪ.общо++;
      if (id(лат(k, 'a'), e.room) === e.id) сЪ.a++; else if (провалиA.length < 300) провалиA.push({ k, лат: лат(k, 'a'), id: e.id, стая: e.room });
      if (id(лат(k, 'u'), e.room) === e.id) сЪ.u++;
    } else {
      безЪ.общо++;
      if (id(лат(k, 'a'), e.room) === e.id) безЪ.a++; else if (загубиБез.length < 3000) загубиБез.push({ k, лат: лат(k, 'a'), id: e.id, стая: e.room, дава: id(лат(k, 'a'), e.room) });
    }
  }
}
const п = (a, b) => (100 * a / Math.max(1, b)).toFixed(1) + '%';
console.log('\nКЛЮЧОВЕ с „ъ“ (кирилицата намира своята карта): ' + сЪ.общо);
console.log('  латиница ъ→a → своята карта: ' + сЪ.a + '  (' + п(сЪ.a, сЪ.общо) + ')');
console.log('  латиница ъ→u → своята карта: ' + сЪ.u + '  (' + п(сЪ.u, сЪ.общо) + ')   ← за сравнение');
console.log('КЛЮЧОВЕ без „ъ“ (ЦЕНА): ' + безЪ.общо + ' · латиница → своята карта: ' + безЪ.a + '  (' + п(безЪ.a, безЪ.общо) + ')');

// ── ФЛАГОВЕ ──
const списъци = ['redFlags', 'pregFlags', 'dvFlags', 'motherFlags', 'heavyFlags', 'mamaBodyFlags', 'lossFlags'];
const фл = { общо: 0, a: 0 }; const провалиФ = [];
let нф = 0;
for (const сп of списъци) for (const f of (KB[сп] || [])) {
  if (!/ъ/i.test(f)) continue;
  if ((нф++ % ПРОБА) !== 0) continue;
  if (!тревога(f)) continue;                              // кирилският сам не вдига → не е мярка
  фл.общо++;
  if (тревога(лат(f, 'a'))) фл.a++; else провалиФ.push(сп + ': ' + f + ' → ' + лат(f, 'a'));
}
console.log('\nФЛАГОВЕ с „ъ“ (кирилският вдига тревога): ' + фл.общо);
console.log('  латиница ъ→a → тревога: ' + фл.a + '  (' + п(фл.a, фл.общо) + ')');
провалиФ.slice(0, 8).forEach(x => console.log('   ✘ ' + x));
console.log('\nпримери ключове ъ→a без своята карта:');
провалиA.slice(0, 12).forEach(x => console.log('   ✘ [' + x.стая + '] ' + x.лат + '  (' + x.k + ' · ' + x.id + ')'));
if (ИЗХОД) fs.writeFileSync(ИЗХОД, JSON.stringify({ КАНДИДАТ, ПРОБА, сЪ, безЪ, фл, провалиA, загубиБез, провалиФ }, null, 1));
