function applyQualityOnce(q) {
  const player = document.getElementById('movie_player');
  if (!player || typeof player.setPlaybackQuality !== 'function') return false;

  try {
    const current = player.getPlaybackQuality?.();
    if (current === q) return true; // already correct

    if (typeof player.setPlaybackQualityRange === 'function') {
      player.setPlaybackQualityRange(q, q);
    }
    player.setPlaybackQuality(q);
    return true;
  } catch {
    return false;
  }
}

function ensureQuality(quality, retries = 20, delay = 500) {
  let count = 0;
  const id = setInterval(() => {
    count++;
    if (applyQualityOnce(quality) || count >= retries) clearInterval(id);
  }, delay);
}

// Called both on first load and after SPA navigations
function runQualityEnforcer(quality) {
  if (!quality) return;
  ensureQuality(quality);
}

window.addEventListener('yt-quality-apply', (e) => {
  runQualityEnforcer(e.detail);
});

// Detect navigation inside YouTube (SPA)
window.addEventListener('yt-navigate-finish', () => {
  const lastEvent = window._yt_last_quality_event;
  if (lastEvent) {
    setTimeout(() => runQualityEnforcer(lastEvent), 400);
  }
});

// Remember last used quality
window.addEventListener('yt-quality-apply', (e) => {
  window._yt_last_quality_event = e.detail;
});
