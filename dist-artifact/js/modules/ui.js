/* Shared UI helpers: the car pulse strip in the header (warning lights, oil, service), and read-aloud for any element
   marked with data-speak="<css selector>". No tab of its own. */
(function () {
  var API = null, speaking = null;
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
