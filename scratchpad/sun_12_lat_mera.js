'use strict';
const path=require('path');
const {zaredi}=require(path.join(path.resolve(__dirname,'..'),'dev/pyasachnik.js'));
const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const KB=A.BL_KB||A.KB;
const М={а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'c',ч:'ch',ш:'sh',щ:'sht',ъ:'a',ь:'',ю:'yu',я:'ya'};
const лат=s=>s.split('').map(c=>М[c]!==undefined?М[c]:(М[c.toLowerCase()]!==undefined?М[c.toLowerCase()]:c)).join('');
// вземи КЛЮЧОВЕ на sn-* карти: те ТРЯБВА да намират своята карта
const цели=KB.entries.filter(e=>/^sn-|^x1-|^nm-|^mb5-/.test(e.id)&&/сън|спи|буди|дрям|дрем|нощ|залъгалк|ритуал|кошар/i.test(e.title));
let общо=0,кирОк=0,латОк=0,латДруга=0,латТишина=0;
const пример=[];
for(const e of цели){
  for(const k of (e.keys||[]).slice(0,4)){
    if(k.length<12) continue;
    общо++;
    const a=A.BL_MATCH(k,'Моето бебе');
    const l=лат(k), b=A.BL_MATCH(l,'Моето бебе');
    if(a&&a.id===e.id) кирОк++;
    if(b&&b.id===e.id) латОк++; else if(b){латДруга++; if(пример.length<12)пример.push([k,l,b.id+' «'+b.title+'»']);}
    else {латТишина++; if(пример.length<12)пример.push([k,l,'ТИШИНА']);}
  }
}
console.log('МЕРА НА ЛАТИНИЦАТА върху '+общо+' ИСТИНСКИ ключа от '+цели.length+' карти за сън');
console.log('  кирилица намира своята карта : '+кирОк+'/'+общо+'  ('+(100*кирОк/общо).toFixed(1)+'%)');
console.log('  латиница намира своята карта : '+латОк+'/'+общо+'  ('+(100*латОк/общо).toFixed(1)+'%)');
console.log('  латиница → ЧУЖДА карта       : '+латДруга);
console.log('  латиница → ТИШИНА            : '+латТишина);
console.log('\nпримери за провал:');
for(const [k,l,r] of пример) console.log('  «'+k+'»\n    → лат «'+l+'» → '+r);
