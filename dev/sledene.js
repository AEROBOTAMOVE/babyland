// dev/sledene.js — МЕРКА Б: излиза ли нещо навън от приложението.
// node dev/sledene.js
// Обхожда index.html + всички ЖИВИ js/*.js + sw.js + manifest + css/*.css + lib/*.json
// и търси ВСЯКА мрежова врата и ВСЯКО външно име на хост.
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');

function jiv(b){ return !/\.(PREDI_|BAK_|ARCHIVE|S_DEFER)/i.test(b) && !/\.ARCHIVE\./i.test(b); }

const faylove = ['index.html','sw.js','manifest.webmanifest'];
for (const d of ['js','css','lib']){
  const dir = path.join(ROOT,d);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) if (jiv(f) && /\.(js|css|json|webmanifest)$/i.test(f)) faylove.push(d+'/'+f);
}

// --- ВРАТИТЕ: всяко нещо, което може да проговори навън ---
const VRATI = [
  ['fetch(',              /\bfetch\s*\(/g],
  ['XMLHttpRequest',      /XMLHttpRequest/g],
  ['sendBeacon',          /sendBeacon/g],
  ['WebSocket',           /\bWebSocket\b/g],
  ['EventSource',         /\bEventSource\b/g],
  ['importScripts',       /\bimportScripts\s*\(/g],
  ['динамичен import()',  /[^.\w]import\s*\(/g],
  ['new Image()',         /new\s+Image\s*\(/g],
  ['createElement(script/iframe/link)', /createElement\s*\(\s*["'](script|iframe|link)["']/gi],
  ['<form action=',       /<form[^>]*\baction\s*=/gi],
  ['geolocation',         /navigator\s*\.\s*geolocation/g],
  ['window.open',         /\bwindow\s*\.\s*open\s*\(/g],
  ['location = / assign / replace', /\blocation\s*(\.\s*(href|assign|replace)\s*[=(]|=\s*["'])/g],
  ['броячи (gtag/fbq/ga/…)', /\b(gtag|fbq|dataLayer|_paq|amplitude|mixpanel|posthog|Sentry|clarity|hotjar|yandexMetrika|ym)\s*\(/g],
  ['CSS @import',         /@import\s+(url\s*\()?["']/gi],
  ['CSS url(http)',       /url\s*\(\s*["']?(https?:)?\/\//gi],
];

// --- АБСОЛЮТНИ АДРЕСИ: всяка схема + протокол-относителен //хост ---
const RE_URL   = /\b(?:https?|wss?|ftp):\/\/[^\s"'`)>\]}\\]+/gi;
const RE_PROTO = /(?:^|[^:\w.\/])(\/\/[a-z0-9][a-z0-9.-]*\.[a-z]{2,}(?:[\/:?#][^\s"'`)>\]}]*)?)/gi;
// --- ГОЛИ ИМЕНА НА ХОСТ без протокол (analytics.google.com, cdn.jsdelivr.net …) ---
const RE_HOST  = /\b[a-z0-9][a-z0-9-]{0,60}(?:\.[a-z0-9-]{1,60})*\.(?:com|net|org|io|dev|app|eu|ru|co|xyz|cloud|me|info|gov|edu|ai|cn|de|fr|uk)\b/gi;
// „bg" отделно, защото има български думи, но го проверяваме
const RE_HOST_BG = /\b[a-z0-9][a-z0-9-]{2,60}(?:\.[a-z0-9-]{1,60})*\.bg\b/gi;

// --- ТАГОВЕ С ВЪНШЕН АДРЕС ---
const RE_TAG = /<(?:img|script|link|iframe|source|video|audio|embed|object|track|a|use|image)\b[^>]*?\b(?:src|href|data|xlink:href|srcset)\s*=\s*["'](?:https?:|\/\/|ftp:)[^"']*["'][^>]*>/gi;

function red(txt, idx){ return txt.slice(0,idx).split('\n').length; }
function komentar(line){ const t=(line||'').trim(); return t.startsWith('//')||t.startsWith('*')||t.startsWith('/*')||t.startsWith('#')||t.startsWith('<!--'); }

function skanirai(txt){
  const out = {vrati:[], url:[], host:[], tag:[]};
  const linii = txt.split('\n');
  for (const [ime, re] of VRATI){
    re.lastIndex = 0; let m;
    while ((m = re.exec(txt))){
      const r = red(txt, m.index);
      out.vrati.push({red:r, vrata:ime, kod:(linii[r-1]||'').trim().slice(0,190), kom:komentar(linii[r-1])});
    }
  }
  RE_URL.lastIndex=0; let m;
  while ((m = RE_URL.exec(txt))){ const r=red(txt,m.index);
    out.url.push({red:r, adres:m[0].trim(), kod:(linii[r-1]||'').trim().slice(0,190), kom:komentar(linii[r-1])}); }
  RE_PROTO.lastIndex=0;
  while ((m = RE_PROTO.exec(txt))){ const r=red(txt,m.index);
    out.url.push({red:r, adres:m[1].trim(), kod:(linii[r-1]||'').trim().slice(0,190), kom:komentar(linii[r-1])}); }
  for (const re of [RE_HOST, RE_HOST_BG]){
    re.lastIndex=0;
    while ((m = re.exec(txt))){ const r=red(txt,m.index);
      out.host.push({red:r, host:m[0], kod:(linii[r-1]||'').trim().slice(0,190), kom:komentar(linii[r-1])}); }
  }
  RE_TAG.lastIndex=0;
  while ((m = RE_TAG.exec(txt))){ const r=red(txt,m.index);
    out.tag.push({red:r, tag:m[0].slice(0,200)}); }
  return out;
}

const V=[], U=[], HH=[], T=[];
for (const rel of faylove){
  let txt; try{ txt = fs.readFileSync(path.join(ROOT,rel),'utf8'); }catch(e){ continue; }
  const s = skanirai(txt);
  s.vrati.forEach(x=>V.push({fayl:rel,...x}));
  s.url  .forEach(x=>U.push({fayl:rel,...x}));
  s.host .forEach(x=>HH.push({fayl:rel,...x}));
  s.tag  .forEach(x=>T.push({fayl:rel,...x}));
}

console.log('=== Б. СЛЕДЕНЕТО ===');
console.log('Прегледани ЖИВИ файла:', faylove.length,
  '| js:', faylove.filter(f=>f.startsWith('js/')).length,
  '| css:', faylove.filter(f=>f.startsWith('css/')).length,
  '| lib:', faylove.filter(f=>f.startsWith('lib/')).length);
console.log('');

console.log('--- 1. МРЕЖОВИ ВРАТИ ---');
const poVrata = {};
for (const n of V) (poVrata[n.vrata] ||= []).push(n);
for (const k of Object.keys(poVrata)) console.log('   ', k, '=', poVrata[k].length);
console.log('');
for (const k of Object.keys(poVrata)){
  console.log('  ### '+k+' ('+poVrata[k].length+')');
  for (const n of poVrata[k]) console.log('     ', (n.kom?'[коментар] ':'') + n.fayl+':'+n.red, '|', n.kod);
}
console.log('');

console.log('--- 2. АБСОЛЮТНИ АДРЕСИ (http/https/ws/wss/ftp/// ) ---  брой:', U.length);
const g1 = {};
for (const n of U){ const h = n.adres.replace(/^[a-z]+:/i,'').replace(/^\/\//,'').split(/[\/:?#]/)[0]; (g1[h] ||= []).push(n); }
for (const h of Object.keys(g1).sort()){
  console.log('  ### ХОСТ: '+h+'  ('+g1[h].length+')');
  for (const n of g1[h].slice(0,6)) console.log('     ', (n.kom?'[коментар] ':'')+n.fayl+':'+n.red,'|', n.adres,'|', n.kod.slice(0,110));
  if (g1[h].length>6) console.log('      ... още', g1[h].length-6);
}
console.log('');

console.log('--- 3. ГОЛИ ИМЕНА НА ХОСТ (без протокол) ---  брой:', HH.length);
const g2 = {};
for (const n of HH) (g2[n.host.toLowerCase()] ||= []).push(n);
for (const h of Object.keys(g2).sort()){
  console.log('  ### '+h+'  ('+g2[h].length+')  напр.', g2[h][0].fayl+':'+g2[h][0].red, '|', g2[h][0].kod.slice(0,110));
}
console.log('');

console.log('--- 4. ТАГОВЕ С ВЪНШЕН АДРЕС ---  брой:', T.length);
for (const n of T) console.log('     ', n.fayl+':'+n.red, '|', n.tag);
console.log('');

// ================= ПРИМАМКА =================
console.log('=== ПРИМАМКА: доказвам, че уредът ВИЖДА ===');
const primamkaJS = `
fetch("https://analitika.example-tracker.com/sabirai?bebe=" + imeNaBebeto);
var x = new XMLHttpRequest(); x.open("POST","http://sledi.me/lug");
navigator.sendBeacon("//pixel.facebook.com/tr", dnevnik);
new WebSocket("wss://socket.zloto.net/kanal");
new EventSource("https://stream.zloto.net/sse");
gtag('event','majka_otvori');
var s = document.createElement('script'); s.src = 'cdn.jsdelivr.net/npm/nqkoj';
navigator.geolocation.getCurrentPosition(f);
window.open('https://kudeto.si');
`;
const primamkaHTML = `<img src="https://www.google-analytics.com/collect?v=1" width="1">
<script src="//cdn.jsdelivr.net/npm/nqkoj"></` + `script>
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Nunito">
<iframe src="http://reklama.example.org/f"></iframe>
<form action="https://forma.example.net/post"></form>`;
const primamkaCSS = `body{background:url(https://cdn.example.io/fon.png)} @import "https://chuzhdo.example.com/a.css";`;

function pokazhi(txt, ime){
  const s = skanirai(txt);
  console.log('  ['+ime+']');
  console.log('     врати :', s.vrati.length, '→', [...new Set(s.vrati.map(x=>x.vrata))].join(' · ') || 'НУЛА');
  console.log('     адреси:', s.url.length, '→', [...new Set(s.url.map(x=>x.adres))].join(' · ') || 'НУЛА');
  console.log('     хостове голи:', [...new Set(s.host.map(x=>x.host))].join(' · ') || 'НУЛА');
  console.log('     тагове:', s.tag.length);
  return s;
}
const a = pokazhi(primamkaJS,  'JS примамка (9 нарочни дефекта)');
const b = pokazhi(primamkaHTML,'HTML примамка (5 нарочни тага)');
const c = pokazhi(primamkaCSS, 'CSS примамка (2 нарочни)');

const proverki = [
  ['JS врати ≥ 8',        [...new Set(a.vrati.map(x=>x.vrata))].length >= 8],
  ['JS адреси ≥ 6',       [...new Set(a.url.map(x=>x.adres))].length >= 6],
  ['JS гол хост хванат',  a.host.some(x=>/jsdelivr/.test(x.host))],
  ['HTML тагове ≥ 4',     b.tag.length >= 4],
  ['HTML form action',    b.vrati.some(x=>x.vrata==='<form action=')],
  ['CSS url(http)',       c.vrati.some(x=>x.vrata==='CSS url(http)')],
  ['CSS @import',         c.vrati.some(x=>x.vrata==='CSS @import')],
];
let vsichki = true;
for (const [ime, ok] of proverki){ console.log('     ', ok?'ГРЪМНА ✔':'МЪЛЧИ ✘', ime); if(!ok) vsichki=false; }
console.log('  >>> МЯРКАТА ВИЖДА:', vsichki ? 'ДА — нулата по-горе е ДОКАЗАНА нула' : 'НЕ — уредът е сляп, находките му не важат');
