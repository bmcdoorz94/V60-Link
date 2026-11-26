"""Prints the SideStore / AltStore source for the V60 iPhone app (AltStore source format:
https://faq.altstore.io/developers/make-a-source; SideStore reads the same format).

Run by .github/workflows/ios.yml after each build: every build is a GitHub release tagged ios-<version>.<build>
holding V60-<version>.ipa, and this lists them newest first (AltStore compares the first entry of versions with
the installed app). Needs the GitHub CLI (gh) with a token in GH_TOKEN and GITHUB_REPOSITORY set.
"""
import json
import os
import re
import subprocess

REPO = os.environ.get("GITHUB_REPOSITORY", "bmcdoorz94/V60-Link")
BUNDLE = "com.kfitz.v60garage"  # must match the IPA's Info.plist (ios/project.yml)
BLUETOOTH = "V60 connects to your OBD adapter to read the car, also while the phone is in your pocket."


def releases():
    # one release per line, as compact JSON, across all pages
    out = subprocess.run(["gh", "api", "--paginate", f"repos/{REPO}/releases?per_page=100", "--jq", ".[] | @json"],
                         check=True, capture_output=True, text=True).stdout
    return [json.loads(line) for line in out.splitlines() if line.strip()]


def versions():
    found = []
    for rel in releases():
        m = re.fullmatch(r"ios-(\d+(?:\.\d+)*)\.(\d+)", rel.get("tag_name", ""))
        ipa = next((a for a in rel.get("assets", []) if a["name"].endswith(".ipa")), None)
        if not m or not ipa:
            continue
        version, build = m.group(1), m.group(2)
        found.append({
            "version": version,
            "buildVersion": build,
            "date": (rel.get("published_at") or rel.get("created_at") or "")[:10],
            "downloadURL": ipa["browser_download_url"],
            "size": ipa["size"],
            "localizedDescription": (rel.get("body") or "").strip()[:2000],
            "minOSVersion": "17.0",
        })
    key = lambda v: ([int(x) for x in v["version"].split(".")], int(v["buildVersion"]))
    return sorted(found, key=key, reverse=True)


source = {
    "name": "V60 Garage",
    "identifier": "io.github.bmcdoorz94.v60",
    "subtitle": "Kyle's V60 iPhone app",
    "website": "https://bmcdoorz94.github.io/V60-Link/",
    "iconURL": "https://bmcdoorz94.github.io/V60-Link/icons/icon-512.png",
    "apps": [{
        "name": "V60",
        "bundleIdentifier": BUNDLE,
        "developerName": "Kyle",
        "subtitle": "The Garage, the adapter link and Claude live",
        "localizedDescription": "The V60 Garage with a native link to the OBD adapter that works in the background: "
                                "drive recording, alerts while driving, and the Claude live link to Kyle's PC.",
        "iconURL": "https://bmcdoorz94.github.io/V60-Link/icons/icon-512.png",
        "category": "utilities",
        "appPermissions": {"entitlements": [], "privacy": {"NSBluetoothAlwaysUsageDescription": BLUETOOTH}},
        "versions": versions(),
    }],
    "news": [],
}
print(json.dumps(source, indent=2))
