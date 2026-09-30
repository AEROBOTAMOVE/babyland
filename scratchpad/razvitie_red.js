const {zaredi}=require('../dev/pyasachnik.js');
const R='Развитие и игри';
const Q='води ме за ръка вместо да ми каже какво иска';
// A: съвсем сам, пръв въпрос в нов процес
const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const r1=A.BL_MATCH(Q,R);
console.log('1) пръв въпрос:            '+(r1?r1.id:'ТИШИНА'));
// B: същият мозък, но след 27 други въпроса (както в мярката на 60-те)
const В=JSON.parse(require('fs').readFileSync('scratchpad/razvitie_60_raw.json','utf8'));
const B=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
В.filter(x=>x.n<28).forEach(x=>B.BL_MATCH(x.q,R));
const r2=B.BL_MATCH(Q,R);
console.log('2) след 27 други въпроса:  '+(r2?r2.id:'ТИШИНА'));
// C: пак пръв, но в трети мозък — повторяемост
const C=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
console.log('3) пръв въпрос отново:     '+(()=>{const r=C.BL_MATCH(Q,R);return r?r.id:'ТИШИНА';})());
// D: два пъти подред в един мозък
console.log('4) същият мозък, 2-ри път: '+(()=>{const r=C.BL_MATCH(Q,R);return r?r.id:'ТИШИНА';})());
console.log('\nразлика 1 vs 2: '+((r1?r1.id:'ТИШИНА')===(r2?r2.id:'ТИШИНА')?'НЯМА':'ИМА — мярката зависи от РЕДА'));
