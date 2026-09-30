// ДОКАЗАТЕЛСТВО за възрастовото поле в пясъчника.
// BL_AGE живее в js/rooms2.js, който dev/pyasachnik.js НЕ зарежда.
// Тук го вкарвам ОТВЪН (vm.runInContext), думa по дума от rooms2.js.
const vm=require('vm'), fs=require('fs'), path=require('path');
const {zaredi,ROOT}=require('../dev/pyasachnik.js');
const src=fs.readFileSync(path.join(ROOT,'js/rooms2.js'),'utf8');
const L=src.split('\n');
const дати=L.slice(53,61).join('\n');            // денНула (54..60) + дниМежду (61)
function изрежи(маркер){
  const i=src.indexOf(маркер); if(i<0) throw new Error('няма '+маркер);
  let d=0,k=src.indexOf('{',i);
  for(;;k++){ if(src[k]==='{')d++; else if(src[k]==='}'){d--; if(d===0)break;} }
  return src.slice(i,k+1);
}
const pw_=изрежи("function pretermWeeks() {");
const age=изрежи('function ageFromBirth(birth, днес) {');
// единствената ми ДОПИСАНА дума (всичко останало е дословно от rooms2.js):
// `load` е вътрешна за rooms2.js; давам ѝ същата семантика върху localStorage.
const шим='function load(k,d){try{const v=localStorage.getItem(k);if(v==null)return d;try{return JSON.parse(v);}catch(e){return v;}}catch(e){return d;}}\n';
const впръсквам=шим+дати+'\n'+pw_+'\n'+age+'\nwindow.BL_AGE = ageFromBirth;\n';
fs.writeFileSync('scratchpad/_age_inject.js',впръсквам,'utf8');
function сГейт(birth){
  const W=zaredi(null,{памет:{bl_baby:{birth}}});
  vm.runInContext(впръсквам,W,{filename:'age-inject'});
  return W;
}
const R='Развитие и игри';
const В=JSON.parse(fs.readFileSync('scratchpad/razvitie_60_raw.json','utf8'));
const G10=сГейт('2025-11-20'), G30=сГейт('2024-03-30');
console.log('BL_AGE: '+typeof G10.BL_AGE);
console.log('10м -> months='+G10.BL_AGE('2025-11-20').months+'  devMonths='+G10.BL_AGE('2025-11-20').devMonths);
console.log('30м -> months='+G30.BL_AGE('2024-03-30').months+'  devMonths='+G30.BL_AGE('2024-03-30').devMonths);
let р1=0,р2=0;
console.log('\nn  | БЕЗ гейт                     | С гейт 10м                   | С гейт 30м');
В.forEach(x=>{
  const a=G10.BL_MATCH(x.q,R), b=G30.BL_MATCH(x.q,R);
  const без=x.id||'ТИШИНА', с10=a?a.id:'ТИШИНА', с30=b?b.id:'ТИШИНА';
  if(без!==с10)р1++; if(с10!==с30)р2++;
  if(без!==с10||с10!==с30) console.log(String(x.n).padStart(2)+' | '+без.padEnd(29)+'| '+с10.padEnd(29)+'| '+с30+'  <<< '+x.q);
});
console.log('\nразлики БЕЗ гейт vs С гейт(10м): '+р1+'/60');
console.log('разлики С гейт 10м vs 30м:       '+р2+'/60');
fs.writeFileSync('scratchpad/razvitie_60_sgeit10.json',JSON.stringify(В.map(x=>{const a=G10.BL_MATCH(x.q,R);return{n:x.n,q:x.q,очак:x.очак,id:a?a.id:null,title:a?a.title:null,room:a?a.room:null};}),null,1),'utf8');
