/**
 * Tonal Palette Utility
 * 
 * Generates Material Design-like tonal palettes and theme-specific color sets
 * from a single base color.
 */

export interface TonalPalette {
  0: string;
  10: string;
  20: string;
  30: string;
  40: string;
  50: string;
  60: string;
  70: string;
  80: string;
  90: string;
  95: string;
  99: string;
  100: string;
}

export interface MaterialThemeColors {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  outline: string;
  background: string;
  onBackground: string;
}

// Utility functions for color conversions
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? {
        r: parseInt(result[1]!, 16),
        g: parseInt(result[2]!, 16),
        b: parseInt(result[3]!, 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100,
  };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Generates a tonal palette (Material Design style) from a base color.
 * 
 * @param baseColor - Hex color string
 * @returns TonalPalette object with keys 0 to 100
 */
export function generateTonalPalette(baseColor: string): TonalPalette {
  const { r, g, b } = hexToRgb(baseColor);
  const { h, s } = rgbToHsl(r, g, b);
  const tones = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100] as const;

  const palette = {} as any;
  tones.forEach((tone) => {
    // In Material Design tones, the "tone" value represents the HCT/LAB Lightness.
    // Here we map it to HSL Lightness for a close approximation without heavy dependencies.
    // We also damp the saturation slightly for extreme tones to look more natural.
    const adjustedS = s * (1 - Math.abs(tone - 50) / 120); 
    const rgb = hslToRgb(h, adjustedS, tone);
    palette[tone] = rgbToHex(rgb.r, rgb.g, rgb.b);
  });

  return palette as TonalPalette;
}

/**
 * Generates theme-specific colors from a tonal palette.
 * 
 * @param tonal - The tonal palette to use
 * @param isDark - Whether to generate dark mode colors
 * @returns MaterialThemeColors object
 */
export function generateThemeColors(tonal: TonalPalette, isDark: boolean): MaterialThemeColors {
  if (isDark) {
    return {
      primary: tonal[80],
      onPrimary: tonal[20],
      primaryContainer: tonal[30],
      onPrimaryContainer: tonal[90],
      secondary: tonal[70],
      onSecondary: tonal[20],
      secondaryContainer: tonal[30],
      onSecondaryContainer: tonal[90],
      surface: tonal[10],
      onSurface: tonal[90],
      surfaceVariant: tonal[30],
      onSurfaceVariant: tonal[80],
      outline: tonal[60],
      background: tonal[10],
      onBackground: tonal[90],
    };
  }

  return {
    primary: tonal[40],
    onPrimary: tonal[100],
    primaryContainer: tonal[90],
    onPrimaryContainer: tonal[10],
    secondary: tonal[40],
    onSecondary: tonal[100],
    secondaryContainer: tonal[90],
    onSecondaryContainer: tonal[10],
    surface: tonal[99],
    onSurface: tonal[10],
    surfaceVariant: tonal[90],
    onSurfaceVariant: tonal[30],
    outline: tonal[50],
    background: tonal[99],
    onBackground: tonal[10],
  };
}
