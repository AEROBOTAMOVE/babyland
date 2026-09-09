// 🧵 ВТОРАТА МЯРКА: наистина ли трябва РАЗЦЕПВАНЕ?
//
// Първата мярка (dev/ot_kakvo_e_kb.js) показа, че изнасянето на ключовете
// в отделен файл прави ОБЩОТО тегло +10 КБ, не по-малко. Значи въпросът
// „как да разцепим" е грешният въпрос. Верният е: ЗАЩО 5.46 МБ текст се
// стиска само до 1296 КБ?
//
// Отговорът е в прозореца на gzip: 32 КБ. Файлът е 5.46 МБ и повтаря едни
// и същи изрази през мегабайти разстояние — gzip просто НЕ ГИ ВИЖДА.
// brotli има прозорец до 16 МБ. Тук се мери разликата.
const fs = require('fs');
const zlib = require('zlib');
const кб = n => (n / 1024).toFixed(0) + ' КБ';

const файлове = ['js/kb.js', 'js/helper.js', 'js/rooms2.js', 'js/rooms3.js', 'css/rooms.css', 'index.html'];
const gz = b => zlib.gzipSync(b, { level: 9 }).length;
const br = (b, прозорец) => zlib.brotliCompressSync(b, {
  params: {
    [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
    [zlib.constants.BROTLI_PARAM_SIZE_HINT]: b.length,
    [zlib.constants.BROTLI_PARAM_LGWIN]: прозорец,
  },
});

console.log('');
console.log('🧵 GZIP срещу BROTLI (нищо в кода не се пипа — това е как СЕ СЕРВИРА)');
console.log('');
console.log('    файл                сурово       gzip     brotli-22   печалба');
console.log('    ' + '─'.repeat(64));
let сумаГз = 0, сумаБр = 0;
for (const f of файлове) {
  if (!fs.existsSync(f)) continue;
  const b = fs.readFileSync(f);
  const g = gz(b), r = br(b, 22).length;
  сумаГз += g; сумаБр += r;
  console.log('    ' + f.padEnd(20) + кб(b.length).padStart(8) + кб(g).padStart(11) + кб(r).padStart(12)
    + ('  −' + (100 * (g - r) / g).toFixed(0) + '%').padStart(10));
}
console.log('    ' + '─'.repeat(64));
console.log('    ' + 'общо тези'.padEnd(20) + ''.padStart(8) + кб(сумаГз).padStart(11) + кб(сумаБр).padStart(12)
  + ('  −' + кб(сумаГз - сумаБр)).padStart(12));
console.log('');

// ── защо: прозорецът ────────────────────────────────────────────────────
const kb = fs.readFileSync('js/kb.js');
console.log('    ── ЗАЩО: ПРОЗОРЕЦЪТ ──');
console.log('       js/kb.js е ' + кб(kb.length) + ' и повтаря изрази през мегабайти.');
for (const w of [16, 18, 20, 22, 24]) {
  const r = br(kb, w).length;
  console.log('       brotli с прозорец 2^' + w + ' (' + кб(Math.pow(2, w)) + ')   → ' + кб(r));
}
console.log('       gzip (прозорец 32 КБ, закован)      → ' + кб(gz(kb)));
console.log('');

// ── и трето: помага ли ПОДРЕЖДАНЕТО (същият gzip, друг ред) ────────────
const { zaredi } = require('./pyasachnik.js');
const W = zaredi(null);
const карти = (W.BL_KB || W.KB).entries || [];
const текст = е => [е.id, е.room, е.title || е.t, е.core, е.tip, е.follow, (е.keys || []).join('|')].join('\n');
const както_е = карти.map(текст).join('\n');
const по_стая = карти.slice().sort((a, b) => String(a.room).localeCompare(String(b.room)) || String(a.id).localeCompare(String(b.id))).map(текст).join('\n');
console.log('    ── ПОМАГА ЛИ САМО ПРЕПОДРЕЖДАНЕТО (без нищо друго) ──');
console.log('       както са сега, gzip           ' + кб(gz(Buffer.from(както_е))));
console.log('       подредени по стая, gzip       ' + кб(gz(Buffer.from(по_стая))));
console.log('');

// ── четвърто: колко от текста е ДУБЛИРАН между картите ─────────────────
const редове = [];
for (const е of карти) for (const п of ['core', 'tip', 'follow']) if (е[п]) редове.push(String(е[п]));
const уник = new Set(редове);
console.log('    ── ДУБЛИРАН ТЕКСТ МЕЖДУ КАРТИТЕ ──');
console.log('       полета core/tip/follow: ' + редове.length + ' · уникални: ' + уник.size
  + ' · буквално повторени: ' + (редове.length - уник.size));
console.log('');
