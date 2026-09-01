import { content } from '../data/content.js';
import { el, wait, fadeIn, fadeOut } from '../engine/utils.js';
import { gsap } from 'gsap';

export function createLetterScene(ctx) {
  const { container, starField, next } = ctx;
  let scene;
  const moon = document.getElementById('moon');

  return {
    async enter() {
      scene = el('div', 'scene', container);

      // Extremely calm atmosphere
      starField.setConfig({ density: 120, speed: 0.05, brightness: 0.3, shootingStarInterval: 0 });
      moon.classList.add('visible');

      await wait(800);

      // Letter container
      const letterBox = el('div', 'letter-container', scene);
      letterBox.style.opacity = '0';

      const letterText = el('div', 'letter-text', letterBox);
      // ============================================
      // ✍️  YOUR PERSONAL LETTER CONTENT
      // ============================================
      // Edit the letter body in src/data/content.js
      letterText.textContent = content.letter.body;

      const signature = el('div', 'letter-sign', letterBox);
      signature.textContent = content.letter.signature;

      // Gentle fade in
      gsap.fromTo(letterBox,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 2, ease: 'power2.out' }
      );

      // Continue hint
      await wait(3000);
      const hint = el('div', 'continue-hint', scene);
      hint.innerHTML = '<span>continue</span><div class="arrow"></div>';
      hint.style.opacity = '0';
      await fadeIn(hint, 0.8);

      const advance = () => next();
      hint.addEventListener('click', advance);
      hint.addEventListener('touchend', (e) => { e.preventDefault(); advance(); });
    },

    async exit() {
      if (scene) await fadeOut(scene, 1);
    },

    destroy() {
      if (scene && scene.parentNode) scene.remove();
    },
  };
}
