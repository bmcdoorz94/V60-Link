// Shared pieces of Claude live: where files live, the pairing code, the write check and the ELM327 reply parser.
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

export const HERE = path.dirname(fileURLToPath(import.meta.url))
export const DATA = process.env.V60_DATA || path.join(HERE, 'data')
export const PORT = Number(process.env.V60_PORT || 8788)

export function ensureData() {
  fs.mkdirSync(path.join(DATA, 'logs'), { recursive: true })
}

// Six digits, made once and kept in data/pair.json (gitignored). Delete the file to make a new one.
export function pairing() {
  ensureData()
  const f = path.join(DATA, 'pair.json')
  try {
    const p = JSON.parse(fs.readFileSync(f, 'utf8'))
    if (/^\d{6}$/.test(p.code)) return p
  } catch {}
  const p = { code: String(crypto.randomInt(0, 1000000)).padStart(6, '0'), made: new Date().toISOString() }
  fs.writeFileSync(f, JSON.stringify(p, null, 2))
  return p
}

// Same rule as the phone (tools/gen/live_claude.js): adapter settings never reach the car; reads are OBD modes
// 01-0A except 04 (clear) and 08 (control), UDS 22 / 19 / 3E / default session, KWP reads and Volvo D2 reads.
// Anything else counts as a write and waits for Kyle's tap on the phone.
export function carWrite(c) {
  const s = String(c || '').toUpperCase().replace(/\s+/g, '')
  if (!s) return false
  if (/^STPX/.test(s)) { const m = s.match(/D:([0-9A-F]+)/); return m ? payloadWrite(m[1]) : true }
  if (/^(AT|ST)/.test(s)) return false
  if (!/^[0-9A-F]+$/.test(s) || s.length % 2) return true
  return payloadWrite(s)
}
function payloadWrite(h) {
  const b = (h.match(/../g) || []).map((x) => parseInt(x, 16)), sid = b[0]
  if (sid >= 0xc8 && sid <= 0xcf && b.length >= 3) return ![0xa3, 0xa5, 0xa6, 0xae, 0xb9].includes(b[2])
  if (sid === 0x10) return !(b[1] === 0x01 || b[1] === 0x81)
  return ![0x01, 0x02, 0x03, 0x05, 0x06, 0x07, 0x09, 0x0a, 0x12, 0x17, 0x18, 0x19, 0x1a, 0x21, 0x22, 0x3e].includes(sid)
}

// ELM327 reply (headers on) -> { frames: { '7E8': [[bytes...], ...] }, errors: [...] }, with ISO-TP multi-frame
// messages put back together. Same logic as the page's parseResponse.
const ERR = /NO DATA|UNABLE TO CONNECT|CAN ERROR|BUS ERROR|BUS BUSY|STOPPED|ERROR|FB ERROR|DATA ERROR|^\?$/i
export function parseReply(raw) {
  const lines = String(raw || '').split(/[\r\n]+/).map((l) => l.trim()).filter((l) => l && !/^(SEARCHING|BUS INIT|>|OK$)/i.test(l))
  const frames = {}, partial = {}, errors = []
  for (let l of lines) {
    if (ERR.test(l)) { errors.push(l); continue }
    l = l.replace(/^[0-9A-F]:\s*/i, '')
    const tok = l.split(/\s+/)
    let hdr, bytes
    if (/^[0-9A-F]{3}$/i.test(tok[0])) { hdr = tok[0].toUpperCase(); bytes = tok.slice(1) }
    else if (tok.length >= 5 && /^18$/i.test(tok[0]) && /^DA$/i.test(tok[1])) { hdr = tok.slice(0, 4).join('').toUpperCase(); bytes = tok.slice(4) }
    else if (/^[0-9A-F]{8}$/i.test(tok[0])) { hdr = tok[0].toUpperCase(); bytes = tok.slice(1) }
    else { hdr = 'ECU'; bytes = tok }
    bytes = bytes.filter((b) => /^[0-9A-F]{2}$/i.test(b)).map((b) => parseInt(b, 16))
    if (!bytes.length) continue
    if (hdr === 'ECU') { (frames[hdr] ||= []).push(bytes); continue }
    const type = bytes[0] >> 4
    if (type === 0) (frames[hdr] ||= []).push(bytes.slice(1, 1 + (bytes[0] & 15)))
    else if (type === 1) partial[hdr] = { len: ((bytes[0] & 15) << 8) | bytes[1], data: bytes.slice(2) }
    else if (type === 2 && partial[hdr]) {
      const p = partial[hdr]; p.data = p.data.concat(bytes.slice(1))
      if (p.data.length >= p.len) { (frames[hdr] ||= []).push(p.data.slice(0, p.len)); delete partial[hdr] }
    } else (frames[hdr] ||= []).push(bytes)
  }
  for (const h of Object.keys(partial)) (frames[h] ||= []).push(partial[h].data)
  return { frames, errors }
}

const hx = (n) => n.toString(16).toUpperCase().padStart(2, '0')
export function describeReply(raw) {
  const { frames, errors } = parseReply(raw)
  const out = []
  for (const [h, list] of Object.entries(frames)) for (const b of list) {
    let note = ''
    if (b[0] === 0x7f) note = `  (negative reply to ${hx(b[1])}: NRC ${hx(b[2])}${NRC[b[2]] ? ' ' + NRC[b[2]] : ''})`
    out.push(`${h}: ${b.map(hx).join(' ')}${note}`)
  }
  if (errors.length) out.push('adapter said: ' + errors.join(' | '))
  return out.join('\n')
}
const NRC = { 0x10: 'general reject', 0x11: 'service not supported', 0x12: 'sub-function not supported', 0x13: 'wrong length or format', 0x22: 'conditions not correct', 0x24: 'request sequence error', 0x31: 'request out of range', 0x33: 'security access denied', 0x35: 'invalid key', 0x36: 'too many attempts', 0x37: 'time delay not expired', 0x78: 'response pending', 0x7e: 'not supported in this session', 0x7f: 'service not supported in this session' }

export function today() { return new Date().toISOString().slice(0, 10) }
export function logFile(day = today()) { return path.join(DATA, 'logs', day + '.jsonl') }
export function record(o) {
  try { fs.appendFileSync(logFile(), JSON.stringify({ at: new Date().toISOString(), ...o }) + '\n') } catch {}
}

// The car tools Claude gets (hub.js runs them; server.js and tools.js list them).
export const TOOLS = [
  { name: 'reply', description: 'Show a message to Kyle in V60-Link on his phone. Everything meant for him goes here; he is at the car, not at this terminal.', inputSchema: { type: 'object', properties: { text: { type: 'string', description: 'Plain words, short.' }, url: { type: 'string', description: 'Optional https link (a drive report page) that opens when Kyle taps the notification.' } }, required: ['text'] } },
  { name: 'car_status', description: 'Whether V60-Link is linked, whether the adapter is connected, which adapter, since when.', inputSchema: { type: 'object', properties: {} } },
  { name: 'car_send', description: 'Send one ELM327/STN command through Kyle\'s adapter (examples: "0101", "03", "ATSH726", "22402A", "1902FF") and get the raw reply plus decoded frames. Reads run at once. Writes (clearing codes, UDS 2E/31/27/11/14, non-default sessions, D2 writes) wait for Kyle to tap Allow on the phone, up to 3 minutes.', inputSchema: { type: 'object', properties: { command: { type: 'string' }, why: { type: 'string', description: 'Shown to Kyle when the command needs his OK.' }, timeout_ms: { type: 'number', description: 'Adapter timeout, 500-30000. Default 4000.' } }, required: ['command'] } },
  { name: 'car_restore', description: 'Set the adapter back up the way V60-Link expects (warm start, headers on, auto protocol). Call after addressing other modules with ATSH/ATCRA/STP.', inputSchema: { type: 'object', properties: {} } },
  { name: 'car_log', description: 'Recent lines of the adapter conversation (everything the page and you sent and every reply), from today\'s log on this PC.', inputSchema: { type: 'object', properties: { lines: { type: 'number', description: 'How many, default 60, max 400.' }, match: { type: 'string', description: 'Only lines containing this text.' }, day: { type: 'string', description: 'YYYY-MM-DD, default today.' } } } },
]
