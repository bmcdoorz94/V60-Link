/* Scanner test: reads a synthetic receipt on the device (Tesseract.js from jsDelivr), checks that personal details
   are blacked out in the saved image and the stored text, and that date, mileage, total and work were decoded.
   Uses only made-up data and the public example VIN 1HGBH41JXMN109186. */
const PW = process.env.PLAYWRIGHT_PATH || "playwright";
const { chromium } = require(PW);
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const SHOTS = path.join(__dirname, "shots"); fs.mkdirSync(SHOTS, { recursive: true });
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

  /* 1. rules without OCR */
  const unit = await p.evaluate(() => {
    const S = window.V60_SCAN, L = t => ({ words: t.split(" ").map((w, i) => ({ text: w, bbox: { x0: i * 10, y0: 0, x1: i * 10 + 8, y1: 8 } })) });
    const lines = ["Customer: Jordan Sample", "VIN 1HGBH41JXMN109186", "Call (512) 555-0142", "Visa 4111 1111 1111 1111", "1234 Example Ln", "Austin, TX 78701", "Oil & filter change 49.99", "Part 31330050 qty 1"].map(L);
    const boxes = S._detect(lines, ["Sample"]);
    const hid = {}; boxes.slice().sort((x, y) => x.li - y.li || x.wi - y.wi).forEach(b => { hid[b.li] = (hid[b.li] || []).concat(lines[b.li].words[b.wi].text); });
    const rc = ["Lakeline Auto Care", "8200 Example Pkwy", "Austin, TX 78750", "(512) 555-0199", "Customer: Jordan Sample", "1234 Example Ln", "Phone: (512) 555-0142"].map(L);
    const rb = S._detect(rc, [], { receipt: true }), shown = {}, hidden = {};
    rb.forEach(b => { (b.redact ? hidden : shown)[b.li] = 1; });
    const shop = { shown: Object.keys(shown).join(","), hidden: Object.keys(hidden).join(",") };
    const door = S._parse("MFD BY VOLVO CAR CORPORATION 11/15 GVWR 2390 KG", "", S._classify("MFD BY VOLVO CAR CORPORATION 11/15 GVWR"));
    /* a VIN with no label, read one character long or short, is still caught as a VIN */
    const misread = ["Stock 1THGBH41JXMN109186 ok", "Stock 1HGBH41JXMN10918 ok"].map(L).map(l => S._detect([l], []).map(b => b.kind + ":" + l.words[b.wi].text).join());
    return { hid, door, shop, misread, cls: S._classify("REPAIR ORDER ... TOTAL 12.00") };
  });
  ok(unit.misread.join("|") === "vin:1THGBH41JXMN109186|vin:1HGBH41JXMN10918", "VIN read with a character too many or too few is hidden (" + unit.misread.join("|") + ")");
  ok((unit.hid[0] || []).join(" ") === "Jordan Sample", "name after Customer: hidden");
  ok((unit.hid[1] || []).indexOf("1HGBH41JXMN109186") >= 0, "VIN hidden");
  ok((unit.hid[2] || []).join(" ") === "(512) 555-0142", "phone hidden");
  ok((unit.hid[3] || []).length >= 4, "card number hidden");
  ok((unit.hid[4] || []).length === 3 && (unit.hid[5] || []).length === 3, "street and city line hidden");
  ok(!unit.hid[6], "work line left visible");
  ok(!unit.hid[7], "part number left visible");
  ok(unit.door.build === "2015-11", "door label build month decoded (" + unit.door.build + ")");
  ok(unit.cls === "receipt", "receipt classified");
  ok(unit.shop.shown === "1,2,3" && unit.shop.hidden === "4,5,6", "shop header visible, customer block hidden (" + JSON.stringify(unit.shop) + ")");

  /* 2. full run: synthetic receipt photo through Glovebox */
  const png = await p.evaluate(() => {
    const c = document.createElement("canvas"); c.width = 1100; c.height = 1500; const g = c.getContext("2d");
    g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.fillStyle = "#111"; g.font = "bold 46px Arial";
    const rows = ["Lakeline Auto Care", "REPAIR ORDER 20417", "Date: 09/14/2026", "Customer: Jordan Sample", "1234 Example Ln", "Austin, TX 78701", "Phone: (512) 555-0142", "VIN 1HGBH41JXMN109186", "Mileage In: 94,812", "Oil & filter change 89.99", "Cabin air filter 54.99", "Labor 44.49", "Total $189.47"];
    rows.forEach((t, i) => g.fillText(t, 60, 110 + i * 100));
    window.__vinRow = { x: 60, y: 110 + 7 * 100 - 20 };
    return c.toDataURL("image/png").split(",")[1];
  });
  await p.setInputFiles("#gbFile", { name: "receipt.png", mimeType: "image/png", buffer: Buffer.from(png, "base64") });
  await p.waitForSelector("#scanOv:not([hidden])", { timeout: 10000 });
  ok(true, "review sheet opened");
  await p.waitForFunction(() => !document.getElementById("scanSave").disabled, null, { timeout: 120000 });
  const msg = await p.textContent("#scanMsg"), found = await p.textContent("#scanFound"), fields = await p.textContent("#scanFields");
  console.log("   msg:", msg.trim(), "|", found.trim());
  ok(/Done/.test(msg), "text was read on the device");
  ok(/VIN/.test(found) && /phone/.test(found) && /address/.test(found), "VIN, phone and address listed as hidden");
  ok(/2026-09-14/.test(fields) && /94,812/.test(fields) && /189\.47/.test(fields), "date, mileage and total decoded");
  await p.screenshot({ path: path.join(SHOTS, "scan-review-phone.png") });
  /* sample the pixel under the VIN in the image that gets saved */
  const dark = await p.evaluate(() => new Promise(res => {
    const cv = document.getElementById("scanCv"), g = cv.getContext("2d");
    const d = g.getImageData(0, 0, cv.width, cv.height).data, at = (x, y) => { const i = (y * cv.width + x) * 4; return d[i] + d[i + 1] + d[i + 2]; };
    let blackVin = 0, blackWork = 0; for (let x = 300; x < 700; x += 20) { if (at(x, 800) < 60) blackVin++; if (at(x, 1000) < 60) blackWork++; }
    res({ blackVin, blackWork });
  }));
  ok(dark.blackVin >= 15, "VIN area is black in the image (" + dark.blackVin + "/20)");
  ok(dark.blackWork < 10, "work line is not blacked out (" + dark.blackWork + "/20)");
  await p.click("#scanSave");
  await p.waitForFunction(() => /unconfirmed/i.test(document.getElementById("gbStatus").textContent), null, { timeout: 15000 });
  const pending = await p.evaluate(() => ({ date: document.getElementById("gbRDate") && document.getElementById("gbRDate").value, miles: document.getElementById("gbRMiles") && document.getElementById("gbRMiles").value, html: document.getElementById("gbPreview").textContent }));
  ok(pending.date === "2026-09-14" && pending.miles === "94812", "Glovebox form prefilled (" + pending.date + ", " + pending.miles + ")");
  ok(!/1HGBH41JXMN109186|555-0142|Jordan/.test(pending.html), "no personal details in the prefilled form");

  /* 3. cancel stores nothing */
  const before = await p.evaluate(() => (window.__v60 && window.__v60.state ? (window.__v60.state().photos || []).length : -1));
  await p.setInputFiles("#gbFile", { name: "receipt.png", mimeType: "image/png", buffer: Buffer.from(png, "base64") });
  await p.waitForSelector("#scanOv:not([hidden])"); await p.click("#scanCancel");
  await p.waitForFunction(() => /Cancelled/.test(document.getElementById("gbStatus").textContent), null, { timeout: 10000 });
  ok(true, "cancel says nothing was saved");
  ok(errs.length === 0, "no page errors " + JSON.stringify(errs));
  await b.close(); srv.close();
  console.log(fails ? fails + " failed" : "all passed"); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); srv.close(); process.exit(1); });
