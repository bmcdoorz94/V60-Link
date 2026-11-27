/* Plan & shop catalog (2026-11-27, Kyle chose "A · parts counter" with a by-need switch; mock-ups
   https://claude.ai/artifact/MPp5kSV6sckB5tmLhZpS52). Each entry places something the car needs, could use or could have
   in one of the five sections of the car (the manual's views) and points at data the app already has; the page
   (src/js/modules/shop.js) builds everything else from those:
   - sched: a key of core ITEMS. Its status on Volvo's schedule decides Needed / Recommended / On track, and Volvo's
     printed row (home.js VROWS) is quoted.
   - k: a fixed group when there is no schedule: "rec" recommended, "opt" only if needed, "up" upgrade.
   - cost: a key of core COSTS (shop range, DIY figure, note with its source).
   - up: an id in V60_UPGRADES (what, why, cost, sources).
   - diy: an id in V60_DIY (a sourced step-by-step).
   - check: a manual chapter id (its Check chapter); part: the manual item for "Know it".
   - priceNote: a few words after the price when the source covers only part of the job.
   - t, why: text for entries with no schedule or upgrade behind them.
   - tiers: hand-written text that replaces the generated text for a tier (check, diy, shop), each {meta, body, src:[title, url]}.
   Nothing here may state a price or fact without a source; say "not researched" or "unconfirmed" instead. */
window.V60_SHOP_DATA = (function () {
  var GATES_NOISE = ["Gates: Diagnosing a noisy accessory belt drive", "https://gatestechzone.com/en/focus/diagnosing-a-noisy-accessory-belt-drive"];
  var GATES_WEAR = ["Gates: Micro-V belt wear symptoms", "https://www.gatestechzone.com/en/problem-diagnosis/accessory-drive-system/micro-v-belt-wear-symptoms"];
  return {
    items: [
      /* 1 Engine bay */
      { id: "tbelt", sec: "bay", part: "belts", sched: "timingbelt", cost: "timingbelt", check: "1.4.2", priceNote: "belt alone; a full kit costs more",
        tiers: {
          check: { meta: "Free", body: "Look for a shop sticker under the hood and in the papers from the lot. A Volvo dealer can look up the service history by VIN." },
          diy: { meta: "Not advised", mk: "bad", body: "This is an interference engine: if the belt slips or is fitted wrong, valves and pistons collide. Treat it as a shop job.", go: ["The timing belt article", "kb:a-belt"] } } },
      { id: "abelt", sec: "bay", part: "belts", sched: "accbelt", tree: "belt",
        tiers: {
          check: { meta: "Free · 10 min", body: "Engine off. Look at the ribbed side of the belt for cracks, missing chunks or shiny, glazed sides. If it squeals, note when: a cold start, the A/C on, or the steering turned.", src: GATES_WEAR },
          diy: { meta: "Not sourced", mk: "none", body: "No step-by-step for this engine in the app yet. Volvo's procedure is in VIDA, Volvo's paid workshop site. The app won't guess the belt routing or how the tensioner is released." } } },
      { id: "oil", sec: "bay", part: "oil", sched: "oil", cost: "oil", check: "1.1.2",
        tiers: { diy: { meta: "Car raised", mk: "watch", body: "An oil-and-filter kit is about $95 (the Garage's DIY figure), but the job needs the car safely raised. No step-by-step for this engine in the app yet.", go: ["Check the oil level", "diy:j-oilcheck"] } } },
      { id: "plugs", sec: "bay", part: "plugs", sched: "plugs", cost: "plugs" },
      { id: "air", sec: "bay", part: "filters", sched: "airfilter", cost: "airfilter", check: "1.5.2" },
      { id: "cabinf", sec: "bay", part: "filters", sched: "cabin", cost: "cabin", check: "1.5.2", diy: "j-cabin" },
      { id: "bfluid", sec: "bay", part: "bfluid", sched: "brakefluid", cost: "brakefluid", check: "1.6.2" },
      { id: "fluids", sec: "bay", part: "coolant", k: "rec", t: "Check coolant, brake and washer fluid", why: "Volvo's schedule checks the coolant at every service (every 10,000 miles). Eight minutes, nothing to open.", diy: "j-fluids", check: "1.2.2" },
      { id: "battery", sec: "bay", part: "battery", k: "opt", t: "12 V AGM battery", why: "Only if a battery test says it is weak. Start/stop cars need an AGM battery.", cost: "battery", diy: "j-battery", check: "1.3.2" },
      { id: "polestar", sec: "bay", part: "port", up: "polestar" },
      /* 2 Wheels & brakes */
      { id: "tpms", sec: "wheel", part: "tpms", k: "rec", t: "Set pressures and calibrate the tire monitor", why: "Your tire pressure light has been on since you bought the car. Set all four cold, then calibrate.", cost: "tpms", diy: "j-tires", check: "2.2.2" },
      { id: "tires", sec: "wheel", part: "tires", up: "tires", k: "opt", cost: "tires", check: "2.1.2" },
      { id: "align", sec: "wheel", part: "tires", k: "opt", t: "Wheel alignment", why: "Usually done with new tires, or if the car pulls or the tires wear unevenly.", cost: "align" },
      { id: "pads", sec: "wheel", part: "brakes", up: "brakes", k: "opt", cost: "padjob", check: "2.3.2" },
      /* 3 Cabin */
      { id: "recalls", sec: "cabin", part: "glove", k: "rec", t: "Check open recalls by VIN", why: "Each recall the app lists for 2016 V60s needs checking against your VIN.", check: "3.5.2" },
      { id: "carplay", sec: "cabin", up: "carplay" },
      { id: "dashcam", sec: "cabin", up: "dashcam" },
      { id: "modem", sec: "cabin", up: "modem" },
      /* 4 Underside */
      { id: "leaks", sec: "under", part: "leaks", k: "rec", t: "Leak check under the car", why: "A torch under the car, cold. Photograph anything wet.", check: "4.1.2" },
      { id: "emis", sec: "under", part: "exhaust", k: "rec", t: "Emissions readiness before the inspection", why: "Travis County tests emissions. A health check on Link shows the readiness monitors before the test, not at it.", check: "4.2.2" },
      { id: "trans", sec: "under", part: "trans", sched: "trans", k: "opt", t: "Automatic transmission fluid", why: "Volvo: check the level only if there is a leak; change every 50,000 miles only if you tow, or when the car asks." },
      /* 5 Lights & body */
      { id: "wipers", sec: "body", part: "wipers", up: "wipers", k: "opt", diy: "j-wipers", check: "5.2.1" },
      { id: "bulbs", sec: "body", part: "lights", k: "opt", t: "Headlight bulb (H11 low, H9 high)", why: "When one is out or dim.", diy: "j-bulb" },
      { id: "lens", sec: "body", part: "lights", k: "opt", t: "Restore cloudy headlight lenses", why: "When the lenses have yellowed.", diy: "j-lens" },
      { id: "lights", sec: "body", part: "lights", up: "lights" },
      { id: "tint", sec: "body", part: "glass", up: "tint", k: "opt", diy: "j-tintoff" },
      { id: "ceramic", sec: "body", part: "paint", up: "ceramic", diy: "j-ceramic" },
      { id: "dents", sec: "body", part: "paint", up: "dents" },
      { id: "rack", sec: "body", part: "roof", up: "rack" }
    ],
    /* "Something wrong right now?": a troubleshooter, or Problem cases for anything else */
    symptoms: [["Belt squeal or chirp", "tree:belt"], ["Brake noise or feel", "tree:brakes"], ["Vibration or shaking", "tree:vibe"], ["Check-engine light", "tree:cel"], ["Something else", "tab:cases"]],
    gatesNoise: GATES_NOISE
  };
})();
