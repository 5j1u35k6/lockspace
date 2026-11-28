export function withDeadline(promise, ms = 12000) {
  let timer;
  return Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('connection-timeout')), ms); })]).finally(() => clearTimeout(timer));
}
export function createAdminLogin({ auth, signIn, signOut, checkAccess, showLogin, showDashboard, showError, setStatus, setBusy, setRetry, deadline = withDeadline }) {
  let attempt = null, revision = 0;
  async function verify(user) {
    const current = ++revision;
    if (!user) { showLogin(); setBusy(Boolean(attempt)); if (!attempt) setStatus(''); return; }
    showLogin(); setRetry(false); setBusy(true); setStatus('正在確認管理權限…');
    try {
      const allowed = await deadline(checkAccess(user));
      if (current !== revision || auth.currentUser?.uid !== user.uid) return;
      if (!allowed) { showError('這個帳號沒有管理權限。'); await signOut(); return; }
      setStatus(''); setRetry(false); showDashboard();
    } catch (error) {
      if (current !== revision || auth.currentUser?.uid !== user.uid) return;
      showError('管理權限暫時無法確認。登入仍保留，請重試。');
      setStatus(''); setRetry(true);
    } finally { if (current === revision) setBusy(false); }
  }
  async function submit(account, password) {
    if (attempt) { setStatus('上一個登入要求仍在確認，請稍候。'); return; }
    showError(''); setRetry(false); setBusy(true); setStatus('正在登入…');
    attempt = Promise.resolve().then(() => signIn(account, password));
    const pending = attempt;
    // Timeout does not cancel Firebase. Keep the lock until the original request settles.
    pending.then(() => { if (attempt === pending) attempt = null; }, () => { if (attempt === pending) attempt = null; setBusy(false); });
    try { await deadline(pending); }
    catch (error) {
      const slow = error.message === 'connection-timeout';
      showError(slow ? '連線比平常久，登入結果仍在確認。請稍候或重新載入。'
        : error.code === 'auth/network-request-failed' ? '網路連線失敗，請恢復連線後重試。'
        : error.code === 'auth/too-many-requests' ? '嘗試次數較多，請稍候再登入。' : '帳號或密碼不正確，請檢查後重試。');
      setStatus(slow ? '仍在確認登入…' : '');
      if (!slow) setBusy(false);
    }
  }
  return { verify, submit };
}
