#!/usr/bin/env node
// Keeps Claude live's service running: starts service.js, starts it again if it stops (after 5 s, longer if it keeps
// failing), and restarts it 3 s after any bridge .js file changes, so code updates take effect with nothing to click.
// Started hidden at Windows sign-in by "Claude live.vbs" in the Startup folder (SETUP.md). Output: data/service.log.
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const DATA = process.env.V60_DATA || path.join(HERE, 'data')
fs.mkdirSync(DATA, { recursive: true })
const LOG = path.join(DATA, 'service.log')
const log = (s) => {
  try { if (fs.statSync(LOG).size > 2e6) fs.renameSync(LOG, LOG + '.old') } catch {}
  fs.appendFileSync(LOG, `${new Date().toISOString()} ${s}\n`)
}

// one supervisor at a time
const LOCK = path.join(DATA, 'run.pid')
try {
  const old = Number(fs.readFileSync(LOCK, 'utf8'))
  if (old && old !== process.pid) { process.kill(old, 0); log(`another run.js (pid ${old}) is running; exiting`); process.exit(0) }
} catch {}
fs.writeFileSync(LOCK, String(process.pid))

let child = null, fails = 0, restarting = false, startedAt = 0
function start() {
  startedAt = Date.now()
  child = spawn(process.execPath, [path.join(HERE, 'service.js')], { cwd: HERE, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] })
  log(`service started (pid ${child.pid})`)
  child.stdout.on('data', (d) => log(String(d).trimEnd()))
  child.stderr.on('data', (d) => log(String(d).trimEnd()))
  child.on('exit', (code, sig) => {
    log(`service stopped (code ${code}${sig ? ', ' + sig : ''})`)
    child = null
    if (restarting) { restarting = false; return start() }
    fails = Date.now() - startedAt < 60000 ? fails + 1 : 0
    setTimeout(start, Math.min(5000 * 2 ** fails, 300000))
  })
}
function restart(why) {
  log(`restarting: ${why}`)
  if (!child) return start()
  restarting = true
  child.kill()
}

let timer = null
fs.watch(HERE, (ev, f) => {
  // drives.js reloads by itself (hub.js); check.js, phone.js and pair.js are not part of the service
  if (!f || !/\.js$/.test(f) || ['check.js', 'phone.js', 'pair.js', 'drives.js', 'run.js'].includes(f)) return
  clearTimeout(timer)
  timer = setTimeout(() => restart(`${f} changed`), 3000)
})
process.on('exit', () => { try { if (Number(fs.readFileSync(LOCK, 'utf8')) === process.pid) fs.rmSync(LOCK) } catch {} })
for (const s of ['SIGINT', 'SIGTERM']) process.on(s, () => { if (child) child.kill(); process.exit(0) })
start()
