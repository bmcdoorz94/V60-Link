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
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function $(id) { return document.getElementById(id); }

  /* ---------- saved data ---------- */
  function D(api) {
    var d = api.mod("manual"); if (!d) { d = {}; api.setMod("manual", d); }
    ["opened", "closed", "manual", "went", "views", "sel"].forEach(function (k) { if (!d[k] || typeof d[k] !== "object" || Array.isArray(d[k])) d[k] = {}; });
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
    var caseOpen = {};
    if (window.V60_STORY) window.V60_STORY.cases.forEach(function (c) { if ((CASE_OPENS[c.id] || []).length && window.V60_STORY.available(c)) CASE_OPENS[c.id].forEach(function (id) { caseOpen[id] = c.t; }); });
    var byOpens = {};
    CHLIST.forEach(function (c) { if (closed[c.id]) (c.opens || []).forEach(function (id) { byOpens[id] = c.id; }); });
    CHLIST.forEach(function (c) {
      var prev = c.item && c.idx > 0 ? c.item.chapters[c.idx - 1] : null;
      open[c.id] = all || c.id === "0" || closed[c.id] || !!byOpens[c.id] || !!caseOpen[c.id] || !!(prev && closed[prev.id]);
    });
    cache = { closed: closed, open: open, caseOpen: caseOpen, byOpens: byOpens, d: d };
    return cache;
  }
  function chStatus(api, c) {
    var x = compute(api), d = x.d;
    if (x.closed[c.id]) return "closed";
    if (!x.open[c.id]) return "locked";
    if (d.last === c.id) return "resume";
    if (!d.opened[c.id]) return "new";
    return "open";
  }
  function why(api, c) {
    var x = compute(api), prev = c.item && c.idx > 0 ? c.item.chapters[c.idx - 1] : null, from = [];
    if (prev) from.push(prev.id + " " + prev.t);
    CHLIST.forEach(function (o) { if ((o.opens || []).indexOf(c.id) >= 0 && o.id !== (prev && prev.id)) from.push(o.id + " " + o.t + (o.item ? " (" + o.item.n.toLowerCase() + ")" : "")); });
    var cases = Object.keys(CASE_OPENS).filter(function (k) { return CASE_OPENS[k].indexOf(c.id) >= 0; }).map(function (k) { var cc = (window.V60_STORY ? window.V60_STORY.cases : []).filter(function (q) { return q.id === k; })[0]; return cc ? "the case " + cc.t : null; }).filter(Boolean);
    var parts = []; if (from.length) parts.push("Opens after " + from.join(", or after ")); if (cases.length) parts.push((from.length ? "or with " : "Opens with ") + cases.join(" or "));
    return parts.length ? parts.join(", ") + "." : "Opens later in the story.";
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
    if (closedNow.length && !first) {
      var opened = []; closedNow.forEach(function (c) { (c.opens || []).forEach(function (id) { if (CH[id] && !x.closed[id]) opened.push(CH[id]); }); var nx = c.item ? c.item.chapters[c.idx + 1] : null; if (nx && !x.closed[nx.id]) opened.push(nx); });
      toast = { t: closedNow.map(label).join(", ") + " closed", d: opened.length ? "Unlocked: " + opened.map(longLabel).join(" · ") : "" };
    }
    if (changed) api.save();
    unlockTerms(api);
    return changed;
  }

  /* ---------- gate: which old pages exist yet ---------- */
  var ROOTS = { car: 1, view: 1, item: 1, chapter: 1, story: 1, today: 1, academy: 1 };
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
    bay: { h: 222, cap: "From the front bumper, hood open, driver side on the right", svg: '<rect x="12" y="10" width="334" height="196" rx="18" class="fg-body"/><line x1="12" y1="26" x2="346" y2="26" class="fg-body"/><line x1="24" y1="206" x2="334" y2="206" class="fg-thin"/><circle cx="40" cy="42" r="12" class="fg-part"/><circle cx="320" cy="40" r="12" class="fg-part"/><rect x="268" y="44" width="70" height="48" rx="4" class="fg-part"/><circle cx="282" cy="50" r="3" class="fg-fill"/><circle cx="324" cy="50" r="3" class="fg-fill"/><rect x="206" y="44" width="56" height="40" rx="3" class="fg-part"/><rect x="100" y="56" width="120" height="90" rx="10" class="fg-glass"/><rect x="150" y="66" width="60" height="12" rx="2" class="fg-part"/><circle cx="128" cy="98" r="11" class="fg-part"/><path d="M 108 120 L 212 120 M 108 134 L 212 134" class="fg-dash"/><rect x="250" y="112" width="84" height="60" rx="8" class="fg-part"/><path d="M 250 136 Q 232 136 220 120" class="fg-body"/><circle cx="60" cy="150" r="14" class="fg-part"/><path d="M 74 150 L 100 150" class="fg-body"/><rect x="22" y="128" width="60" height="52" rx="6" class="fg-part"/><circle cx="52" cy="134" r="9" class="fg-fill"/><circle cx="330" cy="184" r="9" class="fg-part"/>' },
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
  var ui = { view: null, item: null, chapter: null, selView: null, arrange: false, from: null };
  var SOS = [["Red warning light (oil, brakes, temperature)", "kb:a-lights"], ["Check-engine light, steady or flashing", "tree:cel"], ["Temperature high, steam or a sweet smell", "tree:hot"], ["Oil warning or message", "tree:oil"], ["Brakes feel or sound wrong", "tree:brakes"], ["Won't start", "tree:nostart"], ["Tire light, or a flat tire", "tree:tpms"], ["Flat tire: sealing kit and spare", "kb:a-tirekit"], ["Shaking or vibration", "tree:vibe"], ["Start/stop acting strange", "tree:ss"], ["Something else", "tab:trouble"]];
  function sosHtml() { return '<details class="mn-sos"><summary><span class="mn-sosi" aria-hidden="true"></span>Something\'s wrong with the car</summary><p class="status">Red warning lights come first: Volvo\'s manual says stop for those.</p><ul>' + SOS.map(function (x) { return '<li><button type="button" class="mn-row" data-jump="' + x[1] + '">' + esc(x[0]) + "</button></li>"; }).join("") + "</ul></details>"; }
  function segs(api, it) { return '<div class="mn-segs" aria-hidden="true">' + it.chapters.map(function (c) { return '<i class="' + chStatus(api, c) + '"></i>'; }).join("") + "</div>"; }
  function pill(st) { var M = { locked: ["locked", ""], "new": ["new", "New"], resume: ["resume", "Pick up here"], closed: ["closed", "Closed"], open: ["open", ""] }; return M[st][1] ? '<span class="mn-pill ' + M[st][0] + '">' + M[st][1] + "</span>" : ""; }
  function toastHtml() { if (!toast) return ""; var t = toast; toast = null; return '<div class="mn-toast" role="status"><b>' + esc(t.t) + "</b>" + (t.d ? "<span>" + esc(t.d) + "</span>" : "") + "</div>"; }

  /* ---------- home: the car ---------- */
  function renderHome(api) {
    sweep(api);
    var x = compute(api), d = D(api), st = api.state;
    var vi = VIEWS.map(function (v) { return { id: v.id, num: String(v.num), label: v.n, status: viewStatus(api, v), v: v }; });
    var sel = ui.selView || (resumeChapter(api) && resumeChapter(api).item ? resumeChapter(api).item.view : null) || vi.filter(function (q) { return q.status !== "locked"; })[0] && vi.filter(function (q) { return q.status !== "locked"; })[0].id || "bay";
    ui.selView = sel;
    var pre = chStatus(api, PREFACE), nOpen = ITEMS.filter(function (it) { return itemOpen(api, it); }).length, nNew = newList(api).length, rc = resumeChapter(api);
    var at = function (it) { return { bay: [70, 74], wheel: [84, 156], cabin: [181, 76], under: [180, 174], body: [334, 116] }[it.id]; };
    var h = '<div class="mn-kick"><span>The car</span><span>' + nOpen + " of " + ITEMS.length + " items open" + (nNew ? ' · <b class="mn-amber">' + nNew + " new</b>" : "") + "</span></div>" + toastHtml();
    if (pre !== "closed") {
      var pc = PREFACE.steps.filter(function (s, i) { return info(api, PREFACE, i).done; }).length;
      h += '<article class="mn-sheet mn-pre"><div class="mn-kick"><span>CHAPTER 0 · START HERE</span><span class="mn-mono">' + pc + " / " + PREFACE.steps.length + '</span></div><h3>' + esc(PREFACE.n) + "</h3><p>" + esc(PREFACE.d) + '</p><p class="status">Every view opens after this one. ' + esc(PREFACE.time) + '.</p><button type="button" data-ch="0" class="mn-cta">' + (pc ? "Continue chapter 0" : "Open chapter 0") + ' <span aria-hidden="true">→</span></button></article>';
    }
    h += '<div class="mn-figwrap"><div class="mn-kick"><span>FIG. 1 · SIDE VIEW · TAP TO LOOK INSIDE</span><button type="button" class="mn-link" data-ch="legend">Key</button></div>' + figure(api, { id: "home", n: "The car", fig: "side" }, vi, sel, at) + "</div>";
    var sv = vi.filter(function (q) { return q.id === sel; })[0];
    if (sv) {
      var v = sv.v, open = sv.status !== "locked", items = v.items, nc = items.filter(function (it) { return itemStatus(api, it) === "closed"; }).length, first = items.filter(function (it) { return itemOpen(api, it); })[0];
      var nx = null; items.forEach(function (it) { if (!nx) { var c = nextChapter(api, it); if (c && (chStatus(api, c) === "new" || chStatus(api, c) === "resume")) nx = c; } }); if (!nx) items.forEach(function (it) { if (!nx) nx = nextChapter(api, it); });
      var cases = (window.V60_STORY ? window.V60_STORY.cases : []).filter(function (c) { return (CASE_OPENS[c.id] || []).some(function (id) { return CH[id] && CH[id].item && CH[id].item.view === v.id; }) && window.V60_STORY.available(c) && !(storyD(api).closed || {})[c.id]; });
      h += '<article class="mn-sheet"><div class="mn-kick"><span>VIEW ' + v.num + "</span><span class=\"mn-mono\">" + (open ? nc + " of " + items.length + " items closed" : items.length + " items") + "</span></div><h3>" + esc(v.n) + "</h3>" +
        '<div class="mn-segs" aria-hidden="true">' + items.map(function (it) { return '<i class="' + itemStatus(api, it) + '"></i>'; }).join("") + "</div>" +
        "<p>" + esc(open && nx ? ({ "new": "New: ", resume: "Pick up at ", open: "Next: ", closed: "", locked: "" })[chStatus(api, nx)] + nx.item.num + " " + nx.item.n + ", " + nx.t + ". " + nx.d : v.d) + "</p>" +
        (cases.length ? '<p class="status">Pointed at by the case <b>' + cases.map(function (c) { return esc(c.t); }).join(", ") + "</b></p>" : "") +
        (open ? '<button type="button" class="mn-cta" data-view="' + v.id + '">' + esc(v.enter) + ' <span aria-hidden="true">→</span></button>' : '<p class="mn-locked">Locked. ' + esc(firstWhy(api, v)) + "</p>") + "</article>";
    }
    /* now */
    var now = [];
    if (rc) now.push('<button type="button" class="mn-row" data-ch="' + rc.id + '"><span class="mn-dot" aria-hidden="true"></span><span>' + esc(d.last === rc.id ? "Pick up where you left off: " : "Start here: ") + "<b>" + esc(longLabel(rc)) + "</b></span></button>");
    var hh = api.computeHealth ? api.computeHealth() : null, urgent = hh && window.V60_GATE.visible("health") ? hh.actions.filter(function (a) { return a.sev >= 70; }).slice(0, 2) : [];
    urgent.forEach(function (a) { now.push('<button type="button" class="mn-row" data-jump="' + esc(a.jump) + '"><span class="mn-pill bad">Act</span><span>' + esc(a.text) + "</span></button>"); });
    var sd = storyD(api), pend = (sd.pending || []);
    if (!(sd.seen || {}).pro) now.unshift('<button type="button" class="mn-row" data-jump="story:pro"><span class="mn-pill new">Scene</span><span>Watch the prologue: <b>The As-Is File</b>. A used Volvo, sold as-is, with no records.</span></button>');
    else if (pend.length) now.push('<button type="button" class="mn-row" data-jump="story:' + esc(pend[0]) + '"><span class="mn-pill new">Scene</span><span>' + pend.length + (pend.length === 1 ? " scene is" : " scenes are") + " waiting. Watch</span></button>");
    var notes = 0; (window.V60_MODULES || []).forEach(function (m) { if (m.id === "today" || m.id === "story" || m.id === "manual" || !m.today) return; if (m.tabs && m.tabs.length && !m.tabs.some(function (t) { return window.V60_GATE.visible(t.id); })) return; try { notes += (m.today(api) || []).length; } catch (e) {} });
    if (notes) now.push('<button type="button" class="mn-row" data-jump="tab:today"><span class="mn-pill">Notes</span><span>' + notes + (notes === 1 ? " note" : " notes") + " for today, from Lars and the garage</span></button>");
    if (now.length) h += '<section class="mn-list"><div class="mn-kick"><span>NOW</span></div>' + now.join("") + "</section>";
    /* contents */
    h += '<section class="mn-list"><div class="mn-kick"><span>CONTENTS</span></div>' +
      '<button type="button" class="mn-ix ' + pre + '" data-ch="0"><span class="n">0</span><span>' + esc(PREFACE.n) + '</span><span class="st">' + (pre === "closed" ? "CLOSED" : (pre === "resume" ? "● " : "") + PREFACE.steps.filter(function (s, i) { return info(api, PREFACE, i).done; }).length + " / " + PREFACE.steps.length) + "</span></button>" +
      vi.map(function (q) {
        var v = q.v, n = v.items.filter(function (it) { return itemClosedN(api, it) === it.chapters.length; }).length, stat;
        if (q.status === "locked") stat = "after " + firstGate(api, v); else if (q.status === "new") { var nw = newList(api).filter(function (c) { return c.item && c.item.view === v.id; })[0]; stat = "NEW · " + (nw ? nw.id : ""); } else if (q.status === "resume") { stat = "● " + (rc ? rc.id : ""); } else stat = n + " / " + v.items.length;
        return '<button type="button" class="mn-ix ' + q.status + '" data-view="' + v.id + '"' + (q.status === "locked" ? ' aria-disabled="true"' : "") + '><span class="n">' + v.num + "</span><span>" + esc(v.n) + ' · ' + v.items.length + ' items</span><span class="st">' + esc(stat) + "</span></button>";
      }).join("") + backMatter(api) + "</section>";
    h += sosHtml();
    $("mnHome").innerHTML = h;
  }
  function firstGate(api, v) { var id = v.items.length ? v.items[0].chapters[0].id : ""; var froms = []; CHLIST.forEach(function (o) { if ((o.opens || []).indexOf(id) >= 0) froms.push(o.id); }); return froms.length ? froms[0] : "the story"; }
  function firstWhy(api, v) { var c = v.items.length ? v.items[0].chapters[0] : null; return c ? why(api, c) : ""; }
  var BACK = [["kb", "Library"], ["cards", "Flashcards"], ["exam", "Exam"], ["academy", "Training library"], ["health", "Health score"], ["records", "Service log"], ["fuel", "Fuel & costs"], ["lab", "Data lab"], ["sim", "Simulator"], ["diy", "All DIY jobs"], ["trouble", "Troubleshoot"], ["bulletins", "Bulletins"], ["upgrades", "Upgrades"], ["my", "My V60 & photos"], ["bay", "Whole-car parts list"], ["engine", "Engine bay map"], ["skills", "Skill tree"], ["achieve", "Achievements"], ["today", "Today's notes"]];
  function backMatter(api) {
    var vis = BACK.filter(function (b) { return $("p-" + b[0]) && window.V60_GATE.visible(b[0]); });
    return '<details class="mn-back"><summary><span class="n">§</span><span>Back matter</span><span class="st">' + vis.length + " pages</span></summary><div class=\"mn-chips\">" + vis.map(function (b) { return '<button type="button" class="mn-chip" data-jump="tab:' + b[0] + '">' + esc(b[1]) + "</button>"; }).join("") + "</div></details>";
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
      if (q.status === "locked") stat = "after " + (function () { var w = []; CHLIST.forEach(function (o) { if ((o.opens || []).indexOf(it.chapters[0].id) >= 0) w.push(o.id); }); return w[0] || "the story"; })();
      else if (q.status === "new") stat = "NEW · " + (nx ? nx.id : ""); else if (q.status === "resume") stat = "● " + (nx ? nx.id : ""); else if (q.status === "closed") stat = "CLOSED"; else stat = itemClosedN(api, it) + " / " + it.chapters.length;
      return '<button type="button" class="mn-ix ' + q.status + '" data-item="' + it.id + '"' + (q.status === "locked" ? ' aria-disabled="true"' : "") + '><span class="n">' + esc(it.num) + "</span><span>" + esc(it.n) + '</span><span class="st">' + esc(stat) + "</span></button>";
    }).join("") + "</section>";
    $("mnView").innerHTML = h;
  }
  function caseFor(api, it) { return (window.V60_STORY ? window.V60_STORY.cases : []).filter(function (c) { return (CASE_OPENS[c.id] || []).some(function (id) { return CH[id] && CH[id].item === it; }) && window.V60_STORY.available(c); }); }
  var VIEW_PHOTO = { bay: ["bay"], wheel: ["tread", "sidewall", "brake"], cabin: ["dash", "other", "interior"], body: ["other", "label"], under: ["leak"] };
  function photoPicker(api, v) {
    var kinds = VIEW_PHOTO[v.id] || ["other"], ph = (api.state.photos || []).filter(function (p) { return kinds.indexOf(p.kind) >= 0; }).slice(-8).reverse();
    return '<section class="mn-sheet"><div class="mn-kick"><span>YOUR PHOTO AS THE FIGURE</span></div><p>' + esc(v.hint) + '</p>' + (ph.length ? '<div class="mn-thumbs">' + ph.map(function (p) { return '<button type="button" data-usephoto="' + p.id + '"><img src="' + esc(api.photoUrl(p)) + '" alt="' + esc(p.kind) + " photo from " + esc(p.date) + '"><span>' + esc(p.date) + "</span></button>"; }).join("") + "</div><p class=\"status\">Tap one. The points start where they sit on the drawing; drag each to where it is on your car.</p>" : '<p class="status">No matching photo saved yet.</p>') + '<button type="button" class="quiet" data-jump="tab:my">Add a photo</button></section>';
  }

  /* ---------- an item ---------- */
  function renderItem(api) {
    sweep(api);
    var it = ITEMS.filter(function (q) { return q.id === ui.item; })[0]; if (!it) { api.go("car"); return; }
    var v = it.viewObj, nc = itemClosedN(api, it), d = D(api), x = compute(api);
    var h = '<div class="mn-top"><div class="mn-kick"><button type="button" class="mn-link" data-view="' + v.id + '">← ' + esc(v.n) + "</button><span>ITEM " + esc(it.num) + " · VIEW " + v.num + "</span></div>" +
      '<h2 class="mn-h1">' + esc(it.n) + '</h2><div class="mn-prog">' + segs(api, it) + '<span class="mn-mono">' + nc + " / " + it.chapters.length + " closed</span></div></div>" + toastHtml();
    h += "<p>" + esc(it.d) + "</p>";
    var spec = (it.spec || []).slice(); var dot = lastDot(api, it);
    if (dot) spec.push(["DOT read from your photo", dot + " (unconfirmed)"]);
    if (spec.length) h += '<div class="mn-kick" style="margin-top:14px"><span>YOUR CAR</span>' + (dot ? '<span class="mn-amber">UNCONFIRMED WHERE SAID</span>' : "") + '</div><dl class="mn-spec">' + spec.map(function (s) { return "<div><dt>" + esc(s[0]) + "</dt><dd>" + esc(s[1]) + "</dd></div>"; }).join("") + "</dl>";
    h += '<section class="mn-list"><div class="mn-kick"><span>CHAPTERS · IN ORDER OF DIFFICULTY</span></div>' + it.chapters.map(function (c) {
      var st = chStatus(api, c), n = c.steps.filter(function (s, i) { return info(api, c, i).done; }).length;
      var right = st === "closed" ? '<span class="mn-stamp">CLOSED ' + esc((d.closed[c.id] || "").slice(5).replace("-", "·")) + "</span>" : st === "locked" ? "AFTER " + esc(lockedAfter(api, c)) : st === "new" ? "NEW →" : st === "resume" ? "● " + n + " / " + c.steps.length : n + " / " + c.steps.length + " →";
      return '<button type="button" class="mn-ch ' + st + '" data-ch="' + c.id + '"' + (st === "locked" ? ' aria-disabled="true"' : "") + '><span class="n">' + c.id + '</span><span class="b"><span class="t">' + esc(c.t) + '</span><span class="d">' + esc(c.d) + '</span></span><span class="s">' + right + "</span></button>";
    }).join("") + "</section>";
    /* glossary */
    var facts = glossary(it), known = facts.filter(function (f) { return !window.V60_KNOW || window.V60_KNOW.fact(f); });
    if (facts.length) h += '<section class="mn-list"><div class="mn-kick"><span>GLOSSARY · ' + known.length + " OF " + facts.length + ' UNLOCKED</span></div><div class="mn-chips">' + facts.map(function (f) { var k = known.indexOf(f) >= 0; return k ? '<button type="button" class="mn-chip" data-jump="ask:' + esc(f.q) + '">' + esc(f.q.replace(/\?$/, "")) + "</button>" : '<span class="mn-chip locked" aria-label="locked term">' + "■".repeat(Math.max(4, Math.min(10, Math.round(f.q.length / 4)))) + "</span>"; }).join("") + "</div>" + (known.length < facts.length ? '<p class="status">Locked terms open with the chapters.</p>' : "") + "</section>";
    /* evidence */
    var ph = (api.state.photos || []).filter(function (p) { return (it.photo || []).indexOf(p.kind) >= 0 || (it.part && p.part === it.part); }).slice(-4).reverse();
    h += '<section class="mn-list"><div class="mn-kick"><span>EVIDENCE ON FILE</span></div>' + (ph.length ? '<div class="mn-thumbs">' + ph.map(function (p) { return '<button type="button" data-jump="tab:my"><img src="' + esc(api.photoUrl(p)) + '" alt="' + esc(p.kind) + " photo from " + esc(p.date) + '"><span>' + esc(p.date) + "</span></button>"; }).join("") + "</div>" : '<p class="status">No photos of this part yet.</p>') + '<button type="button" class="quiet" data-jump="tab:my">Photos</button></section>';
    $("mnItem").innerHTML = h;
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
  function lockedAfter(api, c) { var prev = c.item && c.idx > 0 ? c.item.chapters[c.idx - 1] : null; if (prev) return prev.id; var w = []; CHLIST.forEach(function (o) { if ((o.opens || []).indexOf(c.id) >= 0) w.push(o.id); }); return w[0] || "the story"; }

  /* ---------- a chapter ---------- */
  function caseStepsFor(api, c) {
    var out = []; if (!window.V60_STORY) return out;
    var gos = c.steps.map(function (s, i) { return info(api, c, i).go; });
    window.V60_STORY.cases.forEach(function (cs) { cs.steps.forEach(function (s, k) { if (s.go && gos.indexOf(s.go) >= 0 && !out.some(function (o) { return o.c === cs; })) out.push({ c: cs, k: k }); }); });
    return out;
  }
  function renderChapter(api) {
    sweep(api);
    var c = CH[ui.chapter]; if (!c) { api.go("car"); return; }
    var d = D(api), x = compute(api), st = chStatus(api, c), it = c.item;
    if (x.open[c.id] && !d.opened[c.id]) { d.opened[c.id] = api.todayStr(); api.save(); }
    if (x.open[c.id] && !x.closed[c.id] && d.last !== c.id) { d.last = c.id; api.save(); }
    bust(); st = chStatus(api, c);
    var back = it ? '<button type="button" class="mn-link" data-item="' + it.id + '">← ' + esc(it.num + " " + it.n) + "</button>" : '<button type="button" class="mn-link" data-jump="tab:car">← The car</button>';
    var h = '<div class="mn-top"><div class="mn-kick">' + back + "<span>" + (st === "closed" ? "CLOSED" : st === "new" ? '<b class="mn-amber">NEW CHAPTER</b>' : st === "locked" ? "LOCKED" : "CHAPTER " + (it ? TIER[c.tier].toUpperCase() : "0")) + "</span></div>" +
      '<div class="mn-chh"><span class="mn-num' + (st === "new" || st === "resume" ? " amber" : "") + '">' + c.id + '</span><h2 class="mn-h1">' + esc(c.t) + "</h2></div>" +
      "<p>" + esc(c.d) + "</p>" + (c.time ? '<p class="mn-mono status">' + esc(c.time.toUpperCase()) + "</p>" : "") + "</div>" + toastHtml();
    if (st === "locked") h += '<p class="mn-locked">Locked. ' + esc(why(api, c)) + "</p>";
    var done = c.steps.filter(function (s, i) { return info(api, c, i).done; }).length;
    h += '<section class="mn-list"><div class="mn-kick"><span>PROCEDURE · ' + done + " OF " + c.steps.length + '</span></div>' + c.steps.map(function (s, i) {
      var o = info(api, c, i), k = stepKey(c, i);
      return '<div class="mn-step' + (o.done ? " done" : "") + '"><span class="n">' + (i + 1) + '</span><div class="b"><p><b>' + esc(o.t) + "</b>" + (o.why ? " " + esc(o.why) : "") + '</p><p class="mn-mono status">' + esc(o.kind.toUpperCase()) + (o.optional ? " · OPTIONAL" : "") + '</p><div class="row">' +
        (o.go && st !== "locked" ? '<button type="button" class="' + (o.done ? "quiet" : "") + '" data-go="' + esc(o.go) + '" data-k="' + esc(k) + '">' + (o.done ? "Open again" : "Go") + "</button>" : "") +
        (o.manual && !o.done && st !== "locked" ? '<button type="button" class="quiet" data-man="' + esc(s.manual || k) + '">Mark done</button>' : "") + "</div></div><span class=\"mn-tick\" aria-label=\"" + (o.done ? "done" : "not yet") + '">' + (o.done ? "✓" : "") + "</span></div>";
    }).join("") + "</section>";
    var cs = caseStepsFor(api, c), opens = (c.opens || []).map(function (id) { return CH[id]; }).filter(Boolean), nx = it ? it.chapters[c.idx + 1] : null;
    var lines = [];
    cs.forEach(function (q) { lines.push("<b>Case:</b> step " + (q.k + 1) + " of " + q.c.steps.length + " in <b>" + esc(q.c.t) + "</b>"); });
    var un = (nx ? [nx] : []).concat(opens); if (un.length) lines.push("<b>Unlocks:</b> " + un.map(function (q) { return esc(longLabel(q)); }).join(" · "));
    if (lines.length) h += '<div class="mn-note">' + lines.join("<br>") + "</div>";
    if (st === "closed") h += '<p class="status">Closed on ' + esc(d.closed[c.id] || api.todayStr()) + ". Everything here can be opened again; the stamp stays.</p>";
    $("mnChapter").innerHTML = h;
  }

  /* ---------- crumb: a way back from the old pages ---------- */
  function crumb(api, tab) {
    var el = $("crumb"); if (!el) return;
    if (tab === "car" || tab === "view" || tab === "item" || tab === "chapter") { ui.from = null; el.hidden = true; el.innerHTML = ""; return; }
    if (!ui.from) { el.hidden = true; return; }
    el.hidden = false; el.innerHTML = '<button type="button" class="mn-link" data-back="1">← Back to ' + esc(ui.from.label) + "</button>";
  }
  function goBack(api) { var f = ui.from; if (!f) { api.go("car"); return; } if (f.tab === "chapter") { ui.chapter = f.id; api.go("chapter"); } else if (f.tab === "item") { ui.item = f.id; api.go("item"); } else if (f.tab === "view") { ui.view = f.id; api.go("view"); } else api.go("car"); }

  /* ---------- wiring ---------- */
  function open(api, kind, id) {
    if (kind === "view") { ui.view = id; ui.item = null; ui.arrange = false; ui.fm = null; api.go("view"); }
    else if (kind === "item") { var it = ITEMS.filter(function (q) { return q.id === id; })[0]; if (!it) return; ui.item = id; ui.view = it.view; api.go("item"); }
    else if (kind === "ch") { if (id === "legend") { legend(api); return; } ui.chapter = id; if (CH[id] && CH[id].item) { ui.item = CH[id].item.id; ui.view = CH[id].item.view; } api.go("chapter"); }
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
    v.items.forEach(function (it) { var lp = it.bay && legacy[it.bay]; pins[it.id] = lp ? [1 - lp[0], 1 - lp[1]] : [it.at[0] / 358, it.at[1] / f.h]; });
    d.views[v.id] = { photo: photoId, pins: pins }; ui.arrange = true; ui.fm = null; api.save();
  }
  function wire(api) {
    ["mnHome", "mnView", "mnItem", "mnChapter"].forEach(function (id) {
      var root = $(id);
      root.addEventListener("click", function (e) {
        var t = e.target, b;
        if ((b = t.closest("[data-hs]"))) {
          if (ui.arrange) return;
          var fig = b.closest(".mn-fig").getAttribute("data-fig"), hs = b.getAttribute("data-hs");
          if (fig === "home") { ui.selView = hs; renderHome(api); } else { ui.item = hs; var vv = VIEWS.filter(function (q) { return q.id === fig; })[0]; if (vv) D(api).sel[vv.id] = hs; renderView(api); }
          return;
        }
        if ((b = t.closest("[data-view]"))) { if (b.getAttribute("aria-disabled") === "true") { ui.selView = b.getAttribute("data-view"); if (id === "mnHome") { renderHome(api); var s = root.querySelector(".mn-sheet"); if (s) s.scrollIntoView({ block: "nearest" }); } return; } open(api, "view", b.getAttribute("data-view")); return; }
        if ((b = t.closest("[data-item]"))) { if (b.getAttribute("aria-disabled") === "true") { ui.item = b.getAttribute("data-item"); renderView(api); return; } open(api, "item", b.getAttribute("data-item")); return; }
        if ((b = t.closest("[data-ch]"))) { if (b.getAttribute("aria-disabled") === "true") return; open(api, "ch", b.getAttribute("data-ch")); return; }
        if ((b = t.closest("[data-go]"))) { var c = CH[ui.chapter]; D(api).went[b.getAttribute("data-k")] = 1; api.save(); ui.from = c ? { tab: "chapter", id: c.id, label: label(c) } : null; api.jump(b.getAttribute("data-go")); return; }
        if ((b = t.closest("[data-man]"))) { D(api).manual[b.getAttribute("data-man")] = api.todayStr(); api.save(); bust(); renderChapter(api); api.updateHud(); return; }
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
    needed: function () { return API ? neededTabs(API) : {}; }, bust: bust, sweep: function () { if (API) return sweep(API); }, go: function (kind, id) { if (API) open(API, kind, id); }
  };

  (window.V60_MODULES = window.V60_MODULES || []).push({
    id: "manual",
    tabs: [
      { id: "car", section: "car", label: "The car", order: 1, html: '<div id="mnHome" class="mn"></div>' },
      { id: "view", section: "car", label: "View", order: 2, hidden: true, html: '<div id="mnView" class="mn"></div>' },
      { id: "item", section: "car", label: "Item", order: 3, hidden: true, html: '<div id="mnItem" class="mn"></div>' },
      { id: "chapter", section: "car", label: "Chapter", order: 4, hidden: true, html: '<div id="mnChapter" class="mn"></div>' }
    ],
    init: function (api) { API = api; installGate(); wire(api); },
    render: function (api, tab) { bust(); if (tab === "car") renderHome(api); else if (tab === "view") renderView(api); else if (tab === "item") renderItem(api); else if (tab === "chapter") renderChapter(api); },
    refresh: function (api) { bust(); },
    shown: function (api, tab) { crumb(api, tab); },
    clean: function (v) { return v && typeof v === "object" ? v : {}; },
    xp: function (api) { var d = api.mod("manual"); if (!d || !d.closed) return 0; return Object.keys(d.closed).length * 15 + (d.closed["0"] ? 15 : 0); },
    jump: function (api, kind, id) { if (kind === "view" || kind === "item" || kind === "ch") { open(api, kind, id); return true; } return false; }
  });
})();
