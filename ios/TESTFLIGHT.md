# V60 app updates through TestFlight

Once this is set up, every change to the iPhone app is built on GitHub's Mac, signed by Apple and sent to TestFlight.
TestFlight then installs it on the phone by itself, anywhere, with no PC, cable, Sideloadly or SideStore.
The job is `testflight` in `.github/workflows/ios.yml`; it does nothing until step 6 is done.

Why this works: Sideloadly's log (2026-11-27) says "Paid account detected" with a 365-day profile, so the Apple ID
is in the Apple Developer Program, which includes TestFlight.

## One-time steps (about 15 minutes, on the PC)

1. **Check the membership.** Sign in at https://developer.apple.com/account and open Membership details. It should
   say Apple Developer Program with a renewal date. If it doesn't, stop here: TestFlight needs the program.
2. **Accept Apple's latest agreement** if App Store Connect (https://appstoreconnect.apple.com) shows a banner about
   one. Uploads are refused until it is accepted.
3. **Create the app record.** App Store Connect > Apps > **+** > New App.
   - Platform iOS. Name: anything not already on the App Store, such as "V60 Garage KF" (it is never published).
   - Language English (U.S.). Bundle ID **com.kfitz.v60garage** (Sideloadly registered it; if it is not in the list,
     tell Claude, and the first build registers it). SKU: v60garage. User access: Full Access.
4. **Make an API key for GitHub.** App Store Connect > Users and Access > Integrations > App Store Connect API >
   Team Keys > **+** (the first time, Apple asks you to request access; accept it).
   - Name "GitHub V60", Access **Admin** (needed for Apple's cloud signing).
   - Download the key file (`AuthKey_XXXXXXXXXX.p8`). **Apple lets you download it only once.**
   - Note the **Key ID** (in the list) and the **Issuer ID** (above the list).
5. **Put yourself in a tester group.** App Store Connect > your app > TestFlight > Internal Testing > **+**.
   Name it "Me", tick **Enable automatic distribution**, and add yourself.
6. **Give GitHub the key.** https://github.com/bmcdoorz94/V60-Link/settings/secrets/actions > New repository secret,
   three times:
   - `ASC_KEY_ID`: the Key ID
   - `ASC_ISSUER_ID`: the Issuer ID
   - `ASC_KEY_P8`: open the .p8 file in Notepad and paste all of it, including the BEGIN and END lines.

   Secrets are never shown in the public build logs. Afterwards, delete the .p8 from Downloads or keep it somewhere private.
7. **Tell Claude it's done.** Claude starts the build and fixes whatever Apple complains about on the first try.
   The build summary on GitHub says "Sent to TestFlight" when it worked; Apple then takes 5-30 minutes to process it.

## On the iPhone (once)

1. Install **TestFlight** from the App Store and sign in with the same Apple ID.
2. V60 appears there (or in an invite email). Tap Install. It replaces the Sideloadly copy. Whether the app's saved
   settings carry over is not confirmed: if it asks for the pairing code again, the code is on the PC
   (Check Claude live page).
3. In TestFlight, open V60 > **Turn On Automatic Updates**.
4. Open the V60 app once, so it registers for the car again.

## Afterwards
- Each push that changes `ios/` makes a new build; a monthly run keeps one fresh, because TestFlight builds stop
  working after 90 days.
- The Sideloadly file and the SideStore source are still published, as a fallback.
