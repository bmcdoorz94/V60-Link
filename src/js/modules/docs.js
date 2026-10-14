/* Documents: drop any paper about the car (a photo or a PDF) and it is read on this phone, sorted by what it is,
   its useful fields pulled out, checked by the owner, then filed where it belongs: receipts into the service log,
   an inspection report into the inspection due date and the odometer, registration and insurance into renewals,
   a service contract into the contract card. Nothing leaves the phone; personal details are blacked out before
   anything is stored. PDFs: pdf.js (jsDelivr, cached by the service worker) reads the text layer, and a page with
   no text is drawn and read by the same text reader as a photo. Saved under api.mod("docs") = { list: [...] }. */
(function () {
  var PDFJS = "3.11.174";
  var PDF_URL = "https://cdn.jsdelivr.net/npm/pdfjs-dist@" + PDFJS + "/legacy/build/pdf.min.js";
  var PDF_WORKER = "https://cdn.jsdelivr.net/npm/pdfjs-dist@" + PDFJS + "/legacy/build/pdf.worker.min.js";
  var MAX_PAGES = 12, MAX_FILES = 10, EXCERPT = 900;
  var KINDS = [["receipt", "Service receipt"], ["inspection", "Inspection report"], ["registration", "Registration"], ["insurance", "Insurance"], ["warranty", "Service contract or warranty"], ["title", "Title"], ["recall", "Recall letter"], ["history", "Vehicle history report"], ["manual", "Manual page"], ["door", "Door label"], ["tire", "Tire sidewall"], ["other", "Other paper"]];
  var KIND_NAME = {}; KINDS.forEach(function (k) { KIND_NAME[k[0]] = k[1]; });
  var FILE_WHERE = { receipt: "Service log, receipts and costs", inspection: "Inspection due date, odometer, Glovebox", registration: "Registration renewal in Glovebox", insurance: "Insurance renewal in Glovebox", warranty: "Service contract card in Glovebox", title: "Glovebox (title on file)", recall: "Glovebox (recall letter on file)", history: "Odometer history", manual: "Documents", door: "Build month in Bulletins", tire: "Documents", other: "Documents" };

  var API = null, ui = { queue: [], busy: false, status: "", filter: "", q: "" };
  function $(id) { return document.getElementById(id); }
  function esc(s) { return API.esc(s); }
  function data(api) { var d = api.mod("docs"); if (!d) { d = { list: [] }; api.setMod("docs", d); } if (!Array.isArray(d.list)) d.list = []; return d; }
  function fmtMi(n) { return (+n).toLocaleString() + " mi"; }

  /* ---------- pdf.js ---------- */
  var pdfProm = null;
  function loadPdfJs() {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    if (pdfProm) return pdfProm;
    pdfProm = new Promise(function (res, rej) {
      var sc = document.createElement("script"); sc.src = PDF_URL; sc.async = true;
      sc.onload = function () { if (!window.pdfjsLib) { rej(new Error("The PDF reader did not load.")); return; } window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER; res(window.pdfjsLib); };
      sc.onerror = function () { pdfProm = null; rej(new Error("The PDF reader could not be downloaded. Check the connection and try again.")); };
      document.head.appendChild(sc);
    });
    return pdfProm;
  }
  function readBuf(file) { return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(r.result); }; r.onerror = function () { rej(new Error("That file could not be read.")); }; r.readAsArrayBuffer(file); }); }
  function hashBuf(buf) {
    if (window.crypto && crypto.subtle && crypto.subtle.digest) return crypto.subtle.digest("SHA-256", buf).then(function (h) { return Array.prototype.map.call(new Uint8Array(h), function (b) { return (b < 16 ? "0" : "") + b.toString(16); }).join(""); });
    var a = 0x811c9dc5, u = new Uint8Array(buf); for (var i = 0; i < u.length; i++) { a ^= u[i]; a = (a * 16777619) >>> 0; } return Promise.resolve("w" + a.toString(16) + "-" + u.length);
  }
  /* -> { text, pages, ocrPages } : the text of every page, OCR for pages without a text layer */
  function readPdf(file, progress) {
    var SC = window.V60_SCAN;
    return Promise.all([loadPdfJs(), readBuf(file)]).then(function (r) {
      var lib = r[0], buf = r[1];
      return lib.getDocument({ data: buf, isEvalSupported: false, disableFontFace: true }).promise;
    }).then(function (pdf) {
      var n = Math.min(pdf.numPages, MAX_PAGES), out = [], ocrPages = 0, i = 1;
      function page() {
        if (i > n) return { text: out.join("\n"), pages: pdf.numPages, ocrPages: ocrPages };
        progress("Reading page " + i + " of " + n + "…");
        var num = i++;
        return pdf.getPage(num).then(function (pg) {
          return pg.getTextContent().then(function (tc) {
            var lines = [], last = null, cur = [];
            (tc.items || []).forEach(function (it) {
              if (!it.str && !it.hasEOL) return;
              var y = it.transform ? Math.round(it.transform[5]) : 0;
              if (last != null && Math.abs(y - last) > 2) { lines.push(cur.join(" ")); cur = []; }
              if (it.str) cur.push(it.str); last = y;
              if (it.hasEOL) { lines.push(cur.join(" ")); cur = []; last = null; }
            });
            if (cur.length) lines.push(cur.join(" "));
            var text = lines.join("\n").replace(/[ \t]+/g, " ").trim();
            if (text.replace(/\s/g, "").length >= 40 || !SC) { out.push(text); return; }
            /* a scanned page: draw it and read the picture */
            progress("Page " + num + " is a picture. Reading it on this phone…"); ocrPages++;
            var vp = pg.getViewport({ scale: 1.6 }), c = document.createElement("canvas"); c.width = Math.round(vp.width); c.height = Math.round(vp.height);
            return pg.render({ canvasContext: c.getContext("2d"), viewport: vp }).promise.then(function () { return SC.ocrText(c); }).then(function (t) { out.push(t || ""); });
          });
        }).then(page);
      }
      return page();
    });
  }

  /* ---------- the review ---------- */
  function kindOf(raw) { var SC = window.V60_SCAN, k = SC ? SC.classify(raw) : "photo"; return k === "photo" ? "other" : k; }
  function fieldsFor(raw, safe, kind) { var SC = window.V60_SCAN; return SC ? SC.parse(raw, safe, kind) : {}; }
  function titleFor(doc) {
    var f = doc.fields || {};
    return f.shop || f.station || f.provider || f.subject || (f.campaign ? "Campaign " + f.campaign : "") || doc.name || KIND_NAME[doc.kind] || "Document";
  }
  function fieldRows(kind, f) {
    var r = [];
    function add(k, l, v, t) { if (v == null || v === "") return; r.push({ k: k, l: l, v: v, t: t || "text" }); }
    if (kind === "receipt") { add("date", "Date", f.date, "date"); add("miles", "Odometer", f.miles, "number"); add("shop", "Shop", f.shop); add("total", "Total $", f.total, "number"); (f.items || []).slice(0, 8).forEach(function (it, n) { add("item" + n, "Work", it.desc); }); }
    else if (kind === "inspection") { add("date", "Test date", f.date, "date"); add("miles", "Odometer", f.miles, "number"); add("result", "Result", f.result); add("station", "Station", f.station); add("type", "Test type", f.type); add("codes", "Codes on file", (f.codes || []).join(", ")); }
    else if (kind === "registration") { add("expires", "Expires", f.expires, "date"); }
    else if (kind === "insurance") { add("expires", "Renews", f.expires, "date"); add("company", "Company", f.company); }
    else if (kind === "warranty") { add("provider", "Provider", f.provider); add("start", "Start date", f.start, "date"); add("months", "Months", f.months, "number"); add("miles", "Miles", f.miles, "number"); add("deductible", "Deductible $", f.deductible, "number"); add("expires", "Ends", f.expires, "date"); }
    else if (kind === "title") { add("issued", "Issued", f.issued, "date"); add("state", "State", f.state); add("lien", "Lienholder listed", f.lien ? "yes" : "no"); }
    else if (kind === "recall") { add("campaign", "NHTSA campaign", f.campaign); add("volvo", "Volvo recall", f.volvo); add("subject", "Subject", f.subject); add("date", "Letter date", f.date, "date"); }
    else if (kind === "history") { add("owners", "Owners", f.owners, "number"); add("points", "Odometer readings", (f.points || []).map(function (p) { return p.date + " " + p.miles; }).join("; ")); }
    else if (kind === "door") { add("build", "Build month", f.build); }
    else if (kind === "tire") { add("dot", "DOT date code", f.dot); add("size", "Size", f.size); }
    if (!r.length) r.push({ k: "note", l: "Note", v: f.note || "", t: "text" });
    return r;
  }
  function readFields(kind, idx) {
    var f = {}, box = $("dcRev" + idx); if (!box) return f;
    box.querySelectorAll("[data-f]").forEach(function (inp) {
      var k = inp.getAttribute("data-f"), v = inp.value.trim();
      if (!v) return;
      if (/^item\d+$/.test(k)) { (f.items = f.items || []).push({ desc: v }); return; }
      if (k === "codes") { f.codes = v.split(/[,\s]+/).filter(Boolean).map(function (c) { return c.toUpperCase(); }); return; }
      if (k === "points") { f.points = v.split(";").map(function (s) { var m = s.trim().match(/^(\d{4}-\d{2}-\d{2})\s+(\d+)$/); return m ? { date: m[1], miles: +m[2] } : null; }).filter(Boolean); return; }
      if (k === "lien") { f.lien = /^y/i.test(v); return; }
      f[k] = inp.type === "number" ? +v : v;
    });
    return f;
  }

  /* ---------- filing ---------- */
  function addYear(d) { var x = new Date(d + "T12:00:00"); x.setFullYear(x.getFullYear() + 1); return x.toISOString().slice(0, 10); }
  function file(api, doc) {
    var f = doc.fields || {}, g = api.mod("glove") || { docs: {}, contract: {}, tools: {}, receipts: [] }, did = [];
    g.docs = g.docs || {}; g.contract = g.contract || {};
    if (doc.kind === "receipt") {
      if (window.V60_GLOVE && window.V60_GLOVE.pendReceipt) { window.V60_GLOVE.pendReceipt(api, { date: f.date || "", odometer: f.miles || "", shop: f.shop || "", total: f.total != null ? f.total : "", items: (f.items || []).map(function (x) { return { desc: x.desc, key: x.key || "" }; }), by: "device" }); did.push("sent to Glovebox to log the work: check it there and save"); }
    } else if (doc.kind === "inspection") {
      if (f.miles) { api.bumpOdo(+f.miles); did.push("odometer " + fmtMi(f.miles) + " noted"); }
      if (f.date && f.result === "pass") { var due = addYear(f.date); if (!g.docs.inspDue || g.docs.inspDue < due) { g.docs.inspDue = due; did.push("next emissions test due " + due); } }
    } else if (doc.kind === "registration") {
      if (f.expires) { g.docs.regExp = f.expires; did.push("registration expiry set to " + f.expires); }
    } else if (doc.kind === "insurance") {
      if (f.expires) { g.docs.insRenew = f.expires; did.push("insurance renewal set to " + f.expires); }
      if (f.company) { g.docs.insCo = f.company; did.push("insurer noted"); }
    } else if (doc.kind === "warranty") {
      if (f.provider) g.contract.prov = f.provider; if (f.start) g.contract.start = f.start; if (f.months) g.contract.months = f.months; if (f.miles) g.contract.miles = f.miles; if (f.deductible != null) g.contract.deduct = f.deductible;
      if (f.provider || f.start) did.push("service contract card filled in");
    } else if (doc.kind === "title") {
      g.docs.titleLoc = (g.docs.titleLoc || "").replace(/\s*\(document on file.*\)$/, "") + " (document on file, added " + api.todayStr() + ")"; did.push("title marked on file");
    } else if (doc.kind === "history") {
      var top = (f.points || []).reduce(function (m, p) { return p.miles > m ? p.miles : m; }, 0); if (top) { api.bumpOdo(top); did.push((f.points || []).length + " odometer readings kept"); }
    } else if (doc.kind === "door") {
      if (f.build) { var t = api.mod("tsb") || { build: "", mark: {} }; t.build = f.build; api.setMod("tsb", t); did.push("build month " + f.build + " saved for Bulletins"); }
    }
    api.setMod("glove", g);
    var d = data(api);
    d.list = d.list.concat([doc]).slice(-200);
    api.setMod("docs", d); api.save();
    try { api.renderAll(); } catch (e) {}
    return did;
  }

  /* ---------- processing ---------- */
  function setStatus(t) { ui.status = t; var el = $("dcStatus"); if (el) el.textContent = t; }
  function dupeOf(api, hash) { return data(api).list.filter(function (x) { return x.hash === hash; })[0]; }
  function processOne(api, f) {
    var SC = window.V60_SCAN, isPdf = /pdf$/i.test(f.type) || /\.pdf$/i.test(f.name || "");
    var base = { id: api.uid(), name: String(f.name || "document").slice(0, 80), added: api.todayStr(), pages: 1, kind: "other", fields: {}, excerpt: "", hash: "", asset: null, ocr: false };
    return readBuf(f).then(hashBuf).then(function (h) {
      base.hash = h;
      var dup = dupeOf(api, h); if (dup) { var e = new Error("Already on file as " + titleFor(dup) + " (" + dup.added + ")."); e.code = "duplicate"; throw e; }
      if (isPdf) {
        return readPdf(f, setStatus).then(function (r) {
          var raw = r.text || "", safe = SC ? SC.scrub(raw, { receipt: true }) : raw;
          base.pages = r.pages; base.ocr = r.ocrPages > 0; base.kind = kindOf(raw); base.fields = fieldsFor(raw, safe, base.kind === "other" ? "photo" : base.kind); base.excerpt = safe.slice(0, EXCERPT);
          return base;
        });
      }
      if (!SC) throw new Error("The text reader is not available here.");
      setStatus("Reading " + base.name + " on this phone…");
      return SC.process(f, "doc").then(function (r) {
        base.kind = r.kind === "photo" ? "other" : r.kind; base.fields = r.fields || {}; base.excerpt = (r.text || "").slice(0, EXCERPT); base.ocr = true;
        var A = api.assets();
        return (A ? A.upload(r.blob, { name: "doc-" + api.todayStr() + ".jpg" }).catch(function () { return null; }) : Promise.resolve(null)).then(function (up) { base.asset = up ? { id: up.id, url: up.local ? null : up.url, local: !!up.local } : null; return base; });
      });
    });
  }
  function processFiles(api, files) {
    if (ui.busy || !files || !files.length) return;
    ui.busy = true; var list = Array.prototype.slice.call(files, 0, MAX_FILES), i = 0, skipped = [];
    function next() {
      if (i >= list.length) { ui.busy = false; setStatus((list.length - skipped.length) + " read" + (skipped.length ? "; skipped: " + skipped.join("; ") : "") + ". Check each one below, then file it."); render(api); return; }
      var f = list[i++];
      setStatus("Reading " + f.name + " (" + i + " of " + list.length + ")…");
      processOne(api, f).then(function (doc) { ui.queue.push(doc); render(api); }).catch(function (e) { skipped.push(f.name + ": " + ((e && e.message) || "could not read")); }).then(next);
    }
    next();
  }

  /* ---------- render ---------- */
  function reviewCard(api, doc, idx) {
    var rows = fieldRows(doc.kind, doc.fields);
    return '<article class="card dc-rev" id="dcRev' + idx + '"><p class="ans-k">' + esc(doc.name) + (doc.pages > 1 ? " · " + doc.pages + " pages" : "") + (doc.ocr ? (doc.pages > 1 ? " · some pages read as pictures" : " · read from the picture") : " · read from the text") + '</p>' +
      '<div class="row"><div class="field"><label for="dcKind' + idx + '">What it is <span class="pill watch">Unconfirmed</span></label><select id="dcKind' + idx + '" data-dckind="' + idx + '">' + KINDS.map(function (k) { return '<option value="' + k[0] + '"' + (k[0] === doc.kind ? " selected" : "") + ">" + esc(k[1]) + "</option>"; }).join("") + "</select></div></div>" +
      '<div class="row dc-fields">' + rows.map(function (r) { return '<div class="field"><label for="dcF' + idx + r.k + '">' + esc(r.l) + '</label><input id="dcF' + idx + r.k + '" data-f="' + r.k + '" type="' + r.t + '" value="' + esc(r.v) + '"' + (r.t === "number" ? ' step="any"' : "") + "></div>"; }).join("") + "</div>" +
      (doc.excerpt ? '<details><summary>What was read (personal details hidden)</summary><pre class="dc-ex">' + esc(doc.excerpt) + "</pre></details>" : '<p class="status">No text could be read from it.</p>') +
      '<p class="status">Filing it puts it under: ' + esc(FILE_WHERE[doc.kind] || "Documents") + ".</p>" +
      '<div class="row"><button type="button" data-dcfile="' + idx + '">File it</button><button type="button" class="quiet" data-dcdrop="' + idx + '">Discard</button></div></article>';
  }
  function docRow(api, doc) {
    var f = doc.fields || {}, bits = [];
    if (f.date) bits.push(f.date); if (f.issued) bits.push(f.issued); if (f.start) bits.push("from " + f.start); if (f.expires) bits.push("to " + f.expires);
    if (f.miles) bits.push(fmtMi(f.miles)); if (f.total != null && f.total !== "") bits.push("$" + (+f.total).toFixed(2)); if (f.result) bits.push(f.result);
    if (f.codes && f.codes.length) bits.push(f.codes.join(", ")); if (f.campaign) bits.push(f.campaign);
    var u = doc.asset ? api.photoUrl({ asset: doc.asset.id, url: doc.asset.url, local: doc.asset.local }) : null;
    return '<li class="dc-row"><span class="pill info">' + esc(KIND_NAME[doc.kind] || doc.kind) + '</span><div><b>' + esc(titleFor(doc)) + "</b><span class=\"status\"> · " + esc(bits.join(" · ") || "no fields read") + " · added " + esc(doc.added) + "</span>" +
      (doc.excerpt ? '<details><summary>Text</summary>' + (u ? '<img class="dc-img" src="' + esc(u) + '" alt="">' : "") + '<pre class="dc-ex">' + esc(doc.excerpt) + "</pre></details>" : "") +
      '</div><button type="button" class="quiet" data-dcrm="' + esc(doc.id) + '">Remove</button></li>';
  }
  function render(api) {
    var root = $("p-docs"); if (!root) return;
    var d = data(api), list = d.list.slice().reverse();
    if (ui.filter) list = list.filter(function (x) { return x.kind === ui.filter; });
    if (ui.q) { var q = ui.q.toLowerCase(); list = list.filter(function (x) { return (titleFor(x) + " " + (x.excerpt || "") + " " + JSON.stringify(x.fields || {})).toLowerCase().indexOf(q) >= 0; }); }
    var counts = {}; d.list.forEach(function (x) { counts[x.kind] = (counts[x.kind] || 0) + 1; });
    $("dcStatus").textContent = ui.status;
    $("dcReview").innerHTML = ui.queue.map(function (doc, i) { return reviewCard(api, doc, i); }).join("");
    $("dcChips").innerHTML = '<button type="button" class="mn-pill' + (!ui.filter ? " on" : "") + '" data-dcfilter="">All ' + d.list.length + "</button>" + KINDS.filter(function (k) { return counts[k[0]]; }).map(function (k) { return '<button type="button" class="mn-pill' + (ui.filter === k[0] ? " on" : "") + '" data-dcfilter="' + k[0] + '">' + esc(k[1]) + " " + counts[k[0]] + "</button>"; }).join("");
    $("dcList").innerHTML = list.length ? list.map(function (x) { return docRow(api, x); }).join("") : '<li class="status">' + (d.list.length ? "Nothing matches." : "Nothing on file yet. Drop in a receipt, the registration, an insurance card, an inspection report, a service contract, a title or a recall letter.") + "</li>";
    var gl = $("dcGloveCount"); if (gl) gl.textContent = d.list.length ? d.list.length + " on file" : "none yet";
  }

  (window.V60_MODULES = window.V60_MODULES || []).push({
    id: "docs",
    tabs: [{ id: "docs", section: "car", label: "Documents", order: 41, hidden: true, html:
      '<section><h2>Documents</h2><p class="lede">Drop in any paper about the car. It is read on this phone, sorted by what it is, and the useful parts are pulled out for you to check before anything is filed. Personal details are blacked out first. Nothing is uploaded.</p></section>' +
      '<section class="card"><h3>Drop in a document</h3><div class="row"><label class="filebtn"><input id="dcFile" type="file" accept="image/*,.pdf,application/pdf" multiple><span>Choose photos or PDFs</span></label><span class="status" id="dcStatus" role="status"></span></div>' +
      '<p class="status">Photos: a receipt, label, card or sidewall. PDFs: up to ' + MAX_PAGES + ' pages are read; a scanned page is read as a picture. Up to ' + MAX_FILES + ' files at a time.</p></section>' +
      '<div id="dcReview"></div>' +
      '<section class="card"><h3>On file</h3><div class="row"><div class="field wide"><label for="dcQ">Search</label><input id="dcQ" type="search" placeholder="shop, station, code, word"></div></div><div class="dc-chips" id="dcChips"></div><ul class="dc-list" id="dcList"></ul></section>' }],
    clean: function (v) {
      if (!v || typeof v !== "object") return null;
      var list = Array.isArray(v.list) ? v.list.filter(function (x) { return x && typeof x === "object" && x.id; }).slice(-200).map(function (x) {
        return { id: String(x.id), name: String(x.name || "").slice(0, 80), added: String(x.added || "").slice(0, 10), pages: +x.pages || 1, kind: KIND_NAME[x.kind] ? x.kind : "other", fields: x.fields && typeof x.fields === "object" ? x.fields : {}, excerpt: String(x.excerpt || "").slice(0, EXCERPT), hash: String(x.hash || ""), asset: x.asset && typeof x.asset === "object" ? x.asset : null, ocr: !!x.ocr };
      }) : [];
      return { list: list };
    },
    init: function (api) {
      API = api;
      $("dcFile").addEventListener("change", function () { processFiles(api, this.files); this.value = ""; });
      $("dcQ").addEventListener("input", function () { ui.q = this.value.trim(); render(api); });
      $("p-docs").addEventListener("change", function (e) {
        var t = e.target, k = t.getAttribute && t.getAttribute("data-dckind");
        if (k != null) { var doc = ui.queue[+k]; if (!doc) return; doc.kind = t.value; doc.fields = fieldsFor(doc.excerpt, doc.excerpt, doc.kind === "other" ? "photo" : doc.kind); render(api); }
      });
      $("p-docs").addEventListener("click", function (e) {
        var b = e.target.closest && e.target.closest("button"); if (!b) return;
        var k;
        if ((k = b.getAttribute("data-dcfilter")) != null) { ui.filter = k; render(api); return; }
        if ((k = b.getAttribute("data-dcdrop")) != null) { ui.queue.splice(+k, 1); render(api); return; }
        if ((k = b.getAttribute("data-dcrm")) != null) { var d = data(api); d.list = d.list.filter(function (x) { return x.id !== k; }); api.setMod("docs", d); api.save(); render(api); return; }
        if ((k = b.getAttribute("data-dcfile")) != null) {
          var doc = ui.queue[+k]; if (!doc) return;
          doc.kind = $("dcKind" + k).value; doc.fields = readFields(doc.kind, +k);
          var did = file(api, doc);
          ui.queue.splice(+k, 1);
          setStatus("Filed as " + KIND_NAME[doc.kind] + (did.length ? ": " + did.join(", ") : "") + ".");
          render(api);
          if (doc.kind === "receipt" && window.V60_GLOVE) api.go("glove");
        }
      });
      /* a way in from the Glovebox */
      var gp = $("p-glove");
      if (gp && !$("dcGloveCard")) {
        var card = document.createElement("section"); card.className = "card"; card.id = "dcGloveCard";
        card.innerHTML = '<h3>Documents <span class="status" id="dcGloveCount"></span></h3><p class="status">Drop in any paper: receipts, registration, insurance, inspection reports, a service contract, the title, recall letters. Read on this phone and filed where it belongs.</p><div class="row"><button type="button" data-jump="tab:docs">Open Documents</button></div>';
        var first = gp.querySelector("section"); if (first && first.nextSibling) gp.insertBefore(card, first.nextSibling); else gp.appendChild(card);
      }
    },
    render: function (api) { render(api); },
    xp: function (api) { var d = api.mod("docs"); return d && d.list ? Math.min(100, d.list.length * 10) : 0; },
    jump: function (api, kind, id) { if (kind === "docs") { api.go("docs"); return true; } return false; }
  });
  window.V60_DOCS = { kinds: KINDS, _file: file, _fieldRows: fieldRows };
})();
