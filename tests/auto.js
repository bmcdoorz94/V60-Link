/* Connect by itself (tools/gen/live_auto.js) against a mocked Web Bluetooth adapter that sleeps while the car is off.
   Plays a day: page opens with the car off (waits, no picker, adapter not forgotten), ignition on (connects with no tap,
   keeps the screen on), ignition off (lets the screen sleep, goes back to waiting), a manual Disconnect (stays off),
   an adapter that never answers (gives up after 20 s and tries again), and a phone that never chose an adapter. */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const path = require('path'); const ROOT = path.resolve(__dirname, '..');
function ok(c, m) { if (!c) { console.log('FAIL', m); process.exitCode = 1; } else console.log(' ok', m); }
const mock = (opts) => {
  window.__V60_TEST = true;
  if (opts.known) localStorage.setItem('v60-link-dev', 'OBDLink CX');
  localStorage.setItem('v60-link-auto', '1');
  const S = window.__bt = { car: 'off', connects: 0, picker: 0, wl: 0, wlRel: 0, dim: [] };
  const dec = new TextDecoder(), enc = new TextEncoder();
  const dev = new EventTarget(); dev.name = 'OBDLink CX';
  const gatt = { connected: false };
  let notify = null, buf = '';
  const reply = (c) => /^0100/.test(c) ? '7E8 06 41 00 BE 3F A8 13 00\r\r>' : /^ATDPN/.test(c) ? 'A6\r\r>' : /^01/.test(c) ? 'NO DATA\r\r>' : 'OK\r\r>';
  const rx = { uuid: '0000fff1-0000-1000-8000-00805f9b34fb', properties: { notify: true }, addEventListener: (t, f) => { notify = f; }, startNotifications: () => Promise.resolve() };
  const tx = { uuid: '0000fff2-0000-1000-8000-00805f9b34fb', properties: { write: true }, writeValue: (v) => send(v), writeValueWithResponse: (v) => send(v) };
  function send(v) {
    if (!gatt.connected) { const e = new Error('GATT Server is disconnected.'); e.name = 'NetworkError'; return Promise.reject(e); }
    buf += dec.decode(v);
    if (buf.indexOf('\r') >= 0) { const c = buf.trim(); buf = ''; setTimeout(() => notify && notify({ target: { value: enc.encode(reply(c)) } }), 5); }
    return Promise.resolve();
  }
  const svc = { uuid: '0000FFF0-0000-1000-8000-00805F9B34FB', getCharacteristics: () => Promise.resolve([rx, tx]) };
  gatt.connect = () => {
    S.connects++;
    if (S.car === 'hang') return new Promise(() => {}); // iOS waits for a known peripheral that is not there
    if (S.car === 'off') { const e = new Error('Bluetooth device is no longer in range.'); e.name = 'NetworkError'; return Promise.reject(e); }
    gatt.connected = true; return Promise.resolve({ getPrimaryServices: () => Promise.resolve([svc]) });
  };
  gatt.disconnect = () => { if (gatt.connected) { gatt.connected = false; dev.dispatchEvent(new Event('gattserverdisconnected')); } };
  dev.gatt = gatt;
  dev.watchAdvertisements = () => { S.watching = true; return Promise.resolve(); };
  S.ignition = (on) => {
    S.car = on;
    if (on === 'on') dev.dispatchEvent(new Event('advertisementreceived'));
    if (on === 'off' && gatt.connected) { gatt.connected = false; dev.dispatchEvent(new Event('gattserverdisconnected')); }
  };
  Object.defineProperty(navigator, 'bluetooth', { value: {
    requestDevice: () => { S.picker++; return Promise.reject(Object.assign(new Error('picker'), { name: 'NotFoundError' })); },
    getDevices: () => Promise.resolve(opts.known ? [dev] : []), getAvailability: () => Promise.resolve(true),
    setScreenDimEnabled: (on) => { S.dim.push(on); } } });
  Object.defineProperty(navigator, 'wakeLock', { value: { request: () => { S.wl++; return Promise.resolve({ release: () => { S.wlRel++; return Promise.resolve(); } }); } } });
};

(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(mock, { known: true });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  const conn = () => p.textContent('#lk-connText');
  const bt = () => p.evaluate(() => ({ ...window.__bt, ignition: undefined }));
  const until = (re, ms = 15000) => p.waitForFunction((s) => new RegExp(s).test(document.getElementById('lk-connText').textContent), re.source, { timeout: ms }).catch(() => {});
  await p.goto('file://' + ROOT + '/index.html');
  await p.evaluate(() => __v60.go('live'));

  /* 1. car off: waits by itself, never opens the picker, keeps the adapter */
  await until(/Waiting for the adapter/);
  let s = await bt();
  ok(/Waiting for the adapter/.test(await conn()), 'car off: says it is waiting for the adapter (' + await conn() + ')');
  ok(s.connects >= 1 && s.picker === 0, 'tried the remembered adapter with no tap and no picker (' + s.connects + ' tries)');
  ok(await p.evaluate(() => localStorage.getItem('v60-link-dev')) === 'OBDLink CX', 'a failed try does not forget the adapter');
  ok(await p.isChecked('#lk-autoOn'), 'the Connect by itself switch shows on');

  /* 2. ignition on: the adapter advertises and the page connects at once, then keeps the screen on */
  const before = s.connects;
  await p.evaluate(() => window.__bt.ignition('on'));
  await until(/Connected to/, 8000);
  await p.waitForTimeout(3500);
  s = await bt();
  ok(/Connected to OBDLink CX/.test(await conn()), 'ignition on: connected by itself (' + await conn() + ')');
  ok(s.connects === before + 1 && s.watching, 'woke on the adapter advertising, not a long timer');
  ok(s.wl >= 1 && s.dim.includes(false), 'asks to keep the screen on while connected (wake lock and Bluefy dim off)');
  ok(/connect by itself: connected/.test(await p.inputValue('#lk-log')), 'adapter log notes it connected by itself');

  /* 3. ignition off: lets the screen sleep and waits again */
  await p.evaluate(() => window.__bt.ignition('off'));
  await until(/Waiting for the adapter/, 8000);
  await p.waitForTimeout(3500);
  s = await bt();
  ok(/Waiting for the adapter/.test(await conn()), 'ignition off: back to waiting (' + await conn() + ')');
  ok(s.wlRel >= 1 && s.dim[s.dim.length - 1] === true, 'lets the screen sleep again');

  /* 4. a manual Disconnect is respected */
  await p.evaluate(() => window.__bt.ignition('on'));
  await until(/Connected to/, 8000);
  await p.click('#lk-btnDisconnect');
  const n0 = (await bt()).connects;
  await p.evaluate(() => window.__bt.ignition('on'));
  await p.waitForTimeout(4000);
  ok((await bt()).connects === n0 && /Disconnected/.test(await conn()), 'after Disconnect it stays off (' + await conn() + ')');
  ok(/Paused after Disconnect/.test(await p.textContent('#lk-autoSt')), 'and says why');

  /* 5. an adapter that never answers: gives up after 20 s instead of hanging */
  await p.evaluate(() => { window.__bt.car = 'hang'; });
  await p.click('#lk-autoOn'); await p.click('#lk-autoOn'); // off and on again: a fresh start
  await p.waitForTimeout(1500);
  ok(/Looking for the adapter/.test(await conn()), 'trying a silent adapter (' + await conn() + ')');
  await until(/Waiting for the adapter/, 26000);
  ok(/Waiting for the adapter/.test(await conn()), 'gave up after 20 s and waits to try again (' + await conn() + ')');

  /* 6. switching it off stops the tries */
  await p.click('#lk-autoOn');
  const n1 = (await bt()).connects;
  await p.evaluate(() => { window.__bt.car = 'on'; });
  await p.waitForTimeout(4000);
  ok((await bt()).connects === n1 && await p.evaluate(() => localStorage.getItem('v60-link-auto')) === null, 'switched off: no more tries, setting cleared');
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs));
  await ctx.close();

  /* 7. a phone that never chose an adapter: asks for one tap, no picker */
  const ctx2 = await b.newContext({ viewport: { width: 390, height: 844 } });
  await ctx2.addInitScript(mock, { known: false });
  const q = await ctx2.newPage(); const errs2 = []; q.on('pageerror', (e) => errs2.push(e.message));
  await q.goto('file://' + ROOT + '/index.html');
  await q.evaluate(() => __v60.go('live'));
  await q.waitForTimeout(2500);
  ok(/Tap Connect adapter once/.test(await q.textContent('#lk-autoSt')) && (await q.evaluate(() => window.__bt.picker)) === 0, 'no adapter chosen yet: asks for one tap, opens no picker');
  await q.screenshot({ path: path.join(ROOT, 'tests', 'shots', 'auto-connect.png'), fullPage: false });
  ok(errs2.length === 0, 'no page errors ' + JSON.stringify(errs2));
  await ctx2.close();
  await b.close();
})();
