// 21.10 · голи емоджита след обвий() с всички емоджита: търсенето („не диша“, „температура“) + профилът
(async () => {
  const пауза = ms => new Promise(r => setTimeout(r, ms));
  for (let i = 0; i < 3; i++) { const б = [...document.querySelectorAll('button')].find(x => /Благодаря/.test(x.textContent) && x.offsetParent); if (б) { б.click(); await пауза(700); } else break; }
  const ЕМ = /\p{Extended_Pictographic}/u;
  const голи = корен => {
    const из = []; if (!корен) return ['няма корен'];
    const w = document.createTreeWalker(корен, NodeFilter.SHOW_TEXT);
    for (let н = w.nextNode(); н; н = w.nextNode()) {
      if (!ЕМ.test(н.nodeValue || '')) continue;
      const р = н.parentElement; if (!р || р.closest('.pl-em, input, textarea, .ask-badge') || !р.getClientRects().length) continue;
      if (getComputedStyle(р).color === 'rgba(0, 0, 0, 0)' || getComputedStyle(р).webkitTextFillColor === 'rgba(0, 0, 0, 0)') continue;
      из.push((н.nodeValue.match(/\p{Extended_Pictographic}/gu) || []).join('') + ' в ' + р.tagName.toLowerCase() + '.' + String(р.className).slice(0, 40) + ' «' + н.nodeValue.trim().slice(0, 40) + '»');
    }
    return из;
  };
  const отвори = async () => { const б = document.querySelector('[data-pl="find"]'); if (б) б.click(); await пауза(900); };
  const пиши = async т => { const п = document.querySelector('#searchOverlay input'); if (!п) return; п.value = т; п.dispatchEvent(new Event('input', { bubbles: true })); await пауза(1800); };
  await отвори();
  await пиши('не диша'); const спешно = голи(document.getElementById('searchOverlay'));
  await пиши('температура'); const темп = голи(document.getElementById('searchOverlay'));
  return { спешно, темп, плюшВТърсенето: document.querySelectorAll('#searchOverlay .pl-em.pl-pl').length };
})()
