import { content } from '../data/content.js';
import { el, wait, fadeIn, fadeOut, blurReveal, typeText, videoExists } from '../engine/utils.js';
import { gsap } from 'gsap';

export function createBirthdayVideoScene(ctx) {
  const { container, starField, next } = ctx;
  let scene, videoEl;

  return {
    async enter() {
      scene = el('div', 'scene', container);
      starField.setConfig({ density: 200, speed: 0.15, brightness: 0.5, shootingStarInterval: 15000 });

      // Text sequence
      const line1 = el('p', 'text-body text-serif', scene);
      line1.style.opacity = '0';
      await typeText(line1, content.birthday.line1, 50);
      await wait(1500);

      const line2 = el('p', 'text-body text-serif', scene);
      line2.textContent = content.birthday.line2;
      line2.style.opacity = '0';
      line2.style.marginTop = '12px';
      await fadeIn(line2, 1);
      await wait(2000);

      const line3 = el('p', 'text-body text-serif text-warm', scene);
      line3.textContent = content.birthday.line3;
      line3.style.opacity = '0';
      line3.style.marginTop = '12px';
      await blurReveal(line3, 1.2);
      await wait(2000);

      // Fade out text
      await fadeOut(line1, 0.8);
      await fadeOut(line2, 0.8);
      await fadeOut(line3, 0.8);
      line1.remove(); line2.remove(); line3.remove();
      await wait(500);

      // Video reveal
      const frame = el('div', 'video-frame', scene);
      frame.style.opacity = '0';

      const candidates = [
        content.birthday.videoSrc,
        './videos/WhatsApp Video 2026-09-01 at 16.29.53.mp4',
        './videos/birthday-memory.mp4'
      ];
      let resolvedSrc = null;
      for (const cand of candidates) {
        if (cand && await videoExists(cand)) {
          resolvedSrc = cand;
          break;
        }
      }

      if (resolvedSrc) {
        videoEl = document.createElement('video');
        videoEl.src = encodeURI(resolvedSrc);
        videoEl.playsInline = true;
        videoEl.muted = false; // Allow sound if user plays
        videoEl.controls = true;
        videoEl.preload = 'metadata';
        videoEl.setAttribute('playsinline', '');
        videoEl.setAttribute('webkit-playsinline', '');
        frame.appendChild(videoEl);

        // Controls
        const controls = el('div', 'video-controls', frame);

        const playBtn = el('button', '', controls);
        playBtn.textContent = '▶';
        playBtn.setAttribute('aria-label', 'Play/Pause video');
        playBtn.addEventListener('click', () => {
          if (videoEl.paused) {
            videoEl.play();
            playBtn.textContent = '⏸';
          } else {
            videoEl.pause();
            playBtn.textContent = '▶';
          }
        });

        const muteBtn = el('button', '', controls);
        muteBtn.textContent = '🔇';
        muteBtn.setAttribute('aria-label', 'Mute/Unmute video');
        muteBtn.addEventListener('click', () => {
          videoEl.muted = !videoEl.muted;
          muteBtn.textContent = videoEl.muted ? '🔇' : '🔊';
        });
      } else {
        // Placeholder
        const placeholder = el('div', 'video-placeholder', frame);
        const icon = el('div', 'icon', placeholder);
        icon.textContent = '🎬';
        const placeholderText = el('p', '', placeholder);
        placeholderText.textContent = content.birthday.placeholder;
      }

      // Animate video frame in
      gsap.fromTo(frame,
        { opacity: 0, scale: 0.85, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 1.5, ease: 'power3.out' }
      );

      // Caption
      const caption = el('p', 'text-small text-hand', scene);
      caption.style.opacity = '0';
      caption.style.marginTop = '16px';
      caption.textContent = content.birthday.caption;
      await wait(1000);
      await fadeIn(caption, 1);

      // Continue hint after delay
      await wait(5000);
      const hint = el('div', 'continue-hint', scene);
      hint.innerHTML = '<span>continue</span><div class="arrow"></div>';
      hint.style.opacity = '0';
      await fadeIn(hint, 0.8);

      const advance = () => {
        if (videoEl) videoEl.pause();
        next();
      };
      hint.addEventListener('click', advance);
      hint.addEventListener('touchend', (e) => { e.preventDefault(); advance(); });
    },

    async exit() {
      if (videoEl) videoEl.pause();
      if (scene) await fadeOut(scene, 1);
    },

    destroy() {
      if (videoEl) {
        videoEl.pause();
        videoEl.src = '';
      }
      if (scene && scene.parentNode) scene.remove();
    },
  };
}
