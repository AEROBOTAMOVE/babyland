/* ═══════════════════════════════════════════════════════════════════════════════
   🔑 ДОСТЪПЪТ НА МАМА · 21.10.2026 · строител Б (екраните)
   Поръчката на собственика (21.10): същият модел като AERO — регистрация → веднага 14 ДНИ
   БЕЗПЛАТЕН ПРОБЕН ПЕРИОД с пълен достъп → после 15 € на месец, „колкото една салата“.
   Без карти, без „планове“, без плащане в приложението: човекът пише във Facebook, Instagram,
   на имейл или през сайта, а администраторът удължава достъпа.
   Законът за думите: ЛОЦО/ПРАВИЛА_ДОСТЪП_И_ЦЕНА.md (§1, §6 и бележките от 20–21.10) —
   „14 дни безплатно“ е заглавието на регистрацията; цената стои дребно само в „Достъп“ (раздел
   „Как продължава“) и след края; без натиск, без обратно броене.

   ТУК:  1) ВРАТАТА — няма сесия (/api/me → 401): регистрация / вход, на цял екран над всичко,
            СЛЕД стартовия екран (#blSplash), обиколката (.tour-ov) и запознаването (#onbOverlay);
         2) КАРТАТА „ДОСТЪП“ в профила (.prof-overlay, js/profile.js) — най-горе в тефтера
            (js/pl-profil.js), след визитката на бебето; профилът НЕ се пренаписва;
         3) СЛЕД ИЗТИЧАНЕ (status expired/locked) — екранът с думите на сървъра (msg) и контактите;
         4) АДМИН ПАНЕЛЪТ (само user.admin) — броячи, търсене, действия, CSV;
         5) ОФЛАЙН — последният /api/me се пази в localStorage['bl_dostap']; без мрежа се решава
            по него и по часовника на телефона; с мрежа решава винаги сървърът.
            Мрежова грешка НЕ е изход от профила.
   ДОГОВОРЪТ (строител А, netlify/functions/*): същият произход, бисквитка HttpOnly „bl_s“, JSON.
   ПОВЕРИТЕЛНОСТ: към сървъра отиват САМО имейл и парола (вход/регистрация) и действията на
   администратора. Записките на мама не се четат тук и не излизат от телефона.
   БЕЗОПАСНОСТ: на всеки екран тук има „SOS · 112“ (tel:112) и „Спешни номера“ (СОС центърът,
   js/sos.js). Докато е отворен СОС центърът или стаята „Здраве и SOS“, екранът се отдръпва
   и се връща, щом тя ги затвори.
   ПЪТ НАЗАД: махни <link href="css/pl-dostap.css"> и <script src="js/pl-dostap.js"> от
   index.html — приложението се връща към свободния вход; localStorage['bl_dostap'] е безвреден.
   ═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.BL_DOSTAP) return;

  // ═══ 0 · КОНСТАНТИТЕ ═══
  const API = typeof window.BL_API_BASE === 'string' ? window.BL_API_BASE : '/api/';
  const КЕШ = 'bl_dostap';
  const ДЕН = 86400000;
  // взети от сайта babylandeu.com (21.10); сървърът ги праща в /api/me (kontakti) и те печелят
  const КОНТАКТИ_ПО_ПОДР = Object.freeze({
    facebook: 'https://www.facebook.com/Babyland.sale',
    instagram: 'https://www.instagram.com/bblandbulgaria/',
    email: 'babyland.sale@gmail.com',
    site: 'https://babylandeu.com'
  });
  let контакти = Object.assign({}, КОНТАКТИ_ПО_ПОДР);
  let цена = 15, дниПробни = 14;
  const ЛОКАЛЕН = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

  // плюшените рисунки (листовете на js/pl-plyush.js, 4×4): [лист, ред, колона, пастел на кръга]
  const И = {
    ключ: ['ico-c', 1, 2, '#fff0d4'],        // 🔑
    писмо: ['ico-a', 0, 3, '#fde6ef'],       // 💌
    катинар: ['ico-b', 1, 2, '#ece4f8'],     // 🔒
    facebook: ['ico-d', 1, 1, '#dfeafb'],    // 💬 — разговорът
    instagram: ['ico-b', 1, 1, '#fde6ef'],   // 📸 — снимките
    email: ['ico-a', 0, 3, '#fde6ef'],       // 💌
    site: ['ico-k', 0, 1, '#fde5d8'],        // 🏠
    списък: ['ico-f', 2, 0, '#fde6ef'],      // 📋
    врата: ['ico-m', 1, 2, '#fde5d8'],       // 🚪
    сос: ['ico-a', 3, 0, '#fde5d8'],         // 🆘
    стая: ['ico-a', 3, 2, '#dff2e7'],        // 🩺
    офлайн: ['ico-n', 1, 1, '#dff2e7'],      // 📵
    наново: ['ico-n', 1, 0, '#dfeafb'],      // 🔄
    сърце: ['ico-g', 2, 0, '#fde6ef']        // 🤍
  };
  const пр = н => parseFloat((н * 100 / 3).toFixed(3)) + '%';
  const стилИ = и => 'background-image:url(&quot;img/art/' + и[0] + '.webp&quot;);background-position:' + пр(и[2]) + ' ' + пр(и[1]) + ';--bl-tint:' + и[3] + ';--pl-tint:' + и[3];
  const икона = (и, клас) => '<span class="bl-ic' + (клас ? ' ' + клас : '') + '" aria-hidden="true" style="' + стилИ(и) + '"></span>';

  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const дниДума = n => (n === 1 ? '1 ден' : n + ' дни');
  const ИМЕЙЛ_RE = /^[^\s@,;:<>()"'\\]+@[^\s@,;:<>()"'\\]+\.[^\s@,;:<>()"'\\.]{2,}$/;

  // ── датите — по София (сървърът брои „до края на деня по София“) ──
  const ФД = (() => { try { return new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Sofia', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }); } catch (e) { return null; } })();
  function части(iso) {
    const d = new Date(iso);
    if (!iso || isNaN(d)) return null;
    if (ФД) { const ч = {}; ФД.formatToParts(d).forEach(x => { ч[x.type] = x.value; }); return ч; }
    const д = n => String(n).padStart(2, '0');
    return { day: д(d.getDate()), month: д(d.getMonth() + 1), year: String(d.getFullYear()), hour: д(d.getHours()), minute: д(d.getMinutes()) };
  }
  const дата = iso => { const ч = части(iso); return ч ? ч.day + '.' + ч.month + '.' + ч.year : '—'; };
  const датаЧас = iso => { const ч = части(iso); return ч ? ч.day + '.' + ч.month + '.' + ч.year + ' · ' + ч.hour + ':' + ч.minute : '—'; };
  const заПоле = iso => { const ч = части(iso); return ч ? ч.year + '-' + ч.month + '-' + ч.day : ''; };
  const остават = u => {
    if (Number.isFinite(+u.days_left) && u.days_left !== null && u.days_left !== '') return Math.max(0, Math.trunc(+u.days_left));
    const до = Date.parse(u.access_until);
    return isFinite(до) ? Math.max(0, Math.ceil((до - Date.now()) / ДЕН)) : 0;
  };

  // ═══ 1 · ВРЪЗКАТА СЪС СЪРВЪРА ═══
  // 🪤 sw.js (НЕ е мой файл) кешира всеки успешен GET „кеш-първо“ (sw.js · пазиУспешни). Без тази
  //   чистка /api/me щеше да идва ВЕЧНО от кеша: стар срок, „влязла“ след изход. Трием записа
  //   ПРЕДИ заявката. Истинската поправка е в sw.js — /api/* да не минава през кеша (виж отчета);
  //   тогава това е празен ход.
  async function чистиКеша(път) {
    try {
      if (!window.caches || !caches.keys) return;
      const адрес = new URL(API + път, location.href).href;
      const имена = await caches.keys();
      await Promise.all(имена.map(и => caches.open(и).then(к => к.delete(адрес, { ignoreSearch: true })).catch(() => {})));
    } catch (e) {}
  }
  async function апи(метод, път, тяло) {
    if (метод === 'GET') await чистиКеша(път);
    const ктрл = window.AbortController ? new AbortController() : null;
    const т = setTimeout(() => { try { if (ктрл) ктрл.abort(); } catch (e) {} }, 15000);
    const опц = { method: метод, credentials: 'same-origin', cache: 'no-store', headers: { Accept: 'application/json' } };
    if (ктрл) опц.signal = ктрл.signal;
    if (метод !== 'GET') { опц.headers['Content-Type'] = 'application/json'; опц.body = JSON.stringify(тяло || {}); }
    let р;
    try { р = await fetch(API + път, опц); } catch (e) { clearTimeout(т); return { мрежа: false, код: 0, данни: null, json: false }; }
    clearTimeout(т);
    const тип = (р.headers && р.headers.get('content-type')) || '';
    let данни = null;
    if (/json/i.test(тип)) { try { данни = await р.json(); } catch (e) {} }
    return { мрежа: true, код: р.status, данни, json: !!данни, р };
  }
  const грешкаОт = (р, иначе) => (р && р.данни && typeof р.данни.error === 'string' && р.данни.error.trim()) ? р.данни.error.trim() : иначе;

  // ═══ 2 · КЕШЪТ (офлайн) — {status, access_until, admin, email, proveren, proben} ═══
  const чети = () => { try { const v = JSON.parse(localStorage.getItem(КЕШ)); return v && typeof v === 'object' && v.status ? v : null; } catch (e) { return null; } };
  const пиши = v => { try { localStorage.setItem(КЕШ, JSON.stringify(v)); } catch (e) {} };
  const махниКеша = () => { try { localStorage.removeItem(КЕШ); } catch (e) {} };

  function чистиКонтакти(к) {
    const р = Object.assign({}, КОНТАКТИ_ПО_ПОДР);
    if (к && typeof к === 'object') {
      ['facebook', 'instagram', 'site'].forEach(и => { if (typeof к[и] === 'string' && /^https:\/\/[^\s"'<>]+$/.test(к[и])) р[и] = к[и]; });
      if (typeof к.email === 'string' && ИМЕЙЛ_RE.test(к.email.trim())) р.email = к.email.trim();
    }
    return р;
  }
  function приемиОбщото(d) {
    if (!d || typeof d !== 'object') return;
    if (d.kontakti) контакти = чистиКонтакти(d.kontakti);
    if (Number.isFinite(+d.cena_eur) && +d.cena_eur > 0) цена = +d.cena_eur;
    if (Number.isFinite(+d.access_days) && +d.access_days > 0) дниПробни = Math.trunc(+d.access_days);
  }
  const ПИШИ_НИ = 'Пиши ни — във Facebook, Instagram или на имейл.';
  const продължение = () => 'За продължение — ' + цена + ' € на месец, колкото една салата.';
  const текстИзтекло = u => ((u && u.proben && u.status !== 'locked') ? 'Пробният период свърши.' : 'Достъпът изтече.') + ' ' + продължение() + ' ' + ПИШИ_НИ;

  // ═══ 3 · СЪСТОЯНИЕТО ═══
  let режим = 'чака';   // чака · вътре · врата · изтекло · офлайн · без-сървър
  let вид = 'рег';      // вратата: рег · вход
  let сървър = null;    // последният отговор на /api/me — само в паметта
  let отКеша = false;   // показаното идва от кеша (няма връзка)
  let последно = 0;     // кога сървърът е отговорил за последно
  let съобщение = '';   // думите за изтеклия достъп
  let бележка = '';     // ред под бутоните (напр. „Още няма връзка.“)

  function активен(u, сЧасовника) {
    if (!u) return false;
    if (u.admin || u.status === 'admin') return true;
    if (u.status === 'locked' || u.status === 'expired') return false;
    const до = Date.parse(u.access_until);
    if (сЧасовника && isFinite(до) && до <= Date.now()) return false;
    return true;
  }
  function приеми(d) {
    приемиОбщото(d);
    const u = d.user;
    сървър = { user: u, msg: typeof d.msg === 'string' ? d.msg.trim() : '' };
    отКеша = false; последно = Date.now();
    пиши({ status: u.status || '', access_until: u.access_until || '', admin: !!u.admin, email: u.email || '', proveren: new Date().toISOString(), proben: !!u.proben });
    if (активен(u, false)) смени('вътре');
    else { съобщение = сървър.msg || текстИзтекло(u); смени('изтекло'); }
  }
  // без връзка: решава кешът и часовникът на телефона; без кеш — „свържи се веднъж“
  function офлайнРешение() {
    const к = чети();
    if (!к) { смени('офлайн'); return; }
    отКеша = true; сървър = null;     // без връзка истината е кешът (и датата на проверката му)
    if (активен(к, true)) смени('вътре');
    else { съобщение = текстИзтекло(к); смени('изтекло'); }
  }

  let проверява = null;
  function провери() {
    if (проверява) return проверява;
    проверява = (async () => {
      const р = await апи('GET', 'me');
      if (!р.мрежа) { офлайнРешение(); return режим; }
      if (р.код === 200 && р.данни && р.данни.user) { приеми(р.данни); return режим; }
      if (р.код === 401) {
        приемиОбщото(р.данни);
        const беше = !!чети() || !!сървър;
        махниКеша(); сървър = null; отКеша = false; последно = Date.now();
        if (режим !== 'врата') вид = беше ? 'вход' : 'рег';
        смени('врата');
        return режим;
      }
      // локален сървър без функциите (dev/proba/server.js → 404 text/plain): достъпът не е включен —
      // приложението е свободно, за да вървят пробите на останалите агенти. На живия сайт 404 = неизправност.
      if (р.код === 404 && !р.json && ЛОКАЛЕН) { сървър = null; смени('без-сървър'); return режим; }
      офлайнРешение();    // 5xx / неочакван отговор — както без връзка
      return режим;
    })().finally(() => { проверява = null; });
    return проверява;
  }

  // ═══ 4 · ЕКРАНЪТ НА ЦЯЛ ЕКРАН (врата · изтекло · офлайн) ═══
  let корен = null;
  function дайКорен() {
    if (корен && корен.isConnected) return корен;
    корен = document.createElement('div');
    корен.id = 'blDostap';
    корен.className = 'bl-dg';
    корен.hidden = true;
    корен.setAttribute('role', 'dialog');
    корен.setAttribute('aria-modal', 'true');
    корен.setAttribute('aria-labelledby', 'blDgT');
    корен.tabIndex = -1;
    корен.addEventListener('click', наКлик);
    корен.addEventListener('submit', наФорма);
    корен.addEventListener('keydown', капан);
    document.body.appendChild(корен);
    return корен;
  }
  const наЕкран = () => режим === 'врата' || режим === 'изтекло' || режим === 'офлайн';

  function sosРед() {
    return '<div class="bl-dg-sos" role="group" aria-label="Спешна помощ">' +
      '<button type="button" class="bl-dg-row pl-soft" data-act="сос">' + икона(И.сос) + '<span class="bl-dg-rt"><b>Спешни номера</b><small>112, педиатър, токсикология — винаги отворени</small></span><span class="bl-dg-go" aria-hidden="true">›</span></button>' +
      '<button type="button" class="bl-dg-row pl-soft" data-act="стая">' + икона(И.стая) + '<span class="bl-dg-rt"><b>Стаята „Здраве и SOS“</b><small>какво да правиш, докато чакаш помощ</small></span><span class="bl-dg-go" aria-hidden="true">›</span></button>' +
      '</div>';
  }
  function контактиHtml(клас) {
    const u = сървър && сървър.user ? сървър.user : чети();
    const имейл = u && u.email ? u.email : '';
    const тема = encodeURIComponent('Бейби Ленд — продължение на достъпа');
    const тяло = encodeURIComponent('Здравейте! Искам да продължа с Бейби Ленд.' + (имейл ? '\nИмейлът ми в приложението: ' + имейл : ''));
    // подредът е самият адрес — проверим и разпознаваем (МЕРЕНО ds21_L: в 2×2 плочки адресите се рязаха по средата → редове)
    const кратко = а => а.replace(/^https:\/\/(www\.)?/, '').replace(/\/$/, '');
    const инста = (контакти.instagram.match(/instagram\.com\/([^/?#]+)/) || [])[1];
    const К = [
      ['facebook', 'Facebook', кратко(контакти.facebook), контакти.facebook],
      ['instagram', 'Instagram', инста ? '@' + инста : кратко(контакти.instagram), контакти.instagram],
      ['email', 'Имейл', контакти.email, 'mailto:' + контакти.email + '?subject=' + тема + '&body=' + тяло],
      ['site', 'Сайтът', кратко(контакти.site), контакти.site]
    ];
    return '<div class="bl-kont ' + (клас || '') + '">' + К.map(([к, име, под, href]) =>
      '<a class="bl-kont-b" href="' + esc(href) + '"' + (к === 'email' ? '' : ' target="_blank" rel="noopener"') + ' data-k="' + к + '">' +
      икона(И[к]) + '<span class="bl-kont-t"><b>' + име + '</b><small>' + esc(под) + '</small></span><span class="bl-dg-go" aria-hidden="true">›</span></a>').join('') + '</div>';
  }
  // ✨ 21.10 · „Какво те чака вътре“ (собственикът: „готино обяснение какво и как работи — не като поп-ъп, галантно в
  //   началото“). Вградено под формата на вратата, превърта се с нея; числата са преброени (KB.entries, рафтът „265 статии“).
  //   ПЪТ НАЗАД: махни витрина() и „(рег ? витрина() : '')“.
  const ВИТРИНА = [
    [['ico-i', 3, 2, '#fde5d8'], '9 вълшебни стаи', 'бременност, бебето, захранване, здраве, игри, дневник, жената в теб, инструменти, лаборатория'],
    [['ico-i', 3, 1, '#fde6ef'], '9 помощнички', 'питаш с твои думи — денем и в 3 през нощта; отговарят спокойно и кратко'],
    [['ico-h', 2, 0, '#dfeafb'], '1 900+ отговора и 265 статии', 'сверени с NHS, СЗО и българските наредби; без дози, без плашене'],
    [['ico-a', 1, 0, '#fde6ef'], 'Денят на бебето', 'хранене, сън, пелени, растеж, зъбки, ваксините по българския календар'],
    [['ico-f', 1, 3, '#fde6ef'], 'Дневник за теб', 'как си днес, снимка на деня, писма до бебето, медальончета'],
    [['ico-a', 1, 1, '#dfeafb'], 'Нощен режим', 'тъмно и тихо за нощните хранения — само се включва'],
    [['ico-n', 1, 1, '#dff2e7'], 'Работи и без интернет', 'записките остават на твоя телефон'],
    [['ico-a', 3, 0, '#fde5d8'], 'SOS · 112 винаги на един допир', 'и спешните признаци — кога веднага към лекар'],
  ];
  function витрина() {
    return '<section class="bl-dg-vit pl-felt" aria-labelledby="blDgVitT">' +
      '<h3 class="bl-dg-vit-t" id="blDgVitT">Какво те чака вътре</h3>' +
      '<ul class="bl-dg-vit-l">' + ВИТРИНА.map(([и, т, п]) => '<li>' + икона(и) + '<span><b>' + т + '</b><small>' + п + '</small></span></li>').join('') + '</ul>' +
      '</section>';
  }
  function вратаHtml() {
    const рег = вид === 'рег';
    return '<div class="bl-dg-card pl-felt">' +
      '<p class="bl-dg-kick">Бейби Ленд</p>' +
      (рег
        ? '<h2 class="bl-dg-t" id="blDgT">' + дниПробни + ' дни безплатно</h2>' +
          '<p class="bl-dg-lead">Пробният период е с пълен достъп. Без карта и без обвързване.</p>' +
          '<p class="bl-dg-small">После — ' + цена + ' € на месец, колкото една салата.</p>'
        : '<h2 class="bl-dg-t" id="blDgT">Добре дошла отново</h2>' +
          '<p class="bl-dg-lead">Влез с имейла и паролата си.</p>') +
      '<form class="bl-dg-form" novalidate autocomplete="on">' +
        '<label class="bl-dg-fld">' + икона(И.писмо) + '<span class="bl-dg-fb"><span class="bl-dg-l">Имейл</span>' +
          '<input id="blDgEmail" name="email" type="email" inputmode="email" autocomplete="' + (рег ? 'email' : 'username') + '" autocapitalize="off" spellcheck="false" maxlength="254" placeholder="ime@primer.bg"></span></label>' +
        '<label class="bl-dg-fld">' + икона(И.катинар) + '<span class="bl-dg-fb"><span class="bl-dg-l">Парола' + (рег ? ' · поне 8 знака' : '') + '</span>' +
          '<input id="blDgPass" name="password" type="password" autocomplete="' + (рег ? 'new-password' : 'current-password') + '" minlength="8" maxlength="200" placeholder="' + (рег ? 'измисли си парола' : 'твоята парола') + '"></span>' +
          '<button type="button" class="bl-dg-eye" data-act="око" aria-pressed="false" aria-label="Покажи паролата">Покажи</button></label>' +
        '<p class="bl-dg-err" role="alert" hidden></p>' +
        '<button type="submit" class="bl-dg-cta pl-gel">' + (рег ? 'Започни ' + дниПробни + '-те дни' : 'Влез') + '</button>' +
      '</form>' +
      '<button type="button" class="bl-dg-switch" data-act="' + (рег ? 'вход-вид' : 'рег-вид') + '">' +
        (рег ? 'Вече имам профил · <b>Вход</b>' : 'Нямам профил · <b>' + дниПробни + ' дни безплатно</b>') + '</button>' +
      // 21.10 · „Първо разгледай“ — без профил, само за това посещение (пази())
      '<button type="button" class="bl-dg-switch bl-dg-skip" data-act="разгледай">Първо разгледай · <b>без профил</b></button>' +
      (рег ? '' :
        '<details class="bl-dg-forgot"><summary>Забравена парола?</summary>' +
        '<p>Пиши ни от имейла, с който си се регистрирала — ще ти дадем нова парола.</p>' + контактиHtml('bl-kont-mini') + '</details>') +
      '<p class="bl-dg-priv">' + икона(И.сърце, 'bl-ic-s') + '<span>Записките ти остават само на този телефон. При нас стоят само имейлът и датите на достъпа.</span></p>' +
      '</div>' + (рег ? витрина() : '') + sosРед();
  }
  function изтеклоHtml() {
    const т = (съобщение || текстИзтекло(null)).trim();
    const м = т.match(/^(.+?[.!])\s+([\s\S]+)$/);
    const заг = м ? м[1] : т, ост = м ? м[2] : '';
    const u = сървър && сървър.user ? сървър.user : чети();
    return '<div class="bl-dg-card pl-felt">' +
      '<p class="bl-dg-kick">Бейби Ленд</p>' +
      '<h2 class="bl-dg-t bl-dg-t2" id="blDgT">' + esc(заг) + '</h2>' +
      (ост ? '<p class="bl-dg-lead">' + esc(ост) + '</p>' : '') +
      (u && u.email ? '<p class="bl-dg-small">Кажи ни имейла, с който влизаш — <b>' + esc(u.email) + '</b> — и ние удължаваме достъпа.</p>' : '') +
      контактиHtml() +
      '<button type="button" class="bl-dg-cta2 pl-soft" data-act="провери">' + икона(И.наново) + 'Провери пак</button>' +
      '<p class="bl-dg-note" role="status">' + esc(бележка) + '</p>' +
      '<button type="button" class="bl-dg-switch" data-act="друг">Влез с <b>друг профил</b></button>' +
      '<p class="bl-dg-priv">' + икона(И.сърце, 'bl-ic-s') + '<span>Записките ти са на този телефон и не се губят — всичко те чака.</span></p>' +
      '</div>' + sosРед();
  }
  function офлайнHtml() {
    return '<div class="bl-dg-card pl-felt">' +
      '<p class="bl-dg-kick">Бейби Ленд</p>' +
      '<span class="bl-dg-big-ic">' + икона(И.офлайн) + '</span>' +
      '<h2 class="bl-dg-t bl-dg-t2" id="blDgT">Свържи се с интернет</h2>' +
      '<p class="bl-dg-lead">Свържи се с интернет веднъж, за да започнеш ' + дниПробни + '-те дни. После приложението работи и без връзка.</p>' +
      '<button type="button" class="bl-dg-cta pl-gel" data-act="опитай">Опитай пак</button>' +
      '<p class="bl-dg-note" role="status">' + esc(бележка) + '</p>' +
      '</div>' + sosРед();
  }
  function рисувай() {
    const к = дайКорен();
    const стар = к.querySelector('#blDgEmail');
    const имейл = стар ? стар.value : '';
    const html = '<a class="bl-dg-112" href="tel:112" aria-label="Спешна помощ — обади се на 112"><span aria-hidden="true">✚</span>SOS · 112</a>' +
      '<div class="bl-dg-in">' + (режим === 'врата' ? вратаHtml() : режим === 'изтекло' ? изтеклоHtml() : офлайнHtml()) + '</div>';
    к.innerHTML = html;
    // ☁️ 21.10 · главната сесия: горе — живото векторно лого „Baby Land“ от героя на началото (header.hero .logo-art,
    //   index.html), а не 3D картината (собственикът: „не ме кефи тая картинка която почва приложението“). Клонинг —
    //   градиентите му са в общите <defs> на страницата, анимациите — в css/style.css (.lg-*). Няма ли го — нищо.
    //   ПЪТ НАЗАД: махни тези 4 реда и блока „21.10 · облакът“ в css/pl-dostap.css.
    const лого = document.querySelector('header.hero .logo-art'), вътре = к.querySelector('.bl-dg-in');
    if (лого && вътре) { const о = document.createElement('div'); о.className = 'bl-dg-logo'; о.setAttribute('aria-hidden', 'true');
      const к2 = лого.cloneNode(true); к2.removeAttribute('role'); к2.removeAttribute('aria-label'); о.appendChild(к2); вътре.insertBefore(о, вътре.firstChild); }
    к.setAttribute('data-vid', режим === 'врата' ? вид : режим);
    к.__ключ = ключНаЕкрана();
    const н = к.querySelector('#blDgEmail');
    if (н && имейл) н.value = имейл;
  }
  // пре-рисуване само при истинска смяна (иначе проверка на заден план би изтрила написаното във формата)
  const ключНаЕкрана = () => режим + '|' + (режим === 'врата' ? вид : '') + '|' + (режим === 'изтекло' ? съобщение + '|' + ((сървър && сървър.user && сървър.user.email) || (чети() || {}).email || '') : '');
  function смени(нов) {
    режим = нов;
    if (наЕкран()) { if (!корен || !корен.isConnected || корен.__ключ !== ключНаЕкрана()) { бележка = ''; рисувай(); } else обновиБележка(); }
    пази();
    картата();
    if (!наЕкран() && адм && адм.корен && !адм.корен.hidden && !(сървър && сървър.user && сървър.user.admin)) затвориАдмин();
  }
  function обновиБележка() { const б = корен && корен.querySelector('.bl-dg-note'); if (б && б.textContent !== бележка) б.textContent = бележка; }

  // кой е отгоре: стартовият екран, обиколката и запознаването минават ПРЕДИ вратата
  function пречи() {
    if (document.getElementById('blSplash')) return true;
    if (document.querySelector('.tour-ov')) return true;
    const о = document.getElementById('onbOverlay');
    return !!(о && !о.hidden && о.getClientRects().length);
  }
  // СОС центърът и стаята „Здраве и SOS“ са ВИНАГИ достъпни — докато са отворени, екранът се отдръпва
  function сосОтворено() {
    const с = document.getElementById('sosOverlay');
    if (с && !с.hidden && с.getClientRects().length) return true;
    // 🪤 МЕРЕНО (ds21_L): #roName е името на помощничката („Вита“), не на стаята — стаята е в #roTitle (helper.js · open)
    const р = document.getElementById('roomOverlay');
    if (р && !р.hidden && р.getClientRects().length && /Здраве/.test((document.getElementById('roTitle') || {}).textContent || '')) return true;
    return false;
  }
  // 21.10 · докато мама разглежда без профил — малко хапче горе „14 дни безплатно · Започни“ (не прозорец, не пречи)
  function хапче(вкл) {
    let х = document.getElementById('blDgPill');
    if (!вкл) { if (х) х.hidden = true; return; }
    if (!х) {
      х = document.createElement('button'); х.type = 'button'; х.id = 'blDgPill'; х.className = 'bl-dg-pill';
      х.innerHTML = '<b>' + дниПробни + ' дни безплатно</b><span>Започни ›</span>';
      х.addEventListener('click', () => { try { sessionStorage.removeItem('bl_razgledai'); } catch (e) {} вид = 'рег'; рисувай(); пази(); });
      document.body.appendChild(х);
    }
    if (х.hidden) х.hidden = false;
  }
  let пазиТ = 0, видян = false;
  function пази() {
    clearTimeout(пазиТ);
    const к = корен;
    if (!наЕкран()) {
      if (к) к.hidden = true;
      document.documentElement.classList.remove('bl-dg-on');
      видян = false;
      return;
    }
    // 21.10 · „Първо разгледай“ (собственикът: „може да разгледат — бутон пропусни“): само ПРЕДИ регистрация и само за това
    //   посещение (sessionStorage) — при следващото отваряне вратата е пак тук. След изтичане няма пропускане.
    const разглежда = режим === 'врата' && (() => { try { return sessionStorage.getItem('bl_razgledai') === '1'; } catch (e) { return false; } })();
    хапче(разглежда);
    const вижда = !пречи() && !сосОтворено() && !разглежда;
    if (к) {
      if (к.hidden === вижда) к.hidden = !вижда;
      if (вижда && !видян) { видян = true; try { к.scrollTop = 0; к.focus({ preventScroll: true }); } catch (e) {} }
      if (!вижда) видян = false;
    }
    document.documentElement.classList.toggle('bl-dg-on', вижда);
    пазиТ = setTimeout(пази, 400);
  }
  // Tab остава вътре (екранът е модален); Escape не затваря — вратата не се прескача
  function капан(e) {
    if (e.key !== 'Tab' || !корен) return;
    const в = [...корен.querySelectorAll('a[href], button:not([disabled]), input, summary')].filter(х => х.getClientRects().length);
    if (!в.length) return;
    const и = в.indexOf(document.activeElement);
    if (e.shiftKey && (и <= 0)) { e.preventDefault(); в[в.length - 1].focus(); }
    else if (!e.shiftKey && и === в.length - 1) { e.preventDefault(); в[0].focus(); }
  }

  function отвориСОС() {
    // екранът се отдръпва сам (сосОтворено), щом СОС центърът е на екрана
    if (window.BL_SOS_CENTER && BL_SOS_CENTER.open) { try { BL_SOS_CENTER.open(); } catch (e) {} setTimeout(пази, 30); return; }
    отвориСтаята();
  }
  function отвориСтаята() {
    if (window.MamaHelper && MamaHelper.open) { try { MamaHelper.open('Здраве и SOS'); } catch (e) {} setTimeout(пази, 60); return; }
    location.href = 'tel:112';
  }

  async function наКлик(e) {
    const б = e.target.closest('[data-act]');
    if (!б || !корен.contains(б)) return;
    const д = б.getAttribute('data-act');
    if (д === 'вход-вид' || д === 'рег-вид') { вид = д === 'вход-вид' ? 'вход' : 'рег'; рисувай(); const н = корен.querySelector(вид === 'вход' && корен.querySelector('#blDgEmail').value ? '#blDgPass' : '#blDgEmail'); if (н) н.focus(); return; }
    if (д === 'око') {
      const п = корен.querySelector('#blDgPass'); if (!п) return;
      const покажи = п.type === 'password';
      п.type = покажи ? 'text' : 'password';
      б.textContent = покажи ? 'Скрий' : 'Покажи';
      б.setAttribute('aria-pressed', String(покажи));
      б.setAttribute('aria-label', покажи ? 'Скрий паролата' : 'Покажи паролата');
      return;
    }
    if (д === 'разгледай') { try { sessionStorage.setItem('bl_razgledai', '1'); } catch (e) {} пази(); return; }
    if (д === 'сос') { отвориСОС(); return; }
    if (д === 'стая') { отвориСтаята(); return; }
    if (д === 'опитай' || д === 'провери') {
      б.disabled = true; бележка = 'Проверявам…'; обновиБележка();
      const беше = режим;
      await провери();
      if (режим === беше && наЕкран()) {
        бележка = режим === 'офлайн' ? 'Още няма връзка. Опитай пак, щом се свържеш.'
          : отКеша ? 'Няма връзка — щом се свържеш, провери пак.'
          : 'Проверено току-що. Щом ни пишеш, удължаваме достъпа — после натисни „Провери пак“.';
        обновиБележка();
      }
      const н = корен && корен.querySelector('[data-act="' + д + '"]'); if (н) н.disabled = false;
      return;
    }
    if (д === 'друг') { б.disabled = true; const ок = await изход(); if (!ок && б.isConnected) б.disabled = false; return; }
  }

  async function наФорма(e) {
    e.preventDefault();
    const ф = e.target.closest('form'); if (!ф || !корен.contains(ф)) return;
    const имейлП = ф.querySelector('#blDgEmail'), паролаП = ф.querySelector('#blDgPass');
    const грешка = ф.querySelector('.bl-dg-err'), бутон = ф.querySelector('.bl-dg-cta');
    const кажи = т => { грешка.textContent = т; грешка.hidden = !т; };
    const имейл = (имейлП.value || '').trim().toLowerCase(), парола = паролаП.value || '';
    if (!ИМЕЙЛ_RE.test(имейл)) { кажи('Провери имейла — изглежда непълен.'); имейлП.focus(); return; }
    if (парола.length < 8) { кажи('Паролата трябва да е поне 8 знака.'); паролаП.focus(); return; }
    кажи('');
    const рег = вид === 'рег';
    const надпис = бутон.textContent;
    бутон.disabled = true; бутон.textContent = 'Момент…';
    const връщай = () => { бутон.disabled = false; бутон.textContent = надпис; };
    const р = await апи('POST', рег ? 'register' : 'login', { email: имейл, password: парола });
    if (!р.мрежа) { връщай(); кажи('Няма връзка. Провери интернета и опитай пак.'); return; }
    if (р.код === 409 && рег) {
      // имейлът вече има профил → направо към входа, със същия имейл
      вид = 'вход'; рисувай();
      const н = корен.querySelector('#blDgEmail'); if (н) н.value = имейл;
      const г = корен.querySelector('.bl-dg-err'); if (г) { г.textContent = грешкаОт(р, 'Този имейл вече е регистриран. Влез с паролата си.'); г.hidden = false; }
      const п = корен.querySelector('#blDgPass'); if (п) п.focus();
      return;
    }
    if (р.код !== 200 || !р.данни) { връщай(); кажи(грешкаОт(р, р.код === 401 ? 'Грешен имейл или парола.' : 'Нещо не стана (код ' + р.код + '). Опитай пак след малко.')); return; }
    // влизането се пази в бисквитка — сверяваме, че телефонът я е запазил
    const п = await апи('GET', 'me');
    if (п.мрежа && п.код === 401) { връщай(); кажи('Телефонът не запази влизането. Отвори приложението в обикновен (не „частен“) прозорец и опитай пак.'); return; }
    if (п.мрежа && п.код === 200 && п.данни && п.данни.user) приеми(п.данни);
    else if (р.данни.user) приеми(р.данни);
    else { връщай(); кажи('Нещо не стана. Опитай пак след малко.'); return; }
    if (режим === 'вътре') {
      try { if (window.BL_FX && BL_FX.cheer) BL_FX.cheer(рег ? 'Добре дошла! ' + дниПробни + '-те дни започват днес.' : 'Добре дошла отново!'); } catch (x) {}
    }
  }

  async function изход() {
    const р = await апи('POST', 'logout', {});
    if (!р.мрежа) {
      бележка = 'Няма връзка — изходът ще стане, щом се свържеш.';
      обновиБележка();
      const б = document.querySelector('.bl-dc .bl-dc-st-off'); if (б) б.textContent = бележка;
      return false;
    }
    махниКеша(); сървър = null; отКеша = false;
    if (адм && адм.корен && !адм.корен.hidden) затвориАдмин();
    вид = 'вход';            // след изход вратата отваря направо „Вход“
    смени('врата');
    return true;
  }

  // ═══ 5 · КАРТАТА „ДОСТЪП“ В ПРОФИЛА ═══
  let слой = null, наблСлой = null, картаТ = 0;
  function инфо() {
    if (режим === 'без-сървър' || режим === 'врата' || режим === 'чака' && !сървър && !чети()) return null;
    const u = !отКеша && сървър && сървър.user ? сървър.user : чети();
    if (!u || !u.status) return null;
    const админ = !!(u.admin || u.status === 'admin');
    const жив = активен(u, отКеша);
    const n = жив ? остават(u) : 0;
    const и = { e: u.email || '', s: админ ? 'admin' : (жив ? (u.proben ? 'proben' : 'active') : (u.status === 'locked' ? 'locked' : 'expired')), n, до: дата(u.access_until), a: админ, c: цена, d: дниПробни };
    if (!жив && !админ) и.m = (сървър && сървър.msg) || текстИзтекло(u);
    if (отКеша) и.o = датаЧас(u.proveren);
    return и;
  }
  function htmlКарта(и) {
    const БАДЖ = { proben: 'Безплатен пробен период', active: 'Активен', admin: 'Администратор', expired: 'Изтекъл', locked: 'Заключен' };
    let ст = '';
    if (и.s === 'admin') ст = '<p class="bl-dc-big">Без срок</p><p class="bl-dc-ln">Достъпът ти не изтича. Профилите на мамите са в „Администрация“.</p>';
    else if (и.s === 'proben') ст = '<p class="bl-dc-big">' + и.d + ' дни безплатно</p><p class="bl-dc-ln">' + (и.n === 1 ? 'Остава <b class="bl-num">1</b> ден' : 'Остават <b class="bl-num">' + и.n + '</b> дни') + ' от безплатния пробен период.</p><p class="bl-dc-ln bl-dc-do">до <span class="bl-num">' + esc(и.до) + '</span></p>';
    else if (и.s === 'active') ст = '<p class="bl-dc-big">Достъпът ти е активен</p><p class="bl-dc-ln">' + (и.n === 1 ? 'остава <b class="bl-num">1</b> ден' : 'остават <b class="bl-num">' + и.n + '</b> дни') + '</p><p class="bl-dc-ln bl-dc-do">до <span class="bl-num">' + esc(и.до) + '</span></p>';
    else {
      const м = String(и.m || '').match(/^(.+?[.!])\s+([\s\S]+)$/);
      ст = '<p class="bl-dc-big">' + esc(м ? м[1] : и.m) + '</p>' + (м ? '<p class="bl-dc-ln">' + esc(м[2]) + '</p>' : '');
    }
    return '<h4 class="prof-h" data-pl="1"><span class="pl-hi has-art" aria-hidden="true" style="' + стилИ(И.ключ) + '"></span><span class="pl-ht">Достъп</span><span class="prof-hsub">' + esc(и.e) + '</span></h4>' +
      '<div class="bl-dc-st"><span class="bl-badge bl-b-' + и.s + '">' + БАДЖ[и.s] + '</span>' + ст + '</div>' +
      (и.s === 'admin' ? '' :
        '<div class="bl-dc-kak"><p class="bl-dc-kh">Как продължава</p>' +
        '<p class="bl-dc-cena">' + и.c + ' € на месец, колкото една салата. Пиши ни — във Facebook, Instagram или на имейл — и ние удължаваме достъпа.</p>' +
        контактиHtml('bl-kont-dc') + '</div>') +
      (и.a ? '<button type="button" class="bl-dc-b bl-dc-adm pl-gel" data-act="админ">' + икона(И.списък) + '<span>Администрация</span><span class="bl-dg-go" aria-hidden="true">›</span></button>' : '') +
      '<button type="button" class="bl-dc-b bl-dc-out pl-soft" data-act="изход">' + икона(И.врата) + '<span>Изход</span></button>' +
      '<p class="bl-dc-st-off" role="status">' + (и.o ? 'Без връзка — показвам провереното на ' + esc(и.o) + '.' : '') + '</p>' +
      '<p class="bl-dc-note">Записките ти остават само на този телефон. При нас стоят само имейлът и датите на достъпа.</p>';
  }
  let изходЧака = 0;
  async function наКартата(e) {
    const б = e.target.closest('[data-act]');
    if (!б) return;
    const д = б.getAttribute('data-act');
    if (д === 'админ') { отвориАдмин(); return; }
    if (д === 'изход') {
      // две докосвания — случайно докосване не изкарва мама от профила
      const н = б.querySelector('span:not(.bl-ic)');
      if (Date.now() - изходЧака > 5000) {
        изходЧака = Date.now();
        if (н) н.textContent = 'Докосни пак, за да излезеш';
        setTimeout(() => { if (н && н.isConnected && Date.now() - изходЧака >= 5000) н.textContent = 'Изход'; }, 5100);
        return;
      }
      изходЧака = 0; б.disabled = true;
      if (н) н.textContent = 'Излизам…';
      const ок = await изход();
      if (!ок) { б.disabled = false; if (н) н.textContent = 'Изход'; }
      else { const х = document.querySelector('.prof-overlay .prof-close'); if (х) х.click(); }
    }
  }
  // 🧷 profile.js казва „без имейл, без парола, без интернет“ / „Никаква регистрация в интернет“ —
  //   с вратата това вече не е вярно. Сменят се САМО тези думи (точно съвпадение; иначе нищо).
  //   ПЪТ НАЗАД: махни поправиТекстове() и извикването му в картата().
  const ПОПРАВКИ = [
    [' — без имейл, без парола, без интернет. Никой освен теб не го вижда.', ': името и записките ти. Никой освен теб не ги вижда.'],
    ['Никаква регистрация в интернет. „Профил“ тук значи: твоето име и твоите записки, на твоя телефон.', 'Записките ти остават само на този телефон. При нас стоят само имейлът и датите на достъпа.']
  ];
  function поправиТекстове(кутия) {
    const ход = document.createTreeWalker(кутия, NodeFilter.SHOW_TEXT);
    const за = [];
    while (ход.nextNode()) { const н = ход.currentNode; for (const [стар, нов] of ПОПРАВКИ) if (н.nodeValue.indexOf(стар) >= 0) за.push([н, стар, нов]); }
    за.forEach(([н, стар, нов]) => { н.nodeValue = н.nodeValue.replace(стар, нов); });
  }
  function картата() {
    if (!слой || !слой.isConnected) return;
    const кутия = слой.querySelector('.prof-box'); if (!кутия) return;
    let к = кутия.querySelector('.bl-dc');
    const и = инфо();
    if (!и) { if (к) к.remove(); return; }
    поправиТекстове(кутия);
    if (!к) {
      к = document.createElement('section');
      к.className = 'prof-card bl-dc';
      к.setAttribute('aria-label', 'Достъп');
      к.addEventListener('click', наКартата);
    }
    const подпис = JSON.stringify(и);
    if (к.getAttribute('data-sig') !== подпис) { к.innerHTML = htmlКарта(и); к.setAttribute('data-sig', подпис); }
    // място: в тефтера (js/pl-profil.js) — след визитката на бебето; без тефтер — след герба
    const т = кутия.querySelector(':scope > .pl-tefter');
    const род = т || кутия;
    const след = т ? (т.querySelector(':scope > .pl-pv') || т.querySelector(':scope > .prof-avwrap')) : кутия.querySelector(':scope > .prof-hero');
    const намясто = к.parentNode === род && (след ? к.previousElementSibling === след : род.firstElementChild === к);
    if (!намясто) род.insertBefore(к, след ? след.nextSibling : род.firstChild);
  }
  function гледайПрофила() {
    const с = document.querySelector('body > .prof-overlay');
    if (с === слой) return;
    if (наблСлой) { наблСлой.disconnect(); наблСлой = null; }
    слой = с;
    if (!с) return;
    наблСлой = new MutationObserver(() => { clearTimeout(картаТ); картаТ = setTimeout(картата, 50); });
    наблСлой.observe(с, { childList: true, subtree: true });
    картата();
    // отваряне на профила = добър миг да питаме сървъра (с връзка решава той)
    if (Date.now() - последно > 60000 && режим !== 'без-сървър') провери();
  }

  // ═══ 6 · АДМИН ПАНЕЛЪТ ═══
  let адм = null;
  const СТАТУС_АДМ = { active: 'активен', admin: 'админ', expired: 'изтекъл', locked: 'заключен' };
  function отвориАдмин() {
    if (!адм) {
      const к = document.createElement('div');
      к.id = 'blDostapAdmin'; к.className = 'bl-adm'; к.hidden = true;
      к.setAttribute('role', 'dialog'); к.setAttribute('aria-modal', 'true'); к.setAttribute('aria-labelledby', 'blAdmT');
      к.tabIndex = -1;
      document.body.appendChild(к);
      адм = { корен: к, хора: [], брой: null, филтър: 'всички', търси: '', отворен: '', пита: '', ново: false, съоб: '', грешка: false, зарежда: false };
      к.addEventListener('click', наАдмКлик);
      к.addEventListener('submit', наАдмФорма);
      к.addEventListener('input', e => { if (e.target.id === 'blAdmQ') { адм.търси = e.target.value; рисувайСписъка(); } });
      к.addEventListener('keydown', e => { if (e.key === 'Escape') { e.preventDefault(); затвориАдмин(); } });
    }
    адм.корен.hidden = false;
    document.documentElement.classList.add('bl-adm-on');
    рисувайАдмин();
    try { адм.корен.focus({ preventScroll: true }); } catch (e) {}
    заредиАдмин();
  }
  function затвориАдмин() {
    if (!адм) return;
    адм.корен.hidden = true;
    document.documentElement.classList.remove('bl-adm-on');
  }
  function статус(т, грешка) {
    if (!адм) return;
    адм.съоб = т || ''; адм.грешка = !!грешка;
    const с = адм.корен.querySelector('.bl-adm-msg');
    if (с) { с.textContent = адм.съоб; с.classList.toggle('bl-adm-msg-err', адм.грешка); с.hidden = !адм.съоб; }
  }
  async function заредиАдмин(тихо) {
    адм.зарежда = true;
    if (!тихо) статус('Зареждам профилите…');
    const р = await апи('GET', 'admin/users');
    адм.зарежда = false;
    if (!р.мрежа) { статус('Няма връзка. Администрацията работи само с интернет.', 1); рисувайСписъка(); return; }
    if (р.код === 401) { затвориАдмин(); провери(); return; }
    if (р.код === 403) { статус(грешкаОт(р, 'Нямаш администраторски права.'), 1); адм.хора = []; адм.брой = null; рисувайАдмин(); return; }
    if (р.код !== 200 || !р.данни || !Array.isArray(р.данни.users)) { статус(грешкаОт(р, 'Списъкът не дойде (код ' + р.код + '). Опитай пак.'), 1); рисувайСписъка(); return; }
    адм.хора = р.данни.users.slice().sort((а, б) => String(б.created_at || '').localeCompare(String(а.created_at || '')));
    адм.брой = р.данни.broi || null;
    if (!тихо) статус('');
    рисувайАдмин();
  }
  function бройки() {
    if (адм.брой) return адм.брой;
    const б = { vsichki: 0, aktivni: 0, izteklite: 0, zaklyucheni: 0 };
    адм.хора.forEach(u => { б.vsichki++; if (u.status === 'active' || u.status === 'admin') б.aktivni++; else if (u.status === 'locked') б.zaklyucheni++; else б.izteklite++; });
    return б;
  }
  function рисувайАдмин() {
    const б = бройки();
    const плочка = (ф, n, име) => '<button type="button" class="bl-adm-tile' + (адм.филтър === ф ? ' on' : '') + '" data-a="филтър" data-f="' + ф + '" aria-pressed="' + (адм.филтър === ф) + '"><b class="bl-num">' + (n == null ? '—' : n) + '</b><span>' + име + '</span></button>';
    адм.корен.innerHTML =
      '<div class="bl-adm-in">' +
      '<header class="bl-adm-head"><button type="button" class="bl-adm-x pl-soft" data-a="затвори" aria-label="Назад към профила">←</button>' +
        '<div class="bl-adm-ht"><h2 id="blAdmT">Администрация</h2><p>Бейби Ленд · профилите на мамите</p></div>' +
        '<button type="button" class="bl-adm-x bl-adm-ref pl-soft" data-a="обнови" aria-label="Обнови списъка">↻</button></header>' +
      '<div class="bl-adm-tiles" role="group" aria-label="Броячи и филтър">' +
        плочка('всички', б.vsichki, 'всички') + плочка('активни', б.aktivni, 'активни') + плочка('изтекли', б.izteklite, 'изтекли') + плочка('заключени', б.zaklyucheni, 'заключени') +
      '</div>' +
      '<div class="bl-adm-tools">' +
        '<label class="bl-adm-q"><span class="bl-sr">Търси по имейл</span><input id="blAdmQ" type="search" inputmode="email" autocapitalize="off" spellcheck="false" placeholder="Търси по имейл…" value="' + esc(адм.търси) + '"></label>' +
        '<div class="bl-adm-tb">' +
          '<button type="button" class="pl-gel bl-adm-new" data-a="ново" aria-expanded="' + адм.ново + '">Нов профил</button>' +
          '<button type="button" class="pl-soft" data-a="csv">Свали CSV</button>' +
        '</div>' +
      '</div>' +
      (адм.ново ?
        '<form class="bl-adm-form bl-adm-newf" data-f="create">' +
          '<p class="bl-adm-fh">Нов профил</p>' +
          '<label><span>Имейл</span><input name="email" type="email" inputmode="email" autocapitalize="off" spellcheck="false" required></label>' +
          '<label><span>Парола · поне 8 знака</span><input name="password" type="text" autocomplete="off" minlength="8" required></label>' +
          '<label><span>Дни достъп</span><input name="days" type="number" inputmode="numeric" min="1" max="3650" value="' + дниПробни + '"></label>' +
          '<div class="bl-adm-row"><button type="submit" class="pl-gel">Създай</button><button type="button" class="pl-soft" data-a="ново">Отказ</button></div>' +
        '</form>' : '') +
      '<p class="bl-adm-msg' + (адм.грешка ? ' bl-adm-msg-err' : '') + '" role="status"' + (адм.съоб ? '' : ' hidden') + '>' + esc(адм.съоб) + '</p>' +
      '<div class="bl-adm-list" aria-live="polite"></div>' +
      '</div>';
    рисувайСписъка();
  }
  function видим(u) {
    const ф = адм.филтър;
    if (ф === 'активни' && !(u.status === 'active' || u.status === 'admin')) return false;
    if (ф === 'изтекли' && u.status !== 'expired') return false;
    if (ф === 'заключени' && u.status !== 'locked') return false;
    const т = адм.търси.trim().toLowerCase();
    return !т || String(u.email || '').toLowerCase().indexOf(т) >= 0;
  }
  function редHtml(u) {
    const отв = адм.отворен === u.email;
    const ст = u.status === 'active' && u.proben ? 'proben' : (u.status || 'expired');
    const надпис = ст === 'proben' ? 'пробен' : (СТАТУС_АДМ[u.status] || u.status_bg || u.status || '—');
    const n = остават(u);
    // 21.10 · главната сесия (отчетът на свързващия, кадри dostap21_*_05/06): админът показваше „до … · остават 14 дни“,
    //   а той не изтича — картата в профила вярно казва „Без срок“. ПЪТ НАЗАД: махни „(u.status === 'admin' || u.admin) ? 'без срок' :“.
    const до = (u.status === 'admin' || u.admin) ? 'без срок' : u.access_until ? 'до <span class="bl-num">' + esc(дата(u.access_until)) + '</span>' + (u.status === 'active' ? ' · ' + (n === 1 ? 'остава 1 ден' : 'остават <span class="bl-num">' + n + '</span> дни') : '') : 'без срок';
    const id = 'blU' + Math.abs(хеш(u.email));
    let действия = '';
    if (отв) {
      const админ = u.status === 'admin' || u.admin;
      const пита = адм.пита === u.email;
      действия = '<div class="bl-adm-acts" id="' + id + '">' +
        (админ ? '<p class="bl-adm-hint">Администратор — не се заключва и не изтича.</p>' : '') +
        '<div class="bl-adm-row bl-adm-ext"><button type="button" class="pl-gel" data-a="extend30">+1 месец</button>' +
          '<form class="bl-adm-inl" data-f="extend"><label class="bl-adm-n"><span class="bl-sr">Брой дни</span><input name="days" type="number" inputmode="numeric" min="1" max="3650" value="7"></label><button type="submit" class="pl-soft">+ дни</button></form></div>' +
        '<form class="bl-adm-inl bl-adm-wide" data-f="set_until"><label><span>До дата</span><input name="until" type="date" value="' + esc(заПоле(u.access_until) || '') + '"></label><button type="submit" class="pl-soft">Запиши</button></form>' +
        '<form class="bl-adm-inl bl-adm-wide" data-f="set_password"><label><span>Нова парола</span><input name="password" type="text" autocomplete="off" minlength="8" placeholder="поне 8 знака"></label><button type="submit" class="pl-soft">Смени</button></form>' +
        (админ ? '' :
          '<div class="bl-adm-row">' +
            (u.status === 'locked' || u.locked ? '<button type="button" class="pl-soft" data-a="unlock">Отключи</button>' : '<button type="button" class="pl-soft" data-a="lock">Заключи</button>') +
            (пита ? '' : '<button type="button" class="bl-adm-del" data-a="изтрий">Изтрий</button>') +
          '</div>' +
          (пита ? '<div class="bl-adm-confirm" role="alertdialog" aria-label="Потвърди изтриването"><p>Изтрий завинаги <b>' + esc(u.email) + '</b>? Профилът и достъпът изчезват. Записките на телефона ѝ остават при нея.</p>' +
            '<div class="bl-adm-row"><button type="button" class="bl-adm-del bl-adm-del2" data-a="delete">Да, изтрий</button><button type="button" class="pl-soft" data-a="отказ">Отказ</button></div></div>' : '')) +
        '</div>';
    }
    return '<article class="bl-adm-u' + (отв ? ' open' : '') + '" data-e="' + esc(u.email) + '">' +
      '<button type="button" class="bl-adm-uh" data-a="отвори" aria-expanded="' + отв + '"' + (отв ? ' aria-controls="' + id + '"' : '') + '>' +
        '<span class="bl-adm-ut"><b>' + esc(u.email) + '</b><span class="bl-badge bl-b-' + ст + '">' + esc(надпис) + '</span></span>' +
        '<span class="bl-adm-ud">' + до + '</span>' +
        '<span class="bl-adm-ud bl-adm-ud2">регистрирана <span class="bl-num">' + esc(дата(u.created_at)) + '</span></span>' +
        '<span class="bl-adm-ud bl-adm-ud2">' + (u.last_login ? 'последно влизане <span class="bl-num">' + esc(датаЧас(u.last_login)) + '</span>' : 'още не е влизала') + '</span>' +
        '<span class="bl-adm-chev" aria-hidden="true">' + (отв ? '‹' : '›') + '</span>' +
      '</button>' + действия + '</article>';
  }
  function хеш(с) { let х = 0; for (const ч of String(с)) х = (х * 31 + ч.codePointAt(0)) | 0; return х; }
  function рисувайСписъка() {
    const сп = адм && адм.корен.querySelector('.bl-adm-list'); if (!сп) return;
    const хора = адм.хора.filter(видим);
    if (!адм.хора.length) { сп.innerHTML = адм.зарежда ? '' : '<p class="bl-adm-empty">Още няма профили.</p>'; return; }
    сп.innerHTML = хора.length ? хора.map(редHtml).join('') : '<p class="bl-adm-empty">Няма профили по това търсене.</p>';
  }
  async function действие(тяло, описание) {
    статус('Записвам…');
    const р = await апи('POST', 'admin/user', тяло);
    if (!р.мрежа) { статус('Няма връзка — нищо не е променено.', 1); return false; }
    if (р.код === 401) { затвориАдмин(); провери(); return false; }
    if (р.код !== 200 || !р.данни || р.данни.ok === false) { статус(грешкаОт(р, 'Не стана (код ' + р.код + ').'), 1); return false; }
    await заредиАдмин(true);
    статус(описание(р.данни));
    return true;
  }
  const доКога = d => (d && d.user && d.user.access_until ? ' Достъп до ' + дата(d.user.access_until) + '.' : '');
  async function наАдмКлик(e) {
    const б = e.target.closest('[data-a]');
    if (!б || !адм.корен.contains(б) || б.tagName === 'FORM') return;
    const д = б.getAttribute('data-a');
    const ред = б.closest('.bl-adm-u'), имейл = ред ? ред.getAttribute('data-e') : '';
    if (д === 'затвори') { затвориАдмин(); return; }
    if (д === 'филтър') { адм.филтър = б.getAttribute('data-f'); рисувайАдмин(); return; }
    if (д === 'ново') { адм.ново = !адм.ново; рисувайАдмин(); if (адм.ново) { const п = адм.корен.querySelector('.bl-adm-newf input[name="email"]'); if (п) п.focus(); } return; }
    if (д === 'обнови') { заредиАдмин(); return; }
    if (д === 'csv') { свалиCSV(); return; }
    if (д === 'отвори') { адм.отворен = адм.отворен === имейл ? '' : имейл; адм.пита = ''; рисувайСписъка(); return; }
    if (д === 'изтрий') { адм.пита = имейл; рисувайСписъка(); const н = адм.корен.querySelector('.bl-adm-del2'); if (н) н.focus(); return; }
    if (д === 'отказ') { адм.пита = ''; рисувайСписъка(); return; }
    б.disabled = true;
    if (д === 'extend30') await действие({ action: 'extend', email: имейл, days: 30 }, d => 'Готово: +1 месец за ' + имейл + '.' + доКога(d));
    else if (д === 'lock') await действие({ action: 'lock', email: имейл }, () => 'Заключен: ' + имейл + '.');
    else if (д === 'unlock') await действие({ action: 'unlock', email: имейл }, d => 'Отключен: ' + имейл + '.' + доКога(d));
    else if (д === 'delete') { const ок = await действие({ action: 'delete', email: имейл }, () => 'Изтрит: ' + имейл + '.'); if (ок) { адм.отворен = ''; адм.пита = ''; рисувайСписъка(); } }
    if (б.isConnected) б.disabled = false;
  }
  async function наАдмФорма(e) {
    e.preventDefault();
    const ф = e.target; const вид = ф.getAttribute('data-f');
    const ред = ф.closest('.bl-adm-u'), имейл = ред ? ред.getAttribute('data-e') : '';
    const пол = и => { const п = ф.querySelector('[name="' + и + '"]'); return п ? п.value.trim() : ''; };
    const бт = ф.querySelector('button[type="submit"]'); if (бт) бт.disabled = true;
    const край = () => { if (бт && бт.isConnected) бт.disabled = false; };
    if (вид === 'extend') {
      const n = Number(пол('days'));
      if (!Number.isInteger(n) || n < 1 || n > 3650) { статус('Броят дни трябва да е цяло число от 1 до 3650.', 1); край(); return; }
      await действие({ action: 'extend', email: имейл, days: n }, d => 'Готово: +' + дниДума(n) + ' за ' + имейл + '.' + доКога(d));
    } else if (вид === 'set_until') {
      const до = пол('until');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(до)) { статус('Избери дата.', 1); край(); return; }
      await действие({ action: 'set_until', email: имейл, until: до }, d => 'Готово: ' + имейл + ' има достъп до ' + (d && d.user && d.user.access_until ? дата(d.user.access_until) : до.split('-').reverse().join('.')) + '.');
    } else if (вид === 'set_password') {
      const п = пол('password');
      if (п.length < 8) { статус('Паролата трябва да е поне 8 знака.', 1); край(); return; }
      await действие({ action: 'set_password', email: имейл, password: п }, () => 'Паролата на ' + имейл + ' е сменена. Кажи ѝ новата лично.');
    } else if (вид === 'create') {
      const им = пол('email').toLowerCase(), п = пол('password'), n = Number(пол('days') || дниПробни);
      if (!ИМЕЙЛ_RE.test(им)) { статус('Провери имейла.', 1); край(); return; }
      if (п.length < 8) { статус('Паролата трябва да е поне 8 знака.', 1); край(); return; }
      if (!Number.isInteger(n) || n < 1 || n > 3650) { статус('Броят дни трябва да е цяло число от 1 до 3650.', 1); край(); return; }
      const ок = await действие({ action: 'create', email: им, password: п, days: n }, d => 'Създаден: ' + им + '.' + доКога(d));
      if (ок) { адм.ново = false; адм.отворен = им; рисувайАдмин(); }
    }
    край();
  }
  async function свалиCSV() {
    статус('Подготвям файла…');
    await чистиКеша('admin/export');
    let р;
    try { р = await fetch(API + 'admin/export', { credentials: 'same-origin', cache: 'no-store' }); } catch (e) { статус('Няма връзка.', 1); return; }
    if (!р.ok) {
      let т = ''; try { т = (await р.json()).error || ''; } catch (e) {}
      if (р.status === 401) { затвориАдмин(); провери(); return; }
      статус(т || 'Файлът не дойде (код ' + р.status + ').', 1); return;
    }
    const ч = части(new Date().toISOString());
    let име = 'babyland-profili-' + (ч ? ч.year + '-' + ч.month + '-' + ч.day : 'dnes') + '.csv';
    const cd = р.headers.get('content-disposition') || '';
    const м = cd.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
    if (м) { try { име = decodeURIComponent(м[1]); } catch (e) {} }
    const блоб = await р.blob();
    const адрес = URL.createObjectURL(блоб);
    const а = document.createElement('a');
    а.href = адрес; а.download = име; а.rel = 'noopener';
    document.body.appendChild(а); а.click(); а.remove();
    setTimeout(() => URL.revokeObjectURL(адрес), 60000);
    статус('Файлът е свален: ' + име);
  }

  // ═══ 7 · ТРЪГВАНЕТО ═══
  function старт() {
    const к = чети();
    if (к) {
      // има кеш → без премигване: приложението стои отворено (или „изтекло“ по часовника), докато сървърът отговори
      if (активен(к, true)) режим = 'вътре';
      else { съобщение = текстИзтекло(к); отКеша = true; смени('изтекло'); }
    }
    провери();
    new MutationObserver(гледайПрофила).observe(document.body, { childList: true });
    гледайПрофила();
    // връщане в приложението / нова връзка → питаме пак (най-много веднъж на 5 мин, освен ако екранът е отгоре)
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && режим !== 'без-сървър' && (наЕкран() || Date.now() - последно > 300000)) провери(); });
    window.addEventListener('online', () => { if (режим !== 'без-сървър') провери(); });
    // часовникът: срокът мина, докато приложението е отворено → питаме сървъра (без връзка решава кешът)
    setInterval(() => {
      if (режим !== 'вътре') return;
      const u = сървър && сървър.user ? сървър.user : чети();
      if (!u || u.admin || u.status === 'admin') return;
      const до = Date.parse(u.access_until);
      if (isFinite(до) && до <= Date.now()) провери();
    }, 60000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', старт); else старт();

  // за пробите и за свързването — нищо тук не заобикаля сървъра
  window.BL_DOSTAP = {
    провери, отвориАдмин, затвориАдмин,
    състояние: () => ({ режим, вид, отКеша, видим: !!(корен && !корен.hidden), user: сървър && сървър.user ? Object.assign({}, сървър.user) : null, кеш: чети() })
  };
})();
