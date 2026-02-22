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
 * ✅ Display size variations (Small/Default/Large system settings)
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

/**
 * Display size detection thresholds.
 * When device width exceeds these values, we assume "Small" or "Smallest" display size is set.
 * 
 * Typical phone widths:
 * - Default display size: 360-430dp
 * - Small display size: 430-500dp
 * - Smallest display size: 500-550dp
 */
const DISPLAY_SIZE_THRESHOLDS = {
  // If width > NORMAL_MAX, user has "Small" display size enabled
  NORMAL_MAX: 430,
  // If width > SMALL_MAX, user has "Smallest" display size enabled
  SMALL_MAX: 500,
};

/**
 * Maximum scale factors to prevent UI from becoming too large
 * when users have "Small" or "Smallest" display size settings.
 * 
 * These caps ensure:
 * - UI elements don't become comically large
 * - Cards/buttons remain proportional
 * - Layouts don't break on wide-mode devices
 */
const MAX_SCALE_FACTORS = {
  // For scale() function - affects widths, icon sizes
  SCALE: 1.15, // Max 15% larger than design width
  // For mScale() function - affects padding, margins, border radius
  MSCALE: 1.10, // Max 10% larger than design width (more conservative)
  // For square() function - affects avatars, square elements
  SQUARE: 1.12, // Max 12% larger than design width
};

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
    displaySizeMode: 'default' | 'small' | 'smallest';
    effectiveScaleX: number; // Capped scale factor actually used
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
    const smallerDimension = Math.min(width, height);

    // Detect display size mode
    let displaySizeMode: 'default' | 'small' | 'smallest' = 'default';
    if (smallerDimension > DISPLAY_SIZE_THRESHOLDS.SMALL_MAX) {
      displaySizeMode = 'smallest';
    } else if (smallerDimension > DISPLAY_SIZE_THRESHOLDS.NORMAL_MAX) {
      displaySizeMode = 'small';
    }

    // Calculate raw scale factor
    const rawScaleX = width / DESIGN_WIDTH;
    const rawScaleY = height / DESIGN_HEIGHT;

    // Core scaling functions with capping for non-default display sizes
    const scale = (size: number): number => {
      const effectiveScale = displaySizeMode === 'default' ? rawScaleX : Math.min(rawScaleX, 1 + MAX_SCALE_FACTORS.SCALE - 1);
      return PixelRatio.roundToNearestPixel(effectiveScale * size);
    };

    const vScale = (size: number): number => {
      // vScale rarely affected by display size since it's height-based
      return PixelRatio.roundToNearestPixel(rawScaleY * size);
    };

    const mScale = (size: number, factor: number = 0.5): number => {
      const effectiveScale = displaySizeMode === 'default' ? rawScaleX : Math.min(rawScaleX, 1 + MAX_SCALE_FACTORS.MSCALE - 1);
      const scaled = size + (effectiveScale * size - size) * factor;
      return PixelRatio.roundToNearestPixel(scaled);
    };

    const font = (size: number): number => {
      // Font sizes should ALWAYS respect user's font scale (accessibility)
      // But we cap the base scaling to prevent extreme size growth
      const effectiveScale = displaySizeMode === 'default' ? rawScaleX : Math.min(rawScaleX, 1 + MAX_SCALE_FACTORS.SCALE - 1);
      const scaled = effectiveScale * size;
      return PixelRatio.roundToNearestPixel(scaled * fontScale);
    };

    const touchable = (size: number, minSize: number = MIN_TOUCH_TARGET): number => {
      const effectiveScale = displaySizeMode === 'default' ? rawScaleX : Math.min(rawScaleX, 1 + MAX_SCALE_FACTORS.SCALE - 1);
      return PixelRatio.roundToNearestPixel(Math.max(effectiveScale * size, minSize));
    };

    const textSpacing = (size: number): number => {
      const effectiveScale = displaySizeMode === 'default' ? rawScaleX : Math.min(rawScaleX, 1 + MAX_SCALE_FACTORS.MSCALE - 1);
      const scaled = effectiveScale * size;
      const clampedFontScale = Math.min(fontScale, MAX_FONT_SCALE_FOR_LAYOUT);
      return PixelRatio.roundToNearestPixel(scaled * clampedFontScale);
    };

    const square = (size: number): number => {
      const baseSmaller = Math.min(DESIGN_WIDTH, DESIGN_HEIGHT);
      const rawScale = smallerDimension / baseSmaller;
      const effectiveScale = displaySizeMode === 'default' ? rawScale : Math.min(rawScale, 1 + MAX_SCALE_FACTORS.SQUARE - 1);
      return PixelRatio.roundToNearestPixel(effectiveScale * size);
    };

    const wp = (percentage: number): number => {
      return PixelRatio.roundToNearestPixel((percentage / 100) * width);
    };

    const hp = (percentage: number): number => {
      return PixelRatio.roundToNearestPixel((percentage / 100) * height);
    };

    const effectiveScaleX = displaySizeMode === 'default' ? rawScaleX : Math.min(rawScaleX, 1 + MAX_SCALE_FACTORS.SCALE - 1);

    const device = {
      width,
      height,
      isLandscape,
      isSmallPhone: smallerDimension < 375,
      isPhone: smallerDimension < 768,
      isTablet: smallerDimension >= 768,
      fontScale,
      isLargeFontScale: fontScale > 1.3,
      isExtraLargeFontScale: fontScale > 1.6,
      scaleX: rawScaleX,
      scaleY: rawScaleY,
      pixelRatio: PixelRatio.get(),
      displaySizeMode,
      effectiveScaleX,
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

// ============================================================================
// PART 6: STATIC UTILITIES (Use with extreme caution!)
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
    scale: (size: number) => PixelRatio.roundToNearestPixel((width / DESIGN_WIDTH) * size),
    vScale: (size: number) => PixelRatio.roundToNearestPixel((height / DESIGN_HEIGHT) * size),
    mScale: (size: number, factor = 0.5) => {
      const scale = (width / DESIGN_WIDTH) * size;
      return PixelRatio.roundToNearestPixel(size + (scale - size) * factor);
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
// PART 7: DISPLAY SIZE CONFIGURATION
// ============================================================================

/**
 * Configure display size thresholds and scale caps.
 * Call this at app initialization if you want different values.
 * 
 * @example
 * ```tsx
 * // In your App.tsx or index.tsx
 * import { configureDisplaySizeHandling } from './utils/scaling';
 * 
 * configureDisplaySizeHandling({
 *   normalMax: 430,
 *   smallMax: 500,
 *   maxScaleFactor: 1.15,
 *   maxMScaleFactor: 1.10,
 * });
 * ```
 */
export function configureDisplaySizeHandling(config: {
  normalMax?: number;
  smallMax?: number;
  maxScaleFactor?: number;
  maxMScaleFactor?: number;
  maxSquareFactor?: number;
}) {
  if (config.normalMax !== undefined) {
    (DISPLAY_SIZE_THRESHOLDS as any).NORMAL_MAX = config.normalMax;
  }
  if (config.smallMax !== undefined) {
    (DISPLAY_SIZE_THRESHOLDS as any).SMALL_MAX = config.smallMax;
  }
  if (config.maxScaleFactor !== undefined) {
    (MAX_SCALE_FACTORS as any).SCALE = config.maxScaleFactor;
  }
  if (config.maxMScaleFactor !== undefined) {
    (MAX_SCALE_FACTORS as any).MSCALE = config.maxMScaleFactor;
  }
  if (config.maxSquareFactor !== undefined) {
    (MAX_SCALE_FACTORS as any).SQUARE = config.maxSquareFactor;
  }
}

// ============================================================================
// PART 8: QUICK REFERENCE GUIDE
// ============================================================================

/**
 * WHAT'S NEW IN THIS VERSION:
 * 
 * ✅ Automatic detection of "Small" and "Smallest" display size settings
 * ✅ Intelligent capping of scale factors to prevent oversized UI
 * ✅ New device.displaySizeMode property ('default' | 'small' | 'smallest')
 * ✅ New device.effectiveScaleX property (shows capped scale factor)
 * ✅ Configurable thresholds via configureDisplaySizeHandling()
 * 
 * DISPLAY SIZE HANDLING:
 * 
 * - Default (360-430dp): Normal scaling, no caps applied
 * - Small (430-500dp): Scale capped at 15% above design width
 * - Smallest (>500dp): Scale capped at 15% above design width
 * 
 * This ensures UI looks good regardless of user's display size preference!
 * 
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