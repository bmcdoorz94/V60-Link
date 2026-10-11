## 1. Current Active Objective
Shipped on 2026-10-11:
- Cross-device sync through a private GitHub repository (`src/js/modules/sync.js`).
- Skill tree with perks (`src/js/modules/skills.js`).
- Timeline view and proof photos in Story.
- Garage map on Today, the header pulse strip and Listen buttons (`src/js/modules/ui.js`).
- Drive mode in Live link, the first-launch cold open, the backup nudge, and a backup export that works outside Claude.
- The trailer was rewritten as a 40-second mystery teaser (a Claude artifact, not in the repo).
- A monthly iPhone reminder for the oil and tire check was created in Kyle's Reminders app.

The waiting item is Kyle's sync setup: create the private repo `v60-garage-data` and a fine-grained token (that repo only, Contents read and write), then paste both in Story, then Options, on each device.

## 2. Immediate Next Steps
1. Get Kyle's reaction after he plays the opening (prologue, Safe to Touch, The Signal with his real OBDLink CX in Bluefy). Ask whether the pace of reveals feels right.
2. Ask Kyle for his build month from the driver's door-pillar label. It closes a Paper Trail step.
3. Possible next additions:
   - more scene art per case
   - an evidence photo per case
   - a Codebook entry for each Volvo-specific code he actually sees
   - a "previously on" recap scene when he returns after a long break
4. After any change: build, run all three tests, check the screenshots, and update ROADMAP.md, GAME_DESIGN.md and this file.

## 3. Pending Logic & Blockers
- **Gate logic** (story.js):
  - `available(case)`: Act 1 is open from the start. Later acts need the previous act fully closed. Within an act, a case opens once the previous one has started.
  - `revealedSet()` is the union of: Today, Story, the `reveals` of every available case, act rewards (`ACT_REWARD`), and everything once the finale is reached or "Show everything" is on.
  - `sweep()` records closures, availability and reveals, and queues one "beat" scene per batch of changes. Scenes wait on Today.
  - Core calls `V60_GATE.sync()` at the start of `renderNav`, and `navRefresh` after a sweep changes anything.
  - Jumps to hidden tabs still work (for example from "Something's wrong"); they just aren't in the nav.
- **Real scans versus simulated scans.** The Signal and Baseline need a real scan. A simulated scan saved to the Garage also sets `state.lastScan`, so `scans(api, true)` ignores `lastScan` when it matches a simulated scan's date.
- **Live link has never run on the real car.** Kyle owns the OBDLink CX. It needs the Bluefy browser on iPhone. First real test should check:
  - connect, health check, live recording rate, 0–60 sample rate
  - clearing codes refused while the engine runs
  - that Decode chips appear for every supported PID
- **Unconfirmed data** (keep it labeled unconfirmed in the UI):
  - Polestar availability and price in 2026
  - 4G modem (SMB 00-035) availability
  - Live tire prices
  - NHTSA position on LED bulbs specifically
  - Petrol injection pressure and turbo type
  - Which TG-81SC ratio set applies
  - Contents of TJ30087
  - Kyle's build month
- **Workflow.** Kyle uses the Gemini app for handoffs. By default, Gemini's returned work comes back through Claude, which applies it with `tools/apply_handoff.py`, then builds, tests and commits.
- **Size constraint.** `src/js/core.js` is about 240 KB. Put new features in `src/js/modules/`. When core.js must change, return exact find-and-replace edits under `## Edits to apply`.
- **Generated file.** Never edit `src/js/modules/live.js` directly. Edit `tools/gen/live_extra.js`, `tools/gen/cipher.py` or `tools/gen/mklive.py`, then run `python3 tools/gen/mklive.py`.
- **Privacy.** Never put the VIN, plate or chassis number in any repo file. The repo is public.
