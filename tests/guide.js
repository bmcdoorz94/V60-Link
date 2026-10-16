/* Guided mode (since the path, 2026-10-15, opened from code only: the path's Next card is the way forward): walkthrough, at-the-car question, safety check, I'm stuck ladder, levels rising and the
   "Keep guiding me" undo, unprompted proof, tab intros and the welcome-back recap. */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const path = require('path'), fs = require('fs'); const ROOT = path.resolve(__dirname, '..'); const SH = path.join(ROOT, 'tests', 'shots') + '/'; fs.mkdirSync(SH, { recursive: true });
function ok(c, m) { if (!c) { console.log('FAIL', m); process.exitCode = 1; } else console.log(' ok', m); }
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  for (const [nm, vp, sch] of [['phone', { width: 390, height: 844 }, 'light'], ['dark', { width: 390, height: 844 }, 'dark']]) {
    console.log(nm);
    const ctx = await b.newContext({ viewport: vp, colorScheme: sch }); await ctx.addInitScript(() => { window.__V60_TEST = true; });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push('PE ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto('file://' + ROOT + '/index.html'); await p.waitForTimeout(500);
    const h2 = () => p.textContent('#gwH');
    await p.evaluate(() => __v60.go('story'));
    ok(/your path/.test(await p.textContent('#stV-cases .nextc')) && !(await p.$('#stV-cases .nextc [data-guide]')), 'the case board points at the path instead of its own next objective');
    ok(await p.isHidden('#guideBtn'), 'no Guide me button in the header');
    await p.evaluate(() => V60_GUIDE.start(null));
    ok(/at the car/.test(await h2()), 'asks whether you are at the car');
    await p.click('[data-gw="car-no"]');
    ok(/four jobs/.test(await h2()), 'first step: ' + await h2());
    await p.screenshot({ path: SH + 'g-step-' + nm + '.png' });
    for (let i = 0; i < 3; i++) await p.click('[data-gw="stuck"]');
    ok(await p.locator('.gwstuck').count() === 1 && await p.locator('[data-gw="risk"]').count() === 1, 'stuck ladder: hint, lesson, then known risk');
    await p.click('.gwbig [data-gw="go"]');
    ok(await p.isHidden('#gwOv') && await p.isVisible('#gwPill'), 'lesson opens with a pill back to the walkthrough');
    ok(/Back to the case/.test(await p.textContent('#p-academy')), 'lesson knows which case it serves');
    await p.evaluate(() => { const A = V60.acad(); A.done['m-sys'] = { date: '2026-10-11', outcome: 'good' }; V60.save(); V60.renderAll(); });
    ok(/Step done/.test(await p.textContent('#gwPill')), 'pill says the step is done');
    await p.click('#gwPill');
    ok(/safety rules/.test(await h2()) && await p.locator('.gwprev').count() === 1, 'next step, with the finished one acknowledged');
    await p.evaluate(() => { const A = V60.acad(); A.done['m-safe'] = { date: '2026-10-11', outcome: 'good' }; V60.save(); V60.renderAll(); });
    await p.click('[data-gw="close"]');
    await p.evaluate(() => V60_GUIDE.start(null));
    ok(/box can and can't hear/.test(await h2()), 'not at the car: skips car steps (' + await h2() + ')');
    ok(await p.evaluate(() => V60.mod('guide').sc.hood) === 1, 'a step finished without "stuck" counts; the stuck one does not');
    await p.click('[data-gw="close"]');
    // at the car: the safety check comes first
    await p.evaluate(() => { V60.mod('guide').at = { date: V60.todayStr(), car: true }; V60.save(); });
    await p.evaluate(() => V60_GUIDE.start('safe'));
    ok(/Before touching/.test(await h2()) && await p.isDisabled('[data-gw="gate"]'), 'safety check before hands-on steps');
    for (const c of await p.$$('[data-gwgate]')) await c.check();
    await p.click('[data-gw="gate"]');
    ok(/Open the hood/.test(await h2()), 'then the hands-on step');
    await p.screenshot({ path: SH + 'g-hood-' + nm + '.png' });
    // proof raises the level, announced with an undo
    await p.evaluate(() => { V60.mod('guide').sc.hood = 3; V60.save(); const A = V60.acad(); A.done['m-hood'] = { date: '2026-10-11', outcome: 'good' }; V60.save(); V60.renderAll(); });
    await p.click('[data-gw="close"]');
    await p.evaluate(() => V60_GUIDE.start('safe'));
    await p.click('[data-gw="close"]');
    ok(await p.evaluate(() => V60.mod('guide').lvl.hood) === 1, 'hood guidance stepped back to assisted');
    await p.evaluate(() => { __v60.go('today'); });
    ok(/Less hand-holding for under-the-hood/.test(await p.textContent('#tdCards')), 'Today announces it');
    await p.evaluate(() => __v60.go('today')); await p.click('[data-gkeep="hood"]');
    ok(await p.evaluate(() => V60_GUIDE.level('safe')) === 0, 'Keep guiding me puts it back');
    // unprompted proof
    const before = await p.evaluate(() => V60.mod('guide').sc.hood);
    await p.evaluate(() => { V60.state.oil.push({ id: 'x1', date: V60.todayStr(), miles: 95100, level: 'full' }); V60.save(); V60.renderAll(); });
    ok(await p.evaluate(() => V60.mod('guide').sc.hood) > before, 'an oil check logged on your own counts');
    // tab intro, once
    await p.evaluate(() => __v60.go('engine'));
    ok(await p.locator('#p-engine .gintro').count() === 1, 'new tab shows a one-line intro');
    await p.click('#p-engine [data-gintro]');
    await p.evaluate(() => { __v60.go('today'); __v60.go('engine'); });
    ok(await p.locator('#p-engine .gintro').count() === 0, 'intro does not come back');
    // welcome back after a long gap
    await p.evaluate(() => { const d = V60.mod('guide'); d.last = '2026-01-01'; d.lvl.records = 2; V60.save(); });
    await p.reload(); await p.waitForTimeout(500); await p.evaluate(() => __v60.go('today'));
    ok(/Welcome back/.test(await p.textContent('#tdCards')), 'welcome-back recap after 45+ days');
    ok(await p.evaluate(() => V60.mod('guide').lvl.records) === 1, 'each area steps back one level');
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no sideways scroll');
    ok(errs.length === 0, 'no errors ' + JSON.stringify(errs));
    await ctx.close();
  }
  await b.close();
})();
