/* Store prices for the Glovebox tool inventory. Every price is the regular price shown on that retailer's own page on the date in `checked`
   (Harbor Freight prices from its item pages on go.harborfreight.com; coupons and short sales ignored). The owner's own prices live in
   glove.price and win over these. To refresh: re-check each page, change price/name/url, and set `checked`.
   items[toolId] = [{ store, name, price, url, note? }]. A tool with no entry shows "No price checked". */
window.V60_TOOL_PRICES = {
  checked: "2026-10-15",
  items: {
    gauge: [{ store: "Harbor Freight", name: "MERLIN Digital Tire Pressure Gauge (58172)", price: 16.99, url: "https://www.harborfreight.com/digital-tire-pressure-gauge-58172.html" }],
    tdg: [{ store: "Home Depot", name: "EXELAIR Digital Tire Tread Depth Gauge (EX448DIG)", price: 8.39, url: "https://www.homedepot.com/p/EXELAIR-Digital-Tire-Tread-Depth-Gauge-EX448DIG/301836728" }],
    inflator: [{ store: "Home Depot", name: "AstroAI 12V Portable Tire Inflator, up to 150 psi", price: 37.99, url: "https://www.homedepot.com/p/AstroAI-Tire-Inflator-Portable-Air-Compressor-Up-to-150-PSI-Tire-Pump-12V-DC-ACACZ1YE-US/339917039" }],
    light: [
      { store: "Home Depot", name: "Energizer Vision HD LED Headlamp, 300 lumens", price: 17.47, url: "https://www.homedepot.com/p/Energizer-Vision-HD-LED-Headlamp-300-Lumens-HDB32EH/205876368" },
      { store: "Harbor Freight", name: "BRAUN 700 Lumen Rechargeable LED Headlamp (59298)", price: 24.99, url: "https://www.harborfreight.com/700-lumen-adjustable-rechargeable-led-headlamp-59298.html" }],
    gloves: [{ store: "Harbor Freight", name: "HARDY 5 mil Nitrile Gloves, 100, size Large (68497)", price: 12.99, url: "https://www.harborfreight.com/5-mil-nitrile-powder-free-gloves-100-pc-large-light-blue-68497.html", note: "Other sizes have their own item numbers" }],
    towels: [{ store: "Harbor Freight", name: "TOOLBOX Blue Shop Towels, one roll of 55 (64395)", price: 3.79, url: "https://www.harborfreight.com/disposable-blue-shop-towels-64395.html" }],
    torx: [{ store: "Home Depot", name: "Husky Torx Screwdriver Set, 5 pieces (T10–T30)", price: 16.97, url: "https://www.homedepot.com/p/Husky-Torx-Screwdriver-Set-5-Piece-H5PCTORXSDS/302347531", note: "Screwdrivers, so no ratchet needed" }],
    sockets: [
      { store: "Harbor Freight", name: "QUINN 3/8 in. SAE & Metric Socket and Ratchet Set, 21 pieces (64536)", price: 24.99, url: "https://www.harborfreight.com/38-in-drive-sae-metric-chrome-socket-and-ratchet-set-21-pc-64536.html", note: "No extension listed; metric sizes not listed on the page" },
      { store: "Home Depot", name: "Husky 3/8 in. Ratchet and Socket Set, 24 pieces with extension", price: 39.97, url: "https://www.homedepot.com/p/Husky-24-Piece-SAE-Metric-3-8-in-Drive-Ratchet-and-Socket-Set-with-Case-H3D24PCSWS/314809978", note: "Metric sizes not listed on the page" }],
    drivers: [
      { store: "Harbor Freight", name: "PITTSBURGH Cushion Grip Screwdriver Set, 12 pieces (61344)", price: 7.99, url: "https://www.harborfreight.com/search?q=61344" },
      { store: "Harbor Freight", name: "DOYLE Cushion Grip Screwdriver Set, 7 pieces (56914)", price: 24.99, url: "https://www.harborfreight.com/cushion-grip-screwdriver-set-7-pc-56914.html" }],
    pliers: [{ store: "Harbor Freight", name: "QUINN 8 in. Long Nose Pliers (64106)", price: 6.99, url: "https://www.harborfreight.com/8-in-long-nose-pliers-with-comfort-grip-64106.html" }],
    trim: [{ store: "Harbor Freight", name: "PITTSBURGH Trim and Molding Tool Set, 5 pieces, nylon (64126)", price: 5.49, url: "https://www.harborfreight.com/trim-and-molding-tool-set-5-pc-64126.html" }],
    brush: [{ store: "Harbor Freight", name: "PITTSBURGH Battery Terminal Cleaner (94450)", price: 3.99, url: "https://www.harborfreight.com/battery-terminal-cleaner-94450.html" }],
    funnel: [{ store: "Home Depot", name: "Pennzoil Extended Reach Funnel", price: 3.48, url: "https://www.homedepot.com/p/Pennzoil-Extended-Reach-Funnel-31152D/340664644" }],
    meter: [
      { store: "Home Depot", name: "Commercial Electric Pocket True RMS Multimeter (DMM-8132)", price: 16.98, url: "https://www.homedepot.com/p/Commercial-Electric-Pocket-Size-True-RMS-Digital-Multi-Meter-DMM-8132/321995339" },
      { store: "Home Depot", name: "Klein Tools MM325 Multimeter, manual ranging", price: 34.98, url: "https://www.homedepot.com/p/Klein-Tools-600-Volt-Digital-Multi-Meter-Manual-Ranging-MM325/320822947" }],
    charger: [
      { store: "Harbor Freight", name: "VIKING 4 A Automatic Charger/Maintainer (63350)", price: 39.99, url: "https://www.harborfreight.com/4-amp-fully-automatic-microprocessor-controlled-battery-chargermaintainer-63350.html", note: "The page says it charges AGM batteries but names no separate AGM setting" },
      { store: "Home Depot", name: "NOCO GENIUS5 5 A Smart Charger and Maintainer", price: 69.95, url: "https://www.homedepot.com/p/NOCO-GENIUS5-5-Amp-Fully-Automatic-Smart-Charger-6V-12V-Battery-Charger-Maintainer-Genius5/312211504", note: "The page lists AGM batteries; may be a third-party seller" }],
    cables: [
      { store: "Harbor Freight", name: "PITTSBURGH 16 ft. 6 gauge Jumper Cables (60396)", price: 16.99, url: "https://www.harborfreight.com/16-ft-6-gauge-jumper-cables-60396.html" },
      { store: "Home Depot", name: "Schumacher SL1672 1000 A Lithium Jump Starter (a jump pack, no second car needed)", price: 53.99, url: "https://www.homedepot.com/p/Schumacher-Electric-1000A-Lithium-Car-Battery-Jump-Starter-and-Portable-Jump-Box-10W-Wireless-Charging-12V-Sport-Auto-Marine-Batteries-SL1672/332056801" }],
    jack: [
      { store: "Home Depot", name: "Pro-Lift 2 Ton Low Profile Floor Jack (F-767)", price: 107.99, url: "https://www.homedepot.com/p/Pro-Lift-2-Ton-Low-Profile-Floor-Jack-F-767/203610329", note: "Seller not checked" },
      { store: "Home Depot", name: "Husky 3 Ton Low Profile Floor Jack with Quick Lift", price: 184.00, url: "https://www.homedepot.com/p/Husky-3-Ton-Low-Profile-Floor-Jack-with-Quick-Lift-in-Orange-HD00120-OR-HV-TH/337440616" }],
    stands: [{ store: "Harbor Freight", name: "DAYTONA 3 Ton Ratcheting Jack Stands (70593)", price: 49.99, url: "https://www.harborfreight.com/3-ton-heavy-duty-ratcheting-jack-stands-slate-gray-70593.html", note: "Listed as stands, plural; the page doesn't say pair outright" }],
    chocks: [
      { store: "Harbor Freight", name: "HAUL-MASTER Solid Rubber Wheel Chock (96479), two at $7.49 each", price: 14.98, url: "https://www.harborfreight.com/solid-rubber-wheel-chock-96479.html", note: "Sold singly; the price shown is for two" },
      { store: "Home Depot", name: "BRIDGELAND Solid Rubber Wheel Chocks, 2-pack", price: 26.18, url: "https://www.homedepot.com/p/BRIDGELAND-Solid-Rubber-Wheel-Chocks-2-Pack-91029/311630231" }],
    torque: [{ store: "Harbor Freight", name: "PITTSBURGH 1/2 in. Click Torque Wrench, 10–150 ft-lb (63882)", price: 21.99, url: "https://www.harborfreight.com/12-in-drive-click-type-torque-wrench-63882.html" }],
    breaker: [
      { store: "Harbor Freight", name: "PITTSBURGH 1/2 in. 18 in. Breaker Bar (60818)", price: 14.99, url: "https://www.harborfreight.com/12-in-drive-18-in-breaker-bar-60818.html", note: "Socket for the wheel bolts not included" },
      { store: "Harbor Freight", name: "PITTSBURGH 1/2 in. 25 in. Breaker Bar (62729)", price: 21.99, url: "https://www.harborfreight.com/12-in-drive-25-in-breaker-bar-62729.html" }]
  }
};
