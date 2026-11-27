/* Page cleanup (2026-11-27, Kyle said "Yes, all of it" to https://claude.ai/artifact/QtDuvWWwRPnwHXBTm2VSCw; plan in
   docs/ROADMAP.md, "Page cleanup"). One page per job; no saved data is touched.
   - The working parts of three old pages move, as they are (same element ids, so core keeps driving them), into the
     page that now owns the job:
       Service log page: the service log, oil watch and calendar reminders  -> Maintenance (its "What's due" list stays
                                                                               behind, hidden: Maintenance has the schedule)
       Diagnose page: trouble-code lookup and code log                       -> Fix (the symptom list stays behind)
       Health page: Back up and restore                                      -> Settings
                    Ask about my car (inside Claude only)                    -> Fix
   - window.V60_ALIAS sends links to retired pages to their new place (core's showTab reads it): tab:records, tab:diag,
     tab:health, tab:engine (the engine-bay view in Know your car), tab:bay, tab:sim, tab:cards.
   The retired panels stay in the page, hidden and unlinked, so their code and saved data keep working. */
(function () {
  function $(id) { return document.getElementById(id); }
  function sectionOf(el) { return el && el.closest ? el.closest("section") : null; }
  function hostIn(panel, id, label) {
    var p = $(panel); if (!p) return null;
    var h = $(id); if (h) return h;
    h = document.createElement("div"); h.id = id; h.className = "tidy-host"; if (label) h.setAttribute("aria-label", label);
    p.appendChild(h); return h;
  }
  function move() {
    /* Service log -> Maintenance */
    var mt = hostIn("p-maint", "mtLog", "Service log, oil watch and reminders");
    if (mt) {
      [$("log"), $("oil"), document.querySelector("#p-records section.remind")].forEach(function (s) { if (s && !mt.contains(s)) mt.appendChild(s); });
      var due = $("due"); if (due) due.hidden = true;
    }
    /* Diagnose -> Fix */
    var fx = hostIn("p-trouble", "trCodes", "Trouble codes");
    if (fx) {
      [sectionOf($("codeIn")), sectionOf($("codeForm"))].forEach(function (s) { if (s && !fx.contains(s)) fx.appendChild(s); });
      var note = document.querySelector("#p-diag > .note"); if (note && !fx.contains(note)) fx.appendChild(note);
      var ask = $("askBox"); if (ask && !fx.contains(ask)) fx.appendChild(ask);
    }
    /* Backup -> Settings */
    var st = $("p-settings"), bk = $("backupSec");
    if (st && bk && !st.contains(bk)) st.appendChild(bk);
  }

  window.V60_ALIAS = {
    records: { tab: "maint", at: "log" },
    health: { tab: "car" },
    diag: { tab: "trouble", at: "trCodes" },
    engine: { go: function () { if (window.V60_MANUAL && window.V60_MANUAL.go) { window.V60_MANUAL.go("view", "bay"); return true; } return false; }, tab: "know" },
    bay: { tab: "know" },
    sim: { tab: "lab" },
    cards: { tab: "kb" }
  };

  (window.V60_MODULES = window.V60_MODULES || []).push({
    id: "tidy",
    init: function () { move(); }
  });
})();
