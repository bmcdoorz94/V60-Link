/* Sync: keeps every copy of the Garage (Home Screen app, Bluefy, any computer's browser) on the same progress by storing it
   in a private GitHub repository the owner creates. One file holds the saved state (garage.json); photos go in photos/.
   The access token stays on each device (localStorage, never in the synced data). The Claude artifact can't reach GitHub,
   so sync is off there. Conflicts (both sides changed since the last sync) ask which copy to keep. */
(function () {
  var KEY = "v60-sync", API = null, FILE = "garage.json", busy = false, again = false, timer = null, conflict = null, lastMsg = "";
  function meta() { try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { return {}; } }
  function setMeta(m) { try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) {} }
  function on() { var m = meta(); return !!(m.token && m.repo && API && API.localMode && API.localMode()); }
  function device() { var m = meta(); if (!m.device) { var ua = navigator.userAgent || "", kind = /Bluefy/i.test(ua) ? "Bluefy" : (window.navigator.standalone || (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ? "Home Screen app" : (/iPhone|iPad/.test(ua) ? "iPhone browser" : "Computer browser")); m.device = kind + " " + Math.random().toString(36).slice(2, 6); setMeta(m); } return m.device; }
  function b64enc(str) { return btoa(unescape(encodeURIComponent(str))); }
  function b64dec(b) { return decodeURIComponent(escape(atob(String(b).replace(/\s/g, "")))); }
  function blob64(blob) { return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(String(r.result).split(",")[1]); }; r.onerror = rej; r.readAsDataURL(blob); }); }
  function gh(path, opt) {
    var m = meta(); opt = opt || {};
    return fetch("https://api.github.com/repos/" + m.repo + "/contents/" + path, { method: opt.method || "GET", cache: "no-store", headers: Object.assign({ Authorization: "Bearer " + m.token, Accept: opt.raw ? "application/vnd.github.raw+json" : "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" }, opt.body ? { "Content-Type": "application/json" } : {}), body: opt.body ? JSON.stringify(opt.body) : undefined });
  }
  function status(t) { lastMsg = t; var el = document.getElementById("syncStatus"); if (el) el.textContent = t; var s = document.getElementById("saveStatus"); if (s && t) s.textContent = t; }
  function whyFail(r) {
    if (r.status === 401) return "The token was rejected. Make a new one and paste it again.";
    if (r.status === 403) return "The token can't write to that repository. Give it Contents: Read and write.";
    if (r.status === 404) return "Repository not found. Check the name, and that the token includes it.";
    return "GitHub answered " + r.status + ". Will retry.";
  }
  function getRemote() {
    return gh(FILE).then(function (r) {
      if (r.status === 404) return null;
      if (!r.ok) throw new Error(whyFail(r));
      return r.json().then(function (j) {
        if (j.encoding === "base64" && j.content) return { sha: j.sha, data: JSON.parse(b64dec(j.content)) };
        return gh(FILE, { raw: true }).then(function (r2) { return r2.json(); }).then(function (d) { return { sha: j.sha, data: d }; });
      });
    });
  }
  function push(force) {
    if (!on()) return Promise.resolve();
    if (busy) { again = true; return Promise.resolve(); }
    busy = true; status("Syncing…");
    var m = meta();
    return getRemote().then(function (rem) {
      if (rem && rem.data && rem.data.updatedAt !== m.at && !force) { showConflict(rem); return; }
      var at = new Date().toISOString(), body = { v: 1, updatedAt: at, device: device(), state: API.snapshot() };
      return gh(FILE, { method: "PUT", body: { message: "Sync from " + device(), content: b64enc(JSON.stringify(body)), sha: rem ? rem.sha : undefined } }).then(function (r) {
        if (r.status === 409 || r.status === 422) { again = true; return; }
        if (!r.ok) throw new Error(whyFail(r));
        return r.json().then(function (j) { var mm = meta(); mm.at = at; mm.sha = j.content && j.content.sha; mm.dirty = false; mm.ok = at; setMeta(mm); status("Synced " + new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })); return pushPhotos(); });
      });
    }).catch(function (e) { status((e && e.message) || "Sync failed. Will retry."); }).then(function () { busy = false; renderBox(); if (again) { again = false; setTimeout(function () { push(false); }, 800); } });
  }
  function pull() {
    if (!on() || busy) return Promise.resolve();
    busy = true; status("Checking for changes…");
    var m = meta();
    return getRemote().then(function (rem) {
      if (!rem) { busy = false; return push(true); }
      if (rem.data.updatedAt === m.at) { status(m.dirty ? "Syncing…" : "Up to date"); busy = false; if (m.dirty) return push(false); return; }
      if (m.dirty && m.at) { busy = false; showConflict(rem); return; }
      apply(rem); busy = false;
    }).catch(function (e) { busy = false; status((e && e.message) || "Couldn't reach GitHub. Working offline."); }).then(renderBox);
  }
  function apply(rem) {
    var m = meta(); m.at = rem.data.updatedAt; m.sha = rem.sha; m.dirty = false; setMeta(m);
    API.replaceState(rem.data.state);
    status("Updated from " + (rem.data.device || "another device"));
    pullPhotos(rem.data.state);
  }
  function showConflict(rem) {
    conflict = rem;
    var b = document.getElementById("syncConflict");
    if (!b) { b = document.createElement("div"); b.id = "syncConflict"; b.className = "updatebar syncbar"; b.setAttribute("role", "alert"); document.body.insertBefore(b, document.body.firstChild); }
    b.hidden = false;
    b.innerHTML = '<span>Progress changed on another device (' + API.esc(rem.data.device || "unknown") + ", " + API.esc(new Date(rem.data.updatedAt).toLocaleString()) + ') and on this one. Keep which?</span><span class="row"><button type="button" data-keep="here">This device</button><button type="button" data-keep="there" class="quiet">The other device</button></span>';
    status("Waiting for you to pick a copy");
  }
  function pushPhotos() {
    var m = meta(), done = m.photos || {}, list = (API.state.photos || []).filter(function (p) { return p.local && !done[p.asset]; });
    return list.reduce(function (pr, p) {
      return pr.then(function () { return API.blobGet(p.asset); }).then(function (blob) {
        if (!blob) return;
        return blob64(blob).then(function (b) { return gh("photos/" + p.asset + ".jpg", { method: "PUT", body: { message: "Photo " + p.date, content: b } }); }).then(function (r) { if (r.ok || r.status === 422) { var mm = meta(); mm.photos = mm.photos || {}; mm.photos[p.asset] = 1; setMeta(mm); } });
      });
    }, Promise.resolve()).catch(function () {});
  }
  function pullPhotos(st) {
    var list = ((st && st.photos) || []).filter(function (p) { return p.local; });
    return list.reduce(function (pr, p) {
      return pr.then(function () { return API.blobGet(p.asset); }).then(function (have) {
        if (have) return;
        return gh("photos/" + p.asset + ".jpg").then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
          if (!j || !j.content) return;
          var bin = atob(j.content.replace(/\s/g, "")), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
          var mm = meta(); mm.photos = mm.photos || {}; mm.photos[p.asset] = 1; setMeta(mm);
          return API.blobPut(p.asset, new Blob([u], { type: "image/jpeg" }));
        });
      });
    }, Promise.resolve()).then(function () { API.renderAll(); }).catch(function () {});
  }
  function renderBox() {
    var box = document.getElementById("syncBox"); if (!box || !API) return;
    var m = meta(), esc = API.esc;
    if (!API.localMode()) { box.innerHTML = '<p class="status">This copy (inside Claude) saves to your Claude account and can\'t reach GitHub, so it can\'t join sync. Use the Home Screen app for synced progress.</p>'; return; }
    if (m.token && m.repo) {
      box.innerHTML = '<p><b>Sync is on</b> · ' + esc(m.repo) + '</p><p class="status" id="syncStatus">' + esc(lastMsg || (m.ok ? "Last synced " + new Date(m.ok).toLocaleString() : "Not synced yet")) + '</p><div class="row"><button type="button" class="quiet" id="syncNow">Sync now</button><button type="button" class="quiet" id="syncOff">Turn off on this device</button></div><p class="status">This device: ' + esc(device()) + ". Photos sync too.</p>";
      return;
    }
    box.innerHTML = '<p><b>Sync across devices</b></p><p class="status">Keeps the Home Screen app, Bluefy and any computer on the same progress, using a private GitHub repository only you can see. One-time setup on each device: paste the same repository name and token.</p>' +
      '<ol class="plain syncsteps"><li>On github.com, create a <b>private</b> repository named <span class="mono">v60-garage-data</span>.</li><li>Settings → Developer settings → Fine-grained tokens → Generate. Repository access: only <span class="mono">v60-garage-data</span>. Permissions: Contents, Read and write.</li><li>Paste the repository and token here.</li></ol>' +
      '<div class="field"><label for="syncRepo">Repository (owner/name)</label><input id="syncRepo" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" value="' + esc(m.repo || "bmcdoorz94/v60-garage-data") + '"></div><div class="field"><label for="syncTok">Token</label><input id="syncTok" type="password" autocomplete="off" spellcheck="false" placeholder="github_pat_…"></div><div class="row"><button type="button" id="syncGo">Turn on sync</button><span class="status" id="syncStatus">' + esc(lastMsg) + "</span></div>";
  }
  function connect() {
    var repo = (document.getElementById("syncRepo").value || "").trim().replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, ""), tok = (document.getElementById("syncTok").value || "").trim();
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) { status("Enter the repository as owner/name."); return; }
    if (!tok) { status("Paste the token."); return; }
    var m = meta(); m.repo = repo; m.token = tok; m.at = null; m.dirty = false; setMeta(m);
    status("Connecting…");
    getRemote().then(function (rem) {
      if (!rem) { var mm = meta(); mm.dirty = true; setMeta(mm); return push(true); }
      var local = API.snapshot(), hasLocal = (local.log || []).length || (local.oil || []).length || Object.keys((local.academy || {}).done || {}).length;
      if (hasLocal) { showConflict(rem); return; }
      apply(rem);
    }).catch(function (e) { var mm = meta(); delete mm.token; setMeta(mm); status((e && e.message) || "Couldn't connect."); }).then(renderBox);
  }
  window.V60_SYNC = {
    on: on,
    changed: function () { if (!on()) return; var m = meta(); m.dirty = true; setMeta(m); clearTimeout(timer); timer = setTimeout(function () { push(false); }, 2500); },
    renderBox: renderBox, pull: pull, push: push
  };
  (window.V60_MODULES = window.V60_MODULES || []).push({
    id: "sync",
    init: function (api) {
      API = api;
      document.addEventListener("click", function (e) {
        var b = e.target.closest && e.target.closest("button"); if (!b) return;
        if (b.id === "syncGo") connect();
        else if (b.id === "syncNow") { var m = meta(); if (m.dirty) push(false); else pull(); }
        else if (b.id === "syncOff") { var mm = meta(); delete mm.token; setMeta(mm); lastMsg = "Sync turned off on this device. Your data stays here and in the repository."; renderBox(); }
        else if (b.getAttribute("data-keep")) {
          var keep = b.getAttribute("data-keep"), bar = document.getElementById("syncConflict"); if (bar) bar.hidden = true;
          if (keep === "there" && conflict) apply(conflict); else push(true);
          conflict = null;
        }
      });
      document.addEventListener("visibilitychange", function () { if (document.visibilityState === "visible") pull(); });
      window.addEventListener("online", function () { pull(); });
      setTimeout(function () { if (on()) pull(); }, 1500);
    }
  });
})();
