/* Claude live as an always-on service (bridge/service.js, 2026-11-27): no browser needed. Starts the service on a spare
   port with a throwaway data folder and Claude switched off (V60_NO_CLAUDE), links a pretend phone over the WebSocket,
   and checks: the adapter's events are queued for one Claude run, the tool API refuses calls without the secret, and a
   tool call from tools.js (the MCP server headless Claude loads) reaches the phone and gets the phone's answer back.
   Skips (passes) when the bridge's packages are not installed (cd bridge && npm install). */
const path = require('path'), fs = require('fs'), os = require('os');
const { spawn } = require('child_process');
const { createRequire } = require('module');
const ROOT = path.resolve(__dirname, '..'), BRIDGE = path.join(ROOT, 'bridge');
function ok(c, m) { if (!c) { console.log('FAIL', m); process.exitCode = 1; } else console.log(' ok', m); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  if (!fs.existsSync(path.join(BRIDGE, 'node_modules', '@modelcontextprotocol', 'sdk'))) { console.log(' ok skipped: bridge packages not installed (cd bridge && npm install)'); return; }
  const req = createRequire(path.join(BRIDGE, 'service.js'));
  const WebSocket = req('ws');
  const { Client } = req('@modelcontextprotocol/sdk/client/index.js');
  const { StdioClientTransport } = req('@modelcontextprotocol/sdk/client/stdio.js');
  const port = 20000 + Math.floor(Math.random() * 2000), data = fs.mkdtempSync(path.join(os.tmpdir(), 'v60svc-'));
  const env = { ...process.env, V60_PORT: String(port), V60_DATA: data, V60_NO_CLAUDE: '1' };
  const svc = spawn(process.execPath, [path.join(BRIDGE, 'service.js')], { cwd: BRIDGE, env, stdio: ['ignore', 'pipe', 'pipe'] });
  let svcErr = ''; svc.stderr.on('data', (d) => { svcErr += d; });
  const until = async (f, ms = 8000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const v = f(); if (v) return v; await sleep(100); } return null; };
  try {
    ok(await until(() => /listening on/.test(svcErr)), 'service listens on its port');
    const code = JSON.parse(fs.readFileSync(path.join(data, 'pair.json'), 'utf8')).code;
    const token = fs.readFileSync(path.join(data, 'api-token'), 'utf8').trim();
    const cfg = JSON.parse(fs.readFileSync(path.join(data, 'tools-mcp.json'), 'utf8')).mcpServers.v60;
    ok(token.length >= 32 && cfg.env.V60_API_TOKEN === token && /tools\.js$/.test(cfg.args[0]), 'MCP config for headless Claude points at tools.js with the secret');

    // the tool API is on the same port Tailscale publishes: no secret, no tools
    const bad = await fetch(`http://127.0.0.1:${port}/api/tool`, { method: 'POST', body: JSON.stringify({ name: 'car_status' }) });
    ok(bad.status === 403, 'tool API refuses a call without the secret (403)');
    ok(/is running/.test(await (await fetch(`http://127.0.0.1:${port}/`)).text()), 'status page still answers');

    // a pretend phone
    const ws = new WebSocket(`ws://127.0.0.1:${port}/link?code=${code}`);
    const got = [];
    ws.on('message', (d) => { const m = JSON.parse(String(d)); got.push(m); if (m.t === 'cmd') ws.send(JSON.stringify({ t: 'res', id: m.id, ok: true, raw: '7E8 06 41 00 BE 3F A8 13 \r' })); });
    await new Promise((r) => ws.once('open', r));
    ws.send(JSON.stringify({ t: 'hello', page: 'V60 iPhone app test', auto: true, known: true, connected: false }));
    ok(await until(() => got.some((m) => m.t === 'welcome')), 'phone linked and welcomed');
    ws.send(JSON.stringify({ t: 'link', state: 'on', adapter: 'OBDLink CX', can: true }));
    ws.send(JSON.stringify({ t: 'say', text: 'hello from the test' }));
    const log = () => { try { return fs.readFileSync(path.join(data, 'logs', fs.readdirSync(path.join(data, 'logs'))[0]), 'utf8').trim().split('\n').map((l) => JSON.parse(l)); } catch { return []; } };
    const run = await until(() => log().find((r) => r.k === 'claude_run'), 6000);
    ok(run && run.skipped && run.events.join(',') === 'adapter_on,kyle', 'adapter_on and Kyle\'s message go to Claude together in one run: ' + (run && run.events));

    // headless Claude's side: tools.js over MCP, the way `claude -p --mcp-config` starts it
    const client = new Client({ name: 'test-claude', version: '1.0.0' }, { capabilities: {} });
    await client.connect(new StdioClientTransport({ command: process.execPath, args: cfg.args, env: { ...process.env, ...cfg.env }, stderr: 'pipe' }));
    const tools = (await client.listTools()).tools.map((t) => t.name).sort();
    ok(tools.join(',') === 'car_log,car_restore,car_send,car_status,reply', 'tools.js offers the car tools: ' + tools.join(', '));
    const txt = (r) => (r.content || []).map((c) => c.text).join('\n');
    const st = JSON.parse(txt(await client.callTool({ name: 'car_status', arguments: {} })));
    ok(st.phone_linked && st.adapter_connected && st.adapter === 'OBDLink CX', 'car_status through the service sees the phone and adapter');
    const r = await client.callTool({ name: 'car_send', arguments: { command: '0100' } });
    ok(!r.isError && /41 00 BE 3F A8 13/.test(txt(r)), 'car_send reaches the phone and returns its answer');
    await client.callTool({ name: 'reply', arguments: { text: 'Test message', url: 'https://example.test/drives/x' } });
    ok(await until(() => got.find((m) => m.t === 'msg' && m.text === 'Test message' && /drives\/x/.test(m.url))), 'reply shows on the phone with its link');
    const w = await client.callTool({ name: 'car_send', arguments: { command: '04', why: 'test' } });
    ok(got.some((m) => m.t === 'cmd' && m.c === '04' && m.write === true), 'clearing codes is sent as a write, so the phone asks Kyle first');
    await client.close(); ws.close();
  } finally {
    svc.kill();
    await sleep(300);
    try { fs.rmSync(data, { recursive: true, force: true }); } catch {}
  }
})();
