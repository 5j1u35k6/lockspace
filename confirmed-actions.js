// A slow Firestore write is still pending, not a failure. Keep one write per key.
export function createWriteTracker({ notify = () => {}, slowAfter = 8000, setTimer = setTimeout, clearTimer = clearTimeout } = {}) {
  const records = new Map();
  function run(key, write, meta = {}) {
    const previous = records.get(key);
    if (previous && previous.status !== 'failed') return previous.promise;
    const entry = { status: 'pending', meta };
    records.set(key, entry);
    const publish = () => { if (records.get(key) === entry) notify(key, entry); };
    entry.timer = setTimer(() => { entry.status = 'slow'; publish(); }, slowAfter);
    entry.promise = Promise.resolve().then(write).then(value => {
      entry.status = 'confirmed'; return { ok: true, value };
    }, error => {
      entry.status = 'failed'; return { ok: false, error };
    }).then(result => { clearTimer(entry.timer); publish(); return result; });
    publish();
    return entry.promise;
  }
  return { run, get: key => records.get(key), clear() { for (const entry of records.values()) clearTimer(entry.timer); records.clear(); } };
}
