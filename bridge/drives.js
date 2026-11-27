// Drive recordings from the V60 iPhone app: storage, numbers and the report page.
// server.js loads this file fresh whenever it changes (no Claude live restart needed for edits here).
// The app sends {t:"drive", id, part, parts, lines:[...]} then {t:"driveEnd", id, count}; each line is
// {"t": ms, "v": {"0C": [A, B], ...}} (mode 01 PID in hex → raw data bytes, ios/V60App/DriveFile.swift).
// Formulas are the standard SAE J1979 mode 01 scalings; US units for the report.
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { DATA } from './lib.js'

const DIR = path.join(DATA, 'drives')
const ID = /^\d{8}-\d{6}$/
const F = (c) => c * 1.8 + 32
const PIDS = {
  '0C': ['rpm', 'RPM', 'rpm', (a, b) => (256 * a + b) / 4],
  '0D': ['mph', 'Speed', 'mph', (a) => a * 0.621371],
  '04': ['load', 'Engine load', '%', (a) => (a * 100) / 255],
  '11': ['throttle', 'Throttle', '%', (a) => (a * 100) / 255],
  '06': ['stft', 'Short-term fuel trim', '%', (a) => ((a - 128) * 100) / 128],
  '07': ['ltft', 'Long-term fuel trim', '%', (a) => ((a - 128) * 100) / 128],
  '10': ['maf', 'Air flow (MAF)', 'g/s', (a, b) => (256 * a + b) / 100],
  '0B': ['map', 'Intake pressure', 'kPa', (a) => a],
  '05': ['coolant', 'Coolant', '°F', (a) => F(a - 40)],
  '0F': ['iat', 'Intake air', '°F', (a) => F(a - 40)],
  '0E': ['timing', 'Ignition timing', '° before TDC', (a) => a / 2 - 64],
  '42': ['volts', 'Module voltage', 'V', (a, b) => (256 * a + b) / 1000],
  '5C': ['oil', 'Oil', '°F', (a) => F(a - 40)],
  '46': ['ambient', 'Outside air', '°F', (a) => F(a - 40)],
  '2F': ['fuel', 'Fuel level', '%', (a) => (a * 100) / 255],
  '33': ['baro', 'Barometric pressure', 'kPa', (a) => a],
  '44': ['lambdaCmd', 'Commanded air-fuel (lambda)', '', (a, b) => ((256 * a + b) * 2) / 65536],
  '14': ['o2s1', 'O2 sensor 1 voltage', 'V', (a) => a / 200],
  '15': ['o2s2', 'O2 sensor 2 voltage', 'V', (a) => a / 200],
  '24': ['lambda1', 'O2 sensor 1 lambda', '', (a, b) => ((256 * a + b) * 2) / 65536],
  '34': ['lambda1', 'O2 sensor 1 lambda', '', (a, b) => ((256 * a + b) * 2) / 65536],
  '1F': ['runtime', 'Engine run time', 's', (a, b) => 256 * a + b],
  '21': ['milMiles', 'Distance with the check-engine light on', 'mi', (a, b) => (256 * a + b) * 0.621371],
  '30': ['warmups', 'Warm-ups since codes cleared', '', (a) => a],
  '31': ['clearedMiles', 'Distance since codes cleared', 'mi', (a, b) => (256 * a + b) * 0.621371],
  '4D': ['milMinutes', 'Time with the check-engine light on', 'min', (a, b) => 256 * a + b],
  '4E': ['clearedMinutes', 'Time since codes cleared', 'min', (a, b) => 256 * a + b],
}

let host = null
function baseUrl() {
  if (host === null) {
    try {
      const st = JSON.parse(execFileSync(process.platform === 'win32' ? 'tailscale.exe' : 'tailscale', ['status', '--json'], { encoding: 'utf8', timeout: 15000 }))
      host = (st.Self.DNSName || '').replace(/\.$/, '')
    } catch { host = '' }
  }
  return host ? `https://${host}` : ''
}
export const reportUrl = (id) => `${baseUrl()}/drives/${id}`

/* ---------------- storing ---------------- */

/** Handles the app's drive messages. Returns the finished report ({id, summary, url}) on driveEnd. */
export function onMessage(m, ctx) {
  const id = String(m.id || '')
  if (!ID.test(id)) return null
  fs.mkdirSync(DIR, { recursive: true })
  const part = path.join(DIR, id + '.part')
  if (m.t === 'drive') {
    const lines = (Array.isArray(m.lines) ? m.lines : []).filter((l) => { try { return typeof JSON.parse(l).t === 'number' } catch { return false } })
    if (+m.part === 0) fs.writeFileSync(part, '')
    fs.appendFileSync(part, lines.map((l) => l + '\n').join(''))
    return null
  }
  if (m.t === 'driveEnd') {
    if (!fs.existsSync(part)) return null
    fs.renameSync(part, path.join(DIR, id + '.jsonl'))
    const r = build(id)
    ctx.toPhone({ t: 'driveAck', id })
    ctx.record({ k: 'drive', id, readings: r.stats.n, minutes: Math.round(r.stats.minutes), miles: +r.stats.miles.toFixed(1) })
    return { id, summary: r.summary, url: reportUrl(id) }
  }
  return null
}

// The slow readings (coolant, voltage...) arrive every few cycles; each row carries the latest one forward for up
// to 30 s, so every row can be judged warm or cold. Charts plot only the readings actually taken (row._got).
function load(id) {
  const rows = [], latest = {}, motion = []
  for (const l of fs.readFileSync(path.join(DIR, id + '.jsonl'), 'utf8').split('\n')) {
    let o; try { o = JSON.parse(l) } catch { continue }
    // one second of the phone's motion sensors (ios/V60App/Motion.swift), kept apart from the engine readings
    if (o && o.m && typeof o.m === 'object') { if (Number.isFinite(o.t)) motion.push({ t: o.t, ...o.m }); continue }
    const row = { t: o.t, _got: {} }
    for (const [k, v] of Object.entries(latest)) if (o.t - v.t <= 30000) row[k] = v.v
    for (const [k, b] of Object.entries(o.v || {})) {
      if ((k === '01' || k === '41') && Array.isArray(b) && b.length >= 4) { row[k === '01' ? 'status' : 'cycle'] = monitors(b); continue }
      const p = PIDS[k]; if (!p || !Array.isArray(b) || !b.length) continue
      const v = p[3](b[0], b.length > 1 ? b[1] : 0)
      if (Number.isFinite(v)) { row[p[0]] = v; row._got[p[0]] = true; latest[p[0]] = { t: o.t, v } }
    }
    rows.push(row)
  }
  rows.sort((a, b) => a.t - b.t)
  rows.motion = motion.sort((a, b) => a.t - b.t)
  return rows
}

/* ---------------- the phone's motion sensors ----------------
   Each second: v/h vibration (milli-g RMS), vf/va and hf/ha the strongest vertical/horizontal vibration 4-40 Hz
   (0.1 Hz, milli-g), a1/a2/a3 steady push (milli-g; a1/a2 level axes fixed to the phone), yr turn rate (0.1 deg/s),
   mv how far the phone tilted (0.1 deg). Speeds and speed changes come from the car (PID 0D). */
const G = 9.80665, MPH = 0.44704
export function motionOf(rows) {
  const M = (rows.motion || []).filter((m) => (m.mv ?? 0) <= 30) // seconds the phone stayed put
  const sp = rows.filter((r) => r._got && r._got.mph)
  if (M.length < 30 || sp.length < 10) return M.length ? { seconds: M.length, moved: (rows.motion || []).length - M.length, usable: false } : null
  // the car's speed and its change (milli-g) at a time, from the engine computer's speed readings
  let j = 0
  const at = (t) => {
    while (j + 1 < sp.length && sp[j + 1].t <= t) j++
    const a = sp[Math.max(0, j - 1)], b = sp[Math.min(sp.length - 1, j + 1)]
    if (Math.abs(sp[j].t - t) > 3000) return null
    const dt = (b.t - a.t) / 1000
    return { mph: sp[j].mph, mg: dt > 0.5 && dt < 6 ? ((b.mph - a.mph) * MPH / dt / G) * 1000 : null }
  }
  const S = M.map((m) => ({ ...m, car: at(m.t) })).filter((m) => m.car)
  // which level axis is forward: fit the car's own speed change to the phone's push (least squares, 2 unknowns)
  let sxx = 0, sxy = 0, syy = 0, sxz = 0, syz = 0, n = 0
  for (const m of S) if (m.car.mg != null && Math.abs(m.car.mg) > 30) { sxx += m.a1 * m.a1; sxy += m.a1 * m.a2; syy += m.a2 * m.a2; sxz += m.a1 * m.car.mg; syz += m.a2 * m.car.mg; n++ }
  const det = sxx * syy - sxy * sxy
  let fwd = null
  if (n >= 8 && det > 0) {
    const x = (sxz * syy - syz * sxy) / det, y = (syz * sxx - sxz * sxy) / det, l = Math.hypot(x, y)
    if (l > 0.3 && l < 3) fwd = { x: x / l, y: y / l, gain: l } // gain near 1 means the phone's push matches the car's
  }
  const out = { seconds: M.length, moved: (rows.motion || []).length - M.length, usable: true, forward: !!fwd }
  // hardest braking (the car's own speed) and hardest cornering (turn rate × speed: no phone axes needed)
  out.brakeG = Math.max(0, ...S.map((m) => (m.car.mg != null ? -m.car.mg / 1000 : 0)))
  out.cornerG = Math.max(0, ...S.filter((m) => m.car.mph > 10).map((m) => Math.abs((m.yr / 10) * Math.PI / 180 * m.car.mph * MPH / G)))
  // vibration by speed band, steady driving only (speed change under 0.04 g)
  const steady = S.filter((m) => m.car.mg != null && Math.abs(m.car.mg) < 40 && m.car.mph >= 5)
  const med = (a) => { if (!a.length) return null; const s = [...a].sort((p, q) => p - q); return s[Math.floor(s.length / 2)] }
  out.bands = []
  for (let lo = 0; lo < 90; lo += 10) {
    const b = steady.filter((m) => m.car.mph >= lo && m.car.mph < lo + 10)
    if (b.length >= 5) out.bands.push({ lo, hi: lo + 10, n: b.length, v: med(b.map((m) => m.v)), h: med(b.map((m) => m.h)) })
  }
  // speed-linked vibration: the strongest vertical shake at once per wheel turn means a wheel/tire about 1.8-2.3 m
  // around (a 16-19 inch car tire works out to about 2.0-2.1 m: diameter = rim + 2 × width × aspect); twice per turn, half that. Steady over 40 mph, a clear peak only.
  const fast = steady.filter((m) => m.car.mph >= 40 && m.vf > 0 && m.va > 0)
  const circ = (m) => (m.car.mph * MPH) / (m.vf / 10)
  const wheel1 = fast.filter((m) => { const c = circ(m); return c >= 1.8 && c <= 2.3 }), wheel2 = fast.filter((m) => { const c = circ(m); return c >= 0.9 && c <= 1.15 })
  out.wheel = fast.length >= 20 ? { n: fast.length, once: wheel1.length / fast.length, twice: wheel2.length / fast.length, size: med(wheel1.map((m) => m.va)), circ: med(wheel1.map(circ)) } : null
  // brake shudder: horizontal vibration while braking (over 0.1 g, over 25 mph) against steady driving at like speeds
  const braking = S.filter((m) => m.car.mg != null && m.car.mg < -100 && m.car.mph > 25)
  if (braking.length >= 3) {
    const ratios = braking.map((m) => { const like = steady.filter((x) => Math.abs(x.car.mph - m.car.mph) < 10); const base = med(like.map((x) => x.h)); return base ? m.h / base : null }).filter((r) => r != null)
    out.brake = ratios.length >= 3 ? { n: ratios.length, ratio: med(ratios) } : null
  } else out.brake = null
  return out
}
function motionLine(mo) {
  if (!mo) return ''
  if (!mo.usable) return `Phone sensors: ${mo.seconds} s recorded${mo.moved ? `, the phone moved in ${mo.moved}` : ''}; not enough steady seconds with speed readings to analyse.`
  const p = [`Phone sensors: ${mo.seconds} usable s${mo.moved ? ` (${mo.moved} dropped: the phone moved)` : ''}.`, `Hardest braking ${mo.brakeG.toFixed(2)} g, hardest cornering ${mo.cornerG.toFixed(2)} g.`]
  if (mo.wheel) p.push(`Above 40 mph the strongest vertical shake matched once per wheel turn in ${Math.round(mo.wheel.once * 100)}% of steady seconds${mo.wheel.size != null ? ` (typical ${mo.wheel.size} milli-g, a wheel about ${mo.wheel.circ.toFixed(2)} m around)` : ''} and twice per turn in ${Math.round(mo.wheel.twice * 100)}%; compare with later drives and new tires, it is not a verdict on its own.`)
  if (mo.brake) p.push(`Vibration while braking was ${mo.brake.ratio.toFixed(1)}× steady driving at like speeds (${mo.brake.n} s)${mo.brake.ratio >= 1.8 ? ': a sign of brake judder (rotor runout or uneven pad deposits)' : ''}.`)
  return p.join(' ')
}

/* ---------------- numbers ---------------- */

// PID 01 (since codes were cleared) and 41 (this drive cycle), SAE J1979, spark-ignition layout: A bit 7 = check-engine
// light, A bits 0-6 = stored code count; B bits 0-2 = misfire, fuel system, components supported, bits 4-6 = not
// complete; C = supported and D = not complete for catalyst, heated catalyst, evaporative system, secondary air,
// A/C refrigerant, O2 sensor, O2 sensor heater, EGR/VVT (the same names the Live link page uses).
const MON_B = ['Misfire', 'Fuel system', 'Components']
const MON_CD = ['Catalyst', 'Heated catalyst', 'Evaporative system', 'Secondary air', 'A/C refrigerant', 'Oxygen sensor', 'Oxygen sensor heater', 'EGR / VVT']
function monitors([a, b, c, d]) {
  const notReady = []
  MON_B.forEach((n, i) => { if (b & (1 << i) && b & (1 << (i + 4))) notReady.push(n) })
  MON_CD.forEach((n, i) => { if (c & (1 << i) && d & (1 << i)) notReady.push(n) })
  return { mil: !!(a & 0x80), dtcs: a & 0x7f, notReady }
}

// Fuel use from air flow at the stoichiometric 14.7:1 air-fuel ratio, gasoline about 2,835 g per US gallon.
// An estimate: fuel trims, ethanol blend and rich running under load all move the real figure.
const GRAMS_AIR_PER_GALLON = 14.7 * 2835

const mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : null)
const last = (rows, k) => { for (let i = rows.length - 1; i >= 0; i--) if (rows[i][k] != null) return rows[i][k]; return null }
const vals = (rows, k) => rows.map((r) => r[k]).filter((v) => v != null)

/** Fuel trims where they mean most: warm idle versus steady cruise (and everything else). */
function trims(rows) {
  const warm = (r) => (r.coolant ?? 0) >= 160
  const idle = rows.filter((r) => warm(r) && r.mph != null && r.mph < 1 && r.rpm != null && r.rpm < 1100)
  const cruise = rows.filter((r) => warm(r) && r.mph != null && r.mph > 35 && (r.load ?? 0) < 70)
  const all = rows.filter(warm)
  const sum = (set) => {
    const s = mean(vals(set, 'stft')), l = mean(vals(set, 'ltft'))
    return { n: set.length, stft: s, ltft: l, total: s != null && l != null ? s + l : null, maf: mean(vals(set, 'maf')), rpm: mean(vals(set, 'rpm')) }
  }
  return { idle: sum(idle), cruise: sum(cruise), all: sum(all) }
}

function statsOf(rows) {
  const s = { n: rows.length, minutes: rows.length > 1 ? (rows[rows.length - 1].t - rows[0].t) / 60000 : 0, miles: 0, gallons: 0 }
  s.start = rows.length ? new Date(rows[0].t).toISOString() : null
  s.end = rows.length ? new Date(rows[rows.length - 1].t).toISOString() : null
  for (let i = 1; i < rows.length; i++) {
    const dt = (rows[i].t - rows[i - 1].t) / 3600000
    if (!(dt > 0 && dt < 0.01)) continue
    if (rows[i].mph != null) s.miles += rows[i].mph * dt
    if (rows[i].maf != null) s.gallons += (rows[i].maf * 3600 / GRAMS_AIR_PER_GALLON) * dt
  }
  s.mpg = s.gallons > 0.02 && s.miles > 0.5 ? s.miles / s.gallons : null
  // warm-up: from a cold start (coolant under 100 °F) to 175 °F
  const coolRows = rows.filter((r) => r._got.coolant)
  if (coolRows.length && coolRows[0].coolant < 100) {
    const hot = coolRows.find((r) => r.coolant >= 175)
    s.warmupMin = hot ? (hot.t - coolRows[0].t) / 60000 : null
  } else s.warmupMin = null
  const charging = rows.filter((r) => r._got.volts && (r.rpm ?? 0) > 600).map((r) => r.volts)
  s.voltsCharging = mean(charging)
  const st = rows.filter((r) => r.status).at(-1)
  s.status = st ? st.status : null
  const cy = rows.filter((r) => r.cycle).at(-1)
  s.cycle = cy ? cy.cycle : null
  const mph = vals(rows, 'mph'), cool = vals(rows, 'coolant'), volts = vals(rows, 'volts')
  s.topMph = mph.length ? Math.max(...mph) : null
  s.coolStart = cool.length ? cool[0] : null
  s.coolMax = cool.length ? Math.max(...cool) : null
  s.voltsMin = volts.length ? Math.min(...volts) : null
  s.voltsMax = volts.length ? Math.max(...volts) : null
  s.trims = trims(rows)
  s.motion = motionOf(rows)
  for (const k of ['milMiles', 'clearedMiles', 'warmups', 'fuel', 'ambient', 'milMinutes']) s[k] = last(rows, k)
  return s
}

const pct = (v) => (v == null ? 'n/a' : (v > 0 ? '+' : '') + v.toFixed(1) + '%')
const num = (v, d = 0) => (v == null ? 'n/a' : v.toFixed(d))

function summaryOf(s) {
  const t = s.trims
  const parts = [`${num(s.minutes)} min, ${num(s.miles, 1)} mi, top ${num(s.topMph)} mph.`]
  if (t.idle.n) parts.push(`Warm idle (${t.idle.n} readings): short-term ${pct(t.idle.stft)}, long-term ${pct(t.idle.ltft)}, total ${pct(t.idle.total)}, air flow ${num(t.idle.maf, 1)} g/s.`)
  if (t.cruise.n) parts.push(`Cruise over 35 mph (${t.cruise.n}): short-term ${pct(t.cruise.stft)}, long-term ${pct(t.cruise.ltft)}, total ${pct(t.cruise.total)}.`)
  if (!t.idle.n && !t.cruise.n) parts.push('No warm idle or steady cruise long enough to compare fuel trims.')
  if (s.mpg != null) parts.push(`About ${num(s.mpg, 1)} mpg (estimated from air flow).`)
  if (s.coolMax != null) parts.push(`Coolant ${num(s.coolStart)}→${num(s.coolMax)}°F${s.warmupMin != null ? `, warm (175°F) after ${num(s.warmupMin, 1)} min` : ''}.`)
  if (s.status) parts.push(`Check-engine light ${s.status.mil ? 'ON' : 'off'}, ${s.status.dtcs} stored code(s); emissions monitors ${s.status.notReady.length ? 'not ready: ' + s.status.notReady.join(', ') : 'all complete'}.`)
  if (s.voltsMin != null) parts.push(`Voltage ${num(s.voltsMin, 1)}–${num(s.voltsMax, 1)} V.`)
  if (s.milMiles != null) parts.push(`Driven ${num(s.milMiles)} mi with the light on.`)
  if (s.warmups != null) parts.push(`${s.warmups} warm-ups and ${num(s.clearedMiles)} mi since codes were last cleared.`)
  if (s.motion) parts.push(motionLine(s.motion))
  return parts.join(' ')
}

/* ---------------- the page ---------------- */

const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;')

/** A tall, narrow line chart (phone first): one or more series against minutes into the drive. */
function chart(rows, title, series, opt = {}) {
  const t0 = rows.length ? rows[0].t : 0
  const pts = series.map((s) => rows.filter((r) => r._got[s.k]).map((r) => [(r.t - t0) / 60000, r[s.k]]))
  const all = pts.flat()
  if (all.length < 3) return ''
  const W = 358, H = 170, L = 40, R = 8, T = 10, B = 24
  const xMax = Math.max(...all.map((p) => p[0]), 0.1)
  let yMin = Math.min(...all.map((p) => p[1]), opt.min ?? Infinity), yMax = Math.max(...all.map((p) => p[1]), opt.max ?? -Infinity)
  if (yMax - yMin < 1e-6) { yMax += 1; yMin -= 1 }
  const x = (v) => L + (v / xMax) * (W - L - R), y = (v) => T + (1 - (v - yMin) / (yMax - yMin)) * (H - T - B)
  const lines = pts.map((p, i) => {
    // thin to at most ~600 points so the page stays light
    const step = Math.max(1, Math.ceil(p.length / 600))
    const d = p.filter((_, j) => j % step === 0).map((q, j) => (j ? 'L' : 'M') + x(q[0]).toFixed(1) + ' ' + y(q[1]).toFixed(1)).join('')
    return `<path d="${d}" class="s${i}" fill="none"/>`
  }).join('')
  const zero = opt.zero && yMin < 0 && yMax > 0 ? `<line x1="${L}" x2="${W - R}" y1="${y(0).toFixed(1)}" y2="${y(0).toFixed(1)}" class="zero"/>` : ''
  const band = opt.band ? `<rect x="${L}" width="${W - L - R}" y="${y(Math.min(opt.band, yMax)).toFixed(1)}" height="${(y(Math.max(-opt.band, yMin)) - y(Math.min(opt.band, yMax))).toFixed(1)}" class="band"/>` : ''
  const legend = series.map((s, i) => (pts[i].length ? `<span class="k s${i}">${esc(s.n)}</span>` : '')).join(' ')
  return `<section class="ch"><h3>${esc(title)}</h3><p class="lg">${legend}</p>
<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}">${band}${zero}
<text x="${L - 4}" y="${T + 10}" class="ax" text-anchor="end">${num(yMax, opt.d ?? 0)}</text>
<text x="${L - 4}" y="${H - B}" class="ax" text-anchor="end">${num(yMin, opt.d ?? 0)}</text>
<text x="${L}" y="${H - 6}" class="ax">${opt.xStart ?? 0}</text><text x="${W - R}" y="${H - 6}" class="ax" text-anchor="end">${opt.xText ? esc(opt.xText(xMax)) : num(xMax) + ' min'}</text>
${lines}</svg></section>`
}

const STYLE = `:root{color-scheme:light dark;--ink:#1d1d1b;--mut:#6b6b66;--line:#d8d6cf;--bg:#f6f4ee;--c0:#0b6e8a;--c1:#c2410c;--c2:#6d28d9;--ok:#1a7f37;--bad:#b42318}
@media(prefers-color-scheme:dark){:root{--ink:#ecebe6;--mut:#a3a29c;--line:#3a3a36;--bg:#151514;--c0:#38bdf8;--c1:#fb923c;--c2:#c4b5fd;--ok:#4cc26a;--bad:#ff7b72}}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.45 system-ui,sans-serif}main{max-width:720px;margin:0 auto;padding:16px}
h1{font-size:22px;margin:4px 0}h2{font-size:13px;text-transform:uppercase;letter-spacing:.07em;color:var(--mut);margin:24px 0 8px;border-bottom:1px solid var(--line);padding-bottom:4px}
h3{font-size:15px;margin:0}.sub{color:var(--mut);font-size:14px;margin:0}.cards{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin:12px 0}
.card{border:1px solid var(--line);padding:10px}.card b{display:block;font-size:22px;font-family:ui-monospace,Consolas,monospace}.card span{color:var(--mut);font-size:13px}
table{width:100%;border-collapse:collapse;font-size:14px}th,td{text-align:right;padding:6px 4px;border-bottom:1px solid var(--line)}th:first-child,td:first-child{text-align:left}
td{font-family:ui-monospace,Consolas,monospace}.ch{margin:14px 0}.ch svg{width:100%;height:auto;display:block}.lg{margin:2px 0 4px;font-size:13px}
.k::before{content:"";display:inline-block;width:14px;height:3px;margin-right:4px;vertical-align:middle;background:currentColor}
path{stroke-width:1.6}.s0{color:var(--c0);stroke:var(--c0)}.s1{color:var(--c1);stroke:var(--c1)}.s2{color:var(--c2);stroke:var(--c2)}
.ax{font:11px ui-monospace,Consolas,monospace;fill:var(--mut)}.zero{stroke:var(--mut);stroke-dasharray:3 3}.band{fill:var(--ok);opacity:.08}
.note{font-size:14px;color:var(--mut)}.bad b{color:var(--bad)}.good b{color:var(--ok)}.nav{display:flex;gap:14px;flex-wrap:wrap;font-size:15px;margin:0 0 6px}a{color:var(--c0)}ul.dr{list-style:none;padding:0}ul.dr li{border-bottom:1px solid var(--line);padding:10px 0}`

function when(id) {
  const m = id.match(/^(\d{4})(\d\d)(\d\d)-(\d\d)(\d\d)/)
  return m ? new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : id
}

/** Emissions readiness from the car's own monitor report (PID 01) at the end of the drive. */
function readiness(s) {
  if (!s.status) return ''
  const st = s.status
  const verdict = st.mil
    ? '<p class="bad"><b>The check-engine light is on.</b> An emissions test fails while it is on.</p>'
    : st.notReady.length > 1
      ? `<p class="bad"><b>${st.notReady.length} monitors are not ready.</b> Drive normally for a few days before an emissions test.</p>`
      : '<p class="good"><b>Light off and monitors ready.</b></p>'
  return `<h2>Emissions readiness</h2>${verdict}<p class="note">${st.dtcs} stored code(s). Not ready: ${st.notReady.length ? esc(st.notReady.join(', ')) : 'none'}.${s.cycle && s.cycle.notReady.length ? ' Not yet run this drive: ' + esc(s.cycle.notReady.join(', ')) + '.' : ''}</p>`
}

function page(id, rows, s, summary) {
  const t = s.trims
  const row = (name, x) => `<tr><td>${name}</td><td>${x.n}</td><td>${pct(x.stft)}</td><td>${pct(x.ltft)}</td><td>${pct(x.total)}</td><td>${num(x.maf, 1)}</td></tr>`
  const card = (v, label) => `<div class="card"><b>${v}</b><span>${label}</span></div>`
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Drive ${esc(when(id))}</title><style>${STYLE}</style><main>
${NAV}<h1>Drive, ${esc(when(id))}</h1><p class="sub">${s.n} readings from the engine computer through the OBD-II port.</p>
<div class="cards">${card(num(s.minutes), 'minutes')}${card(num(s.miles, 1), 'miles')}${card(num(s.topMph), 'top mph')}${card(s.coolMax == null ? 'n/a' : num(s.coolMax) + '°', 'coolant peak °F')}${card(s.voltsMin == null ? 'n/a' : num(s.voltsMin, 1) + '–' + num(s.voltsMax, 1), 'volts')}${card(s.milMiles == null ? 'n/a' : num(s.milMiles), 'mi with the light on')}${card(s.mpg == null ? 'n/a' : num(s.mpg, 1), 'mpg (estimated from air flow)')}${card(s.warmupMin == null ? 'n/a' : num(s.warmupMin, 1), 'min to warm up (175 °F)')}</div>
${readiness(s)}
<h2>Fuel trims, engine warm</h2>
<table><tr><th></th><th>readings</th><th>short</th><th>long</th><th>total</th><th>air g/s</th></tr>${row('Idle', t.idle)}${row('Cruise over 35 mph', t.cruise)}${row('Whole drive', t.all)}</table>
<p class="note">Fuel trim is how much the engine computer adds (+) or removes (−) from its base fuel amount to hold the right air-fuel mix. The shaded band on the chart is ±10%. Claude reads these with you in the recap; it is not a diagnosis on its own.</p>
<h2>Charts</h2>
${chart(rows, 'Fuel trims', [{ k: 'stft', n: 'short-term %' }, { k: 'ltft', n: 'long-term %' }], { zero: true, band: 10, min: -12, max: 12, d: 0 })}
${chart(rows, 'Speed and engine load', [{ k: 'mph', n: 'mph' }, { k: 'load', n: 'load %' }], { min: 0 })}
${chart(rows, 'RPM', [{ k: 'rpm', n: 'rpm' }], { min: 0 })}
${chart(rows, 'Air flow', [{ k: 'maf', n: 'g/s' }], { min: 0, d: 1 })}
${chart(rows, 'Temperatures', [{ k: 'coolant', n: 'coolant °F' }, { k: 'iat', n: 'intake air °F' }, { k: 'oil', n: 'oil °F' }])}
${chart(rows, 'Voltage', [{ k: 'volts', n: 'module V' }], { d: 1 })}
${chart(rows, 'Oxygen sensors', [{ k: 'o2s1', n: 'sensor 1 V' }, { k: 'o2s2', n: 'sensor 2 V' }, { k: 'lambda1', n: 'sensor 1 lambda' }], { d: 2 })}
${motionSection(rows, s.motion)}
<h2>In words</h2><p>${esc(summary)}</p>
<p class="note">Readings use the standard OBD-II (SAE J1979) scalings. Recorded by the V60 iPhone app; stored on this PC only (bridge/data/drives).</p>
</main></html>`
}

function motionSection(rows, mo) {
  if (!mo) return ''
  const card = (v, label) => `<div class="card"><b>${v}</b><span>${label}</span></div>`
  let h = '<h2>Vibration, braking and cornering (phone sensors)</h2>'
  if (!mo.usable) return h + `<p>${esc(motionLine(mo))}</p>`
  h += `<div class="cards">${card(mo.seconds, 'usable seconds')}${card(mo.brakeG.toFixed(2), 'hardest braking, g')}${card(mo.cornerG.toFixed(2), 'hardest cornering, g')}${card(mo.brake ? mo.brake.ratio.toFixed(1) + '×' : 'n/a', 'vibration braking vs steady')}${card(mo.wheel ? Math.round(mo.wheel.once * 100) + '%' : 'n/a', 'shake at once per wheel turn, over 40 mph')}</div>`
  if (mo.bands.length) h += `<table><tr><th>steady speed</th><th>seconds</th><th>vertical shake</th><th>side-to-side shake</th></tr>${mo.bands.map((b) => `<tr><td>${b.lo}-${b.hi} mph</td><td>${b.n}</td><td>${b.v} mg</td><td>${b.h} mg</td></tr>`).join('')}</table>`
  const mrows = (rows.motion || []).filter((m) => (m.mv ?? 0) <= 30).map((m) => ({ t: m.t, v: m.v, h: m.h, _got: { v: true, h: true } }))
  h += chart(mrows, 'Vibration (milli-g)', [{ k: 'v', n: 'vertical' }, { k: 'h', n: 'side-to-side' }], { min: 0 })
  return h + `<p class="note">From the phone's accelerometer and gyroscope, 100 times a second, summed up each second; seconds when the phone moved are left out. A phone in a mount or cupholder gives the cleanest readings; in a pocket the body damps them. Vibration that rises with speed and matches one wheel turn points to tires and wheels (balance, a bent rim, uneven wear) or a wheel bearing; vibration that jumps only while braking points to the brake rotors. Milli-g are this phone's own scale: compare drives with each other, not with numbers from elsewhere.</p>`
}

function build(id) {
  const rows = load(id)
  const stats = statsOf(rows)
  const summary = summaryOf(stats)
  fs.writeFileSync(path.join(DIR, id + '.html'), page(id, rows, stats, summary))
  fs.writeFileSync(path.join(DIR, id + '.json'), JSON.stringify({ id, stats, summary }, null, 1))
  return { stats, summary }
}

export function list() {
  try {
    return fs.readdirSync(DIR).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'))).sort((a, b) => (a.id < b.id ? 1 : -1))
  } catch { return [] }
}

const NAV = '<p class="nav"><a href="/drives">All drives</a><a href="/drives/week">This week</a><a href="/drives/trends">Trends</a></p>'
const shell = (title, body) => `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>${STYLE}</style><main>${NAV}${body}</main></html>`

/** Alerts the iPhone app raised while driving ({k:"alert"} rows in the bridge log), newest last. */
function alertsSince(ms) {
  const dir = path.join(DATA, 'logs'), out = []
  let files = []; try { files = fs.readdirSync(dir).filter((f) => f.endsWith('.jsonl')).sort().slice(-10) } catch {}
  for (const f of files) for (const l of fs.readFileSync(path.join(dir, f), 'utf8').split('\n')) {
    try { const r = JSON.parse(l); if (r.k === 'alert' && Date.parse(r.at) >= ms) out.push(r) } catch {}
  }
  return out
}

/** One drive's line for lists and the Garage feed. */
function brief(d) {
  const s = d.stats || {}, t = s.trims || {}
  return { id: d.id, start: s.start || null, end: s.end || null, minutes: s.minutes ?? null, miles: s.miles ?? null, mpg: s.mpg ?? null,
    idleTrim: t.idle && t.idle.n ? t.idle.total : null, cruiseTrim: t.cruise && t.cruise.n ? t.cruise.total : null, coolMax: s.coolMax ?? null,
    warmupMin: s.warmupMin ?? null, voltsCharging: s.voltsCharging ?? null,
    motion: s.motion && s.motion.usable ? { seconds: s.motion.seconds, brakeG: +s.motion.brakeG.toFixed(2), cornerG: +s.motion.cornerG.toFixed(2), brakeRatio: s.motion.brake ? +s.motion.brake.ratio.toFixed(2) : null, wheelOnce: s.motion.wheel ? +s.motion.wheel.once.toFixed(2) : null } : null,
    mil: s.status ? s.status.mil : null, dtcs: s.status ? s.status.dtcs : null, notReady: s.status ? s.status.notReady : null, url: reportUrl(d.id) }
}

function weekPage() {
  const since = Date.now() - 7 * 86400000
  const ds = list().map(brief).filter((d) => d.start && Date.parse(d.start) >= since)
  const miles = ds.reduce((a, d) => a + (d.miles || 0), 0), mins = ds.reduce((a, d) => a + (d.minutes || 0), 0)
  const mpgs = ds.filter((d) => d.mpg != null), mpg = mpgs.length ? mpgs.reduce((a, d) => a + d.mpg * d.miles, 0) / mpgs.reduce((a, d) => a + d.miles, 0) : null
  const idle = ds.filter((d) => d.idleTrim != null).map((d) => d.idleTrim)
  const alerts = alertsSince(since)
  const newest = ds[0]
  const card = (v, l) => `<div class="card"><b>${v}</b><span>${l}</span></div>`
  return shell('This week', `<h1>This week</h1><p class="sub">The last 7 days of recorded drives.</p>
<div class="cards">${card(ds.length, 'drives')}${card(num(miles, 1), 'miles (estimated)')}${card(num(mins), 'minutes driving')}${card(mpg == null ? 'n/a' : num(mpg, 1), 'mpg (estimated)')}${card(idle.length ? pct(mean(idle)) : 'n/a', 'average warm-idle fuel trim')}${card(alerts.length, 'alerts while driving')}</div>
${newest && newest.mil != null ? `<h2>Emissions readiness, latest drive</h2><p class="${newest.mil || (newest.notReady || []).length > 1 ? 'bad' : 'good'}"><b>${newest.mil ? 'Check-engine light on: an emissions test fails while it is on.' : (newest.notReady || []).length > 1 ? (newest.notReady.length + ' monitors not ready.') : 'Light off and monitors ready.'}</b></p>` : ''}
${alerts.length ? '<h2>Alerts</h2><ul class="dr">' + alerts.map((a) => `<li><b>${esc(new Date(a.at).toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' }))}</b> ${esc(a.text || '')}</li>`).join('') + '</ul>' : ''}
<h2>Drives</h2><ul class="dr">${ds.map((d) => `<li><a href="/drives/${d.id}"><b>${esc(when(d.id))}</b></a><br><span class="sub">${num(d.minutes)} min, ${num(d.miles, 1)} mi${d.mpg != null ? ', about ' + num(d.mpg, 1) + ' mpg' : ''}${d.idleTrim != null ? ', idle trim ' + pct(d.idleTrim) : ''}</span></li>`).join('') || '<li>No drives this week.</li>'}</ul>`)
}

function trendsPage() {
  const ds = list().map(brief).reverse() // oldest first
  if (ds.length < 2) return shell('Trends', '<h1>Trends</h1><p>Trends need at least two recorded drives.</p>')
  const rows = ds.map((d, i) => {
    const r = { t: i * 60000, _got: {} }
    for (const k of ['idleTrim', 'cruiseTrim', 'mpg', 'warmupMin', 'voltsCharging', 'coolMax']) if (d[k] != null) { r[k] = d[k]; r._got[k] = true }
    return r
  })
  const x = { xText: () => `latest (${ds.length} drives)`, xStart: 'first' }
  return shell('Trends', `<h1>Trends</h1><p class="sub">One point per recorded drive, oldest on the left (${esc(when(ds[0].id))} to ${esc(when(ds.at(-1).id))}).</p>
${chart(rows, 'Total fuel trim, engine warm', [{ k: 'idleTrim', n: 'idle %' }, { k: 'cruiseTrim', n: 'cruise %' }], { zero: true, band: 10, min: -12, max: 12, d: 0, ...x })}
<p class="note">If a repair for P0171 works, the idle line should drop toward 0 over the following drives.</p>
${chart(rows, 'Fuel economy (estimated)', [{ k: 'mpg', n: 'mpg' }], { d: 1, ...x })}
${chart(rows, 'Warm-up to 175 °F (cold starts only)', [{ k: 'warmupMin', n: 'minutes' }], { min: 0, d: 1, ...x })}
${chart(rows, 'Charging voltage, engine running', [{ k: 'voltsCharging', n: 'volts' }], { d: 1, ...x })}
${chart(rows, 'Coolant peak', [{ k: 'coolMax', n: '°F' }], { ...x })}`)
}

/** GET /drives (list), /drives/latest, /drives/week, /drives/trends, /drives/summary.json (the Garage's feed),
 *  /drives/<id> (report). Returns true when it answered. */
/* ---------------- deep scans from the Live link page (tools/gen/live_deep.js) ---------------- */

const DEEP = path.join(DATA, 'deep')
const DEEP_ID = /^\d{8}-\d{6}$/

function deepPage(id, R) {
  const mods = (R.modules || []).map((m) => {
    const word = !m.answered ? 'no answer' : m.neg ? 'declined (' + esc(m.neg) + ')' : m.codes.length ? m.codes.length + ' code(s)' : 'clean'
    const codes = (m.codes || []).map((c) => `<li><code>${esc(c.code)}</code>, ${esc(c.label)}${c.light ? ', asks for a warning light' : ''}</li>`).join('')
    return `<li><b>${esc(m.name)}</b> <span class="sub">${word}</span>${codes ? '<ul>' + codes + '</ul>' : ''}</li>`
  }).join('')
  const tests = (R.tests || []).map((t) => `<tr><td>${esc(t.name)}<br><span class="sub">${esc(t.test)}</span></td><td>${t.uasid === 0x24 ? t.value + ' counts' : t.value}</td><td>${t.min} to ${t.max}</td><td class="${t.pass ? 'good' : 'bad'}"><b>${t.pass ? 'ok' : 'outside'}</b></td></tr>`).join('')
  return shell('Deep scan', `<h1>Deep scan, ${esc(when(id))}</h1><p class="sub">${esc(R.summary || '')}</p>
<h2>Modules</h2><ul class="dr">${mods}</ul>
<h2>Engine self-tests (OBD mode 06)</h2>${tests ? `<table><tr><th>Monitor</th><th>reading</th><th>limits</th><th></th></tr>${tests}</table>` : '<p>No results.</p>'}
<p class="note">Readings are in the engine computer's own units; only counts are labelled. "Outside" means the result fell outside the computer's own limits. Module addresses come from P3 sources and are unconfirmed on this car until they answer.</p>`)
}

function readBody(req, max = 512 * 1024) {
  return new Promise((resolve, reject) => {
    let n = 0; const parts = []
    req.on('data', (c) => { n += c.length; if (n > max) { reject(new Error("too large")); req.destroy() } else parts.push(c) })
    req.on('end', () => resolve(Buffer.concat(parts).toString('utf8')))
    req.on('error', reject)
  })
}

async function takeDeep(req, ctx) {
  const R = JSON.parse(await readBody(req))
  if (!R || !Array.isArray(R.modules) || !Array.isArray(R.tests)) throw new Error('not a deep scan')
  const d = new Date(Date.parse(R.date) || Date.now()), p = (n) => String(n).padStart(2, '0')
  const id = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
  fs.mkdirSync(DEEP, { recursive: true })
  fs.writeFileSync(path.join(DEEP, id + '.json'), JSON.stringify(R))
  fs.writeFileSync(path.join(DEEP, id + '.html'), deepPage(id, R))
  const url = `${baseUrl()}/drives/deep/${id}`
  if (ctx && ctx.record) ctx.record({ k: 'deep', id, summary: String(R.summary || '').slice(0, 1000) })
  if (ctx && ctx.wake) ctx.wake('deep_scan', `Kyle ran a deep scan (every module's codes and the engine's mode 06 self-tests). ${R.summary || ''} Full results: ${url} (pass it as url to reply). Explain in plain words what matters, especially misfire counts per cylinder and anything outside limits, and say plainly where a Volvo code's meaning is your reading rather than Volvo's published text.`)
  return { id, url }
}

/* Problem cases (mechanical: noises, vibration, handling, brakes, tires, leaks). The Garage posts what Kyle noticed or a
   photo; it is saved under data/cases/ and Claude is woken. Claude keeps the case files in data/notes/cases.json
   (bridge/CLAUDE.md, "Mechanical problems"), which the Garage shows from summary.json. */
const CASES = path.join(DATA, 'cases')
const ONE = (s, n) => String(s == null ? '' : s).replace(/[\r\n]+/g, ' ').slice(0, n)
async function takeCase(req, ctx) {
  const R = JSON.parse(await readBody(req, 6 * 1024 * 1024))
  if (!R || !['symptom', 'photo'].includes(R.kind)) throw new Error('not a problem report')
  const d = new Date(), p = (n) => String(n).padStart(2, '0')
  const id = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}-${Math.random().toString(16).slice(2, 6)}`
  fs.mkdirSync(CASES, { recursive: true })
  let text
  if (R.kind === 'photo') {
    const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(String(R.image || ''))
    if (!m) throw new Error('the photo must be a JPEG')
    const file = path.join(CASES, id + '.jpg')
    fs.writeFileSync(file, Buffer.from(m[1], 'base64'))
    text = `Kyle sent a photo for you to inspect: ${ONE(R.what, 80) || 'a part of the car'}${R.caseId ? ` (for case ${ONE(R.caseId, 40)})` : ''}. ${R.note ? 'His note: "' + ONE(R.note, 600) + '". ' : ''}Look at it with Read: ${file}`
  } else {
    const when = Array.isArray(R.when) ? R.when.map((x) => ONE(x, 40)).slice(0, 12).join(', ') : ''
    text = `Kyle described a problem: ${ONE(R.what, 60) || 'something'}${when ? `; when: ${when}` : ''}${R.speed ? `; around ${ONE(R.speed, 20)} mph` : ''}${R.where ? `; where: ${ONE(R.where, 40)}` : ''}${R.since ? `; since: ${ONE(R.since, 60)}` : ''}. In his words: "${ONE(R.text, 1500)}"`
  }
  fs.writeFileSync(path.join(CASES, id + '.json'), JSON.stringify({ id, at: d.toISOString(), ...R, image: R.image ? '(saved as ' + id + '.jpg)' : undefined }, null, 1))
  if (ctx && ctx.record) ctx.record({ k: 'case', id, kind: R.kind })
  if (ctx && ctx.wake) ctx.wake(R.kind === 'photo' ? 'photo' : 'symptom', text + ' Follow "Mechanical problems" in bridge/CLAUDE.md: update data/notes/cases.json and send Kyle a short reply.')
  return { id }
}
// Claude's recommendations (maintenance, repair, performance, cosmetic), data/notes/recommendations.json
function recoFeed() {
  let r; try { r = JSON.parse(fs.readFileSync(path.join(DATA, 'notes', 'recommendations.json'), 'utf8')) } catch { return null }
  const items = Array.isArray(r) ? r : Array.isArray(r && r.items) ? r.items : []
  return { updated: (r && r.updated) || null, items: items.slice(0, 40) }
}
function casesFeed() {
  let c; try { c = JSON.parse(fs.readFileSync(path.join(DATA, 'notes', 'cases.json'), 'utf8')) } catch { return [] }
  return (Array.isArray(c) ? c : Array.isArray(c && c.cases) ? c.cases : []).slice(0, 30)
}

// What the service read from the car when it last started (auto.js, data/car.json), for the Garage
function carFeed() {
  let c; try { c = JSON.parse(fs.readFileSync(path.join(DATA, 'car.json'), 'utf8')) } catch { return null }
  const L = c.latest || {}
  return { odometer: c.odometer ? { miles: c.odometer.miles, at: c.odometer.at } : null, odometerListed: !!(c.pids && c.pids.list.includes('A6')),
    at: L.at || null, mil: L.mil ?? null, dtcCount: L.dtcCount ?? null, milMiles: L.milMiles ?? null, clearedMiles: L.clearedMiles ?? null, codes: L.codes || null }
}
// Claude's newest message to Kyle in the last week (logs rows k:'claude')
function lastClaude() {
  for (let i = 0; i < 7; i++) {
    const d = new Date(Date.now() - i * 864e5), f = path.join(DATA, 'logs', `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}.jsonl`)
    let rows; try { rows = fs.readFileSync(f, 'utf8').trim().split('\n') } catch { continue }
    for (let j = rows.length - 1; j >= 0; j--) {
      try { const r = JSON.parse(rows[j]); if (r.k === 'claude' && r.text && !/^Test OK/.test(r.text)) return { text: String(r.text).slice(0, 1200), at: r.at, url: r.url || null } } catch {}
    }
  }
  return null
}

// Not async: a bridge started before 2026-11-26 15:34 calls route() without await and treats any Promise as handled.
export function route(req, res, ctx) {
  const u = new URL(req.url, 'http://x')
  if (!u.pathname.startsWith('/drives')) return false
  // The Garage (GitHub Pages) reads summary.json from this PC through Tailscale.
  const cors = req.headers.origin === 'https://bmcdoorz94.github.io' ? { 'access-control-allow-origin': req.headers.origin, vary: 'Origin' } : {}
  const send = (code, body, type = 'text/html; charset=utf-8') => { res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store', ...cors }); res.end(body) }
  if (req.method === 'OPTIONS') { res.writeHead(204, { ...cors, 'access-control-allow-methods': 'GET, POST', 'access-control-allow-headers': 'content-type' }); res.end(); return true }
  if (u.pathname === '/drives/deep' && req.method === 'POST') {
    // only the Garage page (or the app's web view showing it) may post; the bridge is reachable from Kyle's devices only
    if (!cors['access-control-allow-origin']) { send(403, 'Not allowed.', 'text/plain'); return true }
    takeDeep(req, ctx).then((r) => send(200, JSON.stringify(r), 'application/json'), (e) => send(400, JSON.stringify({ error: e.message }), 'application/json'))
    return true
  }
  if (u.pathname === '/drives/review' && req.method === 'POST') {
    // "Ask for new recommendations" in the Garage: Claude reviews the car and rewrites data/notes/recommendations.json
    if (!cors['access-control-allow-origin']) { send(403, 'Not allowed.', 'text/plain'); return true }
    if (ctx && ctx.record) ctx.record({ k: 'review', by: 'kyle' })
    if (ctx && ctx.wake) ctx.wake('review', 'Kyle asked for fresh recommendations from the Garage. Follow "Recommendations" in bridge/CLAUDE.md.')
    send(200, JSON.stringify({ ok: true }), 'application/json')
    return true
  }
  if (u.pathname === '/drives/case' && req.method === 'POST') {
    // a problem Kyle described, or a photo for Claude to inspect (the Garage's Problem cases page)
    if (!cors['access-control-allow-origin']) { send(403, 'Not allowed.', 'text/plain'); return true }
    takeCase(req, ctx).then((r) => send(200, JSON.stringify(r), 'application/json'), (e) => send(400, JSON.stringify({ error: e.message }), 'application/json'))
    return true
  }
  if (u.pathname.startsWith('/drives/deep/')) {
    const did = u.pathname.split('/')[3] || ''
    const f = path.join(DEEP, did + '.html')
    if (!DEEP_ID.test(did) || !fs.existsSync(f)) { send(404, 'No such scan.', 'text/plain'); return true }
    send(200, fs.readFileSync(f))
    return true
  }
  const id = u.pathname.split('/')[2] || ''
  if (id === 'latest') { const d = list()[0]; res.writeHead(302, { location: d ? '/drives/' + d.id : '/drives' }); res.end(); return true }
  if (id === 'week') { send(200, weekPage()); return true }
  if (id === 'trends') { send(200, trendsPage()); return true }
  if (id === 'summary.json') {
    const ds = list().map(brief)
    const base = baseUrl()
    send(200, JSON.stringify({ updated: new Date().toISOString(), drives: ds, totals: { drives: ds.length, miles: +ds.reduce((a, d) => a + (d.miles || 0), 0).toFixed(1), first: ds.length ? ds.at(-1).start : null },
      links: { all: base + '/drives', week: base + '/drives/week', trends: base + '/drives/trends' }, car: carFeed(), claude: lastClaude(), cases: casesFeed(), recommendations: recoFeed() }), 'application/json; charset=utf-8')
    return true
  }
  if (ID.test(id)) {
    const f = path.join(DIR, id + '.html')
    if (!fs.existsSync(f)) { send(404, 'No such drive.', 'text/plain'); return true }
    if (u.searchParams.has('rebuild')) build(id)
    send(200, fs.readFileSync(f))
    return true
  }
  const items = list().map((d) => `<li><a href="/drives/${d.id}"><b>${esc(when(d.id))}</b></a><br><span class="sub">${esc(d.summary.split('. ').slice(0, 2).join('. '))}</span></li>`).join('')
  send(200, shell('Drives', `<h1>Drives</h1><p class="sub">Recorded by the V60 iPhone app.</p><ul class="dr">${items || '<li>No drives yet.</li>'}</ul>`))
  return true
}

/** Rebuild every stored drive's numbers and page (after the analysis changes). */
export function rebuildAll() {
  let n = 0
  try { for (const f of fs.readdirSync(DIR)) if (f.endsWith('.jsonl')) { build(f.replace(/\.jsonl$/, '')); n++ } } catch {}
  return n
}
