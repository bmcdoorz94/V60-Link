/* DIY job cards from Volvo's 2016 V60 US owner's manual. Completing a job logs it and can rate the part. */
(function () {
  var JOBS = [
    { id: "j-oilcheck", t: "Check the oil level", lvl: 1, min: 3, cost: "Free", tools: [], part: "oilfilter", pg: "337",
      steps: ["Park on level ground. The reading is right after about 20 miles of driving or 5 minutes parked level with the engine off.", "Put the ignition in mode II: key in, press START/STOP ENGINE for about 2 seconds with your foot off the brake.", "Roll the thumb wheel on the left steering-wheel stalk until Oil level appears.", "Read the bar between min and max. 'No values available' only means conditions are not met yet.", "If it says low, top up with the amount shown, using the same oil type already in the engine. Never above max."],
      warn: ["'Oil service required' can mean the level is too high. Volvo says take it to a workshop.", "Do not spill oil on the hot exhaust."] },
    { id: "j-fluids", t: "Check coolant, brake and washer fluid", lvl: 1, min: 8, cost: "Free (washer fluid about $4)", tools: ["light"], part: "coolant", pg: "333–351",
      steps: ["Engine off and cold, P selected, ignition fully off, no key inside the cabin. The fan can run for 6 minutes after shutdown.", "Open the hood: handle under the left of the dash, turn 20 to 25 degrees clockwise, lift slightly, push the catch under the front right edge to the left.", "Coolant: passenger-side expansion tank, level between MIN and MAX. Never open it warm.", "Brake fluid: under the round cover at the rear of the engine bay. Check without removing the cap. Below MIN means do not drive.", "Washer fluid: driver side filler. Top up with washer fluid, pH 6 to 8, with antifreeze in cold weather.", "Close the hood and make sure it locks."],
      warn: ["Never open the hood while start/stop has the engine auto-stopped. It can restart by itself.", "Top up coolant only with Volvo coolant 50/50. Never water alone."] },
    { id: "j-tires", t: "Set tire pressures and calibrate the tire monitor", lvl: 1, min: 15, cost: "Free with your own gauge", tools: ["gauge"], part: "pressure", pg: "305, 314, 387",
      steps: ["Tires cold: parked at least 3 hours or driven under a mile.", "Check all four with your gauge. Your 215/50R17s take 38 psi front and rear. The door-pillar label is the final word.", "Add air at a station, then recheck with your gauge. Never bleed a hot tire to correct it.", "Engine off, ignition mode II.", "MY CAR, Settings, Car settings, Tire monitoring, then OK. Select Calibrate tire pressure and OK.", "Drive away. It calibrates over 12 to 15 minutes above 20 mph, pauses when parked, and gives no confirmation unless it fails."],
      warn: ["Every 10 F drop lowers pressure about 1 psi. Recheck when the seasons change."] },
    { id: "j-wipers", t: "Replace wiper blades", lvl: 1, min: 15, cost: "$30–60 for a pair", tools: [], part: "wipers", pg: "348–350",
      steps: ["Service position: press START/STOP briefly (mode I), press again to switch off, then within 3 seconds push the right stalk up and hold it 1 second. The wipers stand up.", "Fold an arm out from the glass.", "Press the button on the blade attachment and pull the blade straight out along the arm.", "Slide the new blade in until it clicks. Tug to check.", "Lay the arm back on the glass. The driver's blade is the longer one.", "Return the wipers by pressing START/STOP (mode I) or starting the engine.", "Rear blade: fold the arm out, angle the blade, press it forward with your thumb to release, press the new one in."],
      warn: ["Fold the arms back onto the glass before returning them, or they can scratch the hood."] },
    { id: "j-bulb", t: "Replace a headlight bulb (H11 low or H9 high)", lvl: 2, min: 30, cost: "$15–40 per bulb", tools: ["torx", "gloves"], part: "lights", pg: "341–343",
      steps: ["Ignition off, lights off, key out. Let the engine cool.", "Pull out the headlight housing's locking pins.", "Work the housing loose by pulling the front and rear edges alternately, then lift it.", "Unplug the connector: hold the clip down with your thumb and pull the connector, not the wires. Set the housing on a soft surface.", "Loosen the 4 screws on the large cover 3 to 4 turns with a T20 Torx (do not remove them), slide the cover aside.", "Low beam H11: unplug, pull the bulb straight out, fit the new one with the guide lug straight up until it snaps.", "High beam H9: turn counterclockwise to remove, fit the new one clockwise. It fits only one way.", "Refit the cover, plug the connector in until it clicks, seat the housing with the short pin nearest the grille, test the lights."],
      warn: ["Never touch bulb glass with your fingers.", "Active Bending Light (xenon) bulbs are high voltage and contain mercury: workshop only."] },
    { id: "j-jump", t: "Jump-start the car", lvl: 1, min: 10, cost: "Free with cables", tools: ["cables"], part: "battery", pg: "259",
      steps: ["Ignition off (mode 0). If the helper is another car, make sure the cars do not touch.", "Red cable to the helper battery's positive (+).", "Lift the cover over your battery's positive terminal and clip the other red end on.", "Black cable to the helper battery's negative (−).", "Other black end to your car's ground point: the outer screw on top of the right-hand engine mount. Never your battery's negative terminal.", "Start the helper car, then yours.", "Once running, remove black first, then red."],
      warn: ["Batteries give off explosive hydrogen. No sparks or smoking.", "Keep cables away from moving parts and hot manifolds."] },
    { id: "j-wheel", t: "Change a wheel", lvl: 2, min: 30, cost: "Free", tools: ["torque", "breaker"], part: "tread", pg: "299–303",
      steps: ["Parking brake on, P selected, hazard lights on, wheels blocked.", "Take the jack and tools from under the cargo floor (if fitted).", "With the wheel still on the ground, loosen the bolts half to one turn.", "Place the jack at the jack point nearest the wheel on firm level ground and crank until it seats. Check it, then raise until the wheel clears.", "Remove the bolts and wheel, clean the contact faces, fit the other wheel, run the bolts in by hand and snug them crosswise.", "Lower the car, then tighten crosswise to 103 lb-ft.", "Temporary spare: 60 psi, one at a time only. Recalibrate the tire monitor once the normal wheel is back."],
      warn: ["Never put any part of your body under a car held by the jack.", "For anything other than a wheel change, use jack stands."] },
    { id: "j-fuse", t: "Check and replace a fuse", lvl: 1, min: 10, cost: "A few dollars", tools: [], part: "modules", pg: "355–366",
      steps: ["Find the box: engine bay, under the glove compartment, under the cargo floor, or the start/stop cold-zone box.", "The fuse puller is on the underside of the engine bay fuse box cover. The decal inside the lid maps each fuse.", "Pull the fuse straight out and look at the wire from the side. A broken wire means it blew.", "Replace with the same color and amperage."],
      warn: ["Never use a higher amp fuse or metal. A fuse that keeps blowing means a fault to diagnose.", "Engine bay positions 1 to 15, 34 and 42 to 44 are relays or breakers for a technician."] },
    { id: "j-battery", t: "Battery check (and replacement prep)", lvl: 2, min: 15, cost: "Free test at parts stores", tools: ["meter", "charger"], part: "battery", pg: "351–355, 389",
      steps: ["Look at the terminals monthly for white or green crust; it can mean a loose terminal or an old battery.", "With the car off overnight, a healthy battery reads about 12.6 V on a multimeter. Around 12.2 V or less is weak.", "Most parts stores load-test batteries free.", "If replacing: it must be AGM, same cold-cranking rating (800 CCA listed for start/stop cars). Wait 5 minutes after switching off before disconnecting so modules can save data.", "Removal order from the manual: covers off, black negative, red positive, vent hose, clamp. Install in reverse, reconnecting the vent hose."],
      warn: ["Never use a quick charger. Disconnect the battery when charging directly on it.", "Never disconnect with the engine running."] },
    { id: "j-wash", t: "Wash the car the Volvo way", lvl: 1, min: 45, cost: "$10–20 in supplies", tools: [], part: "rust", pg: "367–372",
      steps: ["Out of direct sun, lukewarm water, soft sponge, car-wash soap.", "Pressure washer no closer than about 12 inches; avoid the locks.", "Clean the drain holes in the doors and sills.", "Turn off the rain sensor before an automatic wash.", "Afterward, brake gently a few times (including the parking brake) to dry the brakes.", "Wax only below 113 F paint temperature and not in sun."],
      warn: ["Remove bird droppings quickly; they etch paint in heat."] }
  ];
  var dj = { open: null };
  function data(api) { var d = api.mod("diy"); if (!d) { d = { done: {} }; api.setMod("diy", d); } return d; }
  function render(api) {
    var $ = api.$, esc = api.esc, d = data(api), g = api.mod("glove") || { tools: {} };
    var list = $("djList"), TN = {}; (window.V60_TOOLS || []).forEach(function (t) { TN[t[0]] = t[1]; });
    function tn(t) { return TN[t] || t; }
    if (dj.open) {
      var j = JOBS.filter(function (x) { return x.id === dj.open; })[0];
      var miss = j.tools.filter(function (t) { return !(g.tools || {})[t]; });
      list.innerHTML = '<article class="jobcard" id="djCard"><div class="row"><button type="button" class="quiet" data-dj="back">All jobs</button><button type="button" class="quiet sm" data-speak="#djCard">Listen</button></div><h3>' + esc(j.t) + '</h3><div class="jobmeta"><span class="pill info">Level ' + j.lvl + '</span><span class="status">About ' + j.min + " min · " + esc(j.cost) + " · Manual p. " + esc(j.pg) + "</span></div>" + (j.tools.length ? '<p class="status">Tools: ' + j.tools.map(function (t) { return esc(tn(t)); }).join(", ") + (miss.length ? ' <span class="warnc">(not in your Glovebox tool list: ' + esc(miss.map(tn).join(", ")) + ")</span>" : "") + "</p>" : "") + '<ol class="jsteps">' + j.steps.map(function (s) { return "<li><label><input type=\"checkbox\"> <span>" + esc(s) + "</span></label></li>"; }).join("") + "</ol>" + j.warn.map(function (w) { return '<div class="note">' + esc(w) + "</div>"; }).join("") + '<div class="row"><button type="button" data-djdone="' + j.id + '">' + (d.done[j.id] ? "Done again" : "Mark done") + '</button><span class="status" id="djStatus">' + (d.done[j.id] ? "Last done " + esc(d.done[j.id]) : "") + "</span></div></article>";
      return;
    }
    list.innerHTML = '<ul class="joblist">' + JOBS.map(function (j) { return '<li><button type="button" class="mbtn" data-dj="' + j.id + '"><span class="pill ' + (d.done[j.id] ? "ok" : "none") + '">' + (d.done[j.id] ? "Done" : "Level " + j.lvl) + '</span><span class="mt">' + esc(j.t) + '</span><span class="status">' + j.min + " min</span></button></li>"; }).join("") + "</ul>";
  }
  (window.V60_MODULES = window.V60_MODULES || []).push({
    id: "diy",
    tabs: [{ id: "diy", section: "car", label: "DIY jobs", order: 35, html: '<section><h2>DIY jobs</h2><p class="lede">Step-by-step jobs from Volvo\'s own manual for your car, sorted by difficulty. Tick steps as you go. Marking a job done logs it and earns XP.</p></section><div id="djList"></div>' }],
    clean: function (v) { return v && typeof v === "object" ? { done: v.done || {} } : null; },
    render: function (api) { render(api); },
    init: function (api) {
      api.$("djList").addEventListener("click", function (e) {
        var b = e.target.closest && e.target.closest("button"); if (!b) return;
        var k = b.getAttribute("data-dj");
        if (k === "back") { dj.open = null; render(api); return; }
        if (k) { dj.open = k; render(api); window.scrollTo(0, 0); return; }
        var dn = b.getAttribute("data-djdone");
        if (dn) { var d = data(api), j = JOBS.filter(function (x) { return x.id === dn; })[0]; d.done[dn] = api.todayStr(); if (j.part && api.partById(j.part) && !api.state.rate[j.part]) api.state.rate[j.part] = { r: 4, d: api.todayStr(), n: "DIY job: " + j.t }; api.save(); api.updateHud(); render(api); }
      });
    },
    xp: function (api) { var d = api.mod("diy"); if (!d) return 0; return Object.keys(d.done).reduce(function (s, k) { var j = JOBS.filter(function (x) { return x.id === k; })[0]; return s + (j ? 25 * j.lvl : 0); }, 0); },
    jump: function (api, kind, id) { if (kind === "diy") { dj.open = id; api.go("diy"); return true; } return false; }
  });
})();
