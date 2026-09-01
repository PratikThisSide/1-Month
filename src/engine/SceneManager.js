import { wait, clearScene } from './utils.js';
import { gsap } from 'gsap';

/**
 * SceneManager — Orchestrates the cinematic experience
 * 
 * Features:
 * - Instant Skip & Previous navigation
 * - Chapter scrubber dots (jump directly to any scene)
 * - Safe cancellation of running animations when skipping
 * - Progress tracking and keyboard shortcuts
 */
export class SceneManager {
  constructor(container, starField, audioController) {
    this.container = container;
    this.starField = starField;
    this.audio = audioController;
    this.scenes = [];
    this.currentIndex = -1;
    this.currentScene = null;
    this.isSwitching = false;
    this.activeSceneId = 0;

    // UI elements
    this.progressBar = document.getElementById('progress-bar');
    this.progressFill = document.getElementById('progress-fill');
    this.navControls = document.getElementById('nav-controls');
    this.btnPrev = document.getElementById('btn-prev');
    this.btnNext = document.getElementById('btn-next');
    this.chapterDotsEl = document.getElementById('chapter-dots');

    this._initNavEvents();
  }

  _initNavEvents() {
    if (this.btnPrev) {
      this.btnPrev.addEventListener('click', (e) => {
        e.stopPropagation();
        this.prev();
      });
    }

    if (this.btnNext) {
      this.btnNext.addEventListener('click', (e) => {
        e.stopPropagation();
        this.next();
      });
    }
  }

  /** Register a scene */
  add(name, sceneFactory) {
    this.scenes.push({ name, factory: sceneFactory });
  }

  /** Get context object passed to scenes */
  getContext(sceneId) {
    return {
      container: this.container,
      starField: this.starField,
      audio: this.audio,
      next: () => {
        if (sceneId === this.activeSceneId) {
          this.next();
        }
      },
      prev: () => {
        if (sceneId === this.activeSceneId) {
          this.prev();
        }
      },
      goTo: (name) => this.goTo(name),
      totalScenes: this.scenes.length,
      currentIndex: this.currentIndex,
      isActive: () => sceneId === this.activeSceneId,
    };
  }

  /** Start the experience from the first scene */
  async start() {
    this._buildChapterDots();
    if (this.progressBar) this.progressBar.classList.add('visible');
    if (this.navControls) this.navControls.classList.add('visible');
    await this.goToIndex(0);
  }

  _buildChapterDots() {
    if (!this.chapterDotsEl) return;
    this.chapterDotsEl.innerHTML = '';

    const chapterNames = [
      'Welcome',
      'Our Journey',
      'Things I Love',
      'First Kiss',
      'Birthday',
      'Moments',
      'Letter',
      'My Heart',
      'Forever'
    ];

    for (let i = 0; i < this.scenes.length; i++) {
      const dot = document.createElement('button');
      dot.className = 'chapter-dot';
      dot.setAttribute('aria-label', chapterNames[i] || `Chapter ${i + 1}`);
      dot.title = chapterNames[i] || `Chapter ${i + 1}`;
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        this.goToIndex(i);
      });
      this.chapterDotsEl.appendChild(dot);
    }
  }

  /** Advance to next scene (fast forward / skip) */
  async next() {
    if (this.currentIndex < this.scenes.length - 1) {
      await this.goToIndex(this.currentIndex + 1);
    }
  }

  /** Go to previous scene (rewind) */
  async prev() {
    if (this.currentIndex > 0) {
      await this.goToIndex(this.currentIndex - 1);
    }
  }

  /** Go to scene by name */
  async goTo(name) {
    const index = this.scenes.findIndex(s => s.name === name);
    if (index >= 0) await this.goToIndex(index);
  }

  /** Go to scene by index (instant, non-blocking) */
  async goToIndex(index) {
    if (index < 0 || index >= this.scenes.length) return;
    if (this.isSwitching) return;
    this.isSwitching = true;

    // Increment scene id to cancel any running loops in the old scene
    const sceneId = ++this.activeSceneId;

    // Clean up previous scene immediately
    if (this.currentScene) {
      try {
        if (typeof this.currentScene.destroy === 'function') {
          this.currentScene.destroy();
        }
      } catch (e) {
        console.warn('Error destroying scene:', e);
      }
      // Kill any running GSAP animations inside scene-container
      gsap.killTweensOf(this.container.querySelectorAll('*'));
      clearScene(this.container);
    }

    this.currentIndex = index;
    this._updateProgress();
    this._updateNavUI();

    // Synchronize environment (moon, stars, audio) when jumping chapters
    const moon = document.getElementById('moon');
    if (moon) {
      if (index > 0) {
        moon.classList.add('visible');
      }
      if (index < this.scenes.length - 1) {
        moon.classList.remove('crescent');
      }
    }

    if (this.audio && index > 0) {
      this.audio.show();
    }

    if (this.starField && index > 0) {
      this.starField.setConfig({ density: 260, speed: 0.2, brightness: 0.7 });
    }

    // Instantiate new scene
    const sceneEntry = this.scenes[index];
    this.currentScene = sceneEntry.factory(this.getContext(sceneId));

    // Release switching lock so the user can immediately click Skip or Back again!
    this.isSwitching = false;

    // Enter new scene asynchronously without blocking user controls
    try {
      this.currentScene.enter().catch((err) => {
        // Safe catch if scene was interrupted by skip
        console.log('Scene interrupted or completed:', err);
      });
    } catch (e) {
      console.log('Scene enter error:', e);
    }
  }

  /** Update progress bar and chapter dots */
  _updateProgress() {
    if (this.progressFill) {
      const progress = ((this.currentIndex + 1) / this.scenes.length) * 100;
      this.progressFill.style.width = `${progress}%`;
    }

    if (this.chapterDotsEl) {
      const dots = this.chapterDotsEl.children;
      for (let i = 0; i < dots.length; i++) {
        if (i === this.currentIndex) {
          dots[i].classList.add('active');
        } else {
          dots[i].classList.remove('active');
        }
      }
    }
  }

  /** Update Previous / Skip button states */
  _updateNavUI() {
    if (this.btnPrev) {
      if (this.currentIndex <= 0) {
        this.btnPrev.classList.add('disabled');
      } else {
        this.btnPrev.classList.remove('disabled');
      }
    }

    if (this.btnNext) {
      if (this.currentIndex >= this.scenes.length - 1) {
        this.btnNext.classList.add('disabled');
      } else {
        this.btnNext.classList.remove('disabled');
      }
    }
  }

  /** Destroy everything */
  destroy() {
    if (this.currentScene && typeof this.currentScene.destroy === 'function') {
      this.currentScene.destroy();
    }
  }
}
