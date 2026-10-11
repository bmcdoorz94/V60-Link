import re, json, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
src = open(os.path.join(ROOT,'src','link-legacy.html')).read()
html = src[src.index('<main>')+6:src.index('</main>')]
script = src[src.index('<script>\n(function () {')+len('<script>\n(function () {'):src.index('  window.__link =')]
# --- HTML ---
html = re.sub(r'<header>.*?</header>', '', html, flags=re.S)
html = re.sub(r'(id|for|aria-labelledby)="([^"]+)"', lambda m: '%s="lk-%s"' % (m.group(1), m.group(2)), html)
html = html.replace('<h2 id="lk-h-conn">Connect</h2>', '<h2 id="lk-h-conn">Connect</h2>')
html = html.replace('<button type="button" id="lk-btnReport">Save report for V60 Garage</button>',
  '<button type="button" id="lk-btnReport">Save to my Garage</button>\n        <button type="button" class="quiet" id="lk-btnDlReport">Download report</button>')
html = html.replace('<button type="button" class="quiet" id="lk-btnCsv" disabled>Save CSV</button>',
  '<button type="button" class="quiet" id="lk-btnCsv" disabled>Open in Data lab</button>\n      <button type="button" class="quiet" id="lk-btnDlCsv" disabled>Download CSV</button>\n      <label class="status" style="display:inline-flex;gap:6px;align-items:center"><input type="checkbox" id="lk-wake" checked> Keep screen awake</label>')
html = html.replace('<span>I saved the health-check report (the Save report button ticks this automatically).</span>', '<span>I saved the health-check report (Save to my Garage ticks this automatically).</span>')
html = html.replace('<li>It does not change module settings, software or engine tuning.</li>', '<li>It does not change module settings, software or engine tuning.</li>\n      <li>Data saved here lives in this browser. Bluefy and the Safari home-screen app keep separate copies; move data between them with Backup in My V60.</li>\n      <li>0–60 timing depends on how fast the adapter answers (often 5 to 10 readings a second with only speed selected), so expect about ±0.2 s.</li>')
# insert dashboard section before live data section
dash = '''
  <section class="card" aria-labelledby="lk-h-dash">
    <h2 id="lk-h-dash">Dashboard</h2>
    <p class="lede">Big gauges from whatever channels are recording. Boost needs intake pressure and barometric pressure selected.</p>
    <div class="cluster" id="lk-cluster"></div>
    <div class="cols">
      <div class="card flat">
        <h3>0–60 mph timer</h3>
        <p class="status">Arm it while stopped. Timing starts when the wheels roll and stops at 60 mph. Only on a closed course or where it is legal and safe, with a passenger running the phone.</p>
        <div class="zero60"><span class="big" id="lk-zt">--.-</span><button type="button" class="quiet" id="lk-zArm" disabled>Arm 0–60</button><span class="status" id="lk-zs"></span></div>
        <ol class="zruns" id="lk-zruns"></ol>
      </div>
      <div class="card flat">
        <h3>Drive-cycle coach</h3>
        <p class="status">Helps unfinished readiness monitors complete. Volvo does not publish a drive cycle for this engine, so this follows the general OBD-II pattern. Normal mixed driving gets there too.</p>
        <ul class="coach" id="lk-coach"></ul>
      </div>
    </div>
  </section>

  <section class="card" aria-labelledby="lk-h-trips">
    <h2 id="lk-h-trips">Trips and scan history</h2>
    <p class="lede">Each recording becomes a trip summary, and each health check you save keeps its codes, freeze frame and readiness here.</p>
    <div class="cols"><div><h3>Trips</h3><ul class="list" id="lk-trips"></ul></div><div><h3>Health checks</h3><ul class="list" id="lk-scans"></ul></div></div>
  </section>
'''
i = html.index('  <section class="card" aria-labelledby="lk-h-live">')
html = html[:i] + dash.strip('\n') + '\n\n' + html[i:]
intro = '''  <section><h2>Live link</h2><p class="lede">Talks to the car through a Bluetooth LE OBD-II adapter such as the OBDLink CX: health check, gauges, recordings, 0–60 and clearing codes with safeguards. Results go straight into this Garage.</p></section>
'''
html = intro + html
# --- SCRIPT ---
s = script
s = s.replace('function $(id) { return document.getElementById(id); }', 'function $(id) { return document.getElementById("lk-" + id); }')
s = s.replace('''id="tv' + p.pid''', '''id="lk-tv' + p.pid''')
# support note
old_sup = s[s.index('  (function checkSupport() {'):s.index('  /* ---------------- health check')]
new_sup = '''  (function checkSupport() {
    var n = $("noBt"), ua = navigator.userAgent || "", url = "https://bmcdoorz94.github.io/V60-Link/";
    if (api.inClaude()) { n.hidden = false; $("btnConnect").disabled = true; n.innerHTML = 'Bluetooth is blocked inside Claude. On your iPhone, open <a href="' + url + '" target="_blank" rel="noopener">' + url + '</a> in the free Bluefy browser to connect to the car. The simulated car works here.'; return; }
    if (navigator.bluetooth) { if (navigator.bluetooth.getAvailability) navigator.bluetooth.getAvailability().then(function (a) { if (!a) { n.hidden = false; n.textContent = "Bluetooth looks turned off or unavailable on this device."; } }).catch(function () {}); return; }
    n.hidden = false; $("btnConnect").disabled = true;
    if (/iPhone|iPad|iPod/.test(ua)) n.innerHTML = 'Safari cannot use Bluetooth from a web page. Open <a href="' + url + '" target="_blank" rel="noopener">' + url + '</a> in the free <b>Bluefy</b> browser to connect. The simulated car works here.';
    else n.textContent = "This browser cannot use Bluetooth from a web page. Use Chrome or Edge on Android, Windows, Mac or ChromeOS. The simulated car works anywhere.";
  })();

'''
s = s.replace(old_sup, new_sup)
# report save -> garage
old_rep = s[s.index('  $("btnReport").addEventListener("click", function () {'):s.index('  if (canShareFiles())')]
new_rep = '''  $("btnReport").addEventListener("click", function () {
    if (!report) return;
    var r = JSON.parse(reportJSON()).report, added = api.importLinkReport(r);
    saveScan(r);
    $("reportStatus").textContent = "Saved to your Garage. " + (added ? added + " new code" + (added === 1 ? "" : "s") + " added to the Diagnose log." : "No new active codes.") + " Readiness updated in Health.";
    $("ck1").checked = true; armClear(); renderHistory(); renderCoach();
  });
  $("btnDlReport").addEventListener("click", function () {
    if (!report) return;
    download("v60-health-" + stamp() + ".json", reportJSON(), "application/json");
    $("reportStatus").textContent = "Downloaded. Another copy of the Garage can load it in Diagnose, under Import a V60 Link report.";
  });
'''
s = s.replace(old_rep, new_rep)
s = s.replace('''  $("btnCsv").addEventListener("click", function () { download("v60-log-" + stamp() + ".csv", csv(), "text/csv"); });''',
'''  $("btnCsv").addEventListener("click", function () { try { api.loadDataset(api.parseCSV(csv()), "Live recording " + stamp()); api.go("lab"); } catch (e) { $("liveStatus").textContent = (e && e.message) || "Could not open the recording."; } });
  $("btnDlCsv").addEventListener("click", function () { download("v60-log-" + stamp() + ".csv", csv(), "text/csv"); });''')
s = s.replace('''          $("btnCsv").disabled = live.rows.length < 5;''', '''          $("btnCsv").disabled = $("btnDlCsv").disabled = live.rows.length < 5;''')
s = s.replace('''$("btnLive").textContent = "Stop recording"; $("btnCsv").disabled = true; loop();''', '''$("btnLive").textContent = "Stop recording"; $("btnCsv").disabled = $("btnDlCsv").disabled = true; trip.reset(); wake(true); loop();''')
s = s.replace('''  function stopLive() { live.on = false; $("btnLive").textContent = "Start recording"; }''',
'''  function stopLive() { var was = live.on; live.on = false; $("btnLive").textContent = "Start recording"; wake(false); zero.armed = false; zero.running = false; $("zArm").textContent = "Arm 0–60"; if (was) trip.finish(); }''')
s = s.replace('''return readPid(pd.pid).then(function (d) { if (d) { var v = pd.f(d[0], d[1]); row[pd.pid] = v; var el = $("tv" + pd.pid); if (el) el.textContent = shown(pd, v); } }).catch(function () {}); }); }, Promise.resolve())''',
'''return readPid(pd.pid).then(function (d) { if (d) { var v = pd.f(d[0], d[1]); row[pd.pid] = v; var el = $("tv" + pd.pid); if (el) el.textContent = shown(pd, v); onValue(pd.pid, v); } }).catch(function () {}); }); }, Promise.resolve())''')
s = s.replace('''          live.rows.push(row);''', '''          live.rows.push(row); trip.add(row); updateDials(row);''')
s = s.replace('''      enable(true); renderPicks();''', '''      enable(true); renderPicks(); $("zArm").disabled = false;''')
s = s.replace('''    transport.onclose = function () { link = null; enable(false); setConn("", "Disconnected"); stopLive(); };''', '''    transport.onclose = function () { link = null; enable(false); setConn("", "Disconnected"); stopLive(); $("zArm").disabled = true; };''')
s = s.replace('''  $("btnDisconnect").addEventListener("click", function () { stopLive(); if (link) link.close(); link = null; enable(false); setConn("", "Disconnected"); });''', '''  $("btnDisconnect").addEventListener("click", function () { stopLive(); if (link) link.close(); link = null; enable(false); setConn("", "Disconnected"); $("zArm").disabled = true; });''')
s = s.replace('''    $("tiles").innerHTML = PIDS''', '''    renderCluster();
    $("tiles").innerHTML = PIDS''')
s = s.replace('''      report = R; renderReport();''', '''      report = R; renderReport(); renderCoach();''')
s = s.replace('''      $("clearStatus").textContent = "Cleared by: " + okE.join(", ") + ". Running a new health check...";''', '''      $("clearStatus").textContent = "Cleared by: " + okE.join(", ") + ". Running a new health check...";
      api.state.codes.forEach(function (c) { if (c.status === "active") { c.status = "cleared"; c.note = (c.note ? c.note + " · " : "") + "Cleared with Live link " + api.todayStr(); } }); api.save();''')
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cipher
s = cipher.apply(s)
extra = open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'live_extra.js')).read()
s = s.replace('  /* ---------------- clear codes ---------------- */', extra + '\n  /* ---------------- clear codes ---------------- */')
out = '''/* Live link: V60 Link ported into the Garage (generated by tools from src/link-legacy.html, then extended). Web Bluetooth to a BLE OBD-II adapter.
   Adds: direct import into the Garage, Data lab hand-off, gauge cluster, 0-60 timer, drive-cycle coach, trip log, scan history, wake lock. */
(function () {
  var HTML = %s;
  var booted = false;
  (window.V60_MODULES = window.V60_MODULES || []).push({
    id: "live",
    tabs: [{ id: "live", section: "data", label: "Live link", order: 10, html: HTML }],
    clean: function (v) { if (!v || typeof v !== "object") return null; return { trips: Array.isArray(v.trips) ? v.trips.slice(-60) : [], scans: Array.isArray(v.scans) ? v.scans.slice(-30) : [], runs: Array.isArray(v.runs) ? v.runs.slice(-30) : [] }; },
    xp: function (api) { var d = api.mod("live"); if (!d) return 0; return Math.min(10, d.scans.length) * 15 + Math.min(20, d.trips.length) * 5; },
    render: function (api) { if (window.__lkRender) window.__lkRender(); },
    today: function (api) { var d = api.mod("live"); if (!d || !d.scans.length) return []; var last = d.scans[d.scans.length - 1], nr = (last.monitors || []).filter(function (m) { return !m.ready; }).length; return nr > 1 ? [{ k: "live-ready", pri: 40, t: nr + " readiness monitors not ready", d: "From your last health check on " + String(last.date).slice(0, 10) + ". The drive-cycle coach in Live link shows what helps.", go: "tab:live", btn: "Open coach" }] : []; },
    init: function (api) { if (booted) return; booted = true;
%s
  window.__link = { parseResponse: parseResponse, dtcsFrom: dtcsFrom, decodeDTC: decodeDTC, SimTransport: SimTransport, csv: csv, live: live, getReport: function () { return report; }, sim: function () { return link; }, zero: zero, trip: trip, onValue: onValue };
  window.__lkRender = function () { renderHistory(); renderCoach(); renderZero(); renderCluster(); if (link) renderPicks(); if (report) renderReport(); };
  renderHistory(); renderCoach(); renderZero();
    }
  });
})();
''' % (json.dumps(html), s)
open(os.path.join(ROOT,'src','js','modules','live.js'), 'w').write(out)
print("ok", len(out))
