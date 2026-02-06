/**
 * Sunoh Design Tokens
 * 
 * DESIGN SYSTEM: SUNOH v1.0
 * PHILOSOPHY: "Invisible Precision" & "Luminous Dark"
 */

// --- Color Palette ---
export const palette = {
  // Coral Sunset (Unique Music App Brand)
  primary: {
    50: '#fff1f2',
    100: '#ffe4e6',
    200: '#fecdd3',
    300: '#fda4af',
    400: '#fb7185',
    500: '#f43f5e',
    600: '#e11d48',
    700: '#be123c',
    800: '#9f1239',
    900: '#881337',
    950: '#4c0519',
  },
  // Vibrant Emerald Green (Apex/Tailwind-aligned)
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  // Vibrant Red
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  // Vibrant Orange (Replaces Amber)
  warning: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  // Bright Blue (Info)
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  surface: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d1d1d6',
    400: '#a0a0ab',
    500: '#70707b',
    600: '#51515b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },
} as const;

// --- Typography ---

// Android-specific font file mappings
export const fontNames = {
  regular: 'Gilroy-Regular',
  medium: 'Gilroy-Medium',
  semibold: 'Gilroy-Semibold', // Matches filename
  bold: 'Gilroy-Bold',
} as const;

export const fonts = {
  display: fontNames.bold,
  body: fontNames.regular,
} as const;

export const fontSizes = {
  display: 32,
  h1: 24,
  h2: 20,
  h3: 18,
  bodyLarge: 17,
  body: 15,
  caption: 13,
  tiny: 11,
} as const;

export const lineHeights = {
  display: 40,
  h1: 32,
  h2: 28,
  h3: 24,
  bodyLarge: 24,
  body: 22,
  caption: 18,
  tiny: 14,
} as const;

export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

// --- Spacing (Base 4px) ---

export const spacing = {
  0: 0,
  1: 4,   // Icon gap
  2: 8,   // Grouping
  3: 12,  // UI padding
  4: 16,  // Edge separation
  5: 20,
  6: 24,  // Section separation
  8: 32,  // Relaxed gap
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
} as const;

// --- Foundations ---

export const radius = {
  none: 0,
  xs: 2,
  sm: 4,   // Tags, checkboxes
  md: 8,
  lg: 12,  // standard (Buttons, Cards)
  xl: 16,
  xxl: 24, // Sheets
  full: 9999,
} as const;

// Type exports
export type Palette = typeof palette;
export type Fonts = typeof fonts;
export type FontSizes = typeof fontSizes;
export type LineHeights = typeof lineHeights;
export type FontWeights = typeof fontWeights;
export type Spacing = typeof spacing;
export type Radius = typeof radius;
