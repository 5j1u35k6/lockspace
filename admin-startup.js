(() => {
  const status = document.getElementById('adminLoginStatus');
  const reload = document.getElementById('reloadLogin');
  reload.addEventListener('click', () => location.reload());
  const timer = setTimeout(() => { status.textContent = '連線較慢，登入功能尚未準備好。請重新載入再試。'; reload.classList.remove('hidden'); }, 12000);
  window.addEventListener('lockspace-admin-ready', event => {
    clearTimeout(timer);
    if (event.detail?.failed) { status.textContent = '無法準備登入，請重新載入再試。'; reload.classList.remove('hidden'); return; }
    status.textContent = '';
    const button = document.querySelector('#loginForm button[type=submit]');
    button.disabled = false; button.textContent = '登入';
    // Translation is optional and must not block login event handlers.
    (async () => {
      for (const src of ['i18n-ui-1.js', 'i18n-ui-2.js', 'i18n-ui-3.js', 'i18n-ui-4.js', 'i18n-content.js']) {
        await new Promise((resolve, reject) => { const script = document.createElement('script'); script.src = src; script.onload = resolve; script.onerror = reject; document.head.append(script); });
      }
      window.LockspaceI18n?.init();
    })().catch(() => console.warn('Optional language resources could not load.'));
  }, { once: true });
})();
