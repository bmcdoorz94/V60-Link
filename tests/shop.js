/* Plan & shop (2026-11-27): the five sections with their counts, a section's grouped list, the by-need switch, an item's
   four ways (check, DIY only when sourced, shop with what to ask for, ask Claude), the plan with totals and a shop-quote
   text, Log it, the belt-squeal troubleshooter leading to the item, and Ask Claude against a mocked PC (and its fallback). */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const path = require('path'); const ROOT = path.resolve(__dirname, '..');
function ok(c, m) { if (!c) { console.log('FAIL', m); process.exitCode = 1; } else console.log(' ok', m); }
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(() => { window.__V60_TEST = true; window.V60_NATIVE = Object.assign(window.V60_NATIVE || {}, { pc: 'pc.test' }); });
  let asks = [], askStatus = 200;
  await ctx.route('https://pc.test/drives/summary.json', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ updated: new Date().toISOString(), drives: [], totals: { drives: 0, miles: 0, first: null }, links: {} }) }));
  await ctx.route('https://pc.test/drives/ask', (r) => { asks.push(JSON.parse(r.request().postData() || '{}')); r.fulfill({ status: askStatus, contentType: 'application/json', body: askStatus === 200 ? '{"ok":true}' : 'no' }); });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/pc\.test|status of 404/.test(m.text())) errs.push(m.text()); }); /* the 404 is the test's own PC refusing a question */
  await p.goto('file://' + ROOT + '/index.html'); await p.waitForTimeout(700);
  const shot = (n) => p.screenshot({ path: path.join(ROOT, 'tests', 'shots', 'shop-' + n + '.png'), fullPage: true });
  const txt = (sel) => p.evaluate((s) => (document.querySelector(s) || {}).textContent || '', sel);
  await p.evaluate(() => { V60.state.odo = 91357; V60.save(); });

  ok(await p.evaluate(() => !!document.querySelector('#mnHome [data-jump="tab:shop"]') && !!document.querySelector('#p-maint [data-jump="tab:shop"]') || (V60.jump('tab:maint'), !!document.querySelector('#mtBody [data-jump="tab:shop"]'))), 'Home and Maintain lead to Plan & shop');
  await p.evaluate(() => V60.jump('tab:shop')); await p.waitForTimeout(200);
  ok(await p.evaluate(() => document.querySelectorAll('#spBody .sp-secrow').length === 5), 'the five sections of the car are listed');
  ok(await p.evaluate(() => ['Needed', 'Recommended', 'If needed', 'Upgrade'].every(t => document.querySelector('#spBody .sp-tot').textContent.includes(t))), 'totals for each group');
  await shot('menu');

  /* a section */
  await p.click('#spBody [data-sp-sec="bay"]'); await p.waitForTimeout(150);
  const bay = await txt('#spBody');
  ok(/NEEDED/.test(bay) && /Accessory belt kit/.test(bay) && /Timing belt kit/.test(bay), 'Engine bay lists the timing and accessory belt kits as needed (10 years, no record)');
  ok(/RECOMMENDED/.test(bay) && /UPGRADES/.test(bay) && /Polestar/.test(bay), 'and recommended items and upgrades');
  ok(/\$740–990 shop \(belt alone/.test(bay) && /Price not researched/.test(bay), 'prices only where a source gives one');
  await p.click('#spBody [data-sp-filter="up"]'); await p.waitForTimeout(100);
  ok(!/NEEDED/.test(await txt('#spBody')) && /UPGRADES/.test(await txt('#spBody')), 'the Upgrades filter shows only upgrades');
  await p.click('#spBody [data-sp-filter="all"]'); await p.waitForTimeout(100);
  await shot('bay');

  /* an item: four ways */
  await p.click('#spBody [data-sp-item="abelt"]'); await p.waitForTimeout(150);
  const it = await txt('#spBody');
  ok(/FOUR WAYS/.test(it) && /Check it yourself/.test(it) && /Do it yourself/.test(it) && /Have a shop do it/.test(it) && /Ask Claude/.test(it), 'the item shows the four ways');
  ok(/page 16/.test(it) && /10 years/.test(it), "it quotes Volvo's schedule row and footnote");
  ok(/No step-by-step for this engine/.test(it) && /VIDA/.test(it), 'DIY says plainly that no procedure is sourced');
  ok(/Ask for: .Accessory drive belt, belt tensioner & idler pulley, replace/.test(it), 'the shop step says exactly what to ask for');
  ok(await p.evaluate(() => !!document.querySelector('#spBody a[href*="gatestechzone"]')), 'the check cites Gates');
  ok(await p.evaluate(() => !document.querySelector('#spBody [data-sp-addas="abelt:diy"]')), 'no DIY option without a sourced procedure');
  await shot('item');
  await p.click('#spBody [data-sp-addas="abelt:shop"]'); await p.waitForTimeout(100);
  /* Ask Claude: sent to the PC, then the fallback when the PC refuses */
  await p.click('#spBody [data-sp-ask="abelt"]'); await p.waitForTimeout(300);
  ok(asks.length === 1 && asks[0].kind === 'item' && /Accessory belt/.test(asks[0].item) && /B4204T11/.test(asks[0].question), 'Ask Claude sends the item and the car to the PC');
  ok(/Sent/.test(await txt('#spAskMsg')), 'and says it was sent');
  askStatus = 404; await p.click('#spBody [data-sp-ask="abelt"]'); await p.waitForTimeout(300);
  ok(/Copy it/.test(await txt('#spAskMsg')), 'a PC without the route gets the copy fallback');
  await p.click('#spBody [data-sp-back]'); await p.waitForTimeout(100);

  /* add a DIY item from the list, and a shop item */
  await p.click('#spBody [data-sp-add="cabinf"]'); await p.waitForTimeout(100);
  await p.click('#spBody [data-sp-add="tbelt"]'); await p.waitForTimeout(100);
  ok(await p.evaluate(() => { const pl = V60.mod('shop').plan; return pl.cabinf === 'diy' && pl.tbelt === 'shop' && pl.abelt === 'shop'; }), '+ Add picks DIY where there is a step-by-step, shop otherwise');
  ok(/Your plan/.test(await txt('#spBody .sp-planbar')) && /\$750–1,020 priced · 1 to quote/.test(await txt('#spBody .sp-planbar')), 'the plan bar totals what is priced and counts what is not ' + await txt('#spBody .sp-planbar'));

  /* by need */
  await p.click('#spBody [data-sp-mode="need"]'); await p.waitForTimeout(100);
  ok(await p.evaluate(() => document.querySelectorAll('#spBody .sp-sec').length > 10 && /Wheels & brakes/.test(document.querySelector('#spBody').textContent)), 'By need lists the whole car with each item\'s section');
  await shot('need');
  await p.click('#spBody [data-sp-sec="wheel"]'); await p.waitForTimeout(100);
  ok(await p.evaluate(() => !/Accessory belt/.test(document.querySelector('#spBody').textContent) && /tire monitor/.test(document.querySelector('#spBody').textContent)), 'a section chip narrows it');

  /* the plan */
  await p.click('#spBody .sp-planbar'); await p.waitForTimeout(150);
  const pl = await txt('#plBody');
  ok(/SHOP VISIT/.test(pl) && /DO IT YOURSELF/.test(pl) && /Cabin air filter/.test(pl), 'the plan splits shop and DIY jobs');
  ok(await p.evaluate(() => /Please quote/.test(document.getElementById('plQuote').value) && /Timing belt tensioner & idler pulley, replace/.test(document.getElementById('plQuote').value) && !/Cabin/.test(document.getElementById('plQuote').value)), 'the shop-quote text lists only the shop jobs, in Volvo\'s words');
  await shot('plan');
  await p.click('#plBody [data-sp-addas="cabinf:shop"]'); await p.waitForTimeout(100);
  ok(await p.evaluate(() => V60.mod('shop').plan.cabinf === 'shop'), 'a job can switch from DIY to shop');
  askStatus = 200; await p.click('#plBody [data-sp-askplan]'); await p.waitForTimeout(300);
  ok(asks.some(a => a.kind === 'plan' && a.items.length === 3), 'Ask Claude to check this plan sends every job');
  await p.click('#plBody [data-sp-log="cabin"]'); await p.waitForTimeout(150);
  ok(await p.evaluate(() => !document.querySelector('#p-records').hidden && document.getElementById('logItem').value === 'cabin'), 'Log it done opens the service log on that item');

  /* the belt squeal troubleshooter leads to the item */
  await p.evaluate(() => V60.jump('tree:belt')); await p.waitForTimeout(150);
  await p.click('#trBox [data-ans="n"]'); await p.waitForTimeout(80); await p.click('#trBox [data-ans="y"]'); await p.waitForTimeout(80);
  ok(/too little belt tension/.test(await txt('#trBox')) && /Gates/.test(await txt('#trBox')), 'a squeal at start-up points to belt tension, citing Gates');
  await p.click('#trBox [data-jump="shop:abelt"]'); await p.waitForTimeout(150);
  ok(await p.evaluate(() => !document.querySelector('#p-shop').hidden && /Accessory belt kit/.test(document.querySelector('#spBody h3').textContent)), 'and opens the accessory belt item');

  /* the plan survives a reload */
  await p.reload(); await p.waitForTimeout(700);
  ok(await p.evaluate(() => Object.keys(V60.mod('shop').plan).length === 3), 'the plan survives a reload');
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= 390), 'no sideways scroll');
  ok(errs.length === 0, 'no errors ' + JSON.stringify(errs));
  await b.close();
})();
