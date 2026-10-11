# V60 Garage: how the game works

The app is a real-life game about one car. The main story, "The As-Is File", drives everything. On day one almost nothing is visible. Each case you open reveals the tools it needs, and finishing acts unlocks side content. Every objective is something done on or for the real car, then recorded in the app.

## Start
- Visible: **Today** (home), **Story**, the **Ask** bar (offline answers about the car), and the red **Something's wrong with the car** button. The button is always there and goes straight to the right troubleshooting guide, whatever the story progress.
- The prologue scene introduces the car (bought as-is, no records), the adapter (a box that speaks the car's language), and Lars, a fictional retired Volvo tech who narrates. Every fact he states is sourced elsewhere in the app.

## Cases (main story)
Each case has:
- a **briefing**: why it matters on this car, time, cost, tools, the risk if skipped, and sources
- **steps**: each with a Go button to the exact place in the app, sometimes a **Where** button that highlights the part on the engine bay map, and a few "Mark done" steps only you can confirm
- a **status**: Unknown → Lead (started) → Evidence (proof is coming in) → Closed
- a **debrief** when closed: what was found, in numbers where possible, plus a short scene and three quiz questions ("Check yourself")

Cases close from real evidence, not from tapping "done". If a case can't be finished yet (money, a shop appointment), "Can't close it yet?" logs it as a **known risk**. That keeps the story moving, but the case stays flagged in red and the finale names it.

| Act | Case | What closes it | What it reveals |
|---|---|---|---|
| 1 Arrival | Safe to Touch | Safety, hood and landmark missions | Academy, Engine bay |
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

## Skill tree (Learn, then Skills; opens after Act 1)
Four branches, each node earned by evidence already logged elsewhere. A branch builds tier by tier.
- **Hands-on:** Under the hood, Fluids, Tires, Wrench
- **Diagnostics:** Listener, Decoder, Data reader, Diagnostician
- **Knowledge:** Reader, Scholar, Certified
- **Ownership:** Record keeper, Paper trail, Budgeter
- **Master tech** (capstone): Tires, Data reader, Certified and Budgeter all earned

Three nodes grant perks that open features: Record keeper opens the **Timeline** view, Scholar opens the **Mechanic** detail level, and Data reader opens **Drive mode** in Live link. Each node is worth 25 XP, and the capstone 100.

## Progress and rewards
- **XP and rank:** the level chip in the header. XP comes from Academy missions, closed cases (40 each, 10 for a known risk, 150 for the finale), correct debrief answers (5 each), decoded signals (3 each), DIY jobs, receipts, scans, trips and more.
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
