// 🔭 РАЗУЗНАВАНЕ 5 — флаговете, стаите, структурата на статиите. Само мери.
const fs = require('fs');
const vm = require('vm');
const К = 'C:/Users/User/Downloads/ЛОЦО/АПЛИКАЦИЯ ЗА БЕЙБИ ЛЕНД/babyland/';
const ч = п => fs.readFileSync(К + п, 'utf8');
const ред = (име, знак, текст) => console.log('  ' + знак + ' ' + String(име).padEnd(40) + текст);

const ctx = { console: { log() {}, warn() {} }, JSON, Math, Date, RegExp, String, Number, Array, Object };
ctx.window = ctx; ctx.self = ctx; vm.createContext(ctx);
new vm.Script(ч('js/kb.js')).runInContext(ctx);
const KB = ctx.KB, карти = KB.entries;
const гол = h => String(h || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const цял = z => гол(z.core) + ' ' + гол(z.tip) + ' ' + гол(z.follow);

// ── 1. СЕМЕЙСТВАТА ФЛАГОВЕ ──
console.log('');
console.log('═══ 1. СЕМЕЙСТВАТА ФЛАГОВЕ — колко фрази пази всяко ═══');
const семейства = ['redFlags', 'pregFlags', 'dvFlags', 'motherFlags', 'heavyFlags', 'mamaBodyFlags', 'lossFlags'];
let общоФрази = 0;
for (const с of семейства) {
  const сп = KB[с] || [];
  общоФрази += сп.length;
  const къси = сп.filter(x => String(x).split(/\s+/).length === 1);
  ред(с, къси.length > сп.length * 0.4 ? '🟠' : '·',
    String(сп.length).padStart(4) + ' фрази · от тях ЕДНОДУМНИ ' + къси.length + ' (' + (къси.length / (сп.length || 1) * 100).toFixed(0) + '%)');
}
ред('ОБЩО', '·', общоФрази + ' фрази');
// еднодумните са най-рисковите — ловят по начало на дума
const всичкиЕдно = [];
for (const с of семейства) for (const x of (KB[с] || [])) if (String(x).split(/\s+/).length === 1) всичкиЕдно.push({ с, x });
const кратки = всичкиЕдно.filter(o => String(o.x).length <= 5);
ред('еднодумни И под 6 букви (най-лакоми)', кратки.length > 20 ? '🟠' : '·', кратки.length + '');
console.log('     ' + кратки.slice(0, 18).map(o => o.x).join(' · '));

// ── 2. ПРОТИВОРЕЧИЯ МЕЖДУ КАРТИ (не между статии) ──
console.log('');
console.log('═══ 2. ДВЕ КАРТИ, ЕДНА ТЕМА, РАЗЛИЧНО ЧИСЛО ═══');
const ТЕМИ = [
  ['температура под 3 месеца', /под\s*(3|три)\s*месец[а-я]*/i, /(\d{2}(?:[.,]\d)?)\s*°/g],
  ['мокри пелени', /мокри пелени/i, /(\d{1,2})\s*(?:мокри )?пелен/gi],
  ['стая за сън градуси', /стая|стаята/i, /(\d{2})\s*[-–]\s*(\d{2})\s*°|(\d{2})\s*°/g],
  ['минути под водата при изгаряне', /изгаря|попар/i, /(\d{1,2})\s*минут/gi],
  ['часове сън в денонощие', /денонощ|общо спане|спи общо/i, /(\d{1,2})\s*[-–]\s*(\d{1,2})\s*час/gi],
  ['мед преди', /мед\b|меда/i, /(\d)\s*годин/gi],
  ['натиск при кървене', /кърви|кървене|притиска/i, /(\d{1,2})\s*минут/gi]
];
for (const [име, тема, число] of ТЕМИ) {
  const намерени = new Map();
  for (const z of карти) {
    const t = цял(z);
    if (!тема.test(t)) continue;
    for (const m of t.matchAll(число)) {
      const v = (m[1] || '') + (m[2] ? '-' + m[2] : '') + (m[3] || '');
      if (!v) continue;
      (намерени.get(v) || намерени.set(v, []).get(v)).push(z.id);
    }
  }
  const стойности = [...намерени.keys()];
  ред(име, стойности.length > 3 ? '🟠' : '·', стойности.length + ' различни: ' + стойности.slice(0, 8).join(' · '));
}

// ── 3. КАКВО ПРЕДЛАГА ВСЯКА СТАЯ ──
console.log('');
console.log('═══ 3. ВЪЗМОЖНОСТИ ПО СТАЯ (какво пише в самия код) ═══');
const html = ч('index.html');
const скр = [...html.matchAll(/<script src="(js\/[^"?]+)/g)].map(m => m[1]).filter(f => fs.existsSync(К + f));
const код = скр.map(ч).join('\n');
const СТАИ = ['Бременност', 'Моето бебе', 'Захранване', 'Здраве и SOS', 'Дневник на мама',
  'Развитие и игри', 'Инструменти', 'Жената в мен', 'Лабораторията'];
for (const с of СТАИ) {
  const n = (код.match(new RegExp(с.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  const карт = карти.filter(z => z.room === с).length;
  ред(с, n < 20 ? '🟠' : '·', 'споменавана ' + String(n).padStart(4) + ' пъти в кода · ' + карт + ' карти');
}

// ── 4. СТРУКТУРАТА НА СТАТИИТЕ ПО СТАЯ ──
console.log('');
console.log('═══ 4. СТРУКТУРА НА СТАТИИТЕ ПО СТАЯ ═══');
const idx = JSON.parse(ч('lib/index.json'));
const тела = {};
for (const f of fs.readdirSync(К + 'lib').filter(f => /^[a-z0-9-]+\.json$/.test(f) && f !== 'index.json'))
  Object.assign(тела, JSON.parse(ч('lib/' + f)));
const поСтая = {};
for (const a of (idx.items || [])) {
  const t = тела[a.id];
  if (typeof t !== 'string') continue;
  const с = a.r || '—';
  poz(поСтая, с);
  поСтая[с].n++;
  поСтая[с].подзагл += (t.match(/^##+\s/gm) || []).length;
  if (!(t.match(/^\s*([-*•]|\d+\.)\s/gm) || []).length) поСтая[с].безСписък++;
  if (/(спешн|спешен|лекар|112|педиатър)/i.test(t)) поСтая[с].сВрата++;
  поСтая[с].знаци += t.length;
}
function poz(o, k) { if (!o[k]) o[k] = { n: 0, подзагл: 0, безСписък: 0, сВрата: 0, знаци: 0 }; }
console.log('     СТАЯ                 бр  ср.дълж  подзагл  безСписък  с „лекар"');
for (const [с, d] of Object.entries(поСтая).sort((a, b) => b[1].n - a[1].n))
  console.log('     ' + с.padEnd(18) + String(d.n).padStart(4) + String(Math.round(d.знаци / d.n)).padStart(8) +
    (d.подзагл / d.n).toFixed(1).padStart(9) + String(d.безСписък).padStart(10) + String(Math.round(d.сВрата / d.n * 100) + '%').padStart(10));

// ── 5. КЛЮЧОВИТЕ ДУМИ НА СТАТИИТЕ (полето k) ──
console.log('');
console.log('═══ 5. ПОЛЕТО k В УКАЗАТЕЛЯ (по него търси търсачката) ═══');
const сK = (idx.items || []).filter(a => String(a.k || '').trim());
ред('статии с ключови думи', сK.length < (idx.items || []).length ? '🟠' : '✅', сK.length + ' от ' + (idx.items || []).length);
const дълж = сK.map(a => String(a.k).split(/\s+/).length).sort((a, b) => a - b);
ред('думи в k: най-малко · средно · най-много', '·', дълж[0] + ' · ' + дълж[Math.floor(дълж.length / 2)] + ' · ' + дълж[дълж.length - 1]);
const латиница = (idx.items || []).filter(a => /[a-z]{4,}/i.test(String(a.k || '')));
ред('k съдържа латиница', латиница.length > 30 ? '🟠' : '·', латиница.length + ' статии');
if (латиница.length) console.log('     пример: ' + String(латиница[0].k).slice(0, 100));

// ── 6. КОЛКО СТАРО Е ВСИЧКО ──
console.log('');
console.log('═══ 6. КОГА Е ПИПАНО ЗА ПОСЛЕДНО ═══');
const { execSync } = require('child_process');
for (const f of ['js/wisdom.js', 'js/women.js', 'js/women2.js', 'js/preg20.js', 'js/rooms3.js', 'js/crypto.js', 'js/reader.js', 'js/checkups.js']) {
  try {
    const d = execSync('git log -1 --format=%ar -- ' + f, { cwd: К, encoding: 'utf8' }).trim();
    ред(f, /month|year/.test(d) ? '🟠' : '·', d);
  } catch (e) { ред(f, '·', '—'); }
}
console.log('');
