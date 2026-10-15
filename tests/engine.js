// Preloaded by tests/run.js (node -r). With V60_ENGINE=webkit, every test's `chromium` becomes WebKit
// dressed as an iPhone (Safari user agent, touch, 3x screen), because Bluefy on iOS runs on WebKit.
// Each test keeps its own viewport and colour scheme, and its screenshots get an "-iphone" suffix.
// WebKit blocks some requests from file:// pages (never the case on GitHub Pages), so the repo is served
// at http://127.0.0.1 and file:// URLs given to page.goto are rewritten to it. Service workers stay off,
// as they are in the Chromium runs. With no V60_ENGINE the tests run unchanged.
const Module = require('module');
if (process.env.V60_ENGINE === 'webkit') {
  const http = require('http'), fs = require('fs'), path = require('path');
  const ROOT = path.resolve(__dirname, '..');
  const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.pdf': 'application/pdf' };
  const server = http.createServer((q, r) => {
    const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]));
    if (!f.startsWith(ROOT)) { r.writeHead(403); return r.end(); }
    fs.readFile(f, (e, d) => {
      if (e) { r.writeHead(404); return r.end(); }
      r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); r.end(d);
    });
  }).listen(0, '127.0.0.1');
  server.unref();
  // the tests build 'file://' + ROOT + '/index.html', which on Windows is file://C:\...\index.html
  const toHttp = (u) => {
    if (typeof u !== 'string' || !u.startsWith('file://')) return u;
    const f = path.resolve(decodeURIComponent(u.slice(7).replace(/^\/(?=[a-z]:)/i, '')));
    const rel = path.relative(ROOT, f);
    return rel.startsWith('..') ? u : 'http://127.0.0.1:' + server.address().port + '/' + rel.split(path.sep).join('/');
  };

  const load = Module._load;
  Module._load = function (req) {
    const pw = load.apply(this, arguments);
    if (!/(^|[\\/])playwright$/.test(req) || !pw.webkit) return pw;
    const { viewport, ...phone } = pw.devices['iPhone 13'];
    // Each context is a persistent profile in a temp folder, like Safari or Bluefy on the phone. WebKit's
    // throwaway (private) contexts refuse to store Blobs in IndexedDB, which would fail every photo test.
    const os = require('os');
    const chromium = {
      ...pw.chromium,
      launch: async () => {
        const open = [];
        const b = {
          newContext: async (o = {}) => {
            const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'v60-webkit-'));
            const c = await pw.webkit.launchPersistentContext(dir, { ...phone, serviceWorkers: 'block', ...o, viewport: o.viewport || viewport });
            open.push([c, dir]);
            c.on('page', (p) => {
              const goto = p.goto.bind(p), shot = p.screenshot.bind(p);
              p.goto = (u, ...a) => goto(toHttp(u), ...a);
              p.screenshot = (s = {}) => shot(s.path ? { ...s, path: s.path.replace(/\.png$/, '-iphone.png') } : s);
            });
            const close = c.close.bind(c);
            c.close = async () => { await close(); fs.rmSync(dir, { recursive: true, force: true }); };
            return c;
          },
          newPage: async (o) => (await b.newContext(o)).newPage(),
          close: async () => { for (const [c] of open.splice(0)) await c.close().catch(() => {}); },
        };
        return b;
      },
    };
    return { ...pw, chromium };
  };
}
