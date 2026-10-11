/* Fuel log, real MPG vs EPA, expenses and total cost of ownership. */
(function () {
  var EPA = { city: 25, hwy: 37, comb: 29 };
  var CATS = [["service", "Service and maintenance"], ["repair", "Repair"], ["parts", "Parts and tools"], ["insurance", "Insurance"], ["registration", "Registration and inspection"], ["wash", "Washing and detailing"], ["other", "Other"]];
  function data(api) { var d = api.mod("fuel"); if (!d) { d = { fills: [], exp: [] }; api.setMod("fuel", d); } return d; }
  function mpgSeries(fills) {
    var f = fills.slice().sort(function (a, b) { return a.odo - b.odo; }), out = [], lastFull = null, gal = 0;
    f.forEach(function (x) {
      if (lastFull) gal += x.gal;
      if (x.full) { if (lastFull && gal > 0 && x.odo > lastFull.odo) out.push({ date: x.date, odo: x.odo, mpg: (x.odo - lastFull.odo) / gal, miles: x.odo - lastFull.odo }); lastFull = x; gal = 0; }
    });
    return out;
  }
  function money(n) { return "$" + (Math.round(n * 100) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function chart(api, ser) {
    if (ser.length < 2) return '<p class="empty">Two full fill-ups in a row give the first real mpg. Fill to the click each time and tick "Filled to full".</p>';
    var W = 640, H = 170, L = 40, R = 12, T = 12, B = 26, ys = ser.map(function (s) { return s.mpg; }).concat([EPA.city, EPA.hwy]);
    var lo = Math.floor(Math.min.apply(null, ys) - 2), hi = Math.ceil(Math.max.apply(null, ys) + 2);
    function X(i) { return L + (ser.length === 1 ? 0 : i / (ser.length - 1)) * (W - L - R); } function Y(v) { return T + (1 - (v - lo) / (hi - lo)) * (H - T - B); }
    var ref = [[EPA.comb, "EPA combined 29"], [EPA.city, "City 25"], [EPA.hwy, "Highway 37"]].map(function (r) { return '<line class="base" x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(r[0]).toFixed(1) + '" y2="' + Y(r[0]).toFixed(1) + '"/><text x="' + (W - R) + '" y="' + (Y(r[0]) - 4).toFixed(1) + '" text-anchor="end">' + r[1] + "</text>"; }).join("");
    var d = ser.map(function (s, i) { return (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(s.mpg).toFixed(1); }).join("");
    var dots = ser.map(function (s, i) { return '<circle class="pt' + (i === ser.length - 1 ? " last" : "") + '" r="4.5" cx="' + X(i).toFixed(1) + '" cy="' + Y(s.mpg).toFixed(1) + '"><title>' + api.esc(s.date) + ": " + s.mpg.toFixed(1) + " mpg over " + api.fmt(Math.round(s.miles)) + " mi</title></circle>"; }).join("");
    var yl = [lo, Math.round((lo + hi) / 2), hi].map(function (v) { return '<text x="' + (L - 6) + '" y="' + (Y(v) + 4).toFixed(1) + '" text-anchor="end">' + v + "</text>"; }).join("");
    return '<div class="chart"><div class="chead"><span class="nm">Your mpg per tank</span><span class="cv">dashed lines: EPA ratings</span></div><svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Miles per gallon for each full tank compared with EPA ratings">' + yl + ref + '<path class="trace" d="' + d + '"/>' + dots + "</svg></div>";
  }
  function render(api) {
    var $ = api.$, esc = api.esc, d = data(api), ser = mpgSeries(d.fills);
    $("fuDate").value = $("fuDate").value || api.todayStr(); $("exDate").value = $("exDate").value || api.todayStr();
    var fuelSpend = d.fills.reduce(function (s, x) { return s + (x.gal * x.price || 0); }, 0), expSpend = d.exp.reduce(function (s, x) { return s + (+x.amt || 0); }, 0);
    var miles = 0; if (d.fills.length > 1) { var o = d.fills.map(function (x) { return x.odo; }); miles = Math.max.apply(null, o) - Math.min.apply(null, o); }
    var recent = ser.slice(-5), avg = recent.length ? recent.reduce(function (s, x) { return s + x.mpg; }, 0) / recent.length : null;
    var first = d.fills.concat(d.exp).map(function (x) { return x.date; }).sort()[0], months = first ? Math.max(1, api.monthsSince(first)) : 1;
    $("fuStats").innerHTML = '<div class="stat"><b>' + (avg ? avg.toFixed(1) : "--") + '</b><span>mpg, last ' + (recent.length || 0) + ' tanks</span></div><div class="stat"><b>' + (ser.length ? Math.max.apply(null, ser.map(function (s) { return s.mpg; })).toFixed(1) : "--") + '</b><span>best tank</span></div><div class="stat"><b>' + (miles > 0 ? "$" + (fuelSpend / miles).toFixed(2) : "--") + '</b><span>fuel per mile</span></div><div class="stat"><b>' + money(fuelSpend + expSpend) + '</b><span>total logged</span></div><div class="stat"><b>' + money((fuelSpend + expSpend) / months) + "</b><span>per month</span></div>";
    $("fuChart").innerHTML = chart(api, ser);
    var rows = d.fills.map(function (x) { return { t: "fuel", d: x }; }).concat(d.exp.map(function (x) { return { t: "exp", d: x }; })).sort(function (a, b) { return a.d.date < b.d.date ? 1 : -1; }).slice(0, 60);
    $("fuBody").innerHTML = rows.length ? rows.map(function (r) {
      var x = r.d;
      if (r.t === "fuel") return '<tr><td class="num">' + esc(x.date) + "</td><td>Fuel" + (x.full ? "" : " (partial)") + (x.oct ? ", " + esc(x.oct) : "") + '</td><td class="num">' + x.gal.toFixed(3) + " gal at $" + x.price.toFixed(3) + '</td><td class="num">' + money(x.gal * x.price) + '</td><td class="num">' + api.fmt(x.odo) + '</td><td><button type="button" class="quiet" data-fudel="f:' + x.id + '">Delete</button></td></tr>';
      var c = CATS.filter(function (k) { return k[0] === x.cat; })[0];
      return '<tr><td class="num">' + esc(x.date) + "</td><td>" + esc(c ? c[1] : x.cat) + (x.note ? ": " + esc(x.note) : "") + '</td><td></td><td class="num">' + money(+x.amt) + '</td><td class="num">' + (x.odo ? api.fmt(x.odo) : "") + '</td><td><button type="button" class="quiet" data-fudel="e:' + x.id + '">Delete</button></td></tr>';
    }).join("") : '<tr><td colspan="6" class="empty">Nothing logged yet. Start with your next fill-up.</td></tr>';
    var bycat = {}; d.exp.forEach(function (x) { bycat[x.cat] = (bycat[x.cat] || 0) + (+x.amt || 0); }); bycat.fuel = fuelSpend;
    var tot = fuelSpend + expSpend;
    $("fuSplit").innerHTML = tot ? Object.keys(bycat).filter(function (k) { return bycat[k] > 0; }).sort(function (a, b) { return bycat[b] - bycat[a]; }).map(function (k) { var c = k === "fuel" ? ["fuel", "Fuel"] : CATS.filter(function (q) { return q[0] === k; })[0] || [k, k]; var p = Math.round(100 * bycat[k] / tot); return '<div class="bar"><span>' + esc(c[1]) + '</span><span class="tr"><span class="fl" style="width:' + p + '%"></span></span><span>' + money(bycat[k]) + "</span></div>"; }).join("") : "";
  }
  (window.V60_MODULES = window.V60_MODULES || []).push({
    id: "fuel",
    tabs: [{ id: "fuel", section: "data", label: "Fuel & costs", order: 40, html: '<section><h2>Fuel and costs</h2><p class="lede">Your real fuel economy against the EPA rating, and what the car actually costs to own. A sudden mpg drop is often the first sign of a problem: tires, brakes dragging, a sensor or a misfire.</p><div class="stats" id="fuStats"></div><div id="fuChart"></div></section><section class="card"><h3>Log a fill-up</h3><form id="fuForm" class="row" autocomplete="off"><div class="field"><label for="fuDate">Date</label><input id="fuDate" type="date" required></div><div class="field"><label for="fuOdo">Odometer</label><input id="fuOdo" type="number" inputmode="numeric" min="0" step="1" required></div><div class="field"><label for="fuGal">Gallons</label><input id="fuGal" type="number" inputmode="decimal" min="0.1" step="0.001" required></div><div class="field"><label for="fuPrice">Price per gallon</label><input id="fuPrice" type="number" inputmode="decimal" min="0" step="0.001" required></div><div class="field"><label for="fuOct">Octane</label><select id="fuOct"><option value="87">87</option><option value="89">89</option><option value="91">91</option><option value="93">93</option></select></div><label class="inl"><input type="checkbox" id="fuFull" checked> Filled to full</label><button type="submit">Add fill-up</button></form></section><section class="card"><h3>Log an expense</h3><form id="exForm" class="row" autocomplete="off"><div class="field"><label for="exDate">Date</label><input id="exDate" type="date" required></div><div class="field"><label for="exCat">Type</label><select id="exCat"></select></div><div class="field"><label for="exAmt">Amount ($)</label><input id="exAmt" type="number" inputmode="decimal" min="0" step="0.01" required></div><div class="field"><label for="exOdo">Odometer (optional)</label><input id="exOdo" type="number" inputmode="numeric" min="0" step="1"></div><div class="field" style="flex:1 1 12em"><label for="exNote">Note</label><input id="exNote" type="text" maxlength="120"></div><button type="submit">Add expense</button></form></section><section><h3>Where the money goes</h3><div class="bars" id="fuSplit"></div><div class="scroll"><table><thead><tr><th class="num">Date</th><th>What</th><th class="num">Detail</th><th class="num">Cost</th><th class="num">Odometer</th><th></th></tr></thead><tbody id="fuBody"></tbody></table></div></section>' }],
    clean: function (v) { if (!v || typeof v !== "object") return null; return { fills: (v.fills || []).filter(function (x) { return x && typeof x.odo === "number" && typeof x.gal === "number"; }).slice(-1000), exp: (v.exp || []).filter(function (x) { return x && x.date; }).slice(-1000) }; },
    render: function (api) { render(api); },
    init: function (api) {
      var $ = api.$;
      $("exCat").innerHTML = CATS.map(function (c) { return '<option value="' + c[0] + '">' + c[1] + "</option>"; }).join("");
      $("fuForm").addEventListener("submit", function (e) { e.preventDefault(); var d = data(api), odo = +$("fuOdo").value; d.fills.push({ id: api.uid(), date: $("fuDate").value, odo: Math.round(odo), gal: +$("fuGal").value, price: +$("fuPrice").value, full: $("fuFull").checked, oct: $("fuOct").value }); api.bumpOdo(odo); $("fuOdo").value = ""; $("fuGal").value = ""; api.save(); api.renderAll(); render(api); });
      $("exForm").addEventListener("submit", function (e) { e.preventDefault(); var d = data(api), odo = +$("exOdo").value; d.exp.push({ id: api.uid(), date: $("exDate").value, cat: $("exCat").value, amt: +$("exAmt").value, odo: odo ? Math.round(odo) : null, note: $("exNote").value.trim() }); if (odo) api.bumpOdo(odo); $("exAmt").value = ""; $("exNote").value = ""; $("exOdo").value = ""; api.save(); render(api); });
      $("fuBody").addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("[data-fudel]"); if (!b) return; if (b.getAttribute("data-armed") !== "1") { b.setAttribute("data-armed", "1"); b.textContent = "Confirm"; return; } var p = b.getAttribute("data-fudel").split(":"), d = data(api); if (p[0] === "f") d.fills = d.fills.filter(function (x) { return x.id !== p[1]; }); else d.exp = d.exp.filter(function (x) { return x.id !== p[1]; }); api.save(); render(api); });
    },
    actions: function (api, list) {
      var d = api.mod("fuel"); if (!d) return; var s = mpgSeries(d.fills); if (s.length < 4) return;
      var last = s[s.length - 1].mpg, prev = s.slice(-5, -1), avg = prev.reduce(function (a, x) { return a + x.mpg; }, 0) / prev.length;
      if (last < avg * 0.85) list.push({ sev: 50, text: "Fuel economy dropped to " + last.toFixed(1) + " mpg from your usual " + avg.toFixed(1) + ". Check tire pressures first, then brakes dragging and the air filter.", jump: "tab:fuel" });
    },
    xp: function (api) { var d = api.mod("fuel"); if (!d) return 0; return Math.min(150, d.fills.length * 5 + d.exp.length * 3); },
    expose: { mpgSeries: mpgSeries }
  });
  window.V60_FUEL = { addExpense: function (api, e) { var d = data(api); d.exp.push(e); api.save(); } };
})();
