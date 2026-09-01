// 🔭 РАЗУЗНАВАНЕ 8 — ПРЕЖИВЯВАНЕТО НА МАЙКАТА. Само мери.
const fs = require('fs');
const vm = require('vm');
const К = 'C:/Users/User/Downloads/ЛОЦО/АПЛИКАЦИЯ ЗА БЕЙБИ ЛЕНД/babyland/';
const ч = п => fs.readFileSync(К + п, 'utf8');
const ред = (име, знак, текст) => console.log('  ' + знак + ' ' + String(име).padEnd(44) + текст);
const html = ч('index.html');
const скр = [...html.matchAll(/<script src="(js\/[^"?]+)/g)].map(m => m[1]).filter(f => fs.existsSync(К + f));
const код = скр.map(ч).join('\n');

const ctx = { console: { log() {}, warn() {} }, JSON, Math, Date, RegExp, String, Number, Array, Object };
ctx.window = ctx; ctx.self = ctx; vm.createContext(ctx);
new vm.Script(ч('js/kb.js')).runInContext(ctx);
const карти = ctx.KB.entries;
const гол = h => String(h || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const цял = z => гол(z.core) + ' ' + гол(z.tip) + ' ' + гол(z.follow);
const idx = JSON.parse(ч('lib/index.json'));
const тела = {};
for (const f of fs.readdirSync(К + 'lib').filter(f => /^[a-z0-9-]+\.json$/.test(f) && f !== 'index.json'))
  Object.assign(тела, JSON.parse(ч('lib/' + f)));

// ── 1. КОЛКО ВРЕМЕ ОТНЕМА ЕДИН ОТГОВОР ──
console.log('');
console.log('═══ 1. КОЛКО ЧЕТЕНЕ ИСКА ЕДИН ОТГОВОР ═══');
const думи = t => (t.match(/[а-яА-Яa-zA-Z]+/g) || []).length;
const кДуми = карти.map(z => думи(цял(z))).sort((a, b) => a - b);
const сДуми = Object.values(тела).filter(x => typeof x === 'string').map(думи).sort((a, b) => a - b);
const мин = n => Math.round(n / 180 * 10) / 10; // ~180 думи/мин на български при умора
ред('карта: средно думи · време', '·', кДуми[Math.floor(кДуми.length / 2)] + ' думи · ~' + мин(кДуми[Math.floor(кДуми.length / 2)]) + ' мин');
ред('статия: средно думи · време', '·', сДуми[Math.floor(сДуми.length / 2)] + ' думи · ~' + мин(сДуми[Math.floor(сДуми.length / 2)]) + ' мин');
ред('най-дългата статия', сДуми[сДуми.length - 1] > 1200 ? '🟠' : '·', сДуми[сДуми.length - 1] + ' думи · ~' + мин(сДуми[сДуми.length - 1]) + ' мин');
const дълги = сДуми.filter(x => x > 700).length;
ред('статии над 4 минути четене', дълги > 120 ? '🟠' : '·', дълги + ' от ' + сДуми.length);

// ── 2. ГЛАСЪТ: ТИ ИЛИ ВИЕ, МЪЖ ИЛИ ЖЕНА ──
console.log('');
console.log('═══ 2. ЕЗИКЪТ КЪМ ЖЕНАТА ═══');
const целият = карти.map(цял).join(' ') + ' ' + Object.values(тела).filter(x => typeof x === 'string').join(' ');
for (const [име, r, бележка] of [
  ['„вие" вместо „ти"', /(^|[^а-я])(вие|ваш[аето]*|Вас)([^а-я]|$)/gi, 'приложението говори на ТИ'],
  ['„мъжът ти" (приема партньор)', /мъж[ъа]т ти|съпруг[ъа]т ти|бащата на детето/gi, ''],
  ['„баба" като готова помощ', /баба(та)? (ще|може|да)/gi, ''],
  ['„трябва да" (заповед)', /(^|[^а-я])трябва да/gi, ''],
  ['„просто" (омаловажаване)', /(^|[^а-я])просто([^а-я]|$)/gi, ''],
  ['„не се притеснявай"', /не се притеснявай|не се тревожи/gi, ''],
  ['„всяка майка"', /всяка майка|всички майки/gi, '']
]) {
  const n = (целият.match(r) || []).length;
  ред(име, n > 200 ? '🟠' : '·', n + ' срещания' + (бележка ? '  ← ' + бележка : ''));
}

// ── 3. САМОТНАТА МАЙКА ──
console.log('');
console.log('═══ 3. ПРЕДПОЛАГА ЛИ СЕ, ЧЕ ИМА КОЙ ДА ПОМОГНЕ ═══');
const самотни = карти.filter(z => /(сама съм|нямам помощ|няма кой|самотн)/i.test(цял(z)));
ред('карти, които говорят за САМА майка', самотни.length < 15 ? '🟠' : '·', самотни.length + ' от ' + карти.length);
const сПартньор = карти.filter(z => /(партньор|мъж[ъа]т|съпруг|бащата)/i.test(цял(z)));
ред('карти, които споменават партньор', '·', сПартньор.length + '');
const дайНа = карти.filter(z => /(дай (го|я) на|нека (той|някой)|помоли (го|някого)|подай бебето)/i.test(цял(z)));
ред('съвети „подай бебето на някого"', дайНа.length > 20 ? '🟠' : '·', дайНа.length + ' — работят само ако има кой');

// ── 4. ПАРИТЕ ──
console.log('');
console.log('═══ 4. ПРЕДПОЛАГА ЛИ СЕ, ЧЕ ИМА ПАРИ ═══');
for (const [име, r] of [['„купи" / „вземи си"', /(купи|купуваш|вземи си|сдобий се)/gi],
  ['частен лекар / платено', /частн|платен преглед|платена консултаци/gi],
  ['„не ти трябва да купуваш"', /не ти трябва|не купувай|без да купуваш|не е нужно да купуваш/gi],
  ['безплатно / по здравна каса', /безплатн|по каса|НЗОК|здравната каса/gi]]) {
  const n = (целият.match(r) || []).length;
  ред(име, '·', n + '');
}

// ── 5. КАКВО СЕ СЛУЧВА, КОГАТО НИЩО НЕ Е ВЪВЕДЕНО ──
console.log('');
console.log('═══ 5. ПРАЗНОТО СЪСТОЯНИЕ ═══');
for (const [име, r] of [['проверка за липсваща дата', /if\s*\(!\s*b(aby)?\.birth|!birth/g],
  ['текст „още няма"/„празно"', /още няма|празно е|нямаш записи|първият ти/gi],
  ['резервен текст при липса', /\|\|\s*['"][^'"]{6,}['"]/g]]) {
  const n = (код.match(r) || []).length;
  ред(име, n < 5 ? '🟠' : '·', n + '');
}

// ── 6. КОЛКО ДАЛЕЧ Е СПЕШНОТО ──
console.log('');
console.log('═══ 6. КОЛКО БЪРЗО СЕ СТИГА ДО 112 ═══');
const сos = карти.filter(z => /112/.test(цял(z)));
ред('карти, които дават 112', '·', сos.length + ' от ' + карти.length);
const вПървите = сos.filter(z => гол(z.core).indexOf('112') >= 0 && гол(z.core).indexOf('112') < 400);
ред('112 в първите 400 знака на ядрото', '·', вПървите.length + '');
ред('112 само в follow (най-долу)', '·', сos.filter(z => !/112/.test(гол(z.core)) && /112/.test(гол(z.follow))).length + '');
// има ли бутон за звънене
ред('tel: връзка в кода', /tel:/.test(код + html) ? '·' : '🟠', (код + html).match(/tel:/g) ? ((код + html).match(/tel:/g) || []).length + ' места' : 'НЯМА — номерът се набира на ръка');

// ── 7. КАРТИ, ПИСАНИ ДНЕС СРЕЩУ СТАРИ ──
console.log('');
console.log('═══ 7. КОЛКО ОТ БАЗАТА Е МИНАЛА ПРЕЗ ДНЕШНИТЕ ПАЗАЧИ ═══');
const { execSync } = require('child_process');
try {
  const днес = execSync('git log --since="1 day ago" --name-only --pretty=format: -- js/kb.js lib/', { cwd: К, encoding: 'utf8' })
    .split('\n').filter(Boolean);
  ред('файлове, пипани в последното денонощие', '·', [...new Set(днес)].length + '');
  const общо = execSync('git log --oneline | wc -l', { cwd: К, encoding: 'utf8' }).trim();
  const дн = execSync('git log --oneline --since="1 day ago" | wc -l', { cwd: К, encoding: 'utf8' }).trim();
  ред('качвания общо · днес', '·', общо + ' · ' + дн);
} catch (e) { ред('git', '🟠', e.message.slice(0, 40)); }
console.log('');
