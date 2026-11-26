  /* ---------------- Deep scan: every module's codes and the engine's own self-test results ----------------
     1. Engine self-tests, OBD mode 06 (SAE J1979): the engine computer's on-board monitor results (misfire counts per
        cylinder, catalyst, oxygen sensors, evaporative system...). Each result comes with the computer's own lower and
        upper limit, so pass or fail needs no unit table; units are shown only where certain (counts).
     2. Every module on the high-speed bus the OBDLink CX reaches, asked for its stored codes with UDS 19 02 FF
        (ISO 14229 ReadDTCInformation, report by status mask): reads only. Codes are shown the way Volvo writes them,
        a letter and six characters (C0077 + failure type 68 = C007768). Module addresses are from P3 sources noted in
        bridge/CLAUDE.md and are unconfirmed on this car until they answer.
     Afterwards the adapter goes back to its normal addressing (ATCRA, ATSH7DF), results are saved in the Garage and
     sent to Kyle's PC (bridge/drives.js, POST /drives/deep), where Claude reads them and a page is built. */
  var DEEP_MODS = [
    ["7E0", "7E8", "Engine (ECM)"], ["7E1", "7E9", "Transmission (TCM)"], ["760", "768", "Brakes and ABS (BCM; also the tire monitor)"],
    ["726", "72E", "Central electronics (CEM)"], ["730", "738", "Power steering (PSCM)"], ["764", "76C", "Forward camera and radar (FSM)"],
    ["797", "79F", "Steering angle sensor (SAS)"], ["756", "75E", "Parking brake (EPB)"], ["734", "73C", "Headlamps (HCM)"]
  ];
  /* OBD monitor IDs (SAE J1979, mode 06); anything not listed shows its number */
  function midName(m) {
    var N = { 0x21: "Catalyst, bank 1", 0x22: "Catalyst, bank 2", 0x31: "EGR, bank 1", 0x35: "Variable valve timing, bank 1", 0x39: "Evaporative system, large leak (0.150 in)",
      0x3A: "Evaporative system, 0.090 in leak", 0x3B: "Evaporative system, small leak (0.040 in)", 0x3C: "Evaporative system, very small leak (0.020 in)", 0x3D: "Evaporative purge flow",
      0x61: "Heated catalyst, bank 1", 0x71: "Secondary air", 0x81: "Fuel system, bank 1", 0x82: "Fuel system, bank 2", 0xA1: "Misfire, all cylinders" };
    if (N[m]) return N[m];
    if (m >= 0x01 && m <= 0x10) return "Oxygen sensor, bank " + (m <= 0x04 ? 1 : m <= 0x08 ? 2 : m <= 0x0C ? 3 : 4) + " sensor " + (((m - 1) % 4) + 1);
    if (m >= 0x41 && m <= 0x50) return "Oxygen sensor heater, bank " + (m <= 0x44 ? 1 : m <= 0x48 ? 2 : m <= 0x4C ? 3 : 4) + " sensor " + (((m - 0x41) % 4) + 1);
    if (m >= 0xA2 && m <= 0xAD) return "Misfire, cylinder " + (m - 0xA1);
    return "Monitor " + hex2(m);
  }
  function tidName(mid, tid) {
    if (mid >= 0xA1 && mid <= 0xAD) return tid === 0x0B ? "average of the last 10 drives" : tid === 0x0C ? "this drive" : "test " + hex2(tid);
    return "test " + hex2(tid);
  }
  var deep = { busy: false, last: null };
  function deepStatus(t) { $("deepStatus").textContent = t; }

  function deepTests() {
    var mids = [];
    var bases = [0x00, 0x20, 0x40, 0x60, 0x80, 0xA0];
    return bases.reduce(function (p, base) {
      return p.then(function (go) {
        if (!go) return false;
        return query("06" + hex2(base), 4000).then(function (res) {
          var r = res.filter(function (x) { return x.data && x.data[1] === base && (x.ecu === "7E8" || x.ecu === "ECU"); })[0];
          if (!r) return false;
          var more = false;
          for (var i = 0; i < 32; i++) if (r.data[2 + (i >> 3)] & (0x80 >> (i & 7))) { var m = base + i + 1; if (m === base + 0x20) more = true; else mids.push(m); }
          return more;
        }, function () { return false; });
      });
    }, Promise.resolve(true)).then(function () {
      var out = [];
      return mids.reduce(function (p, mid) {
        return p.then(function () {
          deepStatus("Engine self-tests: " + midName(mid) + "...");
          return query("06" + hex2(mid), 4000).then(function (res) {
            res.filter(function (x) { return x.data && (x.ecu === "7E8" || x.ecu === "ECU"); }).forEach(function (x) {
              var d = x.data;
              for (var i = 1; i + 8 < d.length; i += 9) {
                var u = d[i + 2], signed = !!(u & 0x80), w = function (j) { var v = (d[j] << 8) | d[j + 1]; return signed && v > 32767 ? v - 65536 : v; };
                var t = { mid: d[i], tid: d[i + 1], uasid: u, value: w(i + 3), min: w(i + 5), max: w(i + 7) };
                t.pass = t.value >= t.min && t.value <= t.max;
                t.name = midName(t.mid); t.test = tidName(t.mid, t.tid);
                out.push(t);
              }
            });
          }, function () {});
        });
      }, Promise.resolve()).then(function () { return out; });
    });
  }

  function deepModules() {
    var out = [];
    return DEEP_MODS.reduce(function (p, m) {
      return p.then(function () {
        deepStatus("Modules: " + m[2] + "...");
        var row = { req: m[0], resp: m[1], name: m[2], answered: false, codes: [] };
        out.push(row);
        return cmd("ATSH" + m[0]).then(function () { return cmd("ATCRA" + m[1]); })
          .then(function () { return query("1902FF", 3000); })
          .then(function (res) {
            res.forEach(function (x) {
              row.answered = true;
              if (x.neg != null) { row.neg = hex2(x.neg); return; }
              var d = x.data;
              for (var i = 3; i + 3 < d.length; i += 4) {
                if (!d[i] && !d[i + 1] && !d[i + 2]) continue;
                var st = d[i + 3];
                row.codes.push({ code: decodeDTC(d[i], d[i + 1]) + hex2(d[i + 2]), status: st,
                  label: st & 0x01 ? "active now" : st & 0x08 ? "stored" : st & 0x04 ? "pending" : "history",
                  light: !!(st & 0x80) });
              }
            });
          }, function () {});
      });
    }, Promise.resolve()).then(function () {
      deepStatus("Putting the adapter back to normal...");
      return cmd("ATCRA").catch(function () {}).then(function () { return cmd("ATSH7DF").catch(function () {}); });
    }).then(function () { return out; });
  }

  function deepSummary(R) {
    var answered = R.modules.filter(function (m) { return m.answered; });
    var codes = [];
    R.modules.forEach(function (m) { m.codes.forEach(function (c) { codes.push(m.name.split(" (")[0] + " " + c.code + " (" + c.label + ")"); }); });
    var failed = R.tests.filter(function (t) { return !t.pass; }).map(function (t) { return t.name + " " + t.test; });
    var misfire = R.tests.filter(function (t) { return t.mid >= 0xA2 && t.mid <= 0xAD && t.tid === 0x0C; }).map(function (t) { return "cyl " + (t.mid - 0xA1) + ": " + t.value; });
    return answered.length + " of " + R.modules.length + " modules answered. Codes: " + (codes.join("; ") || "none") + ". Engine self-tests: " + R.tests.length + " results, " +
      (failed.length ? failed.length + " outside limits (" + failed.join("; ") + ")" : "all within limits") + "." + (misfire.length ? " Misfires this drive, " + misfire.join(", ") + "." : "");
  }

  function renderDeep(R) {
    $("deepOut").hidden = false;
    var silent = R.modules.filter(function (m) { return !m.answered; });
    $("mods").innerHTML = R.modules.filter(function (m) { return m.answered; }).map(function (m) {
      var pill = !m.answered || m.neg ? "info" : m.codes.some(function (c) { return c.label === "active now" || c.label === "stored"; }) ? "bad" : m.codes.length ? "watch" : "ok";
      var word = !m.answered ? "No answer" : m.neg ? "Declined" : m.codes.length ? m.codes.length + " code" + (m.codes.length === 1 ? "" : "s") : "Clean";
      var detail = !m.answered ? "No reply at " + m.req + ". The address is unconfirmed on this car." : m.neg ? "Answered but declined the request (code " + m.neg + ")." :
        m.codes.map(function (c) { return c.code + ", " + c.label + (c.light ? ", asks for a warning light" : ""); }).join(" · ");
      return '<li><span class="pill ' + pill + '">' + esc(word) + "</span><b>" + esc(m.name) + "</b>" + (detail ? '<span class="d">' + esc(detail) + "</span>" : "") + "</li>";
    }).join("") + (silent.length ? '<li><span class="pill info">No answer</span><span>' + esc(silent.map(function (m) { return m.name.replace(/^.*\(([^)]+)\)$/, "$1"); }).join(", ")) +
      '</span><span class="d">These addresses are unconfirmed on this car, or the module is on the bus the CX cannot reach.</span></li>' : "");
    /* misfires: one compact line per cylinder (this drive, and the 10-drive average) */
    var cyl = {};
    R.tests.forEach(function (t) { if (t.mid >= 0xA2 && t.mid <= 0xAD) { var c = cyl[t.mid - 0xA1] = cyl[t.mid - 0xA1] || {}; if (t.tid === 0x0C) c.now = t.value; else if (t.tid === 0x0B) c.avg = t.value; if (!t.pass) c.bad = true; } });
    var cyls = Object.keys(cyl).sort(function (a, b) { return a - b; });
    var misLine = cyls.length ? '<li><span class="pill ' + (cyls.some(function (c) { return cyl[c].bad; }) ? "bad" : cyls.some(function (c) { return cyl[c].now > 0; }) ? "watch" : "ok") + '">Misfires</span><span>' +
      esc(cyls.map(function (c) { return "cyl " + c + ": " + (cyl[c].now != null ? cyl[c].now : "–"); }).join(" · ")) + '</span><span class="d">' +
      esc("This drive. Average over the last 10 drives: " + cyls.map(function (c) { return cyl[c].avg != null ? cyl[c].avg : "–"; }).join(" · ") + ".") + "</span></li>" : "";
    var other = R.tests.filter(function (t) { return !(t.mid >= 0xA2 && t.mid <= 0xAD); });
    var li = function (t) {
      var v = t.uasid === 0x24 ? t.value + " count" + (t.value === 1 ? "" : "s") : "reading " + t.value + " (limits " + t.min + " to " + t.max + ")";
      return '<li><span class="pill ' + (t.pass ? "ok" : "bad") + '">' + (t.pass ? "Within limits" : "Outside limits") + "</span><b>" + esc(t.name) + "</b>" +
        '<span class="d">' + esc(t.test + ": " + v) + "</span></li>";
    };
    var bad = other.filter(function (t) { return !t.pass; }), good = other.filter(function (t) { return t.pass; });
    $("tests").innerHTML = R.tests.length ? misLine + bad.map(li).join("") +
      (good.length ? '<li><details><summary>' + good.length + " other self-test" + (good.length === 1 ? "" : "s") + ' within limits</summary><ul class="list">' + good.map(li).join("") + "</ul></details></li>" : "")
      : '<li><span class="pill info">None</span><span>The engine computer returned no self-test results.</span></li>';
  }

  /* where Kyle's PC is: the V60 app hands it over (V60_NATIVE.pc); in Bluefy it is the Claude live pairing */
  function deepPc() {
    if (window.V60_NATIVE && window.V60_NATIVE.pc) return window.V60_NATIVE.pc;
    try { var c = JSON.parse(localStorage.getItem("v60-claude") || "{}"); return String(c.host || "").replace(/^(https?|wss?):\/\//i, "").replace(/\/.*$/, ""); } catch (e) { return ""; }
  }

  function runDeep() {
    if (!link || deep.busy) return;
    deep.busy = true; $("btnDeep").disabled = true; $("btnScan").disabled = true;
    if (live.on) { stopLive(); log("..", "recording stopped for the deep scan"); }
    var R = { date: new Date().toISOString(), adapter: link.name, tests: [], modules: [] };
    deepStatus("Engine self-tests...");
    return deepTests().then(function (t) { R.tests = t; return deepModules(); }).then(function (m) {
      R.modules = m; R.summary = deepSummary(R); deep.last = R;
      renderDeep(R);
      var d = data(); d.deep = (d.deep || []).concat([R]).slice(-20); api.save();
      var pc = deepPc();
      deepStatus("Done " + new Date().toLocaleTimeString() + (pc ? ". Sending to your PC..." : "."));
      if (!pc) return;
      return fetch("https://" + pc + "/drives/deep", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(R) })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) { deepStatus("Done " + new Date().toLocaleTimeString() + (j && j.url ? ". Claude has it; the page is on your PC." : ". Your PC did not take it.")); }, function () { deepStatus("Done " + new Date().toLocaleTimeString() + ". Your PC was not reachable; the results are saved on this phone."); });
    }).catch(function (e) { deepStatus("Stopped: " + ((e && e.message) || e)); })
      .then(function () { deep.busy = false; $("btnDeep").disabled = !link; $("btnScan").disabled = !link; });
  }
  $("btnDeep").addEventListener("click", runDeep);
  /* the deep scan button follows the health check button (both need the adapter) */
  new MutationObserver(function () { if (!deep.busy) $("btnDeep").disabled = $("btnScan").disabled; }).observe($("btnScan"), { attributes: true, attributeFilter: ["disabled"] });
  /* the last saved scan, drawn when the page draws its saved history (the Garage's data is loaded by then) */
  window.__lkDeep = function () { var d = api.mod("live"); if (!deep.busy && d && d.deep && d.deep.length) renderDeep(d.deep[d.deep.length - 1]); };
