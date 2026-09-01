import { rand, lerp, prefersReducedMotion, isMobile } from './utils.js';
import { gsap } from 'gsap';

/**
 * StarField — GPU-friendly canvas particle system
 * 
 * Features:
 * - Thousands of twinkling stars
 * - Shooting stars at random intervals
 * - Subtle parallax on device orientation/mouse
 * - Morphing stars to form text (for the finale)
 * - Configurable density, speed, brightness
 */
export class StarField {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.stars = [];
    this.shootingStars = [];
    this.animationId = null;
    this.running = false;
    this.mouse = { x: 0.5, y: 0.5 };
    this.morphing = false;
    this.morphTargets = null;
    this.morphProgress = 0;
    
    // Configurable properties
    this.config = {
      density: 0,          // Target number of stars (0 = starts empty)
      speed: 0.3,          // Star drift speed
      brightness: 1,       // Overall brightness multiplier
      shootingStarInterval: 8000,  // ms between shooting stars
      parallaxStrength: 0.02,
    };

    // Internal state
    this._targetDensity = 0;
    this._currentDensity = 0;
    this._lastShootingStar = 0;
    this._reducedMotion = prefersReducedMotion();
    this._mobile = isMobile();

    this._resize = this._resize.bind(this);
    this._handleMove = this._handleMove.bind(this);
    this._handleOrientation = this._handleOrientation.bind(this);

    window.addEventListener('resize', this._resize);
    window.addEventListener('mousemove', this._handleMove);
    window.addEventListener('deviceorientation', this._handleOrientation);

    this._resize();
  }

  _resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = this.width + 'px';
    this.canvas.style.height = this.height + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  _handleMove(e) {
    this.mouse.x = e.clientX / this.width;
    this.mouse.y = e.clientY / this.height;
  }

  _handleOrientation(e) {
    if (e.gamma !== null) {
      this.mouse.x = 0.5 + (e.gamma / 90) * 0.5;
      this.mouse.y = 0.5 + (e.beta / 180) * 0.5;
    }
  }

  /** Set configuration (partial update) */
  setConfig(newConfig) {
    Object.assign(this.config, newConfig);
    if (newConfig.density !== undefined) {
      this._targetDensity = newConfig.density;
    }
  }

  /** Create a single star */
  _createStar(x, y) {
    const isLarge = Math.random() < 0.03;
    return {
      x: x !== undefined ? x : rand(0, this.width),
      y: y !== undefined ? y : rand(0, this.height),
      baseX: 0,  // for morphing
      baseY: 0,
      targetX: 0,
      targetY: 0,
      size: isLarge ? rand(1.5, 2.8) : rand(0.4, 1.5),
      brightness: rand(0.3, 1),
      twinkleSpeed: rand(0.005, 0.025),
      twinkleOffset: rand(0, Math.PI * 2),
      driftX: rand(-0.15, 0.15),
      driftY: rand(-0.05, 0.05),
      hue: Math.random() < 0.1 ? rand(200, 280) : 0, // occasional colored stars
      saturation: Math.random() < 0.1 ? rand(20, 50) : 0,
    };
  }

  /** Add or remove stars to match target density */
  _adjustDensity() {
    const diff = this._targetDensity - this.stars.length;
    if (diff > 0) {
      // Add stars gradually (max 5 per frame)
      const toAdd = Math.min(diff, 5);
      for (let i = 0; i < toAdd; i++) {
        this.stars.push(this._createStar());
      }
    } else if (diff < -5) {
      // Remove stars gradually
      this.stars.splice(0, Math.min(-diff, 3));
    }
  }

  /** Fire a shooting star */
  addShootingStar() {
    const startX = rand(0, this.width);
    const startY = rand(0, this.height * 0.4);
    const angle = rand(Math.PI * 0.15, Math.PI * 0.35);
    const speed = rand(6, 12);
    this.shootingStars.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: rand(0.012, 0.025),
      size: rand(1.5, 3),
      trail: [],
    });
  }

  /** Morph stars to form text */
  async morphToText(text, callback) {
    // Create an offscreen canvas to render the text and find pixel positions
    const offCanvas = document.createElement('canvas');
    const offCtx = offCanvas.getContext('2d');
    const fontSize = this._mobile ? 40 : 60;
    offCanvas.width = this.width;
    offCanvas.height = this.height;

    offCtx.fillStyle = '#fff';
    offCtx.font = `300 ${fontSize}px 'Cormorant Garamond', serif`;
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillText(text, this.width / 2, this.height / 2);

    const imageData = offCtx.getImageData(0, 0, this.width, this.height);
    const targets = [];
    const step = this._mobile ? 4 : 3;

    for (let y = 0; y < this.height; y += step) {
      for (let x = 0; x < this.width; x += step) {
        const i = (y * this.width + x) * 4;
        if (imageData.data[i + 3] > 128) {
          targets.push({ x, y });
        }
      }
    }

    // Ensure we have enough stars
    while (this.stars.length < targets.length) {
      this.stars.push(this._createStar());
    }

    // Assign targets to stars
    this.morphTargets = targets;
    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];
      star.baseX = star.x;
      star.baseY = star.y;
      if (i < targets.length) {
        star.targetX = targets[i].x;
        star.targetY = targets[i].y;
      } else {
        // Extra stars drift away
        star.targetX = rand(-100, this.width + 100);
        star.targetY = rand(-100, this.height + 100);
      }
    }

    this.morphing = true;
    this.morphProgress = 0;

    // Animate the morph
    return new Promise(resolve => {
      gsap.to(this, {
        morphProgress: 1,
        duration: 3,
        ease: 'power3.inOut',
        onComplete: () => {
          if (callback) callback();
          resolve();
        },
      });
    });
  }

  /** Reset from morph back to normal */
  async resetMorph() {
    if (!this.morphing) return;
    return new Promise(resolve => {
      gsap.to(this, {
        morphProgress: 0,
        duration: 2,
        ease: 'power2.inOut',
        onComplete: () => {
          this.morphing = false;
          this.morphTargets = null;
          resolve();
        },
      });
    });
  }

  /** Main render loop */
  _render(time) {
    if (!this.running) return;
    this.animationId = requestAnimationFrame((t) => this._render(t));

    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const parallaxX = (this.mouse.x - 0.5) * this.config.parallaxStrength;
    const parallaxY = (this.mouse.y - 0.5) * this.config.parallaxStrength;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Adjust density
    this._adjustDensity();

    // Draw stars
    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];

      // Twinkle
      const twinkle = 0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
      const alpha = star.brightness * twinkle * this.config.brightness;

      // Position
      let sx, sy;
      if (this.morphing && this.morphProgress > 0) {
        sx = lerp(star.baseX, star.targetX, this.morphProgress);
        sy = lerp(star.baseY, star.targetY, this.morphProgress);
        // Still apply drift to unmorphed state
        if (this.morphProgress < 1) {
          star.baseX += star.driftX * this.config.speed * (1 - this.morphProgress);
          star.baseY += star.driftY * this.config.speed * (1 - this.morphProgress);
        }
      } else {
        // Normal drift
        star.x += star.driftX * this.config.speed;
        star.y += star.driftY * this.config.speed;

        // Wrap around
        if (star.x < -10) star.x = w + 10;
        if (star.x > w + 10) star.x = -10;
        if (star.y < -10) star.y = h + 10;
        if (star.y > h + 10) star.y = -10;

        sx = star.x;
        sy = star.y;
      }

      // Apply parallax
      sx += parallaxX * (star.size * 20);
      sy += parallaxY * (star.size * 20);

      // Draw
      if (star.hue > 0) {
        ctx.fillStyle = `hsla(${star.hue}, ${star.saturation}%, 85%, ${alpha})`;
      } else {
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      }

      const size = star.size * (this.morphing ? lerp(1, 0.8, this.morphProgress) : 1);

      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fill();

      // Glow for larger stars
      if (star.size > 1.8 && !this.morphing) {
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.1})`;
        ctx.beginPath();
        ctx.arc(sx, sy, size * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Shooting stars
    if (!this._reducedMotion && !this.morphing) {
      // Auto-spawn
      if (this.config.shootingStarInterval > 0 && time - this._lastShootingStar > this.config.shootingStarInterval) {
        this.addShootingStar();
        this._lastShootingStar = time;
      }

      // Update and draw
      for (let i = this.shootingStars.length - 1; i >= 0; i--) {
        const ss = this.shootingStars[i];
        ss.trail.push({ x: ss.x, y: ss.y, alpha: ss.life });
        if (ss.trail.length > 20) ss.trail.shift();

        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.life -= ss.decay;

        // Draw trail
        for (let t = 0; t < ss.trail.length; t++) {
          const tp = ss.trail[t];
          const trailAlpha = (t / ss.trail.length) * ss.life * 0.5;
          ctx.fillStyle = `rgba(255, 255, 255, ${trailAlpha})`;
          const trailSize = ss.size * (t / ss.trail.length);
          ctx.beginPath();
          ctx.arc(tp.x, tp.y, trailSize, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw head
        ctx.fillStyle = `rgba(255, 255, 255, ${ss.life})`;
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, ss.size, 0, Math.PI * 2);
        ctx.fill();

        // Head glow
        ctx.fillStyle = `rgba(200, 220, 255, ${ss.life * 0.3})`;
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, ss.size * 3, 0, Math.PI * 2);
        ctx.fill();

        if (ss.life <= 0) {
          this.shootingStars.splice(i, 1);
        }
      }
    }
  }

  /** Start the animation loop */
  start() {
    if (this.running) return;
    this.running = true;
    this._render(0);
  }

  /** Stop the animation loop */
  stop() {
    this.running = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /** Destroy and clean up */
  destroy() {
    this.stop();
    window.removeEventListener('resize', this._resize);
    window.removeEventListener('mousemove', this._handleMove);
    window.removeEventListener('deviceorientation', this._handleOrientation);
  }
}
