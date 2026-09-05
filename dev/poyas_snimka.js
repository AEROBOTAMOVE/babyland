// ПОЯС: снимка на отговорите за фиксиран списък фрази. Само ЧЕТЕ.
// node dev/poyas_snimka.js изход.json
const fs=require('fs'); const path=require('path');
const {zaredi}=require(path.resolve(__dirname,'pyasachnik.js'));
const W=zaredi(null); const K=W.KB.entries;
const СТАИ=['Бременност','Моето бебе','Захранване','Здраве и SOS','Развитие и игри','Дневник на мама','Жената в мен','Инструменти'];
const списък=[];
// 1) корпусът от 350 (1016 изречения) — всяко в своята стая, или в „Моето бебе"
const корпус=JSON.parse(fs.readFileSync(path.join(__dirname,'korpus350.json'),'utf8'));
корпус.forEach(x=>списък.push([x.t, x.r||'Моето бебе']));
// 2) ключовете на ВСИЧКИ карти в стаите, които пипам (подава се като списък id-та)
const пипани=(process.argv[3]||'').split(',').filter(Boolean);
const m=new Map(K.map(z=>[z.id,z]));
for(const id of пипани){const z=m.get(id); if(!z){console.log('🔴 няма '+id);continue;} for(const k of z.keys) списък.push([k,z.room]);}
// 3) ръчният пояс от съседни въпроси
const p=path.join(__dirname,'nahodki','_poyas_vaprosi.json');
if(fs.existsSync(p)) JSON.parse(fs.readFileSync(p,'utf8')).forEach(x=>списък.push([x.в,x.стая]));
const из={};
for(const [t,s] of списък){ let r=null; try{r=W.BL_MATCH(t,s);}catch(e){r=null;} из[s+' ⟂ '+t]= r?r.id:'—'; }
fs.writeFileSync(process.argv[2], JSON.stringify(из,null,0));
console.log('запитвания '+списък.length+' · различни '+Object.keys(из).length);
