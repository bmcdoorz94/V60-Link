/* The path: one strict line through every chapter, the G1 study and the quizzes (Kyle, 2026-10-15).
   Checks the data (every chapter and G1 task once, quizzes after what they test), that only the current step is open,
   the home's one Next card, setting a step aside, a study step, the path page, and that a case cannot jump ahead. */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const path = require('path'), fs = require('fs'); const ROOT = path.resolve(__dirname, '..'); const SH = path.join(ROOT, 'tests', 'shots') + '/'; fs.mkdirSync(SH, { recursive: true });
function ok(c, m) { if (!c) { console.log('FAIL', m); process.exitCode = 1; } else console.log(' ok', m); }
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); await ctx.addInitScript(() => { window.__V60_TEST = true; window.__V60_NOSCAN = true; });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + ROOT + '/index.html'); await p.waitForTimeout(700);

  /* the data */
  const shape = await p.evaluate(() => {
    const S = V60_PATH.stages, chs = Object.keys(V60_MANUAL.chapters), seenC = {}, seenT = {}, pos = {};
    S.forEach(s => { if (s.kind === 'ch') { seenC[s.ch] = (seenC[s.ch] || 0) + 1; pos['ch' + s.ch] = s.n; } if (s.kind === 'g1') s.tasks.forEach(t => { seenT[t] = (seenT[t] || 0) + 1; pos['t' + t] = s.n; }); if (s.kind === 'quiz') pos['q' + s.area + s.rung] = s.n; });
    const badC = chs.filter(c => seenC[c] !== 1), badT = V60_G1_TASKS.map(t => t.id).filter(t => seenT[t] !== 1), order = [];
    V60_TRACK_DATA.areas.forEach(a => {
      const q1 = pos['q' + a.id + 1], q2 = pos['q' + a.id + 2];
      if (!q1 || !q2 || q2 < q1) order.push(a.id + ' quizzes');
      a.items.forEach(id => V60_MANUAL.data.items.filter(it => it.id === id)[0].chapters.forEach(c => { if (!a.noCar && (c.tier === 'K' || c.tier === 'C') && pos['ch' + c.id] > q1) order.push(c.id + ' after ' + a.id + ' Owner'); if (pos['ch' + c.id] > q2) order.push(c.id + ' after ' + a.id + ' Technician'); }));
      V60_G1_TASKS.filter(t => t.area === a.id).forEach(t => { if (pos['t' + t.id] > q1) order.push(t.id + ' after its quiz'); });
    });
    return { n: S.length, units: V60_PATH.units.length, badC, badT, order, last: S[S.length - 1].kind, first: S[0].key };
  });
  ok(shape.badC.length === 0, 'every chapter is on the path exactly once ' + JSON.stringify(shape.badC));
  ok(shape.badT.length === 0, 'every G1 task is studied exactly once ' + JSON.stringify(shape.badT));
  ok(shape.order.length === 0, 'each quiz comes after the hands-on chapters and the tasks it tests ' + JSON.stringify(shape.order));
  ok(shape.first === 'ch:0' && shape.last === 'mock', 'safety first, the mock G1 last (' + shape.n + ' steps in ' + shape.units + ' units)');

  /* strict: only the first step is open */
  ok(await p.evaluate(() => Object.keys(V60_MANUAL.chapters).filter(id => V60_MANUAL.open(id)).join() === '0'), 'at the start only chapter 0 is open');
  ok(await p.evaluate(() => !V60_PATH.taskReached('D1') && !V60_PATH.reached('quiz:sus:1') && !V60_PATH.reached('mock')), 'G1 tasks, quizzes and the mock are locked until the path reaches them');

  /* the home: one Next card with a progress bar, then the car, the Index and the red list; nothing else */
  const home = await p.evaluate(() => { const h = document.getElementById('mnHome'); return { cards: h.querySelectorAll('.mn-next').length, ctas: h.querySelectorAll('.mn-cta').length, strip: !!h.querySelector('.tk-strip'), now: [...h.querySelectorAll('.mn-kick span')].some(s => s.textContent === 'NOW'), bar: !!h.querySelector('.mn-next .mn-pbar'), title: h.querySelector('.mn-next h3').textContent, first: h.firstElementChild.className, sos: !!h.querySelector('.mn-sos'), ix: !!h.querySelector('[data-jump="tab:index"]') }; });
  ok(home.cards === 1 && home.ctas === 1 && home.bar && !home.strip && !home.now, 'the home has one Next card with one button and a progress bar ' + JSON.stringify(home));
  ok(/mn-next/.test(home.first) && /Before you touch anything/.test(home.title), 'the Next card comes first and names step 1');
  ok(home.sos && home.ix, 'the red list and the Index stay on the home');
  await p.screenshot({ path: SH + 'path-home-iphone.png', fullPage: true });
  /* a locked view says when it opens */
  await p.click('#mnHome .mn-hs[data-hs="under"]'); await p.waitForTimeout(100);
  ok(/Underside is not open yet\. Step \d+ of your path/.test(await p.textContent('#mnHome')), 'tapping a locked view says which step opens it');
  await p.click('#mnHome .mn-next .mn-cta'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => !document.querySelector('#p-item').hidden && !!document.querySelector('#mnItem #ch-0')), 'Start opens the step: chapter 0 on its page');

  /* finishing a step moves the path on by one */
  await p.evaluate(() => { const A = V60.acad(); ['m-sys', 'm-safe', 'm-hood', 'm-five'].forEach(m => { A.done[m] = { date: V60.todayStr(), outcome: 'good' }; }); V60.save(); V60_MANUAL.bust(); __v60.go('car'); });
  await p.waitForTimeout(200);
  ok(await p.evaluate(() => V60_PATH.current().key === 'ch:3.1.1' && V60_PATH.done() === 1), 'chapter 0 done: the path is on step 2, 3.1.1');
  ok(/STEP 2 OF/.test(await p.textContent('#mnHome .mn-next')), 'the Next card follows');

  /* setting a step aside: only steps marked for it (a shop, a purchase, a dealer) offer it */
  ok(!(await p.$('#mnHome .mn-park')), 'an ordinary step cannot be set aside');
  await p.evaluate(() => { V60_PATH.current().park = 'A test reason.'; __v60.go('car'); });
  await p.click('#mnHome .mn-park summary'); await p.click('#mnHome [data-park]'); await p.waitForTimeout(150);
  ok(await p.evaluate(() => V60_PATH.current().key === 'ch:3.1.2' && V60_PATH.state('ch:3.1.1') === 'parked' && V60_MANUAL.settled('3.1.1') && !V60_MANUAL.closed('3.1.1')), 'a step set aside: the path moves on, the step counts as settled, not closed');
  ok(/Set aside: Step 2/.test(await p.textContent('#mnHome .mn-next')), 'the Next card lists what was set aside');
  await p.evaluate(() => { const A = V60.acad(); A.done['m-warn'] = { date: V60.todayStr(), outcome: 'good' }; V60_KNOW.discover('a', 'a-lights'); V60.save(); V60_MANUAL.bust(); __v60.go('car'); });
  ok(await p.evaluate(() => V60_PATH.state('ch:3.1.1') === 'done' && !/Set aside/.test(document.querySelector('#mnHome .mn-next').textContent)), 'a set-aside step closes by itself once its evidence comes in');

  /* the whole path page: done units folded, the current unit open, later units locked */
  await p.evaluate(() => __v60.go('path')); await p.waitForTimeout(150);
  const pg = await p.evaluate(() => ({ units: document.querySelectorAll('#mnPath .mn-unitx').length, open: [...document.querySelectorAll('#mnPath .mn-unitx[open] .t')].map(x => x.textContent), locked: document.querySelectorAll('#mnPath .mn-unitx.locked').length, now: !!document.querySelector('#mnPath .mn-ix.resume') }));
  ok(pg.units === shape.units && pg.open.length === 1 && /What the car is telling you/.test(pg.open[0]) && pg.locked === shape.units - 2 && pg.now, 'the path page: every unit, the current one open, later ones locked ' + JSON.stringify(pg));
  await p.screenshot({ path: SH + 'path-page-iphone.png', fullPage: true });

  /* a case cannot jump ahead of the path: its step shows the path step instead of Go */
  await p.evaluate(() => { __v60.go('story'); }); await p.waitForTimeout(100);
  const nc = await p.evaluate(() => { return [...document.querySelectorAll('#stV-cases .nextc')].map(e => e.textContent).join(' | '); }); ok(/your path, step 3/i.test(nc), 'the case board points at the path\'s current step: ' + nc);
  await p.evaluate(() => V60.jump('case:signal')); await p.waitForTimeout(150);
  ok(await p.evaluate(() => /PATH STEP \d+/.test(document.querySelector('#stV-cases').textContent)), 'a case step past the current one shows its path step, not a Go button');

  /* a study step: the tasks of one range, each opened in place, then Next step */
  await p.evaluate(() => { const st = V60.mod('story'); st.all = true; V60.setMod('story', st); V60.save(); V60_MANUAL.bust(); V60.jump('study:G1-G7'); }); await p.waitForTimeout(200);
  ok(await p.evaluate(() => !document.querySelector('#p-track').hidden && document.querySelectorAll('#tkBody details.tk-task').length === 7), 'a study step lists its seven tasks');
  for (const d of await p.$$('#tkBody details.tk-task summary')) { await d.click(); await p.waitForTimeout(40); }
  await p.waitForTimeout(150);
  ok(await p.evaluate(() => ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7'].every(id => !!V60.mod('track').read[id]) && !!document.querySelector('#tkBody [data-jump="path:next"]')), 'opening every task studies it and offers the next step');
  await p.evaluate(() => { const st = V60.mod('story'); st.all = false; V60.setMod('story', st); V60.save(); V60_MANUAL.bust(); V60.jump('study:D1-D13'); }); await p.waitForTimeout(150);
  ok(await p.evaluate(() => document.querySelectorAll('#tkBody .tk-task.locked').length === 13), 'a study step the path has not reached shows its tasks locked');
  ok(await p.evaluate(() => V60_PATH.current().key === 'ch:3.1.2'), 'studying ahead (with Show everything) does not move the path past an open chapter');

  ok(errs.length === 0, 'no errors ' + JSON.stringify(errs));
  await b.close();
})();
