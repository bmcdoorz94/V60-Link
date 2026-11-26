/* The manual as a reference (2026-11-26): the home is the status board, every chapter and page is open from the start with no
   glow or "pick up here" markers, steps open in place (lesson, article, troubleshooter), the Go/back crumb, saved data
   survives a reload, and a photo as a view with pinned points. */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const path = require('path'); const ROOT = path.resolve(__dirname, '..');
function ok(c, m) { if (!c) { console.log('FAIL', m); process.exitCode = 1; } else console.log(' ok', m); }
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); await ctx.addInitScript(() => { window.__V60_TEST = true; window.__V60_NOSCAN = true; });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + ROOT + '/index.html'); await p.waitForTimeout(700);
  const st = id => p.evaluate(id => V60_MANUAL.status(id), id);
  ok(await p.evaluate(() => V60.state && document.querySelector('#p-car') && !document.querySelector('#p-car').hidden), 'the app opens on Home');
  ok(await p.evaluate(() => !!document.querySelector('#mnHome .hm') && /ON THE CAR NOW/.test(document.querySelector('#mnHome').textContent) && /COMING DUE/.test(document.querySelector('#mnHome').textContent)), 'Home is the status board: on the car now, coming due');
  const sts = await p.evaluate(() => Object.keys(V60_MANUAL.chapters).map(id => V60_MANUAL.status(id)));
  ok(sts.every(s => s === 'open' || s === 'closed'), 'every chapter is open from the start, none new or locked ' + JSON.stringify([...new Set(sts)]));
  ok(await p.evaluate(() => ['diy', 'kb', 'fuel', 'upgrades', 'bulletins', 'academy', 'lab', 'track'].every(t => V60_GATE.visible(t))), 'every old page is visible from the start');
  ok(await p.evaluate(() => document.querySelectorAll('#rail button').length === 5 && document.querySelectorAll('#rail button.locked').length === 0), 'the bar has five roots, none locked');
  /* Know your car: the figure and the five views */
  await p.evaluate(() => V60.jump('tab:know')); await p.waitForTimeout(150);
  ok(await p.evaluate(() => document.querySelectorAll('#mnKnow .mn-hs').length === 5 && !document.querySelector('#mnKnow .mn-hs.new, #mnKnow .mn-hs.locked, #mnKnow .mn-hs.resume')), 'Know your car shows the five views with no markers');
  /* chapter 0 is a part page; its first step opened in place with the lesson inside it */
  await p.evaluate(() => V60_MANUAL.go('ch', '0')); await p.waitForTimeout(100);
  ok(await st('0') === 'open', 'opening a chapter leaves no marker');
  ok(await p.evaluate(() => !document.querySelector('#p-item').hidden && !!document.querySelector('#mnItem #ch-0 details.mn-stepx[open] .mn-train .mission')), 'the chapter is a section on the part page and the lesson renders inside the open step');
  await p.evaluate(() => { const m = V60.CHAPTERS[0].missions.filter(x => x.id === 'm-sys')[0]; m.quiz.forEach((q, i) => { document.querySelector('#mnItem input[name="q' + i + '"][value="' + q.a + '"]').checked = true; }); });
  await p.click('#mnItem #ch-0 details.mn-stepx[open] #quizGo'); await p.waitForTimeout(250);
  ok(await p.evaluate(() => { const x = V60.acad().done['m-sys']; return !!(x && x.outcome === 'good') && !!document.querySelector('#mnItem #ch-0 details.mn-stepx.done'); }), 'finishing the lesson in place ticks the step');
  ok(await p.evaluate(() => document.querySelector('#p-academy').hidden), 'Training stayed on the part page');
  await p.evaluate(() => { const A = V60.acad(); ['m-sys', 'm-safe', 'm-hood', 'm-five'].forEach(m => { A.done[m] = { date: V60.todayStr(), outcome: 'good' }; }); V60.save(); V60_MANUAL.bust(); __v60.go('car'); });
  await p.waitForTimeout(200);
  ok(await st('0') === 'closed', 'doing every step closes the chapter');
  ok(await p.evaluate(() => !document.querySelector('#mnHome .mn-toast')), 'no announcement toast on the home');
  /* a step that leads to a workbench page keeps a Go button and the crumb leads back to the part */
  await p.evaluate(() => V60_MANUAL.go('ch', '3.1.2')); await p.waitForTimeout(150);
  ok(await p.evaluate(() => !!document.querySelector('#mnItem #ch-3\\.1\\.2 details.mn-stepx[open] [data-go="tab:my"]')), 'arriving at 3.1.2 opens its first undone step (the photo, with a Go button)');
  await p.click('#mnItem #ch-3\\.1\\.2 details.mn-stepx[open] [data-go="tab:my"]'); await p.waitForTimeout(150);
  ok(await p.evaluate(() => !document.querySelector('#p-my').hidden && !document.getElementById('crumb').hidden), 'Go opens My V60 with a way back');
  await p.click('#crumb [data-back]'); await p.waitForTimeout(100);
  ok(await p.evaluate(() => !document.querySelector('#p-item').hidden && /Driver display/.test(document.querySelector('#mnItem .mn-h1').textContent)), 'the crumb leads back to the part');
  /* the article is inside the Know step */
  await p.evaluate(() => V60_MANUAL.go('ch', '3.1.1')); await p.waitForTimeout(150);
  await p.click('#mnItem #ch-3\\.1\\.1 details.mn-stepx:nth-of-type(2) summary'); await p.waitForTimeout(150);
  ok(await p.evaluate(() => !!document.querySelector('#mnItem #ch-3\\.1\\.1 details.mn-stepx:nth-of-type(2)[open] .kbart h4')), 'opening an article step shows the article in place');
  /* the troubleshooter walks in place and marks the step on an outcome */
  await p.evaluate(() => V60_MANUAL.go('ch', '1.1.4')); await p.waitForTimeout(150);
  ok(await p.evaluate(() => !!document.querySelector('#mnItem #ch-1\\.1\\.4 details.mn-stepx:nth-of-type(1)[open] .mn-tree [data-tree]')), 'the troubleshooter opens in place');
  for (let i = 0; i < 4; i++) { const b = await p.$('#mnItem #ch-1\\.1\\.4 .mn-tree [data-tree$=":n"]'); if (!b) break; await b.click(); await p.waitForTimeout(120); }
  ok(await p.evaluate(() => !!V60.mod('manual').went['1.1.4:0'] && !!document.querySelector('#mnItem #ch-1\\.1\\.4 .mn-note')), 'reaching an outcome marks the troubleshooter step done');
  /* reload: what was done survives */
  await p.reload(); await p.waitForTimeout(700);
  ok(await st('0') === 'closed' && !!(await p.evaluate(() => V60.mod('manual').went['1.1.4:0'])), 'closures and done steps survive a reload');
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
