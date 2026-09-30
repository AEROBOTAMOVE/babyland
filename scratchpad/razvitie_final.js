const fs=require('fs');
const {zaredi}=require('../dev/pyasachnik.js');
const R='Развитие и игри';
const П=JSON.parse(fs.readFileSync('scratchpad/klyuchove_razvitie.json','utf8'));
function патч(src){
  let доб=0;
  for(const [id,кл] of Object.entries(П)){
    let м=src.indexOf("id: '"+id+"'"); if(м<0)м=src.indexOf('id: "'+id+'"');
    if(м<0) throw new Error('няма id '+id);
    const кп=src.indexOf('keys: [',м); if(кп<0||кп-м>2000) throw new Error('няма keys за '+id);
    const вст=кп+'keys: ['.length;
    src=src.slice(0,вст)+кл.map(k=>"'"+k+"', ").join('')+src.slice(вст);
    доб+=кл.length;
  }
  console.error('[патч] '+доб+' ключа');
  return src;
}
const ПРЕДИ=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const СЛЕД =zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}},kbPatch:патч});
const к1=(ПРЕДИ.BL_KB||ПРЕДИ.KB).entries.find(e=>e.id==='rz-sedene').keys.length;
const к2=(СЛЕД.BL_KB||СЛЕД.KB).entries.find(e=>e.id==='rz-sedene').keys.length;
console.log('КОНТРОЛ: rz-sedene '+к1+' -> '+к2+(к2>к1?' ✓':' ✗ ТИХ NO-OP'));
const В=JSON.parse(fs.readFileSync('scratchpad/razvitie_60_raw.json','utf8'));
const ЦЕЛ={1:'rz-sedene',9:'ig-knijki',13:'y9-navan-vsyako-vreme',17:'nr-gnevniyat-izblik',
 18:'lb2-revnost',22:'w3-kade-da-sreshtne-deca',23:'gz-kysno-govor',25:'gv-povtarya-kato-papagal',
 28:'gv-vodi-me-za-raka',29:'gv-lepetat',33:'z2-vnimanieto-minuta',34:'igr-kolko-vreme-igra',
 35:'igr-sam-da-si-igrae',38:'ig-chakane',39:'w3-kubcheta-koi-vid',40:'w3-sorter-formi',
 42:'rz-molivche',43:'g3r-draskulkata-na-stenata-kakvo-chist',47:'rz-drugi-pravila',
 54:'w3-kalta-i-mikrobite',55:'kn-edna-i-sashta',58:'y9-nauzhkim'};
let опр=0,ост=[];
Object.keys(ЦЕЛ).map(Number).sort((a,b)=>a-b).forEach(n=>{
  const x=В.find(y=>y.n===n); const s=СЛЕД.BL_MATCH(x.q,R); const sid=s?s.id:'ТИШИНА';
  if(sid===ЦЕЛ[n])опр++; else ост.push(n+': '+sid+' (цел '+ЦЕЛ[n]+')');
});
console.log('ОПРАВЕНИ: '+опр+' от 22');
ост.forEach(s=>console.log('  остава -> '+s));
// и 60-те общо: колко сега са в своята стая и колко тишини
let т=0,чужда_стая=0;
В.forEach(x=>{const s=СЛЕД.BL_MATCH(x.q,R); if(!s)т++; else if(s.room!==R)чужда_стая++;});
console.log('\nСЛЕД патча върху 60-те: тишини '+т+' · отговор от друга стая '+чужда_стая);
