"""Cipher hooks for Live link: raw adapter labels stay raw until decoded in the Codebook (story.js owns window.V60_CB).
Applied by mklive.py to the legacy V60 Link script. Each replacement must match exactly once."""

PAIRS = [
    ('"> " + esc(p.n) + (ok ? "" : " (not supported)") + "</label>";',
     '"> " + cbl("pid:" + hex2(p.pid), p.n) + (ok ? "" : " (not supported)") + "</label>";'),
    ("'<div class=\"tile\"><div class=\"k\">' + esc(p.n) + '</div>",
     "'<div class=\"tile\"><div class=\"k\">' + cbl(\"pid:\" + hex2(p.pid), p.n) + '</div>"),
    ("\"<div><span>\" + esc(m.n) + '</span>",
     "\"<div><span>\" + cbl(\"mon:\" + m.n, m.n) + '</span>"),
    ("esc(CODE_HINTS[c.code] || \"Look this code up in V60 Garage's Diagnose tab.\")",
     "(window.V60_CB ? window.V60_CB.codeHint(c.code, CODE_HINTS[c.code] || \"Look this code up in V60 Garage's Diagnose tab.\") : esc(CODE_HINTS[c.code] || \"Look this code up in V60 Garage's Diagnose tab.\"))"),
    ("  function hex2(n) {",
     "  function cbl(k, name) { return window.V60_CB ? window.V60_CB.label(k, name) : esc(name); }\n  function hex2(n) {"),
]

def apply(s):
    for old, new in PAIRS:
        n = s.count(old)
        if n != 1:
            raise SystemExit("cipher hook did not match exactly once (%d): %s" % (n, old[:70]))
        s = s.replace(old, new)
    return s
