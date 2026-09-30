const fs=require('fs');
const {zaredi}=require('../dev/pyasachnik.js');
const R='Развитие и игри';
const П=JSON.parse(fs.readFileSync('scratchpad/klyuchove_razvitie.json','utf8'));
function патч(src){
  let доб=0;
  for(const [id,кл] of Object.entries(П)){
    let м=src.indexOf("id: '"+id+"'"); if(м<0)м=src.indexOf('id: "'+id+'"');
    if(м<0)throw new Error('няма '+id);
    const кп=src.indexOf('keys: [',м); if(кп<0||кп-м>2000)throw new Error('няма keys за '+id);
    const вст=кп+'keys: ['.length;
    src=src.slice(0,вст)+кл.map(k=>"'"+k+"', ").join('')+src.slice(вст);
    доб+=кл.length;
  }
  console.error('[патч] '+доб);
  return src;
}
const ПРЕДИ=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const СЛЕД =zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}},kbPatch:патч});
let к=0; for(const id of Object.keys(П)){
  const a=(ПРЕДИ.BL_KB||ПРЕДИ.KB).entries.find(e=>e.id===id).keys.length;
  const b=(СЛЕД.BL_KB||СЛЕД.KB).entries.find(e=>e.id===id).keys.length;
  console.log('КОНТРОЛ '+id.padEnd(20)+' '+a+' -> '+b+(b>a?' ✓':' ✗')); if(b>a)к++;
}
console.log('патчът е жив за '+к+'/'+Object.keys(П).length+' карти');
const цели=[['кога трябва да сяда мъника на 6 месеца е и още нищо','rz-sedene'],
 ['на две години е и знае малко думички рано ли е за логопед','gz-kysno-govor'],
 ['не издържа да загуби в игра и се разплаква','igr-red-i-pravila'],
 ['не иска да ми покаже какво е правил в градината','z2-razkazva-denya']];
цели.forEach(([q,ц])=>{const a=ПРЕДИ.BL_MATCH(q,R),b=СЛЕД.BL_MATCH(q,R);
  console.log((b&&b.id===ц?'ОПРАВЕН':'ОСТАВА ')+' | '+(a?a.id:'ТИШИНА').padEnd(26)+'-> '+(b?b.id:'ТИШИНА')+' | '+q);});
const ent=(ПРЕДИ.BL_KB||ПРЕДИ.KB).entries.filter(e=>e.room===R);
let n=0,ст=[];
ent.forEach(e=>e.keys.forEach(k=>{ if(String(k).length<6)return; n++;
  const a=ПРЕДИ.BL_MATCH(k,R), b=СЛЕД.BL_MATCH(k,R);
  if((a?a.id:null)!==(b?b.id:null)) ст.push('"'+k+'"  '+(a?a.id:'ТИШИНА')+' -> '+(b?b.id:'ТИШИНА'));
}));
console.log('\nРЕГРЕСИЯ върху '+n+' ключа на стаята — променени: '+ст.length);
ст.slice(0,25).forEach(s=>console.log('  '+s));
