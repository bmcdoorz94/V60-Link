// The phone side of Claude live, shared by server.js (the Claude Code channel window) and service.js (the always-on
// service that runs Claude headless). It listens on 127.0.0.1:<PORT>; `tailscale serve` publishes that inside Kyle's
// tailnet as https://<pc>.<tailnet>.ts.net, and the phone opens wss://<pc>.<tailnet>.ts.net/link?code=<pairing code>.
// It owns the link to V60-Link / the iPhone app, the drive reports (drives.js, reloaded on change) and the car tools
// (reply, car_status, car_send, car_restore, car_log). What wakes Claude is the caller's `wake(event, content)`.
import http from 'node:http'
import fs from 'node:fs'
import { execFileSync } from 'node:child_process'
import { WebSocketServer } from 'ws'
import { PORT, pairing, carWrite, describeReply, record, logFile, today, TOOLS } from './lib.js'
export { TOOLS }

export const say = (...a) => console.error('[v60]', ...a)
const ORIGINS = new Set(['https://bmcdoorz94.github.io', 'null', ...(process.env.V60_ORIGINS || '').split(',').filter(Boolean)])
const okOrigin = (o) => !o || ORIGINS.has(o) || /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(o)

// This PC's address on Kyle's tailnet, for report links.
export const REPORTS = (() => {
  try {
    const st = JSON.parse(execFileSync(process.platform === 'win32' ? 'tailscale.exe' : 'tailscale', ['status', '--json'], { encoding: 'utf8', timeout: 15000 }))
    const h = (st.Self.DNSName || '').replace(/\.$/, '')
    return h ? 'https://' + h : 'https://<this PC>'
  } catch { return 'https://<this PC>' }
})()

export const INSTRUCTIONS = [
  'You are Claude live: Kyle\'s electronic mechanic, sitting beside him while he is at his 2016 Volvo V60 T5. Read bridge/CLAUDE.md for the car, the module map and the rules.',
  'Events from his phone arrive as <channel source="v60" event="...">. event="adapter_on": his OBD adapter just connected in V60-Link. Say hello in one line with the reply tool and, unless he said otherwise earlier, run a quick read-only look (stored, pending and permanent codes, readiness, module voltage) and tell him what you see in plain words. event="adapter_off": the car was switched off (or the link dropped); the event carries this drive\'s numbers. Send Kyle a recap of at most three plain lines: what you checked and found this drive, anything he should act on and when, and anything that did not work. If nothing happened, one line. When the event includes the app\'s drive recording (fuel trims at warm idle and cruise, temperatures, voltage, distance with the light on), read it against his open codes (P0171 lean) in plain words, say what it suggests and how sure you are, and pass the report page as `url` to reply so he can tap it. The phone may already be asleep; the reply is then delivered the next time it links. event="drive_report": an earlier drive\'s recording arrived late; send one short reply with the url. event="kyle": a message he typed; answer it with the reply tool. event="health_check": he ran the page\'s health check; the summary is in the event.',
  'Everything you want Kyle to read goes through the reply tool; he is at the car, not at this terminal. Keep replies short and plain. While the engine runs he may be driving: no questions that need a tap, nothing to read at length.',
  'car_send runs one ELM327/STN command through his adapter. Reads run at once. Anything that could change the car (clearing codes, UDS writes, routines, security access, resets, D2 writes) waits until Kyle taps Allow on his phone; give a plain reason in `why`. After changing headers or protocol (ATSH, ATCRA, ATSP, STP...) call car_restore when you are done so the page\'s own screens work again.',
  'Do not poll in loops. If you need to watch a value over time, ask Kyle to start Live data recording in the page and read it afterwards with car_log.',
  'event="alert": the iPhone app saw something while driving (coolant hot, charging voltage off, a new code or the check-engine light) and already showed Kyle its own notification. If you can add something useful, one short line with the reply tool, no questions; he is probably driving.',
  `Report pages on this PC (Kyle's own devices only): ${REPORTS}/drives (all drives), ${REPORTS}/drives/week (this week), ${REPORTS}/drives/trends (across drives). On the first adapter_off of a new week (Monday or later, if you have not sent one since), add the week link as the url instead of the drive's when nothing on the drive itself needs his attention.`,
].join('\n')


// opts.wake(event, content, meta): how Claude hears about an event (the caller records nothing; this file does).
// opts.route(req, res): optional extra HTTP handler, tried after drives.js (service.js's local tool API).
// opts.onPerm(id, allow): Kyle answered a tool-approval question on the phone (server.js relays it to Claude Code).
export function startHub(opts) {
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
  function wake(event, content, meta = {}) {
    record({ k: 'event', event, content })
    Promise.resolve().then(() => opts.wake(event, content, meta)).catch((e) => say('wake failed:', e.message))
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
  let offText = '', offWait = null, report = null // report: the newest drive report not yet given to Claude
  function linkOff(wait = 10000) {
    car.connected = false
    clearTimeout(offTimer)
    offTimer = setTimeout(() => {
      offTimer = null
      if (car.connected || !car.announced) return
      car.announced = false
      const mins = car.since ? Math.round((Date.now() - Date.parse(car.since)) / 60000) : null
      offText = `The adapter disconnected (${car.adapter || 'adapter'})${mins !== null ? ` after ${mins} min connected` : ''}. This drive: you sent ${drive.cmds} adapter command(s) and ${drive.replies} message(s); Kyle wrote ${drive.kyle}; the iPhone app logged ${drive.bg} entr${drive.bg === 1 ? 'y' : 'ies'} while in the background. Phone linked now: ${phone ? 'yes' : 'no'}.`
      // The iPhone app uploads the drive's recording right after the adapter drops; wait up to 90 s so the recap
      // can use it (a report that arrives later comes as its own drive_report event).
      if (report && Date.now() - report.at < 180000) return fireOff()
      if (/iPhone app/.test(car.page || '')) { offWait = setTimeout(fireOff, 90000); return }
      fireOff()
    }, wait)
  }
  function fireOff() {
    clearTimeout(offWait); offWait = null
    const r = report && Date.now() - report.at < 180000 ? report : null
    report = null
    wake('adapter_off', offText + (r ? ` The app recorded the drive. ${r.summary} Report page: ${r.url} (pass it as url to reply so Kyle can tap it).` : ' No drive recording arrived from the app.'))
  }
  function reportReady(r) {
    report = { ...r, at: Date.now() }
    if (offWait) return fireOff() // adapter_off was waiting for it
    if (offTimer) return // the adapter just dropped: adapter_off picks it up in a moment
    report = null // an earlier drive, uploaded late (for example at the start of the next one)
    wake('drive_report', `The iPhone app uploaded an earlier drive (${r.id}). ${r.summary} Report page: ${r.url}`)
  }
  /* drives.js is loaded fresh whenever it changes, so report changes need no restart */
  async function drives() {
    const f = new URL('./drives.js', import.meta.url)
    return import(f.href + '?v=' + fs.statSync(f).mtimeMs)
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
        while (later.length && toPhone({ t: 'msg', text: later[0].text, url: later[0].url })) record({ k: 'delivered', text: later.shift().text })
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
      case 'drive': case 'driveEnd': // a drive recording from the iPhone app, in parts (bridge/drives.js)
        drives().then((d) => { const r = d.onMessage(m, { toPhone, record }); if (r) reportReady(r) }).catch((e) => say('drive upload failed:', e.message))
        return
      case 'alert': { // the iPhone app's own alert while driving (it already notified Kyle)
        const t = String(m.text || '').slice(0, 300)
        record({ k: 'alert', kind: String(m.kind || ''), text: t })
        return wake('alert', `The iPhone app raised an alert while driving: ${t}`)
      }
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
        if (opts.onPerm) opts.onPerm(String(m.id), !!m.allow)
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

  const httpServer = http.createServer(async (req, res) => {
    // ctx lets drives.js (reloaded on change) wake Claude and reach the phone without a restart
    try { if (await (await drives()).route(req, res, { wake, toPhone, record })) return } catch (e) { say('drive page failed:', e.message) }
    try { if (opts.route && await opts.route(req, res)) return } catch (e) { say('route failed:', e.message); if (!res.headersSent) { res.writeHead(500); res.end('error') } return }
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
        for (const [, w] of waiting) { clearTimeout(w.timer); w.resolve({ ok: false, error: 'The phone link closed before it answered.' }) }
        waiting.clear()
        if (car.connected) linkOff(180000)
      })
    })
  })
  function listen() {
    httpServer.once('error', (e) => { say(`port ${PORT} is busy (${e.code}); trying again in 10 s. Another Claude live may be running.`); setTimeout(listen, 10000) })
    httpServer.listen(PORT, '127.0.0.1', () => say(`listening on 127.0.0.1:${PORT}; pairing code ${pair.code}`))
  }

  // The car tools. Returns { text, isError }.
  async function callTool(name, a = {}) {
    const out = (text, isError = false) => ({ text, isError })
    switch (name) {
      case 'reply': {
        const t = String(a.text || '').trim(); if (!t) return out('Nothing to send.', true)
        const url = /^https:\/\/\S+$/.test(String(a.url || '')) ? String(a.url) : undefined
        record({ k: 'claude', text: t, ...(url ? { url } : {}) })
        drive.replies++
        if (toPhone({ t: 'msg', text: t, url })) return out('Shown on Kyle\'s phone.')
        later.push({ text: t, url }); if (later.length > 10) later.shift()
        return out('The phone is not linked right now (asleep or out of reach). Saved: it is delivered the next time the phone links. Do not repeat it.')
      }
      case 'car_status':
        return out(JSON.stringify({ phone_linked: !!phone, adapter_connected: car.connected, adapter: car.adapter, simulated: car.sim, can: car.can, connected_since: car.since, page: car.page, pending_answers: waiting.size }, null, 2))
      case 'car_send': {
        const c = String(a.command || '').trim()
        if (!c || c.length > 120 || /[\r\n]/.test(c)) return out('One command per call, no line breaks, up to 120 characters.', true)
        const write = carWrite(c)
        record({ k: 'cmd', c, write, why: a.why || '' })
        drive.cmds++
        const r = await ask({ t: 'cmd', c, write, why: String(a.why || ''), timeout: a.timeout_ms }, write ? 180000 : Math.min(Math.max(+a.timeout_ms || 4000, 500), 30000) + 10000)
        record({ k: 'res', c, ok: r.ok, raw: r.raw, error: r.error })
        if (!r.ok) return out(`${c}: ${r.error || 'failed'}`, true)
        const d = describeReply(r.raw)
        return out(`sent ${c}${write ? ' (Kyle allowed it)' : ''}\nraw: ${String(r.raw).replace(/\r/g, '\\r').trim()}${d ? '\n' + d : ''}`)
      }
      case 'car_restore': {
        const r = await ask({ t: 'restore' }, 30000)
        return r.ok ? out(r.raw || 'done') : out(r.error || 'failed', true)
      }
      case 'car_log': {
        const n = Math.min(Math.max(+a.lines || 60, 1), 400), day = /^\d{4}-\d{2}-\d{2}$/.test(a.day || '') ? a.day : today()
        let rows = []
        try { rows = fs.readFileSync(logFile(day), 'utf8').trim().split('\n').map((l) => { try { return JSON.parse(l) } catch { return null } }).filter(Boolean) } catch { return out('No log for ' + day + '.') }
        let lines = rows.map((r) => r.k === 'log' ? `${r.at.slice(11, 23)} ${r.d} ${r.x}` : r.k === 'cmd' ? `${r.at.slice(11, 23)} [claude] ${r.c}` : r.k === 'event' ? `${r.at.slice(11, 23)} [event ${r.event}] ${r.content}` : r.k === 'kyle' ? `${r.at.slice(11, 23)} [kyle] ${r.text}` : r.k === 'claude' ? `${r.at.slice(11, 23)} [you] ${r.text}` : r.k === 'app' ? `${r.at.slice(11, 23)} [app] ${r.x}` : null).filter(Boolean)
        if (a.match) lines = lines.filter((l) => l.includes(String(a.match)))
        return out(lines.slice(-n).join('\n') || 'Nothing matched.')
      }
    }
    return out('unknown tool: ' + name, true)
  }

  listen()
  return { callTool, toPhone, car, phoneLinked: () => !!phone, close: () => httpServer.close() }
}
