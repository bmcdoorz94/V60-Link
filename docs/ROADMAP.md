# V60 Garage roadmap

Living tracker. Update it at the end of every work session: move finished items to Done, add new ideas, record answers to open questions.

## Status (2026-10-14)
The car is the menu (manual shell), Live link works on the real car in Bluefy, Glovebox documents intake shipped. Work now also happens in Claude Code on Kyle's Windows PC (docs/LOCAL_SETUP.md). `npm test` runs all 12 test files in Chromium and in iPhone WebKit (Bluefy's engine): 24 of 24 pass.

## Next
- [ ] Auto-read uploads with privacy redaction (on-device OCR in Bluefy, black out VIN/plate/name/address/phone/card before saving or syncing). Full spec in docs/HANDOFF_STATE.md, step 2.
- [ ] Close the feature-audit gaps listed in docs/HANDOFF_STATE.md, step 3 (86 of ~150 cards, missing DIY cards, interactive diagrams, Mode 06, resale tracker, and more).
- [ ] Ask Kyle for his build month (door-pillar label) and the other backlog questions below.
- [x] 2026-10-14: Live link connected and held on the real car in Bluefy (after the FFF0 service fix). Remaining: confirm a saved report.
- [ ] Story polish after Kyle uses it: more cutscene art per case, and an "Evidence" photo attachment per case.

## Backlog
- [x] 2026-10-14: Documents (docs.js): drop photos or PDFs into the Glovebox; read on the phone (pdf.js text layer, OCR for scanned pages), sorted (receipt, inspection, registration, insurance, warranty, title, recall, history, manual), fields pulled, reviewed, then filed. Kyle uses Bluefy, so no AI reading there; tests/docs.js. Next: a photo of a multi-page document as several photos at once, and the receipt hand-off could file without the second card.
- [x] 2026-10-14: Bluefy cannot download or print and its share sheet drops files: every file now goes through window.V60_FILE.save (content as text). Kyle to confirm on the phone: backup, calendar, Live link report/CSV/log, The File as text.
- [x] 2026-10-12: on-device reading for photo inspections in Bluefy: tire sidewall (DOT date, size, age against Volvo's 6-year rule) and the text on dash, fluid and engine-bay photos. Tested only on synthetic clean text. Real embossed rubber is much harder for OCR, so the first real sidewall photos are the real test. Seats and tread have no text to read.
- [x] 2026-10-11 (data loss): every app start wrote an empty copy of the state over the saved copy before the saved copy was read (the Story sweep calls save() during startup), and sync pushed that empty copy to GitHub. Odometer and Show everything vanished on the next load. Fixed: core.save() does nothing until the saved data has loaded. tests/odo.js reloads four times. If sync overwrote the GitHub copy, older versions are in the commit history of the private repo.
- [x] 2026-10-11 (Kyle): has small dents, no paint damage, no dent tools, so PDR is listed as a shop job. No brake DIY (no tools). Wants DIY cards for tint removal and car care: done (tint removal, ceramic, interior, polish and wax). Still open: a sourced front brake pad procedure (not wanted), a sourced tint film DIY application guide (none found).
- [x] 2026-10-11: odometer lost when the field wasn't left (saved only on "change"). Now saves while typing and when the page is hidden; tests/odo.js.
- [ ] Upgrades research (2026-10-11): added brakes and roof rack with sourced prices. No reliable source found yet, so not added: paint protection film and ceramic coating, headlight restoration cost, floor liners for the V60 (WeatherTech listings found were S60 only), lowering springs (Eibach V60 listings found were for non-US 4-cylinder fitments), Polestar price for 2016 cars (dealer pages cover new models). Search results were mostly SEO pages; add each only when a manufacturer, dealer parts or government page gives the number.
- [x] 2026-10-11 answers from Kyle: no receipts or paperwork found (may call the lot for a UVI); no warranty or service contract of any kind; engine bay photo "tomorrow"; build month not yet entered (use the new Scan the label button in Bulletins); wants wipers and the peeling window tint on the Upgrades list, plus more cosmetic and performance ideas with cost versus benefit; fuel log frequency: Kyle doesn't know what's useful (suggest logging every fill-up, explained in plain words).
- [x] Live link drops: root cause was the wrong BLE service (FEF5 firmware service matched because Bluefy returns upper-case UUIDs). Fixed 2026-10-13; worked on the car 2026-10-14.
- [ ] Tire rotation and engine air filter DIY cards: no sourced procedure found for this car (iFixit's V60 air filter guide is the five-cylinder). Add only when a source turns up.
- [ ] Kyle was unsure whether the Home Screen icon is Safari or Bluefy. The icon opens in Safari; Bluetooth only works in Bluefy.
- [x] Kyle: sync set up in Bluefy (2026-10-11).
- [ ] Build month from the door-pillar label (asked 2026-10-10; drives bulletin applicability).
- [ ] Engine bay photo to calibrate the bay map to the real car (photos sent in chat 2026-10-12; not yet uploaded to the app).
- [x] Monthly reminder for oil level and tire pressure (iPhone Reminders, from 2026-11-01).
- [ ] Import the recent oil change receipt and any others.
- [x] Live link on the real car: it connected and then dropped at once (2026-10-11, new OBDLink CX); fixed 2026-10-13, confirmed 2026-10-14. The retry now uses a warm start (ATWS) and the log names the last command before each drop. Need Kyle's Adapter conversation log.
- [x] No service contract or warranty of any kind (Kyle, 2026-10-11).
- [x] Fuel log frequency: Kyle didn't know what's useful; the app suggests every fill-up.
- [ ] Upgrade interests: CarPlay, Polestar, tires, dash cam.
- [x] Today screen no longer repeats the odometer from the top bar (2026-10-12).
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
- 2026-10-12 (redesign, Kyle's answers): the car is the menu, organised by area; progression-based unlocks stay and work both ways (chapter chain and story cases); each area opens a view "as if looking inside" (hood open, inside the cabin); glow on first open only, with a quieter "pick up here" marker; light and dark; Live link and the Data lab keep an instrument look; "make it my vehicle as much as possible" is done with the owner's own photos as the figures (no drawing of Volvo's actual design), points placed automatically from the drawing and adjustable by hand; density between dense and roomy; item count per view as mocked (about 4 to 9). Mockup approved before the build.
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

## Redesign backlog (after 2026-10-12)
- [ ] Kyle's photos for the views. He has the engine bay (from the bumper) and a front-wheel shot with the caliper; still needed: straight side-on of the whole car (home), from the driver's seat (cabin), the rear (walk-around). He uploads them in the app, not in chat (the VIN is on the door label and the hood sticker).
- [ ] Retire the Today tab once its remaining cards (welcome back, protect your progress, the garage map) have a home elsewhere. The home's Now strip already counts the notes and links there.
- [ ] Wheel and underside figures: better drawings, or photos.
- [ ] Desktop: consider the figure and the sheet side by side above 1000 px.

## Done
- 2026-10-15 (Kyle, first real health check saved: P0171 stored, pending and permanent, light on, all 8 monitors ready; "the dashboard didn't show numbers or respond to Drive mode"): the Dashboard's gauges only filled while Live data's Start recording ran, further down the page, and Drive mode was locked behind the Data reader skill with its message easy to miss. The Dashboard now has its own Start gauges / Stop gauges button (same recording as Live data, labels kept in step); Drive mode is open to everyone, starts the gauges itself when connected, stops them on exit, and says "Not connected" on the big screen otherwise. The Data reader skill no longer carries a perk. tests/ble.js: the mocked adapter now answers live PIDs with Kyle's idle values, and the dials and Drive mode are checked against them. Still to confirm on the car.
- 2026-10-14 (Kyle: couldn't find the engine bay map; "make it navigate where it makes more sense"; wants the map to stay a drawing; wants part places verified): both bay drawings now follow Volvo's own drawing of the 4-cylinder engine bay (2016 V60 US manual, Engine compartment – overview, items 1–8: oil filler cap, coolant tank, radiator, brake fluid, battery, relay/fuse box, washer fluid, air cleaner; `V60_SOURCES.bayov`). Brake fluid, battery and fuse box moved from the 10/13 layout; the engine bay map marks those parts as from Volvo's manual, and only the coils and timing belt keep the "?" (under covers, not in Volvo's drawing). Hood release per Volvo: under the right front edge of the hood (the car's right). The start/stop fuse box is in Volvo's "cold zone", spot not shown, so the old "near the cowl" text is gone. The "Find the key landmarks" mission now gives these places and links to the map. Navigation: an Engine bay map button under the hood drawing; The car's collapsed "Back matter" is now open groups (Your car, Fix & maintain, Learn, Data, Progress); See also strips on every view and under the titles of Glovebox, Link and Cases; "← Back to …" now works from any page, two or more steps deep. How it works (`learn`) and Unlocks had no way in: they open with the Act 1 and Act 2 rewards. tests/nav.js covers all of it.
- 2026-10-14 (Kyle: "the hood diagram is upside down, it looks like I'm inside the vehicle"): both engine bay drawings now show the bay as seen standing at the front bumper with the hood up. Windshield at the top, hood catch, grille and bumper at the bottom, passenger side left, driver side right, with labels for each edge. The manual's Fig. 1-1 is redrawn as real parts (engine cover with coils and oil cap, timing belt cover, coolant tank, fuse box, battery, brake fluid, air box with intake, radiator, latch, headlights) around the places taken from Kyle's photo; the washer point moved up slightly (330,174). The Engine bay map in core.js was drawn from the driver's seat (bumper at the top, driver on the left); it is turned around and its parts moved to agree with the manual figure (air box now driver side, coolant tank passenger front). `tests/figshot.js` screenshots every figure for checking drawings.
- 2026-10-14: Tests run on the iPhone engine. `tests/run.js` (`npm test`) builds and runs every test in Chromium and in WebKit dressed as an iPhone 13, in parallel (about 80 s). regression.js and features.js now fail with exit code 1 instead of only printing. Found while doing it: the on-device reader can add or drop a character in a VIN (1HGBH… read as 1THGBH…), which slipped past the 17-character VIN rule; scan.js now treats 16 to 18 characters as a VIN (tests/scan.js covers both). Windows fixes: `.gitattributes` pins LF, the Python tools write UTF-8 with LF, and files.json uses forward slashes on every OS.
- 2026-10-13: Readings from Kyle's 18 photos (2026-10-12) added as "Your car" rows, marked as from his photos: door label date 08/15, market code 31, colour code 717-46, GVWR/GAWR; placard 215/50R17 at 38 psi, no spare; Sentury UHP 215/50ZR17 95W extra load, DOT week 43 of 2023; coolant cap 145 kPa; A/C R-134a 800 g PAG with tracer dye; emission label T2B5 / ULEV 125, engine family GVVXV02.0U3T; engine cover B4204T11; leather seats. The bay schematic now matches a photo taken from the bumper (driver side on the right); old bay-map pins are mirrored when imported.
- 2026-10-13: The owner's manual folded into the thin items: three new articles (electric parking brake; starting and the three ignition modes; steering, steering force and Volvo's economical-driving list), 14 new facts, and Check-it chapters for 2.4, 3.2 and 4.3 that walk the procedure from Volvo's own pages. Glossary terms now unlock with an item's chapters, and an article an open chapter points at is in the Library at once.
- 2026-10-13: Cases page in the manual's dress (act headings, → § labels to the items a case points at, stamps, the Next box); the home's Now strip counts today's notes; item glossaries limited to the eight facts closest to the part.
- 2026-10-12: The manual (manual.js, data/manual.js, manual.css, theme.css): home with the side-view figure, five views, 28 items, chapters with evidence-based steps, unlock chain plus case openers, glow and resume markers, the gate wrapper, the crumb bar, photos as figures with draggable points, light and dark. tests/manual.js. The old tabs stay reachable through chapters and the back matter.
- 2026-10-11: On-device photo reading with redaction (scan.js) and guided mode (guide.js), each with its own test.
- 2026-10-11: Academy merged into Story as Training (Lesson buttons, Back to the case, Training library link). Trailer v3: a canvas cinematic with synthesized sound and a sport-wagon silhouette.
- 2026-10-11: Sync through a private GitHub repo (sync.js; tests/sync.js mocks the GitHub API), skill tree with perks (skills.js), Timeline, proof photos, garage map, car pulse strip, swipeable Today, Listen buttons, Drive mode, cold-open teaser, backup nudge, a backup export that works outside Claude (share sheet or download), the teaser trailer rewrite, and a monthly iPhone reminder.
- 2026-10-11: Trailer (Claude artifact "V60 Garage Trailer") and presentation deck ("V60 Garage", Slides). Backup and restore reachable from Story, then Options, at any stage. The app asks the browser for persistent storage.
- 2026-10-11: Progressive reveal, The Signal case and Codebook, briefings and debriefs with quizzes, The File, knowledge unlocks, detail levels, "Where" jumps to the engine bay, the "Something's wrong" panel on Today, and docs/GAME_DESIGN.md.
- 2026-10-10: Story case board replaces the chapter reel (src/js/modules/story.js); core.js gained the `mission:` jump and `api.oilRate()`; tests/story.js added.
- 2026-10-10: Claude/Gemini handoff protocol (tools/handoff.py, tools/apply_handoff.py, GitHub Action build).
- 2026-10-10: modular app shell (Today plus five sections), offline Library, Cards, Exam, Story v1, Fuel and costs, Glovebox, DIY jobs, Troubleshoot, Bulletins (20 TSBs), Upgrades, Live link port with gauges, 0–60, drive-cycle coach, trips and scan history, achievements, seasonal events, six new articles, tests moved into the repo.

## Photo batch upload and duplicates (Oct 2026)
- Done: several photos at once with one tagging screen; "Let the reader decide" uses the on-device text read (door/hood labels, tire sidewalls); everything else lands under "Something else" unless tagged.
- Done: duplicate guard. Each saved photo stores a SHA-256 of the original file and of the stored copy, plus a 64-bit look-alike print. An identical photo is never added again (single pick, batch, or a second device through sync). A look-alike is flagged and the owner chooses. Photos saved before this change have no fingerprint, so they cannot be matched.
- Not built: recognising what a photo shows from its picture alone (engine bay vs seats). It needs a downloaded image model; accuracy on this car is untested. Open question for Kyle.
