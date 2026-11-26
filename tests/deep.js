/* Deep scan (tools/gen/live_deep.js) against a mocked car behind the iPhone app's bridge (as in tests/native.js).
   The mock answers by the current header like a real adapter: mode 06 self-tests from the engine (catalyst outside
   its limits, misfires on cylinder 2), UDS 19 02 FF from each module (engine P0171, brake module C007768 and one more
   in a two-frame reply, a clean CEM, a transmission that declines, the rest silent). Checks the page shows all of it,
   puts the adapter's addressing back, saves the scan, and posts it to the PC. */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const path = require('path'); const ROOT = path.resolve(__dirname, '..');
function ok(c, m) { if (!c) { console.log('FAIL', m); process.exitCode = 1; } else console.log(' ok', m); }
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(() => {
    window.__V60_TEST = true;
    const S = window.__app = { sent: [], sh: '7DF', cra: null };
    const hx = (n) => n.toString(16).toUpperCase().padStart(2, '0');
    // ISO-TP frames with headers and spaces on, as the adapter prints them
    const iso = (hdr, p) => {
      if (p.length <= 7) return hdr + ' ' + [p.length].concat(p).map(hx).join(' ') + ' \r';
      const out = [hdr + ' ' + [0x10 | (p.length >> 8), p.length & 255].concat(p.slice(0, 6)).map(hx).join(' ')];
      for (let i = 6, n = 1; i < p.length; i += 7, n++) out.push(hdr + ' ' + [0x20 | (n & 15)].concat(p.slice(i, i + 7)).map(hx).join(' '));
      return out.join(' \r') + ' \r';
    };
    const test = (mid, tid, u, v, lo, hi) => [mid, tid, u, v >> 8, v & 255, lo >> 8, lo & 255, hi >> 8, hi & 255];
    const M06 = {
      0x01: [test(0x01, 0x01, 0x0A, 0x01A0, 0, 0x0300)],
      0x21: [test(0x21, 0x80, 0x01, 600, 0, 500)],
      0xA2: [test(0xA2, 0x0B, 0x24, 0, 0, 65535), test(0xA2, 0x0C, 0x24, 0, 0, 65535)],
      0xA3: [test(0xA3, 0x0B, 0x24, 3, 0, 65535), test(0xA3, 0x0C, 0x24, 12, 0, 65535)],
      0xA4: [test(0xA4, 0x0B, 0x24, 0, 0, 65535), test(0xA4, 0x0C, 0x24, 0, 0, 65535)],
      0xA5: [test(0xA5, 0x0B, 0x24, 0, 0, 65535), test(0xA5, 0x0C, 0x24, 1, 0, 65535)],
    };
    const BITMAP = { 0x00: [0x80, 0, 0, 1], 0x20: [0x80, 0, 0, 1], 0x40: [0, 0, 0, 1], 0x60: [0, 0, 0, 1], 0x80: [0, 0, 0, 1], 0xA0: [0x78, 0, 0, 0] };
    const UDS = { '7E0': [0x59, 0x02, 0xFF, 0x01, 0x71, 0x00, 0x09], '760': [0x59, 0x02, 0xFF, 0x40, 0x77, 0x68, 0x09, 0x41, 0x23, 0x45, 0x04],
      '726': [0x59, 0x02, 0xFF], '7E1': [0x7F, 0x19, 0x11] };
    const RESP = { '7E0': '7E8', '7E1': '7E9', '760': '768', '726': '72E' };
    const reply = (c) => {
      let m;
      if ((m = c.match(/^ATSH([0-9A-F]{3})$/))) { S.sh = m[1]; return 'OK\r'; }
      if ((m = c.match(/^ATCRA([0-9A-F]{3})?$/))) { S.cra = m[1] || null; return 'OK\r'; }
      if (/^AT/.test(c)) return 'OK\r';
      if (c === '1902FF') return UDS[S.sh] ? iso(RESP[S.sh], UDS[S.sh]) : 'NO DATA\r';
      if ((m = c.match(/^06([0-9A-F]{2})$/)) && S.sh === '7DF') {
        const mid = parseInt(m[1], 16);
        if (BITMAP[mid] && mid % 0x20 === 0) return iso('7E8', [0x46, mid].concat(BITMAP[mid]));
        return M06[mid] ? iso('7E8', [0x46].concat(...M06[mid])) : 'NO DATA\r';
      }
      if (/^0100/.test(c)) return '7E8 06 41 00 BE 3F A8 13 \r';
      return 'NO DATA\r';
    };
    window.V60_NATIVE = { app: 'test', pc: 'kitty.test' };
    window.webkit = { messageHandlers: { v60car: { postMessage: (msg) => {
      if (msg.op === 'status') return Promise.resolve({ ready: true, name: 'OBDLink CX', can: true });
      if (msg.op === 'send') { S.sent.push(msg.cmd); return Promise.resolve({ ok: true, raw: reply(msg.cmd) }); }
      return Promise.reject(new Error('unknown op'));
    } } } };
  });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  let posted = null;
  await p.route('https://kitty.test/drives/deep', (r) => { posted = JSON.parse(r.request().postData() || 'null'); r.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ id: 'x', url: 'https://kitty.test/drives/deep/x' }) }); });
  await p.goto('file://' + ROOT + '/index.html');
  await p.evaluate(() => __v60.go('live'));
  await p.waitForFunction(() => /Connected to/.test(document.getElementById('lk-connText').textContent), null, { timeout: 15000 }).catch(() => {});
  ok(!(await p.evaluate(() => document.getElementById('lk-btnDeep').disabled)), 'Deep scan button is ready once connected');
  await p.click('#lk-btnDeep');
  await p.waitForFunction(() => /^Done/.test(document.getElementById('lk-deepStatus').textContent) && /PC/.test(document.getElementById('lk-deepStatus').textContent), null, { timeout: 30000 }).catch(() => {});
  const mods = await p.textContent('#lk-mods'), tests = await p.textContent('#lk-tests');
  ok(/Engine \(ECM\)/.test(mods) && /P017100, active now/.test(mods), 'engine code in Volvo form: P017100, active now');
  ok(/C007768/.test(mods) && /C012345/.test(mods), 'brake module: both codes from a two-frame reply (C007768, C012345)');
  ok(/Central electronics \(CEM\)Clean/.test(mods.replace(/\s+/g, '')) || /Clean/.test(mods), 'a module with no codes shows Clean');
  ok(/Declined/.test(mods) && /No answer/.test(mods) && /SAS, EPB, HCM/.test(mods), 'a declined request and the silent modules (in one line) are told apart');
  ok(/Catalyst, bank 1/.test(tests) && /Outside limits/.test(tests), 'catalyst self-test outside its limits is flagged');
  ok(/cyl 2: 12/.test(tests) && /cyl 4: 1/.test(tests), 'misfire counts per cylinder in one line: cyl 2: 12, cyl 4: 1');
  const sent = await p.evaluate(() => window.__app.sent);
  ok(sent.slice(-2).join(' ') === 'ATCRA ATSH7DF', 'adapter addressing put back afterwards: ' + sent.slice(-2).join(' '));
  ok(posted && posted.modules.length === 9 && posted.tests.length >= 9 && /modules answered/.test(posted.summary), 'scan posted to the PC with a summary: ' + (posted && posted.summary).slice(0, 120));
  ok(/Claude has it/.test(await p.textContent('#lk-deepStatus')), 'status says the PC has it');
  await p.reload(); await p.evaluate(() => __v60.go('live')); await p.waitForTimeout(500);
  ok(/C007768/.test(await p.textContent('#lk-mods')), 'the last deep scan is still there after a reload');
  await p.locator('#lk-deepOut').scrollIntoViewIfNeeded();
  await p.screenshot({ path: path.join(ROOT, 'tests', 'shots', 'deep-scan.png'), fullPage: false });
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs));
  await b.close();
})();
