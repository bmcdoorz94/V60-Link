# V60 Garage roadmap

Living tracker. Update it at the end of every work session: move finished items to Done, add new ideas, record answers to open questions.

## Status (2026-10-14)
The car is the menu (manual shell), Live link works on the real car in Bluefy, Glovebox documents intake shipped. Work now also happens in Claude Code on Kyle's Windows PC (docs/LOCAL_SETUP.md). `npm test` runs all 12 test files in Chromium and in iPhone WebKit (Bluefy's engine): 24 of 24 pass.

## Page cleanup (2026-11-27, Kyle: "Yes, all of it"; built the same day, see tidy.js)
Kyle: leftover pages "like the engine pictures"; one page per job. Canvas: https://claude.ai/artifact/QtDuvWWwRPnwHXBTm2VSCw (inventory board + after screens for Home, Maintain, Engine bay, Fix). 29 pages in the Index now, 19 after plus 2 on a tools shelf; no saved data deleted (merged pages bring their data, retired pages keep theirs in storage).
- Merge: Engine bay map (`engine`) into Know your car > 1 Engine bay (photo and pins; find-the-part game retired). The bay (`bay`) ratings onto each part page (heat map retired). Health (`health`) into Home (findings already there; 12-month list = Plan & shop > By need; Backup already in Settings). Service log (`records`: log, oil watch, calendar reminders) into Maintenance (its duplicate What's due goes). Diagnose (`diag`: code lookup, code log) into Fix (symptom list retired).
- Rename: My V60 (`my`) becomes "This car" at the top of Know your car.
- Shelf (Index > Tools only): Data lab, G1 study.
- Retire: fault simulator, Training library page (lessons stay in part pages), flashcards.
- Home tiles: Plan & shop replaces How-to jobs and Upgrades; Fuel & costs gets a tile.
- Later: Recommended becomes a mark on Plan & shop items.

## Plan & shop (2026-11-27, Kyle chose A + the by-need switch)
Kyle: everything recommended or optional, upgrades included, "sections of the vehicle in a list like if I were shopping", with what to do about each. Mock-ups: https://claude.ai/artifact/MPp5kSV6sckB5tmLhZpS52 (A parts counter, B car map, C by need). He chose A with C's whole-car list as a switch.
- Page `shop` (Maintain): the five sections of the car (the manual's views) with Needed / Recommended counts; a switch "By section · By need". A section lists its items in four groups: Needed (overdue or due on Volvo's schedule), Recommended (no record yet), Only if needed (after a check), Upgrades; on-track items fold away.
- Items are built from data the app already has, nothing new invented: Volvo's schedule (core ITEMS + the printed rows), shop prices (core COSTS), upgrades (V60_UPGRADES), how-to jobs (V60_DIY), the manual's Check chapters, troubleshooters. Catalog in `src/js/data/shop.js` says which section and part each belongs to.
- Item page (`shopi`): Volvo's row or the reason, then four ways: 1 Check it yourself, 2 Do it yourself (only with a sourced procedure; otherwise it says none is sourced), 3 Have a shop do it (what to ask for; price only from a source), 4 Ask Claude (POST https://<pc>/drives/ask, asked of the PC session; until it exists, the question is shown to copy).
- Plan (`plan`): items added as DIY or shop; priced-so-far total from the low/high estimates, count still to quote, a shop-quote text to copy or share, "Ask Claude to check this plan", a Log it button per job (service log). Saved in mod "shop" (synced).
- Something wrong now: belt squeal (new troubleshooter from Gates' noisy-belt guide), brake noise, vibration, warning light, anything else (Problem cases).
- Also: accessory belt, tensioner & idler added to the schedule (Volvo page 16, footnote D: 150,000 mi or 10 years).
- 2026-11-27, later: every item has hand-written check / DIY / shop steps for this exact car, from Volvo's 2016 US owner's manual (printed pages), Volvo technical journals and bulletins on NHTSA, RepairPal's 2016 V60 estimates (updated Sep 3, 2026) and Texas law; anything not confirmed for this car says so. The research also corrected the app elsewhere: oil (Volvo's documents differ: manual and hood label 5W-30 A5/B5, US bulletin TJ 34740 Castrol Edge Professional V 0W-20), tint (rear side windows exempt; safety inspections ended 2025), roof rack (Thule 186006 flush rails, $481–585), ceramic coating (Volvo's manual advises against long-life coatings), rear pads (US source is TJ 27500, VIDA needed), tire size (215/50 R17 unconfirmed for the Premier: read the placard), timing belt, alignment and brake pad prices. Open: front rotor size, battery registration, whether the water pump is on the timing belt, the support battery, Volvo alignment specs.
- Later: show Claude's weekly picks (reco) as a mark on matching items.

## Recorded drives in the Garage (2026-11-26, built)
Kyle said "Do it all" to mileage and service tracking from the iPhone app's recorded drives, fuel economy, trends and emissions-test readiness. The PC side (`bridge/drives.js`) publishes `drives/summary.json` over Tailscale; the Garage side (`src/js/modules/drives.js`) reads it.
- Miles since the last odometer reading are added to it as an **estimate** (speed integrated once a second), used for every due-by-miles figure and marked "(estimated)". Kyle's typed reading is never changed; typing a new one restarts the count.
- Maintain: a Recorded drives card (estimate, last drive, miles this week, estimated mpg, links to the PC's report pages, emissions readiness). Glovebox: readiness next to the inspection date. Health: a lit check-engine light, or more than one monitor not ready.
- Open: the estimate drifts from the real odometer over time (tire size, speedometer error); the app asks for a typed reading only when Kyle chooses. Trends live on the PC's pages, not in the Garage.

## Reference redesign (2026-11-26): a status board, not a game
Kyle (2026-11-26): "not so gamified ... more of an informative thing", keeping "all the general functions ... maintenance and upgrades and all that self-care stuff". He hadn't opened the app in weeks. Three directions were mocked on the Design canvas https://claude.ai/artifact/FgGtaUHs7zq77Zm97YkTMe; he chose **A · Status board**.

What the app becomes
- **Home** (tab `car`): the car (year, trim, odometer, miles since purchase, warning lights), **On the car now** (Health's urgent items: active codes, the check-engine light at the last scan, failed parts, open recalls, the tire light), **Coming due** (Volvo's schedule against the service log, worst first, "No record" where nothing is logged), **Everything** (eight tiles: Maintenance, Know your car, Fix & diagnose, How-to jobs, Upgrades, Bulletins & recalls, Glovebox, Library), then the red "Something's wrong" list.
- **Bar:** Home · Maintain · Fix · Glovebox · Link (side rail on desktop).
  - **Maintain** (new tab `maint`): every scheduled item with its interval, last record and status; Log a service (the Service log, `records`), oil checks, fuel & costs, Health.
  - **Fix** (`trouble` becomes a root): the troubleshooters, with Diagnose (codes), Bulletins and How-to jobs beside them.
  - **Glovebox** and **Link** stay as they are. Live link, Connect by itself and Claude live are untouched (the native iPhone shell loads the same pages).
- **Know your car** (new tab `know`): the side-view figure, the five views and every part page, as now, with nothing locked and no glow or "pick up here" markers. Part pages keep their Know / Check / Service / Diagnose / Upgrade sections and the articles, lessons, jobs and troubleshooters that open in place.
- **Settings** (sync, backup, display) move out of the Cases page to their own page, reachable from the home and the Index.

What goes (out of sight, not deleted)
- The path: the Next card, the progress bar, "set aside", the whole-path page, locked steps.
- The story: case board, Lars's scenes, the prologue, toasts; the Cases page leaves the Index.
- The certification track: the readiness chip in the header, readiness meters, quiz gating. The G1 study and quizzes stay reachable from the Library as an optional shelf.
- Achievements, Today's notes, the Unlocks page, glow and resume markers, pages hidden until reached.
- How: the old "Show everything" switch is turned on for good (`story.all`), which opens every page, article, fact and Codebook label; the manual stops marking chapters new or locked.

Saved data (nothing is lost)
- Every record stays where it is in the saved state and in sync: service log, oil checks, codes, scans, photos, receipts and documents, fuel, Glovebox tools and prices, upgrade decisions, bulletin marks, the odometer, part ratings, the sync token and the photo hide list (both in localStorage).
- The game's own state (`story`, `manual`, `track`, `guide`, path set-asides) is left in place untouched, apart from `story.all` set to true, so nothing has to be migrated and it could be shown again.

Build (2026-11-26, commit eaaecf5): done. Home, the five-button bar, Know your car, Maintain, Settings, everything open. Tests: `path.js`, `story.js` and `guide.js` retired; `nav.js`, `manual.js`, `track.js`, `tools.js` and `portrait.js` rewritten for the open app; `regression.js` screenshots the new pages. 34 of 34 pass in Chromium and iPhone WebKit.
- [ ] Kyle to look at it on his phone and say what to change.
- [ ] Next candidates: a Fix hub page (warning lights, codes, symptoms on one page instead of the troubleshooter list); trim the header on the home (sync chip, version chip and the pulse strip repeat what the status board says); a tire-light row on the home when the light is known to be on (it is not in the saved data today).

## Next
- [ ] **Claude live** (2026-11-26, Kyle: "as if you were side by side with me", plug and play, text only): built and tested against the simulated car (tests/claude.js, 27 checks). Kyle to do on the PC: bridge/SETUP.md with Claude Code there (Tailscale serve, pairing, desktop shortcut). Then the first session at the car with the CX: confirm 11-bit addressing (CEM 22402A on 726/72E), read the brake module's codes (760, 19 02 FF) for the tire light. Next hardware (research report "V60 electronic mechanic setup"): a vLinker FD+ or MC+ (BLE + MS-CAN) so Claude reaches the cluster, climate, doors and airbags; then an always-on box (AutoPi CAN-FD Pro) feeding the same bridge so the phone becomes optional.
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
- 2026-11-26 (Kyle): Claude live replies are text only (no read-aloud). Claude may read anything; every write to the car waits for his tap on the phone. He is fine with a powered box living in the car year-round. The test version is a switch on Link that stays off until paired, instead of a second copy of the app at another address.
- 2026-10-24 (Kyle): the ASE article is car-owner content only: no job listings, hiring companies or career advice. The repo is public.
- 2026-10-15 (Kyle: put all the V60 chats into the project): digests in docs/chats/, personal details left out (the repo is public), and anything the app lacked added with sources: the Oct 14 scan and drive recording on 3.3, photo readings on tires, brakes and the cowl.
- 2026-10-15 (Kyle: "one seed planted of info turns into a tree of knowledge but potentially more linear"): strict (later steps locked), in the order a beginner learns a car starting with this one, and the home cut to the car, one next step and a progress bar. Built as the path.
- 2026-10-15 (menus within menus; Kyle's answers): three levels only, the car → a view → a part, with every chapter's content inline on the part page; progression rebuilt around ASE's G1 "and more in depth": seven areas as levels with Owner and Technician rungs, readiness meters, quizzes that open hands-on first, a mock G1; XP, ranks, the skill tree and the V60 Master exam retired; screenshots from a working draft on the `g1-track` branch before merging.
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

## The path (2026-10-15)
- [x] One strict path through every chapter, the G1 study and the quizzes (data/path.js, 113 steps, 18 units); home cut to the Next card, the figure, the Index and the red list; bar to The car, Glovebox, Link; Cases into the Index; set aside for shop, purchase and dealer steps. tests/path.js.
- [ ] Port the guided walkthrough (at the car?, safety check, I'm stuck ladder) onto path steps; it has no button since the path because it followed the story's order.
- [ ] Today's notes (Lars's announcements, welcome back, protect your progress) no longer show on the home; decide whether one line belongs on the Next card.
- [ ] Health "Act" items (urgent service) left the home with the Now strip; the header pulse still shows them. Check with Kyle that this is enough.
- [ ] Run `npm test` on the PC (WebKit).

## Next (G1 study guide)
- [x] Merged to main 2026-10-15. Still to do: run `npm test` on the PC for the WebKit side.
- [x] Phase 2: a sourced study entry for every one of ASE's 173 G1 tasks (`src/js/data/g1entries.js`, 335 questions; written by research agents under the brief in docs/HANDOFF_STATE.md section 3, merged with `tools/gen/g1merge.py`). The mock G1 now draws all 55.
- [ ] Technician (rung 2) diagnosis questions: the study-entry questions count toward the Owner bank; the Technician bank still has questions only for Engine, Suspension, Brakes and Electrical.
- [ ] Thin areas for practice: Automatic transmission (14 entry questions) and HVAC (14) against Suspension (111). More scenario questions there, sourced the same way.
- [ ] Heating & A/C has no part of its own (it shares coolant and the cabin filter); a Cabin item for the climate system would give it hands-on steps.
- [ ] Retire the Today tab's remaining cards into the home (the Now strip already counts them).

## Done
- 2026-10-15 (Kyle: bring in the ASE chat; tool prices from real stores, updatable): **ASE article** (`a-ase`, Ownership): tiers, 2026 fees from ase.com, the experience rule, G1's seven areas mapped to this manual's items, and what a shop's ASE sign does and doesn't tell you. Unlocked with The Belt (next to Volvo-capable shops). **Tool inventory** in Glovebox: three tiers (Checking, First jobs, Wheels off; 23 tools, 8 new from the chat), each with store prices from fetched retailer pages in `src/js/data/toolprices.js` (date checked shown), a Your price field that replaces the store price (saved and synced as `glove.price`), and per-tier "still need · about $" totals. To refresh prices: re-check the store pages and edit `toolprices.js` (items and `checked`). tests/tools.js. Not brought in from that chat (Kyle chose the article only): the salary figures, the monthly OK/Flag walkaround sheet with a mileage log, the YouTube channels and Cars & Coffee list.
- 2026-10-15 (Kyle: uses the app only held upright; wants it to update itself): **upright phone pass.** tests/portrait.js measures every page and view at 390x844 (text under 11 px including inside drawings, taps under 32 px, sideways scrolling) and found 73 issues; now 0 on both engines. The Engine bay map is re-laid tall (420x560, about 85 % bigger on a phone) with a 44 px invisible tap circle under every part and two-line labels where needed; How it works is a top-to-bottom flow; every table stacks into labelled cards under 600 px (ui.js labels the cells); the whole-car drawing crops to the car with bigger numbers on phones; fold-outs, tick rows and small buttons are 44/36 px; small labels enlarged. **Auto-update:** opening the app (first seconds with no tap, or back after 5+ minutes) with a newer version on GitHub reloads by itself, once per version, never while connected to the adapter, in Drive mode, in a photo review or while typing; otherwise the bar. tests/update.js covers both.
- 2026-10-15 (Kyle: wants to see the version): a Version chip in the header shows when this copy was built, in the phone's time (the build stamp is now UTC). Tapping it checks GitHub now and says Up to date, New version ready, or Could not check; when the bar is up, tapping it refreshes.
- 2026-10-15 (Kyle: Bluefy never shows that an update is available): the "new version is ready" bar was driven only by the service worker, which Bluefy (WKWebView) does not run, and it checked every 30 minutes. The build now writes `version.json` next to index.html; the page compares it with its own version 2 s after opening, whenever it comes back to the front, and every 10 minutes, with no service worker needed. Refresh reloads through a one-off address (`?u=`) so the 10-minute browser cache on index.html cannot serve the old page, then tidies the address. The service worker path stays for the Safari home-screen app. build.yml commits version.json; apply_handoff refuses it as build output. tests/update.js.
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
