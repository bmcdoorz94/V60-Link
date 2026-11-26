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
  const rows = [], latest = {}
  for (const l of fs.readFileSync(path.join(DIR, id + '.jsonl'), 'utf8').split('\n')) {
    let o; try { o = JSON.parse(l) } catch { continue }
    const row = { t: o.t, _got: {} }
    for (const [k, v] of Object.entries(latest)) if (o.t - v.t <= 30000) row[k] = v.v
    for (const [k, b] of Object.entries(o.v || {})) {
      const p = PIDS[k]; if (!p || !Array.isArray(b) || !b.length) continue
      const v = p[3](b[0], b.length > 1 ? b[1] : 0)
      if (Number.isFinite(v)) { row[p[0]] = v; row._got[p[0]] = true; latest[p[0]] = { t: o.t, v } }
    }
    rows.push(row)
  }
  return rows.sort((a, b) => a.t - b.t)
}

/* ---------------- numbers ---------------- */

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
  const s = { n: rows.length, minutes: rows.length > 1 ? (rows[rows.length - 1].t - rows[0].t) / 60000 : 0, miles: 0 }
  for (let i = 1; i < rows.length; i++) {
    const dt = (rows[i].t - rows[i - 1].t) / 3600000
    if (dt > 0 && dt < 0.01 && rows[i].mph != null) s.miles += rows[i].mph * dt
  }
  const mph = vals(rows, 'mph'), cool = vals(rows, 'coolant'), volts = vals(rows, 'volts')
  s.topMph = mph.length ? Math.max(...mph) : null
  s.coolStart = cool.length ? cool[0] : null
  s.coolMax = cool.length ? Math.max(...cool) : null
  s.voltsMin = volts.length ? Math.min(...volts) : null
  s.voltsMax = volts.length ? Math.max(...volts) : null
  s.trims = trims(rows)
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
  if (s.coolMax != null) parts.push(`Coolant ${num(s.coolStart)}→${num(s.coolMax)}°F.`)
  if (s.voltsMin != null) parts.push(`Voltage ${num(s.voltsMin, 1)}–${num(s.voltsMax, 1)} V.`)
  if (s.milMiles != null) parts.push(`Driven ${num(s.milMiles)} mi with the light on.`)
  if (s.warmups != null) parts.push(`${s.warmups} warm-ups and ${num(s.clearedMiles)} mi since codes were last cleared.`)
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
<text x="${L}" y="${H - 6}" class="ax">0</text><text x="${W - R}" y="${H - 6}" class="ax" text-anchor="end">${num(xMax)} min</text>
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
.note{font-size:14px;color:var(--mut)}a{color:var(--c0)}ul.dr{list-style:none;padding:0}ul.dr li{border-bottom:1px solid var(--line);padding:10px 0}`

function when(id) {
  const m = id.match(/^(\d{4})(\d\d)(\d\d)-(\d\d)(\d\d)/)
  return m ? new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : id
}

function page(id, rows, s, summary) {
  const t = s.trims
  const row = (name, x) => `<tr><td>${name}</td><td>${x.n}</td><td>${pct(x.stft)}</td><td>${pct(x.ltft)}</td><td>${pct(x.total)}</td><td>${num(x.maf, 1)}</td></tr>`
  const card = (v, label) => `<div class="card"><b>${v}</b><span>${label}</span></div>`
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Drive ${esc(when(id))}</title><style>${STYLE}</style><main>
<p class="sub"><a href="/drives">All drives</a></p><h1>Drive, ${esc(when(id))}</h1><p class="sub">${s.n} readings from the engine computer through the OBD-II port.</p>
<div class="cards">${card(num(s.minutes), 'minutes')}${card(num(s.miles, 1), 'miles')}${card(num(s.topMph), 'top mph')}${card(s.coolMax == null ? 'n/a' : num(s.coolMax) + '°', 'coolant peak °F')}${card(s.voltsMin == null ? 'n/a' : num(s.voltsMin, 1) + '–' + num(s.voltsMax, 1), 'volts')}${card(s.milMiles == null ? 'n/a' : num(s.milMiles), 'mi with the light on')}</div>
<h2>Fuel trims, engine warm</h2>
<table><tr><th></th><th>readings</th><th>short</th><th>long</th><th>total</th><th>air g/s</th></tr>${row('Idle', t.idle)}${row('Cruise over 35 mph', t.cruise)}${row('Whole drive', t.all)}</table>
<p class="note">Fuel trim is how much the engine computer adds (+) or removes (−) from its base fuel amount to hold the right air-fuel mix. The shaded band on the chart is ±10%. Claude reads these with you in the recap; it is not a diagnosis on its own.</p>
<h2>Charts</h2>
${chart(rows, 'Fuel trims', [{ k: 'stft', n: 'short-term %' }, { k: 'ltft', n: 'long-term %' }], { zero: true, band: 10, d: 0 })}
${chart(rows, 'Speed and engine load', [{ k: 'mph', n: 'mph' }, { k: 'load', n: 'load %' }], { min: 0 })}
${chart(rows, 'RPM', [{ k: 'rpm', n: 'rpm' }], { min: 0 })}
${chart(rows, 'Air flow', [{ k: 'maf', n: 'g/s' }], { min: 0, d: 1 })}
${chart(rows, 'Temperatures', [{ k: 'coolant', n: 'coolant °F' }, { k: 'iat', n: 'intake air °F' }, { k: 'oil', n: 'oil °F' }])}
${chart(rows, 'Voltage', [{ k: 'volts', n: 'module V' }], { d: 1 })}
${chart(rows, 'Oxygen sensors', [{ k: 'o2s1', n: 'sensor 1 V' }, { k: 'o2s2', n: 'sensor 2 V' }, { k: 'lambda1', n: 'sensor 1 lambda' }], { d: 2 })}
<h2>In words</h2><p>${esc(summary)}</p>
<p class="note">Readings use the standard OBD-II (SAE J1979) scalings. Recorded by the V60 iPhone app; stored on this PC only (bridge/data/drives).</p>
</main></html>`
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

/** GET /drives (list), /drives/latest, /drives/<id> (report). Returns true when it answered. */
export function route(req, res) {
  const u = new URL(req.url, 'http://x')
  if (!u.pathname.startsWith('/drives')) return false
  const send = (code, body, type = 'text/html; charset=utf-8') => { res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store' }); res.end(body) }
  const id = u.pathname.split('/')[2] || ''
  if (id === 'latest') { const d = list()[0]; res.writeHead(302, { location: d ? '/drives/' + d.id : '/drives' }); res.end(); return true }
  if (ID.test(id)) {
    const f = path.join(DIR, id + '.html')
    if (!fs.existsSync(f)) { send(404, 'No such drive.', 'text/plain'); return true }
    if (u.searchParams.has('rebuild')) build(id)
    send(200, fs.readFileSync(f))
    return true
  }
  const items = list().map((d) => `<li><a href="/drives/${d.id}"><b>${esc(when(d.id))}</b></a><br><span class="sub">${esc(d.summary.split('. ').slice(0, 2).join('. '))}</span></li>`).join('')
  send(200, `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Drives</title><style>${STYLE}</style><main><h1>Drives</h1><p class="sub">Recorded by the V60 iPhone app.</p><ul class="dr">${items || '<li>No drives yet.</li>'}</ul></main></html>`)
  return true
}
