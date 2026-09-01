import { content } from '../data/content.js';
import { ORIGIN_EASTER_EGG } from '../data/content.js';
import { el, wait, typeText, fadeIn, fadeOut, blurReveal } from '../engine/utils.js';

export function createOpeningScene(ctx) {
  const { container, starField, audio, next } = ctx;
  let scene, moonHandler, nebula;
  const moon = document.getElementById('moon');

  return {
    async enter() {
      // Create scene wrapper
      scene = el('div', 'scene', container);
      
      // Create nebula (hidden initially)
      nebula = el('div', 'nebula', document.body);
      for (let i = 0; i < 3; i++) el('div', 'nebula-cloud', nebula);
      
      // Easter egg
      const egg = el('div', '', scene);
      egg.textContent = ORIGIN_EASTER_EGG;
      egg.style.cssText = 'position:absolute;bottom:8px;left:8px;font-size:8px;opacity:0.04;font-family:var(--sans);color:var(--text-dim);pointer-events:none;';
      
      // Phase 1: Stars slowly appear
      starField.setConfig({ density: 1, speed: 0.1, brightness: 0.5 });
      await wait(800);
      starField.setConfig({ density: 10 });
      await wait(600);
      starField.setConfig({ density: 40 });
      await wait(600);
      starField.setConfig({ density: 100 });
      await wait(800);
      starField.setConfig({ density: 180, brightness: 0.7 });
      
      // Phase 2: Moon appears
      await wait(600);
      moon.classList.add('visible');
      await wait(1500);
      
      // Phase 3: Text sequence
      const line1 = el('p', 'text-body text-serif', scene);
      line1.style.opacity = '0';
      await typeText(line1, content.opening.line1, 70);
      await wait(1200);
      
      const line2 = el('p', 'text-body text-serif', scene);
      line2.textContent = content.opening.line2;
      line2.style.opacity = '0';
      line2.style.marginTop = '16px';
      await blurReveal(line2, 1.2);
      await wait(1000);
      
      const line3 = el('p', 'text-small', scene);
      line3.textContent = content.opening.line3;
      line3.style.opacity = '0';
      line3.style.marginTop = '12px';
      await fadeIn(line3, 1);
      await wait(1500);
      
      // Phase 4: Moon interaction hint
      const hint = el('div', 'continue-hint', scene);
      hint.innerHTML = '<span>tap the moon</span>';
      hint.style.opacity = '0';
      await fadeIn(hint, 1, 0.5);
      
      // Phase 5: Moon click handler
      moonHandler = async () => {
        moon.removeEventListener('click', moonHandler);
        moon.removeEventListener('touchend', moonHandler);
        
        // The magical burst
        moon.classList.add('bright');
        starField.setConfig({ density: 500, speed: 0.5, brightness: 1, shootingStarInterval: 4000 });
        starField.addShootingStar();
        await wait(300);
        starField.addShootingStar();
        await wait(400);
        starField.addShootingStar();
        
        // Show nebula
        nebula.classList.add('visible');
        
        // Try playing audio
        audio.show();
        audio.play();
        
        // Fade out text
        await fadeOut(scene, 1.5);
        await wait(500);
        
        // Advance
        moon.classList.remove('bright');
        next();
      };
      
      moon.addEventListener('click', moonHandler);
      moon.addEventListener('touchend', (e) => { e.preventDefault(); moonHandler(); }, { once: true });
      hint.addEventListener('click', moonHandler);
      hint.addEventListener('touchend', (e) => { e.preventDefault(); moonHandler(); }, { once: true });
      scene.addEventListener('click', moonHandler, { once: true });
    },

    async exit() {
      if (scene) await fadeOut(scene, 0.8);
    },

    destroy() {
      if (moonHandler) {
        moon.removeEventListener('click', moonHandler);
      }
      if (scene && scene.parentNode) scene.remove();
      // Keep nebula alive (persists through experience)
    },
  };
}
