/* Today: the home screen. Other modules contribute cards through module.today(api) -> [{order, html}] */
(window.V60_MODULES = window.V60_MODULES || []).push({
  id: "today",
  tabs: [{ id: "today", section: "today", label: "Today's notes", order: 1, html: '<section class="today-hero"><div class="th-top"><div><p class="th-kicker" id="tdGreet">Today</p><h2 id="tdHead">Your V60</h2></div><div class="th-odo" id="tdOdo"></div></div><form class="askbar" id="tdAsk" role="search"><label for="tdAskIn" class="sr">Ask anything about your car</label><input id="tdAskIn" type="search" placeholder="Ask anything about your V60: oil capacity, tire pressure, P0171..." autocomplete="off"><button type="submit">Ask</button></form><div class="quick" id="tdQuick"></div><details class="sos" id="tdSos"><summary>Something\'s wrong with the car</summary><p class="status">Pick what you\'re seeing. Red warning lights come first: Volvo\'s manual says stop for those.</p><ul class="soslist">' + [["Red warning light (oil, brakes, temperature)", "kb:a-lights"], ["Check-engine light, steady or flashing", "tree:cel"], ["Temperature high, steam or a sweet smell", "tree:hot"], ["Oil warning or message", "tree:oil"], ["Brakes feel or sound wrong", "tree:brakes"], ["Won\'t start", "tree:nostart"], ["Tire light, or a flat tire", "tree:tpms"], ["Flat tire: sealing kit and spare", "kb:a-tirekit"], ["Shaking or vibration", "tree:vibe"], ["Start/stop acting strange", "tree:ss"], ["Something else", "tab:trouble"]].map(function (x) { return '<li><button type="button" class="mbtn" data-jump="' + x[1] + '"><span class="mt">' + x[0] + "</span></button></li>"; }).join("") + '</ul></details></section><div class="tdgrid" id="tdCards"></div>' }],
  render: function (api) {
    var $ = api.$, esc = api.esc, st = api.state, h = api.computeHealth(), r = api.rankFor(api.xp());
    var hr = new Date().getHours();
    $("tdGreet").textContent = hr < 12 ? "Good morning" : (hr < 18 ? "Good afternoon" : "Good evening");
    $("tdHead").textContent = h.score == null ? "Let's get to know your V60" : (h.score >= 75 ? "Your V60 is in good shape" : (h.score >= 50 ? "Your V60 needs some attention" : "Your V60 needs work"));
    /* the odometer already sits in the top bar; only prompt here while it is empty */
    $("tdOdo").innerHTML = st.odo != null ? "" : '<button type="button" class="quiet" id="tdOdoGo">Add mileage</button>';
    var og = $("tdOdoGo"); if (og) og.addEventListener("click", function () { var o = $("odo"); if (o) { o.scrollIntoView({ block: "center" }); o.focus(); } });
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
    /* garage map: a top-down drawing of the car; each area lights up once the story has opened it */
    var Z = [
      ["seats", "story", '<rect x="112" y="48" width="96" height="104" rx="14"/>', [160, 104], "Story"],
      ["hood", "engine", '<path d="M262 42 H318 Q336 44 338 100 Q336 156 318 158 H262 Z"/>', [300, 104], "Engine bay"],
      ["dash", "health", '<rect x="216" y="48" width="18" height="104" rx="6"/>', [225, 192], "Health"],
      ["obd", "live", '<circle cx="232" cy="66" r="9"/>', [232, 15], "Live link"],
      ["glove", "glove", '<rect x="238" y="118" width="18" height="26" rx="4"/>', [286, 192], "Glovebox"],
      ["cargo", "diy", '<path d="M104 48 H42 Q24 52 22 100 Q24 148 42 152 H104 Z"/>', [64, 104], "DIY jobs"],
      ["fuel", "fuel", '<rect x="86" y="160" width="20" height="10" rx="3"/>', [96, 192], "Fuel"],
      ["wheels", "bay", '<rect x="62" y="22" width="40" height="14" rx="6"/><rect x="62" y="164" width="40" height="14" rx="6"/><rect x="262" y="22" width="40" height="14" rx="6"/><rect x="262" y="164" width="40" height="14" rx="6"/>', [82, 14], "Whole car"]
    ];
    var shown = Z.filter(function (z) { return document.getElementById("p-" + z[1]) && vis(z[1]); });
    $("tdQuick").innerHTML = '<svg class="gmap" viewBox="0 0 360 200" role="group" aria-label="Your garage. Lit areas are open."><path class="gbody" d="M40 30 H300 Q348 34 350 100 Q348 166 300 170 H40 Q12 166 10 100 Q12 34 40 30 Z"/>' +
      Z.map(function (z) { var on = shown.indexOf(z) >= 0; return '<g class="gz ' + (on ? "on" : "off") + '"' + (on ? ' role="button" tabindex="0" data-jump="tab:' + z[1] + '" aria-label="' + esc(z[4]) + '"' : ' aria-hidden="true"') + ">" + (on ? '<circle class="ghit" cx="' + z[3][0] + '" cy="' + (z[3][1] - 4) + '" r="20"/>' : "") + z[2] + "</g>"; }).join("") + /* ghit: a finger-sized tap area at each label */
      shown.map(function (z) { return '<text class="glab" x="' + z[3][0] + '" y="' + z[3][1] + '" text-anchor="middle">' + esc(z[4]) + "</text>"; }).join("") + "</svg>" +
      '<p class="gmhint">' + shown.length + " of " + Z.length + " areas open. Tap a lit area.</p>";
    var lb = null; try { lb = localStorage.getItem("v60-garage-lastbackup"); } catch (e) {}
    var meaningful = (st.log || []).length + (st.oil || []).length + Object.keys((api.acad() || {}).done || {}).length >= 3;
    var needSafety = api.localMode && api.localMode() && !(window.V60_SYNC && window.V60_SYNC.on()) && meaningful && (!lb || (Date.now() - new Date(lb + "T12:00:00")) / 864e5 > 14);
    var cards = [];
    if (needSafety) cards.push({ order: 3, html: '<article class="tcard"><p class="ans-k">Protect your progress</p><h3>Your progress lives only on this device</h3><p class="status">' + (lb ? "Last backup " + esc(lb) + "." : "No backup yet.") + ' Turn on sync to keep every device in step, or save a backup file to iCloud Drive.</p><div class="row"><button type="button" data-jump="opts:sync">Set up sync</button><button type="button" class="quiet" data-jump="backup:go">Save a backup</button></div></article>' });
    var top = h.actions.slice(0, 3);
    if (top.length && vis("health")) cards.push({ order: 20, html: '<article class="tcard"><h3>Fix first</h3><ul class="tlist">' + top.map(function (a) { return '<li><span class="pill ' + (a.sev >= 70 ? "concern" : (a.sev >= 40 ? "watch" : "info")) + '">' + (a.sev >= 70 ? "Act" : (a.sev >= 40 ? "Soon" : "Later")) + '</span><button type="button" class="tlink" data-jump="' + esc(a.jump) + '">' + esc(a.text) + "</button></li>"; }).join("") + '</ul><button type="button" class="quiet" data-jump="tab:health">See all ' + h.actions.length + "</button></article>" });
    cards.push({ order: 30, html: '<article class="tcard"><h3>Your progress</h3><p class="bigline">Level ' + r.lvl + ", " + esc(r.name) + '</p><p class="status">' + (r.next ? (r.next[0] - api.xp()) + " XP to " + esc(r.next[1]) : "Top rank") + '</p><button type="button" class="quiet" data-jump="tab:story">Continue</button></article>' });
    window.V60_MODULES.forEach(function (m) { if (m.id !== "story" && m.tabs && m.tabs.length && !m.tabs.some(function (t) { return vis(t.id); })) return; if (m.today && m.id !== "today") try { (m.today(api) || []).forEach(function (c) { cards.push(c); }); } catch (e) { console.error(m.id, e); } });
    cards.sort(function (a, b) { return a.order - b.order; });
    $("tdCards").innerHTML = cards.map(function (c) { return c.html; }).join("");
  },
  init: function (api) {
    api.$("tdQuick").addEventListener("keydown", function (e) { var g = e.target.closest && e.target.closest("[data-jump]"); if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); api.jump(g.getAttribute("data-jump")); } });
    api.$("tdAsk").addEventListener("submit", function (e) { e.preventDefault(); var q = api.$("tdAskIn").value.trim(); if (q) api.jump("ask:" + q); });
  }
});
