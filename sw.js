// Baby Land — service worker: кешира приложението за офлайн работа
const CACHE = 'babyland-v546';
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
  'js/redna.js',
  'js/broi.js',
  'js/app.js',
  'js/plavno.js',
  'js/izvan_ekrana.js',
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

async function кеширайПоединично(c, адреси) {
  const паднали = [];
  await Promise.all(адреси.map(a =>
    c.add(a).catch(() => { паднали.push(a); })
  ));
  return паднали;
}

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    let паднали = await кеширайПоединично(c, ASSETS);
    // един втори опит: мигаща мрежа на слаб Android рядко пада два пъти подред
    if (паднали.length) паднали = await кеширайПоединично(c, паднали);

    const доклад = {
      кеш: CACHE,
      общо: ASSETS.length,
      кеширани: ASSETS.length - паднали.length,
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
      console.log('[Baby Land SW] офлайн готов: ' + ASSETS.length + '/' + ASSETS.length + ' адреса в „' + CACHE + '"');
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
  if (res && res.ok) {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
  }
  return res;
}
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const навигация = req.mode === 'navigate' || req.destination === 'document';

  if (навигация) {
    // мрежа-първо: онлайн → свежо, офлайн → кеш (index.html като краен резерв)
    e.respondWith(
      fetch(req)
        .then(res => пазиУспешни(req, res))
        .catch(() => caches.match(req, { ignoreSearch: true })
          .then(r => r || caches.match('index.html')))
    );
    return;
  }

  // статичен ресурс: КЕШ-ПЪРВО (мигновен), инак мрежа+кеширай, инак офлайн-резерв
  e.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req)
        .then(res => пазиУспешни(req, res))
        .catch(() => caches.match(req, { ignoreSearch: true }));
    })
  );
});
