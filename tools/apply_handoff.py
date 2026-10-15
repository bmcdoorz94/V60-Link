#!/usr/bin/env python3
"""Apply a handoff Markdown file (from Gemini or Claude) to this repo.

Usage: python3 tools/apply_handoff.py HANDOFF.md [--dry-run]

- Every "### `path`" heading followed by a fenced code block is written to that path (full-file replacement).
- "### `path` (base64)" blocks are decoded as binary.
- Bullets under "## Deleted files" are removed.
- "## 1/2/3" sections replace docs/HANDOFF_STATE.md.
- "## Edits to apply" is printed for manual or Claude-applied find-and-replace; nothing there is applied automatically.
Paths must stay inside the repo; build outputs (index.html at root, js/, dist-artifact/, sw.js, link.html) are refused because tools/build.py owns them.
"""
import base64, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REFUSE = re.compile(r"^(index\.html|version\.json|app\.css|sw\.js|link\.html|manifest\.webmanifest|js/|dist-artifact/)")

def scan(md):
    """Walk the file line by line. Returns (files, outside) where files are (path, is_base64, body) for every
    '### `path`' heading followed by a fenced block, and outside is the text that is not inside any code block."""
    lines = md.split("\n")
    files, outside, i, pending = [], [], 0, None
    head = re.compile(r"^### `([^`]+)`( \(base64\))?")
    while i < len(lines):
        ln = lines[i]
        m = re.match(r"^(`{3,})", ln)
        if m:
            fence, body, i = m.group(1), [], i + 1
            while i < len(lines) and not (lines[i].startswith(fence) and lines[i].strip("`") == ""):
                body.append(lines[i]); i += 1
            if i >= len(lines): raise SystemExit("Unclosed code block" + (" for " + pending[0] if pending else ""))
            if pending:
                text = "\n".join(body)
                files.append((pending[0], pending[1], text if (pending[1] or not body) else text + "\n"))
                pending = None
            i += 1
            continue
        h = head.match(ln)
        if h: pending = (h.group(1), bool(h.group(2)))
        outside.append(ln); i += 1
    return files, "\n".join(outside)

def section(text, title):
    m = re.search(r"^## " + re.escape(title) + r"[^\n]*\n(.*?)(?=^## |\Z)", text, re.M | re.S)
    return m.group(0).strip() if m else None

def main():
    if len(sys.argv) < 2: raise SystemExit(__doc__)
    md = open(sys.argv[1], encoding="utf-8").read().replace("\r\n", "\n")
    dry = "--dry-run" in sys.argv
    changed, same, refused = [], [], []
    found, outside = scan(md)
    for path, b64, body in found:
        norm = os.path.normpath(path).replace(os.sep, "/")
        if norm.startswith("..") or os.path.isabs(norm) or REFUSE.match(norm):
            refused.append(path); continue
        if norm == "docs/HANDOFF_STATE.md": continue
        data = base64.b64decode("".join(body.split())) if b64 else body.encode("utf-8")
        fp = os.path.join(ROOT, norm)
        old = open(fp, "rb").read() if os.path.isfile(fp) else None
        if old == data: same.append(norm); continue
        changed.append((norm, "new" if old is None else "%+d bytes" % (len(data) - len(old))))
        if not dry:
            os.makedirs(os.path.dirname(fp) or ROOT, exist_ok=True)
            open(fp, "wb").write(data)
    deleted = []
    dsec = section(outside, "Deleted files")
    if dsec:
        for p in re.findall(r"^- `([^`]+)`", dsec, re.M):
            fp = os.path.join(ROOT, os.path.normpath(p))
            if os.path.isfile(fp) and not REFUSE.match(p):
                deleted.append(p)
                if not dry: os.remove(fp)
    parts = [section(outside, t) for t in ("1. Current Active Objective", "2. Immediate Next Steps", "3. Pending Logic & Blockers")]
    if all(parts) and not dry:
        open(os.path.join(ROOT, "docs", "HANDOFF_STATE.md"), "w", encoding="utf-8", newline="\n").write("\n\n".join(parts) + "\n")
    print(("DRY RUN: " if dry else "") + "%d changed, %d identical, %d refused, %d deleted" % (len(changed), len(same), len(refused), len(deleted)))
    for c in changed: print("  changed", c[0], c[1])
    for r in refused: print("  refused (build output or outside repo)", r)
    for d in deleted: print("  deleted", d)
    edits = section(md, "Edits to apply") if section(outside, "Edits to apply") else None
    if edits: print("\nManual edits requested:\n" + edits)
    if all(parts): print("Handoff state sections " + ("found" if dry else "written to docs/HANDOFF_STATE.md"))
    print("Next: python3 tools/build.py, then run the tests in CLAUDE.md.")

if __name__ == "__main__":
    main()
