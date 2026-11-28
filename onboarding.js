const STEPS = [
  { title: '完成你的第一個任務', entry: '首頁 → 查看今日任務', body: '先閱讀任務條件，再決定是否參加。完成後，在任務頁選擇照片、確認分享同意，送出驗證。任何任務都可以選擇不參加。', action: '查看今日任務', icon: '↗' },
  { title: '你的點子，也能成為任務', entry: '首頁 → 提出任務點子', body: '寫下想讓大家挑戰的內容，送出後可在「我的提案」查看狀態。審核通過的提案才會加入任務池。', action: '提出任務點子', icon: '＋' },
  { title: '點頭像，認識分享者', entry: '最新驗證動態 → 頭像或名字', body: '點擊每筆紀錄上方的頭像或名字，就能查看對方的公開個人資料。私人資料不會出現在這裡。', action: '頭像 · 會員名稱', icon: '◎' },
  { title: '一起參與任務驗證', entry: '其他會員的紀錄 → 符合條件／不符合條件', body: '先看清楚任務條件與照片，再選擇「符合條件」或「不符合條件」。自己的紀錄不能自行驗證；若發現違規內容，可使用「檢舉此任務」。', action: '符合條件　／　不符合條件', icon: '✓' },
  { title: '隨時更新自己的資料', entry: '右上角「我的帳號」→ 編輯公開檔案', body: '在這裡修改會員資料。之後想再看操作說明，也能從「我的帳號」開啟「新手引導」。', action: '我的帳號 → 編輯公開檔案', icon: '☰' }
];
export function createOnboarding({ dialog, getUid, storage = localStorage }) {
  let uid = null, step = 0;
  const key = value => `lockspace-guide-v1-${value}`;
  const read = value => { try { return JSON.parse(storage.getItem(key(value))); } catch { return null; } };
  const save = status => { try { storage.setItem(key(uid), JSON.stringify({ status, step })); } catch {} };
  const title = dialog.querySelector('[data-guide-title]'), body = dialog.querySelector('[data-guide-body]');
  const previous = dialog.querySelector('[data-guide-back]'), next = dialog.querySelector('[data-guide-next]');
  function render() {
    const current = STEPS[step];
    title.textContent = current.title; body.textContent = current.body;
    dialog.querySelector('[data-guide-progress]').textContent = `${step + 1} / ${STEPS.length}`;
    dialog.querySelector('[data-guide-entry]').textContent = current.entry;
    dialog.querySelector('[data-guide-example]').textContent = current.action;
    dialog.querySelector('[data-guide-icon]').textContent = current.icon;
    previous.disabled = step === 0; next.textContent = step === STEPS.length - 1 ? '開始使用' : '下一步';
    save('active');
  }
  function close(status) { if (uid) save(status); if (dialog.open) dialog.close(); }
  function start(value = getUid(), resume = false) {
    if (!value || value !== getUid()) return;
    uid = value;
    const saved = read(uid);
    step = resume && Number.isInteger(saved?.step) ? Math.max(0, Math.min(STEPS.length - 1, saved.step)) : 0;
    render(); if (!dialog.open) dialog.showModal(); title.focus();
  }
  previous.addEventListener('click', () => { if (step > 0) { step--; render(); title.focus(); } });
  next.addEventListener('click', () => { if (step === STEPS.length - 1) close('done'); else { step++; render(); title.focus(); } });
  dialog.querySelector('[data-guide-skip]').addEventListener('click', () => close('dismissed'));
  dialog.addEventListener('cancel', event => { event.preventDefault(); close('dismissed'); });
  return { start, resume() { const value = getUid(); if (value && !dialog.open && read(value)?.status === 'active') start(value, true); }, reset() { if (dialog.open) dialog.close(); uid = null; } };
}
