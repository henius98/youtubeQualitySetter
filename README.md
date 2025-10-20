# YouTube Auto-Resolution

Automatically sets YouTube video quality to your preferred resolution on first load and on every navigation inside YouTube.

---

## 🧩 Features
- Automatically applies your chosen playback quality (e.g., 1080p, 720p).
- Works on all YouTube video pages.
- Detects SPA navigations (`yt-navigate-finish`).
- Lightweight and idle when not needed.
- Persistent quality setting via Chrome storage.

---

## ⚙️ Installation (Developer Mode)

1. Clone or download this repository.
```bash
git clone https://github.com/henius98/youtubeQualitySetter.git
```
2. Open Chrome Extensions page.
3. Enable Developer mode (toggle in the top-right corner).
4. Click Load unpacked and select the cloned project folder.
5. The extension icon will appear in your Chrome toolbar.

## 📁 Project Structure
youtubeQualitySetter/
├── manifest.json          # Chrome extension manifest (v3)
├── background.js          # Handles global state and messaging
├── content.js             # Injects script into YouTube pages
├── injected.js            # Executes quality-setting logic inside YouTube
├── popup.html             # Popup interface
├── popup.js               # Popup logic
└── assets/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
