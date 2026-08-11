// ═══════════════════════════════════════════════════════════
// ROOMS 19 — ПОСЛЕДНИТЕ ДВЕ ОТ ЧАСТ 4 (план 19)
//
// 📅 4.5.10 Три години назад — сравнение „същия ден“
// 🔳 4.7.2  QR за бабината карта — баба не сваля приложения
//
// QR-ът се рисува РЪЧНО (без библиотека) — всичко тук е локално, без
// зависимости. Кодира кратък текст, не URL: няма сървър, няма къде да води.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const localDate = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const card = t => { const c = el('section', 'jr-card'); c.appendChild(el('h4', 'jr-title', t)); return c; };
  const sub = s => '<span class="jr-sub">' + s + '</span>';
  const fx = () => window.BL_FX || { confetti() {}, cheer() {}, buzz() {} };

  // ═══════════ 📅 4.5.10 СЪЩИЯТ ДЕН, НАЗАД ═══════════
  // Реката вече има memoryFor(дни) — тук е ПЪЛНАТА картина: същата дата
  // през всички минали години, една до друга.
  function sameDayCard() {
    const c = card('Същият ден, назад 📅 ' + sub('какво е било на тази дата'));
    if (!window.BL_RIVER || !BL_RIVER.collect) {
      c.appendChild(el('p', 'jr-privacy', 'Реката още не е готова.'));
      return c;
    }
    const всички = BL_RIVER.collect();
    const днес = new Date();
    const дм = (днес.getMonth() + 1) + '-' + днес.getDate();   // месец-ден, без година

    // групирай по година — само същия календарен ден (±1 ден за милост)
    // 🟡 11.08 (обиколка №2): „±1 ден за милост“ се смяташе като
    //    |разлика в месеците|·31 + |разлика в дните|. На 1 март запис от
    //    28 февруари дава 1·31 + 27 = 58 и изпада — при положение че е точно
    //    един ден по-рано. Тоест на всяко първо и последно число от месеца
    //    милостта не работеше. Мерим по календар: същия ден от същата година
    //    ±1 ден, без аритметика върху номера на месеца.
    const поГодина = {};
    всички.forEach(x => {
      if (!x.ts) return;
      const d = new Date(x.ts);
      if (isNaN(d.getTime())) return;                          // счупена дата от внесено копие
      const г = d.getFullYear();
      if (г === днес.getFullYear()) return;                    // тази година не е „назад“
      const котва = new Date(г, днес.getMonth(), днес.getDate(), 12, 0, 0);
      const тази = new Date(г, d.getMonth(), d.getDate(), 12, 0, 0);
      const δ = Math.abs(тази - котва);
      // δ близо до цяла година = 31 декември срещу 1 януари — пак е „вчера“
      if (δ > 1.5 * 86400000 && δ < 363 * 86400000) return;
      (поГодина[г] = поГодина[г] || []).push(x);
    });
    const години = Object.keys(поГодина).map(Number).sort((a, b) => b - a);

    if (!години.length) {
      // само валидни дати — иначе една счупена дата от внесено копие правеше
      // Math.min да върне NaN и картата казваше „Историята ви започва от NaN“
      const валидни = всички.map(x => new Date(x.ts).getFullYear()).filter(г => !isNaN(г));
      const най = валидни.length ? Math.min.apply(null, валидни) : днес.getFullYear();
      c.appendChild(el('p', 'jr-privacy',
        всички.length
          ? `На тази дата в минали години още няма записано. Историята ви започва от ${най} — върни се на тази дата догодина и тук ще има какво да четеш. 💜`
          : 'Тук ще виждаш какво е било на днешната дата преди година, две, три. Пълни се само — от всичко, което пишеш.'));
      return c;
    }

    години.forEach(г => {
      const назад = днес.getFullYear() - г;
      const бл = el('div', 'sd-year');
      бл.innerHTML = `<p class="sd-head">🕰️ <strong>Преди ${назад} ${назад === 1 ? 'година' : 'години'}</strong> · ${г}</p>`;
      поГодина[г].slice(0, 4).forEach(x => {
        const r = el('div', 'sd-row');
        // 🔴🔴 11.08 (обиколка №2, ДОКАЗАНО в браузъра): `x.e` и `x.img` влизаха
        //    СУРОВИ в innerHTML. Сложих в bl_river_manual запис с
        //    e: '<img src=x onerror="document.title=…">' и заглавието на
        //    страницата се смени — тоест чужд HTML се изпълни. Самата река
        //    (river.js) прави esc(x.e); тук беше пропуснато. Реката се пълни и
        //    от ВНЕСЕНО резервно копие, значи източникът не е наш. Правило 4
        //    не прави изключение за емоджи.
        // 🟡 и преливането: ИЗМЕРЕНО .sd-row scrollWidth 630 при clientWidth 287 —
        //    дълга дума без интервал излиза от реда и се отрязва мълчаливо.
        //    .sd-t е flex-дете без min-width:0; поправено инлайн (CSS е чужд).
        // мястото на емоджито е за ЕДНО емоджи (.sd-e е flex-shrink:0) — дълъг
        // низ оттам изкарваше целия ред от картата: ИЗМЕРЕНО 353 при 287.
        // Array.from, за да не срежем емоджи по средата на сурогатната двойка.
        const емо = Array.from(String(x.e == null ? '💜' : x.e)).slice(0, 2).join('');
        r.innerHTML = `<span class="sd-e">${esc(емо)}</span>
          ${x.img ? `<img class="sd-img" src="${esc(x.img)}" alt="" loading="lazy">` : ''}
          <span class="sd-t" style="min-width:0;overflow-wrap:anywhere">${esc(x.txt)}</span>`;
        бл.appendChild(r);
      });
      if (поГодина[г].length > 4) бл.appendChild(el('p', 'jr-privacy', '…и още ' + (поГодина[г].length - 4)));
      c.appendChild(бл);
    });
    const б = el('button', 'jr-chip', '🌊 Отвори цялата река'); б.type = 'button';
    б.addEventListener('click', () => { if (window.BL_RIVER && BL_RIVER.open) BL_RIVER.open(); });
    c.appendChild(б);
    return c;
  }

  // ═══════════ 🔳 4.7.2 QR ЗА БАБИНАТА КАРТА ═══════════
  // Минимален QR енкодер: версия 5 (37×37), корекция L, byte режим.
  // Пиша го ръчно, защото цялото приложение е без зависимости.
  //
  // ⚠️ Тръгнах с версия 3 (55 байта) — НЕ СТИГА: кирилицата е по 2 байта в
  // UTF-8, „Ния / АЛЕРГИЯ: ядки / Мама: 0888…“ е 73 байта. Версия 5 дава
  // 108 байта данни = ~50 кирилски знака. Живият тест го хвана веднага.
  const QR = (function () {
    // Galois поле за Reed-Solomon
    const EXP = new Array(512), LOG = new Array(256);
    (function () {
      let x = 1;
      for (let i = 0; i < 255; i++) { EXP[i] = x; LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11d; }
      for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
    })();
    const mul = (a, b) => (a === 0 || b === 0) ? 0 : EXP[LOG[a] + LOG[b]];

    function rsGen(n) {
      let g = [1];
      for (let i = 0; i < n; i++) {
        const ng = new Array(g.length + 1).fill(0);
        for (let j = 0; j < g.length; j++) { ng[j] ^= mul(g[j], 1); ng[j + 1] ^= mul(g[j], EXP[i]); }
        g = ng;
      }
      return g;
    }
    function rsEncode(data, ecLen) {
      const gen = rsGen(ecLen);
      const res = new Array(ecLen).fill(0);
      data.forEach(b => {
        const f = b ^ res[0];
        res.shift(); res.push(0);
        for (let i = 0; i < ecLen; i++) res[i] ^= mul(gen[i + 1], f);
      });
      return res;
    }

    // 🟠 11.08 (обиколка №2, ИЗМЕРЕНО): само v5-L беше малко. Обикновен попълнен
    //    профил — „Ния / ВНИМАВАЙ С: ядки,яйце / Мама: 0888… / Педиатър: 0899… /
    //    Спешно: 112“ — е 113 байта при таван 105. Тоест майката, която е
    //    свършила всичко, каквото приложението ѝ иска, оставаше БЕЗ квадрат.
    //    Добавена е v6-L (41×41, 136 байта): два блока, затова се появи и
    //    преплитането. Избираме НАЙ-МАЛКАТА версия, която побира текста —
    //    по-малкият квадрат се снима по-лесно.
    //    ПЪТ НАЗАД: махни втория ред от ВЕРСИИ и всичко се връща на v5.
    const ВЕРСИИ = [
      { ver: 5, SIZE: 37, ALIGN: [6, 30], DATA: 108, EC: 26, BLOCKS: 1 },
      { ver: 6, SIZE: 41, ALIGN: [6, 34], DATA: 136, EC: 18, BLOCKS: 2 }
    ];
    const MAXBYTES = ВЕРСИИ[ВЕРСИИ.length - 1].DATA - 3;

    function encode(text) {
      const bytes = Array.from(new TextEncoder().encode(text));
      const V = ВЕРСИИ.find(v => bytes.length <= v.DATA - 3);
      if (!V) return null;                                     // не се побира
      const SIZE = V.SIZE, DATA_BYTES = V.DATA, ALIGN = V.ALIGN;

      // битов поток: режим 0100 + дължина (8 бита за v1-9) + данни
      const bits = [];
      const push = (val, len) => { for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1); };
      push(4, 4); push(bytes.length, 8);
      bytes.forEach(b => push(b, 8));
      push(0, Math.min(4, DATA_BYTES * 8 - bits.length));      // терминатор
      while (bits.length % 8) bits.push(0);
      const data = [];
      for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(''), 2));
      const PAD = [0xEC, 0x11];
      let pi = 0;
      while (data.length < DATA_BYTES) data.push(PAD[pi++ % 2]);

      // блокове + преплитане. При един блок това е точно старото поведение;
      // при два (v6-L: 2×68 данни + 2×18 EC) байтовете се редуват по спецификация.
      const дълж = DATA_BYTES / V.BLOCKS;
      const блокове = [], ecБлокове = [];
      for (let b = 0; b < V.BLOCKS; b++) {
        const част = data.slice(b * дълж, (b + 1) * дълж);
        блокове.push(част);
        ecБлокове.push(rsEncode(част, V.EC));
      }
      const all = [];
      for (let i = 0; i < дълж; i++) блокове.forEach(бл => all.push(бл[i]));
      for (let i = 0; i < V.EC; i++) ecБлокове.forEach(бл => all.push(бл[i]));

      // матрица
      const m = Array.from({ length: SIZE }, () => new Array(SIZE).fill(null));
      const set = (r, cc, v) => { if (r >= 0 && r < SIZE && cc >= 0 && cc < SIZE) m[r][cc] = v; };

      // finder patterns
      const finder = (R, C) => {
        for (let r = -1; r <= 7; r++) for (let cc = -1; cc <= 7; cc++) {
          const rr = R + r, ccc = C + cc;
          if (rr < 0 || rr >= SIZE || ccc < 0 || ccc >= SIZE) continue;
          const on = (r >= 0 && r <= 6 && (cc === 0 || cc === 6)) ||
                     (cc >= 0 && cc <= 6 && (r === 0 || r === 6)) ||
                     (r >= 2 && r <= 4 && cc >= 2 && cc <= 4);
          m[rr][ccc] = on ? 1 : 0;
        }
      };
      finder(0, 0); finder(0, SIZE - 7); finder(SIZE - 7, 0);

      // alignment — v5 има центрове на (6,30),(30,6),(30,30); тези, които
      // падат върху finder-ите (6,6 / 6,30-ляво-горе и т.н.), се пропускат
      ALIGN.forEach(ar => ALIGN.forEach(ac => {
        // пропусни трите ъгъла, заети от finder patterns
        if ((ar === 6 && ac === 6) || (ar === 6 && ac === SIZE - 7) || (ar === SIZE - 7 && ac === 6)) return;
        for (let r = -2; r <= 2; r++) for (let cc = -2; cc <= 2; cc++) {
          const on = Math.max(Math.abs(r), Math.abs(cc)) !== 1;
          set(ar + r, ac + cc, on ? 1 : 0);
        }
      }));
      // timing
      for (let i = 8; i < SIZE - 8; i++) { if (m[6][i] === null) m[6][i] = i % 2 === 0 ? 1 : 0; if (m[i][6] === null) m[i][6] = i % 2 === 0 ? 1 : 0; }
      set(SIZE - 8, 8, 1);                                      // dark module

      // резервирай format зоните
      const fmtCells = [];
      for (let i = 0; i <= 8; i++) { if (i !== 6) fmtCells.push([8, i], [i, 8]); }
      for (let i = 0; i < 8; i++) fmtCells.push([8, SIZE - 1 - i], [SIZE - 1 - i, 8]);
      fmtCells.forEach(([r, cc]) => { if (m[r][cc] === null) m[r][cc] = 'F'; });

      // данните — зигзаг отдясно наляво
      let bi = 0, up = true;
      const allBits = [];
      all.forEach(b => { for (let i = 7; i >= 0; i--) allBits.push((b >> i) & 1); });
      for (let cc = SIZE - 1; cc > 0; cc -= 2) {
        if (cc === 6) cc--;
        for (let k = 0; k < SIZE; k++) {
          const r = up ? SIZE - 1 - k : k;
          for (let d = 0; d < 2; d++) {
            const ccc = cc - d;
            if (m[r][ccc] !== null) continue;
            let bit = bi < allBits.length ? allBits[bi++] : 0;
            if ((r + ccc) % 2 === 0) bit ^= 1;                  // маска 0
            m[r][ccc] = bit;
          }
        }
        up = !up;
      }

      // format info: EC=L(01), маска 0 → 01000, BCH
      const fmt = (() => {
        let d = 0x08 << 10;                                     // 01000 << 10
        let v = d;
        for (let i = 4; i >= 0; i--) if (v & (1 << (i + 10))) v ^= 0x537 << i;
        return ((d | v) ^ 0x5412) & 0x7fff;
      })();
      const fb = [];
      for (let i = 14; i >= 0; i--) fb.push((fmt >> i) & 1);
      // разположение по спецификация
      const seq1 = [[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],[7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]];
      const seq2 = [[SIZE-1,8],[SIZE-2,8],[SIZE-3,8],[SIZE-4,8],[SIZE-5,8],[SIZE-6,8],[SIZE-7,8],
                    [8,SIZE-8],[8,SIZE-7],[8,SIZE-6],[8,SIZE-5],[8,SIZE-4],[8,SIZE-3],[8,SIZE-2],[8,SIZE-1]];
      seq1.forEach(([r, cc], i) => m[r][cc] = fb[i]);
      seq2.forEach(([r, cc], i) => m[r][cc] = fb[i]);
      m.forEach(row => row.forEach((v, i) => { if (v === 'F' || v === null) row[i] = 0; }));
      return m;
    }

    function svg(text, px) {
      const m = encode(text);
      if (!m) return null;
      const n = m.length, q = 2, total = n + q * 2, s = (px || 200) / total;
      let out = `<svg viewBox="0 0 ${total} ${total}" class="qr-svg" shape-rendering="crispEdges"><rect width="${total}" height="${total}" fill="#fff"/>`;
      for (let r = 0; r < n; r++) for (let cc = 0; cc < n; cc++) {
        if (m[r][cc]) out += `<rect x="${cc + q}" y="${r + q}" width="1" height="1" fill="#000"/>`;
      }
      return out + '</svg>';
    }
    return { svg, encode, MAX: MAXBYTES };
  })();

  function qrCard() {
    const c = card('QR за бабата 🔳 ' + sub('баба не сваля приложения — но снима с телефона'));
    c.appendChild(el('p', 'jr-privacy',
      'Най-важното в един квадрат. Баба го снима с камерата си и то ѝ излиза на екрана — без приложение, без интернет, без сметки. Разпечатай го и го залепи на хладилника.'));

    // 🔴 11.08 (обиколка №2, ИЗМЕРЕНО): всичко отдолу се четеше ВЕДНЪЖ, при
    //    рисуването на картата. Мама натиска „🆘 Отвори SOS-центъра“ ОТ ТАЗИ
    //    КАРТА, записва си номера, затваря оверлея — и квадратът под него още
    //    показва „Съдържа: Ния · Спешно: 112“ и още я хока „Още нямаш записани
    //    номера“. Тя лепва на хладилника квадрат без своя телефон. (Стаята се
    //    пре-строява само при ново отваряне, а оверлеят не я пипа.)
    //    Сега всичко живее в сглоби() — чете се ПРЯСНО и се пречертава.
    let baby = {}, sos = {}, alrg = [], редове = [], текст = '';
    const сглоби = () => {
      baby = load('bl_baby', {});
      sos = load('bl_sos', {});
      const опитани = load('bl_tried', {});
      const реакции = Object.keys(опитани).filter(k => (опитани[k] || '').includes('⚠️'));
    // 🔴 05.08 (СКЕПТИКЪТ към №156/№241): срязването падна, но ДРУГИЯТ източник
    //    липсваше изцяло. „Алергия-паспорт“ (rooms3.js:823) печата `авто()
    //    .concat(manual)` — тоест и ръчно написаните алергени (bl_allergy_manual).
    //    Квадратът четеше само bl_tried. Мама пише „фъстъци“ в паспорта, вижда
    //    го на разпечатката и мисли, че баба е предупредена — а QR-ът за същия
    //    хладилник мълчи за тях. Оплакването на самата находка беше „два
    //    документа за едно дете казват различни неща“; оставаше в сила.
      alrg = реакции.concat(load('bl_allergy_manual', []).filter(x => x && !реакции.includes(x)));

    // кратко — QR-ът е малък. Само животоспасяващото.
      редове = [];
      if (baby.name) редове.push(baby.name);
    // 🔴 05.08 (одит г04, №156+№241): тук стоеше `alrg.slice(0, 2)` — третата и
    //    следващите реакции падаха МЪЛЧАЛИВО, при това ПРЕДИ сглобяването на
    //    текста, така че проверката за препълване (по-долу) не можеше да ги
    //    види никога. Мама лепва квадрата на хладилника и мисли, че е
    //    предупредила за всичките. „Алергия-паспорт“ (rooms3.js) пък печата
    //    целия списък — два документа за едно дете казваха различни неща.
    //    Честното съобщение при препълване е по-добро от тиха загуба.
    // 🔴 05.08 (СКЕПТИКЪТ към №241): втората половина беше отхвърлена с довода
    //    „по-дългият етикет яде байтове“. Доводът е измерим и не издържа: думата
    //    идва от списък, в който приложението НИКЪДЕ другаде не казва „алергия“
    //    — полето се казва „⚠️ реакция“ (rooms2.js:908), а разпечатката на
    //    същия хладилник казва „Внимавай с:“ (rooms3.js:830). Квадратът беше
    //    единственото място, което обявяваше ДИАГНОЗА върху данни за реакция —
    //    и то на документ, по който баба решава какво да даде. Един глас с
    //    паспорта; цената е ИЗМЕРЕНИ 5 байта от 105 (TextEncoder: 16 → 21), а
    //    препълването вече си има честно съобщение. Типичен квадрат „Ния /
    //    ядки,яйце / телефон / 112“: 79 → 84 байта от 105.
    //    ПЪТ НАЗАД: върни низа на 'АЛЕРГИЯ: '.
      if (alrg.length) редове.push('ВНИМАВАЙ С: ' + alrg.join(','));
      if (sos.fastPhone) редове.push('Мама: ' + sos.fastPhone);
      else if (sos.closePhone) редове.push('Близък: ' + sos.closePhone);
      if (sos.pedPhone) редове.push('Педиатър: ' + sos.pedPhone);
      редове.push('Спешно: 112');
      текст = редове.join('\n');
    };
    сглоби();

    const кутия = el('div', 'qr-box');
    const изход = el('p', 'qr-out', '');
    const рисувай = () => {
      const s = QR.svg(текст, 190);
      if (!s) {
        кутия.innerHTML = '';
        // №156: откакто алергиите не се режат мълчаливо, дългият текст идва
        // най-често от тях — а тях не искаме мама да ги маха. Затова я пращаме
        // към разпечатката, която носи ВСИЧКО, вместо да я караме да съкращава.
        изход.innerHTML = '⚠️ Текстът не се побира в един квадрат (' + new TextEncoder().encode(текст).length + ' от макс ' + QR.MAX + ' байта). Нищо не е изпуснато — разпечатката отдолу носи всичко. Ако искаш и квадрат, скъси името или някой от номерата.';
        return;
      }
      кутия.innerHTML = s;
      изход.innerHTML = 'Съдържа: <em>' + esc(текст.replace(/\n/g, ' · ')) + '</em>';
    };
    c.appendChild(кутия); c.appendChild(изход);

    // 05.08 (одит г04, №135): текстът пращаше към „бутонът долу“, а долу
    //   имаше само принтиране. Сега бутонът съществува наистина.
    const няма = el('p', 'sp-warn',
      '⚠️ Още нямаш записани номера. Сложи поне един — иначе QR-ът носи само 112.');
    const къмSOS = el('button', 'jr-chip', '🆘 Отвори SOS-центъра'); къмSOS.type = 'button';
    къмSOS.style.minHeight = '44px';
    const празноSOS = () => !sos.fastPhone && !sos.closePhone && !sos.pedPhone;
    const опресни = () => { сглоби(); рисувай(); няма.hidden = !празноSOS(); къмSOS.hidden = !празноSOS(); };
    къмSOS.addEventListener('click', () => {
      if (window.BL_SOS_CENTER) BL_SOS_CENTER.open();
      else if (window.MamaHelper && MamaHelper.open) { MamaHelper.open('Здраве и SOS'); return; }
      // изчакваме оверлея да се затвори и се пречертаваме с ПРЕСНИТЕ номера
      let видян = false, тик = 0;
      const пази = setInterval(() => {
        const ов = document.getElementById('sosOverlay');
        const отворен = !!ов && !ов.hidden;
        if (отворен) видян = true;
        тик++;
        // чакаме да се отвори (най-много 4 сек), после да се затвори (най-много 10 мин)
        if ((отворен || !видян) && тик < 1500) return;
        clearInterval(пази);
        if (document.body.contains(кутия)) опресни();
      }, 400);
    });
    c.appendChild(няма); c.appendChild(къмSOS);
    опресни();

    const пр = el('button', 'jr-chip', '🖨️ Отпечатай за хладилника'); пр.type = 'button';
    пр.style.minHeight = '44px';
    пр.addEventListener('click', () => {
      сглоби();                                                  // пресни данни и за листа
      const s = QR.svg(текст, 260);
      if (!window.BL_EXPR || !BL_EXPR.printOverlay) {
        // 🔴 11.08: без печатницата бутонът беше НЯМ
        изход.innerHTML = '⚠️ Печатницата не се зареди. Затвори и отвори стаята — квадратът и списъкът те чакат.';
        return;
      }
      // 🔴🔴 11.08 (обиколка №2, ИЗМЕРЕНО): при препълване `s` е null и листът
      //    излизаше с ПРАЗНО каре, но под него пишеше „Снима се с камерата на
      //    телефона. Работи и без интернет — текстът е в самия квадрат.“ Мама
      //    лепва това на хладилника, баба насочва камерата към нищо. Няма
      //    квадрат — няма и изречение за квадрат.
      BL_EXPR.printOverlay('За хладилника',
        (s ? `<div class="pr-qr">${s}</div>` : '') +
        `<p class="pr-big">${esc(baby.name || 'Нашето бебе')}</p>
         <ul class="pr-list">${редове.map(r => `<li>${esc(r)}</li>`).join('')}</ul>` +
        (s
          ? `<p class="pr-note">Снима се с камерата на телефона. Работи и без интернет — текстът е в самия квадрат.</p>`
          : `<p class="pr-note">Този лист е за четене с очи — написаното е твърде дълго за един квадрат, затова тук няма код за снимане. Нищо не е изпуснато: всичко важно е в списъка отгоре.</p>`));
    });
    c.appendChild(пр);
    c.appendChild(el('p', 'jr-privacy',
      '🔒 Кодът съдържа само това, което виждаш горе — нищо не се качва никъде. Той е просто текст, нарисуван като квадратчета.'));
    return c;
  }

  // ── свързване ──
  const ПАКЕТИ = {
    'Дневник на мама': root => { root.appendChild(sameDayCard()); },
    'Инструменти': root => { root.appendChild(qrCard()); }
  };
  Object.keys(ПАКЕТИ).forEach(стая => {
    const база = window.ROOM_FEATURES && window.ROOM_FEATURES[стая];
    if (!база) return;
    window.ROOM_FEATURES[стая] = root => { база(root); ПАКЕТИ[стая](root); };
  });
})();
