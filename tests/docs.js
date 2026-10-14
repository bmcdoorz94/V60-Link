/* Documents: three PDFs (inspection report, receipt, insurance card) go in, are sorted and read, the owner files them,
   and the right places fill in. Needs jsDelivr reachable (pdf.js is loaded from it). */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..'), SH = path.join(ROOT, 'tests', 'shots') + '/'; fs.mkdirSync(SH, { recursive: true });
const FX = (n) => path.join(ROOT, 'tests', 'fixtures', n);
function ok(c, m) { if (!c) { console.log('FAIL', m); process.exitCode = 1; } else console.log(' ok', m); }
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(() => { window.__V60_TEST = true; });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('PE ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + ROOT + '/index.html'); await p.waitForTimeout(500);
  await p.evaluate(() => { const s = V60.mod('story'); s.all = true; V60.setMod('story', s); V60.save(); __v60.go('glove'); });
  ok(await p.isVisible('#dcGloveCard'), 'Glovebox shows the Documents card');
  await p.click('#dcGloveCard [data-jump="tab:docs"]'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => !document.getElementById('p-docs').hidden), 'Documents page opens from the Glovebox');
  await p.setInputFiles('#dcFile', [FX('inspection.pdf'), FX('receipt.pdf'), FX('insurance.pdf')]);
  await p.waitForFunction(() => /read/.test(document.getElementById('dcStatus').textContent) && document.querySelectorAll('.dc-rev').length === 3, null, { timeout: 60000 });
  await p.screenshot({ path: SH + 'docs-review.png', fullPage: true });
  const kinds = await p.evaluate(() => [...document.querySelectorAll('[data-dckind]')].map(s => s.value));
  ok(JSON.stringify(kinds) === '["inspection","receipt","insurance"]', 'sorted as inspection, receipt, insurance: ' + kinds);
  const v = (sel) => p.inputValue(sel);
  ok(await v('#dcF0date') === '2026-05-16' && await v('#dcF0miles') === '89617' && await v('#dcF0result') === 'pass' && /SAMPLE LUBE/.test(await v('#dcF0station')) && await v('#dcF0codes') === 'P0455', 'inspection fields read: date, odometer, result, station, code');
  ok(await v('#dcF1date') === '2026-09-02' && await v('#dcF1miles') === '94210' && await v('#dcF1total') === '171.82' && /SAMPLE AUTO/.test(await v('#dcF1shop')), 'receipt fields read: date, odometer, total, shop');
  ok(await v('#dcF2expires') === '2026-10-01', 'insurance expiry read: ' + await v('#dcF2expires'));
  const ex = await p.evaluate(() => [...document.querySelectorAll('.dc-rev .dc-ex')].map(x => x.textContent).join('\n'));
  ok(ex.indexOf('1HGBH41JXMN109186') < 0 && ex.indexOf('ABC1234') < 0 && ex.indexOf('555-0100') < 0 && ex.indexOf('Jane') < 0, 'VIN, plate, phone and name are blacked out of what is kept');
  ok(/Pass/.test(ex) && /P0455/.test(ex), 'the useful text stays readable');
  // file the inspection
  await p.click('[data-dcfile="0"]'); await p.waitForTimeout(200);
  const g = await p.evaluate(() => V60.mod('glove').docs);
  ok(g.inspDue === '2027-05-16', 'inspection filed: next emissions test due ' + g.inspDue);
  ok(await p.evaluate(() => V60.state.odo) >= 89617, 'odometer bumped from the inspection');
  // file the insurance (now index 1)
  await p.click('[data-dcfile="1"]'); await p.waitForTimeout(200);
  ok((await p.evaluate(() => V60.mod('glove').docs)).insRenew === '2026-10-01', 'insurance filed: renewal date set');
  // the receipt goes to the Glovebox check card
  await p.click('[data-dcfile="0"]'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => !document.getElementById('p-glove').hidden) && await p.isVisible('#gbRSave'), 'receipt handed to the Glovebox receipt card');
  ok(await v('#gbRTotal') === '171.82' && await v('#gbRMiles') === '94210', 'receipt card prefilled from the PDF');
  await p.click('#gbRSave'); await p.waitForTimeout(200);
  ok((await p.evaluate(() => V60.mod('glove').receipts)).length === 1, 'receipt saved');
  await p.evaluate(() => __v60.go('docs')); await p.waitForTimeout(200);
  ok(await p.evaluate(() => document.querySelectorAll('#dcList .dc-row').length) === 3, 'three documents on file');
  await p.fill('#dcQ', 'P0455'); await p.waitForTimeout(100);
  ok(await p.evaluate(() => document.querySelectorAll('#dcList .dc-row').length) === 1, 'search finds the inspection by its code');
  await p.fill('#dcQ', ''); await p.click('[data-dcfilter="insurance"]');
  ok(await p.evaluate(() => document.querySelectorAll('#dcList .dc-row').length) === 1, 'filter chip narrows to insurance');
  await p.click('[data-dcfilter=""]');
  await p.screenshot({ path: SH + 'docs-list.png', fullPage: true });
  // the same file again is refused
  await p.setInputFiles('#dcFile', [FX('inspection.pdf')]);
  await p.waitForFunction(() => /skipped/.test(document.getElementById('dcStatus').textContent), null, { timeout: 30000 });
  ok(/Already on file/.test(await p.textContent('#dcStatus')) && await p.evaluate(() => document.querySelectorAll('.dc-rev').length) === 0, 'a duplicate PDF is skipped');
  // survives a reload and the manual step is done
  await p.reload(); await p.waitForTimeout(600);
  ok((await p.evaluate(() => V60.mod('docs').list)).length === 3, 'documents survive a reload');
  ok(await p.evaluate(() => { const CH = window.V60_MANUAL.chapters, id = Object.keys(CH).filter(k => CH[k].item && CH[k].item.id === 'glove' && CH[k].tier === 'S')[0]; return !!id && ['open', 'closed', 'locked', 'new'].indexOf(window.V60_MANUAL.status(id)) >= 0; }), 'the Glovebox Service chapter still evaluates with the new step');
  console.log(' errs', errs); if (errs.length) process.exitCode = 1;
  await ctx.close(); await b.close();
})();
