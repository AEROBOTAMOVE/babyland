// ═══════════════════════════════════════════════════════════════════════
// 🧭 НАВИГАЦИЯТА НА SERVICE WORKER-А — коя страница получава майката?
//
// ЗАЩО (15.09.2026): преглед на PWA (агент, мерил в Chromium) твърди три
//   дефекта в sw.js, всичките отпреди днес:
//     1. офлайн „/" дава НАЙ-СТАРАТА запазена страница: всяка навигация
//        (./?go=feed от манифеста, ?fbclid= от Facebook) се пази под свой
//        адрес, а резервът с ignoreSearch връща ПЪРВИЯ записан;
//     2. при 404/500/503 от хостинга майката вижда страницата за грешка —
//        fetch() не се проваля при HTTP грешка, кешът се ползва само без мрежа;
//     3. офлайн резервът за скрипт дава копието от ПЪРВАТА инсталация, а не
//        най-новата запазена версия.
//   Мярката на агента е НЕГОВА. Този уред ги възпроизвежда ТУК — и после
//   пази поправката.
//
// Кешът в пясъчника спазва спецификацията на Service Workers: put трие стария
//   запис и добавя новия НАКРАЯ; match с ignoreSearch връща ПЪРВИЯ по реда на
//   записване. Самопроверката мери точно това, преди да съди sw.js.
//
// ПУСКАНЕ: node dev/test_sw_navigacia.js [файл]    (по подразбиране sw.js)
// ИЗХОД:   0 = всичко минава · 1 = има падане · 2 = пясъчникът лъже
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
  if (о.url) Object.defineProperty(r, 'url', { value: о.url });
  return r;
}
const ТИП = u => /\.js(\?|$)/.test(u) ? 'text/javascript' : /\.css(\?|$)/.test(u) ? 'text/css'
  : /\.json(\?|$)/.test(u) ? 'application/json' : /\.(png|woff2|svg|webmanifest)(\?|$)/.test(u) ? 'application/octet-stream'
  : 'text/html; charset=utf-8';

function пясъчник() {
  const хранилища = new Map();
  const безТърсене = u => u.split('?')[0];
  const върни = в => { const c = в.res.clone(); Object.defineProperty(c, 'url', { value: в.url }); return c; };
  function отвори(име) {
    if (!хранилища.has(име)) хранилища.set(име, new Map());
    const м = хранилища.get(име);
    return {
      async put(req, res) {
        const u = абс(req);
        const режим = (typeof req === 'object' && req.mode) ? (req.mode === 'navigate' ? 'same-origin' : req.mode) : 'cors';
        м.delete(u);                                   // спецификацията: старото се трие…
        м.set(u, { req: { url: u, mode: режим }, res, url: res.url || u });   // …новото отива НАКРАЯ
      },
      async match(req, опц) {
        const u = абс(req);
        if (!(опц && опц.ignoreSearch)) return м.has(u) ? върни(м.get(u)) : undefined;
        for (const [к, в] of м) if (безТърсене(к) === безТърсене(u)) return върни(в);
        return undefined;
      },
      async matchAll(req, опц) {
        const u = абс(req), изход = [];
        for (const [к, в] of м) if ((опц && опц.ignoreSearch) ? безТърсене(к) === безТърсене(u) : к === u) изход.push(върни(в));
        return изход;
      },
      async keys() { return [...м.values()].map(x => x.req); },
      async add(u) { const r = await ctx.fetch(u); if (!r.ok) throw new TypeError('не е ok'); await this.put(u, r); },
      async delete(u) { return м.delete(абс(u)); },
    };
  }
  const слушатели = {};
  const мрежа = { офлайн: false, карта: {} };
  async function мрежаFetch(req) {
    if (мрежа.офлайн) throw new TypeError('Failed to fetch');
    const u = абс(req);
    const ключ = u.replace(БАЗА, '');
    const f = мрежа.карта[ключ] || мрежа.карта[ключ.split('?')[0]];
    return f ? f(u) : отговор('ок ' + ключ, ТИП(u), { url: u });
  }
  const ctx = {
    self: {
      addEventListener: (т, ф) => { слушатели[т] = ф; }, skipWaiting() {},
      registration: { scope: БАЗА },
      location: { href: БАЗА + 'sw.js', toString() { return БАЗА + 'sw.js'; } },
      clients: { claim() {}, matchAll: async () => [] },
    },
    caches: {
      open: async и => отвори(и),
      keys: async () => [...хранилища.keys()],
      delete: async и => хранилища.delete(и),
      has: async и => хранилища.has(и),
      match: async (r, о) => { for (const и of хранилища.keys()) { const x = await отвори(и).match(r, о); if (x) return x; } return undefined; },
    },
    fetch: мрежаFetch, Request, Response, Headers, URL, setTimeout, clearTimeout,
    console: { log() {}, error() {}, warn() {} },
  };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(ФАЙЛ, 'utf8'), ctx, { filename: ФАЙЛ });
  return { ctx, отвори, слушатели, мрежа, CACHE: vm.runInContext('CACHE', ctx) };
}

const пауза = () => new Promise(r => setTimeout(r, 30));
async function заявка(с, url, режим) {
  let обещание = null;
  const req = { url: абс(url), mode: режим, destination: режим === 'navigate' ? 'document' : 'script',
    method: 'GET', redirect: режим === 'navigate' ? 'manual' : 'follow' };
  с.слушатели.fetch({ request: req, respondWith(p) { обещание = Promise.resolve(p); }, waitUntil() {} });
  if (!обещание) return null;
  let res = null;
  try { res = await обещание; } catch (e) { res = null; }
  await пауза();
  return res;
}
const тяло = async r => (r && typeof r.text === 'function') ? await r.text() : '';
async function събитие(с, вид) {
  let p = null;
  с.слушатели[вид]({ waitUntil(x) { p = x; } });
  await p; await пауза();
}
const страница = име => u => отговор(име, 'text/html; charset=utf-8', { url: u });
const СТРАНИЦА_С_ВЕРСИИ = u => отговор('<link rel="stylesheet" href="css/style.css?v=55">' +
  '<script src="js/kb.js?v=247" defer></script><script src="js/lib.js?v=103" defer></script>',
  'text/html; charset=utf-8', { url: u });

const СЛУЧАИ = [
  ['онлайн навигацията връща мрежата', async с => {
    с.мрежа.карта[''] = страница('СТРАНИЦА-1');
    return (await тяло(await заявка(с, '', 'navigate'))) === 'СТРАНИЦА-1';
  }],
  ['1 · офлайн „/" дава ПОСЛЕДНАТА страница, не копието от прекия път', async с => {
    с.мрежа.карта[''] = страница('СТАРА');
    await заявка(с, '?go=feed', 'navigate');           // прекият път „Хранене" от манифеста
    с.мрежа.карта[''] = страница('НОВА');
    await заявка(с, '', 'navigate');                   // по-късно, след качване
    с.мрежа.офлайн = true;
    return (await тяло(await заявка(с, '', 'navigate'))) === 'НОВА';
  }],
  ['2 · хостът дава 503 при навигация → майката получава приложението от кеша', async с => {
    с.мрежа.карта[''] = страница('ПРИЛОЖЕНИЕТО');
    await заявка(с, '', 'navigate');
    с.мрежа.карта[''] = u => отговор('508 Resource Limit Is Reached', 'text/html', { статус: 503, url: u });
    return (await тяло(await заявка(с, '', 'navigate'))) === 'ПРИЛОЖЕНИЕТО';
  }],
  ['пренасочване при навигация минава непокътнато', async с => {
    const пренасочване = { type: 'opaqueredirect', ok: false, status: 0, headers: new Headers(), clone() { return this; } };
    с.мрежа.карта[''] = () => пренасочване;
    const r = await заявка(с, '', 'navigate');
    return !!r && r.type === 'opaqueredirect';
  }],
  ['страница за спрян акаунт не заменя приложението офлайн', async с => {
    с.мрежа.карта[''] = страница('ПРИЛОЖЕНИЕТО');
    await заявка(с, '', 'navigate');
    с.мрежа.карта['cgi-sys/suspendedpage.cgi'] = страница('СПРЯН');
    await заявка(с, 'cgi-sys/suspendedpage.cgi', 'navigate');
    с.мрежа.офлайн = true;
    return (await тяло(await заявка(с, '', 'navigate'))) === 'ПРИЛОЖЕНИЕТО';
  }],
  ['3 · офлайн резервът за скрипт дава НАЙ-НОВАТА запазена версия', async с => {
    const c = await с.ctx.caches.open(с.CACHE);
    await c.put('js/app.js', отговор('ОТ-ПЪРВАТА-ИНСТАЛАЦИЯ', 'text/javascript', { url: БАЗА + 'js/app.js' }));
    await c.put('js/app.js?v=5', отговор('V5', 'text/javascript', { url: БАЗА + 'js/app.js?v=5' }));
    await c.put('js/app.js?v=6', отговор('V6', 'text/javascript', { url: БАЗА + 'js/app.js?v=6' }));
    с.мрежа.офлайн = true;
    return (await тяло(await заявка(с, 'js/app.js?v=7', 'cors'))) === 'V6';
  }],
  ['1+ · след качване: копието от прекия път не пътува напред и не печели офлайн', async с => {
    const стар = await с.ctx.caches.open('babyland-v1');
    await стар.put({ url: БАЗА + '?go=feed', mode: 'navigate' }, отговор('СТАРА', 'text/html', { url: БАЗА + '?go=feed' }));
    await стар.put({ url: БАЗА, mode: 'navigate' }, отговор('ПОСЛЕДНАТА', 'text/html', { url: БАЗА }));
    с.мрежа.карта[''] = страница('СВЕЖА');
    await събитие(с, 'install');
    await събитие(с, 'activate');
    const нов = await с.ctx.caches.open(с.CACHE);
    const копие = await нов.match(БАЗА + '?go=feed');
    с.мрежа.офлайн = true;
    const т = await тяло(await заявка(с, '', 'navigate'));
    return !копие && (т === 'ПОСЛЕДНАТА' || т === 'СВЕЖА');
  }],
  // 🔢 15.09 (ЗАДАЧИ.md т.14): инсталацията пази адресите, които страницата
  //   наистина иска — с ?v= от свежия index.html и ?v=LV от js/lib.js.
  ['4 · инсталацията пази ТОЧНИТЕ адреси от страницата, без безверсийни копия', async с => {
    с.мрежа.карта['index.html'] = СТРАНИЦА_С_ВЕРСИИ;
    с.мрежа.карта['js/lib.js'] = u => отговор("const LV = '108';", 'text/javascript', { url: u });
    await събитие(с, 'install');
    const c = await с.ctx.caches.open(с.CACHE);
    const има = async u => !!(await c.match(u));
    return await има('js/kb.js?v=247') && await има('css/style.css?v=55') && await има('lib/index.json?v=108')
      && await има('fonts/nunito-400-cyrillic.woff2') && !(await има('js/kb.js')) && !(await има('lib/index.json'));
  }],
  ['4 · офлайн веднага след първата инсталация: точният адрес е в кеша', async с => {
    с.мрежа.карта['index.html'] = СТРАНИЦА_С_ВЕРСИИ;
    await събитие(с, 'install');
    с.мрежа.офлайн = true;
    return (await тяло(await заявка(с, 'js/kb.js?v=247', 'cors'))) === 'ок js/kb.js?v=247';
  }],
  ['4 · страницата не се чете (503) → безверсийните адреси, както преди', async с => {
    с.мрежа.карта['index.html'] = u => отговор('508 Resource Limit Is Reached', 'text/html', { статус: 503, url: u });
    await събитие(с, 'install');
    const c = await с.ctx.caches.open(с.CACHE);
    return !!(await c.match('js/kb.js')) && !(await c.match('js/kb.js?v=247'));
  }],
  ['4 · безверсийното копие от старата инсталация не пътува напред, шрифтът — да', async с => {
    const стар = await с.ctx.caches.open('babyland-v1');
    await стар.put('js/kb.js', отговор('ЗАМРАЗЕНО', 'text/javascript', { url: БАЗА + 'js/kb.js' }));
    await стар.put('fonts/nunito-400-cyrillic.woff2', отговор('ШРИФТ', 'application/octet-stream', { url: БАЗА + 'fonts/nunito-400-cyrillic.woff2' }));
    с.мрежа.карта['index.html'] = СТРАНИЦА_С_ВЕРСИИ;
    await събитие(с, 'install');
    await събитие(с, 'activate');
    const c = await с.ctx.caches.open(с.CACHE);
    return !(await c.match('js/kb.js')) && (await тяло(await c.match('fonts/nunito-400-cyrillic.woff2'))) === 'ШРИФТ';
  }],
];

(async () => {
  console.log('');
  console.log('🧭 НАВИГАЦИЯТА НА SERVICE WORKER-А — файл: ' + ФАЙЛ);

  // самопроверка: пясъчникът спазва ли реда от спецификацията
  const с0 = пясъчник();
  const c0 = await с0.ctx.caches.open('proba');
  await c0.put(БАЗА + 'a?x=1', отговор('A1', 'text/plain'));
  await c0.put(БАЗА + 'a', отговор('A0', 'text/plain'));
  await c0.put(БАЗА + 'a?x=1', отговор('A2', 'text/plain'));
  const първи = await тяло(await c0.match(БАЗА + 'a', { ignoreSearch: true }));
  const ред = (await c0.keys()).map(k => k.url.replace(БАЗА, '')).join(',');
  if (първи !== 'A0' || ред !== 'a,a?x=1') {
    console.log('  🔴 ПЯСЪЧНИКЪТ ЛЪЖЕ: ignoreSearch дава „' + първи + '", редът е „' + ред + '"');
    process.exit(2);
  }
  console.log('  самопроверка: put мести записа накрая, ignoreSearch връща първия — като в спецификацията ✅');

  let паднали = 0;
  for (const [име, проба] of СЛУЧАИ) {
    let ок = false, беля = '';
    try { ок = await проба(пясъчник()); } catch (e) { беля = ' · ' + e.message; }
    if (!ок) паднали++;
    console.log('  ' + (ок ? '✅' : '🔴') + ' ' + име + беля);
  }
  console.log('');
  if (паднали) { console.log('🔴 ' + паднали + ' от ' + СЛУЧАИ.length + ' случая падат'); process.exit(1); }
  console.log('✅ ЧИСТО — ' + СЛУЧАИ.length + '/' + СЛУЧАИ.length + ' случая · майката получава последната страница, и при грешка на хостинга');
})();
