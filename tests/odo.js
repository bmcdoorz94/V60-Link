/* The odometer must survive being typed and then left without the field losing focus (app switch, reload). */
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
  await p.reload(); await p.waitForTimeout(500);
  ok(await p.inputValue('#odo') === '95321', 'typed odometer survives a reload without leaving the field');
  await p.fill('#odo', '95400'); await p.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await p.press('#odo', 'Tab'); await p.waitForTimeout(100); await p.reload(); await p.waitForTimeout(500);
  ok(await p.inputValue('#odo') === '95400', 'odometer saved by blur still works');
  ok(errs.length === 0, 'no errors ' + JSON.stringify(errs));
  await b.close();
})();
