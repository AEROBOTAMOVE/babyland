'use strict';
const path=require('path');
const {zaredi}=require(path.join(path.resolve(__dirname,'..'),'dev/pyasachnik.js'));
const A=zaredi(null,{памет:{bl_baby:{birth:'2025-11-20'}}});
const KB=A.BL_KB||A.KB;
const баз={а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'c',ч:'ch',ш:'sh',щ:'sht',ь:'',ю:'yu',я:'ya'};
const прави=ъ=>s=>s.split('').map(c=>{const l=c.toLowerCase();return l==='ъ'?ъ:(баз[l]!==undefined?баз[l]:c);}).join('');
const цели=KB.entries.filter(e=>/^sn-|^x1-|^nm-|^mb5-/.test(e.id)&&/сън|спи|буди|дрям|дрем|нощ|залъгалк|ритуал|кошар/i.test(e.title));
for(const ъ of ['a','u','y']){
 const лат=прави(ъ); let общо=0,ок=0,друга=0,тих=0;
 for(const e of цели) for(const k of (e.keys||[]).slice(0,4)){
  if(k.length<12)continue; общо++;
  const b=A.BL_MATCH(лат(k),'Моето бебе');
  if(b&&b.id===e.id)ок++; else if(b)друга++; else тих++;
 }
 console.log('ъ → «'+ъ+'» :  своя '+String(ок).padStart(3)+'/'+общо+' ('+(100*ок/общо).toFixed(1)+'%)   чужда '+друга+'   тишина '+тих);
}
console.log('\nя → «ia» вместо «ya» (същият набор):');
{const лат=s=>s.split('').map(c=>{const l=c.toLowerCase();return l==='ъ'?'u':(l==='я'?'ia':(баз[l]!==undefined?баз[l]:c));}).join('');
 let общо=0,ок=0,друга=0,тих=0;
 for(const e of цели) for(const k of (e.keys||[]).slice(0,4)){if(k.length<12)continue;общо++;
  const b=A.BL_MATCH(лат(k),'Моето бебе');if(b&&b.id===e.id)ок++;else if(b)друга++;else тих++;}
 console.log('  своя '+ок+'/'+общо+' ('+(100*ок/общо).toFixed(1)+'%)   чужда '+друга+'   тишина '+тих);}
