import { content } from '../data/content.js';
import { el, wait, fadeIn, fadeOut, blurReveal } from '../engine/utils.js';

export function createFirstKissScene(ctx) {
  const { container, starField, next } = ctx;
  let scene;

  return {
    async enter() {
      scene = el('div', 'scene kiss-section', container);

      // Slow everything down — the world stops
      starField.setConfig({ density: 60, speed: 0.03, brightness: 0.25, shootingStarInterval: 0 });
      await wait(2000);

      // "And then..."
      const line1 = el('p', 'text-body text-serif', scene);
      line1.style.opacity = '0';
      line1.textContent = content.firstKiss.line1;
      await fadeIn(line1, 2);
      await wait(3000);

      // "Our first kiss."
      await fadeOut(line1, 1);
      line1.remove();
      await wait(800);

      const line2 = el('p', 'text-hero text-serif text-warm', scene);
      line2.style.opacity = '0';
      line2.textContent = content.firstKiss.line2;
      await blurReveal(line2, 2);

      // Single glowing star
      const star = el('div', 'kiss-star', scene);
      star.style.opacity = '0';
      star.style.marginTop = '32px';
      await fadeIn(star, 1.5, 0.5);

      // Let it breathe
      await wait(4000);

      // Lingering text
      const linger = el('p', 'text-small', scene);
      linger.style.opacity = '0';
      linger.style.marginTop = '24px';
      linger.textContent = content.firstKiss.linger;
      await fadeIn(linger, 1.5);
      await wait(2500);

      // Continue
      const hint = el('div', 'continue-hint', scene);
      hint.innerHTML = '<span>continue</span><div class="arrow"></div>';
      hint.style.opacity = '0';
      await fadeIn(hint, 0.8);

      const advance = () => {
        // Restore starfield gently
        starField.setConfig({ density: 300, speed: 0.25, brightness: 0.7, shootingStarInterval: 8000 });
        next();
      };

      hint.addEventListener('click', advance);
      hint.addEventListener('touchend', (e) => { e.preventDefault(); advance(); });
      scene.addEventListener('click', advance, { once: true });
    },

    async exit() {
      if (scene) await fadeOut(scene, 1.2);
    },

    destroy() {
      if (scene && scene.parentNode) scene.remove();
    },
  };
}
