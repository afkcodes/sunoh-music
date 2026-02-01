/**
 * Color Accessibility Utilities
 * 
 * Logic adapted for Sunoh Design System
 */

/**
 * Calculates the relative luminance of a color.
 * @param hex - Hex color string (e.g. "#FFFFFF" or "#000")
 */
export function getLuminance(hex: string): number {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  if (!result) return 0;

  // result[0] is the full match, 1-3 are groups. Regex ensures they exist if result exists.
  let r = parseInt(result[1] as string, 16) / 255;
  let g = parseInt(result[2] as string, 16) / 255;
  let b = parseInt(result[3] as string, 16) / 255;

  const toLinear = (c: number) => 
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  r = toLinear(r);
  g = toLinear(g);
  b = toLinear(b);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculates the contrast ratio between two colors.
 * WCAG AA requires 4.5:1 for normal text.
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

/**
 * Returns either white or an almost-black semantic color based on which
 * has better contrast against the background color.
 * 
 * @param bgColor - The background color
 * @param darkText - Optional custom dark text color (default: #09090B from palette)
 * @param lightText - Optional custom light text color (default: #FFFFFF)
 */
export function getAccessibleTextColor(
  bgColor: string,
  darkText = '#09090B',
  lightText = '#FFFFFF'
): string {
  // Sunoh Logic:
  // Using a threshold of 0.32 ensures that:
  // - Primary (0.19), Danger (0.22), Success (0.31) use White text (Aesthetics preferred)
  // - Warning (0.33) uses Dark text (Accessibility required, white contrast is < 3)
  const lum = getLuminance(bgColor);
  return lum > 0.32 ? darkText : lightText;
}
