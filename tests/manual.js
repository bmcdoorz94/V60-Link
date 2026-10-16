/* The workshop manual: chapters opening in path order, the two markers (glow until opened, dot where you left off), the gate that
   opens old pages only once a chapter needs them, the Go/back crumb, and a photo as a view with pinned points. */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const path = require('path'); const ROOT = path.resolve(__dirname, '..');
function ok(c, m) { if (!c) { console.log('FAIL', m); process.exitCode = 1; } else console.log(' ok', m); }
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); await ctx.addInitScript(() => { window.__V60_TEST = true; window.__V60_NOSCAN = true; });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + ROOT + '/index.html'); await p.waitForTimeout(700);
  const st = id => p.evaluate(id => V60_MANUAL.status(id), id);
  ok(await p.evaluate(() => V60.state && document.querySelector('#p-car') && !document.querySelector('#p-car').hidden), 'home is The car');
  ok(await st('0') === 'new' && await st('1.1.1') === 'locked' && await st('2.1.1') === 'locked', 'start: chapter 0 new, everything else locked ' + [await st('0'), await st('1.1.1')]);
  ok(await p.evaluate(() => document.querySelectorAll('#rail button').length === 3 && document.querySelectorAll('#rail button.locked').length === 0), 'the bar has three roots, Glovebox and Link always open');
  ok(await p.evaluate(() => !V60_GATE.visible('diy') && !V60_GATE.visible('kb')), 'old pages are not visible before a chapter needs them');
  /* open chapter 0: glow stops, it becomes the resume point */
  await p.evaluate(() => V60_MANUAL.go('ch', '0')); await p.waitForTimeout(100);
  ok(await st('0') === 'resume', 'opening chapter 0 ends its glow and marks it as where you left off');
  ok(await p.evaluate(() => V60_GATE.visible('academy')), 'Training is reachable because chapter 0 needs it');
  /* chapter 0 is a part page; its first step opened in place with the lesson inside it */
  ok(await p.evaluate(() => !document.querySelector('#p-item').hidden && !!document.querySelector('#mnItem #ch-0 details.mn-stepx[open] .mn-train .mission')), 'the chapter is a section on the part page and the lesson renders inside the open step');
  await p.evaluate(() => { const m = V60.CHAPTERS[0].missions.filter(x => x.id === 'm-sys')[0]; m.quiz.forEach((q, i) => { document.querySelector('#mnItem input[name="q' + i + '"][value="' + q.a + '"]').checked = true; }); });
  await p.click('#mnItem #ch-0 details.mn-stepx[open] #quizGo'); await p.waitForTimeout(250);
  ok(await p.evaluate(() => { const x = V60.acad().done['m-sys']; return !!(x && x.outcome === 'good') && !!document.querySelector('#mnItem #ch-0 details.mn-stepx.done'); }), 'finishing the lesson in place ticks the step');
  ok(await p.evaluate(() => document.querySelector('#p-academy').hidden), 'Training stayed on the part page');
  /* finish the preface: the evidence is the four Training missions */
  await p.evaluate(() => { const A = V60.acad(); ['m-sys', 'm-safe', 'm-hood', 'm-five'].forEach(m => { A.done[m] = { date: V60.todayStr(), outcome: 'good' }; }); V60.save(); V60_MANUAL.bust(); __v60.go('car'); });
  await p.waitForTimeout(200);
  ok(await st('0') === 'closed' && await st('3.1.1') === 'new' && await st('3.1.2') === 'locked' && await st('1.1.1') === 'locked', 'closing 0 opens step 2 of the path (3.1.1) and nothing else ' + [await st('0'), await st('3.1.1'), await st('3.1.2'), await st('1.1.1')]);
  ok(await p.evaluate(() => /0 Before you touch anything closed/.test(document.querySelector('#mnHome .mn-toast') ? document.querySelector('#mnHome .mn-toast').textContent : '') && /Next on your path: step 2/.test(document.querySelector('#mnHome .mn-toast').textContent)), 'home announces the closure and the next step');
  ok(await p.evaluate(() => document.querySelector('#mnHome .mn-hs[data-hs="cabin"]').classList.contains('new') && document.querySelector('#mnHome .mn-hs[data-hs="bay"]').classList.contains('closed') === false), 'the cabin point glows');
  ok(await p.evaluate(() => V60_GATE.visible('kb')), 'the Library opened with 3.1.1');
  /* a story case no longer opens anything early: the path decides */
  ok(await st('3.3.1') === 'locked', 'The Signal does not open 3.3.1 early ' + await st('3.3.1'));
  /* finish 3.1.1 (the warning-lights lesson and article): 3.1.2 opens, 3.2.1 stays locked */
  await p.evaluate(() => { const A = V60.acad(); A.done['m-warn'] = { date: V60.todayStr(), outcome: 'good' }; V60_KNOW.discover('a', 'a-lights'); V60.save(); V60_MANUAL.bust(); });
  ok(await st('3.1.1') === 'closed' && await st('3.1.2') === 'new' && await st('3.2.1') === 'locked', '3.1.1 closed, only 3.1.2 opened ' + [await st('3.1.1'), await st('3.1.2'), await st('3.2.1')]);
  /* a step that leads to a workbench page keeps a Go button and the crumb leads back to the part */
  await p.evaluate(() => V60_MANUAL.go('ch', '3.1.2')); await p.waitForTimeout(150);
  ok(await p.evaluate(() => V60_MANUAL.resume() && V60_MANUAL.resume().id === '3.1.2'), 'the last chapter opened is where you pick up');
  ok(await p.evaluate(() => !!document.querySelector('#mnItem #ch-3\\.1\\.2 details.mn-stepx[open] [data-go="tab:my"]')), 'arriving at 3.1.2 opens its first undone step (the photo, with a Go button)');
  await p.click('#mnItem #ch-3\\.1\\.2 details.mn-stepx[open] [data-go="tab:my"]'); await p.waitForTimeout(150);
  ok(await p.evaluate(() => !document.querySelector('#p-my').hidden && !document.getElementById('crumb').hidden), 'Go opens My V60 with a way back');
  await p.click('#crumb [data-back]'); await p.waitForTimeout(100);
  ok(await p.evaluate(() => !document.querySelector('#p-item').hidden && /Driver display/.test(document.querySelector('#mnItem .mn-h1').textContent)), 'the crumb leads back to the part');
  /* the article is inside the Know step (3.1.1 is closed, its steps still open) */
  await p.evaluate(() => V60_MANUAL.go('ch', '3.1.1')); await p.waitForTimeout(150);
  await p.click('#mnItem #ch-3\\.1\\.1 details.mn-stepx:nth-of-type(2) summary'); await p.waitForTimeout(150);
  ok(await p.evaluate(() => !!document.querySelector('#mnItem #ch-3\\.1\\.1 details.mn-stepx:nth-of-type(2)[open] .kbart h4')), 'opening an article step shows the article in place');
  /* the troubleshooter walks in place and marks the step on an outcome (Show everything opens 1.1.4 for this) */
  await p.evaluate(() => { const st = V60.mod('story'); st.all = true; V60.setMod('story', st); V60.save(); V60_MANUAL.bust(); V60_MANUAL.go('ch', '1.1.4'); }); await p.waitForTimeout(150);
  ok(await p.evaluate(() => !!document.querySelector('#mnItem #ch-1\\.1\\.4 details.mn-stepx:nth-of-type(1)[open] .mn-tree [data-tree]')), 'the troubleshooter opens in place');
  for (let i = 0; i < 4; i++) { const b = await p.$('#mnItem #ch-1\\.1\\.4 .mn-tree [data-tree$=":n"]'); if (!b) break; await b.click(); await p.waitForTimeout(120); }
  ok(await p.evaluate(() => !!V60.mod('manual').went['1.1.4:0'] && !!document.querySelector('#mnItem #ch-1\\.1\\.4 .mn-note')), 'reaching an outcome marks the troubleshooter step done');
  await p.evaluate(() => { const st = V60.mod('story'); st.all = false; V60.setMod('story', st); V60.save(); V60_MANUAL.bust(); V60_MANUAL.go('ch', '3.1.2'); }); await p.waitForTimeout(150);
  await p.evaluate(() => __v60.go('car')); await p.waitForTimeout(100);
  ok(await p.evaluate(() => document.querySelector('#mnHome .mn-hs[data-hs="cabin"]').classList.contains('resume')), 'the cabin carries the where-you-left-off marker');
  /* reload: everything survives */
  await p.reload(); await p.waitForTimeout(700);
  ok(await st('3.1.1') === 'closed' && await st('3.1.2') === 'resume', 'markers and closures survive a reload ' + [await st('3.1.1'), await st('3.1.2')]);
  /* a photo as the view, with pins seeded from the drawing and movable */
  await p.evaluate(() => { V60.state.photos = (V60.state.photos || []).concat([{ id: 'ph1', asset: 'x', url: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', local: false, date: V60.todayStr(), kind: 'bay', part: null, note: '', ai: null }]); V60.save(); V60_MANUAL.go('view', 'bay'); });
  await p.waitForTimeout(100); await p.click('#mnView [data-fm="photo"]'); await p.waitForTimeout(100);
  ok(await p.isVisible('#mnView [data-usephoto="ph1"]'), 'the bay offers the saved engine-bay photo');
  await p.click('#mnView [data-usephoto="ph1"]'); await p.waitForTimeout(150);
  const pins = await p.evaluate(() => { const v = V60.mod('manual').views.bay; return v && Object.keys(v.pins).length; });
  ok(pins === 9 && await p.evaluate(() => !!document.querySelector('#mnView .mn-fig.photo img')), 'the photo is the figure and every item got a starting point ' + pins);
  const box = await p.$('#mnView .mn-fig'); const bb = await box.boundingBox(); const pin = await p.$('#mnView .mn-hs[data-hs="oil"]'); const pb = await pin.boundingBox();
  await p.mouse.move(pb.x + pb.width / 2, pb.y + pb.height / 2); await p.mouse.down(); await p.mouse.move(bb.x + bb.width * 0.8, bb.y + bb.height * 0.8, { steps: 5 }); await p.mouse.up(); await p.waitForTimeout(100);
  const moved = await p.evaluate(() => V60.mod('manual').views.bay.pins.oil);
  ok(moved && moved[0] > 0.7 && moved[1] > 0.7, 'dragging a point saves its new place ' + JSON.stringify(moved));
  await p.click('#mnView [data-arrange]'); await p.waitForTimeout(50); await p.click('#mnView .mn-hs[data-hs="coolant"]'); await p.waitForTimeout(100);
  ok(await p.evaluate(() => /Coolant/.test(document.querySelector('#mnView .mn-sheet h3').textContent)), 'after moving, tapping a point selects it again');
  ok(errs.length === 0, 'no errors ' + JSON.stringify(errs));
  await b.close();
})();
