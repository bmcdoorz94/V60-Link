/* Home and Maintain (2026-11-26, Kyle chose the "status board" mock-up): the app as an owner's reference.
   Home: what is wrong with the car now, what is coming due on Volvo's schedule, then every section.
   Maintain (tab "maint", a root on the bar): every scheduled item against the service log.
   manual.js owns the "car" tab and asks window.V60_HOME.html(api) for its content. */
(function () {
  var API = null;
  function esc(s) { return API ? API.esc(s) : String(s); }
  function fmt(n) { return API ? API.fmt(n) : String(n); }

  /* ---------- the schedule: Volvo's items against the log ---------- */
  function interval(it) {
    var p = [];
    if (it.key === "airfilter") return "40k · 80k · 120k mi";
    if (it.key === "plugs") return "60k · 120k mi";
    if (it.mi) p.push(fmt(it.mi) + " mi");
    if (it.mo) p.push(it.mo % 12 ? it.mo + " months" : (it.mo / 12) + (it.mo === 12 ? " year" : " years"));
    return p.join(" or ");
  }
  /* one row per scheduled item: rank (lower = more urgent), pill class and label, a short line */
  function sched(api) {
    var odo = api.odoEst ? api.odoEst().miles : api.state.odo;
    return api.ITEMS.filter(function (it) { return it.mi || it.mo; }).map(function (it) {
      var s = api.statusFor(it), last = api.lastFor(it.key), due = api.dueWithin ? api.dueWithin(it, 0, 0) : null, r;
      if (s.cls === "over") r = { rank: 0, pill: "bad", label: "Overdue", line: s.detail };
      else if (s.cls === "soon") r = { rank: 2, pill: "watch", label: "Due soon", line: s.detail };
      else if (s.cls === "ok") r = { rank: 4, pill: "ok", label: "On track", line: s.detail };
      else if (!last && due && it.key === "timingbelt") r = { rank: 1, pill: "bad", label: "Due", line: "No record. " + due.replace(/^No record, and /, "").replace(/^./, function (c) { return c.toUpperCase(); }) + "." };
      else if (!last) r = { rank: 3, pill: "watch", label: "No record", line: "Not on your log." + (it.mi && odo != null && odo >= it.mi ? " The car is past " + fmt(it.mi) + " miles" + (api.odoEst && api.odoEst().est ? " (estimated)" : "") + "." : "") };
      else r = { rank: 5, pill: "none", label: s.label, line: "" };
      r.it = it; r.last = last; r.interval = interval(it);
      return r;
    }).sort(function (a, b) { return a.rank - b.rank; });
  }
  function lastLine(api, last) { return last ? "Last: " + last.date + " at " + fmt(last.miles) + " mi" : ""; }

  /* ---------- home ---------- */
  /* what is wrong now: Health's findings, minus the schedule (which has its own list) and minor reminders */
  function nowList(api) {
    var names = api.ITEMS.map(function (i) { return i.name.toLowerCase(); });
    return api.computeHealth().actions.filter(function (a) {
      if (a.sev < 40) return false;
      var t = String(a.text || "").toLowerCase();
      if (/^no record of /.test(t)) return false;
      return !names.some(function (n) { return t.indexOf(n + " is overdue") === 0 || t.indexOf(n + " is due soon") === 0; });
    });
  }
  function row(jump, title, line, pill, label) {
    return '<button type="button" class="hm-row" data-jump="' + esc(jump) + '"><span class="hm-b"><span class="hm-t">' + esc(title) + "</span>" + (line ? '<span class="hm-s">' + esc(line) + "</span>" : "") + '</span><span class="pill ' + pill + '">' + esc(label) + "</span></button>";
  }
  var TILES = [
    ["tab:maint", "Maintenance", function () { return "Schedule, service log, fuel"; }],
    ["tab:know", "Know your car", function () { return "Specs, fluids, every part"; }],
    ["tab:trouble", "Fix & diagnose", function () { return "Warning lights, sounds, codes"; }],
    ["tab:diy", "How-to jobs", function () { var n = (window.V60_DIY || []).length; return (n ? n + " jobs" : "Jobs") + ", step by step"; }],
    ["tab:upgrades", "Upgrades", function () { var n = (window.V60_UPGRADES || []).length; return (n ? n + " ideas" : "Ideas") + ", cost and benefit"; }],
    ["tab:bulletins", "Bulletins & recalls", function () { return "Volvo's known fixes for this car"; }],
    ["tab:glove", "Glovebox", function () { return "Papers, receipts, tools"; }],
    ["tab:kb", "Library", function () { return "Articles, with sources"; }]
  ];
  function homeHtml(api) {
    var now = nowList(api), due = sched(api).filter(function (r) { return r.rank < 4; }).slice(0, 4), h = '<div class="hm">';
    h += '<section class="hm-sec"><div class="mn-kick"><span>ON THE CAR NOW</span></div>';
    if (now.length) h += now.slice(0, 5).map(function (a) { return row(a.jump || "tab:health", a.text, "", a.sev >= 80 ? "bad" : "watch", a.sev >= 80 ? "Look into" : "Watch"); }).join("") + (now.length > 5 ? '<button type="button" class="mn-link hm-more" data-jump="tab:health">' + (now.length - 5) + " more in Health</button>" : "");
    else h += '<p class="hm-empty">Nothing urgent on record. A health check on Link reads the car\'s codes and warning lights.</p>';
    h += "</section>";
    h += '<section class="hm-sec"><div class="mn-kick"><span>COMING DUE</span><span>VOLVO 2016 SCHEDULE</span></div>';
    if (api.state.odo == null) h += row("tab:maint", "Enter your odometer", "Type the miles in the box at the top so intervals can be checked.", "watch", "Needed");
    h += due.length ? due.map(function (r) { return row("tab:maint", r.it.name, r.interval + ". " + (r.last ? lastLine(api, r.last) + ". " : "") + r.line, r.pill, r.label); }).join("") : '<p class="hm-empty">Everything on Volvo\'s schedule is on track.</p>';
    var oe = api.odoEst ? api.odoEst() : null;
    if (oe && oe.est) h += '<p class="status hm-est">Miles: about <b class="mono">' + esc(fmt(oe.miles)) + "</b>, estimated from recorded drives since your last reading.</p>";
    h += '<button type="button" class="quiet hm-wide" data-jump="tab:maint">Full schedule and service log</button></section>';
    h += '<section class="hm-sec"><div class="mn-kick"><span>EVERYTHING</span></div><div class="hm-tiles">' +
      TILES.map(function (t) { return '<button type="button" class="hm-tile" data-jump="' + t[0] + '"><b>' + esc(t[1]) + "</b><span>" + esc(t[2]()) + "</span></button>"; }).join("") + "</div>" +
      '<div class="row hm-foot"><button type="button" class="quiet" data-jump="tab:index">Index: every page</button><button type="button" class="quiet" data-jump="tab:settings">Settings and backup</button></div>' +
      '<p class="status">Facts come from Volvo\'s 2016 owner\'s manual, maintenance schedule and bulletins. Each page lists its sources.</p></section>';
    return h + "</div>";
  }

  /* ---------- Maintain ---------- */
  function renderMaint(api) {
    var el = api.$("mtBody"); if (!el) return;
    var rows = sched(api), st = api.state, oe = api.odoEst ? api.odoEst() : { est: false }, h = "";
    h += '<p class="status">' + (st.odo != null ? (oe.est ? "At about <b class=\"mono\">" + fmt(oe.miles) + " mi</b>, estimated from recorded drives. " : "At <b class=\"mono\">" + fmt(st.odo) + " mi</b>. ") : "No odometer reading yet. ") + "The car came with no service history, so anything not on your log shows as No record.</p>";
    h += '<div class="row"><button type="button" data-jump="tab:records">Log a service</button><button type="button" class="quiet" data-jump="tab:glove">Add a receipt</button></div>';
    if (window.V60_DRIVES) h += window.V60_DRIVES.html(api);
    h += '<section class="hm-sec"><div class="mn-kick"><span>REPLACE ON SCHEDULE</span></div>' + rows.map(function (r) {
      return '<div class="hm-row hm-static"><span class="hm-b"><span class="hm-t">' + esc(r.it.name) + (r.it.verify ? ' <span class="tag verify">verify</span>' : "") + '</span><span class="hm-i mono">' + esc(r.interval) + "</span>" +
        '<span class="hm-s">' + esc([lastLine(api, r.last), r.line].filter(Boolean).join(". ")) + "</span>" +
        '<details class="hm-note"><summary>Volvo\'s note</summary><p>' + esc(r.it.note) + "</p></details></span>" + '<span class="pill ' + r.pill + '">' + esc(r.label) + "</span></div>";
    }).join("") + "</section>";
    var trans = api.lastFor("trans"), cool = api.ITEMS.filter(function (i) { return !i.mi && !i.mo; });
    h += '<section class="hm-sec"><div class="mn-kick"><span>CHECK ONLY</span></div>' +
      cool.map(function (it) { var l = api.lastFor(it.key); return '<div class="hm-row hm-static"><span class="hm-b"><span class="hm-t">' + esc(it.name) + '</span><span class="hm-s">' + esc((l ? lastLine(api, l) + ". " : "") + it.note) + '</span></span><span class="pill none">Check</span></div>'; }).join("") +
      '<div class="hm-row hm-static"><span class="hm-b"><span class="hm-t">Automatic transmission fluid</span><span class="hm-s">' + esc((trans ? lastLine(api, trans) + ". " : "") + "Volvo AW1. Volvo publishes no fixed interval for normal driving.") + '</span></span><span class="pill none">Check</span></div>' +
      row("tab:records", "Oil level", (st.oil || []).length ? (st.oil.length + " check" + (st.oil.length === 1 ? "" : "s") + " logged. The level is read in the driver display; there is no dipstick.") : "No checks logged yet. The level is read in the driver display; there is no dipstick.", "none", "Log") +
      "</section>";
    h += '<section class="hm-sec"><div class="mn-kick"><span>MORE</span></div><div class="mn-chips">' +
      [["tab:records", "Service log and oil checks"], ["tab:fuel", "Fuel & costs"], ["tab:health", "Health"], ["tab:diy", "How-to jobs"], ["tab:glove", "Receipts"]].map(function (c) { return '<button type="button" class="mn-chip" data-jump="' + c[0] + '">' + esc(c[1]) + "</button>"; }).join("") + "</div></section>";
    h += '<p class="status">Source: Volvo 2016 US maintenance schedule; Volvo 2016 V60 owner\'s manual (coolant, transmission fluid).</p>';
    el.innerHTML = h;
  }

  /* ---------- Settings: sync, backup, detail level (moved here from the Cases page) ---------- */
  var DEPTH = [["short", "Short"], ["det", "Detailed"], ["mech", "Mechanic"]];
  function renderSettings(api) {
    var el = api.$("setBody"); if (!el) return;
    var dp = (api.mod("story") || {}).depth || "det";
    el.innerHTML = '<div id="syncBox" class="syncbox"></div>' +
      '<section class="card"><h3>Backup</h3><p class="status">A backup file is the offline safety net: everything you have entered, in one file.</p><div class="row"><button type="button" class="quiet" data-jump="backup:go">Back up or restore</button></div></section>' +
      '<section class="card"><h3>Detail level</h3><p class="status">How much each Training lesson and explanation says.</p><div class="seg" role="group" aria-label="Detail level">' +
      DEPTH.map(function (x) { return '<button type="button" data-sdepth="' + x[0] + '" aria-pressed="' + (dp === x[0]) + '">' + x[1] + "</button>"; }).join("") + "</div></section>" +
      '<p class="status">Your data is saved on this device in this browser. Sync keeps every device the same.</p>';
    if (window.V60_SYNC && window.V60_SYNC.renderBox) window.V60_SYNC.renderBox();
  }

  window.V60_HOME = { html: function (api) { API = api; return homeHtml(api); }, schedule: function (api) { return sched(api); } };

  (window.V60_MODULES = window.V60_MODULES || []).push({
    id: "home",
    tabs: [{ id: "maint", section: "maint", label: "Maintain", order: 1, html: '<section><h2>Maintenance</h2><p class="lede">Volvo\'s 2016 schedule against your service log.</p><div id="mtBody"></div></section>' },
      { id: "settings", section: "car", label: "Settings", order: 99, hidden: true, html: '<section><h2>Settings</h2><p class="lede">Sync, backup and how much detail the app shows.</p><div id="setBody"></div></section>' }],
    init: function (api) {
      API = api;
      document.addEventListener("click", function (e) {
        var b = e.target.closest && e.target.closest("[data-sdepth]"); if (!b) return;
        var d = api.mod("story") || {}; d.depth = b.getAttribute("data-sdepth"); api.setMod("story", d); api.save(); renderSettings(api);
      });
    },
    render: function (api, tab) { API = api; if (tab === "maint") renderMaint(api); else if (tab === "settings") renderSettings(api); },
    clean: function (v) { return v && typeof v === "object" ? v : null; }
  });
})();
