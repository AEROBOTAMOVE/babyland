// временен ПОЯС: за всеки ключ на всяка карта — коя карта печели (в собствената ѝ стая)
// само ЧЕТЕ. Пише снимка в подадения файл.
const fs=require('fs'); const path=require('path');
const {zaredi}=require(path.resolve(__dirname,'pyasachnik.js'));
const W=zaredi(null); const K=W.KB.entries;
const из={};
for(const z of K){ for(const k of (z.keys||[])){
  let r=null; try{ r=W.BL_MATCH(k,z.room); }catch(e){}
  из[z.id+' ⟂ '+k] = (r?r.id:'—');
}}
fs.writeFileSync(process.argv[2], JSON.stringify(из));
const свои=Object.keys(из).filter(k=>из[k]===k.split(' ⟂ ')[0]).length;
console.log('ключове '+Object.keys(из).length+' · намират СВОЯТА карта '+свои);
