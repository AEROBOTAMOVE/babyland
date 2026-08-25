// ═══════════════════════════════════════════════════════════
// ☎️  dev/telefoni.js — ИЗВАЖДА ВСЕКИ ТЕЛЕФОН, ИНСТИТУЦИЯ И АДРЕС
// Пуска се: node dev/telefoni.js  [--vsichki]
// По подразбиране гледа само ЖИВИТЕ файлове (без .PREDI_*/.BAK_*/
// .ARCHIVE/ .pyc / шрифтове / картинки). С --vsichki гледа всичко.
//
// 🪤 Урок от одитите: „0 находки" без брой ПРЕГЛЕДАНИ значи „0 прегледани".
//    Затова този уред ВИНАГИ печата колко файла е отворил, колко байта е
//    прочел и колко е ПРОПУСНАЛ и защо.
// ═══════════════════════════════════════════════════════════
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VSICHKI = process.argv.includes('--vsichki');

const BIN = /\.(woff2?|ttf|otf|eot|png|jpe?g|gif|webp|ico|mp3|mp4|wav|zip|pyc)$/i;
const ARHIV = /(\.PREDI_|\.BAK_|\.ARCHIVE\.|\.ARCHIVE$|\.S_DEFER|__pycache__)/;

// ── шаблоните ──────────────────────────────────────────────
// 1) кратки спешни: 112, 116 111, 116 006, 150, 166…
// 2) 0700/0800 линии
// 3) градски 02 …, 0888…, +359…
const TEL = [
  { id: 'кратък-спешен', re: /(?<![\d.])(11[026]\s?\d{3}|1(?:12|16|50|60|65|66)|0[89]\d{2})(?![\d.])/g },
  { id: '0700/0800', re: /0[78]00[\s-]?\d{2}[\s-]?\d{3}/g },
  { id: 'нац./моб./градски', re: /(?:\+359|00359|\b0)\s?\(?\d{1,3}\)?[\s-]?\d{2,4}[\s-]?\d{2,4}(?:[\s-]?\d{2,4})?/g },
  { id: 'tel:-връзка', re: /tel:\s*\+?[\d\s()-]{3,}/gi }
];
const URL_RE = /https?:\/\/[^\s"'`<>)\\\]]+/g;
// думите, които издават институция/линия дори без номер до тях
const DUMI = /(линия|център|центъра|центърът|телефон|обади се|обади ѝ|позвъни|потърси|спешн|Пирогов|токсиколог|УМБАЛ|болниц|поликлиник|НЗОК|РЗИ|АСП|дирекция|агенция|фондация|психолог|полиц|кризисен|приемна|горещ)/gi;

const nahodki = [];
const dumi_redove = [];
let files = 0, skipped_bin = 0, skipped_arh = 0, bytes = 0;
const spisak = [];

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === '.git' || e.name === 'node_modules') continue;
      walk(p);
      continue;
    }
    if (BIN.test(e.name)) { skipped_bin++; continue; }
    if (!VSICHKI && ARHIV.test(p)) { skipped_arh++; continue; }
    let txt;
    try { txt = fs.readFileSync(p, 'utf8'); } catch (err) { skipped_bin++; continue; }
    files++; bytes += txt.length;
    spisak.push(path.relative(ROOT, p).replace(/\\/g, '/'));
    const rel = path.relative(ROOT, p).replace(/\\/g, '/');
    const redove = txt.split(/\r?\n/);
    redove.forEach((red, i) => {
      for (const { id, re } of TEL) {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(red))) {
          nahodki.push({ file: rel, line: i + 1, vid: id, hit: m[0].trim(), ctx: red.trim().slice(0, 220) });
        }
      }
      URL_RE.lastIndex = 0;
      let u;
      while ((u = URL_RE.exec(red))) {
        nahodki.push({ file: rel, line: i + 1, vid: 'адрес', hit: u[0], ctx: red.trim().slice(0, 160) });
      }
      DUMI.lastIndex = 0;
      if (DUMI.test(red)) dumi_redove.push({ file: rel, line: i + 1, ctx: red.trim().slice(0, 200) });
    });
  }
}

walk(ROOT);

const out = process.argv.includes('--json');
if (out) {
  console.log(JSON.stringify({ files, bytes, skipped_bin, skipped_arh, nahodki, dumi: dumi_redove.length }, null, 1));
} else {
  console.log('═══ ПРЕГЛЕДАНИ ═══');
  console.log('  файлове отворени и прочетени : ' + files);
  console.log('  байтове прочетени            : ' + bytes);
  console.log('  пропуснати (двоични/шрифт)   : ' + skipped_bin);
  console.log('  пропуснати (архив/.PREDI_)   : ' + skipped_arh + (VSICHKI ? ' (--vsichki: 0 по избор)' : ''));
  console.log('');
  const po_vid = {};
  nahodki.forEach(n => { (po_vid[n.vid] = po_vid[n.vid] || []).push(n); });
  console.log('═══ НАХОДКИ: ' + nahodki.length + ' ═══');
  Object.keys(po_vid).sort().forEach(v => {
    console.log('\n──── ' + v + ' (' + po_vid[v].length + ') ────');
    const uniq = {};
    po_vid[v].forEach(n => { (uniq[n.hit] = uniq[n.hit] || []).push(n); });
    Object.keys(uniq).sort().forEach(h => {
      console.log('  ' + h + '   ×' + uniq[h].length);
      uniq[h].slice(0, 6).forEach(n => console.log('      ' + n.file + ':' + n.line + '  | ' + n.ctx));
      if (uniq[h].length > 6) console.log('      … още ' + (uniq[h].length - 6));
    });
  });
  console.log('\n═══ РЕДОВЕ С ДУМИ „линия/център/телефон/обади се…" : ' + dumi_redove.length + ' ═══');
}
