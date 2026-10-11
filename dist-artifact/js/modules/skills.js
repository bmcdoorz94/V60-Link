/* Skill tree: four branches of real-world skill, each node earned by evidence already logged elsewhere in the app.
   Some nodes grant perks (features that open when the skill is earned): Timeline view, Mechanic detail level, Drive mode.
   Revealed by the story at the end of Act 1. */
(function () {
  var API = null, sel = null;
  function mod(id, def) { return (API && API.mod(id)) || def; }
  function M(id) { var x = API.acad().done[id]; return !!(x && x.outcome !== "skip"); }
  function diy(id) { var d = mod("diy", { done: {} }).done || {}; return id ? !!d[id] : Object.keys(d).length; }
  function story() { return mod("story", {}); }
  function n(x) { return x || 0; }
  var B = [["hands", "Hands-on"], ["diag", "Diagnostics"], ["know", "Knowledge"], ["own", "Ownership"]];
  var NODES = [
    { id: "h1", b: "hands", tier: 1, t: "Under the hood", req: "Open the hood and find the landmarks (Academy).", ok: function () { return M("m-hood") && M("m-five"); }, prog: function () { return (M("m-hood") ? 1 : 0) + (M("m-five") ? 1 : 0) + " of 2"; } },
    { id: "h2", b: "hands", tier: 2, t: "Fluids", req: "Do the fluid check: the Academy mission and the DIY job.", ok: function () { return M("m-fluidlook") && diy("j-fluids"); } },
    { id: "h3", b: "hands", tier: 3, t: "Tires", req: "Record pressures and finish the calibration job.", ok: function () { return M("m-psi") && diy("j-tires"); } },
    { id: "h4", b: "hands", tier: 4, t: "Wrench", req: "Finish 3 DIY jobs.", ok: function () { return diy() >= 3; }, prog: function () { return Math.min(3, diy()) + " of 3"; } },
    { id: "d1", b: "diag", tier: 1, t: "Listener", req: "Run a health check with Live link (the simulated car counts).", ok: function () { return (mod("live", { scans: [] }).scans || []).length > 0 || !!API.state.lastScan; } },
    { id: "d2", b: "diag", tier: 2, t: "Decoder", req: "Decode 10 entries in the Codebook.", ok: function () { return window.V60_CB && window.V60_CB.count() >= 10; }, prog: function () { return Math.min(10, window.V60_CB ? window.V60_CB.count() : 0) + " of 10"; } },
    { id: "d3", b: "diag", tier: 3, t: "Data reader", req: "Save 3 real drives in the Data lab.", ok: function () { return API.state.runs.length >= 3; }, prog: function () { return Math.min(3, API.state.runs.length) + " of 3"; }, perk: ["drive", "Drive mode in Live link: oversized gauges for a phone mount"] },
    { id: "d4", b: "diag", tier: 4, t: "Diagnostician", req: "Solve 5 simulator mystery cars, or get 3 shop jobs right.", ok: function () { var A = API.acad(), jobs = Object.keys(A.jobs || {}).filter(function (k) { return A.jobs[k] && A.jobs[k].correct; }).length; return n((A.sim || {}).correct) >= 5 || jobs >= 3; } },
    { id: "k1", b: "know", tier: 1, t: "Reader", req: "Read 5 Library articles.", ok: function () { return Object.keys(story().read || {}).length >= 5; }, prog: function () { return Math.min(5, Object.keys(story().read || {}).length) + " of 5"; } },
    { id: "k2", b: "know", tier: 2, t: "Scholar", req: "Master 25 flashcards.", ok: function () { return mastered() >= 25; }, prog: function () { return Math.min(25, mastered()) + " of 25"; }, perk: ["mech", "Mechanic detail level: part numbers, specs and bulletin details in every case"] },
    { id: "k3", b: "know", tier: 3, t: "Certified", req: "Pass the V60 Master exam.", ok: function () { return !!mod("exam", {}).passed; } },
    { id: "o1", b: "own", tier: 1, t: "Record keeper", req: "Log 3 services or receipts.", ok: function () { return API.state.log.length + (mod("glove", {}).receipts || []).length >= 3; }, prog: function () { return Math.min(3, API.state.log.length + (mod("glove", {}).receipts || []).length) + " of 3"; }, perk: ["timeline", "Timeline view: the car's whole life on one scroll"] },
    { id: "o2", b: "own", tier: 2, t: "Paper trail", req: "Settle every recall and enter the build month.", ok: function () { var rs = API.state.recalls || {}; return API.RECALLS.every(function (r) { return rs[r.id] && rs[r.id] !== "unknown"; }) && !!mod("tsb", {}).build; } },
    { id: "o3", b: "own", tier: 3, t: "Budgeter", req: "Log 5 fill-ups in Fuel & costs.", ok: function () { return (mod("fuel", { fills: [] }).fills || []).length >= 5; }, prog: function () { return Math.min(5, (mod("fuel", { fills: [] }).fills || []).length) + " of 5"; } },
    { id: "cap", b: "cap", tier: 9, t: "Master tech", req: "Earn Tires, Data reader, Certified and Budgeter.", ok: function () { return ["h3", "d3", "k3", "o3"].every(earned); } }
  ];
  function mastered() { var b = mod("cards", { b: {} }).b || {}; return Object.keys(b).filter(function (k) { return b[k][0] >= 4; }).length; }
  function node(id) { return NODES.filter(function (x) { return x.id === id; })[0]; }
  function earned(id) { var x = node(id); try { return !!x.ok(); } catch (e) { return false; } }
  function prereq(x) { if (x.id === "cap") return null; return NODES.filter(function (y) { return y.b === x.b && y.tier === x.tier - 1; })[0] || null; }
  function state(x) { if (earned(x.id)) return "earned"; var p = prereq(x); if (x.id === "cap") return "locked"; return !p || earned(p.id) ? "open" : "locked"; }
  window.V60_PERK = function (name) {
    if (!API) return true; var s = story(); if (s.all || (s.closed && s.closed.fin)) return true;
    return NODES.some(function (x) { return x.perk && x.perk[0] === name && earned(x.id); });
  };
  var LBL = { earned: "Earned", open: "Next", locked: "Locked" };
  function render(api) {
    var esc = api.esc, counts = NODES.filter(function (x) { return earned(x.id); }).length;
    api.$("skSum").textContent = counts + " of " + NODES.length + " skills earned";
    api.$("skTree").innerHTML = B.map(function (b) {
      var list = NODES.filter(function (x) { return x.b === b[0]; });
      return '<div class="skcol"><p class="skb">' + esc(b[1]) + "</p>" + list.map(function (x, i) {
        var s = state(x);
        return (i ? '<i class="skline ' + (s === "locked" ? "" : "lit") + '" aria-hidden="true"></i>' : "") + '<button type="button" class="sknode ' + s + (sel === x.id ? " sel" : "") + (x.perk ? " perk" : "") + '" data-sk="' + x.id + '" aria-pressed="' + (sel === x.id) + '"><span class="skdot" aria-hidden="true">' + (s === "earned" ? "✓" : (s === "locked" ? "·" : x.tier)) + '</span><span class="skt">' + esc(x.t) + "</span></button>";
      }).join("") + "</div>";
    }).join("") + (function () { var c = node("cap"), s = state(c); return '<div class="skcap"><button type="button" class="sknode cap ' + s + (sel === "cap" ? " sel" : "") + '" data-sk="cap" aria-pressed="' + (sel === "cap") + '"><span class="skdot" aria-hidden="true">' + (s === "earned" ? "✓" : "★") + '</span><span class="skt">Master tech</span></button></div>'; })();
    var x = node(sel || (NODES.filter(function (y) { return state(y) === "open"; })[0] || NODES[0]).id), st = state(x);
    api.$("skDetail").innerHTML = '<p class="ans-k">' + esc(LBL[st]) + (x.b !== "cap" ? " · " + esc(B.filter(function (b) { return b[0] === x.b; })[0][1]) + " tier " + x.tier : "") + "</p><h3>" + esc(x.t) + "</h3><p>" + esc(x.req) + "</p>" + (x.prog && st !== "earned" ? '<p class="status">' + esc(x.prog()) + "</p>" : "") + (x.perk ? '<p class="perkline"><b>Perk:</b> ' + esc(x.perk[1]) + (st === "earned" ? " (unlocked)" : "") + "</p>" : "") + (st === "locked" ? '<p class="status">Earn ' + esc((prereq(x) || { t: "the four tier-3 skills" }).t) + " first.</p>" : "");
  }
  (window.V60_MODULES = window.V60_MODULES || []).push({
    id: "skills",
    tabs: [{ id: "skills", section: "learn", label: "Skills", order: 12, html: '<section><h2>Skill tree</h2><p class="lede">Real skills, earned by doing things on the car. Each branch builds on the one before it, and some skills unlock perks in the app.</p><p class="status" id="skSum"></p></section><div class="sktree" id="skTree"></div><section class="card skdetail" id="skDetail" aria-live="polite"></section>' }],
    clean: function (v) { return v && Array.isArray(v.seen) ? { seen: v.seen.filter(function (x) { return typeof x === "string"; }).slice(0, 20) } : null; },
    init: function (api) { API = api;
      document.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("[data-perkseen]"); if (!b) return; var d = api.mod("skills") || { seen: [] }; d.seen = (d.seen || []).concat([b.getAttribute("data-perkseen")]); api.setMod("skills", d); api.save(); });
      api.$("p-skills").addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("[data-sk]"); if (!b) return; sel = b.getAttribute("data-sk"); render(api); }); },
    render: function (api) { render(api); },
    xp: function (api) { API = API || api; return NODES.filter(function (x) { return earned(x.id); }).length * 25 + (earned("cap") ? 75 : 0); },
    today: function (api) {
      var fresh = NODES.filter(function (x) { return x.perk && earned(x.id); }).map(function (x) { return x.perk[0]; }), seen = (api.mod("skills") || { seen: [] }).seen || [];
      var nw = fresh.filter(function (p) { return seen.indexOf(p) < 0; });
      if (!nw.length) return [];
      var x = NODES.filter(function (y) { return y.perk && y.perk[0] === nw[0]; })[0];
      return [{ order: 6, html: '<article class="tcard"><p class="ans-k">Perk unlocked</p><h3>' + api.esc(x.t) + '</h3><p class="status">' + api.esc(x.perk[1]) + '</p><button type="button" class="quiet" data-jump="tab:skills" data-perkseen="' + x.perk[0] + '">See the skill tree</button></article>' }];
    }
  });
})();
