/* Live link over a mocked Web Bluetooth adapter: the first link drops right after notifications start
   (as the OBDLink CX can while iOS finishes pairing); connect() must retry once and then talk to the car. */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const path = require('path'); const ROOT = path.resolve(__dirname, '..');
function ok(c, m) { if (!c) { console.log('FAIL', m); process.exitCode = 1; } else console.log(' ok', m); }
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  for (const mode of ['drop-once', 'drop-always', 'drop-after-atz']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    await ctx.addInitScript(m => {
      window.__V60_TEST = true;
      let connects = 0;
      const enc = new TextEncoder(), dec = new TextDecoder();
      function makeDevice() {
        const dev = new EventTarget(); dev.name = 'OBDLink CX';
        const gatt = { connected: false };
        let notify = null;
        const rx = { uuid: '0000fff1-0000-1000-8000-00805f9b34fb', properties: { notify: true }, addEventListener: (t, f) => { notify = f; }, startNotifications: () => {
          if (m === 'drop-always' || (m === 'drop-once' && connects === 1)) setTimeout(() => { gatt.connected = false; dev.dispatchEvent(new Event('gattserverdisconnected')); }, 30);
          return Promise.resolve(); } };
        const reply = cmd => {
          if (/^0100/.test(cmd)) return '7E8 06 41 00 BE 3F A8 13 00\r\r>';
          if (/^ATDPN/.test(cmd)) return 'A6\r\r>';
          if (/^01/.test(cmd)) return 'NO DATA\r\r>';
          return 'OK\r\r>';
        };
        const tx = { uuid: '0000fff2-0000-1000-8000-00805f9b34fb', properties: { write: true, writeWithoutResponse: true }, writeValue: v => send(v), writeValueWithResponse: v => send(v) };
        let buf = '';
        function send(v) {
          if (!gatt.connected) { const e = new Error('GATT Server is disconnected.'); e.name = 'NetworkError'; return Promise.reject(e); }
          buf += dec.decode(v); if (buf.indexOf('\r') >= 0) { const c = buf.trim(); buf = ''; if (m === 'drop-after-atz' && c === 'ATZ') { setTimeout(() => { gatt.connected = false; dev.dispatchEvent(new Event('gattserverdisconnected')); }, 10); return Promise.resolve(); } setTimeout(() => notify && notify({ target: { value: new DataView(enc.encode(reply(c)).buffer) } }), 5); }
          return Promise.resolve();
        }
        const svc = { uuid: '0000FFF0-0000-1000-8000-00805F9B34FB', getCharacteristics: () => Promise.resolve([rx, tx]) };
        /* the CX also exposes a firmware-update service (FEF5) whose characteristics notify and write but never answer; Bluefy lists it first */
        const dead = { uuid: '0000FEF5-0000-1000-8000-00805F9B34FB', getCharacteristics: () => Promise.resolve([
          { uuid: '5F78DF94-798C-46F5-990A-B3EB6A065C88', properties: { notify: true, read: true }, addEventListener: () => {}, startNotifications: () => Promise.resolve() },
          { uuid: '8082CAA8-41A6-4021-91C6-56F9B954CC34', properties: { write: true }, writeValue: () => Promise.reject(new Error('')), writeValueWithResponse: () => Promise.reject(new Error('')) }]) };
        const info = { uuid: '0000180A-0000-1000-8000-00805F9B34FB', getCharacteristics: () => Promise.resolve([{ uuid: '00002A29-0000-1000-8000-00805F9B34FB', properties: { read: true } }]) };
        gatt.connect = () => { connects++; gatt.connected = true; return Promise.resolve({ getPrimaryServices: () => Promise.resolve([dead, info, svc]) }); };
        gatt.disconnect = () => { gatt.connected = false; };
        dev.gatt = gatt; return dev;
      }
      Object.defineProperty(navigator, 'bluetooth', { value: { requestDevice: () => Promise.resolve(makeDevice()), getAvailability: () => Promise.resolve(true) } });
      window.__connects = () => connects;
    }, mode);
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + ROOT + '/index.html'); await p.waitForTimeout(400);
    await p.evaluate(() => __v60.go('live'));
    await p.click('#lk-btnConnect');
    if (mode === 'drop-once') {
      await p.waitForFunction(() => /Connected to/.test(document.getElementById('lk-connText').textContent), null, { timeout: 30000 }).catch(() => {});
      const txt = await p.textContent('#lk-connText'), log = await p.inputValue('#lk-log');
      ok(/Connected to OBDLink CX/.test(txt), 'drop right after connecting: retried and connected (' + txt + ')');
      ok(/retrying once/.test(log) && /GATT reconnected/.test(log), 'log shows the drop and the retry');
      ok(/using known service fff0: notify fff1, write fff2/.test(log) && /service fef5:/.test(log), 'picked the CX serial service over the firmware-update one, whatever the letter case: ' + (log.match(/using [^\n]*/) || [''])[0]);
      ok(await p.evaluate(() => window.__connects()) === 2, 'reconnected without a second picker');
    } else if (mode === 'drop-after-atz') {
      const t0 = Date.now();
      await p.waitForFunction(() => /Connected to/.test(document.getElementById('lk-connText').textContent), null, { timeout: 30000 }).catch(() => {});
      const txt = await p.textContent('#lk-connText'), log = await p.inputValue('#lk-log');
      ok(/Connected to OBDLink CX/.test(txt), 'drop after the ATZ reset: retried with a warm start and connected (' + txt + ')');
      ok(/last command sent: ATZ/.test(log) && /ATWS/.test(log), 'log names the command before the drop and the warm start'); if (!/last command sent: ATZ/.test(log)) console.log(log);
      ok(Date.now() - t0 < 5000, 'no 6-second wait for a reply that cannot come (' + (Date.now() - t0) + ' ms)');
    } else {
      await p.waitForFunction(() => /Close the OBDLink|answered but|permission|pair with/i.test(document.getElementById('lk-connText').textContent), null, { timeout: 40000 }).catch(() => {});
      const txt = await p.textContent('#lk-connText');
      ok(/Close the OBDLink app/.test(txt), 'keeps dropping: plain advice shown (' + txt + ')'); if (!/Close the OBDLink/.test(txt)) console.log(await p.inputValue('#lk-log'));
      ok(!(await p.evaluate(() => document.getElementById('lk-connFail').hidden)), 'copy-the-log button shown after the failure');
      await p.reload(); await p.waitForTimeout(600); await p.evaluate(() => __v60.go('live'));
      const kept = await p.inputValue('#lk-log');
      ok(/connect failed/.test(kept) && /page loaded/.test(kept), 'adapter log survives a reload');
    }
    ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs));
    await ctx.close();
  }
  await b.close();
})();
