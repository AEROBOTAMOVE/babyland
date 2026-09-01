// 🔭 РАЗУЗНАВАНЕ 3 — КАРТИТЕ. Само мери, нищо не пипа.
// Уредът dev/toplina.js мери СТАТИИТЕ. Картите — 688 на брой и първото, което
// майката чете — никога не са мерени по тон, дължина, повторение или число.
const fs = require('fs');
const vm = require('vm');
const К = 'C:/Users/User/Downloads/ЛОЦО/АПЛИКАЦИЯ ЗА БЕЙБИ ЛЕНД/babyland/';
const ч = п => fs.readFileSync(К + п, 'utf8');
const ред = (име, знак, текст) => console.log('  ' + знак + ' ' + String(име).padEnd(40) + текст);

const ctx = { console: { log() {}, warn() {} }, JSON, Math, Date, RegExp, String, Number, Array, Object };
ctx.window = ctx; ctx.self = ctx; vm.createContext(ctx);
new vm.Script(ч('js/kb.js')).runInContext(ctx);
const карти = ctx.KB.entries;
const гол = h => String(h || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const цял = z => гол(z.core) + ' ' + гол(z.tip) + ' ' + гол(z.follow);

// ── 1. ТОНЪТ НА КАРТИТЕ (същата мярка като за статиите) ──
console.log('');
console.log('═══ 1. ГОВОРЯТ ЛИ КАРТИТЕ НА МАЙКАТА ═══');
const Г = '[^а-яА-ЯёЁa-zA-Z]';
const НЕ_ГЛАГОЛ = new Set(['душ', 'кеш', 'марш', 'туш', 'кош', 'маш', 'фалш', 'плюш', 'финиш', 'фиш']);
const второЛице = t => {
  const думи = t.toLowerCase().match(/[а-яё]+/g) || [];
  let гл = 0;
  for (const d of думи) if (d.length >= 4 && d.endsWith('ш') && !НЕ_ГЛАГОЛ.has(d)) гл++;
  let мест = 0;
  for (const w of ['ти', 'теб', 'твоя', 'твоето', 'твоята', 'твоите', 'твой'])
    мест += (t.match(new RegExp('(^|' + Г + ')' + w + '(' + Г + '|$)', 'gi')) || []).length;
  const пов = (t.match(/(^|[^а-яА-Я])(дай|виж|сложи|направи|провери|кажи|опитай|започни|извади|измери|обади|потърси|запиши|подготви|подръж|остави|вземи|намали|спри|избери|изчакай|прекарай|питай|звънни|легни|дишай|запомни|недей|гледай|снимай|проветри|пускай|обличай|слагай|дръж|мери|брой|чакай|тръгвай|прибирай|пази|помни|избягвай|използвай|носи|говори|пробвай|сравни|отбележи|разкажи|поискай|откажи|приеми|смени|измий|подсуши|завий|повдигни)([^а-яА-Я]|$)/gi) || []).length;
  return гл + мест + пов;
};
if (второЛице('Какво гледаш, преди да звъннеш. Прекарай длан по корема.') < 3) { console.log('🔴 уредът е сляп'); process.exit(1); }
if (второЛице('Скарлатината е бактериална инфекция с обрив по гънките.') !== 0) { console.log('🔴 уредът лъже нагоре'); process.exit(1); }
const гъст = карти.map(z => {
  const t = цял(z);
  return { z, n: t.length, г: t.length ? второЛице(t) / (t.length / 1000) : 0 };
}).sort((a, b) => a.г - b.г);
const мед = гъст[Math.floor(гъст.length / 2)].г;
ред('средна гъстота (статиите са 7.2)', '·', мед.toFixed(1) + ' обръщения на 1000 знака');
const студени = гъст.filter(x => x.г < 2);
ред('карти под 2 обръщения', студени.length > 30 ? '🔴' : (студени.length ? '🟠' : '✅'), студени.length + ' от ' + карти.length);
for (const x of гъст.slice(0, 8)) console.log('     ' + x.г.toFixed(1).padStart(4) + '  [' + x.z.room.slice(0, 12).padEnd(12) + '] ' + String(x.z.title).slice(0, 46));

// ── 2. ДЪЛЖИНАТА ──
console.log('');
console.log('═══ 2. ДЪЛЖИНА НА КАРТИТЕ ═══');
const дълж = карти.map(z => цял(z).length).sort((a, b) => a - b);
const p = q => дълж[Math.floor(дълж.length * q)];
ред('най-къса · 25% · средна · 75% · най-дълга', '·', дълж[0] + ' · ' + p(.25) + ' · ' + p(.5) + ' · ' + p(.75) + ' · ' + дълж[дълж.length - 1]);
const дълги = карти.filter(z => цял(z).length > 1600);
ред('над 1600 знака (стена от текст)', дълги.length > 40 ? '🟠' : '·', дълги.length + '');
for (const z of дълги.sort((a, b) => цял(b).length - цял(a).length).slice(0, 5))
  console.log('     ' + String(цял(z).length).padStart(5) + '  [' + z.room.slice(0, 12).padEnd(12) + '] ' + String(z.title).slice(0, 44));

// ── 3. ПОВТОРЕНИ ИЗРЕЧЕНИЯ МЕЖДУ КАРТИ ──
console.log('');
console.log('═══ 3. ЕДНО И СЪЩО ИЗРЕЧЕНИЕ В РАЗНИ КАРТИ ═══');
const поИзр = new Map();
for (const z of карти)
  for (const изр of цял(z).split(/(?<=[.!?])\s+/))
    if (изр.length > 45) {
      const к = изр.toLowerCase().replace(/[^а-яa-z ]/g, '').trim();
      (поИзр.get(к) || поИзр.set(к, []).get(к)).push(z.id);
    }
const повторени = [...поИзр.entries()].filter(([, ids]) => new Set(ids).size > 1);
ред('изречения в 2+ карти', повторени.length > 30 ? '🟠' : '·', повторени.length + '');
for (const [изр, ids] of повторени.sort((a, b) => new Set(b[1]).size - new Set(a[1]).size).slice(0, 6))
  console.log('     ×' + new Set(ids).size + '  „' + изр.slice(0, 78) + '…"');

// ── 4. ЧИСЛА БЕЗ МЯРКА ──
console.log('');
console.log('═══ 4. ЧИСЛА В КАРТИТЕ ═══');
let сЧисло = 0, безМярка = [];
for (const z of карти) {
  const t = цял(z);
  const числа = [...t.matchAll(/(?<![\d.,])(\d{1,3})(?![\d.,])/g)];
  if (числа.length) сЧисло++;
  for (const m of числа) {
    const след = t.slice(m.index + m[0].length, m.index + m[0].length + 22);
    if (!/^\s*(месец|месеца|години|година|годинк|седмиц|дни|ден|часа|час|минут|градус|°|мл|мг|г\b|кг|пъти|път|%|лв|дни)/i.test(след)
      && !/^\s*(и|до|-|–)\s*\d/.test(след)) безМярка.push({ z, ч: m[0], около: t.slice(Math.max(0, m.index - 28), m.index + 30) });
  }
}
ред('карти с число', '·', сЧисло + ' от ' + карти.length);
ред('число БЕЗ мярка след него', безМярка.length > 120 ? '🟠' : '·', безМярка.length + '');
for (const x of безМярка.slice(0, 5)) console.log('     [' + x.z.id.slice(0, 18).padEnd(18) + '] …' + x.около.replace(/\s+/g, ' ') + '…');

// ── 5. КЪДЕ Е ЛЕКАРЯТ ──
console.log('');
console.log('═══ 5. „НА ЛЕКАР" — НО ПРИ КОЙ ═══');
const кДокт = карти.filter(z => /(на лекар|при лекар|потърси лекар|кажи на лекар)/i.test(цял(z)));
const безКой = кДокт.filter(z => !/(педиатър|личния|личен лекар|спешн|112|акушер|гинеколог|УНГ|дерматолог|ортопед|хирург|очен)/i.test(цял(z)));
ред('карти, които пращат „на лекар"', '·', кДокт.length + '');
ред('без да казват при КОЙ лекар', безКой.length > 30 ? '🟠' : '·', безКой.length + '');

// ── 6. РЕЗЮМЕТАТА НА СТАТИИТЕ ──
console.log('');
console.log('═══ 6. РЕЗЮМЕТАТА В УКАЗАТЕЛЯ ═══');
const idx = JSON.parse(ч('lib/index.json'));
const рез = (idx.items || []).map(a => ({ a, s: String(a.s || '') }));
ред('статии', '·', рез.length + '');
ред('без резюме', рез.filter(x => !x.s.trim()).length ? '🔴' : '✅', рез.filter(x => !x.s.trim()).length + '');
const дълр = рез.filter(x => x.s.length > 220);
ред('резюме над 220 знака', дълр.length > 30 ? '🟠' : '·', дълр.length + '');
const еднакви = new Map();
for (const x of рез) { const к = x.s.toLowerCase().trim(); if (к) (еднакви.get(к) || еднакви.set(к, []).get(к)).push(x.a.id); }
const дублР = [...еднакви.values()].filter(v => v.length > 1);
ред('ЕДНАКВО резюме на 2+ статии', дублР.length ? '🟠' : '✅', дублР.length + '');

// ── 7. ЕМОДЖИТАТА ──
console.log('');
console.log('═══ 7. ЕМОДЖИ ═══');
const емо = карти.map(z => (цял(z).match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu) || []).length);
ред('средно на карта', '·', (емо.reduce((a, b) => a + b, 0) / карти.length).toFixed(1) + '');
ред('карти с над 6 емоджи', емо.filter(x => x > 6).length > 30 ? '🟠' : '·', емо.filter(x => x > 6).length + '');
console.log('');
