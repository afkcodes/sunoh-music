/**
 * Equalizer Presets
 * 10-band equalizer presets with frequency gains
 * Frequencies: 32Hz, 64Hz, 125Hz, 250Hz, 500Hz, 1kHz, 2kHz, 4kHz, 8kHz, 16kHz
 * Tuned by: Audio Engineering Specialist
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
    description: 'Neutral sound signature. The baseline reference for uncolored playback.',
  },
  
  // Music genre specific presets - Balanced with "Harman-style" curves
  {
    id: 'rock',
    name: 'Rock',
    gains: [3, 4, 2, -1, -2, 0, 2, 3, 2, 1],
    description: 'Tightened kick drum (64Hz), reduced mud in the lower mids, and added bite for guitars.',
  },
  {
    id: 'pop',
    name: 'Pop',
    gains: [2, 3, 1, -1, 0, 2, 3, 2, 2, 1],
    description: 'Clean vocal range (1k-2k) with punchy mid-bass. Modern and radio-ready.',
  },
  {
    id: 'jazz',
    name: 'Jazz',
    gains: [2, 1, 0, 2, 1, 0, 1, 2, 3, 2],
    description: 'Warm lower-mids for brass and sax, with airy highs for cymbals. Intimate club feel.',
  },
  {
    id: 'classical',
    name: 'Classical',
    gains: [4, 3, 1, 0, -1, 0, 1, 2, 3, 2],
    description: 'Preserves dynamic range. Slight warmth for cellos and clarity for strings without shrillness.',
  },
  {
    id: 'hip-hop',
    name: 'Hip-Hop',
    gains: [6, 5, 2, -1, -2, 0, 1, 2, 3, 2],
    description: 'Focused sub-bass boost (32-64Hz) while keeping vocals clear of the bass bleed.',
  },
  {
    id: 'electronic',
    name: 'Electronic',
    gains: [5, 4, 1, -2, 0, 2, 1, 3, 5, 4],
    description: 'V-shaped curve. Deep synthesized bass and sparkling highs for EDM and Techno.',
  },

  // Listening experience presets - Psychoacoustic adjustments
  {
    id: 'bass-boost',
    name: 'Bass Boost',
    gains: [6, 7, 4, 1, -1, 0, 0, 0, 0, 0],
    description: 'High-impact low end without distorting the rest of the mix. Focuses on the "thump" (64Hz).',
  },
  {
    id: 'vocal-clarity',
    name: 'Vocal Clarity',
    gains: [-4, -3, -1, 1, 3, 5, 4, 2, 0, -2],
    description: 'Attenuates environmental rumble and enhances the speech intelligibility frequencies (1k-4k).',
  },
  {
    id: 'treble-boost',
    name: 'Treble Boost',
    gains: [-2, -1, 0, 1, 2, 3, 4, 5, 4, 3],
    description: 'Adds air and detail. Good for dark recordings or older speakers with rolled-off highs.',
  },

  // Professional audio presets - Reference & Critical Listening
  {
    id: 'studio-monitor',
    name: 'Studio Monitor',
    gains: [1, 0, -1, -1, 0, 0, 1, 1, 0, 0],
    description: 'Flattens the response of typical consumer gear to reveal the true mix balance.',
  },
  {
    id: 'audiophile',
    name: 'Audiophile',
    gains: [2, 1, 0, -1, -1, 0, 1, 2, 2, 1],
    description: 'A "gentle smile" curve. Subtle enhancement that retains the natural timbre of instruments.',
  },

  // Device-specific presets - Compensation curves
  {
    id: 'headphones',
    name: 'Headphones',
    gains: [4, 2, 0, -2, -1, 0, 1, 2, 3, 2],
    description: 'Compensates for the "in-head" localization effect. Widens the soundstage slightly.',
  },
  {
    id: 'earbuds',
    name: 'Earbuds',
    gains: [5, 4, 2, 0, 1, 2, 3, 4, 3, 2],
    description: 'Compensates for the lack of seal and driver size in smaller buds. Restores lost body.',
  },
  {
    id: 'speakers',
    name: 'Speakers',
    gains: [1, 0, 2, 1, 0, -1, 0, 1, 2, 1],
    description: 'Compensates for room reflections. Slight dip in presence region to reduce harshness in untreated rooms.',
  },

  // Special effect presets
  {
    id: 'live-concert',
    name: 'Live Concert',
    gains: [4, 3, 1, 2, 0, 1, 2, 3, 3, 2],
    description: 'Emphasizes the reverberation frequencies to widen the stereo image and create immersion.',
  },
  {
    id: 'midnight-mode',
    name: 'Midnight Mode',
    gains: [5, 3, 0, 0, 2, 3, 2, 0, -2, -4],
    description: 'Loudness compensation. Boosts bass/mids at low volumes so you hear full detail without waking the house.',
  },
  {
    id: 'workout',
    name: 'Workout',
    gains: [5, 5, 2, 0, 1, 2, 4, 3, 3, 2],
    description: 'Aggressive V-shape for high energy. maximizing rhythm and tempo perception.',
  },

  // Rich and vibrant sound presets - "Coloration"
  {
    id: 'warm-analog',
    name: 'Warm Analog',
    gains: [3, 4, 2, 1, 0, -1, -1, 0, -1, -3],
    description: 'Rolled-off highs and saturated low-mids to mimic vintage tube amplifiers and vinyl.',
  },
  {
    id: 'crystal-clear',
    name: 'Crystal Clear',
    gains: [-1, 0, 1, -1, 2, 4, 5, 4, 3, 2],
    description: 'Surgical boost in the "presence" and "brilliance" regions. Reveals breath and string noise.',
  },
  {
    id: 'rich-full',
    name: 'Rich & Full',
    gains: [3, 4, 3, 2, 1, 0, 1, 2, 1, 0],
    description: 'Broad boosts in the fundamental frequencies. Adds weight without muddiness.',
  },
  {
    id: 'atmospheric',
    name: 'Atmospheric',
    gains: [4, 2, 0, -1, -2, 0, 2, 4, 6, 5],
    description: 'Scooped mids to push instruments back, creating a vast, spacious soundscape.',
  },
  {
    id: 'vibrant-pop',
    name: 'Vibrant Pop',
    gains: [2, 3, 1, 0, 2, 4, 5, 4, 3, 2],
    description: 'Forward-sounding and exciting. Brings the artist "in front" of the mix.',
  },
  {
    id: 'deep-impact',
    name: 'Deep Impact',
    gains: [6, 5, 2, 0, -2, -1, 1, 2, 3, 2],
    description: 'Cinematic rumble. Focuses on sub-bass extension (32Hz) for movie explosions and drops.',
  },
  {
    id: 'silk-smooth',
    name: 'Silk Smooth',
    gains: [2, 2, 1, 0, 1, 0, -1, -2, -3, -4],
    description: 'De-essed. Aggressively rolls off harsh high frequencies for fatigue-free listening.',
  },
  {
    id: 'presence-boost',
    name: 'Presence Boost',
    gains: [0, 0, 1, 2, 4, 5, 4, 2, 0, -1],
    description: 'Focuses on 1k-4k Hz. Brings instruments and vocals physically closer to the listener.',
  },
];

// Preset categories for organization
export const PRESET_CATEGORIES = {
  quickAccess: ['flat', 'bass-boost', 'vocal-clarity', 'rock', 'pop', 'vibrant-pop'],
  genres: ['jazz', 'classical', 'hip-hop', 'electronic'],
  richVibrant: ['warm-analog', 'crystal-clear', 'rich-full', 'atmospheric', 'deep-impact', 'silk-smooth', 'presence-boost'],
  audioEnhancement: ['treble-boost', 'studio-monitor', 'audiophile', 'live-concert'],
  deviceSituation: ['headphones', 'earbuds', 'speakers', 'midnight-mode', 'workout'],
};