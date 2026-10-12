/* Photos saved on this device must survive reloads (record in saved state, picture in IndexedDB), and a second synced device must receive them. */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const path = require('path'), fs = require('fs'), zlib = require('zlib'); const ROOT = path.resolve(__dirname, '..');
function ok(c, m) { if (!c) { console.log('FAIL', m); process.exitCode = 1; } else console.log(' ok', m); }
function png(mode) { // 64x48 PNG, no dependencies; mode changes the picture
  const w = 64, h = 48, raw = Buffer.alloc((w * 3 + 1) * h); for (let y = 0; y < h; y++) { raw[y * (w * 3 + 1)] = 0; for (let x = 0; x < w; x++) { const o = y * (w * 3 + 1) + 1 + x * 3; const v = mode === 1 ? (x % 16 < 8 ? 240 : 10) : mode === 2 ? (y % 12 < 6 ? 240 : 10) : mode === 3 ? (x < 32 ? 230 : 20) : 160 + (x % 32); raw[o] = mode ? v : 90; raw[o + 1] = mode ? v : 120; raw[o + 2] = mode ? 255 - v : 160 + (x % 32); } }
  const crc = b => { let c, t = [], n; for (n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } let r = 0xFFFFFFFF; for (const x of b) r = t[(r ^ x) & 255] ^ (r >>> 8); return (r ^ 0xFFFFFFFF) >>> 0; };
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
(async () => {
  const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); await ctx.addInitScript(() => { window.__V60_TEST = true; window.__V60_NOSCAN = true; });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + ROOT + '/index.html'); await p.waitForTimeout(500);
  await p.evaluate(() => __v60.go('my')); await p.waitForTimeout(200);
  ok(await p.isVisible('#phTake'), 'photo form is available');
  await p.selectOption('#phKind', 'bay');
  await p.setInputFiles('#phFile', { name: 'bay.png', mimeType: 'image/png', buffer: png() });
  await p.waitForFunction(() => (V60.state.photos || []).length === 1, null, { timeout: 15000 });
  for (let i = 1; i <= 3; i++) {
    await p.reload(); await p.waitForTimeout(800);
    const r = await p.evaluate(async () => { const ph = V60.state.photos || []; const id = ph[0] && ph[0].asset; const blob = id ? await new Promise(res => { const rq = indexedDB.open('v60-garage', 1); rq.onsuccess = () => { const g = rq.result.transaction('blobs').objectStore('blobs').get(id); g.onsuccess = () => res(g.result ? g.result.size : 0); g.onerror = () => res(-1); }; rq.onerror = () => res(-2); }) : -3; return { n: ph.length, kind: ph[0] && ph[0].kind, size: blob }; });
    ok(r.n === 1 && r.kind === 'bay' && r.size > 0, 'photo record and picture still there after reload ' + i + ' ' + JSON.stringify(r));
  }
  /* duplicates: the same picture picked again is not added */
  await p.reload(); await p.waitForTimeout(600); await p.evaluate(() => __v60.go('my')); await p.waitForTimeout(200);
  await p.setInputFiles('#phFile', { name: 'again.png', mimeType: 'image/png', buffer: png() });
  await p.waitForFunction(() => /Already saved/.test(document.getElementById('phStatus').textContent), null, { timeout: 15000 });
  ok(await p.evaluate(() => V60.state.photos.length) === 1, 'same photo picked again is not added');
  /* batch: three files, one of them the saved photo again, plus a copy of a new one */
  await p.setInputFiles('#phFile', [
    { name: 'a.png', mimeType: 'image/png', buffer: png() },
    { name: 'b.png', mimeType: 'image/png', buffer: png(1) },
    { name: 'b2.png', mimeType: 'image/png', buffer: png(1) },
    { name: 'c.png', mimeType: 'image/png', buffer: png(2) }
  ]);
  await p.waitForSelector('#phBatch:not([hidden]) .phbl li', { timeout: 15000 });
  const rows = await p.evaluate(() => Array.from(document.querySelectorAll('#phBatch .phbl li')).map(li => ({ dup: li.classList.contains('dup'), txt: li.textContent })));
  ok(rows.length === 4 && rows[0].dup && rows[1].dup === false && rows[2].dup && rows[3].dup === false, 'batch marks the saved photo and the repeat inside the batch ' + JSON.stringify(rows.map(r => r.dup)));
  await p.selectOption('#phBatch select[data-bk="1"]', 'interior');
  await p.click('#phBatchGo');
  await p.waitForFunction(() => (V60.state.photos || []).length === 3, null, { timeout: 20000 });
  const kinds = await p.evaluate(() => V60.state.photos.map(x => x.kind + ':' + (x.hash ? 'h' : '-')));
  ok(kinds.join() === 'bay:h,interior:h,other:h', 'batch saved the two new photos with the chosen type and fingerprints ' + kinds.join());
  await p.reload(); await p.waitForTimeout(800);
  await p.evaluate(() => __v60.go('my'));
  await p.setInputFiles('#phFile', [{ name: 'b3.png', mimeType: 'image/png', buffer: png(1) }, { name: 'd.png', mimeType: 'image/png', buffer: png(3) }]);
  await p.waitForSelector('#phBatch .phbl li', { timeout: 15000 });
  ok((await p.evaluate(() => document.querySelectorAll('#phBatch .phbl li.dup').length)) === 1, 'saved photos are still recognised after a reload');
  /* a synced copy of the same picture from another device collapses to one */
  const n = await p.evaluate(() => { const st = JSON.parse(JSON.stringify(V60.state)); const before = st.photos.length; st.photos = st.photos.concat([Object.assign({}, st.photos[0], { id: 'zz', asset: 'other' })]); return [before, __v60.clean(st).photos.length]; });
  ok(n[0] === n[1], 'a second copy of a saved picture (another device) collapses to one ' + n.join('->'));
  ok(errs.length === 0, 'no errors ' + JSON.stringify(errs));
  await b.close();
})();
