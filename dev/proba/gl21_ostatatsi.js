(() => {
  const лум = c => { const m = c.match(/[\d.]+/g).map(Number); const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(m[0]) + .7152 * f(m[1]) + .0722 * f(m[2]); };
  const кон = (a, b) => { const x = лум(a), y = лум(b); return +((Math.max(x, y) + .05) / (Math.min(x, y) + .05)).toFixed(2); };
  const фон = e => { while (e) { const b = getComputedStyle(e).backgroundColor; if (b && !/rgba\(0, 0, 0, 0\)|transparent/.test(b) && !/, 0\)$/.test(b)) return b; e = e.parentElement; } return 'rgb(255,255,255)'; };
  const суб = [...document.querySelectorAll('#roRoom .jr-sub')].filter(e => e.offsetHeight).slice(0, 3).map(e => { const s = getComputedStyle(e); return { текст: e.textContent.slice(0, 30), opacity: s.opacity, контраст: кон(s.color, фон(e)) }; });
  const win = [...document.querySelectorAll('#roRoom .jr-win')].slice(0, 2).map(e => ({ фон: getComputedStyle(e).backgroundColor, копче: e.querySelector('.jr-winbtn') ? getComputedStyle(e.querySelector('.jr-winbtn')).backgroundColor : '—' }));
  return { нощ: document.documentElement.classList.contains('bl-night'), тема: document.documentElement.dataset.theme || 'light', суб, win };
})()
