#!/usr/bin/env node
// Claude live, always on (since 2026-11-27): no window, no keypress, no /mcp. run.js keeps this running from Windows
// sign-in. The phone side is hub.js. When an event needs Claude (the car started or stopped, a drive report, a deep
// scan, an alert, a message from Kyle), this runs Claude Code headless:
//   claude -p --resume <today's session> --mcp-config data/tools-mcp.json --permission-mode dontAsk --allowedTools ...
// with the event on stdin. Claude answers Kyle with the reply tool (tools.js -> POST /api/tool here). One run at a
// time; events that arrive meanwhile go together into the next run. A new conversation starts each day; Claude's
// notebook data/notes/car.md carries what it learned across days.
// Env: V60_CLAUDE (path to claude), V60_NO_CLAUDE=1 (record events, run nothing: for tests).
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { spawn } from 'node:child_process'
import { DATA, HERE, PORT, record, today } from './lib.js'
import { startHub, INSTRUCTIONS, say } from './hub.js'

const CLAUDE = process.env.V60_CLAUDE || (fs.existsSync(path.join(process.env.USERPROFILE || '', '.local', 'bin', 'claude.exe')) ? path.join(process.env.USERPROFILE, '.local', 'bin', 'claude.exe') : 'claude')
const NOTES = path.join(DATA, 'notes')
const SESSION = path.join(DATA, 'claude-session.json')
fs.mkdirSync(NOTES, { recursive: true })

// The local tool API's secret: tools.js gets it from the MCP config. The same port is published on Kyle's tailnet,
// so /api/tool refuses anything without it.
const TOKEN = (() => {
  const f = path.join(DATA, 'api-token')
  try { const t = fs.readFileSync(f, 'utf8').trim(); if (t.length >= 32) return t } catch {}
  const t = crypto.randomBytes(24).toString('hex'); fs.writeFileSync(f, t); return t
})()
const MCPCFG = path.join(DATA, 'tools-mcp.json')
fs.writeFileSync(MCPCFG, JSON.stringify({ mcpServers: { v60: { command: process.execPath, args: [path.join(HERE, 'tools.js')], env: { V60_API: `http://127.0.0.1:${PORT}`, V60_API_TOKEN: TOKEN } } } }, null, 2))

const HEADLESS = [
  INSTRUCTIONS,
  'You run headless: the Claude live service on this PC starts you once per event (several events may come together) and resumes today\'s conversation, so earlier events today are above. Nobody reads your final text: anything for Kyle goes through the reply tool, or it is lost. When an event needs nothing, send nothing.',
  'Your notebook is bridge/data/notes/car.md (you may write only inside bridge/data/notes/). Keep it short and current: open problems and what the evidence says, what this car answers to (modules, data items, quirks), what Kyle asked you to remember, and what you plan to check next. On the first event of a new conversation, read it first; update it when you learn something that matters later.',
  'Tools: the v60 car tools, Read/Glob/Grep for this repository and bridge/data (drive reports, deep scans, logs), WebSearch/WebFetch for sources. Nothing else is allowed. Never write to the car without Kyle\'s tap (car_send enforces it).',
].join('\n')
const ALLOWED = ['mcp__v60__reply', 'mcp__v60__car_status', 'mcp__v60__car_send', 'mcp__v60__car_restore', 'mcp__v60__car_log',
  'Read', 'Glob', 'Grep', 'WebSearch', 'WebFetch', 'Write(data/notes/**)', 'Edit(data/notes/**)']

function session() {
  try { const s = JSON.parse(fs.readFileSync(SESSION, 'utf8')); if (s.day === today() && s.id) return s.id } catch {}
  return null
}
function runClaude(prompt) {
  return new Promise((resolve) => {
    const sid = session()
    const args = ['-p', '--output-format', 'json', '--mcp-config', MCPCFG, '--strict-mcp-config', '--permission-mode', 'dontAsk',
      '--allowedTools', ALLOWED.join(','), '--append-system-prompt', HEADLESS, ...(sid ? ['--resume', sid] : [])]
    const t0 = Date.now()
    const p = spawn(CLAUDE, args, { cwd: HERE, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] })
    let out = '', err = ''
    p.stdout.on('data', (d) => { out += d })
    p.stderr.on('data', (d) => { err += d })
    const kill = setTimeout(() => { say('Claude run took over 15 min; stopping it'); p.kill() }, 15 * 60000)
    p.on('error', (e) => { clearTimeout(kill); record({ k: 'claude_run', ok: false, error: e.message }); resolve(null) })
    p.on('close', (code) => {
      clearTimeout(kill)
      let j = null; try { j = JSON.parse(out) } catch {}
      if (j && j.session_id) fs.writeFileSync(SESSION, JSON.stringify({ day: today(), id: j.session_id }))
      const ok = code === 0 && j && !j.is_error
      record({ k: 'claude_run', ok, code, secs: Math.round((Date.now() - t0) / 1000), resumed: !!sid, session: j && j.session_id, turns: j && j.num_turns, cost: j && j.total_cost_usd, error: ok ? undefined : (j && j.result) || err.slice(-500) })
      // a resumed conversation that no longer exists: start a new one next time
      if (!ok && sid && /session|conversation/i.test(err + (j && j.result || ''))) try { fs.rmSync(SESSION) } catch {}
      resolve(j)
    })
    p.stdin.end(prompt)
  })
}

const queue = []
let busy = false
async function pump() {
  if (busy || !queue.length) return
  busy = true
  const batch = queue.splice(0)
  const first = !session()
  const prompt = (first ? `New conversation (${today()}). Read bridge/data/notes/car.md first if it exists.\n` : '') +
    batch.map((e) => `<channel source="v60" event="${e.event}" at="${e.at}">\n${e.content}\n</channel>`).join('\n')
  if (process.env.V60_NO_CLAUDE) record({ k: 'claude_run', ok: true, skipped: true, events: batch.map((e) => e.event) })
  else await runClaude(prompt)
  busy = false
  pump()
}
async function wake(event, content) {
  const at = new Date().toLocaleString()
  // the car just started: read the basics first (auto.js), so Claude starts with them and the Garage's feed has them
  if (event === 'adapter_on' && !/simulated car/.test(content)) {
    try {
      const { onStart } = await import(new URL('./auto.js', import.meta.url).href + '?v=' + fs.statSync(new URL('./auto.js', import.meta.url)).mtimeMs)
      const got = await Promise.race([onStart(hub.callTool, (s) => say('auto:', s)), new Promise((r) => setTimeout(() => r(null), 60000))])
      if (got) { content += '\n' + got; record({ k: 'carread', ok: true }) }
    } catch (e) { say('scripted reads failed:', e.message); record({ k: 'carread', ok: false, error: e.message }) }
  }
  queue.push({ event, content, at })
  // a moment for events that arrive together (adapter_off and its drive report) to share one run
  setTimeout(pump, 1500)
}

async function route(req, res) {
  const u = new URL(req.url, 'http://x')
  if (u.pathname !== '/api/tool') return false
  if (req.method !== 'POST' || req.headers['x-v60-token'] !== TOKEN) { res.writeHead(403); res.end('no'); return true }
  let body = ''
  for await (const c of req) { body += c; if (body.length > 65536) { res.writeHead(413); res.end(); return true } }
  let j; try { j = JSON.parse(body) } catch { res.writeHead(400); res.end(); return true }
  const r = await hub.callTool(String(j.name || ''), j.args || {})
  res.writeHead(200, { 'content-type': 'application/json' })
  res.end(JSON.stringify(r))
  return true
}

const hub = startHub({ wake, route })
record({ k: 'service', state: 'start', pid: process.pid })
say(`service started (pid ${process.pid}); Claude: ${process.env.V60_NO_CLAUDE ? 'off (test)' : CLAUDE}`)

// Weekly recommendations (bridge/CLAUDE.md, "Recommendations"): every 6 hours, if Claude's list is missing or over a
// week old, ask for a fresh review. Kyle can also ask from the Garage (POST /drives/review in drives.js).
const RECO = path.join(NOTES, 'recommendations.json')
function reviewDue() {
  if (process.env.V60_NO_CLAUDE) return
  let age = Infinity
  try { age = Date.now() - fs.statSync(RECO).mtimeMs } catch {}
  if (age < 7 * 864e5) return
  record({ k: 'event', event: 'review', content: 'weekly' })
  wake('review', `Weekly review: the recommendations are ${age === Infinity ? 'missing' : Math.round(age / 864e5) + ' days old'}. Follow "Recommendations" in bridge/CLAUDE.md. No reply to Kyle unless something is urgent.`)
}
setTimeout(reviewDue, 5 * 60000)
setInterval(reviewDue, 6 * 3600000)
