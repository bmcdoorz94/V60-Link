// Read-only look at Kyle's iPhone screen from this PC (no control: it cannot tap or type).
// Uses pymobiledevice3 (installed in C:\Users\kfitz\Tools\pmd3; override with PMD3) over the USB cable, or over
// home Wi-Fi when iTunes' "Show this iPhone when on Wi-Fi" is on. Needs Developer Mode on the phone (on, since the
// sideloaded apps need it) and Apple's developer disk image mounted, which the phone drops at every restart:
// this mounts it again by itself. No administrator rights: pymobiledevice3 opens a user-space tunnel.
//   node phone.js            screenshot to data/phone/<time>.png (local, gitignored) and print its path
//   node phone.js --check    say whether the phone is reachable, nothing else
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(HERE, 'data', 'phone')
const PMD3 = process.env.PMD3 || 'C:\\Users\\kfitz\\Tools\\pmd3\\Scripts\\pymobiledevice3.exe'
const KEEP = 50

const run = (args, timeout = 60000) => execFileSync(PMD3, args, { encoding: 'utf8', timeout, stdio: ['ignore', 'pipe', 'pipe'] })
const fail = (msg) => { console.log(msg); process.exit(1) }

if (!fs.existsSync(PMD3)) fail(`pymobiledevice3 is not installed at ${PMD3}.`)
let devices = []
try { devices = JSON.parse(run(['usbmux', 'list'])) } catch (e) { fail('Could not ask Apple Mobile Device Service for phones: ' + String(e.stderr || e.message).trim().split('\n').pop()) }
const phone = devices.find((d) => d.DeviceClass === 'iPhone')
if (!phone) fail('The iPhone is not reachable: plug it into the PC, or have it on home Wi-Fi with Wi-Fi sync on in iTunes.')
const how = `iPhone, iOS ${phone.ProductVersion}, over ${phone.ConnectionType === 'USB' ? 'USB' : 'Wi-Fi'}`
if (process.argv.includes('--check')) { console.log('Reachable: ' + how); process.exit(0) }

try {
  if (!run(['mounter', 'list']).includes('DeveloperDiskImage')) { console.log('Mounting the developer disk image...'); run(['mounter', 'auto-mount'], 180000) }
} catch (e) { fail('Could not mount the developer disk image (is Developer Mode on?): ' + String(e.stderr || e.message).trim().split('\n').pop()) }

fs.mkdirSync(OUT, { recursive: true })
const p = (n) => String(n).padStart(2, '0'), d = new Date()
const file = path.join(OUT, `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}.png`)
try { run(['developer', 'dvt', 'screenshot', file], 90000) } catch (e) { fail('Screenshot failed: ' + String(e.stderr || e.message).trim().split('\n').pop()) }
if (!fs.existsSync(file)) fail('Screenshot failed: no file was written.')
// keep the newest KEEP screenshots; they can show anything on the phone, so they never leave this PC
fs.readdirSync(OUT).filter((f) => /^\d{8}-\d{6}\.png$/.test(f)).sort().slice(0, -KEEP).forEach((f) => fs.rmSync(path.join(OUT, f)))
console.log(file)
