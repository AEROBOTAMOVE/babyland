'use strict';
const path=require('path'),fs=require('fs');
const КОРЕН=path.resolve(__dirname,'..');
const {zaredi}=require(path.join(КОРЕН,'dev/pyasachnik.js'));
const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const KB=A.BL_KB||A.KB;
const ТИТ=/сън|съня|спи|спя|спал|спан|заспив|буди|будн|будя|събужд|дрям|дрем|нощ|креватч|кошар|люлк|залъгалк|ритуал|регресия|приспив|сънн|насън/i;
const ядро=KB.entries.filter(e=>ТИТ.test(e.title)||/^sn-/.test(e.id));
let out='ЯДРО ПО СЪН (заглавие или id sn-): '+ядро.length+'\n';
for(const e of ядро){
  out+='\n### '+e.id+'  ['+e.room+']  «'+e.title+'»  от '+e.от+' до '+e.до+'\n';
  out+='  KEYS('+(e.keys||[]).length+'): '+(e.keys||[]).join(' | ')+'\n';
  const c=typeof e.core==='string'?e.core:JSON.stringify(e.core);
  out+='  CORE: '+String(c).replace(/\s+/g,' ').slice(0,420)+'\n';
}
fs.writeFileSync(path.join(__dirname,'sun_3_yadro.txt'),out,'utf8');
console.log('ядро: '+ядро.length);
for(const e of ядро) console.log(e.id+'  ['+e.room+']  '+e.title);
