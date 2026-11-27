// Keep the public introduction usable even when the external SDK is slow or unavailable.
(() => {
  try { document.body.classList.toggle('returning-visitor', localStorage.getItem('lockspace-returning-member') === 'true'); } catch {}
  const status = document.getElementById('startupStatus');
  const retry = document.getElementById('retryStartup');
  retry.addEventListener('click', () => location.reload());
  const timer = setTimeout(() => {
    status.textContent = '連線比平常久。你可以先了解玩法，或重新載入再試一次。';
    retry.classList.remove('hidden');
  }, 12000);
  window.addEventListener('lockspace-ready', () => {
    clearTimeout(timer);
    status.classList.add('hidden');
    retry.classList.add('hidden');
    document.querySelectorAll('[data-startup-control]').forEach(control => { control.disabled = false; });
  }, { once: true });
})();
