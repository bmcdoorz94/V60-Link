# V60 Garage roadmap

Living tracker. Update it at the end of every work session: move finished items to Done, add new ideas, record answers to open questions.

## Status (2026-10-10)
Story case board shipped. 24 tabs across Today, Learn, Car, Check and Data. Tests pass on phone, desktop and dark.

## Next
- [ ] Auto-read uploads with privacy redaction (on-device OCR in Bluefy, black out VIN/plate/name/address/phone/card before saving or syncing). Full spec in docs/HANDOFF_STATE.md, step 2.
- [ ] Close the feature-audit gaps listed in docs/HANDOFF_STATE.md, step 3 (86 of ~150 cards, missing DIY cards, interactive diagrams, Mode 06, resale tracker, and more).
- [ ] Ask Kyle for his build month (door-pillar label) and the other backlog questions below.
- [ ] First real-car test of Live link in Bluefy once the adapter arrives.
- [ ] Story polish after Kyle uses it: more cutscene art per case, and an "Evidence" photo attachment per case.

## Backlog
- [x] 2026-10-12: on-device reading for photo inspections in Bluefy: tire sidewall (DOT date, size, age against Volvo's 6-year rule) and the text on dash, fluid and engine-bay photos. Tested only on synthetic clean text. Real embossed rubber is much harder for OCR, so the first real sidewall photos are the real test. Seats and tread have no text to read.
- [x] 2026-10-11 (data loss): every app start wrote an empty copy of the state over the saved copy before the saved copy was read (the Story sweep calls save() during startup), and sync pushed that empty copy to GitHub. Odometer and Show everything vanished on the next load. Fixed: core.save() does nothing until the saved data has loaded. tests/odo.js reloads four times. If sync overwrote the GitHub copy, older versions are in the commit history of the private repo.
- [x] 2026-10-11 (Kyle): has small dents, no paint damage, no dent tools, so PDR is listed as a shop job. No brake DIY (no tools). Wants DIY cards for tint removal and car care: done (tint removal, ceramic, interior, polish and wax). Still open: a sourced front brake pad procedure (not wanted), a sourced tint film DIY application guide (none found).
- [x] 2026-10-11: odometer lost when the field wasn't left (saved only on "change"). Now saves while typing and when the page is hidden; tests/odo.js.
- [ ] Upgrades research (2026-10-11): added brakes and roof rack with sourced prices. No reliable source found yet, so not added: paint protection film and ceramic coating, headlight restoration cost, floor liners for the V60 (WeatherTech listings found were S60 only), lowering springs (Eibach V60 listings found were for non-US 4-cylinder fitments), Polestar price for 2016 cars (dealer pages cover new models). Search results were mostly SEO pages; add each only when a manufacturer, dealer parts or government page gives the number.
- [x] 2026-10-11 answers from Kyle: no receipts or paperwork found (may call the lot for a UVI); no warranty or service contract of any kind; engine bay photo "tomorrow"; build month not yet entered (use the new Scan the label button in Bulletins); wants wipers and the peeling window tint on the Upgrades list, plus more cosmetic and performance ideas with cost versus benefit; fuel log frequency: Kyle doesn't know what's useful (suggest logging every fill-up, explained in plain words).
- [ ] Live link still drops after connecting (new adapter; OBDLink app was closed). Need the "Adapter conversation" log.
- [ ] Tire rotation and engine air filter DIY cards: no sourced procedure found for this car (iFixit's V60 air filter guide is the five-cylinder). Add only when a source turns up.
- [ ] Kyle was unsure whether the Home Screen icon is Safari or Bluefy. The icon opens in Safari; Bluetooth only works in Bluefy.
- [x] Kyle: sync set up in Bluefy (2026-10-11).
- [ ] Build month from the door-pillar label (asked 2026-10-10; drives bulletin applicability).
- [ ] Engine bay photo to calibrate the bay map to the real car.
- [x] Monthly reminder for oil level and tire pressure (iPhone Reminders, from 2026-11-01).
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
- 2026-10-11: Guided mode (Kyle's answers): full-screen walkthrough (Claude's pick), levels change without asking but are announced with an undo, guidance fades per area (Claude's pick), no read-aloud needed in the walkthrough.
- 2026-10-11 (scanner, Kyle's answers): the shop's own name, address and phone stay visible on receipts (outlined, one tap hides them); always confirm before saving; Glovebox VIN and plate keep syncing to the private repo (no preference); on-device reading only, no API-key AI read (no preference, so the simpler option).
- 2026-10-11: Kyle uses Bluefy for everything (not the Home Screen app) so he never switches browsers. Sync to `v60-garage-data` is on; the token expires Dec 10 2026. A header Sync chip opens the setup directly.
- 2026-10-11: The Academy and the Story looked like two competing stories. The Academy is now "Training": hidden from the menu, opened from a case step's Lesson button, with a Back to the case button and a Training library link in Story.
- 2026-10-11: Progressive reveal (Kyle's call): the main story comes first and everything else stays completely hidden until the story reaches it. The always-available "Something's wrong" button and a "Show everything" option are the safety valves. Briefings and debriefs, The File, knowledge unlocks, three detail levels, "Where" buttons and debrief quizzes were all approved. Kyle already owns the OBDLink CX, so the adapter is introduced in Act 1 as "The Signal", with a Codebook: raw labels decode with one tap, with no puzzles. Full design in docs/GAME_DESIGN.md.
- 2026-10-10: Story mode is a case board ("The As-Is File"). Eight cases in four acts plus a finale.
  - Six critical cases (Safe to Touch, The Belt, The Thirst, The Light That Won't Go Out, The Paper Trail, Baseline) plus the exam unlock the finale.
  - Narrator is Lars, a fictional retired Volvo tech; the UI says he is fictional.
  - Cases can be closed with a reason, which logs a known risk that stays flagged and is named in the finale.
  - Scenes never auto-play. They wait on Today and in the Story tab.
  - (Replaced 2026-10-11) Cases link straight into missions with `mission:<id>`.
  - After the finale, Health items with severity 48 or higher show as new cases.
- 2026-10-10: Kyle uses the Gemini app for the other half of the handoff. Gemini's returned work comes back through Claude to be applied and tested before going live (default; Kyle hasn't said otherwise).
- Single source in `src/`, built to two targets: the GitHub Pages app (primary; Bluetooth works in Bluefy) and the Claude artifact (secondary; Claude features such as the receipt reader, no Bluetooth).
- Offline knowledge base answers questions without using Claude. Claude is only used when the user asks for it.
- Clearing codes is allowed only with safeguards: a saved scan, checklist, engine-off check and a typed confirmation.
- Tire age rule follows Volvo's manual: 6 years.
- No aftermarket tunes in guidance (Clean Air Act tampering, Travis County testing). Polestar is the sanctioned option.
- VIN, plate and chassis number never go in the repo. They may only be typed into the app's local storage.

## Done
- 2026-10-11: On-device photo reading with redaction (scan.js) and guided mode (guide.js), each with its own test.
- 2026-10-11: Academy merged into Story as Training (Lesson buttons, Back to the case, Training library link). Trailer v3: a canvas cinematic with synthesized sound and a sport-wagon silhouette.
- 2026-10-11: Sync through a private GitHub repo (sync.js; tests/sync.js mocks the GitHub API), skill tree with perks (skills.js), Timeline, proof photos, garage map, car pulse strip, swipeable Today, Listen buttons, Drive mode, cold-open teaser, backup nudge, a backup export that works outside Claude (share sheet or download), the teaser trailer rewrite, and a monthly iPhone reminder.
- 2026-10-11: Trailer (Claude artifact "V60 Garage Trailer") and presentation deck ("V60 Garage", Slides). Backup and restore reachable from Story, then Options, at any stage. The app asks the browser for persistent storage.
- 2026-10-11: Progressive reveal, The Signal case and Codebook, briefings and debriefs with quizzes, The File, knowledge unlocks, detail levels, "Where" jumps to the engine bay, the "Something's wrong" panel on Today, and docs/GAME_DESIGN.md.
- 2026-10-10: Story case board replaces the chapter reel (src/js/modules/story.js); core.js gained the `mission:` jump and `api.oilRate()`; tests/story.js added.
- 2026-10-10: Claude/Gemini handoff protocol (tools/handoff.py, tools/apply_handoff.py, GitHub Action build).
- 2026-10-10: modular app shell (Today plus five sections), offline Library, Cards, Exam, Story v1, Fuel and costs, Glovebox, DIY jobs, Troubleshoot, Bulletins (20 TSBs), Upgrades, Live link port with gauges, 0–60, drive-cycle coach, trips and scan history, achievements, seasonal events, six new articles, tests moved into the repo.
