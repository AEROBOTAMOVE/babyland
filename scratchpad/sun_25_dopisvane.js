'use strict';
const path=require('path'),fs=require('fs');
const {zaredi}=require(path.join(path.resolve(__dirname,'..'),'dev/pyasachnik.js'));
const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const KB=A.BL_KB||A.KB;
const зает=new Map();
for(const e of KB.entries) for(const k of (e.keys||[])){if(!зает.has(k))зает.set(k,[]);зает.get(k).push(e.id);}
const Ф=path.join(__dirname,'klyuchove_sun.json');
const J=JSON.parse(fs.readFileSync(Ф,'utf8'));
const ДОП={'x1-slagane-bez-budene':['буди се щом го сложа долу защо','защо се буди щом го сложа долу','хващам го на сън и го слагам но пак се буди','слагам го заспал и пак се буди','нося го заспал до леглото и се буди']};
let добавени=0;
for(const [id,ks] of Object.entries(ДОП)){
 J[id]=J[id]||[];
 for(const k of ks){
  if(зает.has(k)){console.log('ПРОПУСНАТ (зает от '+зает.get(k).join(',')+'): '+k);continue;}
  if(J[id].includes(k)){console.log('ПРОПУСНАТ (вече в предложението): '+k);continue;}
  J[id].push(k);добавени++;}
}
fs.writeFileSync(Ф,JSON.stringify(J,null,2),'utf8');
let бр=0;for(const v of Object.values(J))бр+=v.length;
console.log('добавени сега: '+добавени+' | общо в klyuchove_sun.json: '+бр+' ключа за '+Object.keys(J).length+' карти');
