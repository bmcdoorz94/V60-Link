// Scripted reads when the car starts (service.js runs this on adapter_on, before waking Claude, and adds the result
// to Claude's event). Read-only standard OBD-II (SAE J1979) requests through the phone's adapter:
//   supported data items (01 00/20/40/...; once a day), odometer (01 A6, only if the car lists it), MIL and code count
//   (01 01), distance with the MIL on (01 21), distance since codes cleared (01 31), stored / pending / permanent
//   codes (03 / 07 / 0A). Saved to data/car.json for the Garage's feed (drives.js summary.json) and Claude.
import fs from 'node:fs'
import path from 'node:path'
import { DATA, today } from './lib.js'

export const CAR = path.join(DATA, 'car.json')
const KM = 0.621371

// ISO-TP: join the frames each module sent (headers on, e.g. "7E8 10 0A 43 ..." "7E8 21 ...") into payload bytes
export function payloads(raw) {
  const by = {}
  for (const line of String(raw || '').split(/[\r\n]+/)) {
    const t = line.trim().split(/\s+/)
    if (t.length < 3 || !/^[0-9A-F]{3}$/i.test(t[0])) continue
    const h = t[0].toUpperCase(), b = t.slice(1).map((x) => parseInt(x, 16)).filter((x) => !Number.isNaN(x))
    const pci = b[0] >> 4
    if (pci === 0) by[h] = { want: b[0] & 15, bytes: b.slice(1, 1 + (b[0] & 15)) }
    else if (pci === 1) by[h] = { want: ((b[0] & 15) << 8) | b[1], bytes: b.slice(2) }
    else if (pci === 2 && by[h]) by[h].bytes.push(...b.slice(1))
  }
  const out = {}
  for (const [h, v] of Object.entries(by)) out[h] = v.bytes.slice(0, v.want)
  return out
}
const engine = (raw) => { const p = payloads(raw); return p['7E8'] || Object.values(p)[0] || null }

export function dtcs(bytes, svc) {
  if (!bytes || bytes[0] !== svc) return null
  const list = [], b = bytes.slice(2) // CAN: service, count, then two bytes per code
  for (let i = 0; i + 1 < b.length; i += 2) {
    const a = b[i], c = b[i + 1]
    if (!a && !c) continue
    list.push('PCBU'[a >> 6] + ((a >> 4) & 3) + (a & 15).toString(16).toUpperCase() + c.toString(16).toUpperCase().padStart(2, '0'))
  }
  return list
}

function load() { try { return JSON.parse(fs.readFileSync(CAR, 'utf8')) } catch { return {} } }

// call(name, args) is the hub's callTool. Returns a plain summary for Claude.
export async function onStart(call, log = () => {}) {
  const car = load()
  const send = async (c) => {
    const r = await call('car_send', { command: c, timeout_ms: 3000 })
    if (r.isError) { log(`${c}: ${r.text}`); return null }
    const m = r.text.match(/raw: ([\s\S]*?)(\n|$)/)
    return m ? m[1].replace(/\\r/g, '\r') : null
  }
  // supported data items, once a day
  if (!car.pids || car.pids.day !== today()) {
    const list = []
    for (let base = 0; base <= 0xC0; base += 0x20) {
      const p = engine(await send('01' + base.toString(16).toUpperCase().padStart(2, '0')))
      if (!p || p[0] !== 0x41 || p[1] !== base) break
      const bits = (p[2] << 24 | p[3] << 16 | p[4] << 8 | p[5]) >>> 0
      for (let i = 0; i < 32; i++) if (bits & (2 ** (31 - i))) list.push((base + i + 1).toString(16).toUpperCase().padStart(2, '0'))
      if (!(bits & 1)) break
    }
    if (list.length) car.pids = { day: today(), list }
  }
  const has = (pid) => car.pids && car.pids.list.includes(pid)
  const now = new Date().toISOString()
  const r = { at: now }
  if (has('A6')) {
    const p = engine(await send('01A6'))
    if (p && p[0] === 0x41 && p[1] === 0xA6) { const km = ((p[2] * 2 ** 24) + (p[3] << 16) + (p[4] << 8) + p[5]) / 10; car.odometer = { km, miles: Math.round(km * KM), at: now } }
  }
  let p = engine(await send('0101'))
  if (p && p[0] === 0x41 && p[1] === 0x01) { r.mil = !!(p[2] & 0x80); r.dtcCount = p[2] & 0x7F }
  if (has('21')) { p = engine(await send('0121')); if (p && p[1] === 0x21) r.milMiles = Math.round(((p[2] << 8) | p[3]) * KM) }
  if (has('31')) { p = engine(await send('0131')); if (p && p[1] === 0x31) r.clearedMiles = Math.round(((p[2] << 8) | p[3]) * KM) }
  r.codes = {}
  for (const [svc, kind] of [['03', 'stored'], ['07', 'pending'], ['0A', 'permanent']]) {
    const raw = await send(svc)
    if (raw == null) continue
    if (/NO DATA/.test(raw)) { r.codes[kind] = []; continue }
    const all = new Set()
    for (const pl of Object.values(payloads(raw))) for (const c of dtcs(pl, parseInt(svc, 16) + 0x40) || []) all.add(c)
    r.codes[kind] = [...all]
  }
  car.latest = r
  fs.writeFileSync(CAR, JSON.stringify(car, null, 2))
  const codes = Object.entries(r.codes).map(([k, v]) => `${k}: ${v.length ? v.join(' ') : 'none'}`).join('; ')
  return [
    `Read by the service just now (read-only, standard OBD-II): check-engine light ${r.mil == null ? 'unknown' : r.mil ? 'ON' : 'off'}${r.dtcCount != null ? `, ${r.dtcCount} code(s) counted` : ''}. Codes: ${codes || 'not read'}.`,
    r.milMiles != null ? `Driven with the light on: ${r.milMiles} mi.` : '',
    r.clearedMiles != null ? `Since codes were last cleared: ${r.clearedMiles} mi.` : '',
    car.odometer && car.odometer.at === now ? `Odometer from the car: ${car.odometer.miles} mi.` : has('A6') ? '' : 'This car does not list the odometer data item (01 A6); mileage comes from recorded drives.',
    car.pids ? `Supported mode 01 data items: ${car.pids.list.join(' ')}.` : '',
  ].filter(Boolean).join(' ')
}
