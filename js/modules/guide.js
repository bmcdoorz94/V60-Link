/* Guided mode: strong help at the start that steps back as the owner shows they can do things.
   - Three levels per area (under the hood, the adapter, records and papers, tires, reading data):
     0 Guided: the next objective opens a full-screen walkthrough, one step per screen, with a safety check
       before hands-on work and an "I'm stuck" ladder (hint, then the lesson, then log it as a known risk).
     1 Assisted: the case board as usual, with a "Walk me through it" button.
     2 On your own: no prompting beyond what is due.
   - Levels rise from proof: steps finished in the walkthrough without "I'm stuck", right answers in case debriefs,
     and things logged without being led there. They drop after two "stuck" in a row, or after 45 days away.
   - Changes are announced on Today with a "Keep guiding me" undo (Kyle chose "just do it", 2026-10-11).
   - New tabs get a one-time intro line while guidance is on. A "Guide me" button in the header opens the walkthrough. */
(function () {
  var API = null, checked = false;
  var AREA = { safe: "hood", signal: "adapter", belt: "records", thirst: "hood", light: "tires", paper: "records", baseline: "adapter", wrench: "hood", sense: "data" };
  var AREAS = ["hood", "adapter", "records", "tires", "data"];
  var AREA_NAME = { hood: "under-the-hood steps", adapter: "the adapter", records: "records and papers", tires: "tire steps", data: "reading the car's data" };
  var UP = [4, 10]; /* score needed for level 1 and level 2 */
  var CAR = /open the hood|landmarks|find the port|connect in bluefy|oil level check|record all four|tread|set 38|drive 15|door-pillar|baseline drive|three real drives|air filter|first diy job/i;
  var HANDS = /open the hood|landmarks|oil level check|record all four|tread|set 38|air filter|first diy job/i;
  var INTRO = {
    engine: "The engine bay map. Tap a part to see what it is, where it sits and how to check it.",
    live: "Live link talks to the adapter. Connect in Bluefy, run a health check, and save it to the Garage.",
    records: "The service log. Each oil check and service logged here turns guessed due dates into real ones.",
    health: "The Health score. Each item says what is due and what to do next.",
    bay: "The whole-car map. Tap an area to see its parts and their condition.",
    glove: "Glovebox: receipts, papers and tools. Photograph a receipt and the form fills itself in for you to check.",
    diy: "DIY jobs: step-by-step cards from the owner's manual, with tools, time and cost.",
    bulletins: "Volvo's service bulletins for this car, with a check for whether each one applies to yours.",
    fuel: "Fuel and costs: log fill-ups to see your real mileage and spending.",
    my: "My V60: recalls and the details of your car.",
    lab: "Data lab: saved drives side by side, so a change stands out.",
    cards: "Flashcards: a few cards a day about your car. Cards you know come back less often.",
    skills: "The skill tree. Skills are earned from real work, and some unlock tools in the app.",
    trouble: "Troubleshoot: answer a few questions about a symptom to narrow down the cause.",
    kb: "The Library: articles about your car, with sources.",
    exam: "The V60 Master exam. Practice by topic, then take the full exam."
  };

  function today() { return API.todayStr(); }
  function G() {
    var d = API.mod("guide");
    if (!d) { d = { sc: {}, lvl: {}, keep: {}, run: {}, seen: {}, cnt: null, last: null, note: null, at: null, quiz: 0 }; boot(d); API.setMod("guide", d); }
    return d;
  }
  /* someone already part-way through the story should not start back at fully guided */
  function boot(d) {
    var S = window.V60_STORY; if (!S) return;
    S.cases.forEach(function (c) { var st = S.status(c).st; if (st === "closed" || st === "risk") { var a = AREA[c.id]; d.sc[a] = (d.sc[a] || 0) + 3; } });
    AREAS.forEach(function (a) { d.lvl[a] = lvlFor(d.sc[a] || 0); });
  }
  /* coming back after a long gap: each area steps back one level, with a recap on Today (once per app start) */
  function visit() {
    if (checked || !API || !API.ready || !API.ready()) return;
    checked = true; var d = G(), t = today();
    if (d.last && (new Date(t) - new Date(d.last)) / 864e5 >= 45) { AREAS.forEach(function (a) { if (d.lvl[a]) d.lvl[a]--; }); d.back = t; }
    if (d.last !== t) { d.last = t; API.save(); }
  }
  function lvlFor(sc) { return sc >= UP[1] ? 2 : (sc >= UP[0] ? 1 : 0); }
  function areaOf(caseId) { return AREA[caseId] || "records"; }
  function level(caseId) { if (!API) return 2; var d = G(), a = areaOf(caseId); return d.keep[a] ? 0 : (d.lvl[a] || 0); }
  function addScore(a, n, why) {
    var d = G(); d.sc[a] = Math.max(0, (d.sc[a] || 0) + n);
    var was = d.lvl[a] || 0, now = lvlFor(d.sc[a]);
    if (now > was && !d.keep[a]) { d.lvl[a] = now; d.note = { a: a, up: true, to: now, date: today() }; }
    else if (now < was) d.lvl[a] = now;
  }
  function dropLevel(a, reason) {
    var d = G(), was = d.lvl[a] || 0; if (was === 0) return;
    d.lvl[a] = was - 1; d.sc[a] = d.lvl[a] ? UP[d.lvl[a] - 1] : 0; d.note = { a: a, up: false, to: d.lvl[a], date: today(), reason: reason };
  }
  /* things done without being led there count as proof too */
  function counts() {
    var st = API.state, live = API.mod("live") || {}, glove = API.mod("glove") || {}, sq = (API.mod("story") || {}).quiz || {};
    var right = Object.keys(sq).filter(function (k) { return String(sq[k]).indexOf("r") === 0; });
    return { oil: (st.oil || []).length, log: (st.log || []).length, rc: (glove.receipts || []).length, scan: (live.scans || []).filter(function (x) { return !x.sim; }).length, runs: (st.runs || []).length, quiz: right };
  }
  function watch() {
    var d = G(), c = counts(), p = d.cnt;
    d.cnt = { oil: c.oil, log: c.log, rc: c.rc, scan: c.scan, runs: c.runs, quiz: c.quiz.length };
    if (!p || W.open || W.away) return; /* first look, or the walkthrough led it */
    if (c.oil > p.oil) addScore("hood", Math.min(2, c.oil - p.oil));
    if (c.log + c.rc > p.log + p.rc) addScore("records", Math.min(2, c.log + c.rc - p.log - p.rc));
    if (c.scan > p.scan) addScore("adapter", Math.min(2, c.scan - p.scan));
    if (c.runs > p.runs) addScore("data", Math.min(2, c.runs - p.runs));
    if (c.quiz.length > p.quiz) c.quiz.slice(p.quiz).forEach(function (k) { addScore(areaOf(String(k).split("|")[0]), 1); });
  }

  /* ---------- the walkthrough ---------- */
  var W = { open: false, away: false, c: null, k: null, stuck: 0, gate: null, prev: null, used: {}, cred: {} };
  function S() { return window.V60_STORY; }
  function $(id) { return document.getElementById(id); }
  function esc(s) { return API.esc(s); }
  function candidates() {
    var out = [];
    S().cases.forEach(function (c) {
      if (!S().available(c)) return; var s = S().status(c); if (s.st === "closed" || s.st === "risk") return;
      c.steps.forEach(function (st, k) { if (!s.done[k] && !st.optional) out.push({ c: c, k: k, s: st }); });
    });
    return out;
  }
  function pick() {
    var list = candidates(); if (!list.length) return null;
    if (W.c) { var same = list.filter(function (x) { return x.c.id === W.c; }); if (same.length && (W.atCar || !CAR.test(same[0].s.t))) return same[0]; }
    if (W.atCar === false) { var home = list.filter(function (x) { return !CAR.test(x.s.t); }); if (home.length) return home[0]; }
    return list[0];
  }
  function ensureUI() {
    if ($("gwOv")) return;
    var d = document.createElement("div");
    d.innerHTML = '<div class="gwov" id="gwOv" role="dialog" aria-modal="true" aria-labelledby="gwH" hidden><div class="gwbox" id="gwBox"></div></div>' +
      '<button type="button" class="gwpill" id="gwPill" hidden>Back to the walkthrough</button>';
    while (d.firstChild) document.body.appendChild(d.firstChild);
    $("gwPill").addEventListener("click", function () { resume(); });
    $("gwOv").addEventListener("click", onClick);
    $("gwOv").addEventListener("change", function () { var all = [].every.call($("gwBox").querySelectorAll("[data-gwgate]"), function (b) { return b.checked; }); var btn = $("gwBox").querySelector('[data-gw="gate"]'); if (btn) btn.disabled = !all; });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && W.open) close(); });
  }
  function show(html) { $("gwBox").innerHTML = html; $("gwOv").hidden = false; $("gwPill").hidden = true; W.open = true; W.away = false; document.documentElement.classList.add("guiding"); var f = $("gwBox").querySelector("[data-gw]"); if (f && f.focus) try { f.focus({ preventScroll: true }); } catch (e) {} }
  function head(x) {
    var c = x.c, n = c.steps.filter(function (s) { return !s.optional; }).length, pos = c.steps.slice(0, x.k + 1).filter(function (s) { return !s.optional; }).length;
    return '<div class="gwtop"><p class="ans-k">' + esc(c.t) + " · Step " + pos + " of " + n + '</p><button type="button" class="quiet gwx" data-gw="close" aria-label="Leave the walkthrough">Close</button></div><div class="meter thin"><i style="width:' + Math.round(100 * (pos - 1) / n) + '%"></i></div>';
  }
  function start(caseId) {
    ensureUI(); creditIfDone(); W.c = caseId || null; W.k = null; W.stuck = 0;
    var d = G();
    if (!d.at || d.at.date !== today()) {
      show('<div class="gwtop"><p class="ans-k">Walkthrough</p><button type="button" class="quiet gwx" data-gw="close">Close</button></div><h2 id="gwH">Are you at the car right now?</h2><p class="status">Some steps need the car, some don\'t. This picks the right one.</p><div class="gwbig"><button type="button" data-gw="car-yes">Yes, at the car</button><button type="button" class="quiet" data-gw="car-no">No, not right now</button></div>');
      return;
    }
    W.atCar = d.at.car; step();
  }
  function step() {
    var x = pick();
    if (!x) { show('<div class="gwtop"><p class="ans-k">Walkthrough</p><button type="button" class="quiet gwx" data-gw="close">Close</button></div><h2 id="gwH">Nothing left to walk through right now</h2><p>Every open step is done. New cases open as the story moves on.</p><div class="gwbig"><button type="button" data-gw="close">Close</button></div>'); return; }
    if (W.c !== x.c.id) { W.c = x.c.id; }
    if (W.k !== x.k) W.stuck = 0;
    W.k = x.k;
    if (W.atCar && HANDS.test(x.s.t) && W.gate !== today()) { gate(x); return; }
    var s = x.s, lvl = level(x.c.id), prev = W.prev;
    var acts = [];
    if (s.manual) { acts.push('<button type="button" data-gw="done">Done</button>'); if (s.go) acts.push('<button type="button" class="quiet" data-gw="go">' + (s.go.indexOf("mission:") === 0 ? "Open the lesson" : "Open") + "</button>"); }
    else if (s.go) acts.push('<button type="button" data-gw="go">' + (s.go.indexOf("mission:") === 0 ? "Open the lesson" : "Do it in the app") + "</button>");
    if (s.where) acts.push('<button type="button" class="quiet" data-gw="where">Show me where</button>');
    var how = s.mech && lvl === 0 ? '<p class="gwhow"><b>How:</b> ' + esc(s.mech) + "</p>" : "";
    show(head(x) +
      (prev ? '<p class="gwprev"><span class="pill ok">Done</span> ' + esc(prev.t) + (prev.why ? '<span class="status"> · ' + esc(prev.why) + "</span>" : "") + "</p>" : "") +
      '<h2 id="gwH">' + esc(s.t) + "</h2>" + (s.why ? '<p class="gwwhy">' + esc(s.why) + "</p>" : "") + how +
      (s.manual ? "" : '<p class="status">This step ticks itself when it is done in the app.</p>') +
      '<div class="gwbig">' + acts.join("") + "</div>" + stuckHTML(x) +
      '<div class="row gwfoot"><button type="button" class="quiet" data-gw="stuck">' + (W.stuck ? "Still stuck" : "I'm stuck") + "</button></div>");
    W.prev = null;
  }
  function stuckHTML(x) {
    if (!W.stuck) return "";
    var s = x.s, h = [];
    h.push('<div class="gwstuck"><p class="ans-k">Hint</p><p>' + esc(s.mech || s.why || "Open the case for the full briefing.") + "</p>");
    if (W.stuck >= 2 && s.go && s.go.indexOf("mission:") === 0) h.push('<p>The lesson walks through it in smaller steps.</p><div class="row"><button type="button" data-gw="go">Open the lesson</button></div>');
    if (W.stuck >= 2 && s.where) h.push('<div class="row"><button type="button" class="quiet" data-gw="where">Show me where</button></div>');
    if (W.stuck >= 3) h.push('<p>If it can\'t be done right now, log the case as a known risk. The story moves on and the case stays flagged.</p><div class="row"><button type="button" class="quiet" data-gw="risk">Can\'t do it now</button><button type="button" class="quiet" data-gw="skip">Show a different step</button></div>');
    h.push("</div>");
    return h.join("");
  }
  function gate(x) {
    show(head(x) + '<h2 id="gwH">Before touching anything</h2><p class="status">From the owner\'s manual rules in Safe to Touch. Tick each one.</p>' +
      '<div class="gwgate">' + ["Engine off and cold, P selected", "Ignition fully off, not paused by start/stop", "No key inside the cabin", "Cooling fan stopped (it can run up to 6 minutes after shutdown)"].map(function (t, i) { return '<label class="inl"><input type="checkbox" data-gwgate="' + i + '"> ' + esc(t) + "</label>"; }).join("") + "</div>" +
      '<div class="gwbig"><button type="button" data-gw="gate" disabled>Continue</button></div>');
  }
  function close() { W.open = false; W.away = false; $("gwOv").hidden = true; $("gwPill").hidden = true; document.documentElement.classList.remove("guiding"); }
  function away() { W.open = false; W.away = true; W.awayAt = Date.now(); $("gwOv").hidden = true; $("gwPill").hidden = false; document.documentElement.classList.remove("guiding"); }
  function resume() { creditIfDone(); step(); }
  /* the step on screen (or being done in the app) got done: credit it once */
  function creditIfDone() {
    if (W.c == null || W.k == null || !S()) return false;
    var c = S().cases.filter(function (x) { return x.id === W.c; })[0]; if (!c || W.cred[c.id + ":" + W.k]) return false;
    if (S().status(c).done[W.k]) { finished(c, W.k); return true; }
    return false;
  }
  function finished(c, k) {
    var s = c.steps[k], a = areaOf(c.id);
    if (W.cred[c.id + ":" + k]) return; W.cred[c.id + ":" + k] = 1;
    if (!W.used[c.id + ":" + k]) addScore(a, 1);
    G().run[a] = 0; W.prev = s; W.stuck = 0; API.save();
  }
  function onClick(e) {
    var b = e.target.closest && e.target.closest("[data-gw]"); if (!b) return;
    var act = b.getAttribute("data-gw"), d = G(), c = W.c && S().cases.filter(function (x) { return x.id === W.c; })[0], st = c && W.k != null ? c.steps[W.k] : null;
    if (act === "close") { close(); return; }
    if (act === "car-yes" || act === "car-no") { d.at = { date: today(), car: act === "car-yes" }; W.atCar = d.at.car; API.save(); step(); return; }
    if (act === "gate") { W.gate = today(); step(); return; }
    if (act === "done" && st && st.manual) { S().mark(st.manual); finished(c, W.k); API.renderAll(); step(); return; }
    if (act === "go" && st && st.go) { away(); jump(st.go, c.id); return; }
    if (act === "where" && st && st.where) { away(); jump("bay:" + st.where); return; }
    if (act === "stuck") {
      W.stuck++; W.used[c.id + ":" + W.k] = 1;
      var a = areaOf(c.id); d.run[a] = (d.run[a] || 0) + 1;
      if (W.stuck === 1 && d.run[a] >= 2) { dropLevel(a, "stuck"); d.run[a] = 0; }
      API.save(); step(); return;
    }
    if (act === "risk") { away(); jump("case:" + c.id); setTimeout(function () { var r = document.querySelector("#stV-cases details.risk, #stV-cases [id^='rs-" + c.id + "']"); if (r && r.scrollIntoView) r.scrollIntoView({ block: "center" }); }, 300); return; }
    if (act === "skip") { var list = candidates().filter(function (x) { return !(x.c.id === c.id); }); if (list.length) { W.c = list[0].c.id; W.k = null; } step(); return; }
  }
  /* reuse the app's own navigation by clicking a hidden data-jump button, so every jump kind keeps working */
  function jump(target, from) {
    var b = document.createElement("button"); b.type = "button"; b.hidden = true; b.setAttribute("data-jump", target); if (from) b.setAttribute("data-from", from);
    document.body.appendChild(b); b.click(); b.remove();
  }

  /* ---------- one-time intro line on newly opened tabs ---------- */
  function intro(tab) {
    if (!API || !INTRO[tab]) return;
    var d = G(); if (d.seen[tab]) return;
    var anyGuided = AREAS.some(function (a) { return !d.lvl[a] || d.keep[a]; }); if (!anyGuided) return;
    var p = $("p-" + tab); if (!p || p.querySelector(".gintro")) return;
    var n = document.createElement("div"); n.className = "gintro"; n.setAttribute("role", "note");
    n.innerHTML = '<p><span class="pill info">New</span> ' + esc(INTRO[tab]) + '</p><button type="button" class="quiet" data-gintro="' + tab + '">Got it</button>';
    p.insertBefore(n, p.firstChild);
  }

  window.V60_GUIDE = {
    level: function (caseId) { return level(caseId); },
    start: function (caseId) { start(caseId); }
  };

  (window.V60_MODULES = window.V60_MODULES || []).push({
    id: "guide",
    init: function (api) {
      API = api;
      document.addEventListener("click", function (e) {
        var b = e.target.closest && e.target.closest("[data-guide], [data-gintro], [data-gkeep], [data-gok], [data-gback]"); if (!b) return;
        var d = G();
        if (b.hasAttribute("data-gback")) { d.back = null; api.save(); api.renderAll(); return; }
        if (b.hasAttribute("data-guide")) { e.preventDefault(); if (d.back) { d.back = null; api.save(); } start(b.getAttribute("data-guide") === "start" ? null : b.getAttribute("data-guide")); return; }
        if (b.hasAttribute("data-gintro")) { d.seen[b.getAttribute("data-gintro")] = today(); api.save(); var n = b.closest(".gintro"); if (n) n.remove(); return; }
        if (b.hasAttribute("data-gkeep")) { var a = b.getAttribute("data-gkeep"); d.keep[a] = true; d.note = null; api.save(); api.renderAll(); return; }
        if (b.hasAttribute("data-gok")) { d.note = null; api.save(); api.renderAll(); return; }
      });
      /* show the intro line whenever a tab opens */
      var g = window.V60_GATE;
      if (g && g.shown) { var orig = g.shown; g.shown = function (tab) { orig(tab); try { intro(tab); } catch (e) {} }; }
      var hb = document.getElementById("guideBtn"); if (hb) hb.hidden = false;
    },
    refresh: function (api) {
      if (!api.ready || !api.ready()) return; /* saved data not loaded yet */
      visit();
      if (W.away && Date.now() - W.awayAt > 30 * 60e3) { W.away = false; if ($("gwPill")) $("gwPill").hidden = true; }
      try { watch(); } catch (e) {}
      if (W.open && W.k != null && creditIfDone()) step();
      if (W.away && !W.open) { var c = W.c && S() && S().cases.filter(function (x) { return x.id === W.c; })[0]; if (c && S().status(c).done[W.k]) $("gwPill").textContent = "Step done · back to the walkthrough"; }
    },
    today: function (api) {
      visit();
      var d = G(), out = [];
      if (d.note) {
        var n = d.note, nm = AREA_NAME[n.a];
        var t = n.up ? (n.to === 2 ? "You're on your own for " + nm + ". The app only speaks up when something is due." : "Less hand-holding for " + nm + ". The walkthrough is still one tap away.") : (n.reason === "stuck" ? "Guidance is back on for " + nm + " after two stuck steps." : "Guidance is back on for " + nm + ".");
        out.push({ order: 2, html: '<article class="tcard"><p class="ans-k">Lars</p><h3>' + esc(t) + '</h3><div class="row"><button type="button" data-gok="1">Got it</button>' + (n.up ? '<button type="button" class="quiet" data-gkeep="' + n.a + '">Keep guiding me</button>' : "") + "</div></article>" });
      }
      if (d.back) {
        var S0 = S(), closed = S0 ? S0.cases.filter(function (c) { var s = S0.status(c).st; return s === "closed" || s === "risk"; }).length : 0, nx = S0 && S0.next();
        out.push({ order: 3, html: '<article class="tcard"><p class="ans-k">Welcome back</p><h3>Previously: ' + closed + " case" + (closed === 1 ? "" : "s") + " closed.</h3>" + (nx ? "<p>You were on " + esc(nx.c.t) + ": " + esc(nx.s.t) + ".</p>" : "") + '<div class="row"><button type="button" data-guide="start">Pick up where I left off</button><button type="button" class="quiet" data-gback="1">Dismiss</button></div></article>' });
      }
      return out;
    },
    clean: function (v) {
      if (!v || typeof v !== "object") return null;
      var o = { sc: {}, lvl: {}, keep: {}, run: {}, seen: {}, cnt: null, last: typeof v.last === "string" ? v.last : null, note: null, at: null, back: null };
      AREAS.forEach(function (a) {
        if (v.sc && isFinite(v.sc[a])) o.sc[a] = Math.max(0, Math.min(99, +v.sc[a]));
        if (v.lvl && [0, 1, 2].indexOf(v.lvl[a]) >= 0) o.lvl[a] = v.lvl[a];
        if (v.keep && v.keep[a] === true) o.keep[a] = true;
        if (v.run && isFinite(v.run[a])) o.run[a] = Math.max(0, Math.min(9, +v.run[a]));
      });
      if (v.seen && typeof v.seen === "object") Object.keys(v.seen).forEach(function (k) { if (INTRO[k] && typeof v.seen[k] === "string") o.seen[k] = v.seen[k]; });
      if (v.cnt && typeof v.cnt === "object") { o.cnt = {}; ["oil", "log", "rc", "scan", "runs", "quiz"].forEach(function (k) { o.cnt[k] = isFinite(v.cnt[k]) ? +v.cnt[k] : 0; }); }
      if (v.note && AREAS.indexOf(v.note.a) >= 0) o.note = { a: v.note.a, up: !!v.note.up, to: +v.note.to || 0, date: String(v.note.date || ""), reason: v.note.reason === "stuck" ? "stuck" : undefined };
      if (v.at && typeof v.at.date === "string") o.at = { date: v.at.date, car: !!v.at.car };
      if (typeof v.back === "string") o.back = v.back;
      return o;
    }
  });
})();
