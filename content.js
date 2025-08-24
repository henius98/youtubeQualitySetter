// Inject into page context
(function inject() {
  const s = document.createElement('script');
  s.src = chrome.runtime.getURL('injected.js');
  (document.documentElement || document.head || document.body).appendChild(s);
  s.onload = () => s.remove();
})();

// On first load, request quality from background
chrome.runtime.sendMessage({ type: 'getQuality' }, (q) => {
  window.dispatchEvent(new CustomEvent('yt-quality-apply', { detail: q }));
});

// If popup changed, background pushes to us
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'applyQuality') {
    window.dispatchEvent(new CustomEvent('yt-quality-apply', { detail: msg.value }));
  }
});
