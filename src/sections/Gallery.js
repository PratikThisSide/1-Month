import { content } from '../data/content.js';
import { memories } from '../data/memories.js';
import { el, wait, fadeIn, fadeOut, imageExists } from '../engine/utils.js';
import { gsap } from 'gsap';

export function createGalleryScene(ctx) {
  const { container, starField, next } = ctx;
  let scene, lightbox;

  return {
    async enter() {
      scene = el('div', 'scene', container);
      starField.setConfig({ density: 200, speed: 0.2, brightness: 0.4, shootingStarInterval: 12000 });

      // Title
      const title = el('p', 'text-body text-serif text-accent', scene);
      title.textContent = 'Our little moments';
      title.style.opacity = '0';
      title.style.marginBottom = '20px';
      await fadeIn(title, 1);
      await wait(500);

      // Check which photos actually exist
      const activeMemories = [];
      for (const mem of memories) {
        if (mem.active) {
          const exists = await imageExists(mem.image);
          activeMemories.push({ ...mem, exists });
        }
      }

      if (activeMemories.length === 0) {
        // No photos yet
        const msg = el('p', 'text-small', scene);
        msg.innerHTML = 'Photos coming soon...<br><span style="opacity:0.5">Add yours in assets/photos/</span>';
        msg.style.opacity = '0';
        await fadeIn(msg, 0.8);
      } else {
        // Gallery grid
        const grid = el('div', 'gallery-grid', scene);
        grid.style.opacity = '0';

        for (let i = 0; i < activeMemories.length; i++) {
          const mem = activeMemories[i];
          const item = el('div', 'gallery-item', grid);

          if (mem.exists) {
            const img = document.createElement('img');
            img.src = encodeURI(mem.image);
            img.alt = mem.alt || mem.caption;
            img.loading = 'lazy';
            item.appendChild(img);

            if (mem.caption) {
              const cap = el('div', 'caption', item);
              cap.textContent = mem.caption;
            }

            // Lightbox on click
            item.addEventListener('click', () => openLightbox(mem));
            item.setAttribute('role', 'button');
            item.setAttribute('tabindex', '0');
            item.addEventListener('keydown', (e) => { if (e.key === 'Enter') openLightbox(mem); });
          } else {
            const placeholder = el('div', 'gallery-placeholder', item);
            placeholder.textContent = '✦';
          }
        }

        // Staggered reveal
        gsap.fromTo(grid,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
        );
      }

      // Lightbox
      lightbox = el('div', 'lightbox', document.body);
      const lbImg = document.createElement('img');
      lbImg.alt = 'Photo enlarged';
      lightbox.appendChild(lbImg);
      const lbCaption = el('div', 'lightbox-caption', lightbox);
      const lbClose = el('button', 'close-btn', lightbox);
      lbClose.textContent = '✕';
      lbClose.setAttribute('aria-label', 'Close photo');

      function openLightbox(mem) {
        lbImg.src = encodeURI(mem.image);
        lbCaption.textContent = mem.caption || '';
        lightbox.classList.add('open');
      }

      function closeLightbox() {
        lightbox.classList.remove('open');
      }

      lbClose.addEventListener('click', closeLightbox);
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
      });

      // Continue hint
      await wait(3000);
      const hint = el('div', 'continue-hint', scene);
      hint.innerHTML = '<span>continue</span><div class="arrow"></div>';
      hint.style.opacity = '0';
      await fadeIn(hint, 0.8);

      const advance = () => {
        closeLightbox();
        next();
      };
      hint.addEventListener('click', advance);
      hint.addEventListener('touchend', (e) => { e.preventDefault(); advance(); });
    },

    async exit() {
      if (scene) await fadeOut(scene, 0.8);
    },

    destroy() {
      if (lightbox && lightbox.parentNode) lightbox.remove();
      if (scene && scene.parentNode) scene.remove();
    },
  };
}
