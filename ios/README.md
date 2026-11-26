# V60 for iPhone (test 0.1)

A native shell around the Garage site, plus what a web page cannot do on iPhone: keep the OBD adapter link and the
Claude live link working with the app in the background.

- `V60App/Car.swift`: CoreBluetooth to the adapter. Remembers it, and after every drop asks iOS to reconnect, which
  iOS keeps doing in the background (state restoration, `bluetooth-central` background mode). Sets the adapter up
  like the web page (warm start) and checks the car answers. "Stay linked in the background (test)": a quiet ATRV
  every 2 s, to see whether that keeps the app running for a whole drive.
- `V60App/ClaudeLink.swift`: the same messages to `bridge/server.js` as `tools/gen/live_claude.js`. Claude's
  messages and Allow/No questions arrive as notifications; Allow needs the phone unlocked. Same write rule as the
  page and the bridge (`CarRules`).
- `V60App/Journal.swift`: what happened and whether the app was open or in the background, kept across relaunches.
- `V60App/Views.swift`: the Garage site in a web view (it sees `window.V60_NATIVE`), the round car button, and the
  Car link panel with the test checklist and "Copy the results for Claude".

Build: `.github/workflows/ios.yml` on GitHub's Mac (XcodeGen, unsigned build, ad-hoc sign). The artifact
`V60-test` holds `V60-test.ipa`; install it with Sideloadly and a free Apple ID (re-install every 7 days).
Bundle id `com.kfitz.v60garage`.

The test: connect once with the app open; then lock the phone, and the next time the car starts, don't open the app.
Claude should say hello in a notification. The checklist shows whether the car answered with the app in the
background and whether the link held.
