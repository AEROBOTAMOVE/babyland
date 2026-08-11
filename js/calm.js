// ═══════════════════════════════════════════════════════════
// ИГРИТЕ ЗА МАМА (план 19, част 12.5.2) — в Дневника
//
// 🫁 Дишай с формата — воден дъх, който тялото следва (4-7-8)
// 🧠 Подреди мислите — изпразваш главата, приложението подрежда
//
// Не са игри за забавление. Те са инструменти за момента, в който всичко е
// много. Затова са в Дневника — стаята за МАМА, не за бебето.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';

  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const card = t => { const c = el('section', 'jr-card'); c.appendChild(el('h4', 'jr-title', t)); return c; };
  const sub = s => '<span class="jr-sub">' + s + '</span>';

  // ═══════════ 🫁 ДИШАЙ С ФОРМАТА (4-7-8) ═══════════
  function breatheCard() {
    // 🔴 05.08 (одит г08, №273): пишеше „30 секунди“, а три кръга 4-7-8 са
    //    почти минута (57 с) — мама започваше с половин минута наум и оставаше
    //    с недовършено упражнение. И „за да падне пулсът“ е физиологично
    //    твърдение като факт, без произход.
    const c = card('Дишай с формата 🫁 ' + sub('около минута, когато е много'));
    c.appendChild(el('p', 'jr-privacy',
      'Кръгът расте — вдишай. Спира — задръж. Смалява се — издишай бавно. Три пъти обикновено стигат, за да усетиш, че тялото ти слиза с едно стъпало.'));
    const box = el('div', 'br-stage');
    box.innerHTML = '<div class="br-circle"><span class="br-word">Готова?</span></div>';
    c.appendChild(box);
    const b = el('button', 'jr-btn', '▶️ Дишай с мен'); b.type = 'button';
    let running = false;
    b.addEventListener('click', () => {
      if (running) return;
      running = true; b.textContent = 'Дишай…';
      const кръг = box.querySelector('.br-circle');
      const дума = box.querySelector('.br-word');
      let цикъл = 0;
      const фаза = (клас, текст, ms) => new Promise(res => {
        кръг.className = 'br-circle ' + клас;
        дума.textContent = текст;
        setTimeout(res, ms);
      });
      (async () => {
        while (цикъл < 3) {
          await фаза('br-in', 'Вдишай…', 4000);
          await фаза('br-hold', 'Задръж…', 7000);
          await фаза('br-out', 'Издишай…', 8000);
          цикъл++;
        }
        кръг.className = 'br-circle';
        дума.textContent = 'Браво. 🤍';
        running = false; b.textContent = '▶️ Пак';
      })();
    });
    c.appendChild(b);
    return c;
  }

  // ═══════════ 🧠 ПОДРЕДИ МИСЛИТЕ ═══════════
  // Изсипваш всичко, приложението го разделя на „сега / после / пусни го“.
  function brainDumpCard() {
    const c = card('Подреди мислите 🧠 ' + sub('изсипи главата — аз ще подредя'));
    c.appendChild(el('p', 'jr-privacy',
      // 🔴 05.08 (одит г08, №272): обещанието беше безусловно — „Нищо не се
      //    записва.“ — а накрая се появява бутон, който наистина записва
      //    „Сега“-задачите в бележките (и после излизат в Реката). Мама
      //    изсипваше най-личното с една увереност и виждаше друго.
      'Напиши всичко, което ти се върти — по едно на ред. После за всяко избери: <strong>сега</strong>, <strong>после</strong> или <strong>пусни го</strong>. Нищо не се записва — освен ако ти сама не натиснеш бутона накрая.'));
    const t = el('textarea', 'jr-paper'); t.rows = 4;
    t.placeholder = 'пране\nда звънна на лекаря\nзабравих да ям\n…';
    c.appendChild(t);
    const b = el('button', 'jr-btn', '📥 Подреди'); b.type = 'button';
    const out = el('div', 'bd-out');
    b.addEventListener('click', () => {
      const редове = t.value.split('\n').map(x => x.trim()).filter(Boolean);
      // 🔴 12.08 (обиколка на телефона, ИЗМЕРЕНО): натиснах „📥 Подреди“ с празно
      //    поле — не стана НИЩО. Нито съобщение, нито курсор в полето, нито дори
      //    вибрация. Пазачът в polish.js (тихият отказ) не хваща този бутон: той
      //    не стои в .jr-addrow, а надписът „Подреди“ не е в списъка му с думи.
      //    А това е картата за момента, в който всичко е много — точно тогава
      //    мълчаливият бутон се чете като „и приложението ме отряза“.
      //    ПЪТ НАЗАД: върни голото `if (!редове.length) return;`.
      if (!редове.length) {
        out.innerHTML = '';
        out.appendChild(el('p', 'jr-privacy', 'Полето е празно — напиши ги едно под друго, по едно на ред. Дори две неща стигат. 🤍'));
        out.firstChild.setAttribute('role', 'status');
        try { t.focus({ preventScroll: true }); } catch (e) { try { t.focus(); } catch (e2) {} }
        if (window.BL_FX) BL_FX.buzz(6);
        return;
      }
      out.innerHTML = '';
      const кофи = { сега: [], после: [], пусни: [] };
      const rerender = () => {
        out.innerHTML = '';
        [['сега', '🔴 Сега (днес)'], ['после', '🟡 После (тази седмица)'], ['пусни', '⚪ Пусни го (не е важно)']].forEach(([k, л]) => {
          if (!кофи[k].length) return;
          const g = el('div', 'bd-bucket');
          g.innerHTML = '<p class="bd-h">' + л + '</p>';
          кофи[k].forEach(x => g.appendChild(el('p', 'bd-item', '• ' + esc(x))));
          out.appendChild(g);
        });
        if (!чакащи.length) {
          out.appendChild(el('p', 'jr-privacy', 'Готово. Виждаш ли — не бяха толкова много. 🤍'));
          // проход 4: упражнението пуска багажа, но реалните „Сега"-задачи не бива да
          // изчезнат в нищото — по избор ги задържаме в бележките (иначе — нищо).
          if (кофи.сега.length && out.dataset.kept !== '1') {
            // 🟠 11.08 (обиколка като майка): бутонът казваше само „в бележките“
            //    и потвърждаваше „Записани в бележките“ — а редовете отиват в
            //    bl_notes_tools, тоест в ДРУГА стая (🧰 Инструменти → Бележки).
            //    Мама ги търсеше в дневника и не ги намираше. Казваме къде.
            const b = el('button', 'jr-btn', '📌 Задръж само „Сега“ в бележките (🧰 Инструменти)'); b.type = 'button';
            b.addEventListener('click', () => {
              const н = load('bl_notes_tools', []);
              кофи.сега.forEach(x => н.push({ t: x.slice(0, 120), d: Date.now() }));
              save('bl_notes_tools', н.slice(-60)); out.dataset.kept = '1';
              b.textContent = '✔ Чакат те в 🧰 Инструменти → Бележки — багажът е свален 💜'; b.disabled = true;
              if (window.BL_FX) BL_FX.buzz(10);
            });
            out.appendChild(b);
          }
        }
      };
      let чакащи = редове.slice();
      const питай = () => {
        if (!чакащи.length) { rerender(); return; }
        const текст = чакащи[0];
        const row = el('div', 'bd-ask');
        row.innerHTML = '<p class="bd-q">' + esc(текст) + '</p>';
        const q = el('div', 'jr-quick');
        [['сега', '🔴 Сега'], ['после', '🟡 После'], ['пусни', '⚪ Пусни']].forEach(([k, л]) => {
          const бут = el('button', 'jr-chip', л); бут.type = 'button';
          бут.addEventListener('click', () => {
            кофи[k].push(текст); чакащи.shift(); row.remove(); rerender(); питай();
          });
          q.appendChild(бут);
        });
        row.appendChild(q);
        out.appendChild(row);
      };
      питай();
    });
    c.appendChild(b); c.appendChild(out);
    return c;
  }

  // ── свързване: в Дневника ──
  const пакет = root => { root.appendChild(breatheCard()); root.appendChild(brainDumpCard()); };
  const база = window.ROOM_FEATURES && window.ROOM_FEATURES['Дневник на мама'];
  if (база) window.ROOM_FEATURES['Дневник на мама'] = root => { база(root); пакет(root); };
})();
