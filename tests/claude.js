/* Claude live end to end: the real bridge (bridge/server.js) started the way Claude Code starts it (MCP over stdio),
   a test MCP client standing in for Claude, and the app's Live link on the simulated car.
   Checks: pairing, "adapter connected" reaches Claude once, reads run at once, a write waits for Allow / No on the
   phone, Claude's replies show, Kyle's messages reach Claude, permission prompts relay both ways, a wrong code is refused.
   Skips (passes) when the bridge's packages are not installed (cd bridge && npm install). */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const path = require('path'), fs = require('fs'), os = require('os');
const { createRequire } = require('module');
const ROOT = path.resolve(__dirname, '..'), BRIDGE = path.join(ROOT, 'bridge');
function ok(c, m) { if (!c) { console.log('FAIL', m); process.exitCode = 1; } else console.log(' ok', m); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  if (!fs.existsSync(path.join(BRIDGE, 'node_modules', '@modelcontextprotocol', 'sdk'))) { console.log(' ok skipped: bridge packages not installed (cd bridge && npm install)'); return; }
  const req = createRequire(path.join(BRIDGE, 'server.js'));
  const { Client } = req('@modelcontextprotocol/sdk/client/index.js');
  const { StdioClientTransport } = req('@modelcontextprotocol/sdk/client/stdio.js');
  const port = 18000 + Math.floor(Math.random() * 2000), data = fs.mkdtempSync(path.join(os.tmpdir(), 'v60cl-'));
  const events = [];
  const client = new Client({ name: 'test-claude', version: '1.0.0' }, { capabilities: {} });
  client.fallbackNotificationHandler = async (n) => { events.push(n); };
  const transport = new StdioClientTransport({ command: process.execPath, args: [path.join(BRIDGE, 'server.js')], cwd: BRIDGE, env: { ...process.env, V60_PORT: String(port), V60_DATA: data }, stderr: 'pipe' });
  await client.connect(transport);
  const tools = (await client.listTools()).tools.map((t) => t.name).sort();
  ok(tools.join(',') === 'car_log,car_restore,car_send,car_status,reply', 'bridge offers its tools: ' + tools.join(', '));
  await sleep(300);
  const code = JSON.parse(fs.readFileSync(path.join(data, 'pair.json'), 'utf8')).code;
  ok(/^\d{6}$/.test(code), 'pairing code made: 6 digits');
  const waitEvent = async (pred, ms = 8000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const e = events.find(pred); if (e) return e; await sleep(50); } return null; };
  const chan = (ev) => (n) => n.method === 'notifications/claude/channel' && n.params && n.params.meta && n.params.meta.event === ev;
  const call = (name, args) => client.callTool({ name, arguments: args || {} });
  const txt = (r) => (r.content || []).map((c) => c.text).join('\n');

  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await ctx.addInitScript(([port, code]) => { window.__V60_TEST = true; localStorage.setItem('v60-claude', JSON.stringify({ host: '127.0.0.1:' + port, code, on: true })); }, [port, code]);
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file://' + ROOT + '/index.html'); await p.waitForTimeout(400);
  await p.evaluate(() => __v60.go('live'));
  await p.waitForFunction(() => /Claude is watching/.test(document.getElementById('lk-clText').textContent), null, { timeout: 10000 }).catch(() => {});
  ok(/Claude is watching/.test(await p.textContent('#lk-clText')), 'phone linked to the bridge: ' + await p.textContent('#lk-clText'));
  ok(await p.isVisible('#lk-clSay'), 'message box shows once linked');
  let st = JSON.parse(txt(await call('car_status')));
  ok(st.phone_linked === true && st.adapter_connected === false, 'car_status: phone linked, adapter not yet');

  await p.click('#lk-btnDemo');
  const on = await waitEvent(chan('adapter_on'));
  ok(on && /Simulated V60/.test(on.params.content) && /not the real V60/.test(on.params.content), 'Claude hears the adapter connect: ' + (on && on.params.content));
  await sleep(500);
  ok(events.filter(chan('adapter_on')).length === 1, 'announced once, not on every hello');

  let r = await call('car_send', { command: '0100' });
  ok(!r.isError && /41 00/.test(txt(r)), 'a read runs at once: ' + txt(r).split('\n').slice(-1)[0]);
  ok(!(await p.isVisible('#lk-clAsk')), 'no Allow card for a read');

  let pending = call('car_send', { command: '04', why: 'Clear the test codes' });
  await p.waitForSelector('#lk-clAsk .clq', { timeout: 8000 }).catch(() => {});
  const card = await p.textContent('#lk-clAsk').catch(() => '');
  ok(/change the car/.test(card) && /Clear the test codes/.test(card), 'a write waits for Kyle: the card shows the reason');
  await p.screenshot({ path: path.join(ROOT, 'tests', 'shots', 'claude-live-ask-iphone.png') });
  await p.click('#lk-clAsk button[data-v="no"]');
  r = await pending;
  ok(r.isError && /Kyle said no/.test(txt(r)), 'No: Claude is told Kyle said no');

  pending = call('car_send', { command: '04', why: 'Clear the test codes' });
  await p.waitForSelector('#lk-clAsk .clq', { timeout: 8000 });
  await p.click('#lk-clAsk button[data-v="yes"]');
  r = await pending;
  ok(!r.isError && /Kyle allowed it/.test(txt(r)) && /7F 04 22|44/.test(txt(r)), 'Allow once: the write runs (simulated engine running, so the car refuses with 7F 04 22): ' + txt(r).split('\n').slice(-1)[0]);

  r = await call('reply', { text: 'Coolant is warming normally. No codes in the engine module.' });
  ok(!r.isError, 'reply delivered');
  await p.waitForFunction(() => /Coolant is warming/.test(document.getElementById('lk-clFeed').textContent), null, { timeout: 5000 }).catch(() => {});
  ok(/Coolant is warming/.test(await p.textContent('#lk-clFeed')), "Claude's message shows on the phone");

  await p.fill('#lk-clMsg', 'what is the battery doing?');
  await p.click('#lk-clSend');
  const said = await waitEvent((n) => chan('kyle')(n) && /battery/.test(n.params.content));
  ok(!!said, "Kyle's message reaches Claude");
  ok(await p.inputValue('#lk-clMsg') === '', 'message box clears after sending');

  await client.notification({ method: 'notifications/claude/channel/permission_request', params: { request_id: 'abcde', tool_name: 'Bash', description: 'List the bridge folder', input_preview: '{"command":"dir"}' } });
  await p.waitForSelector('#lk-clAsk .clq', { timeout: 8000 }).catch(() => {});
  ok(/Claude wants to use Bash/.test(await p.textContent('#lk-clAsk').catch(() => '')), 'a Claude Code permission prompt shows on the phone');
  await p.click('#lk-clAsk button[data-v="yes"]');
  const verdict = await waitEvent((n) => n.method === 'notifications/claude/channel/permission' && n.params.request_id === 'abcde');
  ok(verdict && verdict.params.behavior === 'allow', 'Allow on the phone goes back to Claude Code as allow');

  await p.evaluate(() => __v60.go('car'));
  await p.waitForTimeout(200);
  await call('reply', { text: 'Seen from another screen: battery 14.1 V with the engine running.' });
  await p.waitForSelector('#lk-clToast:not([hidden])', { timeout: 5000 }).catch(() => {});
  ok(await p.isVisible('#lk-clToast') && /another screen/.test(await p.textContent('#lk-clToast')), "Claude's message shows over another screen of the app");
  await p.screenshot({ path: path.join(ROOT, 'tests', 'shots', 'claude-live-toast-iphone.png') });
  pending = call('car_send', { command: '14FFFFFF', why: 'Clear the brake module codes after the tire calibration' });
  await p.waitForSelector('#lk-clAsk .clq', { timeout: 8000 }).catch(() => {});
  ok(await p.isVisible('#lk-clAsk .clq') && !(await p.isVisible('#lk-clToast')), 'the Allow card shows over another screen and replaces the toast');
  await p.screenshot({ path: path.join(ROOT, 'tests', 'shots', 'claude-live-ask-iphone.png') });
  await p.click('#lk-clAsk button[data-v="no"]'); await pending;
  await p.click('#lk-clToast').catch(() => {});
  await p.evaluate(() => __v60.go('live'));

  r = await call('car_send', { command: 'ATSH7E0' });
  ok(!r.isError, 'adapter setting runs without a tap');
  r = await call('car_restore');
  ok(!r.isError && /set up again/.test(txt(r)), 'car_restore sets the adapter back up: ' + txt(r));
  r = await call('car_log', { lines: 400 });
  ok(/\[claude\] 0100/.test(txt(r)) && /> 0100/.test(txt(r)) && /\[kyle\] what is the battery/.test(txt(r)), 'car_log has the adapter conversation, Claude\'s commands and Kyle\'s message');

  await p.locator('#lk-cl').screenshot({ path: path.join(ROOT, 'tests', 'shots', 'claude-live-iphone.png') });
  const box = await p.evaluate(() => { const el = document.getElementById('lk-cl'), r = el.getBoundingClientRect(); return { w: r.width, sw: document.documentElement.scrollWidth }; });
  ok(box.sw <= 390, 'no sideways scroll on the phone (' + box.sw + ' px)');

  await p.click('#lk-btnDisconnect');
  const off = await waitEvent(chan('adapter_off'), 25000);
  ok(!!off, 'Claude hears the adapter drop (after the 20 s grace period)');

  const p2 = await (await b.newContext()).newPage();
  await p2.addInitScript(([port]) => { window.__V60_TEST = true; localStorage.setItem('v60-claude', JSON.stringify({ host: '127.0.0.1:' + port, code: '000000', on: true })); }, [port]);
  await p2.goto('file://' + ROOT + '/index.html'); await p2.waitForTimeout(400);
  await p2.evaluate(() => __v60.go('live'));
  await p2.waitForFunction(() => /refused/.test(document.getElementById('lk-clText').textContent), null, { timeout: 8000 }).catch(() => {});
  ok(/refused the pairing code/.test(await p2.textContent('#lk-clText')), 'a wrong pairing code is refused');

  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close(); await client.close();
  fs.rmSync(data, { recursive: true, force: true });
})().catch((e) => { console.log('FAIL', e && e.stack || e); process.exitCode = 1; process.exit(1); });
