/* Recorded drives (2026-11-26): the iPhone app's drives, summed up by Kyle's PC at https://<pc>/drives/summary.json, keep the
   odometer estimate current without overwriting the entered reading; Maintain shows a Recorded drives card; emissions
   readiness comes from the newest drive that read it. No PC address, or no answer: nothing is shown and nothing breaks. */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const path = require('path'); const ROOT = path.resolve(__dirname, '..');
function ok(c, m) { if (!c) { console.log('FAIL', m); process.exitCode = 1; } else console.log(' ok', m); }
const H = 3600e3, now = Date.now(), at = (h) => new Date(now - h * H).toISOString();
function summary(newest) {
  return { updated: at(0.1), drives: [
    Object.assign({ id: 'd3', start: at(2), end: at(1.8), minutes: 12, miles: 6.1, mpg: 24.8, idleTrim: 15.4, cruiseTrim: 3.7, coolMax: 194, mil: false, dtcs: 0, notReady: ['Evaporative system'], url: 'https://pc.test/drives/d3' }, newest || {}),
    { id: 'd2', start: at(30), end: at(29.5), minutes: 25, miles: 14.2, mpg: 27.1, idleTrim: null, cruiseTrim: null, coolMax: null, mil: null, dtcs: null, notReady: null, url: 'https://pc.test/drives/d2' },
    { id: 'd1', start: at(24 * 20), end: at(24 * 20 - 0.5), minutes: 30, miles: 400, mpg: 30, mil: false, dtcs: 0, notReady: [], url: 'https://pc.test/drives/d1' }
  ], totals: { drives: 3, miles: 420.3, first: at(24 * 20) }, links: { all: 'https://pc.test/drives/', trends: 'https://pc.test/drives/trends', week: 'https://pc.test/drives/week' } };
}
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  /* 1. no PC address: nothing shown, no errors */
  {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); await ctx.addInitScript(() => { window.__V60_TEST = true; });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + ROOT + '/index.html'); await p.waitForTimeout(500);
    await p.evaluate(() => V60.jump('tab:maint')); await p.waitForTimeout(150);
    ok(!(await p.$('#mtBody #drives')), 'no PC address: no Recorded drives card');
    ok(errs.length === 0, 'no errors without a PC ' + JSON.stringify(errs));
    await ctx.close();
  }
  /* 2. inside the iPhone app with the PC answering */
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(() => { window.__V60_TEST = true; window.V60_NATIVE = Object.assign(window.V60_NATIVE || {}, { pc: 'pc.test' }); });
  let body = summary(), hits = 0;
  await ctx.route('https://pc.test/drives/summary.json', (r) => { hits++; r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(body) }); });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + ROOT + '/index.html'); await p.waitForTimeout(600);
  /* the odometer was entered 26 h ago: only d3 (2 h ago) counts */
  await p.evaluate((t) => { V60.state.odo = 91357; V60.state.odoAt = t; V60.state.log = [{ id: 'x', item: 'oil', date: '2026-10-01', miles: 90000, note: '' }]; V60.save(); V60_DRIVES.refresh(); }, at(26));
  await p.waitForTimeout(500);
  ok(hits >= 1, 'the page asked the PC for the summary');
  const oe = await p.evaluate(() => V60.odoEst());
  ok(oe.est && oe.miles === 91363 && oe.drives === 1, 'estimate = entered reading + drives after it ' + JSON.stringify(oe));
  ok(await p.evaluate(() => V60.state.odo === 91357 && document.getElementById('odo').value === '91357'), 'the entered reading is not overwritten');
  ok(await p.evaluate(() => /\(estimated\)/.test(V60.statusFor(V60.ITEMS.filter(i => i.key === 'oil')[0]).detail)), 'service miles left are marked estimated');
  ok(await p.evaluate(() => /estimated from recorded drives/.test(document.querySelector('#mnHome').textContent)), 'the home says the miles are estimated');
  await p.evaluate(() => V60.jump('tab:maint')); await p.waitForTimeout(200);
  const card = await p.evaluate(() => { const c = document.querySelector('#mtBody #drives'); return c ? c.textContent : ''; });
  ok(/RECORDED DRIVES/.test(card) && /91,363/.test(card) && /Last drive/.test(card) && /6\.1 mi/.test(card) && /24\.8 mpg estimated/.test(card), 'Maintain shows the card: estimate, last drive, mpg');
  ok(/This week: 20\.3 mi/.test(card) && /2 drives/.test(card), 'miles this week count only the last 7 days');
  ok(/Ready/.test(card) && /one self-test not ready \(Evaporative system\)/.test(card), 'readiness from the newest drive: one not ready passes');
  ok(await p.evaluate(() => ['https://pc.test/drives/', 'https://pc.test/drives/week', 'https://pc.test/drives/trends'].every(u => document.querySelector('#mtBody #drives a[href="' + u + '"][target="_blank"]'))), 'links to the PC report pages');
  await p.screenshot({ path: path.join(ROOT, 'tests', 'shots', 'drives-maint.png'), fullPage: true });
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= 390), 'no sideways scroll on Maintain');
  /* readiness that would fail: check-engine light on */
  body = summary({ mil: true, dtcs: 2, notReady: ['Catalyst', 'Evaporative system'] });
  await p.evaluate(() => V60_DRIVES.refresh()); await p.waitForTimeout(400);
  await p.evaluate(() => V60.jump('tab:car')); await p.waitForTimeout(200);
  ok(await p.evaluate(() => /emissions test fails/.test(document.querySelector('#mnHome').textContent)), 'the home lists a lit check-engine light from a drive');
  await p.evaluate(() => V60.jump('tab:glove')); await p.waitForTimeout(200);
  ok(await p.evaluate(() => { const e = document.getElementById('gbReady'); return e && !e.hidden && /Would fail/.test(e.textContent); }), 'the Glovebox shows readiness next to the inspection date');
  /* the summary is cached on the device, not in the synced state */
  ok(await p.evaluate(() => !!localStorage.getItem('v60-drives') && !JSON.stringify(V60.snapshot()).includes('pc.test')), 'cached on this device only');
  /* a reading typed after the drives drops them from the estimate */
  await p.evaluate(() => V60.jump('tab:car')); await p.waitForTimeout(150); await p.fill('#odo', '91400'); await p.dispatchEvent('#odo', 'change'); await p.waitForTimeout(150);
  ok(await p.evaluate(() => { const o = V60.odoEst(); return !o.est && o.miles === 91400; }), 'a new reading restarts the count');
  /* an odometer saved before this feature (no time) is counted from now, never backwards */
  await p.evaluate(() => { delete V60.state.odoAt; V60.save(); V60.jump('tab:maint'); }); await p.waitForTimeout(150);
  ok(await p.evaluate(() => !!V60.state.odoAt && !V60.odoEst().est), 'an old reading with no time counts drives from now on');
  /* the PC read the car when it started (bridge/auto.js) and Claude sent a recap: Home shows both; the car's own
     odometer, newer than the typed one, becomes the base without changing the typed reading */
  const carAt = new Date(Date.now() + 60000).toISOString();
  body = summary();
  body.car = { odometer: { miles: 91500, at: carAt }, odometerListed: true, at: carAt, mil: true, dtcCount: 1, milMiles: 62, clearedMiles: 186, codes: { stored: ['P0171'], pending: [], permanent: ['P0171'] } };
  body.claude = { text: 'Trims high at idle, near normal at cruise: points to an air leak. A lead, not a diagnosis.', at: carAt, url: 'https://pc.test/drives/x' };
  await p.evaluate(() => { V60_DRIVES.refresh(); }); await p.waitForTimeout(600); await p.evaluate(() => V60.jump('tab:car')); await p.waitForTimeout(200);
  const home = await p.textContent('#mnHome');
  ok(/FROM YOUR CAR/.test(home) && /Claude: Trims high at idle/.test(home), 'Home shows Claude\'s latest message under From your car');
  ok(/Check-engine light on when the car last started/.test(home) && /P0171/.test(home) && /Driven 62 mi with it on/.test(home), 'Home lists the lit light with its code under On the car now');
  ok(await p.evaluate(() => V60.computeHealth().score < 100), 'Health counts the light the PC read');
  ok(/Odometer 91,500 mi/.test(home.replace(/\s+/g, ' ')), 'Home shows the odometer read from the car');
  await p.locator('#fromcar').scrollIntoViewIfNeeded(); await p.screenshot({ path: path.join(ROOT, 'tests', 'shots', 'drives-fromcar.png') });
  ok(await p.evaluate(() => { const o = V60.odoEst(); return o.car && o.miles === 91500 && V60.state.odo === 91400; }), 'the car\'s newer reading is the base; the typed 91,400 is kept');
  await p.evaluate(() => V60.jump('tab:maint')); await p.waitForTimeout(150);
  ok(/Read from the car/.test(await p.textContent('#mtBody #drives')), 'Maintain says the mileage was read from the car');
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= 390), 'no sideways scroll with the new section');
  /* the PC is off: the cached summary still shows, no errors */
  await ctx.unroute('https://pc.test/drives/summary.json'); await ctx.route('https://pc.test/**', (r) => r.abort());
  await p.reload(); await p.waitForTimeout(600); await p.evaluate(() => V60.jump('tab:maint')); await p.waitForTimeout(150);
  ok(!!(await p.$('#mtBody #drives')), 'PC off: the last summary still shows');
  ok(errs.length === 0, 'no errors ' + JSON.stringify(errs));
  await b.close();
})();
