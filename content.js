// Store original playback rates and settings
let originalRates = new WeakMap();
let isMouseDown = false;
let settings = {
    enabled: true,
    showIndicator: true,
    targetSpeed: 2.0,
    disabledSites: []
};

// Check if current site is TikTok
function isTikTok() {
    return window.location.hostname.includes('tiktok.com');
}

// Check if current site should be disabled
function isCurrentSiteDisabled() {
    if (isTikTok()) return false; // Never disable on TikTok
    const currentDomain = window.location.hostname.toLowerCase();
    return settings.disabledSites.some(site => 
        currentDomain === site || currentDomain.endsWith('.' + site)
    );
}

// Load settings from storage
chrome.storage.sync.get({
    enabled: true,
    showIndicator: true,
    targetSpeed: 2.0,
    disabledSites: []
}, (result) => {
    settings = result;
    if (isTikTok()) {
        initializeTikTok();
    }
});

// Listen for settings changes
chrome.storage.onChanged.addListener((changes) => {
    for (let key in changes) {
        settings[key] = changes[key].newValue;
    }
    // Update all media elements when settings change
    if (!isTikTok()) {
        document.querySelectorAll('video, audio').forEach(media => {
            if (!isMouseDown) {
                handleSpeedChange(media);
            }
        });
    }
});

// Platform-specific implementation for short-form video sites
function initializeTikTok() {
    if (!settings.enabled) return;

    const speedDisplay = document.createElement('div');
    speedDisplay.className = 'speed-indicator';
    speedDisplay.style.position = 'absolute';
    speedDisplay.style.zIndex = '9999';
    speedDisplay.style.left = '50%';
    speedDisplay.style.top = '20px';
    speedDisplay.style.transform = 'translateX(-50%)';
    speedDisplay.textContent = `${settings.targetSpeed.toFixed(1)}x`;
    
    let activeVideo = null;
    let pressStartTime = 0;
    const HOLD_DURATION = 300;

    // Monitor for video player presence
    const videoObserver = new MutationObserver((mutations, observer) => {
        const videoElement = document.querySelector('[id^="xgwrapper"] video');
        if (videoElement && videoElement !== activeVideo) {
            activeVideo = videoElement;
            setupVideoControls();
        }
    });

    videoObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    function setupVideoControls() {
        if (!activeVideo) return;

        const handleMouseDown = (event) => {
            if (event.button !== 0) return; // Left click only
            
            const videoRect = activeVideo.getBoundingClientRect();
            const isInsideVideo = (
                event.clientX >= videoRect.left && 
                event.clientX <= videoRect.right &&
                event.clientY >= videoRect.top && 
                event.clientY <= videoRect.bottom
            );

            if (isInsideVideo) {
                isMouseDown = true;
                pressStartTime = Date.now();
            }
        };

        const handleMouseUp = (event) => {
            if (event.button === 0) {
                isMouseDown = false;
                pressStartTime = 0;
                if (activeVideo && activeVideo.parentNode.contains(speedDisplay)) {
                    speedDisplay.className = 'speed-indicator';
                }
            }
        };

        const updatePlaybackSpeed = () => {
            if (!activeVideo) return;

            if (isMouseDown) {
                const holdTime = Date.now() - pressStartTime;
                if (holdTime >= HOLD_DURATION) {
                    activeVideo.playbackRate = settings.targetSpeed;
                    if (!activeVideo.paused && settings.showIndicator) {
                        speedDisplay.textContent = `${settings.targetSpeed.toFixed(1)}x`;
                        speedDisplay.className = 'speed-indicator visible';
                        if (!activeVideo.parentNode.contains(speedDisplay)) {
                            activeVideo.parentNode.appendChild(speedDisplay);
                        }
                    }
                }
            } else {
                activeVideo.playbackRate = 1.0;
            }
            requestAnimationFrame(updatePlaybackSpeed);
        };

        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mouseup', handleMouseUp);
        updatePlaybackSpeed();
    }

    // Initial check
    const initialVideo = document.querySelector('[id^="xgwrapper"] video');
    if (initialVideo) {
        activeVideo = initialVideo;
        setupVideoControls();
    }
}

// Regular implementation for non-TikTok sites
// Create and manage speed indicator
function createSpeedIndicator(media) {
    if (isTikTok()) return null;
    
    let indicator = media.parentElement.querySelector('.speed-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'speed-indicator';
        
        const parentPosition = window.getComputedStyle(media.parentElement).position;
        if (parentPosition === 'static') {
            media.parentElement.style.position = 'relative';
        }
        
        media.parentElement.appendChild(indicator);
    }
    return indicator;
}

// Function to handle speed changes for non-TikTok sites
function handleSpeedChange(media) {
    if (isTikTok() || isCurrentSiteDisabled()) return;
    
    if (!settings.enabled) {
        if (originalRates.has(media)) {
            media.playbackRate = originalRates.get(media);
        }
        return;
    }

    if (!originalRates.has(media)) {
        originalRates.set(media, media.playbackRate);
    }
    
    media.playbackRate = isMouseDown ? settings.targetSpeed : originalRates.get(media);
    
    if (settings.showIndicator) {
        const indicator = createSpeedIndicator(media);
        if (indicator) {
            indicator.textContent = `${media.playbackRate.toFixed(1)}x`;
            indicator.className = `speed-indicator ${isMouseDown ? 'visible' : ''}`;
        }
    }
}

// Initialize media elements for non-TikTok sites
function initializeMediaElements() {
    if (isTikTok() || isCurrentSiteDisabled()) return;
    
    const mediaElements = document.querySelectorAll('video, audio');
    mediaElements.forEach(media => {
        if (!originalRates.has(media)) {
            media.addEventListener('ratechange', () => {
                if (!originalRates.has(media)) {
                    originalRates.set(media, media.playbackRate);
                }
            });
            originalRates.set(media, media.playbackRate);
        }
    });
}

// Mouse event listeners for non-TikTok sites
if (!isTikTok() && !isCurrentSiteDisabled()) {
    let holdStartTime = 0;
    const HOLD_THRESHOLD = 150; // Time in ms to consider it a hold rather than a click
    let isHolding = false;

    document.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
            holdStartTime = Date.now();
            isMouseDown = true;
            document.querySelectorAll('video, audio').forEach(handleSpeedChange);
        }
    });

    document.addEventListener('mouseup', (e) => {
        if (e.button === 0) {
            const holdDuration = Date.now() - holdStartTime;
            isHolding = holdDuration >= HOLD_THRESHOLD;
            
            // If this was a hold (not a click), prevent the click event
            if (isHolding) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            isMouseDown = false;
            document.querySelectorAll('video, audio').forEach(handleSpeedChange);
            isHolding = false;
        }
    });

    // Capture click events on videos to prevent play/pause when releasing from hold
    document.addEventListener('click', (e) => {
        if (isHolding) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);

    // Initialize on page load
    initializeMediaElements();

    // Handle dynamically added media elements
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeName === 'VIDEO' || node.nodeName === 'AUDIO') {
                    initializeMediaElements();
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}
