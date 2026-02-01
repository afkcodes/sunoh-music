/**
 * Sunoh Typography System
 * 
 * Font Families:
 * - Display: Gilroy
 * - Body: Gilroy
 * 
 * Scale: Major Third (1.25)
 */

import { TextStyle } from 'react-native';
import { fontNames, fontSizes, lineHeights } from './tokens';

export interface TypographyStyle extends TextStyle {
  fontSize: number;
  lineHeight: number;
}

// Font Family Configuration
export const fontFamily = {
  display: 'Gilroy',
  body: 'Gilroy',
};

// Helper for letter spacing calculation
// Headings get tighter tracking (-2%), Body gets normal
const letterSpacing = {
  tight: (size: number) => -0.02 * size,
  normal: 0,
  wide: (size: number) => 0.01 * size,
};

export const typography = {
  // Display - Hero / Marketing
  display: {
    fontSize: fontSizes.display,
    lineHeight: lineHeights.display,
    fontFamily: fontNames.bold,
    letterSpacing: letterSpacing.tight(fontSizes.display),
  } as TypographyStyle,

  // Headings
  h1: {
    fontSize: fontSizes.h1,
    lineHeight: lineHeights.h1,
    fontFamily: fontNames.semibold,
    letterSpacing: letterSpacing.tight(fontSizes.h1),
  } as TypographyStyle,

  h2: {
    fontSize: fontSizes.h2,
    lineHeight: lineHeights.h2,
    fontFamily: fontNames.semibold,
    letterSpacing: letterSpacing.tight(fontSizes.h2),
  } as TypographyStyle,

  h3: {
    fontSize: fontSizes.h3,
    lineHeight: lineHeights.h3,
    fontFamily: fontNames.medium,
    letterSpacing: 0,
  } as TypographyStyle,

  // Body Text
  bodyLarge: {
    fontSize: fontSizes.bodyLarge,
    lineHeight: lineHeights.bodyLarge,
    fontFamily: fontNames.regular,
    letterSpacing: 0,
  } as TypographyStyle,

  body: {
    fontSize: fontSizes.body,
    lineHeight: lineHeights.body,
    fontFamily: fontNames.regular,
    letterSpacing: 0,
  } as TypographyStyle,

  caption: {
    fontSize: fontSizes.caption,
    lineHeight: lineHeights.caption,
    fontFamily: fontNames.regular,
    letterSpacing: 0, 
  } as TypographyStyle,

  tiny: {
    fontSize: fontSizes.tiny,
    lineHeight: lineHeights.tiny,
    fontFamily: fontNames.medium,
    letterSpacing: letterSpacing.wide(fontSizes.tiny),
  } as TypographyStyle,
} as const;

export type Typography = typeof typography;
export type TypographyVariant = keyof typeof typography;
