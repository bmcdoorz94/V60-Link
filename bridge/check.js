// Is Claude live working? Checks each link in the chain, then tells the story of recent activity from the log.
// Read-only: it changes nothing (no pairing code, no Tailscale settings, nothing sent to the car).
// Run: `node check.js` in bridge/, or double-click check.cmd. Options: --hours N (activity window, default 12),
// --html (also write data/check.html, a colour page of the same results, and open it; what check.cmd does).
// Exit code 1 if a link the phone needs is broken, so a Claude session can run it as a test.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { PORT, DATA } from './lib.js'

const args = process.argv.slice(2)
const printed = [] // everything printed, for the --html page
const print = console.log
console.log = (...a) => { const t = a.join(' '); printed.push(...t.split(/\r?\n/)); print(t) }
const hours = Math.max(1, Number(args[args.indexOf('--hours') + 1]) || 12)
const ts = process.platform === 'win32' ? 'tailscale.exe' : 'tailscale'
const run = (cmd, a) => { try { return execFileSync(cmd, a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 20000 }) } catch { return null } }
const get = async (url) => { try { const r = await fetch(url, { signal: AbortSignal.timeout(8000) }); return { ok: r.ok, text: (await r.text()).trim() } } catch (e) { return { ok: false, text: e.cause?.code || e.message } } }

let broken = 0
const line = (mark, what, detail = '') => console.log(`  ${mark} ${what}${detail ? '\n        ' + detail : ''}`)
const ok = (what, detail) => line('[ok]', what, detail)
const bad = (what, fix) => { broken++; line('[!!]', what, fix) }
const note = (what, detail) => line('[--]', what, detail)

console.log('\n  Claude live check  ' + new Date().toLocaleString() + '\n')

// 1. Tailscale on this PC
console.log('  This PC')
let st = null
try { st = JSON.parse(run(ts, ['status', '--json']) || 'null') } catch {}
const host = st?.Self?.DNSName?.replace(/\.$/, '') || null
if (st?.BackendState === 'Running' && host) ok('Tailscale is on and signed in', host)
else bad('Tailscale is off or signed out on this PC', 'Open Tailscale from the system tray and sign in.')
if (st?.CertDomains?.length) ok('HTTPS certificates are on for your tailnet')
else if (st) bad('HTTPS certificates are off', 'Tailscale admin console > DNS > Enable HTTPS.')
const served = run(ts, ['serve', 'status']) || ''
if (served.includes(':' + PORT)) ok('Tailscale publishes the bridge (your devices only)')
else bad('Tailscale is not publishing the bridge', `Run: tailscale serve --bg ${PORT}`)

// 2. Claude live's always-on service (run.js keeping service.js running; since 2026-11-27), or the older window
let procs = []
if (process.platform === 'win32') {
  const out = run('powershell', ['-NoProfile', '-Command', "Get-CimInstance Win32_Process -Filter \"name='claude.exe' or name='node.exe'\" | ForEach-Object { $_.ProcessId.ToString() + '|' + $_.ParentProcessId + '|' + $_.Name + '|' + $_.CommandLine }"]) || ''
  procs = out.split(/\r?\n/).filter(Boolean).map((l) => { const [pid, ppid, name, ...cmd] = l.split('|'); return { pid, ppid, name, cmd: cmd.join('|') } })
}
const supervisor = procs.find((p) => p.name === 'node.exe' && /run\.js"?\s*$/.test(p.cmd))
const serviceProc = procs.find((p) => p.name === 'node.exe' && /service\.js"?\s*$/.test(p.cmd))
const liveClaude = procs.find((p) => p.name === 'claude.exe' && p.cmd.includes('development-channels') && p.cmd.includes('server:v60'))
if (process.platform !== 'win32') note('Process check skipped (not Windows)')
else if (supervisor && serviceProc) ok('Claude live is running in the background (no window needed)', 'It starts Claude by itself for each event and restarts itself after updates.')
else if (supervisor) bad('Claude live is starting or keeps stopping', 'See bridge/data/service.log for why.')
else if (liveClaude) note('Claude live is running in the older window instead of the background service', 'Close that window, then double-click "Claude live" on the desktop.')
else bad('Claude live is not running', 'Double-click "Claude live" on the desktop (it starts in the background, no window).')

// Always ready when he starts driving: starts at sign-in, and the PC does not sleep while plugged in
if (process.platform === 'win32') {
  const startup = path.join(process.env.APPDATA || '', 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup', 'Claude live.lnk')
  const target = fs.existsSync(startup) ? run('powershell', ['-NoProfile', '-Command', `(New-Object -ComObject WScript.Shell).CreateShortcut('${startup.replace(/'/g, "''")}').Arguments`]) || '' : ''
  if (/start-service\.vbs/.test(target)) ok('Claude live starts by itself when you sign in to Windows', 'Nothing to press.')
  else if (fs.existsSync(startup)) bad('Claude live starts the older window at sign-in', 'Point the Startup shortcut at bridge\\start-service.vbs (SETUP.md).')
  else note('Claude live does not start at sign-in', 'Copy the "Claude live" desktop shortcut into the folder that Win+R, shell:startup opens.')
  const ac = (sub) => { const m = (run('powercfg', ['/query', 'SCHEME_CURRENT', 'SUB_SLEEP', sub]) || '').match(/Current AC Power Setting Index:\s*0x([0-9a-f]+)/i); return m ? parseInt(m[1], 16) : null }
  const sleep = ac('STANDBYIDLE'), hib = ac('HIBERNATEIDLE')
  if (sleep === 0 && hib === 0) ok('This PC never sleeps while plugged in')
  else if (sleep === null) note('Could not read the sleep setting')
  else bad(`This PC sleeps after ${Math.round(Math.min(...[sleep, hib].filter((x) => x > 0)) / 60)} minutes plugged in, and Claude live stops answering`, 'Settings > System > Power > Screen, sleep and hibernate timeouts: When plugged in, put my device to sleep after: Never.')
}

const local = await get(`http://127.0.0.1:${PORT}/`)
if (local.ok) ok('The bridge answers on this PC', local.text)
else bad(`Nothing answers on port ${PORT}`, 'Double-click "Claude live" on the desktop. If an older Claude live window is open, close it first.')

if (host) {
  const remote = await get(`https://${host}/`)
  if (remote.ok) ok('The secure address answers', `https://${host}/  (the same address the phone uses)`)
  else bad('The secure address does not answer', `https://${host}/ said: ${remote.text}`)
}

let pair = null
try { pair = JSON.parse(fs.readFileSync(path.join(DATA, 'pair.json'), 'utf8')) } catch {}
if (pair?.code) note('Pairing code ' + pair.code, 'What the phone must have. Address: ' + (host || '?'))

// 3. The phone side, as far as this PC can see it
console.log('\n  The phone')
const phones = Object.values(st?.Peer || {}).filter((p) => /ios/i.test(p.OS || ''))
if (!phones.length) note('No iPhone found in your tailnet')
for (const p of phones) {
  const name = (p.DNSName || '').split('.')[0] || p.HostName
  if (p.Online) ok(`iPhone on Tailscale: ${name}`)
  else note(`iPhone not on Tailscale right now: ${name}`, 'Turn the Tailscale app on before pairing or going to the car.' + (p.LastSeen && !p.LastSeen.startsWith('0001') ? ' Last seen ' + new Date(p.LastSeen).toLocaleString() + '.' : ''))
}
const linked = /Phone linked: yes/.test(local.text)
const adapter = (local.text.match(/Adapter: (.+?)\.?$/) || [])[1]
if (!local.ok) note('Phone link unknown (the bridge is not running)')
else if (linked) ok('V60-Link on the phone is linked to Claude')
else note('The phone is not linked right now', 'Normal while the car is off and the phone is asleep. It links when the car starts (iPhone app) or when V60-Link is open in Bluefy with Claude live on.')
if (local.ok && adapter && adapter !== 'not connected') ok('Adapter connected: ' + adapter)

// The bridge's log: everything that crossed it (the last few days' files)
const files = (() => { try { return fs.readdirSync(path.join(DATA, 'logs')).filter((f) => f.endsWith('.jsonl')).sort().slice(-7) } catch { return [] } })()
const all = []
for (const f of files) for (const l of fs.readFileSync(path.join(DATA, 'logs', f), 'utf8').split('\n')) {
  try { all.push(JSON.parse(l)) } catch {}
}

// "Connect by itself" on the phone, as it last reported when it linked or when the switch changed
const sw = all.filter((r) => r.k === 'hello' || r.k === 'auto').at(-1)
if (!sw) note('Connect by itself: not reported yet', 'The phone reports it when it links to Claude live.')
else if (sw.auto && sw.known) ok('The phone connects to the adapter by itself', 'As of ' + new Date(sw.at).toLocaleString() + '.')
else if (sw.auto) note('Connect by itself is on, but no adapter has been chosen on the phone yet', 'Tap Connect adapter once on the Link tab.')
else note('Connect by itself is off on the phone', 'Link tab > Connect > Connect by itself.')

// The V60 iPhone app's own journal (it sends it here): did the background link work?
const appRows = all.filter((r) => r.k === 'app')
if (appRows.length) {
  const seen = (re) => appRows.filter((r) => /\[background\]/.test(r.x) && re.test(r.x)).at(-1)
  const answered = seen(/car answered/), held = seen(/still linked/)
  if (answered) ok('iPhone app: the car answered with the app in the background', answered.x)
  else note('iPhone app: not yet seen working in the background', 'Lock the phone, start the car and leave the app closed.')
  if (held) ok('iPhone app: stayed linked in the background during a drive', held.x)
}

// Drive reports the bridge built from the app's recordings (bridge/drives.js)
const reports = (() => { try { return fs.readdirSync(path.join(DATA, 'drives')).filter((f) => f.endsWith('.json')).sort() } catch { return [] } })()
if (reports.length) {
  const latestId = reports.at(-1).replace(/\.json$/, '')
  ok(`${reports.length} drive report(s); the latest is ${latestId}`, (host ? `https://${host}` : `http://127.0.0.1:${PORT}`) + `/drives/${latestId}  (all: /drives)`)
} else note('No drive reports yet', 'The iPhone app 0.3 records each drive and sends it here when the car is switched off.')

// 4. What actually happened
console.log(`\n  Activity in the last ${hours} hours (from bridge/data/logs)`)
const since = Date.now() - hours * 3600e3
const rows = all.filter((r) => Date.parse(r.at) >= since)
const short = (s, n = 90) => { s = String(s ?? '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s }
const tell = (r) => {
  switch (r.k) {
    case 'phone': return r.state === 'on' ? 'Phone linked' : 'Phone link closed'
    case 'event': return { adapter_on: 'Claude was told: adapter connected', adapter_off: 'Claude was told: adapter dropped', kyle: 'Claude got your message: ' + short(r.content, 60), health_check: 'Claude got the health check: ' + short(r.content, 60) }[r.event] || 'Claude was told: ' + r.event
    case 'claude': return 'Claude replied on the phone: ' + short(r.text, 60)
    case 'cmd': return `Claude sent ${r.c} to the adapter${r.write ? ' (a write: needed your tap)' : ''}`
    case 'res': return `  car answered ${r.c}: ${r.ok ? short(r.raw, 50) : 'error: ' + short(r.error, 50)}`
    case 'perm_request': return 'Claude asked permission for ' + r.tool_name
    case 'perm': return r.allow ? 'You tapped Allow' : 'You tapped No'
    case 'auto': return 'You switched Connect by itself ' + (r.auto ? 'on' : 'off')
    case 'app': return 'iPhone app: ' + short(r.x.replace(/^\S+ \d+ [\d:]+ /, ''), 70)
    case 'delivered': return 'Delivered a saved message: ' + short(r.text, 50)
    case 'claude_run': return r.skipped ? null : r.ok ? `Claude worked on it (${r.secs} s)` : 'Claude\'s run failed: ' + short(String(r.error || ''), 60)
    case 'service': return 'Claude live service started'
    default: return null
  }
}
const story = rows.filter((r) => r.k !== 'log' && r.k !== 'link' && r.k !== 'report' && r.k !== 'kyle').map((r) => [r.at, tell(r)]).filter((x) => x[1])
const count = (k, ev) => rows.filter((r) => r.k === k && (!ev || r.event === ev)).length
if (!rows.length) note('Nothing yet', 'Once the phone links, every event, reply and adapter command is listed here.')
else {
  const told = count('event'), replied = count('claude'), adapterLines = count('log')
  note(`${told} event(s) sent to Claude, ${replied} reply(ies) from Claude, ${count('cmd')} command(s) Claude sent, ${adapterLines} adapter line(s) from the page`)
  // The proof that the whole loop works: Claude was told something and answered on the phone afterwards.
  const lastEvent = rows.filter((r) => r.k === 'event').at(-1)
  const answered = lastEvent && rows.some((r) => r.k === 'claude' && r.at >= lastEvent.at)
  const runAfter = lastEvent && rows.filter((r) => r.k === 'claude_run' && r.at >= lastEvent.at).at(-1) // the service's headless run
  if (lastEvent && answered) ok('Full loop works: Claude answered the latest event on the phone')
  else if (runAfter && runAfter.ok) ok('Claude handled the latest event', `It ran in ${runAfter.secs} s and decided nothing needed a message.`)
  else if (runAfter) bad('Claude\'s run for the latest event failed', short(String(runAfter.error || 'no detail'), 160) + ' (more in bridge/data/service.log)')
  else if (lastEvent && Date.now() - Date.parse(lastEvent.at) > 15 * 60e3) bad('Claude did not handle the latest event', 'See bridge/data/service.log. If Claude live runs in the older window, it may be waiting on a question there.')
  else if (lastEvent) note('Claude is still working on the latest event')
  for (const [at, t] of story.slice(-12)) console.log(`        ${new Date(at).toLocaleTimeString()}  ${t}`)
}

console.log('\n  ' + (broken ? `${broken} problem(s) above. Each [!!] line says what to do.` : 'Everything this PC can check is fine.') + '\n')
process.exitCode = broken ? 1 : 0

// A page of the same results, easier to read than the terminal (check.cmd opens it).
if (args.includes('--html')) {
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  const body = printed.filter((l) => !/^\s*Claude live check\s/.test(l)).map((l) => {
    const m = l.match(/^\s+\[(ok|!!|--)\] (.*)$/)
    if (m) return `<p class="${{ ok: 'ok', '!!': 'bad', '--': 'note' }[m[1]]}"><b>${{ ok: '✓', '!!': '✗', '--': '·' }[m[1]]}</b> ${esc(m[2])}</p>`
    if (/^\s{8}/.test(l)) return `<p class="sub">${esc(l.trim())}</p>`
    if (/^\s{2}\S/.test(l) && !/problem|fine\.$/.test(l)) return `<h2>${esc(l.trim())}</h2>`
    return ''
  }).join('\n')
  const head = broken ? `<div class="sum bad">${broken} problem${broken > 1 ? 's' : ''}. Each ✗ says what to do.</div>` : '<div class="sum ok">Everything this PC can check is fine.</div>'
  const html = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Claude live check</title>
<style>:root{color-scheme:light dark;--ok:#1a7f37;--bad:#c62828;--mut:#6b6b6b}@media(prefers-color-scheme:dark){:root{--ok:#4cc26a;--bad:#ff6b6b;--mut:#9a9a9a}}
body{font:16px/1.45 system-ui,sans-serif;max-width:720px;margin:24px auto;padding:0 16px}h1{font-size:22px;margin:0 0 4px}h2{font-size:15px;text-transform:uppercase;letter-spacing:.06em;color:var(--mut);margin:26px 0 6px;border-bottom:1px solid #8884;padding-bottom:4px}
p{margin:6px 0}.ok b{color:var(--ok)}.bad b{color:var(--bad)}.bad{font-weight:600}.note b{color:var(--mut)}.sub{margin:0 0 8px 22px;color:var(--mut);font-size:14px;font-family:ui-monospace,Consolas,monospace;white-space:pre-wrap}
.sum{padding:12px 14px;border-radius:6px;font-weight:600;margin:14px 0}.sum.ok{background:#1a7f3722;color:var(--ok)}.sum.bad{background:#c6282822;color:var(--bad)}</style>
<h1>Claude live check</h1><p class="sub" style="margin:0">${esc(new Date().toLocaleString())}</p>${head}${body}`
  const file = path.join(DATA, 'check.html')
  fs.writeFileSync(file, html)
  if (process.platform === 'win32' && !process.env.V60_NOOPEN) run('cmd', ['/c', 'start', '', file])
}
