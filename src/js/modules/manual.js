/* The workshop manual: home ("The car"), the views you look into, each part's manual (item) and its chapters.
   Owns the unlock rules (the chain of chapters plus the story's cases), the two markers (amber glow = new, never opened;
   amber dot = where you left off), and the gate that decides which old pages are reachable yet.
   Data lives in src/js/data/manual.js. Saved state under api.mod("manual"):
     opened{chapterId: date}  closed{chapterId: date}  manual{stepKey: date}  went{stepKey: 1}  last: chapterId
     views{viewId: {photo: photoId, pins: {itemId: [fx, fy]}}}  sel{viewId: itemId} */
(function () {
  var DATA = window.V60_MANUAL_DATA, VIEWS = DATA.views, ITEMS = DATA.items, PREFACE = DATA.preface, CASE_OPENS = DATA.caseOpens;
  var API = null, CH = {}, CHLIST = [];
  var TIER = { K: "Know it", C: "Check it", S: "Service it", D: "Diagnose it", U: "Upgrade it" };
  PREFACE.item = null; PREFACE.tier = "K"; PREFACE.t = PREFACE.n; CH["0"] = PREFACE; CHLIST.push(PREFACE);
  ITEMS.forEach(function (it) {
    it.viewObj = VIEWS.filter(function (v) { return v.id === it.view; })[0];
    it.chapters.forEach(function (c, i) { c.id = it.num + "." + (i + 1); c.item = it; c.idx = i; CH[c.id] = c; CHLIST.push(c); });
  });
  VIEWS.forEach(function (v) { v.items = ITEMS.filter(function (it) { return it.view === v.id; }); });
  /* the path (data/path.js): one strict line through every chapter, the G1 study and the quizzes */
  var UNITS = window.V60_PATH_DATA || [], STAGES = [], STAGE_OF_CH = {}, STAGE_OF_TASK = {}, STAGE_BY_KEY = {};
  function range(r) { var m = /^([A-G])(\d+)-[A-G](\d+)$/.exec(r), out = []; if (!m) return out; for (var i = +m[2]; i <= +m[3]; i++) out.push(m[1] + i); return out; }
  UNITS.forEach(function (u, ui) {
    u.num = ui + 1;
    u.stages.forEach(function (s) {
      var st = { unit: u, n: STAGES.length + 1, park: s.park || null };
      if (s.ch) { st.kind = "ch"; st.ch = s.ch; st.key = "ch:" + s.ch; STAGE_OF_CH[s.ch] = st; }
      else if (s.g1) { st.kind = "g1"; st.tasks = range(s.g1); st.range = s.g1; st.t = s.t; st.key = "g1:" + s.g1; st.tasks.forEach(function (t) { STAGE_OF_TASK[t] = st; }); }
      else if (s.quiz) { st.kind = "quiz"; st.area = s.quiz; st.rung = s.rung || 1; st.key = "quiz:" + s.quiz + ":" + st.rung; }
      else { st.kind = "mock"; st.key = "mock"; }
      STAGES.push(st); STAGE_BY_KEY[st.key] = st;
    });
  });
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function $(id) { return document.getElementById(id); }

  /* ---------- saved data ---------- */
  function D(api) {
    var d = api.mod("manual"); if (!d) { d = {}; api.setMod("manual", d); }
    ["opened", "closed", "manual", "went", "views", "sel", "parked"].forEach(function (k) { if (!d[k] || typeof d[k] !== "object" || Array.isArray(d[k])) d[k] = {}; });
    if (typeof d.last !== "string") d.last = null;
    return d;
  }
  function mod(api, id, def) { return api.mod(id) || def; }
  function storyD(api) { return mod(api, "story", {}); }
  function allOn(api) { var s = storyD(api); return !!(s.all || (s.closed && s.closed.fin)); }

  /* ---------- steps: what counts as done, and where Go leads ---------- */
  function missionTitle(api, id) { var t = null; (api.CHAPTERS || []).forEach(function (c) { (c.missions || []).forEach(function (m) { if (m.id === id) t = m.title; }); }); return t; }
  function article(id) { return (window.V60_ARTICLES || []).filter(function (a) { return a.id === id; })[0]; }
  function diyJob(id) { return (window.V60_DIY || []).filter(function (j) { return j.id === id; })[0]; }
  function tree(id) { return (window.V60_TREES || {})[id]; }
  function upgrade(id) { return (window.V60_UPGRADES || []).filter(function (u) { return u.id === id; })[0]; }
  function bayItem(api, id) { return (api.BAYITEMS || []).filter(function (b) { return b.id === id; })[0]; }
  function stepKey(c, i) { return c.id + ":" + i; }
  function missionDone(api, id) { var x = api.acad().done[id]; return !!(x && x.outcome !== "skip"); }
  function scansReal(api) {
    var L = mod(api, "live", { scans: [] }).scans || [], ls = api.state.lastScan;
    var n = L.filter(function (x) { return !x.sim; }).length; if (n) return n; if (!ls) return 0;
    return L.some(function (x) { return x.sim && String(x.date).slice(0, 10) === String(ls.date).slice(0, 10); }) ? 0 : 1;
  }
  function info(api, c, i) {
    var s = c.steps[i], k = stepKey(c, i), d = D(api), o = { t: s.t || "", why: s.why || "", go: s.go || "", done: false, kind: "", manual: false, optional: !!s.optional };
    if (s.mission) { o.kind = "Training"; o.t = o.t || missionTitle(api, s.mission) || s.mission; o.go = o.go || "mission:" + s.mission; o.done = missionDone(api, s.mission); }
    else if (s.kb) { var a = article(s.kb); o.kind = "Library"; o.t = o.t || ("Read: " + (a ? a.t : s.kb)); o.go = o.go || "kb:" + s.kb; o.done = !!(window.V60_KNOW && window.V60_KNOW.read && window.V60_KNOW.read(s.kb)); }
    else if (s.diy) { var j = diyJob(s.diy); o.kind = "DIY"; o.t = o.t || (j ? j.t : s.diy); o.go = o.go || "diy:" + s.diy; o.done = !!((mod(api, "diy", { done: {} }).done || {})[s.diy]); }
    else if (s.tree) { var tr = tree(s.tree); o.kind = "Troubleshoot"; o.t = o.t || ("Walk through: " + (tr ? tr.t : s.tree)); o.go = o.go || "tree:" + s.tree; o.done = !!d.went[k]; }
    else if (s.tab) { o.kind = "Page"; o.go = o.go || "tab:" + s.tab; o.done = !!d.went[k]; }
    else if (s.bay) { var b = bayItem(api, s.bay); o.kind = "Map"; o.t = o.t || ("Find: " + (b ? b.n : s.bay)); o.go = o.go || "bay:" + s.bay; o.done = !!d.went[k]; }
    else if (s.part) { var p = api.partById(s.part); o.kind = "Parts list"; o.t = o.t || ("Read: " + (p ? p.name : s.part)); o.go = o.go || "part:" + s.part; o.done = !!d.went[k]; }
    else if (s.photo) { o.kind = "Photo"; o.go = o.go || "tab:my"; o.done = (api.state.photos || []).some(function (p) { return p.kind === s.photo; }); }
    else if (s.record) { o.kind = "Record"; o.go = o.go || "tab:records"; o.done = !!api.lastFor(s.record); }
    else if (s.oil) { o.kind = "Record"; o.go = o.go || "tab:records"; o.done = (api.state.oil || []).length >= s.oil; }
    else if (s.scans) { o.kind = "Live link"; o.go = o.go || "tab:live"; o.done = scansReal(api) >= s.scans; }
    else if (s.receipts) { o.kind = "Glovebox"; o.go = o.go || "tab:glove"; o.done = (mod(api, "glove", {}).receipts || []).length >= s.receipts; }
    else if (s.docs) { o.kind = "Documents"; o.go = o.go || "tab:docs"; o.done = (mod(api, "docs", {}).list || []).length >= s.docs; }
    else if (s.build) { o.kind = "Bulletins"; o.go = o.go || "tab:bulletins"; o.done = !!mod(api, "tsb", {}).build; }
    else if (s.tsb) { o.kind = "Bulletin"; o.go = o.go || "tsb:" + s.tsb; o.done = !!((mod(api, "tsb", { mark: {} }).mark || {})[s.tsb]); }
    else if (s.upg) { var u = upgrade(s.upg); o.kind = "Upgrade"; o.t = o.t || ("Decide: " + (u ? u.t : s.upg)); o.go = o.go || "tab:upgrades"; o.done = !!((mod(api, "upg", { want: {} }).want || {})[s.upg]); }
    else if (s.recall) { o.kind = "Recalls"; o.go = o.go || "tab:my"; var rs = api.state.recalls || {}; o.done = (api.RECALLS || []).every(function (r) { return rs[r.id] && rs[r.id] !== "unknown"; }); }
    else if (s.manual) { o.kind = "You confirm"; o.manual = true; o.done = !!d.manual[s.manual]; }
    if (!o.t) o.t = o.kind;
    /* a step whose evidence is only "you went there" can also be confirmed by hand */
    if (!o.done && (s.tree || s.tab || s.bay || s.part)) o.manual = true;
    return o;
  }

  /* ---------- open, closed, status ---------- */
  var cache = null;
  function bust() { cache = null; }
  function compute(api) {
    if (cache) return cache;
    var closed = {}, open = {}, d = D(api), all = allOn(api);
    CHLIST.forEach(function (c) { closed[c.id] = c.steps.every(function (s, i) { return s.optional || info(api, c, i).done; }); });
    /* the path decides what is open: every step up to the first one not done (or set aside) */
    var tr = api.mod("track") || {}, read = tr.read || {}, quiz = tr.quiz || {}, g1 = tr.g1 || {}, done = {}, cur = null, reached = {}, nDone = 0;
    STAGES.forEach(function (s) {
      done[s.key] = s.kind === "ch" ? !!closed[s.ch] : s.kind === "g1" ? s.tasks.every(function (t) { return !!read[t]; }) : s.kind === "quiz" ? !!(quiz[s.area + ":" + s.rung] || {}).passed : !!g1.passed;
      if (done[s.key]) nDone++;
      if (!cur && !done[s.key] && !d.parked[s.key]) cur = s;
    });
    STAGES.forEach(function (s) { if (all || !cur || s.n <= cur.n) reached[s.key] = true; });
    CHLIST.forEach(function (c) { var s = STAGE_OF_CH[c.id]; open[c.id] = closed[c.id] || !!(s && reached[s.key]) || (!s && all); });
    var parked = STAGES.filter(function (s) { return d.parked[s.key] && !done[s.key]; });
    cache = { closed: closed, open: open, d: d, done: done, cur: cur, reached: reached, nDone: nDone, parked: parked };
    return cache;
  }
  /* the path, as the rest of the app sees it */
  function stageTitle(s) {
    if (s.kind === "ch") { var c = CH[s.ch]; return c.item ? c.item.num + " " + c.item.n + " · " + c.t : PREFACE.n; }
    if (s.kind === "g1") return "Study: " + s.t;
    var a = s.kind === "quiz" && window.V60_TRACK_DATA ? window.V60_TRACK_DATA.areas.filter(function (x) { return x.id === s.area; })[0] : null;
    if (s.kind === "quiz") return "Quiz: " + (a ? a.n : s.area) + ", " + (s.rung === 2 ? "Technician" : "Owner");
    return "The mock G1";
  }
  function stageDesc(s) {
    if (s.kind === "ch") return CH[s.ch].d;
    if (s.kind === "g1") return s.tasks.length + " of ASE's G1 tasks, each with what it is, how it is done and how it applies to your car. Open each one to study it.";
    if (s.kind === "quiz") return "Ten questions in ASE's styles. 70 % passes. A miss shows the answer, why, and the source.";
    return "55 questions drawn the way the test weights its areas, 90 minutes on the clock, and a score report by area.";
  }
  function stageGo(s) { return s.kind === "ch" ? "ch:" + s.ch : s.kind === "g1" ? "study:" + s.range : s.kind === "quiz" ? "quiz:" + s.area + ":" + s.rung : "track:g1"; }
  function stageStarted(api, s) {
    if (s.kind === "ch") { var c = CH[s.ch]; return c.steps.some(function (q, i) { return info(api, c, i).done; }); }
    if (s.kind === "g1") { var r = (api.mod("track") || {}).read || {}; return s.tasks.some(function (t) { return !!r[t]; }); }
    return false;
  }
  function stageState(api, s) { var x = compute(api); return x.done[s.key] ? "done" : x.d.parked[s.key] ? "parked" : x.cur === s ? "current" : x.reached[s.key] ? "open" : "locked"; }
  function chStatus(api, c) {
    var x = compute(api), d = x.d;
    if (x.closed[c.id]) return "closed";
    if (!x.open[c.id]) return "locked";
    if (d.last === c.id) return "resume";
    if (!d.opened[c.id]) return "new";
    return "open";
  }
  function why(api, c) {
    var s = STAGE_OF_CH[c.id], x = compute(api);
    if (!s) return "Not on the path.";
    return "Step " + s.n + " of your path, in " + s.unit.t + ". It opens when the step before it is done" + (x.cur ? "; you are on step " + x.cur.n + "." : ".");
  }
  /* the status of an item or a view is the strongest of its chapters: resume > new > open > closed > locked */
  function roll(list) {
    var any = { resume: 0, "new": 0, open: 0, closed: 0, locked: 0 }; list.forEach(function (s) { any[s]++; });
    if (any.resume) return "resume"; if (any["new"]) return "new"; if (any.open) return "open";
    if (any.closed && !any.locked) return "closed"; if (any.closed) return "open"; return "locked";
  }
  function itemStatus(api, it) { return roll(it.chapters.map(function (c) { return chStatus(api, c); })); }
  function viewStatus(api, v) { return roll(v.items.map(function (it) { return itemStatus(api, it); })); }
  function itemOpen(api, it) { return it.chapters.some(function (c) { return compute(api).open[c.id]; }); }
  function itemClosedN(api, it) { return it.chapters.filter(function (c) { return compute(api).closed[c.id]; }).length; }
  function nextChapter(api, it) { for (var i = 0; i < it.chapters.length; i++) { var c = it.chapters[i]; if (!compute(api).closed[c.id] && compute(api).open[c.id]) return c; } return null; }
  function resumeChapter(api) {
    var d = D(api), x = compute(api);
    if (d.last && CH[d.last] && x.open[d.last] && !x.closed[d.last]) return CH[d.last];
    for (var i = 0; i < CHLIST.length; i++) if (x.open[CHLIST[i].id] && !x.closed[CHLIST[i].id]) return CHLIST[i];
    return null;
  }
  function newList(api) { return CHLIST.filter(function (c) { return chStatus(api, c) === "new"; }); }
  function label(c) { return c.id === "0" ? "0 " + c.n : c.id + " " + c.t; }
  function longLabel(c) { return c.item ? c.item.n + " · " + c.id + " " + c.t : "0 " + c.n; }

  /* ---------- sweep: stamp closures, announce unlocks ---------- */
  var toast = null;
  function sweep(api) {
    bust(); var x = compute(api), d = x.d, changed = false, closedNow = [], first = !Object.keys(d.closed).length && !Object.keys(d.opened).length;
    CHLIST.forEach(function (c) { if (x.closed[c.id] && !d.closed[c.id]) { d.closed[c.id] = api.todayStr(); closedNow.push(c); changed = true; } });
    if (closedNow.length && !first) toast = { t: closedNow.map(label).join(", ") + " closed", d: x.cur ? "Next on your path: step " + x.cur.n + ", " + stageTitle(x.cur) : "The path is complete.", go: x.cur ? 1 : 0 };
    if (changed) api.save();
    unlockTerms(api);
    return changed;
  }

  /* ---------- gate: which old pages exist yet ---------- */
  /* Glovebox and Link are workbenches, not lessons, so they are always open; the path decides the lessons */
  var ROOTS = { car: 1, view: 1, item: 1, index: 1, story: 1, today: 1, academy: 1, glove: 1, live: 1, path: 1 };
  var GO_TAB = { mission: "academy", kb: "kb", diy: "diy", tree: "trouble", tsb: "bulletins", bay: "engine", part: "bay", tab: null };
  function neededTabs(api) {
    var x = compute(api), set = {};
    CHLIST.forEach(function (c) {
      if (!x.open[c.id]) return;
      c.steps.forEach(function (s, i) {
        var g = info(api, c, i).go, p = g.split(":");
        if (p[0] === "tab") set[p[1]] = 1; else if (GO_TAB[p[0]]) set[GO_TAB[p[0]]] = 1;
      });
    });
    return set;
  }
  function neededArticles(api) {
    var x = compute(api), set = {};
    CHLIST.forEach(function (c) { if (x.open[c.id]) c.steps.forEach(function (s) { if (s.kb) set[s.kb] = 1; }); });
    return set;
  }
  function installGate() {
    var inner = window.V60_GATE || {};
    /* an article an open chapter points at is in the Library already */
    if (window.V60_KNOW && window.V60_KNOW.article) { var innerArt = window.V60_KNOW.article; window.V60_KNOW.article = function (id) { return innerArt(id) || !!(API && neededArticles(API)[id]); }; }
    window.V60_GATE = {
      visible: function (tab) { if (!API) return true; if (ROOTS[tab]) return true; if (inner.visible && inner.visible(tab)) return true; return !!neededTabs(API)[tab]; },
      feature: function (f) { return inner.feature ? inner.feature(f) : true; },
      isNew: function (tab) { return !!(inner.isNew && inner.isNew(tab)); },
      sync: function () { if (inner.sync) inner.sync(); if (API) sweep(API); },
      shown: function (tab) { if (inner.shown) inner.shown(tab); }
    };
  }

  /* ---------- figures: schematic drawings, 358 wide ---------- */
  var SIDE = '<line x1="0" y1="182" x2="358" y2="182" class="fg-ground"/><path d="M 16 150 L 14 118 Q 14 104 30 100 L 112 92 L 150 56 Q 154 52 162 52 L 296 50 Q 306 50 312 58 L 324 100 L 338 104 Q 346 108 346 120 L 344 150 Q 344 156 338 156 L 22 156 Q 16 156 16 150 Z" class="fg-body"/><path d="M 30 100 L 112 92" class="fg-thin"/><polygon points="150,90 156,60 206,60 206,90" class="fg-glass"/><polygon points="212,90 212,60 262,60 262,90" class="fg-glass"/><polygon points="268,90 268,60 298,58 310,70 316,90" class="fg-glass"/><line x1="209" y1="92" x2="209" y2="152" class="fg-thin"/><line x1="265" y1="92" x2="265" y2="152" class="fg-thin"/><rect x="190" y="106" width="14" height="4" rx="2" class="fg-fill"/><rect x="246" y="106" width="14" height="4" rx="2" class="fg-fill"/><rect x="142" y="84" width="10" height="7" rx="1.5" class="fg-part"/><rect x="17" y="110" width="16" height="9" rx="3" class="fg-part"/><rect x="328" y="104" width="12" height="18" rx="2" class="fg-part"/><line x1="296" y1="162" x2="340" y2="162" class="fg-body"/><circle cx="84" cy="156" r="30" class="fg-arch"/><circle cx="84" cy="156" r="24" class="fg-fill"/><circle cx="84" cy="156" r="14" class="fg-part"/><circle cx="278" cy="156" r="30" class="fg-arch"/><circle cx="278" cy="156" r="24" class="fg-fill"/><circle cx="278" cy="156" r="14" class="fg-part"/>';
  var FIG = {
    side: { h: 196, svg: SIDE, cap: "Side view" },
    body: { h: 196, svg: SIDE, cap: "Walk-around" },
    /* standing at the front bumper looking down: windshield at the top, hood catch and bumper at the bottom,
       passenger side on the left, driver side on the right; the bay widens toward you. Part places follow Volvo's
       2016 V60 manual, Engine compartment - overview, 4-cylinder illustration (V60_SOURCES.bayov). */
    bay: { h: 222, cap: "From the front bumper, hood open, driver side on the right", svg:
      '<path d="M 40 0 L 318 0 L 332 14 L 26 14 Z" class="fg-glass"/><path d="M 46 12 L 122 4 M 236 12 L 312 4" class="fg-thin"/>' +
      '<path d="M 20 14 L 338 14 L 354 190 L 4 190 Z" class="fg-body"/><path d="M 32 26 L 18 184 M 326 26 L 340 184" class="fg-thin"/>' +
      '<rect x="24" y="15" width="310" height="11" class="fg-part"/><path d="M 52 20.5 h 18 M 78 20.5 h 18 M 104 20.5 h 18 M 236 20.5 h 18 M 262 20.5 h 18" class="fg-thin"/>' +
      '<circle cx="40" cy="40" r="11" class="fg-part"/><circle cx="40" cy="40" r="4" class="fg-fill"/>' +
      '<rect x="20" y="78" width="40" height="50" rx="7" class="fg-glass"/><circle cx="31" cy="86" r="5" class="fg-part"/><path d="M 40 98 h 14 M 40 118 h 14" class="fg-thin"/><path d="M 60 100 Q 63 100 66 96" class="fg-thin"/>' +
      '<rect x="66" y="46" width="24" height="100" rx="7" class="fg-part"/><path d="M 72 56 L 72 136 M 84 56 L 84 136" class="fg-dash"/>' +
      '<rect x="94" y="44" width="118" height="106" rx="12" class="fg-part"/><rect x="102" y="52" width="102" height="90" rx="9" class="fg-glass"/>' +
      '<rect x="139" y="55" width="10" height="15" rx="2" class="fg-part"/><rect x="155" y="55" width="10" height="15" rx="2" class="fg-part"/><rect x="171" y="55" width="10" height="15" rx="2" class="fg-part"/><rect x="187" y="55" width="10" height="15" rx="2" class="fg-part"/>' +
      '<circle cx="122" cy="90" r="9" class="fg-part"/><path d="M 117 90 h 10 M 122 85 v 10" class="fg-thin"/><path d="M 142 118 L 198 118 M 142 130 L 198 130" class="fg-dash"/>' +
      '<rect x="204" y="28" width="36" height="14" rx="4" class="fg-glass"/><circle cx="222" cy="35" r="4" class="fg-part"/>' +
      '<rect x="236" y="50" width="50" height="42" rx="3" class="fg-part"/><rect x="241" y="55" width="8" height="5" class="fg-fill"/><rect x="273" y="55" width="8" height="5" class="fg-fill"/><path d="M 241 74 h 8 M 245 70 v 8 M 273 74 h 8" class="fg-thin"/>' +
      '<rect x="290" y="84" width="38" height="38" rx="3" class="fg-part"/><path d="M 295 92 h 28 M 295 114 h 28" class="fg-thin"/>' +
      '<rect x="220" y="102" width="60" height="56" rx="8" class="fg-part"/><path d="M 228 102 v -4 M 272 102 v -4 M 228 158 v 4 M 272 158 v 4" class="fg-thin"/><path d="M 220 116 Q 216 116 212 110 M 220 130 Q 214 130 212 124" class="fg-thin"/>' +
      '<circle cx="322" cy="146" r="7" class="fg-part"/>' +
      '<rect x="70" y="162" width="230" height="12" class="fg-glass"/><path d="M 80 168 h 210" class="fg-dash"/>' +
      '<rect x="36" y="176" width="286" height="12" class="fg-part"/><path d="M 174 176 L 174 170 L 184 170 L 184 176" class="fg-thin"/><rect x="170" y="178" width="18" height="8" rx="2" class="fg-fill"/><path d="M 170 182 L 150 182" class="fg-body"/>' +
      '<path d="M 4 190 L 54 190 L 50 206 L 8 202 Z" class="fg-glass"/><path d="M 354 190 L 304 190 L 308 206 L 350 202 Z" class="fg-glass"/>' +
      '<rect x="112" y="190" width="134" height="13" class="fg-part"/><path d="M 124 190 v 13 M 136 190 v 13 M 148 190 v 13 M 160 190 v 13 M 172 190 v 13 M 186 190 v 13 M 198 190 v 13 M 210 190 v 13 M 222 190 v 13 M 234 190 v 13" class="fg-thin"/>' +
      '<path d="M 2 205 Q 179 209 356 205 L 356 221 L 2 221 Z" class="fg-body"/>' +
      '<text x="179" y="10" text-anchor="middle" class="fg-label">WINDSHIELD</text><text x="179" y="218" text-anchor="middle" class="fg-label">HOOD CATCH · FRONT BUMPER</text>' +
      '<text x="22.5" y="104" text-anchor="middle" class="fg-label" transform="rotate(-90 22.5 104)">PASSENGER</text><text x="335" y="104" text-anchor="middle" class="fg-label" transform="rotate(90 335 104)">DRIVER</text>' },
    wheel: { h: 222, cap: "The front wheel, straight on", svg: '<line x1="0" y1="214" x2="358" y2="214" class="fg-ground"/><path d="M 20 60 Q 60 20 130 14 L 358 14 L 358 120 L 300 120" class="fg-thin"/><circle cx="130" cy="118" r="96" class="fg-fill"/><circle cx="130" cy="118" r="62" class="fg-part"/><circle cx="130" cy="118" r="50" class="fg-glass"/><g class="fg-thin"><line x1="130" y1="68" x2="130" y2="168"/><line x1="80" y1="118" x2="180" y2="118"/><line x1="95" y1="83" x2="165" y2="153"/><line x1="165" y1="83" x2="95" y2="153"/></g><circle cx="130" cy="118" r="12" class="fg-part"/><path d="M 174 78 Q 198 100 196 132 L 210 132 Q 214 96 186 68 Z" class="fg-fill"/><rect x="128" y="22" width="6" height="12" rx="2" class="fg-fill"/><rect x="270" y="160" width="40" height="26" rx="5" class="fg-part"/><text x="290" y="178" class="fg-text" text-anchor="middle">P</text>' },
    cabin: { h: 222, cap: "From the driver's seat", svg: '<path d="M 0 14 L 358 14 L 358 96 Q 179 70 0 96 Z" class="fg-glass"/><path d="M 0 96 Q 179 70 358 96 L 358 222 L 0 222 Z" class="fg-body"/><rect x="66" y="56" width="92" height="36" rx="6" class="fg-fill"/><ellipse cx="112" cy="140" rx="64" ry="28" class="fg-part"/><ellipse cx="112" cy="140" rx="22" ry="10" class="fg-part"/><rect x="198" y="92" width="64" height="76" rx="4" class="fg-fill"/><rect x="206" y="100" width="48" height="26" rx="2" class="fg-glass"/><circle cx="214" cy="150" r="6" class="fg-part"/><circle cx="246" cy="150" r="6" class="fg-part"/><rect x="266" y="132" width="76" height="40" rx="4" class="fg-part"/><rect x="40" y="176" width="40" height="20" rx="3" class="fg-part"/><rect x="286" y="180" width="56" height="30" rx="6" class="fg-glass"/>' },
    under: { h: 160, cap: "From underneath, front to the left", svg: '<rect x="20" y="30" width="318" height="100" rx="20" class="fg-body"/><rect x="34" y="18" width="36" height="22" rx="4" class="fg-fill"/><rect x="34" y="120" width="36" height="22" rx="4" class="fg-fill"/><rect x="288" y="18" width="36" height="22" rx="4" class="fg-fill"/><rect x="288" y="120" width="36" height="22" rx="4" class="fg-fill"/><rect x="46" y="54" width="90" height="52" rx="8" class="fg-part"/><path d="M 136 86 L 230 86 Q 262 86 262 100 L 262 108 L 330 108" class="fg-body"/><rect x="236" y="92" width="44" height="18" rx="4" class="fg-part"/><path d="M 70 40 L 70 54 M 70 106 L 70 120 M 306 40 L 306 60 M 306 100 L 306 120" class="fg-body"/><circle cx="170" cy="80" r="5" class="fg-part"/>' }
  };
  function figure(api, v, items, selId, at) {
    var f = FIG[v.fig] || FIG.side, W = 358, H = f.h, d = D(api), pv = d.views[v.id], photo = pv && pv.photo ? (api.state.photos || []).filter(function (p) { return p.id === pv.photo; })[0] : null;
    var pos = function (it) { var p = photo && pv.pins && pv.pins[it.id]; if (p) return [p[0] * 100, p[1] * 100]; var a = at(it); return [a[0] / W * 100, a[1] / H * 100]; };
    var hs = items.map(function (it) {
      var st = it.status, xy = pos(it), lab = it.label;
      return '<button type="button" class="mn-hs ' + st + (selId === it.id ? " sel" : "") + (photo ? " onphoto" : "") + '" data-hs="' + esc(it.id) + '" style="left:' + xy[0].toFixed(2) + "%;top:" + xy[1].toFixed(2) + '%" aria-label="' + esc(lab) + ", " + ({ locked: "locked", "new": "new chapter", resume: "where you left off", closed: "closed", open: "open" })[st] + '" aria-pressed="' + (selId === it.id) + '">' + esc(it.num) + "</button>";
    }).join("");
    var inner = photo ? '<img src="' + esc(api.photoUrl(photo)) + '" alt="Your photo: ' + esc(v.n) + '">' : '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(f.cap) + ', schematic">' + f.svg + "</svg>";
    return '<div class="mn-fig' + (photo ? " photo" : "") + '" data-fig="' + esc(v.id) + '" style="aspect-ratio:' + W + "/" + H + '">' + inner + hs + "</div>";
  }

  /* ---------- UI state ---------- */
  var ui = { view: null, item: null, openCh: null, openStep: null, selView: null, arrange: false, from: null };
  var SOS = [["Red warning light (oil, brakes, temperature)", "kb:a-lights"], ["Check-engine light, steady or flashing", "tree:cel"], ["Temperature high, steam or a sweet smell", "tree:hot"], ["Oil warning or message", "tree:oil"], ["Brakes feel or sound wrong", "tree:brakes"], ["Won't start", "tree:nostart"], ["Tire light, or a flat tire", "tree:tpms"], ["Flat tire: sealing kit and spare", "kb:a-tirekit"], ["Shaking or vibration", "tree:vibe"], ["Start/stop acting strange", "tree:ss"], ["Something else", "tab:trouble"]];
  function sosHtml() { return '<details class="mn-sos"><summary><span class="mn-sosi" aria-hidden="true"></span>Something\'s wrong with the car</summary><p class="status">Red warning lights come first: Volvo\'s manual says stop for those.</p><ul>' + SOS.map(function (x) { return '<li><button type="button" class="mn-row" data-jump="' + x[1] + '">' + esc(x[0]) + "</button></li>"; }).join("") + "</ul></details>"; }
  function segs(api, it) { return '<div class="mn-segs" aria-hidden="true">' + it.chapters.map(function (c) { return '<i class="' + chStatus(api, c) + '"></i>'; }).join("") + "</div>"; }
  function pill(st) { var M = { locked: ["locked", ""], "new": ["new", "New"], resume: ["resume", "Pick up here"], closed: ["closed", "Closed"], open: ["open", ""] }; return M[st][1] ? '<span class="mn-pill ' + M[st][0] + '">' + M[st][1] + "</span>" : ""; }
  function toastHtml() { if (!toast) return ""; var t = toast; toast = null; return '<div class="mn-toast" role="status"><b>' + esc(t.t) + "</b>" + (t.d ? "<span>" + esc(t.d) + "</span>" : "") + (t.go ? '<button type="button" class="mn-cta" data-jump="path:next">Next step <span aria-hidden="true">→</span></button>' : "") + "</div>"; }

  /* ---------- home: the car, the one next step, and how far along the path you are ---------- */
  function nextCard(api) {
    var x = compute(api), cur = x.cur, total = STAGES.length, pc = Math.round(x.nDone / total * 100), sd = storyD(api);
    var h = '<article class="mn-sheet mn-next"><div class="mn-kick"><span>' + (cur ? "NEXT · STEP " + cur.n + " OF " + total : "THE PATH IS COMPLETE") + '</span><button type="button" class="mn-link" data-jump="tab:path">The whole path</button></div>' +
      '<div class="mn-pbar" role="progressbar" aria-label="Path progress" aria-valuemin="0" aria-valuemax="' + total + '" aria-valuenow="' + x.nDone + '"><i style="width:' + pc + '%"></i></div>' +
      '<p class="status mn-mono">' + x.nDone + " OF " + total + " STEPS DONE · " + pc + " %</p>";
    if (cur) {
      var c = cur.kind === "ch" ? CH[cur.ch] : null, started = stageStarted(api, cur);
      var lab = cur.kind === "ch" ? (started ? "Continue" : "Start") : cur.kind === "g1" ? (started ? "Keep studying" : "Start studying") : cur.kind === "quiz" ? "Take the quiz" : "Take the mock G1";
      h += '<p class="mn-unit">UNIT ' + cur.unit.num + " OF " + UNITS.length + " · " + esc(cur.unit.t.toUpperCase()) + "</p><h3>" + esc(stageTitle(cur)) + "</h3><p>" + esc(stageDesc(cur)) + (c && c.time ? ' <span class="mn-mono">' + esc(c.time) + "</span>" : "") + "</p>" +
        '<button type="button" class="mn-cta" data-jump="path:next">' + lab + ' <span aria-hidden="true">→</span></button>';
      if (cur.park) h += '<details class="mn-park"><summary>Can\'t do this one yet?</summary><p>' + esc(cur.park) + " Set it aside and the path moves on. It stays on your list below and closes by itself once the work is on record.</p>" + '<button type="button" class="quiet" data-park="' + esc(cur.key) + '">Set it aside</button></details>';
    } else h += "<h3>Every step is done.</h3><p>The parts, the G1 study and the quizzes are all behind you. The Index has every page for looking things up.</p>";
    if (x.parked.length) h += '<p class="status mn-parked">Set aside: ' + x.parked.map(function (s) { return '<button type="button" class="mn-link" data-jump="' + esc(stageGo(s)) + '">' + esc("Step " + s.n + ", " + stageTitle(s)) + "</button>"; }).join(" · ") + "</p>";
    var pend = sd.pending || [];
    if (!(sd.seen || {}).pro) h += '<button type="button" class="mn-row" data-jump="story:pro"><span class="mn-pill new">Scene</span><span>The story behind the path: <b>The As-Is File</b>. A used Volvo, sold as-is, with no records.</span></button>';
    else if (pend.length) h += '<button type="button" class="mn-row" data-jump="story:' + esc(pend[0]) + '"><span class="mn-pill new">Scene</span><span>' + pend.length + (pend.length === 1 ? " scene is" : " scenes are") + " waiting. Watch</span></button>";
    return h + "</article>";
  }
  function renderHome(api) {
    sweep(api);
    var vi = VIEWS.map(function (v) { return { id: v.id, num: String(v.num), label: v.n, status: viewStatus(api, v), v: v }; });
    var at = function (it) { return { bay: [70, 74], wheel: [84, 156], cabin: [181, 76], under: [180, 174], body: [334, 116] }[it.id]; };
    var h = toastHtml() + nextCard(api);
    h += '<div class="mn-figwrap"><div class="mn-kick"><span>THE CAR · ' + ITEMS.filter(function (it) { return itemOpen(api, it); }).length + ' OF ' + ITEMS.length + ' PARTS OPEN</span><button type="button" class="mn-link" data-ch="legend">Key</button></div>' + figure(api, { id: "home", n: "The car", fig: "side" }, vi, null, at) + (ui.homeNote ? '<p class="status mn-homenote">' + esc(ui.homeNote) + "</p>" : "") + "</div>";
    ui.homeNote = null;
    h += '<div class="row mn-homefoot"><button type="button" class="quiet" data-jump="tab:index">Index: every page</button></div>';
    h += sosHtml();
    $("mnHome").innerHTML = h;
  }
  /* ---------- the whole path: done units folded, the current unit open, later units by name only ---------- */
  function renderPath(api) {
    sweep(api);
    var x = compute(api), cur = x.cur;
    var h = '<div class="mn-top"><div class="mn-kick"><button type="button" class="mn-link" data-jump="tab:car">← The car</button><span>THE PATH</span></div><h2 class="mn-h1">One step at a time</h2>' +
      "<p>Safety first, then what the car is telling you and its history, then looking and checking one system at a time, each ending with its G1 study and quiz. Then servicing, diagnosing, upgrades, and the test. Each step opens when the one before it is done.</p>" +
      '<div class="mn-pbar"><i style="width:' + Math.round(x.nDone / STAGES.length * 100) + '%"></i></div><p class="status mn-mono">' + x.nDone + " OF " + STAGES.length + " STEPS DONE</p></div>";
    UNITS.forEach(function (u) {
      var ss = STAGES.filter(function (s) { return s.unit === u; }), nd = ss.filter(function (s) { return x.done[s.key]; }).length, here = cur && cur.unit === u, any = ss.some(function (s) { return x.reached[s.key]; });
      var st = nd === ss.length ? "closed" : here ? "resume" : any ? "open" : "locked";
      h += '<details class="mn-unitx ' + st + '"' + (here ? " open" : "") + '><summary><span class="n">' + u.num + '</span><span class="b"><span class="t">' + esc(u.t) + '</span><span class="kind">' + (st === "locked" ? "LOCKED · " + ss.length + " STEPS" : nd + " OF " + ss.length + " DONE") + '</span></span><span class="mn-tick" aria-hidden="true">' + (st === "closed" ? "✓" : here ? "●" : "") + "</span></summary>";
      if (st === "locked") h += '<p class="status">' + esc(u.d) + "</p>";
      else h += '<p class="status">' + esc(u.d) + '</p><div class="mn-list">' + ss.map(function (s) {
        var sst = stageState(api, s), lk = sst === "locked";
        return '<button type="button" class="mn-ix ' + (sst === "done" ? "closed" : sst === "current" ? "resume" : sst === "parked" ? "open" : "locked") + '"' + (lk ? ' aria-disabled="true"' : ' data-jump="' + esc(stageGo(s)) + '"') + '><span class="n">' + s.n + "</span><span>" + esc(stageTitle(s)) + '</span><span class="st">' + (sst === "done" ? "DONE" : sst === "current" ? "● NOW" : sst === "parked" ? "SET ASIDE" : "") + "</span></button>";
      }).join("") + "</div>";
      h += "</details>";
    });
    $("mnPath").innerHTML = h;
  }
  /* open the step the path is on: a chapter on its part page, a study list, a quiz */
  function goNext(api) {
    var x = compute(api), s = x.cur; if (!s) { api.go("path"); return; }
    if (s.kind === "ch") open(api, "ch", s.ch); else api.jump(stageGo(s));
  }
  /* ---------- the index: every other page, grouped by what you want to do ---------- */
  function renderIndex(api) {
    sweep(api);
    var x = compute(api);
    var h = '<div class="mn-top"><div class="mn-kick"><button type="button" class="mn-link" data-jump="tab:car">← The car</button><span>INDEX</span></div><h2 class="mn-h1">Every page</h2><p>The back of the book, for looking things up. Only pages your path has reached are listed.</p></div>';
    h += '<section class="mn-list"><div class="mn-kick"><span>YOUR PATH</span></div><button type="button" class="mn-ix resume" data-jump="tab:path"><span class="n">' + (x.cur ? x.cur.n : "✓") + '</span><span>The whole path, step by step</span><span class="st">' + x.nDone + " / " + STAGES.length + "</span></button></section>";
    h += '<section class="mn-list"><div class="mn-kick"><span>THE CAR</span></div><button type="button" class="mn-ix ' + chStatus(api, PREFACE) + '" data-ch="0"><span class="n">0</span><span>' + esc(PREFACE.n) + '</span><span class="st">' + (chStatus(api, PREFACE) === "closed" ? "CLOSED" : PREFACE.steps.filter(function (s, i) { return info(api, PREFACE, i).done; }).length + " / " + PREFACE.steps.length) + "</span></button>" +
      VIEWS.map(function (v) { var st = viewStatus(api, v), n = v.items.filter(function (it) { return itemClosedN(api, it) === it.chapters.length; }).length; return '<button type="button" class="mn-ix ' + st + '" data-view="' + v.id + '"' + (st === "locked" ? ' aria-disabled="true"' : "") + '><span class="n">' + v.num + "</span><span>" + esc(v.n) + " · " + v.items.length + ' parts</span><span class="st">' + (st === "locked" ? "after " + esc(firstGate(api, v)) : n + " / " + v.items.length) + "</span></button>"; }).join("") + "</section>";
    h += backMatter(api) + sosHtml();
    $("mnIndex").innerHTML = h;
  }
  /* the first chapter of a view the path reaches */
  function firstCh(v) { var best = null; v.items.forEach(function (it) { it.chapters.forEach(function (c) { var s = STAGE_OF_CH[c.id]; if (s && (!best || s.n < STAGE_OF_CH[best.id].n)) best = c; }); }); return best; }
  function firstGate(api, v) { var c = firstCh(v); return c ? "step " + STAGE_OF_CH[c.id].n : "later"; }
  function firstWhy(api, v) { var c = firstCh(v); return c ? why(api, c) : ""; }
  var BACK = [["kb", "Library"], ["cards", "Flashcards"], ["track", "Certification track"], ["academy", "Training library"], ["health", "Health score"], ["records", "Service log"], ["fuel", "Fuel & costs"], ["lab", "Data lab"], ["sim", "Simulator"], ["diy", "All DIY jobs"], ["trouble", "Troubleshoot"], ["bulletins", "Bulletins"], ["upgrades", "Upgrades"], ["my", "My V60 & photos"], ["bay", "Whole-car parts list"], ["engine", "Engine bay map"], ["achieve", "Achievements"], ["today", "Today's notes"], ["index", "Index"], ["path", "The path"], ["story", "Cases & options"]];
  /* every other page, grouped by what you want to do; only pages the story has opened are listed */
  var INDEX = [["Your car", ["engine", "bay", "health", "my", "upgrades", "bulletins"]], ["Fix & maintain", ["records", "diy", "trouble", "fuel", "unlocks"]], ["Learn", ["track", "academy", "learn", "kb", "cards"]], ["Data", ["lab", "diag", "sim"]], ["Progress", ["story", "achieve", "today"]]];
  /* "see also" on each view and on the other three roots */
  var ALSO = { bay: ["bay", "diy", "records"], wheel: ["diy", "records", "bulletins"], cabin: ["live", "diag", "trouble"], under: ["trouble", "diy"], body: ["upgrades", "diy", "bulletins"],
    glove: ["records", "fuel", "docs", "bulletins"], live: ["lab", "diag", "sim", "health"], story: ["track", "academy", "kb", "cards", "achieve"] };
  function seen(tab) { return !!($("p-" + tab) && (!window.V60_GATE || window.V60_GATE.visible(tab))); }
  function pageName(tab) { var b = BACK.filter(function (x) { return x[0] === tab; })[0]; return NAMES[tab] || (b && b[1]) || tab; }
  function alsoHtml(tabs, kick) {
    var vis = (tabs || []).filter(seen);
    return vis.length ? '<nav class="mn-also" aria-label="' + esc(kick || "See also") + '"><div class="mn-kick"><span>' + esc((kick || "See also").toUpperCase()) + '</span></div><div class="mn-chips">' + vis.map(function (t) { return '<button type="button" class="mn-chip" data-jump="tab:' + t + '">' + esc(pageName(t)) + "</button>"; }).join("") + "</div></nav>" : "";
  }
  function backMatter(api) {
    return INDEX.map(function (g) { return alsoHtml(g[1], g[0]); }).join("");
  }
  /* the other roots get their "see also" strip under the page's title and intro, where it is seen without scrolling */
  function rootAlso(tab) {
    var p = $("p-" + tab); if (!p || !ALSO[tab]) return;
    var el = $("also-" + tab); if (!el) { el = document.createElement("div"); el.id = "also-" + tab; el.className = "mn mn-alsotop"; }
    var h = p.querySelector("h2"), after = h && h.nextElementSibling && h.nextElementSibling.classList.contains("lede") ? h.nextElementSibling : h;
    if (after) { if (after.nextSibling !== el) after.parentNode.insertBefore(el, after.nextSibling); } else if (p.firstChild !== el) p.insertBefore(el, p.firstChild);
    el.innerHTML = alsoHtml(ALSO[tab]);
  }

  /* ---------- a view ---------- */
  function renderView(api) {
    sweep(api);
    var v = VIEWS.filter(function (q) { return q.id === ui.view; })[0]; if (!v) { api.go("car"); return; }
    var d = D(api), items = v.items.map(function (it) { return { id: it.id, num: it.num, label: it.n, status: itemStatus(api, it), it: it }; });
    var sel = ui.item && items.some(function (q) { return q.id === ui.item && q.it.view === v.id; }) ? ui.item : (d.sel[v.id] || (resumeChapter(api) && resumeChapter(api).item && resumeChapter(api).item.view === v.id ? resumeChapter(api).item.id : null) || (items.filter(function (q) { return q.status === "new" || q.status === "resume"; })[0] || items.filter(function (q) { return q.status !== "locked"; })[0] || items[0]).id);
    d.sel[v.id] = sel;
    var pv = d.views[v.id], photo = pv && pv.photo ? (api.state.photos || []).filter(function (p) { return p.id === pv.photo; })[0] : null;
    var h = '<div class="mn-top"><div class="mn-kick"><button type="button" class="mn-link" data-jump="tab:car">← The car</button><span>VIEW ' + v.num + "</span></div>" +
      '<div class="mn-title"><h2>' + esc(v.n) + '</h2><div class="mn-seg" role="group" aria-label="Figure"><button type="button" data-fm="draw" aria-pressed="' + !photo + '">Drawing</button><button type="button" data-fm="photo" aria-pressed="' + !!photo + '">Your photo</button></div></div></div>' + toastHtml();
    h += '<div class="mn-figwrap"><div class="mn-kick"><span>FIG. ' + v.num + "-1 · " + esc(photo ? "YOUR PHOTO, " + photo.date : (FIG[v.fig] || FIG.side).cap.toUpperCase() + " · SCHEMATIC") + "</span>" + (photo ? '<button type="button" class="mn-link" data-arrange="1" aria-pressed="' + ui.arrange + '">' + (ui.arrange ? "Done moving" : "Move points") + "</button>" : "") + "</div>" + figure(api, v, items, sel, function (it) { return it.it.at; }) +
      (ui.arrange ? '<p class="status">Drag a number to where that part really is on your photo. Positions are saved as you go.</p>' : "") + "</div>";
    if (v.id === "bay" && seen("engine")) h += '<button type="button" class="mn-cta mn-mapbtn" data-jump="tab:engine">Engine bay map: every part, labelled <span aria-hidden="true">→</span></button>';
    if (ui.fm === "photo" && !photo) h += photoPicker(api, v);
    var si = items.filter(function (q) { return q.id === sel; })[0];
    if (si) {
      var it = si.it, open = itemOpen(api, it), nx = nextChapter(api, it), nc = itemClosedN(api, it), cases = caseFor(api, it);
      h += '<article class="mn-sheet"><div class="mn-kick"><span>ITEM ' + esc(it.num) + '</span><span class="mn-mono">' + nc + " of " + it.chapters.length + " chapter" + (it.chapters.length === 1 ? "" : "s") + " closed</span></div><h3>" + esc(it.n) + "</h3>" + segs(api, it) +
        "<p>" + esc(open ? (nx ? ({ "new": "New: ", resume: "Pick up at ", open: "Next: " })[chStatus(api, nx)] + nx.id + " " + nx.t + ". " + nx.d : "Closed. " + it.d) : it.d) + "</p>" +
        (cases.length ? '<p class="status">Pointed at by the case <b>' + cases.map(function (c) { return esc(c.t); }).join(", ") + "</b></p>" : "") +
        (open ? '<button type="button" class="mn-cta" data-item="' + it.id + '">Open ' + esc(it.num) + " " + esc(it.n) + ' <span aria-hidden="true">→</span></button>' : '<p class="mn-locked">Locked. ' + esc(why(api, it.chapters[0])) + "</p>") + "</article>";
    }
    h += '<section class="mn-list"><div class="mn-kick"><span>ITEMS IN THIS VIEW</span></div>' + items.map(function (q) {
      var it = q.it, stat, nx = nextChapter(api, it);
      if (q.status === "locked") stat = (function () { var b = null; it.chapters.forEach(function (c) { var s = STAGE_OF_CH[c.id]; if (s && (!b || s.n < b.n)) b = s; }); return b ? "step " + b.n : "later"; })();
      else if (q.status === "new") stat = "NEW · " + (nx ? nx.id : ""); else if (q.status === "resume") stat = "● " + (nx ? nx.id : ""); else if (q.status === "closed") stat = "CLOSED"; else stat = itemClosedN(api, it) + " / " + it.chapters.length;
      return '<button type="button" class="mn-ix ' + q.status + '" data-item="' + it.id + '"' + (q.status === "locked" ? ' aria-disabled="true"' : "") + '><span class="n">' + esc(it.num) + "</span><span>" + esc(it.n) + '</span><span class="st">' + esc(stat) + "</span></button>";
    }).join("") + "</section>" + alsoHtml(ALSO[v.id]);
    $("mnView").innerHTML = h;
  }
  function caseFor(api, it) { return (window.V60_STORY ? window.V60_STORY.cases : []).filter(function (c) { return (CASE_OPENS[c.id] || []).some(function (id) { return CH[id] && CH[id].item === it; }) && window.V60_STORY.available(c); }); }
  var VIEW_PHOTO = { bay: ["bay"], wheel: ["tread", "sidewall", "brake"], cabin: ["dash", "other", "interior"], body: ["other", "label"], under: ["leak"] };
  function photoPicker(api, v) {
    var kinds = VIEW_PHOTO[v.id] || ["other"], ph = (api.state.photos || []).filter(function (p) { return kinds.indexOf(p.kind) >= 0; }).slice(-8).reverse();
    return '<section class="mn-sheet"><div class="mn-kick"><span>YOUR PHOTO AS THE FIGURE</span></div><p>' + esc(v.hint) + '</p>' + (ph.length ? '<div class="mn-thumbs">' + ph.map(function (p) { return '<button type="button" data-usephoto="' + p.id + '"><img src="' + esc(api.photoUrl(p)) + '" alt="' + esc(p.kind) + " photo from " + esc(p.date) + '"><span>' + esc(p.date) + "</span></button>"; }).join("") + "</div><p class=\"status\">Tap one. The points start where they sit on the drawing; drag each to where it is on your car.</p>" : '<p class="status">No matching photo saved yet.</p>') + '<button type="button" class="quiet" data-jump="tab:my">Add a photo</button></section>';
  }

  /* ---------- a part: its whole manual on one page. Chapters are sections; each step opens in place with the article,
     the lesson, the job or the troubleshooter inside it, so nothing sends you to another page to read. ---------- */
  var TREE_UI = {};
  function kid(k) { return "mn-train-" + k.replace(/[^a-z0-9]/gi, "_"); }
  function goBtn(o, k) { return '<button type="button" class="' + (o.done ? "quiet" : "") + '" data-go="' + esc(o.go) + '" data-k="' + esc(k) + '">' + (o.done ? "Open again" : "Go") + "</button>"; }
  function manBtn(s, k) { return '<button type="button" class="quiet" data-man="' + esc(s.manual || k) + '">Mark done</button>'; }
  function treeHtml(api, id, k) {
    var tr = tree(id); if (!tr) return "";
    var path = TREE_UI[k] || [tr.start], node = tr.n[path[path.length - 1]], h = '<div class="mn-inl mn-tree"><p class="mn-mono status">' + esc(tr.t.toUpperCase()) + "</p>";
    path.slice(0, -1).forEach(function (pid, i) { var pn = tr.n[pid]; h += '<p class="status">' + esc(pn.q) + " <b>" + (path[i + 1] === pn.y ? "Yes" : "No") + "</b></p>"; });
    if (node.q) h += "<p><b>" + esc(node.q) + '</b></p><div class="row"><button type="button" data-tree="' + esc(k) + ':y">Yes</button><button type="button" data-tree="' + esc(k) + ':n">No</button>' + (path.length > 1 ? '<button type="button" class="quiet" data-tree="' + esc(k) + ':back">Back</button>' : "") + "</div>";
    else h += '<div class="mn-note sev-' + esc(node.sev || "watch") + '"><p>' + esc(node.r) + "</p>" + (node.cost ? '<p class="status">' + esc(node.cost) + "</p>" : "") + '<div class="row">' + (node.go || []).map(function (g) { return '<button type="button" class="quiet" data-jump="' + esc(g[1]) + '">' + esc(g[0]) + "</button>"; }).join("") + '<button type="button" class="quiet" data-tree="' + esc(k) + ':restart">Start over</button></div></div>';
    return h + "</div>";
  }
  function stepBody(api, c, i, o, k) {
    var s = c.steps[i], h = "";
    if (o.why) h += "<p>" + esc(o.why) + "</p>";
    if (s.kb) { var a = article(s.kb); h += a && window.V60_KB ? '<div class="mn-inl kbart">' + window.V60_KB.articleHtml(api, a) + "</div>" : '<div class="row">' + goBtn(o, k) + "</div>"; }
    else if (s.mission) h += '<div class="mn-inl mn-train" id="' + kid(k) + '"></div>';
    else if (s.diy) h += window.V60_DIYUI ? '<div class="mn-inl">' + window.V60_DIYUI.html(api, s.diy) + "</div>" : '<div class="row">' + goBtn(o, k) + "</div>";
    else if (s.tree) h += treeHtml(api, s.tree, k);
    else h += '<div class="row">' + (o.go ? goBtn(o, k) : "") + (o.manual && !o.done ? manBtn(s, k) : "") + "</div>";
    return h;
  }
  function chapterHtml(api, c, d, x) {
    var st = chStatus(api, c), done = c.steps.filter(function (s, i) { return info(api, c, i).done; }).length, it = c.item;
    var right = st === "closed" ? '<span class="mn-stamp">CLOSED ' + esc((d.closed[c.id] || "").slice(5).replace("-", "·")) + "</span>" : st === "locked" ? '<span class="mn-mono">' + esc(lockedAfter(api, c).toUpperCase()) + "</span>" : st === "new" ? '<span class="mn-mono mn-amber">NEW</span>' : st === "resume" ? '<span class="mn-mono mn-amber">● ' + done + " / " + c.steps.length + "</span>" : '<span class="mn-mono">' + done + " / " + c.steps.length + "</span>";
    var h = '<section class="mn-chs ' + st + '" id="ch-' + esc(c.id) + '"><div class="mn-chh2"><span class="mn-num' + (st === "new" || st === "resume" ? " amber" : "") + '">' + esc(c.id) + '</span><div class="b"><h3>' + esc(c.t) + (it ? ' <span class="mn-tier">' + esc(TIER[c.tier].split(" ")[0]) + "</span>" : "") + "</h3><p>" + esc(c.d) + (c.time ? ' <span class="mn-mono">' + esc(c.time) + "</span>" : "") + "</p></div>" + right + "</div>";
    if (st === "locked") return h + '<p class="mn-locked">' + esc(why(api, c)) + "</p></section>";
    h += '<div class="mn-steps">' + c.steps.map(function (s, i) {
      var o = info(api, c, i), k = stepKey(c, i), open = ui.openStep === k;
      return '<details class="mn-stepx' + (o.done ? " done" : "") + '" data-k="' + esc(k) + '"' + (open ? " open" : "") + '><summary><span class="n">' + (i + 1) + '</span><span class="b"><span class="t">' + esc(o.t) + '</span><span class="kind">' + esc(o.kind.toUpperCase()) + (o.optional ? " · OPTIONAL" : "") + "</span></span><span class=\"mn-tick\" aria-label=\"" + (o.done ? "done" : "not yet") + '">' + (o.done ? "✓" : "") + "</span></summary><div class=\"mn-stepb\">" + (open ? stepBody(api, c, i, o, k) : "") + "</div></details>";
    }).join("") + "</div>";
    var cs = caseStepsFor(api, c), ps = STAGE_OF_CH[c.id], lines = [];
    if (ps) lines.push("<b>Path:</b> step " + ps.n + " of " + STAGES.length + ", " + esc(ps.unit.t));
    cs.forEach(function (q) { lines.push("<b>Case:</b> step " + (q.k + 1) + " of " + q.c.steps.length + " in <b>" + esc(q.c.t) + "</b>"); });
    if (lines.length) h += '<p class="status mn-chnote">' + lines.join("<br>") + "</p>";
    return h + "</section>";
  }
  /* after something inside an open step changes (a quiz graded, a job ticked), update the ticks without redrawing the page */
  function refreshTicks(api) {
    bust(); var x = compute(api), root = $("mnItem"); if (!root) return;
    root.querySelectorAll("details.mn-stepx").forEach(function (dt) {
      var k = dt.getAttribute("data-k"), c = CH[k.split(":")[0]], i = +k.split(":")[1]; if (!c || !c.steps[i]) return;
      var o = info(api, c, i), tick = dt.querySelector(".mn-tick"); dt.classList.toggle("done", o.done); if (tick) { tick.textContent = o.done ? "✓" : ""; tick.setAttribute("aria-label", o.done ? "done" : "not yet"); }
    });
    CHLIST.forEach(function (c) { var sec = $("ch-" + c.id); if (!sec) return; var st = chStatus(api, c); ["new", "resume", "open", "closed", "locked"].forEach(function (k) { sec.classList.toggle(k, st === k); }); });
    if (sweep(api)) renderItem(api);
  }
  function mountOpen(api) {
    /* the open step's lesson is rendered by Training into its container; an open article counts as read */
    if (!ui.openStep) return;
    var c = CH[ui.openStep.split(":")[0]], i = +ui.openStep.split(":")[1], s = c && c.steps[i]; if (!s) return;
    if (s.mission && api.trainInto) api.trainInto(kid(ui.openStep), s.mission);
    if (s.kb && window.V60_KNOW && window.V60_KNOW.discover && !window.V60_KNOW.read(s.kb)) { window.V60_KNOW.discover("a", s.kb); api.save(); }
  }
  function renderItem(api) {
    sweep(api);
    var d = D(api), x = compute(api), it = ui.item === "0" ? null : ITEMS.filter(function (q) { return q.id === ui.item; })[0];
    if (ui.item !== "0" && !it) { api.go("car"); return; }
    var chapters = it ? it.chapters : [PREFACE], v = it ? it.viewObj : null, nc = chapters.filter(function (c) { return x.closed[c.id]; }).length;
    /* arriving at a chapter opens it (the glow stops) and makes it the one to pick up */
    if (ui.openCh && CH[ui.openCh] && x.open[ui.openCh]) { var oc = CH[ui.openCh]; if (!d.opened[oc.id]) d.opened[oc.id] = api.todayStr(); if (!x.closed[oc.id]) d.last = oc.id; if (!ui.openStep) for (var i = 0; i < oc.steps.length; i++) if (!info(api, oc, i).done) { ui.openStep = stepKey(oc, i); break; } api.save(); bust(); x = compute(api); }
    var areas = it && window.V60_TRACK ? window.V60_TRACK.areaOf(it.id) : [];
    var h = '<div class="mn-top"><div class="mn-kick"><button type="button" class="mn-link" ' + (v ? 'data-view="' + v.id + '">← ' + esc(v.n) : 'data-jump="tab:car">← The car') + "</button><span>" + (it ? "PART " + esc(it.num) + " · VIEW " + v.num : "CHAPTER 0") + "</span></div>" +
      '<h2 class="mn-h1">' + esc(it ? it.n : PREFACE.n) + '</h2><div class="mn-prog">' + segs(api, { chapters: chapters }) + '<span class="mn-mono">' + nc + " / " + chapters.length + " closed</span></div>" +
      (areas.length ? '<div class="mn-chips mn-areas">' + areas.map(function (a) { return '<button type="button" class="mn-chip" data-jump="track:' + a.id + '">' + esc(a.letter + " · " + a.n) + " · " + Math.round(window.V60_TRACK.areaReady(a.id) * 100) + " %</button>"; }).join("") + "</div>" : "") + "</div>" + toastHtml();
    if (it) {
      h += "<p>" + esc(it.d) + "</p>";
      var spec = (it.spec || []).slice(), dot = lastDot(api, it); if (dot) spec.push(["DOT read from your photo", dot + " (unconfirmed)"]);
      if (spec.length) h += '<details class="mn-fold"' + (spec.length <= 3 ? " open" : "") + '><summary><span class="mn-kick"><span>YOUR CAR · ' + spec.length + " FACTS</span>" + (dot ? '<span class="mn-amber">UNCONFIRMED WHERE SAID</span>' : "") + '</span></summary><dl class="mn-spec">' + spec.map(function (s) { return "<div><dt>" + esc(s[0]) + "</dt><dd>" + esc(s[1]) + "</dd></div>"; }).join("") + "</dl></details>";
    }
    h += chapters.map(function (c) { return chapterHtml(api, c, d, x); }).join("");
    if (it && window.V60_TRACK && window.V60_TRACK.tasksFor) {
      var g1 = window.V60_TRACK.tasksFor(it.id);
      if (g1.length) h += '<details class="mn-fold"><summary><span class="mn-kick"><span>ON THE G1 · ' + g1.length + (g1.length === 1 ? " TASK" : " TASKS") + '</span></span></summary><div class="mn-list">' + g1.map(function (t) { return '<button type="button" class="mn-ix" data-jump="task:' + esc(t.id) + '"><span class="n">' + esc(t.id) + "</span><span>" + esc(t.t) + "</span></button>"; }).join("") + "</div></details>";
    }
    if (it) {
      var facts = glossary(it), known = facts.filter(function (f) { return !window.V60_KNOW || window.V60_KNOW.fact(f); });
      var ph = (api.state.photos || []).filter(function (p) { return (it.photo || []).indexOf(p.kind) >= 0 || (it.part && p.part === it.part); }).slice(-4).reverse();
      h += '<details class="mn-fold"><summary><span class="mn-kick"><span>GLOSSARY · ' + known.length + " OF " + facts.length + "</span><span>EVIDENCE · " + ph.length + " PHOTO" + (ph.length === 1 ? "" : "S") + "</span></span></summary>" +
        (facts.length ? '<div class="mn-chips">' + facts.map(function (f) { var k = known.indexOf(f) >= 0; return k ? '<button type="button" class="mn-chip" data-jump="ask:' + esc(f.q) + '">' + esc(f.q.replace(/\?$/, "")) + "</button>" : '<span class="mn-chip locked" aria-label="locked term">' + "■".repeat(Math.max(4, Math.min(10, Math.round(f.q.length / 4)))) + "</span>"; }).join("") + "</div>" + (known.length < facts.length ? '<p class="status">Locked terms open with the chapters.</p>' : "") : "") +
        (ph.length ? '<div class="mn-thumbs">' + ph.map(function (p) { return '<button type="button" data-jump="tab:my"><img src="' + esc(api.photoUrl(p)) + '" alt="' + esc(p.kind) + " photo from " + esc(p.date) + '"><span>' + esc(p.date) + "</span></button>"; }).join("") + "</div>" : '<p class="status">No photos of this part yet.</p>') + '<button type="button" class="quiet" data-jump="tab:my">Photos</button></details>';
    }
    $("mnItem").innerHTML = h;
    mountOpen(api);
    if (ui.openCh) { var sec = $("ch-" + ui.openCh); ui.openCh = null; if (sec && sec.scrollIntoView) setTimeout(function () { sec.scrollIntoView({ block: "start" }); }, 0); }
  }
  /* the item's glossary: facts on its topics, the ones that mention the part first, eight at most */
  function glossary(it) {
    var words = (it.n.toLowerCase() + " " + it.id).split(/[^a-z]+/).filter(function (w) { return w.length > 2 && w !== "and" && w !== "the"; });
    return (window.V60_FACTS || []).filter(function (f) { return (it.tags || []).indexOf(f.tag) >= 0; }).map(function (f, i) { var txt = ((f.k || "") + " " + f.q).toLowerCase(), sc = 0; words.forEach(function (w) { if (txt.indexOf(w) >= 0) sc++; }); return { f: f, sc: sc, i: i }; }).sort(function (a, b) { return b.sc - a.sc || a.i - b.i; }).slice(0, 8).map(function (x) { return x.f; });
  }
  /* glossary terms unlock with the chapters: each closed chapter of an item opens its share of the item's eight */
  function unlockTerms(api) {
    var K = window.V60_KNOW; if (!K || !K.discover) return;
    var x = compute(api);
    ITEMS.forEach(function (it) {
      var closed = it.chapters.filter(function (c) { return x.closed[c.id]; }).length; if (!closed) return;
      var g = glossary(it), n = Math.ceil(g.length * closed / it.chapters.length);
      g.slice(0, n).forEach(function (f) { if (!K.fact(f)) K.discover("f", f.id); });
    });
  }
  function lastDot(api, it) { if ((it.photo || []).indexOf("sidewall") < 0) return null; var ps = (api.state.photos || []).filter(function (p) { return p.ai && p.ai.dot; }); return ps.length ? ps[ps.length - 1].ai.dot : null; }
  function lockedAfter(api, c) { var s = STAGE_OF_CH[c.id]; return s ? "step " + s.n : "later"; }
  function caseStepsFor(api, c) {
    var out = []; if (!window.V60_STORY) return out;
    var gos = c.steps.map(function (s, i) { return info(api, c, i).go; });
    window.V60_STORY.cases.forEach(function (cs) { cs.steps.forEach(function (s, k) { if (s.go && gos.indexOf(s.go) >= 0 && !out.some(function (o) { return o.c === cs; })) out.push({ c: cs, k: k }); }); });
    return out;
  }

  /* ---------- crumb: "← Back to …" on every page that is not one of the four roots or the manual itself ----------
     trail holds where you came from, newest last. A root clears it; the manual's own pages keep their own back links. */
  var NAMES = { car: "The car", story: "Cases & options", path: "The path", glove: "Glovebox", live: "Link", docs: "Documents", diag: "Diagnose", learn: "How it works", unlocks: "Unlocks: beyond the app", today: "Today" };
  var TAB_ROOT = { car: 1, glove: 1, live: 1 }, trail = [], here = null, goingBack = false;
  function where(tab) {
    if (tab === "view") { var v = VIEWS.filter(function (q) { return q.id === ui.view; })[0]; return v && { tab: "view", id: v.id, label: v.n }; }
    if (tab === "item") { if (ui.item === "0") return { tab: "item", id: "0", label: "0 " + PREFACE.n }; var it = ITEMS.filter(function (q) { return q.id === ui.item; })[0]; return it && { tab: "item", id: it.id, label: it.num + " " + it.n }; }
    var b = BACK.filter(function (x) { return x[0] === tab; })[0];
    return { tab: tab, label: NAMES[tab] || (b && b[1]) || tab };
  }
  function crumb(api, tab) {
    var el = $("crumb"), now = where(tab), prev = here;
    here = now;
    if (TAB_ROOT[tab]) trail = [];
    else if (!goingBack && prev && prev.tab !== tab) trail.push(prev);
    goingBack = false;
    if (trail.length > 20) trail = trail.slice(-20);
    ui.from = trail.length ? trail[trail.length - 1] : null;
    if (!el) return;
    if (tab === "view" || tab === "item" || TAB_ROOT[tab] || !ui.from) { el.hidden = true; el.innerHTML = ""; return; }
    el.hidden = false; el.innerHTML = '<button type="button" class="mn-link" data-back="1">← Back to ' + esc(ui.from.label) + "</button>";
  }
  function goBack(api) {
    var f = trail.pop(); goingBack = true;
    if (!f) { api.go("car"); return; }
    if (f.tab === "item") { ui.item = f.id; api.go("item"); } else if (f.tab === "view") { ui.view = f.id; api.go("view"); } else api.go(f.tab);
  }

  /* ---------- wiring ---------- */
  function open(api, kind, id) {
    if (kind === "view") { ui.view = id; ui.item = null; ui.arrange = false; ui.fm = null; api.go("view"); }
    else if (kind === "item") { var it = ITEMS.filter(function (q) { return q.id === id; })[0]; if (!it) return; if (ui.item !== id) ui.openStep = null; ui.item = id; ui.view = it.view; api.go("item"); }
    else if (kind === "ch") { if (id === "legend") { legend(api); return; } if (!CH[id]) return; ui.openCh = id; ui.openStep = null; if (CH[id].item) { ui.item = CH[id].item.id; ui.view = CH[id].item.view; } else ui.item = "0"; api.go("item"); }
  }
  function legend(api) {
    var el = $("mnHome"); if (!el) return; var k = el.querySelector(".mn-legend"); if (k) { k.remove(); return; }
    var div = document.createElement("div"); div.className = "mn-legend"; div.innerHTML = '<span><i class="mn-hs open">1</i> open</span><span><i class="mn-hs locked">2</i> locked</span><span><i class="mn-hs new">3</i> new, not opened yet</span><span><i class="mn-hs resume">4</i> where you left off</span><span><i class="mn-hs closed">5</i> closed</span>';
    var fw = el.querySelector(".mn-figwrap"); if (fw) fw.appendChild(div);
  }
  function drag(api, box, btn, e) {
    var v = VIEWS.filter(function (q) { return q.id === box.getAttribute("data-fig"); })[0]; if (!v) return;
    var d = D(api), pv = d.views[v.id]; if (!pv) return; var id = btn.getAttribute("data-hs");
    function at(ev) { var r = box.getBoundingClientRect(); return [Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width)), Math.max(0, Math.min(1, (ev.clientY - r.top) / r.height))]; }
    function mv(ev) { var p = at(ev); btn.style.left = (p[0] * 100).toFixed(2) + "%"; btn.style.top = (p[1] * 100).toFixed(2) + "%"; pv.pins[id] = p; }
    function up() { document.removeEventListener("pointermove", mv); document.removeEventListener("pointerup", up); api.save(); }
    e.preventDefault(); try { btn.setPointerCapture(e.pointerId); } catch (x) {}
    document.addEventListener("pointermove", mv); document.addEventListener("pointerup", up);
  }
  function usePhoto(api, v, photoId) {
    var d = D(api), f = FIG[v.fig] || FIG.side, pins = {};
    /* first guess: where each point sits on the drawing. The bay map's pins, if any, are better. */
    var legacy = v.id === "bay" && api.state.bayMap && api.state.bayMap.pins ? api.state.bayMap.pins : {};
    /* pins from the old engine-bay map were placed on the owner's own photo, so they carry over as they are */
    v.items.forEach(function (it) { var lp = it.bay && legacy[it.bay]; pins[it.id] = lp ? [lp[0], lp[1]] : [it.at[0] / 358, it.at[1] / f.h]; });
    d.views[v.id] = { photo: photoId, pins: pins }; ui.arrange = true; ui.fm = null; api.save();
  }
  function wire(api) {
    ["mnHome", "mnView", "mnItem", "mnIndex", "mnPath"].forEach(function (id) {
      var root = $(id);
      root.addEventListener("toggle", function (e) {
        var dt = e.target; if (!dt.matches || !dt.matches("details.mn-stepx")) return;
        var k = dt.getAttribute("data-k");
        if (dt.open) { if (ui.openStep === k) return; ui.openStep = k; var c = CH[k.split(":")[0]], d = D(api); if (c) { if (!d.opened[c.id]) d.opened[c.id] = api.todayStr(); if (!compute(api).closed[c.id]) d.last = c.id; api.save(); bust(); } renderItem(api); }
        else if (ui.openStep === k) { ui.openStep = null; if (api.trainReset) api.trainReset(); }
      }, true);
      root.addEventListener("click", function (e) {
        var t = e.target, b;
        if (id === "mnItem" && t.closest && t.closest(".mn-train")) { setTimeout(function () { refreshTicks(api); }, 0); return; }
        if ((b = t.closest("[data-hs]"))) {
          if (ui.arrange) return;
          var fig = b.closest(".mn-fig").getAttribute("data-fig"), hs = b.getAttribute("data-hs");
          if (fig === "home") { var hv = VIEWS.filter(function (q) { return q.id === hs; })[0]; if (hv && viewStatus(api, hv) === "locked") { ui.homeNote = hv.n + " is not open yet. " + firstWhy(api, hv); renderHome(api); } else if (hv) open(api, "view", hs); } else { ui.item = hs; var vv = VIEWS.filter(function (q) { return q.id === fig; })[0]; if (vv) D(api).sel[vv.id] = hs; renderView(api); }
          return;
        }
        if ((b = t.closest("[data-view]"))) { if (b.getAttribute("aria-disabled") === "true") { ui.selView = b.getAttribute("data-view"); if (id === "mnHome") { renderHome(api); var s = root.querySelector(".mn-sheet"); if (s) s.scrollIntoView({ block: "nearest" }); } return; } open(api, "view", b.getAttribute("data-view")); return; }
        if ((b = t.closest("[data-item]"))) { if (b.getAttribute("aria-disabled") === "true") { ui.item = b.getAttribute("data-item"); renderView(api); return; } open(api, "item", b.getAttribute("data-item")); return; }
        if ((b = t.closest("[data-ch]"))) { if (b.getAttribute("aria-disabled") === "true") return; open(api, "ch", b.getAttribute("data-ch")); return; }
        if ((b = t.closest("[data-go]"))) { D(api).went[b.getAttribute("data-k")] = 1; api.save(); api.jump(b.getAttribute("data-go")); return; }
        if ((b = t.closest("[data-man]"))) { D(api).manual[b.getAttribute("data-man")] = api.todayStr(); api.save(); bust(); renderItem(api); api.updateHud(); return; }
        if ((b = t.closest("[data-djdone]"))) { if (window.V60_DIYUI) window.V60_DIYUI.done(api, b.getAttribute("data-djdone")); bust(); renderItem(api); return; }
        if ((b = t.closest("[data-tree]"))) {
          var spec = b.getAttribute("data-tree"), cut = spec.lastIndexOf(":"), k2 = spec.slice(0, cut), act = spec.slice(cut + 1), c2 = CH[k2.split(":")[0]], s2 = c2 && c2.steps[+k2.split(":")[1]], tr = s2 && tree(s2.tree); if (!tr) return;
          var path = TREE_UI[k2] || [tr.start], node = tr.n[path[path.length - 1]];
          if (act === "restart") path = [tr.start]; else if (act === "back") path = path.slice(0, -1); else if (node && node[act]) path = path.concat([node[act]]);
          TREE_UI[k2] = path; var nn = tr.n[path[path.length - 1]]; if (nn && !nn.q) { D(api).went[k2] = 1; api.save(); bust(); }
          renderItem(api); return;
        }
        if ((b = t.closest("[data-park]"))) { var pk = b.getAttribute("data-park"), pd = D(api); if (STAGE_BY_KEY[pk] && STAGE_BY_KEY[pk].park) { pd.parked[pk] = api.todayStr(); api.save(); bust(); renderHome(api); } return; }
        if ((b = t.closest("[data-fm]"))) { var m = b.getAttribute("data-fm"), v = VIEWS.filter(function (q) { return q.id === ui.view; })[0]; if (!v) return; if (m === "draw") { var dd = D(api); delete dd.views[v.id]; ui.arrange = false; ui.fm = null; api.save(); } else ui.fm = "photo"; renderView(api); return; }
        if ((b = t.closest("[data-arrange]"))) { ui.arrange = !ui.arrange; renderView(api); return; }
        if ((b = t.closest("[data-usephoto]"))) { var v2 = VIEWS.filter(function (q) { return q.id === ui.view; })[0]; if (v2) usePhoto(api, v2, b.getAttribute("data-usephoto")); renderView(api); return; }
      });
      root.addEventListener("pointerdown", function (e) { if (!ui.arrange) return; var b = e.target.closest && e.target.closest("[data-hs]"); if (b) drag(api, b.closest(".mn-fig"), b, e); });
    });
    var cr = $("crumb"); if (cr) cr.addEventListener("click", function (e) { if (e.target.closest("[data-back]")) goBack(api); });
  }

  window.V60_MANUAL = {
    data: DATA, chapters: CH, status: function (id) { return API ? chStatus(API, CH[id]) : null; }, open: function (id) { return API ? !!compute(API).open[id] : false; },
    closed: function (id) { return API ? !!compute(API).closed[id] : false; }, resume: function () { return API ? resumeChapter(API) : null; }, newCount: function () { return API ? newList(API).length : 0; },
    needed: function () { return API ? neededTabs(API) : {}; }, bust: bust, sweep: function () { if (API) return sweep(API); }, go: function (kind, id) { if (API) open(API, kind, id); },
    /* closed, or set aside on the path: what the certification track counts as hands-on work done */
    settled: function (id) { if (!API) return false; var x = compute(API), s = STAGE_OF_CH[id]; return !!x.closed[id] || !!(s && x.d.parked[s.key]); }
  };
  /* the path, for the track, the story and the tests */
  window.V60_PATH = {
    units: UNITS, stages: STAGES,
    current: function () { return API ? compute(API).cur : null; },
    done: function () { return API ? compute(API).nDone : 0; },
    state: function (key) { return API && STAGE_BY_KEY[key] ? stageState(API, STAGE_BY_KEY[key]) : null; },
    reached: function (key) { return !API || !!compute(API).reached[key]; },
    taskStage: function (id) { return STAGE_OF_TASK[id] || null; },
    taskReached: function (id) { var s = STAGE_OF_TASK[id]; return !API || !s || !!compute(API).reached[s.key]; },
    chStage: function (id) { return STAGE_OF_CH[id] || null; },
    title: stageTitle,
    /* a Go link from elsewhere (a case step) is reached when some open chapter uses it, or no chapter does */
    goStage: function (go) {
      if (!API || !go) return null; var x = compute(API), first = null, ok = false;
      CHLIST.forEach(function (c) { c.steps.forEach(function (s, i) { if (info(API, c, i).go !== go) return; var st = STAGE_OF_CH[c.id]; if (!st) return; if (x.open[c.id]) ok = true; if (!first || st.n < first.n) first = st; }); });
      return ok || !first ? null : first;
    },
    next: function () { if (API) goNext(API); }
  };

  (window.V60_MODULES = window.V60_MODULES || []).push({
    id: "manual",
    tabs: [
      { id: "car", section: "car", label: "The car", order: 1, html: '<div id="mnHome" class="mn"></div>' },
      { id: "view", section: "car", label: "View", order: 2, hidden: true, html: '<div id="mnView" class="mn"></div>' },
      { id: "item", section: "car", label: "Part", order: 3, hidden: true, html: '<div id="mnItem" class="mn"></div>' },
      { id: "index", section: "car", label: "Index", order: 4, hidden: true, html: '<div id="mnIndex" class="mn"></div>' },
      { id: "path", section: "car", label: "The path", order: 5, hidden: true, html: '<div id="mnPath" class="mn"></div>' }
    ],
    init: function (api) { API = api; installGate(); wire(api); },
    render: function (api, tab) { bust(); if (tab === "car") renderHome(api); else if (tab === "view") renderView(api); else if (tab === "item") renderItem(api); else if (tab === "index") renderIndex(api); else if (tab === "path") renderPath(api); },
    refresh: function (api) { bust(); },
    shown: function (api, tab) { crumb(api, tab); rootAlso(tab); if (tab !== "item" && api.trainReset) api.trainReset(); },
    clean: function (v) { return v && typeof v === "object" ? v : {}; },
    xp: function (api) { var d = api.mod("manual"); if (!d || !d.closed) return 0; return Object.keys(d.closed).length * 15 + (d.closed["0"] ? 15 : 0); },
    jump: function (api, kind, id) { if (kind === "view" || kind === "item" || kind === "ch") { open(api, kind, id); return true; } if (kind === "path") { if (id === "next") goNext(api); else api.go("path"); return true; } return false; }
  });
})();
