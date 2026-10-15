/* Updates without a service worker (Bluefy on iPhone has none): the page compares its version with version.json.
   - the header's Version chip shows when this copy was built; tapping it checks now
   - opening the app when a newer version exists updates by itself, once (no reload loop if a cache serves the old page)
   - once you have tapped something, a newer version is offered with the bar instead, and Refresh loads it */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const http = require('http'), fs = require('fs'), path = require('path'); const ROOT = path.resolve(__dirname, '..');
function ok(c, m) { if (!c) { console.log('FAIL', m); process.exitCode = 1; } else console.log(' ok', m); }
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
let published = null; /* what the server says version.json holds; null = the real file */
const srv = http.createServer((q, r) => {
  const u = q.url.split('?')[0];
  if (u === '/version.json' && published) { r.writeHead(200, { 'Content-Type': 'application/json' }); return r.end(JSON.stringify({ v: published })); }
  const f = path.join(ROOT, decodeURIComponent(u === '/' ? '/index.html' : u));
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); r.end(d); });
}).listen(0, '127.0.0.1');
(async () => {
  await new Promise(r => srv.on('listening', r));
  const base = 'http://127.0.0.1:' + srv.address().port + '/';
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const errs = [];
  async function open() {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' }); await ctx.addInitScript(() => { window.__V60_TEST = true; });
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    p.loads = 0; p.on('load', () => { p.loads++; });
    return p;
  }
  const mine = JSON.parse(fs.readFileSync(path.join(ROOT, 'version.json'), 'utf8')).v;
  const newer = mine.replace(/-[0-9a-f]+$/, '-ffffffff');

  /* 1. up to date: the chip, a manual check */
  let p = await open();
  await p.goto(base + 'index.html'); await p.waitForTimeout(2600);
  const chip = () => p.textContent('#verChip');
  ok(await p.evaluate(() => document.getElementById('updateBar').hidden) && p.loads === 1, 'same version: no bar, no reload');
  ok(await p.isVisible('#verChip') && /^Version [A-Z][a-z]{2} \d{1,2}, \d{1,2}:\d{2}/.test(await chip()), 'the header shows the version as a date and time: ' + await chip());
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'the header still fits a 390-wide phone');
  await p.click('#verChip'); await p.waitForTimeout(500);
  ok(/^Up to date/.test(await chip()), 'tapping it checks now: ' + await chip());

  /* 2. in use: a newer version is offered, not forced */
  published = newer;
  await p.click('#verChip'); await p.waitForTimeout(500);
  ok(await p.isVisible('#updateBar') && /^New version ready/.test(await chip()) && p.loads === 1, 'while in use, a newer version shows the bar: ' + await chip());
  const nav = p.waitForNavigation({ timeout: 10000 }).catch(() => null);
  await p.click('#updateBar button'); await nav; await p.waitForTimeout(800);
  ok(p.loads === 2 && await p.evaluate(() => !!window.V60_VERSION), 'Refresh reloads the app');
  ok(!/[?&]u=/.test(p.url()), 'the cache-busting address is tidied away after the reload (' + p.url() + ')');
  await p.context().close();

  /* 3. opening the app with a newer version waiting: it updates by itself, once */
  published = newer;
  p = await open();
  await p.goto(base + 'index.html'); await p.waitForTimeout(5500);
  ok(p.loads === 2, 'opened with a newer version waiting: reloaded by itself (' + p.loads + ' loads)');
  ok(await p.isVisible('#updateBar') && !/[?&]u=/.test(p.url()), 'the server still has the old page: no loop, the bar is offered instead');
  await p.context().close();

  /* 4. a tap before the check: no automatic reload */
  published = mine.replace(/-[0-9a-f]+$/, '-eeeeeeee');
  p = await open();
  await p.goto(base + 'index.html'); await p.waitForTimeout(300); await p.mouse.click(5, 400); await p.waitForTimeout(2600);
  ok(p.loads === 1 && await p.isVisible('#updateBar'), 'after a tap it waits for you: bar shown, no reload');

  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs));
  await b.close(); srv.close();
})();
