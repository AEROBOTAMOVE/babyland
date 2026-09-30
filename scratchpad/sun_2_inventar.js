'use strict';
const path=require('path'),fs=require('fs');
const КОРЕН=path.resolve(__dirname,'..');
const {zaredi}=require(path.join(КОРЕН,'dev/pyasachnik.js'));
const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const KB=A.BL_KB||A.KB;
const РЕ=/сън|съня|съне|спи|спя|спал|заспив|буди|будн|будя|събужд|дрям|дремe|дрем|нощем|нощн|креватч|кошар|люлк|залъгалк|биберон.*сън|ритуал|регресия|приспив|сънн/i;
const намерени=[];
for(const e of KB.entries){
  const текст=[e.title,(e.keys||[]).join(' '),JSON.stringify(e.core||'')].join(' ');
  if(РЕ.test(текст)) намерени.push(e);
}
let out='НАМЕРЕНИ КАРТИ ПО СЪН: '+намерени.length+' от '+KB.entries.length+'\n';
for(const e of намерени){
  out+='\n### '+e.id+'  ['+e.room+']  «'+e.title+'»  (от '+e.от+' до '+e.до+')\n';
  out+='    ключове('+(e.keys||[]).length+'): '+(e.keys||[]).join(' | ')+'\n';
  const c=typeof e.core==='string'?e.core:JSON.stringify(e.core);
  out+='    ядро: '+String(c).replace(/\s+/g,' ').slice(0,300)+'\n';
}
fs.writeFileSync(path.join(__dirname,'sun_2_inventar.txt'),out,'utf8');
console.log('карти по сън: '+намерени.length);
console.log(намерени.map(e=>e.id+' ['+e.room+'] '+e.title).join('\n'));
