const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {zaredi,ROOT}=require(path.join(__dirname,'..','dev','pyasachnik.js'));
const P=path.join(ROOT,'js/helper.js'), S=fs.readFileSync(P,'utf8');
console.log('# md5:',crypto.createHash('md5').update(S).digest('hex'));
const A='const сцен = (function () {',B='\n        })();';
const i=S.indexOf(A),j=S.indexOf(B,i),тяло=S.slice(i+A.length,j);
const K='  window.BL_REDFLAG = isRedFlag;';
const W=zaredi(s=>s.replace(K,K+'\n  window.__СЦЕН=function(text){'+тяло+'\n};\n'),{памет:{bl_baby:{birth:'2025-11-20'}}});
if(W.__СЦЕН('задави се')!=='zadavi')throw new Error('сляп');
const R=fs.readFileSync(path.join(ROOT,'js/rooms6.js'),'utf8');
const ИМА=new Set();let m;const rx=/\{\s*id:\s*'([a-z]+)',\s*e:\s*'([^']*)',\s*t:\s*'([^']*)'/g;
while((m=rx.exec(R)))ИМА.add(m[1]);
for(const т of ['дави се във ваната','удави се във ваната','удави се','дави се в басейна','дави се във водата','детето се дави във ваната','давя го от водата']){
  const rf=!!W.BL_REDFLAG(т),с=W.__СЦЕН(т),e=W.BL_MATCH(т,'Здраве и SOS');
  const хв=rf&&с&&с!=='poglatnat'&&ИМА.has(с);
  console.log((хв?'🚑 ':'❌ ')+т.padEnd(30)+' флаг:'+(rf?'ДА':'не')+' сцен:'+String(с).padEnd(8)+' карта:'+(e?e.id+' («'+e.title+'»)':'няма'));
}
