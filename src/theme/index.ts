/**
 * Sunoh Theme System
 * 
 * Central export for all theme-related values.
 * Import from '@theme' for consistent styling across the app.
 */

// Colors
export { darkColors, lightColors } from './colors';
export type {
    AccentColor, BackgroundColor, Colors, SemanticColor, TextColor, ThemeColors
} from './colors';

// Typography
export { fontFamily, typography } from './typography';
export type {
    Typography, TypographyStyle, TypographyVariant
} from './typography';

// Spacing & Layout
export { borderRadius, layout, shadows, spacing } from './spacing';
export type {
    BorderRadius, Layout, Spacing
} from './spacing';

export { fontNames } from './tokens';

// Animations
export {
    durations,
    easings,
    patterns, springs, stagger
} from './animations';
export type {
    DurationKey, Durations, EasingKey, Easings, SpringKey, Springs
} from './animations';

// Design Tokens Hook
export { useAppTheme, useTheme } from './ThemeContext';
export { useDesignTokens } from './useDesignTokens';
export type { DesignTokens } from './useDesignTokens';

// Convenience re-export of the full theme object
export const theme = {
  colors: require('./colors').lightColors,
  typography: require('./typography').typography,
  spacing: require('./spacing').spacing,
  layout: require('./spacing').layout,
  borderRadius: require('./spacing').borderRadius,
  shadows: require('./spacing').shadows,
  springs: require('./animations').springs,
  durations: require('./animations').durations,
  easings: require('./animations').easings,
  patterns: require('./animations').patterns,
  stagger: require('./animations').stagger,
} as const;

export type Theme = typeof theme;
