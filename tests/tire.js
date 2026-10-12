/* Tire sidewall photos: DOT date, size and age are read on the device; the saved photo carries the reading.
   Synthetic text only. Needs jsDelivr reachable for the OCR engine. */
const PW = process.env.PLAYWRIGHT_PATH || "playwright";
const { chromium } = require(PW);
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
let fails = 0; const ok = (c, m) => { console.log((c ? " ok " : " FAIL ") + m); if (!c) fails++; };
const srv = http.createServer((q, r) => {
  let f = path.join(ROOT, decodeURIComponent(q.url.split("?")[0])); if (f.endsWith("/")) f += "index.html";
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { "content-type": f.endsWith(".js") ? "text/javascript" : f.endsWith(".css") ? "text/css" : "text/html" }); r.end(d); });
}).listen(0);
(async () => {
  const port = srv.address().port;
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errs = []; p.on("pageerror", e => errs.push(e.message));
  await p.addInitScript(() => { window.__V60_TEST = true; });
  await p.goto(`http://localhost:${port}/index.html`); await p.waitForTimeout(800);
  const u = await p.evaluate(() => {
    const S = window.V60_SCAN, yy = String(new Date().getFullYear() % 100).padStart(2, "0");
    const old = S._tireDot("DOT 4H3R FXN 1522"), none = S._tireDot("DOT 4H3R FXN"), badwk = S._tireDot("DOT 4H3R FXN 9922"), fut = S._tireDot("DOT 4H3R FXN 10" + String(+yy + 3));
    const f = S._parse("MICHELIN 215/50R17 95V DOT 4H3R FXN 1522", "", S._classify("215/50R17 DOT 4H3R FXN 1522"));
    const d = S.describe({ kind: "tire", fields: { dot: "0118", size: "225/45R17" }, text: "", read: true }, "sidewall");
    return { old, none, badwk, fut, f, cls: S._classify("215/50R17 DOT 4H3R FXN 1522"), d };
  });
  ok(u.old === "1522", "DOT date read (" + u.old + ")");
  ok(u.none === null && u.badwk === null && u.fut === null, "no date, week 99 and a future year are rejected");
  ok(u.cls === "tire" && u.f.size === "215/50R17" && u.f.dot === "1522", "classified and decoded (" + JSON.stringify(u.f) + ")");
  ok(u.d.concern === "act" && /replace tires at 6 years/.test(u.d.next[0]) && /225\/45R17/.test(u.d.observations.join(" ")), "old tire and different size flagged");
  /* full run: synthetic sidewall photo saved from My V60 */
  const png = await p.evaluate(() => {
    const c = document.createElement("canvas"); c.width = 1100; c.height = 600; const g = c.getContext("2d");
    g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.fillStyle = "#111"; g.font = "bold 60px Arial";
    ["215/50R17 95V", "DOT 4H3R FXN 1522"].forEach((t, i) => g.fillText(t, 60, 180 + i * 150));
    return c.toDataURL("image/png").split(",")[1];
  });
  await p.evaluate(() => __v60.go("my")); await p.selectOption("#phKind", "sidewall");
  await p.setInputFiles("#phFile", { name: "sidewall.png", mimeType: "image/png", buffer: Buffer.from(png, "base64") });
  await p.waitForSelector("#scanOv:not([hidden])", { timeout: 10000 });
  await p.waitForFunction(() => !document.getElementById("scanSave").disabled, null, { timeout: 120000 });
  const fields = await p.textContent("#scanFields"); console.log("   fields:", fields.trim().replace(/\s+/g, " "));
  ok(/week 15 of 2022/.test(fields) && /215\/50R17/.test(fields), "review sheet shows the DOT date and size");
  await p.click("#scanSave");
  await p.waitForFunction(() => (V60.state.photos || []).length === 1, null, { timeout: 20000 });
  const rec = await p.evaluate(() => V60.state.photos[0]);
  ok(rec.kind === "sidewall" && rec.ai && rec.ai.dot === "1522" && rec.ai.device === true, "saved photo carries the reading (" + JSON.stringify(rec.ai && rec.ai.dot) + ")");
  const card = await p.textContent("#phGallery"); ok(/DOT date code 1522/.test(card), "gallery shows the DOT date");
  await p.reload(); await p.waitForTimeout(800); await p.evaluate(() => __v60.go("my"));
  ok(/DOT date code 1522/.test(await p.textContent("#phGallery")), "reading is still there after a reload");
  ok(errs.length === 0, "no page errors " + JSON.stringify(errs));
  await b.close(); srv.close();
  console.log(fails ? fails + " failed" : "all passed"); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); srv.close(); process.exit(1); });
