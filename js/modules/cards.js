/* Mastery deck: spaced repetition over V60_FACTS. Boxes 0-5, intervals in days. */
(function () {
  var GAP = [0, 1, 3, 7, 16, 35];
  var NEW_PER_DAY = 10;
  function day() { return Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5); }
  function data(api) { var d = api.mod("cards"); if (!d) { d = { b: {}, rev: {}, newDay: {} }; api.setMod("cards", d); } return d; }
  function queue(api) {
    var d = data(api), today = day(), due = [], fresh = [];
    var K = window.V60_KNOW;
    window.V60_FACTS.forEach(function (f) { var c = d.b[f.id]; if (!c) { if (!K || K.fact(f)) fresh.push(f); } else if (c[1] <= today) due.push(f); });
    var newLeft = Math.max(0, NEW_PER_DAY - (d.newDay[today] || 0));
    return due.concat(fresh.slice(0, newLeft));
  }
  function mastered(api) { var d = data(api); return Object.keys(d.b).filter(function (k) { return d.b[k][0] >= 4; }).length; }
  var cs = { q: [], i: 0, flip: false, filter: "" };
  function render(api) {
    var $ = api.$, esc = api.esc, d = data(api), F = window.V60_FACTS, m = mastered(api);
    var tags = {}; F.forEach(function (f) { tags[f.tag] = 1; });
    $("cdStats").innerHTML = '<div class="stat"><b>' + m + '</b><span>mastered of ' + F.length + '</span></div><div class="stat"><b>' + queue(api).length + '</b><span>due today</span></div><div class="stat"><b>' + Object.keys(d.b).length + '</b><span>seen</span></div>';
    $("cdMeter").innerHTML = '<i style="width:' + Math.round(100 * m / F.length) + '%"></i>';
    if (!cs.q.length || cs.i >= cs.q.length) {
      var left = queue(api).length;
      $("cdStage").innerHTML = '<div class="fc done"><p class="fc-q">' + (cs.q.length ? "Session done." : (left ? left + " cards are ready." : "Nothing due right now.")) + '</p><p class="status">' + (left ? "About " + Math.max(1, Math.round(left * 0.15)) + " minutes." : "New cards unlock tomorrow. Practice any topic below.") + '</p><div class="row">' + (left ? '<button type="button" id="cdStart">Start today\'s cards</button>' : "") + '</div><div class="tries">' + Object.keys(tags).map(function (t) { return '<button type="button" class="chipq" data-cdtag="' + esc(t) + '">Practice: ' + esc(t) + "</button>"; }).join("") + "</div></div>";
      return;
    }
    var f = cs.q[cs.i], c = d.b[f.id];
    $("cdStage").innerHTML = '<div class="fc' + (cs.flip ? " flipped" : "") + '"><div class="fc-meta"><span class="pill info">' + esc(f.tag) + '</span><span class="status">' + (cs.i + 1) + " of " + cs.q.length + (c ? "" : " · new") + '</span></div><p class="fc-q">' + esc(f.q) + "</p>" + (cs.flip ? '<p class="fc-a">' + esc(f.a) + '</p><div class="fc-grade"><button type="button" class="quiet" data-grade="0">Again</button><button type="button" class="quiet" data-grade="1">Hard</button><button type="button" data-grade="2">Got it</button><button type="button" class="quiet" data-grade="3">Easy</button></div>' : '<button type="button" id="cdFlip" class="flipbtn">Show answer</button>') + "</div>";
  }
  function grade(api, g) {
    var d = data(api), f = cs.q[cs.i], today = day(), c = d.b[f.id];
    if (!c) { d.newDay[today] = (d.newDay[today] || 0) + 1; c = [0, today]; }
    var box = g === 0 ? 0 : (g === 1 ? Math.max(1, c[0]) : (g === 2 ? Math.min(5, c[0] + 1) : Math.min(5, c[0] + 2)));
    d.b[f.id] = [box, today + GAP[box]];
    d.rev[today] = (d.rev[today] || 0) + 1;
    Object.keys(d.newDay).forEach(function (k) { if (+k < today - 3) delete d.newDay[k]; });
    Object.keys(d.rev).forEach(function (k) { if (+k < today - 60) delete d.rev[k]; });
    if (g === 0 && cs.q.length < 60) cs.q.push(f);
    cs.i++; cs.flip = false; api.save(); api.updateHud(); render(api);
  }
  (window.V60_MODULES = window.V60_MODULES || []).push({
    id: "cards",
    tabs: [{ id: "cards", section: "learn", label: "Cards", order: 15, html: '<section><h2>Mastery cards</h2><p class="lede">Every card is a fact about your exact car. Cards you know come back less often; cards you miss come back sooner. A few minutes a day and you can answer anything about your V60.</p><div class="stats" id="cdStats"></div><div class="meter" id="cdMeter" aria-hidden="true"></div></section><div id="cdStage"></div>' }],
    clean: function (v) { return v && typeof v === "object" ? { b: v.b || {}, rev: v.rev || {}, newDay: v.newDay || {} } : null; },
    render: function (api) { render(api); },
    init: function (api) {
      api.$("cdStage").addEventListener("click", function (e) {
        var b = e.target.closest && e.target.closest("button"); if (!b) return;
        if (b.id === "cdStart") { cs.q = queue(api); cs.i = 0; cs.flip = false; render(api); }
        else if (b.id === "cdFlip") { cs.flip = true; render(api); }
        else if (b.hasAttribute("data-grade")) grade(api, +b.getAttribute("data-grade"));
        else if (b.hasAttribute("data-cdtag")) { var t = b.getAttribute("data-cdtag"); cs.q = window.V60_FACTS.filter(function (f) { return f.tag === t; }); cs.i = 0; cs.flip = false; render(api); }
      });
    },
    xp: function (api) { var d = api.mod("cards"); if (!d) return 0; var m = Object.keys(d.b).filter(function (k) { return d.b[k][0] >= 4; }).length; return m * 4 + Object.keys(d.b).length; },
    today: function (api) { var n = queue(api).length; return [{ order: 10, html: '<article class="tcard feature"><h3>Mastery cards</h3><p class="bigline">' + (n ? n + " ready" : "All caught up") + '</p><p class="status">' + mastered(api) + " of " + window.V60_FACTS.length + ' facts mastered</p><button type="button" data-jump="tab:cards">' + (n ? "Review now" : "Practice") + "</button></article>" }]; }
  });
})();
