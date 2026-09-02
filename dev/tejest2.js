// dev/tejest2.js — разделя ТЕГЛЕНОТО на два потока, защото майката ги усеща различно:
//   А) КРИТИЧЕН ПЪТ — това, което браузърът трябва да свали ПРЕДИ да види екран
//      (index.html + <link rel=stylesheet> + preload шрифтове + всички defer <script>)
//   Б) ФОН — това, което service worker-ът дърпа СЛЕД load (lib/*.json, останалите
//      шрифтове, иконите). Не бави първия екран, но яде мобилни мегабайти.
// Пускане: node dev/tejest2.js

const fs = require('fs'), path = require('path'), zlib = require('zlib');
const КОРЕН = path.resolve(__dirname, '..');
const Р = p => path.join(КОРЕН, p);
const kb = b => (b / 1024).toFixed(1);
const има = p => { try { return fs.statSync(Р(p)).size; } catch (e) { return null; } };
const gz = p => { try { return zlib.gzipSync(fs.readFileSync(Р(p)), { level: 9 }).length; } catch (e) { return 0; } };

const html = fs.readFileSync(Р('index.html'), 'utf8');

// ── А. Критичен път ────────────────────────────────────────────────────────
const css = [...html.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi)].map(m => m[1].split('?')[0]);
const css2 = [...html.matchAll(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']stylesheet["']/gi)].map(m => m[1].split('?')[0]);
const preload = [...html.matchAll(/<link[^>]+rel=["']preload["'][^>]+href=["']([^"']+)["']/gi)].map(m => m[1].split('?')[0]);
const скриптове = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map(m => m[1].split('?')[0]);
const иконLink = [...html.matchAll(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+)["']/gi)].map(m => m[1].split('?')[0]);

const крит = [...new Set(['index.html', ...css, ...css2, ...preload, ...скриптове, ...иконLink])].filter(има);

// ── Б. Фон = SW ASSETS минус критичния път ─────────────────────────────────
const sw = fs.readFileSync(Р('sw.js'), 'utf8');
const i0 = sw.indexOf('const ASSETS');
const блок = sw.slice(i0, sw.indexOf('];', i0));
const SWсписък = [...блок.matchAll(/'([^']+)'/g)].map(x => x[1]).filter(x => x !== '.');
const фон = SWсписък.filter(u => !крит.includes(u) && има(u) !== null);

function отчет(име, списък) {
  let с = 0, g = 0;
  const ред = списък.map(u => { const b = има(u), q = gz(u); с += b; g += q; return { u, b, q }; });
  ред.sort((a, x) => x.b - a.b);
  console.log(`\n═══ ${име} ═══`);
  console.log(`  ${списък.length} файла · СУРОВО ${kb(с)} KB · GZIP ${kb(g)} KB`);
  return { ред, с, г: g };
}

const A = отчет('А. КРИТИЧЕН ПЪТ (преди първия екран)', крит);
console.log('  разбивка:');
const поПапка = {};
A.ред.forEach(r => { const p = r.u.includes('/') ? r.u.split('/')[0] : '(корен)'; poAdd(p, r); });
function poAdd(p, r) { poПапка(p).b += r.b; poПапка(p).q += r.q; poПапка(p).n++; }
function poПапка(p) { return поПапка[p] = поПапка[p] || { b: 0, q: 0, n: 0 }; }
Object.entries(поПапка).sort((a, b) => b[1].b - a[1].b).forEach(([p, v]) =>
  console.log(`    ${p.padEnd(10)} ${String(v.n).padStart(4)} файла  ${kb(v.b).padStart(9)} KB сурово  ${kb(v.q).padStart(8)} KB gzip`));

const Б = отчет('Б. ФОН (service worker след load)', фон);
Б.ред.slice(0, 20).forEach(r => console.log(`    ${r.u.padEnd(40)} ${kb(r.b).padStart(8)} KB (gz ${kb(r.q).padStart(7)})`));

console.log(`\n═══ ОБЩО ПРИ ПЪРВО ПОСЕЩЕНИЕ ═══`);
console.log(`  СУРОВО ${kb(A.с + Б.с)} KB  ·  GZIP ${kb(A.г + Б.г)} KB`);
console.log(`  от тях преди първия екран: ${kb(A.г)} KB gzip (${(100 * A.г / (A.г + Б.г)).toFixed(0)}%)`);

// ── В. МЪРТЪВ КОД: .js на диска, който index.html НЕ сочи ───────────────────
const живиJS = fs.readdirSync(Р('js')).filter(f => /\.js$/.test(f) && !/PREDI|BAK|ARCHIVE/.test(f));
const сочени = new Set(скриптове.map(s => s.replace(/^js\//, '')));
const несочени = живиJS.filter(f => !сочени.has(f));
console.log('\n═══ В. js/*.js НА ДИСКА, КОИТО index.html НЕ СОЧИ ═══');
несочени.forEach(f => console.log(`  js/${f.padEnd(30)} ${kb(има('js/' + f)).padStart(8)} KB   ${SWсписък.includes('js/' + f) ? '⚠ но SW ГО КЕШИРА' : ''}`));
console.log(`  (${несочени.length} броя, ${kb(несочени.reduce((s, f) => s + има('js/' + f), 0))} KB)`);

// ── Г. CSS на диска, които HTML не сочи ────────────────────────────────────
const живиCSS = fs.readdirSync(Р('css')).filter(f => /\.css$/.test(f) && !/PREDI|BAK|ARCHIVE/.test(f));
const сочениCSS = new Set([...css, ...css2].map(s => s.replace(/^css\//, '')));
console.log('\n═══ Г. css/*.css НА ДИСКА, КОИТО HTML НЕ СОЧИ ═══');
живиCSS.filter(f => !сочениCSS.has(f)).forEach(f => console.log(`  css/${f.padEnd(28)} ${kb(има('css/' + f)).padStart(8)} KB`));

// ── Д. Шрифтове: кои @font-face има css/fonts.css и кои файлове има ────────
console.log('\n═══ Д. ШРИФТОВЕ ═══');
const fcss = fs.readFileSync(Р('css/fonts.css'), 'utf8');
const срcss = new Set([...fcss.matchAll(/url\(["']?([^"')]+)["']?\)/gi)].map(m => m[1].replace(/^\.\.\//, '').split('?')[0]));
const файлове = fs.readdirSync(Р('fonts')).filter(f => /\.woff2$/.test(f)).map(f => 'fonts/' + f);
let общШр = 0; файлове.forEach(f => общШр += има(f));
console.log(`  файлове на диска: ${файлове.length} · ${kb(общШр)} KB`);
файлове.forEach(f => console.log(`    ${f.padEnd(40)} ${kb(има(f)).padStart(7)} KB  ${срcss.has(f) ? '' : '⚠ НЕ се сочи от css/fonts.css'}`));
console.log('  @font-face в css/fonts.css сочат:', [...срcss].length, 'адреса');
[...срcss].filter(u => има(u) === null).forEach(u => console.log(`    ❌ ${u} — СОЧИ СЕ, НО ЛИПСВА`));

// ── Е. Кои семейства/тегла реално се ползват в CSS ────────────────────────
const всичкоCSS = живиCSS.map(f => fs.readFileSync(Р('css/' + f), 'utf8')).join('\n') + '\n' + html;
console.log('\n  употреба на семейства в css/*.css + index.html:');
for (const сем of ['Nunito', 'Comfortaa', 'Pacifico']) {
  const бр = (всичкоCSS.match(new RegExp(сем, 'gi')) || []).length;
  console.log(`    ${сем.padEnd(12)} ${бр} споменавания`);
}
console.log('  тегла (font-weight) срещани в css:');
const тегла = {};
[...всичкоCSS.matchAll(/font-weight\s*:\s*(\d{3}|bold|normal)/gi)].forEach(m => {
  let t = m[1].toLowerCase(); if (t === 'bold') t = '700'; if (t === 'normal') t = '400';
  тегла[t] = (тегла[t] || 0) + 1;
});
console.log('   ', JSON.stringify(тегла));
