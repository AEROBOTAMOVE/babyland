// 🔭 РАЗУЗНАВАНЕ 4 — ЕЗИКЪТ И ВЪТРЕШНИТЕ ПРОТИВОРЕЧИЯ. Само мери.
const fs = require('fs');
const vm = require('vm');
const К = 'C:/Users/User/Downloads/ЛОЦО/АПЛИКАЦИЯ ЗА БЕЙБИ ЛЕНД/babyland/';
const ч = п => fs.readFileSync(К + п, 'utf8');
const ред = (име, знак, текст) => console.log('  ' + знак + ' ' + String(име).padEnd(42) + текст);

const ctx = { console: { log() {}, warn() {} }, JSON, Math, Date, RegExp, String, Number, Array, Object };
ctx.window = ctx; ctx.self = ctx; vm.createContext(ctx);
new vm.Script(ч('js/kb.js')).runInContext(ctx);
const карти = ctx.KB.entries;
const гол = h => String(h || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const цял = z => гол(z.core) + ' ' + гол(z.tip) + ' ' + гол(z.follow);
const libТела = {};
for (const f of fs.readdirSync(К + 'lib').filter(f => /^[a-z0-9-]+\.json$/.test(f) && f !== 'index.json'))
  Object.assign(libТела, JSON.parse(ч('lib/' + f)));

// ── 1. ДЪЛГИТЕ ИЗРЕЧЕНИЯ ──
console.log('');
console.log('═══ 1. КОЛКО ДЪЛГО Е ЕДНО ИЗРЕЧЕНИЕ ═══');
const изр = т => т.split(/(?<=[.!?·])\s+/).filter(x => x.trim().length > 3);
const думиВ = s => (s.match(/[а-яА-Яa-zA-Z]+/g) || []).length;
const всичкиИзр = [];
for (const z of карти) for (const s of изр(цял(z))) всичкиИзр.push({ z, s, n: думиВ(s) });
всичкиИзр.sort((a, b) => a.n - b.n);
const сред = всичкиИзр[Math.floor(всичкиИзр.length / 2)].n;
ред('изречения в картите', '·', всичкиИзр.length + '');
ред('средна дължина', сред > 20 ? '🟠' : '·', сред + ' думи');
const дълги = всичкиИзр.filter(x => x.n > 35);
ред('над 35 думи (труден за уморена майка)', дълги.length > 60 ? '🟠' : '·', дълги.length + '');
for (const x of дълги.slice(-4)) console.log('     ' + x.n + ' думи  [' + x.z.id.slice(0, 20).padEnd(20) + '] „' + x.s.slice(0, 74) + '…"');

// ── 2. МЕДИЦИНСКИ ДУМИ БЕЗ ОБЯСНЕНИЕ ──
console.log('');
console.log('═══ 2. ЧУЖДИ ДУМИ — ОБЯСНЕНИ ЛИ СА ПРИ ПЪРВА УПОТРЕБА ═══');
const ЖАРГОН = ['диастаза', 'холестаза', 'персентил', 'рефлукс', 'колостр', 'лохи', 'епизиотом',
  'преeклампс', 'прееклампс', 'крипторх', 'хидроцеле', 'ингвинал', 'фебрил', 'ларингит',
  'бронхиолит', 'отит', 'импетиго', 'атопич', 'екзем', 'урти', 'сепсис', 'менинг', 'ботулиз',
  'гастроезофаг', 'дехидрат', 'обезводн', 'гранулом', 'себоре', 'кандид', 'млечниц'];
const речник = ((ctx.BL_DATA && ctx.BL_DATA.glossary) || []).map(g => String(g.t || '').toLowerCase());
const необяснени = [];
for (const ж of ЖАРГОН) {
  const вКарти = карти.filter(z => цял(z).toLowerCase().indexOf(ж) >= 0);
  if (!вКарти.length) continue;
  // обяснена = някъде има скоба или тире веднага след думата
  const обяснена = вКарти.some(z => new RegExp(ж + '[а-я]*\\s*[\\(—–-]', 'i').test(цял(z)))
    || речник.some(r => r.indexOf(ж) >= 0);
  if (!обяснена) необяснени.push(ж + ' (' + вКарти.length + ' карти)');
}
ред('жаргонни думи, срещани в картите', '·', ЖАРГОН.filter(ж => карти.some(z => цял(z).toLowerCase().indexOf(ж) >= 0)).length + ' от ' + ЖАРГОН.length);
ред('БЕЗ обяснение при никоя употреба', необяснени.length > 6 ? '🟠' : '·', необяснени.length + '');
if (необяснени.length) console.log('     ' + необяснени.slice(0, 12).join(' · '));

// ── 3. ЕДНА КАРТА, ДВЕ РАЗЛИЧНИ ЧИСЛА ЗА ЕДНО НЕЩО ──
console.log('');
console.log('═══ 3. САМОПРОТИВОРЕЧИЕ ВЪТРЕ В ЕДНА КАРТА ═══');
const намерени = [];
for (const z of карти) {
  const t = цял(z);
  const групи = {};
  for (const m of t.matchAll(/(\d{1,3}(?:[.,]\d)?)\s*(месец|месеца|години|година|седмиц|дни|ден|часа|градус|°|мл|минут)/gi)) {
    const мярка = m[2].toLowerCase().replace(/а$|и$|е$/, '');
    (групи[мярка] = групи[мярка] || new Set()).add(m[1]);
  }
  for (const [м, s] of Object.entries(групи))
    if (s.size >= 4) намерени.push({ z, м, стойности: [...s].join(', ') });
}
ред('карти с 4+ различни стойности за една мярка', намерени.length > 25 ? '🟠' : '·', намерени.length + '');
for (const x of намерени.slice(0, 5)) console.log('     [' + x.z.id.slice(0, 20).padEnd(20) + '] ' + x.м + ': ' + x.стойности.slice(0, 46));

// ── 4. ЗАГЛАВИЕ-ВЪПРОС, НО ОТГОВОРЪТ НЕ Е НА ПЪРВОТО ИЗРЕЧЕНИЕ ──
console.log('');
console.log('═══ 4. КАРТА-ВЪПРОС: КОГА ИДВА ОТГОВОРЪТ ═══');
const въпроси = карти.filter(z => /\?$/.test(String(z.title || '').trim()));
const бавни = въпроси.filter(z => {
  const първо = изр(гол(z.core))[0] || '';
  // отговор = число, „да/не", или глагол в сегашно за действие
  return !/(\d|да\b|не\b|около|обикновено|няма|има|зависи|повечето|повече)/i.test(първо);
});
ред('карти със заглавие-въпрос', '·', въпроси.length + '');
ред('първото изречение НЕ отговаря', бавни.length > 20 ? '🟠' : '·', бавни.length + '');
for (const z of бавни.slice(0, 4)) console.log('     „' + String(z.title).slice(0, 38) + '"  →  „' + (изр(гол(z.core))[0] || '').slice(0, 62) + '…"');

// ── 5. ОСТАНАЛ АНГЛИЙСКИ ──
console.log('');
console.log('═══ 5. ОСТАНАЛ АНГЛИЙСКИ В ТЕКСТА КЪМ МАЙКАТА ═══');
const англ = [];
for (const z of карти)
  for (const m of цял(z).matchAll(/(^|[^a-zA-Zа-яА-Я])([a-zA-Z]{4,})(?![a-zA-Z])/g))
    if (!/^(https?|www|ml|kg|cm|mm|mg|COVID|RSV|BCG|MPR|WHO|SIDS|IgE|AGE|API)$/i.test(m[2])) англ.push({ z, w: m[2] });
const поДума = {};
for (const x of англ) поДума[x.w] = (поДума[x.w] || 0) + 1;
ред('английски думи в картите', англ.length > 40 ? '🟠' : '·', англ.length + ' срещания · ' + Object.keys(поДума).length + ' различни');
console.log('     ' + Object.entries(поДума).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([w, n]) => w + '×' + n).join(' · '));

// ── 6. ДУБЛИРАНИ КЛЮЧОВЕ ──
console.log('');
console.log('═══ 6. ЕДИН КЛЮЧ НА ДВЕ КАРТИ ═══');
const поКлюч = new Map();
for (const z of карти) for (const k of (z.keys || [])) {
  const н = String(k).toLowerCase().trim();
  (поКлюч.get(н) || поКлюч.set(н, []).get(н)).push(z.id);
}
const дублК = [...поКлюч.entries()].filter(([, ids]) => new Set(ids).size > 1);
ред('ключове на 2+ карти', дублК.length ? '🟠' : '✅', дублК.length + '  (победителят е случайност от подредбата)');
for (const [k, ids] of дублК.slice(0, 8)) console.log('     „' + k + '"  →  ' + [...new Set(ids)].join(' · '));

// ── 7. ВЪЗРАСТТА, ЗА КОЯТО ГОВОРИ КАРТАТА ──
console.log('');
console.log('═══ 7. ЗА КОЯ ВЪЗРАСТ Е ═══');
let сВъзраст = 0;
for (const z of карти) if (/(месец|месеца|годин|седмиц|новородено|бебе|дете)/i.test(цял(z))) сВъзраст++;
ред('карти, назоваващи възраст', '·', сВъзраст + ' от ' + карти.length);
const полеВъзраст = карти.filter(z => z.от !== undefined || z.age !== undefined || z.months !== undefined);
ред('карти с ПОЛЕ за възраст (машинно)', полеВъзраст.length ? '·' : '🟠',
  полеВъзраст.length + ' — приложението не може да скрие неподходящото по възраст');
console.log('');
