/**
 * Sunoh Spacing & Layout
 * 
 * Base unit: 4px
 * Density: Compact (Mobile default)
 */

import { radius, spacing as tokens } from './tokens';

// Semantic Spacing
export const spacing = {
  xxs: tokens[0], // 0
  xs: tokens[1],  // 4
  sm: tokens[2],  // 8
  md: tokens[3],  // 12
  lg: tokens[4],  // 16
  xl: tokens[6],  // 24
  xxl: tokens[8], // 32
  section: tokens[12], // 48
} as const;

export const layout = {
  // Screen
  screenPaddingHorizontal: tokens[4], // 16px (Compact mobile standard)
  screenPaddingVertical: tokens[4],
  containerMaxWidth: 1100, // Web container constraint

  // Components
  cardPadding: tokens[4],
  cardGap: tokens[2],
  
  // Lists
  itemPadding: tokens[4],
  itemGap: tokens[3],
  
  // Touch Targets
  minTouchTarget: 44,
  
  // Safe Areas
  safeTop: 44,
  safeBottom: 34,
} as const;

// Re-export radius from tokens as the standard
export const borderRadius = radius;

// Shadows (Luminous Dark Strategy)
// In dark mode, shadows are less effective. We rely on border + background separation.
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    // Subtle lift
    shadowColor: 'rgb(0, 0, 0)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    // Floating element
    shadowColor: 'rgb(0, 0, 0)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;

export type Spacing = typeof spacing;
export type Layout = typeof layout;
export type BorderRadius = typeof borderRadius;
