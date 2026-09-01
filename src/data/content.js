/**
 * ============================================
 * FOR VANILLA 🌙 — Content Configuration
 * ============================================
 * 
 * Edit the text content below to personalize the experience.
 * All story text, messages, and labels are defined here.
 */

export const content = {
  // --- Opening Scene ---
  opening: {
    line1: 'Hey Vanilla...',
    line2: 'I made something for you.',
    line3: 'Just stay for a little while.',
  },

  // --- Story / Timeline ---
  story: {
    intro: "We didn't exactly have the smoothest start...",
    timeline: [
      { date: '1 AUG', type: 'love', text: 'The day it all began.' },
      { date: '3 AUG', type: 'apart', text: 'We stumbled. It hurt.' },
      { date: '8 AUG', type: 'love', text: 'But we found our way back.' },
      { date: '12 AUG', type: 'apart', text: 'We fought. Again.' },
      { date: '15 AUG', type: 'love', text: 'And came back. Again.' },
    ],
    outro: [
      'We had our good days.',
      'We had our bad days.',
      'We fought.',
      'We found our way back.',
      'And somehow...',
      'Here we are.',
    ],
    final: "And I'm really glad we are.",
  },

  // --- Things I Love ---
  thingsILove: {
    intro: 'Some things I noticed about you...',
    items: [
      { text: 'Your eyes.', delay: 0 },
      { text: 'Your smile.', delay: 0.2 },
      { text: 'Your kindness.', delay: 0.4 },
      { text: 'Your cooking.', delay: 0.6 },
    ],
    // This one gets special treatment
    special: 'And that ridiculously cute childish accent of yours.',
  },

  // --- First Kiss ---
  firstKiss: {
    line1: 'And then...',
    line2: 'Our first kiss.',
    linger: 'Some moments you just want to live in forever.',
  },

  // --- Birthday Video ---
  birthday: {
    line1: "There's something funny...",
    line2: 'Before we were even together...',
    line3: 'I was already excited to make you smile.',
    caption: 'Your birthday. Before us. Already yours.',
    // Video file path (place your video in assets/videos/)
    videoSrc: './videos/WhatsApp Video 2026-09-01 at 16.29.53.mp4',
    placeholder: 'Place your video inside assets/videos/',
  },

  // --- Letter ---
  letter: {
    // ============================================
    // ✍️  WRITE YOUR PERSONAL LETTER BELOW
    // ============================================
    // Replace the placeholder text with your own words.
    // Line breaks are preserved. Use \n for new lines.
    body: `[Your letter goes here]

Write from the heart.
She'll read every word.
Make it count.`,
    signature: '— Pituuu',
  },

  // --- Core Message ---
  coreMessage: [
    'I know this month had mixed emotions.',
    'Good days. Bad days. Everything in between.',
    'But getting you in my life...',
    'is one of the best things that has happened to me in years.',
    'I know it\'s only been a month.',
    'I know saying this so early might sound crazy.',
    'But what I feel for you is real.',
    'Every bit of it.',
  ],

  // --- Finale ---
  finale: {
    preReveal: [
      'Maybe it\'s too early to know.',
      'Maybe I\'m just hopelessly in love.',
      'But if you ask me what I feel...',
    ],
    theOne: 'I think you\'re the one.',
    anniversary: 'Happy 1 Month, Vanilla ❤️',
    signature: '— Pituuu',
    name: 'VAIDEHI',
  },
};

/**
 * Easter egg: "Simple dimpl pop it squish"
 * Hidden in the experience — she'll find it if she looks. 🌟
 */
export const EASTER_EGG = 'Simple dimpl pop it squish';

/**
 * Easter egg: Geeta Thakur
 * A tiny playful reference to how it all started.
 */
export const ORIGIN_EASTER_EGG = 'Geeta Thakur';
