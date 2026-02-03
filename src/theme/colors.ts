/**
 * Semantic Color Mapping
 * 
 * Maps the primitive palette (tokens) to semantic roles.
 */

import { getAccessibleTextColor } from '../utils/color.util';
import { palette } from './tokens';

// Shared type definition for Colors
export type ColorValue = string;

export interface ThemeColors {
  // Backgrounds
  bgPage: ColorValue;
  bgSurface: ColorValue;
  bgSurfaceHover: ColorValue;
  bgElevated: ColorValue;

  // Borders
  borderSubtle: ColorValue;
  borderStrong: ColorValue;

  // Text
  textPrimary: ColorValue;
  textSecondary: ColorValue;
  textTertiary: ColorValue;
  textInverse: ColorValue;

  // Primary (Brand)
  primaryBase: ColorValue;
  primaryHover: ColorValue;
  primarySurface: ColorValue;
  primaryText: ColorValue;
  
  // Feedback
  success: ColorValue;
  successBg: ColorValue;
  successText: ColorValue;
  warning: ColorValue;
  warningBg: ColorValue;
  warningText: ColorValue;
  error: ColorValue;
  errorBg: ColorValue;
  errorText: ColorValue;

  // Overlay
  overlay: ColorValue;
}

export const lightColors: ThemeColors = {
  bgPage: palette.surface[50],      // #FAFAFA
  bgSurface: '#FFFFFF',             // White cards
  bgSurfaceHover: palette.surface[100],
  bgElevated: '#FFFFFF',

  borderSubtle: palette.surface[200],
  borderStrong: palette.surface[400],

  textPrimary: palette.surface[950],   // #09090B
  textSecondary: palette.surface[500], // #70707B
  textTertiary: palette.surface[400],
  textInverse: '#FFFFFF',

  primaryBase: palette.primary[600], // #059669 - Emerald Green
  primaryHover: palette.primary[700], // #047857
  primarySurface: palette.primary[50],
  primaryText: getAccessibleTextColor(palette.primary[600]),

  success: palette.success[600],
  successBg: palette.success[50],
  successText: getAccessibleTextColor(palette.success[600]),
  warning: palette.warning[600],
  warningBg: palette.warning[50],
  warningText: getAccessibleTextColor(palette.warning[600]),
  error: palette.danger[600],
  errorBg: palette.danger[50],
  errorText: getAccessibleTextColor(palette.danger[600]),

  overlay: 'rgba(0, 0, 0, 0.4)',
};

export const darkColors: ThemeColors = {
  bgPage: palette.surface[950],    // #09090b - Nearly black
  bgSurface: palette.surface[900],  // #18181b
  bgSurfaceHover: palette.surface[800],
  bgElevated: palette.surface[800],

  borderSubtle: palette.surface[800],
  borderStrong: palette.surface[600],

  textPrimary: palette.surface[50],    // #fafafa
  textSecondary: palette.surface[400], // #a0a0ab
  textTertiary: palette.surface[600],
  textInverse: palette.surface[950],

  primaryBase: palette.primary[500], // #10b981 - Brighter emerald for dark mode
  primaryHover: palette.primary[600], // #059669
  primarySurface: palette.primary[900],
  primaryText: getAccessibleTextColor(palette.primary[500]),

  success: palette.success[600],
  successBg: palette.success[50],
  successText: getAccessibleTextColor(palette.success[600]),
  warning: palette.warning[600],
  warningBg: palette.warning[50],
  warningText: getAccessibleTextColor(palette.warning[600]),
  error: palette.danger[600],
  errorBg: palette.danger[50],
  errorText: getAccessibleTextColor(palette.danger[600]),

  overlay: 'rgba(0, 0, 0, 0.7)',
};

// Types for consumption
export type AccentColor = ColorValue;
export type BackgroundColor = ColorValue;
export type TextColor = ColorValue;
export type SemanticColor = keyof ThemeColors;
export type Colors = ThemeColors;
