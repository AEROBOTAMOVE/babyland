const fs=require('fs');
const {zaredi}=require('../dev/pyasachnik.js');
const R='Развитие и игри';
const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const KB=(A.BL_KB||A.KB);
const пълно=JSON.parse(fs.readFileSync('scratchpad/klyuchove_razvitie.json','utf8'));
const остава={}, вече={};
let о=0,в=0;
for(const [id,кл] of Object.entries(пълно)){
  const e=KB.entries.find(x=>x.id===id);
  if(!e){console.log('‼ няма карта '+id);continue;}
  const има=new Set(e.keys.map(k=>String(k).toLowerCase().trim()));
  кл.forEach(k=>{
    if(има.has(k.toLowerCase().trim())){(вече[id]=вече[id]||[]).push(k);в++;}
    else {(остава[id]=остава[id]||[]).push(k);о++;}
  });
}
console.log('ВЕЧЕ В БАЗАТА (комит 78e2543): '+в+' ключа в '+Object.keys(вече).length+' карти');
console.log('ОЩЕ ЛИПСВАТ:                   '+о+' ключа в '+Object.keys(остава).length+' карти');
Object.entries(остава).forEach(([id,кл])=>kлПечат(id,кл));
function kлПечат(id,кл){кл.forEach(k=>{
  const r=A.BL_MATCH(k,R);
  console.log('   '+id.padEnd(18)+' | "'+k+'" | сега -> '+(r?r.id:'ТИШИНА'));});}
fs.writeFileSync('scratchpad/klyuchove_razvitie.json',JSON.stringify(остава,null,2),'utf8');
fs.writeFileSync('scratchpad/klyuchove_razvitie_vsichki_80.json',JSON.stringify(пълно,null,2),'utf8');
console.log('\nscratchpad/klyuchove_razvitie.json = САМО още липсващите ('+о+')');
console.log('scratchpad/klyuchove_razvitie_vsichki_80.json = целият доклад (80)');
