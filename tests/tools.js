/* Glovebox tool inventory: tiers, sourced store prices, the owner's own price (saved, survives reload, cleared back to the store price),
   tier totals. Also the ASE article: it opens in the Library and The Belt case unlocks it. */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const path = require('path'); const ROOT = path.resolve(__dirname, '..');
function ok(c, m) { if (!c) { console.log('FAIL', m); process.exitCode = 1; } else console.log(' ok', m); }
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); await ctx.addInitScript(() => { window.__V60_TEST = true; });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + ROOT + '/index.html'); await p.waitForTimeout(400);

  // the ASE article is locked at the start and unlocked by The Belt case
  const belt = await p.evaluate(() => (window.V60_STORY.cases || []).filter(c => c.id === 'belt')[0]);
  ok(belt && belt.know.arts.indexOf('a-ase') >= 0, 'The Belt case unlocks the ASE article');
  ok(await p.evaluate(() => !window.V60_KNOW.article('a-ase')), 'ASE article is not in the Library on day one');

  await p.evaluate(() => { const s = V60.mod('story'); s.all = true; V60.setMod('story', s); V60.save(); __v60.go('glove'); });
  await p.waitForTimeout(300);
  const tiers = await p.$$eval('#gbTools .ttier h4', els => els.map(e => e.textContent));
  ok(tiers.length === 3 && /Tier 1/.test(tiers[0]) && /Tier 3/.test(tiers[2]), 'three tiers shown: ' + JSON.stringify(tiers));
  const n = await p.$$eval('#gbTools .tool', els => els.length);
  ok(n === await p.evaluate(() => window.V60_TOOLS.length), 'every tool is shown (' + n + ')');
  ok(await p.evaluate(() => window.V60_TOOLS.every(t => t.length >= 3 && typeof t[1] === 'string')), 'V60_TOOLS keeps [id, name, use] for the DIY jobs');

  // sourced prices: every price has a store, a link and a number, and the check date is set
  const P = await p.evaluate(() => window.V60_TOOL_PRICES);
  ok(P && /^\d{4}-\d{2}-\d{2}$/.test(P.checked), 'price list has a checked date');
  const bad = [];
  Object.keys(P.items).forEach(k => P.items[k].forEach(x => { if (x.price != null && !(x.store && /^https:\/\//.test(x.url) && x.price > 0)) bad.push(k); }));
  ok(bad.length === 0, 'every store price has a store, an https link and a positive number ' + JSON.stringify(bad));
  const ids = await p.evaluate(() => window.V60_TOOLS.map(t => t[0]));
  ok(Object.keys(P.items).every(k => ids.indexOf(k) >= 0), 'every priced id is a real tool');

  // the owner's price replaces the store price, persists, and can be cleared
  const tool = 'gauge';
  await p.click('details[data-tp="' + tool + '"] summary');
  await p.fill('#gbTP-' + tool, '7.5'); await p.press('#gbTP-' + tool, 'Tab'); await p.waitForTimeout(150);
  ok(/\$7\.50 · your price/.test(await p.textContent('details[data-tp="' + tool + '"] summary')), 'own price shows in the summary');
  ok(await p.evaluate(() => V60.mod('glove').price.gauge === 7.5), 'own price saved');
  await p.reload(); await p.waitForTimeout(500); await p.evaluate(() => __v60.go('glove')); await p.waitForTimeout(200);
  ok(/\$7\.50 · your price/.test(await p.textContent('details[data-tp="' + tool + '"] summary')), 'own price survives a reload');
  const head1 = await p.textContent('#gbTools .ttier:first-child h4');
  await p.click('details[data-tp="' + tool + '"] summary');
  await p.click('[data-tpclear="' + tool + '"]'); await p.waitForTimeout(150);
  ok(await p.evaluate(() => V60.mod('glove').price.gauge === undefined), 'Use the store price clears it');
  ok(!/your price/.test(await p.textContent('details[data-tp="' + tool + '"] summary')), 'summary is back to the store price');

  // owning a tool takes it out of the tier total
  await p.check('[data-tool="' + tool + '"]'); await p.waitForTimeout(150);
  const head2 = await p.textContent('#gbTools .ttier:first-child h4');
  ok(head1 !== head2, 'tier total changes when a tool is ticked (' + head1 + ' → ' + head2 + ')');
  ok(/owned/.test(await p.textContent('#gbToolStat')), 'inventory count shown');

  // junk in saved prices is dropped by clean()
  const cleaned = await p.evaluate(() => { const m = window.V60_MODULES.filter(x => x.id === 'glove')[0]; return m.clean({ tools: {}, price: { gauge: '3', jack: -4, torx: 'abc', 'bad key!': 2, stands: '' } }).price; });
  ok(JSON.stringify(cleaned) === '{"gauge":3}', 'clean() keeps only valid prices ' + JSON.stringify(cleaned));

  // the ASE article opens and carries its sources
  await p.evaluate(() => V60.jump('kb:a-ase')); await p.waitForTimeout(300);
  const txt = await p.evaluate(() => document.body.innerText);
  ok(/ASE certification/.test(txt) && /\$34 registration/.test(txt) && /ase\.com/.test(await p.content()), 'ASE article opens with the fee lines and ASE sources');

  ok(errs.length === 0, 'no errors ' + JSON.stringify(errs));
  await b.close();
})();
