/* ═══════════════════════════════════════════════════════════════════════════════
   🌙 „ТИХО. МАЛКОТО СЪНУВА“ — живата карта на съня на началото (реф. 2) · 22.09.2026
   Докато бебето спи (bl_sleep.open), на началото под героя стои нощен облак: бебето на луната,
   звездички и часовник, който тиктака всяка секунда (колко спи СЕГА), плюс общо за днес.
   Бутонът води до ИСТИНСКИЯ бутон „Събуди се“ в стаята (BL_PL_BEBE.иди → „Сънят днес“) —
   логиката на съня (забравен брояч над 14 ч, полунощ, история) си остава на едно място:
   rooms2.js. Тук само ЧЕТЕМ bl_sleep, нищо не пишем.
   Данните: bl_sleep = { d: 'ГГГГ-ММ-ДД', segs: [{ s, e }], open: ts|null } (rooms2.js:695).
   ПЪТ НАЗАД: махни <link>/<script> на pl-san от index.html.
   ═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.BL_PL_SAN) return;
  const ТАВАН = 14 * 3600000;                     // същият таван като rooms2.js (забравен брояч)
  const чети = (к, д) => { try { const v = JSON.parse(localStorage.getItem(к)); return v == null ? д : v; } catch (e) { return д; } };
  const дата = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const дв = n => String(n).padStart(2, '0');

  function сън() {
    const с = чети('bl_sleep', null), сега = Date.now();
    if (!с || typeof с.open !== 'number' || сега - с.open <= 0 || сега - с.open > ТАВАН) return null;
    let днесМс = 0;
    if (с.d === дата(new Date()) && Array.isArray(с.segs)) днесМс = с.segs.reduce((а, x) => а + (x && typeof x.s === 'number' && typeof x.e === 'number' ? Math.max(0, x.e - x.s) : 0), 0);
    return { от: с.open, спи: сега - с.open, днес: днесМс + (сега - с.open) };
  }
  const часовник = мс => { const с = Math.floor(мс / 1000); return дв(Math.floor(с / 3600)) + ':' + дв(Math.floor(с / 60) % 60) + ':' + дв(с % 60); };
  const чм = мс => { const м = Math.floor(мс / 60000); return (м >= 60 ? Math.floor(м / 60) + ' ч ' : '') + (м % 60) + ' мин'; };
  const час = ts => { const d = new Date(ts); return дв(d.getHours()) + ':' + дв(d.getMinutes()); };
  const име = () => { const б = чети('bl_baby', {}) || {}; return (б.name && String(б.name).trim()) || 'Малкото'; };

  let карта = null, т = null, с = null, тик = 0;
  function направи() {
    const к = document.createElement('section');
    к.className = 'pl-san'; к.id = 'plSan'; к.hidden = true;
    к.setAttribute('aria-label', 'Сънят сега');
    к.innerHTML =
      '<span class="pl-san-st" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>' +
      '<span class="pl-san-art" aria-hidden="true"><i></i></span>' +
      '<div class="pl-san-txt">' +
        '<small class="pl-san-h">Тихо. <span class="pl-san-n"></span> сънува <span aria-hidden="true">♡</span></small>' +
        '<b class="pl-san-t" role="timer" aria-label="Колко спи сега">00:00:00</b>' +
        '<span class="pl-san-s"></span>' +
      '</div>' +
      '<button type="button" class="pl-san-go pl-gel" aria-label="Към бутона Събуди се в стаята на бебето"><span aria-hidden="true">🌅</span> Отбележи събуждане</button>';
    к.querySelector('.pl-san-go').addEventListener('click', към);
    return к;
  }
  function към() {
    try { if (window.MamaHelper && MamaHelper.open) MamaHelper.open('Моето бебе'); } catch (e) { return; }
    let n = 0;
    const чакай = () => {
      const б = document.querySelector('#roRoom .pl-bb');
      if (б && window.BL_PL_BEBE && BL_PL_BEBE.иди) { try { BL_PL_BEBE.иди(б, 'сън'); } catch (e) {} return; }
      if (++n < 25) setTimeout(чакай, 80);
    };
    setTimeout(чакай, 120);
  }
  function сложи() {
    const хиро = document.querySelector('#plHome > .pl-hero');
    if (!хиро) return false;
    if (!карта || !карта.isConnected) { карта = направи(); хиро.insertAdjacentElement('afterend', карта); т = карта.querySelector('.pl-san-t'); с = карта.querySelector('.pl-san-s'); }
    return true;
  }
  const пиши = (е, v) => { if (е && е.textContent !== v) е.textContent = v; };   // само при разлика — всяка мутация е работа
  function опресни() {
    if (!сложи()) return;
    const д = сън();
    if (!д) { if (!карта.hidden) { карта.hidden = true; document.documentElement.classList.remove('pl-spi'); } return; }
    if (карта.hidden) { карта.hidden = false; document.documentElement.classList.add('pl-spi'); }
    пиши(карта.querySelector('.pl-san-n'), име());
    пиши(т, часовник(д.спи));
    пиши(с, 'заспа в ' + час(д.от) + (д.днес > д.спи + 60000 ? ' · днес общо ' + чм(д.днес) : ''));
  }
  function върви() {
    опресни();
    clearInterval(тик);
    // една секунда — това е часовник; когато екранът е скрит или е отворена стая, не пипаме нищо
    тик = setInterval(() => { if (document.hidden || document.documentElement.classList.contains('ro-otvorena')) return; опресни(); }, 1000);
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) опресни(); });
  window.addEventListener('storage', e => { if (e.key === 'bl_sleep') опресни(); });
  // началото се рисува от premium-home.js — чакаме #plHome, после само секундата
  let опити = 0;
  (function чакай() { if (document.getElementById('plHome')) върви(); else if (++опити < 60) setTimeout(чакай, 250); })();
  window.BL_PL_SAN = { опресни, сън };
})();
