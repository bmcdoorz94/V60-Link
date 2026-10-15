/* Screenshots of every view's figure (light and dark) into tests/shots/fig-<view>-<scheme>.png, for checking drawings.
   Not a pass/fail test: run it directly, node tests/figshot.js [view ...]. */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const path = require('path'), fs = require('fs'); const ROOT = path.resolve(__dirname, '..'); const SH = path.join(ROOT, 'tests', 'shots'); fs.mkdirSync(SH, { recursive: true });
const want = process.argv.slice(2);
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  for (const scheme of ['light', 'dark']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, colorScheme: scheme, deviceScaleFactor: 2 }); await ctx.addInitScript(() => { window.__V60_TEST = true; });
    const p = await ctx.newPage(); await p.goto('file://' + ROOT + '/index.html'); await p.waitForTimeout(500);
    const views = await p.evaluate(() => V60_MANUAL.data.views.map(v => v.id));
    for (const v of views.filter(v => !want.length || want.includes(v))) {
      await p.evaluate(v => { V60.state.showAll = true; V60_MANUAL.go('view', v); }, v); await p.waitForTimeout(150);
      const fig = await p.$('#mnView .mn-figwrap'); if (fig) await fig.screenshot({ path: path.join(SH, 'fig-' + v + '-' + scheme + '.png') });
    }
    if (!want.length || want.includes('engine')) { /* the Engine bay explorer in core.js */
      await p.setViewportSize({ width: 390, height: 1600 }); /* keep the bottom bar clear of the map */
      await p.evaluate(() => __v60.go('engine')); await p.waitForTimeout(150);
      const st = await p.$('#ebStage'); if (st) await st.screenshot({ path: path.join(SH, 'fig-engine-' + scheme + '.png') });
    }
    await ctx.close();
  }
  await b.close();
})();
