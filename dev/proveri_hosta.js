// ═══════════════════════════════════════════════════════════════════════
// 🌍 ПРОВЕРКА НА ЖИВИЯ ХОСТ — прави ли сървърът това, което мислим?
//
// ЗАЩО (15.09.2026): .htaccess за Джъмп.бг (LiteSpeed + cPanel) не може да
//   се изпробва от тази машина. А LiteSpeed НЕ СЕ ОПЛАКВА от директива, която
//   не разбира — просто я прескача. <IfModule> на Apache прави същото.
//   Тоест сайтът ще тръгне и ще ИЗГЛЕЖДА наред, дори половината правила да
//   не работят. Единственото доказателство е да попиташ ЖИВИЯ сървър.
//
//   Компресията на LiteSpeed изобщо не зависи от .htaccess — пуска се от
//   настройките на сървъра. Затова тя се МЕРИ тук, не се обещава.
//
// ПУСКАНЕ:  node dev/proveri_hosta.js https://ДОМЕЙН.bg
//           node dev/proveri_hosta.js https://aerobotamove.github.io/babyland/
// ИЗХОД:    0 = нито едно 🔴 · 1 = има 🔴 · 2 = уредът е сляп (не стигна до сайта)
// ПЪТ НАЗАД: уредът само ЧЕТЕ — праща GET заявки, нищо не пише.
// ═══════════════════════════════════════════════════════════════════════
const http = require('http');
const https = require('https');

const адрес = process.argv.slice(2).find(a => /^https?:/i.test(a));
if (!адрес) {
  console.log('ПУСКАНЕ: node dev/proveri_hosta.js https://ДОМЕЙН.bg');
  process.exit(2);
}
const база = new URL(адрес.endsWith('/') ? адрес : адрес + '/');
const ХОСТ = база.host;   // с порта, ако има — иначе локалната проба удря порт 80

const брой = { зелено: 0, жълто: 0, червено: 0 };
const ЗНАК = { зелено: '✅', жълто: '🟡', червено: '🔴' };
function ред(цвят, име, видяно, защо) {
  брой[цвят]++;
  console.log('  ' + ЗНАК[цвят] + ' ' + име);
  if (видяно) console.log('       видях: ' + видяно);
  if (защо && цвят !== 'зелено') console.log('       защо е важно: ' + защо);
}

function заявка(url, опции = {}) {
  return new Promise(resolve => {
    let u;
    try { u = new URL(url); } catch (e) { resolve({ грешка: 'лош адрес' }); return; }
    const lib = u.protocol === 'http:' ? http : https;
    const req = lib.request(u, {
      method: 'GET',
      headers: Object.assign({ 'User-Agent': 'BabyLand-proverka/1.0', 'Cache-Control': 'no-cache' }, опции.заглавки || {}),
      timeout: 20000,
    }, res => {
      const части = []; let байта = 0;
      res.on('data', d => { байта += d.length; if (опции.тяло) части.push(d); });
      res.on('end', () => resolve({ статус: res.statusCode, з: res.headers, байта, тяло: опции.тяло ? Buffer.concat(части).toString('utf8') : '' }));
      res.on('error', e => resolve({ грешка: e.message }));
    });
    req.on('timeout', () => req.destroy(new Error('няма отговор за 20 сек')));
    req.on('error', e => resolve({ грешка: e.code || e.message }));
    req.end();
  });
}
const КОМПРЕСИЯ = { 'Accept-Encoding': 'gzip, br' };
const кб = n => Math.round(n / 1024) + ' КБ';
const cc = r => (r.з && r.з['cache-control']) || '(няма Cache-Control)';
const тип = r => (r.з && r.з['content-type']) || '(няма Content-Type)';
const maxAge = с => { const m = /max-age=(\d+)/i.exec(с || ''); return m ? Number(m[1]) : null; };
const презаредимо = с => /no-cache|no-store/i.test(с || '') || maxAge(с) === 0;
const пренасочва = r => r.статус >= 300 && r.статус < 400;

(async () => {
  console.log('');
  console.log('🌍 ПРОВЕРКА НА ЖИВИЯ ХОСТ: ' + база.href);
  console.log('');

  // ── 0 · стига ли се изобщо, и вижда ли уредът това, което ще мери ──
  const инд = await заявка(база.href + 'index.html', { тяло: true });
  if (инд.грешка || инд.статус !== 200) {
    console.log('  🔴 index.html не се отваря: ' + (инд.грешка || 'статус ' + инд.статус));
    console.log('     Уредът е СЛЯП — нищо друго не може да се провери.');
    process.exit(2);
  }
  const html = инд.тяло;
  const намери = re => { const m = re.exec(html); return m ? m[1] : null; };
  const kb = намери(/src="(js\/kb\.js[^"]*)"/);
  const app = намери(/src="(js\/app\.js[^"]*)"/);
  const css = намери(/href="(css\/style\.css[^"]*)"/);
  const шрифт = намери(/href="(fonts\/[^"]+\.woff2[^"]*)"/);
  const липсва = [['kb.js', kb], ['app.js', app], ['style.css', css], ['шрифт', шрифт]].filter(x => !x[1]);
  if (липсва.length) {
    console.log('  🔴 УРЕДЪТ Е СЛЯП: в index.html не намирам ' + липсва.map(x => x[0]).join(', '));
    process.exit(2);
  }

  // ── 1 · версията ──
  console.log('  ── 1 · стига ли новата версия до майката ──');
  const корен = await заявка(база.href);
  for (const [име, r] of [['„/" (него отваря иконата на телефона)', корен], ['index.html', инд]]) {
    const с = cc(r);
    if (r.грешка || r.статус !== 200) ред('червено', име + ' → ' + (r.грешка || 'статус ' + r.статус), null, 'иконата на телефона отваря точно този адрес');
    else if (презаредимо(с)) ред('зелено', име + ' се проверява при всяко отваряне', с);
    else if (maxAge(с) !== null && maxAge(с) <= 600) ред('жълто', име + ' може да е стар до ' + maxAge(с) + ' сек', с, 'кратко е и не заключва майката — но no-cache е по-добре');
    else ред('червено', име + ' може да остане стар ДНИ', с, 'service worker-ът тегли страницата през кеша на браузъра; без no-cache браузърът сам решава колко да я пази и майката гледа старата версия, докато е онлайн');
  }
  const sw = await заявка(база.href + 'sw.js');
  if (sw.грешка || sw.статус !== 200) ред('червено', 'sw.js → ' + (sw.грешка || 'статус ' + sw.статус), null, 'без него няма офлайн');
  else {
    if (!/javascript/i.test(тип(sw))) ред('червено', 'sw.js идва с грешен тип', тип(sw), 'браузърът отказва да регистрира service worker с тип, различен от JavaScript — офлайн изчезва');
    else ред('зелено', 'sw.js е JavaScript', тип(sw));
    if (презаредимо(cc(sw))) ред('зелено', 'sw.js не се кешира', cc(sw));
    else ред('жълто', 'sw.js се кешира', cc(sw), 'браузърите от 2018 г. проверяват sw.js покрай кеша, така че не заключва майката — но no-store е по-сигурно');
  }

  // ── 2 · типовете ──
  console.log('');
  console.log('  ── 2 · типовете (nosniff спира скрипт или стил с грешен тип) ──');
  const т = тип(инд);
  if (/charset=utf-8/i.test(т)) ред('зелено', 'index.html е UTF-8', т);
  else if (/charset=/i.test(т)) ред('червено', 'index.html идва с ЧУЖДА кодировка', т, 'заглавката бие <meta charset> — всяка българска буква става нечетима');
  else ред('жълто', 'index.html без кодировка в заглавката', т, '<meta charset="UTF-8"> го спасява, но заглавката е по-сигурна');
  const jsR = await заявка(база.href + app);
  if (!/javascript/i.test(тип(jsR))) ред('червено', 'app.js идва с грешен тип', тип(jsR), 'с nosniff браузърът НЕ изпълнява скрипт с друг тип — празно приложение без нито една грешка пред майката');
  else if (/charset=/i.test(тип(jsR)) && !/charset=utf-8/i.test(тип(jsR))) ред('червено', 'скриптовете идват с ЧУЖДА кодировка', тип(jsR), 'кирилицата вътре в скриптовете става маймуница');
  else ред('зелено', 'скриптовете са JavaScript' + (/charset=utf-8/i.test(тип(jsR)) ? ' в UTF-8' : ' (кодировката се наследява от страницата — UTF-8)'), тип(jsR));
  const cssR = await заявка(база.href + css);
  if (/text\/css/i.test(тип(cssR))) ред('зелено', 'стиловете са text/css', тип(cssR));
  else ред('червено', 'style.css идва с грешен тип', тип(cssR), 'с nosniff браузърът НЕ прилага стил с друг тип — голо приложение без оформление');
  const ман = await заявка(база.href + 'manifest.webmanifest');
  if (/manifest\+json|application\/json/i.test(тип(ман))) ред('зелено', 'манифестът е JSON', тип(ман));
  else ред('жълто', 'манифестът е с друг тип', тип(ман), 'Chrome го чете и така, но спецификацията иска JSON тип — нужен е AddType в .htaccess');

  // ── 3 · компресията ──
  console.log('');
  console.log('  ── 3 · компресията (на LiteSpeed идва от сървъра, не от .htaccess) ──');
  const kbR = await заявка(база.href + kb, { заглавки: КОМПРЕСИЯ });
  const енк = r => (r.з && r.з['content-encoding']) || '';
  if (/gzip|br/i.test(енк(kbR))) ред('зелено', 'kb.js пътува сгъстен: ' + кб(kbR.байта) + ' (' + енк(kbR) + ')', null);
  else ред('червено', 'kb.js пътува СУРОВ: ' + кб(kbR.байта), 'Content-Encoding: ' + (енк(kbR) || 'няма'), 'първото отваряне тежи ~10 МБ вместо ~2.7 МБ. На LiteSpeed това се пуска от сървъра — пиши на поддръжката на Джъмп да включат gzip/brotli за application/javascript и application/json');
  if (!/javascript/i.test(тип(kbR))) ред('червено', 'kb.js идва с грешен тип', тип(kbR), 'без базата знания чатът мълчи');
  const libR = await заявка(база.href + 'lib/index.json', { заглавки: КОМПРЕСИЯ });
  if (libR.статус !== 200) ред('червено', 'lib/index.json → ' + (libR.грешка || 'статус ' + libR.статус), null, 'без него библиотеката е празна');
  else if (/gzip|br/i.test(енк(libR))) ред('зелено', 'библиотеката (JSON) пътува сгъстена: ' + кб(libR.байта) + ' (' + енк(libR) + ')');
  else ред('жълто', 'библиотеката (JSON) пътува сурова: ' + кб(libR.байта), 'Content-Type: ' + тип(libR), 'поискай от поддръжката application/json в списъка за компресия');

  // ── 4 · кешът на статичните файлове ──
  console.log('');
  console.log('  ── 4 · бърз старт (дълъг кеш — безопасен, защото адресите носят ?v=) ──');
  if ((maxAge(cc(jsR)) || 0) >= 604800) ред('зелено', 'скриптовете се пазят седмица', cc(jsR));
  else ред('жълто', 'скриптовете се пазят по-кратко от седмица', cc(jsR), 'не чупи нищо, само по-бавен старт при слаб сигнал');
  const шр = await заявка(база.href + шрифт);
  if ((maxAge(cc(шр)) || 0) >= 31536000) ред('зелено', 'шрифтовете се пазят година', cc(шр));
  else ред('жълто', 'шрифтовете се пазят по-кратко от година', cc(шр), 'не чупи нищо');

  // ── 5 · защитните заглавки ──
  console.log('');
  console.log('  ── 5 · защитните заглавки ──');
  for (const [име, очаквай] of [['x-content-type-options', /nosniff/i], ['referrer-policy', /./], ['x-frame-options', /./]]) {
    const с = инд.з[име];
    if (с && очаквай.test(с)) ред('зелено', име + ': ' + с);
    else ред('жълто', 'липсва ' + име, null, 'същото пази Netlify чрез _headers');
  }
  if (/nosniff/i.test((jsR.з && jsR.з['x-content-type-options']) || '')) ред('зелено', 'nosniff важи и за скриптовете в js/');
  else ред('жълто', 'скриптовете в js/ са без nosniff', null, 'на LiteSpeed не е ясно дали .htaccess в подпапка наследява заглавките от корена — затова js/.htaccess го слага сам');
  if (инд.з['strict-transport-security']) ред('жълто', 'има HSTS: ' + инд.з['strict-transport-security'], null, 'еднопосочна врата: ако сертификатът някога не се поднови, телефонът отказва сайта без изход');

  // ── 6 · капаните ──
  console.log('');
  console.log('  ── 6 · капаните ──');
  const липсващ = await заявка(база.href + 'js/__nyama_takav_fail_bl__.js');
  if (липсващ.статус === 404) ред('зелено', 'липсващ файл дава 404');
  else if (липсващ.статус === 200) ред('червено', 'липсващ файл дава 200', тип(липсващ), 'значи има „всичко → index.html": липсващ скрипт идва като страница и service worker-ът го запомня като скрипт');
  else ред('жълто', 'липсващ файл дава ' + (липсващ.грешка || липсващ.статус));
  const хт = await заявка(база.href + '.htaccess');
  if (хт.статус === 403 || хт.статус === 404) ред('зелено', '.htaccess не се чете отвън (' + хт.статус + ')');
  else if (хт.статус === 200) ред('червено', '.htaccess се чете отвън', null, 'всеки вижда настройките на сървъра');
  else ред('жълто', '.htaccess дава ' + (хт.грешка || хт.статус));
  const хд = await заявка(база.href + '_headers');
  if (хд.статус === 200) ред('жълто', '_headers е качен', null, 'файл на Netlify, тук не прави нищо — изтрий го от public_html');
  else ред('зелено', 'няма излишен _headers (' + (хд.грешка || хд.статус) + ')');

  // ── 7 · един адрес, само https ──
  console.log('');
  console.log('  ── 7 · един адрес, само https ──');
  const httpR = await заявка('http://' + ХОСТ + база.pathname);
  if (httpR.грешка) ред('жълто', 'http:// не отговаря (' + httpR.грешка + ')', null, 'майка, която напише адреса без https, няма да стигне');
  else if (пренасочва(httpR) && /^https:\/\//i.test(httpR.з.location || '')) ред('зелено', 'http:// → ' + httpR.з.location + ' (' + httpR.статус + ')');
  else ред('червено', 'http:// отваря сайта без https (' + httpR.статус + ')', null, 'по http:// няма service worker (няма офлайн), а ключалката на дневника не работи');
  const wk = await заявка('http://' + ХОСТ + '/.well-known/acme-challenge/bl-proba');
  if (wk.грешка) ред('жълто', '.well-known по http не отговаря (' + wk.грешка + ')');
  else if (пренасочва(wk)) ред('жълто', '.well-known по http се пренасочва → ' + (wk.з.location || ''), null, 'Let\'s Encrypt следва пренасочвания, но не всяка проверка на cPanel — ако сертификатът не се поднови на 90-ия ден, търси тук');
  else ред('зелено', '.well-known стига по http без пренасочване (' + wk.статус + ') — AutoSSL ще поднови сертификата');
  if (!/^www\./i.test(ХОСТ)) {
    const www = await заявка('https://www.' + ХОСТ + база.pathname);
    if (www.грешка) ред('жълто', 'www.' + ХОСТ + ' не отговаря (' + www.грешка + ')', null, 'ако някой напише www, няма да стигне — но и няма да се раздели на две');
    else if (пренасочва(www) && (www.з.location || '').indexOf('://' + ХОСТ) >= 0) ред('зелено', 'www → ' + www.з.location + ' (' + www.статус + ')');
    else ред('червено', 'www.' + ХОСТ + ' отваря приложението отделно (' + www.статус + ')', null, 'www и без-www са две различни кутии с данни — майка, която ги смеси, вижда празно приложение');
  }

  console.log('');
  console.log('  ✅ ' + брой.зелено + ' · 🟡 ' + брой.жълто + ' · 🔴 ' + брой.червено);
  if (брой.червено) console.log('  🔴 ИМА ЧЕРВЕНО — виж „защо е важно" горе.');
  else console.log('  ✅ нито едно червено' + (брой.жълто ? ' (жълтите не чупят нищо, само са под нивото на Netlify)' : ''));
  console.log('');
  process.exit(брой.червено ? 1 : 0);
})();
