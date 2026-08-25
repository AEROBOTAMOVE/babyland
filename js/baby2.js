// ═══════════════════════════════════════════════════════════
// 🍼🍼 ВТОРОТО СЪКРОВИЩЕ (Д6, безопасната версия)
//
// Owner: „второ бебе е опцията, която ВСИЧКИ ще имат и галантно ще им се
// предлага някъде — трябва да се намери точното място.“
//
// Точните места: 1) Профилът (главното) 2) стая „Моето бебе“ (тиха карта).
// БЕЗОПАСНО: второто бебе получава СВОЙ профил (име, дата, пол), своя
// възраст, свои ваксини по СВОЯ дата. Записите на стаите (тегло, сън,
// зъбки) НЕ се пипат и не се пренасочват — нула риск за първото бебе.
// Без обещания за „пълно разделяне после“ — казваме честно какво е.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { if (window.BL_ZAPIS_PADNA) BL_ZAPIS_PADNA(); return false; } return true; };
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const card = t => { const c = el('section', 'jr-card'); c.appendChild(el('h4', 'jr-title', t)); return c; };
  const sub = s => '<span class="jr-sub">' + s + '</span>';
  const fx = () => window.BL_FX || { confetti() {}, cheer() {}, buzz() {} };

  const второ = () => load('bl_baby2', {});
  // 🍼 11.08 (обиколка като майка на близнаци): има() искаше НЕПРАЗНО ИМЕ, а
  //    формата отказваше да запише без него („Само името липсва 💛“). Второто
  //    дете — още некръстено, или „🤰 чакаме го“, където име често още няма —
  //    просто не съществуваше за приложението: нито възраст, нито свои ваксини,
  //    нито ред в профила. Записът важи, щом има КАКВОТО И ДА Е от него: име,
  //    дата или деня, в който мама го е добавила.
  const има = () => { const в = второ(); return !!((в.name || '').trim() || в.birth || в.d); };
  const имеИли = по => ((второ().name || '').trim() || по);
  window.BL_BABY2 = { get: второ, has: има, име: имеИли };

  // ── формата: добавяне на второто съкровище (в самата карта) ──
  function форма(готово) {
    const w = el('div', 'b2-form');
    const име = el('input', 'jr-word'); име.placeholder = 'Как се казва?'; име.maxLength = 24;
    const дата = el('input', 'jr-word'); дата.type = 'date';
    // ♿ 11.08 (клавиатура-четец): полето за дата няма подсказка (браузърът не я
    //    показва при type=date) — четецът го обявяваше само като „поле за дата".
    //    До него стои „Как се казва?" и мама не разбираше чия дата се иска.
    дата.setAttribute('aria-label', 'Рождена дата (или очаквана)');
    const пол = el('div', 'b2-sex');
    let избран = 'girl';
    [['girl', '👧 момиче'], ['boy', '👦 момче'], ['wait', '🤰 чакаме го']].forEach(([v, т]) => {
      const b = el('button', 'jr-chip' + (v === избран ? ' b2-on' : ''), т); b.type = 'button';
      b.addEventListener('click', () => { избран = v; пол.querySelectorAll('.jr-chip').forEach(x => x.classList.remove('b2-on')); b.classList.add('b2-on'); });
      пол.appendChild(b);
    });
    const добави = el('button', 'jr-btn', '🍼 Добави го при нас'); добави.type = 'button';
    const греш = el('p', 'prof-err');
    добави.addEventListener('click', () => {
      const n = име.value.trim();
      // името може още да го няма (некръстено или още го чакате) — стига едното
      if (!n && !дата.value) { греш.textContent = 'Стига ми името ИЛИ датата — което вече имате 💛'; return; }
      save('bl_baby2', { name: n.slice(0, 24), birth: дата.value || '', sex: избран, d: new Date().toISOString().slice(0, 10) });
      fx().confetti(); fx().cheer('Добре дошло, ' + (n || 'съкровище') + '! 🎉');
      if (готово) готово();
    });
    w.appendChild(име); w.appendChild(дата); w.appendChild(пол); w.appendChild(добави); w.appendChild(греш);
    return w;
  }
  window.BL_BABY2.форма = форма;

  // ── картата в „Моето бебе“ ──
  function картаВторо() {
    const b2 = второ();

    if (!има()) {
      // галантното предложение — тихо, без натиск
      const c = card('Още едно съкровище? 🍼 ' + sub('ако у дома растат две'));
      c.appendChild(el('p', 'jr-privacy',
        'Ако имаш още едно дете — или то е на път — добави го тук. Ще има своя възраст, свои ваксини по своята дата, и профилът ще знае за двете.'));
      const б = el('button', 'jr-chip', '➕ Добави второ съкровище'); б.type = 'button';
      const място = el('div');
      б.addEventListener('click', () => { б.hidden = true; място.appendChild(форма(() => { място.innerHTML = ''; c.replaceWith(картаВторо()); })); });
      c.appendChild(б); c.appendChild(място);
      return c;
    }

    const имеИма = !!(b2.name || '').trim();
    const c = card((имеИма ? esc(b2.name) : 'Второто съкровище') + ' 🍼 ' +
      sub(имеИма ? 'второто съкровище' : 'още без име — добави го, когато решите'));
    if (b2.birth) {
      const a = window.BL_AGE ? BL_AGE(b2.birth) : null;
      const дни = Math.max(0, Math.floor((new Date() - new Date(b2.birth)) / 86400000));
      // BL_AGE връща .text („14 месеца и 3 дни"), НЕ .label — старото винаги
      // падаше на „N дни" (одит-флот П23, проход 2 №4)
      if (a && дни >= 0) c.appendChild(el('p', 'b2-age', '🎂 ' + (a.text || (дни + ' дни')) + ' · заедно от <strong>' + дни + '</strong> ' + (дни === 1 ? 'ден' : 'дни')));
      // ваксините ПО НЕГОВАТА дата — със същия внимателен календар
      if (window.BL_VACCINES && window.BL_DATE && BL_DATE.addMonths) {
        const днес = new Date(); днес.setHours(0, 0, 0, 0);
        const следваща = BL_VACCINES.map(v => ({ v, кога: BL_DATE.addMonths(new Date(b2.birth), v.m) }))
          .filter(x => x.кога >= днес).sort((x, y) => x.кога - y.кога)[0];
        if (следваща) {
          const д = следваща.кога;
          c.appendChild(el('p', 'b2-vac', '💉 Следваща ваксина: <strong>' + esc(следваща.v.n) + '</strong> — около ' +
            д.getDate() + '.' + String(д.getMonth() + 1).padStart(2, '0') + '.' + д.getFullYear() +
            (следваща.v.d ? ' <small>(' + esc(следваща.v.d) + ')</small>' : '')));
        } else c.appendChild(el('p', 'b2-vac', '💉 Календарните ваксини по възраст са минали — нататък казва педиатърът.'));
      }
    } else c.appendChild(el('p', 'b2-age', '🤰 Още го чакаме. Като се роди — добави датата, и възрастта с ваксините тръгват сами.'));

    // честното — без да обещаваме
    c.appendChild(el('p', 'jr-privacy',
      'Записите в стаите (тегло, сън, зъбки, храни) са едни — не се делят по деца. Възрастта и ваксините тук са само за ' + (имеИма ? esc(b2.name) : 'второто дете') + '.'));

    const ред = el('div', 'jr-addrow');
    // ── „Промени": инлайн поле, НЕ системен prompt ──
    // 🔴 25.08 — какво имаше тук и защо беше счупено на ДВЕ места:
    //   1) Два сурови prompt(). В режим „приложение" (иконка на екрана)
    //      системната кутия на част от телефоните ИЗОБЩО не се показва —
    //      мама натиска „Промени" и не се случва нищо. Същото е записано в
    //      js/rooms17.js и js/wisdom2.js, където вече е поправено по този
    //      модел; тази карта е останала последната със сурови prompt-ове.
    //   2) По-тежкото: датата се пишеше на ръка и минаваше през
    //      /^\d{4}-\d{2}-\d{2}$/. Напише ли мама „25.08.2026" или „2026-8-5",
    //      проверката не пасва и полето става ПРАЗНО — рождената дата на
    //      второто дете се ИЗТРИВА без нито една дума, а с нея изчезват
    //      възрастта и целият ваксинационен календар. Тя е натиснала
    //      „промени име", а е загубила датата.
    //   Полето type=date маха и двата проблема наведнъж: календарът на
    //   телефона не връща невалиден формат, така че няма какво да се изтрие.
    // ПЪТ НАЗАД: блокът е самостоятелен; връщането на двата prompt-а
    //   възстановява точно старото поведение.
    const ред1 = el('button', 'jr-chip', '✏️ Промени'); ред1.type = 'button';
    ред1.addEventListener('click', () => {
      const старо = c.querySelector('.b2-edit');
      if (старо) { старо.remove(); ред1.setAttribute('aria-expanded', 'false'); return; }   // втори тап затваря
      ред1.setAttribute('aria-expanded', 'true');
      const w = el('div', 'b2-edit b2-form');

      const име = el('input', 'jr-word');
      име.placeholder = 'Как се казва?'; име.maxLength = 24; име.value = b2.name || '';
      име.setAttribute('aria-label', 'Име на второто дете');

      const дата = el('input', 'jr-word'); дата.type = 'date';
      дата.value = /^\d{4}-\d{2}-\d{2}$/.test(b2.birth || '') ? b2.birth : '';
      дата.setAttribute('aria-label', 'Рождена дата (или очаквана)');

      const пол = el('div', 'b2-sex');
      let избран = b2.sex || 'girl';
      [['girl', '👧 момиче'], ['boy', '👦 момче'], ['wait', '🤰 чакаме го']].forEach(([v, т]) => {
        const b = el('button', 'jr-chip' + (v === избран ? ' b2-on' : ''), т); b.type = 'button';
        b.addEventListener('click', () => { избран = v; пол.querySelectorAll('.jr-chip').forEach(x => x.classList.remove('b2-on')); b.classList.add('b2-on'); });
        пол.appendChild(b);
      });

      const греш = el('p', 'prof-err');
      const запази = el('button', 'jr-btn', '💾 Запази'); запази.type = 'button';
      const откажи = el('button', 'jr-chip', 'Откажи'); откажи.type = 'button';
      откажи.addEventListener('click', () => { w.remove(); ред1.setAttribute('aria-expanded', 'false'); ред1.focus(); });

      запази.addEventListener('click', () => {
        const n = име.value.trim();
        // същото правило като при добавянето: стига ЕДНОТО от двете
        if (!n && !дата.value) { греш.textContent = 'Стига ми името ИЛИ датата — което вече имате 💛'; return; }
        // 🪤 запазваме ОСТАНАЛИТЕ полета (sex, d — деня на добавяне), иначе
        //    „промених само името" изтрива кога сме се запознали с него
        save('bl_baby2', Object.assign({}, b2, { name: n.slice(0, 24), birth: дата.value || '', sex: избран }));
        fx().cheer('Записано 💜');
        c.replaceWith(картаВторо());
      });

      const бут = el('div', 'jr-addrow');
      бут.appendChild(запази); бут.appendChild(откажи);
      w.appendChild(име); w.appendChild(дата); w.appendChild(пол); w.appendChild(бут); w.appendChild(греш);
      c.appendChild(w);
      try { име.focus(); } catch (e) {}
    });
    const ред2 = el('button', 'jr-chip', '🗑 Премахни'); ред2.type = 'button';
    ред2.addEventListener('click', () => {
      const питай = window.BL_UI ? BL_UI.confirm('Да премахна ли профила на ' + (b2.name || 'второто бебе') + '?', { title: 'Премахване', emoji: '🍼', okText: 'Премахни', cancelText: 'Остави', danger: true, text: 'Профилът се маха. Записите в стаите не се пипат.' })
        : Promise.resolve(confirm('Да премахна ли профила на ' + (b2.name || 'второто бебе') + '?'));
      питай.then(да => { if (!да) return; localStorage.removeItem('bl_baby2'); c.replaceWith(картаВторо()); });
    });
    ред.appendChild(ред1); ред.appendChild(ред2);
    c.appendChild(ред);
    return c;
  }

  const база = window.ROOM_FEATURES && window.ROOM_FEATURES['Моето бебе'];
  if (база) window.ROOM_FEATURES['Моето бебе'] = root => { база(root); root.appendChild(картаВторо()); };
})();
