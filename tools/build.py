#!/usr/bin/env python3
"""Build V60 Garage from src/ into:
  - repo root (GitHub Pages PWA): index.html, app.css, js/*.js, sw.js, manifest.webmanifest, icons/
  - dist-artifact/ (Claude artifact): garage.html plus the same css/js, listed in files.json
Add a feature: drop a file in src/js/modules/ (it registers itself on window.V60_MODULES) and add it to MODULES below.
"""
import json, os, re, shutil, time, hashlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src")

DATA = sorted(f for f in os.listdir(os.path.join(SRC, "js", "data")) if f.endswith(".js"))
MODULES = [
    "today.js", "kb.js", "cards.js", "exam.js", "story.js", "manual.js", "fuel.js", "glovebox.js", "docs.js",
    "diy.js", "trees.js", "bulletins.js", "upgrades.js", "live.js", "extras.js", "skills.js", "sync.js", "ui.js", "scan.js", "guide.js",
]

def read(*p):
    with open(os.path.join(SRC, *p), encoding="utf-8") as f:
        return f.read()

def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(text)

def main():
    stamp = time.strftime("%Y.%m.%d-%H%M", time.gmtime())  # UTC, so a build here and the GitHub build read the same; the header shows it in the phone's time
    mods = [m for m in MODULES if os.path.exists(os.path.join(SRC, "js", "modules", m))]
    js_files = ["js/data/" + d for d in DATA] + ["js/modules/" + m for m in mods] + ["js/core.js"]
    css = "\n".join(read("css", c) for c in ["app.css"] + sorted(f for f in os.listdir(os.path.join(SRC, "css")) if f.endswith(".css") and f != "app.css"))
    body = read("body.html")
    fonts = read("fonts.html").strip()
    h = hashlib.sha1((css + body + "".join(read("js", *f.split("/")[1:]) for f in js_files)).encode()).hexdigest()[:8]
    ver = stamp + "-" + h

    # copy assets
    for f in js_files:
        write(os.path.join(ROOT, *f.split("/")), read("js", *f.split("/")[1:]))
    write(os.path.join(ROOT, "app.css"), css)
    write(os.path.join(ROOT, "link.html"), read("link-legacy.html"))

    scripts = "\n".join('<script src="%s?v=%s"></script>' % (f, h) for f in js_files)
    verjs = '<script>window.V60_VERSION="%s";</script>' % ver

    pwa_head = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>V60 Garage</title>
<meta name="description" content="A workshop, classroom and logbook for one 2016 Volvo V60 T5.">
<meta name="theme-color" content="#13232e">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/icon-180.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="V60 Garage">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
%s
<link rel="stylesheet" href="app.css?v=%s">
</head>
<body>
""" % (fonts, h)
    # Update notice. Bluefy (and other iOS browsers built on WKWebView) has no service worker, so the bar must not depend
    # on one: the page also compares its own version with version.json whenever it is opened or comes back to the front.
    sw_reg = """<script>
(function () {
  var bar = document.getElementById("updateBar"), waiting = null, reloaded = false;
  function offer(w) { if (w) waiting = w; if (!bar) return; bar.hidden = false; bar.querySelector("button").onclick = refresh; }
  function refresh() {
    if (waiting) { waiting.postMessage("skip"); setTimeout(hard, 1500); return; }
    hard();
  }
  /* a fresh address skips the 10-minute browser cache GitHub Pages allows on index.html */
  function hard() { if (reloaded) return; reloaded = true; location.replace(location.pathname + "?u=" + Date.now() + location.hash); }
  try { if (/[?&]u=\\d+/.test(location.search)) history.replaceState(null, "", location.pathname + location.hash); } catch (e) {}
  /* the header's Version chip: when this copy was built, in the phone's own time; tap it to check now */
  var chip = document.getElementById("verChip");
  function when(v) {
    var m = /^(\\d{4})\\.(\\d{2})\\.(\\d{2})-(\\d{2})(\\d{2})/.exec(v || ""); if (!m) return v || "";
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]));
    try { return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }); } catch (e) { return d.toString(); }
  }
  function label(t) { if (chip) chip.textContent = t; }
  var mineTxt = "Version " + when(window.V60_VERSION);
  var last = 0;
  function check(force, tell) {
    if (!/^https?:$/.test(location.protocol) || !window.V60_VERSION) return;
    var now = Date.now(); if (!force && now - last < 60000) return; last = now;
    if (tell) label("Checking...");
    fetch("version.json?t=" + now, { cache: "no-store" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
      if (j && j.v && j.v !== window.V60_VERSION) { offer(); label("New version ready: " + when(j.v)); }
      else if (tell) { label("Up to date · " + when(window.V60_VERSION)); setTimeout(function () { label(mineTxt); }, 4000); }
    }).catch(function () { if (tell) { label("Could not check. Offline?"); setTimeout(function () { label(mineTxt); }, 4000); } });
  }
  window.__v60CheckUpdate = check;
  if (chip && /^https?:$/.test(location.protocol) && window.V60_VERSION) {
    label(mineTxt); chip.hidden = false;
    chip.addEventListener("click", function () { if (bar && !bar.hidden) { refresh(); return; } check(true, true); });
  }
  setTimeout(function () { check(true); }, 2000);
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") check(); });
  window.addEventListener("pageshow", function (e) { if (e.persisted) check(true); });
  window.addEventListener("focus", function () { check(); });
  setInterval(function () { check(true); }, 10 * 60 * 1000);
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("sw.js").then(function (reg) {
      if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
      reg.addEventListener("updatefound", function () { var w = reg.installing; w.addEventListener("statechange", function () { if (w.state === "installed" && navigator.serviceWorker.controller) offer(w); }); });
      setInterval(function () { reg.update().catch(function () {}); }, 30 * 60 * 1000);
    }).catch(function () {});
    navigator.serviceWorker.addEventListener("controllerchange", function () { if (reloaded) return; reloaded = true; location.reload(); });
  }
})();
</script>"""
    write(os.path.join(ROOT, "index.html"), pwa_head + body + "\n" + verjs + "\n" + scripts + "\n" + sw_reg + "\n</body>\n</html>\n")
    write(os.path.join(ROOT, "version.json"), json.dumps({"v": ver}) + "\n")

    shell = ["./", "index.html", "app.css", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-180.png"] + js_files
    sw = """/* V60 Garage service worker, version %s */
var CACHE = "v60-garage-%s";
var SHELL = %s;
self.addEventListener("install", function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL.map(function (u) { return new Request(u, { cache: "reload" }); })); })); });
self.addEventListener("activate", function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE && k.indexOf("v60-garage-") === 0; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener("message", function (e) { if (e.data === "skip") self.skipWaiting(); });
self.addEventListener("fetch", function (e) {
  var req = e.request; if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (req.mode === "navigate") { e.respondWith(fetch(req).then(function (r) { var cp = r.clone(); caches.open(CACHE).then(function (c) { c.put("index.html", cp); }); return r; }).catch(function () { return caches.match("index.html"); })); return; }
  if (url.origin === location.origin) { e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (hit) { return hit || fetch(req); })); return; }
  if (url.hostname === "cdn.jsdelivr.net" && /tesseract|pdfjs-dist/.test(url.pathname)) {
    e.respondWith(caches.open("v60-ocr").then(function (c) { return c.match(req).then(function (hit) { return hit || fetch(req).then(function (r) { if (r.ok) c.put(req, r.clone()); return r; }); }); }));
    return;
  }
  if (/fonts\\.(googleapis|gstatic)\\.com$/.test(url.hostname)) {
    e.respondWith(caches.open(CACHE + "-fonts").then(function (c) { return c.match(req).then(function (hit) { var net = fetch(req).then(function (r) { c.put(req, r.clone()); return r; }).catch(function () { return hit; }); return hit || net; }); }));
  }
});
""" % (ver, ver, json.dumps(shell))
    write(os.path.join(ROOT, "sw.js"), sw)

    manifest = {
        "name": "V60 Garage", "short_name": "V60 Garage", "start_url": "./", "scope": "./", "display": "standalone",
        "background_color": "#edf1f4", "theme_color": "#13232e", "description": "A workshop, classroom and logbook for one 2016 Volvo V60 T5.",
        "icons": [{"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png"}, {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png"}, {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}],
    }
    write(os.path.join(ROOT, "manifest.webmanifest"), json.dumps(manifest, indent=2))

    # artifact variant: title first, no doctype, same relative assets
    art = os.path.join(ROOT, "dist-artifact")
    if os.path.isdir(art): shutil.rmtree(art)
    write(os.path.join(art, "garage.html"), "<title>V60 Garage</title>\n" + fonts + '\n<link rel="stylesheet" href="app.css">\n' + body + "\n" + verjs + "\n" + "\n".join('<script src="%s"></script>' % f for f in js_files) + "\n")
    write(os.path.join(art, "app.css"), css)
    files = {"app.css": "dist-artifact/app.css"}
    for f in js_files:
        write(os.path.join(art, *f.split("/")), read("js", *f.split("/")[1:]))
        files[f] = "dist-artifact/" + f
    write(os.path.join(art, "files.json"), json.dumps(files, indent=1))
    print("built", ver, "modules:", ", ".join(mods), "data:", ", ".join(DATA))

if __name__ == "__main__":
    main()
