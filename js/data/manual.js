/* The workshop manual: the car is the menu.
   views  = places you look (hood open, the wheel, inside, underneath, walk-around). Each is a figure with numbered points.
   items  = the parts you can tap in a view. Each item is a small manual of chapters in order of difficulty:
            K Know it, C Check it, S Service it, D Diagnose it, U Upgrade it. Items only have the chapters there is sourced content for.
   steps  = things done in the rest of the app. Each step names the evidence that closes it:
            mission (Training), kb (Library article read), diy (DIY job done), tree (troubleshooter walked), tab (page opened),
            photo (a photo of that kind saved), record (a service record for that item), oil (oil checks logged), scans (real health checks),
            receipts, build (build month entered), tsb (bulletin marked), upg (upgrade decided), recall (recalls set), manual (the owner confirms).
   opens  = chapters that unlock when this one closes. The chapter before it in the same item always opens the next one.
            Story cases also open an item's first chapter early (CASE_OPENS). Keep fan-out small: at most two new glows per close.
   Numbering is the manual's: view 1 is the engine bay, 1.3 the battery, 1.3.1 its first chapter.
   Positions (at) are on the schematic figures in manual.js, 358 wide. The owner's own photo replaces the figure once pinned. */
window.V60_MANUAL_DATA = (function () {
  var V = [
    { id: "bay", num: 1, n: "Engine bay", enter: "Open the hood", d: "Everything under the hood you can check without tools, and the parts you should only look at.", fig: "bay", hint: "Stand at the front bumper with the hood open. Photograph the whole bay in one frame." },
    { id: "wheel", num: 2, n: "Wheels & brakes", enter: "Look at the wheel", d: "Tires, the pressure monitor, and the brakes you can see through the spokes.", fig: "wheel", hint: "Crouch at the front wheel, straight on, so the tire, rim and the brake behind it are all in frame." },
    { id: "cabin", num: 3, n: "Cabin", enter: "Get in", d: "The driver display, the controls, the diagnostic port under the dash, and the glovebox.", fig: "cabin", hint: "From the driver's seat, doors closed: steering wheel, display and the centre stack in one frame." },
    { id: "under", num: 4, n: "Underside", enter: "Look underneath", d: "Leaks, the exhaust, the suspension and the driveline. A torch and the ground.", fig: "under", hint: "No photo needed yet. The drawing stands in until you have the car raised safely." },
    { id: "body", num: 5, n: "Lights & body", enter: "Walk around", d: "Bulbs, wipers, glass and tint, paint and the small dents.", fig: "body", hint: "A straight side-on photo of the whole car, and one of the rear." }
  ];
  /* preface: the safety chapter every view waits for */
  var PREFACE = { id: "0", n: "Before you touch anything", d: "The four jobs every car does, the safety rules, and your first look under the hood. Volvo's manual flags two hazards on this car: the engine can restart on its own when it is only auto-stopped, and the cooling fan can run for minutes after shutdown.", time: "About 20 minutes",
    steps: [
      { mission: "m-sys" },
      { mission: "m-safe" },
      { mission: "m-hood", why: "A handle under the left side of the dash, then the catch at the front edge of the hood." },
      { mission: "m-five", why: "Oil filler cap, coolant tank, brake fluid, washer fluid and the battery covers. Look, don't open." }
    ], opens: ["1.1.1", "1.2.1"] };

  var I = [
    /* ---------- view 1: engine bay ---------- */
    { id: "oil", view: "bay", num: "1.1", n: "Oil", d: "The level is read in the driver display on this engine; there is no dipstick.", bay: "oilcap", part: "oilfilter", record: "oil", tags: ["Fluids", "Engine", "Maintenance"], photo: ["fluid"], at: [128, 98],
      spec: [["Spec", "ACEA A5/B5 5W-30, or Volvo 0W-20"], ["Capacity", "6.2 US qt with filter"], ["Level", "Driver display, no dipstick"], ["Hood label, your photo", "Castrol EDGE Professional, ACEA A5/B5, SAE 5W-30"]],
      chapters: [
        { tier: "K", t: "Know it", d: "What the oil does, which oil this engine takes, and why some 2015–16 Drive-E engines use more of it than they should.", steps: [{ kb: "a-oil" }, { bay: "oilcap", t: "Find the filler cap on the map", why: "Yellow cap on top of the engine. Nothing to open." }], opens: ["1.3.1"] },
        { tier: "C", t: "Check it", d: "Read the level the way Volvo describes, then log it. Repeating this across 1,000 miles is what tells you whether the engine burns oil.", time: "5 minutes, engine warm then off", steps: [{ mission: "m-oil" }, { oil: 1, t: "Log one oil level reading", why: "Logged readings are the evidence The Thirst case needs.", go: "tab:records" }], opens: ["1.5.1", "2.1.1"] },
        { tier: "S", t: "Service it", d: "Topping up correctly, and getting the oil change on record so the next due date is real instead of guessed.", steps: [{ diy: "j-oilcheck" }, { record: "oil", t: "Log an oil and filter change", why: "A receipt or your own record. The schedule works from this date and mileage.", go: "tab:records" }], opens: ["1.4.1", "1.9.1"] },
        { tier: "D", t: "Diagnose it", d: "A low oil message, a rising consumption rate, and what the oil consumption program means for your car.", steps: [{ tree: "oil" }, { kb: "a-oilprogram" }, { oil: 3, t: "Three logged oil readings", why: "Three points across real miles give a consumption rate the app can show.", go: "tab:records" }] }
      ] },
    { id: "coolant", view: "bay", num: "1.2", n: "Coolant & cooling", d: "The expansion tank, the radiator and the fan. Pressurised when hot; check cold only.", bay: "coolant", part: "coolant", record: "coolant", tags: ["Fluids", "Engine"], photo: ["fluid"], at: [52, 150],
      spec: [["Coolant", "Volvo coolant, 50/50 with water"], ["Capacity", "8.7 US qt"], ["Rule", "Never open the tank hot"], ["Cap, your photo", "145 kPa"], ["A/C, hood label", "R-134a, 800 g, Volvo PAG oil, with leak-tracer dye (the manual says 770 g; the label on the car wins)"]],
      chapters: [
        { tier: "K", t: "Know it", d: "The cooling loop: where the tank is, what the fan does, and why the system stays dangerous for minutes after the engine stops.", steps: [{ mission: "m-fluids" }, { bay: "coolant", t: "Find the expansion tank and the radiator", why: "Passenger side of the bay, with MIN and MAX marks." }], opens: ["1.6.1"] },
        { tier: "C", t: "Check it", d: "Level between the marks, cold, without opening anything. Crusty stains tell you about leaks before the gauge does.", steps: [{ mission: "m-fluidlook" }, { diy: "j-fluids" }], opens: ["1.7.1"] },
        { tier: "D", t: "Diagnose it", d: "Running hot in traffic, a sweet smell, steam. What to do at the roadside and what a shop will look at.", steps: [{ tree: "hot" }] }
      ] },
    { id: "battery", view: "bay", num: "1.3", n: "Battery", d: "Under covers in the bay. Start/stop cars like yours need an AGM battery and have a second support battery.", bay: "battery", part: "battery", tags: ["Electrical"], at: [302, 68],
      spec: [["Type", "AGM (start/stop)"], ["Jump start", "Negative clamp on the ground point, not the battery"], ["Life in Texas heat", "3 to 5 years is common (unconfirmed)"]],
      chapters: [
        { tier: "K", t: "Know it", d: "Where it sits, why the ground point for a jump start is on the engine mount, and how start/stop changes the rules.", steps: [{ bay: "battery", t: "Find the battery covers on the map" }, { bay: "ground", t: "Find the jump-start ground point" }, { kb: "a-startstop" }], opens: ["1.8.1"] },
        { tier: "C", t: "Check it", d: "Terminals, covers, a free load test at a parts store, and the signs of a battery on its way out.", steps: [{ diy: "j-battery" }] },
        { tier: "S", t: "Service it", d: "Jump-starting the car the way Volvo's manual orders the clamps.", steps: [{ diy: "j-jump" }] },
        { tier: "D", t: "Diagnose it", d: "A click without a crank, a slow crank, random warnings at start.", steps: [{ tree: "nostart" }] }
      ] },
    { id: "belts", view: "bay", num: "1.4", n: "Belts & timing", d: "The accessory belt you can see and the timing belt you cannot. Nobody can say whether yours was ever replaced.", bay: "belt", part: "timing", record: "timingbelt", tags: ["Engine", "Maintenance"], at: [74, 94],
      spec: [["Timing drive", "Belt"], ["History", "Unknown"], ["Limit", "About 10 years (see the article)"]],
      chapters: [
        { tier: "K", t: "Know it", d: "Why the timing belt is this car's biggest unknown, and what happens on this engine if it snaps.", steps: [{ kb: "a-belt" }, { bay: "belt", t: "Find the belt end on the map", why: "Under a cover at the end of the engine. Nothing to see without removing it." }] },
        { tier: "C", t: "Check it", d: "Detective work: shop stickers, the lot's paperwork, a call to the dealer with the VIN, a specialist's inspection.", steps: [{ mission: "m-belt" }, { mission: "m-ppi" }], opens: ["3.5.1"] },
        { tier: "S", t: "Service it", d: "A shop job. What a timing belt kit is, what it costs, and getting it on record.", steps: [{ record: "timingbelt", t: "Log a timing belt replacement", why: "From a receipt, a sticker you trust, or the job you have done. This closes The Belt.", go: "tab:records" }] }
      ] },
    { id: "filters", view: "bay", num: "1.5", n: "Air & cabin filters", d: "The engine air filter in the box under the hood; the cabin filter behind the glovebox.", bay: "airbox", part: "airfilter", record: "airfilter", tags: ["Maintenance"], at: [292, 142],
      chapters: [
        { tier: "K", t: "Know it", d: "Everything the turbo breathes passes the air filter first. The cabin filter is the one you smell.", steps: [{ bay: "airbox", t: "Find the air filter box on the map" }] },
        { tier: "C", t: "Check it", d: "Open the clips, hold the filter to the light, reseat it carefully.", steps: [{ mission: "m-airf" }, { mission: "m-cabin" }] },
        { tier: "S", t: "Service it", d: "The cabin filter is the first real job: no tools, behind the glovebox. Your first wrench.", steps: [{ diy: "j-cabin" }] }
      ] },
    { id: "bfluid", view: "bay", num: "1.6", n: "Brake fluid", d: "The reservoir at the firewall on the driver's side. A slow drop is the pads wearing; a sudden drop is a leak.", bay: "brake", part: "bfluid", record: "brakefluid", tags: ["Fluids"], at: [320, 40],
      spec: [["Fluid", "DOT 4, boiling point above 536 F; 0.63 US qt in the system"], ["Volvo interval", "3 years or 40,000 miles (2016 US schedule); the owner's manual defers to the service booklet"], ["Where, your photo", "Under the round cover on the driver's side of the cowl; the yellow cap says DOT 4 from a sealed container, clean the cap before removing"]],
      chapters: [
        { tier: "K", t: "Know it", d: "Where it is, what the level means, and why you don't just top it up.", steps: [{ bay: "brake", t: "Find the reservoir on the map" }] },
        { tier: "C", t: "Check it", d: "Between MIN and MAX with the cap closed. Low means get the brakes looked at.", steps: [{ diy: "j-fluids" }] }
      ] },
    { id: "washer", view: "bay", num: "1.7", n: "Washer fluid", d: "The one fluid you can always top up yourself.", bay: "washer", part: "wipers", tags: ["Fluids"], at: [330, 184],
      spec: [["Capacity", "6.8 US qt with headlight washers, 4.7 without"]],
      chapters: [
        { tier: "K", t: "Know it", d: "Where the filler is and why washer fluid, not water.", steps: [{ bay: "washer", t: "Find the washer filler on the map" }] },
        { tier: "C", t: "Check it", d: "Top it up. Done.", steps: [{ diy: "j-fluids" }] }
      ] },
    { id: "fuses", view: "bay", num: "1.8", n: "Fuses", d: "The fuse box in the bay and the second one near the cowl on start/stop cars. The lid shows the map.", bay: "fusebox", part: "modules", tags: ["Electrical"], at: [234, 64],
      spec: [["Where, your photo", "The black box on the driver's side next to the air intake duct, lid marked with a fuse and a book symbol; the box behind it carries the battery symbol"]],
      chapters: [
        { tier: "K", t: "Know it", d: "Where the fuse boxes are and which fuses Volvo says an owner may change.", steps: [{ kb: "a-fuses" }, { bay: "fusebox", t: "Find the fuse box on the map" }] },
        { tier: "S", t: "Service it", d: "Pull, inspect, replace with the same rating. Never a higher one.", steps: [{ diy: "j-fuse" }] }
      ] },
    { id: "plugs", view: "bay", num: "1.9", n: "Spark plugs & coils", d: "Under the engine cover. Volvo replaced plugs free on 2015–16 four-cylinders under service action S29842.", bay: "coils", part: "coils", record: "plugs", tags: ["Engine"], at: [166, 64],
      spec: [["Engine cover, your photo", "B4204T11"]],
      chapters: [
        { tier: "K", t: "Know it", d: "One coil per cylinder. A failing one is a misfire and a shaky idle. Don't touch them hot.", steps: [{ bay: "coils", t: "Find the coils on the map" }] },
        { tier: "D", t: "Diagnose it", d: "Service action S29842: ask a dealer by VIN whether the free plug replacement was done.", steps: [{ tsb: "S29842", t: "Check S29842 with a dealer and mark it", go: "tsb:S29842" }] }
      ] },

    /* ---------- view 2: wheels & brakes ---------- */
    { id: "tires", view: "wheel", num: "2.1", n: "Tires", d: "Size, pressure, tread, age. The pressure light has been on since you bought the car.", part: "tread", record: "tires", tags: ["Tires"], photo: ["sidewall", "tread"], at: [60, 160],
      spec: [["Size", "215/50R17 on 17 x 7.5 in wheels"], ["Pressure", "38 psi front and rear, cold"], ["Age rule", "Replace at 6 years from the DOT date"], ["Placard, your photo", "215/50R17 front and rear, 260 kPa / 38 psi cold, spare: none"], ["On the car, your photos", "Sentury UHP 215/50ZR17 95W, extra load, max 50 psi, made in Thailand; DOT week 43 of 2023 on the one photographed"]],
      chapters: [
        { tier: "K", t: "Know it", d: "What the numbers on a sidewall mean, how to read the DOT date, and what the placard on the door pillar is for.", steps: [{ mission: "m-tires" }], opens: ["2.2.1"] },
        { tier: "C", t: "Check it", d: "Pressure cold against the placard, tread at three points per tire, the DOT date on each sidewall. On your four tires.", time: "About 15 minutes, cold tires", steps: [{ mission: "m-psi" }, { mission: "m-tread" }, { photo: "sidewall", t: "Photograph one sidewall", why: "The app reads the DOT date on your phone and flags a tire past 6 years.", go: "tab:my" }], opens: ["2.3.1", "3.1.1"] },
        { tier: "S", t: "Service it", d: "Setting pressures and recalibrating the indirect monitor, the sealing kit, changing a wheel.", steps: [{ diy: "j-tires" }, { kb: "a-tirekit" }] },
        { tier: "D", t: "Diagnose it", d: "The light that won't go out, vibration at speed, uneven wear, and bulletin TJ29818.", steps: [{ tree: "tpms" }, { tree: "vibe" }, { kb: "a-tpms" }] },
        { tier: "U", t: "Upgrade it", d: "A matched set chosen for Austin heat and rain, with the cost against the benefit.", steps: [{ upg: "tires" }] }
      ] },
    { id: "tpms", view: "wheel", num: "2.2", n: "Pressure monitor", d: "Indirect: it compares wheel speeds through ABS. No sensors in the wheels, so it must be recalibrated after any pressure change.", part: "pressure", tags: ["Tires"], at: [130, 52],
      chapters: [
        { tier: "K", t: "Know it", d: "How the indirect monitor works and why it can't tell you a pressure number.", steps: [{ kb: "a-tpmshow" }] },
        { tier: "C", t: "Check it", d: "Set all four pressures cold, then run the calibration in the car's menu.", steps: [{ diy: "j-tires" }] },
        { tier: "D", t: "Diagnose it", d: "If the light returns after a correct calibration, the fault is in the car, not the tires. Bulletin TJ29818 covers one cause.", steps: [{ tree: "tpms" }, { tsb: "TJ29818", t: "Read bulletin TJ29818 and mark it", go: "tsb:TJ29818" }] }
      ] },
    { id: "brakes", view: "wheel", num: "2.3", n: "Brake pads & rotors", d: "Visible through the spokes. Pad thickness and the rotor's lip tell most of the story.", part: "pads", record: "brakes", tags: ["Brakes", "Maintenance"], photo: ["brake"], at: [195, 118],
      chapters: [
        { tier: "K", t: "Know it", d: "What pads, rotors and calipers do, and what the parts list says to look for.", steps: [{ part: "pads", t: "Read the brake pads entry in the parts list" }, { part: "rotors", t: "Read the brake discs entry" }], opens: ["2.4.1"] },
        { tier: "C", t: "Check it", d: "Photograph the pad edge through the spokes and log an inspection. A shop does the rest.", steps: [{ photo: "brake", t: "Photograph a brake pad through the wheel", go: "tab:my" }, { record: "brakes", t: "Log a brake inspection", go: "tab:records" }], opens: ["4.1.1"] },
        { tier: "D", t: "Diagnose it", d: "Squeal, grind, pulsing, a soft pedal: what each one usually is.", steps: [{ tree: "brakes" }] },
        { tier: "U", t: "Upgrade it", d: "Fresh pads and rotors when worn. A shop job on this car; the rear linings are workshop-only in Volvo's manual.", steps: [{ upg: "brakes" }] }
      ] },
    { id: "parking", view: "wheel", num: "2.4", n: "Parking brake", d: "Electric on this car: a control on the console, a motor at the wheels. It has its own messages, and a flat battery locks it.", part: "parking", tags: ["Brakes"], at: [290, 180],
      spec: [["Type", "Electric, control on the console"], ["Emergency use", "Hold the control while moving; a signal sounds above 6 mph"], ["Flat battery", "Cannot apply or release"]],
      chapters: [
        { tier: "K", t: "Know it", d: "Applying, releasing by hand and automatically, the emergency use, the messages, and why a flat battery locks it. All from Volvo's manual for this car.", steps: [{ kb: "a-parkbrake" }, { part: "parking", t: "Read the parking brake entry in the parts list" }] },
        { tier: "C", t: "Check it", d: "Work it once, parked, and learn what normal looks like: the flashing symbol, the faint motor sound, the pedal that moves a little.", time: "5 minutes, parked", steps: [
          { manual: "pb-apply", t: "Apply it and watch the symbol", why: "Foot firmly on the brake pedal, push the control. The symbol flashes, then stays lit. The faint motor sound and the slight pedal movement are normal." },
          { manual: "pb-release", t: "Release it both ways", why: "By hand: belt on, ignition on, brake pedal down, pull the control. Automatically: engine running, belt on, D or R, accelerator. It will not auto-release without the belt." },
          { manual: "pb-msg", t: "Note any message", why: "\"Park brake not fully released\", \"Parking brake not applied\" or \"Service required\" is a fault. Apply and release several times. If it stays, a Volvo workshop.", optional: true }] },
        { tier: "D", t: "Diagnose it", d: "A message that stays, and the one cause you can fix yourself: a battery too low to move the motor.", steps: [
          { manual: "pb-fault", t: "If a message stays after several tries, log it and book the workshop", why: "Until it is fixed, park in P with the wheels turned into the curb. Driving with the message gives a warning sound.", go: "tab:diag" },
          { diy: "j-jump", t: "Know the jump-start order: a flat battery locks the parking brake" }] }
      ] },

    /* ---------- view 3: cabin ---------- */
    { id: "display", view: "cabin", num: "3.1", n: "Driver display & warning lights", d: "Red means stop. Amber means soon. The tire-pressure light is amber.", part: "modules", tags: ["Warning lights", "Basics"], photo: ["dash"], at: [110, 86],
      chapters: [
        { tier: "K", t: "Know it", d: "Every light, what colour means, and the three that mean pull over now.", steps: [{ mission: "m-warn" }, { kb: "a-lights" }], opens: ["3.4.1"] },
        { tier: "C", t: "Check it", d: "Which lights are on right now, photographed, so the record starts today.", steps: [{ photo: "dash", t: "Photograph the display with the ignition on", why: "The app reads the text on your phone.", go: "tab:my" }], opens: ["3.2.1", "5.1.1"] },
        { tier: "D", t: "Diagnose it", d: "The check-engine light, steady or flashing, and what to do in each case.", steps: [{ tree: "cel" }] }
      ] },
    { id: "controls", view: "cabin", num: "3.2", n: "Controls & start/stop", d: "The START/STOP ENGINE button, the three ignition modes it steps through, the Eco button if your car has one, and when start/stop refuses to stop the engine.", tags: ["Basics"], at: [230, 120],
      spec: [["Ignition modes", "0, I (press briefly), II (hold about 2 s), foot off the brake"], ["No start after 3 tries", "Wait 3 minutes"], ["Eco button", "Optional on some four-cylinders; unconfirmed on yours"]],
      chapters: [
        { tier: "K", t: "Know it", d: "Starting, the three ignition modes without the engine, the key rules, and how start/stop decides when to stop.", steps: [{ kb: "a-ignition" }, { kb: "a-startstop" }] },
        { tier: "C", t: "Check it", d: "Step through the ignition modes once, parked, and use mode II as a lamp check.", time: "5 minutes, parked", steps: [
          { manual: "ign-1", t: "Ignition mode I without starting", why: "Key in the slot, foot off the brake, press START/STOP ENGINE briefly. Windows, wipers and the blower work. Press briefly again to go back to 0." },
          { manual: "ign-2", t: "Mode II: hold the button about 2 seconds", why: "Headlights come on and every warning light shows for 5 seconds: that is your bulb-and-lamp check. Only for a moment, to spare the battery. Back to 0 with a brief press." },
          { manual: "eco-btn", t: "Look for an ECO button on the centre console", why: "Volvo's US manual calls Eco optional on certain four-cylinders. Unconfirmed on your car until you look; note what you find.", optional: true }] },
        { tier: "D", t: "Diagnose it", d: "Start/stop not stopping the engine is usually a condition, not a fault. And the economical-driving list from Volvo's manual.", steps: [{ tree: "ss" }, { kb: "a-steering", t: "Read: economical driving, Volvo's list (in the steering article)" }] }
      ] },
    { id: "port", view: "cabin", num: "3.3", n: "The diagnostic port", d: "Under the dash on the driver's side. The adapter plugs in here and the car starts talking. Live link lives here.", tags: ["Diagnostics"], at: [62, 186], instrument: true,
      chapters: [
        { tier: "K", t: "Know it", d: "What OBD-II can and cannot tell you, where the port is, and the Codebook that decodes the adapter's raw labels.", steps: [{ mission: "m-obd" }, { mission: "m-port" }, { kb: "a-obd" }] },
        { tier: "C", t: "Check it", d: "The first real health check with the adapter, saved to the Garage.", steps: [{ mission: "m-scan" }, { scans: 1, t: "One real health check saved", go: "tab:live" }] },
        { tier: "D", t: "Diagnose it", d: "A baseline drive, live data, and what Volvo's own system can see that the adapter can't.", steps: [{ mission: "m-log" }, { tab: "lab", t: "Open the Data lab", why: "Instruments stay instruments: gauges, traces and the drive-cycle coach." }, { kb: "a-vida" }] },
        { tier: "U", t: "Upgrade it", d: "Polestar's optimization is the sanctioned route. Aftermarket tunes are not, in a county with emissions testing.", steps: [{ upg: "polestar" }, { kb: "a-polestar" }] }
      ] },
    { id: "seats", view: "cabin", num: "3.4", n: "Seats & interior", d: "What Premier trim includes, the safety systems every 2016 V60 has, and keeping the inside the Volvo way.", tags: ["Identity", "Safety"], photo: ["other"], at: [322, 190],
      spec: [["Upholstery, your photos", "Leather, light coloured; creasing on the driver's seat bolster"]],
      chapters: [
        { tier: "K", t: "Know it", d: "Premier trim, your options, and the safety systems in the cabin.", steps: [{ kb: "a-trim" }, { kb: "a-safety" }] },
        { tier: "S", t: "Service it", d: "Cleaning the interior with what Volvo recommends.", steps: [{ diy: "j-interior" }] }
      ] },
    { id: "glove", view: "cabin", num: "3.5", n: "Glovebox", d: "Papers and records: registration, insurance, inspection, receipts, recalls, bulletins. A filing cabinet, not a lesson.", tags: ["Ownership", "Recalls", "Inspection"], at: [300, 150],
      spec: [["Door label, your photo", "Date 08/15; market code 31; type PC; colour code 717-46"], ["Weights, door label", "GVWR 4,740 lb; GAWR 2,580 lb front, 2,300 lb rear"]],
      chapters: [
        { tier: "K", t: "Know it", d: "Enter the mileage, hunt for service history, and learn what a bulletin is.", steps: [{ mission: "m-odo" }, { mission: "m-hist" }, { kb: "a-tsb" }], opens: ["5.6.1"] },
        { tier: "C", t: "Check it", d: "Recalls checked by VIN, the build month read off the door-pillar label.", steps: [{ mission: "m-recall" }, { build: 1, t: "Enter the build month from the door label", why: "Photograph the label; the app reads the month on your phone.", go: "tab:bulletins" }] },
        { tier: "S", t: "Service it", d: "Receipts in, renewal dates in, the first real service record on file.", steps: [{ receipts: 1, t: "Add a receipt", go: "tab:glove" }, { tab: "glove", t: "Enter the registration and insurance dates", go: "tab:glove" }] },
        { tier: "D", t: "Diagnose it", d: "Which bulletins apply to your build, and what the owner complaints say actually goes wrong.", steps: [{ tab: "bulletins", t: "Mark the bulletins that match a symptom you have", go: "tab:bulletins" }, { kb: "a-complaints" }] }
      ] },

    /* ---------- view 4: underside ---------- */
    { id: "leaks", view: "under", num: "4.1", n: "Leaks & drips", d: "What a drip under the car is, by colour, place and smell.", tags: ["Fluids"], photo: ["leak"], at: [170, 80],
      chapters: [
        { tier: "K", t: "Know it", d: "Things owners don't know to check, and how to read a stain on the driveway.", steps: [{ mission: "m-blind" }] },
        { tier: "C", t: "Check it", d: "A torch under the car, cold. Photograph anything wet.", steps: [{ photo: "leak", t: "Photograph the underside or a drip", go: "tab:my" }], opens: ["4.2.1", "4.3.1"] }
      ] },
    { id: "exhaust", view: "under", num: "4.2", n: "Exhaust & emissions", d: "Travis County tests emissions. The exhaust, the catalyst and the readiness monitors decide whether you pass.", part: "pipes", tags: ["Inspection"], at: [262, 100],
      spec: [["Emission label, your photo", "2016 MY; US EPA/Canada T2B5 LDV; California ULEV 125 PC; CA II OBD; gasoline"], ["Engine family", "GVVXV02.0U3T; EVAP GVVXR0130EV3; DFI, TC, CAC, HO2S, WR-HO2S, TWC"]],
      chapters: [
        { tier: "K", t: "Know it", d: "How the emissions inspection works here and what makes a car fail.", steps: [{ kb: "a-inspect" }], opens: ["4.4.1"] },
        { tier: "C", t: "Check it", d: "Readiness monitors from a real health check, before the inspection, not at it.", steps: [{ scans: 1, t: "A health check with readiness monitors", go: "tab:live" }] }
      ] },
    { id: "susp", view: "under", num: "4.3", n: "Suspension & steering", d: "Struts, arms, bushings, and a fully electric steering rack with no fluid to check. Noises and feelings are the diagnostics.", part: "struts", tags: ["Drivetrain", "Steering"], at: [60, 118],
      spec: [["Steering", "Electric, no pump or fluid"], ["Wheel adjustment", "Lever under the column: height and reach, parked only"], ["Steering force menu", "Optional; unconfirmed on yours"]],
      chapters: [
        { tier: "K", t: "Know it", d: "Adjusting the wheel, the steering force setting, what is on the wheel, and what each suspension part does.", steps: [{ kb: "a-steering" }, { part: "struts", t: "Read the struts entry" }, { part: "arms", t: "Read the control arms entry" }] },
        { tier: "C", t: "Check it", d: "Set the wheel for you, look for the steering force menu, and learn what the car feels like when it is right.", steps: [
          { manual: "sw-adj", t: "Set the steering wheel, parked", why: "Pull the lever toward you, move the wheel for height and reach, push the lever back. Press the wheel lightly if the lever is stiff. Never while driving." },
          { manual: "sw-force", t: "Find the steering force setting", why: "My Car, then Car settings, then Steering wheel force: Low, Medium, High. Optional equipment; if the entry is not there, your car does not have it. Note which.", optional: true },
          { mission: "m-feel" }] },
        { tier: "D", t: "Diagnose it", d: "What that noise and that feeling mean, and the vibration tree.", steps: [{ mission: "m-sound" }, { tree: "vibe" }] }
      ] },
    { id: "trans", view: "under", num: "4.4", n: "Transmission & driveline", d: "The Aisin 8-speed and the front axles. Volvo says the fluid needs no change in normal use.", part: "atf", record: "trans", tags: ["Drivetrain"], at: [96, 78],
      chapters: [
        { tier: "K", t: "Know it", d: "How the 8-speed works and what it wants from you.", steps: [{ kb: "a-trans" }] },
        { tier: "S", t: "Service it", d: "If a shop services the fluid, get it on record.", steps: [{ record: "trans", t: "Log a transmission fluid service", go: "tab:records" }] }
      ] },

    /* ---------- view 5: lights & body ---------- */
    { id: "lights", view: "body", num: "5.1", n: "Headlights & bulbs", d: "The bulbs Volvo says you can change, and the ones you can't.", part: "lights", tags: ["Electrical"], at: [25, 114],
      chapters: [
        { tier: "K", t: "Know it", d: "A walk-around lights check with a helper.", steps: [{ mission: "m-lights" }], opens: ["5.2.1", "5.4.1"] },
        { tier: "S", t: "Service it", d: "Headlight, turn signal, rear and plate bulbs, each with its source.", steps: [{ diy: "j-bulb" }, { diy: "j-turnbulb" }, { diy: "j-rearbulb" }, { diy: "j-plate" }] },
        { tier: "U", t: "Upgrade it", d: "Brighter, the legal way. Cloudy lenses restored first.", steps: [{ upg: "lights" }, { diy: "j-lens" }] }
      ] },
    { id: "wipers", view: "body", num: "5.2", n: "Wipers & washers", d: "Blades yearly. You said you need them.", part: "wipers", tags: ["Maintenance"], at: [128, 72],
      chapters: [
        { tier: "C", t: "Check it", d: "Streaks, chatter, a weak spray.", steps: [{ mission: "m-wipers" }] },
        { tier: "S", t: "Service it", d: "Replace the blades.", steps: [{ diy: "j-wipers" }, { mission: "m-blades" }], opens: ["5.3.1"] },
        { tier: "U", t: "Upgrade it", d: "Which blades, and what they cost.", steps: [{ upg: "wipers" }] }
      ] },
    { id: "glass", view: "body", num: "5.3", n: "Glass & tint", d: "Chips, cracks, and the peeling tint on your side windows.", part: "glass", tags: ["Ownership"], at: [237, 75],
      chapters: [
        { tier: "S", t: "Service it", d: "Removing peeling tint without damaging the defroster lines.", steps: [{ diy: "j-tintoff" }] },
        { tier: "U", t: "Upgrade it", d: "New tint within Texas law, with the cost against the benefit.", steps: [{ upg: "tint" }] }
      ] },
    { id: "paint", view: "body", num: "5.4", n: "Paint & body", d: "Washing, polishing, coating, and the small dents.", part: "rust", tags: ["Ownership"], at: [237, 128],
      spec: [["Colour code, door label", "717-46. The name is unconfirmed; the paint is black in your photos"]],
      chapters: [
        { tier: "K", t: "Know it", d: "Washing and paint care, Volvo's way.", steps: [{ kb: "a-wash" }] },
        { tier: "S", t: "Service it", d: "Wash, then polish and wax by Volvo's guidance.", steps: [{ diy: "j-wash" }, { diy: "j-polish" }], opens: ["5.5.1"] },
        { tier: "U", t: "Upgrade it", d: "A ceramic coating, and paintless dent repair for the small dents.", steps: [{ upg: "ceramic" }, { upg: "dents" }, { diy: "j-ceramic" }] }
      ] },
    { id: "roof", view: "body", num: "5.5", n: "Roof & cargo", d: "A rack for a bike, skis or cargo.", tags: ["Upgrades"], at: [229, 48],
      spec: [["Load placard, door", "5 seats; occupants and cargo together never more than 950 lb (430 kg)"]],
      chapters: [
        { tier: "U", t: "Upgrade it", d: "Which rack fits, and what it costs.", steps: [{ upg: "rack" }] }
      ] },
    { id: "safety", view: "body", num: "5.6", n: "Safety systems & recalls", d: "Four recalls touched 2016 V60s. Repairs are free at any dealer.", tags: ["Safety", "Recalls"], at: [300, 118],
      chapters: [
        { tier: "K", t: "Know it", d: "What every 2016 V60 has, and the recalls that apply.", steps: [{ kb: "a-safety" }, { kb: "a-recalls" }] },
        { tier: "C", t: "Check it", d: "Each recall checked against your VIN and set.", steps: [{ recall: 1, t: "Set the status of every recall", go: "tab:my" }] }
      ] }
  ];
  /* a story case that is available opens its item's first chapter early */
  var CASE_OPENS = { safe: ["0"], signal: ["3.3.1"], belt: ["1.4.1"], thirst: ["1.1.1"], light: ["2.1.1"], paper: ["3.5.1"], baseline: ["3.3.3"], wrench: ["1.5.1"], sense: ["4.3.1"] };
  return { views: V, items: I, preface: PREFACE, caseOpens: CASE_OPENS };
})();
