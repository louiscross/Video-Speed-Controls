document.addEventListener('DOMContentLoaded', async () => {
  const globalEnable = document.getElementById('globalEnable');
  const showIndicator = document.getElementById('showSpeedIndicator');
  const targetSpeed = document.getElementById('targetSpeed');
  const speedButtons = document.querySelectorAll('.speed-btn');
  const customSpeedContainer = document.querySelector('.custom-speed');
  const siteList = document.getElementById('siteList');
  const newSite = document.getElementById('newSite');
  const addSiteBtn = document.getElementById('addSite');

  // Common sites with built-in speed control
  const defaultDisabledSites = [
    'youtube.com',
    'netflix.com',
    'udemy.com',
    'coursera.org',
    'linkedin.com/learning'
  ];

  // Load saved settings
  const settings = await chrome.storage.sync.get({
    enabled: true,
    showIndicator: true,
    targetSpeed: 2.0,
    disabledSites: defaultDisabledSites,
    activeSpeedButton: '2'
  });

  globalEnable.checked = settings.enabled;
  showIndicator.checked = settings.showIndicator;
  targetSpeed.value = settings.targetSpeed;

  // Initialize speed buttons
  function updateSpeedButtons(activeSpeed) {
    speedButtons.forEach(btn => {
      const speed = btn.dataset.speed;
      btn.classList.toggle('active', speed === activeSpeed);
      if (speed === 'custom') {
        customSpeedContainer.style.display = activeSpeed === 'custom' ? 'flex' : 'none';
      }
    });
  }

  // Set initial active button
  updateSpeedButtons(settings.activeSpeedButton);

  // Handle speed button clicks
  speedButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const speed = btn.dataset.speed;
      if (speed === 'custom') {
        updateSpeedButtons('custom');
        chrome.storage.sync.set({ activeSpeedButton: 'custom' });
      } else {
        targetSpeed.value = speed;
        updateSpeedButtons(speed);
        chrome.storage.sync.set({ 
          targetSpeed: parseFloat(speed),
          activeSpeedButton: speed
        });
      }
    });
  });

  // Render site list with animation
  function renderSiteList(sites) {
    siteList.innerHTML = '';
    sites.forEach(site => {
      const item = document.createElement('div');
      item.className = 'site-item';
      item.innerHTML = `
        <span>${site}</span>
        <button class="remove-site" data-site="${site}">
          <i class="fas fa-times"></i>
        </button>
      `;
      siteList.appendChild(item);

      // Add fade-in animation
      item.style.opacity = '0';
      item.style.transform = 'translateY(10px)';
      item.style.transition = 'all 0.2s ease-out';
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, 10);
    });

    // Add remove button listeners
    document.querySelectorAll('.remove-site').forEach(button => {
      button.addEventListener('click', async () => {
        const site = button.dataset.site;
        const settings = await chrome.storage.sync.get({ disabledSites: [] });
        const updatedSites = settings.disabledSites.filter(s => s !== site);
        await chrome.storage.sync.set({ disabledSites: updatedSites });
        renderSiteList(updatedSites);
      });
    });
  }

  // Initial render
  renderSiteList(settings.disabledSites);

  // Add new site with validation
  addSiteBtn.addEventListener('click', async () => {
    const site = newSite.value.trim().toLowerCase();
    if (site) {
      const settings = await chrome.storage.sync.get({ disabledSites: [] });
      if (!settings.disabledSites.includes(site)) {
        const updatedSites = [...settings.disabledSites, site];
        await chrome.storage.sync.set({ disabledSites: updatedSites });
        renderSiteList(updatedSites);
        newSite.value = '';
        
        // Add success animation to button
        addSiteBtn.style.backgroundColor = 'var(--success-color)';
        setTimeout(() => {
          addSiteBtn.style.backgroundColor = '';
        }, 500);
      }
    }
  });

  // Enter key for adding sites
  newSite.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addSiteBtn.click();
    }
  });

  // Save settings when changed
  function saveSettings() {
    chrome.storage.sync.set({
      enabled: globalEnable.checked,
      showIndicator: showIndicator.checked,
      targetSpeed: parseFloat(targetSpeed.value)
    });
  }

  globalEnable.addEventListener('change', saveSettings);
  showIndicator.addEventListener('change', saveSettings);
  targetSpeed.addEventListener('change', () => {
    // Validate speed range
    const speed = parseFloat(targetSpeed.value);
    if (speed < 0.1) targetSpeed.value = 0.1;
    if (speed > 16) targetSpeed.value = 16;
    updateSpeedButtons('custom');
    chrome.storage.sync.set({ 
      targetSpeed: parseFloat(targetSpeed.value),
      activeSpeedButton: 'custom'
    });
  });
});
