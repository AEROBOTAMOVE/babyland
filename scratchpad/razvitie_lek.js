// ЛЕКЪТ, мерен без да се пипа базата: махам САМО „на колко месеца" и
// „на колко месец" от ключовете на zh-koga-start (стая Захранване).
// ПЪТ НАЗАД: нищо не се записва — kbPatch работи върху текст в паметта.
const fs=require('fs');
const {zaredi}=require('../dev/pyasachnik.js');
const R='Развитие и игри', RZ='Захранване';
function махни(src){
  const м=src.indexOf("id: 'zh-koga-start'");
  const кп=src.indexOf('keys: [',м), край=src.indexOf('],',кп);
  let блок=src.slice(кп,край);
  const преди=блок.length;
  блок=блок.replace(/'на колко месеца', ?/g,'').replace(/'на колко месец', ?/g,'');
  if(блок.length===преди) throw new Error('не намерих ключовете за махане — патчът би бил тих no-op');
  return src.slice(0,кп)+блок+src.slice(край);
}
const ПРЕДИ=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const СЛЕД =zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}},kbPatch:махни});
const п=(ПРЕДИ.BL_KB||ПРЕДИ.KB).entries.find(e=>e.id==='zh-koga-start');
const с=(СЛЕД.BL_KB||СЛЕД.KB).entries.find(e=>e.id==='zh-koga-start');
console.log('КОНТРОЛ: zh-koga-start ключове '+п.keys.length+' -> '+с.keys.length+(с.keys.length<п.keys.length?'  ✓':'  ✗ ТИХ NO-OP'));
const въпр=['на 6 месеца не хваща играчки','на колко месеца почва да пълзи','на колко месеца проходява',
 'на колко месеца казва мама','на колко месеца сяда само','на 6 месеца какво трябва да може',
 'на колко месеца почва да лепети','на 6 месеца да го слагам ли да седи','кога трябва да сяда мъника на 6 месеца е и още нищо'];
console.log('\n--- ПЕЧАЛБА в стая „Развитие и игри" ---');
let печ=0;
въпр.forEach(q=>{
  const a=ПРЕДИ.BL_MATCH(q,R), b=СЛЕД.BL_MATCH(q,R);
  const ai=a?a.id:'ТИШИНА', bi=b?b.id:'ТИШИНА';
  const по=a&&a.room!==R&&b&&b.room===R;
  if(по)печ++;
  console.log((ai!==bi?(по?'ПЕЧАЛБА':'смяна  '):'същото ')+' | '+ai.padEnd(22)+' -> '+bi.padEnd(24)+'| '+q);
});
console.log('спечелени: '+печ+' от '+въпр.length);
console.log('\n--- ЦЕНАТА: собствените 53 ключа на zh-koga-start + стая Захранване ---');
let загуба=[];
п.keys.forEach(k=>{
  const a=ПРЕДИ.BL_MATCH(k,RZ), b=СЛЕД.BL_MATCH(k,RZ);
  if((a?a.id:null)!==(b?b.id:null)) загуба.push('"'+k+'"  '+(a?a.id:'ТИШИНА')+' -> '+(b?b.id:'ТИШИНА'));
});
console.log('променени от 53-те ѝ ключа: '+загуба.length);
загуба.forEach(s=>console.log('  '+s));
// и целите ключове на стая Захранване
const zh=(ПРЕДИ.BL_KB||ПРЕДИ.KB).entries.filter(e=>e.room===RZ);
let n=0,ст=[];
zh.forEach(e=>e.keys.forEach(k=>{ if(String(k).length<6)return; n++;
  const a=ПРЕДИ.BL_MATCH(k,RZ), b=СЛЕД.BL_MATCH(k,RZ);
  if((a?a.id:null)!==(b?b.id:null)) ст.push('"'+k+'"  '+(a?a.id:'ТИШИНА')+' -> '+(b?b.id:'ТИШИНА'));
}));
console.log('\nвърху '+n+' ключа на цялата стая Захранване — променени: '+ст.length);
ст.slice(0,20).forEach(s=>console.log('  '+s));
