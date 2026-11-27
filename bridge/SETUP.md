# Setting up Claude live on Kyle's PC

For the Claude Code session on Kyle's Windows PC. Kyle pastes one line ("Read bridge/SETUP.md and set up Claude live with me") and you do the rest with him, explaining in plain words. He does not write code. Ask before anything that changes Tailscale settings for his whole tailnet.

## What it is
- `bridge/server.js` is an MCP **channel** (Claude Code research preview, needs Claude Code 2.1.80+ and a claude.ai login; Kyle is on Max, so no API key: make sure `ANTHROPIC_API_KEY` is not set, or Claude Code bills the API).
- Claude Code starts it from `bridge/.mcp.json` when a session is started in `bridge/` with `claude --dangerously-load-development-channels server:v60` (custom channels are not on Anthropic's allowlist, so the development flag is required; it shows a warning screen each start).
- It listens on `127.0.0.1:8788`. `tailscale serve` publishes that inside Kyle's tailnet as `https://<pc>.<tailnet>.ts.net`. V60-Link on his phone (Bluefy) connects to `wss://<pc>.<tailnet>.ts.net/link?code=<pairing code>`.
- The always-on session is the one started by `bridge/start.cmd`. It is separate from the development sessions in the repo root. `bridge/CLAUDE.md` is its brief.

## Steps
1. `git pull --rebase -X theirs origin main` in the repo (Desktop\V60-Link).
2. Check versions: `node --version` (20 or newer), `claude --version` (2.1.80 or newer; `claude update` if not).
3. Tailscale on the PC: installed, signed in, same account as the iPhone. In the Tailscale admin console (DNS page) MagicDNS and **HTTPS certificates** must be on. Ask Kyle before turning HTTPS certificates on: it is a tailnet-wide setting and the PC's name becomes visible in public certificate logs.
4. `cd bridge`, `npm install`.
5. `tailscale serve --bg 8788`, then `tailscale serve status` should show `https://<pc>.<tailnet>.ts.net` proxying to `http://127.0.0.1:8788`.
6. `node pair.js` prints the PC address and the pairing code. Kyle needs both on the phone once.
7. Make a desktop shortcut called "Claude live" to `bridge\start.cmd` (PowerShell: a WScript.Shell shortcut, working directory `bridge`). Optional: a copy in `shell:startup` so it opens at sign-in; the development-channels warning still needs one keypress after each restart.
8. Kyle double-clicks it: choose "I am using this for local development", then "Use this MCP server" the first time. The banner should say `Channels (experimental) messages from server:v60 inject directly in this session`. `/mcp` shows `v60` connected.
9. On the iPhone: Tailscale app on; Bluefy, V60-Link, Link tab, Claude live, Pair with your PC: type the address and code, Save and connect. Status turns to "Claude is watching".
10. Test without the car: on the phone tap "Try with a simulated car". The session should receive `event="adapter_on"` and say hello on the phone.

## Always on when Kyle starts driving
- PC: a copy of the "Claude live" shortcut is in the Startup folder (`shell:startup`), so it opens at sign-in; the development-channels warning still needs one keypress after each restart (never automate that). The PC must not sleep while plugged in (Kyle's desktop: never, checked 2026-11-26).
- Phone: Link tab > Connect > **Connect by itself** (`tools/gen/live_auto.js`, localStorage `v60-link-auto`). With it on, the page connects to the adapter chosen last time with no tap whenever it is open and the ignition is on, keeps the screen on while connected, and reconnects to Claude live by itself. It needs one tap on Connect adapter the first time. iOS pauses web pages in the background, so Bluefy must be open on V60-Link; an iOS Shortcuts automation (Bluetooth: when the phone connects to the car, Open App Bluefy) can do that, if the phone uses the car's Bluetooth. Unverified on Kyle's phone: whether Bluefy connects without a tap, and whether Bluefy reopens on its last page.
- `tests/auto.js` plays it against a mocked adapter: car off, ignition on, ignition off, a manual Disconnect, an adapter that never answers.

## Updates without asking
- After every drive (`adapter_off`) the live session sends Kyle a recap of at most three lines. If the phone is already asleep, the bridge keeps Claude's message and delivers it the next time the phone links.

## Is it working?
Double-click the desktop shortcut "Check Claude live" (`check.cmd`): it opens the results as a page in the browser (`data/check.html`). `node check.js` prints the same in the terminal. It only reads; it changes nothing. It checks each link in order and says what to do at any `[!!]`:
1. This PC: Tailscale on, HTTPS certificates on, `tailscale serve` publishing port 8788, the Claude live window running with the development flag and the bridge inside it, the bridge answering locally and at the secure address the phone uses. It shows the pairing code.
2. The phone: whether the iPhone is on Tailscale, whether V60-Link is linked, which adapter is connected, and from the V60 iPhone app's own journal (it sends it to the bridge, kind `app`) whether the car answered and the link held with the app in the background.
3. Activity (`--hours N`, default 12) from `data/logs/`: every event Claude was told, every reply it showed on the phone, every command it sent and the car's answer, in time order. "Full loop works" means Claude answered the latest event on the phone; that is the proof the whole chain works. A latest event left unanswered for over 2 minutes counts as a problem.
It exits with code 1 on any problem, so a Claude session can run it as a test. After a change to the bridge's code, also run `node tests/run.js claude` from the repo (the real bridge against the simulated car); `check.js` checks this PC's setup and what happened, the test checks the code.

## If something is off
Run the check first.
- Phone says "Your PC is not answering": open `https://<pc>.<tailnet>.ts.net/` in Safari on the phone. "Claude live (V60) is running" means the bridge and Tailscale are fine and the problem is in the page; anything else means the session is not running, Tailscale is off on one side, or serve is not set up.
- "The PC refused the pairing code": the code on the phone does not match `bridge/data/pair.json`. Run `node pair.js` again and re-type it.
- `/mcp` shows v60 failed: the debug log is `%USERPROFILE%\.claude\debug\<session-id>.txt`. Usually missing packages (`npm install` in `bridge`) or port 8788 held by an older window (close it).
- Events don't arrive but tools work: the session was started without the development flag. Use `start.cmd`.

## Files
- `server.js` (channel + WebSocket), `lib.js` (pairing, write check, reply parser, log), `pair.js` (address and code, sets up `tailscale serve`), `start.cmd`, `.mcp.json`, `.claude/settings.json` (lets the five `v60` tools run without a terminal prompt; the bridge and the phone still ask Kyle before any write to the car), `CLAUDE.md` (the live session's brief).
- `data/` (gitignored, local only): `pair.json`, `logs/<date>.jsonl` (every adapter line, Claude's commands, events, messages).
- The phone side is `tools/gen/live_claude.js` (built into `src/js/modules/live.js` by `tools/gen/mklive.py`). `tests/claude.js` runs the real bridge against the simulated car end to end.

## Seeing the iPhone's screen (read-only)
`node phone.js` saves a screenshot of the iPhone to `data/phone/` (kept on this PC, newest 50) and prints its path;
`node phone.js --check` only says whether the phone is reachable. It uses pymobiledevice3 in
`C:\Users\kfitz\Tools\pmd3` (installed 2026-11-27, version 11.66.1) over the USB cable, or over home Wi-Fi (both tested
2026-11-27; Wi-Fi uses a RemotePairing record made once with `pymobiledevice3 lockdown remotepairing --pair`,
because this PC has no Bonjour). The phone has to be awake. It cannot tap or type. It needs Developer Mode on the phone and no administrator rights; it
mounts Apple's developer disk image again by itself after the phone restarts.
