// 21.10 · достъп — СТЪПКИТЕ на пробата от край до край (за dev/proba/cdp_proba_dostap.js --steps).
// Истинският сървър: dev/proba/server_api.js (порт 8914, /api/* в паметта, същият makeApi като на Netlify).
// Истинският sw.js: fetch НЕ се подменя.
// Пътят: нов профил → вратата → регистрация → „Достъп“ 14 дни → изход → админът (aaeromove) влиза →
//   „Администрация“ → датата на мама в миналото → мама влиза → „изтече“ + 4-те контакта + SOS 112 →
//   админът от ВТОРИ телефон (node) удължава с месец → „Провери пак“ → достъпът е обратно → „Достъп“ 30 дни.
// Паролите тук са ТЕСТОВИ — само за паметния сървър, който почва празен при всяко пускане.
// ПЪТ НАЗАД: махни този файл.
const ПОМОЩ =
  'const __п = ms => new Promise(r => setTimeout(r, ms));' +
  'const __чакай = async (f, ms) => { const край = Date.now() + (ms || 8000); while (Date.now() < край) { try { const v = f(); if (v) return v; } catch (e) {} await __п(120); } return null; };' +
  'const __ст = () => BL_DOSTAP.състояние();' +
  'const __пиши = (sel, v) => { const и = document.querySelector(sel); и.value = v; и.dispatchEvent(new Event("input", { bubbles: true })); };' +
  'const __т = el => el ? el.innerText.replace(/\\s+/g, " ").trim() : null;';
const стр = (fn, д) => '(async () => { ' + ПОМОЩ + ' return await (' + fn.toString() + ')(' + JSON.stringify(д || {}) + '); })()';

module.exports = ({ тема }) => {
  const Д = {
    МАМА: 'mama.proba.' + (тема === 'dark' ? 'tamno' : 'svetlo') + '@abv.bg',
    ПМ: 'proba-mama-2110-' + тема,
    АДМИН: 'aaeromove@gmail.com',
    ПА: 'proba-admin-2110-pamet'
  };
  return { steps: [
    // 0 · service worker-ът поема страницата (иначе пробата на /api/ мери себе си)
    { ime: 'sw', snimka: false, expr: стр(async () => {
      const к = await __чакай(() => navigator.serviceWorker && navigator.serviceWorker.controller, 240000);
      const рег = await navigator.serviceWorker.getRegistration();
      return { контрольор: !!к, скрипт: к && к.scriptURL, състояние: рег && рег.active && рег.active.state, кешове: await caches.keys() };
    }) },
    { ime: 'prezaredi', snimka: false, reload: true },
    // 1 · нов профил → вратата
    { ime: '01_vrata', expr: стр(async () => {
      const видя = await __чакай(() => window.BL_DOSTAP && __ст().видим, 25000); await __п(700);
      const к = document.getElementById('blDostap'); к.scrollTop = 0;
      return { видя: !!видя, контрольор: !!navigator.serviceWorker.controller, режим: __ст().режим, вид: __ст().вид,
        заглавие: __т(к.querySelector('.bl-dg-t')), водещ: __т(к.querySelector('.bl-dg-lead')), малко: __т(к.querySelector('.bl-dg-small')),
        бутон: __т(к.querySelector('.bl-dg-cta')), т112: к.querySelector('.bl-dg-112').getAttribute('href'),
        сос: [...к.querySelectorAll('.bl-dg-row b')].map(x => x.textContent), стартов: !!document.getElementById('blSplash') };
    }) },
    // 2 · регистрация с тестов имейл
    { ime: '02_registracia', wait: 300, expr: стр(async (д) => {
      const к = document.getElementById('blDostap');
      if (__ст().вид !== 'рег') { к.querySelector('[data-act="рег-вид"]').click(); await __п(200); }
      __пиши('#blDgEmail', д.МАМА); __пиши('#blDgPass', д.ПМ); к.querySelector('.bl-dg-form').requestSubmit();
      const ок = await __чакай(() => __ст().режим === 'вътре' && !__ст().видим, 30000); await __п(400);
      return { ок: !!ок, режим: __ст().режим, user: __ст().user, кеш: localStorage.getItem('bl_dostap'), поздрав: __т(document.querySelector('.fx-cheer')) };
    }, Д) },
    // 3 · „Достъп“ в профила: 14 дни
    { ime: '03_dostap_14', expr: стр(async () => {
      document.getElementById('bnProfile').click();
      const б = await __чакай(() => document.querySelector('.prof-overlay .bl-dc .bl-dc-big'), 8000); await __п(900);
      const сл = document.querySelector('.prof-overlay'), кр = б.closest('.bl-dc');
      сл.scrollTop += кр.getBoundingClientRect().top - 70; await __п(400);
      return { текст: __т(кр).slice(0, 520) };
    }) },
    // 4 · изход (две докосвания) → вратата на „Вход“
    { ime: '04_izhod_vhod', expr: стр(async () => {
      const б = () => document.querySelector('.prof-overlay .bl-dc .bl-dc-out');
      б().click(); await __п(250); const първо = __т(б()); б().click();
      const ок = await __чакай(() => __ст().режим === 'врата' && __ст().видим, 8000); await __п(500);
      const к = document.getElementById('blDostap'); к.scrollTop = 0;
      return { първо, ок: !!ок, вид: __ст().вид, заглавие: __т(к.querySelector('.bl-dg-t')), кеш: localStorage.getItem('bl_dostap') };
    }) },
    // 5 · админът влиза (първия път — регистрация; ако вече го има — 409 → вход)
    { ime: 'admin_vhod', snimka: false, expr: стр(async (д) => {
      const к = document.getElementById('blDostap');
      if (__ст().вид !== 'рег') { к.querySelector('[data-act="рег-вид"]').click(); await __п(200); }
      __пиши('#blDgEmail', д.АДМИН); __пиши('#blDgPass', д.ПА); к.querySelector('.bl-dg-form').requestSubmit();
      await __чакай(() => __ст().режим === 'вътре' || (__ст().вид === 'вход' && !к.querySelector('.bl-dg-err').hidden), 12000);
      let път = 'регистрация';
      if (__ст().режим !== 'вътре') {
        път = 'вход след 409: ' + __т(к.querySelector('.bl-dg-err'));
        __пиши('#blDgPass', д.ПА); к.querySelector('.bl-dg-form').requestSubmit();
        await __чакай(() => __ст().режим === 'вътре', 12000);
      }
      await __п(400);
      return { път, режим: __ст().режим, user: __ст().user };
    }, Д) },
    // 6 · „Администрация“: мамата е в списъка
    { ime: '05_admin_panel', expr: стр(async (д) => {
      document.getElementById('bnProfile').click();
      const б = await __чакай(() => document.querySelector('.prof-overlay .bl-dc .bl-dc-adm'), 8000); await __п(500);
      const карта = __т(document.querySelector('.prof-overlay .bl-dc')).slice(0, 220);
      б.click();
      await __чакай(() => [...document.querySelectorAll('#blDostapAdmin .bl-adm-u')].some(x => x.dataset.e === д.МАМА), 8000); await __п(500);
      const а = document.getElementById('blDostapAdmin');
      return { карта, броячи: [...а.querySelectorAll('.bl-adm-tile')].map(__т), редове: [...а.querySelectorAll('.bl-adm-u')].map(x => x.dataset.e + ' · ' + __т(x.querySelector('.bl-badge'))) };
    }, Д) },
    // 7 · датата на мама — вчера (по София) → изтекла
    { ime: '06_admin_minalo', expr: стр(async (д) => {
      const а = document.getElementById('blDostapAdmin');
      const ред = () => [...а.querySelectorAll('.bl-adm-u')].find(x => x.dataset.e === д.МАМА);
      ред().querySelector('.bl-adm-uh').click(); await __п(250);
      const вчера = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Sofia', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(Date.now() - 864e5));
      const ф = ред().querySelector('form[data-f="set_until"]'); ф.querySelector('input[name="until"]').value = вчера; ф.requestSubmit();
      await __чакай(() => /Готово/.test(а.querySelector('.bl-adm-msg').textContent), 8000); await __п(300);
      ред().scrollIntoView({ block: 'start' }); а.scrollTop -= 120; await __п(300);
      return { вчера, съобщение: __т(а.querySelector('.bl-adm-msg')), значка: __т(ред().querySelector('.bl-badge')), ред: __т(ред().querySelector('.bl-adm-ud')), броячи: [...а.querySelectorAll('.bl-adm-tile')].map(__т) };
    }, Д) },
    // 8 · админът излиза, мама влиза → „изтече“ + 4-те контакта + SOS 112
    { ime: '07_izteklo', expr: стр(async (д) => {
      BL_DOSTAP.затвориАдмин(); await __п(250);
      const б = () => document.querySelector('.prof-overlay .bl-dc .bl-dc-out');
      б().click(); await __п(250); б().click();
      await __чакай(() => __ст().режим === 'врата' && __ст().видим, 8000); await __п(300);
      const к = document.getElementById('blDostap');
      if (__ст().вид !== 'вход') { к.querySelector('[data-act="вход-вид"]').click(); await __п(200); }
      __пиши('#blDgEmail', д.МАМА); __пиши('#blDgPass', д.ПМ); к.querySelector('.bl-dg-form').requestSubmit();
      const ок = await __чакай(() => __ст().режим === 'изтекло' && __ст().видим, 12000); await __п(600); к.scrollTop = 0;
      return { ок: !!ок, режим: __ст().режим, status: (__ст().user || {}).status, заглавие: __т(к.querySelector('.bl-dg-t')), текст: __т(к.querySelector('.bl-dg-lead')), имейл: __т(к.querySelector('.bl-dg-small')),
        контакти: [...к.querySelectorAll('.bl-kont-b')].map(a => a.dataset.k + ' ' + a.getAttribute('href').slice(0, 70)), т112: к.querySelector('.bl-dg-112').getAttribute('href'), сос: [...к.querySelectorAll('.bl-dg-row b')].map(x => x.textContent) };
    }, Д) },
    { ime: '08_izteklo_dolu', expr: стр(async () => {
      const к = document.getElementById('blDostap'); к.scrollTop = к.scrollHeight; await __п(400);
      return { scrollTop: к.scrollTop, провери: __т(к.querySelector('[data-act="провери"]')), друг: __т(к.querySelector('[data-act="друг"]')) };
    }) },
    // 9 · ВТОРИЯТ телефон: админът удължава с месец (+30 дни, както бутонът „+1 месец“)
    { ime: 'admin_mesec', snimka: false, node: async (h) => {
      const вход = await h.api('админ', 'POST', 'login', { email: Д.АДМИН, password: Д.ПА });
      const р = await h.api('админ', 'POST', 'admin/user', { action: 'extend', email: Д.МАМА, days: 30 });
      const сп = await h.api('админ', 'GET', 'admin/users');
      const ред = сп.json && сп.json.users ? сп.json.users.find(u => u.email === Д.МАМА) : null;
      return { вход: вход.status, админ: вход.json && вход.json.user && вход.json.user.status, удължи: р.status, user: р.json && р.json.user, ред, broi: сп.json && сп.json.broi };
    } },
    // 10 · „Провери пак“ → достъпът е обратно
    { ime: '09_proveri_pak', wait: 300, expr: стр(async () => {
      const к = document.getElementById('blDostap'); к.querySelector('[data-act="провери"]').click();
      const ок = await __чакай(() => __ст().режим === 'вътре' && !__ст().видим, 12000); await __п(500);
      return { ок: !!ок, режим: __ст().режим, user: __ст().user, кеш: localStorage.getItem('bl_dostap') };
    }) },
    { ime: '10_dostap_mesec', expr: стр(async () => {
      document.getElementById('bnProfile').click();
      const б = await __чакай(() => document.querySelector('.prof-overlay .bl-dc .bl-dc-big'), 8000); await __п(900);
      const сл = document.querySelector('.prof-overlay'), кр = б.closest('.bl-dc');
      сл.scrollTop += кр.getBoundingClientRect().top - 70; await __п(400);
      return { текст: __т(кр).slice(0, 420) };
    }) },
    // 11 · Cache Storage: нито един /api/ запис; кой service worker води
    { ime: 'sw_kesh', snimka: false, expr: стр(async () => {
      const имена = await caches.keys(); const апи = []; let общо = 0;
      for (const и of имена) { const к = await caches.open(и); for (const r of await к.keys()) { общо++; if (new URL(r.url).pathname.indexOf('/api/') === 0) апи.push(и + ' ' + r.url); } }
      const д = await caches.match('bl-oflayn-doklad'); const доклад = д ? await д.json() : null;
      return { контрольор: navigator.serviceWorker.controller && navigator.serviceWorker.controller.scriptURL, кешове: имена, записи: общо, апиВКеша: апи,
        доклад: доклад && { кеш: доклад.кеш, общо: доклад.общо, кеширани: доклад.кеширани, паднали: доклад.паднали } };
    }) }
  ] };
};
