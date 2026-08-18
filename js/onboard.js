// ═══════════════════════════════════════════════════════════
// ПЪРВО ЗАПОЗНАВАНЕ — топъл onboarding, който прави апп-а личен
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); if (v == null) return d; if (Array.isArray(d) !== Array.isArray(v)) return d; if (d && typeof d === 'object' && (!v || typeof v !== 'object')) return d; return v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  let sex = '';   // 04.08: без подразбиращ се пол — кривите на СЗО са различни
  // 22.07 (армия): какво сме сложили АВТОМАТИЧНО в полето за дата. Само то
  //   се чисти при превключване „чакам“ → „роди се“; дата, написана от
  //   мама, не се пипа никога.
  let предложенаОДР = '';

  function open() {
    const baby = load('bl_baby', { name: '', sex: '', birth: '' });
    $('onbName').value = baby.name || '';
    sex = baby.sex || '';
    $('onbSex').querySelectorAll('.onb-sexbtn').forEach(b => b.classList.toggle('on', b.dataset.sex === sex));
    $('onbDate').value = baby.birth || '';
    $('onbDate').max = (function(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})(new Date());
    // 🤰 ако мама е бременна (има bl_lmp, няма роден ден) → покажи „Още чакам"
    // и обратно-сметнатата ОДР, за да не вижда „момиче" при редакция (проход 2 №9)
    // 🤍 11.08 (жива обиколка): ТОЗИ четец заобикаляше вратаря BL_EXPECT —
    //    единственият останал в приложението. Измерено наживо с включена пауза
    //    (жена, спряла броенето след загуба): BL_EXPECT.lmp() връща '', а екранът
    //    пак светваше „Още чакам“ и попълваше сметнатата ОДР (2026-11-08) в
    //    полето. Тоест мястото, където тя влиза да си оправи профила, ѝ
    //    пре-утвърждаваше бременността, която е спряла. Паузата НЕ трие нищо:
    //    bl_lmp си стои, „Върни броенето“ в настройките връща и този екран.
    //    Същият израз, който ползват другите ~20 четци.
    //    ПЪТ НАЗАД: `const _lmp = load('bl_lmp', '');`.
    const _lmp = (window.BL_EXPECT && BL_EXPECT.lmp) ? BL_EXPECT.lmp() : load('bl_lmp', '');
    if (!baby.birth && _lmp && !isNaN(new Date(_lmp))) {
      sex = 'wait';
      $('onbSex').querySelectorAll('.onb-sexbtn').forEach(b => b.classList.toggle('on', b.dataset.sex === 'wait'));
      предложенаОДР = new Date(new Date(_lmp).getTime() + 280 * 86400000).toISOString().slice(0, 10);
      $('onbDate').value = предложенаОДР;
    }
    // проход 3 S6: възстанови избраната недоносеност (гестационна седмица)
    if ($('onbPreterm')) $('onbPreterm').value = String(load('bl_preterm', 0) || 0);
    updateDateLbl();
    // 3.3.1: по избор — рождената дата на МАМА (не на бебето), отключва стая 8.
    // Пази СЪЩИЯ ключ bl_me, който вече ползват хороскопа/числото/тарото.
    const me = load('bl_me', { birth: '', name: '' });
    $('onbMeDate').value = me.birth || '';
    $('onbMeDate').max = $('onbDate').max;
    $('onbOverlay').hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function close() {
    try { if (window.BL_GREET) BL_GREET(); } catch (e) {}   // поздравът става личен веднага
    // 🔴 18.08 (жива обиколка на таба „Вход/Профил“): и „Готово“, и „По-късно“
    //    записват bl_onboarded, а profile.js смята надписа на долния бутон
    //    само веднъж — при зареждане. Резултат: бутонът пише „🔑 Вход“, а
    //    отваря профила. Един ред тук държи надписа честен веднага.
    //    ПЪТ НАЗАД: махни следващия ред.
    try { if (window.BL_PROFILE && BL_PROFILE.refresh) BL_PROFILE.refresh(); } catch (e) {}
    $('onbOverlay').hidden = true;
    document.body.style.overflow = '';
  }
  function updateDateLbl() {
    const waiting = sex === 'wait';
    $('onbDateLbl').textContent = waiting ? 'Очаквана дата на раждане (по желание):' : 'Рождена дата:';
    $('onbDate').max = waiting ? '' : (function(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');})(new Date());
    // проход 3 S6: полето за недоносеност има смисъл само за РОДЕНО бебе (не за чакащата)
    const pw = $('onbPretermWrap'); if (pw) pw.hidden = waiting;
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!$('onbOverlay')) return;
    $('onbSex').addEventListener('click', e => {
      const b = e.target.closest('.onb-sexbtn'); if (!b) return;
      const предишен = sex;
      sex = b.dataset.sex;
      // 🚨 22.07 (армия): при „Още чакам“ в полето стои ОБРАТНО СМЕТНАТАТА ОДР.
      //   Натиснеше ли „Момиче/Момче“ след раждането, сменяше се само етикетът
      //   и мама записваше ОЧАКВАНАТА дата като рождена — с едно докосване.
      //   Оттам тръгват сгрешени възраст, ваксинационен календар и захранване.
      //   Чистим само нашето предложение, не и нейн текст.
      if (предишен === 'wait' && sex !== 'wait' && предложенаОДР &&
          $('onbDate').value === предложенаОДР) {
        $('onbDate').value = '';
        предложенаОДР = '';
      }
      $('onbSex').querySelectorAll('.onb-sexbtn').forEach(x => x.classList.toggle('on', x === b));
      updateDateLbl();
    });
    $('onbSave').addEventListener('click', () => {
      const waiting = sex === 'wait';
      // и втори предпазител: рождена дата в бъдещето прави BL_AGE null и цялото
      // приложение се държи, все едно няма бебе. По-добре питаме сега.
      if (!waiting && $('onbDate').value) {
        const д = new Date($('onbDate').value);
        if (!isNaN(д) && д.getTime() > Date.now() + 86400000) {
          $('onbDate').classList.add('bl-нужно');
          if (window.BL_FX && BL_FX.cheer) BL_FX.cheer('Тази дата е в бъдещето 💛 Ако още чакаш — избери „Още чакам“.');
          setTimeout(() => $('onbDate').classList.remove('bl-нужно'), 1400);
          return;
        }
      }
      const baby = { name: $('onbName').value.trim(), sex: waiting ? '' : sex, birth: waiting ? '' : $('onbDate').value };
      save('bl_baby', baby);
      // 🤰 БРЕМЕННАТА (одит-флот П23, проход 2 №1): очакваната дата на раждане
      // отваря ЦЯЛАТА бременностна машина (седмици, калкулатор, приспиване на
      // стаите). Досега датата се ИЗХВЪРЛЯШЕ и апп-ът стоеше празен пред точно
      // тази майка. Пазим bl_lmp (последна менструация = ОДР − 280 дни), както
      // preg20/BL_EXPECT очакват; иначе чистим, ако е избрала друго.
      if (waiting) {
        const due = $('onbDate').value;
        if (due && !isNaN(new Date(due))) {
          const lmp = new Date(new Date(due).getTime() - 280 * 86400000);
          save('bl_lmp', lmp.toISOString().slice(0, 10));
        }
      } else if ($('onbDate').value) {
        localStorage.removeItem('bl_lmp');   // роди се → бременността приключи
      }
      // проход 3 S6: недоносеност (само за родено бебе) — коригираната възраст
      // мери развитието/храните/съня; ageFromBirth приема гестационни седмици 24-36.
      if (!waiting && $('onbPreterm')) {
        const gc = parseInt($('onbPreterm').value, 10) || 0;
        if (gc >= 24 && gc <= 36) save('bl_preterm', gc); else localStorage.removeItem('bl_preterm');
      }
      // по избор: рождената дата на мама, ако я е дала
      const meDate = $('onbMeDate').value;
      if (meDate) { const me = load('bl_me', { birth: '', name: '' }); save('bl_me', { name: me.name || '', birth: meDate }); }
      save('bl_onboarded', true);
      // проход 4: най-топлият пръв момент — мека вибрация + лично „здравей".
      if (window.BL_FX) { BL_FX.buzz(14); if (BL_FX.cheer) BL_FX.cheer('Здравей 💜 Радвам се, че сте тук.'); }
      close();
      if (window.refreshToday) window.refreshToday();
      // 🤰 проход 2 №8: бременната да ВИДИ какво отключи датата ѝ — водим я
      // право в събудената стая, вместо да я оставим да я търси сама
      if (waiting && $('onbDate').value && window.MamaHelper) {
        setTimeout(() => { try { MamaHelper.open('Бременност'); } catch (e) {} }, 450);
      }
    });
    $('onbSkip').addEventListener('click', () => { save('bl_onboarded', true); close(); });
    // клик на фона = само затваряне, БЕЗ отписване — случайно докосване не
    // бива да убие меката покана завинаги (одит-флот П23, проход 2 №12);
    // трайното „не ми показвай повече" е само изричният бутон „Прескочи".
    $('onbOverlay').addEventListener('click', e => { if (e.target === $('onbOverlay')) close(); });

    // първо посещение → меко покани (веднъж). НО изчакай обиколката: на самото
    // първо пускане турът е пълноекранен; двата оверлея се блъскаха (онбордингът
    // дори отключваше скрола, докато турът е още отворен). Затова автопоканата
    // тръгва само СЛЕД като турът е приключил (bl_tour_done). При първо пускане
    // самият тур пуска онбординга след себе си (home.js close()).
    let турГотов = false; try { турГотов = !!localStorage.getItem('bl_tour_done'); } catch (e) {}
    if (турГотов && !load('bl_onboarded', false) && !load('bl_baby', { birth: '' }).birth) {
      setTimeout(open, 900);
    }
  });

  window.BL_ONBOARD = { open, close };
})();
