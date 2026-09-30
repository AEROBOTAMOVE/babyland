const fs=require('fs');
const {zaredi}=require('../dev/pyasachnik.js');
const R='Развитие и игри';
const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const KB=(A.BL_KB||A.KB);
const индекс=new Map();
KB.entries.forEach(e=>e.keys.forEach(k=>{const s=String(k).toLowerCase().trim();
  if(!индекс.has(s))индекс.set(s,[]); индекс.get(s).push(e.id);}));
console.log('кой владее "рано ли е за логопед": '+JSON.stringify(индекс.get('рано ли е за логопед')||'НИКОЙ'));
console.log('кой владее "кога трябва да сяда": '+JSON.stringify(индекс.get('кога трябва да сяда')||'НИКОЙ'));
const проба={
 "rz-sedene":["кога трябва да сяда","на 6 месеца е и още нищо","кога трябва да сяда мъника"],
 "gz-kysno-govor":["знае малко думички рано ли е за логопед","малко думички рано ли е за логопед","думички рано ли е за логопед","на две години знае малко думички"]
};
for(const [цел,кл] of Object.entries(проба)) кл.forEach(k=>{
  const s=k.toLowerCase().trim(), зает=индекс.get(s)||[];
  const сега=A.BL_MATCH(k,R), сид=сега?сега.id:'ТИШИНА';
  console.log((зает.length?'ЗАЕТ('+зает.join(',')+')':(сид===цел?'ВЕЧЕ ВОДИ':'СВОБОДЕН'))+' | '+цел+' | "'+k+'" | сега -> '+сид);
});
