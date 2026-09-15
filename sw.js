// Baby Land — service worker: кешира приложението за офлайн работа
const CACHE = 'babyland-v706';
const ASSETS = [
  '.',
  'index.html',
  'css/fonts.css',
  'fonts/comfortaa-400-cyrillic.woff2',
  'fonts/comfortaa-400-latin.woff2',
  'fonts/comfortaa-600-cyrillic.woff2',
  'fonts/comfortaa-600-latin.woff2',
  'fonts/comfortaa-700-cyrillic.woff2',
  'fonts/comfortaa-700-latin.woff2',
  'fonts/nunito-400-cyrillic.woff2',
  'fonts/nunito-400-latin.woff2',
  'fonts/nunito-400i-cyrillic.woff2',
  'fonts/nunito-400i-latin.woff2',
  'fonts/nunito-600-cyrillic.woff2',
  'fonts/nunito-600-latin.woff2',
  'fonts/nunito-700-cyrillic.woff2',
  'fonts/nunito-700-latin.woff2',
  'fonts/nunito-800-cyrillic.woff2',
  'fonts/nunito-800-latin.woff2',
  'fonts/pacifico-400-cyrillic.woff2',
  'fonts/pacifico-400-latin.woff2',
  'css/style.css',
  'css/rooms.css',
  'css/dark.css',
  'css/extras.css',
  'css/mega.css',
  'css/home.css',
  'css/hero.css',
  'css/scenes.css',
  'css/women.css',
  'css/lab.css',
  'css/profile.css',
  'css/touch.css',
  'css/anim.css',
  'css/tier.css',
  'js/tier.js',
  'js/redna.js',
  'js/broi.js',
  'js/app.js',
  'js/plavno.js',
  'js/izvan_ekrana.js',
  // 25.08 — четирите нови от днешния ден. БЕЗ ТОЗИ РЕД приложението губи
  // офлайн точно тях: пазача на картите, тайните, гласа и предупреждението
  // за две отворени копия. Пазач срещу повторение: dev/sw_pulen.js
  'js/pazach_karti.js',
  'js/tayni.js',
  'js/glas.js',
  'js/dve_kopiya.js',
  'js/nav2.js',
  'js/store.js',
  'js/expect.js',
  'js/kb.js',
  'js/data.js',
  'js/rooms2.js',
  'js/pump.js',
  'js/checkups.js',
  'js/articles.js',
  'js/reader.js',
  'js/extras.js',
  'js/extras2.js',
  'js/photos.js',
  'js/storage.js',
  'js/daily.js',
  'js/quickadd.js',
  'js/chasovnik.js',
  'js/garch.js',
  'js/calm.js',
  'js/games2.js',
  'js/expr.js',
  'js/lib.js',
  'js/wisdom.js',
  'js/wisdom2.js',
  'js/rooms3.js',
  'js/rooms4.js',
  'js/river.js',
  'js/yearbook.js',
  'js/yearbook2.js',
  'js/badges2.js',
  'js/rooms5.js',
  'js/rooms6.js',
  'js/rooms7.js',
  'js/rooms8.js',
  'js/rooms9.js',
  'js/rooms10.js',
  'js/rooms11.js',
  'js/rooms12.js',
  'js/rooms13.js',
  'js/rooms14.js',
  'js/rooms15.js',
  'js/rooms16.js',
  'js/rooms17.js',
  'js/rooms18.js',
  'js/rooms19.js',
  'js/baby2.js',
  'js/sleephist.js',
  'js/fx.js',
  'js/ui.js',
  'js/search.js',
  'js/sos.js',
  'js/women.js',
  'js/women2.js',
  'js/women3.js',
  'js/women4.js',
  'js/women5.js',
  'js/lab.js',
  'js/obichai.js',
  'js/order8.js',
  'js/order9.js',
  'js/crypto.js',
  'js/profile.js',
  'js/smalltalk.js',
  'js/smalltalk2.js',
  'js/helper.js',
  'js/guard.js',
  'js/journal.js',
  'js/dev.js',
  'js/preg.js',
  'js/order4.js',
  'js/feedsafe.js',
  'js/polish.js',
  'js/iface.js',
  'js/preg20.js',
  'js/roomhero.js',
  'js/anim.js',
  'js/roomfx.js',
  'js/roommap.js',
  'js/tabs.js',
  'js/firstday.js',
  'js/today8.js',
  'js/nightrecap.js',
  'js/dates2.js',
  'js/askfield.js',
  'js/secrets.js',
  'js/printbox.js',
  'js/shop.js',
  'js/night.js',
  'js/home.js',
  'js/home2.js',
  'js/hero.js',
  'js/rooms.js',
  'js/onboard.js',
  'lib/index.json',
  'lib/lab-1.json',
  'lib/women-1.json',
  // проход 3 T6: без тези 10 библиотеката се търсеше офлайн (index.json е кеширан),
  // но статиите излизаха празни (lib.js catch→{}). „3 през нощта в самолетен режим".
  'lib/baby-1.json',
  'lib/dev-1.json',
  'lib/feed-1.json',
  'lib/feed-2.json',
  'lib/health-1.json',
  'lib/health-2.json',
  'lib/health-3.json',
  'lib/mama-1.json',
  'lib/preg-1.json',
  'lib/tools-1.json',
  'lib/modern-1.json',
  'lib/modern-2.json',
  'lib/sezoni-1.json',
  'lib/igri-1.json',
  'manifest.webmanifest',
  'img/logo.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable.svg',
  'icons/icon.svg'
];

// ── ИНСТАЛАЦИЯ ────────────────────────────────────────────────────────────
// 🔴 21.08 (офлайн одит, ИЗМЕРЕНО): дотук стоеше `c.addAll(ASSETS)`.
//    addAll е ВСИЧКО-ИЛИ-НИЩО: един-единствен 404 от 151 адреса отхвърля
//    ЦЕЛИЯ набор → кешът остава ПРАЗЕН → мама в 3 през нощта без мрежа вижда
//    бял екран, и НИКОЙ не разбира, защото register().catch(() => {}) в
//    js/app.js гълта и последната следа. Сега всеки адрес се кешира ПООТДЕЛНО.
//
// 🪤 Обратният капан (по-опасен от първия): „устойчиво" да стане „мълчаливо".
//    Тихо преглътната грешка значи офлайн просто няма да работи и никой няма
//    да разбере. Затова падналите се КАЗВАТ на три места, не на нула:
//      1) console.error в SW конзолата
//      2) postMessage до всички отворени страници ({тип:'офлайн-непълен'})
//      3) запис в самия кеш под 'bl-oflayn-doklad' → чете се по всяко време с
//         `caches.match('bl-oflayn-doklad').then(r => r.json())`, и от жив
//         браузър, и от проверчик. Логът в конзолата изчезва; записът остава.
const ДОКЛАД = 'bl-oflayn-doklad';

// ═══════════════════════════════════════════════════════════════════════
// ☠️ 15.09 — ОТРОВАТА ОТ ХОСТИНГА
//   Спрян cPanel/LiteSpeed акаунт (например неплатен хостинг) пренасочва
//   адресите към /cgi-sys/suspendedpage.cgi — HTML страница (форумът на
//   LiteSpeed, нишка 9744). fetch следва пренасочването и ако страницата е
//   със статус 200, res.ok е true. c.add() и старото пазиУспешни гледаха
//   само това — тоест скрипт, изтеглен в този прозорец, влизаше в кеша като
//   HTML. А кешът е „кеш-първо по точен URL" и пренеси() го носи напред:
//   хостингът се плаща, всичко изглежда оправено, а у майката приложението
//   остава счупено, докато файлът не смени ?v=.
//   ПРАВИЛОТО: статичен файл, дошъл след пренасочване или като HTML, не се
//   пази. Навигацията е изключение — тя Е страница.
//   МЕРИ СЕ: dev/test_sw_otrova.js — и срещу стария sw.js, който трябва да
//   падне. ПЪТ НАЗАД: sw.js.PREDI_OTROVA · git revert
// ═══════════════════════════════════════════════════════════════════════
function отровен(req, res) {
  if (!res) return true;
  if (req.mode === 'navigate' || req.destination === 'document') return false;
  if (res.redirected) return true;
  const път = String(req.url || req).split(/[?#]/)[0];
  const тип = (res.headers && res.headers.get('content-type')) || '';
  return /\.(js|css|json|webmanifest|woff2?|png|svg)$/i.test(път) && /text\/html/i.test(тип);
}

async function кеширайПоединично(c, адреси) {
  const паднали = [];
  await Promise.all(адреси.map(a =>
    fetch(a).then(res => {
      if (!res.ok || отровен({ url: a }, res)) throw new Error('не се пази: ' + a);
      return c.put(a, res);
    }).catch(() => { паднали.push(a); })
  ));
  return паднали;
}

// ═══════════════════════════════════════════════════════════════════════
// 🔴🔴 ПРЕНАСЯНЕ ВМЕСТО ИЗТРИВАНЕ (07.09.2026, ИЗМЕРЕНО)
//
//   ДЕФЕКТЪТ: `activate` триеше ВСЕКИ кеш, чието име не е текущото, а
//   името съдържа версията. Тоест при всяко качване целият кеш отиваше в
//   кофата и телефонът теглеше приложението НАНОВО.
//   Измерено на живо преди поправката: 100 скрипта, 8.6 MB JS, 615 KB CSS,
//   804 KB библиотека — 10.3 MB на едно качване. Само за един ден вдигнах
//   версията десетина пъти. Това е десет пъти по 10 MB от нейния трафик.
//
//   ЗАЩО ПРЕНАСЯНЕТО Е БЕЗОПАСНО: dev/vdigni_versii.js вдига `?v=` САМО на
//   файловете, сменени в git diff. Значи URL-ът на непроменен файл е БУКВА
//   ПО БУКВА същият и старият отговор е точно толкова валиден, колкото и
//   новият. Пренася се по ТОЧЕН URL — сменен файл има нов `?v=`, не се
//   намира в стария кеш и се тегли от мрежата, както трябва.
//
//   ⚠️ ПАЗАЧ: всяко `put` е в try/catch. Ако телефонът няма място, пренасянето
//   се проваля ТИХО за този адрес и той просто се тегли — по-бавно, но цяло.
//   Никога не бива липсата на място да остави приложението без офлайн.
//
//   ПЪТ НАЗАД: махни извикването на пренеси() от install и върни реда
//   `let паднали = await кеширайПоединично(c, ASSETS);`
// ═══════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════
// 📦 ПРЕНАСЯНЕ НА СТАРИЯ КЕШ — но САМО най-новата версия на всеки файл
//
// 🔴 08.09, ПОПРАВКА НА СОБСТВЕНАТА МИ ГРЕШКА ОТ СЪЩИЯ ДЕН:
//   Първата версия на пренеси() копираше ВСЕКИ запис от стария кеш. Целта
//   беше добра (качване без 10.3 МБ ново теглене), но страничният ефект е
//   натрупване БЕЗ ТАВАН: всяка стара версия пътува напред при всяко
//   следващо качване.
//   ИЗМЕРЕНО В ЖИВИЯ БРАУЗЪР след ЕДИН ден работа:
//       322 записа за 163 пътя · 119 пътя с по няколко версии
//       style.css: (без) ?v=50 ?v=51 ?v=53 ?v=55  ← четири мъртви копия
//   На телефона на майка, през месеци качвания, това расте безкрайно.
//   ПРЕДИ пренеси() старият кеш просто се триеше — тоест боклукът се
//   събираше сам. Оптимизацията ми беше махнала и това чистене.
//
// ПРАВИЛОТО СЕГА: за всеки път се пренася само НАЙ-ВИСОКАТА ?v= версия,
//   плюс безверсийния запис (ASSETS ползва точно такива URL-и). Кешът се
//   свива до най-много 2 записа на файл — и вече натрупаното също се свива,
//   защото старите просто не се пренасят напред.
// ПЪТ НАЗАД: git checkout sw.js
// ═══════════════════════════════════════════════════════════════════════
function номерНаВерсията(url) {
  var m = /[?&]v=([0-9]+)/.exec(url);
  return m ? parseInt(m[1], 10) : -1;   // -1 = безверсиен, пази се винаги
}

// път спрямо обхвата на приложението: https://х.bg/babyland/js/kb.js → js/kb.js
function относителен(url) {
  try {
    const п = new URL(url).pathname, к = new URL(self.registration.scope).pathname;
    return п.indexOf(к) === 0 ? п.slice(к.length) : п;
  } catch (e) { return String(url); }
}

async function пренеси(нов, версии) {
  let пренесени = 0, пропуснати = 0, изхвърлени = 0;
  // ☠️ отровните се броят ОТДЕЛНО от старите версии: иначе „изхвърлени 2" в
  //   доклада не казва дали пазачът е махнал отрова или добър файл (15.09).
  const отровни = [];
  try {
    const имена = (await caches.keys()).filter(k => k !== CACHE && k.indexOf("babyland-") === 0);
    // 1 · групираме кандидатите по ПЪТ и пазим само най-високата версия
    const избрани = new Map();
    for (const име of имена) {
      const стар = await caches.open(име);
      for (const req of await стар.keys()) {
        if (req.url.indexOf(ДОКЛАД) > -1) continue;   // докладът се пише наново
        // 🧭 15.09: копия на страницата с ?go= / ?fbclid= не пътуват напред —
        //   страницата вече живее под ЕДИН ключ („."). В ASSETS няма безверсиен
        //   адрес с „?" (проверено: 161 адреса, 0 с въпросителна).
        if (req.url.indexOf('?') > -1 && номерНаВерсията(req.url) < 0) { изхвърлени++; continue; }
        // 🔢 15.09 (т.14): безверсийното копие на файл, който страницата иска С ?v=,
        //   не пътува напред — точният адрес се пренася/тегли отделно.
        if (версии && номерНаВерсията(req.url) < 0 && версии.has(относителен(req.url))) { изхвърлени++; continue; }
        let път;
        try { път = new URL(req.url).pathname; } catch (e) { път = req.url; }
        const в = номерНаВерсията(req.url);
        const ключ = път + (в < 0 ? "|безверсиен" : "|версиран");
        const пред = избрани.get(ключ);
        if (!пред) { избрани.set(ключ, { req: req, в: в, име: име }); }
        else if (в > пред.в) { избрани.set(ключ, { req: req, в: в, име: име }); изхвърлени++; }
        else { изхвърлени++; }
      }
    }
    // 2 · пренасяме само избраните
    for (const запис of избрани.values()) {
      try {
        if (await нов.match(запис.req)) continue;      // вече е тук
        const стар = await caches.open(запис.име);
        const res = await стар.match(запис.req);
        if (!res) continue;
        if (отровен(запис.req, res)) { отровни.push(запис.req.url); continue; }   // ☠️ 15.09: отровата не пътува напред
        await нов.put(запис.req, res.clone());
        пренесени++;
      } catch (e) { пропуснати++; }
    }
  } catch (e) { /* няма стар кеш — install просто тегли всичко */ }
  return { пренесени: пренесени, пропуснати: пропуснати, изхвърлени: изхвърлени, отровни: отровни };
}

// ═══════════════════════════════════════════════════════════════════════
// 🔢 15.09 (ЗАДАЧИ.md т.14) — ТОЧНИТЕ АДРЕСИ ОТ СВЕЖАТА СТРАНИЦА
//   ASSETS носи адреси без ?v=, а страницата иска js/kb.js?v=247. Тоест при
//   първата инсталация се пазеше копие, което страницата НИКОГА не иска по
//   точен адрес: офлайн се стигаше до него само през резерва с ignoreSearch,
//   а пренеси() го носеше напред вечно — второ копие на всеки файл в телефона.
//   Сега версиите се четат от самата страница (един източник, без ръчен
//   препис) и се кешира точно това, което тя ще поиска. Библиотеката
//   (lib/*.json) носи ?v=LV от js/lib.js — и то се чете оттам.
//   НЕ УСПЕЕ ЛИ (няма мрежа, хостът дава чужда страница, няма ?v=) — картата
//   е празна и всичко е както преди: безверсийните адреси.
//   МЕРИ СЕ: dev/test_sw_navigacia.js, случаите „4 · …".
//   ПЪТ НАЗАД: git revert · или `const точни = ASSETS` в install.
// ═══════════════════════════════════════════════════════════════════════
async function версииОтСтраницата(c) {
  const карта = new Map();   // js/kb.js → js/kb.js?v=247
  try {
    const стр = await fetch('index.html', { cache: 'no-store' });
    if (!стр.ok || стр.redirected) return карта;
    const копие = стр.clone();
    const html = await стр.text();
    const re = /(?:src|href)="((?:js|css)\/[\w.-]+\.(?:js|css))\?v=(\d+)"/g;
    let м;
    while ((м = re.exec(html))) карта.set(м[1], м[1] + '?v=' + м[2]);
    if (!карта.size) return карта;             // чужда страница — нищо не се пази от нея
    try { await c.put('index.html', копие); } catch (e) {}
    const lib = карта.get('js/lib.js');
    if (lib) {
      const res = await fetch(lib);
      if (res.ok && !отровен({ url: lib }, res)) {
        const lv = /const LV\s*=\s*'(\d+)'/.exec(await res.clone().text());
        if (lv) for (const a of ASSETS) if (/^lib\/[\w.-]+\.json$/.test(a)) карта.set(a, a + '?v=' + lv[1]);
        try { await c.put(lib, res); } catch (e) {}
      }
    }
  } catch (e) { карта.clear(); }
  return карта;
}

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    // 0) точните адреси от свежата страница (т.14); празна карта = както преди
    const версии = await версииОтСтраницата(c);
    const точни = ASSETS.map(a => версии.get(a) || a);
    // 1) каквото вече е изтеглено и още е валидно — пренася се, не се тегли
    const пренос = await пренеси(c, версии);
    // 2) тегли се САМО онова, което липсва след преноса
    const липсващи = [];
    for (const a of точни) {
      try { if (!(await c.match(a))) липсващи.push(a); } catch (e) { липсващи.push(a); }
    }
    let паднали = await кеширайПоединично(c, липсващи);
    // един втори опит: мигаща мрежа на слаб Android рядко пада два пъти подред
    if (паднали.length) паднали = await кеширайПоединично(c, паднали);

    const доклад = {
      кеш: CACHE,
      общо: точни.length,
      с_точна_версия: версии.size,      // адреси, взети с ?v= от страницата (т.14)
      пренесени: пренос.пренесени,      // спестен трафик
      изтеглени: липсващи.length,       // реалната цена на това качване
      пропуснати_при_пренос: пренос.пропуснати,
      изхвърлени_стари_версии: пренос.изхвърлени,  // боклукът, който НЕ пътува напред
      отровни_изхвърлени: пренос.отровни.length,    // ☠️ HTML на мястото на скрипт — не пътува напред
      отровни_адреси: пренос.отровни.slice(0, 20),
      кеширани: точни.length - паднали.length,
      паднали: паднали,
      кога: new Date().toISOString()
    };
    await c.put(ДОКЛАД, new Response(JSON.stringify(доклад), {
      headers: { 'Content-Type': 'application/json' }
    }));

    if (паднали.length) {
      console.error('[Baby Land SW] ОФЛАЙН Е НЕПЪЛЕН: ' + паднали.length + ' от ' +
        ASSETS.length + ' адреса не се кешираха →', паднали);
      const страници = await self.clients.matchAll({ includeUncontrolled: true });
      страници.forEach(с => с.postMessage({ тип: 'офлайн-непълен', доклад: доклад }));
    } else {
      console.log('[Baby Land SW] офлайн готов: ' + ASSETS.length + ' адреса в „' + CACHE +
        '" · пренесени ' + пренос.пренесени + ' · изтеглени ' + липсващи.length + ' · изхвърлени стари ' + пренос.изхвърлени);
    }
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Стратегия (ъпгрейд 22.07 — критик-находка „бавен старт на слаб Android"):
//  • НАВИГАЦИЯ (index.html): МРЕЖА-ПЪРВО → онлайн майка вижда новата версия веднага
//    (свеж HTML с новите ?v препратки); офлайн → кеш. Пази ъпдейт-механизма.
//  • СТАТИЧНИ РЕСУРСИ (js/css/шрифтове/lib/икони — URL-ите носят ?v при промяна):
//    КЕШ-ПЪРВО → мигновен старт без чакане на мрежата (3 през нощта, слаб сигнал 👶).
//    Нов ?v = точен кеш-мис → мрежа+кеширай; офлайн+некеширан още → ignoreSearch fallback.
function пазиУспешни(req, res) {
  if (res && res.ok && !отровен(req, res)) {   // ☠️ 15.09: виж отровен() горе
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
  }
  return res;
}

// 🧭 15.09 — страницата: ЕДИН ключ („."), и само за корена на приложението.
//   Чужда страница в обхвата (напр. /cgi-sys/suspendedpage.cgi при спрян
//   акаунт) НЕ става „приложението" офлайн.
function пазиСтраницата(req, res) {
  let път = '', корен = '/';
  try { път = new URL(req.url).pathname; корен = new URL(self.registration.scope).pathname; } catch (e) { return; }
  if (път !== корен && път !== корен + 'index.html') return;
  const copy = res.clone();
  caches.open(CACHE).then(c => c.put('.', copy)).catch(() => {});
}
function страницаОтКеша() {
  return caches.match('.').then(r => r || caches.match('index.html'));
}
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const навигация = req.mode === 'navigate' || req.destination === 'document';

  if (навигация) {
    // мрежа-първо: онлайн → свежо, офлайн → кеш.
    // 🧭 15.09 (dev/test_sw_navigacia.js — възпроизведено, преди да се поправи):
    //   1) страницата се пази под ЕДИН ключ („."), не под всеки адрес. Иначе
    //      прекият път ./?go=feed и линкът с ?fbclid= оставяха свои копия, а
    //      офлайн резервът с ignoreSearch връщаше ПЪРВОТО — най-старото;
    //   2) HTTP грешка на хостинга (404/500/503/508) не е мрежова грешка —
    //      fetch не се проваля. Тогава майката получава приложението от кеша,
    //      а не страницата за грешка. Пренасочване минава непокътнато — иначе
    //      смяна на домейн би я заключила на стария адрес.
    e.respondWith(
      fetch(req).then(res => {
        if (res.ok) { пазиСтраницата(req, res); return res; }
        if (res.type === 'opaqueredirect') return res;
        return страницаОтКеша().then(r => r || res);
      }).catch(() => страницаОтКеша().then(r => r || Response.error()))
    );
    return;
  }

  // статичен ресурс: КЕШ-ПЪРВО (мигновен), инак мрежа+кеширай, инак офлайн-резерв
  e.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req)
        .then(res => пазиУспешни(req, res))
        // 🧭 15.09: офлайн резервът — НАЙ-ВИСОКАТА запазена ?v=, не първата
        //   записана (първата е безверсийното копие от първата инсталация).
        .catch(() => caches.open(CACHE)
          .then(c => c.matchAll(req, { ignoreSearch: true }))
          .then(вс => вс.sort((а, б) => номерНаВерсията(б.url) - номерНаВерсията(а.url))[0]));
    })
  );
});
