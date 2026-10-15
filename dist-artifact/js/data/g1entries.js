/* Study entries for the G1 task list (data/g1tasks.js), written area by area from fetched sources only.
   V60_G1_ENTRIES[taskId] = { body: [lines], car: "how it applies to the V60" | null, src: [[title, url], ...],
     qs: [{ q, o: [4 options], a: index, why, src: [title, url] }, ...] }
   A task with no entry yet shows "No sourced entry yet" in the app. Never write an entry from memory: fetch the source first.
   Merge researched entries with tools/gen/g1merge.py; it validates ids, sources and questions. */
window.V60_G1_ENTRIES = {};
