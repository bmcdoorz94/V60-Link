/* Plan & shop catalog (2026-11-27, Kyle chose "A · parts counter" with a by-need switch; mock-ups
   https://claude.ai/artifact/MPp5kSV6sckB5tmLhZpS52). Each entry places something the car needs, could use or could have
   in one of the five sections of the car (the manual's views) and points at data the app already has; the page
   (src/js/modules/shop.js) builds everything else from those:
   - sched: a key of core ITEMS. Its status on Volvo's schedule decides Needed / Recommended / On track, and Volvo's
     printed row (home.js VROWS) is quoted.
   - k: a fixed group when there is no schedule: "rec" recommended, "opt" only if needed, "up" upgrade.
   - cost: a key of core COSTS (shop range, DIY figure, note with its source). shopP / diyP: [lo, hi] when this entry's
     own source gives the price instead (said in the shop step).
   - up: an id in V60_UPGRADES (what, why, cost, sources).
   - diy: an id in V60_DIY (a sourced step-by-step).
   - check: a manual chapter id (its Check chapter); part: the manual item for "Know it".
   - priceNote: a few words after the price when the source covers only part of the job.
   - t, why: text for entries with no schedule or upgrade behind them.
   - tiers: hand-written steps for this exact car (2016 V60 T5 Drive-E Premier, FWD, B4204T11, start/stop), one per tier
     (check, diy, shop): {meta, mk, body, steps: [...], note, src: [title, url] or a list of them, go: [label, jump], ask (shop)}.
   Every fact carries its source. Owner's-manual page numbers are the printed ones (the PDF page is printed + 2).
   Anything not confirmed for this exact car says "unconfirmed"; a price only appears with its source and date.
   Research notes behind this file (2026-11-27): Volvo 2016 V60 US owner's manual TP 20238, Volvo technical journals and
   bulletins on NHTSA, RepairPal 2016 V60 estimates (updated September 3, 2026), Texas Transportation Code §547.613. */
window.V60_SHOP_DATA = (function () {
  var OMURL = "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf";
  function om(p) { return ["Volvo 2016 V60 owner's manual, page " + p, OMURL]; }
  function rp(name, slug) { return ["RepairPal: 2016 Volvo V60 " + name + " (updated Sep 3, 2026)", "https://repairpal.com/estimator/volvo/v60/2016/" + slug]; }
  var GATES_NOISE = ["Gates: Diagnosing a noisy accessory belt drive", "https://gatestechzone.com/en/focus/diagnosing-a-noisy-accessory-belt-drive"];
  var GATES_WEAR = ["Gates: Micro-V belt wear symptoms", "https://www.gatestechzone.com/en/problem-diagnosis/accessory-drive-system/micro-v-belt-wear-symptoms"];
  var TJOIL = ["Volvo US Technical Journal TJ 34740.1.3 (oil)", "https://static.nhtsa.gov/odi/tsbs/2020/MC-10171688-9999.pdf"];
  var TJBATT = ["Volvo US Technical Journal TJ 26745.13.5 (12 V battery tests)", "https://static.nhtsa.gov/odi/tsbs/2020/MC-10177392-9999.pdf"];
  var PBSUP = ["Volvo parts bulletin: 12 V support batteries, MY2015.5+ with start/stop", "https://static.nhtsa.gov/odi/tsbs/2018/MC-10157935-9999.pdf"];
  var R555 = ["Volvo recall R39574 / NHTSA 15V-555 (starter fuse, start/stop)", "https://static.nhtsa.gov/odi/rcl/2015/RCMN-15V555-8918.pdf"];
  var NHTSA_VIN = ["NHTSA recall lookup by VIN", "https://www.nhtsa.gov/recalls"];
  var POLESTAR = ["Polestar product sheet: V60 T5 Drive-E FWD Automatic 2016", "https://engineered-api.polestar.com/optimisations/v60-t5-drive-e-fwd-automatic-2016/productSheet?market=us"];
  var SMB035 = ["Volvo Service Manager Bulletin 00-035: 3G network sunset (2022)", "https://static.nhtsa.gov/odi/tsbs/2022/MC-10213337-9999.pdf"];
  var PR155 = ["Volvo: What's New, 2015.5 V60 (trim contents)", "https://mb.cision.com/Main/23622/4196871/3563634.pdf"];
  var MO16 = ["Volvo: Model Overview, 2016 V60", "https://mb.cision.com/Main/23622/4196524/3563289.pdf"];
  var ZZ2 = ["Abt: ZZ-2 IT3-VOLVO wireless CarPlay interface", "https://www.abt.com/ZZ-2-Wireless-CarPlay-Android-Auto-Interface-For-Volvo-2015-2019-IT3VOLVO/p/211202.html"];
  var NAVINC = ["NavInc APPplay box, Sensus Connect 7 in", "https://www.navinc.nl/appplay-box-volvo-sensus-connect-7inch-carplay-android-auto-set"];
  var TINT_LAW = ["Texas Transportation Code §547.613", "https://texas.public.law/statutes/tex._transp._code_section_547.613"];
  var TINT_DPS = ["Texas DPS: window tinting standards", "https://www.dps.texas.gov/section/vehicle-inspection/window-tinting-standards"];
  var THULE = ["Thule fit sheet, kit 186006 (V60 wagon, flush rails)", "https://www.roofbox.co.uk/fitting/thule/TU6006-02.pdf"];
  var RACKS = ["etrailer: 2016 Volvo V60 roof racks", "https://www.etrailer.com/roof-2016_Volvo_V60.htm"];
  var FCPWIPE = ["FCP Euro: V60 wiper blades (retailer fitment)", "https://www.fcpeuro.com/Volvo-parts/V60/Wiper-Blades/"];
  var TJTPMS = ["Volvo US Technical Journal TJ 29818.9.0: I-TPMS low tire pressure warning (2019)", "https://static.nhtsa.gov/odi/tsbs/2019/MC-10165233-9999.pdf"];
  var TJEPB = ["Volvo US Technical Journal TJ 27500.6.0: parking brake service position (2016)", "https://static.nhtsa.gov/odi/tsbs/2016/MC-10127337-9999.pdf"];
  var UKPB = ["Volvo UK 2016 V60 manual: parking brake (rear linings at a workshop)", "https://www.volvocars.com/uk/support/car/v60/2016/article/1d55b37be21cadc8c0a801e8011420c5/102f4969318a49e6c0a801e800a53d8e/063c7e8bf78eea4dc0a801e800a131f7/"];
  var PR16 = ["Volvo: Model Overview, 2016 V60 (wheels)", "https://mb.cision.com/Main/23622/4196524/3563289.pdf"];
  var CFR = ["40 CFR 85.2222: OBD test procedures", "https://www.ecfr.gov/current/title-40/chapter-I/subchapter-C/part-85/subpart-W/section-85.2222"];
  var DPS08 = ["Texas DPS advisory: one monitor not ready allowed (2008)", "https://www.dps.texas.gov/sites/default/files/documents/rsd/vi/misc/faq/obd_notice092008.pdf"];
  var DPS25 = ["Texas DPS: inspection program changes (Jan 2025)", "https://www.dps.texas.gov/node/5943"];
  var TCEQFEE = ["TCEQ rule text (Travis County test fee)", "https://www.tceq.texas.gov/downloads/air-quality/mobile-source/26003114_pro.pdf"];
  var VOLVO_RECALL = ["Volvo recall lookup by VIN", "https://www.volvocars.com/us/l/recall/"];
  var NHTSA_API = ["NHTSA: recalls for the 2016 Volvo V60 (model-level)", "https://api.nhtsa.gov/recalls/recallsByVehicle?make=VOLVO&model=V60&modelYear=2016"];
  var M3LENS = ["NAPA: 3M Headlight Lens Restoration System 39008", "https://www.napaonline.com/en/p/MMM39008"];
  return {
    items: [
      /* ===== 1 Engine bay ===== */
      { id: "tbelt", sec: "bay", part: "belts", sched: "timingbelt", cost: "timingbelt", check: "1.4.2", priceNote: "belt alone; tensioner, idler and water pump extra",
        tiers: {
          check: { meta: "Free", body: "The only way to know is paperwork: nothing on the outside shows the belt's age.",
            steps: ["Look for a shop sticker under the hood and in the glovebox papers from the lot.", "Ask a Volvo dealer whether they can find any service history for the VIN.", "If nothing turns up, treat it as never done: Volvo's limit is 10 years, and the car is past it."] },
          diy: { meta: "Not advised", mk: "bad", body: "An interference engine: if the belt slips or is fitted wrong, valves and pistons collide. No Volvo owner procedure exists; it needs the service information in VIDA, Volvo's paid workshop system.", go: ["The timing belt article", "kb:a-belt"] },
          shop: { meta: "$736–986+", body: "RepairPal's 2016 V60 figure is $736–986 for the belt alone, and says related repairs such as the water pump and tensioners are not included. Whether this engine's water pump runs off the timing belt is unconfirmed: ask the shop to show Volvo's parts list for the job by VIN. Some kits sold as \"2016 V60 T5\" are for the 2.5 L five-cylinder; yours is the 2.0 L four (B4204T11).",
            steps: ["Ask for Volvo's timing belt, tensioner and idler (the schedule row), quoted by VIN.", "Ask whether the water pump and the accessory belt kit should be done at the same visit, and what that adds.", "Get two quotes, and keep the receipt for the log."],
            src: [rp("timing belt", "timing-belt-replacement-cost"), rp("water pump", "water-pump-replacement-cost")] } } },
      { id: "abelt", sec: "bay", part: "belts", sched: "accbelt", tree: "belt", shopP: [488, 639], priceNote: "belt plus tensioner, two separate estimates",
        tiers: {
          check: { meta: "Free · 10 min", body: "Volvo's manual says only to check the drive belt's condition before a long trip. Gates describes what to look for.",
            steps: ["Engine off, key out, engine cool.", "Look at the ribbed side of the belt for cracks, missing chunks or shiny, glazed sides.", "If it squeals, note when: a cold start, the A/C on, or the steering turned. Then try the squeal troubleshooter."],
            src: [om(282), GATES_WEAR] },
          diy: { meta: "Not sourced", mk: "none", body: "No Volvo owner procedure for this engine, and no belt-maker part number confirmed for the B4204T11. Volvo's procedure is in VIDA, its paid workshop system. The app won't guess the belt routing or how the tensioner is released." },
          shop: { body: "RepairPal's 2016 V60 figures: serpentine belt $126–209, drive belt tensioner $362–430 (two separate estimates; a combined quote may differ). No RepairPal figure for the idler pulley.",
            steps: ["Ask for Volvo's accessory drive belt, tensioner and idler (the schedule row), quoted by VIN for the 2.0 L four.", "Ask to do it at the same visit as the timing belt kit."],
            src: [rp("serpentine belt", "serpentine-belt-replacement-cost"), rp("drive belt tensioner", "drive-belt-tensioner-replacement-cost")] } } },
      { id: "oil", sec: "bay", part: "oil", sched: "oil", cost: "oil", check: "1.1.2", diy: "j-oilcheck",
        tiers: {
          check: { meta: "Free · 2 min", body: "This engine has no dipstick. Volvo says to check at every fill-up.",
            steps: ["Park level. The reading is right after about 20 miles of driving, or 5 minutes parked level with the engine off.", "Ignition mode II.", "Roll the thumb wheel on the left stalk until Oil level shows.", "\"No values available\" only means the conditions aren't met yet. \"Oil service required\" can mean too much oil: Volvo says see a workshop."],
            src: [om(337), om(329)] },
          diy: { meta: "Top-up only", mk: "watch", body: "Topping up is an owner job: use the same type and viscosity already in the engine. Volvo's manual says oil changes should be done by a trained Volvo technician, and the app has no step-by-step for a change.",
            note: "Which oil: Volvo's documents differ. The manual and your hood label say full synthetic ACEA A5/B5 SAE 5W-30; Volvo's later US bulletin TJ 34740 says Castrol Edge Professional V 0W-20 at every oil service on US four-cylinder Drive-E engines.",
            src: [om(335), TJOIL] },
          shop: { body: "RepairPal's 2016 V60 figure is $185–213; it doesn't name an oil.",
            steps: ["Ask for an oil and filter change and say which oil you want: Volvo's US bulletin names Castrol Edge Professional V 0W-20; the manual and your hood label say A5/B5 5W-30.", "Fill to Volvo's figure (about 6.2 US qt with the filter; Volvo tells shops to use its service system for the exact amount). No additives.", "Log it with the mileage."],
            src: [rp("oil change", "oil-change-cost"), TJOIL, om(384)] } } },
      { id: "plugs", sec: "bay", part: "plugs", sched: "plugs", cost: "plugs",
        tiers: {
          check: { meta: "Free", body: "Nothing to see from outside. Look for a receipt; if none, treat the 60,000-mile change as not done." },
          diy: { meta: "Not sourced", mk: "none", body: "No Volvo or plug-maker procedure for this engine was found, and the plug part number isn't confirmed for the B4204T11. Retailers list Volvo kit 32290011 for 2.0 L fours (unconfirmed for this car). Several \"2016 V60 T5\" plug listings are for the 2.5 L five-cylinder: not yours.",
            src: [om(334)] },
          shop: { body: "RepairPal has no V60 spark-plug estimate. The app's $443–604 is YourMechanic's estimate, not confirmed for this exact car. Ask for genuine Volvo plugs matched to the B4204T11 by VIN." } } },
      { id: "air", sec: "bay", part: "filters", sched: "airfilter", cost: "airfilter", check: "1.5.2",
        tiers: {
          check: { meta: "Free", body: "Volvo's manual only labels the air cleaner on the engine-bay drawing and lists a dirty one as a cause of high fuel use; it gives no check steps. The manual's 1.5 check (open the clips, hold the filter to the light) is general advice.", src: [om(334), om(289)] },
          diy: { meta: "Not sourced", mk: "none", body: "No Volvo procedure for replacing it. Retailers list Volvo filter 31370161 for the 2016 V60 T5 2.0 L; unconfirmed against Volvo's parts site, so match it by VIN." },
          shop: { body: "RepairPal's 2016 V60 figure is $82–99.", src: [["RepairPal: Volvo V60 air filter replacement (updated Sep 3, 2026)", "https://repairpal.com/estimator/volvo/v60/air-filter-replacement-cost"]] } } },
      { id: "cabinf", sec: "bay", part: "filters", sched: "cabin", cost: "cabin", check: "1.5.2", diy: "j-cabin",
        tiers: {
          check: { meta: "Free", body: "Volvo: the filter can't be cleaned, only replaced, and there are different types; make sure the right one goes in. Cars with the optional IAQS air-quality system use a multifilter (whether yours has IAQS is unconfirmed).", steps: ["If there's no receipt, treat it as due: Volvo's schedule says at least once a year."], src: [om(125)] },
          diy: { meta: "30 min · unconfirmed", mk: "watch", body: "Volvo's manual gives no procedure and doesn't say workshop-only. The app's step-by-step comes from Hella's sheet for 2012–2018 V60/S60, not Volvo, so it is unconfirmed for this exact car. Check the filter type (standard or IAQS) by VIN before buying." },
          shop: { body: "RepairPal's 2016 V60 figure is $84–133. Ask for the filter type that matches the car (standard or IAQS).", src: [["RepairPal: Volvo V60 cabin air filter (updated Sep 3, 2026)", "https://repairpal.com/estimator/volvo/v60/cabin-air-filter-replacement-cost"], om(125)] } } },
      { id: "bfluid", sec: "bay", part: "bfluid", sched: "brakefluid", cost: "brakefluid", check: "1.6.2",
        tiers: {
          check: { meta: "Free · 2 min", body: "The reservoir is under the round cover at the rear of the engine bay.",
            steps: ["Ignition off, engine cool.", "Lift the round cover. Don't remove the cap.", "The level must be between MIN and MAX on the reservoir.", "Below MIN, or a brake message: Volvo says do not drive; have the car towed."], src: [om(339)] },
          diy: { meta: "Top-up only", mk: "watch", body: "Topping up between MIN and MAX with DOT 4 (boiling point above 280 °C) is allowed. Never mix DOT 4 with another type. Changing the fluid: Volvo says always a trained Volvo technician.", src: [om(339), om(385)] },
          shop: { body: "RepairPal's 2016 V60 brake bleed is $110–161. Ask for a brake fluid change with DOT 4 (boiling point above 280 °C).", src: [rp("brake bleed", "brake-bleed-cost")] } } },
      { id: "fluids", sec: "bay", part: "coolant", k: "rec", t: "Check coolant, brake and washer fluid", why: "Volvo says check fluid levels monthly. Eight minutes, nothing to open except the washer cap.", diy: "j-fluids", check: "1.2.2",
        tiers: {
          check: { meta: "Free · 8 min", body: "Ignition off, selector in P, engine cool. The cooling fan can run for up to 6 minutes after switching off.",
            steps: ["Coolant: the level in the expansion tank between MIN and MAX. Never open the cap while the engine is warm.", "Brake fluid: under the round cover at the rear of the bay, between MIN and MAX, cap closed.", "Washer fluid: reservoir on the driver's side; fill as needed."],
            src: [om(334), om(338), om(339), om(350)] },
          diy: { meta: "Top-ups", mk: "ok", body: "Coolant: top up only with Volvo Genuine coolant, 50/50 with water; never water alone, never mix types. Washer fluid: Volvo's or any with pH 6–8. Volvo says the coolant normally never needs changing.", src: [om(338), om(350)] },
          shop: { meta: "Free check", ask: "a fluid-level check", body: "Ask a shop to look at the levels at any visit. If coolant keeps dropping, ask for a cooling-system pressure test; price not researched. RepairPal's coolant change is $284–364, but Volvo says it is normally not needed.", src: [rp("coolant change", "coolant-change-cost"), om(337)] } } },
      { id: "battery", sec: "bay", part: "battery", k: "opt", t: "12 V AGM battery", why: "Only if a test says it is weak. Volvo: start/stop cars must use an AGM battery, 800 CCA.", cost: "battery", diy: "j-battery", check: "1.3.2",
        tiers: {
          check: { meta: "Free", body: "Volvo: look at the terminals for corrosion monthly. A parts store or shop can test it; Volvo's US journal says testers must be set to \"AGM Flat-Plate\".",
            note: "Your car may also have a small support battery (Volvo lists one for 2015.5+ start/stop cars); unconfirmed for this car: look for a second small battery in the bay.",
            src: [om(329), TJBATT, PBSUP] },
          diy: { meta: "Manual has steps", mk: "watch", body: "The manual gives removal and fitting steps. Never disconnect it with the engine running.",
            steps: ["Ignition off, key out, wait at least 5 minutes.", "Remove the covers; disconnect black (−), then red (+); detach the vent hose; loosen the clamp; lift out.", "Fit the new AGM battery (same cold-start rating as the decal, 800 A), clamp it, reconnect the vent hose, then red (+), then black (−).", "Jump-starting or charging: clamp to the ground point on the right engine mount, never the battery's − terminal. Chargers must be set for AGM and never above 14.4 V."],
            note: "Whether a new battery must be registered in Volvo's system is unknown: no source either way. Ask a shop.",
            src: [om(353), om(389), om(259), TJBATT] },
          shop: { ask: "a 12 V AGM battery test, and a replacement only if it fails", body: "RepairPal's 2016 V60 figure is $386–403 (another RepairPal page shows $390–416).",
            steps: ["Ask for an AGM battery with the same CCA as the decal (Volvo: 800 A), vent hose reconnected.", "Ask whether the car has a support battery and whether they register the battery."],
            src: [rp("battery", "battery-replacement-cost"), om(389)] } } },
      { id: "fuses", sec: "bay", part: "fuses", k: "opt", t: "Check or replace a fuse", why: "When one thing stops working: a socket, a light, the wipers.", diy: "j-fuse",
        tiers: {
          check: { meta: "Free", body: "Five fuse boxes: engine bay, a start/stop \"cold zone\" box, two under the glove compartment, and the cargo area. The diagram is inside each cover.", src: [om(355), om(356)] },
          diy: { meta: "5 min", mk: "ok", body: "Volvo lets owners change some fuses, not all.",
            steps: ["Pull the fuse straight out with the tool inside the engine-bay fusebox cover.", "Look at the wire from the side; if broken, fit a new one of the same color and amperage. Never higher, never metal.", "Engine bay box: fuses 16–33 and 35–41 are yours to change; 1–15, 34 and 42–44 are workshop only. Cold-zone box: only fuse 12.", "If it blows again, have the circuit checked."],
            src: [om(355), om(358), om(365)] },
          shop: { meta: "Recall check", ask: "a check of the circuit if a fuse keeps blowing", body: "Recall 15V-555 covers MY2016 front-drive Drive-E V60s with engine code 40 built April 8 to August 19, 2015: the starter fuse can blow in stop-and-go driving with start/stop. Recall repairs are free; check your VIN.", src: [R555, NHTSA_VIN], go: ["Bulletins and recalls", "tab:bulletins"] } } },
      { id: "enginecover", sec: "bay", part: "oil", k: "opt", t: "Engine top cover", why: "Volvo's drawing of the 2016 four-cylinder bay shows a plastic cover over the top of the engine, with the oil filler cap through it. Your photos (2026-11-27) show the engine without it.", diyP: [129.89, 133.37], priceNote: "part only; confirm the part number by VIN",
        tiers: {
          check: { meta: "Free", body: "Compare the top of the engine with Volvo's drawing: the cover carries the Volvo badge and sits over the valve cover and ignition coils. Volvo notes the bay's appearance may vary by engine.", src: [om(334)] },
          diy: { meta: "Part 31368886", mk: "watch", body: "A Volvo dealer's parts catalog for the 2016 V60 T5 Premier 2.0L lists Engine Cover 31368886 (it replaces 31368626 and 31319208), with clip 31368242 included. FCP Euro's fit table lists the same cover for the V60 only up to chassis 251909 (the last six digits of the VIN), so the sources disagree: confirm by VIN before buying. Prices seen 2026-11-27: $129.89 (Tasca Parts), $131.05 (Volvo Parts Counter), $133.37 (Volvo Parts Webstore); MSRP $181.20. No Volvo fitting procedure was found.",
            src: [["Volvo Parts Counter: engine cover, 2016 V60 T5 Premier 2.0L", "https://www.volvopartscounter.com/v-2016-volvo-v60--t5-premier--2-0l-l4-gas/engine--engine-appearance-cover"], ["FCP Euro: Genuine Volvo 31368886 (fit table)", "https://www.fcpeuro.com/products/volvo-engine-cover-genuine-volvo-31368886"], ["Tasca Parts: 31368886", "https://www.tascaparts.com/oem-parts/volvo-engine-cover-31368886"], ["Volvo Parts Webstore: 31368886", "https://www.volvopartswebstore.com/parts/volvo-engine-cover-31368886"]] },
          shop: { meta: "Get a quote", ask: "engine cover 31368886 (or whatever Volvo's catalog gives for your VIN) for a 2016 V60 T5 Drive-E, B4204T11", body: "A Volvo parts counter can confirm the number by VIN and order it. Fitting labor not researched." } } },
      { id: "polestar", sec: "bay", part: "port", up: "polestar",
        tiers: {
          check: { meta: "Free", body: "Polestar lists this exact car (V60 T5 Drive-E FWD Automatic 2016): 242 to 250 hp, 258 to 295 lb-ft, 0–60 mph 6.4 to 6.3 s. Note Volvo's manual rates the stock engine at 240 hp. Article number 31459463.", src: [POLESTAR, om(382)] },
          diy: { meta: "Dealer only", mk: "none", body: "Software installed by a Volvo dealer; there is nothing to do yourself." },
          shop: { meta: "Ask a dealer", body: "No official price is published; Polestar says to contact a dealer, and installation is included in their price. Current US availability is unconfirmed.", steps: ["Ask a Volvo dealer to quote Polestar Engineered Optimisation, article 31459463, for a 2016 V60 T5 Drive-E FWD."], src: [POLESTAR] } } },

      /* ===== 2 Wheels & brakes ===== */
      { id: "tpms", sec: "wheel", part: "tpms", k: "rec", t: "Set pressures and calibrate the tire monitor", why: "Your tire pressure light has been on since you bought the car. Set all four cold, then calibrate.", cost: "tpms", diy: "j-tires", check: "2.2.2",
        tiers: {
          check: { meta: "Free · 5 min", body: "Your car's monitor is indirect: it compares wheel speeds, with no sensors in the valves. MY CAR > Settings > Car settings: a menu called \"Tire monitoring\" confirms it.",
            steps: ["Watch the light at start-up. Flashing for about a minute then staying on, with \"Tire press. syst Service required\", means a system fault, not low pressure.", "MY CAR > Settings > Car settings > Tire monitoring shows each wheel: green OK, yellow low, gray unavailable.", "Check all four cold (parked 3 hours or more) with your own gauge; Volvo says station gauges may be inaccurate."],
            src: [om(312), om(313), om(315), om(316)] },
          diy: { meta: "Free · 15 min", mk: "ok", body: "Volvo's calibration for this car:",
            steps: ["Engine off. Inflate all four to the placard on the driver's door pillar. Volvo's table gives 38 psi cold for 215/50 R17 XL and the 18-inch sizes (36 psi for 235/45 R17); the placard wins.", "Ignition mode II. MY CAR > Settings > Car settings > Tire monitoring > Calibrate tire pressure, OK.", "Drive. It finishes while driving, usually 12–15 minutes, and gives no confirmation, only a message if it fails.", "Recalibrate after every pressure change or wheel swap, and at least every 10,000 miles (Volvo's journal)."],
            src: [om(314), om(387), TJTPMS] },
          shop: { meta: "Dealer", ask: "a Tire Monitor fault check (Volvo TJ 29818)", body: "If the light stays on after a proper calibration, Volvo's journal TJ 29818 is the dealer's fix list.",
            steps: ["Ask them to read the brake control module for code C007768 and apply TJ 29818.", "That covers: tires within 5% of each other in rolling circumference, the module's software level, and metal particles on the wheel hub sensor rings.", "A shop needs Volvo's software or an equivalent tool; price not researched."], src: [TJTPMS] } } },
      { id: "tires", sec: "wheel", part: "tires", up: "tires", k: "opt", cost: "tires", check: "2.1.2",
        tiers: {
          check: { meta: "Free · 10 min", body: "Volvo: replace tires after about 6 years, sooner in hot climates like Austin's; replace at once if cracked or discolored.",
            steps: ["Read the placard on the driver's door pillar for your factory size and pressures. Volvo lists 215/50 R17 XL among the V60's sizes, but no Volvo page ties it to the Premier, and the 18-inch wheels were an option: the placard settles it.", "Read the DOT date on each sidewall: the last 4 digits are week and year (1513 = week 15 of 2013).", "Wear bars across the tread show at 1/16 in left: replace.", "Look for nails, cuts, bulges."],
            src: [om(296), om(297), om(298), PR16] },
          diy: { meta: "Shop job", mk: "none", body: "Tires are fitted by a shop. Volvo covers only changing a wheel with the jack (a separate how-to job). Rotation isn't required on this car; if you do it, front to back only, never side to side.", src: [om(296), om(299)], go: ["Change a wheel", "diy:j-wheel"] },
          shop: { meta: "$400–800", body: "The app's $400–800 is for four tires before mounting and balancing; tire prices weren't re-checked.",
            steps: ["Ask for four of the same size, Extra Load (XL), same maker and model, with a recent DOT date.", "Newest tires go on the rear axle (Volvo).", "Matched tires matter here: the monitor flags tires more than 5% apart in rolling size.", "Afterwards set the placard pressures and calibrate the monitor yourself."], src: [om(298), TJTPMS] } } },
      { id: "align", sec: "wheel", part: "tires", k: "opt", t: "Wheel alignment", why: "With new tires, if the car pulls, or if the tires wear unevenly.", cost: "align",
        tiers: {
          check: { meta: "Free", body: "Set the pressures first: Volvo says under- or over-inflation also wears tires unevenly. Uneven wear across a tread, or the car pulling, are reasons to have it checked. Volvo calls correct front alignment very important after hitting curbs or potholes.", src: [om(298)] },
          diy: { meta: "Shop only", mk: "none", body: "Volvo: alignment should be checked by a trained Volvo technician only. Volvo's alignment values aren't public.", src: [om(282)] },
          shop: { meta: "$122–179", body: "RepairPal's 2016 V60 figure is $122–179.", steps: ["Ask for a four-wheel alignment with the before-and-after printout, and which spec sheet they used for a 2016 V60."], src: [rp("wheel alignment", "wheel-alignment-cost")] } } },
      { id: "pads", sec: "wheel", part: "brakes", up: "brakes", k: "opt", cost: "padjob", check: "2.3.2",
        tiers: {
          check: { meta: "Free · car raised", mk: "watch", body: "Volvo: check pads by raising the car and looking. Use stands, never only the jack, and never put yourself under a car on a jack. Volvo gives no minimum thickness for owners.",
            steps: ["Brakes cool, parking brake on, P, other wheels blocked.", "Raise the car at Volvo's lift points onto stands and look at the pads through or behind the wheel.", "Warning signs: the pedal goes farther or needs more force, or a brake light. Brake fluid below MIN: don't drive."],
            src: [om(274), om(330)] },
          diy: { meta: "Shop job", mk: "none", body: "No Volvo owner procedure for pads. Rear pads need Volvo's software: its US journal TJ 27500 says the rear caliper pistons must be retracted with a service command in VIDA (the electric parking brake), and Volvo's UK manual for this year says rear linings must be replaced at a workshop.", src: [TJEPB, UKPB] },
          shop: { meta: "$399–456", body: "RepairPal's 2016 V60 brake pad figure is $399–456; it doesn't say front or rear. Your front rotor size isn't confirmed: the V60 came with 300, 316 and 336 mm fronts.",
            steps: ["Ask them to measure front and rear pads and rotors against the minimum cast on the rotor, and to tell you the front rotor size.", "For rear pads, ask them to use Volvo's parking-brake service function (TJ 27500).", "Ask about changing the brake fluid at the same visit if it has no record."],
            src: [rp("brake pads", "brake-pad-replacement-cost"), TJEPB] } } },

      /* ===== 3 Cabin ===== */
      { id: "recalls", sec: "cabin", part: "glove", k: "rec", t: "Check open recalls by VIN", why: "Four recalls cover the 2016 V60 as a model; only a VIN check says which apply to your car and whether they were done.", check: "3.5.2",
        tiers: {
          check: { meta: "Free · 2 min", body: "The VIN is at the lower left of the windshield and on the registration card.",
            steps: ["Enter it at nhtsa.gov/recalls or Volvo's recall page. NHTSA shows only unrepaired safety recalls.", "The 2016 V60 recalls: starter fuse with start/stop (15V-555, built Apr 8 to Aug 19, 2015), front passenger seat-belt buckle (16V-798), door latches (19V-849), front seat-belt anchor cable (20V-378).", "Mark each one in Bulletins & recalls."],
            src: [NHTSA_VIN, VOLVO_RECALL, NHTSA_API], go: ["Bulletins and recalls", "tab:bulletins"] },
          diy: { meta: "Not a DIY job", mk: "none", body: "Recall work is done by a Volvo dealer." },
          shop: { meta: "Free", mk: "ok", ask: "any open recalls and service campaigns for your VIN", body: "Recall repairs are free at a Volvo dealer (NHTSA). Non-safety service campaigns don't show on NHTSA's lookup; the dealer can see them by VIN.", steps: ["Call a Volvo dealer with the VIN, ask for any open recalls and service campaigns, and book them together."], src: [NHTSA_VIN] } } },
      { id: "carplay", sec: "cabin", up: "carplay",
        tiers: {
          check: { meta: "Free", body: "The boxes need Sensus Connect with Navigation: look for NAV and globe buttons on the center stack. Volvo lists Sensus Navigation as standard on the 2016 Premier, on the 7-inch screen.", src: [MO16, ZZ2] },
          diy: { meta: "Not sourced", mk: "none", body: "An aftermarket box; Volvo has no procedure. The seller links install manuals (not reviewed here). The seller (Abt) describes it as plug and play." },
          shop: { meta: "$850 + fitting", body: "ZZ-2 IT3-VOLVO lists V60 2015–2018 and needs Sensus Connect with Navigation: $850 at Abt and at Sound of Tri-State (seen 2026-11-27). NavInc's APPplay box lists V60 2015–2019, price on request, stock unclear. Fitting labor: not researched.",
            steps: ["Ask a car-audio shop to fit a ZZ-2 IT3-VOLVO or NavInc APPplay to a 2016 V60 with Sensus Connect and Navigation.", "Ask how the microphone and USB audio are routed; it differs by box."], src: [ZZ2, NAVINC] } } },
      { id: "dashcam", sec: "cabin", up: "dashcam",
        tiers: {
          check: { meta: "Free", body: "Find the City Safety laser sensor at the top of the windshield behind the mirror: Volvo says don't cover it, and only a Volvo technician may touch it. Texas law has no dash-cam rule, only that nothing may obstruct the driver's view.", src: [om(201), om(206), TINT_LAW] },
          diy: { meta: "Plug-in · 15 min", mk: "ok", body: "The simplest route Volvo supports: plug the camera into a 12 V socket in the tunnel console. Those switch off with the car (at least ignition mode I) and give up to 10 A. The optional cargo-area socket stays live with the car off and can drain the battery. Volvo gives no hardwiring procedure.", src: [om(139), om(140)] },
          shop: { meta: "Get a quote", ask: "a hardwired dash camera for parking mode", body: "Ask for it on a switched circuit with a low-voltage cutoff, routed clear of the side curtain airbags, and the City Safety sensor area kept clear. Prices not researched." } } },
      { id: "modem", sec: "cabin", up: "modem",
        tiers: {
          check: { meta: "Free", body: "See whether the Volvo On Call / Volvo Cars app connects to the car. A dealer can look up the VIN for the 4G upgrade offer; Volvo says if no offer shows, the car is unaffected or already upgraded.", src: [SMB035] },
          diy: { meta: "Dealer only", mk: "none", body: "A modem swap plus Volvo software; dealer only." },
          shop: { meta: "Ask a dealer", body: "Volvo's 2022 bulletin covers the 2015–2017 V60: modem 36011532, software 31288000, about an hour of labor, and two years of the Volvo Cars app. It gives no price and warned hardware was limited. Whether the program still runs in 2026 is unconfirmed.", steps: ["Ask a Volvo dealer for the SMB 00-035 3G sunset 4G modem upgrade (TEM 36011532) for your VIN, and the price."], src: [SMB035] } } },

      /* ===== 4 Underside ===== */
      { id: "leaks", sec: "under", part: "leaks", k: "rec", t: "Leak check under the car", why: "Volvo: check for fuel, oil and fluid leaks before long trips, and fluid levels monthly.", check: "4.1.2",
        tiers: {
          check: { meta: "Free · 5 min", body: "Look at the ground where the car parks overnight, and photograph anything wet. Volvo gives no guide to reading drips by color; any color chart you find elsewhere is generic.",
            steps: ["Check the fluid levels against MIN and MAX monthly; a level that keeps dropping points to the leak.", "Brake fluid below MIN: don't drive; have it towed."], src: [om(282), om(329), om(339)] },
          diy: { meta: "Look only", mk: "none", body: "Nothing to fix yourself. Only go under the car on stands at Volvo's lift points.", src: [om(330)] },
          shop: { meta: "Get a quote", ask: "a leak inspection on a lift", body: "Ask for one that names what is leaking (engine oil, coolant, transmission fluid, brake fluid). Price not researched." } } },
      { id: "emis", sec: "under", part: "exhaust", k: "rec", t: "Emissions readiness before the inspection", why: "Travis County tests gasoline cars 2 to 24 years old. The test reads the car's own self-tests through the diagnostic port.", check: "4.2.2",
        tiers: {
          check: { meta: "Free", body: "What fails: a check-engine light that is on, or that doesn't light briefly at key-on; or more than one readiness monitor not ready (2001 and newer cars). Codes stored with the light off don't fail.",
            steps: ["Run a health check on Link a few days before the test and look at readiness.", "After a battery disconnect or clearing codes, every monitor resets: Volvo says two half-hour trips of mixed stop-and-go and highway driving are typically needed.", "Recorded drives on Maintain show readiness from the last drive."], src: [CFR, DPS08, om(331)] },
          diy: { meta: "Drive cycle", mk: "ok", body: "Readiness sets itself with normal driving. Volvo doesn't publish a drive cycle for owners.", src: [om(331)] },
          shop: { meta: "Up to $11.50", ask: "an emissions (OBD) inspection", body: "Any Texas emissions station in Travis County: the station fee is at most $11.50, with one free retest within 15 days. Registration adds $2.50 and DPS's $7.50 program fee. Ask for the printed report if it fails.", src: [TCEQFEE, DPS25] } } },
      { id: "trans", sec: "under", part: "trans", sched: "trans", k: "opt", t: "Automatic transmission fluid", why: "Volvo: no change needed under normal driving; check the level if there's a leak and before long trips.", shopP: [284, 353],
        tiers: {
          check: { meta: "Free", body: "Look for drips under the middle of the car. Volvo gives no owner procedure for the level; it says to have it checked before a long trip.", src: [om(282)] },
          diy: { meta: "Shop only", mk: "none", body: "No Volvo owner procedure. The TG-81SC takes about 7 US qt of Volvo AW1 fluid.", src: [om(385)] },
          shop: { meta: "Check first", ask: "a transmission fluid level and leak check", body: "Volvo's documents agree there's no routine change: the manual says none under normal driving (maybe under \"adverse driving conditions\", which it doesn't define), and the schedule says check the level only if a leak is found, and change every 50,000 miles only if you tow or the car asks. RepairPal prices a change at $284–353 anyway.",
            steps: ["Ask for a leak and level check, adding Volvo AW1 only if needed.", "Only change it for towing, a message from the car, or a leak repair."], src: [om(385), rp("transmission fluid change", "transmission-fluid-change-cost")] } } },

      /* ===== 5 Lights & body ===== */
      { id: "wipers", sec: "body", part: "wipers", up: "wipers", k: "opt", diy: "j-wipers", check: "5.2.1",
        tiers: {
          check: { meta: "Free", body: "Streaks, chatter or torn rubber. Volvo: replace them regularly. Check whether the car has heated blades (Volvo sells a separate heated set) and buy to match; unconfirmed for this car.", src: [om(349), FCPWIPE] },
          diy: { meta: "15 min", mk: "ok", body: "Volvo's procedure for this car:",
            steps: ["Service position: key in, press START/STOP ENGINE briefly (mode I), press again to switch off, then within 3 seconds hold the right stalk up for at least 1 second. The wipers stand up.", "Fold the arm out, press the button on the blade attachment and pull the blade straight out along the arm.", "Slide the new blade in until it clicks. The driver's blade is the longer one.", "Fold the arms back before the wipers return, so they don't scratch the hood. Then start the car or select mode I.", "Rear: fold the arm out, angle the blade, press it forward with your thumb to release, press the new one in."],
            note: "Sizes are retailer fitment, not Volvo: 26 in driver, 20 in passenger. The rear blade changed at chassis 292690/292691 (the last six of the VIN), so match it to your car.",
            src: [om(348), om(349), om(350), FCPWIPE] },
          shop: { body: "Retail prices seen 2026-11-27: Bosch AeroTwin front set $20.87, genuine Volvo set $58.27 (FCP Euro). Fitting is usually done at the counter; labor not researched.", src: [FCPWIPE] } } },
      { id: "bulbs", sec: "body", part: "lights", k: "opt", t: "Headlight bulb (H11 low, H9 high)", why: "When one is out or dim. Volvo lets owners change these two.", diy: "j-bulb",
        tiers: {
          check: { meta: "Free", body: "Both beams work and no bulb message shows. Volvo: if a message stays after a new bulb, see a workshop. Your Premier has halogen lamps: Volvo's trim lists put xenon only on the Platinum (an inference, not a Volvo sentence).", src: [om(340), PR155] },
          diy: { meta: "30 min · Torx T20", mk: "ok", body: "Volvo's procedure (the whole housing comes out):",
            steps: ["Ignition off, lights off, key out, engine cool. Never touch the bulb glass.", "Open the hood, pull out the housing's locking pins, and lift the housing out by its front and rear edges alternately.", "Unplug it (thumb on the clip) and set it on something soft.", "Loosen the cover's four screws 3–4 turns with a Torx T20 and slide the cover off.", "Low beam H11: unplug, pull straight out; fit the new one with the guide lug straight up.", "High beam H9: turn counterclockwise, pull out, unplug; the new one fits only one way, turn clockwise.", "Refit cover and housing (the short pin goes nearest the grille), plug in until it clicks, then check the lights."],
            src: [om(340), om(341), om(342), om(343), om(347)] },
          shop: { body: "Ask for an H11 low-beam (55 W) or H9 high-beam (65 W) bulb. Shop prices not researched; the app's $15–40 per bulb is the DIY card's figure.", src: [om(347)] } } },
      { id: "lens", sec: "body", part: "lights", k: "opt", t: "Restore cloudy headlight lenses", why: "When the outside of the lens has yellowed.", diy: "j-lens",
        tiers: {
          check: { meta: "Free", body: "Is the haze on the outside (rough under a fingernail) or inside the lamp? Volvo says some condensation inside is normal and clears; haze inside that doesn't clear isn't fixed by polishing.", src: [om(340), om(367)] },
          diy: { meta: "45 min · generic", mk: "watch", body: "No Volvo procedure; this is generic. 3M's kit 39008 ($24.99 at NAPA, seen 2026-11-27) uses a drill at 1200–1600 rpm: mask the paint, sand 500 then 800 grit, refine wet, polish, then protect. Follow the sheet in the kit.", src: [M3LENS] },
          shop: { meta: "Get a quote", body: "Ask for headlight restoration (sand, polish, UV coat). If the haze is inside, ask about a replacement headlight. Prices not researched." } } },
      { id: "lights", sec: "body", part: "lights", up: "lights", diy: "j-bulb",
        tiers: {
          check: { meta: "Free", body: "Your Premier has halogen headlamps (low H11 55 W, high H9 65 W). Bulbs dim with age, and yellowed lenses cut light too, so check both before buying anything.", src: [om(347), PR155] },
          diy: { meta: "30 min · Torx T20", mk: "ok", body: "Fresh, DOT-compliant H11 and H9 bulbs, fitted with Volvo's procedure (the Headlight bulb item has the steps). NHTSA's 2004 interpretation says HID conversion kits in halogen headlamps can't meet the federal lighting standard, so skip those.", src: [om(340), ["NHTSA interpretation, HID conversions (2004)", "https://www.nhtsa.gov/interpretations/shih3"]], go: ["Headlight bulb steps", "shop:bulbs"] },
          shop: { meta: "Get a quote", body: "Ask for H11 low (55 W) and H9 high (65 W) bulbs, DOT-compliant, and a headlight aim check. Prices not researched; the app's $15–40 per bulb is the DIY card's figure.", src: [om(347)] } } },
      { id: "tint", sec: "body", part: "glass", up: "tint", k: "opt", diy: "j-tintoff",
        tiers: {
          check: { meta: "Free", body: "Look for the installer's label in the bottom rear corner of the driver's window. Texas: front side windows need 25% or more light through (film and glass together); rear side windows are exempt; the rear window is unrestricted with outside mirrors on both sides; on the windshield, tint only above the AS-1 line.", src: [TINT_DPS, TINT_LAW] },
          diy: { meta: "90 min · generic", mk: "watch", body: "Removing old film: the app's card is from 3M's bulletin for graphic films, not automotive tint, so it's generic. Mind the rear-window defroster lines." },
          shop: { meta: "Get a quote", body: "Ask for front side windows at 25% or more combined with the glass, any shade behind the driver, and the compliance label. Ask them to keep the City Safety sensor area at the top of the windshield clear. Prices not researched.", src: [TINT_LAW, om(201)] } } },
      { id: "ceramic", sec: "body", part: "paint", up: "ceramic", diy: "j-ceramic",
        tiers: {
          check: { meta: "Read first", mk: "bad", body: "Volvo's manual: \"Volvo does not recommend the use of long-life or durable paint protection coatings\"; they haven't been tested with the clear coat and some may soften, crack or cloud it.", src: [om(368)] },
          diy: { meta: "Generic", mk: "watch", body: "If you go ahead anyway, the app's card is from a Chemical Guys blog, not Volvo. Volvo's own paint care: wash out of direct sun with lukewarm water, polish only when the surface is below 113 °F, and wax doesn't replace polishing a dull finish.", src: [om(367), om(368)] },
          shop: { meta: "Get a quote", body: "Ask which product, what prep it needs and what warranty it carries, knowing Volvo's caution. Prices not researched." } } },
      { id: "dents", sec: "body", part: "paint", up: "dents",
        tiers: {
          check: { meta: "Free", body: "Paintless dent repair suits small dents with the paint intact. A magnet sticks to steel, not aluminum (a generic check). Aftermarket listings call this generation's hood steel; door and fender material wasn't found in any source." },
          diy: { meta: "Shop only", mk: "none", body: "It needs special tools. Volvo's manual says paint repairs need special equipment and skill.", src: [om(371)] } } },
      { id: "rack", sec: "body", part: "roof", up: "rack",
        tiers: {
          check: { meta: "Free", body: "Volvo lists roof rails on the Premier. Flush rails sit flat on the roof with no gap underneath; that decides which kit fits. Volvo's roof load limit is 220 lb (100 kg), and never more than the rack maker's limit.", src: [PR155, om(141)] },
          diy: { meta: "30 min", mk: "ok", body: "Thule's fit sheet covers fitting: kit 186006 lists the North American V60 wagon 2014–18, \"only for vehicles with flush railing\", rated 75 kg (165 lb), lower than Volvo's limit, so use 75 kg.", src: [THULE] },
          shop: { meta: "$481–585", body: "Complete Thule flush-rail racks for the 2016 V60 seen 2026-11-27: $495.98 (SquareBar Evo) to $560.85 (WingBar Evo) at etrailer, and a $480.85 bundle at Rack Warehouse. Fitting is a bolt-on; shop labor not researched.", src: [RACKS, THULE] } } }
    ],
    /* "Something wrong right now?": a troubleshooter, or Problem cases for anything else */
    symptoms: [["Belt squeal or chirp", "tree:belt"], ["Brake noise or feel", "tree:brakes"], ["Vibration or shaking", "tree:vibe"], ["Check-engine light", "tree:cel"], ["Something else", "tab:cases"]],
    gatesNoise: GATES_NOISE
  };
})();
