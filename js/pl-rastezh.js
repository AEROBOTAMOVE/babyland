/* ═══════════════════════════════════════════════════════════════════════════════
   📏 „РАСТЕМ ПО СВОЙ РИТЪМ · МОИТЕ ИЗМЕРВАНИЯ“ · стаята „Моето бебе“, кътчето „Как расте“
   (референция 16 на собственика, 22.09.2026)

   Веднага под заглавието на кътчето (.sec-head#sec-bg, polish.js:98–101 го строи от
   order4.js:17), над „Профилът на бебето“, ВЪРХУ СЦЕНАТА на стаята: филцова плочка (.pl-felt)
   със серифното „Растем по свой ритъм“ и плюшен жираф, който се мери до дървена линийка
   (сърцето = последният ръст от bl_growth_len; без ръст — само линийката 50…90),
   и филцова карта „Моите измервания“ — хапчета Тегло / Ръст / Обиколка (.pl-soft; избраното = .pl-gel),
   графика с розова линия и мека розова площ под нея, точки с етикети, голяма карта
   „Последен запис 7,2 кг · 20 септември 2026“, списък „20 сеп · 7,2 кг ›“, голям розов
   „+ Добави измерване“ и ред „Личен дневник, без оценка на развитието.“

   НИЩО НЕ ЗАПИСВА И НЕ СЪЗДАВА КЛЮЧОВЕ. Чете същите ключове, които пишат старите карти:
     · Тегло    = bl_growth[]      {d, m, w, p} — rooms2.js:471–473 (калкулаторът, „Изчисли 📊“);
                  същите граници като там: 0,4–30 кг (rooms2.js:427–429);
     · Ръст     = bl_growth_len[]  {d, m, v} — extras.js:748–783; граници 30–120 см (extras.js:692);
     · Обиколка = bl_growth_head[] {d, m, v} — същото място; граници 25–65 см (extras.js:692).
     Четенето е като load(к, []) в rooms2.js:10 — не-масив е празно. Едно мерене на ден:
     последният ред за деня печели (както „поДата“ в extras.js:760–761) — калкулаторът на
     теглото добавя ред при ВСЕКИ клик (rooms2.js:472), без замяна за деня, и пет опита за
     верния номер иначе щяха да са пет точки. Ред без дата ГГГГ-ММ-ДД или с число извън
     границите не се рисува (както checkups.js:244 прескача кривите редове).
     Персентилът (`p`) НЕ се показва: това е личен дневник, без оценка на развитието —
     присъдите си остават в калкулатора, с неговите уговорки за педиатъра.

   ДЕЙСТВИЯ — викат съществуващото:
     · „+ Добави измерване“ → Тегло: картата „Калкулатор на растежа“ (rooms2.js:349);
       Ръст / Обиколка: картата „Ръст и главичка“ (extras.js:635), където се натиска НЕЙНИЯТ
       чип 📏/⭕ (extras.js:639–650 сменя metric и подсказката). Сгъната карта се разгъва с
       НЕЙНИЯ ▾ (polish.js:226–247, пази bl_folds); скрита от търсачката на стаята
       (polish.js:78–89) — чистим полето със събитие input. После скрол + фокус в полето.
       Самото записване го прави мама в старата карта, по старите пазачи.
     · ред от списъка / точка на графиката → само избира записа в голямата карта.

   🪤 Капаните (хванати в тази сесия и от съседите):
     · #roRoom се СМЕНЯ при отваряне на стая → гледаме статичния #roomOverlay (поддърво),
       с отлагане по setTimeout 40 мс (rAF спира, когато страницата не се рисува);
     · всяка моя промяна е мутация → пиша САМО при разлика (подпис на данните + ширината),
       иначе безкраен кръг;
     · стаята понякога се рисува два пъти → querySelectorAll, не един елемент;
     · #roRoom е flex колона с фиксирана височина → блокът е flex:none (в css/pl-rastezh.css);
     · картите на стаята са content-visibility:auto (mega.css:336) → целта на скока бягаше;
       след скок #roRoom[data-pl-rz-go] ги рисува истински, до затваряне на стаята.

   ПЪТ НАЗАД: махни <script src="js/pl-rastezh.js"> и <link href="css/pl-rastezh.css">
   (ако са вкарани в index.html). Блокът е само добавен елемент (section.pl-rz) — картите
   под него остават каквито бяха.
   ═══════════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.BL_PL_RASTEZH) return;

  const МЕСЕЦИ = ['януари', 'февруари', 'март', 'април', 'май', 'юни', 'юли', 'август', 'септември', 'октомври', 'ноември', 'декември'];
  const МЕС = ['яну', 'фев', 'мар', 'апр', 'май', 'юни', 'юли', 'авг', 'сеп', 'окт', 'ное', 'дек'];
  // [лист, ред, колона] в img/art/ico-*.webp (4×4)
  const МЕРКИ = {
    w: {
      ключ: 'bl_growth', поле: 'w', име: 'Тегло', ед: 'кг', мин: 0.4, макс: 30, ик: ['ico-d', 2, 3],
      карта: 'Калкулатор на растежа', празно: 'Още няма записано тегло.', добави: 'Добави измерване на теглото',
    },
    len: {
      ключ: 'bl_growth_len', поле: 'v', име: 'Ръст', ед: 'см', мин: 30, макс: 120, ик: ['ico-a', 1, 2],
      карта: 'Ръст и главичка', чип: /Ръст/, празно: 'Още няма записан ръст.', добави: 'Добави измерване на ръста',
    },
    head: {
      ключ: 'bl_growth_head', поле: 'v', име: 'Обиколка', ед: 'см', мин: 25, макс: 65, ик: ['ico-b', 3, 2],
      карта: 'Ръст и главичка', чип: /Обиколка/, празно: 'Още няма записана обиколка на главата.', добави: 'Добави измерване на обиколката на главата',
    },
  };
  const РЕД = ['w', 'len', 'head'];
  const ЖИРАФ = ['ico-d', 2, 2];
  const ВИС = 250;            // височината на графиката (px) — същата е и в css
  const В_ГРАФИКАТА = 8;      // последните 8 мерения; списъкът под „Всички записи“ има всичко
  const В_СПИСЪКА = 4;        // като в референцията

  // състоянието е само в паметта на страницата (нов ключ в localStorage не трябва)
  let мярка = 'w';
  let избран = null;          // дата ГГГГ-ММ-ДД, избрана от ред/точка; null = последният запис
  let всички = false;
  let брояч = 0;              // уникални id за градиента (стаята понякога е два пъти в DOM)
  const грешки = [];

  const ДАТА = /^(\d{4})-(\d{2})-(\d{2})$/;
  const двуц = n => String(n).padStart(2, '0');
  const чети = к => { try { const v = JSON.parse(localStorage.getItem(к)); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
  const ден = s => { const м = ДАТА.exec(s); return Date.UTC(+м[1], +м[2] - 1, +м[3]) / 864e5; };
  const части = s => { const м = ДАТА.exec(s); return [+м[1], +м[2], +м[3]]; };
  const кратка = s => { const [, м, д] = части(s); return двуц(д) + ' ' + МЕС[м - 1]; };
  const оска = s => { const [, м, д] = части(s); return двуц(д) + '.' + двуц(м); };
  const пълна = s => { const [г, м, д] = части(s); return д + ' ' + МЕСЕЦИ[м - 1] + ' ' + г; };
  function днесКлюч() { const д = new Date(); return д.getFullYear() + '-' + двуц(д.getMonth() + 1) + '-' + двуц(д.getDate()); }
  function отКога(s) {
    const н = Math.round(ден(днесКлюч()) - ден(s));
    if (н < 0) return '';                      // дата „в бъдещето“ (сбъркан часовник) — без думи
    if (н === 0) return 'днес';
    if (н === 1) return 'вчера';
    if (н < 45) return 'преди ' + н + ' дни';
    const м = Math.round(н / 30.44);
    return м === 1 ? 'преди 1 месец' : 'преди ' + м + ' месеца';
  }
  // 7 → „7,0“, 7.25 → „7,25“ (кг); 65 → „65“, 66.4 → „66,4“ (см). Запетаята е българската.
  function число(к, v) {
    if (к === 'w') { const с = Math.round(v * 100); return (с % 10 ? (с / 100).toFixed(2) : (с / 100).toFixed(1)).replace('.', ','); }
    const д = Math.round(v * 10); return (д % 10 ? (д / 10).toFixed(1) : String(д / 10)).replace('.', ',');
  }
  const ико = (ик, клас) => '<span class="' + клас + '" aria-hidden="true" style="background-image:url(img/art/' + ик[0] +
    '.webp);background-position:' + (ик[2] * 100 / 3) + '% ' + (ик[1] * 100 / 3) + '%"></span>';

  function записи(к) {
    const М = МЕРКИ[к];
    const поДата = {};
    чети(М.ключ).forEach(х => {
      if (!х || typeof х !== 'object' || typeof х.d !== 'string' || !ДАТА.test(х.d)) return;
      const с = х[М.поле];
      if (с == null || с === '') return;
      const ч = Number(с);
      if (!isFinite(ч) || ч < М.мин || ч > М.макс) return;
      поДата[х.d] = { d: х.d, v: ч };            // по-късният ред за същия ден печели
    });
    return Object.keys(поДата).sort().map(д => поДата[д]);
  }

  // ── графиката: собствен SVG, 1 единица = 1 px (viewBox = истинската ширина) ──
  function графиката(данни, к, Ш, ид, избД) {
    const М = МЕРКИ[к], Н = ВИС;
    const пл = 30, пд = 12, пг = 34, пдн = 28;           // полета: ляво (числата), дясно, горе, долу (датите)
    const x0 = пл + 16, x1 = Ш - пд - 22;               // точките не лепнат по ръбовете
    const долЛиния = Н - пдн;
    const ys = данни.map(д => д.v);
    const мин = Math.min.apply(null, ys), макс = Math.max.apply(null, ys);
    const обхват = Math.max(макс - мин, к === 'w' ? 1 : 2);
    // „кръгла“ стъпка, 2–5 деления; при едно мерене точката стои в средата
    let ст = 1, долу = 0, горе = 0;
    for (const с of (обхват < 1 ? [0.5, 1, 2, 5, 10, 20] : [1, 2, 5, 10, 20])) {
      ст = с;
      долу = Math.floor((мин - обхват * 0.2) / с) * с;
      горе = Math.ceil((макс + обхват * 0.3) / с) * с;
      while ((горе - долу) / с < 2) { долу -= с; if ((горе - долу) / с < 2) горе += с; }
      if ((горе - долу) / с <= 5) break;
    }
    if (долу < 0) долу = 0;
    const Y = v => пг + (1 - (v - долу) / (горе - долу)) * (долЛиния - пг);
    const дни = данни.map(д => ден(д.d));
    const t0 = дни[0], t1 = дни[дни.length - 1];
    // Хоризонталата е ВРЕМЕТО (дни), не поредният номер — две мерения през седмица и през
    // три месеца не бива да изглеждат еднакво далеч. Етикетите, които биха се застъпили, се крият.
    const X = t => t1 > t0 ? x0 + (t - t0) / (t1 - t0) * (x1 - x0) : (x0 + x1) / 2;
    const т = данни.map((д, i) => ({ d: д.d, v: д.v, x: X(дни[i]), y: Y(д.v) }));
    const посл = т.length - 1;
    const f = n => n.toFixed(1);
    let svg = '<svg class="pl-rz-svg" viewBox="0 0 ' + Ш + ' ' + Н + '" width="' + Ш + '" height="' + Н + '" aria-hidden="true" focusable="false">' +
      '<defs><linearGradient id="' + ид + '-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="pl-rz-s1"/><stop offset="1" class="pl-rz-s2"/></linearGradient></defs>' +
      '<text class="pl-rz-unit" x="8" y="18">' + М.ед + '</text>';
    // мека мрежа „милиметрова хартия“ (реф. 16): хоризонтали на деленията и по средата между тях,
    // вертикали през ~22 px — квадратчета, не ивици
    for (let v = долу; v <= горе + 1e-9; v += ст) {
      const y = Y(v);
      svg += '<line class="pl-rz-gl" x1="' + пл + '" x2="' + (Ш - пд) + '" y1="' + f(y) + '" y2="' + f(y) + '"/>' +
        '<text class="pl-rz-yl" x="' + (пл - 6) + '" y="' + f(y + 4) + '" text-anchor="end">' + String(Math.round(v * 10) / 10).replace('.', ',') + '</text>';
      if (v + ст <= горе + 1e-9) { const ym = Y(v + ст / 2); svg += '<line class="pl-rz-gm" x1="' + пл + '" x2="' + (Ш - пд) + '" y1="' + f(ym) + '" y2="' + f(ym) + '"/>'; }
    }
    const колони = Math.max(4, Math.round((Ш - пд - пл) / 22));
    for (let i = 1; i < колони; i++) { const x = пл + (Ш - пд - пл) * i / колони; svg += '<line class="pl-rz-gv" x1="' + f(x) + '" x2="' + f(x) + '" y1="' + пг + '" y2="' + долЛиния + '"/>'; }
    svg += '<line class="pl-rz-base" x1="' + пл + '" x2="' + (Ш - пд) + '" y1="' + долЛиния + '" y2="' + долЛиния + '"/>';
    if (т.length > 1) {
      const линия = т.map(п => f(п.x) + ',' + f(п.y)).join(' ');
      svg += '<path class="pl-rz-area" fill="url(#' + ид + '-g)" d="M' + f(т[0].x) + ',' + долЛиния + ' L' + линия.split(' ').join(' L') + ' L' + f(т[посл].x) + ',' + долЛиния + ' Z"/>' +
        '<polyline class="pl-rz-line" points="' + линия + '"/>';
    }
    // точките: последната е голяма, с ореол; избраната — с пръстен
    т.forEach((п, i) => {
      if (i === посл) svg += '<circle class="pl-rz-halo" cx="' + f(п.x) + '" cy="' + f(п.y) + '" r="13"/><circle class="pl-rz-pt last" cx="' + f(п.x) + '" cy="' + f(п.y) + '" r="7.5"/>';
      else svg += '<circle class="pl-rz-pt" cx="' + f(п.x) + '" cy="' + f(п.y) + '" r="5"/>';
      if (п.d === избД && i !== посл) svg += '<circle class="pl-rz-ring" cx="' + f(п.x) + '" cy="' + f(п.y) + '" r="10"/>';
    });
    // етикетите: първо избраният и последният, после отзад напред — само ако не се застъпват
    const ред = [];
    const иИзбр = т.findIndex(п => п.d === избД);
    if (иИзбр >= 0 && иИзбр !== посл) ред.push(иИзбр);
    ред.push(посл);
    for (let i = посл - 1; i >= 0; i--) if (i !== иИзбр) ред.push(i);
    // Сблъсъкът се мери в ДВЕ посоки (кутия x×y): линията расте, съседните етикети стоят на
    // различна височина и не си пречат, макар да се застъпват по хоризонтала. Точките са
    // препятствия също — етикет не покрива чужда точка. Не става отгоре → пробваме отдолу.
    const заети = т.map(п => [п.x - 6, п.x + 6, п.y - 6, п.y + 6]);
    const свободно = (к4, свой) => заети.every((з, j) => j === свой || к4[1] < з[0] - 2 || к4[0] > з[1] + 2 || к4[3] < з[2] - 1 || к4[2] > з[3] + 1);
    const етикети = [];
    ред.forEach(i => {
      const п = т[i], голям = i === посл;
      const текст = число(к, п.v) + ' ' + М.ед;
      const шир = текст.length * (голям ? 8.2 : 6.6), вис = голям ? 14 : 11;
      // страната според наклона: линията НАГОРЕ след точката → етикетът отляво (иначе я пресича);
      // линията идва ОТГОРЕ преди точката → отдясно; иначе в средата
      const сл = т[i + 1], пр = т[i - 1];
      let x = п.x, котва = 'middle', а = x - шир / 2, б = x + шир / 2;
      let първоДолу = false;
      if (!голям && сл && сл.y < п.y - 3) {
        x = п.x + 5; котва = 'end'; а = x - шир; б = x;
        // 🪤 (снимка ag_rastezh_l3): първата точка стои до лявия ръб — етикетът „отляво“ се
        //   избутваше надясно, точно върху линията нагоре. Там отиваме ПОД точката, надясно.
        if (а < пл + 2) { x = п.x - 4; котва = 'start'; а = x; б = x + шир; първоДолу = true; }
      } else if (!голям && пр && пр.y < п.y - 3) {
        x = п.x - 5; котва = 'start'; а = x; б = x + шир;
        if (б > Ш - 4) { x = п.x + 4; котва = 'end'; а = x - шир; б = x; първоДолу = true; }
      }
      if (б > Ш - 4) { x = Ш - 4; котва = 'end'; а = x - шир; б = x; }
      if (а < пл + 2) { x = пл + 2; котва = 'start'; а = x; б = x + шир; }
      const нагоре = п.y - (голям ? 15 : 11), надолу = п.y + (голям ? 26 : 20);
      const варианти = (първоДолу || нагоре - вис < пг - 20 ? [надолу, нагоре] : [нагоре, надолу]).filter(y => y - вис > 2 && y < долЛиния - 2);
      const y = варианти.find(yy => свободно([а, б, yy - вис, yy + 2], i));
      if (y == null) return;
      заети.push([а, б, y - вис, y + 2]);
      етикети.push('<text class="pl-rz-vl' + (голям ? ' last' : '') + (i === иИзбр ? ' sel' : '') + '" x="' + f(x) + '" y="' + f(y) + '" text-anchor="' + котва + '">' + текст + '</text>');
    });
    // датите долу: последната, първата, после отзад напред
    const заетиД = [];
    const редД = [посл].concat(посл > 0 ? [0] : []);
    for (let i = посл - 1; i > 0; i--) редД.push(i);
    редД.forEach(i => {
      const п = т[i], шир = 28;              // „15.08“ на 11px Nunito ≈ 27px (с 30 се криеше 15.08 при 196px графика)
      let x = п.x, котва = 'middle', а = x - шир / 2, б = x + шир / 2;
      if (б > Ш - 2) { x = Ш - 2; котва = 'end'; а = x - шир; б = x; }
      if (заетиД.some(з => !(б < з[0] - 1 || а > з[1] + 1))) return;
      заетиД.push([а, б]);
      етикети.push('<text class="pl-rz-xl" x="' + f(x) + '" y="' + (Н - 9) + '" text-anchor="' + котва + '">' + оска(п.d) + '</text>');
    });
    svg += етикети.join('') + '</svg>';
    return { svg, точки: т.map(п => ({ x: п.x, d: п.d })) };
  }

  // ── скелетът: строи се веднъж; живите части се пишат само при разлика ──
  function строй() {
    const с = document.createElement('section');
    const ид = 'plrz' + (++брояч);
    с.className = 'pl-rz';
    с.setAttribute('data-pl', 'rastezh');
    с.setAttribute('aria-labelledby', ид + '-h');
    // МАТЕРИАЛИТЕ са общите (css/pl-ui.css): панелите = .pl-felt (филц с шев), главното действие
    // = .pl-gel (розов гел), второстепенното = .pl-soft (кремав филц; aria-pressed = избрано).
    // Избраното хапче става .pl-gel (в референцията то е розовият гел) — сменя се в обнови().
    с.innerHTML =
      '<div class="pl-rz-top pl-felt">' +
        '<div class="pl-rz-tt"><p class="pl-rz-t">Растем<br>по свой ритъм</p>' +
        '<p class="pl-rz-tp">Всяко малко постижение<br>е голяма радост! <i aria-hidden="true">♡</i></p></div>' +
        // жирафът се мери до дървена линийка (реф. 16); сърцето = последният ръст (bl_growth_len)
        '<div class="pl-rz-fig" aria-hidden="true">' + ико(ЖИРАФ, 'pl-rz-gir') +
          '<span class="pl-rz-rul"><span class="pl-rz-sc">' +
            [0, 1, 2, 3, 4].map(i => '<i style="bottom:' + (i * 25) + '%"><b>' + (50 + i * 10) + '</b></i>').join('') +
            '<span class="pl-rz-hrt" hidden>♥</span></span></span>' +
        '</div>' +
      '</div>' +
      '<div class="pl-rz-card pl-felt">' +
        '<h4 class="pl-rz-h" id="' + ид + '-h"><span class="pl-rz-bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span>Моите измервания</h4>' +
        '<div class="pl-rz-seg" role="tablist" aria-label="Коя мярка да покажа">' +
          РЕД.map(к => '<button type="button" role="tab" class="pl-rz-tab pl-soft" id="' + ид + '-t-' + к + '" data-m="' + к + '" aria-controls="' + ид + '-p" aria-selected="false" tabindex="-1">' +
            ико(МЕРКИ[к].ик, 'pl-rz-ti pl-art') + '<span>' + МЕРКИ[к].име + '</span></button>').join('') +
        '</div>' +
        '<div class="pl-rz-body" id="' + ид + '-p" role="tabpanel">' +
          '<div class="pl-rz-chart" role="img"></div>' +
          '<div class="pl-rz-side">' +
            '<div class="pl-rz-last"><span class="pl-rz-lhd"><span class="pl-rz-lico" aria-hidden="true"></span><span class="pl-rz-lk"></span></span>' +
              '<b class="pl-rz-lv"></b><span class="pl-rz-ld"></span><span class="pl-rz-la"></span></div>' +
            '<ul class="pl-rz-list" aria-label="Записите"></ul>' +
            '<button type="button" class="pl-rz-more pl-soft" hidden></button>' +
          '</div>' +
          '<div class="pl-rz-empty" hidden><span class="pl-rz-eico" aria-hidden="true"></span><b class="pl-rz-eb"></b>' +
            '<span class="pl-rz-et">Първото мерене ще се появи тук като точка — после и цялата линия.</span></div>' +
          '<button type="button" class="pl-rz-add pl-gel"><span class="pl-rz-plus" aria-hidden="true"></span><span>Добави измерване</span></button>' +
          '<p class="pl-rz-msg" role="status" hidden></p>' +
        '</div>' +
        '<p class="pl-rz-note"><span class="pl-rz-i" aria-hidden="true">i</span><span>Личен дневник, без оценка на развитието. Записките не заменят преглед.</span></p>' +
      '</div>';

    const сег = с.querySelector('.pl-rz-seg');
    сег.addEventListener('click', е => { const б = е.target.closest('.pl-rz-tab'); if (б) избериМярка(б.getAttribute('data-m')); });
    сег.addEventListener('keydown', е => {
      const i = РЕД.indexOf(мярка);
      const н = е.key === 'ArrowRight' ? РЕД[(i + 1) % 3] : е.key === 'ArrowLeft' ? РЕД[(i + 2) % 3] : е.key === 'Home' ? РЕД[0] : е.key === 'End' ? РЕД[2] : null;
      if (!н) return;
      е.preventDefault();
      избериМярка(н);
      const б = с.querySelector('.pl-rz-tab[data-m="' + н + '"]'); if (б) б.focus();
    });
    с.querySelector('.pl-rz-list').addEventListener('click', е => { const р = е.target.closest('.pl-rz-row'); if (р) избери(р.getAttribute('data-d')); });
    const гр = с.querySelector('.pl-rz-chart');
    гр.addEventListener('click', е => {
      const т = гр._plPts; if (!т || !т.length) return;
      const x = е.clientX - гр.getBoundingClientRect().left;
      let най = null, раз = 1e9;
      т.forEach(п => { const д = Math.abs(п.x - x); if (д < раз) { раз = д; най = п; } });
      if (най && раз <= 28) избери(най.d);
    });
    с.querySelector('.pl-rz-more').addEventListener('click', () => { всички = !всички; обновиВсички(); });
    с.querySelector('.pl-rz-add').addEventListener('click', () => { try { добави(с); } catch (е) { грешки.push(String(е)); } });
    // ширината на графиката зависи от оформлението (скрит таб → 0 px): при промяна рисуваме наново
    if (window.ResizeObserver) { try { new ResizeObserver(отложено).observe(гр); } catch (е) { грешки.push(String(е)); } }
    return с;
  }

  function избериМярка(к) {
    if (!МЕРКИ[к] || к === мярка) return;
    мярка = к; избран = null; всички = false;
    обновиВсички();
  }
  function избери(d) {
    избран = избран === d ? null : d;
    обновиВсички();
  }

  const сложиТекст = (е, т) => { if (е && е.textContent !== т) е.textContent = т; };
  const сложиАтр = (е, а, в) => { if (е && е.getAttribute(а) !== в) е.setAttribute(а, в); };
  const скрий = (е, да) => { if (е && е.hidden !== да) е.hidden = да; };
  const фон = (е, ик) => {
    if (!е) return;
    const поз = (ик[2] * 100 / 3) + '% ' + (ик[1] * 100 / 3) + '%';
    if (е.getAttribute('data-ik') === ик.join()) return;
    е.setAttribute('data-ik', ик.join());
    е.style.backgroundImage = 'url(img/art/' + ик[0] + '.webp)';
    е.style.backgroundPosition = поз;
  };

  // ── линийката на жирафа: 5 деления по 10 см около ПОСЛЕДНИЯ ръст (bl_growth_len), сърцето = той.
  //    Без ръст — 50…90 като в референцията и без сърце (нулата не е число). Украса: aria-hidden,
  //    числото само си е в графиката на „Ръст“. Пише само при разлика (своя подпис).
  function линийка(с) {
    const д = записи('len');
    const посл = д.length ? д[д.length - 1].v : null;
    const долу = посл == null ? 50 : Math.max(30, Math.min(80, Math.floor((посл - 15) / 10) * 10));
    const подпис = долу + '|' + посл;
    if (с._plRul === подпис) return;
    с._plRul = подпис;
    с.querySelectorAll('.pl-rz-sc > i > b').forEach((б, i) => сложиТекст(б, String(долу + i * 10)));
    const с2 = с.querySelector('.pl-rz-hrt');
    скрий(с2, посл == null);
    if (с2 && посл != null) с2.style.bottom = ((посл - долу) / 40 * 100).toFixed(1) + '%';
  }

  function обнови(с) {
    линийка(с);
    const к = мярка, М = МЕРКИ[к];
    const данни = записи(к);
    if (избран && !данни.some(д => д.d === избран)) избран = null;   // избраният ред е изтрит в калкулатора
    const гр = с.querySelector('.pl-rz-chart');
    const тяло = с.querySelector('.pl-rz-body');
    // първо видимостта (и тя пише само при разлика) — после мерим ширината, иначе при прехода
    // „празно → първо мерене“ графиката още е скрита и ширината ѝ е 0
    const празно = !данни.length;
    if (тяло.classList.contains('is-empty') !== празно) тяло.classList.toggle('is-empty', празно);
    скрий(гр, празно);
    скрий(с.querySelector('.pl-rz-side'), празно);
    скрий(с.querySelector('.pl-rz-empty'), !празно);
    const Ш = Math.round(гр.clientWidth);
    const подпис = [к, избран, всички, Ш, днесКлюч(), JSON.stringify(данни)].join('|');
    if (с._plSig === подпис) return;                                   // 🪤 само при разлика
    с._plSig = подпис;

    с.querySelectorAll('.pl-rz-tab').forEach(б => {
      const да = б.getAttribute('data-m') === к;
      сложиАтр(б, 'aria-selected', да ? 'true' : 'false');
      сложиАтр(б, 'tabindex', да ? '0' : '-1');
      if (б.classList.contains('on') !== да) б.classList.toggle('on', да);
      // избраното = розов гел, другите = кремав филц (иначе .pl-soft[aria-selected] го боядисва в розов филц)
      if (б.classList.contains('pl-gel') !== да) { б.classList.toggle('pl-gel', да); б.classList.toggle('pl-soft', !да); }
    });
    сложиАтр(тяло, 'aria-labelledby', (с.querySelector('.pl-rz-tab.on') || {}).id || '');
    сложиАтр(с.querySelector('.pl-rz-add'), 'aria-label', М.добави);
    if (празно) {
      фон(с.querySelector('.pl-rz-eico'), М.ик);
      сложиТекст(с.querySelector('.pl-rz-eb'), М.празно);
      гр._plPts = null;
      return;
    }

    // графиката (ако още няма ширина — скрит таб — ResizeObserver ще ни извика пак)
    const вГр = данни.slice(-В_ГРАФИКАТА);
    if (Ш >= 120) {
      const р = графиката(вГр, к, Ш, с.querySelector('.pl-rz-body').id, избран);
      гр.innerHTML = р.svg;
      гр._plPts = р.точки;
    } else { с._plSig = ''; }
    const първо = вГр[0], последно = данни[данни.length - 1];
    сложиАтр(гр, 'aria-label', М.име + ': ' + (данни.length > вГр.length ? 'последните ' + вГр.length + ' от ' + данни.length + ' записа' : данни.length + (данни.length === 1 ? ' запис' : ' записа')) +
      (вГр.length > 1 ? ', от ' + число(к, първо.v) + ' ' + М.ед + ' (' + пълна(първо.d) + ') до ' : ', ') + число(к, последно.v) + ' ' + М.ед + ' (' + пълна(последно.d) + ').');

    // голямата карта: последният запис или избраният
    const показан = (избран && данни.find(д => д.d === избран)) || последно;
    фон(с.querySelector('.pl-rz-lico'), М.ик);
    сложиТекст(с.querySelector('.pl-rz-lk'), показан === последно ? 'Последен запис' : 'Избран запис');
    сложиТекст(с.querySelector('.pl-rz-lv'), число(к, показан.v) + ' ' + М.ед);
    сложиТекст(с.querySelector('.pl-rz-ld'), пълна(показан.d));
    сложиТекст(с.querySelector('.pl-rz-la'), отКога(показан.d));

    // списъкът: най-новото отгоре
    const редове = данни.slice().reverse();
    const видими = всички ? редове : редове.slice(0, В_СПИСЪКА);
    с.querySelector('.pl-rz-list').innerHTML = видими.map(д =>
      '<li><button type="button" class="pl-rz-row pl-soft" data-d="' + д.d + '" aria-pressed="' + (д.d === избран ? 'true' : 'false') + '" aria-label="' + пълна(д.d) + ' — ' + число(к, д.v) + ' ' + М.ед + '">' +
        '<i aria-hidden="true"></i><span>' + кратка(д.d) + ' · <b>' + число(к, д.v) + ' ' + М.ед + '</b></span><em aria-hidden="true">›</em></button></li>').join('');
    const още = с.querySelector('.pl-rz-more');
    скрий(още, редове.length <= В_СПИСЪКА);
    сложиТекст(още, всички ? 'По-малко ▴' : 'Всички записи (' + редове.length + ') ▾');
    сложиАтр(още, 'aria-expanded', всички ? 'true' : 'false');
  }

  // ── „+ Добави измерване“: до СЪЩЕСТВУВАЩАТА карта, с нейните бутони ──
  function картата(стая, дума) {
    const всички = [...стая.querySelectorAll('section.jr-card')].filter(к => { const т = к.querySelector('.jr-title'); return т && (т.textContent || '').includes(дума); });
    return всички.find(к => к.getClientRects().length) || всички[0] || null;
  }
  const плавно = () => !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  // 🪤 (измерено от съседа, pl-bebe.js:141–147): картите над целта растат, докато скролваме покрай
  //   тях (content-visibility:auto в mega.css:336 — размерът им е познат чак като се покажат),
  //   и плавният скок спира с полето ИЗВЪН екрана. Догонваме с обикновен таймер до ~3 с;
  //   докосне ли мама екрана — спираме веднага.
  // 🪤 22.09 (ИЗМЕРЕНО, ag_rastezh_diag): мерено с getBoundingClientRect, полето „скачаше“ между
  //   +882 и −152 px при ВСЯКА проверка, а scrollTop — между 2571 и 3022, завинаги: картите в стаята
  //   имат анимации, водени от скрола (anim.css:433–489, transform), и правоъгълникът ВКЛЮЧВА
  //   transform-а — всяко догонване сменя анимацията, тя мести картата, следващото догонване я гони.
  //   offsetTop НЕ включва transform (нито скрола) — мерим мястото в оформлението, не на екрана.
  function отгоре(е, стая) {
    const върху = х => { let y = 0; while (х) { y += х.offsetTop; х = х.offsetParent; } return y; };
    return върху(е) - върху(стая) - стая.clientTop;
  }
  function докарай(е) {
    const стая = е.closest('#roRoom');
    if (!стая || стая.scrollHeight <= стая.clientHeight + 4) { е.scrollIntoView({ behavior: плавно() ? 'smooth' : 'auto', block: 'center' }); return; }
    const цел = () => Math.max(0, Math.min(стая.scrollHeight - стая.clientHeight, отгоре(е, стая) - Math.max(14, (стая.clientHeight - е.offsetHeight) / 2)));
    стая.scrollTo({ top: цел(), behavior: плавно() ? 'smooth' : 'auto' });
    let пъти = 0, добри = 0, спри = false;
    const стоп = () => { спри = true; };
    ['touchstart', 'wheel', 'keydown'].forEach(с => стая.addEventListener(с, стоп, { once: true, passive: true }));
    const провери = () => {
      if (спри || !е.isConnected || ++пъти > 12) return;
      const ц = цел();
      if (Math.abs(стая.scrollTop - ц) > 24) { добри = 0; стая.scrollTop = ц; } else if (++добри >= 2) return;
      setTimeout(провери, 250);
    };
    setTimeout(провери, 700);
  }
  function светни(е) {
    if (!е) return;
    е.setAttribute('data-pl-rz-spot', '1');
    clearTimeout(е._plRzSpot);
    е._plRzSpot = setTimeout(() => е.removeAttribute('data-pl-rz-spot'), 2600);
  }
  function добави(с) {
    const М = МЕРКИ[мярка];
    const стая = с.closest('#roRoom') || с.parentElement;
    const съобщи = т => { const м = с.querySelector('.pl-rz-msg'); сложиТекст(м, т); скрий(м, !т); };
    let карта = стая ? картата(стая, М.карта) : null;
    // картата е скрита от търсачката на стаята (polish.js:78–89 слага display:none) —
    // чистим полето по СЪЩИЯ път, по който мама би го изтрила (събитие input)
    if (карта && карта.style.display === 'none') {
      const т = стая.querySelector('.sec-find');
      if (т && т.value) { т.value = ''; т.dispatchEvent(new Event('input', { bubbles: true })); карта = картата(стая, М.карта); }
    }
    if (!карта) { съобщи('Не намирам картата „' + М.карта + '“ в тази стая — потърси я по-долу, в „Как расте“.'); return false; }
    // сгъната → с НЕЙНИЯ ▾ (той пази bl_folds и aria-expanded, polish.js:226–247)
    if (карта.classList.contains('folded')) { const ф = карта.querySelector('.fold-btn'); if (ф) ф.click(); else карта.classList.remove('folded'); }
    let поле = null, свети = null;
    if (мярка === 'w') {
      поле = карта.querySelector('.bb-grow input');                    // „Тегло (кг)…“ (rooms2.js:351)
      свети = карта.querySelector('.bb-grow');
    } else {
      const чип = [...карта.querySelectorAll('.jr-quick .jr-chip')].find(б => М.чип.test(б.textContent || ''));
      if (чип && !чип.classList.contains('on')) чип.click();            // НЕЙНИЯТ превключвател (extras.js:642–648)
      поле = карта.querySelector(':scope > input.jr-word') || карта.querySelector('input.jr-word');   // стойността (extras.js:652)
      свети = поле;
    }
    съобщи('');
    // 🪤 22.09 (ИЗМЕРЕНО, ag2_rastezh_diag2): и с offsetTop целта подскачаше — scrollTop 3412 ↔ 3995,
    //   полето ту +923, ту −244 px, завинаги: mega.css:336 държи картите на стаята по 220px „на ужким“
    //   (content-visibility:auto), докато не се покажат, и мястото на полето зависи от това къде е
    //   скролът. Като съседите (pl-dobavi.css:220–224, pl-bremennost.js:338–340): от първия скок до
    //   затварянето на стаята картите се рисуват истински (data-pl-rz-go → css/pl-rastezh.css).
    if (стая && стая.id === 'roRoom' && !стая.hasAttribute('data-pl-rz-go')) стая.setAttribute('data-pl-rz-go', '1');
    докарай(поле || карта);
    светни(свети || карта);
    if (поле) { try { поле.focus({ preventScroll: true }); } catch (е) { поле.focus(); } }
    return true;
  }

  // ── къде стои блокът: веднага след „📏 Как расте“; без кътчета — точно над калкулатора ──
  function котви() {
    const гл = [...document.querySelectorAll('[id="sec-bg"]')].filter(х => х.parentElement);
    if (гл.length) return гл.map(х => ({ след: х }));
    return [...document.querySelectorAll('#roomOverlay section.jr-card')]
      .filter(к => /Калкулатор на растежа/.test(((к.querySelector('.jr-title') || {}).textContent) || ''))
      .map(к => ({ преди: к }));
  }
  function сложи() {
    // „рисувай картите истински“ живее само докато стаята с блока е отворена (close() в helper.js:5534 слага hidden)
    const ов = document.getElementById('roomOverlay');
    document.querySelectorAll('#roRoom[data-pl-rz-go]').forEach(р => { if ((ов && ов.hidden) || !р.querySelector('section.pl-rz')) р.removeAttribute('data-pl-rz-go'); });
    котви().forEach(к => {
      const о = к.след || к.преди, родител = о.parentElement;
      let с = родител.querySelector(':scope > section.pl-rz');
      if (!с) с = строй();
      const наМястото = к.след ? о.nextElementSibling === с : о.previousElementSibling === с;
      if (!наМястото) { if (к.след) о.after(с); else о.before(с); }
      // търсачката на стаята крие кътчетата — крием се и ние, докато в полето има текст
      const т = родител.querySelector('.sec-find');
      скрий(с, !!(т && т.value && т.value.trim()));
      обнови(с);
    });
  }
  function обновиВсички() { document.querySelectorAll('section.pl-rz').forEach(с => { try { обнови(с); } catch (е) { грешки.push(String(е)); } }); }

  let чака = false;
  function отложено() {
    if (чака) return;
    чака = true;
    setTimeout(() => { чака = false; try { сложи(); } catch (е) { грешки.push(String(е)); } }, 40);
  }
  document.addEventListener('input', е => {
    const т = е.target;
    if (т && т.classList && т.classList.contains('sec-find')) отложено();
  }, true);
  // запис от друг раздел (друг таб на браузъра) — същите ключове
  window.addEventListener('storage', е => { if (!е.key || /^bl_growth/.test(е.key)) отложено(); });

  function върви() {
    const ов = document.getElementById('roomOverlay');
    if (!ов) return;
    new MutationObserver(отложено).observe(ов, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] });
    сложи();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', върви); else върви();
  window.BL_PL_RASTEZH = { сложи, обнови: обновиВсички, записи, грешки };
})();
