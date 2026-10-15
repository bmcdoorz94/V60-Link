/* Study entries for the G1 task list (data/g1tasks.js), written area by area from fetched sources only.
   V60_G1_ENTRIES[taskId] = { body: [lines], car: "how it applies to the V60" | null, src: [[title, url], ...],
     qs: [{ q, o: [4 options], a: index, why, src: [title, url] }, ...] }
   A task with no entry yet shows "No sourced entry yet" in the app. Never write an entry from memory: fetch the source first.
   Merge researched entries with tools/gen/g1merge.py; it validates ids, sources and questions. */
window.V60_G1_ENTRIES = {
 "D42": {
  "body": [
   "A car that pulls or drifts to one side on a flat, straight road, a steering wheel that sits off center while driving straight, and uneven wear on the inner or outer tread edges are the common signs of misalignment.",
   "Michelin also lists a vague or wandering feel through the steering as a reason to have the alignment checked; NHTSA describes alignment as what keeps a car from veering left or right on a straight, level road.",
   "Pull and wander are not always alignment faults: MOOG lists pulling and wandering among signs of worn steering and suspension, and free play in the steering gear or linkage sockets can make a car wander side to side and need constant correction.",
   "Tread wear points to the angle: feathered edges point to wrong toe, faster wear on the inner or outer ribs points to excessive camber, and cupped dips point to worn or bent suspension parts.",
   "Vibration through the steering wheel can come from misalignment, but also from worn parts or tire imbalance.",
   "An alignment check is due after a pothole or curb strike, a collision, a ride-height change, or any replacement of steering or suspension parts, including struts."
  ],
  "car": "Volvo's 2016 V60 manual lists incorrect front end alignment among the factors that decrease gas mileage and says correct front wheel alignment is very important for tire economy. It does not describe alignment symptoms.",
  "src": [
   [
    "Discover the what, why and how of car alignment",
    "https://www.moogparts.com/en-eu/support/the-problem-solver/technical-support/educational-articles/why-what-how-wheel-alignment.html"
   ],
   [
    "Wheel Alignment & Balancing Explained - Michelin USA",
    "https://www.michelinman.com/auto/auto-tips-and-advice/tire-maintenance/wheel-alignment-wheel-balancing"
   ],
   [
    "Tires | NHTSA",
    "https://www.nhtsa.gov/vehicle-safety/tires"
   ],
   [
    "When to inspect your steering and suspension system | MOOG",
    "https://www.moogparts.com/en-eu/support/the-problem-solver/technical-support/educational-articles/inspect-steering-suspension.html"
   ],
   [
    "Why Does My Steering Feel Loose?",
    "https://www.moogparts.com/en-ca/parts-matter/why-does-my-steering-feel-loose.html"
   ],
   [
    "MOOG Easy Solutions Bulletin PRMMO1506-EN: Wheel alignment",
    "https://www.moogparts.com/content/dam/marketing/emea/moog/pdf/technical-tips/lv/en/tt-wheel-alignment-en.pdf"
   ],
   [
    "Importance of Alignment After Strut Replacement",
    "https://www.monroe.com/technical-resources/tech-tips/importance-of-alignment-shock-strut-replacement.html"
   ],
   [
    "Volvo V60 Owner's Manual, Model Year 2016 (US, TP 20238)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ]
  ],
  "qs": [
   {
    "q": "Each of the following can point to a wheel alignment problem EXCEPT:",
    "o": [
     "The car drifts to one side on a straight road",
     "The inner ribs of one front tire wear faster than the rest",
     "The edges of the tread are feathered",
     "Wear concentrated in the center ribs of the tread"
    ],
    "a": 3,
    "why": "MOOG traces center wear to overinflation, while drift, one-sided rib wear (camber) and feathering (toe) are alignment signs.",
    "src": [
     "MOOG Easy Solutions Bulletin PRMMO1506-EN: Wheel alignment",
     "https://www.moogparts.com/content/dam/marketing/emea/moog/pdf/technical-tips/lv/en/tt-wheel-alignment-en.pdf"
    ]
   },
   {
    "q": "A car wanders from side to side and needs constant steering correction. Technician A says looseness in the steering gear or the linkage sockets could cause this. Technician B says wander is always cured by an alignment alone. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 0,
    "why": "MOOG ties wander and constant correction to free play in the steering gear or linkage sockets, which are worn parts found by inspection, not by setting angles.",
    "src": [
     "Why Does My Steering Feel Loose?",
     "https://www.moogparts.com/en-ca/parts-matter/why-does-my-steering-feel-loose.html"
    ]
   }
  ]
 },
 "D43": {
  "body": [
   "Before an alignment, the car is inspected for loose or worn steering and suspension parts that would prevent a correct alignment; Hunter's aligner flags excessive total toe as a sign of such parts.",
   "John Bean's pre-alignment checklist covers tire size, damage, wear, tread depth and pressure, rim condition, ride height against the maker's specification, and play in the steering and suspension.",
   "Ride height matters because sagging springs change front toe and camber, and sagging rear springs hurt caster and camber, giving poor handling and tire wear.",
   "Tire pressure is set before measuring, and Hunter says not to run the procedure on a car with uneven or out-of-round tires.",
   "The car sits on a level lift with the wheels straight ahead and the turnplate and slip-plate pins in; targets are mounted on all four wheels and the car is rolled to compensate for runout of the wheel, adaptor and target.",
   "For rolling compensation Hunter has the parking brake released, the transmission in neutral and the car pushed by the left rear tire, never by the front wheels; the aligner then recalls the maker's specifications by vehicle or VIN and saves the first readings as before measurements."
  ],
  "car": "Volvo's 2016 V60 manual says the brakes, front wheel alignment and steering gear should be checked only by a trained and qualified Volvo service technician; the tire pressures to set first are on the decal in the driver's door opening.",
  "src": [
   [
    "WinAlign® Alignment Software Operation Manual, Version 16 (Hunter Engineering Form 3850-T)",
    "https://www.hunter.com/globalassets/hunter/products/alignment-systems/winalign-standard/documents/align-winalign-ops-3850-t.pdf"
   ],
   [
    "Make the Most of Your John Bean® Wheel Aligner with These Pro Tips",
    "https://pages.diagnosticsmarketing.snapon.com/Equipment-Focus-Wheel-Alignment-Quick-Tips"
   ],
   [
    "Volvo V60 Owner's Manual, Model Year 2016 (US, TP 20238)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ]
  ],
  "qs": [
   {
    "q": "On the first aligner reading, a car shows excessive total toe before any adjustment. This most likely indicates:",
    "o": [
     "Loose or worn steering or suspension parts",
     "Correct ride height",
     "An uncalibrated steering angle sensor only",
     "Tire pressure set 1 psi high"
    ],
    "a": 0,
    "why": "Hunter's manual says excessive total toe at the start is a good indication of loose or worn parts, which must be found before aligning.",
    "src": [
     "WinAlign® Alignment Software Operation Manual, Version 16 (Hunter Engineering Form 3850-T)",
     "https://www.hunter.com/globalassets/hunter/products/alignment-systems/winalign-standard/documents/align-winalign-ops-3850-t.pdf"
    ]
   },
   {
    "q": "Which step is LEAST likely to be part of the pre-alignment preparation?",
    "o": [
     "Checking ride height against specification",
     "Setting tire pressures",
     "Checking for loose or worn suspension parts",
     "Resetting the steering angle sensor"
    ],
    "a": 3,
    "why": "Hunter prompts for the steering system reset only after all adjustments are made and checked; inspection, tire pressure and ride height come first.",
    "src": [
     "WinAlign® Alignment Software Operation Manual, Version 16 (Hunter Engineering Form 3850-T)",
     "https://www.hunter.com/globalassets/hunter/products/alignment-systems/winalign-standard/documents/align-winalign-ops-3850-t.pdf"
    ]
   }
  ]
 },
 "D44": {
  "body": [
   "Camber is the inward or outward tilt of the top of the wheel from vertical, seen from the front, measured in degrees: positive when the top leans outward, negative when it leans inward.",
   "Hunter's adjustment order is rear camber, rear toe, front camber and caster, then front toe, each only where the car is adjustable.",
   "Excessive camber wears the inner or outer ribs faster than the rest; MOOG's remedy is to align the wheels and check the shock absorbers, ball joints and control arm bushings.",
   "Many late-model cars have little factory camber adjustment; MOOG's order is to follow the maker's procedure, then inspect and replace worn or damaged parts, and only then fit aftermarket adjusting parts such as adjustable ball joints, cam bolts or rear shims.",
   "When an angle the maker says is non-adjustable reads out of specification, Hunter treats it as a sign of a suspension or steering problem to diagnose and repair.",
   "New struts can change camber, so Monroe recommends an alignment whenever struts or other steering and suspension parts are replaced."
  ],
  "car": "Volvo's 2016 V60 owner's manual gives no alignment specifications or adjustment procedures; it only says correct front wheel alignment is very important for tire life and that the front wheel alignment should be checked by a trained and qualified Volvo service technician. Whether the V60's camber is adjustable is unconfirmed.",
  "src": [
   [
    "WinAlign® Alignment Software Operation Manual, Version 16 (Hunter Engineering Form 3850-T)",
    "https://www.hunter.com/globalassets/hunter/products/alignment-systems/winalign-standard/documents/align-winalign-ops-3850-t.pdf"
   ],
   [
    "MOOG Easy Solutions Bulletin PRMMO1506-EN: Wheel alignment",
    "https://www.moogparts.com/content/dam/marketing/emea/moog/pdf/technical-tips/lv/en/tt-wheel-alignment-en.pdf"
   ],
   [
    "How to Adjust Camber and Caster on Non-Adjustable Vehicles",
    "https://www.moogparts.com/technical/bulletins/tech-tips/How-to-Adjust-Camber-and-Caster-on-Non-Adjustable-Vehicles.html"
   ],
   [
    "Alignment Camber Adjustment Bolt | MOOG Parts",
    "https://www.moogparts.com/parts/suspension/alignment-parts/adjustment-cams-and-cam-bolts.html"
   ],
   [
    "Front End Alignment & Camber Shims | MOOG Parts",
    "https://www.moogparts.com/parts/suspension/alignment-parts/rear-contact-shims.html"
   ],
   [
    "Importance of Alignment After Strut Replacement",
    "https://www.monroe.com/technical-resources/tech-tips/importance-of-alignment-shock-strut-replacement.html"
   ],
   [
    "Volvo V60 Owner's Manual, Model Year 2016 (US, TP 20238)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ]
  ],
  "qs": [
   {
    "q": "Viewed from the front, the top of the left front wheel leans in toward the engine. This is:",
    "o": [
     "Positive camber",
     "Negative camber",
     "Positive caster",
     "Toe-in"
    ],
    "a": 1,
    "why": "Hunter defines camber as negative when the top of the wheel tilts inward and positive when it tilts outward.",
    "src": [
     "WinAlign® Alignment Software Operation Manual, Version 16 (Hunter Engineering Form 3850-T)",
     "https://www.hunter.com/globalassets/hunter/products/alignment-systems/winalign-standard/documents/align-winalign-ops-3850-t.pdf"
    ]
   },
   {
    "q": "A car's front camber is out of specification and the maker provides no camber adjustment. Technician A says the angle can be ignored because it is not adjustable. Technician B says the steering and suspension should be inspected for worn or damaged parts before fitting an aftermarket adjusting part. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 1,
    "why": "MOOG says to inspect for and replace worn or damaged parts, realign, and only then use an adjustable part if the car is still out of specification.",
    "src": [
     "How to Adjust Camber and Caster on Non-Adjustable Vehicles",
     "https://www.moogparts.com/technical/bulletins/tech-tips/How-to-Adjust-Camber-and-Caster-on-Non-Adjustable-Vehicles.html"
    ]
   }
  ]
 },
 "D45": {
  "body": [
   "Caster is the forward or rearward tilt of the steering axis from vertical, seen from the side, measured in degrees: positive when the top of the steering axis leans rearward, negative when it leans forward.",
   "The aligner measures caster by having the technician steer the front wheels left, then right, then back to straight ahead while it records; the standard procedure locks the brakes with a pedal depressor, and steering too fast causes a data error.",
   "Total toe greater than 2 inches or 4 degrees should be corrected before the caster steer.",
   "The same steer can measure steering axis inclination (the line through the upper and lower steering pivots against vertical, seen from the front) and included angle (SAI plus camber), which help find bent suspension or steering parts.",
   "Wrong caster can make it hard to keep the car on a straight course and affects steering return and stability.",
   "Where caster is adjustable by shims at the control-arm pivots, each shim change moves camber and caster together; many late-model cars have limited caster adjustment."
  ],
  "car": "Volvo's 2016 V60 owner's manual gives no alignment specifications or adjustment procedures; it only says correct front wheel alignment is very important for tire life and that the front wheel alignment should be checked by a trained and qualified Volvo service technician.",
  "src": [
   [
    "WinAlign® Alignment Software Operation Manual, Version 16 (Hunter Engineering Form 3850-T)",
    "https://www.hunter.com/globalassets/hunter/products/alignment-systems/winalign-standard/documents/align-winalign-ops-3850-t.pdf"
   ],
   [
    "Importance of Alignment After Strut Replacement",
    "https://www.monroe.com/technical-resources/tech-tips/importance-of-alignment-shock-strut-replacement.html"
   ],
   [
    "How to Adjust Camber and Caster on Non-Adjustable Vehicles",
    "https://www.moogparts.com/technical/bulletins/tech-tips/How-to-Adjust-Camber-and-Caster-on-Non-Adjustable-Vehicles.html"
   ],
   [
    "Understanding Wheel Alignment: A guide for independent garages",
    "https://pages.diagnosticsmarketing.snapon.com/2024-SOE-Essential-Guide-to-Wheel-Alignment-1"
   ],
   [
    "Volvo V60 Owner's Manual, Model Year 2016 (US, TP 20238)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ]
  ],
  "qs": [
   {
    "q": "Before the caster steer, the aligner shows front total toe of 5 degrees. The technician should FIRST:",
    "o": [
     "Proceed with the caster steer",
     "Correct the toe before steering for caster",
     "Reset the steering angle sensor",
     "Raise the tire pressures"
    ],
    "a": 1,
    "why": "Hunter's manual says total toe greater than 2 inches or 4 degrees should be corrected before steering caster.",
    "src": [
     "WinAlign® Alignment Software Operation Manual, Version 16 (Hunter Engineering Form 3850-T)",
     "https://www.hunter.com/globalassets/hunter/products/alignment-systems/winalign-standard/documents/align-winalign-ops-3850-t.pdf"
    ]
   },
   {
    "q": "Incorrect caster is most likely to cause:",
    "o": [
     "Difficulty keeping the car on a straight course",
     "Wear in the center of the tread only",
     "A pulsating brake pedal",
     "A tire pressure warning"
    ],
    "a": 0,
    "why": "Monroe says incorrect caster can make it difficult to keep the vehicle on a straight course.",
    "src": [
     "Importance of Alignment After Strut Replacement",
     "https://www.monroe.com/technical-resources/tech-tips/importance-of-alignment-shock-strut-replacement.html"
    ]
   }
  ]
 },
 "D46": {
  "body": [
   "Toe is the direction a wheel points relative to the car's reference line, seen from above: toe-in when lines through the wheels meet ahead of the wheel, toe-out when they meet behind it. It is measured in degrees and may be shown in inches or millimeters.",
   "Total toe is the angle between the two wheels on the same axle.",
   "Front toe is the last adjustment, after rear camber, rear toe and front camber and caster.",
   "On cars with a tie rod for each front wheel, toe is set side by side at the tie rods with the steering wheel held level; after each change the front is jounced, the adjuster locked, and the reading checked again.",
   "Before locking, each ball-and-socket joint in the steering linkage should be able to rotate the same distance in either direction.",
   "Wrong toe feathers the tread edges, and toe that is far off can wear tires quickly."
  ],
  "car": "Volvo's 2016 V60 owner's manual gives no alignment specifications or adjustment procedures; it only says correct front wheel alignment is very important for tire life and that the front wheel alignment should be checked by a trained and qualified Volvo service technician.",
  "src": [
   [
    "WinAlign® Alignment Software Operation Manual, Version 16 (Hunter Engineering Form 3850-T)",
    "https://www.hunter.com/globalassets/hunter/products/alignment-systems/winalign-standard/documents/align-winalign-ops-3850-t.pdf"
   ],
   [
    "MOOG Easy Solutions Bulletin PRMMO1506-EN: Wheel alignment",
    "https://www.moogparts.com/content/dam/marketing/emea/moog/pdf/technical-tips/lv/en/tt-wheel-alignment-en.pdf"
   ],
   [
    "Importance of Alignment After Strut Replacement",
    "https://www.monroe.com/technical-resources/tech-tips/importance-of-alignment-shock-strut-replacement.html"
   ],
   [
    "Volvo V60 Owner's Manual, Model Year 2016 (US, TP 20238)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ]
  ],
  "qs": [
   {
    "q": "Seen from above, lines drawn through the two front wheels meet ahead of the car. The wheels have:",
    "o": [
     "Toe-out",
     "Toe-in",
     "Negative camber",
     "Positive caster"
    ],
    "a": 1,
    "why": "Hunter defines toe-in as the lines through the wheels intersecting in front of the wheels.",
    "src": [
     "WinAlign® Alignment Software Operation Manual, Version 16 (Hunter Engineering Form 3850-T)",
     "https://www.hunter.com/globalassets/hunter/products/alignment-systems/winalign-standard/documents/align-winalign-ops-3850-t.pdf"
    ]
   },
   {
    "q": "Both front tires show feathered tread edges. The most likely cause is:",
    "o": [
     "Incorrect toe",
     "Overinflation",
     "Worn shock absorbers",
     "Incorrect caster"
    ],
    "a": 0,
    "why": "MOOG names incorrect toe as the cause of feathering and says to correct the toe and check the front suspension bushings.",
    "src": [
     "MOOG Easy Solutions Bulletin PRMMO1506-EN: Wheel alignment",
     "https://www.moogparts.com/content/dam/marketing/emea/moog/pdf/technical-tips/lv/en/tt-wheel-alignment-en.pdf"
    ]
   }
  ]
 },
 "D47": {
  "body": [
   "John Bean notes that many technicians who skip its toe-guidance step end up with a crooked steering wheel after the alignment.",
   "Hunter's method levels the wheel before toe adjustment: with the engine running on power steering cars, the technician rocks the steering wheel left and right in shrinking arcs so the gear sits at the middle of its lash and power steering valve travel.",
   "The level position is marked with chalk on the column, the engine is switched off, and the technician gets out without touching the wheel.",
   "The steering wheel is centered by setting each front wheel's toe separately at its tie rod relative to the leveled wheel; Hunter's WinToe does this without a steering wheel holder.",
   "To verify, the wheels are steered straight ahead and the steering wheel must read level; if not, the toe procedure is repeated.",
   "If the rear thrust line is not parallel to the geometric centerline, aligning the front to the centerline can still leave the wheel off center when driving straight; aligning the front to the thrust line avoids this."
  ],
  "car": "Volvo's 2016 V60 owner's manual gives no alignment specifications or adjustment procedures; it only says correct front wheel alignment is very important for tire life and that the front wheel alignment should be checked by a trained and qualified Volvo service technician.",
  "src": [
   [
    "Make the Most of Your John Bean® Wheel Aligner with These Pro Tips",
    "https://pages.diagnosticsmarketing.snapon.com/Equipment-Focus-Wheel-Alignment-Quick-Tips"
   ],
   [
    "WinAlign® Alignment Software Operation Manual, Version 16 (Hunter Engineering Form 3850-T)",
    "https://www.hunter.com/globalassets/hunter/products/alignment-systems/winalign-standard/documents/align-winalign-ops-3850-t.pdf"
   ],
   [
    "Volvo V60 Owner's Manual, Model Year 2016 (US, TP 20238)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ]
  ],
  "qs": [
   {
    "q": "After a front-only alignment to the geometric centerline, the steering wheel is off center while the car drives straight. The most likely cause is:",
    "o": [
     "The rear thrust line is not parallel to the geometric centerline",
     "Front camber is within specification",
     "The tire pressures were set before measuring",
     "The brake pedal depressor was used"
    ],
    "a": 0,
    "why": "Hunter says that when the rear wheels create a thrust line not parallel to the geometric centerline, the steering wheel may not be centered as the car moves straight.",
    "src": [
     "WinAlign® Alignment Software Operation Manual, Version 16 (Hunter Engineering Form 3850-T)",
     "https://www.hunter.com/globalassets/hunter/products/alignment-systems/winalign-standard/documents/align-winalign-ops-3850-t.pdf"
    ]
   },
   {
    "q": "Technician A says the steering wheel should be rocked in shrinking arcs before it is leveled so the steering gear sits mid-lash. Technician B says the steering wheel must be locked with a holder during Hunter's WinToe procedure. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 0,
    "why": "Hunter describes the shrinking-arc leveling and states that locking the steering wheel is not necessary with WinToe.",
    "src": [
     "WinAlign® Alignment Software Operation Manual, Version 16 (Hunter Engineering Form 3850-T)",
     "https://www.hunter.com/globalassets/hunter/products/alignment-systems/winalign-standard/documents/align-winalign-ops-3850-t.pdf"
    ]
   }
  ]
 },
 "D48": {
  "body": [
   "Rear toe uses the same definition as front toe: the angle of each rear wheel to the car's reference line, seen from above.",
   "The rear thrust line is the line that bisects the rear axle's total toe.",
   "In a total four-wheel alignment, rear individual toe is measured and adjusted to the factory specification so the thrust line becomes parallel to the geometric centerline; the front wheels are then aligned to that thrust line.",
   "Rear camber and rear toe are adjusted before any front angle.",
   "On rear suspensions without factory adjustment, MOOG full-contact rear shims can set camber, toe, or both, to a tenth of a degree.",
   "Rear slip plates must be used when adjusting rear toe or camber."
  ],
  "car": "Volvo's 2016 V60 owner's manual gives no alignment specifications or adjustment procedures; it only says correct front wheel alignment is very important for tire life and that the front wheel alignment should be checked by a trained and qualified Volvo service technician.",
  "src": [
   [
    "WinAlign® Alignment Software Operation Manual, Version 16 (Hunter Engineering Form 3850-T)",
    "https://www.hunter.com/globalassets/hunter/products/alignment-systems/winalign-standard/documents/align-winalign-ops-3850-t.pdf"
   ],
   [
    "Front End Alignment & Camber Shims | MOOG Parts",
    "https://www.moogparts.com/parts/suspension/alignment-parts/rear-contact-shims.html"
   ],
   [
    "Make the Most of Your John Bean® Wheel Aligner with These Pro Tips",
    "https://pages.diagnosticsmarketing.snapon.com/Equipment-Focus-Wheel-Alignment-Quick-Tips"
   ],
   [
    "Handling Problems : Symptom Poor Alignment | Michelin USA",
    "https://www.michelinman.com/auto/auto-tips-and-advice/tire-damage/handling-problems/symptom-poor-alignment"
   ],
   [
    "Volvo V60 Owner's Manual, Model Year 2016 (US, TP 20238)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ]
  ],
  "qs": [
   {
    "q": "In a total four-wheel alignment, adjusting rear toe to specification results in:",
    "o": [
     "A thrust line parallel to the geometric centerline",
     "Zero front camber",
     "Equal caster side to side",
     "A reset steering angle sensor"
    ],
    "a": 0,
    "why": "Hunter says correctly adjusted rear toe makes the rear thrust line parallel to the geometric centerline.",
    "src": [
     "WinAlign® Alignment Software Operation Manual, Version 16 (Hunter Engineering Form 3850-T)",
     "https://www.hunter.com/globalassets/hunter/products/alignment-systems/winalign-standard/documents/align-winalign-ops-3850-t.pdf"
    ]
   },
   {
    "q": "Technician A says rear toe is adjusted before front toe. Technician B says a thrust line alignment adjusts rear toe to specification. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 0,
    "why": "Hunter's order puts rear toe before front toe, and in a thrust line alignment rear toe is measured but not adjusted.",
    "src": [
     "WinAlign® Alignment Software Operation Manual, Version 16 (Hunter Engineering Form 3850-T)",
     "https://www.hunter.com/globalassets/hunter/products/alignment-systems/winalign-standard/documents/align-winalign-ops-3850-t.pdf"
    ]
   }
  ]
 },
 "D49": {
  "body": [
   "The geometric centerline is a line through the midpoints of the front and rear axles; the thrust line is the bisector of the rear axle's total toe.",
   "Thrust angle is the angle between the geometric centerline and the thrust line, measured and displayed in degrees.",
   "Hunter names three alignment types: geometric centerline (front toe set to the centerline), thrust line (rear toe measured, front aligned to the thrust line), and total four-wheel (rear toe adjusted, then front aligned to the thrust line).",
   "Thrust line and total four-wheel alignments give a straight steering wheel; only total four-wheel alignment corrects dog-tracking.",
   "A rear subframe (cradle) out of position can change rear camber, toe and thrust angle, causing dog-tracking and early tire wear."
  ],
  "car": "Volvo's 2016 V60 owner's manual gives no alignment specifications or adjustment procedures; it only says correct front wheel alignment is very important for tire life and that the front wheel alignment should be checked by a trained and qualified Volvo service technician.",
  "src": [
   [
    "WinAlign® Alignment Software Operation Manual, Version 16 (Hunter Engineering Form 3850-T)",
    "https://www.hunter.com/globalassets/hunter/products/alignment-systems/winalign-standard/documents/align-winalign-ops-3850-t.pdf"
   ],
   [
    "Volvo V60 Owner's Manual, Model Year 2016 (US, TP 20238)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ]
  ],
  "qs": [
   {
    "q": "Thrust angle is the angle between:",
    "o": [
     "The geometric centerline and the thrust line",
     "The steering axis and vertical, seen from the side",
     "The two front wheels on the same axle",
     "The wheel and vertical, seen from the front"
    ],
    "a": 0,
    "why": "Hunter defines thrust angle as the angle formed by the geometric centerline and the thrust line of an axle.",
    "src": [
     "WinAlign® Alignment Software Operation Manual, Version 16 (Hunter Engineering Form 3850-T)",
     "https://www.hunter.com/globalassets/hunter/products/alignment-systems/winalign-standard/documents/align-winalign-ops-3850-t.pdf"
    ]
   },
   {
    "q": "A car dog-tracks down the road. Which alignment type can correct this?",
    "o": [
     "Geometric centerline alignment",
     "Thrust line alignment",
     "Total four-wheel alignment",
     "Front toe only"
    ],
    "a": 2,
    "why": "Hunter says total four-wheel alignment corrects a dog-tracking condition because rear toe is adjusted to make the thrust line parallel to the centerline.",
    "src": [
     "WinAlign® Alignment Software Operation Manual, Version 16 (Hunter Engineering Form 3850-T)",
     "https://www.hunter.com/globalassets/hunter/products/alignment-systems/winalign-standard/documents/align-winalign-ops-3850-t.pdf"
    ]
   }
  ]
 },
 "D50": {
  "body": [
   "The steering angle sensor reports the driver's steering input to the car's computers; according to Hunter, every vehicle built for the US market since 2012 has one.",
   "After an alignment the sensor's position is unknown, so many makers require a steering system reset as part of the alignment.",
   "Electronic stability control uses steering input together with lateral force, yaw rate and wheel speed; lane keeping and blind spot systems also use it.",
   "The reset comes after all mechanical adjustments are made and checked: a scan tool on the OBD-II port runs the maker's procedure and sets the sensor to the new thrust line, and some cars also need torque angle or yaw rate sensors reset.",
   "Hunter's software stresses following the on-screen reset instructions precisely and in order; codes in the related systems are read and cleared, and a post-scan and printout record the work."
  ],
  "car": "Volvo's 2016 V60 manual describes Electronic Stability Control (with Active Yaw Control) and Lane Keeping Aid but gives no steering angle sensor reset procedure; whether this car needs a reset after alignment is unconfirmed.",
  "src": [
   [
    "Performing a Steering Angle Sensor Reset | Hunter Engineering Company®",
    "https://hunter.com/media-center/industry-insight/steering-angle-sensor-reset"
   ],
   [
    "WinAlign® Alignment Software Operation Manual, Version 16 (Hunter Engineering Form 3850-T)",
    "https://www.hunter.com/globalassets/hunter/products/alignment-systems/winalign-standard/documents/align-winalign-ops-3850-t.pdf"
   ],
   [
    "Volvo V60 Owner's Manual, Model Year 2016 (US, TP 20238)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ]
  ],
  "qs": [
   {
    "q": "Why do many makers require a steering angle sensor reset after a wheel alignment?",
    "o": [
     "The sensor's position is unknown after the alignment",
     "The sensor wears out with every alignment",
     "Tire pressures change during alignment",
     "The battery must be disconnected for alignment"
    ],
    "a": 0,
    "why": "Hunter states that after a wheel alignment the position of the steering angle sensor is unknown, so a reset is required by many makers.",
    "src": [
     "Performing a Steering Angle Sensor Reset | Hunter Engineering Company®",
     "https://hunter.com/media-center/industry-insight/steering-angle-sensor-reset"
    ]
   },
   {
    "q": "Technician A says the steering angle sensor is reset after all mechanical alignment adjustments are finished. Technician B says some vehicles also need related sensors, such as yaw rate, reset. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 2,
    "why": "Hunter says the reset is prompted once mechanical adjustments are complete, and that some vehicles also require torque angle or yaw rate sensor resets.",
    "src": [
     "Performing a Steering Angle Sensor Reset | Hunter Engineering Company®",
     "https://hunter.com/media-center/industry-insight/steering-angle-sensor-reset"
    ]
   }
  ]
 },
 "D51": {
  "body": [
   "Reading a wear pattern means looking at how the tread has worn across its width and around the tire, then matching the shape to a cause before fitting a new tire, because a replacement on the same uncorrected cause wears the same way.",
   "Wear concentrated down the center points to chronic overinflation; wear on both outer shoulders points to chronic underinflation; wear on one edge only points to an alignment fault.",
   "Feathered or sawtooth block edges come from toe misalignment scrubbing the tread sideways against the road; cupping or scalloping (a wavy, dipped surface around the tire) points to out-of-balance wheels or worn shock absorbers, steering and suspension parts, and is most common on front tires.",
   "Flat spots come from a wheel locking under hard braking or from the car standing for a long time; a solid bar showing across the tread is the wear indicator at 2/32 inch, and the tire is worn out.",
   "A wear pattern cannot be reversed; fixing the cause only stops it getting worse, and a tire that starts wearing unevenly is rotated right away instead of at the next scheduled interval.",
   "Volvo's manual lists the same causes for its own tires: under- or over-inflation gives uneven tread wear, correct front wheel alignment is very important, and unbalanced wheels impair tire economy and comfort."
  ],
  "car": "Volvo's V60 manual ties uneven tread wear to incorrect inflation, stresses front alignment and names unbalanced wheels as a tire-economy problem; its TWI wear strips appear when about 1/16 inch (1.6 mm) of tread is left, the same depth as the 2/32-inch bar Michelin describes.",
  "src": [
   [
    "Wear Problems | Michelin USA",
    "https://www.michelinman.com/auto/auto-tips-and-advice/tire-damage/wear-problems"
   ],
   [
    "Tread Problems | Michelin USA",
    "https://www.michelinman.com/auto/auto-tips-and-advice/tire-damage/tread-problems"
   ],
   [
    "Tread Problems : Symptom Sawtooth | Michelin USA",
    "https://www.michelinman.com/auto/auto-tips-and-advice/tire-damage/tread-problems/symptom-sawtooth"
   ],
   [
    "Tread Problems : Symptom Cups | Michelin USA",
    "https://www.michelinman.com/auto/auto-tips-and-advice/tire-damage/tread-problems/symptom-cups"
   ],
   [
    "Tread Problems : Symptom Bar Across Tread | Michelin USA",
    "https://www.michelinman.com/auto/auto-tips-and-advice/tire-damage/tread-problems/symptom-bar-across-tread"
   ],
   [
    "V60 Owner's Manual MY16 (TP 20238, USA & Canada)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ]
  ],
  "qs": [
   {
    "q": "A customer's front tires are worn down on both outer shoulders while the center of the tread is still deep. The most likely cause is:",
    "o": [
     "Chronic overinflation",
     "Chronic underinflation",
     "Toe misalignment",
     "Worn shock absorbers"
    ],
    "a": 1,
    "why": "Michelin lists wear on both outer edges as the sign of chronic underinflation; center wear is the overinflation pattern, and toe and shock problems show up as feathering and cupping instead.",
    "src": [
     "Wear Problems | Michelin USA",
     "https://www.michelinman.com/auto/auto-tips-and-advice/tire-damage/wear-problems"
    ]
   },
   {
    "q": "Technician A says a sawtooth or feathered edge on the tread blocks is caused by toe misalignment scrubbing the tread against the road. Technician B says cupping or scalloping around the tire points to out-of-balance wheels or worn suspension and steering parts. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 2,
    "why": "Michelin's sawtooth page attributes feathered edges to misalignment and a toe correction, and its cups page says cupping points to wheels out of balance or suspension and steering components needing service.",
    "src": [
     "Tread Problems : Symptom Sawtooth | Michelin USA",
     "https://www.michelinman.com/auto/auto-tips-and-advice/tire-damage/tread-problems/symptom-sawtooth"
    ]
   }
  ]
 },
 "D52": {
  "body": [
   "A tire inspection covers tread depth, the tread surface, both sidewalls, the date code, and whether the size, load index and speed rating molded on the sidewall match the vehicle's tire placard.",
   "Tread is measured with a depth gauge; a tire is worn out at 2/32 inch, when the built-in wear bars sit flush with the tread, or when a penny placed upside down in a groove shows all of Lincoln's head. Volvo's manual puts its TWI strips at about 1/16 inch (1.6 mm) and says tires below that give very poor traction.",
   "Cuts, gouges, cracks, discoloration and bulges take a tire out of service; a sidewall bulge is an internal structural failure and the tire is replaced immediately.",
   "In a size such as 215/50R17, 215 is the section width in millimeters, 50 is the sidewall height as a percentage of the width, R means radial construction and 17 is the rim diameter in inches; the load index that follows is a weight code (95 equals 1,521 lb per tire) and the speed letter is the top sustained speed (T 118 mph, H 130 mph, V 149 mph, W 168 mph, Y 186 mph).",
   "XL or Extra Load marks a tire that carries more weight than a standard-load tire of the same size when inflated higher; MAX LOAD and MAX PRESS are limits set by the tire maker, not the pressure to run, and a replacement must match the original size, load index and speed rating, never smaller or lower in load capacity, with the two newest tires fitted on the rear axle.",
   "The DOT tire identification number ends in a four-digit date code, week then year (1513 means week 15 of 2013); Volvo recommends replacing tires after 6 years of normal service. Volvo's 2016 manual describes a two-character plant code after DOT, while 49 CFR 574.5 now specifies a three-symbol plant code, the older two-symbol format having been allowed until April 13, 2025."
  ],
  "car": "The V60's placard tire is 215/50 R17 Extra Load; Volvo's manual notes that the load index and speed rating may be missing from a sidewall because US law does not require them, and warns against any replacement tire with a lower load capacity than the originals because it lowers the car's GVW rating.",
  "src": [
   [
    "Tire Safety Ratings and Awareness | TireWise | NHTSA",
    "https://www.nhtsa.gov/vehicle-safety/tires"
   ],
   [
    "Tire Care Essentials | USTMA",
    "https://www.ustires.org/tire-care-safety/tire-care-essentials"
   ],
   [
    "Replacing Tires | USTMA",
    "https://www.ustires.org/tire-care-safety/replacing-tires"
   ],
   [
    "V60 Owner's Manual MY16 (TP 20238, USA & Canada)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ],
   [
    "How to Read Tire Size and Specs | Continental Tire",
    "https://continentaltire.com/learn/how-read-your-tire-sidewall"
   ],
   [
    "Flat and Damage Problems | Michelin USA",
    "https://www.michelinman.com/auto/auto-tips-and-advice/tire-damage/flat-and-damage-problems"
   ],
   [
    "49 CFR Part 574 -- Tire Identification and Recordkeeping",
    "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-V/part-574"
   ]
  ],
  "qs": [
   {
    "q": "A tire sidewall reads 215/50R17 95H. Which statement about these markings is correct?",
    "o": [
     "215 is the rim diameter in millimeters",
     "50 is the ratio of the tire's height to its width, in percent",
     "H means the tire is rated for 118 mph",
     "95 is the maximum inflation pressure in psi"
    ],
    "a": 1,
    "why": "Volvo's sidewall guide defines the second number as the ratio of height to width in percent; H is a 130 mph speed rating, 95 is a load index equal to 1,521 lb, and the rim diameter is the 17.",
    "src": [
     "V60 Owner's Manual MY16 (TP 20238, USA & Canada)",
     "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
    ]
   },
   {
    "q": "A tire's DOT code ends in 2319. Technician A says the tire was built in the 23rd week of 2019. Technician B says Volvo recommends replacing tires after 6 years of normal service even if tread remains. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 2,
    "why": "49 CFR 574.5(b)(3) defines the final four digits as the week and year of manufacture, and Volvo's manual says tires degrade with time and are generally replaced after 6 years of normal service.",
    "src": [
     "49 CFR Part 574 -- Tire Identification and Recordkeeping",
     "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-V/part-574"
    ]
   }
  ]
 },
 "D53": {
  "body": [
   "The pressure to set is the vehicle maker's cold pressure on the tire information placard, found on the driver's side B-pillar or door edge, not the MAX PRESS molded on the tire, which is the tire maker's ceiling.",
   "Tires are cold when they match the surrounding air, normally after at least 3 hours parked; after about 1 mile of driving they count as hot, pressure rises with heat, and a hot tire reading at or below the cold figure may be badly underinflated, so air is never bled from a hot tire.",
   "Procedure: remove the valve cap, press the gauge firmly onto the valve, add air to the placard figure, release any excess by pressing the metal pin in the valve and recheck, refit a plastic cap (metal caps can corrode), then check the tread for embedded nails and the sidewalls for gouges, cuts and bulges, and repeat for every tire including the spare.",
   "Pressure moves with temperature: Volvo's manual gives about 1 psi (7 kPa) lost per 10-degree drop, while USTMA gives one to two pounds per 10 degrees; both say to check at least monthly and before long trips, and Volvo adds that gas-station gauges may be inaccurate.",
   "Underinflation is the most common cause of tire failure: it builds heat, cuts load capacity and can end in tread separation or a blowout, while overinflation makes the tire easier to cut or damage on potholes; either one wears the tread unevenly.",
   "On a Volvo with the Tire Monitor, the system is recalibrated after any pressure change so its reference values match the new pressures."
  ],
  "car": "Volvo's pressure table gives 38 psi (260 kPa) front and rear for the V60's 215/50 R17 Extra Load tires for up to five persons, and 60 psi (420 kPa) for the optional T125/80R17 temporary spare; the placard on the driver's B-pillar covers only the tires fitted at the factory.",
  "src": [
   [
    "Tire Safety Ratings and Awareness | TireWise | NHTSA",
    "https://www.nhtsa.gov/vehicle-safety/tires"
   ],
   [
    "V60 Owner's Manual MY16 (TP 20238, USA & Canada)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ],
   [
    "Tire Care Essentials | USTMA",
    "https://www.ustires.org/tire-care-safety/tire-care-essentials"
   ],
   [
    "How to Read Tire Size and Specs | Continental Tire",
    "https://continentaltire.com/learn/how-read-your-tire-sidewall"
   ]
  ],
  "qs": [
   {
    "q": "Which of the following is the LEAST likely place to find the correct cold inflation pressure for a 2016 V60?",
    "o": [
     "The tire information placard on the driver's side B-pillar",
     "The tire inflation pressure table in the owner's manual",
     "The MAX PRESS figure molded on the tire sidewall",
     "The tire inflation decal in the driver's door opening"
    ],
    "a": 2,
    "why": "Volvo's manual says the maximum permissible inflation pressure on the sidewall is a limit set by the tire manufacturer, and sends the owner to the B-pillar placard or its pressure table for the recommended pressure.",
    "src": [
     "V60 Owner's Manual MY16 (TP 20238, USA & Canada)",
     "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
    ]
   },
   {
    "q": "A driver checks a tire right after a 20-mile highway run and reads 41 psi against a placard of 38 psi. Technician A says to bleed the tire down to 38 psi. Technician B says the tire is hot, the higher reading is normal, and it is rechecked after the car has sat at least 3 hours. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 1,
    "why": "Volvo's manual says never to bleed a hot tire because pressures normally rise above the cold spec after driving, and defines cold as parked for at least 3 hours.",
    "src": [
     "V60 Owner's Manual MY16 (TP 20238, USA & Canada)",
     "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
    ]
   }
  ]
 },
 "D54": {
  "body": [
   "Unbalanced wheels cause a shake felt through the steering wheel, seat or floor, especially at higher speeds; noise, vibration or pressure loss are signs to have a tire professional inspect the tires.",
   "Imbalance is the first suspect: it causes vibration, driver fatigue, premature and uneven tread wear and extra wear on suspension parts, and rebalancing may be the whole fix; if rebalancing does not cure it, the alignment and suspension components are checked next.",
   "Problems a plain spin balance cannot fix include tire uniformity (road force) variation, a bent rim with runout, a bead that is not seated evenly, and a tire that pulls; a load-roller balancer measures these and can show where to turn the tire on the rim to make the assembly round.",
   "A tire with a cut, crack or bulge comes out of service, and a sidewall bulge means an internal structural failure; cupped tread, most common on the front, points to out-of-balance wheels or worn steering and suspension parts.",
   "Curb and pothole strikes can permanently damage tires and wheels; Volvo's manual says that if heavy vibration, unsteady steering or noise appears while driving on a temporarily sealed tire, the driver slows down, parks safely, rechecks the tire for bumps and cracks and rechecks its pressure, and does not continue below 19 psi (1.3 bar)."
  ],
  "car": "Volvo's V60 manual names curb and pothole hits as permanent tire and wheel damage and unbalanced wheels as a comfort problem; its sealant procedure treats heavy vibration, unsteady steering or noise as a stop-and-recheck signal.",
  "src": [
   [
    "Do New Tyres Need Balancing? A Guide To | Goodyear Tyres",
    "https://goodyear.eu/en_gb/consumer/learn/do-new-tyres-need-balancing.html"
   ],
   [
    "Handling Problems : Symptom Vibration | Michelin USA",
    "https://www.michelinman.com/auto/auto-tips-and-advice/tire-damage/handling-problems/symptom-vibration"
   ],
   [
    "Road Force WalkAway® Wheel Balancer | Hunter Engineering Company®",
    "https://hunter.com/gsp9700"
   ],
   [
    "Tire Safety Ratings and Awareness | TireWise | NHTSA",
    "https://www.nhtsa.gov/vehicle-safety/tires"
   ],
   [
    "Flat and Damage Problems | Michelin USA",
    "https://www.michelinman.com/auto/auto-tips-and-advice/tire-damage/flat-and-damage-problems"
   ],
   [
    "Tread Problems : Symptom Cups | Michelin USA",
    "https://www.michelinman.com/auto/auto-tips-and-advice/tire-damage/tread-problems/symptom-cups"
   ],
   [
    "V60 Owner's Manual MY16 (TP 20238, USA & Canada)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ]
  ],
  "qs": [
   {
    "q": "A car shakes through the steering wheel at highway speed. The wheels were just rebalanced on a conventional spin balancer and the shake remains. Which is the LEAST likely next step?",
    "o": [
     "Check the rims for runout (a bent wheel)",
     "Check that both beads are seated evenly on each wheel",
     "Measure road force (tire uniformity) on a load-roller balancer",
     "Lower the tire pressures below the placard figure to soften the ride"
    ],
    "a": 3,
    "why": "Hunter lists rim runout, improper bead seating and tire uniformity (road force) as vibration causes a standard spin balance cannot fix; lowering pressure is not among the checks it names.",
    "src": [
     "Road Force WalkAway® Wheel Balancer | Hunter Engineering Company®",
     "https://hunter.com/gsp9700"
    ]
   },
   {
    "q": "Technician A says wheel imbalance can cause premature, uneven tire wear and extra wear on suspension parts, not just a shake. Technician B says that if rebalancing does not cure a vibration, the alignment and suspension components are checked next. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 2,
    "why": "Michelin's vibration page says imbalance leads to fatigue, premature or uneven wear and suspension wear, and that if rebalancing does not help, the alignment and suspension are checked.",
    "src": [
     "Handling Problems : Symptom Vibration | Michelin USA",
     "https://www.michelinman.com/auto/auto-tips-and-advice/tire-damage/handling-problems/symptom-vibration"
    ]
   }
  ]
 },
 "D55": {
  "body": [
   "Rotation moves tires between positions to even out wear; NHTSA and USTMA give 5,000 to 8,000 miles when the vehicle maker recommends rotating, but Volvo's V60 manual says the car has no required rotation, so Volvo's guidance governs this car.",
   "When Volvo tires are rotated they move only front to rear or rear to front on the same side, never left to right, so each tire keeps its direction of rotation; Volvo suggests a first rotation at about 3,000 miles (5,000 km), then every 6,000 miles (10,000 km), and only when front and rear wear is fairly even and tread is above 1/16 inch (1.6 mm).",
   "The tires with the most tread go on the rear axle to reduce the chance of oversteer under hard braking; directional tires carry an arrow on the sidewall; when swapping seasonal sets, each tire is marked with its position (LF, RR).",
   "Wheel removal: with the car on the ground, loosen the fasteners half to one turn, then jack at the marked attachment points on a firm, level surface and unscrew them fully; refitting starts by cleaning the contact surfaces on the wheel and hub, hand-tightening the fasteners, snugging them crosswise with the wrench, lowering the car, then tightening alternately crosswise to 103 ft-lb (140 Nm).",
   "After rotating, pressures are reset to the vehicle maker's spec and the assemblies are rebalanced; on a car with Volvo's Tire Monitor the system is recalibrated whenever the wheels are changed, and a tire that begins wearing unevenly is rotated at once."
  ],
  "car": "The V60's wheel bolts are torqued crosswise to 103 ft-lb (140 Nm) with the car back on the ground; Volvo requires no rotation, allows only front-to-rear moves, and the Tire Monitor needs a recalibration after any wheel change.",
  "src": [
   [
    "Tire Safety Ratings and Awareness | TireWise | NHTSA",
    "https://www.nhtsa.gov/vehicle-safety/tires"
   ],
   [
    "Tire Care Essentials | USTMA",
    "https://www.ustires.org/tire-care-safety/tire-care-essentials"
   ],
   [
    "V60 Owner's Manual MY16 (TP 20238, USA & Canada)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ],
   [
    "Do New Tyres Need Balancing? A Guide To | Goodyear Tyres",
    "https://goodyear.eu/en_gb/consumer/learn/do-new-tyres-need-balancing.html"
   ],
   [
    "Wear Problems | Michelin USA",
    "https://www.michelinman.com/auto/auto-tips-and-advice/tire-damage/wear-problems"
   ]
  ],
  "qs": [
   {
    "q": "Which rotation pattern does Volvo's 2016 V60 manual allow?",
    "o": [
     "Front to rear on the same side only",
     "Rearward cross: fronts straight back, rears crossed to the front",
     "Side to side on the same axle",
     "Any pattern, as long as it is done every 5,000 miles"
    ],
    "a": 0,
    "why": "Volvo's manual says the car has no required rotation and that rotated tires move only front to rear or rear to front, never left to right, so each tire keeps its direction of rotation.",
    "src": [
     "V60 Owner's Manual MY16 (TP 20238, USA & Canada)",
     "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
    ]
   },
   {
    "q": "Technician A says the wheel fasteners are torqued to final spec while the wheel is still in the air so the wheel cannot turn. Technician B says they are snugged crosswise, the car is lowered to the ground, and then they are tightened alternately crosswise to 103 ft-lb (140 Nm). Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 1,
    "why": "Volvo's wheel-installation steps are hand-tight, crosswise snug with the lug wrench, lower the vehicle, then alternately tighten crosswise to 103 ft. lbs. (140 Nm).",
    "src": [
     "V60 Owner's Manual MY16 (TP 20238, USA & Canada)",
     "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
    ]
   }
  ]
 },
 "D56": {
  "body": [
   "Dismounting and mounting is done on a tire machine by trained people because a mis-fitted assembly can burst with explosive force; the tire's diameter and width must match the rim (a 17-inch tire goes only on a 17-inch rim, never a 17.5), and a tire mounted on the wrong rim by mistake is scrapped, not moved to the right one, because the stretch can damage it invisibly.",
   "Before dismounting, the valve core is removed so every bit of pressure is released; the rim is checked for damage, rust, corrosion and distortion, tubeless tires go only on rims with safety humps, a new snap-in rubber valve (usually rated to 65 psi) is fitted, and a TPMS sensor is serviced as its maker specifies.",
   "The rim sits on the machine with its narrow ledge and deep well toward the mounting head: standard-mount rims face up, reverse-mount rims face down; both tire beads and the rim's bead humps, bead seats and flange are coated with a tire-mounting lubricant, never silicone, petroleum or solvent products.",
   "The bottom bead is worked into the rim well, then the top bead goes over the flange while pressure is kept on the sidewall 180 degrees from the head so the bead stays in the well; low-profile tires are harder and a plastic rim protector helps, and the technician watches for the most common mounting damage, a cut on the inside of the bead, which can cause an explosion during inflation or a failure later.",
   "Beads are seated with the rim locked on the machine or the assembly in a safety cage using a clip-on extension hose, with nobody standing, leaning or reaching over it, and never above 40 psi (275 kPa); if the beads have not popped at 40 psi the air is released and the cause found, and no flammable substance is ever used to seat a bead.",
   "Once both beads are seated evenly on both sides, pressure is set to the vehicle maker's operating figure; self-supporting run-flat tires are mounted only by shops certified for them."
  ],
  "car": "The V60's 215/50 R17 tires are mounted on 17-inch rims and set to Volvo's 38 psi after seating; Volvo's manual adds that the valve cap goes back on and only plastic caps are used because metal ones can corrode and seize.",
  "src": [
   [
    "Tire Mounting Safety Instruction for Continental Passenger Car and Light Truck Tires",
    "https://www.continental-tires.com/content/dam/conti-tires-cms/continental/market-content/ca/total-confidence-plan/tcs/Tire_Mounting_SafetyInstruction_PLT%20_LT%20Tires_EN_2023%20V2.pdf.coredownload.pdf"
   ],
   [
    "TISB Vol. 43 No. 4: Avoid Tire Bead Damage on Tire Mounting Machines that Secure the Rim from Underneath",
    "https://ustires.org/sites/default/files/2024-09/TISB_43%20No%204%20June%202024.pdf"
   ],
   [
    "V60 Owner's Manual MY16 (TP 20238, USA & Canada)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ]
  ],
  "qs": [
   {
    "q": "While seating the beads of a passenger tire, the beads have not popped onto the rim shoulders at 40 psi. The technician should most likely:",
    "o": [
     "Keep inflating up to the MAX PRESS figure on the sidewall",
     "Release the air, find and fix the cause, relubricate and try again",
     "Spray a flammable aerosol into the tire and ignite it to seat the beads",
     "Strike the sidewall with a hammer while adding more air"
    ],
    "a": 1,
    "why": "Continental and USTMA both cap bead-seating pressure at 40 psi (275 kPa); if the beads do not seat, the pressure is released and the cause identified, and flammable substances are never used.",
    "src": [
     "Tire Mounting Safety Instruction for Continental Passenger Car and Light Truck Tires",
     "https://www.continental-tires.com/content/dam/conti-tires-cms/continental/market-content/ca/total-confidence-plan/tcs/Tire_Mounting_SafetyInstruction_PLT%20_LT%20Tires_EN_2023%20V2.pdf.coredownload.pdf"
    ]
   },
   {
    "q": "Technician A says the valve core is removed to release all pressure before a tire is dismounted. Technician B says a 17-inch tire that was mistakenly mounted on a 17.5-inch rim can be moved to the correct rim as long as it looks undamaged. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 0,
    "why": "Continental's bulletin requires the valve insert to be removed before dismounting, and says a tire mounted in error on the wrong-sized rim is scrapped because the dangerous stretch can cause internal damage that is not visible.",
    "src": [
     "Tire Mounting Safety Instruction for Continental Passenger Car and Light Truck Tires",
     "https://www.continental-tires.com/content/dam/conti-tires-cms/continental/market-content/ca/total-confidence-plan/tcs/Tire_Mounting_SafetyInstruction_PLT%20_LT%20Tires_EN_2023%20V2.pdf.coredownload.pdf"
    ]
   }
  ]
 },
 "D57": {
  "body": [
   "Balancing spreads the weight of the wheel-and-tire assembly evenly so it spins without shaking; an unbalanced wheel vibrates at speed, fatigues the driver, wears tread unevenly and loads the suspension.",
   "The assembly is mounted on a balancer and spun; the machine reports how much weight is needed and where, the technician fits weights to the rim and spins again until no imbalance registers, then sets the tire pressure.",
   "Miscentering the wheel on the balancer is the number one cause of a bad balance and a returning customer, so how the wheel is mounted on the machine matters as much as the readout.",
   "New tires are always balanced when installed, and assemblies are rebalanced after a repair, after rotation, and when vibration or uneven wear appears; there is no mileage interval for balancing.",
   "A road-force balancer adds a load roller that presses on the spinning tire to find uniformity problems, rim runout and pull that weights alone cannot fix, and can show how to reposition the tire on the rim for a rounder assembly.",
   "Volvo's manual lists unbalanced wheels among the things that hurt tire economy and driving comfort."
  ],
  "car": "Volvo's V60 manual names unbalanced wheels as a tire-economy and driving-comfort problem.",
  "src": [
   [
    "Do New Tyres Need Balancing? A Guide To | Goodyear Tyres",
    "https://goodyear.eu/en_gb/consumer/learn/do-new-tyres-need-balancing.html"
   ],
   [
    "Handling Problems : Symptom Vibration | Michelin USA",
    "https://www.michelinman.com/auto/auto-tips-and-advice/tire-damage/handling-problems/symptom-vibration"
   ],
   [
    "Road Force WalkAway® Wheel Balancer | Hunter Engineering Company®",
    "https://hunter.com/gsp9700"
   ],
   [
    "Tire Safety Ratings and Awareness | TireWise | NHTSA",
    "https://www.nhtsa.gov/vehicle-safety/tires"
   ],
   [
    "V60 Owner's Manual MY16 (TP 20238, USA & Canada)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ]
  ],
  "qs": [
   {
    "q": "All of the following are reasons to rebalance a wheel-and-tire assembly EXCEPT:",
    "o": [
     "A tire was just repaired and remounted",
     "The tires were rotated",
     "A set mileage has passed since the last balance",
     "A new vibration has appeared at speed"
    ],
    "a": 2,
    "why": "Goodyear lists repair, rotation and noticeable vibration as reasons to rebalance and says there is no mileage-based interval for balancing.",
    "src": [
     "Do New Tyres Need Balancing? A Guide To | Goodyear Tyres",
     "https://goodyear.eu/en_gb/consumer/learn/do-new-tyres-need-balancing.html"
    ]
   },
   {
    "q": "Hunter Engineering names one factor as the number one cause of improper balancing and customer comebacks. It is:",
    "o": [
     "Using clip-on instead of adhesive weights",
     "Miscentering the wheel on the balancer",
     "Balancing with the tire overinflated",
     "Balancing a directional tire"
    ],
    "a": 1,
    "why": "Hunter's balancer page states that miscentering is the number one cause of improper balancing and customer comebacks.",
    "src": [
     "Road Force WalkAway® Wheel Balancer | Hunter Engineering Company®",
     "https://hunter.com/gsp9700"
    ]
   }
  ]
 },
 "D58": {
  "body": [
   "FMVSS 138 (49 CFR 571.138) requires vehicles of 10,000 lb GVWR or less to light a low-pressure telltale within 20 minutes of any tire falling to 25 percent below the placard cold pressure or the Table 1 minimum (20 psi standard-load, 23 psi extra-load P-metric), whichever is higher; a direct system reads sensors inside the wheels, an indirect system compares wheel speeds through the ABS sensors because a low tire shrinks in diameter and turns faster.",
   "Lamp check: the telltale lights as a bulb check when the ignition is switched to On with the engine off; a system malfunction is shown by the same lamp flashing for 60 to 90 seconds after each start (Volvo says about 1 minute) and then staying on until the fault is fixed, and the sequence repeats every start.",
   "A steady lamp means at least one tire is significantly underinflated: all four are checked with a gauge, inflated to the placard and, on a Volvo Tire Monitor car, the system is recalibrated; a lamp that lights on cold mornings and goes out later means marginally low pressure. Because the lamp only comes on at roughly 25 percent low, TPMS is no substitute for a monthly gauge check.",
   "Volvo's status screen (MY CAR > Settings > Car settings > Tire monitoring) shows all wheels green when the system is working and pressures are at or above spec, one yellow wheel for one low tire, all yellow for two or more, and all gray while the system is unavailable, which can need several minutes above 20 mph (30 km/h) to clear.",
   "Relearn on Volvo's indirect Tire Monitor: engine off, inflate all tires to the placard, ignition mode II, MY CAR > Settings > Car settings > Tire monitoring, OK/MENU, Calibrate tire pressure, OK/MENU, then drive; calibration completes while driving, pauses if the car is parked and switched off, resumes on the next drive, gives no confirmation when finished but reports a failure, and must be redone every time wheels or pressures change.",
   "Direct TPMS on these Volvos transmits above about 20 mph; when a sensor is moved its seal, nut and valve core are replaced, the car sits 15 minutes with the ignition off after sensors are installed, a different tire dimension needs the system reconfigured by a technician, wheels without sensors trigger a message after 10 minutes above 20 mph, and a temporary spare has no sensor."
  ],
  "car": "A 2016 V60 can carry either system: the MY CAR menu shows 'Tire monitoring' for the indirect Tire Monitor (this car) or 'Tire pressure' for direct TPMS. With a 38 psi placard, 25 percent below is 28.5 psi; in its TPMS section Volvo also notes the systems use temperature-compensated values, so clearing a warning may take inflating about 3 to 4 psi above the cold spec.",
  "src": [
   [
    "49 CFR 571.138 -- Standard No. 138; Tire pressure monitoring systems.",
    "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-V/part-571/subpart-B/section-571.138"
   ],
   [
    "Tire Safety Ratings and Awareness | TireWise | NHTSA",
    "https://www.nhtsa.gov/vehicle-safety/tires"
   ],
   [
    "V60 Owner's Manual MY16 (TP 20238, USA & Canada)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ],
   [
    "Tire Monitor - introduction",
    "https://www.volvocars.com/us/support/car/v60/2016/article/c43f9d2decd9952dc0a801513772c990"
   ],
   [
    "Tire Care Essentials | USTMA",
    "https://www.ustires.org/tire-care-safety/tire-care-essentials"
   ]
  ],
  "qs": [
   {
    "q": "A 2016 V60's tire pressure lamp flashes for about a minute after every start and then stays on. This most likely indicates:",
    "o": [
     "One tire is 25 percent below the placard pressure",
     "A fault in the tire pressure monitoring system itself",
     "The temporary spare is low",
     "The system is in the middle of a calibration drive"
    ],
    "a": 1,
    "why": "FMVSS 138 S4.4(c) and Volvo's manual both describe a malfunction as the low-pressure lamp flashing (60 to 90 seconds, about 1 minute per Volvo) and then staying lit, repeating at each start until repaired; a low tire gives a steady lamp.",
    "src": [
     "49 CFR 571.138 -- Standard No. 138; Tire pressure monitoring systems.",
     "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-V/part-571/subpart-B/section-571.138"
    ]
   },
   {
    "q": "Technician A says that after correcting the pressures on a Volvo with the indirect Tire Monitor, the system is recalibrated from the MY CAR menu and finishes on its own while driving. Technician B says the indirect system measures pressure with sensors inside each wheel. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 0,
    "why": "Volvo's manual says Tire Monitor works from the tires' rotational speed through the ABS sensors, not pressure sensors, and that calibration is started from MY CAR > Settings > Car settings > Tire monitoring and completes while driving.",
    "src": [
     "V60 Owner's Manual MY16 (TP 20238, USA & Canada)",
     "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
    ]
   }
  ]
 },
 "D59": {
  "body": [
   "A puncture is repairable only when it is in the tread area, no larger than 1/4 inch (6 mm) in diameter, and does not run into the shoulder or belt edge; shoulder and sidewall injuries are not repaired and the tire comes out of service.",
   "The tire is dismounted and inspected inside, including the inner liner; the repair fills the injury channel with a rubber stem or plug and seals the liner with a patch, often as a one-piece combination unit, and repairs may not overlap one another.",
   "Not acceptable: a plug alone, an outside-in repair, any repair made with the tire still on the wheel (Michelin calls an on-the-wheel plug-only repair unreliable and dangerous), and repairing a tire that already carries an improper repair, which is scrapped.",
   "A nail found in a tire is left in place and the car driven carefully to a shop, because a nail that has not fully penetrated may not have caused a puncture; a sidewall bulge is an internal failure and the tire is replaced immediately.",
   "Volvo's optional tire sealing kit is a temporary fix for tread holes only: the nail stays in, the tire is inflated to 22 to 44 psi within seven minutes (below 22 psi the hole is too large and the car is not driven), then driven about 2 miles (3 km) at no more than 50 mph (80 km/h) to spread the compound, kept under 120 miles (200 km) and 50 mph, and inspected by a technician who decides between permanent repair and replacement.",
   "Volvo warns the sealing compound can cause wrong readings or damage a direct TPMS sensor, and the empty compound bottle cannot be removed by the owner; a Volvo technician removes and disposes of it."
  ],
  "car": "If your V60 has the optional Volvo tire sealing kit, its 120-mile (200 km) and 50 mph (80 km/h) limits apply until a shop inspects the tire; Volvo says large holes or tears cannot be sealed and the hole must be in the tread, not the sidewall.",
  "src": [
   [
    "Tire Repair Basics | USTMA",
    "https://www.ustires.org/tire-care-safety/tire-repair-basics"
   ],
   [
    "Tread Problems | Michelin USA",
    "https://www.michelinman.com/auto/auto-tips-and-advice/tire-damage/tread-problems"
   ],
   [
    "Handling Problems : Symptom Steering Problems | Michelin USA",
    "https://www.michelinman.com/auto/auto-tips-and-advice/tire-damage/handling-problems/symptom-steering-problems"
   ],
   [
    "Flat and Damage Problems | Michelin USA",
    "https://www.michelinman.com/auto/auto-tips-and-advice/tire-damage/flat-and-damage-problems"
   ],
   [
    "V60 Owner's Manual MY16 (TP 20238, USA & Canada)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ]
  ],
  "qs": [
   {
    "q": "Which puncture is most likely repairable under USTMA's tire repair guidance?",
    "o": [
     "A 3/16-inch nail hole in the center of the tread",
     "A 1/4-inch cut in the sidewall",
     "A 3/8-inch hole in the tread",
     "A tread puncture that angles into the shoulder"
    ],
    "a": 0,
    "why": "USTMA limits repairs to the tread area, to injuries no larger than 1/4 inch (6 mm), and rules out anything extending into the shoulder or belt edge.",
    "src": [
     "Tire Repair Basics | USTMA",
     "https://www.ustires.org/tire-care-safety/tire-repair-basics"
    ]
   },
   {
    "q": "Technician A says a string plug pushed in from outside, with the tire left on the wheel, is an acceptable permanent repair for a small tread puncture. Technician B says the tire is dismounted, inspected inside, and repaired with a plug through the injury plus a patch on the inner liner. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 1,
    "why": "USTMA rules out plug-only, outside-in and on-the-wheel repairs and requires dismounting, a full inner-liner inspection, and a stem or plug plus a patch.",
    "src": [
     "Tire Repair Basics | USTMA",
     "https://www.ustires.org/tire-care-safety/tire-repair-basics"
    ]
   }
  ]
 }
};
