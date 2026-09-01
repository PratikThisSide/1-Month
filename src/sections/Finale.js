import { content } from '../data/content.js';
import { el, wait, fadeIn, fadeOut, blurReveal, letterReveal } from '../engine/utils.js';

export function createFinaleScene(ctx) {
  const { container, starField, audio } = ctx;
  let scene, grain;
  const moon = document.getElementById('moon');

  return {
    async enter() {
      scene = el('div', 'scene', container);
      starField.setConfig({ density: 400, speed: 0.1, brightness: 0.8, shootingStarInterval: 0 });

      // Film grain
      grain = el('div', 'grain', document.body);

      await wait(1000);

      // Morph stars to form her name
      const nameOverlay = el('div', 'finale-name', scene);
      nameOverlay.style.opacity = '0';
      nameOverlay.style.position = 'absolute';
      nameOverlay.style.top = '50%';
      nameOverlay.style.left = '50%';
      nameOverlay.style.transform = 'translate(-50%, -50%)';
      nameOverlay.style.width = '100%';
      nameOverlay.style.pointerEvents = 'none';

      // Morph stars
      await starField.morphToText(content.finale.name);
      await wait(3000);

      // Reset morph and show text messages
      await starField.resetMorph();
      starField.setConfig({ density: 200, speed: 0.08, brightness: 0.4 });
      await wait(1000);

      // Pre-reveal messages
      const textEl = el('p', 'text-body text-serif', scene);
      textEl.style.maxWidth = '500px';

      for (const msg of content.finale.preReveal) {
        textEl.textContent = msg;
        textEl.style.opacity = '0';
        await fadeIn(textEl, 1.2);
        await wait(2500);
        await fadeOut(textEl, 0.8);
        await wait(500);
      }

      // THE big moment
      await wait(1500);

      const theOne = el('p', 'text-hero text-serif text-warm', scene);
      theOne.style.opacity = '1';
      theOne.style.maxWidth = '600px';
      await letterReveal(theOne, content.finale.theOne, 0.06);

      // Fire shooting stars!
      starField.addShootingStar();
      await wait(800);
      starField.addShootingStar();
      await wait(600);
      starField.addShootingStar();

      await wait(5000);
      await fadeOut(theOne, 1.5);
      theOne.remove();
      if (textEl.parentNode) textEl.remove();
      await wait(1000);

      // Happy 1 Month
      starField.setConfig({ density: 350, speed: 0.2, brightness: 0.9, shootingStarInterval: 3000 });

      const anniversary = el('div', '', scene);
      anniversary.style.cssText = 'text-align:center;';
      anniversary.style.opacity = '0';

      const annText = el('p', 'text-hero text-serif', anniversary);
      annText.innerHTML = content.finale.anniversary.replace('❤️', '<span class="finale-heart">❤️</span>');

      const sig = el('p', 'text-hand text-warm', anniversary);
      sig.textContent = content.finale.signature;
      sig.style.cssText = 'font-size:clamp(1.2rem,4vw,1.8rem);margin-top:24px;';

      await blurReveal(anniversary, 2);

      // Moon becomes crescent
      await wait(2000);
      moon.classList.add('crescent');

      // Audio fade down slightly for intimacy
      if (audio.isPlaying) {
        audio.setVolume(0.15);
      }

      // This is the end — no auto-advance
      // The experience rests here
    },

    async exit() {
      if (scene) await fadeOut(scene, 1);
    },

    destroy() {
      if (grain && grain.parentNode) grain.remove();
      if (scene && scene.parentNode) scene.remove();
    },
  };
}
