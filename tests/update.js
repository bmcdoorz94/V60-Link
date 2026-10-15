/* "A new version is ready" must work without a service worker (Bluefy on iPhone has none): the page compares its
   version with version.json when it opens and whenever it comes back to the front, and Refresh loads the new one. */
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
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' }); await ctx.addInitScript(() => { window.__V60_TEST = true; });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(base + 'index.html'); await p.waitForTimeout(2600);
  const mine = await p.evaluate(() => window.V60_VERSION);
  ok(!!mine && await p.evaluate(() => document.getElementById('updateBar').hidden), 'same version: no bar (' + mine + ')');

  published = mine.replace(/-[0-9a-f]+$/, '-ffffffff');
  await p.evaluate(() => window.__v60CheckUpdate(true)); await p.waitForTimeout(400);
  ok(await p.isVisible('#updateBar'), 'a newer version.json shows the bar, with no service worker');

  const nav = p.waitForNavigation({ timeout: 10000 }).catch(() => null);
  await p.click('#updateBar button'); await nav; await p.waitForTimeout(800);
  ok(await p.evaluate(() => !!window.V60_VERSION), 'Refresh reloads the app');
  ok(!/[?&]u=/.test(p.url()), 'the cache-busting address is tidied away after the reload (' + p.url() + ')');

  published = null;
  await p.evaluate(() => { document.getElementById('updateBar').hidden = true; Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true }); });
  published = mine.replace(/-[0-9a-f]+$/, '-eeeeeeee');
  await p.evaluate(() => { window.__v60CheckUpdate(true); }); await p.waitForTimeout(400);
  ok(await p.isVisible('#updateBar'), 'checked again later (coming back to the app) and offered the next one');
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs));
  await b.close(); srv.close();
})();
