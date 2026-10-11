## 1. Current Active Objective
The story mode rebuild just shipped. "The As-Is File" (`src/js/modules/story.js`) is now a case board: eight cases in four acts plus a finale.
- Each case has a status (Unknown → Lead → Evidence → Closed) computed from real saved data across the app.
- Closing a case queues a scene, built from the actual result, that waits on Today and in the Story tab. Scenes never auto-play.
- The narrator, Lars, is a fictional retired Volvo tech, and the UI says so.
- Cases can be closed with a reason, which logs a known risk that stays flagged and is named in the finale.
- Six critical cases plus a passed exam unlock the finale. After the finale, Health items with severity 48 or higher show as new cases.
- `core.js` gained a `mission:<id>` jump (opens an Academy mission directly) and `api.oilRate()`.
- Tests: `tests/story.js`, plus the existing regression and features tests. All pass on phone, desktop and dark.

## 2. Immediate Next Steps
1. Ask Kyle how the case board feels in use: wording, too much or too little per case, and whether the side missions list is useful.
2. Ask Kyle for his build month from the driver's door-pillar label. It closes a Paper Trail step and drives bulletin applicability.
3. Work through the open backlog questions in `docs/ROADMAP.md`: engine bay photo, monthly reminder, receipts, adapter purchase, service contract, fuel log frequency, upgrade interests.
4. Possible story polish: more scene art per case (currently the existing line-art scenes are reused), and an optional evidence photo per case.
5. Before any change: read CLAUDE.md. After any change: build, run all three test files, look at the screenshots, update ROADMAP.md and this file.

## 3. Pending Logic & Blockers
- **Case rules live in the `CASES` array in story.js.** Each step is either `ok(api)` (computed from data) or `manual: key` (a "Mark done" button stored in `api.mod("story").manual`).
  - Closures are recorded once by `sweep()`, which runs on the Story and Today renders, and never revert, except known-risk closures, which can be reopened.
  - Result lines are snapshotted when a case closes.
- **Evidence sources the cases read:**
  - Academy missions: `api.acad().done`.
  - `api.lastFor("timingbelt")`, `api.state.oil` with `api.oilRate()`, `api.state.recalls` with `api.RECALLS`, `api.state.runs`, `api.state.lastScan`.
  - Module data: `glove` receipts and tools, `diy.done`, `tsb.build` and `tsb.mark`, `live.scans` (simulated scans are excluded), `exam.passed`.
- **Live link has never run on the real car.** Kyle hasn't confirmed buying the OBDLink CX.
  - The page uses full 128-bit Bluetooth UUIDs and prefers service FFF0 (notify FFF1, write FFF2). iPhone needs the Bluefy browser.
  - First real test should check: connect, health check, live recording rate, 0–60 sample rate, and that clearing codes is refused while the engine runs.
- **Unconfirmed data** (keep it labeled unconfirmed in the UI):
  - Polestar availability and price in 2026
  - 4G modem (SMB 00-035) availability
  - Live tire prices
  - NHTSA position on LED bulbs specifically
  - Petrol injection pressure and turbo type
  - Which TG-81SC ratio set applies
  - Contents of TJ30087
  - Kyle's build month
- **Workflow.** Kyle uses the Gemini app for handoffs. By default, Gemini's returned work comes back through Claude, which runs `tools/apply_handoff.py`, then builds, tests and commits.
- **Size constraint.** `src/js/core.js` is about 238 KB. An AI returning it whole may run out of output space. Put new features in `src/js/modules/`. When core.js must change, return exact find-and-replace edits under `## Edits to apply`.
- **Generated file.** Never edit `src/js/modules/live.js` directly. Edit `tools/gen/live_extra.js` or `tools/gen/mklive.py`, then regenerate.
- **Privacy.** Never put the VIN, plate or chassis number in any repo file. The repo is public.
