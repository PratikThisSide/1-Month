/**
 * AudioController — Manages background audio with smooth fading
 * 
 * Place your audio file at: assets/audio/our-song.mp3
 */
export class AudioController {
  constructor() {
    this.audio = document.getElementById('bg-audio');
    this.button = document.getElementById('audio-toggle');
    this.isPlaying = false;
    this.isMuted = false;
    this.targetVolume = 0.3;
    this._fadeInterval = null;

    this.button.addEventListener('click', () => this.toggle());
  }

  /** Show the audio button */
  show() {
    this.button.classList.add('visible');
  }

  /** Hide the audio button */
  hide() {
    this.button.classList.remove('visible');
  }

  /** Try to start playing */
  async play() {
    try {
      this.audio.volume = 0;
      await this.audio.play();
      this.isPlaying = true;
      this.button.classList.add('playing');
      this.fadeIn(2);
    } catch (e) {
      // Autoplay blocked — that's fine, user can click the button
      console.log('Audio autoplay blocked, user interaction needed');
    }
  }

  /** Toggle play/pause */
  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  /** Pause audio */
  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this.button.classList.remove('playing');
  }

  /** Fade volume in */
  fadeIn(duration = 2) {
    this._clearFade();
    const steps = 60;
    const increment = this.targetVolume / steps;
    const interval = (duration * 1000) / steps;
    let vol = this.audio.volume;

    this._fadeInterval = setInterval(() => {
      vol = Math.min(vol + increment, this.targetVolume);
      this.audio.volume = vol;
      if (vol >= this.targetVolume) this._clearFade();
    }, interval);
  }

  /** Fade volume out */
  fadeOut(duration = 2) {
    this._clearFade();
    const steps = 60;
    const decrement = this.audio.volume / steps;
    const interval = (duration * 1000) / steps;
    let vol = this.audio.volume;

    this._fadeInterval = setInterval(() => {
      vol = Math.max(vol - decrement, 0);
      this.audio.volume = vol;
      if (vol <= 0) {
        this._clearFade();
        this.audio.pause();
      }
    }, interval);
  }

  /** Set target volume (0-1) */
  setVolume(vol) {
    this.targetVolume = Math.max(0, Math.min(1, vol));
    if (this.isPlaying) {
      this.audio.volume = this.targetVolume;
    }
  }

  _clearFade() {
    if (this._fadeInterval) {
      clearInterval(this._fadeInterval);
      this._fadeInterval = null;
    }
  }

  destroy() {
    this._clearFade();
    this.pause();
  }
}
