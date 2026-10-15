/* Upright phone audit (Kyle uses the app only held vertically): every page at 390 x 844 with Show everything on.
   Fails on: text drawn smaller than 11 px (in SVG diagrams too, after they shrink to fit), buttons and links smaller
   than 32 px to tap, and boxes that scroll sideways. Prints what it found, page by page.
   node tests/portrait.js --report lists everything without failing. */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const path = require('path'), fs = require('fs'); const ROOT = path.resolve(__dirname, '..'); const SH = path.join(ROOT, 'tests', 'shots'); fs.mkdirSync(SH, { recursive: true });
const REPORT = process.argv.includes('--report');
function ok(c, m) { if (!c && !REPORT) { console.log('FAIL', m); process.exitCode = 1; } else console.log((c ? ' ok ' : ' -- ') + m); }
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); await ctx.addInitScript(() => { window.__V60_TEST = true; });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + ROOT + '/index.html'); await p.waitForTimeout(600);
  await p.evaluate(() => { __v60.go('story'); const o = document.getElementById('stOpts'); if (o) o.open = true; }); await p.check('#stAll'); await p.waitForTimeout(200);
  const tabs = await p.evaluate(() => [...document.querySelectorAll('main > .panel')].map(x => x.id.slice(2)));
  const views = await p.evaluate(() => V60_MANUAL.data.views.map(v => v.id));
  const pages = tabs.filter(t => t !== 'view').map(t => ['tab', t]).concat(views.map(v => ['view', v]));
  let bad = 0;
  for (const [kind, id] of pages) {
    if (kind === 'tab') await p.evaluate(t => __v60.go(t), id); else await p.evaluate(v => V60_MANUAL.go('view', v), id);
    await p.waitForTimeout(120);
    /* open every <details> so folded content is measured too */
    await p.evaluate(() => { const v = [...document.querySelectorAll('main > .panel')].filter(x => !x.hidden)[0]; v.querySelectorAll('details').forEach(d => { d.open = true; }); });
    await p.waitForTimeout(60);
    const r = await p.evaluate(() => {
      const panel = [...document.querySelectorAll('main > .panel')].filter(x => !x.hidden)[0], out = { small: [], svg: [], taps: [], scroll: [] };
      const vis = e => { const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden') return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
      const name = e => (e.id ? '#' + e.id : e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/)[0] : ''));
      /* HTML text */
      const seen = new Set();
      panel.querySelectorAll('*').forEach(e => {
        if (e.closest('svg') || !vis(e)) return;
        const own = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1); if (!own) return;
        const fs = parseFloat(getComputedStyle(e).fontSize); if (fs < 11) { const k = name(e) + ' ' + fs + 'px'; if (!seen.has(k)) { seen.add(k); out.small.push(k + ' "' + e.textContent.trim().slice(0, 30) + '"'); } }
      });
      /* SVG text after scaling */
      panel.querySelectorAll('svg').forEach(s => {
        if (!vis(s)) return; const ts = [...s.querySelectorAll('text')].filter(vis); if (!ts.length) return;
        const hs = ts.map(t => t.getBoundingClientRect().height).filter(h => h > 0); const min = Math.min.apply(null, hs);
        if (min < 11) out.svg.push((s.getAttribute('aria-label') || name(s)).slice(0, 50) + ': smallest text ' + min.toFixed(1) + 'px, drawing ' + Math.round(s.getBoundingClientRect().width) + 'x' + Math.round(s.getBoundingClientRect().height));
      });
      /* tap targets */
      panel.querySelectorAll('button, a[href], input:not([type=hidden]), select, [role=button], summary, label').forEach(e => {
        if (!vis(e) || e.closest('svg') && e.tagName !== 'g') return;
        if (e.closest('svg[data-also]')) return; /* a drawing whose every point is also a full-size button below it */
        if (e.tagName === 'LABEL' && !e.querySelector('input')) return;
        if (e.tagName === 'A' && e.closest('p, li, dd, span.d')) return; /* links inside a sentence */
        if (e.tagName === 'INPUT' && /checkbox|radio/.test(e.type) && e.closest('label')) return; /* the label is the target */
        const r = e.getBoundingClientRect(); if (r.height < 32 || r.width < 32) out.taps.push(name(e) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) + ' "' + (e.textContent || e.getAttribute('aria-label') || e.value || '').trim().slice(0, 24) + '"');
      });
      /* sideways scrolling boxes */
      panel.querySelectorAll('*').forEach(e => { if (!vis(e)) return; const s = getComputedStyle(e); if (e.id !== 'tdCards' /* swipeable cards, by design */ && /(auto|scroll)/.test(s.overflowX) && e.scrollWidth > e.clientWidth + 2) out.scroll.push(name(e) + ' ' + e.scrollWidth + ' in ' + e.clientWidth); });
      out.page = document.documentElement.scrollWidth - innerWidth;
      if (out.page > 0) out.wide = [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > innerWidth + 1 && !e.closest('#tdCards')).slice(0, 4).map(e => name(e) + ' ' + Math.round(e.getBoundingClientRect().width) + 'px "' + e.textContent.trim().slice(0, 30) + '"');
      return out;
    });
    const label = kind === 'view' ? 'view ' + id : id;
    const issues = [].concat(r.small.map(x => 'small text ' + x), r.svg.map(x => 'drawing ' + x), r.taps.slice(0, 8).map(x => 'small tap ' + x), r.scroll.map(x => 'scrolls sideways ' + x), r.page > 0 ? ['page scrolls sideways by ' + r.page + 'px: ' + (r.wide || []).join('; ')] : []);
    if (r.taps.length > 8) issues.push('... ' + (r.taps.length - 8) + ' more small taps');
    bad += issues.length;
    ok(!issues.length, label + (issues.length ? '\n      ' + issues.join('\n      ') : ''));
    if (issues.length && REPORT) await p.screenshot({ path: path.join(SH, 'portrait-' + label.replace(' ', '-') + '.png'), fullPage: true });
  }
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs));
  console.log(bad + ' issues');
  await b.close();
})();
