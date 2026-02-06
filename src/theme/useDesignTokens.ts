/**
 * Design Tokens Hook
 * 
 * Pre-scaled design tokens that update on orientation change.
 * Uses the scaling system from style.util.ts
 */

import { useMemo } from 'react';

import { useScaling } from '../utils/style.util';

import * as tokens from './tokens';

/**
 * Helper to map object values through a callback
 */
function mapValues<T extends Record<string, number>>(
  obj: T,
  fn: (val: number) => number
): Record<keyof T, number> {
  const result = {} as Record<keyof T, number>;
  (Object.keys(obj) as Array<keyof T>).forEach((key) => {
    const value = obj[key];
    if (typeof value === 'number') {
      result[key] = fn(value);
    }
  });
  return result;
}

/**
 * Pre-scaled design tokens that update on orientation change.
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const { spacing, typography, radius } = useDesignTokens();
 *
 *   return (
 *     <View style={{ padding: spacing[4], borderRadius: radius.lg }}>
 *       <Text style={{ fontSize: typography.body, fontFamily: fonts.body }}>Title</Text>
 *     </View>
 *   );
 * };
 * ```
 */
export const useDesignTokens = () => {
  const s = useScaling();

  return useMemo(() => {
    // Scale all spacing tokens using mScale (for padding/margin)
    const spacing = mapValues(tokens.spacing, (v) => s.mScale(v));

    // Scale typography sizes using font() for accessibility
    const typography = mapValues(tokens.fontSizes, (v) => s.font(v));

    // Scale line heights
    const lineHeights = mapValues(tokens.lineHeights, (v) => s.font(v));

    // Scale radius
    const borderRadius = mapValues(tokens.radius, (v) => s.mScale(v));

    return {
      spacing,
      typography,
      lineHeights,
      borderRadius,
      fonts: tokens.fonts,
      fontNames: tokens.fontNames,

      // Text spacing for accessibility
      textSpacing: {
        xs: s.textSpacing(4),
        sm: s.textSpacing(8),
        md: s.textSpacing(12),
        lg: s.textSpacing(16),
        xl: s.textSpacing(24),
      },

      // Pass through scaling functions for custom values
      scale: s,

      // Device info for responsive layouts
      device: s.device,
    };
  }, [s]);
};

// Type export
export type DesignTokens = ReturnType<typeof useDesignTokens>;
