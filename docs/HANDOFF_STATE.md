## 1. Current Active Objective
Progressive reveal just shipped. The story ("The As-Is File", `src/js/modules/story.js`) now drives the whole app. On day one only Today, Story, the Ask bar and the "Something's wrong" panel exist. Each case reveals the tabs it needs; act completions unlock side missions; the finale reveals everything. `docs/GAME_DESIGN.md` has the full progression table.

New pieces:
- **The Signal case (Act 1) and the Codebook.** Live link shows raw labels (PID 0C, MONITOR 04, Encoded fault) until each one is decoded with one tap. The data lives in `src/js/data/codebook.js`; the hooks into Live link are in `tools/gen/cipher.py`.
- **Case briefings and debriefs.** Debriefs end with a three-question quiz.
- **The File:** a printable dossier built from logged data.
- **Knowledge unlocks** for Library articles and flashcards.
- **Detail levels:** Short, Detailed and Mechanic.
- **"Where" buttons** that jump to the engine bay with the part highlighted (`bay:<itemId>`).
- **Options:** "Show everything" and "Plain readings".

All three test files pass (`tests/story.js` covers the progression).

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
