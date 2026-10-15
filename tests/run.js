// Builds the app, then runs every test in Chromium and in WebKit dressed as an iPhone (Bluefy's engine).
//   node tests/run.js                 build + all tests, both engines
//   node tests/run.js manual story    only these tests
//   node tests/run.js --webkit        one engine (--chromium or --webkit)
//   node tests/run.js --no-build      skip the build
// Prints one line per test and engine; the full output of a failing test follows. Exit code 1 if any failed.
const { spawn, spawnSync } = require('child_process');
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const pick = args.filter((a) => !a.startsWith('--')).map((a) => a.replace(/\.js$/, ''));
const ALL = fs.readdirSync(__dirname).filter((f) => f.endsWith('.js') && !['run.js', 'engine.js', 'figshot.js'].includes(f)).map((f) => f.slice(0, -3)).sort();
const tests = pick.length ? pick : ALL;
const unknown = tests.filter((t) => !ALL.includes(t));
if (unknown.length) { console.error('No such test:', unknown.join(', '), '\nTests:', ALL.join(', ')); process.exit(2); }
const engines = flags.has('--chromium') ? ['chromium'] : flags.has('--webkit') ? ['webkit'] : ['chromium', 'webkit'];

if (!flags.has('--no-build')) {
  const py = process.platform === 'win32' ? 'python' : 'python3';
  const r = spawnSync(py, [path.join('tools', 'build.py')], { cwd: ROOT, encoding: 'utf8' });
  if (r.status !== 0) { console.error('Build failed\n' + (r.stdout || '') + (r.stderr || r.error || '')); process.exit(1); }
  console.log((r.stdout || '').split(' modules:')[0]);
}

function run(test, engine) {
  return new Promise((done) => {
    const t0 = Date.now();
    const env = { ...process.env, V60_ENGINE: engine };
    const p = spawn(process.execPath, ['-r', path.join(__dirname, 'engine.js'), path.join(__dirname, test + '.js')], { cwd: ROOT, env });
    let out = '';
    p.stdout.on('data', (d) => (out += d)); p.stderr.on('data', (d) => (out += d));
    const kill = setTimeout(() => { out += '\nTimed out after 5 minutes'; p.kill(); }, 300000);
    p.on('close', (code) => { clearTimeout(kill); done({ test, engine, ok: code === 0 && !/^\s*FAIL/m.test(out), out, s: ((Date.now() - t0) / 1000).toFixed(1) }); });
  });
}

(async () => {
  const jobs = [];
  for (const e of engines) for (const t of tests) jobs.push([t, e]);
  const results = [];
  const width = Math.max(2, Math.min(6, require('os').cpus().length - 1));
  let next = 0;
  await Promise.all(Array.from({ length: width }, async () => {
    while (next < jobs.length) {
      const r = await run(...jobs[next++]);
      results.push(r);
      console.log((r.ok ? '[pass] ' : '[FAIL] ') + r.test.padEnd(11) + (r.engine === 'webkit' ? 'iPhone/WebKit' : 'Chromium').padEnd(14) + r.s + 's');
    }
  }));
  const bad = results.filter((r) => !r.ok);
  for (const r of bad) console.log('\n===== ' + r.test + ' (' + r.engine + ') =====\n' + r.out.trim());
  console.log('\n' + (results.length - bad.length) + ' of ' + results.length + ' passed. Screenshots: tests/shots/');
  process.exitCode = bad.length ? 1 : 0;
})();
