// Send Kyle a notification from any Claude session on this PC (2026-11-27): it goes through Claude live's service to
// the V60 iPhone app, which shows it as a notification; iOS mirrors it to his Apple Watch when the phone is locked or
// away. Use it whenever a step needs his hands (a code, a password, a tap at the car) instead of waiting on him in
// a chat he may not be reading. If the phone is not linked, the service keeps the message and delivers it when it
// links again (up to 10 waiting).
//   node notify.js "<text>" [https://link-opened-on-tap]   (also to ntfy, when data/ntfy-topic exists)
import fs from 'node:fs'
import path from 'node:path'
import { DATA, PORT } from './lib.js'

const [text, url] = process.argv.slice(2)
if (!text) { console.log('Usage: node notify.js "<text>" [https://...]'); process.exit(2) }

// ntfy (https://ntfy.sh, free app on the phone): reaches the phone and watch even when the V60 app is asleep (iOS
// pauses it while the phone is locked and the car is off). The channel is a long random name kept in data/ntfy-topic
// (local only); anyone who knew it could read the messages, so they never carry personal details, codes or places.
const topicFile = path.join(DATA, 'ntfy-topic')
let topic = null, viaNtfy = false
try { topic = fs.readFileSync(topicFile, 'utf8').trim() } catch {}
if (topic) {
  try {
    const r = await fetch('https://ntfy.sh/' + topic, {
      method: 'POST', body: text,
      headers: { Title: 'Claude (V60)', Priority: 'high', Tags: 'red_car', ...(url ? { Click: url } : {}) },
      signal: AbortSignal.timeout(15000),
    })
    viaNtfy = r.ok
    console.log(r.ok ? 'Sent to ntfy (phone and watch).' : 'ntfy answered ' + r.status)
  } catch (e) { console.log('ntfy not reachable: ' + e.message) }
}

const token = fs.readFileSync(path.join(DATA, 'api-token'), 'utf8').trim()
try {
  const r = await fetch(`http://127.0.0.1:${PORT}/api/tool`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-v60-token': token },
    body: JSON.stringify({ name: 'reply', args: { text, notice: true, ...(url ? { url } : {}) } }),
    signal: AbortSignal.timeout(15000),
  })
  const j = await r.json()
  console.log('V60 app: ' + j.text)
  process.exitCode = j.isError && !viaNtfy ? 1 : 0
} catch (e) {
  console.log('Claude live is not running on this PC (double-click "Claude live"): ' + e.message)
  process.exitCode = viaNtfy ? 0 : 1
}
