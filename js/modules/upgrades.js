/* Upgrades: ranked for this car and this owner, with a "should I" check per item. Prices only where a source gave one. */
(function () {
  var UP = [
    { id: "tires", t: "A matched set of good all-season tires", cat: "Safety", lo: 400, hi: 800, costNote: "for four tires before mounting and balancing (the Garage's budget range)", diff: "Shop job", rev: "Normal wear item",
      what: "Your size is 215/50R17. Tires in that size from the research: Michelin CrossClimate 2, Michelin Primacy Tour A/S, Continental PureContact LS, Pirelli P7 AS Plus 3. Live prices were not checked.",
      why: "Tires are the single biggest change to braking and wet grip. Your car's tire monitor compares wheel speeds, so Volvo's bulletin TJ29818 wants all four within 5% rolling circumference: mismatched or unevenly worn tires can keep the warning on.",
      qs: [["Any tire is over 6 years old (DOT code), the age Volvo's manual gives for replacement", 3], ["Tread is at 4/32 in or less, or wear is uneven", 3], ["The four tires are not the same brand and model", 2], ["The tire pressure light keeps coming back after a correct calibration", 1]],
      base: 0, src: [["Volvo TSB TJ29818", "https://static.nhtsa.gov/odi/tsbs/2019/MC-10165233-9999.pdf"]], go: [["Tire check training", "tab:academy"]] },
    { id: "wipers", t: "New wiper blades", cat: "Safety", lo: null, hi: null, costNote: "price not researched; the DIY card shows a rough $30–60 estimate", diff: "DIY, 15 min", rev: "Normal wear item",
      what: "One retail fitment table lists 26 in (driver), 20 in (passenger) and 12 in (rear) for the 2016 V60. That is one store's table, so unconfirmed: compare with the blades on the car before buying.",
      why: "Smeared glass in Texas rain or at night is a visibility problem you notice every drive. It is the cheapest safety item on this list, and Austin sun cracks rubber.",
      qs: [["Blades streak, chatter or leave bands of water", 3], ["The rubber is cracked or split", 3], ["You don't know when they were last changed", 2]],
      base: 0, src: [["Wiper size table (retail, unconfirmed)", "https://autofiles.com/wipers/volvo/v60/"]], go: [["Wiper job card", "diy:j-wipers"]] },
    { id: "tint", t: "Fix the peeling window tint", cat: "Comfort", lo: null, hi: null, costNote: "shop prices not researched", diff: "Shop job (removal plus new film)", rev: "Film can be removed",
      what: "Peeling film is usually the old adhesive failing. It is removed and replaced, not patched. Texas rules per one law-firm summary, not the statute: front side windows at least 25% light getting through, the windshield only above the AS-1 line or the top 5 in, and reflectivity limits. Whether a wagon counts as a car or a multipurpose vehicle for the rear windows is unconfirmed, so use 25% on all side and rear glass to stay safe.",
      why: "Peeling film hurts visibility and can fail the state inspection look. New film also cuts cabin heat and sun on the dash, which matters in Austin. Ask the shop for the film's percentage in writing, and ask if the car is a car or multipurpose vehicle under Texas rules.",
      qs: [["The film bubbles or peels in your line of sight", 3], ["The car sits in the sun at work or home", 2], ["You want less heat and glare in the cabin", 1]],
      base: 0, src: [["Texas tint limits (law-firm summary, not the statute)", "https://www.simmonsandfletcher.com/blog/texas-window-tint-laws/"]] },
    { id: "dashcam", t: "Dash camera", cat: "Protection", lo: null, hi: null, costNote: "prices not researched here", diff: "Plug-in: 15 min. Hardwired: shop or careful DIY", rev: "Fully reversible",
      what: "Start with one that plugs into the 12 V socket: no wiring. Hardwiring through a fuse tap allows parking mode, which draws from the battery while the car sits.",
      why: "Evidence after a crash or a dispute. Texas has no dash cam exemption: Transportation Code 547.613 bans anything on the windshield that obstructs the driver's view, so mount it behind the rear-view mirror.",
      qs: [["You drive in heavy Austin traffic most days", 1], ["The car is parked on the street or in open lots", 1], ["You have had or worried about a not-at-fault crash dispute", 2]],
      base: -1, src: [["Texas Transportation Code 547.613 (summary)", "https://www.recordinglaw.com/us-laws/windshield-mounting-restrictions/texas-windshield-mounting-laws/"]] },
    { id: "carplay", t: "Apple CarPlay retrofit", cat: "Comfort", lo: 850, hi: null, costNote: "one listed box (ZZ-2 IT3-VOLVO, fitment to confirm); NavInc APPplay is price on request", diff: "Plug-in module behind the screen; shop or confident DIY", rev: "Reversible",
      what: "Boxes such as NavInc APPplay add wireless CarPlay and Android Auto to the 7-inch Sensus Connect screen, keep the steering-wheel buttons and factory Bluetooth, and accept camera inputs.",
      why: "Your car's connected services died with the 3G shutdown, and Sensus maps are dated. If you use your phone for maps and music every drive, this changes the car more than anything else on this list. The free alternative is a good phone mount plus Bluetooth audio.",
      qs: [["You use phone navigation on most drives", 2], ["You plan to keep the car 3 years or more", 1], ["A phone mount bothers you or blocks vents", 1], ["You are comfortable paying about $850 or more for convenience", 1]],
      base: -1, src: [["NavInc APPplay for Sensus Connect 7 in", "https://www.navinc.nl/appplay-box-volvo-sensus-connect-7inch-carplay-android-auto-set"], ["ZZ-2 IT3-VOLVO listing", "https://www.onlinecarstereo.com/CarAudio/p_93473_ZZ_2_IT3-VOLVO.aspx"]] },
    { id: "polestar", t: "Polestar Performance Optimization", cat: "Performance", lo: null, hi: null, costNote: "price and 2026 US availability unconfirmed", diff: "Dealer software, about an hour", rev: "Dealer can remove",
      what: "Volvo's own calibration for exactly your car: peak 242 to 250 hp, torque 258 to 295 lb-ft, 0-60 mph 6.4 to 6.3 s. Ask a dealer for article number 31459463.",
      why: "The only power upgrade that Volvo says keeps certified emissions. It changes how the car pulls in the mid-range more than its top speed. Aftermarket tunes are a different matter (see below).",
      qs: [["Your timing belt and basic service history are known", 2], ["You want more mid-range pull for merging and passing", 1], ["A Volvo dealer near you confirms they can still install it", 2]],
      base: -2, src: [["Polestar product sheet", "https://engineered-api.polestar.com/optimisations/v60-t5-drive-e-fwd-automatic-2016/productSheet?market=us"]], go: [["Polestar article", "kb:a-polestar"]] },
    { id: "modem", t: "4G modem for Volvo On Call", cat: "Comfort", lo: null, hi: null, costNote: "Volvo's 2022 offer; current availability unconfirmed", diff: "Dealer, about 1 hour", rev: "Hardware swap",
      what: "Volvo's 3G-sunset bulletin (SMB 00-035) replaced the telematics modem and reloaded software, bringing back the app, remote start, SOS and automatic collision alerts.",
      why: "Only worth asking about if you want the app or automatic crash calls. Hardware was limited in 2022.",
      qs: [["You want remote start or lock from your phone", 1], ["Automatic SOS after a crash matters to you", 2], ["A dealer confirms it is still offered", 2]],
      base: -2, src: [["Volvo SMB 00-035", "https://static.nhtsa.gov/odi/tsbs/2022/MC-10213337-9999.pdf"]] },
    { id: "lights", t: "Brighter headlights, the legal way", cat: "Safety", lo: null, hi: null, costNote: "bulbs are about $15–40 each (DIY job card)", diff: "DIY, 30 min per side", rev: "Reversible",
      what: "Premier cars have halogen headlights (xenon was a Platinum feature). Legal route: fresh, DOT-compliant H11 low and H9 high bulbs, clean lenses, and correct aim. Old bulbs dim with age.",
      why: "NHTSA's 2004 interpretation says HID conversion kits in halogen headlamps cannot meet the federal lighting standard. No LED-specific letter was found in this research, but the same reasoning applies, and badly aimed LED bulbs glare at other drivers.",
      qs: [["Your lights look yellow or dim at night", 2], ["The bulbs have never been changed as far as you know", 1], ["The lenses are cloudy", 1]],
      base: -1, src: [["NHTSA interpretation, HID conversions (2004)", "https://www.nhtsa.gov/interpretations/shih3"]], go: [["Bulb job card", "diy:j-bulb"]] },
    { id: "tune", t: "Aftermarket engine tunes, intakes and exhausts", cat: "Skip", lo: null, hi: null, costNote: "", diff: "", rev: "", skip: true,
      what: "Changing the engine calibration or removing emissions parts is treated as tampering under the Clean Air Act, and Travis County still tests emissions.",
      why: "On an engine with a known piston-ring issue and an unknown service history, extra boost adds risk for little gain. The Polestar calibration above is the sanctioned version.",
      qs: [], base: -9, src: [] }
  ];
  function data(api) { var d = api.mod("upg"); if (!d) { d = { keep: 3, ans: {}, want: {} }; api.setMod("upg", d); } return d; }
  function score(api, u) {
    var d = data(api), a = d.ans[u.id] || {}, s = u.base;
    u.qs.forEach(function (q, i) { if (a[i]) s += q[1]; });
    if (u.hi && d.keep < 2) s -= 1;
    return s;
  }
  function verdict(api, u) {
    if (u.skip) return ["Skip", "wait", "Not recommended for this car."];
    var d0 = data(api), any = Object.keys(d0.ans[u.id] || {}).some(function (k) { return d0.ans[u.id][k]; });
    var s = score(api, u), d = d0, per = u.lo ? Math.round((u.hi || u.lo) / Math.max(1, d.keep)) : null;
    var tail = per ? " Roughly $" + per + " per year over the " + d.keep + " year" + (d.keep === 1 ? "" : "s") + " you plan to keep it." : "";
    if (!any) return ["No verdict yet", "", "Tick what is true under Should I? and this updates." + tail];
    if (s >= 2) return ["Worth it for you", "go", "Your answers point to yes." + tail];
    if (s >= 0) return ["Maybe", "", "Some reasons, not many." + tail];
    return ["Not yet", "wait", "Nothing you ticked makes this a priority right now."];
  }
  function render(api) {
    var $ = api.$, esc = api.esc, d = data(api), belt = !!api.lastFor("timingbelt");
    $("upKeep").value = d.keep; $("upKeepV").textContent = d.keep + " year" + (d.keep === 1 ? "" : "s");
    $("upGate").innerHTML = belt ? "" : '<div class="note"><b>Before spending on upgrades:</b> your timing belt history is unknown. On this engine a snapped belt can wreck the engine, so a belt inspection or replacement record is worth more than anything below. <button type="button" class="quiet" data-jump="kb:a-belt">Why</button></div>';
    var order = UP.slice().sort(function (a, b) { return (b.skip ? -99 : score(api, b)) - (a.skip ? -99 : score(api, a)); });
    $("upList").innerHTML = order.map(function (u, i) {
      var v = verdict(api, u), a = d.ans[u.id] || {};
      return '<li><div class="uh"><span class="rank">' + (u.skip ? "×" : i + 1) + "</span><h3>" + esc(u.t) + '</h3><span class="pill ' + (u.skip ? "concern" : "info") + '">' + esc(u.cat) + "</span>" + (d.want[u.id] ? '<span class="pill ok">' + (d.want[u.id] === "done" ? "Done" : "On my list") + "</span>" : "") + "</div>" +
        (u.skip ? "" : '<div class="facts"><span><b>' + (u.lo ? "$" + api.fmt(u.lo) + (u.hi ? "–" + api.fmt(u.hi) : "+") : "Cost") + "</b> " + esc(u.costNote) + "</span>" + (u.diff ? "<span><b>Work</b> " + esc(u.diff) + "</span>" : "") + (u.rev ? "<span><b>Undo</b> " + esc(u.rev) + "</span>" : "") + "</div>") +
        "<p>" + esc(u.what) + '</p><p class="status">' + esc(u.why) + "</p>" +
        (u.qs.length ? '<details><summary>Should I? Tick what is true</summary><div class="qs">' + u.qs.map(function (q, k) { return '<label><input type="checkbox" data-upq="' + u.id + ":" + k + '"' + (a[k] ? " checked" : "") + "> <span>" + esc(q[0]) + "</span></label>"; }).join("") + "</div></details>" : "") +
        '<div class="verdict ' + v[1] + '"><b>' + esc(v[0]) + "</b> " + esc(v[2]) + "</div>" +
        '<div class="row">' + (u.skip ? "" : '<div class="seg"><button type="button" data-upw="' + u.id + ':want" aria-pressed="' + (d.want[u.id] === "want") + '">On my list</button><button type="button" data-upw="' + u.id + ':done" aria-pressed="' + (d.want[u.id] === "done") + '">Done</button></div>') + (u.go || []).map(function (g) { return '<button type="button" class="quiet" data-jump="' + esc(g[1]) + '">' + esc(g[0]) + "</button>"; }).join("") + "</div>" +
        (u.src.length ? '<p class="status">Sources: ' + u.src.map(function (s) { return '<a href="' + esc(s[1]) + '" target="_blank" rel="noopener">' + esc(s[0]) + "</a>"; }).join(", ") + "</p>" : "") + "</li>";
    }).join("");
  }
  (window.V60_MODULES = window.V60_MODULES || []).push({
    id: "upg",
    tabs: [{ id: "upgrades", section: "car", label: "Upgrades", order: 45, html:
      '<section><h2>Upgrades</h2><p class="lede">Ranked for your car and re-ranked by your answers. Safety first, then things you will notice every drive. Prices appear only where a source listed one.</p></section><div id="upGate"></div>' +
      '<section class="card"><div class="field"><label for="upKeep">How long you plan to keep the car: <span id="upKeepV"></span></label><input id="upKeep" type="range" min="1" max="10" step="1"></div></section>' +
      '<ul class="upg" id="upList"></ul>' }],
    clean: function (v) { if (!v || typeof v !== "object") return null; return { keep: Math.max(1, Math.min(10, +v.keep || 3)), ans: v.ans && typeof v.ans === "object" ? v.ans : {}, want: v.want && typeof v.want === "object" ? v.want : {} }; },
    render: function (api) { render(api); },
    init: function (api) {
      var $ = api.$;
      $("upKeep").addEventListener("input", function () { data(api).keep = +this.value; api.save(); render(api); });
      $("p-upgrades").addEventListener("change", function (e) { var q = e.target.getAttribute && e.target.getAttribute("data-upq"); if (!q) return; var p = q.split(":"), d = data(api); d.ans[p[0]] = d.ans[p[0]] || {}; d.ans[p[0]][p[1]] = e.target.checked; api.save(); render(api); var el = document.querySelector('[data-upq="' + q + '"]'); if (el) { el.closest("details").open = true; el.focus(); } });
      $("p-upgrades").addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("[data-upw]"); if (!b) return; var p = b.getAttribute("data-upw").split(":"), d = data(api); if (d.want[p[0]] === p[1]) delete d.want[p[0]]; else d.want[p[0]] = p[1]; api.save(); render(api); });
    },
    xp: function (api) { var d = api.mod("upg"); if (!d) return 0; return Object.keys(d.want).filter(function (k) { return d.want[k] === "done"; }).length * 30; }
  });
})();
