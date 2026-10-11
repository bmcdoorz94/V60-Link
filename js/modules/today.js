/* Today: the home screen. Other modules contribute cards through module.today(api) -> [{order, html}] */
(window.V60_MODULES = window.V60_MODULES || []).push({
  id: "today",
  tabs: [{ id: "today", section: "today", label: "Today", order: 1, html: '<section class="today-hero"><div class="th-top"><div><p class="th-kicker" id="tdGreet">Today</p><h2 id="tdHead">Your V60</h2></div><div class="th-odo" id="tdOdo"></div></div><form class="askbar" id="tdAsk" role="search"><label for="tdAskIn" class="sr">Ask anything about your car</label><input id="tdAskIn" type="search" placeholder="Ask anything about your V60: oil capacity, tire pressure, P0171..." autocomplete="off"><button type="submit">Ask</button></form><div class="quick" id="tdQuick"></div><details class="sos" id="tdSos"><summary>Something\'s wrong with the car</summary><p class="status">Pick what you\'re seeing. Red warning lights come first: Volvo\'s manual says stop for those.</p><ul class="soslist">' + [["Red warning light (oil, brakes, temperature)", "kb:a-lights"], ["Check-engine light, steady or flashing", "tree:cel"], ["Temperature high, steam or a sweet smell", "tree:hot"], ["Oil warning or message", "tree:oil"], ["Brakes feel or sound wrong", "tree:brakes"], ["Won\'t start", "tree:nostart"], ["Tire light, or a flat tire", "tree:tpms"], ["Flat tire: sealing kit and spare", "kb:a-tirekit"], ["Shaking or vibration", "tree:vibe"], ["Start/stop acting strange", "tree:ss"], ["Something else", "tab:trouble"]].map(function (x) { return '<li><button type="button" class="mbtn" data-jump="' + x[1] + '"><span class="mt">' + x[0] + "</span></button></li>"; }).join("") + '</ul></details></section><div class="tdgrid" id="tdCards"></div>' }],
  render: function (api) {
    var $ = api.$, esc = api.esc, st = api.state, h = api.computeHealth(), r = api.rankFor(api.xp());
    var hr = new Date().getHours();
    $("tdGreet").textContent = hr < 12 ? "Good morning" : (hr < 18 ? "Good afternoon" : "Good evening");
    $("tdHead").textContent = h.score == null ? "Let's get to know your V60" : (h.score >= 75 ? "Your V60 is in good shape" : (h.score >= 50 ? "Your V60 needs some attention" : "Your V60 needs work"));
    $("tdOdo").innerHTML = st.odo != null ? "<b>" + api.fmt(st.odo) + "</b><span>miles</span>" : '<button type="button" class="quiet" data-jump="tab:records">Add mileage</button>';
    var quick = [["fuel", "Log fuel", "tab:fuel"], ["receipt", "Add a receipt", "tab:glove"], ["camera", "Photo check", "tab:my"], ["link", "Connect to car", "tab:live"], ["cards", "Daily cards", "tab:cards"], ["story", "Story", "tab:story"]];
    var IC = {
      fuel: '<path d="M5 20V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v15"/><path d="M4 20h11"/><path d="M14 9h2l2 2v6a1.5 1.5 0 0 0 3 0V8l-3-3"/><path d="M7 8h5"/>',
      receipt: '<path d="M7 3.5h10a1.5 1.5 0 0 1 1.5 1.5v15l-3-2-3 2-3-2-3 2V5A1.5 1.5 0 0 1 7 3.5z"/><path d="M9 8h6M9 11.5h6M9 15h3"/>',
      camera: '<path d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13.5" r="3.5"/>',
      link: '<path d="M9 7l6 5-6 5"/><path d="M6 4v16M18 4v16"/>',
      cards: '<rect x="5" y="4" width="11" height="15" rx="2"/><path d="M8 20h10a1 1 0 0 0 1-1V7"/>',
      story: '<path d="M5 4h11l3 3v13H5z"/><path d="M8 10h8M8 14h6"/>'
    };
    var G = window.V60_GATE, vis = function (t) { return !G || G.visible(t); };
    $("tdQuick").innerHTML = quick.filter(function (q) { var t = q[2].split(":")[1]; return document.getElementById("p-" + t) && vis(t); }).map(function (q) { return '<button type="button" class="qa" data-jump="' + q[2] + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + IC[q[0]] + "</svg><span>" + esc(q[1]) + "</span></button>"; }).join("");
    var cards = [];
    var top = h.actions.slice(0, 3);
    if (top.length && vis("health")) cards.push({ order: 20, html: '<article class="tcard"><h3>Fix first</h3><ul class="tlist">' + top.map(function (a) { return '<li><span class="pill ' + (a.sev >= 70 ? "concern" : (a.sev >= 40 ? "watch" : "info")) + '">' + (a.sev >= 70 ? "Act" : (a.sev >= 40 ? "Soon" : "Later")) + '</span><button type="button" class="tlink" data-jump="' + esc(a.jump) + '">' + esc(a.text) + "</button></li>"; }).join("") + '</ul><button type="button" class="quiet" data-jump="tab:health">See all ' + h.actions.length + "</button></article>" });
    cards.push({ order: 30, html: '<article class="tcard"><h3>Your progress</h3><p class="bigline">Level ' + r.lvl + ", " + esc(r.name) + '</p><p class="status">' + (r.next ? (r.next[0] - api.xp()) + " XP to " + esc(r.next[1]) : "Top rank") + '</p><button type="button" class="quiet" data-jump="tab:academy">Continue</button></article>' });
    window.V60_MODULES.forEach(function (m) { if (m.id !== "story" && m.tabs && m.tabs.length && !m.tabs.some(function (t) { return vis(t.id); })) return; if (m.today && m.id !== "today") try { (m.today(api) || []).forEach(function (c) { cards.push(c); }); } catch (e) { console.error(m.id, e); } });
    cards.sort(function (a, b) { return a.order - b.order; });
    $("tdCards").innerHTML = cards.map(function (c) { return c.html; }).join("");
  },
  init: function (api) {
    api.$("tdAsk").addEventListener("submit", function (e) { e.preventDefault(); var q = api.$("tdAskIn").value.trim(); if (q) api.jump("ask:" + q); });
  }
});
