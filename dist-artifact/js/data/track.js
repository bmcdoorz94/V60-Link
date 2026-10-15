/* The certification track: progression rebuilt around ASE's G1 test (Auto Maintenance and Light Repair).
   The seven content areas and their scored-question counts come from ASE's G1 study guide (V60_SOURCES.aseg1 in quiz.js).
   Each area is a level with two rungs:
     Owner      every part in the area has its Know and Check chapters closed on the car, and the area's Owner quiz is passed
     Technician every chapter of every part is closed, and the Technician quiz (diagnosis) is passed
   Readiness per area = 40 % hands-on (chapters closed) + 20 % recall (flashcards mastered) + 40 % best quiz score.
   G1 readiness = the areas weighted the way the test is: a Brakes point is worth 11/55, an HVAC point 4/55.
   Quizzes open hands-on first (Kyle, 2026-10-15): an area's quiz is locked until its hands-on work is done.
   Parts (manual items) can belong to two areas: the coolant system is Engine and Heating. Items not on the G1 sit under Owner's work. */
window.V60_TRACK_DATA = {
  test: { id: "g1", n: "ASE G1", full: "Auto Maintenance and Light Repair", scored: 55, total: 65, minutes: 90, recert: { n: 28, minutes: 45 }, pass: 0.7,
    passNote: "ASE does not publish its pass mark; 70 % is this app's bar." },
  areas: [
    { id: "eng", letter: "A", n: "Engine systems", q: 9, items: ["oil", "coolant", "belts", "filters", "plugs", "exhaust", "leaks"],
      d: "Oil, cooling, belts, air and fuel, ignition, exhaust and emissions. The biggest area on your car and the one with the most to check." },
    { id: "at", letter: "B", n: "Automatic transmission", q: 4, items: ["trans"],
      d: "The Aisin 8-speed: fluid, mounts, shift quality, and what Volvo says never needs changing." },
    { id: "mdt", letter: "C", n: "Manual drivetrain & axles", q: 6, items: ["trans"], noCar: "Your car has no manual gearbox or clutch, so those tasks are reading and quiz only. The front axles and CV joints are real.",
      d: "Clutches and gearboxes you don't have, plus the driveshafts and CV joints you do." },
    { id: "sus", letter: "D", n: "Suspension & steering", q: 13, items: ["susp", "tires", "tpms"],
      d: "The largest share of the test: steering, front and rear suspension, alignment, wheels and tires." },
    { id: "brk", letter: "E", n: "Brakes", q: 11, items: ["brakes", "parking", "bfluid"],
      d: "Hydraulics, discs, the electric parking brake, fluid and power assist." },
    { id: "ele", letter: "F", n: "Electrical", q: 8, items: ["battery", "fuses", "lights", "display", "controls", "port", "wipers"],
      d: "Battery, charging, starting, lights, fuses, the driver display and the diagnostic port." },
    { id: "hvac", letter: "G", n: "Heating & A/C", q: 4, items: ["coolant", "filters"],
      d: "The heater side of the cooling loop, the cabin filter and the A/C charge on the hood label." }
  ],
  owner: { id: "own", n: "Owner's work", d: "Not on the G1, but on your car: paperwork, glass, paint, cargo and the safety systems.", items: ["washer", "seats", "glove", "glass", "paint", "roof", "safety"] },
  /* which area each flashcard fact belongs to (recall). Tags give the default; ids override. Anything else is Owner's work. */
  factTag: { Engine: "eng", Maintenance: "eng", Tires: "sus", Steering: "sus", Brakes: "brk", Electrical: "ele", Diagnostics: "ele", Inspection: "eng", "Warning lights": "eng", Fluids: "eng", Drivetrain: "at", Basics: "eng", Safety: "eng" },
  factId: { "f-atf": "at", "f-brakefl": "brk", "f-washer": "own", "f-ac": "hvac", "f-ps": "sus", "f-cabin": "hvac", "f-trans": "at", "f-8speed": "at", "f-drive": "mdt", "f-brakered": "brk", "f-fueldoor": "own", "f-brloc": "brk",
    "f-wiper": "ele", "f-ignmodes": "ele", "f-ignbrake": "ele", "f-start3": "ele", "f-mode2": "ele", "f-waterdepth": "own", "f-citysafety": "own", "f-3g": "own", "f-adapter": "ele", "f-modules": "ele", "f-obd": "ele" }
};
