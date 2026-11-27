  /* ---------------- Claude live: this page <-> the Claude session on Kyle's PC ----------------
     The PC runs Claude Code with the V60 channel (bridge/server.js). This page opens a WebSocket to it over
     Tailscale (wss://<pc>.<tailnet>.ts.net/link). It tells Claude when the adapter connects or drops, streams the
     adapter log to the PC's log file, runs Claude's adapter commands through the same queue as the page's own
     (cmd), and shows Claude's messages. Anything that could change the car waits for a tap here, whatever the
     PC says (carWrite below; the bridge asks too). Settings live in localStorage "v60-claude", never in synced state. */
  var CL_KEY = "v60-claude", CL_FEED = "v60-claude-feed";
  var cl = { ws: null, state: "off", why: "", timer: null, tries: 0, asks: {}, dirty: false, idle: null, feed: [] };
  function clCfg() { try { return JSON.parse(localStorage.getItem(CL_KEY) || "{}") || {}; } catch (e) { return {}; } }
  function clSetCfg(c) { try { localStorage.setItem(CL_KEY, JSON.stringify(c)); } catch (e) {} }
  try { cl.feed = JSON.parse(localStorage.getItem(CL_FEED) || "[]") || []; } catch (e) { cl.feed = []; }

  /* Commands that only set up the adapter never reach the car. Reads are OBD modes 01-0A (not 04 clear or 08 control),
     UDS 22 / 19 / 3E / default session, KWP reads, and Volvo D2 reads. Everything else counts as a write. */
  /* raw: CAN auto-formatting is off (ATCAF0 since the last set-up), so the first byte is a frame length and every
     data command counts as a write. Same rule as bridge/lib.js (carWrite, rawAfter). */
  function carWrite(c, raw) {
    var s = String(c || "").toUpperCase().replace(/\s+/g, "");
    if (!s) return false;
    if (/^STPX/.test(s)) { var m = s.match(/D:([0-9A-F]+)/); return m ? raw || payloadWrite(m[1]) : true; }
    if (/^(AT|ST)/.test(s)) return false;
    if (!/^[0-9A-F]+$/.test(s) || s.length % 2) return true;
    return raw ? true : payloadWrite(s);
  }
  function rawAfter(c) {
    var s = String(c || "").toUpperCase().replace(/\s+/g, "");
    if (/^ATCAF0/.test(s)) return true;
    if (/^(ATCAF1|ATZ|ATWS|ATD$|ATD0|STI$|STRSTNVM)/.test(s)) return false;
    return null;
  }
  function payloadWrite(h) {
    var b = (h.match(/../g) || []).map(function (x) { return parseInt(x, 16); }), sid = b[0];
    if (sid >= 0xC8 && sid <= 0xCF && b.length >= 3) return [0xA3, 0xA5, 0xA6, 0xAE, 0xB9].indexOf(b[2]) < 0;
    if (sid === 0x10) return !(b[1] === 0x01 || b[1] === 0x81);
    return [0x01, 0x02, 0x03, 0x05, 0x06, 0x07, 0x09, 0x0A, 0x12, 0x17, 0x18, 0x19, 0x1A, 0x21, 0x22, 0x3E].indexOf(sid) < 0;
  }
  /* settings that change how the page's own requests are addressed; after these the page sets the adapter up again */
  function clDirties(c) { return /^(ATSH|ATCRA|ATCF|ATCM|ATSP|ATTP|ATCP|ATCAF|ATH|ATFC|ATAT|ATST|STP|STCSEG|STFAC|STFAP|STFBA)/.test(String(c).toUpperCase().replace(/\s+/g, "")); }

  function clSend(o) { if (cl.ws && cl.ws.readyState === 1) { try { cl.ws.send(JSON.stringify(o)); return true; } catch (e) {} } return false; }
  function clLog(dir, text) { if (cl && cl.state === "on") clSend({ t: "log", d: dir, x: String(text) }); }
  function clLink(on) { if (cl) clSend({ t: "link", state: on ? "on" : "off", adapter: link ? link.name : null, can: !!protoCAN, sim: !!(link && link.name === "Simulated V60") }); }
  function clReport(R) { if (cl) clSend({ t: "report", r: R }); }

  function clStatus(state, text) {
    cl.state = state; cl.why = text || "";
    var map = { off: ["", "Off"], wait: ["busy", "Connecting to your PC..."], on: ["on", "Claude is watching"], down: ["", text || "Your PC is not answering"], denied: ["", "The PC refused the pairing code"] };
    var m = map[state] || map.off;
    $("clConn").className = "conn " + m[0]; $("clText").textContent = m[1];
    $("clSay").hidden = state !== "on"; $("clSend").disabled = state !== "on";
  }
  function clUrl(c) {
    var h = String(c.host || "").trim().replace(/^(https?|wss?):\/\//i, "").replace(/\/.*$/, "");
    var local = /^(127\.0\.0\.1|localhost)(:\d+)?$/i.test(h);
    return (local ? "ws://" : "wss://") + h + "/link?code=" + encodeURIComponent(String(c.code || "").trim());
  }
  function clOpen() {
    var c = clCfg();
    clearTimeout(cl.timer);
    if (!c.on) { clStatus("off"); return; }
    if (!c.host || !c.code) { clStatus("down", "Pair with your PC first (below)."); $("clSetup").open = true; return; }
    if (cl.ws && cl.ws.readyState <= 1) return;
    clStatus("wait");
    var ws;
    try { ws = new WebSocket(clUrl(c)); } catch (e) { clStatus("down", "That PC address does not look right."); return; }
    cl.ws = ws;
    ws.onopen = function () { cl.tries = 0; clSend({ t: "hello", adapter: link ? link.name : null, connected: !!link, can: !!protoCAN, page: location.href.split("?")[0], auto: auOn(), known: auKnown() }); };
    ws.onmessage = function (ev) { var m; try { m = JSON.parse(ev.data); } catch (e) { return; } clMsg(m); };
    ws.onclose = function (ev) {
      if (cl.ws !== ws) return;
      cl.ws = null;
      /* the PC has already given up on anything this link asked (it answers "link closed"); an Allow card left up
         could otherwise run a command on a later link without the PC knowing */
      if (Object.keys(cl.asks).length) { cl.asks = {}; clDrawAsks(); }
      if (ev.code === 4001) { clStatus("denied"); return; }
      if (!clCfg().on) { clStatus("off"); return; }
      clStatus("down", cl.tries ? "Your PC is not answering. Is Claude live running there, and Tailscale on here?" : "Lost the PC. Trying again...");
      var wait = [2000, 5000, 10000, 20000, 30000][Math.min(cl.tries++, 4)];
      cl.timer = setTimeout(clOpen, wait);
    };
  }
  function clClose() { clearTimeout(cl.timer); var w = cl.ws; cl.ws = null; if (w) try { w.close(1000); } catch (e) {} clStatus("off"); }

  function clMsg(m) {
    if (m.t === "welcome") { clStatus("on"); if (link) clLink(true); return; }
    if (m.t === "msg") { clFeed("claude", String(m.text || "")); clToast(String(m.text || "")); return; }
    if (m.t === "cmd") { clRun(m); return; }
    if (m.t === "restore") { clRestore().then(function (r) { clSend({ t: "res", id: m.id, ok: r.ok, raw: r.raw, error: r.error }); }); return; }
    if (m.t === "perm") { clAsk({ id: "p:" + m.id, perm: m.id, title: "Claude wants to use " + (m.tool || "a tool"), body: m.desc || "", detail: m.preview || "" }); return; }
    if (m.t === "drop") { clDrop(String(m.id)); return; }
  }
  function clRun(m) {
    var c = String(m.c || "").trim(), id = m.id;
    var reply = function (o) { o.t = "res"; o.id = id; clSend(o); };
    if (!link) { reply({ ok: false, error: "The adapter is not connected on the phone." }); return; }
    var go = function () {
      if (clDirties(c)) { if (live.on) { stopLive(); log("..", "recording stopped so Claude can address other modules"); } cl.dirty = true; }
      log("..", "Claude: " + c);
      cmd(c, Math.min(Math.max(+m.timeout || 4000, 500), 30000)).then(function (raw) { if (rawAfter(c) !== null) cl.raw = rawAfter(c); reply({ ok: true, raw: raw }); }, function (e) { reply({ ok: false, error: (e && e.message) || String(e) }); })
        .then(function () { clearTimeout(cl.idle); if (cl.dirty) cl.idle = setTimeout(function () { clRestore(); }, 30000); });
    };
    if (carWrite(c, cl.raw) || m.write) {
      clAsk({ id: "c:" + id, title: "Claude wants to send a command that can change the car", body: m.why || "No reason given.", detail: c, cmd: true,
        yes: go, no: function () { reply({ ok: false, error: "Kyle said no." }); } });
    } else go();
  }
  function clRestore() {
    clearTimeout(cl.idle);
    if (!link) return Promise.resolve({ ok: false, error: "The adapter is not connected." });
    log("..", "setting the adapter back up for this page (warm start)");
    return initElm(true).then(function () { cl.dirty = false; cl.raw = false; return { ok: true, raw: "adapter set up again; protocol " + (protoCAN ? "CAN" : "not CAN") }; }, function (e) { cl.dirty = false; return { ok: false, error: (e && e.message) || String(e) }; });
  }
  function clAsk(a) {
    cl.asks[a.id] = a; $("clToast").hidden = true;
    clDrawAsks();
    if (navigator.vibrate) try { navigator.vibrate(80); } catch (e) {}
  }
  function clDrop(id) { if (cl.asks["c:" + id]) { delete cl.asks["c:" + id]; } if (cl.asks["p:" + id]) delete cl.asks["p:" + id]; clDrawAsks(); }
  function clDrawAsks() {
    var box = $("clAsk"), ids = Object.keys(cl.asks);
    box.hidden = !ids.length;
    box.innerHTML = ids.map(function (k) {
      var a = cl.asks[k];
      return '<div class="clq" data-k="' + esc(k) + '"><b>' + esc(a.title) + "</b>" + (a.body ? '<p class="clw">' + esc(a.body) + "</p>" : "") +
        (a.detail ? '<details><summary>' + (a.cmd ? "The command" : "Details") + '</summary><pre class="clpre">' + esc(a.detail) + "</pre></details>" : "") +
        (a.cmd ? '<p class="status">Only allow it with the car parked.</p>' : "") +
        '<div class="row"><button type="button" class="danger" data-v="yes">Allow once</button><button type="button" class="quiet" data-v="no">No</button></div></div>';
    }).join("");
  }
  function clAnswer(k, yes) {
    var a = cl.asks[k]; if (!a) return; delete cl.asks[k]; clDrawAsks();
    if (a.perm) { clSend({ t: "perm", id: a.perm, allow: !!yes }); clFeed("you", (yes ? "Allowed: " : "Said no to: ") + a.title.replace(/^Claude wants to use /, "")); return; }
    clFeed("you", (yes ? "Allowed: " : "Said no: ") + (a.body && a.body !== "No reason given." ? a.body + " (" + a.detail + ")" : a.detail));
    if (yes) a.yes(); else a.no();
  }
  function clFeed(who, text) {
    if (!text) return;
    cl.feed.push({ w: who, x: text.slice(0, 4000), at: new Date().toISOString() });
    if (cl.feed.length > 40) cl.feed = cl.feed.slice(-40);
    try { localStorage.setItem(CL_FEED, JSON.stringify(cl.feed)); } catch (e) {}
    clDrawFeed();
  }
  function clDrawFeed() {
    var f = $("clFeed");
    f.innerHTML = cl.feed.slice(-20).map(function (m) {
      return '<li class="' + (m.w === "claude" ? "cc" : "cy") + '"><span class="who">' + (m.w === "claude" ? "Claude" : "You") + " · " + esc(new Date(m.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })) + '</span><span class="tx">' + esc(m.x) + "</span></li>";
    }).join("");
    f.hidden = !cl.feed.length;
    f.scrollTop = f.scrollHeight;
    requestAnimationFrame(function () { f.scrollTop = f.scrollHeight; });
  }
  /* Claude's newest message, over whatever screen is open, unless the conversation itself is on screen */
  function clToast(t) {
    var f = $("clFeed"), r = f.getBoundingClientRect(), seen = !f.hidden && r.height && r.bottom > 0 && r.top < window.innerHeight;
    if (seen || cl.asks && Object.keys(cl.asks).length) return;
    var el = $("clToast");
    el.querySelector(".tx").textContent = t.length > 160 ? t.slice(0, 157) + "..." : t;
    el.hidden = false; clearTimeout(cl.toastT);
    cl.toastT = setTimeout(function () { el.hidden = true; }, 9000);
  }
  function clSay() {
    var inp = $("clMsg"), t = inp.value.trim();
    if (!t || cl.state !== "on") return;
    if (clSend({ t: "say", text: t })) { clFeed("you", t); inp.value = ""; }
  }

  (function clBoot() {
    var c = clCfg();
    /* the Allow card and the message toast live on the page body so they show over any screen of the app */
    document.body.appendChild($("clAsk"));
    var toast = document.createElement("button"); toast.type = "button"; toast.id = "lk-clToast"; toast.className = "cltoast"; toast.hidden = true;
    toast.innerHTML = '<span class="who">Claude</span><span class="tx"></span>';
    document.body.appendChild(toast);
    toast.addEventListener("click", function () { toast.hidden = true; api.go("live"); setTimeout(function () { $("clFeed").scrollIntoView({ block: "center" }); }, 60); });
    $("clHost").value = c.host || ""; $("clCode").value = c.code || "";
    $("clOn").checked = !!c.on;
    clDrawFeed(); clStatus("off");
    $("clOn").addEventListener("change", function () { var x = clCfg(); x.on = $("clOn").checked; clSetCfg(x); if (x.on) { cl.tries = 0; clOpen(); } else clClose(); });
    $("clSave").addEventListener("click", function () {
      var x = clCfg(); x.host = $("clHost").value.trim(); x.code = $("clCode").value.trim(); x.on = true; clSetCfg(x);
      $("clOn").checked = true; $("clSaved").textContent = "Saved on this phone."; clClose(); cl.tries = 0; clOpen();
    });
    $("clSend").addEventListener("click", clSay);
    $("clMsg").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); clSay(); } });
    $("clAsk").addEventListener("click", function (e) { var b = e.target.closest("button[data-v]"); if (!b) return; var q = b.closest(".clq"); if (q) clAnswer(q.getAttribute("data-k"), b.getAttribute("data-v") === "yes"); });
    $("clClear").addEventListener("click", function () { cl.feed = []; try { localStorage.removeItem(CL_FEED); } catch (e) {} clDrawFeed(); });
    document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible" && clCfg().on && !cl.ws) { cl.tries = 0; clOpen(); } });
    if (c.on) clOpen();
  })();
