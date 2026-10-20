// 🚦 ОПАШКАТА — колко тежки процеса вървят наведнъж (20.10.2026)
// ЗАЩО: машината има 4 ядра, а агентите са десетина. Всеки пуска скрит Chrome за проба.
// Без опашка се бият: Chrome „не тръгна“, пробата чака 3 мин вместо 40 сек, мерките лъжат.
// Сега всяка проба взима СЛОТ (папка .sloti/<канал>-<n>, mkdir е атомарен) и чака, ако няма.
// Слотът се освобождава при изход; ако процесът е убит, следващият го вижда мъртъв и го взима.
//
// ПОЛЗВАНЕ в скрипт:  await require('./slot.js')('chrome');      — 3 слота (BL_SLOTI_CHROME)
//                     await require('./slot.js')('mozak');       — 2 слота (BL_SLOTI_MOZAK)
// ОТ КОМАНДНИЯ РЕД (за тежки node мерки):  node dev/proba/red.js mozak -- node dev/kade_otivat.js файл.json
// ПЪТ НАЗАД: махни реда с require('./slot.js') от пробите; изтрий dev/proba/.sloti.
const fs = require('fs');
const path = require('path');
const ПАПКА = path.join(__dirname, '.sloti');
// 20.10: ТИХ РЕЖИМ — докато другият чат работи на същата машина: по 1. След него → { chrome: 3, mozak: 2 }.
const ПО_ПОДРАЗБИРАНЕ = { chrome: 1, mozak: 1 };
const жив = pid => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; } };
module.exports = async function взимамСлот(канал = 'chrome', брой) {
  const n = Number(брой || process.env['BL_SLOTI_' + канал.toUpperCase()] || ПО_ПОДРАЗБИРАНЕ[канал] || 2);
  fs.mkdirSync(ПАПКА, { recursive: true });
  const начало = Date.now(); let казах = false;
  for (;;) {
    for (let i = 0; i < n; i++) {
      const с = path.join(ПАПКА, канал + '-' + i);
      try {
        fs.mkdirSync(с);
        fs.writeFileSync(path.join(с, 'pid'), String(process.pid));
        const освободи = () => { try { fs.rmSync(с, { recursive: true, force: true }); } catch (e) {} };
        process.on('exit', освободи);
        for (const сиг of ['SIGINT', 'SIGTERM', 'SIGBREAK']) { try { process.on(сиг, () => { освободи(); process.exit(130); }); } catch (e) {} }
        if (казах) console.log('🚦 слот ' + канал + '-' + i + ' след ' + Math.round((Date.now() - начало) / 1000) + ' с чакане');
        return освободи;
      } catch (e) {
        // зает — жив ли е собственикът? (pid файлът може още да се пише — тогава не пипаме)
        try {
          const pid = Number(fs.readFileSync(path.join(с, 'pid'), 'utf8'));
          const възраст = Date.now() - fs.statSync(с).mtimeMs;
          if ((pid && !жив(pid)) || възраст > 25 * 60e3) fs.rmSync(с, { recursive: true, force: true });
        } catch (e2) {}
      }
    }
    if (!казах) { console.log('🚦 опашка: всички ' + n + ' слота „' + канал + '“ са заети — чакам'); казах = true; }
    await new Promise(r => setTimeout(r, 1200 + Math.floor(Math.random() * 1500)));
  }
};
