import { content } from '../data/content.js';
import { el, wait, fadeIn, fadeOut, blurReveal } from '../engine/utils.js';

export function createCoreMessageScene(ctx) {
  const { container, starField, next } = ctx;
  let scene;

  return {
    async enter() {
      scene = el('div', 'scene', container);
      starField.setConfig({ density: 250, speed: 0.15, brightness: 0.6, shootingStarInterval: 10000 });

      const messages = content.coreMessage;
      const textEl = el('p', 'text-body text-serif', scene);
      textEl.style.maxWidth = '500px';

      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];
        const isLate = i >= messages.length - 3; // Last 3 messages are more emotional

        textEl.textContent = msg;
        textEl.style.opacity = '0';

        if (isLate) {
          textEl.className = 'text-hero text-serif text-warm';
          textEl.style.fontSize = '';
          await blurReveal(textEl, 1.5);
          await wait(2500);
        } else {
          textEl.className = 'text-body text-serif';
          await fadeIn(textEl, 1);
          await wait(2000);
        }

        if (i < messages.length - 1) {
          await fadeOut(textEl, 0.8);
          await wait(400);
        }
      }

      // Hold the last message
      await wait(2000);
      await fadeOut(textEl, 1);
      await wait(500);
      next();
    },

    async exit() {
      if (scene) await fadeOut(scene, 0.8);
    },

    destroy() {
      if (scene && scene.parentNode) scene.remove();
    },
  };
}
