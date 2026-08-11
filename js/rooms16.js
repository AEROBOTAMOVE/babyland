// ═══════════════════════════════════════════════════════════
// ROOMS 16 — ПРАКТИЧНИТЕ ВРЪЗКИ (план 19, част 4)
//
// 🛒 4.3.6  Менюто → списък за пазар (двете ги има, не са свързани)
// 👕 4.2.5  Какво му става сега — от размерите
// 📊 4.7.3  Разходите: графика по месеци
// ♻️ 4.7.4  Втора употреба: кое да / кое не  ⚠️ столчето — НИКОГА
// 🍽️ 4.3.11 Първият път с чаша / лъжица / вилица
// 😄 4.5.5  Смехът на деня
//
// ЖЕЛЯЗНО: 4.7.4 съдържа реално правило за безопасност (столче за кола
// след удар е за смет). Това е единственото място тук с „никога“.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const localDate = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const today = () => localDate(new Date());
  const card = t => { const c = el('section', 'jr-card'); c.appendChild(el('h4', 'jr-title', t)); return c; };
  const sub = s => '<span class="jr-sub">' + s + '</span>';
  const fx = () => window.BL_FX || { confetti() {}, cheer() {}, buzz() {} };

  // ═══════════ 🛒 4.3.6 СПИСЪКЪТ ЗА ПАЗАР — НАДГРАЖДАНЕ ═══════════
  // Картата ВЕЧЕ съществува (rooms5.js) — но само СПОДЕЛЯ текст и брои и
  // миналите дни. Пред щанда мама има нужда да ОТМЯТА. Не правя втора карта
  // (дублирането е по-лошо от липсата) — надграждам съществуващата.
  function надградиПазар(root) {
    const карта = [...root.querySelectorAll('.jr-card:not(.toc-card)')].find(c => {
      const t = c.querySelector('.jr-title'); return t && /Списък за пазар/.test(t.textContent);
    });
    if (!карта || карта.querySelector('.sl-row')) return;
    const menu = load('bl_menu', {});
    const бъдещи = Object.keys(menu).filter(d => d >= today()).sort();
    const продукти = [...new Set(бъдещи.map(d => menu[d]).filter(Boolean))];
    if (!продукти.length) return;                       // празно меню → картата си остава както е

    const взети = load('bl_shoplist_done', {});
    // 22.07 (армия): отметките се пазеха по ИМЕ и никога не се чистеха —
    //   следващата седмица мама виждаше „✔ банан“ и подминаваше щанда.
    //   Същият шаблон като чантата за навън (rooms18): изричен бутон.
    const list = el('div', 'jr-wins');
    const рисувай = () => {
      list.innerHTML = '';
      продукти.forEach(п => {
        const row = el('button', 'sl-row' + (взети[п] ? ' done' : '')); row.type = 'button';
        row.innerHTML = `<span class="jr-check">${взети[п] ? '✔' : ''}</span><span class="sl-n">${esc(п)}</span>`;
        row.addEventListener('click', () => {
          взети[п] = !взети[п]; save('bl_shoplist_done', взети); рисувай(); fx().buzz(6);
          if (продукти.every(x => взети[x])) { fx().confetti(); fx().cheer('🛒 Всичко е в количката!'); }
        });
        list.appendChild(row);
      });
    };
    рисувай();
    карта.appendChild(list);
    карта.appendChild(el('p', 'jr-privacy',
      `👆 ${продукти.length} ${продукти.length === 1 ? 'продукт' : 'продукта'} за следващите ${бъдещи.length} ${бъдещи.length === 1 ? 'ден' : 'дни'} — докосвай ги пред щанда. Отметнатото се помни.`));
    const ред = el('div', 'jr-quick');
    const пр = el('button', 'jr-chip', '🖨️ За чантата'); пр.type = 'button';
    пр.addEventListener('click', () => {
      if (!window.BL_EXPR || !BL_EXPR.printOverlay) return;
      BL_EXPR.printOverlay('Списък за пазар',
        `<ul class="pr-list">${продукти.map(п => `<li>☐ ${esc(п)}</li>`).join('')}</ul>
         <p class="pr-note">От менюто за следващите ${бъдещи.length} дни.</p>`);
    });
    // 22.07 (армия): без този бутон отметките оставаха завинаги и следващата
    //   седмица мама виждаше всичко „взето“. Същият шаблон като чантата за
    //   навън (rooms18) — изрично нулиране, нищо не се чисти само.
    const нула = el('button', 'jr-chip', '↺ Изчисти отметките'); нула.type = 'button';
    нула.addEventListener('click', () => {
      продукти.forEach(п => { delete взети[п]; });
      save('bl_shoplist_done', взети); рисувай(); fx().buzz(8);
    });
    ред.appendChild(пр); ред.appendChild(нула);
    карта.appendChild(ред);
  }

  // ═══════════ 👕 4.2.5 КАКВО МУ СТАВА СЕГА ═══════════
  // EU размерите са по РЪСТ, не по възраст — затова четем от ръста, ако го
  // има; иначе казваме честно, че е по възраст и е приблизително.
  const РАЗМЕРИ = [
    { см: 56, eu: '56', възр: '0-1 м.' }, { см: 62, eu: '62', възр: '1-3 м.' },
    { см: 68, eu: '68', възр: '3-6 м.' }, { см: 74, eu: '74', възр: '6-9 м.' },
    { см: 80, eu: '80', възр: '9-12 м.' }, { см: 86, eu: '86', възр: '12-18 м.' },
    { см: 92, eu: '92', възр: '18-24 м.' }, { см: 98, eu: '98', възр: '2-3 г.' }
  ];
  function sizeNowCard() {
    const c = card('Какво му става сега 👕 ' + sub('размерите са по РЪСТ, не по възраст'));
    const ръст = load('bl_growth_len', []);
    const посл = ръст.slice(-1)[0];
    const baby = load('bl_baby', {});
    const a = baby.birth && window.BL_AGE ? BL_AGE(baby.birth) : null;

    if (посл && посл.v) {
      // намери размера, който покрива този ръст (+запас нагоре)
      const текущ = РАЗМЕРИ.find(r => посл.v <= r.см) || РАЗМЕРИ[РАЗМЕРИ.length - 1];
      const следващ = РАЗМЕРИ[РАЗМЕРИ.indexOf(текущ) + 1];
      const box = el('div', 'sn-box');
      box.innerHTML = `<span class="sn-big">${текущ.eu}</span>
        <div><p class="sn-t">При ръст <strong>${посл.v} см</strong></p>
        <p class="sn-d">Етикетът пише „${текущ.възр}“ — но той е ориентир. Числото на етикета е сантиметри.</p></div>`;
      c.appendChild(box);
      if (следващ) {
        const остават = следващ.см - посл.v;
        c.appendChild(el('p', 'sn-next',
          остават <= 3
            ? `⚠️ Остават му <strong>${Math.round(остават * 10) / 10} см</strong> до размер ${следващ.eu}. Ако купуваш сега — вземи по-голямото.`
            : `Следващият размер (${следващ.eu}) идва след ~${Math.round(остават * 10) / 10} см.`));
      }
      c.appendChild(el('p', 'jr-privacy', 'От последното ти мерене на ' + esc(посл.d || '') + '. Марките се различават — това е ориентир, не гаранция.'));
    } else if (a) {
      // 🚨 22.07 (армия): последният ред от таблицата е „2-3 г.“ — числата се
      //   четяха като МЕСЕЦИ, така че дете над 24 месеца не намираше нищо и
      //   падаше на РАЗМЕРИ[0] = размер 56. На двегодишно мама четеше размер
      //   за новородено. Над таблицата вземаме последния ред, не първия.
      //   И мерим по коригираната възраст, както навсякъде другаде.
      const мес = (a.devMonths != null ? a.devMonths : a.months);
      const по_възраст = РАЗМЕРИ.find(r => {
        const [от, до] = r.възр.replace(/[^\d-]/g, '').split('-').map(Number);
        return мес >= (от || 0) && мес <= (до || 99);
      }) || РАЗМЕРИ[РАЗМЕРИ.length - 1];
      c.appendChild(el('p', 'jr-privacy',
        `Още нямам мерене на ръста, затова гадая по възраст: вероятно размер <strong>${по_възраст.eu}</strong>. Измери го веднъж в „Ръст и главичка“ и това ще стане точно — размерите се водят по сантиметри, не по месеци.`));
    } else {
      c.appendChild(el('p', 'jr-privacy', 'Като запишеш ръста в „Ръст и главичка“, тук ще ти казвам кой размер му е сега — и кога ще му омалее.'));
    }
    return c;
  }

  // ═══════════ 📊 4.7.3 РАЗХОДИТЕ ПО МЕСЕЦИ ═══════════
  // Планът искаше „графика по месеци“. Но „Бебешки бюджет“ пази само една
  // МЕСЕЧНА ОЦЕНКА (pel/milk/other), не история с дати — няма от какво да
  // се направи графика. Затова: истинска история, която мама пълни сама,
  // отделно от оценката. Първият запис взима оценката за начало.
  const КАТ = [
    { id: 'pel', e: '💧', н: 'Пелени' }, { id: 'milk', e: '🍼', н: 'Мляко' },
    { id: 'food', e: '🥄', н: 'Храна' }, { id: 'cloth', e: '👕', н: 'Дрешки' },
    { id: 'health', e: '🩺', н: 'Здраве' }, { id: 'other', e: '🎁', н: 'Друго' }
  ];
  function spendCard() {
    const c = card('Разходите по месеци 📊 ' + sub('истинските — не оценката'));
    const h = load('bl_spend', []);
    const месец = today().slice(0, 7);

    // бърз запис
    const ред = el('div', 'sp-add');
    let катИзбор = 'pel';
    const кг = el('div', 'sp-cats');
    // ♿ 11.08 (клавиатура-четец): категориите са голи емоджи. title= е само
    //    подсказка с мишка — името на бутона е съдържанието му, тоест четецът
    //    казваше „капка", „биберон", „лъжица". Кое е избраното също не личеше.
    кг.setAttribute('role', 'group'); кг.setAttribute('aria-label', 'Категория на разхода');
    КАТ.forEach(k => {
      const b = el('button', 'sp-cat' + (k.id === катИзбор ? ' on' : ''), k.e); b.type = 'button';
      b.title = k.н;
      b.setAttribute('aria-label', k.н);
      b.setAttribute('aria-pressed', k.id === катИзбор ? 'true' : 'false');
      b.addEventListener('click', () => {
        катИзбор = k.id;
        кг.querySelectorAll('.sp-cat').forEach(x => { x.classList.remove('on'); x.setAttribute('aria-pressed', 'false'); });
        b.classList.add('on'); b.setAttribute('aria-pressed', 'true');
      });
      кг.appendChild(b);
    });
    const сума = el('input', 'jr-word'); сума.type = 'number'; сума.min = 0; сума.placeholder = 'лв…'; сума.style.maxWidth = '90px';
    сума.setAttribute('aria-label', 'Колко лева');
    const доб = el('button', 'jr-chip', '+'); доб.type = 'button';
    доб.setAttribute('aria-label', 'Добави разхода');
    ред.appendChild(кг); ред.appendChild(сума); ред.appendChild(доб);
    c.appendChild(ред);

    const box = el('div');
    const рисувай = () => {
      box.innerHTML = '';
      const данни = load('bl_spend', []);
      if (!данни.length) {
        const оц = load('bl_budget', {});
        const s = (+оц.pel || 0) + (+оц.milk || 0) + (+оц.other || 0);
        box.appendChild(el('p', 'jr-privacy',
          s ? `Още нищо записано. Оценката ти в „Бебешки бюджет“ е ~${s} лв/месец — тук се пише какво реално си похарчила. Първият запис е горе. 👆`
            : 'Записвай каквото похарчиш — по категория. След 2-3 месеца тук ще има истинска графика, не оценка.'));
        return;
      }
      const поМесец = {};
      данни.forEach(x => { if (x && x.d) поМесец[String(x.d).slice(0, 7)] = (поМесец[String(x.d).slice(0, 7)] || 0) + (+x.v || 0); });
      const месеци = Object.keys(поМесец).sort().slice(-6);
      const макс = Math.max(...месеци.map(k => поМесец[k]), 1);
      const МЕС = ['ян', 'фев', 'мар', 'апр', 'май', 'юни', 'юли', 'авг', 'сеп', 'окт', 'ное', 'дек'];
      const bars = el('div', 'sp-bars');
      месеци.forEach(k => {
        const d = el('div', 'sp-bar');
        d.innerHTML = `<span class="sp-v">${Math.round(поМесец[k])}</span>
          <span class="sp-fill" style="height:${Math.round(поМесец[k] / макс * 100)}%"></span>
          <span class="sp-l">${МЕС[+k.slice(5, 7) - 1] || k.slice(5, 7)}</span>`;
        bars.appendChild(d);
      });
      box.appendChild(bars);
      // този месец, по категории
      const тоз = данни.filter(x => x && String(x.d).slice(0, 7) === месец);
      if (тоз.length) {
        const поКат = {};
        тоз.forEach(x => { поКат[x.k] = (поКат[x.k] || 0) + (+x.v || 0); });
        const ред2 = el('p', 'sp-cats-sum');
        ред2.innerHTML = КАТ.filter(k => поКат[k.id]).map(k => `${k.e} ${Math.round(поКат[k.id])}`).join(' · ');
        box.appendChild(ред2);
      }
      const общо = месеци.reduce((s, k) => s + поМесец[k], 0);
      const ср = Math.round(общо / месеци.length);
      box.appendChild(el('p', 'sp-verd', `Средно: <strong>${ср} лв</strong>/месец. За ${месеци.length} ${месеци.length === 1 ? 'месец' : 'месеца'}: <strong>${Math.round(общо)} лв</strong>.`));
      // 🟠 11.08 (обиколка „документи и пари“): картата приемаше пари и НЯМАШЕ
      //    изход. Един сбъркан нул (420 вместо 42) кривеше и стълбчето, и
      //    средното, завинаги — а сметките са точно мястото, където числото
      //    трябва да може да се поправи. Махане на последния запис, с питане.
      const посл = данни[данни.length - 1];
      if (посл) {
        const назад = el('button', 'jr-chip', '↩ Махни последния (' + посл.v + ' лв)'); назад.type = 'button';
        назад.addEventListener('click', () => {
          const питай = window.BL_UI && BL_UI.confirm
            ? BL_UI.confirm('Да махна ли последния записан разход — ' + посл.v + ' лв?', { emoji: '📊', okText: 'Махни', cancelText: 'Остави', danger: true })
            : Promise.resolve(confirm('Да махна ли последния записан разход — ' + посл.v + ' лв?'));
          питай.then(да => { if (!да) return; const д2 = load('bl_spend', []); д2.pop(); save('bl_spend', д2); рисувай(); });
        });
        box.appendChild(назад);
      }
      box.appendChild(el('p', 'jr-privacy', 'Първите месеци са най-скъпи — количка, легло, столче. После пада. Това не е разхищение, а старт.'));
    };
    const пиши = () => {
      const v = parseFloat(сума.value); if (isNaN(v) || v <= 0) { сума.focus(); return; }
      const данни = load('bl_spend', []);
      данни.push({ d: today(), k: катИзбор, v: Math.round(v * 100) / 100 });
      save('bl_spend', данни.slice(-400));
      сума.value = ''; рисувай(); fx().buzz(8);
    };
    доб.addEventListener('click', пиши);
    сума.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); пиши(); } });
    c.appendChild(box); рисувай();
    return c;
  }

  // ═══════════ ♻️ 4.7.4 ВТОРА УПОТРЕБА ═══════════
  const ВТОРА = [
    { e: '👕', н: 'Дрешки', ок: true, txt: 'Растат от тях за седмици. Изпери на 60° и готово.' },
    { e: '🧸', н: 'Играчки', ок: true, txt: 'Провери за счупени части и малки парчета. Изпери меките.' },
    { e: '📚', н: 'Книжки', ок: true, txt: 'Класика. Избърши корицата.' },
    { e: '🛁', н: 'Ваничка', ок: true, txt: 'Мие се. Няма износване.' },
    { e: '🚼', н: 'Количка', ок: true, txt: 'Провери спирачките и колелата. Виж за изтегляне от пазара по модела.' },
    { e: '🛏️', н: 'Кошара / легло', ок: 'внимание', txt: 'Леглото — да, ако е цяло и без липсващи летви. Матракът — НЕ, винаги нов: слегнатият или влажен матрак не пази безопасния сън.' },
    { e: '🍼', н: 'Шишета и биберони', ок: false, txt: 'НЕ за биберони, шишета и залъгалки — микродраскотините не се виждат, а в тях се крият бактерии.' },
    { e: '🚗', н: 'Столче за кола', ок: false, txt: 'НЕ, освен ако не знаеш ЦЯЛАТА му история. След удар — дори лек — пластмасата има невидими пукнатини. Столче от непознат е лотария с детето ти.' },
    { e: '⛑️', н: 'Каска', ок: false, txt: 'НЕ. Същото като столчето — един удар и защитата е изчерпана, без да личи.' },
    { e: '🤱', н: 'Помпа за кърма (лична част)', ок: false, txt: 'НЕ за частите, които докосват млякото. Самият мотор — само ако е болничен/затворен тип.' }
  ];
  function secondHandCard() {
    const c = card('Втора употреба ♻️ ' + sub('кое да · кое никога'));
    c.appendChild(el('p', 'jr-privacy', 'Втората ръка е разумна за почти всичко. Почти.'));
    const g = el('div', 'sh-list');
    ВТОРА.forEach(x => {
      const цвят = x.ок === true ? 'sh-yes' : x.ок === false ? 'sh-no' : 'sh-mid';
      const знак = x.ок === true ? '✅' : x.ок === false ? '⛔' : '⚠️';
      const r = el('div', 'sh-row ' + цвят);
      r.innerHTML = `<span class="sh-e">${x.e}</span>
        <div class="sh-mid"><p class="sh-n">${знак} ${esc(x.н)}</p><p class="sh-t">${esc(x.txt)}</p></div>`;
      g.appendChild(r);
    });
    c.appendChild(g);
    c.appendChild(el('p', 'lb-kind', '💚 Правилото: ако предметът пази живот при удар (столче, каска) — купувай ново. Всичко останало е просто вещ.'));
    return c;
  }

  // ═══════════ 🍽️ 4.3.11 ПЪРВИЯТ ПЪТ С ПРИБОР ═══════════
  const ПРИБОРИ = [
    { id: 'cup_open', e: '🥛', н: 'Отворена чашка', кога: 'от ~6 м., с помощ' },
    { id: 'cup_straw', e: '🥤', н: 'Чашка със сламка', кога: 'от ~6-9 м., щом посегне' },
    { id: 'spoon_self', e: '🥄', н: 'Държи лъжицата сам', кога: 'от ~10-12 м. (мърля се, това е ученето)' },
    { id: 'spoon_hit', e: '🎯', н: 'Уцелва устата с лъжицата', кога: 'от ~15-18 м.' },
    { id: 'fork', e: '🍴', н: 'Вилица', кога: 'от ~15 м., с тъпи зъбци' },
    { id: 'glass', e: '🥂', н: 'Истинска чаша, без капак', кога: 'от ~18-24 м. (и разлива — нормално)' }
  ];
  function utensilsCard() {
    const c = card('Първият път с прибор 🍽️ ' + sub('чашка · лъжица · вилица'));
    const st = load('bl_utensils', {});
    const list = el('div', 'jr-wins');
    const рисувай = () => {
      list.innerHTML = '';
      ПРИБОРИ.forEach(п => {
        const d = st[п.id];
        const row = el('button', 'jr-win' + (d ? ' done' : '')); row.type = 'button';
        row.innerHTML = `<span class="jr-check">${d ? '✔' : ''}</span>
          <span class="ut-n">${п.e} ${esc(п.н)}<small>${d ? 'първи път: ' + esc(d) : esc(п.кога)}</small></span>`;
        row.addEventListener('click', () => {
          // проход 4: повторен тап по завършен „първи път" ТРИЕШЕ датата без питане.
          if (st[п.id]) {
            (window.BL_UI ? BL_UI.confirm('Да махна ли „първи път“ за „' + п.н + '“? Датата ' + esc(d) + ' ще се загуби.', { emoji: п.e, okText: 'Махни', cancelText: 'Остави', danger: true })
              : Promise.resolve(confirm('Да махна ли отметката?'))).then(да => {
              if (да) { delete st[п.id]; save('bl_utensils', st); рисувай(); fx().buzz(8); }
            });
            return;
          }
          st[п.id] = today(); fx().confetti(row); fx().cheer(п.e + ' ' + п.н + '!');
          save('bl_utensils', st); рисувай(); fx().buzz(8);
        });
        list.appendChild(row);
      });
    };
    c.appendChild(list); рисувай();
    c.appendChild(el('p', 'jr-privacy', 'Месеците са ориентир, не изпит. Мърлянето НЕ е провал — то е самото учене. Възрастните също не са се родили с вилица.'));
    return c;
  }

  // ═══════════ 😄 4.5.5 СМЕХЪТ НА ДЕНЯ ═══════════
  function laughCard() {
    const c = card('Смехът на деня 😄 ' + sub('за да не остане само тежкото'));
    c.appendChild(el('p', 'jr-privacy',
      'Дневникът пази и тежкото — така трябва. Но ако не запишеш и смешното, след година ще помниш само умората. А е имало и смях.'));
    const st = load('bl_laughs', []);
    const ред = el('div', 'jr-addrow');
    const inp = el('input', 'jr-word'); inp.placeholder = 'Какво те разсмя днес?'; inp.maxLength = 120;
    const add = el('button', 'jr-chip', '😄 Запиши'); add.type = 'button';
    const list = el('div', 'jr-wins');
    const рисувай = () => {
      list.innerHTML = '';
      if (!st.length) { list.appendChild(el('p', 'jr-privacy', 'Още нищо. Първото ще дойде — понякога смехът е техен, понякога е твой.')); return; }
      st.slice().reverse().slice(0, 12).forEach((x, ri) => {
        const i = st.length - 1 - ri;
        const row = el('div', 'lg-row');
        row.innerHTML = `<span class="lg-e">😄</span><span class="lg-t">${esc(x.t)}<small>${esc(x.d)}</small></span><button class="nt-del" type="button" aria-label="Махни „${esc(x.t)}“ от ${esc(x.d)}">🗑</button>`;
        row.querySelector('.nt-del').addEventListener('click', () => { st.splice(i, 1); save('bl_laughs', st); рисувай(); });
        list.appendChild(row);
      });
      if (st.length > 12) list.appendChild(el('p', 'jr-privacy', 'Показвам последните 12 от общо ' + st.length + '. Всичките са в Реката.'));
    };
    const пиши = () => { const v = inp.value.trim(); if (!v) return; st.push({ t: v.slice(0, 120), d: today() }); save('bl_laughs', st); inp.value = ''; рисувай(); fx().buzz(10); fx().confetti(); };
    add.addEventListener('click', пиши);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); пиши(); } });
    ред.appendChild(inp); ред.appendChild(add);
    c.appendChild(ред); c.appendChild(list); рисувай();
    return c;
  }

  // ── свързване ──
  const ПАКЕТИ = {
    'Захранване': root => { надградиПазар(root); root.appendChild(utensilsCard()); },
    'Моето бебе': root => { root.appendChild(sizeNowCard()); },
    'Инструменти': root => { root.appendChild(spendCard()); root.appendChild(secondHandCard()); },
    'Дневник на мама': root => { root.appendChild(laughCard()); }
  };
  Object.keys(ПАКЕТИ).forEach(стая => {
    const база = window.ROOM_FEATURES && window.ROOM_FEATURES[стая];
    if (!база) return;
    window.ROOM_FEATURES[стая] = root => { база(root); ПАКЕТИ[стая](root); };
  });
})();
