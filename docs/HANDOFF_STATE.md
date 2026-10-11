## 1. Current Active Objective
Two threads were active when this handoff was made:
- **Handoff tooling (done).** Set up the Claude ↔ Gemini handoff. `tools/handoff.py` generates this file. `tools/apply_handoff.py` reads a returned handoff and writes its files back into the repo. A GitHub Action rebuilds the site whenever `src/` changes, so edited source files can be uploaded through GitHub's website without running anything locally.
- **Story mode rebuild (designed, not started).** Turn "The As-Is File" (`src/js/modules/story.js`) from a cutscene reel unlocked only by Academy progress into a case board. Each unknown about the car is a case with status Unknown → Lead → Evidence → Closed, closed by real actions in the other tabs. The full design is in `docs/ROADMAP.md` under "Next: Story mode rebuild".

## 2. Immediate Next Steps
1. Ask Kyle the four open story questions in `docs/ROADMAP.md`. If he doesn't answer, use the bracketed defaults: mentor narrator; "close with a reason" allowed; cutscenes wait on Today; Academy folded into the case board.
2. Ask Kyle for the build month on his driver's door-pillar label. Bulletin applicability in `src/js/modules/bulletins.js` depends on it.
3. Build the case board in `src/js/modules/story.js`:
   - Define the cases (Safe to touch, The Belt, The Thirst, The Light That Won't Go Out, The Paper Trail, Baseline, First Wrench, Sixth Sense, Finale).
   - Each case reads evidence from existing saved data. Main sources: `api.state.log` (service log; the timing belt key is `timingbelt`), `api.acad().done` (Academy missions), `api.mod("live").scans`, `api.mod("glove").receipts`, `api.mod("tsb")`, `api.mod("diy").done`, `api.mod("exam").passed`, `api.state.rate` (part ratings; tire age is part `age`), `api.state.oil` (oil watch entries), `api.state.recalls` (recall statuses), `api.state.runs` (saved drives) and `api.state.lastScan`.
   - Cutscene lines are built from the actual result.
   - Fix the current unlock-order bug: chapter 6 "Sixth Sense" unlocks after Academy chapter 2.
   - Label main versus side missions. Side missions: Career jobs, simulator mysteries, non-critical DIY jobs, seasonal events, upgrades, card streaks, photo mapping, fuel streaks.
   - After the finale, new cases open automatically from data changes: new code, MPG drop, readiness lost, bulletin symptom marked, renewal due.
4. Move Story to the top of the Learn section (`order` in the tab definition) and make the Academy the training material that cases link to.
5. Run the build and tests (see CLAUDE.md), check phone and dark-mode screenshots, then update `docs/ROADMAP.md` and this file.

## 3. Pending Logic & Blockers
- **Live link has never run on the real car.** Kyle hasn't confirmed buying the OBDLink CX.
  - The page uses full 128-bit Bluetooth UUIDs and prefers service FFF0 (notify FFF1, write FFF2).
  - On iPhone it only works in the Bluefy browser. Safari has no Web Bluetooth, and it doesn't work inside the Claude artifact either.
  - First real test should check: connect, health check, live recording rate, 0–60 sample rate, and that clearing codes is refused while the engine runs.
- **Data still unconfirmed** (keep it labeled unconfirmed in the UI):
  - Polestar availability and price in 2026
  - 4G modem (SMB 00-035) availability
  - Live tire prices
  - NHTSA position on LED bulbs specifically
  - Petrol injection pressure and turbo type
  - Which TG-81SC ratio set applies
  - Contents of TJ30087
  - Kyle's build month, which affects the TJ29131, TJ30268, P29929 and TJ31216 ranges
- **Design choices awaiting Kyle:** the four story questions; whether to drop the Claude artifact copy and keep only GitHub Pages; Today header redundancy.
- **Size constraint.** `src/js/core.js` is about 238 KB in one file. An AI returning it whole may run out of output space. Prefer putting new features in `src/js/modules/` files (small, self-registering). When core.js must change, return the whole file only if it fits; otherwise describe exact find-and-replace edits for Claude to apply.
- **Generated files.** Never edit `src/js/modules/live.js` directly. Edit `tools/gen/live_extra.js` or `tools/gen/mklive.py`, then regenerate.
- **Privacy.** Never put the VIN, plate or chassis number in any repo file. The repo is public.
