/* V60 Garage service worker, version 2026.10.15-2349-19716665 */
var CACHE = "v60-garage-2026.10.15-2349-19716665";
var SHELL = ["./", "index.html", "app.css", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-180.png", "js/data/articles.js", "js/data/codebook.js", "js/data/facts.js", "js/data/g1entries.js", "js/data/g1tasks.js", "js/data/manual.js", "js/data/quiz.js", "js/data/toolprices.js", "js/data/track.js", "js/modules/today.js", "js/modules/kb.js", "js/modules/cards.js", "js/modules/story.js", "js/modules/manual.js", "js/modules/track.js", "js/modules/fuel.js", "js/modules/glovebox.js", "js/modules/docs.js", "js/modules/diy.js", "js/modules/trees.js", "js/modules/bulletins.js", "js/modules/upgrades.js", "js/modules/live.js", "js/modules/extras.js", "js/modules/sync.js", "js/modules/ui.js", "js/modules/scan.js", "js/modules/guide.js", "js/core.js"];
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
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.open(CACHE + "-fonts").then(function (c) { return c.match(req).then(function (hit) { var net = fetch(req).then(function (r) { c.put(req, r.clone()); return r; }).catch(function () { return hit; }); return hit || net; }); }));
  }
});
