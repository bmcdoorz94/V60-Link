#!/usr/bin/env node
// Claude live: an MCP channel (Claude Code research preview) that joins the Claude session on Kyle's PC to
// V60-Link on his phone. Claude Code starts this file (bridge/.mcp.json, server "v60"). It listens on
// 127.0.0.1:8788; `tailscale serve` publishes that inside Kyle's tailnet as https://<pc>.<tailnet>.ts.net.
// The phone opens wss://<pc>.<tailnet>.ts.net/link?code=<pairing code>.
//
// Wakes Claude only for: adapter connected / dropped, a message Kyle types, a saved health check.
// The raw adapter conversation goes to data/logs/<date>.jsonl, which Claude reads with car_log when it needs it.
// stdout belongs to MCP. Anything for a human goes to stderr.
import http from 'node:http'
import fs from 'node:fs'
import { WebSocketServer } from 'ws'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js'
import { z } from 'zod'
import { PORT, pairing, carWrite, describeReply, record, logFile, today } from './lib.js'

const say = (...a) => console.error('[v60]', ...a)
const ORIGINS = new Set(['https://bmcdoorz94.github.io', 'null', ...(process.env.V60_ORIGINS || '').split(',').filter(Boolean)])
const okOrigin = (o) => !o || ORIGINS.has(o) || /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(o)

const INSTRUCTIONS = [
  'You are Claude live: Kyle\'s electronic mechanic, sitting beside him while he is at his 2016 Volvo V60 T5. Read bridge/CLAUDE.md for the car, the module map and the rules.',
  'Events from his phone arrive as <channel source="v60" event="...">. event="adapter_on": his OBD adapter just connected in V60-Link. Say hello in one line with the reply tool and, unless he said otherwise earlier, run a quick read-only look (stored, pending and permanent codes, readiness, module voltage) and tell him what you see in plain words. event="adapter_off": the car was switched off (or the link dropped); the event carries this drive\'s numbers. Send Kyle a recap of at most three plain lines: what you checked and found this drive, anything he should act on and when, and anything that did not work. If nothing happened, one line. The phone may already be asleep; the reply is then delivered the next time it links. event="kyle": a message he typed; answer it with the reply tool. event="health_check": he ran the page\'s health check; the summary is in the event.',
  'Everything you want Kyle to read goes through the reply tool; he is at the car, not at this terminal. Keep replies short and plain. While the engine runs he may be driving: no questions that need a tap, nothing to read at length.',
  'car_send runs one ELM327/STN command through his adapter. Reads run at once. Anything that could change the car (clearing codes, UDS writes, routines, security access, resets, D2 writes) waits until Kyle taps Allow on his phone; give a plain reason in `why`. After changing headers or protocol (ATSH, ATCRA, ATSP, STP...) call car_restore when you are done so the page\'s own screens work again.',
  'Do not poll in loops. If you need to watch a value over time, ask Kyle to start Live data recording in the page and read it afterwards with car_log.',
].join('\n')

const mcp = new Server(
  { name: 'v60', version: '1.0.0' },
  { capabilities: { experimental: { 'claude/channel': {}, 'claude/channel/permission': {} }, tools: {} }, instructions: INSTRUCTIONS },
)

/* ---------------- phone side ---------------- */
const pair = pairing()
let phone = null // the one V60-Link page currently linked
const car = { adapter: null, connected: false, can: null, sim: false, since: null, page: null, lastSeen: null, announced: false }
const fresh = () => ({ cmds: 0, replies: 0, kyle: 0, bg: 0 })
let drive = fresh() // this drive's numbers, for the recap at adapter_off
const later = [] // Claude's messages the phone missed; delivered when it links again
const waiting = new Map() // id -> { resolve, timer }
let seq = 1
let offTimer = null

function toPhone(o) { if (phone && phone.readyState === 1) { phone.send(JSON.stringify(o)); return true } return false }
async function wake(event, content, meta = {}) {
  record({ k: 'event', event, content })
  await mcp.notification({ method: 'notifications/claude/channel', params: { content, meta: { event, ...meta } } }).catch(() => {})
}

function linkOn(m) {
  clearTimeout(offTimer); offTimer = null
  const wasOn = car.connected
  Object.assign(car, { adapter: m.adapter || car.adapter, connected: true, can: m.can, sim: !!m.sim, since: car.since && wasOn ? car.since : new Date().toISOString() })
  if (car.announced) return // a quick drop and reconnect (the CX does this while iOS pairs) is not news
  car.announced = true
  drive = fresh()
  wake('adapter_on', `Kyle's adapter connected in V60-Link: ${car.adapter || 'unknown adapter'}${car.sim ? ' (the page\'s simulated car, not the real V60)' : ''}${car.can === false ? ', non-CAN protocol' : ''}. ${new Date().toLocaleString()}.`, { adapter: String(car.adapter || '') })
}
// wait: how long the adapter must stay gone before Claude hears "adapter_off". 10 s after the phone says the adapter
// dropped; 3 min when only the phone's link to this PC dropped (in the background it blips every minute or two,
// e.g. while the phone changes networks), so a blip is not taken for the car being switched off.
function linkOff(wait = 10000) {
  car.connected = false
  clearTimeout(offTimer)
  offTimer = setTimeout(() => {
    offTimer = null
    if (car.connected || !car.announced) return
    car.announced = false
    const mins = car.since ? Math.round((Date.now() - Date.parse(car.since)) / 60000) : null
    wake('adapter_off', `The adapter disconnected (${car.adapter || 'adapter'})${mins !== null ? ` after ${mins} min connected` : ''}. This drive: you sent ${drive.cmds} adapter command(s) and ${drive.replies} message(s); Kyle wrote ${drive.kyle}; the iPhone app logged ${drive.bg} entr${drive.bg === 1 ? 'y' : 'ies'} while in the background. Phone linked now: ${phone ? 'yes' : 'no'}.`)
  }, wait)
}
function summarize(r) {
  if (!r) return 'empty report'
  const codes = (r.codes || []).map((c) => `${c.code} ${c.kind} (${c.ecu})`).join(', ') || 'none'
  const nr = (r.monitors || []).filter((m) => !m.ready).map((m) => m.n)
  return `Check-engine light ${r.mil ? 'ON' : 'off'}. Codes: ${codes}. Readiness: ${(r.monitors || []).length - nr.length}/${(r.monitors || []).length} ready${nr.length ? ' (not ready: ' + nr.join(', ') + ')' : ''}.${r.freeze ? ' Freeze frame from ' + r.freeze.dtc + ': ' + r.freeze.values.map((v) => v[0] + ' ' + v[1]).join(', ') + '.' : ''}${r.since && Object.keys(r.since).length ? ' Since codes were cleared: ' + JSON.stringify(r.since) + '.' : ''}`
}

function fromPhone(m) {
  switch (m.t) {
    case 'hello':
      car.page = m.page || null; car.lastSeen = new Date().toISOString()
      record({ k: 'hello', page: String(m.page || '').slice(0, 80), auto: !!m.auto, known: !!m.known, connected: !!m.connected })
      toPhone({ t: 'welcome' })
      while (later.length && toPhone({ t: 'msg', text: later[0] })) record({ k: 'delivered', text: later.shift() })
      if (m.connected) linkOn({ adapter: m.adapter, can: m.can }) // back within the grace: the same drive, no new hello
      else if (offTimer && car.announced) linkOff() // the phone is back but the adapter is not: say so in 10 s
      return
    case 'link':
      record({ k: 'link', ...m })
      return m.state === 'on' ? linkOn(m) : linkOff()
    case 'log':
      record({ k: 'log', d: m.d, x: m.x })
      return
    case 'auto': // Kyle switched "Connect by itself" on the phone; check.js reads it from the log
      record({ k: 'auto', auto: !!m.on, known: !!m.known })
      return
    case 'report':
      record({ k: 'report', r: m.r })
      return wake('health_check', summarize(m.r))
    case 'app': // the iPhone app's journal (ios/V60App/Journal.swift): what happened, and whether it was in the background
      record({ k: 'app', x: String(m.x || '').slice(0, 500) })
      if (/\[background\]/.test(String(m.x))) drive.bg++
      return
    case 'say':
      drive.kyle++
      record({ k: 'kyle', text: m.text })
      return wake('kyle', String(m.text || '').slice(0, 4000))
    case 'res': {
      const w = waiting.get(String(m.id)); if (!w) return
      waiting.delete(String(m.id)); clearTimeout(w.timer); w.resolve(m)
      return
    }
    case 'perm':
      if (!/^[a-km-z]{5}$/.test(String(m.id))) return
      record({ k: 'perm', id: m.id, allow: !!m.allow })
      mcp.notification({ method: 'notifications/claude/channel/permission', params: { request_id: String(m.id), behavior: m.allow ? 'allow' : 'deny' } }).catch(() => {})
      return
  }
}

function ask(o, ms) {
  return new Promise((resolve) => {
    const id = String(seq++)
    const timer = setTimeout(() => { waiting.delete(id); toPhone({ t: 'drop', id }); resolve({ ok: false, error: `No answer from the phone within ${Math.round(ms / 1000)} s.` }) }, ms)
    waiting.set(id, { resolve, timer })
    if (!toPhone({ ...o, id })) { clearTimeout(timer); waiting.delete(id); resolve({ ok: false, error: 'V60-Link is not linked right now (the page is closed, Bluefy is in the background, or Claude live is switched off on the phone).' }) }
  })
}

const httpServer = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.end(`Claude live (V60) is running. Phone linked: ${phone ? 'yes' : 'no'}. Adapter: ${car.connected ? car.adapter : 'not connected'}.\n`)
})
const wss = new WebSocketServer({ noServer: true, maxPayload: 1 << 20 })
httpServer.on('upgrade', (req, socket, head) => {
  const url = new URL(req.url, 'http://x')
  if (url.pathname !== '/link' || !okOrigin(req.headers.origin)) { socket.destroy(); return }
  wss.handleUpgrade(req, socket, head, (ws) => {
    if (url.searchParams.get('code') !== pair.code) { ws.close(4001, 'pairing code'); say('refused a phone with the wrong pairing code'); return }
    if (phone && phone !== ws) try { phone.close(4000, 'replaced') } catch {}
    phone = ws
    say('phone linked')
    record({ k: 'phone', state: 'on' })
    let alive = true
    const ping = setInterval(() => { if (!alive) { try { ws.terminate() } catch {} return } alive = false; try { ws.ping() } catch {} }, 25000)
    ws.on('pong', () => { alive = true })
    ws.on('message', (data) => { let m; try { m = JSON.parse(String(data)) } catch { return } try { fromPhone(m) } catch (e) { say('bad message', e.message) } })
    ws.on('close', () => {
      clearInterval(ping)
      if (phone !== ws) return
      phone = null; say('phone gone'); record({ k: 'phone', state: 'off' })
      for (const [id, w] of waiting) { clearTimeout(w.timer); w.resolve({ ok: false, error: 'The phone link closed before it answered.' }) }
      waiting.clear()
      if (car.connected) linkOff(180000)
    })
  })
})
function listen() {
  httpServer.once('error', (e) => { say(`port ${PORT} is busy (${e.code}); trying again in 10 s. Another Claude live window may be open.`); setTimeout(listen, 10000) })
  httpServer.listen(PORT, '127.0.0.1', () => say(`listening on 127.0.0.1:${PORT}; pairing code ${pair.code}`))
}

/* ---------------- Claude side ---------------- */
const TOOLS = [
  { name: 'reply', description: 'Show a message to Kyle in V60-Link on his phone. Everything meant for him goes here; he is at the car, not at this terminal.', inputSchema: { type: 'object', properties: { text: { type: 'string', description: 'Plain words, short.' } }, required: ['text'] } },
  { name: 'car_status', description: 'Whether V60-Link is linked, whether the adapter is connected, which adapter, since when.', inputSchema: { type: 'object', properties: {} } },
  { name: 'car_send', description: 'Send one ELM327/STN command through Kyle\'s adapter (examples: "0101", "03", "ATSH726", "22402A", "1902FF") and get the raw reply plus decoded frames. Reads run at once. Writes (clearing codes, UDS 2E/31/27/11/14, non-default sessions, D2 writes) wait for Kyle to tap Allow on the phone, up to 3 minutes.', inputSchema: { type: 'object', properties: { command: { type: 'string' }, why: { type: 'string', description: 'Shown to Kyle when the command needs his OK.' }, timeout_ms: { type: 'number', description: 'Adapter timeout, 500-30000. Default 4000.' } }, required: ['command'] } },
  { name: 'car_restore', description: 'Set the adapter back up the way V60-Link expects (warm start, headers on, auto protocol). Call after addressing other modules with ATSH/ATCRA/STP.', inputSchema: { type: 'object', properties: {} } },
  { name: 'car_log', description: 'Recent lines of the adapter conversation (everything the page and you sent and every reply), from today\'s log on this PC.', inputSchema: { type: 'object', properties: { lines: { type: 'number', description: 'How many, default 60, max 400.' }, match: { type: 'string', description: 'Only lines containing this text.' }, day: { type: 'string', description: 'YYYY-MM-DD, default today.' } } } },
]
mcp.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }))
const text = (t, isError) => ({ content: [{ type: 'text', text: t }], ...(isError ? { isError: true } : {}) })
mcp.setRequestHandler(CallToolRequestSchema, async (req) => {
  const a = req.params.arguments || {}
  switch (req.params.name) {
    case 'reply': {
      const t = String(a.text || '').trim(); if (!t) return text('Nothing to send.', true)
      record({ k: 'claude', text: t })
      drive.replies++
      if (toPhone({ t: 'msg', text: t })) return text('Shown on Kyle\'s phone.')
      later.push(t); if (later.length > 10) later.shift()
      return text('The phone is not linked right now (asleep or out of reach). Saved: it is delivered the next time the phone links. Do not repeat it.')
    }
    case 'car_status':
      return text(JSON.stringify({ phone_linked: !!phone, adapter_connected: car.connected, adapter: car.adapter, simulated: car.sim, can: car.can, connected_since: car.since, page: car.page, pending_answers: waiting.size }, null, 2))
    case 'car_send': {
      const c = String(a.command || '').trim()
      if (!c || c.length > 120 || /[\r\n]/.test(c)) return text('One command per call, no line breaks, up to 120 characters.', true)
      const write = carWrite(c)
      record({ k: 'cmd', c, write, why: a.why || '' })
      drive.cmds++
      const r = await ask({ t: 'cmd', c, write, why: String(a.why || ''), timeout: a.timeout_ms }, write ? 180000 : Math.min(Math.max(+a.timeout_ms || 4000, 500), 30000) + 10000)
      record({ k: 'res', c, ok: r.ok, raw: r.raw, error: r.error })
      if (!r.ok) return text(`${c}: ${r.error || 'failed'}`, true)
      const d = describeReply(r.raw)
      return text(`sent ${c}${write ? ' (Kyle allowed it)' : ''}\nraw: ${String(r.raw).replace(/\r/g, '\\r').trim()}${d ? '\n' + d : ''}`)
    }
    case 'car_restore': {
      const r = await ask({ t: 'restore' }, 30000)
      return r.ok ? text(r.raw || 'done') : text(r.error || 'failed', true)
    }
    case 'car_log': {
      const n = Math.min(Math.max(+a.lines || 60, 1), 400), day = /^\d{4}-\d{2}-\d{2}$/.test(a.day || '') ? a.day : today()
      let rows = []
      try { rows = fs.readFileSync(logFile(day), 'utf8').trim().split('\n').map((l) => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean) } catch { return text('No log for ' + day + '.') }
      let lines = rows.map((r) => r.k === 'log' ? `${r.at.slice(11, 23)} ${r.d} ${r.x}` : r.k === 'cmd' ? `${r.at.slice(11, 23)} [claude] ${r.c}` : r.k === 'event' ? `${r.at.slice(11, 23)} [event ${r.event}] ${r.content}` : r.k === 'kyle' ? `${r.at.slice(11, 23)} [kyle] ${r.text}` : r.k === 'claude' ? `${r.at.slice(11, 23)} [you] ${r.text}` : r.k === 'app' ? `${r.at.slice(11, 23)} [app] ${r.x}` : null).filter(Boolean)
      if (a.match) lines = lines.filter((l) => l.includes(String(a.match)))
      return text(lines.slice(-n).join('\n') || 'Nothing matched.')
    }
  }
  throw new Error('unknown tool: ' + req.params.name)
})

// Claude Code asks this channel to relay tool approvals; they show on the phone as Allow / No.
mcp.setNotificationHandler(z.object({ method: z.literal('notifications/claude/channel/permission_request'), params: z.object({ request_id: z.string(), tool_name: z.string(), description: z.string(), input_preview: z.string() }) }), async ({ params }) => {
  record({ k: 'perm_request', ...params })
  toPhone({ t: 'perm', id: params.request_id, tool: params.tool_name, desc: params.description, preview: params.input_preview })
})

await mcp.connect(new StdioServerTransport())
listen()
