/* Saved data must survive reloads. Regression: the Story sweep saved an empty copy while the page started, overwriting the
   saved data (and syncing it), so the number showed once and was gone on the next load. Also: typed-but-not-blurred odometer. */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const path = require('path'); const ROOT = path.resolve(__dirname, '..');
function ok(c, m) { if (!c) { console.log('FAIL', m); process.exitCode = 1; } else console.log(' ok', m); }
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); await ctx.addInitScript(() => { window.__V60_TEST = true; });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + ROOT + '/index.html'); await p.waitForTimeout(400);
  await p.fill('#odo', '95321');            // fill fires input but not change, like leaving the page mid-edit
  await p.waitForTimeout(100);
  for (let i = 1; i <= 4; i++) { await p.reload(); await p.waitForTimeout(500); ok(await p.inputValue('#odo') === '95321', 'odometer still there after reload ' + i); }
  const stored = await p.evaluate(() => (JSON.parse(localStorage.getItem('v60-garage-v1') || '{}')).odo);
  ok(stored === 95321, 'storage holds the odometer, not an empty copy (' + stored + ')');
  await p.evaluate(() => { const d = V60.mod('story'); d.all = true; V60.save(); });
  for (let i = 1; i <= 2; i++) { await p.reload(); await p.waitForTimeout(500); }
  ok(await p.evaluate(() => !!(V60.mod('story') || {}).all), 'Show everything stays on after reloads');
  ok(await p.inputValue('#odo') === '95321', 'odometer survives with Show everything on');
  ok(errs.length === 0, 'no errors ' + JSON.stringify(errs));
  await b.close();
})();
