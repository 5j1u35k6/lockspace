// One account only; no credentials, birth proof, private profile or review decisions.
const KEY = 'lockspace-return-v1';
const TTL = 6 * 60 * 60 * 1000;
export function clearReturnCache() {
  try { localStorage.removeItem(KEY); } catch {}
}
export function readReturnCache(uid) {
  try {
    const cached = JSON.parse(localStorage.getItem(KEY));
    if (!cached || cached.member?.uid !== uid || !cached.member.profile ||
        !Array.isArray(cached.posts) || !Number.isFinite(cached.savedAt) ||
        Date.now() - cached.savedAt >= TTL || cached.savedAt > Date.now()) {
      clearReturnCache();
      return null;
    }
    return cached;
  } catch { clearReturnCache(); return null; }
}
export function writeReturnCache(member, posts) {
  if (!member?.uid) return;
  try {
    const snapshot = { savedAt: Date.now(), member: {
      uid: member.uid, account: member.account || '',
      profile: { displayName: member.profile?.displayName || '' }
    }, posts: posts.slice(0, 5) };
    let value = JSON.stringify(snapshot);
    while (value.length > 2000000 && snapshot.posts.length > 1) {
      snapshot.posts.pop();
      value = JSON.stringify(snapshot);
    }
    // Leave room for other preferences; storage failure must never break login.
    if (value.length > 2000000) { clearReturnCache(); return; }
    localStorage.setItem(KEY, value);
  } catch { clearReturnCache(); }
}
