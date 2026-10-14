/* Auto-read uploads with privacy redaction.
   Every photo added to the app passes through V60_SCAN.process(file, kind) before it is stored or synced:
   1. resize (re-encoding through a canvas drops EXIF and GPS data),
   2. read the text on this device with Tesseract.js (nothing is uploaded to read it),
   3. find personal details (VIN, plate, names after labels, addresses, phone numbers, email, card numbers,
      and the owner's own "always hide" words) and cover them with black boxes,
   4. let the owner tap boxes to show or hide them, or drag to hide anything else,
   5. decode what the photo is (receipt, door-pillar label, registration, insurance card, inspection report)
      and offer the values it read, marked unconfirmed.
   Only the redacted image is returned. The original is never stored.
   First version from Gemini (2026-10-11); rewritten by Claude for multi-word matching, a clean saved image,
   drawing boxes by hand, a pinned Tesseract version, and document decoding. */
(function () {
  var TESS = "5.1.1";
  var TESS_URL = "https://cdn.jsdelivr.net/npm/tesseract.js@" + TESS + "/dist/tesseract.min.js";
  var WORKER_URL = "https://cdn.jsdelivr.net/npm/tesseract.js@" + TESS + "/dist/worker.min.js";
  var PRIVATE_KEY = "v60-scan-private";
  var MAX = 1600, PAD = 4;
  var API = null;

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  /* ---------- OCR engine (loaded on first use, then kept) ---------- */
  var libProm = null, workerProm = null, onProgress = null;
  function loadLib() {
    if (libProm) return libProm;
    libProm = new Promise(function (res, rej) {
      if (window.Tesseract) { res(window.Tesseract); return; }
      var s = document.createElement("script"); s.src = TESS_URL; s.async = true;
      s.onload = function () { window.Tesseract ? res(window.Tesseract) : rej(new Error("The text reader did not load.")); };
      s.onerror = function () { libProm = null; rej(new Error("The text reader could not be downloaded. Check the connection and try again.")); };
      document.head.appendChild(s);
    });
    return libProm;
  }
  function getWorker() {
    if (workerProm) return workerProm;
    workerProm = loadLib().then(function (T) {
      return T.createWorker("eng", 1, { workerPath: WORKER_URL, logger: function (m) { if (onProgress) onProgress(m); } });
    }).catch(function (e) { workerProm = null; throw e; });
    return workerProm;
  }
  function ocr(canvas) {
    return getWorker().then(function (w) { return w.recognize(canvas); }).then(function (r) { return r.data; });
  }
  function linesOf(data) {
    if (data.lines && data.lines.length) return data.lines;
    var out = [];
    (data.blocks || []).forEach(function (b) { (b.paragraphs || []).forEach(function (p) { (p.lines || []).forEach(function (l) { out.push(l); }); }); });
    return out;
  }

  /* ---------- finding personal details ---------- */
  var ADDR = /\b\d{1,6}\s+(?:[NSEW]\.?\s+)?(?:[A-Za-z0-9'.-]+\s+){0,3}(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Ln|Lane|Dr|Drive|Ct|Court|Way|Pkwy|Parkway|Hwy|Highway|Cir|Circle|Trl|Trail|Pl|Place|Loop|Cv|Cove|Pass|Run|Bend|Ter|Terrace)\b\.?(?:\s+(?:Apt|Unit|Ste|Suite|#)\s*[\w-]+)?/gi;
  var CITY = /\b[A-Za-z][A-Za-z .'-]{1,30},\s*[A-Z]{2}\s+\d{5}(?:-\d{4})?\b/g;
  var PHONE = /(?:\+?1[\s.-]?)?\(?\b\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g;
  var EMAIL = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
  var CARD = /\b(?:\d[ -]?){12,18}\d\b/g;
  var MASKED = /(?:[X*•#]{4}[ -]?){1,3}\d{4}\b|\b(?:ending|ends)\s+(?:in\s+)?\d{4}\b|\b(?:visa|mastercard|amex|discover)\b\W{0,3}[X*\d][X*\d -]{3,}/gi;
  var VIN = /\b[A-Z0-9]{17}\b/gi;
  var LABEL = /\b(?:customer(?:\s*name)?|cust\.?|name|bill(?:ed)?\s+to|sold\s+to|ship\s+to|owner|insured|driver|plate|lic(?:ense)?(?:\s*(?:plate|no\.?|number|#))?|tag\s*(?:no\.?|#)|vin|policy(?:\s*(?:no\.?|number|#))?|acct\.?(?:\s*(?:no\.?|#))?|account(?:\s*(?:no\.?|number|#))?|member(?:\s*id)?|card(?:\s*(?:no\.?|number|#))?|phone|tel|cell|e-?mail|address|addr)\b\s*[:#.]?/gi;
  var KIND_NAME = { vin: "VIN", phone: "phone number", email: "email address", card: "card number", address: "address", label: "word after a label", mine: "word on your hide list", hand: "hidden by you", shop: "shop detail" };

  function luhn(d) { var s = 0, alt = false; for (var i = d.length - 1; i >= 0; i--) { var n = +d[i]; if (alt) { n *= 2; if (n > 9) n -= 9; } s += n; alt = !alt; } return s % 10 === 0; }
  function vinLike(t) { var digits = (t.match(/\d/g) || []).length, letters = (t.match(/[A-Z]/gi) || []).length; return digits >= 3 && letters >= 2; }
  function privateWords() {
    var list = [];
    try { list = JSON.parse(localStorage.getItem(PRIVATE_KEY) || "[]"); } catch (e) {}
    if (!Array.isArray(list)) list = [];
    try { /* VIN, plate and policy number typed into the Glovebox are always hidden too */
      var D = API && API.mod("glove") && API.mod("glove").docs; if (D) ["vin", "plate", "insPolicy"].forEach(function (k) { if (D[k]) list.push(D[k]); });
    } catch (e) {}
    return list.map(function (s) { return String(s).trim(); }).filter(function (s) { return s.length >= 3; });
  }
  /* lines: [{words:[{text,bbox:{x0,y0,x1,y1}}]}] -> boxes [{x0,y0,x1,y1,kind,redact,words:[li,wi]}] */
  /* On a receipt, the shop's own name, address, phone and email sit in the header above the customer block.
     Kyle's choice (2026-10-11): leave the shop's details visible. They are outlined, so one tap hides them. */
  var CUSTOMER = /\b(customer|cust\.?|name|bill(?:ed)?\s+to|sold\s+to|ship\s+to|owner|insured|driver|vin|plate|lic(?:ense)?|policy|acct|account|member|card)\b/i;
  function shopHeader(lines) {
    for (var i = 0; i < lines.length; i++) if (CUSTOMER.test((lines[i].words || []).map(function (w) { return w.text; }).join(" "))) return i;
    return Math.min(6, Math.ceil(lines.length * 0.3));
  }
  function detect(lines, mine, opt) {
    var marks = {}; /* "li:wi" -> kind */
    function markSpan(li, offs, a, b, kind) { offs.forEach(function (o, wi) { if (o[1] > a && o[0] < b && !marks[li + ":" + wi]) marks[li + ":" + wi] = kind; }); }
    lines.forEach(function (ln, li) {
      var words = ln.words || [], s = "", offs = [];
      words.forEach(function (w, wi) { if (wi) s += " "; offs.push([s.length, s.length + w.text.length]); s += w.text; });
      function run(re, kind, test) { re.lastIndex = 0; var m; while ((m = re.exec(s))) { if (!test || test(m[0])) markSpan(li, offs, m.index, m.index + m[0].length, kind); if (!m[0].length) re.lastIndex++; } }
      run(VIN, "vin", vinLike);
      run(EMAIL, "email");
      run(MASKED, "card");
      run(CARD, "card", function (t) { var d = t.replace(/\D/g, ""); return d.length >= 13 && d.length <= 19 && luhn(d); });
      run(PHONE, "phone", function (t) { return t.replace(/\D/g, "").length >= 10; });
      run(ADDR, "address");
      run(CITY, "address");
      var low = s.toLowerCase().replace(/\s+/g, " ");
      mine.forEach(function (p) {
        var q = p.toLowerCase().replace(/\s+/g, " "), i = low.indexOf(q);
        while (i >= 0) { markSpan(li, offs, i, i + q.length, "mine"); i = low.indexOf(q, i + 1); }
        var compact = q.replace(/[\s-]/g, ""); /* also match a VIN or plate the reader split or spaced differently */
        if (compact.length >= 5) words.forEach(function (w, wi) { var t = w.text.toLowerCase().replace(/[\s-]/g, ""); if (t.length >= 6 && compact.indexOf(t) >= 0 && /\d/.test(t)) markSpan(li, offs, offs[wi][0], offs[wi][1], "mine"); });
      });
      LABEL.lastIndex = 0; var m;
      while ((m = LABEL.exec(s))) {
        var end = m.index + m[0].length, after = offs.filter(function (o) { return o[0] >= end; });
        if (after.length) markSpan(li, offs, after[0][0], after[Math.min(after.length, 8) - 1][1], "label");
        else if (lines[li + 1]) { var nw = lines[li + 1].words || [], n = Math.min(nw.length, 6); for (var k = 0; k < n; k++) if (!marks[(li + 1) + ":" + k]) marks[(li + 1) + ":" + k] = "label"; }
      }
    });
    var head = opt && opt.receipt ? shopHeader(lines) : 0;
    return Object.keys(marks).map(function (key) {
      var p = key.split(":"), w = lines[+p[0]].words[+p[1]], b = w.bbox, kind = marks[key];
      var shop = +p[0] < head && (kind === "phone" || kind === "email" || kind === "address" || kind === "label");
      return { x0: b.x0 - PAD, y0: b.y0 - PAD, x1: b.x1 + PAD, y1: b.y1 + PAD, kind: shop ? "shop" : kind, redact: !shop, li: +p[0], wi: +p[1] };
    });
  }
  function redactedText(lines, boxes) {
    var hid = {}; boxes.forEach(function (b) { if (b.redact && b.li != null) hid[b.li + ":" + b.wi] = 1; });
    return lines.map(function (ln, li) { return (ln.words || []).map(function (w, wi) { return hid[li + ":" + wi] ? "■■■" : w.text; }).join(" "); }).join("\n");
  }

  /* ---------- decoding what the photo is ---------- */
  var MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function ymd(y, m, d) {
    y = +y; m = +m; d = +d; if (y < 100) y += 2000;
    if (!(m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 2013 && y <= new Date().getFullYear() + 2)) return null;
    return y + "-" + pad2(m) + "-" + pad2(d);
  }
  function datesIn(t) {
    var out = [], m, re = /\b(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})\b|\b(\d{4})-(\d{2})-(\d{2})\b|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})\b/gi;
    while ((m = re.exec(t))) { var v = m[1] ? ymd(m[3], m[1], m[2]) : (m[4] ? ymd(m[4], m[5], m[6]) : ymd(m[9], MONTHS[m[7].toLowerCase().slice(0, 3)], m[8])); if (v) out.push({ v: v, at: m.index }); }
    return out;
  }
  var ITEM_WORDS = [
    ["cabin", /cabin\s*(air\s*)?filter|pollen\s*filter/i],
    ["airfilter", /(engine\s*)?air\s*filter|air\s*cleaner/i],
    ["oil", /oil\s*(and|&)\s*filter|oil\s*change|\blof\b|synthetic\s*oil|0w-?20|oil\s*filter|engine\s*oil/i],
    ["brakefluid", /brake\s*fluid/i],
    ["plugs", /spark\s*plugs?/i],
    ["brakes", /brake\s*pads?|rotors?|brake\s*(inspection|service)|\bdiscs?\b/i],
    ["timingbelt", /timing\s*belt/i],
    ["coolant", /coolant|antifreeze/i],
    ["trans", /transmission|\batf\b|trans\s*fluid/i],
    ["tires", /\btires?\b|rotat(e|ion)|wheel\s*balanc|alignment/i]
  ];
  function classify(t) {
    if (/\b(mfd|manufactured|gvwr|gawr|conforms to all applicable)\b/i.test(t)) return "door";
    if (/\bDOT\b/.test(t) && (/\d{3}\s*\/\s*\d{2}/.test(t) || /treadwear|traction|temperature|tubeless/i.test(t))) return "tire";
    if (/vehicle history report|carfax|autocheck|history-based value/i.test(t)) return "history";
    if (/vehicle inspection|inspection report|inspection history|vehicle test detail|emissions test|overall result|readiness|inspection station/i.test(t)) return "inspection";
    if (/safety recall|recall notice|recall campaign|nhtsa campaign|campaign (no|number)|\b\d{2}V-?\d{3}\b/i.test(t)) return "recall";
    if (/service contract|vehicle service agreement|extended warranty|warranty coverage|coverage period|deductible|powertrain coverage|mechanical breakdown/i.test(t)) return "warranty";
    if (/certificate of title|title number|title no\b|lienholder|lien holder/i.test(t)) return "title";
    if (/registration|registr\.|renewal notice|txdmv|registration receipt/i.test(t)) return "registration";
    if (/insurance|policy\s*(no|number|#)|insured|proof of (financial responsibility|coverage)/i.test(t)) return "insurance";
    if (/owner'?s manual|owners manual|volvo car usa|see your retailer/i.test(t) && !/total|invoice/i.test(t)) return "manual";
    if (/total|subtotal|labor|invoice|repair order|\bqty\b|parts/i.test(t)) return "receipt";
    return "photo";
  }
  /* DOT code: the last four digits are the week and year made. Take the last valid group after "DOT". */
  function tireDot(text) {
    var m = /\bDOT\b([^\n]*)(?:\n([^\n]*))?/i.exec(text); if (!m) return null;
    var yy = new Date().getFullYear() % 100, found = null, g, re = /(?:^|[^\d])(\d{4})(?!\d)/g, tail = (m[1] || "") + " " + (m[2] || "");
    while ((g = re.exec(tail))) { var wk = +g[1].slice(0, 2), y = +g[1].slice(2); if (wk >= 1 && wk <= 53 && y >= 10 && y <= yy) found = g[1]; }
    return found;
  }
  function dotYears(code) { var m = /^(\d{2})(\d{2})$/.exec(String(code || "")); if (!m) return null; var made = new Date(2000 + +m[2], 0, 1 + (+m[1] - 1) * 7); return (Date.now() - made.getTime()) / (365.25 * 86400000); }
  /* What the review adds to a saved photo when no Claude is available: only things read from the picture, always unconfirmed. */
  function describe(res, photoKind) {
    if (!res || !res.read && !res.fields) return null;
    var f = res.fields || {}, obs = [], out = { summary: "Read on this phone. Unconfirmed: check it against the car.", observations: obs, dot: null, rating: null, concern: "unknown", next: [], device: true };
    if (res.kind === "tire") {
      if (f.dot) { var a = dotYears(f.dot); out.dot = f.dot; obs.push("DOT date code " + f.dot + ": week " + +f.dot.slice(0, 2) + " of 20" + f.dot.slice(2) + (a != null ? ", about " + a.toFixed(1) + " years old" : "")); if (a != null && a >= 6) { out.concern = "act"; out.next.push("Volvo's manual says to replace tires at 6 years from the date made. Get this tire inspected."); } }
      else obs.push("The DOT date could not be read. Photograph the sidewall close up with light from the side, and make sure the full code after DOT is in the frame.");
      if (f.size) obs.push("Size read: " + f.size + (f.size !== "215/50R17" ? " (the Garage lists 215/50R17; check the sidewall)" : ""));
      return out;
    }
    if (res.kind === "door") {
      if (f.build) { obs.push("Build month read from the label: " + f.build + ". Bulletins uses it to tell which production ranges cover this car."); return out; }
      obs.push("The build date could not be read. Photograph the label straight on, with the whole label in the frame."); return out;
    }
    if (/^(dash|fluid|bay|label)$/.test(photoKind || "") && res.text) {
      var seen = {}, lines = res.text.split("\n").map(function (l) { return l.replace(/[^\w\s\/.:%\-]/g, " ").replace(/\s+/g, " ").trim(); }).filter(function (l) { var letters = (l.match(/[a-z]/gi) || []).length; return l.length >= 6 && letters / l.length >= 0.6 && !/■/.test(l) && !seen[l.toLowerCase()] && (seen[l.toLowerCase()] = 1); });
      if (lines.length) { out.summary = "Text read on this phone, unconfirmed. This is a text read, not an inspection."; lines.slice(0, 6).forEach(function (l) { obs.push("Text: " + l.slice(0, 80)); }); return out; }
    }
    return null;
  }
  function parse(text, safeText, kind) {
    var f = {}, dates = datesIn(text);
    if (kind === "receipt") {
      if (dates.length) f.date = dates[0].v;
      var mi = text.match(/(?:mileage|miles|odo(?:meter)?|mi\.?\s*in|in\s*mileage)\D{0,14}(\d{1,3}(?:,\d{3})+|\d{4,6})/i);
      if (mi) { var n = +mi[1].replace(/\D/g, ""); if (n >= 1000 && n <= 400000) f.miles = n; }
      var tot = null, tre = /\b(?:grand\s+)?total\b[^\d$\n]{0,24}\$?\s*(\d{1,3}(?:,\d{3})*\.\d{2})/gi, tm;
      while ((tm = tre.exec(text))) tot = tm[1];
      if (tot) f.total = +tot.replace(/,/g, "");
      var safeLines = safeText.split("\n");
      for (var i = 0; i < Math.min(safeLines.length, 5); i++) { var L = safeLines[i].trim(); if (L.length >= 4 && /[a-z]{3}/i.test(L) && L.indexOf("■") < 0 && !/invoice|receipt|repair order|date|page|customer/i.test(L)) { f.shop = L.slice(0, 80); break; } }
      var items = [];
      safeLines.forEach(function (ln) { for (var k = 0; k < ITEM_WORDS.length; k++) { if (ITEM_WORDS[k][1].test(ln) && !(ITEM_WORDS[k][0] === "airfilter" && /cabin/i.test(ln))) { items.push({ desc: ln.trim().slice(0, 120), key: ITEM_WORDS[k][0] }); break; } } });
      if (items.length) f.items = items.slice(0, 20);
    } else if (kind === "door") {
      var b = text.match(/(?:mfd|manufactured|built|date)[^\d\n]{0,30}(\d{1,2})\s*[\/.-]\s*(\d{2,4})\b/i);
      if (b) { var y = +b[2]; if (y < 100) y += 2000; var mo = +b[1]; if (mo >= 1 && mo <= 12 && y >= 2013 && y <= 2016) f.build = y + "-" + pad2(mo); }
    } else if (kind === "registration" || kind === "insurance") {
      var ex = text.match(/(?:exp(?:ires|iration)?|valid\s+(?:thru|through|until)|renew(?:al)?\s*(?:date|by)?)\W{0,4}([^\n]{0,24})/i), ed = ex ? datesIn(ex[1]) : [];
      if (!ed.length && dates.length) ed = [dates[dates.length - 1]];
      if (ed.length) f.expires = ed[0].v;
    } else if (kind === "inspection") {
      var td = text.match(/test\s*date\W{0,4}([^\n]{0,24})/i), tdd = td ? datesIn(td[1]) : [];
      if (tdd.length) f.date = tdd[0].v; else if (dates.length) f.date = dates[0].v;
      var om = text.match(/odometer\D{0,12}(\d{1,3}(?:,\d{3})+|\d{3,6})\b/i); if (om) { var on = +om[1].replace(/\D/g, ""); if (on >= 1 && on <= 400000) f.miles = on; }
      var rr = text.match(/overall\s*result\W{0,4}(pass|fail)/i) || text.match(/\b(passed|failed)\b/i); if (rr) f.result = /pass/i.test(rr[1]) ? "pass" : "fail";
      var sn = text.match(/station\s*name\W{0,4}([^\n]{3,60})/i); if (sn) f.station = sn[1].replace(/\s+(overall|test|tx dot).*$/i, "").trim().slice(0, 60);
      var tt = text.match(/test\s*type\W{0,4}([^\n]{3,40})/i); if (tt) f.type = tt[1].replace(/\s+(tx dot|waiver).*$/i, "").trim().slice(0, 40);
      var codes = {}, cm, cre = /\b([PBCU][0-3][0-9A-F]{3})\b/g; while ((cm = cre.exec(text))) codes[cm[1].toUpperCase()] = 1; var cl = Object.keys(codes); if (cl.length) f.codes = cl.slice(0, 10);
      var mil = text.match(/mil\s*(?:command\s*status|engine\s*on)\W{0,4}(pass|fail|yes|no)/i); if (mil) f.mil = mil[1].toLowerCase();
    } else if (kind === "recall") {
      var camp = text.match(/\b(\d{2}V-?\d{3})\b/); if (camp) f.campaign = camp[1].replace("-", "");
      var vr = text.match(/\b(R\d{5})\b/); if (vr) f.volvo = vr[1];
      if (dates.length) f.date = dates[0].v;
      var subj = text.match(/(?:subject|re|regarding)\W{0,4}([^\n]{6,100})/i); if (subj) f.subject = subj[1].trim().slice(0, 100);
    } else if (kind === "warranty") {
      var prov = safeText.split("\n").map(function (l) { return l.trim(); }).filter(function (l) { return l.length >= 4 && /[a-z]{3}/i.test(l) && l.indexOf("■") < 0 && !/contract|agreement|page|date|customer/i.test(l); })[0]; if (prov) f.provider = prov.slice(0, 60);
      var sd = text.match(/(?:effective|start|purchase|contract)\s*date\W{0,4}([^\n]{0,24})/i), sdd = sd ? datesIn(sd[1]) : []; if (sdd.length) f.start = sdd[0].v; else if (dates.length) f.start = dates[0].v;
      var mo = text.match(/(\d{1,3})\s*months?/i); if (mo) f.months = +mo[1];
      var mls = text.match(/(\d{2,3},\d{3}|\d{5,6})\s*miles/i); if (mls) f.miles = +mls[1].replace(/,/g, "");
      var dd = text.match(/deductible\D{0,12}\$?\s*(\d{1,4})\b/i); if (dd) f.deductible = +dd[1];
      var ed = text.match(/(?:expir(?:es|ation)|end)\s*(?:date)?\W{0,4}([^\n]{0,24})/i), edd = ed ? datesIn(ed[1]) : []; if (edd.length) f.expires = edd[0].v;
    } else if (kind === "title") {
      if (dates.length) f.issued = dates[0].v;
      f.lien = /lien\s*holder|lienholder|first lien/i.test(text) && !/no\s+liens?|lien\s*holder\W{0,4}none/i.test(text);
      var st = text.match(/\b(texas|new york|florida|california|[A-Z][a-z]+)\s+(?:certificate\s+of\s+)?title\b/i); if (st) f.state = st[1];
    } else if (kind === "history") {
      var pts = [], L = text.split("\n");
      L.forEach(function (ln) { var d = datesIn(ln); var o = ln.match(/\b(\d{1,3},\d{3}|\d{4,6})\b(?=[^\n]{0,12}\b(?:mi|miles|odometer)|\s*$)/i); if (d.length && o) { var n = +o[1].replace(/\D/g, ""); if (n >= 100 && n <= 400000) pts.push({ date: d[0].v, miles: n }); } });
      if (pts.length) f.points = pts.slice(0, 40);
      var own = text.match(/(\d+)\s*(?:previous\s+)?owners?/i); if (own) f.owners = +own[1];
    } else if (kind === "manual") {
      var pg = text.match(/\bpage\s*(\d{1,3})\b/i); if (pg) f.page = +pg[1];
    } else if (kind === "tire") {
      var sz = text.match(/\b(\d{3})\s*\/\s*(\d{2})\s*[A-Z]{0,2}\s*R?\s*(\d{2})\b/);
      if (sz) f.size = sz[1] + "/" + sz[2] + "R" + sz[3];
      f.dot = tireDot(text);
    }
    return f;
  }

  /* ---------- the review sheet ---------- */
  var S = null; /* current session */
  function ensureUI() {
    if ($("scanOv")) return;
    var d = document.createElement("div");
    d.innerHTML = '<div class="scanov" id="scanOv" role="dialog" aria-modal="true" aria-labelledby="scanH" hidden><div class="scanbox">' +
      '<p class="ans-k" id="scanKind">Photo</p><h2 id="scanH">Check what gets hidden</h2>' +
      '<p class="status" id="scanMsg" role="status"></p>' +
      '<div class="scanimg"><canvas id="scanCv" aria-label="Your photo. Black boxes are hidden before saving."></canvas></div>' +
      '<p class="status">Black boxes are hidden before the photo is saved. Tap a box to show or hide it. Drag across the photo to hide anything else.</p>' +
      '<div id="scanFound"></div><div id="scanFields"></div>' +
      '<div class="row"><button type="button" id="scanSave" disabled>Save photo</button><button type="button" class="quiet" id="scanUndo" hidden>Undo last box</button><button type="button" class="quiet" id="scanCancel">Cancel</button></div>' +
      '<details class="scanmine"><summary>Words to always hide</summary><p class="status">One per line, for example your name, street or plate. Kept only on this device, never synced. The VIN, plate and policy number in Glovebox are always hidden too.</p><textarea id="scanMine" rows="3" autocomplete="off" autocapitalize="off" spellcheck="false"></textarea><div class="row"><button type="button" class="quiet" id="scanMineSave">Save list</button></div></details>' +
      "</div></div>";
    document.body.appendChild(d.firstElementChild);
    $("scanCancel").addEventListener("click", function () { finish(null); });
    $("scanSave").addEventListener("click", save);
    $("scanUndo").addEventListener("click", function () { if (!S) return; for (var i = S.boxes.length - 1; i >= 0; i--) if (S.boxes[i].kind === "hand") { S.boxes.splice(i, 1); break; } draw(); summary(); });
    $("scanMineSave").addEventListener("click", function () {
      var v = $("scanMine").value.split("\n").map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 40);
      try { localStorage.setItem(PRIVATE_KEY, JSON.stringify(v)); } catch (e) {}
      if (S && S.lines) { var keep = S.boxes.filter(function (b) { return b.kind === "hand"; }); S.boxes = detect(S.lines, privateWords(), { receipt: S.kind === "receipt" }).concat(keep); draw(); summary(); }
      $("scanMsg").textContent = "List saved on this device.";
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && S && !$("scanOv").hidden) finish(null); });
    var cv = $("scanCv"), drag = null;
    function pt(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * cv.width / r.width, y: (e.clientY - r.top) * cv.height / r.height, cx: e.clientX, cy: e.clientY }; }
    cv.addEventListener("pointerdown", function (e) { if (!S) return; e.preventDefault(); drag = { a: pt(e), b: pt(e) }; try { cv.setPointerCapture(e.pointerId); } catch (x) {} });
    cv.addEventListener("pointermove", function (e) { if (!drag) return; drag.b = pt(e); draw(drag); });
    cv.addEventListener("pointerup", function (e) {
      if (!drag || !S) return; var a = drag.a, b = pt(e); drag = null;
      if (Math.abs(b.cx - a.cx) < 8 && Math.abs(b.cy - a.cy) < 8) {
        for (var i = S.boxes.length - 1; i >= 0; i--) { var x = S.boxes[i]; if (a.x >= x.x0 && a.x <= x.x1 && a.y >= x.y0 && a.y <= x.y1) { if (x.kind === "hand") S.boxes.splice(i, 1); else x.redact = !x.redact; break; } }
      } else S.boxes.push({ x0: Math.min(a.x, b.x), y0: Math.min(a.y, b.y), x1: Math.max(a.x, b.x), y1: Math.max(a.y, b.y), kind: "hand", redact: true });
      draw(); summary();
    });
    cv.addEventListener("pointercancel", function () { drag = null; draw(); });
  }
  function draw(drag) {
    var cv = $("scanCv"), c = cv.getContext("2d");
    c.drawImage(S.base, 0, 0);
    var lw = Math.max(2, cv.width / 400);
    S.boxes.forEach(function (b) {
      if (b.redact) { c.fillStyle = "#000"; c.fillRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0); c.strokeStyle = "#ffc93c"; c.lineWidth = lw; c.setLineDash([]); c.strokeRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0); }
      else { c.strokeStyle = "#ffc93c"; c.lineWidth = lw; c.setLineDash([lw * 3, lw * 2]); c.strokeRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0); c.setLineDash([]); }
    });
    if (drag) { c.fillStyle = "rgba(0,0,0,.6)"; c.fillRect(Math.min(drag.a.x, drag.b.x), Math.min(drag.a.y, drag.b.y), Math.abs(drag.b.x - drag.a.x), Math.abs(drag.b.y - drag.a.y)); }
  }
  function summary() {
    var n = {}, shown = 0;
    S.boxes.forEach(function (b) { if (b.redact) n[b.kind] = (n[b.kind] || 0) + 1; else shown++; });
    var PL = { vin: "VINs", phone: "phone numbers", email: "email addresses", card: "card numbers", address: "address words", label: "words after a label", mine: "words on your hide list", hand: "hidden by you" };
    var parts = Object.keys(n).map(function (k) { return n[k] + " " + (n[k] > 1 ? PL[k] : KIND_NAME[k]); });
    $("scanFound").innerHTML = S.lines ? '<p><b>' + (parts.length ? "Hidden: " + esc(parts.join(", ")) : "Nothing personal found") + "</b>" + (shown ? '<span class="status"> · ' + (S.boxes.some(function (b) { return b.kind === "shop" && !b.redact; }) ? "the shop's own details are left visible (outlined); tap to hide them" : shown + " shown on purpose") + "</span>" : "") + "</p>" : "";
    $("scanUndo").hidden = !S.boxes.some(function (b) { return b.kind === "hand"; });
    if (S.lines) { S.text = redactedText(S.lines, S.boxes); }
  }
  var KIND_TITLE = { receipt: "Service receipt", door: "Door-pillar label", registration: "Registration", insurance: "Insurance card", inspection: "Inspection report", tire: "Tire sidewall", photo: "Photo", recall: "Recall letter", warranty: "Service contract or warranty", title: "Title", history: "Vehicle history report", manual: "Manual page" };
  function fieldsUI() {
    var f = S.fields, k = S.kind, rows = [], apply = [];
    if (k === "receipt") {
      if (f.date) rows.push(["Date", f.date]); if (f.miles) rows.push(["Odometer", f.miles.toLocaleString() + " mi"]); if (f.shop) rows.push(["Shop", f.shop]); if (f.total != null) rows.push(["Total", "$" + f.total.toFixed(2)]);
      (f.items || []).forEach(function (it) { var item = API && API.ITEMS.filter(function (x) { return x.key === it.key; })[0]; rows.push(["Work", (item ? item.name + ": " : "") + it.desc]); });
    }
    if (k === "door" && f.build) { rows.push(["Build month", f.build]); apply.push(["build", "Save " + f.build + " as the build month in Bulletins"]); }
    if (k === "registration" && f.expires) { rows.push(["Expires", f.expires]); apply.push(["regExp", "Save " + f.expires + " as the registration expiry in Glovebox"]); }
    if (k === "insurance" && f.expires) { rows.push(["Renews", f.expires]); apply.push(["insRenew", "Save " + f.expires + " as the insurance renewal in Glovebox"]); }
    if (k === "inspection") { if (f.date) rows.push(["Inspected", f.date]); if (f.miles) rows.push(["Odometer", f.miles.toLocaleString() + " mi"]); if (f.result) rows.push(["Result", f.result]); if (f.station) rows.push(["Station", f.station]); if (f.codes) rows.push(["Codes on file", f.codes.join(", ")]); }
    if (k === "recall") { if (f.campaign) rows.push(["NHTSA campaign", f.campaign]); if (f.volvo) rows.push(["Volvo recall", f.volvo]); if (f.subject) rows.push(["Subject", f.subject]); }
    if (k === "warranty") { if (f.provider) rows.push(["Provider", f.provider]); if (f.start) rows.push(["Start", f.start]); if (f.months) rows.push(["Term", f.months + " months" + (f.miles ? " / " + f.miles.toLocaleString() + " mi" : "")]); if (f.deductible != null) rows.push(["Deductible", "$" + f.deductible]); }
    if (k === "title") { if (f.issued) rows.push(["Issued", f.issued]); rows.push(["Lien", f.lien ? "a lienholder is listed" : "none found"]); }
    if (k === "history" && f.points) rows.push(["Odometer readings", f.points.length + " found, " + f.points[0].date + " to " + f.points[f.points.length - 1].date]);
    if (k === "tire") { if (f.dot) { var ay = dotYears(f.dot); rows.push(["Made", "week " + +f.dot.slice(0, 2) + " of 20" + f.dot.slice(2) + (ay != null ? " (about " + ay.toFixed(1) + " years old)" : "")]); } if (f.size) rows.push(["Size", f.size]); if (!f.dot && S.lines) rows.push(["DOT date", "not read: photograph the code close up with side light"]); }
    var h = "";
    if (rows.length) h += '<div class="scanread"><p class="ans-k">What it read <span class="pill watch">Unconfirmed</span></p><dl class="kv">' + rows.map(function (r) { return "<dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd>"; }).join("") + "</dl></div>";
    else if (S.lines && k !== "photo") h += '<p class="status">No dates or numbers could be read clearly. A flatter, brighter photo helps.</p>';
    if (apply.length) h += apply.map(function (a) { return '<label class="inl"><input type="checkbox" data-scanapply="' + a[0] + '" checked> ' + esc(a[1]) + " (check it against the paper)</label>"; }).join("");
    if (k === "receipt" && S.hint !== "receipt") h += '<p class="status">This looks like a service receipt. To log the work, add it in Glovebox, then Add a receipt.</p>';
    $("scanFields").innerHTML = h;
  }
  function applyChecked() {
    if (!API) return;
    var did = false;
    document.querySelectorAll("[data-scanapply]").forEach(function (cb) {
      if (!cb.checked) return; var k = cb.getAttribute("data-scanapply");
      if (k === "build") { var t = API.mod("tsb") || { build: "", mark: {} }; t.build = S.fields.build; API.setMod("tsb", t); did = true; }
      else { var g = API.mod("glove") || { docs: {}, contract: {}, tools: {}, receipts: [] }; g.docs = g.docs || {}; g.docs[k] = S.fields.expires; API.setMod("glove", g); did = true; }
    });
    if (did) { API.save(); try { API.renderAll(); } catch (e) {} }
  }
  function save() {
    if (!S || $("scanSave").disabled) return;
    var out = document.createElement("canvas"); out.width = S.base.width; out.height = S.base.height;
    var c = out.getContext("2d"); c.drawImage(S.base, 0, 0); c.fillStyle = "#000";
    S.boxes.forEach(function (b) { if (b.redact) c.fillRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0); });
    applyChecked();
    out.toBlob(function (blob) {
      if (!blob) { $("scanMsg").textContent = "The photo could not be saved. Try again."; return; }
      finish({ blob: blob, kind: S.kind, fields: S.fields, text: S.text || "", hidden: S.boxes.filter(function (b) { return b.redact; }).length, read: !!S.lines });
    }, "image/jpeg", 0.85);
  }
  function finish(result) {
    var s = S; S = null; onProgress = null;
    $("scanOv").hidden = true; document.documentElement.classList.remove("scanning");
    if (s && s.back && s.back.focus) try { s.back.focus(); } catch (e) {}
    if (!s) return;
    if (result) s.res(result); else { var e = new Error("Cancelled. Nothing was saved."); e.code = "cancelled"; s.rej(e); }
  }
  function loadImage(file) {
    return new Promise(function (res, rej) {
      var img = new Image(), u = URL.createObjectURL(file);
      img.onload = function () {
        var s = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight)), c = document.createElement("canvas");
        c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u); res(c);
      };
      img.onerror = function () { URL.revokeObjectURL(u); rej(new Error("That image could not be read. Try a JPEG or PNG.")); };
      img.src = u;
    });
  }

  window.V60_SCAN = {
    /* kind: the caller's hint ("receipt", "door", "proof", "photo", or a photo kind). Resolves {blob, kind, fields, text, hidden, read};
       rejects with code "cancelled" when the owner cancels. */
    process: function (file, kind) {
      ensureUI();
      if (S) finish(null);
      return loadImage(file).then(function (base) {
        return new Promise(function (res, rej) {
          S = { res: res, rej: rej, base: base, boxes: [], lines: null, fields: {}, kind: kind === "receipt" || kind === "door" ? kind : kind === "sidewall" ? "tire" : "photo", hint: kind, text: "", back: document.activeElement };
          var cv = $("scanCv"); cv.width = base.width; cv.height = base.height; cv.style.width = "min(100%, calc(60vh * " + (base.width / base.height).toFixed(4) + "))"; draw();
          $("scanKind").textContent = KIND_TITLE[S.kind] || "Photo"; $("scanFound").innerHTML = ""; $("scanFields").innerHTML = "";
          $("scanMine").value = (function () { try { return (JSON.parse(localStorage.getItem(PRIVATE_KEY) || "[]") || []).join("\n"); } catch (e) { return ""; } })();
          $("scanSave").disabled = true; $("scanUndo").hidden = true;
          $("scanMsg").textContent = "Reading the text on this phone. Nothing is uploaded to read it.";
          $("scanOv").hidden = false; document.documentElement.classList.add("scanning"); $("scanCancel").focus();
          var me = S;
          onProgress = function (m) { if (S !== me) return; if (m.status === "recognizing text") $("scanMsg").textContent = "Reading the text: " + Math.round((m.progress || 0) * 100) + "%"; else if (/load|initializ/i.test(m.status || "")) $("scanMsg").textContent = "Getting the text reader ready (the first time downloads it)…"; };
          ocr(base).then(function (data) {
            if (S !== me) return;
            S.lines = linesOf(data);
            var raw = S.lines.map(function (l) { return (l.words || []).map(function (w) { return w.text; }).join(" "); }).join("\n");
            var auto = classify(raw);
            if (S.kind === "photo" && auto !== "photo") S.kind = auto;
            S.boxes = detect(S.lines, privateWords(), { receipt: S.kind === "receipt" }).concat(S.boxes.filter(function (b) { return b.kind === "hand"; }));
            summary();
            S.fields = parse(raw, S.text, S.kind);
            $("scanKind").textContent = KIND_TITLE[S.kind] || "Photo";
            draw(); fieldsUI();
            $("scanMsg").textContent = S.lines.length ? "Done. Check the black boxes, then save." : "No text found. Drag across anything you want hidden, then save.";
          }).catch(function (e) {
            if (S !== me) return;
            $("scanMsg").textContent = ((e && e.message) || "The text reader failed.") + " Nothing was hidden automatically. Drag across anything personal before saving.";
          }).then(function () { if (S === me) $("scanSave").disabled = false; });
        });
      });
    },
    /* read a canvas (a PDF page, say) to raw text with no review sheet; docs.js uses it */
    ocrText: function (canvas) { return ocr(canvas).then(function (data) { return linesOf(data).map(function (l) { return (l.words || []).map(function (w) { return w.text; }).join(" "); }).join("\n"); }); },
    /* black out personal details in plain text (a PDF's own text layer) with the same rules as a photo */
    scrub: function (text, opt) {
      var lines = String(text || "").split("\n").map(function (ln) { var x = 0; return { words: ln.split(/\s+/).filter(Boolean).map(function (t) { var b = { x0: x, y0: 0, x1: x + t.length, y1: 1 }; x += t.length + 1; return { text: t, bbox: b }; }) }; });
      return redactedText(lines, detect(lines, privateWords(), opt || {}));
    },
    classify: classify, parse: parse, titles: KIND_TITLE,
    /* exposed for tests */
    describe: describe, _tireDot: tireDot, _detect: detect, _parse: parse, _classify: classify, _redactedText: redactedText, version: TESS
  };

  (window.V60_MODULES = window.V60_MODULES || []).push({
    id: "scan",
    init: function (api) { API = api; }
  });
})();
