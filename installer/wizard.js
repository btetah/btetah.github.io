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

  const progressFill = document.getElementById('progress-fill');
  const progressPct = document.getElementById('progress-pct');
  const progressTrack = document.querySelector('.progress-track');

  // Simulate loading sequence
  let progress = 0;
  const loadingInterval = setInterval(() => {
    progress += Math.random() * 3 + 1; // Increase by 1 to 4 percent
    if (progress >= 100) {
      progress = 100;
      clearInterval(loadingInterval);
      
      if (nextBtn) {
        nextBtn.disabled = false;
        nextBtn.classList.remove('dim');
        nextBtn.classList.add('neon');
      }
      
      const progressText = document.querySelector('.progress-text');
      if (progressText) {
        progressText.innerHTML = `Installation complete! <strong id="progress-pct">(100%)</strong>`;
      }
    }
    
    if (progressFill) progressFill.style.width = `${progress}%`;
    if (progressPct) progressPct.textContent = `(${Math.floor(progress)}%)`;
    if (progressTrack) progressTrack.setAttribute('aria-valuenow', Math.floor(progress));
  }, 250); // Updates every 250ms for a smoother, slower load

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
