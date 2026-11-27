// Send Kyle a notification from any Claude session on this PC (2026-11-27): it goes through Claude live's service to
// the V60 iPhone app, which shows it as a notification; iOS mirrors it to his Apple Watch when the phone is locked or
// away. Use it whenever a step needs his hands (a code, a password, a tap at the car) instead of waiting on him in
// a chat he may not be reading. If the phone is not linked, the service keeps the message and delivers it when it
// links again (up to 10 waiting).
//   node notify.js "<text>" [https://link-opened-on-tap]
import fs from 'node:fs'
import path from 'node:path'
import { DATA, PORT } from './lib.js'

const [text, url] = process.argv.slice(2)
if (!text) { console.log('Usage: node notify.js "<text>" [https://...]'); process.exit(2) }
const token = fs.readFileSync(path.join(DATA, 'api-token'), 'utf8').trim()
try {
  const r = await fetch(`http://127.0.0.1:${PORT}/api/tool`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-v60-token': token },
    body: JSON.stringify({ name: 'reply', args: { text, ...(url ? { url } : {}) } }),
    signal: AbortSignal.timeout(15000),
  })
  const j = await r.json()
  console.log(j.text)
  process.exit(j.isError ? 1 : 0)
} catch (e) {
  console.log('Claude live is not running on this PC (double-click "Claude live"): ' + e.message)
  process.exit(1)
}
