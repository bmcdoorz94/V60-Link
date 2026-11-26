// Prints what the phone needs (PC address and pairing code) and makes sure Tailscale publishes the bridge.
// Run by start.cmd before Claude starts. Safe to run again any time: `node pair.js`.
import { execFileSync } from 'node:child_process'
import { PORT, pairing } from './lib.js'

const ts = process.platform === 'win32' ? 'tailscale.exe' : 'tailscale'
const run = (args) => { try { return execFileSync(ts, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 20000 }) } catch (e) { return null } }

const p = pairing()
let host = null
const st = run(['status', '--json'])
if (st) { try { host = (JSON.parse(st).Self.DNSName || '').replace(/\.$/, '') || null } catch {} }

let served = run(['serve', 'status']) || ''
if (host && !served.includes(String(PORT))) {
  run(['serve', '--bg', String(PORT)])
  served = run(['serve', 'status']) || ''
}

console.log('')
console.log('  Claude live (V60)')
console.log('  -----------------')
if (host) console.log('  PC address:    ' + host)
else console.log('  PC address:    (Tailscale did not answer. Is it running and signed in on this PC?)')
console.log('  Pairing code:  ' + p.code)
console.log('')
if (host && !served.includes(String(PORT))) {
  console.log('  Tailscale is not publishing the bridge yet. Run this once and follow any link it prints:')
  console.log('      tailscale serve --bg ' + PORT)
  console.log('  (Tailscale may ask you to turn on HTTPS certificates for your tailnet the first time.)')
  console.log('')
}
console.log('  On the phone: Bluefy > V60-Link > Link > Claude live > Pair with your PC.')
console.log('  Type the PC address and the code once. Tailscale must be on on the phone.')
console.log('')
