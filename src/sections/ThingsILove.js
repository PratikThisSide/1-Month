import { content, EASTER_EGG } from '../data/content.js';
import { el, wait, fadeIn, fadeOut, blurReveal, rand } from '../engine/utils.js';
import { gsap } from 'gsap';

export function createThingsILoveScene(ctx) {
  const { container, starField, next } = ctx;
  let scene;

  const starPositions = [
    { left: '20%', top: '25%' },
    { left: '72%', top: '18%' },
    { left: '15%', top: '55%' },
    { left: '75%', top: '50%' },
    { left: '48%', top: '70%' },  // Special star - center bottom
  ];

  return {
    async enter() {
      scene = el('div', 'scene', container);
      starField.setConfig({ density: 250, speed: 0.15, brightness: 0.5, shootingStarInterval: 10000 });

      // Intro
      const intro = el('p', 'text-body text-serif', scene);
      intro.textContent = content.thingsILove.intro;
      intro.style.opacity = '0';
      await blurReveal(intro, 1);
      await wait(2000);
      await fadeOut(intro, 0.8);
      intro.remove();
      await wait(400);

      // Reveal text area
      const revealText = el('div', 'love-star-text text-hero text-serif', scene);
      revealText.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:80%;text-align:center;pointer-events:none;opacity:0;';

      // Hint
      const hint = el('p', 'text-small', scene);
      hint.style.cssText = 'position:absolute;bottom:15%;left:50%;transform:translateX(-50%);opacity:0;';
      hint.textContent = 'tap the stars ✦';
      await fadeIn(hint, 0.8, 0.5);

      const items = content.thingsILove.items;
      let revealed = 0;

      // Create stars
      for (let i = 0; i < items.length + 1; i++) {
        const isSpecial = i === items.length;
        const star = el('div', 'love-star', scene);
        star.style.left = starPositions[i].left;
        star.style.top = starPositions[i].top;
        star.setAttribute('role', 'button');
        star.setAttribute('tabindex', '0');

        if (isSpecial) {
          // Easter egg tooltip
          star.title = EASTER_EGG;
          star.setAttribute('aria-label', 'A special star');
          // Make it bigger and slightly different
          star.style.width = '32px';
          star.style.height = '32px';
        } else {
          star.setAttribute('aria-label', `Star ${i + 1} - tap to reveal`);
        }

        // Animate star in
        star.style.opacity = '0';
        gsap.fromTo(star,
          { opacity: 0, scale: 0 },
          { opacity: 1, scale: 1, duration: 0.6, delay: 0.3 + i * 0.2, ease: 'back.out(2)' }
        );

        const handleStar = async () => {
          if (isSpecial) {
            // Special star behavior - dodges first, then reveals
            // First click: star dodges playfully
            if (!star.dataset.dodged) {
              star.dataset.dodged = 'true';
              const newLeft = rand(30, 65) + '%';
              const newTop = rand(55, 75) + '%';
              gsap.to(star, {
                left: newLeft,
                top: newTop,
                duration: 0.4,
                ease: 'power2.out',
              });
              // Add a tiny teasing message
              const tease = el('p', 'text-small text-warm', scene);
              tease.style.cssText = 'position:absolute;bottom:10%;left:50%;transform:translateX(-50%);';
              tease.textContent = "haha, try again 😄";
              tease.style.opacity = '0';
              await fadeIn(tease, 0.5);
              await wait(1200);
              await fadeOut(tease, 0.5);
              tease.remove();
              return;
            }

            // Second click: reveal with celebration
            star.classList.add('revealed');
            starField.addShootingStar();
            starField.addShootingStar();

            // Hide hint
            await fadeOut(hint, 0.3);

            revealText.textContent = content.thingsILove.special;
            revealText.className = 'love-star-text text-body text-serif text-warm';
            revealText.style.opacity = '0';
            await blurReveal(revealText, 1.2);
            revealed++;
          } else {
            // Normal star
            star.classList.add('revealed');
            revealText.textContent = items[i].text;
            revealText.className = 'love-star-text text-hero text-serif text-accent';
            revealText.style.opacity = '0';
            await fadeIn(revealText, 0.6);
            revealed++;
          }

          // Check if all revealed
          if (revealed >= items.length + 1) {
            await wait(2500);
            next();
          }
        };

        star.addEventListener('click', () => handleStar());
        star.addEventListener('touchend', (e) => { e.preventDefault(); handleStar(); });
        star.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleStar(); });
      }

      // Auto-advance after 25 seconds if not all revealed
      setTimeout(() => {
        if (revealed < items.length + 1) {
          next();
        }
      }, 25000);
    },

    async exit() {
      if (scene) await fadeOut(scene, 0.8);
    },

    destroy() {
      if (scene && scene.parentNode) scene.remove();
    },
  };
}
