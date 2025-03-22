document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on YouTube
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentTab = tabs[0];
    const isYouTube = currentTab.url.includes('youtube.com');
    const isVideoPage = currentTab.url.includes('watch?v=');
    
    // Show/hide appropriate elements
    document.getElementById('not-youtube').style.display = isYouTube ? 'none' : 'block';
    document.getElementById('youtube-controls').style.display = isYouTube ? 'block' : 'none';
    
    if (isYouTube) {
      document.getElementById('on-video-page').style.display = isVideoPage ? 'block' : 'none';
      document.getElementById('not-on-video').style.display = isVideoPage ? 'none' : 'block';
    }
  });
  
  // Load saved quality preference
  chrome.storage.sync.get('preferredQuality', function(data) {
    if (data.preferredQuality) {
      document.getElementById('quality').value = data.preferredQuality;
    }
  });
  
  // Save button click handler
  document.getElementById('save').addEventListener('click', function() {
    const quality = document.getElementById('quality').value;
    
    // Save to Chrome storage
    chrome.storage.sync.set({
      'preferredQuality': quality
    }, function() {
      // Update status to let user know preference was saved
      const status = document.getElementById('status');
      status.textContent = 'Quality preference saved!';
      
      // Send message to content script to update quality on current page
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0] && tabs[0].url.includes('youtube.com')) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'setQuality',
            quality: quality
          });
        }
      });
      
      // Clear status message after a delay
      setTimeout(function() {
        status.textContent = '';
      }, 2000);
    });
  });
});