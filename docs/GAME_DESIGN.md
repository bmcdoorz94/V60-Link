# V60 Garage: how the game works

## The path (2026-10-15): one line, one step at a time
Kyle's brief: "one seed planted of info turns into a tree of knowledge but potentially more linear", without so many ways in that it overwhelms. His answers: strict (later steps stay locked), in the order a beginner learns a car, and the home cut down to the car, one next step and a progress bar.

- **The path** (`src/js/data/path.js`) is 113 steps in 18 units: 1 Safety first; 2 What the car is telling you; 3 The car's history and recalls; 4 Under the hood: the fluids; 5 Tires, the tire light and steering; 6 Brakes; 7 The diagnostic port; 8 Battery, fuses, lights and wipers; 9 The engine; 10 Transmission and driveline; 11 Heating and A/C; 12 Inside and out; 13 First jobs; 14 Shop jobs on record; 15 Diagnose: lights and codes; 16 Diagnose: sounds, feel and fluids; 17 Upgrades; 18 The Technician quizzes and the mock G1.
- **The order:** safety, then what this car is telling you and its history (bought as-is), then Know and Check one system at a time. Each system ends with its G1 study (ASE's tasks in ranges of 5 to 17) and its Owner quiz. Then Service (easiest jobs first), Diagnose, Upgrade, and the test. Every chapter and every G1 task is on the path exactly once; each quiz comes after the chapters and tasks it tests (`tests/path.js`).
- **Strict.** Only the current step is open. A chapter, a study range, a quiz and the mock all wait for the step before. Evidence still counts whenever it comes in: a step already done when the path reaches it is passed straight over.
- **Set aside.** A step that needs a shop, a purchase or a dealer (`park` in the data: the specialist inspection in 1.4.2, the oil change record, the timing belt, the transmission fluid, the S29842 dealer check) can be set aside from the Next card. The path moves on; the step stays listed under the card and closes by itself once its evidence arrives. For the track, a chapter set aside counts as hands-on done.
- **Home:** the Next card first (step, unit, title, what it is, one button, a progress bar, anything set aside, a waiting scene), then the car figure (tapping a locked view says which step opens it), the Index button and the red "Something's wrong" list. Gone from the home: the view sheet, the chapter 0 sheet, the Now strip and the readiness strip.
- **The whole path** (Index, or "The whole path" on the Next card): done units folded, the current unit open with its steps, later units by name only.
- **The bar:** The car, Glovebox, Link. Glovebox and Link are workbenches and always open. Cases (with Options) moved into the Index.
- **The story** no longer opens anything. Cases still close from evidence and scenes still play; the case board's next objective points at the path, and a case step past the current one shows "PATH STEP n" instead of Go. The guided walkthrough has no button for now (it followed the story's order); porting it onto path steps is on the roadmap.
- The rest of this file predates the path. Where it says chapters open each other (`opens`) or a case opens a chapter early, the path replaced that.

## The manual (redesign, Oct 2026): the car is the menu
Kyle's brief: an app a car person would want, not "an app Claude designed". Look at the car, tap a part, get that part's manual, and watch chapters unlock in order of difficulty. Mockup: the Design artifact "V60 Garage redesign mockup".

- **Home ("The car")** is a side-view figure with five numbered points, one per **view**: 1 Engine bay (hood open), 2 Wheels & brakes (the wheel), 3 Cabin (inside), 4 Underside, 5 Lights & body (walk-around). Tapping a point shows a sheet (where you stand, what is next) and an Open button into that view. Below: a Now strip (pick up here, urgent health items, a waiting scene), the contents list, the back matter (every old page the gate allows), and the red "Something's wrong" list.
- **A view** is a figure with numbered **items** (1.3 is the battery). The figure is a schematic drawing until the owner picks one of their own photos as the figure; the points start where they sit on the drawing and are dragged into place once ("Move points"). Positions are saved per view.
- **An item** is one part's manual: up to five **chapters** in order of difficulty, K Know it, C Check it, S Service it, D Diagnose it, U Upgrade it. Only chapters with sourced content exist. An item page shows "Your car" specs (from the car's data and the owner's photo readings, marked unconfirmed), the chapters, a glossary of facts by topic (locked terms show as black boxes), and evidence photos.
- **A chapter** is a short procedure: numbered steps that are things done on the car and in the app (a Training lesson, a Library article, a DIY job, a troubleshooter, a photo, a record, a real scan, a receipt, a bulletin mark, an upgrade decision). Since 2026-10-15 chapters are sections of the part page and each step opens in place: the article, the lesson, the job and the troubleshooter render inside the step, so reading never leaves the part. Steps that need a workbench (the Service log, Live link, photos, bulletins) keep a Go button; the crumb bar on that page leads back. Steps whose only evidence is "you went there" can also be confirmed by hand. A chapter closes when every step is done; it gets a dated stamp.
- **Unlocking, both ways.** The chapter before it in the same item opens the next one. A closed chapter can open chapters elsewhere (`opens`), at most two at a time so the car never lights up everywhere. A story case that is available opens its item's first chapter early (`caseOpens`): The Signal opens 3.3 the port, The Belt opens 1.4, The Thirst 1.1, The Light 2.1, The Paper Trail 3.5. Chapter 0, Before you touch anything (the Safe to Touch missions), opens 1.1 and 1.2; nothing else opens before it closes.
- **Two markers, by Kyle's choice.** Amber glow = a chapter is open and has never been opened; it stops the first time the chapter page is shown. Amber dot = the one chapter you last opened and have not closed ("pick up here"). Both roll up from chapter to item to view, so the home shows at a glance where something new is and where you left off.
- **The gate.** An old page (Library, DIY, Troubleshoot, Bulletins, Data lab, ...) is reachable once an open chapter's step points at it, or once the story reveals it as before. The bar always shows four roots: The car, Cases, Glovebox, Link; Glovebox and Link are drawn locked until 3.5 or The Paper Trail, and 3.3 or The Signal.
- **The story moves into the Cases drawer** (the Story tab). Each case still closes from evidence; the manual's chapters reuse the same evidence, so a chapter page says which case step it is.
- **Instruments stay instruments.** Live link and the Data lab keep gauges and teal traces.
- **Look.** A workshop manual: paper and ink, hairline rules, numbered sections, condensed display type (Barlow Condensed), IBM Plex Sans body, IBM Plex Mono numbers and labels. Square corners, no shadows, one accent (amber) that only ever means new. Light and dark.
- **Not built yet:** wheel and underside figures are schematic only; the Cases page keeps its old layout inside the new dress; Today's cards (guide announcements, welcome back) live under Back matter, Today's notes.


The app is a real-life game about one car. The main story, "The As-Is File", drives everything. On day one almost nothing is visible. Each case you open reveals the tools it needs, and finishing acts unlocks side content. Every objective is something done on or for the real car, then recorded in the app.

## Start
- Visible: **Today** (home), **Story**, the **Ask** bar (offline answers about the car), and the red **Something's wrong with the car** button. The button is always there and goes straight to the right troubleshooting guide, whatever the story progress.
- The prologue scene introduces the car (bought as-is, no records), the adapter (a box that speaks the car's language), and Lars, a fictional retired Volvo tech who narrates. Every fact he states is sourced elsewhere in the app.

## Story and Training
- **Story is the only place you play.** Each case says what to do on the real car and in what order.
- **Training is the how-to library behind the cases.** It used to be a separate "Academy" tab, which made it look like a second story. It is no longer in the menu. A step's **Lesson** button opens the matching lesson, which shows "Training for <case>" and a **Back to the case** button. Finishing the lesson ticks that step automatically.
- To browse every lesson, Story has a **Training library** link (with a count of lessons done).

## Guided mode (guide.js): strong help at first, then it lets go
- **Five areas, each with its own level:**
  - under the hood (Safe to Touch, The Thirst, First Wrench)
  - the adapter (The Signal, Baseline)
  - records and papers (The Belt, The Paper Trail)
  - tires (The Light That Won't Go Out)
  - reading data (Sixth Sense)
- **Level 0, Guided.** The next objective shows **Start**, which opens a full-screen walkthrough:
  - It first asks "Are you at the car right now?" once a day. When the answer is no, steps that need the car are skipped in favor of ones that don't.
  - Each screen shows one step, with why it matters, how to do it, and one big action: open the lesson, do it in the app, or Done for steps only the owner can confirm. "Show me where" opens the engine bay map.
  - Hands-on steps first need a four-item safety check, from the owner's manual rules already in Safe to Touch.
  - **I'm stuck** works as a ladder: a hint, then the lesson and the map, then "Can't do it now" (log a known risk) or "Show a different step".
  - Leaving to do a step in the app leaves a pill that leads back. When the step is done, the next screen starts with what was just finished.
- **Level 1, Assisted.** The case board as usual, with a "Walk me through it" button.
- **Level 2, On your own.** No extra prompting.
- **Levels rise from proof, not time.** Each counts as one point in its area:
  - a step finished in the walkthrough without "I'm stuck"
  - a right answer in a case debrief
  - an oil check, record, receipt, real scan or saved drive logged without being led there

  Level 1 needs 4 points and level 2 needs 10. Closed cases count 3 each, so existing progress starts at the right level.
- **Levels drop** after two stuck steps in a row in an area, or after 45+ days away. A long gap also brings a "Welcome back" recap on Today.
- **Every change is announced on Today by Lars,** with a **Keep guiding me** button that pins that area to guided (Kyle chose "just do it", 2026-10-11).
- **While any area is guided, a newly opened tab shows a one-line intro once.** The **Guide me** button in the header always opens the walkthrough.

## Cases (main story)
Each case has:
- a **briefing**: why it matters on this car, time, cost, tools, the risk if skipped, and sources
- **steps**: each with a Go button to the exact place in the app, sometimes a **Where** button that highlights the part on the engine bay map, and a few "Mark done" steps only you can confirm
- a **status**: Unknown → Lead (started) → Evidence (proof is coming in) → Closed
- a **debrief** when closed: what was found, in numbers where possible, plus a short scene and three quiz questions ("Check yourself")

Cases close from real evidence, not from tapping "done". If a case can't be finished yet (money, a shop appointment), "Can't close it yet?" logs it as a **known risk**. That keeps the story moving, but the case stays flagged in red and the finale names it.

| Act | Case | What closes it | What it reveals |
|---|---|---|---|
| 1 Arrival | Safe to Touch | Safety, hood and landmark lessons | Engine bay |
| 1 | The Signal | A real health check with the adapter, plus 5 decoded signals | Live link |
| | *Act 1 complete* | | Whole car map, Health score, Flashcards |
| 2 The Unknowns | The Belt | A logged timing belt record | Service log, Glovebox |
| 2 | The Thirst | Oil checks logged across 1,000 miles | Fuel & costs |
| 2 | The Light That Won't Go Out | Calibrated and the light stays off, or escalated with bulletin TJ29818 | DIY jobs, Troubleshoot |
| 2 | The Paper Trail | Recalls settled, build month entered, spark plug service action checked | Bulletins, My V60, Library |
| | *Act 2 complete* | | Side missions: achievements, seasonal events |
| 3 The Voice | Baseline | A real scan plus three saved drives | Data lab |
| | *Act 3 complete* | | Side mission: Simulator and mystery cars |
| 4 Ownership | First Wrench | First DIY job done | Upgrades |
| 4 | Sixth Sense | The stop-or-go final | Diagnose, plus side mission: Career shop jobs |
| | *Act 4 complete* | | The V60 Master exam |
| Finale | Master of the V60 | Six critical cases closed and the exam passed | Everything |

Within an act, the next case appears once you've started the current one. The next act appears when every case in the current act is closed.

After the finale, the story keeps going as **new cases**. Anything urgent the app detects becomes a case: a new code in a scan, an MPG drop, readiness lost, a bulletin symptom you marked, or a renewal coming due.

## The Codebook (the cipher)
The adapter's output starts as raw labels: "PID 0C", "MONITOR 04", "Encoded fault". Tapping **Decode** opens a card. The meaning resolves on screen, and the card explains what the signal measures and what it means on this car, with a source. From then on that label shows in plain words everywhere. There are no puzzles: one tap, once.

Decoding your first trouble code teaches the four parts every code is built from: letter, generic or Volvo-specific, subsystem, exact fault. After that, codes show their meaning straight away. The Codebook view lists all 30 entries: decoded, heard but not decoded yet, and not heard yet. Safety readings are never hidden: whether the check-engine light is on, emissions pass or fail, and the summary.

## The File
A dossier that builds itself from what you log:
- the car's identity, mileage and build month
- findings from closed cases
- service history and the oil consumption rate
- the latest health check
- recalls, marked bulletins, receipts and renewal dates
- known risks
- Codebook progress

It can be printed or saved as a PDF for a mechanic or a buyer. It never shows the VIN.

## Knowledge unlocks
Library articles and flashcards open with the case that uses them, marked "New entry". The Ask bar still answers anything at any time, and whatever you look up is added to your Library and card deck.

## Side missions
None of these block the story. They appear one by one as acts finish: Flashcards, DIY jobs, Fuel log, Photo mapping, Upgrades, Achievements and seasonal checklists, Simulator mystery cars, Career shop jobs.

## The certification track (replaces XP, ranks, the skill tree and the V60 Master exam, 2026-10-15)
Kyle may sit ASE's G1 (Auto Maintenance and Light Repair) one day, so progression is the G1's own shape: seven content areas with the study guide's question counts (Engine 9, Automatic transmission 4, Manual drivetrain & axles 6, Suspension & steering 13, Brakes 11, Electrical 8, HVAC 4; 55 scored of 65, 90 minutes). Each area is a level with two rungs:
- **Owner:** every part in the area has its Know and Check chapters closed on the car, then the Owner quiz is passed (10 questions, 70 %, the app's bar; ASE does not publish its pass mark). Manual drivetrain has no hands-on step on this car (no clutch, no gearbox), so its quiz opens at once and says so.
- **Technician:** every chapter closed, then the Technician quiz (diagnosis questions).
- **Readiness** per area = 40 % hands-on + 20 % flashcards mastered + 40 % best quiz score; the G1 number weights the areas as the test does. The header chip and the home strip show it.
- **Quizzes open hands-on first** (Kyle's choice): reading alone cannot level you up. Questions are original, in the styles ASE's guides show (scenario, most likely, EXCEPT, Technician A/B), each grounded in a sourced fact; misses show the answer, the explanation and the source, and land in weak spots that link back to the part.
- **Mock G1:** 55 questions drawn in the test's proportions (fewer while the bank is short), a 90-minute clock, a score report by area. A pass counts toward the finale once every area is at Owner; before that it is a practice score.
- **Perks:** Mechanic detail level after the first Owner rung; the Timeline after three services or receipts.

## Skill tree (retired 2026-10-15; kept for the record)
Four branches, each node earned by evidence already logged elsewhere. A branch builds tier by tier.
- **Hands-on:** Under the hood, Fluids, Tires, Wrench
- **Diagnostics:** Listener, Decoder, Data reader, Diagnostician
- **Knowledge:** Reader, Scholar, Certified
- **Ownership:** Record keeper, Paper trail, Budgeter
- **Master tech** (capstone): Tires, Data reader, Certified and Budgeter all earned

Three nodes grant perks that open features: Record keeper opens the **Timeline** view, Scholar opens the **Mechanic** detail level, and Data reader opens **Drive mode** in Live link. Each node is worth 25 XP, and the capstone 100.

## Progress and rewards
- **XP and rank:** the level chip in the header. XP comes from Training lessons and field missions, closed cases (40 each, 10 for a known risk, 150 for the finale), correct debrief answers (5 each), decoded signals (3 each), DIY jobs, receipts, scans, trips and more.
- **Achievements:** 18 real-proof badges, such as logging three oil checks, verifying the belt or passing the exam.
- **Scenes:** each closure or new case is a short scene. Scenes wait on Today until you watch them, and any scene can be replayed from Story, then Scenes.

## Around the app
- **Garage map (Today):** a top-down drawing of the car. Areas light up as the story opens them; tap one to go there.
- **Car pulse (header):** three dots, always visible: warning light or codes, last oil check, and the most urgent service item.
- **Swipeable Today** on phones, one card at a time.
- **Listen** buttons read briefings, decode cards, Library articles and DIY jobs aloud.
- **Proof photos:** a Photo button on every case step attaches a picture, shown on the step and in The File.
- **Cold open:** on first launch a short mystery teaser plays once, before the prologue.
- **Sync** (Story, then Options): every device shares the same progress through a private GitHub repository. Each device needs the repository name and a fine-grained token once. Photos sync too. The Claude version can't reach GitHub and stays separate.
- **Protect your progress card** on Today: appears when sync is off and there has been no backup for 14 days.
- **Monthly iPhone reminder** for the oil and tire check (in the Reminders app, created from Claude).

## Options (Story, then Options)
- **Detail level:** Short, Detailed or Mechanic. Mechanic adds part numbers, specs and bulletin details to briefings and steps.
- **Plain readings:** skips decoding in Live link.
- **Show everything:** skips the reveal and shows every tab.
