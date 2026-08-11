// ═══════════════════════════════════════════════════════════
// EXTRAS — вълната от идеи (10-МЕГА-ИДЕИ): картички за споделяне,
// звуци за сън, SOS дъх, писма-капсули, постижения, благодарности,
// банка за разпускане, приказки, ПИН, глас, ръст/главичка криви,
// рожден-ден режим, именни дни, инсталиране.
// ═══════════════════════════════════════════════════════════

(function () {
  'use strict';

  const D = window.BL_DATA;
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const localDate = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const today = () => localDate(new Date());
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const card = t => { const c = el('section', 'jr-card'); c.appendChild(el('h4', 'jr-title', t)); return c; };
  const сложи = (r, к) => { if (к) r.appendChild(к); };  // 04.08: карта, пазена от паузата след загуба, връща null
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const fx = () => window.BL_FX || { confetti: () => {}, cheer: () => {}, buzz: () => {} };
  const getBaby = () => load('bl_baby', { name: '', sex: '', birth: '' });

  // ═══════════ 📤 КАРТИЧКИ ЗА СПОДЕЛЯНЕ (canvas) ═══════════

  function drawBalloon(x, y, s, ctx) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = '#f5b1d1'; ctx.beginPath(); ctx.ellipse(0, 0, 30, 36, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#fbd3e6'; ctx.beginPath(); ctx.ellipse(0, 0, 19, 34, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#70a8db'; ctx.beginPath(); ctx.ellipse(0, 0, 9, 33, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#ee8fbe'; ctx.beginPath(); ctx.moveTo(-11, 33); ctx.lineTo(11, 33); ctx.lineTo(7, 43); ctx.lineTo(-7, 43); ctx.fill();
    ctx.strokeStyle = '#b78957'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-7, 43); ctx.lineTo(-5, 55); ctx.moveTo(7, 43); ctx.lineTo(5, 55); ctx.stroke();
    ctx.fillStyle = '#c99a63';
    if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(-9, 54, 18, 15, 4); ctx.fill(); } else ctx.fillRect(-9, 54, 18, 15);
    ctx.restore();
  }

  function makeCardCanvas(o) {
    const W = 1080, H = 1080;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const x = cv.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#fdeef6'); g.addColorStop(0.55, '#f3f2fc'); g.addColorStop(1, '#eaf7f2');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    // меки петна
    [['#f9cde2', 180, 170], ['#cfe4f7', 900, 260], ['#d2efe4', 220, 900], ['#e3d9f5', 880, 880]].forEach(([c, cx, cy]) => {
      const rg = x.createRadialGradient(cx, cy, 0, cx, cy, 260);
      rg.addColorStop(0, c + 'cc'); rg.addColorStop(1, c + '00');
      x.fillStyle = rg; x.fillRect(cx - 260, cy - 260, 520, 520);
    });
    // облак
    x.fillStyle = '#ffffff';
    x.beginPath(); x.ellipse(W / 2, 520, 430, 300, 0, 0, 7); x.fill();
    x.beginPath(); x.ellipse(W / 2 - 260, 430, 160, 130, 0, 0, 7); x.fill();
    x.beginPath(); x.ellipse(W / 2 + 250, 420, 180, 140, 0, 0, 7); x.fill();
    // емоджи
    x.textAlign = 'center';
    x.font = '230px "Segoe UI Emoji", sans-serif';
    x.fillText(o.emoji || '🎈', W / 2, 480);
    // заглавие
    x.fillStyle = '#e5559a';
    x.font = '700 76px Comfortaa, sans-serif';
    wrap(x, o.title || '', W / 2, 620, 820, 88);
    // подзаглавие
    x.fillStyle = '#5a5470';
    x.font = '600 44px Nunito, sans-serif';
    wrap(x, o.sub || '', W / 2, 760, 860, 58);
    // дата
    x.fillStyle = '#8b84a3';
    x.font = '700 34px Nunito, sans-serif';
    x.fillText(o.date || new Date().toLocaleDateString('bg-BG'), W / 2, 880);
    // бранд
    drawBalloon(W / 2 - 130, 975, 0.85, x);
    x.textAlign = 'left';
    x.fillStyle = '#e5559a'; x.font = '700 46px Comfortaa, sans-serif';
    x.fillText('Baby', W / 2 - 84, 1000);
    x.fillStyle = '#4f8fc4'; x.fillText('Land', W / 2 + 34, 1000);
    return cv;
  }
  function wrap(x, text, cx, y, maxW, lh) {
    const words = text.split(' '); let line = '', yy = y;
    words.forEach(w => {
      const t = line ? line + ' ' + w : w;
      if (x.measureText(t).width > maxW && line) { x.fillText(line, cx, yy); yy += lh; line = w; }
      else line = t;
    });
    if (line) x.fillText(line, cx, yy);
  }
  async function shareCard(o) {
    const cv = makeCardCanvas(o);
    const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
    const file = new File([blob], 'baby-land-kartichka.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'Baby Land' }); return; } catch (e) { if (e.name === 'AbortError') return; }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'baby-land-картичка.png'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 800);
  }
  window.BL_SHARE = { shareCard, makeCardCanvas };

  // Карта „Сподели споменче“ (Развитие + Дневник)
  function shareMemCard() {
    const c = card('Сподели споменче 📤 <span class="jr-sub">красива картичка за секунди — за Viber, Facebook…</span>');
    const baby = getBaby();
    const nm = baby.name || 'Бебето';
    const firsts = load('bl_firsts', {});
    const opts = [];
    const a = window.BL_AGE ? BL_AGE(baby.birth) : null;
    if (a && a.ym > 0) opts.push({ emoji: '🎂', title: nm + ' на ' + a.ym + (a.ym === 1 ? ' месец!' : ' месеца!'), sub: 'Расте с любов и Baby Land' });
    Object.keys(firsts).forEach(f => {
      const emoji = f.split(' ')[0];
      opts.push({ emoji, title: f.replace(/^\S+\s/, ''), sub: nm + ' го направи! Гордост!', date: new Date(firsts[f]).toLocaleDateString('bg-BG') });
    });
    opts.push({ emoji: '💜', title: 'Обичаме те, ' + nm + '!', sub: 'От мама, с цялото ѝ сърце' });
    const grid = el('div', 'shm-grid');
    opts.slice(0, 6).forEach(o => {
      const b = el('button', 'shm-btn', `<span>${o.emoji}</span>${esc(o.title)}`); b.type = 'button';
      b.addEventListener('click', () => { fx().buzz(12); shareCard(o); });
      grid.appendChild(b);
    });
    c.appendChild(grid);
    // собствена картичка
    const ti = el('input', 'jr-word'); ti.placeholder = 'Или напиши своя надпис…'; ti.maxLength = 60;
    const bb = el('button', 'jr-btn', 'Направи моя картичка 🎨'); bb.type = 'button';
    // 🟠 11.08 (обиколка): при празно поле бутонът не правеше НИЩО — без звук,
    //    без съобщение, без курсор в полето. Мама натиска, нищо не се случва и
    //    решава, че картичките са счупени. Мълчалив бутон няма.
    bb.addEventListener('click', () => {
      const t = ti.value.trim();
      if (!t) { ti.focus(); fx().buzz(8); fx().cheer('Напиши надписа в полето — или избери готов отгоре 💜'); return; }
      shareCard({ emoji: '🎈', title: t, sub: 'Baby Land моменти' });
    });
    c.appendChild(ti); c.appendChild(bb);
    return c;
  }

  // ═══════════ 🌙 ЗВУЦИ ЗА СЪН (Web Audio, офлайн) ═══════════

  const SND = { ctx: null, nodes: [], hb: null, offAt: 0, offTimer: null, type: null };
  function sndStop() {
    // изборът „спри след N мин“ се пази в SND.wanted и се прилага пак при нов звук
    SND.nodes.forEach(n => { try { n.stop ? n.stop() : n.disconnect(); } catch (e) {} });
    SND.nodes = [];
    if (SND.hb) { clearInterval(SND.hb); SND.hb = null; }
    if (SND.offTimer) { clearTimeout(SND.offTimer); SND.offTimer = null; }
    SND.type = null;
    document.querySelectorAll('.snd-btn.on').forEach(b => b.classList.remove('on'));
  }
  function sndStart(type) {
    const желан = SND.wanted;          // изборът на мама надживява смяната на звука
    sndStop();
    if (желан) setTimeout(() => sndTimer(желан), 0);
    if (!SND.ctx) SND.ctx = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = SND.ctx; ctx.resume();
    const master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
    SND.nodes.push(master);
    if (type === 'white' || type === 'rain') {
      const len = ctx.sampleRate * 2;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      if (type === 'rain') {
        const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900;
        const f2 = ctx.createBiquadFilter(); f2.type = 'highpass'; f2.frequency.value = 300;
        src.connect(f); f.connect(f2); f2.connect(master);
        SND.nodes.push(f, f2);
      } else {
        const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 2400;
        src.connect(f); f.connect(master); SND.nodes.push(f);
      }
      src.start(); SND.nodes.push(src);
    }
    if (type === 'heart') {
      master.gain.value = 0.9;
      const thump = (t) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.frequency.setValueAtTime(58, t);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.9, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
        o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.25);
      };
      const beat = () => { const t = ctx.currentTime + 0.05; thump(t); thump(t + 0.28); };
      beat(); SND.hb = setInterval(beat, 1000);
    }
    SND.type = type;
  }
  function sndTimer(min) {
    if (SND.offTimer) clearTimeout(SND.offTimer);
    if (min) SND.offTimer = setTimeout(sndStop, min * 60000);
  }
  window.BL_SOUNDS = { start: sndStart, stop: sndStop, timer: sndTimer };

  function soundsCard() {
    const c = card('Звуци за сън 🌙 <span class="jr-sub">бял шум, дъжд, мамино сърце — работят и офлайн</span>');
    const row = el('div', 'jr-quick');
    [['white', '🌫️ Бял шум'], ['rain', '🌧️ Дъжд'], ['heart', '💗 Сърце']].forEach(([v, l]) => {
      const b = el('button', 'jr-chip snd-btn', l); b.type = 'button';
      b.addEventListener('click', () => {
        if (b.classList.contains('on')) { sndStop(); return; }
        sndStart(v);
        row.querySelectorAll('.snd-btn').forEach(x => x.classList.remove('on'));
        b.classList.add('on');
      });
      row.appendChild(b);
    });
    c.appendChild(row);
    const tr = el('div', 'jr-quick');
    tr.appendChild(el('span', 'jr-elabel', '⏲ Спри след:'));
    [[15, '15 мин'], [30, '30 мин'], [60, '60 мин'], [0, '∞']].forEach(([m, l]) => {
      const b = el('button', 'jr-chip snd-t', l); b.type = 'button';
      // ♿ 11.08 (клавиатура-четец): „∞" се чете като „безкрайност" — знак, не дума.
      if (!m) b.setAttribute('aria-label', 'Без спиране — свири докато го спра');
      // 22.07 (армия): sndStart() вика sndStop(), който трие offTimer-а, но
      //   НЕ гаси чипа — избереш ли звука СЛЕД таймера, „30 мин“ свети, а
      //   белият шум свири цяла нощ. Пазим избора и го прилагаме наново.
      b.addEventListener('click', () => { tr.querySelectorAll('.snd-t').forEach(x => x.classList.remove('on')); b.classList.add('on'); SND.wanted = m; sndTimer(m); });
      tr.appendChild(b);
    });
    c.appendChild(tr);
    c.appendChild(el('p', 'jr-privacy', 'Екранът трябва да остане отключен (или приложението отворено), за да свири. Дръж звука умерен и устройството далече от креватчето.'));
    return c;
  }

  // ═══════════ 🌬️ SOS ДЪХ (дишане 4-7-8) ═══════════

  function openBreath() {
    let ov = document.getElementById('breathOverlay');
    if (!ov) {
      ov = el('div', 'br-overlay'); ov.id = 'breathOverlay';
      ov.innerHTML = `<div class="br-box"><div class="br-circle" id="brCircle"><span id="brText">Готова?</span></div>
        <p class="br-count" id="brCount"></p>
        <button class="jr-btn br-close" id="brClose" type="button">Затвори</button></div>`;
      document.body.appendChild(ov);
      ov.querySelector('#brClose').addEventListener('click', () => { ov.hidden = true; clearTimeout(ov._t); });
    }
    ov.hidden = false;
    const circ = ov.querySelector('#brCircle'), txt = ov.querySelector('#brText'), cnt = ov.querySelector('#brCount');
    let round = 0;
    function phase(name, cls, dur, label) {
      txt.textContent = label;
      circ.className = 'br-circle ' + cls;
      circ.style.transitionDuration = dur + 's';
      return dur * 1000;
    }
    function cycle() {
      if (ov.hidden) return;
      round++;
      if (round > 4) { txt.textContent = 'По-добре ли е? 💜'; circ.className = 'br-circle'; cnt.textContent = ''; return; }
      cnt.textContent = 'кръг ' + round + ' от 4';
      let t = phase('in', 'br-in', 4, 'Вдишай… 4');
      ov._t = setTimeout(() => {
        t = phase('hold', 'br-in', 7, 'Задръж… 7');
        ov._t = setTimeout(() => {
          t = phase('out', 'br-out', 8, 'Издишай… 8');
          ov._t = setTimeout(cycle, t);
        }, t);
      }, t);
    }
    round = 0; cycle();
  }
  window.BL_BREATH = { open: openBreath };

  function breathCard() {
    // 11.08: пишеше „60 секунди“, а 4 кръга по 4-7-8 правят 76 секунди —
    // числото не отговаряше на кода. Без число сега, за да не се разминава пак.
    const c = card('SOS дъх 🌬️ <span class="jr-sub">малко повече от минута спокойствие, когато всичко е много</span>');
    const b = el('button', 'jr-btn', 'Дишай с мен 🫧'); b.type = 'button';
    b.addEventListener('click', openBreath);
    c.appendChild(b);
    c.appendChild(el('p', 'jr-privacy', 'Дишане 4-7-8 · 4 кръга. Бебето усеща твоето спокойствие.'));
    return c;
  }

  // 🗑️ capsulesCard / gratitudeCard / relaxCard (90 реда) МАХНАТИ — бяха
  // дефинирани, но НИКОГА извиквани (одит-флот П23, проход 1 тема 9). Живеят
  // в базовия дневник (rooms.js): „Писма-капсули", „Три хубави неща",
  // „Имам минутка?". Дублиращите дефиниции тук бяха мъртви от план 12 насам.

  // ═══════════ 🏅 ПОСТИЖЕНИЯ (медальони) ═══════════

  const BADGES = [
    { id: 'checkin1', e: '🌷', n: 'Първа минутка', t: 'Помисли за себе си днес', ok: () => Object.keys(load('bl_checkins', {})).length >= 1 },
    { id: 'checkin7', e: '🌱', n: '7 дни грижа', t: '7 дни минутка за теб', ok: () => Object.keys(load('bl_checkins', {})).length >= 7 },
    { id: 'metime60', e: '⏰', n: 'Цял час за мен', t: '60 мин „време за мен“ за седмица', ok: () => (load('bl_metime', { minutes: 0 }).minutes || 0) >= 60 },
    { id: 'foods10', e: '🍎', n: '10 вкусни срещи', t: '10 опитани храни', ok: () => Object.keys(load('bl_tried', {})).length >= 10 },
    { id: 'lex12', e: '🌟', n: 'Пълен лексикон', t: 'Всички 12 отговора', ok: () => Object.keys(load('bl_baby_lexicon', {})).length >= 12 },
    { id: 'firsts3', e: '👣', n: 'Колекционер на първи пъти', t: '3 отбелязани „първи пъти“', ok: () => Object.keys(load('bl_firsts', {})).length >= 3 },
    { id: 'capsule1', e: '💌', n: 'Писмо във времето', t: 'Запечатана капсула', ok: () => load('bl_capsules', []).length >= 1 },
    { id: 'list1', e: '✅', n: 'Готов списък', t: 'Завършен твой списък (3+ точки)', ok: () => load('bl_custom_lists', []).some(l => l.items.length >= 3 && l.items.every(i => i.done)) },
    // ── 12.4.1: +16, вкл. за стаи 8 и 9 ──
    { id: 'checkin30', e: '🌳', n: 'Месец грижа', t: '30 дни минутка за теб', ok: () => Object.keys(load('bl_checkins', {})).length >= 30 },
    // 🔴 05.08 (одит г08, №83): двата медальона се мереха по bl_journal — ключ,
    //    който НИКОЙ ред в приложението не записва. Мама можеше да пише всяка
    //    вечер две години и те да си останат сиви, с изписано отдолу какво
    //    „трябвало“ да направи. Дневникът пише в bl_prompt_log (подканите) и
    //    bl_freepage (свободната страница) — тях и броим.
    { id: 'journal7', e: '📖', n: 'Първа седмица думи', t: '7 записа в дневника', ok: () => (load('bl_prompt_log', []).length + load('bl_freepage', []).length) >= 7 },
    { id: 'journal30', e: '📚', n: 'Разказвачка', t: '30 записа в дневника', ok: () => (load('bl_prompt_log', []).length + load('bl_freepage', []).length) >= 30 },
    { id: 'foods25', e: '🥗', n: 'Малък гурме', t: '25 опитани храни', ok: () => Object.keys(load('bl_tried', {})).length >= 25 },
    { id: 'photos6', e: '📸', n: 'Фото-лента', t: '6 месечни снимки', ok: () => Object.keys(load('bl_photos', {})).length >= 6 },
    { id: 'firsts10', e: '⭐', n: 'Ловец на мигове', t: '10 „първи пъти“', ok: () => Object.keys(load('bl_firsts', {})).length >= 10 },
    // 🔴 05.08 (одит г08, №84): медальонът „3 писма до бебето“ броеше
    //    bl_wm_letters — а това са писмата до СЕБЕ СИ след година (стая
    //    „Жената в мен“). Мама запечатваше три капсули „👶 До бебето“ и не
    //    светваше нищо; пишеше три на себе си и получаваше медальон за бебето.
    //    Истинските писма до бебето са капсулите с to:'baby' (rooms.js).
    { id: 'letters3', e: '💜', n: 'Писма от сърце', t: '3 писма до бебето', ok: () => load('bl_capsules', []).filter(c => c && c.to === 'baby').length >= 3 },
    { id: 'backup1', e: '💾', n: 'Пазителка', t: 'Първо резервно копие', ok: () => !!load('bl_backup_last', '') },
    // стая 8 — Жената в мен
    { id: 'w_card', e: '🃏', n: 'Първа карта', t: 'Изтеглена карта на деня', ok: () => (load('bl_cards', { seen: [] }).seen || []).length >= 1 },
    { id: 'w_cards7', e: '🔮', n: 'Гадателка', t: '7 събрани карти', ok: () => (load('bl_cards', { seen: [] }).seen || []).length >= 7 },
    { id: 'w_secret', e: '🗝️', n: 'Първа тайна', t: 'Записана тайна', ok: () => !!(load('bl_wm_secret', '') || '').trim() },
    { id: 'w_micro', e: '🎈', n: 'Малко приключение', t: 'Отбелязано микро-приключение', ok: () => (load('bl_wm_micro', { done: [] }).done || []).length >= 1 },
    { id: 'w_bucket', e: '🔥', n: 'Мечтателка', t: '1 отметнато от списъка преди 40', ok: () => (load('bl_wm_bucket', []) || []).some(x => x && x.done) },
    // стая 9 — Лабораторията
    // ⚠️ беше `load('bl_lab',{done:[]}).done || …` — празният масив е TRUTHY,
    //    така медальонът се даваше на всяка майка още в първата секунда.
    // проход 3 T18: bl_lab_active не се пише никъде — реалните ЗАПОЧНАТИ опити са
    // в bl_lab.list (lab.js), закритите остават там с closed:true. list.length>0 = започнат.
    { id: 'lab_first', e: '🔬', n: 'Първи опит', t: 'Започнат опит', ok: () => ((load('bl_lab', { done: [] }).done || []).length > 0) || ((load('bl_lab', { list: [] }).list || []).length > 0) },
    { id: 'lab_done', e: '🏆', n: 'Учена майка', t: 'Завършен опит (7 вечери)', ok: () => (load('bl_lab', { done: [] }).done || []).length >= 1 },
    // проход 3 T17: bl_myth_checked не се пише никъде — проверените митове са в
    // bl_lab.done с e:'👵' (lab.js), точно както ги брои profile.js.
    { id: 'lab_myth', e: '🧿', n: 'Разобличител', t: 'Проверен бабин мит', ok: () => ((load('bl_lab', { done: [] }).done) || []).some(x => x && x.e === '👵') },
    // ── план 23 Б1: рафтът пораства 24 → 40 ──
    { id: 'walk7', e: '🚶‍♀️', n: 'Седем разходки', t: '7 дни с разходка', ok: () => Object.keys(load('bl_walk_days', {})).length >= 7 },
    { id: 'walk30', e: '🏞️', n: 'Месец на крак', t: '30 дни с разходка', ok: () => Object.keys(load('bl_walk_days', {})).length >= 30 },
    { id: 'tried25', e: '🍽️', n: 'Гурме двойка', t: '25 опитани храни', ok: () => Object.keys(load('bl_tried', {})).length >= 25 },
    { id: 'lab3', e: '🧪', n: 'Три открития', t: '3 завършени опита', ok: () => ((load('bl_lab', { done: [] }).done) || []).length >= 3 },
    { id: 'lab5', e: '🔭', n: 'Изследователка', t: '5 завършени опита', ok: () => ((load('bl_lab', { done: [] }).done) || []).length >= 5 },
    { id: 'compl5', e: '💌', n: 'Кутия с добри думи', t: '5 записани комплимента', ok: () => load('bl_wm_compl', []).length >= 5 },
    { id: 'mirror7', e: '🪞', n: 'Седем добри огледала', t: '7 дни „днес се харесах“', ok: () => load('bl_wm_mirror', []).length >= 7 },
    { id: 'places5', e: '🗺️', n: 'Пет места', t: '5 места на картата ти', ok: () => load('bl_wm_places', []).length >= 5 },
    { id: 'ritual7', e: '🕯️', n: 'Седмица ритуали', t: 'Ритуалът 7 дни подред', ok: () => (load('bl_wm_ritual_streak', { n: 0 }).n || 0) >= 7 },
    { id: 'goals3', e: '🎯', n: 'Три постигнати цели', t: '3 седмични награди', ok: () => load('bl_goal_stickers', []).length >= 3 },
    { id: 'goals10', e: '🏹', n: 'Десет цели', t: '10 седмични награди', ok: () => load('bl_goal_stickers', []).length >= 10 },
    { id: 'trace5', e: '🕵️', n: 'Детективка', t: '5 следи „какво се смени“', ok: () => load('bl_lab_timeline', []).length >= 5 },
    { id: 'flip3', e: '🔄', n: 'Търпеливата', t: '3 записани „работеше и спря“', ok: () => load('bl_lab_flipped', []).length >= 3 },
    // името може още да го няма (некръстено / още го чакате) — важи самият запис
    { id: 'baby22', e: '🍼', n: 'Двойна прегръдка', t: 'Добавено второ съкровище', ok: () => { const в = load('bl_baby2', {}); return !!((в.name || '').trim() || в.birth || в.d); } },
    { id: 'soul1', e: '🤍', n: 'Подсигурена душа', t: 'Записан номер „За душата“', ok: () => !!(load('bl_sos', {}).soulPhone || '').trim() },
    { id: 'hello1', e: '🌸', n: 'Представи се', t: 'Създаден профил', ok: () => !!(load('bl_mama', {}).name || '').trim() }
  ];
  function sweepBadges() {
    const got = load('bl_badges', {});
    let fresh = null;
    BADGES.forEach(b => { if (!got[b.id] && b.ok()) { got[b.id] = Date.now(); fresh = b; } });
    if (fresh) { save('bl_badges', got); fx().cheer(fresh.e + ' Ново медальонче: „' + fresh.n + '“!'); }
    return got;
  }
  window.BL_BADGES = { sweep: sweepBadges, list: BADGES }; // профилът показва рафта

  function badgesCard() {
    const c = card('Медальончета 🏅 <span class="jr-sub">малките победи, събрани завинаги</span>');
    const got = sweepBadges();
    const grid = el('div', 'bg-grid');
    // 🔴 05.08 (одит г08, №270): тук се рисуваше ЦЕЛИЯТ каталог — четирийсет
    //    записа, от които нейните са две-три. Заключените остават с четимо име
    //    и условие („30 дни минутка за теб“, „25 опитани храни“) — тоест стена
    //    от домашно, невзето, в стаята, за която ѝ е обещано, че няма да я мери.
    //    Годишникът вече прави точно обратното (badges2.js: „Само ВЗЕТИТЕ.
    //    Книгата е за спомени, не за домашни.“). Тук — същото.
    const мои = BADGES.filter(b => got[b.id]);
    мои.forEach(b => {
      const d = el('div', 'bg-badge got');
      d.innerHTML = `<span class="bg-e">${b.e}</span><strong>${b.n}</strong><small>${b.t}</small>`;
      grid.appendChild(d);
    });
    c.appendChild(grid);
    c.appendChild(el('p', 'jr-privacy', мои.length
      ? 'Има и още — те се появяват сами, когато им дойде времето. 💜'
      : 'Още е празно, и това е нормално. Медальончетата идват сами, без да ги гониш. 💜'));
    return c;
  }

  // ═══════════ 📖✨ ПРИКАЗКА-ГЕНЕРАТОР ═══════════

  function storyCard() {
    const c = card('Приказка за лека нощ 📖✨ <span class="jr-sub">с името на твоето бебе — всеки път нова</span>');
    let hero = Object.keys(D.story.heroes)[0], mood = D.story.moods[0];
    const r1 = el('div', 'jr-quick');
    Object.keys(D.story.heroes).forEach((h, i) => {
      const b = el('button', 'jr-chip' + (i === 0 ? ' on' : ''), D.story.heroes[h] + ' ' + h.split(' ')[1]); b.type = 'button';
      b.addEventListener('click', () => { r1.querySelectorAll('.jr-chip').forEach(x => x.classList.remove('on')); b.classList.add('on'); hero = h; });
      r1.appendChild(b);
    });
    const r2 = el('div', 'jr-quick');
    D.story.moods.forEach((m, i) => {
      const b = el('button', 'jr-chip' + (i === 0 ? ' on' : ''), m); b.type = 'button';
      b.addEventListener('click', () => { r2.querySelectorAll('.jr-chip').forEach(x => x.classList.remove('on')); b.classList.add('on'); mood = m; });
      r2.appendChild(b);
    });
    const gen = el('button', 'jr-btn', '✨ Разкажи ми приказка'); gen.type = 'button';
    const out = el('div', 'st-out');
    let lastTxt = '';
    gen.addEventListener('click', () => {
      const nm = getBaby().name || 'слънчице';
      const mids = D.story.mid.slice().sort(() => Math.random() - 0.5).slice(0, 2);
      const parts = [D.story.intro[mood], ...mids, D.story.end[mood]]
        .map(s => s.replace(/{hero}/g, () => hero).replace(/{name}/g, () => nm));   // функция: име с $& не се разширява
      lastTxt = parts.join(' ');
      // 🔒 22.07 (армия, RED): името на бебето (писано от мама, пазено сурово)
      //   влизаше направо в innerHTML. Екранираме ТУК, а не в parts —
      //   lastTxt отива в четенето на глас и трябва да остане чист текст.
      out.innerHTML = `<div class="st-story pop">${parts.map(p => `<p>${esc(p)}</p>`).join('')}
        <button class="jr-chip st-read" type="button">🔊 Прочети на глас</button></div>`;
      out.querySelector('.st-read').addEventListener('click', () => {
        try {
          speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(lastTxt);
          u.lang = 'bg-BG'; u.rate = 0.92;
          speechSynthesis.speak(u);
        } catch (e) {}
      });
    });
    c.appendChild(r1); c.appendChild(r2); c.appendChild(gen); c.appendChild(out);
    return c;
  }

  // ═══════════ 📏 РЪСТ И ГЛАВИЧКА (СЗО криви P3/P50/P97) ═══════════

  function lenHeadCard() {
    const c = card('Ръст и главичка 📏 <span class="jr-sub">още две криви на СЗО — ориентировъчно</span>');
    let metric = 'len';
    const mrow = el('div', 'jr-quick');
    [['len', '📏 Ръст (см)'], ['head', '⭕ Обиколка на главата (см)']].forEach(([v, l], i) => {
      const b = el('button', 'jr-chip' + (i === 0 ? ' on' : ''), l); b.type = 'button';
      b.addEventListener('click', () => { mrow.querySelectorAll('.jr-chip').forEach(x => x.classList.remove('on')); b.classList.add('on'); metric = v; out.innerHTML = ''; box.innerHTML = ''; });
      mrow.appendChild(b);
    });
    const vi = el('input', 'jr-word'); vi.type = 'number'; vi.step = '0.1'; vi.placeholder = 'Стойност в см…';
    const mi = el('input', 'jr-word'); mi.type = 'number'; mi.min = 0; mi.max = 24; mi.placeholder = 'Възраст (месеци)…';
    const baby = getBaby();
    const a = window.BL_AGE ? BL_AGE(baby.birth) : null;
    // СЗО-кривите при недоносени се четат по КОРИГИРАНАТА възраст (devMonths) —
    // календарната изкривява персентила точно за тях (одит-флот П23, проход 2 №6;
    // калкулаторът на теглото в rooms2 вече прави същото)
    if (a) mi.value = Math.round(a.devMonths != null ? a.devMonths : a.months);
    const btn = el('button', 'jr-btn', 'Изчисли 📊'); btn.type = 'button';
    const box = el('div', 'bb-chartbox'); const out = el('p', 'bb-res', '');
    const M = D.who.months;
    function interp(arr, age) {
      const aa = Math.max(M[0], Math.min(M[M.length - 1], age));
      let i = 0; while (i < M.length - 1 && M[i + 1] < aa) i++;
      const t = (aa - M[i]) / ((M[i + 1] - M[i]) || 1);
      return arr[i] + t * (arr[i + 1] - arr[i]);
    }
    btn.addEventListener('click', () => {
      // 🔴 11.08 (обиколка като майка, „Моето бебе"): полът се четеше ВЕДНЪЖ,
      //    при строежа на картата. Мама натискаше „👧 Момиче" в „Профилът на
      //    бебето" две карти по-горе (rooms2 записва веднага) — и тази карта
      //    пак ѝ казваше „кажи ми първо момче ли е, или момиче", и я пращаше
      //    в стаята, в която вече стои. Оправяше се чак след рестарт.
      //    Калкулаторът на ТЕГЛОТО работеше, защото живее в същия затвор
      //    като профила и вижда промяната. Този — не. Четем при натискане.
      const baby = getBaby();
      const val = parseFloat(vi.value), age = parseFloat(mi.value);
      if (isNaN(val) || isNaN(age) || age < 0 || age > 24) { out.textContent = 'Въведи стойност и възраст 0–24 м. 😊'; return; }
      // Същото като при теглото: без пол не смятаме по чужда крива.
      if (!baby.sex || (baby.sex !== 'boy' && baby.sex !== 'girl')) {
        out.innerHTML = 'Кажи ми първо момче ли е, или момиче — кривите на СЗО са различни за двете. Изборът е в картата „Профилът на бебето“ — първата в тази стая. 💜';
        box.innerHTML = '';
        return;
      }
      const tbl = (metric === 'len' ? D.whoLen : D.whoHead)[baby.sex === 'boy' ? 'boys' : 'girls'];
      const p3 = interp(tbl.p3, age), p50 = interp(tbl.p50, age), p97 = interp(tbl.p97, age);
      const ymin = metric === 'len' ? 42 : 29, ymax = metric === 'len' ? 98 : 55;
      // мини графика
      const W = 300, H = 170, pl = 30, pr = 10, pt = 10, pb = 20;
      const X = m => pl + (m / 24) * (W - pl - pr);
      const Y = v => pt + (1 - (v - ymin) / (ymax - ymin)) * (H - pt - pb);
      let svg = `<svg viewBox="0 0 ${W} ${H}" class="bb-chart">`;
      [['p3', '#a8cdec'], ['p50', '#f291bd'], ['p97', '#a8cdec']].forEach(([b2, col]) => {
        const pts = M.map(m => `${X(m)},${Y(tbl[b2][M.indexOf(m)])}`).join(' ');
        svg += `<polyline points="${pts}" fill="none" stroke="${col}" stroke-width="${b2 === 'p50' ? 2.4 : 1.6}" opacity="${b2 === 'p50' ? 1 : 0.75}"/>`;
      });
      [0, 6, 12, 18, 24].forEach(m => svg += `<text x="${X(m)}" y="${H - 5}" class="bb-ax" text-anchor="middle">${m}м</text>`);
      svg += `<circle cx="${X(Math.min(24, age))}" cy="${Y(Math.max(ymin, Math.min(ymax, val)))}" r="7" fill="#fff" stroke="#e56ba4" stroke-width="2.5"/></svg>`;
      box.innerHTML = svg;
      const nm = baby.name || 'Бебето';
      // 🔴 04.08 (обиколка, стая Моето бебе): картата има превключвател между
      //    РЪСТ и ОБИКОЛКА НА ГЛАВАТА, таблицата се сменя вярно — но присъдата
      //    не гледаше `metric` изобщо. Един и същи текст се изричаше и за
      //    двете. За ръста „над 97-ия — юначище!“ е вярно и топло. За главата
      //    е обратното на вярното: и над 97-ия, и под 3-ия са точно двете
      //    числа, които се показват на педиатър, а не се поздравяват.
      //    Приложението го знае другаде — mb-font вдига 🚨 за напрегната
      //    фонтанела. Тук същата анатомия получаваше „юначище“.
      //    Освен това не можем да обещаваме какво „ще потвърди“ лекарят.
      let msg;
      if (metric === 'head') {
        if (val < p3 || val > p97) {
          msg = (val < p3 ? 'под 3-ия' : 'над 97-ия') + ' персентил. Обиколката на главата се чете само заедно с предишните мерения — покажи това число на педиатъра на следващия преглед. Това е негова работа, не моя.';
        } else if (val < p50) msg = `между 3-ия и 50-ия персентил — в обичайните граници.`;
        else msg = `между 50-ия и 97-ия персентил — в обичайните граници.`;
      } else if (val < p3) msg = `под 3-ия персентил — по-мъничко от повечето връстници. Ако върви по СВОЯТА крива, често е нормално — сподели с педиатъра.`;
      else if (val > p97) msg = `над 97-ия персентил — юначище! Кажи го и на педиатъра, за да го впише в кривата.`;
      else if (val < p50) msg = `между 3-ия и 50-ия персентил — напълно в нормата.`;
      else msg = `между 50-ия и 97-ия персентил — напълно в нормата.`;
      out.innerHTML = `${esc(nm)}: <strong>${esc(val)} см</strong> на ${Math.round(age)} м. — ${msg}<br><span class="bb-note">Ориентир по СЗО. Официалното мерене прави педиатърът.</span>`;
      // 4.2.4: досега картата смяташе и забравяше. Ръстът се пази, за да има
      // от какво да порасне „линията на стената“ (rooms14) и Реката.
      // 🔴 05.08 (одит г08, №14): записът стоеше ЗАД `metric === 'len'` — тоест
      //    обиколката на главата се смяташе, светваше веднъж и изчезваше. А
      //    присъдата отгоре сама казва, че тя „се чете само заедно с предишните
      //    мерения“. Искахме история, а отказвахме да я пазим. Сега и главата
      //    си има ключ.
      const ключ = metric === 'len' ? 'bl_growth_len' : 'bl_growth_head';
      const h = load(ключ, []);
      // 🔴 05.08 (скептик 14): числото вече се ЗАПИСВАШЕ, но никой не го ЧЕТЕШЕ —
      //    ръстът има „Ръстът на стената“ (rooms14), главата нямаше нищо. Тоест
      //    присъдата отгоре обещаваше „чете се само заедно с предишните мерения“,
      //    а предишните бяха невидими: пазени, вместо изхвърляни, но пак безполезни.
      //    Показваме ги ТУК, до самото число — за да има какво да покаже на лекаря.
      //    Четем ПРЕДИ push, затова „предишните“ наистина са предишните.
      if (metric === 'head') {
        const поДата = {};
        h.forEach(x => { поДата[x.d] = x; });                 // едно мерене на ден
        const преди = Object.values(поДата).slice(-4);
        if (преди.length) {
          const ред = преди.map(x => `${esc(x.v)} см (${esc(x.d)})`).join(' · ');
          out.innerHTML += `<br><span class="bb-note">Предишните мерения на главата: ${ред} — покажи ги на педиатъра заедно, не поотделно.</span>`;
        }
      }
      h.push({ d: today(), m: Math.round(age * 10) / 10, v: Math.round(val * 10) / 10 });
      save(ключ, h.slice(-24));
    });
    c.appendChild(mrow); c.appendChild(vi); c.appendChild(mi); c.appendChild(btn); c.appendChild(box); c.appendChild(out);
    return c;
  }

  // ═══════════ 🔒 ПИН ЗА ДНЕВНИКА ═══════════
  //
  // М−2 (одит 6): ПИН-ът се пазеше като ЧИСТ ТЕКСТ в bl_pin. Всеки, който
  // отвори конзолата, го четеше за 2 секунди — и той пътуваше в резервното
  // копие. Сега се пази само отпечатък (PBKDF2 + сол, 150 000 обиколки).
  //
  // ЧЕСТНО ЗА ГРАНИЦИТЕ: 4 цифри са само 10 000 възможности. Отпечатъкът
  // спира ЧЕТЕНЕТО, но човек с телефона и много търпение би ги пробвал.
  // Затова ключалката е ПЕРДЕ, не сейф — и текстът към мама го казва така,
  // вместо да ѝ обещава „никой не го вижда“.

  const b64 = buf => btoa(String.fromCharCode.apply(null, new Uint8Array(buf)));

  async function hashPin(pin, saltB64) {
    const enc = new TextEncoder();
    const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
    const key = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' }, key, 256);
    return b64(bits);
  }

  async function setPin(pin) {
    const salt = b64(crypto.getRandomValues(new Uint8Array(16)));
    save('bl_pin_h', { s: salt, h: await hashPin(pin, salt) });
    localStorage.removeItem('bl_pin');           // старият чист текст си отива
  }

  async function checkPin(pin) {
    const rec = load('bl_pin_h', null);
    if (!rec || !rec.s) return false;
    return (await hashPin(pin, rec.s)) === rec.h;
  }

  function hasPin() { return !!(load('bl_pin_h', null) || load('bl_pin', '')); }

  // Миграция: заварена ключалка от чист текст → отпечатък, тихо, при старта
  (async () => {
    const old = load('bl_pin', '');
    if (old && !load('bl_pin_h', null)) { await setPin(String(old)); }
  })();

  let pinOkThisSession = false;
  // 3.1: общият питач — и Дневникът, и Тайните минават през ЕДНА ключалка
  function pinAsk(title, onOk) {
    if (!hasPin() || pinOkThisSession) { onOk(); return false; }
    let ov = document.getElementById('pinOverlay');
    if (!ov) {
      ov = el('div', 'br-overlay'); ov.id = 'pinOverlay';
      ov.innerHTML = `<div class="br-box pin-box"><p class="pin-title"></p>
        <div class="pin-dots" id="pinDots"><span></span><span></span><span></span><span></span></div>
        <div class="pin-pad" id="pinPad">${[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(d => `<button type="button" data-d="${d}">${d}</button>`).join('')}</div>
        <button class="jr-chip" id="pinCancel" type="button">Отказ</button>
        <button class="pin-forgot" id="pinForgot" type="button" hidden>Забравих ПИН-а</button>
        <div class="pin-exit" id="pinExit" hidden></div></div>`;
      document.body.appendChild(ov);
    }
    ov.hidden = false;
    ov.querySelector('.pin-title').textContent = title || '🔒 Заключено';
    let cur = '';
    let грешки = 0;                                // 3 опита → показваме изхода
    const dots = ov.querySelectorAll('#pinDots span');
    const drawDots = () => dots.forEach((d, i) => d.classList.toggle('f', i < cur.length));
    drawDots();
    ov.querySelector('#pinPad').onclick = async (e) => {
      const b = e.target.closest('button'); if (!b) return;
      const d = b.dataset.d;
      if (d === '⌫') cur = cur.slice(0, -1);
      else if (d !== '' && cur.length < 4) cur += d;
      drawDots();
      if (cur.length === 4) {
        const опит = cur;
        cur = '';                                  // веднага, за да не се трупа
        // проверката вече е асинхронна (150 000 обиколки ≈ една мигновение)
        if (await checkPin(опит)) { pinOkThisSession = true; ov.hidden = true; onOk(); }
        else {
          drawDots();
          const box = ov.querySelector('.pin-box');
          box.classList.add('shake'); setTimeout(() => box.classList.remove('shake'), 500);
          if (++грешки >= 3) ov.querySelector('#pinForgot').hidden = false;
        }
      }
    };
    ov.querySelector('#pinCancel').onclick = () => { ov.hidden = true; };

    // 🔑 05.08 — ИЗХОДЪТ. Картата „Ключалка на дневника“ живее ВЪТРЕ в
    //    „Дневник на мама“ — тоест зад самата ключалка. Забравеше ли ПИН-а,
    //    майката губеше дневника си завинаги, а собственият ни текст ѝ го
    //    казваше едва след като вече е заключила.
    //    Затова: след три опита се показва честен изход. Ключалката пази
    //    ШЕСТ ключа — те си отиват с нея, иначе изходът щеше да е задна
    //    врата за всеки, взел телефона. Останалото остава непокътнато.
    //
    // 🔴 11.08 (обиколка като майка, Дневник): изходът триеше само ТРИ от
    //    ключовете. А катинарът (secrets.js) и двете резервни копия
    //    (profile.js, rooms2.js) пазят ШЕСТ: + „Яростта, която има адрес“,
    //    „Майка ми“ и „Моите пари“. Тоест всеки, взел телефона, натискаше
    //    „Забравих ПИН-а“ → „Махни ключалката“ и ги четеше — точно задната
    //    врата, която текстът тук обещава, че НЕ съществува. Списъкът вече
    //    е същият като на катинара.
    const ЗАД_КЛЮЧАЛКАТА = ['bl_wm_diary', 'bl_wm_confess', 'bl_wm_sins',
      'bl_wm_rage', 'bl_wm_maika', 'bl_wm_money'];
    const forgot = ov.querySelector('#pinForgot');
    const exitBox = ov.querySelector('#pinExit');
    forgot.hidden = true; exitBox.hidden = true; exitBox.innerHTML = '';
    forgot.onclick = () => {
      forgot.hidden = true; exitBox.hidden = false;
      exitBox.innerHTML = '<p>Ключалката може да се махне — но тя пази дневничето, ' +
        'изповедите, „греховете“, яростта, реда за майка ти и парите ти. ' +
        '<strong>Те си отиват с нея — всичките.</strong> ' +
        'Иначе всеки, взел телефона ти, щеше да ги прочете със същия бутон.</p>' +
        '<p>Всичко останало в приложението остава.</p>';
      const да = el('button', 'jr-btn', 'Махни ключалката и това, което пази');
      да.type = 'button';
      const не = el('button', 'jr-chip', 'Не, ще опитам пак'); не.type = 'button';
      не.onclick = () => { exitBox.hidden = true; exitBox.innerHTML = ''; грешки = 0; };
      да.onclick = () => {
        ['bl_pin_h', 'bl_pin'].concat(ЗАД_КЛЮЧАЛКАТА)
          .forEach(k => { try { localStorage.removeItem(k); } catch (e) {} });
        pinOkThisSession = true;
        ov.hidden = true;
        onOk();
      };
      exitBox.appendChild(да); exitBox.appendChild(не);
    };
    return true;
  }
  function pinGate(room, onOk) {
    if (room !== 'Дневник на мама') return false;
    if (!hasPin() || pinOkThisSession) return false;
    return pinAsk('🔒 Дневникът е заключен', onOk);
  }
  window.BL_PIN = { gate: pinGate, ask: pinAsk, has: hasPin, unlocked: () => pinOkThisSession };

  function pinCard() {
    const c = card('Ключалка на дневника 🔒 <span class="jr-sub">4 цифри — за любопитни очи</span>');
    const cur = hasPin();
    const inp = el('input', 'jr-word'); inp.type = 'password'; inp.maxLength = 4; inp.inputMode = 'numeric'; inp.placeholder = cur ? 'Нов ПИН (или празно за махане)…' : 'Избери 4 цифри…';
    const b = el('button', 'jr-btn', cur ? 'Смени / махни ключалката' : 'Заключи 🔒'); b.type = 'button';
    const st = el('p', 'jr-privacy', cur ? 'Дневникът е заключен. ✔' : 'Без ключалка в момента.');
    b.addEventListener('click', async () => {
      const v = inp.value.trim();
      if (!v) {
        localStorage.removeItem('bl_pin_h'); localStorage.removeItem('bl_pin');
        st.textContent = 'Ключалката е махната.'; b.textContent = 'Заключи 🔒'; inp.value = ''; return;
      }
      if (!/^\d{4}$/.test(v)) { st.textContent = 'Точно 4 цифри, миличка. 😊'; return; }
      b.disabled = true;
      await setPin(v);
      b.disabled = false;
      pinOkThisSession = true;
      st.textContent = 'Заключено! Ще пита за ПИН при всяко влизане. ✔';
      b.textContent = 'Смени / махни ключалката'; inp.value = '';
    });
    c.appendChild(inp); c.appendChild(b); c.appendChild(st);
    // Честно за границите — вместо обещание, което не можем да удържим
    c.appendChild(el('p', 'jr-privacy',
      'Ключалката е <strong>перде, не сейф</strong>: спира любопитен поглед, но не пази от човек, който наистина се е захванал с телефона ти. Самият ПИН не се пази никъде — от него остава само отпечатък. И той <strong>не влиза</strong> в резервното копие.'));
    // 3.1.4: предупреждението ПРЕДИ, не след
    c.appendChild(el('p', 'jr-privacy',
      '⚠️ <strong>Забравиш ли го — никой не може да ти го върне</strong>, защото никъде го няма. Има само един път назад: след три опита се появява „Забравих ПИН-а“ и ключалката се маха — но заедно с всичко, което пази: дневничето, изповедите, „греховете“, яростта, реда за майка ти и парите ти. Затова избери цифри, които няма да забравиш и след безсънна нощ.'));
    return c;
  }

  // ═══════════ 🎤 ГЛАСОВ ВХОД в чата ═══════════

  function initMic() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const form = document.getElementById('roForm');
    if (!SR || !form || document.getElementById('roMic')) return;
    const mic = el('button', 'ro-mic', '🎤'); mic.type = 'button'; mic.id = 'roMic'; mic.setAttribute('aria-label', 'Говори');
    form.insertBefore(mic, form.querySelector('button[type="submit"]'));
    let rec = null;
    mic.addEventListener('click', () => {
      if (rec) { rec.stop(); return; }
      rec = new SR(); rec.lang = 'bg-BG'; rec.interimResults = false;
      mic.classList.add('rec');
      rec.onresult = e => { document.getElementById('roInput').value = e.results[0][0].transcript; };
      rec.onend = () => { mic.classList.remove('rec'); rec = null; };
      rec.onerror = () => { mic.classList.remove('rec'); rec = null; };
      try { rec.start(); } catch (e) { mic.classList.remove('rec'); rec = null; }
    });
  }

  // ═══════════ 🎂 „ДНЕС“ добавки: месечнина, имен ден, инсталиране ═══════════

  window.BL_TODAY_EXTRAS = function (baby, a) {
    let html = '';
    if (baby.birth && a && a.ym > 0 && a.days === 0) {
      // клиентски тест 21.07: банерът в „Днес" вече обявява месечнината — този чип
      // остава само за ДЕЙСТВИЕТО (споделяне), без да повтаря същия текст.
      html += `<button class="td-chip td-accent" data-x="bday">📤 Сподели месечнината 🎂</button>`;
    }
    // 3.3.3: веднъж, само ако мама е зървала стая 8, но не си е дала датата
    const посетени = load('bl_room_visited', {});
    if (посетени['Жената в мен'] && !(load('bl_me', {}).birth) && !load('bl_bday_ask_shown', false)) {
      html += `<button class="td-chip" data-x="mebday">🎂 Кога си родена? Отключва хороскопа и числото ти</button>`;
      save('bl_bday_ask_shown', true);              // 3.3.3: подканата се показва точно ВЕДНЪЖ
    }
    if (baby.name && D.names) {
      const now = new Date();
      const key = now.getDate() + ' ' + ['ян', 'фев', 'мар', 'апр', 'май', 'юни', 'юли', 'авг', 'сеп', 'окт', 'ное', 'дек'][now.getMonth()];
      const all = D.names.girl.concat(D.names.boy);
      const hit = all.find(x => x.n.toLowerCase() === baby.name.toLowerCase() && x.d === key);
      if (hit) html += `<button class="td-chip td-accent" data-x="nameday">🎉 Честит имен ден, ${esc(baby.name)}!</button>`;
    }
    if (window.BL_INSTALL) html += `<button class="td-chip" data-x="install">📲 Добави ме на екрана си</button>`;
    return html;
  };
  window.BL_TODAY_BIND = function (container, baby, a) {
    container.querySelectorAll('[data-x]').forEach(b => b.addEventListener('click', () => {
      const x = b.dataset.x;
      if (x === 'bday') {
        fx().confetti(b);
        shareCard({ emoji: '🎂', title: (baby.name || 'Бебето') + ' на ' + a.ym + (a.ym === 1 ? ' месец!' : ' месеца!'), sub: 'Времето лети, любовта расте 💜' });
      }
      if (x === 'nameday') { fx().confetti(b); shareCard({ emoji: '🎉', title: 'Честит имен ден, ' + baby.name + '!', sub: 'От цялото семейство, с обич' }); }
      if (x === 'install' && window.BL_INSTALL) { BL_INSTALL.prompt(); window.BL_INSTALL = null; }
      if (x === 'mebday' && window.MamaHelper) MamaHelper.open('Жената в мен');
    }));
    // конфети веднъж на месечнина — НО не двойно: банерът в rooms2 (bl_cheer_day)
    // вече пуска конфети днес, затова тук мълчим, ако той вече е гръмнал (клиентски тест 21.07)
    if (baby.birth && a && a.ym > 0 && a.days === 0 && load('bl_bday_shown', '') !== today() && load('bl_cheer_day', '') !== today()) {
      save('bl_bday_shown', today());
      setTimeout(() => fx().confetti(container), 600);
    }
  };

  // ═══════════ Регистрация на новите карти по стаи ═══════════

  const EXTRAS2 = {
    // (капсули/благодарности/разпускане вече живеят в базовия дневник — без дубли!)
    // breathCard МАХНАТ от Дневника (одит-флот П23, проход 2 №10): calm.js
    // „Дишай с формата" е втора пълна 4-7-8 карта в СЪЩАТА стая — пазим нея
    // (по-новата, план 19). В „Здраве и SOS" breathCard си остава.
    'Дневник на мама': r => { r.appendChild(badgesCard()); r.appendChild(shareMemCard()); r.appendChild(pinCard()); },
    'Моето бебе': r => { r.appendChild(lenHeadCard()); r.appendChild(soundsCard()); },
    'Здраве и SOS': r => сложи(r, breathCard()),
    'Развитие и игри': r => { r.appendChild(storyCard()); r.appendChild(shareMemCard()); }
  };
  Object.keys(EXTRAS2).forEach(room => {
    const base = window.ROOM_FEATURES && window.ROOM_FEATURES[room];
    if (base) window.ROOM_FEATURES[room] = root => { base(root); EXTRAS2[room](root); };
  });

  document.addEventListener('DOMContentLoaded', initMic);
})();
