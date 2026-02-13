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
  // ─────────────────────────────────────────────────────────────
  // REFERENCE
  // ─────────────────────────────────────────────────────────────
  {
    id: 'flat',
    name: 'Flat',
    gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    description: 'Pure, uncolored playback. The reference baseline.',
  },

  // ─────────────────────────────────────────────────────────────
  // SOUND SIGNATURES
  // ─────────────────────────────────────────────────────────────
  {
    id: 'bass',
    name: 'Bass',
    gains: [5, 6, 3, 0, -1, 0, 0, 0, 0, 0],
    description: 'Clean sub-bass impact centered at 64Hz without muddying the mids.',
  },
  {
    id: 'treble',
    name: 'Treble',
    gains: [0, 0, 0, 0, 0, 1, 2, 3, 4, 3],
    description: 'Enhanced clarity and air. Reveals detail in recordings.',
  },
  {
    id: 'vocal',
    name: 'Vocal',
    gains: [-3, -2, 0, 1, 2, 4, 3, 1, 0, -1],
    description: 'Prioritizes speech intelligibility. Clear vocals, reduced rumble.',
  },
  {
    id: 'rich',
    name: 'Rich & Vibrant',
    gains: [3, 4, 2, 1, 0, 1, 2, 3, 2, 1],
    description: 'Warm, full-bodied sound with enhanced presence. Lush and engaging.',
  },
  {
    id: 'soundstage',
    name: 'Soundstage',
    gains: [2, 1, -1, -2, -1, 0, 1, 3, 4, 3],
    description: 'Widens spatial perception. Creates depth and instrument separation.',
  },

  // ─────────────────────────────────────────────────────────────
  // MUSIC GENRES (Harman-inspired tuning)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'rock',
    name: 'Rock',
    gains: [3, 4, 2, 0, -1, 1, 2, 3, 2, 1],
    description: 'Punchy drums, crisp guitars, forward vocals.',
  },
  {
    id: 'pop',
    name: 'Pop',
    gains: [2, 3, 1, 0, 1, 2, 3, 2, 2, 1],
    description: 'Modern, radio-ready sound with clean bass and bright vocals.',
  },
  {
    id: 'hiphop',
    name: 'Hip-Hop',
    gains: [6, 5, 2, 0, -1, 1, 2, 3, 3, 2],
    description: 'Deep sub-bass extension with clear vocal presence.',
  },
  {
    id: 'electronic',
    name: 'Electronic',
    gains: [5, 4, 1, -1, 0, 1, 2, 4, 5, 4],
    description: 'V-shaped curve for synthesized bass and sparkling highs.',
  },
  {
    id: 'acoustic',
    name: 'Acoustic',
    gains: [2, 1, 0, 1, 1, 0, 1, 2, 3, 2],
    description: 'Natural warmth for acoustic instruments and jazz ensembles.',
  },
  {
    id: 'classical',
    name: 'Classical',
    gains: [3, 2, 1, 0, 0, 0, 1, 2, 3, 2],
    description: 'Preserves dynamics. Rich low-end, detailed strings.',
  },

  // ─────────────────────────────────────────────────────────────
  // DEVICES & SITUATIONS
  // ─────────────────────────────────────────────────────────────
  {
    id: 'headphones',
    name: 'Headphones',
    gains: [3, 2, 0, -1, 0, 0, 1, 2, 2, 1],
    description: 'Optimized for over-ear headphones. Natural soundstage.',
  },
  {
    id: 'earbuds',
    name: 'Earbuds',
    gains: [4, 3, 1, 0, 1, 1, 2, 3, 2, 1],
    description: 'Compensates for small drivers. Restores body and detail.',
  },
  {
    id: 'speakers',
    name: 'Speakers',
    gains: [1, 0, 1, 1, 0, 0, 0, 1, 2, 1],
    description: 'Room-friendly tuning. Reduced harshness in reflective spaces.',
  },
  {
    id: 'latenight',
    name: 'Late Night',
    gains: [4, 3, 1, 1, 2, 2, 1, 0, -1, -2],
    description: 'Loudness compensation for low-volume listening. Full sound, quiet output.',
  },
  {
    id: 'workout',
    name: 'Workout',
    gains: [5, 5, 2, 0, 1, 2, 3, 4, 3, 2],
    description: 'High-energy V-shape. Maximum impact for intense sessions.',
  },
];

// Simplified preset categories
export const PRESET_CATEGORIES = {
  signatures: ['flat', 'bass', 'treble', 'vocal', 'rich', 'soundstage'],
  genres: ['rock', 'pop', 'hiphop', 'electronic', 'acoustic', 'classical'],
  situational: ['headphones', 'earbuds', 'speakers', 'latenight', 'workout'],
};