// dev/tejest2.js — МЕРКА А (бърза): точно кое се тегли, кога, и КОЛКО ПЪТИ.
// node dev/tejest2.js
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const ROOT = path.resolve(__dirname, '..');
const kb = n => (n/1024).toFixed(1);
const MB = n => (n/1048576).toFixed(2);
const cache = new Map();
function R(rel, brotli){
  const k = rel+'|'+!!brotli;
  if (cache.has(k)) return cache.get(k);
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) { cache.set(k,null); return null; }
  const buf = fs.readFileSync(p);
  const o = {rel, surov:buf.length, gz:zlib.gzipSync(buf,{level:9}).length,
             br: brotli ? zlib.brotliCompressSync(buf).length : null};
  cache.set(k,o); return o;
}
const html = fs.readFileSync(path.join(ROOT,'index.html'),'utf8');

// URL-ите ТОЧНО както ги иска страницата (с ?v=)
const stranicaURL = [];
let m;
const reS = /<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi;
while ((m=reS.exec(html))) stranicaURL.push({url:m[1], vid:'js'});
const reL = /<link\b[^>]*>/gi;
while ((m=reL.exec(html))){
  const t=m[0];
  const href=(t.match(/\bhref\s*=\s*["']([^"']+)["']/i)||[])[1];
  const rel =(t.match(/\brel\s*=\s*["']([^"']+)["']/i)||[])[1]||'';
  if(!href) continue;
  if (/stylesheet/i.test(rel)) stranicaURL.push({url:href, vid:'css'});
  else if (/preload/i.test(rel)) stranicaURL.push({url:href, vid:'preload'});
  else if (/icon|manifest/i.test(rel)) stranicaURL.push({url:href, vid:rel});
}
// шрифтовете, които css/fonts.css вика (те се теглят при рисуване)
const fcss = fs.readFileSync(path.join(ROOT,'css/fonts.css'),'utf8');
const fontURL = [...new Set((fcss.match(/url\(\s*["']?\.\.\/([^)"']+)["']?\s*\)/g)||[])
  .map(s=>s.replace(/url\(\s*["']?\.\.\//,'').replace(/["']?\s*\)$/,'')))];

// URL-ите ТОЧНО както ги иска service worker-ът
const sw = fs.readFileSync(path.join(ROOT,'sw.js'),'utf8');
const blok = sw.match(/const\s+ASSETS\s*=\s*\[([\s\S]*?)\];/);
const swURL = (blok[1].match(/'([^']+)'/g)||[]).map(s=>s.slice(1,-1));

const gol = u => u.split('?')[0];

console.log('=== А. ТЕЖЕСТТА — точна сметка ===\n');

// 1) ПЪРВО ОТВАРЯНЕ: какво страницата тегли
let s1=0,g1=0,b1=0;
const H=R('index.html',true); s1+=H.surov; g1+=H.gz; b1+=H.br;
const teg = [];
for (const x of stranicaURL){ const r=R(gol(x.url),true); if(!r){console.log('ЛИПСВА:',x.url);continue;}
  s1+=r.surov; g1+=r.gz; b1+=r.br; teg.push({...x, ...r}); }
// шрифтове: preload-натите вече са горе; другите се дърпат при нужда
const preloadGoli = new Set(stranicaURL.filter(x=>x.vid==='preload').map(x=>gol(x.url)));
let sF=0,gF=0;
for (const f of fontURL){ if(preloadGoli.has(f)) continue; const r=R(f); if(r){sF+=r.surov; gF+=r.gz;} }

console.log('1) СТРАНИЦАТА (index.html + 100 js + 14 css + 3 preload шрифта + икони/манифест):');
console.log('   сурово', kb(s1),'KB =', MB(s1),'MB | gzip', kb(g1),'KB | brotli', kb(b1),'KB');
console.log('   блокиращи скриптове (без defer/async):',
  (html.match(/<script\b[^>]*\bsrc[^>]*>/gi)||[]).filter(t=>!/\bdefer\b|\basync\b/i.test(t)).length);
console.log('   останалите 16 шрифта (теглят се при рисуване на латиница/курсив):',
  kb(sF),'KB сурово |', kb(gF),'KB gzip');
console.log('');

// 2) SERVICE WORKER-ЪТ веднага след това
let s2=0,g2=0; const lipsva=[];
for (const u of swURL){ if(u==='.'){continue;} const r=R(gol(u)); if(!r){lipsva.push(u);continue;} s2+=r.surov; g2+=r.gz; }
console.log('2) SERVICE WORKER-ЪТ (install → caches.add по един адрес):', swURL.length,'адреса');
console.log('   сурово', kb(s2),'KB =', MB(s2),'MB | gzip', kb(g2),'KB');
if (lipsva.length) console.log('   ЛИПСВАЩИ ФАЙЛОВЕ (ще паднат при install):', lipsva);
console.log('');

// 3) ДВОЙНОТО ТЕГЛЕНЕ
console.log('3) ⚠️ ДВОЙНО ТЕГЛЕНЕ — страницата иска "js/kb.js?v=161", SW иска "js/kb.js".');
console.log('   Различен URL = различен ключ в HTTP кеша = ВТОРО изтегляне по мрежата.');
const swSet = new Set(swURL.map(gol));
const swTochni = new Set(swURL);
let d_s=0,d_g=0; const dvojni=[];
for (const x of teg){
  const g = gol(x.url);
  if (!swSet.has(g)) continue;              // SW изобщо не го иска
  if (swTochni.has(x.url)) continue;        // SW го иска със СЪЩИЯ URL → един път
  d_s+=x.surov; d_g+=x.gz; dvojni.push({url:x.url, sw:g, surov:x.surov});
}
console.log('   файлове, изтеглени ДВА пъти:', dvojni.length);
console.log('   излишно изтеглени байтове: сурово', kb(d_s),'KB =', MB(d_s),'MB | gzip', kb(d_g),'KB');
console.log('   примери:', dvojni.slice(0,4).map(d=>d.url+'  ←→  '+d.sw));
console.log('');
console.log('   ⇒ ПЪРВО ОТВАРЯНЕ ОБЩО (страница + SW предкеш):');
console.log('     сурово', MB(s1+s2),'MB | gzip', MB(g1+g2),'MB');
console.log('     от тях ИЗЛИШНИ (същият файл втори път):', MB(d_s),'MB сурово /', MB(d_g),'MB gzip');
console.log('');

// 4) НАЙ-ТЕЖКИТЕ 15
console.log('=== НАЙ-ТЕЖКИТЕ 15 ФАЙЛА, КОИТО МАМА ТЕГЛИ ===');
const vsichkiTeg = new Map();
for (const x of teg) vsichkiTeg.set(gol(x.url), R(gol(x.url)));
for (const u of swURL){ if(u==='.')continue; const r=R(gol(u)); if(r) vsichkiTeg.set(gol(u), r); }
const red = [...vsichkiTeg.values()].sort((a,b)=>b.surov-a.surov);
const obshto = red.reduce((a,r)=>a+r.surov,0), obshtoG = red.reduce((a,r)=>a+r.gz,0);
red.slice(0,15).forEach((r,i)=>console.log(String(i+1).padStart(2)+'.',
  r.rel.padEnd(24), kb(r.surov).padStart(8)+' KB сурово |', kb(r.gz).padStart(7)+' KB gzip |',
  (r.surov/obshto*100).toFixed(1).padStart(4)+'% от всичко'));
console.log('   ОБЩО уникални файлове:', red.length, '|', MB(obshto),'MB сурово |', MB(obshtoG),'MB gzip');
console.log('');

// 5) lib/*.json — теглят се при install, но ползват ли се?
const lib = swURL.filter(u=>u.startsWith('lib/'));
let ls=0,lg=0; for(const u of lib){const r=R(u); if(r){ls+=r.surov;lg+=r.gz;}}
console.log('lib/*.json в предкеша:', lib.length, '|', MB(ls),'MB сурово |', kb(lg),'KB gzip');
console.log('   (js/lib.js ги дърпа МЪРЗЕЛИВО с ?v= при отваряне на библиотеката —');
console.log('    значи и те се теглят по ДВА пъти, ако мама отвори библиотеката)');
const LV = (fs.readFileSync(path.join(ROOT,'js/lib.js'),'utf8').match(/LV\s*=\s*['"]?([^'";\s]+)/)||[])[1];
console.log('   версията, с която lib.js ги иска: ?v=' + LV);
console.log('');

// 6) МЪРТВО НА ДИСКА
function obhod(dir,out){ for(const e of fs.readdirSync(dir,{withFileTypes:true})){
  if(e.name==='.git'||e.name==='__pycache__'||e.name.startsWith('$'))continue;
  const f=path.join(dir,e.name); if(e.isDirectory())obhod(f,out); else out.push(path.relative(ROOT,f).replace(/\\/g,'/'));} return out;}
const vs = obhod(ROOT,[]);
const mrtvi = vs.filter(f=>/\.(PREDI_|BAK_|ARCHIVE|S_DEFER)/i.test(path.basename(f))||/\.ARCHIVE\./i.test(path.basename(f)));
let ms=0; const mr=[]; for(const f of mrtvi){const st=fs.statSync(path.join(ROOT,f)); ms+=st.size; mr.push({f,s:st.size});}
console.log('=== МЪРТВИ КОПИЯ НА ДИСКА (НЕ се теглят от мама; тежат при качване/клониране) ===');
console.log('   брой:', mrtvi.length, '|', MB(ms),'MB');
mr.sort((a,b)=>b.s-a.s).slice(0,10).forEach(x=>console.log('     ', x.f.padEnd(42), kb(x.s).padStart(9),'KB'));
console.log('');
let ds=0; for(const f of vs.filter(f=>f.startsWith('dev/'))) ds+=fs.statSync(path.join(ROOT,f)).size;
console.log('   dev/ (инструменти):', MB(ds),'MB  ·  цялата папка:', MB(vs.reduce((a,f)=>a+fs.statSync(path.join(ROOT,f)).size,0)),'MB');

// 7) КАРТИНКА
const logo = R('img/logo.png');
console.log('');
console.log('=== КАРТИНКИ ===');
console.log('   img/logo.png', kb(logo.surov),'KB сурово |', kb(logo.gz),'KB gzip (PNG вече е компресиран — gzip не помага)');
const koiVika = [];
for (const d of ['js','css']) for (const f of fs.readdirSync(path.join(ROOT,d)))
  if (/\.(js|css)$/i.test(f) && !/\.(PREDI_|BAK_|ARCHIVE)/i.test(f)){
    const t = fs.readFileSync(path.join(ROOT,d,f),'utf8');
    if (/logo\.png/.test(t)) koiVika.push(d+'/'+f);
  }
if (/logo\.png/.test(html)) koiVika.push('index.html');
console.log('   кой изобщо споменава logo.png:', koiVika.length? koiVika.join(', ') : 'НИКОЙ ОСВЕН sw.js');
