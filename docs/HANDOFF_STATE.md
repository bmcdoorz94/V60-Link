## 1. Current Active Objective
**Build "Auto-read uploads with privacy redaction"** (Kyle's request, 2026-10-11): every photo or document Kyle adds to the app is read and decoded automatically, and personal information is blacked out before anything is saved or synced. After that, close the gaps found in the feature audit (section 2, step 3).

State of the app when this handoff was written (all pushed to `main`, tests passing):
- Story ("The As-Is File") is the only place to play. The old Academy is now **Training**: hidden from the nav, opened from a case step's **Lesson** button (`data-from="<caseId>"` sets `window.V60_FROMCASE`, so the lesson shows "Back to the case"). Story links to a Training library.
- Sync works through the private repo `bmcdoorz94/v60-garage-data` (token expires Dec 10 2026; an iPhone reminder is set for Dec 3). A **Sync chip** in the header (`#syncChip`, rendered by `sync.js` `chip()`) jumps to `opts:sync`, which scrolls to `#syncBox` and focuses the token field. Sync sits at the top of Story → "Options: sync, backup, display".
- **Kyle uses Bluefy only** (GitHub Pages copy, no switching browsers). Claude-powered features (`api.sample()`: receipt reader, Ask with Claude, photo review) only work inside the Claude artifact, so **in Bluefy they are unavailable**. Anything that "reads" an upload in Bluefy must run on the device.
- A fresh `HANDOFF.md` is rebuilt on every push by `.github/workflows/handoff.yml` and kept on the `handoff` branch.

## 2. Immediate Next Steps
1. **Ask Kyle these before building** (he wants clarifying questions on every task):
   - Which uploads should be read: service receipts, the door-pillar label, registration, insurance card, inspection report, dash or warning-light photos, story proof photos? All of them, or a subset?
   - What counts as personal information to black out? Proposed default: VIN, license plate, his name, street address, phone numbers, email addresses, card and account numbers, signatures. Anything else (for example the shop's own name and phone, which are useful and not his)?
   - Save automatically, or show "Here's what I read" and save with one tap? Proposed default: read automatically, pre-fill everything, one tap to confirm, low-confidence fields marked unconfirmed.
   - On-device reading only (free, works offline, less accurate on crumpled receipts), or also an optional AI read using his own Gemini or Claude API key (better accuracy; the already-redacted image leaves the phone)? Proposed default: on-device only.
2. **Build `src/js/modules/scan.js`** (add to `MODULES` in `tools/build.py`; styles in `src/css/modules.css`). Exposes `window.V60_SCAN.process(file, hint) -> Promise<{blob, text, fields, boxes, kind}>`. Pipeline:
   1. **Shrink** with the existing `api.shrinkPhoto(file)`. It re-encodes through a canvas, which already strips EXIF and GPS metadata. Keep that.
   2. **On-device OCR** with Tesseract.js. Pin an exact version from jsDelivr, load it lazily only when a photo is added, and cache the worker, core and `eng.traineddata` in `src/sw.js` so it works offline in Bluefy. Use word-level bounding boxes.
   3. **Find personal information** in the OCR words:
      - VIN: 17 characters from `[A-HJ-NPR-Z0-9]`, validated with the check digit in position 9.
      - Plate: text next to "Plate", "Lic", "License" or "Tag".
      - Phone numbers, email addresses.
      - Street addresses: a house number followed by a street suffix.
      - Card and account numbers: 13–19 digits passing Luhn, and masked forms like `XXXX1234`.
      - Names after the labels Customer, Name, Bill to, Sold to, Owner, Insured.
      - A local-only "Always hide" list (Kyle's name, street, plate) stored in localStorage key `v60-scan-private`. **Never** put it in the synced state or the repo.
   4. **Black out** those word boxes (plus padding) on the canvas *before* the image is stored, uploaded to sync, or sent to any AI. The original is never saved. Also replace the same strings in the stored text (for example "[VIN hidden]").
   5. **Preview with control**: show the redacted image; tapping a region toggles a black box on or off before saving.
   6. **Decipher** by document kind, using keyword classification:
      - **Receipt**: date, odometer or mileage, shop, total, and line items mapped to the service items in core (`api.ITEMS`: oil, filters, plugs, timing belt, brakes, tires, coolant, battery, and so on). Pre-fill a Records entry and a Glovebox receipt.
      - **Door-pillar label**: build month and year (the open question in Paper Trail). Fill My V60. The VIN on this label must be blacked out.
      - **Registration, insurance or inspection paper**: expiry dates into the Glovebox document renewals.
      - **Dash photo**: no OCR fields; suggest the "Something's wrong" flow.
      Low-confidence fields show "unconfirmed" in the UI (project rule).
   7. **Inside the Claude artifact only**: if `api.sample()` is available, it may also read the redacted image for better extraction. Never send the unredacted image.
   8. **Hook it into every upload point**: Glovebox receipts (`glovebox.js`), document vault, Story proof photos (`data-proof` in `story.js`), and any DIY or Records photo input. Core changes go under `## Edits to apply` (core.js is about 240 KB).
   9. **Story placement** (required by GAME_DESIGN): scanning is not a tab. Introduce it in **The Paper Trail** case, for example a step "Scan the door-pillar label" that closes the build-month step automatically.
   10. **Test** `tests/scan.js`: draw a synthetic receipt on a canvas containing a fake VIN (use the public example `1HGBH41JXMN109186`, never Kyle's), a phone number, a card number and a mileage. Assert that the pixels under those words are black, the stored text has no VIN, and the date and mileage were extracted. Install `tesseract.js` locally for the test (CI has no CDN guarantee).
3. **Feature audit gaps.** The ranked list Kyle saved earlier was checked against the code on 2026-10-11. Built and needing no work:
   - V60 Master certification (60 questions) and printable fact card
   - bulletin library with the "does this affect me" check
   - fuel log versus EPA
   - Career jobs (5 Drive-E jobs)
   - safety systems article
   - tool inventory, skill tree, decision trees
   - drive-cycle coach, freeze frames kept in health checks, gauge cluster, 0–60
   - document vault with renewals, warranty and service-contract tracker
   - upgrade guide (Polestar, tires, headlights, CarPlay, dash cam) with the "should I" score
   - Texas summer seasonal event, proof-only achievements

   **Partly built** (finish these):
   - Mastery deck: spaced repetition works (`cards.js`), but only **86 facts** exist; the plan was about 150. There is no "daily 2-minute drill" mode. Add sourced facts to `facts.js`; add a timed drill.
   - Ask my car: the offline Ask works and says when something is not in the list. The Claude-grounded version only works in the artifact, so not in Bluefy. Decide with Kyle whether to add an optional own-API-key mode.
   - Receipt scanner: manual entry works in Bluefy; Claude reading only in the artifact. **Superseded by step 2.**
   - Owner complaints: a static article exists (`a-complaints`). Not built: a live grouping of NHTSA complaints for the 2015–2017 V60 by system and mileage (NHTSA complaints API).
   - Healthy baseline: Data lab can save a baseline run and Baseline needs three saved drives. Not confirmed: the simulator and analyzer comparing against Kyle's own drives instead of generic ranges.
   - Austin shops: an article exists (`a-shops`). Not built: a quote script for the timing belt and baseline inspection.
   - Systems deep dives: articles exist (Drive-E, transmission, start/stop, tire monitor). Missing: the **interactive diagrams** and a P3 platform piece.
   - Glossary: a static list in Learn. Missing: links from each term to its spot on the engine bay map.
   - Model history: a trim article exists (`a-trim`). Missing: where the V60 sits in the lineup and what changed from 2015 to 2016 (needs sources).
   - DIY job cards: oil check, fluids, tires, wipers, H11/H9 bulb, jump-start, wheel change, fuse, battery and wash exist. **Missing: cabin filter, engine air filter, PY24W turn-signal bulb, tire rotation.** Before and after photo proof on DIY cards is not confirmed (Story has proof photos).
   - Volvo-specific trouble codes: the lookup explains generic versus manufacturer codes but has no Volvo definitions list. Add only codes with a public source.
   - Trip logger: trips save, but recording starts manually. Not built: auto-start on connect.
   - Performance runs: 0–60 is built. Boost and ignition-timing checks are not confirmed.
   - Total cost of ownership: totals and per-mile cost exist. Missing: the forecast.

   **Not built:**
   - "Explain it to a friend" (Claude grades Kyle's explanation; needs an AI in Bluefy, see the API-key question)
   - parts encyclopedia with Volvo part numbers (only with sources, never invented)
   - Mode 06 self-test results explained
   - resale-value tracker
   - "Mechanic mentor" chat (same AI dependency)

   Not features: the "Honest limits" lines (no mic or vibration analysis, no VIDA on iPhone) are already stated in the app.
4. Other open items:
   - Kyle's reaction to the Story and Training merge and the new trailer (Claude artifact `LAGywEDVRqFdoNvh4vDcp7`).
   - First real-car Live link test in Bluefy with the OBDLink CX.
   - Build month from the door-pillar label (step 2 can capture it).
5. After any change: build, run all four test suites (regression, features, story, sync, plus scan once it exists), check the screenshots, and update ROADMAP.md, GAME_DESIGN.md and this file. Push small, finished commits so the `handoff` branch stays current.

## 3. Pending Logic & Blockers
- **Bluefy has no AI.** `api.sample()` and `api.assets()` exist only inside the Claude artifact. In Bluefy, reading uploads must use on-device OCR (Tesseract.js) unless Kyle approves an own-API-key option. A key would live in localStorage only, like the sync token, and never in synced state.
- **Redaction must happen before storage.** Photos go to IndexedDB (`api.blobPut`) and then to the sync repo (`photos/<asset>.jpg`). Redact before `blobPut`, or a VIN reaches GitHub. The sync repo is private, but the rule is that personal identifiers are never stored at all.
- **OCR accuracy is not guaranteed.** Phone photos of thermal-paper receipts are often faded. Every extracted field needs confirm-or-edit, and anything uncertain is labeled unconfirmed.
- **Service worker caching.** Tesseract's language data is about 10 MB or more for `eng`. Cache it on first use, not at install, so the app's first load stays fast.
- **Gate logic** (story.js):
  - `available(case)`: Act 1 is open from the start. Later acts need the previous act fully closed. Within an act, a case opens once the previous one has started.
  - `revealedSet()` is the union of: Today, Story, the `reveals` of every available case, act rewards (`ACT_REWARD`), and everything once the finale is reached or "Show everything" is on.
  - `sweep()` records closures, availability and reveals, and queues one "beat" scene per batch of changes. Scenes wait on Today.
  - Core calls `V60_GATE.sync()` at the start of `renderNav`, and `navRefresh` after a sweep changes anything.
  - Jumps to hidden tabs still work; they just aren't in the nav.
- **Real scans versus simulated scans.** The Signal and Baseline need a real scan. A simulated scan saved to the Garage also sets `state.lastScan`, so `scans(api, true)` ignores `lastScan` when it matches a simulated scan's date.
- **Live link has never run on the real car.** First real test in Bluefy should check:
  - connect, health check, live recording rate, 0–60 sample rate
  - clearing codes refused while the engine runs
  - that Decode chips appear for every supported PID
- **Sync token** expires Dec 10 2026. When it does, sync shows errors until Kyle regenerates the token and pastes it via the Sync chip.
- **Unconfirmed data** (keep it labeled unconfirmed in the UI):
  - Polestar availability and price in 2026
  - 4G modem (SMB 00-035) availability
  - Live tire prices
  - NHTSA position on LED bulbs specifically
  - Petrol injection pressure and turbo type
  - Which TG-81SC ratio set applies
  - Contents of TJ30087
  - Kyle's build month
- **Workflow.** Kyle uses the Gemini app for handoffs. Gemini's returned work comes back through Claude, which applies it with `tools/apply_handoff.py`, then builds, tests and commits.
- **Size constraint.** `src/js/core.js` is about 240 KB. Put new features in `src/js/modules/`. When core.js must change, return exact find-and-replace edits under `## Edits to apply`.
- **Generated file.** Never edit `src/js/modules/live.js` directly. Edit `tools/gen/live_extra.js`, `tools/gen/cipher.py` or `tools/gen/mklive.py`, then run `python3 tools/gen/mklive.py`.
- **Privacy.** Never put the VIN, plate or chassis number in any repo file. The repo is public. Test fixtures use public example VINs only.
