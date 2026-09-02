// dev/tejest3.js — колко от кода са КОМЕНТАРИ и какво остава след gzip,
// плюс: какво наистина стига до сървъра (git ги качва, не папката).
// Пускане: node dev/tejest3.js
const fs = require('fs'), path = require('path'), zlib = require('zlib'), cp = require('child_process');
const КОРЕН = path.resolve(__dirname, '..');
const K = n => (n / 1024).toFixed(1) + 'K';

// маха // и /* */, като уважава низове, шаблони и регулярки
function бездок(t) {
  let изх = '', i = 0, кав = null;
  while (i < t.length) {
    const c = t[i], n = t[i + 1];
    if (кав) { изх += c; if (c === кав && t[i - 1] !== '\\') кав = null; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { кав = c; изх += c; i++; continue; }
    if (c === '/' && n === '/') { while (i < t.length && t[i] !== '\n') i++; continue; }
    if (c === '/' && n === '*') { i += 2; while (i < t.length && !(t[i] === '*' && t[i + 1] === '/')) i++; i += 2; continue; }
    if (c === '/' && /[=(,:&|!?[{;+]\s*$/.test(изх.slice(-4))) {          // регулярка
      let j = i + 1, кл = false, ок = false;
      for (; j < t.length && j < i + 400; j++) {
        if (t[j] === '\\') { j++; continue; }
        if (t[j] === '\n') break;
        if (t[j] === '[') кл = true; else if (t[j] === ']') кл = false;
        else if (t[j] === '/' && !кл) { ок = true; break; }
      }
      if (ок) { изх += t.slice(i, j + 1); i = j + 1; continue; }
    }
    изх += c; i++;
  }
  return изх;
}
const празни = s => s.split('\n').map(l => l.replace(/[ \t]+$/, '')).filter(l => l.trim()).join('\n');

function мери(папка, разш) {
  const f = fs.readdirSync(path.join(КОРЕН, папка)).filter(x => разш.test(x) && !/PREDI|\.BAK|ARCHIVE/.test(x));
  let сур = 0, без = 0, gС = 0, gБ = 0; const ред = [];
  for (const x of f) {
    const t = fs.readFileSync(path.join(КОРЕН, папка, x), 'utf8');
    const b = празни(бездок(t));
    const gc = zlib.gzipSync(Buffer.from(t), { level: 9 }).length;
    const gb = zlib.gzipSync(Buffer.from(b), { level: 9 }).length;
    сур += Buffer.byteLength(t); без += Buffer.byteLength(b); gС += gc; gБ += gb;
    ред.push({ x: папка + '/' + x, с: Buffer.byteLength(t), б: Buffer.byteLength(b), gc, gb });
  }
  return { сур, без, gС, gБ, ред };
}

for (const [п, р] of [['js', /\.js$/], ['css', /\.css$/]]) {
  const m = мери(п, р);
  console.log(`═══ ${п}/ ═══`);
  console.log(`  СУРОВО ${K(m.сур)} → без коментари/празни ${K(m.без)}  (−${K(m.сур - m.без)}, ${(100 * (m.сур - m.без) / m.сур).toFixed(0)}%)`);
  console.log(`  GZIP   ${K(m.gС)} → ${K(m.gБ)}  (−${K(m.gС - m.gБ)}, ${(100 * (m.gС - m.gБ) / m.gС).toFixed(0)}%)`);
  console.log('  най-много спестяват по мрежата:');
  m.ред.sort((a, b) => (b.gc - b.gb) - (a.gc - a.gb)).slice(0, 10)
    .forEach(r => console.log(`    ${r.x.padEnd(24)} gz ${K(r.gc).padStart(8)} → ${K(r.gb).padStart(8)}  спестява ${K(r.gc - r.gb)}`));
  console.log('');
}
// index.html
{
  const t = fs.readFileSync(path.join(КОРЕН, 'index.html'), 'utf8');
  const b = празни(t.replace(/<!--[\s\S]*?-->/g, ''));
  console.log('═══ index.html ═══');
  console.log(`  СУРОВО ${K(Buffer.byteLength(t))} → без HTML-коментари ${K(Buffer.byteLength(b))}`);
  console.log(`  GZIP   ${K(zlib.gzipSync(Buffer.from(t), { level: 9 }).length)} → ${K(zlib.gzipSync(Buffer.from(b), { level: 9 }).length)}`);
}

// ── какво наистина стига до сървъра: git решава, не папката ────────────────
console.log('\n═══ КАКВО КАЧВА GIT (origin = github → само проследени файлове) ═══');
try {
  const списък = cp.execSync('git ls-files', { cwd: КОРЕН, encoding: 'utf8' }).split('\n').filter(Boolean);
  let общо = 0; const по = {};
  const пропуснати = [];
  for (const f of списък) {
    let s; try { s = fs.statSync(path.join(КОРЕН, f)).size; } catch (e) { пропуснати.push(f); continue; }
    общо += s;
    const п = f.includes('/') ? f.split('/')[0] : '(корен)';
    по[п] = (по[п] || 0) + s;
  }
  console.log(`  проследени файлове: ${списък.length} · ${(общо / 1048576).toFixed(2)} MB`);
  Object.entries(по).sort((a, b) => b[1] - a[1]).forEach(([п, s]) => console.log(`    ${п.padEnd(12)} ${K(s).padStart(10)}`));
  const резервни = списък.filter(f => /PREDI|\.BAK|ARCHIVE/.test(f));
  console.log(`  резервни копия в индекса: ${резервни.length} ${резервни.length ? '⚠ ' + резервни.slice(0, 5).join(', ') : '(нула — не пътуват към майката)'}`);
  const девът = списък.filter(f => f.startsWith('dev/'));
  console.log(`  файлове от dev/ в индекса: ${девът.length} · ${K(девът.reduce((s, f) => { try { return s + fs.statSync(path.join(КОРЕН, f)).size; } catch (e) { return s; } }, 0))}`);
  const мд = списък.filter(f => /\.md$/.test(f));
  console.log(`  .md в индекса: ${мд.length} · ${K(мд.reduce((s, f) => { try { return s + fs.statSync(path.join(КОРЕН, f)).size; } catch (e) { return s; } }, 0))}  → ${мд.join(', ')}`);
} catch (e) { console.log('  git не отговори:', e.message.split('\n')[0]); }
