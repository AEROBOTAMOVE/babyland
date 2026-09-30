'use strict';
const path=require('path'),fs=require('fs');
const {zaredi}=require(path.join(path.resolve(__dirname,'..'),'dev/pyasachnik.js'));
const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}}); // бебе на 10 месеца
const KB=A.BL_KB||A.KB;
const самоБременни=KB.entries.filter(e=>typeof e.до==='number'&&e.до<=0);
console.log('карти САМО за бременност (до<=0): '+самоБременни.length+' от '+KB.entries.length);
let проби=0,достигнати=0;const примери=[];
for(const e of самоБременни){
 const k=(e.keys||[]).find(k=>k.length>=14); if(!k)continue; проби++;
 const r=A.BL_MATCH(k,'Моето бебе');
 if(r&&r.id===e.id){достигнати++; if(примери.length<15)примери.push([e.id,e.от+'..'+e.до,k]);}
}
console.log('пробвани: '+проби+'   ДОСТИГНАТИ от майка с бебе на 10 месеца: '+достигнати+'  ('+(100*достигнати/проби).toFixed(1)+'%)');
console.log('\nпримери (карта · възраст · ключ, който я вади на РОДИЛА жена):');
for(const [id,в,k] of примери)console.log('  '+id.padEnd(30)+' ['+в+']  ← '+k);
fs.writeFileSync(path.join(__dirname,'sun_28_gejt.json'),JSON.stringify({самоБременни:самоБременни.length,проби,достигнати,примери},null,1),'utf8');
