import { gsap } from 'gsap';

/**
 * Animation & DOM utilities
 */

/** Promise-based delay */
export function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Create a DOM element with optional class and parent */
export function el(tag, className, parent) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (parent) parent.appendChild(element);
  return element;
}

/** Typewriter text animation */
export async function typeText(element, text, speed = 40) {
  element.textContent = '';
  element.style.opacity = '1';
  const chars = text.split('');
  let i = 0;
  return new Promise(resolve => {
    const interval = setInterval(() => {
      if (i < chars.length) {
        element.textContent += chars[i];
        i++;
      } else {
        clearInterval(interval);
        resolve();
      }
    }, speed);
  });
}

/** Fade element in using GSAP */
export async function fadeIn(element, duration = 1, delay = 0) {
  return new Promise(resolve => {
    gsap.fromTo(element,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration, delay, ease: 'power2.out', onComplete: resolve }
    );
  });
}

/** Fade element out using GSAP */
export async function fadeOut(element, duration = 0.8) {
  return new Promise(resolve => {
    gsap.to(element,
      { opacity: 0, y: -10, duration, ease: 'power2.in', onComplete: resolve }
    );
  });
}

/** Scale in animation */
export async function scaleIn(element, duration = 0.8, delay = 0) {
  return new Promise(resolve => {
    gsap.fromTo(element,
      { opacity: 0, scale: 0.5 },
      { opacity: 1, scale: 1, duration, delay, ease: 'back.out(1.4)', onComplete: resolve }
    );
  });
}

/** Blur-to-focus text reveal */
export async function blurReveal(element, duration = 1.2, delay = 0) {
  return new Promise(resolve => {
    gsap.fromTo(element,
      { opacity: 0, filter: 'blur(12px)', y: 20 },
      { opacity: 1, filter: 'blur(0px)', y: 0, duration, delay, ease: 'power3.out', onComplete: resolve }
    );
  });
}

/** Letter-by-letter reveal with stagger */
export async function letterReveal(element, text, stagger = 0.04) {
  element.textContent = '';
  const spans = text.split('').map(char => {
    const span = document.createElement('span');
    span.textContent = char === ' ' ? '\u00A0' : char;
    span.style.display = 'inline-block';
    span.style.opacity = '0';
    element.appendChild(span);
    return span;
  });
  return new Promise(resolve => {
    gsap.to(spans, {
      opacity: 1,
      y: 0,
      stagger,
      duration: 0.5,
      ease: 'power2.out',
      onComplete: resolve,
    });
  });
}

/** Smooth number interpolation */
export function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

/** Random float between min and max */
export function rand(min, max) {
  return Math.random() * (max - min) + min;
}

/** Random integer between min and max (inclusive) */
export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Check if an image URL exists (for gallery fallbacks) */
export function imageExists(url) {
  return new Promise(resolve => {
    if (!url) return resolve(false);
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = encodeURI(url);
  });
}

/** Check if a video source exists */
export function videoExists(url) {
  return new Promise(resolve => {
    if (!url) return resolve(false);
    const video = document.createElement('video');
    video.preload = 'metadata';
    let settled = false;

    const cleanup = () => {
      video.onloadedmetadata = null;
      video.onerror = null;
    };

    video.onloadedmetadata = () => {
      if (!settled) {
        settled = true;
        cleanup();
        resolve(true);
      }
    };

    video.onerror = () => {
      if (!settled) {
        settled = true;
        cleanup();
        resolve(false);
      }
    };

    setTimeout(() => {
      if (!settled) {
        settled = true;
        cleanup();
        resolve(video.readyState > 0 || !isNaN(video.duration));
      }
    }, 1500);

    video.src = encodeURI(url);
  });
}

/** Detect if device is mobile */
export function isMobile() {
  return window.matchMedia('(max-width: 768px)').matches || 'ontouchstart' in window;
}

/** Detect reduced motion preference */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Clean up a scene's DOM */
export function clearScene(container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}
