/* The workshop manual: the unlock chain, the two markers (glow until opened, dot where you left off), the gate that
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
  ok(await p.evaluate(() => document.querySelectorAll('#rail button.locked').length) === 2, 'Glovebox and Link are drawn locked in the bar');
  ok(await p.evaluate(() => !V60_GATE.visible('diy') && !V60_GATE.visible('kb')), 'old pages are not visible before a chapter needs them');
  /* open chapter 0: glow stops, it becomes the resume point */
  await p.evaluate(() => V60_MANUAL.go('ch', '0')); await p.waitForTimeout(100);
  ok(await st('0') === 'resume', 'opening chapter 0 ends its glow and marks it as where you left off');
  ok(await p.evaluate(() => V60_GATE.visible('academy')), 'Training is reachable because chapter 0 needs it');
  /* Go, then back through the crumb */
  await p.click('#mnChapter [data-go="mission:m-sys"]'); await p.waitForTimeout(150);
  ok(await p.evaluate(() => !document.querySelector('#p-academy').hidden && !document.getElementById('crumb').hidden), 'Go opens Training with a way back');
  await p.click('#crumb [data-back]'); await p.waitForTimeout(100);
  ok(await p.evaluate(() => !document.querySelector('#p-chapter').hidden), 'the crumb leads back to the chapter');
  /* finish the preface: the evidence is the four Training missions */
  await p.evaluate(() => { const A = V60.acad(); ['m-sys', 'm-safe', 'm-hood', 'm-five'].forEach(m => { A.done[m] = { date: V60.todayStr(), outcome: 'good' }; }); V60.save(); V60_MANUAL.bust(); __v60.go('car'); });
  await p.waitForTimeout(200);
  ok(await st('0') === 'closed' && await st('1.1.1') === 'new' && await st('1.2.1') === 'new' && await st('1.3.1') === 'locked', 'closing 0 opens 1.1.1 and 1.2.1 only ' + [await st('0'), await st('1.1.1'), await st('1.2.1'), await st('1.3.1')]);
  ok(await p.evaluate(() => /0 Before you touch anything closed/.test(document.querySelector('#mnHome .mn-toast') ? document.querySelector('#mnHome .mn-toast').textContent : '')), 'home announces the closure and what it unlocked');
  ok(await p.evaluate(() => document.querySelector('#mnHome .mn-hs[data-hs="bay"]').classList.contains('new')), 'the hood point glows');
  ok(await p.evaluate(() => V60_GATE.visible('kb') && V60_GATE.visible('engine')), 'the Library and the engine bay map opened with 1.1.1 and 1.2.1');
  /* a story case opens an item early: The Signal is available from the start of Act 1 once Safe to Touch has started */
  ok(await st('3.3.1') === 'new', 'The Signal opened 3.3.1 early ' + await st('3.3.1'));
  /* read the oil article, find the cap on the map: 1.1.1 closes, 1.1.2 and 1.3.1 open */
  await p.evaluate(() => { V60_KNOW.discover('a', 'a-oil'); const d = V60.mod('manual'); d.went['1.1.1:1'] = 1; V60.save(); V60_MANUAL.bust(); });
  ok(await st('1.1.1') === 'closed' && await st('1.1.2') === 'new' && await st('1.3.1') === 'new', '1.1.1 closed, 1.1.2 and the battery opened ' + [await st('1.1.1'), await st('1.1.2'), await st('1.3.1')]);
  await p.evaluate(() => V60_MANUAL.go('ch', '1.1.2')); await p.waitForTimeout(100);
  ok(await p.evaluate(() => V60_MANUAL.resume() && V60_MANUAL.resume().id === '1.1.2'), 'the last chapter opened is where you pick up');
  await p.evaluate(() => __v60.go('car')); await p.waitForTimeout(100);
  ok(await p.evaluate(() => document.querySelector('#mnHome .mn-hs[data-hs="bay"]').classList.contains('resume') || document.querySelector('#mnHome .mn-hs[data-hs="bay"]').classList.contains('new')), 'the hood carries a marker');
  /* reload: everything survives */
  await p.reload(); await p.waitForTimeout(700);
  ok(await st('1.1.1') === 'closed' && await st('1.1.2') === 'resume', 'markers and closures survive a reload ' + [await st('1.1.1'), await st('1.1.2')]);
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
