// ═══════════════════════════════════════════════════════════
// 📋 СВЕРКА НА ПЛАНА — вярно ли е още всичко, което пише в него
//
// ЗАЩО: план със застояли числа е по-лош от никакъв. Той кара да се работи по
// задача, която вече е свършена, и създава чувство за напредък без напредък.
// Този уред взима ВСЯКО число от dev/PLAN.md и го мери НАНОВО срещу живата база.
//
// ПУСКАНЕ: node dev/plan_sverka.js
// ПЪТ НАЗАД: файлът само ЧЕТЕ.
// ═══════════════════════════════════════════════════════════
const fs = require('fs');
const vm = require('vm');
const К = __dirname + '/../';
const ч = п => fs.readFileSync(К + п, 'utf8');

const ctx = { console: { log() {}, warn() {} }, JSON, Math, Date, RegExp, String, Number, Array, Object };
ctx.window = ctx; ctx.self = ctx; vm.createContext(ctx);
new vm.Script(ч('js/kb.js')).runInContext(ctx);
const KB = ctx.KB, карти = KB.entries;
const гол = h => String(h || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const цял = z => гол(z.core) + ' ' + гол(z.tip) + ' ' + гол(z.follow);
const idx = JSON.parse(ч('lib/index.json'));
const статии = (idx.items || []);
const тела = {};
for (const f of fs.readdirSync(К + 'lib').filter(f => /^[a-z0-9-]+\.json$/.test(f) && f !== 'index.json'))
  Object.assign(тела, JSON.parse(ч('lib/' + f)));
const html = ч('index.html');
const скр = [...html.matchAll(/<script src="(js\/[^"?]+)/g)].map(m => m[1]).filter(f => fs.existsSync(К + f));
const код = скр.map(ч).join('\n');
const целият = карти.map(цял).join(' ') + ' ' + Object.values(тела).filter(x => typeof x === 'string').join(' ');

const редове = [];
const мери = (раздел, твърдение, беше, сега, единица) => {
  const същото = беше === сега;
  const посока = сега < беше ? '↓' : (сега > беше ? '↑' : '=');
  редове.push({ раздел, твърдение, беше, сега, същото, посока, единица: единица || '' });
};

// ── числата от плана, едно по едно ──
мери(4, 'статии за партньора', 11,
  статии.filter(a => /(партньор|двойка|мъж|съпруг|бащ|интимн|секс)/i.test(String(a.t) + ' ' + String(a.s))).length);
мери(4, 'статии за второ дете и близнаци', 15,
  статии.filter(a => /(второ дете|близнац|голямото|братче|сестриче|две деца)/i.test(String(a.t) + ' ' + String(a.s))).length);
мери(5, 'ключове на 2+ карти', 32, (() => {
  const по = new Map();
  for (const z of карти) for (const k of (z.keys || [])) {
    const н = String(k).toLowerCase().trim();
    (по.get(н) || по.set(н, []).get(н)).push(z.id);
  }
  return [...по.values()].filter(v => new Set(v).size > 1).length;
})());
мери(14, 'студени карти (под 2 обръщения)', 101, (() => {
  const Г = '[^а-яА-ЯёЁa-zA-Z]';
  const НЕ = new Set(['душ', 'кеш', 'марш', 'туш', 'кош', 'маш', 'фалш', 'плюш', 'финиш', 'фиш']);
  const вл = t => {
    const д = t.toLowerCase().match(/[а-яё]+/g) || []; let г = 0;
    for (const x of д) if (x.length >= 4 && x.endsWith('ш') && !НЕ.has(x)) г++;
    let м = 0;
    for (const w of ['ти', 'теб', 'твоя', 'твоето', 'твоята', 'твоите', 'твой'])
      м += (t.match(new RegExp('(^|' + Г + ')' + w + '(' + Г + '|$)', 'gi')) || []).length;
    const п = (t.match(/(^|[^а-яА-Я])(дай|виж|сложи|направи|провери|кажи|опитай|започни|извади|измери|обади|потърси|запиши|подготви|подръж|остави|вземи|намали|спри|избери|изчакай|прекарай|питай|звънни|легни|дишай|запомни|недей|гледай|снимай|проветри|пускай|обличай|слагай|дръж|мери|брой|чакай|тръгвай|прибирай|пази|помни|избягвай|използвай|носи|говори|пробвай|сравни|отбележи|разкажи|поискай|откажи|приеми|смени|измий|подсуши|завий|повдигни)([^а-яА-Я]|$)/gi) || []).length;
    return г + м + п;
  };
  return карти.filter(z => { const t = цял(z); return t.length && вл(t) / (t.length / 1000) < 2; }).length;
})());
мери(15, 'карти „на лекар" без КОЙ лекар', 72, (() => {
  const д = карти.filter(z => /(на лекар|при лекар|потърси лекар|кажи на лекар)/i.test(цял(z)));
  return д.filter(z => !/(педиатър|личния|личен лекар|спешн|112|акушер|гинеколог|УНГ|дерматолог|ортопед|хирург|очен)/i.test(цял(z))).length;
})());
мери(16, '🚨 без действие в остатъка', 41, (() => {
  const Д = /112|спешн|лекар|педиатър|бърза помощ|отделение|кабинет|преглед|не чакай|веднага|същия ден|обади|обаждане|звънни|консултаци|болниц|линейк|кажи на някого|потърси помощ/i;
  let n = 0;
  for (const z of карти) for (const t of [гол(z.core), гол(z.tip), гол(z.follow)]) {
    const i = t.indexOf('🚨'); if (i < 0) continue;
    if (!Д.test(t.slice(i))) n++;
  }
  return n;
})());
мери(17, 'карти → статия в друга стая', 247, (() => {
  const стая = new Map(статии.map(a => [a.id, a.r]));
  let n = 0;
  for (const z of карти) {
    const l = Array.isArray(z.lib) ? z.lib : (z.lib ? [z.lib] : []);
    for (const x of l) { const с = стая.get(x); if (с && с !== z.room) n++; }
  }
  return n;
})());
мери(17, 'карти без статия', 100, карти.filter(z => !z.lib || (Array.isArray(z.lib) && !z.lib.length)).length);
мери(17, 'карти без чип', 94, карти.filter(z => !(z.chips || []).length).length);
мери(23, 'изречения над 35 думи', 206, (() => {
  let n = 0;
  for (const z of карти)
    for (const s of цял(z).split(/(?<=[.!?·])\s+/))
      if ((s.match(/[а-яА-Яa-zA-Z]+/g) || []).length > 35) n++;
  return n;
})());
мери(31, 'статии с латиница в ключовите думи', 458, статии.filter(a => /[a-z]{4,}/i.test(String(a.k || ''))).length);
мери(38, 'уреди без самопроверка', 24, (() => {
  const у = fs.readdirSync(К + 'dev').filter(f => f.endsWith('.js') && !/ARCHIVE|PREDI|BAK/.test(f));
  return у.filter(f => { const t = ч('dev/' + f); return !/самопроверк|САМОПРОВЕРК|примамк|подстав/.test(t) && /process\.exit\(1\)/.test(t); }).length;
})());
мери(47, 'статии над 4 минути четене', 83,
  Object.values(тела).filter(x => typeof x === 'string' && (x.match(/[а-яА-Яa-zA-Z]+/g) || []).length > 700).length);
мери(48, '„просто" в текста', 579, (целият.match(/(^|[^а-я])просто([^а-я]|$)/gi) || []).length);
мери(48, '„трябва да" в текста', 281, (целият.match(/(^|[^а-я])трябва да/gi) || []).length);
мери(49, 'карти за САМА майка', 5, карти.filter(z => /(сама съм|нямам помощ|няма кой|самотн)/i.test(цял(z))).length);
мери(26, 'карти с машинно поле за възраст', 0, карти.filter(z => z.от !== undefined || z.age !== undefined).length);
мери(0, 'места „каквато и да е температура"', 10, (целият.match(/каквато и да е температура|всяка температура/gi) || []).length);

// ── и общите числа ──
мери('шапка', 'карти', 688, карти.length);
мери('шапка', 'статии', 981, статии.length);
мери('шапка', 'ключове', 9420, карти.reduce((a, z) => a + (z.keys || []).length, 0));
мери('шапка', 'уреди в dev/', 127, fs.readdirSync(К + 'dev').filter(f => f.endsWith('.js') && !/ARCHIVE|PREDI|BAK/.test(f)).length);

// ── извеждане ──
console.log('');
console.log('📋 СВЕРКА НА ПЛАНА срещу живата база');
console.log('');
console.log('   разд  твърдение                                 в плана    сега');
console.log('   ' + '─'.repeat(74));
let разминати = 0;
for (const r of редове) {
  const знак = r.същото ? '  ' : (r.посока === '↓' ? '✅' : '🔴');
  if (!r.същото) разминати++;
  console.log('   ' + знак + ' ' + String(r.раздел).padStart(3) + '  ' + r.твърдение.padEnd(42) +
    String(r.беше).padStart(6) + '  ' + String(r.сега).padStart(6) + '  ' + (r.същото ? '' : r.посока));
}
console.log('');
console.log('   ✅ = числото е ПАДНАЛО (свършена работа)   🔴 = ПОРАСНАЛО (нов дълг)');
console.log('   разминати от плана: ' + разминати + ' от ' + редове.length);
fs.writeFileSync(__dirname + '/plan_sverka.json', JSON.stringify(редове, null, 1));
console.log('');
console.log('   💾 dev/plan_sverka.json');
