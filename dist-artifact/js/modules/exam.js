/* Certification exam over V60_FACTS (multiple choice from each fact's exam distractors), plus a printable fact card. */
(function () {
  function shuffle(a, seed) { a = a.slice(); var s = seed || Date.now(); function r() { s = (s * 9301 + 49297) % 233280; return s / 233280; } for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var ex = { mode: "home", qs: [], i: 0, ans: [], seed: 0 };
  function data(api) { var d = api.mod("exam"); if (!d) { d = { best: 0, passed: null, tries: 0, practice: 0 }; api.setMod("exam", d); } return d; }
  function bank() { return window.V60_FACTS.filter(function (f) { return f.exam && f.exam.length >= 2; }); }
  function start(api, tag) {
    var b = bank(); if (tag) b = b.filter(function (f) { return f.tag === tag; });
    ex.seed = Date.now(); ex.qs = shuffle(b, ex.seed).slice(0, tag ? 10 : 60).map(function (f, n) { return { f: f, opts: shuffle([f.a].concat(f.exam.slice(0, 3)), ex.seed + n) }; });
    ex.i = 0; ex.ans = []; ex.mode = tag ? "practice" : "exam"; ex.tag = tag || null; render(api);
  }
  function render(api) {
    var $ = api.$, esc = api.esc, d = data(api), body = $("exBody");
    if (ex.mode === "home") {
      var tags = {}; bank().forEach(function (f) { tags[f.tag] = (tags[f.tag] || 0) + 1; });
      body.innerHTML = '<div class="cert ' + (d.passed ? "earned" : "") + '"><p class="ans-k">V60 Master certification</p><h3>' + (d.passed ? "Certified " + esc(d.passed) : "Not certified yet") + '</h3><p>' + Math.min(60, bank().length) + " questions about your exact car. Pass at 80 percent. Best so far: " + d.best + '%.</p><div class="row"><button type="button" id="exGo">' + (d.passed ? "Retake the exam" : "Take the exam") + '</button><button type="button" class="quiet" id="exCard">Print my car fact card</button></div></div><h3 class="kbh">Practice by topic</h3><div class="tries">' + Object.keys(tags).map(function (t) { return '<button type="button" class="chipq" data-extag="' + esc(t) + '">' + esc(t) + " (" + tags[t] + ")</button>"; }).join("") + "</div>";
      return;
    }
    if (ex.mode === "done") {
      var right = ex.ans.filter(function (a, n) { return a === ex.qs[n].f.a; }).length, pct = Math.round(100 * right / ex.qs.length), pass = pct >= 80;
      var by = {}; ex.qs.forEach(function (q, n) { var t = q.f.tag; by[t] = by[t] || [0, 0]; by[t][1]++; if (ex.ans[n] === q.f.a) by[t][0]++; });
      var missed = ex.qs.map(function (q, n) { return ex.ans[n] === q.f.a ? "" : "<li><b>" + esc(q.f.q) + "</b><br><span class=\"status\">" + esc(q.f.a) + "</span></li>"; }).join("");
      body.innerHTML = '<div class="cert ' + (pass && ex.tag == null ? "earned" : "") + '"><p class="ans-k">' + (ex.tag ? "Practice: " + esc(ex.tag) : "Certification exam") + "</p><h3>" + right + " of " + ex.qs.length + " (" + pct + "%)</h3><p>" + (ex.tag ? "Practice round complete." : (pass ? "Passed. You are certified on your own car." : "Not yet. Review the missed answers and use the cards.")) + '</p><div class="row"><button type="button" data-ex="home">Back</button></div></div><div class="bars">' + Object.keys(by).map(function (t) { var v = by[t], p = Math.round(100 * v[0] / v[1]); return '<div class="bar ' + (p < 60 ? "low" : (p < 80 ? "mid" : "")) + '"><span>' + esc(t) + '</span><span class="tr"><span class="fl" style="width:' + p + '%"></span></span><span>' + v[0] + "/" + v[1] + "</span></div>"; }).join("") + "</div>" + (missed ? '<h3 class="kbh">Missed</h3><ul class="plain missed">' + missed + "</ul>" : "");
      return;
    }
    var q = ex.qs[ex.i];
    body.innerHTML = '<div class="exq"><div class="fc-meta"><span class="pill info">' + esc(q.f.tag) + '</span><span class="status">Question ' + (ex.i + 1) + " of " + ex.qs.length + '</span></div><div class="meter thin"><i style="width:' + Math.round(100 * ex.i / ex.qs.length) + '%"></i></div><h3>' + esc(q.f.q) + '</h3><div class="opts">' + q.opts.map(function (o, n) { return '<button type="button" class="opt" data-opt="' + n + '">' + esc(o) + "</button>"; }).join("") + '</div><button type="button" class="quiet" data-ex="home">Quit</button></div>';
  }
  function answer(api, n) {
    var q = ex.qs[ex.i], pick = q.opts[n], d = data(api);
    ex.ans[ex.i] = pick;
    var btns = document.querySelectorAll("#exBody .opt");
    btns.forEach(function (b, k) { b.disabled = true; if (q.opts[k] === q.f.a) b.classList.add("right"); else if (k === n) b.classList.add("wrong"); });
    setTimeout(function () {
      ex.i++;
      if (ex.i >= ex.qs.length) {
        var right = ex.ans.filter(function (a, k) { return a === ex.qs[k].f.a; }).length, pct = Math.round(100 * right / ex.qs.length);
        if (ex.mode === "exam") { d.tries++; d.best = Math.max(d.best, pct); if (pct >= 80 && !d.passed) d.passed = api.todayStr(); }
        else d.practice++;
        ex.mode = "done"; api.save(); api.updateHud();
      }
      render(api);
    }, pick === q.f.a ? 450 : 1300);
  }
  function printCard(api) {
    var st = api.state, rows = [["Car", "2016 Volvo V60 T5 Premier wagon, FWD, built in Torslanda, Sweden"], ["Engine", "B4204T11 2.0 turbo I4, 240 hp at 5,600, 258 lb-ft 1,500 to 4,500"], ["Transmission", "Aisin 8-speed automatic (TG-81SC), Volvo AW1 fluid"], ["Oil", "6.2 qt full synthetic: 5W-30 ACEA A5/B5 or Volvo 0W-20. No dipstick"], ["Coolant", "Volvo coolant 50/50, 8.7 qt"], ["Brake fluid", "DOT 4, every 3 years or 40k mi"], ["Tires", "215/50R17 at 38 psi cold. Wheel bolts 103 lb-ft. Replace at 6 years"], ["Tire monitor", "Indirect. Calibrate: MY CAR > Settings > Car settings > Tire monitoring"], ["Battery", "12 V AGM (start/stop). Jump ground: right engine mount, outer screw"], ["Bulbs", "Low H11, high H9, front turn PY24W, rear turn PY21W"], ["Fuel", "17.8 gal, 87+ octane. EPA 25/37/29 mpg"], ["Schedule", "Oil 10k/12 mo, cabin 20k, air filter and brake fluid 40k, plugs 60k, timing belt kit 150k or 10 yr"], ["Phone numbers", "Volvo customer care 1-800-458-1552"], ["Odometer", st.odo != null ? api.fmt(st.odo) + " mi (as of " + api.todayStr() + ")" : "Not entered"]];
    var w = document.getElementById("printCard");
    w.innerHTML = '<h1>My V60</h1><table>' + rows.map(function (r) { return "<tr><th>" + api.esc(r[0]) + "</th><td>" + api.esc(r[1]) + "</td></tr>"; }).join("") + "</table><p>From Volvo's 2016 V60 US owner's manual and maintenance schedule. Printed from V60 Garage.</p>";
    document.body.classList.add("printing-card"); window.print(); setTimeout(function () { document.body.classList.remove("printing-card"); }, 500);
  }
  (window.V60_MODULES = window.V60_MODULES || []).push({
    id: "exam",
    tabs: [{ id: "exam", section: "learn", label: "Exam", order: 30, html: '<section><h2>Certification</h2><p class="lede">Prove you know your car. Practice by topic, then take the full exam.</p></section><div id="exBody"></div><div id="printCard" class="printcard" aria-hidden="true"></div>' }],
    clean: function (v) { return v && typeof v === "object" ? v : null; },
    render: function (api) { if (ex.mode === "done") ex.mode = "home"; render(api); },
    init: function (api) {
      api.$("exBody").addEventListener("click", function (e) {
        var b = e.target.closest && e.target.closest("button"); if (!b) return;
        if (b.id === "exGo") start(api); else if (b.id === "exCard") printCard(api);
        else if (b.hasAttribute("data-extag")) start(api, b.getAttribute("data-extag"));
        else if (b.hasAttribute("data-opt") && !b.disabled) answer(api, +b.getAttribute("data-opt"));
        else if (b.getAttribute("data-ex") === "home") { ex.mode = "home"; render(api); }
      });
    },
    xp: function (api) { var d = api.mod("exam"); if (!d) return 0; return (d.passed ? 300 : 0) + Math.min(100, (d.practice || 0) * 10); }
  });
})();
