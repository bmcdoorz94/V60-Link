# V60 app updates through SideStore (free Apple ID)

SideStore is an app store on the iPhone that installs and refreshes sideloaded apps with a free Apple ID, without
a PC after the first setup. GitHub publishes each V60 build to the source
`https://github.com/bmcdoorz94/V60-Link/releases/download/sidestore/source.json` (`.github/workflows/ios.yml`,
`ios/sidestore_source.py`); SideStore offers an update when `MARKETING_VERSION` or `CURRENT_PROJECT_VERSION` in
`ios/project.yml` goes up.

Free Apple ID limits: at most 3 sideloaded apps at once (SideStore counts as one: SideStore, V60 and The Guide fill
them), 10 new app IDs a week, and each install stops opening 7 days after it was signed unless refreshed.

## One-time setup (about 10 minutes, phone on the PC's USB cable)

1. **Phone:** remove Tower Defense if it is still there (long-press > Remove App > Delete App).
2. **Phone:** install **LocalDevVPN** from the App Store. SideStore uses it to talk to the phone itself.
3. **PC:** run `C:\Users\kfitz\Tools\iloader-2.4.2\iloader-windows-x64.exe` (iloader 2.4.2; checksum checked
   2026-11-26). Windows warns because it is unsigned: More info > Run anyway.
4. **iloader:** sign in with your Apple ID (you type the password; Claude never does), pick the iPhone, then
   **Install SideStore (Stable)**. iloader also puts SideStore's pairing file on the phone.
5. **Phone:** Settings > General > VPN & Device Management > your Apple ID > Trust.
6. **Phone:** turn Tailscale off (iOS runs one VPN at a time), open LocalDevVPN and connect, then open SideStore.
7. **SideStore:** Sources > **+** > paste the source address above > add. Then install **V60** from it.
8. **Phone:** turn LocalDevVPN off and Tailscale back on, and open V60 once so it registers for the car again.

## Every week or so
- SideStore refreshes apps before they expire, but only while LocalDevVPN is connected. If V60 says it is
  "no longer available", open SideStore with LocalDevVPN on and tap Refresh All. Nothing is lost.
- Updates: SideStore shows them under Updates when a new build is published.

## Done 2026-11-27
- iloader installed SideStore (Stable) and its pairing file. It made its own certificate and left Sideloadly's in
  place (iloader > Certificates lists both), so the copies Sideloadly installed keep opening.

- SideStore's own Apple ID sign-in first failed with `ADI native error (-45063) ... Pending ADI session`, a known
  break since Apple's 2026-11-20 server change (SideStore issues #1745 and #1765), not the account. What worked,
  with no manual header editing: Settings > User Customizations > On-Device Anisette off, force-quit; Reset adi.pb >
  Reset & Sign Out; Anisette Servers > SideStore (New) `https://new.ani.sidestore.io`, Auto Rotation off;
  Anisette Client Configuration > Remote Server Sync > Fetch > Save as Overrides; force-quit, sign in. Never tap
  Reset to Defaults there (it brings back the `macOS;` header Apple now refuses), and never let it revoke
  certificates after a failed sign-in.

- V60 0.4 installed from the source over the Sideloadly copy. Its saved settings carried over: at 08:36 it linked
  to Claude live without re-pairing and still knew the adapter (bridge log: hello "V60 iPhone app 0.4", known: true).

## Not confirmed yet
- Whether a later SideStore refresh replaces Sideloadly's certificate. If V60 or The Guide stop opening, install V60
  again from the source, and The Guide from its .ipa (SideStore > My Apps > **+**, from Files).
