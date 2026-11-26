  /* ---------------- Connect by itself ----------------
     With the switch on, the page connects to the adapter chosen last time with no tap: when the app opens, when it
     comes back on screen, when the adapter advertises (watchAdvertisements, where the browser has it), and on a timer
     while the page is on screen (15 s, then up to 45 s apart; the OBDLink CX sleeps while the ignition is off).
     It never opens the picker (that needs a tap) and stops after a manual Disconnect until the page is opened again.
     While the adapter is connected it asks the phone to keep the screen on (Wake Lock, or Bluefy's own
     setScreenDimEnabled), because iOS pauses the page when the screen locks.
     Bluefy's release notes list getDevices() (3.2.0), watchAdvertisements() and setScreenDimEnabled() (3.8.1).
     Whether its gatt.connect() works without a tap is unverified until tried on the phone.
     Setting: localStorage "v60-link-auto" ("1" on), never in synced state. */
  var AU_KEY = "v60-link-auto", AU_WAITS = [15000, 20000, 30000, 45000];
  var au = { next: 0, fails: 0, busy: false, paused: false, awake: false, wl: null, watched: false, last: "" };
  function auOn() { try { return localStorage.getItem(AU_KEY) === "1"; } catch (e) { return false; } }
  function auKnown() { try { return !!localStorage.getItem("v60-link-dev"); } catch (e) { return false; } }
  function auSay(t) { if (au.last === t) return; au.last = t; $("autoSt").textContent = t; }
  function auVisible() { return document.visibilityState !== "hidden"; }

  function auAwake(on) {
    if (on === au.awake) return;
    au.awake = on;
    try {
      if (on && navigator.wakeLock) navigator.wakeLock.request("screen").then(function (l) { au.wl = l; }).catch(function () {});
      if (!on && au.wl) { au.wl.release(); au.wl = null; }
      if (navigator.bluetooth && typeof navigator.bluetooth.setScreenDimEnabled === "function") navigator.bluetooth.setScreenDimEnabled(!on);
    } catch (e) {}
  }

  /* wake up the moment the adapter starts advertising (ignition on), instead of waiting for the timer */
  function auWatch() {
    if (au.watched || !navigator.bluetooth || !navigator.bluetooth.getDevices) return;
    var name = null; try { name = localStorage.getItem("v60-link-dev"); } catch (e) {}
    if (!name) return;
    au.watched = true;
    navigator.bluetooth.getDevices().then(function (list) {
      var d = (list || []).filter(function (x) { return x.name === name; })[0];
      if (!d || typeof d.watchAdvertisements !== "function") return;
      d.addEventListener("advertisementreceived", function () { if (auOn() && !link && !au.busy && !au.paused) { au.next = 0; auTick(); } });
      return d.watchAdvertisements();
    }).catch(function () {});
  }

  function auTry() {
    au.busy = true;
    var t = new BleTransport({ auto: true });
    t.onAutoFail = function (e) {
      var n = (e && e.name) || "", m = (e && e.message) || String(e);
      if (!auOn()) { setConn("", "Not connected"); return; }
      if (n === "NotFoundError" && !auKnown()) { setConn("", "Not connected"); auSay("Tap Connect adapter once to choose it. After that this page connects by itself."); au.next = Infinity; return; }
      if (n === "NotAllowedError" || n === "SecurityError") { setConn("", "Bluetooth is not allowed for this page. On iPhone: Settings, Bluefy, Bluetooth on."); auSay("Connect by itself is waiting for Bluetooth permission."); au.next = Infinity; return; }
      au.fails++;
      if (au.fails === 1) log("..", "connect by itself: waiting for the adapter (" + (n ? n + ": " : "") + m + ")");
      setConn("", /car did not/.test(m) ? "The adapter is awake but the car is not answering. Turn the ignition on." : "Waiting for the adapter. It wakes when the ignition is on.");
      au.next = Date.now() + AU_WAITS[Math.min(au.fails - 1, AU_WAITS.length - 1)];
      auSay("Tries again by itself while this page is on screen.");
    };
    var going = connect(t);
    setConn("busy", "Looking for the adapter...");
    return going.then(function () {
      au.busy = false;
      if (link === t) { au.fails = 0; log("..", "connect by itself: connected to " + t.name); auSay("Connected by itself. The screen stays on while the adapter is connected."); }
    });
  }

  function auTick() {
    var connected = !!(link && !link.connecting && link.name !== "Simulated V60");
    auAwake(auOn() && connected && auVisible());
    if (!auOn() || au.busy || au.paused || link || !auVisible()) return;
    if (!auKnown()) { auSay("Tap Connect adapter once to choose it. After that this page connects by itself."); return; }
    if (!navigator.bluetooth || (api.inClaude && api.inClaude())) return;
    if (Date.now() < au.next) return;
    auWatch();
    auTry();
  }

  (function auBoot() {
    $("autoOn").checked = auOn();
    $("autoOn").addEventListener("change", function () {
      var on = $("autoOn").checked;
      try { if (on) localStorage.setItem(AU_KEY, "1"); else localStorage.removeItem(AU_KEY); } catch (e) {}
      clSend({ t: "auto", on: on, known: auKnown() });
      au.paused = false; au.fails = 0; au.next = 0;
      if (!on) { auAwake(false); auSay(""); return; }
      auTick();
    });
    $("btnDisconnect").addEventListener("click", function () { au.paused = true; auAwake(false); if (auOn()) auSay("Paused after Disconnect. It connects by itself again the next time this page opens."); });
    $("btnConnect").addEventListener("click", function () { au.paused = false; });
    document.addEventListener("visibilitychange", function () {
      if (!auVisible()) { auAwake(false); return; }
      au.paused = false; au.fails = 0; au.next = 0; au.awake = false; auTick();
    });
    setInterval(auTick, 3000);
    setTimeout(auTick, 600);
  })();
