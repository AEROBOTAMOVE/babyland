(() => {
  const лум = c => { const m = c.match(/[\d.]+/g).map(Number); const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(m[0]) + .7152 * f(m[1]) + .0722 * f(m[2]); };
  const кон = (a, b) => { const x = лум(a), y = лум(b); return +((Math.max(x, y) + .05) / (Math.min(x, y) + .05)).toFixed(2); };
  const фон = e => { while (e) { const b = getComputedStyle(e).backgroundColor; if (b && !/, 0\)$/.test(b) && b !== 'transparent') return b; e = e.parentElement; } return 'rgb(255,255,255)'; };
  const м = s => { const e = document.querySelector(s); if (!e) return 'няма'; const st = getComputedStyle(e); return { px: st.fontSize, op: st.opacity, контраст: кон(st.color, фон(e)) }; };
  const д = [...document.querySelectorAll('.ph-date')].map(e => Math.round(e.getBoundingClientRect().width));
  return { live: м('#roRoom .ask-live'), line: м('#roRoom .ask-line'), дати: д };
})()
