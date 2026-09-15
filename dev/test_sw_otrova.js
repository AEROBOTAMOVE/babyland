// ═══════════════════════════════════════════════════════════════════════
// ☠️ ОТРОВАТА ОТ ХОСТИНГА — запомня ли service worker-ът чужда страница?
//
// ЗАЩО (15.09.2026): на cPanel/LiteSpeed спрян акаунт (например неплатен
//   хостинг) се пренасочва към /cgi-sys/suspendedpage.cgi — HTML страница.
//   Източник: форумът на LiteSpeed,
//   https://www.litespeedtech.com/support/forum/threads/litespeed-cpanel-account-suspension.9744/
//   fetch в service worker-а СЛЕДВА пренасочването. Ако крайната страница е
//   със статус 200 (ПРЕДПОЛОЖЕНО — тя е страница, не грешка), res.ok е true.
//   До днес sw.js гледаше само res.ok. Тоест скрипт, изтеглен в този
//   прозорец, влизаше в кеша като HTML. Кешът е „кеш-първо по точен URL",
//   а пренеси() го носи напред при всяко следващо качване: хостингът се
//   плаща, всичко изглежда оправено, а у майката приложението остава
//   счупено, докато файлът не смени ?v=.
//
// МЕРИ пазиУспешни, кеширайПоединично и пренеси в пясъчник, с измислени
//   отговори, чийто верен изход е известен предварително.
// ⚠️ САМОПРОВЕРКА: наивното „кеширай всичко с res.ok" трябва да ПАДНЕ на
//   отровните случаи — иначе случаите не различават нищо.
//
// ПУСКАНЕ: node dev/test_sw_otrova.js [файл]    (по подразбиране sw.js)
//          node dev/test_sw_otrova.js sw.js.PREDI_OTROVA   ← старият ПАДА
// ПЪТ НАЗАД: само ЧЕТЕ.
// ═══════════════════════════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');
const vm = require('vm');
process.chdir(path.resolve(__dirname, '..'));

const ФАЙЛ = process.argv[2] || 'sw.js';
const БАЗА = 'https://proba.bg/';
const абс = u => new URL(typeof u === 'string' ? u : u.url, БАЗА).href;

function отговор(тяло, тип, опц) {
  const о = опц || {};
  const r = new Response(тяло, { status: о.статус || 200, headers: { 'content-type': тип } });
  if (о.пренасочен) Object.defineProperty(r, 'redirected', { value: true });
  return r;
}
const СПРЯН = () => отговор('<html>Този акаунт е спрян</html>', 'text/html; charset=utf-8', { пренасочен: true });
const СКРИПТ = () => отговор('var a = 1;', 'text/javascript');
const СТИЛ = () => отговор('a{color:red}', 'text/css');
const СТРАНИЦА = () => отговор('<html>Бейби Ленд</html>', 'text/html; charset=utf-8');

function пясъчник(мрежа) {
  const хранилища = new Map();
  function отвори(име) {
    if (!хранилища.has(име)) хранилища.set(име, new Map());
    const м = хранилища.get(име);
    return {
      async put(req, res) {
        const u = абс(req);
        const режим = (typeof req === 'object' && req.mode) ? (req.mode === 'navigate' ? 'same-origin' : req.mode) : 'cors';
        м.set(u, { req: { url: u, mode: режим }, res });
      },
      async match(req, опц) {
        const u = абс(req);
        if (м.has(u)) return м.get(u).res.clone();
        if (опц && опц.ignoreSearch) {
          const без = u.split('?')[0];
          for (const [к, в] of м) if (к.split('?')[0] === без) return в.res.clone();
        }
        return undefined;
      },
      async keys() { return [...м.values()].map(x => x.req); },
      async add(u) { const r = await мрежаFetch(u); if (!r.ok) throw new TypeError('не е ok'); await this.put(u, r); },
    };
  }
  async function мрежаFetch(req) {
    const ключ = абс(req).replace(БАЗА, '');
    const f = мрежа[ключ] || мрежа[ключ.split('?')[0]];
    return f ? f() : отговор('няма го', 'text/plain', { статус: 404 });
  }
  const ctx = {
    self: { addEventListener() {}, skipWaiting() {}, clients: { claim() {}, matchAll: async () => [] } },
    caches: {
      open: async и => отвори(и),
      keys: async () => [...хранилища.keys()],
      delete: async и => хранилища.delete(и),
      match: async (r, о) => { for (const и of хранилища.keys()) { const x = await отвори(и).match(r, о); if (x) return x; } return undefined; },
    },
    fetch: мрежаFetch, Request, Response, Headers, URL, setTimeout, clearTimeout,
    console: { log() {}, error() {}, warn() {} },
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(ФАЙЛ, 'utf8'), ctx, { filename: ФАЙЛ });
  return { ctx, отвори, CACHE: vm.runInContext('CACHE', ctx) };
}
const пауза = () => new Promise(r => setTimeout(r, 30));
const вКеша = async (с, u, име) => !!(await с.отвори(име || с.CACHE).match(u));
async function пази(с, url, режим, res) {
  с.ctx.пазиУспешни({ url, mode: режим, destination: режим === 'navigate' ? 'document' : '' }, res);
  await пауза();
  return вКеша(с, url);
}

// [име, мрежа, проба, очакван отговор, отровен ли е случаят за пазиУспешни]
const СЛУЧАИ = [
  ['обикновен скрипт влиза в кеша', {}, с => пази(с, БАЗА + 'js/app.js?v=5', 'cors', СКРИПТ()), true],
  ['стил влиза в кеша', {}, с => пази(с, БАЗА + 'css/style.css?v=9', 'cors', СТИЛ()), true],
  ['страницата (навигация) влиза в кеша', {}, с => пази(с, БАЗА, 'navigate', СТРАНИЦА()), true],
  ['☠️ страницата за спрян акаунт НЕ влиза като скрипт', {}, с => пази(с, БАЗА + 'js/kb.js?v=13', 'cors', СПРЯН()), false, true],
  ['☠️ HTML без пренасочване НЕ влиза като скрипт', {}, с => пази(с, БАЗА + 'js/lib.js?v=3', 'cors', СТРАНИЦА()), false, true],
  ['☠️ HTML НЕ влиза като JSON на библиотеката', {}, с => пази(с, БАЗА + 'lib/index.json?v=7', 'cors', СТРАНИЦА()), false, true],
  ['☠️ инсталация при спрян акаунт: скриптът пада, стилът и страницата влизат',
    { 'js/app.js': СПРЯН, 'css/style.css': СТИЛ, 'index.html': СТРАНИЦА },
    async с => {
      const c = await с.ctx.caches.open(с.CACHE);
      const паднали = await с.ctx.кеширайПоединично(c, ['js/app.js', 'css/style.css', 'index.html']);
      return паднали.length === 1 && паднали[0] === 'js/app.js' &&
        !(await вКеша(с, 'js/app.js')) && (await вКеша(с, 'css/style.css')) && (await вКеша(с, 'index.html'));
    }, true],
  ['☠️ пренеси() не носи напред вече отровен запис', {},
    async с => {
      const стар = await с.ctx.caches.open('babyland-v1');
      await стар.put({ url: БАЗА + 'js/kb.js?v=13', mode: 'cors' }, СПРЯН());
      await стар.put({ url: БАЗА + 'js/app.js?v=5', mode: 'cors' }, СКРИПТ());
      await стар.put({ url: БАЗА + 'index.html', mode: 'cors' }, СТРАНИЦА());
      await с.ctx.пренеси(await с.ctx.caches.open(с.CACHE));
      return !(await вКеша(с, БАЗА + 'js/kb.js?v=13')) && (await вКеша(с, БАЗА + 'js/app.js?v=5')) && (await вКеша(с, БАЗА + 'index.html'));
    }, true],
];

(async () => {
  console.log('');
  console.log('☠️  ОТРОВАТА ОТ ХОСТИНГА — файл: ' + ФАЙЛ);

  // самопроверка: наивната функция трябва да падне на отровните случаи
  const наивна = function (с) {
    return function (req, res) {
      if (res && res.ok) { const copy = res.clone(); с.ctx.caches.open(с.CACHE).then(c => c.put(req, copy)); }
      return res;
    };
  };
  let различават = 0, отровни = 0;
  for (const [, мрежа, проба, очаквано, отровен] of СЛУЧАИ) {
    if (!отровен) continue;
    отровни++;
    const с = пясъчник(мрежа);
    с.ctx.пазиУспешни = наивна(с);
    if ((await проба(с)) !== очаквано) различават++;
  }
  if (!отровни || различават !== отровни) {
    console.log('  🔴 СЛЯП: наивното „кеширай с res.ok" пада само на ' + различават + ' от ' + отровни + ' отровни случая');
    process.exit(2);
  }
  console.log('  самопроверка: наивното „кеширай всичко с res.ok" пада на ' + различават + '/' + отровни + ' отровни случая ✅');

  let паднали = 0;
  for (const [име, мрежа, проба, очаквано] of СЛУЧАИ) {
    let ок = false, беля = '';
    try { ок = (await проба(пясъчник(мрежа))) === очаквано; } catch (e) { беля = ' · ' + e.message; }
    if (!ок) паднали++;
    console.log('  ' + (ок ? '✅' : '🔴') + ' ' + име + беля);
  }
  console.log('');
  if (паднали) { console.log('🔴 ' + паднали + ' от ' + СЛУЧАИ.length + ' случая падат — service worker-ът може да запомни чужда страница'); process.exit(1); }
  console.log('✅ ЧИСТО — ' + СЛУЧАИ.length + '/' + СЛУЧАИ.length + ' случая · service worker-ът не запомня чужда страница като скрипт');
})();
