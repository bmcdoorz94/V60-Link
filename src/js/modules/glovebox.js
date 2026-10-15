/* Glovebox: receipts (Claude-read or manual), documents with renewal alerts, service contract/warranty, tool inventory. */
(function () {
  /* [id, name, what it is for, tier]. Ids are used by DIY jobs (tools: [...]); keep them stable. Prices live in data/toolprices.js. */
  var TIERS = [
    { id: "t1", n: "Tier 1 · Checking", d: "Everything a monthly look-over needs: pressures, tread, fluids, lights." },
    { id: "t2", n: "Tier 2 · First jobs", d: "Small jobs that keep you out from under the car: bulbs, filters, trim, battery terminals." },
    { id: "t3", n: "Tier 3 · Wheels off", d: "Only when you change a wheel or need to get under the car. Stands every time." }
  ];
  var TOOLS = [
    ["gauge", "Tire pressure gauge", "Tire checks, monthly", "t1"], ["tdg", "Tread depth gauge", "A reading in 32nds instead of the coin test", "t1"], ["quarter", "A US quarter", "Quick 4/32 tread test", "t1"],
    ["inflator", "12V tire inflator", "Set pressures at home from the car's power outlet", "t1"], ["light", "Bright flashlight or headlamp", "Every under-hood check", "t1"],
    ["gloves", "Nitrile gloves", "Anything with fluids", "t1"], ["towels", "Shop towels", "Wiping caps and spills before they reach paint", "t1"], ["obd", "OBDLink CX adapter", "Codes, live data, readiness", "t1"],
    ["torx", "Torx bit set (T20, T25, T30)", "Headlight cover (T20), trim, filters", "t2"], ["sockets", "3/8 in socket set with extension", "Battery clamp, general work", "t2"],
    ["drivers", "Screwdriver set", "Clips, hose clamps, small covers", "t2"], ["pliers", "Needle-nose pliers", "Clips and connectors", "t2"], ["trim", "Plastic trim removal tools", "Covers and panels without scratches", "t2"],
    ["brush", "Battery terminal brush", "Corrosion on the posts and clamps", "t2"], ["funnel", "Funnel", "Topping up oil or washer fluid", "t2"], ["meter", "Digital multimeter", "Battery voltage, fuses, circuits", "t2"],
    ["charger", "Smart battery charger with AGM mode", "Keeping the AGM battery healthy", "t2"], ["cables", "Jumper cables or a jump pack", "Dead battery", "t2"],
    ["jack", "Floor jack, low profile", "Lifting the car onto stands", "t3"], ["stands", "Jack stands, pair, rated 2 tons or more", "Anything under the car. Never trust a jack alone", "t3"],
    ["chocks", "Wheel chocks, pair", "Blocking the wheels that stay on the ground", "t3"], ["torque", "Torque wrench covering 103 lb-ft", "Wheels to Volvo's 103 lb-ft", "t3"],
    ["breaker", "Breaker bar and lug socket", "Loosening wheel bolts. Check the socket size on your bolts before buying", "t3"]
  ];
  window.V60_TOOLS = TOOLS;
  function data(api) { var d = api.mod("glove"); if (!d) { d = { docs: {}, contract: {}, tools: {}, price: {}, receipts: [] }; api.setMod("glove", d); } if (!d.price) d.price = {}; return d; }
  var gb = { pending: null, busy: false };
  function daysTo(dateStr) { if (!dateStr) return null; return Math.round((new Date(dateStr + "T12:00:00") - Date.now()) / 864e5); }
  function itemOptions(api, sel) { return '<option value="">Other work</option>' + api.ITEMS.map(function (i) { return '<option value="' + i.key + '"' + (sel === i.key ? " selected" : "") + ">" + api.esc(i.name) + "</option>"; }).join(""); }
  /* ---------- tools: tiers, sourced prices, the owner's own price ---------- */
  function priceOf(id) { var P = window.V60_TOOL_PRICES; return (P && P.items && P.items[id]) || []; }
  function money(n) { return "$" + (Math.round(n * 100) / 100).toFixed(n % 1 ? 2 : 0); }
  function shortDate(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ""); return m ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][+m[2] - 1] + " " + (+m[3]) + ", " + m[1] : ""; }
  /* the price used for totals: the owner's, else the cheapest sourced one, else null */
  function usePrice(d, id) { if (id === "quarter") return 0.25; if (d.price && d.price[id] != null) return d.price[id]; var o = priceOf(id).filter(function (x) { return x.price != null; }); return o.length ? Math.min.apply(null, o.map(function (x) { return x.price; })) : null; }
  function renderTools(api, d) {
    var $ = api.$, esc = api.esc, P = window.V60_TOOL_PRICES || {}, owned = 0, needLo = 0, unpriced = 0;
    $("gbTools").innerHTML = TIERS.map(function (tr) {
      var list = TOOLS.filter(function (t) { return t[3] === tr.id; }), left = 0, sum = 0, nop = 0;
      var rows = list.map(function (t) {
        var id = t[0], have = !!d.tools[id], mine = d.price && d.price[id] != null ? d.price[id] : null, opts = priceOf(id).filter(function (x) { return x.price != null; }).sort(function (a, b) { return a.price - b.price; }), up = usePrice(d, id);
        if (have) owned++; else { left++; if (up == null) nop++; else sum += up; }
        var sumTxt = mine != null ? money(mine) + " · your price" : opts.length ? money(opts[0].price) + (opts.length > 1 ? "–" + money(opts[opts.length - 1].price) : "") + " · " + esc(opts[0].store) : id === "quarter" ? "25¢" : "No price checked";
        var body = opts.map(function (x) { return '<li><a href="' + esc(x.url) + '" target="_blank" rel="noopener">' + esc(x.name) + "</a><span class=\"status\"> " + esc(x.store) + ", " + money(x.price) + (x.note ? ". " + esc(x.note) : "") + "</span></li>"; }).join("");
        var src = opts.length ? '<ul class="tpsrc">' + body + '</ul><p class="status">Checked ' + esc(shortDate(P.checked)) + ". Store prices change; type what you paid or saw to replace it.</p>" : '<p class="status">No store price checked for this one. Type one in to count it in the totals.</p>';
        return '<div class="tool' + (have ? " have" : "") + '"><label class="tcheck"><input type="checkbox" data-tool="' + id + '"' + (have ? " checked" : "") + "><span><b>" + esc(t[1]) + "</b><small>" + esc(t[2]) + "</small></span></label>" +
          (id === "quarter" ? "" : '<details class="tprice" data-tp="' + id + '"' + (gb.openPrice === id ? " open" : "") + '><summary><span class="mono">' + sumTxt + "</span></summary>" + src +
          '<div class="row tpmine"><div class="field"><label for="gbTP-' + id + '">Your price ($)</label><input id="gbTP-' + id + '" type="number" inputmode="decimal" min="0" step="0.01" data-tprice="' + id + '" value="' + (mine != null ? mine : "") + '"></div>' + (mine != null ? '<button type="button" class="quiet" data-tpclear="' + id + '">Use the store price</button>' : "") + "</div></details>") + "</div>";
      }).join("");
      needLo += sum; unpriced += nop;
      var head = left ? "still need " + left + (sum ? " · about " + money(sum) : "") + (nop ? (sum ? " + " : " · ") + nop + " unpriced" : "") : "all set";
      return '<section class="ttier"><h4>' + esc(tr.n) + ' <span class="status">' + head + '</span></h4><p class="status">' + esc(tr.d) + '</p><div class="tools">' + rows + "</div></section>";
    }).join("");
    $("gbToolStat").textContent = owned + " of " + TOOLS.length + " owned" + (needLo ? " · about " + money(needLo) + " to finish" : "");
  }
  function render(api) {
    var $ = api.$, esc = api.esc, d = data(api), D = d.docs, C = d.contract;
    $("gbAI").hidden = !(window.V60_SCAN || (api.sample() && api.assets()));
    // pending receipt preview
    if (gb.pending) {
      var p = gb.pending;
      $("gbPreview").innerHTML = '<div class="card"><h3>Check what was read <span class="pill watch">Unconfirmed</span></h3><p class="status">' + (p.by === "claude" ? "Read by Claude from the redacted photo." : "Read on this phone. Fix anything wrong before saving.") + '</p><div class="row"><div class="field"><label for="gbRDate">Date</label><input id="gbRDate" type="date" value="' + esc(p.date || "") + '"></div><div class="field"><label for="gbRMiles">Odometer</label><input id="gbRMiles" type="number" value="' + (p.odometer || "") + '"></div><div class="field"><label for="gbRShop">Shop</label><input id="gbRShop" type="text" value="' + esc(p.shop || "") + '"></div><div class="field"><label for="gbRTotal">Total ($)</label><input id="gbRTotal" type="number" step="0.01" value="' + (p.total || "") + '"></div></div><table><thead><tr><th>Add</th><th>Work</th><th>Counts as</th></tr></thead><tbody>' + (p.items || []).map(function (it, n) { return '<tr><td><input type="checkbox" data-ri="' + n + '"' + (it.key ? " checked" : "") + '></td><td>' + esc(it.desc) + '</td><td><select data-rk="' + n + '">' + itemOptions(api, it.key) + "</select></td></tr>"; }).join("") + '</tbody></table><div class="row"><button type="button" id="gbRSave">Add to my records</button><button type="button" class="quiet" id="gbRCancel">Discard</button></div></div>';
    } else $("gbPreview").innerHTML = "";
    $("gbRList").innerHTML = d.receipts.length ? d.receipts.slice().reverse().slice(0, 20).map(function (r) { return "<li><b>" + esc(r.date || "No date") + "</b> " + esc(r.shop || "") + (r.total ? ", $" + (+r.total).toFixed(2) : "") + '<span class="status"> · ' + esc(r.summary || "") + "</span></li>"; }).join("") : '<li class="status">No receipts yet.</li>';
    // docs
    [["regExp", "Registration expires"], ["insRenew", "Insurance renews"], ["inspDue", "Emissions inspection due"]].forEach(function (f) { var v = D[f[0]] || "", n = daysTo(v); $("gbD-" + f[0]).value = v; $("gbDS-" + f[0]).textContent = v ? (n < 0 ? Math.abs(n) + " days overdue" : n + " days left") : ""; $("gbDS-" + f[0]).className = "status" + (v && n < 30 ? " warnc" : ""); });
    ["insCo", "insPolicy", "titleLoc", "vin", "plate", "paint"].forEach(function (k) { $("gbD-" + k).value = D[k] || ""; });
    // contract
    ["prov", "num", "start", "startMi", "months", "miles", "deduct", "phone", "notes"].forEach(function (k) { $("gbC-" + k).value = C[k] || ""; });
    var cs = "";
    if (C.start && C.months) { var end = new Date(C.start + "T12:00:00"); end.setMonth(end.getMonth() + (+C.months)); var endMi = C.startMi && C.miles ? (+C.startMi) + (+C.miles) : null, dleft = Math.round((end - Date.now()) / 864e5), mleft = endMi && api.state.odo != null ? endMi - api.state.odo : null; var active = dleft > 0 && (mleft == null || mleft > 0); cs = '<span class="pill ' + (active ? "ok" : "concern") + '">' + (active ? "Active" : "Expired") + "</span> Ends " + end.toISOString().slice(0, 10) + (endMi ? " or at " + api.fmt(endMi) + " mi" : "") + (active ? " (" + dleft + " days" + (mleft != null ? ", " + api.fmt(mleft) + " mi" : "") + " left)" : "") + ". Keep every maintenance receipt: most contracts require proof of maintenance before paying a claim."; }
    $("gbCStatus").innerHTML = cs;
    // tools
    renderTools(api, d);
  }
  function readReceipt(api, file) {
    if (gb.busy || !file) return; gb.busy = true; var st = api.$("gbStatus"); st.textContent = "Reading the receipt...";
    var keys = api.ITEMS.map(function (i) { return i.key + " = " + i.name; }).join("; ");
    var SC = window.V60_SCAN, scan = null, A = api.assets();
    /* scan.js reads the receipt on the device and blacks out personal details; only the redacted image is kept or sent anywhere */
    (SC ? SC.process(file, "receipt") : shrinkImg(file).then(function (b) { return { blob: b, fields: {} }; })).then(function (r) {
      scan = r; st.textContent = "Saving the photo...";
      return A ? A.upload(r.blob, { name: "receipt-" + api.todayStr() + ".jpg" }) : null;
    }).then(function (up) {
      gb.asset = up ? { id: up.id, url: up.local ? null : up.url, local: !!up.local } : null;
      var f = scan.fields || {}, fromScan = { date: f.date || "", odometer: f.miles || "", shop: f.shop || "", total: f.total != null ? f.total : "", items: (f.items || []).map(function (x) { return { desc: x.desc, key: x.key }; }), by: "device" };
      if (!api.sample()) return fromScan;
      st.textContent = "Claude is reading the redacted photo...";
      return api.sample().json("This is a photo of an auto repair or maintenance receipt for a 2016 Volvo V60. Personal details are blacked out; ignore them. Extract what is clearly printed; use null when not visible. Return JSON only: {date: \"YYYY-MM-DD\" or null, odometer: number or null, shop: string or null, total: number or null, items: [{desc: short description, key: one of [" + keys + "] or null}]}. Map each line of work to a key only when it clearly matches.", { images: [scan.blob], cache: false }).then(function (j) {
        return { date: j.date || fromScan.date, odometer: j.odometer || fromScan.odometer, shop: j.shop || fromScan.shop, total: j.total || fromScan.total, items: (Array.isArray(j.items) && j.items.length ? j.items : fromScan.items).slice(0, 20).map(function (x) { return { desc: String(x.desc || "").slice(0, 120), key: api.ITEMS.some(function (i) { return i.key === x.key; }) ? x.key : "" }; }), by: "claude" };
      }).catch(function () { return fromScan; });
    }).then(function (p) {
      gb.pending = p;
      var found = p.date || p.odometer || p.total || p.items.length;
      st.textContent = found ? "Read. Every value is unconfirmed until you check it below." : "The photo is saved, but nothing could be read clearly. Fill in the form below.";
      render(api);
    }).catch(function (e) {
      st.textContent = e && e.code === "cancelled" ? "Cancelled. Nothing was saved." : (e && e.code === "not_granted" ? "Claude was not allowed to read images in this view." : ((e && e.message) || "Could not read that receipt. Try a sharper, flatter photo, or use the manual form."));
    }).then(function () { gb.busy = false; api.$("gbFile").value = ""; });
  }
  function shrinkImg(file) { return new Promise(function (res, rej) { var img = new Image(), u = URL.createObjectURL(file); img.onload = function () { var M = 2000, s = Math.min(1, M / Math.max(img.naturalWidth, img.naturalHeight)), c = document.createElement("canvas"); c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u); c.toBlob(function (b) { b ? res(b) : rej(new Error("x")); }, "image/jpeg", 0.88); }; img.onerror = function () { rej(new Error("x")); }; img.src = u; }); }
  function addService(api, date, miles, key, note, total, shop) {
    var st = api.state, mi = +miles;
    if (key && date && mi) st.log.push({ id: api.uid(), date: date, miles: Math.round(mi), item: key, notes: (note || "").slice(0, 200) });
    if (mi) api.bumpOdo(mi);
    if (+total && window.V60_FUEL) window.V60_FUEL.addExpense(api, { id: api.uid(), date: date || api.todayStr(), cat: "service", amt: +total, odo: mi || null, note: (shop || note || "Service").slice(0, 120) });
  }
  /* docs.js hands a receipt it read here, so the work gets logged through the same check-and-save card */
  window.V60_GLOVE = { pendReceipt: function (api, p) { gb.pending = p; gb.asset = null; render(api); api.$("gbStatus").textContent = "Read from the document. Check every value below, then save."; } };
  (window.V60_MODULES = window.V60_MODULES || []).push({
    id: "glove",
    tabs: [{ id: "glove", section: "car", label: "Glovebox", order: 40, html: '<section><h2>Glovebox</h2><p class="lede">Receipts, papers, coverage and tools. Every past service you add makes the due dates real instead of guessed.</p></section>' +
      '<section class="card"><h3>Add a receipt</h3><div id="gbAI" hidden><p class="lede">Photograph a service receipt. The app reads the date, mileage, shop and work on this phone, blacks out personal details, and you confirm before anything is saved.</p><div class="row"><label class="filebtn"><input id="gbFile" type="file" accept="image/*"><span>Photograph a receipt</span></label><span class="status" id="gbStatus" role="status"></span></div></div><div id="gbPreview"></div><details class="gbman"><summary>Add a past service by hand</summary><form id="gbMan" class="row" autocomplete="off"><div class="field"><label for="gbMDate">Date</label><input id="gbMDate" type="date" required></div><div class="field"><label for="gbMMiles">Odometer</label><input id="gbMMiles" type="number" min="0" step="1"></div><div class="field"><label for="gbMItem">Work</label><select id="gbMItem"></select></div><div class="field"><label for="gbMCost">Cost ($)</label><input id="gbMCost" type="number" min="0" step="0.01"></div><div class="field" style="flex:1 1 12em"><label for="gbMShop">Shop or note</label><input id="gbMShop" type="text" maxlength="120"></div><button type="submit">Add service</button></form></details><h4>Recent receipts</h4><ul class="plain" id="gbRList"></ul></section>' +
      '<section class="card"><h3>Papers and renewals</h3><div class="row"><div class="field"><label for="gbD-regExp">Registration expires</label><input id="gbD-regExp" type="date" data-doc="regExp"><span class="status" id="gbDS-regExp"></span></div><div class="field"><label for="gbD-insRenew">Insurance renews</label><input id="gbD-insRenew" type="date" data-doc="insRenew"><span class="status" id="gbDS-insRenew"></span></div><div class="field"><label for="gbD-inspDue">Emissions inspection due</label><input id="gbD-inspDue" type="date" data-doc="inspDue"><span class="status" id="gbDS-inspDue"></span></div></div><div class="row"><div class="field"><label for="gbD-insCo">Insurance company</label><input id="gbD-insCo" type="text" data-doc="insCo" maxlength="60"></div><div class="field"><label for="gbD-insPolicy">Policy number</label><input id="gbD-insPolicy" type="text" data-doc="insPolicy" maxlength="40"></div><div class="field"><label for="gbD-plate">Plate</label><input id="gbD-plate" type="text" data-doc="plate" maxlength="12"></div><div class="field"><label for="gbD-vin">VIN</label><input id="gbD-vin" type="text" data-doc="vin" maxlength="17" class="mono"></div><div class="field"><label for="gbD-paint">Paint code (B-pillar label)</label><input id="gbD-paint" type="text" data-doc="paint" maxlength="12"></div><div class="field" style="flex:1 1 12em"><label for="gbD-titleLoc">Where the title is kept</label><input id="gbD-titleLoc" type="text" data-doc="titleLoc" maxlength="80"></div></div><p class="status">Stored only in your own saved data. Renewals within 30 days show up in Check.</p></section>' +
      '<section class="card"><h3>Service contract or warranty</h3><div class="row"><div class="field"><label for="gbC-prov">Provider</label><input id="gbC-prov" type="text" data-con="prov" maxlength="60"></div><div class="field"><label for="gbC-num">Contract number</label><input id="gbC-num" type="text" data-con="num" maxlength="40"></div><div class="field"><label for="gbC-start">Start date</label><input id="gbC-start" type="date" data-con="start"></div><div class="field"><label for="gbC-startMi">Start miles</label><input id="gbC-startMi" type="number" data-con="startMi"></div><div class="field"><label for="gbC-months">Term (months)</label><input id="gbC-months" type="number" data-con="months"></div><div class="field"><label for="gbC-miles">Term (miles)</label><input id="gbC-miles" type="number" data-con="miles"></div><div class="field"><label for="gbC-deduct">Deductible ($)</label><input id="gbC-deduct" type="number" data-con="deduct"></div><div class="field"><label for="gbC-phone">Claims phone</label><input id="gbC-phone" type="tel" data-con="phone" maxlength="20"></div></div><div class="field"><label for="gbC-notes">Coverage notes</label><input id="gbC-notes" type="text" data-con="notes" maxlength="200" class="wide"></div><p id="gbCStatus"></p></section>' +
      '<section class="card"><h3>Tool inventory <span class="status" id="gbToolStat"></span></h3><p class="status">Tick what you own. Tap a price for the store it came from, or to type your own.</p><div id="gbTools"></div></section>' }],
    clean: function (v) { if (!v || typeof v !== "object") return null; var pr = {}; if (v.price && typeof v.price === "object") Object.keys(v.price).forEach(function (k) { var n = +v.price[k]; if (/^[a-z0-9]{1,20}$/.test(k) && v.price[k] !== "" && v.price[k] != null && isFinite(n) && n >= 0 && n < 100000) pr[k] = Math.round(n * 100) / 100; }); return { docs: v.docs || {}, contract: v.contract || {}, tools: v.tools || {}, price: pr, receipts: Array.isArray(v.receipts) ? v.receipts.slice(-200) : [] }; },
    render: function (api) { render(api); },
    init: function (api) {
      var $ = api.$;
      $("gbMItem").innerHTML = itemOptions(api, "");
      $("gbMDate").value = api.todayStr();
      $("gbFile").addEventListener("change", function () { readReceipt(api, this.files && this.files[0]); });
      $("p-glove").addEventListener("change", function (e) {
        var t = e.target, d = data(api);
        if (t.hasAttribute("data-doc")) { d.docs[t.getAttribute("data-doc")] = t.value.trim(); api.save(); render(api); }
        if (t.hasAttribute("data-con")) { d.contract[t.getAttribute("data-con")] = t.value.trim(); api.save(); render(api); }
        if (t.hasAttribute("data-tool")) { d.tools[t.getAttribute("data-tool")] = t.checked; api.save(); render(api); }
        if (t.hasAttribute("data-tprice")) { var k = t.getAttribute("data-tprice"), n = parseFloat(t.value); d.price = d.price || {}; if (t.value.trim() === "" || !isFinite(n) || n < 0) delete d.price[k]; else d.price[k] = Math.round(n * 100) / 100; gb.openPrice = k; api.save(); render(api); }
        if (t.hasAttribute("data-rk")) { gb.pending.items[+t.getAttribute("data-rk")].key = t.value; }
      });
      $("gbTools").addEventListener("click", function (e) {
        var b = e.target.closest && e.target.closest("[data-tpclear]"); if (!b) return;
        var d = data(api), k = b.getAttribute("data-tpclear"); if (d.price) delete d.price[k]; gb.openPrice = k; api.save(); render(api);
      });
      $("gbTools").addEventListener("toggle", function (e) { var t = e.target; if (t.matches && t.matches("details[data-tp]")) { if (t.open) gb.openPrice = t.getAttribute("data-tp"); else if (gb.openPrice === t.getAttribute("data-tp")) gb.openPrice = null; } }, true);
      $("gbMan").addEventListener("submit", function (e) { e.preventDefault(); addService(api, $("gbMDate").value, $("gbMMiles").value, $("gbMItem").value, $("gbMShop").value, $("gbMCost").value, $("gbMShop").value); var d = data(api); d.receipts.push({ id: api.uid(), date: $("gbMDate").value, shop: $("gbMShop").value.trim(), total: +$("gbMCost").value || null, summary: $("gbMItem").selectedOptions[0].textContent }); $("gbMMiles").value = ""; $("gbMCost").value = ""; $("gbMShop").value = ""; api.save(); api.renderAll(); render(api); });
      $("gbPreview").addEventListener("click", function (e) {
        var b = e.target.closest && e.target.closest("button"); if (!b) return;
        if (b.id === "gbRCancel") { gb.pending = null; render(api); return; }
        if (b.id === "gbRSave") {
          var p = gb.pending, date = $("gbRDate").value, mi = $("gbRMiles").value, shop = $("gbRShop").value.trim(), total = $("gbRTotal").value, picked = [];
          p.items.forEach(function (it, n) { var cb = document.querySelector('#gbPreview [data-ri="' + n + '"]'); if (cb && cb.checked) { picked.push(it.desc); if (it.key) addService(api, date, mi, it.key, shop + ": " + it.desc, 0, shop); } });
          addService(api, date, mi, "", "", total, shop);
          var d = data(api); d.receipts.push({ id: api.uid(), date: date, shop: shop, total: +total || null, summary: picked.join(", ").slice(0, 200), asset: gb.asset || null });
          gb.pending = null; api.save(); api.renderAll(); render(api); $("gbStatus").textContent = "Added. Due dates in Check are updated.";
        }
      });
    },
    actions: function (api, list) {
      var d = api.mod("glove"); if (!d) return;
      [["regExp", "Registration"], ["insRenew", "Insurance"], ["inspDue", "Emissions inspection"]].forEach(function (f) { var v = d.docs[f[0]], n = daysTo(v); if (v && n != null && n < 30) list.push({ sev: n < 0 ? 85 : 62, text: f[1] + (n < 0 ? " is " + Math.abs(n) + " days overdue." : " is due in " + n + " days."), jump: "tab:glove" }); });
    },
    xp: function (api) { var d = api.mod("glove"); if (!d) return 0; return Math.min(120, d.receipts.length * 15) + Object.keys(d.tools).filter(function (k) { return d.tools[k]; }).length * 2; },
    today: function (api) { var d = api.mod("glove"); var hasLog = api.state.log.length; if (hasLog > 2) return []; return [{ order: 25, html: '<article class="tcard"><h3>Fill in the history</h3><p class="status">Your car came with no records. Every past service you add turns a guessed due date into a real one.</p><button type="button" data-jump="tab:glove">Add a receipt</button></article>' }]; }
  });
})();
