const {zaredi}=require('../dev/pyasachnik.js');
const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});   // 10 месеца
const B=zaredi(null,{памет:{bl_baby:{birth:'2024-03-30'}}});   // 30 месеца
const R='Развитие и игри';
const сп=require('fs').readFileSync('scratchpad/razvitie_60.js','utf8');
const В=JSON.parse(require('fs').readFileSync('scratchpad/razvitie_60_raw.json','utf8'));
console.log('n | 10 месеца                     | 30 месеца');
let разл=0;
В.forEach(x=>{
  const b=B.BL_MATCH(x.q,R);
  const a=x.id||'ТИШИНА', c=b?b.id:'ТИШИНА';
  if(a!==c){разл++;console.log(String(x.n).padStart(2)+' | '+a.padEnd(30)+' | '+c+'   <<< '+x.q);}
});
console.log('\nразлични при смяна на възрастта: '+разл+' от '+В.length);
