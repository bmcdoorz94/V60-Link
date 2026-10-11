/* Achievements (earned only from real-world proof), seasonal events for Austin, and more Career jobs from real Drive-E problems. */
(function () {
  function mods(api, id) { return api.mod(id) || {}; }
  function doneCount(api, chapterIdx) { var c = api.CHAPTERS[chapterIdx]; if (!c) return 0; var A = api.acad(); return c.missions.filter(function (m) { return A.done[m.id] && A.done[m.id].outcome !== "skip"; }).length; }
  var ACH = [
    ["hood", "First look", "Open the hood for the first time (Academy).", function (a) { return !!a.acad().done["m-hood"]; }],
    ["oilwatch", "Oil watcher", "Log three oil level checks.", function (a) { return (a.state.oil || []).length >= 3; }],
    ["psi", "Pressure perfect", "Record all four tire pressures.", function (a) { return !!a.acad().done["m-psi"]; }],
    ["history", "Paper trail", "Log three past services.", function (a) { return a.state.log.length >= 3; }],
    ["belt", "Belt verified", "Log a timing belt service, or proof of one.", function (a) { return a.state.log.some(function (e) { return e.item === "timingbelt"; }); }],
    ["recalls", "Recalls cleared", "Set every recall to done or not applicable.", function (a) { var r = a.state.recalls || {}; return a.RECALLS.every(function (x) { return r[x.id] === "done" || r[x.id] === "na"; }); }],
    ["scan", "The car speaks", "Run a health check with V60 Link.", function (a) { return !!a.state.lastScan; }],
    ["baseline", "Baseline set", "Save three real drives in the Data lab.", function (a) { return (a.state.runs || []).length >= 3; }],
    ["photo", "Photographer", "Save five photo inspections.", function (a) { return (a.state.photos || []).length >= 5; }],
    ["baymap", "Mapmaker", "Pin five parts on your own engine bay photo.", function (a) { var m = a.state.bayMap; return !!(m && m.pins && Object.keys(m.pins).length >= 5); }],
    ["cards", "Card sharp", "Master 25 flashcards.", function (a) { var d = mods(a, "cards").b || {}; return Object.keys(d).filter(function (k) { return d[k][0] >= 4; }).length >= 25; }],
    ["cert", "Certified", "Pass the V60 Master exam.", function (a) { return !!mods(a, "exam").passed; }],
    ["wrench", "Wrench time", "Complete three DIY jobs.", function (a) { return Object.keys(mods(a, "diy").done || {}).length >= 3; }],
    ["detective", "Detective", "Solve five mystery cars in the simulator.", function (a) { var s = a.acad().sim; return !!(s && s.correct >= 5); }],
    ["fuel", "Range finder", "Log five fill-ups.", function (a) { return (mods(a, "fuel").fills || []).length >= 5; }],
    ["receipts", "Archivist", "Add three receipts.", function (a) { return (mods(a, "glove").receipts || []).length >= 3; }],
    ["academy", "Graduate", "Finish every Academy chapter.", function (a) { return a.CHAPTERS.every(function (c, i) { return doneCount(a, i) >= c.missions.length; }); }],
    ["season", "Ready for the season", "Complete a seasonal checklist.", function (a) { var s = mods(a, "extras").season || {}; return Object.keys(s).some(function (k) { return s[k] && s[k].complete; }); }]
  ];
  function earned(api) { return ACH.filter(function (x) { try { return x[3](api); } catch (e) { return false; } }); }
  function season() {
    var m = new Date().getMonth() + 1, y = new Date().getFullYear();
    if (m >= 5 && m <= 9) return { key: y + "-summer", t: "Texas summer prep", why: "Heat is what kills batteries, tires and cooling systems in Austin.", items: ["Battery tested at a parts store (heat shortens AGM life)", "Coolant between MIN and MAX, engine cold", "A/C blows cold within a couple of minutes", "Tire pressures checked cold in the morning, 38 psi", "Wiper blades not cracked or streaking from sun", "Sunshade in the car to protect the dash and cabin"] };
    if (m === 12 || m <= 2) return { key: (m === 12 ? y : y - 1) + "-winter", t: "Winter prep", why: "Austin freezes are rare but sudden; cold drops tire pressure and finds weak batteries.", items: ["Tire pressures rechecked: about 1 psi lost per 10 F drop", "Battery tested", "Washer fluid with antifreeze", "Wipers in good shape", "Know where the tire sealing kit and tow eye are"] };
    return { key: y + "-" + (m <= 4 ? "spring" : "fall"), t: m <= 4 ? "Spring check" : "Fall check", why: "A seasonal once-over catches what a month of driving hides.", items: ["Walkaround: lights, tires, wipers", "Fluids: coolant, brake, washer", "Oil level in the cluster, logged", "Cabin air filter if it has been a year", "Look underneath for new drips"] };
  }
  var JOBS_MORE = [
    { id: "j-oiluse", title: "Customer adds oil every month", xp: 130, complaint: "A 2016 V60 owner says the 'Oil level low' message keeps appearing between changes. No smoke they have noticed, no drips on the driveway.",
      checks: [["Check the driveway and undertray for oil", 5, "Dry. No external leak."], ["Review the owner's top-up log", 5, "About 1 quart added every 1,200 miles."], ["Pull the spark plugs", 25, "Cylinder 1 plug wet with oil deposits."], ["Compression test", 30, "Within spec on all four."], ["Check for a stuck oil trap (PCV)", 10, "Normal crankcase pressure at idle."]],
      options: ["Leaking valve cover gasket", "Internal oil consumption past the piston rings", "Overfilled at the last service", "Failed turbo seals"], a: 1, best: 20,
      why: "No external leak, normal crankcase ventilation, steady consumption of about a quart per 1,200 miles and an oil-fouled plug fit the piston-ring consumption known on some 2015 and 2016 Drive-E engines. The owner's log is the evidence any warranty or goodwill request needs. Turbo seals usually show smoke and oil in the intake pipes." },
    { id: "j-ss", title: "Start/stop stopped working", xp: 100, complaint: "Start/stop has not shut the engine off in weeks. Sometimes the cluster shows 'Auto Start/Stop Service required'.",
      checks: [["Ask about driving pattern", 3, "Mostly 10-minute trips, lots of A/C in the heat."], ["Test the main AGM battery", 10, "Low state of charge, weak under load."], ["Check outside temperature during the complaint", 2, "Mid-90s F most days."], ["Scan for codes", 10, "A stored code for the start/stop support battery circuit."], ["Inspect battery terminals", 5, "Clean and tight."]],
      options: ["Normal behavior in the heat only", "Battery state: weak main AGM and a support-battery fault", "Faulty brake pedal switch", "Transmission software"], a: 1, best: 22,
      why: "Heat alone can hold off start/stop, but a service message plus a weak AGM battery and a support-battery code means the system is protecting itself. Batteries first: test and replace with AGM, then clear and recheck." },
    { id: "j-tpmsfalse", title: "Tire light keeps coming back", xp: 90, complaint: "The tire pressure light comes on every week or two. The shop checked pressures twice and found them fine.",
      checks: [["Gauge all four tires cold", 5, "All at 38 psi."], ["Watch the light at startup", 2, "Steady, no flashing. Message: Tire pressure low."], ["Ask about recent tire work", 3, "One new tire fitted last month after a puncture."], ["Check calibration history", 3, "Never recalibrated after the new tire."], ["Scan for codes", 10, "None in the engine computer."]],
      options: ["Failed valve-stem sensor", "Indirect tire monitor never recalibrated after a new tire", "Bad ABS module", "Slow leak in all four tires"], a: 1, best: 13,
      why: "This car has no valve sensors. One new tire with a different rolling size, and no recalibration, makes the wheel-speed comparison read 'low'. Calibrate from MY CAR and drive 15 minutes. Volvo bulletin TJ29818 adds recalibrating every 10,000 miles." },
    { id: "j-belt", title: "Buying a 10-year-old Drive-E", xp: 140, complaint: "A customer is about to buy a 2016 V60 T5 with 92,000 miles and asks what to check before signing. No service records.",
      checks: [["Look for a timing belt sticker under the hood", 5, "None found."], ["Run a VIN service history check at a Volvo dealer", 15, "Oil services until 60k miles, nothing after."], ["Check oil level history in the car's messages", 5, "A recent 'Oil level low' in the log."], ["Scan all modules", 20, "No stored faults."], ["Look at tire DOT dates", 5, "Week 30 of 2018 on all four."]],
      options: ["Buy it, it is fine", "Walk away", "Budget for the timing belt kit, tires and an oil consumption watch, then negotiate", "Only the tires matter"], a: 2, best: 25,
      why: "The car is 10 years old with no proof of a timing belt, so the belt kit is due on age alone. Tires from 2018 are past Volvo's 6-year guidance, and a low-oil message on this engine family means watching consumption. None of that is a reason to walk away, but all of it is leverage and a budget." },
    { id: "j-boost", title: "Flat when merging", xp: 120, complaint: "The car feels flat when accelerating hard onto the highway, but drives normally around town. No check-engine light.",
      checks: [["Log a full-throttle pull with live data", 15, "Intake pressure peaks well below a healthy pull; fuel trims dip negative under boost."], ["Listen under the hood at high load", 5, "A faint hiss near the front of the engine."], ["Inspect the charge pipes and intercooler hoses", 15, "A split coupler on the intercooler outlet."], ["Check the air filter", 5, "Moderately dirty."], ["Check fuel pressure", 20, "Normal."]],
      options: ["Clogged air filter", "Boost leak at the intercooler hose", "Failing fuel pump", "Transmission slipping"], a: 1, best: 25,
      why: "Low peak intake pressure, negative trims only under boost and a hiss under load point to measured air escaping after the airflow sensor. The split coupler confirms it. A dirty filter costs a little power, not this much." }
  ];
  function render(api) {
    var esc = api.esc, got = earned(api), ids = got.map(function (x) { return x[0]; });
    var s = season(), d = api.mod("extras") || {}, st = (d.season || {})[s.key] || { items: {} };
    api.$("exAch").innerHTML = '<p class="status">' + got.length + " of " + ACH.length + ' earned. Each one needs proof from the real car.</p><ul class="achs">' + ACH.map(function (x) { var on = ids.indexOf(x[0]) >= 0; return '<li class="ach' + (on ? " on" : "") + '"><span class="medal" aria-hidden="true">' + (on ? "★" : "") + "</span><b>" + esc(x[1]) + "</b><span>" + esc(x[2]) + "</span></li>"; }).join("") + "</ul>";
    api.$("exSeason").innerHTML = "<h3>" + esc(s.t) + '</h3><p class="lede">' + esc(s.why) + '</p><div class="steps">' + s.items.map(function (it, n) { return '<label class="stp"><input type="checkbox" data-season="' + n + '"' + (st.items[n] ? " checked" : "") + "><span>" + esc(it) + "</span></label>"; }).join("") + "</div>" + (st.complete ? '<p class="status">Complete for this season.</p>' : "");
  }
  (window.V60_MODULES = window.V60_MODULES || []).push({
    id: "extras",
    tabs: [{ id: "achieve", section: "learn", label: "Achievements", order: 40, html: '<section><h2>Achievements</h2><div id="exAch"></div></section><section class="card" id="exSeason"></section>' }],
    clean: function (v) { return v && typeof v === "object" ? { season: v.season || {} } : null; },
    init: function (api) {
      JOBS_MORE.forEach(function (j) { if (!api.JOBS.some(function (x) { return x.id === j.id; })) api.JOBS.push(j); });
      api.$("exSeason").addEventListener("change", function (e) {
        var n = e.target.getAttribute && e.target.getAttribute("data-season"); if (n == null) return;
        var s = season(), d = api.mod("extras") || { season: {} }; d.season = d.season || {}; var st = d.season[s.key] = d.season[s.key] || { items: {} };
        st.items[n] = e.target.checked; st.complete = s.items.every(function (_, k) { return st.items[k]; });
        api.setMod("extras", d); api.save(); api.updateHud(); render(api);
      });
    },
    render: function (api) { render(api); },
    xp: function (api) { return earned(api).length * 20; },
    today: function (api) {
      var s = season(), d = api.mod("extras") || {}, st = (d.season || {})[s.key] || { items: {} }, n = s.items.filter(function (_, k) { return st.items[k]; }).length;
      var out = [];
      if (!st.complete) out.push({ order: 35, html: '<article class="tcard"><p class="ans-k">Seasonal event</p><h3>' + api.esc(s.t) + '</h3><p class="status">' + n + " of " + s.items.length + ' done. ' + api.esc(s.why) + '</p><button type="button" class="quiet" data-jump="tab:achieve">Open checklist</button></article>' });
      var got = earned(api).length;
      out.push({ order: 45, html: '<article class="tcard"><h3>Achievements</h3><p class="bigline">' + got + " of " + ACH.length + '</p><button type="button" class="quiet" data-jump="tab:achieve">See all</button></article>' });
      return out;
    }
  });
})();
