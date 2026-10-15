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
        /* live values like Kyle's car at idle on 2026-10-15: 915 rpm, 5 km/h, coolant 83 °C, long-term trim +14.8 %, 14.3 V */
        const LIVE = { '010C': '7E8 04 41 0C 0E 4C', '010D': '7E8 03 41 0D 05', '0105': '7E8 03 41 05 7B', '0107': '7E8 03 41 07 93', '0142': '7E8 04 41 42 37 DC', '0120': '7E8 06 41 20 00 00 00 01', '0140': '7E8 06 41 40 40 00 00 00' };
        const reply = cmd => {
          if (/^0100/.test(cmd)) return '7E8 06 41 00 BE 3F A8 13 00\r\r>';
          if (/^ATDPN/.test(cmd)) return 'A6\r\r>';
          if (LIVE[cmd.slice(0, 4)]) return LIVE[cmd.slice(0, 4)] + '\r\r>';
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
      /* the dashboard has its own start button and its gauges fill with the car's numbers */
      ok(await p.evaluate(() => { const g = document.getElementById('lk-dashGo'); return !g.disabled && /Start gauges/.test(g.textContent); }), 'Start gauges is ready once connected');
      await p.click('#lk-dashGo');
      const dials = await p.waitForFunction(() => { const v = id => (document.getElementById('lk-dv-' + id) || {}).textContent; return /\d/.test(v('rpm')) && /\d/.test(v('cool')) && /\d/.test(v('ltft')) ? { rpm: v('rpm'), spd: v('spd'), cool: v('cool'), volt: v('volt'), ltft: v('ltft') } : null; }, null, { timeout: 15000 }).then(h => h.jsonValue()).catch(() => null);
      ok(dials && dials.rpm === '920' && dials.cool === '181' && dials.ltft === '+14.8' && dials.spd === '3', 'gauges show the car: ' + JSON.stringify(dials));
      ok(/Stop gauges/.test(await p.textContent('#lk-dashGo')) && /Stop recording/.test(await p.textContent('#lk-btnLive')), 'Dashboard and Live data agree that it is reading');
      await p.click('#lk-dashGo'); await p.waitForTimeout(300);
      ok(/Start gauges/.test(await p.textContent('#lk-dashGo')) && /Start recording/.test(await p.textContent('#lk-btnLive')), 'Stop gauges stops the reading');
      /* drive mode opens for everyone, starts the gauges itself, and stops them on exit */
      await p.click('#lk-driveBtn');
      ok(await p.isVisible('#lk-drive'), 'Drive mode opens (no skill needed)');
      const big = await p.waitForFunction(() => { const v = id => document.getElementById('lk-dv2-' + id).textContent; return /\d/.test(v('rpm')) && /\d/.test(v('spd')) ? { spd: v('spd'), rpm: v('rpm'), cool: v('cool'), volt: v('volt') } : null; }, null, { timeout: 15000 }).then(h => h.jsonValue()).catch(() => null);
      ok(big && big.rpm === '920' && big.spd === '3' && big.cool === '181' && big.volt === '14.3', 'Drive mode fills its big numbers by itself: ' + JSON.stringify(big));
      await p.click('#lk-driveX'); await p.waitForTimeout(300);
      ok(!(await p.isVisible('#lk-drive')) && /Start recording/.test(await p.textContent('#lk-btnLive')), 'leaving Drive mode stops the reading it started');
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
      ok(await p.evaluate(() => document.getElementById('lk-dashGo').disabled), 'Start gauges stays off while not connected');
      await p.click('#lk-driveBtn');
      ok(await p.isVisible('#lk-drive') && /Not connected/.test(await p.textContent('#lk-dvMsg')), 'Drive mode without a connection says so on the big screen');
      await p.click('#lk-driveX');
      await p.reload(); await p.waitForTimeout(600); await p.evaluate(() => __v60.go('live'));
      const kept = await p.inputValue('#lk-log');
      ok(/connect failed/.test(kept) && /page loaded/.test(kept), 'adapter log survives a reload');
    }
    ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs));
    await ctx.close();
  }
  await b.close();
})();
