/**
 * Theme Type Definitions
 */

import type { ThemeColors } from './colors';
import type { fonts } from './tokens';
import type { useDesignTokens } from './useDesignTokens';

// Helper to get ReturnType of useDesignTokens for typing
type DesignTokens = ReturnType<typeof useDesignTokens>;

export interface AppTheme extends DesignTokens {
  colors: ThemeColors;
  fonts: typeof fonts;
  isDark: boolean;
  mode: 'light' | 'dark' | 'system' | null | undefined;
}

export type ThemeMode = 'light' | 'dark' | 'system';
