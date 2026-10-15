/* Navigation: every page has a way in and a way back.
   - the hood view offers the engine bay map, and the crumb leads back to the hood view
   - the map stays a drawing (the owner's photo is optional)
   - with Show everything on, every page is linked from somewhere other than itself
   - The car's index, and the see-also strips on Glovebox, Link and Cases, only list pages the story has opened
   - Back retraces a path two pages deep, and a root clears it */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const path = require('path'); const ROOT = path.resolve(__dirname, '..');
function ok(c, m) { if (!c) { console.log('FAIL', m); process.exitCode = 1; } else console.log(' ok', m); }
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); await ctx.addInitScript(() => { window.__V60_TEST = true; });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + ROOT + '/index.html'); await p.waitForTimeout(600);
  const tab = () => p.evaluate(() => { const v = [...document.querySelectorAll('main > .panel')].filter(x => !x.hidden)[0]; return v && v.id.slice(2); });
  const crumb = () => p.evaluate(() => { const c = document.getElementById('crumb'); return c && !c.hidden ? c.textContent.trim() : ''; });

  /* fresh start: the engine bay map is open from the start (Safe to Touch) and sits under the hood drawing */
  await p.evaluate(() => V60_MANUAL.go('view', 'bay')); await p.waitForTimeout(100);
  ok(await p.isVisible('#mnView .mn-mapbtn'), 'the hood view has an Engine bay map button');
  await p.click('#mnView .mn-mapbtn'); await p.waitForTimeout(150);
  ok(await tab() === 'engine', 'it opens the engine bay map');
  ok(await p.evaluate(() => !!document.querySelector('#ebStage svg.ebsvg')), 'the map is the drawing, not a photo');
  ok(/Back to Engine bay/.test(await crumb()), 'the crumb leads back to the hood view (' + await crumb() + ')');
  await p.click('#crumb [data-back]'); await p.waitForTimeout(150);
  ok(await tab() === 'view' && await p.isVisible('#mnView .mn-mapbtn'), 'Back returns to the hood view');
  await p.evaluate(() => __v60.go('engine')); await p.waitForTimeout(100);
  const ori = await p.evaluate(() => { const y = s => { const t = [...document.querySelectorAll('#ebStage .edge')].filter(e => e.textContent.indexOf(s) === 0)[0]; return t ? +t.getAttribute('y') : null; }; const c = document.querySelector('[data-bi="catch"] rect'); return { wind: y('Windshield'), bump: y('Front bumper'), catchY: c ? +c.getAttribute('y') : null }; });
  ok(ori.wind < 60 && ori.bump > 380 && ori.catchY > 300, 'map seen from the bumper: windshield on top, hood catch at the bottom ' + JSON.stringify(ori));

  /* fresh start: nothing locked is offered (the index page is the back of the book) */
  await p.evaluate(() => __v60.go('car')); await p.waitForTimeout(150);
  ok(await p.evaluate(() => !!document.querySelector('#mnHome [data-jump="tab:index"]') && !document.querySelector('#mnHome .mn-also')), 'the home carries one Index button instead of the page lists');
  await p.evaluate(() => __v60.go('index')); await p.waitForTimeout(150);
  const offered = await p.evaluate(() => [...document.querySelectorAll('#mnIndex .mn-also [data-jump]')].map(e => e.getAttribute('data-jump').slice(4)));
  const allOpen = await p.evaluate(o => o.every(t => V60_GATE.visible(t)), offered);
  ok(offered.length > 0 && allOpen, 'the index lists only opened pages at the start (' + offered.join(',') + ')');
  ok(!offered.includes('fuel') && !offered.includes('upgrades'), 'pages the story has not reached stay hidden');

  /* Show everything: every page has a way in */
  await p.evaluate(() => { __v60.go('story'); }); await p.waitForTimeout(150);
  await p.evaluate(() => { const o = document.getElementById('stOpts'); if (o) o.open = true; }); await p.check('#stAll'); await p.waitForTimeout(200);
  const tabs = await p.evaluate(() => [...document.querySelectorAll('main > .panel')].map(x => x.id.slice(2)));
  const into = {};
  for (const t of tabs) {
    await p.evaluate(t => __v60.go(t), t); await p.waitForTimeout(60);
    const outs = await p.evaluate(() => { const v = [...document.querySelectorAll('main > .panel')].filter(x => !x.hidden)[0]; return [...v.querySelectorAll('[data-jump^="tab:"],[data-tab]')].map(e => e.getAttribute('data-jump') ? e.getAttribute('data-jump').slice(4) : e.getAttribute('data-tab')); });
    outs.forEach(o => { if (o !== t) (into[o] = into[o] || new Set()).add(t); });
  }
  const navTabs = await p.evaluate(() => [...document.querySelectorAll('#rail [data-tab]')].map(e => e.getAttribute('data-tab')));
  navTabs.forEach(o => (into[o] = into[o] || new Set()).add('bar'));
  const orphans = tabs.filter(t => !['view', 'item'].includes(t) && !into[t]);
  ok(orphans.length === 0, 'every page is linked from another page or the bar' + (orphans.length ? ' (missing: ' + orphans.join(',') + ')' : ''));
  const broken = Object.keys(into).filter(t => !tabs.includes(t));
  ok(broken.length === 0, 'no link points at a page that does not exist ' + JSON.stringify(broken));
  for (const r of ['glove', 'live', 'story']) {
    await p.evaluate(r => __v60.go(r), r); await p.waitForTimeout(100);
    ok(await p.evaluate(r => document.querySelectorAll('#also-' + r + ' [data-jump]').length > 0, r), 'see-also on ' + r);
  }

  /* Back retraces two pages, a root clears the trail */
  await p.evaluate(() => __v60.go('glove')); await p.waitForTimeout(100);
  await p.click('#also-glove [data-jump="tab:records"]'); await p.waitForTimeout(100);
  ok(await tab() === 'records' && /Back to Glovebox/.test(await crumb()), 'Glovebox → Service log shows Back to Glovebox');
  await p.evaluate(() => V60.jump('tab:kb')); await p.waitForTimeout(100);
  ok(/Back to Service log/.test(await crumb()), 'a second hop shows Back to Service log (' + await crumb() + ')');
  await p.click('#crumb [data-back]'); await p.waitForTimeout(100);
  ok(await tab() === 'records' && /Back to Glovebox/.test(await crumb()), 'Back once: Service log, still offering Glovebox');
  await p.click('#crumb [data-back]'); await p.waitForTimeout(100);
  ok(await tab() === 'glove' && !(await crumb()), 'Back twice: Glovebox, no crumb on a root');

  ok(errs.length === 0, 'no errors ' + JSON.stringify(errs));
  await b.close();
})();
