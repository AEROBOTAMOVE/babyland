// 21.10 · картата „Днес“ (втори опит): най-малкият елемент с текст „Днес“ и шрифт ≥ 20px + съседите му
(async () => {
  const пауза = ms => new Promise(r => setTimeout(r, ms));
  for (let i = 0; i < 3; i++) { const б = [...document.querySelectorAll('button')].find(x => /Благодаря/.test(x.textContent) && x.offsetParent); if (б) { б.click(); await пауза(700); } else break; }
  const кандидати = [...document.querySelectorAll('body *')].filter(e => /Днес/.test(e.textContent || '') && (e.textContent || '').length < 60 && e.getClientRects().length && parseFloat(getComputedStyle(e).fontSize) >= 20 && !e.closest('#plHome .pl-shelf, .pl-baby, #roomOverlay'));
  const заг = кандидати.sort((a, b) => (a.textContent.length - b.textContent.length))[0];
  if (!заг) return { няма: true, n: кандидати.length };
  заг.scrollIntoView({ block: 'center' }); await пауза(600);
  const опис = e => { const b = e.getBoundingClientRect(), с = getComputedStyle(e); return (e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + '.' + String(e.className && e.className.baseVal != null ? e.className.baseVal : e.className).trim().replace(/\s+/g, '.')) + ' ' + Math.round(b.x) + ',' + Math.round(b.y) + ' ' + Math.round(b.width) + '×' + Math.round(b.height) + ' поз=' + с.position + ' фс=' + с.fontSize; };
  const карта = заг.parentElement.parentElement;
  const редове = [];
  (function обходи(e, д) { if (д > 3) return; for (const c of e.children) { редове.push('  '.repeat(д) + опис(c) + (c.children.length ? '' : ' «' + (c.textContent || '').trim().slice(0, 30) + '»')); обходи(c, д + 1); } })(карта, 0);
  return { заглавие: опис(заг), html: заг.outerHTML.slice(0, 600), карта: опис(карта), дърво: редове.slice(0, 45) };
})()
