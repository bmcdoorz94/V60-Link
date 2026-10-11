  /* ---------------- Garage additions: saved data ---------------- */
  function data() { var d = api.mod("live"); if (!d) { d = { trips: [], scans: [], runs: [] }; api.setMod("live", d); } return d; }
  function saveScan(r) {
    var d = data();
    d.scans.push({ date: r.date, mil: !!r.mil, codes: (r.codes || []).slice(0, 40), monitors: (r.monitors || []).slice(0, 12), freeze: r.freeze || null, since: r.since || {}, sim: !!(link && link.name === "Simulated V60") });
    if (d.scans.length > 30) d.scans.shift();
    api.save(); api.updateHud();
  }
  function fmtDur(s) { s = Math.round(s); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }
  function renderHistory() {
    var d = data();
    $("trips").innerHTML = d.trips.length ? d.trips.slice().reverse().slice(0, 8).map(function (t) {
      return '<li><span class="pill info">' + esc(String(t.date).slice(5, 10)) + "</span><b>" + t.mi.toFixed(1) + " mi in " + fmtDur(t.dur) + (t.sim ? " (simulated)" : "") + '</b><span class="d">Top ' + Math.round(t.maxMph) + " mph · moving average " + Math.round(t.avgMph) + " mph · idling " + Math.round(t.idlePct) + "%" + (isNum(t.maxCoolF) ? " · coolant peak " + Math.round(t.maxCoolF) + " °F" : "") + (isNum(t.ltft) ? " · long-term trim " + t.ltft.toFixed(1) + "%" : "") + "</span></li>";
    }).join("") : '<li><span class="pill info">None</span><span>Record a drive to log a trip.</span></li>';
    $("scans").innerHTML = d.scans.length ? d.scans.slice().reverse().slice(0, 8).map(function (s) {
      var nr = (s.monitors || []).filter(function (m) { return !m.ready; }).length, codes = (s.codes || []).map(function (c) { return c.code + " (" + c.kind + ")"; });
      return '<li><span class="pill ' + (s.mil ? "bad" : (codes.length ? "watch" : "ok")) + '">' + (s.mil ? "Light on" : (codes.length ? "Codes" : "Clean")) + "</span><b>" + esc(String(s.date).slice(0, 10)) + (s.sim ? " (simulated)" : "") + '</b><span class="d">' + (codes.length ? esc(codes.join(", ")) : "No codes") + " · " + nr + " monitor" + (nr === 1 ? "" : "s") + " not ready" + (s.freeze ? " · freeze frame from " + esc(s.freeze.dtc) + ": " + esc(s.freeze.values.map(function (v) { return v[0] + " " + v[1]; }).join(", ")) : "") + "</span></li>";
    }).join("") : '<li><span class="pill info">None</span><span>Save a health check to start the history.</span></li>';
  }

  /* ---------------- gauge cluster ---------------- */
  var DIALS = [
    { k: "rpm", n: "RPM", pids: [0x0C], lo: 0, hi: 7000, hot: 6000, v: function (r) { return r[0x0C]; }, f: function (v) { return Math.round(v / 10) * 10; } },
    { k: "spd", n: "mph", pids: [0x0D], lo: 0, hi: 130, v: function (r) { return isNum(r[0x0D]) ? r[0x0D] * 0.621371 : null; }, f: function (v) { return Math.round(v); } },
    { k: "boost", n: "boost psi", pids: [0x0B, 0x33], lo: -15, hi: 22, v: function (r) { return isNum(r[0x0B]) && isNum(lastBaro) ? (r[0x0B] - lastBaro) * 0.145038 : null; }, f: function (v) { return v.toFixed(1); } },
    { k: "cool", n: "coolant °F", pids: [0x05], lo: 100, hi: 260, hot: 230, v: function (r) { return isNum(r[0x05]) ? r[0x05] * 1.8 + 32 : null; }, f: function (v) { return Math.round(v); } },
    { k: "volt", n: "volts", pids: [0x42], lo: 10, hi: 16, v: function (r) { return r[0x42]; }, f: function (v) { return v.toFixed(1); } },
    { k: "ltft", n: "LT fuel trim %", pids: [0x07], lo: -25, hi: 25, hot: 10, abs: true, v: function (r) { return r[0x07]; }, f: function (v) { return (v > 0 ? "+" : "") + v.toFixed(1); } }
  ];
  var lastBaro = null;
  function activeDials() { return DIALS.filter(function (g) { return g.pids.every(function (p) { return live.sel[p] && pidSupported(p); }); }); }
  function renderCluster() {
    var ds = activeDials();
    $("cluster").innerHTML = ds.length ? ds.map(function (g) {
      return '<div class="dial"><svg viewBox="0 0 120 92" aria-hidden="true"><path class="dtrack" d="M17 84 A50 50 0 1 1 103 84" pathLength="100"/><path class="dfill" id="lk-df-' + g.k + '" d="M17 84 A50 50 0 1 1 103 84" pathLength="100" stroke-dasharray="0 100"/></svg><div class="dv" id="lk-dv-' + g.k + '">--</div><div class="dl">' + esc(g.pids.length === 1 && window.V60_CB && !window.V60_CB.decoded("pid:" + hex2(g.pids[0])) ? "PID " + hex2(g.pids[0]) : g.n) + "</div></div>";
    }).join("") : '<p class="status">Connect and pick channels such as RPM, speed, coolant or intake pressure to see gauges.</p>';
  }
  function updateDials(row) {
    activeDials().forEach(function (g) {
      var v = g.v(row); if (!isNum(v)) return;
      var pct = Math.max(0, Math.min(100, (v - g.lo) / (g.hi - g.lo) * 100)), f = $("df-" + g.k), t = $("dv-" + g.k);
      if (f) { f.setAttribute("stroke-dasharray", pct.toFixed(1) + " 100"); f.classList.toggle("hot", g.hot != null && (g.abs ? Math.abs(v) >= g.hot : v >= g.hot)); }
      if (t) t.textContent = g.f(v);
    });
  }

  /* ---------------- 0-60 timer ---------------- */
  var zero = { armed: false, running: false, start: 0, prevT: 0, prevMph: 0 };
  function renderZero() {
    var runs = data().runs, best = runs.filter(function (r) { return !r.sim; }).reduce(function (b, r) { return b == null || r.t < b ? r.t : b; }, null);
    $("zruns").innerHTML = runs.slice().reverse().slice(0, 5).map(function (r) { return "<li><b>" + r.t.toFixed(2) + " s</b> " + esc(String(r.date).slice(0, 10)) + (r.sim ? " (simulated)" : "") + "</li>"; }).join("");
    $("zs").textContent = best != null ? "Your best: " + best.toFixed(2) + " s. Polestar's sheet lists 6.4 s for a stock car like yours." : (zero.armed ? "" : "Polestar's sheet lists 6.4 s for a stock car like yours.");
  }
  $("zArm").addEventListener("click", function () {
    if (zero.armed || zero.running) { zero.armed = zero.running = false; $("zArm").textContent = "Arm 0–60"; $("zs").textContent = "Disarmed."; return; }
    if (!pidSupported(0x0D)) { $("zs").textContent = "The car is not reporting speed."; return; }
    PIDS.forEach(function (p) { live.sel[p.pid] = p.pid === 0x0D; });
    zero.armed = true; zero.running = false; $("zt").textContent = "0.00"; $("zArm").textContent = "Disarm";
    $("zs").textContent = "Armed. Recording speed only for the fastest updates. Come to a full stop first.";
    if (!live.on) { renderPicks(); live.on = true; live.t0 = Date.now(); live.rows = []; $("btnLive").textContent = "Stop recording"; trip.reset(); wake(true); loop(); }
  });
  function zeroSpeed(kmh) {
    var now = Date.now(), mph = kmh * 0.621371;
    if (zero.armed && !zero.running) {
      if (kmh <= 0.5) { zero.prevT = now; zero.prevMph = 0; $("zs").textContent = "Ready. Timing starts when the wheels roll."; return; }
      if (zero.prevT && zero.prevMph === 0) { zero.running = true; zero.start = (zero.prevT + now) / 2; $("zs").textContent = "Timing..."; }
    }
    if (zero.running) {
      if (mph >= 60) {
        var tCross = zero.prevT + (now - zero.prevT) * ((60 - zero.prevMph) / Math.max(0.1, mph - zero.prevMph));
        var secs = (tCross - zero.start) / 1000;
        zero.running = false; zero.armed = false; $("zArm").textContent = "Arm 0–60"; $("zt").textContent = secs.toFixed(2);
        var d = data(); d.runs.push({ date: api.todayStr(), t: +secs.toFixed(2), sim: !!(link && link.name === "Simulated V60") }); if (d.runs.length > 30) d.runs.shift(); api.save(); renderZero();
        $("zs").textContent = secs.toFixed(2) + " s. Saved.";
      } else { $("zt").textContent = ((now - zero.start) / 1000).toFixed(1); if (kmh <= 0.5) { zero.running = false; $("zs").textContent = "Stopped before 60. Still armed."; zero.prevT = now; zero.prevMph = 0; return; } }
    }
    zero.prevT = now; zero.prevMph = mph;
  }

  /* ---------------- trips + drive-cycle coach ---------------- */
  var coach = { cold: null, warm: false, idleEarly: 0, cruise: 0, decels: 0, peak: 0 };
  var trip = {
    s: null,
    reset: function () { trip.s = { start: new Date().toISOString(), n: 0, lastT: 0, km: 0, maxKmh: 0, movSec: 0, movKm: 0, idleSec: 0, maxCool: null, ltSum: 0, ltN: 0 }; },
    add: function (row) {
      var s = trip.s; if (!s) return;
      var dt = Math.max(0, Math.min(5, row.t - s.lastT)); s.lastT = row.t; s.n++;
      var kmh = row[0x0D], rpm = row[0x0C];
      if (isNum(kmh)) {
        s.km += kmh * dt / 3600; s.maxKmh = Math.max(s.maxKmh, kmh);
        if (kmh > 1) { s.movSec += dt; s.movKm += kmh * dt / 3600; } else if (!isNum(rpm) || rpm > 300) s.idleSec += dt;
        var mph = kmh * 0.621371;
        if (mph >= 40 && mph <= 62 && Math.abs(mph - (coach.lastMph || mph)) < 3) coach.cruise += dt;
        if (mph > coach.peak) coach.peak = mph;
        if (coach.peak >= 40 && mph < 25) { coach.decels++; coach.peak = mph; }
        if (mph < 1 && row.t < 300) coach.idleEarly += dt;
        coach.lastMph = mph;
      }
      if (isNum(row[0x05])) { s.maxCool = s.maxCool == null ? row[0x05] : Math.max(s.maxCool, row[0x05]); if (coach.cold == null) coach.cold = row[0x05] < 40; if (row[0x05] >= 80) coach.warm = true; }
      if (isNum(row[0x07])) { s.ltSum += row[0x07]; s.ltN++; }
      if (s.n % 10 === 0) renderCoach();
    },
    finish: function () {
      var s = trip.s; trip.s = null; if (!s || s.lastT < 60 || s.n < 10) return;
      var d = data(), dur = s.lastT;
      d.trips.push({ date: s.start, dur: dur, mi: s.km * 0.621371, maxMph: s.maxKmh * 0.621371, avgMph: s.movSec ? s.movKm / s.movSec * 3600 * 0.621371 : 0, idlePct: dur ? s.idleSec / dur * 100 : 0, maxCoolF: s.maxCool == null ? null : s.maxCool * 1.8 + 32, ltft: s.ltN ? s.ltSum / s.ltN : null, sim: !!(link && link.name === "Simulated V60") });
      if (d.trips.length > 60) d.trips.shift();
      api.save(); renderHistory(); renderCoach();
    }
  };
  var STEPS = [
    { k: "cold", t: "Start from cold", d: "Parked at least 8 hours, fuel between 1/4 and 3/4 tank. The evaporative test usually runs only after a cold soak.", mons: ["Evaporative system"], done: function () { return coach.cold === true; } },
    { k: "idle", t: "Idle 2 minutes, then drive off gently", d: "Lets the oxygen sensor heaters and early checks run.", mons: ["Oxygen sensor heater"], done: function () { return coach.idleEarly >= 120; } },
    { k: "warm", t: "Reach full temperature", d: "Coolant at 176 °F (80 °C) or more.", mons: ["Oxygen sensor heater", "Components"], done: function () { return coach.warm; } },
    { k: "cruise", t: "Steady cruise at 45–60 mph for 5 minutes", d: "Light, even throttle. This is when the catalyst and oxygen sensor tests run.", mons: ["Catalyst", "Oxygen sensor", "Heated catalyst"], done: function () { return coach.cruise >= 300; } },
    { k: "decel", t: "Three long coast-downs from 40+ mph", d: "Lift off and coast without hard braking where it is safe. Fuel cut-off lets the sensors and valve timing be checked.", mons: ["Oxygen sensor", "EGR / VVT", "Fuel system"], done: function () { return coach.decels >= 3; } }
  ];
  function renderCoach() {
    var R = report || (data().scans.length ? data().scans[data().scans.length - 1] : null);
    var pending = R ? (R.monitors || []).filter(function (m) { return !m.ready; }).map(function (m) { return m.n; }) : [];
    var head = R ? (pending.length ? '<li class="chead">Not ready: ' + pending.map(function (n) { return '<span class="pill watch">' + esc(n) + "</span>"; }).join(" ") + "</li>" : '<li class="chead"><span class="pill ok">All ready</span> Nothing to complete. The steps still show what the computer tests.</li>') : '<li class="chead">Run a health check to see which monitors are unfinished.</li>';
    $("coach").innerHTML = head + STEPS.map(function (s) {
      var rel = s.mons.some(function (m) { return pending.indexOf(m) >= 0; }), ok = s.done();
      return '<li class="' + (ok ? "done" : "") + (rel ? " rel" : "") + '"><span class="cdot" aria-hidden="true">' + (ok ? "✓" : "") + "</span><span><b>" + esc(s.t) + "</b>" + (rel ? ' <span class="pill watch">helps</span>' : "") + '<span class="d">' + esc(s.d) + "</span></span></li>";
    }).join("");
  }
  function onValue(pid, v) {
    if (pid === 0x33) lastBaro = v;
    if (pid === 0x0D && (zero.armed || zero.running)) zeroSpeed(v);
  }
  var wl = null;
  function wake(on) {
    try {
      if (on && $("wake").checked && navigator.wakeLock) navigator.wakeLock.request("screen").then(function (l) { wl = l; }).catch(function () {});
      else if (!on && wl) { wl.release(); wl = null; }
    } catch (e) {}
  }
