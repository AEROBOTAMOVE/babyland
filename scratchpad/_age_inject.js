function load(k,d){try{const v=localStorage.getItem(k);if(v==null)return d;try{return JSON.parse(v);}catch(e){return v;}}catch(e){return d;}}
  const денНула = v => {
    if (v instanceof Date) return isNaN(v) ? v : new Date(v.getFullYear(), v.getMonth(), v.getDate());
    const m = typeof v === 'string' && /^(\d{4})-(\d{2})-(\d{2})/.exec(v);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);   // локална полунощ, без засечката с UTC
    const x = new Date(v);
    return isNaN(x) ? x : new Date(x.getFullYear(), x.getMonth(), x.getDate());
  };
  const дниМежду = (a, b) => Math.round((b - a) / 86400000);   // цели дни, не часове
function pretermWeeks() {
    const w = +load('bl_preterm', 0);
    return (w >= 24 && w <= 36) ? w : 0;      // под 24 и над 36 не коригираме
  }
function ageFromBirth(birth, днес) {
    if (!birth) return null;
    const b = денНула(birth);
    const now = денНула(днес === undefined || днес === null || днес === '' ? new Date() : днес);
    if (isNaN(b) || isNaN(now) || b > now) return null;
    const totalDays = дниМежду(b, now);
    const months = totalDays / 30.4375;
    let ym = now.getFullYear() * 12 + now.getMonth() - (b.getFullYear() * 12 + b.getMonth());
    // 🔴 19.08 (ИЗМЕРЕНО, 153 сблъсъка): броят месеци се сваляше по ГОЛИЯ ден
    //    от календара (`now.getDate() < b.getDate()`), а месечнината в банера
    //    се празнува по КЛАМПНАТАТА дата (BL_DATE.addMonths). За бебе, родено
    //    на 31-ви, двете се разминаваха във всеки къс месец: на 28.02 екранът
    //    пишеше „Мира е на 28 дни“ и точно под него „🎉 Днес Мира празнува
    //    1-месечнина“. Един екран, две възрасти — и майката вярва на едното.
    //    Сега месеците се броят със СЪЩОТО клампване, което празнува банерът.
    //    ПЪТ НАЗАД: `if (now.getDate() < b.getDate()) ym--;`
    const наДен = д => window.BL_DATE
      ? BL_DATE.addMonths(b, д)
      : (function () {
          const край = new Date(b.getFullYear(), b.getMonth() + д + 1, 0).getDate();
          return new Date(b.getFullYear(), b.getMonth() + д, Math.min(b.getDate(), край));
        })();
    if (наДен(ym) > now) ym--;
    if (ym < 0) ym = 0;
    // 🚨 22.07 (армия, RED): котвата преливаше. `new Date(2026, 1, 31)` НЕ се
    //   клампва — става 3 март. За бебе, родено на 31-во число, разликата
    //   ставаше ОТРИЦАТЕЛНА и мама четеше „1 месец и -2 дни“ — на началния
    //   екран, в бележката за прегледа и в картичката за бабата. Проектът си
    //   има готовото клампване (BL_DATE.addMonths), само че тук не се ползваше.
    const котва = наДен(ym);
    const days = Math.max(0, дниМежду(котва, now));
    const a = { months, totalDays, ym, days,
      // „мес“ + „а“ правеше „4 меса“. Правилното е месец / месеца.
      // (19.08: и „1 дни“ на първия ден — числото и думата до него трябва да си
      //  пасват, точно както по-долу при „и 1 ден“.)
      text: ym < 1 ? `${totalDays} ${totalDays === 1 ? 'ден' : 'дни'}` : `${ym} ${ym === 1 ? 'месец' : 'месеца'}${days ? ' и ' + days + (days === 1 ? ' ден' : ' дни') : ''}` };

    const pw = pretermWeeks();
    a.preterm = pw || 0;
    if (pw && totalDays < 730) {                       // коригира се до 2 години
      const назад = (40 - pw) * 7;                     // колко дни по-рано е дошло
      const cd = Math.max(0, totalDays - назад);
      const cm = cd / 30.4375;
      a.corr = { totalDays: cd, months: cm, ym: Math.floor(cm),
        text: cm < 1 ? `${cd} ${cd === 1 ? 'ден' : 'дни'}` : `${Math.floor(cm)} ${Math.floor(cm) === 1 ? 'месец' : 'месеца'}` };
      a.devMonths = cm;                                // по това се мери РАЗВИТИЕТО
      a.note = `на ${a.text} · <strong>${a.corr.text} коригирани</strong> — мерим по тях`;
    } else {
      a.corr = null;
      a.devMonths = months;
      a.note = '';
    }
    return a;
  }
window.BL_AGE = ageFromBirth;
