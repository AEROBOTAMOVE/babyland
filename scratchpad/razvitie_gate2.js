const {zaredi}=require('../dev/pyasachnik.js');
const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const B=zaredi(null,{памет:{bl_baby:{birth:'2024-03-30'}}});
console.log('BL_AGE(A) ->',JSON.stringify(A.BL_AGE('2025-11-20')));
console.log('BL_AGE(B) ->',JSON.stringify(B.BL_AGE('2024-03-30')));
// контрол на ГЕЙТА: две карти с еднакъв ключ и разделени възрасти
const R='Развитие и игри';
const пробни=['играта на уж','игри с бебе до три месеца','две до три години','какво да играем'];
пробни.forEach(q=>{
  const a=A.BL_MATCH(q,R), b=B.BL_MATCH(q,R);
  const ai=a?a.id:'ТИШИНА', bi=b?b.id:'ТИШИНА';
  console.log((ai===bi?'=   ':'РАЗЛ')+' | '+q.padEnd(28)+' | 10м: '+ai.padEnd(26)+' | 30м: '+bi);
});
