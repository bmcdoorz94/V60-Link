/* The path: the one line through everything, Kyle's choice (2026-10-15): strict, in the order a beginner learns a car,
   starting with this car. Only the current step is open; everything after it is locked until the step before is done.
   Order: safety; what the car is telling you and its history; looking and checking, one system at a time, each system
   ending with its G1 study and its Owner quiz; then servicing; then diagnosing; then upgrades; then the Technician
   quizzes and the mock G1.
   Stage kinds:
     ch:   "1.1.1"            a manual chapter (data/manual.js); done when the chapter closes
     g1:   "D1-D10"           G1 study entries (data/g1tasks.js, g1entries.js); done when every task in the range is studied
     quiz: "sus", rung: 1     an area quiz on the certification track; done when passed
     mock: true               the mock G1; done when passed
   park: text  the stage needs a shop, a purchase or a dealer, so it may be set aside; the path moves on and the stage
               stays on the list until its evidence comes in. Nothing else can be skipped.
   tests/path.js checks: every chapter once, every G1 task once, each Owner quiz after its area's Know and Check chapters,
   each Technician quiz after every chapter of its area. */
window.V60_PATH_DATA = [
  { id: "safe", t: "Safety first", d: "The rules that keep you and the car in one piece, and your first look under the hood.",
    stages: [{ ch: "0" }] },
  { id: "dash", t: "What the car is telling you", d: "The driver display, its warning lights, and the controls. The car's own way of reporting how it is.",
    stages: [{ ch: "3.1.1" }, { ch: "3.1.2" }, { ch: "3.2.1" }, { ch: "3.2.2" }] },
  { id: "papers", t: "The car's history and recalls", d: "Bought as-is with no records: the mileage, the paper trail, and the recalls that are repaired free.",
    stages: [{ ch: "3.5.1" }, { ch: "3.5.2" }, { ch: "5.6.1" }, { ch: "5.6.2" }] },
  { id: "fluids", t: "Under the hood: the fluids", d: "Oil, coolant, brake fluid and washer fluid: where each one is and how to check it.",
    stages: [{ ch: "1.1.1" }, { ch: "1.1.2" }, { ch: "1.2.1" }, { ch: "1.2.2" }, { ch: "1.6.1" }, { ch: "1.6.2" }, { ch: "1.7.1" }, { ch: "1.7.2" }] },
  { id: "tires", t: "Tires, the tire light and steering", d: "Your four tires, the pressure monitor, and what the steering and suspension feel like when they are right. Then the G1's largest area.",
    stages: [{ ch: "2.1.1" }, { ch: "2.1.2" }, { ch: "2.2.1" }, { ch: "2.2.2" }, { ch: "4.3.1" }, { ch: "4.3.2" },
      { g1: "D1-D13", t: "Steering" }, { g1: "D14-D27", t: "Front suspension" }, { g1: "D28-D41", t: "Rear suspension" }, { g1: "D42-D50", t: "Wheel alignment" }, { g1: "D51-D59", t: "Wheels and tires" },
      { quiz: "sus", rung: 1 }] },
  { id: "brakes", t: "Brakes", d: "The pads and discs you can see through the wheel, the electric parking brake, then the G1's brake tasks.",
    stages: [{ ch: "2.3.1" }, { ch: "2.3.2" }, { ch: "2.4.1" }, { ch: "2.4.2" },
      { g1: "E1-E7", t: "Brake hydraulics" }, { g1: "E8-E16", t: "Drum brakes" }, { g1: "E17-E29", t: "Disc brakes" }, { g1: "E30-E34", t: "Power assist" },
      { quiz: "brk", rung: 1 }] },
  { id: "port", t: "The diagnostic port", d: "Where the adapter plugs in, what OBD-II can tell you, and your first real health check.",
    stages: [{ ch: "3.3.1" }, { ch: "3.3.2" }] },
  { id: "elec", t: "Battery, fuses, lights and wipers", d: "The rest of the electrical system an owner touches, then the G1's electrical tasks.",
    stages: [{ ch: "1.3.1" }, { ch: "1.3.2" }, { ch: "1.8.1" }, { ch: "5.1.1" }, { ch: "5.2.1" },
      { g1: "F1-F11", t: "Testing and the battery" }, { g1: "F12-F22", t: "Starting, charging, lights and wipers" },
      { quiz: "ele", rung: 1 }] },
  { id: "engine", t: "The engine", d: "The timing belt question, the filters, the plugs, leaks and the exhaust, then the G1's engine tasks.",
    stages: [{ ch: "1.4.1" }, { ch: "1.4.2", park: "The second half is an inspection by a specialist shop." }, { ch: "1.5.1" }, { ch: "1.5.2" }, { ch: "1.9.1" }, { ch: "4.1.1" }, { ch: "4.1.2" }, { ch: "4.2.1" }, { ch: "4.2.2" },
      { g1: "A1-A11", t: "Diagnosis, oil and cooling" }, { g1: "A12-A22", t: "Air, ignition, fuel and emissions" },
      { quiz: "eng", rung: 1 }] },
  { id: "driveline", t: "Transmission and driveline", d: "The 8-speed automatic and the front axles, then the clutch, axle and four-wheel-drive tasks your car does not have but the test does.",
    stages: [{ ch: "4.4.1" }, { g1: "B1-B7", t: "Automatic transmission" }, { quiz: "at", rung: 1 },
      { g1: "C1-C5", t: "Clutch and gearbox" }, { g1: "C6-C13", t: "Driveshafts and axles" }, { g1: "C14-C22", t: "Four-wheel and all-wheel drive" }, { quiz: "mdt", rung: 1 }] },
  { id: "hvac", t: "Heating and A/C", d: "The heater side of the cooling loop, the cabin filter and the A/C, as the G1 covers them.",
    stages: [{ g1: "G1-G7", t: "Heating and A/C" }, { quiz: "hvac", rung: 1 }] },
  { id: "inside", t: "Inside and out", d: "The trim and safety systems in the cabin, and caring for the paint.",
    stages: [{ ch: "3.4.1" }, { ch: "5.4.1" }] },
  { id: "jobs", t: "First jobs", d: "Real work on the car, easiest first: a filter, the wipers, the tire pressures, a jump start, a fuse, the bulbs.",
    stages: [{ ch: "1.5.3" }, { ch: "5.2.2" }, { ch: "2.1.3" }, { ch: "1.3.3" }, { ch: "1.8.2" }, { ch: "5.1.2" }, { ch: "1.1.3", park: "Needs an oil and filter change on record." }, { ch: "3.5.3" }, { ch: "3.4.2" }, { ch: "5.4.2" }, { ch: "5.3.1" }] },
  { id: "shop", t: "Shop jobs on record", d: "The two big unknowns a shop handles: the timing belt and the transmission fluid.",
    stages: [{ ch: "1.4.3", park: "A shop job: the timing belt replacement." }, { ch: "4.4.2", park: "Only if a shop services the fluid; Volvo says it needs no change in normal use." }] },
  { id: "codes", t: "Diagnose: lights and codes", d: "The check-engine light, the tire light that won't go out, live data, and start/stop.",
    stages: [{ ch: "3.1.3" }, { ch: "2.2.3" }, { ch: "3.3.3" }, { ch: "3.2.3" }] },
  { id: "feel", t: "Diagnose: sounds, feel and fluids", d: "Oil use over real miles, running hot, a no-start, tires, brakes, the parking brake, suspension noises and the bulletins.",
    stages: [{ ch: "1.1.4" }, { ch: "1.2.3" }, { ch: "1.3.4" }, { ch: "2.1.4" }, { ch: "2.3.3" }, { ch: "2.4.3" }, { ch: "4.3.3" }, { ch: "1.9.2", park: "Needs a dealer to look up the service action by VIN." }, { ch: "3.5.4" }] },
  { id: "upgrade", t: "Upgrades", d: "Each upgrade decided with the cost against the benefit: tires, brakes, wipers, lights, tuning, tint, paint and a rack.",
    stages: [{ ch: "2.1.5" }, { ch: "2.3.4" }, { ch: "5.2.3" }, { ch: "5.1.3" }, { ch: "3.3.4" }, { ch: "5.3.2" }, { ch: "5.4.3" }, { ch: "5.5.1" }] },
  { id: "test", t: "The Technician quizzes and the mock G1", d: "Diagnosis questions area by area, then the full test: 55 questions, 90 minutes.",
    stages: [{ quiz: "sus", rung: 2 }, { quiz: "brk", rung: 2 }, { quiz: "ele", rung: 2 }, { quiz: "eng", rung: 2 }, { quiz: "at", rung: 2 }, { quiz: "mdt", rung: 2 }, { quiz: "hvac", rung: 2 }, { mock: true }] }
];
