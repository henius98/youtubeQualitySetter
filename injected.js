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

window.addEventListener('yt-quality-apply', (e) => {
  const quality = e.detail;

  let attempts = 0;
  const timer = setInterval(() => {
    attempts++;
    if (applyQualityOnce(quality) || attempts > 10) {
      clearInterval(timer);
    }
  }, 500); // retry every 500ms up to ~5s
});
