/* Plan & shop (2026-11-27). Kyle chose "A · parts counter" with C's by-need list as a switch (mock-ups
   https://claude.ai/artifact/MPp5kSV6sckB5tmLhZpS52; plan in docs/ROADMAP.md, "Plan & shop").
   Tab "shop": the five sections of the car, each listing what it needs, could use or could have, in four groups
   (Needed, Recommended, Only if needed, Upgrades; on-track items fold away). "By need" shows the whole car in those groups.
   An item opens in place with four ways to deal with it: check it yourself, do it yourself (only with a sourced
   step-by-step), have a shop do it (what to ask for, a price only from a source), ask Claude (POST https://<pc>/drives/ask;
   if the PC does not take it, the question is shown to copy).
   Tab "plan": what Kyle added, as DIY or shop jobs, with a priced-so-far total, a shop-quote text, and a Log it button.
   Items come from src/js/data/shop.js, which points at data the app already has (core ITEMS and COSTS, Volvo's printed
   schedule rows in home.js, V60_UPGRADES, V60_DIY, the manual's chapters). Saved: mod "shop" {plan: {id: "diy"|"shop"}}. */
(function () {
  var API = null, ui = { mode: "section", sec: null, filter: "all", item: null, ask: {} };
  var GROUPS = [["need", "NEEDED", "due on Volvo's schedule"], ["rec", "RECOMMENDED", "no record yet, or worth doing"], ["opt", "ONLY IF NEEDED", "after a check says so"], ["up", "UPGRADES", "your choice"]];
  var KIND = { need: ["bad", "Needed"], rec: ["watch", "Recommended"], opt: ["none", "If needed"], up: ["info", "Upgrade"], ok: ["ok", "On track"] };
  function esc(s) { return API ? API.esc(s) : String(s); }
  function fmt(n) { return API ? API.fmt(n) : String(n); }
  function data() { return window.V60_SHOP_DATA || { items: [], symptoms: [] }; }
  function man() { return window.V60_MANUAL_DATA || { views: [], items: [] }; }
  function views() { return man().views; }
  function viewName(id) { var v = views().filter(function (x) { return x.id === id; })[0]; return v ? v.n : id; }
  function part(id) { return man().items.filter(function (x) { return x.id === id; })[0] || null; }
  function chapter(cid) {
    var p = String(cid || "").split("."), num = p[0] + "." + p[1], it = man().items.filter(function (x) { return x.num === num; })[0];
    return it ? it.chapters[+p[2] - 1] || null : null;
  }
  function upg(id) { return (window.V60_UPGRADES || []).filter(function (u) { return u.id === id; })[0] || null; }
  function job(id) { return (window.V60_DIY || []).filter(function (j) { return j.id === id; })[0] || null; }
  function cost(k) { return ((API && API.COSTS) || []).filter(function (c) { return c.k === k; })[0] || null; }
  function money(lo, hi) {
    if (lo == null) return "";
    if (lo === 0 && (hi === 0 || hi == null)) return "Free";
    return "$" + fmt(lo) + (hi != null && hi !== lo ? "–" + fmt(hi) : "");
  }
  /* "$10–30 for the filter" → [10, 30]; "$4" → [4, 4] */
  function range(text) { var m = /\$(\d[\d,]*)(?:\s*[–-]\s*\$?(\d[\d,]*))?/.exec(String(text || "")); if (!m) return null; var a = +m[1].replace(/,/g, ""), b = m[2] ? +m[2].replace(/,/g, "") : a; return [a, b]; }
  function first(s) { var m = /^.*?[.!?](\s|$)/.exec(String(s || "")); return m ? m[0].trim() : String(s || ""); }

  function plan() { var d = API && API.mod("shop"); return (d && d.plan) || {}; }
  function setPlan(p) { var d = API.mod("shop") || {}; d.plan = p; API.setMod("shop", d); API.save(); }

  /* ---------- one built item ---------- */
  function build(api) {
    var rows = {};
    if (window.V60_HOME) window.V60_HOME.schedule(api).forEach(function (r) { rows[r.it.key] = r; });
    return data().items.map(function (e) {
      var u = e.up ? upg(e.up) : null; if (e.up && !u) return null;
      var s = e.sched ? rows[e.sched] : null, c = e.cost ? cost(e.cost) : null, j = e.diy ? job(e.diy) : null, tiers = e.tiers || {};
      var k = s ? (s.rank <= 1 ? "need" : s.rank <= 3 ? "rec" : s.rank === 4 ? "ok" : "rec") : (e.k || (u ? "up" : "rec"));
      var it = s ? s.it : (e.sched ? api.ITEMS.filter(function (x) { return x.key === e.sched; })[0] : null);
      var t = e.t || (it && it.name) || (u && u.t) || e.id;
      var why = s ? [s.interval, s.last ? "Last: " + s.last.date + " at " + fmt(s.last.miles) + " mi" : "", s.line].filter(Boolean).join(". ").replace(/\.\./g, ".") : (e.why || (u ? first(u.why) : ""));
      /* prices: shop and DIY, each [lo, hi] when a source gives numbers */
      var shopP = null, diyP = null;
      if (c) { if (!(c.lo === 0 && c.hi === 0)) shopP = [c.lo, c.hi]; if (typeof c.diy === "number") diyP = [c.diy, c.diy]; if (c.lo === 0 && c.hi === 0) diyP = [0, 0]; }
      else if (u && u.lo != null) shopP = [u.lo, u.hi != null ? u.hi : u.lo];
      if (e.shopP) shopP = e.shopP;
      if (e.diyP) diyP = e.diyP;
      if (j && !diyP) diyP = range(j.cost) || (/^Free/.test(j.cost) ? [0, 0] : null);
      var noDiy = tiers.diy && (tiers.diy.mk === "bad" || tiers.diy.mk === "none");
      var canDiy = !noDiy && (!!j || !!diyP || (c && c.diy === "easy"));
      var price = [];
      if (c && c.lo === 0 && c.hi === 0) price.push("Free");
      else {
        if (shopP) price.push(money(shopP[0], u && u.hi == null ? null : shopP[1]).replace(/^\$/, u && u.hi == null ? "From $" : "$") + " shop");
        if (diyP && !noDiy) price.push((diyP[0] === 0 && diyP[1] === 0) ? "Free DIY" : money(diyP[0], diyP[1]) + (j ? " parts" : " DIY"));
        else if (c && c.diy === "easy") price.push("easy DIY");
      }
      if (!price.length) price.push(u ? (u.costNote && u.costNote.length < 50 ? u.costNote.charAt(0).toUpperCase() + u.costNote.slice(1) : "Price not researched") : (e.sched || j ? "Price not researched" : "Free"));
      var who = noDiy ? "Shop job" : j ? "DIY, " + j.min + " min, steps in the app" : (c && c.diy == null && !u && shopP) ? "Shop job" : u ? (u.diff || "") : canDiy ? "DIY or shop" : (e.sched ? "Shop job" : "DIY, free");
      return { e: e, id: e.id, sec: e.sec, k: k, t: t, why: why, s: s, it: it, u: u, c: c, j: j, tiers: tiers,
        price: price.join(" · ") + (e.priceNote ? " (" + e.priceNote + ")" : ""), who: who, shopP: shopP, diyP: noDiy ? null : diyP, canDiy: canDiy, how: j || (canDiy && !shopP) ? "diy" : "shop" };
    }).filter(Boolean);
  }
  function byId(list, id) { return list.filter(function (x) { return x.id === id; })[0] || null; }

  /* ---------- list views ---------- */
  function rowHtml(x, showSec) {
    var inP = !!plan()[x.id], pillK = x.s && (x.k === "need" || x.k === "rec") ? (x.k === "need" ? "bad" : "watch") : null;
    return '<div class="sp-row"><button type="button" class="sp-open" data-sp-item="' + esc(x.id) + '">' +
      (showSec ? '<span class="sp-sec">' + esc(viewName(x.sec)) + "</span>" : "") +
      '<span class="hm-t">' + esc(x.t) + (pillK ? ' <span class="pill ' + pillK + '">' + esc(x.s.label) + "</span>" : "") + "</span>" +
      (x.why ? '<span class="hm-s">' + esc(x.why) + "</span>" : "") +
      '<span class="sp-price mono">' + esc(x.price) + "</span>" + (x.who ? '<span class="hm-s">' + esc(x.who) + "</span>" : "") + "</button>" +
      '<button type="button" class="sp-add" data-sp-add="' + esc(x.id) + '" aria-pressed="' + inP + '" aria-label="' + esc((inP ? "Remove " : "Add ") + x.t + (inP ? " from" : " to") + " your plan") + '">' + (inP ? "Added" : "+ Add") + "</button></div>";
  }
  function groupsHtml(list, showSec) {
    var h = GROUPS.map(function (g) {
      var l = list.filter(function (x) { return x.k === g[0] && (ui.filter === "all" || ui.filter === g[0]); });
      return l.length ? '<section class="hm-sec"><div class="mn-kick"><span>' + g[1] + "</span><span>" + esc(g[2]) + "</span></div>" + l.map(function (x) { return rowHtml(x, showSec); }).join("") + "</section>" : "";
    }).join("");
    var ok = list.filter(function (x) { return x.k === "ok"; });
    if (ok.length && (ui.filter === "all")) h += '<details class="sp-ok"><summary>' + ok.length + " on track</summary>" + ok.map(function (x) { return rowHtml(x, showSec); }).join("") + "</details>";
    return h || '<p class="hm-empty">Nothing in this group here.</p>';
  }
  function count(list, k) { return list.filter(function (x) { return x.k === k; }).length; }
  function planBar(all) {
    var p = plan(), ids = Object.keys(p).filter(function (id) { return byId(all, id); });
    if (!ids.length) return "";
    var t = totals(all);
    return '<button type="button" class="sp-planbar" data-jump="tab:plan"><span class="sp-n mono">' + ids.length + '</span><span class="hm-b"><span class="hm-t">Your plan</span><span class="hm-s">' + esc(t.line) + "</span></span></button>";
  }
  function listHtml(api, all) {
    var h = '<div class="seg sp-mode" role="group" aria-label="Show"><button type="button" data-sp-mode="section" aria-pressed="' + (ui.mode === "section") + '">By section</button><button type="button" data-sp-mode="need" aria-pressed="' + (ui.mode === "need") + '">By need</button></div>';
    h += planBar(all);
    if (ui.mode === "need") {
      h += '<div class="mn-chips sp-chips">' + [["all", "Whole car"]].concat(views().map(function (v) { return [v.id, v.n]; })).map(function (c) { var on = (ui.sec || "all") === c[0]; return '<button type="button" class="mn-chip" data-sp-sec="' + c[0] + '" aria-pressed="' + on + '">' + esc(c[1]) + "</button>"; }).join("") + "</div>";
      return h + groupsHtml(ui.sec ? all.filter(function (x) { return x.sec === ui.sec; }) : all, !ui.sec);
    }
    if (ui.sec) {
      var v = views().filter(function (x) { return x.id === ui.sec; })[0] || {};
      h += '<button type="button" class="mn-link sp-back" data-sp-sec="">← All sections</button><h3 class="sp-h">' + esc((v.num ? v.num + " · " : "") + (v.n || "")) + "</h3>";
      h += '<div class="mn-chips sp-chips">' + [["all", "All"], ["need", "Needed"], ["rec", "Recommended"], ["opt", "If needed"], ["up", "Upgrades"]].map(function (f) { return '<button type="button" class="mn-chip" data-sp-filter="' + f[0] + '" aria-pressed="' + (ui.filter === f[0]) + '">' + f[1] + "</button>"; }).join("") + "</div>";
      if (ui.sec === "bay") h += '<div class="sp-sym"><span class="hm-b"><span class="hm-t">Hearing a belt squeal?</span><span class="hm-s">A few questions narrow it down.</span></span><button type="button" class="quiet" data-jump="tree:belt">Start</button></div>';
      return h + groupsHtml(all.filter(function (x) { return x.sec === ui.sec; }), false);
    }
    var need = count(all, "need"), rec = count(all, "rec");
    h += '<div class="sp-tot">' + [["need", need], ["rec", rec], ["opt", count(all, "opt")], ["up", count(all, "up")]].map(function (t) { return '<div><b class="mono sp-' + t[0] + '">' + t[1] + "</b><span>" + esc(KIND[t[0]][1]) + "</span></div>"; }).join("") + "</div>";
    h += '<section class="hm-sec"><div class="mn-kick"><span>SECTIONS OF THE CAR</span><span>NEEDED · RECOMMENDED</span></div>' + views().map(function (v) {
      var l = all.filter(function (x) { return x.sec === v.id; }), n = count(l, "need"), r = count(l, "rec"), u = count(l, "up");
      return '<button type="button" class="hm-row sp-secrow" data-sp-sec="' + v.id + '"><span class="sp-num mono">' + v.num + '</span><span class="hm-b"><span class="hm-t">' + esc(v.n) + '</span><span class="hm-s">' + l.length + " item" + (l.length === 1 ? "" : "s") + (u ? " · " + u + " upgrade" + (u === 1 ? "" : "s") : "") + "</span></span>" +
        '<span class="sp-counts"><span class="pill ' + (n ? "bad" : "none") + '">' + n + '</span><span class="pill ' + (r ? "watch" : "none") + '">' + r + "</span></span></button>";
    }).join("") + "</section>";
    var reco = window.V60_DRIVES && window.V60_DRIVES.data && window.V60_DRIVES.data(), rn = reco && reco.recommendations && reco.recommendations.items ? reco.recommendations.items.length : 0;
    if (rn) h += '<p class="status">Claude has ' + rn + ' pick' + (rn === 1 ? "" : "s") + ' for your car this week. <button type="button" class="mn-link" data-jump="tab:reco">See them</button></p>';
    h += '<section class="hm-sec"><div class="mn-kick"><span>SOMETHING WRONG RIGHT NOW?</span></div><div class="mn-chips">' + data().symptoms.map(function (y) { return '<button type="button" class="mn-chip" data-jump="' + esc(y[1]) + '">' + esc(y[0]) + "</button>"; }).join("") + "</div></section>";
    h += '<p class="status">Prices appear only where a source gives one, and are estimates. Also: <button type="button" class="mn-link" data-jump="tab:upgrades">Upgrades, with is-it-worth-it questions</button> · <button type="button" class="mn-link" data-jump="tab:diy">How-to jobs</button>.</p>';
    return h;
  }

  /* ---------- item view ---------- */
  /* src: [title, url] or a list of them; steps: numbered steps after the body; note: a caveat in small print */
  function srcHtml(src) {
    if (!src || !src.length) return "";
    var l = typeof src[0] === "string" ? [src] : src, out = [];
    /* several pages of one document become one link: "owner's manual, pages 312, 313" */
    l.forEach(function (x) {
      var m = /^(.*), page (\d+)$/.exec(x[0]), prev = out[out.length - 1];
      if (m && prev && prev.url === x[1] && prev.base === m[1]) prev.pages.push(m[2]);
      else out.push({ url: x[1], base: m ? m[1] : x[0], pages: m ? [m[2]] : null });
    });
    return '<p class="status">Source' + (out.length > 1 ? "s" : "") + ": " + out.map(function (o) { return '<a href="' + esc(o.url) + '" target="_blank" rel="noopener">' + esc(o.base + (o.pages ? (o.pages.length > 1 ? ", pages " : ", page ") + o.pages.join(", ") : "")) + "</a>"; }).join(" · ") + "</p>";
  }
  function tierHtml(n, title, meta, mk, body, src, go, extra, steps, note) {
    return '<section class="sp-tier"><div class="sp-th"><span class="sp-tn mono">' + n + '</span><span class="hm-t">' + esc(title) + "</span>" + (meta ? '<span class="pill ' + (mk || "none") + '">' + esc(meta) + "</span>" : "") + "</div>" +
      '<div class="sp-tb">' + (body ? "<p>" + esc(body) + "</p>" : "") + (steps && steps.length ? '<ol class="sp-steps">' + steps.map(function (st) { return "<li>" + esc(st) + "</li>"; }).join("") + "</ol>" : "") +
      (note ? '<p class="status sp-note">' + esc(note) + "</p>" : "") + srcHtml(src) +
      (go ? '<button type="button" class="quiet sp-go" data-jump="' + esc(go[1]) + '">' + esc(go[0]) + "</button>" : "") + (extra || "") + "</div></section>";
  }
  function question(api, x) {
    var oe = api.odoEst ? api.odoEst() : { miles: api.state.odo }, mi = oe && oe.miles != null ? "about " + fmt(oe.miles) + " mi" : "mileage not entered";
    return "My 2016 Volvo V60 T5 Drive-E (2.0 L turbo, B4204T11), " + mi + ": " + x.t + ". " + (x.why ? x.why + " " : "") + "What should I know before I do this myself or take it to a shop? Please give sources.";
  }
  function itemHtml(api, x) {
    var e = x.e, T = x.tiers, h = "", vr = x.it && window.V60_HOME ? window.V60_HOME.vrow(x.it.key) : null, p = part(e.part), inP = plan()[x.id];
    h += '<button type="button" class="mn-link sp-back" data-sp-back="1">← ' + esc(ui.mode === "need" ? "By need" : viewName(x.sec)) + "</button>";
    h += '<div class="mn-kick"><span>' + esc(viewName(x.sec) + (p ? " · " + p.num + " " + p.n : "")) + "</span></div>";
    h += '<h3 class="sp-h">' + esc(x.t) + "</h3>";
    h += '<p><span class="pill ' + KIND[x.k][0] + '">' + esc(x.s ? x.s.label : KIND[x.k][1]) + "</span> " + esc(x.price) + "</p>";
    if (x.why) h += "<p>" + esc(x.why) + "</p>";
    if (vr) h += '<p class="status">Volvo\'s schedule: ' + esc(vr.quote) + ' <button type="button" class="mn-link" data-jump="tab:vsched">See the rows</button></p>';
    if (x.u) h += "<p>" + esc(x.u.what) + "</p><p>" + esc(x.u.why) + "</p>";
    /* 1 check */
    var ch = e.check ? chapter(e.check) : null;
    var c1 = T.check ? tierHtml(1, "Check it yourself", T.check.meta, T.check.mk || "ok", T.check.body, T.check.src, T.check.go || (ch ? ["Open the check in " + (p ? p.num : "the manual"), "ch:" + e.check] : null), null, T.check.steps, T.check.note)
      : ch ? tierHtml(1, "Check it yourself", "Free", "ok", ch.d, null, ["Open the check in " + (p ? p.num : "the manual"), "ch:" + e.check])
      : x.u ? tierHtml(1, "Check it yourself", "2 min", "ok", "Four quick questions on the Upgrades page say whether it is worth it for you.", null, ["Is it worth it?", "tab:upgrades"])
      : tierHtml(1, "Check it yourself", "", "none", x.it ? "Look through your receipts and the papers from the lot. If it was done, log it and the schedule updates." : "Nothing to check first.", null, x.it ? ["Log a past service", "tab:records"] : null);
    /* 2 do it yourself */
    var c2;
    if (T.diy) c2 = tierHtml(2, "Do it yourself", T.diy.meta, T.diy.mk || "ok", T.diy.body, T.diy.src, T.diy.go || (x.j ? ["Open the step-by-step", "diy:" + x.j.id] : null), null, T.diy.steps, T.diy.note);
    else if (x.j) c2 = tierHtml(2, "Do it yourself", x.j.min + " min", "ok", x.j.t + ". " + x.j.cost + "." + (x.j.pgLabel ? " " + x.j.pgLabel + "." : ""), null, ["Open the step-by-step", "diy:" + x.j.id]);
    else if (x.c && typeof x.c.diy === "number") c2 = tierHtml(2, "Do it yourself", "Not sourced", "none", "Parts are about $" + fmt(x.c.diy) + " (the Garage's DIY figure). No step-by-step in the app yet.", null, null);
    else if (x.c && x.c.diy === "easy") c2 = tierHtml(2, "Do it yourself", "Easy", "ok", x.c.note + " No step-by-step in the app yet.", null, null);
    else c2 = tierHtml(2, "Do it yourself", "Not sourced", "none", x.u && x.u.diff ? x.u.diff + ". No step-by-step in the app." : "No step-by-step in the app yet.", null, null);
    /* 3 shop */
    var ask = T.shop && T.shop.ask ? T.shop.ask : vr ? "“" + vr.row + "”" : x.t;
    var shopBody = "Ask for: " + ask + ". " + (x.c ? (x.shopP ? money(x.shopP[0], x.shopP[1]) + ". " : "") + x.c.note : x.u ? (x.u.costNote ? x.u.costNote.charAt(0).toUpperCase() + x.u.costNote.slice(1) + "." : "Price not researched.") : "Price not researched; get two quotes.");
    var add = '<button type="button" class="sp-go" data-sp-addas="' + esc(x.id) + ':shop">' + (inP === "shop" ? "In your plan as a shop job" : "Add as a shop job") + "</button>" +
      (x.canDiy ? '<button type="button" class="quiet sp-go" data-sp-addas="' + esc(x.id) + ':diy">' + (inP === "diy" ? "In your plan as DIY" : "Add as DIY") + "</button>" : "");
    var shopMeta = x.shopP ? money(x.shopP[0], x.u && x.u.hi == null ? null : x.shopP[1]) + (x.u && x.u.hi == null ? "+" : "") : "Get a quote";
    var c3 = T.shop ? tierHtml(3, "Have a shop do it", T.shop.meta || shopMeta, T.shop.mk || "watch", "Ask for: " + ask + ". " + (T.shop.body || ""), T.shop.src, T.shop.go, '<div class="row">' + add + "</div>", T.shop.steps, T.shop.note)
      : tierHtml(3, "Have a shop do it", shopMeta, "watch", shopBody, x.u && x.u.src && x.u.src[0] ? x.u.src[0] : null, null, '<div class="row">' + add + "</div>");
    /* 4 ask Claude */
    var q = ui.ask[x.id] != null ? ui.ask[x.id] : question(api, x);
    var hasPc = !!(window.V60_DRIVES && window.V60_DRIVES.host && window.V60_DRIVES.host());
    var c4 = tierHtml(4, "Ask Claude", hasPc ? "Claude live" : "Copy", "info", hasPc ? "Sends this to Claude on your PC. The answer comes back as a notification, with sources." : "Claude live isn't set up on this device, so copy the question and ask it in Claude.", null, null,
      '<label class="sp-ql" for="spQ">Your question</label><textarea id="spQ" class="sp-q" rows="5">' + esc(q) + '</textarea><div class="row">' + (hasPc ? '<button type="button" data-sp-ask="' + esc(x.id) + '">Send to Claude</button>' : "") + '<button type="button" class="quiet" data-sp-copy="spQ">Copy</button></div><p class="status" id="spAskMsg" role="status"></p>');
    h += '<div class="mn-kick sp-four"><span>FOUR WAYS TO DEAL WITH IT</span></div>' + c1 + c2 + c3 + c4;
    var srcs = [];
    if (x.u && x.u.src) srcs = srcs.concat(x.u.src);
    if (srcs.length) h += '<p class="status">Sources: ' + srcs.map(function (s) { return '<a href="' + esc(s[1]) + '" target="_blank" rel="noopener">' + esc(s[0]) + "</a>"; }).join(" · ") + "</p>";
    if (p) h += '<p class="status">More on this part: <button type="button" class="mn-link" data-jump="ch:' + esc(p.num) + '.1">' + esc(p.num + " " + p.n) + "</button>" + (e.tree ? ' · <button type="button" class="mn-link" data-jump="tree:' + esc(e.tree) + '">Noise troubleshooter</button>' : "") + "</p>";
    return h;
  }

  function render(api) {
    API = api; var el = api.$("spBody"); if (!el) return;
    var all = build(api), x = ui.item ? byId(all, ui.item) : null;
    el.innerHTML = x ? itemHtml(api, x) : listHtml(api, all);
  }

  /* ---------- plan ---------- */
  function totals(all) {
    var p = plan(), lo = 0, hi = 0, priced = 0, n = 0;
    Object.keys(p).forEach(function (id) { var x = byId(all, id); if (!x) return; n++; var r = p[id] === "diy" ? (x.diyP || (x.c && x.c.diy === "easy" ? null : null)) : x.shopP; if (r) { lo += r[0]; hi += r[1]; priced++; } });
    var line = (priced ? money(lo, hi) + " priced" : "Nothing priced yet") + (n - priced ? " · " + (n - priced) + " to quote" : "");
    return { lo: lo, hi: hi, priced: priced, n: n, line: line };
  }
  function quoteText(api, all) {
    var p = plan(), shop = Object.keys(p).filter(function (id) { return p[id] === "shop" && byId(all, id); }).map(function (id) { return byId(all, id); });
    var oe = api.odoEst ? api.odoEst() : null;
    return "2016 Volvo V60 T5 Drive-E, 2.0 L turbo (B4204T11)" + (oe && oe.miles != null ? ", about " + fmt(oe.miles) + " mi" : "") + ".\nPlease quote, parts and labor separately:\n" +
      shop.map(function (x, i) { var vr = x.it && window.V60_HOME ? window.V60_HOME.vrow(x.it.key) : null; return (i + 1) + ". " + (vr ? vr.row : x.t); }).join("\n") + "\nNo service history on record.";
  }
  function renderPlan(api) {
    API = api; var el = api.$("plBody"); if (!el) return;
    var all = build(api), p = plan(), ids = Object.keys(p).filter(function (id) { return byId(all, id); });
    if (!ids.length) { el.innerHTML = '<p class="hm-empty">Nothing in your plan yet. Add items from Plan &amp; shop.</p><div class="row"><button type="button" data-jump="tab:shop">Plan &amp; shop</button></div>'; return; }
    var t = totals(all), h = "";
    h += '<div class="sp-tot sp-tot2"><div><b class="mono">' + esc(t.priced ? money(t.lo, t.hi) : "—") + "</b><span>Priced so far, " + t.priced + " of " + t.n + "</span></div><div><b class=\"mono\">" + (t.n - t.priced) + "</b><span>To quote</span></div></div>";
    [["shop", "SHOP VISIT"], ["diy", "DO IT YOURSELF"]].forEach(function (g) {
      var l = ids.filter(function (id) { return p[id] === g[0]; }).map(function (id) { return byId(all, id); });
      if (!l.length) return;
      h += '<section class="hm-sec"><div class="mn-kick"><span>' + g[1] + "</span><span>" + l.length + " job" + (l.length === 1 ? "" : "s") + "</span></div>" + l.map(function (x) {
        var r = g[0] === "diy" ? x.diyP : x.shopP;
        return '<div class="sp-prow"><button type="button" class="sp-open" data-sp-item="' + esc(x.id) + '"><span class="hm-t">' + esc(x.t) + '</span><span class="sp-price mono">' + esc(r ? money(r[0], r[1]) + (g[0] === "shop" && x.e.priceNote ? " (" + x.e.priceNote + ")" : "") : "Not priced") + '</span><span class="hm-s">' + esc(viewName(x.sec)) + "</span></button>" +
          '<div class="row sp-pact">' + (x.canDiy ? '<div class="seg" role="group" aria-label="How"><button type="button" data-sp-addas="' + x.id + ':diy" aria-pressed="' + (p[x.id] === "diy") + '">DIY</button><button type="button" data-sp-addas="' + x.id + ':shop" aria-pressed="' + (p[x.id] === "shop") + '">Shop</button></div>' : "") +
          (x.it ? '<button type="button" class="quiet" data-sp-log="' + esc(x.it.key) + '">Log it done</button>' : "") + '<button type="button" class="quiet" data-sp-add="' + esc(x.id) + '" aria-label="Remove ' + esc(x.t) + ' from your plan">Remove</button></div></div>';
      }).join("") + "</section>";
    });
    var shopN = ids.filter(function (id) { return p[id] === "shop"; }).length;
    if (shopN) h += '<section class="hm-sec"><div class="mn-kick"><span>FOR A SHOP QUOTE</span></div><textarea id="plQuote" class="sp-q" rows="7" readonly>' + esc(quoteText(api, all)) + '</textarea><div class="row"><button type="button" data-sp-copy="plQuote">Copy</button><button type="button" class="quiet" data-sp-share="1">Share as text</button></div></section>';
    var hasPc = !!(window.V60_DRIVES && window.V60_DRIVES.host && window.V60_DRIVES.host());
    h += '<section class="hm-sec"><div class="mn-kick"><span>ASK CLAUDE</span></div><p class="status">' + (hasPc ? "Claude on your PC looks over the whole plan: what to do together, what to do first, what the prices leave out." : "Claude live isn't set up on this device; copy the shop-quote text and ask in Claude instead.") + "</p>" +
      (hasPc ? '<div class="row"><button type="button" data-sp-askplan="1">Ask Claude to check this plan</button></div>' : "") + '<p class="status" id="plAskMsg" role="status"></p></section>';
    h += '<p class="status">Prices are low and high estimates from the sources on each item, not quotes. Log it done puts the job on your service log, so Maintain stops showing it as due.</p>';
    el.innerHTML = h;
  }

  /* ---------- sending to Claude on the PC ---------- */
  function post(body) {
    var h = window.V60_DRIVES && window.V60_DRIVES.host && window.V60_DRIVES.host();
    if (!h) return Promise.reject(new Error("no PC address"));
    return fetch("https://" + h + "/drives/ask", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
      .then(function (r) { if (!r.ok) { var e = new Error("HTTP " + r.status); e.status = r.status; throw e; } return r.json(); });
  }
  /* the PC allows 12 questions an hour (429 after that) */
  function failText(e, what) { return e && e.status === 429 ? "Your PC has had its limit of questions for this hour. Try again later, or copy " + what + " and ask in Claude." : "Your PC didn't take it (it may be off). Copy " + what + " and ask in Claude."; }
  function copy(id, msgId) {
    var el = document.getElementById(id); if (!el) return;
    el.focus(); el.select(); try { el.setSelectionRange(0, el.value.length); } catch (e) {}
    var done = false; try { done = document.execCommand("copy"); } catch (e) {}
    if (!done && navigator.clipboard) navigator.clipboard.writeText(el.value).then(function () {}, function () {});
    var m = document.getElementById(msgId); if (m) m.textContent = "Copied.";
  }

  (window.V60_MODULES = window.V60_MODULES || []).push({
    id: "shop",
    tabs: [{ id: "shop", section: "maint", label: "Plan & shop", order: 3, hidden: true, html: '<section><h2>Plan &amp; shop</h2><p class="lede">Everything the car needs, could use or could have, by part of the car, and how to check it, do it, or have it done.</p><div id="spBody"></div></section>' },
      { id: "plan", section: "maint", label: "Your plan", order: 4, hidden: true, html: '<section><h2>Your plan</h2><p class="lede">What you picked in Plan &amp; shop, as jobs for yourself and for a shop.</p><div id="plBody"></div></section>' }],
    init: function (api) {
      API = api;
      document.addEventListener("input", function (e) { if (e.target && e.target.id === "spQ" && ui.item) ui.ask[ui.item] = e.target.value; });
      document.addEventListener("click", function (e) {
        var b = e.target.closest && e.target.closest("[data-sp-item],[data-sp-add],[data-sp-addas],[data-sp-sec],[data-sp-filter],[data-sp-mode],[data-sp-back],[data-sp-ask],[data-sp-askplan],[data-sp-copy],[data-sp-share],[data-sp-log]");
        if (!b) return;
        var a = function (n) { return b.getAttribute(n); }, top = false;
        if (b.hasAttribute("data-sp-item")) { ui.item = a("data-sp-item"); top = true; api.go("shop"); }
        else if (b.hasAttribute("data-sp-add")) { var p = plan(), id = a("data-sp-add"); if (p[id]) delete p[id]; else { var x = byId(build(api), id); p[id] = x ? x.how : "shop"; } setPlan(p); }
        else if (b.hasAttribute("data-sp-addas")) { var q = a("data-sp-addas").split(":"), pl = plan(); pl[q[0]] = q[1]; setPlan(pl); }
        else if (b.hasAttribute("data-sp-sec")) { ui.sec = a("data-sp-sec") === "all" ? null : (a("data-sp-sec") || null); ui.filter = "all"; ui.item = null; top = true; }
        else if (b.hasAttribute("data-sp-filter")) ui.filter = a("data-sp-filter");
        else if (b.hasAttribute("data-sp-mode")) { ui.mode = a("data-sp-mode"); ui.sec = null; ui.filter = "all"; ui.item = null; }
        else if (b.hasAttribute("data-sp-back")) { ui.item = null; top = true; }
        else if (b.hasAttribute("data-sp-copy")) { copy(a("data-sp-copy"), a("data-sp-copy") === "spQ" ? "spAskMsg" : "plAskMsg"); return; }
        else if (b.hasAttribute("data-sp-share")) { var qt = document.getElementById("plQuote"); if (qt && window.V60_FILE) window.V60_FILE.save("v60-shop-quote.txt", qt.value, "text/plain"); return; }
        else if (b.hasAttribute("data-sp-log")) { api.go("maint"); var lg = document.getElementById("log"); if (lg && lg.scrollIntoView) lg.scrollIntoView({ block: "start" }); var sel = document.getElementById("logItem"); if (sel) sel.value = a("data-sp-log"); var mi = document.getElementById("logMiles"); if (mi && mi.focus) mi.focus(); return; }
        else if (b.hasAttribute("data-sp-ask")) {
          var all = build(api), xi = byId(all, a("data-sp-ask")), qa = document.getElementById("spQ"), msg = document.getElementById("spAskMsg");
          if (!xi || !qa) return;
          b.disabled = true; if (msg) msg.textContent = "Sending…";
          post({ kind: "item", item: xi.t, section: viewName(xi.sec), question: qa.value.slice(0, 2000), facts: [xi.why, xi.price].filter(Boolean).join(" · ").slice(0, 600) })
            .then(function () { if (msg) msg.textContent = "Sent. Claude answers in a notification in a minute or two."; })
            .catch(function (e) { if (msg) msg.textContent = failText(e, "the question"); })
            .then(function () { b.disabled = false; });
          return;
        }
        else if (b.hasAttribute("data-sp-askplan")) {
          var al = build(api), pp = plan(), m2 = document.getElementById("plAskMsg");
          var items = Object.keys(pp).filter(function (id) { return byId(al, id); }).map(function (id) { var x = byId(al, id), r = pp[id] === "diy" ? x.diyP : x.shopP; return { t: x.t, how: pp[id], price: r ? money(r[0], r[1]) : "not priced" }; });
          b.disabled = true; if (m2) m2.textContent = "Sending…";
          post({ kind: "plan", items: items, question: "Look over this plan for my 2016 V60 T5: what should be done together, what first, and what the prices leave out. Please give sources." })
            .then(function () { if (m2) m2.textContent = "Sent. Claude answers in a notification in a minute or two."; })
            .catch(function (e) { if (m2) m2.textContent = failText(e, "the shop-quote text"); })
            .then(function () { b.disabled = false; });
          return;
        }
        render(api); if (api.$("plBody") && !api.$("p-plan").hidden) renderPlan(api);
        if (top) window.scrollTo(0, 0);
      });
    },
    render: function (api, tab) { API = api; if (tab === "shop") render(api); else if (tab === "plan") renderPlan(api); },
    jump: function (api, kind, id) {
      if (kind === "shop") { ui.item = id || null; api.go("shop"); window.scrollTo(0, 0); return true; }
      return false;
    },
    clean: function (v) {
      if (!v || typeof v !== "object") return null;
      var p = {};
      if (v.plan && typeof v.plan === "object") Object.keys(v.plan).slice(0, 100).forEach(function (k) { if (/^[a-z0-9-]{1,30}$/.test(k) && (v.plan[k] === "diy" || v.plan[k] === "shop")) p[k] = v.plan[k]; });
      return { plan: p };
    }
  });
})();
