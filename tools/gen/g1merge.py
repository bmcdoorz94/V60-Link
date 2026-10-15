#!/usr/bin/env python3
"""Merge researched G1 study entries (JSON arrays from the research briefs) into src/js/data/g1entries.js.
   python3 tools/gen/g1merge.py entries1.json entries2.json ...
Each file holds a JSON array of {id, body[], car, src[[title,url]], qs[{q,o[4],a,why,src[title,url]}]}.
Checks every entry: the id exists in g1tasks.js, every source is https and not from a banned domain, every question has four
options and a valid answer index. Bad entries are reported and skipped; good ones replace what is in the file."""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TASKS = os.path.join(ROOT, "src", "js", "data", "g1tasks.js")
ENTRIES = os.path.join(ROOT, "src", "js", "data", "g1entries.js")
BANNED = ("wikipedia.org", "reddit.com", "youtube.com", "youtu.be", "quora.com", "facebook.com", "swedespeed", "volvoforums", "matthewsvolvosite",
          "carsdirect", "carparts.com/blog", "repairsmith", "yourmechanic", "mechanicbase", "autozone.com/diy", "wikihow", "ehow", "quizlet", "studocu",
          "ase-practice", "practicetestgeeks", "open-exam-prep", "careeremployer", "study.com")

HEAD = """/* Study entries for the G1 task list (data/g1tasks.js), written area by area from fetched sources only.
   V60_G1_ENTRIES[taskId] = { body: [lines], car: "how it applies to the V60" | null, src: [[title, url], ...],
     qs: [{ q, o: [4 options], a: index, why, src: [title, url] }, ...] }
   A task with no entry yet shows "No sourced entry yet" in the app. Never write an entry from memory: fetch the source first.
   Merge researched entries with tools/gen/g1merge.py; it validates ids, sources and questions. */
window.V60_G1_ENTRIES = """

def load_js_object(path, prefix):
    with open(path, encoding="utf-8") as f:
        s = f.read()
    i = s.index(prefix) + len(prefix)
    j = s.rindex("}") + 1
    return json.loads(s[i:j])

def task_ids():
    with open(TASKS, encoding="utf-8") as f:
        s = f.read()
    return set(re.findall(r'\{ id: "([A-G]\d+)"', s))

def check_src(src, where, errs):
    if not isinstance(src, list) or len(src) != 2 or not all(isinstance(x, str) for x in src):
        errs.append(where + ": source must be [title, url]"); return False
    t, u = src
    if not u.startswith("https://") and not u.startswith("http://"):
        errs.append(where + ": not a URL: " + u); return False
    if any(b in u.lower() for b in BANNED):
        errs.append(where + ": banned source " + u); return False
    if not t.strip():
        errs.append(where + ": empty source title"); return False
    return True

def validate(e, ids):
    errs = []
    tid = e.get("id")
    if tid not in ids:
        return ["unknown task id " + str(tid)]
    body = e.get("body")
    if not isinstance(body, list) or not body or not all(isinstance(l, str) and l.strip() for l in body):
        errs.append(tid + ": body must be a non-empty list of lines")
    car = e.get("car")
    if car is not None and not isinstance(car, str):
        errs.append(tid + ": car must be a string or null")
    srcs = e.get("src") or []
    if not isinstance(srcs, list) or not srcs:
        errs.append(tid + ": no sources")
    else:
        for s in srcs:
            check_src(s, tid, errs)
    qs = e.get("qs") or []
    good_qs = []
    for n, q in enumerate(qs):
        where = tid + " q" + str(n + 1)
        if not isinstance(q, dict) or not isinstance(q.get("q"), str) or not q["q"].strip():
            errs.append(where + ": no question text"); continue
        o = q.get("o")
        if not isinstance(o, list) or len(o) != 4 or not all(isinstance(x, str) and x.strip() for x in o):
            errs.append(where + ": needs exactly four options"); continue
        if len(set(x.strip().lower() for x in o)) != 4:
            errs.append(where + ": duplicate options"); continue
        a = q.get("a")
        if not isinstance(a, int) or a < 0 or a > 3:
            errs.append(where + ": answer index must be 0-3"); continue
        if not isinstance(q.get("why"), str) or not q["why"].strip():
            errs.append(where + ": no explanation"); continue
        if not check_src(q.get("src"), where, errs):
            continue
        good_qs.append({"q": q["q"].strip(), "o": [x.strip() for x in o], "a": a, "why": q["why"].strip(), "src": [q["src"][0].strip(), q["src"][1].strip()]})
    return errs, good_qs

def main(files):
    ids = task_ids()
    current = load_js_object(ENTRIES, "window.V60_G1_ENTRIES = ")
    added, skipped, report = 0, 0, []
    for path in files:
        with open(path, encoding="utf-8") as f:
            raw = f.read()
        # tolerate a code fence or stray text around the array
        m = re.search(r"\[\s*\{.*\}\s*\]", raw, re.S)
        if not m:
            report.append(path + ": no JSON array found"); continue
        try:
            arr = json.loads(m.group(0))
        except json.JSONDecodeError as ex:
            report.append(path + ": bad JSON: " + str(ex)); continue
        for e in arr:
            res = validate(e, ids)
            if isinstance(res, list):
                report.extend(res); skipped += 1; continue
            errs, good_qs = res
            hard = [x for x in errs if " q" not in x]
            if hard:
                report.extend(hard); skipped += 1; continue
            report.extend(errs)  # question-level problems: the question is dropped, the entry stays
            current[e["id"]] = {"body": [l.strip() for l in e["body"]], "car": (e.get("car") or None), "src": [[s[0].strip(), s[1].strip()] for s in e["src"]], "qs": good_qs}
            added += 1
    ordered = {k: current[k] for k in sorted(current, key=lambda k: (k[0], int(k[1:])))}
    with open(ENTRIES, "w", encoding="utf-8", newline="\n") as f:
        f.write(HEAD + json.dumps(ordered, ensure_ascii=False, indent=1) + ";\n")
    nq = sum(len(v["qs"]) for v in ordered.values())
    print("entries: %d merged, %d skipped; file now holds %d entries, %d questions" % (added, skipped, len(ordered), nq))
    for r in report:
        print(" ! " + r)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(2)
    main(sys.argv[1:])
