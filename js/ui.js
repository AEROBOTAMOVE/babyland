// ═══════════════════════════════════════════════════════════
// 💬 BL_UI — топлите вградени диалози (одит-флот П23, проход 2 тема 6)
//
// Native confirm()/alert() са студени, извън тона и на някои телефони
// блокират/изглеждат счупени точно в емоционалния момент (изтриване на
// снимка на коремчето, четене на капсула-писмо). Тук са апп-оверлеи по
// СЪЩИЯ модел като медальоните (.md-veil/.md-box — CSS вече съществува,
// тъмно-съвместим). Escape/фон затварят, фокусът влиза и се връща.
// ═══════════════════════════════════════════════════════════
(function () {
  'use strict';
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h !== undefined) n.innerHTML = h; return n; };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

  // многоредов текст → безопасен HTML (пази новите редове)
  const редове = s => esc(s).replace(/\n/g, '<br>');

  function диалог(opts) {
    return new Promise(resolve => {
      const фокусПреди = document.activeElement;
      const слой = el('div', 'md-veil bl-ui');
      const бокс = el('div', 'md-box');
      бокс.setAttribute('role', opts.confirm ? 'alertdialog' : 'dialog');
      бокс.setAttribute('aria-modal', 'true');
      let html = '';
      if (opts.emoji) html += `<div class="md-coin"><span>${esc(opts.emoji)}</span></div>`;
      if (opts.title) html += `<h3 class="md-name">${esc(opts.title)}</h3>`;
      if (opts.text) html += `<p class="md-why bl-ui-text">${редове(opts.text)}</p>`;
      бокс.innerHTML = html;
      const редБут = el('div', 'bl-ui-row');
      let разреши = null;
      const край = стойност => {
        if (разреши) return; разреши = true;
        document.removeEventListener('keydown', наКлавиш);
        слой.classList.remove('on');
        setTimeout(() => { try { слой.remove(); } catch (e) {} try { if (фокусПреди && фокусПреди.focus) фокусПреди.focus(); } catch (e) {} }, 240);
        resolve(стойност);
      };
      if (opts.confirm) {
        const не = el('button', 'jr-btn bl-ui-cancel', opts.cancelText || 'Отказ'); не.type = 'button';
        const да = el('button', 'jr-btn bl-ui-ok' + (opts.danger ? ' bl-ui-danger' : ''), opts.okText || 'Да'); да.type = 'button';
        не.addEventListener('click', () => край(false));
        да.addEventListener('click', () => край(true));
        редБут.appendChild(не); редБут.appendChild(да);
      } else {
        const ок = el('button', 'jr-btn md-ok', opts.okText || 'Добре 💜'); ок.type = 'button';
        ок.addEventListener('click', () => край(true));
        редБут.appendChild(ок);
      }
      бокс.appendChild(редБут);
      слой.appendChild(бокс);
      function наКлавиш(e) {
        if (e.key === 'Escape') { край(opts.confirm ? false : true); return; }
        if (e.key === 'Tab') {
          const ф = бокс.querySelectorAll('button');
          if (!ф.length) return;
          const п = ф[0], последен = ф[ф.length - 1];
          if (e.shiftKey && document.activeElement === п) { e.preventDefault(); последен.focus(); }
          else if (!e.shiftKey && document.activeElement === последен) { e.preventDefault(); п.focus(); }
        }
      }
      слой.addEventListener('click', e => { if (e.target === слой) край(opts.confirm ? false : true); });
      document.addEventListener('keydown', наКлавиш);
      document.body.appendChild(слой);
      requestAnimationFrame(() => слой.classList.add('on'));
      try { (редБут.querySelector('.bl-ui-ok') || редБут.querySelector('.md-ok') || редБут.querySelector('button')).focus(); } catch (e) {}
    });
  }

  window.BL_UI = {
    confirm: (text, opts) => диалог(Object.assign({ confirm: true, text: text }, opts || {})),
    note: (text, opts) => диалог(Object.assign({ text: text }, opts || {}))
  };
})();

// ═══════════ 🔢 ЗАПЕТАЯТА НА МАЙКАТА (жива обиколка 22.07, RED) ═══════════
// Българка пише „38,5“ — със запетая. Полетата бяха type=number: браузърът
// обявява „38,5“ за невалидно и value става ПРАЗНО → температурната карта
// мълчеше, все едно нищо не е писано. А където полето е текстово,
// parseFloat("37,9") дава 37 → „всичко е наред“ при реални 37.9. Затова:
// (1) всяко число-поле става text + inputmode=decimal (същата цифрова
//     клавиатура на телефона, но запетаята НЕ чупи стойността);
// (2) глобален capture-слушател сменя „,“ → „.“ ПРЕДИ слушателите на самите
//     полета да прочетат стойността — нито един от 10-те parseFloat в кода
//     не се пипа и всичките започват да четат вярно.
(function () {
  'use strict';
  function поправи(п) {
    if (!п || п.type !== 'number' || п.dataset.blNum) return;
    п.dataset.blNum = '1';
    try { п.type = 'text'; п.inputMode = 'decimal'; } catch (e) {}
  }
  function обходи(корен) {
    if (!корен || !корен.querySelectorAll) return;
    корен.querySelectorAll('input[type="number"]').forEach(поправи);
    if (корен.matches && корен.matches('input[type="number"]')) поправи(корен);
  }
  document.addEventListener('input', function (e) {
    const п = e.target;
    if (!п || !п.dataset || !п.dataset.blNum || п.value.indexOf(',') < 0) return;
    const поз = п.selectionStart;
    п.value = п.value.replace(/,/g, '.');
    try { п.setSelectionRange(поз, поз); } catch (err) {}
  }, true);
  new MutationObserver(function (списък) {
    for (const м of списък) for (const в of м.addedNodes) if (в.nodeType === 1) обходи(в);
  }).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState !== 'loading') обходи(document);
  else document.addEventListener('DOMContentLoaded', function () { обходи(document); });
})();
