'use strict';
const path=require('path');
const КОРЕН=path.resolve(__dirname,'..');
const {zaredi}=require(path.join(КОРЕН,'dev/pyasachnik.js'));
const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const KB=A.BL_KB||A.KB;
const поId=new Map(KB.entries.map(e=>[e.id,e]));
const Ц=['zd-son2','lb2-zalagalka','nm-noshtnite-sabuzhdan','ema-san','nm-ritualat-predi','x1-noshtna-budnost','nm-budnoto-vreme','mb-san','in-koshara','sn-ranno-sabuzhdane','sn-cikli-40min','sn-zaspivane-samo','x1-slagane-bez-budene','sn-kolko-7-12','x1-cyala-nosht-znachi','mb5-obleklo-san','mb-temperatura-tialo','nb4-tishinata','x1-sanna-asociacia','sn-sunlivo-budno','sn-detsko-leglo','sn-otdelna-staya','x1-tri-na-dve-dryamki','x1-spi-v-dvizhenie','x1-zabi-i-nosht','rz-noshtni-strahove','mst-gosti-son','lb2-noshtni','mb5-driamki','x1-zalagalka-noshtem','mb-feyata-zalagalki','x1-zaspiva-v-kolata','sn-chas-lyagane','x1-kontaktna-dryamka','mb5-obrushta-nasan','x1-otkaz-obeden-son','sn-edna-driamka','pt-otdelni-stai','nm-kogato-izdarzhas','nm-kade-spi','x1-dnevnik-na-sana','x1-otbih-i-ne-spi','zh-zaspiva','mb-colic','x1-tatko-prispiva','x1-spi-mnogo-budya','x1-prepovivane-noshtem','sn-hranene-na-san','sn-ritam-den','x1-lyulee-se-predi-son','x1-yasla-i-son','x1-tih-chas','muz-prispivna-pesen','x1-spi-v-shezlong','sn-regresii-kraj','lb-regresia-san'];
for(const id of Ц){const e=поId.get(id);
  if(!e){console.log('\n### '+id+' — НЯМА');continue;}
  const c=typeof e.core==='string'?e.core:JSON.stringify(e.core);
  console.log('\n### '+id+' ['+e.room+'] от '+e.от+' до '+e.до+' «'+e.title+'»');
  console.log(' K: '+(e.keys||[]).join(' | '));
  console.log(' C: '+String(c).replace(/\s+/g,' ').slice(0,260));
}
