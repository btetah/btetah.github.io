(function () {
  const api = window.installerApp;
  const nextBtn = document.getElementById('next-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const minBtn = document.getElementById('win-min');
  const maxBtn = document.getElementById('win-max');
  const closeBtn = document.getElementById('win-close');

  if (!api) {
    return;
  }

  nextBtn?.addEventListener('click', async () => {
    nextBtn.disabled = true;
    nextBtn.textContent = 'Launching...';
    try {
      await api.launchSimulator();
    } catch (err) {
      nextBtn.disabled = false;
      nextBtn.textContent = 'Next >';
      console.error('Failed to launch simulator', err);
    }
  });

  cancelBtn?.addEventListener('click', () => {
    api.close();
  });

  minBtn?.addEventListener('click', () => {
    api.minimize();
  });

  maxBtn?.addEventListener('click', async () => {
    const result = await api.toggleMaximize();
    maxBtn.textContent = result && result.maximized ? '❐' : '[]';
  });

  closeBtn?.addEventListener('click', () => {
    api.close();
  });
})();
