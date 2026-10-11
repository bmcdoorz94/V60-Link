# V60 Garage roadmap

Living tracker. Update it at the end of every work session: move finished items to Done, add new ideas, record answers to open questions.

## Status (2026-10-10)
Story case board shipped. 24 tabs across Today, Learn, Car, Check and Data. Tests pass on phone, desktop and dark.

## Next
- [ ] Ask Kyle for his build month (door-pillar label) and the other backlog questions below.
- [ ] First real-car test of Live link in Bluefy once the adapter arrives.
- [ ] Story polish after Kyle uses it: more cutscene art per case, and an "Evidence" photo attachment per case.

## Backlog
- [ ] Build month from the door-pillar label (asked 2026-10-10; drives bulletin applicability).
- [ ] Engine bay photo to calibrate the bay map to the real car.
- [ ] Monthly reminder for oil level and tire pressure (needs a scheduled task or calendar file; the calendar .ics export already exists).
- [ ] Import the recent oil change receipt and any others.
- [ ] Confirm whether the OBDLink CX has been ordered, then test Live link on the real car in Bluefy.
- [ ] Ask whether any service contract or extended warranty came with the car.
- [ ] Fuel log frequency: every fill-up or occasional.
- [ ] Upgrade interests: CarPlay, Polestar, tires, dash cam.
- [ ] Today screen header repeats information from the top bar; tighten it.
- [ ] Factory option list by VIN (dealer printout) to confirm Premier content and packages.
- [ ] Unconfirmed items to resolve when sources allow:
  - Polestar availability and price in 2026
  - 4G modem (SMB 00-035) availability
  - Live tire prices
  - NHTSA position specific to LED bulbs
  - Petrol injection pressure and turbo type
  - Which TG-81SC ratio set applies
  - Contents of TJ30087

## Decisions
- 2026-10-11: Progressive reveal (Kyle's call): the main story comes first and everything else stays completely hidden until the story reaches it. The always-available "Something's wrong" button and a "Show everything" option are the safety valves. Briefings and debriefs, The File, knowledge unlocks, three detail levels, "Where" buttons and debrief quizzes were all approved. Kyle already owns the OBDLink CX, so the adapter is introduced in Act 1 as "The Signal", with a Codebook: raw labels decode with one tap, with no puzzles. Full design in docs/GAME_DESIGN.md.
- 2026-10-10: Story mode is a case board ("The As-Is File"). Eight cases in four acts plus a finale.
  - Six critical cases (Safe to Touch, The Belt, The Thirst, The Light That Won't Go Out, The Paper Trail, Baseline) plus the exam unlock the finale.
  - Narrator is Lars, a fictional retired Volvo tech; the UI says he is fictional.
  - Cases can be closed with a reason, which logs a known risk that stays flagged and is named in the finale.
  - Scenes never auto-play. They wait on Today and in the Story tab.
  - The Academy stays as its own tab; cases link straight into missions with `mission:<id>`.
  - After the finale, Health items with severity 48 or higher show as new cases.
- 2026-10-10: Kyle uses the Gemini app for the other half of the handoff. Gemini's returned work comes back through Claude to be applied and tested before going live (default; Kyle hasn't said otherwise).
- Single source in `src/`, built to two targets: the GitHub Pages app (primary; Bluetooth works in Bluefy) and the Claude artifact (secondary; Claude features such as the receipt reader, no Bluetooth).
- Offline knowledge base answers questions without using Claude. Claude is only used when the user asks for it.
- Clearing codes is allowed only with safeguards: a saved scan, checklist, engine-off check and a typed confirmation.
- Tire age rule follows Volvo's manual: 6 years.
- No aftermarket tunes in guidance (Clean Air Act tampering, Travis County testing). Polestar is the sanctioned option.
- VIN, plate and chassis number never go in the repo. They may only be typed into the app's local storage.

## Done
- 2026-10-11: Progressive reveal, The Signal case and Codebook, briefings and debriefs with quizzes, The File, knowledge unlocks, detail levels, "Where" jumps to the engine bay, the "Something's wrong" panel on Today, and docs/GAME_DESIGN.md.
- 2026-10-10: Story case board replaces the chapter reel (src/js/modules/story.js); core.js gained the `mission:` jump and `api.oilRate()`; tests/story.js added.
- 2026-10-10: Claude/Gemini handoff protocol (tools/handoff.py, tools/apply_handoff.py, GitHub Action build).
- 2026-10-10: modular app shell (Today plus five sections), offline Library, Cards, Exam, Story v1, Fuel and costs, Glovebox, DIY jobs, Troubleshoot, Bulletins (20 TSBs), Upgrades, Live link port with gauges, 0–60, drive-cycle coach, trips and scan history, achievements, seasonal events, six new articles, tests moved into the repo.
