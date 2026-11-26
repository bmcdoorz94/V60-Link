import re, json, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
src = open(os.path.join(ROOT,'src','link-legacy.html'), encoding='utf-8').read()
html = src[src.index('<main>')+6:src.index('</main>')]
script = src[src.index('<script>\n(function () {')+len('<script>\n(function () {'):src.index('  window.__link =')]
# --- HTML ---
html = re.sub(r'<header>.*?</header>', '', html, flags=re.S)
html = re.sub(r'(id|for|aria-labelledby)="([^"]+)"', lambda m: '%s="lk-%s"' % (m.group(1), m.group(2)), html)
html = html.replace('<h2 id="lk-h-conn">Connect</h2>', '<h2 id="lk-h-conn">Connect</h2>')
html = html.replace('<button type="button" id="lk-btnReport">Save report for V60 Garage</button>',
  '<button type="button" id="lk-btnReport">Save to my Garage</button>\n        <button type="button" class="quiet" id="lk-btnDlReport">Save as a file</button>')
html = html.replace('<button type="button" class="quiet" id="lk-btnCsv" disabled>Save CSV</button>',
  '<button type="button" class="quiet" id="lk-btnCsv" disabled>Open in Data lab</button>\n      <button type="button" class="quiet" id="lk-btnDlCsv" disabled>Download CSV</button>\n      <label class="status" style="display:inline-flex;gap:6px;align-items:center"><input type="checkbox" id="lk-wake" checked> Keep screen awake</label>')
html = html.replace('<span>I saved the health-check report (the Save report button ticks this automatically).</span>', '<span>I saved the health-check report (Save to my Garage ticks this automatically).</span>')
html = html.replace('<li>It does not change module settings, software or engine tuning.</li>', '<li>It does not change module settings, software or engine tuning.</li>\n      <li>Data saved here lives in this browser. Bluefy and the Safari home-screen app keep separate copies; move data between them with Backup in My V60.</li>\n      <li>0–60 timing depends on how fast the adapter answers (often 5 to 10 readings a second with only speed selected), so expect about ±0.2 s.</li>')
# insert dashboard section before live data section
dash = '''
  <section class="card" aria-labelledby="lk-h-dash">
    <h2 id="lk-h-dash">Dashboard</h2>
    <p class="lede">Connect the adapter, then tap Start gauges. The gauges also record the drive as a trip. Boost needs intake pressure and barometric pressure ticked under Live data.</p>
    <div class="row"><button type="button" id="lk-dashGo" disabled>Start gauges</button><button type="button" class="quiet" id="lk-driveBtn">Drive mode</button></div>
    <p class="status" id="lk-driveSt">Connect the adapter first.</p>
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
# Claude live (tools/gen/live_claude.js) sits right under Connect
claude_html = '''
  <section class="card cl" aria-labelledby="lk-h-cl" id="lk-cl">
    <h2 id="lk-h-cl">Claude live</h2>
    <p class="lede">Links this page to the Claude session on your PC. While it is on, Claude sees the adapter connect, reads the car through it and writes to you here. Anything that could change the car waits for your OK on this screen.</p>
    <div class="row"><span class="conn" id="lk-clConn" role="status"><i></i><span id="lk-clText">Off</span></span></div>
    <label class="clsw"><input type="checkbox" id="lk-clOn"> Let Claude watch</label>
    <div class="clsheet" id="lk-clAsk" role="alertdialog" aria-label="Claude is asking" hidden></div>
    <ol class="clfeed" id="lk-clFeed" aria-live="polite" hidden></ol>
    <div class="clsay" id="lk-clSay" hidden><input type="text" id="lk-clMsg" placeholder="Message Claude" autocomplete="off" enterkeyhint="send" aria-label="Message Claude"><button type="button" id="lk-clSend" disabled>Send</button></div>
    <details id="lk-clSetup">
      <summary>Pair with your PC</summary>
      <p class="lede" style="margin:8px 0">Start Claude live on the PC (bridge/start.cmd in the V60-Link folder). Its window shows the PC address and a pairing code. Tailscale has to be on, on this phone.</p>
      <label class="clf">PC address<input type="text" id="lk-clHost" placeholder="kitty.tail1234.ts.net" autocomplete="off" autocapitalize="off" spellcheck="false"></label>
      <label class="clf">Pairing code<input type="text" id="lk-clCode" inputmode="numeric" placeholder="6 digits" autocomplete="off"></label>
      <div class="row"><button type="button" id="lk-clSave">Save and connect</button><button type="button" class="quiet" id="lk-clClear">Clear the messages</button></div>
      <p class="status" id="lk-clSaved"></p>
    </details>
  </section>
'''
# Deep scan (tools/gen/live_deep.js): every module's codes and the engine's self-tests, under the health check
deep_html = '''
    <div class="row"><button type="button" class="quiet" id="lk-btnDeep" disabled>Deep scan: every module and the engine's self-tests</button></div>
    <p class="status" id="lk-deepStatus">Reads only. About a minute. Best with the engine idling and warm.</p>
    <div id="lk-deepOut" hidden>
      <h3>Modules</h3>
      <ul class="list" id="lk-mods"></ul>
      <h3>Engine self-tests</h3>
      <p class="status">The engine computer's own checks, each against its own limits. Misfire counts per cylinder are the ones to watch.</p>
      <ul class="list" id="lk-tests"></ul>
    </div>'''
deep_anchor = '<span class="status" id="lk-scanStatus"></span></div>'
assert deep_anchor in html, 'health check row not found'
html = html.replace(deep_anchor, deep_anchor + deep_html, 1)
# Connect by itself (tools/gen/live_auto.js): the switch sits under the Connect buttons
auto_html = '''
    <label class="clsw"><input type="checkbox" id="lk-autoOn"> Connect by itself</label>
    <p class="status" id="lk-autoSt"></p>
    <details id="lk-autoHow">
      <summary>Open this page when you get in the car</summary>
      <p class="lede" style="margin:8px 0">With Connect by itself on, this page connects to your adapter whenever it is open in Bluefy and the ignition is on, and keeps the screen on while connected. iOS pauses web pages in the background, so Bluefy has to be open on this page.</p>
      <p class="lede" style="margin:8px 0">The Shortcuts app can open Bluefy for you. If your phone connects to the car's Bluetooth: Shortcuts, Automation, New Automation, Bluetooth, choose the car, Run Immediately, then the action Open App, Bluefy. Leave this page as Bluefy's open tab. Not yet tried on this car.</p>
    </details>'''
anchor = 'id="lk-btnDisconnect" disabled>Disconnect</button>\n    </div>'
assert anchor in html, 'Connect buttons not found'
html = html.replace(anchor, anchor + auto_html, 1)
i = html.index('  <section class="card" aria-labelledby="lk-h-scan">')
html = html[:i] + claude_html.strip('\n') + '\n\n' + html[i:]
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
    if (window.V60_NATIVE) { n.hidden = false; n.textContent = "In the V60 app this page uses the app's own connection to the adapter. It connects by itself when the ignition is on, and the gauges fill by themselves. Adapter settings and Claude live are under the round car button."; return; }
    if (api.inClaude()) { n.hidden = false; $("btnConnect").disabled = true; n.innerHTML = 'Bluetooth is blocked inside Claude. On your iPhone, open <a href="' + url + '" target="_blank" rel="noopener">' + url + '</a> in the free Bluefy browser to connect to the car. The simulated car works here.'; return; }
    if (navigator.bluetooth) { if (navigator.bluetooth.getAvailability) navigator.bluetooth.getAvailability().then(function (a) { if (!a) { n.hidden = false; n.textContent = "Bluetooth looks turned off or unavailable on this device."; } }).catch(function () {}); return; }
    n.hidden = false; $("btnConnect").disabled = true;
    if (/iPhone|iPad|iPod/.test(ua)) n.innerHTML = 'Safari cannot use Bluetooth from a web page. Open <a href="' + url + '" target="_blank" rel="noopener">' + url + '</a> in the free <b>Bluefy</b> browser to connect. The simulated car works here.';
    else n.textContent = "This browser cannot use Bluetooth from a web page. Use Chrome or Edge on Android, Windows, Mac or ChromeOS. The simulated car works anywhere.";
  })();

'''
s = s.replace(old_sup, new_sup)
# report save -> garage
old_rep = s[s.index('  $("btnReport").addEventListener("click", function () {'):s.index('  if (navigator.share) {')]
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
s = s.replace('''      enable(true); renderPicks();''', '''      enable(true); renderPicks(); $("zArm").disabled = false; clLink(true);''')
s = s.replace('''    transport.onclose = function () { link = null; enable(false); setConn("", "Disconnected"); stopLive(); };''', '''    transport.onclose = function () { link = null; enable(false); setConn("", "Disconnected"); stopLive(); $("zArm").disabled = true; clLink(false); };''')
s = s.replace('''  $("btnDisconnect").addEventListener("click", function () { stopLive(); if (link) link.close(); link = null; enable(false); setConn("", "Disconnected"); });''', '''  $("btnDisconnect").addEventListener("click", function () { stopLive(); if (link) link.close(); link = null; enable(false); setConn("", "Disconnected"); $("zArm").disabled = true; clLink(false); });''')
s = s.replace('''    $("tiles").innerHTML = PIDS''', '''    renderCluster();
    $("tiles").innerHTML = PIDS''')
s = s.replace('''      report = R; renderReport();''', '''      report = R; renderReport(); renderCoach(); clReport(R);''')
s = s.replace('''  function log(dir, text) {
''', '''  function log(dir, text) {
    clLog(dir, text);
''')
s = s.replace('''      $("clearStatus").textContent = "Cleared by: " + okE.join(", ") + ". Running a new health check...";''', '''      $("clearStatus").textContent = "Cleared by: " + okE.join(", ") + ". Running a new health check...";
      api.state.codes.forEach(function (c) { if (c.status === "active") { c.status = "cleared"; c.note = (c.note ? c.note + " · " : "") + "Cleared with Live link " + api.todayStr(); } }); api.save();''')
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cipher
s = cipher.apply(s)
extra = open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'live_extra.js'), encoding='utf-8').read()
extra += '\n' + open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'live_claude.js'), encoding='utf-8').read()
extra += '\n' + open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'live_auto.js'), encoding='utf-8').read()
extra += '\n' + open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'live_native.js'), encoding='utf-8').read()
extra += '\n' + open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'live_deep.js'), encoding='utf-8').read()
s = s.replace('  /* ---------------- clear codes ---------------- */', extra + '\n  /* ---------------- clear codes ---------------- */')
out = '''/* Live link: V60 Link ported into the Garage (generated by tools from src/link-legacy.html, then extended). Web Bluetooth to a BLE OBD-II adapter.
   Adds: direct import into the Garage, Data lab hand-off, gauge cluster, 0-60 timer, drive-cycle coach, trip log, scan history, wake lock. */
(function () {
  var HTML = %s;
  var booted = false;
  (window.V60_MODULES = window.V60_MODULES || []).push({
    id: "live",
    tabs: [{ id: "live", section: "data", label: "Live link", order: 10, html: HTML }],
    clean: function (v) { if (!v || typeof v !== "object") return null; return { trips: Array.isArray(v.trips) ? v.trips.slice(-60) : [], scans: Array.isArray(v.scans) ? v.scans.slice(-30) : [], runs: Array.isArray(v.runs) ? v.runs.slice(-30) : [], deep: Array.isArray(v.deep) ? v.deep.filter(function (x) { return x && typeof x === "object" && Array.isArray(x.modules) && Array.isArray(x.tests); }).slice(-20) : [] }; },
    xp: function (api) { var d = api.mod("live"); if (!d) return 0; return Math.min(10, d.scans.length) * 15 + Math.min(20, d.trips.length) * 5; },
    render: function (api) { if (window.__lkRender) window.__lkRender(); },
    today: function (api) { var d = api.mod("live"); if (!d || !d.scans.length) return []; var last = d.scans[d.scans.length - 1], nr = (last.monitors || []).filter(function (m) { return !m.ready; }).length; return nr > 1 ? [{ k: "live-ready", pri: 40, t: nr + " readiness monitors not ready", d: "From your last health check on " + String(last.date).slice(0, 10) + ". The drive-cycle coach in Live link shows what helps.", go: "tab:live", btn: "Open coach" }] : []; },
    init: function (api) { if (booted) return; booted = true;
%s
  window.__link = { parseResponse: parseResponse, dtcsFrom: dtcsFrom, decodeDTC: decodeDTC, SimTransport: SimTransport, csv: csv, live: live, getReport: function () { return report; }, sim: function () { return link; }, zero: zero, trip: trip, onValue: onValue, carWrite: carWrite, claude: cl };
  window.__lkRender = function () { clDrawFeed(); renderHistory(); renderCoach(); renderZero(); renderCluster(); if (link) renderPicks(); if (report) renderReport(); if (window.__lkDeep) window.__lkDeep(); };
  renderHistory(); renderCoach(); renderZero();
    }
  });
})();
''' % (json.dumps(html), s)
open(os.path.join(ROOT,'src','js','modules','live.js'), 'w', encoding='utf-8', newline='\n').write(out)
print("ok", len(out))
