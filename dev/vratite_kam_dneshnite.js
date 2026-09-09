// От 33-те останали врати — кои водят към карта, която ДНЕС е написана или
// напасната ТОЧНО за този въпрос? Такава карта е верният отговор по
// строеж: тя има ключ, който е самият въпрос.
//
// ⚠️ Това НЕ е „щом е нова, значи е добра". Критерият е по-тесен:
//    въпросът на майката е БУКВАЛНО ключ на картата-цел.
const fs = require('fs');
const { zaredi } = require('./pyasachnik.js');
const W = zaredi(null, { памет: { bl_baby: { birth: '2025-11-20' } } });
const KB = W.BL_KB || W.KB;
const поId = new Map((KB.entries || []).map(e => [e.id, e]));

const врати = require('./_nedostig.json').врати;
const норм = s => String(s).toLowerCase().replace(/[^а-яa-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

const кандидати = [], останали = [];
for (const в of врати) {
  const e = поId.get(в.id);
  if (!e) { останали.push([в, 'няма карта']); continue; }
  const ключове = (e.keys || []).map(норм);
  const въпрос = норм(в.t);
  // строгият критерий: въпросът Е ключ, или ключ е почти целият въпрос
  const точен = ключове.indexOf(въпрос) >= 0;
  const почти = ключове.some(k => k.length >= въпрос.length * 0.7 && въпрос.indexOf(k) >= 0);
  if (точен || почти) кандидати.push({ в, e, точен });
  else останали.push([в, 'въпросът не е ключ на картата']);
}

console.log('');
console.log('🚪 33-те врати — кои водят към карта, писана ТОЧНО за въпроса');
console.log('   ✅ въпросът Е ключ на картата: ' + кандидати.length);
console.log('   ⏸️ останалите (искат човешко четене): ' + останали.length);
console.log('');
кандидати.forEach(({ в, e, точен }) => {
  console.log('   ' + (точен ? '🎯' : '≈ ') + ' [' + в.стая + ' → ' + в.към + ']');
  console.log('       въпрос: ' + в.t);
  console.log('       карта : ' + e.id + '  „' + String(e.title || e.t || '').slice(0, 52) + '"');
});
console.log('');
console.log('── останалите ──');
останали.forEach(([в, защо]) => console.log('   [' + в.стая + ' → ' + в.към + '] ' + в.t + '   (' + защо + ')'));

const ид = [...new Set(кандидати.map(x => x.e.id))];
fs.writeFileSync('dev/_bez_podavane_2.json', JSON.stringify(ид, null, 1));
console.log('');
console.log('   → dev/_bez_podavane_2.json  (' + ид.length + ' уникални id)');
