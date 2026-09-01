// 🔭 РАЗУЗНАВАНЕ 6 — ОБЕЩАНИЯТА, СИРАЦИТЕ НА ФЛАГОВЕТЕ, ПАЗАЧИТЕ БЕЗ САМОПРОВЕРКА
// Само мери. Нищо не пипа.
const fs = require('fs');
const vm = require('vm');
const К = 'C:/Users/User/Downloads/ЛОЦО/АПЛИКАЦИЯ ЗА БЕЙБИ ЛЕНД/babyland/';
const ч = п => fs.readFileSync(К + п, 'utf8');
const ред = (име, знак, текст) => console.log('  ' + знак + ' ' + String(име).padEnd(42) + текст);

const html = ч('index.html');
const скр = [...html.matchAll(/<script src="(js\/[^"?]+)/g)].map(m => m[1]).filter(f => fs.existsSync(К + f));
const код = скр.map(ч).join('\n');

// ── 1. ОБЕЩАНИЕТО ЗА ПОВЕРИТЕЛНОСТ ──
console.log('');
console.log('═══ 1. „ОСТАВА НА ТВОЯ ТЕЛЕФОН" — вярно ли е ═══');
const външни = [...new Set([...(код + html).matchAll(/https?:\/\/([a-z0-9.-]+)/gi)].map(m => m[1].toLowerCase()))];
const свои = външни.filter(h => /localhost|127\.0\.0\.1|github\.io|aerobotamove/.test(h));
const чужди = външни.filter(h => !свои.includes(h));
ред('различни външни адреса в кода', чужди.length > 6 ? '🟠' : '·', чужди.length + '');
if (чужди.length) console.log('     ' + чужди.slice(0, 14).join(' · '));
for (const [име, r] of [['fetch(', /\bfetch\s*\(/g], ['XMLHttpRequest', /XMLHttpRequest/g],
  ['navigator.sendBeacon', /sendBeacon/g], ['WebSocket', /WebSocket/g],
  ['gtag/analytics/pixel', /gtag|analytics|fbq|pixel|_paq|mixpanel|sentry/gi],
  ['<img src=http', /<img[^>]+src=["']https?:/gi],
  ['@import външен', /@import\s+url\(["']?https?:/gi]]) {
  const n = ((код + html).match(r) || []).length;
  ред(име, n && !/fetch/.test(име) ? '🟠' : '·', n + ' срещания');
}
// къде точно се вика fetch
const fetchРедове = [];
for (const f of скр) {
  const t = ч(f).split(/\r?\n/);
  t.forEach((l, i) => { if (/\bfetch\s*\(/.test(l)) fetchРедове.push(f + ':' + (i + 1) + '  ' + l.trim().slice(0, 92)); });
}
if (fetchРедове.length) { console.log('     ── всяко fetch: ──'); for (const x of fetchРедове.slice(0, 10)) console.log('       ' + x); }

// ── 2. ШРИФТОВЕ И ВЪНШНИ ФАЙЛОВЕ ──
console.log('');
console.log('═══ 2. ШРИФТОВЕ И ВЪНШНИ ФАЙЛОВЕ (офлайн обещанието) ═══');
const css = fs.readdirSync(К + 'css').filter(f => f.endsWith('.css')).map(f => ч('css/' + f)).join('\n');
const шрифтURL = [...new Set([...css.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map(m => m[1]))];
const външниШр = шрифтURL.filter(u => /^https?:/.test(u));
ред('url() в CSS', '·', шрифтURL.length + '');
ред('от тях ВЪНШНИ', външниШр.length ? '🔴' : '✅', външниШр.length ? външниШр.join(' · ') : 'няма — всичко е местно');
const местни = шрифтURL.filter(u => !/^https?:|^data:/.test(u));
const липсват = местни.filter(u => !fs.existsSync(К + 'css/' + u.replace(/^\.\//, '')) && !fs.existsSync(К + u.replace(/^\//, '')));
ред('местни url(), които липсват', липсват.length ? '🔴' : '✅', липсват.length ? липсват.slice(0, 5).join(' · ') : 'няма');

// ── 3. ФЛАГ БЕЗ КАРТА ──
console.log('');
console.log('═══ 3. ФЛАГЪТ ГЪРМИ — ИМА ЛИ КАРТА ОТЗАД ═══');
const { zaredi } = require(К + 'dev/pyasachnik.js');
const W = zaredi(null);
const ctx = { console: { log() {}, warn() {} }, JSON, Math, Date, RegExp, String, Number, Array, Object };
ctx.window = ctx; ctx.self = ctx; vm.createContext(ctx);
new vm.Script(ч('js/kb.js')).runInContext(ctx);
const KB = ctx.KB;
const проба = (фрази, стая, флаг) => {
  let гърми = 0, безКарта = 0; const примери = [];
  for (const ф of фрази) {
    let f = false;
    try { f = флаг === 'preg' ? !!W.BL_PREGFLAG(ф, стая) : (флаг === 'mother' ? !!W.BL_MOTHERFLAG(ф) : !!W.BL_REDFLAG(ф)); } catch (e) {}
    if (!f) continue;
    гърми++;
    let к = null;
    try { const р = W.BL_MATCH(ф, стая); const з = Array.isArray(р) ? р[0] : (р && (р.entry || р.item || р)); к = з ? з.id : null; } catch (e) {}
    if (!к) { безКарта++; if (примери.length < 6) примери.push(ф); }
  }
  return { гърми, безКарта, примери };
};
for (const [име, поле, стая, вид] of [['redFlags', 'redFlags', 'Здраве и SOS', 'red'],
  ['pregFlags', 'pregFlags', 'Бременност', 'preg'],
  ['motherFlags', 'motherFlags', 'Дневник на мама', 'mother'],
  ['lossFlags', 'lossFlags', 'Бременност', 'preg']]) {
  const сп = (KB[поле] || []).filter(x => String(x).split(/\s+/).length >= 2).slice(0, 160);
  const r = проба(сп, стая, вид);
  ред(име + ' (извадка ' + сп.length + ')', r.безКарта > 20 ? '🟠' : '·',
    'гърмят ' + r.гърми + ' · БЕЗ карта отзад ' + r.безКарта);
  if (r.примери.length) console.log('       ' + r.примери.slice(0, 4).map(x => '„' + x + '"').join(' · '));
}

// ── 4. КАРТИ, ДО КОИТО НИКОЙ КЛЮЧ НЕ СТИГА ──
console.log('');
console.log('═══ 4. КАРТА, ДО КОЯТО СОБСТВЕНИЯТ Ѝ КЛЮЧ НЕ СТИГА ═══');
let недостижими = [];
for (const z of KB.entries) {
  const ключове = (z.keys || []).slice(0, 3);
  let стига = false;
  for (const k of ключове) {
    try { const р = W.BL_MATCH(k, z.room); const н = Array.isArray(р) ? р[0] : (р && (р.entry || р.item || р)); if (н && н.id === z.id) { стига = true; break; } } catch (e) {}
  }
  if (!стига && ключове.length) недостижими.push(z);
}
ред('карти, недостижими по първите си 3 ключа', недостижими.length > 20 ? '🟠' : '·', недостижими.length + ' от ' + KB.entries.length);
for (const z of недостижими.slice(0, 6)) console.log('     [' + z.room.slice(0, 12).padEnd(12) + '] ' + z.id.padEnd(22) + ' „' + String(z.title).slice(0, 36) + '"');

// ── 5. ПАЗАЧИ БЕЗ САМОПРОВЕРКА ──
console.log('');
console.log('═══ 5. ПАЗАЧИ БЕЗ САМОПРОВЕРКА ═══');
const уреди = fs.readdirSync(К + 'dev').filter(f => f.endsWith('.js') && !/ARCHIVE|PREDI|BAK/.test(f));
let сСамо = 0, безСамо = [];
for (const f of уреди) {
  const t = ч('dev/' + f);
  if (/самопроверк|САМОПРОВЕРК|примамк|подстав/.test(t)) сСамо++;
  else if (/process\.exit\(1\)/.test(t)) безСамо.push(f);
}
ред('уреди общо', '·', уреди.length + '');
ред('със самопроверка', '·', сСамо + '');
ред('гърмят, но БЕЗ самопроверка', безСамо.length > 25 ? '🟠' : '·', безСамо.length + '');
console.log('     ' + безСамо.slice(0, 12).join(' · '));

// ── 6. ЧЕТИРИТЕ СЛАБИ ОТГОВОРА ──
console.log('');
console.log('═══ 6. ЧЕТИРИТЕ „СЛАБИ ОТГОВОРА" ОТ СОНДАТА ═══');
try {
  const сонда = ч('dev/tarsene_bez_otgovor.js');
  const m = сонда.match(/const ВЪПРОСИ\s*=\s*\[([\s\S]*?)\];/);
  if (m) {
    const въпроси = [...m[1].matchAll(/'([^']{6,})'/g)].map(x => x[1]);
    let слаби = [];
    for (const в of въпроси) {
      try {
        const р = W.BL_MATCH(в, 'Здраве и SOS');
        const з = Array.isArray(р) ? р[0] : (р && (р.entry || р.item || р));
        if (!з) слаби.push(в);
      } catch (e) {}
    }
    ред('въпроси в сондата', '·', въпроси.length + '');
    ред('без карта в стая Здраве', '·', слаби.length + '');
  } else ред('не намирам списъка ВЪПРОСИ', '🟠', 'сондата ги държи другаде');
} catch (e) { ред('грешка', '🟠', e.message); }
console.log('');
