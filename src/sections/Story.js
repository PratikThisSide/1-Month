import { content } from '../data/content.js';
import { el, wait, fadeIn, fadeOut, blurReveal, typeText } from '../engine/utils.js';
import { gsap } from 'gsap';

export function createStoryScene(ctx) {
  const { container, starField, next } = ctx;
  let scene, autoRevealTimeout;
  const timeline = content.story.timeline;

  // Star positions (percentage-based for responsiveness)
  const positions = [
    { left: '15%', top: '25%' },
    { left: '70%', top: '15%' },
    { left: '35%', top: '50%' },
    { left: '80%', top: '55%' },
    { left: '50%', top: '80%' },
  ];

  return {
    async enter() {
      scene = el('div', 'scene', container);
      starField.setConfig({ density: 300, speed: 0.2, brightness: 0.6, shootingStarInterval: 12000 });

      // Intro text
      const intro = el('p', 'text-body text-serif', scene);
      intro.style.opacity = '0';
      intro.textContent = content.story.intro;
      await blurReveal(intro, 1.2);
      await wait(2000);
      await fadeOut(intro, 1);
      intro.remove();
      await wait(500);

      // Constellation container
      const constellation = el('div', 'constellation-container', scene);
      const textBox = el('div', 'constellation-text text-body text-serif', scene);
      textBox.style.opacity = '0';

      // SVG for connecting lines
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:1;';
      constellation.appendChild(svg);

      const stars = [];
      const svgLines = [];
      let revealedCount = 0;

      // Create stars
      for (let i = 0; i < timeline.length; i++) {
        const entry = timeline[i];
        const star = el('div', `constellation-star ${entry.type}`, constellation);
        star.style.left = positions[i].left;
        star.style.top = positions[i].top;
        star.style.opacity = '0';
        star.setAttribute('role', 'button');
        star.setAttribute('aria-label', `${entry.date} - tap to reveal`);
        star.setAttribute('tabindex', '0');

        const label = el('div', 'constellation-label', constellation);
        label.style.left = positions[i].left;
        label.style.top = positions[i].top;
        label.textContent = entry.date;

        stars.push({ el: star, label, entry });

        // SVG connecting line to previous star
        if (i > 0) {
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          const pLeft = parseFloat(positions[i - 1].left);
          const pTop = parseFloat(positions[i - 1].top);
          const cLeft = parseFloat(positions[i].left);
          const cTop = parseFloat(positions[i].top);
          line.setAttribute('x1', `${pLeft}%`);
          line.setAttribute('y1', `${pTop}%`);
          line.setAttribute('x2', `${cLeft}%`);
          line.setAttribute('y2', `${cTop}%`);
          const color = entry.type === 'love' ? 'rgba(255,181,208,0.25)' : 'rgba(196,167,255,0.25)';
          line.setAttribute('stroke', color);
          line.setAttribute('stroke-width', '1');
          line.setAttribute('opacity', '0');
          svg.appendChild(line);
          svgLines.push(line);
        }
      }

      // Reveal stars one by one
      for (let i = 0; i < stars.length; i++) {
        await wait(600);

        // Animate star in
        gsap.fromTo(stars[i].el,
          { opacity: 0, scale: 0 },
          { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(2)' }
        );

        // Show label
        gsap.to(stars[i].label, { opacity: 1, duration: 0.5, delay: 0.3 });

        // Draw connecting line
        if (i > 0 && svgLines[i - 1]) {
          gsap.to(svgLines[i - 1], { attr: { opacity: 1 }, duration: 0.8 });
        }

        // Star click handler
        const starData = stars[i];
        const handleStar = async () => {
          starData.el.classList.add('active');
          textBox.textContent = starData.entry.text;
          textBox.style.opacity = '0';
          await fadeIn(textBox, 0.6);

          revealedCount++;
          if (revealedCount >= timeline.length) {
            await wait(1500);
            await showOutro();
          }
        };
        starData.el.addEventListener('click', handleStar, { once: true });
        starData.el.addEventListener('touchend', (e) => { e.preventDefault(); handleStar(); }, { once: true });
        starData.el.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleStar(); }, { once: true });
      }

      // Auto-reveal after 8 seconds if user hasn't clicked all
      autoRevealTimeout = setTimeout(async () => {
        if (revealedCount < timeline.length) {
          for (const s of stars) {
            s.el.classList.add('active');
          }
          revealedCount = timeline.length;
          textBox.textContent = timeline[timeline.length - 1].text;
          textBox.style.opacity = '1';
          await wait(1500);
          await showOutro();
        }
      }, 15000);

      // Outro sequence
      async function showOutro() {
        await fadeOut(constellation, 1);
        constellation.remove();

        for (const line of content.story.outro) {
          textBox.textContent = '';
          textBox.style.opacity = '0';
          textBox.textContent = line;
          await fadeIn(textBox, 0.8);
          await wait(1500);
          await fadeOut(textBox, 0.6);
        }

        // Final line - bigger and warmer
        textBox.className = 'text-hero text-serif text-warm';
        textBox.textContent = content.story.final;
        textBox.style.opacity = '0';
        await blurReveal(textBox, 1.5);
        await wait(2500);

        // Continue hint
        const hint = el('div', 'continue-hint', scene);
        hint.innerHTML = '<span>continue</span><div class="arrow"></div>';
        hint.style.opacity = '0';
        await fadeIn(hint, 0.8);
        hint.addEventListener('click', () => next());
        hint.addEventListener('touchend', (e) => { e.preventDefault(); next(); });

        // Also advance on any tap on the scene
        scene.addEventListener('click', () => next(), { once: true });
      }
    },

    async exit() {
      if (scene) await fadeOut(scene, 0.8);
    },

    destroy() {
      if (autoRevealTimeout) clearTimeout(autoRevealTimeout);
      if (scene && scene.parentNode) scene.remove();
    },
  };
}
