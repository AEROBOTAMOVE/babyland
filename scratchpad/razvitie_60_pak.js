// ВТОРО ПУСКАНЕ на същите 60 въпроса — базата се смени под мярката (11:01 -> 11:18)
const fs=require('fs');
const {zaredi}=require('../dev/pyasachnik.js');
const R='Развитие и игри';
const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
// КОНТРОЛ преди да вярвам на което и да е число
const трябва=['кога сяда бебето','кога проходява','екрани','музиката','пълзене','наужким'];
const глупост=['бла бла зззз кврт','ипсилон марамбо дрън','xyzq wwww','плюмбус вертикулатор','ъъъ хм хм'];
let к=0;
трябва.forEach(t=>{const r=A.BL_MATCH(t,R); if(r)к++; else console.log('КОНТРОЛ ПАДА (трябваше карта): '+t);});
глупост.forEach(t=>{const r=A.BL_MATCH(t,R); if(!r)к++; else console.log('КОНТРОЛ ПАДА (трябваше тишина): '+t+' -> '+r.id);});
console.log('КОНТРОЛ: '+к+'/'+(трябва.length+глупост.length)+(к===11?'  ✓':'  ✗'));
const В=JSON.parse(fs.readFileSync('scratchpad/razvitie_60_raw.json','utf8'));
const нов=[]; let смени=0, т=0;
В.forEach(x=>{
  const r=A.BL_MATCH(x.q,R); const id=r?r.id:null;
  if(!id)т++;
  if((id||'ТИШИНА')!==(x.id||'ТИШИНА')){смени++;
    console.log(String(x.n).padStart(2)+' | 11:01 '+(x.id||'ТИШИНА').padEnd(26)+'-> 11:18 '+(id||'ТИШИНА').padEnd(28)+'| '+x.q);}
  нов.push({n:x.n,q:x.q,очак:x.очак,id,title:r?r.title:null,room:r?r.room:null});
});
console.log('\nсменени спрямо първото пускане: '+смени+'/60 · тишини СЕГА: '+т);
fs.writeFileSync('scratchpad/razvitie_60_1118.json',JSON.stringify(нов,null,1),'utf8');
