/* Navigation: every page has a way in and a way back.
   - retired pages (page cleanup, 2026-11-27) land on their new home: Service log -> Maintenance, Diagnose -> Fix,
     Health -> Home, Engine bay map -> the hood view in Know your car; their working parts moved with them
   - every page is linked from somewhere other than itself (nothing is locked since the reference redesign, 2026-11-26)
   - the home links every section; the index and the see-also strips on Glovebox, Link and Fix only list pages that exist
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

  /* page cleanup: old links land on the new home, and the moved sections are there */
  await p.evaluate(() => V60.jump('tab:engine')); await p.waitForTimeout(150);
  ok(await tab() === 'view' && !(await p.$('#mnView .mn-mapbtn')), 'the old engine bay map link opens the hood view, which has no second map');
  await p.evaluate(() => V60.jump('tab:records')); await p.waitForTimeout(150);
  ok(await tab() === 'maint' && await p.evaluate(() => !!document.querySelector('#p-maint #log #logForm') && !!document.querySelector('#p-maint #oil') && !!document.querySelector('#p-maint section.remind') && !document.querySelector('#p-maint #due')), 'Service log links open Maintenance, which now holds the log, oil watch and reminders');
  await p.evaluate(() => V60.jump('tab:diag')); await p.waitForTimeout(150);
  ok(await tab() === 'trouble' && await p.evaluate(() => !!document.querySelector('#p-trouble #codeIn') && !!document.querySelector('#p-trouble #codeForm')), 'Diagnose links open Fix, which now holds the code lookup and code log');
  await p.evaluate(() => V60.jump('tab:health')); await p.waitForTimeout(150);
  ok(await tab() === 'car', 'Health links open Home');
  ok(await p.evaluate(() => !!document.querySelector('#p-settings #backupSec')), 'Back up and restore is on Settings');
  await p.evaluate(() => V60.jump('backup:go')); await p.waitForTimeout(150);
  ok(await tab() === 'settings', 'the backup link opens Settings');

  /* the home: the status board, its eight sections, the Index and Settings */
  await p.evaluate(() => __v60.go('car')); await p.waitForTimeout(150);
  const homeLinks = await p.evaluate(() => [...document.querySelectorAll('#mnHome [data-jump^="tab:"]')].map(e => e.getAttribute('data-jump').slice(4)));
  for (const t of ['maint', 'shop', 'know', 'trouble', 'fuel', 'bulletins', 'glove', 'kb', 'index', 'settings']) ok(homeLinks.includes(t), 'the home links ' + t);
  ok(await p.evaluate(() => !document.querySelector('#mnHome .mn-next, #mnHome .mn-pbar')), 'no path card or progress bar on the home');
  const bar = await p.evaluate(() => [...document.querySelectorAll('#rail [data-tab]')].map(e => e.getAttribute('data-tab')).join(','));
  ok(bar === 'car,maint,trouble,glove,live', 'the bar is Home, Maintain, Fix, Glovebox, Link (' + bar + ')');
  ok(await p.evaluate(() => !document.querySelector('#rail .locked, #rail .newdot')), 'nothing on the bar is locked or marked new');
  await p.evaluate(() => __v60.go('index')); await p.waitForTimeout(150);
  const offered = await p.evaluate(() => [...document.querySelectorAll('#mnIndex .mn-also [data-jump]')].map(e => e.getAttribute('data-jump').slice(4)));
  ok(offered.includes('fuel') && offered.includes('upgrades') && offered.includes('settings'), 'the index lists every section from the start (' + offered.join(',') + ')');
  ok(!offered.includes('path') && !offered.includes('story'), 'the path and the cases are not offered');

  const tabs = await p.evaluate(() => [...document.querySelectorAll('main > .panel')].map(x => x.id.slice(2)));
  const into = {};
  /* retired with the game layer (2026-11-26): kept in the code, no longer offered, and not counted as a way in */
  const RETIRED = ['path', 'story', 'today', 'achieve', 'unlocks', 'engine', 'bay', 'health', 'records', 'diag', 'sim', 'cards', 'academy'];
  for (const t of tabs) {
    if (RETIRED.includes(t)) continue;
    await p.evaluate(t => __v60.go(t), t); await p.waitForTimeout(60);
    const outs = await p.evaluate(() => { const v = [...document.querySelectorAll('main > .panel')].filter(x => !x.hidden)[0]; return [...v.querySelectorAll('[data-jump^="tab:"],[data-tab]')].map(e => e.getAttribute('data-jump') ? e.getAttribute('data-jump').slice(4) : e.getAttribute('data-tab')); });
    outs.forEach(o => { if (o !== t) (into[o] = into[o] || new Set()).add(t); });
  }
  const navTabs = await p.evaluate(() => [...document.querySelectorAll('#rail [data-tab]')].map(e => e.getAttribute('data-tab')));
  navTabs.forEach(o => (into[o] = into[o] || new Set()).add('bar'));
  const orphans = tabs.filter(t => !['view', 'item'].concat(RETIRED).includes(t) && !into[t]);
  ok(orphans.length === 0, 'every page is linked from another page or the bar' + (orphans.length ? ' (missing: ' + orphans.join(',') + ')' : ''));
  const broken = Object.keys(into).filter(t => !tabs.includes(t));
  ok(broken.length === 0, 'no link points at a page that does not exist ' + JSON.stringify(broken));
  for (const r of ['glove', 'live', 'trouble']) {
    await p.evaluate(r => __v60.go(r), r); await p.waitForTimeout(100);
    ok(await p.evaluate(r => document.querySelectorAll('#also-' + r + ' [data-jump]').length > 0, r), 'see-also on ' + r);
  }

  /* Back retraces two pages, a root clears the trail */
  await p.evaluate(() => __v60.go('glove')); await p.waitForTimeout(100);
  await p.click('#also-glove [data-jump="tab:docs"]'); await p.waitForTimeout(100);
  ok(await tab() === 'docs' && /Back to Glovebox/.test(await crumb()), 'Glovebox → Documents shows Back to Glovebox');
  await p.evaluate(() => V60.jump('tab:kb')); await p.waitForTimeout(100);
  ok(/Back to Documents/.test(await crumb()), 'a second hop shows Back to Documents (' + await crumb() + ')');
  await p.click('#crumb [data-back]'); await p.waitForTimeout(100);
  ok(await tab() === 'docs' && /Back to Glovebox/.test(await crumb()), 'Back once: Documents, still offering Glovebox');
  await p.click('#crumb [data-back]'); await p.waitForTimeout(100);
  ok(await tab() === 'glove' && !(await crumb()), 'Back twice: Glovebox, no crumb on a root');

  ok(errs.length === 0, 'no errors ' + JSON.stringify(errs));
  await b.close();
})();
