/* The Garage page inside the V60 iPhone app (tools/gen/live_native.js), with the app's bridge mocked:
   window.V60_NATIVE plus window.webkit.messageHandlers.v60car (status / send). Checks: the page connects through the
   app's link by itself when the app says the car is ready, without resetting the adapter (the app is recording);
   the gauges fill from the app's readings with no Start button; a health check runs through the app's link;
   the page goes back to waiting when the app says the car is gone. */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const path = require('path'); const ROOT = path.resolve(__dirname, '..');
function ok(c, m) { if (!c) { console.log('FAIL', m); process.exitCode = 1; } else console.log(' ok', m); }
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(() => {
    window.__V60_TEST = true;
    const S = window.__app = { ready: false, sent: [] };
    const reply = (c) => /^0100/.test(c) ? '7E8 06 41 00 BE 3F A8 13 \r' : /^0120/.test(c) ? '7E8 06 41 20 80 00 00 01 \r'
      : /^0140/.test(c) ? '7E8 06 41 40 40 00 00 00 \r' : /^0101/.test(c) ? '7E8 06 41 01 82 07 E5 00 \r'
      : /^03/.test(c) ? '7E8 06 43 02 01 71 05 07 \r' : /^07/.test(c) ? '7E8 04 47 01 01 71 \r' : /^0A/.test(c) ? '7E8 04 4A 01 01 71 \r'
      : /^ATDPN/.test(c) ? 'A6\r' : /^AT/.test(c) ? 'OK\r' : 'NO DATA\r';
    window.V60_NATIVE = { app: 'test' };
    window.webkit = { messageHandlers: { v60car: { postMessage: (m) => {
      if (m.op === 'status') return Promise.resolve({ ready: S.ready, name: 'OBDLink CX', can: true });
      if (m.op === 'send') { S.sent.push(m.cmd); return Promise.resolve(S.ready ? { ok: true, raw: reply(m.cmd) } : { ok: false, error: 'The adapter is not connected.' }); }
      return Promise.reject(new Error('unknown op'));
    } } } };
  });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file://' + ROOT + '/index.html');
  await p.evaluate(() => __v60.go('live'));
  await p.waitForTimeout(1200);
  const conn = () => p.textContent('#lk-connText');
  ok(/Waiting for the car/.test(await conn()), 'car not ready yet: waits for the app (' + await conn() + ')');
  ok(/V60 app/.test(await p.textContent('#lk-noBt')), 'explains that the app holds the adapter link');

  await p.evaluate(() => { window.__app.ready = true; window.V60_NATIVE.onLink(true); });
  await p.waitForFunction(() => /Connected to/.test(document.getElementById('lk-connText').textContent), null, { timeout: 15000 }).catch(() => {});
  ok(/Connected to OBDLink CX/.test(await conn()), 'the app says the car is ready: the page connects through it (' + await conn() + ')');
  const sent = await p.evaluate(() => window.__app.sent);
  ok(!sent.some((c) => /^AT(Z|WS|SP|E0|H1)/.test(c)), 'no adapter reset or setup from the page (the app is recording): ' + sent.join(' '));
  ok(await p.evaluate(() => { const g = document.getElementById('lk-dashGo'); return g.disabled && /by themselves/.test(g.textContent); }), 'no Start button: "Gauges run by themselves"');

  await p.evaluate(() => window.V60_NATIVE.onSample({ v: { '0C': [14, 76], '0D': [5], '05': [123], '07': [147], '42': [55, 220] } }));
  await p.waitForTimeout(300);
  const dials = await p.evaluate(() => ({ rpm: (document.getElementById('lk-dv-rpm') || {}).textContent, spd: (document.getElementById('lk-dv-spd') || {}).textContent, cool: (document.getElementById('lk-dv-cool') || {}).textContent, ltft: (document.getElementById('lk-dv-ltft') || {}).textContent, volt: (document.getElementById('lk-dv-volt') || {}).textContent }));
  ok(dials.rpm === '920' && dials.spd === '3' && dials.cool === '181' && dials.ltft === '+14.8' && dials.volt === '14.3', 'a reading from the app fills the gauges: ' + JSON.stringify(dials));
  const before = (await p.evaluate(() => window.__app.sent)).length;
  await p.waitForTimeout(1500);
  ok((await p.evaluate(() => window.__app.sent)).length === before, 'the page does not poll the car itself');

  await p.click('#lk-btnScan');
  await p.waitForFunction(() => /P0171/.test(document.body.innerText), null, { timeout: 20000 }).catch(() => {});
  ok(/P0171/.test(await p.evaluate(() => document.body.innerText)), 'a health check runs through the app\'s link and finds P0171');

  await p.evaluate(() => { window.__app.ready = false; window.V60_NATIVE.onLink(false); });
  await p.waitForTimeout(400);
  ok(/Waiting for the car/.test(await conn()), 'the app says the car is gone: back to waiting (' + await conn() + ')');
  await p.screenshot({ path: path.join(ROOT, 'tests', 'shots', 'native-gauges.png') });
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs));
  await b.close();
})();
