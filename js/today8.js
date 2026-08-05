// ═══════════════════════════════════════════════════════════
// ☀️ „ДНЕС“ — последните две парчета (план 19, част 8.2)
//
// 🃏 8.2.3  Картата на деня · хороскопчето · днешното докосване —
//           трите ѝ ежедневни неща, направо от „Днес“
// 🎈 8.2.6  Рожден ден / месечнина → ЦЕЛИЯТ екран празнува
//
// ⛔ 8.2.4 („Днес преди…“) — ГОТОВО: river.js го монтира точно тук
//    (mountMemory → td-inner, чипът 🔮). Проверено живо.
//
// ЗАРЕЖДА СЕ СЛЕД river.js и firstday.js.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const днес = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

  // ═══════════ 🃏 8.2.3 ТРИТЕ ЕЖЕДНЕВНИ ═══════════
  function монтирайДневните(container) {
    const inner = container.querySelector('.td-inner');
    if (!inner || inner.classList.contains('td-welcome') || inner.querySelector('.t8-row')) return;
    if (window.BL_FIRSTDAY && load('bl_day1', '') === днес()) return;   // първият ден е тих
    const чакащи = [];
    if (load('bl_cards', { last: '' }).last !== днес())
      чакащи.push(['🃏', 'Картата на деня', 'Жената в мен']);
    const ч = new Date().getHours();
    if (ч >= 7 && load('bl_horo_seen', '') !== днес())
      чакащи.push(['🔮', 'Хороскопчето', 'Жената в мен']);
    const опити = (load('bl_lab', { list: [] }).list || []).filter(x => !x.closed);
    // 🔴 г13/323: lab.js позволява ДВА опита наведнъж, а тук се гледаше само
    //   опити[0] — отметнеше ли първия сутринта, чипчето изчезваше и вторият
    //   оставаше неотметнат цялата вечер.
    if (опити.some(о => !(о.log || {})[днес()]))
      чакащи.push(['🔬', 'Днешното докосване', 'Лабораторията']);
    if (!чакащи.length) return;
    const ред = el('div', 't8-row');
    чакащи.slice(0, 3).forEach(([e, t, стая]) => {
      const b = el('button', 't8-chip', `${e} ${t}`);
      b.type = 'button';
      b.addEventListener('click', () => {
        if (t === 'Хороскопчето') { try { localStorage.setItem('bl_horo_seen', JSON.stringify(днес())); } catch (err) {} }
        if (window.MamaHelper) MamaHelper.open(стая);
      });
      ред.appendChild(b);
    });
    inner.appendChild(ред);
  }

  // ═══════════ 🎈 8.2.6 ПРАЗНИКЪТ ═══════════
  // Месечнина или рожден ден → не само банер, а ЦЕЛИЯТ екран: балони
  // се носят нагоре целия ден. Тихо изчезват, ако мама е „на ръба“.
  function празник() {
    const б = load('bl_baby', {});
    if (!б.birth) return false;
    const р = new Date(б.birth), сега = new Date();
    const месеци = (сега.getFullYear() - р.getFullYear()) * 12 + сега.getMonth() - р.getMonth();
    if (месеци < 1) return false;
    // 🎈 22.07 (армия): сравняваха се голи числа за деня — бебе, родено на 31-во,
    //   няма 31-ви в април/юни/септември/ноември и балоните НИКОГА не излизаха,
    //   макар банерът в същия ден да казва „днес празнува месечнина“ (rooms2
    //   ползва клампването). А родено на 29 февруари — почти никога.
    //   Същата проверка като в базата: и текущият, и следващият месец.
    if (window.BL_DATE) {
      const дн = д => д.getFullYear() + '-' + д.getMonth() + '-' + д.getDate();
      return [месеци, месеци + 1].some(м => м >= 1 && дн(BL_DATE.addMonths(б.birth, м)) === дн(сега));
    }
    return р.getDate() === сега.getDate();
  }
  function украси() {
    if (!празник()) return;
    if (window.BL_FIRSTDAY && BL_FIRSTDAY.тонДнес && BL_FIRSTDAY.тонДнес() === 'на ръба') return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (document.getElementById('t8Party')) return;
    document.body.classList.add('bl-party');
    const слой = el('div', 't8-party'); слой.id = 't8Party';
    слой.setAttribute('aria-hidden', 'true');
    const балони = ['🎈', '🎈', '🎀', '🎈', '✨', '🎈', '🎉', '🎈'];
    балони.forEach((е, i) => {
      const b = el('span', 't8-bal', е);
      b.style.left = (4 + (i * 12.3) % 92) + '%';
      b.style.animationDuration = (14 + (i % 4) * 5) + 's';
      b.style.animationDelay = (-i * 4.2) + 's';
      b.style.fontSize = (16 + (i % 3) * 8) + 'px';
      слой.appendChild(b);
    });
    document.body.appendChild(слой);
  }

  const предишното = window.BL_TODAY_BIND;
  window.BL_TODAY_BIND = function (container, baby, a) {
    if (предишното) предишното(container, baby, a);
    монтирайДневните(container);
  };
  document.addEventListener('DOMContentLoaded', () => setTimeout(украси, 1200));

  window.BL_TODAY8 = { празник };
})();
