// ═══════════════════════════════════════════════════════════
// 🔐 КОПИЕТО С ПАРОЛА (план 19, точка 15.3.6)
//
// Ключалката на дневника е ПЕРДЕ — казваме си го честно (15.2.5): тя спира
// любопитен поглед, но не и човек с телефона в ръка и време.
//
// Това тук е другото нещо: истинско криптиране на ФАЙЛА. Копието на мама
// пътува — по мейл, в облака, на компютъра на мъжа ѝ. Там вече не важи кой
// държи телефона. Затова файлът може да излезе заключен:
//
//   AES-GCM 256 · ключ от паролата през PBKDF2 (210 000 обиколки, SHA-256)
//   · нова сол и нов IV за всеки файл.
//
// Без паролата файлът е шум. Включително за мен, за него и за всеки друг.
// Затова и предупреждението е тежко: забравена парола = загубено копие.
//
// Всичко минава през Web Crypto на самия телефон. Нищо не излиза навън.
// ЗАРЕЖДА СЕ ПРЕДИ profile.js.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';
  const subtle = window.crypto && window.crypto.subtle;
  const rnd = n => window.crypto.getRandomValues(new Uint8Array(n));

  const ОБИКОЛКИ = 210000;      // OWASP 2023 за PBKDF2-SHA256
  const МАРКА = 'BabyLandEnc1'; // за да познаем заключен файл при внасяне

  function отДума(s) { return new TextEncoder().encode(s); }
  function вБаза64(буфер) {
    const б = new Uint8Array(буфер);
    let с = '';
    for (let i = 0; i < б.length; i += 8192) с += String.fromCharCode.apply(null, б.subarray(i, i + 8192));
    return btoa(с);
  }
  function отБаза64(с) {
    const дв = atob(с), б = new Uint8Array(дв.length);
    for (let i = 0; i < дв.length; i++) б[i] = дв.charCodeAt(i);
    return б;
  }

  async function ключОт(парола, сол) {
    const основа = await subtle.importKey('raw', отДума(парола), 'PBKDF2', false, ['deriveKey']);
    return subtle.deriveKey(
      { name: 'PBKDF2', salt: сол, iterations: ОБИКОЛКИ, hash: 'SHA-256' },
      основа, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }

  // текст → заключен пакет (обикновен JSON, за да се отвори и след години)
  async function заключи(текст, парола) {
    const сол = rnd(16);
    const iv = rnd(12);
    const к = await ключОт(парола, сол);
    const шифър = await subtle.encrypt({ name: 'AES-GCM', iv }, к, отДума(текст));
    return {
      app: 'BabyLand', enc: МАРКА, date: new Date().toISOString(),
      kdf: { name: 'PBKDF2', hash: 'SHA-256', iterations: ОБИКОЛКИ, salt: вБаза64(сол) },
      cipher: { name: 'AES-GCM', iv: вБаза64(iv) },
      data: вБаза64(шифър),
      // бележка ВЪТРЕ във файла — след 3 години мама няма да помни какво е
      note: 'Този файл е заключен с парола. Отваря се само от Помощникът на мама, със същата парола. Без нея никой не може да го прочете.'
    };
  }

  async function отключи(пакет, парола) {
    if (!пакет || пакет.enc !== МАРКА) throw new Error('не е заключен файл');
    const сол = отБаза64(пакет.kdf.salt);
    const iv = отБаза64(пакет.cipher.iv);
    const к = await ключОт(парола, сол);
    // грешна парола → AES-GCM сам гърми на проверката за цялост
    const чист = await subtle.decrypt({ name: 'AES-GCM', iv }, к, отБаза64(пакет.data));
    return new TextDecoder().decode(чист);
  }

  const заключенЛи = о => !!(о && о.enc === МАРКА);

  // ── питането за парола: две полета, за да няма печатна грешка ──
  function питайЗаПарола(наглед) {
    return new Promise(готово => {
      const с = document.createElement('div');
      с.className = 'pw-veil';
      с.innerHTML = `<div class="pw-box" role="dialog" aria-label="Парола за копието">
          <p class="pw-h">🔐 ${наглед === 'нов' ? 'Заключи копието' : 'Отключи копието'}</p>
          <p class="pw-note">${наглед === 'нов'
            ? 'Файлът ще е нечетим без тази парола — за всеки, включително за нас. <strong>Забравиш ли я, копието е загубено завинаги.</strong> Няма как да се възстанови.'
            : 'Въведи паролата, с която е заключен файлът.'}</p>
          <input class="jr-word pw-1" type="password" autocomplete="new-password" placeholder="Парола (поне 8 знака)">
          ${наглед === 'нов' ? '<input class="jr-word pw-2" type="password" autocomplete="new-password" placeholder="Още веднъж, за проверка">' : ''}
          <p class="pw-err" hidden></p>
          <div class="jr-quick"><button class="jr-btn pw-ok" type="button">${наглед === 'нов' ? 'Заключи 🔐' : 'Отключи 🔓'}</button>
          <button class="jr-chip pw-no" type="button">Откажи</button></div>
        </div>`;
      document.body.appendChild(с);
      const п1 = с.querySelector('.pw-1'), п2 = с.querySelector('.pw-2'), гр = с.querySelector('.pw-err');
      setTimeout(() => п1.focus(), 60);
      const затвори = р => { с.remove(); готово(р); };
      const грешка = т => { гр.textContent = т; гр.hidden = false; };
      с.querySelector('.pw-no').addEventListener('click', () => затвори(null));
      с.addEventListener('click', e => { if (e.target === с) затвори(null); });
      с.querySelector('.pw-ok').addEventListener('click', () => {
        const a = п1.value;
        if (a.length < 8) return грешка('Поне 8 знака — кратката парола не пази нищо.');
        if (п2 && a !== п2.value) return грешка('Двете не съвпадат. Провери пак.');
        затвори(a);
      });
      [п1, п2].forEach(п => п && п.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); с.querySelector('.pw-ok').click(); }
      }));
    });
  }

  window.BL_CRYPTO = subtle
    ? { заключи, отключи, заключенЛи, питайЗаПарола, има: true }
    : { има: false };   // много стар браузър → профилът просто не показва бутона
})();
