/* Shared UI helpers: the car pulse strip in the header (warning lights, oil, service), and read-aloud for any element
   marked with data-speak="<css selector>". No tab of its own. */
(function () {
  var API = null, speaking = null;

  /* One way out for every file the app makes. Bluefy on iPhone cannot download (a link with a download attribute does
     nothing) and its share sheet drops attached files, passing only the title, so the content always goes as text too.
     Order: Claude's own save (inside the artifact), the share sheet, a plain download. Resolves with the route used. */
  var UA = navigator.userAgent || "", IOS = /iPhone|iPad|iPod/.test(UA), BLUEFY = /Bluefy/i.test(UA);
  function fileFor(name, text, type) { try { return new File([text], name, { type: type }); } catch (e) { return null; } }
  function anchorDownload(name, text, type) {
    var url = URL.createObjectURL(new Blob([text], { type: type })), a = document.createElement("a");
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }
  function saveFile(name, text, type) {
    type = type || "text/plain";
    var viaClaude = API && API.claudeUse ? API.claudeUse("downloads").catch(function () { return null; }) : Promise.resolve(null);
    return viaClaude.then(function (d) {
      if (d) return d.save({ filename: name, data: text }).then(function () { return "claude"; });
      if (navigator.share) {
        var data = { title: name, text: text }, f = fileFor(name, text, type);
        if (f && navigator.canShare && navigator.canShare({ files: [f] })) data.files = [f];
        return navigator.share(data).then(function () { return "share"; }, function (e) { if (e && e.name === "AbortError") throw e; anchorDownload(name, text, type); return "download"; });
      }
      anchorDownload(name, text, type); return "download";
    });
  }
  function textOf(el) {
    /* a plain-text copy of a rendered section, for phones that cannot print */
    var out = [], walk = function (n) {
      if (n.nodeType === 3) { out.push(n.nodeValue); return; }
      if (n.nodeType !== 1 || n.hidden || /^(SCRIPT|STYLE|BUTTON|SVG)$/.test(n.tagName)) return;
      var block = /^(H1|H2|H3|H4|P|LI|DT|DD|DIV|SECTION|ARTICLE|TR|FIGCAPTION|SUMMARY)$/.test(n.tagName);
      if (/^(H1|H2|H3)$/.test(n.tagName)) out.push("\n\n");
      if (n.tagName === "LI") out.push("\n- ");
      else if (n.tagName === "DT") out.push("\n");
      else if (n.tagName === "DD") out.push(": ");
      else if (block) out.push("\n");
      for (var c = n.firstChild; c; c = c.nextSibling) walk(c);
      if (/^(TD|TH)$/.test(n.tagName)) out.push("  ");
    };
    walk(el);
    return out.join("").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").replace(/\n[ \t]+/g, "\n").trim();
  }
  window.V60_FILE = { save: saveFile, textOf: textOf, ios: IOS, bluefy: BLUEFY, canPrint: !IOS };
  function daysSince(d) { if (!d) return null; return Math.floor((Date.now() - new Date(String(d).slice(0, 10) + "T12:00:00").getTime()) / 864e5); }
  function pulse(api) {
    var el = document.getElementById("pulse"); if (!el) return;
    var st = api.state, items = [];
    var active = (st.codes || []).filter(function (c) { return c.status === "active"; }).length, ls = st.lastScan;
    items.push(active ? ["concern", "Codes", active + " active", "tab:diag"] : (ls ? (ls.mil ? ["concern", "Light", "On", "tab:live"] : ["ok", "Light", "No codes", "tab:live"]) : ["none", "Light", "Not scanned", "tab:live"]));
    var oil = (st.oil || []).slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; })[0], od = oil ? daysSince(oil.date) : null;
    items.push(oil ? [od > 35 ? "watch" : "ok", "Oil", od === 0 ? "Checked today" : "Checked " + od + "d ago", "tab:records"] : ["none", "Oil", "No checks", "tab:records"]);
    var worst = null, rank = { over: 3, soon: 2, ok: 1, none: 0 };
    (api.ITEMS || []).forEach(function (it) { var s = api.statusFor(it); if (s && s.cls !== "none" && (!worst || rank[s.cls] > rank[worst.s.cls])) worst = { it: it, s: s }; });
    items.push(worst ? [worst.s.cls === "over" ? "concern" : (worst.s.cls === "soon" ? "watch" : "ok"), "Service", worst.s.cls === "ok" ? "On track" : (worst.s.cls === "over" ? "Overdue: " : "Soon: ") + worst.it.name, "tab:health"] : ["none", "Service", "No records", "tab:health"]);
    el.innerHTML = items.map(function (x) { return '<button type="button" class="pdot ' + x[0] + '" data-jump="' + x[3] + '"><i aria-hidden="true"></i><span><b>' + api.esc(x[1]) + "</b> " + api.esc(x[2]) + "</span></button>"; }).join("");
  }
  function speak(sel, btn) {
    try {
      if (!window.speechSynthesis) return;
      if (speaking === sel) { window.speechSynthesis.cancel(); speaking = null; btn.textContent = "Listen"; return; }
      var el = document.querySelector(sel); if (!el) return;
      var clone = el.cloneNode(true); clone.querySelectorAll("button, summary, .status a").forEach(function (b) { b.remove(); });
      var text = (clone.innerText || clone.textContent || "").replace(/\s+/g, " ").trim(); if (!text) return;
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text.slice(0, 4000)); u.rate = 1;
      u.onend = function () { speaking = null; btn.textContent = "Listen"; };
      speaking = sel; btn.textContent = "Stop"; window.speechSynthesis.speak(u);
    } catch (e) {}
  }
  (window.V60_MODULES = window.V60_MODULES || []).push({
    id: "ui",
    init: function (api) {
      API = api;
      document.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("[data-speak]"); if (!b) return; e.preventDefault(); speak(b.getAttribute("data-speak"), b); });
      if (!window.speechSynthesis) document.documentElement.classList.add("nospeech");
    },
    refresh: function (api) { pulse(api); }
  });
})();
