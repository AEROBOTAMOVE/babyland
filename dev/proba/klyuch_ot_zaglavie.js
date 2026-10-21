// 🔑 21.10 · КЛЮЧ ОТ ЗАГЛАВИЕТО — за новите карти, които dev/dostizhimost.js не намира по темата им.
// Чете изхода на dostizhimost (файл), взима id-тата с даден префикс, и от заглавието прави 1–2 ключа
// така, както би го написала майка: малки букви, без препинателни, до 6 думи. Мярката е отделна:
// node dev/prilozhi_klyuchove.js <изход.json> — тя хвърля ключ, който не вади своята карта или мести чужд.
// ПУСКАНЕ (cwd = корена): node dev/proba/klyuch_ot_zaglavie.js <dostizhimost.txt> <префикс-регекс> <изход.json>
const fs = require('fs'); const path = require('path');
const [, , вход, префикс = '^zn', изход = 'dev/znanie/vlivane/kl_zaglavia.json'] = process.argv;
const W = require(path.resolve('dev/pyasachnik.js')).zaredi(null);
const карти = new Map(W.KB.entries.map(e => [e.id, e]));
const заети = new Set(); for (const e of W.KB.entries) for (const k of e.keys || []) заети.add(String(k).toLowerCase());
const re = new RegExp(префикс);
const ид = [...new Set((fs.readFileSync(вход, 'utf8').match(/^\s+([a-z0-9-]+)\s+„/gm) || []).map(л => л.trim().split(/\s+/)[0]))].filter(x => re.test(x) && карти.has(x));
const чисти = т => String(т).toLowerCase().replace(/[„“"'«»()\[\]?!.,:;…]/g, ' ').replace(/\s[—–-]\s/g, ' ').replace(/\s+/g, ' ').trim();
const до6 = т => т.split(' ').slice(0, 6).join(' ');
const резултат = {};
for (const id of ид) {
  const з = чисти(карти.get(id).title);
  const части = з.split(/\s(?:—|–)\s|,/).map(s => s.trim()).filter(Boolean);
  const кандидати = [до6(з), части[0] && части[0].split(' ').length >= 2 ? до6(части[0]) : null].filter(Boolean);
  const ключове = [...new Set(кандидати)].filter(к => к.split(' ').length >= 2 && !заети.has(к));
  if (ключове.length) резултат[id] = ключове;
}
fs.writeFileSync(изход, JSON.stringify(резултат, null, 1));
console.log('недостижими с префикса: ' + ид.length + ' · с ключове: ' + Object.keys(резултат).length + ' · ключове: ' + Object.values(резултат).flat().length + ' → ' + изход);
