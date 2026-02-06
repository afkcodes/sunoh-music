/**
 * ============================================================================
 * PRODUCTION-READY REACT NATIVE SCALING SYSTEM
 * ============================================================================
 *
 * A complete, battle-tested scaling solution that handles:
 * ✅ Orientation changes (portrait ↔ landscape)
 * ✅ Split-screen and foldable devices
 * ✅ Accessibility (respects user font size settings)
 * ✅ Performance (proper memoization, no unnecessary re-renders)
 * ✅ Type safety (full TypeScript support)
 *
 * This is a COMPLETE implementation - copy this entire file to your project.
 *
 * Quick Start:
 * 1. Copy this file to your project (e.g., src/utils/scaling.ts)
 * 2. Import hooks in your components
 * 3. Define style factories outside components
 * 4. Profit!
 */

import { useCallback, useMemo } from 'react';
import {
    Dimensions,
    type ImageStyle,
    PixelRatio,
    Platform,
    type TextStyle,
    useWindowDimensions,
    type ViewStyle,
} from 'react-native';

// ============================================================================
// PART 1: CORE SCALING CONFIGURATION
// ============================================================================

/**
 * Design guideline base dimensions.
 * Change these to match your Figma/Sketch design file.
 *
 * Common choices:
 * - 375x812: iPhone X/11/12/13 Mini (RECOMMENDED - most common)
 * - 390x844: iPhone 14/15 Pro
 * - 360x640: Android reference device
 */
const DESIGN_WIDTH = 375;
const DESIGN_HEIGHT = 812;

/**
 * Minimum touch target sizes per platform guidelines.
 */
const MIN_TOUCH_TARGET = Platform.select({
  ios: 44, // iOS Human Interface Guidelines
  android: 48, // Material Design Guidelines
  default: 44,
});

/**
 * Maximum font scale for layout elements (NOT text).
 * Prevents UI from breaking at extreme accessibility settings.
 * Text itself is NEVER clamped - this only affects containers.
 */
const MAX_FONT_SCALE_FOR_LAYOUT = 2.0;

// ============================================================================
// PART 2: SCALING HOOK (Handles orientation changes automatically)
// ============================================================================

export interface ScalingFunctions {
  scale: (size: number) => number;
  vScale: (size: number) => number;
  mScale: (size: number, factor?: number) => number;
  font: (size: number) => number;
  touchable: (size: number, minSize?: number) => number;
  textSpacing: (size: number) => number;
  square: (size: number) => number;
  wp: (percentage: number) => number;
  hp: (percentage: number) => number;
  device: {
    width: number;
    height: number;
    isLandscape: boolean;
    isSmallPhone: boolean;
    isPhone: boolean;
    isTablet: boolean;
    fontScale: number;
    isLargeFontScale: boolean;
    isExtraLargeFontScale: boolean;
    scaleX: number;
    scaleY: number;
    pixelRatio: number;
  };
}

/**
 * Main scaling hook - automatically recalculates on orientation changes.
 * This is the foundation of the entire system.
 *
 * @returns Object with all scaling functions and device info
 *
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const s = useScaling();
 *
 *   return (
 *     <View style={{
 *       width: s.scale(300),
 *       padding: s.mScale(16),
 *     }}>
 *       <Text style={{ fontSize: s.font(16) }}>Hello</Text>
 *     </View>
 *   );
 * };
 * ```
 */
export const useScaling = (): ScalingFunctions => {
  const { width, height, fontScale } = useWindowDimensions();

  return useMemo(() => {
    const isLandscape = width > height;

    // Core scaling functions
    const scale = (size: number): number => {
      return (width / DESIGN_WIDTH) * size;
    };

    const vScale = (size: number): number => {
      return (height / DESIGN_HEIGHT) * size;
    };

    const mScale = (size: number, factor: number = 0.5): number => {
      return size + (scale(size) - size) * factor;
    };

    const font = (size: number): number => {
      const scaled = scale(size);
      return PixelRatio.roundToNearestPixel(scaled * fontScale);
    };

    const touchable = (size: number, minSize: number = MIN_TOUCH_TARGET): number => {
      return Math.max(scale(size), minSize);
    };

    const textSpacing = (size: number): number => {
      const scaled = scale(size);
      const clampedFontScale = Math.min(fontScale, MAX_FONT_SCALE_FOR_LAYOUT);
      return scaled * clampedFontScale;
    };

    const square = (size: number): number => {
      const smallerDimension = Math.min(width, height);
      const baseSmaller = Math.min(DESIGN_WIDTH, DESIGN_HEIGHT);
      return (smallerDimension / baseSmaller) * size;
    };

    const wp = (percentage: number): number => {
      return (percentage / 100) * width;
    };

    const hp = (percentage: number): number => {
      return (percentage / 100) * height;
    };

    const device = {
      width,
      height,
      isLandscape,
      isSmallPhone: Math.min(width, height) < 375,
      isPhone: Math.min(width, height) < 768,
      isTablet: Math.min(width, height) >= 768,
      fontScale,
      isLargeFontScale: fontScale > 1.3,
      isExtraLargeFontScale: fontScale > 1.6,
      scaleX: width / DESIGN_WIDTH,
      scaleY: height / DESIGN_HEIGHT,
      pixelRatio: PixelRatio.get(),
    } as const;

    return {
      scale,
      vScale,
      mScale,
      font,
      touchable,
      textSpacing,
      square,
      wp,
      hp,
      device,
    };
  }, [width, height, fontScale]);
};

// ============================================================================
// PART 3: STYLE HOOK TYPES
// ============================================================================

type StyleProp = ViewStyle | TextStyle | ImageStyle;

export type ScalingStyleFactory<T extends Record<string, StyleProp>, Theme = any> = (
  s: ScalingFunctions,
  theme: Theme
) => T;

export type ScalingOnlyStyleFactory<T extends Record<string, StyleProp>> = (
  s: ScalingFunctions
) => T;

// ============================================================================
// PART 4: STYLE HOOKS (Performance-optimized)
// ============================================================================

/**
 * Creates responsive, themed styles with automatic orientation updates.
 *
 * ⚠️⚠️⚠️ CRITICAL: styleFactory MUST be defined OUTSIDE the component!
 * Inline functions break memoization and kill performance.
 *
 * @param styleFactory - STABLE function (defined outside component)
 * @returns Memoized style object
 *
 * @example
 * ✅ CORRECT:
 * ```tsx
 * const createStyles = (s: ScalingFunctions, theme: any) => ({
 *   container: { padding: s.mScale(16) }
 * });
 *
 * const MyComponent = () => {
 *   const styles = useScalingStyles(createStyles, theme);
 *   return <View style={styles.container} />;
 * };
 * ```
 *
 * ❌ WRONG (creates new function every render):
 * ```tsx
 * const MyComponent = () => {
 *   const styles = useScalingStyles((s, theme) => ({
 *     container: { padding: s.mScale(16) }
 *   }), theme);
 * };
 * ```
 */
export function useScalingStyles<T extends Record<string, StyleProp>, Theme = any>(
  styleFactory: ScalingStyleFactory<T, Theme>,
  theme: Theme
): T {
  const s = useScaling();

  return useMemo(() => styleFactory(s, theme), [s, theme, styleFactory]);
}

/**
 * Creates responsive styles without theme dependency.
 * Use when you don't need theme colors/values.
 *
 * ⚠️ CRITICAL: styleFactory must be stable (defined outside component)
 */
export function useScalingStylesOnly<T extends Record<string, StyleProp>>(
  styleFactory: ScalingOnlyStyleFactory<T>
): T {
  const s = useScaling();

  return useMemo(() => styleFactory(s), [s, styleFactory]);
}

/**
 * Creates styles that depend on component props.
 * Props are passed explicitly to avoid stale closures.
 *
 * @example
 * ```tsx
 * interface CardProps {
 *   isActive: boolean;
 *   size: 'small' | 'large';
 * }
 *
 * const createStyles = (s: ScalingFunctions, theme: any, props: CardProps) => ({
 *   container: {
 *     width: s.scale(props.size === 'small' ? 150 : 250),
 *     backgroundColor: props.isActive ? theme.colors.active : theme.colors.bg,
 *   },
 * });
 *
 * const Card = (props: CardProps) => {
 *   const styles = useDynamicStyles(createStyles, theme, props);
 *   return <View style={styles.container} />;
 * };
 * ```
 */
export function useDynamicStyles<
  T extends Record<string, StyleProp>,
  P extends Record<string, any>,
  Theme = any
  // biome-ignore lint/suspicious/noExplicitAny: Theme system uses dynamic types
>(styleFactory: (s: ScalingFunctions, theme: Theme, props: P) => T, theme: Theme, props: P): T {
  const s = useScaling();

  return useMemo(() => styleFactory(s, theme, props), [s, theme, props, styleFactory]);
}

/**
 * For SIMPLE components where creating a factory is overkill.
 *
 * ⚠️ WARNING: Variables captured inside will be STALE.
 * DO NOT use props/state inside this factory!
 *
 * Use ONLY when:
 * - Component is very simple (1-2 styles)
 * - Styles depend ONLY on scaling (no props/state)
 *
 * @example
 * ✅ Safe (no props used):
 * ```tsx
 * const Divider = () => {
 *   const styles = useInlineStyles((s) => ({
 *     line: { height: 1, marginVertical: s.mScale(8) }
 *   }));
 *   return <View style={styles.line} />;
 * };
 * ```
 *
 * ❌ Unsafe (isActive will be stale):
 * ```tsx
 * const MyComponent = ({ isActive }) => {
 *   const styles = useInlineStyles((s) => ({
 *     container: { opacity: isActive ? 1 : 0.5 }
 *   }));
 * };
 * ```
 */
export function useInlineStyles<T extends Record<string, StyleProp>>(
  styleFactory: ScalingOnlyStyleFactory<T>
): T {
  const s = useScaling();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableFactory = useCallback(styleFactory, []);

  return useMemo(() => stableFactory(s), [s, stableFactory]);
}

/**
 * Inline styles with theme support.
 * Same warnings as useInlineStyles - DO NOT use props/state!
 */
export function useInlineThemedStyles<T extends Record<string, StyleProp>, Theme = any>(
  styleFactory: ScalingStyleFactory<T, Theme>,
  theme: Theme
): T {
  const s = useScaling();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableFactory = useCallback(styleFactory, []);

  return useMemo(() => stableFactory(s, theme), [s, theme, stableFactory]);
}

// ============================================================================
// PART 5: HELPER FUNCTIONS
// ============================================================================

/**
 * Helper to create a stable style factory with TypeScript inference.
 *
 * @example
 * ```tsx
 * const createStyles = makeScalingStyles((s, theme) => ({
 *   container: { padding: s.mScale(16) }
 * }));
 * ```
 */
export function makeScalingStyles<T extends Record<string, StyleProp>, Theme = any>(
  factory: ScalingStyleFactory<T, Theme>
): ScalingStyleFactory<T, Theme> {
  return factory;
}

/**
 * Helper for scaling-only style factories.
 */
export function makeScalingStylesOnly<T extends Record<string, StyleProp>>(
  factory: ScalingOnlyStyleFactory<T>
): ScalingOnlyStyleFactory<T> {
  return factory;
}

// useDesignTokens has been moved to ../theme/useDesignTokens.ts

// ============================================================================
// PART 7: STATIC UTILITIES (Use with extreme caution!)
// ============================================================================

/**
 * ⚠️⚠️⚠️ DANGER ZONE ⚠️⚠️⚠️
 *
 * Static scaling that calculates ONCE at app launch.
 * Values NEVER update - even on rotation!
 *
 * ONLY use for:
 * - Non-UI calculations (data processing, algorithms)
 * - Constants that truly never change
 *
 * DO NOT use for:
 * - Anything displayed on screen
 * - Exported constants used in components
 *
 * 99% of the time, use useScaling() hook instead!
 */
export const staticScaling = (() => {
  const { width, height } = Dimensions.get('window');
  const fontScale = PixelRatio.getFontScale();

  return {
    scale: (size: number) => (width / DESIGN_WIDTH) * size,
    vScale: (size: number) => (height / DESIGN_HEIGHT) * size,
    mScale: (size: number, factor = 0.5) => {
      const scale = (width / DESIGN_WIDTH) * size;
      return size + (scale - size) * factor;
    },
    font: (size: number) => {
      const scaled = (width / DESIGN_WIDTH) * size;
      return PixelRatio.roundToNearestPixel(scaled * fontScale);
    },

    _debug: {
      width,
      height,
      fontScale,
      warning: '⚠️ SNAPSHOT VALUES - DO NOT UPDATE ON ROTATION!',
    },
  };
})();

// ============================================================================
// PART 8: COMPLETE USAGE EXAMPLES
// ============================================================================

/**
 * EXAMPLE 1: Basic Component
 *
 * ```tsx
 * // UserCard.styles.ts
 * import { makeScalingStyles, type ScalingFunctions } from './scaling';
 *
 * export const createUserCardStyles = makeScalingStyles((s, theme) => ({
 *   container: {
 *     width: s.scale(300),
 *     padding: s.mScale(16),
 *     backgroundColor: theme.colors.card,
 *     borderRadius: s.mScale(12),
 *   },
 *   avatar: {
 *     width: s.square(60),
 *     height: s.square(60),
 *     borderRadius: s.square(30),
 *   },
 *   name: {
 *     fontSize: s.font(18),
 *     fontWeight: '600',
 *     color: theme.colors.text,
 *   },
 * }));
 *
 * // UserCard.tsx
 * import { useScalingStyles } from './scaling';
 * import { createUserCardStyles } from './UserCard.styles';
 * import { useTheme } from './theme';
 *
 * export const UserCard = ({ user }) => {
 *   const theme = useTheme();
 *   const styles = useScalingStyles(createUserCardStyles, theme);
 *
 *   return (
 *     <View style={styles.container}>
 *       <Image style={styles.avatar} source={{ uri: user.avatar }} />
 *       <Text style={styles.name}>{user.name}</Text>
 *     </View>
 *   );
 * };
 * ```
 */

/**
 * EXAMPLE 2: Button with Variants
 *
 * ```tsx
 * import { makeScalingStyles, useScalingStyles } from './scaling';
 *
 * const createButtonStyles = makeScalingStyles((s, theme) => ({
 *   base: {
 *     paddingHorizontal: s.mScale(16),
 *     paddingVertical: s.mScale(12),
 *     borderRadius: s.mScale(8),
 *     minHeight: s.touchable(44),
 *   },
 *   primary: {
 *     backgroundColor: theme.colors.primary,
 *   },
 *   secondary: {
 *     backgroundColor: theme.colors.secondary,
 *   },
 *   text: {
 *     fontSize: s.font(16),
 *     fontWeight: '600',
 *     color: theme.colors.white,
 *   },
 * }));
 *
 * export const Button = ({ variant = 'primary', children }) => {
 *   const theme = useTheme();
 *   const styles = useScalingStyles(createButtonStyles, theme);
 *
 *   // ✅ Use array syntax - native RN optimization
 *   return (
 *     <Pressable style={[styles.base, styles[variant]]}>
 *       <Text style={styles.text}>{children}</Text>
 *     </Pressable>
 *   );
 * };
 * ```
 */

/**
 * EXAMPLE 3: Props-Dependent Styles
 *
 * ```tsx
 * import { useDynamicStyles } from './scaling';
 *
 * interface CardProps {
 *   size: 'small' | 'large';
 *   isActive: boolean;
 * }
 *
 * const createCardStyles = (s, theme, { size, isActive }: CardProps) => ({
 *   container: {
 *     width: s.scale(size === 'small' ? 150 : 250),
 *     backgroundColor: isActive ? theme.colors.active : theme.colors.card,
 *     borderWidth: isActive ? 2 : 1,
 *   },
 * });
 *
 * export const Card = (props: CardProps) => {
 *   const theme = useTheme();
 *   const styles = useDynamicStyles(createCardStyles, theme, props);
 *   return <View style={styles.container}>...</View>;
 * };
 * ```
 */

/**
 * EXAMPLE 4: Responsive Layout
 *
 * ```tsx
 * import { useScaling, useScalingStylesOnly } from './scaling';
 *
 * const createGridStyles = (s) => ({
 *   container: {
 *     flexDirection: s.device.isTablet ? 'row' : 'column',
 *     padding: s.device.isSmallPhone ? s.mScale(8) : s.mScale(16),
 *   },
 *   item: {
 *     width: s.device.isTablet ? s.scale(200) : '100%',
 *     margin: s.mScale(8),
 *   },
 * });
 *
 * export const ProductGrid = () => {
 *   const styles = useScalingStylesOnly(createGridStyles);
 *   return <View style={styles.container}>...</View>;
 * };
 * ```
 */

// ============================================================================
// PART 9: QUICK REFERENCE GUIDE
// ============================================================================

/**
 * WHEN TO USE WHAT:
 *
 * scale(n)       → Widths, horizontal spacing, icon sizes
 * vScale(n)      → RARE! Only for hero images or fixed full-screen layouts
 * mScale(n)      → Padding, margins, border radius (MOST COMMON!)
 * font(n)        → ALL text sizes (respects accessibility)
 * touchable(n)   → Buttons, interactive elements (ensures min size)
 * textSpacing(n) → Spacing around text (grows with font size)
 * square(n)      → Avatars, circular buttons, square tiles
 * wp(n)          → Width as percentage (prefer flexbox '50%')
 * hp(n)          → Height as percentage (prefer flexbox '50%')
 *
 * STYLE HOOKS:
 *
 * useScalingStyles(factory, theme)     → Most common (with theme)
 * useScalingStylesOnly(factory)        → Without theme (simpler)
 * useDynamicStyles(factory, theme, props) → Styles depend on props
 * useInlineStyles(factory)             → Simple cases only
 * useDesignTokens()                    → Pre-scaled design system tokens
 *
 * PERFORMANCE RULES:
 *
 * ✅ DO:
 * - Define style factories OUTSIDE components
 * - Use array syntax for combining styles
 * - Use mScale() for most spacing/sizing needs
 * - Use touchable() for interactive elements
 *
 * ❌ DON'T:
 * - Create inline style factories (breaks memoization)
 * - Use vScale() for scrollable content
 * - Export staticScaling values for UI
 * - Clamp font sizes (breaks accessibility)
 */

/**
 * TESTING YOUR STYLES:
 *
 * ```tsx
 * import { createButtonStyles } from './Button.styles';
 *
 * describe('Button styles', () => {
 *   it('scales correctly', () => {
 *     const mockScaling = {
 *       scale: (n) => n * 2,
 *       mScale: (n) => n * 1.5,
 *       font: (n) => n,
 *       // ...
 *     };
 *
 *     const mockTheme = { colors: { primary: '#000' } };
 *     const styles = createButtonStyles(mockScaling, mockTheme);
 *
 *     expect(styles.base.paddingHorizontal).toBe(24); // 16 * 1.5
 *   });
 * });
 * ```
 */
