// dev/tejest.js — МЕРКА А: колко тежи приложението и КОГА се тегли кое.
// Пуска се: node dev/tejest.js
// Мери СУРОВ размер + gzip + brotli (реалната цена по мобилен интернет).
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const ROOT = path.resolve(__dirname, '..');

const MRTAV = /\.(PREDI_[^.\\/]*|BAK_[^.\\/]*|ARCHIVE|S_DEFER_APPLIED|S_DEFER_ZA_PROVERKA)(\.[a-z]+)?$/i;
function jivFail(p){
  const b = path.basename(p);
  if (/\.(PREDI|BAK|ARCHIVE|S_DEFER)/i.test(b)) return false;
  if (/\.ARCHIVE\./i.test(b)) return false;
  return true;
}

function razmer(rel){
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) return null;
  const buf = fs.readFileSync(p);
  return {
    rel, surov: buf.length,
    gz: zlib.gzipSync(buf, {level:9}).length,
    br: zlib.brotliCompressSync(buf).length
  };
}

const html = fs.readFileSync(path.join(ROOT,'index.html'),'utf8');

// ---------- 1. Какво index.html дърпа ----------
const scripts = [];
const reS = /<script\b([^>]*)>/gi; let m;
while ((m = reS.exec(html))) {
  const attrs = m[1];
  const src = (attrs.match(/\bsrc\s*=\s*["']([^"']+)["']/i)||[])[1];
  if (!src) continue;
  scripts.push({
    src: src.split('?')[0],
    defer: /\bdefer\b/i.test(attrs),
    async: /\basync\b/i.test(attrs),
    red: html.slice(0, m.index).split('\n').length
  });
}
const links = [];
const reL = /<link\b([^>]*)>/gi;
while ((m = reL.exec(html))) {
  const attrs = m[1];
  const href = (attrs.match(/\bhref\s*=\s*["']([^"']+)["']/i)||[])[1];
  if (!href) continue;
  const rel = (attrs.match(/\brel\s*=\s*["']([^"']+)["']/i)||[])[1] || '';
  links.push({href: href.split('?')[0], rel, red: html.slice(0,m.index).split('\n').length});
}
const imgs = [];
const reI = /<img\b([^>]*)>/gi;
while ((m = reI.exec(html))) {
  const src = (m[1].match(/\bsrc\s*=\s*["']([^"']+)["']/i)||[])[1];
  if (src) imgs.push({src: src.split('?')[0], red: html.slice(0,m.index).split('\n').length});
}

// ---------- 2. Какво service worker-ът предкешира ----------
let swAssets = [];
try{
  const sw = fs.readFileSync(path.join(ROOT,'sw.js'),'utf8');
  const blok = sw.match(/const\s+ASSETS\s*=\s*\[([\s\S]*?)\];/);
  if (blok) swAssets = (blok[1].match(/'([^']+)'/g)||[]).map(s=>s.slice(1,-1));
}catch(e){}

// ---------- 3. Всички ЖИВИ файлове на диска (дърво) ----------
function obhod(dir, out){
  for (const e of fs.readdirSync(dir, {withFileTypes:true})){
    if (e.name === '.git' || e.name === '__pycache__' || e.name.startsWith('$')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) obhod(full, out);
    else out.push(path.relative(ROOT, full).replace(/\\/g,'/'));
  }
  return out;
}
const vsichki = obhod(ROOT, []);

// ---------- ИЗХОД ----------
const kb = n => (n/1024).toFixed(1);
function sumi(list){
  let s=0,g=0,b=0, lipsvashti=[];
  const redove=[];
  for (const rel of list){
    const r = razmer(rel);
    if (!r) { lipsvashti.push(rel); continue; }
    s+=r.surov; g+=r.gz; b+=r.br; redove.push(r);
  }
  return {s,g,b,redove,lipsvashti};
}

const srcSkript = scripts.map(x=>x.src);
const srcCss = links.filter(l=>/stylesheet/i.test(l.rel)).map(l=>l.href);
const srcPreload = links.filter(l=>/preload/i.test(l.rel)).map(l=>l.href);

console.log('=== А. ТЕЖЕСТТА ===\n');
console.log('index.html сам по себе си:', JSON.stringify(razmer('index.html')));
console.log('');
console.log('СКРИПТОВЕ в index.html:', scripts.length, '| без defer/async (блокиращи):',
  scripts.filter(x=>!x.defer&&!x.async).length);
const S = sumi(srcSkript);
console.log('  сурово', kb(S.s),'KB | gzip', kb(S.g),'KB | brotli', kb(S.b),'KB');
if (S.lipsvashti.length) console.log('  ЛИПСВАЩИ ФАЙЛОВЕ:', S.lipsvashti);
console.log('');
console.log('CSS в index.html:', srcCss.length);
const C = sumi(srcCss);
console.log('  сурово', kb(C.s),'KB | gzip', kb(C.g),'KB | brotli', kb(C.b),'KB');
if (C.lipsvashti.length) console.log('  ЛИПСВАЩИ:', C.lipsvashti);
console.log('');
console.log('PRELOAD:', srcPreload);
const P = sumi(srcPreload);
console.log('  сурово', kb(P.s),'KB | gzip', kb(P.g),'KB');
console.log('');
console.log('IMG тагове в index.html:', JSON.stringify(imgs));
console.log('');
const H = razmer('index.html');
console.log('>>> ПЪРВО ОТВАРЯНЕ (html+css+js+preload):');
console.log('    сурово', kb(H.surov+S.s+C.s+P.s),'KB');
console.log('    gzip  ', kb(H.gz+S.g+C.g+P.g),'KB');
console.log('    brotli', kb(H.br+S.b+C.b+P.b),'KB');
console.log('');

// SW
const SW = sumi(swAssets.filter(a=>a!=='.'&&a!=='index.html'));
console.log('SW ASSETS (предкеш след първо отваряне):', swAssets.length, 'записа');
console.log('  сурово', kb(SW.s),'KB | gzip', kb(SW.g),'KB');
if (SW.lipsvashti.length) console.log('  ЛИПСВАЩИ В SW СПИСЪКА (404 при install → цялата инсталация пада):', SW.lipsvashti);
const vHtmlNeVSw = srcSkript.concat(srcCss).filter(x=>!swAssets.includes(x));
console.log('  Дърпани от index.html, но НЕ в SW списъка (няма офлайн):', vHtmlNeVSw.length, vHtmlNeVSw);
const vSwNeVHtml = swAssets.filter(a=>a!=='.'&&a!=='index.html'&&!srcSkript.includes(a)&&!srcCss.includes(a)&&!/\.(woff2|json|png|svg|webmanifest)$/i.test(a));
console.log('  В SW списъка, но НЕ дърпани от index.html (изтегля се напразно):', vSwNeVHtml.length, vSwNeVHtml);
console.log('');

// lib/*.json
const libJivi = vsichki.filter(f=>f.startsWith('lib/') && f.endsWith('.json') && jivFail(f));
const L = sumi(libJivi);
console.log('lib/*.json ЖИВИ:', libJivi.length, '| сурово', kb(L.s), 'KB | gzip', kb(L.g),'KB');
console.log('  в SW списъка:', libJivi.filter(f=>swAssets.includes(f)).length);
console.log('');

// ---------- НАЙ-ТЕЖКИТЕ ----------
console.log('=== НАЙ-ТЕЖКИТЕ 25 ЖИВИ ФАЙЛА, КОИТО СЕ ТЕГЛЯТ ===');
const teglenite = new Set([...srcSkript, ...srcCss, ...srcPreload, ...swAssets.filter(a=>a!=='.'), 'index.html']);
const spisak = [...teglenite].map(razmer).filter(Boolean).sort((a,b)=>b.surov-a.surov);
spisak.slice(0,25).forEach((r,i)=>console.log(
  String(i+1).padStart(2), r.rel.padEnd(30), kb(r.surov).padStart(9),'KB сурово |',
  kb(r.gz).padStart(8),'KB gzip |', kb(r.br).padStart(8),'KB brotli'));
console.log('');
const obshtoT = spisak.reduce((a,r)=>a+r.surov,0);
const obshtoG = spisak.reduce((a,r)=>a+r.gz,0);
console.log('ОБЩО ТЕГЛЕНО (html+css+js+шрифт+икони+lib в SW):', kb(obshtoT),'KB сурово |', kb(obshtoG),'KB gzip');
console.log('');

// ---------- МЪРТВО ТЕГЛО НА ДИСКА ----------
console.log('=== МЪРТВИ КОПИЯ НА ДИСКА (не се теглят, но пътуват в хранилището) ===');
const mrtvi = vsichki.filter(f=>!jivFail(f));
const M = sumi(mrtvi);
console.log('брой:', mrtvi.length, '| сурово', kb(M.s),'KB =', (M.s/1048576).toFixed(2),'MB');
M.redove.sort((a,b)=>b.surov-a.surov).slice(0,12).forEach(r=>console.log('   ', r.rel.padEnd(45), kb(r.surov).padStart(9),'KB'));
console.log('');

// ---------- ФАЙЛОВЕ, КОИТО НИКОЙ НЕ ДЪРПА ----------
console.log('=== ЖИВИ ФАЙЛОВЕ, КОИТО НИКОЙ НЕ ДЪРПА ===');
const nedrupnati = vsichki.filter(f=>jivFail(f) && !teglenite.has(f)
  && !f.startsWith('dev/') && !f.startsWith('.claude/')
  && !/\.(md|py|gitignore)$/i.test(f) && f!=='sw.js' && f!=='manifest.webmanifest');
const N = sumi(nedrupnati);
console.log('брой:', nedrupnati.length, '| сурово', kb(N.s),'KB');
N.redove.sort((a,b)=>b.surov-a.surov).forEach(r=>console.log('   ', r.rel.padEnd(45), kb(r.surov).padStart(9),'KB'));
console.log('');
console.log('dev/ папка (инструменти, не се дърпат):', kb(sumi(vsichki.filter(f=>f.startsWith('dev/'))).s),'KB');
