/* Library: offline knowledge base + Ask. Answers come from V60_FACTS and V60_ARTICLES without any AI call.
   Inside Claude, a question can be escalated to Claude with the matching facts as grounding. */
(function () {
  var STOP = "a an the is are was were be to of in on for and or my your it its do does did how what when where which who why can i me you with at by from this that there than then about much many should would could will".split(" ");
  var SYN = { gas: "fuel", petrol: "fuel", octane: "fuel octane", mpg: "mpg economy", mileage: "mpg miles", psi: "pressure tire", tyre: "tire", tires: "tire", wheel: "wheel tire", lug: "lug bolt torque", torque: "torque", hp: "horsepower power", horsepower: "horsepower power hp", quart: "quarts capacity", quarts: "quarts capacity", liters: "capacity", litres: "capacity", much: "capacity", antifreeze: "coolant", tpms: "tpms tire monitor", cel: "check engine", mil: "check engine mil", cambelt: "timing belt", belt: "belt timing", battery: "battery", jump: "jump start", recall: "recall", recalls: "recall", bulb: "bulb", headlight: "headlight bulb", wiper: "wiper", wipers: "wiper", brake: "brake", brakes: "brake", oil: "oil", trans: "transmission", gearbox: "transmission", made: "built plant", built: "built plant", weigh: "weight", heavy: "weight", tow: "towing tow", spark: "spark plugs", plugs: "spark plugs", filter: "filter", ac: "ac refrigerant", aircon: "ac refrigerant", freon: "ac refrigerant", inspection: "inspection emissions", emissions: "emissions inspection", fuse: "fuse", flat: "flat spare repair", spare: "spare flat" };
  function norm(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " "); }
  function toks(s) { var out = []; norm(s).split(/[\s-]+/).forEach(function (w) { if (!w || STOP.indexOf(w) >= 0) return; out.push(w); if (SYN[w]) SYN[w].split(" ").forEach(function (x) { if (out.indexOf(x) < 0) out.push(x); }); if (w.length > 4 && w.slice(-1) === "s") out.push(w.slice(0, -1)); }); return out; }
  function has(hay, w) { return (" " + hay + " ").indexOf(" " + w) >= 0; }
  function scoreFact(f, qt) { var k = norm(f.k + " " + f.tag), q = norm(f.q), a = norm(f.a), s = 0, hit = 0; qt.forEach(function (w) { var h = 0; if (has(k, w)) h = 3; else if (has(q, w)) h = 1.6; else if (has(a, w)) h = 0.6; if (h) hit++; s += h; }); return s * (0.5 + hit / Math.max(qt.length, 1)); }
  function scoreArt(a, qt) { var t = norm(a.t), g = norm(a.tags), b = norm(a.body.join(" ")), s = 0; qt.forEach(function (w) { if (has(t, w)) s += 2.4; if (has(g, w)) s += 2; var m = b.split(" " + w).length - 1; s += Math.min(m, 4) * 0.3; }); return s; }
  function search(q) {
    var qt = toks(q);
    var facts = window.V60_FACTS.map(function (f) { return { f: f, s: scoreFact(f, qt) }; }).filter(function (x) { return x.s > 0.9; }).sort(function (a, b) { return b.s - a.s; });
    var arts = window.V60_ARTICLES.map(function (a) { return { a: a, s: scoreArt(a, qt) }; }).filter(function (x) { return x.s > 1; }).sort(function (a, b) { return b.s - a.s; });
    return { facts: facts, arts: arts, qt: qt };
  }
  function srcLinks(api, keys) {
    var S = window.V60_SOURCES;
    return (keys || []).map(function (k) { var s = typeof k === "string" ? S[k] : k; if (!s) return ""; return '<li><a href="' + api.esc(s[1]) + '" target="_blank" rel="noopener">' + api.esc(s[0]) + "</a></li>"; }).join("");
  }
  function bodyHTML(api, lines) {
    var out = [], inList = false;
    lines.forEach(function (l) {
      if (l.indexOf("- ") === 0) { if (!inList) { out.push('<ul class="plain">'); inList = true; } out.push("<li>" + api.esc(l.slice(2)) + "</li>"); return; }
      if (inList) { out.push("</ul>"); inList = false; }
      if (l.indexOf("## ") === 0) out.push("<h3>" + api.esc(l.slice(3)) + "</h3>"); else out.push("<p>" + api.esc(l) + "</p>");
    });
    if (inList) out.push("</ul>");
    return out.join("");
  }
  var kb = { view: "home", q: "", art: null, ctl: null };
  /* the part page renders an article inline with this */
  window.V60_KB = { articleHtml: function (api, a) { return bodyHTML(api, a.body) + '<h4>Sources</h4><ul class="src plain">' + srcLinks(api, a.src) + "</ul>"; } };
  function factCard(api, f, big) {
    var s = typeof f.src === "string" ? window.V60_SOURCES[f.src] : f.src;
    return '<article class="ans' + (big ? " best" : "") + '">' + (big ? '<p class="ans-k">Answer</p>' : "") + "<h3>" + api.esc(f.q) + '</h3><p class="ans-a">' + api.esc(f.a) + "</p>" + (s ? '<p class="status">Source: <a href="' + api.esc(s[1]) + '" target="_blank" rel="noopener">' + api.esc(s[0]) + "</a></p>" : "") + "</article>";
  }
  function render(api) {
    var $ = api.$, esc = api.esc, body = $("kbBody");
    $("kbIn").value = kb.q;
    var K = window.V60_KNOW;
    if (kb.view === "art" && kb.art) {
      var a = kb.art; if (K) K.discover("a", a.id);
      body.innerHTML = '<article class="kbart" id="kbArt"><div class="row"><button type="button" class="quiet" data-kb="home">Back to the library</button><button type="button" class="quiet sm" data-speak="#kbArt">Listen</button></div><p class="ans-k">' + esc(a.cat) + "</p><h2>" + esc(a.t) + "</h2>" + bodyHTML(api, a.body) + '<h4>Sources</h4><ul class="src plain">' + srcLinks(api, a.src) + "</ul></article>";
      return;
    }
    if (kb.view === "results") {
      var r = search(kb.q), code = /\b([pcbu][0-3][0-9a-f]{3})\b/i.exec(kb.q), html = "";
      if (code) { var d = api.decodeCode(code[1]); if (d.valid) html += '<article class="ans best"><p class="ans-k">Trouble code</p><h3>' + esc(d.code) + "</h3><p class=\"ans-a\">" + esc(d.known ? d.known.t : "Not in the built-in list. " + d.prefix + ", " + d.scope + ".") + "</p>" + (d.known ? '<p class="status">Common causes: ' + esc(d.known.c) + "</p>" : "") + '<button type="button" class="quiet" data-jump="tab:diag">Open Diagnose</button></article>'; }
      if (K) r.facts.slice(0, 3).forEach(function (x) { K.discover("f", x.f.id); });
      if (r.facts.length) html += factCard(api, r.facts[0].f, !code);
      if (r.facts.length > 1) html += '<h3 class="kbh">Related answers</h3><div class="anslist">' + r.facts.slice(1, 5).map(function (x) { return factCard(api, x.f, false); }).join("") + "</div>";
      if (r.arts.length) html += '<h3 class="kbh">Read more</h3><ul class="artlist">' + r.arts.slice(0, 5).map(function (x) { return '<li><button type="button" class="artbtn" data-art="' + x.a.id + '"><span class="ans-k">' + esc(x.a.cat) + "</span><b>" + esc(x.a.t) + "</b></button></li>"; }).join("") + "</ul>";
      if (!r.facts.length && !r.arts.length && !code) html += '<article class="ans"><h3>No answer in the library yet</h3><p>Try fewer words, like "oil capacity", "tire pressure" or "timing belt".' + (api.sample() ? " Or ask Claude below." : "") + "</p></article>";
      if (api.sample()) html += '<div class="askclaude"><button type="button" class="quiet" id="kbClaude">Ask Claude about this</button><span class="status">Uses the library\'s matching facts as grounding. Answers stream below.</span><div class="answer" id="kbAI" hidden></div></div>';
      body.innerHTML = html;
      return;
    }
    var cats = {};
    var known = window.V60_ARTICLES.filter(function (a) { return !K || K.article(a.id); });
    known.forEach(function (a) { (cats[a.cat] = cats[a.cat] || []).push(a); });
    var tagCount = {}; window.V60_FACTS.forEach(function (f) { tagCount[f.tag] = (tagCount[f.tag] || 0) + 1; });
    var tries = ["oil capacity", "tire pressure", "timing belt", "why is my tire light on", "P0171", "jump start", "towing capacity", "what octane"];
    body.innerHTML = '<div class="tries">' + tries.map(function (t) { return '<button type="button" class="chipq" data-try="' + esc(t) + '">' + esc(t) + "</button>"; }).join("") + '</div><div class="kbcats">' + Object.keys(cats).map(function (c) { return '<section class="kbcat"><h3>' + esc(c) + '</h3><ul class="artlist">' + cats[c].map(function (a) { return '<li><button type="button" class="artbtn" data-art="' + a.id + '"><b>' + esc(a.t) + "</b>" + (K && K.isNew(a.id) ? ' <span class="pill watch">New entry</span>' : "") + "</button></li>"; }).join("") + "</ul></section>"; }).join("") + '</div><p class="status">' + window.V60_FACTS.length + " verified facts searchable offline. " + known.length + " of " + window.V60_ARTICLES.length + " articles unlocked; more open as the story goes on, or when you look something up.</p>";
  }
  function askClaude(api) {
    var s = api.sample(); if (!s) return;
    var r = search(kb.q), ctx = r.facts.slice(0, 8).map(function (x) { return "- " + x.f.q + " " + x.f.a; }).join("\n"), arts = r.arts.slice(0, 2).map(function (x) { return x.a.t + ": " + x.a.body.join(" ").slice(0, 1800); }).join("\n\n");
    var st = api.state, h = api.computeHealth();
    var prompt = "You answer questions from the owner of one specific car: 2016 Volvo V60 T5 Premier, B4204T11 2.0 turbo, FWD, 8-speed Aisin, indirect tire monitor, start/stop, about " + (st.odo || 95000) + " miles, Austin TX. The owner is learning; be direct and plain.\nUse the verified facts below first. If they do not cover the question, say what you know with clear uncertainty, and say what to verify. Do not invent part numbers or torque specs.\n\nVerified facts:\n" + ctx + "\n\nLibrary excerpts:\n" + arts + "\n\nTop open items on the car: " + h.actions.slice(0, 4).map(function (a) { return a.text; }).join(" | ") + "\n\nQuestion: " + kb.q + "\n\nAnswer in under 180 words, plain text.";
    var box = api.$("kbAI"); box.hidden = false; box.textContent = "Thinking...";
    if (kb.ctl) kb.ctl.abort(); kb.ctl = new AbortController();
    s(prompt, { signal: kb.ctl.signal, cache: false, onText: function (e) { box.textContent = e.text; } }).then(function (res) { box.textContent = res.text + "\n\n(Claude's answer. Check anything critical against the sources.)"; }).catch(function (e) { box.textContent = e && e.code === "rate_limited" ? "Claude is busy. Try again in a minute." : "Claude could not answer right now."; });
  }
  (window.V60_MODULES = window.V60_MODULES || []).push({
    id: "kb",
    tabs: [{ id: "kb", section: "learn", label: "Library", order: 20, html: '<section><h2>Library</h2><p class="lede">Ask anything about your car. Answers come from verified facts about your exact V60, with sources, and work offline.</p><form class="askbar light" id="kbForm" role="search"><label for="kbIn" class="sr">Ask the library</label><input id="kbIn" type="search" placeholder="Oil capacity, tire pressure, P0420, timing belt..." autocomplete="off"><button type="submit">Ask</button></form></section><div id="kbBody" class="kbbody"></div>' }],
    render: function (api) { render(api); },
    init: function (api) {
      api.$("kbForm").addEventListener("submit", function (e) { e.preventDefault(); kb.q = api.$("kbIn").value.trim(); kb.view = kb.q ? "results" : "home"; render(api); });
      api.$("kbBody").addEventListener("click", function (e) {
        var b = e.target.closest && e.target.closest("button"); if (!b) return;
        if (b.hasAttribute("data-art")) { kb.art = window.V60_ARTICLES.filter(function (a) { return a.id === b.getAttribute("data-art"); })[0]; kb.view = "art"; render(api); window.scrollTo(0, 0); }
        else if (b.getAttribute("data-kb") === "home") { kb.view = kb.q ? "results" : "home"; render(api); }
        else if (b.hasAttribute("data-try")) { kb.q = b.getAttribute("data-try"); kb.view = "results"; render(api); }
        else if (b.id === "kbClaude") askClaude(api);
      });
    },
    jump: function (api, kind, id) {
      if (kind === "ask") { kb.q = id; kb.view = "results"; api.go("kb"); return true; }
      if (kind === "kb") { kb.art = window.V60_ARTICLES.filter(function (a) { return a.id === id; })[0] || null; kb.view = kb.art ? "art" : "home"; api.go("kb"); return true; }
      return false;
    },
    today: function (api) {
      var F = window.V60_FACTS, f = F[Math.floor(Date.now() / 864e5) % F.length];
      return [{ order: 40, html: '<article class="tcard"><h3>Know your car</h3><p class="status">' + api.esc(f.q) + '</p><p class="bigline sm">' + api.esc(f.a) + '</p><button type="button" class="quiet" data-jump="tab:kb">Open the library</button></article>' }];
    }
  });
  window.V60_KB.search = search; window.V60_KB.toks = toks;
})();
