const fs=require('fs');
const {zaredi}=require('../dev/pyasachnik.js');
const R='Развитие и игри';
const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const KB=(A.BL_KB||A.KB);
const индекс=new Map();
KB.entries.forEach(e=>e.keys.forEach(k=>{const s=String(k).toLowerCase().trim();
  if(!индекс.has(s))индекс.set(s,[]); индекс.get(s).push(e.id);}));
const доп={
 "igr-red-i-pravila":["не издържа да загуби","не издържа да загуби в игра","разплаква се като загуби","не понася да загуби"],
 "z2-razkazva-denya":["не иска да ми покаже какво е правил","не ми казва какво е правил в градината","не разказва какво е правил в градината"]
};
const прието={};
for(const [цел,кл] of Object.entries(доп)) кл.forEach(k=>{
  const s=k.toLowerCase().trim(), зает=индекс.get(s)||[];
  const r=A.BL_MATCH(k,R), сид=r?r.id:'ТИШИНА';
  if(зает.length){console.log('НЕ | ЗАЕТ от '+зает.join(',')+' | "'+k+'"');return;}
  if(сид===цел){console.log('НЕ | ВЕЧЕ води | "'+k+'"');return;}
  (прието[цел]=прието[цел]||[]).push(k);
  console.log('OK | '+цел.padEnd(20)+'| "'+k+'" | сега -> '+сид);
});
const J=JSON.parse(fs.readFileSync('scratchpad/klyuchove_razvitie.json','utf8'));
Object.assign(J,прието);
fs.writeFileSync('scratchpad/klyuchove_razvitie.json',JSON.stringify(J,null,2),'utf8');
let n=0;for(const k in J)n+=J[k].length;
console.log('\nscratchpad/klyuchove_razvitie.json -> '+Object.keys(J).length+' карти · '+n+' ключа');
