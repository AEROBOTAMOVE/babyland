// ═══════════════════════════════════════════════════════════
// НОЩНА РАВНОСМЕТКА (проход 4) — единственото място, което брои
// НЕЙНАТА умора, не бебешката статистика.
// Сутрин (6–11ч): „Тази нощ ставаше 4 пъти. Виждам те. 💜"
// Без графики, без число-присъда — само валидиране. При празни
// данни / бременност / загуба — нищо. При тон „на ръба" — само прегръдка.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { if (window.BL_ZAPIS_PADNA) BL_ZAPIS_PADNA(); return false; } return true; };
  const localDate = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const днес = () => localDate(new Date());

  function нощнаРавносметка(container) {
    const inner = container && container.querySelector('.td-inner');
    if (!inner || inner.classList.contains('td-welcome') || inner.querySelector('.nr-recap')) return; // идемпотентно
    const h = new Date().getHours();
    if (h < 6 || h > 11) return;                                  // само сутрин
    if (window.BL_FIRSTDAY && load('bl_day1', '') === днес()) return; // тих първи ден
    if (load('bl_nightrecap_seen', '') === днес()) return;         // веднъж на ден
    // 🔗 инвентар: брои И нощните хранения, И сегментите сън — майка, която бележи
    // само съня (не таймера за кърмене), също получаваше празна равносметка.
    const храни = load('bl_nursing', []);
    const сън = load('bl_sleep', null);
    const внощ = ts => { const hh = new Date(ts).getHours(); return (Date.now() - ts) < 14 * 3600e3 && (hh >= 22 || hh < 7); };
    const имаДанни = храни.length || (сън && ((сън.segs && сън.segs.length) || сън.open));
    if (!имаДанни) return;                                        // без реални данни — нищо (покрива бременна/загуба)

    const тон = (window.BL_FIRSTDAY && BL_FIRSTDAY.тонДнес) ? BL_FIRSTDAY.тонДнес() : '';
    let текст;
    if (тон === 'на ръба') {
      текст = 'Знам, че нощта беше дълга. Днес нищо не броим — просто съм до теб. 🫂';
    } else {
      const хранНощ = храни.filter(it => внощ(it.ts)).length;
      const сънНощ = (сън && сън.segs) ? сън.segs.filter(s => внощ(s.s) || внощ(s.e)).length : 0;
      const брой = Math.max(хранНощ, сънНощ);
      // 🔴🔴 04.08 (петте майки): портата „имаДанни“ горе проверява дали
      //    СЪЩЕСТВУВАТ записи изобщо — без ограничение по време. Затова майка,
      //    ползвала таймера преди дни, а СНОЩИ не (една ръка, тъмно, бебе на
      //    гърдата), минаваше с брой 0 и получаваше „Тази нощ спа по-дълго“
      //    след шест ставания. Липсата на запис се четеше като доказателство
      //    за сън — точно забраненото. Приложението ѝ казваше, че нощта ѝ не
      //    е била такава, каквато е била.
      //    Сега твърдим САМО това, което сме видели.
      if (брой >= 1) {
        текст = 'Тази нощ ставаше <strong>' + брой + '</strong> ' + (брой === 1 ? 'път' : 'пъти') + '. Знам колко е тежко. Виждам те. 💜';
      } else {
        return;   // нищо записано за ТАЗИ нощ → не гадаем и не показваме карта
      }
    }
    const el = document.createElement('div');
    el.className = 'nr-recap';
    el.innerHTML = текст;                                          // само статичен текст, без потребителски вход
    inner.appendChild(el);
    save('bl_nightrecap_seen', днес());
  }

  const предишното = window.BL_TODAY_BIND;
  window.BL_TODAY_BIND = function (container, baby, a) {
    if (предишното) предишното(container, baby, a);
    try { нощнаРавносметка(container); } catch (e) {}
  };
})();
