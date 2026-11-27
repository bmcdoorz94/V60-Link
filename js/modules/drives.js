/* Recorded drives (2026-11-26): the V60 iPhone app records every drive and Kyle's PC sums them up at
   https://<pc>/drives/summary.json (bridge/drives.js, reachable only from Kyle's own devices over Tailscale).
   This module reads that summary and gives the rest of the app:
   - window.V60_DRIVES.since(iso): miles from drives that started after a time. core's odoEst() adds them to the last
     odometer reading entered, so service intervals stay current. The entered reading is never changed.
   - a "Recorded drives" card on Maintain (last drive, this week, estimated mpg, links to the PC's reports)
   - emissions readiness from the newest drive that read it (Glovebox, next to the inspection date; Health when it would fail)
   The PC address: window.V60_NATIVE.pc inside the iPhone app, else the Claude live pairing (localStorage v60-claude).
   No address, or no answer: nothing is shown. The summary is cached on this device (localStorage v60-drives), never synced. */
(function () {
  var API = null, data = null, fetchedAt = 0, busy = false, KEY = "v60-drives", STALE = 10 * 60 * 1000;
  function esc(s) { return API ? API.esc(s) : String(s); }
  function fmt(n) { return API ? API.fmt(n) : String(n); }
  function num(x, lo, hi) { return typeof x === "number" && isFinite(x) && x >= lo && x <= hi ? x : null; }
  function iso(x) { return typeof x === "string" && /^\d{4}-\d\d-\d\dT/.test(x) && isFinite(Date.parse(x)) ? x.slice(0, 40) : null; }
  function https(x) { return typeof x === "string" && /^https:\/\/[^\s"'<>]+$/.test(x) ? x.slice(0, 300) : null; }

  function host() {
    var h = null;
    try { if (window.V60_NATIVE && window.V60_NATIVE.pc) h = String(window.V60_NATIVE.pc); } catch (e) {}
    if (!h) try { var c = JSON.parse(localStorage.getItem("v60-claude") || "null"); if (c && c.host) h = String(c.host); } catch (e) {}
    if (!h) return null;
    h = h.trim().replace(/^[a-z]+:\/\//i, "").replace(/\/.*$/, "");
    return /^[a-z0-9.-]+(:\d{1,5})?$/i.test(h) ? h : null;
  }

  /* keep only what the page uses, in the shapes it expects */
  function clean(raw) {
    if (!raw || typeof raw !== "object" || !Array.isArray(raw.drives)) return null;
    var drives = raw.drives.slice(0, 400).map(function (d) {
      if (!d || typeof d !== "object" || !iso(d.start)) return null;
      var nr = Array.isArray(d.notReady) ? d.notReady.filter(function (x) { return typeof x === "string"; }).slice(0, 12).map(function (x) { return x.slice(0, 60); }) : null;
      return { id: String(d.id || "").slice(0, 40), start: iso(d.start), end: iso(d.end), minutes: num(d.minutes, 0, 1440), miles: num(d.miles, 0, 1500) || 0, mpg: num(d.mpg, 1, 150),
        mil: typeof d.mil === "boolean" ? d.mil : null, dtcs: num(d.dtcs, 0, 99), notReady: nr, url: https(d.url) };
    }).filter(Boolean).sort(function (a, b) { return a.start < b.start ? 1 : -1; });
    var L = raw.links && typeof raw.links === "object" ? raw.links : {};
    var T = raw.totals && typeof raw.totals === "object" ? raw.totals : {};
    return { updated: iso(raw.updated), drives: drives, totals: { drives: num(T.drives, 0, 1e6), miles: num(T.miles, 0, 1e7), first: iso(T.first) },
      links: { all: https(L.all), week: https(L.week), trends: https(L.trends) }, car: cleanCar(raw.car), claude: cleanClaude(raw.claude), cases: cleanCases(raw.cases), recommendations: cleanReco(raw.recommendations) };
  }
  /* Claude's recommendations (bridge/data/notes/recommendations.json; shown by reco.js) */
  function cleanReco(r) {
    if (!r || typeof r !== "object" || !Array.isArray(r.items)) return null;
    var items = r.items.slice(0, 40).map(function (x) {
      if (!x || typeof x !== "object" || !str(x.title, 120) || !/^[\w.-]{1,60}$/.test(String(x.id || ""))) return null;
      return { id: String(x.id), kind: pick(x.kind, ["maintenance", "repair", "performance", "cosmetic"], "maintenance"), title: str(x.title, 120), when: pick(x.when, ["now", "soon", "later"], "later"),
        why: str(x.why, 500), evidence: str(x.evidence, 600), effort: pick(x.effort, ["diy", "shop", "either"], ""), cost: str(x.cost, 160), confidence: pick(x.confidence, ["confirmed", "likely", "unconfirmed"], "likely"),
        sources: (Array.isArray(x.sources) ? x.sources : []).slice(0, 8).map(function (s) { return Array.isArray(s) && str(s[0], 120) && https(s[1]) ? [str(s[0], 120), https(s[1])] : null; }).filter(Boolean) };
    }).filter(Boolean);
    return { updated: iso(r.updated), items: items };
  }
  /* Claude's case files for mechanical problems (bridge/data/notes/cases.json; shown by cases.js) */
  function str(x, n) { return typeof x === "string" ? x.slice(0, n) : ""; }
  function pick(x, ok, d) { return ok.indexOf(x) >= 0 ? x : d; }
  function cleanCases(list) {
    if (!Array.isArray(list)) return [];
    return list.slice(0, 30).map(function (c) {
      if (!c || typeof c !== "object" || !str(c.title, 120)) return null;
      return { id: str(c.id, 60), title: str(c.title, 120), status: pick(c.status, ["open", "watching", "fixed"], "open"), area: str(c.area, 30), safety: pick(c.safety, ["ok", "caution", "stop"], null),
        opened: iso(c.opened) || iso(c.updated), updated: iso(c.updated), summary: str(c.summary, 600),
        causes: (Array.isArray(c.causes) ? c.causes : []).slice(0, 8).map(function (x) { return x && str(x.cause, 120) ? { cause: str(x.cause, 120), likelihood: pick(x.likelihood, ["likely", "possible", "unlikely"], "possible"), why: str(x.why, 400) } : null; }).filter(Boolean),
        next: c.next && typeof c.next === "object" && str(c.next.check, 300) ? { check: str(c.next.check, 300), how: str(c.next.how, 600) } : null,
        evidence: (Array.isArray(c.evidence) ? c.evidence : []).slice(0, 20).map(function (e) { return e && str(e.text, 400) ? { at: iso(e.at) || "", kind: str(e.kind, 20) || "note", text: str(e.text, 400) } : null; }).filter(Boolean),
        sources: (Array.isArray(c.sources) ? c.sources : []).slice(0, 10).map(function (s) { return Array.isArray(s) && str(s[0], 120) && https(s[1]) ? [str(s[0], 120), https(s[1])] : null; }).filter(Boolean) };
    }).filter(Boolean);
  }
  /* what the PC read from the car when it last started (bridge/auto.js): odometer if the car reports it, light, codes */
  function codeList(x) { return Array.isArray(x) ? x.filter(function (c) { return typeof c === "string" && /^[PCBU][0-9A-F]{4}$/.test(c); }).slice(0, 20) : null; }
  function cleanCar(c) {
    if (!c || typeof c !== "object") return null;
    var o = c.odometer && typeof c.odometer === "object" && num(c.odometer.miles, 1, 2e6) && iso(c.odometer.at) ? { miles: c.odometer.miles, at: iso(c.odometer.at) } : null;
    var k = c.codes && typeof c.codes === "object" ? { stored: codeList(c.codes.stored), pending: codeList(c.codes.pending), permanent: codeList(c.codes.permanent) } : null;
    return { odometer: o, odometerListed: c.odometerListed === true, at: iso(c.at), mil: typeof c.mil === "boolean" ? c.mil : null, dtcCount: num(c.dtcCount, 0, 127),
      milMiles: num(c.milMiles, 0, 1e5), clearedMiles: num(c.clearedMiles, 0, 1e5), codes: k };
  }
  function cleanClaude(c) {
    if (!c || typeof c !== "object" || typeof c.text !== "string" || !iso(c.at)) return null;
    return { text: c.text.slice(0, 1200), at: iso(c.at), url: https(c.url) };
  }
  /* the car's own odometer reading (01 A6), when this car reports it */
  function carOdo() { return data && data.car && data.car.odometer ? data.car.odometer : null; }
  function loadCache() { try { var c = JSON.parse(localStorage.getItem(KEY) || "null"); if (c && c.data) { data = clean(c.data); fetchedAt = +c.at || 0; } } catch (e) {} }
  function saveCache() { try { localStorage.setItem(KEY, JSON.stringify({ at: fetchedAt, data: data })); } catch (e) {} }

  /* an odometer typed before drives were counted has no time: count from the first time drives are seen, never before */
  function stampOdo() {
    var st = API && API.state; if (!st || st.odo == null || st.odoAt) return;
    st.odoAt = new Date().toISOString(); API.save();
  }
  function refresh(force) {
    var h = host(); if (!h || busy || !window.fetch) return;
    if (!force && Date.now() - fetchedAt < STALE) return;
    busy = true;
    var ctl = window.AbortController ? new AbortController() : null, t = setTimeout(function () { if (ctl) ctl.abort(); }, 8000);
    fetch("https://" + h + "/drives/summary.json", { cache: "no-store", signal: ctl ? ctl.signal : undefined })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (j) { var d = clean(j); if (!d) return; data = d; fetchedAt = Date.now(); saveCache(); stampOdo(); if (API) API.renderAll(); })
      .catch(function () {})
      .then(function () { clearTimeout(t); busy = false; });
  }

  /* ---------- figures ---------- */
  function since(at) {
    if (!data || !at) return null;
    var m = 0, n = 0;
    data.drives.forEach(function (d) { if (d.start > at && Date.parse(d.start) > Date.parse(at)) { m += d.miles; n++; } });
    return { miles: Math.round(m * 10) / 10, drives: n };
  }
  function lastDays(days) {
    var cut = Date.now() - days * 864e5;
    return data ? data.drives.filter(function (d) { return Date.parse(d.start) >= cut; }) : [];
  }
  /* miles-weighted: total miles over total estimated gallons */
  function mpgOf(list) {
    var mi = 0, gal = 0;
    list.forEach(function (d) { if (d.mpg && d.miles > 0) { mi += d.miles; gal += d.miles / d.mpg; } });
    return gal > 0 ? Math.round(mi / gal * 10) / 10 : null;
  }
  function when(s) {
    var d = new Date(s); if (!isFinite(d.getTime())) return s;
    try { return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) + ", " + d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }); } catch (e) { return s.slice(0, 16).replace("T", " "); }
  }
  function day(s) { var d = new Date(s); try { return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }); } catch (e) { return s.slice(0, 10); } }

  /* emissions readiness from the newest drive that read it. Rule: 40 CFR 85.2222 — a lit check-engine light fails;
     a 2001 or newer car may have at most one monitor not ready. */
  function readiness() {
    if (!data) return null;
    var d = data.drives.filter(function (x) { return x.mil !== null || x.notReady !== null; })[0];
    if (!d) return null;
    var nr = d.notReady || [], r = { drive: d, mil: d.mil, notReady: nr, dtcs: d.dtcs };
    if (d.mil) { r.pill = "bad"; r.label = "Would fail"; r.line = "The check-engine light was on" + (d.dtcs ? ", with " + d.dtcs + " stored code" + (d.dtcs === 1 ? "" : "s") : "") + ". A lit light fails the emissions test."; }
    else if (nr.length > 1) { r.pill = "watch"; r.label = "Not ready"; r.line = nr.length + " self-tests not ready: " + nr.join(", ") + ". The test allows one. Normal driving over a few days usually completes them."; }
    else if (d.notReady === null) { r.pill = "none"; r.label = "Partial"; r.line = "Check-engine light off. This drive did not read the self-tests."; }
    else { r.pill = "ok"; r.label = "Ready"; r.line = "Check-engine light off" + (nr.length ? "; one self-test not ready (" + nr[0] + "), which the test allows." : "; every self-test complete."); }
    r.when = "From the drive on " + when(d.start) + ". The car's own readiness report, not the official test.";
    return r;
  }
  var CFR = "https://www.customsmobile.com/regulations/title40_chapterI-i24_part85_subpartW_section85.2222";

  /* ---------- the Maintain card ---------- */
  function link(href, text) { return href ? '<a class="mn-chip" href="' + esc(href) + '" target="_blank" rel="noopener">' + esc(text) + "</a>" : ""; }
  function row(title, line, pill, label, href) {
    var inner = '<span class="hm-b"><span class="hm-t">' + title + "</span>" + (line ? '<span class="hm-s">' + line + "</span>" : "") + "</span>" + (label ? '<span class="pill ' + pill + '">' + esc(label) + "</span>" : "");
    return href ? '<a class="hm-row" href="' + esc(href) + '" target="_blank" rel="noopener">' + inner + "</a>" : '<div class="hm-row hm-static">' + inner + "</div>";
  }
  function cardHtml(api) {
    API = api;
    if (!data) return "";
    stampOdo();
    var st = api.state, oe = api.odoEst ? api.odoEst() : { miles: st.odo, est: false }, last = data.drives[0], wk = lastDays(7), h = "";
    h += '<section class="hm-sec" id="drives"><div class="mn-kick"><span>RECORDED DRIVES</span><span>FROM THE IPHONE APP</span></div>';
    if (oe.car) h += row((oe.est ? "About " : "") + '<span class="mono">' + esc(fmt(oe.miles)) + " mi</span>", esc("Read from the car " + when(oe.at) + (oe.est ? ", plus " + fmt(oe.added) + " mi from " + oe.drives + " recorded drive" + (oe.drives === 1 ? "" : "s") + " since" : "") + "."), oe.est ? "info" : "none", oe.est ? "Estimate" : "Car");
    else if (st.odo == null) h += row("Enter your odometer", "Type the miles in the box at the top once. Recorded drives then keep the estimate current.", "watch", "Needed");
    else if (oe.est) h += row('About <span class="mono">' + esc(fmt(oe.miles)) + " mi</span>", esc(fmt(st.odo) + " entered " + day(st.odoAt) + ", plus " + fmt(oe.added) + " mi from " + oe.drives + " recorded drive" + (oe.drives === 1 ? "" : "s") + ". Estimated from recorded drives; type a new reading any time."), "info", "Estimate");
    else h += row('<span class="mono">' + esc(fmt(st.odo)) + " mi</span>", esc("Entered " + (st.odoAt ? day(st.odoAt) : "") + ". Drives recorded after that are added here as an estimate."), "none", "Entered");
    if (last) h += row("Last drive: " + esc(when(last.start)), esc([last.miles.toFixed(1) + " mi", last.minutes != null ? Math.round(last.minutes) + " min" : "", last.mpg ? last.mpg.toFixed(1) + " mpg estimated" : ""].filter(Boolean).join(" · ")), "none", last.url ? "Report" : "", last.url);
    var wm = wk.reduce(function (a, d) { return a + d.miles; }, 0), wmpg = mpgOf(wk);
    if (!data.drives.length) h += row("No drives on your PC yet", "The iPhone app sends each drive to your PC when it ends. The first one shows here.", "none", "");
    else h += row("This week: " + esc(wm.toFixed(1)) + " mi",esc(wk.length + " drive" + (wk.length === 1 ? "" : "s") + " in the last 7 days" + (wmpg ? ". About " + wmpg.toFixed(1) + " mpg, estimated" : "") + "."), "none", "", data.links.week);
    var r = readiness();
    if (r) h += row("Emissions readiness", esc(r.line + " " + r.when), r.pill, r.label);
    var links = link(data.links.all, "All drive reports") + link(data.links.week, "This week") + link(data.links.trends, "Trends");
    if (links) h += '<div class="mn-chips hm-links">' + links + "</div>";
    h += '<p class="status">Miles are added up from the car\'s speed reading once a second, and mpg is worked out from the air-flow sensor: both are estimates. ' +
      (data.updated ? "Updated " + esc(when(data.updated)) + ". " : "") + "Reports open from your PC, so it has to be on. " +
      '<a href="' + CFR + '" target="_blank" rel="noopener">Readiness rule: 40 CFR 85.2222</a>.</p></section>';
    return h;
  }
  /* one line for the Glovebox, next to the inspection date */
  function readyLine() { var r = readiness(); return r ? { pill: r.pill, label: r.label, text: r.line + " " + r.when } : null; }

  /* Home: what the PC learned from the last time the car ran, and Claude's latest message, so it is there after a drive */
  function homeHtml(api) {
    API = api;
    if (!data || (!data.car && !data.claude)) return "";
    var c = data.car, cl = data.claude, h = '<section class="hm-sec" id="fromcar"><div class="mn-kick"><span>FROM YOUR CAR</span><span>' + esc(c && c.at ? when(c.at) : cl ? when(cl.at) : "") + "</span></div>";
    if (cl) h += row("Claude: " + esc(cl.text), "", "info", cl.url ? "Report" : "", cl.url);
    if (c) {
      var all = c.codes ? [].concat(c.codes.stored || [], c.codes.pending || [], c.codes.permanent || []).filter(function (x, i, a) { return a.indexOf(x) === i; }) : [];
      var bits = [];
      if (c.codes) bits.push(all.length ? all.length + " code" + (all.length === 1 ? "" : "s") + ": " + all.join(", ") : "No codes");
      if (c.milMiles) bits.push(fmt(c.milMiles) + " mi driven with the light on");
      if (c.clearedMiles != null) bits.push(fmt(c.clearedMiles) + " mi since codes were last cleared");
      // a lit light is already listed under On the car now (Health, below); here only when it is off
      if (!c.mil && (c.mil != null || c.codes)) h += row("Check-engine light off", esc(bits.join(". ") + "."), all.length ? "watch" : "ok", all.length ? "Codes" : "OK");
      if (c.odometer) h += row('Odometer <span class="mono">' + esc(fmt(c.odometer.miles)) + " mi</span>", esc("Read from the car " + when(c.odometer.at) + "."), "none", "Car");
    }
    return h + "</section>";
  }

  window.V60_DRIVES = { since: since, data: function () { return data; }, readiness: readiness, readyLine: readyLine, html: cardHtml, homeHtml: homeHtml, carOdo: carOdo, refresh: function () { refresh(true); }, host: host };

  (window.V60_MODULES = window.V60_MODULES || []).push({
    id: "drives",
    init: function (api) {
      API = api; loadCache();
      if (data) setTimeout(stampOdo, 0);
      refresh(false);
      document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") refresh(false); });
    },
    /* Health: the emissions test would fail now */
    actions: function (api, list) {
      var c = data && data.car;
      if (c && c.mil) {
        var codes = c.codes ? [].concat(c.codes.stored || [], c.codes.permanent || [], c.codes.pending || []).filter(function (x, i, a) { return a.indexOf(x) === i; }) : [];
        list.push({ sev: 85, text: "Check-engine light on when the car last started (" + when(c.at) + ")" + (codes.length ? ": " + codes.join(", ") : "") + "." +
          (c.milMiles ? " Driven " + fmt(c.milMiles) + " mi with it on." : "") + " The emissions test fails with it lit.", jump: "tab:diag" });
        return; // the drive-based light below would say the same
      }
      var r = readiness(); if (!r) return;
      if (r.mil) list.push({ sev: 80, text: "Check-engine light on in the last drive that read it (" + day(r.drive.start) + "). The emissions test fails with it lit.", jump: "tab:diag" });
      else if (r.notReady.length > 1) list.push({ sev: 45, text: r.notReady.length + " emissions self-tests not ready (" + day(r.drive.start) + "). The test allows one.", jump: "tab:maint" });
    }
  });
})();
