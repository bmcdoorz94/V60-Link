/* Recommended for your car (2026-11-27): Claude's recommendations come from the PC's summary.json (mocked here).
   Checks: Home shows the top three, most urgent first; the page lists them with why, effort, cost and sources, and
   filters by kind; malformed items and unsafe links are dropped; "Done" and "Not interested" hide an item (and
   survive a reload) and Undo brings it back; "Ask for new recommendations" posts to the PC; no sideways scroll. */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const path = require('path'); const ROOT = path.resolve(__dirname, '..');
function ok(c, m) { if (!c) { console.log('FAIL', m); process.exitCode = 1; } else console.log(' ok', m); }
const now = new Date().toISOString();
const src = [['Volvo 2016 V60 owner\'s manual', 'https://www.volvocars.com/en-us/support/manuals/v60/2016']];
const RECO = { updated: now, items: [
  { id: 'r-cabin', kind: 'maintenance', title: 'Cabin air filter', when: 'later', why: 'No record; Volvo lists it every 20,000 mi.', effort: 'diy', cost: '', confidence: 'confirmed', sources: src },
  { id: 'r-pcv', kind: 'repair', title: 'Check the PCV oil trap and hoses', when: 'now', why: 'P0171 with trims far higher at idle than at cruise points to unmetered air.', evidence: 'Drives 26-27 Nov: idle +27%, cruise +4%.', effort: 'shop', cost: '', confidence: 'likely', sources: src },
  { id: 'r-polestar', kind: 'performance', title: 'Polestar Performance Optimization', when: 'later', why: 'Volvo\'s own software option; ask a dealer whether it is offered for this engine.', effort: 'shop', cost: '', confidence: 'unconfirmed', sources: src },
  { id: 'r-wipers', kind: 'cosmetic', title: 'Headlight lens restoration', when: 'soon', why: 'Hazy lenses dim the lights.', effort: 'diy', cost: '$20-30 (kit, seen 2026-11-27)', confidence: 'likely', sources: [['Bad', 'javascript:alert(1)'], ...src] },
  { id: 'bad id with spaces', kind: 'repair', title: 'Dropped: bad id', when: 'now' },
  { kind: 'repair', title: 'Dropped: no id', when: 'now' },
] };

(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(() => { window.__V60_TEST = true; window.V60_NATIVE = Object.assign(window.V60_NATIVE || {}, { pc: 'pc.test' }); });
  let asked = 0;
  await ctx.route('https://pc.test/drives/summary.json', (r) => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ updated: now, drives: [], totals: {}, links: {}, recommendations: RECO }) }));
  await ctx.route('https://pc.test/drives/review', (r) => { asked++; r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"ok":true}' }); });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file://' + ROOT + '/index.html'); await p.waitForTimeout(700);
  await p.evaluate(() => V60.jump('tab:car')); await p.waitForTimeout(200);
  const home = (await p.textContent('#mnHome')).replace(/\s+/g, ' ');
  const sec = home.slice(home.indexOf('RECOMMENDED'));
  ok(/RECOMMENDED/.test(home) && sec.indexOf('PCV') < sec.indexOf('Headlight') && sec.indexOf('Headlight') < sec.indexOf('Cabin'), 'Home shows the recommendations, most urgent first');
  ok(!/Polestar/.test(sec.slice(0, sec.indexOf('All recommendations'))), 'Home shows only the top three');
  await p.evaluate(() => V60.jump('tab:reco')); await p.waitForTimeout(200);
  const t = await p.textContent('#rcList');
  ok(['PCV', 'Headlight', 'Cabin', 'Polestar'].every((x) => t.includes(x)) && !/Dropped/.test(t), 'the page lists the four valid items and drops the malformed ones');
  ok(/Unconfirmed/.test(t) && /\$20-30 \(kit, seen 2026-11-27\)/.test(t) && /DIY/.test(t) && /Shop/.test(t), 'confidence, cost with its source date, and DIY or shop are shown');
  ok(await p.evaluate(() => !document.querySelector('#rcList a[href^="javascript"]') && !!document.querySelector('#rcList a[href^="https://www.volvocars.com"]')), 'sources linked; an unsafe link is dropped');
  await p.click('#rcFilter button[data-rcf="performance"]'); await p.waitForTimeout(100);
  ok(/Polestar/.test(await p.textContent('#rcList')) && !/PCV/.test(await p.textContent('#rcList')), 'the kind filter shows only that kind');
  await p.click('#rcFilter button[data-rcf="all"]');
  await p.click('button[data-rcmark="r-pcv:done"]'); await p.waitForTimeout(100);
  ok(!/PCV/.test(await p.textContent('#rcList')) && /1 marked done or not interested/.test(await p.textContent('#rcHidden')), 'Done hides an item and lists it below');
  await p.reload(); await p.waitForTimeout(700); await p.evaluate(() => V60.jump('tab:reco')); await p.waitForTimeout(200);
  ok(!/PCV/.test(await p.textContent('#rcList')), 'the mark survives a reload');
  await p.click('#rcHidden summary'); await p.click('button[data-rcmark="r-pcv:undo"]'); await p.waitForTimeout(100);
  ok(/PCV/.test(await p.textContent('#rcList')), 'Undo brings it back');
  await p.click('#rcAsk'); await p.waitForTimeout(400);
  ok(asked === 1 && /reviewing/.test(await p.textContent('#rcMsg')), 'Ask for new recommendations posts to the PC');
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= 390), 'no sideways scroll');
  await p.screenshot({ path: path.join(ROOT, 'tests', 'shots', 'reco.png'), fullPage: true });
  ok(errs.length === 0, 'no errors ' + JSON.stringify(errs));
  await b.close();
})();
