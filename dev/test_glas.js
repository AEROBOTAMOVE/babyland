// ═══════════════════════════════════════════════════════════
// 🗣️ ГЛАСЪТ — изпитание на js/glas.js
//
// Собственикът чу мъжки глас и каза, че иска женски. Тук се проверява, че
// изборът наистина предпочита женски БЪЛГАРСКИ глас — и че НЕ прави
// по-лошото: да сложи женски ЧУЖД глас, който би изчел кирилицата
// неразбираемо.
//
// 🪤 Node няма речев синтез. Строи се мъничък свят с измислени гласове —
//   но с ИМЕНАТА, които наистина се срещат: „Microsoft Ivan" (Windows,
//   мъжки, измерен на живо), „Daria" (iOS, женски), „Microsoft Zira"
//   (женски, но АНГЛИЙСКИ).
//
// ПУСКАНЕ: node dev/test_glas.js
// ПЪТ НАЗАД: файлът само ЧЕТЕ проекта.
// ═══════════════════════════════════════════════════════════
const fs = require('fs');
const vm = require('vm');
const path = require('path');
process.chdir(path.resolve(__dirname, '..'));

function свят(гласове) {
  const казани = [];
  const ctx = {
    console: { log() {}, warn() {} }, JSON, Math, Date, RegExp, String, Number, Array, Object,
    setTimeout: f => { f(); return 0; },
    localStorage: { _: {}, getItem(k) { return this._[k] === undefined ? null : this._[k]; },
                    setItem(k, v) { this._[k] = String(v); }, removeItem(k) { delete this._[k]; } },
    SpeechSynthesisUtterance: function (т) { this.text = т; this.lang = ''; this.pitch = 1; this.rate = 1; this.voice = null; }
  };
  ctx.speechSynthesis = {
    getVoices: () => гласове,
    addEventListener() {},
    speak(u) { казани.push(u); },
    cancel() {}
  };
  ctx.document = { createElement: () => ({ style: {}, className: '', appendChild() {}, setAttribute() {},
                    addEventListener() {}, querySelector: () => null, get textContent() { return ''; }, set textContent(v) {},
                    set innerHTML(v) {}, get innerHTML() { return ''; }, options: [] }) };
  ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
  vm.createContext(ctx);
  new vm.Script(fs.readFileSync('js/glas.js', 'utf8')).runInContext(ctx);
  ctx.__казани = казани;
  return ctx;
}

const г = (име, език, местен) => ({ name: име, lang: език, localService: местен !== false, default: false });

let паднали = 0, общо = 0;
const пров = (т, у) => { общо++; if (!у) паднали++; console.log('     ' + (у ? '✅' : '🔴') + ' ' + т); };

console.log('🗣️ ГЛАСЪТ — женски, не мъжки\n');

// ── 1. има женски български → него ──
console.log('  ── когато на телефона ИМА женски български ──');
let w = свят([г('Microsoft Ivan - Bulgarian (Bulgaria)', 'bg-BG'), г('Daria', 'bg-BG'), г('Microsoft Zira - English', 'en-US')]);
пров('избира Daria, не Ivan', w.BL_GLAS.избран() && w.BL_GLAS.избран().име === 'Daria');
пров('и се брои за женски', w.BL_GLAS.женски() === true);

// ── 2. САМО мъжки български (Windows — измерено на живо) ──
console.log('\n  ── когато има САМО мъжки български (точно този случай е измерен) ──');
w = свят([г('Microsoft David - English (United States)', 'en-US'),
          г('Microsoft Ivan - Bulgarian (Bulgaria)', 'bg-BG'),
          г('Microsoft Zira - English (United States)', 'en-US')]);
пров('НЕ слага женската Zira (тя би изчела кирилицата по английски)',
  w.BL_GLAS.избран() && w.BL_GLAS.избран().име.indexOf('Zira') < 0);
пров('слага българския Ivan', w.BL_GLAS.избран().име.indexOf('Ivan') >= 0);
пров('и честно казва, че НЕ е женски', w.BL_GLAS.женски() === false);
let u = new w.SpeechSynthesisUtterance('Спи, детенце'); u.lang = 'bg-BG';
w.speechSynthesis.speak(u);
пров('вдига височината като смекчаване (' + u.pitch.toFixed(2) + ')', u.pitch > 1.3 && u.pitch <= 2);
пров('и слага гласа на изричането', u.voice && u.voice.name.indexOf('Ivan') >= 0);

// ── 3. НЯМА никакъв български ──
console.log('\n  ── когато няма НИТО ЕДИН български глас ──');
w = свят([г('Microsoft Zira - English (United States)', 'en-US')]);
пров('не избира нищо (по-добре мълчание от неразбираемо)', w.BL_GLAS.избран() === null);
u = new w.SpeechSynthesisUtterance('Спи, детенце');
w.speechSynthesis.speak(u);
пров('не слага чужд глас на българския текст', u.voice === null);

// ── 4. изборът на мама тежи повече от моята оценка ──
console.log('\n  ── когато мама сама си е избрала глас ──');
w = свят([г('Microsoft Ivan - Bulgarian (Bulgaria)', 'bg-BG'), г('Daria', 'bg-BG')]);
пров('по подразбиране е Daria', w.BL_GLAS.избран().име === 'Daria');
w.BL_GLAS.запази('Microsoft Ivan - Bulgarian (Bulgaria)');
пров('но нейният избор надделява', w.BL_GLAS.избран().име.indexOf('Ivan') >= 0);

// ── 5. чужд глас, избран изрично от викащия, не се пипа ──
console.log('\n  ── когато извикващият САМ си е сложил глас ──');
w = свят([г('Microsoft Ivan - Bulgarian (Bulgaria)', 'bg-BG'), г('Daria', 'bg-BG')]);
u = new w.SpeechSynthesisUtterance('нещо');
u.voice = г('Microsoft Zira - English', 'en-US');
w.speechSynthesis.speak(u);
пров('не му се пипа гласът', u.voice.name.indexOf('Zira') >= 0);

// ── 6. САМОПРОВЕРКА: може ли този тест да гръмне ──
console.log('\n  ── САМОПРОВЕРКА ──');
w = свят([г('Microsoft Ivan - Bulgarian (Bulgaria)', 'bg-BG')]);
пров('оценката различава български от чужд',
  w.BL_GLAS.оцени(г('x', 'bg-BG')) > 0 && w.BL_GLAS.оцени(г('x', 'en-US')) < 0);
пров('изразът за женски хваща Daria и НЕ хваща Ivan',
  w.BL_GLAS.ЖЕНСКИ.test('Daria') && !w.BL_GLAS.ЖЕНСКИ.test('Microsoft Ivan'));

console.log('\n  ПРОВЕРКИ: ' + общо + ' · ' + (паднали ? '🔴 ПАДНАЛИ: ' + паднали : '✅ всички минаха'));
console.log('\n  ⚖️ ИЗМЕРЕНО НА ЖИВО (Windows, 25.08): 4 гласа, само 1 български —');
console.log('  „Microsoft Ivan", мъжки. Женски български на Windows просто НЯМА.');
console.log('  На телефон (Android/iOS) българският глас обикновено Е женски.');
process.exit(паднали ? 1 : 0);
