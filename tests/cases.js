/* Problem cases (2026-11-27): Kyle describes a mechanical problem or sends a photo from Fix > Problem cases; it is posted
   to his PC (https://<pc>/drives/case), and Claude's case files come back in the PC's summary.json. The PC is mocked.
   Checks: the case file shows (safety, causes, next check, evidence, sources) and an unsafe case reaches Home; the report
   form posts what was picked; a photo is posted as a JPEG; nothing breaks without a PC; no sideways scroll on a phone. */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const path = require('path'); const ROOT = path.resolve(__dirname, '..');
function ok(c, m) { if (!c) { console.log('FAIL', m); process.exitCode = 1; } else console.log(' ok', m); }
const now = new Date().toISOString();
const CASE = { id: 'c-20261127-clunk', title: 'Clunk over bumps, front left', status: 'open', opened: now, updated: now, area: 'suspension', safety: 'caution',
  summary: 'A single clunk over small bumps at low speed, front left. Typical of a worn sway bar end link or strut top mount.',
  causes: [{ cause: 'Front sway bar end link', likelihood: 'likely', why: 'Clunk over small bumps at low speed, gone when turning.' }, { cause: 'Strut top mount', likelihood: 'possible', why: 'Would also clunk when turning the wheel parked.' }],
  next: { check: 'Turn the steering lock to lock while parked and listen.', how: 'A clunk then points to the top mount; none points to the end link.' },
  evidence: [{ at: now, kind: 'report', text: 'Clunk over bumps, 10-25 mph, front left' }], sources: [['NHTSA complaints, 2016 V60', 'https://api.nhtsa.gov/complaints/complaintsByVehicle?make=volvo&model=v60&modelYear=2016']] };
// a 2x2 red PNG
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFklEQVR4nGP8z8DAwMDAxMDAwMDAAAANHQEDK+mmyAAAAABJRU5ErkJggg==', 'base64');

(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  /* no PC address: the page says so, the buttons are off, no errors */
  {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); await ctx.addInitScript(() => { window.__V60_TEST = true; });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + ROOT + '/index.html'); await p.waitForTimeout(500);
    await p.evaluate(() => V60.jump('tab:cases')); await p.waitForTimeout(150);
    ok(/not set up on this device/.test(await p.textContent('#csPc')) && await p.evaluate(() => document.getElementById('csSend').disabled), 'no PC: says why, and Send is off');
    ok(errs.length === 0, 'no errors without a PC ' + JSON.stringify(errs));
    await ctx.close();
  }
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(() => { window.__V60_TEST = true; window.__V60_NOSCAN = true; window.V60_NATIVE = Object.assign(window.V60_NATIVE || {}, { pc: 'pc.test' }); });
  const posts = [];
  await ctx.route('https://pc.test/drives/summary.json', (r) => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ updated: now, drives: [], totals: {}, links: {}, cases: [CASE, { title: 'Bad', status: 'weird', causes: 'x', sources: [['x', 'javascript:alert(1)']] }] }) }));
  await ctx.route('https://pc.test/drives/case', (r) => { posts.push(JSON.parse(r.request().postData())); r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"id":"x"}' }); });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + ROOT + '/index.html'); await p.waitForTimeout(700);
  await p.evaluate(() => V60.jump('tab:cases')); await p.waitForTimeout(200);
  const t = await p.textContent('#csCases');
  ok(/Clunk over bumps, front left/.test(t) && /Caution/.test(t) && /Open/.test(t), 'the case shows with its status and safety');
  ok(/Front sway bar end link/.test(t) && /likely/.test(t) && /Next check:/.test(t) && /lock to lock/.test(t), 'causes ranked, and the next check');
  ok(await p.evaluate(() => !!document.querySelector('#csCases a[href^="https://api.nhtsa.gov"]') && !document.querySelector('#csCases a[href^="javascript"]')), 'sources linked; an unsafe link is dropped');
  ok(/Bad/.test(t) && !/Dec 31|1970/.test(t), 'a malformed case still shows its title, with its bad fields dropped and no made-up date');
  await p.evaluate(() => V60.jump('tab:car')); await p.waitForTimeout(150);
  ok(/Problem case: Clunk over bumps, front left/.test(await p.textContent('#mnHome')), 'a case marked caution is listed on Home');
  await p.evaluate(() => V60.jump('tab:trouble')); await p.waitForTimeout(150);
  ok(await p.evaluate(() => !!document.querySelector('#p-trouble [data-jump="tab:cases"]')), 'Fix links to Problem cases');

  /* the report form */
  await p.evaluate(() => V60.jump('tab:cases')); await p.waitForTimeout(150);
  await p.selectOption('#csWhat', 'Clunk over bumps');
  await p.click('#csWhen button[data-csv="Over bumps"]'); await p.click('#csWhen button[data-csv="Turning left"]'); await p.click('#csWhere button[data-csv="Front"]'); await p.click('#csWhere button[data-csv="Left"]');
  await p.fill('#csSpeed', '10-25'); await p.fill('#csText', 'Clunk from the front left over small bumps.');
  await p.click('#csSend'); await p.waitForTimeout(400);
  const s = posts.find((x) => x.kind === 'symptom');
  ok(s && s.what === 'Clunk over bumps' && [...s.when].sort().join() === 'Over bumps,Turning left' && s.where === 'Front, Left' && s.speed === '10-25' && /small bumps/.test(s.text), 'the report posts what was picked: ' + JSON.stringify(s));
  ok(/Sent/.test(await p.textContent('#csMsg')), 'says it was sent');

  /* a photo */
  await p.selectOption('#csPhotoWhat', 'Tire tread and edges'); await p.fill('#csPhotoNote', 'front left');
  await p.setInputFiles('#csPhotoIn', { name: 'tire.png', mimeType: 'image/png', buffer: PNG }); await p.waitForTimeout(800);
  const ph = posts.find((x) => x.kind === 'photo');
  ok(ph && ph.what === 'Tire tread and edges' && ph.note === 'front left' && /^data:image\/jpeg;base64,/.test(ph.image), 'the photo posts as a JPEG with what it shows');
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= 390), 'no sideways scroll');
  await p.screenshot({ path: path.join(ROOT, 'tests', 'shots', 'cases.png'), fullPage: true });
  ok(errs.length === 0, 'no errors ' + JSON.stringify(errs));
  await b.close();
})();
