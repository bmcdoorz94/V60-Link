/* Problem cases (2026-11-27): mechanical problems no computer reports (noises, vibration, pulling, brake feel, clunks,
   leaks, tire wear). Kyle describes what he notices or sends a photo; it goes to his PC (POST https://<pc>/drives/case,
   bridge/drives.js), which wakes Claude. Claude keeps a case file per problem (likely causes ranked by the evidence, the
   one check that splits them, safety, sources) in bridge/data/notes/cases.json; the PC's summary.json carries it and
   this page shows it (window.V60_DRIVES.data().cases). Photos go through api.shrinkPhoto (shrunk, personal details
   blacked out) and are sent as JPEG; they are kept on the PC, not in the synced state. Nothing here is saved in the
   Garage's state except what was last sent (mod "cases"). */
(function () {
  var API = null, $ = function (id) { return document.getElementById(id); };
  var WHAT = ["Noise", "Vibration or shake", "Pulls or wanders", "Steering feels wrong", "Brakes feel or sound wrong", "Clunk over bumps", "Rides rough or bouncy", "Leak, drip or smell", "Tire wear or a tire problem", "Something else"];
  var WHEN = ["At idle", "Accelerating", "Steady speed", "Braking", "Turning left", "Turning right", "Over bumps", "When cold", "When warm", "All the time"];
  var WHERE = ["Front", "Rear", "Left", "Right", "Under the car", "Not sure"];
  var PHOTO = ["Tire tread and edges", "Brake pad or rotor", "Leak or drip under the car", "Axle boot (CV boot)", "Suspension or steering part", "Something else"];
  var sel = { when: {}, where: {} };

  function esc(s) { return API ? API.esc(s) : String(s); }
  function host() { return window.V60_DRIVES && window.V60_DRIVES.host ? window.V60_DRIVES.host() : null; }
  function day(s) { if (!s) return ""; var d = new Date(s); if (!isFinite(d)) return ""; try { return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }); } catch (e) { return String(s).slice(0, 10); } }
  function cases() { var d = window.V60_DRIVES && window.V60_DRIVES.data && window.V60_DRIVES.data(); return d && Array.isArray(d.cases) ? d.cases : []; }

  function segHtml(id, list, group) {
    return '<div class="seg cs-seg" id="' + id + '" role="group">' + list.map(function (x) { return '<button type="button" aria-pressed="false" data-csg="' + group + '" data-csv="' + esc(x) + '">' + esc(x) + "</button>"; }).join("") + "</div>";
  }
  var SAFE = { stop: ["bad", "Don't drive"], caution: ["watch", "Caution"], ok: ["ok", "Safe to drive"] };
  var LIKE = { likely: "watch", possible: "info", unlikely: "none" };
  function caseHtml(c) {
    var s = SAFE[c.safety] || null, st = c.status === "fixed" ? ["ok", "Fixed"] : c.status === "watching" ? ["info", "Watching"] : ["watch", "Open"];
    var h = '<article class="cs-case"><div class="cs-head"><h3>' + esc(c.title) + '</h3><span class="pill ' + st[0] + '">' + st[1] + "</span>" + (s ? '<span class="pill ' + s[0] + '">' + s[1] + "</span>" : "") + "</div>";
    if (c.summary) h += "<p>" + esc(c.summary) + "</p>";
    if (c.next && c.next.check) h += '<p class="cs-next"><b>Next check:</b> ' + esc(c.next.check) + (c.next.how ? '<span class="status"> ' + esc(c.next.how) + "</span>" : "") + "</p>";
    if (c.causes.length) h += '<ul class="plain cs-causes">' + c.causes.map(function (x) { return '<li><span class="pill ' + (LIKE[x.likelihood] || "none") + '">' + esc(x.likelihood || "?") + "</span> <b>" + esc(x.cause) + "</b>" + (x.why ? ' <span class="status">' + esc(x.why) + "</span>" : "") + "</li>"; }).join("") + "</ul>";
    var more = "";
    if (c.evidence.length) more += '<ul class="plain">' + c.evidence.map(function (e) { return "<li>" + esc(day(e.at) + " · " + e.kind + ": " + e.text) + "</li>"; }).join("") + "</ul>";
    if (c.sources.length) more += '<p class="status">Sources: ' + c.sources.map(function (x) { return '<a href="' + esc(x[1]) + '" target="_blank" rel="noopener">' + esc(x[0]) + "</a>"; }).join(" · ") + "</p>";
    if (more) h += "<details><summary>Evidence and sources</summary>" + more + "</details>";
    return h + '<p class="status">' + esc([c.area, c.opened ? "opened " + day(c.opened) : "", c.updated ? "updated " + day(c.updated) : ""].filter(Boolean).join(" · ")) + "</p></article>";
  }

  function render(api) {
    API = api;
    var list = cases(), open = list.filter(function (c) { return c.status !== "fixed"; }), done = list.filter(function (c) { return c.status === "fixed"; });
    var box = $("csCases"); if (!box) return;
    box.innerHTML = list.length ? open.map(caseHtml).join("") + (done.length ? "<details><summary>" + done.length + " fixed</summary>" + done.map(caseHtml).join("") + "</details>" : "")
      : '<p class="status">No cases yet. Describe a problem or send a photo below; Claude opens a case for it here.</p>';
    var pc = host();
    $("csPc").textContent = pc ? "" : "Claude live is not set up on this device (Link > Claude live), so reports cannot reach your PC yet.";
    $("csSend").disabled = !pc; $("csPhotoBtn").disabled = !pc;
  }

  function post(body) {
    var h = host(); if (!h) return Promise.reject(new Error("no PC address"));
    return fetch("https://" + h + "/drives/case", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); });
  }
  function picked(group) { return Object.keys(sel[group]).filter(function (k) { return sel[group][k]; }); }
  function sendReport() {
    var text = ($("csText").value || "").trim();
    if (text.length < 5) { $("csMsg").textContent = "Say in a few words what you notice."; return; }
    var body = { kind: "symptom", what: $("csWhat").value, when: picked("when"), where: picked("where").join(", "), speed: ($("csSpeed").value || "").trim(), since: ($("csSince").value || "").trim(), text: text };
    $("csSend").disabled = true; $("csMsg").textContent = "Sending…";
    post(body).then(function () {
      var d = API.mod("cases") || {}; d.last = { at: new Date().toISOString(), what: body.what }; API.setMod("cases", d); API.save();
      $("csText").value = ""; $("csMsg").textContent = "Sent. Claude answers in a notification in a minute or two, and the case appears above.";
      setTimeout(function () { if (window.V60_DRIVES) window.V60_DRIVES.refresh(); }, 90000);
    }).catch(function () { $("csMsg").textContent = "Your PC did not answer. Is it on, and Tailscale on here?"; })
      .then(function () { $("csSend").disabled = !host(); });
  }
  function toJpeg(blob) {
    return new Promise(function (res, rej) {
      var img = new Image(), url = URL.createObjectURL(blob);
      img.onload = function () {
        var k = Math.min(1, 1600 / Math.max(img.width, img.height)), c = document.createElement("canvas");
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        res(c.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = function () { URL.revokeObjectURL(url); rej(new Error("not an image")); };
      img.src = url;
    });
  }
  function sendPhoto(file) {
    $("csPhotoMsg").textContent = "Preparing the photo (personal details are blacked out first)…";
    var shrink = API.shrinkPhoto ? API.shrinkPhoto(file, "photo") : Promise.resolve(file);
    shrink.then(toJpeg).then(function (jpg) {
      $("csPhotoMsg").textContent = "Sending…";
      return post({ kind: "photo", what: $("csPhotoWhat").value, note: ($("csPhotoNote").value || "").trim(), image: jpg });
    }).then(function () {
      $("csPhotoNote").value = ""; $("csPhotoMsg").textContent = "Sent. Claude looks at it and answers in a notification; the case appears above.";
      setTimeout(function () { if (window.V60_DRIVES) window.V60_DRIVES.refresh(); }, 90000);
    }).catch(function (e) { $("csPhotoMsg").textContent = /image/.test(e && e.message) ? "That file could not be read as a photo." : "Your PC did not answer. Is it on, and Tailscale on here?"; });
  }

  (window.V60_MODULES = window.V60_MODULES || []).push({
    id: "cases",
    tabs: [{ id: "cases", section: "trouble", label: "Problem cases", order: 20, html:
      '<section><h2>Problem cases</h2><p class="lede">Noises, vibration, pulling, brake feel, clunks, leaks and tire wear: things no computer in the car reports. Describe what you notice or send a photo. Claude, on your PC, ranks the likely causes by what you report, says whether it is safe to drive, and gives the one check that tells the causes apart. Each problem keeps its case file here.</p></section>' +
      '<section class="card"><div id="csCases"></div></section>' +
      '<section class="card"><h3>Describe a problem</h3>' +
        '<label class="cs-l">What is it<select id="csWhat">' + WHAT.map(function (x) { return "<option>" + x + "</option>"; }).join("") + "</select></label>" +
        '<p class="cs-l">When does it happen</p>' + segHtml("csWhen", WHEN, "when") +
        '<p class="cs-l">Where does it seem to come from</p>' + segHtml("csWhere", WHERE, "where") +
        '<div class="row"><label class="cs-l">Around what speed (mph)<input id="csSpeed" inputmode="numeric" maxlength="20" placeholder="e.g. 55-65"></label>' +
        '<label class="cs-l">Since when<input id="csSince" maxlength="60" placeholder="e.g. last week, after new tires"></label></div>' +
        '<label class="cs-l">In your words<textarea id="csText" rows="4" maxlength="1500" placeholder="What you hear, feel or see, and anything that makes it better or worse."></textarea></label>' +
        '<div class="row"><button type="button" id="csSend">Send to Claude</button><span class="status" id="csMsg"></span></div></section>' +
      '<section class="card"><h3>Send a photo for Claude to inspect</h3>' +
        '<label class="cs-l">What is in the photo<select id="csPhotoWhat">' + PHOTO.map(function (x) { return "<option>" + x + "</option>"; }).join("") + "</select></label>" +
        '<label class="cs-l">Note (optional)<input id="csPhotoNote" maxlength="600" placeholder="e.g. front left, the side that clunks"></label>' +
        '<div class="row"><button type="button" id="csPhotoBtn">Take or choose a photo</button><input type="file" id="csPhotoIn" accept="image/*" capture="environment" hidden><span class="status" id="csPhotoMsg"></span></div>' +
        '<details><summary>Getting a useful photo</summary><ul class="plain"><li>Tire wear: turn the steering fully so the front tire sticks out, then photograph across the tread so both edges show.</li><li>Brakes: through the wheel spokes, with the flash on; the pad edge and the rotor face.</li><li>Leaks: leave a sheet of cardboard under the engine overnight, then photograph the drips and where they landed.</li><li>Axle boots: behind the front wheel, turned fully; a tear or grease spray is what to look for.</li></ul></details></section>' +
      '<p class="status" id="csPc"></p><p class="status">Reports and photos go to your PC over Tailscale and stay there; photos are shrunk and personal details blacked out first. Claude\'s causes are leads to check, not a diagnosis; anything about brakes, steering or a tire is marked with whether it is safe to drive.</p>' }],
    clean: function (v) { if (!v || typeof v !== "object") return null; var l = v.last && typeof v.last === "object" && typeof v.last.at === "string" ? { at: v.last.at.slice(0, 40), what: String(v.last.what || "").slice(0, 60) } : null; return l ? { last: l } : null; },
    render: function (api) { render(api); },
    init: function (api) {
      API = api;
      $("p-cases").addEventListener("click", function (e) {
        var b = e.target.closest && e.target.closest("button[data-csg]"); if (!b) return;
        var g = b.getAttribute("data-csg"), v = b.getAttribute("data-csv"), on = b.getAttribute("aria-pressed") !== "true";
        b.setAttribute("aria-pressed", on ? "true" : "false"); sel[g][v] = on;
      });
      $("csSend").addEventListener("click", sendReport);
      $("csPhotoBtn").addEventListener("click", function () { $("csPhotoIn").value = ""; $("csPhotoIn").click(); });
      $("csPhotoIn").addEventListener("change", function () { var f = this.files && this.files[0]; if (f) sendPhoto(f); });
    },
    /* Home and Health: an open case Claude marked unsafe or cautious */
    actions: function (api, list) {
      cases().forEach(function (c) {
        if (c.status === "fixed") return;
        if (c.safety === "stop") list.push({ sev: 95, text: "Don't drive until checked: " + c.title + ".", jump: "tab:cases" });
        else if (c.safety === "caution") list.push({ sev: 60, text: "Problem case: " + c.title + (c.next && c.next.check ? ". Next: " + c.next.check : "") + ".", jump: "tab:cases" });
      });
    }
  });
})();
