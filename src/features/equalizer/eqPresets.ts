/**
 * Equalizer Presets
 * 10-band equalizer presets with frequency gains
 * Frequencies: 32Hz, 64Hz, 125Hz, 250Hz, 500Hz, 1kHz, 2kHz, 4kHz, 8kHz, 16kHz
 * 
 * Professional audio curves inspired by Harman target response research.
 * Each preset is psychoacoustically balanced for its intended use case.
 */

export interface EQPreset {
  id: string;
  name: string;
  gains: number[]; // 10 bands, -12 to +12 dB
  description: string;
}

export const FREQUENCY_LABELS = ['32', '64', '125', '250', '500', '1k', '2k', '4k', '8k', '16k'];

export const EQ_PRESETS: EQPreset[] = [
  // Base reference preset
  {
    id: 'flat',
    name: 'Flat',
    gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    description:
      'Pure, uncolored reference. The truth of your audio, exactly as intended.',
  },

  // Music genre specific presets - Each with distinct sonic fingerprint
  {
    id: 'rock',
    name: 'Rock',
    gains: [5, 3, -2, -3, -2, 2, 5, 7, 6, 4],
    description:
      'Aggressive punch with scooped mids and soaring highs. Guitar riffs cut through, drums hit hard.',
  },
  {
    id: 'pop',
    name: 'Pop',
    gains: [3, 4, 5, 4, 2, 1, 4, 6, 5, 3],
    description:
      'Radio-ready sparkle with forward vocals and controlled bass. Bright, commercial, addictive.',
  },
  {
    id: 'jazz',
    name: 'Jazz',
    gains: [4, 3, 2, 4, 1, -1, 2, 4, 5, 6],
    description:
      'Warm club intimacy with natural instrument timbre. Brushes shimmer, upright bass resonates deeply.',
  },
  {
    id: 'classical',
    name: 'Classical',
    gains: [2, 1, 0, 1, -2, -1, 2, 5, 7, 8],
    description:
      'Concert hall grandeur with pristine string detail. Wide dynamic range reveals every orchestral layer.',
  },
  {
    id: 'hip-hop',
    name: 'Hip-Hop',
    gains: [8, 6, 3, 1, -1, 0, 2, 4, 6, 5],
    description:
      'Subwoofer-crushing lows with crystalline hi-hats. 808s rumble, vocals sit perfectly in the pocket.',
  },
  {
    id: 'electronic',
    name: 'Electronic',
    gains: [6, 5, 2, 0, 1, 3, 4, 6, 8, 6],
    description:
      'Synthesizer sweetness with extended sub-bass. Laser-sharp highs, pulsing energy throughout.',
  },

  // Listening experience presets - Purposeful sonic shaping
  {
    id: 'bass-boost',
    name: 'Bass Boost',
    gains: [9, 7, 4, 2, 0, 0, 1, 2, 1, 0],
    description:
      'Deep rumble without mud. Feel the kick drum in your chest, basslines become visceral.',
  },
  {
    id: 'vocal-clarity',
    name: 'Vocal Clarity',
    gains: [-3, -2, 2, 6, 7, 6, 5, 3, 1, -1],
    description:
      'Every word crystal clear, like the singer is beside you. Perfect for podcasts and storytelling.',
  },
  {
    id: 'treble-boost',
    name: 'Treble Boost',
    gains: [0, 0, 0, 0, 2, 4, 6, 8, 9, 7],
    description:
      'Air and sparkle cascade from above. Cymbals shimmer endlessly, acoustic guitars breathe life.',
  },

  // Professional audio presets - Refined tools for discerning ears
  {
    id: 'studio-monitor',
    name: 'Studio Monitor',
    gains: [1, 0, -1, 1, 2, 3, 2, 3, 4, 2],
    description:
      'Mix engineer\'s choice. Reveals flaws and beauty equally, honest and unforgiving.',
  },
  {
    id: 'audiophile',
    name: 'Audiophile',
    gains: [3, 2, 1, 2, 0, 1, 3, 5, 6, 4],
    description:
      'High-resolution refinement. Micro-details emerge, soundstage expands, realism heightened.',
  },

  // Device-specific presets - Compensating for hardware limitations
  {
    id: 'headphones',
    name: 'Headphones',
    gains: [4, 3, 2, 3, 4, 4, 3, 5, 6, 5],
    description:
      'Immersive headphone optimization. Compensates for driver proximity, creates natural space.',
  },
  {
    id: 'earbuds',
    name: 'Earbuds',
    gains: [5, 4, 2, 2, 3, 4, 5, 7, 6, 4],
    description:
      'Earbud sweetening with enhanced presence. Small drivers deliver big sound, fatigue-free.',
  },
  {
    id: 'speakers',
    name: 'Speakers',
    gains: [3, 2, 2, 4, 3, 2, 3, 5, 6, 4],
    description:
      'Room-aware tuning for optimal speaker response. Balances reflections, tames resonances.',
  },

  // Special effect presets - Transform your listening experience
  {
    id: 'live-concert',
    name: 'Live Concert',
    gains: [4, 3, 2, 3, 4, 3, 6, 8, 7, 5],
    description:
      'Front-row energy without the crowd. Stadium reverb, amplifier grit, real performance presence.',
  },
  {
    id: 'midnight-mode',
    name: 'Midnight Mode',
    gains: [-4, -2, 2, 5, 4, 4, 3, 2, 0, -2],
    description:
      'Whisper-quiet dynamics for late hours. Explosions tamed, dialogue clear, neighbors sleeping.',
  },
  {
    id: 'workout',
    name: 'Workout',
    gains: [7, 6, 4, 2, 3, 4, 6, 5, 4, 3],
    description:
      'Adrenaline-pumping energy surge. Motivating punch pushes you harder, rhythm drives you forward.',
  },

  // Signature sound presets - Our unique sonic identity
  {
    id: 'warm-analog',
    name: 'Warm Analog',
    gains: [5, 4, 2, 2, 0, 1, 3, 5, 4, 2],
    description:
      'Vintage tape saturation warmth. Nostalgic tube glow, musical harmonic richness throughout.',
  },
  {
    id: 'crystal-clear',
    name: 'Crystal Clear',
    gains: [0, 1, 2, 4, 6, 7, 8, 7, 6, 5],
    description:
      'Transparent brilliance from top to bottom. Resolution so high, you hear the room, the breath.',
  },
  {
    id: 'rich-full',
    name: 'Rich & Full',
    gains: [5, 4, 3, 3, 4, 5, 4, 6, 5, 3],
    description:
      'Luxurious body and weight. Every frequency dense with harmonic content, musically satisfying.',
  },
  {
    id: 'atmospheric',
    name: 'Atmospheric',
    gains: [2, 1, 0, 1, 2, 3, 6, 8, 9, 7],
    description:
      'Ethereal soundscape expansion. Creates three-dimensional space, perfect for ambient immersion.',
  },
  {
    id: 'vibrant-pop',
    name: 'Vibrant Pop',
    gains: [4, 5, 6, 5, 3, 4, 6, 8, 7, 5],
    description:
      'Technicolor audio excitement. Pop hooks explode with energy, infectious and irresistible.',
  },
  {
    id: 'deep-impact',
    name: 'Deep Impact',
    gains: [10, 8, 5, 3, 1, 2, 4, 6, 7, 6],
    description:
      'Cinematic low-frequency authority. Explosions shake foundations, thunder rolls with power.',
  },
  {
    id: 'silk-smooth',
    name: 'Silk Smooth',
    gains: [3, 3, 2, 3, 4, 4, 3, 2, 0, -1],
    description:
      'Velvet-soft refinement removes all harshness. Hours of listening without a hint of fatigue.',
  },
  {
    id: 'presence-boost',
    name: 'Presence Boost',
    gains: [1, 2, 3, 5, 7, 8, 7, 6, 5, 3],
    description:
      'Intimate forward projection. Vocalists whisper in your ear, instruments surround you closely.',
  },

  // Advanced signature presets - Sophisticated sonic sculpting
  {
    id: 'studio-elite',
    name: 'Studio Elite',
    gains: [2, 1, 0, 2, 1, 3, 4, 6, 7, 5],
    description:
      'Mastering-grade precision with artistic touch. Clinical accuracy meets musical emotion.',
  },
  {
    id: 'bass-texture',
    name: 'Bass Texture',
    gains: [7, 6, 5, 3, 1, 0, 2, 3, 4, 3],
    description:
      'Articulate low-end definition. Hear individual bass notes, not just rumble. Musical clarity.',
  },
  {
    id: 'midrange-magic',
    name: 'Midrange Magic',
    gains: [1, 2, 3, 5, 6, 6, 5, 4, 3, 2],
    description:
      'Where music lives and breathes. Guitars sing, pianos resonate, voices connect emotionally.',
  },
  {
    id: 'high-definition',
    name: 'High Definition',
    gains: [2, 2, 3, 4, 5, 6, 7, 8, 8, 6],
    description:
      'Ultra-detailed top-end extension. Hear into the music, revealing layers you never knew existed.',
  },
  {
    id: 'balanced-premium',
    name: 'Balanced Premium',
    gains: [4, 3, 3, 4, 3, 4, 5, 6, 6, 4],
    description:
      'Sophisticated all-rounder with refined taste. Nothing exaggerated, everything enhanced perfectly.',
  },
  {
    id: 'dynamic-punch',
    name: 'Dynamic Punch',
    gains: [6, 5, 3, 2, 2, 3, 5, 7, 6, 4],
    description:
      'Explosive transient impact. Drums crack with authority, attacks are lightning-fast and precise.',
  },
  {
    id: 'lounge-chill',
    name: 'Lounge Chill',
    gains: [4, 4, 3, 3, 2, 2, 3, 4, 5, 4],
    description:
      'Relaxed sophistication for laid-back moments. Smooth jazz, downtempo, evening cocktails.',
  },
  {
    id: 'energy-surge',
    name: 'Energy Surge',
    gains: [6, 6, 5, 3, 4, 5, 7, 6, 5, 4],
    description:
      'High-octane motivation boost. Driving rhythm section propels you forward with unstoppable momentum.',
  },
];

// Organized preset categories for intuitive browsing
export const PRESET_CATEGORIES = {
  reference: ['flat', 'studio-monitor', 'audiophile', 'studio-elite'],
  genres: ['rock', 'pop', 'jazz', 'classical', 'hip-hop', 'electronic'],
  enhancement: ['bass-boost', 'vocal-clarity', 'treble-boost', 'bass-texture', 'midrange-magic', 'high-definition'],
  devices: ['headphones', 'earbuds', 'speakers'],
  moods: ['live-concert', 'midnight-mode', 'workout', 'lounge-chill', 'energy-surge'],
  signature: ['warm-analog', 'crystal-clear', 'rich-full', 'atmospheric', 'vibrant-pop', 'deep-impact', 'silk-smooth', 'presence-boost', 'balanced-premium', 'dynamic-punch'],
};

// Category display names and descriptions
export const CATEGORY_INFO = {
  reference: {
    name: 'Reference & Studio',
    description: 'Professional monitoring and accurate reproduction'
  },
  genres: {
    name: 'Music Genres',
    description: 'Optimized for specific musical styles'
  },
  enhancement: {
    name: 'Frequency Focus',
    description: 'Targeted enhancement of specific frequency ranges'
  },
  devices: {
    name: 'Device Optimization',
    description: 'Tailored for different playback systems'
  },
  moods: {
    name: 'Listening Situations',
    description: 'Perfect for specific activities and environments'
  },
  signature: {
    name: 'Signature Sound',
    description: 'Our unique sonic creations for distinctive listening experiences'
  },
};