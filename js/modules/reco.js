/* Recommended for your car (2026-11-27): Claude, on Kyle's PC, reviews the car weekly (and when Kyle asks) and keeps a
   short list of maintenance, repair, performance and cosmetic recommendations, each with this car's evidence, how soon,
   DIY or shop, a cost only when a source gives one, and sources (bridge/data/notes/recommendations.json; rules in
   bridge/CLAUDE.md, "Recommendations"). The PC's summary.json carries it (validated in drives.js, cleanReco); this page
   shows it, and Home shows the top three. Kyle's "Done" and "Not interested" marks are saved here (mod "reco", synced)
   and keyed by the item's id. "Ask for new recommendations" posts to https://<pc>/drives/review. */
(function () {
  var API = null, $ = function (id) { return document.getElementById(id); };
  var KIND = { maintenance: "Maintenance", repair: "Repair", performance: "Performance", cosmetic: "Cosmetic" };
  var WHEN = { now: ["bad", "Now"], soon: ["watch", "Soon"], later: ["info", "Later"] };
  var EFFORT = { diy: "DIY", shop: "Shop", either: "DIY or shop" };
  var filter = "all";

  function esc(s) { return API ? API.esc(s) : String(s); }
  function feed() { var d = window.V60_DRIVES && window.V60_DRIVES.data && window.V60_DRIVES.data(); return d && d.recommendations ? d.recommendations : null; }
  function marks() { var m = API && API.mod("reco"); return (m && m.marks) || {}; }
  function open() { var f = feed(), mk = marks(); return f ? f.items.filter(function (r) { return !mk[r.id]; }) : []; }
  var RANK = { now: 0, soon: 1, later: 2 };
  function sorted(list) { return list.slice().sort(function (a, b) { return (RANK[a.when] - RANK[b.when]) || 0; }); }
  function day(s) { if (!s) return ""; var d = new Date(s); if (!isFinite(d)) return ""; try { return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }); } catch (e) { return String(s).slice(0, 10); } }

  function itemHtml(r, full) {
    var w = WHEN[r.when] || WHEN.later;
    var h = '<article class="rc-item"><div class="rc-head"><span class="pill ' + w[0] + '">' + w[1] + '</span><span class="rc-kind">' + esc(KIND[r.kind] || r.kind) + "</span>" +
      (r.confidence === "unconfirmed" ? '<span class="pill none">Unconfirmed</span>' : "") + "</div><h3>" + esc(r.title) + "</h3>";
    if (r.why) h += "<p>" + esc(r.why) + "</p>";
    var facts = [EFFORT[r.effort] || "", r.cost || ""].filter(Boolean);
    if (facts.length) h += '<p class="status">' + esc(facts.join(" · ")) + "</p>";
    if (full) {
      var more = "";
      if (r.evidence) more += "<p>" + esc(r.evidence) + "</p>";
      if (r.sources.length) more += '<p class="status">Sources: ' + r.sources.map(function (x) { return '<a href="' + esc(x[1]) + '" target="_blank" rel="noopener">' + esc(x[0]) + "</a>"; }).join(" · ") + "</p>";
      if (more) h += "<details><summary>Evidence and sources</summary>" + more + "</details>";
      h += '<div class="row"><button type="button" class="quiet" data-rcmark="' + esc(r.id) + ':done">Done</button><button type="button" class="quiet" data-rcmark="' + esc(r.id) + ':no">Not interested</button></div>';
    }
    return h + "</article>";
  }

  function render(api) {
    API = api;
    var box = $("rcList"); if (!box) return;
    var f = feed(), list = sorted(open()), mk = marks();
    var seg = $("rcFilter");
    if (seg) Array.prototype.forEach.call(seg.querySelectorAll("button"), function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-rcf") === filter ? "true" : "false"); });
    var shown = filter === "all" ? list : list.filter(function (r) { return r.kind === filter; });
    if (!f) box.innerHTML = '<p class="status">No recommendations yet. They come from Claude on your PC, which reviews the car once a week; the PC has to be on and Tailscale on here.</p>';
    else box.innerHTML = shown.length ? shown.map(function (r) { return itemHtml(r, true); }).join("") : '<p class="status">Nothing here' + (filter === "all" ? "" : " of this kind") + ".</p>";
    var hidden = f ? f.items.filter(function (r) { return mk[r.id]; }) : [];
    $("rcHidden").innerHTML = hidden.length ? "<details><summary>" + hidden.length + " marked done or not interested</summary>" + hidden.map(function (r) {
      return '<p class="status">' + esc(r.title) + " · " + (mk[r.id] === "done" ? "done" : "not interested") + ' <button type="button" class="mn-link" data-rcmark="' + esc(r.id) + ':undo">Undo</button></p>';
    }).join("") + "</details>" : "";
    $("rcWhen").textContent = f && f.updated ? "Reviewed " + day(f.updated) + ". Claude reviews the car once a week." : "";
    $("rcAsk").disabled = !(window.V60_DRIVES && window.V60_DRIVES.host && window.V60_DRIVES.host());
  }

  /* Home: the top three not yet marked, most urgent first */
  function homeHtml(api) {
    API = api;
    var list = sorted(open()).slice(0, 3); if (!list.length) return "";
    return '<section class="hm-sec"><div class="mn-kick"><span>RECOMMENDED</span><span>BY CLAUDE</span></div>' + list.map(function (r) {
      var w = WHEN[r.when] || WHEN.later;
      return '<button type="button" class="hm-row" data-jump="tab:reco"><span class="hm-b"><span class="hm-t">' + esc(r.title) + '</span><span class="hm-s">' + esc((KIND[r.kind] || "") + (r.why ? ": " + r.why : "")) + '</span></span><span class="pill ' + w[0] + '">' + w[1] + "</span></button>";
    }).join("") + '<button type="button" class="mn-link hm-more" data-jump="tab:reco">All recommendations</button></section>';
  }

  function ask() {
    var h = window.V60_DRIVES && window.V60_DRIVES.host && window.V60_DRIVES.host(); if (!h) return;
    $("rcAsk").disabled = true; $("rcMsg").textContent = "Asking…";
    fetch("https://" + h + "/drives/review", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })
      .then(function (r) { if (!r.ok) throw new Error(); $("rcMsg").textContent = "Claude is reviewing the car. The list updates here in a few minutes."; setTimeout(function () { if (window.V60_DRIVES) window.V60_DRIVES.refresh(); }, 240000); })
      .catch(function () { $("rcMsg").textContent = "Your PC did not answer. Is it on, and Tailscale on here?"; })
      .then(function () { $("rcAsk").disabled = false; });
  }

  window.V60_RECO = { homeHtml: homeHtml };
  (window.V60_MODULES = window.V60_MODULES || []).push({
    id: "reco",
    tabs: [{ id: "reco", section: "maint", label: "Recommended", order: 45, html:
      '<section><h2>Recommended for your car</h2><p class="lede">Maintenance, repairs, performance and looks, picked by Claude from what your car reports, your drives and problem cases, and Volvo\'s schedule and bulletins. Each one says why, how soon, DIY or shop, and its sources. Prices appear only when a source gives one. Nothing that changes emissions.</p>' +
      '<p class="status" id="rcWhen"></p></section>' +
      '<div class="seg" id="rcFilter" role="group" aria-label="Kind"><button type="button" data-rcf="all">All</button><button type="button" data-rcf="maintenance">Maintenance</button><button type="button" data-rcf="repair">Repair</button><button type="button" data-rcf="performance">Performance</button><button type="button" data-rcf="cosmetic">Cosmetic</button></div>' +
      '<section class="card"><div id="rcList"></div></section><div id="rcHidden"></div>' +
      '<div class="row"><button type="button" class="quiet" id="rcAsk">Ask for new recommendations</button><span class="status" id="rcMsg"></span></div>' }],
    clean: function (v) {
      if (!v || typeof v !== "object" || !v.marks || typeof v.marks !== "object") return null;
      var m = {}; Object.keys(v.marks).slice(0, 200).forEach(function (k) { if (/^[\w.-]{1,60}$/.test(k) && (v.marks[k] === "done" || v.marks[k] === "no")) m[k] = v.marks[k]; });
      return { marks: m };
    },
    render: function (api) { render(api); },
    init: function (api) {
      API = api;
      $("p-reco").addEventListener("click", function (e) {
        var b = e.target.closest && e.target.closest("button"); if (!b) return;
        var f = b.getAttribute("data-rcf"); if (f) { filter = f; render(api); return; }
        var mk = b.getAttribute("data-rcmark"); if (mk) {
          var i = mk.lastIndexOf(":"), id = mk.slice(0, i), what = mk.slice(i + 1), d = api.mod("reco") || { marks: {} };
          d.marks = d.marks || {}; if (what === "undo") delete d.marks[id]; else d.marks[id] = what;
          api.setMod("reco", d); api.save(); render(api); return;
        }
        if (b.id === "rcAsk") ask();
      });
    }
  });
})();
