## 1. Current Active Objective
**G1 study guide, phase 2 (2026-10-15, on `main`).** Kyle approves the track only if it works as a real study guide he could pass with. `src/js/data/g1tasks.js` lists ASE's 173 G1 tasks (A22 B7 C22 D59 E34 F22 G7); `src/js/data/g1entries.js` holds a sourced study entry per task (body, how it applies to the V60, sources, ASE-style questions). Entries are written by research subagents from the brief in the session scratchpad (copied into this file's section 3) and merged with `python3 tools/gen/g1merge.py <json>`, which validates ids, https sources, banned domains and the four options. Done: all of Suspension & Steering (D1–D59) and Brakes (E1–E34), 93 entries, 179 questions. In progress: Engine (A1–A22), Electrical F1–F11. Still to do: F12–F22, B1–B7, C1–C22, G1–G7.

**Flatten the menus and rebuild progression around ASE's G1 (2026-10-15, merged to `main`).** The car → a view → a part, nothing deeper: a part page holds all of its chapters as sections, and every step opens in place with the article, the lesson, the DIY job or the troubleshooter inside it (`src/js/modules/manual.js`, `renderItem`; the chapter page is gone, `ch:` jumps land on the part page). Inner pages get a one-row header; the home keeps the dashboard, the figure, one Next card, the Now strip, the G1 readiness strip, an Index button and the red list; every other page lives on the Index page. Progression is the certification track (`src/js/modules/track.js`, data in `src/js/data/track.js` and `quiz.js`): seven G1 areas as levels with Owner and Technician rungs, readiness meters (40 % hands-on, 20 % cards, 40 % quiz), ASE-style quizzes that open hands-on first, and a timed mock G1 with a score report. XP, ranks, the skill tree (`skills.js`) and the V60 Master exam (`exam.js`) are deleted; `window.V60_PERK` now lives in track.js; the story's finale needs `V60_TRACK.passedG1()`. Tests: `tests/track.js` new; `manual.js`, `nav.js`, `story.js` updated. All suites pass in Chromium here; WebKit not run (needs Kyle's PC).

**The redesign: the car is the menu.** Shipped 2026-10-12 as the new shell (see docs/GAME_DESIGN.md, "The manual"). Home = side view with five points → views → items → chapters. `src/js/data/manual.js` holds the spine; `src/js/modules/manual.js` the engine and UI; `src/css/manual.css` and `theme.css` the look. `tests/manual.js` covers it. Next: Kyle's photos as the figures (he will take them), the Cases page in the new dress, fold Today's cards into the home. Everything below this paragraph predates the redesign and still applies.

**First real health check saved (Kyle, 2026-10-15):** P0171 stored, pending and permanent, check-engine light on, all 8 readiness monitors ready; freeze frame warm at idle (916 rpm, coolant 83 °C) with short-term trim +48.4 % and long-term +14.8 %. The Dashboard and Drive mode did not show numbers: fixed the same day (own Start gauges button; Drive mode no longer a perk and starts the gauges itself). Kyle to confirm on the car.

**Live link works on the real car (Kyle, 2026-10-14):** it connected in Bluefy and held for his drive to work after the FFF0 service fix (2026-10-13). The log from that drive was lost to a page reload, so the log is now kept in localStorage `v60-link-log` and shown under the Connect buttons. Still to confirm: whether it stayed connected the whole drive, and whether Kyle saved a report (which closes The Signal). Earlier history follows.

Kyle's OBDLink CX connected in the official OBDLink app. In V60 Garage (Bluefy, Live link) it connected and then dropped instantly.

Commit `16f762e` (2026-10-11) shipped a fix:
- `BleTransport` in `src/link-legacy.html` keeps the device, and a drop during connecting no longer ends the attempt.
- `connect()` retries once through `transport.reopen()`, without reopening the picker. The status shows "Link dropped. Reconnecting...".
- Every step is logged to the "Adapter log" under the Connect buttons on Live link: picked, GATT connected, notifications on, dropped, retrying.
- Errors are mapped to plain advice:
  - pairing or encryption: re-plug, connect within 5 minutes, PIN 123456
  - NetworkError: close the OBDLink app, which can hold the adapter
  - NotAllowedError: turn on Bluetooth for Bluefy in iPhone Settings
- `tests/ble.js` mocks Web Bluetooth. A first link that drops gets retried and connects; a link that always drops shows the advice.

Most likely real cause: the OBDLink app was still holding the adapter. It only talks to one app at a time.

**Found 2026-10-13, from Kyle's adapter log.** Bluefy lists the CX's services with upper-case UUIDs and includes its FEF5 firmware-update (SUOTA) service, whose characteristics notify and write but never answer. The old `attach()` preferred "fff0" with a case-sensitive test, so it fell through to the first service with notify+write: FEF5 (`5F78DF94…`). ATZ timed out, later writes failed with an empty error, and `close()` logged a "drop" that was really our own disconnect. Fix: UUIDs normalised to lower case and short form, a list of known serial services (FFF0/FFF1/FFF2 first), housekeeping services never picked, every service and characteristic logged. `tests/ble.js` now mocks the decoy service with upper-case UUIDs. Still to confirm on the real car.

Update 2026-10-12: Kyle reports it still drops with the OBDLink app closed and a new adapter. Added (commit after `a9c4b12`): the retry now sends `ATWS` (warm start) instead of `ATZ`, in case the full reset drops the BLE link; a pending command is failed the moment the link drops (no 6 s wait); the log names the last command sent before each drop. `tests/ble.js` covers a drop after `ATZ`. Still unconfirmed on the real car. The next step is unchanged: get the Adapter conversation log.

**State of the app** (all on `main`, all test suites passing):
- **Story ("The As-Is File") is the only place to play.** Training (the old Academy) opens from a case step's Lesson button.
- **Guided mode** (`guide.js`): a full-screen walkthrough at first, then guidance fades per area. Rules are in GAME_DESIGN.md under "Guided mode".
- **Scanner** (`scan.js`): every photo is read on the device (Tesseract.js 5.1.1). Personal details are blacked out before storage or sync, and receipts, door labels and papers are decoded. On receipts, the shop's own details stay visible.
- **Sync**: works through the private repo `bmcdoorz94/v60-garage-data`. A Sync chip in the header opens the setup. The token expires Dec 10 2026, and an iPhone reminder is set for Dec 3.
- **Kyle uses Bluefy only.** Claude-powered features (`api.sample()`) work only inside the Claude artifact, not in Bluefy.
- **Trailer**: a 50-second 3D teaser built with Three.js 0.160.0 from jsDelivr, using bloom and a live 120 bpm Web Audio score. It's a Claude artifact (`LAGywEDVRqFdoNvh4vDcp7`) and **not in this repo**. Only Claude can republish it.

**Update 2026-10-11 evening.** Kyle reports the link still drops right after connecting (new adapter, OBDLink app closed). Added: Scan the label button (Bulletins), DIY cards for the cabin air filter and front turn signal bulb (sources named on the cards), wipers and window tint on Upgrades, clearer Story and Training wording. A block of text Kyle pasted that claimed Gemini had done auto-start trips, the door-pillar step and a cabin filter card was not in the repo and was not applied.

**Documents intake (2026-10-14):** `src/js/modules/docs.js`, tab `docs` (hidden, revealed with glove by The Belt; manual step `docs: 1` in Glovebox Service). pdf.js 3.11.174 legacy from jsDelivr (cached by the service worker with Tesseract). `V60_SCAN` gained `ocrText(canvas)`, `scrub(text)`, `classify`, `parse`, `titles`, and kinds recall/warranty/title/history/manual. Receipts hand off to `window.V60_GLOVE.pendReceipt`. Kyle reports Bluefy: downloads and print do nothing, share sheet passes only text: `window.V60_FILE.save` (ui.js) is the one way out for files.

## 2. Immediate Next Steps
1. Finish the G1 entries (see section 1), merging each batch, running `tests/track.js`, and pushing. Then run `npm test` on the PC (WebKit).
2. Grow the quiz bank where it is thin (Automatic transmission 3, Manual drivetrain 2, HVAC 2; the mock draws 42 of 55) and add Technician (rung 2) questions for Automatic transmission, Manual drivetrain and HVAC. Every question needs a source.
3. Consider a climate-system part in the Cabin view so Heating & A/C has hands-on steps of its own.
0. **Redesign follow-ups (2026-10-13).** Done so far: the manual shell, the Cases page in the manual's dress, the home's Now strip counting today's notes, item glossaries trimmed to eight. Next, in order:
   1. When Kyle sends the five photos (side-on, engine bay, driver's seat, front wheel, rear), check them in the app as the figures ("Your photo" in each view) and that the scanner blacked out the VIN on anything with a label in frame.
   2. Retire the Today tab: move "welcome back", "protect your progress" and the garage map somewhere sensible (the Now strip or Cases), then drop the panel. `today.js` still renders module cards; the home only counts them.
   3. Better wheel and underside figures (`FIG` in `src/js/modules/manual.js`), or rely on photos.
   4. Desktop: figure and sheet side by side above 1000 px.

1. **Confirm the connection fix with Kyle at the car.**
   1. Close the OBDLink app fully, re-plug the adapter, start the engine, then reload the app in Bluefy.
   2. Open Live link, then Connect adapter, then pick OBDLink CX.
   3. If it still drops, ask Kyle to open "Adapter conversation", tap "Copy log", and paste the log. The log shows where it breaks:
      - no "notifications on": pairing failed
      - drops right after "notifications on": iOS pairing, or another app holding the adapter
      - drops after `ATZ`: the reset command
   4. If the drop follows `ATZ`, try `ATWS` (warm start) in `initElm()` in `src/link-legacy.html`, then run `python3 tools/gen/mklive.py`. This is untested; there is no source saying ATZ drops BLE on the CX.
2. **First real-car test, once connected.** Check that:
   - the health check runs and saves to the Garage; this is the real scan that The Signal and Baseline need
   - Decode chips appear for every supported PID; five decodes close The Signal
   - the live recording rate and the 0–60 sample rate are usable
   - clearing codes is refused while the engine runs
3. **Record what fixed pairing.** Ask Kyle what made the OBDLink app finally connect, then add it to the "Before you connect" list in `src/link-legacy.html`.
4. **Feature audit gaps** (checked 2026-10-11).

   Partly built:
   - Flashcards: 86 sourced facts; the plan was about 150. Add a daily 2-minute drill.
   - DIY cards missing: cabin filter, engine air filter, PY24W turn-signal bulb, tire rotation.
   - Systems articles have no interactive diagrams.
   - Glossary terms are not linked to the engine bay map.
   - No Volvo-specific code list. Add only codes with a public source.
   - Trips don't auto-start on connect.
   - Total cost of ownership has no forecast.
   - Owner complaints are a static article only; the NHTSA complaints API is not used.
   - The Austin shops article has no quote script.

   Not built: Mode 06 explained, resale tracker, parts encyclopedia (sourced only). "Explain it to a friend" and the mentor chat need an AI in Bluefy.
5. **Scanner follow-ups:**
   - Add a Paper Trail step, "Scan the door-pillar label", that closes the build-month step.
   - Test on a real iPhone: first-use download time and reading speed.
6. **Guided mode:** tune the thresholds (4 points for assisted, 10 for on your own) after Kyle uses it.
7. **Kyle's feedback pending** on the 3D trailer (sound mix, phone smoothness, drop lines) and on guided mode.
8. **After any change:** build, run the tests (`npm test` where `npm install` is done: both Chromium and iPhone WebKit), check `tests/shots/` (the `-iphone.png` shots first), and update ROADMAP.md, GAME_DESIGN.md and this file. Push small commits so the `handoff` branch stays current.

## 3. Pending Logic & Blockers
- **G1 entry rules (the research brief).** Every body line traces to a page fetched in that session; never from memory. Allowed: Volvo documents (2016 V60 US owner's manual PDF, maintenance schedule, support pages, NHTSA-hosted bulletins), US government (nhtsa, ecfr, epa, osha), industry bodies (USTMA, TIA, SAE), parts and tool makers' own technical pages. Banned: forums, Reddit, YouTube, Wikipedia, study-guide sites, repair-shop marketing (list in `g1merge.py`). Volvo wins over generic sources for this car. Unsourceable task: short body ending "No sourced procedure found yet." Output: JSON array of `{id, body[3-6 lines], car|null, src[[title,url]], qs[{q, o[4], a, why, src}]}`, two ASE-style questions per task. Run at most three research agents at once: eight at once used up a session.
- **OBDLink CX facts.** Source: OBDLink's "OBDLink CX adapter notes" support article.
  - BLE UART service FFF0: notify on FFF1, write on FFF2.
  - Bonding only works in the first 5 minutes after power-on. PIN 123456.
  - Always encrypted.
  - No queued writes; chunk writes to the MTU (Live link uses 20-byte chunks).
  - The CX has three LEDs: PWR, OBD, BLE.
- **Connection flow.** `connect()` runs `open()`, then `initElm()`.
  - `initElm()` sends `ATZ ATE0 ATL0 ATS1 ATH1 ATCAF1 ATAT1 ATSP0`, then `0100` with a 12 s timeout, then `ATDPN`, then reads the supported PIDs.
  - `transport.connecting` suppresses `onclose` while connecting, and `transport.dropped` records a drop.
  - It retries once. A second drop shows the NetworkError advice.
- **Bluefy has no AI.** In Bluefy, reading uploads uses on-device OCR. An own-API-key option was declined for now ("don't care either way").
- **Redaction must happen before storage.** Photos go to IndexedDB, then to the sync repo. `scan.js` redacts first. Never store the original.
- **Gate logic** (`story.js`):
  - Act 1 is open from the start. Later acts need the previous act closed. Within an act, a case opens once the previous one has started.
  - `revealedSet()` is the union of: Today, Story, the `reveals` of every available case, `ACT_REWARD`, and everything once the finale is reached or "Show everything" is on.
  - Jumps to hidden tabs still work.
- **Real scans versus simulated scans.** The Signal and Baseline need a real scan. `scans(api, true)` ignores `lastScan` when it matches a simulated scan's date.
- **Unconfirmed data** (keep it labeled unconfirmed in the UI):
  - Polestar availability and price in 2026
  - 4G modem (SMB 00-035)
  - live tire prices
  - NHTSA position on LED bulbs
  - petrol injection pressure and turbo type
  - which TG-81SC ratio set applies
  - contents of TJ30087
  - Kyle's build month
  - Kyle's oil consumption
- **Workflow.** Gemini's returned work comes back through Claude, which applies it with `tools/apply_handoff.py`, then builds, tests and commits. Gemini's last return (the first `scan.js`) was rewritten for these problems:
  - per-word matching
  - preview outlines saved into the photo
  - a broken script URL
  - not wired to anything
- **Size constraint.** `src/js/core.js` is about 240 KB. Put new features in `src/js/modules/`, and return core.js changes as find-and-replace edits under `## Edits to apply`.
- **Generated file.** Never edit `src/js/modules/live.js` directly. Edit `src/link-legacy.html`, `tools/gen/live_extra.js`, `tools/gen/cipher.py` or `tools/gen/mklive.py`, then run `python3 tools/gen/mklive.py`.
- **Privacy.** Never put the VIN, plate or chassis number in any repo file. Test fixtures use the public example VIN `1HGBH41JXMN109186` only.
