/* Story mode: "The As-Is File". The main story drives the whole app: each case reveals the tabs it needs, acts unlock side
   missions, and nothing else is shown until the story reaches it (unless "Show everything" is on). Also owns The File
   (a dossier built from logged data), the Codebook (decoding the adapter's raw signals) and the knowledge unlocks.
   Lars, the narrator, is fictional; every fact he states is sourced elsewhere in the app. */
(function () {
  var CAR = '<path class="ln" d="M60 250 L56 214 Q60 196 96 190 L214 180 L304 130 Q316 124 332 124 L512 124 Q556 128 598 162 L638 194 Q658 202 662 222 L664 250 Z"/><path class="ln thin" d="M226 176 L304 136 L360 136 L360 176 Z M372 136 L506 136 Q542 140 576 168 L588 176 L372 176 Z"/><circle class="ln" cx="170" cy="252" r="38"/><circle class="ln" cx="560" cy="252" r="38"/><circle class="ln thin" cx="170" cy="252" r="16"/><circle class="ln thin" cx="560" cy="252" r="16"/>';
  var SCENES = {
    road: '<g class="sc-road"><line class="lane" x1="0" y1="312" x2="720" y2="312"/><line class="ground" x1="0" y1="292" x2="720" y2="292"/>' + '<g class="carmove">' + CAR + '<path class="beam" d="M664 214 L720 196 L720 250 Z"/></g></g>',
    car: '<g class="draw">' + CAR + '<line class="ground" x1="20" y1="292" x2="700" y2="292"/></g>',
    bay: '<g class="draw"><path class="ln" d="M120 60 Q360 30 600 60 L612 300 Q360 326 108 300 Z"/><rect class="ln" x="160" y="74" width="400" height="24" rx="5"/><rect class="ln" x="250" y="140" width="230" height="120" rx="14"/><rect class="ln thin" x="136" y="140" width="80" height="70" rx="6"/><rect class="ln thin" x="500" y="236" width="60" height="40" rx="8"/><circle class="ln thin" cx="300" cy="180" r="12"/><text class="q" x="410" y="210">?</text></g>',
    papers: '<g class="draw"><rect class="ln" x="250" y="70" width="190" height="240" rx="8" transform="rotate(-6 345 190)"/><rect class="ln" x="270" y="60" width="190" height="240" rx="8" transform="rotate(4 365 180)"/><text class="q big" x="345" y="215">?</text></g>',
    belt: '<g class="draw spin"><circle class="ln" cx="300" cy="180" r="70"/><circle class="ln" cx="470" cy="150" r="46"/><path class="ln" d="M300 110 L470 104 M300 250 L476 196"/><circle class="ln thin" cx="300" cy="180" r="12"/><circle class="ln thin" cx="470" cy="150" r="10"/></g>',
    scan: '<g class="draw"><rect class="ln" x="230" y="150" width="140" height="70" rx="10"/><path class="ln thin" d="M250 175h100M250 195h100"/><g class="waves"><path class="ln" d="M400 140 Q430 185 400 230"/><path class="ln" d="M430 120 Q480 185 430 250"/><path class="ln" d="M460 100 Q530 185 460 270"/></g><rect class="ln" x="560" y="120" width="70" height="130" rx="12"/></g>',
    gauge: '<g class="draw"><path class="ln" d="M220 280 A140 140 0 0 1 500 280"/><g class="needle"><line class="ln" x1="360" y1="280" x2="360" y2="160"/></g><circle class="ln" cx="360" cy="280" r="10"/></g>',
    tires: '<g class="draw"><circle class="ln" cx="360" cy="190" r="110"/><circle class="ln thin" cx="360" cy="190" r="70"/><text class="mono" x="360" y="96">DOT 2419</text><path class="ln thin" d="M260 150 L300 160 M250 200 L292 200 M262 246 L302 232"/></g>',
    wrench: '<g class="draw spin"><path class="ln" d="M300 260 L420 140 M408 112 A30 30 0 1 0 448 152 L430 140 L420 130 Z"/></g>',
    wave: '<g class="draw"><path class="ln" d="M120 190 Q160 120 200 190 T280 190 T360 190 T440 190 T520 190 T600 190"/><path class="ln thin" d="M120 230 Q170 200 220 230 T320 230 T420 230 T520 230 T600 230"/></g>',
    badge: '<g class="draw glow"><path class="ln" d="M360 70 L400 120 L460 120 L430 170 L450 230 L360 200 L270 230 L290 170 L260 120 L320 120 Z"/><text class="mono" x="360" y="280">V60 MASTER</text></g>'
  };
  SCENES.device = '<g class="draw"><rect class="ln" x="290" y="150" width="140" height="80" rx="14"/><path class="ln thin" d="M310 230 v26 M410 230 v26 M330 256 h60"/><circle class="ln" cx="406" cy="172" r="6"/><g class="waves"><path class="ln" d="M460 150 Q490 190 460 230"/><path class="ln" d="M490 130 Q540 190 490 250"/><path class="ln" d="M520 110 Q590 190 520 270"/></g><text class="mono" x="360" y="110">P0??? · PID 0C · 0x41</text></g>';
  SCENES.map = '<g class="draw"><path class="ln" d="M150 90 L290 60 L430 90 L570 60 L570 270 L430 300 L290 270 L150 300 Z"/><path class="ln thin" d="M290 60 V270 M430 90 V300"/><circle class="ln" cx="360" cy="180" r="18"/><text class="q" x="360" y="200">+</text></g>';
  SCENES.file = '<g class="draw"><path class="ln" d="M220 90 H330 L350 110 H500 V290 H220 Z"/><path class="ln thin" d="M250 150 H470 M250 180 H470 M250 210 H420 M250 240 H450"/><text class="mono" x="360" y="80">THE AS-IS FILE</text></g>';

  /* ---------- helpers that read evidence from the rest of the app ---------- */
  function D(api) {
    var d = api.mod("story"); if (!d) { d = {}; api.setMod("story", d); }
    ["seen", "closed", "manual", "beats", "avail", "revealed", "fresh", "known", "read", "cb", "quiz"].forEach(function (k) { if (!d[k] || typeof d[k] !== "object" || Array.isArray(d[k])) d[k] = {}; });
    if (!Array.isArray(d.pending)) d.pending = [];
    if (!d.depth) d.depth = "det";
    return d;
  }
  function M(api, id) { var x = api.acad().done[id]; return !!(x && x.outcome !== "skip"); }
  function man(api, k) { return !!D(api).manual[k]; }
  function mod(api, id, def) { return api.mod(id) || def; }
  function receipts(api) { return (mod(api, "glove", {}).receipts || []).length; }
  function tools(api) { var t = mod(api, "glove", {}).tools || {}; return Object.keys(t).filter(function (k) { return t[k]; }).length; }
  function diyDone(api, id) { var d = mod(api, "diy", { done: {} }).done || {}; return id ? !!d[id] : Object.keys(d).length; }
  function tsbMark(api, id) { return (mod(api, "tsb", { mark: {} }).mark || {})[id]; }
  function buildMonth(api) { return mod(api, "tsb", {}).build || ""; }
  function recallsDone(api) { var rs = api.state.recalls || {}; return api.RECALLS.every(function (r) { return rs[r.id] && rs[r.id] !== "unknown"; }); }
  function scans(api, real) {
    var L = mod(api, "live", { scans: [] }).scans || [], ls = api.state.lastScan;
    if (!real) return L.length || (ls ? 1 : 0);
    var n = L.filter(function (x) { return !x.sim; }).length; if (n) return n; if (!ls) return 0;
    /* a simulated scan saved to the Garage also sets lastScan; don't count that as the real car */
    return L.some(function (x) { return x.sim && String(x.date).slice(0, 10) === String(ls.date).slice(0, 10); }) ? 0 : 1;
  }
  function oil(api) { return api.oilRate(); }
  function decodedN(api) { var cb = D(api).cb; return Object.keys(cb).filter(function (k) { return cb[k].dec; }).length; }
  function plural(n, w) { return n + " " + w + (n === 1 ? "" : "s"); }
  var NH = "https://static.nhtsa.gov/odi/tsbs/";

  /* ---------- the case file ---------- */
  var ACTS = [["1", "Arrival"], ["2", "The Unknowns"], ["3", "The Voice"], ["4", "Ownership"]];
  var ACT_REWARD = {
    "1": { tabs: ["bay", "health", "cards", "skills", "learn"], line: "Act 1 complete. The whole-car map, your Health score, How it works, daily flashcards and the skill tree are open." },
    "2": { tabs: ["achieve", "unlocks"], line: "Act 2 complete. Side missions are open: seasonal events and achievements. Unlocks lists what this app cannot do and who can." },
    "3": { tabs: ["sim"], line: "Act 3 complete. Side mission: the Simulator and its mystery cars." },
    "4": { tabs: ["exam"], line: "Act 4 complete. The V60 Master exam is open. Pass it to reach the finale." }
  };
  var TABN = { skills: "Skill tree", academy: "Training", engine: "Engine bay", live: "Live link", bay: "Whole car", health: "Health", cards: "Flashcards", records: "Service log", glove: "Glovebox", fuel: "Fuel & costs", diy: "DIY jobs", trouble: "Troubleshoot", bulletins: "Bulletins", my: "My V60", kb: "Library", achieve: "Achievements", lab: "Data lab", sim: "Simulator", upgrades: "Upgrades", diag: "Diagnose", exam: "Exam", learn: "How it works", unlocks: "Unlocks" };
  var CASES = [
    { id: "safe", act: "1", crit: true, t: "Safe to Touch", sub: "Learn the car's layout and the rules before touching anything.", scene: "bay", reveals: ["academy", "engine"],
      know: { arts: ["a-car", "a-lights"], tags: ["Identity", "Basics", "Safety", "Warning lights"] }, quiz: ["f-fan6", "f-hoodss", "f-coolloc"],
      brief: { why: "You have never opened the hood. Before checking anything, learn where things are and the few rules that keep you from getting hurt.", mech: "Volvo's manual flags two hazards on this car: with start/stop the engine can restart by itself if it is only auto-stopped, and the electric cooling fan can run for up to 6 minutes after shutdown. The cooling system is pressurized when hot.", time: "About 20 minutes", cost: "Free", tools: "A flashlight", risk: "Getting hurt, or opening the wrong cap while the engine is hot.", src: ["om", "hood"] },
      steps: [
        { t: "Learn the four jobs every car does", why: "Engine, fluids, control and electrics. Every check in this app belongs to one of them.", stage: "lead", ok: function (a) { return M(a, "m-sys"); }, go: "mission:m-sys" },
        { t: "Read the safety rules", why: "Car fully off, key out of the cabin, engine cool.", mech: "Fully off means ignition off, not paused by start/stop. Volvo's manual says the engine can auto-start without warning.", stage: "lead", ok: function (a) { return M(a, "m-safe"); }, go: "mission:m-safe" },
        { t: "Open the hood", why: "A handle under the left side of the dash, then a catch at the front edge of the hood.", mech: "Turn the handle about 20 to 25 degrees clockwise, lift the hood slightly, then push the catch near the front right edge to the left.", stage: "evidence", ok: function (a) { return M(a, "m-hood"); }, go: "mission:m-hood", where: "catch" },
        { t: "Find the key landmarks", why: "Oil filler cap, coolant tank, brake fluid, washer fluid and the battery covers.", mech: "Coolant tank on the passenger side; brake fluid under a round cover at the rear on the driver's side. Check both cold, without opening them.", stage: "evidence", ok: function (a) { return M(a, "m-five"); }, go: "mission:m-five", where: "oilcap" }],
      close: function (a) { return M(a, "m-safe") && M(a, "m-hood") && M(a, "m-five"); },
      result: function () { return [["bay", "The hood is open. Oil, coolant, brake fluid and washer fluid each have a place, and now you know them."], ["wave", "Lars: One rule from Volvo's own manual. Never open the hood while start/stop has the engine paused. It can restart by itself."]]; } },
    { id: "signal", act: "1", crit: true, t: "The Signal", sub: "A small box that speaks the car's language. You don't, yet.", scene: "device", reveals: ["live"],
      know: { arts: ["a-obd", "a-vida"], tags: ["Diagnostics"] }, quiz: ["f-obd", "f-adapter", "f-modules"],
      brief: { why: "Your adapter plugs into a port every car since 1996 has under the dash. It reads what the engine computer knows: trouble codes, live sensor readings and emissions self-tests. At first everything it says is a raw code. Each one you decode goes into your Codebook and shows in plain words from then on.", mech: "It speaks standard OBD-II over Bluetooth LE: live data, freeze frame, stored, pending and permanent codes, clearing codes, and the VIN. It cannot reach airbag, ABS, climate or body modules, which use Volvo's own diagnostics (VIDA).", time: "About 20 minutes", cost: "Free (you own the adapter)", tools: "OBDLink CX and the free Bluefy browser on your iPhone", risk: "Without it, problems stay invisible until a warning light comes on.", src: ["cx", "vida"] },
      steps: [
        { t: "Learn what the box can and can't hear", why: "Engine and emissions data, yes. Airbags, ABS and body electronics, no.", stage: "lead", ok: function (a) { return M(a, "m-obd"); }, go: "mission:m-obd" },
        { t: "Find the port under the dash", why: "Under the dashboard on the driver's side.", stage: "lead", ok: function (a) { return M(a, "m-port"); }, go: "mission:m-port" },
        { t: "Practice with the simulated car", why: "Live link has a simulated V60, so you can learn the screens before plugging into the real car.", stage: "lead", optional: true, ok: function (a) { return scans(a, false) > 0; }, go: "tab:live" },
        { t: "Connect in Bluefy and run a health check", why: "Engine off with the ignition on is fine for reading codes. Don't pair the adapter in iPhone settings; Live link finds it directly.", mech: "The CX accepts a new connection only in the first 5 minutes after it powers up. If it doesn't appear, unplug it, plug it back in and connect right away.", stage: "evidence", ok: function (a) { return scans(a, true) > 0; }, go: "tab:live" },
        { t: "Decode 5 signals", why: "Tap Decode next to any raw label. The meaning goes into your Codebook and the label switches to plain words.", stage: "evidence", ok: function (a) { return decodedN(a) >= 5; }, go: "tab:live", prog: function (a) { return Math.min(5, decodedN(a)) + " of 5 decoded"; } }],
      close: function (a) { return scans(a, true) > 0 && decodedN(a) >= 5; },
      result: function (a) { var s = a.state.lastScan; return [["device", "The box is talking, and you can read " + plural(decodedN(a), "signal") + " of what it says."], ["scan", s ? "First real check: check-engine light " + (s.mil ? "on" : "off") + ", " + plural(s.codes || 0, "code") + " reported." : "First real health check saved."], ["wave", "Lars: Most owners never hear this. Every time something changes, it shows up here first."]]; } },
    { id: "belt", act: "2", crit: true, t: "The Belt", sub: "Nobody can say whether the timing belt was ever replaced.", scene: "belt", reveals: ["records", "glove", "docs"],
      know: { arts: ["a-belt", "a-schedule", "a-shops", "a-ase"], tags: ["Maintenance"] }, quiz: ["f-belt", "f-beltint", "f-plugs"],
      brief: { why: "Your engine is an interference design: if the timing belt breaks, valves and pistons collide and the engine is usually destroyed. Volvo's schedule lists the belt kit at 150,000 miles or 10 years, and your car turns 10 in 2026.", mech: "The 2016 US schedule lists the timing belt tensioner and idler at 150,000 miles or 10 years; shops replace the belt with them as a kit. Bulletin TJ29131 adds that oil leaking from the cam pulley plugs can soak the belt on engines built through mid-August 2016.", time: "An hour of searching, then a shop visit", cost: "Searching is free. RepairPal lists about $740–$990 for the belt alone; a full kit costs more.", tools: "None", risk: "A snapped belt usually means a new engine.", src: ["ms", "acr", "repairpal"] },
      steps: [
        { t: "Hunt for service records", why: "Glovebox paperwork, the seller, and any Volvo dealer, which can look up dealer service history by VIN.", stage: "lead", ok: function (a) { return M(a, "m-hist"); }, go: "mission:m-hist" },
        { t: "Work through the timing belt detective mission", why: "Where proof of a belt job usually shows up, and what to ask.", stage: "lead", ok: function (a) { return M(a, "m-belt"); }, go: "mission:m-belt", where: "belt" },
        { t: "Add any receipt you find", why: "The receipt scanner in Glovebox reads the date, mileage and work done.", stage: "lead", ok: function (a) { return receipts(a) > 0; }, go: "tab:glove" },
        { t: "Book a baseline inspection at a Volvo specialist", why: "Ask them to check the belt and look for oil at the cam pulleys.", mech: "Mention bulletin TJ29131 (VVT pulley plugs, part 31375877) when you book.", stage: "evidence", ok: function (a) { return M(a, "m-ppi"); }, go: "kb:a-shops" },
        { t: "Log the belt service, or a shop's written confirmation", why: "Once it's in the service log, the next due date is tracked for you.", stage: "evidence", ok: function (a) { return !!a.lastFor("timingbelt"); }, go: "tab:records" }],
      close: function (a) { return !!a.lastFor("timingbelt"); },
      result: function (a) { var e = a.lastFor("timingbelt"); return [["belt", "Belt record found: " + e.date + (e.miles ? " at " + a.fmt(e.miles) + " miles" : "") + "."], ["papers", "The service log now tracks when the next one is due."], ["wave", "Lars: That was the biggest unknown on this car. Now it's a date on a calendar instead of a gamble."]]; } },
    { id: "thirst", act: "2", crit: true, t: "The Thirst", sub: "Some 2015–16 Drive-E engines burn oil. Does yours?", scene: "gauge", reveals: ["fuel"],
      know: { arts: ["a-oil", "a-drivee", "a-oilprogram", "a-complaints"], tags: ["Engine", "Fluids", "Fuel"] }, quiz: ["f-dip", "f-oilcap", "f-rings"],
      brief: { why: "Owner complaints about 2015–16 Drive-E engines center on burning oil, and Volvo's bulletin TJ31216 replaces pistons and rings on engines built from late 2013 to January 2016. Your car has no dipstick, so the only way to know is to log the level over time.", mech: "Volvo's extended warranty for this (P10186) ran 8 years from first delivery, so it has very likely expired on your car. Capacity is 6.2 US quarts with the filter; full synthetic ACEA A5/B5 5W-30, or Volvo's 0W-20.", time: "2 minutes per check, across about 1,000 miles", cost: "Free, plus oil if it needs topping up", tools: "None", risk: "Running low damages the engine, and with no dipstick it can go unnoticed.", src: ["om", ["Volvo bulletin TJ31216", NH + "2019/MC-10169029-9999.pdf"]] },
      steps: [
        { t: "Learn to read the oil level in the instrument cluster", why: "Ignition in mode II, then the thumb wheel on the left stalk to Oil level.", mech: "Most accurate after about 20 miles of driving, or parked level for a few minutes. 'No values available' only means the conditions aren't met yet.", stage: "lead", ok: function (a) { return M(a, "m-oil"); }, go: "mission:m-oil", where: "oilcap" },
        { t: "Log your first oil level check", why: "Right after an oil change is the cleanest starting point.", stage: "lead", ok: function (a) { return a.state.oil.length > 0; }, go: "tab:records" },
        { t: "Read about bulletin TJ31216", why: "Know what the dealer fix is before you might need it.", stage: "lead", manual: "r31216", go: "kb:a-tsb" },
        { t: "Keep logging checks across at least 1,000 miles", why: "Every top-up you log turns into a quarts-per-1,000-miles number. That's the figure a shop will ask for.", stage: "evidence", ok: function (a) { var r = oil(a); return !!(r && r.span >= 1000); }, go: "tab:records", prog: function (a) { var r = oil(a); return r ? a.fmt(r.span) + " of 1,000 mi" : "Needs two checks to start"; } }],
      close: function (a) { var r = oil(a); return !!(r && r.span >= 1000); },
      result: function (a) { var r = oil(a); return [["gauge", r.added ? r.added + " quart" + (r.added === 1 ? "" : "s") + " added over " + a.fmt(r.span) + " miles: " + r.rate.toFixed(2) + " per 1,000 miles." : "No oil added over " + a.fmt(r.span) + " miles."], ["wave", r.added ? "Lars: That number is your evidence. Keep logging. If it climbs, bring the log and bulletin TJ31216 to a shop." : "Lars: No top-ups at all. Keep checking monthly. Ring wear, if it comes, shows up slowly."]]; } },
    { id: "light", act: "2", crit: true, t: "The Light That Won't Go Out", sub: "The tire pressure light has been on since you bought the car.", scene: "tires", reveals: ["diy", "trouble"],
      know: { arts: ["a-tpms", "a-tpmshow", "a-tirekit"], tags: ["Tires"] }, quiz: ["f-tpms", "f-calib", "f-psi"],
      brief: { why: "Your tire monitor has no sensors in the wheels. It compares wheel speeds through the ABS sensors, so it has to learn what normal is by being calibrated at the right pressures. A light that's always on also hides a real puncture.", mech: "Volvo bulletin TJ29818: tires within 5% rolling circumference of each other, cold pressures from the door-pillar label, calibrate, recalibrate after every pressure change and every 10,000 miles, then check for vibration, worn shocks and metal debris on the hub encoder rings.", time: "30 minutes including a 15-minute drive", cost: "Free", tools: "A tire pressure gauge", risk: "A real slow leak looks the same as the false alarm.", src: ["tpms", "tsb29818", "om"] },
      steps: [
        { t: "Learn how the tire monitor reads wheel speeds", why: "Why your car's system behaves differently from most.", stage: "lead", ok: function (a) { return M(a, "m-tires"); }, go: "mission:m-tires" },
        { t: "Record all four pressures cold", why: "Cold means parked 3 hours or driven under a mile. Your 215/50R17s take 38 psi front and rear; the door-pillar label is the final word.", stage: "lead", ok: function (a) { return M(a, "m-psi"); }, go: "mission:m-psi" },
        { t: "Check tread depth and tire age", why: "Volvo's manual says replace after 6 years regardless of tread. Uneven wear also confuses the monitor.", stage: "lead", ok: function (a) { return M(a, "m-tread"); }, go: "mission:m-tread" },
        { t: "Set 38 psi and calibrate the monitor", why: "MY CAR, Settings, Car settings, Tire monitoring, Calibrate tire pressure.", mech: "Ignition in mode II with the engine off to start the calibration, then drive.", stage: "evidence", ok: function (a) { return diyDone(a, "j-tires"); }, go: "diy:j-tires" },
        { t: "Drive 15 minutes, then confirm the light stays off", why: "Calibration runs above 20 mph and gives no confirmation unless it fails.", stage: "evidence", manual: "lightoff", go: "tree:tpms" }],
      close: function (a) { return man(a, "lightoff") || (diyDone(a, "j-tires") && /^(ask|have)$/.test(tsbMark(a, "TJ29818") || "")); },
      result: function (a) { return man(a, "lightoff") ? [["tires", "Calibrated. The light is off."], ["wave", "Lars: This car compares wheel speeds instead of measuring pressure, so recalibrate after every pressure change and every 10,000 miles. That's straight from Volvo's bulletin."]] : [["tires", "The calibration didn't hold."], ["papers", "Lars: That's what bulletin TJ29818 is for, and it's on your shop note. Matched tires first, then the wheel-speed encoder rings."]]; } },
    { id: "paper", act: "2", crit: true, t: "The Paper Trail", sub: "Recalls, bulletins and factory records that follow this car.", scene: "papers", reveals: ["bulletins", "my", "kb"],
      know: { arts: ["a-recalls", "a-tsb", "a-trim", "a-safety"], tags: ["Recalls", "Ownership"] }, quiz: ["f-recall", "f-rec1", "f-tsbcode"],
      brief: { why: "Four safety recalls touched 2016 V60s, and recall repairs are free at any Volvo dealer. Several repair bulletins only cover cars built before a certain week, so your build month decides which ones apply.", mech: "Recalls 20V378 (front seat belt cable), 19V849 (door latches), 16V798 (passenger belt buckle stud, built Feb 2015 to Aug 2016) and 15V555 (start/stop starter fuse, built Apr to Aug 2015). Service action S29842 replaced spark plugs free on 2015–16 four-cylinders.", time: "30 minutes plus a dealer call", cost: "Free", tools: "Your VIN, on the base of the windshield and the door pillar", risk: "Missing a free safety repair.", src: ["nhtsa"] },
      steps: [
        { t: "Learn how recalls work", why: "Recalls are free safety repairs. Bulletins are repair instructions you usually pay for.", stage: "lead", ok: function (a) { return M(a, "m-recall"); }, go: "mission:m-recall" },
        { t: "Set every recall to done or not applicable", why: "Check your VIN at nhtsa.gov/recalls or call Volvo at 1-800-458-1552.", stage: "evidence", ok: recallsDone, go: "tab:my" },
        { t: "Enter your build month from the door-pillar label", why: "It's printed on the label on the driver's door pillar. Open the driver's door, photograph the label, and the app reads the month on your phone.", stage: "evidence", ok: function (a) { return !!buildMonth(a); }, go: "tab:bulletins" },
        { t: "Ask a Volvo dealer to check service action S29842 (spark plugs) by VIN", why: "A free plug replacement may or may not have been done on your car.", stage: "evidence", manual: "s29842", go: "tsb:S29842" },
        { t: "Ask for the factory option list by VIN", why: "Settles which packages your car actually has.", stage: "lead", manual: "options", optional: true, go: "kb:a-trim" }],
      close: function (a) { return recallsDone(a) && !!buildMonth(a) && man(a, "s29842"); },
      result: function (a) { return [["papers", "Recalls settled. Build month " + buildMonth(a) + " is on file, so the Bulletins tab knows which production ranges cover your car."], ["wave", "Lars: Paperwork is dull right up until a free repair is sitting in it."]]; } },
    { id: "baseline", act: "3", crit: true, t: "Baseline", sub: "Learn what normal looks like for this car, so you notice when it changes.", scene: "scan", reveals: ["lab"],
      know: { arts: ["a-trans", "a-startstop", "a-inspect"], tags: ["Drivetrain", "Specs", "Inspection"] }, quiz: ["f-ready", "f-insp", "f-clear"],
      brief: { why: "Live readings only mean something once you know your car's normal. Three ordinary drives recorded in the Data lab become the baseline every future drive is compared with.", mech: "The Data lab compares fuel trims, coolant warm-up, voltage, idle speed and boost against your saved runs. For a Texas emissions test, a 2001-or-newer car may have at most one readiness monitor not ready (40 CFR 85.2222).", time: "Three normal drives of 20 minutes or more", cost: "Free", tools: "Your adapter", risk: "Without a baseline you can't tell a change from normal.", src: ["cfr", "dps"] },
      steps: [
        { t: "Record your first baseline drive", why: "A normal drive with a mix of speeds, recorded in Live link and opened in the Data lab.", stage: "lead", ok: function (a) { return M(a, "m-log"); }, go: "mission:m-log" },
        { t: "Save three real drives in the Data lab", why: "Three runs smooth out one-off conditions like heat or traffic.", stage: "evidence", ok: function (a) { return a.state.runs.length >= 3; }, go: "tab:lab", prog: function (a) { return Math.min(3, a.state.runs.length) + " of 3"; } },
        { t: "Readiness: at most one monitor not ready", why: "The drive-cycle coach in Live link shows what helps unfinished monitors complete.", stage: "evidence", optional: true, ok: function (a) { var s = a.state.lastScan; return !!(s && (s.notReady || []).length <= 1); }, go: "tab:live" }],
      close: function (a) { return scans(a, true) > 0 && a.state.runs.length >= 3; },
      result: function (a) { var s = a.state.lastScan; return [["scan", s ? "Last health check: check-engine light " + (s.mil ? "on" : "off") + ", " + plural(s.codes || 0, "code") + ", " + plural((s.notReady || []).length, "monitor") + " not ready." : "Baseline saved."], ["wave", "Lars: Now you know what normal looks like for this car. Everything from here gets compared against it."]]; } },
    { id: "wrench", act: "4", crit: false, t: "First Wrench", sub: "Your first real job on the car.", scene: "wrench", reveals: ["upgrades"],
      know: { arts: ["a-fuses", "a-wash"], tags: ["Electrical"] }, quiz: ["f-air", "f-lug", "f-wiper"],
      brief: { why: "The first job on the car yourself, following Volvo's own procedures from the owner's manual.", mech: "Ten job cards from the 2016 US manual, from fluid checks to a wheel change (wheel bolts 103 lb-ft, tightened crosswise).", time: "15 to 60 minutes", cost: "Depends on the job", tools: "The starter kit in Glovebox", risk: "Low if you follow the steps; each job card flags the dangerous parts.", src: ["om"] },
      steps: [
        { t: "Build a starter tool kit (5 tools)", why: "Glovebox lists what each tool is for. Tick what you own.", stage: "lead", ok: function (a) { return tools(a) >= 5; }, go: "tab:glove", prog: function (a) { return Math.min(5, tools(a)) + " of 5"; } },
        { t: "Inspect the engine air filter", why: "A box at the front of the engine bay; the filter is inspected without tools on most cars.", stage: "lead", ok: function (a) { return M(a, "m-airf"); }, go: "mission:m-airf", where: "airbox" },
        { t: "Finish your first DIY job", why: "Pick any job card. Wipers or the fluid check are good first ones.", stage: "evidence", ok: function (a) { return diyDone(a) > 0; }, go: "tab:diy" }],
      close: function (a) { return diyDone(a) > 0; },
      result: function () { return [["wrench", "First job done, from Volvo's own procedure."], ["wave", "Lars: The first one is always the slowest. After this the car stops being a black box."]]; } },
    { id: "sense", act: "4", crit: false, t: "Sixth Sense", sub: "Cars warn you before they fail. Learn to notice.", scene: "wave", reveals: ["diag"], feature: "career",
      know: { arts: [], tags: [] }, quiz: ["f-oilpress", "f-brakered", "f-mil"],
      brief: { why: "Cars rarely fail without warning. Noises, smells and changes in feel come first, and knowing which ones mean stop now is most of what keeps a car safe.", mech: "Volvo's manual: for a red oil pressure warning, stop and switch off immediately; for a red brake warning, don't drive and have the car towed.", time: "About 30 minutes", cost: "Free", tools: "None", risk: "Driving on a warning that meant stop.", src: ["om"] },
      steps: [
        { t: "What that noise means", stage: "lead", ok: function (a) { return M(a, "m-sound"); }, go: "mission:m-sound" },
        { t: "What that smell means", stage: "lead", ok: function (a) { return M(a, "m-smell"); }, go: "mission:m-smell" },
        { t: "What that feeling means", stage: "lead", ok: function (a) { return M(a, "m-feel"); }, go: "mission:m-feel" },
        { t: "Pass the stop-or-go final", why: "Real situations: decide whether to keep driving.", stage: "evidence", ok: function (a) { return M(a, "m-boss"); }, go: "mission:m-boss" }],
      close: function (a) { return M(a, "m-boss"); },
      result: function () { return [["wave", "A squeal at a stop. A sweet smell from the vents. A shudder at sixty."], ["wave", "Lars: You know which ones mean pull over and which ones mean book a shop. That's most of what I did for a living."]]; } }
  ];
  var CRIT = CASES.filter(function (c) { return c.crit; }).map(function (c) { return c.id; });
  function caseById(id) { return CASES.filter(function (c) { return c.id === id; })[0]; }
  var PRO = { id: "pro", t: "Prologue: The As-Is File", lines: [
    ["road", "Summer 2025. A Volvo wagon with about 84,500 miles rolls off an independent lot."],
    ["papers", "Sold as-is. No service records. No promises."],
    ["car", "2016 Volvo V60 T5. Two liters, one turbo, 240 horsepower."],
    ["device", "And a small box you bought for it. It speaks the car's language. You don't, yet."],
    ["wrench", "Lars: I fixed these cars for a living. I'll ride along. You do the work, I'll tell you what it means."],
    ["file", "Lars: Every unknown about this car is a case. We open them one at a time, and the rest of the garage opens up as we go. First case: getting under the hood safely."]] };

  var COLD = { id: "cold", t: "", lines: [
    ["device", "Something under the dashboard has been talking since 2016."],
    ["papers", "Nobody ever wrote down what it said."],
    ["belt", "Some of what it knows could cost an engine."],
    ["file", "CASE FILE: OPEN. Owner: you."],
    ["road", "It begins when you open the hood."]] };

  /* ---------- status, availability and what the app reveals ---------- */
  function status(api, c) {
    var d = D(api), cl = d.closed[c.id];
    var done = c.steps.map(function (s) { try { return s.manual ? man(api, s.manual) : !!s.ok(api); } catch (e) { return false; } });
    if (cl) return { st: cl.how === "reason" ? "risk" : "closed", done: done, rec: cl };
    var ev = c.steps.some(function (s, i) { return done[i] && s.stage === "evidence" && !s.optional; }), ld = done.some(function (x, i) { return x && !c.steps[i].optional; }) || done.some(Boolean);
    return { st: ev ? "evidence" : (ld ? "lead" : "unknown"), done: done };
  }
  function actClosed(api, n) { var d = D(api); return CASES.filter(function (c) { return c.act === n; }).every(function (c) { return d.closed[c.id]; }); }
  function available(api, c) {
    var d = D(api); if (d.closed[c.id]) return true;
    var n = +c.act; if (n > 1 && !actClosed(api, String(n - 1))) return false;
    var inAct = CASES.filter(function (x) { return x.act === c.act; }), i = inAct.indexOf(c);
    if (i === 0) return true;
    var prev = inAct[i - 1]; return !!d.closed[prev.id] || status(api, prev).st !== "unknown";
  }
  function finaleReady(api) { var d = D(api), e = api.mod("exam"); return !!(e && e.passed) && CRIT.every(function (id) { return d.closed[id]; }); }
  var ALLTABS = null, gcache = null, gtime = 0;
  function revealedSet(api) { var now = Date.now(); if (gcache && now - gtime < 150) return gcache; gcache = computeSet(api); gtime = now; return gcache; }
  function bust() { gcache = null; }
  function computeSet(api) {
    var d = D(api), set = { today: 1, story: 1 };
    if (d.all || d.closed.fin) { (ALLTABS || []).forEach(function (t) { set[t] = 1; }); return set; }
    CASES.forEach(function (c) { if (available(api, c)) c.reveals.forEach(function (t) { set[t] = 1; }); });
    Object.keys(ACT_REWARD).forEach(function (n) { if (actClosed(api, n)) ACT_REWARD[n].tabs.forEach(function (t) { set[t] = 1; }); });
    return set;
  }
  function knowsCase(api, c) { return D(api).all || D(api).closed.fin || available(api, c); }
  /* record changes since last sweep as one "beat" (a scene that waits on Today) */
  function sweep(api) {
    bust(); var d = D(api), changed = false, lines = [], title = "", firstRun = !Object.keys(d.avail).length;
    CASES.forEach(function (c) {
      if (d.closed[c.id]) return;
      var ok = false; try { ok = c.close(api); } catch (e) { ok = false; }
      if (ok) { bust(); d.closed[c.id] = { date: api.todayStr(), how: "evidence", lines: c.result(api) }; lines = lines.concat(d.closed[c.id].lines); title = title || "Case closed: " + c.t; changed = true; }
    });
    Object.keys(ACT_REWARD).forEach(function (n) { var k = "act" + n; if (actClosed(api, n) && !d.avail[k]) { d.avail[k] = api.todayStr(); if (!firstRun) lines.push(["map", ACT_REWARD[n].line]); changed = true; } });
    CASES.forEach(function (c) {
      if (d.avail[c.id] || !available(api, c)) return;
      d.avail[c.id] = api.todayStr(); changed = true;
      if (!firstRun && c.id !== "safe") { lines.push([c.scene, "Lars: New case. " + c.t + ". " + c.sub]); title = title || "New case: " + c.t; }
    });
    bust(); var rv = revealedSet(api), fresh = [];
    Object.keys(rv).forEach(function (t) { if (!d.revealed[t]) { d.revealed[t] = api.todayStr(); if (t !== "today" && t !== "story") { d.fresh[t] = 1; fresh.push(t); } changed = true; } });
    if (fresh.length && !firstRun && !d.all) lines.push(["map", "New in your garage: " + fresh.map(function (t) { return TABN[t] || t; }).join(", ") + "."]);
    if (!d.closed.fin && finaleReady(api)) { d.closed.fin = { date: api.todayStr(), how: "evidence" }; d.pending.push("fin"); changed = true; }
    if (lines.length && !firstRun) { var id = "b" + Date.now().toString(36); d.beats[id] = { t: title || "Your garage grew", lines: lines.slice(0, 8), date: api.todayStr() }; d.pending.push(id); }
    if (changed) { api.save(); api.updateHud(); if (!syncing && api.navRefresh) setTimeout(api.navRefresh, 0); }
    return changed;
  }
  /* guided mode (guide.js): 0 guided, 1 assisted, 2 on your own */
  function gl(c) { return window.V60_GUIDE ? window.V60_GUIDE.level(c.id) : 2; }
  function nextStep(api) {
    for (var i = 0; i < CASES.length; i++) {
      var c = CASES[i]; if (!available(api, c)) continue;
      var s = status(api, c); if (s.st === "closed" || s.st === "risk") continue;
      for (var k = 0; k < c.steps.length; k++) if (!s.done[k] && !c.steps[k].optional) return { c: c, s: c.steps[k], k: k };
    }
    return null;
  }
  function finScene(api) {
    var d = D(api), risks = CASES.filter(function (c) { return d.closed[c.id] && d.closed[c.id].how === "reason"; });
    return { id: "fin", t: "Finale: Master of the V60", lines: [["badge", "Certified on your own car."], ["file", "The as-is wagon now has the most complete history it has ever had, and an owner who can explain every part of it."]].concat(risks.length ? [["papers", "Lars: Still on the list as known risks: " + risks.map(function (c) { return c.t; }).join(", ") + ". Don't let them drop off."]] : []).concat([["road", "Lars: The whole garage is open now. The file never really closes: new cases open when the car tells us something."]]) };
  }
  function sceneById(api, id) {
    var d = D(api);
    if (id === "pro") return PRO;
    if (id === "cold") return COLD;
    if (id === "fin") return finScene(api);
    if (d.beats[id]) return { id: id, t: d.beats[id].t, lines: d.beats[id].lines };
    var c = CASES.filter(function (x) { return "case-" + x.id === id; })[0], rec = c && d.closed[c.id];
    if (!c || !rec) return null;
    var lines = rec.how === "reason" ? [[c.scene, "Case logged as a known risk: " + rec.reason], ["wave", "Lars: Fair enough, as long as it stays on the list. It shows up in the finale until it's really closed."]] : (rec.lines || []);
    return { id: id, t: "Case closed: " + c.t, lines: lines };
  }

  /* ---------- gate and knowledge hooks used by core and other modules ---------- */
  var API = null, syncing = false;
  window.V60_STORY = {
    cases: CASES,
    next: function () { return API ? nextStep(API) : null; },
    status: function (c) { return status(API, c); },
    available: function (c) { return available(API, c); },
    mark: function (k) { D(API).manual[k] = API.todayStr(); API.save(); }
  };
  window.V60_GATE = {
    visible: function (tab) { if (!API) return true; return !!revealedSet(API)[tab]; },
    feature: function (f) { if (!API) return true; var d = D(API); if (d.all || d.closed.fin) return true; return CASES.some(function (c) { return c.feature === f && available(API, c); }); },
    isNew: function (tab) { return !!(API && D(API).fresh[tab]); },
    sync: function () { if (API && !syncing) { syncing = true; try { sweep(API); } finally { syncing = false; } } },
    shown: function (tab) { if (!API) return; var d = D(API); if (d.fresh[tab]) { delete d.fresh[tab]; API.save(); } }
  };
  function factKnown(f) {
    if (!API) return true; var d = D(API); if (d.all || d.closed.fin) return true;
    if (d.known["f:" + f.id]) return true;
    return CASES.some(function (c) { return knowsCase(API, c) && c.know.tags.indexOf(f.tag) >= 0; });
  }
  window.V60_KNOW = {
    article: function (id) {
      if (!API) return true; var d = D(API); if (d.all || d.closed.fin || d.known["a:" + id]) return true;
      return CASES.some(function (c) { return knowsCase(API, c) && c.know.arts.indexOf(id) >= 0; });
    },
    fact: factKnown,
    discover: function (kind, id) { if (!API) return; var d = D(API), k = kind + ":" + id; if (!d.known[k]) { d.known[k] = API.todayStr(); API.save(); } if (kind === "a") d.read[id] = 1; },
    isNew: function (id) { return !!(API && !D(API).read[id] && window.V60_KNOW.article(id)); },
    read: function (id) { return !!(API && D(API).read[id]); }
  };

  /* ---------- codebook (cipher) ---------- */
  function cbEntry(k) { return (window.V60_CODEBOOK || []).filter(function (e) { return e.k === k; })[0]; }
  window.V60_CB = {
    plain: function () { return !!(API && (D(API).plain || D(API).all)); },
    seen: function (k, sim) { if (!API || !cbEntry(k)) return; var cb = D(API).cb; if (!cb[k]) { cb[k] = { seen: API.todayStr(), sim: !!sim }; API.save(); } },
    decoded: function (k) { if (!API) return true; if (window.V60_CB.plain()) return true; var c = D(API).cb[k]; return !!(c && c.dec); },
    label: function (k, plain) { var e = cbEntry(k); if (!e) return API ? API.esc(plain) : plain; window.V60_CB.seen(k); if (window.V60_CB.decoded(k)) return API.esc(e.n || plain); return '<span class="cipher">' + API.esc(e.raw) + '</span> <button type="button" class="decode" data-decode="' + API.esc(k) + '">Decode</button>'; },
    text: function (k, plain) { var e = cbEntry(k); return e && !window.V60_CB.decoded(k) ? e.raw : (e ? e.n : plain); },
    codeHint: function (code, hint) {
      ["dtc:1", "dtc:2", "dtc:3", "dtc:4"].forEach(function (k) { window.V60_CB.seen(k); });
      if (window.V60_CB.plain() || ["dtc:1", "dtc:2", "dtc:3", "dtc:4"].every(function (k) { return window.V60_CB.decoded(k); })) return API.esc(hint);
      return '<span class="cipher">Encoded fault</span> <button type="button" class="decode" data-decode="code:' + API.esc(code) + '">Decode ' + API.esc(code) + "</button>";
    },
    count: function () { return API ? decodedN(API) : 0; },
    open: function (k) { openDecode(k); }
  };
  var SUB3 = { "0": "fuel and air metering, plus emissions controls", "1": "fuel and air metering", "2": "fuel and air metering (injector circuits)", "3": "ignition system or misfire", "4": "extra emissions controls", "5": "vehicle speed, idle control and auxiliary inputs", "6": "computer and output circuits", "7": "transmission", "8": "transmission", "9": "transmission" };
  function scramble(el, text) {
    var chars = "ABCDEF0123456789#%&", n = 0, max = 14;
    try { if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = text; return; } } catch (e) {}
    var t = setInterval(function () { n++; el.textContent = text.split("").map(function (ch, i) { if (ch === " " || i < (n / max) * text.length) return ch; return chars.charAt(Math.floor(Math.random() * chars.length)); }).join(""); if (n >= max) { clearInterval(t); el.textContent = text; } }, 45);
  }
  function openDecode(k) {
    var api = API, d = D(api), esc = api.esc, sh = document.getElementById("decodeSheet"), body = sh.querySelector(".dsb"), html, name;
    var SRC = window.V60_CB_SOURCES || {};
    if (k.indexOf("code:") === 0) {
      var code = k.slice(5), dc = api.decodeCode(code), L = { P: "Powertrain", C: "Chassis", B: "Body", U: "Network" }[code.charAt(0)] || code.charAt(0);
      ["dtc:1", "dtc:2", "dtc:3", "dtc:4"].forEach(function (x) { d.cb[x] = d.cb[x] || { seen: api.todayStr() }; d.cb[x].dec = api.todayStr(); });
      name = dc && dc.known ? dc.known.t : (code.charAt(1) === "0" ? "Generic code: see Diagnose for details" : "Volvo-specific code: needs Volvo information");
      html = '<p class="dsraw mono">' + esc(code) + '</p><p class="dsname" id="dsName"></p><ol class="dsparts"><li><b>' + esc(code.charAt(0)) + "</b> " + esc(L) + "</li><li><b>" + esc(code.charAt(1)) + "</b> " + (code.charAt(1) === "0" ? "Generic: same meaning on every car" : (code.charAt(1) === "1" ? "Manufacturer-specific: Volvo's own meaning" : "Mixed generic and manufacturer")) + "</li><li><b>" + esc(code.charAt(2)) + "</b> " + esc(code.charAt(0) === "P" ? (SUB3[code.charAt(2)] || "Subsystem") : "Subsystem") + "</li><li><b>" + esc(code.slice(3)) + "</b> The exact fault</li></ol>" + (dc && dc.known ? '<p class="dscar"><b>Common causes:</b> ' + esc(dc.known.c) + "</p>" : "") + '<p class="status">You just learned how every trouble code is built, so from now on codes show their meaning straight away. All four parts are in your Codebook.</p><div class="row"><button type="button" class="quiet" data-jump="ask:' + esc(code) + '">More about ' + esc(code) + "</button></div>";
    } else {
      var e = cbEntry(k); if (!e) return;
      d.cb[k] = d.cb[k] || { seen: api.todayStr() }; d.cb[k].dec = api.todayStr(); name = e.n;
      var s = SRC[e.src];
      html = '<p class="dsraw mono">' + esc(e.raw) + '</p><p class="dsname" id="dsName"></p><p>' + esc(e.what) + '</p><p class="dscar"><b>On your car:</b> ' + esc(e.car) + "</p>" + (s ? '<p class="status">Source: <a href="' + esc(s[1]) + '" target="_blank" rel="noopener">' + esc(s[0]) + "</a></p>" : "") + (e.art ? '<div class="row"><button type="button" class="quiet" data-jump="kb:' + e.art + '">Read more</button></div>' : "");
    }
    api.save(); api.updateHud();
    body.innerHTML = html; sh.hidden = false; document.body.classList.add("cine-open");
    scramble(document.getElementById("dsName"), name);
    sh.querySelector(".dsclose").focus();
  }
  function closeDecode() { var sh = document.getElementById("decodeSheet"); if (!sh || sh.hidden) return; sh.hidden = true; document.body.classList.remove("cine-open"); API.renderAll(); }

  function alertNote(api, msg) { var n = document.createElement("div"); n.className = "toast"; n.setAttribute("role", "status"); n.textContent = msg; document.body.appendChild(n); setTimeout(function () { n.remove(); }, 4000); }
  /* ---------- cinema ---------- */
  var cin = { ch: null, i: 0, timer: null, typed: null };
  function reduce() { try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } }
  function play(api, id) {
    var s = sceneById(api, id); if (!s || !s.lines.length) return;
    cin.ch = s; cin.i = 0;
    var ov = document.getElementById("cinema");
    ov.hidden = false; document.body.classList.add("cine-open");
    ov.querySelector(".cin-title").textContent = s.t;
    showLine(api); ov.focus();
  }
  function showLine(api) {
    var ov = document.getElementById("cinema"), s = cin.ch, ln = s.lines[cin.i];
    clearTimeout(cin.timer); clearInterval(cin.typed);
    ov.querySelector(".cin-stage").innerHTML = '<svg viewBox="0 0 720 340" aria-hidden="true">' + (SCENES[ln[0]] || "") + "</svg>";
    var cap = ov.querySelector(".cin-cap"), text = ln[1], n = 0;
    ov.querySelector(".cin-dots").innerHTML = s.lines.map(function (_, k) { return '<i class="' + (k === cin.i ? "on" : (k < cin.i ? "past" : "")) + '"></i>'; }).join("");
    if (reduce()) cap.textContent = text;
    else { cap.textContent = ""; cin.typed = setInterval(function () { n += 2; cap.textContent = text.slice(0, n); if (n >= text.length) clearInterval(cin.typed); }, 28); }
    cin.timer = setTimeout(function () { next(api); }, Math.max(3800, text.length * 62));
  }
  function next(api) { if (!cin.ch) return; if (cin.i < cin.ch.lines.length - 1) { cin.i++; showLine(api); } else close(api); }
  function close(api) {
    clearTimeout(cin.timer); clearInterval(cin.typed);
    var ov = document.getElementById("cinema"); ov.hidden = true; document.body.classList.remove("cine-open");
    if (cin.ch) { var d = D(api); d.seen[cin.ch.id] = api.todayStr(); d.pending = d.pending.filter(function (p) { return p !== cin.ch.id; }); api.save(); }
    cin.ch = null; api.renderAll();
  }

  /* ---------- render ---------- */
  var ui = { open: null, view: "cases" };
  var DEPTH = [["short", "Short"], ["det", "Detailed"], ["mech", "Mechanic"]];
  function srcHTML(api, list) {
    var S = window.V60_SOURCES || {};
    return (list || []).map(function (k) { var s = typeof k === "string" ? S[k] : k; return s ? '<a href="' + api.esc(s[1]) + '" target="_blank" rel="noopener">' + api.esc(s[0]) + "</a>" : ""; }).filter(Boolean).join(" · ");
  }
  function factById(id) { return (window.V60_FACTS || []).filter(function (f) { return f.id === id; })[0]; }
  function shuffled(arr, seed) { var a = arr.slice(), s = seed; for (var i = a.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; var j = Math.floor(s / 233280 * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function quizHTML(api, c) {
    var d = D(api), q = d.quiz[c.id] || {}, esc = api.esc;
    var items = c.quiz.map(factById).filter(function (f) { return f && f.exam && f.exam.length >= 2; });
    if (!items.length) return "";
    var right = items.filter(function (f) { return q[f.id] === "r"; }).length, done = items.filter(function (f) { return q[f.id]; }).length;
    return '<details class="qz"' + (done < items.length ? " open" : "") + '><summary>Check yourself · ' + right + " of " + items.length + "</summary>" + items.map(function (f, n) {
      var opts = shuffled([f.a].concat(f.exam.slice(0, 3)), n + 7 + c.id.length), ans = q[f.id];
      return '<div class="qzq"><p><b>' + esc(f.q) + "</b></p>" + (ans ? '<p class="' + (ans === "r" ? "ok" : "bad") + '">' + (ans === "r" ? "Right. " : "Not quite. ") + esc(f.a) + "</p>" : '<div class="qzo">' + opts.map(function (o) { return '<button type="button" class="quiet" data-qz="' + c.id + "|" + f.id + "|" + (o === f.a ? "r" : "w") + '">' + esc(o) + "</button>"; }).join("") + "</div>") + "</div>";
    }).join("") + "</details>";
  }
  function depthOf(api) { var dp = D(api).depth; return dp === "mech" && window.V60_PERK && !window.V60_PERK("mech") ? "det" : dp; }
  function briefHTML(api, c, s) {
    var b = c.brief, d = D(api), esc = api.esc, deep = depthOf(api);
    if (deep === "short") return '<p class="bshort">' + esc(b.why.split(". ")[0].replace(/\.$/, "")) + ".</p>";
    return '<details class="brief" id="brief-' + c.id + '"' + (s.st === "unknown" || s.st === "lead" ? " open" : "") + '><summary>Briefing</summary><div class="row"><button type="button" class="quiet sm" data-speak="#brief-' + c.id + '">Listen</button></div><p>' + esc(b.why) + "</p>" + (deep === "mech" ? '<p class="mech">' + esc(b.mech) + "</p>" : "") +
      '<dl class="bfacts"><dt>Time</dt><dd>' + esc(b.time) + "</dd><dt>Cost</dt><dd>" + esc(b.cost) + "</dd><dt>Tools</dt><dd>" + esc(b.tools) + "</dd><dt>If skipped</dt><dd>" + esc(b.risk) + "</dd></dl>" + '<p class="status">Sources: ' + srcHTML(api, b.src) + "</p></details>";
  }
  function stepsHTML(api, c, s) {
    var esc = api.esc, deep = depthOf(api);
    return '<ol class="steps">' + c.steps.map(function (st, i) {
      var ok = s.done[i], pr = st.prog && !ok ? st.prog(api) : "";
      var info = (deep !== "short" && st.why ? "<small>" + esc(st.why) + "</small>" : "") + (deep === "mech" && st.mech ? '<small class="mech">' + esc(st.mech) + "</small>" : "") + (pr ? '<small class="prog">' + esc(pr) + "</small>" : "");
      var acts = (st.manual ? '<button type="button" class="quiet" data-man="' + st.manual + '" aria-pressed="' + ok + '">' + (ok ? "Undo" : "Mark done") + "</button>" : "") + (st.go && !ok ? '<button type="button" class="quiet" data-from="' + c.id + '" data-jump="' + esc(st.go) + '">' + (st.go.indexOf("mission:") === 0 ? "Lesson" : "Go") + "</button>" : "") + (st.where ? '<button type="button" class="quiet" data-jump="bay:' + st.where + '" title="Show me where">Where</button>' : "") + '<button type="button" class="quiet" data-proof="' + c.id + "|" + i + '" title="Attach a proof photo">Photo</button>';
      var shots = proofs(api, c.id, i);
      info += shots.length ? '<span class="proofs">' + shots.map(function (p) { var u = api.photoUrl(p); return u ? '<img src="' + esc(u) + '" alt="Proof photo, ' + esc(p.date) + '" loading="lazy">' : ""; }).join("") + "</span>" : "";
      return '<li class="' + (ok ? "done" : "") + '"><span class="sdot" aria-hidden="true">' + (ok ? "✓" : "") + '</span><span class="stx">' + esc(st.t) + (st.optional ? ' <span class="pill none">bonus</span>' : "") + info + '</span><span class="sact">' + acts + "</span></li>";
    }).join("") + "</ol>";
  }
  function proofs(api, cid, i) { return (api.state.photos || []).filter(function (p) { return p.kind === "proof" && p.cs === cid && (i == null || p.st === i); }); }
  var PILL = { unknown: ["Unknown", "none"], lead: ["Lead", "info"], evidence: ["Evidence", "watch"], closed: ["Closed", "ok"], risk: ["Known risk", "concern"] };
  /* which items of the manual this case points at ("→ §2.1 TIRES"), from the manual's caseOpens */
  function pointsAt(c) {
    var esc = API.esc, M = window.V60_MANUAL, ids = (window.V60_MANUAL_DATA && window.V60_MANUAL_DATA.caseOpens[c.id]) || [], seen = {}, out = [];
    ids.forEach(function (id) { var ch = M && M.chapters[id]; var k = ch ? (ch.item ? ch.item.num + " " + ch.item.n : "0 " + ch.n) : id; if (!seen[k]) { seen[k] = 1; out.push({ k: k, ch: ch }); } });
    if (!out.length) return "";
    return '<div class="cto">' + out.map(function (o) { return '<button type="button" class="mn-pill" data-jump="' + (o.ch && o.ch.item ? "item:" + o.ch.item.id : "ch:0") + '">→ §' + esc(o.k) + "</button>"; }).join(" ") + "</div>";
  }
  function caseHTML(api, c, s) {
    var esc = api.esc, open = ui.open === c.id, n = c.steps.filter(function (x, i) { return s.done[i] && !x.optional; }).length, tot = c.steps.filter(function (x) { return !x.optional; }).length;
    var h = '<li class="case ' + s.st + (open ? " open" : "") + '"><button type="button" class="caseh" data-case="' + c.id + '" aria-expanded="' + open + '">' + (s.st === "unknown" || s.st === "closed" || s.st === "risk" ? "" : '<span class="pill ' + PILL[s.st][1] + '">' + PILL[s.st][0] + "</span>") + '<span class="ct"><b>' + esc(c.t) + "</b><small>" + esc(c.sub) + '</small></span><span class="cn">' + (s.st === "closed" ? '<span class="mn-stamp">CLOSED</span>' : s.st === "risk" ? '<span class="mn-stamp risk">RISK</span>' : n + " / " + tot) + "</span></button>" + pointsAt(c);
    if (!open) return h + "</li>";
    h += '<div class="caseb">' + briefHTML(api, c, s) + stepsHTML(api, c, s);
    if (s.st === "closed" || s.st === "risk") {
      var deb = s.st === "closed" ? (s.rec.lines || []).map(function (l) { return "<p>" + esc(l[1]) + "</p>"; }).join("") : "";
      h += '<div class="debrief"><p class="ans-k">Debrief · ' + esc(s.rec.date) + "</p>" + (s.st === "risk" ? "<p>Logged as a known risk: " + esc(s.rec.reason) + "</p>" : deb) + '<div class="row"><button type="button" class="quiet" data-jump="story:case-' + c.id + '">Watch the scene</button>' + (s.st === "risk" ? '<button type="button" class="quiet" data-reopen="' + c.id + '">Reopen</button>' : "") + "</div></div>" + quizHTML(api, c);
    } else {
      h += '<details class="reason"><summary>Can\'t close it yet?</summary><p class="status">Log it as a known risk so the story keeps moving. It stays flagged until the evidence arrives, and the finale lists it.</p><div class="field"><label for="rs-' + c.id + '">Reason</label><select id="rs-' + c.id + '"><option>Can\'t afford it yet</option><option>Waiting on a shop appointment</option><option>Doesn\'t apply to my car</option><option value="">Other (type below)</option></select></div><div class="field"><label for="rt-' + c.id + '">Details (optional)</label><input id="rt-' + c.id + '" type="text" maxlength="140"></div><button type="button" class="quiet" data-reason="' + c.id + '">Log as known risk</button></details>';
    }
    return h + "</div></li>";
  }
  function sideList(api) {
    var G = window.V60_GATE, A = api.acad(), cards = mod(api, "cards", { b: {} }).b || {}, up = mod(api, "upg", { want: {} }).want || {};
    return [
      [true, "Training library", Object.keys(api.acad().done || {}).length + " of " + api.CHAPTERS.reduce(function (n, c) { return n + c.missions.length; }, 0) + " lessons done", "tab:academy"],
      [G.feature("career"), "Career jobs", Object.keys(A.jobs || {}).length + " of " + api.JOBS.length + " diagnosed", "tab:academy"],
      [G.visible("sim"), "Mystery cars", ((A.sim || {}).correct || 0) + " solved", "tab:sim"],
      [G.visible("diy"), "DIY jobs", diyDone(api) + " done", "tab:diy"],
      [G.visible("cards"), "Flashcards", Object.keys(cards).filter(function (k) { return cards[k][0] >= 4; }).length + " mastered", "tab:cards"],
      [G.visible("achieve"), "Seasonal checklist and achievements", "Real-world proof", "tab:achieve"],
      [G.visible("upgrades"), "Upgrades", Object.keys(up).filter(function (k) { return up[k] === "done"; }).length + " done", "tab:upgrades"],
      [G.visible("my"), "Photo mapping", (api.state.photos || []).length + " photos", "tab:my"],
      [G.visible("fuel"), "Fuel log", (mod(api, "fuel", { fills: [] }).fills || []).length + " fill-ups", "tab:fuel"]
    ].filter(function (x) { return x[0]; });
  }
  function fileHTML(api) {
    var d = D(api), esc = api.esc, st = api.state, rows = [];
    function sec(t, body) { if (body) rows.push('<section class="fsec"><h3>' + esc(t) + "</h3>" + body + "</section>"); }
    function kv(list) { list = list.filter(function (x) { return x[1] != null && x[1] !== ""; }); return list.length ? '<dl class="kv">' + list.map(function (x) { return "<dt>" + esc(x[0]) + "</dt><dd>" + esc(String(x[1])) + "</dd>"; }).join("") + "</dl>" : ""; }
    sec("The car", kv([["Model", "2016 Volvo V60 T5 Drive-E Premier, front-wheel drive"], ["Engine", "B4204T11, 2.0 L turbo four, 240 hp, 258 lb-ft"], ["Transmission", "Aisin TG-81SC 8-speed automatic"], ["Bought", "About August 2025, as-is, about 90,000 miles, no service history"], ["Odometer", st.odo != null ? api.fmt(st.odo) + " miles" : ""], ["Build month", buildMonth(api) || "Not entered yet"]]));
    var cl = CASES.filter(function (c) { return d.closed[c.id]; });
    sec("Findings", cl.length ? '<ul class="fl">' + cl.map(function (c) { var r = d.closed[c.id]; return "<li><b>" + esc(c.t) + "</b> <span class=\"status\">" + esc(r.date) + "</span><br>" + (r.how === "reason" ? '<span class="riskt">Known risk: ' + esc(r.reason) + "</span>" : esc((r.lines || []).filter(function (l) { return l[1].indexOf("Lars:") !== 0; }).map(function (l) { return l[1]; }).join(" "))) + "</li>"; }).join("") + "</ul>" : '<p class="status">Closed cases add their findings here.</p>');
    var svc = (api.ITEMS || []).map(function (it) { var e = api.lastFor(it.key); return e ? [it.name || it.key, e.date + (e.miles ? ", " + api.fmt(e.miles) + " mi" : "")] : null; }).filter(Boolean);
    sec("Service history", svc.length ? kv(svc) : "");
    var r = oil(api);
    sec("Oil watch", r ? kv([["Checks logged", st.oil.length], ["Distance covered", api.fmt(r.span) + " mi"], ["Oil added", r.added + " qt"], ["Rate", r.rate.toFixed(2) + " qt per 1,000 mi"]]) : (st.oil.length ? kv([["Checks logged", st.oil.length]]) : ""));
    var ls = st.lastScan;
    sec("Latest health check", ls ? kv([["Date", ls.date], ["Check-engine light", ls.mil ? "On" : "Off"], ["Codes reported", ls.codes], ["Monitors not ready", (ls.notReady || []).join(", ") || "None"], ["Saved drives", st.runs.length]]) : "");
    var rs = st.recalls || {};
    sec("Recalls", api.RECALLS.some(function (x) { return rs[x.id]; }) ? kv(api.RECALLS.map(function (x) { return [x.nhtsa + " " + x.t, ({ done: "Done", na: "Not applicable", open: "Open", unknown: "Unknown" })[rs[x.id] || "unknown"]]; })) : "");
    var tm = mod(api, "tsb", { mark: {} }).mark || {}, tk = Object.keys(tm);
    sec("Bulletins marked", tk.length ? kv(tk.map(function (k) { return [k, ({ have: "I have this symptom", ask: "Ask a shop", done: "Done or checked", skip: "Not relevant" })[tm[k]] || tm[k]]; })) : "");
    var g = mod(api, "glove", {}), docs = g.docs || {};
    sec("Papers", kv([["Receipts on file", (g.receipts || []).length || ""], ["Registration expires", docs.regExp], ["Insurance renews", docs.insRenew], ["Emissions inspection due", docs.inspDue]]));
    var risks = CASES.filter(function (c) { return d.closed[c.id] && d.closed[c.id].how === "reason"; });
    sec("Known risks", risks.length ? '<ul class="fl">' + risks.map(function (c) { return '<li class="riskt"><b>' + esc(c.t) + "</b>: " + esc(d.closed[c.id].reason) + "</li>"; }).join("") + "</ul>" : "");
    var pf = (st.photos || []).filter(function (p) { return p.kind === "proof"; });
    sec("Proof photos", pf.length ? '<div class="proofgrid">' + pf.slice(-12).map(function (p) { var c = caseById(p.cs), u = api.photoUrl(p); return u ? '<figure><img src="' + esc(u) + '" alt="Proof photo"><figcaption>' + esc((c ? c.t + " · " : "") + p.date) + "</figcaption></figure>" : ""; }).join("") + "</div>" : "");
    sec("Codebook", "<p>" + plural(decodedN(api), "signal") + " decoded of " + (window.V60_CODEBOOK || []).length + ".</p>");
    return '<div id="fileDoc">' + rows.join("") + '</div><div class="row">' + (window.V60_FILE && !window.V60_FILE.canPrint ? '<button type="button" class="quiet" id="stShareFile">Save or share as text</button>' : '<button type="button" class="quiet" id="stPrint">Print or save as PDF</button><button type="button" class="quiet" id="stShareFile">Share as text</button>') + '</div><p class="status">Built from what you have logged. The VIN is never shown here.</p>';
  }
  function timelineHTML(api) {
    var esc = api.esc, st = api.state, d = D(api), ev = [];
    if (window.V60_PERK && !window.V60_PERK("timeline")) return '<div class="card"><p class="ans-k">Locked</p><h3>Timeline</h3><p>Earn the Record keeper skill (log 3 services or receipts) to see your car\'s whole life on one scroll.</p><button type="button" class="quiet" data-jump="tab:skills">Skill tree</button></div>';
    function add(date, kind, t, sub, go) { if (date) ev.push({ d: String(date).slice(0, 10), k: kind, t: t, s: sub || "", go: go || "" }); }
    (st.log || []).forEach(function (e) { var it = (api.ITEMS || []).filter(function (x) { return x.key === e.item; })[0]; add(e.date, "Service", it ? it.name : e.item, e.miles ? api.fmt(e.miles) + " mi" : "", "tab:records"); });
    (st.oil || []).forEach(function (e) { add(e.date, "Oil", "Oil level check" + (e.qts ? ", added " + e.qts + " qt" : ""), e.miles ? api.fmt(e.miles) + " mi" : "", "tab:records"); });
    ((mod(api, "glove", {}).receipts) || []).forEach(function (r) { add(r.date, "Receipt", r.shop || "Receipt", r.summary || "", "tab:glove"); });
    ((mod(api, "fuel", { fills: [] }).fills) || []).forEach(function (f) { add(f.date, "Fuel", "Fill-up" + (f.gal ? ", " + f.gal + " gal" : ""), f.odo ? api.fmt(f.odo) + " mi" : "", "tab:fuel"); });
    ((mod(api, "live", { scans: [] }).scans) || []).forEach(function (x) { add(x.date, "Scan", "Health check" + (x.sim ? " (simulated)" : ""), (x.codes || []).length ? (x.codes || []).map(function (c) { return c.code; }).join(", ") : "No codes", "tab:live"); });
    (st.runs || []).forEach(function (r) { add(r.date, "Drive", "Baseline drive saved", r.miles ? api.fmt(r.miles) + " mi" : "", "tab:lab"); });
    var dd = mod(api, "diy", { done: {} }).done || {}; Object.keys(dd).forEach(function (k) { add(dd[k], "DIY", "DIY job done", k.replace(/^j-/, ""), "diy:" + k); });
    CASES.forEach(function (c) { var r = d.closed[c.id]; if (r) add(r.date, r.how === "reason" ? "Risk" : "Case", (r.how === "reason" ? "Logged as known risk: " : "Case closed: ") + c.t, r.how === "reason" ? r.reason : "", "case:" + c.id); });
    var dec = {}; Object.keys(d.cb).forEach(function (k) { var c = d.cb[k]; if (c.dec) dec[c.dec] = (dec[c.dec] || 0) + 1; }); Object.keys(dec).forEach(function (day) { add(day, "Codebook", "Decoded " + plural(dec[day], "signal"), "", "tab:story"); });
    (st.photos || []).forEach(function (p) { add(p.date, "Photo", p.kind === "proof" ? "Proof photo" : "Photo check", p.note || "", "tab:my"); });
    if (!ev.length) return '<p class="status">Your timeline fills in as you log services, oil checks, scans, receipts and fill-ups.</p>';
    ev.sort(function (a, b) { return a.d < b.d ? 1 : (a.d > b.d ? -1 : 0); });
    var month = "", out = '<ol class="tline">';
    ev.forEach(function (e) {
      var m = e.d.slice(0, 7);
      if (m !== month) { month = m; out += '<li class="tmon">' + esc(new Date(m + "-15T12:00:00").toLocaleDateString(undefined, { month: "long", year: "numeric" })) + "</li>"; }
      out += '<li class="tev k-' + esc(e.k.toLowerCase()) + '"><span class="tday">' + esc(e.d.slice(8, 10)) + '</span><button type="button" class="tbtn"' + (e.go ? ' data-jump="' + esc(e.go) + '"' : "") + '><span class="tk">' + esc(e.k) + "</span><b>" + esc(e.t) + "</b>" + (e.s ? "<small>" + esc(e.s) + "</small>" : "") + "</button></li>";
    });
    return out + "</ol>";
  }
  function codebookHTML(api) {
    var d = D(api), esc = api.esc, groups = {};
    (window.V60_CODEBOOK || []).forEach(function (e) { (groups[e.g] = groups[e.g] || []).push(e); });
    return '<p class="lede">Everything the adapter can say, and what you have decoded. Signals appear here once the car (or the simulated car) has sent them.</p>' + Object.keys(groups).map(function (g) {
      return '<section class="cbg"><h3>' + esc(g) + '</h3><ul class="cbl">' + groups[g].map(function (e) {
        var c = d.cb[e.k], dec = c && c.dec;
        return '<li class="' + (dec ? "dec" : (c ? "seen" : "")) + '"><span class="mono raw">' + esc(e.raw) + '</span><span class="cbn">' + (dec ? esc(e.n) : (c ? '<button type="button" class="decode" data-decode="' + esc(e.k) + '">Decode</button>' : '<span class="status">Not heard yet</span>')) + "</span>" + (dec ? '<button type="button" class="quiet sm" data-decode="' + esc(e.k) + '">Open</button>' : "") + "</li>";
      }).join("") + "</ul></section>";
    }).join("");
  }
  function render(api) {
    var $ = api.$, esc = api.esc, d = D(api);
    sweep(api);
    var avail = CASES.filter(function (c) { return available(api, c); }), closed = CASES.filter(function (c) { return d.closed[c.id]; }).length, nx = nextStep(api), fin = !!d.closed.fin;
    $("stSeg").innerHTML = [["cases", "Cases"], ["file", "The File"], ["timeline", "Timeline"], ["codebook", "Codebook"]].map(function (x) { return '<button type="button" data-view="' + x[0] + '" aria-pressed="' + (ui.view === x[0]) + '">' + x[1] + "</button>"; }).join("");
    $("stProg").innerHTML = '<div class="sbar" role="progressbar" aria-valuemin="0" aria-valuemax="' + CASES.length + '" aria-valuenow="' + closed + '"><i style="width:' + Math.round(closed / CASES.length * 100) + '%"></i></div><p class="status">' + closed + " of " + CASES.length + " cases closed" + (fin ? " · Finale reached" : "") + " · " + plural(decodedN(api), "signal") + " decoded</p>";
    var pend = d.pending.filter(function (p) { return sceneById(api, p); });
    ["cases", "file", "timeline", "codebook"].forEach(function (v) { $("stV-" + v).hidden = ui.view !== v; });
    if (ui.view === "timeline") { $("stV-timeline").innerHTML = timelineHTML(api); return; }
    if (ui.view === "file") { $("stV-file").innerHTML = fileHTML(api); return; }
    if (ui.view === "codebook") { $("stV-codebook").innerHTML = codebookHTML(api); return; }
    var nextHTML = (pend.length ? '<div class="nextc scene"><p class="ans-k">New scene</p><h3>' + esc(sceneById(api, pend[0]).t) + '</h3><button type="button" data-jump="story:' + pend[0] + '">Watch</button></div>' : "") +
      (nx ? '<div class="nextc"><p class="ans-k">Next objective · ' + esc(nx.c.t) + "</p><h3>" + esc(nx.s.t) + "</h3>" + (d.depth !== "short" && nx.s.why ? '<p class="nwhy">' + esc(nx.s.why) + "</p>" : "") + '<div class="row">' + (gl(nx.c) === 0 ? '<button type="button" data-guide="' + nx.c.id + '">Start</button>' : "") + (nx.s.manual ? '<button type="button"' + (gl(nx.c) === 0 ? ' class="quiet"' : "") + ' data-man="' + nx.s.manual + '">Mark done</button>' : "") + (nx.s.go ? '<button type="button" class="' + (nx.s.manual || gl(nx.c) === 0 ? "quiet" : "") + '" data-from="' + nx.c.id + '" data-jump="' + esc(nx.s.go) + '">' + (nx.s.manual ? "Open" : (nx.s.go.indexOf("mission:") === 0 ? "Start the lesson" : "Go")) + "</button>" : "") + '<button type="button" class="quiet" data-case="' + nx.c.id + '">See the case</button>' + (gl(nx.c) === 1 ? '<button type="button" class="quiet" data-guide="' + nx.c.id + '">Walk me through it</button>' : "") + "</div></div>" : (fin ? "" : (actClosed(api, "4") ? '<div class="nextc"><p class="ans-k">Next objective · Finale</p><h3>Pass the V60 Master exam</h3><button type="button" data-jump="tab:exam">Take the exam</button></div>' : "")));
    if (ui.open == null && nx) ui.open = nx.c.id;
    var acts = ACTS.filter(function (a) { return avail.some(function (c) { return c.act === a[0]; }); }).map(function (act) {
      var cs = avail.filter(function (c) { return c.act === act[0]; });
      return '<section class="act"><h3><span>Act ' + act[0] + "</span> " + esc(act[1]) + '</h3><ul class="cases">' + cs.map(function (c) { return caseHTML(api, c, status(api, c)); }).join("") + "</ul></section>";
    }).join("");
    if (actClosed(api, "4") || fin) acts += '<section class="act"><h3><span>Finale</span> Master of the V60</h3><ul class="cases"><li class="case ' + (fin ? "closed" : "unknown") + '"><div class="caseh static"><span class="pill ' + (fin ? "ok" : "none") + '">' + (fin ? "Reached" : "Open") + '</span><span class="ct"><b>Close the critical cases and pass the exam</b><small>' + CRIT.filter(function (id) { return d.closed[id]; }).length + " of " + CRIT.length + " critical cases closed · exam " + ((api.mod("exam") || {}).passed ? "passed" : "not passed yet") + "</small></span></div>" + (fin ? '<div class="caseb"><button type="button" class="quiet" data-jump="story:fin">Watch the finale</button></div>' : "") + "</li></ul></section>";
    else acts += '<p class="status hidden-note">More of the story opens as you close cases.</p>';
    var alerts = window.V60_GATE.visible("health") ? api.computeHealth().actions.filter(function (a) { return a.sev >= 48; }) : [];
    var newC = fin ? '<section class="act"><h3><span>Ongoing</span> New cases</h3>' + (alerts.length ? '<ul class="tlist">' + alerts.slice(0, 6).map(function (a) { return '<li><span class="pill concern">Open</span><button type="button" class="tlink" data-jump="' + esc(a.jump) + '">' + esc(a.text) + "</button></li>"; }).join("") + "</ul>" : '<p class="status">Nothing new. Cases open here when a scan, the fuel log, a bulletin or a renewal flags something.</p>') + "</section>" : "";
    var side = sideList(api);
    var sideH = side.length ? '<section class="card"><details><summary>Side missions (optional) · ' + side.length + '</summary><p class="status">Extra practice and XP. None of these block the story.</p><ul class="joblist">' + side.map(function (x) { return '<li><button type="button" class="mbtn" data-jump="' + x[3] + '"><span class="mt">' + esc(x[1]) + '</span><span class="status">' + esc(x[2]) + "</span></button></li>"; }).join("") + "</ul></details></section>" : "";
    var seenable = ["pro"].concat(Object.keys(d.beats).sort()).concat(CASES.filter(function (c) { return d.closed[c.id]; }).map(function (c) { return "case-" + c.id; })).concat(fin ? ["fin"] : []);
    var scenesH = '<section class="card"><details><summary>Scenes · ' + seenable.length + '</summary><ul class="joblist">' + seenable.map(function (id) { var s = sceneById(api, id); return s ? '<li><button type="button" class="mbtn" data-jump="story:' + id + '"><span class="mt">' + esc(s.t) + '</span><span class="status">' + (d.seen[id] ? "Watched" : "New") + "</span></button></li>" : ""; }).join("") + '</ul><p class="status">Lars is a made-up guide. Every fact he states comes from the sources used elsewhere in the app.</p></details></section>';
    var opts = '<section class="card"><details id="stOpts"' + (ui.opts ? " open" : "") + '><summary>Options: sync, backup, display</summary><div id="syncBox" class="syncbox"></div><div class="row"><button type="button" class="quiet" data-jump="backup:go">Back up or restore my progress</button></div><div class="field"><span class="flab">Detail level</span><div class="seg">' + DEPTH.map(function (x) { var lock = x[0] === "mech" && window.V60_PERK && !window.V60_PERK("mech"); return '<button type="button" data-depth="' + x[0] + '" aria-pressed="' + (depthOf(api) === x[0]) + '"' + (lock ? ' disabled title="Earn the Scholar skill"' : "") + ">" + x[1] + (lock ? " · Scholar skill" : "") + "</button>"; }).join("") + '</div></div><label class="inl"><input type="checkbox" id="stPlain"' + (d.plain ? " checked" : "") + '> Plain readings in Live link (skip decoding)</label><label class="inl"><input type="checkbox" id="stAll"' + (d.all ? " checked" : "") + '> Show everything (skip the reveal)</label><p class="status">Progress is saved on this device in this browser. Sync keeps every device on the same progress; a backup file is the offline safety net.</p></details></section>';
    $("stV-cases").innerHTML = '<div class="stnext">' + nextHTML + "</div>" + acts + newC + sideH + scenesH + opts;
    if (window.V60_SYNC) window.V60_SYNC.renderBox();
  }

  (window.V60_MODULES = window.V60_MODULES || []).push({
    id: "story",
    tabs: [{ id: "story", section: "learn", label: "Story", order: 5, html:
      '<section class="sthero"><p class="ans-k">The As-Is File</p><h2>Cases</h2><p class="lede">Every unknown about this car is a case. Each one points at an item of the manual; closing chapters there closes the case here. A step\'s <b>Lesson</b> button opens the Training behind it, and finishing the lesson ticks the step.</p><div id="stProg"></div><div class="seg" id="stSeg" role="group" aria-label="Story views"></div></section>' +
      '<div id="stV-cases"></div><div id="stV-file" hidden></div><div id="stV-timeline" hidden></div><div id="stV-codebook" hidden></div>' }],
    clean: function (v) {
      if (!v || typeof v !== "object") return null;
      var o = { seen: {}, closed: {}, manual: {}, beats: {}, avail: {}, revealed: {}, fresh: {}, known: {}, read: {}, cb: {}, quiz: {}, pending: [], depth: ["short", "det", "mech"].indexOf(v.depth) >= 0 ? v.depth : "det", plain: !!v.plain, all: !!v.all };
      ["seen", "manual", "avail", "revealed", "known"].forEach(function (k) { Object.keys(v[k] || {}).forEach(function (x) { if (typeof v[k][x] === "string") o[k][x] = v[k][x]; }); });
      ["fresh", "read"].forEach(function (k) { Object.keys(v[k] || {}).forEach(function (x) { if (v[k][x]) o[k][x] = 1; }); });
      Object.keys(v.closed || {}).forEach(function (k) { var c = v.closed[k]; if (c && typeof c.date === "string" && (c.how === "evidence" || c.how === "reason")) o.closed[k] = { date: c.date, how: c.how, reason: String(c.reason || "").slice(0, 200), lines: Array.isArray(c.lines) ? c.lines.filter(function (l) { return Array.isArray(l) && typeof l[1] === "string"; }).slice(0, 8) : [] }; });
      Object.keys(v.beats || {}).slice(-40).forEach(function (k) { var b = v.beats[k]; if (b && typeof b.t === "string" && Array.isArray(b.lines)) o.beats[k] = { t: b.t.slice(0, 120), date: String(b.date || ""), lines: b.lines.filter(function (l) { return Array.isArray(l) && typeof l[1] === "string"; }).slice(0, 8) }; });
      Object.keys(v.cb || {}).forEach(function (k) { var c = v.cb[k]; if (c && typeof c === "object") o.cb[k] = { seen: String(c.seen || ""), dec: c.dec ? String(c.dec) : "", sim: !!c.sim }; });
      Object.keys(v.quiz || {}).forEach(function (k) { var q = v.quiz[k]; if (q && typeof q === "object") { o.quiz[k] = {}; Object.keys(q).forEach(function (f) { if (q[f] === "r" || q[f] === "w") o.quiz[k][f] = q[f]; }); } });
      o.pending = Array.isArray(v.pending) ? v.pending.filter(function (p) { return typeof p === "string"; }).slice(-20) : [];
      return o;
    },
    render: function (api) { render(api); },
    init: function (api) {
      API = api;
      ALLTABS = Array.prototype.map.call(document.querySelectorAll("main > .panel"), function (p) { return p.id.slice(2); });
      var ov = document.createElement("div");
      ov.id = "cinema"; ov.className = "cinema"; ov.hidden = true; ov.tabIndex = -1; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "Story scene");
      ov.innerHTML = '<div class="cin-top"><span class="cin-title"></span><button type="button" class="cin-skip">Skip</button></div><div class="cin-stage"></div><p class="cin-cap" aria-live="polite"></p><div class="cin-bot"><div class="cin-dots"></div><button type="button" class="cin-next">Next</button></div>';
      document.body.appendChild(ov);
      ov.addEventListener("click", function (e) { if (e.target.closest(".cin-skip")) { close(api); return; } next(api); });
      ov.addEventListener("keydown", function (e) { if (e.key === "Escape") close(api); else if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") { e.preventDefault(); next(api); } });
      var sh = document.createElement("div");
      sh.id = "decodeSheet"; sh.className = "dsheet"; sh.hidden = true; sh.setAttribute("role", "dialog"); sh.setAttribute("aria-modal", "true"); sh.setAttribute("aria-label", "Decoded signal");
      sh.innerHTML = '<div class="dsin"><p class="ans-k">Decoded</p><div class="dsb" id="dsBody"></div><div class="row"><button type="button" class="dsclose">Got it</button><button type="button" class="quiet sm" data-speak="#dsBody">Listen</button></div></div>';
      document.body.appendChild(sh);
      sh.addEventListener("click", function (e) { if (e.target === sh || e.target.closest(".dsclose")) { closeDecode(); return; } if (e.target.closest("[data-jump]")) { sh.hidden = true; document.body.classList.remove("cine-open"); } });
      sh.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDecode(); });
      document.addEventListener("click", function (e) {
        var f = e.target.closest && e.target.closest("[data-jump]"); if (!f) return;
        var from = f.getAttribute("data-from"), j = f.getAttribute("data-jump");
        if (from) { var cc = caseById(from); window.V60_FROMCASE = cc ? { id: cc.id, t: cc.t } : null; }
        else if (j === "tab:academy" || (j.indexOf("mission:") === 0 && !f.closest("#p-story"))) window.V60_FROMCASE = null;
      }, true);
      document.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("[data-decode]"); if (b) { e.preventDefault(); e.stopPropagation(); openDecode(b.getAttribute("data-decode")); } }, true);
      api.$("p-story").addEventListener("click", function (e) {
        var b = e.target.closest && e.target.closest("button"); if (!b) return;
        var d = D(api), k;
        if ((k = b.getAttribute("data-view"))) { ui.view = k; render(api); return; }
        if (b.id === "stPrint") { document.body.classList.add("printing-file"); window.print(); setTimeout(function () { document.body.classList.remove("printing-file"); }, 500); return; }
        if (b.id === "stShareFile") { var fd = document.getElementById("fileDoc"); if (fd && window.V60_FILE) window.V60_FILE.save("v60-the-file-" + api.todayStr() + ".txt", "THE AS-IS FILE, 2016 Volvo V60 T5\n" + window.V60_FILE.textOf(fd), "text/plain").catch(function () {}); return; }
        if ((k = b.getAttribute("data-depth"))) { ui.opts = true; d.depth = k; api.save(); render(api); return; }
        if ((k = b.getAttribute("data-case"))) { ui.open = ui.open === k ? "" : k; render(api); var el = document.querySelector('[data-case="' + k + '"]'); if (el && el.scrollIntoView && ui.open === k) el.scrollIntoView({ block: "nearest" }); return; }
        if ((k = b.getAttribute("data-man"))) { if (d.manual[k]) delete d.manual[k]; else d.manual[k] = api.todayStr(); api.save(); render(api); return; }
        if ((k = b.getAttribute("data-qz"))) { var p = k.split("|"); d.quiz[p[0]] = d.quiz[p[0]] || {}; d.quiz[p[0]][p[1]] = p[2]; api.save(); api.updateHud(); render(api); return; }
        if ((k = b.getAttribute("data-reason"))) { var sel = api.$("rs-" + k).value, txt = api.$("rt-" + k).value.trim(), r = [sel, txt].filter(Boolean).join(": ") || "No reason given"; d.closed[k] = { date: api.todayStr(), how: "reason", reason: r.slice(0, 200), lines: [] }; d.pending.push("case-" + k); api.save(); api.updateHud(); api.renderAll(); render(api); return; }
        if ((k = b.getAttribute("data-reopen"))) { delete d.closed[k]; d.pending = d.pending.filter(function (p) { return p !== "case-" + k; }); ui.open = k; api.save(); render(api); return; }
      });
      var pin = document.createElement("input"); pin.type = "file"; pin.accept = "image/*"; pin.setAttribute("capture", "environment"); pin.hidden = true; pin.id = "stProofIn"; document.body.appendChild(pin);
      var proofFor = null;
      document.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("[data-proof]"); if (!b) return; proofFor = b.getAttribute("data-proof").split("|"); pin.value = ""; pin.click(); });
      pin.addEventListener("change", function () {
        var f = pin.files && pin.files[0], A = api.assets(); if (!f || !proofFor) return;
        if (!A) { alertNote(api, "Photos can't be stored in this view."); return; }
        var c = caseById(proofFor[0]), i = +proofFor[1];
        api.shrinkPhoto(f, "proof").then(function (b) { return A.upload(b, { name: "v60-proof-" + api.todayStr() + ".jpg" }); }).then(function (up) {
          api.addPhoto({ id: api.uid(), asset: up.id, url: up.local ? null : up.url, local: !!up.local, date: api.todayStr(), kind: "proof", part: null, note: (c ? c.t + ": " + c.steps[i].t : "").slice(0, 200), ai: null, cs: proofFor[0], st: i });
          render(api);
        }).catch(function (e) { alertNote(api, (e && e.message) || "The photo could not be saved."); });
      });
      if (!window.__V60_TEST) setTimeout(function () { var d = D(api); if (!d.seen.cold && !d.seen.pro && !Object.keys(api.acad().done || {}).length) { d.seen.cold = api.todayStr(); api.save(); play(api, "cold"); } }, 900);
      api.$("p-story").addEventListener("change", function (e) {
        var d = D(api);
        if (e.target.id === "stPlain") { d.plain = e.target.checked; api.save(); return; }
        if (e.target.id === "stAll") { ui.opts = true; d.all = e.target.checked; api.save(); sweep(api); api.renderAll(); render(api); }
      });
    },
    xp: function (api) {
      var d = api.mod("story"); if (!d || !d.closed) return 0;
      var x = Object.keys(d.closed).reduce(function (s, k) { var c = d.closed[k]; return s + (k === "fin" ? 150 : (c.how === "evidence" ? 40 : 10)); }, 0);
      Object.keys(d.quiz || {}).forEach(function (k) { Object.keys(d.quiz[k]).forEach(function (f) { if (d.quiz[k][f] === "r") x += 5; }); });
      Object.keys(d.cb || {}).forEach(function (k) { if (d.cb[k].dec) x += 3; });
      return x;
    },
    jump: function (api, kind, id) {
      if (kind === "story") { play(api, id); return true; }
      if (kind === "case") { ui.open = id; ui.view = "cases"; api.go("story"); return true; }
      if (kind === "opts") { ui.view = "cases"; ui.opts = true; api.go("story"); var o = document.getElementById(id === "sync" ? "syncBox" : "stOpts") || document.getElementById("stOpts"); if (o && o.scrollIntoView) o.scrollIntoView({ block: "start" }); if (id === "sync") { var f = document.getElementById("syncTok"); if (f && f.focus) try { f.focus({ preventScroll: true }); } catch (e) {} } return true; }
      return false;
    },
    today: function (api) {
      sweep(api);
      var d = D(api), esc = api.esc, pend = d.pending.filter(function (p) { return sceneById(api, p); });
      if (!d.seen.pro) return [{ order: 4, html: '<article class="tcard story"><p class="ans-k">Your story starts here</p><h3>The As-Is File</h3><p>A used Volvo, sold as-is, with no records. Every unknown is a case.</p><button type="button" data-jump="story:pro">Watch the prologue</button></article>' }];
      if (pend.length) return [{ order: 4, html: '<article class="tcard story"><p class="ans-k">New scene</p><h3>' + esc(sceneById(api, pend[0]).t) + '</h3><button type="button" data-jump="story:' + pend[0] + '">Watch</button></article>' }];
      var nx = nextStep(api);
      if (!nx) return [];
      return [{ order: 4, html: '<article class="tcard story"><p class="ans-k">Next in your story · ' + esc(nx.c.t) + "</p><h3>" + esc(nx.s.t) + '</h3><div class="row">' + (gl(nx.c) === 0 ? '<button type="button" data-guide="' + nx.c.id + '">Start</button>' : "") + (nx.s.go ? '<button type="button"' + (gl(nx.c) === 0 ? ' class="quiet"' : "") + ' data-from="' + nx.c.id + '" data-jump="' + esc(nx.s.go) + '">' + (nx.s.go.indexOf("mission:") === 0 ? "Start the lesson" : "Go") + "</button>" : "") + '<button type="button" class="quiet" data-jump="case:' + nx.c.id + '">Open the case</button></div></article>' }];
    }
  });
})();
