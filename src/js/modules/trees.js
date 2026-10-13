/* Troubleshoot: yes/no decision trees per symptom. Node: {q, y, n} or outcome {r, sev: ok|watch|act|stop, cost, go: [[label, jump]]} */
(function () {
  var T = window.V60_TREES = {
    cel: { t: "Check-engine light is on", start: "a", n: {
      a: { q: "Is the light flashing?", y: "flash", n: "b" },
      flash: { r: "A flashing check-engine light means an active misfire bad enough to damage the catalytic converter. Ease off, avoid hard acceleration and hills, and get the car checked today. If it shakes badly, pull over.", sev: "stop", cost: "Often coils or spark plugs: $150–$600", go: [["Read codes with V60 Link", "tab:live"], ["Misfire in the simulator", "tab:sim"]] },
      b: { q: "Did it come on right after refueling?", y: "cap", n: "c" },
      cap: { r: "Volvo's manual lists a loose fuel cap or refueling with the engine running as triggers. Make sure the cap clicks, then drive normally for a few days. If it stays on, read the code.", sev: "watch", cost: "Free", go: [["Read codes", "tab:live"]] },
      c: { q: "Does the car drive differently: shaking, low power or rough idle?", y: "drive", n: "read" },
      drive: { r: "A steady light with symptoms needs a code read soon. Common on this engine: ignition coils, spark plugs, a vacuum or PCV leak (lean codes like P0171), or boost leaks.", sev: "act", cost: "$100–$600 depending on cause", go: [["Read codes", "tab:live"], ["Look up a code", "tab:diag"]] },
      read: { r: "Not urgent, but read the code within days so a small problem stays small. Look it up in Diagnose before buying anything.", sev: "watch", cost: "Free with your adapter", go: [["Read codes", "tab:live"], ["Look up a code", "tab:diag"]] } } },
    tpms: { t: "Tire pressure light", start: "a", n: {
      a: { q: "When you start the car, does the light flash for about a minute and then stay on?", y: "fault", n: "b" },
      fault: { q: "Is the ABS or stability light also on?", y: "abs", n: "sys" },
      abs: { r: "Your tire monitor reads the ABS wheel-speed sensors, so this points to a wheel-speed sensor or ABS module fault. A shop needs a full-module scan.", sev: "act", cost: "Diagnosis about $160–$230", go: [["Shops in Austin", "kb:a-shops"]] },
      sys: { r: "'Tire press. syst Service required' means a system fault. Volvo bulletin TJ29818 covers false warnings with a software update and checking the hub encoder rings for metal debris.", sev: "watch", cost: "Diagnosis about $160–$230", go: [["Read the article", "kb:a-tpms"]] },
      b: { q: "Are all four tires at 38 psi, cold, on your gauge?", y: "cal", n: "fill" },
      fill: { r: "Inflate all four to 38 psi cold, then calibrate. Check for a nail if one tire keeps dropping.", sev: "watch", cost: "Free", go: [["Do it step by step", "diy:j-tires"]] },
      cal: { r: "The pressures are fine, so the system needs recalibrating. MY CAR, Settings, Car settings, Tire monitoring, Calibrate tire pressure, then drive 12 to 15 minutes above 20 mph.", sev: "ok", cost: "Free", go: [["Step by step", "diy:j-tires"]] } } },
    nostart: { t: "Car won't start", start: "a", n: {
      a: { q: "When you press START, do the dash lights come on brightly?", y: "b", n: "dead" },
      dead: { r: "Very likely a flat battery. Jump-start using the ground point on the right engine mount, then have the battery and charging tested. If the shifter is stuck in P with a dead battery, use the shiftlock override in the console storage behind the shifter.", sev: "act", cost: "Free test; AGM battery about $260–$400", go: [["Jump-start steps", "diy:j-jump"], ["Battery check", "diy:j-battery"]] },
      b: { q: "Does the engine crank (turn over) slowly or just click?", y: "slow", n: "c" },
      slow: { r: "A weak battery or poor connection. Check the terminals, jump-start, then test. A battery that keeps dying after a full charge, or a charging warning, points to the alternator.", sev: "act", cost: "$0–$400", go: [["Battery check", "diy:j-battery"]] },
      c: { q: "Does it crank at normal speed but never fire?", y: "fire", n: "key" },
      fire: { r: "A fuel, ignition or immobilizer problem. Do not keep cranking: after three 10-second tries, wait about 3 minutes. Read codes, then call a shop.", sev: "act", cost: "Varies", go: [["Read codes", "tab:live"]] },
      key: { r: "Nothing happens at all: check the key battery and that the shifter is fully in P, with your foot on the brake. Volvo's manual covers starting with a weak key battery.", sev: "watch", cost: "Key battery a few dollars", go: [] } } },
    hot: { t: "Running hot", start: "a", n: {
      a: { q: "Is there a red temperature or 'Coolant level low' message?", y: "stop", n: "b" },
      stop: { r: "Stop safely and switch off. Let it cool fully before checking the coolant. Driving on can warp the cylinder head.", sev: "stop", cost: "Varies", go: [["Fluids check", "diy:j-fluids"]] },
      b: { q: "Does it only climb in traffic or at idle, and come back down at speed?", y: "fan", n: "c" },
      fan: { r: "Classic cooling-fan failure: at speed, air through the grille cools the radiator. Check whether the fan runs with the A/C on at idle.", sev: "act", cost: "Fan or module about $300–$800", go: [["See it in the simulator", "tab:sim"]] },
      c: { q: "Is the coolant below MIN when cold?", y: "leak", n: "shop" },
      leak: { r: "Look for drips, crusty residue on hoses and a sweet smell. Top up only with Volvo coolant 50/50 and get the leak found.", sev: "act", cost: "Hose $100–$300, more for a water pump", go: [] },
      shop: { r: "Coolant is full but it runs hot: thermostat, water pump or a blockage. Get it checked before a long drive.", sev: "act", cost: "Varies", go: [] } } },
    brakes: { t: "Brake noise or feel", start: "a", n: {
      a: { q: "Does the pedal feel soft or sink toward the floor?", y: "soft", n: "b" },
      soft: { r: "Do not drive. Possible fluid leak or air in the system. Check brake fluid; if below MIN, Volvo says have it towed.", sev: "stop", cost: "Varies", go: [["Fluids check", "diy:j-fluids"]] },
      b: { q: "Is it a harsh grinding noise?", y: "grind", n: "c" },
      grind: { r: "Metal on metal. The pads are likely worn through. Stop driving as soon as practical and get them replaced; the rotors may be damaged.", sev: "stop", cost: "Pads and rotors about $400–$900 per axle", go: [] },
      c: { q: "Is it a high squeal when braking lightly?", y: "squeal", n: "d" },
      squeal: { r: "Often the pad wear indicator. Book a brake inspection soon.", sev: "watch", cost: "Pads about $350–$475 per axle", go: [] },
      d: { q: "Does the steering wheel or pedal pulse when braking?", y: "pulse", n: "ok" },
      pulse: { r: "Usually uneven rotors. Not an emergency, but have them measured.", sev: "watch", cost: "Rotors with pads about $400–$900 per axle", go: [] },
      ok: { r: "Describe what you notice to a shop. Brake issues are never worth guessing on.", sev: "watch", cost: "Inspection often free with service", go: [] } } },
    oil: { t: "Low oil message or using oil", start: "a", n: {
      a: { q: "Are there fresh oil spots under the car?", y: "leak", n: "b" },
      leak: { r: "An external leak. Common places on older engines: valve cover gasket, oil filter housing, oil pan. Clean, drive, and look again to find the source.", sev: "act", cost: "$150–$600 typical", go: [] },
      b: { q: "Are you adding more than about half a quart per 1,000 miles?", y: "burn", n: "fine" },
      burn: { r: "Internal consumption, the known issue on some 2015 and 2016 Drive-E engines (piston rings). Keep a log of every top-up with mileage: that is your evidence. Watch for oil-fouled spark plugs.", sev: "act", cost: "Ring repair is a major job; get quotes", go: [["Oil article", "kb:a-oil"], ["Oil watch log", "tab:records"]] },
      fine: { r: "Normal. Keep checking monthly in the instrument cluster and logging top-ups.", sev: "ok", cost: "Free", go: [["Oil check steps", "diy:j-oilcheck"]] } } },
    vibe: { t: "Vibration or shaking", start: "a", n: {
      a: { q: "Mainly at highway speed, around 55 to 70 mph?", y: "bal", n: "b" },
      bal: { r: "Usually wheel balance or a damaged tire. Cheap to fix.", sev: "watch", cost: "Balance about $60–$100", go: [] },
      b: { q: "Mainly when braking?", y: "rot", n: "c" },
      rot: { r: "Most likely uneven brake rotors.", sev: "watch", cost: "$400–$900 per axle with pads", go: [] },
      c: { q: "Mainly at idle, stopped in gear?", y: "idle", n: "shop" },
      idle: { r: "A misfire or worn engine mounts. Read codes first; if clean, have the mounts inspected.", sev: "watch", cost: "Varies", go: [["Read codes", "tab:live"]] },
      shop: { r: "Note the speed, gear and whether it changes on turns, then have it road-tested.", sev: "watch", cost: "Varies", go: [] } } },
    ss: { t: "Start/stop isn't stopping the engine", start: "a", n: {
      a: { q: "Is there an 'Auto Start/Stop Service required' message?", y: "svc", n: "b" },
      svc: { r: "A system fault, often battery-related on these cars (main AGM or the small support battery). Have the batteries tested.", sev: "watch", cost: "Testing free to about $150", go: [["Battery check", "diy:j-battery"]] },
      b: { q: "Is it very hot or cold outside, the engine not warm, or the blower on high?", y: "normal", n: "c" },
      normal: { r: "Normal behavior. Start/stop holds off below about 25 F or above about 85 F, until the engine and transmission are warm, and when the climate system needs the engine.", sev: "ok", cost: "Free", go: [["Start/stop article", "kb:a-startstop"]] },
      c: { q: "Is the battery older than about 4 years, or is the car often driven short trips?", y: "batt", n: "fine" },
      batt: { r: "Low battery charge stops start/stop working first. A longer drive or a smart charger with AGM mode often brings it back. Test the battery.", sev: "watch", cost: "Free test", go: [["Battery check", "diy:j-battery"]] },
      fine: { r: "Check that the Start/Stop button light is on and the driver's belt is fastened. If it never stops, mention it at the next service.", sev: "ok", cost: "Free", go: [] } } }
  };
  var tr = { tree: null, path: [] };
  var SEV = { ok: ["ok", "Fine"], watch: ["watch", "Soon"], act: ["concern", "Act"], stop: ["concern", "Stop driving"] };
  function render(api) {
    var esc = api.esc, box = api.$("trBox");
    if (!tr.tree) { box.innerHTML = '<ul class="joblist">' + Object.keys(T).map(function (k) { return '<li><button type="button" class="mbtn" data-tree="' + k + '"><span class="pill info">Guide</span><span class="mt">' + esc(T[k].t) + "</span><span></span></button></li>"; }).join("") + "</ul>"; return; }
    var t = T[tr.tree], id = tr.path[tr.path.length - 1], node = t.n[id];
    var crumbs = tr.path.slice(0, -1).map(function (p, i) { var nd = t.n[p]; var ans = t.n[p].y === tr.path[i + 1] ? "Yes" : "No"; return "<li>" + esc(nd.q) + " <b>" + ans + "</b></li>"; }).join("");
    var html = '<div class="tree"><button type="button" class="quiet" data-tr="back">All guides</button><h3>' + esc(t.t) + "</h3>" + (crumbs ? '<ol class="crumbs">' + crumbs + "</ol>" : "");
    if (node.q) html += '<div class="tq"><p class="fc-q">' + esc(node.q) + '</p><div class="row"><button type="button" data-ans="y">Yes</button><button type="button" class="quiet" data-ans="n">No</button>' + (tr.path.length > 1 ? '<button type="button" class="quiet" data-tr="undo">Back a step</button>' : "") + "</div></div>";
    else { var s = SEV[node.sev]; html += '<div class="tres ' + node.sev + '"><span class="pill ' + s[0] + '">' + s[1] + "</span><p>" + esc(node.r) + '</p><p class="status">Typical cost: ' + esc(node.cost) + '</p><div class="row">' + (node.go || []).map(function (g) { return '<button type="button" class="quiet" data-jump="' + esc(g[1]) + '">' + esc(g[0]) + "</button>"; }).join("") + '<button type="button" class="quiet" data-tr="undo">Back a step</button></div></div>'; }
    box.innerHTML = html + "</div>";
  }
  (window.V60_MODULES = window.V60_MODULES || []).push({
    id: "trees",
    tabs: [{ id: "trouble", section: "check", label: "Troubleshoot", order: 25, html: '<section><h2>Troubleshoot</h2><p class="lede">Pick what is happening. Answer yes or no and the guide narrows it down to a likely cause, how urgent it is, and what it usually costs. A guide is not a diagnosis.</p></section><div id="trBox"></div>' }],
    render: function (api) { render(api); },
    init: function (api) {
      api.$("trBox").addEventListener("click", function (e) {
        var b = e.target.closest && e.target.closest("button"); if (!b || b.hasAttribute("data-jump")) return;
        if (b.hasAttribute("data-tree")) { tr.tree = b.getAttribute("data-tree"); tr.path = [T[tr.tree].start]; }
        else if (b.getAttribute("data-tr") === "back") { tr.tree = null; tr.path = []; }
        else if (b.getAttribute("data-tr") === "undo") { if (tr.path.length > 1) tr.path.pop(); }
        else if (b.hasAttribute("data-ans")) { var nd = T[tr.tree].n[tr.path[tr.path.length - 1]]; tr.path.push(nd[b.getAttribute("data-ans")]); }
        render(api);
      });
    },
    jump: function (api, kind, id) { if (kind === "tree" && T[id]) { tr.tree = id; tr.path = [T[id].start]; api.go("trouble"); return true; } return false; }
  });
})();
