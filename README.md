# SwiftPlay - Video Speed Controller

A Chrome extension that enhances video watching by providing intuitive speed controls across various streaming platforms. Simply hold down your mouse button to speed up any video - release to return to normal speed.

## Overview

SwiftPlay is built to be lightweight and efficient, using native JavaScript and Chrome Extension APIs. It features:

- Hold-to-speed functionality for instant speed control
- Smart platform detection for site-specific optimizations
- Configurable speed settings (0.1x to 16x)
- Automatic disabling on sites with built-in speed controls

## Implementation Details

### Core Components

1. **Content Script (`content.js`)**
   - Implements the core speed control logic using `playbackRate` API
   - Uses `WeakMap` for memory-efficient storage of original playback rates
   - Implements platform-specific optimizations for sites like TikTok
   - Uses `MutationObserver` to handle dynamically loaded video elements

2. **Popup Interface (`popup.js`, `popup.html`)**
   - Manages user settings and preferences
   - Provides quick-access speed presets (2x, 3x, 4x)
   - Handles disabled sites list management
   - Uses Chrome's Storage API for settings persistence

3. **Speed Control Logic**
```javascript
// Core speed control implementation
function handleSpeedChange(media) {
    if (isTikTok() || isCurrentSiteDisabled()) return;
    media.playbackRate = isMouseDown ? settings.targetSpeed : originalRates.get(media);
}
```

### Key Features

#### Platform-Specific Optimizations
- Custom implementation for TikTok's video player
- Automatic detection and handling of different video platforms
- Smart disabling on sites with native speed controls

#### Speed Indicator
- Visual feedback showing current playback speed
- Automatically positions itself over video elements
- Smooth fade animations for better UX

#### Settings Management
- Persistent storage using Chrome's Storage API
- Site blacklist management
- Customizable speed presets
- Global enable/disable toggle

## Installation

### For Users
1. Install from the [Chrome Web Store](https://chrome.google.com/webstore/detail/YOUR_EXTENSION_ID)
2. Click the extension icon to configure settings
3. Hold left mouse button on any video to speed up playback

### For Developers
1. Clone this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension directory

## Configuration

### Default Settings
```javascript
{
    enabled: true,
    showIndicator: true,
    targetSpeed: 2.0,
    disabledSites: [
        'youtube.com',
        'netflix.com',
        'udemy.com',
        'coursera.org',
        'linkedin.com/learning'
    ]
}
```

### Supported Sites
- TikTok (optimized implementation)
- Instagram
- Facebook
- Twitter
- Netflix
- Amazon Prime
- Disney+
- And most sites with HTML5 video players

## Technical Notes

- Uses ES6+ features for modern JavaScript implementation
- Implements efficient memory management using WeakMap
- Handles both mouse events and touch events
- Preserves original playback rates when toggling speeds
- Uses event delegation for better performance
- Implements debouncing for performance-critical operations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
