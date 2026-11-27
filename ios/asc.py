"""Checks Kyle's App Store Connect setup before a TestFlight upload (.github/workflows/ios.yml, job testflight).

Reads the API key from the environment (ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_P8; GitHub secrets, never printed),
finds the app's bundle ID (registers it if missing) and the team it belongs to, checks the App Store Connect app
record exists (Apple's API cannot create one), and reports the TestFlight groups. Prints TEAM=<id> on success
(the workflow adds it to GITHUB_ENV). Exits 1 with a plain message saying what is missing.
Needs PyJWT and cryptography. Steps for Kyle: ios/TESTFLIGHT.md.
"""
import json
import os
import sys
import time
import urllib.error
import urllib.request

import jwt

BUNDLE = "com.kfitz.v60garage"
API = "https://api.appstoreconnect.apple.com/v1"


def token():
    now = int(time.time())
    return jwt.encode({"iss": os.environ["ASC_ISSUER_ID"], "iat": now, "exp": now + 900, "aud": "appstoreconnect-v1"},
                      os.environ["ASC_KEY_P8"], algorithm="ES256", headers={"kid": os.environ["ASC_KEY_ID"], "typ": "JWT"})


def call(method, path, body=None):
    req = urllib.request.Request(API + path, method=method, data=json.dumps(body).encode() if body else None,
                                 headers={"Authorization": "Bearer " + token(), "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "replace")[:600]
        if e.code == 401:
            fail("Apple refused the API key (401). Check the three secrets match the key in App Store Connect "
                 "(Users and Access > Integrations > App Store Connect API).")
        if e.code == 403:
            fail("The API key is not allowed to do this (403). Make a key with Admin access. " + detail)
        fail(f"App Store Connect said {e.code} for {method} {path}: {detail}")


def fail(msg):
    print("TestFlight setup: " + msg)
    with open(os.environ.get("GITHUB_STEP_SUMMARY", os.devnull), "a") as s:
        s.write("### TestFlight not ready\n\n" + msg + "\n")
    sys.exit(1)


def main():
    for k in ("ASC_KEY_ID", "ASC_ISSUER_ID", "ASC_KEY_P8"):
        if not os.environ.get(k):
            fail(f"secret {k} is missing.")
    ids = [b for b in call("GET", "/bundleIds?filter[identifier]=" + BUNDLE + "&limit=50")["data"]
           if b["attributes"]["identifier"] == BUNDLE]
    if not ids:
        print("Registering the app ID " + BUNDLE)
        ids = [call("POST", "/bundleIds", {"data": {"type": "bundleIds", "attributes": {
            "identifier": BUNDLE, "name": "V60", "platform": "IOS"}}})["data"]]
    team = ids[0]["attributes"].get("seedId")
    if not team:
        fail("could not read the team ID from the app ID.")
    apps = call("GET", "/apps?filter[bundleId]=" + BUNDLE)["data"]
    apps = [a for a in apps if a["attributes"].get("bundleId") == BUNDLE]
    if not apps:
        fail("the app is not in App Store Connect yet. In App Store Connect: Apps, +, New App, platform iOS, "
             "bundle ID " + BUNDLE + " (step 3 in ios/TESTFLIGHT.md). Apple's API cannot do this step.")
    app = apps[0]
    groups = call("GET", f"/apps/{app['id']}/betaGroups?limit=20")["data"]
    internal = [g["attributes"]["name"] for g in groups if g["attributes"].get("isInternalGroup")]
    print(f"App record: {app['attributes'].get('name')} ({app['id']})")
    print("Internal TestFlight groups: " + (", ".join(internal) if internal else
          "none yet. Builds will upload, but reach the phone only once you are in an internal group (step 5)."))
    print("TEAM=" + team)


if __name__ == "__main__":
    main()
