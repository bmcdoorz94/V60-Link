  /* ---------------- Inside the V60 iPhone app ----------------
     The app (ios/V60App) holds the adapter link natively, also in the background, and reads the car about once a
     second for its drive recording. Web Bluetooth does not exist in the app's web view, so this page uses the app's
     link instead: commands go through window.webkit.messageHandlers.v60car (status / send), the app says when the
     car is ready or gone (V60_NATIVE.onLink) and hands over every reading it takes (V60_NATIVE.onSample). The gauges
     therefore fill by themselves from the app's readings; nothing here polls the car a second time.
     Bridge: ios/V60App/CarBridge.swift. Readings: {v: {"0C": [A, B], ...}}, mode 01 PID in hex to its data bytes. */
  var NV = (window.V60_NATIVE && window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.v60car) || null;
  function NativeTransport() {
    var self = this;
    self.native = true; self.name = "adapter";
    self.open = function () {
      return NV.postMessage({ op: "status" }).then(function (s) {
        if (!s || !s.ready) { var e = new Error("Waiting for the car. The app connects by itself when the ignition is on."); e.name = "AutoWait"; throw e; }
        self.name = s.name || "adapter";
      });
    };
    self.send = function (c, timeout) {
      self.lastCmd = c;
      return NV.postMessage({ op: "send", cmd: String(c), timeout: timeout || 4000 }).then(function (r) {
        if (r && r.ok) return String(r.raw || "");
        var e = new Error((r && r.error) || "failed");
        if (/not connected/i.test(e.message)) e.name = "NetworkError";
        throw e;
      });
    };
    self.close = function () {};
  }
  function nvConnect() {
    if (!NV || link) return; // already on the app's link (or the simulated car is in use)
    var t = new NativeTransport();
    t.onAutoFail = function (e) { setConn("", (e && e.message) || "Waiting for the car."); };
    connect(t);
  }
  function nvGone() {
    if (!link || !link.native) return;
    var l = link;
    if (l.onclose) l.onclose(); else link = null;
    setConn("", "Waiting for the car. The app connects by itself when the ignition is on.");
  }
  /* one reading cycle from the app: decode with this page's own PID table, then feed the gauges and drive mode */
  function nvSample(s) {
    if (!s || !s.v) return;
    var row = { t: Date.now() / 1000 }, changed = false;
    if (!supported) supported = {};
    Object.keys(s.v).forEach(function (k) {
      var pid = parseInt(k, 16), b = s.v[k], pd = PIDS.filter(function (p) { return p.pid === pid; })[0];
      if (!pd || !b || !b.length) return;
      var v = pd.f(b[0], b.length > 1 ? b[1] : 0);
      row[pid] = v;
      if (!supported[pid]) { supported[pid] = true; changed = true; }
      if (!live.sel[pid]) { live.sel[pid] = true; changed = true; }
      onValue(pid, v);
    });
    if (changed) renderCluster();
    updateDials(row);
  }
  (function nvBoot() {
    if (!NV) return;
    window.V60_NATIVE.onLink = function (on) { if (on) nvConnect(); else nvGone(); };
    window.V60_NATIVE.onSample = nvSample;
    /* Connect by itself is how the app always works here; the Bluefy switch and its Shortcuts help do not apply */
    var sw = $("autoOn"); if (sw && sw.closest("label")) sw.closest("label").hidden = true;
    if ($("autoHow")) $("autoHow").hidden = true;
    if ($("autoSt")) $("autoSt").hidden = true;
    $("btnConnect").addEventListener("click", nvConnect);
    setTimeout(nvConnect, 400);
  })();
