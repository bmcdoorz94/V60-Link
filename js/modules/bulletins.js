/* Bulletins: Volvo technical service bulletins (TSBs) for the 2016 V60 T5 Drive-E, read from the PDFs NHTSA publishes, with a
   "does this affect my car" check by build date. In Volvo's tables your engine (B4204T11) is code 40 and the V60 is type 155. */
(function () {
  var NH = "https://static.nhtsa.gov/odi/tsbs/";
  /* lim: last production week covered (YYYYWW). from: first week. kind: "fault" (fix when the symptom shows), "info", "program", "check" (depends on equipment) */
  var TSB = [
    { id: "TJ29818", sys: "Tires", t: "False low tire pressure warning", date: "2019-08-27", kind: "fault", star: true,
      sym: "Tire pressure warning with no real pressure loss (code BCM-C007768).",
      fix: "All four tires within 5% rolling circumference of each other. Cold pressures from the door-pillar label. Calibrate in MY CAR and drive 12 to 15 minutes (no confirmation appears). Recalibrate after every pressure change or rotation and at least every 10,000 miles. Then check for vibration, worn shocks, and metal debris on the hub's magnetic encoder ring (no metal tools).",
      you: "Your tire pressure light is always on. Do the calibration yourself first (DIY jobs has it). If it returns with correct pressures and matching tires, this bulletin is what a shop should follow.",
      pdf: NH + "2019/MC-10165233-9999.pdf", go: [["Calibrate it yourself", "diy:j-tires"], ["Troubleshoot", "tree:tpms"]] },
    { id: "TJ31216", sys: "Engine", t: "Low oil level message: piston rings", date: "2016-04-13 (rev 5, 2019-10-15)", kind: "fault", from: 201346, lim: 201604, star: true,
      sym: "Low oil warning, high oil use with no leaks.",
      fix: "Replace pistons and rings. Revision 5 adds a fingernail scratch check of the cylinder walls first. Prerequisite bulletin TJ30087 is not public.",
      you: "Engines with serial 1501327 or later were fixed at the factory. The engine serial is on the engine label or readable by a dealer. Your oil watch log is the evidence a shop will want.",
      pdf: NH + "2019/MC-10169029-9999.pdf", go: [["Oil watch log", "tab:records"], ["Oil article", "kb:a-oil"]] },
    { id: "TJ35526", sys: "Engine", t: "How Volvo tests oil consumption", date: "2026-04-21", kind: "info",
      sym: "Any oil consumption complaint.",
      fix: "Fix outside leaks first. Seal the oil cap and drain plug with tamper tape, weigh the oil to the gram using the VIDA procedure, and drive a set distance.",
      you: "Knowing this procedure tells you what a dealer visit for oil use will involve.",
      pdf: NH + "2026/MC-11032678-0001.pdf" },
    { id: "TJ29131", sys: "Engine", t: "Oil leak from the cam (VVT) pulley plugs", date: "2017-10-19", kind: "fault", lim: 201633,
      sym: "Low oil warning and/or an oil leak at the front of the engine.",
      fix: "Replace both VVT pulley plugs (part 31375877). Replace the timing belt if oil reached it.",
      you: "Oil on a timing belt shortens its life, and your belt history is unknown. Ask a shop to look for oil at the cam pulleys when the belt is inspected.",
      pdf: NH + "2017/MC-10130196-9999.pdf", go: [["Timing belt article", "kb:a-belt"]] },
    { id: "TJ34740", sys: "Engine", t: "Required oil for warranty claims", date: "2020-01-27", kind: "info",
      sym: "Not a fault.",
      fix: "Volvo specifies Castrol Edge Professional V 0W-20 for four-cylinder Drive-E engines and will not pay maintenance claims made with other oil.",
      you: "Your factory warranty is long over, but it is the oil Volvo itself puts in this engine. The owner's manual also lists 5W-30 ACEA A5/B5.",
      pdf: NH + "2020/MC-10171688-9999.pdf" },
    { id: "TJ32958", sys: "Engine", t: "Whine or rattle when revving: balance shaft", date: "2019-10-15", kind: "fault",
      sym: "Whining or rattling that rises with engine speed.",
      fix: "Replace the balance shaft with the 2018 design and set its backlash exactly.",
      you: "Only if you hear it. Record a short video with sound before a shop visit.",
      pdf: NH + "2019/MC-10169027-9999.pdf" },
    { id: "S29842", sys: "Engine", t: "Service action: spark plugs may crack", date: "2017-11", kind: "program",
      sym: "Spark plug damage from abnormal combustion.",
      fix: "Improved spark plugs installed free regardless of mileage. 76,534 US cars, 2015–16 four-cylinder models.",
      you: "Ask a Volvo dealer to check by VIN whether it was done. If your plugs were changed since, it may not matter, but the dealer record is free to check.",
      pdf: NH + "2017/MC-10146104-9999.pdf" },
    { id: "TJ30268", sys: "Cooling", t: "Thermostat fault codes", date: "2017-03-31", kind: "fault", lim: 201618,
      sym: "Codes B139F11/12/13, B139D01, P0597, P0598, P0599, or a charging warning.",
      fix: "Replace the thermostat. The bulletin warns that skipping it can cause further damage.",
      you: "If any of these codes appear in a health check, this is the fix a shop should use.",
      pdf: NH + "2017/MC-10168505-9999.pdf", go: [["Live link health check", "tab:live"]] },
    { id: "TJ36858", sys: "Cooling", t: "High temperature message after a new coolant pump", date: "2024-06-06", kind: "check",
      sym: "\"High temperature\" message with codes U040100 and P021700 after coolant pump 32382249 was fitted.",
      fix: "Fit the updated coolant pump.",
      you: "Only applies if your coolant pump has been replaced with that part number. Check receipts if you find any.",
      pdf: NH + "2024/MC-11006558-0001.pdf" },
    { id: "TJ30971", sys: "Cooling", t: "Refill the cooling system with Volvo's filling tool", date: "2016-04-19", kind: "info",
      sym: "Prevention, not a symptom.",
      fix: "After any cooling repair, use Volvo's coolant filling tool 9512957 so no air is trapped, to avoid overheating damage.",
      you: "Worth saying to any shop that opens the cooling system.",
      pdf: NH + "2016/SB-10087104-5448.pdf" },
    { id: "P29929", sys: "Fuel", t: "Low-pressure fuel sensor (extended warranty, now expired)", date: "2019", kind: "fault", lim: 201551,
      sym: "Check-engine light with ECM-P018C00.",
      fix: "Replace the sensor with Sensata 31432653 (kit 32242867, with a fuel line). Coverage was 8 years / 80,000 miles from first use, which has very likely run out on a 2016.",
      you: "If P018C ever shows, this is the known fix and part number to ask for.",
      pdf: NH + "2019/MC-10161784-9999.pdf" },
    { id: "TJ33202", sys: "Sensus", t: "Sensus screen freezes", date: "2018-02-21", kind: "fault",
      sym: "Screen freezes; keys and volume stop responding.",
      fix: "Infotainment software upgrade released February 2018.",
      you: "If it happens, a dealer can check whether the software is current.",
      pdf: NH + "2018/MC-10234736-9999.pdf" },
    { id: "SMB00-035", sys: "Sensus", t: "3G shutdown: apps, SOS and remote features", date: "2022-02", kind: "program",
      sym: "Sensus Connect apps, SOS/On Call and app remote stopped working when 3G networks closed in 2022.",
      fix: "4G modem (36011532) plus software reload, about 1 hour; included a 2-year app subscription. Hardware was limited. Whether it is still offered in 2026 is unconfirmed.",
      you: "Unless a previous owner had this done, assume Volvo On Call and the connected apps on your car do not work. Bluetooth audio and navigation are unaffected.",
      pdf: NH + "2022/MC-10213337-9999.pdf" },
    { id: "TJ37536", sys: "Sensus", t: "Real-time traffic not working", date: "2025-12-10", kind: "check",
      sym: "Traffic information missing.",
      fix: "No repair. A certificate fix comes with a newer map version the owner downloads.",
      you: "Only on cars with option code VI07.",
      pdf: NH + "2026/MC-11027178-0001.pdf" },
    { id: "TJ34508", sys: "Sensus", t: "Internet map search does not work", date: "2019", kind: "fault",
      sym: "Internet Maps search fails.", fix: "VIDA script that clears cached internet map data.", you: "Only matters if the connected maps work at all after the 3G shutdown.",
      pdf: NH + "2019/MC-10169392-9999.pdf" },
    { id: "TJ32170", sys: "Sensus", t: "Low or dropping Bluetooth call volume", date: "2017", kind: "fault",
      sym: "Callers hard to hear or calls dropping.", fix: "Check the microphone cable, then update software.", you: "Symptom-based.",
      pdf: NH + "2017/MC-10146451-9999.pdf" },
    { id: "TJ32273", sys: "Climate", t: "Rushing noise when the A/C runs", date: "2018", kind: "fault",
      sym: "Rushing or hissing from the dash when the compressor runs.", fix: "Insulate the evaporator pipes. On left-hand-drive cars this means removing the whole dashboard.", you: "A big labor job for a noise. Worth knowing before agreeing to it.",
      pdf: NH + "2018/MC-10149956-9999.pdf" },
    { id: "TJ33250", sys: "Brakes", t: "Right front pads wear early or unevenly", date: "2018", kind: "check",
      sym: "Right front pads, mostly the inner one, wear faster.", fix: "New right dust shield (32217664) and pads; rotor if scored.", you: "Applies to cars with brake code RE03. Ask the shop to compare inner and outer pad wear on the right front.",
      pdf: NH + "2018/MC-10234735-9999.pdf" },
    { id: "TJ30393", sys: "Brakes", t: "Front brake moan", date: "2017", kind: "check",
      sym: "Moaning from the front brakes.", fix: "Fit an active damper.", you: "Brake codes RE03 and RE02 only.",
      pdf: NH + "2017/MC-10130192-9999.pdf" },
    { id: "TJ32509", sys: "Body", t: "Front seatback has too much play", date: "2017", kind: "fault",
      sym: "Seatback rocks or clunks.", fix: "Whiplash service kit.", you: "Symptom-based.",
      pdf: NH + "2017/MC-10127328-9999.pdf" }
  ];
  var NOT = [
    ["TJ34588", "High oil consumption, engine 61", "Five-cylinder B5254T12 only.", NH + "2020/MC-10172470-9999.pdf"],
    ["TJ32169, TJ33901, TJ29078", "Shift quality", "Older 6-speed TF-80SC. Your car has the 8-speed TG-81SC.", NH + "2019/MC-10165235-9999.pdf"],
    ["TJ35037", "Infotainment reboot loop", "XC90 only.", NH + "2019/MC-10234695-9999.pdf"],
    ["TJ34551, TJ35912", "Various", "SPA platform (90-series cars).", ""]
  ];
  var ST = { have: ["I have this", "concern"], ask: ["Ask a shop", "watch"], done: ["Done / checked", "ok"], skip: ["Not relevant", "none"] };
  var ui = { sys: "All", open: {} };
  function data(api) { var d = api.mod("tsb"); if (!d) { d = { build: "", mark: {} }; api.setMod("tsb", d); } return d; }
  function weeks(build) {
    var m = /^(\d{4})-(\d{2})$/.exec(build || ""); if (!m) return null;
    var y = +m[1], mo = +m[2];
    return { a: y * 100 + Math.max(1, Math.floor((mo - 1) * 4.345) + 1), b: y * 100 + Math.min(53, Math.ceil(mo * 4.345)) };
  }
  function chassis(api) { var g = api.mod("glove"), v = g && g.docs && g.docs.vin; v = String(v || "").toUpperCase(); return /^[A-HJ-NPR-Z0-9]{17}$/.test(v) ? parseInt(v.slice(11), 10) : null; }
  function fits(api, b) {
    var w = weeks(data(api).build);
    if (b.kind === "check") return { s: "check", w: "Depends on equipment or past repairs" };
    if (!b.lim && !b.from) return { s: "yes", w: b.kind === "info" ? "Covers your engine" : "Covers your car" };
    if (!w) return { s: "check", w: "Add your build month to check" };
    if (b.from && w.b < b.from) return { s: "no", w: "Built before this range" };
    if (b.lim && w.a > b.lim) return { s: "no", w: "Built after the fix" };
    if (b.lim && w.b > b.lim) return { s: "maybe", w: "Your build month straddles the cut-off week" };
    return { s: "yes", w: "Inside the production range" };
  }
  var FIT = { yes: ["Applies", "concern"], maybe: ["Borderline", "watch"], check: ["Check", "info"], no: ["Not yours", "ok"] };
  function shopSheet(api) {
    var d = data(api), list = TSB.filter(function (b) { return d.mark[b.id] === "ask" || d.mark[b.id] === "have"; });
    if (!list.length) return "";
    return "2016 Volvo V60 T5 Drive-E (engine code 40, type 155). Please check these Volvo bulletins:\n" + list.map(function (b) { return "- " + b.id + ": " + b.t + (d.mark[b.id] === "have" ? " (I have this symptom)" : ""); }).join("\n");
  }
  function render(api) {
    var $ = api.$, esc = api.esc, d = data(api), ch = chassis(api);
    $("tbBuild").value = d.build || "";
    var oilCh = ch == null ? "Add your VIN in Glovebox and this checks the chassis range for you." : (ch >= 185883 && ch <= 326049 ? "Your chassis number " + ch + " is inside the program range (0185883–0326049)." : "Your chassis number " + ch + " is outside the program range (0185883–0326049).");
    $("tbOil").innerHTML = '<p>Volvo ran an oil consumption extended warranty for Drive-E engines (test program P10207, repair P10186), mailed from January 2023: 8 years from first delivery or 100,000 miles, original engine, authorized Volvo retailer only.</p><p><b>' + esc(oilCh) + "</b> Your mileage would still qualify, but a 2016 delivered in 2015 or 2016 ran out of time in 2023–24. It would only still be live if the car's first delivery was in October 2018 or later. A dealer can confirm in Warranty Vehicle Inquiry. The related class action (Buchanan v. Volvo Car USA) ended in a confidential settlement.</p><p class=\"status\">Sources: <a href=\"" + NH + "2023/MC-10242508-9999.pdf\" target=\"_blank\" rel=\"noopener\">P10186</a>, <a href=\"" + NH + "2023/MC-10231933-9999.pdf\" target=\"_blank\" rel=\"noopener\">P10207</a>, <a href=\"https://bergermontague.com/cases/buchanan-et-al-v-volvo-car-usa-llc-et-al\" target=\"_blank\" rel=\"noopener\">Berger Montague</a></p>";
    var systems = ["All"].concat(TSB.map(function (b) { return b.sys; }).filter(function (s, i, a) { return a.indexOf(s) === i; }));
    $("tbFilter").innerHTML = systems.map(function (s) { return '<button type="button" data-tbsys="' + esc(s) + '" aria-pressed="' + (ui.sys === s) + '">' + esc(s) + "</button>"; }).join("");
    var rows = TSB.filter(function (b) { return ui.sys === "All" || b.sys === ui.sys; });
    var counts = { yes: 0, maybe: 0, check: 0, no: 0 }; TSB.forEach(function (b) { counts[fits(api, b).s]++; });
    $("tbSum").innerHTML = '<span class="pill concern">' + counts.yes + ' apply</span> <span class="pill watch">' + counts.maybe + ' borderline</span> <span class="pill info">' + counts.check + ' to check</span> <span class="pill ok">' + counts.no + " not yours</span>";
    $("tbList").innerHTML = rows.map(function (b) {
      var f = fits(api, b), m = d.mark[b.id], open = ui.open[b.id];
      return '<li class="tsb' + (b.star ? " star" : "") + '"><button type="button" class="tsbh" data-tbopen="' + b.id + '" aria-expanded="' + !!open + '"><span class="pill ' + FIT[f.s][1] + '">' + FIT[f.s][0] + '</span><span class="tt"><b>' + esc(b.t) + '</b><small>' + esc(b.id) + " · " + esc(b.sys) + " · " + esc(b.date) + (m ? " · " + esc(ST[m][0]) : "") + "</small></span></button>" +
        (open ? '<div class="tsbb"><p class="status">' + esc(f.w) + '</p><dl class="kv"><dt>Symptom</dt><dd>' + esc(b.sym) + "</dd><dt>Dealer fix</dt><dd>" + esc(b.fix) + '</dd><dt>For your car</dt><dd>' + esc(b.you) + '</dd></dl><div class="seg">' + Object.keys(ST).map(function (k) { return '<button type="button" data-tbmark="' + b.id + ":" + k + '" aria-pressed="' + (m === k) + '">' + ST[k][0] + "</button>"; }).join("") + '</div><div class="row"><a href="' + esc(b.pdf) + '" target="_blank" rel="noopener">Read the bulletin (NHTSA PDF)</a>' + (b.go || []).map(function (g) { return '<button type="button" class="quiet" data-jump="' + esc(g[1]) + '">' + esc(g[0]) + "</button>"; }).join("") + "</div></div>" : "") + "</li>";
    }).join("");
    $("tbNot").innerHTML = NOT.map(function (n) { return "<li><b>" + esc(n[0]) + "</b> " + esc(n[1]) + ': <span class="status">' + esc(n[2]) + "</span>" + (n[3] ? ' <a href="' + esc(n[3]) + '" target="_blank" rel="noopener">PDF</a>' : "") + "</li>"; }).join("");
    var sheet = shopSheet(api);
    $("tbSheet").textContent = sheet || "Mark bulletins as \"Ask a shop\" or \"I have this\" and they collect here as a note you can copy into a text or email to a shop.";
    $("tbCopy").disabled = !sheet;
  }
  (window.V60_MODULES = window.V60_MODULES || []).push({
    id: "tsb",
    tabs: [{ id: "bulletins", section: "check", label: "Bulletins", order: 35, html:
      '<section><h2>Service bulletins</h2><p class="lede">Volvo\'s repair instructions for known problems, read from the copies NHTSA publishes. In Volvo\'s tables your engine is code 40 and the V60 is type 155. A bulletin is not a recall: dealers apply it when the symptom shows, and you pay unless a warranty or program covers it.</p></section>' +
      '<section class="card"><h3>Your build date</h3><p class="status">Printed on the label on the driver\'s door pillar (month/year). Several bulletins only cover cars built before a certain week.</p><div class="row"><div class="field"><label for="tbBuild">Build month</label><input id="tbBuild" type="month" min="2013-01" max="2016-12"></div><div id="tbSum" class="row"></div></div><div class="row"><button class="btn" id="tbScan" type="button">Scan the label with the camera</button><input id="tbScanIn" type="file" accept="image/*" hidden></div><p class="status" id="tbScanMsg" aria-live="polite">The photo is read on this phone. Your VIN on the label is blacked out before anything is saved. The month it reads is unconfirmed until you check it against the label.</p></section>' +
      '<section class="card"><h3>Oil consumption program</h3><div id="tbOil"></div></section>' +
      '<section><div class="seg" id="tbFilter" role="group" aria-label="Filter by system"></div><ul class="tsbs" id="tbList"></ul></section>' +
      '<section class="card"><h3>Shop note</h3><pre class="sheet" id="tbSheet"></pre><div class="row"><button type="button" class="quiet" id="tbCopy">Copy note</button><span class="status" id="tbCopySt"></span></div></section>' +
      '<section class="card"><details><summary>Bulletins that do not apply to your car</summary><ul class="plain" id="tbNot"></ul><p class="status">NHTSA indexes 349 manufacturer documents for the 2016 V60. None found for 8-speed shift quality, start/stop, the turbo or a stand-alone timing belt bulletin.</p></details></section>' }],
    clean: function (v) { if (!v || typeof v !== "object") return null; var o = { build: /^\d{4}-\d{2}$/.test(v.build || "") ? v.build : "", mark: {} }; Object.keys(v.mark || {}).forEach(function (k) { if (ST[v.mark[k]]) o.mark[k] = v.mark[k]; }); return o; },
    render: function (api) { render(api); },
    init: function (api) {
      var $ = api.$;
      $("tbBuild").addEventListener("change", function () { data(api).build = /^\d{4}-\d{2}$/.test(this.value) ? this.value : ""; api.save(); render(api); });
      $("tbScan").addEventListener("click", function () { if (!window.V60_SCAN) { $("tbScanMsg").textContent = "The photo reader is not loaded. Type the month above instead."; return; } $("tbScanIn").value = ""; $("tbScanIn").click(); });
      $("tbScanIn").addEventListener("change", function () {
        var f = this.files && this.files[0]; if (!f) return;
        window.V60_SCAN.process(f, "door").then(function () { render(api); var b = data(api).build; $("tbScanMsg").textContent = b ? "Build month " + b + " saved. Check it against the label." : "No build month was saved. Type it in above."; }).catch(function (e) { if (!e || e.code !== "cancelled") $("tbScanMsg").textContent = "Could not read the photo. Type the month above instead."; });
      });
      $("p-bulletins").addEventListener("click", function (e) {
        var b = e.target.closest && e.target.closest("button"); if (!b) return;
        var s = b.getAttribute("data-tbsys"); if (s) { ui.sys = s; render(api); return; }
        var o = b.getAttribute("data-tbopen"); if (o) { ui.open[o] = !ui.open[o]; render(api); return; }
        var mk = b.getAttribute("data-tbmark"); if (mk) { var p = mk.split(":"), d = data(api); if (d.mark[p[0]] === p[1]) delete d.mark[p[0]]; else d.mark[p[0]] = p[1]; api.save(); api.updateHud(); render(api); return; }
      });
      $("tbCopy").addEventListener("click", function () { var t = shopSheet(api); try { navigator.clipboard.writeText(t).then(function () { $("tbCopySt").textContent = "Copied."; }, function () { $("tbCopySt").textContent = "Select the text and copy it."; }); } catch (e) { $("tbCopySt").textContent = "Select the text and copy it."; } });
    },
    xp: function (api) { var d = api.mod("tsb"); if (!d) return 0; return (d.build ? 20 : 0) + Object.keys(d.mark).length * 5; },
    actions: function (api, list) {
      var d = api.mod("tsb") || { build: "", mark: {} };
      if (!d.build) list.push({ sev: 22, text: "Add your build month from the door-pillar label so the Bulletins tab can tell which Volvo bulletins cover your car.", jump: "tab:bulletins" });
      var have = TSB.filter(function (b) { return d.mark[b.id] === "have"; });
      if (have.length) list.push({ sev: 48, text: have.length + " bulletin symptom" + (have.length === 1 ? "" : "s") + " marked on your car (" + have.map(function (b) { return b.id; }).join(", ") + "). Copy the shop note before your next visit.", jump: "tab:bulletins" });
    },
    jump: function (api, kind, id) { if (kind === "tsb") { ui.open[id] = true; api.go("bulletins"); return true; } return false; }
  });
  window.V60_TSB = TSB;
})();
