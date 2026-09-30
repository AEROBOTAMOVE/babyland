const fs=require('fs');
const {zaredi}=require('../dev/pyasachnik.js');
const R='Развитие и игри';
const П=JSON.parse(fs.readFileSync('scratchpad/klyuchove_razvitie.json','utf8'));
// ПЪТ НАЗАД: нищо не се записва в js/kb.js — само kbPatch върху текста в паметта.
function патч(src){
  let добавени=0, ненамерени=[];
  for(const [id,кл] of Object.entries(П)){
    // kb.js пише id-тата и с единични, и с двойни кавички — пробвам и двете
    let м=src.indexOf("id: '"+id+"'");
    if(м<0) м=src.indexOf('id: "'+id+'"');
    if(м<0){ненамерени.push(id);continue;}
    let кп=src.indexOf('keys: [',м); if(кп<0) кп=src.indexOf('keys: [',м);
    if(кп<0||кп-м>2000){ненамерени.push(id+' (без keys)');continue;}
    const вст=кп+'keys: ['.length;
    const низ=кл.map(k=>"'"+k.replace(/'/g,"\'")+"'").join(', ')+', ';
    src=src.slice(0,вст)+низ+src.slice(вст);
    добавени+=кл.length;
  }
  if(ненамерени.length) throw new Error('не намерих: '+ненамерени.join(' | '));
  console.error('[патч] вкарани ключа: '+добавени);
  return src;
}
const ПРЕДИ=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const СЛЕД =zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}},kbPatch:патч});
// контрол: патчът наистина ли влезе
const к1=(ПРЕДИ.BL_KB||ПРЕДИ.KB).entries.find(e=>e.id==='y9-nauzhkim').keys.length;
const к2=(СЛЕД.BL_KB||СЛЕД.KB).entries.find(e=>e.id==='y9-nauzhkim').keys.length;
console.log('КОНТРОЛ на патча: y9-nauzhkim ключове '+к1+' -> '+к2+(к2>к1?'  ✓ патчът е жив':'  ✗ ПАТЧЪТ Е МЪРТЪВ'));
console.log('КОНТРОЛ брой карти: '+(ПРЕДИ.BL_KB||ПРЕДИ.KB).entries.length+' -> '+(СЛЕД.BL_KB||СЛЕД.KB).entries.length);

const В=JSON.parse(fs.readFileSync('scratchpad/razvitie_60_raw.json','utf8'));
// очакваните цели за 22-те провала
const ЦЕЛ={1:'rz-sedene',9:'ig-knijki',13:'y9-navan-vsyako-vreme',17:'nr-gnevniyat-izblik',
 18:'lb2-revnost',22:'w3-kade-da-sreshtne-deca',23:'gz-kysno-govor',25:'gv-povtarya-kato-papagal',
 28:'gv-vodi-me-za-raka',29:'gv-lepetat',33:'z2-vnimanieto-minuta',34:'igr-kolko-vreme-igra',
 35:'igr-sam-da-si-igrae',38:'ig-chakane',39:'w3-kubcheta-koi-vid',40:'w3-sorter-formi',
 42:'rz-molivche',43:'g3r-draskulkata-na-stenata-kakvo-chist',47:'rz-drugi-pravila',
 54:'w3-kalta-i-mikrobite',55:'kn-edna-i-sashta',58:'y9-nauzhkim'};
let оправени=0,неоправени=[];
console.log('\n--- 22-ТЕ ПРОВАЛА СЛЕД ПАТЧА ---');
Object.keys(ЦЕЛ).map(Number).sort((a,b)=>a-b).forEach(n=>{
  const x=В.find(y=>y.n===n);
  const s=СЛЕД.BL_MATCH(x.q,R); const sid=s?s.id:'ТИШИНА';
  const ок=sid===ЦЕЛ[n];
  if(ок)оправени++; else неоправени.push(n+': '+sid+' (цел '+ЦЕЛ[n]+')');
  console.log((ок?'ОПРАВЕН ':'ОСТАВА  ')+String(n).padStart(2)+' | '+(x.id||'ТИШИНА').padEnd(28)+' -> '+sid.padEnd(38)+' | '+x.q);
});
console.log('\nоправени: '+оправени+' от 22');
неоправени.forEach(s=>console.log('  остава -> '+s));
// РЕГРЕСИЯ: всеки съществуващ ключ на всяка карта в стаята — води ли още при своята карта
const ent=(ПРЕДИ.BL_KB||ПРЕДИ.KB).entries.filter(e=>e.room===R);
let проверени=0, счупени=[];
ent.forEach(e=>{
  e.keys.forEach(k=>{
    if(String(k).length<6) return;
    проверени++;
    const a=ПРЕДИ.BL_MATCH(k,R), b=СЛЕД.BL_MATCH(k,R);
    const ai=a?a.id:null, bi=b?b.id:null;
    if(ai!==bi) счупени.push({ключ:k,беше:ai,стана:bi});
  });
});
console.log('\n--- РЕГРЕСИЯ върху '+проверени+' съществуващи ключа на стаята ---');
console.log('променени: '+счупени.length);
счупени.slice(0,40).forEach(x=>console.log('  "'+x.ключ+'"  '+x.беше+' -> '+x.стана));
fs.writeFileSync('scratchpad/razvitie_regresiya.json',JSON.stringify(счупени,null,1),'utf8');
