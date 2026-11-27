// Taps and typing on Kyle's iPhone from this PC (2026-11-27), through WebDriverAgent (Appium's XCUITest runner,
// built by .github/workflows/wda.yml and installed once on the phone). Each run starts it on the phone
// (pymobiledevice3 developer dvt xcuitest, over USB or home Wi-Fi), waits for it to announce its address, does the
// steps in order, and stops it again: it is never left running (while it runs, anything on the home Wi-Fi could
// reach its port). Read-only looks stay with phone.js (screenshot, --items).
//
//   node wda.js <step> [<step> ...]
//     launch:<bundle id>     open an app (e.g. launch:com.SideStore.SideStore.KBX29Y87AM)
//     open:<url>             open a link (an App Store page, a deep link, a web page in Safari)
//     press:<text>           tap the first visible element whose label or name contains the text (case-insensitive);
//                            on a big page (the Garage's web view) the search can crash WebDriverAgent: use tap:
//     press:<text>#2         ... the second match
//     tap:<x>,<y>            tap a point, in screen points (the screenshot's pixels divided by 3)
//     type:<text>            type into whatever has focus (never passwords, tokens or codes: Kyle types those)
//     swipe:up|down|left|right
//     drag:<x1>,<y1>,<x2>,<y2>  drag a finger between two points (drag:60,2,60,500 opens Notification Center)
//     home                   go to the home screen
//     wait:<seconds>
//     labels                 print the visible labels (like phone.js --items, from WebDriverAgent's view)
// Prints one line per step; exits 1 at the first step that fails. Install with Sideloadly over the USB cable
// (SideStore cannot sign the test bundle inside). Tested 2026-11-27 over home Wi-Fi: launch, tap, labels.
import { spawn, execFileSync } from 'node:child_process'

const PMD3 = process.env.PMD3 || 'C:\\Users\\kfitz\\Tools\\pmd3\\Scripts\\pymobiledevice3.exe'
const steps = process.argv.slice(2)
if (!steps.length) { console.log('Usage: node wda.js <step> [<step> ...]  (see the top of wda.js)'); process.exit(2) }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const say = (s) => console.log(s)

// USB first, then home Wi-Fi (the same choice as phone.js)
function via() {
  try { const l = JSON.parse(execFileSync(PMD3, ['usbmux', 'list', '--usb'], { encoding: 'utf8', timeout: 30000 })); if (l.some((d) => d.DeviceClass === 'iPhone')) return [] } catch {}
  return ['--remotepairing']
}
function runnerId(v) {
  const apps = JSON.parse(execFileSync(PMD3, ['apps', 'list', ...v], { encoding: 'utf8', timeout: 60000, maxBuffer: 64 << 20 }))
  return Object.keys(apps).find((k) => /WebDriverAgentRunner/i.test(k)) || null
}

let child = null, base = null, sid = null
async function start() {
  const v = via()
  const id = runnerId(v)
  if (!id) throw new Error('WebDriverAgent is not installed on the phone (release "wda" on GitHub; install it with SideStore or Sideloadly)')
  // the phone's address on the home Wi-Fi (WebDriverAgent listens there on port 8100); pymobiledevice3 does not pass
  // on the line where WebDriverAgent announces it, so ask the network instead
  let ip = process.env.WDA_IP || null
  if (!ip) try { const l = JSON.parse(execFileSync(PMD3, ['bonjour', 'mobdev2', '--timeout', '4'], { encoding: 'utf8', timeout: 30000 })); const d = l.find((x) => x.DeviceClass === 'iPhone' && x.ip); ip = d && d.ip } catch {}
  if (!ip) throw new Error('the phone is not on the home Wi-Fi (WebDriverAgent is reached over Wi-Fi)')
  base = `http://${ip}:8100`
  child = spawn(PMD3, ['developer', 'dvt', 'xcuitest', id, ...v], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
  let out = ''
  const grab = (d) => { out += d; if (out.length > 20000) out = out.slice(-10000) }
  child.stdout.on('data', grab); child.stderr.on('data', grab)
  let up = false
  for (let i = 0; i < 60 && !up; i++) {
    if (child.exitCode != null) break
    try { up = (await fetch(base + '/status', { signal: AbortSignal.timeout(1500) })).ok } catch {}
    if (!up) await sleep(1000)
  }
  if (!up) throw new Error('WebDriverAgent did not answer (is the phone unlocked?): ' + out.split(String.fromCharCode(10)).filter((l) => /ERROR|rror|failed/i.test(l)).slice(-2).join(' '))
  const s = await call('POST', '/session', { capabilities: { alwaysMatch: {}, firstMatch: [{}] } })
  sid = s.sessionId || (s.value && s.value.sessionId)
  if (!sid) throw new Error('no WebDriverAgent session')
}
function stop() { try { if (child && child.exitCode == null) child.kill() } catch {} }
async function call(method, p, body) {
  const r = await fetch(base + p, { method, headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(30000) })
  const j = await r.json().catch(() => ({}))
  if (!r.ok || (j.value && j.value.error)) throw new Error(`${method} ${p}: ${(j.value && (j.value.message || j.value.error)) || r.status}`)
  return j
}
const S = (p) => `/session/${sid}${p}`
const q = (t) => t.replace(/\\/g, '\\\\').replace(/'/g, "\\'")

async function press(text) {
  const m = /^(.*?)(?:#(\d+))?$/.exec(text), want = m[1], nth = +(m[2] || 1)
  const pred = `(label CONTAINS[c] '${q(want)}' OR name CONTAINS[c] '${q(want)}') AND visible == 1`
  const found = (await call('POST', S('/elements'), { using: 'predicate string', value: pred })).value || []
  const el = found[nth - 1]
  if (!el) throw new Error(`nothing visible labelled "${want}"` + (nth > 1 ? ` (#${nth})` : ''))
  const eid = el.ELEMENT || el['element-6066-11e4-a52e-4f735466cecf']
  await call('POST', S(`/element/${eid}/click`))
  return `pressed "${want}"${found.length > 1 ? ` (${nth} of ${found.length})` : ''}`
}
async function labels() {
  const xml = (await call('GET', S('/source'))).value || ''
  const out = []
  for (const m of String(xml).matchAll(/<XCUIElementType(\w+)[^>]*?\blabel="([^"]+)"[^>]*?\bvisible="true"/g)) out.push(`${m[1]}: ${m[2]}`)
  return out.join('\n') || '(no labels)'
}

async function main() {
  await start()
  try {
    for (const st of steps) {
      const [verb, ...rest] = st.split(':'), arg = rest.join(':')
      let r
      if (verb === 'open') { await call('POST', S('/url'), { url: arg }); r = 'opened ' + arg }
      else if (verb === 'launch') { await call('POST', S('/wda/apps/launch'), { bundleId: arg }); r = 'opened ' + arg }
      else if (verb === 'press') r = await press(arg)
      else if (verb === 'tap') { const [x, y] = arg.split(',').map(Number); await call('POST', S('/wda/tap'), { x, y }); r = `tapped ${x},${y}` }
      else if (verb === 'type') { await call('POST', S('/wda/keys'), { value: [...arg] }); r = `typed ${arg.length} characters` }
      else if (verb === 'swipe') {
        const w = (await call('GET', S('/window/size'))).value, cx = w.width / 2, cy = w.height / 2, dx = w.width * 0.3, dy = w.height * 0.3
        const to = { up: [cx, cy + dy, cx, cy - dy], down: [cx, cy - dy, cx, cy + dy], left: [cx + dx, cy, cx - dx, cy], right: [cx - dx, cy, cx + dx, cy] }[arg]
        if (!to) throw new Error('swipe:up, down, left or right')
        await call('POST', S('/wda/dragfromtoforduration'), { fromX: to[0], fromY: to[1], toX: to[2], toY: to[3], duration: 0.2 }); r = 'swiped ' + arg
      }
      else if (verb === 'drag') { const [a, b, c, d] = arg.split(',').map(Number); await call('POST', S('/wda/dragfromtoforduration'), { fromX: a, fromY: b, toX: c, toY: d, duration: 0.3 }); r = `dragged ${a},${b} to ${c},${d}` }
      else if (verb === 'home') { await call('POST', '/wda/homescreen'); r = 'home screen' }
      else if (verb === 'wait') { await sleep(Math.min(+arg || 1, 60) * 1000); r = `waited ${arg} s` }
      else if (verb === 'labels') r = await labels()
      else throw new Error('unknown step: ' + st)
      say(r)
      await sleep(400)
    }
  } finally {
    try { await call('DELETE', S('')) } catch {}
    stop()
  }
}
main().catch((e) => { say('FAILED: ' + e.message); stop(); process.exit(1) })
