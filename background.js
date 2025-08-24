let currentQuality = "hd1080";

// Load stored value at startup
chrome.storage.sync.get('ytQuality', (data) => {
  if (data.ytQuality) currentQuality = data.ytQuality;
});

// Listen for popup updates
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'qualityChanged') {
    currentQuality = msg.value;
    // Push new quality to all YouTube tabs and apply immediately
    chrome.tabs.query({ url: "*://www.youtube.com/*" }, (tabs) => {
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, { type: 'applyQuality', value: currentQuality });
      }
    });
  }
});

// Answer when a tab asks the current quality
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'getQuality') {
    sendResponse(currentQuality);
  }
});
