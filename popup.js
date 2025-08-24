const sel = document.getElementById('res');

// Load stored value
chrome.storage.sync.get('ytQuality', (data) => {
  if (data.ytQuality) sel.value = data.ytQuality;
});

// Save + broadcast on change
sel.addEventListener('change', () => {
  const value = sel.value;
  chrome.storage.sync.set({ ytQuality: value }, () => {
    chrome.runtime.sendMessage({ type: 'qualityChanged', value });
  });
});
