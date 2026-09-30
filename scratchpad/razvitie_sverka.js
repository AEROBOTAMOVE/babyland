const {zaredi}=require('../dev/pyasachnik.js');
const R='Развитие и игри';
const В=JSON.parse(require('fs').readFileSync('scratchpad/razvitie_60_raw.json','utf8'));
const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
[25,28,29,34,39,42,47,54].forEach(n=>{
  const x=В.find(y=>y.n===n);
  const r=A.BL_MATCH(x.q,R);
  const сега=r?r.id:'ТИШИНА', записано=x.id||'ТИШИНА';
  console.log(String(n).padStart(2)+' | записано: '+записано.padEnd(26)+'| сега: '+сега.padEnd(26)+(сега===записано?'| =':'| ‼ РАЗЛИКА')+'\n     q="'+x.q+'"');
});
