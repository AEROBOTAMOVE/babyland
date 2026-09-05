// временен уред за измерване — само ЧЕТЕ
const path=require('path'); const fs=require('fs');
const {zaredi}=require(path.resolve(__dirname,'pyasachnik.js'));
const W=zaredi(null);
const K=W.KB.entries;
const T={}; K.forEach(z=>T[z.id]=z.title);
const СТАИ=['Бременност','Моето бебе','Захранване','Здраве и SOS','Развитие и игри','Дневник на мама','Жената в мен','Инструменти','Лабораторията'];
function mm(t,s){try{const r=W.BL_MATCH(t,s);return r?r.id:null}catch(e){return 'ГР'}}
// оценка на конкретна карта (без стая) — за диагностика
function отг(t,s){const id=mm(t,s);return id?id+' :: '+(T[id]||''):'ТИШИНА'}
module.exports={W,K,T,СТАИ,mm,отг};
if(require.main===module){
  const arg=process.argv[2];
  if(arg==='--файл'){
    const списък=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
    const из=[];
    for(const q of списък){
      const ред={в:q.в,стая:q.стая,очаква:q.очаква||null};
      ред.дадена=отг(q.в,q.стая);
      ред.всички={};
      for(const s of СТАИ){const id=mm(q.в,s); if(id) ред.всички[s]=id;}
      из.push(ред);
    }
    console.log(JSON.stringify(из,null,1));
  } else {
    console.log(отг(process.argv[2],process.argv[3]));
  }
}
