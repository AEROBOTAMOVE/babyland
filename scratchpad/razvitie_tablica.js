const fs=require('fs');
const A=JSON.parse(fs.readFileSync('scratchpad/razvitie_60_raw.json','utf8'));   // база 11:01
const B=JSON.parse(fs.readFileSync('scratchpad/razvitie_60_1118.json','utf8'));  // база 11:18
const ЦЕЛ={1:'rz-sedene',9:'ig-knijki',13:'y9-navan-vsyako-vreme',17:'nr-gnevniyat-izblik',
 18:'lb2-revnost',22:'w3-kade-da-sreshtne-deca',23:'gz-kysno-govor',25:'gv-povtarya-kato-papagal',
 28:'gv-vodi-me-za-raka',29:'gv-lepetat',33:'z2-vnimanieto-minuta',34:'igr-kolko-vreme-igra',
 35:'igr-sam-da-si-igrae',38:'ig-chakane',39:'w3-kubcheta-koi-vid',40:'w3-sorter-formi',
 42:'rz-molivche',43:'g3r-draskulkata-na-stenata-kakvo-chist',47:'rz-drugi-pravila',
 54:'w3-kalta-i-mikrobite',55:'kn-edna-i-sashta',58:'y9-nauzhkim'};
function класирай(сп){
  let в=0,ч=0,т=0; const чужди=[],тиши=[];
  сп.forEach(x=>{
    const провал=ЦЕЛ[x.n];
    if(!x.id){т++;тиши.push(x.n);return;}
    if(!провал){в++;return;}                 // въпрос, чийто отговор беше верен
    if(x.id===провал){в++;return;}           // поправен
    ч++; чужди.push(x.n+':'+x.id);
  });
  return{в,ч,т,чужди,тиши};
}
const a=класирай(A), b=класирай(B);
const ред=(и,r)=>'  верен: '+r.в+' · чужда карта: '+r.ч+' · ТИШИНА: '+r.т+'   (сума '+(r.в+r.ч+r.т)+')';
console.log('БАЗА 11:01 (както я заварих)');console.log(ред('a',a));
console.log('  чужди: '+a.чужди.join(' | '));
console.log('  тишини: '+a.тиши.join(', '));
console.log('\nБАЗА 11:18 (живата, след комит 78e2543 с моите 78 ключа)');console.log(ред('b',b));
console.log('  чужди: '+b.чужди.join(' | '));
console.log('  тишини: '+(b.тиши.join(', ')||'няма'));
fs.writeFileSync('scratchpad/razvitie_tablica.txt',
 A.map(x=>{const y=B.find(z=>z.n===x.n);
  return String(x.n).padStart(2)+' | '+x.q+'\n     11:01 -> '+(x.id||'ТИШИНА')+(x.title?' :: '+x.title:'')+
  '\n     11:18 -> '+(y.id||'ТИШИНА')+(y.title?' :: '+y.title:'');}).join('\n'),'utf8');
console.log('\nпълната таблица: scratchpad/razvitie_tablica.txt');
