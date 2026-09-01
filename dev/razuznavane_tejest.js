// 🔭 РАЗУЗНАВАНЕ ЗА ПЛАНА — какво изобщо не е поглеждано
// Само мери. Нищо не пипа.
const fs = require('fs');
const К = 'C:/Users/User/Downloads/ЛОЦО/АПЛИКАЦИЯ ЗА БЕЙБИ ЛЕНД/babyland/';
const ч = (п) => fs.readFileSync(К + п, 'utf8');
const има = (п) => fs.existsSync(К + п);
const ред = (име, знак, текст) => console.log('  ' + знак + ' ' + име.padEnd(34) + текст);

const html = ч('index.html');

// ── 1. ТЕЖЕСТТА, КОЯТО МАЙКАТА ТЕГЛИ ──
console.log('');
console.log('═══ 1. КОЛКО ТЕГЛИ ПРИЛОЖЕНИЕТО ═══');
const скриптове = [...html.matchAll(/<script src="([^"?]+)/g)].map(m => m[1]);
const стилове = [...html.matchAll(/<link[^>]+href="([^"?]+\.css)/g)].map(m => m[1]);
let сборJS = 0, липсващи = [];
for (const s of скриптове) { if (има(s)) сборJS += fs.statSync(К + s).size; else липсващи.push(s); }
let сборCSS = 0;
for (const s of стилове) if (има(s)) сборCSS += fs.statSync(К + s).size;
ред('скриптове', скриптове.length > 60 ? '🔴' : '✅', скриптове.length + ' файла · ' + (сборJS / 1024).toFixed(0) + ' KB');
ред('стилове', '·', стилове.length + ' файла · ' + (сборCSS / 1024).toFixed(0) + ' KB');
ред('index.html', '·', (html.length / 1024).toFixed(0) + ' KB');
ред('липсващи скриптове', липсващи.length ? '🔴' : '✅', липсващи.length ? липсващи.join(' · ') : 'няма');
const общо = (сборJS + сборCSS + html.length) / 1024;
ред('ОБЩО за първо отваряне', общо > 1500 ? '🔴' : (общо > 800 ? '🟠' : '✅'), общо.toFixed(0) + ' KB (без картинки и шрифтове)');

// ── 2. SERVICE WORKER ──
console.log('');
console.log('═══ 2. SERVICE WORKER ═══');
const sw = ч('sw.js');
const вСписъка = [...new Set([...sw.matchAll(/['"]([^'"]*\.(?:js|css|html|json|png|svg|webp|ico|woff2?))(?:\?[^'"]*)?['"]/g)].map(m => m[1]))]
  .map(x => x.replace(/^\.?\//, '')).filter(Boolean);
const нямаГи = вСписъка.filter(x => !има(x));
ред('изброени файла', '·', вСписъка.length + '');
ред('изброени, но липсват', нямаГи.length ? '🔴' : '✅', нямаГи.length ? нямаГи.slice(0, 8).join(' · ') : 'няма');
const незакеширани = скриптове.filter(s => !вСписъка.some(x => x === s || x.endsWith('/' + s)));
ред('скриптове ИЗВЪН sw списъка', незакеширани.length ? '🟠' : '✅',
  незакеширани.length ? незакеширани.length + ' — офлайн може да не работят' : 'всички са вътре');

// ── 3. СПЕШНИТЕ ТЕЛЕФОНИ ──
console.log('');
console.log('═══ 3. СПЕШНИТЕ НОМЕРА (най-скъпото място за грешка) ═══');
const всичкоJS = скриптове.filter(има).map(ч).join('\n');
const libТекст = fs.readdirSync(К + 'lib').filter(f => /^[a-z0-9-]+\.json$/.test(f)).map(f => ч('lib/' + f)).join('\n');
const цяло = всичкоJS + libТекст + html;
for (const [ном, какво] of [['112', 'спешна помощ'], ['116 111', 'ДЕТСКА линия'], ['116111', 'ДЕТСКА линия слято'],
  ['0800 18 018', 'национална линия'], ['150', 'стара спешна']]) {
  const n = (цяло.match(new RegExp(ном.replace(/ /g, '\\s?'), 'g')) || []).length;
  ред('„' + ном + '" (' + какво + ')', n ? '·' : '🟠', n + ' срещания');
}

// ── 4. ЗАПИСИТЕ В ТЕЛЕФОНА НА МАЙКАТА ──
console.log('');
console.log('═══ 4. КЛЮЧОВЕ В LOCALSTORAGE ═══');
const клв = [...new Set([...всичкоJS.matchAll(/['"](bl_[a-z0-9_]+)['"]/g)].map(m => m[1]))];
ред('различни ключа', клв.length > 40 ? '🟠' : '·', клв.length + '');
console.log('     ' + клв.slice(0, 22).join(' · '));
if (клв.length > 22) console.log('     … и още ' + (клв.length - 22));
const мис = /bl_agent_miss/.test(всичкоJS);
ред('приложението ЗАПИСВА пропуските', мис ? '🟠' : '·',
  мис ? 'да — bl_agent_miss. НИКОЙ НЕ ГО Е ЧЕЛ.' : 'не');

// ── 5. КАРТИ, ДО КОИТО СЕ СТИГА САМО С ТЪРСЕНЕ ──
console.log('');
console.log('═══ 5. ДОСТИЖИМОСТ ═══');
const vm = require('vm');
const ctx = { console: { log() {}, warn() {} }, JSON, Math, Date, RegExp, String, Number, Array, Object };
ctx.window = ctx; ctx.self = ctx; vm.createContext(ctx);
new vm.Script(ч('js/kb.js')).runInContext(ctx);
const карти = ctx.KB.entries;
const сочени = new Set();
for (const z of карти) for (const c of (z.chips || [])) сочени.add(c);
const извънJS = new Set();
for (const z of карти) if (всичкоJS.indexOf("'" + z.id + "'") >= 0 || всичкоJS.indexOf('"' + z.id + '"') >= 0) извънJS.add(z.id);
const самоТърсене = карти.filter(z => !сочени.has(z.id) && !извънJS.has(z.id));
ред('карти общо', '·', карти.length + '');
ред('сочени от чип на друга карта', '·', сочени.size + '');
ред('НЕ се сочат отникъде', самоТърсене.length > 200 ? '🔴' : '🟠',
  самоТърсене.length + ' — стига се до тях САМО ако мама напише точния въпрос');

// ── 6. ГОЛЕМИТЕ ФАЙЛОВЕ, КОИТО НИКОЙ УРЕД НЕ ГЛЕДА ──
console.log('');
console.log('═══ 6. ГОЛЕМИ ФАЙЛОВЕ БЕЗ СВОЙ УРЕД ═══');
const уреди = fs.readdirSync(К + 'dev').filter(f => f.endsWith('.js') && !/ARCHIVE|PREDI|BAK/.test(f));
const всичкоУреди = уреди.map(f => ч('dev/' + f)).join('\n');
for (const f of скриптове.filter(има).sort((a, b) => fs.statSync(К + b).size - fs.statSync(К + a).size).slice(0, 14)) {
  const име = f.replace('js/', '');
  const спом = (всичкоУреди.match(new RegExp(име.replace('.', '\\.'), 'g')) || []).length;
  ред(f, спом ? '·' : '🟠', (fs.statSync(К + f).size / 1024).toFixed(0).padStart(4) + ' KB · споменат в уредите ' + спом + ' пъти');
}

// ── 7. ДОСТЪПНОСТ ──
console.log('');
console.log('═══ 7. ДОСТЪПНОСТ ═══');
const бутониHTML = (html.match(/<button/g) || []).length;
const ариа = (html.match(/aria-label=/g) || []).length;
const алт = (html.match(/<img/g) || []).length;
const алтИма = (html.match(/<img[^>]+alt=/g) || []).length;
ред('бутони в index.html', '·', бутониHTML + ' · с aria-label ' + ариа);
ред('картинки без alt', (алт - алтИма) ? '🟠' : '✅', (алт - алтИма) + ' от ' + алт);
ред('lang на страницата', /<html[^>]+lang="bg"/.test(html) ? '✅' : '🔴', /<html[^>]+lang="([^"]*)"/.exec(html)?.[1] || 'няма');
ред('viewport', /viewport/.test(html) ? '✅' : '🔴', /content="([^"]*width=device[^"]*)"/.exec(html)?.[1]?.slice(0, 50) || 'няма');
ред('prefers-reduced-motion', /prefers-reduced-motion/.test(fs.readdirSync(К + 'css').filter(f => f.endsWith('.css')).map(f => ч('css/' + f)).join('')) ? '✅' : '🟠', 'в CSS');

// ── 8. ДАННИТЕ ЗАД КАЛКУЛАТОРИТЕ ──
console.log('');
console.log('═══ 8. ДАННИ И КАЛКУЛАТОРИ ═══');
try {
  const c2 = { console: { log() {}, warn() {} }, JSON, Math, Date, RegExp, String, Number, Array, Object };
  c2.window = c2; c2.self = c2; vm.createContext(c2);
  for (const f of скриптове.filter(x => /data|expect|checkups|dates/.test(x)).filter(има)) {
    try { new vm.Script(ч(f)).runInContext(c2); } catch (e) {}
  }
  const D = c2.BL_DATA || {};
  for (const k of Object.keys(D)) {
    const v = D[k];
    ред('BL_DATA.' + k, '·', Array.isArray(v) ? v.length + ' записа' : typeof v);
  }
  if (!Object.keys(D).length) ред('BL_DATA', '🟠', 'не се зарежда извън браузър — иска проверка НА ЖИВО');
} catch (e) { ред('BL_DATA', '🟠', 'грешка: ' + e.message); }
console.log('');
