/* Study entries for the G1 task list (data/g1tasks.js), written area by area from fetched sources only.
   V60_G1_ENTRIES[taskId] = { body: [lines], car: "how it applies to the V60" | null, src: [[title, url], ...],
     qs: [{ q, o: [4 options], a: index, why, src: [title, url] }, ...] }
   A task with no entry yet shows "No sourced entry yet" in the app. Never write an entry from memory: fetch the source first.
   Merge researched entries with tools/gen/g1merge.py; it validates ids, sources and questions. */
window.V60_G1_ENTRIES = {
 "D1": {
  "body": [
   "The supplemental restraint system (SRS) covers more than the airbags: Volvo lists seat belt pretensioners, front airbags, side impact (SIPS) airbags, inflatable curtains and the front passenger occupant weight sensor, all watched by the SRS control module.",
   "The front airbags are fired by gas generators that inflate them with nitrogen; a full deployment and deflation takes about one fifth of a second, so an accidental firing during repair work is a serious injury risk.",
   "Volvo's manual says never to repair any SRS part yourself, never to open the airbag cover on the steering wheel or the dash, and to leave all SRS work to a trained Volvo technician.",
   "Volvo's manual gives two power-down timings: before removing the battery, switch the ignition off, take out the remote key and wait at least 5 minutes; for a flood-damaged car, switch off for at least 10 minutes and disconnect the battery before anything else, because otherwise an airbag could deploy.",
   "After power is restored, the SRS warning light should come on with the ignition in mode I or II and go out after about 6 seconds; a light that stays on or comes on while driving means the system needs inspection."
  ],
  "car": "The V60's driver front airbag is in the steering wheel hub and the passenger airbag is behind the panel above the glove compartment, marked SRS AIRBAG; the manual gives no airbag-disabling procedure for owners and sends all SRS work to a Volvo technician.",
  "src": [
   [
    "Volvo V60 Owner's Manual, Web Edition, Model Year 2016, US (TP 20238): Supplemental Restraint System (SRS), Front airbags, Battery – changing",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ]
  ],
  "qs": [
   {
    "q": "A 2016 V60 has stood in floodwater and the carpets are soaked. Before the car is towed, what does Volvo's owner's manual say to do first?",
    "o": [
     "Start the engine to check whether the SRS light goes out",
     "Insert the remote key and cycle the ignition to mode II",
     "Switch the ignition off for at least 10 minutes and disconnect the battery",
     "Remove the steering wheel airbag cover to check for water"
    ],
    "a": 2,
    "why": "For a flood-damaged car, Volvo says not to start it or insert the key, but to switch off the ignition for at least 10 minutes and disconnect the battery, because an airbag could otherwise deploy.",
    "src": [
     "Volvo V60 Owner's Manual, Web Edition, Model Year 2016, US (TP 20238): Supplemental Restraint System (SRS)",
     "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
    ]
   },
   {
    "q": "After reconnecting a V60's battery, the technician turns the ignition to mode II. Technician A says the SRS warning light should come on and go out after about 6 seconds if no fault is found. Technician B says an SRS light that stays on can be cleared by the owner opening the steering wheel airbag cover and checking the connector. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 0,
    "why": "Volvo says the SRS light normally goes out after about 6 seconds, and also says never to open the airbag cover or repair SRS parts yourself; a light that stays on needs a trained Volvo technician.",
    "src": [
     "Volvo V60 Owner's Manual, Web Edition, Model Year 2016, US (TP 20238): Supplemental Restraint System (SRS), Front airbags",
     "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
    ]
   }
  ]
 },
 "D2": {
  "body": [
   "This task means finding out whether a car has hydraulic power steering, with a fluid reservoir and pump, or electric power steering, where an electric motor supports the steering rack.",
   "On a hydraulic system, the fluid level must sit between the MIN and MAX marks on the reservoir, and only the fluid the carmaker specifies is used; Volvo's manual gives the specification only as power steering fluid recommended by Volvo.",
   "Volvo's manual says to check the level without removing the cap, to keep the area around the reservoir clean while checking, and that the fluid does not normally need changing.",
   "A steering-pump remanufacturer warns that running a hydraulic system with too little or too much fluid can damage it.",
   "An electric system shows up in other ways: Volvo's 2016 V60 press material says the Drive-E engines use Electrical Power Assist Steering (EPAS), where an electric motor supports the steering rack, and the V60 fuse list includes a 100 A fuse for the power steering."
  ],
  "car": "Volvo's September 2016 V60 specification sheet lists 'Power Assisted Rack and Pinion Steering', a McPherson strut front suspension with coil springs, hydraulic shock absorbers and a stabilizer bar, and an independent rear suspension with coil springs, hydraulic shock absorbers and a stabilizer bar; Volvo's 2016 and 2015.5 V60 press texts say the T5 Drive-E has Electrical Power Assist Steering (EPAS). Volvo's documents conflict on fluid: the MY2016 owner's manual, written for all engines, still has a power steering fluid section and shows a reservoir in one engine-bay picture, but its 4-cylinder engine-bay picture shows no power steering reservoir, so on this electric-assist car there is no fluid to check (unconfirmed by a hands-on look).",
  "src": [
   [
    "Volvo V60 Owner's Manual, Web Edition, Model Year 2016, US (TP 20238): Engine compartment – overview, Engine compartment – power steering fluid, Power steering – specification, Fuses – engine compartment",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ],
   [
    "Volvo V60 - model year 2016",
    "https://www.media.volvocars.com/uk/en-gb/media/documenttext/244979"
   ],
   [
    "Model Overview: 2015.5 Volvo V60",
    "https://www.media.volvocars.com/us/en-us/media/documenttext/244969"
   ],
   [
    "Volvo V60 specifications (Volvo Cars, Sept 2016)",
    "https://mb.cision.com/Public/23609/4188195/aa2ab97f7dbcaad0.pdf"
   ],
   [
    "Troubleshooting guidelines: Steering Pumps",
    "https://www.elstock.com/media/1644/troubleshooting_steering_pumps.pdf"
   ]
  ],
  "qs": [
   {
    "q": "A technician opens the hood of a 2016 V60 T5 Drive-E and can find no power steering reservoir. Which is the most likely reason?",
    "o": [
     "The reservoir is under the battery tray",
     "The car uses Electrical Power Assist Steering, with an electric motor on the rack",
     "The pump is driven by the timing belt and shares the engine oil",
     "The fluid is checked through the brake fluid reservoir"
    ],
    "a": 1,
    "why": "Volvo's 2016 V60 press text says the Drive-E engines come with EPAS, which uses an electric motor to support the steering rack, so there is no hydraulic reservoir to find.",
    "src": [
     "Volvo V60 - model year 2016",
     "https://www.media.volvocars.com/uk/en-gb/media/documenttext/244979"
    ]
   },
   {
    "q": "On a car with hydraulic power steering, which statement about the fluid check is correct according to Volvo's V60 manual?",
    "o": [
     "The level must be between the MIN and MAX marks",
     "The cap must be removed to read the level",
     "The fluid must be changed at every oil change",
     "Any brake fluid may be used to top up"
    ],
    "a": 0,
    "why": "Volvo's manual says the power steering fluid level must be between MIN and MAX, that it is checked without removing the cap, and that it does not normally need changing.",
    "src": [
     "Volvo V60 Owner's Manual, Web Edition, Model Year 2016, US (TP 20238): Engine compartment – power steering fluid",
     "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
    ]
   }
  ]
 },
 "D3": {
  "body": [
   "On cars with an engine-driven hydraulic pump, the pump carries a pulley on the accessory belt drive, so this task covers that belt, its tensioner and the pulleys.",
   "Gates says low belt tension causes slipping, noise, heat, early belt wear and poor accessory output, while too much tension wears the belt and the driven parts.",
   "Gates lists tensioner failure signs: rust bleeding or cracks at the arm, base or bracket; a pulley bearing that is noisy, rough or stiff when turned by hand with the belt off; a worn, chipped or cracked pulley; abnormal belt tracking; squeaks or rattles; large or constant arm oscillation; binding arm movement; and an arm with no spring resistance through its full travel.",
   "Gates calls pulley misalignment the most common cause of early belt failure and advises replacing the tensioner whenever the multi-ribbed belt is replaced.",
   "When fitting a tensioner, Gates says to photograph or sketch the belt routing first, then tighten the mounting bolts in a star pattern to one third, then two thirds, then the full torque the carmaker specifies."
  ],
  "car": "Not applicable to this car's steering: Volvo's press texts say the T5 Drive-E uses Electrical Power Assist Steering, with an electric motor supporting the rack, so there is no steering pump and no belt or pulley for one. The engine's accessory belt still drives other parts, which no source here lists for this engine.",
  "src": [
   [
    "Replacing Tensioners",
    "https://www.gatestechzone.com/en/installation/metals/tensioners"
   ],
   [
    "Belt Tensioner Failure Signs",
    "https://www.gatestechzone.com/en/problem-diagnosis/accessory-drive-system/tensioner-failure-signs"
   ],
   [
    "Volvo V60 - model year 2016",
    "https://www.media.volvocars.com/uk/en-gb/media/documenttext/244979"
   ],
   [
    "Model Overview: 2015.5 Volvo V60",
    "https://www.media.volvocars.com/us/en-us/media/documenttext/244969"
   ]
  ],
  "qs": [
   {
    "q": "With the belt removed, a technician spins the tensioner pulley by hand and feels roughness. What does Gates recommend?",
    "o": [
     "Replace only the pulley bearing",
     "Replace the complete tensioner",
     "Add belt dressing and recheck",
     "Increase belt tension"
    ],
    "a": 1,
    "why": "Gates says noise, resistance or roughness when the pulley is turned by hand points to bearing wear and that the complete tensioner should be replaced, not just the pulley.",
    "src": [
     "Belt Tensioner Failure Signs",
     "https://www.gatestechzone.com/en/problem-diagnosis/accessory-drive-system/tensioner-failure-signs"
    ]
   },
   {
    "q": "All of these are tensioner failure signs listed by Gates EXCEPT:",
    "o": [
     "Shiny streaks or gouges on the arm or spring housing",
     "Continuous back-and-forth arm oscillation while running",
     "The arm moves smoothly and with resistance through its full range",
     "Rust bleeding from between the arm and base"
    ],
    "a": 2,
    "why": "Gates says the arm should move smoothly with resistance stop to stop; binding, loss of spring force, rust bleed, wear streaks and excessive oscillation are the failure signs.",
    "src": [
     "Belt Tensioner Failure Signs",
     "https://www.gatestechzone.com/en/problem-diagnosis/accessory-drive-system/tensioner-failure-signs"
    ]
   }
  ]
 },
 "D4": {
  "body": [
   "This task covers tracing noise, vibration and leaks on an engine-driven hydraulic power steering pump.",
   "A steering-pump remanufacturer lists air locked in the system as a cause of a distinct whirring from the pump with the engine running; the fix is to bleed the system, and some units need vacuum bleeding.",
   "Heavy steering with low or no pressure can come from debris in the system, collapsed hydraulic lines or trapped air; the same source says most lines last around 10 years and that debris in old fluid can point to failing lines.",
   "Fluid on the outside of the pump after spills have been cleaned up means a leak; at the line connections the usual causes are O-rings or gaskets not renewed, or a dirty or damaged mating surface or thread.",
   "Freightliner's rack inspection bulletin checks for rack leaks by wiping the rack clean, warming the fluid to at least 200 °F (93 °C), turning the wheels to the stops three times each way and then looking for fresh fluid under the boots."
  ],
  "car": "Not applicable: Volvo's press texts say the T5 Drive-E uses Electrical Power Assist Steering with an electric motor on the rack, so there is no hydraulic pump to diagnose. The V60 manual does say the electric assist can overheat, reduce assist slightly and show a message in the instrument panel.",
  "src": [
   [
    "Troubleshooting guidelines: Steering Pumps",
    "https://www.elstock.com/media/1644/troubleshooting_steering_pumps.pdf"
   ],
   [
    "Inspection Procedure for Rack and Pinion Steering Gear (Freightliner Service Bulletin 46-53, June 2012)",
    "https://static.nhtsa.gov/odi/tsbs/2012/SB-10044665-1931.pdf"
   ],
   [
    "Volvo V60 - model year 2016",
    "https://www.media.volvocars.com/uk/en-gb/media/documenttext/244979"
   ],
   [
    "Volvo V60 Owner's Manual, Web Edition, Model Year 2016, US (TP 20238): Adjustable steering force",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ]
  ],
  "qs": [
   {
    "q": "Right after a hydraulic power steering pump is replaced, it makes a distinct whirring with the engine running. What is the most likely cause?",
    "o": [
     "Air locked in the steering system",
     "Worn outer tie rod ends",
     "Over-tightened Oetiker boot clamps",
     "An oversized steering wheel"
    ],
    "a": 0,
    "why": "The pump remanufacturer lists an air lock as the cause of a distinct whirring from the unit and says to bleed the system, with vacuum bleeding on some units.",
    "src": [
     "Troubleshooting guidelines: Steering Pumps",
     "https://www.elstock.com/media/1644/troubleshooting_steering_pumps.pdf"
    ]
   },
   {
    "q": "A hydraulic power steering pump shows fluid at its line connection after the area was cleaned. Technician A says the O-rings may not have been renewed. Technician B says a dirty or damaged mating surface could cause it. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 2,
    "why": "The remanufacturer lists both O-rings or gaskets not replaced and an unclean or damaged mating surface or thread as causes of a leak at the hydraulic lines.",
    "src": [
     "Troubleshooting guidelines: Steering Pumps",
     "https://www.elstock.com/media/1644/troubleshooting_steering_pumps.pdf"
    ]
   }
  ]
 },
 "D5": {
  "body": [
   "This task is removing and fitting an engine-driven hydraulic power steering pump with its brackets and pulley.",
   "A steering-pump remanufacturer says to find out why the old pump failed before fitting a new one, because unrepaired faults elsewhere can damage the new pump.",
   "The replacement must match the old unit: same pulley size and offset, same mounting measurements and same connections.",
   "The same source recommends flushing the system when the pump is replaced, checking the hoses (and replacing all of them if any feel stiff, porous or hard), renewing the O-rings and gaskets on the lines, bleeding the system with fresh fluid of the carmaker's specification, and finishing with the level between MIN and MAX.",
   "Where the pump is belt-driven, Gates says a tensioner is tightened in a star pattern to one third, two thirds and then full manufacturer torque, and that the pulleys should be checked and a new belt fitted during a drive overhaul."
  ],
  "car": "Not applicable: Volvo's press texts say the T5 Drive-E uses Electrical Power Assist Steering with an electric motor supporting the rack, so the car has no power steering pump, bracket or pulley.",
  "src": [
   [
    "Troubleshooting guidelines: Steering Pumps",
    "https://www.elstock.com/media/1644/troubleshooting_steering_pumps.pdf"
   ],
   [
    "Replacing Tensioners",
    "https://www.gatestechzone.com/en/installation/metals/tensioners"
   ],
   [
    "Volvo V60 - model year 2016",
    "https://www.media.volvocars.com/uk/en-gb/media/documenttext/244979"
   ]
  ],
  "qs": [
   {
    "q": "Before installing a replacement hydraulic power steering pump, which step does the pump remanufacturer list first?",
    "o": [
     "Bleed the system with a vacuum pump",
     "Determine what caused the old pump to fail",
     "Overfill the reservoir above MAX",
     "Replace the tie rod ends"
    ],
    "a": 1,
    "why": "The installation steps begin with determining the cause of the old pump's breakdown, because a new pump will not fix the rest of the system and unrepaired faults may damage it.",
    "src": [
     "Troubleshooting guidelines: Steering Pumps",
     "https://www.elstock.com/media/1644/troubleshooting_steering_pumps.pdf"
    ]
   },
   {
    "q": "When comparing a new power steering pump with the old one, all of these must match EXCEPT:",
    "o": [
     "Pulley size",
     "Pulley offset",
     "Mounting (fixation) measurements",
     "The colour of the old fluid"
    ],
    "a": 3,
    "why": "The remanufacturer says to match pulley size, offset, fixation measurements and connections; old fluid is checked for debris, not matched.",
    "src": [
     "Troubleshooting guidelines: Steering Pumps",
     "https://www.elstock.com/media/1644/troubleshooting_steering_pumps.pdf"
    ]
   }
  ]
 },
 "D6": {
  "body": [
   "This task covers the high-pressure and return hoses, fittings, O-rings, coolers and filters of a hydraulic power steering system.",
   "A steering-pump remanufacturer notes that hoses wear from the inside out, so a visual check cannot judge them; if any hose feels stiff, porous or hard, all of them should be replaced because they have aged together.",
   "The same source says most lines last around 10 years, that collapsed lines can cause low pressure and heavy steering, and that debris in the old fluid can show the lines are breaking down.",
   "O-rings and gaskets on the hydraulic lines should always be renewed when a rack or pump is replaced; reusing them is a listed cause of leaks.",
   "No sourced procedure found yet for power steering coolers and filters."
  ],
  "car": "Not applicable: Volvo's press texts say the T5 Drive-E uses Electrical Power Assist Steering with an electric motor on the rack, so there are no power steering hoses, coolers or filters on this car.",
  "src": [
   [
    "Troubleshooting guidelines: Steering Pumps",
    "https://www.elstock.com/media/1644/troubleshooting_steering_pumps.pdf"
   ],
   [
    "Volvo V60 - model year 2016",
    "https://www.media.volvocars.com/uk/en-gb/media/documenttext/244979"
   ]
  ],
  "qs": [
   {
    "q": "A power steering hose looks fine on the outside but feels hard and stiff. What does the pump remanufacturer recommend?",
    "o": [
     "Keep it, since the outside shows no cracks",
     "Replace only that hose",
     "Replace all the power steering hoses",
     "Wrap it with tape"
    ],
    "a": 2,
    "why": "Hoses wear from the inside out, so their state cannot be judged by eye; if any feel stiff, porous or hard, all should be replaced because they have aged equally.",
    "src": [
     "Troubleshooting guidelines: Steering Pumps",
     "https://www.elstock.com/media/1644/troubleshooting_steering_pumps.pdf"
    ]
   },
   {
    "q": "A new steering rack is installed and the old line O-rings are reused. Which problem is most likely?",
    "o": [
     "A leak at the hydraulic line connections",
     "Rapid outer tie rod wear",
     "A pulled tensioner arm",
     "An SRS warning light"
    ],
    "a": 0,
    "why": "The remanufacturer lists O-rings or gaskets not replaced as a leak cause and says to always renew them when fitting a new rack or pump.",
    "src": [
     "Troubleshooting guidelines: Steering Pumps",
     "https://www.elstock.com/media/1644/troubleshooting_steering_pumps.pdf"
    ]
   }
  ]
 },
 "D7": {
  "body": [
   "Rack-and-pinion boots (bellows) seal the ends of the steering rack and the inner tie rod joints against water and dirt.",
   "Freightliner's rack inspection bulletin cleans the bellows, removes and discards the clamps, checks the inner tie rods for looseness, wipes the rack shafts clean and looks for power steering fluid under the bellows.",
   "Any tear or poor seal in a boot means it must be replaced; a parts-industry inspection guide also recommends a new boot whenever an inner tie rod is replaced, and squeezing the boot can help tell a worn inner joint from a loose rack.",
   "In that bulletin, new Oetiker clamps are crimped until the ear width is 0.08 to 0.16 in (2 to 4 mm), all three barbs must engage, and a stretched or over-tightened clamp is discarded, because a poor seal lets moisture in and causes corrosion.",
   "The bulletin's grease and sealant steps are specific to that truck's gear; the carmaker's own procedure applies to any other vehicle."
  ],
  "car": "Volvo's September 2016 V60 specification sheet lists power assisted rack-and-pinion steering, so the car has rack boots; no Volvo source fetched gives a boot replacement procedure for it.",
  "src": [
   [
    "Inspection Procedure for Rack and Pinion Steering Gear (Freightliner Service Bulletin 46-53, June 2012)",
    "https://static.nhtsa.gov/odi/tsbs/2012/SB-10044665-1931.pdf"
   ],
   [
    "Ball Joint, Control Arm, and Tie Rod Inspection Tips | KnowYourParts",
    "https://www.knowyourparts.com/technical-resources/ride-control/ball-joint-control-arm-and-tie-rod-inspection-tips/"
   ],
   [
    "Volvo V60 specifications (Volvo Cars, Sept 2016)",
    "https://mb.cision.com/Public/23609/4188195/aa2ab97f7dbcaad0.pdf"
   ]
  ],
  "qs": [
   {
    "q": "After crimping a new Oetiker clamp on a rack boot, only two of its three barbs are engaged. What should be done?",
    "o": [
     "Leave it; two barbs are enough",
     "Crimp it further until the ear is flat",
     "Remove and discard it and fit a new clamp",
     "Add a zip tie beside it"
    ],
    "a": 2,
    "why": "The bulletin says all three barbs must be engaged, and if they are not after crimping the clamp is removed, discarded and replaced.",
    "src": [
     "Inspection Procedure for Rack and Pinion Steering Gear (Freightliner Service Bulletin 46-53, June 2012)",
     "https://static.nhtsa.gov/odi/tsbs/2012/SB-10044665-1931.pdf"
    ]
   },
   {
    "q": "Technician A says a rack boot should be replaced whenever the inner tie rod is replaced. Technician B says a torn boot can stay if the inner tie rod has no play. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 0,
    "why": "The parts-industry guide recommends a new boot with every inner tie rod, and the bulletin says any tear or improper seal requires replacement, since it lets moisture in.",
    "src": [
     "Ball Joint, Control Arm, and Tie Rod Inspection Tips | KnowYourParts",
     "https://www.knowyourparts.com/technical-resources/ride-control/ball-joint-control-arm-and-tie-rod-inspection-tips/"
    ]
   }
  ]
 },
 "D8": {
  "body": [
   "This task is draining old fluid from a hydraulic power steering system, refilling it with the specified fluid and removing trapped air.",
   "A steering-pump remanufacturer recommends flushing the system when a pump is replaced, so that particles that may have caused the failure are removed.",
   "After the work, the system is filled with fresh power steering fluid of the carmaker's specification and bled; some systems need a vacuum pump to clear air locks, and an air lock shows up as a whirring pump or heavy steering.",
   "The finished level must be between the MIN and MAX marks, since too little or too much fluid can damage the system.",
   "No sourced step-by-step bleeding sequence found yet; the carmaker's procedure applies."
  ],
  "car": "Not applicable: Volvo's press texts say the T5 Drive-E uses Electrical Power Assist Steering with an electric motor supporting the rack, so there is no steering fluid to flush or bleed.",
  "src": [
   [
    "Troubleshooting guidelines: Steering Pumps",
    "https://www.elstock.com/media/1644/troubleshooting_steering_pumps.pdf"
   ],
   [
    "Volvo V60 - model year 2016",
    "https://www.media.volvocars.com/uk/en-gb/media/documenttext/244979"
   ]
  ],
  "qs": [
   {
    "q": "Why does the pump remanufacturer recommend flushing the steering system when replacing the pump?",
    "o": [
     "To raise the fluid's boiling point",
     "To remove particles that may have caused the old pump to fail",
     "To reset the steering angle sensor",
     "To loosen the tie rod sleeves"
    ],
    "a": 1,
    "why": "The guide says flushing ensures particles that could have caused the pump failure are removed.",
    "src": [
     "Troubleshooting guidelines: Steering Pumps",
     "https://www.elstock.com/media/1644/troubleshooting_steering_pumps.pdf"
    ]
   },
   {
    "q": "After normal bleeding, a hydraulic steering system still has an air lock. What does the remanufacturer suggest?",
    "o": [
     "Use a vacuum pump to remove the air",
     "Overfill above MAX",
     "Replace the tie rod ends",
     "Disconnect the battery for 10 minutes"
    ],
    "a": 0,
    "why": "The guide says some units need vacuum bleeding to remove all air locks.",
    "src": [
     "Troubleshooting guidelines: Steering Pumps",
     "https://www.elstock.com/media/1644/troubleshooting_steering_pumps.pdf"
    ]
   }
  ]
 },
 "D9": {
  "body": [
   "This task is reading the stored fault codes for the steering and suspension systems and writing them down before any repair or code clearing.",
   "Volvo's manual describes OBD II as part of the engine management system: it stores diagnostic information about emission controls, records a message about each fault, permanent or temporary, and can light the Check Engine light.",
   "The manual notes that disconnecting the battery leaves OBD II data incomplete and not ready for inspection, and that about two half-hour trips of mixed stop-and-go and highway driving are typically needed to reach readiness again.",
   "Other systems report faults through their own warnings: the V60's electric steering assist shows a message in the instrument panel when it overheats and reduces assist.",
   "No sourced procedure found yet for reading the V60's steering and suspension control-module codes."
  ],
  "car": "Volvo's manual says the V60's power steering can get too warm, reduce assist slightly and show a message in the instrument panel; the manual does not describe how to read steering or chassis codes.",
  "src": [
   [
    "Volvo V60 Owner's Manual, Web Edition, Model Year 2016, US (TP 20238): Onboard Diagnostic System, Adjustable steering force",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ]
  ],
  "qs": [
   {
    "q": "A V60's battery was just disconnected during a repair. According to Volvo's manual, which is most likely at an OBD II emissions inspection the same day?",
    "o": [
     "The car shows not ready because diagnostic data is incomplete",
     "All monitors report ready immediately",
     "The Check Engine light flashes continuously",
     "The SRS light stays on"
    ],
    "a": 0,
    "why": "Volvo says disconnecting the battery can leave OBD II information incomplete and not ready, and two half-hour mixed trips are typically needed to reach readiness.",
    "src": [
     "Volvo V60 Owner's Manual, Web Edition, Model Year 2016, US (TP 20238): Onboard Diagnostic System",
     "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
    ]
   }
  ]
 },
 "D10": {
  "body": [
   "This task covers checking the electronic parts of an adjustable or self-levelling suspension, such as ride-height sensors, actuators and their wiring.",
   "On the V60, Volvo's optional Four-C (Continuously Controlled Chassis Concept) adjusts the shock absorbers' characteristics, with three settings: Comfort, Sport and Advanced.",
   "The setting in use when the engine is switched off comes back at the next start, and the setting is changed with buttons in the center console.",
   "Volvo's manual also links Four-C to an optional speed-dependent power steering whose steering force can be set to Low, Medium or High, but only when the car is not moving.",
   "No sourced procedure found yet for testing ride-height sensors or suspension wiring."
  ],
  "car": "Four-C is an option on the V60 according to Volvo's manual; whether this car has it is unconfirmed. Volvo's September 2016 spec sheet lists McPherson struts at the front and independent rear suspension, both with coil springs and hydraulic shock absorbers.",
  "src": [
   [
    "Volvo V60 Owner's Manual, Web Edition, Model Year 2016, US (TP 20238): Active chassis (Four C), Adjustable steering force",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ],
   [
    "Volvo V60 specifications (Volvo Cars, Sept 2016)",
    "https://mb.cision.com/Public/23609/4188195/aa2ab97f7dbcaad0.pdf"
   ]
  ],
  "qs": [
   {
    "q": "A V60 with Four-C was switched off in Sport mode. Which setting is active at the next engine start, according to Volvo?",
    "o": [
     "Comfort, always",
     "Sport",
     "Advanced",
     "None until a button is pressed"
    ],
    "a": 1,
    "why": "Volvo's manual says the setting in use when the engine is switched off is activated the next time the engine is started.",
    "src": [
     "Volvo V60 Owner's Manual, Web Edition, Model Year 2016, US (TP 20238): Active chassis (Four C)",
     "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
    ]
   }
  ]
 },
 "D11": {
  "body": [
   "The pitman arm, centre link (drag link) and idler arm are parts of a steering-box linkage; in TRW's linkage manual the drag link joins the pitman arm to the steering arm, and tie rods join the tie rod arms.",
   "TRW's linkage service manual starts with a visual check of drag links, tie rods, tie rod ends and the pitman arm for cracks, breaks, bends, broken clamps and gouges from rubbing parts, and confirms the correct pitman arm and steering arms are fitted.",
   "It also checks for torn seals, missing or damaged grease fittings, wear at the socket throat, excessive lash in the sockets and missing cotter pins.",
   "Nuts must be tight at the drag-link-to-pitman-arm and drag-link-to-steering-arm joints and at the clamps on the adjustable sections.",
   "That manual is written for heavy commercial vehicles; the carmaker's procedure applies to a passenger car."
  ],
  "car": "Volvo's September 2016 V60 specification sheet lists 'Power Assisted Rack and Pinion Steering', so the V60 has no pitman arm, centre link or idler arm; the same sheet lists McPherson strut front and independent rear suspension, each with coil springs, hydraulic shock absorbers and a stabilizer bar.",
  "src": [
   [
    "TRW Commercial Steering Systems linkage service manual, Section 2: On-Vehicle Inspection",
    "https://www.trwaftermarket.com/globalassets/na/trucksteering---literature/linkages-lit/linkages-sm/lnk-insp.pdf"
   ],
   [
    "Volvo V60 specifications (Volvo Cars, Sept 2016)",
    "https://mb.cision.com/Public/23609/4188195/aa2ab97f7dbcaad0.pdf"
   ]
  ],
  "qs": [
   {
    "q": "A technician is asked to inspect the idler arm on a 2016 Volvo V60. What is the most likely finding?",
    "o": [
     "The idler arm is worn and needs grease",
     "The car has none, because it uses rack-and-pinion steering",
     "The idler arm is behind the rear subframe",
     "The idler arm is part of the airbag module"
    ],
    "a": 1,
    "why": "Volvo's V60 specification sheet lists power assisted rack-and-pinion steering, which uses no idler arm, pitman arm or centre link.",
    "src": [
     "Volvo V60 specifications (Volvo Cars, Sept 2016)",
     "https://mb.cision.com/Public/23609/4188195/aa2ab97f7dbcaad0.pdf"
    ]
   },
   {
    "q": "During a visual inspection of a pitman-arm steering linkage, all of these are faults EXCEPT:",
    "o": [
     "A missing cotter pin at a socket",
     "A torn socket seal",
     "A missing grease fitting",
     "Tight nuts at the drag link to pitman arm joint"
    ],
    "a": 3,
    "why": "TRW lists missing cotter pins, seal tears and missing or damaged grease fittings as faults, and says the drag link to pitman arm nuts must be tight.",
    "src": [
     "TRW Commercial Steering Systems linkage service manual, Section 2: On-Vehicle Inspection",
     "https://www.trwaftermarket.com/globalassets/na/trucksteering---literature/linkages-lit/linkages-sm/lnk-insp.pdf"
    ]
   }
  ]
 },
 "D12": {
  "body": [
   "Tie rod ends are ball-stud-and-socket joints in the steering linkage; small wear in each one can add up to a significant change in toe.",
   "For outer tie rod ends, a parts-industry inspection guide says to push and pull the joint by hand, not with a pry bar, and to do a dry-park test with the car on the ground while a helper rocks the steering wheel; any free play or vertical movement means replacement.",
   "Inner tie rods are checked for horizontal movement during the dry-park test and for knocking or clicking when steering; squeezing the rack boot helps tell a worn joint from a loose rack, and the boot is replaced with the joint.",
   "Torn seals or water or corrosion at the stud also mean replacement; before removing an outer end, measure its position or count the turns so toe can be set close again, then confirm toe with an alignment.",
   "In TRW's heavy-vehicle linkage manual, any threaded joint looseness needs repair, socket thread ends visible through the sleeve slot mean the rod is misadjusted, and in-and-out ball stud movement of 1/8 in (3 mm) or more takes the vehicle out of service."
  ],
  "car": "Volvo's September 2016 V60 specification sheet lists power assisted rack-and-pinion steering with McPherson strut front suspension (coil springs, hydraulic shock absorbers, stabilizer bar), so the car has inner tie rods inside the rack boots and outer tie rod ends at the knuckles; no Volvo tie rod specification was found.",
  "src": [
   [
    "Ball Joint, Control Arm, and Tie Rod Inspection Tips | KnowYourParts",
    "https://www.knowyourparts.com/technical-resources/ride-control/ball-joint-control-arm-and-tie-rod-inspection-tips/"
   ],
   [
    "TRW Commercial Steering Systems linkage service manual, Section 2: On-Vehicle Inspection",
    "https://www.trwaftermarket.com/globalassets/na/trucksteering---literature/linkages-lit/linkages-sm/lnk-insp.pdf"
   ],
   [
    "Volvo V60 specifications (Volvo Cars, Sept 2016)",
    "https://mb.cision.com/Public/23609/4188195/aa2ab97f7dbcaad0.pdf"
   ]
  ],
  "qs": [
   {
    "q": "During a dry-park test, a helper rocks the steering wheel while the technician watches an outer tie rod end. The joint moves up and down. What is the correct action?",
    "o": [
     "Grease it and retest next service",
     "Replace the outer tie rod end",
     "Adjust the toe only",
     "Replace the rack boot only"
    ],
    "a": 1,
    "why": "The inspection guide says any vertical movement of the outer joint during the dry-park test means it should be replaced.",
    "src": [
     "Ball Joint, Control Arm, and Tie Rod Inspection Tips | KnowYourParts",
     "https://www.knowyourparts.com/technical-resources/ride-control/ball-joint-control-arm-and-tie-rod-inspection-tips/"
    ]
   },
   {
    "q": "Technician A says a pry bar gives the best check for tie rod end play. Technician B says to measure or count turns before removing an outer tie rod end so toe can be reset close to before. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 1,
    "why": "The guide says not to use a pry bar, which can give skewed readings, and to measure the tie rod's position or count turns before removal, then confirm toe is in specification.",
    "src": [
     "Ball Joint, Control Arm, and Tie Rod Inspection Tips | KnowYourParts",
     "https://www.knowyourparts.com/technical-resources/ride-control/ball-joint-control-arm-and-tie-rod-inspection-tips/"
    ]
   }
  ]
 },
 "D13": {
  "body": [
   "A steering linkage damper (steering stabilizer) is a damper unit clamped to the steering linkage, in Roadmaster's kit by a bracket on the tie rod; MOOG describes its job as reducing vibration and steering shimmy and stopping steering oscillation.",
   "Roadmaster's installation instructions say to inspect the drag link, tie rod ends and other steering parts first, because worn parts with excessive play cause handling problems that a stabilizer will not fix.",
   "The steering wheel is centred and locked before fitting, the stabilizer must clear all chassis and steering parts through the full suspension travel, and a test drive confirms the car does not pull and the wheel returns to centre.",
   "Roadmaster also says to inspect the stabilizer's fasteners for tightness once a year and not to use an air impact wrench on its bolts.",
   "No sourced wear limits found yet for steering dampers."
  ],
  "car": null,
  "src": [
   [
    "Auto Steering Stabilizers & Car Steering Dampers | MOOG Parts",
    "https://www.moogparts.com/parts/steering/steering-stabilizers.html"
   ],
   [
    "Steering Stabilizer Installation Instructions, Kit RBK32 (Roadmaster)",
    "https://www.roadmasterinc.com/content/pdfinst/RBK32.pdf"
   ]
  ],
  "qs": [
   {
    "q": "A vehicle has front-end shimmy, and the owner wants a steering stabilizer fitted. Inspection finds excessive play in the tie rod ends. What should happen first, according to Roadmaster?",
    "o": [
     "Fit the stabilizer; it will mask the play",
     "Replace the worn steering parts before fitting the stabilizer",
     "Increase tire pressure",
     "Remove the steering damper entirely"
    ],
    "a": 1,
    "why": "Roadmaster says worn drag link and tie rod ends cause handling problems a stabilizer will not fix, and should be replaced before it is installed.",
    "src": [
     "Steering Stabilizer Installation Instructions, Kit RBK32 (Roadmaster)",
     "https://www.roadmasterinc.com/content/pdfinst/RBK32.pdf"
    ]
   }
  ]
 },
 "D14": {
  "body": [
   "Diagnosing a front noise, handling, ride height or ride quality complaint begins with the vehicle's history: past repairs, how it handles, how it is used, and whether the shocks or struts have 50,000 miles (80,000 km) or more on them.",
   "A road test checks for harshness over bumps, bouncing or floating, diving, squatting or rolling in maneuvers, poor stability on rough roads, abrupt topping out or bottoming out, and unusual suspension noise.",
   "Moog's symptom chart lists coil springs, strut assemblies, sway bar bushings and sway bar links among the parts behind body lean when turning, accelerating or braking.",
   "Ride height is checked against the factory service manual before parts are replaced or the car is aligned, because camber and toe readings are only accurate at the correct ride height.",
   "On Volvos with leveling control (air suspension), Volvo says to turn leveling control off before lifting the car with a jack, because the height change can cause problems in the pneumatic suspension; the V90 menu path is Settings, My Car, Parking Brake and Suspension, Disable Leveling Control."
  ],
  "car": "Volvo's V60 specification lists the front suspension as McPherson struts with coil springs, hydraulic shock absorbers and a stabilizer bar, so there is no air suspension to disable on this car.",
  "src": [
   [
    "How to Conduct a Shock or Strut Inspection",
    "https://www.monroe.com/technical-resources/tech-tips/how-to-conduct-a-shock-strut-inspection.html"
   ],
   [
    "Car Suspension & Steering Diagrams | MOOG Parts",
    "https://www.moogparts.com/technical/diagnostic-center/car-crossover.html"
   ],
   [
    "THE IMPACTS OF AGED, OVERLOADED AND MODIFIED SUSPENSIONS – WHAT YOU NEED TO KNOW FOR A SUCCESSFUL INSPECTION AND REPAIR - Mevotech",
    "https://www.mevotech.com/article/the-impacts-of-aged-overloaded-and-modified-suspensions-what-you-need-to-know-for-a-successful-inspection-and-repair/"
   ],
   [
    "V90 Leveling control settings | Volvo Support US",
    "https://www.volvocars.com/us/support/car/v90/article/68aee4d18e50b791c0a80151549e8abd/"
   ],
   [
    "Volvo V60 specifications (Volvo Cars, Sept 2016)",
    "https://mb.cision.com/Public/23609/4188195/aa2ab97f7dbcaad0.pdf"
   ]
  ],
  "qs": [
   {
    "q": "A car is going in for a wheel alignment after a suspension repair. Technician A says ride height should be checked against the service manual first. Technician B says that on a Volvo with leveling control, leveling control should be turned off before the car is lifted with a jack. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 2,
    "why": "Mevotech says alignments are accurate only at the correct ride height, checked by the factory method, and Volvo says to turn off leveling control before jacking because the height change can upset the pneumatic suspension.",
    "src": [
     "V90 Leveling control settings | Volvo Support US",
     "https://www.volvocars.com/us/support/car/v90/article/68aee4d18e50b791c0a80151549e8abd/"
    ]
   },
   {
    "q": "A customer says the car leans excessively when cornering and braking. Which part is LEAST likely to cause this?",
    "o": [
     "Coil springs",
     "Strut assemblies",
     "Sway bar links",
     "Wheel hub assembly"
    ],
    "a": 3,
    "why": "Moog's diagnostic chart ties lean in turns, acceleration and braking to coil springs, strut assemblies, sway bar bushings and links; hub assemblies are listed for vibration, shimmy and ABS light complaints instead.",
    "src": [
     "Car Suspension & Steering Diagrams | MOOG Parts",
     "https://www.moogparts.com/technical/diagnostic-center/car-crossover.html"
    ]
   }
  ]
 },
 "D15": {
  "body": [
   "A control arm is made up of the arm body, a bushing that attaches it to the frame, and a ball joint that attaches it to the wheel; many front suspensions have an upper and a lower arm on each side.",
   "Worn control arm bushings show up as a clunk over bumps or when accelerating or braking, pulling or wandering, loose steering in corners, steering wheel shimmy, and wear on the inner or outer tread edges.",
   "Mevotech says control arm bushings take most of the force during braking, accelerating and cornering, and lists pulling under braking or acceleration and camber-type tire wear as signs they are failing.",
   "The check includes a road test (accelerate from a stop and feel for a clunk) and a look at each bushing for cracks, tears, leaks, wear and excess movement.",
   "Know Your Parts warns that pry bars and pliers are rarely called for in manufacturer procedures and can give misleading readings, so bushings and joints are checked by hand and by eye."
  ],
  "car": "Volvo's V60 specification lists McPherson struts at the front; Mevotech describes that design as pivoting on the upper strut mount and a lower ball joint.",
  "src": [
   [
    "Signs & Symptoms of a Failing Control Arm",
    "https://www.moogparts.com/parts-matter/Signs-of-a-Failing-Control-Arm.html"
   ],
   [
    "Top 5 Indicators of Bushing Failure and What to do About Them - Mevotech",
    "https://www.mevotech.com/article/5-indicators-of-bushing-failure/"
   ],
   [
    "Accurate Diagnoses: How to Check for Worn or Loose Chassis Parts - Mevotech",
    "https://www.mevotech.com/article/accurate-diagnoses-how-to-check-for-worn-or-loose-chassis-parts/"
   ],
   [
    "Ball Joint, Control Arm, and Tie Rod Inspection Tips | KnowYourParts",
    "https://www.knowyourparts.com/technical-resources/ride-control/ball-joint-control-arm-and-tie-rod-inspection-tips/"
   ],
   [
    "Suspension 101: The Pros & Cons of Common Suspension Types - Mevotech",
    "https://www.mevotech.com/article/suspension-101-the-pros-cons-of-common-suspension-types/"
   ],
   [
    "Volvo V60 specifications (Volvo Cars, Sept 2016)",
    "https://mb.cision.com/Public/23609/4188195/aa2ab97f7dbcaad0.pdf"
   ]
  ],
  "qs": [
   {
    "q": "A car clunks from the front when pulling away from a stop and pulls slightly under braking. The front tires show camber-type wear. Which is the most likely cause?",
    "o": [
     "Worn control arm bushings",
     "A worn wheel hub bearing",
     "A leaking strut boot",
     "Low brake fluid"
    ],
    "a": 0,
    "why": "Mevotech lists a clunk when accelerating or braking, pulling under braking or acceleration, and camber wear as indicators of control arm bushing failure.",
    "src": [
     "Top 5 Indicators of Bushing Failure and What to do About Them - Mevotech",
     "https://www.mevotech.com/article/5-indicators-of-bushing-failure/"
    ]
   },
   {
    "q": "Technician A says a large pry bar is the standard tool for checking control arm bushings and ball joints. Technician B says pry bar checks can give misleading readings and cause damage. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 1,
    "why": "Know Your Parts says manufacturer procedures rarely call for a pry bar and that using one can cause damage and skewed readings, so inspection is done by hand and eye.",
    "src": [
     "Ball Joint, Control Arm, and Tie Rod Inspection Tips | KnowYourParts",
     "https://www.knowyourparts.com/technical-resources/ride-control/ball-joint-control-arm-and-tie-rod-inspection-tips/"
    ]
   }
  ]
 },
 "D16": {
  "body": [
   "The jounce bumper (KYB calls it a strut bumper) limits suspension travel so the strut does not bottom out; the strut boot covers the polished piston rod.",
   "A missing or damaged bumper or boot is replaced to avoid early strut failure; the boot keeps dirt, salt and debris off the rod, which helps prevent leaks and rod corrosion.",
   "Monroe's Strut-Mate boot kit is a direct replacement for a damaged jounce bumper or boot, and its bumper is closed-cell urethane meant to soften severe impacts.",
   "On a road test, abrupt topping out or bottoming out of the suspension is one of the faults Monroe lists for a shock or strut inspection.",
   "KYB recommends replacing the strut boot (and mount) whenever the struts are replaced. No sourced procedure for rebound bumpers specifically was found yet."
  ],
  "car": null,
  "src": [
   [
    "KYB Strut Mounts & Boots | OE-Quality Suspension Components",
    "https://www.kyb.com/products/strut-mounts-and-boots/"
   ],
   [
    "Strut Accessories | Monroe Shocks & Struts",
    "https://www.monroe.com/products/restore-your-ride/accessories.html"
   ],
   [
    "How to Conduct a Shock or Strut Inspection",
    "https://www.monroe.com/technical-resources/tech-tips/how-to-conduct-a-shock-strut-inspection.html"
   ],
   [
    "Should I replace other parts while having my struts replaced? - KYB Americas LLC",
    "https://www.kyb.com/resource/faqs/should-i-replace-other-parts-while-having-my-struts-replaced/"
   ]
  ],
  "qs": [
   {
    "q": "During strut replacement, the old jounce bumper is found crumbled and the boot is torn. Technician A says these should be replaced because they protect the new strut. Technician B says the bumper only reduces noise and can be left out. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 0,
    "why": "KYB says the bumper limits travel so the strut does not bottom out and the boot keeps contaminants off the shaft; Monroe says replacing missing or damaged bumpers and boots helps avoid premature strut failure.",
    "src": [
     "KYB Strut Mounts & Boots | OE-Quality Suspension Components",
     "https://www.kyb.com/products/strut-mounts-and-boots/"
    ]
   },
   {
    "q": "What is the main job of a strut boot?",
    "o": [
     "To set ride height",
     "To keep dirt and debris off the polished piston rod",
     "To act as the steering pivot bearing",
     "To hold the coil spring in compression"
    ],
    "a": 1,
    "why": "KYB says boots protect the strut shaft from contaminants, and Monroe says its boot protects the piston rod from rust and corrosion.",
    "src": [
     "Strut Accessories | Monroe Shocks & Struts",
     "https://www.monroe.com/products/restore-your-ride/accessories.html"
    ]
   }
  ]
 },
 "D17": {
  "body": [
   "Track bars and radius arms are suspension linkages that connect the chassis to the suspension, in the same family as control arms.",
   "The federal minimum periodic inspection standard (49 CFR 396, Appendix A) rejects any part of a torque, radius or tracking component assembly, or its attaching parts, that is cracked, loose, broken or missing.",
   "That same standard notes that loose bushings in torque or track rods are not, by themselves, a reject item under that rule.",
   "No sourced step-by-step procedure for this task was found yet."
  ],
  "car": "Volvo's V60 specification lists the front suspension as McPherson struts, coil springs, hydraulic shock absorbers and a stabilizer bar; no track bar or radius arm is listed.",
  "src": [
   [
    "Suspension 101: The Pros & Cons of Common Suspension Types - Mevotech",
    "https://www.mevotech.com/article/suspension-101-the-pros-cons-of-common-suspension-types/"
   ],
   [
    "Appendix A to Part 396—Minimum Periodic Inspection Standards",
    "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-396/appendix-Appendix%20A%20to%20Part%20396"
   ],
   [
    "Volvo V60 specifications (Volvo Cars, Sept 2016)",
    "https://mb.cision.com/Public/23609/4188195/aa2ab97f7dbcaad0.pdf"
   ]
  ],
  "qs": [
   {
    "q": "Under the federal minimum periodic inspection standards, which radius or tracking component condition is NOT listed as a reject item on its own?",
    "o": [
     "A cracked radius arm",
     "A missing attaching bolt",
     "A broken track bar",
     "A loose bushing in a track rod"
    ],
    "a": 3,
    "why": "Appendix A to Part 396 rejects cracked, loose, broken or missing torque, radius or tracking components but excludes loose bushings in torque or track rods.",
    "src": [
     "Appendix A to Part 396—Minimum Periodic Inspection Standards",
     "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-396/appendix-Appendix%20A%20to%20Part%20396"
    ]
   }
  ]
 },
 "D18": {
  "body": [
   "A ball joint has a housing, a ball stud, bearings, an end cover and a Belleville washer or spring that keeps axial play at zero as it wears; the spring cannot take up sideways wear, which affects camber and tire wear.",
   "Load-carrying joints are checked with the arm supported so the joint is unloaded, using a dial indicator for axial (up-down) movement and moving the knuckle for lateral movement.",
   "On a strut suspension the lower joint is a follower joint: the strut is let fully extend with a stand under the cradle to read axial play, then a jack under the joint and a turn of the steering wheel show lateral play.",
   "A joint with a built-in wear indicator is checked with the vehicle on its wheels; on some joints with grease fittings, a grease gun that will no longer couple to the fitting means the joint is worn out.",
   "A torn boot lets water and road debris into the socket and leads to wear; the commercial-vehicle inspection standard rejects any non-rotational motion over 1/4 inch between a linkage member and its attachment point."
  ],
  "car": "Volvo's V60 specification lists McPherson struts at the front; Mevotech describes that design as pivoting on the upper strut mount and a lower ball joint.",
  "src": [
   [
    "Ball Joint, Control Arm, and Tie Rod Inspection Tips | KnowYourParts",
    "https://www.knowyourparts.com/technical-resources/ride-control/ball-joint-control-arm-and-tie-rod-inspection-tips/"
   ],
   [
    "Socket-Style Chassis Parts | MOOG Parts",
    "https://www.moogparts.com/parts-matter/Whats-Inside-a-Socket-Style-Part.html"
   ],
   [
    "Appendix A to Part 396—Minimum Periodic Inspection Standards",
    "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-396/appendix-Appendix%20A%20to%20Part%20396"
   ],
   [
    "Suspension 101: The Pros & Cons of Common Suspension Types - Mevotech",
    "https://www.mevotech.com/article/suspension-101-the-pros-cons-of-common-suspension-types/"
   ],
   [
    "Volvo V60 specifications (Volvo Cars, Sept 2016)",
    "https://mb.cision.com/Public/23609/4188195/aa2ab97f7dbcaad0.pdf"
   ]
  ],
  "qs": [
   {
    "q": "A ball joint has a built-in wear indicator. How should it be checked?",
    "o": [
     "With the vehicle raised and the wheel hanging",
     "With the vehicle on its wheels",
     "With a pry bar under the tire",
     "With the strut removed"
    ],
    "a": 1,
    "why": "Know Your Parts says a joint with a built-in wear indicator is checked for play with the vehicle on its wheels.",
    "src": [
     "Ball Joint, Control Arm, and Tie Rod Inspection Tips | KnowYourParts",
     "https://www.knowyourparts.com/technical-resources/ride-control/ball-joint-control-arm-and-tie-rod-inspection-tips/"
    ]
   },
   {
    "q": "Technician A says the lower ball joint on a MacPherson strut suspension is a follower joint. Technician B says a ball joint's Belleville spring takes up sideways wear as well as axial wear. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 0,
    "why": "Know Your Parts lists the strut-suspension lower joint under follower (unloaded) joint inspection and says the Belleville washer keeps axial play at zero but cannot compensate for lateral wear.",
    "src": [
     "Ball Joint, Control Arm, and Tie Rod Inspection Tips | KnowYourParts",
     "https://www.knowyourparts.com/technical-resources/ride-control/ball-joint-control-arm-and-tie-rod-inspection-tips/"
    ]
   }
  ]
 },
 "D19": {
  "body": [
   "A solid axle is a dependent suspension: both wheels are tied to one beam and move together; it comes in driven and non-driven forms and is used for heavy loads.",
   "Mevotech lists high load capacity and easy maintenance as its strengths and poor handling, weight and limited adjustment as its weaknesses.",
   "The federal minimum periodic inspection standard rejects a front axle beam with any crack or any obvious welded repair.",
   "No sourced procedure for measuring solid-axle misalignment was found yet."
  ],
  "car": "Volvo's V60 specification lists the front suspension as McPherson struts with coil springs, hydraulic shock absorbers and a stabilizer bar, not a solid axle. The sheet uses the word independent only for the rear suspension.",
  "src": [
   [
    "Suspension 101: The Pros & Cons of Common Suspension Types - Mevotech",
    "https://www.mevotech.com/article/suspension-101-the-pros-cons-of-common-suspension-types/"
   ],
   [
    "Appendix A to Part 396—Minimum Periodic Inspection Standards",
    "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-396/appendix-Appendix%20A%20to%20Part%20396"
   ],
   [
    "Volvo V60 specifications (Volvo Cars, Sept 2016)",
    "https://mb.cision.com/Public/23609/4188195/aa2ab97f7dbcaad0.pdf"
   ]
  ],
  "qs": [
   {
    "q": "Which statement about a solid front axle is correct?",
    "o": [
     "Each front wheel moves independently of the other",
     "Both wheels are joined by a common beam and move together",
     "It is the usual design on light unibody cars",
     "It pivots on an upper strut mount and a lower ball joint"
    ],
    "a": 1,
    "why": "Mevotech describes a solid axle as a dependent suspension whose wheels are connected by a common beam and move together; the strut-mount pivot describes a MacPherson strut.",
    "src": [
     "Suspension 101: The Pros & Cons of Common Suspension Types - Mevotech",
     "https://www.mevotech.com/article/suspension-101-the-pros-cons-of-common-suspension-types/"
    ]
   },
   {
    "q": "A front axle beam shows a neat weld across one section. Under the federal periodic inspection standard, this is:",
    "o": [
     "Acceptable if painted",
     "Acceptable if the weld is under 1/4 inch",
     "A reject item",
     "Only a concern if the tires show wear"
    ],
    "a": 2,
    "why": "Appendix A to Part 396 lists any crack or any obvious welded repair in the front axle beam as a reject condition.",
    "src": [
     "Appendix A to Part 396—Minimum Periodic Inspection Standards",
     "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-396/appendix-Appendix%20A%20to%20Part%20396"
    ]
   }
  ]
 },
 "D20": {
  "body": [
   "The steering knuckle holds the hub or spindle, mounts the brake caliper, ABS sensor and wheel bearing, and carries the tie rod end and the upper and lower pivot connections.",
   "Every attachment point is inspected for bends, cracks and breaks; curb or pothole hits can bend a knuckle enough to throw off alignment.",
   "The knuckle is checked whenever a ball joint or control arm is replaced; a ball stud hole that is worn, corroded or distorted means the knuckle is replaced, and after torquing no gap should show between the ball stud and the knuckle.",
   "Mating surfaces are cleaned before assembly, since rust at a pivot point can change camber; pinch bolts and ball studs are never hammered into place.",
   "The federal periodic inspection standard rejects any crack or obvious welded repair in steering components and any loose or missing nut on a steering arm or tie rod arm."
  ],
  "car": null,
  "src": [
   [
    "All You Need to Know About Knuckles: Inspecting, Cleaning and When to Replace - Mevotech",
    "https://www.mevotech.com/article/all-you-need-to-know-about-knuckles-inspecting-cleaning-and-when-to-replace/"
   ],
   [
    "Handling Issues? Check the 3 Potential Causes of Steering Knuckle Failure - Mevotech",
    "https://www.mevotech.com/article/handling-issues-check-the-3-potential-causes-of-steering-knuckle-failure/"
   ],
   [
    "Appendix A to Part 396—Minimum Periodic Inspection Standards",
    "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-396/appendix-Appendix%20A%20to%20Part%20396"
   ]
  ],
  "qs": [
   {
    "q": "After a hard curb strike, a car pulls to one side and the steering wheel is off center. All of these knuckle checks are correct EXCEPT:",
    "o": [
     "Inspect the attachment points for cracks and bends",
     "Check the ball stud hole for wear or distortion",
     "Hammer the ball stud into the knuckle to seat it",
     "Clean rust from the mating surfaces before assembly"
    ],
    "a": 2,
    "why": "Mevotech says never to hammer a pinch bolt or ball joint stud into place, while the other three are part of its knuckle inspection and cleaning advice.",
    "src": [
     "All You Need to Know About Knuckles: Inspecting, Cleaning and When to Replace - Mevotech",
     "https://www.mevotech.com/article/all-you-need-to-know-about-knuckles-inspecting-cleaning-and-when-to-replace/"
    ]
   },
   {
    "q": "Technician A says the knuckle should be inspected whenever a ball joint is replaced. Technician B says a visible gap between the ball stud and the knuckle after torquing is normal. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 0,
    "why": "Mevotech says to inspect the knuckle when replacing a ball joint or control arm and that no gap should be visible between the ball stud and the knuckle after torquing.",
    "src": [
     "Handling Issues? Check the 3 Potential Causes of Steering Knuckle Failure - Mevotech",
     "https://www.mevotech.com/article/handling-issues-check-the-3-potential-causes-of-steering-knuckle-failure/"
    ]
   }
  ]
 },
 "D21": {
  "body": [
   "Springs carry the vehicle's weight and absorb bumps; coil, leaf, torsion bar and air springs are the common types.",
   "Aged springs sag or break; a car that rides lower than it used to may have worn struts, springs or strut mounts, and ride height is checked against the factory service manual.",
   "A broken coil spring or a deflated air suspension (leak or system failure) is a reject item under the federal periodic inspection standard.",
   "Spring isolators (insulators) sit between the spring and its seats; Monroe's Strut-Mate kit includes upper and lower isolators, and KYB's Strut-Plus assemblies come with the spring, top mount and insulators already fitted.",
   "On Volvos with air suspension (leveling control), leveling control is turned off before jacking the car."
  ],
  "car": "Volvo's V60 specification lists coil springs and hydraulic shock absorbers at the front, so this car has no front air springs.",
  "src": [
   [
    "Suspension 101: The Pros & Cons of Common Suspension Types - Mevotech",
    "https://www.mevotech.com/article/suspension-101-the-pros-cons-of-common-suspension-types/"
   ],
   [
    "THE IMPACTS OF AGED, OVERLOADED AND MODIFIED SUSPENSIONS – WHAT YOU NEED TO KNOW FOR A SUCCESSFUL INSPECTION AND REPAIR - Mevotech",
    "https://www.mevotech.com/article/the-impacts-of-aged-overloaded-and-modified-suspensions-what-you-need-to-know-for-a-successful-inspection-and-repair/"
   ],
   [
    "Shock & Strut Buying Guide | Monroe Shocks & Struts",
    "https://www.monroe.com/technical-resources/shocks-101/shock-strut-assembly-buying-guide.html"
   ],
   [
    "Appendix A to Part 396—Minimum Periodic Inspection Standards",
    "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-396/appendix-Appendix%20A%20to%20Part%20396"
   ],
   [
    "Strut Accessories | Monroe Shocks & Struts",
    "https://www.monroe.com/products/restore-your-ride/accessories.html"
   ],
   [
    "KYB Strut-Plus complete strut assemblies - KYB Americas LLC",
    "https://www.kyb.com/products/strut-plus/"
   ],
   [
    "V90 Leveling control settings | Volvo Support US",
    "https://www.volvocars.com/us/support/car/v90/article/68aee4d18e50b791c0a80151549e8abd/"
   ],
   [
    "Volvo V60 specifications (Volvo Cars, Sept 2016)",
    "https://mb.cision.com/Public/23609/4188195/aa2ab97f7dbcaad0.pdf"
   ]
  ],
  "qs": [
   {
    "q": "A customer says the front of the car sits lower than it used to. Which is LEAST likely to be the cause?",
    "o": [
     "Sagging coil springs",
     "Worn struts",
     "Worn strut mounts",
     "A worn wheel hub bearing"
    ],
    "a": 3,
    "why": "Monroe says a car riding lower than before points to the strut, springs or strut mount, and Mevotech lists sagging springs as an aged-suspension fault; a hub bearing does not hold the car's height.",
    "src": [
     "Shock & Strut Buying Guide | Monroe Shocks & Struts",
     "https://www.monroe.com/technical-resources/shocks-101/shock-strut-assembly-buying-guide.html"
    ]
   },
   {
    "q": "Technician A says a broken coil spring is a reject item under the federal periodic inspection standard. Technician B says a deflated air suspension is also a reject item. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 2,
    "why": "Appendix A to Part 396 lists both a broken coil spring and a deflated air suspension from leak or system failure under spring assembly defects.",
    "src": [
     "Appendix A to Part 396—Minimum Periodic Inspection Standards",
     "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-396/appendix-Appendix%20A%20to%20Part%20396"
    ]
   }
  ]
 },
 "D22": {
  "body": [
   "Leaf springs are one of the spring types used to carry a vehicle's weight, mostly on solid-axle and heavy-duty designs.",
   "The federal periodic inspection standard rejects any broken or missing leaf, a broken main leaf, and any leaf displaced so it could contact a tire, rim, brake drum or frame.",
   "The same standard rejects any cracked, broken, loose or missing U-bolt, spring hanger or other axle positioning part.",
   "No sourced step-by-step procedure for this task was found yet."
  ],
  "car": "Not on this car: Volvo's V60 specification lists coil springs at both the front and rear.",
  "src": [
   [
    "Suspension 101: The Pros & Cons of Common Suspension Types - Mevotech",
    "https://www.mevotech.com/article/suspension-101-the-pros-cons-of-common-suspension-types/"
   ],
   [
    "Appendix A to Part 396—Minimum Periodic Inspection Standards",
    "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-396/appendix-Appendix%20A%20to%20Part%20396"
   ],
   [
    "Volvo V60 specifications (Volvo Cars, Sept 2016)",
    "https://mb.cision.com/Public/23609/4188195/aa2ab97f7dbcaad0.pdf"
   ]
  ],
  "qs": [
   {
    "q": "Under the federal periodic inspection standard, all of these leaf spring conditions are reject items EXCEPT:",
    "o": [
     "A broken main leaf",
     "A loose U-bolt",
     "A leaf shifted so it could touch the tire",
     "Surface rust on an intact leaf"
    ],
    "a": 3,
    "why": "Appendix A to Part 396 lists broken or missing leaves, a broken main leaf, displaced leaves that could contact a tire, and loose or broken U-bolts; surface rust is not listed.",
    "src": [
     "Appendix A to Part 396—Minimum Periodic Inspection Standards",
     "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-396/appendix-Appendix%20A%20to%20Part%20396"
    ]
   }
  ]
 },
 "D23": {
  "body": [
   "A torsion bar is a spring that carries vehicle weight by twisting; Mevotech lists it with coil, leaf and air springs as the main spring types.",
   "A stabilizer (anti-roll) bar is also a torsional spring, but its job is to control side-to-side load transfer and body roll, not to carry the vehicle's weight.",
   "The federal periodic inspection standard rejects a broken torsion bar spring in a torsion bar suspension.",
   "No sourced procedure for inspecting or adjusting torsion bars and their mounts was found yet."
  ],
  "car": "Not on this car: Volvo's V60 specification lists coil springs as the front springs.",
  "src": [
   [
    "Suspension 101: The Pros & Cons of Common Suspension Types - Mevotech",
    "https://www.mevotech.com/article/suspension-101-the-pros-cons-of-common-suspension-types/"
   ],
   [
    "SLOW YOUR ROLL: ALL ABOUT ANTI-ROLL SYSTEMS! - Mevotech",
    "https://www.mevotech.com/article/slow-your-roll-all-about-anti-roll-systems/"
   ],
   [
    "Appendix A to Part 396—Minimum Periodic Inspection Standards",
    "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/subchapter-B/part-396/appendix-Appendix%20A%20to%20Part%20396"
   ],
   [
    "Volvo V60 specifications (Volvo Cars, Sept 2016)",
    "https://mb.cision.com/Public/23609/4188195/aa2ab97f7dbcaad0.pdf"
   ]
  ],
  "qs": [
   {
    "q": "Technician A says a torsion bar is a type of spring that carries vehicle weight. Technician B says a stabilizer bar is a torsional spring that controls body roll. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 2,
    "why": "Mevotech lists the torsion bar among the springs that carry vehicle weight and describes the anti-roll bar as a torsional spring that controls left-right load transfer and body roll.",
    "src": [
     "SLOW YOUR ROLL: ALL ABOUT ANTI-ROLL SYSTEMS! - Mevotech",
     "https://www.mevotech.com/article/slow-your-roll-all-about-anti-roll-systems/"
    ]
   }
  ]
 },
 "D24": {
  "body": [
   "The stabilizer (sway or anti-roll) bar is a torsional spring that limits body roll; bushings mount it to the chassis, and end links connect each end to a moving suspension part such as the control arm, knuckle or strut.",
   "Worn links or bushings cause clunks, pops or rattles over bumps, loose or vague steering, an unsettled feel in lane changes, and excess body roll.",
   "Links and bushings are checked with the wheels on the ground at ride height: grip a link at its rod and shake it hard in every direction, and grasp the bar near each bushing and push it up, down and sideways while looking for gaps between bar and bushing.",
   "Free play at either end of a link, or a cracked, worn, dried-out or loose bushing, means replacement.",
   "Bushing hardware is torqued at static ride height to the service manual value; most bushings go in dry but some need grease, and they should not be over-compressed."
  ],
  "car": "Volvo's V60 specification lists a stabilizer bar in the front suspension.",
  "src": [
   [
    "SLOW YOUR ROLL: ALL ABOUT ANTI-ROLL SYSTEMS! - Mevotech",
    "https://www.mevotech.com/article/slow-your-roll-all-about-anti-roll-systems/"
   ],
   [
    "Accurate Diagnoses: How to Check for Worn or Loose Chassis Parts - Mevotech",
    "https://www.mevotech.com/article/accurate-diagnoses-how-to-check-for-worn-or-loose-chassis-parts/"
   ],
   [
    "Diagnostic Tips for Hubs, Links and Bushings - Mevotech",
    "https://www.mevotech.com/article/diagnostic-tips-for-hubs-links-and-bushings/"
   ],
   [
    "Symptoms of Bad Sway Bar Links",
    "https://www.moogparts.com/parts-matter/Symptoms-of-Bad-Sway-Bar-Links.html"
   ],
   [
    "Volvo V60 specifications (Volvo Cars, Sept 2016)",
    "https://mb.cision.com/Public/23609/4188195/aa2ab97f7dbcaad0.pdf"
   ]
  ],
  "qs": [
   {
    "q": "A technician is about to check the front stabilizer links for play. How should the car be positioned?",
    "o": [
     "Raised with the front wheels hanging free",
     "On its wheels at ride height",
     "Raised with only one wheel off the ground",
     "On a lift with the stabilizer bar disconnected"
    ],
    "a": 1,
    "why": "Mevotech says end links and stabilizer bushings are checked with weight on the wheels and the vehicle at ride height.",
    "src": [
     "Accurate Diagnoses: How to Check for Worn or Loose Chassis Parts - Mevotech",
     "https://www.mevotech.com/article/accurate-diagnoses-how-to-check-for-worn-or-loose-chassis-parts/"
    ]
   },
   {
    "q": "New stabilizer bar bushings are being installed. Technician A says the bushing hardware should be torqued with the suspension at static ride height. Technician B says every stabilizer bushing must be packed with grease. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 0,
    "why": "Mevotech says to always torque bushing hardware at static ride height and that most bushings install dry, with only some needing grease per the service manual.",
    "src": [
     "SLOW YOUR ROLL: ALL ABOUT ANTI-ROLL SYSTEMS! - Mevotech",
     "https://www.mevotech.com/article/slow-your-roll-all-about-anti-roll-systems/"
    ]
   }
  ]
 },
 "D25": {
  "body": [
   "A strut inspection starts with the customer's history and a road test, then a physical check of the unit.",
   "On the physical check, Monroe looks for a bent, rusted, loose or scratched rod, fluid leaking down the side or from the bottom, damaging corrosion, damaged or missing non-replaceable bushings, and cupped or uneven tire wear.",
   "Worn struts let the tire move too much and wear a cupped pattern; KYB lists nose dive, body roll, dripping fluid and broken brackets as reasons to replace, and says replacement usually restores ride and control after 50,000 miles.",
   "Struts cannot be refilled or rebuilt; a strut with a replaceable cartridge is identified by a large hex nut at the top of the strut body.",
   "A complete strut assembly comes with the strut already fitted with its coil spring and top mount, so no spring compressor is needed."
  ],
  "car": "Volvo's V60 specification lists McPherson struts with coil springs and hydraulic shock absorbers at the front.",
  "src": [
   [
    "How to Conduct a Shock or Strut Inspection",
    "https://www.monroe.com/technical-resources/tech-tips/how-to-conduct-a-shock-strut-inspection.html"
   ],
   [
    "How do I know if I need new shocks? - KYB Americas LLC",
    "https://www.kyb.com/resource/faqs/how-do-i-know-if-i-need-new-shocks/"
   ],
   [
    "Can worn shocks or struts cause new tires to wear unevenly? - KYB Americas LLC",
    "https://www.kyb.com/resource/faqs/can-worn-shocks-or-struts-cause-new-tires-to-wear-unevenly/"
   ],
   [
    "How do I know if a strut can be rebuilt? - KYB Americas LLC",
    "https://www.kyb.com/resource/faqs/how-do-i-know-if-a-strut-can-be-rebuilt/"
   ],
   [
    "Quick-Strut Assemblies | Monroe Shocks & Struts",
    "https://www.monroe.com/products/restore-your-ride/quick-strut-assembly.html"
   ],
   [
    "KYB Strut-Plus complete strut assemblies - KYB Americas LLC",
    "https://www.kyb.com/products/strut-plus/"
   ],
   [
    "Volvo V60 specifications (Volvo Cars, Sept 2016)",
    "https://mb.cision.com/Public/23609/4188195/aa2ab97f7dbcaad0.pdf"
   ]
  ],
  "qs": [
   {
    "q": "New front tires show a cupped wear pattern after a few thousand miles. Which is the most likely cause?",
    "o": [
     "Worn struts",
     "A weak battery",
     "Low coolant",
     "A sticking parking brake"
    ],
    "a": 0,
    "why": "KYB says worn shocks and struts let the tires move excessively, which produces a cupping wear pattern.",
    "src": [
     "Can worn shocks or struts cause new tires to wear unevenly? - KYB Americas LLC",
     "https://www.kyb.com/resource/faqs/can-worn-shocks-or-struts-cause-new-tires-to-wear-unevenly/"
    ]
   },
   {
    "q": "Technician A says a leaking sealed strut can be refilled with fluid. Technician B says a large hex nut at the top of the strut body identifies a strut with a replaceable cartridge. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 1,
    "why": "KYB says struts cannot be refilled or rebuilt, but some have a replaceable cartridge identified by a large hexagonal nut at the top of the body.",
    "src": [
     "How do I know if a strut can be rebuilt? - KYB Americas LLC",
     "https://www.kyb.com/resource/faqs/how-do-i-know-if-a-strut-can-be-rebuilt/"
    ]
   }
  ]
 },
 "D26": {
  "body": [
   "The strut mount supports the top of the strut and damps road vibration; where the mount is also the steering pivot it contains a bearing, which is a wear item that affects steering response and alignment.",
   "Worn mounts or bearing plates cause noise, steering bind or pull, early tire wear, and upper strut movement that changes alignment angles.",
   "With the car on the ground, turn the steering stop to stop and listen for noise or binding, and check the rubber for cracks or separation from the metal.",
   "Note the piston rod position, raise the car, then grip the spring near the top mount and push and pull the strut: a slight downward shift is normal, but side-to-side movement or a rod that moves freely means the mount is worn.",
   "Monroe and KYB both recommend replacing the strut mount (and bearing plate) whenever struts are replaced."
  ],
  "car": "Volvo's V60 specification lists McPherson struts at the front; Mevotech describes that design as pivoting on the upper strut mount, which is the case where KYB says the mount carries a bearing.",
  "src": [
   [
    "Strut Mounts Vital to Vehicle Safety - Monroe Shock Absorbers",
    "https://monroe.com.au/?p=1240"
   ],
   [
    "Do KYB strut mounts come with the bearings? - KYB Americas LLC",
    "https://www.kyb.com/resource/faqs/do-kyb-strut-mounts-come-with-the-bearings/"
   ],
   [
    "Should I replace other parts while having my struts replaced? - KYB Americas LLC",
    "https://www.kyb.com/resource/faqs/should-i-replace-other-parts-while-having-my-struts-replaced/"
   ],
   [
    "Suspension 101: The Pros & Cons of Common Suspension Types - Mevotech",
    "https://www.mevotech.com/article/suspension-101-the-pros-cons-of-common-suspension-types/"
   ],
   [
    "Volvo V60 specifications (Volvo Cars, Sept 2016)",
    "https://mb.cision.com/Public/23609/4188195/aa2ab97f7dbcaad0.pdf"
   ]
  ],
  "qs": [
   {
    "q": "A car makes a creaking noise and the steering binds when the wheel is turned from lock to lock while parked. Which is the most likely cause?",
    "o": [
     "A worn strut mount bearing",
     "A worn rear wheel bearing",
     "Low tire pressure",
     "A worn stabilizer link"
    ],
    "a": 0,
    "why": "Monroe says a defective strut mount bearing shows up as noise or binding when the steering is turned lock to lock.",
    "src": [
     "Strut Mounts Vital to Vehicle Safety - Monroe Shock Absorbers",
     "https://monroe.com.au/?p=1240"
    ]
   },
   {
    "q": "After the car is raised, the top of a strut mount is seen to shift slightly downward. Technician A says this alone is normal. Technician B says side-to-side movement of the mount usually means wear. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 2,
    "why": "Monroe's inspection steps say a slight downward shift after lifting is normal and side-to-side movement usually indicates a worn mount.",
    "src": [
     "Strut Mounts Vital to Vehicle Safety - Monroe Shock Absorbers",
     "https://monroe.com.au/?p=1240"
    ]
   }
  ]
 },
 "D27": {
  "body": [
   "A bearing hum, rumble or growl is present driving straight and gets louder with a slight steering input; Timken says the defective bearing is typically on the side opposite the noise. Clicking on sharp turns more often points to an outer CV joint or loose clamping.",
   "Other hub bearing signs include play or vibration through the steering wheel, uneven tire wear, pulling, and an ABS warning light; extreme play can damage the ABS sensor.",
   "The hand check is to grip the tire at 3 and 9, then 12 and 6 o'clock, rock it and feel for roughness; with the wheel, caliper and rotor off, a hub that feels rough, loose or noisy when turned by hand is replaced.",
   "Timken's dial indicator check seats the bearing by pushing and pulling while rocking the hub at least five times each way; total movement over 0.004 in. means the hub bearing assembly is replaced.",
   "Most modern hubs are sealed, pre-lubricated Gen 3 units with flanges for the knuckle and the wheel; they are never taken apart and rebuilt.",
   "On replacement, the knuckle bore is cleaned, the hub goes in without hammering, and the knuckle bolts and axle nut are torqued to the vehicle maker's spec with a torque wrench, never an impact wrench; the ABS sensor wire is routed as before."
  ],
  "car": null,
  "src": [
   [
    "Symptoms of a Worn Wheel Hub Bearing",
    "https://www.timken.com/resources/md17-symptoms-of-a-worn-wheel-hub-bearing"
   ],
   [
    "Checking A Hub Bearing Assembly",
    "https://www.timken.com/resources/lv3-checking-a-hub-bearing-assembly/"
   ],
   [
    "Removing and Installing a Hub Unit Bearing",
    "https://www.timken.com/resources/lv1-removing-and-installing-a-hub-unit-bearing/"
   ],
   [
    "Diagnostic Tips for Hubs, Links and Bushings - Mevotech",
    "https://www.mevotech.com/article/diagnostic-tips-for-hubs-links-and-bushings/"
   ],
   [
    "WHEEL BEARINGS AND HUBS 101: WHAT YOU NEED TO KNOW - Mevotech",
    "https://www.mevotech.com/article/wheel-bearings-and-hubs-101-what-you-need-to-know/"
   ]
  ],
  "qs": [
   {
    "q": "A front hub bearing is measured with a dial indicator after the bearing is seated. Which reading means the hub bearing assembly must be replaced?",
    "o": [
     "0.001 in.",
     "0.002 in.",
     "0.003 in.",
     "0.006 in."
    ],
    "a": 3,
    "why": "Timken says to replace the hub bearing assembly if total indicator movement exceeds 0.004 in.",
    "src": [
     "Checking A Hub Bearing Assembly",
     "https://www.timken.com/resources/lv3-checking-a-hub-bearing-assembly/"
    ]
   },
   {
    "q": "A new hub bearing is being installed. All of these are correct practice EXCEPT:",
    "o": [
     "Cleaning burrs and debris from the knuckle bore",
     "Torquing the axle nut with a torque wrench to the maker's spec",
     "Tapping the hub onto the axle splines with a hammer",
     "Routing the ABS sensor wire through the original clips"
    ],
    "a": 2,
    "why": "Timken says never to force the hub onto the shaft or strike it with a hammer; the other steps are part of its installation procedure.",
    "src": [
     "Removing and Installing a Hub Unit Bearing",
     "https://www.timken.com/resources/lv1-removing-and-installing-a-hub-unit-bearing/"
    ]
   }
  ]
 },
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
 },
 "E8": {
  "body": [
   "This task covers removing a brake drum, cleaning off the brake dust safely, checking the drum for damage and measuring its inside diameter to decide whether it can be reused, machined or must be replaced.",
   "OSHA's guidance says to assume every brake shoe, old or replacement, may contain asbestos, because worn non-asbestos shoes cannot be reliably told apart from asbestos ones; exposure must stay below 0.1 fiber per cubic centimeter averaged over 8 hours.",
   "OSHA's brake appendix allows a sealed negative-pressure enclosure with a HEPA vacuum, or low-pressure wet cleaning that gently floods the assembly over a catch basin and lets the solution run between the drum and backing plate before the drum comes off; shops doing no more than 5 brake jobs a week may instead mist the parts with water and wipe them with a cloth. Dry brushing is prohibited in the wet methods.",
   "Brembo's shoe instructions say to work on one wheel at a time, keeping the other side as an assembly reference, and not to press the brake pedal once the drum is off.",
   "A 1944 SAE guide on drum reconditioning measures with an inside micrometer at the open and closed edges, at right angles to each other and at points in between, which reveals out-of-round, bell-mouth and bulge; it treated 0.010 in of out-of-round, or any bell-mouth, as needing reconditioning.",
   "Dexter's instructions say the maximum machining diameter is usually stamped on the drum, and to inspect the drum and resurface or replace it as needed. Pro-Cut's lathe manual says a drum that still shows excessive runout once correctly mounted should not go back into service."
  ],
  "car": "Volvo's press specification lists brake disc diameters for the front (300 to 371 mm, by rim size) and the rear (302 mm), and the owner's manual refers to brake discs and pads, so this car has no drum brakes to service. Neither document uses the word drum, and the spec sheet is a European one dated Sept 2016.",
  "src": [
   [
    "Asbestos-Automotive Brake and Clutch Repair Work (OSHA SHIB 07-26-06)",
    "https://www.osha.gov/sites/default/files/publications/shib072606.pdf"
   ],
   [
    "1910.1001 App F - Work practices and engineering controls for automotive brake and clutch inspection, disassembly, repair and assembly - Mandatory | Occupational Safety and Health Administration",
    "https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.1001AppF"
   ],
   [
    "Instructions for replacing the brake shoes on cars and light commercial vehicles",
    "https://www.bremboparts.com/america/en/support/assembly-instructions/CarAM_BrakeShoe"
   ],
   [
    "Reconditioning Brake Drums: Limits and Tolerances (SAE Maintenance Methods Coordinating Committee for the Office of Defense Transportation, 1944)",
    "https://govinfo.gov/content/pkg/GOVPUB-PR32_4900-609c61ff7d137460cc33ad7cbeb87637/html/GOVPUB-PR32_4900-609c61ff7d137460cc33ad7cbeb87637.htm"
   ],
   [
    "Installation Instructions for the Hydraulic Drum Brake Replacement Shoe Lining Kit, 10\" x 2-1/4\" or 12\" x 2\" (Dexter Axle 059-260-00)",
    "https://static.nhtsa.gov/odi/tsbs/2019/MC-10165671-0001.pdf"
   ],
   [
    "Pro-Cut B17 Multi-Speed Bench Brake Lathe Technical Manual (50-4150)",
    "https://www.procutusa.com/pdf/50-4150.pdf"
   ],
   [
    "Volvo V60 specifications (Volvo Cars press material, Sept 2016)",
    "https://mb.cision.com/Public/23609/4188195/aa2ab97f7dbcaad0.pdf"
   ],
   [
    "Volvo V60 Owner's Manual, model year 2016, US web edition (TP 20238)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ]
  ],
  "qs": [
   {
    "q": "A technician in a shop that does about 20 brake jobs a week is about to pull a rear brake drum. Which cleaning method meets OSHA's asbestos rule?",
    "o": [
     "Blowing the dust out with a compressed-air gun in open air",
     "Dry brushing the backing plate before removing the shoes",
     "Low-pressure wet cleaning that floods the assembly over a catch basin",
     "Wiping the parts with a dry rag"
    ],
    "a": 2,
    "why": "OSHA's appendix requires the negative-pressure HEPA enclosure, low-pressure wet cleaning or a proven equivalent; the simple mist-and-wipe method is limited to shops doing 5 or fewer brake jobs a week, and dry brushing is prohibited.",
    "src": [
     "1910.1001 App F - Work practices and engineering controls for automotive brake and clutch inspection, disassembly, repair and assembly - Mandatory | Occupational Safety and Health Administration",
     "https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.1001AppF"
    ]
   },
   {
    "q": "A technician measures a brake drum with an inside micrometer and gets different readings at two points 90 degrees apart at the same depth. This most likely means the drum is:",
    "o": [
     "Out of round",
     "Exactly at its maximum diameter",
     "Bell-mouthed only at the closed edge",
     "Contaminated with brake fluid"
    ],
    "a": 0,
    "why": "Readings taken at right angles to each other are how out-of-round is found; the SAE guide also measures at the open and closed edges to find bell-mouth.",
    "src": [
     "Reconditioning Brake Drums: Limits and Tolerances (SAE Maintenance Methods Coordinating Committee for the Office of Defense Transportation, 1944)",
     "https://govinfo.gov/content/pkg/GOVPUB-PR32_4900-609c61ff7d137460cc33ad7cbeb87637/html/GOVPUB-PR32_4900-609c61ff7d137460cc33ad7cbeb87637.htm"
    ]
   }
  ]
 },
 "E9": {
  "body": [
   "Machining (turning) a drum on a brake lathe cuts a thin layer off the friction surface to remove scoring, out-of-round and other surface defects.",
   "Before cutting, check the drum's size and clean the mounting faces where the cones and clamps seat. Pro-Cut's lathe manual says the finished drum must never go past the vehicle maker's machine-to or maximum specification, because an over-machined drum is dangerous.",
   "When a spec book lists one figure as both the maximum machining and the discard diameter, Phoenix Systems says the trade stops 0.015 in short of it (a 9.040 in listing becomes 9.025 in), so the drum is not over the limit soon after it goes back in service.",
   "Pro-Cut's bench-lathe settings: cut no more than 0.015 in per side, always wrap the silencer band around the drum, and run small drums faster (180 RPM up to 12 in, 140 RPM for 12 to 14 in, 100 RPM for 14 to 19.5 in).",
   "Feed rate sets the finish. Pro-Cut cites about 100 micro-inch Ra as the upper roughness limit for many vehicles, reached at its coarsest feed with its own inserts, and about 45 micro-inch at its finest.",
   "Measure again after the cut and replace the drum if it is past the limit. Clean the friction surface before fitting, because machining leaves fine metal dust (Phoenix Systems)."
  ],
  "car": "Volvo's press specification lists brake disc diameters for the front (300 to 371 mm, by rim size) and the rear (302 mm), and the owner's manual refers to brake discs and pads, so this car has no drums to machine.",
  "src": [
   [
    "Pro-Cut B17 Multi-Speed Bench Brake Lathe Technical Manual (50-4150)",
    "https://www.procutusa.com/pdf/50-4150.pdf"
   ],
   [
    "Rotor & Drum Specification Issues",
    "https://phoenixsystems.co/blogs/brake-system-tips/rotor-drum-specification-issues"
   ],
   [
    "Steps to a Quality Drum Brake Job",
    "https://phoenixsystems.co/blogs/brake-system-tips/steps-to-a-quality-drum-brake-job"
   ],
   [
    "Volvo V60 specifications (Volvo Cars press material, Sept 2016)",
    "https://mb.cision.com/Public/23609/4188195/aa2ab97f7dbcaad0.pdf"
   ],
   [
    "Volvo V60 Owner's Manual, model year 2016, US web edition (TP 20238)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ]
  ],
  "qs": [
   {
    "q": "A scored drum measures slightly under the maximum diameter stamped on it. Technician A says it can be machined as long as the finished size stays within the maker's specification. Technician B says the cut can go past the stamped figure if that is what it takes to get a smooth surface. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 0,
    "why": "Pro-Cut's manual says metal removal must never exceed the vehicle maker's machine-to or maximum specification, and that driving on an over-machined drum is dangerous; a drum that cannot clean up within the limit is replaced.",
    "src": [
     "Pro-Cut B17 Multi-Speed Bench Brake Lathe Technical Manual (50-4150)",
     "https://www.procutusa.com/pdf/50-4150.pdf"
    ]
   },
   {
    "q": "When machining a passenger-car drum on a bench lathe, which of these is LEAST likely to be correct?",
    "o": [
     "Wrapping a silencer band around the drum",
     "Cleaning the faces where the cones and clamps contact the drum",
     "Taking a 0.050 in cut per side to finish in one pass",
     "Using a slower spindle speed for a larger drum"
    ],
    "a": 2,
    "why": "Pro-Cut gives 0.015 in per side as the maximum recommended cut for all drum sizes; the silencer band is required, mounting faces must be clean, and larger drums use slower speeds.",
    "src": [
     "Pro-Cut B17 Multi-Speed Bench Brake Lathe Technical Manual (50-4150)",
     "https://www.procutusa.com/pdf/50-4150.pdf"
    ]
   }
  ]
 },
 "E10": {
  "body": [
   "This task covers taking the shoes, return and hold-down springs, adjuster and other hardware off the backing plate, cleaning them and deciding what must be replaced.",
   "Work on one side at a time and keep the other side assembled as a reference (Brembo). Phoenix Systems lays the parts out in the order they came off, and Dexter's instructions say to note where the adjuster and springs sit before removal.",
   "Under OSHA's low-pressure wet method, the backing plate, shoes and shoe hardware are washed thoroughly before the old shoes come off; dry brushing is prohibited.",
   "Brembo says to replace any damaged brake part found during the job and any part contaminated with grease, oil or mineral-based cleaner, and to replace shoes on both wheels of an axle.",
   "Check the shoe lands, the raised pads on the backing plate the shoes slide on. Phoenix Systems says worn lands change where the shoe sits, and the backing plate must then be repaired or replaced.",
   "Dexter's kits use new hold-down nuts and washers, and its shoes are not interchangeable: the primary shoe, with the shorter lining, faces forward and the secondary shoe, with the longer lining, faces rearward."
  ],
  "car": "Volvo's press specification lists brake disc diameters for the front (300 to 371 mm, by rim size) and the rear (302 mm), and the owner's manual refers to brake discs and pads, so this car has no brake shoes or drum hardware.",
  "src": [
   [
    "Instructions for replacing the brake shoes on cars and light commercial vehicles",
    "https://www.bremboparts.com/america/en/support/assembly-instructions/CarAM_BrakeShoe"
   ],
   [
    "Steps to a Quality Drum Brake Job",
    "https://phoenixsystems.co/blogs/brake-system-tips/steps-to-a-quality-drum-brake-job"
   ],
   [
    "Installation Instructions for the Hydraulic Drum Brake Replacement Shoe Lining Kit, 10\" x 2-1/4\" or 12\" x 2\" (Dexter Axle 059-260-00)",
    "https://static.nhtsa.gov/odi/tsbs/2019/MC-10165671-0001.pdf"
   ],
   [
    "Installation Instructions: Shoe and Lining Kit for 12-1/4\" x 3-3/8\", 12-1/4\" x 4\" & 12-1/4\" x 5\" Hydraulic Brakes (Dexter Axle 059-101-00)",
    "https://dextergroup.com/user_area/content_media/raw/shoe-and-lining-kit-12-25-x-3-375-12-25-x-4-amp-12-25-x-5-hydraulic-brakes-(059-101-00).pdf"
   ],
   [
    "1910.1001 App F - Work practices and engineering controls for automotive brake and clutch inspection, disassembly, repair and assembly - Mandatory | Occupational Safety and Health Administration",
    "https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.1001AppF"
   ],
   [
    "Volvo V60 specifications (Volvo Cars press material, Sept 2016)",
    "https://mb.cision.com/Public/23609/4188195/aa2ab97f7dbcaad0.pdf"
   ],
   [
    "Volvo V60 Owner's Manual, model year 2016, US web edition (TP 20238)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ]
  ],
  "qs": [
   {
    "q": "During a rear drum inspection, the shoe linings on the left side are soaked with oil from a leaking axle seal. Which action is most likely correct?",
    "o": [
     "Clean the linings with brake cleaner and reuse them",
     "Replace the contaminated shoes, as a set across that axle",
     "Sand the linings and reinstall them",
     "Replace only the shoe with the most oil on it"
    ],
    "a": 1,
    "why": "Brembo's instructions say any part contaminated with grease, oil or mineral-based cleaner must be replaced, and shoes are replaced across the whole axle.",
    "src": [
     "Instructions for replacing the brake shoes on cars and light commercial vehicles",
     "https://www.bremboparts.com/america/en/support/assembly-instructions/CarAM_BrakeShoe"
    ]
   },
   {
    "q": "Before servicing drum brakes on both rear wheels, Technician A says to take both sides apart at once to save time. Technician B says to work on one side at a time and use the other side as a reference. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 1,
    "why": "Brembo's shoe instructions say to remove one wheel at a time and keep the other as a reference for reassembly.",
    "src": [
     "Instructions for replacing the brake shoes on cars and light commercial vehicles",
     "https://www.bremboparts.com/america/en/support/assembly-instructions/CarAM_BrakeShoe"
    ]
   }
  ]
 },
 "E11": {
  "body": [
   "Drum brakes need a thin film of high-temperature lubricant wherever metal slides on metal, so the shoes can move on the backing plate and the adjuster can turn.",
   "Brembo says to use high-temperature-resistant grease only on the parts of the backing plate that touch the shoes, and never on the friction material or the inside of the drum.",
   "Dexter's instructions list the shoe rest pads on the backing plate (six on its brakes), the adjuster threads, and the shoe web areas under the hold-down washers.",
   "Phoenix Systems cleans the shoe lands first, then puts a light film of moly lubricant on every metal-to-metal contact point.",
   "For the adjuster screw, Dexter says to clean the threads with a wire brush, apply a light coat of high-temperature anti-seize and screw it fully in before fitting.",
   "Keep lubricant and dirty hands off the linings: Phoenix Systems washes hands or covers the linings with masking tape during fitting, and Brembo says any part contaminated with grease must be replaced."
  ],
  "car": "Volvo's press specification lists brake disc diameters for the front (300 to 371 mm, by rim size) and the rear (302 mm), and the owner's manual refers to brake discs and pads, so this car has no drum brake contact points to lubricate.",
  "src": [
   [
    "Instructions for replacing the brake shoes on cars and light commercial vehicles",
    "https://www.bremboparts.com/america/en/support/assembly-instructions/CarAM_BrakeShoe"
   ],
   [
    "Installation Instructions: Shoe and Lining Kit for 12-1/4\" x 3-3/8\", 12-1/4\" x 4\" & 12-1/4\" x 5\" Hydraulic Brakes (Dexter Axle 059-101-00)",
    "https://dextergroup.com/user_area/content_media/raw/shoe-and-lining-kit-12-25-x-3-375-12-25-x-4-amp-12-25-x-5-hydraulic-brakes-(059-101-00).pdf"
   ],
   [
    "Installation Instructions for the Hydraulic Drum Brake Replacement Shoe Lining Kit, 10\" x 2-1/4\" or 12\" x 2\" (Dexter Axle 059-260-00)",
    "https://static.nhtsa.gov/odi/tsbs/2019/MC-10165671-0001.pdf"
   ],
   [
    "Steps to a Quality Drum Brake Job",
    "https://phoenixsystems.co/blogs/brake-system-tips/steps-to-a-quality-drum-brake-job"
   ],
   [
    "Volvo V60 specifications (Volvo Cars press material, Sept 2016)",
    "https://mb.cision.com/Public/23609/4188195/aa2ab97f7dbcaad0.pdf"
   ],
   [
    "Volvo V60 Owner's Manual, model year 2016, US web edition (TP 20238)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ]
  ],
  "qs": [
   {
    "q": "During a drum brake job, all of these points may receive a light coat of high-temperature brake lubricant EXCEPT:",
    "o": [
     "The shoe contact pads on the backing plate",
     "The adjuster screw threads",
     "The friction surface inside the drum",
     "The shoe web areas under the hold-down washers"
    ],
    "a": 2,
    "why": "Brembo says grease goes only on the backing plate points that touch the shoes and must never go on the friction material or the inside of the drum, because it compromises braking.",
    "src": [
     "Instructions for replacing the brake shoes on cars and light commercial vehicles",
     "https://www.bremboparts.com/america/en/support/assembly-instructions/CarAM_BrakeShoe"
    ]
   },
   {
    "q": "Technician A says the adjuster threads should be cleaned and given a light coat of high-temperature anti-seize. Technician B says a little lubricant on the lining surface helps stop squeal. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 0,
    "why": "Dexter's instructions call for wire-brushing the adjuster threads and applying a light coat of high-temperature anti-seize, and say to keep grease off the linings.",
    "src": [
     "Installation Instructions for the Hydraulic Drum Brake Replacement Shoe Lining Kit, 10\" x 2-1/4\" or 12\" x 2\" (Dexter Axle 059-260-00)",
     "https://static.nhtsa.gov/odi/tsbs/2019/MC-10165671-0001.pdf"
    ]
   }
  ]
 },
 "E12": {
  "body": [
   "The wheel cylinder sits at the top of the backing plate; pedal pressure pushes its pistons outward, which forces the shoes against the drum (Wagner).",
   "To check for leaks, pull back each dust boot, or pry press-on boots down from the push rod with a dull pick. Phoenix Systems says a light sheen on the bore and piston is normal; fluid pooled at the bottom of the bore, or dripping out when the boot is pulled back, means the cylinder is replaced, and replacing both sides is the accepted practice.",
   "Corrosion inside a wheel cylinder can let fluid leak, which lowers hydraulic pressure and gives a soft or low pedal (Wagner). Phoenix Systems adds that fluid under the boots by itself does not lower the pedal, because the cup seals leak only on release, so a low pedal needs its own diagnosis.",
   "To check operation, push each piston in a short way and compare the effort; a piston that will not move or needs much more force needs investigating. Pushing too far can damage the seal (Phoenix Systems).",
   "Hydraulic pressure must be zero before the drum comes off, and the pedal must not be pressed with the drum removed, or the pistons can be forced out (Dexter, Brembo). Brake fluid is corrosive, and a new cylinder means bleeding the brake circuit (Brembo)."
  ],
  "car": "Volvo's press specification lists brake disc diameters for the front (300 to 371 mm, by rim size) and the rear (302 mm), and the owner's manual refers to brake discs and pads, so this car has calipers rather than wheel cylinders.",
  "src": [
   [
    "Causes of Spongy Brakes | Wagner Brake",
    "http://www.wagnerbrake.com/technical/technical-tips/why-are-my-brakes-spongy.html"
   ],
   [
    "Wheel Cylinder Inspection Tips",
    "https://phoenixsystems.co/blogs/brake-system-tips/wheel-cylinder-inspection-tips"
   ],
   [
    "Installation Instructions for the Hydraulic Drum Brake Replacement Shoe Lining Kit, 10\" x 2-1/4\" or 12\" x 2\" (Dexter Axle 059-260-00)",
    "https://static.nhtsa.gov/odi/tsbs/2019/MC-10165671-0001.pdf"
   ],
   [
    "Instructions for replacing the brake shoes on cars and light commercial vehicles",
    "https://www.bremboparts.com/america/en/support/assembly-instructions/CarAM_BrakeShoe"
   ],
   [
    "Volvo V60 specifications (Volvo Cars press material, Sept 2016)",
    "https://mb.cision.com/Public/23609/4188195/aa2ab97f7dbcaad0.pdf"
   ],
   [
    "Volvo V60 Owner's Manual, model year 2016, US web edition (TP 20238)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ]
  ],
  "qs": [
   {
    "q": "A technician pulls back a wheel cylinder dust boot and finds a slight sheen of fluid on the piston, with no fluid collected in the bore. What is the most likely conclusion?",
    "o": [
     "This is normal and does not by itself call for replacement",
     "The wheel cylinder must be replaced",
     "The master cylinder has failed",
     "The brake fluid is contaminated with oil"
    ],
    "a": 0,
    "why": "Phoenix Systems says some wetness and a sheen on the bore and piston are normal; replacement is called for when fluid collects in the bottom of the bore or drips out with the boot pulled back.",
    "src": [
     "Wheel Cylinder Inspection Tips",
     "https://phoenixsystems.co/blogs/brake-system-tips/wheel-cylinder-inspection-tips"
    ]
   },
   {
    "q": "A car with rear drums has fluid under both wheel cylinder boots and a low brake pedal. Technician A says new wheel cylinders will cure the low pedal. Technician B says the cylinders need replacing for the leak, but the low pedal needs its own diagnosis. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 1,
    "why": "Phoenix Systems explains that wheel cylinder cups leak only when the pedal is released and let no air in, so fluid under the boots does not cause a low pedal and replacing the cylinders will not fix one.",
    "src": [
     "Wheel Cylinder Inspection Tips",
     "https://phoenixsystems.co/blogs/brake-system-tips/wheel-cylinder-inspection-tips"
    ]
   }
  ]
 },
 "E13": {
  "body": [
   "Installation puts the shoes, springs, adjuster, parking brake linkage and hold-downs back on the backing plate in their original positions.",
   "Brembo's order of work: fit the wheel cylinder, grease the backing plate contact points, hook the parking brake cable to the shoe lever, seat the shoe tips on the wheel cylinder and then the lower ends on the lower stop, refit the springs, and centre the shoes on the backing plate.",
   "Brembo says not to interfere with the automatic adjuster so it keeps working; FMVSS 135 requires light-vehicle service brakes to make up for wear by automatic adjustment.",
   "Dexter's instructions turn the adjuster screw in to shrink the shoe diameter so the drum will slide on. Phoenix Systems keeps the linings clean by washing hands first or covering them with masking tape.",
   "Before refitting the drum, apply the parking brake lightly to check that the levers and mechanisms move, then return everything to rest (Brembo). Clean the drum's friction surface first: machined drums carry metal dust and new ones a rust-preventive coating (Phoenix Systems)."
  ],
  "car": "Volvo's press specification lists brake disc diameters for the front (300 to 371 mm, by rim size) and the rear (302 mm), and the owner's manual refers to brake discs and pads, so this car has no brake shoes to install.",
  "src": [
   [
    "Instructions for replacing the brake shoes on cars and light commercial vehicles",
    "https://www.bremboparts.com/america/en/support/assembly-instructions/CarAM_BrakeShoe"
   ],
   [
    "Instructions for replacing brake shoe kits",
    "https://www.bremboparts.com/europe/en/support/car/car-fitting/instructions-for-replacing-brake-shoe-kits-280499"
   ],
   [
    "49 CFR 571.135 - Standard No. 135; Light vehicle brake systems",
    "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-V/part-571/subpart-B/section-571.135"
   ],
   [
    "Installation Instructions: Shoe and Lining Kit for 12-1/4\" x 3-3/8\", 12-1/4\" x 4\" & 12-1/4\" x 5\" Hydraulic Brakes (Dexter Axle 059-101-00)",
    "https://dextergroup.com/user_area/content_media/raw/shoe-and-lining-kit-12-25-x-3-375-12-25-x-4-amp-12-25-x-5-hydraulic-brakes-(059-101-00).pdf"
   ],
   [
    "Steps to a Quality Drum Brake Job",
    "https://phoenixsystems.co/blogs/brake-system-tips/steps-to-a-quality-drum-brake-job"
   ],
   [
    "Volvo V60 specifications (Volvo Cars press material, Sept 2016)",
    "https://mb.cision.com/Public/23609/4188195/aa2ab97f7dbcaad0.pdf"
   ],
   [
    "Volvo V60 Owner's Manual, model year 2016, US web edition (TP 20238)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ]
  ],
  "qs": [
   {
    "q": "While reassembling a drum brake, which step is LEAST likely to be correct?",
    "o": [
     "Centring the shoes on the backing plate",
     "Hooking the parking brake cable to the shoe lever before seating the shoes",
     "Disabling the automatic adjuster so it cannot over-adjust",
     "Checking the parking brake levers move before refitting the drum"
    ],
    "a": 2,
    "why": "Brembo says the automatic adjustment devices must not be tampered with so they keep working, and lists centring the shoes, hooking up the cable and a light parking brake check as normal steps.",
    "src": [
     "Instructions for replacing the brake shoes on cars and light commercial vehicles",
     "https://www.bremboparts.com/america/en/support/assembly-instructions/CarAM_BrakeShoe"
    ]
   },
   {
    "q": "After new shoes are installed, the drum will not slide over them. What is the most likely fix?",
    "o": [
     "Turn the adjuster screw to shrink the shoe diameter",
     "Machine the drum oversize",
     "Leave out one return spring",
     "Press the brake pedal to pull the shoes in"
    ],
    "a": 0,
    "why": "Dexter's instructions turn the adjuster screw to shrink the shoe diameter so the drum fits over the shoes.",
    "src": [
     "Installation Instructions: Shoe and Lining Kit for 12-1/4\" x 3-3/8\", 12-1/4\" x 4\" & 12-1/4\" x 5\" Hydraulic Brakes (Dexter Axle 059-101-00)",
     "https://dextergroup.com/user_area/content_media/raw/shoe-and-lining-kit-12-25-x-3-375-12-25-x-4-amp-12-25-x-5-hydraulic-brakes-(059-101-00).pdf"
    ]
   }
  ]
 },
 "E14": {
  "body": [
   "Shoe adjustment sets the gap between the linings and the drum, and the parking brake is set to match once the shoes are adjusted.",
   "FMVSS 135 requires light-vehicle service brakes to make up for wear automatically. Brembo says to set the automatic adjuster after refitting the drum by pressing the brake pedal several times, then adjust the hand brake.",
   "Dexter's method for manual adjusters: turn the adjuster out until the linings drag hard as the drum turns, then back it off until the drum turns freely with slight lining drag, and give every brake the same clearance.",
   "Wagner notes that on some designs applying the parking brake makes the shoes adjust themselves, and that a pedal which improves when pumped on a car with rear drums can mean the rear shoes are out of adjustment.",
   "On duo-servo brakes with the adjuster at the bottom, Phoenix Systems confirms the parking brake is fully released by looking for a small gap, about 1/8 in, between the parking brake strut rod and the primary shoe."
  ],
  "car": "Volvo's press specification lists brake disc diameters for the front (300 to 371 mm, by rim size) and the rear (302 mm), and the owner's manual describes an electric parking brake, so there are no drum shoes or parking brake shoes to adjust on this car.",
  "src": [
   [
    "49 CFR 571.135 - Standard No. 135; Light vehicle brake systems",
    "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-V/part-571/subpart-B/section-571.135"
   ],
   [
    "Instructions for replacing the brake shoes on cars and light commercial vehicles",
    "https://www.bremboparts.com/america/en/support/assembly-instructions/CarAM_BrakeShoe"
   ],
   [
    "Instructions for replacing brake shoe kits",
    "https://www.bremboparts.com/europe/en/support/car/car-fitting/instructions-for-replacing-brake-shoe-kits-280499"
   ],
   [
    "Installation Instructions: Shoe and Lining Kit for 12-1/4\" x 3-3/8\", 12-1/4\" x 4\" & 12-1/4\" x 5\" Hydraulic Brakes (Dexter Axle 059-101-00)",
    "https://dextergroup.com/user_area/content_media/raw/shoe-and-lining-kit-12-25-x-3-375-12-25-x-4-amp-12-25-x-5-hydraulic-brakes-(059-101-00).pdf"
   ],
   [
    "Installation Instructions for the Hydraulic Drum Brake Replacement Shoe Lining Kit, 10\" x 2-1/4\" or 12\" x 2\" (Dexter Axle 059-260-00)",
    "https://static.nhtsa.gov/odi/tsbs/2019/MC-10165671-0001.pdf"
   ],
   [
    "Causes of Spongy Brakes | Wagner Brake",
    "http://www.wagnerbrake.com/technical/technical-tips/why-are-my-brakes-spongy.html"
   ],
   [
    "Steps to a Quality Drum Brake Job",
    "https://phoenixsystems.co/blogs/brake-system-tips/steps-to-a-quality-drum-brake-job"
   ],
   [
    "Volvo V60 specifications (Volvo Cars press material, Sept 2016)",
    "https://mb.cision.com/Public/23609/4188195/aa2ab97f7dbcaad0.pdf"
   ],
   [
    "Volvo V60 Owner's Manual, model year 2016, US web edition (TP 20238)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ]
  ],
  "qs": [
   {
    "q": "After relining drum brakes that have manual adjusters, how should the shoes be set?",
    "o": [
     "Expanded until the drum locks, and left there",
     "Expanded to a heavy drag, then backed off until the drum turns freely with slight drag",
     "Fully retracted so the linings never touch the drum",
     "Set tight on one side and loose on the other to suit road crown"
    ],
    "a": 1,
    "why": "Dexter's instructions turn the adjuster out until the linings drag hard, then back it off so the drum turns freely with slight lining drag, with the same clearance at every brake.",
    "src": [
     "Installation Instructions: Shoe and Lining Kit for 12-1/4\" x 3-3/8\", 12-1/4\" x 4\" & 12-1/4\" x 5\" Hydraulic Brakes (Dexter Axle 059-101-00)",
     "https://dextergroup.com/user_area/content_media/raw/shoe-and-lining-kit-12-25-x-3-375-12-25-x-4-amp-12-25-x-5-hydraulic-brakes-(059-101-00).pdf"
    ]
   },
   {
    "q": "A car with rear drum brakes has a brake pedal that rises when pumped. Technician A says the rear shoes may be out of adjustment. Technician B says the parking brake never plays a part in shoe adjustment. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 0,
    "why": "Wagner says a pedal that improves with pumping on a rear-drum car can mean the rear shoes are out of adjustment, and that on some designs applying the parking brake adjusts the shoes automatically.",
    "src": [
     "Causes of Spongy Brakes | Wagner Brake",
     "http://www.wagnerbrake.com/technical/technical-tips/why-are-my-brakes-spongy.html"
    ]
   }
  ]
 },
 "E15": {
  "body": [
   "This task checks that the parking brake applies, holds and fully releases, and that its cable and levers move freely and are not worn or damaged.",
   "Brembo says to inspect the parking brake cable while it is unhooked and replace it if it is worn or damaged, and after reassembly to apply the parking brake lightly to confirm all levers and mechanisms work before returning them to rest.",
   "Brembo's kit instructions order the final work as refit the drum, press the brake pedal repeatedly to set the shoes, then adjust the hand brake.",
   "The parking brake must be fully released before shoe work; on duo-servo brakes Phoenix Systems looks for about 1/8 in of clearance between the strut rod and the primary shoe.",
   "The federal standard for new light vehicles (FMVSS 135, S7.12) requires the parking brake to hold the vehicle, loaded to its GVWR, on a 20% grade for 5 minutes facing both up and down, with no more than 400 N (89.9 lb) on a hand control or 500 N (112.4 lb) on a foot control."
  ],
  "car": "The owner's manual describes an electric parking brake applied by a control and an electric motor, with separate 30 A fuses for the left and right sides in the cargo-area fuse box; it cannot be applied or released if battery voltage is too low, and the manual gives no cable adjustment. For a \"Park brake not fully released\" or \"Parking brake Service required\" message, Volvo says to apply and release it several times and contact a Volvo workshop if the fault remains.",
  "src": [
   [
    "Instructions for replacing the brake shoes on cars and light commercial vehicles",
    "https://www.bremboparts.com/america/en/support/assembly-instructions/CarAM_BrakeShoe"
   ],
   [
    "Instructions for replacing brake shoe kits",
    "https://www.bremboparts.com/europe/en/support/car/car-fitting/instructions-for-replacing-brake-shoe-kits-280499"
   ],
   [
    "Steps to a Quality Drum Brake Job",
    "https://phoenixsystems.co/blogs/brake-system-tips/steps-to-a-quality-drum-brake-job"
   ],
   [
    "49 CFR 571.135 - Standard No. 135; Light vehicle brake systems",
    "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-V/part-571/subpart-B/section-571.135"
   ],
   [
    "Volvo V60 Owner's Manual, model year 2016, US web edition (TP 20238)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ]
  ],
  "qs": [
   {
    "q": "Under FMVSS 135, a new light vehicle loaded to its GVWR must be held by its parking brake for 5 minutes on what grade, facing both directions?",
    "o": [
     "10%",
     "15%",
     "20%",
     "30%"
    ],
    "a": 2,
    "why": "FMVSS 135 S7.12 tests the parking brake on a 20% grade, with the vehicle held stationary for 5 minutes facing uphill and downhill.",
    "src": [
     "49 CFR 571.135 - Standard No. 135; Light vehicle brake systems",
     "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-V/part-571/subpart-B/section-571.135"
    ]
   },
   {
    "q": "During a drum brake job that includes the parking brake, which step is LEAST likely to be correct?",
    "o": [
     "Inspecting the cable while it is unhooked and replacing it if worn",
     "Applying the parking brake lightly after assembly to check the levers move",
     "Adjusting the parking brake before the drum is refitted and the shoes are set",
     "Confirming the parking brake is fully released before working on the shoes"
    ],
    "a": 2,
    "why": "Brembo's kit instructions refit the drum and press the pedal repeatedly to set the shoes before the hand brake is adjusted.",
    "src": [
     "Instructions for replacing brake shoe kits",
     "https://www.bremboparts.com/europe/en/support/car/car-fitting/instructions-for-replacing-brake-shoe-kits-280499"
    ]
   }
  ]
 },
 "E16": {
  "body": [
   "The last steps refit the drum and wheel, tighten the wheel fasteners to the maker's torque in a crosswise pattern, set and bleed the brakes, and check them before driving.",
   "Brembo says to refit the drum, press the brake pedal several times to set the automatic adjuster, and bleed the brake circuit when the hydraulics were opened, such as for a new wheel cylinder.",
   "Volvo's wheel procedure: clean the contact faces on the wheel and hub, fit the nuts hand-tight, snug them crosswise, then lower the car and tighten them crosswise to 103 lb-ft (140 Nm).",
   "Dexter's instructions for its trailer drum brakes burnish new shoes with 20 to 30 stops from 40 mph down to 20 mph, letting the brakes cool between stops."
  ],
  "car": "Volvo's owner's manual gives 103 ft. lbs. (140 Nm) for the wheel nuts, tightened crosswise after the car is lowered to the ground. Volvo's press specification lists brake disc diameters front and rear, so there is no drum to refit on this car.",
  "src": [
   [
    "Instructions for replacing the brake shoes on cars and light commercial vehicles",
    "https://www.bremboparts.com/america/en/support/assembly-instructions/CarAM_BrakeShoe"
   ],
   [
    "Volvo V60 Owner's Manual, model year 2016, US web edition (TP 20238)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ],
   [
    "Installation Instructions: Shoe and Lining Kit for 12-1/4\" x 3-3/8\", 12-1/4\" x 4\" & 12-1/4\" x 5\" Hydraulic Brakes (Dexter Axle 059-101-00)",
    "https://dextergroup.com/user_area/content_media/raw/shoe-and-lining-kit-12-25-x-3-375-12-25-x-4-amp-12-25-x-5-hydraulic-brakes-(059-101-00).pdf"
   ],
   [
    "Volvo V60 specifications (Volvo Cars press material, Sept 2016)",
    "https://mb.cision.com/Public/23609/4188195/aa2ab97f7dbcaad0.pdf"
   ]
  ],
  "qs": [
   {
    "q": "A technician refits a wheel on a 2016 Volvo V60. Which procedure matches Volvo's owner's manual?",
    "o": [
     "Tighten each nut fully to 103 lb-ft in a circle while the wheel is still in the air",
     "Snug the nuts crosswise, lower the car, then tighten them crosswise to 103 lb-ft (140 Nm)",
     "Run the nuts on with an impact wrench at its highest setting",
     "Tighten to 140 lb-ft crosswise with the car on the ground"
    ],
    "a": 1,
    "why": "The manual says to fit the nuts hand-tight, snug them crosswise, lower the car and then tighten them crosswise to 103 ft. lbs. (140 Nm).",
    "src": [
     "Volvo V60 Owner's Manual, model year 2016, US web edition (TP 20238)",
     "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
    ]
   },
   {
    "q": "After fitting new shoes and a new wheel cylinder, Technician A says the brake circuit must be bled. Technician B says the brake pedal should be pressed several times after the drum is refitted to set the automatic adjuster. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 2,
    "why": "Brembo's instructions say to refit the drum, set the automatic adjuster by operating the brake pedal several times, and then bleed the brake fluid circuit.",
    "src": [
     "Instructions for replacing the brake shoes on cars and light commercial vehicles",
     "https://www.bremboparts.com/america/en/support/assembly-instructions/CarAM_BrakeShoe"
    ]
   }
  ]
 },
 "E17": {
  "body": [
   "Some rear calipers have the parking brake built in, so the piston cannot just be pushed straight back the way a plain hydraulic piston is.",
   "On calipers with a mechanical parking brake and clearance adjuster, Brembo returns the piston by turning it or by using an adjustment screw, depending on the caliper type.",
   "For electric parking brake calipers, Brembo's instructions connect a diagnostic tool and enter maintenance mode as the vehicle maker specifies; after an electrical failure, the actuator is removed and the piston pulled back by turning its Torx screw clockwise.",
   "ZF warns not to press an electric parking brake piston back while rotating it, because that damages the spindle, and says the notches on the piston have no function.",
   "Pushing any piston back sends fluid up into the reservoir, so the cap is opened and the level watched to stop an overflow that can damage paint."
  ],
  "car": "Volvo says the V60's rear brake linings must be replaced at a workshop because of the electric parking brake's design, and recommends an authorized Volvo workshop. The owner's manual adds that the parking brake can be neither applied nor released if battery voltage is too low.",
  "src": [
   [
    "How to replace brake pad. Brake pad assembly instruction",
    "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-disassembly-and-installation-of-brake-pads-for-car-commercial-vehicles-280496"
   ],
   [
    "Instructions for replacing brake rotors and pads: Greenance Kit",
    "https://www.bremboparts.com/america/en/support/assembly-instructions/CarAM_EvKit"
   ],
   [
    "Instructions for replacing the brake calipers on cars and light commercial vehicles",
    "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-replacing-the-brake-calipers-on-cars-and-light-commercial-vehicles-280504"
   ],
   [
    "The best electric parking brake",
    "https://aftermarket.zf.com/en/aftermarket-portal/whats-new/expert-blog/inbrief-trw-epb-actuators/"
   ],
   [
    "Instructions for replacing the brake caliper",
    "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-replacing-the-brake-caliper-280503"
   ],
   [
    "V60 Parking brake | Volvo Support AU",
    "https://www.volvocars.com/au/support/car/v60/14w20/article/063c7e8bf78eea4dc0a801e800a131f7/"
   ],
   [
    "Volvo V60 2016 Owner's Manual, Web Edition (TP 20238)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ]
  ],
  "qs": [
   {
    "q": "A technician is retracting the piston of a rear caliper fitted with an electric parking brake actuator. Which action is MOST likely to damage the actuator spindle?",
    "o": [
     "Entering the maintenance mode with a diagnostic tool first",
     "Pressing the piston back while rotating it",
     "Opening the reservoir cap before retracting",
     "Supporting the caliper so the hose is not stretched"
    ],
    "a": 1,
    "why": "ZF warns that pressing an electric parking brake piston back while rotating it damages the spindle.",
    "src": [
     "The best electric parking brake",
     "https://aftermarket.zf.com/en/aftermarket-portal/whats-new/expert-blog/inbrief-trw-epb-actuators/"
    ]
   },
   {
    "q": "A rear caliper has a mechanical parking brake with an automatic clearance adjuster. How is its piston MOST likely returned before fitting new pads?",
    "o": [
     "By turning the piston or using the adjustment screw, as the caliper type requires",
     "By opening the bleeder and pumping the brake pedal",
     "By applying the parking brake with the pads removed",
     "By pulling the piston out and refitting it deeper"
    ],
    "a": 0,
    "why": "Brembo's pad instructions say that on calipers with a mechanical parking brake adjustment feature, the piston is returned by turning it or with an adjustment screw, depending on the type.",
    "src": [
     "How to replace brake pad. Brake pad assembly instruction",
     "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-disassembly-and-installation-of-brake-pads-for-car-commercial-vehicles-280496"
    ]
   }
  ]
 },
 "E18": {
  "body": [
   "Before the caliper comes off, the reservoir cap is opened and the fluid level checked, because pushing the pistons back raises the level.",
   "For pad or rotor work the caliper's fluid hose stays connected, and the caliper is supported from the chassis so the hose is not stretched, kinked or clamped.",
   "When the caliper itself is being replaced, Brembo puts a spacer between the seat and the brake pedal to hold the hydraulic circuit closed, loosens the supply line, removes the fastening screws and keeps the detached line raised to limit leakage.",
   "Inspection covers the caliper and its sliding parts for wear; a caliper showing fluid contamination or damage is replaced.",
   "Brake fluid irritates skin and eyes and damages paint, so spills are wiped up at once and cleaned with water."
  ],
  "car": "Volvo's manual says that if the fluid is below the MIN mark or a brake system message shows, the V60 must not be driven and should be towed to a Volvo technician for a brake inspection.",
  "src": [
   [
    "Instructions for replacing the brake caliper",
    "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-replacing-the-brake-caliper-280503"
   ],
   [
    "How to replace brake pad. Brake pad assembly instruction",
    "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-disassembly-and-installation-of-brake-pads-for-car-commercial-vehicles-280496"
   ],
   [
    "How to replace brake rotors - Brembo Instruction",
    "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-replacement-of-brake-disc-278446"
   ],
   [
    "Volvo V60 2016 Owner's Manual, Web Edition (TP 20238)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ]
  ],
  "qs": [
   {
    "q": "Only the pads are being replaced. Technician A says the caliper is unbolted and hung from the chassis with the fluid hose still connected. Technician B says the fluid hose is disconnected so the caliper can be set on the bench. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 0,
    "why": "Brembo's pad instructions say the caliper fluid hose must not be disconnected and the caliper must be supported so the hose is not stretched, kinked or clamped.",
    "src": [
     "How to replace brake pad. Brake pad assembly instruction",
     "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-disassembly-and-installation-of-brake-pads-for-car-commercial-vehicles-280496"
    ]
   },
   {
    "q": "With the pads removed, a caliper body is found wet with brake fluid. What is the MOST likely correct action?",
    "o": [
     "Clean it and refit it with new pads",
     "Replace the caliper",
     "Top up the reservoir and road test",
     "Grease the piston boot"
    ],
    "a": 1,
    "why": "Brembo says a caliper showing brake fluid contamination or damage is to be replaced.",
    "src": [
     "How to replace brake pad. Brake pad assembly instruction",
     "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-disassembly-and-installation-of-brake-pads-for-car-commercial-vehicles-280496"
    ]
   }
  ]
 },
 "E19": {
  "body": [
   "The pad seat, bracket, caliper body and guides are cleaned with a cleaner that contains no mineral oil, using a damp cloth; compressed air and hard brushes are not used.",
   "Cracked or damaged dust boots are replaced, and so are corroded guide bolts.",
   "On a floating caliper the pins and guide bushes must slide smoothly; damaged rubber parts are replaced.",
   "Slide guides get a light coat of the grease the vehicle or caliper maker specifies; Brembo's bracket kit greases the inside of the boots, the bushes and their seats, and grease must never reach the braking surfaces.",
   "Petrol and similar solvents are kept off the boots because they damage them.",
   "Sticking caliper sliding parts are one of the causes Brembo names for brake noise and vibration."
  ],
  "car": null,
  "src": [
   [
    "How to replace brake pad. Brake pad assembly instruction",
    "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-disassembly-and-installation-of-brake-pads-for-car-commercial-vehicles-280496"
   ],
   [
    "How to replace brake rotors - Brembo Instruction",
    "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-replacement-of-brake-disc-278446"
   ],
   [
    "Instructions for replacing the caliper bracket on cars and light commercial vehicles",
    "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-replacing-the-caliper-bracket-on-cars-and-light-commercial-vehicles-280505"
   ],
   [
    "Noises and vibrations - Maintenance",
    "https://www.bremboparts.com/america/en/support/car/maintenance/noises-and-vibrations-113941"
   ]
  ],
  "qs": [
   {
    "q": "During a pad job, one guide bolt of a floating caliper is found corroded. What is the MOST likely correct action?",
    "o": [
     "Replace the guide bolt",
     "Wire-brush it and refit it dry",
     "Coat it with engine oil",
     "Leave it, since only the pads are being replaced"
    ],
    "a": 0,
    "why": "Brembo's pad instructions say corroded guide bolts are replaced.",
    "src": [
     "How to replace brake pad. Brake pad assembly instruction",
     "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-disassembly-and-installation-of-brake-pads-for-car-commercial-vehicles-280496"
    ]
   },
   {
    "q": "All of the following are acceptable when cleaning a caliper bracket and guides EXCEPT:",
    "o": [
     "Wiping with a damp cloth",
     "Using a cleaner without mineral oil",
     "Blowing the dust off with compressed air",
     "Replacing a cracked dust boot"
    ],
    "a": 2,
    "why": "Brembo says brake parts are not cleaned with compressed air or hard brushes; a damp cloth and a non-mineral-oil cleaner are used instead.",
    "src": [
     "How to replace brake pad. Brake pad assembly instruction",
     "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-disassembly-and-installation-of-brake-pads-for-car-commercial-vehicles-280496"
    ]
   }
  ]
 },
 "E20": {
  "body": [
   "The position of every part is noted before removal, and one side of the axle is done at a time so the other side serves as a reference.",
   "Pad springs are released under control; Brembo fits new pad springs at every pad change and replaces worn shims, and its noise guidance says old anti-noise shims should not be reused.",
   "Brembo's fitting instructions replace all pads on the axle when friction material is under 2 mm or the wear indicator has come on; its owner article gives new pads as about 10-12 mm and calls for replacement below 3 mm.",
   "Uneven wear points to damaged discs, incorrect assembly or a caliper malfunction, and the color and surface of removed pads and rotors can reveal caliper, pad or bearing problems.",
   "Pads touched by grease or oil are replaced, always as an axle set."
  ],
  "car": "Volvo's manual says pad condition is checked by raising the V60, removing the wheel and looking at the pads, after letting hot parts cool. Volvo also says the rear linings must be replaced at a workshop because of the electric parking brake.",
  "src": [
   [
    "How to replace brake pad. Brake pad assembly instruction",
    "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-disassembly-and-installation-of-brake-pads-for-car-commercial-vehicles-280496"
   ],
   [
    "Noises and vibrations - Maintenance",
    "https://www.bremboparts.com/america/en/support/car/maintenance/noises-and-vibrations-113941"
   ],
   [
    "Worn brake pads? Solutions and remedies",
    "https://www.bremboparts.com/america/en/support/car/maintenance/how-can-i-tell-if-my-brake-pads-are-worn-335458"
   ],
   [
    "When to replace disc brake rotors. Car repair and maintenance",
    "https://www.bremboparts.com/america/en/support/maintenance/indications-and-bedding-in-90374"
   ],
   [
    "Instructions for replacing brake rotors and pads: Greenance Kit",
    "https://www.bremboparts.com/america/en/support/assembly-instructions/CarAM_EvKit"
   ],
   [
    "Volvo V60 2016 Owner's Manual, Web Edition (TP 20238)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ],
   [
    "V60 Parking brake | Volvo Support AU",
    "https://www.volvocars.com/au/support/car/v60/14w20/article/063c7e8bf78eea4dc0a801e800a131f7/"
   ]
  ],
  "qs": [
   {
    "q": "On one front wheel the inner pad is worn far more than the outer pad. Which is the MOST likely cause?",
    "o": [
     "A caliper malfunction",
     "Brake fluid that is due for replacement",
     "Wheel bolts tightened in a star pattern",
     "DOT 4 fluid in the reservoir"
    ],
    "a": 0,
    "why": "Brembo lists a caliper malfunction, along with damaged discs and incorrect assembly, as a cause of uneven pad wear.",
    "src": [
     "Worn brake pads? Solutions and remedies",
     "https://www.bremboparts.com/america/en/support/car/maintenance/how-can-i-tell-if-my-brake-pads-are-worn-335458"
    ]
   },
   {
    "q": "One front pad has 1.5 mm of friction material left; the other three front pads have more. Technician A says only that pad needs replacing. Technician B says all pads on the front axle are replaced. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 1,
    "why": "Brembo replaces all pads on the axle when friction material is under 2 mm, and says pads are always replaced across the axle.",
    "src": [
     "How to replace brake pad. Brake pad assembly instruction",
     "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-disassembly-and-installation-of-brake-pads-for-car-commercial-vehicles-280496"
    ]
   }
  ]
 },
 "E21": {
  "body": [
   "Caliper inspection covers the pistons, seals, dust boots and sliding parts for damage, corrosion and free movement.",
   "A caliper showing fluid contamination or damage is replaced, and parts fixed to the piston are not taken apart; Brembo leaves their repair to an authorized workshop.",
   "Caliper parts are cleaned with agents free of mineral oil, solvents that attack rubber are avoided, and sharp tools are never used to fit rubber parts.",
   "A replacement caliper is bolted on to the vehicle maker's torque, the line reconnected, and the system bled; Brembo's torque table is a reference only.",
   "ZF recommends replacing calipers in pairs, replacing an electric parking brake actuator alone only once the caliper is confirmed sound, and calibrating the parking brake after either job."
  ],
  "car": "Volvo's manual says a \"Parking brake Service required\" message means a fault: try applying and releasing, and contact a Volvo workshop if it remains. Volvo also routes rear lining replacement on the V60 to a workshop.",
  "src": [
   [
    "Noises and vibrations - Maintenance",
    "https://www.bremboparts.com/america/en/support/car/maintenance/noises-and-vibrations-113941"
   ],
   [
    "How to replace brake pad. Brake pad assembly instruction",
    "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-disassembly-and-installation-of-brake-pads-for-car-commercial-vehicles-280496"
   ],
   [
    "Instructions for replacing brake rotors and pads: Greenance Kit",
    "https://www.bremboparts.com/america/en/support/assembly-instructions/CarAM_EvKit"
   ],
   [
    "Instructions for replacing the brake caliper",
    "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-replacing-the-brake-caliper-280503"
   ],
   [
    "The best electric parking brake",
    "https://aftermarket.zf.com/en/aftermarket-portal/whats-new/expert-blog/inbrief-trw-epb-actuators/"
   ],
   [
    "Volvo V60 2016 Owner's Manual, Web Edition (TP 20238)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ],
   [
    "V60 Parking brake | Volvo Support AU",
    "https://www.volvocars.com/au/support/car/v60/14w20/article/063c7e8bf78eea4dc0a801e800a131f7/"
   ]
  ],
  "qs": [
   {
    "q": "A rear caliper with an electric parking brake actuator has just been replaced. What is MOST likely required before the job is finished?",
    "o": [
     "Calibrating the parking brake system",
     "Replacing the brake master cylinder",
     "Adjusting a parking brake cable",
     "Removing the actuator from the new caliper"
    ],
    "a": 0,
    "why": "ZF states that the parking brake system must be calibrated after electric parking brake calipers or actuators are replaced.",
    "src": [
     "The best electric parking brake",
     "https://aftermarket.zf.com/en/aftermarket-portal/whats-new/expert-blog/inbrief-trw-epb-actuators/"
    ]
   },
   {
    "q": "Which cleaner is MOST appropriate for a caliper body and its guides?",
    "o": [
     "Petrol",
     "A cleaning agent containing no mineral oil",
     "Engine oil",
     "Any mineral-based solvent"
    ],
    "a": 1,
    "why": "Brembo specifies cleaning the caliper body and guides with non-mineral-oil cleaning agents, since mineral oil must never reach the friction material.",
    "src": [
     "Instructions for replacing brake rotors and pads: Greenance Kit",
     "https://www.bremboparts.com/america/en/support/assembly-instructions/CarAM_EvKit"
    ]
   }
  ]
 },
 "E22": {
  "body": [
   "Rotor thickness is measured with a gauge at four or more points, and the lowest reading is compared with the MIN TH value stamped on the disc in millimetres.",
   "A disc under MIN TH is replaced, on both sides of the axle; Brembo also replaces discs with deep scoring, radial cracks, blue or dark spots, or significant deformation.",
   "Lateral runout is read with a dial gauge set 5 mm in from the outer edge, with the disc held by several wheel nuts; Brembo's limit is 0.10 mm for cars.",
   "If runout is too high, the disc is refitted in a different position on the hub and measured again; if it is still high, the hub face is measured, with a limit about half the disc's (0.050 mm in Brembo's noise guide).",
   "Raybestos and Pro-Cut aim for 0.002 in of runout or less as installed, and Pro-Cut names excess runout as the root cause of thickness variation and pedal pulsation.",
   "A machined rotor must still be above the maker's minimum or machine-to thickness."
  ],
  "car": null,
  "src": [
   [
    "Minimum brake disc thickness - Maintenance",
    "https://www.bremboparts.com/europe/is/support/car/maintenance/minimum-brake-disc-thickness-212337"
   ],
   [
    "When to replace disc brake rotors. Car repair and maintenance",
    "https://www.bremboparts.com/america/en/support/maintenance/indications-and-bedding-in-90374"
   ],
   [
    "How to replace brake rotors - Brembo Instruction",
    "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-replacement-of-brake-disc-278446"
   ],
   [
    "Noises and vibrations - Maintenance",
    "https://www.bremboparts.com/america/en/support/car/maintenance/noises-and-vibrations-113941"
   ],
   [
    "Bulletin BPI 12-01: Importance of On-Vehicle Brake Lathe Use",
    "https://www.procutusa.com/pdf/oem/Raybestor-Bulletin-BPI-12-01.pdf"
   ],
   [
    "PFM Quick Start Training Guide",
    "https://www.procutusa.com/pdf/trainsmart_pfm-training_guide.pdf"
   ]
  ],
  "qs": [
   {
    "q": "A new rotor shows 0.15 mm of lateral runout on a car where the limit is 0.10 mm. Technician A says to refit the rotor in a different position on the hub and measure again. Technician B says that if runout is still high, the hub mounting face is measured next. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 2,
    "why": "Brembo's disc instructions say to refit the disc in a different position and re-measure, and if runout is still unacceptable, to measure the hub face and replace the hub if needed.",
    "src": [
     "How to replace brake rotors - Brembo Instruction",
     "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-replacement-of-brake-disc-278446"
    ]
   },
   {
    "q": "A rotor is measured at four points around the disc. Which reading is compared with the MIN TH stamped on the rotor?",
    "o": [
     "The highest reading",
     "The average of the four",
     "The lowest reading",
     "The reading nearest the valve stem"
    ],
    "a": 2,
    "why": "Brembo says to measure at least four points and use the lowest value as the reference for the whole disc.",
    "src": [
     "Minimum brake disc thickness - Maintenance",
     "https://www.bremboparts.com/europe/is/support/car/maintenance/minimum-brake-disc-thickness-212337"
    ]
   }
  ]
 },
 "E23": {
  "body": [
   "The wheel and pads come off, the pistons are retracted, and the caliper is removed from its mount without disconnecting the hose and is supported from the chassis; the carrier is removed if needed, then the disc.",
   "The hub mounting face is cleaned of rust and deposits and checked for damage, and the new disc's mounting face is cleaned and kept free of oil and grease.",
   "The wheel bearings are checked for smooth rotation and correct end float before the new disc goes on, and directional vented discs are fitted the right way round.",
   "Both discs on the axle are replaced together, with new pads, and the brake pedal and parking brake are never applied while the system is apart.",
   "After fitting, disc runout is checked, the caliper refitted with its slides checked, the pads fitted, the pedal pumped until it feels right, and the fluid level checked."
  ],
  "car": "Volvo's manual says to clean the contact surfaces on the wheel and hub before refitting a V60 wheel, then tighten the bolts crosswise to 103 ft. lbs. (140 Nm).",
  "src": [
   [
    "How to replace brake rotors - Brembo Instruction",
    "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-replacement-of-brake-disc-278446"
   ],
   [
    "Volvo V60 2016 Owner's Manual, Web Edition (TP 20238)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ]
  ],
  "qs": [
   {
    "q": "One front rotor is cracked and the other is in good condition. Technician A says both front rotors are replaced along with the pads. Technician B says the brake pedal may be pressed while the caliper is off to check the master cylinder. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 0,
    "why": "Brembo says both discs on the axle are always replaced together with the pads, and that the brake pedal and parking brake must never be applied while the system is open.",
    "src": [
     "How to replace brake rotors - Brembo Instruction",
     "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-replacement-of-brake-disc-278446"
    ]
   },
   {
    "q": "Before a new rotor is mounted, which step does MOST to prevent excess runout once it is installed?",
    "o": [
     "Greasing the hub face",
     "Cleaning rust and deposits from the hub mounting face",
     "Pumping the brake pedal",
     "Overfilling the brake fluid reservoir"
    ],
    "a": 1,
    "why": "Brembo has the hub mounting face cleaned of rust and deposits and checked for deformation before fitting, then checks runout; grease or oil must not touch the mounting face.",
    "src": [
     "How to replace brake rotors - Brembo Instruction",
     "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-replacement-of-brake-disc-278446"
    ]
   }
  ]
 },
 "E24": {
  "body": [
   "Before machining, the rotor is checked for cracks, severe discoloration or corrosion and its thickness measured to confirm it is serviceable.",
   "A Raybestos bulletin says some carmakers, including Honda, Hyundai, Mazda and Volkswagen, stress the on-vehicle lathe as the only way to resurface rotors.",
   "On an on-car lathe, the hub, rotor and adapter mating faces are cleaned, the adapter nuts are tightened evenly (no more than 20-25 ft-lb in Pro-Cut's PFM guide), and the lathe compensates for runout before it cuts.",
   "Pro-Cut's PFM guide gives a cut of .004 to .020 in per side, with .005 in per side at most on thin solid or drilled or slotted rotors, and a runout target under .002 in.",
   "After the cut, runout and thickness are rechecked before the adapter comes off, the rotor must still be above minimum thickness, and it is washed with warm soapy water and wiped until clean to remove metal grit.",
   "If the rotor has to come off afterwards, it is match-marked to the hub so the runout correction is kept."
  ],
  "car": null,
  "src": [
   [
    "Bulletin BPI 12-01: Importance of On-Vehicle Brake Lathe Use",
    "https://www.procutusa.com/pdf/oem/Raybestor-Bulletin-BPI-12-01.pdf"
   ],
   [
    "PFM Quick Start Training Guide",
    "https://www.procutusa.com/pdf/trainsmart_pfm-training_guide.pdf"
   ],
   [
    "Pro-Cut 9.0 Technical Manual",
    "https://www.procutusa.com/pdf/90-technical-manual.pdf"
   ]
  ],
  "qs": [
   {
    "q": "After an on-car lathe cut, the rotor faces are covered in fine metal dust. What is the MOST appropriate cleaning method?",
    "o": [
     "Blowing the dust off with compressed air",
     "Washing with hot soapy water and a brush",
     "Wiping with a shop rag and brake grease",
     "Leaving it for the pads to clean off"
    ],
    "a": 1,
    "why": "The Raybestos bulletin says machined rotors are washed with hot, soapy water and a brush to remove grit.",
    "src": [
     "Bulletin BPI 12-01: Importance of On-Vehicle Brake Lathe Use",
     "https://www.procutusa.com/pdf/oem/Raybestor-Bulletin-BPI-12-01.pdf"
    ]
   },
   {
    "q": "Technician A says a rotor machined on the car is match-marked to the hub if it must be removed afterwards. Technician B says no pulsation on the road test proves the runout was corrected. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 0,
    "why": "Pro-Cut's guide says to match-mark and refit the rotor in the same position to keep the runout correction, and warns that pulsation can take 5,000-7,000 miles to appear, so a clean test drive proves nothing.",
    "src": [
     "PFM Quick Start Training Guide",
     "https://www.procutusa.com/pdf/trainsmart_pfm-training_guide.pdf"
    ]
   }
  ]
 },
 "E25": {
  "body": [
   "New pads must move freely in their seats, with friction material facing the disc and any direction arrow pointing the way the wheel turns going forward.",
   "Grease goes only on the backing plate where it touches the guides and pistons, as the vehicle maker specifies; the back is skipped if the pad has a noise shim, and friction surfaces stay clean.",
   "Caliper fastening screws are tightened to the vehicle maker's torque, and self-locking screws are replaced with new ones.",
   "If the hydraulic line was opened, each bleeder is bled into a container through a clear tube: open the bleeder, press the pedal, hold it down, close the bleeder, release, and repeat until the fluid has no bubbles and the pedal feels normal.",
   "The pedal is then pumped until its travel settles at about one-third of full travel, and with the engine running a firm pedal check confirms no leaks and that the brake lights come on."
  ],
  "car": "Volvo's manual says to always leave brake fluid changes to a trained and qualified Volvo service technician, and specifies DOT 4 fluid for the V60.",
  "src": [
   [
    "How to replace brake pad. Brake pad assembly instruction",
    "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-disassembly-and-installation-of-brake-pads-for-car-commercial-vehicles-280496"
   ],
   [
    "How to replace brake rotors - Brembo Instruction",
    "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-replacement-of-brake-disc-278446"
   ],
   [
    "Instructions for replacing brake rotors and pads: Greenance Kit",
    "https://www.bremboparts.com/america/en/support/assembly-instructions/CarAM_EvKit"
   ],
   [
    "Instructions for replacing the brake caliper",
    "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-replacing-the-brake-caliper-280503"
   ],
   [
    "Instructions for replacing the brake calipers on cars and light commercial vehicles",
    "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-replacing-the-brake-calipers-on-cars-and-light-commercial-vehicles-280504"
   ],
   [
    "Volvo V60 2016 Owner's Manual, Web Edition (TP 20238)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ]
  ],
  "qs": [
   {
    "q": "When new disc brake pads are installed, where is grease MOST likely applied?",
    "o": [
     "On the friction material",
     "On the rotor braking surface",
     "On the metal backing plate where it contacts the guides and pistons",
     "Inside the bleeder screw"
    ],
    "a": 2,
    "why": "Brembo applies grease only to the pad's metal backing and back, as the vehicle maker specifies, and never to friction surfaces.",
    "src": [
     "How to replace brake pad. Brake pad assembly instruction",
     "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-disassembly-and-installation-of-brake-pads-for-car-commercial-vehicles-280496"
    ]
   },
   {
    "q": "A caliper is being bled with a clear tube from the bleeder into a container. When is the bleeder MOST likely closed?",
    "o": [
     "While the pedal is held down",
     "Just after the pedal is released",
     "Only once the reservoir is empty",
     "Before the pedal is first pressed"
    ],
    "a": 0,
    "why": "Brembo's procedure holds the pedal down, closes the bleeder, then releases the pedal and repeats until the fluid runs free of bubbles.",
    "src": [
     "Instructions for replacing the brake caliper",
     "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-replacing-the-brake-caliper-280503"
    ]
   }
  ]
 },
 "E26": {
  "body": [
   "After reassembly, calipers with a built-in parking brake or automatic clearance adjustment are applied a few times to restore clearance, following the vehicle or caliper maker.",
   "Brembo requires a caliper with parking brake adjustment to have free travel after repeated applications.",
   "On a cable-operated caliper, the cable is reconnected, the lever locking pin removed, and the parking brake applied repeatedly until the lever stroke comes back to its minimum.",
   "The piston must not be moved by the pedal or the parking brake lever while the caliper body is off or the pads are out.",
   "After electric parking brake caliper or actuator work, the system is reset or calibrated with a diagnostic tool, as the vehicle maker specifies."
  ],
  "car": "The V60's parking brake is electric; Volvo's manual notes a faint motor sound when it applies and during its automatic function check, and that the brake pedal moves slightly when it applies or releases. Volvo says the rear linings must be replaced at a workshop because of this design.",
  "src": [
   [
    "How to replace brake pad. Brake pad assembly instruction",
    "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-disassembly-and-installation-of-brake-pads-for-car-commercial-vehicles-280496"
   ],
   [
    "Instructions for replacing brake rotors and pads: Greenance Kit",
    "https://www.bremboparts.com/america/en/support/assembly-instructions/CarAM_EvKit"
   ],
   [
    "Instructions for replacing the brake calipers on cars and light commercial vehicles",
    "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-replacing-the-brake-calipers-on-cars-and-light-commercial-vehicles-280504"
   ],
   [
    "Instructions for replacing the caliper bracket on cars and light commercial vehicles",
    "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-replacing-the-caliper-bracket-on-cars-and-light-commercial-vehicles-280505"
   ],
   [
    "The best electric parking brake",
    "https://aftermarket.zf.com/en/aftermarket-portal/whats-new/expert-blog/inbrief-trw-epb-actuators/"
   ],
   [
    "Volvo V60 2016 Owner's Manual, Web Edition (TP 20238)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ],
   [
    "V60 Parking brake | Volvo Support AU",
    "https://www.volvocars.com/au/support/car/v60/14w20/article/063c7e8bf78eea4dc0a801e800a131f7/"
   ]
  ],
  "qs": [
   {
    "q": "New pads have been fitted to a rear caliper with a cable-operated integral parking brake, and the cable is reconnected. What is MOST likely the next step?",
    "o": [
     "Apply the parking brake repeatedly until the lever stroke returns to minimum",
     "Bleed the caliper with the parking brake applied",
     "Lengthen the cable until the lever is slack",
     "Drive the car with the parking brake applied to seat the pads"
    ],
    "a": 0,
    "why": "Brembo's caliper instructions reconnect the parking cable, remove the lever locking pin, and apply the parking brake repeatedly until the lever stroke returns to minimum.",
    "src": [
     "Instructions for replacing the brake calipers on cars and light commercial vehicles",
     "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-replacing-the-brake-calipers-on-cars-and-light-commercial-vehicles-280504"
    ]
   },
   {
    "q": "Technician A says that after a cable-operated integral parking brake caliper is reconnected, nothing more is needed because it adjusts on the first drive. Technician B says that after electric parking brake caliper work, a reset is performed with a diagnostic tool as the vehicle maker specifies. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 1,
    "why": "Brembo's instructions cycle the parking brake repeatedly after reconnecting the cable, and for electric parking brake calipers finish with a reset done through the diagnostic tool per the vehicle maker.",
    "src": [
     "Instructions for replacing the brake calipers on cars and light commercial vehicles",
     "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-replacing-the-brake-calipers-on-cars-and-light-commercial-vehicles-280504"
    ]
   }
  ]
 },
 "E27": {
  "body": [
   "The reservoir is topped up to between MIN and MAX with new fluid of the grade the vehicle specifies, and the cap, membrane and diaphragm are cleaned before refitting.",
   "Brake fluid absorbs moisture over time, which lowers its boiling point and can lead to vapour lock; dark or cloudy fluid is replaced.",
   "Brembo's general rule is to replace fluid every 2 to 3 years or as the vehicle maker says, and never to switch to a lower DOT grade than the maker specifies.",
   "The pedal is pumped until its stroke stabilizes; if a firm, steady pedal cannot be reached, the whole system is rechecked for leaks and fluid level and the car is not driven.",
   "On cars with an electric parking brake, the reset and any internal counters are handled with a diagnostic tool, as the vehicle maker specifies."
  ],
  "car": "Volvo specifies DOT 4 fluid with a boiling point above 536 °F (280 °C), 0.63 US qts (0.6 liters), in a reservoir under a round cover at the rear of the engine compartment; it says DOT 4 should never be mixed with any other type of brake fluid. Volvo also says to leave brake fluid changes to a trained and qualified Volvo service technician.",
  "src": [
   [
    "How to replace brake pad. Brake pad assembly instruction",
    "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-disassembly-and-installation-of-brake-pads-for-car-commercial-vehicles-280496"
   ],
   [
    "Which brake fluid do I need for my car?",
    "https://www.bremboparts.com/america/en/support/car/how-to-choose-the-right-product/which-is-the-right-brake-fluid-for-my-car-195105"
   ],
   [
    "Instructions for replacing the brake calipers on cars and light commercial vehicles",
    "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-replacing-the-brake-calipers-on-cars-and-light-commercial-vehicles-280504"
   ],
   [
    "Volvo V60 2016 Owner's Manual, Web Edition (TP 20238)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ]
  ],
  "qs": [
   {
    "q": "Which fluid does Volvo specify for topping up the brake reservoir on a 2016 V60?",
    "o": [
     "DOT 3",
     "DOT 4 with a boiling point above 536 °F (280 °C)",
     "Power steering fluid",
     "Any mix of DOT 4 and DOT 5"
    ],
    "a": 1,
    "why": "The owner's manual specifies DOT 4 with a boiling point above 536 °F (280 °C) and says DOT 4 should never be mixed with any other type of brake fluid.",
    "src": [
     "Volvo V60 2016 Owner's Manual, Web Edition (TP 20238)",
     "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
    ]
   },
   {
    "q": "Four-year-old brake fluid looks dark and cloudy. Technician A says the fluid has absorbed moisture, which lowers its boiling point. Technician B says the fluid should be replaced. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 2,
    "why": "Brembo explains that fluid absorbs moisture, lowering its boiling point and risking vapour lock, and that dark or cloudy fluid should be replaced.",
    "src": [
     "Which brake fluid do I need for my car?",
     "https://www.bremboparts.com/america/en/support/car/how-to-choose-the-right-product/which-is-the-right-brake-fluid-for-my-car-195105"
    ]
   }
  ]
 },
 "E28": {
  "body": [
   "The wheel and hub contact surfaces are cleaned, the nuts or bolts are run in by hand, snugged crosswise, and the final torque is applied crosswise with the car back on the ground.",
   "A torque wrench is used in a star pattern; an impact gun at full power can damage threads and the hub.",
   "Too little torque lets bolts loosen, too much can distort the rotor or break bolts, and uneven tightening can cause vibration in the steering wheel and pedal and uneven pad wear.",
   "Before driving, the pedal is pumped until it is firm, the fluid level is checked, and the brake warning lights are confirmed to work.",
   "Brembo's rotor instructions also call for balancing the wheel after it is refitted."
  ],
  "car": "Volvo's manual gives 103 ft. lbs. (140 Nm) for the V60's wheel bolts, tightened alternately crosswise after the car is lowered.",
  "src": [
   [
    "Volvo V60 2016 Owner's Manual, Web Edition (TP 20238)",
    "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
   ],
   [
    "Tightening torques - Maintenance",
    "https://www.bremboparts.com/america/en/support/car/maintenance/tightening-torques-198994"
   ],
   [
    "How to replace brake rotors - Brembo Instruction",
    "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-replacement-of-brake-disc-278446"
   ],
   [
    "How to replace brake pad. Brake pad assembly instruction",
    "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-disassembly-and-installation-of-brake-pads-for-car-commercial-vehicles-280496"
   ]
  ],
  "qs": [
   {
    "q": "What final torque does Volvo give for the wheel bolts on a 2016 V60?",
    "o": [
     "76 ft. lbs. (103 Nm)",
     "103 ft. lbs. (140 Nm)",
     "129 ft. lbs. (175 Nm)",
     "150 ft. lbs. (203 Nm)"
    ],
    "a": 1,
    "why": "The owner's manual says to lower the car and tighten the bolts alternately crosswise to 103 ft. lbs. (140 Nm).",
    "src": [
     "Volvo V60 2016 Owner's Manual, Web Edition (TP 20238)",
     "https://ldgsvccassets.blob.core.windows.net/pdfs/610e4b1a5665ac4d99bd89bd1971f063df1c7284/V60_OwnersManual_MY16_en-US_TP20238.pdf"
    ]
   },
   {
    "q": "Technician A says the wheel nuts get their final tightening with an impact gun at full power. Technician B says they get their final torque with a torque wrench in a star pattern. Who is correct?",
    "o": [
     "Technician A only",
     "Technician B only",
     "Both A and B",
     "Neither A nor B"
    ],
    "a": 1,
    "why": "Brembo calls for a torque wrench and a star pattern, and warns that air or electric guns at maximum power can damage threads and the hub.",
    "src": [
     "Tightening torques - Maintenance",
     "https://www.bremboparts.com/america/en/support/car/maintenance/tightening-torques-198994"
    ]
   }
  ]
 },
 "E29": {
  "body": [
   "Braking can be weaker when new parts are first used, so the road test starts with low-speed trial stops at moderate speed.",
   "During the test the pedal is not held down for more than 3 seconds at a time, and the technician listens and feels for noise or vibration.",
   "The vehicle maker's bedding-in instructions come first; without them, Brembo calls for at least 200 km (125 miles) of gentle, sparing braking without triggering ABS.",
   "Brembo's maintenance guidance describes bedding-in as about 300 km of brief, gradual applications, and warns that hard braking can overheat the pad and rotor friction material.",
   "Brakes that are not bedded in properly may not work as they should, and Pro-Cut notes that pulsation from runout can take 5,000-7,000 miles to appear, so a smooth test drive does not prove the rotors are true."
  ],
  "car": null,
  "src": [
   [
    "How to replace brake rotors - Brembo Instruction",
    "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-replacement-of-brake-disc-278446"
   ],
   [
    "How to replace brake pad. Brake pad assembly instruction",
    "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-disassembly-and-installation-of-brake-pads-for-car-commercial-vehicles-280496"
   ],
   [
    "When to replace disc brake rotors. Car repair and maintenance",
    "https://www.bremboparts.com/america/en/support/maintenance/indications-and-bedding-in-90374"
   ],
   [
    "Instructions for replacing brake rotors and pads: Greenance Kit",
    "https://www.bremboparts.com/america/en/support/assembly-instructions/CarAM_EvKit"
   ],
   [
    "PFM Quick Start Training Guide",
    "https://www.procutusa.com/pdf/trainsmart_pfm-training_guide.pdf"
   ]
  ],
  "qs": [
   {
    "q": "New pads and rotors are fitted, and the vehicle maker gives no bedding-in procedure. Which procedure is MOST in line with Brembo's guidance?",
    "o": [
     "Ten hard stops from highway speed to activate ABS",
     "At least 200 km (125 miles) of gentle, sparing braking without triggering ABS",
     "Holding the brake pedal down for 30 seconds at a stop",
     "Driving with the parking brake partly applied"
    ],
    "a": 1,
    "why": "Brembo's disc instructions say that without the maker's procedure, the brakes are run in over at least 200 km (125 miles) with gentle, sparing braking and no ABS activation.",
    "src": [
     "How to replace brake rotors - Brembo Instruction",
     "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-replacement-of-brake-disc-278446"
    ]
   },
   {
    "q": "All of the following are part of Brembo's road test after a pad replacement EXCEPT:",
    "o": [
     "Keeping the pedal down no more than 3 seconds at a time",
     "Checking for noise or vibration",
     "Making low-speed trial stops first",
     "Repeated hard stops to finish bedding-in quickly"
    ],
    "a": 3,
    "why": "Brembo's pad instructions call for reduced speed, no sudden braking, pedal applications of no more than 3 seconds and checks for noise or vibration, then the maker's bedding-in or gentle braking.",
    "src": [
     "How to replace brake pad. Brake pad assembly instruction",
     "https://www.bremboparts.com/america/en/support/car/car-fitting/instructions-for-disassembly-and-installation-of-brake-pads-for-car-commercial-vehicles-280496"
    ]
   }
  ]
 }
};
