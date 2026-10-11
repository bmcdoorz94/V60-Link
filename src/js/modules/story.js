/* Story mode: "The As-Is File" as a case board. Each unknown about the car is a case (Unknown -> Lead -> Evidence -> Closed),
   closed by evidence from the rest of the app. Closing a case queues a scene (SVG line art + typed captions) built from the real result.
   Lars, the narrator, is fictional; every fact he states is sourced elsewhere in the app. */
(function () {
  var CAR = '<path class="ln" d="M60 250 L56 214 Q60 196 96 190 L214 180 L304 130 Q316 124 332 124 L512 124 Q556 128 598 162 L638 194 Q658 202 662 222 L664 250 Z"/><path class="ln thin" d="M226 176 L304 136 L360 136 L360 176 Z M372 136 L506 136 Q542 140 576 168 L588 176 L372 176 Z"/><circle class="ln" cx="170" cy="252" r="38"/><circle class="ln" cx="560" cy="252" r="38"/><circle class="ln thin" cx="170" cy="252" r="16"/><circle class="ln thin" cx="560" cy="252" r="16"/>';
  var SCENES = {
    road: '<g class="sc-road"><line class="lane" x1="0" y1="312" x2="720" y2="312"/><line class="ground" x1="0" y1="292" x2="720" y2="292"/>' + '<g class="carmove">' + CAR + '<path class="beam" d="M664 214 L720 196 L720 250 Z"/></g></g>',
    car: '<g class="draw">' + CAR + '<line class="ground" x1="20" y1="292" x2="700" y2="292"/></g>',
    bay: '<g class="draw"><path class="ln" d="M120 60 Q360 30 600 60 L612 300 Q360 326 108 300 Z"/><rect class="ln" x="160" y="74" width="400" height="24" rx="5"/><rect class="ln" x="250" y="140" width="230" height="120" rx="14"/><rect class="ln thin" x="136" y="140" width="80" height="70" rx="6"/><rect class="ln thin" x="500" y="236" width="60" height="40" rx="8"/><circle class="ln thin" cx="300" cy="180" r="12"/><text class="q" x="410" y="210">?</text></g>',
    papers: '<g class="draw"><rect class="ln" x="250" y="70" width="190" height="240" rx="8" transform="rotate(-6 345 190)"/><rect class="ln" x="270" y="60" width="190" height="240" rx="8" transform="rotate(4 365 180)"/><text class="q big" x="345" y="215">?</text></g>',
    belt: '<g class="draw spin"><circle class="ln" cx="300" cy="180" r="70"/><circle class="ln" cx="470" cy="150" r="46"/><path class="ln" d="M300 110 L470 104 M300 250 L476 196"/><circle class="ln thin" cx="300" cy="180" r="12"/><circle class="ln thin" cx="470" cy="150" r="10"/></g>',
    scan: '<g class="draw"><rect class="ln" x="230" y="150" width="140" height="70" rx="10"/><path class="ln thin" d="M250 175h100M250 195h100"/><g class="waves"><path class="ln" d="M400 140 Q430 185 400 230"/><path class="ln" d="M430 120 Q480 185 430 250"/><path class="ln" d="M460 100 Q530 185 460 270"/></g><rect class="ln" x="560" y="120" width="70" height="130" rx="12"/></g>',
    gauge: '<g class="draw"><path class="ln" d="M220 280 A140 140 0 0 1 500 280"/><g class="needle"><line class="ln" x1="360" y1="280" x2="360" y2="160"/></g><circle class="ln" cx="360" cy="280" r="10"/></g>',
    tires: '<g class="draw"><circle class="ln" cx="360" cy="190" r="110"/><circle class="ln thin" cx="360" cy="190" r="70"/><text class="mono" x="360" y="96">DOT 2419</text><path class="ln thin" d="M260 150 L300 160 M250 200 L292 200 M262 246 L302 232"/></g>',
    wrench: '<g class="draw spin"><path class="ln" d="M300 260 L420 140 M408 112 A30 30 0 1 0 448 152 L430 140 L420 130 Z"/></g>',
    wave: '<g class="draw"><path class="ln" d="M120 190 Q160 120 200 190 T280 190 T360 190 T440 190 T520 190 T600 190"/><path class="ln thin" d="M120 230 Q170 200 220 230 T320 230 T420 230 T520 230 T600 230"/></g>',
    badge: '<g class="draw glow"><path class="ln" d="M360 70 L400 120 L460 120 L430 170 L450 230 L360 200 L270 230 L290 170 L260 120 L320 120 Z"/><text class="mono" x="360" y="280">V60 MASTER</text></g>'
  };
  /* ---------- helpers that read evidence from the rest of the app ---------- */
  function D(api) { var d = api.mod("story"); if (!d) { d = { seen: {}, closed: {}, manual: {}, pending: [] }; api.setMod("story", d); } d.closed = d.closed || {}; d.manual = d.manual || {}; d.pending = d.pending || []; d.seen = d.seen || {}; return d; }
  function M(api, id) { var x = api.acad().done[id]; return !!(x && x.outcome !== "skip"); }
  function man(api, k) { return !!D(api).manual[k]; }
  function mod(api, id, def) { return api.mod(id) || def; }
  function receipts(api) { return (mod(api, "glove", {}).receipts || []).length; }
  function tools(api) { var t = mod(api, "glove", {}).tools || {}; return Object.keys(t).filter(function (k) { return t[k]; }).length; }
  function diyDone(api, id) { var d = mod(api, "diy", { done: {} }).done || {}; return id ? !!d[id] : Object.keys(d).length; }
  function tsbMark(api, id) { return (mod(api, "tsb", { mark: {} }).mark || {})[id]; }
  function buildMonth(api) { return mod(api, "tsb", {}).build || ""; }
  function recallsDone(api) { var rs = api.state.recalls || {}; return api.RECALLS.every(function (r) { return rs[r.id] && rs[r.id] !== "unknown"; }); }
  function realScans(api) { var n = (mod(api, "live", { scans: [] }).scans || []).filter(function (s) { return !s.sim; }).length; return n || (api.state.lastScan ? 1 : 0); }
  function oil(api) { return api.oilRate(); }
  function plural(n, w) { return n + " " + w + (n === 1 ? "" : "s"); }

  /* ---------- the case file ---------- */
  var ACTS = [["1", "Arrival"], ["2", "The Unknowns"], ["3", "The Voice"], ["4", "Ownership"]];
  var CASES = [
    { id: "safe", act: "1", crit: true, t: "Safe to Touch", sub: "Learn the car's layout and the rules before touching anything.", scene: "bay",
      steps: [
        { t: "Learn the four jobs every car does", stage: "lead", ok: function (a) { return M(a, "m-sys"); }, go: "mission:m-sys" },
        { t: "Read the safety rules", stage: "lead", ok: function (a) { return M(a, "m-safe"); }, go: "mission:m-safe" },
        { t: "Open the hood", stage: "evidence", ok: function (a) { return M(a, "m-hood"); }, go: "mission:m-hood" },
        { t: "Find the key landmarks", stage: "evidence", ok: function (a) { return M(a, "m-five"); }, go: "mission:m-five" }],
      close: function (a) { return M(a, "m-safe") && M(a, "m-hood") && M(a, "m-five"); },
      result: function () { return [["bay", "The hood is open. Oil, coolant, brake fluid and washer fluid each have a place, and now you know them."], ["wave", "Lars: One rule from Volvo's own manual. Never open the hood while start/stop has the engine paused. It can restart by itself."]]; } },
    { id: "belt", act: "2", crit: true, t: "The Belt", sub: "Nobody can say whether the timing belt was ever replaced.", scene: "belt",
      steps: [
        { t: "Hunt for service records", stage: "lead", ok: function (a) { return M(a, "m-hist"); }, go: "mission:m-hist" },
        { t: "Work through the timing belt detective mission", stage: "lead", ok: function (a) { return M(a, "m-belt"); }, go: "mission:m-belt" },
        { t: "Add any receipt you find", stage: "lead", ok: function (a) { return receipts(a) > 0; }, go: "tab:glove" },
        { t: "Book a baseline inspection at a Volvo specialist", stage: "evidence", ok: function (a) { return M(a, "m-ppi"); }, go: "kb:a-shops" },
        { t: "Log the belt service, or a shop's written confirmation", stage: "evidence", ok: function (a) { return !!a.lastFor("timingbelt"); }, go: "tab:records" }],
      close: function (a) { return !!a.lastFor("timingbelt"); },
      result: function (a) { var e = a.lastFor("timingbelt"); return [["belt", "Belt record found: " + e.date + (e.miles ? " at " + a.fmt(e.miles) + " miles" : "") + "."], ["papers", "The service log now tracks when the next one is due."], ["wave", "Lars: That was the biggest unknown on this car. Now it's a date on a calendar instead of a gamble."]]; } },
    { id: "thirst", act: "2", crit: true, t: "The Thirst", sub: "Some 2015–16 Drive-E engines burn oil. Does yours?", scene: "gauge",
      steps: [
        { t: "Learn to read the oil level in the instrument cluster", stage: "lead", ok: function (a) { return M(a, "m-oil"); }, go: "mission:m-oil" },
        { t: "Log your first oil level check", stage: "lead", ok: function (a) { return a.state.oil.length > 0; }, go: "tab:records" },
        { t: "Read Volvo's piston ring bulletin, TJ31216", stage: "lead", manual: "r31216", go: "tsb:TJ31216" },
        { t: "Keep logging checks across at least 1,000 miles", stage: "evidence", ok: function (a) { var r = oil(a); return !!(r && r.span >= 1000); }, go: "tab:records", prog: function (a) { var r = oil(a); return r ? a.fmt(r.span) + " of 1,000 mi" : ""; } }],
      close: function (a) { var r = oil(a); return !!(r && r.span >= 1000); },
      result: function (a) { var r = oil(a); return [["gauge", r.added ? r.added + " quart" + (r.added === 1 ? "" : "s") + " added over " + a.fmt(r.span) + " miles: " + r.rate.toFixed(2) + " per 1,000 miles." : "No oil added over " + a.fmt(r.span) + " miles."], ["wave", r.added ? "Lars: That number is your evidence. Keep logging. If it climbs, bring the log and bulletin TJ31216 to a shop." : "Lars: No top-ups at all. Keep checking monthly. Ring wear, if it comes, shows up slowly."]]; } },
    { id: "light", act: "2", crit: true, t: "The Light That Won't Go Out", sub: "The tire pressure light has been on since you bought the car.", scene: "tires",
      steps: [
        { t: "Learn how the tire monitor reads wheel speeds", stage: "lead", ok: function (a) { return M(a, "m-tires"); }, go: "mission:m-tires" },
        { t: "Record all four pressures cold", stage: "lead", ok: function (a) { return M(a, "m-psi"); }, go: "mission:m-psi" },
        { t: "Check tread depth and tire age", stage: "lead", ok: function (a) { return M(a, "m-tread"); }, go: "mission:m-tread" },
        { t: "Set 38 psi and calibrate the monitor", stage: "evidence", ok: function (a) { return diyDone(a, "j-tires"); }, go: "diy:j-tires" },
        { t: "Drive 15 minutes, then confirm the light stays off", stage: "evidence", manual: "lightoff", go: "tree:tpms" }],
      close: function (a) { return man(a, "lightoff") || (diyDone(a, "j-tires") && /^(ask|have)$/.test(tsbMark(a, "TJ29818") || "")); },
      result: function (a) { return man(a, "lightoff") ? [["tires", "Calibrated. The light is off."], ["wave", "Lars: This car compares wheel speeds instead of measuring pressure, so recalibrate after every pressure change and every 10,000 miles. That's straight from Volvo's bulletin."]] : [["tires", "The calibration didn't hold."], ["papers", "Lars: That's what bulletin TJ29818 is for, and it's on your shop note. Matched tires first, then the wheel-speed encoder rings."]]; } },
    { id: "paper", act: "2", crit: true, t: "The Paper Trail", sub: "Recalls, bulletins and factory records that follow this car.", scene: "papers",
      steps: [
        { t: "Learn how recalls work", stage: "lead", ok: function (a) { return M(a, "m-recall"); }, go: "mission:m-recall" },
        { t: "Set every recall to done or not applicable", stage: "evidence", ok: recallsDone, go: "tab:my" },
        { t: "Enter your build month from the door-pillar label", stage: "evidence", ok: function (a) { return !!buildMonth(a); }, go: "tab:bulletins" },
        { t: "Ask a Volvo dealer to check service action S29842 (spark plugs) by VIN", stage: "evidence", manual: "s29842", go: "tsb:S29842" },
        { t: "Optional: ask for the factory option list by VIN", stage: "lead", manual: "options", optional: true, go: "kb:a-trim" }],
      close: function (a) { return recallsDone(a) && !!buildMonth(a) && man(a, "s29842"); },
      result: function (a) { return [["papers", "Recalls settled. Build month " + buildMonth(a) + " on file, so the Bulletins tab knows which production ranges cover your car."], ["wave", "Lars: Paperwork is dull right up until a free repair is sitting in it."]]; } },
    { id: "baseline", act: "3", crit: true, t: "Baseline", sub: "Learn what normal looks like for this car, so you notice when it changes.", scene: "scan",
      steps: [
        { t: "Learn what OBD-II can and can't tell you", stage: "lead", ok: function (a) { return M(a, "m-obd"); }, go: "mission:m-obd" },
        { t: "Get a Bluetooth LE adapter (OBDLink CX)", stage: "lead", ok: function (a) { return M(a, "m-adapter"); }, go: "mission:m-adapter" },
        { t: "Run a real health check and save it", stage: "evidence", ok: function (a) { return realScans(a) > 0; }, go: "tab:live" },
        { t: "Save three real drives in the Data lab", stage: "evidence", ok: function (a) { return a.state.runs.length >= 3; }, go: "tab:lab", prog: function (a) { return Math.min(3, a.state.runs.length) + " of 3"; } }],
      close: function (a) { return realScans(a) > 0 && a.state.runs.length >= 3; },
      result: function (a) { var s = a.state.lastScan; return [["scan", s ? "Last health check: check-engine light " + (s.mil ? "on" : "off") + ", " + plural(s.codes || 0, "code") + ", " + plural((s.notReady || []).length, "monitor") + " not ready." : "Health check saved."], ["wave", "Lars: Now you know what normal looks like for this car. Everything from here gets compared against it."]]; } },
    { id: "wrench", act: "4", crit: false, t: "First Wrench", sub: "Your first real job on the car.", scene: "wrench",
      steps: [
        { t: "Build a starter tool kit (5 tools)", stage: "lead", ok: function (a) { return tools(a) >= 5; }, go: "tab:glove", prog: function (a) { return Math.min(5, tools(a)) + " of 5"; } },
        { t: "Inspect the engine air filter", stage: "lead", ok: function (a) { return M(a, "m-airf"); }, go: "mission:m-airf" },
        { t: "Finish your first DIY job", stage: "evidence", ok: function (a) { return diyDone(a) > 0; }, go: "tab:diy" }],
      close: function (a) { return diyDone(a) > 0; },
      result: function () { return [["wrench", "First job done, from Volvo's own procedure."], ["wave", "Lars: The first one is always the slowest. After this the car stops being a black box."]]; } },
    { id: "sense", act: "4", crit: false, t: "Sixth Sense", sub: "Cars warn you before they fail. Learn to notice.", scene: "wave",
      steps: [
        { t: "What that noise means", stage: "lead", ok: function (a) { return M(a, "m-sound"); }, go: "mission:m-sound" },
        { t: "What that smell means", stage: "lead", ok: function (a) { return M(a, "m-smell"); }, go: "mission:m-smell" },
        { t: "What that feeling means", stage: "lead", ok: function (a) { return M(a, "m-feel"); }, go: "mission:m-feel" },
        { t: "Pass the stop-or-go final", stage: "evidence", ok: function (a) { return M(a, "m-boss"); }, go: "mission:m-boss" }],
      close: function (a) { return M(a, "m-boss"); },
      result: function () { return [["wave", "A squeal at a stop. A sweet smell from the vents. A shudder at sixty."], ["wave", "Lars: You know which ones mean pull over and which ones mean book a shop. That's most of what I did for a living."]]; } }
  ];
  var CRIT = CASES.filter(function (c) { return c.crit; }).map(function (c) { return c.id; });
  var PRO = { id: "pro", t: "Prologue: The As-Is File", lines: [
    ["road", "Summer 2025. A Volvo wagon with just under 90,000 miles rolls off an independent lot."],
    ["papers", "Sold as-is. No service records. No promises."],
    ["car", "2016 Volvo V60 T5. Two liters, one turbo, 240 horsepower."],
    ["wrench", "Lars: I fixed these cars for a living. I'll ride along. You do the work, I'll tell you what it means."],
    ["belt", "Lars: Every unknown about this car is a case. The belt. The oil. That tire light. We close them one at a time."]] };

  /* ---------- status ---------- */
  function status(api, c) {
    var d = D(api), cl = d.closed[c.id];
    var done = c.steps.map(function (s) { return s.manual ? man(api, s.manual) : !!s.ok(api); });
    if (cl) return { st: cl.how === "reason" ? "risk" : "closed", done: done, rec: cl };
    var ev = c.steps.some(function (s, i) { return done[i] && s.stage === "evidence"; }), ld = done.some(Boolean);
    return { st: ev ? "evidence" : (ld ? "lead" : "unknown"), done: done };
  }
  var PILL = { unknown: ["Unknown", "none"], lead: ["Lead", "info"], evidence: ["Evidence", "watch"], closed: ["Closed", "ok"], risk: ["Known risk", "concern"] };
  function finaleReady(api) { var d = D(api), e = api.mod("exam"); return !!(e && e.passed) && CRIT.every(function (id) { return d.closed[id]; }); }
  /* record closures; returns true if anything changed */
  function sweep(api) {
    var d = D(api), changed = false;
    CASES.forEach(function (c) {
      if (d.closed[c.id]) return;
      var ok = false; try { ok = c.close(api); } catch (e) { ok = false; }
      if (ok) { d.closed[c.id] = { date: api.todayStr(), how: "evidence", lines: c.result(api) }; d.pending.push("case-" + c.id); changed = true; }
    });
    if (!d.closed.fin && finaleReady(api)) { d.closed.fin = { date: api.todayStr(), how: "evidence" }; d.pending.push("fin"); changed = true; }
    if (changed) { api.save(); api.updateHud(); }
    return changed;
  }
  function nextStep(api) {
    for (var i = 0; i < CASES.length; i++) {
      var c = CASES[i], s = status(api, c); if (s.st === "closed" || s.st === "risk") continue;
      for (var k = 0; k < c.steps.length; k++) if (!s.done[k] && !c.steps[k].optional) return { c: c, s: c.steps[k], k: k };
    }
    return null;
  }
  function finScene(api) {
    var d = D(api), risks = CASES.filter(function (c) { return d.closed[c.id] && d.closed[c.id].how === "reason"; });
    return { id: "fin", t: "Finale: Master of the V60", lines: [["badge", "Certified on your own car."], ["car", "The as-is wagon now has the most complete history it has ever had, and an owner who can explain every part of it."]].concat(risks.length ? [["papers", "Lars: Still on the list as known risks: " + risks.map(function (c) { return c.t; }).join(", ") + ". Don't let them drop off."]] : []).concat([["road", "Lars: The file never really closes. Every mile adds to it. New cases will open when the car tells us something."]]) };
  }
  function sceneById(api, id) {
    if (id === "pro") return PRO;
    if (id === "fin") return finScene(api);
    var c = CASES.filter(function (x) { return "case-" + x.id === id; })[0], rec = c && D(api).closed[c.id];
    if (!c || !rec) return null;
    var lines = rec.how === "reason" ? [[c.scene, "Case logged as a known risk: " + rec.reason], ["wave", "Lars: Fair enough, as long as it stays on the list. It shows up in the finale until it's really closed."]] : (rec.lines || []);
    return { id: id, t: "Case closed: " + c.t, lines: lines };
  }

  /* ---------- cinema ---------- */
  var cin = { ch: null, i: 0, timer: null, typed: null };
  function reduce() { try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } }
  function play(api, id) {
    var s = sceneById(api, id); if (!s || !s.lines.length) return;
    cin.ch = s; cin.i = 0;
    var ov = document.getElementById("cinema");
    ov.hidden = false; document.body.classList.add("cine-open");
    ov.querySelector(".cin-title").textContent = s.t;
    showLine(api); ov.focus();
  }
  function showLine(api) {
    var ov = document.getElementById("cinema"), s = cin.ch, ln = s.lines[cin.i];
    clearTimeout(cin.timer); clearInterval(cin.typed);
    ov.querySelector(".cin-stage").innerHTML = '<svg viewBox="0 0 720 340" aria-hidden="true">' + (SCENES[ln[0]] || "") + "</svg>";
    var cap = ov.querySelector(".cin-cap"), text = ln[1], n = 0;
    ov.querySelector(".cin-dots").innerHTML = s.lines.map(function (_, k) { return '<i class="' + (k === cin.i ? "on" : (k < cin.i ? "past" : "")) + '"></i>'; }).join("");
    if (reduce()) cap.textContent = text;
    else { cap.textContent = ""; cin.typed = setInterval(function () { n += 2; cap.textContent = text.slice(0, n); if (n >= text.length) clearInterval(cin.typed); }, 28); }
    cin.timer = setTimeout(function () { next(api); }, Math.max(3800, text.length * 62));
  }
  function next(api) { if (!cin.ch) return; if (cin.i < cin.ch.lines.length - 1) { cin.i++; showLine(api); } else close(api); }
  function close(api) {
    clearTimeout(cin.timer); clearInterval(cin.typed);
    var ov = document.getElementById("cinema"); ov.hidden = true; document.body.classList.remove("cine-open");
    if (cin.ch) { var d = D(api); d.seen[cin.ch.id] = api.todayStr(); d.pending = d.pending.filter(function (p) { return p !== cin.ch.id; }); api.save(); }
    cin.ch = null; api.renderAll();
  }

  /* ---------- render ---------- */
  var ui = { open: null };
  function sideList(api) {
    var A = api.acad(), cards = mod(api, "cards", { b: {} }).b || {}, up = mod(api, "upg", { want: {} }).want || {};
    return [
      ["Career jobs", Object.keys(A.jobs || {}).length + " of " + api.JOBS.length + " diagnosed", "tab:academy"],
      ["Mystery cars", ((A.sim || {}).correct || 0) + " solved", "tab:sim"],
      ["DIY jobs", diyDone(api) + " done", "tab:diy"],
      ["Flashcards", Object.keys(cards).filter(function (k) { return cards[k][0] >= 4; }).length + " mastered", "tab:cards"],
      ["Seasonal checklist and achievements", "Real-world proof", "tab:achieve"],
      ["Upgrades", Object.keys(up).filter(function (k) { return up[k] === "done"; }).length + " done", "tab:upgrades"],
      ["Photo mapping", (api.state.photos || []).length + " photos", "tab:my"],
      ["Fuel log", (mod(api, "fuel", { fills: [] }).fills || []).length + " fill-ups", "tab:fuel"]
    ];
  }
  function caseHTML(api, c, s) {
    var esc = api.esc, open = ui.open === c.id, n = c.steps.filter(function (x, i) { return s.done[i] && !x.optional; }).length, tot = c.steps.filter(function (x) { return !x.optional; }).length, d = D(api);
    var h = '<li class="case ' + s.st + (open ? " open" : "") + '"><button type="button" class="caseh" data-case="' + c.id + '" aria-expanded="' + open + '"><span class="pill ' + PILL[s.st][1] + '">' + PILL[s.st][0] + '</span><span class="ct"><b>' + esc(c.t) + "</b><small>" + esc(c.sub) + '</small></span><span class="cn">' + (s.st === "closed" || s.st === "risk" ? "" : n + "/" + tot) + "</span></button>";
    if (!open) return h + "</li>";
    h += '<div class="caseb"><ol class="steps">' + c.steps.map(function (st, i) {
      var ok = s.done[i], pr = st.prog && !ok ? st.prog(api) : "";
      return '<li class="' + (ok ? "done" : "") + '"><span class="sdot" aria-hidden="true">' + (ok ? "✓" : "") + '</span><span class="stx">' + esc(st.t) + (st.optional ? ' <span class="pill none">optional</span>' : "") + (pr ? '<small>' + esc(pr) + "</small>" : "") + '</span><span class="sact">' + (st.manual ? '<button type="button" class="quiet" data-man="' + st.manual + '" aria-pressed="' + ok + '">' + (ok ? "Undo" : "Mark done") + "</button>" : "") + (st.go && !ok ? '<button type="button" class="quiet" data-jump="' + esc(st.go) + '">Go</button>' : "") + "</span></li>";
    }).join("") + "</ol>";
    if (s.st === "closed" || s.st === "risk") {
      h += '<p class="status">' + (s.st === "risk" ? "Logged as a known risk on " + esc(s.rec.date) + ": " + esc(s.rec.reason) : "Closed on " + esc(s.rec.date) + ".") + '</p><div class="row"><button type="button" class="quiet" data-jump="story:case-' + c.id + '">Watch the scene</button>' + (s.st === "risk" ? '<button type="button" class="quiet" data-reopen="' + c.id + '">Reopen</button>' : "") + "</div>";
    } else {
      h += '<details class="reason"><summary>Can\'t close it yet?</summary><p class="status">Log it as a known risk so the story keeps moving. It stays flagged until the evidence arrives, and the finale lists it.</p><div class="field"><label for="rs-' + c.id + '">Reason</label><select id="rs-' + c.id + '"><option>Can\'t afford it yet</option><option>Waiting on a shop appointment</option><option>Doesn\'t apply to my car</option><option value="">Other (type below)</option></select></div><div class="field"><label for="rt-' + c.id + '">Details (optional)</label><input id="rt-' + c.id + '" type="text" maxlength="140"></div><button type="button" class="quiet" data-reason="' + c.id + '">Log as known risk</button></details>';
    }
    return h + "</div></li>";
  }
  function render(api) {
    var $ = api.$, esc = api.esc, d = D(api);
    sweep(api);
    var closed = CASES.filter(function (c) { return d.closed[c.id]; }).length, nx = nextStep(api), fin = !!d.closed.fin;
    $("stProg").innerHTML = '<div class="sbar" role="progressbar" aria-valuemin="0" aria-valuemax="' + CASES.length + '" aria-valuenow="' + closed + '"><i style="width:' + Math.round(closed / CASES.length * 100) + '%"></i></div><p class="status">' + closed + " of " + CASES.length + " cases closed" + (fin ? " · Finale reached" : "") + "</p>";
    var pend = d.pending.filter(function (p) { return sceneById(api, p); });
    $("stNext").innerHTML = (pend.length ? '<div class="nextc scene"><p class="ans-k">New scene</p><h3>' + esc(sceneById(api, pend[0]).t) + '</h3><button type="button" data-jump="story:' + pend[0] + '">Watch</button></div>' : "") +
      (nx ? '<div class="nextc"><p class="ans-k">Next objective · ' + esc(nx.c.t) + "</p><h3>" + esc(nx.s.t) + '</h3><div class="row">' + (nx.s.manual ? '<button type="button" data-man="' + nx.s.manual + '">Mark done</button>' : "") + (nx.s.go ? '<button type="button" class="' + (nx.s.manual ? "quiet" : "") + '" data-jump="' + esc(nx.s.go) + '">' + (nx.s.manual ? "Open" : "Go") + "</button>" : "") + '<button type="button" class="quiet" data-case="' + nx.c.id + '">See the case</button></div></div>' : (fin ? "" : '<div class="nextc"><p class="ans-k">Next objective · Finale</p><h3>Pass the V60 Master exam</h3><button type="button" data-jump="tab:exam">Take the exam</button></div>'));
    if (ui.open == null && nx) ui.open = nx.c.id;
    $("stActs").innerHTML = ACTS.map(function (act) {
      var cs = CASES.filter(function (c) { return c.act === act[0]; });
      return '<section class="act"><h3><span>Act ' + act[0] + "</span> " + esc(act[1]) + '</h3><ul class="cases">' + cs.map(function (c) { return caseHTML(api, c, status(api, c)); }).join("") + "</ul></section>";
    }).join("") + '<section class="act"><h3><span>Finale</span> Master of the V60</h3><ul class="cases"><li class="case ' + (fin ? "closed" : "unknown") + '"><div class="caseh static"><span class="pill ' + (fin ? "ok" : "none") + '">' + (fin ? "Reached" : "Locked") + '</span><span class="ct"><b>Close the critical cases and pass the exam</b><small>' + CRIT.filter(function (id) { return d.closed[id]; }).length + " of " + CRIT.length + " critical cases closed · exam " + ((api.mod("exam") || {}).passed ? "passed" : "not passed yet") + "</small></span></div>" + (fin ? '<div class="caseb"><button type="button" class="quiet" data-jump="story:fin">Watch the finale</button></div>' : "") + "</li></ul></section>";
    var alerts = api.computeHealth().actions.filter(function (a) { return a.sev >= 48; });
    $("stNew").innerHTML = fin ? '<h3>New cases</h3>' + (alerts.length ? '<ul class="tlist">' + alerts.slice(0, 6).map(function (a) { return '<li><span class="pill concern">Open</span><button type="button" class="tlink" data-jump="' + esc(a.jump) + '">' + esc(a.text) + "</button></li>"; }).join("") + "</ul>" : '<p class="status">Nothing new. Cases open here when a scan, the fuel log, a bulletin or a renewal flags something.</p>') : (alerts.length ? '<p class="status">' + plural(alerts.length, "urgent item") + ' in Health also need attention. <button type="button" class="quiet" data-jump="tab:health">Open Health</button></p>' : "");
    $("stSide").innerHTML = sideList(api).map(function (x) { return '<li><button type="button" class="mbtn" data-jump="' + x[2] + '"><span class="mt">' + esc(x[0]) + '</span><span class="status">' + esc(x[1]) + "</span></button></li>"; }).join("");
    var seenable = ["pro"].concat(CASES.filter(function (c) { return d.closed[c.id]; }).map(function (c) { return "case-" + c.id; })).concat(fin ? ["fin"] : []);
    $("stScenes").innerHTML = seenable.map(function (id) { var s = sceneById(api, id); return '<li><button type="button" class="mbtn" data-jump="story:' + id + '"><span class="mt">' + esc(s.t) + '</span><span class="status">' + (d.seen[id] ? "Watched " + esc(d.seen[id]) : "Not watched") + "</span></button></li>"; }).join("");
  }

  (window.V60_MODULES = window.V60_MODULES || []).push({
    id: "story",
    tabs: [{ id: "story", section: "learn", label: "Story", order: 5, html:
      '<section class="sthero"><p class="ans-k">Story</p><h2>The As-Is File</h2><p class="lede">Every unknown about your car is a case. Close cases by doing the real thing: logging, checking, scanning, fixing. The Academy and the other tabs are where the work happens; this is where it adds up.</p><div id="stProg"></div></section>' +
      '<div id="stNext" class="stnext"></div><div id="stActs"></div><div id="stNew"></div>' +
      '<section class="card"><details><summary>Side missions (optional)</summary><p class="status">Extra practice and XP. None of these block the story.</p><ul class="joblist" id="stSide"></ul></details></section>' +
      '<section class="card"><details><summary>Scenes</summary><ul class="joblist" id="stScenes"></ul><p class="status">Lars is a made-up guide. Every fact he states comes from the sources used elsewhere in the app.</p></details></section>' }],
    clean: function (v) {
      if (!v || typeof v !== "object") return null;
      var o = { seen: v.seen && typeof v.seen === "object" ? v.seen : {}, closed: {}, manual: {}, pending: Array.isArray(v.pending) ? v.pending.filter(function (p) { return typeof p === "string"; }).slice(-20) : [] };
      Object.keys(v.closed || {}).forEach(function (k) { var c = v.closed[k]; if (c && typeof c.date === "string" && (c.how === "evidence" || c.how === "reason")) o.closed[k] = { date: c.date, how: c.how, reason: String(c.reason || "").slice(0, 200), lines: Array.isArray(c.lines) ? c.lines.filter(function (l) { return Array.isArray(l) && typeof l[1] === "string"; }).slice(0, 6) : [] }; });
      Object.keys(v.manual || {}).forEach(function (k) { if (typeof v.manual[k] === "string") o.manual[k] = v.manual[k]; });
      return o;
    },
    render: function (api) { render(api); },
    init: function (api) {
      var ov = document.createElement("div");
      ov.id = "cinema"; ov.className = "cinema"; ov.hidden = true; ov.tabIndex = -1; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "Story scene");
      ov.innerHTML = '<div class="cin-top"><span class="cin-title"></span><button type="button" class="cin-skip">Skip</button></div><div class="cin-stage"></div><p class="cin-cap" aria-live="polite"></p><div class="cin-bot"><div class="cin-dots"></div><button type="button" class="cin-next">Next</button></div>';
      document.body.appendChild(ov);
      ov.addEventListener("click", function (e) { if (e.target.closest(".cin-skip")) { close(api); return; } next(api); });
      ov.addEventListener("keydown", function (e) { if (e.key === "Escape") close(api); else if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") { e.preventDefault(); next(api); } });
      api.$("p-story").addEventListener("click", function (e) {
        var b = e.target.closest && e.target.closest("button"); if (!b) return;
        var d = D(api), k;
        if ((k = b.getAttribute("data-case"))) { ui.open = ui.open === k ? "" : k; render(api); var el = document.querySelector('[data-case="' + k + '"]'); if (el && el.scrollIntoView && ui.open === k) el.scrollIntoView({ block: "nearest" }); return; }
        if ((k = b.getAttribute("data-man"))) { if (d.manual[k]) delete d.manual[k]; else d.manual[k] = api.todayStr(); api.save(); render(api); return; }
        if ((k = b.getAttribute("data-reason"))) { var sel = api.$("rs-" + k).value, txt = api.$("rt-" + k).value.trim(), r = [sel, txt].filter(Boolean).join(": ") || "No reason given"; d.closed[k] = { date: api.todayStr(), how: "reason", reason: r.slice(0, 200), lines: [] }; d.pending.push("case-" + k); api.save(); api.updateHud(); render(api); return; }
        if ((k = b.getAttribute("data-reopen"))) { delete d.closed[k]; d.pending = d.pending.filter(function (p) { return p !== "case-" + k; }); ui.open = k; api.save(); render(api); return; }
      });
    },
    xp: function (api) { var d = api.mod("story"); if (!d || !d.closed) return 0; return Object.keys(d.closed).reduce(function (s, k) { var c = d.closed[k]; return s + (k === "fin" ? 150 : (c.how === "evidence" ? 40 : 10)); }, 0); },
    jump: function (api, kind, id) {
      if (kind === "story") { play(api, id); return true; }
      if (kind === "case") { ui.open = id; api.go("story"); return true; }
      return false;
    },
    today: function (api) {
      sweep(api);
      var d = D(api), esc = api.esc, pend = d.pending.filter(function (p) { return sceneById(api, p); });
      if (!d.seen.pro) return [{ order: 4, html: '<article class="tcard story"><p class="ans-k">Your story starts here</p><h3>The As-Is File</h3><p>A used Volvo, sold as-is, with no records. Every unknown is a case.</p><button type="button" data-jump="story:pro">Watch the prologue</button></article>' }];
      if (pend.length) return [{ order: 4, html: '<article class="tcard story"><p class="ans-k">New scene</p><h3>' + esc(sceneById(api, pend[0]).t) + '</h3><button type="button" data-jump="story:' + pend[0] + '">Watch</button></article>' }];
      var nx = nextStep(api);
      if (!nx) return [];
      return [{ order: 4, html: '<article class="tcard story"><p class="ans-k">Next in your story · ' + esc(nx.c.t) + "</p><h3>" + esc(nx.s.t) + '</h3><div class="row">' + (nx.s.go ? '<button type="button" data-jump="' + esc(nx.s.go) + '">Go</button>' : "") + '<button type="button" class="quiet" data-jump="case:' + nx.c.id + '">Open the case</button></div></article>' }];
    }
  });
})();
