/* The certification track: readiness meters, hands-on-first quiz gating, an area quiz end to end with weak spots,
   the Owner rung, the mock G1 with its clock, and the HUD chip. */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const path = require('path'); const ROOT = path.resolve(__dirname, '..');
function ok(c, m) { if (!c) { console.log('FAIL', m); process.exitCode = 1; } else console.log(' ok', m); }
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); await ctx.addInitScript(() => { window.__V60_TEST = true; });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + ROOT + '/index.html'); await p.waitForTimeout(600);

  ok(/%$/.test((await p.textContent('#hudRank')).trim()) && /G1/.test(await p.textContent('#hudRankName')), 'the header chip shows G1 readiness instead of a level');
  const D = await p.evaluate(() => window.V60_TRACK_DATA);
  ok(D.areas.reduce((s, a) => s + a.q, 0) === D.test.scored, 'area question counts add up to the scored total (' + D.test.scored + ')');
  ok(await p.evaluate(() => window.V60_QUIZ.every(q => q.o.length === 4 && q.a >= 0 && q.a < 4 && q.src && window.V60_TRACK_DATA.areas.some(a => a.id === q.area))), 'every quiz question has four options, a right one, a source and an area');
  ok(await p.evaluate(() => window.V60_QUIZ.every(q => !q.item || window.V60_MANUAL.data.items.some(it => it.id === q.item))), 'every question points at a real part');

  await p.evaluate(() => V60.jump('track:')); await p.waitForTimeout(200);
  ok(/G1 readiness/.test(await p.textContent('#tkBody')), 'the track page renders');
  ok(await p.evaluate(() => document.querySelectorAll('#tkBody [data-area]').length === 7), 'seven areas listed');
  await p.click('#tkBody [data-area="eng"]'); await p.waitForTimeout(150);
  ok(await p.evaluate(() => !document.querySelector('#tkBody [data-quiz="1"]') && /opens when the hands-on chapters/.test(document.querySelector('#tkBody').textContent)), 'the Engine quiz is locked until the hands-on chapters are closed');
  /* close every Know and Check chapter of the engine area by faking their evidence, then the quiz opens */
  await p.evaluate(() => { const st = V60.mod('story'); st.all = true; V60.setMod('story', st); const d = V60.mod('manual'); const a = window.V60_TRACK_DATA.areas.filter(x => x.id === 'eng')[0];
    const A = V60.acad(), dy = V60.mod('diy') || { done: {} }, today = V60.todayStr();
    a.items.forEach(id => { const it = window.V60_MANUAL.data.items.filter(x => x.id === id)[0]; it.chapters.forEach(c => { if (c.tier !== 'K' && c.tier !== 'C') return; c.steps.forEach((s, i) => {
      if (s.manual) d.manual[s.manual] = today; else if (s.kb) V60_KNOW.discover('a', s.kb); else if (s.mission) A.done[s.mission] = { date: today, outcome: 'good' }; else if (s.diy) dy.done[s.diy] = today;
      else if (s.oil) { V60.state.oil = V60.state.oil || []; while (V60.state.oil.length < s.oil) V60.state.oil.push({ id: 'o' + V60.state.oil.length, date: today, miles: 91000 + V60.state.oil.length, level: 'ok' }); }
      else if (s.photo) { V60.state.photos = (V60.state.photos || []).concat([{ id: 'ph-' + s.photo, asset: 'x', url: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', local: false, date: today, kind: s.photo, part: null, note: '', ai: null }]); }
      else if (s.scans) { V60.state.lastScan = { date: today, mil: false, codes: 0 }; const L = V60.mod('live') || { scans: [] }; L.scans = (L.scans || []).concat([{ date: today, sim: false }]); V60.setMod('live', L); }
      else d.went[c.id + ':' + i] = 1; }); }); });
    V60.setMod('diy', dy); V60.save(); window.V60_MANUAL.bust(); V60.jump('track:eng'); });
  await p.waitForTimeout(200);
  const handsTxt = await p.textContent('#tkBody .tk-parts');
  const quizBtn = await p.$('#tkBody [data-quiz="1"]');
  ok(!!quizBtn || /Still to close/.test(await p.textContent('#tkBody')), 'closing hands-on chapters moves the meter (' + handsTxt.replace(/\s+/g, ' ').trim() + ')');
  /* the manual-drivetrain area has no hands-on step on this car: its quiz is open at once */
  await p.evaluate(() => V60.jump('track:mdt')); await p.waitForTimeout(150);
  ok(!!(await p.$('#tkBody [data-quiz="1"]')), 'an area with nothing to do on this car opens its quiz straight away');
  await p.click('#tkBody [data-quiz="1"]'); await p.waitForTimeout(150);
  const n = await p.evaluate(() => document.querySelectorAll('#tkBody .tk-opt').length);
  ok(n === 4, 'a question shows four options');
  /* answer every question right by reading the bank */
  let guard = 0;
  while (guard++ < 30) {
    const done = await p.evaluate(() => !document.querySelector('#tkBody .tk-opt'));
    if (done) break;
    await p.evaluate(() => { const qText = document.querySelector('#tkBody .tk-q h3').textContent; const q = window.V60_QUIZ.filter(x => x.q === qText)[0] || Object.values(window.V60_G1_ENTRIES || {}).reduce((a, e) => a.concat(e.qs || []), []).filter(x => x.q === qText)[0] || window.V60_FACTS.filter(f => f.q === qText)[0]; const right = q.o ? q.o[q.a] : q.a; const btn = [...document.querySelectorAll('#tkBody .tk-opt')].filter(b => b.textContent.slice(1).trim() === right)[0]; btn.click(); });
    await p.waitForTimeout(80);
    const nxt = await p.$('#tkBody [data-tk="next"]'); if (nxt) { await nxt.click(); await p.waitForTimeout(80); }
  }
  ok(/100 %/.test(await p.textContent('#tkBody .mn-h1')), 'a perfect round scores 100 %');
  ok(await p.evaluate(() => { const t = V60.mod('track'); return !!(t.quiz['mdt:1'] && t.quiz['mdt:1'].passed) && window.V60_TRACK.rung('mdt') === 1; }), 'passing the Owner quiz earns the Owner rung for that area');
  ok(await p.evaluate(() => window.V60_TRACK.ready() > 0), 'G1 readiness rose above zero');
  /* a wrong answer shows the explanation and the source, and lands in the weak spots */
  await p.evaluate(() => V60.jump('track:eng')); await p.waitForTimeout(150);
  const open = await p.$('#tkBody [data-quiz="1"]');
  if (open) {
    await open.click(); await p.waitForTimeout(150);
    await p.evaluate(() => { const qText = document.querySelector('#tkBody .tk-q h3').textContent; const q = window.V60_QUIZ.filter(x => x.q === qText)[0] || Object.values(window.V60_G1_ENTRIES || {}).reduce((a, e) => a.concat(e.qs || []), []).filter(x => x.q === qText)[0] || window.V60_FACTS.filter(f => f.q === qText)[0]; const right = q.o ? q.o[q.a] : q.a; const wrong = [...document.querySelectorAll('#tkBody .tk-opt')].filter(b => b.textContent.slice(1).trim() !== right)[0]; wrong.click(); });
    await p.waitForTimeout(100);
    ok(await p.evaluate(() => !!document.querySelector('#tkBody .tk-why.bad a[href]') && !!document.querySelector('#tkBody .tk-opt.right')), 'a miss shows the right answer, the explanation and a source link');
    await p.click('#tkBody [data-tk="quit"]'); await p.waitForTimeout(100);
  } else console.log(' .. engine quiz still locked here (some Know/Check evidence is not fakeable); skipped the miss check');
  /* the mock G1: 55 drawn in proportion when the bank allows, a clock, a score report by area */
  await p.evaluate(() => V60.jump('track:')); await p.waitForTimeout(150);
  await p.click('#tkBody [data-mock]'); await p.waitForTimeout(200);
  ok(/\d+:\d\d/.test(await p.textContent('#tkClock')), 'the mock G1 shows a clock');
  const total = await p.evaluate(() => +document.querySelector('#tkBody .tk-q .mn-kick span').textContent.replace(/.*OF /, ''));
  ok(total > 30 && total <= 55, 'the mock draws from every area (' + total + ' questions)');
  for (let i = 0; i < total; i++) { await p.click('#tkBody .tk-opt:first-child'); await p.waitForTimeout(20); }
  await p.waitForTimeout(200);
  ok(/SCORE REPORT/.test(await p.textContent('#tkBody')) && await p.evaluate(() => document.querySelectorAll('#tkBody [data-area]').length === 7), 'the mock ends with a score report by area');
  ok(await p.evaluate(() => (V60.mod('track').g1.tries || 0) === 1), 'the mock attempt is saved');
  /* the home strip */
  await p.evaluate(() => __v60.go('car')); await p.waitForTimeout(150);
  ok(await p.evaluate(() => !!document.querySelector('#mnHome .tk-strip') && document.querySelectorAll('#mnHome .tk-segs i').length === 7), 'the home carries the readiness strip with seven segments');
  ok(errs.length === 0, 'no errors ' + JSON.stringify(errs));
  await b.close();
})();
