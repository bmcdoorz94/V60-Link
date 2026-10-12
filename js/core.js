
(function () {
  "use strict";

  /* ---------- reference data ---------- */
  var ITEMS = [
    { key: "oil", name: "Engine oil and filter", mi: 10000, mo: 12, verify: false, note: "Volvo's 2016 US schedule: every 10,000 miles or 12 months. Full synthetic ACEA A5/B5 5W-30, or Volvo's 0W-20 (VCC RBS0-2AE). 6.2 quarts with filter." },
    { key: "cabin", name: "Cabin air filter", mi: 20000, mo: 12, verify: false, note: "Every 20,000 miles, and Volvo suggests at least once a year." },
    { key: "airfilter", name: "Engine air filter", mi: 40000, mo: null, verify: false, note: "At 40k, 80k and 120k miles per Volvo's 2016 US schedule." },
    { key: "brakefluid", name: "Brake fluid", mi: 40000, mo: 36, verify: false, note: "Every 3 years or 40,000 miles. Volvo says yearly in humid or mountain climates if you want extra margin. DOT 4." },
    { key: "plugs", name: "Spark plugs", mi: 60000, mo: null, verify: false, note: "At 60k and 120k miles per Volvo's 2016 US schedule." },
    { key: "brakes", name: "Brake pad and disc inspection", mi: 10000, mo: 12, verify: false, note: "Checked at every 10,000-mile service. Wear depends heavily on driving style." },
    { key: "timingbelt", name: "Timing belt kit", mi: 150000, mo: 120, verify: true, note: "Volvo's 2016 US schedule lists the timing belt tensioner and idler at 150,000 miles or 10 years. Independent sources replace the belt with them as a kit, and some UK owners cite 90,000 miles. This is an interference engine, so a broken belt usually wrecks it. A 2016 reaches the 10-year mark in 2026." },
    { key: "coolant", name: "Coolant", mi: null, mo: null, verify: true, note: "Volvo's 2016 US schedule lists level checks only, with no replacement interval. Use Volvo coolant 50/50. Ask a shop to test its condition at a service." }
  ];
  var EXTRA = [
    { key: "trans", name: "Automatic transmission fluid" },
    { key: "tires", name: "Tires and rotation" },
    { key: "other", name: "Other repair or service" }
  ];
  var NAMES = {};
  ITEMS.forEach(function (i) { NAMES[i.key] = i.name; });
  EXTRA.forEach(function (i) { NAMES[i.key] = i.name; });

  var SYSTEMS = [
    { id: "eng", n: "Engine core", pin: [132, 250], b: "The block, pistons, valve timing and the oil system. Oil level and consumption are the number one thing to watch on this engine family." },
    { id: "air", n: "Air and turbo", pin: [190, 222], b: "Everything that meters and boosts the air: filter, mass-air sensor, turbo, charge pipes, intercooler and throttle." },
    { id: "fuel", n: "Fuel and ignition", pin: [600, 306], b: "Direct injection puts fuel straight into each cylinder at very high pressure, and the coils and plugs light it. Work on the high-pressure side belongs in a shop." },
    { id: "cool", n: "Cooling", pin: [70, 262], b: "Coolant, thermostat, water pump, radiator and fan keep the engine in its working temperature band. The same loop heats the cabin." },
    { id: "exh", n: "Exhaust and emissions", pin: [520, 322], b: "Manifold, catalytic converter, oxygen sensors, tailpipe and the EVAP system that traps fuel vapor." },
    { id: "trans", n: "Transmission and driveline", pin: [305, 318], b: "The 8-speed automatic, torque converter, axles and mounts that carry power to the front wheels." },
    { id: "brk", n: "Brakes", pin: [212, 300], b: "Pads, discs, calipers, fluid and the ABS and stability sensors." },
    { id: "susp", n: "Suspension", pin: [254, 258], b: "Struts, springs, arms, bushings and links that keep the tires planted and the ride controlled." },
    { id: "steer", n: "Steering", pin: [338, 230], b: "Rack, tie rods, alignment and the sensors the stability system reads." },
    { id: "tire", n: "Tires and wheels", pin: [148, 338], b: "The only parts that touch the road: tread, pressure, age, bearings and balance." },
    { id: "elec", n: "Electrical", pin: [402, 190], b: "Battery, alternator, starter, control modules, wiring and lights." },
    { id: "hvac", n: "Climate", pin: [450, 218], b: "Cabin filter, A/C compressor, blower and the heater core." },
    { id: "body", n: "Body and safety", pin: [560, 144], b: "Seat belts, airbags, glass, wipers and the structure that protects you." }
  ];

  // id, system, name, difficulty (e/m/s), role, signs, how to check, linked service item
  var P = [
    ["oilfilter","eng","Oil and filter","e","Lubricates, cools the pistons and feeds the turbo.","dark gritty oil|level dropping between changes|low-oil message","This engine has no dipstick. With the ignition in mode II, roll the thumb wheel on the left stalk to Oil level. Check monthly on level ground.","oil"],
    ["pistons","eng","Pistons and rings","s","Seal combustion gas and keep oil out of the cylinders.","oil use between changes|blue smoke after idling or hard acceleration|low oil warnings","Log checks in Oil watch. A dealer oil consumption test is the formal check.",""],
    ["oilpump","eng","Oil pump and pressure","s","Pushes oil through the engine and turbo.","oil pressure warning|ticking at idle that fades when warm","Oil level in the instrument cluster first, then scan for oil pressure codes. A warning with a normal level needs a shop.",""],
    ["timing","eng","Valve timing system","s","Keeps the camshafts in step with the crankshaft.","timing codes such as P0016 or P0011|rough start|rattle on a cold start","Scan for codes and listen at a cold start.",""],
    ["pcv","eng","PCV system","m","Returns crankcase vapors to the intake.","oil smell|oily intake hose|leaks at several seals|rising oil use","Inspect the hoses and valve for sludge, cracks or pooled oil. Owners report a clogged PCV raising oil use.",""],
    ["seals","eng","Valve cover and oil pan seals","m","Hold oil in at the top and bottom of the engine.","oil spots under the car|burning-oil smell after a drive","Look for wet, dirty areas on the engine and for a spot on the driveway.",""],
    ["emount","eng","Engine mounts","m","Hold the engine in place and absorb vibration.","vibration at idle|clunk when shifting into gear","With the brake held, watch the engine move while a helper shifts between D and R. Look for cracked rubber.",""],

    ["airfilter","air","Engine air filter","e","Keeps dust out of the turbo and engine.","hesitation|visibly dirty element|poorer economy","Pull the element and hold it up to a light.","airfilter"],
    ["maf","air","Mass air flow sensor","e","Measures the air entering the engine.","lean or rich codes|hesitation|rough idle","Compare readings in the Data lab against earlier logs. Clean only with MAF-safe spray.",""],
    ["piping","air","Charge pipes and intercooler","m","Carry compressed air to the engine and cool it.","hiss under boost|underboost codes|oily film on the pipes","Check clamps and joints. A light oil mist can be normal on turbo engines, pooling oil is not.",""],
    ["turbo","air","Turbocharger","s","Compresses intake air using exhaust energy.","whistle or siren sound|blue smoke|power loss|P0299 or P0234","Look for oil at the compressor outlet and check for shaft play. Compare boost across Data lab logs.",""],
    ["throttle","air","Throttle body","m","Meters air into the engine.","rough idle|stalling when stopping|slow response","Inspect for carbon build-up and compare throttle readings in live data.",""],
    ["mapsens","air","Boost and pressure sensor","m","Reports manifold pressure to the engine computer.","boost codes|limp mode|poor power","Check that the reading at key-on matches outside air pressure in live data.",""],
    ["boostctl","air","Boost control valve","s","Sets how much boost the turbo makes.","overboost or underboost codes|limp mode","Needs a scan tool and often smoke testing.",""],

    ["plugs","fuel","Spark plugs","m","Ignite the mixture.","misfire under load|hard starts|poor economy","Check the gap and wear when removed. Intervals vary by source, see Records.","plugs"],
    ["coils","fuel","Ignition coils","m","Make the spark for each cylinder.","misfire under load|flashing check engine light|codes P0301 to P0304","Swap a suspect coil with a neighbor and see whether the misfire code follows it.",""],
    ["injectors","fuel","Fuel injectors","s","Spray fuel directly into the cylinders.","rough idle|lean codes|misfire at idle","Check fuel trims in the Data lab, then have a shop test them.",""],
    ["hpfp","fuel","High-pressure fuel pump","s","Raises fuel pressure for direct injection.","long cranking|code P0087|power loss under load","Scan fuel rail pressure. Never open high-pressure lines at home.",""],
    ["fuelpump","fuel","In-tank pump and filter","s","Feeds the high-pressure pump.","stalling at low fuel|hesitation|hard start","A shop fuel pressure test is the check.",""],
    ["knock","fuel","Knock sensor","m","Listens for engine knock so the computer can protect the engine.","reduced power|code P0325","Scan for codes and inspect the connector.",""],

    ["coolant","cool","Coolant level and condition","e","Carries heat away and protects against corrosion.","low reservoir|brown or oily coolant|sweet smell","Check the reservoir only when the engine is cold. Note color and any oily film.","coolant"],
    ["thermostat","cool","Thermostat","s","Holds coolant back until the engine is warm.","slow warm-up|weak cabin heat|temperature swings|code P0128","Use the warm-up time in the Data lab. Owners report the job is costly because the intake has to come off.",""],
    ["radiator","cool","Radiator and hoses","e","Reject heat to the air.","leaks|swollen or soft hoses|crusty residue","With the engine cold, squeeze the hoses and look for white or green crust at joints.",""],
    ["pump","cool","Water pump","s","Circulates coolant.","coolant drip at the pump|whine|overheating","Look for a trail of coolant at the pump.",""],
    ["fan","cool","Cooling fan","m","Pulls air through the radiator at low speed.","overheating in traffic|fan never runs|code P0480","With A/C on at idle the fan should run.",""],

    ["manifold","exh","Exhaust manifold and turbo flange","s","Collect exhaust from the cylinders and feed the turbo.","ticking when cold|exhaust smell in the cabin|soot streaks","Look for black soot trails at joints.",""],
    ["cat","exh","Catalytic converter","s","Cleans exhaust gas.","code P0420|rattle|rotten-egg smell|power loss","Rule out misfires and oil burning first, since both damage converters.",""],
    ["o2","exh","Oxygen sensors","m","Report exhaust oxygen so the computer can adjust fueling.","heater circuit codes|poor economy|slow-response codes","Scan for codes and compare sensor readings in live data.",""],
    ["pipes","exh","Muffler, pipes and hangers","e","Quiet the exhaust and route it.","rattle|loud exhaust|rust holes","With the car cold, push gently on the pipe and look for cracked hangers.",""],
    ["evap","exh","EVAP system and gas cap","e","Traps fuel vapor.","code P0455 or P0442|fuel smell|hard fueling","Reseat or replace the gas cap first. A worn cap seal is a common cause.",""],

    ["atf","trans","Automatic transmission fluid","s","Hydraulic fluid, coolant and lubricant for the gearbox.","shudder|flare between gears|dark burnt-smelling fluid","Volvo lists no scheduled change for normal driving. Ask a dealer how to check condition and which fluid your VIN needs.","trans"],
    ["converter","trans","Torque converter","s","Couples the engine to the gearbox.","shudder at light throttle|slip feel","A shop check with live data.",""],
    ["axles","trans","CV axles and boots","e","Send power to the front wheels.","clicking on tight turns|grease flung inside the wheel","Turn the wheel to full lock and inspect the rubber boots.",""],
    ["tmount","trans","Transmission mount","m","Holds the gearbox in place.","clunk on throttle changes|vibration","Look for cracked or collapsed rubber.",""],
    ["shift","trans","Shifter and cable","m","Selects gears.","stiff or loose shifter|wrong gear shown on the dash","Check for play and that the displayed gear matches.",""],

    ["pads","brk","Brake pads","e","Create friction against the discs.","squeal|grinding|longer stops","Look through the wheel spokes and measure what is left.","brakes"],
    ["rotors","brk","Brake discs","e","The surface the pads clamp.","pulsing pedal|deep grooves|a lip at the edge","Run a fingernail across the face and measure thickness against the minimum stamped on the disc.",""],
    ["bfluid","brk","Brake fluid","m","Transmits pedal force and absorbs water over time.","spongy pedal|dark fluid","Check color and level. Replace on a calendar.","brakefluid"],
    ["calipers","brk","Calipers and slides","m","Squeeze the pads against the discs.","pulling to one side|one wheel hotter than the others|uneven pad wear","After a drive, compare wheel heat by holding a hand near, not touching.",""],
    ["absens","brk","ABS and stability sensors","s","Report wheel speeds.","ABS or stability warning lights|traction control disabled","Needs a scan tool that reads the ABS module.",""],
    ["parking","brk","Parking brake","s","Holds the car when parked.","warning message|will not release or apply","Check the dash message and test on a slope.",""],

    ["struts","susp","Struts and shock absorbers","e","Control wheel movement.","bouncing after bumps|nose dive|oily film on the body","Look for oil on the shock body and do a push-down test at each corner.",""],
    ["arms","susp","Control arms and bushings","m","Locate the wheels.","clunk over bumps|wandering|uneven tire wear","Look for torn rubber and check for play with a pry bar on a lift.",""],
    ["springs","susp","Coil springs and mounts","m","Hold the car up.","a sagging corner|creak or clunk turning|broken coil","Compare ride height side to side.",""],
    ["balljoints","susp","Ball joints","m","Pivot between the arm and the wheel.","clunk|loose steering|uneven wear","Check for play with the wheel raised.",""],
    ["links","susp","Sway bar links","e","Connect the anti-roll bar.","rattle on small bumps","Grab each link and shake it.",""],
    ["rear","susp","Rear suspension arms","m","Locate the rear wheels.","rear clunk|odd tire wear|poor tracking","Inspect bushings for cracks.",""],

    ["rack","steer","Steering rack","s","Turns the front wheels.","play|noise|heavy feel","Check boots for tears and feel for play on the road.",""],
    ["tierods","steer","Tie rods","m","Connect the rack to the wheels.","play|wear on the inner tire edge","Wiggle the raised wheel at 3 and 9 o'clock.",""],
    ["align","steer","Wheel alignment","s","Sets the wheel angles.","pulling|off-center steering wheel|uneven tire wear","Read the tire wear pattern, then have it measured.",""],
    ["assist","steer","Power steering assist","s","Reduces steering effort.","heavy steering|steering warning light","Check for dash warnings and scan the module.",""],
    ["angle","steer","Steering angle sensor","s","Tells the stability system where you are pointing.","stability warning after battery work or alignment","Needs a scan tool calibration.",""],

    ["tread","tire","Tread depth","e","Grip, especially in rain.","wear bars showing|longer wet stops","Use a tread gauge across the full width.","tires"],
    ["pressure","tire","Pressure and TPMS","e","Set handling, wear and economy.","TPMS light|one tire low every week","Check cold monthly against the placard in the door jamb.",""],
    ["bearings","tire","Wheel bearings","m","Let the wheels spin freely.","hum that changes when steering left or right|growl rising with speed","Spin each raised wheel and listen, then rock it for play.",""],
    ["balance","tire","Balance and rotation","s","Smooth rolling.","vibration at highway speed|cupped wear","Rotate at oil services and balance if vibration appears.",""],
    ["age","tire","Tire age","e","Rubber hardens with age.","cracked sidewalls|hard compound","Read the four-digit DOT date: week, then year.",""],

    ["battery","elec","Battery","e","Starts the engine and powers the electronics.","slow crank|dim lights|random warnings at start","Resting voltage around 12.4 to 12.7 V is healthy. A parts store load test is usually free.",""],
    ["alternator","elec","Alternator and charging","m","Charges the battery while driving.","battery light|dimming lights|dead battery","Running voltage in the Data lab should sit around 13.5 to 14.7 V.",""],
    ["starter","elec","Starter motor","m","Cranks the engine.","click without cranking|slow crank","Rule out the battery and cables first.",""],
    ["modules","elec","Control modules and wiring","s","The car's network of computers.","random warnings|U-series codes|water in connectors","Look for corrosion and damp carpets. Needs Volvo-aware scan tools.",""],
    ["lights","elec","Bulbs and lighting","e","See and be seen.","bulb warnings|dim beams","Walk around the car with a helper.",""],

    ["cabin","hvac","Cabin air filter","e","Cleans the air entering the cabin.","weak airflow|musty smell|fogging windows","Replace yearly or when dirty.",""],
    ["compressor","hvac","A/C compressor","s","Compresses the refrigerant.","warm air|clutch not engaging|noise","A shop should check pressures.",""],
    ["blower","hvac","Blower motor and resistor","m","Moves air through the vents.","fan works on only some speeds|whine","Test every fan speed.",""],
    ["heater","hvac","Heater core and coolant flow","s","Uses engine heat for the cabin.","no heat|sweet smell|foggy glass","Check coolant level and hose temperatures.",""],

    ["wipers","body","Wipers and washer","e","Keep the glass clear.","streaking|chatter|weak spray","Replace blades yearly and clear washer nozzles.",""],
    ["belts","body","Seat belts","e","Restrain you in a crash.","slow retraction|frayed webbing|buckle not clicking","Pull each belt out slowly and look along the webbing.",""],
    ["srs","body","Airbags and SRS","s","Protect you in a crash.","SRS warning light","Never work on these yourself. Have a shop read the module.",""],
    ["glass","body","Windshield and glass","e","Visibility and structure.","chips|spreading cracks","Repair chips early.",""],
    ["rust","body","Underbody and corrosion","e","Structure and lines.","bubbling paint|flaking underbody|corroded lines","Inspect sills and brake lines, especially if the car has seen road salt.",""]
  ];
  var PARTS = P.map(function (r) {
    return { id: r[0], sys: r[1], name: r[2], diff: r[3], role: r[4], signs: r[5].split("|"), check: r[6], link: r[7] };
  });
  var DIFFN = { e: "Easy", m: "Moderate", s: "Shop" };

  var SYMPTOMS = [
    ["idle", "Rough or unsteady idle", [["plugs","Worn plugs cause a lumpy idle."],["coils","A weak coil misfires at low load."],["maf","A dirty or drifting air sensor upsets the mixture."],["throttle","Carbon on the throttle body disturbs idle control."],["pcv","A leaking or clogged PCV changes crankcase pressure and idle."],["injectors","A sticky injector misfires at idle."],["emount","Worn mounts turn small shakes into big ones."]]],
    ["power", "Hesitation or low power", [["airfilter","Cheapest check first."],["piping","A leak after the turbo loses boost."],["maf","Bad air readings give the wrong fuel."],["coils","Misfire shows up under load."],["turbo","A tired turbo cannot make full boost."],["hpfp","Low fuel pressure under load."],["cat","A clogged converter chokes the exhaust."]]],
    ["flash", "Check engine light is flashing", [["coils","A flashing light means an active misfire, often a coil."],["plugs","Worn plugs can cause it too."],["injectors","A failing injector can misfire a cylinder."]]],
    ["smoke", "Blue smoke or burning oil smell", [["pistons","Worn rings or pistons let oil into the cylinders."],["pcv","A blocked PCV can push oil into the intake."],["turbo","Failing turbo seals burn oil."],["seals","Leaks onto hot parts smell like burning oil."]]],
    ["hot", "Running hot or temperature swings", [["coolant","Low coolant is the first check, with the engine cold."],["thermostat","A sticking thermostat swings temperature."],["fan","No fan means overheating in traffic."],["radiator","Blocked or leaking radiator or hoses."],["pump","A weak water pump circulates too little."]]],
    ["heat", "Weak or no cabin heat", [["coolant","Low coolant starves the heater."],["thermostat","A stuck-open thermostat never gets hot enough."],["heater","A blocked heater core."]]],
    ["click", "Clicking when turning", [["axles","Dry or torn CV joints click on lock."],["bearings","A worn bearing can add noise on turns."]]],
    ["clunk", "Clunk over bumps", [["links","Cheap and common."],["arms","Worn bushings."],["struts","Tired struts or mounts."],["balljoints","Worn joints."],["tmount","A worn mount clunks on throttle changes too."]]],
    ["vibe", "Vibration at highway speed", [["balance","Out-of-balance wheels are the usual cause."],["tread","Flat spots or damaged tires."],["axles","Worn inner joints vibrate under load."],["emount","Worn mounts pass vibration into the cabin."]]],
    ["pulse", "Pulsing brake pedal", [["rotors","Uneven discs pulse."],["calipers","A sticking caliper overheats a disc."]]],
    ["tpms", "Tire pressure light stays on with tires inflated", [["pressure","First, at startup, watch the light. Steady with a 'Tire pressure low' message usually means the system needs calibrating. If it flashes for about a minute and then stays on with 'Tire press. syst Service required', the system itself has a fault. To calibrate: set all four tires to the door-pillar pressure when cold, then go to MY CAR > Settings > Car settings > Tire monitoring > Calibrate tire pressure, and drive at least 10 minutes above 20 mph. Calibrate after every pressure or tire change."],["tread","Your car's VIN decodes to the indirect type, with no wheel sensors: it compares wheel speeds instead. A new, worn or mismatched tire changes rolling size and can trigger it. Metal valve stems with a nut usually mean sensors are fitted; plain rubber stems usually mean the wheel-speed type."],["absens","Flashing then steady, especially with the ABS or stability light also on, points at a wheel-speed sensor or module fault. A phone OBD adapter cannot read this. It needs a full-module scan."]]],
    ["crank", "Slow crank or dead battery", [["battery","Test first."],["alternator","Low charging voltage drains the battery."],["starter","Heavy draw or clicking."],["modules","A module that does not sleep drains the battery."]]],
    ["oilsmell", "Oil smell or oil spots", [["seals","Look at the valve cover and pan."],["pcv","Pressure pushes oil past seals."],["turbo","Oil lines and seals."],["oilfilter","A loose filter or drain plug."]]],
    ["fuelsmell", "Fuel smell", [["evap","Reseat the gas cap first."],["injectors","A leaking injector."],["hpfp","High-pressure side leaks need a shop right away."]]],
    ["shudder", "Transmission shudder or harsh shifts", [["atf","Fluid condition and the right fluid."],["converter","Converter shudder at light throttle."],["tmount","Worn mounts exaggerate shifts."]]]
  ].map(function (r) { return { id: r[0], label: r[1], causes: r[2] }; });

  // code, title, system, urgency (now/soon/watch), common causes
  var CODEROWS = [
    ["P0011","Camshaft timing over-advanced or system performance, bank 1","eng","soon","Low or dirty oil, timing actuator or solenoid, timing chain wear"],
    ["P0014","Exhaust camshaft timing over-advanced, bank 1","eng","soon","Low or dirty oil, actuator solenoid, timing wear"],
    ["P0016","Crankshaft and camshaft position correlation, bank 1","eng","soon","Timing chain stretch, sensor fault, low oil"],
    ["P0030","Oxygen sensor heater control circuit, bank 1 sensor 1","o2","watch","Heater element, wiring, fuse"],
    ["P0087","Fuel rail or system pressure too low","fuel","now","High-pressure pump, low-pressure supply, injector leak"],
    ["P0088","Fuel rail or system pressure too high","fuel","now","Pressure regulator, pump control, sensor fault"],
    ["P0101","Mass air flow sensor range or performance","air","soon","Dirty or failed sensor, intake leak, clogged filter"],
    ["P0102","Mass air flow circuit low input","air","soon","Sensor or wiring fault, intake leak"],
    ["P0103","Mass air flow circuit high input","air","soon","Sensor or wiring fault"],
    ["P0106","Manifold pressure sensor range or performance","air","soon","Sensor fault, boost or vacuum leak"],
    ["P0111","Intake air temperature sensor range or performance","air","watch","Sensor fault"],
    ["P0112","Intake air temperature circuit low","air","watch","Sensor or wiring short"],
    ["P0113","Intake air temperature circuit high","air","watch","Sensor or wiring open"],
    ["P0117","Coolant temperature circuit low","cool","soon","Sensor fault, wiring short"],
    ["P0118","Coolant temperature circuit high","cool","soon","Sensor fault, wiring open"],
    ["P0125","Insufficient coolant temperature for closed-loop fuel control","cool","watch","Thermostat stuck open, sensor fault"],
    ["P0128","Coolant temperature below thermostat regulating temperature","cool","soon","Thermostat stuck open, sensor fault, low coolant"],
    ["P0133","Oxygen sensor circuit slow response, bank 1 sensor 1","o2","soon","Aging sensor, exhaust leak"],
    ["P0135","Oxygen sensor heater circuit, bank 1 sensor 1","o2","watch","Heater element, wiring"],
    ["P0141","Oxygen sensor heater circuit, bank 1 sensor 2","o2","watch","Heater element, wiring"],
    ["P0171","System too lean, bank 1","fuel","soon","Intake or vacuum leak, weak fuel delivery, dirty air sensor, PCV leak"],
    ["P0172","System too rich, bank 1","fuel","soon","Leaking injector, fuel pressure, faulty air or oxygen sensor"],
    ["P0191","Fuel rail pressure sensor range or performance","fuel","soon","Sensor fault, pump or supply problem"],
    ["P0234","Turbo overboost condition","air","now","Boost control fault, stuck wastegate actuator"],
    ["P0299","Turbo underboost condition","air","soon","Boost leak, boost control fault, tired turbo, clogged exhaust"],
    ["P0300","Random or multiple cylinder misfire","fuel","now","Plugs, coils, fuel delivery, intake leak"],
    ["P0301","Cylinder 1 misfire","fuel","now","Coil, plug, injector"],
    ["P0302","Cylinder 2 misfire","fuel","now","Coil, plug, injector"],
    ["P0303","Cylinder 3 misfire","fuel","now","Coil, plug, injector"],
    ["P0304","Cylinder 4 misfire","fuel","now","Coil, plug, injector"],
    ["P0325","Knock sensor 1 circuit","fuel","watch","Sensor, wiring or connector"],
    ["P0335","Crankshaft position sensor circuit","eng","now","Sensor, wiring, reluctor wheel"],
    ["P0340","Camshaft position sensor circuit","eng","soon","Sensor, wiring"],
    ["P0420","Catalyst efficiency below threshold, bank 1","exh","soon","Aging converter, misfires or oil burning, exhaust leak, oxygen sensors"],
    ["P0440","Evaporative emission system malfunction","exh","watch","Gas cap, purge or vent valve, hoses"],
    ["P0442","Evaporative system small leak","exh","watch","Gas cap, hoses, purge valve"],
    ["P0446","Evaporative vent control circuit","exh","watch","Vent valve, wiring"],
    ["P0455","Evaporative system large leak","exh","watch","Loose gas cap, hose off, filler neck"],
    ["P0456","Evaporative system very small leak","exh","watch","Gas cap seal, small hose leak"],
    ["P0480","Cooling fan 1 control circuit","cool","soon","Fan, relay, wiring"],
    ["P0500","Vehicle speed sensor","trans","soon","Speed sensor, wiring"],
    ["P0505","Idle control system","air","watch","Throttle body, intake leak"],
    ["P0506","Idle speed lower than expected","air","watch","Dirty throttle body, intake restriction"],
    ["P0507","Idle speed higher than expected","air","watch","Intake leak, throttle body"],
    ["P0521","Engine oil pressure sensor range or performance","eng","now","Low oil, sensor fault, pump wear"],
    ["P0524","Engine oil pressure too low","eng","now","Low oil level, pump or bearing wear. Stop and check oil."],
    ["P0560","System voltage","elec","soon","Battery, charging, wiring"],
    ["P0562","System voltage low","elec","soon","Weak battery, alternator, bad ground"],
    ["P0563","System voltage high","elec","soon","Alternator regulator"],
    ["P0600","Serial communication link","elec","soon","Module or wiring fault"],
    ["P0606","Engine computer processor fault","elec","now","Control module, power supply"],
    ["P0700","Transmission control system request","trans","soon","Transmission has its own code. Read the transmission module."],
    ["P0730","Incorrect gear ratio","trans","now","Low or degraded fluid, internal wear, solenoid"],
    ["P2096","Post-catalyst fuel trim too lean, bank 1","exh","soon","Exhaust leak, rear oxygen sensor, converter"]
  ];
  var CODES = {};
  CODEROWS.forEach(function (r) { CODES[r[0]] = { t: r[1], sys: r[2] === "o2" ? "exh" : r[2], u: r[3], c: r[4] }; });
  var URG = { now: "Do not keep driving hard. Have it checked soon.", soon: "Plan a check within weeks.", watch: "Low urgency, but do not ignore it for long." };
  var PREFIX = { P: "Powertrain (engine and transmission)", B: "Body", C: "Chassis", U: "Network and communication" };

  /* ---------- state and persistence ---------- */
  var state = { odo: null, log: [], oil: [], rate: {}, codes: [], runs: [] };
  var mode = "pending";
  var ref = null;
  var chain = Promise.resolve();
  var pendingDel = {};
  var LSKEY = "v60-garage-v1";
  var MODS = (typeof window !== "undefined" && window.V60_MODULES) || [];
  var ui = { tab: "today", sys: "eng", open: {}, overlay: "cond" };

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function fmt(n) { return Number(n).toLocaleString("en-US"); }
  function f1(n) { return (Math.round(n * 10) / 10).toString(); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function todayStr() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function monthsSince(dateStr) { var p = dateStr.split("-"); var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2])); return (Date.now() - d.getTime()) / (30.4375 * 86400000); }
  function setStatus(t) { $("saveStatus").textContent = t; }
  function isNum(x) { return typeof x === "number" && isFinite(x); }

  function clean(raw) {
    var out = { odo: null, log: [], oil: [], rate: {}, codes: [], runs: [], mods: {} };
    if (!raw || typeof raw !== "object") return out;
    if (isNum(raw.odo)) out.odo = raw.odo;
    ["log", "oil"].forEach(function (k) {
      if (Array.isArray(raw[k])) out[k] = raw[k].filter(function (e) { return e && isNum(e.miles) && typeof e.date === "string"; });
    });
    if (Array.isArray(raw.codes)) out.codes = raw.codes.filter(function (e) { return e && typeof e.code === "string" && typeof e.date === "string"; });
    if (Array.isArray(raw.runs)) out.runs = raw.runs.filter(function (e) { return e && typeof e.date === "string"; });
    if (raw.academy && typeof raw.academy === "object") {
      var ac = raw.academy, o = { done: {}, quiz: {}, jobs: {}, data: {} };
      if (ac.bayFound && typeof ac.bayFound === "object") { o.bayFound = {}; Object.keys(ac.bayFound).forEach(function (k) { o.bayFound[k] = 1; }); }
      if (ac.sim && isNum(ac.sim.played) && isNum(ac.sim.correct)) o.sim = { played: ac.sim.played, correct: ac.sim.correct, clean: isNum(ac.sim.clean) ? ac.sim.clean : 0 };
      ["done", "quiz", "jobs", "data"].forEach(function (k) { if (ac[k] && typeof ac[k] === "object" && !Array.isArray(ac[k])) Object.keys(ac[k]).slice(0, 200).forEach(function (id) { if (ac[k][id] && typeof ac[k][id] === "object") o[k][id] = ac[k][id]; }); });
      out.academy = o;
    }
    if (raw.lastScan && typeof raw.lastScan === "object") out.lastScan = raw.lastScan;
    if (raw.bayMap && typeof raw.bayMap === "object") { var bm = { photo: typeof raw.bayMap.photo === "string" ? raw.bayMap.photo : null, pins: {} }; if (raw.bayMap.pins && typeof raw.bayMap.pins === "object") Object.keys(raw.bayMap.pins).forEach(function (k) { var v = raw.bayMap.pins[k]; if (Array.isArray(v) && isNum(v[0]) && isNum(v[1])) bm.pins[k] = [v[0], v[1]]; }); out.bayMap = bm; }
    if (raw.recalls && typeof raw.recalls === "object") { out.recalls = {}; Object.keys(raw.recalls).forEach(function (k) { if (["unknown", "done", "open", "na"].indexOf(raw.recalls[k]) >= 0) out.recalls[k] = raw.recalls[k]; }); }
    if (Array.isArray(raw.specs)) out.specs = raw.specs.filter(function (x) { return x && typeof x.k === "string" && typeof x.v === "string"; }).slice(-200);
    if (Array.isArray(raw.photos)) out.photos = raw.photos.filter(function (x) { return x && typeof x.asset === "string" && typeof x.date === "string"; }).slice(-200);
    out.mods = {};
    if (raw.mods && typeof raw.mods === "object") MODS.forEach(function (m) { var v = raw.mods[m.id]; if (v != null) { try { out.mods[m.id] = m.clean ? m.clean(v) : v; } catch (e) { /* drop bad module data */ } } });
    if (raw.rate && typeof raw.rate === "object") {
      Object.keys(raw.rate).forEach(function (k) {
        var r = raw.rate[k];
        if (r && isNum(r.r) && r.r >= 1 && r.r <= 5) out.rate[k] = { r: r.r, d: String(r.d || ""), n: String(r.n || "").slice(0, 200) };
      });
    }
    return out;
  }

  var quietSave = false;
  function save() {
    var snapshot = JSON.parse(JSON.stringify(state));
    chain = chain.then(function () {
      if (mode === "db" && ref) return ref.set(snapshot).then(function () { setStatus("Saved to your private data for this page"); });
      try { localStorage.setItem(LSKEY, JSON.stringify(snapshot)); setStatus(window.V60_SYNC && window.V60_SYNC.on() ? "Saved on this device · syncing" : "Saved on this device"); }
      catch (e) { setStatus("Could not save. Changes last until you close the page."); }
      if (window.V60_SYNC && !quietSave) window.V60_SYNC.changed();
    }).catch(function () {
      try { localStorage.setItem(LSKEY, JSON.stringify(snapshot)); setStatus("Cloud save failed. Kept in this browser only."); }
      catch (e) { setStatus("Could not save. Changes last until you close the page."); }
    });
  }

  /* ---------- maintenance logic ---------- */
  function lastFor(key) {
    var best = null;
    state.log.forEach(function (e) {
      if (e.item !== key) return;
      if (!best || e.date > best.date || (e.date === best.date && e.miles > best.miles)) best = e;
    });
    return best;
  }
  function itemByKey(k) { for (var i = 0; i < ITEMS.length; i++) if (ITEMS[i].key === k) return ITEMS[i]; return null; }
  function statusFor(item) {
    var last = lastFor(item.key);
    if (!last) return { cls: "none", label: "No record", detail: "", ratio: null };
    var ratios = [], parts = [];
    if (item.mi && state.odo != null) {
      var since = state.odo - last.miles;
      ratios.push(since / item.mi);
      var left = item.mi - since;
      parts.push(left >= 0 ? fmt(Math.round(left)) + " mi left" : fmt(Math.round(-left)) + " mi over");
    }
    if (item.mo) {
      var m = monthsSince(last.date);
      ratios.push(m / item.mo);
      var days = Math.round((item.mo - m) * 30.4375);
      parts.push(days >= 0 ? fmt(days) + " days left" : fmt(-days) + " days over");
    }
    if (!ratios.length) return { cls: "none", label: item.mi || item.mo ? "Need odometer" : "Check only", detail: "", ratio: null };
    var r = Math.max.apply(null, ratios);
    return { cls: r >= 1 ? "over" : (r >= 0.85 ? "soon" : "ok"), label: r >= 1 ? "Overdue" : (r >= 0.85 ? "Due soon" : "On track"), detail: parts.join(", "), ratio: r };
  }
  function oilRate() {
    var list = state.oil.slice().sort(function (a, b) { return a.miles - b.miles; });
    if (list.length < 2) return null;
    var span = list[list.length - 1].miles - list[0].miles;
    if (span <= 0) return null;
    var added = 0;
    for (var i = 1; i < list.length; i++) added += Number(list[i].qts) || 0;
    return { rate: added / span * 1000, added: added, span: span, from: list[0].date, to: list[list.length - 1].date };
  }

  /* ---------- parts and systems ---------- */
  function partsOf(sys) { return PARTS.filter(function (p) { return p.sys === sys; }); }
  function partById(id) { for (var i = 0; i < PARTS.length; i++) if (PARTS[i].id === id) return PARTS[i]; return null; }
  function ratingOf(id) { var r = state.rate[id]; return r ? r.r : 0; }
  function sysCond(sys) {
    var ps = partsOf(sys), rated = ps.filter(function (p) { return ratingOf(p.id) > 0; });
    if (!rated.length) return { cls: "none", avg: null, n: 0, total: ps.length };
    var sum = 0, min = 5;
    rated.forEach(function (p) { var r = ratingOf(p.id); sum += r; if (r < min) min = r; });
    var avg = sum / rated.length;
    return { cls: (min <= 2 || avg < 3) ? "bad" : (avg < 4 ? "soon" : "ok"), avg: avg, n: rated.length, total: ps.length };
  }
  function sysMaint(sys) {
    var rank = { none: 0, ok: 1, soon: 2, over: 3 }, worst = "none";
    partsOf(sys).forEach(function (p) {
      if (!p.link) return;
      var it = itemByKey(p.link);
      if (!it) return;
      var s = statusFor(it).cls;
      if (rank[s] > rank[worst]) worst = s;
    });
    return worst === "over" ? "bad" : worst;
  }
  function zoneCls(sys) { return ui.overlay === "maint" ? sysMaint(sys) : sysCond(sys).cls; }

  /* ---------- bay ---------- */
  function buildBay() {
    var pins = SYSTEMS.map(function (s, i) {
      return '<g class="pin z-none" data-sys="' + s.id + '" role="button" tabindex="0" aria-pressed="false" aria-label="' + esc(s.n) + '" transform="translate(' + s.pin[0] + " " + s.pin[1] + ')">' +
        '<title>' + esc(s.n) + '</title><circle class="ring" r="20"/><circle class="dot" r="13"/><text y="4.5">' + (i + 1) + "</text></g>";
    }).join("");
    $("bayDiagram").innerHTML = '<svg viewBox="0 112 900 258" role="group" aria-label="Side view of the car with a numbered pin for each system">' +
      '<line class="ground" x1="10" y1="356" x2="890" y2="356"/>' +
      '<path class="body" d="M44 316 L40 262 Q44 236 92 228 L250 214 L372 148 Q386 140 408 140 L640 140 Q700 144 756 190 L808 232 Q834 244 840 270 L842 316 Z"/>' +
      '<path class="glass" d="M262 210 L368 156 L444 156 L444 210 Z"/>' +
      '<path class="glass" d="M458 156 L636 156 Q684 160 728 198 L744 210 L458 210 Z"/>' +
      '<path class="seam" d="M451 156 V316"/><path class="seam" d="M92 228 Q200 240 250 214"/>' +
      '<circle class="cut" cx="200" cy="300" r="66"/><circle class="cut" cx="705" cy="300" r="66"/>' +
      '<circle class="tire" cx="200" cy="300" r="54"/><circle class="tire" cx="705" cy="300" r="54"/>' +
      '<circle class="rim" cx="200" cy="300" r="34"/><circle class="rim" cx="705" cy="300" r="34"/>' +
      '<circle class="rim" cx="200" cy="300" r="9"/><circle class="rim" cx="705" cy="300" r="9"/>' +
      pins + "</svg>";
    $("sysRow").innerHTML = SYSTEMS.map(function (s, i) {
      return '<button type="button" data-sys="' + s.id + '" aria-pressed="false"><i class="z-none"></i>' + (i + 1) + ". " + esc(s.n) + "</button>";
    }).join("");
  }

  function renderBay() {
    SYSTEMS.forEach(function (s) {
      var z = zoneCls(s.id);
      var pin = document.querySelector('.pin[data-sys="' + s.id + '"]');
      if (pin) { pin.setAttribute("class", "pin z-" + z); pin.setAttribute("aria-pressed", ui.sys === s.id ? "true" : "false"); }
      var chip = document.querySelector('#sysRow button[data-sys="' + s.id + '"]');
      if (chip) { chip.setAttribute("aria-pressed", ui.sys === s.id ? "true" : "false"); chip.querySelector("i").setAttribute("class", "z-" + z); }
    });
    var sys = SYSTEMS.filter(function (s) { return s.id === ui.sys; })[0];
    var c = sysCond(sys.id);
    var parts = partsOf(sys.id).map(function (p) {
      var r = ratingOf(p.id), note = state.rate[p.id] ? state.rate[p.id].n : "";
      var cls = r === 0 ? "none" : (r <= 2 ? "bad" : (r === 3 ? "soon" : "ok"));
      var lbl = ["Unrated", "Failed", "Poor", "Fair", "Good", "New"][r];
      var link = "";
      if (p.link) {
        var it = itemByKey(p.link), last = lastFor(p.link);
        if (it) { var s = statusFor(it); link = '<p><b>Service:</b> <span class="pill ' + s.cls + '">' + s.label + "</span> " + (last ? "last at " + fmt(last.miles) + " mi on " + esc(last.date) : "no record yet") + ' <button type="button" class="quiet" data-jump="tab:records">Open records</button></p>'; }
        else if (p.link === "trans" || p.link === "tires") { var l2 = lastFor(p.link); link = "<p><b>Service:</b> " + (l2 ? "last logged at " + fmt(l2.miles) + " mi on " + esc(l2.date) : "no record yet") + "</p>"; }
      }
      var rb = [0, 1, 2, 3, 4, 5].map(function (n) {
        return '<button type="button" data-rate="' + p.id + ":" + n + '" data-lv="' + n + '" aria-pressed="' + (r === n ? "true" : "false") + '">' + (n === 0 ? "Unrated" : n + " " + ["", "Failed", "Poor", "Fair", "Good", "New"][n]) + "</button>";
      }).join("");
      return '<details class="part" id="part-' + p.id + '"' + (ui.open[p.id] ? " open" : "") + ' data-pid="' + p.id + '">' +
        '<summary><span class="nm">' + esc(p.name) + '</span><span class="tag">' + DIFFN[p.diff] + '</span><span class="pill ' + cls + '">' + lbl + "</span></summary>" +
        '<div class="pbody"><p>' + esc(p.role) + "</p>" +
        "<div><h4>Signs of trouble</h4><ul>" + p.signs.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul></div>" +
        "<div><h4>How to check</h4><p>" + esc(p.check) + "</p></div>" + link +
        '<div class="rate" role="group" aria-label="Condition of ' + esc(p.name) + '">' + rb + "</div>" +
        '<div class="field"><label for="n-' + p.id + '">Inspection note</label><input id="n-' + p.id + '" class="wide" data-note="' + p.id + '" type="text" maxlength="200" value="' + esc(note) + '"></div>' +
        (state.rate[p.id] && state.rate[p.id].d ? '<p class="status">Rated ' + esc(state.rate[p.id].d) + "</p>" : "") +
        "</div></details>";
    }).join("");
    $("sysDetail").innerHTML = "<h2>" + esc(sys.n) + "</h2><p>" + esc(sys.b) + '</p><p class="status">' +
      (c.n ? c.n + " of " + c.total + " parts rated, average " + f1(c.avg) + " out of 5" : c.total + " parts, none rated yet") + "</p>" + parts;
  }

  /* ---------- diagnose ---------- */
  function sysName(id) { for (var i = 0; i < SYSTEMS.length; i++) if (SYSTEMS[i].id === id) return SYSTEMS[i].n; return id; }
  function renderSymptom() {
    var id = $("symSel").value, out = $("symOut");
    var s = SYMPTOMS.filter(function (x) { return x.id === id; })[0];
    if (!s) { out.innerHTML = '<p class="empty">Choose a symptom to see the likely causes.</p>'; return; }
    out.innerHTML = '<ol class="actions" style="list-style:none;padding:0;margin:0">' + s.causes.map(function (c, i) {
      var p = partById(c[0]);
      if (!p) return "";
      var r = ratingOf(p.id);
      return '<li><span class="pill none">' + (i + 1) + '</span><span class="tx"><b>' + esc(p.name) + '</b> <span class="tag">' + DIFFN[p.diff] + "</span><br>" + esc(c[1]) + "</span>" +
        (r ? '<span class="pill ' + (r <= 2 ? "bad" : (r === 3 ? "soon" : "ok")) + '">rated ' + r + "</span>" : "") +
        '<button type="button" class="quiet" data-jump="part:' + p.id + '">Inspect</button></li>';
    }).join("") + "</ol>" + '<p class="lede">Ordered roughly from cheapest and easiest to check toward harder jobs. A flashing check engine light means an active misfire: ease off and get it checked soon, since raw fuel can damage the catalytic converter.</p>';
  }
  function decodeCode(raw) {
    var c = String(raw || "").trim().toUpperCase();
    if (!/^[PBCU][0-3][0-9A-F]{3}$/.test(c)) return { code: c, valid: false };
    var known = CODES[c];
    var d2 = c.charAt(1);
    var scope = d2 === "0" ? "generic (standard across makes)" : (d2 === "1" ? "manufacturer-specific (Volvo, needs Volvo information)" : "can be generic or manufacturer-specific");
    return { code: c, valid: true, known: known || null, prefix: PREFIX[c.charAt(0)], scope: scope };
  }
  function renderCodeLookup() {
    var v = $("codeIn").value.trim();
    var out = $("codeOut");
    if (!v) { out.innerHTML = ""; return; }
    var r = decodeCode(v);
    if (!r.valid) { out.innerHTML = '<p class="empty">Codes have five characters: a letter (P, B, C or U) followed by four digits, such as P0128.</p>'; return; }
    if (!r.known) {
      out.innerHTML = '<div class="card"><h3>' + esc(r.code) + '</h3><p>' + esc(r.prefix) + ". The second character marks it as " + esc(r.scope) + ". This code is not in the short list the page carries. Look it up in Volvo service information or ask a Volvo-capable shop.</p></div>";
      return;
    }
    var k = r.known;
    out.innerHTML = '<div class="card"><h3>' + esc(r.code) + " " + esc(k.t) + '</h3><p>' + esc(r.prefix) + ", " + esc(r.scope) + "." +
      '</p><p><b>Common causes:</b> ' + esc(k.c) + '.</p><p><b>Urgency:</b> ' + esc(URG[k.u]) + '</p><p><button type="button" class="quiet" data-jump="sys:' + k.sys + '">Open ' + esc(sysName(k.sys)) + "</button></p></div>";
  }
  function codeTitle(code) { var k = CODES[String(code).toUpperCase()]; return k ? k.t : "Not in the page's short list"; }
  function renderLastScan() {
    var L = state.lastScan, el = $("lastScan"); if (!el) return;
    if (!L) { el.innerHTML = ""; return; }
    el.innerHTML = '<div class="note calm"><b>Last V60 Link check, ' + esc(L.date) + ":</b> check-engine light " + (L.mil ? "on" : "off") + ", " + L.codes + " code" + (L.codes === 1 ? "" : "s") + " reported, " + (L.monitors ? (L.notReady.length ? L.notReady.length + " of " + L.monitors + " readiness monitors not ready (" + esc(L.notReady.join(", ")) + ")" : "all " + L.monitors + " readiness monitors ready") : "no readiness data") + ".</div>";
  }
  function renderCodes() {
    renderLastScan();
    var list = state.codes.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    if (!list.length) { $("codeBody").innerHTML = '<tr><td colspan="6" class="empty">No codes logged. When a scanner shows one, add it here so the Health tab counts it while it is active.</td></tr>'; return; }
    var lab = { active: "Active", cleared: "Cleared", resolved: "Fixed" };
    var cl = { active: "bad", cleared: "soon", resolved: "ok" };
    $("codeBody").innerHTML = list.map(function (e) {
      return '<tr><td class="num">' + esc(e.code) + "</td><td>" + esc(codeTitle(e.code)) + (e.note ? "<small>" + esc(e.note) + "</small>" : "") + '</td><td class="num">' + esc(e.date) + '</td><td class="num">' + (isNum(e.miles) ? fmt(e.miles) : "") +
        '</td><td><span class="pill ' + cl[e.status] + '">' + lab[e.status] + "</span></td><td>" + delBtn("code", e.id) + "</td></tr>";
    }).join("");
  }

  /* ---------- records ---------- */
  function delBtn(kind, id) { var k = kind + ":" + id, armed = !!pendingDel[k]; return '<button type="button" class="quiet' + (armed ? " confirm" : "") + '" data-del="' + k + '">' + (armed ? "Confirm" : "Delete") + "</button>"; }
  function renderDue() {
    var rows = ITEMS.map(function (item) {
      var s = statusFor(item), last = lastFor(item.key), interval = [];
      if (item.mi) interval.push(fmt(item.mi) + " mi");
      if (item.mo) interval.push(item.mo + " mo");
      return "<tr><td>" + esc(item.name) + (item.verify ? '<span class="tag verify">verify</span>' : "") + "<small>" + esc(item.note) + "</small></td>" +
        '<td class="num">' + esc(interval.join(" / ")) + '</td><td class="num">' + (last ? fmt(last.miles) + " mi<small>" + esc(last.date) + "</small>" : "<small>Not logged</small>") + "</td>" +
        '<td><span class="pill ' + s.cls + '">' + s.label + "</span>" + (s.detail ? "<small>" + esc(s.detail) + "</small>" : "") + "</td></tr>";
    });
    var t = lastFor("trans");
    rows.push("<tr><td>Automatic transmission fluid<small>Volvo publishes no fixed interval for normal driving. Some shops service it anyway. Ask a dealer for the right fluid by VIN.</small></td>" +
      '<td class="num">none set</td><td class="num">' + (t ? fmt(t.miles) + " mi<small>" + esc(t.date) + "</small>" : "<small>Not logged</small>") + '</td><td><span class="pill none">Inspect</span></td></tr>');
    $("dueBody").innerHTML = rows.join("");
  }
  function renderLog() {
    var list = state.log.slice().sort(function (a, b) { return a.date < b.date ? 1 : (a.date > b.date ? -1 : b.miles - a.miles); });
    if (!list.length) { $("logBody").innerHTML = '<tr><td colspan="5" class="empty">No entries yet. Add the last oil change, brake fluid flush or any repair you know the date of, and the table above fills in.</td></tr>'; return; }
    $("logBody").innerHTML = list.map(function (e) {
      return '<tr><td class="num">' + esc(e.date) + '</td><td class="num">' + fmt(e.miles) + "</td><td>" + esc(NAMES[e.item] || e.item) + "</td><td>" + esc(e.notes || "") + "</td><td>" + delBtn("log", e.id) + "</td></tr>";
    }).join("");
  }
  function renderOil() {
    var box = $("oilReadout"), o = oilRate();
    if (state.oil.length < 2) box.innerHTML = '<span class="status">Add at least two checks to see a consumption rate. Log the first right after an oil change.</span>';
    else if (!o) box.innerHTML = '<span class="status">The checks need different odometer readings to give a rate.</span>';
    else box.innerHTML = '<span style="font-family:var(--font-display);font-size:40px;font-weight:600;line-height:1">' + o.rate.toFixed(2) + '</span><span class="status">quarts per 1,000 miles</span><span class="status">' + f1(o.added) + " qt added over " + fmt(o.span) + " mi, " + esc(o.from) + " to " + esc(o.to) + "</span>";
    var rows = state.oil.slice().sort(function (a, b) { return b.miles - a.miles; });
    if (!rows.length) { $("oilBody").innerHTML = '<tr><td colspan="4" class="empty">No checks yet. Read the oil level in the instrument cluster at fill-ups and log the odometer and any quarts you add.</td></tr>'; return; }
    $("oilBody").innerHTML = rows.map(function (e) {
      return '<tr><td class="num">' + esc(e.date) + '</td><td class="num">' + fmt(e.miles) + '</td><td class="num">' + esc(e.qts) + "</td><td>" + delBtn("oil", e.id) + "</td></tr>";
    }).join("");
  }

  /* ---------- data lab: parsing ---------- */
  function splitLine(line, d) {
    var out = [], cur = "", q = false;
    for (var i = 0; i < line.length; i++) {
      var c = line.charAt(i);
      if (q) { if (c === '"') { if (line.charAt(i + 1) === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
      else if (c === '"') q = true;
      else if (c === d) { out.push(cur); cur = ""; }
      else cur += c;
    }
    out.push(cur);
    return out;
  }
  function parseNum(s, dec) {
    if (s == null) return NaN;
    var t = String(s).trim();
    if (t === "" || t === "-" || t === "--" || /^(n\/a|nan|null|none)$/i.test(t)) return NaN;
    if (dec === ",") t = t.replace(",", ".");
    var v = parseFloat(t);
    return isFinite(v) ? v : NaN;
  }
  function parseTime(raw, dec) {
    var v = parseNum(raw, dec), t = String(raw == null ? "" : raw).trim();
    if (isNum(v) && !/[:\/]|\d-\D/.test(t)) return v;
    var m = /^(\d{1,2}):(\d{2}):(\d{2}(?:[.,]\d+)?)$/.exec(t);
    if (m) return (+m[1]) * 3600 + (+m[2]) * 60 + parseFloat(m[3].replace(",", "."));
    var dt = Date.parse(t.replace(/^(\d{4}-\d{2}-\d{2}) /, "$1T"));
    return isFinite(dt) ? dt / 1000 : NaN;
  }
  function parseCSV(text) {
    text = String(text).replace(/^﻿/, "");
    var lines = text.split(/\r?\n/).filter(function (l) { return l.trim().length; });
    if (lines.length < 3) throw new Error("The file has too few rows to analyze.");
    var first = lines[0];
    var cands = [",", ";", "\t"].map(function (x) { return [x, first.split(x).length]; }).sort(function (a, b) { return b[1] - a[1]; });
    var d = cands[0][0];
    if (cands[0][1] < 2) throw new Error("Could not find columns. Expected comma, semicolon or tab separated values.");
    var dec = d === ";" ? "," : ".";
    var rows = lines.map(function (l) { return splitLine(l, d); });
    var headers = rows.shift().map(function (s) { return s.trim(); });
    var low = headers.map(function (h) { return h.toLowerCase(); });
    var pidI = low.indexOf("pid"), valI = low.indexOf("value");
    if (pidI >= 0 && valI >= 0) return buildLong(rows, low, headers, pidI, valI, dec);
    return buildWide(rows, headers, dec);
  }
  function buildWide(rows, headers, dec) {
    var timeI = -1, pri = [/^(seconds|elapsed|secs?)\b/i, /^time\s*\(?\s*s/i, /device time|^time$|timestamp/i, /time/i];
    for (var p = 0; p < pri.length && timeI < 0; p++) for (var i = 0; i < headers.length; i++) if (pri[p].test(headers[i])) { timeI = i; break; }
    var ok = true, t;
    if (timeI >= 0) {
      var tt = rows.map(function (row) { return parseTime(row[timeI], dec); });
      var good = tt.filter(isNum).length;
      if (good >= Math.max(5, rows.length * 0.8)) {
        rows = rows.filter(function (_, i) { return isNum(tt[i]); });
        t = tt.filter(isNum);
        for (var r = 1; r < t.length; r++) if (t[r] < t[r - 1]) { ok = false; break; }
      } else ok = false;
    }
    var n = rows.length;
    if (!ok || timeI < 0) { t = rows.map(function (_, i) { return i; }); }
    else {
      if (t[t.length - 1] > 1e11) t = t.map(function (x) { return x / 1000; });
      var t0 = t[0]; t = t.map(function (x) { return x - t0; });
    }
    var ch = {}, cols = [], units = {};
    headers.forEach(function (h, ci) {
      if (ci === timeI) return;
      var arr = rows.map(function (row) { return parseNum(row[ci], dec); });
      var good = arr.filter(isNum).length;
      if (good < Math.max(5, n * 0.4)) return;
      var name = h || ("Column " + (ci + 1));
      ch[name] = arr; cols.push(name);
      var m = /\(([^)]*)\)\s*$/.exec(h);
      units[name] = m ? m[1] : "";
    });
    if (!cols.length) throw new Error("No numeric channels were found in the file.");
    return { t: t, ch: ch, cols: cols, units: units };
  }
  function buildLong(rows, low, headers, pidI, valI, dec) {
    var tI = -1;
    ["seconds", "time", "elapsed", "time (s)", "time (sec)", "timestamp"].forEach(function (k) { if (tI < 0 && low.indexOf(k) >= 0) tI = low.indexOf(k); });
    var uI = low.indexOf("units");
    var series = {}, units = {}, tmin = Infinity, tmax = -Infinity;
    rows.forEach(function (row, idx) {
      var tv = tI >= 0 ? parseTime(row[tI], dec) : idx;
      var v = parseNum(row[valI], dec);
      var pid = (row[pidI] || "").trim();
      if (!pid || !isNum(tv)) return;
      if (!series[pid]) { series[pid] = []; units[pid] = uI >= 0 ? (row[uI] || "").trim() : ""; }
      if (isNum(v)) series[pid].push([tv, v]);
      if (tv < tmin) tmin = tv; if (tv > tmax) tmax = tv;
    });
    var cols = Object.keys(series).filter(function (k) { return series[k].length >= 5; });
    if (tmax - tmin > 1e8) { tmin /= 1000; tmax /= 1000; cols.forEach(function (c) { series[c].forEach(function (p) { p[0] /= 1000; }); }); }
    if (!cols.length || !isFinite(tmin)) throw new Error("No usable channels were found in the file.");
    var steps = Math.min(Math.floor(tmax - tmin) + 1, 20000);
    var t = [], ch = {}; cols.forEach(function (c) { ch[c] = []; });
    var ptr = {}; cols.forEach(function (c) { ptr[c] = 0; series[c].sort(function (a, b) { return a[0] - b[0]; }); });
    var last = {};
    for (var s = 0; s < steps; s++) {
      var ts = tmin + s; t.push(s);
      cols.forEach(function (c) {
        var arr = series[c];
        while (ptr[c] < arr.length && arr[ptr[c]][0] <= ts) { last[c] = arr[ptr[c]][1]; ptr[c]++; }
        ch[c].push(last[c] === undefined ? NaN : last[c]);
      });
    }
    return { t: t, ch: ch, cols: cols, units: units };
  }

  /* roles and analysis */
  /* each role lists patterns best-first; a column matching an earlier pattern wins, "no" excludes */
  var ROLES = [
    { k: "coolant", label: "Coolant temperature", pats: [/engine coolant temp/i, /coolant.*temp/i, /coolant|\bect\b/i], no: /fan|level|pressure/i },
    { k: "rpm", label: "Engine RPM", pats: [/^engine rpm/i, /\brpm\b|engine speed/i], no: /turbo|fan|target|desired/i },
    { k: "speed", label: "Vehicle speed", pats: [/speed.*\(obd\)|obd.*speed/i, /^vehicle speed/i, /^speed\b/i, /speed|^vss$/i], no: /rpm|engine|fan|wheel|turbo|air|gps|wind/i },
    { k: "load", label: "Engine load", pats: [/calculated.*load|^engine load\s*\(?%?\)?$/i, /(engine|calculated|absolute).*load|^load/i] },
    { k: "throttle", label: "Throttle position", pats: [/^throttle position\b/i, /throttle/i, /accelerator/i], no: /relative|commanded|desired|target/i },
    { k: "maf", label: "Air flow (MAF)", pats: [/mass air ?flow|\bmaf\b/i, /air ?flow/i], no: /volt|freq|hz/i },
    { k: "map", label: "Intake pressure or boost", pats: [/intake manifold (absolute )?pressure|manifold absolute|\bmap\b/i, /manifold.*pressure/i, /boost/i], no: /barometric|ambient|fuel|oil/i },
    { k: "stft", label: "Short-term fuel trim", pats: [/(short.*trim|trim.*short|stft).*(bank ?1|b1)|(bank ?1|b1).*(short|stft)/i, /short.*trim|trim.*short|\bstft/i] },
    { k: "ltft", label: "Long-term fuel trim", pats: [/(long.*trim|trim.*long|ltft).*(bank ?1|b1)|(bank ?1|b1).*(long|ltft)/i, /long.*trim|trim.*long|\bltft/i] },
    { k: "volt", label: "Battery or module voltage", pats: [/control module voltage|voltage \(control module\)|module voltage/i, /battery|system voltage/i, /\bvolt/i], no: /o2|oxygen|sensor|maf|throttle|pedal|adapter/i },
    { k: "iat", label: "Intake air temperature", pats: [/intake air temp|\biat\b/i, /intake.*temp/i], no: /coolant/i }
  ];
  ROLES.forEach(function (r) { r.test = function (n) { return !(r.no && r.no.test(n)) && r.pats.some(function (p) { return p.test(n); }); }; });
  function autoMap(cols) {
    var map = {}, used = {};
    ROLES.forEach(function (r) {
      var best = null, bi = Infinity;
      cols.forEach(function (c) {
        if (used[c] || (r.no && r.no.test(c))) return;
        for (var i = 0; i < r.pats.length && i < bi; i++) if (r.pats[i].test(c)) { best = c; bi = i; break; }
      });
      if (best) { map[r.k] = best; used[best] = true; }
    });
    return map;
  }
  var lab = { ds: null, map: {}, show: {}, res: null };

  function unitInfo(ds, map) {
    function text(k) { var c = map[k]; return c ? (c + " " + (ds.units[c] || "")) : ""; }
    var tsel = $("tempU") ? $("tempU").value : "auto", ssel = $("speedU") ? $("speedU").value : "auto";
    var tF = tsel === "F" || (tsel === "auto" && /°\s*f|\(\s*f\s*\)|fahrenheit|\bdeg ?f\b/i.test(text("coolant") + " " + text("iat")));
    var mph = ssel === "mph" || (ssel === "auto" && /mph|miles/i.test(text("speed")));
    var mps = ssel === "auto" && /m\/s|meters?\s*\/\s*sec/i.test(text("speed"));
    var mp = text("map"), mapU = /psi/i.test(mp) ? "psi" : (/\bbar\b/i.test(mp) ? "bar" : "kPa");
    return { tF: tF, mph: mph, mps: mps, mapU: mapU };
  }
  function series(ds, map, k, conv) {
    var c = map[k];
    if (!c || !ds.ch[c]) return null;
    return conv ? ds.ch[c].map(function (v) { return isNum(v) ? conv(v) : NaN; }) : ds.ch[c];
  }
  function pct(sorted, p) { if (!sorted.length) return NaN; var i = (sorted.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return sorted[lo] + (sorted[hi] - sorted[lo]) * (i - lo); }
  function stats(arr) {
    var v = arr.filter(isNum);
    if (!v.length) return null;
    var s = v.slice().sort(function (a, b) { return a - b; }), sum = 0;
    v.forEach(function (x) { sum += x; });
    return { n: v.length, min: s[0], max: s[s.length - 1], mean: sum / v.length, p5: pct(s, 0.05), p95: pct(s, 0.95) };
  }
  function meanOf(arr, mask) { var sum = 0, n = 0; for (var i = 0; i < arr.length; i++) if (mask[i] && isNum(arr[i])) { sum += arr[i]; n++; } return n ? { mean: sum / n, n: n } : null; }
  function stdOf(arr, mask) { var m = meanOf(arr, mask); if (!m || m.n < 2) return null; var ss = 0; for (var i = 0; i < arr.length; i++) if (mask[i] && isNum(arr[i])) ss += (arr[i] - m.mean) * (arr[i] - m.mean); return { mean: m.mean, sd: Math.sqrt(ss / m.n), n: m.n }; }

  function analyze(ds, map, units) {
    var t = ds.t, n = t.length, dur = t[n - 1] - t[0];
    var toC = function (v) { return units.tF ? (v - 32) * 5 / 9 : v; };
    var toKph = function (v) { return units.mph ? v * 1.609344 : (units.mps ? v * 3.6 : v); };
    var toKpa = function (v) { return units.mapU === "psi" ? v * 6.894757 : (units.mapU === "bar" ? v * 100 : v); };
    var cool = series(ds, map, "coolant", toC), rpm = series(ds, map, "rpm"), spd = series(ds, map, "speed", toKph);
    var thr = series(ds, map, "throttle"), stft = series(ds, map, "stft"), ltft = series(ds, map, "ltft");
    var volt = series(ds, map, "volt"), mp = series(ds, map, "map", toKpa), maf = series(ds, map, "maf");
    var finds = [], sum = { dur: dur };
    function add(level, title, detail) { finds.push({ level: level, title: title, detail: detail }); }
    var allMask = new Array(n); for (var i = 0; i < n; i++) allMask[i] = true;

    var warmIdx = -1;
    if (cool) {
      var cs = stats(cool);
      sum.coolMax = cs.max;
      for (i = 0; i < n; i++) if (isNum(cool[i]) && cool[i] >= 80) { warmIdx = i; break; }
      var startC = null; for (i = 0; i < n; i++) if (isNum(cool[i])) { startC = cool[i]; break; }
      if (warmIdx >= 0 && startC !== null && startC < 60) sum.warmMin = (t[warmIdx] - t[0]) / 60;
      if (cs.max >= 110) add("concern", "Coolant peaked at " + f1(cs.max) + " °C", "That is hot. Check coolant level (engine cold), the fan, and whether it happened in traffic or at speed. Repeat the log if this was an unusual day.");
      else if (dur >= 600 && cs.max < 75) add("watch", "Coolant never passed 75 °C in " + f1(dur / 60) + " minutes", "A thermostat stuck open or a sensor fault can do this, as can very cold weather. Code P0128 is the related one. Repeat the log on a warm day to compare.");
      else if (warmIdx >= 0) {
        var m = new Array(n); for (i = 0; i < n; i++) m[i] = i >= warmIdx;
        var after = cool.filter(function (v, idx) { return m[idx] && isNum(v); }).sort(function (a, b) { return a - b; });
        var band = pct(after, 0.95) - pct(after, 0.05);
        sum.coolMid = pct(after, 0.5);
        if (after.length > 60 && band > 15) add("watch", "Coolant swings about " + f1(band) + " °C after warm-up", "A healthy loop usually holds a fairly tight band once warm. Wide swings point at the thermostat or fan behavior. Compare with a second log.");
        else add("ok", "Warm-up and operating temperature look normal" + (sum.warmMin ? ": reached 80 °C in " + f1(sum.warmMin) + " min" : ""), "Settled near " + f1(sum.coolMid) + " °C (" + f1(sum.coolMid * 9 / 5 + 32) + " °F). Save this run as a baseline.");
      } else add("info", "Coolant did not reach 80 °C", "The log is short or the engine started cold and the drive was brief, so warm-up cannot be judged.");
    }

    var idleMask = new Array(n), cruiseMask = new Array(n);
    for (i = 0; i < n; i++) {
      var idleOk = rpm ? (isNum(rpm[i]) && rpm[i] > 400 && rpm[i] < 1200) : true;
      var slow = spd ? (isNum(spd[i]) && spd[i] < 1) : true;
      var warm = cool ? (warmIdx >= 0 && i >= warmIdx) : true;
      idleMask[i] = idleOk && slow && warm;
      cruiseMask[i] = spd ? (isNum(spd[i]) && spd[i] > 60) : false;
    }
    if (ltft) {
      var lt = stats(ltft); sum.ltft = lt.mean;
      var im = meanOf(ltft, idleMask), cm = meanOf(ltft, cruiseMask);
      var lvl = Math.abs(lt.mean) > 20 ? "concern" : (Math.abs(lt.mean) > 10 ? "watch" : "ok");
      var dir = lt.mean > 0 ? "adding fuel" : "removing fuel";
      add(lvl, "Long-term fuel trim averages " + (lt.mean >= 0 ? "+" : "") + f1(lt.mean) + " %", lvl === "ok" ? "Within the usual band of about 10 % either way." : "The computer is steadily " + dir + (lt.mean > 0 ? ", which means the engine is running lean on its own. Common causes are unmetered air (vacuum, PCV or intake leaks), a dirty or failing air-flow sensor, or weak fuel delivery. The related code is P0171." : ", which means the engine is running rich on its own. Common causes are a leaking injector, high fuel pressure, a stuck purge valve, or an air-flow sensor reading low. The related code is P0172."));
      if (im && cm && im.n > 20 && cm.n > 20 && (im.mean - cm.mean) > 8) add("watch", "Trim is " + f1(im.mean - cm.mean) + " points higher at idle than at cruise", "That pattern fits a vacuum or intake leak, which matters most when airflow is low.");
    }
    if (stft) { var st = stats(stft); sum.stft = st.mean; if (Math.abs(st.mean) > 8) add("watch", "Short-term fuel trim averages " + (st.mean >= 0 ? "+" : "") + f1(st.mean) + " %", "It normally hovers near zero. A large steady offset means the computer is working hard to hold the mixture."); }
    if (volt) {
      var vm = new Array(n);
      for (i = 0; i < n; i++) vm[i] = (rpm ? (isNum(rpm[i]) && rpm[i] > 500) : true) && (t[i] - t[0]) > 10;
      var vv = meanOf(volt, vm);
      if (vv && vv.n > 20) {
        sum.volt = vv.mean;
        var under = 0, low13 = 0;
        for (i = 0; i < n; i++) if (vm[i] && isNum(volt[i])) { if (volt[i] < 12.3) under++; if (volt[i] < 13.0) low13++; }
        sum.voltLowShare = low13 / vv.n;
        var smart = " Many recent cars, likely including this one (verify), use smart charging that lowers voltage once the battery is full, so readings near 12.6 to 13 V can be normal. A battery and charging test at a parts store settles it.";
        if (vv.mean > 15.0) add("concern", "Running voltage averages " + f1(vv.mean) + " V", "That is high. A failing regulator can overcharge and damage the battery and electronics.");
        else if (vv.mean < 12.3 || under / vv.n > 0.2) add("concern", "Running voltage is below battery resting level " + Math.round(100 * under / vv.n) + " % of the time (average " + f1(vv.mean) + " V)", "Below about 12.3 V with the engine running, the battery is being drained rather than charged. Suspect the alternator, its belt or connections, or a failing battery.");
        else if (vv.mean < 13.3 || low13 / vv.n > 0.25) add("watch", "Running voltage is low-ish: average " + f1(vv.mean) + " V, under 13 V for " + Math.round(100 * low13 / vv.n) + " % of the run", "Not necessarily a fault." + smart);
        else add("ok", "Charging voltage looks healthy at " + f1(vv.mean) + " V", "");
      }
    }
    if (rpm) {
      var sd = stdOf(rpm, idleMask);
      if (sd && sd.n > 30) {
        sum.idleRpm = sd.mean; sum.idleSd = sd.sd;
        if (sd.sd > 75) add("watch", "Warm idle is unsteady: about " + Math.round(sd.mean) + " rpm, spread " + Math.round(sd.sd), "Possible causes include a misfire, an intake leak or a dirty throttle body. Compare with a second log before chasing it.");
        else if (sd.mean < 550 || sd.mean > 1000) add("watch", "Warm idle averages " + Math.round(sd.mean) + " rpm", "Many engines idle roughly 600 to 900 rpm warm. Compare with your own baseline.");
        else add("ok", "Warm idle is steady at about " + Math.round(sd.mean) + " rpm", "Spread of " + Math.round(sd.sd) + " rpm.");
      }
    }
    if (maf) { var mm = meanOf(maf, idleMask); if (mm && mm.n > 30) { sum.mafIdle = mm.mean; add("info", "Warm-idle air flow baseline: " + f1(mm.mean) + " g/s", "Not good or bad by itself. A later log that reads very different at idle can mean a dirty sensor or an intake leak."); } }
    if (mp) {
      var ms = stats(mp); sum.mapPeak = ms.max;
      var wot = thr ? (stats(thr) && stats(thr).max >= 80) : null;
      add("info", "Peak intake pressure " + Math.round(ms.max) + " kPa (" + f1(ms.max * 0.145038) + " psi)" + (ms.min < 10 ? ", which looks like a gauge boost reading" : ""),
        wot === false ? "No full-throttle pull in this log, so the peak says little about boost. Compare only with logs that include a similar pull." : "Compare with later logs that include a similar full-throttle pull. A falling peak suggests a leak or turbo issue.");
    }
    var flags = 0; finds.forEach(function (f) { if (f.level === "concern") flags += 2; else if (f.level === "watch") flags += 1; });
    sum.flags = flags;
    sum.concerns = finds.filter(function (f) { return f.level === "concern"; }).length;
    sum.watches = finds.filter(function (f) { return f.level === "watch"; }).length;
    if (!finds.length) add("info", "No checks could run", "Map at least coolant, fuel trim, voltage or RPM channels to get findings.");
    return { finds: finds, sum: sum };
  }

  /* demo drive */
  function demoDataset() {
    var seed = 12345;
    function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296 - 0.5; }
    var key = [[0,0],[80,0],[100,30],[140,50],[160,20],[175,0],[215,0],[245,45],[290,55],[320,30],[340,0],[380,0],[420,70],[470,100],[640,112],[660,150],[690,115],[800,110],[830,155],[860,112],[1000,105],[1060,40],[1100,0],[1200,0]];
    var N = 1201, t = [], o = { coolant: [], rpm: [], speed: [], throttle: [], load: [], maf: [], map: [], stft: [], ltft: [], volt: [], iat: [] };
    function spd(x) { for (var i = 1; i < key.length; i++) if (x <= key[i][0]) { var a = key[i - 1], b = key[i], f = (x - a[0]) / (b[0] - a[0]); return a[1] + (b[1] - a[1]) * f; } return 0; }
    for (var s = 0; s < N; s++) {
      t.push(s);
      var v = spd(s), acc = spd(s + 1) - v;
      var thr = v < 0.5 ? 0 : Math.max(0, Math.min(100, 8 + v * 0.18 + acc * 7));
      var rpm = v < 0.5 ? 760 + rnd() * 40 : 1100 + v * 17 + acc * 40 + rnd() * 40;
      var load = 18 + thr * 0.6 + rnd() * 2;
      var boost = thr > 55 ? (thr - 55) * 2.2 : 0;
      o.speed.push(v + rnd() * 0.4);
      o.rpm.push(rpm);
      o.throttle.push(thr + rnd());
      o.load.push(load);
      o.maf.push(2.6 + (rpm * load) / 3200 + rnd() * 0.3);
      o.map.push(34 + load * 0.55 + boost + rnd() * 2);
      o.coolant.push(21 + (89 - 21) * (1 - Math.exp(-s / 190)) + rnd() * 0.6);
      o.iat.push(26 + 12 * (1 - Math.exp(-s / 260)) + rnd() * 0.5);
      o.stft.push(rnd() * 6 + (v < 0.5 ? 1.5 : 0));
      o.ltft.push(3.5 + rnd() * 0.8 + (v < 0.5 ? 2.5 : 0));
      o.volt.push(s < 3 ? 12.2 : 14.1 + rnd() * 0.25);
    }
    var cols = ["Coolant Temp (C)", "Engine RPM (rpm)", "Vehicle Speed (km/h)", "Throttle Position (%)", "Engine Load (%)", "MAF (g/s)", "Intake Manifold Pressure (kPa)", "Short Term Fuel Trim B1 (%)", "Long Term Fuel Trim B1 (%)", "Control Module Voltage (V)", "Intake Air Temp (C)"];
    var keys = ["coolant", "rpm", "speed", "throttle", "load", "maf", "map", "stft", "ltft", "volt", "iat"];
    var ch = {}, units = {};
    keys.forEach(function (k, i) { ch[cols[i]] = o[k]; var m = /\(([^)]*)\)\s*$/.exec(cols[i]); units[cols[i]] = m ? m[1] : ""; });
    return { t: t, ch: ch, cols: cols, units: units, name: "Demo drive", demo: true };
  }

  /* data lab: UI */
  function fmtT(sec) { sec = Math.max(0, Math.round(sec)); var m = Math.floor(sec / 60), s = sec % 60; return m + ":" + String(s).padStart(2, "0"); }
  function niceVal(k, v) {
    if (!isNum(v)) return "-";
    if (k === "rpm" || k === "map") return String(Math.round(v));
    return f1(v);
  }
  function roleLabel(k) { for (var i = 0; i < ROLES.length; i++) if (ROLES[i].k === k) return ROLES[i].label; return k; }
  function roleUnit(k, units) {
    return { coolant: units.tF ? "°F" : "°C", iat: units.tF ? "°F" : "°C", rpm: "rpm", speed: units.mph ? "mph" : (units.mps ? "m/s" : "km/h"), load: "%", throttle: "%", maf: "g/s", map: units.mapU, stft: "%", ltft: "%", volt: "V" }[k] || "";
  }
  function renderLab() {
    var body = $("labBody");
    if (!lab.ds) { body.hidden = true; return; }
    body.hidden = false;
    $("demoNote").hidden = !lab.ds.demo;
    $("saveRun").disabled = !!lab.ds.demo;
    var opts = '<option value="">None</option>' + lab.ds.cols.map(function (c) { return '<option value="' + esc(c) + '">' + esc(c) + "</option>"; }).join("");
    $("mapGrid").innerHTML = ROLES.map(function (r) {
      return '<div class="field"><label for="m-' + r.k + '">' + esc(r.label) + '</label><select id="m-' + r.k + '" data-map="' + r.k + '">' + opts + "</select></div>";
    }).join("");
    ROLES.forEach(function (r) { $("m-" + r.k).value = lab.map[r.k] || ""; });
    lab.units = unitInfo(lab.ds, lab.map);
    lab.res = analyze(lab.ds, lab.map, lab.units);
    $("finds").innerHTML = lab.res.finds.map(function (f) {
      return '<li><span class="pill ' + f.level + '">' + ({ ok: "Good", watch: "Watch", concern: "Concern", info: "Note" })[f.level] + "</span><b>" + esc(f.title) + "</b>" + (f.detail ? '<span class="d">' + esc(f.detail) + "</span>" : "") + "</li>";
    }).join("");
    var rows = [];
    ROLES.forEach(function (r) {
      var c = lab.map[r.k]; if (!c) return;
      var conv = null;
      if ((r.k === "coolant" || r.k === "iat") && lab.units.tF) conv = function (v) { return (v - 32) * 5 / 9; };
      var arr = lab.ds.ch[c]; if (conv) arr = arr.map(function (v) { return isNum(v) ? conv(v) : NaN; });
      var st = stats(arr); if (!st) return;
      var u = (r.k === "coolant" || r.k === "iat") ? "°C" : roleUnit(r.k, lab.units);
      rows.push("<tr><td>" + esc(r.label) + "<small>" + esc(c) + '</small></td><td class="num">' + niceVal(r.k, st.min) + " " + u + '</td><td class="num">' + niceVal(r.k, st.mean) + " " + u + '</td><td class="num">' + niceVal(r.k, st.max) + " " + u + '</td><td class="num">' + niceVal(r.k, st.p5) + " to " + niceVal(r.k, st.p95) + "</td></tr>");
    });
    $("statBody").innerHTML = rows.join("") || '<tr><td colspan="5" class="empty">Map some channels above.</td></tr>';
    var mapped = ROLES.filter(function (r) { return lab.map[r.k]; });
    var defaults = { coolant: 1, rpm: 1, speed: 1, map: 1, stft: 1, ltft: 1, volt: 1 };
    mapped.forEach(function (r) { if (lab.show[r.k] === undefined) lab.show[r.k] = !!defaults[r.k]; });
    $("toggles").innerHTML = mapped.map(function (r) {
      return '<label><input type="checkbox" data-show="' + r.k + '"' + (lab.show[r.k] ? " checked" : "") + "> " + esc(r.label) + "</label>";
    }).join("");
    renderCharts();
    $("labStatus").textContent = (lab.ds.demo ? "Demo drive" : lab.ds.name) + ": " + fmt(lab.ds.t.length) + " samples over " + f1((lab.ds.t[lab.ds.t.length - 1] - lab.ds.t[0]) / 60) + " minutes, " + lab.ds.cols.length + " channels found.";
  }
  var CW = 760, CH = 112, ML = 52, MR = 10, MT = 8, MB = 20;
  function minOf(a) { var m = Infinity; for (var i = 0; i < a.length; i++) if (a[i] < m) m = a[i]; return m; }
  function maxOf(a) { var m = -Infinity; for (var i = 0; i < a.length; i++) if (a[i] > m) m = a[i]; return m; }
  function chartSVG(k, t, arr) {
    var vals = arr.filter(isNum);
    if (!vals.length) return "";
    var lo = minOf(vals), hi = maxOf(vals);
    if (hi - lo < 1e-9) { lo -= 1; hi += 1; }
    var pad = (hi - lo) * 0.06; lo -= pad; hi += pad;
    var t0 = t[0], t1 = t[t.length - 1], tw = Math.max(t1 - t0, 1e-9);
    var pw = CW - ML - MR, ph = CH - MT - MB;
    function X(x) { return ML + (x - t0) / tw * pw; }
    function Y(y) { return MT + (1 - (y - lo) / (hi - lo)) * ph; }
    var d = [], n = t.length, B = Math.floor(pw);
    if (n <= B * 2) { for (var i = 0; i < n; i++) if (isNum(arr[i])) d.push((d.length ? "L" : "M") + X(t[i]).toFixed(1) + " " + Y(arr[i]).toFixed(1)); }
    else {
      var per = n / B;
      for (var b = 0; b < B; b++) {
        var a = Math.floor(b * per), z = Math.min(n, Math.floor((b + 1) * per)), mn = null, mx = null, imn = 0, imx = 0;
        for (var j = a; j < z; j++) { if (!isNum(arr[j])) continue; if (mn === null || arr[j] < mn) { mn = arr[j]; imn = j; } if (mx === null || arr[j] > mx) { mx = arr[j]; imx = j; } }
        if (mn === null) continue;
        var first = imn < imx ? [imn, mn] : [imx, mx], second = imn < imx ? [imx, mx] : [imn, mn];
        d.push((d.length ? "L" : "M") + X(t[first[0]]).toFixed(1) + " " + Y(first[1]).toFixed(1));
        if (first[0] !== second[0]) d.push("L" + X(t[second[0]]).toFixed(1) + " " + Y(second[1]).toFixed(1));
      }
    }
    var grid = "", ylab = "";
    [lo + pad, (lo + hi) / 2, hi - pad].forEach(function (v) { grid += '<line class="grid" x1="' + ML + '" x2="' + (CW - MR) + '" y1="' + Y(v).toFixed(1) + '" y2="' + Y(v).toFixed(1) + '"/>'; ylab += '<text x="' + (ML - 6) + '" y="' + (Y(v) + 4).toFixed(1) + '" text-anchor="end">' + niceVal(k, v) + "</text>"; });
    var xl = "";
    var nq = CW < 500 ? 2 : 4;
    for (var q = 0; q <= nq; q++) { var tv = t0 + tw * q / nq; xl += '<text x="' + X(tv).toFixed(1) + '" y="' + (CH - 5) + '" text-anchor="' + (q === 0 ? "start" : (q === nq ? "end" : "middle")) + '">' + fmtT(tv - t0) + "</text>"; }
    return '<svg viewBox="0 0 ' + CW + " " + CH + '" role="img" aria-label="' + esc(roleLabel(k)) + ' over time, from ' + niceVal(k, minOf(vals)) + " to " + niceVal(k, maxOf(vals)) + '">' + grid + ylab + xl + '<path class="trace" d="' + d.join("") + '"/><line class="cur" x1="0" x2="0" y1="' + MT + '" y2="' + (CH - MB) + '"/></svg>';
  }
  function renderCharts() {
    var out = [];
    CW = Math.max(320, Math.min(760, ($("charts").clientWidth || 760) - 22));
    ROLES.forEach(function (r) {
      if (!lab.map[r.k] || !lab.show[r.k]) return;
      var arr = lab.ds.ch[lab.map[r.k]];
      if ((r.k === "coolant" || r.k === "iat") && lab.units.tF) arr = arr.map(function (v) { return isNum(v) ? (v - 32) * 5 / 9 : NaN; });
      var u = (r.k === "coolant" || r.k === "iat") ? "°C" : roleUnit(r.k, lab.units);
      out.push('<div class="chart" data-role="' + r.k + '"><div class="chead"><span class="nm">' + esc(r.label) + " (" + esc(u) + ')</span><span class="cv">hover or touch to read</span></div>' + chartSVG(r.k, lab.ds.t, arr) + "</div>");
    });
    $("charts").innerHTML = out.join("") || '<p class="empty">Turn on a channel above to chart it.</p>';
  }
  function cursorAt(clientX, el) {
    var svg = el.querySelector("svg"); if (!svg || !lab.ds) return;
    var rect = svg.getBoundingClientRect(), xv = (clientX - rect.left) / rect.width * CW;
    var frac = Math.max(0, Math.min(1, (xv - ML) / (CW - ML - MR)));
    var t = lab.ds.t, t0 = t[0], t1 = t[t.length - 1], target = t0 + frac * (t1 - t0);
    var lo = 0, hi = t.length - 1;
    while (lo < hi) { var mid = (lo + hi) >> 1; if (t[mid] < target) lo = mid + 1; else hi = mid; }
    var idx = lo, x = ML + (t[idx] - t0) / Math.max(t1 - t0, 1e-9) * (CW - ML - MR);
    document.querySelectorAll("#charts .chart").forEach(function (c) {
      var role = c.getAttribute("data-role"), cur = c.querySelector(".cur"), cv = c.querySelector(".cv");
      if (cur) { cur.setAttribute("x1", x); cur.setAttribute("x2", x); cur.style.opacity = 1; }
      var arr = lab.ds.ch[lab.map[role]], v = arr[idx];
      if ((role === "coolant" || role === "iat") && lab.units.tF && isNum(v)) v = (v - 32) * 5 / 9;
      if (cv) cv.textContent = fmtT(t[idx] - t0) + "  " + niceVal(role, v);
    });
  }
  function clearCursor() {
    document.querySelectorAll("#charts .chart").forEach(function (c) { var cur = c.querySelector(".cur"); if (cur) cur.style.opacity = 0; var cv = c.querySelector(".cv"); if (cv) cv.textContent = "hover or touch to read"; });
  }
  function loadDataset(ds, name) {
    ds.name = name || ds.name || "log";
    lab.ds = ds; lab.map = autoMap(ds.cols); lab.show = {};
    renderLab();
  }
  function renderRuns() {
    renderDrift();
    var list = state.runs.slice().sort(function (a, b) { return a.date < b.date ? 1 : (a.date > b.date ? -1 : 0); });
    if (!list.length) { $("runBody").innerHTML = '<tr><td colspan="11" class="empty">No saved runs. Load a log, then save it to start a trend.</td></tr>'; return; }
    $("runBody").innerHTML = list.map(function (r) {
      function c(v, d) { return isNum(v) ? (d === 0 ? Math.round(v) : f1(v)) : "-"; }
      return '<tr><td class="num">' + esc(r.date) + '</td><td class="num">' + (isNum(r.miles) ? fmt(r.miles) : "-") + '</td><td class="num">' + c(r.dur / 60) + '</td><td class="num">' + c(r.coolMax) + '</td><td class="num">' + c(r.warmMin) + '</td><td class="num">' + c(r.ltft) + '</td><td class="num">' + c(r.stft) + '</td><td class="num">' + c(r.volt) + '</td><td class="num">' + c(r.idleRpm, 0) + '</td><td class="num">' + (isNum(r.flags) ? r.flags : "-") + "</td><td>" + delBtn("run", r.id) + "</td></tr>";
    }).join("");
  }

  /* ---------- drift across saved runs ---------- */
  var DRIFT = [
    { k: "ltft", label: "Long-term fuel trim", u: "%", judge: function (c, b) { var d = c - b; return Math.abs(d) >= 5 ? { level: Math.abs(d) >= 10 ? "concern" : "watch", title: "Fuel trim has moved " + (d > 0 ? "+" : "") + f1(d) + " points from your baseline", detail: d > 0 ? "The engine is asking for more fuel than it used to. Check for new intake, vacuum or PCV leaks and a dirty air-flow sensor before it sets P0171." : "The engine is asking for less fuel than it used to. Look at the purge valve, injectors and fuel pressure before it sets P0172." } : null; } },
    { k: "volt", label: "Running voltage", u: "V", judge: function (c, b) { return b - c >= 0.4 ? { level: "watch", title: "Running voltage is " + f1(b - c) + " V below your baseline", detail: "A steady decline over several runs can mean a tiring alternator or battery. Smart charging also varies voltage, so confirm with a charging-system test." } : null; } },
    { k: "idleRpm", label: "Warm idle", u: "rpm", r: 0, judge: function (c, b) { return Math.abs(c - b) >= 100 ? { level: "watch", title: "Warm idle has shifted " + Math.round(c - b) + " rpm from your baseline", detail: "The computer may be compensating for an intake leak, a dirty throttle body or a load such as A/C. Compare runs with the A/C in the same state." } : null; } },
    { k: "idleSd", label: "Idle spread", u: "rpm", r: 0, judge: function (c, b) { return c >= 40 && c >= b * 2 ? { level: "watch", title: "Idle is about " + f1(c / Math.max(b, 1)) + " times less steady than your baseline", detail: "A new roughness at idle is an early sign of a misfire, a worn coil or plug, or a vacuum leak." } : null; } },
    { k: "warmMin", label: "Warm-up time", u: "min", judge: function (c, b) { return c - b >= 3 && c >= b * 1.5 ? { level: "watch", title: "Warm-up took " + f1(c - b) + " min longer than your baseline", detail: "If the weather was similar, a thermostat that is sticking open is the usual cause. Poor cabin heat is the matching symptom." } : null; } },
    { k: "coolMid", label: "Settled coolant temp", u: "°C", judge: function (c, b) { var d = c - b; if (d <= -5) return { level: "watch", title: "Engine settles " + f1(-d) + " °C cooler than your baseline", detail: "That usually means a thermostat stuck partly open, which hurts fuel economy and heat output." }; if (d >= 6) return { level: "concern", title: "Engine settles " + f1(d) + " °C hotter than your baseline", detail: "Check the coolant level when cold, look for leaks, and watch the fan. Rising temperature over runs should not wait." }; return null; } },
    { k: "mafIdle", label: "Idle air flow", u: "g/s", judge: function (c, b) { var r = (c - b) / Math.max(b, 0.1); return Math.abs(r) >= 0.2 ? { level: "watch", title: "Idle air flow reads " + Math.round(Math.abs(r) * 100) + " % " + (r > 0 ? "higher" : "lower") + " than your baseline", detail: r < 0 ? "A reading that falls over time fits a contaminated air-flow sensor or an unmetered air leak after the sensor." : "Extra idle airflow can come from an added load such as A/C or a fault the computer is compensating for." } : null; } }
  ];
  function median(a) { var s = a.slice().sort(function (x, y) { return x - y; }), m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
  function runsChrono() { return state.runs.map(function (r, i) { return [r, i]; }).sort(function (a, b) { return a[0].date < b[0].date ? -1 : (a[0].date > b[0].date ? 1 : a[1] - b[1]); }).map(function (x) { return x[0]; }); }
  function computeDrift() {
    var runs = runsChrono(), out = [], metrics = [];
    DRIFT.forEach(function (m) {
      var pts = runs.filter(function (r) { return isNum(r[m.k]); }).map(function (r) { return { date: r.date, miles: r.miles, v: r[m.k] }; });
      if (!pts.length) return;
      var prev = pts.slice(0, -1).slice(-5), base = prev.length >= 2 ? median(prev.map(function (p) { return p.v; })) : null;
      var cur = pts[pts.length - 1].v, f = base != null ? m.judge(cur, base) : null;
      if (f) { f.k = m.k; out.push(f); }
      metrics.push({ m: m, pts: pts, base: base, cur: cur, flag: f });
    });
    return { finds: out, metrics: metrics, runs: runs.length };
  }
  function sparkSVG(x) {
    var W = 240, H = 70, L = 34, R = 8, T = 8, B = 10, vals = x.pts.map(function (p) { return p.v; });
    if (x.base != null) vals.push(x.base);
    var lo = minOf(vals), hi = maxOf(vals); if (hi - lo < 1e-9) { lo -= 1; hi += 1; } var pad = (hi - lo) * 0.15; lo -= pad; hi += pad;
    var n = x.pts.length, fx = function (i) { return n === 1 ? (L + W - R) / 2 : L + i / (n - 1) * (W - L - R); }, fy = function (v) { return T + (1 - (v - lo) / (hi - lo)) * (H - T - B); };
    var r = x.m.r === 0 ? function (v) { return String(Math.round(v)); } : f1;
    var g = '<line class="grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + (H - B) + '" y2="' + (H - B) + '"/>' +
      '<text x="' + (L - 4) + '" y="' + (T + 4) + '" text-anchor="end">' + r(hi - pad) + '</text><text x="' + (L - 4) + '" y="' + (H - B) + '" text-anchor="end">' + r(lo + pad) + "</text>";
    if (x.base != null) g += '<line class="base" x1="' + L + '" x2="' + (W - R) + '" y1="' + fy(x.base).toFixed(1) + '" y2="' + fy(x.base).toFixed(1) + '"/>';
    var d = x.pts.map(function (p, i) { return (i ? "L" : "M") + fx(i).toFixed(1) + " " + fy(p.v).toFixed(1); }).join("");
    var dots = x.pts.map(function (p, i) { return '<circle class="pt' + (i === n - 1 ? " last" : "") + '" r="4" cx="' + fx(i).toFixed(1) + '" cy="' + fy(p.v).toFixed(1) + '"><title>' + esc(p.date) + (isNum(p.miles) ? ", " + fmt(p.miles) + " mi" : "") + ": " + r(p.v) + " " + esc(x.m.u) + "</title></circle>"; }).join("");
    return '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + esc(x.m.label) + " across " + n + ' saved runs">' + g + (n > 1 ? '<path class="trace" d="' + d + '"/>' : "") + dots + "</svg>";
  }
  function renderDrift() {
    var dr = computeDrift();
    if (dr.runs < 3) { $("driftFinds").innerHTML = '<li><span class="pill info">Note</span><b>' + (3 - dr.runs) + " more saved run" + (3 - dr.runs === 1 ? "" : "s") + " needed for a baseline</b><span class=\"d\">Log a similar drive every couple of weeks: cold start, about 15 minutes, some idle once warm.</span></li>"; }
    else if (!dr.finds.length) $("driftFinds").innerHTML = '<li><span class="pill ok">Good</span><b>No meaningful drift from your baseline</b><span class="d">The latest run sits close to your earlier runs on every tracked measure.</span></li>';
    else $("driftFinds").innerHTML = dr.finds.map(function (f) { return '<li><span class="pill ' + f.level + '">' + (f.level === "concern" ? "Concern" : "Watch") + "</span><b>" + esc(f.title) + '</b><span class="d">' + esc(f.detail) + "</span></li>"; }).join("");
    $("sparks").innerHTML = dr.metrics.filter(function (x) { return x.pts.length >= 2; }).map(function (x) {
      var r = x.m.r === 0 ? function (v) { return String(Math.round(v)); } : f1;
      return '<div class="chart"><h4>' + esc(x.m.label) + '</h4><div class="meta">latest ' + r(x.cur) + " " + esc(x.m.u) + (x.base != null ? " · baseline " + r(x.base) : "") + "</div>" + sparkSVG(x) + "</div>";
    }).join("");
    return dr;
  }

  /* ---------- health ---------- */
  function latestRun() { var c = runsChrono(); return c.length ? c[c.length - 1] : null; }
  function computeHealth() {
    var comps = [], actions = [];
    var ms = [], over = 0;
    ITEMS.forEach(function (it) {
      var s = statusFor(it);
      if (s.cls === "none") {
        if (dueWithin(it, 0, 0)) actions.push({ sev: it.key === "timingbelt" ? 88 : 35, text: "No record of " + it.name.toLowerCase() + ". " + (function (m) { m = m.replace(/^No record, and /, ""); return m.charAt(0).toUpperCase() + m.slice(1); })(dueWithin(it, 0, 0)) + ". " + (it.key === "timingbelt" ? "On this engine a snapped belt usually ruins it. Find proof it was done, or ask a Volvo shop to check." : "Find a receipt, or treat it as due."), jump: "tab:records" });
        return;
      }
      ms.push(s.cls === "ok" ? 100 : (s.cls === "soon" ? 65 : 25));
      if (s.cls === "over") actions.push({ sev: 90, text: it.name + " is overdue" + (s.detail ? " (" + s.detail + ")" : ""), jump: "tab:records" });
      else if (s.cls === "soon") actions.push({ sev: 50, text: it.name + " is due soon" + (s.detail ? " (" + s.detail + ")" : ""), jump: "tab:records" });
    });
    if (ms.length) comps.push({ k: "Service status", w: 30, v: ms.reduce(function (a, b) { return a + b; }, 0) / ms.length, n: ms.length + " items logged" });
    var rated = PARTS.filter(function (p) { return ratingOf(p.id) > 0; });
    if (rated.length) {
      comps.push({ k: "Part condition", w: 30, v: rated.reduce(function (a, p) { return a + (ratingOf(p.id) - 1) / 4 * 100; }, 0) / rated.length, n: rated.length + " parts rated" });
      rated.forEach(function (p) {
        var r = ratingOf(p.id), note = state.rate[p.id].n;
        if (r === 1) actions.push({ sev: 95, text: p.name + " is rated failed" + (note ? ": " + note : ""), jump: "part:" + p.id });
        else if (r === 2) actions.push({ sev: 70, text: p.name + " is rated poor" + (note ? ": " + note : ""), jump: "part:" + p.id });
      });
    }
    if (state.codes.length) {
      var act = state.codes.filter(function (c) { return c.status === "active"; });
      comps.push({ k: "Trouble codes", w: 20, v: Math.max(0, 100 - act.length * 20), n: act.length + " active" });
      act.forEach(function (c) { var k = CODES[String(c.code).toUpperCase()]; actions.push({ sev: k && k.u === "now" ? 92 : 85, text: "Active code " + c.code + ": " + codeTitle(c.code), jump: "tab:diag" }); });
    }
    var o = oilRate();
    if (o) {
      var v = o.rate <= 0.25 ? 100 : (o.rate <= 0.5 ? 75 : (o.rate <= 1 ? 45 : 20));
      comps.push({ k: "Oil use", w: 10, v: v, n: o.rate.toFixed(2) + " qt per 1,000 mi" });
      if (o.rate > 0.5) actions.push({ sev: 65, text: "Oil use is " + o.rate.toFixed(2) + " qt per 1,000 miles. Keep logging and ask Volvo about a consumption test.", jump: "tab:records" });
    }
    var run = latestRun();
    if (run) {
      var dfs = computeDrift().finds, dc = dfs.filter(function (f) { return f.level === "concern"; }).length, dw = dfs.length - dc;
      comps.push({ k: "Latest run and trend", w: 10, v: Math.max(0, 100 - (run.concerns || 0) * 25 - (run.watches || 0) * 10 - dc * 20 - dw * 8), n: "from " + run.date + (dfs.length ? ", " + dfs.length + " drift flag" + (dfs.length === 1 ? "" : "s") : "") });
      (run.titles || []).forEach(function (t) { actions.push({ sev: t.level === "concern" ? 80 : 45, text: "Data lab " + (t.level === "concern" ? "concern" : "watch item") + ": " + t.title, jump: "tab:lab" }); });
      computeDrift().finds.forEach(function (f) { actions.push({ sev: f.level === "concern" ? 85 : 55, text: "Trend: " + f.title, jump: "tab:lab" }); });
    }
    recallActions(actions);
    if (state.lastScan && state.lastScan.mil) actions.push({ sev: 75, text: "The check-engine light was on at the last V60 Link check (" + state.lastScan.date + "). Look up each code in Diagnose.", jump: "tab:diag" });
    var unrated = PARTS.length - rated.length;
    if (unrated > 0) actions.push({ sev: 10, text: unrated + " of " + PARTS.length + " parts are not rated yet. Walk the bay and rate what you can see.", jump: "tab:bay" });
    if (state.odo == null) actions.push({ sev: 30, text: "Enter your odometer so service intervals can be checked.", jump: "tab:records" });
    var wsum = 0, tot = 0;
    comps.forEach(function (c) { wsum += c.w; tot += c.w * c.v; });
    MODS.forEach(function (m) { if (m.actions) try { m.actions(API, actions); } catch (e) {} });
    actions.sort(function (a, b) { return b.sev - a.sev; });
    return { score: wsum ? Math.round(tot / wsum) : null, comps: comps, used: comps.length, actions: actions };
  }
  function renderHealth() {
    var h = computeHealth();
    $("hudScore").textContent = h.score == null ? "--" : String(h.score);
    var gb = document.querySelector(".gauge"); if (gb) { gb.className = "gauge" + (h.score == null ? "" : (h.score >= 75 ? " ok" : (h.score >= 50 ? " mid" : " low"))); $("gFill").style.strokeDasharray = (h.score == null ? 0 : h.score) + " 100"; }
    var sc = $("scoreCard");
    if (h.score == null) sc.innerHTML = '<div><div class="big">--</div><div class="status">No data yet</div></div><p class="lede">Log a service, rate a few parts or add a code and a score appears here.</p>';
    else sc.innerHTML = '<div><div class="big">' + h.score + '</div><div class="status">out of 100, from ' + h.used + " of 5 inputs</div></div><div class=\"bars\">" +
      h.comps.map(function (c) { var cl = c.v < 50 ? "low" : (c.v < 75 ? "mid" : ""); return '<div class="bar ' + cl + '"><span>' + esc(c.k) + '</span><span class="tr"><span class="fl" style="display:block;width:' + Math.round(c.v) + '%"></span></span><span>' + Math.round(c.v) + "</span></div>"; }).join("") + "</div>";
    var top = h.actions.slice(0, 10);
    $("actions").innerHTML = top.length ? top.map(function (a) {
      var cl = a.sev >= 85 ? "bad" : (a.sev >= 45 ? "soon" : "none");
      return '<li><span class="pill ' + cl + '">' + (a.sev >= 85 ? "Act" : (a.sev >= 45 ? "Soon" : "Later")) + '</span><span class="tx">' + esc(a.text) + '</span><button type="button" class="quiet" data-jump="' + a.jump + '">Open</button></li>';
    }).join("") : '<li><span class="tx">Nothing to fix yet. Enter some records and this list ranks them.</span></li>';
  }

  /* ask claude */
  var sampleFn = null, askCtl = null;
  function ctxJSON() {
    var due = ITEMS.map(function (it) { var s = statusFor(it), l = lastFor(it.key); return { item: it.name, status: s.label, detail: s.detail, lastMiles: l ? l.miles : null, lastDate: l ? l.date : null }; });
    var lowParts = PARTS.filter(function (p) { var r = ratingOf(p.id); return r > 0 && r <= 3; }).map(function (p) { return { part: p.name, system: sysName(p.sys), rating: ratingOf(p.id), note: state.rate[p.id].n }; });
    var codes = state.codes.filter(function (c) { return c.status !== "resolved"; }).map(function (c) { return { code: c.code, state: c.status, meaning: codeTitle(c.code), note: c.note || "" }; });
    var o = oilRate(), run = latestRun();
    return JSON.stringify({ odometerMiles: state.odo, service: due, partsRatedFairOrWorse: lowParts, codes: codes, oilQuartsPer1000mi: o ? Math.round(o.rate * 100) / 100 : null, latestRun: run ? { date: run.date, coolMaxC: run.coolMax, warmUpMin: run.warmMin, ltftPct: run.ltft, stftPct: run.stft, volts: run.volt, idleRpm: run.idleRpm, findings: run.titles } : null, ratingScale: "1 failed, 2 poor, 3 fair, 4 good, 5 new" });
  }
  function askClaude() {
    var q = $("askQ").value.trim();
    if (!q || !sampleFn) return;
    var prompt = "You are helping the owner of a 2016 Volvo V60 T5 (2.0 L turbo Drive-E, front-wheel drive, 8-speed automatic) plan maintenance and diagnosis. Use only the owner data below plus well-established general automotive knowledge. Do not invent Volvo specifications or intervals; when unsure, say so and suggest checking Volvo's dealer information or the owner's manual. Separate what can be done safely at home from what needs a shop. Never recommend engine tuning or ECU flashing. Be practical and keep the answer under 350 words, in short plain paragraphs without tables.\n\nOWNER DATA (JSON):\n" + ctxJSON() + "\n\nQUESTION:\n" + q;
    askCtl = new AbortController();
    $("askGo").disabled = true; $("askStop").hidden = false;
    $("askOut").textContent = "Thinking...";
    $("askStatus").textContent = "";
    sampleFn(prompt, { signal: askCtl.signal, cache: false, onText: function (u) { $("askOut").textContent = u.text; } }).then(function (r) {
      if (r.truncated) $("askStatus").textContent = "The answer was cut short. Ask for less at a time.";
    }).catch(function (e) {
      if (e && e.text) $("askOut").textContent = e.text; else $("askOut").textContent = "No answer.";
      var m = { not_granted: "Claude access was not allowed for this page.", rate_limited: "Too many requests right now. Try again later.", session_expired: "Sign in again to continue.", upstream_error: "The request was interrupted. Try again.", cancelled: "Stopped." };
      $("askStatus").textContent = (e && m[e.code]) || "That did not work. Try again.";
      if (e && (e.code === "not_granted" || e.code === "sampling_disabled")) $("askBox").hidden = true;
    }).then(function () { $("askGo").disabled = false; $("askStop").hidden = true; });
  }

  /* ---------- records forms etc ---------- */
  /* ================= ACADEMY ================= */
  /* Car-specific facts in one place so they can be corrected without touching missions. v: true = not yet confirmed for this exact car. */
  var FACT = {
    hood: { t: "The hood release handle is under the left side of the dashboard. Turn it about 20 to 25 degrees clockwise and the hood pops up slightly. Then, at the front of the car, push the catch near the front right edge of the hood to the left and lift." },
    oilcheck: { t: "This engine has no dipstick. Oil level is read electronically in the instrument cluster (see the Check your oil level mission). Dipsticks are only on the five- and six-cylinder V60s." },
    placard: { t: "The recommended pressures are on the tire label on the driver's side door pillar, the post you see when the front door is open. Use those numbers, not the maximum printed on the tire. Your Premier's standard 215/50R17 tires take 38 psi front and rear, cold, per Volvo's manual." },
    obd: { t: "The OBD-II port is a 16-pin socket under the dashboard on the driver's side. Look up under the dash near the hood release with a flashlight.", v: true },
    adapter: { t: "Buy a Bluetooth LE adapter, because iPhones cannot use classic-Bluetooth adapters. The OBDLink CX (about $80) works with V60 Link and most apps. The Veepeak OBDCheck BLE+ (about $42) is a cheaper option for scanner apps. The Unlocks tab compares them." },
    bfluid: { t: "Volvo calls for brake fluid every other year, or every year with hard, frequent braking." }
  };
  function factHTML(k) { var f = FACT[k]; return esc(f.t) + (f.v ? ' <span class="tag verify">verify</span>' : ""); }

  var RANKS = [[0, "Passenger"], [120, "Curious owner"], [350, "Driveway apprentice"], [700, "Weekend wrench"], [1100, "Shade-tree tech"], [1600, "Garage pro"]];

  /* mission: id, type (learn | field | log), title, xp, min (minutes), need, body [paras], safety, steps [text or {t,fact}], see, quiz [{q,o:[...],a,why}], parts (part ids an outcome rates), input (special form), go (jump spec) */
  var CHAPTERS = [
    { id: "c1", title: "Meet your car", badge: "First look", blurb: "Open the hood, learn what you are looking at and what is safe to touch. No tools.", missions: [
      { id: "m-sys", type: "learn", title: "How a car stays alive", xp: 30, min: 4,
        body: ["Every car does the same four jobs. The engine turns fuel and air into motion. Fluids keep it cool and lubricated. Brakes, tires, steering and suspension keep you in control. The electrical system starts it, runs the computers and lights, and recharges itself while you drive.",
          "Your V60 T5 has a 2.0-liter, four-cylinder engine with a turbocharger, a fan driven by exhaust gas that packs extra air into the engine so a small engine makes big-engine power. It drives the front wheels through an 8-speed automatic transmission.",
          "Most car care is noticing small changes early. A fluid getting low, a new noise, a warning light. This campaign trains you to notice."],
        quiz: [{ q: "What does the turbocharger do?", o: ["Cools the engine", "Pushes extra air into the engine for more power", "Charges the battery", "Filters the fuel"], a: 1, why: "Exhaust spins a turbine that drives a compressor, which packs more air into the cylinders. More air plus more fuel equals more power." },
          { q: "Which wheels does your V60 T5 drive?", o: ["Front", "Rear", "All four"], a: 0, why: "The T5 Drive-E V60 is front-wheel drive. All-wheel-drive V60s used other engines." },
          { q: "What is most of car care, for an owner?", o: ["Rebuilding engines", "Noticing small changes early", "Tuning for power"], a: 1, why: "Catching a low fluid, a new noise or a light early is what prevents expensive failures." }] },
      { id: "m-safe", type: "learn", title: "Safety rules before you touch anything", xp: 30, min: 4,
        body: ["Hot parts: the exhaust, the turbo and the radiator can burn you for an hour after driving. Do checks with the engine cold unless a mission says otherwise.",
          "Never open the coolant cap on a hot engine. The system is under pressure and can spray scalding coolant.",
          "The electric cooling fan can switch on by itself even with the engine off. Keep fingers, sleeves and hair away from it.",
          "With the engine running, stay clear of the belt at the side of the engine. Nothing in this campaign needs your hands near a running engine.",
          "Never get under a car held up only by a jack. Jack stands or ramps, on flat ground, every time. This campaign does not send you under the car."],
        quiz: [{ q: "You just got home from a drive and want to check coolant. What do you do?", o: ["Open the cap carefully", "Wait until the engine is cold", "Add water quickly"], a: 1, why: "The cooling system is pressurized when hot. Opening it can spray scalding coolant." },
          { q: "The engine is off. Is it safe to put your hand near the cooling fan?", o: ["Yes, the engine is off", "No, it can start by itself"], a: 1, why: "Electric fans can run after shutdown to cool the engine." },
          { q: "What holds a car up safely while you are under it?", o: ["The jack that lifted it", "Jack stands or ramps on flat ground", "A stack of bricks"], a: 1, why: "Jacks slip and fail. Only stands or ramps rated for the car are safe." }] },
      { id: "m-hood", type: "field", title: "Open the hood", xp: 50, min: 5, need: "The car parked on flat ground, engine off",
        steps: ["Park on flat ground, put it in Park, set the parking brake, turn the engine off.", { fact: "hood" }, "If the hood does not stay up by itself, use the prop rod and seat its tip in the marked hole.", "Close it by lowering it to about a foot above the latch and letting it drop, then press gently to check it latched."],
        see: "The engine under a plastic cover, with caps and tanks around it. You do not need to touch anything yet.",
        safety: "Make sure the hood is fully latched before driving. A hood that flies up blocks your view." },
      { id: "m-five", type: "field", title: "Find the key landmarks", xp: 60, min: 10, need: "Hood open, engine cold, a flashlight helps",
        body: ["Caps and reservoirs are marked with symbols. You are only finding them in this mission, not opening them."],
        steps: ["Oil filler cap: on top of the engine, usually marked with an oil-can symbol.", { fact: "oilcheck" }, "Coolant expansion tank: a translucent plastic tank with MIN and MAX marks.", "Brake fluid reservoir: a small translucent tank near the back of the engine bay on the driver's side, marked with a brake symbol.", "Washer fluid filler: a cap with a windshield-spray symbol.", "Engine air filter box: a large plastic box connected to the intake by a big tube.", "Battery or its jump-start terminals: look for a red plus cover. If you cannot see the battery, it may be under a cover or elsewhere. Note it and move on."],
        see: "Six of the seven landmarks found. It is fine to mark one you could not find." },
      { id: "m-oil", type: "field", title: "Check your oil level", xp: 60, min: 8, need: "Car on level ground", parts: ["oilfilter"], go: "tab:records",
        body: ["Your 2016 V60 T5 has no dipstick. A sensor measures the oil and the car shows it in the instrument cluster. This engine family is known to burn oil in some cars, so this is the most important habit in the whole campaign."],
        steps: ["Park on level ground. The reading is most accurate after about 20 miles of driving, or after the car has sat parked for a few minutes.", "Put the ignition in mode II without starting the engine.", "Roll the thumb wheel on the left steering-wheel stalk until Oil level appears.", "Read the level. If oil is needed, add a little at a time: full synthetic 5W-30 ACEA A5/B5, or Volvo's 0W-20. Match what the last oil change used if you know it.", "Log it in Records under Oil watch, with the odometer and any quarts added. Over months that becomes your consumption rate."],
        see: "A level within range. 'Not available' is not a fault. It means the car needs to be level or settled longer. 'Oil service required' can also mean the oil is overfilled.",
        safety: "Do not overfill. Too much oil can foam and damage the engine. Add a little, wait, and check again." },
      { id: "m-fluids", type: "learn", title: "Name that fluid", xp: 30, min: 4,
        body: ["Fluids tell you a lot. Engine oil is amber when new and darkens to brown or black with use. Coolant is colored, and Volvo coolant is commonly blue-green. Check your tank, and never mix types. Brake fluid is clear to amber and darkens with age. Washer fluid is usually blue.",
          "A puddle under the car has a meaning too. Clear water under the front passenger side on a hot day is usually just air-conditioning condensation, which is normal. Colored or oily drips are not."],
        quiz: [{ q: "A clear, water-like puddle under the front passenger side after running the A/C. Concern?", o: ["Usually normal condensation", "Brake fluid leak, stop driving", "Coolant leak"], a: 0, why: "The A/C dehumidifies cabin air and drains water outside. That is expected." },
          { q: "Brake fluid that looks dark brown suggests...", o: ["It is old and has absorbed water", "It is brand new", "The engine needs oil"], a: 0, why: "Brake fluid darkens as it ages and takes on moisture, which lowers its boiling point." },
          { q: "Your coolant is blue-green. Can you top it up with whatever coolant the gas station sells?", o: ["Yes, coolant is coolant", "No, match the type the car specifies"], a: 1, why: "Mixing coolant types can reduce protection and in some cases form deposits. Use the type in the owner's manual, or distilled water only in an emergency." }] }
    ] },
    { id: "c2", title: "The walkaround", badge: "Eyes on", blurb: "The ten-minute check that catches most problems: tires, lights, fluids, wipers.", missions: [
      { id: "m-tires", type: "learn", title: "Tires 101", xp: 30, min: 5,
        body: ["Tires are the only thing touching the road, so they matter more than anything under the hood for safety.",
          "Pressure: check it cold, before driving. The right numbers are on the vehicle's label, not the 'max pressure' on the tire sidewall.",
          "Tread: the legal minimum in most of the US is 2/32 inch. Grip in rain drops well before that, so many tire experts suggest replacing near 4/32. A US quarter in the groove with Washington's head down is a quick 4/32 test. If you can see the top of his head, plan for tires.",
          "Age: rubber hardens with time and heat even when tread looks fine. The DOT code on the sidewall ends in four digits, week then year. '2419' means week 24 of 2019. Volvo's own manual for your car says to replace tires after 6 years of normal service even if tread remains, and Texas heat is hard on tires."],
        quiz: [{ q: "Where do you find the right tire pressure for your car?", o: ["The maximum printed on the tire", "The vehicle's tire label", "Whatever feels right"], a: 1, why: "The sidewall number is the tire's limit, not the car's recommendation." },
          { q: "A tire's DOT code ends in 1118. When was it made?", o: ["November 2018", "Week 11 of 2018", "January 2011"], a: 1, why: "Four digits: week, then two-digit year." },
          { q: "Why check pressure before driving?", o: ["Tires warm up and read higher after driving", "The gauge only works in the morning", "It does not matter"], a: 0, why: "Air expands as tires heat, so hot readings look higher than the true cold pressure." }] },
      { id: "m-psi", type: "field", title: "Check and record tire pressure", xp: 60, min: 10, need: "A tire pressure gauge (about $5 to $15), tires cold", input: "psi", parts: ["pressure"],
        steps: [{ fact: "placard" }, "Unscrew a valve cap, press the gauge straight on, read it, put the cap back.", "Do all four. Enter the readings below.", "If any tire is low, add air at a gas station and recheck with your own gauge.", "After changing any pressure, calibrate the tire monitor: MY CAR > Settings > Car settings > Tire monitoring > Calibrate tire pressure, then drive at least 10 minutes above 20 mph. Skipping this step can keep the warning light on."],
        see: "All four within about 2 psi of the label. A tire that keeps dropping has a slow leak." },
      { id: "m-tread", type: "field", title: "Tread depth and tire age", xp: 60, min: 10, need: "A US quarter, a flashlight", input: "tread", parts: ["tread", "age"],
        steps: ["Quarter test in three spots across each tire: outer edge, center, inner edge.", "Uneven wear (one edge much more worn) points to alignment or pressure problems. Note it.", "Find the DOT code on each sidewall (it may be on the inner side) and enter the last four digits."],
        see: "Washington's head partly covered on every tire, even wear across the tread, and tires under about six years old." },
      { id: "m-lights", type: "field", title: "Lights check", xp: 40, min: 8, need: "A helper, or park facing a reflective window or garage door", parts: ["lights"],
        steps: ["Headlights low and high beam.", "Turn signals front and rear, both sides. A fast blink usually means a bulb is out.", "Brake lights, including the high center light. Your helper watches while you press the pedal.", "Reverse lights: engine on, foot on the brake, shift to reverse.", "Fog and parking lights if equipped."],
        see: "Every light works. The car may also show a bulb-failure message on the dash." },
      { id: "m-fluidlook", type: "field", title: "Fluid levels, look only", xp: 50, min: 8, need: "Engine cold, hood open, flashlight", parts: ["coolant", "bfluid", "wipers"],
        steps: ["Coolant tank: the level should sit between MIN and MAX. Do not open it.", "Brake fluid reservoir: the level should be between MIN and MAX. If it is low, do not just top it up. Low brake fluid can mean worn pads or a leak, so get it checked.", "Washer fluid: top it up with washer fluid. This is the one you are always allowed to fill.", "Look on the ground under the engine for fresh drips."],
        see: "Coolant and brake fluid between the marks, no fresh drips." },
      { id: "m-wipers", type: "field", title: "Wiper check", xp: 30, min: 4, need: "Washer fluid", parts: ["wipers"],
        steps: ["Spray and wipe. Watch for streaks, skipping or chatter.", "Lift each blade gently and look for cracked or torn rubber.", "Sun and heat age wiper rubber fast. Many owners in hot climates replace blades about once a year."],
        see: "A clean sweep with no streaks." }
    ] },
    { id: "c3", title: "Dashboard and paperwork", badge: "Paper trail", blurb: "Warning lights, recalls, mileage and history. The cheapest way to avoid surprises.", missions: [
      { id: "m-warn", type: "learn", title: "Warning lights decoded", xp: 30, min: 5,
        body: ["Color tells you urgency. Red means stop safely and find out why. Amber or yellow means have it checked soon. Green and blue are information only.",
          "A steady check-engine light means a fault was recorded. Get it read within days. A flashing check-engine light means an active misfire that can overheat and ruin the catalytic converter. Ease off and get it checked right away.",
          "Red oil-pressure or temperature warnings mean pull over and turn the engine off. Driving on can destroy the engine in minutes."],
        quiz: [{ q: "The check-engine light is flashing. What does it most likely mean?", o: ["A loose gas cap", "An active misfire. Reduce load and get it checked now", "Time for an oil change"], a: 1, why: "Flashing is reserved for misfires severe enough to damage the catalytic converter." },
          { q: "A red oil-pressure warning comes on while driving. You should...", o: ["Keep going to the next town", "Pull over safely and turn the engine off", "Turn up the radio"], a: 1, why: "Without oil pressure, engine bearings fail quickly." },
          { q: "An amber tire-pressure warning means...", o: ["Check tire pressures soon", "The engine is overheating", "Nothing, ignore it"], a: 0, why: "Amber means attention needed soon. A tire is likely low." }] },
      { id: "m-recall", type: "field", title: "Recall check", xp: 50, min: 5, need: "Your VIN: on the windshield base on the driver's side, the door pillar, your registration or your insurance card", input: "recall",
        steps: ["Find the 17-character VIN.", "Open nhtsa.gov/recalls and enter it. It lists open safety recalls for your exact car.", "Open recalls are repaired free at a Volvo dealer. Call to schedule if any appear."],
        see: "Either no open recalls, or a list to bring to a dealer.", link: ["https://www.nhtsa.gov/recalls", "Open NHTSA recall lookup"] },
      { id: "m-odo", type: "log", title: "Enter your mileage", xp: 20, min: 1, input: "odo",
        body: ["Every interval on this page is calculated from your odometer. Read it from the instrument cluster and enter it."] },
      { id: "m-hist", type: "log", title: "Service history hunt", xp: 50, min: 15, go: "tab:records",
        body: ["Find what has been done to the car: receipts, the glovebox service booklet, emails from shops, or a vehicle history report. Log the last oil change, brake work, spark plugs, coolant and brake fluid in Records. Unknown is a fine answer, and then those items count as due."],
        steps: ["Gather receipts and records.", "Log each item in the Records tab with date and mileage.", "Mark this mission complete when you have logged what you can find."] },
      { id: "m-belt", type: "field", title: "Timing belt detective", xp: 60, min: 15, need: "Hood open, flashlight, your purchase paperwork",
        body: ["Your car was bought as-is from an independent lot near 90,000 miles, so whether the timing belt was ever replaced is unknown. On this engine that is the single most expensive unknown, because a snapped belt usually ruins the engine."],
        steps: ["Look under the hood for a sticker on the timing cover, the strut tower, the radiator support or the underside of the hood. Many shops leave one with a date and mileage when they replace a timing belt.", "Go through every paper from the purchase: the Buyers Guide, any vehicle history report, and receipts left in the glovebox.", "Call any Volvo dealer with your VIN and ask whether a timing belt service shows in Volvo's service history.", "Optionally buy a vehicle history report by VIN. These sometimes list service visits from reporting shops.", "Record what you found in the notes. 'No evidence' is a real answer, and it means you should plan the job."],
        see: "Proof of a belt change with date and mileage, or a clear 'no evidence', which goes straight to the shop visit mission." },
      { id: "m-ppi", type: "log", title: "Book a baseline inspection at a Volvo specialist", xp: 80, min: 10, go: "tab:records",
        body: ["An as-is sale means the dealer promised nothing, so a one-time baseline inspection by an independent Volvo specialist is the fastest way to learn what you actually own. A Volvo-focused shop has Volvo's own diagnostic software, which reads the airbag, ABS and body modules a phone adapter cannot."],
        steps: ["Find an independent Volvo specialist nearby. Check reviews and ask whether they use VIDA.", "Ask for: a full-module scan, the timing belt's condition and history, oil leaks (PCV system, oil filter housing, valve cover), coolant condition, brakes and fluid, tires, suspension bushings, and transmission fluid condition.", "Ask for a written report with photos and a quote for anything urgent.", "Log the results in Records and rate the matching parts in the Bay."],
        see: "A written report, and a short list ranked by safety first, engine-killers second, everything else after." },
      { id: "m-blind", type: "learn", title: "Things owners do not know to check", xp: 40, min: 6,
        body: ["Tire age: tires age out by date, not just tread.",
          "Brake fluid: it absorbs water and is replaced on a time basis, not mileage. It is easy to forget because nothing seems wrong until the brakes get hot.",
          "Battery age: heat shortens battery life. In Texas, three to five years is a common lifespan. Most parts stores test batteries free.",
          "Cabin air filter: a clogged one makes the A/C weak and smelly.",
          "Oil consumption: some engines in this family were known to burn oil. Volvo published an extended warranty for it, covered in the Learn tab. Checking the level between changes is your early warning.",
          "Records: a documented history protects you if a warranty or recall issue comes up, and it helps resale.",
          "Spare tire: many newer cars carry a repair kit instead of a spare. Find out what yours has before you need it.",
          "Timing belt: this engine has a rubber timing belt with a roughly 10-year limit. A 2016 is at that age now. If it snaps, the engine is usually destroyed, which makes it the most expensive thing on this list to ignore."],
        quiz: [{ q: "Why replace brake fluid on a time schedule?", o: ["It evaporates", "It absorbs water, which lowers its boiling point", "It changes color for fun"], a: 1, why: "Water-contaminated fluid can boil under hard braking, which makes the pedal go soft." },
          { q: "Tread looks great but the tires are 9 years old. Fine?", o: ["Yes, tread is all that matters", "No, old rubber hardens and can fail"], a: 1, why: "Age degrades rubber regardless of tread, especially in heat." },
          { q: "Your 2016 has never had its timing belt changed. Why does that matter now?", o: ["It does not, belts last forever", "Belts age out around 10 years, and a snapped belt usually wrecks this engine", "It only affects the radio"], a: 1, why: "Rubber belts age with time as well as miles. On an interference engine the valves and pistons collide if the belt breaks." },
          { q: "What is a free way to check battery health?", o: ["Parts-store battery test", "Lick the terminals", "Wait for it to die"], a: 0, why: "Most auto parts stores test batteries and charging systems free." }] }
    ] },
    { id: "c4", title: "Plug in", badge: "Connected", blurb: "Read the car's own data: codes, readiness and live sensors.", missions: [
      { id: "m-obd", type: "learn", title: "What OBD-II can and cannot tell you", xp: 30, min: 5,
        body: ["Every US car since 1996 has an OBD-II port. Through it, a scanner can read engine and emissions trouble codes, the freeze frame (a snapshot from when a code set), readiness monitors (self-tests used for emissions inspection), and live sensor data such as coolant temperature and fuel trims.",
          "A code is a clue, not a diagnosis. P0171 says the engine is running lean. It does not say which part. That is why this page pairs codes with likely causes and cheapest checks.",
          "A basic OBD-II adapter does not reach airbag, ABS or most body modules on a Volvo. Those use Volvo's own diagnostics."],
        quiz: [{ q: "A scanner shows P0171. What do you know?", o: ["The oxygen sensor is bad", "The engine is running lean. The cause still needs checking", "The car must be scrapped"], a: 1, why: "Codes describe a condition. Vacuum leaks, a dirty air-flow sensor and weak fuel delivery can all cause P0171." },
          { q: "What are readiness monitors?", o: ["Self-tests the computer runs while driving", "Lights on the dashboard", "Tire sensors"], a: 0, why: "Emissions inspections check that these have completed." },
          { q: "Can a basic OBD-II adapter read the airbag system on your Volvo?", o: ["Usually not", "Always"], a: 0, why: "Airbag and ABS modules use manufacturer-specific diagnostics." }] },
      { id: "m-adapter", type: "field", title: "Get an adapter", xp: 40, min: 10, go: "tab:unlocks",
        steps: [{ fact: "adapter" }, "Check the return policy in case it does not connect to your car."],
        see: "An adapter in hand." },
      { id: "m-port", type: "field", title: "Find the OBD port", xp: 30, min: 5, need: "A flashlight",
        steps: [{ fact: "obd" }, "Plug the adapter in. Its light should turn on."], see: "Adapter seated, light on." },
      { id: "m-scan", type: "field", title: "First health check", xp: 80, min: 10, go: "tab:diag",
        steps: ["Ignition on, engine off.", "Run a health check with V60 Link (bmcdoorz94.github.io/V60-Link, opened in Bluefy) or a scanner app.", "Save the report and import it in Diagnose, or type the codes into the code log.", "Look up every code in Diagnose before doing anything about it."],
        see: "Your codes in the code log, or confirmation that there are none." },
      { id: "m-log", type: "field", title: "Record your first baseline drive", xp: 100, min: 25, go: "tab:lab",
        steps: ["Start from a cold engine, ideally first drive of the day.", "Let your phone record live data (coolant, RPM, speed, fuel trims, voltage) with V60 Link or a scanner app.", "Drive about 15 minutes, including a few minutes of warm idle at the end.", "Load the CSV in the Data lab and save it as a run. This becomes your baseline."],
        see: "A saved run in the Data lab. After three runs, drift tracking turns on." }
    ] },
    { id: "c5", title: "First wrench", badge: "First wrench", blurb: "Inspect and replace the easy parts that shops charge the most markup on.", missions: [
      { id: "m-tools", type: "learn", title: "Starter tool kit", xp: 30, min: 5,
        body: ["A sensible first kit: tire pressure gauge, bright flashlight or headlamp, nitrile gloves, shop towels, a funnel, a Torx bit set (Volvo uses Torx fasteners heavily), a small socket set, and a trim-removal tool.",
          "Buy the gauge and flashlight first. Everything else can wait for the first job that needs it."],
        quiz: [{ q: "Which screwdriver bit type shows up most on Volvos?", o: ["Torx (star)", "Phillips", "Flat"], a: 0, why: "Volvo uses Torx fasteners widely, inside and under the hood." },
          { q: "Which two tools should you buy first?", o: ["Tire gauge and flashlight", "Engine hoist and welder"], a: 0, why: "Most checks are about seeing clearly and measuring tire pressure." }] },
      { id: "m-airf", type: "field", title: "Inspect the engine air filter", xp: 70, min: 15, need: "Hood open, engine cold, possibly a Torx or screwdriver", parts: ["airfilter"],
        steps: ["Find the air filter box from Chapter 1.", "Open the clips or screws holding the lid. Note how it comes apart, and take a photo.", "Lift the filter out and hold it up to a light. Some light through the pleats is good. Gray, packed with dirt or debris is due.", "Reseat it exactly as it was and close every clip. A badly sealed lid lets dirt into the turbo.", "Search a video for your exact car first if the box is not obvious."],
        see: "A filter that passes light, or a reason to buy one. They are an inexpensive part." },
      { id: "m-cabin", type: "field", title: "Inspect the cabin air filter", xp: 70, min: 20, need: "A flashlight, a video for your car's exact procedure", parts: ["cabin"],
        steps: ["The cabin filter cleans air coming into the car. On many Volvos of this era it sits behind or under the glovebox. Find a video for a 2016 V60 before starting.", "Remove the access panel, slide the filter out, and note the airflow arrow direction.", "Leaves, dirt or a musty smell mean replace it.", "Install the new one with the arrow pointing the same way."],
        see: "A clean filter installed with the arrow correct." },
      { id: "m-blades", type: "field", title: "Replace wiper blades", xp: 50, min: 15, need: "Blades for your car (a parts store looks up sizes)", parts: ["wipers"],
        steps: ["Look up the blade sizes for a 2016 V60.", "Lift the arm, press the release tab, and slide the old blade off.", "Lower the arm gently onto a towel so it cannot snap onto the glass.", "Click the new blade on, lower it, and test."],
        see: "A clean, quiet sweep." }
    ] },
    { id: "c6", after: 1, title: "Sixth sense", badge: "Sixth sense", blurb: "Sounds, smells and feelings that tell you what is wrong, and when to stop driving.", missions: [
      { id: "m-sound", type: "learn", title: "What that noise means", xp: 40, min: 6,
        body: ["High squeal when braking: often the pad wear indicator, a small metal tab that squeals when pads get thin. Book a brake check.",
          "Grinding when braking: metal on metal. Pads may be gone. Get it checked immediately.",
          "Clicking while turning sharply: a classic sign of a worn CV joint on a front axle.",
          "Squeal at startup or with the A/C on: often the accessory belt.",
          "Hum or growl that rises with speed and changes when you weave: often a wheel bearing.",
          "Knocking from the engine under load: stop hard acceleration and get it checked."],
        quiz: [{ q: "Grinding when you brake. What now?", o: ["Get the brakes checked immediately", "Normal, ignore it", "Add oil"], a: 0, why: "Grinding usually means metal contact. Rotors and brake safety are at risk." },
          { q: "Clicking when turning sharply in a parking lot suggests...", o: ["A worn CV joint", "Low washer fluid", "A bad radio"], a: 0, why: "The outer CV joint clicks under angle when worn." },
          { q: "A hum that gets louder with speed and changes when you swerve gently suggests...", o: ["A wheel bearing", "The air filter", "The battery"], a: 0, why: "Load shifts onto the bearing when you swerve, which changes the noise." }] },
      { id: "m-smell", type: "learn", title: "What that smell means", xp: 40, min: 5,
        body: ["Sweet, syrupy smell: coolant leaking, possibly into the cabin through the heater. Check the coolant level when cold.",
          "Burning oil: oil dripping onto the hot exhaust, often from a seal. Look for wet spots.",
          "Raw gasoline: a fuel leak or a loose gas cap. If strong, do not drive. Fuel leaks are a fire risk.",
          "Rotten eggs: the catalytic converter is struggling, often from the engine running rich.",
          "Hot, acrid smell after hard braking down a hill: overheated brakes. Let them cool."],
        quiz: [{ q: "A strong raw-gasoline smell around the car. Best move?", o: ["Do not drive. Get it inspected", "Drive faster to air it out"], a: 0, why: "Liquid fuel near hot parts can ignite." },
          { q: "A sweet smell from the vents with foggy windows suggests...", o: ["A coolant leak at the heater core", "New car smell"], a: 0, why: "Coolant vapor smells sweet and fogs glass." }] },
      { id: "m-feel", type: "learn", title: "What that feeling means", xp: 40, min: 5,
        body: ["Vibration at highway speed, often 55 to 70 mph: usually wheel balance. Cheap to fix.",
          "Pulling to one side: low tire pressure first, then alignment.",
          "Soft or sinking brake pedal: possible fluid leak or air in the system. Do not drive until checked.",
          "Shudder or harsh shifts: transmission fluid condition or software. Note when it happens.",
          "Hesitation when accelerating: air filter, ignition coils or boost leaks are common causes on turbo engines."],
        quiz: [{ q: "The brake pedal slowly sinks to the floor at a stop. Action?", o: ["Do not drive. Get it checked", "Pump it and keep going"], a: 0, why: "A sinking pedal can mean a leak or a failing master cylinder. That means a loss of braking." },
          { q: "First thing to check when the car pulls to one side?", o: ["Tire pressures", "Spark plugs"], a: 0, why: "Uneven pressure is the most common and cheapest cause." }] },
      { id: "m-boss", type: "learn", title: "Final exam: stop or go?", xp: 80, min: 6,
        body: ["Six real situations. Decide whether you can keep driving carefully or must stop. Pass with five of six."],
        pass: 5,
        quiz: [{ q: "Steady check-engine light, car drives normally.", o: ["Keep driving, get it read within days", "Stop immediately"], a: 0, why: "Steady means recorded fault, not an emergency, unless other symptoms appear." },
          { q: "Flashing check-engine light while climbing a hill.", o: ["Keep the same speed", "Ease off, pull over when safe, and get it checked"], a: 1, why: "Active misfire. Load makes it worse and can overheat the catalytic converter." },
          { q: "Temperature gauge climbing toward hot in traffic.", o: ["Pull over and turn the engine off", "Turn up the A/C"], a: 0, why: "Overheating can warp the head. Turning on the cabin heater can buy a little time, but stopping is safest." },
          { q: "Tire-pressure light on, car feels normal.", o: ["Check pressures at the next station", "Call a tow truck"], a: 0, why: "Usually a slightly low tire. Check soon. Stop if the car pulls or wobbles." },
          { q: "Red oil-pressure light on the highway.", o: ["Exit and turn the engine off", "Finish the trip, it's close"], a: 0, why: "Minutes without oil pressure can destroy the engine." },
          { q: "Squeal from the brakes only when stopping.", o: ["Book a brake inspection soon", "Stop driving immediately"], a: 0, why: "Usually the wear indicator, which is designed to warn you early." }] }
    ] }
  ];

  /* Career mode: Car Mechanic Simulator style. Inspect (costs minutes) -> diagnose. */
  var JOBS = [
    { id: "j-lean", title: "Check-engine light, rough idle", xp: 120, complaint: "The check-engine light is on and the idle feels a little shaky when warm. The scanner shows P0171 (system too lean, bank 1).",
      checks: [["Read live fuel trims at idle and at 2,500 rpm", 10, "Long-term trim +18 % at idle, +6 % at 2,500 rpm. Much worse at idle."], ["Listen around the engine with it idling", 5, "A faint whistle near the top of the engine, by the oil filler area."], ["Inspect the engine air filter", 5, "Moderately dirty but not blocked."], ["Remove the oil cap at idle and feel for suction", 5, "Strong suction pulling on the cap, much more than normal."], ["Check fuel pressure", 20, "Within specification."]],
      options: ["Failed fuel pump", "PCV (crankcase ventilation) fault or vacuum leak", "Clogged air filter", "Bad oxygen sensor"], a: 1, best: 25,
      why: "Trims much higher at idle than at speed point to unmetered air, because a leak matters most when airflow is low. The whistle and the strong cap suction point at the PCV system, a known weak spot on many turbo four-cylinders. Fuel pressure was fine, so the pump is not it." },
    { id: "j-crank", title: "Slow to start on cold mornings", xp: 100, complaint: "The car cranks slowly on cool mornings and once needed a jump. No warning lights.",
      checks: [["Check the battery's date label", 3, "Installed about five years ago."], ["Measure battery voltage with the engine off overnight", 5, "12.2 V, which is low. A healthy battery rests near 12.6 V."], ["Measure voltage with the engine running", 5, "14.1 V. The alternator is charging normally."], ["Inspect the terminals", 3, "Light white corrosion on the positive terminal."], ["Parts-store load test", 15, "Battery fails the load test, about 55 % of rated cranking amps."]],
      options: ["Failing alternator", "Aged battery at end of life", "Starter motor failure", "Bad ignition switch"], a: 1, best: 13,
      why: "Charging voltage is healthy, so the alternator is working. A five-year-old battery in Texas heat that rests at 12.2 V and fails a load test is worn out. Clean the terminals when you replace it." },
    { id: "j-hot", title: "Temperature climbs in traffic", xp: 120, complaint: "On the highway the temperature is normal, but in stop-and-go traffic on hot afternoons it creeps toward hot. Cools down once moving.",
      checks: [["Check the coolant level (engine cold)", 5, "Level at MIN, slightly low but present."], ["Run the A/C at idle and watch the cooling fan", 5, "The fan does not come on, even as the temperature rises."], ["Inspect the radiator front for debris", 5, "Some bugs, nothing blocking it."], ["Pressure test the cooling system", 20, "Holds pressure. No major leak."], ["Scan for codes", 5, "Stored code for the cooling fan control circuit."]],
      options: ["Head gasket failure", "Cooling fan or its control not working", "Thermostat stuck closed", "Water pump failure"], a: 1, best: 15,
      why: "Overheating only when stopped, normal at speed, means airflow is the problem. At speed, moving air cools the radiator. At a stop, only the fan does. A fan that never runs plus a fan-circuit code points at the fan or its control module. Top up the coolant too." },
    { id: "j-squeal", title: "Squeal when braking", xp: 90, complaint: "A high-pitched squeal when braking lightly, which goes away with harder braking. Started last week.",
      checks: [["Look at the pads through the wheel spokes with a flashlight", 5, "Front pad material looks thin, about 3 mm."], ["Check brake fluid level", 3, "Slightly below the middle, within range. Fluid drops as pads wear."], ["Feel the steering wheel during braking", 3, "No pulsing or shudder."], ["Look at the rotors", 5, "Smooth with a small lip at the edge."], ["Check the service history", 5, "Front pads replaced about 45,000 miles ago."]],
      options: ["Warped rotors", "Front pads at the wear-indicator limit", "Caliper seized", "Low brake fluid leak"], a: 1, best: 13,
      why: "The squeal is the wear tab touching the rotor. Thin pads, fluid dropping only in step with wear, and a smooth pedal all fit pads due for replacement. Have the rotors measured when the pads are done." }
  ];

  function acad() { if (!state.academy) state.academy = { done: {}, quiz: {}, jobs: {}, data: {} }; return state.academy; }
  function allMissions() { var out = []; CHAPTERS.forEach(function (c) { c.missions.forEach(function (m) { out.push(m); }); }); return out; }
  function missionById(id) { return allMissions().filter(function (m) { return m.id === id; })[0]; }
  function xpTotal() {
    var A = acad(), x = 0;
    allMissions().forEach(function (m) { var d = A.done[m.id]; if (d && d.outcome !== "skip") x += m.xp; if (A.quiz[m.id] && A.quiz[m.id].perfect) x += 10; });
    JOBS.forEach(function (j) { var r = A.jobs[j.id]; if (r) x += r.xp || 0; });
    if (A.sim && isNum(A.sim.correct)) x += 25 * A.sim.correct + 15 * (A.sim.clean || 0);
    if (A.bayFound) x += 10 * Object.keys(A.bayFound).length;
    MODS.forEach(function (m) { if (m.xp) try { x += m.xp(API) || 0; } catch (e) {} });
    return x;
  }
  function rankFor(x) { var r = RANKS[0], i = 0; RANKS.forEach(function (k, j) { if (x >= k[0]) { r = k; i = j; } }); return { name: r[1], lvl: i + 1, at: r[0], next: RANKS[i + 1] || null }; }
  function chapterDone(c) { var A = acad(); return c.missions.filter(function (m) { return A.done[m.id] && A.done[m.id].outcome !== "skip"; }).length; }
  function prereq(i) { var c = CHAPTERS[i]; return CHAPTERS[c.after != null ? c.after : i - 1]; }
  function chapterUnlocked(i) { if (i === 0) return true; var p = prereq(i); return chapterDone(p) >= Math.ceil(p.missions.length / 2); }
  function careerUnlocked() { return chapterDone(CHAPTERS[5]) >= 2 || chapterDone(CHAPTERS[3]) >= 2; }
  function nextMission() {
    var A = acad();
    for (var i = 0; i < CHAPTERS.length; i++) { if (!chapterUnlocked(i)) continue; var m = CHAPTERS[i].missions.filter(function (m) { return !A.done[m.id]; })[0]; if (m) return m; }
    return null;
  }

  var aui = { view: "home", id: null, jobPicks: {}, jobAns: null };
  function renderAcademy() {
    var x = xpTotal(), r = rankFor(x);
    $("hudRank").textContent = "Lv " + r.lvl; $("hudRankName").textContent = r.name;
    if (aui.view === "mission") return renderMission(missionById(aui.id));
    if (aui.view === "job") return renderJob(JOBS.filter(function (j) { return j.id === aui.id; })[0]);
    var pct = r.next ? Math.round(100 * (x - r.at) / (r.next[0] - r.at)) : 100;
    var nm = nextMission();
    var badges = CHAPTERS.map(function (c) { var full = chapterDone(c) === c.missions.length; return '<span class="badge' + (full ? " on" : "") + '" title="' + esc(c.title) + '">' + esc(c.badge) + "</span>"; }).join("") +
      '<span class="badge' + (JOBS.every(function (j) { return acad().jobs[j.id]; }) ? " on" : "") + '">Career</span>';
    var html = '<section class="player"><div class="pl-top"><div><div class="eyebrow">Level ' + r.lvl + '</div><div class="pl-rank">' + esc(r.name) + '</div></div><div class="pl-xp"><span class="v">' + x + '</span> XP</div></div>' +
      '<div class="xpbar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '" aria-label="Progress to next rank"><i style="width:' + pct + '%"></i></div>' +
      '<div class="status">' + (r.next ? (r.next[0] - x) + " XP to " + esc(r.next[1]) : "Top rank reached") + '</div><div class="badges">' + badges + "</div>" +
      (nm ? '<div class="row"><button type="button" data-mission="' + nm.id + '">Next mission: ' + esc(nm.title) + "</button></div>" : '<p>Every unlocked mission is complete.</p>') + "</section>";
    html += '<p class="lede">Self-paced. Nothing expires and there are no streaks. Field missions happen at the real car, and what you record there fills in the Bay, Records and Health tabs. Chapters unlock when you finish half of the one before.</p>';
    CHAPTERS.forEach(function (c, i) {
      var un = chapterUnlocked(i), d = chapterDone(c);
      html += '<section class="chap' + (un ? "" : " locked") + '"><div class="chap-h"><div><div class="eyebrow">Chapter ' + (i + 1) + (un ? "" : " · locked") + '</div><h3>' + esc(c.title) + '</h3></div><span class="status">' + d + " / " + c.missions.length + '</span></div><p class="lede">' + esc(c.blurb) + "</p>";
      if (un) html += '<ul class="mlist">' + c.missions.map(function (m) {
        var st = acad().done[m.id], q = acad().quiz[m.id];
        return '<li><button type="button" class="mbtn" data-mission="' + m.id + '"><span class="pill ' + (st ? (st.outcome === "skip" ? "info" : "ok") : "none") + '">' + (st ? (st.outcome === "skip" ? "Later" : "Done") : ({ learn: "Learn", field: "Field", log: "Log" })[m.type]) + '</span><span class="mt">' + esc(m.title) + (q && q.perfect ? " ★" : "") + '</span><span class="status">' + m.xp + " XP · " + m.min + " min</span></button></li>";
      }).join("") + "</ul>";
      else html += '<p class="status">Finish ' + Math.ceil(prereq(i).missions.length / 2) + " missions in " + esc(prereq(i).title) + " to unlock.</p>";
      html += "</section>";
    });
    var cu = careerUnlocked();
    if (!window.V60_GATE || window.V60_GATE.feature("career")) html += '<section class="chap' + (cu ? "" : " locked") + '"><div class="chap-h"><div><div class="eyebrow">Career mode' + (cu ? "" : " · locked") + '</div><h3>Shop jobs</h3></div><span class="status">' + JOBS.filter(function (j) { return acad().jobs[j.id]; }).length + " / " + JOBS.length + '</span></div><p class="lede">A customer brings in a car with a complaint. Choose what to inspect, where every check costs shop time, then make the call. Fewer minutes and the right answer earn more XP. The cases are realistic, but they are practice, not your car\'s diagnosis.</p>' +
      (cu ? '<ul class="mlist">' + JOBS.map(function (j) { var r2 = acad().jobs[j.id]; return '<li><button type="button" class="mbtn" data-job="' + j.id + '"><span class="pill ' + (r2 ? (r2.correct ? "ok" : "watch") : "none") + '">' + (r2 ? (r2.correct ? "Solved" : "Missed") : "Job") + '</span><span class="mt">' + esc(j.title) + '</span><span class="status">up to ' + j.xp + " XP</span></button></li>"; }).join("") + "</ul>"
        : '<p class="status">Unlocks after two missions in Plug in or Sixth sense.</p>') + "</section>";
    $("acadBody").innerHTML = html;
  }

  function stepHTML(s, i, m) {
    var t = typeof s === "string" ? esc(s) : factHTML(s.fact), A = acad(), ck = (A.data[m.id] && A.data[m.id].steps && A.data[m.id].steps[i]) ? " checked" : "";
    return '<label class="stp"><input type="checkbox" data-step="' + i + '"' + ck + "><span>" + t + "</span></label>";
  }
  function inputHTML(m) {
    var A = acad(), d = (A.data[m.id] && A.data[m.id].vals) || {};
    function num(k, label, ph) { return '<div class="field"><label for="in-' + k + '">' + esc(label) + '</label><input id="in-' + k + '" data-in="' + k + '" type="number" inputmode="decimal" step="0.5" min="0" placeholder="' + (ph || "") + '" value="' + (d[k] != null ? esc(d[k]) : "") + '"></div>'; }
    function txt(k, label, ph) { return '<div class="field"><label for="in-' + k + '">' + esc(label) + '</label><input id="in-' + k + '" data-in="' + k + '" type="text" maxlength="4" inputmode="numeric" placeholder="' + (ph || "") + '" class="mono" style="width:6em" value="' + (d[k] != null ? esc(d[k]) : "") + '"></div>'; }
    if (m.input === "psi") return '<div class="row">' + num("lf", "Left front psi") + num("rf", "Right front psi") + num("lr", "Left rear psi") + num("rr", "Right rear psi") + num("spec", "Label says psi") + "</div>";
    if (m.input === "tread") return '<div class="row">' + ["lf", "rf", "lr", "rr"].map(function (k) { return '<div class="field"><label for="in-t' + k + '">' + { lf: "Left front", rf: "Right front", lr: "Left rear", rr: "Right rear" }[k] + ' tread</label><select id="in-t' + k + '" data-in="t' + k + '"><option value="">-</option><option value="ok"' + (d["t" + k] === "ok" ? " selected" : "") + '>Head covered</option><option value="low"' + (d["t" + k] === "low" ? " selected" : "") + '>Head visible</option></select></div>'; }).join("") + "</div>" +
      '<div class="row">' + ["lf", "rf", "lr", "rr"].map(function (k) { return txt("d" + k, { lf: "LF", rf: "RF", lr: "LR", rr: "RR" }[k] + " DOT date", "2419"); }).join("") + "</div>";
    if (m.input === "odo") return '<div class="row">' + num("odo", "Odometer, miles", state.odo != null ? String(state.odo) : "98000") + "</div>";
    if (m.input === "recall") return '<div class="row"><div class="field"><label for="in-recall">Result</label><select id="in-recall" data-in="recall"><option value="">Choose</option><option value="none"' + (d.recall === "none" ? " selected" : "") + '>No open recalls</option><option value="open"' + (d.recall === "open" ? " selected" : "") + '>Open recall found</option></select></div></div>';
    return "";
  }
  function renderMission(m) {
    if (!m) { aui.view = "home"; return renderAcademy(); }
    var A = acad(), st = A.done[m.id], q = A.quiz[m.id];
    var fc = window.V60_FROMCASE;
    var html = '<div class="row">' + (fc ? '<button type="button" data-jump="case:' + esc(fc.id) + '">Back to the case: ' + esc(fc.t) + "</button>" : '<button type="button" class="quiet" data-acad="home">All training</button>') + '<span class="status">' + (fc ? "Training for " + esc(fc.t) + " · " : "") + ({ learn: "Lesson", field: "Field mission", log: "Log" })[m.type] + " · " + m.xp + " XP · about " + m.min + " min</span></div>";
    html += "<h2>" + esc(m.title) + "</h2>";
    if (m.need) html += '<p><b>You need:</b> ' + esc(m.need) + "</p>";
    (m.body || []).forEach(function (p) { html += "<p>" + esc(p) + "</p>"; });
    if (m.safety) html += '<div class="note"><b>Safety.</b> ' + esc(m.safety) + "</div>";
    if (m.steps) html += '<div class="steps"><h4>Steps</h4>' + m.steps.map(function (s, i) { return stepHTML(s, i, m); }).join("") + "</div>";
    if (m.input) html += inputHTML(m);
    if (m.see) html += '<div class="note calm"><b>What you should see.</b> ' + esc(m.see) + "</div>";
    if (m.link) html += '<p><a href="' + m.link[0] + '" target="_blank" rel="noopener">' + esc(m.link[1]) + "</a></p>";
    if (m.go) html += '<div class="row"><button type="button" class="quiet" data-jump="' + m.go + '">Open the ' + esc(m.go.split(":")[1]) + " tab</button></div>";
    if (m.quiz) {
      html += '<div class="quiz"><h4>Check yourself' + (q ? " · best " + q.best + " / " + m.quiz.length : "") + "</h4>" + m.quiz.map(function (qq, i) {
        return '<fieldset><legend>' + (i + 1) + ". " + esc(qq.q) + "</legend>" + qq.o.map(function (o, j) { return '<label><input type="radio" name="q' + i + '" value="' + j + '"> ' + esc(o) + "</label>"; }).join("") + '<div class="why" id="why' + i + '" hidden></div></fieldset>';
      }).join("") + '<div class="row"><button type="button" id="quizGo">Check answers</button><span class="status" id="quizRes"></span></div></div>';
    } else {
      var outs = m.type === "field" ? [["good", "Done, looked right"], ["off", "Done, something looked off"], ["skip", "Could not do it yet"]] : [["good", "Mark complete"]];
      html += '<div class="field" style="max-width:40em"><label for="mNote">Notes (optional)</label><input id="mNote" type="text" maxlength="200" class="wide" value="' + esc(st && st.note || "") + '"></div>';
      html += '<div class="row">' + outs.map(function (o) { return '<button type="button" class="' + (o[0] === "good" ? "" : "quiet") + '" data-outcome="' + o[0] + '">' + esc(o[1]) + "</button>"; }).join("") + '<span class="status" id="mStatus">' + (st ? "Completed " + esc(st.date) + (st.outcome === "off" ? ", flagged" : "") : "") + "</span></div>";
    }
    $("acadBody").innerHTML = '<section class="mission">' + html + "</section>";
    var b = $("acadBody"); if (b.scrollIntoView) b.scrollIntoView({ block: "start" });
  }
  function rate(ids, lv, note) { (ids || []).forEach(function (id) { if (partById(id)) state.rate[id] = { r: lv, d: todayStr(), n: ("Academy: " + note).slice(0, 200) }; }); }
  function readInputs(m) { var vals = {}; document.querySelectorAll("#acadBody [data-in]").forEach(function (el) { if (el.value !== "") vals[el.getAttribute("data-in")] = el.type === "number" ? parseFloat(el.value) : el.value; }); return vals; }
  function finishMission(m, outcome) {
    var A = acad(), vals = readInputs(m), note = ($("mNote") && $("mNote").value.trim()) || "", msg = "";
    A.data[m.id] = A.data[m.id] || {}; A.data[m.id].vals = vals;
    if (m.input === "odo") { if (!isNum(vals.odo)) { $("mStatus").textContent = "Enter your mileage first."; return; } state.odo = Math.round(vals.odo); }
    if (m.input === "psi" && outcome !== "skip") {
      var ks = ["lf", "rf", "lr", "rr"].filter(function (k) { return isNum(vals[k]); });
      if (ks.length < 4) { $("mStatus").textContent = "Enter all four readings."; return; }
      if (isNum(vals.spec)) { var off = ks.filter(function (k) { return Math.abs(vals[k] - vals.spec) > 2; }); if (off.length) { outcome = "off"; msg = off.length + " tire" + (off.length > 1 ? "s" : "") + " more than 2 psi from the label. Adjust and recheck."; } }
    }
    if (m.input === "tread" && outcome !== "skip") {
      var low = ["lf", "rf", "lr", "rr"].filter(function (k) { return vals["t" + k] === "low"; }), now = new Date(), y = now.getFullYear(), old = [];
      ["lf", "rf", "lr", "rr"].forEach(function (k) { var v = String(vals["d" + k] || ""); if (/^\d{4}$/.test(v)) { var yy = 2000 + parseInt(v.slice(2), 10), age = y - yy + (now.getMonth() / 12) - (parseInt(v.slice(0, 2), 10) / 52); if (age >= 6) old.push(k.toUpperCase() + " " + age.toFixed(1) + " yr"); } });
      if (low.length) { rate(["tread"], 2, "quarter test shows wear on " + low.join(", ").toUpperCase()); outcome = "off"; msg += "Tread is getting low on " + low.length + " tire" + (low.length > 1 ? "s" : "") + ". "; } else rate(["tread"], 4, "quarter test passed");
      if (old.length) { rate(["age"], 2, "aged tires: " + old.join(", ")); outcome = "off"; msg += "Tires over six years old: " + old.join(", ") + ". Get them inspected and plan replacement."; } else if (Object.keys(vals).some(function (k) { return k.charAt(0) === "d"; })) rate(["age"], 4, "DOT dates under six years");
    }
    if (m.input === "recall") { if (!vals.recall) { $("mStatus").textContent = "Choose a result first."; return; } if (vals.recall === "open") { outcome = "off"; msg = "Call a Volvo dealer. Recall repairs are free."; } }
    if (m.parts && outcome !== "skip" && m.input !== "tread") rate(m.parts, outcome === "good" ? 4 : 3, m.title + (note ? ": " + note : ""));
    A.done[m.id] = { date: todayStr(), outcome: outcome, note: note };
    var before = rankFor(xpTotal() - (outcome !== "skip" ? m.xp : 0));
    renderAll(); save();
    var after = rankFor(xpTotal());
    aui.view = "mission"; renderMission(m);
    $("mStatus").textContent = (outcome === "skip" ? "Saved for later." : "+" + m.xp + " XP. ") + msg + (after.lvl > before.lvl ? " Rank up: " + after.name + "!" : "");
  }
  function gradeQuiz(m) {
    var right = 0, answered = 0;
    m.quiz.forEach(function (qq, i) {
      var sel = document.querySelector('#acadBody input[name="q' + i + '"]:checked'), w = $("why" + i);
      if (sel) answered++;
      var ok = sel && +sel.value === qq.a; if (ok) right++;
      w.hidden = !sel; w.className = "why " + (ok ? "ok" : "bad"); w.textContent = (ok ? "Correct. " : "Not quite. The answer is: " + qq.o[qq.a] + ". ") + qq.why;
    });
    if (answered < m.quiz.length) { $("quizRes").textContent = "Answer every question first."; return; }
    var A = acad(), need = m.pass || Math.ceil(m.quiz.length * 2 / 3), passed = right >= need, prev = A.quiz[m.id] || { best: 0 };
    var before = rankFor(xpTotal());
    A.quiz[m.id] = { best: Math.max(prev.best || 0, right), perfect: !!(prev.perfect || right === m.quiz.length) };
    var first = passed && !A.done[m.id];
    if (passed && !A.done[m.id]) A.done[m.id] = { date: todayStr(), outcome: "good", note: "" };
    save(); renderHealth();
    var after = rankFor(xpTotal()); $("hudRank").textContent = "Lv " + after.lvl;
    $("quizRes").textContent = right + " / " + m.quiz.length + ". " + (passed ? (first ? "+" + m.xp + " XP." : "Passed.") + (right === m.quiz.length && !prev.perfect ? " Perfect bonus +10 XP." : "") : "Need " + need + " to pass. Read the explanations and try again.") + (after.lvl > before.lvl ? " Rank up: " + after.name + "!" : "");
  }

  function renderJob(j) {
    if (!j) { aui.view = "home"; return renderAcademy(); }
    var picks = aui.jobPicks[j.id] || {}, spent = 0, res = acad().jobs[j.id];
    j.checks.forEach(function (c, i) { if (picks[i]) spent += c[1]; });
    var html = '<div class="row"><button type="button" class="quiet" data-acad="home">All training</button><span class="status">Shop job · up to ' + j.xp + " XP</span></div><h2>" + esc(j.title) + "</h2>";
    html += '<div class="note calm"><b>Customer says:</b> ' + esc(j.complaint) + "</div>";
    html += '<h4>Inspect</h4><p class="lede">Each check costs shop time. Clock: <b>' + spent + " min</b>. Par is " + j.best + " minutes.</p>";
    html += '<ul class="mlist">' + j.checks.map(function (c, i) { return "<li>" + (picks[i] ? '<div class="found"><b>' + esc(c[0]) + '</b><span class="status"> · ' + c[1] + " min</span><p>" + esc(c[2]) + "</p></div>" : '<button type="button" class="mbtn" data-check="' + j.id + ":" + i + '"><span class="pill none">' + c[1] + ' min</span><span class="mt">' + esc(c[0]) + "</span></button>") + "</li>"; }).join("") + "</ul>";
    html += '<h4>Your diagnosis</h4><div class="quiz"><fieldset><legend>What is wrong?</legend>' + j.options.map(function (o, k) { return '<label><input type="radio" name="jobAns" value="' + k + '"' + (res && res.pick === k ? " checked" : "") + "> " + esc(o) + "</label>"; }).join("") + "</fieldset></div>";
    html += '<div class="row"><button type="button" data-jobgo="' + j.id + '">Submit diagnosis</button><button type="button" class="quiet" data-jobreset="' + j.id + '">Restart job</button><span class="status" id="jobRes">' + (res ? (res.correct ? "Solved in " + res.min + " min for " + res.xp + " XP." : "Last answer missed.") : "") + "</span></div>";
    html += '<div id="jobWhy"' + (res ? "" : " hidden") + ' class="note calm">' + esc(j.why) + "</div>";
    $("acadBody").innerHTML = '<section class="mission">' + html + "</section>";
  }
  function submitJob(j) {
    var sel = document.querySelector('#acadBody input[name="jobAns"]:checked');
    if (!sel) { $("jobRes").textContent = "Pick a diagnosis."; return; }
    var picks = aui.jobPicks[j.id] || {}, spent = 0, n = 0; j.checks.forEach(function (c, i) { if (picks[i]) { spent += c[1]; n++; } });
    if (!n) { $("jobRes").textContent = "Inspect at least one thing first. Guessing is how shops lose customers."; return; }
    var correct = +sel.value === j.a, xp = correct ? Math.round(j.xp * Math.max(0.4, Math.min(1, j.best / Math.max(spent, 1)))) : 10;
    var prev = acad().jobs[j.id];
    if (!prev || xp > (prev.xp || 0) || (correct && !prev.correct)) acad().jobs[j.id] = { correct: correct, xp: xp, min: spent, pick: +sel.value, date: todayStr() };
    save(); renderJob(j);
    $("jobRes").textContent = (correct ? "Correct. " + spent + " min on the clock, " + xp + " XP." : "Not this time (+10 XP for the attempt). Read the explanation, restart, and try a different path.");
    $("jobWhy").hidden = false;
    $("hudRank").textContent = "Lv " + rankFor(xpTotal()).lvl;
  }

  function academyClick(t) {
    var b;
    if ((b = t.closest("[data-mission]"))) { aui.view = "mission"; aui.id = b.getAttribute("data-mission"); renderAcademy(); return true; }
    if ((b = t.closest("[data-job]"))) { aui.view = "job"; aui.id = b.getAttribute("data-job"); renderAcademy(); return true; }
    if ((b = t.closest("[data-acad]"))) { aui.view = "home"; renderAcademy(); var top = $("p-academy"); if (top && top.scrollIntoView) top.scrollIntoView({ block: "start" }); return true; }
    if ((b = t.closest("[data-outcome]"))) { finishMission(missionById(aui.id), b.getAttribute("data-outcome")); return true; }
    if (t.id === "quizGo") { gradeQuiz(missionById(aui.id)); return true; }
    if ((b = t.closest("[data-check]"))) { var p = b.getAttribute("data-check").split(":"); (aui.jobPicks[p[0]] = aui.jobPicks[p[0]] || {})[p[1]] = true; renderJob(JOBS.filter(function (j) { return j.id === p[0]; })[0]); return true; }
    if ((b = t.closest("[data-jobgo]"))) { submitJob(JOBS.filter(function (j) { return j.id === b.getAttribute("data-jobgo"); })[0]); return true; }
    if ((b = t.closest("[data-jobreset]"))) { aui.jobPicks[b.getAttribute("data-jobreset")] = {}; renderJob(JOBS.filter(function (j) { return j.id === b.getAttribute("data-jobreset"); })[0]); return true; }
    return false;
  }
  function academyStep(t) {
    if (!t.matches || !t.matches("#acadBody input[data-step]")) return false;
    var A = acad(); A.data[aui.id] = A.data[aui.id] || {}; A.data[aui.id].steps = A.data[aui.id].steps || {}; A.data[aui.id].steps[t.getAttribute("data-step")] = t.checked; save(); return true;
  }

  /* ================= FAULT SIMULATOR ================= */
  var FAULTS = [
    { k: "vac", n: "Vacuum or PCV leak", d: "Air sneaks in after the airflow sensor, so the computer never measured it.", how: "Unmeasured air leans the mixture, and the computer adds fuel to compensate. It matters most at idle, when total airflow is small, so fuel trims rise far more at idle than at cruise. Idle can wander. A failing PCV valve or a cracked intake hose are the classic causes." },
    { k: "maf", n: "Dirty airflow sensor", d: "The mass-airflow sensor under-reads the air coming in.", how: "The computer fuels for the air it thinks it sees, which is too little, so it trims fuel up at every speed, not mostly at idle like a vacuum leak. Idle airflow reads lower than your baseline. Cleaning the sensor with MAF cleaner often fixes it." },
    { k: "inj", n: "Leaking fuel injector", d: "Extra fuel drips in that the computer did not command.", how: "Too much fuel means the computer pulls fuel out, so trims go negative. Rough starts after sitting and a fuel smell can come with it. A purge valve stuck open looks similar." },
    { k: "boost", n: "Boost leak", d: "A charge pipe or intercooler hose leaks under pressure.", how: "Under boost, measured air escapes before reaching the engine, so peak intake pressure falls short and the car feels flat when you accelerate hard. At idle the same hole can pull in a little unmeasured air. You need a full-throttle pull in the log to see it." },
    { k: "thermo", n: "Thermostat stuck open", d: "Coolant flows to the radiator before the engine has warmed up.", how: "The engine warms slowly and settles cooler than normal, often worse on the highway in cool weather. Cabin heat is weak, fuel use rises, and a P0128 code is common." },
    { k: "fan", n: "Cooling fan not working", d: "The electric fan never switches on.", how: "At speed, air through the grille cools the radiator, so everything looks normal. In traffic or at idle only the fan moves air, so temperature climbs until you move again. Watch it in the Traffic route." },
    { k: "alt", n: "Weak alternator", d: "The charging system cannot hold normal voltage.", how: "Running voltage sags toward battery-resting levels and can slowly drain. Dim lights, a slow crank the next morning and a battery warning follow. Smart charging can also lower voltage on purpose, so compare against your own baseline." },
    { k: "mis", n: "Misfire", d: "A worn plug or failing coil makes one cylinder skip.", how: "Idle gets shaky: RPM spreads out and short-term trim jitters. Under load it can flash the check-engine light. On this engine coils and plugs are the usual first checks." }
  ];
  var ROUTES = { mixed: "Mixed drive", city: "City stop-and-go", highway: "Highway with a merge", traffic: "Traffic jam, hot afternoon" };
  var SIMKEYS = ["speed", "coolant", "rpm", "stft", "ltft", "volt", "map", "maf"];
  var sim = { route: "mixed", amb: 24, f: {}, mode: "sandbox", mystery: null, show: { speed: true, coolant: true, rpm: true, stft: true, ltft: true, volt: true, map: false, maf: false } };
  FAULTS.forEach(function (x) { sim.f[x.k] = 0; });

  function routeKeys(r) {
    if (r === "city") { var k = [[0, 0]], tt = 60; while (tt < 1140) { k.push([tt, 0], [tt + 20, 45], [tt + 70, 50], [tt + 90, 0]); tt += 120; } k.push([1200, 0]); return k; }
    if (r === "highway") return [[0, 0], [60, 0], [120, 50], [240, 60], [300, 0], [330, 0], [360, 70], [380, 125], [400, 110], [1080, 112], [1120, 60], [1160, 0], [1200, 0]];
    if (r === "traffic") { var q = [[0, 0], [40, 0], [90, 60], [150, 60], [180, 0]], t2 = 200; while (t2 < 1000) { q.push([t2, 0], [t2 + 15, 12], [t2 + 40, 10], [t2 + 55, 0]); t2 += 80; } q.push([1020, 0], [1200, 0]); return q; }
    return [[0, 0], [80, 0], [100, 30], [140, 50], [160, 20], [175, 0], [215, 0], [245, 45], [290, 55], [320, 30], [340, 0], [380, 0], [420, 70], [470, 100], [640, 112], [660, 150], [690, 115], [800, 110], [830, 155], [860, 112], [1000, 105], [1060, 40], [1100, 0], [1200, 0]];
  }
  function simDrive(route, amb, F, seedIn) {
    var seed = seedIn || 777;
    function rnd() { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296 - 0.5; }
    var key = routeKeys(route), N = 1201, o = { t: [] };
    var pulls = { mixed: [[650, 662]], highway: [[362, 378]], city: [], traffic: [] }[route] || [];
    function inPull(x) { return pulls.some(function (p) { return x >= p[0] && x <= p[1]; }); }
    SIMKEYS.concat(["throttle", "load", "iat"]).forEach(function (k) { o[k] = []; });
    function spd(x) { for (var i = 1; i < key.length; i++) if (x <= key[i][0]) { var a = key[i - 1], b = key[i], fr = (x - a[0]) / Math.max(b[0] - a[0], 1e-9); return a[1] + (b[1] - a[1]) * fr; } return 0; }
    var cool = amb, tau = 190 * (1 + Math.max(0, 25 - amb) / 60) * (1 + 1.5 * F.thermo), ltftMem = 2;
    for (var s = 0; s < N; s++) {
      o.t.push(s);
      var v = spd(s), acc = spd(s + 1) - v, idle = v < 0.5;
      var thr = idle ? 0 : (inPull(s) ? 96 : Math.max(0, Math.min(100, 8 + v * 0.18 + acc * 7)));
      var dip = rnd() + 0.5, jit = rnd();
      var rpm = idle ? 760 + 40 * F.vac + jit * (40 + 300 * F.mis) - (F.mis > 0.2 && dip < 0.04 * F.mis ? 90 : 0) : 1100 + v * 17 + acc * 40 + jit * (40 + 40 * F.mis);
      var load = 18 + thr * 0.6 + rnd() * 2;
      var boost = thr > 55 ? (thr - 55) * 2.2 * (1 - 0.6 * F.boost) : 0;
      var map = 34 + load * 0.55 + boost + rnd() * 2;
      var mafTrue = 2.6 + (rpm * load) / 3200;
      /* fuel trim the engine needs, in percent */
      var need = 0;
      need += (1.6 * F.vac * (map < 100 ? 1 : 0.2)) / mafTrue * 100;
      need += 17 * F.maf * (0.85 + 0.3 * Math.min(1, mafTrue / 30));
      need -= 17 * F.inj * (idle ? 1.4 : 1);
      need += boost > 0 ? -7 * F.boost : (idle ? 6 * F.boost : 2 * F.boost);
      var closed = cool > 40;
      ltftMem = closed ? ltftMem + (0.8 * need + 2 - ltftMem) * 0.08 : ltftMem;
      var ltft = ltftMem + rnd() * 0.8;
      var stft = closed ? 0.2 * need + rnd() * (6 + 10 * F.mis) : rnd() * 1;
      /* coolant */
      var target = 89 - 22 * F.thermo - (v > 80 ? 6 * F.thermo : 0);
      var slow = v < 15, pullBack = slow ? 0.02 * (1 - F.fan) : 0.02;
      if (cool < target) cool += (target - cool) / tau;
      else cool += (target - cool) * pullBack;
      if (F.fan > 0 && slow && cool >= target - 1) cool += 0.07 * F.fan;
      if (cool > 116) cool = 116;
      var volt = s < 3 ? 12.2 : 14.1 - 1.7 * F.alt - 0.0004 * s * F.alt - (idle ? 0.15 * F.alt : 0) + rnd() * 0.25;
      o.speed.push(Math.max(0, v + rnd() * 0.4)); o.rpm.push(rpm); o.throttle.push(thr + rnd()); o.load.push(load);
      o.maf.push(mafTrue * (1 - 0.18 * F.maf) + rnd() * 0.3); o.map.push(map);
      o.coolant.push(cool + rnd() * 0.6); o.iat.push(amb + 4 + 10 * (1 - Math.exp(-s / 260)) + rnd() * 0.5);
      o.stft.push(stft); o.ltft.push(ltft); o.volt.push(volt);
    }
    return o;
  }
  var SIMCOLS = { coolant: "Coolant Temp (C)", rpm: "Engine RPM (rpm)", speed: "Vehicle Speed (km/h)", throttle: "Throttle Position (%)", load: "Engine Load (%)", maf: "MAF (g/s)", map: "Intake Manifold Pressure (kPa)", stft: "Short Term Fuel Trim B1 (%)", ltft: "Long Term Fuel Trim B1 (%)", volt: "Control Module Voltage (V)", iat: "Intake Air Temp (C)" };
  function simToDs(o, name) {
    var ch = {}, cols = [], units = {};
    Object.keys(SIMCOLS).forEach(function (k) { var c = SIMCOLS[k]; ch[c] = o[k]; cols.push(c); var m = /\(([^)]*)\)\s*$/.exec(c); units[c] = m ? m[1] : ""; });
    return { t: o.t, ch: ch, cols: cols, units: units, name: name || "Simulated drive", demo: true };
  }
  function simAnalyze(o) { var ds = simToDs(o); return analyze(ds, autoMap(ds.cols), { tF: false, mph: false, mps: false, mapU: "kPa" }); }

  var SCW = 760, SCH = 120, SML = 52, SMR = 10, SMT = 10, SMB = 22;
  function simChart(k, t, base, now) {
    var all = (base || []).concat(now).filter(isNum), lo = minOf(all), hi = maxOf(all);
    if (hi - lo < 1e-9) { lo -= 1; hi += 1; } var pad = (hi - lo) * 0.08; lo -= pad; hi += pad;
    var pw = SCW - SML - SMR, ph = SCH - SMT - SMB, t0 = t[0], tw = Math.max(t[t.length - 1] - t0, 1);
    function X(x) { return SML + (x - t0) / tw * pw; } function Y(y) { return SMT + (1 - (y - lo) / (hi - lo)) * ph; }
    function path(arr) { var d = [], step = Math.max(1, Math.floor(arr.length / 600)); for (var i = 0; i < arr.length; i += step) if (isNum(arr[i])) d.push((d.length ? "L" : "M") + X(t[i]).toFixed(1) + " " + Y(arr[i]).toFixed(1)); return d.join(""); }
    var grid = "", ylab = "";
    [0, 0.5, 1].forEach(function (f) { var yv = lo + pad + (hi - lo - 2 * pad) * f, y = Y(yv).toFixed(1); grid += '<line class="grid" x1="' + SML + '" x2="' + (SCW - SMR) + '" y1="' + y + '" y2="' + y + '"/>'; ylab += '<text x="' + (SML - 6) + '" y="' + (+y + 4) + '" text-anchor="end">' + niceVal(k, yv) + "</text>"; });
    var xl = (SCW < 500 ? [0, 600, 1200] : [0, 300, 600, 900, 1200]).map(function (s) { return '<text x="' + X(s).toFixed(1) + '" y="' + (SCH - 5) + '" text-anchor="' + (s === 0 ? "start" : (s === 1200 ? "end" : "middle")) + '">' + fmtT(s) + "</text>"; }).join("");
    return '<svg viewBox="0 0 ' + SCW + " " + SCH + '" role="img" aria-label="' + esc(roleLabel(k)) + ': healthy car versus your setup">' + grid + ylab + xl +
      (base ? '<path class="trace base" d="' + path(base) + '"/>' : "") + '<path class="trace" d="' + path(now) + '"/><line class="cur" x1="0" x2="0" y1="' + SMT + '" y2="' + (SCH - SMB) + '"/></svg>';
  }
  var simCache = { base: null, now: null, res: null };
  function simUnit(k) { return { coolant: "°C", rpm: "rpm", speed: "km/h", stft: "%", ltft: "%", volt: "V", map: "kPa", maf: "g/s" }[k]; }
  function simRun() {
    var F = sim.mode === "mystery" && sim.mystery ? sim.mystery.f : sim.f, route = sim.mode === "mystery" && sim.mystery ? sim.mystery.route : sim.route;
    var zero = {}; FAULTS.forEach(function (x) { zero[x.k] = 0; });
    simCache.base = simDrive(route, sim.amb, zero, 777); simCache.now = simDrive(route, sim.amb, F, 777);
    simCache.res = simAnalyze(simCache.now);
    SCW = Math.max(320, Math.min(760, ($("simCharts").clientWidth || 760) - 22));
    $("simCharts").innerHTML = SIMKEYS.filter(function (k) { return sim.show[k]; }).map(function (k) {
      return '<div class="chart" data-sk="' + k + '"><div class="chead"><span class="nm">' + esc(roleLabel(k)) + " (" + simUnit(k) + ')</span><span class="cv">hover or touch to read</span></div>' + simChart(k, simCache.base.t, (sim.mode === "mystery" && sim.mystery && !sim.mystery.hint && !sim.mystery.done) ? null : simCache.base[k], simCache.now[k]) + "</div>";
    }).join("");
    var fs = simCache.res.finds;
    $("simFinds").innerHTML = fs.map(function (f) { return '<li><span class="pill ' + f.level + '">' + ({ ok: "Good", watch: "Watch", concern: "Concern", info: "Note" })[f.level] + "</span><b>" + esc(f.title) + "</b>" + (f.detail ? '<span class="d">' + esc(f.detail) + "</span>" : "") + "</li>"; }).join("");
    var active = FAULTS.filter(function (x) { return sim.f[x.k] > 0; });
    $("simWhy").innerHTML = sim.mode === "mystery" ? "" : (active.length ? active.map(function (x) { return '<div class="note calm"><b>' + esc(x.n) + " at " + Math.round(sim.f[x.k] * 100) + "%.</b> " + esc(x.how) + "</div>"; }).join("") : '<p class="lede">The car is healthy. Drag a fault slider and watch the solid line pull away from the dashed healthy line.</p>');
  }
  function renderSim() {
    var m = sim.mode === "mystery";
    $("simModeS").setAttribute("aria-pressed", String(!m)); $("simModeM").setAttribute("aria-pressed", String(m));
    $("simControls").hidden = m; $("simMystery").hidden = !m;
    $("simFaults").innerHTML = FAULTS.map(function (x) { var v = Math.round(sim.f[x.k] * 100); return '<div class="fault"><label for="sf-' + x.k + '"><b>' + esc(x.n) + '</b> <span class="status" id="sfv-' + x.k + '">' + (v ? v + "%" : "off") + '</span></label><span class="lede" style="font-size:13.5px">' + esc(x.d) + '</span><input type="range" id="sf-' + x.k + '" data-fault="' + x.k + '" min="0" max="100" step="5" value="' + v + '"></div>'; }).join("");
    $("simShow").innerHTML = SIMKEYS.map(function (k) { return '<label><input type="checkbox" data-simshow="' + k + '"' + (sim.show[k] ? " checked" : "") + "> " + esc(roleLabel(k)) + "</label>"; }).join("");
    var st = acad().sim || { played: 0, correct: 0 };
    $("simScore").textContent = st.played ? st.correct + " of " + st.played + " mysteries solved" : "No mysteries played yet";
    simRun();
  }
  var simTimer = null;
  function simSoon() { if (simTimer) return; simTimer = setTimeout(function () { simTimer = null; simRun(); }, 60); }
  function newMystery() {
    var pool = FAULTS.map(function (x) { return x.k; }).concat(["none"]), pick = pool[Math.floor(Math.random() * pool.length)];
    var f = {}; FAULTS.forEach(function (x) { f[x.k] = 0; }); if (pick !== "none") f[pick] = 0.6 + Math.random() * 0.4;
    var route = pick === "fan" ? "traffic" : (pick === "boost" ? (Math.random() < 0.5 ? "highway" : "mixed") : ["mixed", "city", "highway", "traffic"][Math.floor(Math.random() * 4)]);
    sim.mystery = { f: f, route: route, answer: pick, done: false, hint: false };
    $("simHint").disabled = false;
    $("simQ").innerHTML = '<p class="lede">Route: <b>' + esc(ROUTES[route]) + '</b>. Read the charts and the findings, then name the fault. Solving it without the healthy reference earns 40 XP, and 25 with it.</p><fieldset class="quizset"><legend>What is wrong with this car?</legend>' +
      FAULTS.map(function (x) { return '<label><input type="radio" name="simAns" value="' + x.k + '"> ' + esc(x.n) + "</label>"; }).join("") + '<label><input type="radio" name="simAns" value="none"> Nothing, the car is healthy</label></fieldset>';
    $("simRes").textContent = ""; $("simReveal").hidden = true; $("simGuess").disabled = false;
    simRun();
  }
  function guessMystery() {
    var M = sim.mystery; if (!M || M.done) return;
    var sel = document.querySelector('input[name="simAns"]:checked'); if (!sel) { $("simRes").textContent = "Pick an answer first."; return; }
    M.done = true; $("simGuess").disabled = true;
    var A = acad(); A.sim = A.sim || { played: 0, correct: 0 }; A.sim.played++;
    var right = sel.value === M.answer, fx = FAULTS.filter(function (x) { return x.k === M.answer; })[0];
    if (right) { A.sim.correct++; if (!M.hint) A.sim.clean = (A.sim.clean || 0) + 1; }
    save(); $("hudRank").textContent = "Lv " + rankFor(xpTotal()).lvl;
    $("simRes").textContent = right ? (M.hint ? "Correct. +25 XP." : "Correct without the hint. +40 XP.") : "Not this time. It was: " + (fx ? fx.n : "nothing, a healthy car") + ".";
    $("simHint").disabled = true; simRun();
    $("simReveal").hidden = false;
    $("simReveal").innerHTML = '<div class="note calm"><b>' + esc(fx ? fx.n + " at " + Math.round(M.f[M.answer] * 100) + "%" : "Healthy car") + ".</b> " + esc(fx ? fx.how : "Every line stays on top of the healthy baseline. A good log is the reference that makes future problems stand out.") + "</div>";
    var st = A.sim; $("simScore").textContent = st.correct + " of " + st.played + " mysteries solved";
  }
  function simCursor(clientX, el) {
    var svg = el.querySelector("svg"); if (!svg || !simCache.base) return;
    var rect = svg.getBoundingClientRect(), xv = (clientX - rect.left) / rect.width * SCW;
    var frac = Math.max(0, Math.min(1, (xv - SML) / (SCW - SML - SMR))), idx = Math.round(frac * 1200), x = SML + frac * (SCW - SML - SMR);
    document.querySelectorAll("#simCharts .chart").forEach(function (c) {
      var k = c.getAttribute("data-sk"), cur = c.querySelector(".cur"), cv = c.querySelector(".cv");
      if (cur) { cur.setAttribute("x1", x); cur.setAttribute("x2", x); cur.style.opacity = 1; }
      var hideBase = sim.mode === "mystery" && sim.mystery && !sim.mystery.hint && !sim.mystery.done;
      if (cv) cv.textContent = fmtT(idx) + (hideBase ? "  " : "  healthy " + niceVal(k, simCache.base[k][idx]) + " · this car ") + niceVal(k, simCache.now[k][idx]);
    });
  }
  function wireSim() {
    $("p-sim").addEventListener("input", function (e) {
      var t = e.target;
      if (t.hasAttribute("data-fault")) { var v = +t.value / 100; sim.f[t.getAttribute("data-fault")] = v; $("sfv-" + t.getAttribute("data-fault")).textContent = v ? Math.round(v * 100) + "%" : "off"; simSoon(); }
      if (t.id === "simAmb") { sim.amb = +t.value; $("simAmbV").textContent = t.value + " °C / " + Math.round(t.value * 1.8 + 32) + " °F"; simSoon(); }
    });
    $("p-sim").addEventListener("change", function (e) {
      var t = e.target;
      if (t.id === "simRoute") { sim.route = t.value; simRun(); }
      if (t.hasAttribute("data-simshow")) { sim.show[t.getAttribute("data-simshow")] = t.checked; simRun(); }
    });
    $("simModeS").addEventListener("click", function () { sim.mode = "sandbox"; renderSim(); });
    $("simModeM").addEventListener("click", function () { sim.mode = "mystery"; renderSim(); newMystery(); });
    $("simNext").addEventListener("click", newMystery);
    $("simHint").addEventListener("click", function () { if (!sim.mystery || sim.mystery.done) return; sim.mystery.hint = true; this.disabled = true; simRun(); });
    $("simGuess").addEventListener("click", guessMystery);
    $("simReset").addEventListener("click", function () { FAULTS.forEach(function (x) { sim.f[x.k] = 0; }); renderSim(); });
    $("simToLab").addEventListener("click", function () { if (!simCache.now) return; loadDataset(simToDs(simCache.now, "Simulated drive"), "Simulated drive"); showTab("lab"); });
    $("simCharts").addEventListener("pointermove", function (ev) { var c = ev.target.closest ? ev.target.closest(".chart") : null; if (c) simCursor(ev.clientX, c); });
    $("simCharts").addEventListener("pointerleave", function () { document.querySelectorAll("#simCharts .chart").forEach(function (c) { var cur = c.querySelector(".cur"); if (cur) cur.style.opacity = 0; var cv = c.querySelector(".cv"); if (cv) cv.textContent = "hover or touch to read"; }); });
  }

  /* ================= MY V60: build, recalls, verified data, photos ================= */
  var BUILD = [
    ["Model", "2016 Volvo V60 wagon, Premier trim (SV33)"],
    ["Engine", "B4204T11, 2.0 L four-cylinder turbo, Drive-E family"],
    ["Rated power", "240 hp"],
    ["Emissions / features", "ULEV, engine stop/start"],
    ["Drive", "Front-wheel drive"],
    ["Transmission", "8-speed automatic"],
    ["Tire pressure monitoring", "Indirect (no sensors in the wheels; compares wheel speeds)"],
    ["Built", "Volvo Cars Torslanda plant, Sweden"],
    ["Airbags", "Front, seat-cushion (front) and curtain (rows 1 and 2)"]
  ];
  var RECALLS = [
    { id: "R10029", nhtsa: "20V378000", t: "Front seat belt anchor cable", d: "The flexible steel cable connecting the front seat belts can fatigue over time and fail to hold an occupant in a crash. Dealers replace the anchor cable on both front seats." },
    { id: "R89978", nhtsa: "19V849000", t: "Door latches", d: "A part inside the door latches can break, so a door may seem closed when it is not latched. Dealers replace all four door latches." },
    { id: "R89708", nhtsa: "16V798000", t: "Front passenger seat belt buckle stud", d: "Applies to cars built Feb 16, 2015 to Aug 22, 2016. The buckle's attaching stud can loosen. Dealers inspect it and replace the buckle if needed." },
    { id: "R39574", nhtsa: "15V555000", t: "Starter motor fuse (stop/start)", d: "Applies to cars built Apr 8 to Aug 19, 2015. The starter fuse can blow during stop/start, so the car will not restart. Dealers fit a higher-amperage fuse." }
  ];
  var PHOTO_KINDS = [["bay", "Engine bay overview"], ["sidewall", "Tire sidewall (DOT code)"], ["tread", "Tire tread"], ["brake", "Brake pad or rotor"], ["fluid", "Fluid reservoir"], ["leak", "Leak or underside"], ["dash", "Dashboard warning or message"], ["other", "Something else"]];
  var assetsNs = null, sampleImg = false, photoBusy = false;

  function renderMy() {
    $("buildBody").innerHTML = BUILD.map(function (r) { return "<dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd>"; }).join("");
    var rs = state.recalls || {};
    $("recallList").innerHTML = RECALLS.map(function (r) {
      var v = rs[r.id] || "unknown";
      return '<li><span class="pill ' + ({ unknown: "watch", open: "concern", done: "ok", na: "info" })[v] + '">' + ({ unknown: "Check", open: "Open", done: "Done", na: "N/A" })[v] + '</span><b>' + esc(r.t) + ' <span class="status">Volvo ' + r.id + " · NHTSA " + r.nhtsa + '</span></b><span class="d">' + esc(r.d) + '</span><span class="d"><label class="status" for="rc-' + r.id + '">Status for my car</label> <select id="rc-' + r.id + '" data-recall="' + r.id + '"><option value="unknown"' + (v === "unknown" ? " selected" : "") + '>Not checked</option><option value="done"' + (v === "done" ? " selected" : "") + '>Completed</option><option value="open"' + (v === "open" ? " selected" : "") + '>Open, needs a dealer</option><option value="na"' + (v === "na" ? " selected" : "") + ">Does not apply to my VIN</option></select></span></li>";
    }).join("");
    var sp = state.specs || [];
    $("specBody").innerHTML = sp.length ? sp.map(function (x) { return "<tr><td>" + esc(x.k) + '</td><td class="num">' + esc(x.v) + "</td><td>" + esc(x.src || "") + '</td><td class="num">' + esc(x.date || "") + "</td><td>" + delBtn("spec", x.id) + "</td></tr>"; }).join("") : '<tr><td colspan="5" class="empty">Nothing yet. When you look something up in Volvo\'s service system, in a shop invoice or on a part, record it here so it outranks every generic number on this page.</td></tr>';
    renderPhotos();
  }
  function recallActions(actions) {
    var rs = state.recalls || {}, open = RECALLS.filter(function (r) { return rs[r.id] === "open"; }), unk = RECALLS.filter(function (r) { return !rs[r.id] || rs[r.id] === "unknown"; });
    if (open.length) actions.push({ sev: 92, text: open.length + " open safety recall" + (open.length > 1 ? "s" : "") + " (" + open.map(function (r) { return r.t.toLowerCase(); }).join(", ") + "). Free at any Volvo dealer.", jump: "tab:my" });
    else if (unk.length) actions.push({ sev: 60, text: unk.length + " safety recall" + (unk.length > 1 ? "s" : "") + " for 2016 V60s not yet checked against your VIN. Two involve seat belts.", jump: "tab:my" });
  }

  /* photos */
  var localUrls = {};
  function idb() {
    return new Promise(function (res, rej) {
      if (!window.indexedDB) { rej(new Error("no idb")); return; }
      var rq = indexedDB.open("v60-garage", 1);
      rq.onupgradeneeded = function () { rq.result.createObjectStore("blobs"); };
      rq.onsuccess = function () { res(rq.result); }; rq.onerror = function () { rej(rq.error); };
    });
  }
  function localAssets() {
    return {
      local: true,
      upload: function (blob) { var id = "L" + uid(); return idb().then(function (db) { return new Promise(function (res, rej) { var tx = db.transaction("blobs", "readwrite"); tx.objectStore("blobs").put(blob, id); tx.oncomplete = function () { localUrls[id] = URL.createObjectURL(blob); res({ id: id, url: localUrls[id], local: true, sizeBytes: blob.size, contentType: blob.type }); }; tx.onerror = function () { rej({ code: "quota_exceeded" }); }; }); }); },
      delete: function (id) { return idb().then(function (db) { var tx = db.transaction("blobs", "readwrite"); tx.objectStore("blobs").delete(id); }); }
    };
  }
  function loadLocalBlobs() {
    var want = (state.photos || []).filter(function (p) { return p.local && !localUrls[p.asset]; });
    if (!want.length) return Promise.resolve();
    return idb().then(function (db) { return Promise.all(want.map(function (p) { return new Promise(function (res) { var g = db.transaction("blobs").objectStore("blobs").get(p.asset); g.onsuccess = function () { if (g.result) localUrls[p.asset] = URL.createObjectURL(g.result); res(); }; g.onerror = function () { res(); }; }); })); }).catch(function () {});
  }
  function photoUrl(p) { if (p.local) return localUrls[p.asset] || ""; return p.url || ("/_blob/" + p.asset); }
  function kindName(k) { var f = PHOTO_KINDS.filter(function (x) { return x[0] === k; })[0]; return f ? f[1] : k; }
  function renderPhotos() {
    var list = (state.photos || []).slice().reverse(), filt = $("phFilter") ? $("phFilter").value : "";
    if (filt) list = list.filter(function (p) { return p.kind === filt; });
    $("phGallery").innerHTML = list.length ? list.map(function (p) {
      var a = p.ai || {}, part = p.part ? partById(p.part) : null;
      return '<article class="ph"><img src="' + esc(photoUrl(p)) + '" alt="' + esc(kindName(p.kind)) + ' photo from ' + esc(p.date) + '" loading="lazy"><div class="phb">' +
        '<div class="row" style="gap:6px"><span class="pill ' + ({ ok: "ok", watch: "watch", act: "concern" }[a.concern] || "info") + '">' + esc(({ ok: "Looks OK", watch: "Watch", act: "Act" })[a.concern] || "Saved") + '</span><span class="status">' + esc(p.date) + " · " + esc(kindName(p.kind)) + (part ? " · " + esc(part.name) : "") + "</span></div>" +
        (a.summary ? "<p><b>" + esc(a.summary) + "</b></p>" : "") +
        (a.observations && a.observations.length ? '<ul class="plain">' + a.observations.slice(0, 6).map(function (o) { return "<li>" + esc(o) + "</li>"; }).join("") + "</ul>" : "") +
        (a.dot ? '<p class="status">DOT date code ' + esc(a.dot) + (dotAge(a.dot) != null ? ", about " + dotAge(a.dot).toFixed(1) + " years old" : "") + "</p>" : "") +
        (a.next && a.next.length ? '<p class="status">Next: ' + esc(a.next.slice(0, 3).join(" · ")) + "</p>" : "") +
        (a.confidence ? '<p class="status">Claude\'s confidence: ' + esc(a.confidence) + ". A photo is not an inspection.</p>" : "") +
        (p.note ? '<p class="status">Note: ' + esc(p.note) + "</p>" : "") +
        '<div class="row" style="gap:6px">' + (part && isNum(a.rating) ? '<button type="button" class="quiet" data-phrate="' + p.id + '">Rate ' + esc(part.name) + " " + a.rating + "/5</button>" : "") + (assetsNs ? '<button type="button" class="quiet" data-phdel="' + p.id + '">Delete</button>' : "") + "</div></div></article>";
    }).join("") : '<p class="empty">No photos yet.' + (assetsNs ? " Take the first one above." : "") + "</p>";
  }
  function dotAge(code) { var m = /^(\d{2})(\d{2})$/.exec(String(code || "")); if (!m) return null; var wk = +m[1], yr = 2000 + +m[2], now = new Date(); if (wk < 1 || wk > 53) return null; return now.getFullYear() + now.getMonth() / 12 - (yr + (wk - 1) / 52); }
  function shrink(file, kind) {
    /* every photo is read and redacted on the device first (scan.js); tests and the scanner itself can skip it */
    if (window.V60_SCAN && !window.__V60_NOSCAN && !(kind && kind.raw)) return window.V60_SCAN.process(file, kind || "photo").then(function (r) { return r.blob; });
    return new Promise(function (res, rej) {
      var img = new Image(), u = URL.createObjectURL(file);
      img.onload = function () {
        var M = 1600, w = img.naturalWidth, h = img.naturalHeight, s = Math.min(1, M / Math.max(w, h)), c = document.createElement("canvas");
        c.width = Math.round(w * s); c.height = Math.round(h * s); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(u); c.toBlob(function (b) { b ? res(b) : rej(new Error("encode")); }, "image/jpeg", 0.85);
      };
      img.onerror = function () { URL.revokeObjectURL(u); rej(new Error("That image could not be read. Try a JPEG or PNG.")); };
      img.src = u;
    });
  }
  function aiPrompt(kind, partName, note) {
    return "You are helping the owner of one specific car inspect it from a photo. Car: 2016 Volvo V60 T5 wagon, Premier trim, engine B4204T11 2.0 L turbo four-cylinder (Drive-E), front-wheel drive, 8-speed automatic, about 95,000 miles, indirect tire-pressure monitoring (no wheel sensors). The owner is a beginner.\n" +
      "Photo type: " + kindName(kind) + (partName ? ". Part of interest: " + partName : "") + (note ? ". Owner's note: " + note : "") + ".\n" +
      "Look only at what is visible. Do not guess hidden details. If the photo is unclear, say so and say how to retake it.\n" +
      "Return JSON only, with these keys: summary (one sentence), observations (array of short strings, at most 6), dot (the last four digits of a tire DOT code if clearly readable, else null), rating (1 to 5 condition of the part of interest if judgeable from the photo, where 5 is like new and 1 is failed, else null), concern (\"ok\", \"watch\", \"act\" or \"unknown\"), next (array of at most 3 short next steps), confidence (\"low\", \"medium\" or \"high\").";
  }
  function takePhoto(file) {
    if (photoBusy || !file) return;
    photoBusy = true; $("phStatus").textContent = "Preparing photo...";
    var kind = $("phKind").value, partId = $("phPart").value, note = $("phNote").value.trim(), part = partId ? partById(partId) : null, blob;
    shrink(file, kind).then(function (b) {
      blob = b; $("phPreview").src = URL.createObjectURL(b); $("phPreview").hidden = false;
      $("phStatus").textContent = "Saving photo...";
      return assetsNs.upload(b, { name: "v60-" + kind + "-" + todayStr() + ".jpg" }).catch(function (e) { throw new Error(e && e.code === "quota_exceeded" ? "Photo storage is full. Delete old photos first." : "The photo could not be saved (" + ((e && e.code) || "error") + ")."); });
    }).then(function (up) {
      var rec = { id: uid(), asset: up.id, url: up.local ? null : up.url, local: !!up.local, date: todayStr(), kind: kind, part: partId || null, note: note.slice(0, 200), ai: null };
      state.photos = (state.photos || []).concat([rec]).slice(-200); save(); renderPhotos();
      if (!sampleImg || !sampleFn) { $("phStatus").textContent = up.local ? "Saved on this device. Claude's photo review runs when you open the Garage inside Claude." : "Saved. Claude's photo review is not available in this view."; return; }
      $("phStatus").textContent = "Saved. Claude is looking at it...";
      return sampleFn.json(aiPrompt(kind, part && part.name, note), { images: [blob], cache: false }).then(function (j) {
        var a = { summary: String(j.summary || "").slice(0, 240), observations: (Array.isArray(j.observations) ? j.observations : []).map(String).slice(0, 6), dot: /^\d{4}$/.test(String(j.dot || "")) ? String(j.dot) : null, rating: isNum(j.rating) && j.rating >= 1 && j.rating <= 5 ? Math.round(j.rating) : null, concern: ["ok", "watch", "act"].indexOf(j.concern) >= 0 ? j.concern : "unknown", next: (Array.isArray(j.next) ? j.next : []).map(String).slice(0, 3), confidence: ["low", "medium", "high"].indexOf(j.confidence) >= 0 ? j.confidence : "low" };
        rec.ai = a; save(); renderPhotos();
        $("phStatus").textContent = "Done. Review it below.";
        var acA = acad(); acA.photos = (acA.photos || 0) + 1;
      }).catch(function (e) { $("phStatus").textContent = "Photo saved, but Claude's review failed" + (e && e.code === "rate_limited" ? " (busy, try later)." : (e && e.code === "not_granted" ? " (permission not given)." : ".")); });
    }).catch(function (e) { $("phStatus").textContent = (e && e.message) || "Something went wrong."; })
      .then(function () { photoBusy = false; $("phFile").value = ""; });
  }
  function initPhotos() {
    $("phKind").innerHTML = PHOTO_KINDS.map(function (k) { return '<option value="' + k[0] + '">' + esc(k[1]) + "</option>"; }).join("");
    $("phFilter").innerHTML = '<option value="">All photos</option>' + PHOTO_KINDS.map(function (k) { return '<option value="' + k[0] + '">' + esc(k[1]) + "</option>"; }).join("");
    $("phPart").innerHTML = '<option value="">No specific part</option>' + PARTS.map(function (p) { return '<option value="' + p.id + '">' + esc(p.name) + "</option>"; }).join("");
    $("phKind").addEventListener("change", function () { var m = { sidewall: "age", tread: "tread", brake: "pads", fluid: "coolant", bay: "" }[this.value]; if (m != null) $("phPart").value = m; });
    $("phFile").addEventListener("change", function () { takePhoto(this.files && this.files[0]); });
    $("phFilter").addEventListener("change", renderPhotos);
    $("phGallery").addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("button") : null; if (!b) return;
      var rid = b.getAttribute("data-phrate"), did = b.getAttribute("data-phdel");
      if (rid) { var p = (state.photos || []).filter(function (x) { return x.id === rid; })[0]; if (p && p.ai && p.part) { state.rate[p.part] = { r: p.ai.rating, d: p.date, n: ("Photo review: " + (p.ai.summary || "")).slice(0, 200) }; save(); renderAll(); b.textContent = "Rated"; } }
      if (did) {
        if (b.getAttribute("data-armed") !== "1") { b.setAttribute("data-armed", "1"); b.textContent = "Tap again to delete"; return; }
        var q = (state.photos || []).filter(function (x) { return x.id === did; })[0]; if (!q) return;
        state.photos = state.photos.filter(function (x) { return x.id !== did; }); save(); renderPhotos();
        if (assetsNs && q.asset) assetsNs.delete(q.asset).catch(function () {});
      }
    });
    $("p-my").addEventListener("change", function (e) { var r = e.target.getAttribute && e.target.getAttribute("data-recall"); if (r) { state.recalls = state.recalls || {}; state.recalls[r] = e.target.value; save(); renderMy(); renderHealth(); } });
    $("specForm").addEventListener("submit", function (ev) {
      ev.preventDefault(); var k = $("spK").value.trim(), v = $("spV").value.trim(); if (!k || !v) return;
      state.specs = (state.specs || []).concat([{ id: uid(), k: k.slice(0, 80), v: v.slice(0, 120), src: $("spS").value.trim().slice(0, 80), date: todayStr() }]).slice(-200);
      $("spK").value = ""; $("spV").value = ""; save(); renderMy();
    });
    claudeUse("assets").then(function (a) { assetsNs = a || (window.indexedDB ? localAssets() : null); $("phTake").hidden = !assetsNs; $("phNoStore").hidden = !!assetsNs; loadLocalBlobs().then(function () { renderPhotos(); if (ui.tab === "engine") renderEngine(); }); }).catch(function () { assetsNs = window.indexedDB ? localAssets() : null; $("phTake").hidden = !assetsNs; });
    claudeUse("sample").then(function (s) { if (!s || !s.limits) return null; return s.limits().then(function (l) { sampleImg = !!(l && l.images); }); }).catch(function () {});
  }

  /* ================= ENGINE BAY EXPLORER ================= */
  /* Top-down, front bumper at the top, driver side on the left. conf: "volvo" = position from Volvo's manual,
     "third" = third-party source, "approx" = exists on this car but position not confirmed. */
  var BAYITEMS = [
    { id: "radiator", n: "Radiator and cooling fan", conf: "volvo", part: "radiator", sh: '<rect x="120" y="44" width="360" height="22" rx="4"/><circle cx="300" cy="86" r="16" class="fan"/>', at: [300, 55], d: "Air through the grille, and the electric fan when you are slow or stopped, pulls heat out of the coolant here.", can: "Look for leaves or debris across the front and for crusty coolant stains. Never open anything here hot.", game: true },
    { id: "catch", n: "Hood safety catch", conf: "volvo", sh: '<rect x="352" y="22" width="26" height="10" rx="3"/>', at: [365, 27], d: "The second latch that stops the hood flying up if the main latch releases. Push it to the left to lift the hood.", can: "Feel under the front right edge of the hood after pulling the handle inside.", game: true },
    { id: "washer", n: "Washer fluid filler", conf: "volvo", part: "wipers", sh: '<circle cx="78" cy="118" r="17"/>', at: [78, 118], d: "Fills the windshield (and headlight, if fitted) washer tank. It holds 6.8 quarts with headlight washers or 4.7 without.", can: "The one fluid you can always top up yourself. Use washer fluid, not plain water, so it does not grow algae or freeze.", game: true },
    { id: "fusebox", n: "Fuse and relay box", conf: "third", part: "modules", sh: '<rect x="58" y="146" width="104" height="34" rx="5"/>', at: [110, 163], d: "Fuses protect each circuit. Start/stop cars also have a second fuse box near the cowl.", can: "The lid shows a map of what each fuse protects. Only swap a fuse for one of the same rating.", game: true },
    { id: "battery", n: "12 V battery (under covers)", conf: "volvo", part: "battery", sh: '<rect x="58" y="190" width="104" height="80" rx="6"/><path d="M84 214h16M92 206v16M124 214h16" class="mark"/>', at: [110, 230], d: "The starter battery sits in the engine bay under a front and rear cover. Start/stop cars like yours also carry a small support battery, and replacements must be AGM.", can: "Look for white crust on the terminals. A parts store can test it free. Heat shortens battery life, so 3 to 5 years is common in Texas.", game: true },
    { id: "brake", n: "Brake fluid reservoir", conf: "volvo", part: "bfluid", sh: '<rect x="96" y="320" width="54" height="40" rx="8"/>', at: [123, 340], d: "Feeds the brakes. The level drops slowly as the pads wear. A sudden drop means a leak.", can: "Check it is between MIN and MAX with the cap closed. Do not just top it up if it is low; get the brakes looked at. Volvo replaces it every other year.", game: true },
    { id: "engine", n: "Engine, B4204T11", conf: "volvo", part: "pistons", sh: '<rect x="186" y="150" width="252" height="146" rx="14" class="block"/><rect x="206" y="166" width="212" height="114" rx="10" class="cover"/>', at: [312, 223], d: "A 2.0 liter turbo four-cylinder mounted sideways (transverse). The plastic top cover hides the ignition coils and spark plugs.", can: "With the engine off and cold, look for oil wetness around the edges and cracked hoses. Do not touch the coils or plugs with the engine on.", game: false },
    { id: "oilcap", n: "Engine oil filler cap", conf: "approx", part: "oilfilter", sh: '<circle cx="270" cy="196" r="13"/>', at: [270, 196], d: "Where oil goes in. There is no dipstick on this engine; you read the level in the instrument cluster.", can: "Add oil only after the cluster says it is low, a little at a time. Use Volvo-approved full synthetic: 5W-30 ACEA A5/B5, or Volvo's 0W-20. Capacity is 6.2 quarts with the filter. Never overfill.", game: false },
    { id: "coils", n: "Ignition coils and spark plugs", conf: "approx", part: "coils", sh: '<rect x="290" y="214" width="12" height="22" rx="2"/><rect x="314" y="214" width="12" height="22" rx="2"/><rect x="338" y="214" width="12" height="22" rx="2"/><rect x="362" y="214" width="12" height="22" rx="2"/>', at: [332, 225], d: "One coil per cylinder fires each spark plug. A failing coil causes a misfire and a shaky idle.", can: "Volvo warns not to touch these with the engine running or hot. Plug and coil work is a later-stage DIY.", game: false },
    { id: "belt", n: "Timing belt end", conf: "approx", part: "timing", sh: '<rect x="438" y="160" width="26" height="126" rx="6" class="belt"/>', at: [451, 223], d: "The timing belt runs at the end of the engine under a cover. On this engine a snapped belt usually destroys it, and the limit is around 10 years.", can: "Nothing to check by eye without removing covers. Look for a shop sticker with the replacement date nearby.", game: false },
    { id: "ground", n: "Jump-start ground point", conf: "volvo", part: "battery", sh: '<circle cx="492" cy="196" r="11"/><path d="M486 196h12M492 190v12" class="mark"/>', at: [492, 196], d: "The negative clamp of jumper cables goes on the outer screw head on top of the right-hand (passenger side) engine mount, not on the battery.", can: "Positive clamp on the battery's plus terminal after removing its front cover, negative here. Volvo's manual has the full order.", game: true },
    { id: "coolant", n: "Coolant expansion tank", conf: "volvo", part: "coolant", sh: '<rect x="470" y="300" width="66" height="44" rx="10"/>', at: [503, 322], d: "Volvo's manual places it on the passenger side of the engine bay: a translucent tank with MIN and MAX marks. The cooling system is pressurized when hot.", can: "Check the level cold only. Use Volvo coolant mixed 50/50. Never open it hot.", game: false },
    { id: "airbox", n: "Engine air filter box", conf: "approx", part: "airfilter", sh: '<rect x="468" y="88" width="84" height="56" rx="10"/>', at: [510, 116], d: "Holds the engine air filter. Everything the turbo breathes passes through here first.", can: "Open the clips, lift the filter, hold it to light. Reseat it carefully so no dirt gets past it.", game: false }
  ];
  var BAYLAYERS = [
    { k: "cool", n: "Cooling loop", c: "flow-cool", d: '<path d="M210 66 C210 110 225 140 236 150"/><path d="M400 66 C400 110 392 140 388 150"/><path d="M438 280 C468 300 480 310 490 318" class="approx"/>', t: "Coolant leaves the engine hot, passes through the radiator to shed heat, and returns cooler. The expansion tank gives it room to expand." },
    { k: "air", n: "Air path", c: "flow-air", d: '<path d="M510 88 C510 60 470 40 440 70 C420 100 440 130 420 150" class="approx"/>', t: "Air enters through the filter box, the turbo compresses it, an intercooler cools it, and the throttle meters it into the engine. Positions here are approximate." },
    { k: "elec", n: "Electrical", c: "flow-elec", d: '<path d="M110 190 L110 180"/><path d="M162 230 C185 230 190 230 200 232"/><path d="M162 200 C300 120 430 140 486 190"/>', t: "The battery feeds the fuse box, which feeds every circuit. The alternator on the engine recharges the battery while you drive." },
    { k: "check", n: "Things you can check", c: "", d: "", t: "Highlighted: the fluids and parts a beginner can safely check. Oil level is read in the instrument cluster, not under the hood." }
  ];
  var BAYLABELS = { radiator: [300, 60, "middle", "Radiator"], catch: [344, 31, "end", "Hood catch"], washer: [100, 123, "start", "Washer fluid"], fusebox: [110, 168, "middle", "Fuses"], battery: [110, 256, "middle", "Battery"], brake: [156, 345, "start", "Brake fluid"], engine: [312, 272, "middle", "Engine"], oilcap: [287, 191, "start", "Oil cap"], coils: [332, 252, "middle", "Coils"], belt: [451, 304, "middle", "Timing belt"], ground: [492, 224, "middle", "Ground"], coolant: [503, 364, "middle", "Coolant tank"], airbox: [510, 160, "middle", "Air box"] };
  var CHECKABLE = { washer: 1, brake: 1, coolant: 1, battery: 1, airbox: 1, radiator: 1 };
  var eb = { sel: null, layers: { labels: true }, game: null, mode: "draw", pinFor: null };

  function bayData() { if (!state.bayMap) state.bayMap = { photo: null, pins: {} }; return state.bayMap; }
  function renderEngine() {
    var mp = bayData(), photo = mp.photo ? (state.photos || []).filter(function (p) { return p.id === mp.photo; })[0] : null;
    var bayPhotos = (state.photos || []).filter(function (p) { return p.kind === "bay"; });
    $("ebMode").innerHTML = '<button type="button" class="quiet" data-ebmode="draw" aria-pressed="' + (eb.mode === "draw") + '">Diagram</button><button type="button" class="quiet" data-ebmode="photo" aria-pressed="' + (eb.mode === "photo") + '">My photo</button>';
    $("ebLayers").innerHTML = '<label><input type="checkbox" data-eblayer="labels"' + (eb.layers.labels ? " checked" : "") + "> Labels</label>" + BAYLAYERS.map(function (l) { return '<label><input type="checkbox" data-eblayer="' + l.k + '"' + (eb.layers[l.k] ? " checked" : "") + "> " + esc(l.n) + "</label>"; }).join("");
    $("ebLayers").hidden = eb.mode !== "draw";
    if (eb.mode === "draw") {
      var items = BAYITEMS.map(function (it) {
        var cls = "bi conf-" + it.conf + (eb.sel === it.id ? " sel" : "") + (eb.layers.check && CHECKABLE[it.id] ? " chk" : "");
        return '<g class="' + cls + '" data-bi="' + it.id + '" role="button" tabindex="0" aria-label="' + esc(it.n) + (it.conf === "approx" ? ", position approximate" : "") + '"><title>' + esc(it.n) + "</title>" + it.sh + (it.conf === "approx" ? '<text class="q" x="' + (it.at[0] + 16) + '" y="' + (it.at[1] - 10) + '">?</text>' : "") + "</g>";
      }).join("");
      var labels = eb.layers.labels && !eb.game ? Object.keys(BAYLABELS).map(function (k) { var L = BAYLABELS[k]; return '<text class="lbl" x="' + L[0] + '" y="' + L[1] + '" text-anchor="' + L[2] + '">' + esc(L[3]) + "</text>"; }).join("") : "";
      var layers = BAYLAYERS.filter(function (l) { return eb.layers[l.k] && l.d; }).map(function (l) { return '<g class="flow ' + l.c + '">' + l.d + "</g>"; }).join("");
      $("ebStage").innerHTML = '<svg viewBox="0 0 600 420" class="ebsvg" role="group" aria-label="Top-down engine bay map, front bumper at the top, driver side on the left">' +
        '<path class="bayshell" d="M40 30 Q300 6 560 30 L572 380 Q300 404 28 380 Z"/>' +
        '<circle class="tower" cx="92" cy="292" r="26"/><circle class="tower" cx="508" cy="250" r="22"/>' +
        '<line class="cowl" x1="34" y1="378" x2="566" y2="378"/>' +
        '<text class="edge" x="160" y="16" text-anchor="middle">Front bumper</text><text class="edge" x="300" y="410" text-anchor="middle">Windshield</text>' +
        '<text class="edge" x="14" y="210" text-anchor="middle" transform="rotate(-90 14 210)">Driver side</text><text class="edge" x="588" y="210" text-anchor="middle" transform="rotate(90 588 210)">Passenger side</text>' +
        items + layers + labels + "</svg>";
      $("ebPhotoTools").hidden = true;
    } else {
      $("ebPhotoTools").hidden = false;
      $("ebPhotoSel").innerHTML = bayPhotos.length ? bayPhotos.map(function (p) { return '<option value="' + p.id + '"' + (mp.photo === p.id ? " selected" : "") + ">Engine bay photo, " + esc(p.date) + "</option>"; }).join("") : '<option value="">No engine bay photos yet</option>';
      if (!photo && bayPhotos.length) { mp.photo = bayPhotos[bayPhotos.length - 1].id; photo = bayPhotos[bayPhotos.length - 1]; }
      $("ebPinSel").innerHTML = '<option value="">Choose a part to pin</option>' + BAYITEMS.map(function (it) { return '<option value="' + it.id + '"' + (eb.pinFor === it.id ? " selected" : "") + ">" + esc(it.n) + (mp.pins[it.id] ? " (pinned)" : "") + "</option>"; }).join("");
      if (!photo) { $("ebStage").innerHTML = '<div class="ebempty"><p><b>Take one photo of your engine bay from the front, hood open, standing at the bumper.</b></p><p class="lede">Then pin each part where it really sits on your car. Your photo becomes the map, and it is exact for your car.</p><button type="button" data-jump="tab:my">Take the photo in My V60</button></div>'; }
      else {
        var pins = Object.keys(mp.pins).map(function (id) { var it = BAYITEMS.filter(function (x) { return x.id === id; })[0]; if (!it) return ""; var xy = mp.pins[id]; return '<button type="button" class="ppin' + (eb.sel === id ? " sel" : "") + '" data-bi="' + id + '" style="left:' + (xy[0] * 100).toFixed(2) + "%;top:" + (xy[1] * 100).toFixed(2) + '%" aria-label="' + esc(it.n) + '"><span>' + esc(it.n) + "</span></button>"; }).join("");
        $("ebStage").innerHTML = '<div class="ebphoto' + (eb.pinFor ? " pinning" : "") + '" id="ebPhotoBox"><img src="' + esc(photoUrl(photo)) + '" alt="Your engine bay">' + pins + "</div>";
      }
      $("ebPinHelp").textContent = eb.pinFor ? "Now tap the photo where it is on your car." : "Pick a part, then tap the photo to place its pin. Tap a pin to read about it.";
    }
    renderEbInfo();
    var g = eb.game;
    $("ebGame").innerHTML = g ? '<div class="note calm"><b>Find: ' + esc(g.target.n) + '</b> <span class="status">' + g.found + " found, " + g.left.length + " to go</span></div>" + (g.msg ? '<p class="status" role="status">' + esc(g.msg) + "</p>" : "") : "";
    $("ebGameBtn").textContent = g ? "Stop the game" : "Play: find it";
    $("ebGameBtn").hidden = eb.mode !== "draw";
    var lt = BAYLAYERS.filter(function (l) { return eb.layers[l.k]; });
    $("ebLayerInfo").innerHTML = eb.mode === "draw" ? lt.map(function (l) { return "<p><b>" + esc(l.n) + ".</b> " + esc(l.t) + "</p>"; }).join("") : "";
  }
  function renderEbInfo() {
    var it = BAYITEMS.filter(function (x) { return x.id === eb.sel; })[0];
    if (!it) { $("ebInfo").innerHTML = '<p class="lede">Tap any part on the map.</p><p class="lede">Not on your car, so do not go looking for them: an oil dipstick (the level is read in the instrument cluster) and a power-steering fluid reservoir (the steering is fully electric).</p>'; return; }
    var src = { volvo: "Position from Volvo's owner's manual.", third: "Position from a third-party source.", approx: "This part is on your car, but its exact position is not confirmed. Pin it on your own photo to make the map exact." }[it.conf];
    var pinned = bayData().pins[it.id];
    $("ebInfo").innerHTML = "<h3>" + esc(it.n) + "</h3><p>" + esc(it.d) + "</p><p><b>What you can do:</b> " + esc(it.can) + '</p><p class="status">' + esc(src) + (pinned ? " Pinned on your photo." : "") + '</p><div class="row">' + (it.part ? '<button type="button" class="quiet" data-jump="part:' + it.part + '">Open in the parts list</button>' : "") + "</div>";
  }
  function ebPick(id) {
    var g = eb.game;
    if (g && eb.mode === "draw") {
      if (id === g.target.id) {
        g.found++; var A = acad(); A.bayFound = A.bayFound || {}; var first = !A.bayFound[id]; A.bayFound[id] = 1; if (first) { save(); $("hudRank").textContent = "Lv " + rankFor(xpTotal()).lvl; }
        g.left = g.left.filter(function (x) { return x.id !== id; });
        if (!g.left.length) { eb.game = null; eb.sel = id; renderEngine(); $("ebGame").innerHTML = '<div class="note calm"><b>All found.</b> You can now point to every confirmed part in your engine bay. Next, check them on the real car with the Academy\'s "Find the key landmarks" mission.</div>'; return; }
        g.target = g.left[Math.floor(Math.random() * g.left.length)]; g.msg = "Correct" + (first ? ", +10 XP." : ".");
      } else { var w = BAYITEMS.filter(function (x) { return x.id === id; })[0]; g.msg = "That is the " + (w ? w.n.toLowerCase() : "wrong part") + ". Try again."; }
      eb.sel = id; renderEngine(); return;
    }
    eb.sel = id; renderEngine();
  }
  function wireEngine() {
    $("p-engine").addEventListener("click", function (e) {
      var t = e.target, b;
      if ((b = t.closest("[data-ebmode]"))) { eb.mode = b.getAttribute("data-ebmode"); eb.game = null; renderEngine(); return; }
      if (t.id === "ebGameBtn") { if (eb.game) eb.game = null; else { var pool = BAYITEMS.filter(function (x) { return x.game; }); eb.game = { left: pool.slice(), found: 0, target: pool[Math.floor(Math.random() * pool.length)], msg: "" }; eb.sel = null; } renderEngine(); return; }
      var box = t.closest("#ebPhotoBox");
      if (box && eb.pinFor && !t.closest(".ppin")) {
        var r = box.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        bayData().pins[eb.pinFor] = [Math.max(0, Math.min(1, x)), Math.max(0, Math.min(1, y))]; eb.sel = eb.pinFor; eb.pinFor = null; save(); renderEngine(); return;
      }
      if ((b = t.closest("[data-bi]"))) { ebPick(b.getAttribute("data-bi")); return; }
      if (t.id === "ebUnpin" && eb.sel) { delete bayData().pins[eb.sel]; save(); renderEngine(); }
    });
    $("p-engine").addEventListener("keydown", function (e) { var g = e.target.closest && e.target.closest("g[data-bi]"); if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); ebPick(g.getAttribute("data-bi")); } });
    $("p-engine").addEventListener("change", function (e) {
      var t = e.target;
      if (t.hasAttribute("data-eblayer")) { eb.layers[t.getAttribute("data-eblayer")] = t.checked; renderEngine(); }
      if (t.id === "ebPinSel") { eb.pinFor = t.value || null; renderEngine(); }
      if (t.id === "ebPhotoSel" && t.value) { bayData().photo = t.value; save(); renderEngine(); }
    });
  }
  /* ================= 12-MONTH BUDGET ================= */
  /* Price ranges are national shop estimates (RepairPal, YourMechanic) and parts prices (FCP Euro, Volvo parts, Batteries Plus), researched Oct 2026. Austin quotes will differ. */
  var COSTS = [
    { k: "timingbelt", n: "Timing belt kit", lo: 740, hi: 990, diy: null, note: "RepairPal's 2016 V60 range is for the belt alone. A full kit with tensioner and idler, which Volvo's schedule calls for, and dealer quotes run much higher. YourMechanic estimates $3,800 to $5,700 at a shop or dealer for a 2015 S60 2.0. Get two quotes.", hard: true },
    { k: "plugs", n: "Spark plugs (4)", lo: 443, hi: 604, diy: 135, note: "Shop range from YourMechanic. The DIY figure is a Volvo four-plug set. Confirm the part fits your engine before buying." },
    { k: "brakefluid", n: "Brake fluid replacement", lo: 110, hi: 161, diy: null, note: "Needs bleeding at each wheel. A shop job for a beginner." },
    { k: "airfilter", n: "Engine air filter", lo: 82, hi: 99, diy: "easy", note: "Shop range from RepairPal. An easy first DIY job: the part is a fraction of that." },
    { k: "cabin", n: "Cabin air filter", lo: 84, hi: 133, diy: "easy", note: "Shop range from RepairPal. Another easy DIY job behind the glovebox area." },
    { k: "oil", n: "Oil and filter change", lo: 185, hi: 213, diy: 95, note: "Shop range from RepairPal. The DIY figure is an oil-and-filter kit, but it needs the car safely raised." },
    { k: "padjob", n: "Brake pads, one axle", lo: 351, hi: 474, diy: null, note: "Only if an inspection finds them worn. A shop range for one axle. Rotors add cost." },
    { k: "battery", n: "12 V AGM battery", lo: 386, hi: 403, diy: 260, note: "Start/stop cars need an AGM battery. Only if a battery test says it is weak." },
    { k: "tires", n: "Set of 4 tires (215/50R17)", lo: 400, hi: 800, diy: null, note: "Tire prices only, before mounting, balancing and disposal. Only if your tires are worn or over about 6 years old." },
    { k: "align", n: "Wheel alignment", lo: 122, hi: 234, diy: null, note: "Usually done with new tires, or if the car pulls or tires wear unevenly." },
    { k: "baseline", n: "Baseline inspection", lo: 220, hi: 322, diy: null, note: "A one-time inspection to learn what you bought as-is. RepairPal's range for a pre-purchase inspection. A Volvo specialist may differ." },
    { k: "tpms", n: "Tire monitor calibration", lo: 0, hi: 0, diy: 0, note: "Free. You do it yourself from the MY CAR menu." }
  ];
  var CAR_START = new Date("2016-01-01T12:00:00");
  function carAgeMonths() { return (Date.now() - CAR_START.getTime()) / (30.4375 * 864e5); }
  function dueWithin(it, months, milesPerYear) {
    var last = lastFor(it.key);
    if (!it.mi && !it.mo) return null;
    if (!last) {
      if (state.odo != null && it.mi && state.odo + milesPerYear * months / 12 >= it.mi) return "No record, and you are past or near " + fmt(it.mi) + " miles";
      if (it.mo && carAgeMonths() + months >= it.mo) return "No record, and the car's age is past or near the " + Math.round(it.mo / 12) + "-year limit";
      return null;
    }
    var reasons = [];
    if (it.mi && state.odo != null && (state.odo + milesPerYear * months / 12) - last.miles >= it.mi) reasons.push("by miles");
    if (it.mo && monthsSince(last.date) + months >= it.mo) reasons.push("by time");
    return reasons.length ? "Due within " + months + " months " + reasons.join(" and ") : null;
  }
  var budget = { pick: null, mpy: 5000 };
  function defaultPicks() {
    var p = {};
    COSTS.forEach(function (c) {
      var it = itemByKey(c.k);
      if (it && dueWithin(it, 12, budget.mpy)) p[c.k] = true;
    });
    if (ratingOf("tread") && ratingOf("tread") <= 2 || ratingOf("age") && ratingOf("age") <= 2) { p.tires = true; p.align = true; }
    if (ratingOf("battery") && ratingOf("battery") <= 2) p.battery = true;
    if (ratingOf("pads") && ratingOf("pads") <= 2) p.padjob = true;
    p.baseline = true; p.tpms = true;
    return p;
  }
  function money(n) { return "$" + fmt(Math.round(n)); }
  function renderBudget() {
    if (!budget.pick) budget.pick = defaultPicks();
    var lo = 0, hi = 0, dl = 0, dh = 0;
    $("budBody").innerHTML = COSTS.map(function (c) {
      var it = itemByKey(c.k), why = it ? dueWithin(it, 12, budget.mpy) : null, on = !!budget.pick[c.k];
      if (on) { lo += c.lo; hi += c.hi; if (typeof c.diy === "number" && !c.hard) { dl += c.diy; dh += c.diy; } else { dl += c.lo; dh += c.hi; } }
      return '<tr class="' + (on ? "on" : "") + '"><td><label class="bud"><input type="checkbox" data-bud="' + c.k + '"' + (on ? " checked" : "") + "> <span><b>" + esc(c.n) + "</b>" + (why ? '<small class="due">' + esc(why) + "</small>" : "") + "<small>" + esc(c.note) + '</small></span></label></td><td class="num">' + (c.hi ? money(c.lo) + "–" + money(c.hi) : "Free") + '</td><td class="num">' + (c.diy === "easy" ? "Easy DIY" : (typeof c.diy === "number" && !c.hard ? (c.diy ? "~" + money(c.diy) + " parts" : "Free") : "Shop")) + "</td></tr>";
    }).join("");
    $("budTotal").innerHTML = '<div class="budsum"><div><span class="lab">At a shop</span><span class="big">' + money(lo) + "–" + money(hi) + '</span></div><div><span class="lab">Doing the priced DIY jobs yourself</span><span class="big">' + money(dl) + "–" + money(dh) + '</span></div><div><span class="lab">Per month, set aside</span><span class="big">' + money(lo / 12) + "–" + money(hi / 12) + "</span></div></div>";
  }
  function wireBudget() {
    $("budBody").addEventListener("change", function (e) { var k = e.target.getAttribute && e.target.getAttribute("data-bud"); if (k) { budget.pick[k] = e.target.checked; renderBudget(); } });
    $("budMpy").addEventListener("change", function () { var v = parseFloat(this.value); budget.mpy = isFinite(v) && v > 0 ? v : 5000; budget.pick = null; renderBudget(); });
    $("budReset").addEventListener("click", function () { budget.pick = null; renderBudget(); });
  }

  /* ================= SPEC SHEET (Volvo 2016 V60 US owner's manual and maintenance schedule) ================= */
  var SPECS = [
    ["Engine", [["Code", "B4204T11, 1,969 cc four-cylinder turbo"], ["Bore and stroke", "82 x 93.2 mm"], ["Compression", "10.8:1"], ["Power", "240 hp at 5,600 rpm"], ["Torque", "258 lb-ft at 1,500 to 4,500 rpm"], ["Timing drive", "Belt"]]],
    ["Engine oil", [["Volvo spec", "Full synthetic, ACEA A5/B5, SAE 5W-30 for normal driving. Volvo's 0W-20 (VCC RBS0-2AE) is approved for this four-cylinder"], ["Capacity with filter", "6.2 US qt (5.9 L)"], ["Level check", "Electronic, in the instrument cluster. There is no dipstick"]]],
    ["Fluids", [["Coolant", "Volvo coolant, 50/50 with water, 8.7 US qt"], ["Automatic transmission", "Volvo AW1 fluid, about 7 US qt. Volvo says no change is needed in normal use"], ["Brake fluid", "DOT 4, 0.63 US qt"], ["Washer fluid", "6.8 US qt (4.7 without headlight washers)"], ["A/C refrigerant", "R134a, 1.7 lb, PAG oil"]]],
    ["Wheels and tires", [["Standard tires", "215/50R17 on 17 x 7.5 in wheels"], ["Pressure, 215/50R17", "38 psi front and rear, cold"], ["Wheel bolt torque", "103 lb-ft (140 Nm), tightened in a crosswise pattern"], ["Tire monitor", "Indirect. Recalibrate after any pressure or tire change"]]],
    ["Electrical", [["Battery", "12 V AGM, 800 CCA, required on start/stop cars. In the engine bay under two covers"], ["Low beam", "H11 halogen, 55 W"], ["High beam", "H9 halogen, 65 W"], ["Turn signals", "PY24W front, PY21W rear"]]],
    ["Fuel and economy", [["Tank", "17.8 US gal"], ["Fuel", "87 octane or higher is fine for reliability. Volvo recommends premium for best performance, and 91 or higher for heat or towing. Up to E10"], ["EPA rating", "25 city, 37 highway, 29 combined mpg"]]],
    ["Capacities and limits", [["Curb weight", "About 3,530 to 3,620 lb (sources differ)"], ["Towing", "3,300 lb braked, 1,650 lb unbraked"], ["Roof load", "165 lb"]]]
  ];
  var SCHEDULE = [
    ["Every 10,000 mi or 12 months", "Oil and filter, reset the service reminder, check fluids, brakes, tires, wipers, lights, belts"],
    ["Every 20,000 mi", "Add the cabin air filter (Volvo suggests at least yearly), headlight aim and a leak check"],
    ["40k, 80k, 120k mi", "Add the engine air filter, brake fluid replacement (or every 3 years), and checks of suspension, CV boots and brake hoses"],
    ["60k and 120k mi", "Spark plugs"],
    ["150k mi or 10 years", "Accessory belt, tensioner and idler, plus the timing belt tensioner and idler. Independent sources replace the timing belt with them as one kit"]
  ];
  function renderSpecs() {
    $("specSheet").innerHTML = SPECS.map(function (g) { return '<div class="specg"><h4>' + esc(g[0]) + '</h4><dl class="kv">' + g[1].map(function (r) { return "<dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd>"; }).join("") + "</dl></div>"; }).join("");
    $("schedBody").innerHTML = SCHEDULE.map(function (r) { return '<li><b>' + esc(r[0]) + "</b><span>" + esc(r[1]) + "</span></li>"; }).join("");
  }

  function renderAll() {
    $("odo").value = state.odo == null ? "" : state.odo;
    renderBay(); renderCodes(); renderDue(); renderLog(); renderOil(); renderRuns(); renderHealth();
    renderSymptom(); renderCodeLookup(); renderAcademy(); renderMy();
    MODS.forEach(function (m) { if (m.refresh) try { m.refresh(API); } catch (e) { console.error(m.id, e); } });
    var cur = modByTab(ui.tab); if (cur && cur.render && !$("p-" + ui.tab).hidden) try { cur.render(API, ui.tab); } catch (e) { console.error(e); }
  }
  var ICON = {
    today: '<path d="M4 11.5L12 5l8 6.5"/><path d="M6 10v9h12v-9"/><path d="M10 19v-5h4v5"/>',
    learn: '<path d="M4 5.5C4 4.7 4.7 4 5.5 4H11v15H5.5C4.7 19 4 18.3 4 17.5z"/><path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H13v15h5.5c.8 0 1.5-.7 1.5-1.5z"/>',
    car: '<path d="M3 15.5l1.6-4.6A2 2 0 0 1 6.5 9.5h11a2 2 0 0 1 1.9 1.4l1.6 4.6v3a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1V17H6.5v1.5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><circle cx="7.5" cy="14" r="1.2"/><circle cx="16.5" cy="14" r="1.2"/>',
    check: '<path d="M4 16a8 8 0 1 1 16 0"/><path d="M12 16l4-5"/><circle cx="12" cy="16" r="1.4"/>',
    data: '<path d="M3 17l5-6 4 3 4-7 5 6"/><path d="M3 20h18"/>'
  };
  /* tab entries: [id, label, hidden-unless-active] ; modules add their own tabs with section + order */
  var SECTIONS = [
    { id: "today", n: "Today", tabs: [] },
    { id: "learn", n: "Learn", tabs: [["academy", "Training", 10, true], ["learn", "Reference", 80, true], ["unlocks", "Unlocks", 90, true]] },
    { id: "car", n: "Car", tabs: [["engine", "Engine bay", 10], ["bay", "Whole car", 20], ["my", "My V60", 30]] },
    { id: "check", n: "Check", tabs: [["health", "Health", 10], ["records", "Service log", 20], ["diag", "Diagnose", 30]] },
    { id: "data", n: "Data", tabs: [["lab", "Data lab", 20], ["sim", "Simulator", 30]] }
  ];
  function modByTab(t) { for (var i = 0; i < MODS.length; i++) if ((MODS[i].tabs || []).some(function (x) { return x.id === t; })) return MODS[i]; return null; }
  function installModules() {
    MODS.forEach(function (m) {
      (m.tabs || []).forEach(function (t) {
        var sec = SECTIONS.filter(function (x) { return x.id === t.section; })[0]; if (!sec) return;
        sec.tabs.push([t.id, t.label, t.order || 50, !!t.hidden]);
        var div = document.createElement("div"); div.className = "panel"; div.id = "p-" + t.id; div.hidden = true; div.innerHTML = t.html || "";
        var anchor = document.querySelector("main"); anchor.appendChild(div);
      });
    });
    SECTIONS.forEach(function (x) { x.tabs.sort(function (a, b) { return a[2] - b[2]; }); });
    MODS.forEach(function (m) { if (m.init) try { m.init(API); } catch (e) { console.error(m.id, e); } });
  }
  var lastTab = {};
  function sectionOf(name) { for (var i = 0; i < SECTIONS.length; i++) if (SECTIONS[i].tabs.some(function (t) { return t[0] === name; })) return SECTIONS[i]; return SECTIONS[0]; }
  /* window.V60_GATE (story module) decides which tabs exist yet; a tab can still be reached by a direct jump */
  function gateOk(id) { var G = window.V60_GATE; return id === "today" || !G || G.visible(id); }
  function gateNew(id) { var G = window.V60_GATE; return !!(G && G.isNew && G.isNew(id)); }
  function firstTab(sec) { var v = sec.tabs.filter(function (t) { return !t[3] && gateOk(t[0]); }); return (v[0] || sec.tabs[0] || ["today"])[0]; }
  function renderNav(name) {
    if (window.V60_GATE && window.V60_GATE.sync) window.V60_GATE.sync();
    var sec = sectionOf(name); lastTab[sec.id] = name;
    var secs = SECTIONS.filter(function (x) { return x.id === "today" || x.id === sec.id || x.tabs.some(function (t) { return !t[3] && gateOk(t[0]); }); });
    $("rail").innerHTML = secs.map(function (x) { var on = x.id === sec.id, dest = lastTab[x.id] && gateOk(lastTab[x.id]) ? lastTab[x.id] : firstTab(x); if (x.id === "today") dest = "today"; var nw = x.tabs.some(function (t) { return gateOk(t[0]) && gateNew(t[0]); }); return '<button type="button" data-tab="' + dest + '"' + (on ? ' aria-current="page"' : "") + '><svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[x.id] + "</svg><span>" + esc(x.n) + "</span>" + (nw ? '<i class="newdot" aria-label="new"></i>' : "") + "</button>"; }).join("");
    $("rail").setAttribute("data-n", secs.length);
    var vis = sec.tabs.filter(function (t) { return (!t[3] && gateOk(t[0])) || t[0] === name; });
    $("subnav").innerHTML = vis.length > 1 ? vis.map(function (t) { return '<button type="button" role="tab" data-tab="' + t[0] + '" aria-selected="' + (t[0] === name) + '">' + esc(t[1]) + (gateNew(t[0]) && t[0] !== name ? '<i class="newdot" aria-label="new"></i>' : "") + "</button>"; }).join("") : "";
    $("subnav").hidden = vis.length < 2;
    document.body.classList.toggle("gate-nohealth", !gateOk("health"));
  }
  function showTab(name) {
    ui.tab = name;
    if (!$("p-" + name)) name = "today";
    ui.tab = name;
    document.querySelectorAll("main > .panel").forEach(function (p) { p.hidden = p.id !== "p-" + name; });
    if (window.V60_GATE && window.V60_GATE.shown) window.V60_GATE.shown(name);
    renderNav(name);
    try { window.scrollTo(0, 0); } catch (e) {}
    var md = modByTab(name); if (md && md.render) try { md.render(API, name); } catch (e) { console.error(md.id, e); }
    if (name === "health") renderHealth();
    if (name === "academy") renderAcademy();
    if (name === "sim") renderSim();
    if (name === "my") { renderMy(); renderSpecs(); }
    if (name === "engine") renderEngine();
    if (name === "health") renderBudget();
  }
  function jump(spec) {
    var p = spec.split(":"), kind = p[0], id = p.slice(1).join(":");
    if (kind === "tab") { showTab(id); return; }
    if (kind === "mission") { if (!missionById(id)) return; aui.view = "mission"; aui.id = id; showTab("academy"); renderAcademy(); window.scrollTo(0, 0); return; }
    for (var mi = 0; mi < MODS.length; mi++) if (MODS[mi].jump && MODS[mi].jump(API, kind, id)) return;
    if (kind === "backup") { var bs = $("backupSec"), pn = bs && bs.closest(".panel"); if (pn) { showTab(pn.id.slice(2)); bs.scrollIntoView({ block: "start" }); } return; }
    if (kind === "bay") { eb.mode = "draw"; eb.sel = id; eb.game = null; showTab("engine"); var bi = document.querySelector('[data-bi="' + id + '"]'); if (bi && bi.scrollIntoView) bi.scrollIntoView({ block: "center" }); return; }
    if (kind === "sys") { ui.sys = id; showTab("bay"); renderBay(); return; }
    if (kind === "part") {
      var part = partById(id); if (!part) return;
      ui.sys = part.sys; ui.open[id] = true; showTab("bay"); renderBay();
      var el = $("part-" + id); if (el && el.scrollIntoView) el.scrollIntoView({ block: "center" });
    }
  }
  function bumpOdo(m) { if (state.odo == null || m > state.odo) { state.odo = Math.round(m); $("odo").value = state.odo; } }

  function importLinkReport(R) {
    var date = String(R.date || "").slice(0, 10) || todayStr(), added = 0;
    (Array.isArray(R.codes) ? R.codes : []).forEach(function (c) {
      if (!c || typeof c.code !== "string" || c.kind === "permanent") return;
      var d = decodeCode(c.code); if (!d.valid) return;
      if (state.codes.some(function (e) { return e.code === d.code && e.status === "active"; })) return;
      state.codes.push({ id: uid(), code: d.code, date: date, miles: state.odo, status: "active", note: ("V60 Link: " + c.kind + ", " + (c.ecu || "")).slice(0, 200) });
      added++;
    });
    var mons = Array.isArray(R.monitors) ? R.monitors : [];
    state.lastScan = { date: date, mil: !!R.mil, codes: (R.codes || []).length, notReady: mons.filter(function (m) { return m && !m.ready; }).map(function (m) { return String(m.n); }), monitors: mons.length };
    if (!acad().done["m-scan"]) acad().done["m-scan"] = { date: todayStr(), outcome: "good", note: "V60 Link health check" };
    renderAll(); save();
    return added;
  }
  var API = {
    get state() { return state; }, save: function () { save(); }, renderAll: function () { renderAll(); }, go: function (t) { showTab(t); }, jump: function (s) { jump(s); },
    $: $, esc: esc, uid: uid, todayStr: todayStr, fmt: fmt, f1: f1, isNum: isNum, claudeUse: claudeUse,
    acad: function () { return acad(); }, xp: function () { return xpTotal(); }, rankFor: rankFor, PARTS: PARTS, ITEMS: ITEMS, partById: partById, lastFor: lastFor, statusFor: statusFor, ratingOf: ratingOf,
    JOBS: JOBS, CHAPTERS: CHAPTERS, SPECS: SPECS, SCHEDULE: SCHEDULE, BUILD: BUILD, RECALLS: RECALLS, CODES: CODES, decodeCode: decodeCode, monthsSince: monthsSince,
    computeHealth: function () { return computeHealth(); }, loadDataset: function (ds, n) { loadDataset(ds, n); }, parseCSV: parseCSV, analyze: analyze, autoMap: autoMap,
    bumpOdo: function (m) { bumpOdo(m); }, updateHud: function () { $("hudRank").textContent = "Lv " + rankFor(xpTotal()).lvl; $("hudRankName").textContent = rankFor(xpTotal()).name; },
    mod: function (id) { if (!state.mods) state.mods = {}; return state.mods[id]; }, setMod: function (id, v) { if (!state.mods) state.mods = {}; state.mods[id] = v; },
    sample: function () { return sampleFn; }, assets: function () { return assetsNs; }, photoUrl: function (p) { return photoUrl(p); }, takePhotoTo: null,
    importLinkReport: function (R) { return importLinkReport(R); },
    oilRate: function () { return oilRate(); }, replaceState: function (r) { replaceState(r); }, snapshot: function () { return JSON.parse(JSON.stringify(state)); }, blobGet: blobGet, blobPut: blobPut, localMode: function () { return mode === "local"; }, ready: function () { return mode === "local" || mode === "db"; },
    shrinkPhoto: function (f, kind) { return shrink(f, kind); }, addPhoto: function (rec) { state.photos = (state.photos || []).concat([rec]).slice(-200); save(); }, navRefresh: function () { renderNav(ui.tab); },
    inClaude: function () { return !!(window.claude && typeof window.claude.use === "function"); }
  };
  if (typeof window !== "undefined") window.V60 = API;
  function setup() {
    installModules();
    $("logItem").innerHTML = ITEMS.concat(EXTRA).map(function (i) { return '<option value="' + i.key + '">' + esc(i.name) + "</option>"; }).join("");
    ["logDate", "oilDate", "clDate"].forEach(function (id) { $(id).value = todayStr(); });
    $("symSel").innerHTML = '<option value="">Choose a symptom</option>' + SYMPTOMS.map(function (s) { return '<option value="' + s.id + '">' + esc(s.label) + "</option>"; }).join("");
    buildBay();
    renderNav(ui.tab);
    wireSim();
    initPhotos();
    wireEngine();
    wireBudget();

    $("odo").addEventListener("change", function () { var v = parseFloat(this.value); state.odo = isFinite(v) && v >= 0 ? Math.round(v) : null; renderAll(); save(); });
    /* Saving only on "change" lost the number when the page was left before the field lost focus (switching apps, tapping a tab). Save while typing and again when the page is hidden. */
    function odoNow() { var v = parseFloat($("odo").value); if (isFinite(v) && v >= 0 && Math.round(v) !== state.odo) { state.odo = Math.round(v); save(); } }
    $("odo").addEventListener("input", odoNow);
    document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") odoNow(); });
    window.addEventListener("pagehide", odoNow);
    $("overlay").addEventListener("change", function () { ui.overlay = this.value; renderBay(); });
    $("symSel").addEventListener("change", renderSymptom);
    $("codeIn").addEventListener("input", renderCodeLookup);

    $("logForm").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var miles = parseFloat($("logMiles").value); if (!isFinite(miles)) return;
      state.log.push({ id: uid(), date: $("logDate").value, miles: Math.round(miles), item: $("logItem").value, notes: $("logNote").value.trim() });
      bumpOdo(miles); $("logNote").value = ""; $("logMiles").value = ""; renderAll(); save();
    });
    $("oilForm").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var miles = parseFloat($("oilMiles").value), qts = parseFloat($("oilQts").value);
      if (!isFinite(miles) || !isFinite(qts) || qts < 0) return;
      state.oil.push({ id: uid(), date: $("oilDate").value, miles: Math.round(miles), qts: qts });
      bumpOdo(miles); $("oilMiles").value = ""; $("oilQts").value = "0"; renderAll(); save();
    });
    $("linkFile").addEventListener("change", function () {
      var f = this.files && this.files[0]; if (!f) return;
      var rd = new FileReader();
      rd.onload = function () {
        try {
          var j = JSON.parse(rd.result);
          if (!j || j.source !== "v60-link" || !j.report) throw new Error("x");
          var added = importLinkReport(j.report);
          $("linkStatus").textContent = added ? "Added " + added + " code" + (added === 1 ? "" : "s") + " to the log." : "No new active codes to add.";
        } catch (e) { $("linkStatus").textContent = "That is not a V60 Link report."; }
      };
      rd.readAsText(f); this.value = "";
    });
    $("codeForm").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var r = decodeCode($("clCode").value);
      if (!r.valid) { $("clCode").setCustomValidity("Use a code like P0128"); $("clCode").reportValidity(); $("clCode").setCustomValidity(""); return; }
      var miles = parseFloat($("clMiles").value);
      state.codes.push({ id: uid(), code: r.code, date: $("clDate").value, miles: isFinite(miles) ? Math.round(miles) : null, status: $("clState").value, note: $("clNote").value.trim() });
      if (isFinite(miles)) bumpOdo(miles);
      $("clCode").value = ""; $("clNote").value = ""; $("clMiles").value = ""; renderAll(); save();
    });

    $("labFile").addEventListener("change", function () {
      var f = this.files && this.files[0]; if (!f) return;
      $("labStatus").textContent = "Reading " + f.name + "...";
      var rd = new FileReader();
      rd.onload = function () {
        try { loadDataset(parseCSV(rd.result), f.name); }
        catch (e) { lab.ds = null; $("labBody").hidden = true; $("labStatus").textContent = (e && e.message) || "That file could not be read."; }
      };
      rd.onerror = function () { $("labStatus").textContent = "That file could not be read."; };
      rd.readAsText(f);
    });
    $("labDemo").addEventListener("click", function () { loadDataset(demoDataset(), "Demo drive"); });
    $("tempU").addEventListener("change", function () { if (lab.ds) renderLab(); });
    $("speedU").addEventListener("change", function () { if (lab.ds) renderLab(); });
    $("saveRun").addEventListener("click", function () {
      if (!lab.ds || lab.ds.demo || !lab.res) return;
      var s = lab.res.sum;
      state.runs.push({ id: uid(), date: todayStr(), miles: state.odo, dur: s.dur, coolMax: s.coolMax, warmMin: s.warmMin, ltft: s.ltft, stft: s.stft, volt: s.volt, idleRpm: s.idleRpm, mapPeak: s.mapPeak, coolMid: s.coolMid, mafIdle: s.mafIdle, idleSd: s.idleSd, voltLowShare: s.voltLowShare, flags: s.flags, concerns: s.concerns, watches: s.watches,
        titles: lab.res.finds.filter(function (f) { return f.level === "concern" || f.level === "watch"; }).map(function (f) { return { level: f.level, title: f.title }; }).slice(0, 8) });
      if (state.runs.length > 40) state.runs = state.runs.slice(-40);
      $("runStatus").textContent = "Saved. It now feeds the Health tab.";
      renderRuns(); renderHealth(); save();
    });
    $("charts").addEventListener("pointermove", function (ev) { var c = ev.target.closest ? ev.target.closest(".chart") : null; if (c) cursorAt(ev.clientX, c); });
    $("charts").addEventListener("pointerleave", clearCursor);

    $("askGo").addEventListener("click", askClaude);
    $("askStop").addEventListener("click", function () { if (askCtl) askCtl.abort(); });
    function icsEsc(t) { return String(t).replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n"); }
    function icsDate(d) { return d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0"); }
    function icsFile(events) {
      var now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, ""), L = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//V60 Garage//EN", "CALSCALE:GREGORIAN"];
      events.forEach(function (e) {
        L.push("BEGIN:VEVENT", "UID:" + uid() + "@v60garage", "DTSTAMP:" + now, "DTSTART;TZID=America/Chicago:" + e.start + "T100000", "DTEND;TZID=America/Chicago:" + e.start + "T103000", "SUMMARY:" + icsEsc(e.title), "DESCRIPTION:" + icsEsc(e.desc));
        if (e.rrule) L.push("RRULE:" + e.rrule);
        L.push("BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + icsEsc(e.title), "TRIGGER:-PT12H", "END:VALARM", "END:VEVENT");
      });
      L.push("END:VCALENDAR"); return L.join("\r\n");
    }
    function saveIcs(name, text) {
      claudeUse("downloads").then(function (d) {
        if (!d) { $("icsStatus").textContent = "Saving files is not available in this view."; return null; }
        return d.save({ filename: name, data: text }).then(function () { $("icsStatus").textContent = "Saved. Open the file to add it to your calendar."; });
      }).catch(function (e) { $("icsStatus").textContent = e && e.code === "declined" ? "Cancelled." : "Could not save the file."; });
    }
    $("icsMonthly").addEventListener("click", function () {
      var d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + 1); while (d.getDay() !== 6) d.setDate(d.getDate() + 1);
      saveIcs("v60-monthly-check.ics", icsFile([{ title: "V60 monthly check (10 min)", start: icsDate(d), rrule: "FREQ=MONTHLY;BYDAY=1SA", desc: "1. Oil level: ignition mode II, thumb wheel to Oil level, on level ground.\n2. Tire pressures cold vs door-pillar label. Calibrate the tire monitor if you change any.\n3. Walk around: lights, wipers, any new drips under the car.\n4. Coolant and brake fluid between MIN and MAX, engine cold.\n5. Log it in V60 Garage." }]));
    });
    $("icsDue").addEventListener("click", function () {
      var evs = [], today = new Date();
      ITEMS.forEach(function (it) {
        var l = lastFor(it.key); if (!l || !it.mo) return;
        var d = new Date(l.date + "T12:00:00"); d.setMonth(d.getMonth() + it.mo);
        if (d < today) d = new Date(today.getTime() + 7 * 864e5);
        evs.push({ title: "V60: " + it.name + " due", start: icsDate(d), desc: "Last done " + l.date + (isNum(l.miles) ? " at " + fmt(l.miles) + " mi" : "") + (it.mi ? ". Also due by " + fmt((l.miles || 0) + it.mi) + " mi, whichever comes first." : ".") });
      });
      if (!evs.length) { $("icsStatus").textContent = "Log at least one service with a date first, then the due dates can be scheduled."; return; }
      saveIcs("v60-due-services.ics", icsFile(evs));
    });
    $("exportBtn").addEventListener("click", function () {
      claudeUse("downloads").then(function (d) {
        if (!d) { localBackup(); return null; }
        return d.save({ filename: "v60-garage-backup.json", data: JSON.stringify(state, null, 1) }).then(function () { $("backupStatus").textContent = "Backup saved."; });
      }).catch(function (e) { $("backupStatus").textContent = e && e.code === "declined" ? "Cancelled." : "Could not save the backup."; });
    });
    function localBackup() {
      var name = "v60-garage-backup-" + todayStr() + ".json", text = JSON.stringify(state, null, 1), done = function (m) { $("backupStatus").textContent = m; try { localStorage.setItem("v60-garage-lastbackup", todayStr()); } catch (e) {} };
      try {
        var file = new File([text], name, { type: "application/json" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file], title: name }).then(function () { done("Backup shared. Choose Save to Files to keep it in iCloud Drive."); }).catch(function () { $("backupStatus").textContent = "Cancelled."; }); return; }
      } catch (e) {}
      var url = URL.createObjectURL(new Blob([text], { type: "application/json" })), a = document.createElement("a");
      a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      done("Backup downloaded.");
    }
    var pendingImport = null;
    $("importFile").addEventListener("change", function () {
      var f = this.files && this.files[0]; if (!f) return;
      var rd = new FileReader();
      rd.onload = function () {
        try { pendingImport = clean(JSON.parse(rd.result)); $("importGo").hidden = false; $("backupStatus").textContent = "Ready to restore from " + f.name + ". This replaces what is on the page now."; }
        catch (e) { pendingImport = null; $("importGo").hidden = true; $("backupStatus").textContent = "That file is not a valid backup."; }
      };
      rd.readAsText(f);
    });
    $("importGo").addEventListener("click", function () {
      if (!pendingImport) return;
      state = pendingImport; pendingImport = null; $("importGo").hidden = true; $("backupStatus").textContent = "Restored."; renderAll(); save();
    });

    document.addEventListener("click", function (ev) {
      var t = ev.target; if (!t || !t.closest) return;
      var tabB = t.closest("button[data-tab]");
      if (tabB) { showTab(tabB.getAttribute("data-tab")); return; }
      var jmp = t.closest("[data-jump]");
      if (jmp) { jump(jmp.getAttribute("data-jump")); return; }
      if (t.closest("#acadBody") && academyClick(t)) return;
      var sysB = t.closest("[data-sys]");
      if (sysB) { ui.sys = sysB.getAttribute("data-sys"); renderBay(); return; }
      var rate = t.closest("button[data-rate]");
      if (rate) {
        var pr = rate.getAttribute("data-rate").split(":"), pid = pr[0], lv = parseInt(pr[1], 10);
        if (lv === 0) delete state.rate[pid];
        else state.rate[pid] = { r: lv, d: todayStr(), n: state.rate[pid] ? state.rate[pid].n : "" };
        ui.open[pid] = true; renderBay(); renderHealth(); save(); return;
      }
      var del = t.closest("button[data-del]");
      if (del) {
        var k = del.getAttribute("data-del");
        if (!pendingDel[k]) { pendingDel = {}; pendingDel[k] = true; renderLog(); renderOil(); renderCodes(); renderRuns(); renderMy(); return; }
        var parts = k.split(":"), id = parts.slice(1).join(":");
        if (parts[0] === "log") state.log = state.log.filter(function (e) { return e.id !== id; });
        else if (parts[0] === "oil") state.oil = state.oil.filter(function (e) { return e.id !== id; });
        else if (parts[0] === "code") state.codes = state.codes.filter(function (e) { return e.id !== id; });
        else if (parts[0] === "run") state.runs = state.runs.filter(function (e) { return e.id !== id; });
        else if (parts[0] === "spec") state.specs = (state.specs || []).filter(function (e) { return e.id !== id; });
        pendingDel = {}; renderAll(); save();
      }
    });
    document.addEventListener("keydown", function (ev) {
      if ((ev.key === "Enter" || ev.key === " ") && ev.target && ev.target.classList && ev.target.classList.contains("pin")) { ev.preventDefault(); ui.sys = ev.target.getAttribute("data-sys"); renderBay(); }
    });
    document.addEventListener("change", function (ev) {
      var t = ev.target; if (!t || !t.getAttribute) return;
      if (academyStep(t)) return;
      if (t.hasAttribute("data-note")) {
        var pid = t.getAttribute("data-note"), cur = state.rate[pid];
        if (cur) { cur.n = t.value.slice(0, 200); save(); renderHealth(); }
        else if (t.value.trim()) { $("saveStatus").textContent = "Rate the part first so the note has a place to live."; }
      } else if (t.hasAttribute("data-map")) {
        lab.map[t.getAttribute("data-map")] = t.value || undefined;
        if (!t.value) delete lab.map[t.getAttribute("data-map")];
        renderLab();
      } else if (t.hasAttribute("data-show")) {
        lab.show[t.getAttribute("data-show")] = t.checked; renderCharts();
      }
    });
    document.addEventListener("toggle", function (ev) {
      var t = ev.target; if (t && t.classList && t.classList.contains("part")) ui.open[t.getAttribute("data-pid")] = t.open;
    }, true);
  }

  function claudeUse(name) {
    var cl = window.claude;
    if (!cl || typeof cl.use !== "function") return Promise.resolve(null);
    return cl.use(name);
  }
  /* used by sync: take a state from another device without marking this device as changed */
  function replaceState(raw) { state = clean(raw); quietSave = true; save(); chain = chain.then(function () { quietSave = false; }); renderAll(); showTab(ui.tab); loadLocalBlobs().then(function () { renderPhotos(); }); }
  function blobGet(id) { return idb().then(function (db) { return new Promise(function (res) { var g = db.transaction("blobs").objectStore("blobs").get(id); g.onsuccess = function () { res(g.result || null); }; g.onerror = function () { res(null); }; }); }); }
  function blobPut(id, blob) { return idb().then(function (db) { return new Promise(function (res, rej) { var tx = db.transaction("blobs", "readwrite"); tx.objectStore("blobs").put(blob, id); tx.oncomplete = function () { localUrls[id] = URL.createObjectURL(blob); res(); }; tx.onerror = function () { rej(tx.error); }; }); }); }
  function applyLoaded(raw) { state = clean(raw); renderAll(); loadLocalBlobs().then(function () { renderPhotos(); }); }
  function loadLocal() {
    try { var s = localStorage.getItem(LSKEY); if (s) applyLoaded(JSON.parse(s)); } catch (e) { /* no storage */ }
    mode = "local"; setStatus("Saved in this browser only");
  }
  function init() {
    setup(); renderAll(); showTab(ui.tab);
    /* ask the browser to keep this site's data; WebKit grants it more readily to Home Screen web apps */
    try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().then(function (ok) { window.__v60persist = ok; }).catch(function () {}); } catch (e) {}
    claudeUse("sample").then(function (s) { sampleFn = s; $("askBox").hidden = !s; }).catch(function () { $("askBox").hidden = true; });
    if (!window.claude || typeof window.claude.use !== "function") { loadLocal(); return; }
    Promise.all([claudeUse("db"), claudeUse("user")]).then(function (res) {
      var db = res[0], user = res[1];
      if (!db || !user) { loadLocal(); return null; }
      return user.id().then(function (id) {
        if (!id) { loadLocal(); return null; }
        ref = db.doc("data/users/" + id + "/garage");
        return ref.get().then(function (snap) {
          mode = "db";
          if (snap.exists) applyLoaded(snap.data());
          setStatus(snap.exists ? "Loaded from your private data for this page" : "Nothing saved yet. Entries save privately to this page.");
        });
      });
    }).catch(function () { loadLocal(); });
  }
  if (typeof window !== "undefined") window.__v60 = { go: function (t) { showTab(t); }, simDrive: simDrive, simAnalyze: simAnalyze, FAULTS: FAULTS, xpTotal: function () { return xpTotal(); }, CHAPTERS: CHAPTERS, JOBS: JOBS, computeDrift: computeDrift, setRuns: function (r) { state.runs = r; }, parseCSV: parseCSV, analyze: analyze, autoMap: autoMap, demoDataset: demoDataset, decodeCode: decodeCode, clean: clean, stats: stats };
  init();
})();
