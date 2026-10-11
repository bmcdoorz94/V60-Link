# V60 Garage roadmap

Living tracker. Update it at the end of every work session: move finished items to Done, add new ideas, record answers to open questions.

## Status (2026-10-10)
Live version 2026.10.10-1919. 24 tabs across Today, Learn, Car, Check and Data. Tests pass on phone, desktop and dark.

## Next: Story mode rebuild ("The As-Is File" as a case board)
Current problems, from the 2026-10-10 review:
- Only Academy progress and the exam unlock chapters. Most tabs have no effect on the story.
- Unlock order is broken: chapter 6 "Sixth Sense" unlocks after Academy chapter 2, before story chapters 3–5. Its content belongs with Academy chapter 5.
- The narration is generic and doesn't react to what was found on the real car.
- There are no objectives in the story, and nothing anywhere is labeled main or side.

Proposed design:
- Each unknown about the car is a case, with status Unknown → Lead → Evidence → Closed. The main quest is closing cases in order of risk.
- Closing a case plays a cutscene built from the real result.
- Main cases, in order:
  1. Act 1, Arrival: Safe to touch.
  2. Act 2, The Unknowns:
     - **The Belt**: history hunt, a receipt, or a shop inspection.
     - **The Thirst**: oil watch log over about 1,000 mi, giving a quarts-per-1,000 rate; TJ31216 checked.
     - **The Light That Won't Go Out**: pressures, calibration, matched tires; closes when the light stays off, or when TJ29818 goes on the shop note.
     - **The Paper Trail**: recalls resolved, build date entered, S29842 checked by VIN, factory option list.
  3. Act 3, The Voice: **Baseline**, meaning a Live link scan, three baseline drives and readiness complete.
  4. Act 4, Ownership: First Wrench, Sixth Sense.
  5. Finale: exam passed and all critical cases closed.
- Side missions, labeled optional: Career jobs, mystery cars, non-critical DIY jobs, seasonal events, upgrades, card streaks, photo mapping, fuel streaks.
- Endgame: new cases open on their own from data changes (new code, MPG drop, readiness lost, bulletin symptom marked, renewal due).
- Story becomes the first item in Learn. The Academy becomes the training material that cases link to.

Open questions for Kyle. The defaults in brackets apply if there's no answer.
- [ ] Narrator: documentary voice or a mentor character, such as an old Volvo tech? [mentor]
- [ ] Allow "close with a reason" for cases that need money or a shop visit? [yes]
- [ ] Cutscenes: auto-play when a case closes, or wait on Today? [wait on Today]
- [ ] Fold the Academy into the case board, or keep it as its own tab? [fold in]

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
- Single source in `src/`, built to two targets: the GitHub Pages app (primary; Bluetooth works in Bluefy) and the Claude artifact (secondary; Claude features such as the receipt reader, no Bluetooth).
- Offline knowledge base answers questions without using Claude. Claude is only used when the user asks for it.
- Clearing codes is allowed only with safeguards: a saved scan, checklist, engine-off check and a typed confirmation.
- Tire age rule follows Volvo's manual: 6 years.
- No aftermarket tunes in guidance (Clean Air Act tampering, Travis County testing). Polestar is the sanctioned option.
- VIN, plate and chassis number never go in the repo. They may only be typed into the app's local storage.

## Done
- 2026-10-10: modular app shell (Today plus five sections), offline Library, Cards, Exam, Story v1, Fuel and costs, Glovebox, DIY jobs, Troubleshoot, Bulletins (20 TSBs), Upgrades, Live link port with gauges, 0–60, drive-cycle coach, trips and scan history, achievements, seasonal events, six new articles, tests moved into the repo.
