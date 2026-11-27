/* The phone's motion sensors in a drive report (bridge/drives.js, 2026-11-27), no browser or car needed. A made-up
   15-minute drive is uploaded the way the iPhone app sends it (engine readings plus one motion line a second from
   ios/V60App/Motion.swift), with: the phone's level axis 1 pointing forward, a vertical shake at once per wheel turn
   (a wheel 2.05 m around) at highway speed, side-to-side shake three times stronger while braking, a 0.3 g stop, a
   turn, and a few seconds when the phone was picked up. Checks the analysis finds each of those, the report page
   shows them, and a drive with no motion lines still builds as before. */
const path = require('path'), fs = require('fs'), os = require('os');
const { pathToFileURL } = require('url');
function ok(c, m) { if (!c) { console.log('FAIL', m); process.exitCode = 1; } else console.log(' ok', m); }
const BRIDGE = path.resolve(__dirname, '..', 'bridge');

(async () => {
  const data = fs.mkdtempSync(path.join(os.tmpdir(), 'v60motion-'));
  process.env.V60_DATA = data;
  const D = await import(pathToFileURL(path.join(BRIDGE, 'drives.js')).href);
  const G = 9.80665, MPH = 0.44704, t0 = Date.parse('2026-11-27T15:00:00Z');
  // speed profile, one reading a second: 0→60 mph, cruise, a hard stop from 60 at 0.3 g, back to 45, a turn, park
  const speed = [];
  for (let i = 0; i < 60; i++) speed.push(i);                     // accelerate 1 mph/s
  for (let i = 0; i < 600; i++) speed.push(60);                   // cruise 10 min
  for (let v = 60; v > 0; v -= 0.3 * G / MPH) speed.push(v);      // 0.3 g stop (about 6.6 mph/s)
  for (let i = 0; i < 45; i++) speed.push(i);
  for (let i = 0; i < 180; i++) speed.push(45);
  for (let v = 45; v > 0; v -= 0.3 * G / MPH) speed.push(v);      // a second hard stop
  const lines = [];
  let prev = 0;
  speed.forEach((mph, i) => {
    const t = t0 + i * 1000, accelMg = ((mph - prev) * MPH / 1 / G) * 1000; prev = mph;
    lines.push(JSON.stringify({ t, v: { '0D': [Math.round(mph / 0.621371)], '0C': [12, 0] } }));
    const braking = accelMg < -100 && mph > 25, turning = i >= 700 && i < 720;
    const wheelHz = (mph * MPH) / 2.05, picked = i >= 300 && i < 305;
    lines.push(JSON.stringify({ t: t + 500, m: { v: 18, h: braking ? 36 : 12, vf: mph >= 40 ? Math.round(wheelHz * 10) : 150, va: mph >= 40 ? 9 : 3, hf: 120, ha: 4,
      a1: Math.round(accelMg), a2: 3, a3: 0, yr: turning ? 200 : 0, mv: picked ? 120 : 2 } }));
  });
  const sent = [];
  const ctx = { toPhone: (o) => sent.push(o), record: () => {} };
  const id = '20261127-150000';
  for (let p = 0; p * 300 < lines.length; p++) D.onMessage({ t: 'drive', id, part: p, lines: lines.slice(p * 300, p * 300 + 300) }, ctx);
  const r = D.onMessage({ t: 'driveEnd', id }, ctx);
  ok(r && sent.some((o) => o.t === 'driveAck' && o.id === id), 'drive with motion lines uploads and builds');
  const st = JSON.parse(fs.readFileSync(path.join(data, 'drives', id + '.json'), 'utf8')).stats;
  ok(Math.abs(st.miles - 13.4) < 1.5 && st.n === speed.length, `engine readings unaffected by the motion lines: ${st.n} readings, ${st.miles.toFixed(1)} mi`);
  const mo = st.motion;
  ok(mo && mo.usable && mo.moved === 5 && mo.seconds === speed.length - 5, 'seconds when the phone moved are dropped: ' + (mo && mo.moved));
  ok(mo.forward, 'the forward axis is found from the car\'s own speed changes');
  ok(Math.abs(mo.brakeG - 0.3) < 0.05, 'hardest braking about 0.3 g: ' + mo.brakeG.toFixed(2));
  const cornerExpected = (20 * Math.PI / 180) * 45 * MPH / G; // 20 deg/s at 45 mph
  ok(Math.abs(mo.cornerG - cornerExpected) < 0.03, `hardest cornering from turn rate × speed: ${mo.cornerG.toFixed(2)} g (expected ${cornerExpected.toFixed(2)})`);
  ok(mo.wheel && mo.wheel.once > 0.9 && Math.abs(mo.wheel.circ - 2.05) < 0.1, `shake at once per wheel turn found: ${mo.wheel && Math.round(mo.wheel.once * 100)}%, wheel ${mo.wheel && mo.wheel.circ.toFixed(2)} m`);
  ok(mo.brake && Math.abs(mo.brake.ratio - 3) < 0.3, 'vibration while braking about 3× steady: ' + (mo.brake && mo.brake.ratio.toFixed(1)));
  ok(mo.bands.some((b) => b.lo === 60 && b.n > 500), 'vibration table has the 60-70 mph band');
  const html = fs.readFileSync(path.join(data, 'drives', id + '.html'), 'utf8');
  ok(/Vibration, braking and cornering/.test(html) && /brake judder/.test(r.summary) && /once per wheel turn/.test(r.summary), 'the report page and the summary for Claude say so');
  const feed = D.list().map((d) => d.stats.motion && d.stats.motion.usable);
  ok(feed[0] === true, 'the drive list keeps the motion results');

  // a drive recorded before this feature: no motion lines, same report as before
  const id2 = '20261126-120000';
  D.onMessage({ t: 'drive', id: id2, part: 0, lines: lines.filter((l) => !l.includes('"m"')).slice(0, 200) }, ctx);
  const r2 = D.onMessage({ t: 'driveEnd', id: id2 }, ctx);
  const st2 = JSON.parse(fs.readFileSync(path.join(data, 'drives', id2 + '.json'), 'utf8')).stats;
  ok(r2 && st2.motion === null && !/Phone sensors/.test(r2.summary) && !/Vibration, braking/.test(fs.readFileSync(path.join(data, 'drives', id2 + '.html'), 'utf8')), 'a drive without motion lines builds as before');
  fs.rmSync(data, { recursive: true, force: true });
})();
