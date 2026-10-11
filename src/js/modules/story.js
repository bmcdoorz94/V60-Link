/* Story mode: "The As-Is File". Cinematic cutscenes (SVG line art + typed captions), chapters unlocked by real progress. */
(function () {
  var CAR = '<path class="ln" d="M60 250 L56 214 Q60 196 96 190 L214 180 L304 130 Q316 124 332 124 L512 124 Q556 128 598 162 L638 194 Q658 202 662 222 L664 250 Z"/><path class="ln thin" d="M226 176 L304 136 L360 136 L360 176 Z M372 136 L506 136 Q542 140 576 168 L588 176 L372 176 Z"/><circle class="ln" cx="170" cy="252" r="38"/><circle class="ln" cx="560" cy="252" r="38"/><circle class="ln thin" cx="170" cy="252" r="16"/><circle class="ln thin" cx="560" cy="252" r="16"/>';
  var SCENES = {
    road: '<g class="sc-road"><line class="lane" x1="0" y1="312" x2="720" y2="312"/><line class="ground" x1="0" y1="292" x2="720" y2="292"/>' + '<g class="carmove">' + CAR + '<path class="beam" d="M664 214 L720 196 L720 250 Z"/></g></g>',
    car: '<g class="draw">' + CAR + '<line class="ground" x1="20" y1="292" x2="700" y2="292"/></g>',
    bay: '<g class="draw"><path class="ln" d="M120 60 Q360 30 600 60 L612 300 Q360 326 108 300 Z"/><rect class="ln" x="160" y="74" width="400" height="24" rx="5"/><rect class="ln" x="250" y="140" width="230" height="120" rx="14"/><rect class="ln thin" x="136" y="140" width="80" height="70" rx="6"/><rect class="ln thin" x="500" y="236" width="60" height="40" rx="8"/><circle class="ln thin" cx="300" cy="180" r="12"/><text class="q" x="410" y="210">?</text></g>',
    papers: '<g class="draw"><rect class="ln" x="250" y="70" width="190" height="240" rx="8" transform="rotate(-6 345 190)"/><rect class="ln" x="270" y="60" width="190" height="240" rx="8" transform="rotate(4 365 180)"/><text class="q big" x="345" y="215">?</text></g>',
    belt: '<g class="draw spin"><circle class="ln" cx="300" cy="180" r="70"/><circle class="ln" cx="470" cy="150" r="46"/><path class="ln" d="M300 110 L470 104 M300 250 L476 196"/><circle class="ln thin" cx="300" cy="180" r="12"/><circle class="ln thin" cx="470" cy="150" r="10"/></g>',
    scan: '<g class="draw"><rect class="ln" x="230" y="150" width="140" height="70" rx="10"/><path class="ln thin" d="M250 175h100M250 195h100"/><g class="waves"><path class="ln" d="M400 140 Q430 185 400 230"/><path class="ln" d="M430 120 Q480 185 430 250"/><path class="ln" d="M460 100 Q530 185 460 270"/></g><rect class="ln" x="560" y="120" width="70" height="130" rx="12"/></g>',
    gauge: '<g class="draw"><path class="ln" d="M220 280 A140 140 0 0 1 500 280"/><g class="needle"><line class="ln" x1="360" y1="280" x2="360" y2="160"/></g><circle class="ln" cx="360" cy="280" r="10"/></g>',
    tires: '<g class="draw"><circle class="ln" cx="360" cy="190" r="110"/><circle class="ln thin" cx="360" cy="190" r="70"/><text class="mono" x="360" y="96">DOT 2419</text><path class="ln thin" d="M260 150 L300 160 M250 200 L292 200 M262 246 L302 232"/></g>',
    wrench: '<g class="draw spin"><path class="ln" d="M300 260 L420 140 M408 112 A30 30 0 1 0 448 152 L430 140 L420 130 Z"/></g>',
    wave: '<g class="draw"><path class="ln" d="M120 190 Q160 120 200 190 T280 190 T360 190 T440 190 T520 190 T600 190"/><path class="ln thin" d="M120 230 Q170 200 220 230 T320 230 T420 230 T520 230 T600 230"/></g>',
    badge: '<g class="draw glow"><path class="ln" d="M360 70 L400 120 L460 120 L430 170 L450 230 L360 200 L270 230 L290 170 L260 120 L320 120 Z"/><text class="mono" x="360" y="280">V60 MASTER</text></g>'
  };
  var STORY = [
    { id: "pro", t: "Prologue: The As-Is File", need: null, lines: [["road", "Summer 2025. A Volvo wagon with just under 90,000 miles rolls off an independent lot."], ["papers", "Sold as-is. No service records. No promises."], ["car", "2016 Volvo V60 T5. Built in Torslanda, Sweden. Two liters, one turbo, 240 horsepower."], ["belt", "Somewhere inside is a timing belt no one can vouch for. If it snaps, the engine dies with it."], ["bay", "You have never opened its hood."], ["gauge", "Your job: learn this car better than anyone who owned it before you."], ["papers", "Every check you make writes a page of its history. Let's begin."]] },
    { id: "c1", t: "Chapter 1: The Keys", need: [0, 0], lines: [["bay", "The hood releases with a quarter turn of a handle under the dash."], ["bay", "No dipstick here. This engine reports its own oil level through the instrument cluster."], ["wave", "And it is known, in some cars of its year, to drink oil. Watching that level is your first discipline."]] },
    { id: "c2", t: "Chapter 2: The Walkaround", need: [0, 3], lines: [["tires", "Four tires carry nearly two tons. Each one has a birthday stamped on its side."], ["tires", "Volvo says six years, then they go, tread or not. 38 psi, cold."], ["car", "A light that would not go out turns out to be a car asking to be recalibrated. Not every warning is a failure."]] },
    { id: "c3", t: "Chapter 3: The Paper Trail", need: [1, 3], lines: [["papers", "A car's past hides in recall databases, dealer systems and forgotten receipts."], ["papers", "Four recalls touched cars like this one. Seat belts. Door latches."], ["belt", "And one question outranks them all: has the belt ever been changed?"]] },
    { id: "c4", t: "Chapter 4: The Car Speaks", need: [2, 3], lines: [["scan", "Under the dash is a port that has been talking since 1996, to anyone who knows how to listen."], ["scan", "Codes. Fuel trims. Coolant curves. Readiness monitors."], ["wave", "From now on, you will know what normal sounds like for this car, and so you will notice when it changes."]] },
    { id: "c5", t: "Chapter 5: First Wrench", need: [3, 3], lines: [["wrench", "The first job is small. A filter, a wiper, a bulb."], ["wrench", "But it is the moment the car stops being a mystery and starts being a machine you understand."]] },
    { id: "c6", t: "Chapter 6: Sixth Sense", need: [1, 3], lines: [["wave", "A squeal at a stop. A sweet smell from the vents. A shudder at sixty."], ["wave", "Cars rarely fail without warning. They whisper first. Now you can hear them."]] },
    { id: "fin", t: "Finale: Master of the V60", need: "exam", lines: [["badge", "Certified on your own car."], ["car", "The as-is wagon now has the most thorough history it has ever had, and an owner who could explain every part of it."], ["road", "The story does not end here. Every mile adds to it."]] }
  ];
  var cin = { ch: null, i: 0, timer: null, typed: null };
  function data(api) { var d = api.mod("story"); if (!d) { d = { seen: {} }; api.setMod("story", d); } return d; }
  function chDone(api, idx) { var c = api.CHAPTERS[idx]; if (!c) return 0; var A = api.acad(); return c.missions.filter(function (m) { return A.done[m.id] && A.done[m.id].outcome !== "skip"; }).length; }
  function unlocked(api, s) { if (!s.need) return true; if (s.need === "exam") { var e = api.mod("exam"); return !!(e && e.passed); } return chDone(api, s.need[0]) >= s.need[1]; }
  function reduce() { try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } }
  function play(api, id) {
    var s = STORY.filter(function (x) { return x.id === id; })[0]; if (!s) return;
    cin.ch = s; cin.i = 0;
    var ov = document.getElementById("cinema");
    ov.hidden = false; document.body.classList.add("cine-open");
    ov.querySelector(".cin-title").textContent = s.t;
    showLine(api); ov.focus();
  }
  function showLine(api) {
    var ov = document.getElementById("cinema"), s = cin.ch, ln = s.lines[cin.i];
    clearTimeout(cin.timer); clearInterval(cin.typed);
    ov.querySelector(".cin-stage").innerHTML = '<svg viewBox="0 0 720 340" aria-hidden="true">' + (SCENES[ln[0]] || "") + "</svg>";
    var cap = ov.querySelector(".cin-cap"), text = ln[1], n = 0;
    ov.querySelector(".cin-dots").innerHTML = s.lines.map(function (_, k) { return '<i class="' + (k === cin.i ? "on" : (k < cin.i ? "past" : "")) + '"></i>'; }).join("");
    if (reduce()) cap.textContent = text;
    else { cap.textContent = ""; cin.typed = setInterval(function () { n += 2; cap.textContent = text.slice(0, n); if (n >= text.length) clearInterval(cin.typed); }, 28); }
    cin.timer = setTimeout(function () { next(api); }, Math.max(3800, text.length * 62));
  }
  function next(api) { if (!cin.ch) return; if (cin.i < cin.ch.lines.length - 1) { cin.i++; showLine(api); } else close(api); }
  function close(api) {
    clearTimeout(cin.timer); clearInterval(cin.typed);
    var ov = document.getElementById("cinema"); ov.hidden = true; document.body.classList.remove("cine-open");
    if (cin.ch) { var d = data(api); d.seen[cin.ch.id] = api.todayStr(); api.save(); }
    cin.ch = null; if (document.getElementById("p-story") && !document.getElementById("p-story").hidden) render(api);
  }
  function render(api) {
    var esc = api.esc, d = data(api);
    api.$("stList").innerHTML = STORY.map(function (s) {
      var un = unlocked(api, s), seen = d.seen[s.id];
      return '<li class="stch' + (un ? "" : " locked") + '"><div><b>' + esc(s.t) + '</b><span class="status">' + (un ? (seen ? "Watched " + esc(seen) : "New") : (s.need === "exam" ? "Unlocks when you pass the certification exam" : "Unlocks with " + s.need[1] + " missions done in Academy chapter " + (s.need[0] + 1))) + "</span></div>" + (un ? '<button type="button" class="' + (seen ? "quiet" : "") + '" data-play="' + s.id + '">' + (seen ? "Replay" : "Play") + "</button>" : '<span class="lockic" aria-hidden="true">Locked</span>') + "</li>";
    }).join("");
  }
  (window.V60_MODULES = window.V60_MODULES || []).push({
    id: "story",
    tabs: [{ id: "story", section: "learn", label: "Story", order: 5, html: '<section><h2>The As-Is File</h2><p class="lede">The story of your car, told in short cutscenes. Chapters unlock as you complete Academy missions on the real car.</p><ul class="stlist" id="stList"></ul></section>' }],
    clean: function (v) { return v && typeof v === "object" ? { seen: v.seen || {} } : null; },
    render: function (api) { render(api); },
    init: function (api) {
      var ov = document.createElement("div");
      ov.id = "cinema"; ov.className = "cinema"; ov.hidden = true; ov.tabIndex = -1; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "Story cutscene");
      ov.innerHTML = '<div class="cin-top"><span class="cin-title"></span><button type="button" class="cin-skip">Skip</button></div><div class="cin-stage"></div><p class="cin-cap" aria-live="polite"></p><div class="cin-bot"><div class="cin-dots"></div><button type="button" class="cin-next">Next</button></div>';
      document.body.appendChild(ov);
      ov.addEventListener("click", function (e) { if (e.target.closest(".cin-skip")) { close(api); return; } next(api); });
      ov.addEventListener("keydown", function (e) { if (e.key === "Escape") close(api); else if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") { e.preventDefault(); next(api); } });
      api.$("stList").addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("[data-play]"); if (b) play(api, b.getAttribute("data-play")); });
      setTimeout(function () { var d = data(api); if (!d.seen.pro && !window.__V60_TEST) play(api, "pro"); }, 1200);
    },
    jump: function (api, kind, id) { if (kind === "story") { play(api, id); return true; } return false; },
    today: function (api) {
      var d = data(api), nxt = STORY.filter(function (s) { return unlocked(api, s) && !d.seen[s.id]; })[0];
      if (!nxt) return [];
      return [{ order: 5, html: '<article class="tcard story"><p class="ans-k">New in your story</p><h3>' + api.esc(nxt.t) + '</h3><button type="button" data-jump="story:' + nxt.id + '">Play</button></article>' }];
    }
  });
})();
