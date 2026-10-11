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
    "today.js", "kb.js", "cards.js", "exam.js", "story.js", "fuel.js", "glovebox.js",
    "diy.js", "trees.js", "bulletins.js", "upgrades.js", "live.js", "extras.js",
]

def read(*p):
    with open(os.path.join(SRC, *p), encoding="utf-8") as f:
        return f.read()

def write(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)

def main():
    stamp = time.strftime("%Y.%m.%d-%H%M")
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
    sw_reg = """<script>
if ("serviceWorker" in navigator && location.protocol === "https:") {
  navigator.serviceWorker.register("sw.js").then(function (reg) {
    function offer(w) { var b = document.getElementById("updateBar"); if (!b) return; b.hidden = false; b.querySelector("button").onclick = function () { w.postMessage("skip"); }; }
    if (reg.waiting && navigator.serviceWorker.controller) offer(reg.waiting);
    reg.addEventListener("updatefound", function () { var w = reg.installing; w.addEventListener("statechange", function () { if (w.state === "installed" && navigator.serviceWorker.controller) offer(w); }); });
    setInterval(function () { reg.update().catch(function () {}); }, 30 * 60 * 1000);
  });
  var reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", function () { if (reloaded) return; reloaded = true; location.reload(); });
}
</script>"""
    write(os.path.join(ROOT, "index.html"), pwa_head + body + "\n" + verjs + "\n" + scripts + "\n" + sw_reg + "\n</body>\n</html>\n")

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
    files = {"app.css": os.path.join("dist-artifact", "app.css")}
    for f in js_files:
        write(os.path.join(art, *f.split("/")), read("js", *f.split("/")[1:]))
        files[f] = os.path.join("dist-artifact", *f.split("/"))
    write(os.path.join(art, "files.json"), json.dumps(files, indent=1))
    print("built", ver, "modules:", ", ".join(mods), "data:", ", ".join(DATA))

if __name__ == "__main__":
    main()
