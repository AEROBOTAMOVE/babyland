// ═══════════════════════════════════════════════════════════
// 🎈 ИГРИТЕ — надграждане (план 19, част 12.5)
//
// 🎵 12.5.3  Караоке: +7 песни (3 → 10)
// 🎤 12.5.4  Записът на маминия глас → бебето го слуша после
// 👶 12.5.5  Игри за бебето: черно-бели картинки · звуци · огледало
// 🎈 12.5.1  Балончето излиза, КОГАТО ѝ е тежко
// 🔇 12.5.6  Всичко изключваемо
//
// ⛔ 12.5.2 (+2 игри за мама) е ГОТОВО — calm.js: „дишай с формата“ и
//    „подреди мислите“. Не го пипам.
//
// ЗАРЕЖДА СЕ СЛЕД extras2.js (SONGS, bubbleGame) и СЛЕД lab.js.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const card = t => { const c = el('section', 'jr-card'); c.appendChild(el('h4', 'jr-title', t)); return c; };
  const fx = () => window.BL_FX || { buzz() {}, cheer() {}, chime() {} };

  // ═══════════ 🔇 12.5.6 ИЗКЛЮЧВАЕМОТО ═══════════
  // Едно място, един ключ. Ако мама е изключила игрите, НИЩО от тук не
  // изскача само — включително балончето в тежкия момент.
  const КЛЮЧ = 'bl_games_off';
  const изключени = () => !!load(КЛЮЧ, false);

  function картаКлюч() {
    const c = card('Игрите 🎈 <span class="jr-sub">ако не са за теб — изключи ги и повече няма да ги видиш</span>');
    const б = el('button', 'jr-btn', '');
    б.type = 'button';
    const рисувай = () => {
      б.textContent = изключени() ? '🔇 Игрите са изключени — включи ги' : '🔊 Игрите са включени — изключи ги';
      бел.textContent = изключени()
        ? 'Изключени са. Балончето няма да изскача, картите остават скрити. Всичко останало работи както преди.'
        : 'Включени са. Балончето може да те покани в тежък момент — само да те покани, не да ти се натрапи.';
    };
    const бел = el('p', 'cs-note', '');
    б.addEventListener('click', () => { save(КЛЮЧ, !изключени()); рисувай(); fx().buzz(8); });
    c.appendChild(бел); c.appendChild(б);
    рисувай();
    return c;
  }

  // ═══════════ 🎵 12.5.3 ОЩЕ 7 ПЕСНИ ═══════════
  // Народни и класически детски — думите, които всяка баба знае, а
  // недоспалата мама забравя точно в 3 часа.
  const ОЩЕ_ПЕСНИ = {
    'Спи, зайче, спи 🐇': 'Спи, зайче, спи,\nочички затвори.\nМама е до теб,\nнищо не боли.\n\nЛуната пази двора,\nзвездите пазят теб.\nУтре пак ще тичаш\nиз тревата с мен. 🌙',
    'Валят снежинки ❄️': 'Валят, валят снежинки,\nбели като брашно.\nПадат по перваза,\nчукат на прозорче.\n\nТопло е в къщичката,\nтопло е при мен.\nСпинкай, мое зайче —\nсняг вали навън. ❄️',
    'Мечо Пух заспива 🐻': 'Мечо Пух се сгуши\nв топлото легло.\nБурканче с меденце\nстои до него, о!\n\nСпинкай, мечо, спинкай,\nутре пак гора.\nМоето мече също\nзатваря очи сега. 🍯',
    'Едно, две, три 🔢': 'Едно, две, три —\nмама е при мен.\nЧетири и пет —\nтопъл ми е денят.\n\nШест, седем, осем —\nсънчо чука вече.\nДевет и десет —\nлека нощ, човече! 💫',
    'Дъждец вали 🌧️': 'Кап-кап, кап-кап,\nдъждец по покрива.\nКап-кап, кап-кап,\nпесен ни свири.\n\nНие сме на топло,\nмокро е навън.\nКап-кап приспива —\nтръгва вече сън. ☔',
    'Кой е моят мъник? 💛': 'Кой е моят мъник,\nмоят сладък мъник?\nТой е тук, до мене,\nмоят топъл мъник.\n\nНосле като копче,\nпръстчета — цветя.\nЦелият е чудо,\nцелият е мечта. 💛',
    'Тръгва си денят 🌇': 'Тръгва си денят,\nмаха ни с ръка.\nБлагодарим му тихо\nза добрата дума.\n\nИдва си нощта\nс мека си шапка.\nСпинкай, моя обич —\nутре пак ще светне. 🌅'
  };

  // ═══════════ 🎤 12.5.4 МАМИНИЯТ ГЛАС ═══════════
  // Роботът чете, ако мама няма сили. Но собственият ѝ глас е нещо
  // друго — записва се веднъж и стои. Ако мама не е в стаята,
  // бебето пак я чува.
  const ЗАПИСИ = 'bl_lull_rec';
  const записите = () => load(ЗАПИСИ, {});
  const имаЗапис = п => !!записите()[п];

  function записвачка(име, наИзход) {
    const кутия = el('div', 'lr-box');
    let рекордер = null, парчета = [], тече = false, тик = null, сек = 0;
    const бутон = el('button', 'jr-chip', '🎤 Запиши моя глас'); бутон.type = 'button';
    const бел = el('span', 'lr-note', '');
    кутия.appendChild(бутон); кутия.appendChild(бел);

    function рисувай() {
      const има = имаЗапис(име);
      кутия.querySelectorAll('.lr-extra').forEach(x => x.remove());
      if (има && !тече) {
        const пусни = el('button', 'jr-chip lr-extra', '▶️ Пусни моя глас'); пусни.type = 'button';
        // 🚨 22.07 (армия): „⏹️ Спри“ НЕ спираше. Първият слушател оставаше
        //   закачен завинаги, а „спри“ се добавяше ВТОРИ — при второто
        //   докосване се изпълняваха и двата: първо тръгваше НОВО аудио, после
        //   се паузираше старото. Надписът се връщаше на „▶️ Пусни“, а гласът
        //   свиреше на loop — и продължаваше след напускане на стаята.
        //   Един слушател, една референция, истинско спиране.
        let текущо = null;
        const сприВсичко = () => {
          if (текущо) { try { текущо.pause(); текущо.currentTime = 0; } catch (e) {} текущо = null; }
          пусни.textContent = '▶️ Пусни моя глас';
        };
        пусни.addEventListener('click', () => {
          if (текущо) { сприВсичко(); return; }        // второ докосване = стоп
          const a = new Audio(записите()[име]);
          текущо = a;
          a.loop = true;                          // приспивната се върти, докато бебето заспи
          a.play().catch(() => {});
          // 10.4.4: заключеният екран. Обикновено аудиото спира, щом мама
          // заключи телефона и го сложи до бебето. Media Session казва на
          // системата „това е свирене“ — така продължава и се появяват
          // контроли на заключения екран (пауза/спри), без да будиш никого.
          if ('mediaSession' in navigator) {
            try {
              navigator.mediaSession.metadata = new MediaMetadata({
                title: 'Приспивна с гласа на мама 🎤',
                artist: 'Помощникът на мама', album: име
              });
              navigator.mediaSession.setActionHandler('pause', () => { a.pause(); navigator.mediaSession.playbackState = 'paused'; });
              navigator.mediaSession.setActionHandler('play', () => { a.play().catch(() => {}); navigator.mediaSession.playbackState = 'playing'; });
              navigator.mediaSession.setActionHandler('stop', () => { сприВсичко(); });
              navigator.mediaSession.playbackState = 'playing';
            } catch (e) {}
          }
          // спиране с второ докосване — през единствения слушател отгоре
          пусни.textContent = '⏹️ Спри';
          a.addEventListener('ended', сприВсичко);      // ако loop-ът бъде махнат отвън
          // и ако мама излезе от стаята, гласът не остава да свири в празното
          new MutationObserver((_, наб) => {
            if (!document.body.contains(пусни)) { сприВсичко(); наб.disconnect(); }
          }).observe(document.body, { childList: true, subtree: true });
        });
        const трий = el('button', 'jr-chip lr-extra', '🗑️'); трий.type = 'button';
        трий.title = 'Изтрий записа';
        трий.addEventListener('click', () => {
          const з = записите(); delete з[име]; save(ЗАПИСИ, з); рисувай();
        });
        кутия.appendChild(пусни); кутия.appendChild(трий);
        бел.textContent = 'Записът е тук, на телефона ти. Никъде другаде.';
      } else if (!тече) {
        бел.textContent = 'Изпей я веднъж — после бебето може да те чуе и когато не си до него.';
      }
      бутон.textContent = тече ? '⏹️ Спри (' + сек + 'с)' : (има ? '🎤 Запиши наново' : '🎤 Запиши моя глас');
    }

    бутон.addEventListener('click', async () => {
      if (тече) { спри(); return; }
      if (!navigator.mediaDevices || !window.MediaRecorder) {
        бел.textContent = 'Този телефон не позволява запис от приложението. Роботчето долу пак чете. 💜';
        return;
      }
      let поток;
      try { поток = await navigator.mediaDevices.getUserMedia({ audio: true }); }
      catch (e) { бел.textContent = 'Микрофонът не е позволен. Ако размислиш — от настройките на браузъра.'; return; }
      парчета = []; сек = 0; тече = true;
      рекордер = new MediaRecorder(поток);
      рекордер.ondataavailable = e => { if (e.data && e.data.size) парчета.push(e.data); };
      рекордер.onstop = () => {
        поток.getTracks().forEach(t => t.stop());
        const блоб = new Blob(парчета, { type: рекордер.mimeType || 'audio/webm' });
        // 🚨 базата е localStorage — дълъг запис я пука. 2 минути стигат
        //    за приспивна и се събират спокойно.
        if (блоб.size > 3.5 * 1024 * 1024) {
          тече = false; бел.textContent = 'Записът стана твърде дълъг за телефона. Пробвай пак — до две минути.'; рисувай(); return;
        }
        const чт = new FileReader();
        чт.onload = () => {
          const з = записите(); з[име] = чт.result;
          try { save(ЗАПИСИ, з); } catch (e) {}
          тече = false; рисувай(); fx().cheer('Гласът ти е запазен. 💜'); if (наИзход) наИзход();
        };
        чт.readAsDataURL(блоб);
      };
      рекордер.start();
      тик = setInterval(() => { сек++; рисувай(); if (сек >= 120) спри(); }, 1000);
      // 🎤 22.07 (армия): ако мама излезе от стаята по време на запис,
      //   микрофонът оставаше отворен до 2 минути (лампичката свети, а тя
      //   мисли, че е спряла). Напускането спира записа веднага.
      new MutationObserver((_, наб) => {
        if (!document.body.contains(кутия)) { спри(); наб.disconnect(); }
      }).observe(document.body, { childList: true, subtree: true });
      рисувай();
    });
    function спри() {
      if (тик) { clearInterval(тик); тик = null; }
      try { if (рекордер && рекордер.state !== 'inactive') рекордер.stop(); } catch (e) {}
    }
    рисувай();
    return кутия;
  }

  // Обвивам картата с песничките: добавям новите текстове и записвачката,
  // без да пипам extras2.js. Оригиналът рисува чиповете от СВОЯ SONGS —
  // затова слагам моите чипове след неговите, в същия ред.
  function картаПесни() {
    const c = card('Още песнички 🎵 <span class="jr-sub">седем към трите — и твоят глас, ако искаш</span>');
    const ред = el('div', 'jr-quick');
    const изход = el('div', 'lul-out');
    Object.keys(ОЩЕ_ПЕСНИ).forEach(име => {
      const b = el('button', 'jr-chip', име + (имаЗапис(име) ? ' 🎤' : '')); b.type = 'button';
      b.addEventListener('click', () => {
        ред.querySelectorAll('.jr-chip').forEach(x => x.classList.remove('on'));
        b.classList.add('on');
        изход.innerHTML = '';
        const т = el('div', 'lul-text pop',
          ОЩЕ_ПЕСНИ[име].split('\n').map(l => l ? '<p>' + esc(l) + '</p>' : '<br>').join(''));
        изход.appendChild(т);
        изход.appendChild(записвачка(име, () => {
          b.textContent = име + (имаЗапис(име) ? ' 🎤' : '');
        }));
        const робот = el('button', 'jr-chip', '🔊 Изпей я вместо мен'); робот.type = 'button';
        робот.addEventListener('click', () => {
          try {
            speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(ОЩЕ_ПЕСНИ[име].replace(/\n/g, ', '));
            u.lang = 'bg-BG'; u.rate = 0.78; u.pitch = 1.15;
            speechSynthesis.speak(u);
          } catch (e) {}
        });
        изход.appendChild(робот);
      });
      ред.appendChild(b);
    });
    c.appendChild(ред); c.appendChild(изход);
    return c;
  }

  // ═══════════ 👶 12.5.5 ИГРИТЕ ЗА БЕБЕТО ═══════════
  // 🚨 Правило, което не се нарушава: под ~18 месеца екранът не учи нищо.
  //    Затова тези три са КРАТКИ, без точки, без нива, без „още едно“ —
  //    и картата го казва честно на мама, вместо да я примамва.
  const ЧБ = [['🎯', 'Кръгове'], ['🏁', 'Шахмат'], ['🌀', 'Спирала'], ['➕', 'Кръст'], ['👀', 'Лице']];
  function чбКартинка(i) {
    // Новороденото вижда контраст, не цвят. Затова е черно-бяло и едро.
    const св = ['#fff', '#000'];
    if (i === 0) return `<rect width="100" height="100" fill="#fff"/>` +
      [40, 32, 24, 16, 8].map((r, k) => `<circle cx="50" cy="50" r="${r}" fill="${св[k % 2]}"/>`).join('');
    if (i === 1) { let s = ''; for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) s += `<rect x="${x * 20}" y="${y * 20}" width="20" height="20" fill="${св[(x + y) % 2]}"/>`; return s; }
    if (i === 2) {
      let d = 'M50,50 ';
      for (let t = 0; t < 40; t++) { const a = t * 0.45, r = t * 1.15; d += `L${(50 + Math.cos(a) * r).toFixed(1)},${(50 + Math.sin(a) * r).toFixed(1)} `; }
      return `<rect width="100" height="100" fill="#fff"/><path d="${d}" stroke="#000" stroke-width="4.5" fill="none"/>`;
    }
    if (i === 3) return `<rect width="100" height="100" fill="#fff"/><rect x="42" y="8" width="16" height="84" fill="#000"/><rect x="8" y="42" width="84" height="16" fill="#000"/>`;
    return `<rect width="100" height="100" fill="#fff"/>
      <circle cx="50" cy="50" r="40" fill="none" stroke="#000" stroke-width="5"/>
      <circle cx="36" cy="42" r="7" fill="#000"/><circle cx="64" cy="42" r="7" fill="#000"/>
      <path d="M34,64 Q50,76 66,64" stroke="#000" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  }
  function картаБебе() {
    // 🔴 г13/57: подзаглавието твърдеше „не са екранно време“ за три неща, които
    //   СА екран, а прагът беше „година и половина“ срещу „до 2 години“ в базата
    //   (kb.js, rz-ekran) и в чата. Без отричането и с единия праг.
    const c = card('Три неща за бебето 👶 <span class="jr-sub">по минутка, с теб</span>');
    c.appendChild(el('p', 'cs-note',
      'Честно: до 2 години екранът не учи бебето на нищо — мозъкът му не прехвърля наученото оттам в истинския свят. ' +
      'Затова тук няма точки и няма „още едно ниво“. Три кратки неща, за когато ти трябват. 💜'));

    const ред = el('div', 'jr-quick');
    // 1) черно-бели картинки
    const к1 = el('button', 'jr-chip', '⬛ Черно-бели картинки'); к1.type = 'button';
    к1.addEventListener('click', () => {
      const ов = el('div', 'bg-overlay');
      let i = 0;
      const рисувай = () => {
        ов.innerHTML = `<svg viewBox="0 0 100 100" class="bg-svg">${чбКартинка(i)}</svg>
          <div class="bg-bar"><button class="jr-chip" data-a="p" type="button" aria-label="Предишната картинка">‹</button>
          <span aria-live="polite">${ЧБ[i][1]} · ${i + 1}/${ЧБ.length}</span>
          <button class="jr-chip" data-a="n" type="button" aria-label="Следващата картинка">›</button>
          <button class="jr-chip" data-a="x" type="button" aria-label="Затвори картинките">✕</button></div>`;
        ов.querySelectorAll('[data-a]').forEach(b => b.addEventListener('click', () => {
          const a = b.dataset.a;
          if (a === 'x') { ов.remove(); return; }
          i = (i + (a === 'n' ? 1 : ЧБ.length - 1)) % ЧБ.length; рисувай();
        }));
      };
      document.body.appendChild(ов); рисувай();
    });
    // 2) звуци
    const к2 = el('button', 'jr-chip', '🔔 Звуци'); к2.type = 'button';
    к2.addEventListener('click', () => {
      const ов = el('div', 'bg-overlay bg-sounds');
      const З = [['🐄', 'Мууу'], ['🐕', 'Бау-бау'], ['🐈', 'Мяу'], ['🐓', 'Кукуригу'],
                 ['🐑', 'Бее'], ['🐸', 'Ква-ква'], ['🚗', 'Бррр'], ['🔔', 'Дзън']];
      ов.innerHTML = `<div class="bg-sgrid">${З.map(([e, з]) =>
        `<button class="bg-sbtn" type="button" data-z="${esc(з)}" aria-label="${esc(з)}"><span>${e}</span></button>`).join('')}</div>
        <div class="bg-bar"><span id="bgSay" aria-live="polite">Пипни животинка</span>
        <button class="jr-chip" id="bgX" type="button" aria-label="Затвори звуците">✕</button></div>`;
      ов.querySelectorAll('.bg-sbtn').forEach(b => b.addEventListener('click', () => {
        const з = b.dataset.z;
        ов.querySelector('#bgSay').textContent = з + '!';
        b.classList.add('pop'); setTimeout(() => b.classList.remove('pop'), 260);
        try {
          speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(з); u.lang = 'bg-BG'; u.rate = 0.75; u.pitch = 1.4;
          speechSynthesis.speak(u);
        } catch (e) {}
        fx().buzz(8);
      }));
      ов.querySelector('#bgX').addEventListener('click', () => ов.remove());
      document.body.appendChild(ов);
    });
    // 3) огледало
    const к3 = el('button', 'jr-chip', '🪞 Огледало'); к3.type = 'button';
    к3.addEventListener('click', async () => {
      if (!navigator.mediaDevices) { fx().cheer('Този телефон не дава камерата на приложението.'); return; }
      let поток;
      try { поток = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } }); }
      catch (e) { fx().cheer('Камерата не е позволена — от настройките на браузъра, ако размислиш.'); return; }
      const ов = el('div', 'bg-overlay bg-mirror');
      const в = document.createElement('video');
      в.autoplay = true; в.playsInline = true; в.muted = true; в.srcObject = поток;
      ов.appendChild(в);
      const бар = el('div', 'bg-bar', '<span>Бебето се вижда 👋</span>');
      const x = el('button', 'jr-chip', '✕'); x.type = 'button';
      // ♿ 11.08 (клавиатура-четец): това е ЕДИНСТВЕНИЯТ изход от огледалото и
      //    той се казваше само „✕" — камерата остава да свети, ако не се намери.
      x.setAttribute('aria-label', 'Затвори огледалото и спри камерата');
      x.addEventListener('click', () => { поток.getTracks().forEach(t => t.stop()); ов.remove(); });
      бар.appendChild(x); ов.appendChild(бар);
      // 🚨 камерата ТРЯБВА да спре и ако мама просто затвори стаята
      ов._спри = () => поток.getTracks().forEach(t => t.stop());
      document.body.appendChild(ов);
      // ако мама затвори стаята, без да натисне ✕, лампичката оставаше да
      // свети — камерата умира и когато оверлеят изчезне от екрана
      new MutationObserver((_, наб) => {
        if (!document.body.contains(ов)) { ов._спри(); наб.disconnect(); }
      }).observe(document.body, { childList: true });
    });
    ред.appendChild(к1); ред.appendChild(к2); ред.appendChild(к3);
    c.appendChild(ред);
    c.appendChild(el('p', 'jr-privacy', '🔒 Камерата не записва нищо и не отива никъде — образът стои само на екрана.'));
    return c;
  }

  // ═══════════ 🎈 12.5.1 БАЛОНЧЕТО В ТЕЖКИЯ МОМЕНТ ═══════════
  // Не изскача. ПОКАНВА — малка лента долу, която мама може да махне.
  // И най-много веднъж на ден, за да не стане досадна.
  const ПОКАНА = 'bl_bub_offer';
  function поканиБалонче(защо) {
    if (изключени()) return;
    const днес = new Date().toISOString().slice(0, 10);
    if (load(ПОКАНА, '') === днес) return;
    if (document.getElementById('bubOffer')) return;
    save(ПОКАНА, днес);

    const л = el('div', 'bo-bar'); л.id = 'bubOffer';
    л.innerHTML = `<span class="bo-t">${esc(защо)}</span>
      <button class="jr-chip bo-yes" type="button">🎈 30 секунди</button>
      <button class="bo-no" type="button" aria-label="Не сега">✕</button>`;
    document.body.appendChild(л);
    requestAnimationFrame(() => л.classList.add('on'));
    const махни = () => { л.classList.remove('on'); setTimeout(() => л.remove(), 240); };
    л.querySelector('.bo-no').addEventListener('click', махни);
    л.querySelector('.bo-yes').addEventListener('click', () => {
      махни();
      пуснБалонче();
    });
    setTimeout(() => { if (document.getElementById('bubOffer')) махни(); }, 22000);
  }

  // Балончето е локална функция в extras2.js — не мога да я извикам.
  // Затова намирам НЕГОВИЯ бутон и го натискам. Ако картата не е на
  // екрана, отварям Дневника и чак тогава.
  function пуснБалонче() {
    const намери = () => [...document.querySelectorAll('.jr-card')].find(c =>
      (c.querySelector('.jr-title') || {}).textContent && c.querySelector('.jr-title').textContent.includes('Пукни балончето'));
    const к = намери();
    if (к) { к.querySelector('.jr-btn').click(); return; }
    if (window.MamaHelper) {
      MamaHelper.open('Дневник на мама');
      setTimeout(() => { const к2 = намери(); if (к2) к2.querySelector('.jr-btn').click(); }, 500);
    }
  }

  // ═══════════ свързване ═══════════
  // ⚠️ Бях ги сложил в Дневника — а оригиналните приспивни са в „Развитие
  //    и игри“ (extras2.js:338). Мама щеше да има три песни в едната стая
  //    и седем в другата. Всичко за бебето отива при бебешките неща.
  const базаРазвитие = window.ROOM_FEATURES && window.ROOM_FEATURES['Развитие и игри'];
  if (базаРазвитие) window.ROOM_FEATURES['Развитие и игри'] = root => {
    базаРазвитие(root);
    // 22.07 (армия): ключът обещаваше „картите остават скрити“, а те се
    //   показваха най-спокойно — скриваше се само балончето. Сега обещанието
    //   е вярно: при изключени игри остава САМО самият ключ, за да може мама
    //   да ги върне.
    if (!изключени()) {
      root.appendChild(картаПесни());
      root.appendChild(картаБебе());
    }
    root.appendChild(картаКлюч());
  };

  window.BL_GAMES2 = { покани: поканиБалонче, балонче: пуснБалонче, изключени, ПЕСНИ: ОЩЕ_ПЕСНИ };
})();
