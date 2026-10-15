/* The certification track: the app's progression, rebuilt around ASE's G1 (data/track.js, data/quiz.js).
   Seven areas, each a level with two rungs (Owner, Technician), a readiness meter per area and one for the whole test,
   ASE-style area quizzes that open hands-on first, and a mock G1 (55 questions in the test's proportions, 90 minutes).
   Replaces the XP ranks, the skill tree and the V60 Master exam (Kyle, 2026-10-15). Perks (window.V60_PERK) now come from here.
   Saved under api.mod("track"): quiz{areaId:rung: {best, tries, passed, last}}  g1{best, tries, passed, practice, last}  seen{} */
(function () {
  var T = window.V60_TRACK_DATA, AREAS = T.areas, OWN = T.owner, API = null;
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function $(id) { return document.getElementById(id); }
  function D(api) { var d = api.mod("track"); if (!d) { d = {}; api.setMod("track", d); } ["quiz", "g1", "seen", "read"].forEach(function (k) { if (!d[k] || typeof d[k] !== "object") d[k] = {}; }); return d; }
  function area(id) { return AREAS.filter(function (a) { return a.id === id; })[0]; }
  function M() { return window.V60_MANUAL; }
  function items(a) { var data = M() && M().data; return (data ? a.items.map(function (id) { return data.items.filter(function (it) { return it.id === id; })[0]; }) : []).filter(Boolean); }

  /* ---------- the three parts of readiness ---------- */
  function hands(a, rung) {
    var out = { done: 0, total: 0, missing: [] }; if (a.noCar && rung === 1) return out;
    items(a).forEach(function (it) {
      it.chapters.forEach(function (c) {
        if (rung === 1 && c.tier !== "K" && c.tier !== "C") return;
        out.total++; if (M().closed(c.id)) out.done++; else out.missing.push({ it: it, c: c, open: M().open(c.id) });
      });
    });
    return out;
  }
  function factArea(f) { return T.factId[f.id] || T.factTag[f.tag] || "own"; }
  function facts(a) { return (window.V60_FACTS || []).filter(function (f) { return factArea(f) === a.id; }); }
  function recall(api, a) {
    var b = (api.mod("cards") || { b: {} }).b || {}, fs = facts(a), done = fs.filter(function (f) { return b[f.id] && b[f.id][0] >= 4; }).length;
    return { done: done, total: fs.length };
  }
  /* the G1 task list: entries are the study guide; a task counts as studied once its entry has been opened */
  function tasks(a) { return (window.V60_G1_TASKS || []).filter(function (t) { return t.area === a.id; }); }
  function entry(t) { return (window.V60_G1_ENTRIES || {})[t.id] || null; }
  function study(api, a) { var d = D(api), ts = tasks(a), withEntry = ts.filter(function (t) { return !!entry(t); }), read = withEntry.filter(function (t) { return !!d.read[t.id]; }).length; return { read: read, written: withEntry.length, total: ts.length }; }
  function taskQs(a, rung) {
    var out = []; tasks(a).forEach(function (t) { var e = entry(t); if (!e || !e.qs) return; e.qs.forEach(function (q, i) { if (q && q.o && q.o.length === 4) out.push({ id: t.id + "#" + i, q: q.q, o: q.o, a: q.a, why: q.why, src: q.src, item: t.item || null, task: t.id, kind: "written", area: a.id }); }); });
    return out;
  }
  function quizRec(api, a, rung) { return D(api).quiz[a.id + ":" + rung] || { best: 0, tries: 0, passed: null }; }
  function bank(a, rung) {
    var w = (window.V60_QUIZ || []).filter(function (q) { return q.area === a.id && q.rung <= rung; }).map(function (q) { return { id: q.id, q: q.q, o: q.o, a: q.a, why: q.why, src: q.src, item: q.item, task: q.task || null, kind: "written", area: a.id }; }).concat(taskQs(a, rung));
    var r = rung === 1 ? facts(a).filter(function (f) { return f.exam && f.exam.length >= 3; }).map(function (f) { return { id: f.id, q: f.q, o: [f.a].concat(f.exam.slice(0, 3)), a: 0, why: f.more || f.a, src: f.src, item: null, kind: "recall", area: a.id }; }) : [];
    return { written: w, recall: r };
  }
  function ownerEarned(api, a) { var h = hands(a, 1); return (a.noCar || (h.total > 0 && h.done === h.total)) && !!quizRec(api, a, 1).passed; }
  function techEarned(api, a) { var h = hands(a, 2); return ownerEarned(api, a) && h.total > 0 && h.done === h.total && !!quizRec(api, a, 2).passed; }
  function rung(api, a) { return techEarned(api, a) ? 2 : ownerEarned(api, a) ? 1 : 0; }
  /* readiness: 30 % hands-on chapters closed, 30 % task entries studied, 40 % best quiz score; areas with no hands-on step weigh the other two */
  function ready(api, a) {
    var h = hands(a, 1), st = study(api, a), q = quizRec(api, a, 1), parts = [];
    if (!a.noCar && h.total) parts.push([0.3, h.done / h.total]);
    parts.push([0.3, st.total ? st.read / st.total : 0]);
    parts.push([0.4, q.best / 100]);
    var wsum = parts.reduce(function (s, p) { return s + p[0]; }, 0);
    return parts.reduce(function (s, p) { return s + p[0] * p[1]; }, 0) / wsum;
  }
  function g1ready(api) { return AREAS.reduce(function (s, a) { return s + ready(api, a) * a.q / T.test.scored; }, 0); }
  function quizOpen(api, a, rg) { if (rg === 2 && !ownerEarned(api, a)) return false; var h = hands(a, rg); return a.noCar && rg === 1 ? true : h.total > 0 && h.done === h.total; }
  function allOwner(api) { return AREAS.every(function (a) { return ownerEarned(api, a); }); }
  function pct(x) { return Math.round(x * 100); }

  /* ---------- quiz engine ---------- */
  var ui = { mode: "home", area: null, rung: 1, qs: [], i: 0, ans: [], timer: null, ends: 0, mock: false };
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function withOpts(q) { var idx = shuffle(q.o.map(function (_, i) { return i; })); return { q: q, opts: idx.map(function (i) { return q.o[i]; }), right: idx.indexOf(q.a) }; }
  /* one question per task where possible, so a round covers the area instead of one corner of it */
  function spread(list, n) {
    var by = {}, keys = []; shuffle(list).forEach(function (q) { var k = q.task || q.item || q.id; if (!by[k]) { by[k] = []; keys.push(k); } by[k].push(q); });
    var out = []; keys = shuffle(keys);
    while (out.length < n && keys.some(function (k) { return by[k].length; })) keys.forEach(function (k) { if (out.length < n && by[k].length) out.push(by[k].shift()); });
    return out;
  }
  function draw(a, rg, n) {
    var b = bank(a, rg), nw = Math.min(b.written.length, Math.ceil(n * 0.7)), nr = Math.min(b.recall.length, n - nw);
    if (nw + nr < n) nw = Math.min(b.written.length, n - nr);
    return shuffle(spread(b.written, nw).concat(shuffle(b.recall).slice(0, nr))).map(withOpts);
  }
  function startQuiz(api, a, rg) {
    ui.mode = "quiz"; ui.area = a.id; ui.rung = rg; ui.mock = false; ui.qs = draw(a, rg, 10); ui.i = 0; ui.ans = []; stopTimer(); render(api); window.scrollTo(0, 0);
  }
  function startMock(api) {
    var qs = [], short = 0;
    AREAS.forEach(function (a) { var got = draw(a, 2, a.q); if (got.length < a.q) short += a.q - got.length; qs = qs.concat(got); });
    ui.mode = "quiz"; ui.area = null; ui.rung = 1; ui.mock = true; ui.short = short; ui.qs = shuffle(qs); ui.i = 0; ui.ans = []; ui.ends = Date.now() + T.test.minutes * 60000;
    tick(api); render(api); window.scrollTo(0, 0);
  }
  function tick(api) { stopTimer(); ui.timer = setInterval(function () { if (Date.now() >= ui.ends) { stopTimer(); finish(api); } else { var el = $("tkClock"); if (el) el.textContent = clock(); } }, 1000); }
  function stopTimer() { if (ui.timer) { clearInterval(ui.timer); ui.timer = null; } }
  function clock() { var s = Math.max(0, Math.round((ui.ends - Date.now()) / 1000)); return Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2); }
  function answer(api, n) {
    ui.ans[ui.i] = n;
    if (ui.mock) { ui.i++; if (ui.i >= ui.qs.length) finish(api); else render(api); return; }
    render(api); /* area quizzes show the answer at once, like a study session */
  }
  function next(api) { ui.i++; if (ui.i >= ui.qs.length) finish(api); else { render(api); window.scrollTo(0, 0); } }
  function grade() {
    var right = 0, byArea = {}, byItem = {}, byTask = {}, missed = [];
    ui.qs.forEach(function (x, i) {
      var ok = ui.ans[i] === x.right, a = x.q.area; byArea[a] = byArea[a] || [0, 0]; byArea[a][1]++;
      if (ok) { right++; byArea[a][0]++; } else { missed.push(x); if (x.q.item) byItem[x.q.item] = (byItem[x.q.item] || 0) + 1; if (x.q.task) byTask[x.q.task] = (byTask[x.q.task] || 0) + 1; }
    });
    return { right: right, n: ui.qs.length, p: ui.qs.length ? Math.round(100 * right / ui.qs.length) : 0, byArea: byArea, byItem: byItem, byTask: byTask, missed: missed };
  }
  function finish(api) {
    stopTimer();
    var g = grade(), d = D(api), passed = g.p >= Math.round(T.test.pass * 100);
    if (ui.mock) {
      var r = d.g1; r.tries = (r.tries || 0) + 1; r.best = Math.max(r.best || 0, g.p);
      if (passed && allOwner(api) && !r.passed) r.passed = api.todayStr(); else if (passed && !allOwner(api)) r.practice = api.todayStr();
      r.last = { date: api.todayStr(), p: g.p, byArea: g.byArea, short: ui.short || 0 };
    } else {
      var k = ui.area + ":" + ui.rung, q = d.quiz[k] || { best: 0, tries: 0, passed: null };
      q.tries++; q.best = Math.max(q.best, g.p); if (passed && !q.passed) q.passed = api.todayStr();
      q.last = { date: api.todayStr(), p: g.p, missed: g.missed.map(function (x) { return x.q.id; }) }; d.quiz[k] = q;
    }
    ui.mode = "result"; ui.result = g; api.save(); hud(api); render(api); window.scrollTo(0, 0);
  }

  /* ---------- pages ---------- */
  function meterHtml(v, cls) { return '<div class="tk-meter' + (cls ? " " + cls : "") + '" aria-hidden="true"><i style="width:' + pct(v) + '%"></i></div>'; }
  function srcHtml(api, src) { var S = window.V60_SOURCES, s = typeof src === "string" ? S[src] : src; return s ? '<a href="' + esc(s[1]) + '" target="_blank" rel="noopener">' + esc(s[0]) + "</a>" : ""; }
  function rungLabel(r) { return r === 2 ? "Technician" : r === 1 ? "Owner" : "Not yet"; }
  function renderHome(api) {
    var d = D(api), g = g1ready(api), g1 = d.g1, nOwner = AREAS.filter(function (a) { return ownerEarned(api, a); }).length, nTech = AREAS.filter(function (a) { return techEarned(api, a); }).length;
    var h = '<div class="mn-top"><div class="mn-kick"><button type="button" class="mn-link" data-jump="tab:car">← The car</button><span>CERTIFICATION TRACK</span></div><h2 class="mn-h1">' + esc(T.test.n) + ' readiness</h2><p>' + esc(T.test.full) + ": " + T.test.scored + " scored questions in " + T.test.minutes + " minutes, across seven areas. Each area is a level; its meter is 30 % hands-on work on your car, 30 % of ASE&#39;s task list studied and 40 % your best quiz score. The test weights the areas unevenly, so this number does too.</p></div>";
    h += '<section class="tk-big"><div class="tk-num">' + pct(g) + '<small>%</small></div><div class="tk-bigr"><div class="mn-kick"><span>G1 READINESS</span></div>' + meterHtml(g, "tall") + '<p class="status">' + nOwner + " of 7 areas at Owner · " + nTech + " at Technician" + (g1.passed ? " · mock G1 passed " + esc(g1.passed) : g1.best ? " · best mock G1 " + g1.best + " %" : "") + "</p></div></section>";
    h += '<section class="mn-list"><div class="mn-kick"><span>AREAS · IN TEST ORDER</span><span class="mn-mono">QUESTIONS</span></div>' + AREAS.map(function (a) {
      var r = rung(api, a), rd = ready(api, a), hs = hands(a, 1), st = r === 2 ? "closed" : r === 1 ? "open" : quizOpen(api, a, 1) ? "new" : "open";
      return '<button type="button" class="tk-row ' + st + '" data-area="' + a.id + '"><span class="n">' + a.letter + '</span><span class="b"><span class="t">' + esc(a.n) + '</span>' + meterHtml(rd) + '<span class="d">' + (r ? rungLabel(r) + " · " : "") + pct(rd) + " % ready" + (a.noCar ? " · reading and quiz" : hs.total ? " · " + hs.done + " of " + hs.total + " chapters closed" : "") + (quizOpen(api, a, r < 1 ? 1 : 2) && r < 2 && !quizRec(api, a, r < 1 ? 1 : 2).passed ? ' · <b class="mn-amber">quiz open</b>' : "") + '</span></span><span class="s mn-mono">' + a.q + " / " + T.test.scored + "</span></button>";
    }).join("") + "</section>";
    var mockOpen = true, counts = allOwner(api);
    h += '<article class="mn-sheet tk-mock"><div class="mn-kick"><span>MOCK G1</span><span class="mn-mono">' + T.test.scored + " Q · " + T.test.minutes + ' MIN</span></div><h3>' + (g1.passed ? "Passed on " + esc(g1.passed) : "The full test, timed") + '</h3><p>' + T.test.scored + " questions drawn in the test's proportions (" + AREAS.map(function (a) { return a.letter + " " + a.q; }).join(", ") + "), " + T.test.minutes + " minutes on the clock, answers shown at the end like a score report. " + esc(T.test.passNote) + "</p>" +
      '<p class="status">' + (counts ? "Every area is at Owner, so a pass counts." : "Counts toward the finale once every area is at Owner. Until then it is practice, and it still shows where you stand.") + (g1.tries ? " Tries: " + g1.tries + ", best " + g1.best + " %." : "") + "</p>" +
      '<button type="button" class="mn-cta" data-mock="1">' + (g1.tries ? "Take the mock G1 again" : "Start the mock G1") + ' <span aria-hidden="true">→</span></button></article>';
    var own = items(OWN);
    h += '<section class="mn-list"><div class="mn-kick"><span>OWNER\'S WORK · NOT ON THE G1</span></div><p class="status">' + esc(OWN.d) + "</p>" + own.map(function (it) { var n = it.chapters.filter(function (c) { return M().closed(c.id); }).length; return '<button type="button" class="mn-ix" data-jump="item:' + it.id + '"><span class="n">' + esc(it.num) + "</span><span>" + esc(it.n) + '</span><span class="st">' + n + " / " + it.chapters.length + "</span></button>"; }).join("") + "</section>";
    h += '<p class="status">Question counts per area are from ASE\'s G1 study guide. Quiz questions are this app\'s own, grounded in Volvo\'s manual and the other sources in the Library; none are ASE\'s. Sources: ' + srcHtml(api, "aseg1") + " · " + srcHtml(api, "aseg1p") + " · " + srcHtml(api, "asefees") + "</p>";
    return h;
  }
  function renderArea(api, a) {
    var r = rung(api, a), h1 = hands(a, 1), h2 = hands(a, 2), st = study(api, a), q1 = quizRec(api, a, 1), q2 = quizRec(api, a, 2), b1 = bank(a, 1), b2 = bank(a, 2), rd = ready(api, a);
    var h = '<div class="mn-top"><div class="mn-kick"><button type="button" class="mn-link" data-tk="home">← Track</button><span>AREA ' + a.letter + " · " + a.q + " OF " + T.test.scored + ' QUESTIONS</span></div><h2 class="mn-h1">' + esc(a.n) + '</h2><p>' + esc(a.d) + "</p>" + (a.noCar ? '<p class="mn-locked">' + esc(a.noCar) + "</p>" : "") + "</div>";
    h += '<section class="tk-big"><div class="tk-num">' + pct(rd) + '<small>%</small></div><div class="tk-bigr"><div class="mn-kick"><span>READY · ' + esc(rungLabel(r).toUpperCase()) + "</span></div>" + meterHtml(rd, "tall") +
      '<dl class="tk-parts">' + (a.noCar ? "" : "<div><dt>Hands-on</dt><dd>" + h1.done + " / " + h1.total + " chapters</dd></div>") + "<div><dt>Studied</dt><dd>" + st.read + " / " + st.total + " tasks</dd></div><div><dt>Quiz</dt><dd>" + (q1.tries ? q1.best + " % best" : "not taken") + "</dd></div></dl></div></section>";
    /* rung 1 */
    var open1 = quizOpen(api, a, 1);
    h += '<article class="mn-sheet tk-rung' + (ownerEarned(api, a) ? " done" : "") + '"><div class="mn-kick"><span>RUNG 1 · OWNER</span><span class="mn-mono">' + (q1.passed ? "PASSED " + esc(q1.passed) : open1 ? "QUIZ OPEN" : "LOCKED") + '</span></div><h3>Know it and check it on your car, then the Owner quiz</h3>' +
      (a.noCar ? '<p class="status">No hands-on step for this area. The quiz is open.</p>' : h1.missing.length ? '<p class="status">Still to close: ' + h1.missing.slice(0, 6).map(function (m) { return '<button type="button" class="mn-link" data-jump="ch:' + m.c.id + '">' + esc(m.c.id + " " + m.it.n + ", " + m.c.t) + "</button>"; }).join(" · ") + (h1.missing.length > 6 ? " · and " + (h1.missing.length - 6) + " more" : "") + "</p>" : '<p class="status">Every Know and Check chapter in this area is closed.</p>') +
      '<p class="status">' + (b1.written.length + b1.recall.length) + " questions in the bank: " + b1.written.length + " scenario, " + b1.recall.length + " recall. Ten per round, pass at " + Math.round(T.test.pass * 100) + " %.</p>" +
      (open1 ? '<button type="button" class="mn-cta" data-quiz="1">' + (q1.tries ? "Take the Owner quiz again" : "Take the Owner quiz") + ' <span aria-hidden="true">→</span></button>' : '<p class="mn-locked">The quiz opens when the hands-on chapters above are closed. Reading alone can\'t level you up.</p>') + "</article>";
    /* rung 2 */
    var open2 = quizOpen(api, a, 2);
    h += '<article class="mn-sheet tk-rung' + (techEarned(api, a) ? " done" : "") + '"><div class="mn-kick"><span>RUNG 2 · TECHNICIAN</span><span class="mn-mono">' + (q2.passed ? "PASSED " + esc(q2.passed) : open2 ? "QUIZ OPEN" : "AFTER OWNER") + '</span></div><h3>Service and diagnose it, then the Technician quiz</h3>' +
      (ownerEarned(api, a) ? (h2.missing.length ? '<p class="status">Still to close: ' + h2.missing.slice(0, 6).map(function (m) { return '<button type="button" class="mn-link" data-jump="ch:' + m.c.id + '">' + esc(m.c.id + " " + m.it.n + ", " + m.c.t) + "</button>"; }).join(" · ") + "</p>" : '<p class="status">Every chapter in this area is closed.</p>') : '<p class="status">Earn the Owner rung first.</p>') +
      '<p class="status">' + b2.written.filter(function (q) { return (window.V60_QUIZ || []).some(function (z) { return z.id === q.id && z.rung === 2; }); }).length + " diagnosis questions in the bank so far; the round also draws from the Owner questions.</p>" +
      (open2 ? '<button type="button" class="mn-cta" data-quiz="2">' + (q2.tries ? "Take the Technician quiz again" : "Take the Technician quiz") + ' <span aria-hidden="true">→</span></button>' : "") + "</article>";
    /* the task list: the study guide proper */
    h += taskListHtml(api, a, st);
    /* parts */
    h += '<section class="mn-list"><div class="mn-kick"><span>PARTS IN THIS AREA</span></div>' + items(a).map(function (it) { var n = it.chapters.filter(function (c) { return M().closed(c.id); }).length, st = M().status ? "" : ""; return '<button type="button" class="mn-ix" data-jump="item:' + it.id + '"><span class="n">' + esc(it.num) + "</span><span>" + esc(it.n) + '</span><span class="st">' + (n === it.chapters.length ? "CLOSED" : n + " / " + it.chapters.length) + "</span></button>"; }).join("") + "</section>";
    /* weak spots */
    var last = q1.last || q2.last; if (last && last.missed && last.missed.length) {
      var byTask = {}, byItem = {}; last.missed.forEach(function (id) { var m = /^([A-G]\d+)#/.exec(id); if (m) { byTask[m[1]] = (byTask[m[1]] || 0) + 1; return; } var z = (window.V60_QUIZ || []).filter(function (q) { return q.id === id; })[0]; if (z && z.task) byTask[z.task] = (byTask[z.task] || 0) + 1; else if (z && z.item) byItem[z.item] = (byItem[z.item] || 0) + 1; });
      var kt = Object.keys(byTask), ki = Object.keys(byItem);
      if (kt.length || ki.length) h += '<section class="mn-list"><div class="mn-kick"><span>WEAK SPOTS · LAST ROUND</span></div><div class="mn-chips">' +
        kt.map(function (k) { var t = (window.V60_G1_TASKS || []).filter(function (x) { return x.id === k; })[0]; return t ? '<button type="button" class="mn-chip" data-task="' + esc(k) + '">' + esc(k + " · " + t.t) + " · " + byTask[k] + " missed</button>" : ""; }).join("") +
        ki.map(function (k) { var it = M().data.items.filter(function (x) { return x.id === k; })[0]; return it ? '<button type="button" class="mn-chip" data-jump="item:' + it.id + '">' + esc(it.n) + " · " + byItem[k] + " missed</button>" : ""; }).join("") + "</div></section>";
    }
    return h;
  }
  function taskHtml(api, t, open) {
    var e = entry(t), d = D(api), read = !!d.read[t.id];
    var h = '<details class="tk-task' + (read ? " read" : "") + (e ? "" : " empty") + '" data-task-id="' + esc(t.id) + '"' + (open ? " open" : "") + '><summary><span class="n">' + esc(t.id) + '</span><span class="b"><span class="t">' + esc(t.t) + "</span>" + (t.car && !e ? '<span class="status">' + esc(t.car) + "</span>" : "") + '</span><span class="mn-tick" aria-label="' + (read ? "studied" : "not yet") + '">' + (read ? "✓" : "") + '</span></summary><div class="tk-taskb">';
    if (!e) h += '<p class="status">No sourced entry yet.</p>';
    else {
      h += (e.body || []).map(function (l) { return "<p>" + esc(l) + "</p>"; }).join("");
      if (e.car || t.car) h += '<p class="tk-car"><b>On your car:</b> ' + esc(e.car || t.car) + "</p>";
      if (e.src && e.src.length) h += '<p class="status">Sources: ' + e.src.map(function (s) { return srcHtml(api, s); }).join(" · ") + "</p>";
      if (e.qs && e.qs.length) h += '<p class="status">' + e.qs.length + (e.qs.length === 1 ? " question" : " questions") + " on this task in the quiz bank.</p>";
    }
    return h + "</div></details>";
  }
  function taskListHtml(api, a, st) {
    var ts = tasks(a), groups = [], seen = {};
    ts.forEach(function (t) { var g = t.g || ""; if (!seen[g]) { seen[g] = true; groups.push(g); } });
    var h = '<section class="mn-list tk-tasks"><div class="mn-kick"><span>THE G1 TASK LIST · ' + ts.length + ' TASKS</span><span class="mn-mono">' + st.read + " STUDIED · " + st.written + ' WRITTEN</span></div><p class="status">ASE&#39;s task list for this area, in ASE&#39;s order and numbering, in this app&#39;s words. Open a task to study it; an opened task counts as studied. Tasks your car does not have are still on the test.</p>';
    groups.forEach(function (g) { if (g) h += '<p class="tk-group">' + esc(g) + "</p>"; h += ts.filter(function (t) { return (t.g || "") === g; }).map(function (t) { return taskHtml(api, t, ui.openTask === t.id); }).join(""); });
    return h + "</section>";
  }
  function renderQuiz(api) {
    var x = ui.qs[ui.i], picked = ui.ans[ui.i], a = ui.area ? area(ui.area) : null;
    var h = '<div class="mn-top"><div class="mn-kick"><button type="button" class="mn-link" data-tk="quit">Quit</button><span>' + (ui.mock ? "MOCK G1 · <b id=\"tkClock\" class=\"mn-amber\">" + clock() + "</b>" : esc(a.n.toUpperCase()) + " · " + esc(rungLabel(ui.rung).toUpperCase()) + " QUIZ") + '</span></div></div>';
    h += '<div class="tk-q"><div class="mn-kick"><span>QUESTION ' + (ui.i + 1) + " OF " + ui.qs.length + '</span><span class="mn-mono">' + (ui.mock ? esc(area(x.q.area).letter + " · " + area(x.q.area).n) : x.q.kind === "recall" ? "RECALL" : "SCENARIO") + "</span></div>" + meterHtml(ui.i / ui.qs.length, "thin") + '<h3>' + esc(x.q.q) + '</h3><div class="tk-opts">' + x.opts.map(function (o, n) {
      var cls = "tk-opt"; if (picked != null && !ui.mock) { if (n === x.right) cls += " right"; else if (n === picked) cls += " wrong"; }
      return '<button type="button" class="' + cls + '" data-opt="' + n + '"' + (picked != null && !ui.mock ? " disabled" : "") + '><span class="l">' + "ABCD".charAt(n) + "</span><span>" + esc(o) + "</span></button>";
    }).join("") + "</div>";
    if (picked != null && !ui.mock) h += '<div class="tk-why ' + (picked === x.right ? "ok" : "bad") + '"><b>' + (picked === x.right ? "Correct." : "Not quite. The answer is " + "ABCD".charAt(x.right) + ".") + "</b> " + esc(x.q.why) + '<span class="status"> Source: ' + srcHtml(api, x.q.src) + '</span></div><div class="row"><button type="button" class="mn-cta" data-tk="next">' + (ui.i + 1 >= ui.qs.length ? "See the result" : "Next question") + ' <span aria-hidden="true">→</span></button></div>';
    h += "</div>";
    return h;
  }
  function renderResult(api) {
    var g = ui.result, d = D(api), passed = g.p >= Math.round(T.test.pass * 100), a = ui.area ? area(ui.area) : null;
    var h = '<div class="mn-top"><div class="mn-kick"><button type="button" class="mn-link" data-tk="' + (a ? "area" : "home") + '">← ' + (a ? esc(a.n) : "Track") + "</button><span>" + (ui.mock ? "MOCK G1 · SCORE REPORT" : "RESULT") + '</span></div><h2 class="mn-h1">' + g.right + " of " + g.n + " · " + g.p + ' %</h2><p>' + (passed ? (ui.mock ? (allOwner(api) ? "A pass, and it counts: every area is at Owner." : "A pass on paper. It counts once every area is at Owner; until then it is a practice score.") : "Passed. The " + rungLabel(ui.rung) + " rung for " + a.n + (quizRec(api, a, ui.rung).passed ? " is yours" : "") + (ui.rung === 1 && !ownerEarned(api, a) ? ", once the hands-on chapters are closed" : "") + ".") : "Below " + Math.round(T.test.pass * 100) + " %. Read the explanations, close the weak spots on the car, and take it again.") + "</p></div>";
    if (ui.mock) {
      h += '<section class="mn-list"><div class="mn-kick"><span>BY AREA</span><span class="mn-mono">RIGHT / ASKED</span></div>' + AREAS.map(function (ar) { var b = g.byArea[ar.id] || [0, 0]; return '<button type="button" class="tk-row" data-area="' + ar.id + '"><span class="n">' + ar.letter + '</span><span class="b"><span class="t">' + esc(ar.n) + "</span>" + meterHtml(b[1] ? b[0] / b[1] : 0) + '</span><span class="s mn-mono">' + b[0] + " / " + b[1] + "</span></button>"; }).join("") + "</section>";
      if (ui.short) h += '<p class="status">' + ui.short + " of " + T.test.scored + " questions could not be drawn yet: the bank grows with each area.</p>";
    }
    var ks = Object.keys(g.byItem);
    if (ks.length) h += '<section class="mn-list"><div class="mn-kick"><span>WEAK SPOTS · GO FIX THEM ON THE CAR</span></div><div class="mn-chips">' + ks.map(function (k) { var it = M().data.items.filter(function (x) { return x.id === k; })[0]; return it ? '<button type="button" class="mn-chip" data-jump="item:' + it.id + '">' + esc(it.n) + " · " + g.byItem[k] + " missed</button>" : ""; }).join("") + "</div></section>";
    if (g.missed.length) h += '<section class="mn-list"><div class="mn-kick"><span>REVIEW · ' + g.missed.length + " MISSED</span></div>" + g.missed.map(function (x) { return '<div class="tk-rev"><p><b>' + esc(x.q.q) + '</b></p><p>' + "ABCD".charAt(x.right) + ". " + esc(x.opts[x.right]) + '</p><p class="status">' + esc(x.q.why) + " Source: " + srcHtml(api, x.q.src) + "</p></div>"; }).join("") + "</section>";
    h += '<div class="row">' + (ui.mock ? '<button type="button" class="mn-cta" data-mock="1">Take it again</button>' : '<button type="button" class="mn-cta" data-quiz="' + ui.rung + '">Another round</button>') + '<button type="button" class="quiet" data-tk="' + (a ? "area" : "home") + '">Back</button></div>';
    return h;
  }
  function render(api) {
    var el = $("tkBody"); if (!el) return;
    if (ui.mode === "quiz") el.innerHTML = renderQuiz(api);
    else if (ui.mode === "result") el.innerHTML = renderResult(api);
    else if (ui.mode === "area" && area(ui.area)) el.innerHTML = renderArea(api, area(ui.area));
    else { ui.mode = "home"; el.innerHTML = renderHome(api); }
  }

  /* ---------- the HUD chip and the home strip ---------- */
  function hud(api) {
    var g = pct(g1ready(api)), r = $("hudRank"), n = $("hudRankName");
    if (r) r.textContent = g + "%"; if (n) n.textContent = "G1 ready";
  }
  function stripHtml(api) {
    var g = g1ready(api), next = null;
    AREAS.forEach(function (a) { if (!next && rung(api, a) < 2 && quizOpen(api, a, rung(api, a) + 1) && !quizRec(api, a, rung(api, a) + 1).passed) next = a; });
    return '<button type="button" class="tk-strip" data-jump="track:"><span class="tk-stripn">' + pct(g) + '<small>%</small></span><span class="tk-stripb"><span class="mn-kick"><span>G1 READINESS</span><span class="mn-mono">' + AREAS.filter(function (a) { return ownerEarned(api, a); }).length + ' / 7 AREAS</span></span>' + '<span class="tk-segs" aria-hidden="true">' + AREAS.map(function (a) { return '<i class="r' + rung(api, a) + '" style="flex:' + a.q + '" title="' + esc(a.n) + '"></i>'; }).join("") + "</span>" + (next ? '<span class="status"><b class="mn-amber">Quiz open:</b> ' + esc(next.n) + "</span>" : '<span class="status">Close chapters on the car to open each area\'s quiz.</span>') + "</span></button>";
  }

  window.V60_TRACK = {
    ready: function () { return API ? g1ready(API) : 0; }, areaReady: function (id) { return API && area(id) ? ready(API, area(id)) : 0; }, rung: function (id) { return API && area(id) ? rung(API, area(id)) : 0; },
    passedG1: function () { return !!(API && D(API).g1.passed); }, strip: function () { return API ? stripHtml(API) : ""; }, hud: function () { if (API) hud(API); },
    areaOf: function (itemId) { return AREAS.filter(function (a) { return a.items.indexOf(itemId) >= 0; }); },
    tasksFor: function (itemId) { return (window.V60_G1_TASKS || []).filter(function (t) { return t.item === itemId; }); }
  };
  /* perks: Mechanic detail level after the first Owner rung; the Timeline after three services or receipts */
  window.V60_PERK = function (name) {
    if (!API) return true; var s = API.mod("story") || {}; if (s.all || (s.closed && s.closed.fin)) return true;
    if (name === "mech") return AREAS.some(function (a) { return ownerEarned(API, a); });
    if (name === "timeline") return API.state.log.length + ((API.mod("glove") || {}).receipts || []).length >= 3;
    return true;
  };

  (window.V60_MODULES = window.V60_MODULES || []).push({
    id: "track",
    tabs: [{ id: "track", section: "learn", label: "Certification track", order: 5, hidden: true, html: '<div id="tkBody" class="mn track"></div>' }],
    clean: function (v) { return v && typeof v === "object" ? { quiz: v.quiz || {}, g1: v.g1 || {}, seen: v.seen || {}, read: v.read || {} } : null; },
    init: function (api) {
      API = api;
      api.$("tkBody").addEventListener("toggle", function (e) {
        var dt = e.target; if (!dt.matches || !dt.matches("details.tk-task") || !dt.open) return;
        var tid = dt.getAttribute("data-task-id"), d = D(api); ui.openTask = tid;
        if (!d.read[tid] && (window.V60_G1_ENTRIES || {})[tid]) { d.read[tid] = api.todayStr(); api.save(); dt.classList.add("read"); var tk = dt.querySelector(".mn-tick"); if (tk) tk.textContent = "✓"; hud(api); var m = dt.closest("#tkBody"); var kick = m && m.querySelector(".tk-tasks .mn-kick .mn-mono"); if (kick && ui.area) { var st = study(api, area(ui.area)); kick.textContent = st.read + " STUDIED · " + st.written + " WRITTEN"; } }
      }, true);
      api.$("tkBody").addEventListener("click", function (e) {
        var t = e.target, b;
        if ((b = t.closest("[data-task]"))) { var tid = b.getAttribute("data-task"), tk = (window.V60_G1_TASKS || []).filter(function (x) { return x.id === tid; })[0]; if (!tk) return; stopTimer(); ui.mode = "area"; ui.area = tk.area; ui.openTask = tid; render(api); var el = document.querySelector('#tkBody [data-task-id="' + tid + '"]'); if (el && el.scrollIntoView) el.scrollIntoView({ block: "start" }); return; }
        if ((b = t.closest("[data-area]"))) { stopTimer(); ui.mode = "area"; ui.area = b.getAttribute("data-area"); ui.openTask = null; render(api); window.scrollTo(0, 0); return; }
        if ((b = t.closest("[data-quiz]"))) { var a = area(ui.area); if (a) startQuiz(api, a, +b.getAttribute("data-quiz")); return; }
        if ((b = t.closest("[data-mock]"))) { startMock(api); return; }
        if ((b = t.closest("[data-opt]")) && !b.disabled) { answer(api, +b.getAttribute("data-opt")); return; }
        if ((b = t.closest("[data-tk]"))) { var k = b.getAttribute("data-tk"); if (k === "next") next(api); else { stopTimer(); ui.mode = k === "area" && ui.area ? "area" : "home"; render(api); window.scrollTo(0, 0); } return; }
      });
    },
    render: function (api) { render(api); hud(api); },
    shown: function (api, tab) { if (tab !== "track") stopTimer(); else if (ui.mode === "quiz" && ui.mock && !ui.timer) { if (Date.now() >= ui.ends) finish(api); else tick(api); } hud(api); },
    jump: function (api, kind, id) {
      if (kind === "task") { var tk = (window.V60_G1_TASKS || []).filter(function (x) { return x.id === id; })[0]; if (!tk) return false; stopTimer(); ui.mode = "area"; ui.area = tk.area; ui.openTask = id; api.go("track"); var el = document.querySelector('#tkBody [data-task-id="' + id + '"]'); if (el && el.scrollIntoView) setTimeout(function () { el.scrollIntoView({ block: "start" }); }, 0); return true; }
      if (kind !== "track") return false; stopTimer(); if (id === "g1") { api.go("track"); startMock(api); return true; } ui.mode = id && area(id) ? "area" : "home"; ui.area = id && area(id) ? id : ui.area; api.go("track"); return true; },
    xp: function () { return 0; }
  });
})();
