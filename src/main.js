/**
 * ============================================
 * FOR VANILLA 🌙 — Main Entry Point
 * ============================================
 *
 * This is the orchestrator that ties everything together.
 * It initializes the star field, audio, and scene manager,
 * then plays the experience scene by scene.
 */

import { StarField } from './engine/StarField.js';
import { AudioController } from './engine/AudioController.js';
import { SceneManager } from './engine/SceneManager.js';

// Scene imports
import { createOpeningScene } from './sections/Opening.js';
import { createStoryScene } from './sections/Story.js';
import { createThingsILoveScene } from './sections/ThingsILove.js';
import { createFirstKissScene } from './sections/FirstKiss.js';
import { createBirthdayVideoScene } from './sections/BirthdayVideo.js';
import { createGalleryScene } from './sections/Gallery.js';
import { createLetterScene } from './sections/Letter.js';
import { createCoreMessageScene } from './sections/CoreMessage.js';
import { createFinaleScene } from './sections/Finale.js';

// ============================================
// Initialize
// ============================================

const canvas = document.getElementById('starfield');
const container = document.getElementById('scene-container');
const tapOverlay = document.getElementById('tap-overlay');

// Core systems
const starField = new StarField(canvas);
const audio = new AudioController();
const sceneManager = new SceneManager(container, starField, audio);

// ============================================
// Register scenes in order
// ============================================

sceneManager.add('opening', createOpeningScene);
sceneManager.add('story', createStoryScene);
sceneManager.add('things-i-love', createThingsILoveScene);
sceneManager.add('first-kiss', createFirstKissScene);
sceneManager.add('birthday-video', createBirthdayVideoScene);
sceneManager.add('gallery', createGalleryScene);
sceneManager.add('letter', createLetterScene);
sceneManager.add('core-message', createCoreMessageScene);
sceneManager.add('finale', createFinaleScene);

// ============================================
// Tap to begin
// ============================================

function handleTapToBegin() {
  tapOverlay.removeEventListener('click', handleTapToBegin);
  tapOverlay.removeEventListener('touchend', handleTapToBegin);
  tapOverlay.removeEventListener('keydown', handleKeyToBegin);

  // Hide overlay
  tapOverlay.classList.add('hidden');
  setTimeout(() => {
    tapOverlay.style.display = 'none';
  }, 1500);

  // Start the star field
  starField.start();

  // Start the experience
  sceneManager.start();
}

function handleKeyToBegin(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleTapToBegin();
  }
}

tapOverlay.addEventListener('click', handleTapToBegin);
tapOverlay.addEventListener('touchend', (e) => {
  e.preventDefault();
  handleTapToBegin();
});
tapOverlay.addEventListener('keydown', handleKeyToBegin);

// ============================================
// Keyboard navigation (for accessibility)
// ============================================

document.addEventListener('keydown', (e) => {
  // Don't interfere with video controls or letter scrolling
  if (document.activeElement?.tagName === 'VIDEO' ||
      document.activeElement?.closest('.letter-container')) {
    return;
  }

  if (e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault();
    sceneManager.next();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    sceneManager.prev();
  }
});

// ============================================
// Prevent default mobile behaviors
// ============================================

document.addEventListener('touchmove', (e) => {
  // Allow scrolling inside gallery and letter
  if (e.target.closest('.gallery-grid') || e.target.closest('.letter-container')) {
    return;
  }
  e.preventDefault();
}, { passive: false });

// Prevent double-tap zoom
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) {
    e.preventDefault();
  }
  lastTouchEnd = now;
}, false);

// ============================================
// Visibility API — pause when hidden
// ============================================

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    starField.stop();
  } else {
    starField.start();
  }
});

// ============================================
// Console Easter egg 🌙
// ============================================

console.log(
  '%c🌙 Made with love by Pituuu, for Vanilla',
  'font-size: 14px; color: #c4a7ff; font-family: Georgia, serif; padding: 8px;'
);
console.log(
  '%c"Simple dimpl pop it squish" ✨',
  'font-size: 11px; color: #ffb5d0; font-style: italic;'
);
