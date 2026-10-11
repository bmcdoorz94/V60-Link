# V60 Garage

A learn / diagnose / maintain app for one car: Kyle's 2016 Volvo V60 T5 Drive-E Premier. It runs on GitHub Pages as an installable app for iPhone and desktop, and also as a Claude artifact. Kyle directs the work and doesn't write code. Explain changes in plain words.

Read `docs/ROADMAP.md` before starting. It holds the backlog, the decisions so far, and open questions for Kyle.

## The car (public repo: never commit the VIN, plate or chassis number)
- 2016 V60 T5 Drive-E Premier, FWD, B4204T11 2.0 L turbo four, 240 hp / 258 lb-ft, Aisin TG-81SC 8-speed, start/stop, indirect tire monitor (no wheel sensors).
- Volvo bulletin codes: engine code 40, vehicle type 155.
- Bought about Aug 2025, as-is from an independent lot, at about 90k miles, with no service history. About 95k miles in Oct 2026. Austin, TX (Travis County emissions testing). iPhone only.
- Tire pressure light is always on. Timing belt history is unknown.

## Rules for content
- Every fact needs a real source. Prefer Volvo's owner's manual, Volvo bulletins (NHTSA PDFs), NHTSA APIs and Volvo press releases. Sources live in `window.V60_SOURCES` (facts.js), or as `[title, url]` pairs.
- Mark anything unconfirmed as unconfirmed in the UI text. Never guess numbers, prices, the car's color or its options.
- Volvo's manual wins over forums and generic advice. Where Volvo's documents conflict, say so.
- No meta-commentary or praise in UI copy. Plain, direct sentences.

## Layout
- `src/` is the only place to edit. The root `index.html`, `app.css`, `js/`, `sw.js`, `manifest.webmanifest` and all of `dist-artifact/` are build output.
- `src/body.html` holds the core markup; `src/css/*.css` are concatenated, `app.css` first.
- `src/js/core.js` is the garage engine: Academy, bay maps, specs, health score, records, Data lab, simulator, backup. It exposes `window.V60` (the API) and `window.__v60` (test hook).
- `src/js/data/` holds `facts.js` (V60_SOURCES and V60_FACTS, which drive the Library, Cards and Exam) and `articles.js` (V60_ARTICLES; body lines use "## " for headings and "- " for bullets).
- `src/js/modules/*.js` is one feature per file. Each registers itself:
  `(window.V60_MODULES = window.V60_MODULES || []).push({ id, tabs:[{id, section, label, order, hidden?, html}], init(api), render(api), clean(v), xp(api), actions(api, list), today(api) -> [{order, html}], jump(api, kind, id) })`
  - Sections: `today`, `learn`, `car`, `check`, `data`.
  - Saved data lives under `api.mod(id)` / `api.setMod(id, v)`. `clean(v)` must validate it.
  - Navigation: `data-jump="tab:<tabId>"`, or a module's own kind such as `kb:<articleId>`, `diy:<jobId>`, `tree:<id>`, `tsb:<id>`, `story:<id>`, `ask:<text>`.
- `src/js/modules/live.js` is generated. Edit `tools/gen/live_extra.js` or `tools/gen/mklive.py`, then run `python3 tools/gen/mklive.py`. It ports `src/link-legacy.html` (the original V60 Link). Element ids are prefixed `lk-`.
- To add a feature: create `src/js/modules/<name>.js`, add it to `MODULES` in `tools/build.py`, and put its styles in `src/css/modules.css`.

## Build, test, deploy
- Build: `python3 tools/build.py`. It writes the root files and `dist-artifact/`, and bumps the service worker version so installed apps show "Update available".
- Tests (Playwright):
  `PLAYWRIGHT_PATH=/opt/npm-tools/node_modules/playwright CHROMIUM_PATH=/opt/pw-browsers/chromium node tests/regression.js`
  This checks every tab on phone, desktop and dark: no errors, no horizontal overflow, no broken `tab:` jumps.
  `tests/features.js` exercises Live link (simulated car), Bulletins and Upgrades. Tests set `window.__V60_TEST = true`, which stops the story prologue from auto-playing.
- Look at screenshots in `tests/shots/` (gitignored) before calling UI work done.
- Deploy: commit to `main` as `bmcdoorz94 <kfitz719@gmail.com>` and push to https://github.com/bmcdoorz94/V60-Link. Pages serves https://bmcdoorz94.github.io/V60-Link/ (the path is case-sensitive).
- Claude artifact (only from a Claude session that has the Artifact tool): publish `dist-artifact/garage.html` with the `files` map from `dist-artifact/files.json` to https://claude.ai/artifact/9mpkZE2EzzU2UxWLbqTohR, with capabilities `{"db":{},"user":{},"sample":{"images":true},"downloads":true,"assets":{}}`. Web Bluetooth doesn't work inside artifacts.

## UI
- Design tokens are in `src/css/app.css` (`--bg`, `--panel`, `--ink`, `--accent`, `--teal`, `--hl` highlighter). Display and numbers use Saira; body text uses Atkinson Hyperlegible Next. Light and dark themes are both required.
- Phone first: 390 px wide with no sideways scroll. Bottom bar on phone, side rail on desktop.
- With every feature, re-check that its screen isn't crowded. Move secondary material into `<details>`, and prefer one clear next action per card.
- Toggle groups use `.seg` with `aria-pressed`. Pills are `ok`, `watch`, `concern`/`bad`, and `info`/`none`.
