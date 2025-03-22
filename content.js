let lastUrl = location.href;
let preferredQuality = 'auto';
let videoPlayer = null;
let qualityObserver = null;

// Load preferred quality from storage
chrome.storage.sync.get('preferredQuality', function(data) {
  if (data.preferredQuality) {
    preferredQuality = data.preferredQuality;
    
    // If we're already on a YouTube video page, set the quality
    if (location.href.includes('watch?v=')) {
      initQualitySetter();
    }
  }
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'setQuality') {
    preferredQuality = request.quality;
    
    // If we're already on a YouTube video page, set the quality
    if (location.href.includes('watch?v=')) {
      initQualitySetter();
    }
  }
});

// Initialize the quality setter
function initQualitySetter() {
  // Wait for video player to be available
  if (document.querySelector('video')) {
    videoPlayer = document.querySelector('video');
    setupQualityChangeMonitoring();
    
    // Initial attempt to set quality
    setVideoQuality();
  } else {
    // If video element isn't ready, try again shortly
    setTimeout(initQualitySetter, 500);
  }
}

// Set up a MutationObserver to detect when YouTube changes video quality
function setupQualityChangeMonitoring() {
  // If we already have an observer, disconnect it
  if (qualityObserver) {
    qualityObserver.disconnect();
  }
  
  // Create a new observer to monitor for quality changes
  qualityObserver = new MutationObserver(function(mutations) {
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && 
          mutation.target.classList && 
          mutation.target.classList.contains('html5-video-player')) {
        // When player state changes, check if quality needs to be adjusted
        setTimeout(setVideoQuality, 500);
      }
    }
  });
  
  // Start observing the video player for changes
  const playerElement = document.querySelector('.html5-video-player');
  if (playerElement) {
    qualityObserver.observe(playerElement, { 
      childList: true, 
      subtree: true 
    });
  }
}

// Function to directly set video quality using YouTube's API
function setVideoQuality() {
  if (preferredQuality === 'auto') return;
  
  // Use YouTube's player API if available
  if (typeof document.querySelector('.html5-video-player') !== 'undefined' && 
      document.querySelector('.html5-video-player').__proto__.getAvailableQualityLevels) {
    
    // Get the player object
    const player = document.querySelector('.html5-video-player');
    
    // Get available quality levels
    const availableQualities = player.__proto__.getAvailableQualityLevels.call(player);
    
    // Convert our preferred quality to YouTube's format
    const qualityMapping = {
      '2160p': 'hd2160',
      '1440p': 'hd1440',
      '1080p': 'hd1080',
      '720p': 'hd720',
      '480p': 'large',
      '360p': 'medium',
      '240p': 'small',
      '144p': 'tiny'
    };
    
    const targetQuality = qualityMapping[preferredQuality];
    
    // Set the quality if available
    if (targetQuality && availableQualities.includes(targetQuality)) {
      player.__proto__.setPlaybackQuality.call(player, targetQuality);
    }
  } else {
    // Fallback to using YouTube's quality menu via DOM
    useQualityMenuFallback();
  }
}

// Fallback method using the quality menu
function useQualityMenuFallback() {
  // This function will run invisibly in the background
  
  // Get settings button
  const settingsButton = document.querySelector('.ytp-settings-button');
  if (!settingsButton) return;
  
  // Click settings button programmatically
  const clickEvent = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window
  });
  settingsButton.dispatchEvent(clickEvent);
  
  // Look for quality menu item and click it
  setTimeout(() => {
    const menuItems = document.querySelectorAll('.ytp-menuitem');
    let qualityMenuItem = null;
    
    for (const item of menuItems) {
      if (item.textContent.includes('Quality')) {
        qualityMenuItem = item;
        break;
      }
    }
    
    if (!qualityMenuItem) {
      // Close settings menu
      settingsButton.dispatchEvent(clickEvent);
      return;
    }
    
    // Click on quality menu item
    qualityMenuItem.dispatchEvent(clickEvent);
    
    // Select the desired resolution
    setTimeout(() => {
      const qualityOptions = document.querySelectorAll('.ytp-menuitem');
      let targetOption = null;
      
      for (const option of qualityOptions) {
        if (option.textContent.includes(preferredQuality)) {
          targetOption = option;
          break;
        }
      }
      
      if (targetOption) {
        // Click on the target quality option
        targetOption.dispatchEvent(clickEvent);
      } else {
        // Close menus if target quality not found
        settingsButton.dispatchEvent(clickEvent);
      }
    }, 100);
  }, 100);
}

// Create status display
function createStatusDisplay() {
  // Remove existing status display if present
  const existingDisplay = document.getElementById('yt-quality-setter-status');
  if (existingDisplay) {
    existingDisplay.remove();
  }
  
  // Create status element
  const statusDisplay = document.createElement('div');
  statusDisplay.id = 'yt-quality-setter-status';
  statusDisplay.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 5px 10px;
    border-radius: 3px;
    font-size: 12px;
    z-index: 9999;
    transition: opacity 0.5s;
    opacity: 0;
  `;
  statusDisplay.textContent = `Quality set to: ${preferredQuality}`;
  
  // Add to video container
  const videoContainer = document.querySelector('.html5-video-player');
  if (videoContainer) {
    videoContainer.appendChild(statusDisplay);
    
    // Fade in
    setTimeout(() => {
      statusDisplay.style.opacity = '1';
      
      // Fade out after 3 seconds
      setTimeout(() => {
        statusDisplay.style.opacity = '0';
        
        // Remove after fade out
        setTimeout(() => {
          statusDisplay.remove();
        }, 500);
      }, 3000);
    }, 100);
  }
}

// Watch for YouTube navigation (SPA navigation)
setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    
    // Reset observer when navigating
    if (qualityObserver) {
      qualityObserver.disconnect();
      qualityObserver = null;
    }
    
    // If navigated to a video page, set up quality setter
    if (location.href.includes('watch?v=')) {
      // Wait for video player to load
      setTimeout(initQualitySetter, 1000);
    }
  }
}, 1000);

// Also listen for YouTube's own navigation events
document.addEventListener('yt-navigate-finish', function() {
  if (location.href.includes('watch?v=')) {
    setTimeout(initQualitySetter, 1000);
  }
});

// Listen for video play events to ensure quality is set
document.addEventListener('play', function(e) {
  if (e.target.tagName === 'VIDEO' && location.href.includes('watch?v=')) {
    // Set quality when video starts playing
    setVideoQuality();
    // Show status indicator
    setTimeout(createStatusDisplay, 1000);
  }
}, true);