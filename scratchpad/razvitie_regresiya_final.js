const fs=require('fs');
const {zaredi}=require('../dev/pyasachnik.js');
const R='Развитие и игри';
const П=JSON.parse(fs.readFileSync('scratchpad/klyuchove_razvitie.json','utf8'));
function патч(src){
  for(const [id,кл] of Object.entries(П)){
    let м=src.indexOf("id: '"+id+"'"); if(м<0)м=src.indexOf('id: "'+id+'"');
    const кп=src.indexOf('keys: [',м), вст=кп+'keys: ['.length;
    src=src.slice(0,вст)+кл.map(k=>"'"+k+"', ").join('')+src.slice(вст);
  }
  return src;
}
const ПРЕДИ=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const СЛЕД =zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}},kbPatch:патч});
const ent=(ПРЕДИ.BL_KB||ПРЕДИ.KB).entries.filter(e=>e.room===R);
let n=0,ст=[];
ent.forEach(e=>e.keys.forEach(k=>{ if(String(k).length<6)return; n++;
  const a=ПРЕДИ.BL_MATCH(k,R), b=СЛЕД.BL_MATCH(k,R);
  if((a?a.id:null)!==(b?b.id:null)) ст.push('"'+k+'"  '+(a?a.id:'ТИШИНА')+' -> '+(b?b.id:'ТИШИНА'));
}));
console.log('РЕГРЕСИЯ (80 ключа) върху '+n+' съществуващи ключа на стаята — променени: '+ст.length);
ст.slice(0,30).forEach(s=>console.log('  '+s));
