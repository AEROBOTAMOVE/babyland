// 🔭 РАЗУЗНАВАНЕ 7 — СМЕТКИТЕ: кривите на СЗО, възрастта, календарът. Само мери.
const fs = require('fs');
const vm = require('vm');
const К = 'C:/Users/User/Downloads/ЛОЦО/АПЛИКАЦИЯ ЗА БЕЙБИ ЛЕНД/babyland/';
const ч = п => fs.readFileSync(К + п, 'utf8');
const ред = (име, знак, текст) => console.log('  ' + знак + ' ' + String(име).padEnd(44) + текст);

const html = ч('index.html');
const скр = [...html.matchAll(/<script src="(js\/[^"?]+)/g)].map(m => m[1]).filter(f => fs.existsSync(К + f));

// зареждаме данните и сметките в пясъчник
const ctx = {
  console: { log() {}, warn() {}, error() {} }, JSON, Math, Date, RegExp, String, Number, Array, Object,
  setTimeout: () => 0, clearTimeout: () => {}, setInterval: () => 0,
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} }
};
ctx.window = ctx; ctx.self = ctx; ctx.globalThis = ctx;
ctx.document = { addEventListener() {}, querySelector: () => null, querySelectorAll: () => [], createElement: () => ({ style: {}, classList: { add() {}, remove() {} }, appendChild() {} }), body: { appendChild() {} }, documentElement: { style: {} } };
vm.createContext(ctx);
let заредени = 0, паднали = [];
for (const f of скр) {
  try { new vm.Script(ч(f), { filename: f }).runInContext(ctx); заредени++; }
  catch (e) { паднали.push(f + ': ' + String(e.message).slice(0, 50)); }
}
console.log('');
console.log('═══ 0. КОЛКО СЕ ЗАРЕЖДА ИЗВЪН БРАУЗЪР ═══');
ред('заредени скрипта', '·', заредени + ' от ' + скр.length);
ред('паднали (искат истински браузър)', '·', паднали.length + '');

// ── 1. КРИВИТЕ НА СЗО ──
console.log('');
console.log('═══ 1. КРИВИТЕ НА СЗО — вътрешна съгласуваност ═══');
const D = ctx.BL_DATA || {};
for (const [име, ключ] of [['тегло', 'who'], ['дължина', 'whoLen'], ['обиколка глава', 'whoHead']]) {
  const w = D[ключ];
  if (!w) { ред(име, '🟠', 'липсва'); continue; }
  const полове = Object.keys(w);
  let бележки = [];
  let общоТочки = 0;
  for (const пол of полове) {
    const редове = w[пол];
    if (!Array.isArray(редове)) { бележки.push(пол + ': не е списък'); continue; }
    общоТочки += редове.length;
    // всяка точка да расте: месец нагоре → стойност нагоре
    let немонотонни = 0;
    for (let i = 1; i < редове.length; i++) {
      const a = редове[i - 1], b = редове[i];
      const ва = Array.isArray(a) ? a : Object.values(a);
      const вб = Array.isArray(b) ? b : Object.values(b);
      for (let k = 1; k < Math.min(ва.length, вб.length); k++)
        if (typeof ва[k] === 'number' && typeof вб[k] === 'number' && вб[k] < ва[k]) немонотонни++;
    }
    if (немонотонни) бележки.push(пол + ': ' + немонотонни + ' стъпки НАДОЛУ');
  }
  ред(име, бележки.length ? '🟠' : '·', полове.join('/') + ' · ' + общоТочки + ' точки' + (бележки.length ? ' · ' + бележки.join(' · ') : ' · монотонни'));
}
// момче срещу момиче — трябва да се различават
if (D.who) {
  const п = Object.keys(D.who);
  if (п.length >= 2) {
    const A = JSON.stringify(D.who[п[0]]), B = JSON.stringify(D.who[п[1]]);
    ред('момче и момиче различни ли са', A === B ? '🔴' : '·', A === B ? 'ЕДНАКВИ — подозрително' : 'различни');
  }
}

// ── 2. ВЪЗРАСТТА ──
console.log('');
console.log('═══ 2. СМЕТКАТА ЗА ВЪЗРАСТТА ═══');
const BL_AGE = ctx.BL_AGE;
if (typeof BL_AGE !== 'function') ред('BL_AGE', '🟠', 'не се зарежда извън браузър — иска проверка НА ЖИВО');
else {
  const проби = [
    ['29.02.2024 → 01.03.2025 (високосна)', new Date(2024, 1, 29), new Date(2025, 2, 1)],
    ['31.01 → 28.02 (край на месеца)', new Date(2025, 0, 31), new Date(2025, 1, 28)],
    ['31.12 → 01.01 (година)', new Date(2024, 11, 31), new Date(2025, 0, 1)],
    ['същият ден', new Date(2025, 5, 10), new Date(2025, 5, 10)],
    ['ден преди раждането (бъдеще)', new Date(2025, 5, 10), new Date(2025, 5, 9)]
  ];
  for (const [име, роден, днес] of проби) {
    let r;
    try { r = BL_AGE(роден.toISOString().slice(0, 10), днес); } catch (e) { r = 'грешка: ' + e.message; }
    ред(име, '·', JSON.stringify(r).slice(0, 96));
  }
}
// колко пъти изобщо се смята възраст в кода
const код = скр.map(ч).join('\n');
ред('места, които смятат възраст', '·', (код.match(/BL_AGE\s*\(/g) || []).length + ' викания на BL_AGE');
ред('коригирана възраст (недоносени)', '·', (код.match(/коригиран/gi) || []).length + ' споменавания');
ред('часова зона', (код.match(/getTimezoneOffset|Europe\/Sofia/g) || []).length < 3 ? '🟠' : '·',
  (код.match(/getTimezoneOffset|Europe\/Sofia/g) || []).length + ' — датата „днес" зависи от нея');

// ── 3. КАЛЕНДАРЪТ НА ПРЕГЛЕДИТЕ ──
console.log('');
console.log('═══ 3. КАЛЕНДАРЪТ НА ПРЕГЛЕДИТЕ ═══');
const ч2 = ч('js/checkups.js');
const редовеК = [...ч2.matchAll(/\[\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*'([^']*)'\s*,\s*'([^']*)'/g)]
  .map(m => ({ от: +m[1], до: +m[2], икона: m[3], име: m[4] }));
ред('записа в календара', редовеК.length ? '·' : '🟠', редовеК.length + '');
let обърнати = 0, дупки = [];
for (let i = 0; i < редовeК_len(); i++) {}
function редовeК_len() { return 0; }
for (const r of редовеК) if (r.до < r.от) обърнати++;
for (let i = 1; i < редовеК.length; i++)
  if (редовеК[i].от < редовеК[i - 1].от) дупки.push(редовеК[i - 1].име + ' → ' + редовеК[i].име);
ред('обърнат интервал (до < от)', обърнати ? '🔴' : '✅', обърнати + '');
ред('разбъркан ред', дупки.length ? '🟠' : '✅', дупки.length ? дупки.slice(0, 3).join(' · ') : 'подредени по възраст');
console.log('     ' + редовеК.map(r => r.име).join(' · ').slice(0, 150));

// ── 4. КАРТА СРЕЩУ СТАТИЯ — повтарят ли се ──
console.log('');
console.log('═══ 4. СТАТИЯТА ПОВТАРЯ ЛИ КАРТАТА ═══');
const kbCtx = { console: { log() {}, warn() {} }, JSON, Math, Date, RegExp, String, Number, Array, Object };
kbCtx.window = kbCtx; kbCtx.self = kbCtx; vm.createContext(kbCtx);
new vm.Script(ч('js/kb.js')).runInContext(kbCtx);
const тела = {};
for (const f of fs.readdirSync(К + 'lib').filter(f => /^[a-z0-9-]+\.json$/.test(f) && f !== 'index.json'))
  Object.assign(тела, JSON.parse(ч('lib/' + f)));
const гол = h => String(h || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
const вериги = t => { const д = (t.match(/[а-яё]+/g) || []); const s = new Set(); for (let i = 0; i + 5 < д.length; i++) s.add(д.slice(i, i + 6).join(' ')); return s; };
let двойки = 0, повтарящи = [];
for (const z of kbCtx.KB.entries) {
  const libs = Array.isArray(z.lib) ? z.lib : (z.lib ? [z.lib] : []);
  for (const l of libs) {
    const т = тела[l]; if (typeof т !== 'string') continue;
    двойки++;
    const A = вериги(гол(z.core) + ' ' + гол(z.tip)), B = вериги(гол(т));
    if (!A.size) continue;
    let общи = 0; for (const x of A) if (B.has(x)) общи++;
    const дял = общи / A.size;
    if (дял > 0.5) повтарящи.push({ z: z.id, l, дял: +(дял * 100).toFixed(0) });
  }
}
ред('двойки карта→статия', '·', двойки + '');
ред('статията повтаря над половината от картата', повтарящи.length > 30 ? '🟠' : '·', повтарящи.length + '');
for (const x of повтарящи.slice(0, 5)) console.log('     ' + x.дял + '%  ' + x.z + ' → ' + x.l);

// ── 5. ВЪВЕДЕНОТО ОТ МАЙКАТА ──
console.log('');
console.log('═══ 5. КАКВО СЕ СЛУЧВА С ВЪВЕДЕНОТО ═══');
for (const [име, r] of [['maxlength в HTML', /maxlength=/g], ['проверка на дата', /isNaN|Number\.isNaN/g],
  ['екраниране на име (XSS)', /textContent\s*=|escapeHtml|escHtml|sanitize/g],
  ['innerHTML с променлива', /innerHTML\s*=\s*[`'"][^`'"]*\$\{/g],
  ['try\\/catch', /try\s*\{/g]]) {
  const n = ((код + html).match(r) || []).length;
  ред(име, '·', n + '');
}
console.log('');
