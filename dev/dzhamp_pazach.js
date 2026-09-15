// ═══════════════════════════════════════════════════════════════════════
// 🛡️ ПАЗАЧЪТ НА ДЖЪМП — .htaccess пази ли същото, което пази Netlify?
//
// ЗАЩО (15.09.2026): Джъмп.бг работи с LiteSpeed. _headers и _redirects там
//   са мъртви файлове; правилата живеят в .htaccess, който build.js --dzhamp
//   генерира. Два списъка с едни и същи правила се разминават тихо — някой
//   сменя кеша на /fonts/* в _headers и забравя другия. Пазачът ги сверява
//   при всяко пускане и пази капаните, които одитът от 15.09 намери:
//     · env= / SetEnvIf — на LiteSpeed стойността не винаги стига; тогава
//                         sw.js може да получи кеша на целия сайт
//     · „всичко → index.html" — липсващ .js идва като HTML 200, а service
//                         worker-ът го запомня като скрипт
//     · .well-known след пренасочването — сертификатът умира на 90-ия ден
//     · 301 — браузърът го помни завинаги, няма път назад
//     · HSTS — еднопосочна врата
//     · Options / DirectoryIndex / <If> — зависят от AllowOverride → 500
//     · Header / Rewrite / AddType извън своя <IfModule> → 500 на Apache
//   И ИЗПЪЛНЯВА всеки регулярен израз от ГОТОВИЯ файл срещу вход с известен
//   отговор: изядена по пътя обратна черта дава валиден, но сляп израз.
//
// ⚠️ САМОПРОВЕРКА: преди истинската проверка пазачът чупи копие по дванайсет
//   начина и трябва да хване всеки. Пазач, който не е палил, е неизмерен.
//
// ПУСКАНЕ: node dev/dzhamp_pazach.js    (1 при находка · 2 ако е сляп)
// ПЪТ НАЗАД: само ЧЕТЕ.
// ═══════════════════════════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');
process.chdir(path.resolve(__dirname, '..'));
const б = require(path.resolve('build.js'));

// ── правилата на Netlify: _headers (от build.js) + [[headers]] в netlify.toml ──
function netlifyПравила() {
  const правила = [];
  for (const блок of б.HEADERS.split(/\n\s*\n/)) {
    const редове = блок.split('\n').filter(x => x.trim());
    if (!редове.length) continue;
    const път = редове[0].trim();
    for (const р of редове.slice(1)) {
      const i = р.indexOf(':');
      if (i > 0) правила.push({ път, име: р.slice(0, i).trim(), стойност: р.slice(i + 1).trim() });
    }
  }
  const toml = fs.readFileSync('netlify.toml', 'utf8');
  const Р = /for\s*=\s*"([^"]+)"[\s\S]*?Cache-Control\s*=\s*"([^"]+)"/g;
  let m;
  while ((m = Р.exec(toml))) правила.push({ път: m[1], име: 'Cache-Control', стойност: m[2] });
  return правила;
}

const безКоментари = текст => текст.split('\n').filter(x => !/^\s*#/.test(x)).map(x => x.trim());

function блокове(текст) {
  const изход = [];
  let тек = null;
  for (const t of безКоментари(текст)) {
    let m;
    if ((m = /^<(Files|FilesMatch)\s+"([^"]+)">$/.exec(t))) { тек = { вид: m[1], арг: m[2], редове: [] }; изход.push(тек); continue; }
    if (/^<\/(Files|FilesMatch)>$/.test(t)) { тек = null; continue; }
    if (тек) тек.редове.push(t);
  }
  return изход;
}
function извънБлокове(текст) {
  const изход = []; let вътре = false;
  for (const t of безКоментари(текст)) {
    if (/^<(Files|FilesMatch)\s/.test(t)) { вътре = true; continue; }
    if (/^<\/(Files|FilesMatch)>/.test(t)) { вътре = false; continue; }
    if (!вътре) изход.push(t);
  }
  return изход;
}
function headerSet(редове, име) {
  for (const р of редове) {
    const m = /^Header\s+set\s+(\S+)\s+"([^"]*)"$/.exec(р.trim());
    if (m && m[1].toLowerCase() === име.toLowerCase()) return m[2];
  }
  return null;
}
function рег(шаблон, флагове) { try { return new RegExp(шаблон, флагове); } catch (e) { return null; } }

function провери(ф) {
  const п = [];
  const корен = ф['.htaccess'];
  if (typeof корен !== 'string' || !корен.trim()) return ['няма коренов .htaccess'];

  // 1 · забранените директиви и модулите без обвивка
  for (const [име, текст] of Object.entries(ф)) {
    const редове = безКоментари(текст);
    const жив = редове.join('\n');
    if (/env=/i.test(жив)) п.push(име + ': Header … env= (на LiteSpeed стойността не винаги стига)');
    if (/^SetEnvIf/im.test(жив)) п.push(име + ': SetEnvIf');
    if (/^<If[\s>]/im.test(жив)) п.push(име + ': <If> (LiteSpeed не го обещава)');
    if (/^Options\s/im.test(жив)) п.push(име + ': Options (зависи от AllowOverride → 500)');
    if (/^DirectoryIndex\s/im.test(жив)) п.push(име + ': DirectoryIndex (зависи от AllowOverride → 500)');
    if (/Strict-Transport-Security/i.test(жив)) п.push(име + ': HSTS — еднопосочна врата');
    if (/R=301/.test(жив)) п.push(име + ': R=301 — браузърът го помни завинаги');
    const стек = [];
    for (const t of редове) {
      let m;
      if ((m = /^<IfModule\s+([^>]+)>$/.exec(t))) { стек.push(m[1].trim()); continue; }
      if (/^<\/IfModule>$/.test(t)) { стек.pop(); continue; }
      if (/^Header\s/.test(t) && стек.indexOf('mod_headers.c') < 0) п.push(име + ': Header извън <IfModule mod_headers.c>');
      if (/^Rewrite/.test(t) && стек.indexOf('mod_rewrite.c') < 0) п.push(име + ': Rewrite извън <IfModule mod_rewrite.c>');
      if (/^(AddType|AddCharset)\s/.test(t) && стек.indexOf('mod_mime.c') < 0) п.push(име + ': ' + t.split(' ')[0] + ' извън <IfModule mod_mime.c>');
    }
  }

  // 2 · пренасочванията — изпълнени срещу адреси с известен отговор
  const редове = безКоментари(корен);
  const RW = [];
  редове.forEach((t, i) => {
    const m = /^RewriteRule\s+(\S+)\s+(\S+)(?:\s+\[([^\]]*)\])?/.exec(t);
    if (m) RW.push({ i, шаблон: m[1], цел: m[2], флагове: m[3] || '' });
  });
  for (const r of RW) if (/index\.html/.test(r.цел) && r.шаблон !== '^$') п.push('„' + r.шаблон + ' → ' + r.цел + '" — липсващ файл ще дойде като HTML 200');
  const wk = RW.find(r => r.шаблон.indexOf('well-known') >= 0);
  const първоR = RW.find(r => /(^|,)R(=|,|$)/.test(r.флагове));
  if (!wk) п.push('няма изключение за .well-known — AutoSSL няма да поднови сертификата');
  else {
    if (първоR && wk.i > първоR.i) п.push('.well-known е СЛЕД пренасочването — не върши работа');
    const re = рег(wk.шаблон);
    if (!re || !re.test('.well-known/acme-challenge/abc') || re.test('Xwell-known/acme') || re.test('js/app.js'))
      п.push('шаблонът за .well-known е счупен („' + wk.шаблон + '") — изядена обратна черта?');
  }
  if (!RW.some(r => r.цел.indexOf('https://%{HTTP_HOST}') === 0)) п.push('няма пренасочване към https — без него няма service worker и ключалка на дневника');
  if (!RW.some(r => r.цел.indexOf('%1') >= 0)) п.push('няма пренасочване www → без-www — две кутии с данни');
  const wwwУсл = редове.map(t => /^RewriteCond\s+%\{HTTP_HOST\}\s+(\S+)/.exec(t)).filter(Boolean)[0];
  if (wwwУсл) {
    const re = рег(wwwУсл[1], 'i');
    const m = re && re.exec('www.babyland.bg');
    if (!m || m[1] !== 'babyland.bg' || re.test('wwwXbabyland.bg')) п.push('условието за www е счупено („' + wwwУсл[1] + '")');
  }

  // 3 · паритет с Netlify, правило по правило
  const бл = блокове(корен);
  const горе = извънБлокове(корен);
  const правила = netlifyПравила();
  if (правила.length < 10) п.push('намерих само ' + правила.length + ' правила в Netlify — пазачът е сляп за паритета');
  for (const пр of правила) {
    if (пр.име === 'Content-Type') {
      const разш = пр.път.split('.').pop();
      if (!горе.some(t => t === 'AddType ' + пр.стойност + ' .' + разш)) п.push(пр.път + ': няма „AddType ' + пр.стойност + ' .' + разш + '"');
      continue;
    }
    if (пр.път === '/*') {
      const ст = headerSet(горе, пр.име);
      if (ст !== пр.стойност) п.push('/* ' + пр.име + ': Netlify „' + пр.стойност + '", Джъмп „' + ст + '"');
      continue;
    }
    const папка = /^\/([a-z0-9_-]+)\/\*$/i.exec(пр.път);
    if (папка) {
      const ф2 = ф[папка[1] + '/.htaccess'];
      const ст = ф2 ? headerSet(безКоментари(ф2), пр.име) : null;
      if (ст !== пр.стойност) п.push(пр.път + ' ' + пр.име + ': Netlify „' + пр.стойност + '", Джъмп „' + ст + '"');
      continue;
    }
    const файл = пр.път.replace(/^\//, '');
    const хващат = бл.filter(b => b.вид === 'Files' ? b.арг === файл : !!(рег(b.арг) && рег(b.арг).test(файл)));
    const ст = хващат.map(b => headerSet(b.редове, пр.име)).filter(x => x !== null);
    if (ст.length !== 1 || ст[0] !== пр.стойност) п.push(пр.път + ' ' + пр.име + ': Netlify „' + пр.стойност + '", Джъмп ' + JSON.stringify(ст));
  }
  const папкиNetlify = new Set(правила.map(x => (/^\/([a-z0-9_-]+)\/\*$/i.exec(x.път) || [])[1]).filter(Boolean));
  for (const име of Object.keys(ф)) {
    if (име === '.htaccess') continue;
    if (!папкиNetlify.has(име.split('/')[0])) п.push(име + ' няма свое правило в Netlify — двата пакета вече се разминават');
  }
  for (const b of бл.filter(b => b.вид === 'FilesMatch')) {
    const re = рег(b.арг);
    for (const чуждо of ['indexXhtml', 'index.html.bak', 'sw.js', 'app.js', 'manifestXwebmanifest'])
      if (!re || re.test(чуждо)) п.push('<FilesMatch "' + b.арг + '"> хваща и „' + чуждо + '"');
  }
  return п;
}

// ── САМОПРОВЕРКА ──
function счупи(ф, име, от, до) {
  if (!ф[име] || ф[име].indexOf(от) < 0) return null;
  const к = Object.assign({}, ф);
  к[име] = к[име].replace(от, до);
  return к;
}
const СЧУПЕНИ = [
  ['env= условие', ф => счупи(ф, '.htaccess', '<Files "sw.js">', '<Files "sw.js">\n    Header set X-Proba "1" env=BL')],
  ['„всичко → index.html"', ф => счупи(ф, '.htaccess', 'RewriteRule ^$ index.html [L]', 'RewriteRule ^ index.html [L]')],
  ['изядена черта в .well-known', ф => счупи(ф, '.htaccess', '^\\.well-known/', '^.well-known/')],
  ['изядена черта в www', ф => счупи(ф, '.htaccess', '^www\\.(.+)$', '^www.(.+)$')],
  ['изядена черта във FilesMatch', ф => счупи(ф, '.htaccess', 'index\\.html|', 'index.html|')],
  ['301 вместо 302', ф => счупи(ф, '.htaccess', '[R=302,L]', '[R=301,L]')],
  ['HSTS', ф => счупи(ф, '.htaccess', '  Header set X-Frame-Options', '  Header set Strict-Transport-Security "max-age=31536000"\n  Header set X-Frame-Options')],
  ['Header извън <IfModule>', ф => счупи(ф, '.htaccess', 'AddDefaultCharset UTF-8', 'AddDefaultCharset UTF-8\nHeader set X-Proba "1"')],
  ['Options', ф => счупи(ф, '.htaccess', 'AddDefaultCharset UTF-8', 'Options -Indexes\nAddDefaultCharset UTF-8')],
  ['грешен кеш за sw.js', ф => счупи(ф, '.htaccess', 'no-cache, no-store, must-revalidate', 'public, max-age=604800')],
  ['липсва годината за fonts/', ф => { if (!ф['fonts/.htaccess']) return null; const к = Object.assign({}, ф); delete к['fonts/.htaccess']; return к; }],
  ['.well-known след пренасочването', ф => {
    const р = ф['.htaccess'].split('\n');
    const i = р.findIndex(x => x.indexOf('RewriteRule ^\\.well-known/') >= 0);
    const j = р.findIndex(x => x.indexOf('https://%{HTTP_HOST}') >= 0);
    if (i < 0 || j < 0) return null;
    const [wk] = р.splice(i, 1);
    р.splice(j, 0, wk);
    return Object.assign({}, ф, { '.htaccess': р.join('\n') });
  }],
];

const истински = б.htaccessФайлове();
const слепи = [];
for (const [име, fn] of СЧУПЕНИ) {
  const к = fn(истински);
  if (!к) { слепи.push(име + ' (счупването не намери какво да чупи)'); continue; }
  if (!провери(к).length) слепи.push(име);
}
if (слепи.length) {
  console.log('🔴 ПАЗАЧЪТ Е СЛЯП за: ' + слепи.join(' · '));
  process.exit(2);
}
const находки = провери(истински);
if (находки.length) {
  console.log('🔴 ' + находки.length + ' находки в .htaccess за Джъмп:');
  for (const x of находки) console.log('   🔴 ' + x);
  process.exit(1);
}
console.log('✅ ЧИСТО — ' + Object.keys(истински).length + ' .htaccess файла пазят правилата на Netlify без капан (' +
  СЧУПЕНИ.length + '/' + СЧУПЕНИ.length + ' счупени копия хванати)');
